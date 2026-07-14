create table community_posts (
    id uuid primary key,
    community_id uuid not null references communities (id) on delete cascade,
    author_id uuid not null references users (id) on delete cascade,
    body text not null,
    created_at timestamptz not null
);
create index idx_community_posts_community_id on community_posts (community_id, created_at desc);
