import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  const { toUser, fromUser, message } = await req.json();

  if (!toUser || !fromUser || !message) {
    return Response.json(
      { success: false, message: "Invalid payload" },
      { status: 422 }
    );
  }

  const client = await clientPromise;
  const db = client.db("authentication");
  const collection = db.collection("message");

  const participants = [toUser, fromUser].sort();

  const newMessage = {
    sender: message.sender,
    text: message.text,
    messageId: uuidv4(),
    status: "Sent",
    createdAt : new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { participants },
    {
      $setOnInsert: { participants },
      $push: { message: newMessage },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  return Response.json(
    {
      success: true,
      message: "Message saved",
      data: result, // full saved document
    },
    { status: 201 }
  );
}
