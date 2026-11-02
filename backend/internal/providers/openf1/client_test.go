package openf1

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
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

func TestWeekendMapsCircuitMetadata(t *testing.T) {
	transport := roundTripFunc(func(request *http.Request) (*http.Response, error) {
		payload := "[]"
		switch request.URL.Path {
		case "/sessions":
			payload = `[{"session_key":42,"session_type":"Practice","session_name":"Practice 1","date_start":"2026-10-30T18:00:00Z","date_end":"2026-10-30T19:00:00Z","meeting_key":10,"location":"Mexico City","is_cancelled":false}]`
		case "/meetings":
			payload = `[{"meeting_key":10,"meeting_name":"Mexico City Grand Prix","circuit_short_name":"Hermanos Rodríguez","circuit_type":"Permanent","circuit_image":"https://example.test/circuit.png","circuit_info_url":"https://api.multiviewer.app/circuit","location":"Mexico City","country_name":"Mexico"}]`
		case "/circuit":
			payload = `{"rotation":36,"x":[0,10,20],"y":[5,15,5],"corners":[{"number":1,"trackPosition":{"x":10,"y":15}}]}`
		default:
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(payload)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", "test-token", &http.Client{Transport: transport})
	weekend, err := client.Weekend(context.Background(), nil)
	if err != nil {
		t.Fatalf("Weekend() error = %v", err)
	}
	if weekend.MeetingName != "Mexico City Grand Prix" || weekend.Circuit.Name != "Hermanos Rodríguez" || weekend.Circuit.ImageURL == "" {
		t.Fatalf("unexpected weekend: %+v", weekend)
	}
	if len(weekend.Circuit.Path) != 3 || len(weekend.Circuit.Corners) != 1 || weekend.Circuit.Rotation != 36 {
		t.Fatalf("unexpected circuit geometry: %+v", weekend.Circuit)
	}
}

func TestWeekendSelectsMeetingNearestRaceDate(t *testing.T) {
	transport := roundTripFunc(func(request *http.Request) (*http.Response, error) {
		payload := "[]"
		switch request.URL.Path {
		case "/meetings":
			if request.URL.Query().Get("year") != "2026" {
				t.Fatalf("unexpected meetings query: %s", request.URL.RawQuery)
			}
			payload = `[{"meeting_key":10,"meeting_name":"Mexico City Grand Prix","date_start":"2026-10-30T00:00:00Z"},{"meeting_key":11,"meeting_name":"São Paulo Grand Prix","date_start":"2026-11-06T00:00:00Z"}]`
		case "/sessions":
			if request.URL.Query().Get("meeting_key") != "11" {
				t.Fatalf("wrong meeting selected: %s", request.URL.RawQuery)
			}
			payload = `[{"session_key":50,"session_type":"Sprint","session_name":"Sprint","date_start":"2026-11-07T14:00:00Z","date_end":"2026-11-07T15:00:00Z","meeting_key":11}]`
		default:
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(payload)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", "test-token", &http.Client{Transport: transport})
	raceStart := time.Date(2026, 11, 8, 17, 0, 0, 0, time.UTC)
	weekend, err := client.Weekend(context.Background(), &raceStart)
	if err != nil {
		t.Fatalf("Weekend() error = %v", err)
	}
	if weekend.MeetingKey != 11 || len(weekend.Sessions) != 1 || weekend.Sessions[0].Type != "sprint" {
		t.Fatalf("unexpected weekend: %+v", weekend)
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

func TestSessionStrategyMapsLapsStintsAndStops(t *testing.T) {
	transport := roundTripFunc(func(request *http.Request) (*http.Response, error) {
		payload := "[]"
		switch request.URL.Path {
		case "/drivers":
			payload = `[{"driver_number":4,"full_name":"Lando Norris","name_acronym":"NOR","team_name":"McLaren","team_colour":"FF8000"}]`
		case "/laps":
			payload = `[{"driver_number":4,"lap_number":2,"lap_duration":80.2,"is_pit_out_lap":false},{"driver_number":4,"lap_number":1,"lap_duration":null,"is_pit_out_lap":true}]`
		case "/stints":
			payload = `[{"driver_number":4,"stint_number":1,"compound":"MEDIUM","lap_start":1,"lap_end":18,"tyre_age_at_start":0}]`
		case "/pit":
			payload = `[{"driver_number":4,"lap_number":19,"lane_duration":21.3,"stop_duration":2.4}]`
		default:
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(payload)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", "test-token", &http.Client{Transport: transport})
	strategy, err := client.SessionStrategy(context.Background(), 42)
	if err != nil {
		t.Fatalf("SessionStrategy() error = %v", err)
	}
	if len(strategy.Drivers) != 1 {
		t.Fatalf("unexpected strategy: %+v", strategy)
	}
	driver := strategy.Drivers[0]
	if len(driver.Laps) != 1 || driver.Laps[0].Duration != 80.2 {
		t.Fatalf("unexpected laps: %+v", driver.Laps)
	}
	if len(driver.Stints) != 1 || driver.Stints[0].Compound != "MEDIUM" {
		t.Fatalf("unexpected stints: %+v", driver.Stints)
	}
	if len(driver.PitStops) != 1 || driver.PitStops[0].StopDuration == nil || *driver.PitStops[0].StopDuration != 2.4 {
		t.Fatalf("unexpected pit stops: %+v", driver.PitStops)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return fn(request) }
