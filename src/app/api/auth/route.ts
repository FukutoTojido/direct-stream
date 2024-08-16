import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import DiscordOauth2 from "discord-oauth2";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code") ?? undefined;
    const refreshToken = cookies().get("refresh_token")?.value;

    if (!code && !refreshToken)
        redirect(
            "https://discord.com/oauth2/authorize?client_id=1115953141146464276&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth&scope=identify+guilds+guilds.members.read"
        );

    const oauth = new DiscordOauth2();

    try {
        const oauthResponse = refreshToken
            ? await oauth.tokenRequest({
                  clientId: process.env.CLIENT_ID,
                  clientSecret: process.env.CLIENT_SECRET,
                  redirectUri: "http://localhost:3000/api/auth",
                  refreshToken,
                  grantType: "refresh_token",
                  scope: "identify guilds guilds.members.read",
              })
            : await oauth.tokenRequest({
                  clientId: process.env.CLIENT_ID,
                  clientSecret: process.env.CLIENT_SECRET,
                  redirectUri: "http://localhost:3000/api/auth",
                  code,
                  scope: "identify guilds guilds.members.read",
                  grantType: "authorization_code",
              });

        cookies().set("access_token", oauthResponse.access_token, {
            sameSite: "strict",
            secure: true,
        });
        cookies().set("refresh_token", oauthResponse.refresh_token, {
            sameSite: "strict",
            secure: true,
        });

        return NextResponse.redirect(`${request.nextUrl.origin}/`, { status: 302 });
    } catch (error: any) {
        cookies().delete("access_token");
        cookies().delete("refresh_token");

        return new Response(error.response ?? error, {
            status: 500,
        });
    }
}
