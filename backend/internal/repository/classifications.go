package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClassificationRepository interface {
	Sessions(context.Context, string) ([]domain.Session, error)
	Classification(context.Context, string) (domain.Classification, error)
	ImportClassifications(context.Context, int, []domain.ClassificationSnapshot) (domain.IngestionResult, error)
}

type PostgresClassifications struct{ pool *pgxpool.Pool }

func NewPostgresClassifications(pool *pgxpool.Pool) *PostgresClassifications {
	return &PostgresClassifications{pool: pool}
}

func (r *PostgresClassifications) Sessions(ctx context.Context, raceID string) ([]domain.Session, error) {
	rows, err := r.pool.Query(ctx, `SELECT s.id::text,s.race_id::text,s.type,s.name,s.starts_at FROM sessions s WHERE s.race_id=$1::uuid ORDER BY CASE s.type WHEN 'qualifying' THEN 1 WHEN 'sprint' THEN 2 WHEN 'race' THEN 3 ELSE 0 END`, raceID)
	if err != nil {
		return nil, fmt.Errorf("query sessions: %w", err)
	}
	defer rows.Close()
	items := []domain.Session{}
	for rows.Next() {
		var item domain.Session
		if err := rows.Scan(&item.ID, &item.RaceID, &item.Type, &item.Name, &item.StartsAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *PostgresClassifications) Classification(ctx context.Context, sessionID string) (domain.Classification, error) {
	var result domain.Classification
	var source string
	var retrieved time.Time
	err := r.pool.QueryRow(ctx, `SELECT id::text,race_id::text,type,name,starts_at,source_id,source_retrieved_at FROM sessions WHERE id=$1::uuid`, sessionID).Scan(&result.Session.ID, &result.Session.RaceID, &result.Session.Type, &result.Session.Name, &result.Session.StartsAt, &source, &retrieved)
	if err != nil {
		return result, mapNotFound(err)
	}
	result.Freshness = &domain.Freshness{Source: source, RetrievedAt: retrieved, Stale: time.Since(retrieved) > 24*time.Hour}
	if result.Session.Type == "race" {
		rows, err := r.pool.Query(ctx, `SELECT rr.position,rr.position_text,rr.points::float8,rr.grid_position,rr.laps,rr.status,rr.elapsed_millis,rr.fastest_lap_rank,COALESCE(rr.fastest_lap_time,''),d.id::text,d.slug,d.given_name,d.family_name,d.code,d.permanent_number,d.date_of_birth,d.nationality,c.id::text,c.slug,c.name,c.nationality FROM race_results rr JOIN drivers d ON d.id=rr.driver_id JOIN constructors c ON c.id=rr.constructor_id WHERE rr.session_id=$1::uuid ORDER BY rr.position`, sessionID)
		if err != nil {
			return result, err
		}
		defer rows.Close()
		for rows.Next() {
			var x domain.RaceClassification
			if err := rows.Scan(&x.Position, &x.PositionText, &x.Points, &x.Grid, &x.Laps, &x.Status, &x.ElapsedMillis, &x.FastestLapRank, &x.FastestLap, &x.Driver.ID, &x.Driver.Slug, &x.Driver.GivenName, &x.Driver.FamilyName, &x.Driver.Code, &x.Driver.PermanentNumber, &x.Driver.DateOfBirth, &x.Driver.Nationality, &x.Constructor.ID, &x.Constructor.Slug, &x.Constructor.Name, &x.Constructor.Nationality); err != nil {
				return result, err
			}
			result.Race = append(result.Race, x)
		}
		return result, rows.Err()
	}
	rows, err := r.pool.Query(ctx, `SELECT qr.position,COALESCE(qr.q1,''),COALESCE(qr.q2,''),COALESCE(qr.q3,''),d.id::text,d.slug,d.given_name,d.family_name,d.code,d.permanent_number,d.date_of_birth,d.nationality,c.id::text,c.slug,c.name,c.nationality FROM qualifying_results qr JOIN drivers d ON d.id=qr.driver_id JOIN constructors c ON c.id=qr.constructor_id WHERE qr.session_id=$1::uuid ORDER BY qr.position`, sessionID)
	if err != nil {
		return result, err
	}
	defer rows.Close()
	for rows.Next() {
		var x domain.QualifyingClassification
		if err := rows.Scan(&x.Position, &x.Q1, &x.Q2, &x.Q3, &x.Driver.ID, &x.Driver.Slug, &x.Driver.GivenName, &x.Driver.FamilyName, &x.Driver.Code, &x.Driver.PermanentNumber, &x.Driver.DateOfBirth, &x.Driver.Nationality, &x.Constructor.ID, &x.Constructor.Slug, &x.Constructor.Name, &x.Constructor.Nationality); err != nil {
			return result, err
		}
		result.Qualifying = append(result.Qualifying, x)
	}
	return result, rows.Err()
}

func (r *PostgresClassifications) ImportClassifications(ctx context.Context, season int, snapshots []domain.ClassificationSnapshot) (result domain.IngestionResult, returnedErr error) {
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return result, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	result.Season = season
	if err := tx.QueryRow(ctx, `INSERT INTO ingestion_runs(source_id,kind,status) VALUES('jolpica','classifications','running') RETURNING id::text`).Scan(&result.RunID); err != nil {
		return result, err
	}
	driverIDs := make(map[string]string)
	constructorIDs := make(map[string]string)
	getDriverID := func(driver domain.Driver, at time.Time) (string, error) {
		if id, ok := driverIDs[driver.Slug]; ok {
			return id, nil
		}
		id, err := upsertDriver(ctx, tx, driver, at)
		if err == nil {
			driverIDs[driver.Slug] = id
		}
		return id, err
	}
	getConstructorID := func(constructor domain.Constructor, at time.Time) (string, error) {
		if id, ok := constructorIDs[constructor.Slug]; ok {
			return id, nil
		}
		id, err := upsertConstructor(ctx, tx, constructor, at)
		if err == nil {
			constructorIDs[constructor.Slug] = id
		}
		return id, err
	}
	for _, snapshot := range snapshots {
		var raceID string
		if err := tx.QueryRow(ctx, `SELECT r.id::text FROM races r JOIN seasons s ON s.id=r.season_id WHERE s.year=$1 AND r.round=$2`, season, snapshot.Round).Scan(&raceID); err != nil {
			return result, fmt.Errorf("find race round %d: %w", snapshot.Round, err)
		}
		if len(snapshot.Race) > 0 {
			sessionID, err := upsertSession(ctx, tx, raceID, "race", "Race", fmt.Sprintf("%d/%d/race", season, snapshot.Round), snapshot.RetrievedAt)
			if err != nil {
				return result, err
			}
			for _, item := range snapshot.Race {
				did, err := getDriverID(item.Driver, snapshot.RetrievedAt)
				if err != nil {
					return result, err
				}
				cid, err := getConstructorID(item.Constructor, snapshot.RetrievedAt)
				if err != nil {
					return result, err
				}
				_, err = tx.Exec(ctx, `INSERT INTO race_results(session_id,driver_id,constructor_id,position,position_text,points,grid_position,laps,status,elapsed_millis,fastest_lap_rank,fastest_lap_time,source_id,source_retrieved_at) VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10,$11,NULLIF($12,''),'jolpica',$13) ON CONFLICT(session_id,driver_id) DO UPDATE SET constructor_id=EXCLUDED.constructor_id,position=EXCLUDED.position,position_text=EXCLUDED.position_text,points=EXCLUDED.points,grid_position=EXCLUDED.grid_position,laps=EXCLUDED.laps,status=EXCLUDED.status,elapsed_millis=EXCLUDED.elapsed_millis,fastest_lap_rank=EXCLUDED.fastest_lap_rank,fastest_lap_time=EXCLUDED.fastest_lap_time,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now()`, sessionID, did, cid, item.Position, item.PositionText, item.Points, item.Grid, item.Laps, item.Status, item.ElapsedMillis, item.FastestLapRank, item.FastestLap, snapshot.RetrievedAt)
				if err != nil {
					return result, err
				}
				result.Processed++
			}
		}
		if len(snapshot.Qualifying) > 0 {
			sessionID, err := upsertSession(ctx, tx, raceID, "qualifying", "Qualifying", fmt.Sprintf("%d/%d/qualifying", season, snapshot.Round), snapshot.RetrievedAt)
			if err != nil {
				return result, err
			}
			for _, item := range snapshot.Qualifying {
				did, err := getDriverID(item.Driver, snapshot.RetrievedAt)
				if err != nil {
					return result, err
				}
				cid, err := getConstructorID(item.Constructor, snapshot.RetrievedAt)
				if err != nil {
					return result, err
				}
				_, err = tx.Exec(ctx, `INSERT INTO qualifying_results(session_id,driver_id,constructor_id,position,q1,q2,q3,source_id,source_retrieved_at) VALUES($1::uuid,$2::uuid,$3::uuid,$4,NULLIF($5,''),NULLIF($6,''),NULLIF($7,''),'jolpica',$8) ON CONFLICT(session_id,driver_id) DO UPDATE SET constructor_id=EXCLUDED.constructor_id,position=EXCLUDED.position,q1=EXCLUDED.q1,q2=EXCLUDED.q2,q3=EXCLUDED.q3,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now()`, sessionID, did, cid, item.Position, item.Q1, item.Q2, item.Q3, snapshot.RetrievedAt)
				if err != nil {
					return result, err
				}
				result.Processed++
			}
		}
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

func upsertSession(ctx context.Context, tx pgx.Tx, raceID, kind, name, externalID string, at time.Time) (string, error) {
	var id string
	err := tx.QueryRow(ctx, `INSERT INTO sessions(race_id,type,name,source_id,source_external_id,source_retrieved_at) VALUES($1::uuid,$2,$3,'jolpica',$4,$5) ON CONFLICT(race_id,type) DO UPDATE SET name=EXCLUDED.name,source_retrieved_at=EXCLUDED.source_retrieved_at,updated_at=now() RETURNING id::text`, raceID, kind, name, externalID, at).Scan(&id)
	return id, err
}
