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

func (c *Client) Weekend(ctx context.Context, startsAt *time.Time) (domain.LiveWeekend, error) {
	var meetings []meetingPayload
	queryKey, queryValue := "meeting_key", "latest"
	if startsAt != nil {
		queryKey, queryValue = "year", strconv.Itoa(startsAt.Year())
	}
	if err := c.getWithQuery(ctx, "meetings", queryKey, queryValue, &meetings); err != nil {
		return domain.LiveWeekend{}, err
	}
	if len(meetings) == 0 {
		return domain.LiveWeekend{}, fmt.Errorf("OpenF1 returned no meeting for %s=%s", queryKey, queryValue)
	}
	meeting := meetings[0]
	if startsAt != nil {
		closestDistance := meeting.DateStart.Sub(*startsAt).Abs()
		for _, candidate := range meetings[1:] {
			distance := candidate.DateStart.Sub(*startsAt).Abs()
			if distance < closestDistance {
				meeting, closestDistance = candidate, distance
			}
		}
		if closestDistance > 7*24*time.Hour {
			return domain.LiveWeekend{}, fmt.Errorf("OpenF1 has no meeting near %s", startsAt.Format(time.RFC3339))
		}
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.LiveWeekend{}, err
	}
	var sessions []sessionPayload
	if err := c.getWithQuery(ctx, "sessions", "meeting_key", strconv.Itoa(meeting.MeetingKey), &sessions); err != nil {
		return domain.LiveWeekend{}, err
	}
	result := domain.LiveWeekend{Sessions: make([]domain.WeekendSession, 0, len(sessions)), Freshness: domain.Freshness{Source: "openf1", RetrievedAt: time.Now().UTC()}}
	for _, item := range sessions {
		result.MeetingKey = item.MeetingKey
		result.MeetingName = item.Location + " Grand Prix"
		result.Sessions = append(result.Sessions, domain.WeekendSession{SessionKey: item.SessionKey, MeetingKey: item.MeetingKey, Type: strings.ToLower(item.SessionType), Name: item.SessionName, StartsAt: item.DateStart, EndsAt: item.DateEnd, IsCancelled: item.IsCancelled})
	}
	sort.Slice(result.Sessions, func(i, j int) bool { return result.Sessions[i].StartsAt.Before(result.Sessions[j].StartsAt) })
	result.MeetingKey = meeting.MeetingKey
	result.MeetingName = meeting.MeetingName
	result.Circuit = domain.WeekendCircuit{Name: meeting.CircuitShortName, Type: meeting.CircuitType, ImageURL: meeting.CircuitImage, Location: meeting.Location, Country: meeting.CountryName}
	return result, nil
}

func (c *Client) SessionTiming(ctx context.Context, sessionKey int) (domain.LiveTiming, error) {
	key := strconv.Itoa(sessionKey)
	var drivers []driverPayload
	if err := c.getWithQuery(ctx, "drivers", "session_key", key, &drivers); err != nil {
		return domain.LiveTiming{}, err
	}
	var results []sessionResultPayload
	if err := c.getWithQuery(ctx, "session_result", "session_key", key, &results); err != nil {
		return domain.LiveTiming{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.LiveTiming{}, err
	}
	var laps []lapPayload
	if err := c.getWithQuery(ctx, "laps", "session_key", key, &laps); err != nil {
		return domain.LiveTiming{}, err
	}
	driverByNumber := make(map[int]driverPayload)
	for _, driver := range drivers {
		driverByNumber[driver.DriverNumber] = driver
	}
	bestLapByNumber := make(map[int]lapPayload)
	latestLapByNumber := make(map[int]lapPayload)
	for _, lap := range laps {
		if previous, ok := latestLapByNumber[lap.DriverNumber]; !ok || lap.LapNumber > previous.LapNumber {
			latestLapByNumber[lap.DriverNumber] = lap
		}
		if lap.LapDuration == nil || *lap.LapDuration <= 0 {
			continue
		}
		if previous, ok := bestLapByNumber[lap.DriverNumber]; !ok || previous.LapDuration == nil || *lap.LapDuration < *previous.LapDuration {
			bestLapByNumber[lap.DriverNumber] = lap
		}
	}
	rows := make([]domain.LiveTimingRow, 0, len(results))
	meetingKey := 0
	for _, item := range results {
		driver := driverByNumber[item.DriverNumber]
		lapNumber := item.NumberOfLaps
		row := domain.LiveTimingRow{Position: item.Position, DriverNumber: item.DriverNumber, DriverCode: driver.NameAcronym, DriverName: firstNonEmpty(driver.FullName, driver.BroadcastName), TeamName: driver.TeamName, TeamColour: driver.TeamColour, LapNumber: &lapNumber, BestLapSeconds: finalNumber(item.Duration)}
		if latest, ok := latestLapByNumber[item.DriverNumber]; ok {
			row.LastLapSeconds = latest.LapDuration
		}
		if best, ok := bestLapByNumber[item.DriverNumber]; ok {
			row.BestLapSeconds = best.LapDuration
			row.Sectors = [3]*float64{best.Sector1, best.Sector2, best.Sector3}
		}
		if item.Position == 1 {
			leader := "Leader"
			row.GapToLeader = &leader
		} else if gap := finalNumber(item.GapToLeader); gap != nil {
			value := "+" + strconv.FormatFloat(*gap, 'f', 3, 64)
			row.GapToLeader = &value
		}
		rows = append(rows, row)
		meetingKey = item.MeetingKey
	}
	return domain.LiveTiming{SessionKey: sessionKey, MeetingKey: meetingKey, SessionName: "Session results", UpdatedAt: time.Now().UTC(), Rows: rows, Freshness: domain.Freshness{Source: "openf1", RetrievedAt: time.Now().UTC()}}, nil
}

func (c *Client) SessionStrategy(ctx context.Context, sessionKey int) (domain.SessionStrategy, error) {
	key := strconv.Itoa(sessionKey)
	var drivers []driverPayload
	if err := c.getWithQuery(ctx, "drivers", "session_key", key, &drivers); err != nil {
		return domain.SessionStrategy{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.SessionStrategy{}, err
	}
	var laps []lapPayload
	if err := c.getWithQuery(ctx, "laps", "session_key", key, &laps); err != nil {
		return domain.SessionStrategy{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.SessionStrategy{}, err
	}
	var stints []stintPayload
	if err := c.getWithQuery(ctx, "stints", "session_key", key, &stints); err != nil {
		return domain.SessionStrategy{}, err
	}
	if err := c.publicRatePause(ctx); err != nil {
		return domain.SessionStrategy{}, err
	}
	var pitStops []pitPayload
	if err := c.getWithQuery(ctx, "pit", "session_key", key, &pitStops); err != nil {
		return domain.SessionStrategy{}, err
	}

	byNumber := make(map[int]*domain.DriverStrategy, len(drivers))
	items := make([]domain.DriverStrategy, 0, len(drivers))
	for _, driver := range drivers {
		items = append(items, domain.DriverStrategy{
			DriverNumber: driver.DriverNumber,
			DriverCode:   driver.NameAcronym,
			DriverName:   firstNonEmpty(driver.FullName, driver.BroadcastName),
			TeamName:     driver.TeamName,
			TeamColour:   driver.TeamColour,
			Laps:         []domain.StrategyLap{},
			Stints:       []domain.StrategyStint{},
			PitStops:     []domain.StrategyPitStop{},
		})
	}
	sort.Slice(items, func(i, j int) bool { return items[i].DriverCode < items[j].DriverCode })
	for index := range items {
		byNumber[items[index].DriverNumber] = &items[index]
	}
	for _, lap := range laps {
		driver := byNumber[lap.DriverNumber]
		if driver == nil || lap.LapDuration == nil || *lap.LapDuration <= 0 {
			continue
		}
		driver.Laps = append(driver.Laps, domain.StrategyLap{LapNumber: lap.LapNumber, Duration: *lap.LapDuration, IsPitOutLap: lap.IsPitOutLap})
	}
	for _, stint := range stints {
		driver := byNumber[stint.DriverNumber]
		if driver == nil {
			continue
		}
		driver.Stints = append(driver.Stints, domain.StrategyStint{Number: stint.StintNumber, Compound: stint.Compound, StartLap: stint.LapStart, EndLap: stint.LapEnd, TyreAgeAtStart: stint.TyreAgeAtStart})
	}
	for _, stop := range pitStops {
		driver := byNumber[stop.DriverNumber]
		if driver == nil {
			continue
		}
		driver.PitStops = append(driver.PitStops, domain.StrategyPitStop{LapNumber: stop.LapNumber, LaneDuration: stop.LaneDuration, StopDuration: stop.StopDuration})
	}
	for index := range items {
		sort.Slice(items[index].Laps, func(i, j int) bool { return items[index].Laps[i].LapNumber < items[index].Laps[j].LapNumber })
		sort.Slice(items[index].Stints, func(i, j int) bool { return items[index].Stints[i].Number < items[index].Stints[j].Number })
		sort.Slice(items[index].PitStops, func(i, j int) bool { return items[index].PitStops[i].LapNumber < items[index].PitStops[j].LapNumber })
	}
	return domain.SessionStrategy{SessionKey: sessionKey, Drivers: items, Freshness: domain.Freshness{Source: "openf1", RetrievedAt: time.Now().UTC()}}, nil
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
	return c.getWithQuery(ctx, path, "session_key", "latest", target)
}

func (c *Client) getWithQuery(ctx context.Context, path, key, value string, target any) error {
	endpoint, err := url.Parse(c.baseURL + "/" + path)
	if err != nil {
		return fmt.Errorf("build OpenF1 URL: %w", err)
	}
	query := endpoint.Query()
	query.Set(key, value)
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
	IsPitOutLap  bool      `json:"is_pit_out_lap"`
}

type stintPayload struct {
	DriverNumber   int     `json:"driver_number"`
	StintNumber    int     `json:"stint_number"`
	Compound       string  `json:"compound"`
	LapStart       int     `json:"lap_start"`
	LapEnd         int     `json:"lap_end"`
	TyreAgeAtStart float64 `json:"tyre_age_at_start"`
}

type pitPayload struct {
	DriverNumber int      `json:"driver_number"`
	LapNumber    int      `json:"lap_number"`
	LaneDuration *float64 `json:"lane_duration"`
	StopDuration *float64 `json:"stop_duration"`
}

type sessionPayload struct {
	SessionKey  int       `json:"session_key"`
	SessionType string    `json:"session_type"`
	SessionName string    `json:"session_name"`
	DateStart   time.Time `json:"date_start"`
	DateEnd     time.Time `json:"date_end"`
	MeetingKey  int       `json:"meeting_key"`
	Location    string    `json:"location"`
	IsCancelled bool      `json:"is_cancelled"`
}
type meetingPayload struct {
	MeetingKey       int       `json:"meeting_key"`
	MeetingName      string    `json:"meeting_name"`
	CircuitShortName string    `json:"circuit_short_name"`
	CircuitType      string    `json:"circuit_type"`
	CircuitImage     string    `json:"circuit_image"`
	Location         string    `json:"location"`
	CountryName      string    `json:"country_name"`
	DateStart        time.Time `json:"date_start"`
}
type sessionResultPayload struct {
	Position     int             `json:"position"`
	DriverNumber int             `json:"driver_number"`
	NumberOfLaps int             `json:"number_of_laps"`
	MeetingKey   int             `json:"meeting_key"`
	Duration     json.RawMessage `json:"duration"`
	GapToLeader  json.RawMessage `json:"gap_to_leader"`
}

func finalNumber(raw json.RawMessage) *float64 {
	var number float64
	if json.Unmarshal(raw, &number) == nil {
		return &number
	}
	var numbers []*float64
	if json.Unmarshal(raw, &numbers) == nil {
		for index := len(numbers) - 1; index >= 0; index-- {
			if numbers[index] != nil {
				return numbers[index]
			}
		}
	}
	return nil
}
func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
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
