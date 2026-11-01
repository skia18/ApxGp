package f1signalr

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

func TestTimingMapsSignalRLeaderboard(t *testing.T) {
	transport := roundTripFunc(func(request *http.Request) (*http.Response, error) {
		body := `{"isConnected":true,"lastMessageAt":"2026-11-01T12:00:00Z"}`
		if request.URL.Path == "/api/leaderboard" {
			body = `{"Session":{"Key":20,"Name":"Race","Meeting":{"Key":10}},"Leaderboard":["4","_kf"],"Lines":{"4":{"RacingNumber":"4","FullName":"Lando Norris","Tla":"NOR","TeamName":"McLaren","TeamColour":"FF8000","Position":"1","NumberOfLaps":12,"GapToLeader":{"Value":"LEADER"},"LastLapTime":{"Value":"1:20.123"},"BestLapTime":{"Value":"1:19.900"},"Sectors":[{"Value":"25.100"},{"Value":"28.200"},{"Value":"26.823"}]},"_kf":true}}`
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(body)), Header: http.Header{}}, nil
	})
	client := NewClient("http://example.test", &http.Client{Transport: transport, Timeout: time.Second})
	snapshot, err := client.Timing(context.Background())
	if err != nil {
		t.Fatalf("Timing() error = %v", err)
	}
	if snapshot.SessionName != "Race" || snapshot.SessionKey != 20 || snapshot.MeetingKey != 10 || len(snapshot.Rows) != 1 {
		t.Fatalf("unexpected snapshot: %+v", snapshot)
	}
	row := snapshot.Rows[0]
	if row.DriverCode != "NOR" || row.LastLapSeconds == nil || *row.LastLapSeconds != 80.123 {
		t.Fatalf("unexpected row: %+v", row)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return fn(request) }
