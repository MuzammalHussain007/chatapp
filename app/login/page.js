"use client";

import { useState ,useEffect} from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";


export default function HeartTouchingLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { status } = useSession();


  useEffect(() => {
  if (status === "authenticated") {
    router.replace("/dashboard");
  }
}, [status, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are precious, please fill them ❤️");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) setError(res.error);
    else router.replace("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-pink-500">
          Welcome Back ❤️
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <input
            type="password"
            placeholder="Your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <button
            type="submit"
            className="bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => signIn("google",{callbackUrl:"/dashboard"})}
            className="flex items-center justify-center border border-gray-300 p-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            ❤️ Login with Google
          </button>
          <button
            onClick={() => signIn("github",{callbackUrl:"/dashboard"})}
            className="flex items-center justify-center border border-gray-300 p-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            💻 Login with GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          We promise to keep your heart and data safe 💖
        </p>
      </div>
    </div>
  );
}
