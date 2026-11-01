package jolpica

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

func (c *Client) Classifications(ctx context.Context, season int) ([]domain.ClassificationSnapshot, error) {
	races, err := c.allRaceResults(ctx, season)
	if err != nil {
		return nil, fmt.Errorf("retrieve race results: %w", err)
	}
	qualifying, err := c.allQualifyingResults(ctx, season)
	if err != nil {
		return nil, fmt.Errorf("retrieve qualifying results: %w", err)
	}

	byRound := make(map[int]*domain.ClassificationSnapshot)
	for _, sourceRace := range races {
		round, err := strconv.Atoi(sourceRace.Round)
		if err != nil {
			return nil, fmt.Errorf("invalid race round %q: %w", sourceRace.Round, err)
		}
		snapshot := byRound[round]
		if snapshot == nil {
			snapshot = &domain.ClassificationSnapshot{Season: season, Round: round, RetrievedAt: time.Now().UTC()}
			byRound[round] = snapshot
		}
		for _, result := range sourceRace.Results {
			mapped, err := result.toDomain()
			if err != nil {
				return nil, fmt.Errorf("map race result round %d: %w", round, err)
			}
			snapshot.Race = append(snapshot.Race, mapped)
		}
	}
	for _, sourceRace := range qualifying {
		round, err := strconv.Atoi(sourceRace.Round)
		if err != nil {
			return nil, fmt.Errorf("invalid qualifying round %q: %w", sourceRace.Round, err)
		}
		snapshot := byRound[round]
		if snapshot == nil {
			snapshot = &domain.ClassificationSnapshot{Season: season, Round: round, RetrievedAt: time.Now().UTC()}
			byRound[round] = snapshot
		}
		for _, result := range sourceRace.Results {
			mapped, err := result.toDomain()
			if err != nil {
				return nil, fmt.Errorf("map qualifying result round %d: %w", round, err)
			}
			snapshot.Qualifying = append(snapshot.Qualifying, mapped)
		}
	}
	items := make([]domain.ClassificationSnapshot, 0, len(byRound))
	for round := 1; round <= len(byRound); round++ {
		if snapshot := byRound[round]; snapshot != nil {
			items = append(items, *snapshot)
		}
	}
	return items, nil
}

func (c *Client) allRaceResults(ctx context.Context, season int) ([]providerRace, error) {
	items := []providerRace{}
	for offset := 0; ; {
		var page raceResultsResponse
		if err := c.getPage(ctx, fmt.Sprintf("/%d/results.json", season), "100", strconv.Itoa(offset), &page); err != nil {
			return nil, err
		}
		items = append(items, page.MRData.RaceTable.Races...)
		limit, total, err := pagination(page.MRData.Limit, page.MRData.Total, len(page.MRData.RaceTable.Races))
		if err != nil {
			return nil, err
		}
		offset += limit
		if offset >= total {
			return items, nil
		}
	}
}

func (c *Client) allQualifyingResults(ctx context.Context, season int) ([]providerQualifyingRace, error) {
	items := []providerQualifyingRace{}
	for offset := 0; ; {
		var page qualifyingResultsResponse
		if err := c.getPage(ctx, fmt.Sprintf("/%d/qualifying.json", season), "100", strconv.Itoa(offset), &page); err != nil {
			return nil, err
		}
		items = append(items, page.MRData.RaceTable.Races...)
		limit, total, err := pagination(page.MRData.Limit, page.MRData.Total, len(page.MRData.RaceTable.Races))
		if err != nil {
			return nil, err
		}
		offset += limit
		if offset >= total {
			return items, nil
		}
	}
}

func pagination(limitRaw, totalRaw string, returned int) (int, int, error) {
	if limitRaw == "" || totalRaw == "" {
		return max(returned, 1), returned, nil
	}
	limit, err := strconv.Atoi(limitRaw)
	if err != nil || limit <= 0 {
		return 0, 0, fmt.Errorf("invalid page limit %q", limitRaw)
	}
	total, err := strconv.Atoi(totalRaw)
	if err != nil || total < 0 {
		return 0, 0, fmt.Errorf("invalid page total %q", totalRaw)
	}
	return limit, total, nil
}

type raceResultsResponse struct {
	MRData struct {
		Limit     string `json:"limit"`
		Total     string `json:"total"`
		RaceTable struct {
			Races []providerRace `json:"Races"`
		} `json:"RaceTable"`
	} `json:"MRData"`
}

type providerRace struct {
	Round   string               `json:"round"`
	Results []providerRaceResult `json:"Results"`
}

type providerRaceResult struct {
	Position     string              `json:"position"`
	PositionText string              `json:"positionText"`
	Points       string              `json:"points"`
	Grid         string              `json:"grid"`
	Laps         string              `json:"laps"`
	Status       string              `json:"status"`
	Driver       providerDriver      `json:"Driver"`
	Constructor  providerConstructor `json:"Constructor"`
	Time         struct {
		Millis string `json:"millis"`
	} `json:"Time"`
	FastestLap struct {
		Rank string `json:"rank"`
		Time struct {
			Time string `json:"time"`
		} `json:"Time"`
	} `json:"FastestLap"`
}

func (r providerRaceResult) toDomain() (domain.RaceClassification, error) {
	position, err := requiredInt("position", r.Position)
	if err != nil {
		return domain.RaceClassification{}, err
	}
	grid, err := requiredInt("grid", r.Grid)
	if err != nil {
		return domain.RaceClassification{}, err
	}
	laps, err := requiredInt("laps", r.Laps)
	if err != nil {
		return domain.RaceClassification{}, err
	}
	points, err := strconv.ParseFloat(r.Points, 64)
	if err != nil {
		return domain.RaceClassification{}, fmt.Errorf("invalid points %q: %w", r.Points, err)
	}
	driver, err := r.Driver.toDomain()
	if err != nil {
		return domain.RaceClassification{}, err
	}
	item := domain.RaceClassification{Position: position, PositionText: r.PositionText, Points: points, Grid: grid, Laps: laps, Status: r.Status, Driver: driver, Constructor: r.Constructor.toDomain(), FastestLap: r.FastestLap.Time.Time}
	if r.Time.Millis != "" {
		value, err := strconv.ParseInt(r.Time.Millis, 10, 64)
		if err != nil {
			return item, err
		}
		item.ElapsedMillis = &value
	}
	if r.FastestLap.Rank != "" {
		value, err := strconv.Atoi(r.FastestLap.Rank)
		if err != nil {
			return item, err
		}
		item.FastestLapRank = &value
	}
	return item, nil
}

type qualifyingResultsResponse struct {
	MRData struct {
		Limit     string `json:"limit"`
		Total     string `json:"total"`
		RaceTable struct {
			Races []providerQualifyingRace `json:"Races"`
		} `json:"RaceTable"`
	} `json:"MRData"`
}

type providerQualifyingRace struct {
	Round   string                     `json:"round"`
	Results []providerQualifyingResult `json:"QualifyingResults"`
}

type providerQualifyingResult struct {
	Position    string              `json:"position"`
	Driver      providerDriver      `json:"Driver"`
	Constructor providerConstructor `json:"Constructor"`
	Q1          string              `json:"Q1"`
	Q2          string              `json:"Q2"`
	Q3          string              `json:"Q3"`
}

func (r providerQualifyingResult) toDomain() (domain.QualifyingClassification, error) {
	position, err := requiredInt("position", r.Position)
	if err != nil {
		return domain.QualifyingClassification{}, err
	}
	driver, err := r.Driver.toDomain()
	if err != nil {
		return domain.QualifyingClassification{}, err
	}
	return domain.QualifyingClassification{Position: position, Driver: driver, Constructor: r.Constructor.toDomain(), Q1: r.Q1, Q2: r.Q2, Q3: r.Q3}, nil
}

func requiredInt(field, raw string) (int, error) {
	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("invalid %s %q: %w", field, raw, err)
	}
	return value, nil
}
