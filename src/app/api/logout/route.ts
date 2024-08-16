import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import DiscordOauth2 from "discord-oauth2";

export async function POST(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
        return new Response(null, {
            status: 200,
        });
    }

    const oauth = new DiscordOauth2();

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
        await oauth.revokeToken(token, credentials);
        cookies().delete("access_token");
        cookies().delete("refresh_token");

        return new Response(null, {
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify(error.response), {
            status: 500,
        });
    }
}
