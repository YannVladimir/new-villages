alter table community_creation_requests
    add column visibility varchar(20) not null default 'PUBLIC';
