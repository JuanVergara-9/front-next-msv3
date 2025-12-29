import { AuthService } from './auth.service';

export interface UploadResult {
    url: string;
    public_id: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class UploadService {
    /**
     * Upload an image for an order. Returns the Cloudinary URL and public_id.
     */
    static async uploadOrderImage(file: File): Promise<UploadResult> {
        const formData = new FormData();
        formData.append('image', file);

        const token = AuthService.getAccessToken();

        const response = await fetch(`${API_URL}/api/v1/orders/upload-image`, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(error.error || 'Error al subir la imagen');
        }

        return response.json();
    }

    /**
     * Delete an image from Cloudinary by its public_id.
     */
    static async deleteOrderImage(public_id: string): Promise<void> {
        const token = AuthService.getAccessToken();

        const response = await fetch(`${API_URL}/api/v1/orders/delete-image`, {
            method: 'POST',
            body: JSON.stringify({ public_id }),
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Delete failed' }));
            throw new Error(error.error || 'Error al eliminar la imagen');
        }
    }
}
