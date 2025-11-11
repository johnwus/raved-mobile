export interface Subscription {
    id: string;
    user_id: string;
    plan_type: string;
    amount: number;
    payment_method: string;
    payment_reference?: string;
    status: string;
    starts_at: Date;
    expires_at: Date;
    created_at: Date;
}
