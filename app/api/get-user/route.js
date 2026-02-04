import clientPromise from "@/lib/mongodb"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { sendJsonResponse } from '@/utils/responseHelper';

import { authOptions } from "@/app/api/auth/[...nextauth]/route";



export async function GET() {



    try {

        const client = await clientPromise;
        const db = client.db("authentication");
        const collection = db.collection("user");
        const session = await getServerSession(authOptions);

        if (!session || !session.user.email) {
            return sendJsonResponse({
                success: false,
                status: 502,
                message: "Unauthorized User"
            })
        }

        const users = await collection.find({}).toArray()
        const filterUserList = users.filter(
            user => user.email !== session.user.email
        )

        if (filterUserList.length > 0) {
            return sendJsonResponse({
                success: true,
                status: 201,
                data: filterUserList
            })
        } else {
            return sendJsonResponse({
                success: true,
                status: 201,
                data: filterUserList
            })
        }

    } catch (error) {

        return sendJsonResponse({
            success: false,
            status: 400,
            message: error.message
        })
    }











}