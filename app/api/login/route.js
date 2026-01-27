import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";


export async function POST(req, res) {
    try {
        const { email, password } = await req.json();

        const client = await clientPromise;
        const db = client.db("authentication");
        const collection = db.collection("user");

        
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                status: 400,
                message: "Email and password are required"
            });
        }

        
        const user = await collection.findOne({ email });

        if (!user) {
            return NextResponse.json({
                success: false,
                status: 401,
                message: "Invalid email address"
            });
        }

        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({
                success: false,
                status: 401,
                message: "Incorrect password"
            });
        }

        
        // const freshToken = jwt.sign(
        //     { userId: user._id.toString(), email: user.email },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "15m" }  
        // );



        const res = NextResponse.json({
            success: true,
            status: 200,
       //     accessToken: freshToken,
            message: "Login successful"
        });


        // res.cookies.set({
        //     name: "accessToken",
        //     value: freshToken,
        //     httpOnly: true,
        //     path: "/",
        //     maxAge: 15 * 60, // 15 minutes
        //     sameSite: "strict",
        // })

        return res

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}