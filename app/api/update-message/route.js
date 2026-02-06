import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
    try {
        const body = await req.json();
        const { chatId, messageId, status } = body;

        const client = await clientPromise;
        const db = client.db("authentication");
        const collection = db.collection("message");

        if (!chatId || !messageId || !status) {
            return new Response(JSON.stringify({ message: "chatId, messageId, status required" }), { status: 400 });
        }


        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(chatId.toString()), "message.messageId": messageId.trim() },
            { $set: { "message.$.status": status } },
            { returnDocument: "after" }
        );

        if (!result) {
            return new Response(JSON.stringify({ message: "Message not found" }), { status: 404 });
        }

        console.log(`💾 Message ${messageId} in chat ${chatId} status updated to ${status}`);

        return new Response(JSON.stringify({ message: "Status updated", updatedChat: result.value }), { status: 200 });
    } catch (error) {
        console.error("❌ Error updating message status:", error);
        return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), { status: 500 });
    } 
}
