package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Environment         string
	HTTPAddr            string
	DatabaseURL         string
	CORSAllowedOrigins  []string
	JolpicaBaseURL      string
	OpenF1BaseURL       string
	OpenF1AccessToken   string
	F1LiveTimingBaseURL string
	HTTPTimeout         time.Duration
}

func Load() (Config, error) {
	timeout, err := time.ParseDuration(value("APEX_HTTP_TIMEOUT", "10s"))
	if err != nil || timeout <= 0 {
		return Config{}, fmt.Errorf("APEX_HTTP_TIMEOUT must be a positive duration")
	}

	environment := value("APEX_ENV", "development")
	defaultAllowedOrigins := "http://localhost:8080,http://localhost:3000,http://localhost:5173"
	if environment == "development" {
		defaultAllowedOrigins = "*"
	}

	cfg := Config{
		Environment:         environment,
		HTTPAddr:            value("APEX_HTTP_ADDR", ":8081"),
		DatabaseURL:         strings.TrimSpace(os.Getenv("APEX_DATABASE_URL")),
		CORSAllowedOrigins:  csv(value("APEX_CORS_ALLOWED_ORIGINS", defaultAllowedOrigins)),
		JolpicaBaseURL:      strings.TrimRight(value("APEX_JOLPICA_BASE_URL", "https://api.jolpi.ca/ergast/f1"), "/"),
		OpenF1BaseURL:       strings.TrimRight(value("APEX_OPENF1_BASE_URL", "https://api.openf1.org/v1"), "/"),
		OpenF1AccessToken:   strings.TrimSpace(os.Getenv("APEX_OPENF1_ACCESS_TOKEN")),
		F1LiveTimingBaseURL: strings.TrimRight(value("APEX_F1_LIVE_TIMING_BASE_URL", "http://localhost:3002"), "/"),
		HTTPTimeout:         timeout,
	}
	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("APEX_DATABASE_URL is required")
	}
	return cfg, nil
}

func CurrentSeason() int {
	if raw := strings.TrimSpace(os.Getenv("APEX_CURRENT_SEASON")); raw != "" {
		if year, err := strconv.Atoi(raw); err == nil {
			return year
		}
	}
	return time.Now().UTC().Year()
}

func value(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func csv(raw string) []string {
	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		if value := strings.TrimSpace(part); value != "" {
			values = append(values, value)
		}
	}
	return values
}
