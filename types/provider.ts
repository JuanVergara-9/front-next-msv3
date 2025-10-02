export type Provider = {
  id: string;
  name: string;
  rating: number; // 0..5
  city: string; // "San Rafael"
  distanceKm?: number;
  categories: string[];
  description: string;
  photoUrl?: string;
  whatsapp?: string; // "549260XXXXXXX"
  phone?: string;    // "0260XXXXXXX"
};
