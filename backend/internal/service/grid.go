package service

import (
	"context"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/apex-f1/apex-f1/backend/internal/repository"
)

type StandingsProvider interface {
	Standings(context.Context, int) (domain.StandingsSnapshot, error)
}

type Grid struct {
	repository repository.GridRepository
	provider   StandingsProvider
}

func NewGrid(repo repository.GridRepository, provider StandingsProvider) *Grid {
	return &Grid{repository: repo, provider: provider}
}

func (s *Grid) Drivers(ctx context.Context) ([]domain.Driver, error) {
	return s.repository.Drivers(ctx)
}

func (s *Grid) Driver(ctx context.Context, slug string) (domain.Driver, error) {
	return s.repository.Driver(ctx, slug)
}

func (s *Grid) Constructors(ctx context.Context) ([]domain.Constructor, error) {
	return s.repository.Constructors(ctx)
}

func (s *Grid) Constructor(ctx context.Context, slug string) (domain.Constructor, error) {
	return s.repository.Constructor(ctx, slug)
}

func (s *Grid) DriverStandings(ctx context.Context, year int) (domain.Page[domain.DriverStanding], error) {
	return s.repository.DriverStandings(ctx, year)
}

func (s *Grid) ConstructorStandings(ctx context.Context, year int) (domain.Page[domain.ConstructorStanding], error) {
	return s.repository.ConstructorStandings(ctx, year)
}

func (s *Grid) ImportStandings(ctx context.Context, year int) (domain.IngestionResult, error) {
	snapshot, err := s.provider.Standings(ctx, year)
	if err != nil {
		return domain.IngestionResult{}, err
	}
	return s.repository.ImportStandings(ctx, snapshot)
}
