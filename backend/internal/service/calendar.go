package service

import (
	"context"
	"fmt"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/apex-f1/apex-f1/backend/internal/repository"
)

type CalendarProvider interface {
	SeasonRaces(context.Context, int) ([]domain.Race, time.Time, error)
}

type Calendar struct {
	reader   repository.CalendarRepository
	writer   repository.CalendarWriter
	provider CalendarProvider
}

func NewCalendar(reader repository.CalendarRepository, writer repository.CalendarWriter, provider CalendarProvider) *Calendar {
	return &Calendar{reader: reader, writer: writer, provider: provider}
}

func (s *Calendar) CurrentSeason(ctx context.Context) (domain.Season, error) {
	return s.reader.CurrentSeason(ctx)
}

func (s *Calendar) RacesBySeason(ctx context.Context, year int) (domain.Page[domain.Race], error) {
	races, freshness, err := s.reader.RacesBySeason(ctx, year)
	if err != nil {
		return domain.Page[domain.Race]{}, err
	}
	return domain.Page[domain.Race]{Items: races, Total: len(races), Freshness: freshness}, nil
}

func (s *Calendar) NextRace(ctx context.Context, after time.Time) (domain.Race, *domain.Freshness, error) {
	return s.reader.NextRace(ctx, after)
}

func (s *Calendar) ImportSeason(ctx context.Context, year int) (domain.IngestionResult, error) {
	races, retrievedAt, err := s.provider.SeasonRaces(ctx, year)
	if err != nil {
		return domain.IngestionResult{}, fmt.Errorf("retrieve season calendar: %w", err)
	}
	if len(races) == 0 {
		return domain.IngestionResult{}, fmt.Errorf("provider returned no races for %d", year)
	}
	return s.writer.ImportCalendar(ctx, year, races, retrievedAt)
}
