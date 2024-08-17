export type UserState = null | {
    username: string;
    global_name: string;
    avatar: string;
    id: string;
    isJoinedServer: boolean;
};

export type Message = {
    username: string;
    global_name: string;
    avatar: string;
    id: string;
    time: number;
    content: string;
};

export enum SOCKET_ENUM {
    NEW_MESSAGE = "NEW_MESSAGE",
    UPDATE_USERCOUNT = "UPDATE_USERCOUNT",
}
