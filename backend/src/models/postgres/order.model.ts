export interface Order {
    id: string;
    buyer_id: string;
    seller_id: string;
    item_id: string;
    quantity: number;
    total_amount: number;
    payment_method: string;
    delivery_method: string;
    delivery_address?: string;
    buyer_phone?: string;
    status: string;
    payment_status: string;
    payment_reference?: string;
    created_at: Date;
    updated_at: Date;
    completed_at?: Date;
}
