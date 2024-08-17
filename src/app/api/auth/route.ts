import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import DiscordOauth2 from "discord-oauth2";
import { redirect } from "next/navigation";
import { request as req } from "undici";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code") ?? undefined;
    const refreshToken = cookies().get("refresh_token")?.value;

    if (!code && !refreshToken)
        redirect(
            process.env.NODE_ENV === "development"
                ? "https://discord.com/oauth2/authorize?client_id=1115953141146464276&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth&scope=identify+guilds+guilds.members.read"
                : "https://discord.com/oauth2/authorize?client_id=1115953141146464276&response_type=code&redirect_uri=https%3A%2F%2Flive.tryz.id.vn%2Fapi%2Fauth&scope=identify+guilds+guilds.members.read"
        );

    const oauth = new DiscordOauth2();

    try {
        const authSector: Record<string, string> = {
            clientId: process.env.CLIENT_ID ?? "",
            clientSecret: process.env.CLIENT_SECRET ?? "",
            redirectUri: process.env.NODE_ENV === "development" ? "http://localhost:3000/api/auth" : "https://live.tryz.id.vn/api/auth",
            scope: "identify guilds guilds.members.read",
        };

        const funcSector: Record<string, string> = refreshToken
            ? {
                  refreshToken,
                  grantType: "refresh_token",
              }
            : {
                  code: code ?? "",
                  grantType: "authorization_code",
              };

        const res = await req("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: new URLSearchParams({
                ...authSector,
                ...funcSector,
            }).toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const oauthResponse = (await res.body.json()) as {
            access_token: string,
            refresh_token: string,
            token_type: string,
            expires_in: number
        } ;

        cookies().set("access_token", oauthResponse?.access_token, {
            sameSite: "strict",
            secure: true,
        });
        cookies().set("refresh_token", oauthResponse?.refresh_token, {
            sameSite: "strict",
            secure: true,
        });

        return NextResponse.redirect(process.env.NODE_ENV === "development" ? "http://localhost:3000/" : `https://live.tryz.id.vn/`, { status: 302 });
    } catch (error: any) {
        cookies().delete("access_token");
        cookies().delete("refresh_token");

        return new Response(JSON.stringify(error.response) ?? error, {
            status: 500,
        });
    }
}
