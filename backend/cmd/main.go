package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/env"
)

func main() {
	ctx := context.Background()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	if err := godotenv.Load(); err != nil {
		slog.Error("Error loading .env file", "error", err)
	}

	config := config{
		addr: ":8000",
		db: dbConfig{
			dsn: env.GetEnv("DB_CONN", "host=localhost user=postgres password=postgres dbname=postgres sslmode=disable"),
		},
	}

	// 1. Parse DSN into Config
	connConfig, err := pgx.ParseConfig(config.db.dsn)
	if err != nil {
		slog.Error("Failed to parse database DSN", "error", err)
		return
	}

	// 2. Force simple protocol to completely disable prepared statement caching
	connConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// 3. Connect using the modified config
	conn, err := pgx.ConnectConfig(ctx, connConfig)
	if err != nil {
		slog.Error("Error connecting to the database", "error", err)
		return
	}
	defer conn.Close(ctx)

	slog.Info("Connected to the DB", "dsn", config.db.dsn)

	api := application{
		config: config,
		db:     conn,
	}

	h := api.mount()
	err = api.run(h) // Consider handling the error returned by run()
	if err != nil {
		slog.Error("Error on running the api", "error", err)
	}

}
