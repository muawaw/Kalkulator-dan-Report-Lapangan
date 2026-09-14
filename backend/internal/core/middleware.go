package core

import (
	"net/http"
	"os"
)

func SecurityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}
		// Set default Content-Type header for API responses
		w.Header().Set("Content-Type", "application/json")

		apiKey := r.Header.Get("X-API-KEY")
		expectedKey := os.Getenv("API_KEY")

		if expectedKey != "" && apiKey != expectedKey {
			http.Error(w, `{"error":"Unauthorized: Invalid API Key"}`, http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
