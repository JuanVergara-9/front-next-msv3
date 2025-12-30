"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useChat, type Message } from "@/hooks/use-chat"
import { ChatService, type Conversation } from "@/lib/services/chat.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Clock, Check, CheckCheck, AlertCircle, RefreshCw } from "lucide-react"

export default function ChatConversationPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const conversationId = Number(params.id)

    const [otherUser, setOtherUser] = useState<{ firstName: string; lastName: string; avatarUrl?: string } | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, sendMessage, isConnected, connectionError, isOtherUserOnline, reconnect } = useChat({
        conversationId: !authLoading && user ? conversationId : null
    })

    // Fetch conversation details to get other user info
    useEffect(() => {
        if (!user) return

        async function fetchConversationDetails() {
            try {
                const convs = await ChatService.getConversations()
                const currentConv = convs.find((c) => c.id === conversationId)
                if (currentConv?.otherUser) {
                    setOtherUser(currentConv.otherUser)
                }
            } catch (e) {
                console.error("Error fetching conversation details:", e)
            }
        }

        fetchConversationDetails()
    }, [user, conversationId])

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login")
        }
    }, [authLoading, user, router])

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return
        sendMessage(newMessage)
        setNewMessage("")
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (isNaN(conversationId)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
                <h1 className="text-xl font-bold text-[#0e315d] mb-4">Conversación no encontrada</h1>
                <Link href="/mensajes" className="text-primary font-bold hover:underline">
                    Volver a Mensajes
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-border/40 px-4 py-3 flex items-center gap-3">
                <Link href="/mensajes" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[#0e315d]" />
                </Link>
                <div className="relative">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser?.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {otherUser?.firstName?.charAt(0) || "?"}
                        </AvatarFallback>
                    </Avatar>
                    {isOtherUserOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-[#0e315d] truncate">
                        {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Cargando..."}
                    </h2>
                    {isOtherUserOnline && <p className="text-xs text-green-600 font-medium">En línea</p>}
                </div>
            </div>

            {/* Connection Status Banner */}
            {!isConnected && (
                <div className={`px-4 py-2 text-xs flex items-center gap-2 justify-between ${connectionError
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>{connectionError ? "Error de conexión" : "Conectando..."}</span>
                    </div>
                    {connectionError && (
                        <Button variant="ghost" size="sm" onClick={reconnect} className="h-6 px-2 text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reintentar
                        </Button>
                    )}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 pb-24">
                {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === Number(user.id)
                    return (
                        <div key={msg.id || index} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMyMessage
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-white text-foreground rounded-bl-none border border-border/40"
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMyMessage ? "text-white/70" : "text-muted-foreground"}`}>
                                    <span className="text-[10px]">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                    </span>
                                    {isMyMessage && (
                                        <span className="flex items-center">
                                            {(msg.status === "sending" || msg.deliveryStatus === "pending") && (
                                                <Clock className="h-3 w-3 animate-pulse" />
                                            )}
                                            {msg.status !== "sending" && msg.deliveryStatus === "sent" && (
                                                <Check className="h-3 w-3" />
                                            )}
                                            {msg.status !== "sending" && msg.deliveryStatus === "delivered" && (
                                                <CheckCheck className="h-3 w-3" />
                                            )}
                                            {msg.status !== "sending" && msg.deliveryStatus === "read" && (
                                                <CheckCheck className="h-3 w-3 text-blue-300" />
                                            )}
                                            {msg.status === "error" && (
                                                <AlertCircle className="h-3 w-3 text-red-300" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-border/40">
                <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-3 border border-border/40 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full bg-primary hover:bg-primary/90 h-12 w-12"
                        disabled={!newMessage.trim()}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
