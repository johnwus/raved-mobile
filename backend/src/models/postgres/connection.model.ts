export interface Connection {
    id: string;
    follower_id: string;
    following_id: string;
    status: string;
    created_at: Date;
}
