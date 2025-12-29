import { apiClient } from "@/lib/apiClient";

export interface Conversation {
    id: number;
    providerId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    lastMessage?: {
        content: string;
        createdAt: string;
        senderId: number;
    };
    otherUser?: {
        id: number;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
    unreadCount?: number;
}

export const ChatService = {
    async createOrGetConversation(targetId: number): Promise<Conversation> {
        const response = await apiClient.post('/api/v1/chat/conversations', { targetId });
        return response.data;
    },

    async getConversations(): Promise<Conversation[]> {
        const response = await apiClient.get('/api/v1/chat/conversations');
        return response.data;
    },

    async getMessages(conversationId: number) {
        const response = await apiClient.get(`/api/v1/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    async markAsRead(conversationId: number): Promise<void> {
        await apiClient.post(`/api/v1/chat/conversations/${conversationId}/read`);
    }
};
