BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE data_sources (
    id text PRIMARY KEY,
    name text NOT NULL,
    base_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO data_sources (id, name, base_url)
VALUES ('jolpica', 'Jolpica F1 API', 'https://api.jolpi.ca/ergast/f1')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE ingestion_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id text NOT NULL REFERENCES data_sources(id),
    kind text NOT NULL,
    status text NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    records_processed integer NOT NULL DEFAULT 0 CHECK (records_processed >= 0),
    records_inserted integer NOT NULL DEFAULT 0 CHECK (records_inserted >= 0),
    records_updated integer NOT NULL DEFAULT 0 CHECK (records_updated >= 0),
    error_message text
);

CREATE INDEX ingestion_runs_source_started_idx
    ON ingestion_runs (source_id, started_at DESC);

CREATE TABLE seasons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    year smallint NOT NULL UNIQUE CHECK (year >= 1950 AND year <= 2200),
    is_current boolean NOT NULL DEFAULT false,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_retrieved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX seasons_one_current_idx ON seasons (is_current) WHERE is_current;

CREATE TABLE circuits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    locality text NOT NULL,
    country text NOT NULL,
    latitude double precision CHECK (latitude BETWEEN -90 AND 90),
    longitude double precision CHECK (longitude BETWEEN -180 AND 180),
    source_id text NOT NULL REFERENCES data_sources(id),
    source_external_id text NOT NULL,
    source_retrieved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (source_id, source_external_id)
);

CREATE TABLE races (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE RESTRICT,
    circuit_id uuid NOT NULL REFERENCES circuits(id) ON DELETE RESTRICT,
    round smallint NOT NULL CHECK (round > 0),
    slug text NOT NULL,
    name text NOT NULL,
    starts_at timestamptz NOT NULL,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_external_id text NOT NULL,
    source_retrieved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (season_id, round),
    UNIQUE (season_id, slug),
    UNIQUE (source_id, source_external_id)
);

CREATE INDEX races_starts_at_idx ON races (starts_at);
CREATE INDEX races_circuit_idx ON races (circuit_id);

COMMIT;
