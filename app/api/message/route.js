import clientPromise from "@/lib/mongodb"
import { sendJsonResponse } from '@/utils/responseHelper';
 

export async function POST(req) {
  // 1. Destructure the incoming data
  const { toUser, fromUser, message } = await req.json()

  const client = await clientPromise;
  const db = client.db("authentication");
  const collection = db.collection("message");

  if (!toUser || !fromUser || !message) {
    return Response.json(
      { success: false, message: "Invalid payload" },
      { status: 422 }
    )
  }

   
  const participants = [toUser, fromUser].sort();

  await collection.updateOne(
    {
     
      participants: participants 
    },
    {
      $setOnInsert: {
        participants: participants
      },
      $push: {
        message: {
          sender: message.sender,
    
          text: message.text, 
          createdAt: new Date()
        }
      }
    },
    {
      upsert: true
    }
  )

  return Response.json(
    { success: true, message: "Message saved" },
    { status: 201 }
  )
}



