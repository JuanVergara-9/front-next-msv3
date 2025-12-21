import { apiFetch } from '../apiClient';

export interface Postulation {
    id: number;
    order_id: number;
    provider_id: number;
    message: string;
    budget?: number;
    status: 'SENT' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
    provider?: {
        id: number;
        first_name: string;
        last_name: string;
        avatar_url?: string;
        category?: { name: string };
    };
}

export interface Order {
    id: number;
    user_id: number;
    category_id: number;
    title: string;
    description: string;
    lat: number;
    lng: number;
    images: string[];
    budget_estimate?: string;
    status: 'PENDING' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    created_at: string;
    category?: { name: string };
    postulations?: Postulation[];
}

export class OrdersService {
    static async createOrder(data: {
        title: string;
        description: string;
        category_id: number;
        lat: number;
        lng: number;
        images?: string[];
        budget_estimate?: string;
    }): Promise<Order> {
        return apiFetch<Order>('/api/v1/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async getMyOrders(): Promise<Order[]> {
        return apiFetch<Order[]>('/api/v1/orders/mine');
    }

    static async getFeed(): Promise<Order[]> {
        return apiFetch<Order[]>('/api/v1/orders/feed');
    }

    /**
     * Public endpoint - Get recent orders for the social proof feed (anonymized).
     */
    static async getPublicRecentOrders(limit = 5): Promise<{ orders: { id: number; category_name: string; created_at: string }[] }> {
        return apiFetch<{ orders: { id: number; category_name: string; created_at: string }[] }>(`/api/v1/orders/public/recent?limit=${limit}`, { cacheTtlMs: 60000 });
    }

    /**
     * Public endpoint - Get order statistics for the Home page.
     */
    static async getStats(): Promise<{ resolved_this_month: number; total_orders: number }> {
        return apiFetch<{ resolved_this_month: number; total_orders: number }>('/api/v1/orders/stats', { cacheTtlMs: 60000 });
    }

    static async postulate(orderId: number, data: { message: string, budget?: number }): Promise<Postulation> {
        return apiFetch<Postulation>(`/api/v1/orders/${orderId}/postulate`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async acceptPostulation(orderId: number, postulationId: number): Promise<{ success: true, order: Order }> {
        return apiFetch<{ success: true, order: Order }>(`/api/v1/orders/${orderId}/accept`, {
            method: 'POST',
            body: JSON.stringify({ postulation_id: postulationId }),
        });
    }
}
