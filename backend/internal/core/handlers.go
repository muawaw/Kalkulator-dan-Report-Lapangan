package core

import (
	"log"
	"net/http"

	"github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/json"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Calculator Handler for handling request related to calculator
func (h *Handler) Calculator(w http.ResponseWriter, r *http.Request) {
}

// Config Handler for handling request related to config
func (h *Handler) Config(w http.ResponseWriter, r *http.Request) {
	err := h.service.Config(r.Context())
	if err != nil {
		log.Printf("Error occured while trying the Config Services: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	lapangan := struct {
		Lapangan []string `json:"lapangan"`
	}{}

	json.WriteJSON(w, http.StatusOK, lapangan)

}
