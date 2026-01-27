import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"



export async function POST(req) {
    const { email, password } = await req.json()


    const client = await clientPromise;
    const db = client.db("authentication");
    const collection = db.collection("user");



    const exists = await collection.findOne({ email: email })

    if (exists) {
        return NextResponse.json({
            success: false,
            status: 400,
            message: "User already exists"
        })
    }

    const hashpasword = await bcrypt.hash(password, 10)

    const result = await collection.insertOne({
        email: email,
        password: hashpasword,
        createdAt: new Date()
    })

    const accessToken = jwt.sign(
        {
            userId: result.insertedId.toString(),
            email
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    )

    return NextResponse.json({
        success: true,
        status: 201,
        token: accessToken,
        message: "User Created Successfully"

    })



}