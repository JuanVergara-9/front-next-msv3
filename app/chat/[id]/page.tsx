"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function ChatPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const conversationId = params.id

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth/login")
            return
        }
        
        if (conversationId && !isNaN(Number(conversationId))) {
            router.replace(`/mensajes/${conversationId}`)
        }
    }, [isLoading, user, router, conversationId])

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
}
