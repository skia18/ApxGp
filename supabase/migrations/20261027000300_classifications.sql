BEGIN;

CREATE TABLE sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('practice', 'qualifying', 'sprint_qualifying', 'sprint', 'race')),
    name text NOT NULL,
    starts_at timestamptz,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_external_id text NOT NULL,
    source_retrieved_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (race_id, type),
    UNIQUE (source_id, source_external_id)
);

CREATE INDEX sessions_race_idx ON sessions (race_id, starts_at);

CREATE TABLE race_results (
    session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    constructor_id uuid NOT NULL REFERENCES constructors(id) ON DELETE RESTRICT,
    position smallint NOT NULL CHECK (position > 0),
    position_text text NOT NULL,
    points numeric(10, 3) NOT NULL CHECK (points >= 0),
    grid_position smallint NOT NULL CHECK (grid_position >= 0),
    laps integer NOT NULL CHECK (laps >= 0),
    status text NOT NULL,
    elapsed_millis bigint CHECK (elapsed_millis >= 0),
    fastest_lap_rank smallint CHECK (fastest_lap_rank > 0),
    fastest_lap_time text,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_retrieved_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, driver_id),
    UNIQUE (session_id, position)
);

CREATE INDEX race_results_driver_idx ON race_results (driver_id, session_id);

CREATE TABLE qualifying_results (
    session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    constructor_id uuid NOT NULL REFERENCES constructors(id) ON DELETE RESTRICT,
    position smallint NOT NULL CHECK (position > 0),
    q1 text,
    q2 text,
    q3 text,
    source_id text NOT NULL REFERENCES data_sources(id),
    source_retrieved_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, driver_id),
    UNIQUE (session_id, position)
);

CREATE INDEX qualifying_results_driver_idx ON qualifying_results (driver_id, session_id);

COMMIT;
