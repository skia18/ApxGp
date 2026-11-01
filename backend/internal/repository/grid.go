package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GridRepository interface {
	Drivers(context.Context) ([]domain.Driver, error)
	Driver(context.Context, string) (domain.Driver, error)
	Constructors(context.Context) ([]domain.Constructor, error)
	Constructor(context.Context, string) (domain.Constructor, error)
	DriverStandings(context.Context, int) (domain.Page[domain.DriverStanding], error)
	ConstructorStandings(context.Context, int) (domain.Page[domain.ConstructorStanding], error)
	ImportStandings(context.Context, domain.StandingsSnapshot) (domain.IngestionResult, error)
}

type PostgresGrid struct{ pool *pgxpool.Pool }

func NewPostgresGrid(pool *pgxpool.Pool) *PostgresGrid { return &PostgresGrid{pool: pool} }

func (r *PostgresGrid) Drivers(ctx context.Context) ([]domain.Driver, error) {
	rows, err := r.pool.Query(ctx, driverSelect+` ORDER BY d.family_name, d.given_name`)
	if err != nil {
		return nil, fmt.Errorf("query drivers: %w", err)
	}
	defer rows.Close()
	items := []domain.Driver{}
	for rows.Next() {
		var d domain.Driver
		if err := scanDriver(rows, &d); err != nil {
			return nil, err
		}
		items = append(items, d)
	}
	return items, rows.Err()
}

func (r *PostgresGrid) Driver(ctx context.Context, slug string) (domain.Driver, error) {
	var d domain.Driver
	err := scanDriver(r.pool.QueryRow(ctx, driverSelect+` WHERE d.slug = $1`, slug), &d)
	return d, mapNotFound(err)
}

func (r *PostgresGrid) Constructors(ctx context.Context) ([]domain.Constructor, error) {
	rows, err := r.pool.Query(ctx, constructorSelect+` ORDER BY c.name`)
	if err != nil {
		return nil, fmt.Errorf("query constructors: %w", err)
	}
	defer rows.Close()
	items := []domain.Constructor{}
	for rows.Next() {
		var c domain.Constructor
		if err := scanConstructor(rows, &c); err != nil {
			return nil, err
		}
		items = append(items, c)
	}
	return items, rows.Err()
}

func (r *PostgresGrid) Constructor(ctx context.Context, slug string) (domain.Constructor, error) {
	var c domain.Constructor
	err := scanConstructor(r.pool.QueryRow(ctx, constructorSelect+` WHERE c.slug = $1`, slug), &c)
	return c, mapNotFound(err)
}

func (r *PostgresGrid) DriverStandings(ctx context.Context, year int) (domain.Page[domain.DriverStanding], error) {
	rows, err := r.pool.Query(ctx, `
		SELECT ds.position, ds.points::float8, ds.wins,
			d.id::text, d.slug, d.given_name, d.family_name, d.code, d.permanent_number, d.date_of_birth, d.nationality,
			c.id::text, c.slug, c.name, c.nationality, ds.source_id, ds.source_retrieved_at
		FROM driver_standings ds JOIN seasons s ON s.id=ds.season_id JOIN drivers d ON d.id=ds.driver_id
		LEFT JOIN constructors c ON c.id=ds.constructor_id WHERE s.year=$1 ORDER BY ds.position`, year)
	if err != nil {
		return domain.Page[domain.DriverStanding]{}, fmt.Errorf("query driver standings: %w", err)
	}
	defer rows.Close()
	items := []domain.DriverStanding{}
	var freshness *domain.Freshness
	for rows.Next() {
		var item domain.DriverStanding
		var constructorID, slug, name, nationality *string
		var source string
		var retrievedAt time.Time
		err := rows.Scan(&item.Position, &item.Points, &item.Wins, &item.Driver.ID, &item.Driver.Slug, &item.Driver.GivenName, &item.Driver.FamilyName, &item.Driver.Code, &item.Driver.PermanentNumber, &item.Driver.DateOfBirth, &item.Driver.Nationality, &constructorID, &slug, &name, &nationality, &source, &retrievedAt)
		if err != nil {
			return domain.Page[domain.DriverStanding]{}, fmt.Errorf("scan driver standing: %w", err)
		}
		if constructorID != nil {
			item.Constructor = &domain.Constructor{ID: *constructorID, Slug: *slug, Name: *name, Nationality: *nationality}
		}
		items = append(items, item)
		freshness = &domain.Freshness{Source: source, RetrievedAt: retrievedAt, Stale: time.Since(retrievedAt) > 24*time.Hour}
	}
	return domain.Page[domain.DriverStanding]{Items: items, Total: len(items), Freshness: freshness}, rows.Err()
}

func (r *PostgresGrid) ConstructorStandings(ctx context.Context, year int) (domain.Page[domain.ConstructorStanding], error) {
	rows, err := r.pool.Query(ctx, `SELECT cs.position, cs.points::float8, cs.wins, c.id::text, c.slug, c.name, c.nationality, cs.source_id, cs.source_retrieved_at FROM constructor_standings cs JOIN seasons s ON s.id=cs.season_id JOIN constructors c ON c.id=cs.constructor_id WHERE s.year=$1 ORDER BY cs.position`, year)
	if err != nil {
		return domain.Page[domain.ConstructorStanding]{}, err
	}
	defer rows.Close()
	items := []domain.ConstructorStanding{}
	var freshness *domain.Freshness
	for rows.Next() {
		var x domain.ConstructorStanding
		var source string
		var at time.Time
		if err := rows.Scan(&x.Position, &x.Points, &x.Wins, &x.Constructor.ID, &x.Constructor.Slug, &x.Constructor.Name, &x.Constructor.Nationality, &source, &at); err != nil {
			return domain.Page[domain.ConstructorStanding]{}, err
		}
		items = append(items, x)
		freshness = &domain.Freshness{Source: source, RetrievedAt: at, Stale: time.Since(at) > 24*time.Hour}
	}
	return domain.Page[domain.ConstructorStanding]{Items: items, Total: len(items), Freshness: freshness}, rows.Err()
}

func (r *PostgresGrid) ImportStandings(ctx context.Context, snapshot domain.StandingsSnapshot) (result domain.IngestionResult, returnedErr error) {
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return result, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	result.Season = snapshot.Season
	if err := tx.QueryRow(ctx, `INSERT INTO ingestion_runs(source_id,kind,status) VALUES('jolpica','standings','running') RETURNING id::text`).Scan(&result.RunID); err != nil {
		return result, err
	}
	for _, item := range snapshot.Constructors {
		cid, err := upsertConstructor(ctx, tx, item.Constructor, snapshot.RetrievedAt)
		if err != nil {
			return result, err
		}
		_, err = tx.Exec(ctx, `INSERT INTO constructor_standings(season_id,constructor_id,round,position,points,wins,source_id,source_retrieved_at) SELECT id,$2::uuid,$3,$4,$5,$6,'jolpica',$7 FROM seasons WHERE year=$1 ON CONFLICT(season_id,constructor_id) DO UPDATE SET round=EXCLUDED.round,position=EXCLUDED.position,points=EXCLUDED.points,wins=EXCLUDED.wins,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now()`, snapshot.Season, cid, snapshot.Round, item.Position, item.Points, item.Wins, snapshot.RetrievedAt)
		if err != nil {
			return result, err
		}
		result.Processed++
	}
	for _, item := range snapshot.Drivers {
		did, err := upsertDriver(ctx, tx, item.Driver, snapshot.RetrievedAt)
		if err != nil {
			return result, err
		}
		var cid *string
		if item.Constructor != nil {
			id, e := upsertConstructor(ctx, tx, *item.Constructor, snapshot.RetrievedAt)
			if e != nil {
				return result, e
			}
			cid = &id
			_, e = tx.Exec(ctx, `INSERT INTO driver_season_entries(season_id,driver_id,constructor_id) SELECT id,$2::uuid,$3::uuid FROM seasons WHERE year=$1 ON CONFLICT(season_id,driver_id,constructor_id) DO UPDATE SET updated_at=now()`, snapshot.Season, did, cid)
			if e != nil {
				return result, e
			}
		}
		_, err = tx.Exec(ctx, `INSERT INTO driver_standings(season_id,driver_id,constructor_id,round,position,points,wins,source_id,source_retrieved_at) SELECT id,$2::uuid,$3::uuid,$4,$5,$6,$7,'jolpica',$8 FROM seasons WHERE year=$1 ON CONFLICT(season_id,driver_id) DO UPDATE SET constructor_id=EXCLUDED.constructor_id,round=EXCLUDED.round,position=EXCLUDED.position,points=EXCLUDED.points,wins=EXCLUDED.wins,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now()`, snapshot.Season, did, cid, snapshot.Round, item.Position, item.Points, item.Wins, snapshot.RetrievedAt)
		if err != nil {
			return result, err
		}
		result.Processed++
	}
	result.Updated = result.Processed
	_, err = tx.Exec(ctx, `UPDATE ingestion_runs SET status='succeeded',finished_at=now(),records_processed=$2,records_updated=$2 WHERE id=$1::uuid`, result.RunID, result.Processed)
	if err != nil {
		return result, err
	}
	if err = tx.Commit(ctx); err != nil {
		return result, err
	}
	return result, nil
}

const driverSelect = `SELECT d.id::text,d.slug,d.given_name,d.family_name,d.code,d.permanent_number,d.date_of_birth,d.nationality FROM drivers d`
const constructorSelect = `SELECT c.id::text,c.slug,c.name,c.nationality FROM constructors c`

type scanner interface{ Scan(...any) error }

func scanDriver(s scanner, d *domain.Driver) error {
	return s.Scan(&d.ID, &d.Slug, &d.GivenName, &d.FamilyName, &d.Code, &d.PermanentNumber, &d.DateOfBirth, &d.Nationality)
}
func scanConstructor(s scanner, c *domain.Constructor) error {
	return s.Scan(&c.ID, &c.Slug, &c.Name, &c.Nationality)
}
func upsertConstructor(ctx context.Context, tx pgx.Tx, c domain.Constructor, at time.Time) (string, error) {
	var id string
	err := tx.QueryRow(ctx, `INSERT INTO constructors(slug,name,nationality,source_id,source_external_id,source_retrieved_at) VALUES($1,$2,$3,'jolpica',$1,$4) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,nationality=EXCLUDED.nationality,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now() RETURNING id::text`, c.Slug, c.Name, c.Nationality, at).Scan(&id)
	return id, err
}
func upsertDriver(ctx context.Context, tx pgx.Tx, d domain.Driver, at time.Time) (string, error) {
	var id string
	err := tx.QueryRow(ctx, `INSERT INTO drivers(slug,given_name,family_name,code,permanent_number,date_of_birth,nationality,source_id,source_external_id,source_retrieved_at) VALUES($1,$2,$3,NULLIF($4,''),$5,$6,$7,'jolpica',$1,$8) ON CONFLICT(slug) DO UPDATE SET given_name=EXCLUDED.given_name,family_name=EXCLUDED.family_name,code=EXCLUDED.code,permanent_number=EXCLUDED.permanent_number,date_of_birth=EXCLUDED.date_of_birth,nationality=EXCLUDED.nationality,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now() RETURNING id::text`, d.Slug, d.GivenName, d.FamilyName, d.Code, d.PermanentNumber, d.DateOfBirth, d.Nationality, at).Scan(&id)
	return id, err
}
