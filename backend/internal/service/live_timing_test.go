package service

import (
	"context"
	"errors"
	"testing"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

type fakeTimingProvider struct {
	result domain.LiveTiming
	err    error
}

func (f fakeTimingProvider) Timing(context.Context) (domain.LiveTiming, error) {
	return f.result, f.err
}

func TestLiveTimingFallsBack(t *testing.T) {
	want := domain.LiveTiming{SessionName: "fallback"}
	service := NewLiveTiming(fakeTimingProvider{err: errors.New("offline")}, fakeTimingProvider{result: want})
	got, err := service.Timing(context.Background())
	if err != nil || got.SessionName != want.SessionName {
		t.Fatalf("Timing() = %+v, %v", got, err)
	}
}
