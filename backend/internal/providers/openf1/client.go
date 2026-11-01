package openf1

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/domain"
)

const cacheDuration = 4 * time.Second

type Client struct {
	baseURL  string
	token    string
	http     *http.Client
	mu       sync.Mutex
	cached   domain.LiveTiming
	cachedAt time.Time
}

func NewClient(baseURL, token string, httpClient *http.Client) *Client {
	return &Client{baseURL: strings.TrimRight(baseURL, "/"), token: strings.TrimSpace(token), http: httpClient}
}

func (c *Client) Timing(ctx context.Context) (domain.LiveTiming, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if !c.cachedAt.IsZero() && time.Since(c.cachedAt) < cacheDuration {
		return c.cached, nil
	}

	var drivers []driverPayload
	if err := c.get(ctx, "drivers", &drivers); err != nil {
		return domain.LiveTiming{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.LiveTiming{}, err
	}
	var positions []positionPayload
	if err := c.get(ctx, "position", &positions); err != nil {
		return domain.LiveTiming{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.LiveTiming{}, err
	}
	var intervals []intervalPayload
	if err := c.get(ctx, "intervals", &intervals); err != nil {
		return domain.LiveTiming{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.LiveTiming{}, err
	}
	var laps []lapPayload
	if err := c.get(ctx, "laps", &laps); err != nil {
		return domain.LiveTiming{}, err
	}

	snapshot := mapSnapshot(drivers, positions, intervals, laps)
	c.cached, c.cachedAt = snapshot, time.Now()
	return snapshot, nil
}

func (c *Client) publicRatePause(ctx context.Context) error {
	if c.token != "" {
		return nil
	}
	timer := time.NewTimer(350 * time.Millisecond)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

func (c *Client) get(ctx context.Context, path string, target any) error {
	endpoint, err := url.Parse(c.baseURL + "/" + path)
	if err != nil {
		return fmt.Errorf("build OpenF1 URL: %w", err)
	}
	query := endpoint.Query()
	query.Set("session_key", "latest")
	endpoint.RawQuery = query.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return fmt.Errorf("create OpenF1 request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Apex-F1/1.0")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	response, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("request OpenF1 %s: %w", path, err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("OpenF1 %s returned status %d", path, response.StatusCode)
	}
	if err := json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode OpenF1 %s: %w", path, err)
	}
	return nil
}

type driverPayload struct {
	DriverNumber  int    `json:"driver_number"`
	BroadcastName string `json:"broadcast_name"`
	FullName      string `json:"full_name"`
	NameAcronym   string `json:"name_acronym"`
	TeamName      string `json:"team_name"`
	TeamColour    string `json:"team_colour"`
	MeetingKey    int    `json:"meeting_key"`
	SessionKey    int    `json:"session_key"`
}
type positionPayload struct {
	Date         time.Time `json:"date"`
	DriverNumber int       `json:"driver_number"`
	Position     int       `json:"position"`
	MeetingKey   int       `json:"meeting_key"`
	SessionKey   int       `json:"session_key"`
}
type intervalPayload struct {
	Date         time.Time `json:"date"`
	DriverNumber int       `json:"driver_number"`
	Gap          any       `json:"gap_to_leader"`
	Interval     any       `json:"interval"`
}
type lapPayload struct {
	DateStart    time.Time `json:"date_start"`
	DriverNumber int       `json:"driver_number"`
	LapNumber    int       `json:"lap_number"`
	LapDuration  *float64  `json:"lap_duration"`
	Sector1      *float64  `json:"duration_sector_1"`
	Sector2      *float64  `json:"duration_sector_2"`
	Sector3      *float64  `json:"duration_sector_3"`
}

func mapSnapshot(drivers []driverPayload, positions []positionPayload, intervals []intervalPayload, laps []lapPayload) domain.LiveTiming {
	driverByNumber := make(map[int]driverPayload)
	for _, item := range drivers {
		driverByNumber[item.DriverNumber] = item
	}
	positionByNumber := make(map[int]positionPayload)
	for _, item := range positions {
		if previous, ok := positionByNumber[item.DriverNumber]; !ok || item.Date.After(previous.Date) {
			positionByNumber[item.DriverNumber] = item
		}
	}
	intervalByNumber := make(map[int]intervalPayload)
	for _, item := range intervals {
		if previous, ok := intervalByNumber[item.DriverNumber]; !ok || item.Date.After(previous.Date) {
			intervalByNumber[item.DriverNumber] = item
		}
	}
	latestLap := make(map[int]lapPayload)
	bestLap := make(map[int]float64)
	updatedAt := time.Time{}
	for _, item := range laps {
		if previous, ok := latestLap[item.DriverNumber]; !ok || item.LapNumber > previous.LapNumber {
			latestLap[item.DriverNumber] = item
		}
		if item.LapDuration != nil && *item.LapDuration > 0 {
			if best, ok := bestLap[item.DriverNumber]; !ok || *item.LapDuration < best {
				bestLap[item.DriverNumber] = *item.LapDuration
			}
		}
		if item.DateStart.After(updatedAt) {
			updatedAt = item.DateStart
		}
	}
	rows := make([]domain.LiveTimingRow, 0, len(positionByNumber))
	meetingKey, sessionKey := 0, 0
	for number, position := range positionByNumber {
		driver := driverByNumber[number]
		lap := latestLap[number]
		interval := intervalByNumber[number]
		name := driver.FullName
		if name == "" {
			name = driver.BroadcastName
		}
		row := domain.LiveTimingRow{Position: position.Position, DriverNumber: number, DriverCode: driver.NameAcronym, DriverName: name, TeamName: driver.TeamName, TeamColour: driver.TeamColour, Sectors: [3]*float64{lap.Sector1, lap.Sector2, lap.Sector3}}
		if lap.LapNumber > 0 {
			value := lap.LapNumber
			row.LapNumber = &value
		}
		row.LastLapSeconds = lap.LapDuration
		if best, ok := bestLap[number]; ok {
			value := best
			row.BestLapSeconds = &value
		}
		row.GapToLeader = displayValue(interval.Gap, position.Position == 1)
		row.Interval = displayValue(interval.Interval, position.Position == 1)
		rows = append(rows, row)
		meetingKey, sessionKey = position.MeetingKey, position.SessionKey
		if position.Date.After(updatedAt) {
			updatedAt = position.Date
		}
		if interval.Date.After(updatedAt) {
			updatedAt = interval.Date
		}
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].Position < rows[j].Position })
	if updatedAt.IsZero() {
		updatedAt = time.Now().UTC()
	}
	return domain.LiveTiming{SessionKey: sessionKey, MeetingKey: meetingKey, SessionName: "Latest session", UpdatedAt: updatedAt, Rows: rows, Freshness: domain.Freshness{Source: "openf1", RetrievedAt: time.Now().UTC(), Stale: time.Since(updatedAt) > 30*time.Second}}
}

func displayValue(value any, leader bool) *string {
	if leader {
		result := "Leader"
		return &result
	}
	if value == nil {
		return nil
	}
	var result string
	switch typed := value.(type) {
	case float64:
		result = "+" + strconv.FormatFloat(typed, 'f', 3, 64)
	case string:
		result = typed
		if _, err := strconv.ParseFloat(typed, 64); err == nil {
			result = "+" + typed
		}
	default:
		return nil
	}
	return &result
}
