"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
         const token = localStorage.getItem("accessToken")

        console.log("Tokennnnnnnnnnn",token)
        if (!token) {
            router.push("/login")
            return
        }
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          setUser({ email: payload.email, userId: payload.userId })
        } catch {
          localStorage.removeItem("accessToken")
          router.push("/login")
        } finally {
          setLoading(false)
        }
    }, [router])

    const handleSignOut = () => {
         localStorage.removeItem("accessToken")
        router.push("/login")
    }

     if (loading) return <p className="p-8">Loading...</p>

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
            <div className="bg-white p-8 rounded shadow-md w-96 text-center">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p className="mb-6">Welcome, <span className="font-semibold">{user?.email}</span></p>

                <button
                    onClick={handleSignOut}
                    className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600 transition"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}
