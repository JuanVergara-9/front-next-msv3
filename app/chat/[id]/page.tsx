"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { useAuth } from "@/contexts/AuthContext"
import { LayoutHeader } from "@/components/LayoutHeader"

export default function ChatPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const conversationId = Number(params.id)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth/login")
        }
    }, [isLoading, user, router])

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (isNaN(conversationId)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Conversación no encontrada</h1>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <LayoutHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <ChatRoom
                        conversationId={conversationId}
                        currentUserId={Number(user.id)}
                    />
                </div>
            </main>
        </div>
    )
}
