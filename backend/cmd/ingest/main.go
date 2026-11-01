package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/config"
	"github.com/apex-f1/apex-f1/backend/internal/database"
	"github.com/apex-f1/apex-f1/backend/internal/providers/jolpica"
	"github.com/apex-f1/apex-f1/backend/internal/repository"
	"github.com/apex-f1/apex-f1/backend/internal/service"
)

func main() {
	season := flag.Int("season", config.CurrentSeason(), "season year to import")
	kind := flag.String("kind", "all", "data to import: calendar, standings, classifications, or all")
	timeout := flag.Duration("timeout", 10*time.Minute, "maximum duration for the complete ingestion run")
	flag.Parse()
	if *season < 1950 || *season > 2200 {
		fmt.Fprintln(os.Stderr, "season must be between 1950 and 2200")
		os.Exit(2)
	}
	if *kind != "calendar" && *kind != "standings" && *kind != "classifications" && *kind != "all" {
		fmt.Fprintln(os.Stderr, "kind must be calendar, standings, classifications, or all")
		os.Exit(2)
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	cfg, err := config.Load()
	if err != nil {
		logger.Error("load configuration", "error", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()
	pool, err := database.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("open database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	provider := jolpica.NewClient(cfg.JolpicaBaseURL, &http.Client{Timeout: cfg.HTTPTimeout})
	if *kind == "calendar" || *kind == "all" {
		repo := repository.NewPostgresCalendar(pool)
		result, err := service.NewCalendar(repo, repo, provider).ImportSeason(ctx, *season)
		if err != nil {
			logger.Error("import calendar", "season", *season, "error", err)
			os.Exit(1)
		}
		logger.Info("calendar import complete", "run_id", result.RunID, "season", result.Season, "processed", result.Processed, "inserted", result.Inserted, "updated", result.Updated)
	}
	if *kind == "standings" || *kind == "all" {
		repo := repository.NewPostgresGrid(pool)
		result, err := service.NewGrid(repo, provider).ImportStandings(ctx, *season)
		if err != nil {
			logger.Error("import standings", "season", *season, "error", err)
			os.Exit(1)
		}
		logger.Info("standings import complete", "run_id", result.RunID, "season", result.Season, "processed", result.Processed)
	}
	if *kind == "classifications" || *kind == "all" {
		repo := repository.NewPostgresClassifications(pool)
		result, err := service.NewClassifications(repo, provider).Import(ctx, *season)
		if err != nil {
			logger.Error("import classifications", "season", *season, "error", err)
			os.Exit(1)
		}
		logger.Info("classification import complete", "run_id", result.RunID, "season", result.Season, "processed", result.Processed)
	}
}
