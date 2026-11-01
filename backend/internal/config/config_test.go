package config

import "testing"

func TestLoadRequiresDatabaseURL(t *testing.T) {
	t.Setenv("APEX_DATABASE_URL", "")
	if _, err := Load(); err == nil {
		t.Fatal("expected missing database URL to fail")
	}
}

func TestLoadDefaults(t *testing.T) {
	t.Setenv("APEX_DATABASE_URL", "postgres://example")
	t.Setenv("APEX_HTTP_TIMEOUT", "")
	t.Setenv("APEX_CORS_ALLOWED_ORIGINS", "")
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.HTTPAddr != ":8081" || cfg.HTTPTimeout.String() != "10s" {
		t.Fatalf("unexpected defaults: %+v", cfg)
	}
	if len(cfg.CORSAllowedOrigins) != 1 || cfg.CORSAllowedOrigins[0] != "*" {
		t.Fatalf("expected development wildcard origin, got %v", cfg.CORSAllowedOrigins)
	}
}
