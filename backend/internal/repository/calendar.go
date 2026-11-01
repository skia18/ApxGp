package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type CalendarRepository interface {
	CurrentSeason(context.Context) (domain.Season, error)
	RacesBySeason(context.Context, int) ([]domain.Race, *domain.Freshness, error)
	NextRace(context.Context, time.Time) (domain.Race, *domain.Freshness, error)
}

type CalendarWriter interface {
	ImportCalendar(context.Context, int, []domain.Race, time.Time) (domain.IngestionResult, error)
}

type PostgresCalendar struct {
	pool *pgxpool.Pool
}

func NewPostgresCalendar(pool *pgxpool.Pool) *PostgresCalendar {
	return &PostgresCalendar{pool: pool}
}

func (r *PostgresCalendar) CurrentSeason(ctx context.Context) (domain.Season, error) {
	var season domain.Season
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, year, is_current, updated_at
		FROM seasons
		ORDER BY is_current DESC, year DESC
		LIMIT 1
	`).Scan(&season.ID, &season.Year, &season.IsCurrent, &season.UpdatedAt)
	return season, mapNotFound(err)
}

func (r *PostgresCalendar) RacesBySeason(ctx context.Context, year int) ([]domain.Race, *domain.Freshness, error) {
	rows, err := r.pool.Query(ctx, raceSelect+`
		WHERE s.year = $1
		ORDER BY r.round
	`, year)
	if err != nil {
		return nil, nil, fmt.Errorf("query season races: %w", err)
	}
	defer rows.Close()
	return scanRaces(rows)
}

func (r *PostgresCalendar) NextRace(ctx context.Context, after time.Time) (domain.Race, *domain.Freshness, error) {
	row := r.pool.QueryRow(ctx, raceSelect+`
		WHERE r.starts_at >= $1
		ORDER BY r.starts_at
		LIMIT 1
	`, after)
	race, freshness, err := scanRace(row)
	return race, freshness, mapNotFound(err)
}

func (r *PostgresCalendar) ImportCalendar(ctx context.Context, year int, races []domain.Race, retrievedAt time.Time) (result domain.IngestionResult, returnedErr error) {
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return result, fmt.Errorf("begin calendar import: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := tx.QueryRow(ctx, `
		INSERT INTO ingestion_runs (source_id, kind, status, started_at)
		VALUES ('jolpica', 'calendar', 'running', now())
		RETURNING id::text
	`).Scan(&result.RunID); err != nil {
		return result, fmt.Errorf("create ingestion run: %w", err)
	}
	result.Season = year

	if year == time.Now().UTC().Year() {
		if _, err := tx.Exec(ctx, `UPDATE seasons SET is_current = false, updated_at = now() WHERE is_current`); err != nil {
			return result, fmt.Errorf("clear current season: %w", err)
		}
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO seasons (year, is_current, source_id, source_retrieved_at)
		VALUES ($1, $2, 'jolpica', $3)
		ON CONFLICT (year) DO UPDATE SET
			is_current = EXCLUDED.is_current,
			source_id = EXCLUDED.source_id,
			source_retrieved_at = EXCLUDED.source_retrieved_at,
			updated_at = now()
	`, year, year == time.Now().UTC().Year(), retrievedAt)
	if err != nil {
		return result, fmt.Errorf("upsert season: %w", err)
	}

	for _, race := range races {
		var circuitID string
		if err := tx.QueryRow(ctx, `
			INSERT INTO circuits (slug, name, locality, country, latitude, longitude, source_id, source_external_id, source_retrieved_at)
			VALUES ($1, $2, $3, $4, $5, $6, 'jolpica', $1, $7)
			ON CONFLICT (slug) DO UPDATE SET
				name = EXCLUDED.name,
				locality = EXCLUDED.locality,
				country = EXCLUDED.country,
				latitude = EXCLUDED.latitude,
				longitude = EXCLUDED.longitude,
				source_retrieved_at = EXCLUDED.source_retrieved_at,
				updated_at = now()
			RETURNING id::text
		`, race.Circuit.Slug, race.Circuit.Name, race.Circuit.Locality, race.Circuit.Country, race.Circuit.Latitude, race.Circuit.Longitude, retrievedAt).Scan(&circuitID); err != nil {
			return result, fmt.Errorf("upsert circuit %q: %w", race.Circuit.Slug, err)
		}

		var inserted bool
		if err := tx.QueryRow(ctx, `
			INSERT INTO races (season_id, circuit_id, round, slug, name, starts_at, source_id, source_external_id, source_retrieved_at)
			SELECT s.id, $2::uuid, $3, $4, $5, $6, 'jolpica', $7, $8
			FROM seasons s WHERE s.year = $1
			ON CONFLICT (season_id, round) DO UPDATE SET
				circuit_id = EXCLUDED.circuit_id,
				slug = EXCLUDED.slug,
				name = EXCLUDED.name,
				starts_at = EXCLUDED.starts_at,
				source_external_id = EXCLUDED.source_external_id,
				source_retrieved_at = EXCLUDED.source_retrieved_at,
				updated_at = now()
			RETURNING (xmax = 0)
		`, year, circuitID, race.Round, race.Slug, race.Name, race.StartsAt, fmt.Sprintf("%d/%d", year, race.Round), retrievedAt).Scan(&inserted); err != nil {
			return result, fmt.Errorf("upsert race round %d: %w", race.Round, err)
		}
		result.Processed++
		if inserted {
			result.Inserted++
		} else {
			result.Updated++
		}
	}

	_, err = tx.Exec(ctx, `
		UPDATE ingestion_runs
		SET status = 'succeeded', finished_at = now(), records_processed = $2,
			records_inserted = $3, records_updated = $4
		WHERE id = $1::uuid
	`, result.RunID, result.Processed, result.Inserted, result.Updated)
	if err != nil {
		return result, fmt.Errorf("finish ingestion run: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return result, fmt.Errorf("commit calendar import: %w", err)
	}
	return result, nil
}

const raceSelect = `
	SELECT r.id::text, s.year, r.round, r.slug, r.name, r.starts_at, r.updated_at,
		c.id::text, c.slug, c.name, c.locality, c.country, c.latitude, c.longitude,
		r.source_id, r.source_retrieved_at
	FROM races r
	JOIN seasons s ON s.id = r.season_id
	JOIN circuits c ON c.id = r.circuit_id
`

type rowScanner interface {
	Scan(...any) error
}

func scanRace(row rowScanner) (domain.Race, *domain.Freshness, error) {
	var race domain.Race
	var source string
	var retrievedAt time.Time
	err := row.Scan(
		&race.ID, &race.Season, &race.Round, &race.Slug, &race.Name, &race.StartsAt, &race.UpdatedAt,
		&race.Circuit.ID, &race.Circuit.Slug, &race.Circuit.Name, &race.Circuit.Locality,
		&race.Circuit.Country, &race.Circuit.Latitude, &race.Circuit.Longitude, &source, &retrievedAt,
	)
	if err != nil {
		return domain.Race{}, nil, err
	}
	return race, &domain.Freshness{Source: source, RetrievedAt: retrievedAt, Stale: time.Since(retrievedAt) > 24*time.Hour}, nil
}

func scanRaces(rows pgx.Rows) ([]domain.Race, *domain.Freshness, error) {
	races := make([]domain.Race, 0)
	var freshness *domain.Freshness
	for rows.Next() {
		race, itemFreshness, err := scanRace(rows)
		if err != nil {
			return nil, nil, fmt.Errorf("scan race: %w", err)
		}
		races = append(races, race)
		if freshness == nil || itemFreshness.RetrievedAt.After(freshness.RetrievedAt) {
			freshness = itemFreshness
		}
	}
	if err := rows.Err(); err != nil {
		return nil, nil, fmt.Errorf("iterate races: %w", err)
	}
	return races, freshness, nil
}

func mapNotFound(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	return err
}
