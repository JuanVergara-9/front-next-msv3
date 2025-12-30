import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Send, X, Clock, Check, CheckCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ChatRoomProps {
    conversationId: number | null;
    currentUserId: number;
    provider: {
        name: string;
        avatar: string;
        profession: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onMessageSent?: (content: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
    conversationId,
    currentUserId,
    provider,
    isOpen,
    onClose,
    onMessageSent
}) => {
    // Only connect if we have a conversationId and the drawer is open
    const { messages, sendMessage, isConnected, connectionError, isOtherUserOnline, reconnect } = useChat({
        conversationId: isOpen ? conversationId : null
    });

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessage(newMessage);
        onMessageSent?.(newMessage);
        setNewMessage('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40 md:hidden"
                    />

                    {/* Drawer Container */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-900 z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={provider.avatar} />
                                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {/* Online indicator - green badge */}
                                    {isOtherUserOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">{provider.name}</h3>
                                    <div className="flex items-center gap-1">
                                        {provider.profession && (
                                            <p className="text-xs text-gray-500">{provider.profession}</p>
                                        )}
                                        {isOtherUserOnline && (
                                            <>
                                                {provider.profession && <span className="text-xs text-gray-400">•</span>}
                                                <p className="text-xs text-green-600 font-medium">En línea</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Connection Status Banner */}
                        {!isConnected && (
                            <div className={`px-4 py-2 text-xs flex items-center gap-2 justify-between ${connectionError
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{connectionError ? 'Error de conexión' : 'Conectando al chat...'}</span>
                                </div>
                                {connectionError && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={reconnect}
                                        className="h-6 px-2 text-xs hover:bg-red-200 dark:hover:bg-red-800"
                                    >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Reintentar
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                            {messages.map((msg, index) => {
                                const isMyMessage = msg.senderId === currentUserId;
                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMyMessage
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 opacity-70 ${isMyMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                <span className="text-[10px]">
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                                {isMyMessage && (
                                                    <span className="flex items-center">
                                                        {/* Reloj: mensaje no enviado (pending o sending) */}
                                                        {(msg.status === 'sending' || msg.deliveryStatus === 'pending') && (
                                                            <Clock className="h-3 w-3 animate-pulse" />
                                                        )}
                                                        {/* Un tilde gris: mensaje enviado pero no recibido */}
                                                        {msg.status !== 'sending' && 
                                                         msg.deliveryStatus !== 'pending' && 
                                                         msg.deliveryStatus === 'sent' && (
                                                            <Check className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        {/* Dos tildes grises: mensaje entregado */}
                                                        {msg.status !== 'sending' && 
                                                         msg.deliveryStatus !== 'pending' && 
                                                         msg.deliveryStatus === 'delivered' && (
                                                            <CheckCheck className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        {/* Dos tildes azules: mensaje leído */}
                                                        {msg.status !== 'sending' && 
                                                         msg.deliveryStatus !== 'pending' && 
                                                         msg.deliveryStatus === 'read' && (
                                                            <CheckCheck className="h-3 w-3 text-blue-300" />
                                                        )}
                                                        {/* Error */}
                                                        {msg.status === 'error' && (
                                                            <AlertCircle className="h-3 w-3 text-red-300" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t bg-white dark:bg-gray-900">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="rounded-full bg-blue-600 hover:bg-blue-700"
                                    disabled={!newMessage.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
