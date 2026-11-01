package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/apex-f1/apex-f1/backend/internal/config"
	"github.com/apex-f1/apex-f1/backend/internal/database"
	"github.com/apex-f1/apex-f1/backend/internal/httpapi"
	"github.com/apex-f1/apex-f1/backend/internal/providers/f1signalr"
	"github.com/apex-f1/apex-f1/backend/internal/providers/jolpica"
	"github.com/apex-f1/apex-f1/backend/internal/providers/openf1"
	"github.com/apex-f1/apex-f1/backend/internal/repository"
	"github.com/apex-f1/apex-f1/backend/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("load configuration", "error", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	pool, err := database.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("open database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	calendarRepository := repository.NewPostgresCalendar(pool)
	gridRepository := repository.NewPostgresGrid(pool)
	classificationRepository := repository.NewPostgresClassifications(pool)
	provider := jolpica.NewClient(cfg.JolpicaBaseURL, &http.Client{Timeout: cfg.HTTPTimeout})
	calendarService := service.NewCalendar(calendarRepository, calendarRepository, provider)
	gridService := service.NewGrid(gridRepository, provider)
	classificationService := service.NewClassifications(classificationRepository, provider)
	openF1Provider := openf1.NewClient(cfg.OpenF1BaseURL, cfg.OpenF1AccessToken, &http.Client{Timeout: cfg.HTTPTimeout})
	signalRProvider := f1signalr.NewClient(cfg.F1LiveTimingBaseURL, &http.Client{Timeout: cfg.HTTPTimeout})
	liveTimingService := service.NewLiveTiming(signalRProvider, openF1Provider)

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.NewRouter(pool, calendarService, gridService, classificationService, liveTimingService, cfg.CORSAllowedOrigins),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("API listening", "address", cfg.HTTPAddr, "environment", cfg.Environment)
		serverErrors <- server.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			logger.Error("shutdown API", "error", err)
			os.Exit(1)
		}
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			logger.Error("serve API", "error", err)
			os.Exit(1)
		}
	}
}
