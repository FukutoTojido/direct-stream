import { UserState, Message, SOCKET_ENUM, JoinLeaveMessage } from "@/types/types";
import { SendHorizontal, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

export default function Chat({ data }: { data: UserState }) {
    const [messages, setMessages] = useState<(Message | JoinLeaveMessage)[]>([]);
    const [userCount, setUserCount] = useState<number>(0);
    const chatRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, [messages.length]);

    const { sendJsonMessage } = useWebSocket(process.env.NODE_ENV === "development" ? "ws://localhost:7277/" : "wss://live.tryz.id.vn/ws", {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === SOCKET_ENUM.USER_STATE || type === SOCKET_ENUM.NEW_MESSAGE) {
                setMessages([...messages, payload]);
                return;
            }

            if (type === SOCKET_ENUM.UPDATE_USERCOUNT) {
                setUserCount(payload);
                return;
            }
        },
    });

    const sendMessage = () => {
        const chatContent = chatRef.current?.textContent?.trim() ?? "";
        if (chatContent === "") return;

        sendJsonMessage({
            type: SOCKET_ENUM.NEW_MESSAGE,
            payload: {
                username: data?.username,
                global_name: data?.global_name,
                avatar: data?.avatar,
                id: data?.id,
                time: Date.now(),
                content: chatContent,
                isGuildAvatar: data?.isGuildAvatar,
            },
        });

        chatRef.current!.innerHTML = "";
    };

    useEffect(() => {
        const chatElement = chatRef.current;

        const handleInput = (event: KeyboardEvent) => {
            if (!chatElement) return;

            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
                chatElement.innerHTML = "";
            }
        };

        chatElement?.addEventListener("keydown", handleInput);

        return () => chatElement?.removeEventListener("keydown", handleInput);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!data) return;

        sendJsonMessage?.({
            type: SOCKET_ENUM.NEW_USER,
            payload: data,
        });
    }, [sendJsonMessage, data]);

    return (
        <div className="bg-[#363753] lg:rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="p-5 w-full text-bold flex gap-5">
                <Users />
                {userCount}
            </div>
            <div className="flex-1 w-full p-5 bg-[#2B2C43] flex flex-col gap-5 overflow-y-auto" ref={containerRef}>
                {messages.map((message, idx) => {
                    if ((message as Message).content) {
                        const mes = message as Message;
                        return (
                            <div key={idx} className="flex gap-2.5 items-start">
                                <Image
                                    src={
                                        mes!.isGuildAvatar
                                            ? `https://cdn.discordapp.com/guilds/228205151981273088/users/${mes.id}/avatars/${mes.avatar}.webp`
                                            : `https://cdn.discordapp.com/avatars/${mes.id}/${mes.avatar}.webp`
                                    }
                                    alt=""
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                />
                                <div className="break-words overflow-x-hidden">
                                    <span className="font-bold pr-2.5">{mes.global_name}</span>
                                    <span className="">{mes.content}</span>
                                </div>
                            </div>
                        );
                    }

                    if ((message as JoinLeaveMessage).state) {
                        const mes = message as JoinLeaveMessage;
                        return (
                            <div key={idx} className="flex gap-2.5 items-start">
                                <div className="break-words overflow-x-hidden text-sm text-gray-400">{mes.username} has joined the chat.</div>
                            </div>
                        );
                    }
                })}
            </div>
            <div className="flex w-full gap-5 items-center p-5">
                <div className="flex-1 text-base focus:outline-none chatInput break-words overflow-hidden" contentEditable ref={chatRef}></div>
                <div className="h-full border-r-2 border-[#75779F]"></div>
                <button onClick={() => sendMessage()}>
                    <SendHorizontal />
                </button>
            </div>
        </div>
    );
}
