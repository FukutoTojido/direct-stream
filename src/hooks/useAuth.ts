import { UserState } from "@/types/types";
import { useEffect, useState } from "react";
import DiscordOauth2 from "@/lib/discord-oauth2";
import { getCookie } from "cookies-next";

export default function useAuth() {
    const [state, setState] = useState<UserState>();
    const [accessToken] = [getCookie("access_token")];

    useEffect(() => {
        const getData = async () => {
            if (!accessToken) {
                setState(null);
                return;
            }

            try {
                const oauth = new DiscordOauth2({
                    ratelimiterOffset: 1000,
                });

                const { username, avatar, id, global_name } = await oauth.getUser(accessToken);

                let [nick, guildAvatar]: [nick?: string | null, guildAvatar?: string | null] = [null, null];
                let isJoinedServer = false;

                try {
                    const { nick: nick_, avatar: guildAvatar_ } = await oauth.getGuildMember(accessToken, "228205151981273088");
                    nick = nick_;
                    guildAvatar = guildAvatar_;
                    isJoinedServer = true;
                } catch {
                    isJoinedServer = false;
                }

                setState({
                    username,
                    global_name: nick ?? global_name ?? username,
                    avatar: guildAvatar ?? avatar ?? "",
                    id,
                    isJoinedServer,
                    isGuildAvatar: guildAvatar ? true : false,
                });
            } catch (error) {
                console.log(error);
                setState(null);
            }
        };

        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}
