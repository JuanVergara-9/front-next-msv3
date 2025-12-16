import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { AuthService } from '@/lib/services/auth.service';

export function useUnreadCount() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const response = await apiClient.get('/api/v1/chat/unread');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Connect to socket for real-time updates
        const token = AuthService.getAccessToken();
        if (!token) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4003';
        const { io } = require('socket.io-client');
        const socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('useUnreadCount socket connected');
        });

        // When a new message arrives, refresh the full count from the server
        socket.on('new_message_notification', (message: any) => {
            console.log('New message notification received, refreshing unread count');
            fetchUnreadCount();
        });

        // When message status changes (e.g., marked as read), refresh count
        socket.on('message_status_update', (update: any) => {
            console.log('Message status update received, refreshing unread count');
            fetchUnreadCount();
        });

        // Poll every 60 seconds as fallback
        const interval = setInterval(fetchUnreadCount, 60000);

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, [user]);

    return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
