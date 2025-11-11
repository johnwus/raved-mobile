export interface StoreItem {
    id: string;
    seller_id: string;
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    category: string;
    condition: string;
    size?: string;
    brand?: string;
    color?: string;
    material?: string;
    images: string[];
    views_count: number;
    likes_count: number;
    saves_count: number;
    sales_count: number;
    status: string;
    payment_methods: string[];
    meetup_location?: string;
    seller_phone?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
