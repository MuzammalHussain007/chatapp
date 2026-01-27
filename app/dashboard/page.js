"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  
  if (status === "loading") {
    return <p className="p-8">Loading...</p>;
  }

  
  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <p className="mb-6">
          Welcome,{" "}
          <span className="font-semibold">
            {session.user.email}
          </span>
        </p>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
