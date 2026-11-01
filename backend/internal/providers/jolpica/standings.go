package jolpica

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

func (c *Client) Standings(ctx context.Context, season int) (domain.StandingsSnapshot, error) {
	drivers, driverRound, err := c.driverStandings(ctx, season)
	if err != nil {
		return domain.StandingsSnapshot{}, err
	}
	constructors, constructorRound, err := c.constructorStandings(ctx, season)
	if err != nil {
		return domain.StandingsSnapshot{}, err
	}
	round := driverRound
	if constructorRound > round {
		round = constructorRound
	}
	return domain.StandingsSnapshot{
		Season: season, Round: round, Drivers: drivers, Constructors: constructors, RetrievedAt: time.Now().UTC(),
	}, nil
}

func (c *Client) driverStandings(ctx context.Context, season int) ([]domain.DriverStanding, int, error) {
	var payload driverStandingsResponse
	if err := c.get(ctx, fmt.Sprintf("/%d/driverstandings.json", season), &payload); err != nil {
		return nil, 0, fmt.Errorf("retrieve driver standings: %w", err)
	}
	if len(payload.MRData.StandingsTable.Lists) == 0 {
		return []domain.DriverStanding{}, 0, nil
	}
	list := payload.MRData.StandingsTable.Lists[0]
	round, err := strconv.Atoi(list.Round)
	if err != nil {
		return nil, 0, fmt.Errorf("invalid standings round %q: %w", list.Round, err)
	}
	standings := make([]domain.DriverStanding, 0, len(list.Standings))
	for _, item := range list.Standings {
		position, points, wins, err := standingNumbers(item.Position, item.Points, item.Wins)
		if err != nil {
			return nil, 0, err
		}
		driver, err := item.Driver.toDomain()
		if err != nil {
			return nil, 0, err
		}
		standing := domain.DriverStanding{Position: position, Points: points, Wins: wins, Driver: driver}
		if len(item.Constructors) > 0 {
			constructor := item.Constructors[0].toDomain()
			standing.Constructor = &constructor
		}
		standings = append(standings, standing)
	}
	return standings, round, nil
}

func (c *Client) constructorStandings(ctx context.Context, season int) ([]domain.ConstructorStanding, int, error) {
	var payload constructorStandingsResponse
	if err := c.get(ctx, fmt.Sprintf("/%d/constructorstandings.json", season), &payload); err != nil {
		return nil, 0, fmt.Errorf("retrieve constructor standings: %w", err)
	}
	if len(payload.MRData.StandingsTable.Lists) == 0 {
		return []domain.ConstructorStanding{}, 0, nil
	}
	list := payload.MRData.StandingsTable.Lists[0]
	round, err := strconv.Atoi(list.Round)
	if err != nil {
		return nil, 0, fmt.Errorf("invalid standings round %q: %w", list.Round, err)
	}
	standings := make([]domain.ConstructorStanding, 0, len(list.Standings))
	for _, item := range list.Standings {
		position, points, wins, err := standingNumbers(item.Position, item.Points, item.Wins)
		if err != nil {
			return nil, 0, err
		}
		standings = append(standings, domain.ConstructorStanding{
			Position: position, Points: points, Wins: wins, Constructor: item.Constructor.toDomain(),
		})
	}
	return standings, round, nil
}

func (c *Client) get(ctx context.Context, path string, target any) error {
	return c.getWithLimit(ctx, path, "100", target)
}

func (c *Client) getWithLimit(ctx context.Context, path, limit string, target any) error {
	return c.getPage(ctx, path, limit, "0", target)
}

func (c *Client) getPage(ctx context.Context, path, limit, offset string, target any) error {
	endpoint, err := url.Parse(c.baseURL + path)
	if err != nil {
		return fmt.Errorf("build URL: %w", err)
	}
	query := endpoint.Query()
	query.Set("limit", limit)
	query.Set("offset", offset)
	endpoint.RawQuery = query.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Apex-F1/1.0")
	response, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("send request: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("provider returned status %d", response.StatusCode)
	}
	if err := json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}
	return nil
}

type providerDriver struct {
	ID              string `json:"driverId"`
	PermanentNumber string `json:"permanentNumber"`
	Code            string `json:"code"`
	GivenName       string `json:"givenName"`
	FamilyName      string `json:"familyName"`
	DateOfBirth     string `json:"dateOfBirth"`
	Nationality     string `json:"nationality"`
}

func (d providerDriver) toDomain() (domain.Driver, error) {
	driver := domain.Driver{Slug: d.ID, GivenName: d.GivenName, FamilyName: d.FamilyName, Code: d.Code, Nationality: d.Nationality}
	if d.PermanentNumber != "" {
		number, err := strconv.Atoi(d.PermanentNumber)
		if err != nil {
			return domain.Driver{}, fmt.Errorf("invalid permanent number for %s: %w", d.ID, err)
		}
		driver.PermanentNumber = &number
	}
	if d.DateOfBirth != "" {
		birthDate, err := time.Parse("2006-01-02", d.DateOfBirth)
		if err != nil {
			return domain.Driver{}, fmt.Errorf("invalid birth date for %s: %w", d.ID, err)
		}
		driver.DateOfBirth = &birthDate
	}
	return driver, nil
}

type providerConstructor struct {
	ID          string `json:"constructorId"`
	Name        string `json:"name"`
	Nationality string `json:"nationality"`
}

func (c providerConstructor) toDomain() domain.Constructor {
	return domain.Constructor{Slug: c.ID, Name: c.Name, Nationality: c.Nationality}
}

type driverStandingsResponse struct {
	MRData struct {
		StandingsTable struct {
			Lists []struct {
				Round     string `json:"round"`
				Standings []struct {
					Position     string                `json:"position"`
					Points       string                `json:"points"`
					Wins         string                `json:"wins"`
					Driver       providerDriver        `json:"Driver"`
					Constructors []providerConstructor `json:"Constructors"`
				} `json:"DriverStandings"`
			} `json:"StandingsLists"`
		} `json:"StandingsTable"`
	} `json:"MRData"`
}

type constructorStandingsResponse struct {
	MRData struct {
		StandingsTable struct {
			Lists []struct {
				Round     string `json:"round"`
				Standings []struct {
					Position    string              `json:"position"`
					Points      string              `json:"points"`
					Wins        string              `json:"wins"`
					Constructor providerConstructor `json:"Constructor"`
				} `json:"ConstructorStandings"`
			} `json:"StandingsLists"`
		} `json:"StandingsTable"`
	} `json:"MRData"`
}

func standingNumbers(positionRaw, pointsRaw, winsRaw string) (int, float64, int, error) {
	position, err := strconv.Atoi(positionRaw)
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid standing position %q: %w", positionRaw, err)
	}
	points, err := strconv.ParseFloat(pointsRaw, 64)
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid standing points %q: %w", pointsRaw, err)
	}
	wins, err := strconv.Atoi(winsRaw)
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid standing wins %q: %w", winsRaw, err)
	}
	return position, points, wins, nil
}
