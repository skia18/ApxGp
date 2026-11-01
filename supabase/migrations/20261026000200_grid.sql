BEGIN;

CREATE TABLE drivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    given_name text NOT NULL,
    family_name text NOT NULL,
    code text,
    permanent_number smallint CHECK (permanent_number > 0),
    date_of_birth date,
    nationality text NOT NULL,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_external_id text NOT NULL,
    source_retrieved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (source_id, source_external_id)
);

CREATE TABLE constructors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    nationality text NOT NULL,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_external_id text NOT NULL,
    source_retrieved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (source_id, source_external_id)
);

CREATE TABLE driver_season_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    constructor_id uuid REFERENCES constructors(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (season_id, driver_id, constructor_id)
);

CREATE INDEX driver_season_entries_driver_idx ON driver_season_entries (driver_id, season_id);
CREATE INDEX driver_season_entries_constructor_idx ON driver_season_entries (constructor_id, season_id);

CREATE TABLE driver_standings (
    season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    constructor_id uuid REFERENCES constructors(id) ON DELETE RESTRICT,
    round smallint NOT NULL CHECK (round >= 0),
    position smallint NOT NULL CHECK (position > 0),
    points numeric(10, 3) NOT NULL CHECK (points >= 0),
    wins smallint NOT NULL CHECK (wins >= 0),
    source_id text NOT NULL REFERENCES data_sources(id),
    source_retrieved_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (season_id, driver_id)
);

CREATE INDEX driver_standings_order_idx ON driver_standings (season_id, position);

CREATE TABLE constructor_standings (
    season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    constructor_id uuid NOT NULL REFERENCES constructors(id) ON DELETE RESTRICT,
    round smallint NOT NULL CHECK (round >= 0),
    position smallint NOT NULL CHECK (position > 0),
    points numeric(10, 3) NOT NULL CHECK (points >= 0),
    wins smallint NOT NULL CHECK (wins >= 0),
    source_id text NOT NULL REFERENCES data_sources(id),
    source_retrieved_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (season_id, constructor_id)
);

CREATE INDEX constructor_standings_order_idx ON constructor_standings (season_id, position);

COMMIT;
