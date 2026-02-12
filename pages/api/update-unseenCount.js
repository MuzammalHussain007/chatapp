import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId required" });
    }

    const client = await clientPromise;
    const db = client.db("authentication");
    const collection = db.collection("message");

    await collection.updateOne(
      { _id: new ObjectId(chatId) },
      {
        $set: {
          [`unseenCount.${userId}`]: 0
        }
      }
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error resetting unseen count:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
