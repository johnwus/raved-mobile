export interface Event {
    id: string;
    organizer_id: string;
    title: string;
    description?: string;
    event_date: Date;
    event_time: string;
    location: string;
    category: string;
    audience: string;
    max_attendees: number;
    current_attendees: number;

    registration_fee: number;
    image_url?: string;
    require_registration: boolean;
    allow_waitlist: boolean;
    send_reminders: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
