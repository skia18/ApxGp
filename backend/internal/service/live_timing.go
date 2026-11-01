package service

import (
	"context"
	"fmt"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

type TimingProvider interface {
	Timing(context.Context) (domain.LiveTiming, error)
}

type WeekendProvider interface {
	Weekend(context.Context) (domain.LiveWeekend, error)
	SessionTiming(context.Context, int) (domain.LiveTiming, error)
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

func (s *LiveTiming) Weekend(ctx context.Context) (domain.LiveWeekend, error) {
	if s.weekend == nil {
		return domain.LiveWeekend{}, fmt.Errorf("weekend provider unavailable")
	}
	return s.weekend.Weekend(ctx)
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
