package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/core"
)

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID) // For Rate Limiting
	r.Use(middleware.RealIP)    // For Rate Limiting and Tracing
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(middleware.Timeout(60 * time.Second)) // Set a timeout for all requests

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Status: OK"))
	})

	// Calculator HTTP Method
	CalculatorHandler := core.NewHandler(nil)
	r.Get("/calculator", CalculatorHandler.Calculator)

	// Config HTTP Method
	ConfigService := core.NewService()
	ConfigHandler := core.NewHandler(ConfigService)
	r.Get("/config", ConfigHandler.Config)
	r.Post("/config", ConfigHandler.Config)

	return r
}

func (app *application) run(h http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      h,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting server on %s", app.config.addr)
	return srv.ListenAndServe()
}

type application struct {
	config config
}

type config struct {
	addr string
	db   dbConfig
}

type dbConfig struct {
	dsn string
}
