import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '@/lib/services/auth.service';
import { SOCKET_URL } from '@/lib/apiClient';

export interface Message {
    id?: number;
    conversationId: number;
    senderId: number;
    content: string;
    isRead: boolean;
    createdAt?: string;
    updatedAt?: string;
    status?: 'sending' | 'sent' | 'error'; // Estado local del frontend (sending mientras se envía)
    deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'read'; // Estado de entrega del backend
}

interface UseChatProps {
    conversationId: number | null;
}

export const useChat = ({ conversationId }: UseChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);
    const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
    const [otherUserId, setOtherUserId] = useState<number | null>(null);

    // Reset state when conversation changes
    useEffect(() => {
        setRetryCount(0);
        setConnectionError(null);
        setMessages([]);
        setIsOtherUserOnline(false);
        setOtherUserId(null);
    }, [conversationId]);

    // Load initial messages and determine other user ID
    useEffect(() => {
        if (!conversationId) return;

        const loadMessages = async () => {
            try {
                const { apiClient } = await import('@/lib/apiClient');
                // Fetch conversation details to get other user ID
                const convResponse = await apiClient.get(`/api/v1/chat/conversations`);
                const currentConv = convResponse.data.find((c: any) => c.id === conversationId);

                if (currentConv && currentConv.otherUser) {
                    setOtherUserId(currentConv.otherUser.id);
                }

                const response = await apiClient.get(`/api/v1/chat/conversations/${conversationId}/messages`);
                const data = response.data.data || response.data;
                setMessages(data.reverse().map((m: any) => ({ 
                    ...m, 
                    status: 'sent' as const,
                    deliveryStatus: m.deliveryStatus || 'sent'
                })));
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessages();
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        const token = AuthService.getAccessToken();
        if (!token) {
            console.error('No access token found for chat connection');
            setConnectionError('Error de conexión');
            return;
        }

        const socketUrl = SOCKET_URL;

        // Initialize Socket
        const socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
            setConnectionError(null);
            socket.emit('join_room', conversationId);

            // Check initial status if we know the other user ID
            if (otherUserId) {
                socket.emit('check_user_status', otherUserId, (response: { isOnline: boolean }) => {
                    setIsOtherUserOnline(response.isOnline);
                });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                socket.connect();
            }
        });

        socket.on('connect_error', async (err) => {
            console.error('Socket connection error:', err);
            setIsConnected(false);
            const errorMessage = err.message || 'Unknown error';
            const isAuthError = errorMessage.toLowerCase().includes('token') ||
                errorMessage.toLowerCase().includes('auth') ||
                errorMessage.toLowerCase().includes('jwt');

            if (isAuthError) {
                if (retryCount < 1) {
                    console.log('Auth error detected, attempting to refresh token...');
                    try {
                        await AuthService.refreshToken();
                        console.log('Token refreshed, retrying connection...');
                        setRetryCount(prev => prev + 1);
                        return;
                    } catch (refreshErr) {
                        console.error('Failed to refresh token:', refreshErr);
                        setConnectionError('Error de conexión');
                    }
                } else {
                    setConnectionError('Error de conexión');
                }
            } else {
                setConnectionError('Error de conexión');
            }
        });

        socket.on('joined_room', (data) => {
            console.log('Joined room:', data);
        });

        socket.on('receive_message', (message: Message) => {
            console.log('Received message:', message);
            if (message.conversationId === conversationId) {
                setMessages((prev) => {
                    const currentUser = AuthService.getCurrentUser();
                    const existingIndex = prev.findIndex(m =>
                        m.status === 'sending' &&
                        m.content === message.content &&
                        m.senderId === message.senderId
                    );

                    if (existingIndex !== -1) {
                        const newMessages = [...prev];
                        newMessages[existingIndex] = { 
                            ...message, 
                            status: 'sent',
                            deliveryStatus: message.deliveryStatus || 'sent'
                        };
                        return newMessages;
                    }

                    // Si es un mensaje recibido del otro usuario, marcar como entregado automáticamente
                    const isFromOtherUser = currentUser && message.senderId !== currentUser.id;
                    const finalMessage = {
                        ...message, 
                        status: 'sent' as const,
                        deliveryStatus: message.deliveryStatus || 'sent'
                    };

                    // Si recibimos un mensaje del otro usuario y estamos en la sala, marcar como entregado
                    if (isFromOtherUser && socketRef.current && message.id) {
                        socketRef.current.emit('mark_message_as_delivered', message.id);
                    }

                    return [...prev, finalMessage];
                });
            }
        });

        // Escuchar actualizaciones de estado de mensajes
        socket.on('message_status_update', (update: { messageId: number; deliveryStatus: 'delivered' | 'read' }) => {
            setMessages((prev) => {
                return prev.map((msg) => {
                    if (msg.id === update.messageId) {
                        return { ...msg, deliveryStatus: update.deliveryStatus };
                    }
                    return msg;
                });
            });
        });

        // Listen for status updates
        socket.on('user_connected', (data: { userId: number }) => {
            if (otherUserId && data.userId === otherUserId) {
                setIsOtherUserOnline(true);
            }
        });

        socket.on('user_disconnected', (data: { userId: number }) => {
            if (otherUserId && data.userId === otherUserId) {
                setIsOtherUserOnline(false);
            }
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Cleanup
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [conversationId, retryCount, otherUserId]);

    const sendMessage = useCallback((content: string) => {
        if (!conversationId) return;

        const tempId = Date.now();
        const currentUser = AuthService.getCurrentUser();

        if (!currentUser) return;

        const optimisticMessage: Message = {
            id: tempId,
            conversationId,
            senderId: currentUser.id,
            content,
            isRead: false,
            createdAt: new Date().toISOString(),
            status: isConnected ? 'sending' : 'error',
            deliveryStatus: 'pending' // Estado inicial mientras se envía
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        if (socketRef.current && isConnected) {
            socketRef.current.emit('send_message', {
                conversationId,
                content
            });
        } else {
            console.warn('Socket not connected, message marked as error');
        }
    }, [conversationId, isConnected]);

    // Marcar mensajes como leídos cuando el usuario está viendo la conversación
    useEffect(() => {
        if (!conversationId || !socketRef.current || !isConnected) return;

        // Marcar mensajes recibidos como leídos cuando se abre la conversación
        const markMessagesAsRead = async () => {
            try {
                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) return;

                const { apiClient } = await import('@/lib/apiClient');
                await apiClient.post(`/api/v1/chat/conversations/${conversationId}/mark-as-read`);
                
                // También emitir evento de socket para actualizar estados en tiempo real
                const unreadMessages = messages.filter(
                    m => m.senderId !== currentUser.id && m.deliveryStatus !== 'read'
                );
                unreadMessages.forEach(msg => {
                    if (msg.id && socketRef.current) {
                        socketRef.current.emit('mark_message_as_read', msg.id);
                    }
                });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        };

        markMessagesAsRead();
    }, [conversationId, isConnected, messages]);

    const reconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setConnectionError(null);
        setIsConnected(false);
        // Trigger reconnection by updating retryCount
        setRetryCount(prev => prev + 1);
    }, []);

    return {
        messages,
        setMessages,
        sendMessage,
        isConnected,
        connectionError,
        isOtherUserOnline,
        reconnect
    };
};
