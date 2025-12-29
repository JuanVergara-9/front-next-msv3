"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { ChatService, type Conversation } from "@/lib/services/chat.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ChevronRight, Search, Clock, CheckCheck, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Header } from "@/components/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MensajesPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

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
                setFilteredConversations(data)
            } catch (e) {
                console.error("Error fetching conversations:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [user])

    useEffect(() => {
        if (!searchQuery) {
            setFilteredConversations(conversations)
            return
        }
        const lowerQ = searchQuery.toLowerCase()
        const filtered = conversations.filter(conv =>
            conv.otherUser?.firstName?.toLowerCase().includes(lowerQ) ||
            conv.otherUser?.lastName?.toLowerCase().includes(lowerQ) ||
            conv.lastMessage?.content?.toLowerCase().includes(lowerQ)
        )
        setFilteredConversations(filtered)
    }, [searchQuery, conversations])

    // Helper to format relative time
    const formatRelativeTime = (dateString: string) => {
        const now = new Date()
        const msgDate = new Date(dateString)
        const diffMs = now.getTime() - msgDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "Ahora"
        if (diffMins < 60) return `${diffMins} min`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} h`
        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays} d`
        return msgDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">

            <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#0e315d] mb-2">Mensajes</h1>
                    <p className="text-slate-500 font-medium">Gestioná tus conversaciones con profesionales y clientes.</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Buscar conversaciones..."
                        className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Conversations List */}
                <div className="space-y-4">
                    {loading ? (
                        // Skeleton loaders
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 animate-pulse">
                                <div className="w-14 h-14 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                                </div>
                            </div>
                        ))
                    ) : filteredConversations.length === 0 ? (
                        // Empty state
                        <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageCircle className="w-12 h-12 text-slate-300" />
                            </div>
                            <h2 className="text-xl font-bold text-[#0e315d] mb-3">
                                {searchQuery ? "No se encontraron resultados" : "Sin conversaciones aún"}
                            </h2>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                                {searchQuery
                                    ? "Intenta con otros términos de búsqueda."
                                    : "Cuando contactes a un profesional o recibas una consulta, tus chats aparecerán aquí."}
                            </p>
                            {!searchQuery && (
                                <Link href="/pedidos">
                                    <Button className="bg-primary text-white rounded-xl px-8 py-6 h-auto text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                        Explorar Servicios
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        // Conversations
                        <div className="grid gap-3">
                            {filteredConversations.map((conv, index) => {
                                const otherUser = conv.otherUser
                                const lastMessage = conv.lastMessage
                                const hasUnread = (conv.unreadCount || 0) > 0
                                const isMyLastMsg = lastMessage?.senderId === Number(user?.id)

                                return (
                                    <motion.div
                                        key={conv.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link href={`/mensajes/${conv.id}`}>
                                            <div className={`
                                                group relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200
                                                hover:shadow-md hover:border-primary/20 hover:translate-x-1
                                                ${hasUnread ? "border-primary/30 shadow-primary/5 bg-primary/[0.02]" : "border-slate-100 shadow-sm"}
                                            `}>
                                                <div className="flex items-center gap-4 sm:gap-5">
                                                    {/* Avatar */}
                                                    <div className="relative flex-shrink-0">
                                                        <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                            <AvatarImage src={otherUser?.avatarUrl} />
                                                            <AvatarFallback className={`text-lg font-bold ${hasUnread ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>
                                                                {otherUser?.firstName?.charAt(0) || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {/* Unread badge */}
                                                        {hasUnread && (
                                                            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm px-1">
                                                                {conv.unreadCount! > 9 ? "9+" : conv.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 py-1">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <h3 className={`text-base sm:text-lg truncate pr-4 ${hasUnread ? "font-black text-[#0e315d]" : "font-bold text-slate-700"}`}>
                                                                {otherUser?.firstName} {otherUser?.lastName}
                                                            </h3>
                                                            {lastMessage && (
                                                                <span className={`text-xs flex-shrink-0 font-medium ${hasUnread ? "text-primary" : "text-slate-400"}`}>
                                                                    {formatRelativeTime(lastMessage.createdAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <p className={`text-sm sm:text-base truncate flex-1 ${hasUnread ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                                                                {isMyLastMsg && <span className="mr-1.5 text-slate-400 font-normal">Tú:</span>}
                                                                {lastMessage?.content || "Sin mensajes aún"}
                                                            </p>
                                                            {isMyLastMsg && (
                                                                <div className="flex-shrink-0 text-slate-400 group-hover:text-primary transition-colors">
                                                                    <Check className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Chevron */}
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
