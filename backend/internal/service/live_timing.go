package service

import (
	"context"
	"fmt"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

type TimingProvider interface {
	Timing(context.Context) (domain.LiveTiming, error)
}

type LiveTiming struct {
	primary  TimingProvider
	fallback TimingProvider
}

func NewLiveTiming(primary, fallback TimingProvider) *LiveTiming {
	return &LiveTiming{primary: primary, fallback: fallback}
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
