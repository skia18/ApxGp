package f1signalr

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
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

func (c *Client) Timing(ctx context.Context) (domain.LiveTiming, error) {
	var status statusPayload
	if err := c.get(ctx, "/api/status", &status); err != nil {
		return domain.LiveTiming{}, err
	}
	if !status.IsConnected {
		return domain.LiveTiming{}, fmt.Errorf("F1 SignalR sidecar is disconnected")
	}
	var payload leaderboardPayload
	if err := c.get(ctx, "/api/leaderboard", &payload); err != nil {
		return domain.LiveTiming{}, err
	}
	return payload.toDomain(status.LastMessageAt), nil
}

func (c *Client) get(ctx context.Context, path string, target any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	response, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("request F1 timing sidecar: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("F1 timing sidecar returned status %d", response.StatusCode)
	}
	if err := json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode F1 timing sidecar: %w", err)
	}
	return nil
}

type statusPayload struct {
	IsConnected   bool       `json:"isConnected"`
	LastMessageAt *time.Time `json:"lastMessageAt"`
}
type leaderboardPayload struct {
	Session struct {
		Key     int    `json:"Key"`
		Name    string `json:"Name"`
		Meeting struct {
			Key  int    `json:"Key"`
			Name string `json:"Name"`
		} `json:"Meeting"`
	} `json:"Session"`
	Leaderboard []string                   `json:"Leaderboard"`
	Lines       map[string]json.RawMessage `json:"Lines"`
}
type linePayload struct {
	RacingNumber  string          `json:"RacingNumber"`
	BroadcastName string          `json:"BroadcastName"`
	FullName      string          `json:"FullName"`
	TLA           string          `json:"Tla"`
	TeamName      string          `json:"TeamName"`
	TeamColour    string          `json:"TeamColour"`
	Position      json.RawMessage `json:"Position"`
	NumberOfLaps  json.RawMessage `json:"NumberOfLaps"`
	GapToLeader   json.RawMessage `json:"GapToLeader"`
	Interval      json.RawMessage `json:"IntervalToPositionAhead"`
	LastLap       json.RawMessage `json:"LastLapTime"`
	BestLap       json.RawMessage `json:"BestLapTime"`
	Sectors       json.RawMessage `json:"Sectors"`
}

func (p leaderboardPayload) toDomain(lastMessage *time.Time) domain.LiveTiming {
	updatedAt := time.Now().UTC()
	if lastMessage != nil {
		updatedAt = *lastMessage
	}
	rows := make([]domain.LiveTimingRow, 0, len(p.Lines))
	order := p.Leaderboard
	if len(order) == 0 {
		for number := range p.Lines {
			order = append(order, number)
		}
		sort.Strings(order)
	}
	for index, number := range order {
		raw, ok := p.Lines[number]
		if !ok {
			continue
		}
		var line linePayload
		if json.Unmarshal(raw, &line) != nil {
			continue
		}
		driverNumber, _ := strconv.Atoi(first(line.RacingNumber, number))
		if driverNumber == 0 {
			continue
		}
		position := intValue(line.Position)
		if position == 0 {
			position = index + 1
		}
		lapNumber := optionalInt(line.NumberOfLaps)
		name := first(line.FullName, line.BroadcastName)
		row := domain.LiveTimingRow{Position: position, DriverNumber: driverNumber, DriverCode: line.TLA, DriverName: name, TeamName: line.TeamName, TeamColour: strings.TrimPrefix(line.TeamColour, "#"), LapNumber: lapNumber, GapToLeader: optionalDisplay(line.GapToLeader), Interval: optionalDisplay(line.Interval), LastLapSeconds: lapSeconds(line.LastLap), BestLapSeconds: lapSeconds(line.BestLap), Sectors: sectorSeconds(line.Sectors)}
		rows = append(rows, row)
	}
	stale := time.Since(updatedAt) > 15*time.Second
	return domain.LiveTiming{SessionKey: p.Session.Key, MeetingKey: p.Session.Meeting.Key, SessionName: first(p.Session.Name, "Live session"), UpdatedAt: updatedAt, Rows: rows, Freshness: domain.Freshness{Source: "f1-signalr", RetrievedAt: time.Now().UTC(), Stale: stale}}
}

func first(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
func intValue(raw json.RawMessage) int {
	value := scalarString(raw)
	parsed, _ := strconv.Atoi(value)
	return parsed
}
func optionalInt(raw json.RawMessage) *int {
	value := intValue(raw)
	if value == 0 {
		return nil
	}
	return &value
}
func optionalDisplay(raw json.RawMessage) *string {
	value := scalarString(raw)
	if value == "" {
		return nil
	}
	return &value
}
func lapSeconds(raw json.RawMessage) *float64 {
	value := scalarString(raw)
	if value == "" {
		return nil
	}
	parts := strings.Split(value, ":")
	var seconds float64
	var err error
	if len(parts) == 2 {
		minutes, parseErr := strconv.ParseFloat(parts[0], 64)
		if parseErr != nil {
			return nil
		}
		tail, parseErr := strconv.ParseFloat(parts[1], 64)
		if parseErr != nil {
			return nil
		}
		seconds = minutes*60 + tail
	} else {
		seconds, err = strconv.ParseFloat(value, 64)
		if err != nil {
			return nil
		}
	}
	return &seconds
}
func scalarString(raw json.RawMessage) string {
	if len(raw) == 0 || string(raw) == "null" {
		return ""
	}
	var text string
	if json.Unmarshal(raw, &text) == nil {
		return text
	}
	var number json.Number
	if json.Unmarshal(raw, &number) == nil {
		return number.String()
	}
	var object struct {
		Value json.RawMessage `json:"Value"`
	}
	if json.Unmarshal(raw, &object) == nil && len(object.Value) > 0 {
		return scalarString(object.Value)
	}
	return ""
}
func sectorSeconds(raw json.RawMessage) [3]*float64 {
	var result [3]*float64
	var values []json.RawMessage
	if json.Unmarshal(raw, &values) != nil {
		var keyed map[string]json.RawMessage
		if json.Unmarshal(raw, &keyed) == nil {
			keys := make([]string, 0, len(keyed))
			for key := range keyed {
				keys = append(keys, key)
			}
			sort.Strings(keys)
			for _, key := range keys {
				values = append(values, keyed[key])
			}
		}
	}
	for index := 0; index < len(values) && index < 3; index++ {
		result[index] = lapSeconds(values[index])
	}
	return result
}
