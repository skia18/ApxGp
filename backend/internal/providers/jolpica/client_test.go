package jolpica

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

func TestSeasonRaces(t *testing.T) {
	transport := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if r.URL.Path != "/2026.json" || r.URL.Query().Get("limit") != "100" {
			t.Fatalf("unexpected request URL: %s", r.URL.String())
		}
		return &http.Response{
			StatusCode: http.StatusOK,
			Header:     http.Header{"Content-Type": []string{"application/json"}},
			Body: io.NopCloser(strings.NewReader(
				`{"MRData":{"RaceTable":{"Races":[{"season":"2026","round":"1","raceName":"Australian Grand Prix","date":"2026-03-08","time":"04:00:00Z","Circuit":{"circuitId":"albert_park","circuitName":"Albert Park Grand Prix Circuit","Location":{"lat":"-37.8497","long":"144.968","locality":"Melbourne","country":"Australia"}}}]}}}`,
			)),
		}, nil
	})

	client := NewClient("https://example.test", &http.Client{Timeout: time.Second, Transport: transport})
	races, _, err := client.SeasonRaces(context.Background(), 2026)
	if err != nil {
		t.Fatalf("SeasonRaces() error = %v", err)
	}
	if len(races) != 1 || races[0].Round != 1 || races[0].Circuit.Slug != "albert_park" {
		t.Fatalf("unexpected races: %+v", races)
	}
}

func TestStandings(t *testing.T) {
	transport := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		var body string
		switch r.URL.Path {
		case "/2026/driverstandings.json":
			body = `{"MRData":{"StandingsTable":{"StandingsLists":[{"round":"18","DriverStandings":[{"position":"1","points":"365","wins":"9","Driver":{"driverId":"antonelli","permanentNumber":"12","code":"ANT","givenName":"Andrea Kimi","familyName":"Antonelli","dateOfBirth":"2006-08-25","nationality":"Italian"},"Constructors":[{"constructorId":"mercedes","name":"Mercedes","nationality":"German"}]}]}]}}}`
		case "/2026/constructorstandings.json":
			body = `{"MRData":{"StandingsTable":{"StandingsLists":[{"round":"18","ConstructorStandings":[{"position":"1","points":"607","wins":"12","Constructor":{"constructorId":"mercedes","name":"Mercedes","nationality":"German"}}]}]}}}`
		default:
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(body)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", &http.Client{Transport: transport})
	snapshot, err := client.Standings(context.Background(), 2026)
	if err != nil {
		t.Fatalf("Standings() error = %v", err)
	}
	if snapshot.Round != 18 || len(snapshot.Drivers) != 1 || len(snapshot.Constructors) != 1 {
		t.Fatalf("unexpected snapshot: %+v", snapshot)
	}
	if snapshot.Drivers[0].Driver.Slug != "antonelli" || snapshot.Constructors[0].Points != 607 {
		t.Fatalf("unexpected standings mapping: %+v", snapshot)
	}
}

func TestClassifications(t *testing.T) {
	transport := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		var body string
		switch r.URL.Path {
		case "/2026/results.json":
			body = `{"MRData":{"RaceTable":{"Races":[{"round":"1","Results":[{"position":"1","positionText":"1","points":"25","grid":"1","laps":"58","status":"Finished","Driver":{"driverId":"russell","permanentNumber":"63","code":"RUS","givenName":"George","familyName":"Russell","dateOfBirth":"1998-02-15","nationality":"British"},"Constructor":{"constructorId":"mercedes","name":"Mercedes","nationality":"German"},"Time":{"millis":"4986801"},"FastestLap":{"rank":"6","Time":{"time":"1:22.670"}}}]}]}}}`
		case "/2026/qualifying.json":
			body = `{"MRData":{"RaceTable":{"Races":[{"round":"1","QualifyingResults":[{"position":"1","Driver":{"driverId":"russell","permanentNumber":"63","code":"RUS","givenName":"George","familyName":"Russell","dateOfBirth":"1998-02-15","nationality":"British"},"Constructor":{"constructorId":"mercedes","name":"Mercedes","nationality":"German"},"Q1":"1:19.507","Q2":"1:18.934","Q3":"1:18.518"}]}]}}}`
		default:
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(body)), Header: http.Header{}}, nil
	})
	client := NewClient("https://example.test", &http.Client{Transport: transport})
	snapshots, err := client.Classifications(context.Background(), 2026)
	if err != nil {
		t.Fatalf("Classifications() error = %v", err)
	}
	if len(snapshots) != 1 || len(snapshots[0].Race) != 1 || len(snapshots[0].Qualifying) != 1 {
		t.Fatalf("unexpected snapshots: %+v", snapshots)
	}
	if snapshots[0].Race[0].ElapsedMillis == nil || *snapshots[0].Race[0].ElapsedMillis != 4986801 {
		t.Fatalf("unexpected race mapping: %+v", snapshots[0].Race[0])
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return fn(request)
}
