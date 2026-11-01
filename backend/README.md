# Apex F1 backend

The backend is a standalone Go REST API. It owns provider integration,
normalisation, persistence and the public `/api/v1` contract. The frontend does
not connect directly to PostgreSQL or external Formula 1 providers.

## Requirements

- Go 1.24 or newer
- Docker Desktop
- The project-local Supabase CLI (`npm install` from the repository root)

## Local setup

Copy `.env.example` to `.env.local`, fill in the values, then run
`source .env.local`. The declarations use `export` so child processes such as
`go run` receive them. The Go process intentionally does not load `.env` files
by itself.

Start local Supabase and apply every migration from `supabase/migrations`:

```sh
cd ..
npm run database:start
npm run database:reset
```

The default local database URL is
`postgresql://postgres:postgres@127.0.0.1:54322/postgres`. Use it for local API,
ingestion and integration-test commands. `database:reset` destroys only the local
Docker database, recreates it, and replays every migration in order.

To deploy tested migrations, link the CLI to the hosted Supabase project once,
review the pending migration list, and run `npx supabase db push`. Never use
`db reset` against the hosted project.

Import a calendar, then run the API:

```sh
go run ./cmd/ingest -season 2026 -kind all
go run ./cmd/api
```

The frontend uses port `8080` in the Lovable development environment. The API
therefore listens on `http://localhost:8081` by default.

Run verification:

```sh
go test ./...
go vet ./...
```

## Implemented endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /api/v1/seasons/current`
- `GET /api/v1/seasons/{year}/races`
- `GET /api/v1/races/next`
- `GET /api/v1/races/{raceId}/sessions`
- `GET /api/v1/sessions/{sessionId}/classification`
- `GET /api/v1/live/timing`
- `GET /api/v1/drivers`
- `GET /api/v1/drivers/{driverId}`
- `GET /api/v1/teams`
- `GET /api/v1/teams/{teamId}`
- `GET /api/v1/seasons/{year}/driver-standings`
- `GET /api/v1/seasons/{year}/constructor-standings`

The canonical contract is [`apispec/openapi.yaml`](apispec/openapi.yaml).

## Live timing

Live timing snapshots are normalised from OpenF1 by the Go API and cached for
four seconds. Historical/latest publicly accessible data works without a token.
For real-time race-weekend data, set `APEX_OPENF1_ACCESS_TOKEN` only in the
backend deployment environment. Never expose this value as a `VITE_*` variable.

For local live timing, start the SignalR sidecar from the repository root:

```sh
npm run racecar:dev
```

The Go API connects to it at `http://localhost:3002` by default and falls back
to OpenF1 if the sidecar is unavailable. Override the address with
`APEX_F1_LIVE_TIMING_BASE_URL` when needed.

## Ingestion rules

Calendar ingestion is explicit and never runs in a visitor request. Repeating
an import upserts the same season, circuit and race records using database
constraints, and each successful import is recorded in `ingestion_runs`.

Jolpica IDs are stored as source identifiers. They are not treated as IDs from
OpenF1, F1DB or any future provider.

Use `-kind calendar`, `-kind standings`, or `-kind classifications` to refresh
one dataset. The default `-kind all` imports all datasets in dependency order.
