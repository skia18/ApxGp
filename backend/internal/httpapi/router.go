package httpapi

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/apex-f1/apex-f1/backend/internal/repository"
)

type HealthChecker interface {
	Ping(context.Context) error
}

type CalendarService interface {
	CurrentSeason(context.Context) (domain.Season, error)
	RacesBySeason(context.Context, int) (domain.Page[domain.Race], error)
	NextRace(context.Context, time.Time) (domain.Race, *domain.Freshness, error)
}

type GridService interface {
	Drivers(context.Context) ([]domain.Driver, error)
	Driver(context.Context, string) (domain.Driver, error)
	Constructors(context.Context) ([]domain.Constructor, error)
	Constructor(context.Context, string) (domain.Constructor, error)
	DriverStandings(context.Context, int) (domain.Page[domain.DriverStanding], error)
	ConstructorStandings(context.Context, int) (domain.Page[domain.ConstructorStanding], error)
}

type ClassificationService interface {
	Sessions(context.Context, string) ([]domain.Session, error)
	Classification(context.Context, string) (domain.Classification, error)
}

func NewRouter(health HealthChecker, calendar CalendarService, grid GridService, classifications ClassificationService, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health/live", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /health/ready", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := health.Ping(ctx); err != nil {
			writeError(w, r, http.StatusServiceUnavailable, "not_ready", "The database is unavailable.")
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /api/v1/seasons/current", func(w http.ResponseWriter, r *http.Request) {
		season, err := calendar.CurrentSeason(r.Context())
		if handleRepositoryError(w, r, err, "season") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": season})
	})
	mux.HandleFunc("GET /api/v1/seasons/{year}/races", func(w http.ResponseWriter, r *http.Request) {
		year, err := strconv.Atoi(r.PathValue("year"))
		if err != nil || year < 1950 || year > 2200 {
			writeError(w, r, http.StatusBadRequest, "invalid_year", "Year must be between 1950 and 2200.")
			return
		}
		page, err := calendar.RacesBySeason(r.Context(), year)
		if handleRepositoryError(w, r, err, "calendar") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": page})
	})
	mux.HandleFunc("GET /api/v1/races/next", func(w http.ResponseWriter, r *http.Request) {
		race, freshness, err := calendar.NextRace(r.Context(), time.Now().UTC())
		if handleRepositoryError(w, r, err, "race") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": race, "freshness": freshness})
	})
	mux.HandleFunc("GET /api/v1/drivers", func(w http.ResponseWriter, r *http.Request) {
		items, err := grid.Drivers(r.Context())
		if handleRepositoryError(w, r, err, "drivers") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": map[string]any{"items": items, "total": len(items)}})
	})
	mux.HandleFunc("GET /api/v1/drivers/{driverId}", func(w http.ResponseWriter, r *http.Request) {
		item, err := grid.Driver(r.Context(), r.PathValue("driverId"))
		if handleRepositoryError(w, r, err, "driver") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": item})
	})
	mux.HandleFunc("GET /api/v1/teams", func(w http.ResponseWriter, r *http.Request) {
		items, err := grid.Constructors(r.Context())
		if handleRepositoryError(w, r, err, "teams") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": map[string]any{"items": items, "total": len(items)}})
	})
	mux.HandleFunc("GET /api/v1/teams/{teamId}", func(w http.ResponseWriter, r *http.Request) {
		item, err := grid.Constructor(r.Context(), r.PathValue("teamId"))
		if handleRepositoryError(w, r, err, "team") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": item})
	})
	mux.HandleFunc("GET /api/v1/seasons/{year}/driver-standings", func(w http.ResponseWriter, r *http.Request) {
		year, ok := parseYear(w, r)
		if !ok {
			return
		}
		page, err := grid.DriverStandings(r.Context(), year)
		if handleRepositoryError(w, r, err, "driver standings") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": page})
	})
	mux.HandleFunc("GET /api/v1/seasons/{year}/constructor-standings", func(w http.ResponseWriter, r *http.Request) {
		year, ok := parseYear(w, r)
		if !ok {
			return
		}
		page, err := grid.ConstructorStandings(r.Context(), year)
		if handleRepositoryError(w, r, err, "constructor standings") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": page})
	})
	mux.HandleFunc("GET /api/v1/races/{raceId}/sessions", func(w http.ResponseWriter, r *http.Request) {
		items, err := classifications.Sessions(r.Context(), r.PathValue("raceId"))
		if handleRepositoryError(w, r, err, "sessions") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": map[string]any{"items": items, "total": len(items)}})
	})
	mux.HandleFunc("GET /api/v1/sessions/{sessionId}/classification", func(w http.ResponseWriter, r *http.Request) {
		item, err := classifications.Classification(r.Context(), r.PathValue("sessionId"))
		if handleRepositoryError(w, r, err, "classification") {
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": item})
	})
	return middleware(mux, allowedOrigins)
}

func parseYear(w http.ResponseWriter, r *http.Request) (int, bool) {
	year, err := strconv.Atoi(r.PathValue("year"))
	if err != nil || year < 1950 || year > 2200 {
		writeError(w, r, http.StatusBadRequest, "invalid_year", "Year must be between 1950 and 2200.")
		return 0, false
	}
	return year, true
}

func handleRepositoryError(w http.ResponseWriter, r *http.Request, err error, resource string) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, repository.ErrNotFound) {
		writeError(w, r, http.StatusNotFound, "not_found", "The requested "+resource+" was not found.")
		return true
	}
	writeError(w, r, http.StatusInternalServerError, "internal_error", "The request could not be completed.")
	return true
}
