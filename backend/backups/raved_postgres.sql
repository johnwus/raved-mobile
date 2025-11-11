--
-- PostgreSQL database dump
--

\restrict rSkREcgFkdPBzsR8IKaxd5Q5xgPdpgRtFB9PnmnRh5auIwXm8kNEtm7rZfPdl0F

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-11 01:36:12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 241 (class 1259 OID 34097)
-- Name: ab_test_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ab_test_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid,
    variant_name character varying(255) NOT NULL,
    user_id uuid,
    event_type character varying(100) NOT NULL,
    event_value numeric(20,6),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ab_test_results OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 34079)
-- Name: ab_test_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ab_test_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid,
    variant_name character varying(255) NOT NULL,
    variant_value text NOT NULL,
    weight numeric(5,4) DEFAULT 1.0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ab_test_variants OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 34062)
-- Name: ab_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ab_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_name character varying(255) NOT NULL,
    test_description text,
    feature_name character varying(255) NOT NULL,
    variants text[] NOT NULL,
    weights numeric(5,4)[],
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ab_tests_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'paused'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.ab_tests OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 33993)
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id character varying(255) NOT NULL,
    event_type character varying(100) NOT NULL,
    event_category character varying(100) NOT NULL,
    event_action character varying(100) NOT NULL,
    event_label character varying(255),
    event_value integer,
    page_url text,
    page_title character varying(255),
    referrer text,
    user_agent text,
    ip_address inet,
    device_type character varying(50),
    browser character varying(100),
    os character varying(100),
    screen_resolution character varying(20),
    viewport_size character varying(20),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.analytics_events OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 34014)
-- Name: analytics_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_name character varying(255) NOT NULL,
    metric_value numeric(20,6) NOT NULL,
    metric_type character varying(20) NOT NULL,
    tags jsonb DEFAULT '{}'::jsonb,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT analytics_metrics_metric_type_check CHECK (((metric_type)::text = ANY ((ARRAY['counter'::character varying, 'gauge'::character varying, 'histogram'::character varying])::text[])))
);


ALTER TABLE public.analytics_metrics OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 34029)
-- Name: analytics_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_type character varying(20) NOT NULL,
    report_name character varying(255) NOT NULL,
    date_range_start timestamp without time zone NOT NULL,
    date_range_end timestamp without time zone NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT analytics_reports_report_type_check CHECK (((report_type)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public.analytics_reports OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 33819)
-- Name: blocked_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    blocker_id uuid,
    blocked_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blocked_users OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33840)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    item_id uuid,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 34484)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    user_id uuid,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    replies_count integer DEFAULT 0,
    parent_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33620)
-- Name: connections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_id uuid,
    following_id uuid,
    status character varying(20) DEFAULT 'following'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.connections OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 34390)
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participant1_id uuid,
    participant2_id uuid,
    last_message_id character varying(255),
    last_message_at timestamp without time zone,
    unread_count1 integer DEFAULT 0,
    unread_count2 integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    CONSTRAINT conversations_check CHECK ((participant1_id < participant2_id))
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 34293)
-- Name: deep_link_clicks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deep_link_clicks (
    id integer NOT NULL,
    deep_link_id integer,
    user_agent text,
    ip_address inet,
    referrer text,
    clicked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.deep_link_clicks OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 34292)
-- Name: deep_link_clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deep_link_clicks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deep_link_clicks_id_seq OWNER TO postgres;

--
-- TOC entry 5662 (class 0 OID 0)
-- Dependencies: 257
-- Name: deep_link_clicks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deep_link_clicks_id_seq OWNED BY public.deep_link_clicks.id;


--
-- TOC entry 256 (class 1259 OID 34273)
-- Name: deep_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deep_links (
    id integer NOT NULL,
    content_type character varying(20) NOT NULL,
    content_id character varying(255) NOT NULL,
    short_code character varying(20) NOT NULL,
    long_url text NOT NULL,
    platform character varying(20),
    campaign character varying(100),
    metadata jsonb DEFAULT '{}'::jsonb,
    click_count integer DEFAULT 0,
    last_clicked_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT deep_links_content_type_check CHECK (((content_type)::text = ANY ((ARRAY['post'::character varying, 'profile'::character varying, 'event'::character varying, 'product'::character varying])::text[])))
);


ALTER TABLE public.deep_links OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 34272)
-- Name: deep_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deep_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deep_links_id_seq OWNER TO postgres;

--
-- TOC entry 5663 (class 0 OID 0)
-- Dependencies: 255
-- Name: deep_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deep_links_id_seq OWNED BY public.deep_links.id;


--
-- TOC entry 230 (class 1259 OID 33884)
-- Name: device_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token text NOT NULL,
    platform character varying(20) NOT NULL,
    device_id character varying(255),
    app_version character varying(50),
    active boolean DEFAULT true,
    last_used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT device_tokens_platform_check CHECK (((platform)::text = ANY ((ARRAY['ios'::character varying, 'android'::character varying, 'web'::character varying])::text[])))
);


ALTER TABLE public.device_tokens OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 33928)
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verification_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_verification_tokens OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33666)
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_attendees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid,
    user_id uuid,
    status character varying(20) DEFAULT 'attending'::character varying,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.event_attendees OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 33642)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid,
    title character varying(255) NOT NULL,
    description text,
    event_date date NOT NULL,
    event_time time without time zone NOT NULL,
    location character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    audience character varying(50) DEFAULT 'all'::character varying,
    max_attendees integer DEFAULT 100,
    current_attendees integer DEFAULT 0,
    registration_fee numeric(10,2) DEFAULT 0.00,
    image_url text,
    require_registration boolean DEFAULT true,
    allow_waitlist boolean DEFAULT true,
    send_reminders boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 34515)
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    post_id uuid,
    comment_id uuid,
    type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT likes_type_check CHECK (((type)::text = ANY ((ARRAY['post'::character varying, 'comment'::character varying])::text[])))
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 34417)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    sender_id uuid,
    content text NOT NULL,
    message_type character varying(50) DEFAULT 'text'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 33908)
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_settings (
    user_id uuid NOT NULL,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    likes_notifications boolean DEFAULT true,
    comments_notifications boolean DEFAULT true,
    follows_notifications boolean DEFAULT true,
    events_notifications boolean DEFAULT true,
    messages_notifications boolean DEFAULT true,
    marketing_notifications boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notification_settings OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 33967)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    actor_id uuid,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 34348)
-- Name: offline_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    resource_type character varying(50) NOT NULL,
    resource_id character varying(255) NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    sync_status character varying(20) DEFAULT 'pending'::character varying,
    retry_count integer DEFAULT 0,
    last_synced_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.offline_data OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 34310)
-- Name: offline_queues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_queues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    request_type character varying(50) NOT NULL,
    endpoint character varying(255) NOT NULL,
    method character varying(10) NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone,
    error_message text
);


ALTER TABLE public.offline_queues OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33711)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid,
    seller_id uuid,
    item_id uuid,
    quantity integer DEFAULT 1,
    total_amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    delivery_method character varying(50) NOT NULL,
    delivery_address text,
    buyer_phone character varying(20),
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    payment_reference character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 33947)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 34451)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type character varying(20) NOT NULL,
    caption text,
    media jsonb DEFAULT '{}'::jsonb,
    location character varying(255),
    tags text[] DEFAULT '{}'::text[],
    brand character varying(100),
    occasion character varying(100),
    visibility character varying(20) DEFAULT 'public'::character varying,
    is_for_sale boolean DEFAULT false,
    sale_details jsonb DEFAULT '{}'::jsonb,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    saves_count integer DEFAULT 0,
    views_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    featured_at timestamp without time zone,
    faculty character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    CONSTRAINT posts_type_check CHECK (((type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'carousel'::character varying, 'text'::character varying])::text[]))),
    CONSTRAINT posts_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'faculty'::character varying, 'connections'::character varying, 'private'::character varying])::text[])))
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 33787)
-- Name: ranking_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ranking_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    ranking_period character varying(50) NOT NULL,
    rank integer NOT NULL,
    score integer NOT NULL,
    ranking_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ranking_history OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 33803)
-- Name: ranking_prizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ranking_prizes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    ranking_period character varying(50) NOT NULL,
    rank integer NOT NULL,
    prize_amount numeric(10,2) NOT NULL,
    prize_type character varying(20) NOT NULL,
    awarded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ranking_prizes OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 34206)
-- Name: referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    referrer_id uuid,
    referred_id uuid,
    referral_code character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.referrals OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 34205)
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referrals_id_seq OWNER TO postgres;

--
-- TOC entry 5664 (class 0 OID 0)
-- Dependencies: 249
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- TOC entry 229 (class 1259 OID 33862)
-- Name: saved_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    item_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_items OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 34189)
-- Name: share_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.share_analytics (
    id integer NOT NULL,
    share_id integer,
    user_agent text,
    ip_address inet,
    clicked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.share_analytics OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 34229)
-- Name: share_analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.share_analytics_events (
    id integer NOT NULL,
    share_id integer,
    event_type character varying(20) NOT NULL,
    user_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT share_analytics_events_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['click'::character varying, 'view'::character varying, 'conversion'::character varying])::text[])))
);


ALTER TABLE public.share_analytics_events OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 34228)
-- Name: share_analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.share_analytics_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.share_analytics_events_id_seq OWNER TO postgres;

--
-- TOC entry 5665 (class 0 OID 0)
-- Dependencies: 251
-- Name: share_analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.share_analytics_events_id_seq OWNED BY public.share_analytics_events.id;


--
-- TOC entry 247 (class 1259 OID 34188)
-- Name: share_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.share_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.share_analytics_id_seq OWNER TO postgres;

--
-- TOC entry 5666 (class 0 OID 0)
-- Dependencies: 247
-- Name: share_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.share_analytics_id_seq OWNED BY public.share_analytics.id;


--
-- TOC entry 254 (class 1259 OID 34255)
-- Name: share_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.share_templates (
    id integer NOT NULL,
    content_type character varying(50) NOT NULL,
    platform character varying(50) NOT NULL,
    template text NOT NULL,
    variables text[] DEFAULT '{}'::text[],
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.share_templates OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 34254)
-- Name: share_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.share_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.share_templates_id_seq OWNER TO postgres;

--
-- TOC entry 5667 (class 0 OID 0)
-- Dependencies: 253
-- Name: share_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.share_templates_id_seq OWNED BY public.share_templates.id;


--
-- TOC entry 246 (class 1259 OID 34165)
-- Name: shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shares (
    id integer NOT NULL,
    content_type character varying(20) NOT NULL,
    content_id character varying(255) NOT NULL,
    user_id uuid,
    platform character varying(20) NOT NULL,
    share_url text NOT NULL,
    referral_code character varying(255),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shares_content_type_check CHECK (((content_type)::text = ANY ((ARRAY['post'::character varying, 'profile'::character varying, 'event'::character varying, 'product'::character varying])::text[]))),
    CONSTRAINT shares_platform_check CHECK (((platform)::text = ANY ((ARRAY['facebook'::character varying, 'twitter'::character varying, 'instagram'::character varying, 'whatsapp'::character varying, 'native'::character varying, 'link'::character varying])::text[])))
);


ALTER TABLE public.shares OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 34164)
-- Name: shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shares_id_seq OWNER TO postgres;

--
-- TOC entry 5668 (class 0 OID 0)
-- Dependencies: 245
-- Name: shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shares_id_seq OWNED BY public.shares.id;


--
-- TOC entry 221 (class 1259 OID 33688)
-- Name: store_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seller_id uuid,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    category character varying(50) NOT NULL,
    condition character varying(50) NOT NULL,
    size character varying(20),
    brand character varying(100),
    color character varying(50),
    material character varying(100),
    images text[],
    views_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    saves_count integer DEFAULT 0,
    sales_count integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    payment_methods text[],
    meetup_location character varying(255),
    seller_phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.store_items OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 34545)
-- Name: stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type character varying(20) NOT NULL,
    media jsonb DEFAULT '{}'::jsonb,
    caption text,
    location character varying(255),
    views_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone,
    deleted_at timestamp without time zone,
    CONSTRAINT stories_type_check CHECK (((type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[])))
);


ALTER TABLE public.stories OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 34148)
-- Name: story_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id character varying(255) NOT NULL,
    user_id uuid,
    viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.story_views OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 33744)
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    plan_type character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_reference character varying(255),
    status character varying(50) DEFAULT 'active'::character varying,
    starts_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subscription_code character varying(255)
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 34043)
-- Name: user_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    activity_type character varying(100) NOT NULL,
    activity_data jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_activity_logs OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33761)
-- Name: user_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    weekly_score integer DEFAULT 0,
    monthly_score integer DEFAULT 0,
    all_time_score integer DEFAULT 0,
    total_likes_received integer DEFAULT 0,
    total_comments_received integer DEFAULT 0,
    total_shares_received integer DEFAULT 0,
    total_sales integer DEFAULT 0,
    total_features integer DEFAULT 0,
    last_weekly_reset timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_monthly_reset timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_scores OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 34120)
-- Name: user_trust_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_trust_scores (
    id integer NOT NULL,
    user_id uuid,
    trust_score integer DEFAULT 50 NOT NULL,
    total_posts integer DEFAULT 0,
    flagged_posts integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    flagged_comments integer DEFAULT 0,
    total_messages integer DEFAULT 0,
    flagged_messages integer DEFAULT 0,
    violations_count integer DEFAULT 0,
    last_violation_date timestamp without time zone,
    account_age_days integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_trust_scores_trust_score_check CHECK (((trust_score >= 0) AND (trust_score <= 100)))
);


ALTER TABLE public.user_trust_scores OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 34119)
-- Name: user_trust_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_trust_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_trust_scores_id_seq OWNER TO postgres;

--
-- TOC entry 5669 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_trust_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_trust_scores_id_seq OWNED BY public.user_trust_scores.id;


--
-- TOC entry 217 (class 1259 OID 33589)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    avatar_url text,
    bio text,
    faculty character varying(100),
    university character varying(255),
    student_id character varying(50),
    location character varying(255),
    website character varying(255),
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    is_private boolean DEFAULT false,
    show_activity boolean DEFAULT true,
    read_receipts boolean DEFAULT true,
    allow_downloads boolean DEFAULT false,
    allow_story_sharing boolean DEFAULT true,
    followers_count integer DEFAULT 0,
    following_count integer DEFAULT 0,
    posts_count integer DEFAULT 0,
    subscription_tier character varying(20) DEFAULT 'free'::character varying,
    subscription_expires_at timestamp without time zone,
    trial_started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login_at timestamp without time zone,
    deleted_at timestamp without time zone,
    theme_preference character varying(50) DEFAULT 'default'::character varying,
    dark_mode_preference boolean DEFAULT false,
    sms_two_factor_enabled boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5074 (class 2604 OID 34296)
-- Name: deep_link_clicks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deep_link_clicks ALTER COLUMN id SET DEFAULT nextval('public.deep_link_clicks_id_seq'::regclass);


--
-- TOC entry 5069 (class 2604 OID 34276)
-- Name: deep_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deep_links ALTER COLUMN id SET DEFAULT nextval('public.deep_links_id_seq'::regclass);


--
-- TOC entry 5059 (class 2604 OID 34209)
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- TOC entry 5057 (class 2604 OID 34192)
-- Name: share_analytics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics ALTER COLUMN id SET DEFAULT nextval('public.share_analytics_id_seq'::regclass);


--
-- TOC entry 5061 (class 2604 OID 34232)
-- Name: share_analytics_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics_events ALTER COLUMN id SET DEFAULT nextval('public.share_analytics_events_id_seq'::regclass);


--
-- TOC entry 5064 (class 2604 OID 34258)
-- Name: share_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_templates ALTER COLUMN id SET DEFAULT nextval('public.share_templates_id_seq'::regclass);


--
-- TOC entry 5053 (class 2604 OID 34168)
-- Name: shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shares ALTER COLUMN id SET DEFAULT nextval('public.shares_id_seq'::regclass);


--
-- TOC entry 5038 (class 2604 OID 34123)
-- Name: user_trust_scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_trust_scores ALTER COLUMN id SET DEFAULT nextval('public.user_trust_scores_id_seq'::regclass);


--
-- TOC entry 5631 (class 0 OID 34097)
-- Dependencies: 241
-- Data for Name: ab_test_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ab_test_results (id, test_id, variant_name, user_id, event_type, event_value, "timestamp", created_at) FROM stdin;
\.


--
-- TOC entry 5630 (class 0 OID 34079)
-- Dependencies: 240
-- Data for Name: ab_test_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ab_test_variants (id, test_id, variant_name, variant_value, weight, created_at) FROM stdin;
\.


--
-- TOC entry 5629 (class 0 OID 34062)
-- Dependencies: 239
-- Data for Name: ab_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ab_tests (id, test_name, test_description, feature_name, variants, weights, start_date, end_date, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5625 (class 0 OID 33993)
-- Dependencies: 235
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_events (id, user_id, session_id, event_type, event_category, event_action, event_label, event_value, page_url, page_title, referrer, user_agent, ip_address, device_type, browser, os, screen_resolution, viewport_size, "timestamp", metadata, created_at) FROM stdin;
badf350c-c874-41b5-b78a-7e6c09fe86c1	\N	3614958d-bd14-4c9c-a35d-2752277b04a3	page_view	engagement	view	\N	10	/health	/health	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:08:51.931	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 10}	2025-11-10 19:08:51.933539
72108cd4-950a-400c-b1fa-b3dd8452ac73	\N	c1b23ca6-c788-4a77-accf-4f19d61bac72	page_view	engagement	view	\N	1	/api/auth/status	/api/auth/status	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:09:04.711	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:09:04.712197
8934384f-3143-4882-80e2-9e6e87acf258	\N	2c0834b7-8cc3-4703-aed9-a86041f87354	page_view	engagement	view	\N	1	/auth/status	/auth/status	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:09:15.582	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:09:15.583512
fd234277-f986-458b-91a0-cad74a941b5d	\N	03993837-cc8c-4ff0-bbc6-e83331365411	page_view	engagement	view	\N	1	/auth/status	/auth/status	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:09:40.425	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:09:40.426087
5f398793-eab0-4316-91a2-5fa1707ed772	\N	fdbeddc8-cb93-4749-bea3-7bd72069f799	page_view	engagement	view	\N	4	/auth/login	/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:10:33.552	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 19:10:33.720662
196b91b1-36e1-4e31-8958-1d67e3864297	\N	551c3204-5f51-4e9b-98b3-ba0e728a19bc	page_view	engagement	view	\N	7	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:11:07.576	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 7}	2025-11-10 19:11:07.755755
42a11d7b-a227-4098-a205-a46e6f20bfcf	\N	4d6d7c12-6d96-4055-8675-b619048d32ee	page_view	engagement	view	\N	2	/api/v1/store/items	/api/v1/store/items	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:11:19.153	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:11:19.155305
aa9850b9-43c4-4f0a-bbef-643d95818b81	\N	29e95bb8-1d0e-4d65-9c50-e1c827270c3c	page_view	engagement	view	\N	4	/api/v1/posts/feed	/api/v1/posts/feed	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:11:33.594	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 19:11:33.595324
8a13ff9e-da5a-4479-8d65-31266b41c8f6	\N	39fe451d-0528-4486-971b-bfb565c29a4e	page_view	engagement	view	\N	2	/api/v1/	/api/v1/	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:11:45.462	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:11:45.463603
3607a3e9-18a8-4857-99a6-6d218c3d2f53	\N	a3e4439f-8916-4b14-aaa2-494a978f2e34	page_view	engagement	view	\N	1	/	/	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:11:57.467	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:11:57.467748
24ff7882-58a6-4b7f-bfd6-969aebc080bf	\N	c7144922-2814-4bf2-964e-ee050adb6cab	page_view	engagement	view	\N	5	/auth/register	/auth/register	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:18:54.791	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 5}	2025-11-10 19:18:54.916303
ee3eed25-c447-4606-a297-16b18f8b6f70	\N	3d78ffb6-0f59-4676-917b-37320d0ae60a	page_view	engagement	view	\N	3	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:19:22.51	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 19:19:22.511753
0498a1a1-27e5-4d5c-b67c-0a5055407137	\N	11c5d501-82b3-49e3-86ac-3134253db751	page_view	engagement	view	\N	2	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:19:40.407	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:19:40.408555
eea8dfb6-a274-432b-a63f-ea5b8caadef6	\N	0e8b1fb2-e2d1-4541-9f9f-272928c6bd20	page_view	engagement	view	\N	1	/api/v1/posts/feed	/api/v1/posts/feed	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:19:50.345	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:19:50.34612
6ea9baf3-c4d9-469d-accb-dc01afd0d065	\N	4a3ada31-6385-484e-b0e1-de7348371ad4	page_view	engagement	view	\N	1	/api/v1/store/items	/api/v1/store/items	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:19:59.137	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:19:59.137685
976d3a07-5cf2-4e3c-9c3f-10e580406831	\N	0ab04449-1829-49ab-bfdd-e89ce538fa8e	page_view	engagement	view	\N	2	/api/v1/upload/image	/api/v1/upload/image	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:20:09.189	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:20:09.190076
2ca8ebb1-28db-427f-ada6-6aeabeacc5fc	\N	dfd38dec-cef9-402f-a444-4cc7d60c26e9	page_view	engagement	view	\N	2	/	/	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:20:15.499	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:20:15.500311
4c4e6c30-5a16-456b-be12-28c4abef38e2	\N	283d9ac1-53ec-4f6a-9e9f-6c4fc89a2b4a	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:22:10.337	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:22:10.510932
6f33cbd3-4692-4cd4-92ff-12baa03e7d50	\N	5fcf712b-44e6-4738-b40b-b2a84d280f33	page_view	engagement	view	\N	4	/auth/login	/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:22:35.424	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 19:22:35.426621
31c6fce8-61ed-48a2-a5e2-b2694eb54da1	\N	64c001fe-741a-494c-9ae6-a4e64b886d93	page_view	engagement	view	\N	1	/auth/login	/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:22:59.624	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:22:59.625159
e40a99f0-f04e-47ad-b83c-39bea5a4214f	\N	edbf38c8-2e24-4851-b980-3db6b8792afe	page_view	engagement	view	\N	2	/api/v1/auth/status	/api/v1/auth/status	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:23:12.237	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:23:12.238146
0dd2d6f6-593d-46d8-af8c-292bbf6beded	\N	f3c5f37d-8ffc-433b-b306-1d17efb07043	page_view	engagement	view	\N	1	/api/v1/	/api/v1/	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:23:24.662	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:23:24.662947
cc3a98bb-3c75-4d06-ad23-bf24c7f84622	982fd39c-bee6-4033-8da9-15c89169343b	1a6e0afe-5765-4c5f-92e7-4301d73f5c55	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:43:38.067	{"query": {}, "statusCode": 304}	2025-11-10 20:43:38.06804
a911a3e2-3eba-451f-81fb-09a365eb585a	\N	ecb5e52a-15ed-4413-a394-7099a1d3c536	page_view	engagement	view	\N	2	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:23:37.072	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:23:37.073289
6622b797-61c1-43a5-8677-734693e67ec0	\N	3bb08908-de47-4704-95ec-3e0eb2840371	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:23:48.755	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:23:48.756283
2f9bc0e0-2479-4a14-bd09-9fa72ce2921a	\N	d415e6de-0fd4-40b3-9de1-134a5bb8c7fe	page_view	engagement	view	\N	1	/api/v1/auth	/api/v1/auth	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:24:00.014	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:24:00.01606
19881441-a90b-4926-850c-89e4b3910a1d	\N	a66ffbe2-4ee8-4cac-8e28-bed8923e2218	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:24:11.658	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:24:11.659412
ffae9d26-cc1e-4669-9be8-c4f3717c8130	\N	fb31630a-f5f1-48ac-b85b-ced42b393662	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:24:23.529	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:24:23.529965
cf85f86a-0535-4398-a9db-2a27ee828762	\N	05463276-8414-4281-b9bb-9172d6fbe028	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:24:35.427	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:24:35.428411
0585bb84-ba7a-447a-b5c6-8d5bb01f4b7d	\N	47a9d4b2-cffc-4b00-8637-b9de842119af	page_view	engagement	view	\N	4	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:24:49.501	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 19:24:49.502727
1f903ad0-30d3-466b-bd5e-2a2c04f79f47	\N	403c0709-42f4-433a-9793-68b0287b0e62	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:25:05.858	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:25:05.859327
b6f6796d-60d4-44c5-aa9b-ab37288a8f23	\N	5900bcd6-e49b-4c94-b9f9-7ca2492bb66d	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:25:25.375	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:25:25.375896
7868cb30-8190-4cdc-be10-b74015e78097	\N	f67364fc-b39f-40de-95b5-b11798e8270d	page_view	engagement	view	\N	0	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:25:37.231	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 0}	2025-11-10 19:25:37.232636
14f57976-e661-42b9-814f-e8929aea54d3	\N	4bd456a5-a02d-4571-a86e-97cfd6067c12	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:25:49.622	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:25:49.623801
1d6c4618-8db5-48c7-97bf-277c1a95f639	\N	37636afd-353f-4282-8909-43e1dd499a05	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:26:06.051	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:26:06.052487
2581b44e-0c4d-4787-ae1b-ee10114a754e	\N	cee4db38-6775-486c-923e-0c996341e4de	page_view	engagement	view	\N	0	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:26:21.471	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 0}	2025-11-10 19:26:21.472646
ee035df8-1330-4718-ba6d-69a9e8b16f7f	\N	796d697f-7086-48db-ab35-8df5b5702c69	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:26:35.041	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:26:35.04228
a3b8ed6c-d74d-43f0-ac28-2fcc14158ba8	\N	94fffbd9-e71f-447d-a467-e628957b6481	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:26:51.051	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:26:51.052118
ebdeb576-f633-4674-b7cb-dcb352e1ce95	\N	67bdf59b-3a77-4dc9-8d81-c02f74680c34	page_view	engagement	view	\N	0	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:27:03.832	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 0}	2025-11-10 19:27:03.833433
5b8cbd2f-968a-4f9a-8636-134551e1be1a	\N	4a645f0e-9f82-4a5e-8d68-eb017b712c3b	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:28:15.602	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:28:15.737948
191b64c7-98d9-4595-9b92-df8e20d86c91	\N	f6ecc52e-271c-4373-8c1d-a1743aebc554	page_view	engagement	view	\N	1	/auth/login	/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:28:30.916	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:28:30.91698
7fc6dcd7-7acb-465d-a4cb-c31a9df50208	\N	95dff6eb-99f5-4059-8b74-134180005512	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:28:43.937	{"query": {}, "method": "POST", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:28:43.937852
548241ac-6bef-4315-a9cc-abef1b973c55	\N	d53f7e41-c945-4ff5-8816-6b44703b212d	page_view	engagement	view	\N	2	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:28:58.658	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 19:28:58.659271
712a88f8-daef-4bdd-aaaf-86f6421f6d18	\N	efa5c72d-6c88-470a-b3ba-d255b058a487	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:29:17.14	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:29:17.140495
56e3c428-de8e-4ccb-92ae-e7c21577ed9b	\N	2f3facdd-18c3-4293-bc4a-0e2bfd8de732	page_view	engagement	view	\N	1	/api/v1/auth/login	/api/v1/auth/login	\N	curl/8.16.0	::1	desktop	unknown	unknown	\N	\N	2025-11-10 19:29:30.551	{"query": {}, "method": "GET", "headers": {"accept": "*/*"}, "statusCode": 404, "responseTime": 1}	2025-11-10 19:29:30.55198
59b06555-100c-49f1-b4be-9bb98c052ed2	\N	31d4910a-aa31-47a1-b052-c58c13478683	page_view	engagement	view	\N	10	/api/v1/auth/login	/api/v1/auth/login	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	::1	desktop	unknown	windows	\N	\N	2025-11-10 19:35:18.195	{"query": {}, "method": "POST", "headers": {}, "statusCode": 404, "responseTime": 10}	2025-11-10 19:35:18.197436
116045cb-7b27-4718-820d-f95aadf47164	\N	25a33432-0a84-4e07-ac7a-7c9a782954f7	page_view	engagement	view	\N	10	/api/v1/store/items	/api/v1/store/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 19:41:40.324	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 10}	2025-11-10 19:41:40.407664
75ddd502-1020-4d6f-aef7-490b175e3682	\N	68d7437b-cd69-4c5a-baaf-89889fa41f95	page_view	engagement	view	\N	3	/api/v1/auth/login	/api/v1/auth/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 19:41:58.179	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 19:41:58.180427
9c68ee30-9427-447c-b5c2-9172f72ab0df	\N	40105a76-a32c-45fb-8f43-93ce1e433c0e	page_view	engagement	view	\N	3	/api/v1/auth/login	/api/v1/auth/login	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	::ffff:192.168.100.28	desktop	unknown	windows	\N	\N	2025-11-10 19:43:34.57	{"query": {}, "method": "POST", "headers": {}, "statusCode": 404, "responseTime": 3}	2025-11-10 19:43:34.683825
535b548a-447d-46cf-9568-2b322b34464b	\N	ee4b3d9f-7974-4a03-aa7c-557c60308d57	page_view	engagement	view	\N	22	/api/v1/auth/login	/login	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	::ffff:192.168.100.28	desktop	unknown	windows	\N	\N	2025-11-10 19:45:35.251	{"query": {}, "method": "POST", "headers": {}, "statusCode": 500, "responseTime": 22}	2025-11-10 19:45:35.354504
cabfe456-0a21-4563-b014-db9615e5fe51	\N	5d8a5c6a-397e-417c-9175-5d14d920b03d	page_view	engagement	view	\N	37	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:50:14.73	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 37}	2025-11-10 19:50:14.870209
45c71220-8764-4bff-896b-225a81be12a9	\N	d4a8953f-1d6d-4770-80c2-e270cd33a154	page_view	engagement	view	\N	39	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:50:52.495	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 39}	2025-11-10 19:50:52.651678
8c1702c6-46a2-47b1-80ab-340603ee14a3	\N	65c5504b-9bdf-48f7-b46f-7ea1170fd6d1	page_view	engagement	view	\N	20	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:52:57.515	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 20}	2025-11-10 19:52:57.516588
9136d7af-c5de-46c9-97b1-55b8a68a5228	\N	4529d60a-055d-4470-91a3-a6e63a0bf205	page_view	engagement	view	\N	53	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:53:31.449	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 53}	2025-11-10 19:53:31.453053
b1c6a8f6-4ca4-456f-98da-231416946c7a	\N	124c4fc7-a03d-44c2-b105-60ae0490cdbe	page_view	engagement	view	\N	188	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:55:38.078	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 188}	2025-11-10 19:55:38.080182
e266d694-3193-4b82-9648-e702b4be5138	\N	d77dc230-f303-42e7-a3a0-f34f7c4941e7	page_view	engagement	view	\N	962	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:55:39.06	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 962}	2025-11-10 19:55:39.06133
dbf252ff-85c0-420c-a1ca-c1e3bfdafa80	\N	a91b22b6-d187-4180-9267-66b6c2788531	page_view	engagement	view	\N	831	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 19:56:17.09	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 831}	2025-11-10 19:56:17.093064
49b84b9a-3069-4454-b111-2f88a86c859b	\N	cbc91678-9165-4f6d-b59f-9cd2b30cf7e8	page_view	engagement	view	\N	3	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:01:12.119	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 3}	2025-11-10 20:01:12.250494
976553a9-0ad5-4808-889c-415ece3bf4c9	\N	2a21a591-a91d-43ad-a86a-3e9e9112550b	page_view	engagement	view	\N	8	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:05:39.145	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 8}	2025-11-10 20:05:39.237458
a4c958f9-73d1-47fb-95f1-269f32a5e923	\N	9084aab5-cc8d-49bd-a962-90a282c0b1f9	page_view	engagement	view	\N	131	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:06:10.174	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 131}	2025-11-10 20:06:10.175454
583d4160-6f39-478f-849c-923cd6b57495	\N	f721bf6f-d38e-4f4b-ae74-f7c7dc085719	page_view	engagement	view	\N	882	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:05.071	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 882}	2025-11-10 20:07:05.072388
c23beed5-7e86-44ce-8b97-b80a6d04686a	\N	41359ded-3dfa-4b1d-a98c-7a1b175a7815	page_view	engagement	view	\N	7	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:08.01	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 7}	2025-11-10 20:07:08.010952
dff96ea5-b6c3-4ada-818e-6771b9afc25c	\N	5c2718d9-adc0-473b-b646-a1cb89cdfad4	page_view	engagement	view	\N	8	/api/v1/auth/refresh	/api/v1/auth/refresh	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:08.119	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 8}	2025-11-10 20:07:08.120389
5bbb14d2-3d40-44cf-97dd-4e69a6af31c5	\N	8e1e8fde-905d-40e9-9ba0-ecb27aa602eb	page_view	engagement	view	\N	6	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:25.119	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 6}	2025-11-10 20:07:25.121082
43ef7760-db97-40df-8672-756f594575ff	\N	c260ce8c-6fb7-4126-be15-acd39492f652	page_view	engagement	view	\N	4	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:40.401	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 4}	2025-11-10 20:07:40.402787
bca03a16-03c4-495a-83be-c0e7ac083d75	\N	20b44c91-97de-4ca8-9edf-9f0de39a54c4	page_view	engagement	view	\N	3	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:47.312	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 3}	2025-11-10 20:07:47.313138
ae4cb27c-2c0d-41e6-8b1e-552b31e682ff	\N	3c88bb0e-2e0b-480b-8b60-934b8a380577	page_view	engagement	view	\N	2	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:07:49.667	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 2}	2025-11-10 20:07:49.668203
9e2774be-051a-4ac0-b028-ae81f315f766	\N	6039ef5b-8b2f-410a-86d9-51413e43e67b	page_view	engagement	view	\N	5	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:08:00.127	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 5}	2025-11-10 20:08:00.129309
5fff9ae2-266d-4732-872f-0c1adc5fe69b	\N	67676cd0-97be-4df9-9aaf-63ad583922ae	page_view	engagement	view	\N	3	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:16:32.551	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 3}	2025-11-10 20:16:32.736341
4b9f129e-7720-4912-9e65-a5a552a66645	\N	95396322-a629-407f-af96-cd603c4b3905	page_view	engagement	view	\N	653	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:17:06.704	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 653}	2025-11-10 20:17:06.705481
64440c21-0fc9-4dee-958a-b08b46ec017c	\N	08c37694-e081-40f9-b340-43665ce1ceae	page_view	engagement	view	\N	5	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:17:09.052	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 5}	2025-11-10 20:17:09.053623
007b03b5-4644-4437-8f28-7a4adb1b5ffc	\N	f87b5650-5ebf-4836-9aeb-e95a6969127c	page_view	engagement	view	\N	3	/api/v1/auth/refresh	/api/v1/auth/refresh	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:17:09.184	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 20:17:09.187866
59d505fa-ec38-49ab-86fc-0bbb14ea65fd	\N	5c5dea31-84fc-43ca-b51b-1c554d0f9b92	page_view	engagement	view	\N	1	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:17:15.861	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 1}	2025-11-10 20:17:15.862812
028ad12a-af6f-479d-b9d0-dcd10aa005e5	\N	97d6fa19-2b2c-4f69-88b8-834c0c5a43f8	page_view	engagement	view	\N	2	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:17:18.343	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 2}	2025-11-10 20:17:18.344926
3b44acc6-aac3-494e-85cc-e5946b9706f0	\N	7ce3df89-98a2-4062-be73-affac10f1a43	page_view	engagement	view	\N	2	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:17:21.858	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 20:17:21.859846
379b8213-3106-4b63-960a-27ae18704605	\N	cbc455e7-33b6-47db-aab1-c04098d85898	page_view	engagement	view	\N	25	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 20:21:48.053	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 25}	2025-11-10 20:21:48.055065
b7cba64f-8265-4106-92d1-e4cbf90b27ad	\N	ffee4409-89b6-4380-a6f9-78ec248851d5	page_view	engagement	view	\N	811	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 20:21:48.887	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 811}	2025-11-10 20:21:48.888078
e2c11a9b-50ea-40d8-90c7-9a2d3ac83146	\N	3cbe8505-ad94-4725-b889-670ccafb5ae3	page_view	engagement	view	\N	746	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 20:22:39.362	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 746}	2025-11-10 20:22:39.365668
9ee9a53f-c36c-4e2e-8d42-20d901571775	\N	59d0547a-d102-4c85-ae9c-2ca504a9a583	page_view	engagement	view	\N	13	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:23:25.708	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 13}	2025-11-10 20:23:25.709972
d5e482e1-a923-4083-9231-4c28af32f3e2	\N	5098f83d-7bb0-4df5-b352-23448e553ff8	page_view	engagement	view	\N	683	/api/v1/auth/refresh	/refresh	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 20:23:35.349	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 683}	2025-11-10 20:23:35.350475
4c40186f-d5ef-4dcf-8a1f-453322cd7fed	\N	e11e8af1-76a6-4438-a197-cf1c7ad9b344	page_view	engagement	view	\N	2	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:24:26.647	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 2}	2025-11-10 20:24:26.816963
88983a67-ab64-4847-bcc4-23099f50d472	\N	ee2da72d-7589-493a-8a05-42b2b8241bdb	page_view	engagement	view	\N	7	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:24:46.749	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 7}	2025-11-10 20:24:46.750022
bed9ea9d-d8de-45ab-8b3e-4f04711f8329	\N	55def8d1-d7e5-4f2f-b783-c50673a6db38	page_view	engagement	view	\N	1	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:25:33.011	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 1}	2025-11-10 20:25:33.196097
e1a9b11f-c780-4568-b834-3524fc4be0e7	\N	42c47b15-7adf-40be-be19-7ba54f6390a4	page_view	engagement	view	\N	2	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:25:46.605	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 2}	2025-11-10 20:25:46.606934
257c6f47-1b9c-443f-95d3-f41ff39eb788	\N	17b8be42-b9a2-4345-8137-b92b84077933	page_view	engagement	view	\N	3	/api/v1/store/items	/items	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	::ffff:192.168.100.28	desktop	unknown	windows	\N	\N	2025-11-10 20:26:43.019	{"query": {}, "method": "GET", "headers": {}, "statusCode": 401, "responseTime": 3}	2025-11-10 20:26:43.202852
de3231af-b14d-48bd-81b7-6d78c32707d0	\N	b801e353-4dcb-4a44-96c9-b83fe3db958e	page_view	engagement	view	\N	7	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:28:08.266	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 7}	2025-11-10 20:28:08.493265
1ac17cef-16b4-44b2-a6f7-7c19b4c9300c	982fd39c-bee6-4033-8da9-15c89169343b	a8bee910-5d5c-4e3c-9bb5-1f73500e1aa6	page_view	engagement	view	\N	81	/api/v1/store/items	/items	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	::ffff:192.168.100.28	desktop	unknown	windows	\N	\N	2025-11-10 20:28:57.054	{"query": {}, "method": "GET", "headers": {}, "statusCode": 200, "responseTime": 81}	2025-11-10 20:28:57.057775
77822f49-d85e-4af5-8a21-dedf5705f43d	982fd39c-bee6-4033-8da9-15c89169343b	a8bee910-5d5c-4e3c-9bb5-1f73500e1aa6	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:28:57.054	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 20:28:57.246679
4b0fed4f-0aee-476f-86f1-aefc04148d12	982fd39c-bee6-4033-8da9-15c89169343b	a0c01036-128c-4dbf-95ed-21861fe5a07b	page_view	engagement	view	\N	1015	/api/v1/posts/feed?page=1&limit=20	/feed	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	::ffff:192.168.100.28	desktop	unknown	windows	\N	\N	2025-11-10 20:29:17.33	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {}, "statusCode": 200, "responseTime": 1015}	2025-11-10 20:29:17.331787
8008d2a7-7012-4b7b-a0dd-885dabb8699d	982fd39c-bee6-4033-8da9-15c89169343b	a0c01036-128c-4dbf-95ed-21861fe5a07b	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:29:17.33	{"query": {"page": "1", "limit": "20"}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 20:29:17.332534
5fdb4446-8da0-45d3-9064-ac7a3edc5b8c	\N	d93f243f-8fff-49da-9d65-7c2cb2a3b5ae	page_view	engagement	view	\N	14	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:31:01.185	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 14}	2025-11-10 20:31:01.187696
42b9e583-5f8b-4d42-8d0e-2f3f19dee44f	\N	5a00cc25-2cd0-4400-886c-c54e010d4aee	page_view	engagement	view	\N	219	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:31:33.449	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 219}	2025-11-10 20:31:33.449753
a0aad515-19ea-4007-89fc-10af1cb1656c	\N	1685c4d3-0e88-4065-ac8e-7b2d6397d2b8	page_view	engagement	view	\N	606	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:31:48.062	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 606}	2025-11-10 20:31:48.063362
99d76dce-27bc-4454-8de4-3c3ef8e2d360	982fd39c-bee6-4033-8da9-15c89169343b	8f89b7b2-881b-4f85-8cc3-afb0f5d59bcf	page_view	engagement	view	\N	1193	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:31:51.878	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 1193}	2025-11-10 20:31:51.880295
8715136b-a182-4cc8-8315-1d514229b32b	982fd39c-bee6-4033-8da9-15c89169343b	8f89b7b2-881b-4f85-8cc3-afb0f5d59bcf	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:31:51.879	{"query": {"page": "1", "limit": "20"}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 20:31:52.069485
e47ef795-44db-44a9-be35-3719fc17ad86	982fd39c-bee6-4033-8da9-15c89169343b	a12e887d-2539-48d6-bff8-8a7be4b3f41f	page_view	engagement	view	\N	1847	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:32:37.057	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1847}	2025-11-10 20:32:37.059035
d7dca2bf-f14d-48f1-ba9c-067e02e0e143	982fd39c-bee6-4033-8da9-15c89169343b	a12e887d-2539-48d6-bff8-8a7be4b3f41f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:32:37.057	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:32:37.200282
d63ea004-7a5b-445d-b352-142c5e4f35dd	982fd39c-bee6-4033-8da9-15c89169343b	dc074cdb-075a-4fbe-ba39-304d140e8c5c	page_view	engagement	view	\N	240	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:33:49.359	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 240}	2025-11-10 20:33:49.360325
78d0c17b-02ed-4ff5-9e4a-79110e078a31	982fd39c-bee6-4033-8da9-15c89169343b	dc074cdb-075a-4fbe-ba39-304d140e8c5c	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:33:49.359	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 20:33:49.501471
b3f5311b-21b6-4efb-8cfc-6a566b51765f	\N	334f41eb-2f52-4dee-ad0b-5e922bb55e93	page_view	engagement	view	\N	882	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:34:32.858	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 882}	2025-11-10 20:34:32.859222
00e0fa1f-985e-4e7d-9e56-a2be7cbcf2d7	982fd39c-bee6-4033-8da9-15c89169343b	873b8d8a-a4a9-41ac-934e-5b0cfde54cd1	page_view	engagement	view	\N	1036	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:34:36.226	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1036}	2025-11-10 20:34:36.227261
8401347a-9edb-45bf-9f16-50e5b9b536dd	982fd39c-bee6-4033-8da9-15c89169343b	873b8d8a-a4a9-41ac-934e-5b0cfde54cd1	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:34:36.226	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:34:36.341451
613a598f-c991-4e6a-b248-4c88814d2e37	\N	7e03174f-e840-485d-b356-1f6b71a48508	page_view	engagement	view	\N	6	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:34:44.065	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 6}	2025-11-10 20:34:44.066279
99b6f6d6-14e9-4d20-93c8-58b7fc9e9a3b	982fd39c-bee6-4033-8da9-15c89169343b	945e5a9e-9272-4eb4-8d39-25bb455dc952	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:43:30.249	{"query": {}, "statusCode": 304}	2025-11-10 20:43:30.25009
90b3625c-a5fb-4714-a396-0aa1b584761a	982fd39c-bee6-4033-8da9-15c89169343b	945e5a9e-9272-4eb4-8d39-25bb455dc952	page_view	engagement	view	\N	157	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:43:30.249	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 157}	2025-11-10 20:43:30.249888
781d9acb-ac24-4b51-8562-b639a40b5765	982fd39c-bee6-4033-8da9-15c89169343b	1dc0e525-67df-4d30-8157-4a722f37ded2	page_view	engagement	view	\N	1168	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:43:31.254	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1168}	2025-11-10 20:43:31.256284
705d434e-9011-4547-9d70-c1a6b258934a	982fd39c-bee6-4033-8da9-15c89169343b	1dc0e525-67df-4d30-8157-4a722f37ded2	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:43:31.254	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:43:31.256765
bb167936-42be-479b-a6cd-a50fc0548ff4	982fd39c-bee6-4033-8da9-15c89169343b	1a6e0afe-5765-4c5f-92e7-4301d73f5c55	page_view	engagement	view	\N	17	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:43:38.067	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 17}	2025-11-10 20:43:38.067902
7551c3eb-bbb5-49f0-bedc-fe2477099022	982fd39c-bee6-4033-8da9-15c89169343b	6de5c6c2-f8e2-462d-8723-dd7b6f13479c	page_view	engagement	view	\N	1137	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:43:39.183	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1137}	2025-11-10 20:43:39.184568
7643fb71-167c-4331-83d7-ec9247f3792c	982fd39c-bee6-4033-8da9-15c89169343b	5190f94e-65a1-40a7-baa3-593b208b889a	page_view	engagement	view	\N	1075	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:44:00.826	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1075}	2025-11-10 20:44:00.8272
c98abdd4-2c38-4237-b6ea-fbf6c8b1159e	982fd39c-bee6-4033-8da9-15c89169343b	2b52482d-4821-466e-94c5-d2dd0b45ec57	page_view	engagement	view	\N	1030	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:44:08.993	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1030}	2025-11-10 20:44:08.99491
42c61d20-fe10-47e5-be7c-c8ca98de63c0	982fd39c-bee6-4033-8da9-15c89169343b	6de5c6c2-f8e2-462d-8723-dd7b6f13479c	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:43:39.183	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:43:39.18514
db4660fa-6c10-4293-8cdf-d19499e1dc5e	982fd39c-bee6-4033-8da9-15c89169343b	5190f94e-65a1-40a7-baa3-593b208b889a	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:44:00.826	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:44:00.827459
9ccbb1f3-046e-4e31-979d-9fb248e35b70	982fd39c-bee6-4033-8da9-15c89169343b	2b52482d-4821-466e-94c5-d2dd0b45ec57	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:44:08.993	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:44:08.99523
7256311e-c495-4412-ade2-cd401486b56d	\N	2d7310f4-bb15-4cb1-a0c1-d831018d6f3d	page_view	engagement	view	\N	850	/api/v1/auth/login	/login	\N	axios/1.13.2	::ffff:192.168.100.28	desktop	unknown	ios	\N	\N	2025-11-10 20:48:00.119	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 850}	2025-11-10 20:48:00.120204
384712c1-cd7d-4f80-9b6c-9543848c85b5	982fd39c-bee6-4033-8da9-15c89169343b	2fc809a4-845a-4ebb-b437-d57a64636fbf	page_view	engagement	view	\N	192	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:51:58.91	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 192}	2025-11-10 20:51:58.910815
3fb1a268-f7f4-4404-9b07-3fbec63c8397	982fd39c-bee6-4033-8da9-15c89169343b	2fc809a4-845a-4ebb-b437-d57a64636fbf	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:51:58.91	{"query": {}, "statusCode": 304}	2025-11-10 20:51:59.009934
524e63fa-4732-470a-81b5-1fe58d44481b	\N	1880a29b-1a11-4b3a-8fa0-68af1956cd1b	page_view	engagement	view	\N	953	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:52:33.073	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 953}	2025-11-10 20:52:33.074555
45b44886-7cd1-485f-a808-5c1e8160f285	982fd39c-bee6-4033-8da9-15c89169343b	bf0d3e74-960c-41ee-839b-eacfc7b29300	page_view	engagement	view	\N	73	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:52:33.342	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 73}	2025-11-10 20:52:33.343417
ea3607fe-31db-4bdb-9b91-d30855ee3b22	982fd39c-bee6-4033-8da9-15c89169343b	bf0d3e74-960c-41ee-839b-eacfc7b29300	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:52:33.342	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 20:52:33.477737
ee0c6807-370f-4a53-8556-3faba5e388b4	982fd39c-bee6-4033-8da9-15c89169343b	02ee1f5c-e3a8-4b7c-8ceb-ce1e943c1679	page_view	engagement	view	\N	1252	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:52:36.268	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1252}	2025-11-10 20:52:36.269818
c86319ff-f40f-4799-b97d-77ddabb04361	982fd39c-bee6-4033-8da9-15c89169343b	02ee1f5c-e3a8-4b7c-8ceb-ce1e943c1679	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:52:36.268	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:52:36.270085
fbec2ac5-fe66-490e-80ed-3d79c1b997ba	\N	dbec2969-8513-4c50-be8d-7b8c8deeb9c9	page_view	engagement	view	\N	2	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:54:42.489	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 20:54:42.609545
97ea8b8c-6bd5-46b3-9368-8f270f72b630	982fd39c-bee6-4033-8da9-15c89169343b	24a4cb76-9de5-463c-bf4e-de3c2ec62985	page_view	engagement	view	\N	1033	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:54:47.629	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1033}	2025-11-10 20:54:47.630008
9985d4da-ced4-473e-894c-609dea553a04	982fd39c-bee6-4033-8da9-15c89169343b	24a4cb76-9de5-463c-bf4e-de3c2ec62985	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:54:47.629	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:54:47.752005
7bd3acb8-6639-44cf-9fe7-9aff6054e3b0	982fd39c-bee6-4033-8da9-15c89169343b	41ec93b1-430c-46c3-b62e-4fdb8ab66fce	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:55:16.392	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:55:16.392838
eb7345a6-95af-4511-900f-c1d939c7ef7d	982fd39c-bee6-4033-8da9-15c89169343b	41ec93b1-430c-46c3-b62e-4fdb8ab66fce	page_view	engagement	view	\N	1033	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:55:16.392	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1033}	2025-11-10 20:55:16.392742
add58f85-766b-4988-b96c-43e11e5195c2	982fd39c-bee6-4033-8da9-15c89169343b	3afc7d29-b4bf-4533-ac4a-26e2cc152380	page_view	engagement	view	\N	1185	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 20:55:16.554	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1185}	2025-11-10 20:55:16.555607
88ef0a20-dcc0-4daf-b1a0-7d388fd6288d	982fd39c-bee6-4033-8da9-15c89169343b	3afc7d29-b4bf-4533-ac4a-26e2cc152380	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 20:55:16.554	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 20:55:16.555749
68432353-b057-40df-9613-834cee20f879	\N	4add155d-a52a-48d0-bd2b-7fd0cf2792fc	page_view	engagement	view	\N	9	/api/v1/users/notification-preferences	/api/v1/users/notification-preferences	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:05:06.975	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 9}	2025-11-10 21:05:06.97767
0d422c18-3daa-4638-ab91-5ea18b5d8d19	\N	940cc0b3-4be4-4016-9fd8-c436bab25370	page_view	engagement	view	\N	9	/api/v1/users/notification-preferences	/api/v1/users/notification-preferences	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:05:31.622	{"query": {}, "method": "PUT", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 9}	2025-11-10 21:05:31.623875
c468d248-ca13-4066-84dc-2e1b210d0b16	\N	4ae419da-03ba-4143-ae79-ffb4c8f4092a	page_view	engagement	view	\N	4	/api/v1/users/notification-preferences	/api/v1/users/notification-preferences	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:05:38.143	{"query": {}, "method": "PUT", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 21:05:38.144588
732c6a53-4be6-4c8d-9b43-df0c5ee50cd1	982fd39c-bee6-4033-8da9-15c89169343b	96f549a0-e4bb-44d0-9758-bad044114064	page_view	engagement	view	\N	1103	/api/v1/notifications/test	/test	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:05:41.437	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 1103}	2025-11-10 21:05:41.439351
439ebe25-aed4-46d8-b5b0-6caa19c37908	982fd39c-bee6-4033-8da9-15c89169343b	29e80b55-371e-43f2-8b40-becaffd67092	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:05:52.096	{"query": {}, "statusCode": 304}	2025-11-10 21:05:52.097391
46f5c9dd-97f6-43f1-8845-c0f38f27410f	982fd39c-bee6-4033-8da9-15c89169343b	96f549a0-e4bb-44d0-9758-bad044114064	api_interaction	engagement	post	\N	\N	/api/v1/notifications/test	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:05:41.438	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:05:41.584456
fc56c2e2-f515-463e-9c3d-6a21ce0a5e8a	982fd39c-bee6-4033-8da9-15c89169343b	29e80b55-371e-43f2-8b40-becaffd67092	page_view	engagement	view	\N	23	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:05:52.096	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 23}	2025-11-10 21:05:52.09728
81940aa5-2624-48eb-baa0-0ee7b5946804	\N	96e5589a-5646-4362-96b5-4e1178cc401e	page_view	engagement	view	\N	3	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:06:00.465	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 21:06:00.466703
d1a40119-ffc3-404d-8cf7-acf2e9c6e39e	\N	9d9e223a-29fc-48f8-a195-d67e9d13547a	page_view	engagement	view	\N	29	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:06:56.167	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 29}	2025-11-10 21:06:56.173456
d7b64a47-85a0-4fee-b2e9-cbac5e2452e3	\N	dcf0a439-784a-40e9-a061-6f9260dd6421	page_view	engagement	view	\N	1	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:09:03.611	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 1}	2025-11-10 21:09:03.72287
876d9094-672a-4791-a04d-70ba4714a4bc	\N	110753f8-a1b8-463b-ab60-994aa594fd93	page_view	engagement	view	\N	486	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:16:09.634	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 486}	2025-11-10 21:16:09.635377
84cde0fc-df2f-4381-98bd-bdb898c2664d	\N	66e15e11-0576-4ce2-9e9d-3a4486dc9366	page_view	engagement	view	\N	704	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:16:35.177	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 704}	2025-11-10 21:16:35.178637
a5459314-26e2-4c72-a687-872b5bc29b97	982fd39c-bee6-4033-8da9-15c89169343b	f34de5ce-aadb-4073-9b03-c04b9dc8f47a	page_view	engagement	view	\N	54	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:16:35.432	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 54}	2025-11-10 21:16:35.434347
f30ad423-9c01-4688-8dbb-2f390218e0ad	982fd39c-bee6-4033-8da9-15c89169343b	f34de5ce-aadb-4073-9b03-c04b9dc8f47a	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:16:35.432	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:16:35.65375
11613906-e097-43e2-bd7a-aa0a65d25c16	982fd39c-bee6-4033-8da9-15c89169343b	a4a2bf27-e1e6-4c16-b078-b02012ec6377	page_view	engagement	view	\N	1145	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:16:37.911	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1145}	2025-11-10 21:16:37.912687
9d42fa4b-e068-4ac0-afc1-77b440fa5388	982fd39c-bee6-4033-8da9-15c89169343b	a4a2bf27-e1e6-4c16-b078-b02012ec6377	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:16:37.911	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:16:37.91325
30f5a635-0d82-4c6a-a51a-a9ec105f49c8	982fd39c-bee6-4033-8da9-15c89169343b	27b0ee65-26f1-4fe1-aa36-c5eb67cc7942	page_view	engagement	view	\N	1154	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:16:52.682	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1154}	2025-11-10 21:16:52.683559
119568d8-a158-4897-88ed-cdc183cb5bf4	982fd39c-bee6-4033-8da9-15c89169343b	27b0ee65-26f1-4fe1-aa36-c5eb67cc7942	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:16:52.682	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:16:52.683766
094d025b-7958-442c-8230-9022654959a9	982fd39c-bee6-4033-8da9-15c89169343b	74cb0799-d695-44f8-bd1e-0cb1f016483e	page_view	engagement	view	\N	983	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:16:58.675	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 983}	2025-11-10 21:16:58.676522
cd3f1153-765a-41ad-80bb-6e2e503dd311	982fd39c-bee6-4033-8da9-15c89169343b	74cb0799-d695-44f8-bd1e-0cb1f016483e	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:16:58.675	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:16:58.676784
3e2da6be-6214-4128-b714-c3a87e5d22bc	\N	f019ad57-f67e-41ea-800e-0f50baf7647b	page_view	engagement	view	\N	5	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:18:59.058	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 5}	2025-11-10 21:18:59.204359
f6fd7fa6-f004-4320-b1ed-37081aef95fe	982fd39c-bee6-4033-8da9-15c89169343b	93292676-1395-4993-b7e5-ee02c176819d	page_view	engagement	view	\N	193	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:22:27.63	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 193}	2025-11-10 21:22:27.631094
8d34eecc-1207-4582-9787-45493815d035	982fd39c-bee6-4033-8da9-15c89169343b	93292676-1395-4993-b7e5-ee02c176819d	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:22:27.63	{"query": {}, "statusCode": 304}	2025-11-10 21:22:27.807879
f732daef-02d9-4995-8962-748db760d489	982fd39c-bee6-4033-8da9-15c89169343b	6a80456f-b844-4190-b75f-190d32184b6d	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:24:26.961	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:24:26.962596
6b129698-e4f7-4959-8c4f-9ac5c9efa734	982fd39c-bee6-4033-8da9-15c89169343b	6a80456f-b844-4190-b75f-190d32184b6d	page_view	engagement	view	\N	1680	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:24:26.961	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1680}	2025-11-10 21:24:26.96252
337b40e6-41da-4daf-918e-7f8667272f0f	982fd39c-bee6-4033-8da9-15c89169343b	fac664bb-e334-4521-8fb7-df05f9972ce0	page_view	engagement	view	\N	1840	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:24:27.134	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1840}	2025-11-10 21:24:27.136479
4aef7483-9e44-4fa5-9aba-3655cf8941e0	982fd39c-bee6-4033-8da9-15c89169343b	fac664bb-e334-4521-8fb7-df05f9972ce0	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:24:27.134	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:24:27.13679
8d4beb28-0666-4a54-9b8e-e0b5183b3e98	982fd39c-bee6-4033-8da9-15c89169343b	207ffed6-dfae-4819-bdb0-2b7d19a8b28f	page_view	engagement	view	\N	1846	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:24:27.135	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1846}	2025-11-10 21:24:27.137174
fffda35e-edba-4abf-9aca-77a6ac42e455	982fd39c-bee6-4033-8da9-15c89169343b	207ffed6-dfae-4819-bdb0-2b7d19a8b28f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:24:27.135	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:24:27.13726
26e3cc8f-d228-46da-bbf8-44dc551c45f6	\N	e9af30d6-95bc-46f0-9ee3-a28d75580b80	page_view	engagement	view	\N	15	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:33:16.156	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 15}	2025-11-10 21:33:16.295984
0f9516df-0025-48c0-81b3-95ed138e2d3c	\N	6a014f98-54e3-4984-8426-b6f502f17569	page_view	engagement	view	\N	2	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:39:44.679	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 2}	2025-11-10 21:39:44.899574
d544d0d9-cbbb-4c33-989f-255ff002a1eb	\N	8ddcd59d-3346-4b47-811c-fe1ce795d179	page_view	engagement	view	\N	5	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:41:55.093	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 5}	2025-11-10 21:41:55.228559
ae5c3c19-cecf-497f-99aa-68192a296379	\N	1c8785a9-0548-4367-ae58-02bd44ffe62f	page_view	engagement	view	\N	2	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:42:53.462	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 2}	2025-11-10 21:42:53.601592
36ea6cb1-3261-4235-b7ca-6a0efd8bae83	\N	08d8593c-ac4b-4b96-baf5-2fd5723cc36a	page_view	engagement	view	\N	672	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:50:24.608	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 672}	2025-11-10 21:50:24.608991
e4c587b8-247b-4ec4-b148-6395950652e9	982fd39c-bee6-4033-8da9-15c89169343b	9293c533-325a-4f1b-bb73-6b18deec2822	page_view	engagement	view	\N	40	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:50:24.871	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 40}	2025-11-10 21:50:24.872504
d105e34b-3850-4cd8-839f-6368b6296a7b	982fd39c-bee6-4033-8da9-15c89169343b	9e7091a4-4df8-46f5-b71b-bf2c062a85e7	page_view	engagement	view	\N	34	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:50:24.877	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 34}	2025-11-10 21:50:24.877673
bf1e22e2-7beb-49dc-a79c-e3ed5228b8d0	982fd39c-bee6-4033-8da9-15c89169343b	9293c533-325a-4f1b-bb73-6b18deec2822	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:50:24.871	{"query": {}, "statusCode": 304}	2025-11-10 21:50:25.023802
2cf7c468-f2e1-4942-acc1-cde992ef4e4d	982fd39c-bee6-4033-8da9-15c89169343b	9e7091a4-4df8-46f5-b71b-bf2c062a85e7	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:50:24.877	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:50:25.02906
2e0652a3-f3ab-41e8-bdd5-8c1823548771	982fd39c-bee6-4033-8da9-15c89169343b	714acae8-d9ea-461c-94fe-4ee86e979124	page_view	engagement	view	\N	27	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:50:25.694	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 27}	2025-11-10 21:50:25.69555
6740132e-9b0d-4478-8e1f-46eafea3734a	982fd39c-bee6-4033-8da9-15c89169343b	714acae8-d9ea-461c-94fe-4ee86e979124	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:50:25.694	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:50:25.695697
f8060ee4-72d1-4adb-9b1b-348303819cc6	982fd39c-bee6-4033-8da9-15c89169343b	6fe56797-ffc6-41e7-aaea-46429a0d0f6c	page_view	engagement	view	\N	1037	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:50:28.074	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1037}	2025-11-10 21:50:28.075523
d5027007-a530-41cf-8cad-f4677ac2ee21	982fd39c-bee6-4033-8da9-15c89169343b	6fe56797-ffc6-41e7-aaea-46429a0d0f6c	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:50:28.074	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:50:28.075729
26e992a1-7d97-4cfb-bca4-214b6dd96728	982fd39c-bee6-4033-8da9-15c89169343b	c0f62a05-37dd-4b5a-9b71-6320af1a2867	page_view	engagement	view	\N	1079	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:50:52.178	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1079}	2025-11-10 21:50:52.179591
6043a8b3-7f14-4600-8de8-0500887a81a0	982fd39c-bee6-4033-8da9-15c89169343b	c0f62a05-37dd-4b5a-9b71-6320af1a2867	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:50:52.178	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:50:52.180206
9a8cd340-88a0-4ddf-9db5-c2dc17e9acd8	982fd39c-bee6-4033-8da9-15c89169343b	40dba7d3-3bc6-4aed-9717-e8912106a336	page_view	engagement	view	\N	985	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:51:05.041	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 985}	2025-11-10 21:51:05.042627
4add03d9-3023-4dad-9817-cb7edd384c88	982fd39c-bee6-4033-8da9-15c89169343b	40dba7d3-3bc6-4aed-9717-e8912106a336	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:51:05.041	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:51:05.04403
c77d003b-741c-4760-8d63-db141e9e10a8	982fd39c-bee6-4033-8da9-15c89169343b	90cf4991-8fee-43d0-95c6-a0dcdb0bf3fb	page_view	engagement	view	\N	170	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:53:32.457	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 170}	2025-11-10 21:53:32.458402
162c394b-1766-4baa-a9f0-ac61523d6523	982fd39c-bee6-4033-8da9-15c89169343b	d079cb11-854b-4228-9fc3-9322f2a2b383	page_view	engagement	view	\N	167	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:53:32.462	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 167}	2025-11-10 21:53:32.462844
b64d5b0c-a2b7-416d-a01a-f3fecf0f0e06	982fd39c-bee6-4033-8da9-15c89169343b	90cf4991-8fee-43d0-95c6-a0dcdb0bf3fb	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:53:32.457	{"query": {}, "statusCode": 304}	2025-11-10 21:53:32.53561
e76a8ea8-08f4-4011-9a1d-449c9796b385	982fd39c-bee6-4033-8da9-15c89169343b	d079cb11-854b-4228-9fc3-9322f2a2b383	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:53:32.462	{"query": {}, "statusCode": 304}	2025-11-10 21:53:32.538196
24b9fe58-adc3-44b0-8485-44ea7ea3cfa1	\N	d0501255-a8ff-4494-be60-7325065c0ceb	page_view	engagement	view	\N	621	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:53:58.355	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 621}	2025-11-10 21:53:58.356274
35541019-902d-469f-b3e6-355e78901659	982fd39c-bee6-4033-8da9-15c89169343b	a1b5b3a2-3ee3-44b1-8d7f-1adb1fe7a179	page_view	engagement	view	\N	32	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:53:59.875	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 32}	2025-11-10 21:53:59.875973
cd686f9b-5748-4f19-af9b-0c0528ca5546	982fd39c-bee6-4033-8da9-15c89169343b	6fa19e29-c6d3-4609-b6f1-85e8d4528600	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:54:02.298	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:54:02.298675
ebeb4f11-b8ce-4160-a1cb-bee154483a27	982fd39c-bee6-4033-8da9-15c89169343b	cfdf92a0-e266-4d56-9a1c-8139d6ca6e6a	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:54:08.588	{"query": {}, "statusCode": 304}	2025-11-10 21:54:08.589256
102dabb9-6bf7-4db7-a9bd-8dcff273cdc6	982fd39c-bee6-4033-8da9-15c89169343b	180a9078-fde4-4179-95b5-1fc50cf5dff0	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:54:27.187	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:54:27.187904
adb44955-b477-4016-96e7-7c59522ac4ff	982fd39c-bee6-4033-8da9-15c89169343b	a1b5b3a2-3ee3-44b1-8d7f-1adb1fe7a179	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:53:59.875	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:53:59.876174
7a409411-bf90-4ece-a022-a5dd4478aab8	982fd39c-bee6-4033-8da9-15c89169343b	6fa19e29-c6d3-4609-b6f1-85e8d4528600	page_view	engagement	view	\N	1528	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:54:02.298	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1528}	2025-11-10 21:54:02.298621
811fffb7-713f-46f8-bfdb-0827512d4500	982fd39c-bee6-4033-8da9-15c89169343b	cfdf92a0-e266-4d56-9a1c-8139d6ca6e6a	page_view	engagement	view	\N	19	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:54:08.588	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 19}	2025-11-10 21:54:08.589145
b415dd61-686a-419f-bdb7-3b9f464b015a	982fd39c-bee6-4033-8da9-15c89169343b	180a9078-fde4-4179-95b5-1fc50cf5dff0	page_view	engagement	view	\N	970	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:54:27.187	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 970}	2025-11-10 21:54:27.18778
2823f213-cdcc-4304-81c5-0bc051d41686	982fd39c-bee6-4033-8da9-15c89169343b	bc329bcb-6559-4f2f-b93f-5ebceb3a654b	page_view	engagement	view	\N	12	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:54:38.241	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 12}	2025-11-10 21:54:38.242732
8f18db66-90fd-4c08-979b-4ceeff90881f	982fd39c-bee6-4033-8da9-15c89169343b	bc329bcb-6559-4f2f-b93f-5ebceb3a654b	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:54:38.241	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:54:38.243267
2bb8a912-a027-4302-8c00-d92f4afc9763	982fd39c-bee6-4033-8da9-15c89169343b	5675dd04-892d-4a98-920f-fba59a8b2478	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:54:45.112	{"query": {}, "statusCode": 304}	2025-11-10 21:54:45.113713
849eb66b-ce18-412a-83e3-993e26ff18c2	982fd39c-bee6-4033-8da9-15c89169343b	5675dd04-892d-4a98-920f-fba59a8b2478	page_view	engagement	view	\N	9	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:54:45.112	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 9}	2025-11-10 21:54:45.113513
870cd33a-0875-465f-abdf-ca071c0d557d	\N	2a42be9b-cf02-488b-bc9c-2b460fa86f83	page_view	engagement	view	\N	5	/api/v1/users/notification-preferences	/api/v1/users/notification-preferences	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:55:50.283	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 5}	2025-11-10 21:55:50.425652
e4f8892d-12bb-4fca-bde6-52d6f20673d2	982fd39c-bee6-4033-8da9-15c89169343b	04ba1e96-3719-4e62-aa1a-c7f683f2aa61	page_view	engagement	view	\N	16	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:56:12.641	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 16}	2025-11-10 21:56:12.642363
08aa3e91-4770-49d0-8703-384b513d6009	982fd39c-bee6-4033-8da9-15c89169343b	04ba1e96-3719-4e62-aa1a-c7f683f2aa61	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:56:12.641	{"query": {}, "statusCode": 304}	2025-11-10 21:56:12.849737
56cfc617-cbe4-4f54-95cf-75fcd475e835	982fd39c-bee6-4033-8da9-15c89169343b	3a446686-792a-436f-aef7-e949a614c54e	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:56:12.867	{"query": {}, "statusCode": 304}	2025-11-10 21:56:12.868873
0789e8db-ef3a-4782-b1a2-c863598f695e	982fd39c-bee6-4033-8da9-15c89169343b	3a446686-792a-436f-aef7-e949a614c54e	page_view	engagement	view	\N	239	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:56:12.867	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 239}	2025-11-10 21:56:12.868688
76ec3c65-49b1-46ab-8a05-4a41147a6e2e	\N	5e1af7e4-1e32-402e-af4f-2cb15e0d2387	page_view	engagement	view	\N	627	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:56:27.149	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 627}	2025-11-10 21:56:27.150063
d476f684-4b9b-44d0-aa73-ea6c9ac7bb84	982fd39c-bee6-4033-8da9-15c89169343b	0bb905f4-c1e2-4f80-88e8-80b665bff1e7	page_view	engagement	view	\N	11	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:56:27.942	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 11}	2025-11-10 21:56:27.942511
cf2ea8c3-1b43-4148-972f-ffd0a7cb10aa	982fd39c-bee6-4033-8da9-15c89169343b	0bb905f4-c1e2-4f80-88e8-80b665bff1e7	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:56:27.942	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 21:56:27.942519
d4bb6326-f55c-432b-b4ba-f0786adc3968	982fd39c-bee6-4033-8da9-15c89169343b	e8f4d682-070c-464f-be8a-4d0c6d0d2e21	page_view	engagement	view	\N	985	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:56:29.951	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 985}	2025-11-10 21:56:29.95167
164db053-a38f-4125-a659-1e0087da981a	982fd39c-bee6-4033-8da9-15c89169343b	e8f4d682-070c-464f-be8a-4d0c6d0d2e21	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:56:29.951	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:56:29.951772
a0b3f4ec-4263-4470-aa43-52e73209fa38	982fd39c-bee6-4033-8da9-15c89169343b	5c2da2bc-136d-45f5-90a1-094ee667aa32	page_view	engagement	view	\N	1137	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:57:36.719	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1137}	2025-11-10 21:57:36.720574
d99069e3-fa7b-41d1-acbc-07c33c62b4dc	982fd39c-bee6-4033-8da9-15c89169343b	5c2da2bc-136d-45f5-90a1-094ee667aa32	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:57:36.719	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 21:57:36.867288
b1ed46f6-45ae-44e8-88d2-eb4fc45838db	\N	77ba4781-8b7d-430a-8b39-1d8fcfb1fdf3	page_view	engagement	view	\N	786	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:59:58.971	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 786}	2025-11-10 21:59:58.971996
7c32c9c7-43e6-40cb-b57b-9636bbe6108b	982fd39c-bee6-4033-8da9-15c89169343b	84303d65-6905-4ef7-8090-d5fbe56374d5	page_view	engagement	view	\N	13	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 21:59:59.597	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 13}	2025-11-10 21:59:59.597834
1704a0cc-11e8-47ee-bbbd-0e63f93cd8e2	982fd39c-bee6-4033-8da9-15c89169343b	84303d65-6905-4ef7-8090-d5fbe56374d5	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 21:59:59.597	{"query": {}, "statusCode": 304}	2025-11-10 21:59:59.688467
7702b491-e9bd-4b4e-b0ac-2a8342c1e872	982fd39c-bee6-4033-8da9-15c89169343b	4cc1deda-f112-478a-ad24-425685927d9b	page_view	engagement	view	\N	10	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:00:00.06	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 10}	2025-11-10 22:00:00.060947
408da579-b570-459e-a2db-a87f4566293e	982fd39c-bee6-4033-8da9-15c89169343b	46658c1d-919e-482f-b559-83036752b3fb	page_view	engagement	view	\N	23	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:00:00.068	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 23}	2025-11-10 22:00:00.069596
47655af3-bb9c-4015-b61f-7458b9e01207	982fd39c-bee6-4033-8da9-15c89169343b	46658c1d-919e-482f-b559-83036752b3fb	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:00:00.068	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:00:00.070047
ba638169-eb88-429c-a8f8-df59430656d6	982fd39c-bee6-4033-8da9-15c89169343b	4cc1deda-f112-478a-ad24-425685927d9b	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:00:00.06	{"query": {}, "statusCode": 304}	2025-11-10 22:00:00.164697
c37a9de7-6e40-48a1-b229-befe609f95c9	982fd39c-bee6-4033-8da9-15c89169343b	bb83b250-4cc3-4be9-99a5-804516f87164	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:00:03.582	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:00:03.583147
eabec893-00cf-45c8-b852-334d0bd53ec1	982fd39c-bee6-4033-8da9-15c89169343b	bb83b250-4cc3-4be9-99a5-804516f87164	page_view	engagement	view	\N	2152	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:00:03.582	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 2152}	2025-11-10 22:00:03.583119
e3cc390e-0346-48c5-b85c-348a8c45fdd3	982fd39c-bee6-4033-8da9-15c89169343b	56ac079e-c70c-4c79-9cbf-21eb44eef9b3	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:00:33.38	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:00:33.381315
8fb46db1-a17e-4be3-a5ae-180c17e9df2b	982fd39c-bee6-4033-8da9-15c89169343b	56ac079e-c70c-4c79-9cbf-21eb44eef9b3	page_view	engagement	view	\N	1283	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:00:33.38	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1283}	2025-11-10 22:00:33.38123
4d4eae98-5910-46c7-9d3d-ce2663d90279	982fd39c-bee6-4033-8da9-15c89169343b	5e30cc31-c606-4556-b88f-aad422ddd0cf	page_view	engagement	view	\N	1033	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:00:43.652	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1033}	2025-11-10 22:00:43.652752
23a65f0a-4630-43eb-b911-5bc4320dc70d	982fd39c-bee6-4033-8da9-15c89169343b	5e30cc31-c606-4556-b88f-aad422ddd0cf	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:00:43.652	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:00:43.652975
3d939374-bdac-46b7-b167-b2b8b34b71f8	982fd39c-bee6-4033-8da9-15c89169343b	40a87040-1469-469c-a161-3aef104f6d16	page_view	engagement	view	\N	138	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:08:03.285	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 138}	2025-11-10 22:08:03.286147
b86edcbc-f120-41f0-a980-298ea4a379a6	982fd39c-bee6-4033-8da9-15c89169343b	40a87040-1469-469c-a161-3aef104f6d16	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:08:03.285	{"query": {}, "statusCode": 304}	2025-11-10 22:08:03.360315
dd62f2e5-763b-411c-b267-84a38f8c10cb	982fd39c-bee6-4033-8da9-15c89169343b	267e80e1-fe4b-4d05-ad7e-df510319a8a0	page_view	engagement	view	\N	158	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:09:14.242	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 158}	2025-11-10 22:09:14.243732
f518f796-de07-4085-b7cf-2789ef797b84	982fd39c-bee6-4033-8da9-15c89169343b	18f13f18-90cc-4d10-ad04-2642958d852e	page_view	engagement	view	\N	160	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:09:14.246	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 160}	2025-11-10 22:09:14.247001
e264a07b-f3eb-4eb6-a55a-2a92bec7e323	982fd39c-bee6-4033-8da9-15c89169343b	267e80e1-fe4b-4d05-ad7e-df510319a8a0	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:09:14.243	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:09:14.326565
e6f3c885-52b1-4a27-a1db-06b5e7c6a8d0	982fd39c-bee6-4033-8da9-15c89169343b	18f13f18-90cc-4d10-ad04-2642958d852e	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:09:14.246	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:09:14.347439
c0e60926-1637-43fb-9ae7-99be88cc4a97	982fd39c-bee6-4033-8da9-15c89169343b	2e756901-842c-42e1-abc8-860103664d97	page_view	engagement	view	\N	563	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:15.067	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 563}	2025-11-10 22:23:15.068515
4a738ab6-7fb0-48d9-8945-dde8216d1a95	982fd39c-bee6-4033-8da9-15c89169343b	44173100-3a8a-4ea7-a662-afa696f49b42	page_view	engagement	view	\N	512	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:15.044	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 512}	2025-11-10 22:23:15.047378
89778c7d-4601-474c-b4ba-1524ff3ff176	982fd39c-bee6-4033-8da9-15c89169343b	44173100-3a8a-4ea7-a662-afa696f49b42	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:23:15.045	{"query": {}, "statusCode": 304}	2025-11-10 22:23:15.203099
e7fd9cd0-cfa1-41f7-8e4c-8e9d8023f8bd	982fd39c-bee6-4033-8da9-15c89169343b	2e756901-842c-42e1-abc8-860103664d97	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:23:15.067	{"query": {}, "statusCode": 304}	2025-11-10 22:23:15.210457
15ff372f-421d-4af1-bf1c-cd2125b9ca25	\N	2b5d0338-973a-4699-935d-684a6f2b683e	page_view	engagement	view	\N	754	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:40.673	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 754}	2025-11-10 22:23:40.674101
6f6ef450-b61b-4aa7-807f-7cb9c58c91e7	982fd39c-bee6-4033-8da9-15c89169343b	eb1430e6-a0bb-4b5b-924e-92a148619226	page_view	engagement	view	\N	53	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:41.49	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 53}	2025-11-10 22:23:41.492337
e53a739f-2f41-4001-99ae-33dc93dbc442	982fd39c-bee6-4033-8da9-15c89169343b	eb1430e6-a0bb-4b5b-924e-92a148619226	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:23:41.491	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:23:41.492772
a6a0146b-e3a6-4f67-be0e-138061ecbdf3	982fd39c-bee6-4033-8da9-15c89169343b	cfb6026a-cfac-4d13-9900-880d3862ac20	page_view	engagement	view	\N	3128	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:46.099	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 3128}	2025-11-10 22:23:46.10035
e345716d-2c4d-44a2-bc1d-a646885d647c	982fd39c-bee6-4033-8da9-15c89169343b	cfb6026a-cfac-4d13-9900-880d3862ac20	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:23:46.099	{"query": {"page": "1", "limit": "20"}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:23:46.100454
1d756be3-e80d-4c60-a808-483845e3a9a8	982fd39c-bee6-4033-8da9-15c89169343b	7b5f54ff-9ae1-4fc6-b1af-d0e6ca070c25	page_view	engagement	view	\N	35	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:47.725	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 35}	2025-11-10 22:23:47.72579
5d375a88-7a60-467c-8c58-db0d8d8d198f	982fd39c-bee6-4033-8da9-15c89169343b	7b5f54ff-9ae1-4fc6-b1af-d0e6ca070c25	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:23:47.725	{"query": {}, "statusCode": 304}	2025-11-10 22:23:47.7264
7ae415dd-7f01-4b81-b9a2-4e0d57718323	982fd39c-bee6-4033-8da9-15c89169343b	411c80ce-0272-415a-9c15-4a7573910237	page_view	engagement	view	\N	1075	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:23:52.69	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1075}	2025-11-10 22:23:52.691588
1cf43171-9171-4b7e-b0a0-f47dad13f206	982fd39c-bee6-4033-8da9-15c89169343b	411c80ce-0272-415a-9c15-4a7573910237	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:23:52.69	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:23:52.691649
72a6569e-cdcf-495d-9134-70abe221d058	982fd39c-bee6-4033-8da9-15c89169343b	e7ccab71-5a9e-42d0-87fd-7a264dbc2567	page_view	engagement	view	\N	147	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:24:23.814	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 147}	2025-11-10 22:24:23.815425
e4de62e9-b57c-428c-b180-af91d45483c8	982fd39c-bee6-4033-8da9-15c89169343b	e7ccab71-5a9e-42d0-87fd-7a264dbc2567	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:24:23.814	{"query": {}, "statusCode": 304}	2025-11-10 22:24:23.908607
c12232da-282a-47f3-b9a0-17631d7eb349	\N	aa69a99b-c238-419d-ac25-c431d72fb3ab	page_view	engagement	view	\N	5	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:24:32.34	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 5}	2025-11-10 22:24:32.340992
9d3c8629-9d27-4090-b561-0e69ad0fa147	982fd39c-bee6-4033-8da9-15c89169343b	55227141-54d4-4412-9eb7-082405a9e9d1	page_view	engagement	view	\N	1079	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:24:53.219	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1079}	2025-11-10 22:24:53.220262
9a421327-e4c9-4290-ac19-61d401e0ec18	982fd39c-bee6-4033-8da9-15c89169343b	55227141-54d4-4412-9eb7-082405a9e9d1	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:24:53.219	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:24:53.220412
1c084f18-03a9-448d-87b0-1b453053ea54	\N	c9a1273e-0991-4679-8359-1e42fae24591	page_view	engagement	view	\N	770	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:25:16.158	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 770}	2025-11-10 22:25:16.159531
4202fd72-9eb3-483b-885c-f8d11d99e483	982fd39c-bee6-4033-8da9-15c89169343b	ab50a951-820c-481d-9373-79ce71cc873c	page_view	engagement	view	\N	6	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:25:16.926	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 6}	2025-11-10 22:25:16.927612
efb7dbf7-da99-431e-9248-2c1c9b9e59e7	982fd39c-bee6-4033-8da9-15c89169343b	c6b5e565-7ed0-40e3-9fdd-a36dce0df8ab	page_view	engagement	view	\N	17	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:25:16.932	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 17}	2025-11-10 22:25:16.933468
0d792bc9-e4ba-46d9-8ca9-3b0891aabb3d	982fd39c-bee6-4033-8da9-15c89169343b	ab50a951-820c-481d-9373-79ce71cc873c	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:25:16.926	{"query": {}, "statusCode": 304}	2025-11-10 22:25:17.06087
6c00eb9c-17ad-4b52-9390-bddf94b9268a	982fd39c-bee6-4033-8da9-15c89169343b	c6b5e565-7ed0-40e3-9fdd-a36dce0df8ab	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:25:16.932	{"query": {}, "statusCode": 304}	2025-11-10 22:25:17.091983
8d676205-008e-40f1-890e-d2821b8e2ecc	982fd39c-bee6-4033-8da9-15c89169343b	79f29fe9-120a-4445-a9fb-5273da4e05b4	page_view	engagement	view	\N	20	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:25:17.191	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 20}	2025-11-10 22:25:17.191801
c0d95911-bf2c-441e-acf9-cf3ce967d665	982fd39c-bee6-4033-8da9-15c89169343b	79f29fe9-120a-4445-a9fb-5273da4e05b4	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:25:17.191	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:25:17.192037
04df82be-8ee9-4b47-8fb3-4d06a6e63577	982fd39c-bee6-4033-8da9-15c89169343b	cd5b21b6-45d2-40e1-bc1e-52fcb9e7c9ed	page_view	engagement	view	\N	1081	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:25:19.228	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1081}	2025-11-10 22:25:19.229279
51ba08b4-295e-408b-8162-63ffd123b35d	982fd39c-bee6-4033-8da9-15c89169343b	cd5b21b6-45d2-40e1-bc1e-52fcb9e7c9ed	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:25:19.228	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:25:19.229494
26bae7a4-e7f8-4d88-b37c-6bcf69ef98e1	\N	6c2fdbba-0dc3-4fef-a42e-bf6e281acf6a	page_view	engagement	view	\N	4	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:25:23.231	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 22:25:23.23262
e15e2383-3377-4aa1-8a46-946f731270f7	982fd39c-bee6-4033-8da9-15c89169343b	4701cc9c-2f87-4497-a17a-63def13d40ec	page_view	engagement	view	\N	433	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:26:05.333	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 433}	2025-11-10 22:26:05.333881
455be494-0642-4174-8031-ed19bc9722db	982fd39c-bee6-4033-8da9-15c89169343b	4701cc9c-2f87-4497-a17a-63def13d40ec	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:26:05.333	{"query": {}, "statusCode": 304}	2025-11-10 22:26:05.427269
733f8ae4-6917-43eb-a8cd-49a7556492ae	982fd39c-bee6-4033-8da9-15c89169343b	3f68f519-6b16-409f-9e6e-684cb9a4ad03	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:26:19.545	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:26:19.545892
e403bc78-950c-41d5-92d5-c13be279eeac	982fd39c-bee6-4033-8da9-15c89169343b	3f68f519-6b16-409f-9e6e-684cb9a4ad03	page_view	engagement	view	\N	1086	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:26:19.545	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1086}	2025-11-10 22:26:19.545777
f3e454d3-f712-47b1-8185-4b9aaec13002	982fd39c-bee6-4033-8da9-15c89169343b	dbc9e8f2-4608-44af-b393-eb5cf1de66e1	page_view	engagement	view	\N	112	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:27:00.565	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 112}	2025-11-10 22:27:00.566347
cda3dc1b-f96a-4805-aa12-7a946abe85b1	982fd39c-bee6-4033-8da9-15c89169343b	0dfa763c-4613-46df-a0b7-77f1f6d1a47e	page_view	engagement	view	\N	113	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:27:00.571	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 113}	2025-11-10 22:27:00.571947
89c1c286-fe59-40f5-9c59-1b8832d7ae46	982fd39c-bee6-4033-8da9-15c89169343b	dbc9e8f2-4608-44af-b393-eb5cf1de66e1	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:27:00.565	{"query": {}, "statusCode": 304}	2025-11-10 22:27:00.654091
40f25f82-6115-42a4-9667-3d0917ea39db	982fd39c-bee6-4033-8da9-15c89169343b	0dfa763c-4613-46df-a0b7-77f1f6d1a47e	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:27:00.571	{"query": {}, "statusCode": 304}	2025-11-10 22:27:00.664437
8002a396-a49b-4e03-9b77-69af0d61ed5a	\N	213a23a7-2aa7-45d6-8366-8eb5cef21af3	page_view	engagement	view	\N	670	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:27:15.005	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 670}	2025-11-10 22:27:15.006293
3cffa135-ec9b-4b79-9449-f88b475abb5b	982fd39c-bee6-4033-8da9-15c89169343b	3b01adaa-82f4-42fe-b5fe-7d4748d18f1d	page_view	engagement	view	\N	50	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:27:15.782	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 50}	2025-11-10 22:27:15.782708
fd324eb6-7d33-4631-a8bf-1c3f07106f81	982fd39c-bee6-4033-8da9-15c89169343b	84d3ee75-dedc-45ae-b70d-a276eee890d6	page_view	engagement	view	\N	1078	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:27:17.855	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1078}	2025-11-10 22:27:17.857114
c465682a-4037-44aa-9346-8e3a163950b5	982fd39c-bee6-4033-8da9-15c89169343b	74bdfd66-7d7e-4be7-b2f0-ed2a939c6b1e	page_view	engagement	view	\N	1065	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:27:30.036	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1065}	2025-11-10 22:27:30.036853
a018ecfa-b8a1-4581-a819-37b5a58e53a8	982fd39c-bee6-4033-8da9-15c89169343b	3b01adaa-82f4-42fe-b5fe-7d4748d18f1d	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:27:15.782	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:27:15.782964
6aa970d8-aa61-4349-9cff-4432b66081cc	982fd39c-bee6-4033-8da9-15c89169343b	84d3ee75-dedc-45ae-b70d-a276eee890d6	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:27:17.855	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:27:17.85728
730a57b1-21f5-4e4c-a793-1f9316ff15b1	982fd39c-bee6-4033-8da9-15c89169343b	74bdfd66-7d7e-4be7-b2f0-ed2a939c6b1e	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:27:30.036	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:27:30.036958
ac8f38e8-e07d-4bf3-ab39-ad880b72ea64	982fd39c-bee6-4033-8da9-15c89169343b	cea512aa-f001-4bc7-942b-7d2f827bff3c	page_view	engagement	view	\N	1537	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:29:56.533	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1537}	2025-11-10 22:29:56.534964
1a097c2e-4b65-46b3-ada0-e59d28088a6a	982fd39c-bee6-4033-8da9-15c89169343b	cea512aa-f001-4bc7-942b-7d2f827bff3c	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:29:56.533	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:29:56.721397
bcabd8b4-c036-4eff-bd6d-fa496b50bfd5	982fd39c-bee6-4033-8da9-15c89169343b	c8e9ba71-6b53-417e-bf36-2f46010d997c	page_view	engagement	view	\N	112	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:30:39.759	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 112}	2025-11-10 22:30:39.760811
2641e56d-fa22-4a49-b2d9-080f1110c0b3	982fd39c-bee6-4033-8da9-15c89169343b	c8e9ba71-6b53-417e-bf36-2f46010d997c	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:30:39.759	{"query": {}, "statusCode": 304}	2025-11-10 22:30:39.876939
0df5ab66-5838-4bf5-890d-5cbb6db11494	982fd39c-bee6-4033-8da9-15c89169343b	c799fac0-0069-473d-8fde-865b0a1ff014	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:32:10.218	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:32:10.329014
e12a5f56-6352-47e5-8868-5058cdbb8be0	982fd39c-bee6-4033-8da9-15c89169343b	c799fac0-0069-473d-8fde-865b0a1ff014	page_view	engagement	view	\N	414	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:32:10.215	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 414}	2025-11-10 22:32:10.333386
c339490e-c65c-4fb1-bf8d-0f5479ca2fd2	982fd39c-bee6-4033-8da9-15c89169343b	bf349c77-657a-4a99-a4de-0cc4d68746be	page_view	engagement	view	\N	511	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:38:18.097	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 511}	2025-11-10 22:38:18.098527
f7e3a20a-9150-4acf-a0e9-272bbc134d1f	982fd39c-bee6-4033-8da9-15c89169343b	2b82ef54-6f9d-443c-91bc-2629c8b6982a	page_view	engagement	view	\N	520	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:38:18.104	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 520}	2025-11-10 22:38:18.105531
e5d79635-672a-42b8-8435-b63b33c9b8a0	982fd39c-bee6-4033-8da9-15c89169343b	bf349c77-657a-4a99-a4de-0cc4d68746be	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:38:18.097	{"query": {}, "statusCode": 304}	2025-11-10 22:38:18.472072
b909c5b4-d7ba-49bf-ad62-5cc5ff0633e3	982fd39c-bee6-4033-8da9-15c89169343b	2b82ef54-6f9d-443c-91bc-2629c8b6982a	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:38:18.105	{"query": {}, "statusCode": 304}	2025-11-10 22:38:18.487686
94af3571-b9c4-475e-9202-e58e19ecefac	\N	b16ea006-4c42-48a0-ba00-78434f56a965	page_view	engagement	view	\N	624	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:38:39.298	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 624}	2025-11-10 22:38:39.299403
714c794a-7dc3-4923-a465-4c5a814fdc44	982fd39c-bee6-4033-8da9-15c89169343b	2703dfde-c8e3-44b8-8ee6-9ff321f40c49	page_view	engagement	view	\N	33	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:38:39.828	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 33}	2025-11-10 22:38:39.82948
2ef9f458-4ba2-43e7-8e54-3d1b21e3ba2e	982fd39c-bee6-4033-8da9-15c89169343b	2703dfde-c8e3-44b8-8ee6-9ff321f40c49	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:38:39.828	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:38:39.829737
6bc153b3-e9c6-4a5b-ba64-df6fa6845aed	982fd39c-bee6-4033-8da9-15c89169343b	96df2ff4-97d9-421a-b11b-42d8801ec00f	page_view	engagement	view	\N	1069	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:38:42.203	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1069}	2025-11-10 22:38:42.204406
b68b1d94-1ebd-446a-bf70-d22fca3ecec9	982fd39c-bee6-4033-8da9-15c89169343b	96df2ff4-97d9-421a-b11b-42d8801ec00f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:38:42.203	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:38:42.204491
3c13c136-fb84-495d-8ef5-136a90fe0148	982fd39c-bee6-4033-8da9-15c89169343b	8eab14bc-6cff-412f-a7e5-b630e2e2d05f	page_view	engagement	view	\N	1289	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:39:19.792	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1289}	2025-11-10 22:39:19.79338
3c6680d3-8372-4094-b9e1-c51e52c7c752	982fd39c-bee6-4033-8da9-15c89169343b	8eab14bc-6cff-412f-a7e5-b630e2e2d05f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:39:19.792	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:39:19.938547
e632780c-1cd3-407e-9565-7a69308d8e54	982fd39c-bee6-4033-8da9-15c89169343b	4391b718-0700-4695-8132-6c5677a05eca	page_view	engagement	view	\N	1271	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:39:56.751	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1271}	2025-11-10 22:39:56.752544
3c543b9e-56da-4637-a547-4b8e15f0c6a0	982fd39c-bee6-4033-8da9-15c89169343b	4391b718-0700-4695-8132-6c5677a05eca	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:39:56.751	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:39:56.753061
4032c575-bbd3-4430-a8fa-92a935facdd7	982fd39c-bee6-4033-8da9-15c89169343b	2d3f566a-913e-491d-b373-85bbf3d1f726	page_view	engagement	view	\N	8	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:40:13.462	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 8}	2025-11-10 22:40:13.463837
4837bd86-59e5-401c-8703-f5e90a56e4f1	982fd39c-bee6-4033-8da9-15c89169343b	3c2e455e-bfaa-4fdb-ac63-bcba7a564dcb	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:40:13.471	{"query": {}, "statusCode": 304}	2025-11-10 22:40:13.472104
f292b71c-6e75-4ae8-adf7-a8706638bb2b	982fd39c-bee6-4033-8da9-15c89169343b	3c2e455e-bfaa-4fdb-ac63-bcba7a564dcb	page_view	engagement	view	\N	20	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:40:13.471	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 20}	2025-11-10 22:40:13.471947
e3d8f997-2353-4f7f-9f20-09624d8d7b56	982fd39c-bee6-4033-8da9-15c89169343b	2d3f566a-913e-491d-b373-85bbf3d1f726	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:40:13.462	{"query": {}, "statusCode": 304}	2025-11-10 22:40:13.606391
41686971-3f7c-4754-b5eb-40e88ee1e91e	\N	510accdd-ca59-43fe-95f4-694640bbe425	page_view	engagement	view	\N	637	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:40:26.211	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 637}	2025-11-10 22:40:26.212427
9f6b9f44-0664-4845-a9b4-37cd1fab5537	982fd39c-bee6-4033-8da9-15c89169343b	cf06e05d-f6ec-4a29-b4d8-29a098db2721	page_view	engagement	view	\N	27	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:40:26.68	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 27}	2025-11-10 22:40:26.681462
94816006-e71d-4df2-a152-3021e220857e	982fd39c-bee6-4033-8da9-15c89169343b	cf06e05d-f6ec-4a29-b4d8-29a098db2721	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:40:26.68	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:40:26.681784
7686daf3-8623-4a12-bde9-9ecb2ca105f0	982fd39c-bee6-4033-8da9-15c89169343b	4faebf5b-26c1-4fa5-950d-f93f025ea69a	page_view	engagement	view	\N	1071	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:40:28.762	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1071}	2025-11-10 22:40:28.76328
dd7f8fb5-25a0-43e5-a1d0-33a730e51e16	982fd39c-bee6-4033-8da9-15c89169343b	4faebf5b-26c1-4fa5-950d-f93f025ea69a	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:40:28.762	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:40:28.763681
51716884-35be-415a-9b63-24c8ff5590a9	982fd39c-bee6-4033-8da9-15c89169343b	a9712f3f-1e3c-4ecc-83c5-0b6605d2d798	page_view	engagement	view	\N	1030	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:40:43.716	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1030}	2025-11-10 22:40:43.716797
edf9763a-d282-4595-8289-fece6e720655	982fd39c-bee6-4033-8da9-15c89169343b	a9712f3f-1e3c-4ecc-83c5-0b6605d2d798	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:40:43.716	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:40:43.716927
13ac611b-a1f7-4249-9697-f794d1989f3e	\N	2c532438-cc9a-485b-a0d2-6fa4aec244f4	page_view	engagement	view	\N	786	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:56:43.188	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 786}	2025-11-10 22:56:43.190207
5d4262ac-43dc-4c9c-9048-717b5e74e910	982fd39c-bee6-4033-8da9-15c89169343b	b558d324-065f-4bcc-96ba-ae8eb595ac88	page_view	engagement	view	\N	55	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:56:43.624	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 55}	2025-11-10 22:56:43.626149
221af9fa-a6ec-4cad-bead-ab7262791ab9	982fd39c-bee6-4033-8da9-15c89169343b	b558d324-065f-4bcc-96ba-ae8eb595ac88	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:56:43.624	{"query": {}, "statusCode": 304}	2025-11-10 22:56:43.746668
f0eb6da4-e432-49ec-8511-b9b4e5006ec3	982fd39c-bee6-4033-8da9-15c89169343b	a45f1247-f772-43bc-a15c-f9c3eff1c211	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:56:43.75	{"query": {}, "statusCode": 304}	2025-11-10 22:56:43.751635
2fe21b59-e9fd-497c-99d9-bcedae65ba5c	982fd39c-bee6-4033-8da9-15c89169343b	a45f1247-f772-43bc-a15c-f9c3eff1c211	page_view	engagement	view	\N	170	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:56:43.75	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 170}	2025-11-10 22:56:43.751528
76523d48-2952-4d40-bf7c-2f7babb3d1f9	982fd39c-bee6-4033-8da9-15c89169343b	c52836a3-241b-4e23-94af-ae1d0fe8198d	page_view	engagement	view	\N	27	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:56:43.948	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 27}	2025-11-10 22:56:43.949476
846f4894-22dd-4c68-a650-06c6d6265eca	982fd39c-bee6-4033-8da9-15c89169343b	c52836a3-241b-4e23-94af-ae1d0fe8198d	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:56:43.948	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:56:43.950001
83e59204-cf2b-4948-ac03-fa164c8d8b8c	982fd39c-bee6-4033-8da9-15c89169343b	ab1120e5-3ab0-44b6-8d8b-104dcbd3230e	page_view	engagement	view	\N	1032	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:56:46.495	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1032}	2025-11-10 22:56:46.496321
1572e92e-2413-4ba7-b500-da08e212833a	982fd39c-bee6-4033-8da9-15c89169343b	ab1120e5-3ab0-44b6-8d8b-104dcbd3230e	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:56:46.495	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:56:46.496377
b1b73aa6-4d1b-4991-a31c-b908c601a52f	982fd39c-bee6-4033-8da9-15c89169343b	b6bf924b-991b-4b92-884e-b62bf17ef1b5	page_view	engagement	view	\N	1030	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:56:58.425	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1030}	2025-11-10 22:56:58.426878
ec7aa22b-961d-4e55-a0ff-a256d2f31ba4	982fd39c-bee6-4033-8da9-15c89169343b	b6bf924b-991b-4b92-884e-b62bf17ef1b5	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:56:58.425	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 22:56:58.427067
12342aaf-79ec-4df0-aa8b-0be9cff2a643	\N	4ff009d3-9e80-4a22-9d8c-b71ae3ffe45a	page_view	engagement	view	\N	4	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:57:13.365	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 4}	2025-11-10 22:57:13.366108
4b9d7bfd-0195-494d-8bc1-11be0c9542e5	982fd39c-bee6-4033-8da9-15c89169343b	2269133d-56a5-463d-afc7-ba0ebe279fa8	page_view	engagement	view	\N	24	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:57:13.494	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 24}	2025-11-10 22:57:13.495395
c912bb8b-4bb3-4584-8b53-d208ab769cc3	982fd39c-bee6-4033-8da9-15c89169343b	2269133d-56a5-463d-afc7-ba0ebe279fa8	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:57:13.494	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:57:13.495753
17c6a3b0-29c5-48c8-8da6-5770ed8e9417	\N	2f4d84ab-6520-4735-b5de-4c7197346ff9	page_view	engagement	view	\N	3	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:57:26.473	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 22:57:26.473923
e1116c08-096c-4908-9ff7-fad14a22f109	982fd39c-bee6-4033-8da9-15c89169343b	01541a46-ae6d-4c91-abe3-45338d3a6c54	page_view	engagement	view	\N	15	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 22:57:26.587	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 15}	2025-11-10 22:57:26.588766
3ce35a21-75ff-43d2-9364-52c3bebd74d4	982fd39c-bee6-4033-8da9-15c89169343b	01541a46-ae6d-4c91-abe3-45338d3a6c54	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 22:57:26.587	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 22:57:26.954655
7af320f0-99c9-47a3-b09a-7efce6940d7b	982fd39c-bee6-4033-8da9-15c89169343b	e2928ba6-1369-43b9-90b1-c413b2151d2a	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:02:28.157	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:02:28.159303
bbda5d2b-1768-4779-b511-f4ec475120a2	982fd39c-bee6-4033-8da9-15c89169343b	e2928ba6-1369-43b9-90b1-c413b2151d2a	page_view	engagement	view	\N	1031	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:02:28.157	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1031}	2025-11-10 23:02:28.15903
28e285b8-94fa-4da3-9ec6-f0a733f203c2	982fd39c-bee6-4033-8da9-15c89169343b	1f17dafe-99bd-4202-91f4-73bb3bbff0ce	page_view	engagement	view	\N	1032	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:02:49.819	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1032}	2025-11-10 23:02:49.820587
ad8db7b1-cbec-4065-89fb-f172e13f396b	982fd39c-bee6-4033-8da9-15c89169343b	1f17dafe-99bd-4202-91f4-73bb3bbff0ce	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:02:49.819	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:02:49.820956
06fc5980-82bf-4799-8545-134ffbf0ea6d	\N	a896eb49-1e91-428e-85a0-c34c46d43f88	page_view	engagement	view	\N	6	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:02:54.061	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 6}	2025-11-10 23:02:54.06354
4797dc8a-a469-4447-9bde-6c979c80b4fa	982fd39c-bee6-4033-8da9-15c89169343b	34532aa2-82d6-4d1b-8bb0-ac5f6d430316	page_view	engagement	view	\N	15	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:02:54.168	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 15}	2025-11-10 23:02:54.169974
b0c0e347-ef8a-4010-a29f-bd8227313244	982fd39c-bee6-4033-8da9-15c89169343b	34532aa2-82d6-4d1b-8bb0-ac5f6d430316	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:02:54.168	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:02:54.26842
1ceeed1a-b173-4a06-8292-e4e20b24f2d6	982fd39c-bee6-4033-8da9-15c89169343b	ef9526ea-7396-437a-9efe-d0dfce6a9a2f	page_view	engagement	view	\N	175	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:05.815	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 175}	2025-11-10 23:04:05.817015
e1025dc9-5331-498d-bdaa-f1cae47b7ad7	982fd39c-bee6-4033-8da9-15c89169343b	6547e1a4-c7cf-4761-a52c-43ae2aa038aa	page_view	engagement	view	\N	195	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:05.828	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 195}	2025-11-10 23:04:05.829706
96bf20d2-2dcd-4e9b-9c07-9c8244e4ae69	982fd39c-bee6-4033-8da9-15c89169343b	ef9526ea-7396-437a-9efe-d0dfce6a9a2f	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:04:05.815	{"query": {}, "statusCode": 304}	2025-11-10 23:04:05.926906
f0bd46c8-fe9d-49fd-ba48-c836d402157d	982fd39c-bee6-4033-8da9-15c89169343b	6547e1a4-c7cf-4761-a52c-43ae2aa038aa	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:04:05.828	{"query": {}, "statusCode": 304}	2025-11-10 23:04:05.938969
6ecfa88c-f98a-4387-9808-6673403a4b6f	\N	1e5d7970-bc15-404c-884e-2ff54e3aabb2	page_view	engagement	view	\N	455	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:27.854	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 455}	2025-11-10 23:04:27.855067
20830c82-e1f1-4af1-84a0-7a8dcdf36157	\N	cfaa02fa-919a-433a-8a10-032317a3d109	page_view	engagement	view	\N	715	/api/v1/auth/refresh	/refresh	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:28.731	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 715}	2025-11-10 23:04:28.732954
5e259ded-29a7-43bb-badf-36dc23a3613d	\N	3d915d53-fe06-4418-ab78-e5a2529c6d6f	page_view	engagement	view	\N	336	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:29.118	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 336}	2025-11-10 23:04:29.119536
6c393465-a68d-47a5-b93e-386053693ee5	\N	ff667283-de2f-426f-a1cf-f9b4ecf458e9	page_view	engagement	view	\N	419	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:50.106	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 419}	2025-11-10 23:04:50.106852
931132a4-26e7-4912-af12-22128360cfca	\N	912aa555-d6a3-47e1-a222-ea4c0a2d777c	page_view	engagement	view	\N	357	/api/v1/auth/refresh	/refresh	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:04:50.69	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 401, "responseTime": 357}	2025-11-10 23:04:50.691852
c82bed88-37ae-4b57-b379-051ee8fda657	\N	92257c4d-bcf4-492e-bc68-287a7a4b2487	page_view	engagement	view	\N	696	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:05:05.992	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 696}	2025-11-10 23:05:05.993344
9ffe6ff9-3c16-4b35-9e67-c45cc7c310ca	982fd39c-bee6-4033-8da9-15c89169343b	8e4117b8-f3f2-458b-b253-8c448ca7a0de	page_view	engagement	view	\N	52	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:05:06.523	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 52}	2025-11-10 23:05:06.524856
4a1c1dc7-6962-42e9-9284-a51f9684ad9f	982fd39c-bee6-4033-8da9-15c89169343b	8e4117b8-f3f2-458b-b253-8c448ca7a0de	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:05:06.523	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:05:06.805401
2aa00c32-951e-489b-a150-fbab5f086a89	982fd39c-bee6-4033-8da9-15c89169343b	ca6d54da-853d-4c09-ba61-279459bab27d	page_view	engagement	view	\N	1037	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:05:08.878	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1037}	2025-11-10 23:05:08.880045
1175d2f0-8fac-498f-9df4-69fc9bf5c04f	982fd39c-bee6-4033-8da9-15c89169343b	ca6d54da-853d-4c09-ba61-279459bab27d	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:05:08.878	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:05:08.880471
c5d88bc3-e732-4b84-8d8b-82f774b9e2ba	982fd39c-bee6-4033-8da9-15c89169343b	ce485943-c9e1-4b3f-b2ab-bf91afc04ee2	page_view	engagement	view	\N	39	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:05:32.932	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 39}	2025-11-10 23:05:32.933251
468a8569-1c77-4853-9035-3fc44159384e	982fd39c-bee6-4033-8da9-15c89169343b	ce485943-c9e1-4b3f-b2ab-bf91afc04ee2	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:05:32.932	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:05:33.437863
42bc6a16-6f55-4063-ba9e-6eb098bcc685	\N	e54f3437-fd1a-4543-9c95-24cf68ec508c	page_view	engagement	view	\N	3	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:05:49.828	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 23:05:49.829017
d12e1e88-0cd3-4450-a6eb-93ba3cf6b18c	982fd39c-bee6-4033-8da9-15c89169343b	a176c0dd-f695-42db-948f-2c456e840bc1	page_view	engagement	view	\N	15	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:05:50.104	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 15}	2025-11-10 23:05:50.104988
7608906e-b20d-41a8-b37e-ded562f9efc0	982fd39c-bee6-4033-8da9-15c89169343b	a176c0dd-f695-42db-948f-2c456e840bc1	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:05:50.104	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:05:50.276739
c63431fa-b69a-4768-8c3f-32aaadc14917	\N	c3e47a82-5316-449b-8980-483c934868ad	page_view	engagement	view	\N	2	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:06:01.457	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 23:06:01.457846
49356bc7-993d-4f31-b269-5e84515bb7e9	982fd39c-bee6-4033-8da9-15c89169343b	1c60b675-ef69-40a8-ac2c-3220aa268788	page_view	engagement	view	\N	19	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:06:01.528	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 19}	2025-11-10 23:06:01.528867
bac251dd-dfd3-4899-a52e-bee91bc5765a	982fd39c-bee6-4033-8da9-15c89169343b	1c60b675-ef69-40a8-ac2c-3220aa268788	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:06:01.528	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:06:01.674185
5fea64c2-7c89-4cfd-b68a-af9350a10964	\N	6b9f7626-45c0-4295-b990-0741604747c1	page_view	engagement	view	\N	11	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:14:48.158	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 11}	2025-11-10 23:14:48.295457
9be81723-2f73-4ba3-b17c-d2f0b48d7f6e	982fd39c-bee6-4033-8da9-15c89169343b	18839c54-65a2-4a83-ab5c-2ecab0e5c0fb	page_view	engagement	view	\N	34	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:14:48.374	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 500, "responseTime": 34}	2025-11-10 23:14:48.514278
9075944c-24e4-4296-aaa6-8b991b9bad43	982fd39c-bee6-4033-8da9-15c89169343b	18839c54-65a2-4a83-ab5c-2ecab0e5c0fb	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:14:48.374	{"query": {}, "statusCode": 500, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:14:48.518786
0c5f0b78-f8c7-40f1-a63b-929f2fae38a8	982fd39c-bee6-4033-8da9-15c89169343b	f446b64d-34c9-4b29-ab32-58b8ec4e74b5	page_view	engagement	view	\N	23	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:16:16.706	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 23}	2025-11-10 23:16:16.707727
98469b1a-cea3-4213-8cf0-db7c82b8dda8	982fd39c-bee6-4033-8da9-15c89169343b	f446b64d-34c9-4b29-ab32-58b8ec4e74b5	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:16:16.706	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:16:16.799423
f3ed2971-fa5b-4c19-bcf7-6e5767e7def0	982fd39c-bee6-4033-8da9-15c89169343b	64874cfd-c62d-4e1e-860f-1aea2c226149	page_view	engagement	view	\N	8	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:16:19.916	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 8}	2025-11-10 23:16:19.916891
5d012426-50e1-47c2-984b-d1c6a152a3a3	982fd39c-bee6-4033-8da9-15c89169343b	64874cfd-c62d-4e1e-860f-1aea2c226149	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:16:19.916	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:16:19.917142
603fe21e-89db-4a0b-afa0-dd7abcd82861	982fd39c-bee6-4033-8da9-15c89169343b	4c79b91e-6ebd-42bd-b75d-02ff20d00dc1	page_view	engagement	view	\N	1276	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:16:34.679	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1276}	2025-11-10 23:16:34.681022
27a6244f-e8e0-4819-9b9e-25a107f93757	982fd39c-bee6-4033-8da9-15c89169343b	4c79b91e-6ebd-42bd-b75d-02ff20d00dc1	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:16:34.679	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:16:34.681942
0b2a2d31-948d-4539-9ae0-ccda4eba0885	982fd39c-bee6-4033-8da9-15c89169343b	01e875a1-13fa-4127-b675-a3683278bd40	page_view	engagement	view	\N	172	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:19:58.439	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 172}	2025-11-10 23:19:58.440386
a9354a15-cee0-47cf-83b2-a8e4f547398e	982fd39c-bee6-4033-8da9-15c89169343b	02288d1a-6189-4323-a322-f0fd12bbc4aa	page_view	engagement	view	\N	431	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:19:58.449	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 431}	2025-11-10 23:19:58.450846
a6f41cec-6cff-474a-a46b-3aa533d1d520	982fd39c-bee6-4033-8da9-15c89169343b	01e875a1-13fa-4127-b675-a3683278bd40	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:19:58.439	{"query": {}, "statusCode": 304}	2025-11-10 23:19:58.561493
d57f14c3-b86c-4901-a21c-3f0f23d84233	982fd39c-bee6-4033-8da9-15c89169343b	02288d1a-6189-4323-a322-f0fd12bbc4aa	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:19:58.449	{"query": {}, "statusCode": 304}	2025-11-10 23:19:58.568604
b24527ec-eadc-4347-8fcd-f1b5be56d3be	\N	23c62507-f552-483b-ac82-7a7996048bf3	page_view	engagement	view	\N	800	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:01.944	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 800}	2025-11-10 23:21:01.944904
709a369a-1cf5-4c58-af6f-f04eea5f662c	982fd39c-bee6-4033-8da9-15c89169343b	f46d3f19-b9f0-4b6f-94fc-233dad3e054f	page_view	engagement	view	\N	43	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:02.261	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 43}	2025-11-10 23:21:02.262111
3010184f-ca5d-43fd-a6cb-4340fb192b1c	982fd39c-bee6-4033-8da9-15c89169343b	91274d69-2585-47eb-af78-06efc16936db	page_view	engagement	view	\N	10	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:02.316	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 10}	2025-11-10 23:21:02.316963
377c611f-7fde-40f2-b595-4da85489acbf	982fd39c-bee6-4033-8da9-15c89169343b	f46d3f19-b9f0-4b6f-94fc-233dad3e054f	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:21:02.261	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:21:02.389424
d2c5b849-05e8-4047-ae94-048aa5c18ae1	982fd39c-bee6-4033-8da9-15c89169343b	91274d69-2585-47eb-af78-06efc16936db	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:21:02.316	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:21:02.401827
a54899da-81d5-4970-adfa-351a1c1f11cf	982fd39c-bee6-4033-8da9-15c89169343b	84005aa0-9022-43b6-9c9f-ae43e3fbd8f2	page_view	engagement	view	\N	20	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:03.234	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 20}	2025-11-10 23:21:03.235481
630c287d-db83-45f4-a286-6439c2952aeb	982fd39c-bee6-4033-8da9-15c89169343b	84005aa0-9022-43b6-9c9f-ae43e3fbd8f2	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:21:03.234	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:21:03.235562
cc2e98f0-3adc-4927-bf9a-25ed218baffd	982fd39c-bee6-4033-8da9-15c89169343b	bfd7216b-61e4-4337-914c-4876c0ee8445	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:21:05.302	{"query": {"page": "1", "limit": "20"}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:21:05.303496
4ca981c2-ca04-47b3-a1d8-03c482400f2b	982fd39c-bee6-4033-8da9-15c89169343b	bfd7216b-61e4-4337-914c-4876c0ee8445	page_view	engagement	view	\N	1038	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:05.302	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 1038}	2025-11-10 23:21:05.303341
cbad0058-e73e-490c-93cc-32070d12fd82	982fd39c-bee6-4033-8da9-15c89169343b	87e45d18-a731-4734-8ce0-068fa5d2b53b	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:21:12.977	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:21:12.978574
65066b64-8ee2-49e0-9fbc-f0f9dcee26b2	982fd39c-bee6-4033-8da9-15c89169343b	87e45d18-a731-4734-8ce0-068fa5d2b53b	page_view	engagement	view	\N	1089	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:12.977	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1089}	2025-11-10 23:21:12.978395
f9992ce8-6cce-4cdd-b7af-1f83d2c84cde	982fd39c-bee6-4033-8da9-15c89169343b	d9b7e0f3-0d0a-4568-8aae-c3aa1774ed3f	page_view	engagement	view	\N	1204	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:21:32.645	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1204}	2025-11-10 23:21:32.646105
5c5a9ec4-8aed-4a41-9c56-bd06f070b256	982fd39c-bee6-4033-8da9-15c89169343b	d9b7e0f3-0d0a-4568-8aae-c3aa1774ed3f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:21:32.645	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:21:32.646232
8aef6464-2cf6-45f1-8c9c-7adc949c53da	\N	07cc9e2e-c5ec-44ed-8629-8fb847585639	page_view	engagement	view	\N	2	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:22:26.134	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 23:22:26.508706
b4c6f5a0-44c8-4bdb-85f6-a7050c198455	982fd39c-bee6-4033-8da9-15c89169343b	026e5215-d368-4a3b-ba55-c3117f746f4b	page_view	engagement	view	\N	34	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:22:26.574	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 34}	2025-11-10 23:22:26.575997
b334d1ac-bca1-4889-b484-e4d10dbb2755	982fd39c-bee6-4033-8da9-15c89169343b	026e5215-d368-4a3b-ba55-c3117f746f4b	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:22:26.574	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:22:26.66679
af2324bf-0b43-4da9-b91e-73f247fd81ac	\N	31c6acac-23a8-41ba-820f-0987930ba74a	page_view	engagement	view	\N	1070	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:23:19.233	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 1070}	2025-11-10 23:23:19.234692
5fb75b30-db2c-4974-818c-94e4a7ef5ca8	982fd39c-bee6-4033-8da9-15c89169343b	094a6c33-e44b-47a8-ad0c-fe41027a41c9	page_view	engagement	view	\N	15	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:23:19.918	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 15}	2025-11-10 23:23:19.920533
a55dfd74-6672-489d-8a53-45ca36e75f7c	982fd39c-bee6-4033-8da9-15c89169343b	094a6c33-e44b-47a8-ad0c-fe41027a41c9	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:23:19.919	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:23:20.008419
a2f5375b-dbf5-4baf-a45b-886e4667f558	982fd39c-bee6-4033-8da9-15c89169343b	9f2c2828-5e5e-4a59-b1fe-055aefdbf741	page_view	engagement	view	\N	1690	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:23:23.393	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1690}	2025-11-10 23:23:23.394129
c382f8ef-3e45-4880-a202-cb099362ed5f	982fd39c-bee6-4033-8da9-15c89169343b	9f2c2828-5e5e-4a59-b1fe-055aefdbf741	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:23:23.393	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:23:23.394364
a926b5f4-28e1-4745-8fcb-c01022cb28e8	982fd39c-bee6-4033-8da9-15c89169343b	06dbd7c3-eebc-4bfd-956f-d4b4cda150f1	page_view	engagement	view	\N	105	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:23:57.218	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 105}	2025-11-10 23:23:57.218711
42de9f7c-e6a5-4a60-b57b-a3947601f63a	982fd39c-bee6-4033-8da9-15c89169343b	06dbd7c3-eebc-4bfd-956f-d4b4cda150f1	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:23:57.218	{"query": {}, "statusCode": 304}	2025-11-10 23:23:57.283804
ecacd13b-1f71-4152-a1e7-4008dba3c90b	982fd39c-bee6-4033-8da9-15c89169343b	2798631d-108f-4cb9-afff-6a6885b709b7	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:24:07.032	{"query": {}, "statusCode": 304}	2025-11-10 23:24:07.032557
87b740e5-3992-4f53-a16c-73f759893c8d	\N	4718fca7-c4b4-4743-84e5-91370cdb36b3	page_view	engagement	view	\N	3	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:24:06.857	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 23:24:06.858492
6f2ed0ae-8dd2-4d3e-b52f-5f7d35ba1d68	982fd39c-bee6-4033-8da9-15c89169343b	2798631d-108f-4cb9-afff-6a6885b709b7	page_view	engagement	view	\N	29	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:24:07.031	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 29}	2025-11-10 23:24:07.032498
be511b5c-6093-4089-9400-3a45d3d9547e	982fd39c-bee6-4033-8da9-15c89169343b	bfb5d693-ae67-4913-a5c8-445db468fb5b	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:24:14.639	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:24:14.640637
dbb80e14-8189-4a20-83ca-7f0669d44189	982fd39c-bee6-4033-8da9-15c89169343b	bfb5d693-ae67-4913-a5c8-445db468fb5b	page_view	engagement	view	\N	1178	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:24:14.639	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1178}	2025-11-10 23:24:14.640398
584e1cde-45ed-4391-b893-ae8f8c6a350b	982fd39c-bee6-4033-8da9-15c89169343b	a4052385-8196-46e1-919c-13ef3eab91ca	page_view	engagement	view	\N	1186	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:24:14.644	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1186}	2025-11-10 23:24:14.841208
321efe8d-3984-4172-bcb1-07fe20023941	982fd39c-bee6-4033-8da9-15c89169343b	a4052385-8196-46e1-919c-13ef3eab91ca	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:24:14.644	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:24:14.848139
42d69b48-c287-4493-a3cd-dae4c0443cfb	982fd39c-bee6-4033-8da9-15c89169343b	b4f38f2b-c078-43c2-b868-1f79b81a79a3	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:24:35.273	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:24:35.274454
1cbcdff2-e6a5-451e-8cc3-4ac823ea332b	982fd39c-bee6-4033-8da9-15c89169343b	b4f38f2b-c078-43c2-b868-1f79b81a79a3	page_view	engagement	view	\N	1100	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:24:35.273	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1100}	2025-11-10 23:24:35.274353
3e27bc90-e8ad-4c7f-9425-b25b6d98cd1c	982fd39c-bee6-4033-8da9-15c89169343b	b3cbb845-0658-4d33-a892-c82f05f012dd	page_view	engagement	view	\N	4079	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:37:12.009	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 4079}	2025-11-10 23:37:12.010138
3d49e61f-2dfd-426a-aaef-43210c1160f3	982fd39c-bee6-4033-8da9-15c89169343b	b3cbb845-0658-4d33-a892-c82f05f012dd	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:37:12.009	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:37:12.232055
20361e37-af93-4e22-9b88-dba0f84d87f4	\N	d205f837-8f3d-4de0-a7fa-1be8000399cc	page_view	engagement	view	\N	792	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:38:08.449	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 792}	2025-11-10 23:38:08.450525
6dc366d6-f5c8-42e7-afd1-7c73352a0ed0	982fd39c-bee6-4033-8da9-15c89169343b	5b98a646-7076-4442-b202-785b763cd369	page_view	engagement	view	\N	21	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:38:08.74	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 21}	2025-11-10 23:38:08.741122
a9de2162-4bab-4e37-be2d-92a99c29307c	982fd39c-bee6-4033-8da9-15c89169343b	5b98a646-7076-4442-b202-785b763cd369	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:38:08.74	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:38:08.848774
2641e1e8-e896-4554-b5f6-babd48d7dba8	982fd39c-bee6-4033-8da9-15c89169343b	5aa2b6a9-4295-47e4-b808-af82120f64d7	page_view	engagement	view	\N	8	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:38:08.872	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 8}	2025-11-10 23:38:08.872822
4c751861-382f-437c-a8cf-85f54692439d	982fd39c-bee6-4033-8da9-15c89169343b	5aa2b6a9-4295-47e4-b808-af82120f64d7	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:38:08.872	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:38:08.873005
f061471a-88da-4797-8a7d-1909b606e485	982fd39c-bee6-4033-8da9-15c89169343b	72a0085c-77c1-482b-8f81-32cdca32d79a	page_view	engagement	view	\N	24	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:38:09.628	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 24}	2025-11-10 23:38:09.62992
35b6338f-b4eb-49ef-9cbf-d6ef9af78cb1	982fd39c-bee6-4033-8da9-15c89169343b	72a0085c-77c1-482b-8f81-32cdca32d79a	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:38:09.629	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:38:09.630036
b219f980-f78e-48ab-afe1-09c3f28702f1	982fd39c-bee6-4033-8da9-15c89169343b	2983ad60-55cb-461f-903b-2fc7595f608e	page_view	engagement	view	\N	1219	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:38:12.887	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 1219}	2025-11-10 23:38:12.888604
fb919706-e6d3-4ccf-b892-129bda328d45	982fd39c-bee6-4033-8da9-15c89169343b	2983ad60-55cb-461f-903b-2fc7595f608e	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:38:12.887	{"query": {"page": "1", "limit": "20"}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:38:12.888815
6ba78a96-5458-4160-a127-c6d9ebd7c67a	\N	345a6c41-6994-49f6-b477-99236839b4f0	page_view	engagement	view	\N	2	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:40:55.617	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 23:40:55.77146
ca41e56b-d4c8-4054-a53d-38143f9df817	982fd39c-bee6-4033-8da9-15c89169343b	c4eaac0d-f269-41aa-b4cf-cbaaf63bffda	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:40:55.909	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:40:55.910486
80abec19-b3b6-4283-9013-5d658ac70b39	982fd39c-bee6-4033-8da9-15c89169343b	c4eaac0d-f269-41aa-b4cf-cbaaf63bffda	page_view	engagement	view	\N	140	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:40:55.909	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 140}	2025-11-10 23:40:55.910413
f9dbbe29-0a88-4e18-a2df-298d0f6b0b33	\N	388856d5-5d56-450b-9acd-14d13b62de54	page_view	engagement	view	\N	2	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:41:05.913	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 23:41:05.914671
343e1f71-0a1d-46cd-8b36-4484c7d47c5d	982fd39c-bee6-4033-8da9-15c89169343b	a20c56af-6769-4029-9a05-5d164b732532	page_view	engagement	view	\N	8	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:41:06.224	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 8}	2025-11-10 23:41:06.225344
0f385b53-2cd8-4fc4-bb59-5a0d2018cb8c	982fd39c-bee6-4033-8da9-15c89169343b	a20c56af-6769-4029-9a05-5d164b732532	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:41:06.224	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:41:06.225866
bbc64272-40cc-4680-beed-029d9e8eff2f	\N	3dab5483-3edb-4556-b59d-a31ee637f26a	page_view	engagement	view	\N	3	/api/v1/chats	/api/v1/chats	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:41:08.705	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 3}	2025-11-10 23:41:08.706507
bd23cddd-41b5-4542-8202-1d2d2b3d4782	982fd39c-bee6-4033-8da9-15c89169343b	3c63dcbb-afcb-459b-b51f-6aa85c0133fc	page_view	engagement	view	\N	9	/api/v1/chat	/	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:41:08.887	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 9}	2025-11-10 23:41:08.888588
f390f378-b64c-467a-8119-866c843e74f7	982fd39c-bee6-4033-8da9-15c89169343b	3c63dcbb-afcb-459b-b51f-6aa85c0133fc	api_interaction	engagement	get	\N	\N	/api/v1/chat	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:41:08.887	{"query": {}, "statusCode": 304}	2025-11-10 23:41:08.888811
67409a9c-750e-4099-a18e-7b7f70939023	982fd39c-bee6-4033-8da9-15c89169343b	11cc0960-b301-4a9c-9a4b-46ffe3055467	page_view	engagement	view	\N	1565	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:41:51.216	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1565}	2025-11-10 23:41:51.217723
5eb9cc63-afe7-4717-b9a0-6b07409db4ec	982fd39c-bee6-4033-8da9-15c89169343b	11cc0960-b301-4a9c-9a4b-46ffe3055467	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:41:51.216	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:41:51.299113
889789cd-f574-4431-8c14-66740b7fc264	982fd39c-bee6-4033-8da9-15c89169343b	0943f43d-6d97-48f6-8906-5a93f3c003bc	page_view	engagement	view	\N	1090	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:41:54.033	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1090}	2025-11-10 23:41:54.034995
23282e56-b0c1-4c19-b038-86305cbf1eaa	982fd39c-bee6-4033-8da9-15c89169343b	0943f43d-6d97-48f6-8906-5a93f3c003bc	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:41:54.033	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:41:54.035215
5a1baa94-7ee1-4342-9d84-21199549c734	\N	6d2b2eba-1b87-4c82-a966-765b830ae58d	page_view	engagement	view	\N	2	/api/v1/users/notification-preferences	/api/v1/users/notification-preferences	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:43:11.45	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 404, "responseTime": 2}	2025-11-10 23:43:11.769248
f769e733-793c-47dc-9b7e-4a39e3c239f5	982fd39c-bee6-4033-8da9-15c89169343b	6e575c5c-f804-4c36-aa4e-382baeddf763	page_view	engagement	view	\N	223	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:00.44	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 223}	2025-11-10 23:47:00.44219
699b51da-8d22-4c01-9f14-7af35fa11dee	982fd39c-bee6-4033-8da9-15c89169343b	8ce33b55-236a-490a-a6c7-7ba004d044f5	page_view	engagement	view	\N	238	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:00.447	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 238}	2025-11-10 23:47:00.448251
a21b93dc-5a65-4581-ae3a-709ad62a8f16	982fd39c-bee6-4033-8da9-15c89169343b	6e575c5c-f804-4c36-aa4e-382baeddf763	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:00.44	{"query": {}, "statusCode": 304}	2025-11-10 23:47:00.571463
8abf5929-1bd4-4a7a-847a-9387282b8fa4	982fd39c-bee6-4033-8da9-15c89169343b	8ce33b55-236a-490a-a6c7-7ba004d044f5	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:00.447	{"query": {}, "statusCode": 304}	2025-11-10 23:47:00.579233
5a7d6814-9613-4fa8-8153-e888ed535bd5	982fd39c-bee6-4033-8da9-15c89169343b	78ce1f34-0ccc-447b-a164-f95bd70c8986	page_view	engagement	view	\N	16	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:05.928	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 16}	2025-11-10 23:47:05.928814
a0953ae4-b390-451c-887f-6147c1ac9d8e	982fd39c-bee6-4033-8da9-15c89169343b	78ce1f34-0ccc-447b-a164-f95bd70c8986	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:05.928	{"query": {}, "statusCode": 304}	2025-11-10 23:47:05.92902
e8d3e78d-a204-49f2-a9f5-17fe3303d1c0	982fd39c-bee6-4033-8da9-15c89169343b	25236c19-5ccd-4e5a-9f88-d60757237b86	page_view	engagement	view	\N	24	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:05.933	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 24}	2025-11-10 23:47:05.934429
fd037d44-201b-4fdc-8b8b-8b8523bc741a	982fd39c-bee6-4033-8da9-15c89169343b	25236c19-5ccd-4e5a-9f88-d60757237b86	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:05.933	{"query": {}, "statusCode": 304}	2025-11-10 23:47:05.934651
75eb73d5-4afa-4fec-9869-871fb2c63b7b	982fd39c-bee6-4033-8da9-15c89169343b	19df7833-d49c-4ba7-bc84-3ce530ff3336	page_view	engagement	view	\N	9	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:16.052	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 9}	2025-11-10 23:47:16.053354
58b929a2-d128-4abe-92d9-f0e1efc8db78	982fd39c-bee6-4033-8da9-15c89169343b	19df7833-d49c-4ba7-bc84-3ce530ff3336	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:16.052	{"query": {}, "statusCode": 304}	2025-11-10 23:47:16.053441
aa8ac93e-f1fa-46b0-b21f-ebb72e552bc2	982fd39c-bee6-4033-8da9-15c89169343b	55f0a7f5-d4c5-4d1e-bc5e-3f89852a4973	page_view	engagement	view	\N	7	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:16.054	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 7}	2025-11-10 23:47:16.054952
67e75cc7-27b4-4c66-9e0e-4a02d0e66f92	982fd39c-bee6-4033-8da9-15c89169343b	55f0a7f5-d4c5-4d1e-bc5e-3f89852a4973	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:16.054	{"query": {}, "statusCode": 304}	2025-11-10 23:47:16.055069
33c4b53b-87a3-475d-9b7a-8aa29b5f5aa6	\N	1aa3fa0d-ac0b-4257-b7bd-85654ecb7582	page_view	engagement	view	\N	599	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:44.275	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 599}	2025-11-10 23:47:44.27646
afcb50c6-124c-4385-a253-54a0efad5eee	982fd39c-bee6-4033-8da9-15c89169343b	8d89b836-2f78-4f3c-90e5-8eadc6ef75f9	page_view	engagement	view	\N	10	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:44.977	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 10}	2025-11-10 23:47:44.977639
1ef9a041-a2b5-4f18-80ec-2795360f6987	982fd39c-bee6-4033-8da9-15c89169343b	8d89b836-2f78-4f3c-90e5-8eadc6ef75f9	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:44.977	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:47:44.97773
b6479a29-e6db-47cc-af1d-48df53c1641c	982fd39c-bee6-4033-8da9-15c89169343b	ebbc9979-7564-464a-9171-cc723f3d2a84	page_view	engagement	view	\N	1024	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:47:47.767	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1024}	2025-11-10 23:47:47.768511
7e69354c-c812-4c54-b234-a5f86bbd43e8	982fd39c-bee6-4033-8da9-15c89169343b	ebbc9979-7564-464a-9171-cc723f3d2a84	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:47:47.767	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:47:47.768756
eabdbd1e-a3db-4bda-8c7c-1e48b18859d6	982fd39c-bee6-4033-8da9-15c89169343b	044121e4-6c75-4bce-a30a-bfb132bf736e	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:48:12.416	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:48:12.417686
c9f4c8c3-0ce3-48d2-b2df-989dbb22dc00	\N	8102882a-eb83-433f-83da-e06714083b11	page_view	engagement	view	\N	785	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:48:11.802	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 785}	2025-11-10 23:48:11.803059
2a3605eb-9e8a-4a24-ab79-d1d647643db2	982fd39c-bee6-4033-8da9-15c89169343b	044121e4-6c75-4bce-a30a-bfb132bf736e	page_view	engagement	view	\N	8	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:48:12.416	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 8}	2025-11-10 23:48:12.417468
b0e7400d-6289-4506-a6ef-e21d25b9f812	982fd39c-bee6-4033-8da9-15c89169343b	8c667eca-63e6-475f-8c4d-17ecddb2a996	page_view	engagement	view	\N	1258	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:48:15.362	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1258}	2025-11-10 23:48:15.363559
9226dff4-e2e7-4534-badc-3be140cd8cc9	982fd39c-bee6-4033-8da9-15c89169343b	8c667eca-63e6-475f-8c4d-17ecddb2a996	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:48:15.362	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:48:15.363838
56a12d1f-4018-4dac-92e3-c0139977c729	\N	0262b06a-0cba-4f7f-a3b9-c6a3bdc3fb0e	page_view	engagement	view	\N	711	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:49:31.099	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 711}	2025-11-10 23:49:31.100004
9953bdfd-9ae1-4b12-a0d2-bf20c8a0f719	982fd39c-bee6-4033-8da9-15c89169343b	6323b196-4801-4c94-a24b-e91ff2d33970	page_view	engagement	view	\N	11	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:49:31.721	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 11}	2025-11-10 23:49:31.722421
a2f023ec-9cc8-4b4e-8612-fa3c4b3941e7	982fd39c-bee6-4033-8da9-15c89169343b	6323b196-4801-4c94-a24b-e91ff2d33970	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:49:31.721	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:49:31.810224
f7ac6c4e-d976-41b7-bd60-a32cf8aed31a	982fd39c-bee6-4033-8da9-15c89169343b	5c28e2e9-02c0-4eba-bd28-b0a11383124a	page_view	engagement	view	\N	1072	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:49:33.664	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1072}	2025-11-10 23:49:33.66534
79e61b4c-6815-4cf7-a3f9-ddf6fbe5c1c3	982fd39c-bee6-4033-8da9-15c89169343b	5c28e2e9-02c0-4eba-bd28-b0a11383124a	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:49:33.664	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:49:33.665483
b9a244eb-7403-4ecb-9adb-25d81b2f8fad	982fd39c-bee6-4033-8da9-15c89169343b	df184a79-c456-4d3e-844e-1a29fc95e7c4	page_view	engagement	view	\N	11	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:49:39.363	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 11}	2025-11-10 23:49:39.364427
974fd203-0b5a-4904-8663-e7f7b2483dd3	982fd39c-bee6-4033-8da9-15c89169343b	df184a79-c456-4d3e-844e-1a29fc95e7c4	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:49:39.363	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:49:39.364717
f4316967-631b-46c1-ab2a-e1783c7032f8	982fd39c-bee6-4033-8da9-15c89169343b	b931eaf4-f1ec-49b0-b18b-60c6367343e8	page_view	engagement	view	\N	7	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:49:40.584	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 7}	2025-11-10 23:49:40.585159
f0b57ebd-8311-4096-8d1f-cd590021f1b3	982fd39c-bee6-4033-8da9-15c89169343b	b931eaf4-f1ec-49b0-b18b-60c6367343e8	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:49:40.584	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:49:40.585474
5d70b185-5f52-4a26-aed3-7ea1d42adc61	982fd39c-bee6-4033-8da9-15c89169343b	cdcd8485-102a-48c1-b2fe-e8f6e8b20d04	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:49:42.425	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:49:42.426523
a8e7fbaf-4cd0-4b9a-b55a-98162b3c6099	982fd39c-bee6-4033-8da9-15c89169343b	cdcd8485-102a-48c1-b2fe-e8f6e8b20d04	page_view	engagement	view	\N	4	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-10 23:49:42.425	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 4}	2025-11-10 23:49:42.426433
2ae7b901-3c0d-47b2-ac26-f655ea8d6a6d	982fd39c-bee6-4033-8da9-15c89169343b	c465faeb-cbad-4e3c-b260-3cf9696b502b	page_view	engagement	view	\N	1272	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:55:24.977	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1272}	2025-11-10 23:55:24.978297
7b003332-c75b-4690-8bac-fd6319bb82fe	982fd39c-bee6-4033-8da9-15c89169343b	c465faeb-cbad-4e3c-b260-3cf9696b502b	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:55:24.977	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:55:25.145438
2a04a035-932d-4d37-8adb-0e95e7507146	982fd39c-bee6-4033-8da9-15c89169343b	737878b5-e405-4460-97a1-71815cd68420	page_view	engagement	view	\N	1589	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:56:37.863	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1589}	2025-11-10 23:56:37.865218
95d8ccc0-41c5-4ac3-a963-d21daebf61cf	982fd39c-bee6-4033-8da9-15c89169343b	737878b5-e405-4460-97a1-71815cd68420	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:56:37.863	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:56:38.001298
6bb06d72-881c-4362-b8c7-f2addd51d6d0	982fd39c-bee6-4033-8da9-15c89169343b	9c31d625-1ad5-4a00-8d57-0a54abbcf9a6	page_view	engagement	view	\N	19	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:56:40.96	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 19}	2025-11-10 23:56:40.961199
2806f3a9-0655-4c2c-91df-98c19999bb5c	982fd39c-bee6-4033-8da9-15c89169343b	9c31d625-1ad5-4a00-8d57-0a54abbcf9a6	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:56:40.96	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:56:40.961553
5cabbe3d-afe6-407e-bee2-d341b805ffaa	982fd39c-bee6-4033-8da9-15c89169343b	714a7205-c5b6-4e1d-a911-af8407b8695e	page_view	engagement	view	\N	5	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:56:44.123	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 5}	2025-11-10 23:56:44.12435
0b2a6d70-ce51-4bbb-bf53-b8d7764bc6a4	982fd39c-bee6-4033-8da9-15c89169343b	714a7205-c5b6-4e1d-a911-af8407b8695e	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:56:44.123	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:56:44.124502
cd1ea6d2-a2e2-42c3-bc2d-aafd4af53b8b	982fd39c-bee6-4033-8da9-15c89169343b	b1ea7345-d8df-4428-a1e1-fb27e7c69826	page_view	engagement	view	\N	1131	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:57:21.155	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1131}	2025-11-10 23:57:21.156107
52d0eff0-7bb9-4288-90d7-1697c9b5ab9e	982fd39c-bee6-4033-8da9-15c89169343b	b1ea7345-d8df-4428-a1e1-fb27e7c69826	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:57:21.155	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:57:21.316881
5edab786-8c15-496d-8761-5e9d28f6d9c0	982fd39c-bee6-4033-8da9-15c89169343b	2c181140-dd9f-46e8-9cab-2dcbc68d60fd	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:57:32.267	{"body": "[REDACTED]", "query": {}, "statusCode": 400, "contentType": "application/json; charset=utf-8"}	2025-11-10 23:57:32.269019
466f565d-a69e-422d-8741-a4c1b7378630	982fd39c-bee6-4033-8da9-15c89169343b	4e368f53-2a5a-4c70-bb20-97f6b0331d3e	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-10 23:57:42.157	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-10 23:57:42.157816
d18520f4-eb5f-4a9a-9453-076a21eac2f5	982fd39c-bee6-4033-8da9-15c89169343b	2c181140-dd9f-46e8-9cab-2dcbc68d60fd	page_view	engagement	view	\N	9	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-10 23:57:32.267	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 400, "responseTime": 9}	2025-11-10 23:57:32.268751
a7be69c2-266d-4aa9-b51a-a87f7b208464	982fd39c-bee6-4033-8da9-15c89169343b	4e368f53-2a5a-4c70-bb20-97f6b0331d3e	page_view	engagement	view	\N	1356	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-10 23:57:42.156	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1356}	2025-11-10 23:57:42.157741
d910a8b3-5707-4cc8-9b03-a016636b59f8	982fd39c-bee6-4033-8da9-15c89169343b	951eb6e2-cbc2-4c98-9aa8-03d291e599d0	page_view	engagement	view	\N	1116	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-11 00:04:50.76	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1116}	2025-11-11 00:04:50.76043
b31f896b-b865-4add-9bbe-f18301151c45	982fd39c-bee6-4033-8da9-15c89169343b	26749d4b-3eb1-4493-b336-e1981b18dda9	page_view	engagement	view	\N	1097	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-11 00:04:50.754	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1097}	2025-11-11 00:04:50.755211
80f82e0f-63df-49f6-868d-96438256ac69	982fd39c-bee6-4033-8da9-15c89169343b	26749d4b-3eb1-4493-b336-e1981b18dda9	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:04:50.754	{"query": {}, "statusCode": 304}	2025-11-11 00:04:50.901264
ba4958a3-739d-41b4-a3bf-573bcb91b600	982fd39c-bee6-4033-8da9-15c89169343b	951eb6e2-cbc2-4c98-9aa8-03d291e599d0	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:04:50.76	{"query": {}, "statusCode": 304}	2025-11-11 00:04:50.959747
b3825234-a158-48ab-8351-a0335f8110e7	982fd39c-bee6-4033-8da9-15c89169343b	2f835245-d442-4a3a-9ce3-e8d2a6d541fb	page_view	engagement	view	\N	10	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:04:57.499	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 10}	2025-11-11 00:04:57.500263
942a154d-d378-42a7-9d80-2e8c2d16537d	982fd39c-bee6-4033-8da9-15c89169343b	2f835245-d442-4a3a-9ce3-e8d2a6d541fb	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:04:57.499	{"query": {}, "statusCode": 304}	2025-11-11 00:04:57.500437
30ace414-4e89-47ab-b7ed-298107be7676	982fd39c-bee6-4033-8da9-15c89169343b	e1f15cb1-bd94-4899-be42-788780a282eb	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:04:57.503	{"query": {}, "statusCode": 304}	2025-11-11 00:04:57.503874
13c9add0-afd4-45ae-9eec-2ae4df6d3230	982fd39c-bee6-4033-8da9-15c89169343b	e1f15cb1-bd94-4899-be42-788780a282eb	page_view	engagement	view	\N	19	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:04:57.503	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 19}	2025-11-11 00:04:57.503748
d68242ba-6f08-4b77-8804-2d5aac6e3687	982fd39c-bee6-4033-8da9-15c89169343b	5c6ce013-9e10-4235-9fc7-fb31992a3265	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:05:16.389	{"query": {}, "statusCode": 304}	2025-11-11 00:05:16.390069
43f7076a-db31-48bb-b78c-9c6f46410582	982fd39c-bee6-4033-8da9-15c89169343b	5c6ce013-9e10-4235-9fc7-fb31992a3265	page_view	engagement	view	\N	13	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:05:16.389	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 13}	2025-11-11 00:05:16.389896
6604d936-f3a5-4735-ac02-053032e26095	982fd39c-bee6-4033-8da9-15c89169343b	0cdbb992-26b0-42ea-a8b3-e686a97df311	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:05:16.397	{"query": {}, "statusCode": 304}	2025-11-11 00:05:16.397616
d338f7b8-07ec-44d4-83ba-6a5f3b28c525	982fd39c-bee6-4033-8da9-15c89169343b	0cdbb992-26b0-42ea-a8b3-e686a97df311	page_view	engagement	view	\N	16	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:05:16.397	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 16}	2025-11-11 00:05:16.397535
2a4beecf-d396-4e20-8455-183cb7e85460	\N	233d4d07-c31d-4825-935d-4b3523a3d67f	page_view	engagement	view	\N	814	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:06:35.877	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 814}	2025-11-11 00:06:35.878243
083a19fe-7bb1-493b-93d9-8a15e691ef5b	982fd39c-bee6-4033-8da9-15c89169343b	bfd1b3a7-28f9-4fe2-90a1-34cf975ac287	page_view	engagement	view	\N	26	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:06:36.742	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 26}	2025-11-11 00:06:36.743154
fc3f0d39-f6c9-4761-b059-fe0beedc754b	982fd39c-bee6-4033-8da9-15c89169343b	bfd1b3a7-28f9-4fe2-90a1-34cf975ac287	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:06:36.742	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:06:36.876182
cb77e156-5c9f-413c-b866-e4219873e5b9	982fd39c-bee6-4033-8da9-15c89169343b	0149dd82-6d6c-47c8-8fa6-93786af93d6f	page_view	engagement	view	\N	1159	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:06:39.53	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1159}	2025-11-11 00:06:39.531555
865ce2c7-c8d5-4713-a045-b793ab4b0b0f	982fd39c-bee6-4033-8da9-15c89169343b	0149dd82-6d6c-47c8-8fa6-93786af93d6f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:06:39.53	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:06:39.531749
63e8a04f-52d1-440b-a191-c14a82ee2c76	982fd39c-bee6-4033-8da9-15c89169343b	11497376-4205-49fb-87a1-85015d7ade07	page_view	engagement	view	\N	1032	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:06:59.387	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1032}	2025-11-11 00:06:59.387979
13884fbb-fd8a-4468-a548-8e5342a4876a	982fd39c-bee6-4033-8da9-15c89169343b	11497376-4205-49fb-87a1-85015d7ade07	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:06:59.387	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:06:59.388136
a707c2f2-1600-45e7-9f27-a26b8737c475	982fd39c-bee6-4033-8da9-15c89169343b	f3afa93c-844e-4492-9e68-2151fb75f684	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:07:07.256	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:07:07.257287
cf942a31-65b3-40c1-876b-443ca2b397b5	982fd39c-bee6-4033-8da9-15c89169343b	f3afa93c-844e-4492-9e68-2151fb75f684	page_view	engagement	view	\N	1004	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:07:07.256	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1004}	2025-11-11 00:07:07.257275
880fd3d3-6cea-49ba-a9a9-8cafa328095b	982fd39c-bee6-4033-8da9-15c89169343b	b046844e-7c3e-4080-bfbf-3afa67dcb186	page_view	engagement	view	\N	26	/api/v1/chats	/	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:07:12.994	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 26}	2025-11-11 00:07:12.994746
2bcafec6-9c92-491a-9994-f115ff8d657e	982fd39c-bee6-4033-8da9-15c89169343b	317a7466-789c-4b05-a2aa-c7eaaf7e6a7e	page_view	engagement	view	\N	6	/api/v1/chats	/	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:07:22.697	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 6}	2025-11-11 00:07:22.698482
8c803960-785a-4245-a8ee-1c374751bc66	982fd39c-bee6-4033-8da9-15c89169343b	8ed2ce3e-4b88-4722-85ff-3e31bc95013e	page_view	engagement	view	\N	6	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:07:34.297	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 6}	2025-11-11 00:07:34.29795
69833392-37c5-4195-bd6d-34ef6f4de13d	982fd39c-bee6-4033-8da9-15c89169343b	b046844e-7c3e-4080-bfbf-3afa67dcb186	api_interaction	engagement	get	\N	\N	/api/v1/chats	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:07:12.994	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:07:12.994843
f87eb823-1f2f-4beb-bf0d-c66b1adf2565	982fd39c-bee6-4033-8da9-15c89169343b	317a7466-789c-4b05-a2aa-c7eaaf7e6a7e	api_interaction	engagement	get	\N	\N	/api/v1/chats	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:07:22.697	{"query": {}, "statusCode": 304}	2025-11-11 00:07:22.698561
3d8e1177-2632-439b-81ea-878f7c5b5f10	982fd39c-bee6-4033-8da9-15c89169343b	8ed2ce3e-4b88-4722-85ff-3e31bc95013e	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:07:34.297	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:07:34.298036
e883f55e-9776-483f-92c0-8fd4ede797e8	\N	7dfef70f-d548-4ccf-8fa0-bfc9d89b2384	page_view	engagement	view	\N	839	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:08:17.527	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 839}	2025-11-11 00:08:17.528618
06770e04-0522-4562-9d1e-691c0c2f3feb	982fd39c-bee6-4033-8da9-15c89169343b	baa95f8f-9fe4-4e39-88b6-47127ef31617	page_view	engagement	view	\N	28	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:08:18.19	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 28}	2025-11-11 00:08:18.191629
acf2632a-b525-4f65-bbf3-33d39a58a0d4	982fd39c-bee6-4033-8da9-15c89169343b	baa95f8f-9fe4-4e39-88b6-47127ef31617	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:08:18.19	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:08:18.287264
19d00638-24e4-4fb5-b6ec-f1f2549adb55	982fd39c-bee6-4033-8da9-15c89169343b	33a47b7e-4ddc-4e6c-b9cb-87c5d238ded2	page_view	engagement	view	\N	1502	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:08:20.954	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1502}	2025-11-11 00:08:20.95542
d759cc4c-14e5-4de2-a3bc-f5a7b77d2b62	982fd39c-bee6-4033-8da9-15c89169343b	33a47b7e-4ddc-4e6c-b9cb-87c5d238ded2	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:08:20.954	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:08:20.95555
b478affb-868a-4555-afe0-71be0b91a58b	982fd39c-bee6-4033-8da9-15c89169343b	b80f2d70-0731-490b-8b4a-c1f4a3e2b5ce	page_view	engagement	view	\N	1025	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:08:30.152	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1025}	2025-11-11 00:08:30.153952
703b84a2-195e-452b-9b0c-0c3f7af40e57	982fd39c-bee6-4033-8da9-15c89169343b	b80f2d70-0731-490b-8b4a-c1f4a3e2b5ce	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:08:30.152	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:08:30.154193
f835d356-080f-4828-b854-28aea0970eaa	982fd39c-bee6-4033-8da9-15c89169343b	dab379c2-3f0a-497f-abd7-19a310e600e1	page_view	engagement	view	\N	8	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:08:42.502	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 8}	2025-11-11 00:08:42.50305
bcdfd978-ae0e-41a2-91b8-e08e2280a057	982fd39c-bee6-4033-8da9-15c89169343b	dab379c2-3f0a-497f-abd7-19a310e600e1	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:08:42.502	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:08:42.503122
987dcefe-d677-4233-8fbc-0e0c9d33ac2f	982fd39c-bee6-4033-8da9-15c89169343b	c55c11ba-2a37-421e-8dfd-63f39153fa84	page_view	engagement	view	\N	1018	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:08:56.214	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1018}	2025-11-11 00:08:56.215432
8b9bc0f0-5427-4871-872a-b730390d4c81	982fd39c-bee6-4033-8da9-15c89169343b	c55c11ba-2a37-421e-8dfd-63f39153fa84	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:08:56.214	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:08:56.215579
c194573a-dd6b-4fdd-a7fa-c67c3062f96e	982fd39c-bee6-4033-8da9-15c89169343b	39919793-fd25-43fc-a85a-6e76c41ab9a1	page_view	engagement	view	\N	5	/api/v1/themes/users/dark-mode	/users/dark-mode	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:09:01.199	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 5}	2025-11-11 00:09:01.200189
888a472e-3a35-49d1-abca-b09590161e8e	982fd39c-bee6-4033-8da9-15c89169343b	39919793-fd25-43fc-a85a-6e76c41ab9a1	api_interaction	engagement	post	\N	\N	/api/v1/themes/users/dark-mode	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:09:01.199	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:09:01.200256
7cfb36b8-45a8-44bf-ba6b-8d8d19ef836a	982fd39c-bee6-4033-8da9-15c89169343b	7ef811eb-80fe-436b-a814-9640f86b9c1f	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:10:11.234	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:10:11.235815
fb414623-7b69-4c72-9e74-a09ca55f9b9d	982fd39c-bee6-4033-8da9-15c89169343b	7ef811eb-80fe-436b-a814-9640f86b9c1f	page_view	engagement	view	\N	1013	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:10:11.234	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1013}	2025-11-11 00:10:11.235461
271e43ce-cdde-4151-998b-e5650b016b43	982fd39c-bee6-4033-8da9-15c89169343b	d5f3cc8e-c263-47f7-9070-a34885220666	page_view	engagement	view	\N	290	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:14:23.835	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 290}	2025-11-11 00:14:23.837183
56baa4b1-976f-4c35-aa61-b5fb7bd522ae	982fd39c-bee6-4033-8da9-15c89169343b	f06397c7-1db4-43a8-8647-3df5c7a64f52	page_view	engagement	view	\N	373	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.4	desktop	unknown	unknown	\N	\N	2025-11-11 00:14:23.855	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 373}	2025-11-11 00:14:23.856618
329c1595-d908-428f-8e77-7bd3348cf8be	982fd39c-bee6-4033-8da9-15c89169343b	d5f3cc8e-c263-47f7-9070-a34885220666	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:14:23.836	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:14:24.037871
711ea988-9d66-4712-b237-9275db88047a	982fd39c-bee6-4033-8da9-15c89169343b	f06397c7-1db4-43a8-8647-3df5c7a64f52	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:14:23.855	{"query": {}, "statusCode": 304}	2025-11-11 00:14:24.043789
347d5d9c-94ee-40fc-93e3-a930ebcc5725	982fd39c-bee6-4033-8da9-15c89169343b	f1845d66-db83-4c29-b3e9-03abdaa13068	page_view	engagement	view	\N	159	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:37:12.434	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 159}	2025-11-11 00:37:12.434605
b4ab612b-53eb-4a9b-b26b-1b756e2b5657	982fd39c-bee6-4033-8da9-15c89169343b	56e44eab-8440-4a55-adcd-02de32a447aa	page_view	engagement	view	\N	267	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:37:12.449	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 267}	2025-11-11 00:37:12.450101
a58ca856-aa3d-411f-a862-6a041718402c	982fd39c-bee6-4033-8da9-15c89169343b	f1845d66-db83-4c29-b3e9-03abdaa13068	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:37:12.434	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:37:12.531494
9232229c-5115-4124-9c67-2262bce028a1	982fd39c-bee6-4033-8da9-15c89169343b	56e44eab-8440-4a55-adcd-02de32a447aa	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:37:12.449	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:37:12.53377
abe5707f-38d6-4db0-a2d3-725e37b73700	982fd39c-bee6-4033-8da9-15c89169343b	42ba0143-35fd-4f0f-b12a-31a10055ed55	page_view	engagement	view	\N	202	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:00.307	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 202}	2025-11-11 00:51:00.308662
72fa8ca2-6b02-43a0-bff2-e27c0c6a8a73	982fd39c-bee6-4033-8da9-15c89169343b	fc0cdcd5-abc6-40a6-ab85-7d86d23572e0	page_view	engagement	view	\N	165	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.29	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:00.296	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 165}	2025-11-11 00:51:00.298272
493e19f9-b23d-43bb-9e77-6b56a91da317	982fd39c-bee6-4033-8da9-15c89169343b	fc0cdcd5-abc6-40a6-ab85-7d86d23572e0	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:00.297	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:51:00.410087
f4cb2bce-0d5c-4689-835f-531b406fcc97	982fd39c-bee6-4033-8da9-15c89169343b	42ba0143-35fd-4f0f-b12a-31a10055ed55	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:00.307	{"query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:51:00.415109
f729f6ff-b05a-44ee-9e21-2954169d8aea	982fd39c-bee6-4033-8da9-15c89169343b	311a4363-3463-47b0-abd9-71a11a5f9ca7	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:05.234	{"query": {}, "statusCode": 304}	2025-11-11 00:51:05.235723
4e37d33e-974f-447a-8ecb-88616b881bd6	982fd39c-bee6-4033-8da9-15c89169343b	311a4363-3463-47b0-abd9-71a11a5f9ca7	page_view	engagement	view	\N	21	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:05.234	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 21}	2025-11-11 00:51:05.235587
78793775-01a7-4a9d-8aff-19404cb03b7f	982fd39c-bee6-4033-8da9-15c89169343b	34907ad5-f5db-4d9b-a57f-8f61a5aaae80	page_view	engagement	view	\N	37	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:05.242	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 37}	2025-11-11 00:51:05.243943
64b4bb3c-9a3b-4545-9682-022bfc609f5e	982fd39c-bee6-4033-8da9-15c89169343b	34907ad5-f5db-4d9b-a57f-8f61a5aaae80	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:05.242	{"query": {}, "statusCode": 304}	2025-11-11 00:51:05.244291
ff0dfd0e-806d-4846-a196-24f618ed1047	\N	07757497-c89b-46af-bd03-fee4a9a415fa	page_view	engagement	view	\N	688	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:24.404	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 688}	2025-11-11 00:51:24.405085
70d20429-0cec-413b-b413-abb31bf82e8e	982fd39c-bee6-4033-8da9-15c89169343b	304499df-2eff-4c7a-bbf8-f653181f92c1	page_view	engagement	view	\N	45	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:24.956	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 45}	2025-11-11 00:51:24.958127
11e85298-b004-4d62-9331-767ae1b30034	982fd39c-bee6-4033-8da9-15c89169343b	304499df-2eff-4c7a-bbf8-f653181f92c1	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:24.956	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:51:24.959131
36f2db73-a4ae-495a-a430-bc568c102f57	982fd39c-bee6-4033-8da9-15c89169343b	9a13d1cb-1100-4deb-a35c-665825b6fe78	page_view	engagement	view	\N	1075	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:27.726	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1075}	2025-11-11 00:51:27.727101
6440628d-c817-4b54-aa15-9120baa6c964	982fd39c-bee6-4033-8da9-15c89169343b	9a13d1cb-1100-4deb-a35c-665825b6fe78	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:27.726	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:51:27.727195
5f95f742-672e-4c62-ae39-bf93d8d435f7	982fd39c-bee6-4033-8da9-15c89169343b	37148725-17da-47a6-85e3-dac6bb2cf68c	page_view	engagement	view	\N	1031	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:43.971	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1031}	2025-11-11 00:51:43.972644
9dc208fb-c894-477b-91e3-f4a3be016d1e	982fd39c-bee6-4033-8da9-15c89169343b	37148725-17da-47a6-85e3-dac6bb2cf68c	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:43.971	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:51:43.972829
104be097-e9b9-455f-b9e4-ed4e4f41bb01	982fd39c-bee6-4033-8da9-15c89169343b	7c5599e8-168a-456c-89c5-9112d2188adc	page_view	engagement	view	\N	1113	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:52.302	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1113}	2025-11-11 00:51:52.30323
2457b758-e76b-456d-ac57-a8f400a8c1db	982fd39c-bee6-4033-8da9-15c89169343b	7c5599e8-168a-456c-89c5-9112d2188adc	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:52.302	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:51:52.303318
4a1e06a9-69c4-4c3f-973f-6e35101ef74d	982fd39c-bee6-4033-8da9-15c89169343b	bab3a3e7-b7eb-4788-8560-977eba269b75	page_view	engagement	view	\N	19	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:51:55.548	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 19}	2025-11-11 00:51:55.549305
88842668-d9c0-488c-abbb-1fc5430b7b86	982fd39c-bee6-4033-8da9-15c89169343b	bab3a3e7-b7eb-4788-8560-977eba269b75	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:51:55.548	{"query": {}, "statusCode": 304}	2025-11-11 00:51:55.549556
b191c01e-7ac7-48be-88a1-6a096c67d228	982fd39c-bee6-4033-8da9-15c89169343b	4fb99ee8-a033-4fd4-891b-33c30cb6a681	page_view	engagement	view	\N	15	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:52:06.618	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 15}	2025-11-11 00:52:06.619663
94932a29-8b31-4fa4-a408-327223999be5	982fd39c-bee6-4033-8da9-15c89169343b	d4eb794f-ec73-4257-ac88-c9384d0e3f3f	page_view	engagement	view	\N	12	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:52:06.621	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 12}	2025-11-11 00:52:06.622491
2140036e-4cb9-4d0f-9b45-941067ace94b	982fd39c-bee6-4033-8da9-15c89169343b	4fb99ee8-a033-4fd4-891b-33c30cb6a681	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:52:06.619	{"query": {}, "statusCode": 304}	2025-11-11 00:52:06.78695
4f0c8d29-43b7-4669-8e20-c17ebcd95f50	982fd39c-bee6-4033-8da9-15c89169343b	d4eb794f-ec73-4257-ac88-c9384d0e3f3f	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:52:06.621	{"query": {}, "statusCode": 304}	2025-11-11 00:52:06.79371
4d0f1d95-206b-4301-bcc0-7f40828af51e	\N	f49746cd-4a12-4089-91f2-f4ab024cbfe4	page_view	engagement	view	\N	1176	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:54:00.683	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 1176}	2025-11-11 00:54:00.684114
7eb04b4c-babf-4b64-9e15-60780c486d78	982fd39c-bee6-4033-8da9-15c89169343b	7105ac3f-6bbb-4a5d-8871-81dbb5431eb6	page_view	engagement	view	\N	18	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:54:01.756	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 18}	2025-11-11 00:54:01.757759
4c3c293d-6fb1-4c6c-a382-73e4fd27a726	982fd39c-bee6-4033-8da9-15c89169343b	7105ac3f-6bbb-4a5d-8871-81dbb5431eb6	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:54:01.756	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:54:01.85574
02b086c8-75e8-440b-b1f9-a8b8719ddc68	982fd39c-bee6-4033-8da9-15c89169343b	c8ea8048-2b41-4ef2-9555-68d1924d4029	page_view	engagement	view	\N	1073	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:54:04.198	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1073}	2025-11-11 00:54:04.19975
6cec2b40-daf5-4d5e-b270-10ff98eaf3d5	982fd39c-bee6-4033-8da9-15c89169343b	c8ea8048-2b41-4ef2-9555-68d1924d4029	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:54:04.198	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:54:04.199978
49faf4c4-06f9-44f2-a49a-2f95e0ef23fa	982fd39c-bee6-4033-8da9-15c89169343b	1bbfc865-31e5-40b9-bdac-7e703e4f25ac	page_view	engagement	view	\N	1067	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:54:22.631	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1067}	2025-11-11 00:54:22.632305
6bfea485-2ebc-4f72-8c22-f663b052b162	982fd39c-bee6-4033-8da9-15c89169343b	1bbfc865-31e5-40b9-bdac-7e703e4f25ac	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:54:22.631	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:54:22.632587
c7d0e8b4-f075-4615-9470-bb272f8df5c4	982fd39c-bee6-4033-8da9-15c89169343b	1dc970a5-4107-422c-9a8b-443b23090db3	page_view	engagement	view	\N	179	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:55:32.492	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 179}	2025-11-11 00:55:32.493351
5edca72a-69c9-48fc-b0a0-b08b24155f7c	982fd39c-bee6-4033-8da9-15c89169343b	5264543a-fcce-41e0-8a4d-57a3351aaabf	page_view	engagement	view	\N	180	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:55:32.502	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 180}	2025-11-11 00:55:32.502902
58823b99-7394-411b-b85f-10240586c40a	982fd39c-bee6-4033-8da9-15c89169343b	1dc970a5-4107-422c-9a8b-443b23090db3	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:55:32.492	{"query": {}, "statusCode": 304}	2025-11-11 00:55:32.586811
be217167-cea0-4563-a350-062f633a3c06	982fd39c-bee6-4033-8da9-15c89169343b	5264543a-fcce-41e0-8a4d-57a3351aaabf	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:55:32.502	{"query": {}, "statusCode": 304}	2025-11-11 00:55:32.594294
b5de7cfd-1b80-4730-be67-06274bb0bfb3	\N	3d65596b-3b54-4f46-a82a-744e31aff9aa	page_view	engagement	view	\N	725	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:55:41.697	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 725}	2025-11-11 00:55:41.69794
5991c55b-3b8d-4fb3-b661-a1a90e4d6b28	982fd39c-bee6-4033-8da9-15c89169343b	a3ece592-1522-446c-956b-8f46758513a2	page_view	engagement	view	\N	28	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:55:42.442	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 28}	2025-11-11 00:55:42.442671
9929d63e-7685-4c9e-a515-15e443a0efdd	982fd39c-bee6-4033-8da9-15c89169343b	a3ece592-1522-446c-956b-8f46758513a2	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:55:42.442	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:55:42.443069
f7001f2f-2370-4b7c-8bd6-5ef9ad535062	982fd39c-bee6-4033-8da9-15c89169343b	b9ead768-794f-436d-bd33-675bbd7dca9a	page_view	engagement	view	\N	1037	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:55:44.819	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1037}	2025-11-11 00:55:44.820229
64d4760f-f559-4038-a202-31ae4cee83cd	982fd39c-bee6-4033-8da9-15c89169343b	b9ead768-794f-436d-bd33-675bbd7dca9a	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:55:44.819	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:55:44.820412
1f4b0949-1f8c-4eb4-96c0-646a07ac9c28	982fd39c-bee6-4033-8da9-15c89169343b	235fd725-85e4-4618-9e0e-0765661e8c46	page_view	engagement	view	\N	27	/api/v1/chats	/	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:55:53.903	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 27}	2025-11-11 00:55:53.904398
7bbe66ae-4465-4b2f-a762-6be179bc2327	982fd39c-bee6-4033-8da9-15c89169343b	235fd725-85e4-4618-9e0e-0765661e8c46	api_interaction	engagement	get	\N	\N	/api/v1/chats	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:55:53.903	{"query": {}, "statusCode": 304}	2025-11-11 00:55:53.905119
0030e1fd-c43b-47db-945d-765ab576515c	982fd39c-bee6-4033-8da9-15c89169343b	2ef7c0b8-f6c5-457c-b5b9-9781a9d3c19e	page_view	engagement	view	\N	1171	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:56:25.458	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1171}	2025-11-11 00:56:25.458916
b28a9821-ec5a-4ac7-9767-1f18cad2971e	982fd39c-bee6-4033-8da9-15c89169343b	2ef7c0b8-f6c5-457c-b5b9-9781a9d3c19e	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:56:25.458	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:56:25.526778
dbb1c732-ed0d-4989-b240-84b1af8f6a0b	\N	11a591a1-131f-418d-adc1-d37cfb3c201a	page_view	engagement	view	\N	847	/api/v1/auth/login	/login	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:58:50.225	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 847}	2025-11-11 00:58:50.227126
d2b1e20b-3b36-443e-92d5-fb2114a24136	982fd39c-bee6-4033-8da9-15c89169343b	9633cb85-e091-416a-8dce-cd5a1e086598	page_view	engagement	view	\N	24	/api/v1/store/items	/items	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:58:50.485	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 24}	2025-11-11 00:58:50.486744
a89b323d-5083-415e-b121-259efc1a0507	982fd39c-bee6-4033-8da9-15c89169343b	d7b74423-8775-4e37-95c3-17ce478af56b	api_interaction	engagement	get	\N	\N	/api/v1/themes/users/theme	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:58:50.565	{"query": {}, "statusCode": 304}	2025-11-11 00:58:50.566406
40bca850-ae1d-4bc3-b006-635f2ca8c558	982fd39c-bee6-4033-8da9-15c89169343b	d7b74423-8775-4e37-95c3-17ce478af56b	page_view	engagement	view	\N	98	/api/v1/themes/users/theme	/users/theme	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:58:50.565	{"query": {}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 98}	2025-11-11 00:58:50.566306
fb08d715-f50d-4e1a-8dc7-7348de6ff41a	982fd39c-bee6-4033-8da9-15c89169343b	9633cb85-e091-416a-8dce-cd5a1e086598	api_interaction	engagement	get	\N	\N	/api/v1/store/items	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:58:50.485	{"query": {}, "statusCode": 304}	2025-11-11 00:58:50.570218
327c1bc6-84ca-47a5-9a8f-22b83fc06732	982fd39c-bee6-4033-8da9-15c89169343b	017c1b75-c6ea-4e74-b988-665d4a9943f7	page_view	engagement	view	\N	37	/api/v1/device-tokens/register	/register	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:58:50.768	{"query": {}, "method": "POST", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 200, "responseTime": 37}	2025-11-11 00:58:50.769708
5ae1ef11-57d2-4573-ae54-cfc45f90c214	982fd39c-bee6-4033-8da9-15c89169343b	017c1b75-c6ea-4e74-b988-665d4a9943f7	api_interaction	engagement	post	\N	\N	/api/v1/device-tokens/register	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:58:50.768	{"body": "[REDACTED]", "query": {}, "statusCode": 200, "contentType": "application/json; charset=utf-8"}	2025-11-11 00:58:50.770052
88524215-932a-4d40-b5ef-c4b5cb91a6b5	982fd39c-bee6-4033-8da9-15c89169343b	45ccd559-c0fa-47d2-a466-cd2f0a612f3c	page_view	engagement	view	\N	1041	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:58:53.446	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1041}	2025-11-11 00:58:53.447454
f7a049c8-e5c3-471e-ae81-0a1ff0060be1	982fd39c-bee6-4033-8da9-15c89169343b	45ccd559-c0fa-47d2-a466-cd2f0a612f3c	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:58:53.446	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:58:53.448287
0942ead3-c1d5-47af-a3d0-7f0387b38f5e	982fd39c-bee6-4033-8da9-15c89169343b	3b8cea9f-a086-4449-954b-362c6bcf049d	api_interaction	engagement	get	\N	\N	/api/v1/posts/feed?page=1&limit=20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-11 00:59:02.968	{"query": {"page": "1", "limit": "20"}, "statusCode": 304}	2025-11-11 00:59:02.968721
f94d655f-57ba-429a-820f-b311446ff691	982fd39c-bee6-4033-8da9-15c89169343b	3b8cea9f-a086-4449-954b-362c6bcf049d	page_view	engagement	view	\N	1026	/api/v1/posts/feed?page=1&limit=20	/feed	\N	okhttp/4.12.0	::ffff:192.168.100.32	desktop	unknown	unknown	\N	\N	2025-11-11 00:59:02.967	{"query": {"page": "1", "limit": "20"}, "method": "GET", "headers": {"accept": "application/json, text/plain, */*"}, "statusCode": 304, "responseTime": 1026}	2025-11-11 00:59:02.968609
\.


--
-- TOC entry 5626 (class 0 OID 34014)
-- Dependencies: 236
-- Data for Name: analytics_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_metrics (id, metric_name, metric_value, metric_type, tags, "timestamp", created_at) FROM stdin;
85a1e089-6441-4939-875a-d44478d3a128	daily_active_users	1.000000	gauge	{"period": "daily"}	2025-11-10 00:00:00	2025-11-11 01:00:00.990153
abfeecc7-d3fe-466f-a581-8263fbff1df5	daily_page_views	301.000000	counter	{"period": "daily"}	2025-11-10 00:00:00	2025-11-11 01:00:01.017521
\.


--
-- TOC entry 5627 (class 0 OID 34029)
-- Dependencies: 237
-- Data for Name: analytics_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_reports (id, report_type, report_name, date_range_start, date_range_end, data, generated_at, created_at) FROM stdin;
\.


--
-- TOC entry 5617 (class 0 OID 33819)
-- Dependencies: 227
-- Data for Name: blocked_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_users (id, blocker_id, blocked_id, created_at) FROM stdin;
\.


--
-- TOC entry 5618 (class 0 OID 33840)
-- Dependencies: 228
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, user_id, item_id, quantity, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5654 (class 0 OID 34484)
-- Dependencies: 264
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, post_id, user_id, content, likes_count, replies_count, parent_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5608 (class 0 OID 33620)
-- Dependencies: 218
-- Data for Name: connections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.connections (id, follower_id, following_id, status, created_at) FROM stdin;
63167e23-9a90-4c8b-9abb-a3bdc6692455	8f952bb1-9ff6-4477-93ea-4972efcc383b	da43914e-1f27-42b0-8070-3d222212a043	following	2025-10-31 03:28:26.666
c108bea0-65ae-4db5-85c7-a07dece1161b	8f952bb1-9ff6-4477-93ea-4972efcc383b	413719c0-2a04-445d-ba47-0f3a88d40471	following	2025-11-09 17:06:59.755
e693775f-1f73-4602-a47e-04b212b7f349	8f952bb1-9ff6-4477-93ea-4972efcc383b	44393f55-fc53-4050-a244-6fc49bc9e2db	following	2025-10-27 15:42:09.709
ff695370-9493-4080-b986-9e48d7744843	8f952bb1-9ff6-4477-93ea-4972efcc383b	57a82d0a-cd78-427e-baaf-afb253178536	following	2025-10-31 12:04:03.331
d30d0c5b-f486-4cfc-b25a-a209f0135991	8f952bb1-9ff6-4477-93ea-4972efcc383b	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	following	2025-10-16 01:26:43.957
fd560f0c-2710-43eb-9748-b4f049e49677	413719c0-2a04-445d-ba47-0f3a88d40471	57a82d0a-cd78-427e-baaf-afb253178536	following	2025-10-21 06:12:03.921
44e30247-6c80-4725-a00e-9de3b811ec76	413719c0-2a04-445d-ba47-0f3a88d40471	da43914e-1f27-42b0-8070-3d222212a043	following	2025-10-28 23:32:40.212
dcb197db-83fb-4eda-946c-bb470beef11f	413719c0-2a04-445d-ba47-0f3a88d40471	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	following	2025-10-19 12:25:58.609
76dc3d63-ed1b-4e7d-b541-effae7861d72	413719c0-2a04-445d-ba47-0f3a88d40471	44393f55-fc53-4050-a244-6fc49bc9e2db	following	2025-10-28 01:55:59.077
f357c2a3-0ece-4242-8fd3-78fa018107af	413719c0-2a04-445d-ba47-0f3a88d40471	8f952bb1-9ff6-4477-93ea-4972efcc383b	following	2025-10-12 16:56:05.576
24a13a84-36c9-4fe1-beea-9c35bde0ca48	44393f55-fc53-4050-a244-6fc49bc9e2db	8f952bb1-9ff6-4477-93ea-4972efcc383b	following	2025-10-30 06:29:56.671
10e0baee-0a51-4104-af56-586f36fc19b1	44393f55-fc53-4050-a244-6fc49bc9e2db	413719c0-2a04-445d-ba47-0f3a88d40471	following	2025-11-03 03:55:25.429
2dce85ef-d2b2-40c6-8ecf-e16fdbffcef3	44393f55-fc53-4050-a244-6fc49bc9e2db	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	following	2025-10-14 12:31:33.316
d5f299e1-1a8e-4486-aa57-ba744b7ac326	44393f55-fc53-4050-a244-6fc49bc9e2db	da43914e-1f27-42b0-8070-3d222212a043	following	2025-10-25 01:58:32.406
136d69f9-69e8-4044-babe-582a595d9e5d	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	da43914e-1f27-42b0-8070-3d222212a043	following	2025-11-09 10:47:27.59
c1734213-12ea-4ca8-87f8-2beb44828919	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	413719c0-2a04-445d-ba47-0f3a88d40471	following	2025-11-06 18:08:10.862
160f681e-98f5-4b03-aba0-2ed1ce12d2e2	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	44393f55-fc53-4050-a244-6fc49bc9e2db	following	2025-10-18 16:17:02.097
68e1d263-5b10-440d-aa78-d477a8ed390b	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	8f952bb1-9ff6-4477-93ea-4972efcc383b	following	2025-10-31 04:22:20.003
131c1b4e-6ee3-4006-a017-b39c15bfe6bc	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	57a82d0a-cd78-427e-baaf-afb253178536	following	2025-10-21 22:37:27.825
035b3350-2539-4210-b4fc-e6c912a70efc	da43914e-1f27-42b0-8070-3d222212a043	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	following	2025-10-14 14:15:15.267
27cdba82-60e9-4b30-923f-fc22a326edae	da43914e-1f27-42b0-8070-3d222212a043	57a82d0a-cd78-427e-baaf-afb253178536	following	2025-10-28 16:41:56.157
cb56cc0d-60a9-40be-981b-d0fc9a5f9d88	da43914e-1f27-42b0-8070-3d222212a043	44393f55-fc53-4050-a244-6fc49bc9e2db	following	2025-10-16 10:46:50.003
cd6b99c7-9a27-403a-bc83-fd08000de143	da43914e-1f27-42b0-8070-3d222212a043	413719c0-2a04-445d-ba47-0f3a88d40471	following	2025-11-01 18:14:02.458
cdae1b0b-bb41-43e5-8637-ee102c152791	da43914e-1f27-42b0-8070-3d222212a043	8f952bb1-9ff6-4477-93ea-4972efcc383b	following	2025-10-26 10:17:22.125
1f7726e8-b5ea-4f54-970d-7f43c13b1448	57a82d0a-cd78-427e-baaf-afb253178536	8f952bb1-9ff6-4477-93ea-4972efcc383b	following	2025-10-24 03:57:08.553
28ba619a-a643-4325-a56b-281c3474a9cd	57a82d0a-cd78-427e-baaf-afb253178536	413719c0-2a04-445d-ba47-0f3a88d40471	following	2025-10-15 06:09:12.632
8df07ea6-9e62-45ad-83ff-54109bbc8e3b	57a82d0a-cd78-427e-baaf-afb253178536	44393f55-fc53-4050-a244-6fc49bc9e2db	following	2025-10-23 22:30:53.175
263165f1-fade-49a4-b856-c85e92abdf5d	57a82d0a-cd78-427e-baaf-afb253178536	da43914e-1f27-42b0-8070-3d222212a043	following	2025-10-29 06:23:33.092
ff9a22b6-b235-48c8-9ebe-d9e23df67660	57a82d0a-cd78-427e-baaf-afb253178536	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	following	2025-10-26 23:37:19.659
c3c33cac-fe6a-478f-8665-a8eb599420e8	44393f55-fc53-4050-a244-6fc49bc9e2db	57a82d0a-cd78-427e-baaf-afb253178536	following	2025-10-25 14:40:40.541
\.


--
-- TOC entry 5651 (class 0 OID 34390)
-- Dependencies: 261
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, participant1_id, participant2_id, last_message_id, last_message_at, unread_count1, unread_count2, created_at, updated_at, deleted_at) FROM stdin;
cf69b1be-ce17-4209-8e4a-17ff84aaee12	8f952bb1-9ff6-4477-93ea-4972efcc383b	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	\N	2025-11-09 19:46:59.753	0	0	2025-11-11 00:24:09.252	2025-11-11 00:24:09.251749	\N
f4e94db2-ce99-4fb8-b505-37a586e0d6a2	413719c0-2a04-445d-ba47-0f3a88d40471	da43914e-1f27-42b0-8070-3d222212a043	\N	2025-11-10 18:58:29.721	0	0	2025-11-11 00:24:09.312	2025-11-11 00:24:09.251749	\N
50440b3c-bee1-49c9-933f-180250f7933f	44393f55-fc53-4050-a244-6fc49bc9e2db	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	\N	2025-11-10 13:38:31.801	0	0	2025-11-11 00:24:09.326	2025-11-11 00:24:09.251749	\N
e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	da43914e-1f27-42b0-8070-3d222212a043	\N	2025-11-10 10:20:26.16	0	0	2025-11-11 00:24:09.331	2025-11-11 00:24:09.251749	\N
28084f10-cb9a-4a6e-a91a-257175d642fa	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	da43914e-1f27-42b0-8070-3d222212a043	\N	2025-11-10 21:28:32.72	0	0	2025-11-11 00:24:09.339	2025-11-11 00:24:09.251749	\N
352d5264-c0d0-493d-af1d-0b827ece0fe8	44393f55-fc53-4050-a244-6fc49bc9e2db	57a82d0a-cd78-427e-baaf-afb253178536	\N	2025-11-09 10:28:45.373	0	0	2025-11-11 00:26:30.27	2025-11-11 00:26:30.26967	\N
69dec7be-60d2-480f-9fec-58a25bcb779d	8f952bb1-9ff6-4477-93ea-4972efcc383b	da43914e-1f27-42b0-8070-3d222212a043	\N	2025-11-10 21:24:15.361	0	0	2025-11-11 00:27:02.305	2025-11-11 00:27:02.305303	\N
d248a029-05a0-47c4-bb21-9b867aa7a5cf	57a82d0a-cd78-427e-baaf-afb253178536	8f952bb1-9ff6-4477-93ea-4972efcc383b	\N	2025-11-10 11:27:15.921	0	0	2025-11-11 00:27:02.329	2025-11-11 00:27:02.305303	\N
77b44005-fb71-4315-9727-7b05ed04c99c	413719c0-2a04-445d-ba47-0f3a88d40471	57a82d0a-cd78-427e-baaf-afb253178536	\N	2025-11-10 07:06:24.594	0	0	2025-11-11 00:27:02.334	2025-11-11 00:27:02.305303	\N
af632214-31a9-481d-8942-694fe3e619db	57a82d0a-cd78-427e-baaf-afb253178536	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	\N	2025-11-08 17:03:14.025	0	0	2025-11-11 00:27:02.341	2025-11-11 00:27:02.305303	\N
8a06755c-dfd4-4af6-814c-d9295738aab8	44393f55-fc53-4050-a244-6fc49bc9e2db	8f952bb1-9ff6-4477-93ea-4972efcc383b	\N	2025-11-08 03:47:47.105	0	0	2025-11-11 00:27:02.344	2025-11-11 00:27:02.305303	\N
\.


--
-- TOC entry 5648 (class 0 OID 34293)
-- Dependencies: 258
-- Data for Name: deep_link_clicks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deep_link_clicks (id, deep_link_id, user_agent, ip_address, referrer, clicked_at) FROM stdin;
\.


--
-- TOC entry 5646 (class 0 OID 34273)
-- Dependencies: 256
-- Data for Name: deep_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deep_links (id, content_type, content_id, short_code, long_url, platform, campaign, metadata, click_count, last_clicked_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5620 (class 0 OID 33884)
-- Dependencies: 230
-- Data for Name: device_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_tokens (id, user_id, token, platform, device_id, app_version, active, last_used_at, created_at, updated_at) FROM stdin;
ecf78732-ea4d-45ea-bf10-20940b28d1d1	982fd39c-bee6-4033-8da9-15c89169343b	eE64jrBIQ0CeKxT59vQhfC:APA91bGP6TYkH-e7gBhEWc68UfJIazivF2ApA2uEaqGVEausR8oPJpiMY0KRObMAVYS32LkUOYFX-n8xE1MtyquLwPG6xy5ROQQ6im8Wd50-bwMfTB1fNss	android	1	1.0.0	f	2025-11-10 23:49:31.720651	2025-11-10 23:21:03.231834	2025-11-10 23:49:31.720651
1e8d5d10-e0df-4557-a6b6-5de263469ee4	982fd39c-bee6-4033-8da9-15c89169343b	fz-YyL0gSFKRCs6FR1kl5B:APA91bFum5nmDpoNyYXDnEb6SNZDMqptLose0JoA21utwTY58sSqG-mrzHl46sbAqnjK8SrIWEJhgu7N6kEIyJDBxTTyEMt4vb_uXCuLlhoPYJagUdlPVsw	android	1	1.0.0	f	2025-11-11 00:08:18.187079	2025-11-10 20:52:33.321954	2025-11-11 00:08:18.187079
447b4502-82d8-4177-b24d-0a9514b9af52	982fd39c-bee6-4033-8da9-15c89169343b	fz_JUU6sQKmczEzUZPS2sK:APA91bG06qKNk5-tTGc8pmAQ7fTmfJLx8ktDVKDzcC2Og527WYKLc7aGGwaz1296lMBZ0LF8ANERRNc-YM3NZ9lZ6a1oWLNalKsF7VMAu3rH4fjkg620_AM	android	1	1.0.0	t	2025-11-11 00:58:50.764178	2025-11-10 23:38:09.623518	2025-11-11 00:58:50.764178
\.


--
-- TOC entry 5622 (class 0 OID 33928)
-- Dependencies: 232
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_verification_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5610 (class 0 OID 33666)
-- Dependencies: 220
-- Data for Name: event_attendees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_attendees (id, event_id, user_id, status, registered_at) FROM stdin;
067b1b0b-c6cf-4eac-88c4-382aff1ccb98	71e503e2-e0cd-4d28-8aed-639f62940f51	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:24:09.169081
e05a7a72-d329-402d-9551-769b9ad97d6c	71e503e2-e0cd-4d28-8aed-639f62940f51	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:24:09.169081
17ed6c63-f962-4699-9aef-e10a40b5fe87	2ebeefba-6269-491d-b71a-efb0d6d06926	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:24:09.169081
6d575315-ed78-40b2-915f-e85622317506	2ebeefba-6269-491d-b71a-efb0d6d06926	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	attending	2025-11-11 00:24:09.169081
2c3c7b35-adf6-4768-8494-02597b79172c	487f7fcf-1278-44a7-85d7-148d7862d569	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	attending	2025-11-11 00:24:09.169081
a48d8ad7-2435-40ca-b1ff-7118a25e6928	487f7fcf-1278-44a7-85d7-148d7862d569	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:24:09.169081
f067facf-517b-4b9e-a098-ef6443e336b8	db9a4d4a-e245-48af-947b-f1d2427bda02	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:25:26.723142
7268855b-becf-4e78-8ccf-d69eec28b1d0	db9a4d4a-e245-48af-947b-f1d2427bda02	da43914e-1f27-42b0-8070-3d222212a043	attending	2025-11-11 00:25:26.723142
2661d249-8c29-4496-ae1f-c47450d2cb2a	f184679d-f303-42e7-80f0-afbc590fa61b	57a82d0a-cd78-427e-baaf-afb253178536	attending	2025-11-11 00:25:26.723142
dae5c368-2dee-421f-85b2-b141280bb16a	f184679d-f303-42e7-80f0-afbc590fa61b	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:25:26.723142
0d083e26-17e6-4332-8e7e-c7a841230c45	f07af8bd-5709-4289-ae72-5f0b9a0aa18e	da43914e-1f27-42b0-8070-3d222212a043	attending	2025-11-11 00:25:26.723142
b03b1bec-e233-4412-aa98-3316eb1373a8	f07af8bd-5709-4289-ae72-5f0b9a0aa18e	57a82d0a-cd78-427e-baaf-afb253178536	attending	2025-11-11 00:25:26.723142
f3229784-fc39-402e-8d0d-4bdc8d559fa1	998a115a-de91-4ca4-b21d-c2150e94739a	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:26:02.289939
43001928-004d-44ac-9181-92a7c5c45cd9	998a115a-de91-4ca4-b21d-c2150e94739a	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:26:02.289939
495df15a-17c5-4216-bb52-8b4d2f9646f9	e0514b19-9e44-4d10-a999-a5464baae6f8	57a82d0a-cd78-427e-baaf-afb253178536	attending	2025-11-11 00:26:02.289939
27014eb9-4124-4f33-a4df-c4eb8b2d0f1f	e0514b19-9e44-4d10-a999-a5464baae6f8	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:26:02.289939
e6290f58-f67f-4fa2-8cbc-9fe527242d40	b0933c9a-4657-461a-a645-e2141d351351	57a82d0a-cd78-427e-baaf-afb253178536	attending	2025-11-11 00:26:02.289939
13ead78c-e887-4131-8128-b555e7a060d1	b0933c9a-4657-461a-a645-e2141d351351	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:26:02.289939
f244c13d-ed7a-4b1f-8729-f0137c5a231f	16d29702-2768-4e61-95c4-4d8fe2c7a2b9	57a82d0a-cd78-427e-baaf-afb253178536	attending	2025-11-11 00:26:30.248681
acc9d38c-9f30-48cb-b007-1c7542a3a09f	16d29702-2768-4e61-95c4-4d8fe2c7a2b9	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:26:30.248681
5ca366ac-4cad-4e19-9314-4d1478783736	b23917c0-1f09-4ee6-b002-fa73102d6976	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:26:30.248681
6df05ce4-e69d-414a-baa2-beb7326142a5	b23917c0-1f09-4ee6-b002-fa73102d6976	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:26:30.248681
b5d8c407-4012-4cff-87d0-06cab5756f2b	9c009102-5f0e-45be-b32a-022e819d4d31	57a82d0a-cd78-427e-baaf-afb253178536	attending	2025-11-11 00:26:30.248681
415a0077-908e-48ac-8239-4a3ec39ecc1b	9c009102-5f0e-45be-b32a-022e819d4d31	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:26:30.248681
56c1ba6a-43c4-4400-8b86-66d6390dad77	00dfce2d-7083-40d9-8651-f1510dae62d9	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:27:02.282921
623ee637-83dc-42fc-b317-6e11555474cc	00dfce2d-7083-40d9-8651-f1510dae62d9	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:27:02.282921
0ce4cbc8-e03a-4603-af32-3c48559506e9	40752bbf-c405-44b0-a75b-9523f6d10174	da43914e-1f27-42b0-8070-3d222212a043	attending	2025-11-11 00:27:02.282921
4e210b36-ac15-43fa-91de-d94f1e5b7c82	40752bbf-c405-44b0-a75b-9523f6d10174	44393f55-fc53-4050-a244-6fc49bc9e2db	attending	2025-11-11 00:27:02.282921
5f1ff49f-e500-4c8f-91ca-0b4d7e28f46b	6d7eb2e6-3f4d-4a10-9656-0f8acbbef2ae	da43914e-1f27-42b0-8070-3d222212a043	attending	2025-11-11 00:27:02.282921
6213fa65-f1b6-483d-9831-6b49784bc832	6d7eb2e6-3f4d-4a10-9656-0f8acbbef2ae	8f952bb1-9ff6-4477-93ea-4972efcc383b	attending	2025-11-11 00:27:02.282921
\.


--
-- TOC entry 5609 (class 0 OID 33642)
-- Dependencies: 219
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, organizer_id, title, description, event_date, event_time, location, category, audience, max_attendees, current_attendees, registration_fee, image_url, require_registration, allow_waitlist, send_reminders, created_at, updated_at, deleted_at) FROM stdin;
71e503e2-e0cd-4d28-8aed-639f62940f51	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Campus Fashion Show 2024	Annual fashion showcase featuring student designers	2025-11-18	18:00:00	Main Auditorium	fashion	all	200	3	0.00	https://i.imgur.com/Ynh9LMX.jpg	t	t	t	2025-11-11 00:24:09.178	2025-11-11 00:24:09.178	\N
2ebeefba-6269-491d-b71a-efb0d6d06926	8f952bb1-9ff6-4477-93ea-4972efcc383b	Style Workshop: Thrift Edition	Learn how to style thrifted clothing	2025-11-25	18:00:00	Main Auditorium	workshop	all	50	3	5.00	https://i.imgur.com/D3CYJcL.jpg	t	t	t	2025-11-11 00:24:09.238	2025-11-11 00:24:09.238	\N
487f7fcf-1278-44a7-85d7-148d7862d569	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Casual Networking	Network with professionals in business attire	2025-12-02	18:00:00	Main Auditorium	networking	business	30	3	0.00	https://i.imgur.com/JObkVPV.jpg	t	t	t	2025-11-11 00:24:09.241	2025-11-11 00:24:09.241	\N
db9a4d4a-e245-48af-947b-f1d2427bda02	57a82d0a-cd78-427e-baaf-afb253178536	Campus Fashion Show 2024	Annual fashion showcase featuring student designers	2025-11-18	18:00:00	Main Auditorium	fashion	all	200	3	0.00	https://i.imgur.com/Ynh9LMX.jpg	t	t	t	2025-11-11 00:25:26.724	2025-11-11 00:25:26.724	\N
f184679d-f303-42e7-80f0-afbc590fa61b	da43914e-1f27-42b0-8070-3d222212a043	Style Workshop: Thrift Edition	Learn how to style thrifted clothing	2025-11-25	18:00:00	Main Auditorium	workshop	all	50	3	5.00	https://i.imgur.com/D3CYJcL.jpg	t	t	t	2025-11-11 00:25:26.733	2025-11-11 00:25:26.733	\N
f07af8bd-5709-4289-ae72-5f0b9a0aa18e	8f952bb1-9ff6-4477-93ea-4972efcc383b	Business Casual Networking	Network with professionals in business attire	2025-12-02	18:00:00	Main Auditorium	networking	business	30	3	0.00	https://i.imgur.com/JObkVPV.jpg	t	t	t	2025-11-11 00:25:26.737	2025-11-11 00:25:26.737	\N
998a115a-de91-4ca4-b21d-c2150e94739a	57a82d0a-cd78-427e-baaf-afb253178536	Campus Fashion Show 2024	Annual fashion showcase featuring student designers	2025-11-18	18:00:00	Main Auditorium	fashion	all	200	3	0.00	https://i.imgur.com/Ynh9LMX.jpg	t	t	t	2025-11-11 00:26:02.291	2025-11-11 00:26:02.291	\N
e0514b19-9e44-4d10-a999-a5464baae6f8	44393f55-fc53-4050-a244-6fc49bc9e2db	Style Workshop: Thrift Edition	Learn how to style thrifted clothing	2025-11-25	18:00:00	Main Auditorium	workshop	all	50	3	5.00	https://i.imgur.com/D3CYJcL.jpg	t	t	t	2025-11-11 00:26:02.302	2025-11-11 00:26:02.302	\N
b0933c9a-4657-461a-a645-e2141d351351	8f952bb1-9ff6-4477-93ea-4972efcc383b	Business Casual Networking	Network with professionals in business attire	2025-12-02	18:00:00	Main Auditorium	networking	business	30	3	0.00	https://i.imgur.com/JObkVPV.jpg	t	t	t	2025-11-11 00:26:02.305	2025-11-11 00:26:02.305	\N
16d29702-2768-4e61-95c4-4d8fe2c7a2b9	8f952bb1-9ff6-4477-93ea-4972efcc383b	Campus Fashion Show 2024	Annual fashion showcase featuring student designers	2025-11-18	18:00:00	Main Auditorium	fashion	all	200	3	0.00	https://i.imgur.com/Ynh9LMX.jpg	t	t	t	2025-11-11 00:26:30.25	2025-11-11 00:26:30.25	\N
b23917c0-1f09-4ee6-b002-fa73102d6976	57a82d0a-cd78-427e-baaf-afb253178536	Style Workshop: Thrift Edition	Learn how to style thrifted clothing	2025-11-25	18:00:00	Main Auditorium	workshop	all	50	3	5.00	https://i.imgur.com/D3CYJcL.jpg	t	t	t	2025-11-11 00:26:30.259	2025-11-11 00:26:30.259	\N
9c009102-5f0e-45be-b32a-022e819d4d31	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Casual Networking	Network with professionals in business attire	2025-12-02	18:00:00	Main Auditorium	networking	business	30	3	0.00	https://i.imgur.com/JObkVPV.jpg	t	t	t	2025-11-11 00:26:30.262	2025-11-11 00:26:30.262	\N
00dfce2d-7083-40d9-8651-f1510dae62d9	da43914e-1f27-42b0-8070-3d222212a043	Campus Fashion Show 2024	Annual fashion showcase featuring student designers	2025-11-18	18:00:00	Main Auditorium	fashion	all	200	3	0.00	https://i.imgur.com/Ynh9LMX.jpg	t	t	t	2025-11-11 00:27:02.284	2025-11-11 00:27:02.284	\N
40752bbf-c405-44b0-a75b-9523f6d10174	8f952bb1-9ff6-4477-93ea-4972efcc383b	Style Workshop: Thrift Edition	Learn how to style thrifted clothing	2025-11-25	18:00:00	Main Auditorium	workshop	all	50	3	5.00	https://i.imgur.com/D3CYJcL.jpg	t	t	t	2025-11-11 00:27:02.294	2025-11-11 00:27:02.294	\N
6d7eb2e6-3f4d-4a10-9656-0f8acbbef2ae	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Casual Networking	Network with professionals in business attire	2025-12-02	18:00:00	Main Auditorium	networking	business	30	3	0.00	https://i.imgur.com/JObkVPV.jpg	t	t	t	2025-11-11 00:27:02.299	2025-11-11 00:27:02.299	\N
\.


--
-- TOC entry 5655 (class 0 OID 34515)
-- Dependencies: 265
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, user_id, post_id, comment_id, type, created_at) FROM stdin;
\.


--
-- TOC entry 5652 (class 0 OID 34417)
-- Dependencies: 262
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, message_type, created_at, updated_at, deleted_at) FROM stdin;
9f7880d5-6b24-4be0-bd92-72942e0d3ac7	cf69b1be-ce17-4209-8e4a-17ff84aaee12	8f952bb1-9ff6-4477-93ea-4972efcc383b	Want to meet up for coffee?	text	2025-11-06 23:53:32.241	2025-11-06 23:53:32.241	\N
56853a43-722d-4a46-b962-cde2a455b842	cf69b1be-ce17-4209-8e4a-17ff84aaee12	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Have you seen the new store items?	text	2025-11-09 19:46:59.753	2025-11-09 19:46:59.753	\N
0a2b988d-dce0-42c0-8035-dc3ea9058999	cf69b1be-ce17-4209-8e4a-17ff84aaee12	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Have you seen the new store items?	text	2025-11-08 18:13:58.856	2025-11-08 18:13:58.856	\N
0209b4e5-bbf2-47e9-9ffd-6f42c7ceb118	cf69b1be-ce17-4209-8e4a-17ff84aaee12	8f952bb1-9ff6-4477-93ea-4972efcc383b	DM me if you need styling tips!	text	2025-11-06 05:56:11.201	2025-11-06 05:56:11.201	\N
d2bf113d-31df-41af-b2c4-2ac80020f6f5	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	413719c0-2a04-445d-ba47-0f3a88d40471	Have you seen the new store items?	text	2025-11-07 09:13:25.285	2025-11-07 09:13:25.285	\N
3570f90c-3977-495b-b835-ad9a16a47e40	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	413719c0-2a04-445d-ba47-0f3a88d40471	Let's collaborate on a post!	text	2025-11-06 05:07:45.088	2025-11-06 05:07:45.088	\N
3bb2a7da-31cc-4943-b16f-b5e0bfdaa2fa	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	413719c0-2a04-445d-ba47-0f3a88d40471	Love your latest post!	text	2025-11-10 04:25:55.556	2025-11-10 04:25:55.556	\N
87b337a5-ef8b-4494-9b5b-e18dc1b09fcd	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	da43914e-1f27-42b0-8070-3d222212a043	Hey! How are you?	text	2025-11-06 22:03:18.679	2025-11-06 22:03:18.679	\N
0c7a0a42-c893-4a04-8271-a0eaed5f644b	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	da43914e-1f27-42b0-8070-3d222212a043	DM me if you need styling tips!	text	2025-11-05 10:32:45.512	2025-11-05 10:32:45.512	\N
4775c1f2-cd46-4ae3-9ef0-90fd656d6810	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	da43914e-1f27-42b0-8070-3d222212a043	Are you going to the fashion show?	text	2025-11-08 00:06:18.504	2025-11-08 00:06:18.504	\N
e4de36f6-69b5-4178-902c-9f56660e861a	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	da43914e-1f27-42b0-8070-3d222212a043	Hey! How are you?	text	2025-11-10 13:59:51.359	2025-11-10 13:59:51.359	\N
d73f4fb7-0937-4377-ba63-cdd4d31032a7	f4e94db2-ce99-4fb8-b505-37a586e0d6a2	413719c0-2a04-445d-ba47-0f3a88d40471	That outfit looks amazing!	text	2025-11-10 18:58:29.721	2025-11-10 18:58:29.721	\N
a69f4d0a-4ab1-4fd0-87ac-1dd962205640	50440b3c-bee1-49c9-933f-180250f7933f	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	DM me if you need styling tips!	text	2025-11-07 13:49:05.11	2025-11-07 13:49:05.11	\N
39cad510-499a-4cf5-8e4a-a4eaeef0d33e	50440b3c-bee1-49c9-933f-180250f7933f	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Thanks for the follow!	text	2025-11-09 11:27:41.892	2025-11-09 11:27:41.892	\N
a3619eda-f1d6-4cd2-9ff5-1a4897043462	50440b3c-bee1-49c9-933f-180250f7933f	44393f55-fc53-4050-a244-6fc49bc9e2db	Your style is so unique!	text	2025-11-10 13:38:31.801	2025-11-10 13:38:31.801	\N
94192a20-ccca-49f0-9eb8-bead3692af85	50440b3c-bee1-49c9-933f-180250f7933f	44393f55-fc53-4050-a244-6fc49bc9e2db	Hey! How are you?	text	2025-11-09 11:24:30.305	2025-11-09 11:24:30.305	\N
d8149042-d0c0-45bf-b678-c5543f5b03fe	e795a5dd-265e-4dbc-882b-49977458253a	da43914e-1f27-42b0-8070-3d222212a043	That outfit looks amazing!	text	2025-11-08 01:11:52.566	2025-11-08 01:11:52.566	\N
749e0108-bd38-4dc2-80bc-a5cfbd26e7a3	e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	Want to meet up for coffee?	text	2025-11-10 10:20:26.16	2025-11-10 10:20:26.16	\N
eee17e2b-58ba-4614-98ba-773bf6c2cb3b	e795a5dd-265e-4dbc-882b-49977458253a	da43914e-1f27-42b0-8070-3d222212a043	Thanks for the follow!	text	2025-11-08 00:37:12.886	2025-11-08 00:37:12.886	\N
cb0ac166-03aa-4f80-851a-1e0bfca6dd7f	e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	Want to meet up for coffee?	text	2025-11-08 07:25:44.961	2025-11-08 07:25:44.961	\N
3d266792-8a22-43b1-bd3a-113fa3782998	e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	Let's collaborate on a post!	text	2025-11-05 21:42:25.889	2025-11-05 21:42:25.889	\N
7dcdb79e-0cbb-4236-a625-32d8251060ac	e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	DM me if you need styling tips!	text	2025-11-04 17:47:31.675	2025-11-04 17:47:31.675	\N
f53f9883-5590-43e0-b12f-a1b4170ec782	e795a5dd-265e-4dbc-882b-49977458253a	da43914e-1f27-42b0-8070-3d222212a043	Thanks for the follow!	text	2025-11-05 15:01:42.871	2025-11-05 15:01:42.871	\N
83e78022-f97b-4b5f-8580-d21f63ad2711	e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	Let's collaborate on a post!	text	2025-11-05 23:47:49.642	2025-11-05 23:47:49.642	\N
dd2cb0f8-6d34-4ea3-867d-9d2b3915a734	e795a5dd-265e-4dbc-882b-49977458253a	44393f55-fc53-4050-a244-6fc49bc9e2db	Love your latest post!	text	2025-11-04 02:15:08.37	2025-11-04 02:15:08.37	\N
a5b455d6-308c-42cd-becc-bc60abd18fda	e795a5dd-265e-4dbc-882b-49977458253a	da43914e-1f27-42b0-8070-3d222212a043	Hey! How are you?	text	2025-11-08 21:03:27.662	2025-11-08 21:03:27.662	\N
02a98f05-6f15-4754-8704-fca40c9f9b29	28084f10-cb9a-4a6e-a91a-257175d642fa	da43914e-1f27-42b0-8070-3d222212a043	Have you seen the new store items?	text	2025-11-05 00:24:51.13	2025-11-05 00:24:51.13	\N
be049f68-1d14-461c-b2e2-6b61c3139aa0	28084f10-cb9a-4a6e-a91a-257175d642fa	da43914e-1f27-42b0-8070-3d222212a043	Have you seen the new store items?	text	2025-11-06 16:56:41.104	2025-11-06 16:56:41.104	\N
53c77c09-b6a9-41b4-8243-978e5a89de7c	28084f10-cb9a-4a6e-a91a-257175d642fa	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	DM me if you need styling tips!	text	2025-11-09 14:45:37.786	2025-11-09 14:45:37.786	\N
c3655f4a-22a0-459a-a654-7d8d198458b4	28084f10-cb9a-4a6e-a91a-257175d642fa	da43914e-1f27-42b0-8070-3d222212a043	Love your latest post!	text	2025-11-05 00:09:00.095	2025-11-05 00:09:00.095	\N
365aadc6-b694-4bad-99f1-f9d348809e04	28084f10-cb9a-4a6e-a91a-257175d642fa	da43914e-1f27-42b0-8070-3d222212a043	Your style is so unique!	text	2025-11-04 02:30:37.226	2025-11-04 02:30:37.226	\N
b1acdeae-16a3-4a88-acce-054fd0ee2e4f	28084f10-cb9a-4a6e-a91a-257175d642fa	da43914e-1f27-42b0-8070-3d222212a043	That outfit looks amazing!	text	2025-11-10 21:28:32.72	2025-11-10 21:28:32.72	\N
a7873e7f-db66-4da0-be63-3b4e3866af4f	28084f10-cb9a-4a6e-a91a-257175d642fa	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Your style is so unique!	text	2025-11-05 07:11:51.418	2025-11-05 07:11:51.418	\N
237e3a2f-35fd-4aeb-86c7-51b97c6b1cac	352d5264-c0d0-493d-af1d-0b827ece0fe8	44393f55-fc53-4050-a244-6fc49bc9e2db	Have you seen the new store items?	text	2025-11-09 10:28:45.373	2025-11-09 10:28:45.373	\N
963292b1-4912-45a3-bd3f-3cd413df4f7a	352d5264-c0d0-493d-af1d-0b827ece0fe8	44393f55-fc53-4050-a244-6fc49bc9e2db	Your style is so unique!	text	2025-11-08 04:18:46.725	2025-11-08 04:18:46.725	\N
d71dcafa-05c1-4789-b81a-3af5b956119d	352d5264-c0d0-493d-af1d-0b827ece0fe8	57a82d0a-cd78-427e-baaf-afb253178536	DM me if you need styling tips!	text	2025-11-04 15:28:44.084	2025-11-04 15:28:44.084	\N
048670a9-7da6-4427-9787-8ab9e8703fc8	69dec7be-60d2-480f-9fec-58a25bcb779d	8f952bb1-9ff6-4477-93ea-4972efcc383b	Are you going to the fashion show?	text	2025-11-06 21:58:18.932	2025-11-06 21:58:18.932	\N
8b19b7ec-f4db-4d02-8741-5fd488c63524	69dec7be-60d2-480f-9fec-58a25bcb779d	da43914e-1f27-42b0-8070-3d222212a043	Your style is so unique!	text	2025-11-09 05:55:49.673	2025-11-09 05:55:49.673	\N
827604a0-99ac-4ed2-b51a-0ce780df73b8	69dec7be-60d2-480f-9fec-58a25bcb779d	da43914e-1f27-42b0-8070-3d222212a043	Want to meet up for coffee?	text	2025-11-10 21:24:15.361	2025-11-10 21:24:15.361	\N
7d811542-6546-43d2-8c49-243f1621d262	69dec7be-60d2-480f-9fec-58a25bcb779d	da43914e-1f27-42b0-8070-3d222212a043	Hey! How are you?	text	2025-11-09 23:18:43.512	2025-11-09 23:18:43.512	\N
a2b72966-ddf6-4946-b644-d1c3701f915e	69dec7be-60d2-480f-9fec-58a25bcb779d	8f952bb1-9ff6-4477-93ea-4972efcc383b	Have you seen the new store items?	text	2025-11-08 21:02:38.846	2025-11-08 21:02:38.846	\N
25ef8209-c783-405b-9053-4ef885667415	69dec7be-60d2-480f-9fec-58a25bcb779d	8f952bb1-9ff6-4477-93ea-4972efcc383b	DM me if you need styling tips!	text	2025-11-08 13:11:05.571	2025-11-08 13:11:05.571	\N
4e361236-be97-4c15-b69d-0d706b287b77	69dec7be-60d2-480f-9fec-58a25bcb779d	da43914e-1f27-42b0-8070-3d222212a043	Your style is so unique!	text	2025-11-09 04:34:25.274	2025-11-09 04:34:25.274	\N
a66dddca-066c-4687-9be2-b557f603ee9d	69dec7be-60d2-480f-9fec-58a25bcb779d	8f952bb1-9ff6-4477-93ea-4972efcc383b	DM me if you need styling tips!	text	2025-11-04 21:36:36.011	2025-11-04 21:36:36.011	\N
342612e5-a755-40fa-9b14-1899a11eb903	69dec7be-60d2-480f-9fec-58a25bcb779d	da43914e-1f27-42b0-8070-3d222212a043	Love your latest post!	text	2025-11-07 01:49:32.009	2025-11-07 01:49:32.009	\N
ef53de98-efba-446e-9dd8-32600d4ed245	69dec7be-60d2-480f-9fec-58a25bcb779d	8f952bb1-9ff6-4477-93ea-4972efcc383b	Have you seen the new store items?	text	2025-11-04 22:50:35.515	2025-11-04 22:50:35.515	\N
b2a0448d-bf11-4375-a08f-f4774ac3bc54	69dec7be-60d2-480f-9fec-58a25bcb779d	da43914e-1f27-42b0-8070-3d222212a043	Love your latest post!	text	2025-11-07 19:50:54.486	2025-11-07 19:50:54.486	\N
15392915-e909-40ed-99f9-e83fddb1f487	d248a029-05a0-47c4-bb21-9b867aa7a5cf	57a82d0a-cd78-427e-baaf-afb253178536	Let's collaborate on a post!	text	2025-11-05 17:11:45.368	2025-11-05 17:11:45.368	\N
6e8b212d-a85a-40a1-9862-c1d9861901aa	d248a029-05a0-47c4-bb21-9b867aa7a5cf	8f952bb1-9ff6-4477-93ea-4972efcc383b	Thanks for the follow!	text	2025-11-10 11:27:15.921	2025-11-10 11:27:15.921	\N
31ee10d9-3045-4aad-9406-d26e50ef98f9	d248a029-05a0-47c4-bb21-9b867aa7a5cf	8f952bb1-9ff6-4477-93ea-4972efcc383b	Are you going to the fashion show?	text	2025-11-09 06:33:29.753	2025-11-09 06:33:29.753	\N
be26c018-35e5-4068-87cc-164ba8644bcf	77b44005-fb71-4315-9727-7b05ed04c99c	413719c0-2a04-445d-ba47-0f3a88d40471	Love your latest post!	text	2025-11-04 09:26:21.589	2025-11-04 09:26:21.589	\N
73d50f42-cf90-4ea0-8fae-d2add1f63f43	77b44005-fb71-4315-9727-7b05ed04c99c	413719c0-2a04-445d-ba47-0f3a88d40471	DM me if you need styling tips!	text	2025-11-05 11:18:00.785	2025-11-05 11:18:00.785	\N
15beb507-6014-43e8-a7a0-486edf73a70c	77b44005-fb71-4315-9727-7b05ed04c99c	57a82d0a-cd78-427e-baaf-afb253178536	Thanks for the follow!	text	2025-11-05 19:39:05.207	2025-11-05 19:39:05.207	\N
47697b21-b6dd-4c74-97a9-cc38645a6bbb	77b44005-fb71-4315-9727-7b05ed04c99c	57a82d0a-cd78-427e-baaf-afb253178536	Let's collaborate on a post!	text	2025-11-08 21:30:46.195	2025-11-08 21:30:46.195	\N
e5fdfd3d-bf3d-40d8-9ca3-6d463cd7a717	77b44005-fb71-4315-9727-7b05ed04c99c	413719c0-2a04-445d-ba47-0f3a88d40471	Let's collaborate on a post!	text	2025-11-04 15:40:39.447	2025-11-04 15:40:39.447	\N
1c1edb65-4352-46fb-8feb-6f95eb5c3748	77b44005-fb71-4315-9727-7b05ed04c99c	57a82d0a-cd78-427e-baaf-afb253178536	Have you seen the new store items?	text	2025-11-10 07:06:24.594	2025-11-10 07:06:24.594	\N
ace80b4c-16e7-4c82-9ce5-6040e5a0debf	77b44005-fb71-4315-9727-7b05ed04c99c	57a82d0a-cd78-427e-baaf-afb253178536	Thanks for the follow!	text	2025-11-08 17:12:04.002	2025-11-08 17:12:04.002	\N
7046402c-dabd-4446-8166-f76883cba6b7	77b44005-fb71-4315-9727-7b05ed04c99c	413719c0-2a04-445d-ba47-0f3a88d40471	Thanks for the follow!	text	2025-11-04 14:10:32.582	2025-11-04 14:10:32.582	\N
e7b11ce6-b748-4629-821c-5659d3a041ac	77b44005-fb71-4315-9727-7b05ed04c99c	413719c0-2a04-445d-ba47-0f3a88d40471	DM me if you need styling tips!	text	2025-11-06 20:32:51.599	2025-11-06 20:32:51.599	\N
ab7053c8-425f-41e1-9a2a-d032dfd2870d	af632214-31a9-481d-8942-694fe3e619db	57a82d0a-cd78-427e-baaf-afb253178536	Want to meet up for coffee?	text	2025-11-04 10:35:31.584	2025-11-04 10:35:31.584	\N
09c3a7cb-4047-4efe-84f3-4309a9d22650	af632214-31a9-481d-8942-694fe3e619db	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Thanks for the follow!	text	2025-11-07 09:33:46.704	2025-11-07 09:33:46.704	\N
c9c5be68-1a6f-4c98-8536-4891dc358b7b	af632214-31a9-481d-8942-694fe3e619db	57a82d0a-cd78-427e-baaf-afb253178536	Want to meet up for coffee?	text	2025-11-08 17:03:14.025	2025-11-08 17:03:14.025	\N
1455665c-bcb6-4f1c-85a7-985730c86d23	8a06755c-dfd4-4af6-814c-d9295738aab8	8f952bb1-9ff6-4477-93ea-4972efcc383b	Hey! How are you?	text	2025-11-06 06:02:38.885	2025-11-06 06:02:38.885	\N
644efdfb-8d47-43bb-a9f2-d08632e739cf	8a06755c-dfd4-4af6-814c-d9295738aab8	8f952bb1-9ff6-4477-93ea-4972efcc383b	That outfit looks amazing!	text	2025-11-07 12:02:50.819	2025-11-07 12:02:50.819	\N
5aba2700-ed37-4044-93d4-24193b9e4f26	8a06755c-dfd4-4af6-814c-d9295738aab8	44393f55-fc53-4050-a244-6fc49bc9e2db	Your style is so unique!	text	2025-11-06 06:22:42.218	2025-11-06 06:22:42.218	\N
c19098aa-ddae-4017-9378-7c218200e888	8a06755c-dfd4-4af6-814c-d9295738aab8	8f952bb1-9ff6-4477-93ea-4972efcc383b	Love your latest post!	text	2025-11-06 23:28:00.655	2025-11-06 23:28:00.655	\N
45623ec3-ddba-46bd-ab2f-c58a24d840f7	8a06755c-dfd4-4af6-814c-d9295738aab8	8f952bb1-9ff6-4477-93ea-4972efcc383b	Love your latest post!	text	2025-11-08 03:47:47.105	2025-11-08 03:47:47.105	\N
\.


--
-- TOC entry 5621 (class 0 OID 33908)
-- Dependencies: 231
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_settings (user_id, email_notifications, push_notifications, likes_notifications, comments_notifications, follows_notifications, events_notifications, messages_notifications, marketing_notifications, created_at, updated_at) FROM stdin;
8f952bb1-9ff6-4477-93ea-4972efcc383b	t	t	t	t	t	t	t	f	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
413719c0-2a04-445d-ba47-0f3a88d40471	t	t	t	t	t	t	t	f	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
44393f55-fc53-4050-a244-6fc49bc9e2db	t	t	t	t	t	t	t	f	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
bb0b50c8-4dd1-4c51-aac3-828e01f7c570	t	t	t	t	t	t	t	f	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
da43914e-1f27-42b0-8070-3d222212a043	t	t	t	t	t	t	t	f	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
57a82d0a-cd78-427e-baaf-afb253178536	t	t	t	t	t	t	t	f	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
\.


--
-- TOC entry 5624 (class 0 OID 33967)
-- Dependencies: 234
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, data, actor_id, is_read, read_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5650 (class 0 OID 34348)
-- Dependencies: 260
-- Data for Name: offline_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_data (id, user_id, resource_type, resource_id, data, sync_status, retry_count, last_synced_at, created_at) FROM stdin;
\.


--
-- TOC entry 5649 (class 0 OID 34310)
-- Dependencies: 259
-- Data for Name: offline_queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_queues (id, user_id, request_type, endpoint, method, data, status, created_at, processed_at, error_message) FROM stdin;
\.


--
-- TOC entry 5612 (class 0 OID 33711)
-- Dependencies: 222
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, buyer_id, seller_id, item_id, quantity, total_amount, payment_method, delivery_method, delivery_address, buyer_phone, status, payment_status, payment_reference, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- TOC entry 5623 (class 0 OID 33947)
-- Dependencies: 233
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- TOC entry 5653 (class 0 OID 34451)
-- Dependencies: 263
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, user_id, type, caption, media, location, tags, brand, occasion, visibility, is_for_sale, sale_details, likes_count, comments_count, shares_count, saves_count, views_count, is_featured, featured_at, faculty, created_at, updated_at, deleted_at) FROM stdin;
da1b073e-4331-47e4-b61d-f369f1bc4f5e	8f952bb1-9ff6-4477-93ea-4972efcc383b	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	15	16	1	7	120	f	\N	Science	2025-11-08 19:15:54.419	2025-11-08 19:15:54.419	\N
eb579cf9-d244-48c0-a30d-bb19653ede17	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Vintage vibes 🎭 #VintageStyle	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	52	17	3	14	94	f	\N	Science	2025-11-07 15:36:33.965	2025-11-07 15:36:33.965	\N
d0b93daa-78ed-44a5-984d-483132f80c14	8f952bb1-9ff6-4477-93ea-4972efcc383b	carousel	Perfect outfit for today's presentation! 💼 #CampusStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	54	8	4	2	37	f	\N	Science	2025-10-30 03:44:42.63	2025-10-30 03:44:42.63	\N
2b88860d-0daa-491a-9e8a-00d1a5dbaf57	413719c0-2a04-445d-ba47-0f3a88d40471	carousel	Comfort meets style 😊 #CampusLife	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	49	4	8	10	102	f	\N	Science	2025-11-10 06:37:01.723	2025-11-10 06:37:01.723	\N
c12effb6-9fc1-416d-ab8c-d51dc158aa43	413719c0-2a04-445d-ba47-0f3a88d40471	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	27	12	5	8	46	f	\N	Science	2025-10-26 02:44:16.263	2025-10-26 02:44:16.263	\N
2fc94ca0-e865-4c96-b485-d1c3f8098c92	413719c0-2a04-445d-ba47-0f3a88d40471	video	Vintage vibes 🎭 #VintageStyle	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "S", "price": 77, "category": "clothing", "condition": "good", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	5	13	0	8	45	f	\N	Science	2025-10-20 23:19:11.586	2025-10-20 23:19:11.586	\N
462b86f1-cdbf-49c9-84dc-76f2064962b2	413719c0-2a04-445d-ba47-0f3a88d40471	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	t	{"size": "S", "price": 60, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	18	3	1	1	183	f	\N	Science	2025-10-28 20:17:05.935	2025-10-28 20:17:05.935	\N
e3b9a1fb-2b88-43e4-9d4c-08ea1c8ffb1f	44393f55-fc53-4050-a244-6fc49bc9e2db	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	40	21	6	4	186	f	\N	Science	2025-10-14 10:23:55.334	2025-10-14 10:23:55.334	\N
40229dc0-8f9f-4278-ad84-7e001204b291	44393f55-fc53-4050-a244-6fc49bc9e2db	video	Library chic 📚 #AcademicFashion	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	10	11	9	0	135	f	\N	Science	2025-10-14 02:58:18.054	2025-10-14 02:58:18.054	\N
59462ed7-3b24-477b-82ed-96caeb768603	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Weekend casuals ✨ #Relaxed	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	32	16	9	3	141	f	\N	Science	2025-10-23 00:54:30.256	2025-10-23 00:54:30.256	\N
e62df199-0dd1-4349-81b8-08f982903824	44393f55-fc53-4050-a244-6fc49bc9e2db	video	Library chic 📚 #AcademicFashion	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	46	2	4	11	83	f	\N	Science	2025-11-09 01:53:03.834	2025-11-09 01:53:03.834	\N
8c9b9dac-72e2-4cf0-949f-c6ea699f7e8e	44393f55-fc53-4050-a244-6fc49bc9e2db	image	Date night look 💕 #Elegant	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "XL", "price": 41, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	42	8	1	12	158	f	\N	Science	2025-11-05 07:38:44.535	2025-11-05 07:38:44.535	\N
a0b33af7-bdc1-4661-a423-8439990baa1e	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	image	Weekend casuals ✨ #Relaxed	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	25	17	9	6	202	f	\N	Science	2025-11-09 22:08:43.34	2025-11-09 22:08:43.34	\N
398076f9-64f1-4602-96e7-dbbc413b96c5	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Sustainable fashion vibes 🌿 #EcoFriendly	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	17	9	0	5	91	f	\N	Science	2025-10-19 14:40:24.306	2025-10-19 14:40:24.306	\N
29429716-d940-4424-8242-d1c4cc3b0e2c	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Weekend casuals ✨ #Relaxed	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	50	16	0	6	123	f	\N	Science	2025-10-19 03:56:59.711	2025-10-19 03:56:59.711	\N
9f598ad1-7e97-4902-b8dc-8f1b09273b0b	da43914e-1f27-42b0-8070-3d222212a043	video	Library chic 📚 #AcademicFashion	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	43	8	2	11	109	f	\N	Science	2025-11-03 01:44:10.449	2025-11-03 01:44:10.449	\N
337e1511-748b-4532-99af-a525ab259d06	da43914e-1f27-42b0-8070-3d222212a043	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	31	2	6	8	41	f	\N	Science	2025-10-22 06:31:38.977	2025-10-22 06:31:38.977	\N
1068a46e-eec3-4c89-9a34-94f48e778677	da43914e-1f27-42b0-8070-3d222212a043	carousel	Sustainable fashion vibes 🌿 #EcoFriendly	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	11	20	4	2	38	f	\N	Science	2025-11-05 03:09:09.553	2025-11-05 03:09:09.553	\N
8d0078aa-24f1-4a92-9219-fbd3bdd3a68b	da43914e-1f27-42b0-8070-3d222212a043	image	Date night look 💕 #Elegant	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "XL", "price": 58, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	32	2	5	7	157	f	\N	Science	2025-10-19 10:12:17.766	2025-10-19 10:12:17.766	\N
683c250d-99bf-4baa-bc7f-25d43cbdcff9	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Comfort meets style 😊 #CampusLife	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "S", "price": 34, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	22	15	9	13	101	f	\N	Science	2025-11-06 16:15:26.964	2025-11-06 16:15:26.964	\N
31ebfebf-0c08-4a49-9d7d-37f777a4d80f	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	15	9	8	14	57	f	\N	Science	2025-10-29 20:12:37.529	2025-10-29 20:12:37.529	\N
0f8645d0-37b3-4b16-9a3c-71904b2a530e	57a82d0a-cd78-427e-baaf-afb253178536	video	Comfort meets style 😊 #CampusLife	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	11	4	1	10	130	f	\N	Science	2025-10-19 20:26:39.509	2025-10-19 20:26:39.509	\N
e5f9ce4a-86e4-4cfd-8f04-2b100b4dbf18	57a82d0a-cd78-427e-baaf-afb253178536	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	25	20	1	4	113	f	\N	Science	2025-10-30 08:51:25.257	2025-10-30 08:51:25.257	\N
e4d5cdfd-551b-4d39-bf58-f12bd7c89444	57a82d0a-cd78-427e-baaf-afb253178536	image	Vintage vibes 🎭 #VintageStyle	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	54	20	7	8	30	f	\N	Science	2025-10-22 04:37:03.469	2025-10-22 04:37:03.469	\N
8feeba40-63b9-429d-975b-0243b1ddb828	da43914e-1f27-42b0-8070-3d222212a043	video	Sustainable fashion vibes 🌿 #EcoFriendly	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	9	12	9	2	73	f	\N	Science	2025-10-14 20:38:33.965	2025-10-14 20:38:33.965	\N
f56a905b-bbbf-4f9b-a23f-37d8755a05c6	da43914e-1f27-42b0-8070-3d222212a043	video	Vintage vibes 🎭 #VintageStyle	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "XL", "price": 69, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	39	15	2	3	72	f	\N	Science	2025-11-09 18:02:13.699	2025-11-09 18:02:13.699	\N
13bcce60-e54c-4263-aeda-d951a2651e00	57a82d0a-cd78-427e-baaf-afb253178536	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "L", "price": 24, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	33	12	0	12	136	f	\N	Science	2025-10-13 20:27:27.808	2025-10-13 20:27:27.808	\N
d61a117c-b1cf-49de-bad9-98f3375e6048	57a82d0a-cd78-427e-baaf-afb253178536	image	Vintage vibes 🎭 #VintageStyle	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	39	19	0	0	182	f	\N	Science	2025-10-29 08:18:10.988	2025-10-29 08:18:10.988	\N
019f7aa3-9fdd-4415-87ff-882e8b2d271f	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Comfort meets style 😊 #CampusLife	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	46	18	3	7	204	f	\N	Science	2025-10-29 16:11:38.82	2025-10-29 16:11:38.82	\N
633c51e3-59a6-45e6-8a27-b8961baf6b97	8f952bb1-9ff6-4477-93ea-4972efcc383b	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	24	18	5	2	170	f	\N	Science	2025-11-08 01:55:49.162	2025-11-08 01:55:49.162	\N
b6dbc981-d8ed-4952-81a4-843167bfe673	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	t	{"size": "M", "price": 65, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	21	18	9	10	38	f	\N	Science	2025-11-08 01:45:45.557	2025-11-08 01:45:45.557	\N
7981af6c-82f5-4fcf-88b5-59bb1c1fb5df	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "M", "price": 88, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	13	11	0	11	45	f	\N	Science	2025-11-07 02:29:31.545	2025-11-07 02:29:31.545	\N
6e5ebd5d-ac11-4fca-af6e-1b76caebc8c0	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Comfort meets style 😊 #CampusLife	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	5	4	9	1	111	f	\N	Science	2025-10-23 06:24:17.437	2025-10-23 06:24:17.437	\N
5292a66b-2a56-41a9-9f3f-19e921ff5cfb	413719c0-2a04-445d-ba47-0f3a88d40471	image	Weekend casuals ✨ #Relaxed	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	39	20	1	3	33	f	\N	Science	2025-11-02 19:33:14.969	2025-11-02 19:33:14.969	\N
72fa2fb7-5310-4f3a-b181-f67ee2435ff8	413719c0-2a04-445d-ba47-0f3a88d40471	video	Date night look 💕 #Elegant	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	36	14	0	3	178	f	\N	Science	2025-11-09 18:54:48.541	2025-11-09 18:54:48.541	\N
4827b9d9-ab28-4afb-8baf-bae76c380364	44393f55-fc53-4050-a244-6fc49bc9e2db	video	Date night look 💕 #Elegant	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "XL", "price": 79, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	53	21	8	1	65	f	\N	Science	2025-10-27 09:48:05.066	2025-10-27 09:48:05.066	\N
cadb8960-4c0a-4912-ae51-ef795c2a0b12	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Vintage vibes 🎭 #VintageStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	26	2	8	10	92	f	\N	Science	2025-10-13 20:17:35.72	2025-10-13 20:17:35.72	\N
e47ee79f-bb39-45df-8355-51e4db85f72b	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Perfect outfit for today's presentation! 💼 #CampusStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	19	12	6	2	78	f	\N	Science	2025-11-06 22:20:39.504	2025-11-06 22:20:39.504	\N
d368241b-1ba9-42f9-9aee-54e29426fc23	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "S", "price": 88, "category": "clothing", "condition": "good", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	24	3	9	14	69	f	\N	Science	2025-11-04 13:17:08.694	2025-11-04 13:17:08.694	\N
cd990558-2a62-4e8d-ae3b-436ca1d1fbd9	413719c0-2a04-445d-ba47-0f3a88d40471	image	Date night look 💕 #Elegant	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	38	21	6	6	55	f	\N	Science	2025-10-27 21:32:45.896	2025-10-27 21:32:45.896	\N
27b32ed2-0dce-44fa-8062-0a9cf1974061	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	t	{"size": "S", "price": 20, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	36	6	7	0	215	f	\N	Science	2025-10-23 09:16:27.146	2025-10-23 09:16:27.146	\N
acddab21-d23f-4992-8f36-cae26f29add5	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	Comfort meets style 😊 #CampusLife	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	13	12	1	10	120	f	\N	Science	2025-10-28 02:45:43.028	2025-10-28 02:45:43.028	\N
3e879856-a56f-4eb5-bff1-d77621dce9bc	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	Perfect outfit for today's presentation! 💼 #CampusStyle	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	43	10	0	1	183	f	\N	Science	2025-10-25 00:43:10.007	2025-10-25 00:43:10.007	\N
77ff7105-0b0c-438d-b9dc-05bb598b4222	da43914e-1f27-42b0-8070-3d222212a043	carousel	Sustainable fashion vibes 🌿 #EcoFriendly	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	35	20	7	3	100	f	\N	Science	2025-11-01 22:53:51.006	2025-11-01 22:53:51.006	\N
6b1ef25f-a189-4302-939e-817eba9ea2cf	da43914e-1f27-42b0-8070-3d222212a043	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "M", "price": 109, "category": "clothing", "condition": "good", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	31	15	2	9	102	f	\N	Science	2025-10-15 21:09:50.605	2025-10-15 21:09:50.605	\N
5990039a-8b52-4d78-97e1-78e3c716fab6	da43914e-1f27-42b0-8070-3d222212a043	video	Weekend casuals ✨ #Relaxed	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	15	11	9	2	75	f	\N	Science	2025-10-28 20:37:59.106	2025-10-28 20:37:59.106	\N
751480f5-1264-4d85-becb-708bc25c453c	da43914e-1f27-42b0-8070-3d222212a043	video	Vintage vibes 🎭 #VintageStyle	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	23	19	5	9	96	f	\N	Science	2025-11-04 11:17:07.037	2025-11-04 11:17:07.037	\N
570cbf61-2e5e-4f85-84e3-29eb41c7c436	da43914e-1f27-42b0-8070-3d222212a043	video	Date night look 💕 #Elegant	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "XL", "price": 115, "category": "clothing", "condition": "good", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	36	6	2	12	122	f	\N	Science	2025-11-03 05:09:06.229	2025-11-03 05:09:06.229	\N
fa6a4642-d87d-4c6a-87d1-81d80d147ffa	57a82d0a-cd78-427e-baaf-afb253178536	video	Sustainable fashion vibes 🌿 #EcoFriendly	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	44	10	1	1	94	f	\N	Science	2025-11-02 06:13:56.557	2025-11-02 06:13:56.557	\N
78e8cac5-af2d-44e1-9de9-f9f6e1dc5266	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Comfort meets style 😊 #CampusLife	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	t	{"size": "M", "price": 113, "category": "clothing", "condition": "good", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	45	14	9	3	153	f	\N	Science	2025-10-18 02:19:58.167	2025-10-18 02:19:58.167	\N
180b9b7f-43ee-4024-bdb1-b472350d4e98	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "XL", "price": 113, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	34	15	3	4	61	f	\N	Science	2025-11-09 06:52:43.152	2025-11-09 06:52:43.152	\N
80c2892e-8953-497c-a29a-ee48ab70292b	57a82d0a-cd78-427e-baaf-afb253178536	image	Sustainable fashion vibes 🌿 #EcoFriendly	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	5	6	2	0	108	f	\N	Science	2025-11-01 10:47:23.964	2025-11-01 10:47:23.964	\N
730d9f62-b90c-4aa4-a9a4-88acc1b9e2fb	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Sustainable fashion vibes 🌿 #EcoFriendly	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	38	9	8	12	81	f	\N	Science	2025-10-25 16:38:15.517	2025-10-25 16:38:15.517	\N
6b5783d3-c0f8-4735-b351-f93284d9b68f	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Comfort meets style 😊 #CampusLife	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	28	17	5	1	147	f	\N	Science	2025-10-30 20:34:03.437	2025-10-30 20:34:03.437	\N
7193a4c5-4a7e-429b-8859-de56d7bd1533	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	12	2	8	9	137	f	\N	Science	2025-10-17 06:40:04.867	2025-10-17 06:40:04.867	\N
4fd549f0-1101-48aa-b88d-a246f14e05bc	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Sustainable fashion vibes 🌿 #EcoFriendly	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	7	4	9	7	200	f	\N	Science	2025-11-02 18:08:26.881	2025-11-02 18:08:26.881	\N
8601b69a-0d7b-4438-bba6-1cda0c12fd7a	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Sustainable fashion vibes 🌿 #EcoFriendly	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	30	9	7	5	219	f	\N	Science	2025-10-20 03:35:23.087	2025-10-20 03:35:23.087	\N
973d6127-d7d6-47c4-a2b7-3ae0675d8af3	413719c0-2a04-445d-ba47-0f3a88d40471	carousel	Vintage vibes 🎭 #VintageStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	12	14	9	14	194	f	\N	Science	2025-10-26 14:20:25.739	2025-10-26 14:20:25.739	\N
b0408850-e4b8-4568-8592-fbb292ae54c9	413719c0-2a04-445d-ba47-0f3a88d40471	carousel	Weekend casuals ✨ #Relaxed	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	46	14	5	2	171	f	\N	Science	2025-10-27 23:09:19.149	2025-10-27 23:09:19.149	\N
23c16a61-c691-4be2-aeb1-92592b434b65	413719c0-2a04-445d-ba47-0f3a88d40471	video	Bold colors today 🎨 #Creative	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	41	20	8	3	144	f	\N	Science	2025-10-15 03:31:14.269	2025-10-15 03:31:14.269	\N
7378d5e1-8672-4df9-bb5b-b5f09e62068f	413719c0-2a04-445d-ba47-0f3a88d40471	video	Weekend casuals ✨ #Relaxed	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	32	10	5	0	98	f	\N	Science	2025-10-29 03:11:15.384	2025-10-29 03:11:15.384	\N
af19d34f-a6a3-4453-ba02-27c0360c6f52	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Date night look 💕 #Elegant	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	t	{"size": "L", "price": 36, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	42	21	9	0	182	f	\N	Science	2025-10-18 19:07:12.927	2025-10-18 19:07:12.927	\N
3e22e5c9-9dd5-400e-8322-f83a828da6fe	44393f55-fc53-4050-a244-6fc49bc9e2db	video	Date night look 💕 #Elegant	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	30	21	2	11	164	f	\N	Science	2025-10-12 05:02:40.005	2025-10-12 05:02:40.005	\N
8012ecf6-9cd8-4464-bfa7-24ab236404bc	44393f55-fc53-4050-a244-6fc49bc9e2db	image	Weekend casuals ✨ #Relaxed	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	49	16	9	10	27	f	\N	Science	2025-10-19 00:13:34.85	2025-10-19 00:13:34.85	\N
4b2c852a-92a5-453d-be81-3cdc14d8c67f	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Perfect outfit for today's presentation! 💼 #CampusStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	12	7	5	11	102	f	\N	Science	2025-11-03 18:06:48.68	2025-11-03 18:06:48.68	\N
158c2972-1efd-4635-87b0-20d798555712	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	Sustainable fashion vibes 🌿 #EcoFriendly	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	31	17	8	12	41	f	\N	Science	2025-10-16 11:42:47.503	2025-10-16 11:42:47.503	\N
3ed393d2-b348-4d77-9b19-8f875de669b1	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	Date night look 💕 #Elegant	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	42	5	1	10	146	f	\N	Science	2025-10-12 21:07:59.246	2025-10-12 21:07:59.246	\N
934c730e-4e05-4504-9f2b-1c0431148fee	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	image	Library chic 📚 #AcademicFashion	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "M", "price": 84, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	23	8	0	1	102	f	\N	Science	2025-10-25 00:16:56.361	2025-10-25 00:16:56.361	\N
16614acc-1ed3-4774-aa91-219d6607eb0b	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	image	Date night look 💕 #Elegant	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	48	16	0	11	63	f	\N	Science	2025-10-23 13:47:51.335	2025-10-23 13:47:51.335	\N
007e90f8-a30e-4f4e-b75c-a869c1485b4d	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Perfect outfit for today's presentation! 💼 #CampusStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	34	12	4	10	46	f	\N	Science	2025-10-16 19:23:03.773	2025-10-16 19:23:03.773	\N
f5f82fa7-afe6-4300-a257-ed52e64c032e	da43914e-1f27-42b0-8070-3d222212a043	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	27	11	1	6	196	f	\N	Science	2025-11-03 01:16:29.37	2025-11-03 01:16:29.37	\N
305762d4-ab86-4907-94ec-bcf7557a3ef7	da43914e-1f27-42b0-8070-3d222212a043	video	Weekend casuals ✨ #Relaxed	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	5	20	5	11	127	f	\N	Science	2025-10-17 21:42:43.783	2025-10-17 21:42:43.783	\N
c074c91f-26e1-436a-9dfd-79b72eaf7691	da43914e-1f27-42b0-8070-3d222212a043	video	Weekend casuals ✨ #Relaxed	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	18	12	8	14	62	f	\N	Science	2025-11-09 15:15:19.639	2025-11-09 15:15:19.639	\N
5a00dc2b-dc04-4e13-877a-77cf0a07f5b9	da43914e-1f27-42b0-8070-3d222212a043	image	Perfect outfit for today's presentation! 💼 #CampusStyle	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	24	3	9	4	168	f	\N	Science	2025-11-01 11:28:49.675	2025-11-01 11:28:49.675	\N
3f7fa1ad-045a-4ea7-bddc-a521f3f8ecc7	da43914e-1f27-42b0-8070-3d222212a043	image	Weekend casuals ✨ #Relaxed	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	9	4	6	0	130	f	\N	Science	2025-11-07 12:47:50.242	2025-11-07 12:47:50.242	\N
eb29a622-4277-4092-99ce-986a042eedd3	57a82d0a-cd78-427e-baaf-afb253178536	image	Vintage vibes 🎭 #VintageStyle	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	36	2	6	2	52	f	\N	Science	2025-10-19 21:58:05.509	2025-10-19 21:58:05.509	\N
36a00255-2c11-408a-8e04-396e885d844b	57a82d0a-cd78-427e-baaf-afb253178536	image	Perfect outfit for today's presentation! 💼 #CampusStyle	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	5	8	8	4	194	f	\N	Science	2025-10-23 00:50:25.291	2025-10-23 00:50:25.291	\N
43e24776-b30d-46d8-b154-38fd3e1bff0e	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Date night look 💕 #Elegant	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	54	21	5	14	122	f	\N	Science	2025-10-26 12:20:23.476	2025-10-26 12:20:23.476	\N
06336ad1-737c-44ef-ac89-8115776fc951	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Comfort meets style 😊 #CampusLife	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	45	7	1	9	184	f	\N	Science	2025-11-06 05:00:53.003	2025-11-06 05:00:53.003	\N
a20b603e-33ba-4cd1-84f0-e537d434cd90	8f952bb1-9ff6-4477-93ea-4972efcc383b	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	29	18	7	13	166	f	\N	Science	2025-11-05 21:30:56.038	2025-11-05 21:30:56.038	\N
a7adccf2-fc41-49b0-97f5-22ece4986e1b	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	9	7	1	7	64	f	\N	Science	2025-10-13 11:16:53.564	2025-10-13 11:16:53.564	\N
ca1f56bc-0065-40e4-9eab-a7ff89bf60d6	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Bold colors today 🎨 #Creative	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	47	18	3	8	69	f	\N	Science	2025-10-20 02:05:54.271	2025-10-20 02:05:54.271	\N
3e17ae9a-1514-4772-973b-51965b1a1511	8f952bb1-9ff6-4477-93ea-4972efcc383b	carousel	Sustainable fashion vibes 🌿 #EcoFriendly	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	23	21	9	13	149	f	\N	Science	2025-10-18 08:40:43.483	2025-10-18 08:40:43.483	\N
9d1642ac-9ca2-4794-be4f-28b7ab43eca4	413719c0-2a04-445d-ba47-0f3a88d40471	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	12	19	5	1	173	f	\N	Science	2025-10-26 16:46:23.198	2025-10-26 16:46:23.198	\N
6596a2d9-2b03-4638-8613-409f51d1170f	413719c0-2a04-445d-ba47-0f3a88d40471	image	Vintage vibes 🎭 #VintageStyle	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	8	16	8	0	153	f	\N	Science	2025-11-09 18:01:40.187	2025-11-09 18:01:40.187	\N
1bc7e25c-d660-43ba-8944-38fc86b709e5	413719c0-2a04-445d-ba47-0f3a88d40471	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "XL", "price": 55, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	26	5	3	12	194	f	\N	Science	2025-11-10 01:31:48.27	2025-11-10 01:31:48.27	\N
8d0ee842-0587-43eb-b9fc-b4f7d719f854	413719c0-2a04-445d-ba47-0f3a88d40471	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	15	20	4	3	192	f	\N	Science	2025-11-01 19:37:26.573	2025-11-01 19:37:26.573	\N
a9370aa7-824c-4c0c-b1bf-5221f063d4a0	44393f55-fc53-4050-a244-6fc49bc9e2db	image	Date night look 💕 #Elegant	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	44	13	1	7	41	f	\N	Science	2025-11-02 09:40:10.057	2025-11-02 09:40:10.057	\N
0c630ba0-7ed0-472f-8910-1d86381de979	44393f55-fc53-4050-a244-6fc49bc9e2db	video	Weekend casuals ✨ #Relaxed	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	5	6	4	3	134	f	\N	Science	2025-10-24 03:03:13.543	2025-10-24 03:03:13.543	\N
f4255e2d-bbf1-4c02-b679-19c2c09e3a61	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "M", "price": 26, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	15	8	2	9	203	f	\N	Science	2025-11-01 21:41:49.877	2025-11-01 21:41:49.877	\N
c113aebb-735c-47b2-bc67-8d1e90574599	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Weekend casuals ✨ #Relaxed	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	41	18	7	4	133	f	\N	Science	2025-10-30 07:26:45.281	2025-10-30 07:26:45.281	\N
bff9adff-3fb8-4031-a602-4efd62e41fe6	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Perfect outfit for today's presentation! 💼 #CampusStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg", "https://i.imgur.com/KnZQY6W.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "L", "price": 72, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	48	6	5	6	113	f	\N	Science	2025-10-30 19:57:12.942	2025-10-30 19:57:12.942	\N
8b9b107d-1e81-40eb-8d5f-bc60ebe9b6fb	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	Sustainable fashion vibes 🌿 #EcoFriendly	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	8	20	5	2	50	f	\N	Science	2025-11-05 01:13:34.914	2025-11-05 01:13:34.914	\N
6193df65-76a9-46eb-8dc3-855ca2a2b87f	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	25	20	7	1	162	f	\N	Science	2025-10-22 14:23:28.964	2025-10-22 14:23:28.964	\N
97babe22-97ec-4bd7-8e2c-4d90dd51a435	da43914e-1f27-42b0-8070-3d222212a043	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	54	16	5	12	153	f	\N	Science	2025-11-07 03:01:12.977	2025-11-07 03:01:12.977	\N
939283a5-e84a-479b-8822-67aae4ba67b6	da43914e-1f27-42b0-8070-3d222212a043	carousel	Comfort meets style 😊 #CampusLife	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	42	6	3	11	211	f	\N	Science	2025-11-03 20:15:00.43	2025-11-03 20:15:00.43	\N
448456b8-71f9-478f-b1c5-b3242e75f63c	57a82d0a-cd78-427e-baaf-afb253178536	video	Comfort meets style 😊 #CampusLife	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	6	20	2	6	122	f	\N	Science	2025-11-09 13:54:09.441	2025-11-09 13:54:09.441	\N
cf0f5348-ccf7-4f07-978a-7166ccfbcccf	57a82d0a-cd78-427e-baaf-afb253178536	video	Vintage vibes 🎭 #VintageStyle	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	20	21	0	2	209	f	\N	Science	2025-10-16 04:13:25.336	2025-10-16 04:13:25.336	\N
e5938961-690d-4f99-b65d-6511e40b72aa	57a82d0a-cd78-427e-baaf-afb253178536	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	21	18	5	10	165	f	\N	Science	2025-11-02 14:59:43.404	2025-11-02 14:59:43.404	\N
cc7e25d8-842a-4b5c-9274-6ca408b727fe	57a82d0a-cd78-427e-baaf-afb253178536	image	Date night look 💕 #Elegant	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	17	19	6	7	67	f	\N	Science	2025-11-01 05:36:29.145	2025-11-01 05:36:29.145	\N
1b038b26-8432-4555-9cb0-d3b824e343ee	57a82d0a-cd78-427e-baaf-afb253178536	video	Vintage vibes 🎭 #VintageStyle	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	21	9	0	9	155	f	\N	Science	2025-10-22 23:28:30.543	2025-10-22 23:28:30.543	\N
83e84526-c23e-4bc9-9ae8-b60f2481917c	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Bold colors today 🎨 #Creative	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	43	11	6	9	136	f	\N	Science	2025-11-03 00:33:33.275	2025-11-03 00:33:33.275	\N
a9bb5909-7cde-46c7-a1a3-ebc605d99766	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	Perfect outfit for today's presentation! 💼 #CampusStyle	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	13	15	2	0	137	f	\N	Science	2025-10-28 19:55:11.263	2025-10-28 19:55:11.263	\N
c70324c7-9ca6-4da5-a20a-9aa6a2b28418	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Weekend casuals ✨ #Relaxed	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	23	18	9	4	40	f	\N	Science	2025-11-09 21:26:24.869	2025-11-09 21:26:24.869	\N
761b482e-8392-4e84-a5eb-ff913800c195	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	Perfect outfit for today's presentation! 💼 #CampusStyle	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	30	21	0	6	132	f	\N	Science	2025-10-16 17:54:07.56	2025-10-16 17:54:07.56	\N
dcc59e75-7343-45c5-87f0-78e48d4af64a	8f952bb1-9ff6-4477-93ea-4972efcc383b	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	39	13	8	9	37	f	\N	Science	2025-11-07 05:32:10.677	2025-11-07 05:32:10.677	\N
a391a43d-079f-4072-ad65-9b87dc90a298	413719c0-2a04-445d-ba47-0f3a88d40471	video	Sustainable fashion vibes 🌿 #EcoFriendly	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	11	9	7	7	215	f	\N	Science	2025-10-27 15:03:51.554	2025-10-27 15:03:51.554	\N
ab50483e-2472-4532-a80f-f370283c8afe	413719c0-2a04-445d-ba47-0f3a88d40471	image	Vintage vibes 🎭 #VintageStyle	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	23	2	7	7	72	f	\N	Science	2025-10-21 11:25:58.854	2025-10-21 11:25:58.854	\N
a54c4232-2ce2-44fe-9016-98b0a7b5b1bd	413719c0-2a04-445d-ba47-0f3a88d40471	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	16	18	3	1	197	f	\N	Science	2025-11-08 07:24:56.86	2025-11-08 07:24:56.86	\N
3b3c3ebd-1064-4575-840c-0db420d007d3	413719c0-2a04-445d-ba47-0f3a88d40471	video	Perfect outfit for today's presentation! 💼 #CampusStyle	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	33	12	7	0	165	f	\N	Science	2025-10-25 04:58:23.826	2025-10-25 04:58:23.826	\N
93f3e746-dfea-42c4-9a0d-b5bfc6e67cd5	44393f55-fc53-4050-a244-6fc49bc9e2db	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	45	15	2	14	129	f	\N	Science	2025-11-02 15:28:35.15	2025-11-02 15:28:35.15	\N
c5d24d79-d50d-4146-9deb-54241f71812d	44393f55-fc53-4050-a244-6fc49bc9e2db	image	Vintage vibes 🎭 #VintageStyle	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	f	\N	33	16	9	12	58	f	\N	Science	2025-10-19 18:43:35.027	2025-10-19 18:43:35.027	\N
6639f07b-8903-4997-8111-c964260f8812	44393f55-fc53-4050-a244-6fc49bc9e2db	image	Comfort meets style 😊 #CampusLife	{"image": "https://i.imgur.com/D3CYJcL.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	15	9	3	10	133	f	\N	Science	2025-11-07 03:15:54.799	2025-11-07 03:15:54.799	\N
5b885153-285d-4637-9941-fffa73e6d8f8	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	Perfect outfit for today's presentation! 💼 #CampusStyle	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/Ynh9LMX.jpg"}	Campus Library	{OOTD,CampusStyle}	\N	\N	faculty	t	{"size": "M", "price": 111, "category": "clothing", "condition": "new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	29	18	4	11	193	f	\N	Science	2025-11-06 02:37:13.333	2025-11-06 02:37:13.333	\N
ac03c59d-7406-4d79-9c11-8df095a752b5	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Library chic 📚 #AcademicFashion	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	f	\N	19	8	1	6	97	f	\N	Science	2025-10-16 00:54:20.578	2025-10-16 00:54:20.578	\N
2caa8426-4c71-42a0-886c-ddc8473360eb	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Bold colors today 🎨 #Creative	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	t	{"size": "L", "price": 104, "category": "clothing", "condition": "like-new", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	28	16	5	12	174	f	\N	Science	2025-11-09 14:30:47.846	2025-11-09 14:30:47.846	\N
60660f67-65bd-478f-b234-c4366b74a597	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Comfort meets style 😊 #CampusLife	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	connections	t	{"size": "XL", "price": 65, "category": "clothing", "condition": "good", "description": "Great condition item", "contactPhone": "+233501234567", "meetupLocation": "Campus Library", "paymentMethods": ["Mobile Money", "Cash"]}	16	2	6	14	45	f	\N	Science	2025-11-09 00:31:58.721	2025-11-09 00:31:58.721	\N
0fd0f03e-0773-4caa-a7f2-ecdec12fa988	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	carousel	Perfect outfit for today's presentation! 💼 #CampusStyle	{"images": ["https://i.imgur.com/Ynh9LMX.jpg", "https://i.imgur.com/D3CYJcL.jpg", "https://i.imgur.com/JObkVPV.jpg"]}	Campus Library	{OOTD,CampusStyle}	\N	\N	public	f	\N	48	18	4	0	104	f	\N	Science	2025-11-06 19:46:07.687	2025-11-06 19:46:07.687	\N
\.


--
-- TOC entry 5615 (class 0 OID 33787)
-- Dependencies: 225
-- Data for Name: ranking_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ranking_history (id, user_id, ranking_period, rank, score, ranking_type, created_at) FROM stdin;
\.


--
-- TOC entry 5616 (class 0 OID 33803)
-- Dependencies: 226
-- Data for Name: ranking_prizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ranking_prizes (id, user_id, ranking_period, rank, prize_amount, prize_type, awarded_at) FROM stdin;
\.


--
-- TOC entry 5640 (class 0 OID 34206)
-- Dependencies: 250
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.referrals (id, referrer_id, referred_id, referral_code, created_at) FROM stdin;
\.


--
-- TOC entry 5619 (class 0 OID 33862)
-- Dependencies: 229
-- Data for Name: saved_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_items (id, user_id, item_id, created_at) FROM stdin;
\.


--
-- TOC entry 5638 (class 0 OID 34189)
-- Dependencies: 248
-- Data for Name: share_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.share_analytics (id, share_id, user_agent, ip_address, clicked_at) FROM stdin;
\.


--
-- TOC entry 5642 (class 0 OID 34229)
-- Dependencies: 252
-- Data for Name: share_analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.share_analytics_events (id, share_id, event_type, user_id, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 5644 (class 0 OID 34255)
-- Dependencies: 254
-- Data for Name: share_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.share_templates (id, content_type, platform, template, variables, is_default, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5636 (class 0 OID 34165)
-- Dependencies: 246
-- Data for Name: shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shares (id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5611 (class 0 OID 33688)
-- Dependencies: 221
-- Data for Name: store_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_items (id, seller_id, name, description, price, original_price, category, condition, size, brand, color, material, images, views_count, likes_count, saves_count, sales_count, status, payment_methods, meetup_location, seller_phone, created_at, updated_at, deleted_at) FROM stdin;
9cfab39e-d030-4aec-9bd3-26e9fae18f23	8f952bb1-9ff6-4477-93ea-4972efcc383b	Eco-Friendly Dress	Sustainable fashion dress in excellent condition	45.00	60.00	clothing	like-new	M	Zara	\N	\N	{https://i.imgur.com/Ynh9LMX.jpg}	156	24	8	2	active	{"Mobile Money",Cash}	Campus Library	+233501234567	2025-11-10 00:24:07.294	2025-11-11 00:24:09.128	\N
d28a1903-a89f-44fa-ad9f-cbc58a5d7f9c	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Jacket	Professional business jacket, perfect for presentations	89.00	\N	clothing	new	L	H&M	\N	\N	{https://i.imgur.com/D3CYJcL.jpg}	234	45	12	3	active	{"Mobile Money",Cash,"Bank Transfer"}	Student Union Building	+233501234568	2025-11-09 00:24:07.294	2025-11-11 00:24:09.153	\N
05a1fbf6-76e1-4871-873a-cbf99a832c3a	413719c0-2a04-445d-ba47-0f3a88d40471	Artistic Blouse	Unique vintage-style blouse	32.00	\N	clothing	good	S	Vintage	\N	\N	{https://i.imgur.com/JObkVPV.jpg}	98	18	5	3	active	{Cash}	Main Gate	+233501234569	2025-11-08 00:24:07.294	2025-11-11 00:24:09.158	\N
c8d8c806-6d55-41d2-a37c-9e5cd090313f	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Medical Scrubs	Comfortable medical scrubs for clinical rotations	28.00	\N	clothing	new	M	Generic	\N	\N	{https://i.imgur.com/KnZQY6W.jpg}	67	12	3	1	active	{"Mobile Money",Cash}	Faculty Building	+233501234570	2025-11-07 00:24:07.294	2025-11-11 00:24:09.16	\N
b1abcf2e-2430-4a05-9ff4-e68ce54102b4	8f952bb1-9ff6-4477-93ea-4972efcc383b	Eco-Friendly Dress	Sustainable fashion dress in excellent condition	45.00	60.00	clothing	like-new	M	Zara	\N	\N	{https://i.imgur.com/Ynh9LMX.jpg}	156	24	8	0	active	{"Mobile Money",Cash}	Campus Library	+233501234567	2025-11-10 00:25:24.862	2025-11-11 00:25:26.712	\N
7f6379e8-ae78-49f9-ae77-1363ee267ab0	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Jacket	Professional business jacket, perfect for presentations	89.00	\N	clothing	new	L	H&M	\N	\N	{https://i.imgur.com/D3CYJcL.jpg}	234	45	12	0	active	{"Mobile Money",Cash,"Bank Transfer"}	Student Union Building	+233501234568	2025-11-09 00:25:24.862	2025-11-11 00:25:26.716	\N
d07e0ed6-a7cf-4fc8-bc99-75209de9d1c2	413719c0-2a04-445d-ba47-0f3a88d40471	Artistic Blouse	Unique vintage-style blouse	32.00	\N	clothing	good	S	Vintage	\N	\N	{https://i.imgur.com/JObkVPV.jpg}	98	18	5	4	active	{Cash}	Main Gate	+233501234569	2025-11-08 00:25:24.862	2025-11-11 00:25:26.718	\N
464bedd8-397e-486a-8ebd-0027bf0cb92d	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Medical Scrubs	Comfortable medical scrubs for clinical rotations	28.00	\N	clothing	new	M	Generic	\N	\N	{https://i.imgur.com/KnZQY6W.jpg}	67	12	3	1	active	{"Mobile Money",Cash}	Faculty Building	+233501234570	2025-11-07 00:25:24.862	2025-11-11 00:25:26.72	\N
f1fd195b-ad59-443b-84e0-0c4232615d05	8f952bb1-9ff6-4477-93ea-4972efcc383b	Eco-Friendly Dress	Sustainable fashion dress in excellent condition	45.00	60.00	clothing	like-new	M	Zara	\N	\N	{https://i.imgur.com/Ynh9LMX.jpg}	156	24	8	1	active	{"Mobile Money",Cash}	Campus Library	+233501234567	2025-11-10 00:26:00.218	2025-11-11 00:26:02.281	\N
29e8f37f-d47c-4ba5-b56e-a417a020e21b	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Jacket	Professional business jacket, perfect for presentations	89.00	\N	clothing	new	L	H&M	\N	\N	{https://i.imgur.com/D3CYJcL.jpg}	234	45	12	2	active	{"Mobile Money",Cash,"Bank Transfer"}	Student Union Building	+233501234568	2025-11-09 00:26:00.218	2025-11-11 00:26:02.284	\N
eb8e23d0-efaf-4b28-91cb-85ca0ffa4d7b	413719c0-2a04-445d-ba47-0f3a88d40471	Artistic Blouse	Unique vintage-style blouse	32.00	\N	clothing	good	S	Vintage	\N	\N	{https://i.imgur.com/JObkVPV.jpg}	98	18	5	3	active	{Cash}	Main Gate	+233501234569	2025-11-08 00:26:00.218	2025-11-11 00:26:02.286	\N
a4b1da8d-4354-4d8b-a21e-f2a174299a07	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Medical Scrubs	Comfortable medical scrubs for clinical rotations	28.00	\N	clothing	new	M	Generic	\N	\N	{https://i.imgur.com/KnZQY6W.jpg}	67	12	3	3	active	{"Mobile Money",Cash}	Faculty Building	+233501234570	2025-11-07 00:26:00.218	2025-11-11 00:26:02.287	\N
ec640027-8023-4035-9022-ab83b243464f	8f952bb1-9ff6-4477-93ea-4972efcc383b	Eco-Friendly Dress	Sustainable fashion dress in excellent condition	45.00	60.00	clothing	like-new	M	Zara	\N	\N	{https://i.imgur.com/Ynh9LMX.jpg}	156	24	8	2	active	{"Mobile Money",Cash}	Campus Library	+233501234567	2025-11-10 00:26:28.132	2025-11-11 00:26:30.24	\N
45edda7d-bfdd-40b6-bfe5-c43a6b2d28ca	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Jacket	Professional business jacket, perfect for presentations	89.00	\N	clothing	new	L	H&M	\N	\N	{https://i.imgur.com/D3CYJcL.jpg}	234	45	12	1	active	{"Mobile Money",Cash,"Bank Transfer"}	Student Union Building	+233501234568	2025-11-09 00:26:28.132	2025-11-11 00:26:30.243	\N
d68d59a0-d450-47f0-ab25-e5ff2c4d7d6f	413719c0-2a04-445d-ba47-0f3a88d40471	Artistic Blouse	Unique vintage-style blouse	32.00	\N	clothing	good	S	Vintage	\N	\N	{https://i.imgur.com/JObkVPV.jpg}	98	18	5	0	active	{Cash}	Main Gate	+233501234569	2025-11-08 00:26:28.132	2025-11-11 00:26:30.244	\N
82e5dabc-1340-42cd-bd43-0c50ad131429	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Medical Scrubs	Comfortable medical scrubs for clinical rotations	28.00	\N	clothing	new	M	Generic	\N	\N	{https://i.imgur.com/KnZQY6W.jpg}	67	12	3	2	active	{"Mobile Money",Cash}	Faculty Building	+233501234570	2025-11-07 00:26:28.132	2025-11-11 00:26:30.245	\N
a3f53a03-c294-4978-b9e0-dd8beec6891a	8f952bb1-9ff6-4477-93ea-4972efcc383b	Eco-Friendly Dress	Sustainable fashion dress in excellent condition	45.00	60.00	clothing	like-new	M	Zara	\N	\N	{https://i.imgur.com/Ynh9LMX.jpg}	156	24	8	4	active	{"Mobile Money",Cash}	Campus Library	+233501234567	2025-11-10 00:26:59.555	2025-11-11 00:27:02.271	\N
ee82a1a7-2af2-4ede-b3d8-e6c00fa0908e	44393f55-fc53-4050-a244-6fc49bc9e2db	Business Jacket	Professional business jacket, perfect for presentations	89.00	\N	clothing	new	L	H&M	\N	\N	{https://i.imgur.com/D3CYJcL.jpg}	234	45	12	1	active	{"Mobile Money",Cash,"Bank Transfer"}	Student Union Building	+233501234568	2025-11-09 00:26:59.555	2025-11-11 00:27:02.275	\N
eb23a13e-ee6d-428d-8832-af4796236edc	413719c0-2a04-445d-ba47-0f3a88d40471	Artistic Blouse	Unique vintage-style blouse	32.00	\N	clothing	good	S	Vintage	\N	\N	{https://i.imgur.com/JObkVPV.jpg}	98	18	5	4	active	{Cash}	Main Gate	+233501234569	2025-11-08 00:26:59.555	2025-11-11 00:27:02.277	\N
af967fba-106c-4441-800a-e61fb5422e41	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	Medical Scrubs	Comfortable medical scrubs for clinical rotations	28.00	\N	clothing	new	M	Generic	\N	\N	{https://i.imgur.com/KnZQY6W.jpg}	67	12	3	4	active	{"Mobile Money",Cash}	Faculty Building	+233501234570	2025-11-07 00:26:59.555	2025-11-11 00:27:02.279	\N
\.


--
-- TOC entry 5656 (class 0 OID 34545)
-- Dependencies: 266
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stories (id, user_id, type, media, caption, location, views_count, created_at, updated_at, expires_at, deleted_at) FROM stdin;
16978793-c516-45bd-952e-82ca05f02c63	413719c0-2a04-445d-ba47-0f3a88d40471	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/Ynh9LMX.jpg"}	Daily update! 📸	Campus	32	2025-11-10 19:39:13.263	2025-11-10 19:39:13.263	2025-11-11 19:39:13.263	\N
134839cf-c6a0-4b4d-bae5-b26e1e0a4704	413719c0-2a04-445d-ba47-0f3a88d40471	image	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	32	2025-11-10 05:45:45.705	2025-11-10 05:45:45.705	2025-11-11 05:45:45.705	\N
0ee7ed30-fe4b-4e48-889f-7b741b9a4da1	413719c0-2a04-445d-ba47-0f3a88d40471	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	40	2025-11-10 01:20:45.202	2025-11-10 01:20:45.202	2025-11-11 01:20:45.202	\N
afcc2d1e-8657-4910-be26-9b259f8d2db1	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/Ynh9LMX.jpg"}	Daily update! 📸	Campus	36	2025-11-10 07:03:36.089	2025-11-10 07:03:36.089	2025-11-11 07:03:36.089	\N
eff010be-0a2a-4ce4-9fed-aa8f0b4a1f5b	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	42	2025-11-10 22:39:38.567	2025-11-10 22:39:38.567	2025-11-11 22:39:38.567	\N
e4102443-de51-4f59-9b48-b0e27aebf9c3	da43914e-1f27-42b0-8070-3d222212a043	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	23	2025-11-10 06:12:05.073	2025-11-10 06:12:05.073	2025-11-11 06:12:05.073	\N
c48db758-5062-49f7-9719-d98f2f5e7da2	da43914e-1f27-42b0-8070-3d222212a043	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	5	2025-11-10 14:56:23.417	2025-11-10 14:56:23.417	2025-11-11 14:56:23.417	\N
b28b6a68-8e5c-4955-b6ca-698e9ae9f340	da43914e-1f27-42b0-8070-3d222212a043	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	13	2025-11-10 23:05:56.346	2025-11-10 23:05:56.346	2025-11-11 23:05:56.346	\N
7586c613-30ad-47fb-a0d4-3b2983e62521	57a82d0a-cd78-427e-baaf-afb253178536	image	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	10	2025-11-10 15:16:43.939	2025-11-10 15:16:43.939	2025-11-11 15:16:43.939	\N
8bcd48eb-e103-48c5-80d7-f47fd21c6d38	57a82d0a-cd78-427e-baaf-afb253178536	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	30	2025-11-10 07:54:01.717	2025-11-10 07:54:01.717	2025-11-11 07:54:01.717	\N
5988be74-9d5b-4f8c-9994-c1330f18f853	da43914e-1f27-42b0-8070-3d222212a043	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	20	2025-11-10 10:52:02.858	2025-11-10 10:52:02.858	2025-11-11 10:52:02.858	\N
616258df-e1b8-4f59-8a7b-d53a732eeeea	da43914e-1f27-42b0-8070-3d222212a043	image	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	38	2025-11-10 16:47:30.184	2025-11-10 16:47:30.184	2025-11-11 16:47:30.184	\N
3368e6be-a366-4d7e-8674-8211d544e3f3	da43914e-1f27-42b0-8070-3d222212a043	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Daily update! 📸	Campus	30	2025-11-10 17:59:50.517	2025-11-10 17:59:50.517	2025-11-11 17:59:50.517	\N
fe4dc3ec-ed1d-45a0-b6f9-9c067f9c2250	57a82d0a-cd78-427e-baaf-afb253178536	image	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Daily update! 📸	Campus	29	2025-11-10 11:23:01.514	2025-11-10 11:23:01.514	2025-11-11 11:23:01.514	\N
2a8e1b0d-ac9e-4337-add3-998c1017ca6c	57a82d0a-cd78-427e-baaf-afb253178536	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	52	2025-11-10 09:53:44.198	2025-11-10 09:53:44.198	2025-11-11 09:53:44.198	\N
bc91826f-125a-43d3-8315-ad219bb3515e	57a82d0a-cd78-427e-baaf-afb253178536	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	6	2025-11-10 08:35:37.967	2025-11-10 08:35:37.967	2025-11-11 08:35:37.967	\N
04333691-0e3b-4f19-82ff-491d66fe42fc	413719c0-2a04-445d-ba47-0f3a88d40471	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	38	2025-11-10 11:21:58.953	2025-11-10 11:21:58.953	2025-11-11 11:21:58.953	\N
36cbc12f-6f56-4b97-8d76-186a9bc92475	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	25	2025-11-10 08:41:16.996	2025-11-10 08:41:16.996	2025-11-11 08:41:16.996	\N
8f9fbbb5-cdcc-4ef3-96d1-1a57843bdec1	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Daily update! 📸	Campus	45	2025-11-10 06:57:46.393	2025-11-10 06:57:46.393	2025-11-11 06:57:46.393	\N
220e82d3-537a-457b-afa2-841b3a0ed7e1	57a82d0a-cd78-427e-baaf-afb253178536	image	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	45	2025-11-10 06:36:03.916	2025-11-10 06:36:03.916	2025-11-11 06:36:03.916	\N
8fea4365-c88e-4ce4-9335-922d5159f4bf	57a82d0a-cd78-427e-baaf-afb253178536	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	14	2025-11-10 02:21:59.665	2025-11-10 02:21:59.665	2025-11-11 02:21:59.665	\N
58910d86-24d7-4f34-8eb3-d7f4d2511214	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/D3CYJcL.jpg"}	Daily update! 📸	Campus	12	2025-11-10 05:37:29.03	2025-11-10 05:37:29.03	2025-11-11 05:37:29.03	\N
1a5da583-ead8-41d7-9aea-131661c813e6	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	21	2025-11-10 16:05:55.148	2025-11-10 16:05:55.148	2025-11-11 16:05:55.148	\N
a5100b69-ade8-4a3b-9a40-92feac1ee0fd	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	25	2025-11-10 00:44:13.83	2025-11-10 00:44:13.83	2025-11-11 00:44:13.83	\N
2dc6ebb3-6802-4884-89e7-4246f0b17b4d	44393f55-fc53-4050-a244-6fc49bc9e2db	image	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	8	2025-11-10 17:52:12.489	2025-11-10 17:52:12.489	2025-11-11 17:52:12.489	\N
b9cbfed7-82f5-4423-9c48-c153bbd36a1b	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	40	2025-11-10 10:14:04.229	2025-11-10 10:14:04.229	2025-11-11 10:14:04.229	\N
bfac9791-5978-496a-8a6c-f4f004234556	57a82d0a-cd78-427e-baaf-afb253178536	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	13	2025-11-10 03:18:28.043	2025-11-10 03:18:28.043	2025-11-11 03:18:28.043	\N
29876315-a43c-47be-bf08-1a38328db33b	57a82d0a-cd78-427e-baaf-afb253178536	image	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	33	2025-11-10 02:08:16.823	2025-11-10 02:08:16.823	2025-11-11 02:08:16.823	\N
e9d70ab3-9a31-439d-9ffe-adab8ae28974	8f952bb1-9ff6-4477-93ea-4972efcc383b	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	20	2025-11-10 17:54:43.326	2025-11-10 17:54:43.326	2025-11-11 17:54:43.326	\N
6f0ea618-4cbe-4d50-9afc-945a46111b35	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	19	2025-11-10 10:09:33.276	2025-11-10 10:09:33.276	2025-11-11 10:09:33.276	\N
fc9528fe-2358-416e-9dfb-a04ce64fd6e5	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Daily update! 📸	Campus	21	2025-11-10 00:48:38.942	2025-11-10 00:48:38.942	2025-11-11 00:48:38.942	\N
42cb3f62-394c-4e91-9515-67a9e17faedf	413719c0-2a04-445d-ba47-0f3a88d40471	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	20	2025-11-10 11:04:32.482	2025-11-10 11:04:32.482	2025-11-11 11:04:32.482	\N
78ca59a2-661c-4920-9d45-309315eda75e	413719c0-2a04-445d-ba47-0f3a88d40471	image	{"image": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	15	2025-11-10 20:52:16.01	2025-11-10 20:52:16.01	2025-11-11 20:52:16.01	\N
3cdc77d9-0323-4fcd-a369-f89f585dc45f	413719c0-2a04-445d-ba47-0f3a88d40471	video	{"video": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "thumbnail": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	18	2025-11-10 06:21:53.768	2025-11-10 06:21:53.768	2025-11-11 06:21:53.768	\N
19f89f6a-7a51-4145-a04b-53f1cbe68421	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4", "thumbnail": "https://i.imgur.com/IigY4Hm.jpg"}	Daily update! 📸	Campus	11	2025-11-10 03:26:06.362	2025-11-10 03:26:06.362	2025-11-11 03:26:06.362	\N
ea80623d-21c1-49cc-891e-e50a59fe3469	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	23	2025-11-10 04:10:29.257	2025-11-10 04:10:29.257	2025-11-11 04:10:29.257	\N
1abd7e7a-1e20-43a4-b2e5-8deecf3a2a25	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	image	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	33	2025-11-10 23:10:01.883	2025-11-10 23:10:01.883	2025-11-11 23:10:01.883	\N
ca567be6-7b98-435d-b7e8-2a2d304c9bb9	da43914e-1f27-42b0-8070-3d222212a043	image	{"image": "https://i.imgur.com/Ynh9LMX.jpg"}	Daily update! 📸	Campus	37	2025-11-10 19:50:56.72	2025-11-10 19:50:56.72	2025-11-11 19:50:56.72	\N
bb8f153f-9848-4b2a-a1f1-96b72c6b2bc9	da43914e-1f27-42b0-8070-3d222212a043	image	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	32	2025-11-10 21:51:47.948	2025-11-10 21:51:47.948	2025-11-11 21:51:47.948	\N
b433c209-606e-4bdb-bae1-5d0d928c6012	da43914e-1f27-42b0-8070-3d222212a043	image	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	27	2025-11-10 05:37:47.892	2025-11-10 05:37:47.892	2025-11-11 05:37:47.892	\N
ce20cd92-64a2-4313-b20f-7c5a1d9816b4	57a82d0a-cd78-427e-baaf-afb253178536	image	{"image": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	51	2025-11-10 06:13:16.758	2025-11-10 06:13:16.758	2025-11-11 06:13:16.758	\N
537f0d95-0b44-41a9-86f8-4a43005faff9	8f952bb1-9ff6-4477-93ea-4972efcc383b	image	{"image": "https://i.imgur.com/KnZQY6W.jpg"}	Daily update! 📸	Campus	48	2025-11-10 13:24:54.3	2025-11-10 13:24:54.3	2025-11-11 13:24:54.3	\N
0eb1ab43-0fe2-4d40-95c0-f0d32decfea0	413719c0-2a04-445d-ba47-0f3a88d40471	image	{"image": "https://i.imgur.com/nV6fsQh.jpg"}	Daily update! 📸	Campus	25	2025-11-10 01:52:10.689	2025-11-10 01:52:10.689	2025-11-11 01:52:10.689	\N
e56863a0-6281-43e5-a8b2-89de568b200e	44393f55-fc53-4050-a244-6fc49bc9e2db	video	{"video": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "thumbnail": "https://i.imgur.com/JObkVPV.jpg"}	Daily update! 📸	Campus	50	2025-11-10 07:52:13.465	2025-11-10 07:52:13.465	2025-11-11 07:52:13.465	\N
\.


--
-- TOC entry 5634 (class 0 OID 34148)
-- Dependencies: 244
-- Data for Name: story_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.story_views (id, story_id, user_id, viewed_at) FROM stdin;
\.


--
-- TOC entry 5613 (class 0 OID 33744)
-- Dependencies: 223
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, plan_type, amount, payment_method, payment_reference, status, starts_at, expires_at, created_at, subscription_code) FROM stdin;
\.


--
-- TOC entry 5628 (class 0 OID 34043)
-- Dependencies: 238
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_activity_logs (id, user_id, activity_type, activity_data, ip_address, user_agent, "timestamp", created_at) FROM stdin;
f2da5f93-a261-4367-a25d-078e99f29fb9	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 81, "sessionId": "a8bee910-5d5c-4e3c-9bb5-1f73500e1aa6"}	::ffff:192.168.100.28	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	2025-11-10 20:28:57.074	2025-11-10 20:28:57.076372
b9eda400-d1d5-4a1d-b601-69e6cad28ef8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1015, "sessionId": "a0c01036-128c-4dbf-95ed-21861fe5a07b"}	::ffff:192.168.100.28	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019	2025-11-10 20:29:17.334	2025-11-10 20:29:17.335998
d40dffd0-cfa5-46d0-b0c8-f01960a7212a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1193, "sessionId": "8f89b7b2-881b-4f85-8cc3-afb0f5d59bcf"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:31:51.884	2025-11-10 20:31:51.885125
f6c38423-3f51-462d-9cae-980738d09a96	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1847, "sessionId": "a12e887d-2539-48d6-bff8-8a7be4b3f41f"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:32:37.068	2025-11-10 20:32:37.06909
0e3d382c-74cf-4db3-bb30-2a16422f5bea	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 240, "sessionId": "dc074cdb-075a-4fbe-ba39-304d140e8c5c"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:33:49.368	2025-11-10 20:33:49.368891
45fb7eeb-4de0-4ec1-b24e-27034652861f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1036, "sessionId": "873b8d8a-a4a9-41ac-934e-5b0cfde54cd1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:34:36.23	2025-11-10 20:34:36.231706
884e34bf-8068-4b9d-bca4-10fd5cd575c6	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 157, "sessionId": "945e5a9e-9272-4eb4-8d39-25bb455dc952"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:43:30.256	2025-11-10 20:43:30.257035
3de1c144-3381-4619-90b1-89e51e7ba6dc	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1168, "sessionId": "1dc0e525-67df-4d30-8157-4a722f37ded2"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:43:31.259	2025-11-10 20:43:31.260745
460b4f41-4a6a-4f27-9715-26ae8bf3bdd4	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 17, "sessionId": "1a6e0afe-5765-4c5f-92e7-4301d73f5c55"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:43:38.069	2025-11-10 20:43:38.0706
e1720c5f-c09f-487e-9c7a-ca5f06329963	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1137, "sessionId": "6de5c6c2-f8e2-462d-8723-dd7b6f13479c"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:43:39.189	2025-11-10 20:43:39.190477
73a64a1f-4457-4733-b4ab-c6d7c57739a6	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1075, "sessionId": "5190f94e-65a1-40a7-baa3-593b208b889a"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:44:00.829	2025-11-10 20:44:00.830676
60d4a2c2-8eff-4a57-895f-e813e51f46be	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1030, "sessionId": "2b52482d-4821-466e-94c5-d2dd0b45ec57"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:44:08.997	2025-11-10 20:44:08.998438
5e397f4f-b06c-471b-8f0e-3d3a81261163	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 192, "sessionId": "2fc809a4-845a-4ebb-b437-d57a64636fbf"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:51:58.943	2025-11-10 20:51:58.94428
7e34f91b-f6a3-44c6-a5a7-26e56a4d7817	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 73, "sessionId": "bf0d3e74-960c-41ee-839b-eacfc7b29300"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:52:33.346	2025-11-10 20:52:33.347263
02d2678a-be41-450e-8dfa-462c2259c4f8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1252, "sessionId": "02ee1f5c-e3a8-4b7c-8ceb-ce1e943c1679"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:52:36.271	2025-11-10 20:52:36.272938
23a07a55-26c2-4d49-8bd8-e8805e8da17f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1033, "sessionId": "24a4cb76-9de5-463c-bf4e-de3c2ec62985"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:54:47.632	2025-11-10 20:54:47.633227
187aaaff-34ff-4306-80da-d22ba3c9e39c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1033, "sessionId": "41ec93b1-430c-46c3-b62e-4fdb8ab66fce"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:55:16.395	2025-11-10 20:55:16.395913
a0e72527-4ceb-492e-831a-70b439ad1a91	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1185, "sessionId": "3afc7d29-b4bf-4533-ac4a-26e2cc152380"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 20:55:16.558	2025-11-10 20:55:16.5597
34c7e02a-46af-460a-82f0-83660be9d31c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/notifications/test", "duration": 1103, "sessionId": "96f549a0-e4bb-44d0-9758-bad044114064"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:05:41.44	2025-11-10 21:05:41.441586
d2f7c29e-cfbd-4614-94a0-54c03dce964f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 23, "sessionId": "29e80b55-371e-43f2-8b40-becaffd67092"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:05:52.098	2025-11-10 21:05:52.09995
0d27c345-0759-4891-bbb3-a1bfed5ce7b2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 54, "sessionId": "f34de5ce-aadb-4073-9b03-c04b9dc8f47a"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:16:35.437	2025-11-10 21:16:35.438858
403b2853-a115-4ed4-a2af-cfcd1783a9b5	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1145, "sessionId": "a4a2bf27-e1e6-4c16-b078-b02012ec6377"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:16:37.913	2025-11-10 21:16:37.914839
b7512999-0891-43c2-932f-6b8659bb01db	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1154, "sessionId": "27b0ee65-26f1-4fe1-aa36-c5eb67cc7942"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:16:52.685	2025-11-10 21:16:52.686348
f9eb726f-6ec1-41a0-b3ee-3747decdd0c2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 983, "sessionId": "74cb0799-d695-44f8-bd1e-0cb1f016483e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:16:58.679	2025-11-10 21:16:58.680667
9a4fe721-d389-401d-ad2f-57aab935ebaf	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 193, "sessionId": "93292676-1395-4993-b7e5-ee02c176819d"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:22:27.669	2025-11-10 21:22:27.670424
73894aa2-357d-4fab-9f71-f8d51b292d96	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1680, "sessionId": "6a80456f-b844-4190-b75f-190d32184b6d"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:24:26.97	2025-11-10 21:24:26.97108
3736b096-25c6-4360-b394-6d3bff01b1cd	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1840, "sessionId": "fac664bb-e334-4521-8fb7-df05f9972ce0"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:24:27.138	2025-11-10 21:24:27.138806
af91d0bc-69b5-4ae1-a06a-18c4fac859f2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1846, "sessionId": "207ffed6-dfae-4819-bdb0-2b7d19a8b28f"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:24:27.143	2025-11-10 21:24:27.144198
535755e6-0b0d-4d4c-900c-b7b05bce0d45	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 40, "sessionId": "9293c533-325a-4f1b-bb73-6b18deec2822"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:50:24.878	2025-11-10 21:50:24.879455
98226d74-86d2-44e0-9ba7-b836a7587a28	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 34, "sessionId": "9e7091a4-4df8-46f5-b71b-bf2c062a85e7"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:50:24.88	2025-11-10 21:50:24.881162
2506ff04-9fcc-4f5c-b620-342a80d14b3d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 27, "sessionId": "714acae8-d9ea-461c-94fe-4ee86e979124"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:50:25.696	2025-11-10 21:50:25.696808
a637bb5b-b6d7-4b30-bd64-bcc228b81b1a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1037, "sessionId": "6fe56797-ffc6-41e7-aaea-46429a0d0f6c"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:50:28.076	2025-11-10 21:50:28.076677
91336350-dbed-45aa-a819-90952e749ef0	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1079, "sessionId": "c0f62a05-37dd-4b5a-9b71-6320af1a2867"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:50:52.183	2025-11-10 21:50:52.184211
ed38cc71-6388-46f9-b698-15550845e251	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 985, "sessionId": "40dba7d3-3bc6-4aed-9717-e8912106a336"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:51:05.046	2025-11-10 21:51:05.047914
948d53a4-0b68-4f82-9088-3e1f6989c10d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 170, "sessionId": "90cf4991-8fee-43d0-95c6-a0dcdb0bf3fb"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:53:32.461	2025-11-10 21:53:32.461647
89489686-6348-411b-9a18-acc68f694e42	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 167, "sessionId": "d079cb11-854b-4228-9fc3-9322f2a2b383"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:53:32.467	2025-11-10 21:53:32.46759
1884b877-aa67-4bfc-bf66-816173b0fe81	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 32, "sessionId": "a1b5b3a2-3ee3-44b1-8d7f-1adb1fe7a179"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:53:59.877	2025-11-10 21:53:59.87855
c6fdc917-52a1-49cc-ab96-c3bcb1c2f15b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1528, "sessionId": "6fa19e29-c6d3-4609-b6f1-85e8d4528600"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:54:02.299	2025-11-10 21:54:02.299647
2fee553d-da86-45ea-b721-4e4d40a80e9e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 19, "sessionId": "cfdf92a0-e266-4d56-9a1c-8139d6ca6e6a"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:54:08.59	2025-11-10 21:54:08.590985
ef3271a0-be6c-461b-8e2c-3bf3df55f842	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 970, "sessionId": "180a9078-fde4-4179-95b5-1fc50cf5dff0"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:54:27.189	2025-11-10 21:54:27.190492
853a45e0-bff1-4f4e-937d-8515e1c8c44e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 12, "sessionId": "bc329bcb-6559-4f2f-b93f-5ebceb3a654b"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:54:38.249	2025-11-10 21:54:38.249785
fcada934-27d6-4aac-aff3-dc3c3907605a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 9, "sessionId": "5675dd04-892d-4a98-920f-fba59a8b2478"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:54:45.116	2025-11-10 21:54:45.116962
59f4ff45-52e0-4006-8ade-3d0506ee5a01	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 16, "sessionId": "04ba1e96-3719-4e62-aa1a-c7f683f2aa61"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:56:12.643	2025-11-10 21:56:12.644385
cd298eb1-f543-45f3-9af0-2f06a326f5c2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 239, "sessionId": "3a446686-792a-436f-aef7-e949a614c54e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:56:12.872	2025-11-10 21:56:12.872742
bef0144b-5318-46f6-84ff-edcffb3e1f4c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 11, "sessionId": "0bb905f4-c1e2-4f80-88e8-80b665bff1e7"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:56:27.943	2025-11-10 21:56:27.943978
d6f277f6-be61-4e7d-82ff-51ed3ad70997	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 985, "sessionId": "e8f4d682-070c-464f-be8a-4d0c6d0d2e21"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:56:29.952	2025-11-10 21:56:29.952656
8bed510b-5a00-45ec-979a-9afa0691d4eb	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1137, "sessionId": "5c2da2bc-136d-45f5-90a1-094ee667aa32"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:57:36.724	2025-11-10 21:57:36.725565
2db1b57c-0077-47c5-a05f-f1e50958a12b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 13, "sessionId": "84303d65-6905-4ef7-8090-d5fbe56374d5"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 21:59:59.598	2025-11-10 21:59:59.59904
c4d576ba-2f1f-4a88-b2bb-68f13907b693	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 10, "sessionId": "4cc1deda-f112-478a-ad24-425685927d9b"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:00:00.062	2025-11-10 22:00:00.063243
09ba3ab2-4b53-464b-b5a7-12ec5871aa41	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 23, "sessionId": "46658c1d-919e-482f-b559-83036752b3fb"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:00:00.071	2025-11-10 22:00:00.071928
80a1b39f-0591-46a6-987f-d7f928f6283f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 2152, "sessionId": "bb83b250-4cc3-4be9-99a5-804516f87164"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:00:03.585	2025-11-10 22:00:03.58621
6b86e692-00d7-4547-a8ec-234dc2fb9c41	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1283, "sessionId": "56ac079e-c70c-4c79-9cbf-21eb44eef9b3"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:00:33.384	2025-11-10 22:00:33.385128
2b6e3b56-9ce1-4d38-b2de-f3d2e7a2424f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1033, "sessionId": "5e30cc31-c606-4556-b88f-aad422ddd0cf"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:00:43.655	2025-11-10 22:00:43.655587
a6d7a33c-d00f-475d-b5b8-0ed00e8a1792	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 138, "sessionId": "40a87040-1469-469c-a161-3aef104f6d16"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:08:03.289	2025-11-10 22:08:03.290076
4e403343-9909-4fe5-addb-fe17729c5d72	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 158, "sessionId": "267e80e1-fe4b-4d05-ad7e-df510319a8a0"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:09:14.246	2025-11-10 22:09:14.247383
7262ef39-57eb-42ce-ae1f-7bfa78e9ec6b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 160, "sessionId": "18f13f18-90cc-4d10-ad04-2642958d852e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:09:14.25	2025-11-10 22:09:14.251191
2416e9f6-0cbe-476f-bee1-b887ec5ecfa2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 563, "sessionId": "2e756901-842c-42e1-abc8-860103664d97"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:23:15.09	2025-11-10 22:23:15.092043
20de140f-29ed-4d41-bafc-3076bada643f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 512, "sessionId": "44173100-3a8a-4ea7-a662-afa696f49b42"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:23:15.091	2025-11-10 22:23:15.092328
4d5d8f23-dd71-47d4-8e6e-5494d35a2bbd	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 53, "sessionId": "eb1430e6-a0bb-4b5b-924e-92a148619226"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:23:41.495	2025-11-10 22:23:41.49651
b7adbec3-a073-4038-84b1-b716e1330d8c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 3128, "sessionId": "cfb6026a-cfac-4d13-9900-880d3862ac20"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:23:46.101	2025-11-10 22:23:46.1018
2e2ea928-3e3d-4449-b4ac-7c98765e5316	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 35, "sessionId": "7b5f54ff-9ae1-4fc6-b1af-d0e6ca070c25"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:23:47.727	2025-11-10 22:23:47.728526
0a705310-9302-498f-b8e1-eab14d008963	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1075, "sessionId": "411c80ce-0272-415a-9c15-4a7573910237"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:23:52.701	2025-11-10 22:23:52.702492
508a30f9-c9cc-4b13-a5ee-2246d4036526	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 147, "sessionId": "e7ccab71-5a9e-42d0-87fd-7a264dbc2567"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:24:23.818	2025-11-10 22:24:23.819245
29595348-d5ab-400f-b6f7-2f3be31467d2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 6, "sessionId": "ab50a951-820c-481d-9373-79ce71cc873c"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:25:16.93	2025-11-10 22:25:16.930701
2d5ba434-f8a6-4df4-a554-84a0a8e89e04	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1079, "sessionId": "55227141-54d4-4412-9eb7-082405a9e9d1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:24:53.222	2025-11-10 22:24:53.223356
eb92897e-4273-480c-acc4-d454cd89ebea	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 17, "sessionId": "c6b5e565-7ed0-40e3-9fdd-a36dce0df8ab"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:25:16.934	2025-11-10 22:25:16.935272
f55c9ddc-9604-40dc-8298-2a9e54dd71ee	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 20, "sessionId": "79f29fe9-120a-4445-a9fb-5273da4e05b4"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:25:17.192	2025-11-10 22:25:17.193104
f3c9e064-7f3f-4f83-8bf8-5a8b5aa0540c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1081, "sessionId": "cd5b21b6-45d2-40e1-bc1e-52fcb9e7c9ed"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:25:19.237	2025-11-10 22:25:19.237955
1f1e4836-dae9-4827-b101-4ef6acdcd8e9	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 433, "sessionId": "4701cc9c-2f87-4497-a17a-63def13d40ec"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:26:05.336	2025-11-10 22:26:05.337236
b71e6e91-3a6b-48a2-a913-e9859a8a0d9a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1086, "sessionId": "3f68f519-6b16-409f-9e6e-684cb9a4ad03"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:26:19.546	2025-11-10 22:26:19.54728
1a7bcb89-c2fc-4243-bc04-d75deacb5d63	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 112, "sessionId": "dbc9e8f2-4608-44af-b393-eb5cf1de66e1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:27:00.568	2025-11-10 22:27:00.569431
469e2536-2497-48d6-92f3-8b5afc1af89c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 113, "sessionId": "0dfa763c-4613-46df-a0b7-77f1f6d1a47e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:27:00.574	2025-11-10 22:27:00.57464
b99579ae-eab4-46cd-82ec-8ae536828389	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 50, "sessionId": "3b01adaa-82f4-42fe-b5fe-7d4748d18f1d"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:27:15.783	2025-11-10 22:27:15.783993
3ffaed6b-1677-4d21-8341-14f81d2b7c86	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1078, "sessionId": "84d3ee75-dedc-45ae-b70d-a276eee890d6"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:27:17.858	2025-11-10 22:27:17.859625
e43fe62e-d798-4a26-bc69-a52d52d011af	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1065, "sessionId": "74bdfd66-7d7e-4be7-b2f0-ed2a939c6b1e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:27:30.037	2025-11-10 22:27:30.038403
72342c47-ced5-45db-932a-2478b3b2fb15	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1537, "sessionId": "cea512aa-f001-4bc7-942b-7d2f827bff3c"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:29:56.546	2025-11-10 22:29:56.547842
279b6129-f9f0-4d8b-a33f-752d3e931049	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 112, "sessionId": "c8e9ba71-6b53-417e-bf36-2f46010d997c"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:30:39.768	2025-11-10 22:30:39.769438
652dedeb-50f4-41ee-9cd8-232a08ec1da0	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 414, "sessionId": "c799fac0-0069-473d-8fde-865b0a1ff014"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:32:10.34	2025-11-10 22:32:10.341517
c3568e06-2e4f-4b91-9f44-e6daf42b9215	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 511, "sessionId": "bf349c77-657a-4a99-a4de-0cc4d68746be"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:38:18.134	2025-11-10 22:38:18.135334
d62bd93a-5572-40e7-a2ce-7d38b1c1ccad	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 520, "sessionId": "2b82ef54-6f9d-443c-91bc-2629c8b6982a"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:38:18.136	2025-11-10 22:38:18.136968
50550953-ffae-44d0-bdef-92c0f1f9b886	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 33, "sessionId": "2703dfde-c8e3-44b8-8ee6-9ff321f40c49"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:38:39.83	2025-11-10 22:38:39.831598
5d812dfb-869f-40a1-b88c-4e6fab80a452	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1069, "sessionId": "96df2ff4-97d9-421a-b11b-42d8801ec00f"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:38:42.206	2025-11-10 22:38:42.20692
0f6b6b83-3bd6-40ae-af51-6bcf697b3818	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1289, "sessionId": "8eab14bc-6cff-412f-a7e5-b630e2e2d05f"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:39:19.8	2025-11-10 22:39:19.801689
230a94b7-9f9d-4804-b415-0548beb33ed8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1271, "sessionId": "4391b718-0700-4695-8132-6c5677a05eca"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:39:56.761	2025-11-10 22:39:56.762461
1edeee49-46f7-4e6b-898f-09d906ff5f52	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 8, "sessionId": "2d3f566a-913e-491d-b373-85bbf3d1f726"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:40:13.467	2025-11-10 22:40:13.468307
5ba13029-d5e0-4afd-8293-24a9a2066425	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 20, "sessionId": "3c2e455e-bfaa-4fdb-ac63-bcba7a564dcb"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:40:13.475	2025-11-10 22:40:13.476469
0ac0bf1a-39a8-4ed6-ac5d-fd047eccb60c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 27, "sessionId": "cf06e05d-f6ec-4a29-b4d8-29a098db2721"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:40:26.685	2025-11-10 22:40:26.68654
bb4615eb-5e15-49f0-a2f8-12c33e3fab1e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1071, "sessionId": "4faebf5b-26c1-4fa5-950d-f93f025ea69a"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:40:28.766	2025-11-10 22:40:28.767185
dd3a52ec-fe91-41bc-92fe-7d25fa0e9180	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1030, "sessionId": "a9712f3f-1e3c-4ecc-83c5-0b6605d2d798"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:40:43.717	2025-11-10 22:40:43.717872
117d9fc5-1350-4fb3-98b1-334e30a609ca	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 55, "sessionId": "b558d324-065f-4bcc-96ba-ae8eb595ac88"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:56:43.635	2025-11-10 22:56:43.636629
89725e6d-a841-4997-9d38-53da4945a04c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 170, "sessionId": "a45f1247-f772-43bc-a15c-f9c3eff1c211"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:56:43.754	2025-11-10 22:56:43.7552
0cbbbd4f-850b-4682-9a7b-812feb437ecc	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 27, "sessionId": "c52836a3-241b-4e23-94af-ae1d0fe8198d"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:56:43.95	2025-11-10 22:56:43.95189
95119746-39e0-4eec-8fd3-3e4194f51672	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1032, "sessionId": "ab1120e5-3ab0-44b6-8d8b-104dcbd3230e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:56:46.497	2025-11-10 22:56:46.498737
6b05e90f-afcc-4cab-ba1d-9ea24688af65	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1030, "sessionId": "b6bf924b-991b-4b92-884e-b62bf17ef1b5"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:56:58.428	2025-11-10 22:56:58.429233
0abaf617-4952-4fe7-a249-6a2f3433b077	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 24, "sessionId": "2269133d-56a5-463d-afc7-ba0ebe279fa8"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:57:13.496	2025-11-10 22:57:13.497089
927a6719-0d66-453c-bb16-296e049c83cd	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 15, "sessionId": "01541a46-ae6d-4c91-abe3-45338d3a6c54"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 22:57:26.59	2025-11-10 22:57:26.591233
6bfe8421-66db-4d22-9283-8e6f1db672f6	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1031, "sessionId": "e2928ba6-1369-43b9-90b1-c413b2151d2a"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:02:28.163	2025-11-10 23:02:28.164539
a8797c08-347c-48b6-a879-d6148e0994ca	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1032, "sessionId": "1f17dafe-99bd-4202-91f4-73bb3bbff0ce"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:02:49.821	2025-11-10 23:02:49.822724
fc9f028b-732f-42d4-b855-bc88b0056124	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 15, "sessionId": "34532aa2-82d6-4d1b-8bb0-ac5f6d430316"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:02:54.172	2025-11-10 23:02:54.173933
42d68e16-c258-4fb0-af0c-27df86c19101	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 195, "sessionId": "6547e1a4-c7cf-4761-a52c-43ae2aa038aa"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:04:05.842	2025-11-10 23:04:05.842999
a2f740cb-3b3a-482e-96ae-27a63292780d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 175, "sessionId": "ef9526ea-7396-437a-9efe-d0dfce6a9a2f"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:04:05.842	2025-11-10 23:04:05.842772
5c28ceb7-0326-4e06-9561-fecee3ded6b4	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 52, "sessionId": "8e4117b8-f3f2-458b-b253-8c448ca7a0de"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:05:06.527	2025-11-10 23:05:06.528492
ce806bf2-b17d-4e7a-97e0-c046f8a33c77	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1037, "sessionId": "ca6d54da-853d-4c09-ba61-279459bab27d"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:05:08.884	2025-11-10 23:05:08.885207
29904853-2125-4894-9b86-488b225a5338	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 39, "sessionId": "ce485943-c9e1-4b3f-b2ab-bf91afc04ee2"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:05:32.936	2025-11-10 23:05:32.936737
6de5fa04-02b6-438d-a550-3c717beafb9f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 15, "sessionId": "a176c0dd-f695-42db-948f-2c456e840bc1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:05:50.109	2025-11-10 23:05:50.110376
5df791c2-63a3-4681-82b4-a0070139f1c1	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 19, "sessionId": "1c60b675-ef69-40a8-ac2c-3220aa268788"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:06:01.53	2025-11-10 23:06:01.531426
3cc7ccb9-d4d4-4c56-b44c-7d462068bce0	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 34, "sessionId": "18839c54-65a2-4a83-ab5c-2ecab0e5c0fb"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:14:48.527	2025-11-10 23:14:48.528003
cb5dd285-c41b-4d72-9905-5dd2caba352b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 23, "sessionId": "f446b64d-34c9-4b29-ab32-58b8ec4e74b5"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:16:16.711	2025-11-10 23:16:16.711935
d6ff73ef-0509-436b-b9f7-487dcf6228dd	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 8, "sessionId": "64874cfd-c62d-4e1e-860f-1aea2c226149"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:16:19.917	2025-11-10 23:16:19.918185
ae26e9fc-fb16-4f70-8c69-f4acd2b47449	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1276, "sessionId": "4c79b91e-6ebd-42bd-b75d-02ff20d00dc1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:16:34.683	2025-11-10 23:16:34.684428
f82307bb-5733-4f01-b3ca-01043a9cdb59	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 431, "sessionId": "02288d1a-6189-4323-a322-f0fd12bbc4aa"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:19:58.468	2025-11-10 23:19:58.469376
393140c1-ef08-4bb6-aef4-4bb427507154	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 172, "sessionId": "01e875a1-13fa-4127-b675-a3683278bd40"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:19:58.47	2025-11-10 23:19:58.471033
d46861a7-1867-41d5-bdf0-46f9a7cb3de7	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 43, "sessionId": "f46d3f19-b9f0-4b6f-94fc-233dad3e054f"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:21:02.267	2025-11-10 23:21:02.268816
df341516-b556-4c73-ba97-521a73f6ad0e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 10, "sessionId": "91274d69-2585-47eb-af78-06efc16936db"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:21:02.319	2025-11-10 23:21:02.320046
ad91bfab-9201-4e4c-a79f-72697819b5b1	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 20, "sessionId": "84005aa0-9022-43b6-9c9f-ae43e3fbd8f2"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:21:03.236	2025-11-10 23:21:03.236899
f5263e16-03b7-45fd-b409-4aaadbf22908	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1038, "sessionId": "bfd7216b-61e4-4337-914c-4876c0ee8445"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:21:05.306	2025-11-10 23:21:05.306828
a0a72231-856b-40b3-b1ea-f90debdab5e8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1089, "sessionId": "87e45d18-a731-4734-8ce0-068fa5d2b53b"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:21:12.982	2025-11-10 23:21:12.983194
72af1256-85d4-4fec-8217-09f2d8f980c5	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1204, "sessionId": "d9b7e0f3-0d0a-4568-8aae-c3aa1774ed3f"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:21:32.647	2025-11-10 23:21:32.647823
64afb7cd-24c5-49b3-a7e5-7d954683356b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 34, "sessionId": "026e5215-d368-4a3b-ba55-c3117f746f4b"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:22:26.577	2025-11-10 23:22:26.578594
20a76364-1b63-4096-9a3d-9cb198149304	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 15, "sessionId": "094a6c33-e44b-47a8-ad0c-fe41027a41c9"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:23:19.92	2025-11-10 23:23:19.922236
bcd0dc51-1097-46e6-a51b-f00c3a4a54cf	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1690, "sessionId": "9f2c2828-5e5e-4a59-b1fe-055aefdbf741"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:23:23.395	2025-11-10 23:23:23.396168
9aaeb332-bcea-4593-af8a-84c0429dadf5	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 105, "sessionId": "06dbd7c3-eebc-4bfd-956f-d4b4cda150f1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:23:57.222	2025-11-10 23:23:57.222931
ac001707-9b7a-4725-bb29-dd19b80dce21	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 29, "sessionId": "2798631d-108f-4cb9-afff-6a6885b709b7"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:24:07.033	2025-11-10 23:24:07.034292
9acc2493-cda6-47b0-844c-629a02c5e764	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1178, "sessionId": "bfb5d693-ae67-4913-a5c8-445db468fb5b"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:24:14.646	2025-11-10 23:24:14.64654
9a42b2dc-0e3c-4e30-b1c8-fe7f2b93b7aa	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1186, "sessionId": "a4052385-8196-46e1-919c-13ef3eab91ca"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:24:14.854	2025-11-10 23:24:14.854799
1a3f604a-803f-4d2d-b957-51da9ccb797d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1100, "sessionId": "b4f38f2b-c078-43c2-b868-1f79b81a79a3"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:24:35.276	2025-11-10 23:24:35.276894
aa6fed6b-4f47-44ad-8dd3-43e377e6449c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 4079, "sessionId": "b3cbb845-0658-4d33-a892-c82f05f012dd"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:37:12.015	2025-11-10 23:37:12.0167
61d4b85d-57b2-43b3-9390-4555f3fd4d6d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 21, "sessionId": "5b98a646-7076-4442-b202-785b763cd369"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:38:08.743	2025-11-10 23:38:08.744165
fe3e8335-a3b0-4c54-9bc5-5a5bb888c985	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 8, "sessionId": "5aa2b6a9-4295-47e4-b808-af82120f64d7"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:38:08.873	2025-11-10 23:38:08.87395
c39c3c8f-62fd-49d8-a696-1f6da47ca42b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 24, "sessionId": "72a0085c-77c1-482b-8f81-32cdca32d79a"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:38:09.63	2025-11-10 23:38:09.631276
3caeedad-ee8c-4513-8f6f-21ec1db5eee2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1219, "sessionId": "2983ad60-55cb-461f-903b-2fc7595f608e"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:38:12.889	2025-11-10 23:38:12.890474
b67ad66c-2fce-4e03-862a-beeca5c1f701	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 140, "sessionId": "c4eaac0d-f269-41aa-b4cf-cbaaf63bffda"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:40:55.914	2025-11-10 23:40:55.914915
9b724f6a-5aa1-4497-9036-e924ba6ebe99	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 8, "sessionId": "a20c56af-6769-4029-9a05-5d164b732532"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:41:06.227	2025-11-10 23:41:06.227865
39a52ecd-a2fb-4d87-8dec-92109eb07bf7	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chat", "duration": 9, "sessionId": "3c63dcbb-afcb-459b-b51f-6aa85c0133fc"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:41:08.89	2025-11-10 23:41:08.890757
9bc2ddaf-a76e-42c7-ad17-a0fcd12a361c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1565, "sessionId": "11cc0960-b301-4a9c-9a4b-46ffe3055467"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:41:51.223	2025-11-10 23:41:51.224326
b6f315e2-1118-4cf0-993d-f2b2e1e37028	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1090, "sessionId": "0943f43d-6d97-48f6-8906-5a93f3c003bc"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:41:54.037	2025-11-10 23:41:54.038835
22d1cb67-9279-4698-abeb-d39ffc79756e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 223, "sessionId": "6e575c5c-f804-4c36-aa4e-382baeddf763"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:47:00.451	2025-11-10 23:47:00.452567
a018fa83-cce7-4cd5-9172-5afd5825478b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 238, "sessionId": "8ce33b55-236a-490a-a6c7-7ba004d044f5"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:47:00.454	2025-11-10 23:47:00.4547
5f7972d8-cbda-45d5-aaa5-f608d579cc6f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 16, "sessionId": "78ce1f34-0ccc-447b-a164-f95bd70c8986"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:47:05.934	2025-11-10 23:47:05.935256
71c486b5-5521-4ebf-af16-73f3d5bda59a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 24, "sessionId": "25236c19-5ccd-4e5a-9f88-d60757237b86"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:47:05.936	2025-11-10 23:47:05.937459
04130366-5c45-4d9a-9c1f-eb51fa1fec12	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 9, "sessionId": "19df7833-d49c-4ba7-bc84-3ce530ff3336"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:47:16.055	2025-11-10 23:47:16.056161
cfb41e79-13c3-4bef-9376-1a375612a925	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 7, "sessionId": "55f0a7f5-d4c5-4d1e-bc5e-3f89852a4973"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:47:16.056	2025-11-10 23:47:16.056422
58dfd1a9-8528-477f-ae67-7d8d69c11843	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 10, "sessionId": "8d89b836-2f78-4f3c-90e5-8eadc6ef75f9"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:47:44.981	2025-11-10 23:47:44.981641
38ed49b6-35be-4507-977d-ad652efa8ace	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1024, "sessionId": "ebbc9979-7564-464a-9171-cc723f3d2a84"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:47:47.77	2025-11-10 23:47:47.771108
90b7e0a3-b1aa-4937-9f52-431fbfaecedf	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 8, "sessionId": "044121e4-6c75-4bce-a30a-bfb132bf736e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:48:12.418	2025-11-10 23:48:12.419391
4f27b906-427c-418d-b9de-8cc858957965	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1258, "sessionId": "8c667eca-63e6-475f-8c4d-17ecddb2a996"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:48:15.366	2025-11-10 23:48:15.366482
1457f4f7-76fc-4175-84e9-3eaa8284a785	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 11, "sessionId": "6323b196-4801-4c94-a24b-e91ff2d33970"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:49:31.723	2025-11-10 23:49:31.724031
9e992330-2974-4cd1-878e-d66715349c60	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1072, "sessionId": "5c28e2e9-02c0-4eba-bd28-b0a11383124a"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:49:33.668	2025-11-10 23:49:33.668851
9219f523-27f0-4e7f-b3de-4ca147679e36	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 11, "sessionId": "df184a79-c456-4d3e-844e-1a29fc95e7c4"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:49:39.366	2025-11-10 23:49:39.367001
176be293-6dce-4e5e-a39e-d24f17c59ddc	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 7, "sessionId": "b931eaf4-f1ec-49b0-b18b-60c6367343e8"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:49:40.586	2025-11-10 23:49:40.587729
73ba7dce-e906-4bb8-8e5d-b4897fa45564	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 4, "sessionId": "cdcd8485-102a-48c1-b2fe-e8f6e8b20d04"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-10 23:49:42.427	2025-11-10 23:49:42.427908
53a6e121-c188-4c96-87b1-a012503a90cf	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1272, "sessionId": "c465faeb-cbad-4e3c-b260-3cf9696b502b"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:55:25	2025-11-10 23:55:25.000852
32e300eb-78e2-4142-abf9-a58bd8bd838a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1589, "sessionId": "737878b5-e405-4460-97a1-71815cd68420"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:56:37.873	2025-11-10 23:56:37.874313
156e45a6-4428-4db3-ba63-3d5f379a851e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 19, "sessionId": "9c31d625-1ad5-4a00-8d57-0a54abbcf9a6"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:56:40.963	2025-11-10 23:56:40.964226
017f19e4-7adf-41d0-bd5f-98af41da6070	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 5, "sessionId": "714a7205-c5b6-4e1d-a911-af8407b8695e"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:56:44.126	2025-11-10 23:56:44.126536
0adc5858-2e68-4a1b-b95a-fd361d65a997	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1131, "sessionId": "b1ea7345-d8df-4428-a1e1-fb27e7c69826"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:57:21.159	2025-11-10 23:57:21.160125
4b459b01-673c-44e0-97d2-2b58c0ad545e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 9, "sessionId": "2c181140-dd9f-46e8-9cab-2dcbc68d60fd"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-10 23:57:32.272	2025-11-10 23:57:32.272722
e09f9d17-0ec0-415b-ad3a-d50b74c2152d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1356, "sessionId": "4e368f53-2a5a-4c70-bb20-97f6b0331d3e"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-10 23:57:42.16	2025-11-10 23:57:42.160906
1db94f5c-a299-4177-b49c-1ee3b5014b93	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 1116, "sessionId": "951eb6e2-cbc2-4c98-9aa8-03d291e599d0"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-11 00:04:50.792	2025-11-11 00:04:50.793473
b4ea6ea5-08fa-412b-abee-8b3e67119eb3	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 1097, "sessionId": "26749d4b-3eb1-4493-b336-e1981b18dda9"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-11 00:04:50.796	2025-11-11 00:04:50.797496
40362118-85d8-418e-8c94-38f28879d71d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 10, "sessionId": "2f835245-d442-4a3a-9ce3-e8d2a6d541fb"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:04:57.501	2025-11-11 00:04:57.501898
5a085715-5e18-438d-a384-476838d79aeb	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 19, "sessionId": "e1f15cb1-bd94-4899-be42-788780a282eb"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:04:57.504	2025-11-11 00:04:57.505282
91beadac-b435-4e8e-af7d-9d0ce306509a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 13, "sessionId": "5c6ce013-9e10-4235-9fc7-fb31992a3265"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:05:16.391	2025-11-11 00:05:16.392443
e006ec3d-dd40-4cd6-af3f-9a63f82c74c7	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 16, "sessionId": "0cdbb992-26b0-42ea-a8b3-e686a97df311"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:05:16.399	2025-11-11 00:05:16.399941
fa4af28a-ae41-4c6a-8a58-e01e96e47ba7	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 26, "sessionId": "bfd1b3a7-28f9-4fe2-90a1-34cf975ac287"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:06:36.744	2025-11-11 00:06:36.745564
82b80962-44d1-4012-95ca-0e88db2fb720	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1159, "sessionId": "0149dd82-6d6c-47c8-8fa6-93786af93d6f"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:06:39.534	2025-11-11 00:06:39.536035
24cc40a8-f391-4759-badc-699861d87413	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1032, "sessionId": "11497376-4205-49fb-87a1-85015d7ade07"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:06:59.388	2025-11-11 00:06:59.389257
0884c3e8-6ee7-446a-b701-d359e4e0a684	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1004, "sessionId": "f3afa93c-844e-4492-9e68-2151fb75f684"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:07:07.26	2025-11-11 00:07:07.261413
07939007-92b7-4a2b-bac4-932878e04f5b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chats", "duration": 26, "sessionId": "b046844e-7c3e-4080-bfbf-3afa67dcb186"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:07:12.997	2025-11-11 00:07:12.998511
3c9c918f-0dac-499b-b0a8-b710169f3325	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chats", "duration": 6, "sessionId": "317a7466-789c-4b05-a2aa-c7eaaf7e6a7e"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:07:22.699	2025-11-11 00:07:22.699899
7a4e0e23-cbdb-45fa-beb6-e028989cfb4b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 6, "sessionId": "8ed2ce3e-4b88-4722-85ff-3e31bc95013e"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:07:34.298	2025-11-11 00:07:34.299045
82d4c473-dadf-49a6-abc2-97e8b35243e0	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 28, "sessionId": "baa95f8f-9fe4-4e39-88b6-47127ef31617"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:08:18.192	2025-11-11 00:08:18.193579
024cba6a-d30c-4ae2-b464-a8f573cd63db	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1502, "sessionId": "33a47b7e-4ddc-4e6c-b9cb-87c5d238ded2"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:08:20.962	2025-11-11 00:08:20.9636
69b817d7-b73e-450d-b6d7-44e7f97f2ae8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1025, "sessionId": "b80f2d70-0731-490b-8b4a-c1f4a3e2b5ce"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:08:30.154	2025-11-11 00:08:30.155597
7ccbe99b-855f-4625-87b0-a2853c954dbf	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 8, "sessionId": "dab379c2-3f0a-497f-abd7-19a310e600e1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:08:42.503	2025-11-11 00:08:42.504161
7429db74-50ce-403a-80c6-bb4f295a77e8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1018, "sessionId": "c55c11ba-2a37-421e-8dfd-63f39153fa84"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:08:56.215	2025-11-11 00:08:56.21643
c58f8024-962e-4556-922c-1fdb60a82375	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/dark-mode", "duration": 5, "sessionId": "39919793-fd25-43fc-a85a-6e76c41ab9a1"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:09:01.201	2025-11-11 00:09:01.201706
ed464074-c5ac-412d-a1c1-95280882a688	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1013, "sessionId": "7ef811eb-80fe-436b-a814-9640f86b9c1f"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:10:11.242	2025-11-11 00:10:11.243199
89644221-c8a6-47eb-bd96-b15119d0f9ec	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 373, "sessionId": "f06397c7-1db4-43a8-8647-3df5c7a64f52"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:14:23.872	2025-11-11 00:14:23.873466
6ee7f209-b2c0-47c7-8b8a-703b4c9033e0	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 290, "sessionId": "d5f3cc8e-c263-47f7-9070-a34885220666"}	::ffff:192.168.100.4	okhttp/4.12.0	2025-11-11 00:14:23.878	2025-11-11 00:14:23.879541
e9c66dc6-7b4d-478c-b390-a345166b60d3	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 159, "sessionId": "f1845d66-db83-4c29-b3e9-03abdaa13068"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:37:12.444	2025-11-11 00:37:12.445604
cad84be7-ae5f-46cf-ba2a-81b7f7aec0f4	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 267, "sessionId": "56e44eab-8440-4a55-adcd-02de32a447aa"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:37:12.456	2025-11-11 00:37:12.457035
0772b465-ef10-4dd5-952c-6273815ddab8	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 202, "sessionId": "42ba0143-35fd-4f0f-b12a-31a10055ed55"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-11 00:51:00.326	2025-11-11 00:51:00.326927
e89ec4e3-4f68-4144-b60d-9cfb101c1a7a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 165, "sessionId": "fc0cdcd5-abc6-40a6-ab85-7d86d23572e0"}	::ffff:192.168.100.29	okhttp/4.12.0	2025-11-11 00:51:00.328	2025-11-11 00:51:00.328954
574256ca-28ba-4cc8-8e60-e0259f378c7d	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 21, "sessionId": "311a4363-3463-47b0-abd9-71a11a5f9ca7"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:05.238	2025-11-11 00:51:05.23892
f07ef3e0-7251-4742-ac13-db5add8e699e	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 37, "sessionId": "34907ad5-f5db-4d9b-a57f-8f61a5aaae80"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:05.245	2025-11-11 00:51:05.24617
a1124448-3757-4776-85cb-8b0735b20b6c	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 45, "sessionId": "304499df-2eff-4c7a-bbf8-f653181f92c1"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:24.961	2025-11-11 00:51:24.96274
0b45b39a-f020-4d9f-9579-af307ba25c35	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1075, "sessionId": "9a13d1cb-1100-4deb-a35c-665825b6fe78"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:27.728	2025-11-11 00:51:27.728476
efac73b8-87c8-4863-9b67-7efdb69f35b9	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1031, "sessionId": "37148725-17da-47a6-85e3-dac6bb2cf68c"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:43.974	2025-11-11 00:51:43.97503
4788573f-9aa3-4851-a44d-47ed168a20dc	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1113, "sessionId": "7c5599e8-168a-456c-89c5-9112d2188adc"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:52.304	2025-11-11 00:51:52.305257
bf5e1161-ba4e-4c3d-b874-24acde5461fe	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 19, "sessionId": "bab3a3e7-b7eb-4788-8560-977eba269b75"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:51:55.55	2025-11-11 00:51:55.550874
c793e1e0-5d43-4dd0-9372-74448be148c1	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 15, "sessionId": "4fb99ee8-a033-4fd4-891b-33c30cb6a681"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:52:06.624	2025-11-11 00:52:06.625063
51ef841d-20e3-49be-9b04-863d050157d2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 12, "sessionId": "d4eb794f-ec73-4257-ac88-c9384d0e3f3f"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:52:06.626	2025-11-11 00:52:06.62678
eac2b567-646a-41c9-b8cc-d420d6b01061	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 18, "sessionId": "7105ac3f-6bbb-4a5d-8871-81dbb5431eb6"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:54:01.759	2025-11-11 00:54:01.760186
11337b44-081e-4a78-977a-920ca272c5fa	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1073, "sessionId": "c8ea8048-2b41-4ef2-9555-68d1924d4029"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:54:04.201	2025-11-11 00:54:04.202638
b222acf1-bdf5-4ad6-a00c-588109c28a16	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1067, "sessionId": "1bbfc865-31e5-40b9-bdac-7e703e4f25ac"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:54:22.634	2025-11-11 00:54:22.635095
cd4666ae-f735-4e7c-8736-028131845fec	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 179, "sessionId": "1dc970a5-4107-422c-9a8b-443b23090db3"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:55:32.498	2025-11-11 00:55:32.499094
7670c88f-50ee-4640-8385-7b54fbda73dc	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 180, "sessionId": "5264543a-fcce-41e0-8a4d-57a3351aaabf"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:55:32.506	2025-11-11 00:55:32.507413
6f025713-a5ec-4cdd-85d7-3947c6ea3012	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 28, "sessionId": "a3ece592-1522-446c-956b-8f46758513a2"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:55:42.445	2025-11-11 00:55:42.445657
884cf6cd-b63a-4549-a83b-ece63a23c8d2	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1037, "sessionId": "b9ead768-794f-436d-bd33-675bbd7dca9a"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:55:44.82	2025-11-11 00:55:44.821276
0c586894-bb17-48fd-8233-3b4826980c1b	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/chats", "duration": 27, "sessionId": "235fd725-85e4-4618-9e0e-0765661e8c46"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:55:53.905	2025-11-11 00:55:53.906613
f7a2772a-9c71-4935-b2fa-bd29b9b41836	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1171, "sessionId": "2ef7c0b8-f6c5-457c-b5b9-9781a9d3c19e"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:56:25.461	2025-11-11 00:56:25.462523
f61f29c6-0a60-4679-96d9-d02a33425cee	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/store/items", "duration": 24, "sessionId": "9633cb85-e091-416a-8dce-cd5a1e086598"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:58:50.487	2025-11-11 00:58:50.487946
991ee92d-71ea-45c6-b599-2cffbb7f862a	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/themes/users/theme", "duration": 98, "sessionId": "d7b74423-8775-4e37-95c3-17ce478af56b"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:58:50.569	2025-11-11 00:58:50.569713
f4c8a708-e9bb-47f4-bb19-e5a46e4b622f	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/device-tokens/register", "duration": 37, "sessionId": "017c1b75-c6ea-4e74-b988-665d4a9943f7"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:58:50.771	2025-11-11 00:58:50.772321
0449cbf8-b97c-4b0c-9614-4ffc382e6319	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1041, "sessionId": "45ccd559-c0fa-47d2-a466-cd2f0a612f3c"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:58:53.449	2025-11-11 00:58:53.450384
4eecd2e2-f095-40bd-bd1b-c1b21a914782	982fd39c-bee6-4033-8da9-15c89169343b	page_view	{"page": "/api/v1/posts/feed?page=1&limit=20", "duration": 1026, "sessionId": "3b8cea9f-a086-4449-954b-362c6bcf049d"}	::ffff:192.168.100.32	okhttp/4.12.0	2025-11-11 00:59:02.969	2025-11-11 00:59:02.970308
\.


--
-- TOC entry 5614 (class 0 OID 33761)
-- Dependencies: 224
-- Data for Name: user_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_scores (id, user_id, weekly_score, monthly_score, all_time_score, total_likes_received, total_comments_received, total_shares_received, total_sales, total_features, last_weekly_reset, last_monthly_reset, updated_at) FROM stdin;
0f564951-4aaa-4664-bad7-767a919f6456	8f952bb1-9ff6-4477-93ea-4972efcc383b	315	771	4048	59	110	35	16	9	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348
73200f54-41d1-44aa-9e04-af0666ac49df	413719c0-2a04-445d-ba47-0f3a88d40471	124	2382	5017	226	101	58	7	5	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348
527b7497-36ba-408b-bb3d-f68bbab4c0f4	44393f55-fc53-4050-a244-6fc49bc9e2db	560	1770	5631	125	87	33	17	2	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348
70d8a7b1-cd46-47bd-83ea-9b3541ff6d1e	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	382	1480	1303	82	104	38	22	8	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348
edf1ef63-9a4e-48c3-b59a-649d7cb26f9f	da43914e-1f27-42b0-8070-3d222212a043	591	2095	3637	53	76	36	17	5	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348
56837032-7c80-4fe2-ad05-f66cf23159a3	57a82d0a-cd78-427e-baaf-afb253178536	319	2498	5934	194	78	13	23	8	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348	2025-11-11 00:24:09.349348
\.


--
-- TOC entry 5633 (class 0 OID 34120)
-- Dependencies: 243
-- Data for Name: user_trust_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_trust_scores (id, user_id, trust_score, total_posts, flagged_posts, total_comments, flagged_comments, total_messages, flagged_messages, violations_count, last_violation_date, account_age_days, is_verified, created_at, updated_at) FROM stdin;
1	8f952bb1-9ff6-4477-93ea-4972efcc383b	85	0	0	0	0	0	0	0	\N	30	t	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
2	413719c0-2a04-445d-ba47-0f3a88d40471	81	0	0	0	0	0	0	0	\N	340	t	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
3	44393f55-fc53-4050-a244-6fc49bc9e2db	97	0	0	0	0	0	0	0	\N	159	t	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
4	bb0b50c8-4dd1-4c51-aac3-828e01f7c570	77	0	0	0	0	0	0	0	\N	296	t	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
5	da43914e-1f27-42b0-8070-3d222212a043	91	0	0	0	0	0	0	0	\N	340	t	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
6	57a82d0a-cd78-427e-baaf-afb253178536	73	0	0	0	0	0	0	0	\N	292	t	2025-11-11 00:18:01.02737	2025-11-11 00:18:01.02737
\.


--
-- TOC entry 5607 (class 0 OID 33589)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, phone, password_hash, first_name, last_name, avatar_url, bio, faculty, university, student_id, location, website, email_verified, phone_verified, is_private, show_activity, read_receipts, allow_downloads, allow_story_sharing, followers_count, following_count, posts_count, subscription_tier, subscription_expires_at, trial_started_at, created_at, updated_at, last_login_at, deleted_at, theme_preference, dark_mode_preference, sms_two_factor_enabled) FROM stdin;
da43914e-1f27-42b0-8070-3d222212a043	mock_u5	u5@raved.test	+233275619848	$2a$12$RfR9xt5WaM/7jafhHv9Cz.Q.o1xsa2eL8N5SOGCFhbpP1k9hhY/Tq	David	Chen	https://i.imgur.com/kMB0Upu.jpg	Student at Engineering faculty	Engineering	\N	\N	\N	\N	t	t	f	t	t	f	t	5	5	34	free	\N	2025-11-11 00:18:01.02737	2025-01-21 02:20:30.964	2025-11-11 00:27:02.198419	\N	\N	default	f	f
57a82d0a-cd78-427e-baaf-afb253178536	mock_u6	u6@raved.test	+233212982971	$2a$12$oRJW35QmJYWF43WPYUIPNeC.HP91/EUpR8JyfCovg9cLa6so5GAYy	Jason	Miller	https://i.imgur.com/8Km9tLL.jpg	Student at Law faculty	Law	\N	\N	\N	\N	t	t	f	t	t	f	t	5	5	26	free	\N	2025-11-11 00:18:01.02737	2025-10-23 14:42:05.72	2025-11-11 00:27:02.198419	\N	\N	default	f	f
8f952bb1-9ff6-4477-93ea-4972efcc383b	mock_u1	u1@raved.test	+233993365130	$2a$12$qcrrkMnQPKGwADvwH/y2V.AmYX9I2fmPd5GJXM3i.MESDO3obWfga	Sophie	Parker	https://i.imgur.com/bxfE9TV.jpg	Student at Science faculty	Science	\N	\N	\N	\N	t	t	f	t	t	f	t	5	5	47	free	\N	2025-11-11 00:18:01.02737	2025-02-08 14:25:55.034	2025-11-11 00:27:02.198419	\N	\N	default	f	f
413719c0-2a04-445d-ba47-0f3a88d40471	mock_u2	u2@raved.test	+233548418710	$2a$12$0gAsL9cO7g0pVIOlPm8hFOfDcoB8yFI8uQ1tnPUSGwbJXd3fYEYTu	Emily	White	https://i.imgur.com/nV6fsQh.jpg	Student at Arts faculty	Arts	\N	\N	\N	\N	t	t	f	t	t	f	t	5	5	25	free	\N	2025-11-11 00:18:01.02737	2025-09-20 09:48:37.893	2025-11-11 00:27:02.198419	\N	\N	default	f	f
44393f55-fc53-4050-a244-6fc49bc9e2db	mock_u3	u3@raved.test	+233276956612	$2a$12$Bl199pQ/crIw8GKB4NqBB.KijoniXBEg3g29i73CxX8e9ozaW7Qry	Marcus	Stevens	https://i.imgur.com/IigY4Hm.jpg	Student at Business faculty	Business	\N	\N	\N	\N	t	t	f	t	t	f	t	5	5	9	free	\N	2025-11-11 00:18:01.02737	2025-05-15 00:16:21.49	2025-11-11 00:27:02.198419	\N	\N	default	f	f
bb0b50c8-4dd1-4c51-aac3-828e01f7c570	mock_u4	u4@raved.test	+233225380563	$2a$12$pN7CdbzyjorMMpi6uyaCMOGND5AP7EU78wFVGreZ0bv92yWt2w3kW	Anna	Reynolds	https://i.imgur.com/KnZQY6W.jpg	Student at Medicine faculty	Medicine	\N	\N	\N	\N	t	t	f	t	t	f	t	5	5	52	free	\N	2025-11-11 00:18:01.02737	2025-02-18 11:34:38.17	2025-11-11 00:27:02.198419	\N	\N	default	f	f
982fd39c-bee6-4033-8da9-15c89169343b	admin	admin@raved.app	\N	$2a$12$m2MyeWqpLFulGfCiLQR5lOLfBUPIIkqOcLiC2y8TO6K5bQEfKp1sy	Admin	User	\N	\N	\N	\N	\N	\N	\N	t	f	f	t	t	t	t	0	0	0	admin	\N	2025-11-10 18:38:43.092489	2025-11-10 18:38:43.092489	2025-11-11 00:09:01.19748	2025-11-11 00:58:50.214707	\N	default	t	f
\.


--
-- TOC entry 5670 (class 0 OID 0)
-- Dependencies: 257
-- Name: deep_link_clicks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deep_link_clicks_id_seq', 1, false);


--
-- TOC entry 5671 (class 0 OID 0)
-- Dependencies: 255
-- Name: deep_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deep_links_id_seq', 1, false);


--
-- TOC entry 5672 (class 0 OID 0)
-- Dependencies: 249
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);


--
-- TOC entry 5673 (class 0 OID 0)
-- Dependencies: 251
-- Name: share_analytics_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.share_analytics_events_id_seq', 1, false);


--
-- TOC entry 5674 (class 0 OID 0)
-- Dependencies: 247
-- Name: share_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.share_analytics_id_seq', 1, false);


--
-- TOC entry 5675 (class 0 OID 0)
-- Dependencies: 253
-- Name: share_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.share_templates_id_seq', 1, false);


--
-- TOC entry 5676 (class 0 OID 0)
-- Dependencies: 245
-- Name: shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shares_id_seq', 1, false);


--
-- TOC entry 5677 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_trust_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_trust_scores_id_seq', 6, true);


--
-- TOC entry 5294 (class 2606 OID 34104)
-- Name: ab_test_results ab_test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_test_results
    ADD CONSTRAINT ab_test_results_pkey PRIMARY KEY (id);


--
-- TOC entry 5289 (class 2606 OID 34088)
-- Name: ab_test_variants ab_test_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_test_variants
    ADD CONSTRAINT ab_test_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5291 (class 2606 OID 34090)
-- Name: ab_test_variants ab_test_variants_test_id_variant_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_test_variants
    ADD CONSTRAINT ab_test_variants_test_id_variant_name_key UNIQUE (test_id, variant_name);


--
-- TOC entry 5282 (class 2606 OID 34073)
-- Name: ab_tests ab_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_tests
    ADD CONSTRAINT ab_tests_pkey PRIMARY KEY (id);


--
-- TOC entry 5284 (class 2606 OID 34075)
-- Name: ab_tests ab_tests_test_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_tests
    ADD CONSTRAINT ab_tests_test_name_key UNIQUE (test_name);


--
-- TOC entry 5261 (class 2606 OID 34003)
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5268 (class 2606 OID 34025)
-- Name: analytics_metrics analytics_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_metrics
    ADD CONSTRAINT analytics_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 5273 (class 2606 OID 34040)
-- Name: analytics_reports analytics_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_reports
    ADD CONSTRAINT analytics_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5207 (class 2606 OID 33827)
-- Name: blocked_users blocked_users_blocker_id_blocked_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id);


--
-- TOC entry 5209 (class 2606 OID 33825)
-- Name: blocked_users blocked_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5213 (class 2606 OID 33848)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 33850)
-- Name: cart_items cart_items_user_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_item_id_key UNIQUE (user_id, item_id);


--
-- TOC entry 5390 (class 2606 OID 34495)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5149 (class 2606 OID 33629)
-- Name: connections connections_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- TOC entry 5151 (class 2606 OID 33627)
-- Name: connections connections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_pkey PRIMARY KEY (id);


--
-- TOC entry 5366 (class 2606 OID 34402)
-- Name: conversations conversations_participant1_id_participant2_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant1_id_participant2_id_key UNIQUE (participant1_id, participant2_id);


--
-- TOC entry 5368 (class 2606 OID 34400)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5351 (class 2606 OID 34301)
-- Name: deep_link_clicks deep_link_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deep_link_clicks
    ADD CONSTRAINT deep_link_clicks_pkey PRIMARY KEY (id);


--
-- TOC entry 5343 (class 2606 OID 34285)
-- Name: deep_links deep_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deep_links
    ADD CONSTRAINT deep_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5345 (class 2606 OID 34287)
-- Name: deep_links deep_links_short_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deep_links
    ADD CONSTRAINT deep_links_short_code_key UNIQUE (short_code);


--
-- TOC entry 5223 (class 2606 OID 33895)
-- Name: device_tokens device_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5225 (class 2606 OID 33897)
-- Name: device_tokens device_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_token_key UNIQUE (token);


--
-- TOC entry 5227 (class 2606 OID 33899)
-- Name: device_tokens device_tokens_user_id_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_user_id_token_key UNIQUE (user_id, token);


--
-- TOC entry 5234 (class 2606 OID 33934)
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5236 (class 2606 OID 33936)
-- Name: email_verification_tokens email_verification_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_key UNIQUE (token);


--
-- TOC entry 5238 (class 2606 OID 33938)
-- Name: email_verification_tokens email_verification_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 5165 (class 2606 OID 33675)
-- Name: event_attendees event_attendees_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- TOC entry 5167 (class 2606 OID 33673)
-- Name: event_attendees event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (id);


--
-- TOC entry 5158 (class 2606 OID 33658)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5399 (class 2606 OID 34522)
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- TOC entry 5401 (class 2606 OID 34526)
-- Name: likes likes_user_id_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_comment_id_key UNIQUE (user_id, comment_id);


--
-- TOC entry 5403 (class 2606 OID 34524)
-- Name: likes likes_user_id_post_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_post_id_key UNIQUE (user_id, post_id);


--
-- TOC entry 5381 (class 2606 OID 34427)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5232 (class 2606 OID 33922)
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5259 (class 2606 OID 33978)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5364 (class 2606 OID 34360)
-- Name: offline_data offline_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_data
    ADD CONSTRAINT offline_data_pkey PRIMARY KEY (id);


--
-- TOC entry 5358 (class 2606 OID 34320)
-- Name: offline_queues offline_queues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_queues
    ADD CONSTRAINT offline_queues_pkey PRIMARY KEY (id);


--
-- TOC entry 5181 (class 2606 OID 33725)
-- Name: orders orders_payment_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_reference_key UNIQUE (payment_reference);


--
-- TOC entry 5183 (class 2606 OID 33723)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5246 (class 2606 OID 33954)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5248 (class 2606 OID 33956)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 5250 (class 2606 OID 33958)
-- Name: password_reset_tokens password_reset_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_key UNIQUE (user_id);


--
-- TOC entry 5388 (class 2606 OID 34473)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5199 (class 2606 OID 33793)
-- Name: ranking_history ranking_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_history
    ADD CONSTRAINT ranking_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5201 (class 2606 OID 33795)
-- Name: ranking_history ranking_history_user_id_ranking_period_ranking_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_history
    ADD CONSTRAINT ranking_history_user_id_ranking_period_ranking_type_key UNIQUE (user_id, ranking_period, ranking_type);


--
-- TOC entry 5205 (class 2606 OID 33809)
-- Name: ranking_prizes ranking_prizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_prizes
    ADD CONSTRAINT ranking_prizes_pkey PRIMARY KEY (id);


--
-- TOC entry 5326 (class 2606 OID 34212)
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- TOC entry 5328 (class 2606 OID 34214)
-- Name: referrals referrals_referrer_id_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_referred_id_key UNIQUE (referrer_id, referred_id);


--
-- TOC entry 5219 (class 2606 OID 33868)
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5221 (class 2606 OID 33870)
-- Name: saved_items saved_items_user_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_item_id_key UNIQUE (user_id, item_id);


--
-- TOC entry 5334 (class 2606 OID 34239)
-- Name: share_analytics_events share_analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics_events
    ADD CONSTRAINT share_analytics_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5321 (class 2606 OID 34197)
-- Name: share_analytics share_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics
    ADD CONSTRAINT share_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 5339 (class 2606 OID 34268)
-- Name: share_templates share_templates_content_type_platform_is_default_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_templates
    ADD CONSTRAINT share_templates_content_type_platform_is_default_key UNIQUE (content_type, platform, is_default);


--
-- TOC entry 5341 (class 2606 OID 34266)
-- Name: share_templates share_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_templates
    ADD CONSTRAINT share_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5317 (class 2606 OID 34177)
-- Name: shares shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_pkey PRIMARY KEY (id);


--
-- TOC entry 5176 (class 2606 OID 33702)
-- Name: store_items store_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_items
    ADD CONSTRAINT store_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5408 (class 2606 OID 34557)
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- TOC entry 5308 (class 2606 OID 34154)
-- Name: story_views story_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_pkey PRIMARY KEY (id);


--
-- TOC entry 5310 (class 2606 OID 34156)
-- Name: story_views story_views_story_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_story_id_user_id_key UNIQUE (story_id, user_id);


--
-- TOC entry 5187 (class 2606 OID 33753)
-- Name: subscriptions subscriptions_payment_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_payment_reference_key UNIQUE (payment_reference);


--
-- TOC entry 5189 (class 2606 OID 33751)
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5280 (class 2606 OID 34053)
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5193 (class 2606 OID 33777)
-- Name: user_scores user_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT user_scores_pkey PRIMARY KEY (id);


--
-- TOC entry 5195 (class 2606 OID 33779)
-- Name: user_scores user_scores_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT user_scores_user_id_key UNIQUE (user_id);


--
-- TOC entry 5302 (class 2606 OID 34138)
-- Name: user_trust_scores user_trust_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_trust_scores
    ADD CONSTRAINT user_trust_scores_pkey PRIMARY KEY (id);


--
-- TOC entry 5304 (class 2606 OID 34140)
-- Name: user_trust_scores user_trust_scores_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_trust_scores
    ADD CONSTRAINT user_trust_scores_user_id_key UNIQUE (user_id);


--
-- TOC entry 5141 (class 2606 OID 33614)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5143 (class 2606 OID 33616)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 5145 (class 2606 OID 33610)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5147 (class 2606 OID 33612)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5295 (class 1259 OID 34115)
-- Name: idx_ab_test_results_test; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_test_results_test ON public.ab_test_results USING btree (test_id);


--
-- TOC entry 5296 (class 1259 OID 34118)
-- Name: idx_ab_test_results_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_test_results_timestamp ON public.ab_test_results USING btree ("timestamp" DESC);


--
-- TOC entry 5297 (class 1259 OID 34116)
-- Name: idx_ab_test_results_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_test_results_user ON public.ab_test_results USING btree (user_id);


--
-- TOC entry 5298 (class 1259 OID 34117)
-- Name: idx_ab_test_results_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_test_results_variant ON public.ab_test_results USING btree (variant_name);


--
-- TOC entry 5292 (class 1259 OID 34096)
-- Name: idx_ab_test_variants_test; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_test_variants_test ON public.ab_test_variants USING btree (test_id);


--
-- TOC entry 5285 (class 1259 OID 34078)
-- Name: idx_ab_tests_feature; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_tests_feature ON public.ab_tests USING btree (feature_name);


--
-- TOC entry 5286 (class 1259 OID 34076)
-- Name: idx_ab_tests_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_tests_name ON public.ab_tests USING btree (test_name);


--
-- TOC entry 5287 (class 1259 OID 34077)
-- Name: idx_ab_tests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ab_tests_status ON public.ab_tests USING btree (status);


--
-- TOC entry 5262 (class 1259 OID 34012)
-- Name: idx_analytics_events_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_category ON public.analytics_events USING btree (event_category);


--
-- TOC entry 5263 (class 1259 OID 34010)
-- Name: idx_analytics_events_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_session ON public.analytics_events USING btree (session_id);


--
-- TOC entry 5264 (class 1259 OID 34013)
-- Name: idx_analytics_events_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events USING btree ("timestamp" DESC);


--
-- TOC entry 5265 (class 1259 OID 34011)
-- Name: idx_analytics_events_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_type ON public.analytics_events USING btree (event_type);


--
-- TOC entry 5266 (class 1259 OID 34009)
-- Name: idx_analytics_events_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_user ON public.analytics_events USING btree (user_id);


--
-- TOC entry 5269 (class 1259 OID 34026)
-- Name: idx_analytics_metrics_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_metrics_name ON public.analytics_metrics USING btree (metric_name);


--
-- TOC entry 5270 (class 1259 OID 34028)
-- Name: idx_analytics_metrics_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_metrics_timestamp ON public.analytics_metrics USING btree ("timestamp" DESC);


--
-- TOC entry 5271 (class 1259 OID 34027)
-- Name: idx_analytics_metrics_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_metrics_type ON public.analytics_metrics USING btree (metric_type);


--
-- TOC entry 5274 (class 1259 OID 34042)
-- Name: idx_analytics_reports_generated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_reports_generated ON public.analytics_reports USING btree (generated_at DESC);


--
-- TOC entry 5275 (class 1259 OID 34041)
-- Name: idx_analytics_reports_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_reports_type ON public.analytics_reports USING btree (report_type);


--
-- TOC entry 5210 (class 1259 OID 33839)
-- Name: idx_blocked_users_blocked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blocked_users_blocked ON public.blocked_users USING btree (blocked_id);


--
-- TOC entry 5211 (class 1259 OID 33838)
-- Name: idx_blocked_users_blocker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blocked_users_blocker ON public.blocked_users USING btree (blocker_id);


--
-- TOC entry 5216 (class 1259 OID 33861)
-- Name: idx_cart_items_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_user ON public.cart_items USING btree (user_id);


--
-- TOC entry 5391 (class 1259 OID 34514)
-- Name: idx_comments_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_created ON public.comments USING btree (created_at DESC);


--
-- TOC entry 5392 (class 1259 OID 34513)
-- Name: idx_comments_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_parent ON public.comments USING btree (parent_id);


--
-- TOC entry 5393 (class 1259 OID 34511)
-- Name: idx_comments_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_post ON public.comments USING btree (post_id);


--
-- TOC entry 5394 (class 1259 OID 34512)
-- Name: idx_comments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_user ON public.comments USING btree (user_id);


--
-- TOC entry 5152 (class 1259 OID 33640)
-- Name: idx_connections_follower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_connections_follower ON public.connections USING btree (follower_id);


--
-- TOC entry 5153 (class 1259 OID 34372)
-- Name: idx_connections_follower_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_connections_follower_id ON public.connections USING btree (follower_id);


--
-- TOC entry 5154 (class 1259 OID 33641)
-- Name: idx_connections_following; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_connections_following ON public.connections USING btree (following_id);


--
-- TOC entry 5155 (class 1259 OID 34373)
-- Name: idx_connections_following_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_connections_following_id ON public.connections USING btree (following_id);


--
-- TOC entry 5156 (class 1259 OID 34374)
-- Name: idx_connections_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_connections_status ON public.connections USING btree (status);


--
-- TOC entry 5369 (class 1259 OID 34416)
-- Name: idx_conversations_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_deleted ON public.conversations USING btree (deleted_at);


--
-- TOC entry 5370 (class 1259 OID 34415)
-- Name: idx_conversations_last_message; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_last_message ON public.conversations USING btree (last_message_at DESC);


--
-- TOC entry 5371 (class 1259 OID 34413)
-- Name: idx_conversations_participant1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_participant1 ON public.conversations USING btree (participant1_id);


--
-- TOC entry 5372 (class 1259 OID 34414)
-- Name: idx_conversations_participant2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_participant2 ON public.conversations USING btree (participant2_id);


--
-- TOC entry 5352 (class 1259 OID 34307)
-- Name: idx_deep_link_clicks_link; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deep_link_clicks_link ON public.deep_link_clicks USING btree (deep_link_id);


--
-- TOC entry 5353 (class 1259 OID 34308)
-- Name: idx_deep_link_clicks_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deep_link_clicks_time ON public.deep_link_clicks USING btree (clicked_at DESC);


--
-- TOC entry 5346 (class 1259 OID 34291)
-- Name: idx_deep_links_clicks; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deep_links_clicks ON public.deep_links USING btree (click_count DESC);


--
-- TOC entry 5347 (class 1259 OID 34288)
-- Name: idx_deep_links_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deep_links_content ON public.deep_links USING btree (content_type, content_id);


--
-- TOC entry 5348 (class 1259 OID 34290)
-- Name: idx_deep_links_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deep_links_expires ON public.deep_links USING btree (expires_at);


--
-- TOC entry 5349 (class 1259 OID 34289)
-- Name: idx_deep_links_short_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deep_links_short_code ON public.deep_links USING btree (short_code);


--
-- TOC entry 5228 (class 1259 OID 33906)
-- Name: idx_device_tokens_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_tokens_active ON public.device_tokens USING btree (active);


--
-- TOC entry 5229 (class 1259 OID 33907)
-- Name: idx_device_tokens_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_tokens_platform ON public.device_tokens USING btree (platform);


--
-- TOC entry 5230 (class 1259 OID 33905)
-- Name: idx_device_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_tokens_user ON public.device_tokens USING btree (user_id);


--
-- TOC entry 5239 (class 1259 OID 33946)
-- Name: idx_email_verification_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_verification_tokens_expires ON public.email_verification_tokens USING btree (expires_at);


--
-- TOC entry 5240 (class 1259 OID 33945)
-- Name: idx_email_verification_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens USING btree (token);


--
-- TOC entry 5241 (class 1259 OID 33944)
-- Name: idx_email_verification_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_verification_tokens_user ON public.email_verification_tokens USING btree (user_id);


--
-- TOC entry 5168 (class 1259 OID 33686)
-- Name: idx_event_attendees_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_attendees_event ON public.event_attendees USING btree (event_id);


--
-- TOC entry 5169 (class 1259 OID 33687)
-- Name: idx_event_attendees_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_attendees_user ON public.event_attendees USING btree (user_id);


--
-- TOC entry 5159 (class 1259 OID 34379)
-- Name: idx_events_audience; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_audience ON public.events USING btree (audience);


--
-- TOC entry 5160 (class 1259 OID 33665)
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- TOC entry 5161 (class 1259 OID 33664)
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- TOC entry 5162 (class 1259 OID 34378)
-- Name: idx_events_event_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_event_date ON public.events USING btree (event_date);


--
-- TOC entry 5163 (class 1259 OID 34377)
-- Name: idx_events_organizer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_organizer_id ON public.events USING btree (organizer_id);


--
-- TOC entry 5395 (class 1259 OID 34544)
-- Name: idx_likes_comment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_comment ON public.likes USING btree (comment_id);


--
-- TOC entry 5396 (class 1259 OID 34543)
-- Name: idx_likes_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_post ON public.likes USING btree (post_id);


--
-- TOC entry 5397 (class 1259 OID 34542)
-- Name: idx_likes_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_user ON public.likes USING btree (user_id);


--
-- TOC entry 5373 (class 1259 OID 34438)
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- TOC entry 5374 (class 1259 OID 34449)
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- TOC entry 5375 (class 1259 OID 34440)
-- Name: idx_messages_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created ON public.messages USING btree (created_at DESC);


--
-- TOC entry 5376 (class 1259 OID 34450)
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);


--
-- TOC entry 5377 (class 1259 OID 34441)
-- Name: idx_messages_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_deleted ON public.messages USING btree (deleted_at);


--
-- TOC entry 5378 (class 1259 OID 34439)
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- TOC entry 5379 (class 1259 OID 34448)
-- Name: idx_messages_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);


--
-- TOC entry 5251 (class 1259 OID 33991)
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- TOC entry 5252 (class 1259 OID 34382)
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- TOC entry 5253 (class 1259 OID 34381)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- TOC entry 5254 (class 1259 OID 33990)
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- TOC entry 5255 (class 1259 OID 33992)
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- TOC entry 5256 (class 1259 OID 33989)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 5257 (class 1259 OID 34380)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 5359 (class 1259 OID 34367)
-- Name: idx_offline_data_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_data_resource ON public.offline_data USING btree (resource_type, resource_id);


--
-- TOC entry 5360 (class 1259 OID 34369)
-- Name: idx_offline_data_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_data_status ON public.offline_data USING btree (sync_status);


--
-- TOC entry 5361 (class 1259 OID 34368)
-- Name: idx_offline_data_synced; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_data_synced ON public.offline_data USING btree (last_synced_at);


--
-- TOC entry 5362 (class 1259 OID 34366)
-- Name: idx_offline_data_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_data_user ON public.offline_data USING btree (user_id);


--
-- TOC entry 5354 (class 1259 OID 34328)
-- Name: idx_offline_queues_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_queues_created ON public.offline_queues USING btree (created_at);


--
-- TOC entry 5355 (class 1259 OID 34327)
-- Name: idx_offline_queues_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_queues_status ON public.offline_queues USING btree (status);


--
-- TOC entry 5356 (class 1259 OID 34326)
-- Name: idx_offline_queues_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_queues_user ON public.offline_queues USING btree (user_id);


--
-- TOC entry 5177 (class 1259 OID 33741)
-- Name: idx_orders_buyer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_buyer ON public.orders USING btree (buyer_id);


--
-- TOC entry 5178 (class 1259 OID 33742)
-- Name: idx_orders_seller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_seller ON public.orders USING btree (seller_id);


--
-- TOC entry 5179 (class 1259 OID 33743)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 5242 (class 1259 OID 33966)
-- Name: idx_password_reset_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- TOC entry 5243 (class 1259 OID 33965)
-- Name: idx_password_reset_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- TOC entry 5244 (class 1259 OID 33964)
-- Name: idx_password_reset_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_user ON public.password_reset_tokens USING btree (user_id);


--
-- TOC entry 5382 (class 1259 OID 34482)
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);


--
-- TOC entry 5383 (class 1259 OID 34481)
-- Name: idx_posts_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_faculty ON public.posts USING btree (faculty);


--
-- TOC entry 5384 (class 1259 OID 34483)
-- Name: idx_posts_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_is_featured ON public.posts USING btree (is_featured, created_at DESC);


--
-- TOC entry 5385 (class 1259 OID 34479)
-- Name: idx_posts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);


--
-- TOC entry 5386 (class 1259 OID 34480)
-- Name: idx_posts_visibility; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_visibility ON public.posts USING btree (visibility);


--
-- TOC entry 5196 (class 1259 OID 33802)
-- Name: idx_ranking_history_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ranking_history_period ON public.ranking_history USING btree (ranking_period);


--
-- TOC entry 5197 (class 1259 OID 33801)
-- Name: idx_ranking_history_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ranking_history_user ON public.ranking_history USING btree (user_id);


--
-- TOC entry 5202 (class 1259 OID 33816)
-- Name: idx_ranking_prizes_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ranking_prizes_period ON public.ranking_prizes USING btree (ranking_period);


--
-- TOC entry 5203 (class 1259 OID 33815)
-- Name: idx_ranking_prizes_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ranking_prizes_user ON public.ranking_prizes USING btree (user_id);


--
-- TOC entry 5322 (class 1259 OID 34227)
-- Name: idx_referrals_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referrals_code ON public.referrals USING btree (referral_code);


--
-- TOC entry 5323 (class 1259 OID 34226)
-- Name: idx_referrals_referred; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referrals_referred ON public.referrals USING btree (referred_id);


--
-- TOC entry 5324 (class 1259 OID 34225)
-- Name: idx_referrals_referrer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referrals_referrer ON public.referrals USING btree (referrer_id);


--
-- TOC entry 5217 (class 1259 OID 33881)
-- Name: idx_saved_items_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_items_user ON public.saved_items USING btree (user_id);


--
-- TOC entry 5318 (class 1259 OID 34204)
-- Name: idx_share_analytics_clicked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_analytics_clicked ON public.share_analytics USING btree (clicked_at);


--
-- TOC entry 5329 (class 1259 OID 34253)
-- Name: idx_share_analytics_events_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_analytics_events_created ON public.share_analytics_events USING btree (created_at);


--
-- TOC entry 5330 (class 1259 OID 34250)
-- Name: idx_share_analytics_events_share; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_analytics_events_share ON public.share_analytics_events USING btree (share_id);


--
-- TOC entry 5331 (class 1259 OID 34251)
-- Name: idx_share_analytics_events_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_analytics_events_type ON public.share_analytics_events USING btree (event_type);


--
-- TOC entry 5332 (class 1259 OID 34252)
-- Name: idx_share_analytics_events_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_analytics_events_user ON public.share_analytics_events USING btree (user_id);


--
-- TOC entry 5319 (class 1259 OID 34203)
-- Name: idx_share_analytics_share; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_analytics_share ON public.share_analytics USING btree (share_id);


--
-- TOC entry 5335 (class 1259 OID 34269)
-- Name: idx_share_templates_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_templates_content ON public.share_templates USING btree (content_type);


--
-- TOC entry 5336 (class 1259 OID 34271)
-- Name: idx_share_templates_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_templates_default ON public.share_templates USING btree (is_default);


--
-- TOC entry 5337 (class 1259 OID 34270)
-- Name: idx_share_templates_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_share_templates_platform ON public.share_templates USING btree (platform);


--
-- TOC entry 5311 (class 1259 OID 34183)
-- Name: idx_shares_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shares_content ON public.shares USING btree (content_type, content_id);


--
-- TOC entry 5312 (class 1259 OID 34187)
-- Name: idx_shares_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shares_created ON public.shares USING btree (created_at);


--
-- TOC entry 5313 (class 1259 OID 34185)
-- Name: idx_shares_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shares_platform ON public.shares USING btree (platform);


--
-- TOC entry 5314 (class 1259 OID 34186)
-- Name: idx_shares_referral; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shares_referral ON public.shares USING btree (referral_code);


--
-- TOC entry 5315 (class 1259 OID 34184)
-- Name: idx_shares_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shares_user ON public.shares USING btree (user_id);


--
-- TOC entry 5170 (class 1259 OID 33709)
-- Name: idx_store_items_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_items_category ON public.store_items USING btree (category);


--
-- TOC entry 5171 (class 1259 OID 34376)
-- Name: idx_store_items_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_items_price ON public.store_items USING btree (price);


--
-- TOC entry 5172 (class 1259 OID 33708)
-- Name: idx_store_items_seller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_items_seller ON public.store_items USING btree (seller_id);


--
-- TOC entry 5173 (class 1259 OID 34375)
-- Name: idx_store_items_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_items_seller_id ON public.store_items USING btree (seller_id);


--
-- TOC entry 5174 (class 1259 OID 33710)
-- Name: idx_store_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_items_status ON public.store_items USING btree (status);


--
-- TOC entry 5404 (class 1259 OID 34564)
-- Name: idx_stories_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_created ON public.stories USING btree (created_at DESC);


--
-- TOC entry 5405 (class 1259 OID 34565)
-- Name: idx_stories_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_expires ON public.stories USING btree (expires_at);


--
-- TOC entry 5406 (class 1259 OID 34563)
-- Name: idx_stories_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_user ON public.stories USING btree (user_id);


--
-- TOC entry 5305 (class 1259 OID 34162)
-- Name: idx_story_views_story; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_views_story ON public.story_views USING btree (story_id);


--
-- TOC entry 5306 (class 1259 OID 34163)
-- Name: idx_story_views_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_views_user ON public.story_views USING btree (user_id);


--
-- TOC entry 5184 (class 1259 OID 33760)
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- TOC entry 5185 (class 1259 OID 33759)
-- Name: idx_subscriptions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_user ON public.subscriptions USING btree (user_id);


--
-- TOC entry 5276 (class 1259 OID 34061)
-- Name: idx_user_activity_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_timestamp ON public.user_activity_logs USING btree ("timestamp" DESC);


--
-- TOC entry 5277 (class 1259 OID 34060)
-- Name: idx_user_activity_logs_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_type ON public.user_activity_logs USING btree (activity_type);


--
-- TOC entry 5278 (class 1259 OID 34059)
-- Name: idx_user_activity_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_user ON public.user_activity_logs USING btree (user_id);


--
-- TOC entry 5190 (class 1259 OID 33786)
-- Name: idx_user_scores_monthly; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_scores_monthly ON public.user_scores USING btree (monthly_score DESC);


--
-- TOC entry 5191 (class 1259 OID 33785)
-- Name: idx_user_scores_weekly; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_scores_weekly ON public.user_scores USING btree (weekly_score DESC);


--
-- TOC entry 5299 (class 1259 OID 34147)
-- Name: idx_user_trust_scores_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_trust_scores_score ON public.user_trust_scores USING btree (trust_score DESC);


--
-- TOC entry 5300 (class 1259 OID 34146)
-- Name: idx_user_trust_scores_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_trust_scores_user ON public.user_trust_scores USING btree (user_id);


--
-- TOC entry 5135 (class 1259 OID 33618)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5136 (class 1259 OID 34370)
-- Name: idx_users_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_faculty ON public.users USING btree (faculty);


--
-- TOC entry 5137 (class 1259 OID 33619)
-- Name: idx_users_subscription; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_subscription ON public.users USING btree (subscription_tier);


--
-- TOC entry 5138 (class 1259 OID 34371)
-- Name: idx_users_subscription_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_subscription_tier ON public.users USING btree (subscription_tier);


--
-- TOC entry 5139 (class 1259 OID 33617)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5437 (class 2606 OID 34105)
-- Name: ab_test_results ab_test_results_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_test_results
    ADD CONSTRAINT ab_test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.ab_tests(id) ON DELETE CASCADE;


--
-- TOC entry 5438 (class 2606 OID 34110)
-- Name: ab_test_results ab_test_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_test_results
    ADD CONSTRAINT ab_test_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5436 (class 2606 OID 34091)
-- Name: ab_test_variants ab_test_variants_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ab_test_variants
    ADD CONSTRAINT ab_test_variants_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.ab_tests(id) ON DELETE CASCADE;


--
-- TOC entry 5434 (class 2606 OID 34004)
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5422 (class 2606 OID 33833)
-- Name: blocked_users blocked_users_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5423 (class 2606 OID 33828)
-- Name: blocked_users blocked_users_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5424 (class 2606 OID 33856)
-- Name: cart_items cart_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.store_items(id) ON DELETE CASCADE;


--
-- TOC entry 5425 (class 2606 OID 33851)
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5455 (class 2606 OID 34506)
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 5456 (class 2606 OID 34496)
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5457 (class 2606 OID 34501)
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5409 (class 2606 OID 33630)
-- Name: connections connections_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5410 (class 2606 OID 33635)
-- Name: connections connections_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5450 (class 2606 OID 34403)
-- Name: conversations conversations_participant1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5451 (class 2606 OID 34408)
-- Name: conversations conversations_participant2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5447 (class 2606 OID 34302)
-- Name: deep_link_clicks deep_link_clicks_deep_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deep_link_clicks
    ADD CONSTRAINT deep_link_clicks_deep_link_id_fkey FOREIGN KEY (deep_link_id) REFERENCES public.deep_links(id) ON DELETE CASCADE;


--
-- TOC entry 5428 (class 2606 OID 33900)
-- Name: device_tokens device_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5430 (class 2606 OID 33939)
-- Name: email_verification_tokens email_verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5412 (class 2606 OID 33676)
-- Name: event_attendees event_attendees_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5413 (class 2606 OID 33681)
-- Name: event_attendees event_attendees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5411 (class 2606 OID 33659)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5458 (class 2606 OID 34537)
-- Name: likes likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 5459 (class 2606 OID 34532)
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5460 (class 2606 OID 34527)
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5452 (class 2606 OID 34428)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5453 (class 2606 OID 34433)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5429 (class 2606 OID 33923)
-- Name: notification_settings notification_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5432 (class 2606 OID 33984)
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- TOC entry 5433 (class 2606 OID 33979)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5449 (class 2606 OID 34361)
-- Name: offline_data offline_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_data
    ADD CONSTRAINT offline_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5448 (class 2606 OID 34321)
-- Name: offline_queues offline_queues_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_queues
    ADD CONSTRAINT offline_queues_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5415 (class 2606 OID 33726)
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- TOC entry 5416 (class 2606 OID 33736)
-- Name: orders orders_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.store_items(id);


--
-- TOC entry 5417 (class 2606 OID 33731)
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- TOC entry 5431 (class 2606 OID 33959)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5454 (class 2606 OID 34474)
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5420 (class 2606 OID 33796)
-- Name: ranking_history ranking_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_history
    ADD CONSTRAINT ranking_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5421 (class 2606 OID 33810)
-- Name: ranking_prizes ranking_prizes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_prizes
    ADD CONSTRAINT ranking_prizes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5443 (class 2606 OID 34220)
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5444 (class 2606 OID 34215)
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5426 (class 2606 OID 33876)
-- Name: saved_items saved_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.store_items(id) ON DELETE CASCADE;


--
-- TOC entry 5427 (class 2606 OID 33871)
-- Name: saved_items saved_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5445 (class 2606 OID 34240)
-- Name: share_analytics_events share_analytics_events_share_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics_events
    ADD CONSTRAINT share_analytics_events_share_id_fkey FOREIGN KEY (share_id) REFERENCES public.shares(id) ON DELETE CASCADE;


--
-- TOC entry 5446 (class 2606 OID 34245)
-- Name: share_analytics_events share_analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics_events
    ADD CONSTRAINT share_analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5442 (class 2606 OID 34198)
-- Name: share_analytics share_analytics_share_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_analytics
    ADD CONSTRAINT share_analytics_share_id_fkey FOREIGN KEY (share_id) REFERENCES public.shares(id) ON DELETE CASCADE;


--
-- TOC entry 5441 (class 2606 OID 34178)
-- Name: shares shares_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5414 (class 2606 OID 33703)
-- Name: store_items store_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_items
    ADD CONSTRAINT store_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5461 (class 2606 OID 34558)
-- Name: stories stories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5440 (class 2606 OID 34157)
-- Name: story_views story_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5418 (class 2606 OID 33754)
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5435 (class 2606 OID 34054)
-- Name: user_activity_logs user_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_logs
    ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5419 (class 2606 OID 33780)
-- Name: user_scores user_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT user_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5439 (class 2606 OID 34141)
-- Name: user_trust_scores user_trust_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_trust_scores
    ADD CONSTRAINT user_trust_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-11-11 01:36:12

--
-- PostgreSQL database dump complete
--

\unrestrict rSkREcgFkdPBzsR8IKaxd5Q5xgPdpgRtFB9PnmnRh5auIwXm8kNEtm7rZfPdl0F

