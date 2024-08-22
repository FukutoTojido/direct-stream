import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
	const { uid, sdp } = await request.json();

	const authRes = await fetch(
		`${process.env.AUTH_ENDPOINT}/discordapi/checkUserId/${uid}`,
	);
	if (!authRes.ok) {
		return new Response("Unauthorized", {
			status: 401,
		});
	}

	if (!process.env.STREAM_ENDPOINT) {
		console.error("No STREAM_ENDPOINT has been given on the server");
		return new Response("No STREAM_ENDPOINT has been given on the server", {
			status: 500,
		});
	}

	try {
		const res = await fetch(process.env.STREAM_ENDPOINT, {
			method: "POST",
			body: sdp,
			headers: {
				"Content-type": "application/sdp",
			},
		});

		if (!res.ok) {
			throw "An error has occurred on the server-side";
		}

		const data = await res.text();
		return new Response(data, {
			status: 200,
		});
	} catch (e) {
		console.log(e);
		return new Response(e as string, {
			status: 500,
		});
	}
}
