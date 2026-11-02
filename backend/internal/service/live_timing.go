package service

import (
	"context"
	"fmt"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

type TimingProvider interface {
	Timing(context.Context) (domain.LiveTiming, error)
}

type WeekendProvider interface {
	Weekend(context.Context, *time.Time) (domain.LiveWeekend, error)
	SessionTiming(context.Context, int) (domain.LiveTiming, error)
	SessionStrategy(context.Context, int) (domain.SessionStrategy, error)
}

func (s *LiveTiming) SessionStrategy(ctx context.Context, sessionKey int) (domain.SessionStrategy, error) {
	if s.weekend == nil {
		return domain.SessionStrategy{}, fmt.Errorf("weekend provider unavailable")
	}
	return s.weekend.SessionStrategy(ctx, sessionKey)
}

type LiveTiming struct {
	primary  TimingProvider
	fallback TimingProvider
	weekend  WeekendProvider
}

func NewLiveTiming(primary, fallback TimingProvider) *LiveTiming {
	weekend, _ := fallback.(WeekendProvider)
	return &LiveTiming{primary: primary, fallback: fallback, weekend: weekend}
}

func (s *LiveTiming) Weekend(ctx context.Context, startsAt *time.Time) (domain.LiveWeekend, error) {
	if s.weekend == nil {
		return domain.LiveWeekend{}, fmt.Errorf("weekend provider unavailable")
	}
	return s.weekend.Weekend(ctx, startsAt)
}

func (s *LiveTiming) SessionTiming(ctx context.Context, sessionKey int) (domain.LiveTiming, error) {
	if s.weekend == nil {
		return domain.LiveTiming{}, fmt.Errorf("weekend provider unavailable")
	}
	return s.weekend.SessionTiming(ctx, sessionKey)
}

func (s *LiveTiming) Timing(ctx context.Context) (domain.LiveTiming, error) {
	result, err := s.primary.Timing(ctx)
	if err == nil {
		return result, nil
	}
	fallback, fallbackErr := s.fallback.Timing(ctx)
	if fallbackErr != nil {
		return domain.LiveTiming{}, fmt.Errorf("primary live timing: %v; fallback: %w", err, fallbackErr)
	}
	return fallback, nil
}
