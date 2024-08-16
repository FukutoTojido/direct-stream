import { UserState, Message, SOCKET_ENUM } from "@/types/types";
import { SendHorizontal } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

export default function Chat({ data }: { data: UserState }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const chatRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, [messages.length]);

    const { sendJsonMessage } = useWebSocket("wss://live.tryz.id.vn/ws", {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const { type, payload } = JSON.parse(event.data);
            if (type !== SOCKET_ENUM.NEW_MESSAGE) return;

            setMessages([...messages, payload]);
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
            },
        });
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
    }, []);

    return (
        <div className="bg-[#363753] rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 w-full p-5 bg-[#2B2C43] flex flex-col gap-5 overflow-y-auto" ref={containerRef}>
                {messages.map((message, idx) => {
                    return (
                        <div key={idx} className="flex gap-2.5 items-start">
                            <Image
                                src={`https://cdn.discordapp.com/avatars/${message?.id}/${message?.avatar}.png`}
                                alt=""
                                width={30}
                                height={30}
                                className="rounded-full"
                            />
                            <div className="break-all">
                                <span className="font-bold pr-2.5">{message.global_name}</span>
                                <span>{message.content}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex w-full gap-5 items-center p-5">
                <div className="flex-1 text-base focus:outline-none chatInput break-all" contentEditable ref={chatRef}></div>
                <div className="h-full border-r-2 border-[#75779F]"></div>
                <button onClick={() => sendMessage()}>
                    <SendHorizontal />
                </button>
            </div>
        </div>
    );
}
