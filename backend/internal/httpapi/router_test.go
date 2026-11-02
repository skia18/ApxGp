package httpapi

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

type fakeHealth struct{ err error }

func (f fakeHealth) Ping(context.Context) error { return f.err }

type fakeCalendar struct{}
type fakeGrid struct{}
type fakeClassifications struct{}
type fakeLiveTiming struct{}

func (fakeLiveTiming) Timing(context.Context) (domain.LiveTiming, error) {
	return domain.LiveTiming{SessionKey: 123, Rows: []domain.LiveTimingRow{}}, nil
}
func (fakeLiveTiming) Weekend(context.Context) (domain.LiveWeekend, error) {
	return domain.LiveWeekend{}, nil
}
func (fakeLiveTiming) SessionTiming(context.Context, int) (domain.LiveTiming, error) {
	return domain.LiveTiming{}, nil
}

func (fakeLiveTiming) SessionStrategy(context.Context, int) (domain.SessionStrategy, error) {
	return domain.SessionStrategy{}, nil
}

func (fakeClassifications) Sessions(context.Context, string) ([]domain.Session, error) {
	return []domain.Session{}, nil
}
func (fakeClassifications) Classification(context.Context, string) (domain.Classification, error) {
	return domain.Classification{}, nil
}

func (fakeGrid) Drivers(context.Context) ([]domain.Driver, error)      { return []domain.Driver{}, nil }
func (fakeGrid) Driver(context.Context, string) (domain.Driver, error) { return domain.Driver{}, nil }
func (fakeGrid) Constructors(context.Context) ([]domain.Constructor, error) {
	return []domain.Constructor{}, nil
}
func (fakeGrid) Constructor(context.Context, string) (domain.Constructor, error) {
	return domain.Constructor{}, nil
}
func (fakeGrid) DriverStandings(context.Context, int) (domain.Page[domain.DriverStanding], error) {
	return domain.Page[domain.DriverStanding]{}, nil
}
func (fakeGrid) ConstructorStandings(context.Context, int) (domain.Page[domain.ConstructorStanding], error) {
	return domain.Page[domain.ConstructorStanding]{}, nil
}

func (fakeCalendar) CurrentSeason(context.Context) (domain.Season, error) {
	return domain.Season{Year: 2026, IsCurrent: true}, nil
}
func (fakeCalendar) RacesBySeason(context.Context, int) (domain.Page[domain.Race], error) {
	return domain.Page[domain.Race]{Items: []domain.Race{}, Total: 0}, nil
}
func (fakeCalendar) NextRace(context.Context, time.Time) (domain.Race, *domain.Freshness, error) {
	return domain.Race{}, nil, errors.New("database failed")
}

func TestLiveHealth(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/health/live", nil)
	response := httptest.NewRecorder()
	NewRouter(fakeHealth{}, fakeCalendar{}, fakeGrid{}, fakeClassifications{}, fakeLiveTiming{}, nil).ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d", response.Code)
	}
}

func TestRejectsInvalidSeason(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/seasons/nope/races", nil)
	response := httptest.NewRecorder()
	NewRouter(fakeHealth{}, fakeCalendar{}, fakeGrid{}, fakeClassifications{}, fakeLiveTiming{}, nil).ServeHTTP(response, request)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
}

func TestLiveTiming(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/live/timing", nil)
	response := httptest.NewRecorder()
	NewRouter(fakeHealth{}, fakeCalendar{}, fakeGrid{}, fakeClassifications{}, fakeLiveTiming{}, nil).ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
}
