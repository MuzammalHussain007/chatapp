import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("authentication");
        const collection = db.collection("user");

        const user = await collection.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          _id: user._id.toString(),
          email: user.email,
          name : user.name,
          image : user.picture
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const client = await clientPromise;
      const db = client.db("authentication");
      const collection = db.collection("user");
      const existingUser = await collection.findOne({ email: user.email });
      if (!existingUser) {
        // Create new user
        await collection.insertOne({
          email: user.email,
          name: user.name || profile.name || "",
          provider: account.provider,
          createdAt: new Date(),
        });
      }

      return true; // allow sign-in
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id.toString();
        token.name = user.name;
        token.picture = user.image;
        token.accessToken = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );
      }
      return token;
    },

    async session({ session, token }) {
      session.user._id = token._id;
      session.user.name = token.name;
      session.user.picture = token.picture;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
