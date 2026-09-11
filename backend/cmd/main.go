package main

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		slog.Error("Error loading .env file", "error", err)
	}

	// host := os.Getenv("DB_HOST")
	// port := os.Getenv("DB_PORT")
	// user := os.Getenv("DB_USER")
	// password := os.Getenv("DB_PASSWORD")
	// dbname := os.Getenv("DB_NAME")
	// schema := os.Getenv("DB_SCHEMA")

	config := config{
		addr: ":8000",
		db:   dbConfig{
			// host:     host,
			// port:     port,
			// user:     user,
			// password: password,
			// dbname:   dbname,
			// schema:   schema,
		},
	}

	api := application{
		config: config,
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	h := api.mount()
	err := api.run(h) // Consider handling the error returned by run()
	if err != nil {
		slog.Error("Error on running the api", "error", err)
	}

}
