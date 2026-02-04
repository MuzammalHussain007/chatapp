export const runtime = "nodejs";

import clientPromise from "@/lib/mongodb";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, name, provider } = body;

        if (!email || !provider) {
            return new Response(JSON.stringify({ error: "Missing email or provider" }), {
                status: 400,
            });
        }

        const client = await clientPromise;
        const db = client.db("authentication");
        const collection = db.collection("user");

        // Check if user already exists
        let user = await collection.findOne({ email });

        if (!user) {
            // Create new social user
            const result = await collection.insertOne({
                email,
                name: name || "",
                provider,
                createdAt: new Date(),
            });
            user = { _id: result.insertedId, email, name, provider };
        }

        return new Response({
            success: true,
            status: 201,
            message: "User Register Successfully"
        });
    } catch (err) {
        console.error(err);
        return new Response(
            {
                success: false,
                status: 401,
                message: err.message
            }
        );
    }
}
