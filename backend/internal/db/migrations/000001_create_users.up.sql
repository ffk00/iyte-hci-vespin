CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role text NOT NULL CHECK (role IN ('guest', 'registered')),
    email text,
    password_hash text,
    display_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    converted_at timestamptz,
    CHECK (
        (
            role = 'guest'
            AND email IS NULL
            AND password_hash IS NULL
            AND converted_at IS NULL
        )
        OR
        (
            role = 'registered'
            AND email IS NOT NULL
            AND password_hash IS NOT NULL
        )
    )
);

CREATE UNIQUE INDEX users_email_unique_idx ON users (email) WHERE email IS NOT NULL;
