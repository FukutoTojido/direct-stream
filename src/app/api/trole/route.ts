export async function GET() {
    return new Response(process.env.NODE_ENV, {
        status: 200
    })
}