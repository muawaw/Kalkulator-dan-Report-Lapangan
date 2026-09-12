package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5"
	repo "github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/adapters/postgres/sqlc"
	"github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/core"
)

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID) // For Rate Limiting
	r.Use(middleware.RealIP)    // For Rate Limiting and Tracing
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(middleware.Timeout(60 * time.Second)) // Set a timeout for all requests

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Status: OK"))
	})

	// Calculator HTTP Method
	CalculatorHandler := core.NewHandler(core.NewService(nil))
	r.Route("/api/calculator", func(r chi.Router) {
		r.Get("/", CalculatorHandler.Calculator)
	})

	// Config HTTP Method
	ConfigService := core.NewService(repo.New(app.db))
	ConfigHandler := core.NewHandler(ConfigService)
	r.Route("/api/config", func(r chi.Router) {

		r.Use(core.SecurityMiddleware)

		r.Get("/lapangan", ConfigHandler.GetLapangan)
		r.Get("/lapangan/detail", ConfigHandler.GetLapanganByID)
		r.Post("/lapangan", ConfigHandler.CreateLapangan)
		r.Put("/lapangan", ConfigHandler.UpdateLapangan)
		r.Delete("/lapangan", ConfigHandler.DeleteLapangan)

		r.Get("/reclub", ConfigHandler.GetReclub)
		r.Get("/reclub/detail", ConfigHandler.GetReclubByID)
		r.Post("/reclub", ConfigHandler.CreateReclub)
		r.Put("/reclub", ConfigHandler.UpdateReclub)
		r.Delete("/reclub", ConfigHandler.DeleteReclub)
	})

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
	db     *pgx.Conn
}

type config struct {
	addr string
	db   dbConfig
}

type dbConfig struct {
	dsn string
}
