"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { ChatService, type Conversation } from "@/lib/services/chat.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export default function MensajesPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login")
        }
    }, [authLoading, user, router])

    useEffect(() => {
        if (!user) return

        async function fetchConversations() {
            try {
                const data = await ChatService.getConversations()
                setConversations(data)
            } catch (e) {
                console.error("Error fetching conversations:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [user])

    // Helper to format relative time
    const formatRelativeTime = (dateString: string) => {
        const now = new Date()
        const msgDate = new Date(dateString)
        const diffMs = now.getTime() - msgDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "Ahora"
        if (diffMins < 60) return `${diffMins} min`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h`
        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays}d`
        return msgDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center pb-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-border/40 px-4 py-6">
                <h1 className="text-2xl font-black text-[#0e315d]">Mensajes</h1>
                <p className="text-sm text-muted-foreground">Tus conversaciones con profesionales</p>
            </div>

            {/* Conversations List */}
            <div className="divide-y divide-border/40">
                {loading ? (
                    // Skeleton loaders
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                            <div className="w-14 h-14 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        </div>
                    ))
                ) : conversations.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-[#0e315d] mb-2">Sin conversaciones</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Cuando contactes a un profesional o recibas mensajes, aparecerán aquí.
                        </p>
                        <Link href="/" className="mt-6 text-primary font-bold hover:underline">
                            Buscar profesionales
                        </Link>
                    </div>
                ) : (
                    // Conversations
                    conversations.map((conv, index) => {
                        const otherUser = conv.otherUser
                        const lastMessage = conv.lastMessage
                        const hasUnread = (conv.unreadCount || 0) > 0

                        return (
                            <motion.div
                                key={conv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/mensajes/${conv.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="w-14 h-14">
                                            <AvatarImage src={otherUser?.avatarUrl} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                                {otherUser?.firstName?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Unread badge */}
                                        {hasUnread && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {conv.unreadCount! > 9 ? "9+" : conv.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold truncate ${hasUnread ? "text-[#0e315d]" : "text-foreground"}`}>
                                                {otherUser?.firstName} {otherUser?.lastName}
                                            </h3>
                                            {lastMessage && (
                                                <span className={`text-xs flex-shrink-0 ml-2 ${hasUnread ? "text-primary font-bold" : "text-muted-foreground"}`}>
                                                    {formatRelativeTime(lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm truncate ${hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                            {lastMessage?.content || "Sin mensajes aún"}
                                        </p>
                                    </div>

                                    {/* Chevron */}
                                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                </Link>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
