"use client";

import useAuth from "@/hooks/useAuth";
import { useRef, useState, useEffect } from "react";
import { SrsRtcWhipWhepAsync } from "@/lib/SRS";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import Chat from "./components/Chat";

function ErrorContainer({ error }: { error?: string }) {
    return !error || error === "" || error === "{}" ? (
        ""
    ) : (
        <div className="absolute bottom-10 p-5 rounded-xl left-0 right-0 mx-auto bg-red-500 text-white font-bold w-full break-words overflow-hidden">
            {error}
        </div>
    );
}

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>();
    const [sdk, setSdk] = useState<any>();
    const userData = useAuth({ setError });

    useEffect(() => {
        sdk?.close();

        if (!videoRef.current || !userData) return;

        const videoUrl = "https://live.tryz.id.vn:8443/rtc/v1/whep/?app=live&stream=livestream";

        const initPlayer = async () => {
            const player = SrsRtcWhipWhepAsync();
            videoRef.current!.srcObject = player.stream;

            setSdk(player);

            try {
                await player.play(videoUrl);
            } catch (e) {
                player?.close();
                console.error(e);
            }
        };

        initPlayer();

        return () => {
            sdk?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);

    if (userData === undefined) {
        return (
            <div className="w-screen h-dvh flex flex-col p-5 gap-5 items-center justify-center loading relative">
                <ErrorContainer error={error} />
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="90px" height="90px">
                    <circle cx="45" cy="45" r="30" strokeLinecap="round" />
                </svg>
                Please wait...
            </div>
        );
    }

    if (userData === null) {
        return (
            <div className="w-screen h-dvh flex p-5 gap-5 items-center justify-center relative">
                <ErrorContainer error={error} />
                <div className="relative w-[800px] flex p-10 gap-8 bg-[#363753] rounded-xl items-center lg:flex-row flex-col">
                    <Image src="/RI.png" alt="" width={200} height={200} className="rounded-full" />
                    <div className="flex flex-col gap-5 flex-1">
                        <div className="flex flex-col lg:text-left text-center">
                            <div className="text-3xl font-bold">rinimi.dev</div>
                            <div className="text-lg font-light italic">Bông Rinami là số một</div>
                        </div>
                        <Link
                            href="/api/auth"
                            className=" p-5 w-full rounded-xl bg-[#2B2C43] flex gap-5 items-center hover:bg-[#75779F] transition-all"
                        >
                            <Image src="/discord-mark-white.svg" alt="" width={40} height={40} />
                            <div className="font-bold">Đăng nhập</div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData.isJoinedServer) {
        return (
            <div className="w-screen h-dvh flex p-5 gap-5 items-center justify-center relative">
                <ErrorContainer error={error} />
                <div className="relative w-[800px] flex p-10 gap-8 bg-[#363753] rounded-xl items-center lg:flex-row flex-col">
                    <Image src="/RI.png" alt="" width={200} height={200} className="rounded-full" />
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col">
                            <div className="text-3xl font-bold">Alert!</div>
                            <div className="text-lg font-light italic">Bạn cần phải ở trong server THE iDOLM@STER Vietnam để được xem</div>
                        </div>
                        <button
                            className="p-5 w-full rounded-xl bg-[#D25A5A] flex gap-5 items-center hover:bg-[#F03636] transition-all"
                            onClick={async () => {
                                try {
                                    const res = await fetch("/api/logout", {
                                        method: "POST",
                                    });

                                    if (!res.ok) {
                                        const reason = await res.text();
                                        throw new Error(reason);
                                    }

                                    window.location.reload();
                                } catch (error) {
                                    console.error(error);
                                }
                            }}
                        >
                            <LogOut size={40} />
                            <div className="font-bold">Đăng xuất</div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex lg:p-5 lg:gap-5 flex-col lg:flex-row">
            <video controls autoPlay muted ref={videoRef} className="lg:flex-1 bg-[#363753] lg:rounded-xl lg:w-0 w-full"></video>
            <div className="lg:h-full lg:w-[400px] flex lg:flex-col flex-col-reverse lg:gap-5 flex-1 lg:flex-none overflow-hidden">
                <Chat data={userData} />
                <div className="bg-[#363753] lg:rounded-xl p-5 flex gap-5 items-center">
                    {userData.avatar === "" ? (
                        <div className="bg-black/50 rounded-full"></div>
                    ) : (
                        <Image
                            src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    )}
                    <div className="truncate flex-1 flex flex-col">
                        <div className="text-lg font-bold">{userData.global_name}</div>
                        <div className="text-sm font-light ">{userData.username}</div>
                    </div>
                    <button
                        className="rounded-xl text-white hover:text-[#D25A5A] transition-all"
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/logout", {
                                    method: "POST",
                                });

                                if (!res.ok) {
                                    const reason = await res.text();
                                    throw new Error(reason);
                                }

                                window.location.reload();
                            } catch (error) {
                                console.error(error);
                            }
                        }}
                    >
                        <LogOut size={30} />
                    </button>
                </div>
            </div>
        </div>
    );
}
