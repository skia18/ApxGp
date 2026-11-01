package openf1

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestTimingMapsLatestRows(t *testing.T) {
	transport := roundTripFunc(func(request *http.Request) (*http.Response, error) {
		if request.URL.Query().Get("session_key") != "latest" {
			t.Fatalf("missing latest session query")
		}
		if request.Header.Get("Authorization") != "Bearer test-token" {
			t.Fatalf("missing bearer token")
		}
		payload := "[]"
		switch request.URL.Path {
		case "/drivers":
			payload = `[{"driver_number":4,"full_name":"Lando Norris","name_acronym":"NOR","team_name":"McLaren","team_colour":"FF8000","meeting_key":10,"session_key":20}]`
		case "/position":
			payload = `[{"date":"2026-11-01T12:00:00Z","driver_number":4,"position":1,"meeting_key":10,"session_key":20}]`
		case "/intervals":
			payload = `[{"date":"2026-11-01T12:00:01Z","driver_number":4,"gap_to_leader":null,"interval":null}]`
		case "/laps":
			payload = `[{"date_start":"2026-11-01T11:59:00Z","driver_number":4,"lap_number":12,"lap_duration":80.123,"duration_sector_1":25.1,"duration_sector_2":28.2,"duration_sector_3":26.823},{"date_start":"2026-11-01T11:57:00Z","driver_number":4,"lap_number":10,"lap_duration":79.9}]`
		default:
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(payload)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", "test-token", &http.Client{Transport: transport})
	snapshot, err := client.Timing(context.Background())
	if err != nil {
		t.Fatalf("Timing() error = %v", err)
	}
	if snapshot.SessionKey != 20 || len(snapshot.Rows) != 1 {
		t.Fatalf("unexpected snapshot: %+v", snapshot)
	}
	row := snapshot.Rows[0]
	if row.DriverCode != "NOR" || row.Position != 1 || row.BestLapSeconds == nil || *row.BestLapSeconds != 79.9 {
		t.Fatalf("unexpected row: %+v", row)
	}
	if row.GapToLeader == nil || *row.GapToLeader != "Leader" {
		t.Fatalf("unexpected leader gap: %+v", row.GapToLeader)
	}
}

func TestSessionTimingMapsFastestLapSectors(t *testing.T) {
	transport := roundTripFunc(func(request *http.Request) (*http.Response, error) {
		if request.URL.Query().Get("session_key") != "42" {
			t.Fatalf("unexpected session key: %s", request.URL.RawQuery)
		}
		payload := "[]"
		switch request.URL.Path {
		case "/drivers":
			payload = `[{"driver_number":4,"full_name":"Lando Norris","name_acronym":"NOR","team_name":"McLaren","team_colour":"FF8000"}]`
		case "/session_result":
			payload = `[{"position":1,"driver_number":4,"number_of_laps":18,"meeting_key":10,"duration":79.5,"gap_to_leader":null}]`
		case "/laps":
			payload = `[{"driver_number":4,"lap_number":17,"lap_duration":79.5,"duration_sector_1":25.1,"duration_sector_2":28.2,"duration_sector_3":26.2},{"driver_number":4,"lap_number":18,"lap_duration":83.0,"duration_sector_1":26.0,"duration_sector_2":29.0,"duration_sector_3":28.0}]`
		default:
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(payload)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", "test-token", &http.Client{Transport: transport})
	timing, err := client.SessionTiming(context.Background(), 42)
	if err != nil {
		t.Fatalf("SessionTiming() error = %v", err)
	}
	row := timing.Rows[0]
	if row.BestLapSeconds == nil || *row.BestLapSeconds != 79.5 || row.LastLapSeconds == nil || *row.LastLapSeconds != 83.0 {
		t.Fatalf("unexpected lap times: %+v", row)
	}
	if row.Sectors[0] == nil || *row.Sectors[0] != 25.1 || row.Sectors[2] == nil || *row.Sectors[2] != 26.2 {
		t.Fatalf("unexpected fastest-lap sectors: %+v", row.Sectors)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return fn(request) }
