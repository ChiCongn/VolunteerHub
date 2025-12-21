--
-- PostgreSQL database dump
--

\restrict 8ZXzd3pxOQDTlhvSXcB5hNZjxLg1bStPlLN4lTClDgHr4QiNYqL7dXScmqyBqTq

-- Dumped from database version 16.11 (74c6bb6)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: emoji; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.emoji AS ENUM (
    'like',
    'dislike',
    'wow',
    'sad',
    'angry',
    'haha'
);


--
-- Name: event_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_category AS ENUM (
    'education',
    'social',
    'community_service',
    'health_wellness',
    'technology_stem',
    'other'
);


--
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'pending',
    'approved',
    'ongoing',
    'cancelled',
    'completed',
    'rejected'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'system',
    'user',
    'event'
);


--
-- Name: registration_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.registration_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: report_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_type AS ENUM (
    'spam',
    'harassment',
    'illegal_content',
    'violence',
    'copyright_violation',
    'other'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'volunteer',
    'event_manager',
    'admin',
    'root_admin'
);


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'pending',
    'active',
    'locked',
    'deleted'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comment_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    reporter_id uuid NOT NULL,
    type public.report_type NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    description text NOT NULL,
    image_url text NOT NULL,
    categories public.event_category[],
    register_count integer DEFAULT 0,
    capacity integer NOT NULL,
    status public.event_status DEFAULT 'pending'::public.event_status NOT NULL,
    owner_id uuid NOT NULL,
    event_manager_ids uuid[] DEFAULT '{}'::uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_event_capacity CHECK ((capacity > 0)),
    CONSTRAINT chk_event_time CHECK (((end_time IS NULL) OR (start_time < end_time)))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    type public.notification_type NOT NULL,
    redirect_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: post_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    reporter_id uuid NOT NULL,
    type public.report_type NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: push_subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscription (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reactions (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reaction public.emoji NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    revoked boolean DEFAULT false
);


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status public.registration_status DEFAULT 'pending'::public.registration_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_daily_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_daily_activity (
    user_id uuid NOT NULL,
    activity_date date NOT NULL,
    online_seconds integer DEFAULT 0 NOT NULL,
    login_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT chk_online_seconds_non_negative CHECK ((online_seconds >= 0))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role public.user_role DEFAULT 'volunteer'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'pending'::public.user_status NOT NULL,
    avatar_url text DEFAULT '/images/default-avatar.png'::text,
    last_login timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, details, ip_address, created_at) FROM stdin;
24f9274e-bf97-469a-a152-f244ed3a4a87	\N	event_approved	{"event_name": "Scratch Coding for Kids", "approved_by": "Root Admin"}	192.168.1.1	2025-12-04 08:26:45.198535+00
\.


--
-- Data for Name: comment_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comment_reports (id, comment_id, reporter_id, type, reason, created_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, post_id, author_id, content, created_at, updated_at) FROM stdin;
1cd08af5-475f-4c92-8f26-b833985a4177	4aac8362-0c79-4aee-8572-048c229ff9aa	0aad94f9-6f6b-498b-b620-01fd0809bcbd	xin chào bạn nhé	2025-12-21 16:04:51.884+00	2025-12-21 16:04:51.884+00
2fe93bde-79b6-440e-9e28-8596b41990a5	65b62236-2807-41ad-8b24-2c0d620cffa5	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	bạn hỏi gì vậy	2025-12-21 16:15:49.309+00	2025-12-21 16:15:49.309+00
640ce95c-1668-422a-bd04-dec57a3ae3b4	0c84c536-e287-4534-bdc3-2b254e1df7bb	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Cảm ơn thầy ạ	2025-12-21 16:35:21.411+00	2025-12-21 16:35:21.411+00
f6b1c55b-0c8c-491b-80ad-75e01c2a9728	edb065eb-5039-42c0-9e74-f2007fb31e66	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	cam on bac vv	2025-12-19 16:48:08.377+00	2025-12-19 16:48:08.377+00
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, name, location, start_time, end_time, description, image_url, categories, register_count, capacity, status, owner_id, event_manager_ids, created_at, updated_at) FROM stdin;
ed4e1df1-c4ac-4b01-bf0d-e700296dd988	Dạy trẻ em vùng cao học chữ	Tây Nguyên	2026-02-10 17:00:00+00	2026-03-17 17:00:00+00	abc	uploads\\events\\1766333523622-565529052.jpg	{other,education,social,community_service}	0	1244	pending	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 16:12:03.795+00	2025-12-21 16:12:03.795+00
495a59ab-684e-4035-9def-d4c4e802b6fa	Chicong deptrai vcl	aoisdfskadnfksadf	2025-12-20 17:00:00+00	2025-12-25 17:00:00+00	ádfsdf	uploads\\events\\1766236128926-937514216.jpg	{other,social}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:08:49.035+00	2025-12-20 13:09:31.757844+00
2c5bc3a5-cbc1-4121-9440-4addcebe25ba	Plant 1000 Trees at Tao Dan Park	Tao Dan Park, District 1, Ho Chi Minh City	2025-11-15 01:00:00+00	2025-11-15 05:00:00+00	Join us to plant 1000 trees and make the city greener! Open to all ages.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3EYAWXNVFO-RODlmTbCGSBNVMIqTf1D1rgQ&s	{community_service}	3	50	approved	354744f2-6982-46a1-8b66-51ac38255439	{}	2025-12-04 08:24:18.30486+00	2025-12-09 16:20:27.167148+00
52951c64-4cb9-4b63-b7a8-a7021187c245	Build Suspension Bridge in Sa Pa	Cat Cat Village, Sa Pa, Lao Cai	2025-12-10 00:00:00+00	2025-12-14 10:00:00+00	5-day trip to build a bridge for 50 families.	https://localvietnam.com/wp-content/uploads/2024/07/cau-kinh-rong-may-4.jpg	{community_service}	0	20	approved	354744f2-6982-46a1-8b66-51ac38255439	{}	2025-12-04 08:24:18.30486+00	2025-12-18 18:06:06.838725+00
4f761111-26c8-4b14-83d0-d9821b634808	Scratch Coding for Kids (8-14)	Creative Tech Center, District 7, HCMC	2025-11-20 02:00:00+00	2025-11-20 09:00:00+00	Teach kids how to code games with Scratch. Laptops provided.	https://cdn.prod.website-files.com/61f7efd44d01cc87c88dc6f3/64048d2ff247d467cbf7ab2e_Step-into-the-Future-2.jpg	{education,technology_stem}	1	30	approved	354744f2-6982-46a1-8b66-51ac38255439	{}	2025-12-04 08:24:18.30486+00	2025-12-18 18:08:03.897232+00
d297c3f6-e77e-4ab9-a2f4-243019b17a47	5K Charity Run for Education	Starlight Bridge, District 2, HCMC	2025-11-30 23:00:00+00	2025-12-01 02:00:00+00	Run 5K to raise funds for underprivileged students.	https://cdn.mos.cms.futurecdn.net/9dUWxYAk5pLSyf87A8iSE5.jpg	{social,health_wellness}	2	200	approved	354744f2-6982-46a1-8b66-51ac38255439	{}	2025-12-04 08:24:18.30486+00	2025-12-18 18:08:03.898719+00
e7a23f20-2caf-49be-a392-abd29137c267	Testing create event and upload image	Ha noi	2025-12-23 17:00:00+00	\N	testing ...	uploads/events/1766196566844-111386296.jpg	{other}	0	12	pending	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 02:09:27.262+00	2025-12-20 02:09:27.262+00
58df539c-d744-43b0-be9a-7cdba3893aaf	kpi	Ha Noi	2025-12-24 17:00:00+00	\N	kpi	uploads/events/1766196766674-962382390.jpg	{other}	5	10	completed	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 02:12:46.679+00	2025-12-20 04:48:55.40317+00
9ee59471-9ccc-4c35-ae21-f12acd7e810b	sdfsdf	sadfsdf	2025-12-20 17:00:00+00	2025-12-21 17:00:00+00	sadfsdfsf	uploads\\events\\1766237003860-400920377.jpg	{other,community_service}	0	1	pending	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:23:23.914+00	2025-12-20 13:23:23.914+00
1239f08f-a58f-4c36-97ea-66f5cbf46185	sdfsdf	édf	2025-12-20 17:00:00+00	\N	sdsdfsdf	uploads\\events\\1766237061775-423394201.jpg	{other,social}	0	1	pending	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:24:21.878+00	2025-12-20 13:24:21.878+00
c60f6754-183d-4bfd-9a3f-e7a000988544	dfsdfsdf	sdfsdfsdf	2025-12-22 17:00:00+00	2025-12-25 17:00:00+00	sdfsdfsdf	uploads\\events\\1766238525121-326247689.png	{other,social}	0	1	pending	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:48:45.219+00	2025-12-20 13:48:45.219+00
33fb3173-30de-4d80-932a-2d47481fd8b8	sdfsdfsdf	sdfsdfsdf	2025-12-24 17:00:00+00	2025-12-25 17:00:00+00	sdfsdfsdfsafd	uploads\\events\\1766239135744-822796324.png	{other,social}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:58:55.847+00	2025-12-20 15:57:22.745004+00
8e0574fa-da74-48f8-aa51-c988ac3cce2d	My Khe Beach Cleanup	My Khe Beach, Da Nang	2025-10-20 00:00:00+00	2025-10-20 04:00:00+00	Event completed! Collected 500kg of trash.	https://pubity.com/wp-content/uploads/2024/07/Mr-Beast-TeamSeas.jpg	{community_service,social}	0	100	ongoing	354744f2-6982-46a1-8b66-51ac38255439	{}	2025-12-04 08:24:18.30486+00	2025-12-20 18:08:06.973161+00
49b77b52-a287-4d1e-b06a-3d610457f12d	chi cong venr	sdf	2025-12-23 17:00:00+00	\N	sdfsdf	uploads\\events\\1766242049066-981307826.jpg	{other,social}	0	2	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 14:47:29.155+00	2025-12-20 22:44:37.690776+00
2aaf6083-5b48-4aaa-a6f7-05d139f637d0	châu anh vip pro	Nhà chí công	2025-12-30 17:00:00+00	\N	Chí công	uploads\\events\\1766292571891-173338165.png	{other,health_wellness}	0	1	rejected	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 04:49:32.01+00	2025-12-21 04:59:46.009935+00
6de25677-ad40-4345-a5c8-0bb02e2b2cdd	Event Huhu	???	2025-12-22 17:00:00+00	2025-12-26 17:00:00+00	?	uploads\\events\\1766301061953-324714072.png	{other,social}	0	1	approved	e10c836a-412c-4464-bb07-1804d6edc524	{}	2025-12-21 07:11:02.085+00	2025-12-21 07:12:15.9521+00
899e781e-5b62-4628-89cb-819f0a4b7662	Chi cong như tiên	fsdf	2025-12-20 17:00:00+00	2025-12-21 17:00:00+00	sdf	uploads\\events\\1766303011016-307084900.png	{other,education}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 07:43:31.13+00	2025-12-21 08:51:45.629075+00
40ed38ab-f6fc-4edf-a093-a9c449ae85f4	k	,	2025-12-20 17:00:00+00	2025-12-23 17:00:00+00	k	uploads\\events\\1766302817544-340962624.png	{other,social}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 07:40:17.646+00	2025-12-21 08:58:28.142547+00
5bd012d5-9c0d-4b8e-80ad-a12470954482	Sang nhà Châu Anh	Hà Nam	2025-12-24 17:00:00+00	2026-02-20 17:00:00+00	Sang nhà Châu Anh vui quá	uploads\\events\\1766214821692-529845433.jpg	{other,education}	-1	5	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 07:13:41.698+00	2025-12-21 11:03:49.623565+00
1a48bd62-d30e-4b4b-9654-bf6c3f9094f9	Trồng cây gây rừng	Hà Nam	2025-12-20 17:00:00+00	2026-01-02 17:00:00+00	Trồng cây gây rừng hay quá	uploads\\events\\1766326515826-962327635.jpg	{other,community_service}	0	100	approved	a802ec32-ccb6-4336-b861-c60e6cdb750e	{}	2025-12-21 14:15:16.003+00	2025-12-21 14:24:37.025139+00
dde18e3a-f810-4d0d-9a48-f99df191b8bd	Chúng tôi yêu bạn	Earth	2025-12-24 17:00:00+00	\N	war	uploads/events/1766199239243-2126743.png	{other,technology_stem}	0	50	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 02:53:59.246+00	2025-12-21 15:09:09.712265+00
7ff0da3e-2877-4cbd-9048-0520ec130ee5	Cây nhà của tôi	Cây nhà lá vườn	2025-12-31 17:00:00+00	\N	Cây nhà lá vườn	uploads\\events\\1766271585765-853434762.jpg	{other,education}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 22:59:45.858+00	2025-12-21 15:07:57.148773+00
c3147e1d-f090-47cd-a45d-ccfe5945a298	Cây nhà lá vườn của chúng tôi	Hà Nam	2025-12-29 17:00:00+00	\N	Thích	uploads\\events\\1766239266499-517072083.png	{other,community_service}	0	2	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 14:01:06.591+00	2025-12-21 15:08:17.713951+00
682bbc87-278f-4288-b9b6-e91ca21df577	Chúng tôi là chiến sĩ	UET	2025-12-29 17:00:00+00	\N	INT2002	uploads/events/1766197786104-411655538.png	{education}	1	3	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 02:29:46.109+00	2025-12-21 15:08:43.530066+00
4e7979d8-29e8-4487-99a9-6f9752ae55d0	Chúng tôi yêu bạn, còn bạn thì sao	Ha Noi	2025-12-24 17:00:00+00	\N	Ha noi ngay nay	https://placehold.co/600x400	{education}	0	12	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-19 19:58:45.751+00	2025-12-21 15:09:24.886213+00
819ac9c7-8f53-4882-9b90-ed67b5ab56df	Trồng cây gây rừng	Hà Nam	2026-01-01 17:00:00+00	\N	Cây nhà lá vườn	uploads\\events\\1766302860315-765491049.png	{other,social}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 07:41:00.439+00	2025-12-21 15:09:34.670062+00
6b50108d-bb7f-46be-844d-bf10dd7ba9df	500 anh em	500 anh em	2025-12-25 17:00:00+00	\N	500 anh em	uploads\\events\\1766237536708-777917362.jpg	{other,social}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:32:16.818+00	2025-12-21 15:09:53.038924+00
89399425-04ad-4283-84ed-d363673a9540	UET connect	Xuân thủy	2025-12-25 17:00:00+00	\N	345345	uploads\\events\\1766238863344-333941431.png	{other,social}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 13:54:23.433+00	2025-12-21 15:10:13.93541+00
41447028-bc93-4dd0-9424-44d04a57bf45	codeing, happy coding	Ha Noi	2025-12-24 17:00:00+00	\N	luv -- testing	uploads/events/1766206657897-43248296.png	{health_wellness,education}	0	1	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 04:57:37.903+00	2025-12-21 15:11:13.662027+00
cc9645ee-aa56-4dbe-9601-724e39a300f0	Nhặt rác bãi biển	Cát Bà	2025-12-21 17:00:00+00	2025-12-24 17:00:00+00	Nhặt rác	uploads\\events\\1766330098297-726229910.jpg	{other,social,community_service}	0	123	pending	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 15:14:58.478+00	2025-12-21 15:14:58.478+00
fced0de3-8917-4d76-8706-15fe50d9d7d7	sinh nhat that girl	ha noi	2026-02-20 17:00:00+00	2026-02-21 17:00:00+00	happy birthday that girl	uploads\\events\\1766242862670-483162998.jpg	{other,social,health_wellness}	0	36	cancelled	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-20 15:01:02.744+00	2025-12-21 15:16:02.548444+00
c2902b80-4c65-4a16-b715-55850314bc5d	Trồng cây rừng Hà Tĩnh	Hà Nam	2026-03-10 17:00:00+00	\N	Trồng cây gây rừng	uploads\\events\\1766330240618-109470331.jpg	{other,education,social}	1	15	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 15:17:20.797+00	2025-12-21 16:14:29.810428+00
df85445f-c4c7-489f-a50c-3aa1acf66486	Cứu trợ bà con vùng lũ	Nghệ An	2026-03-25 17:00:00+00	\N	Cứu viện	uploads\\events\\1766330201682-80917195.jpg	{other,social,community_service,health_wellness}	0	58	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 15:16:41.861+00	2025-12-21 15:52:00.300318+00
2fdd300a-9aa1-4eba-8737-659833e007c0	Nhặt rác Ninh Bình	Ninh Bình	2026-02-28 17:00:00+00	\N	ninh bình	uploads\\events\\1766330272274-637652239.jpg	{other,education,technology_stem,health_wellness}	0	133	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 15:17:52.455+00	2025-12-21 15:52:01.164247+00
22338813-b33b-4d2b-8f76-a8aae7d14b7d	TEST EVENT để APROVE	Hà Nội	2026-01-01 17:00:00+00	\N	testing	uploads\\events\\1766333833306-154400357.jpg	{other,education,social}	1	123	approved	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	{}	2025-12-21 16:17:13.486+00	2025-12-21 16:29:43.387237+00
e616faec-4476-4c17-b078-6379b48a0887	Họp thay sếp	Hà Nội	2026-01-02 17:00:00+00	\N	Họp mệt quá	uploads\\events\\1766334693798-667309422.jpg	{other,education}	0	12	rejected	0aad94f9-6f6b-498b-b620-01fd0809bcbd	{}	2025-12-21 16:31:33.975+00	2025-12-21 16:32:50.396804+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, message, read, type, redirect_url, created_at) FROM stdin;
b196ad5f-000f-4d4c-b9e4-d446fdcd1a69	5ea137e7-860e-4648-94f8-8015437cc00c	Your registration for "Plant 1000 Trees" has been approved!	f	event	/events/plant-1000-trees	2025-12-04 08:26:45.148856+00
dc3ba368-bf58-46c6-81d9-89c2761eefe1	5ea137e7-860e-4648-94f8-8015437cc00c	Event postponed to Nov 16 due to rain.	f	event	/events/plant-1000-trees	2025-12-04 08:26:45.148856+00
0fe96bd6-4a5b-45a8-acdb-eaf2f485de87	56278395-01e3-48cd-912b-c40a937af180	**example** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/f2e4a3d4-ced3-42c0-bf4d-d58a909b4382	2025-12-20 14:50:03.631+00
6c8ed36d-db7b-499d-9110-247328f2d410	b83b0246-9e3c-4097-b731-ce3f9c19a97e	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	f	system	/settings	2025-12-20 15:07:51.425+00
5e1d626d-f143-47a3-9f4d-e1b55fe5f9d5	9db5955a-95d9-41db-b356-8d68cf782aa5	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	f	system	/settings	2025-12-20 15:07:52.76+00
dbf458dc-bb62-49ca-95a3-dfe3f94ddda3	003dd505-f023-4e14-b170-a6fe959c42f5	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	f	system	/settings	2025-12-20 15:07:54.312+00
bd0226f1-8fee-4d87-b027-941d0409fe76	1c13588e-aa0e-420c-9b04-2ac2c69ff966	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	f	system	/settings	2025-12-20 15:09:33.755+00
f6542d7d-8a69-487a-9cc0-09e18b029691	8e96cf45-eaea-4e38-81e7-ef79aa97c3a9	Tài khoản của bạn đã được mở khóa.	f	system	/settings	2025-12-21 14:04:52.718+00
3966f2cc-9a73-445a-a4da-e267c50d2201	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "CHI CONG DEP TRAI KHONG CHAU ANH" của bạn đã bị từ chối.	t	event	/events/819ac9c7-8f53-4882-9b90-ed67b5ab56df	2025-12-21 10:58:15.855+00
e129d2d2-4256-4cb6-994f-5f6d1371b854	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "sinh nhat that girl" của bạn đã được phê duyệt.	t	event	/events/fced0de3-8917-4d76-8706-15fe50d9d7d7	2025-12-21 10:57:38.149+00
2f21d1e5-d3d4-432e-ac89-2fa23433f687	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "Sang nhà Châu Anh" của bạn đã được phê duyệt.	t	event	/events/5bd012d5-9c0d-4b8e-80ad-a12470954482	2025-12-21 10:36:35.55+00
54776647-6baf-46f3-b760-ed91b6895666	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/f8c8d13a-b9ab-4915-8ce5-d8b18e5dbfce	2025-12-21 08:48:43.064+00
1c0ead5e-f914-45eb-be00-fdd07a08de04	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/690e62e5-b056-4151-b936-c6308dca6657	2025-12-21 07:09:24.887+00
2cffe941-8bac-4db8-919a-e830ea0baf21	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/2692c1a0-db7a-4046-b12e-51c3f40d3db1	2025-12-21 06:46:15.073+00
99fb3af2-0671-4912-bf20-26383847133a	56278395-01e3-48cd-912b-c40a937af180	**example** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/4a62f855-4b91-4579-a9f0-79a40fd5d22a	2025-12-21 06:27:29.124+00
abbb9863-899a-4f33-9516-aace11763031	56278395-01e3-48cd-912b-c40a937af180	**example** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/29a90d20-7466-4165-93dd-602eae87cc0c	2025-12-21 06:27:34.639+00
2de2d0b4-cdc4-4ec6-85ca-fdb0fb92a758	56278395-01e3-48cd-912b-c40a937af180	**vietanh** đã bình luận về bài viết của bạn	f	user	/posts/4a62f855-4b91-4579-a9f0-79a40fd5d22a	2025-12-21 06:27:50.604+00
e02f171a-9f89-4766-ba0b-77855cb6a150	56278395-01e3-48cd-912b-c40a937af180	**example** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/863ab42c-78ad-43c0-8d42-dbcf70b0a540	2025-12-21 06:35:09.629+00
5be190d6-43ee-443c-bde9-6190a98fbfa0	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/dc6c05f4-25d5-4132-9c2f-bb3eec530ee4	2025-12-20 15:31:33.42+00
4967cf15-211c-4aa5-89c8-b067647289e6	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/65b62236-2807-41ad-8b24-2c0d620cffa5	2025-12-21 07:39:45.204+00
46c602a7-95ff-4ac8-9683-06e453e436fb	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/56e7f9bb-8853-4111-be05-1a4cdb80de64	2025-12-21 03:38:43.812+00
00bc641e-cbfc-496b-a2a8-8db47f7dbd92	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "undefined" của bạn đã được phê duyệt.	t	event	/events/8e0574fa-da74-48f8-aa51-c988ac3cce2d	2025-12-20 15:16:04.022+00
7ec8df6c-fa54-464a-a934-ac4c5a5048f8	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	t	system	/settings	2025-12-20 15:12:27.708+00
2843ebfd-a6d7-4c3b-82e5-3f5db3eee574	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/f9e76683-eb07-4810-88b1-be2faf61bc64	2025-12-21 13:04:15.614+00
8e9ab8f2-17c1-4fc6-9983-54d6d8d694e6	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/b3a5dd00-0e4f-4dc9-9543-ac725cf34a96	2025-12-21 13:04:22.373+00
17456e43-4e8c-465e-a650-1e8ae3d1e56b	8e96cf45-eaea-4e38-81e7-ef79aa97c3a9	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	f	system	/settings	2025-12-21 14:08:27.338+00
d1295fdf-2c04-4088-9070-aaa27076aeef	8e96cf45-eaea-4e38-81e7-ef79aa97c3a9	Tài khoản của bạn đã được mở khóa.	f	system	/settings	2025-12-21 14:08:31.811+00
eecfa4d9-c89f-4aa2-bb7f-444e400a4031	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/281bb3ef-22c7-43da-be44-3da36a485920	2025-12-20 15:31:48.959+00
ed1d8e45-27a2-4799-9f80-ac741815f6f7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/2ce39c1a-8ff2-44f1-b693-8afcf4a5564c	2025-12-21 13:07:49.159+00
55a56c39-5565-497c-81f7-c175a9c7ffd3	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/1a1573ad-8f67-41a8-8e8e-724c3e8c188b	2025-12-21 13:04:31.906+00
81c5fe29-97eb-49f9-8366-afe414e54b60	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	Một người dùng đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/0538d5c5-c795-435a-9af5-868ba7511d06	2025-12-21 13:07:05.662+00
4a04b555-de96-46b4-a7ea-49178b74fa7b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/7394a449-d19e-4f8b-ba8e-e9ba936323bb	2025-12-21 13:04:19.932+00
db2c5ce4-33b8-4b6f-866c-594cc9ab2e4b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/e1e5c1c0-c183-4eed-a236-d5f6385960e1	2025-12-21 13:04:18.176+00
2e059cf5-95af-405c-8a4b-5cd18beb913e	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**example** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/1a1573ad-8f67-41a8-8e8e-724c3e8c188b	2025-12-21 13:04:27.555+00
e80830a3-2384-48a0-907d-3064cff5f801	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**Một người dùng** đã bình luận về bài viết của bạn	f	user	/posts/2ce39c1a-8ff2-44f1-b693-8afcf4a5564c	2025-12-21 13:56:49.772+00
62f60741-11bd-4ac7-bda9-2d1a8431b66b	8e96cf45-eaea-4e38-81e7-ef79aa97c3a9	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	f	system	/settings	2025-12-21 14:04:50.622+00
ca0584cb-d7f8-43bf-811c-48a0a678d854	b83b0246-9e3c-4097-b731-ce3f9c19a97e	Tài khoản của bạn đã được mở khóa.	f	system	/settings	2025-12-21 14:09:31.788+00
b207671c-114d-4e69-b785-9512d343b115	a802ec32-ccb6-4336-b861-c60e6cdb750e	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	t	system	/settings	2025-12-21 14:08:35.389+00
1ffc8930-ef4d-455f-b179-94561e5807e4	a802ec32-ccb6-4336-b861-c60e6cdb750e	Tài khoản của bạn đã được mở khóa.	t	system	/settings	2025-12-21 14:08:50.661+00
366640e2-532c-4f9f-992a-f430333da07d	a802ec32-ccb6-4336-b861-c60e6cdb750e	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	t	system	/settings	2025-12-21 14:10:13.414+00
9f06b667-6fa0-4e94-a5f0-53cc3b69b1d5	a802ec32-ccb6-4336-b861-c60e6cdb750e	Tài khoản của bạn đã được mở khóa.	t	system	/settings	2025-12-21 14:10:49.057+00
4c3d8ea7-a589-451f-9d67-5ccdb436c3b9	a802ec32-ccb6-4336-b861-c60e6cdb750e	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/043ca52a-eaad-4a0b-9d9a-bb6a97646054	2025-12-21 14:23:01.874+00
c459c3e6-bff4-4e72-85f2-94afc167d7a9	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	t	user	/posts/52622ab7-8a9e-4651-85eb-3fa7e68b65ee	2025-12-21 13:59:30.691+00
b686a432-ce4f-4617-bef9-36483b1fd3a2	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "đám cưới châu anh" của bạn đã được phê duyệt.	t	event	/events/c3147e1d-f090-47cd-a45d-ccfe5945a298	2025-12-21 10:59:27.869+00
27f374fb-45dc-445b-a49a-790c3723879b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "Web" của bạn đã được phê duyệt.	f	event	/events/682bbc87-278f-4288-b9b6-e91ca21df577	2025-12-21 15:04:52.36+00
ea9d7adf-79f7-4438-9171-8551045afddf	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/4aac8362-0c79-4aee-8572-048c229ff9aa	2025-12-21 16:04:31.159+00
b8e119aa-d2b5-439b-b1e7-71b144c24d07	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/4aac8362-0c79-4aee-8572-048c229ff9aa	2025-12-21 16:04:32.934+00
0a9b8943-6a38-4c77-a947-703f7cb81141	0aad94f9-6f6b-498b-b620-01fd0809bcbd	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/4aac8362-0c79-4aee-8572-048c229ff9aa	2025-12-21 16:04:33.903+00
bb0e5ee8-96b7-4f3d-ac61-8a794252a164	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "Trồng cây rừng Hà Tĩnh" của bạn đã được phê duyệt.	f	event	/events/c2902b80-4c65-4a16-b715-55850314bc5d	2025-12-21 16:14:30.422+00
e8bdb572-aeae-40cf-80a0-e549e3870ced	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/65b62236-2807-41ad-8b24-2c0d620cffa5	2025-12-21 16:15:57.231+00
21edd76d-90ca-408a-89ab-70a80b762a8a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Đơn đăng ký tham gia sự kiện "TEST EVENT để APROVE" của bạn đã được phê duyệt.	f	event	/events/22338813-b33b-4d2b-8f76-a8aae7d14b7d	2025-12-21 16:29:43.939+00
247f0abb-3a55-4354-9310-1d325512ebe8	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Tài khoản của bạn đã được mở khóa.	t	system	/settings	2025-12-21 16:34:13.918+00
8b4902d6-38db-4ee1-ad82-f1e43704efcc	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống.	t	system	/settings	2025-12-21 16:33:31.989+00
d767d1e1-11f8-4964-9677-0def74a54f24	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**Một người dùng** đã bày tỏ cảm xúc về bài viết của bạn	f	user	/posts/0c84c536-e287-4534-bdc3-2b254e1df7bb	2025-12-21 16:35:13.437+00
0e957981-93b6-4576-9651-af9425e0e73c	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	**Một người dùng** đã bình luận về bài viết của bạn	f	user	/posts/0c84c536-e287-4534-bdc3-2b254e1df7bb	2025-12-21 16:35:22.536+00
\.


--
-- Data for Name: post_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_reports (id, post_id, reporter_id, type, reason, created_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (id, event_id, author_id, content, image_url, created_at, updated_at, deleted_at) FROM stdin;
d21d3fc6-46b6-499a-ba9b-a136967348d7	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	5ea137e7-860e-4648-94f8-8015437cc00c	I'm so excited! First time volunteering. Who's joining?	\N	2025-12-04 08:26:45.001356+00	2025-12-04 08:26:45.001356+00	\N
cdd538e5-fe95-478b-8dcb-5f9de6512762	4f761111-26c8-4b14-83d0-d9821b634808	354744f2-6982-46a1-8b66-51ac38255439	dmnccsucvat	\N	2025-12-04 13:47:20.92+00	2025-12-04 13:47:20.92+00	\N
0634f173-28a7-4675-99bc-ea16ce781f25	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	354744f2-6982-46a1-8b66-51ac38255439	URGENT: Event postponed to Sunday (Nov 16) due to heavy rain. All volunteers will be notified.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj1-C1fAaxRezdLW5jPPBhs3w4gZvs8Dy2ug&s	2025-12-04 08:26:45.001356+00	2025-12-04 08:26:45.001356+00	\N
1c532a5c-442c-4a88-8d50-5064397ac64e	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	4668267f-c511-4cfe-94fe-c7e3729e3494	dmncc	\N	2025-12-16 09:37:06.529+00	2025-12-16 09:37:06.529+00	\N
c3912f83-d564-483b-9c13-c368f9d3b255	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	4668267f-c511-4cfe-94fe-c7e3729e3494	dmncc	\N	2025-12-16 09:38:09.329+00	2025-12-16 09:38:09.329+00	\N
869ccfcd-63f8-4ad6-b50a-07993f5224e1	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	4668267f-c511-4cfe-94fe-c7e3729e3494	dmncc	\N	2025-12-16 09:38:52.844+00	2025-12-16 09:38:52.844+00	\N
46e4a53d-7f14-419d-b70e-965247324753	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	4668267f-c511-4cfe-94fe-c7e3729e3494	dmncc	\N	2025-12-17 14:23:03.894+00	2025-12-17 14:23:03.894+00	\N
dcdbf06d-92b2-405c-b454-47b0101cb2c6	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0f7af42e-a395-4419-bb5a-9dd661661f82	sssssssss		2025-12-18 05:52:42.568+00	2025-12-18 05:52:42.568+00	\N
173a5742-2860-491e-868b-d1542b2b12ea	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	1c13588e-aa0e-420c-9b04-2ac2c69ff966	cong ncu		2025-12-18 06:43:42.932+00	2025-12-18 06:43:42.932+00	\N
5e183948-80ba-46fa-b528-652410fe4993	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	tôi bị ngu		2025-12-18 06:44:20.641+00	2025-12-18 06:44:20.641+00	\N
52005aa9-94f9-44fe-af02-634a69d0b4cb	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	Mình là hacker đây chào mọi người hehe	https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg	2025-12-18 07:07:09.389+00	2025-12-18 07:07:09.389+00	\N
f1cc5039-4af5-4195-8567-45a86ae0e657	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	what is on my mind?	https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg	2025-12-18 13:46:19.344+00	2025-12-18 13:46:19.344+00	\N
48df9c0d-5bd5-4c9b-a6bf-9b6ce39fa62e	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	Toi la chim 	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMCnKYjE7EMs8xxMZdmdz5tUjcVOAPLXUQyA&s	2025-12-18 16:58:32.902+00	2025-12-18 16:58:32.902+00	\N
5eccb1ff-7a8f-47ed-ace4-987a6f3d13ba	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	dit me thang chi cong	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1VH2czK0fHfiqo-u7w4ZtKjUUewFEVKtygQ&s	2025-12-19 04:31:43.669+00	2025-12-19 04:31:43.669+00	\N
d896e428-41dd-4161-acf4-525e2c6fd1a5	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	tôi không phải là chim	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXZ82J0It2aQ1EWQRx8gCcriQ4f6UbNiFUHA&s	2025-12-19 04:34:10.248+00	2025-12-19 04:34:10.248+00	\N
edb065eb-5039-42c0-9e74-f2007fb31e66	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	abc		2025-12-19 07:38:51.927+00	2025-12-19 07:38:51.927+00	\N
29c11aac-e4af-4f6a-b790-d9ad63108f87	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	56278395-01e3-48cd-912b-c40a937af180	xxxx		2025-12-19 07:39:03.716+00	2025-12-19 07:39:03.716+00	\N
e6cb52bf-a3e1-4ea3-bbfb-aeefdca10c53	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Just finished the beach clean-up! We collected over 50 bags of trash today. So proud of everyone! #EcoWarrior	https://images.unsplash.com/photo-1618477461853-cf6ed80fbe5e	2025-12-17 08:02:46.436312+00	2025-12-19 08:02:46.436312+00	\N
fd5f2e4e-25d1-4228-9996-fb9261e2281e	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Reminder: The briefing for tomorrow's food drive starts at 8 AM in the main hall. Please be on time!	https://share.google/F3aExzpOURiuvXYT4	2025-12-18 08:02:46.436312+00	2025-12-19 08:02:46.436312+00	\N
5cc970bd-c66d-4a36-a5d6-7c771665068b	4f761111-26c8-4b14-83d0-d9821b634808	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Can anyone help me with transportation for the elderly care visit this Saturday?	https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8	2025-12-19 03:02:46.436312+00	2025-12-19 08:02:46.436312+00	\N
8084bbee-f46b-4917-a511-5e8caf62009e	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	Chi con như con cac?	https://cdnv2.tgdd.vn/mwg-static/common/News/1581724/code-brainrot-evolution-2.jpg	2025-12-19 10:28:03.897+00	2025-12-19 10:28:03.897+00	\N
f47a1df2-3105-47f6-98ca-22567cfc276e	d297c3f6-e77e-4ab9-a2f4-243019b17a47	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Chi cong dep trai vcl	https://cdnv2.tgdd.vn/mwg-static/common/News/1581724/code-brainrot-evolution-2.jpg	2025-12-19 10:33:39.56+00	2025-12-19 10:33:39.56+00	\N
b88f73a0-a1b1-4c2e-af61-88fe75b442a8	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	Chi cong dep trai chau anh	https://cdnv2.tgdd.vn/mwg-static/common/News/1581724/code-brainrot-evolution-2.jpg	2025-12-19 10:43:10.557+00	2025-12-19 10:43:10.557+00	\N
73f4d7e2-7067-46d6-9f0e-787d1572d94a	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Dat 09 muon nam		2025-12-19 15:14:59.15+00	2025-12-19 15:14:59.15+00	\N
421540c8-47fb-4b72-ac6e-1f3b0a29113c	52951c64-4cb9-4b63-b7a8-a7021187c245	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	dddd		2025-12-19 15:50:27.065+00	2025-12-19 15:50:27.065+00	\N
64a0bf62-a222-4bf1-a332-836bb6ff908e	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	Thế này thì khê quá	https://binhminhdigital.com/StoreData/PageData/2780/Tu-gia-mui-com-khe-nau-bang-noi-com-dien4.jpg	2025-12-19 17:48:55.254+00	2025-12-19 17:48:55.254+00	\N
9a74561d-e777-42d2-b1d7-fa4ec0d8c5f0	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	fffff		2025-12-19 17:50:57.818+00	2025-12-19 17:50:57.818+00	\N
335fb1c6-ee14-48e5-be7e-cf9f51161937	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	slslslslsls		2025-12-19 17:51:36.864+00	2025-12-19 17:51:36.864+00	\N
fa8018a8-7a78-4c4b-8c4b-0d7007f92dd2	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	sssss		2025-12-19 17:53:49.242+00	2025-12-19 17:53:49.242+00	\N
15062a89-1f41-4c5b-8dd7-eca692bb013d	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	lllll		2025-12-19 17:54:42.692+00	2025-12-19 17:54:42.692+00	\N
297e0c92-209c-4e97-a189-855b5bca7f39	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	xxxxx		2025-12-19 17:57:49.323+00	2025-12-19 17:57:49.323+00	\N
77bf888c-3afa-44f2-8d5a-de79d0f4f224	4f761111-26c8-4b14-83d0-d9821b634808	56278395-01e3-48cd-912b-c40a937af180	fffff		2025-12-19 17:59:44.317+00	2025-12-19 17:59:44.317+00	\N
ab17d6a1-466d-4906-8d4c-a62ea3fd17fe	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	ssssss		2025-12-20 06:28:44.038+00	2025-12-20 06:28:44.038+00	\N
f612a745-2d1e-48ba-8fcd-5854cb7ce17d	d297c3f6-e77e-4ab9-a2f4-243019b17a47	56278395-01e3-48cd-912b-c40a937af180	dit me thang chi cong		2025-12-20 07:07:47.153+00	2025-12-20 07:07:47.153+00	\N
cdc7f50a-9248-44bc-af23-bed85eda1daf	41447028-bc93-4dd0-9424-44d04a57bf45	0aad94f9-6f6b-498b-b620-01fd0809bcbd	new post route		2025-12-20 07:31:42.02+00	2025-12-20 07:31:42.02+00	\N
7400583a-1a0d-492c-8d2c-429fa0a0a899	41447028-bc93-4dd0-9424-44d04a57bf45	0aad94f9-6f6b-498b-b620-01fd0809bcbd	turn on authorize\n		2025-12-20 07:32:24.22+00	2025-12-20 07:32:24.22+00	\N
acc5c642-f56d-49c8-9831-e1ddc7d647a7	682bbc87-278f-4288-b9b6-e91ca21df577	0aad94f9-6f6b-498b-b620-01fd0809bcbd	???		2025-12-20 07:32:54.953+00	2025-12-20 07:32:54.953+00	\N
b7e6b0cb-c7a8-4d46-a8b4-7954d51e0565	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	he he he he		2025-12-20 07:36:31.968+00	2025-12-20 07:36:31.968+00	\N
7aedad43-c7d4-4f78-9ae2-5b5a248fa209	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	khong duoc phep tao post di ma		2025-12-20 07:43:33.798+00	2025-12-20 07:43:33.798+00	\N
77404001-7ba2-4841-9d67-a4f96ba25b44	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	xin ma dung tao post nua\n		2025-12-20 07:46:38.13+00	2025-12-20 07:46:38.13+00	\N
b120554b-fa8b-4ab8-8464-b03770cb60cc	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	1.1\n		2025-12-20 07:48:31.721+00	2025-12-20 07:48:31.721+00	\N
74d8d7ff-59b3-4136-8071-8c25fb71886b	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	2.2		2025-12-20 07:51:24.185+00	2025-12-20 07:51:24.185+00	\N
91200518-95d4-45a0-8137-1c74556fc584	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	5.5\n		2025-12-20 07:56:06.856+00	2025-12-20 07:56:06.856+00	\N
d3696e75-8e96-4bb5-adcf-1e0cac7676aa	5bd012d5-9c0d-4b8e-80ad-a12470954482	0aad94f9-6f6b-498b-b620-01fd0809bcbd	8.8		2025-12-20 08:01:40.764+00	2025-12-20 08:01:40.764+00	\N
ac07812f-d53f-41fc-b7d1-c7dcdabc01aa	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	nhin cc		2025-12-20 08:16:11.557+00	2025-12-20 08:16:11.557+00	\N
5f9bedba-dc1e-4401-99e6-9a96fe98e6f3	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	sss		2025-12-20 08:16:23.79+00	2025-12-20 08:16:23.79+00	\N
63ea085e-d272-4146-99a6-803b29269602	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	sss		2025-12-20 08:17:40.809+00	2025-12-20 08:17:40.809+00	\N
08754610-e5e0-4f8f-9f96-80758b0f27fe	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	àasfafa		2025-12-20 08:17:55.694+00	2025-12-20 08:17:55.694+00	\N
d169bf81-2135-46d5-b187-8364cbe2ae2e	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	ssss		2025-12-20 08:18:13.89+00	2025-12-20 08:18:13.89+00	\N
4a62f855-4b91-4579-a9f0-79a40fd5d22a	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	gi vay ba\n		2025-12-20 08:19:11.991+00	2025-12-20 08:19:11.991+00	\N
29a90d20-7466-4165-93dd-602eae87cc0c	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	gi z ba\n		2025-12-20 08:19:23.989+00	2025-12-20 08:19:23.989+00	\N
f2e4a3d4-ced3-42c0-bf4d-d58a909b4382	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	ssss		2025-12-20 08:20:53.15+00	2025-12-20 08:20:53.15+00	\N
863ab42c-78ad-43c0-8d42-dbcf70b0a540	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	kskskskskskskskks		2025-12-20 08:21:24.656+00	2025-12-20 08:21:24.656+00	\N
e42a2d95-4811-4b77-ae27-db7a8738693a	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	tại sao lỗi		2025-12-20 08:21:51.546+00	2025-12-20 08:21:51.546+00	\N
10b89803-3312-456f-8e27-bebd574e71f9	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	fasfas		2025-12-20 08:23:44.682+00	2025-12-20 08:23:44.682+00	\N
e4a7b7bc-ee0e-44b9-9cda-863d49471a73	52951c64-4cb9-4b63-b7a8-a7021187c245	56278395-01e3-48cd-912b-c40a937af180	optimistic\n		2025-12-20 08:23:56.589+00	2025-12-20 08:23:56.589+00	\N
eaffbe38-f911-485c-a1be-6a8a40df3f5c	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	zzf		2025-12-20 14:33:51.006+00	2025-12-20 14:33:51.006+00	\N
44e616c9-6cc8-4f1c-be13-8364d60c233d	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	sdfdf		2025-12-20 14:36:09.12+00	2025-12-20 14:36:09.12+00	\N
1982379d-5222-4b10-a3d5-da653614e561	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	sdfsdf		2025-12-20 14:37:20.474+00	2025-12-20 14:37:20.474+00	\N
cac51f92-96f2-4875-801d-ffaa42364765	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	fsdfsdf		2025-12-20 14:37:54.76+00	2025-12-20 14:37:54.76+00	\N
4cd3a8d1-81de-41b9-93f8-3dfc3b2aa3a7	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	;\n		2025-12-20 14:39:05.121+00	2025-12-20 14:39:05.121+00	\N
c2701170-0292-456c-92f1-55ab339a8450	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	????		2025-12-20 14:40:42.518+00	2025-12-20 14:40:42.518+00	\N
281bb3ef-22c7-43da-be44-3da36a485920	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	21:42\n		2025-12-20 14:42:13.866+00	2025-12-20 14:42:13.866+00	\N
dc6c05f4-25d5-4132-9c2f-bb3eec530ee4	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	21:55		2025-12-20 14:55:53.622+00	2025-12-20 14:55:53.622+00	\N
9de0d474-8339-4317-832e-d75f7cb7b72f	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	huhu how i can get it		2025-12-20 22:46:15.443+00	2025-12-20 22:46:15.443+00	\N
89cef148-43f3-4b2a-b219-2a101a606612	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	sfdsfsdf		2025-12-20 22:47:48.613+00	2025-12-20 22:47:48.613+00	\N
9c73fc85-a401-4533-80ec-37ee0704e99c	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	???		2025-12-20 22:48:11.433+00	2025-12-20 22:48:11.433+00	\N
39c02e85-e258-4007-ac17-2ae34e6ac3c9	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	sdfsdf		2025-12-20 22:48:20.658+00	2025-12-20 22:48:20.658+00	\N
70214874-78a9-47df-9a99-1d41da90e5f3	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	d		2025-12-20 22:50:34.46+00	2025-12-20 22:50:34.46+00	\N
0e154b2c-29ca-43f8-ba8c-48b3b62f56f6	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	???		2025-12-20 22:53:04.639+00	2025-12-20 22:53:04.639+00	\N
ae75ae50-0949-4576-bbeb-edcf97f5536c	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	lklk		2025-12-20 22:53:16.829+00	2025-12-20 22:53:16.829+00	\N
c4b0ab27-e2e5-47c6-88be-70dce20b67e4	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	/		2025-12-20 22:53:23.35+00	2025-12-20 22:53:23.35+00	\N
7afb783c-7736-4d9a-9976-99386af45ad4	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	d		2025-12-20 22:54:12.604+00	2025-12-20 22:54:12.604+00	\N
038f5c80-0d27-409e-864d-476f2ef842ca	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	l		2025-12-20 22:55:36.934+00	2025-12-20 22:55:36.934+00	\N
b04b5672-99e8-4814-a80c-d665b6a4050e	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	d		2025-12-20 22:58:27.349+00	2025-12-20 22:58:27.349+00	\N
4cb7b07c-2eea-4e73-b0ea-fb3f2eba1259	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	d		2025-12-20 22:58:59.788+00	2025-12-20 22:58:59.788+00	\N
653763c4-cb93-4ab3-abc2-62992fbe5ea3	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	ss		2025-12-20 23:05:01.389+00	2025-12-20 23:05:01.389+00	\N
59b98457-3313-4725-8300-273868f52165	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	???nó k hoạt động		2025-12-20 23:05:34.691+00	2025-12-20 23:05:34.691+00	\N
690e62e5-b056-4151-b936-c6308dca6657	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	??		2025-12-20 23:06:29.343+00	2025-12-20 23:06:29.343+00	\N
2a31ef82-1de8-4fe3-ba19-25b969e2a577	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	?		2025-12-20 23:08:24.981+00	2025-12-20 23:08:24.981+00	\N
2692c1a0-db7a-4046-b12e-51c3f40d3db1	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	hu		2025-12-21 00:06:46.26+00	2025-12-21 00:06:46.26+00	\N
56e7f9bb-8853-4111-be05-1a4cdb80de64	52951c64-4cb9-4b63-b7a8-a7021187c245	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	??wtf		2025-12-21 03:38:36.304+00	2025-12-21 03:38:36.304+00	\N
1a1573ad-8f67-41a8-8e8e-724c3e8c188b	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	xin di truoc		2025-12-21 05:34:16.484+00	2025-12-21 05:34:16.484+00	\N
7dcad37a-0c33-4a2f-9e68-50d25b4e12e2	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	he he he	\N	2025-12-21 05:57:54.193+00	2025-12-21 05:57:54.193+00	\N
d0c8e1a7-3806-4a08-a96b-d4f2a36ce71d	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	ehheh	uploads/posts/1766296869353-396589379.png	2025-12-21 06:01:09.488+00	2025-12-21 06:01:09.488+00	\N
b3a5dd00-0e4f-4dc9-9543-ac725cf34a96	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	he he	\N	2025-12-21 06:02:40.143+00	2025-12-21 06:02:40.143+00	\N
7394a449-d19e-4f8b-ba8e-e9ba936323bb	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	h	\N	2025-12-21 06:02:57.318+00	2025-12-21 06:02:57.318+00	\N
e1e5c1c0-c183-4eed-a236-d5f6385960e1	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	it's work	\N	2025-12-21 06:03:42.129+00	2025-12-21 06:03:42.129+00	\N
f9e76683-eb07-4810-88b1-be2faf61bc64	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	default	uploads/posts/1766297031459-846169810.png	2025-12-21 06:03:51.655+00	2025-12-21 06:03:51.655+00	\N
58a2f60c-699d-4c88-963b-686cee37bac4	52951c64-4cb9-4b63-b7a8-a7021187c245	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	sádasdasdasd	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxXnC3fwMwkbIt3ejGRIw3NmbDyUtgS5g2jA&s	2025-12-21 06:40:21.532+00	2025-12-21 06:40:21.532+00	\N
65b62236-2807-41ad-8b24-2c0d620cffa5	52951c64-4cb9-4b63-b7a8-a7021187c245	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	anh em cho hỏi 	https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png	2025-12-21 06:40:39.953+00	2025-12-21 06:40:39.953+00	\N
fcc01dc7-4468-4c33-a04b-48c8ab9386c1	7ff0da3e-2877-4cbd-9048-0520ec130ee5	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	dfsdfsd	uploads\\posts\\1766303924735-808098126.jpg	2025-12-21 07:58:44.903+00	2025-12-21 07:58:44.903+00	\N
f8c8d13a-b9ab-4915-8ce5-d8b18e5dbfce	899e781e-5b62-4628-89cb-819f0a4b7662	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	sdfdf	\N	2025-12-21 08:18:27.142+00	2025-12-21 08:18:27.142+00	\N
6f062d29-9157-43f2-a2fa-d1982b35045f	899e781e-5b62-4628-89cb-819f0a4b7662	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	???	\N	2025-12-21 08:50:17.544+00	2025-12-21 08:50:17.544+00	\N
ae3b3e45-a4ba-4271-98ec-956b9a89cc51	40ed38ab-f6fc-4edf-a093-a9c449ae85f4	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	okop	\N	2025-12-21 08:52:37.496+00	2025-12-21 08:52:37.496+00	\N
0538d5c5-c795-435a-9af5-868ba7511d06	899e781e-5b62-4628-89cb-819f0a4b7662	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	kskksksks	\N	2025-12-21 13:07:02.054+00	2025-12-21 13:07:02.054+00	\N
2ce39c1a-8ff2-44f1-b693-8afcf4a5564c	fced0de3-8917-4d76-8706-15fe50d9d7d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	ddd	\N	2025-12-21 13:07:45.113+00	2025-12-21 13:07:45.113+00	\N
cf3bc03b-cdde-4f3f-9490-724a86af8b48	fced0de3-8917-4d76-8706-15fe50d9d7d7	0aad94f9-6f6b-498b-b620-01fd0809bcbd	ddd	\N	2025-12-21 13:56:57.951+00	2025-12-21 13:56:57.951+00	\N
8d8c3635-5892-477d-a77f-0e8218519546	c3147e1d-f090-47cd-a45d-ccfe5945a298	0aad94f9-6f6b-498b-b620-01fd0809bcbd	chúc mừng	\N	2025-12-21 13:58:18.539+00	2025-12-21 13:58:18.539+00	\N
52622ab7-8a9e-4651-85eb-3fa7e68b65ee	c3147e1d-f090-47cd-a45d-ccfe5945a298	0aad94f9-6f6b-498b-b620-01fd0809bcbd	default	uploads\\posts\\1766325524446-642764803.jpg	2025-12-21 13:58:44.792+00	2025-12-21 13:58:44.792+00	\N
043ca52a-eaad-4a0b-9d9a-bb6a97646054	1a48bd62-d30e-4b4b-9654-bf6c3f9094f9	a802ec32-ccb6-4336-b861-c60e6cdb750e	xin chào mọi người mình là quản trị viên 	uploads\\posts\\1766326969967-119504487.jpg	2025-12-21 14:22:50.218+00	2025-12-21 14:22:50.218+00	\N
0462bcf2-84e5-41f9-be94-c816fecdd7ee	89399425-04ad-4283-84ed-d363673a9540	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	Hello UET	\N	2025-12-21 15:10:26.147+00	2025-12-21 15:10:26.147+00	\N
4aac8362-0c79-4aee-8572-048c229ff9aa	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	0aad94f9-6f6b-498b-b620-01fd0809bcbd	Xin chào tất cả mọi người 	uploads\\posts\\1766333052713-381271112.jpg	2025-12-21 16:04:13.25+00	2025-12-21 16:04:13.25+00	\N
0c84c536-e287-4534-bdc3-2b254e1df7bb	c2902b80-4c65-4a16-b715-55850314bc5d	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	Xin chào mọi người 	uploads\\posts\\1766333714293-646803419.jpg	2025-12-21 16:15:15.288+00	2025-12-21 16:15:15.288+00	\N
\.


--
-- Data for Name: push_subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_subscription (id, user_id, endpoint, p256dh, auth, created_at) FROM stdin;
667bfa53-2769-46c9-b86c-454c6fe2d472	0aad94f9-6f6b-498b-b620-01fd0809bcbd	https://updates.push.services.mozilla.com/wpush/v2/gAAAAABpRq9u8ZfqDsi7ZMdF_hKzfaQOA3qem_xkwYt8IhwJbuV3sQp_t-yCCI6PRqTtQ9nRrpveV6MI3sI-sDO5LgUo93K4ka-URSE8URCzXktPSfgw2oe9LNzvpKGPNC4U9-HyHQPOz-o_cq4wYk93dbh3jl8UBdYDDgaVkm2mcR0MS7DjjGM	BBtmXo4A_KFGMPR70JqDxzmL2w2ArCMkPvdlBsjkOhJheyaCHiEgdc7b5jV2ZkJcu3boM9eAdUcML87G26bJ3s4	BV3F1RcCHVzpeqdk8EhBgA	2025-12-20 14:25:36.976+00
939ec6de-0919-4ce2-9505-d36361dcffa3	0aad94f9-6f6b-498b-b620-01fd0809bcbd	https://fcm.googleapis.com/fcm/send/eVJYijzxovI:APA91bGnuytuACngwx4KndoOuCb-QUEr9zJWZcE9fFjSmcN8wwWx_Ca6GkDZU7kyXL88oUo7Y8cBqKl9xZ3z2qquYaOfkxsYi7wzhqoqC9putSgmSicDd3II52fVubreo0sDI0H2ylEb	BKInBzPUGzjphPO9dE3geOkVOP-ZPIvS_vYdKJE2rQ0kyhK__P8cKALQl2xvGuMFtgwNHeJgTpkHC4LdREo2NK8	T-kcbX_VpVp0hifnnAQIIQ	2025-12-20 15:32:46.595+00
\.


--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reactions (post_id, user_id, reaction, created_at) FROM stdin;
f47a1df2-3105-47f6-98ca-22567cfc276e	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-20 06:39:09.666+00
73f4d7e2-7067-46d6-9f0e-787d1572d94a	52778341-f7a8-4a68-957c-8fe6364e3f2b	angry	2025-12-20 06:40:15.155+00
8084bbee-f46b-4917-a511-5e8caf62009e	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-20 06:40:16.317+00
29c11aac-e4af-4f6a-b790-d9ad63108f87	52778341-f7a8-4a68-957c-8fe6364e3f2b	wow	2025-12-20 06:40:18.484+00
edb065eb-5039-42c0-9e74-f2007fb31e66	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-20 06:40:20.436+00
d896e428-41dd-4161-acf4-525e2c6fd1a5	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-20 06:40:22.502+00
5eccb1ff-7a8f-47ed-ace4-987a6f3d13ba	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-20 06:40:24.353+00
48df9c0d-5bd5-4c9b-a6bf-9b6ce39fa62e	52778341-f7a8-4a68-957c-8fe6364e3f2b	wow	2025-12-20 06:40:26.241+00
f1cc5039-4af5-4195-8567-45a86ae0e657	52778341-f7a8-4a68-957c-8fe6364e3f2b	angry	2025-12-20 06:40:28.3+00
ab17d6a1-466d-4906-8d4c-a62ea3fd17fe	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-20 07:45:33.336+00
e42a2d95-4811-4b77-ae27-db7a8738693a	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-20 13:39:54.018+00
acc5c642-f56d-49c8-9831-e1ddc7d647a7	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-20 14:06:48.552+00
e4a7b7bc-ee0e-44b9-9cda-863d49471a73	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-20 13:39:45.479+00
44e616c9-6cc8-4f1c-be13-8364d60c233d	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-20 14:36:51.627+00
cac51f92-96f2-4875-801d-ffaa42364765	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-20 14:38:59.86+00
f2e4a3d4-ced3-42c0-bf4d-d58a909b4382	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-20 14:50:02.935+00
5eccb1ff-7a8f-47ed-ace4-987a6f3d13ba	ed4c3bac-dcbc-444c-b887-5fef9f11d05d	like	2025-12-19 20:02:36.009+00
10b89803-3312-456f-8e27-bebd574e71f9	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-20 13:39:47.059+00
dc6c05f4-25d5-4132-9c2f-bb3eec530ee4	52778341-f7a8-4a68-957c-8fe6364e3f2b	angry	2025-12-20 15:31:32.695+00
c2701170-0292-456c-92f1-55ab339a8450	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-20 14:52:38.575+00
281bb3ef-22c7-43da-be44-3da36a485920	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-20 15:31:48.253+00
56e7f9bb-8853-4111-be05-1a4cdb80de64	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-21 03:38:43.246+00
4a62f855-4b91-4579-a9f0-79a40fd5d22a	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 06:27:28.083+00
863ab42c-78ad-43c0-8d42-dbcf70b0a540	52778341-f7a8-4a68-957c-8fe6364e3f2b	angry	2025-12-21 06:35:08.83+00
2a31ef82-1de8-4fe3-ba19-25b969e2a577	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-20 23:08:53.689+00
690e62e5-b056-4151-b936-c6308dca6657	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 07:09:23.997+00
f8c8d13a-b9ab-4915-8ce5-d8b18e5dbfce	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-21 08:48:42.409+00
f9e76683-eb07-4810-88b1-be2faf61bc64	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-21 13:04:14.922+00
e1e5c1c0-c183-4eed-a236-d5f6385960e1	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 13:04:17.537+00
7394a449-d19e-4f8b-ba8e-e9ba936323bb	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-21 13:04:19.449+00
b3a5dd00-0e4f-4dc9-9543-ac725cf34a96	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 13:04:21.964+00
2692c1a0-db7a-4046-b12e-51c3f40d3db1	52778341-f7a8-4a68-957c-8fe6364e3f2b	angry	2025-12-21 06:46:14.156+00
1a1573ad-8f67-41a8-8e8e-724c3e8c188b	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 13:04:31.374+00
0538d5c5-c795-435a-9af5-868ba7511d06	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-21 13:07:04.915+00
2ce39c1a-8ff2-44f1-b693-8afcf4a5564c	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-21 13:07:48.384+00
043ca52a-eaad-4a0b-9d9a-bb6a97646054	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 14:23:00.939+00
4aac8362-0c79-4aee-8572-048c229ff9aa	52778341-f7a8-4a68-957c-8fe6364e3f2b	sad	2025-12-21 16:04:33.201+00
65b62236-2807-41ad-8b24-2c0d620cffa5	52778341-f7a8-4a68-957c-8fe6364e3f2b	like	2025-12-21 16:15:56.443+00
0c84c536-e287-4534-bdc3-2b254e1df7bb	52778341-f7a8-4a68-957c-8fe6364e3f2b	haha	2025-12-21 16:35:12.484+00
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at, revoked) FROM stdin;
39579391-8fe7-46da-9270-338704164c78	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYxNTIxMDEsImV4cCI6MTc2Njc1NjkwMSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.m65L7eDGQKqkzMuurgdNAvXq5Lu3A5GicHSGgix9x0E	2025-12-26 13:48:21.321+00	2025-12-19 13:48:21.322+00	f
90a6a96e-e2ba-43a6-968e-d0d9a2528b88	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTUyNDEzLCJleHAiOjE3NjY3NTcyMTMsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.piT5F6hFEcraHS89vyH_l1z-lhtWq3CS7cIT6XMcuPY	2025-12-26 13:53:33.843+00	2025-12-19 13:53:33.845+00	f
6c9fd564-5576-41da-b67c-61086dcebd09	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTUzODk5LCJleHAiOjE3NjY3NTg2OTksImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.pCybmSf8dDdFoRI8kBbCcbunwPnlp9GTHxzXCqVQIj0	2025-12-26 14:18:19.77+00	2025-12-19 14:18:19.772+00	f
16e44d80-9179-4612-a444-44c959271383	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE1MzkxMCwiZXhwIjoxNzY2NzU4NzEwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.sNe-YH8zqEArZe5jozxwRw0uqYzPwDUs7d9hKWSp6IE	2025-12-26 14:18:30.578+00	2025-12-19 14:18:30.58+00	f
71a8d7c2-c156-482a-b059-4f129fd757f8	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTU0NDI1LCJleHAiOjE3NjY3NTkyMjUsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.luV8oP_mqF0FQiJDlPo6HiQjmjIstTfOfosc7p4yvuU	2025-12-26 14:27:05.877+00	2025-12-19 14:27:05.879+00	f
923179c7-e197-4daf-bb4a-ccb21fff4e27	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTU0NDQwLCJleHAiOjE3NjY3NTkyNDAsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.HoIbF-uHal291FbxyFBoPc3fa8ch2yoRu2cidyG2Adk	2025-12-26 14:27:20.7+00	2025-12-19 14:27:20.702+00	f
3ef3bea5-ba0b-4657-b22d-250f34cbd90f	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYxNTQ2MDEsImV4cCI6MTc2Njc1OTQwMSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.jlBj7TWyqto--Q1scfS9K0TOhcnyfrGVPxYMCxa-RLY	2025-12-26 14:30:01.694+00	2025-12-19 14:30:01.697+00	f
2d722ae3-092c-4ac1-849b-85488a42d081	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYxNTY1MjgsImV4cCI6MTc2Njc2MTMyOCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.nuXbOX6FJdw3xAcX_Kq-LywcCh7lomx48zA08Ui2l4s	2025-12-26 15:02:08.002+00	2025-12-19 15:02:08.004+00	f
b4990bbd-339d-433e-b72c-c0bc9e8e390f	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE1NjU4MiwiZXhwIjoxNzY2NzYxMzgyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.-2CP-Ogd3Z3zAOV67aPgdddoZtOee5Mzuf3r3CEuo8I	2025-12-26 15:03:02.219+00	2025-12-19 15:03:02.221+00	f
482c4114-f303-4ae9-bfa8-5342c7bda85b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE1OTI0MywiZXhwIjoxNzY2NzY0MDQzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.O7cBQCEBQsAsQ2LqC3OqvTMWZyGYadzW2hO9snAfZbI	2025-12-26 15:47:23.393+00	2025-12-19 15:47:23.395+00	f
ed6c1411-1919-4756-932b-38ddf21c1af2	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTU5NDEyLCJleHAiOjE3NjY3NjQyMTIsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.fBMXwRoyPMdFHpfbJ1tsHngcO7u82pIX3Ngob1ZZrzk	2025-12-26 15:50:12.375+00	2025-12-19 15:50:12.384+00	f
53793096-19bd-469d-8392-e72fc053a50a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE2MDI5OCwiZXhwIjoxNzY2NzY1MDk4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.pjlMZAd_Yt6telBkfImnCuuhi7XGDJ9YiBQ8UhL9jEE	2025-12-26 16:04:58.396+00	2025-12-19 16:04:58.398+00	f
3cbe2d3e-bc77-4b9c-b74b-6edb104ae71a	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYxNjMyMTEsImV4cCI6MTc2Njc2ODAxMSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.rpKmbI8eSyvNu5FkbNmB6Ul_3Ub0AnwWLL2QNJmuvkM	2025-12-26 16:53:31.855+00	2025-12-19 16:53:31.857+00	f
75543585-9e3c-487a-9ac4-75f211bc7102	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE2MzY4OSwiZXhwIjoxNzY2NzY4NDg5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.scBPG-78-gUSH_ZeOChgL9cmhlxBqzV78DX8P7BqHDI	2025-12-26 17:01:29.888+00	2025-12-19 17:01:29.891+00	f
9ed0fa7a-8818-4c6d-9992-1df19c8296dd	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYxNjQ2MTEsImV4cCI6MTc2Njc2OTQxMSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.j6C8uMrPpftsJ97VvaTw-qUqNZEwcKYtrp-2QTlNxyA	2025-12-26 17:16:51.909+00	2025-12-19 17:16:51.911+00	f
6af2925d-7634-4a3d-b1ae-eaab8d56b3cc	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE2NDg1OCwiZXhwIjoxNzY2NzY5NjU4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0._dJe3ZrZfCeJclF8BTWoWA34Bh0jREB79pgv6hmiAw0	2025-12-26 17:20:58.539+00	2025-12-19 17:20:58.54+00	f
d9a9d135-c768-4642-9dca-006728cab4b4	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE2NDg3NSwiZXhwIjoxNzY2NzY5Njc1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.MwnCcfyTi51fbbKT_8f2n9BAWdkSwtaoZvNDMV6BPg4	2025-12-26 17:21:15.968+00	2025-12-19 17:21:15.97+00	f
2cb60045-5c31-4821-bbfb-6a2252574928	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE2NTI4MCwiZXhwIjoxNzY2NzcwMDgwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ccrajGpMFF7g4kQ02GHkemR8rLJwscfVr41fwABAbVQ	2025-12-26 17:28:00.108+00	2025-12-19 17:28:00.111+00	f
a9f90a4d-5d13-417c-859b-3cfbe998d5e9	8e96cf45-eaea-4e38-81e7-ef79aa97c3a9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTk2Y2Y0NS1lYWVhLTRlMzgtODFlNy1lZjc5YWE5N2MzYTkiLCJlbWFpbCI6ImFkdXZpcDEyM0BnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTY1NDI3LCJleHAiOjE3NjY3NzAyMjcsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.a3F50V8f4YO5zNNXLijvmDqOv_kQcdvi9pG2B4SV85s	2025-12-26 17:30:27+00	2025-12-19 17:30:27.002+00	f
18699cf3-331d-43d2-be9e-9959f3749132	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE2NTUyMywiZXhwIjoxNzY2NzcwMzIzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.HaK3MtDcKsLFaxoyhERzixM0xnIo1IeqgxYStKfVvMM	2025-12-26 17:32:03.126+00	2025-12-19 17:32:03.128+00	f
a16417ef-51cd-4bee-8d79-d0a72e1bc927	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE2NTg5MCwiZXhwIjoxNzY2NzcwNjkwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.dRh-jtU74n2ALzPteSFdH-4vGc1tRoNFwJCP_fmXYcI	2025-12-26 17:38:10.069+00	2025-12-19 17:38:10.071+00	f
71fddff8-777b-422e-9e0c-0046b0f21e9e	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE2NTkxMSwiZXhwIjoxNzY2NzcwNzExLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.rITXTh9gO7zYGnedICor3TFhKE32ttgI0_ixNBJCDt0	2025-12-26 17:38:31.603+00	2025-12-19 17:38:31.605+00	f
765537a7-2398-448b-95c3-2e3d1ecbc8f0	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE2OTQ0NSwiZXhwIjoxNzY2Nzc0MjQ1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.dgdz66jwlVN8giEQXtKqdQh2IIK1HLN15PGm2rTylJI	2025-12-26 18:37:25.654+00	2025-12-19 18:37:25.656+00	f
a775c780-6d31-4f60-b63d-e3e66bbefe7a	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE2OTYyOSwiZXhwIjoxNzY2Nzc0NDI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.75aFy2inzysf8xJYB9uwSEPi-GCR_FojOOXEJJRzyR4	2025-12-26 18:40:29.041+00	2025-12-19 18:40:29.044+00	f
8417de20-3a77-4bf0-896c-c4a29b3ef192	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE2OTczNiwiZXhwIjoxNzY2Nzc0NTM2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.IKLZ9wVvfvh3oGqXPYxvcT6ks-mGdejjOdTNarqJE-w	2025-12-26 18:42:16.046+00	2025-12-19 18:42:16.047+00	f
7dfd4b4b-2f88-4452-a8ca-7521d0cfb93e	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE2OTgzOSwiZXhwIjoxNzY2Nzc0NjM5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.yC2uFfjqdCpD_hJID0UTgLqxLoHyp3Pj-0AjIkJsXtg	2025-12-26 18:43:59.879+00	2025-12-19 18:43:59.88+00	f
f4f54f18-78bd-4180-8290-ecf28438989a	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE2OTk2NywiZXhwIjoxNzY2Nzc0NzY3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.PiBGLI1kZvfM4pXdnRt_JrS3NjL5LG8Xsl7yAW5Sma4	2025-12-26 18:46:07.977+00	2025-12-19 18:46:07.978+00	f
fa31a309-0220-4550-84e8-1e85db05d8aa	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MDAxNiwiZXhwIjoxNzY2Nzc0ODE2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.lmCPKhZMU-wqkubc4pFmucjQDHA_PhDc6StUeMTJ-nQ	2025-12-26 18:46:56.698+00	2025-12-19 18:46:56.7+00	f
f13a2973-e8a4-40cf-a38b-593eb13ab745	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE3MDE3MCwiZXhwIjoxNzY2Nzc0OTcwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.EY_NLLHtFWrWrGECWKma138GLjUyFag14-bQPAT0ACw	2025-12-26 18:49:30.02+00	2025-12-19 18:49:30.022+00	f
3da920ea-8261-452a-a54b-52b36651783c	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MDE3NSwiZXhwIjoxNzY2Nzc0OTc1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.u1bwZ_iyUEqvRrN-R4DBT9iJ5iHbUCWnr5kZCC96rwI	2025-12-26 18:49:35.08+00	2025-12-19 18:49:35.082+00	f
be998553-b01d-4dff-a8a9-7884bec73d2a	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE3MDE5NywiZXhwIjoxNzY2Nzc0OTk3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.XKkZNcUpYi1uFuBHZ_jCqtJyXxrtAYOKp6qU3Hnhabc	2025-12-26 18:49:57.578+00	2025-12-19 18:49:57.58+00	f
d0c980cc-3766-4182-9562-f6bcf7a9a7b9	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MDIwNywiZXhwIjoxNzY2Nzc1MDA3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.cNpq7x29DGbsHON4CuooTz_i-GyFdWDAH1SFSxoI-Kg	2025-12-26 18:50:07.504+00	2025-12-19 18:50:07.506+00	f
b48a45f1-8adf-4ff7-9053-8f3eaabcdf8c	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE3MDYxNywiZXhwIjoxNzY2Nzc1NDE3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.2vEd9t9QWvW1e7a61REy5ZZX6dbwv2x3o9xlHMmpQqc	2025-12-26 18:56:57.083+00	2025-12-19 18:56:57.084+00	f
cf0f08ad-b2d3-4170-9848-26b0b2ee458b	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE3MDc0NiwiZXhwIjoxNzY2Nzc1NTQ2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.fn2R5bSgy4BeAswxn7h0elAgAMslF4uvHMDd6Kc2Dm4	2025-12-26 18:59:06.327+00	2025-12-19 18:59:06.329+00	f
c36eb85a-14ba-46e6-abb4-cb2e5235bf16	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MDkxNywiZXhwIjoxNzY2Nzc1NzE3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.J-aVITMEAoNaoiHPJqg3GC2b4_IDKpUmoEWfBwlrg7Q	2025-12-26 19:01:57.543+00	2025-12-19 19:01:57.545+00	f
b5bcc94d-9b20-414a-b03e-9e026e5978d6	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MDk0NiwiZXhwIjoxNzY2Nzc1NzQ2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.cOf4hofBXvl6vdXCr1kAGACyabaNCeKE8pCulQbLlzE	2025-12-26 19:02:26.119+00	2025-12-19 19:02:26.12+00	f
a391c3a9-45bd-4d9c-8560-39f80c0cee00	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE3MDk1MSwiZXhwIjoxNzY2Nzc1NzUxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.pO6cowp7uZjFps8WghGAUA9Iy-QQaEyLY2sO0lpid9c	2025-12-26 19:02:31.674+00	2025-12-19 19:02:31.675+00	f
d02d0750-b1dc-4d4d-9279-f1ef32627080	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE3MTE0NSwiZXhwIjoxNzY2Nzc1OTQ1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.zA00vMnplHPtbjINhiTBxpsp0Mp6e93Q-rMg3j11oeg	2025-12-26 19:05:45.496+00	2025-12-19 19:05:45.497+00	f
b2be00df-8adf-46ae-9cfc-f31237a5b0cf	ed4c3bac-dcbc-444c-b887-5fef9f11d05d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZDRjM2JhYy1kY2JjLTQ0NGMtYjg4Ny01ZmVmOWYxMWQwNWQiLCJlbWFpbCI6ImFkdXZpcDIyMjMzM0BnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MTcxMTUwLCJleHAiOjE3NjY3NzU5NTAsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.oaYJWmkAPsjKRCxEGX00dtiWavpJkZvziLqZbrW0vjI	2025-12-26 19:05:50.271+00	2025-12-19 19:05:50.272+00	f
d9ebeca3-fe3a-4fab-aec8-1518e1e1bd69	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MTUzNSwiZXhwIjoxNzY2Nzc2MzM1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.EnZ6eugtvjU1p3Zj3H-OXGpp4i0wA9S4TA1W0FSL18I	2025-12-26 19:12:15.913+00	2025-12-19 19:12:15.914+00	f
b44eeb7d-680e-4634-9f13-2eec82af3bc0	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MTY2NiwiZXhwIjoxNzY2Nzc2NDY2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.7qpq_CCYBCn5teC8JGbMj86P8PV1c21dILRpD1gjY1E	2025-12-26 19:14:26.48+00	2025-12-19 19:14:26.481+00	f
09e5617e-8939-4d0c-ab2f-387f171d200b	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjE3Mjc0MiwiZXhwIjoxNzY2Nzc3NTQyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.XDVp7W0fjv79kx78QkNbQenxUrs_3yLlvTKdh7K57FQ	2025-12-26 19:32:22.01+00	2025-12-19 19:32:22.012+00	f
f912e6b7-5eeb-461d-ae92-86d317a5eed3	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE3MzkzNywiZXhwIjoxNzY2Nzc4NzM3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.0ZwqzRHNEGHK53VRLt_YMre59PiL_vgVEJngasiyNac	2025-12-26 19:52:17.577+00	2025-12-19 19:52:17.578+00	f
7393537e-f23f-4935-9313-5e1e92311dd5	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE5NTk0MSwiZXhwIjoxNzY2ODAwNzQxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.D-ACB0BjCEL5f2r4BeOjvi5JgGVypNuyHwgUSo7Iq5Q	2025-12-27 01:59:01.13+00	2025-12-20 01:59:01.131+00	f
fbfdbb01-4679-4f07-9f27-353d1adcd000	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE5NjMyNCwiZXhwIjoxNzY2ODAxMTI0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.smDew5ep_3bjXKyEt2pH8-Lals87dqCv7e5o97DUQiE	2025-12-27 02:05:24.619+00	2025-12-20 02:05:24.621+00	f
9fd21f8c-7b43-446f-ae57-2ae371d0a291	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE5NjczNywiZXhwIjoxNzY2ODAxNTM3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3_FMPckiJXeidr6_Bsr_QmV5FR2WtrS0TfbGHyH-rSw	2025-12-27 02:12:17.731+00	2025-12-20 02:12:17.732+00	f
43327b03-6bd1-4591-979a-f0bd1098cb60	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE5Njc5MiwiZXhwIjoxNzY2ODAxNTkyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Tsgdd2MYhTxg1In6UXaNbfd8XxfDe8rhxCslxhaXaVY	2025-12-27 02:13:12.988+00	2025-12-20 02:13:12.989+00	f
e83026e5-62fd-42a7-ae96-4118a5914433	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjE5NzMxOCwiZXhwIjoxNzY2ODAyMTE4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.6XiKtQtzDVms2ObM3UlryCVnCmIIwmdEgCcsBR0clSQ	2025-12-27 02:21:58.737+00	2025-12-20 02:21:58.738+00	f
2c17ae79-8f53-408e-bcda-87980736ccd1	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE5NzczNiwiZXhwIjoxNzY2ODAyNTM2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.tQTLmq1Gtj6zX4ZYoiye7UR9Z02QWevwRo_9bnr9kwo	2025-12-27 02:28:56.625+00	2025-12-20 02:28:56.626+00	f
73c883d3-873f-4aae-a288-1001a3306fab	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjE5OTEzNiwiZXhwIjoxNzY2ODAzOTM2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.2pW-MIMet4vddhJx2glGcAaVxNTZ48UkNYFUyZNc3ow	2025-12-27 02:52:16.564+00	2025-12-20 02:52:16.565+00	f
8740d18d-309b-4af4-8cda-5fe2c8712a40	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIwNTE4OCwiZXhwIjoxNzY2ODA5OTg4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.A1IsM7YBp8cCoKi27A9kUufl-qNjBRS8otMLR8wo4Uw	2025-12-27 04:33:08.988+00	2025-12-20 04:33:08.989+00	f
7730e89c-40ac-40a7-9585-7af4069a1afa	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIwOTI2OSwiZXhwIjoxNzY2ODE0MDY5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.fye1baR9lr0q--mcoA_wQrDCD2VoJmCoaeSCOspqiRo	2025-12-27 05:41:09.713+00	2025-12-20 05:41:09.714+00	f
98acc960-c7b5-47bc-aaaf-d9d2faf06a08	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIwOTgwNywiZXhwIjoxNzY2ODE0NjA3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.O-8SN9kl3XxGRV2LKsYswaMWBc9qIpY4bNpEHnBGv6A	2025-12-27 05:50:07.245+00	2025-12-20 05:50:07.246+00	f
7c387a6b-5e15-4c99-81a9-c31ca4e8d387	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIxMTI5NCwiZXhwIjoxNzY2ODE2MDk0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3byV4cmOWTn4rtMfxcCJ1Y-N5-pHsY-9BOOahU2emoU	2025-12-27 06:14:54.898+00	2025-12-20 06:14:54.901+00	f
ad00e41f-187c-485e-83d9-38a1cb39e3cf	003dd505-f023-4e14-b170-a6fe959c42f5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDNkZDUwNS1mMDIzLTRlMTQtYjE3MC1hNmZlOTU5YzQyZjUiLCJlbWFpbCI6ImFkdXZpcDIyMjIyQGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYyMTI3ODksImV4cCI6MTc2NjgxNzU4OSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.gySMxIOyG0fhOy_3XLXH-RlH0auWOFZJGUYOQTuZoXk	2025-12-27 06:39:49.319+00	2025-12-20 06:39:49.321+00	f
d51914ca-fc5b-47cc-9758-3d957eb22a2b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIxNDYzMiwiZXhwIjoxNzY2ODE5NDMyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Gn1_vhuOeJPuj2WneJxfJH-QVPbhejS9qS5vSWzDqb0	2025-12-27 07:10:32.04+00	2025-12-20 07:10:32.041+00	f
f67df47e-18e5-4e3e-9a66-e7bf3468bfeb	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIxNTM1NCwiZXhwIjoxNzY2ODIwMTU0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.hOuOW5TBHj8sBXsA0mTwlB8mcMEothu4f62obzsPhUQ	2025-12-27 07:22:34.75+00	2025-12-20 07:22:34.751+00	f
37a8cf2a-e088-4606-b3e1-753bedd671b7	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIxNTQ1MCwiZXhwIjoxNzY2ODIwMjUwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.QQlInzJApUbLJBR88cStWt8DYiOSSmzEa_t3esgFw2w	2025-12-27 07:24:10.178+00	2025-12-20 07:24:10.179+00	f
57914ec9-63bc-46ef-892b-42d771198083	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIxNTU5MiwiZXhwIjoxNzY2ODIwMzkyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.gooUtfAIfhd308hEUG4vjc5rOqAHHL1Xjb73ArZpY7A	2025-12-27 07:26:32.85+00	2025-12-20 07:26:32.852+00	f
e9e174eb-2478-43b6-9b4b-c1d42f45c025	9db5955a-95d9-41db-b356-8d68cf782aa5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZGI1OTU1YS05NWQ5LTQxZGItYjM1Ni04ZDY4Y2Y3ODJhYTUiLCJlbWFpbCI6ImRhbmdjaGF1YW5oQGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYyMTk0ODgsImV4cCI6MTc2NjgyNDI4OCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.IqagAq9nOtxUKG0ZyvF9TFnSL-pqdwKM6ecC3z3C-4o	2025-12-27 08:31:28.256+00	2025-12-20 08:31:28.257+00	f
004b9b63-ca96-41a2-a32e-706852a39fa8	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIyMDAzMywiZXhwIjoxNzY2ODI0ODMzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.esNGYdAgHDpjpbUecURY-FyoRt-K3Np5SdLdJvTHubk	2025-12-27 08:40:33.482+00	2025-12-20 08:40:33.483+00	f
957127ac-aa5a-48f9-9ba4-e4046d1a9b35	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIyMDY1NCwiZXhwIjoxNzY2ODI1NDU0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.DnZZk_0g5jll_VhB9ItGLNhj7u4z_WfONc9oXOj69Uk	2025-12-27 08:50:54.291+00	2025-12-20 08:50:54.292+00	f
ac584a74-ab08-43a9-b8be-0d91d67b8700	b83b0246-9e3c-4097-b731-ce3f9c19a97e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiODNiMDI0Ni05ZTNjLTQwOTctYjczMS1jZTNmOWMxOWE5N2UiLCJlbWFpbCI6IkNvbmdwaWxvdDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIyMDg3NywiZXhwIjoxNzY2ODI1Njc3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.aBWkAIHIVQJwF2PFYKmz_BsSHOhzxjeCOD0mxsRhH1g	2025-12-27 08:54:37.933+00	2025-12-20 08:54:37.936+00	f
7242465c-0127-497b-94e1-08ad1381ff2d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIyNDc2NywiZXhwIjoxNzY2ODI5NTY3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.aQK3aY7EE2fsLqiAx4rgV7j7S959niF5jtwDSdoi-7U	2025-12-27 09:59:27.345+00	2025-12-20 09:59:27.346+00	f
a549d592-f709-43f2-ab5c-bc86879068df	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIyNjQ3OSwiZXhwIjoxNzY2ODMxMjc5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.P96fm8VFdqWuNWnxFTJrONhzdDRnFY-znKFf5bO_z4s	2025-12-27 10:27:59.029+00	2025-12-20 10:27:59.031+00	f
453322af-52a9-460c-bf74-1758c3278d8e	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIyNjYzMCwiZXhwIjoxNzY2ODMxNDMwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.tBDDYjFikNp9r5M9LnlGfJv1pdeSvhWp5RNY4yvJIsw	2025-12-27 10:30:30.764+00	2025-12-20 10:30:30.766+00	f
5abb6230-a9d4-41dc-99fd-679993b04df5	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIyNzE5MywiZXhwIjoxNzY2ODMxOTkzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.th-ur0F0FW4MIr4zw9uzbGwZg7TwALqS2iHyrtWFgR8	2025-12-27 10:39:53.671+00	2025-12-20 10:39:53.672+00	f
1c505ab6-8c1b-4978-a83a-f184d16bcbdd	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYyMjcyNzksImV4cCI6MTc2NjgzMjA3OSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.ut8QtC54tV9tBq5chQhlEWwf3n2FB8-fw7Jqlr_W0b4	2025-12-27 10:41:19.432+00	2025-12-20 10:41:19.433+00	f
473de381-8be0-4ed8-be17-40c217904765	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIyNzMzOCwiZXhwIjoxNzY2ODMyMTM4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ndadibvU7rdG7csZunI5WCczDPSdtEEldplqEtvSjVM	2025-12-27 10:42:18.514+00	2025-12-20 10:42:18.515+00	f
e99b9270-905d-4fc1-94c0-e2ce28670798	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIzMzg2OSwiZXhwIjoxNzY2ODM4NjY5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.xz46sWEgTY1ExbdaWIogzMSzZ3RAMH8gZ-9a_krryfU	2025-12-27 12:31:09.98+00	2025-12-20 12:31:09.981+00	f
d56fc818-61c2-42ed-ad1b-ecb1ab63f8be	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzMzkzMywiZXhwIjoxNzY2ODM4NzMzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.NgyEXVbB0q9mxpMgDTTnTZp4yjMX9kLNEwo62UEXqQ0	2025-12-27 12:32:13.916+00	2025-12-20 12:32:13.918+00	f
b9414868-bb4b-425e-90a8-c0f29ce0a011	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIzNDA1MSwiZXhwIjoxNzY2ODM4ODUxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.CO0cY3k5WFYIMpFodI1uPNs22ac4TmFpBXK_XroKwZc	2025-12-27 12:34:11.126+00	2025-12-20 12:34:11.127+00	f
d90fcdec-99a4-4051-b15f-b64467c17d8a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIzNDA3NCwiZXhwIjoxNzY2ODM4ODc0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0._VTzsB8Nz8fzVh-l4gl0o4axdtKB3xOIGl_BT0RcI7g	2025-12-27 12:34:34.909+00	2025-12-20 12:34:34.911+00	f
737e0061-42cf-47ae-a580-07ed8253a1c4	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIzNDE2NCwiZXhwIjoxNzY2ODM4OTY0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.hoJNJtIppeEOnE44K_EpfNGXroL0T57g10rfgg6JnQQ	2025-12-27 12:36:04.398+00	2025-12-20 12:36:04.4+00	f
84da002e-e3b0-43fe-9d11-3858ceadd323	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNDE5OCwiZXhwIjoxNzY2ODM4OTk4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.cyzHK9qG9FqYwVqj-nW-m9s5yKlmNPMlNCSbbpk5PsA	2025-12-27 12:36:38.975+00	2025-12-20 12:36:38.977+00	f
27b07c51-215b-4389-aaf9-0f60a8e72026	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIzNDIyOSwiZXhwIjoxNzY2ODM5MDI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.0gJO1eSA3EkobB6jmBwNdef52vhYgyLm1okahi1Rf4Q	2025-12-27 12:37:09.676+00	2025-12-20 12:37:09.677+00	f
a5c551e4-12a2-4c5a-97d5-1082a3f7300c	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNDY1NCwiZXhwIjoxNzY2ODM5NDU0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Fbj2ddeNuyACbFkS9QKzUbbX6ryFPiIBoDrqIDjSos8	2025-12-27 12:44:14.171+00	2025-12-20 12:44:14.172+00	f
2e45e5bb-746c-4f69-8778-e421a011f2bf	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIzNDc1MywiZXhwIjoxNzY2ODM5NTUzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.wUCOVGBRVqIp6g8bcGsXiE_eZ1TXr8GVfctPMN2LC9s	2025-12-27 12:45:53.51+00	2025-12-20 12:45:53.512+00	f
5c657a95-e911-4e0d-83a4-f802a6a0f68d	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNTcxOSwiZXhwIjoxNzY2ODQwNTE5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.LpH3eXgGTNNIn7nmkI13HhEWuwpVX41JqpFcLA6xqEA	2025-12-27 13:01:59.449+00	2025-12-20 13:01:59.45+00	f
179197aa-e34d-4067-8085-a763349333ab	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNTgyMiwiZXhwIjoxNzY2ODQwNjIyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.FQw1CcyxT4Uw8V8fgw5D2qBrsbYWdJedAVgj5qIus4I	2025-12-27 13:03:42.884+00	2025-12-20 13:03:42.887+00	f
6a4dbfc7-dfea-4c69-989d-6eb7cb40b7fa	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNjA0OSwiZXhwIjoxNzY2ODQwODQ5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.st--SCpuNyNZ12ojUSMjSLvLdb_fNPOqRoJ3Tplgcqc	2025-12-27 13:07:29.444+00	2025-12-20 13:07:29.446+00	f
0c7e1d58-c80c-4c68-a2a2-6c315ca1b40b	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIzNjE1MywiZXhwIjoxNzY2ODQwOTUzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.dTnLg3D0ODyAcRPgeRWDHEovMtDkzxJnCvasPDKRq_E	2025-12-27 13:09:13.405+00	2025-12-20 13:09:13.406+00	f
ce322769-b190-4b6b-8e17-f969ad93c10d	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIzNjI3NCwiZXhwIjoxNzY2ODQxMDc0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.QxZsMNfsgizKwK-uQ9lBacS7xk-okb_VTHhJXJgc_Ss	2025-12-27 13:11:14.742+00	2025-12-20 13:11:14.743+00	f
18c56eef-140b-4053-93b8-b0afe1d96b2c	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNjg0OCwiZXhwIjoxNzY2ODQxNjQ4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.BSwkaPskwzye95OPQ_Fo85JHYTFGl8o20R2o4uRsg9o	2025-12-27 13:20:48.082+00	2025-12-20 13:20:48.084+00	f
a8b51226-69ee-4205-bf1a-cbb09a2583c6	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjIzNzkwNywiZXhwIjoxNzY2ODQyNzA3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.MRrIKZFZ49NhAs_RN1elZOTlmayZRUq-yA0Iafi06Dg	2025-12-27 13:38:27.752+00	2025-12-20 13:38:27.762+00	f
9d0bb4a2-92f6-4bb8-b26b-f135a0b0010a	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzNzk1MSwiZXhwIjoxNzY2ODQyNzUxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.V84XS3MLigjHO0mW2TuKkPEK7DltgMPZs12QeorKz_k	2025-12-27 13:39:11.068+00	2025-12-20 13:39:11.07+00	f
b7d03119-3c02-4c19-9e13-bb8e891ce65b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjIzOTc1NiwiZXhwIjoxNzY2ODQ0NTU2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.GEJv2SP5FdlQF4IGBqkpvDsVbUCrtwyFB1g9aUmruhc	2025-12-27 14:09:16.583+00	2025-12-20 14:09:16.586+00	f
e8785f18-1051-4afd-a6b0-220411f0c46b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjIzOTk2MywiZXhwIjoxNzY2ODQ0NzYzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.0c_G2yl679SM-gfPQ5azBPvFRQPV9YQC8Ov-RyLMPT0	2025-12-27 14:12:43.987+00	2025-12-20 14:12:43.988+00	f
7603f6df-40d8-4294-a699-5c5db15869cf	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MDE2NiwiZXhwIjoxNzY2ODQ0OTY2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ZaZzXnJVH3eihL605GYDQxuW0LeFk4ndRRb3Kk_aptY	2025-12-27 14:16:06.755+00	2025-12-20 14:16:06.756+00	f
bd3269c9-a0ef-4494-8a7e-47a24e0a3f4e	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MDMxMCwiZXhwIjoxNzY2ODQ1MTEwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.yQDA1mp4E3AJzLhY4Yj3R-xJJs9WfLsS3uO10E7vfRY	2025-12-27 14:18:30.422+00	2025-12-20 14:18:30.423+00	f
1c2e0503-a5de-413f-8888-ba8322be614f	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MDQ2MCwiZXhwIjoxNzY2ODQ1MjYwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.qKE8IWCn3MxyKZZrcpfyB5lA18_N1JbZLm4M39q1UMw	2025-12-27 14:21:00.85+00	2025-12-20 14:21:00.851+00	f
a4e3d4f4-c507-4773-a8ef-74ee31eec05d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MDU4NiwiZXhwIjoxNzY2ODQ1Mzg2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.SGHHk1ACn4HKEwAXKY8E6tP1olDBBF8c0IjqzWTUu6s	2025-12-27 14:23:06.41+00	2025-12-20 14:23:06.411+00	f
d28e895e-20da-4570-a295-408c0d5475db	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MDczMSwiZXhwIjoxNzY2ODQ1NTMxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.fbAvcV7JGtSPW5nEh7AiHVip_dRKKY5jhxiKdB4CfRs	2025-12-27 14:25:31.374+00	2025-12-20 14:25:31.375+00	f
5586917f-bd6e-423b-abe3-592650348bae	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MTQ1MCwiZXhwIjoxNzY2ODQ2MjUwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.VedxgI55U6NYI95YFWv97af4A_WQ6XYSaAoPNdksxb4	2025-12-27 14:37:30.227+00	2025-12-20 14:37:30.228+00	f
6ef56793-2a13-4f94-8c8f-afcb4e099932	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MTYyMiwiZXhwIjoxNzY2ODQ2NDIyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.NWpkGFmbPNp_7jj-ufP7wnHRIBBPWDl8oqi8FEqfmds	2025-12-27 14:40:22.579+00	2025-12-20 14:40:22.581+00	f
e657cf43-5d72-4285-9db8-b879835d5385	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI0MjAyMCwiZXhwIjoxNzY2ODQ2ODIwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.irzV6x7h8cNhuPrhKvTtC80ZLZnadD5q0LcJYgfHhdg	2025-12-27 14:47:00.967+00	2025-12-20 14:47:00.969+00	f
7d26dd93-3daa-4762-a14e-7b34831bd8d2	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MjMzOCwiZXhwIjoxNzY2ODQ3MTM4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.49iaLarToaeX5-WREBOJHoXIFdU5ojpH7MyJY0orACo	2025-12-27 14:52:18.088+00	2025-12-20 14:52:18.09+00	f
336c5303-7ede-4a06-8cb1-97fcb6a54ef0	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI0MjkwMywiZXhwIjoxNzY2ODQ3NzAzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.SZwZ23LdM0uC4CsGz-zWgYzmPKUQNegUHBanf7TzRe8	2025-12-27 15:01:43.861+00	2025-12-20 15:01:43.863+00	f
d5a37e5d-f6ad-4198-af65-ccb7b5777433	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI0MzQwNSwiZXhwIjoxNzY2ODQ4MjA1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.yl9grytNcmWxkNCxfOUSbNfPuGXyZKFYKIYUwDTbJ0E	2025-12-27 15:10:05.217+00	2025-12-20 15:10:05.219+00	f
36d5a2cf-e70c-4cd9-8961-a56db3d7666f	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI0MzQ5MSwiZXhwIjoxNzY2ODQ4MjkxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.162SXkwIJxLES79IXq7EaslK79jMEZkodcKTSWLFQy0	2025-12-27 15:11:31.992+00	2025-12-20 15:11:31.994+00	f
7e487666-a780-4473-9619-2ad49ba96397	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0MzgzMCwiZXhwIjoxNzY2ODQ4NjMwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.UBReAdLPGitQeUdLrAfMEB-Vq8nuyBVnH3iowOh2P-c	2025-12-27 15:17:10.111+00	2025-12-20 15:17:10.113+00	f
d6237011-d712-44d7-a31d-f06c92514e76	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0NDI4NSwiZXhwIjoxNzY2ODQ5MDg1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.YhORDDHdqFYjjMXSq_OXpEIDneTvpJ4S3TUk8oM4Ias	2025-12-27 15:24:45.658+00	2025-12-20 15:24:45.662+00	f
b30b27ee-6887-4329-b4ac-8cedbaea9dcd	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI0NDMxMiwiZXhwIjoxNzY2ODQ5MTEyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Bty4Pqn2vu00uolWI1Ww6R7nY_CrAYasU29VD_jfTiU	2025-12-27 15:25:12.333+00	2025-12-20 15:25:12.334+00	f
59c24e0a-6663-4e1e-805e-808a3c93389f	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI0NDM5MywiZXhwIjoxNzY2ODQ5MTkzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.xCT6gZfN3pI8fR64uv2VxmMRR-XBsqoJeYnX98mW-5U	2025-12-27 15:26:33.295+00	2025-12-20 15:26:33.298+00	f
eaa96b9e-c924-46f3-af5c-7a71967191d1	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0NDQ3NCwiZXhwIjoxNzY2ODQ5Mjc0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.p2TZz-d8bbo4Gu7hnFUPtgJ-WQmCJiJa84SqXtyOlJI	2025-12-27 15:27:54.583+00	2025-12-20 15:27:54.584+00	f
000f2908-c3e8-4a77-9fa9-26c5e70e441d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0NjA4MywiZXhwIjoxNzY2ODUwODgzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ib8-bH71XGgdkAZMBmyBOsGmrOaM3Zpqc_6nakjfB68	2025-12-27 15:54:43.048+00	2025-12-20 15:54:43.057+00	f
4bc1a0d0-57ce-44dc-8980-c78f08b0f522	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYyNDYyMDAsImV4cCI6MTc2Njg1MTAwMCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.VjweC4OjkBci85CrC0R9Z-5ogczigdNAXwK63oAv4uw	2025-12-27 15:56:40.821+00	2025-12-20 15:56:40.822+00	f
2ab4358c-91ae-45dc-83fc-e40f70989f1a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0NjMxNiwiZXhwIjoxNzY2ODUxMTE2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.0YnWf7J7iHjtaCClnqtAw1fHZ4wLkwCvuTSOv0SVWF8	2025-12-27 15:58:36.034+00	2025-12-20 15:58:36.037+00	f
104e6b30-ed13-4707-9ed2-8747997f7189	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYyNDY4ODksImV4cCI6MTc2Njg1MTY4OSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.iMNU4VZBWNUEfLxL6jbT28itGKFaitOcB0HH9zN77kE	2025-12-27 16:08:09.833+00	2025-12-20 16:08:09.834+00	f
d08a906f-f32f-4632-8b81-7c6e42628a10	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI0NzUwNiwiZXhwIjoxNzY2ODUyMzA2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.UqWKRDzcQ-jEuxdWA0PrQLZxLaXSoIUqVt25zo6vhLI	2025-12-27 16:18:26.48+00	2025-12-20 16:18:26.485+00	f
ddc5b02b-3b8b-4e14-ad58-605a36fe1204	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI1MTIwOSwiZXhwIjoxNzY2ODU2MDA5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ZVJaN5AkcMbUO8KVCqdhpGhwWRt533-WqTet7Ox9HTk	2025-12-27 17:20:09.661+00	2025-12-20 17:20:09.662+00	f
500f3516-8a5f-45c8-be85-51ae9681bc95	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI1MTkyMiwiZXhwIjoxNzY2ODU2NzIyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.6r-ZHat73TgMTkd-vkAUmc2TwCeATRsVL87exS8EAks	2025-12-27 17:32:02.521+00	2025-12-20 17:32:02.522+00	f
0acc8452-57c7-4a9b-9b30-6c3e5dbd1ce0	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI1Mzg3NCwiZXhwIjoxNzY2ODU4Njc0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.sppGCd2TaPSitAeJJp1k5JmtzxjIFjHGBT3qFKDcLWk	2025-12-27 18:04:34.955+00	2025-12-20 18:04:34.956+00	f
ab05df10-85bb-487b-9508-7cae743ad1ba	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI1NTgwNywiZXhwIjoxNzY2ODYwNjA3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.bjw_yR9ZNkn1gVhAPy25sk9cgb_a0NlN5OOV7t-9BBs	2025-12-27 18:36:47.356+00	2025-12-20 18:36:47.359+00	f
04102209-6bec-4dfd-ae1c-c6a1782609dc	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI1NzcxNCwiZXhwIjoxNzY2ODYyNTE0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.rLjSQgAFAlEjDIv2iXfDdRUhLkvr-VJjH6JQU4faw84	2025-12-27 19:08:34.43+00	2025-12-20 19:08:34.432+00	f
3094a8d0-77c0-4060-85d6-25f088676bfd	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI1Nzk4MCwiZXhwIjoxNzY2ODYyNzgwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Dn0ivgY8MHu28qf7YL3jfC_EGvBpSE1oH2luQPmdzJc	2025-12-27 19:13:00.908+00	2025-12-20 19:13:00.91+00	f
c574ed7a-c310-4a3d-866f-edf9ba820283	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI1ODA3OSwiZXhwIjoxNzY2ODYyODc5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.b3N7MsKs5K1EUrtSzLuzV418UNiCuDU0rauJ3vf41WU	2025-12-27 19:14:39.097+00	2025-12-20 19:14:39.098+00	f
aa02f3e3-0e7a-4951-abb0-cba829c683c1	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI2MDIwMywiZXhwIjoxNzY2ODY1MDAzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.wcoY-Juvjyrv-ys48WEg3H0fuDmMDr-ZpbTVFGUInSU	2025-12-27 19:50:03.779+00	2025-12-20 19:50:03.781+00	f
80abd604-6d17-43a3-ac05-7ebf714ea8dd	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI2MDM1NiwiZXhwIjoxNzY2ODY1MTU2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.FGKJURGG1rE9t1Ys7xl9p8LstjjRcT7tsUYvpsobtJY	2025-12-27 19:52:36.791+00	2025-12-20 19:52:36.793+00	f
f9009674-181e-4feb-a359-494c866adfb5	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI3MDU2OCwiZXhwIjoxNzY2ODc1MzY4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.86ok0ncbp5pgaxtsRJM-Jon4bjs1Q05sRR33aZi3FNA	2025-12-27 22:42:48.184+00	2025-12-20 22:42:48.186+00	f
85a71afb-2dc3-4130-91ba-76df9df467ad	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI3MDYyMCwiZXhwIjoxNzY2ODc1NDIwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.R8xQhsuOdHBLUivRy5joqmCl8hhaS28vo3mVCvNX6fQ	2025-12-27 22:43:40.406+00	2025-12-20 22:43:40.408+00	f
bd03f705-772c-4c19-a5b1-4312d3e20aa5	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI3MDY4MCwiZXhwIjoxNzY2ODc1NDgwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.bSCNVwOi6KvdRTAlspIntkKkTZXmNIzYLLUo5b0Ki54	2025-12-27 22:44:40.495+00	2025-12-20 22:44:40.497+00	f
c7dc9eef-97ad-4972-8bc1-dffbd3ada351	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI3MTU2MSwiZXhwIjoxNzY2ODc2MzYxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3OaFm7BRtY2Ff6d7LIgG3ceNkWVkb4RkU3mPVuLYkJY	2025-12-27 22:59:21.949+00	2025-12-20 22:59:21.95+00	f
586d5cb3-b9f2-4036-b501-03f118ebfe93	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI3MTg4OSwiZXhwIjoxNzY2ODc2Njg5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.HtlpOL2x1pXKfUDWNIA9QUzwrOXHYnIdnW_6dRHb8VU	2025-12-27 23:04:49.063+00	2025-12-20 23:04:49.064+00	f
272447a2-4cad-4fce-91b7-ecbefb455951	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI3MjUxOCwiZXhwIjoxNzY2ODc3MzE4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Ja1-TMqVAOzK69LIjZNKQ7gbnXFKY04SHJZI83wYHiw	2025-12-27 23:15:18.416+00	2025-12-20 23:15:18.419+00	f
25c1aafa-888c-4fbb-91d3-31ab6a2bec17	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI3NTE1NywiZXhwIjoxNzY2ODc5OTU3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.j0o6iB7USAZ3l0d9jWloXMK0Htwmwe9sYMKVcf_mR18	2025-12-27 23:59:17.762+00	2025-12-20 23:59:17.763+00	f
131db82d-2623-4369-9ec1-0e97bb2ce34a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI3OTc5MywiZXhwIjoxNzY2ODg0NTkzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.8CIQwxZkqL5Fh7uMMgwyVCYjAXv-EDWmWf5CFd6AOMs	2025-12-28 01:16:33.077+00	2025-12-21 01:16:33.079+00	f
e00219aa-45d3-491b-ab71-e1a52ee00075	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYyNzk4MzksImV4cCI6MTc2Njg4NDYzOSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.94ishayjfN1Slhu0eMlKDawIFNQnlYcAtuQXRq8Sc08	2025-12-28 01:17:19.532+00	2025-12-21 01:17:19.533+00	f
c1ff90b9-9ffd-4085-95cd-fcb7fd710224	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4MDM0MywiZXhwIjoxNzY2ODg1MTQzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.dJcgVAgQDMrvVOkDlyjWooI_iPJrTIsklylI-rIDuYc	2025-12-28 01:25:43.301+00	2025-12-21 01:25:43.303+00	f
4b811764-4e92-4c00-8967-34bb3db3fb4d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI4MDUzMSwiZXhwIjoxNzY2ODg1MzMxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.fN0tIiK86QyskBg4ExE20tE8BtTwt9tiklk9lTQto8M	2025-12-28 01:28:51.38+00	2025-12-21 01:28:51.382+00	f
e4056e3e-1e82-4141-8334-e505674529f9	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4MDcyMywiZXhwIjoxNzY2ODg1NTIzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.CCs43BaAiFs_xQpqDZ0m0qNk_Q87_YSv9cVfwA6QUxE	2025-12-28 01:32:03.802+00	2025-12-21 01:32:03.804+00	f
2ae859fe-b687-492e-a92c-112ef59c36c4	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI4MDkyNCwiZXhwIjoxNzY2ODg1NzI0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.pMSqrIxWgQdSOto0bvC67IP5R1-xfQJpE1M9rwO-V54	2025-12-28 01:35:24.298+00	2025-12-21 01:35:24.299+00	f
f612b404-bcfd-4559-82fb-012c585f872e	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4MTgzNCwiZXhwIjoxNzY2ODg2NjM0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.xS7mnD-ctquw-Iv44gmZH_t9slpCPcGo10Ybt5xkrGM	2025-12-28 01:50:34.613+00	2025-12-21 01:50:34.615+00	f
d54e067e-2f04-45c5-8d6c-e48f205aa79b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4MjExOCwiZXhwIjoxNzY2ODg2OTE4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.f4RisOyoDLd9kcaf6Iv6l1pjeZbEsGJKF6Bh98Z4Emg	2025-12-28 01:55:18.227+00	2025-12-21 01:55:18.228+00	f
424befe4-3e18-45ac-ae6e-518672bc40c8	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI4MjU2OSwiZXhwIjoxNzY2ODg3MzY5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.CPWHCozJRC5Kg-GYzgOMqdpMZFMav6a3-R8NdAXYKPU	2025-12-28 02:02:49.9+00	2025-12-21 02:02:49.901+00	f
6253f05a-20ba-4b92-b8c4-d56b6c693928	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI4Mjc1NSwiZXhwIjoxNzY2ODg3NTU1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.VEOizAQhw4GFzGbFltWUjIkTiYlFu0DOqQlDUpTwd54	2025-12-28 02:05:55.916+00	2025-12-21 02:05:55.918+00	f
a872ab0f-1ce8-4060-b4ee-7fa25c68e575	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4Mjg3MywiZXhwIjoxNzY2ODg3NjczLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Tzt0SW5gjAgx82AbIEf1rRJyHoaIaEigmnlvu6YkTbQ	2025-12-28 02:07:53.633+00	2025-12-21 02:07:53.634+00	f
34d4f4d1-1dd1-4bb2-b9ed-a9e81cfba3b0	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI4NDU2MCwiZXhwIjoxNzY2ODg5MzYwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3MEtOthJhThMolUmU1lC8-g--IXSmQXk8gXihuS5iy4	2025-12-28 02:36:00.868+00	2025-12-21 02:36:00.869+00	f
319fb920-f994-40f1-9563-e12bcd65d777	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4NjA3MCwiZXhwIjoxNzY2ODkwODcwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.wjxSNGztciNTRcBzlUQuB-4gWU8tjBBtAwcCecQBSHw	2025-12-28 03:01:10.492+00	2025-12-21 03:01:10.494+00	f
341da858-d97f-475d-84ba-682abb3e5a63	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4ODUzOSwiZXhwIjoxNzY2ODkzMzM5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Vex95RUfYrKNVEn5MbNbQsTI0iaVqN1LvqZY1LOiE3Y	2025-12-28 03:42:19.725+00	2025-12-21 03:42:19.727+00	f
404f289e-4f0e-4ff8-aedf-d6a410d404da	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI4ODU1NiwiZXhwIjoxNzY2ODkzMzU2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.gTTAV88r5fH9XrBABRdEJe6nNRPBkfPCyXF8uUIiqVA	2025-12-28 03:42:36.896+00	2025-12-21 03:42:36.897+00	f
ef0d16b5-76d5-43a6-b509-a547365caaf9	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI4OTUxMiwiZXhwIjoxNzY2ODk0MzEyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ll1qmZ8bFqU6L7v5_NZx4NttH2fg5FY8zp1U5Ef_P50	2025-12-28 03:58:32.084+00	2025-12-21 03:58:32.085+00	f
1d80f520-0f22-4c2e-962e-ecb12c5b7471	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI5MDcyNywiZXhwIjoxNzY2ODk1NTI3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.wZjO_FwxP-a0ik9F7OjNRQGsrZmnGOxeiulQR9RQCdA	2025-12-28 04:18:47.969+00	2025-12-21 04:18:47.97+00	f
f370f98a-61e0-4f97-afff-65e1404ffef1	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI5MzE3OSwiZXhwIjoxNzY2ODk3OTc5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.-0BptBh3VEvN7HflpHm_VW99mQAXKD3j4pJIiRYxVw4	2025-12-28 04:59:39.859+00	2025-12-21 04:59:39.861+00	f
df03b178-180e-4a56-98c5-f00450482ef2	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI5MzE5NiwiZXhwIjoxNzY2ODk3OTk2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.MRXgUXP7oHx1xKuf2BxBsTa8nfwfiUU1x4IjZqISPeY	2025-12-28 04:59:56.67+00	2025-12-21 04:59:56.672+00	f
7b675b37-7478-4680-9c6b-f6b3c12d5300	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI5MzU0MiwiZXhwIjoxNzY2ODk4MzQyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.mLz6ARGyzWd2l-FRIbkjeDb46Z8jaTuJk7ZQyUMcZ00	2025-12-28 05:05:42.712+00	2025-12-21 05:05:42.713+00	f
0ffa1532-621f-4233-8e6c-d9f60a98266b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5NDE0MywiZXhwIjoxNzY2ODk4OTQzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.OPkGZ3RXsX9nQ88cIaB3qYQo4Pq2vwoll5kYk8yI9YY	2025-12-28 05:15:43.7+00	2025-12-21 05:15:43.702+00	f
a3300d9e-5c78-4834-93b0-0038c5571844	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI5NDI0OCwiZXhwIjoxNzY2ODk5MDQ4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.cy3oJ5Ty6Se7I3SGj2PkqNuQ-vF9ShHfKa5F2iEMMB4	2025-12-28 05:17:28.669+00	2025-12-21 05:17:28.67+00	f
58ad06c6-21f6-40e7-88fe-2275e78515b9	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5NDUyOSwiZXhwIjoxNzY2ODk5MzI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.TX8yLFj8louSIpHK9l6m-eZJ47Ir2pPW0ANZnHwIUHA	2025-12-28 05:22:09.701+00	2025-12-21 05:22:09.703+00	f
f3e36721-efd6-47ba-a6ae-190d750cac17	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI5NTk0MCwiZXhwIjoxNzY2OTAwNzQwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.J2-TibCLxcR1bQ6cwTnPHxyb_MGAeQKxAUafGQ6xEfg	2025-12-28 05:45:40.16+00	2025-12-21 05:45:40.162+00	f
9c0d0679-a698-4a85-a292-e1f72b73bb19	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5NjIwNiwiZXhwIjoxNzY2OTAxMDA2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.W_eltiAxoCe_o5Y4OiNRI_urlofZYXBan2C-wVZgUqs	2025-12-28 05:50:06.851+00	2025-12-21 05:50:06.852+00	f
c3b4d4d1-62d6-4a2a-af23-93b39fb3540f	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI5NjMzNywiZXhwIjoxNzY2OTAxMTM3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.CfTVyKOY_JPzLLxUa6QwUxVOMuAB0xUVer8LKo3A8tI	2025-12-28 05:52:17.248+00	2025-12-21 05:52:17.25+00	f
86193e61-95d3-42cf-9537-67fab1ff3223	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYyOTczNDgsImV4cCI6MTc2NjkwMjE0OCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.c6eK6MgNV72p7_knFcvUFes02KyN-V42uSbYfkfbyUA	2025-12-28 06:09:08.828+00	2025-12-21 06:09:08.829+00	f
e2570be9-6827-40b8-b1a7-fc942a8d6014	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5ODEyMiwiZXhwIjoxNzY2OTAyOTIyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.BdKwNhgfZeIvK6MrJifmZ3oUP0xE_FIj9gV85A0jKTw	2025-12-28 06:22:02.771+00	2025-12-21 06:22:02.772+00	f
30b839c5-0e3b-4d03-92aa-b74fc79695d0	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI5OTMyNCwiZXhwIjoxNzY2OTA0MTI0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.yuhyu_6lBPSQpO8EJa4yCdGRfE90dtHje2tf3klzMl0	2025-12-28 06:42:04.694+00	2025-12-21 06:42:04.697+00	f
0e87ad81-4734-4e48-a76d-1e2f681ab545	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5OTUyOSwiZXhwIjoxNzY2OTA0MzI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.mAVhGVK_MN1X_YL0ci7Htfogq6GZjbtrvREiRPITFTs	2025-12-28 06:45:29.796+00	2025-12-21 06:45:29.798+00	f
4d791947-9234-4bd1-bec8-e9b5e0192379	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI5OTU2OSwiZXhwIjoxNzY2OTA0MzY5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ILCen86CDQR4Skk0FLsw72oZ9_aNkfsAvUUx80OJUFg	2025-12-28 06:46:09.036+00	2025-12-21 06:46:09.038+00	f
c11227f4-cfd4-4fd8-9354-9ae36c4093fd	aec2f26e-58ff-4b6b-b675-d1288893db72	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZWMyZjI2ZS01OGZmLTRiNmItYjY3NS1kMTI4ODg5M2RiNzIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3N2FAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5OTU5NiwiZXhwIjoxNzY2OTA0Mzk2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.o4DcW3IZpbIJ4GjlwZxHdC5vAe2Q1bW_jRFo38Gc9lc	2025-12-28 06:46:36.8+00	2025-12-21 06:46:36.802+00	f
d7981d4a-e10c-4e49-b928-e0092caf6340	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5OTY0NCwiZXhwIjoxNzY2OTA0NDQ0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.b9DO7uQs7Cg0vWvoqgXHPWFxRW9lrEgezaGv_yrKiuo	2025-12-28 06:47:24.956+00	2025-12-21 06:47:24.957+00	f
d6a96f23-221e-4eaa-a4df-7c248428b012	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjI5OTc4MywiZXhwIjoxNzY2OTA0NTgzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.sj6UC0VVIrzoQRxfO38kbmxCiTknzk0g8O5L1EIQZfU	2025-12-28 06:49:43.184+00	2025-12-21 06:49:43.185+00	f
7718af74-a762-4e30-88f6-59548ddc55ea	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjI5OTgwOCwiZXhwIjoxNzY2OTA0NjA4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.-G5xJa3biYEmeW3GNx-V1QKLMhg_w4n0nfVCLEJEGEs	2025-12-28 06:50:08.563+00	2025-12-21 06:50:08.565+00	f
6e09234a-9600-43cb-b790-2b8cf50e6757	e10c836a-412c-4464-bb07-1804d6edc524	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTBjODM2YS00MTJjLTQ0NjQtYmIwNy0xODA0ZDZlZGM1MjQiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3OWFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5OTg0MywiZXhwIjoxNzY2OTA0NjQzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.zQcz1je1jm6GHEiYyOkN_Vd0zNRdEu3pzjM-Tbnj4_8	2025-12-28 06:50:43.897+00	2025-12-21 06:50:43.898+00	f
cfeba779-023d-4f37-bf11-3aacbc739fc4	e10c836a-412c-4464-bb07-1804d6edc524	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTBjODM2YS00MTJjLTQ0NjQtYmIwNy0xODA0ZDZlZGM1MjQiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3OWFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5OTkxOSwiZXhwIjoxNzY2OTA0NzE5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.H3cZoNH3lhmskly1GQHE7C6S7h_CrzugZ_8WskuZawc	2025-12-28 06:51:59.603+00	2025-12-21 06:51:59.605+00	f
9da9b05c-27d5-4fe5-ab3d-f3db0e863e74	e10c836a-412c-4464-bb07-1804d6edc524	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTBjODM2YS00MTJjLTQ0NjQtYmIwNy0xODA0ZDZlZGM1MjQiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3OWFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjI5OTkzMSwiZXhwIjoxNzY2OTA0NzMxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.RtQSyCROKIyvlAfzhMv0bx4f9ZXeSrqoYyGkqKfcUuo	2025-12-28 06:52:11.681+00	2025-12-21 06:52:11.685+00	f
44710f74-b17b-46ab-aeb7-81f299a5c6ac	e10c836a-412c-4464-bb07-1804d6edc524	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTBjODM2YS00MTJjLTQ0NjQtYmIwNy0xODA0ZDZlZGM1MjQiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3OWFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMDE1NywiZXhwIjoxNzY2OTA0OTU3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.581CwE0deP9wVfUbgngfKZSjOOoBLvQ4zvAbMAdiabY	2025-12-28 06:55:57.41+00	2025-12-21 06:55:57.413+00	f
d417d35a-6bf6-4235-81b8-5f0c0ac292ce	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMDQzMiwiZXhwIjoxNzY2OTA1MjMyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.QM0q4mTqcz26U2TwT3SAJ8KPieynrM1GollJT3a0LXI	2025-12-28 07:00:32.501+00	2025-12-21 07:00:32.503+00	f
147efa34-c02c-4b9f-a70d-d4a0298935f1	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwMDQ0MywiZXhwIjoxNzY2OTA1MjQzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ba8ESwmU7FGNNQ7i-DbTGIdtxU9bJ2bAZ1TPnVNn6-A	2025-12-28 07:00:43.008+00	2025-12-21 07:00:43.01+00	f
cfe87a42-92d3-4b44-827c-228321950162	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMDQ3NiwiZXhwIjoxNzY2OTA1Mjc2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.1KLYOKfB5OId69QJ2OxKvWaxcOXKDR2Y25Ft9QF-nQ0	2025-12-28 07:01:16.576+00	2025-12-21 07:01:16.578+00	f
af7df52d-fab6-4575-8202-fab2bfe1b4f7	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMDcyNCwiZXhwIjoxNzY2OTA1NTI0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Jt6mzun2VgQkSY-y7qr78LCS7oKwJESXdPtejxBy92A	2025-12-28 07:05:24.868+00	2025-12-21 07:05:24.87+00	f
5a23fa75-b7d5-427c-bb4f-616aaed98f4f	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMDk0NiwiZXhwIjoxNzY2OTA1NzQ2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.FyURa0yAJNt0NGmJtug5Fyx4riOwMK7qc7EJzjZ-WUo	2025-12-28 07:09:06.945+00	2025-12-21 07:09:06.947+00	f
4f95ef9d-fbe2-4298-b4b2-fbfd5027fc67	e10c836a-412c-4464-bb07-1804d6edc524	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTBjODM2YS00MTJjLTQ0NjQtYmIwNy0xODA0ZDZlZGM1MjQiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3OWFAZ21haWwuY29tIiwicm9sZSI6ImV2ZW50X21hbmFnZXIiLCJpYXQiOjE3NjYzMDEwMjUsImV4cCI6MTc2NjkwNTgyNSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.uxRLDo1LWD_bYFM63aKqQ0ofR6E4l1eqrYfgw4zPhiQ	2025-12-28 07:10:25.513+00	2025-12-21 07:10:25.516+00	f
84940b0e-c081-4c05-9c6e-abd4c6e53879	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMwMTEyOSwiZXhwIjoxNzY2OTA1OTI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Unw3R1PFJUUFKbxfCtY0jQAhuCaZwopDPLvrncHlIV4	2025-12-28 07:12:09.549+00	2025-12-21 07:12:09.551+00	f
25835686-1412-4c52-b38b-6f057d0c8226	e10c836a-412c-4464-bb07-1804d6edc524	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTBjODM2YS00MTJjLTQ0NjQtYmIwNy0xODA0ZDZlZGM1MjQiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU3OWFAZ21haWwuY29tIiwicm9sZSI6ImV2ZW50X21hbmFnZXIiLCJpYXQiOjE3NjYzMDExNTEsImV4cCI6MTc2NjkwNTk1MSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.71hmJlk7Omep6vLoByedXE1xsX2XzFNR6mFf-1tt4lM	2025-12-28 07:12:31.584+00	2025-12-21 07:12:31.585+00	f
d94c5ab4-d2c4-426b-be14-556c531f5477	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMTQwOSwiZXhwIjoxNzY2OTA2MjA5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.gkMM0-qMG0xvnkyppwBZwBk5UAEoB_kQ0JKK1OZDGv0	2025-12-28 07:16:49.141+00	2025-12-21 07:16:49.142+00	f
440aa4e7-9e43-4d26-a1af-bd7323536b83	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMjU2MiwiZXhwIjoxNzY2OTA3MzYyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.15R0888wQM4UZbF2ia_12H9vxftEVqfuZiI2uORrOtc	2025-12-28 07:36:02.452+00	2025-12-21 07:36:02.454+00	f
f45e62b1-b178-4cc7-95a9-02fd1d0124aa	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwMjczNCwiZXhwIjoxNzY2OTA3NTM0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.QpgDvTddxu1OKhZRWf4It84-uZYbQFWKJIuJYekHfP0	2025-12-28 07:38:54.743+00	2025-12-21 07:38:54.745+00	f
61d6a9a8-ec98-4504-aa34-3c1de230bb17	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMwMjg3NywiZXhwIjoxNzY2OTA3Njc3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.zGklXMGQ9wCu_m2jxXw01EMFVPUtktb0aykxA16LXGE	2025-12-28 07:41:17.36+00	2025-12-21 07:41:17.361+00	f
bcb20979-2bd7-4d3b-ad03-81a70b67164b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwMjkxMCwiZXhwIjoxNzY2OTA3NzEwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.alwxQ18_yxXYPpY8LLh8fnjIazpfmy2aENjs5otNdMI	2025-12-28 07:41:50.697+00	2025-12-21 07:41:50.698+00	f
5bc65964-4ecb-4986-98f7-493e4875258b	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMwMzAyMywiZXhwIjoxNzY2OTA3ODIzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.djrjDD17Y7TxxQ1lnRYTuwZu-mMXH9zWy4aIxQisoR8	2025-12-28 07:43:43.63+00	2025-12-21 07:43:43.632+00	f
af28c3b3-41b8-4374-a97d-e1178268acf7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwMzAzNiwiZXhwIjoxNzY2OTA3ODM2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.FSjT19R8HMBe3oMJPy-acq46FVn8B7Xh1vik509E5Yc	2025-12-28 07:43:56.859+00	2025-12-21 07:43:56.861+00	f
00f273cd-e90f-4a18-bc38-bd9d14185331	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMzA0NiwiZXhwIjoxNzY2OTA3ODQ2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0._QXMgzBU_r2lpummdTJCDUBbHC9h7Sezd4cyBALYTdk	2025-12-28 07:44:06.586+00	2025-12-21 07:44:06.587+00	f
ada09b21-2a83-4dce-91f1-057c3cf9608e	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMzA2NiwiZXhwIjoxNzY2OTA3ODY2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.USo1ohAV0_Roo1RXLFHBYogIyQMEUfL5VpoobT7OjxY	2025-12-28 07:44:26.178+00	2025-12-21 07:44:26.18+00	f
7a78f920-8f88-45c3-af3d-0f23d2d31a1d	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwMzI1NywiZXhwIjoxNzY2OTA4MDU3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.eXW1_d_h5i6imPEIecoSV9Jn3NBqq7g7wq_DnyR8S_E	2025-12-28 07:47:37.81+00	2025-12-21 07:47:37.811+00	f
36c731ac-dd19-4c0d-af91-2e269f1b1d77	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMzk0MCwiZXhwIjoxNzY2OTA4NzQwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3k-00QSjR9YzdOV8t3xaKgdm5D4-b30DWV5a2CpltEw	2025-12-28 07:59:00.765+00	2025-12-21 07:59:00.766+00	f
00705058-176c-44c0-97cd-fa8f5b3b3cae	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwMzk4NywiZXhwIjoxNzY2OTA4Nzg3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.4PAfWcIKVqhrqmeVCoQgklPBUoPb9A-xAa6_Poagspg	2025-12-28 07:59:47.069+00	2025-12-21 07:59:47.07+00	f
0d7cab7d-02f5-45bf-9362-b4978fd42338	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwMzk5OCwiZXhwIjoxNzY2OTA4Nzk4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.w6BSTzsC5UNQZ__kLdwFgdJY7XOmnQo46f9pJJIEHdc	2025-12-28 07:59:58.881+00	2025-12-21 07:59:58.882+00	f
fef5de03-df41-4773-a912-d9527a03b357	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMwNDQ1NCwiZXhwIjoxNzY2OTA5MjU0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.YdV78SErjdIFLNLRTn-oudA2CXKLTlh6Wz4YiTRW0sE	2025-12-28 08:07:34.116+00	2025-12-21 08:07:34.117+00	f
8fcb9556-2752-4a7f-85ab-35602ccf5730	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwNDYzMCwiZXhwIjoxNzY2OTA5NDMwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.NV8oEl--ypmTmbkJfKgx0P1JPsbtGRvd3QsDQbYnB5s	2025-12-28 08:10:30.451+00	2025-12-21 08:10:30.453+00	f
e5fc708d-a279-48b4-b892-a47c3404f01c	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwNDY1OSwiZXhwIjoxNzY2OTA5NDU5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.dn5TCM15QS_PLAFLKJ-uxtgUQzhrXNXZoYuW-ZxCPks	2025-12-28 08:10:59.892+00	2025-12-21 08:10:59.893+00	f
e9f1bd31-30b2-483b-8f39-a43b13d6c9ae	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwNDc3NywiZXhwIjoxNzY2OTA5NTc3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.4oxYpkCWYi3hYkoHDFlUImY8aisprWZIGeZoC0YF3Rc	2025-12-28 08:12:57.247+00	2025-12-21 08:12:57.249+00	f
ec9ce017-0bcb-42bf-920c-6414a4d8c716	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwNTcwOCwiZXhwIjoxNzY2OTEwNTA4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.hvLPa7oLUXByTvA1DtotzfLqNhP6IzhW5_gVF4lTTSg	2025-12-28 08:28:28.651+00	2025-12-21 08:28:28.652+00	f
e8a89f00-64ba-4787-b4e7-0012d47759f5	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwNjg3NCwiZXhwIjoxNzY2OTExNjc0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.8ljImv2NZIWRcydqb2_-DzZLVApMI-u3-Ceh72UmpAQ	2025-12-28 08:47:54.586+00	2025-12-21 08:47:54.589+00	f
6db39520-a5fe-414e-86da-d8e006113f57	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwNzUzOCwiZXhwIjoxNzY2OTEyMzM4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.roe644CvhMjzl14ME5xHce3EqlULgP5WDPVaHPLOv2M	2025-12-28 08:58:58.353+00	2025-12-21 08:58:58.354+00	f
61fa8f92-aaf2-40d9-9056-b2286990a82a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwODM4MSwiZXhwIjoxNzY2OTEzMTgxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.f8eUXo7qK8q1DpELuPZp_593tkx6MZQ9TJMDYTOPJcU	2025-12-28 09:13:01.68+00	2025-12-21 09:13:01.681+00	f
d1047fe3-3f79-4e87-8aa3-de6a7c1bdc1c	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMwOTMwNCwiZXhwIjoxNzY2OTE0MTA0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.frERG2lFOXr4AXQGsNh-vBOhEwGt8PgooLpVs9tamQY	2025-12-28 09:28:24.813+00	2025-12-21 09:28:24.815+00	f
36b7ba5b-c3c1-46ad-aaeb-c49b714c5454	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMwOTkzNywiZXhwIjoxNzY2OTE0NzM3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.lcCDtdSSlFug8ZaGr7JLhGJU3GEj9rLRMnGNg7cWgOQ	2025-12-28 09:38:57.138+00	2025-12-21 09:38:57.14+00	f
90535e5c-ca00-4736-9acb-4152f61d074b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMwOTk1MSwiZXhwIjoxNzY2OTE0NzUxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.CzUkGYkgpcdlbQZA0bqyzTsa8TLONNY8sHvIqAsISZQ	2025-12-28 09:39:11.432+00	2025-12-21 09:39:11.434+00	f
a43eb5c3-9fd2-4ccc-a455-ca595476fdc2	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxMDQ3NCwiZXhwIjoxNzY2OTE1Mjc0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.9tTUNli18zVkNnt1PCVKggszH7-0T4jrkrxGt6F4jpE	2025-12-28 09:47:54.986+00	2025-12-21 09:47:54.988+00	f
10438841-3d76-45e5-b4e0-1b864bb57e12	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxMDY0MCwiZXhwIjoxNzY2OTE1NDQwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.l3shVrhJdsXLmW9m4OABAA8ZOnnNLrTofk-PHyK7y0s	2025-12-28 09:50:40.429+00	2025-12-21 09:50:40.431+00	f
222714cd-e567-4499-95ef-52a519a1a343	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxMDgzMCwiZXhwIjoxNzY2OTE1NjMwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Nlje3WBcRzSukTbY7M2O9ip58R0DE2PtCoiir0Pg8OY	2025-12-28 09:53:50.598+00	2025-12-21 09:53:50.599+00	f
f82d06fd-b6b2-43cb-bb33-a56ed179abe8	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxMTI1NCwiZXhwIjoxNzY2OTE2MDU0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.HxtfFwvShKrajW3v98hddN4F5Ixg618Nc5FRP_jndmk	2025-12-28 10:00:54.316+00	2025-12-21 10:00:54.317+00	f
65411911-830d-431f-b0d9-82a5bdcd0961	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMxMTI3NSwiZXhwIjoxNzY2OTE2MDc1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.yv48hUCu5NOYyPVeqHYnD0wjGToV1BBJvxwam6a1gyg	2025-12-28 10:01:15.816+00	2025-12-21 10:01:15.817+00	f
ed1257bb-fb73-4520-ad77-891484a7c7e6	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxMTM0OSwiZXhwIjoxNzY2OTE2MTQ5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.eN5ZSrhGipiotfjh1Bz48kf9SQHkfgjTowlcVD9M6UA	2025-12-28 10:02:29.686+00	2025-12-21 10:02:29.687+00	f
5563056b-9af2-4e30-bd24-956b1461ca4c	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxMjAzNCwiZXhwIjoxNzY2OTE2ODM0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ctfqivJxt1ZRheOEkEBO_qh68owl7HbbZ16rXWWkAGI	2025-12-28 10:13:54.371+00	2025-12-21 10:13:54.374+00	f
fc9d9f70-a52f-4af5-bc72-293b144f66bb	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxMjQwMiwiZXhwIjoxNzY2OTE3MjAyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.nu1l2u0i5X3L8Phw97QDcpw2V99QwV8zzvckURJwdfs	2025-12-28 10:20:02.002+00	2025-12-21 10:20:02.004+00	f
0818f00a-ff23-475c-944f-9ae6c12dde8f	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMxMzAwNiwiZXhwIjoxNzY2OTE3ODA2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.emssMPPZfSspdgrV9PU9nGH1FrPEMp36qU3YMej_hKs	2025-12-28 10:30:06.469+00	2025-12-21 10:30:06.471+00	f
42e5f2f6-9bcf-4e5d-a154-27bcfaac6121	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxMzAzNywiZXhwIjoxNzY2OTE3ODM3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.ge7w59PEv7_yVnKn-_SXc6LH48HBSige9GzKS_IHH_M	2025-12-28 10:30:37.93+00	2025-12-21 10:30:37.931+00	f
79999ce6-8ecc-4f2d-bb3e-1c1c1d33a5cd	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxMzA2MCwiZXhwIjoxNzY2OTE3ODYwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.YxdelWveqc5mnerEkHhRbunc3_FdWlJdUF4xlSeh6l4	2025-12-28 10:31:00.138+00	2025-12-21 10:31:00.139+00	f
b83722d3-0ac1-4443-87c4-574e216f5007	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMxMzA3OCwiZXhwIjoxNzY2OTE3ODc4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.wPkSuggQrMr-FAGTYmqrBkeutLyVLNBUywM4jKfnnhc	2025-12-28 10:31:18.67+00	2025-12-21 10:31:18.671+00	f
814ac7df-2e71-478e-840e-12a7cf141ce9	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxMzIyMSwiZXhwIjoxNzY2OTE4MDIxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Xb1mJtVCRQAvrks3YBu1G3o9tFoNpC-c0hZFxwXKL3w	2025-12-28 10:33:41.143+00	2025-12-21 10:33:41.147+00	f
93d631cb-408a-4f9f-828c-692a43744533	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxMzI2OCwiZXhwIjoxNzY2OTE4MDY4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3dpB-ql6idA34_ZKoN2DOIroIKtCtyW4BR0k31lLKVk	2025-12-28 10:34:28.673+00	2025-12-21 10:34:28.675+00	f
6e3e000a-e589-4652-9657-9f55ae37cb80	b2375272-de40-40f5-8eca-5a2b29e6c67a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMjM3NTI3Mi1kZTQwLTQwZjUtOGVjYS01YTJiMjllNmM2N2EiLCJlbWFpbCI6InVzZXIwMDdAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxMzY3OCwiZXhwIjoxNzY2OTE4NDc4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.kbqBalUTffKQrJNiopHWSrwZCGs0UQHX43WNxLYJAg8	2025-12-28 10:41:18.272+00	2025-12-21 10:41:18.275+00	f
c5b1a22b-3a47-4020-83a5-2d699123fb19	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxNDAzOSwiZXhwIjoxNzY2OTE4ODM5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0._Wkh0dG2MgeVHEfSIkYXOA23vxY9VsJy7j-fZ89rDpE	2025-12-28 10:47:19.496+00	2025-12-21 10:47:19.498+00	f
169ece0e-bfa8-4b93-b973-2d0dfebc5136	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxNDA3MywiZXhwIjoxNzY2OTE4ODczLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3Bk595ZrXki937nlZGGoJbVJHPPudRboGYCX3gFqGVw	2025-12-28 10:47:53.087+00	2025-12-21 10:47:53.09+00	f
920fa743-6eb2-4838-8510-c62d9a7e467b	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxNDY0NywiZXhwIjoxNzY2OTE5NDQ3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.JcNJYOw7DVhWZ0cMIIQOOhwOShwYhyR4YEmnNyfXgr4	2025-12-28 10:57:27.618+00	2025-12-21 10:57:27.62+00	f
d3edb141-7257-4033-91a4-6fcf62d43148	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxNDg4MSwiZXhwIjoxNzY2OTE5NjgxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.HKA5UIgpkFyvYae9nsjexbCN1BFj4fxaQCkq2hYYTws	2025-12-28 11:01:21.681+00	2025-12-21 11:01:21.683+00	f
27d11e43-e9ab-4d63-934b-6b02b15b2958	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMxNTEwNCwiZXhwIjoxNzY2OTE5OTA0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.qjVYL73NdUYb_j9c-MwMvKm6yZRAbySliIoxHPeKJwg	2025-12-28 11:05:04.148+00	2025-12-21 11:05:04.149+00	f
6b90a9de-f7d3-451e-8e62-ade1cf30e501	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMxNTcyMCwiZXhwIjoxNzY2OTIwNTIwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.XiPvCoc90gP1qKZY910_mO2FICQpJp0UOPv97UpttzM	2025-12-28 11:15:20.238+00	2025-12-21 11:15:20.24+00	f
8f975a4a-8537-458c-bf5e-76e0e89c276e	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMxNjAzNSwiZXhwIjoxNzY2OTIwODM1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.9SXQjxG16C-gaV5yZrbJ4PNxwzHCycb_v701vjZaN-o	2025-12-28 11:20:35.589+00	2025-12-21 11:20:35.59+00	f
37323037-a94e-49ce-83d5-73d57c4535d2	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxNzgxMSwiZXhwIjoxNzY2OTIyNjExLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.qzIbLKiPdzfkT4d1uL1Sk7w1x7g6jc6vHoWuCdXQfUU	2025-12-28 11:50:11.531+00	2025-12-21 11:50:11.532+00	f
68a8b259-a786-4ca1-9150-b574e15f3eae	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYzMTgwNDYsImV4cCI6MTc2NjkyMjg0NiwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.chetom2v21IquDG26c-s0NcAEe5OqeHekUM4Bz1-JM4	2025-12-28 11:54:06.004+00	2025-12-21 11:54:06.005+00	f
e69a81a6-d1cc-4f8d-948b-d9553130748e	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxODEzMywiZXhwIjoxNzY2OTIyOTMzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.cIg1m_ac9740x19U2EBy2TXk2QO1BnUHOAwHyOspqMs	2025-12-28 11:55:33.539+00	2025-12-21 11:55:33.54+00	f
4b361872-c232-469d-b984-d8506eeea452	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYzMTgxNDQsImV4cCI6MTc2NjkyMjk0NCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.nwN_I6Irr8oPHfMX8QC_lSHskgXGm0pjQ6O9zcYasYQ	2025-12-28 11:55:44.586+00	2025-12-21 11:55:44.587+00	f
31ef272a-8fdc-4638-8467-48b439b0af3c	354744f2-6982-46a1-8b66-51ac38255439	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNTQ3NDRmMi02OTgyLTQ2YTEtOGI2Ni01MWFjMzgyNTU0MzkiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjYzMTg4MjAsImV4cCI6MTc2NjkyMzYyMCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.JGBPlmj7YohEBMx-TZYxoqgcWEtGTSekMHP-2H7e_ZQ	2025-12-28 12:07:00.189+00	2025-12-21 12:07:00.19+00	f
6384d76f-4cbb-4f10-8a64-6bbac716079c	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMxOTQ4MSwiZXhwIjoxNzY2OTI0MjgxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.04TQhYZAIElxCJtdPV60aCn0I0POLAF5sQ1Qmn3x8pU	2025-12-28 12:18:01.83+00	2025-12-21 12:18:01.832+00	f
e5ae8ad2-6dad-4a05-9652-a20ac1a71030	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMxOTQ5MiwiZXhwIjoxNzY2OTI0MjkyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.NDoMw-rIk78E-Fywgiua2xxi9mLfbOtY7TTfviLVyJ0	2025-12-28 12:18:12.982+00	2025-12-21 12:18:12.983+00	f
5bf327f8-6234-4f15-a699-959284d9b8c5	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyMDkyMCwiZXhwIjoxNzY2OTI1NzIwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.KPv1g5Th6371ZASIDiao3K1K11J3QKqalVdNNaECbDs	2025-12-28 12:42:00.395+00	2025-12-21 12:42:00.398+00	f
901d35fa-e432-4754-b321-75534487b528	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyMjI4NCwiZXhwIjoxNzY2OTI3MDg0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.LwaCi4wViKi63-G_7ciQrYNiehQJCQsaeDDgLBawt3Q	2025-12-28 13:04:44.898+00	2025-12-21 13:04:44.9+00	f
7d63130d-f6bb-4d44-b009-216fdc69c106	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyMjI5NCwiZXhwIjoxNzY2OTI3MDk0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.8tTfCwG7VqX7eBkgeb75q7E6gN9GVTSQFvWdYHdGbXU	2025-12-28 13:04:54.089+00	2025-12-21 13:04:54.091+00	f
4a7c8c8e-85cf-4033-95bd-5c591bfcc40c	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyMjMwNywiZXhwIjoxNzY2OTI3MTA3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.xG-15zQtANJIuXsBCarv68OuPKiBdtwdaywHJ6btcKo	2025-12-28 13:05:07.372+00	2025-12-21 13:05:07.373+00	f
f7e58d1b-f0bd-4c97-88fd-f32e7bd72f4b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyNTEwMiwiZXhwIjoxNzY2OTI5OTAyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.QE7VXgrt1PheldU1V9amsBJ-f4k2d1zbTgVgmtFHRE4	2025-12-28 13:51:42.782+00	2025-12-21 13:51:42.783+00	f
f87f2298-afa1-4330-b6a6-7d0275d5e7ad	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyNTYzNSwiZXhwIjoxNzY2OTMwNDM1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.rmOffhH2MkRJmfh20Pw3NCGSZcquKN7GH4VjyTlVHTg	2025-12-28 14:00:35.15+00	2025-12-21 14:00:35.151+00	f
95df5777-0e07-4949-b847-971fabf31173	a802ec32-ccb6-4336-b861-c60e6cdb750e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhODAyZWMzMi1jY2I2LTQzMzYtYjg2MS1jNjBlNmNkYjc1MGUiLCJlbWFpbCI6ImhhaWR1b25nQGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYzMjU5ODksImV4cCI6MTc2NjkzMDc4OSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.xLu-vNs89koGKEvxFXS1Wf2mpQDE2GBEdLW8or-RLOA	2025-12-28 14:06:29.083+00	2025-12-21 14:06:29.084+00	f
8f3a96d6-bda7-4304-a875-367805658a9c	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyNjAzMiwiZXhwIjoxNzY2OTMwODMyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.mk4vYIcYH4OGFKK0eNAqEr0SqLSBbXZHCySTigs18j0	2025-12-28 14:07:12.006+00	2025-12-21 14:07:12.008+00	f
fc7b8ed9-368e-4a1d-bff9-43261130631f	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyNjIzOSwiZXhwIjoxNzY2OTMxMDM5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.w4IesO6sxDijoHDQuiKfgNUxMnVUDDiOE7OfQmUwBS0	2025-12-28 14:10:39.486+00	2025-12-21 14:10:39.488+00	f
3a0260ed-e09c-4a31-9d35-3821c708cb72	a802ec32-ccb6-4336-b861-c60e6cdb750e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhODAyZWMzMi1jY2I2LTQzMzYtYjg2MS1jNjBlNmNkYjc1MGUiLCJlbWFpbCI6ImhhaWR1b25nQGdtYWlsLmNvbSIsInJvbGUiOiJldmVudF9tYW5hZ2VyIiwiaWF0IjoxNzY2MzI2MjYxLCJleHAiOjE3NjY5MzEwNjEsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.GvTRudUdOquHMKPmxBmr03Rw5BX_dTxEqZDsx5yONY4	2025-12-28 14:11:01.56+00	2025-12-21 14:11:01.561+00	f
588be05a-9b89-4ab8-86fe-2130665d14e7	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyNjcyOSwiZXhwIjoxNzY2OTMxNTI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.XxEezNmrviTxkxdA92F6en9S0Q905-bIce2nXuOIkyc	2025-12-28 14:18:49.788+00	2025-12-21 14:18:49.79+00	f
8d659b5b-c514-4005-a7f0-9945e47468ca	a802ec32-ccb6-4336-b861-c60e6cdb750e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhODAyZWMzMi1jY2I2LTQzMzYtYjg2MS1jNjBlNmNkYjc1MGUiLCJlbWFpbCI6ImhhaWR1b25nQGdtYWlsLmNvbSIsInJvbGUiOiJldmVudF9tYW5hZ2VyIiwiaWF0IjoxNzY2MzI2ODg1LCJleHAiOjE3NjY5MzE2ODUsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.y2_3_wkIby3YvGwWUwma51XjASEMm5u0v3Szgezgn3Y	2025-12-28 14:21:25.742+00	2025-12-21 14:21:25.743+00	f
8d41dba5-5bc1-4a93-b9e2-c5b0e8f80d1e	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyNzM1NiwiZXhwIjoxNzY2OTMyMTU2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.lxnexGjpcg_vbK0gryo7foRFl5iUlmLeKnhNGpgqyaQ	2025-12-28 14:29:16.996+00	2025-12-21 14:29:16.998+00	f
b9bbfe5b-64e9-4981-a6ce-ed4693150eb1	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyNzQ4MiwiZXhwIjoxNzY2OTMyMjgyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.LUJAr4bDRoxGcPShzNFX5k_ZypXCCNK84xnAr49QVbQ	2025-12-28 14:31:22.03+00	2025-12-21 14:31:22.032+00	f
017e2526-e4d9-4881-95bd-c295fee5705a	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyOTI5NSwiZXhwIjoxNzY2OTM0MDk1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.KvTn8tC4Qg9Bnd9p6DcjXpjgZj-xWMbIFrXc4MtGSE4	2025-12-28 15:01:35.472+00	2025-12-21 15:01:35.476+00	f
008b8796-ed2b-4da0-add9-d63768de1192	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMyOTMwOCwiZXhwIjoxNzY2OTM0MTA4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.O4Bgo9CjJvI96zoUjqNtkIcI896dYK0I5hwOnJAHLVA	2025-12-28 15:01:48.562+00	2025-12-21 15:01:48.563+00	f
f3e251aa-2f0e-42fc-b140-c26050fb8199	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyOTM4NywiZXhwIjoxNzY2OTM0MTg3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.HX7c0lFSXiLM4IUw53qEnU3xOR-Z7HNRHQfA5Zyp-Kg	2025-12-28 15:03:07.39+00	2025-12-21 15:03:07.392+00	f
9d7db4e3-14ce-40f5-94b9-57932685f30f	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyOTQyOSwiZXhwIjoxNzY2OTM0MjI5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.GCzjS8yTiD0SjaMPFjAttSO3jliJMGKMbyX7dLbxFgc	2025-12-28 15:03:49.619+00	2025-12-21 15:03:49.62+00	f
573ebbc1-2095-4f7f-874c-380be90c28fe	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyOTQ2NCwiZXhwIjoxNzY2OTM0MjY0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.sLF5Iug6Eoe9i9LEWpamcB1-pgeXGDVIlzSFK-cOMbI	2025-12-28 15:04:24.342+00	2025-12-21 15:04:24.343+00	f
907df0a4-d867-4406-8315-8b30dd560918	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyOTUwNCwiZXhwIjoxNzY2OTM0MzA0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3bDvu8urxnTIiCaFxrF2euEmtLKuEpOQvxbO6evja6I	2025-12-28 15:05:04.19+00	2025-12-21 15:05:04.191+00	f
071048b5-09d3-47b5-9032-8c37ea5c7be0	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyOTYxMSwiZXhwIjoxNzY2OTM0NDExLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3Vm15UIRWjEjJT5URhtDJCFn07N1fEhxOx6knaJONPQ	2025-12-28 15:06:51.276+00	2025-12-21 15:06:51.278+00	f
8fe12638-4cec-4738-8e53-43d44c08a039	f2667f3b-30bc-4a55-9b8c-14be0b5413fe	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjY2N2YzYi0zMGJjLTRhNTUtOWI4Yy0xNGJlMGI1NDEzZmUiLCJlbWFpbCI6ImFuaGR1eUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzI5Njk1LCJleHAiOjE3NjY5MzQ0OTUsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.PFqhSAhi7mIKIO1UpyCdR3nHFFiIgOkP3Y2hiTafYts	2025-12-28 15:08:15.449+00	2025-12-21 15:08:15.451+00	f
76f449a5-8d4a-483e-a6bb-d2a8e954f1bd	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyOTY5NiwiZXhwIjoxNzY2OTM0NDk2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.hLVnfRKyrTncwNGEGmfZiHt1z9rbBp610nbigSBclfA	2025-12-28 15:08:16.387+00	2025-12-21 15:08:16.389+00	f
e21559ca-c2d8-4d0b-8ed9-f056e553b352	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyOTczOSwiZXhwIjoxNzY2OTM0NTM5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Kh4IIPeflKq7UoG7pdEEtfD8vmuLJOugGwfEFg0azG8	2025-12-28 15:08:59.578+00	2025-12-21 15:08:59.58+00	f
0c2426fe-e862-41c8-80bb-91403956d73b	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyOTc4NywiZXhwIjoxNzY2OTM0NTg3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.s9dMowt8QNGWjB09UIqAb-Ay9q0RY2TQi5zXI4akCRw	2025-12-28 15:09:47.901+00	2025-12-21 15:09:47.904+00	f
ed9f2529-7884-4e17-a7aa-270dff0ea1a4	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMyOTk2MCwiZXhwIjoxNzY2OTM0NzYwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.CQoVT9xBzGOMFmQUjSI8tnH8n-Hg9Ve8YjXvnPrBZlk	2025-12-28 15:12:40.299+00	2025-12-21 15:12:40.301+00	f
d60ae8b6-53bd-46d3-ae39-72ce2740c3fa	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMyOTk4OSwiZXhwIjoxNzY2OTM0Nzg5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0._SqxwHoS6GQT3FO514sXWUi74-3VB1y05pdimgvALG4	2025-12-28 15:13:09.386+00	2025-12-21 15:13:09.387+00	f
21388954-c4aa-4f1f-a350-7215c7dfdf25	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMzMDE1MiwiZXhwIjoxNzY2OTM0OTUyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.NO7yQBL8vLq87AnDVS8Ug2Io08q3uqBmiDcXE4o5A8g	2025-12-28 15:15:52.939+00	2025-12-21 15:15:52.94+00	f
3369b247-3428-4f2a-87a7-2d73d607a1d8	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzMDQxNSwiZXhwIjoxNzY2OTM1MjE1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.0I2_RsDUbjYjCAOlPcNN6B_XT5ldKVwKZ-Z--wkz7g8	2025-12-28 15:20:15.918+00	2025-12-21 15:20:15.92+00	f
dae28dd3-713f-43d3-ad41-f4b5d32c3ad9	f2667f3b-30bc-4a55-9b8c-14be0b5413fe	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjY2N2YzYi0zMGJjLTRhNTUtOWI4Yy0xNGJlMGI1NDEzZmUiLCJlbWFpbCI6ImFuaGR1eUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzMwNDgwLCJleHAiOjE3NjY5MzUyODAsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.kWnZ7_1BrrjCGyRmVfHHhrhr33yetFRcmEXdzccVv_A	2025-12-28 15:21:20.284+00	2025-12-21 15:21:20.285+00	f
1001344f-6fa3-49db-afdb-8ef5ff389abb	f2667f3b-30bc-4a55-9b8c-14be0b5413fe	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjY2N2YzYi0zMGJjLTRhNTUtOWI4Yy0xNGJlMGI1NDEzZmUiLCJlbWFpbCI6ImFuaGR1eUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzMwNTAwLCJleHAiOjE3NjY5MzUzMDAsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.a0itAg3SS5sg1kn4hYIJ3BxstjHMkiJz2wfMqD9gvLg	2025-12-28 15:21:40.458+00	2025-12-21 15:21:40.459+00	f
9089263d-eefa-422e-a968-bb406528440d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTA4NiwiZXhwIjoxNzY2OTM1ODg2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.4PPL2Ubk-LxK9QKX0RQCPZxXldXxYLRaYYXAzUI2jEw	2025-12-28 15:31:26.313+00	2025-12-21 15:31:26.314+00	f
28f73878-4072-46fe-aea0-a28d9a252fc8	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMjI1NCwiZXhwIjoxNzY2OTM3MDU0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.OMfmB84jfYImDLc-mq5deRAQGdtXCwSLRNxGjwsp31M	2025-12-28 15:50:54.283+00	2025-12-21 15:50:54.285+00	f
afbd478f-41f4-446c-b4e3-1fc7a06420ef	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMjg0NiwiZXhwIjoxNzY2OTM3NjQ2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.I-3oeWcjesKmZ9AXcilGKKut1nDtqQwJkwcMrBW11xw	2025-12-28 16:00:46.413+00	2025-12-21 16:00:46.414+00	f
10016a46-a527-400c-920f-98ed02c48165	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMzMzQ0MiwiZXhwIjoxNzY2OTM4MjQyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.FXX-KQOhdBhXN9WHsC_ytlw93CGMCh6ckaIoQbnZu-Y	2025-12-28 16:10:42.207+00	2025-12-21 16:10:42.209+00	f
3c8b73d0-a28e-4f5c-9ba5-0b492b7d5bf3	4f991fcd-9830-460a-a086-ee49722dcea5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Zjk5MWZjZC05ODMwLTQ2MGEtYTA4Ni1lZTQ5NzIyZGNlYTUiLCJlbWFpbCI6ImRhdDE3MDQwNUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzMwNjMzLCJleHAiOjE3NjY5MzU0MzMsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.pyamD8Mp_LjHxEX26XbquxOzLvoLMq-ttmTwMg9q3Jw	2025-12-28 15:23:53.15+00	2025-12-21 15:23:53.154+00	f
c407b0a4-131a-409b-9806-6db96d31083f	f061afd7-9d54-405a-9564-c5e38b85802d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDYxYWZkNy05ZDU0LTQwNWEtOTU2NC1jNWUzOGI4NTgwMmQiLCJlbWFpbCI6ImRhdDE3MDQwNkBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzMwNzc3LCJleHAiOjE3NjY5MzU1NzcsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.rToBcgGjskS_-tYCMQcYtNSyaoYokkcIUXnAY3Flz6U	2025-12-28 15:26:17.247+00	2025-12-21 15:26:17.249+00	f
d9fc348b-8a46-42fb-af04-d81bfad1652d	e5ff9f4b-3f27-4c37-839f-12b5c4b70411	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNWZmOWY0Yi0zZjI3LTRjMzctODM5Zi0xMmI1YzRiNzA0MTEiLCJlbWFpbCI6InRlc3RhY2NvdW50MDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTI5NSwiZXhwIjoxNzY2OTM2MDk1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.G45Jj62G25glvSgtSlIw2uI8hQNRUAW2zXLInxmFJVc	2025-12-28 15:34:55.39+00	2025-12-21 15:34:55.391+00	f
28b3b7c4-8c93-4cef-bb2b-94828700ece8	afc55c5c-6958-44b0-99f0-e00b198e913d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZmM1NWM1Yy02OTU4LTQ0YjAtOTlmMC1lMDBiMTk4ZTkxM2QiLCJlbWFpbCI6InZpZXRhbmhAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTQxNiwiZXhwIjoxNzY2OTM2MjE2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.EJ6rTlDrgi2qHvH19Rxj9h4bniwV3Wm78_Owre5Zyw8	2025-12-28 15:36:56.362+00	2025-12-21 15:36:56.364+00	f
b5a75c5f-a29e-49bd-99df-449b60b4661e	e5ff9f4b-3f27-4c37-839f-12b5c4b70411	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNWZmOWY0Yi0zZjI3LTRjMzctODM5Zi0xMmI1YzRiNzA0MTEiLCJlbWFpbCI6InRlc3RhY2NvdW50MDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTQyNiwiZXhwIjoxNzY2OTM2MjI2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.OPO4J3i7gTLKPu2nlLH2Ty1Ns35ns1nxUkEDFMyNJmc	2025-12-28 15:37:06.107+00	2025-12-21 15:37:06.109+00	f
9c2d87bd-63ee-4b6f-8d7f-a17ec6221fd5	afc55c5c-6958-44b0-99f0-e00b198e913d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZmM1NWM1Yy02OTU4LTQ0YjAtOTlmMC1lMDBiMTk4ZTkxM2QiLCJlbWFpbCI6InZpZXRhbmhAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTQ2NywiZXhwIjoxNzY2OTM2MjY3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.Rk0XEXvEbQ2g674xZ_puREh3Y6_YikDL1bsvJEOU1dk	2025-12-28 15:37:47.523+00	2025-12-21 15:37:47.525+00	f
2fb30932-de41-4b29-b752-28524dbdbd9a	afc55c5c-6958-44b0-99f0-e00b198e913d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZmM1NWM1Yy02OTU4LTQ0YjAtOTlmMC1lMDBiMTk4ZTkxM2QiLCJlbWFpbCI6InZpZXRhbmhAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTUxMywiZXhwIjoxNzY2OTM2MzEzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.nE-TI_vVnkS4B-aoLPOICphf6htogtYt1qvOJ0ARqFA	2025-12-28 15:38:33.147+00	2025-12-21 15:38:33.15+00	f
0eec0daf-9267-473d-b8af-f22e95c1979e	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzMTg5MSwiZXhwIjoxNzY2OTM2NjkxLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.yUYS4bwc6V9cKSR6Ij6T_Ut-JCA53mTEhF44e51Sudk	2025-12-28 15:44:51.009+00	2025-12-21 15:44:51.01+00	f
9adcca9c-9c7d-4bb6-b9d0-88c66acc91f3	12ef2d62-303f-482c-9f02-bf40c6997d3e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMmVmMmQ2Mi0zMDNmLTQ4MmMtOWYwMi1iZjQwYzY5OTdkM2UiLCJlbWFpbCI6Im94YWFtZ2Jwbjc0MzFAb3hhYW0uY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTk0NiwiZXhwIjoxNzY2OTM2NzQ2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.5BdXxZULViWScMofKYeg31poX0am_1vVC0oedQfacMk	2025-12-28 15:45:46.143+00	2025-12-21 15:45:46.145+00	f
81bc18fd-3375-4770-9bbc-519bcf089ebb	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMTk2MCwiZXhwIjoxNzY2OTM2NzYwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.TPAEla3Pb32XwDP19rzL9mnVHBwwM07B64TLg-IsN9Q	2025-12-28 15:46:00.56+00	2025-12-21 15:46:00.562+00	f
3ad2a4b0-3340-4e3c-b7b2-4eec1e75071c	13bfc626-aa4e-4217-a067-2eb54d3be344	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxM2JmYzYyNi1hYTRlLTQyMTctYTA2Ny0yZWI1NGQzYmUzNDQiLCJlbWFpbCI6InRoYW5oZGF0QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYzMzIwNDIsImV4cCI6MTc2NjkzNjg0MiwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.zdbvuOWoO9OLZY2OzGfDAeNGks2gXZbP2_bqzx4CSys	2025-12-28 15:47:22.003+00	2025-12-21 15:47:22.004+00	f
ec4d1a8f-7cf3-4f3d-9685-e9e571203ba7	4b3467ba-e28d-4306-903f-33469774488e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YjM0NjdiYS1lMjhkLTQzMDYtOTAzZi0zMzQ2OTc3NDQ4OGUiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1NUBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzMyMTEzLCJleHAiOjE3NjY5MzY5MTMsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.5lZPY6fa6AHFl6hkESmhUoGWHcgRgOi8hw8rKVN8Mu8	2025-12-28 15:48:33.188+00	2025-12-21 15:48:33.19+00	f
83afa27c-7ed7-4d70-b1e8-ad2295fd2165	7e2d6eb0-180f-4d9c-b113-4ab1ee6fc683	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTJkNmViMC0xODBmLTRkOWMtYjExMy00YWIxZWU2ZmM2ODMiLCJlbWFpbCI6ImNsb25lMTQxNTkyNjUzNTgxQGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYzMzIyMjcsImV4cCI6MTc2NjkzNzAyNywiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.rUh6zqeeRBhZw20QO18zSjgQpsdcbcx3JV35esf4RQo	2025-12-28 15:50:27.385+00	2025-12-21 15:50:27.387+00	f
ab3ba814-c235-400d-9b79-1ba0f9b26476	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzMjI4NSwiZXhwIjoxNzY2OTM3MDg1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.3-zY8cuORBSacGPoK2k0DjtbVnykHhbF_Dm0jPEis_4	2025-12-28 15:51:25.959+00	2025-12-21 15:51:25.962+00	f
ec0f156b-e4bd-4cc2-ae60-86b8699c48a9	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzMjMwMiwiZXhwIjoxNzY2OTM3MTAyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.jU0y7BhqJdN47ZH0KgCvsydsk2lljKv13Kaij2xhRk8	2025-12-28 15:51:42.89+00	2025-12-21 15:51:42.891+00	f
04ba6182-1669-40b7-96af-f62c956436d2	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMjQ0MiwiZXhwIjoxNzY2OTM3MjQyLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.63cfkc1ts7N78zmBPUUl32jcL1EtD8Ra2eJ3GyTGtwI	2025-12-28 15:54:02.959+00	2025-12-21 15:54:02.96+00	f
05bb138a-a38a-4e2c-96b9-5f5b640cbc0e	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzMjUwNSwiZXhwIjoxNzY2OTM3MzA1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.KxtulpmryzEyi4Lq_dkwfp7UJlfIKWzcTo39F0IOyVg	2025-12-28 15:55:05.283+00	2025-12-21 15:55:05.284+00	f
b4102c88-5552-40c0-87f8-72651b3ec24c	13bfc626-aa4e-4217-a067-2eb54d3be344	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxM2JmYzYyNi1hYTRlLTQyMTctYTA2Ny0yZWI1NGQzYmUzNDQiLCJlbWFpbCI6InRoYW5oZGF0QGdtYWlsLmNvbSIsInJvbGUiOiJ2b2x1bnRlZXIiLCJpYXQiOjE3NjYzMzI2NzQsImV4cCI6MTc2NjkzNzQ3NCwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.EzEni7eOyp-ef_jGwGq9DXZVBO7xy5I_MxUAnYvzO9o	2025-12-28 15:57:54.914+00	2025-12-21 15:57:54.915+00	f
9ab85b77-5323-4605-a3f8-1d0787fb0d02	09a54261-4677-4d83-994e-93c6d80bd741	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOWE1NDI2MS00Njc3LTRkODMtOTk0ZS05M2M2ZDgwYmQ3NDEiLCJlbWFpbCI6ImNsb25lMTQxNTkyNjUzNTgyMkBnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY2MzMyNjgyLCJleHAiOjE3NjY5Mzc0ODIsImF1ZCI6Imh0dHBzOi8vYXBpLnZvbHVudGVlcmh1Yi5jb20iLCJpc3MiOiJodHRwczovL3ZvbHVudGVlcmh1Yi5jb20ifQ.PhsIaOcCl2mOKVChLfih7yeA7Hb_abMr0YcUWalErFk	2025-12-28 15:58:02.626+00	2025-12-21 15:58:02.628+00	f
94c6998d-db28-40e8-845c-5f3fd2ed0a2c	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzMzg1NywiZXhwIjoxNzY2OTM4NjU3LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.8Tcsy82i345FbDuhcS_hRU7a8H3lO-KLqYTvZphsGag	2025-12-28 16:17:37.17+00	2025-12-21 16:17:37.171+00	f
42b74959-09d2-4e69-b81c-22dba7c8aa2f	fe5331be-c13a-432c-b558-fdea68c096d3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTUzMzFiZS1jMTNhLTQzMmMtYjU1OC1mZGVhNjhjMDk2ZDMiLCJlbWFpbCI6InRlc3RhY2NvdW50MDVAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzNDM3OCwiZXhwIjoxNzY2OTM5MTc4LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.uUBuJUNWU7E04XFjfiX5ORSLkgpeEH4Ow2_hhNKkmhc	2025-12-28 16:26:18.787+00	2025-12-21 16:26:18.789+00	f
ac191e34-a9e3-4995-8fb0-ffff54e167d6	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMzNDQzNCwiZXhwIjoxNzY2OTM5MjM0LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.KW35YMRSEWs07Ect6QiT-qGjBh20clML_EqtH98fWJ8	2025-12-28 16:27:14.06+00	2025-12-21 16:27:14.061+00	f
cd1e1ae8-0014-41df-aa35-03a4e63d1a23	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzNDQ2NSwiZXhwIjoxNzY2OTM5MjY1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.phcarAe-ztmtDGoyYn_gAon6k-B-q8qpbzRdaH5tAcI	2025-12-28 16:27:45.293+00	2025-12-21 16:27:45.295+00	f
10e8801e-b7ea-41bd-85af-5642bb51d6be	0c302afa-08d8-4edf-87e7-f71e85443736	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYzMwMmFmYS0wOGQ4LTRlZGYtODdlNy1mNzFlODU0NDM3MzYiLCJlbWFpbCI6InRlc3RhY2NvdW50MDZAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NjMzNDUxMywiZXhwIjoxNzY2OTM5MzEzLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.SB-NbHKJFjmNjINRU6q5rfrslNdBmjUgCD4KqKg1QoE	2025-12-28 16:28:33.958+00	2025-12-21 16:28:33.96+00	f
d8e88880-1b1c-49a3-a531-635895e720d7	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTA1M2E4NS1lMGEwLTQ2ZjgtODdiZi0yNjFiOThhNWM1YmMiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDVzZGZzZGY0YUBnbWFpbC5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NjMzNDU2NSwiZXhwIjoxNzY2OTM5MzY1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.LCVmyS5JiOPiVxwQPGLOGRKe7YuJ--zm1j_JuFrJmzo	2025-12-28 16:29:25.583+00	2025-12-21 16:29:25.585+00	f
ef5aaafb-5c75-4b16-b3ff-3f59d3993c9c	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6ImV2ZW50X21hbmFnZXIiLCJpYXQiOjE3NjYzMzQ2NDMsImV4cCI6MTc2NjkzOTQ0MywiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.IdkuY74LPpsvIvn7NKPuXCttraxUxT8z5mgSAfXSbr0	2025-12-28 16:30:43.203+00	2025-12-21 16:30:43.204+00	f
4cddd24c-e46f-42c3-912d-df5dedfe72b1	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzNDc0MCwiZXhwIjoxNzY2OTM5NTQwLCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.s0p840c2PtKQm1vLAfo4CaGf0fvOArP3IvBOSviEc90	2025-12-28 16:32:20.5+00	2025-12-21 16:32:20.501+00	f
41a596bb-862c-4bee-8174-c3a349f6cccd	f18a80a9-233d-4a7b-aa52-2933dcc2b15b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMThhODBhOS0yMzNkLTRhN2ItYWE1Mi0yOTMzZGNjMmIxNWIiLCJlbWFpbCI6InZpZXRhbmgxMjIwMDU1QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjMzNDgzNSwiZXhwIjoxNzY2OTM5NjM1LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIn0.nx72xNxj-Hl7ph45HVYAs_Zku4oB9NQR2iW9RdT6qMc	2025-12-28 16:33:55.462+00	2025-12-21 16:33:55.463+00	f
b380ffc9-ea9a-4377-9201-6ba8ad0a84af	0aad94f9-6f6b-498b-b620-01fd0809bcbd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWFkOTRmOS02ZjZiLTQ5OGItYjYyMC0wMWZkMDgwOWJjYmQiLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6ImV2ZW50X21hbmFnZXIiLCJpYXQiOjE3NjYzMzQ4NjUsImV4cCI6MTc2NjkzOTY2NSwiYXVkIjoiaHR0cHM6Ly9hcGkudm9sdW50ZWVyaHViLmNvbSIsImlzcyI6Imh0dHBzOi8vdm9sdW50ZWVyaHViLmNvbSJ9.5l8sW0mjd8fUpWJjaeo9TL0SToyZJgbhm9QHlGlhJeA	2025-12-28 16:34:25.007+00	2025-12-21 16:34:25.009+00	f
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, event_id, user_id, status, created_at, updated_at) FROM stdin;
3066eb75-4555-4c2f-bc98-65fe4ac4ece4	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	5ea137e7-860e-4648-94f8-8015437cc00c	approved	2025-12-04 08:26:44.891072+00	2025-12-04 08:26:44.891072+00
680d1dc9-b349-493c-9769-3d6ee2a8445b	4f761111-26c8-4b14-83d0-d9821b634808	5ea137e7-860e-4648-94f8-8015437cc00c	approved	2025-12-04 08:26:44.891072+00	2025-12-04 08:26:44.891072+00
be741271-912a-40a9-bef6-d947a0d866bd	d297c3f6-e77e-4ab9-a2f4-243019b17a47	5ea137e7-860e-4648-94f8-8015437cc00c	approved	2025-12-04 08:26:44.891072+00	2025-12-04 08:26:44.891072+00
f1c30b4d-74d0-4141-a006-7b02dee6e55d	d297c3f6-e77e-4ab9-a2f4-243019b17a47	4668267f-c511-4cfe-94fe-c7e3729e3494	approved	2025-12-04 08:26:44.891072+00	2025-12-04 08:26:44.891072+00
44bab3bb-94bd-4e98-b76d-5ac724a1d990	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	963b3407-18e6-473b-b707-108d7724c43b	approved	2025-12-04 08:26:44.891072+00	2025-12-04 08:26:44.891072+00
6d00c10e-135f-40cb-8bd1-7eb1c7538125	52951c64-4cb9-4b63-b7a8-a7021187c245	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	approved	2025-12-18 09:00:00+00	2025-12-19 04:31:57.195969+00
4d1681bf-843a-473d-a7b6-28d6bb556424	4f761111-26c8-4b14-83d0-d9821b634808	354744f2-6982-46a1-8b66-51ac38255439	approved	2025-12-05 05:00:00+00	2025-12-19 04:31:57.195969+00
08bfa26b-4943-4322-b4b4-f307025744f3	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	c1053a85-e0a0-46f8-87bf-261b98a5c5bc	rejected	2025-12-17 04:00:00+00	2025-12-19 04:31:57.195969+00
fb05a32e-3d31-4350-9324-5cc899d4afd3	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	4668267f-c511-4cfe-94fe-c7e3729e3494	pending	2025-12-04 08:26:44.891072+00	2025-12-04 08:26:44.891072+00
4070eea4-2f6f-476b-ac15-93d322991373	2c5bc3a5-cbc1-4121-9440-4addcebe25ba	354744f2-6982-46a1-8b66-51ac38255439	pending	2025-11-25 01:00:00+00	2025-12-19 04:31:57.195969+00
07795288-ef34-479a-8c57-6180e674a3a3	89399425-04ad-4283-84ed-d363673a9540	0aad94f9-6f6b-498b-b620-01fd0809bcbd	pending	2025-12-21 15:10:43.118+00	2025-12-21 15:10:43.118+00
e52afea4-11e0-491a-b124-9b21b65f526c	df85445f-c4c7-489f-a50c-3aa1acf66486	0aad94f9-6f6b-498b-b620-01fd0809bcbd	pending	2025-12-21 15:55:29.741+00	2025-12-21 15:55:29.741+00
053ec135-c474-4b53-9fd3-c8bb2380d3ba	c2902b80-4c65-4a16-b715-55850314bc5d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	approved	2025-12-21 15:58:05.581+00	2025-12-21 15:58:05.581+00
ac0a0898-7eb7-4bc3-a5d9-c63927df90bb	22338813-b33b-4d2b-8f76-a8aae7d14b7d	0aad94f9-6f6b-498b-b620-01fd0809bcbd	approved	2025-12-21 16:28:53.875+00	2025-12-21 16:28:53.875+00
\.


--
-- Data for Name: user_daily_activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_daily_activity (user_id, activity_date, online_seconds, login_count) FROM stdin;
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-15	3600	2
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-16	7200	3
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-17	1800	1
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-18	5400	2
354744f2-6982-46a1-8b66-51ac38255439	2025-12-15	4000	1
354744f2-6982-46a1-8b66-51ac38255439	2025-12-16	3000	1
354744f2-6982-46a1-8b66-51ac38255439	2025-12-18	9000	4
47c86965-9cec-417f-98f9-2e288ce3bad5	2025-12-18	600	1
c1053a85-e0a0-46f8-87bf-261b98a5c5bc	2025-12-10	12000	5
c1053a85-e0a0-46f8-87bf-261b98a5c5bc	2025-12-11	8000	3
e5ff9f4b-3f27-4c37-839f-12b5c4b70411	2025-12-21	0	2
b2375272-de40-40f5-8eca-5a2b29e6c67a	2025-12-21	0	1
c1053a85-e0a0-46f8-87bf-261b98a5c5bc	2025-12-20	10222	21
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-20	300	31
e10c836a-412c-4464-bb07-1804d6edc524	2025-12-21	0	6
12ef2d62-303f-482c-9f02-bf40c6997d3e	2025-12-21	0	1
354744f2-6982-46a1-8b66-51ac38255439	2025-12-19	26	1
f18a80a9-233d-4a7b-aa52-2933dcc2b15b	2025-12-19	0	2
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-19	1	2
ed4c3bac-dcbc-444c-b887-5fef9f11d05d	2025-12-19	0	1
7e2d6eb0-180f-4d9c-b113-4ab1ee6fc683	2025-12-21	0	1
c1053a85-e0a0-46f8-87bf-261b98a5c5bc	2025-12-19	0	5
354744f2-6982-46a1-8b66-51ac38255439	2025-12-21	0	5
354744f2-6982-46a1-8b66-51ac38255439	2025-12-20	0	3
003dd505-f023-4e14-b170-a6fe959c42f5	2025-12-20	0	1
9db5955a-95d9-41db-b356-8d68cf782aa5	2025-12-20	0	1
13bfc626-aa4e-4217-a067-2eb54d3be344	2025-12-21	300	2
09a54261-4677-4d83-994e-93c6d80bd741	2025-12-21	0	1
b83b0246-9e3c-4097-b731-ce3f9c19a97e	2025-12-20	0	1
a802ec32-ccb6-4336-b861-c60e6cdb750e	2025-12-21	300	3
4b3467ba-e28d-4306-903f-33469774488e	2025-12-21	1197	1
f18a80a9-233d-4a7b-aa52-2933dcc2b15b	2025-12-20	300	6
aec2f26e-58ff-4b6b-b675-d1288893db72	2025-12-21	0	1
fe5331be-c13a-432c-b558-fdea68c096d3	2025-12-21	0	1
0c302afa-08d8-4edf-87e7-f71e85443736	2025-12-21	0	1
c1053a85-e0a0-46f8-87bf-261b98a5c5bc	2025-12-21	2699	43
f2667f3b-30bc-4a55-9b8c-14be0b5413fe	2025-12-21	603	3
4f991fcd-9830-460a-a086-ee49722dcea5	2025-12-21	0	1
f061afd7-9d54-405a-9564-c5e38b85802d	2025-12-21	0	1
f18a80a9-233d-4a7b-aa52-2933dcc2b15b	2025-12-21	2700	33
0aad94f9-6f6b-498b-b620-01fd0809bcbd	2025-12-21	3597	54
afc55c5c-6958-44b0-99f0-e00b198e913d	2025-12-21	7524	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password_hash, role, status, avatar_url, last_login, created_at, updated_at) FROM stdin;
d5672581-401b-469f-b00d-26201a38b759	Root Admin	rootadmin@volunteerhub.com	$2b$12$iEGXkg3exM72pUF5x0N/Ie76uBj/B35OZFaJjM0Z9r136p1Sd6W6a	root_admin	active	/uploads/avatars/default-avatar.png	2025-12-04 08:24:18.086772+00	2025-12-04 08:24:18.086772+00	2025-12-04 08:24:18.086772+00
56278395-01e3-48cd-912b-c40a937af180	chicongn	chicongn@volunteerhub.com	$2b$12$o3GumockHCje3DU95H2qmO0CXpZ.jvS9Z3c0KCQv.WV1A/kRkLjmy	event_manager	active	/uploads/avatars/chicongn.jpg	2025-12-04 08:24:18.202353+00	2025-12-04 08:24:18.202353+00	2025-12-04 08:24:18.202353+00
5ea137e7-860e-4648-94f8-8015437cc00c	Emma Davis	emma.volunteer@gmail.com	$2a$06$fn6Qkyf4QQViifR3V.IBuuSMkoMjqwTRz.1BxuRu2lx8CtakqveVu	volunteer	active	/uploads/avatars/default-avatar.png	2025-12-04 08:24:18.24334+00	2025-12-04 08:24:18.24334+00	2025-12-04 08:24:18.24334+00
4668267f-c511-4cfe-94fe-c7e3729e3494	Liam Chen	liam.volunteer@gmail.com	$2a$06$YssgqPeYcs8Y8QnuazZecOn0kD99kcAqWRKB3NZCDX3dGHFZaiFyq	volunteer	active	/uploads/avatars/default-avatar.png	2025-12-04 08:24:18.24334+00	2025-12-04 08:24:18.24334+00	2025-12-04 08:24:18.24334+00
963b3407-18e6-473b-b707-108d7724c43b	Sophia Martinez	sophia.volunteer@gmail.com	$2a$06$VjH3sXiq4fg5pDfA/xrhkegpoH8M0P2SLBqLqw5l6E1LMtgco5/yy	volunteer	active	/uploads/avatars/default-avatar.png	2025-12-04 08:24:18.24334+00	2025-12-04 08:24:18.24334+00	2025-12-04 08:24:18.24334+00
982402b1-a4d5-4015-aba0-07269dccc225	register	register@gmail.com	$2b$12$wYkcti67x7PT4wOEdCFWUO8O98mnF97OoRnOx6sJm4FmseeSM.EWK	volunteer	active	/images/default-avatar.png	2025-12-17 06:33:56.683+00	2025-12-17 06:33:56.683+00	2025-12-17 06:33:56.683+00
de9346e2-ef89-4fb6-bbf6-6c00badf07c7	user002	user002@gmail.com	$2b$12$pIyvFK4tMW6EdRUrLCXYy.sW5ULpDqrkspainljc5DjlOlY3WsXqK	volunteer	active	/images/default-avatar.png	2025-12-17 06:42:47.845+00	2025-12-17 06:42:47.845+00	2025-12-17 06:42:47.845+00
c7fcfed5-ce2e-457f-b523-51843fcef6c7	PC01	dat.storage1415.01@gmail.com	$2b$12$WcGj5AWWPxVX3JlmUjxD7e0YbE2iAsj3vUQu9LYJxgqP/ACNI0T1q	volunteer	active	/uploads/avatars/default-avatar.png	2025-12-18 04:38:01.956+00	2025-12-18 04:38:01.956+00	2025-12-18 04:38:01.956+00
003dd505-f023-4e14-b170-a6fe959c42f5	công chim 	aduvip22222@gmail.com	$2b$12$HmtXbB0W91wTvwUzqSeytOgu6iUOF61KGEgHgKNWTjjVX19/TArOS	volunteer	locked	/images/default-avatar.png	2025-12-20 06:39:49.045+00	2025-12-20 06:39:49.045+00	2025-12-20 15:08:05.859222+00
1c13588e-aa0e-420c-9b04-2ac2c69ff966	vietanh	vietanh1220057a@gmail.com	$2b$12$dmMxtd4n353q00CjlbC2uuL/Hc7rH612UhagrOx3iuWTk.luyH88W	volunteer	locked	/images/default-avatar.png	2025-12-17 09:41:35.097+00	2025-12-17 09:41:35.097+00	2025-12-20 15:09:45.301649+00
52778341-f7a8-4a68-957c-8fe6364e3f2b	example	example@gmail.com	$2b$12$CAwP41rYIqP97J0eOeTo1OBCH2jjAtC3JH5zQxJgiN0Mh0k1dh7dO	volunteer	active	/images/default-avatar.png	2025-12-17 02:48:20.508+00	2025-12-17 02:48:20.508+00	2025-12-18 07:24:26.067421+00
c1053a85-e0a0-46f8-87bf-261b98a5c5bc	vietanh	vietanh122005sdfsdf4a@gmail.com	$2b$12$d8Y/B7t.4QoXNmVTy8KfNOVdbA6xi5NqdtlvroBAfoSU0rwRuYud6	event_manager	active	uploads/avatars/1766226495082-763328568.jpg	2025-12-17 15:10:32.905+00	2025-12-17 15:10:32.905+00	2025-12-20 10:28:15.47679+00
b2375272-de40-40f5-8eca-5a2b29e6c67a	Đỗ Thành Đạt	user007@gmail.com	$2b$12$0Hb/jiyTthRw0qdzDhd6JejaUL5QNZGO7EVdmgJCd.yDXKhQbFajG	event_manager	active	/images/default-avatar.png	2025-12-21 10:41:17.871+00	2025-12-21 10:41:17.871+00	2025-12-21 14:04:40.985227+00
fe5331be-c13a-432c-b558-fdea68c096d3	testuser1	testaccount05@gmail.com	$2b$12$ZX9cKYqeIyWqCXHtMEdyIeaVvo6epZ0qoW2HvJ5/xWc/nE7384jJW	volunteer	active	/images/default-avatar.png	2025-12-21 16:26:18.434+00	2025-12-21 16:26:18.434+00	2025-12-21 16:26:18.434+00
4b3467ba-e28d-4306-903f-33469774488e	Vu Viet Anh	vietanh12200555@gmail.com	$2b$12$b9Co.xRbLpXI0tYXwsMeOOz6tE1sdbMSDdUPLI.CRVSWOC9c3qn3.	volunteer	active	/images/default-avatar.png	2025-12-21 15:48:32.979+00	2025-12-21 15:48:32.979+00	2025-12-21 15:48:32.979+00
354744f2-6982-46a1-8b66-51ac38255439	Theresia Van Astrea	theresia@volunteerhub.com	$2b$12$a0e4.03zd8zDUMtU1QOccOtYsEdPUZlCk2eis3iEEteXWsMdaOXqu	admin	active	uploads/avatars/1766227290934-454644339.png	2025-12-04 08:24:18.202353+00	2025-12-04 08:24:18.202353+00	2025-12-20 10:41:31.34287+00
a802ec32-ccb6-4336-b861-c60e6cdb750e	hải dương	haiduong@gmail.com	$2b$12$zaV1YGL.tLMq.RQVyyqM7.FWEjUru8Jjorz9rstKB9NTTqstMQ62a	event_manager	active	/images/default-avatar.png	2025-12-21 14:06:28.835+00	2025-12-21 14:06:28.835+00	2025-12-21 14:10:48.92422+00
f2667f3b-30bc-4a55-9b8c-14be0b5413fe	anh duy	anhduy@gmail.com	$2b$12$.z9XvCXx0kHho73qHRvhI.j6x7xcnp6NfXYU6Yb1vfvfnFSDk4mN.	volunteer	active	/images/default-avatar.png	2025-12-21 15:08:15.171+00	2025-12-21 15:08:15.171+00	2025-12-21 15:08:15.171+00
44b0471f-3b1f-4c87-90e1-223f13d6d105	Dung Nguyenb	yewup@2200freefonts.com	$2b$12$DlD2OxFHGJOrZhnuh.J3beN4eNiTPx9GV/fxNYnU5URAGU55wGHXG	volunteer	active	/images/default-avatar.png	2025-12-18 18:19:35.653+00	2025-12-18 18:19:35.653+00	2025-12-19 19:37:51.593008+00
4f991fcd-9830-460a-a086-ee49722dcea5	user1	dat170405@gmail.com	$2b$12$8pO3ztjW/IY6Q/SoFu2CG.r3PlYsdy/xaMdT8W4Ya9OoAyYcu11ju	volunteer	active	/images/default-avatar.png	2025-12-21 15:23:52.825+00	2025-12-21 15:23:52.825+00	2025-12-21 15:23:52.825+00
0f7af42e-a395-4419-bb5a-9dd661661f82	PC01	aduvip1@gmail.com	$2b$12$PpPrfFIXkjbGIkVSTvjcZext/YN4lQx5A4VZrVi6HCLTE/Fx50E5C	volunteer	active	/images/default-avatar.png	2025-12-18 04:39:50.86+00	2025-12-18 04:39:50.86+00	2025-12-18 15:02:47.903639+00
f18a80a9-233d-4a7b-aa52-2933dcc2b15b	Vu Viet Anh	vietanh1220055@gmail.com	$2b$12$IR8JkvuVpnll53CBJSKD7uV9X5L5476TAYEHQ2MzY4/vk2bE6wVmm	admin	active	https://file3.qdnd.vn/data/images/0/2025/06/27/upload_2180/ca15.jpg?dpi=150&quality=100&w=870	2025-12-19 12:50:13.985+00	2025-12-19 12:50:13.985+00	2025-12-19 17:17:07.705793+00
47c86965-9cec-417f-98f9-2e288ce3bad5	user008	user008@gmail.com	$2b$12$qdVykfaT0KL2zHMwQuWFRecKpBiUhAiWmAyLIMKesYjtRmJJgCV9m	event_manager	active	/images/default-avatar.png	2025-12-17 15:25:39.542+00	2025-12-17 15:25:39.542+00	2025-12-21 06:20:30.219385+00
e10c836a-412c-4464-bb07-1804d6edc524	vũ việt anh	vietanh12200579a@gmail.com	$2b$12$fJ4/GZTqBfO6rzyFOKPsreYy5lJJzY0M2MaRpRBToS1SL5dY/tZ62	event_manager	active	/images/default-avatar.png	2025-12-21 06:50:43.687+00	2025-12-21 06:50:43.687+00	2025-12-21 07:09:48.950636+00
f061afd7-9d54-405a-9564-c5e38b85802d	Đỗ Thành Đạt	dat170406@gmail.com	$2b$12$aCaJt86rGn7MVoVWblKr4eca8GY75t.9.WBcSSWwstc5r5x/fD8ti	volunteer	active	/images/default-avatar.png	2025-12-21 15:26:16.912+00	2025-12-21 15:26:16.912+00	2025-12-21 15:26:16.912+00
9db5955a-95d9-41db-b356-8d68cf782aa5	Đặng Châu Anh	dangchauanh@gmail.com	$2b$12$a1g.MWIX8aRV08St5FgViOFrBD6O.E3LXEagcgX8JlxzVEOpaDNVi	volunteer	locked	/images/default-avatar.png	2025-12-20 08:31:28.001+00	2025-12-20 08:31:28.001+00	2025-12-20 15:08:04.307435+00
aec2f26e-58ff-4b6b-b675-d1288893db72	vũ việt anh	vietanh12200577a@gmail.com	$2b$12$mL.iUNv/cl76j75lnxqmA.NR6C7BJfeHOkbbYfyZu.EDnTEc356aC	event_manager	active	/images/default-avatar.png	2025-12-21 06:46:36.567+00	2025-12-21 06:46:36.567+00	2025-12-21 07:09:48.949532+00
ed4c3bac-dcbc-444c-b887-5fef9f11d05d	người đẹp trai	aduvip222333@gmail.com	$2b$12$35JVwbUJlAJxR63vo7ZyDOc1cb8fAwTG/cudcJfULVWzFrw9ufTH.	event_manager	active	/images/default-avatar.png	2025-12-19 19:05:49.976+00	2025-12-19 19:05:49.976+00	2025-12-21 08:07:40.786214+00
e5ff9f4b-3f27-4c37-839f-12b5c4b70411	User01	testaccount01@gmail.com	$2b$12$bxEGVmRvbzfr6Bl5khMgt..BivfxGYEx0JCTog1VHyWhgffsorppG	volunteer	active	/images/default-avatar.png	2025-12-21 15:34:55.08+00	2025-12-21 15:34:55.08+00	2025-12-21 15:34:55.08+00
8e96cf45-eaea-4e38-81e7-ef79aa97c3a9	Lab2	aduvip123@gmail.com	$2b$12$CWEnacOXY4ncRX2iRA9d..5nlzwSiaA6M8FVcz5jhRMcxF0GU3Rla	volunteer	active	/images/default-avatar.png	2025-12-19 17:30:26.774+00	2025-12-19 17:30:26.774+00	2025-12-21 14:08:31.706021+00
afc55c5c-6958-44b0-99f0-e00b198e913d	vũ việt anh	vietanh@gmail.com	$2b$12$6SsYL/qd30SQpiTFtoOBiOoB1JOJjxr2X3S7o7Nuw/3QDhcZsF29.	volunteer	active	/images/default-avatar.png	2025-12-21 15:36:56.129+00	2025-12-21 15:36:56.129+00	2025-12-21 15:36:56.129+00
7e2d6eb0-180f-4d9c-b113-4ab1ee6fc683	abc	clone141592653581@gmail.com	$2b$12$p495hMgCGGJ8ds4hc2Ye0e7JTDioebz7WCSBW8hL3IIwf0qYKu/1K	volunteer	active	/images/default-avatar.png	2025-12-21 15:50:27.034+00	2025-12-21 15:50:27.034+00	2025-12-21 15:50:27.034+00
b83b0246-9e3c-4097-b731-ce3f9c19a97e	Công phi công	Congpilot1@gmail.com	$2b$12$7Fb4YfbLdsY/gs5i2vpKy.8/WTKoNselb9GZj0OfemL3T/GzcAynO	volunteer	active	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvO3yVSa73PrXzzkJOhdtEl9kJDrjc81gPrQ&s	2025-12-20 08:54:37.676+00	2025-12-20 08:54:37.676+00	2025-12-21 14:09:31.663492+00
12ef2d62-303f-482c-9f02-bf40c6997d3e	Vu Viet Anh	oxaamgbpn7431@oxaam.com	$2b$12$/wapgyTeFyCEjHwYIeyFseQHX0weW/IyoZluV4Uvt6g8298k39AFu	volunteer	active	/images/default-avatar.png	2025-12-21 15:45:45.903+00	2025-12-21 15:45:45.903+00	2025-12-21 15:45:45.903+00
13bfc626-aa4e-4217-a067-2eb54d3be344	thanh dat	thanhdat@gmail.com	$2b$12$Cz/zBwPAmbA49MsF9RAaEuM43dLx3P5Il43U70Er9zq8Sk6EzY6My	volunteer	active	/images/default-avatar.png	2025-12-21 15:47:21.741+00	2025-12-21 15:47:21.741+00	2025-12-21 15:47:21.741+00
09a54261-4677-4d83-994e-93c6d80bd741	abc	clone1415926535822@gmail.com	$2b$12$pXDYBAnHmYfIxZcO/zWJ6ea2JMrffQhDXXJRPq1ZXb5UNyf/rmN12	volunteer	active	/images/default-avatar.png	2025-12-21 15:58:02.295+00	2025-12-21 15:58:02.295+00	2025-12-21 15:58:02.295+00
0c302afa-08d8-4edf-87e7-f71e85443736	test06	testaccount06@gmail.com	$2b$12$F4h6fyaXElZUuBsKep.j6eItgwAsI9Clgu6O7lyG2yjlEASKja6TC	volunteer	active	/images/default-avatar.png	2025-12-21 16:28:33.431+00	2025-12-21 16:28:33.431+00	2025-12-21 16:28:33.431+00
0aad94f9-6f6b-498b-b620-01fd0809bcbd	user001	user001@gmail.com	$2b$12$9WiKaoUAwQSzOjB0NwtVXuuot/rDOXOrbs48Y5slzrjsKTbmGPQOu	event_manager	active	uploads/avatars/1766227207049-434242872.jpg	2025-12-19 04:20:14.68+00	2025-12-19 04:20:14.68+00	2025-12-21 16:34:13.728633+00
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: comment_reports comment_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reports
    ADD CONSTRAINT comment_reports_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: post_reports post_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: push_subscription push_subscription_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscription
    ADD CONSTRAINT push_subscription_endpoint_key UNIQUE (endpoint);


--
-- Name: push_subscription push_subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscription
    ADD CONSTRAINT push_subscription_pkey PRIMARY KEY (id);


--
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (post_id, user_id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: registrations registrations_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: user_daily_activity user_daily_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_daily_activity
    ADD CONSTRAINT user_daily_activity_pkey PRIMARY KEY (user_id, activity_date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_comments_post_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_created_at ON public.comments USING btree (post_id, created_at DESC);


--
-- Name: idx_events_categories_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_categories_gin ON public.events USING gin (categories);


--
-- Name: idx_events_location_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_location_trgm ON public.events USING gin (location public.gin_trgm_ops);


--
-- Name: idx_events_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_name_trgm ON public.events USING gin (name public.gin_trgm_ops);


--
-- Name: idx_events_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_owner ON public.events USING btree (owner_id);


--
-- Name: idx_events_status_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_status_time ON public.events USING btree (status, start_time DESC);


--
-- Name: idx_notifications_user_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created_at ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_posts_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_author ON public.posts USING btree (author_id);


--
-- Name: idx_posts_event_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_event_created_at ON public.posts USING btree (event_id, created_at DESC);


--
-- Name: idx_reactions_post_user_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reactions_post_user_created_at ON public.reactions USING btree (post_id, user_id, created_at DESC);


--
-- Name: idx_registrations_event_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_event_user ON public.registrations USING btree (event_id, user_id);


--
-- Name: idx_registrations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_user ON public.registrations USING btree (user_id);


--
-- Name: events events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comment_reports comment_reports_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reports
    ADD CONSTRAINT comment_reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_reports comment_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reports
    ADD CONSTRAINT comment_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: events events_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: push_subscription fk_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscription
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_daily_activity fk_user_daily_activity_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_daily_activity
    ADD CONSTRAINT fk_user_daily_activity_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_reports post_reports_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_reports post_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_reports
    ADD CONSTRAINT post_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: reactions reactions_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: reactions reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 8ZXzd3pxOQDTlhvSXcB5hNZjxLg1bStPlLN4lTClDgHr4QiNYqL7dXScmqyBqTq

