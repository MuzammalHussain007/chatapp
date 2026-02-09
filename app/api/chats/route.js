import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { sendJsonResponse } from "@/utils/responseHelper";

export async function GET(req) {
  const client = await clientPromise;
  const db = client.db("authentication");
  const collection = db.collection("message");

  try {
    const { searchParams } = new URL(req.url);
    const user1 = searchParams.get("user1");
    const user2 = searchParams.get("user2");

    if (!user1 || !user2) {
      return sendJsonResponse({
        success: false,
        status: 400,
        message: "user not found",
      });
    }

    // Find the conversation
    const conversation = await collection.findOne({
      participants: { $all: [user1, user2] },
    });

    if (!conversation) {
      return sendJsonResponse({
        success: true,
        status: 200,
        data: {
          _id: null,
          participants: [user1, user2],
          messages: [],
          unseenCount: {},
        },
      });
    }

    // Destructure the fields you want
    const { _id, participants, message = [], unseenCount = {} } = conversation;

    return sendJsonResponse({
      success: true,
      status: 200,
      data: {
        _id,
        participants,
        messages: message, // list of messages
        unseenCount, // unseenCount object
      },
    });
  } catch (error) {
    return sendJsonResponse({
      success: false,
      status: 500,
      message: error.message,
    });
  }
}
