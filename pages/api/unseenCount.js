import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const client = await clientPromise;
    const db = client.db("authentication");
    const collection = db.collection("message");

    const chats = await collection
      .find(
        { participants: userId },
        { projection: { unseenCount: 1 } }
      )
      .toArray();

    const unseenMap = {};

    chats.forEach(chat => {
      unseenMap[chat._id] = chat.unseenCount?.[userId] || 0;
    });

    return res.status(200).json(unseenMap);

  } catch (error) {
    console.error("Error fetching unseen count:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
