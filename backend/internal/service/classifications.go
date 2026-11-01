package service

import (
	"context"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
	"github.com/apex-f1/apex-f1/backend/internal/repository"
)

type ClassificationProvider interface {
	Classifications(context.Context, int) ([]domain.ClassificationSnapshot, error)
}

type Classifications struct {
	repository repository.ClassificationRepository
	provider   ClassificationProvider
}

func NewClassifications(repo repository.ClassificationRepository, provider ClassificationProvider) *Classifications {
	return &Classifications{repository: repo, provider: provider}
}

func (s *Classifications) Sessions(ctx context.Context, raceID string) ([]domain.Session, error) {
	return s.repository.Sessions(ctx, raceID)
}

func (s *Classifications) Classification(ctx context.Context, sessionID string) (domain.Classification, error) {
	return s.repository.Classification(ctx, sessionID)
}

func (s *Classifications) Import(ctx context.Context, season int) (domain.IngestionResult, error) {
	snapshots, err := s.provider.Classifications(ctx, season)
	if err != nil {
		return domain.IngestionResult{}, err
	}
	return s.repository.ImportClassifications(ctx, season, snapshots)
}
