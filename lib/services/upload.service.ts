import { AuthService } from './auth.service';
import { silentLogoutAndRedirect } from '../apiClient';

export interface UploadResult {
    url: string;
    public_id: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class UploadService {
    private static async authFetch(url: string, init: RequestInit): Promise<Response> {
        const token = AuthService.getAccessToken();
        const headers: Record<string, string> = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init.headers as Record<string, string> | undefined),
        };

        const res = await fetch(url, { ...init, headers });

        if (res.status === 401 || res.status === 403) {
            silentLogoutAndRedirect();
            throw new Error('AUTH.FORBIDDEN');
        }
        return res;
    }

    static async uploadOrderImage(file: File): Promise<UploadResult> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await this.authFetch(`${API_URL}/api/v1/orders/upload-image`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(error.error || 'Error al subir la imagen');
        }

        return response.json();
    }

    static async deleteOrderImage(public_id: string): Promise<void> {
        const response = await this.authFetch(`${API_URL}/api/v1/orders/delete-image`, {
            method: 'POST',
            body: JSON.stringify({ public_id }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Delete failed' }));
            throw new Error(error.error || 'Error al eliminar la imagen');
        }
    }
}
