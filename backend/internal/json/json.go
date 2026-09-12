package json

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

func WriteJSON(w http.ResponseWriter, status int, data any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(data)
}

func ReadJSON(r *http.Request, dst any) error {
	// Restrict payload size (e.g., 1MB) to prevent large payload attacks
	maxBytes := int64(1048576)
	r.Body = http.MaxBytesReader(nil, r.Body, maxBytes)

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields() // Reject extra JSON keys not in the struct

	err := dec.Decode(dst)
	if err != nil {
		return err
	}

	// Ensure there is only a single JSON value in the request body
	err = dec.Decode(&struct{}{})
	if !errors.Is(err, io.EOF) {
		return errors.New("body must only contain a single JSON object")
	}

	return nil
}
