-- OneVillage initial schema
-- All primary keys are UUIDs generated application-side (Hibernate @UuidGenerator),
-- so no DB-level default is required here.

create table users (
    id uuid primary key,
    full_name varchar(120) not null,
    email varchar(255) not null,
    password_hash varchar(255) not null,
    role varchar(30) not null,
    country varchar(100),
    city varchar(100),
    preferred_language varchar(50),
    bio text,
    avatar_url varchar(500),
    account_status varchar(20) not null default 'ACTIVE',
    email_verified boolean not null default false,
    selected_community_id uuid,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_users_email unique (email)
);
create index idx_users_role on users (role);
create index idx_users_account_status on users (account_status);

create table user_languages (
    user_id uuid not null references users (id) on delete cascade,
    language varchar(50) not null
);
create index idx_user_languages_user_id on user_languages (user_id);

create table terms_versions (
    id uuid primary key,
    version varchar(50) not null,
    body text not null,
    published_at timestamptz not null,
    is_current boolean not null default false,
    constraint uq_terms_versions_version unique (version)
);

create table user_terms_acceptances (
    id uuid primary key,
    user_id uuid not null references users (id) on delete cascade,
    terms_version_id uuid not null references terms_versions (id) on delete cascade,
    accepted_at timestamptz not null,
    ip_address varchar(64)
);
create index idx_uta_user_id on user_terms_acceptances (user_id);
create index idx_uta_user_version on user_terms_acceptances (user_id, terms_version_id);

create table email_verification_tokens (
    id uuid primary key,
    user_id uuid not null references users (id) on delete cascade,
    token varchar(100) not null,
    expires_at timestamptz not null,
    created_at timestamptz not null,
    constraint uq_evt_token unique (token)
);

create table password_reset_tokens (
    id uuid primary key,
    user_id uuid not null references users (id) on delete cascade,
    token varchar(100) not null,
    expires_at timestamptz not null,
    used boolean not null default false,
    created_at timestamptz not null,
    constraint uq_prt_token unique (token)
);

create table refresh_tokens (
    id uuid primary key,
    user_id uuid not null references users (id) on delete cascade,
    expires_at timestamptz not null,
    revoked boolean not null default false,
    created_at timestamptz not null
);
create index idx_refresh_tokens_user_id on refresh_tokens (user_id);

create table communities (
    id uuid primary key,
    name varchar(120) not null,
    description text,
    category varchar(60),
    visibility varchar(20) not null default 'PUBLIC',
    cover_image_url varchar(500),
    icon_name varchar(60),
    color varchar(30),
    status varchar(20) not null default 'PENDING',
    leader_id uuid not null references users (id),
    created_at timestamptz not null
);
create index idx_communities_status on communities (status);
create index idx_communities_leader_id on communities (leader_id);

alter table users
    add constraint fk_users_selected_community foreign key (selected_community_id) references communities (id) on delete set null;

create table community_creation_requests (
    id uuid primary key,
    applicant_id uuid not null references users (id) on delete cascade,
    proposed_name varchar(120) not null,
    description text,
    category varchar(60),
    city varchar(100),
    status varchar(20) not null default 'PENDING',
    reviewed_by uuid references users (id),
    reviewed_at timestamptz,
    resulting_community_id uuid references communities (id),
    created_at timestamptz not null
);
create index idx_ccr_status on community_creation_requests (status);

create table community_memberships (
    id uuid primary key,
    community_id uuid not null references communities (id) on delete cascade,
    user_id uuid not null references users (id) on delete cascade,
    role_in_community varchar(20) not null default 'MEMBER',
    status varchar(30) not null,
    requested_at timestamptz not null,
    joined_at timestamptz,
    constraint uq_membership_community_user unique (community_id, user_id)
);
create index idx_memberships_user_id on community_memberships (user_id);
create index idx_memberships_community_status on community_memberships (community_id, status);

create table community_invitations (
    id uuid primary key,
    community_id uuid not null references communities (id) on delete cascade,
    invited_email varchar(255),
    invited_user_id uuid references users (id),
    invited_by uuid not null references users (id),
    status varchar(20) not null default 'PENDING',
    created_at timestamptz not null
);
create index idx_invitations_invited_user on community_invitations (invited_user_id, status);
create index idx_invitations_invited_email on community_invitations (invited_email, status);

create table organizations (
    id uuid primary key,
    owner_user_id uuid not null references users (id) on delete cascade,
    name varchar(150) not null,
    description text,
    services text,
    logo_url varchar(500),
    contact_email varchar(255),
    status varchar(20) not null default 'ACTIVE',
    created_at timestamptz not null,
    constraint uq_organizations_owner unique (owner_user_id)
);

create table events (
    id uuid primary key,
    community_id uuid references communities (id) on delete cascade,
    organization_id uuid references organizations (id) on delete cascade,
    title varchar(200) not null,
    description text,
    type varchar(30) not null,
    start_at timestamptz not null,
    is_online boolean not null default false,
    location varchar(255),
    online_link varchar(500),
    cover_image_url varchar(500),
    created_by uuid not null references users (id),
    created_at timestamptz not null
);
create index idx_events_community_id on events (community_id);
create index idx_events_start_at on events (start_at);

create table event_rsvps (
    id uuid primary key,
    event_id uuid not null references events (id) on delete cascade,
    user_id uuid not null references users (id) on delete cascade,
    status varchar(20) not null,
    responded_at timestamptz not null,
    constraint uq_rsvp_event_user unique (event_id, user_id)
);

create table conversations (
    id uuid primary key,
    created_at timestamptz not null
);

create table conversation_participants (
    id uuid primary key,
    conversation_id uuid not null references conversations (id) on delete cascade,
    user_id uuid not null references users (id) on delete cascade,
    constraint uq_participant_conversation_user unique (conversation_id, user_id)
);
create index idx_participants_user_id on conversation_participants (user_id);

create table messages (
    id uuid primary key,
    conversation_id uuid not null references conversations (id) on delete cascade,
    sender_id uuid not null references users (id),
    body text not null,
    sent_at timestamptz not null,
    read_at timestamptz
);
create index idx_messages_conversation_id on messages (conversation_id, sent_at);

create table blocked_users (
    id uuid primary key,
    blocker_id uuid not null references users (id) on delete cascade,
    blocked_id uuid not null references users (id) on delete cascade,
    created_at timestamptz not null,
    constraint uq_block_pair unique (blocker_id, blocked_id)
);

create table notifications (
    id uuid primary key,
    recipient_id uuid not null references users (id) on delete cascade,
    type varchar(30) not null,
    title varchar(200) not null,
    description text,
    related_entity_id uuid,
    is_read boolean not null default false,
    created_at timestamptz not null
);
create index idx_notifications_recipient on notifications (recipient_id, created_at desc);

create table reports (
    id uuid primary key,
    reporter_id uuid not null references users (id),
    target_type varchar(20) not null,
    target_id uuid not null,
    reason varchar(200) not null,
    details text,
    status varchar(20) not null default 'OPEN',
    resolved_by uuid references users (id),
    resolved_at timestamptz,
    created_at timestamptz not null
);
create index idx_reports_status on reports (status);

create table activity_logs (
    id uuid primary key,
    actor_id uuid not null references users (id),
    action varchar(200) not null,
    target_type varchar(50),
    target_id uuid,
    description text,
    created_at timestamptz not null
);
create index idx_activity_logs_created_at on activity_logs (created_at desc);

create table subscriptions (
    id uuid primary key,
    user_id uuid not null references users (id) on delete cascade,
    plan varchar(30) not null default 'FREE',
    status varchar(20) not null default 'ACTIVE',
    stripe_customer_id varchar(100),
    stripe_subscription_id varchar(100),
    current_period_end timestamptz,
    created_at timestamptz not null,
    constraint uq_subscriptions_user unique (user_id)
);

create table payments (
    id uuid primary key,
    subscription_id uuid not null references subscriptions (id) on delete cascade,
    amount numeric(10, 2) not null,
    currency varchar(10) not null,
    status varchar(20) not null,
    stripe_invoice_id varchar(100),
    paid_at timestamptz not null
);
create index idx_payments_subscription_id on payments (subscription_id);
