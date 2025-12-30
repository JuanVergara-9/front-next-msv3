"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, SOCKET_URL } from '@/lib/apiClient';
import { AuthService } from '@/lib/services/auth.service';

interface UnreadCountContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
}

const UnreadCountContext = createContext<UnreadCountContextType | undefined>(undefined);

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastFetchTimeRef = useRef(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (isFetchingRef.current || timeSinceLastFetch < 2000) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    lastFetchTimeRef.current = now;

    try {
      const response = await apiClient.get('/api/v1/chat/unread');
      setUnreadCount(response.data.count || 0);
      errorCountRef.current = 0;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      errorCountRef.current += 1;
      
      if (errorCountRef.current >= 3) {
        console.warn('Multiple errors fetching unread count, stopping polling temporarily');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(() => {
          errorCountRef.current = 0;
        }, 30000);
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    fetchUnreadCount();

    const token = AuthService.getAccessToken();
    if (!token) return;

    const socketUrl = SOCKET_URL;
    
    try {
      const { io } = require('socket.io-client');
      const socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('UnreadCount socket connected');
        errorCountRef.current = 0;
      });

      socket.on('disconnect', () => {
        console.log('UnreadCount socket disconnected');
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
      });

      socket.on('new_message_notification', () => {
        fetchUnreadCount();
      });

      socket.on('message_status_update', () => {
        fetchUnreadCount();
      });

      socketRef.current = socket;

      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (errorCountRef.current < 3) {
            fetchUnreadCount();
          }
        }, 60000);
      }
    } catch (error) {
      console.error('Error setting up socket:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, fetchUnreadCount]);

  return (
    <UnreadCountContext.Provider value={{ unreadCount, refreshUnreadCount: fetchUnreadCount, isLoading }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  const context = useContext(UnreadCountContext);
  if (context === undefined) {
    throw new Error('useUnreadCount must be used within an UnreadCountProvider');
  }
  return context;
}

