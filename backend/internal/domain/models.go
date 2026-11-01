package domain

import "time"

type Source struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	BaseURL string `json:"baseUrl"`
}

type Season struct {
	ID        string    `json:"id"`
	Year      int       `json:"year"`
	IsCurrent bool      `json:"isCurrent"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Circuit struct {
	ID        string   `json:"id"`
	Slug      string   `json:"slug"`
	Name      string   `json:"name"`
	Locality  string   `json:"locality"`
	Country   string   `json:"country"`
	Latitude  *float64 `json:"latitude,omitempty"`
	Longitude *float64 `json:"longitude,omitempty"`
}

type Race struct {
	ID        string    `json:"id"`
	Season    int       `json:"season"`
	Round     int       `json:"round"`
	Slug      string    `json:"slug"`
	Name      string    `json:"name"`
	StartsAt  time.Time `json:"startsAt"`
	Circuit   Circuit   `json:"circuit"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Freshness struct {
	Source      string    `json:"source"`
	RetrievedAt time.Time `json:"retrievedAt"`
	Stale       bool      `json:"stale"`
}

type Page[T any] struct {
	Items     []T        `json:"items"`
	Total     int        `json:"total"`
	Freshness *Freshness `json:"freshness,omitempty"`
}

type IngestionResult struct {
	RunID     string `json:"runId"`
	Season    int    `json:"season"`
	Processed int    `json:"processed"`
	Inserted  int    `json:"inserted"`
	Updated   int    `json:"updated"`
}

type Driver struct {
	ID              string     `json:"id"`
	Slug            string     `json:"slug"`
	GivenName       string     `json:"givenName"`
	FamilyName      string     `json:"familyName"`
	Code            string     `json:"code,omitempty"`
	PermanentNumber *int       `json:"permanentNumber,omitempty"`
	DateOfBirth     *time.Time `json:"dateOfBirth,omitempty"`
	Nationality     string     `json:"nationality"`
}

type Constructor struct {
	ID          string `json:"id"`
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Nationality string `json:"nationality"`
}

type DriverStanding struct {
	Position    int          `json:"position"`
	Points      float64      `json:"points"`
	Wins        int          `json:"wins"`
	Driver      Driver       `json:"driver"`
	Constructor *Constructor `json:"constructor,omitempty"`
}

type ConstructorStanding struct {
	Position    int         `json:"position"`
	Points      float64     `json:"points"`
	Wins        int         `json:"wins"`
	Constructor Constructor `json:"constructor"`
}

type StandingsSnapshot struct {
	Season       int                   `json:"season"`
	Round        int                   `json:"round"`
	Drivers      []DriverStanding      `json:"drivers"`
	Constructors []ConstructorStanding `json:"constructors"`
	RetrievedAt  time.Time             `json:"retrievedAt"`
}

type Session struct {
	ID       string     `json:"id"`
	RaceID   string     `json:"raceId"`
	Type     string     `json:"type"`
	Name     string     `json:"name"`
	StartsAt *time.Time `json:"startsAt,omitempty"`
}

type RaceClassification struct {
	Position       int         `json:"position"`
	PositionText   string      `json:"positionText"`
	Points         float64     `json:"points"`
	Grid           int         `json:"grid"`
	Laps           int         `json:"laps"`
	Status         string      `json:"status"`
	ElapsedMillis  *int64      `json:"elapsedMillis,omitempty"`
	FastestLapRank *int        `json:"fastestLapRank,omitempty"`
	FastestLap     string      `json:"fastestLap,omitempty"`
	Driver         Driver      `json:"driver"`
	Constructor    Constructor `json:"constructor"`
}

type QualifyingClassification struct {
	Position    int         `json:"position"`
	Q1          string      `json:"q1,omitempty"`
	Q2          string      `json:"q2,omitempty"`
	Q3          string      `json:"q3,omitempty"`
	Driver      Driver      `json:"driver"`
	Constructor Constructor `json:"constructor"`
}

type ClassificationSnapshot struct {
	Season      int
	Round       int
	Race        []RaceClassification
	Qualifying  []QualifyingClassification
	RetrievedAt time.Time
}

type Classification struct {
	Session    Session                    `json:"session"`
	Race       []RaceClassification       `json:"race,omitempty"`
	Qualifying []QualifyingClassification `json:"qualifying,omitempty"`
	Freshness  *Freshness                 `json:"freshness,omitempty"`
}

type LiveTimingRow struct {
	Position       int         `json:"position"`
	DriverNumber   int         `json:"driverNumber"`
	DriverCode     string      `json:"driverCode"`
	DriverName     string      `json:"driverName"`
	TeamName       string      `json:"teamName"`
	TeamColour     string      `json:"teamColour,omitempty"`
	LapNumber      *int        `json:"lapNumber,omitempty"`
	GapToLeader    *string     `json:"gapToLeader,omitempty"`
	Interval       *string     `json:"interval,omitempty"`
	LastLapSeconds *float64    `json:"lastLapSeconds,omitempty"`
	BestLapSeconds *float64    `json:"bestLapSeconds,omitempty"`
	Sectors        [3]*float64 `json:"sectors"`
}

type LiveTiming struct {
	SessionKey  int             `json:"sessionKey"`
	MeetingKey  int             `json:"meetingKey"`
	SessionName string          `json:"sessionName"`
	UpdatedAt   time.Time       `json:"updatedAt"`
	Rows        []LiveTimingRow `json:"rows"`
	Freshness   Freshness       `json:"freshness"`
}
