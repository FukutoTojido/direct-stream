import { UserState } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DiscordOauth2 from "discord-oauth2";
import { getCookie } from "cookies-next";

export default function useAuth({ setError }: { setError: Dispatch<SetStateAction<string | undefined>> }) {
    const [state, setState] = useState<UserState>();
    const [accessToken] = [getCookie("access_token")];

    useEffect(() => {
        const getData = async () => {
            if (!accessToken) {
                setState(null);
                return;
            }

            try {
                const oauth = new DiscordOauth2();

                const { username, avatar, id, global_name } = await oauth.getUser(accessToken);
                const userGuilds = await oauth.getUserGuilds(accessToken);
                const isJoinedServer = userGuilds.some((server) => server.id === "228205151981273088");

                setState({
                    username,
                    global_name: global_name ?? username,
                    avatar: avatar ?? "",
                    id,
                    isJoinedServer,
                });
            } catch (error) {
                setError(JSON.stringify(error));
                setState(null);
            }
        };

        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}
