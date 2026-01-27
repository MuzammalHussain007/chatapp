"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success !== true) {
                setError(data.message || "Login failed. Please try again.");
                return;
            } else {
                localStorage.setItem("accessToken", data.accessToken);
                router.push("/dashboard");
            }



        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        }
    };

    return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
  <div className="bg-white p-8 rounded shadow-md w-96 flex flex-col items-center">
    {/* Login Form */}
    <form onSubmit={handleLogin} className="w-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
      >
        Login
      </button>
    </form>

    {/* Divider */}
    <div className="my-6 w-full border-t border-gray-300"></div>

    {/* Social Logins */}
    <div className="flex flex-col gap-4 w-full items-center">
      <h1 className="text-xl font-bold">Social Media Logins</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Login with Google
      </button>

      <button
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
      >
        Login with GitHub
      </button>
    </div>
  </div>
</div>
    );
}