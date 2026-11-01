package jolpica

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

type Client struct {
	baseURL string
	http    *http.Client
}

func NewClient(baseURL string, httpClient *http.Client) *Client {
	return &Client{baseURL: strings.TrimRight(baseURL, "/"), http: httpClient}
}

func (c *Client) SeasonRaces(ctx context.Context, season int) ([]domain.Race, time.Time, error) {
	endpoint, err := url.Parse(fmt.Sprintf("%s/%d.json", c.baseURL, season))
	if err != nil {
		return nil, time.Time{}, fmt.Errorf("build Jolpica URL: %w", err)
	}
	query := endpoint.Query()
	query.Set("limit", "100")
	endpoint.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, time.Time{}, fmt.Errorf("create Jolpica request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Apex-F1/1.0")

	response, err := c.http.Do(req)
	if err != nil {
		return nil, time.Time{}, fmt.Errorf("request Jolpica calendar: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, time.Time{}, fmt.Errorf("Jolpica calendar returned status %d", response.StatusCode)
	}

	var payload calendarResponse
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&payload); err != nil {
		return nil, time.Time{}, fmt.Errorf("decode Jolpica calendar: %w", err)
	}

	races := make([]domain.Race, 0, len(payload.MRData.RaceTable.Races))
	for _, source := range payload.MRData.RaceTable.Races {
		race, err := source.toDomain()
		if err != nil {
			return nil, time.Time{}, fmt.Errorf("map race round %q: %w", source.Round, err)
		}
		races = append(races, race)
	}
	return races, time.Now().UTC(), nil
}

type calendarResponse struct {
	MRData struct {
		RaceTable struct {
			Races []race `json:"Races"`
		} `json:"RaceTable"`
	} `json:"MRData"`
}

type race struct {
	Season   string  `json:"season"`
	Round    string  `json:"round"`
	RaceName string  `json:"raceName"`
	Date     string  `json:"date"`
	Time     string  `json:"time"`
	Circuit  circuit `json:"Circuit"`
}

type circuit struct {
	ID       string `json:"circuitId"`
	Name     string `json:"circuitName"`
	Location struct {
		Latitude  string `json:"lat"`
		Longitude string `json:"long"`
		Locality  string `json:"locality"`
		Country   string `json:"country"`
	} `json:"Location"`
}

func (r race) toDomain() (domain.Race, error) {
	season, err := strconv.Atoi(r.Season)
	if err != nil {
		return domain.Race{}, fmt.Errorf("invalid season: %w", err)
	}
	round, err := strconv.Atoi(r.Round)
	if err != nil {
		return domain.Race{}, fmt.Errorf("invalid round: %w", err)
	}
	startsAt, err := parseStart(r.Date, r.Time)
	if err != nil {
		return domain.Race{}, err
	}
	latitude := optionalFloat(r.Circuit.Location.Latitude)
	longitude := optionalFloat(r.Circuit.Location.Longitude)
	return domain.Race{
		Season:   season,
		Round:    round,
		Slug:     r.Circuit.ID,
		Name:     r.RaceName,
		StartsAt: startsAt,
		Circuit: domain.Circuit{
			Slug:      r.Circuit.ID,
			Name:      r.Circuit.Name,
			Locality:  r.Circuit.Location.Locality,
			Country:   r.Circuit.Location.Country,
			Latitude:  latitude,
			Longitude: longitude,
		},
	}, nil
}

func parseStart(date, clock string) (time.Time, error) {
	if clock == "" {
		clock = "00:00:00Z"
	}
	parsed, err := time.Parse("2006-01-02T15:04:05Z", date+"T"+clock)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid race start %q: %w", date+"T"+clock, err)
	}
	return parsed, nil
}

func optionalFloat(raw string) *float64 {
	value, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return nil
	}
	return &value
}
