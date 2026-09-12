package core

import (
	"errors"
	"log"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5"
	repo "github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/adapters/postgres/sqlc"
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
	result, err := h.service.Calculator(r.Context())
	if err != nil {
		log.Printf("Error occured while trying the Calculator Services: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		ReportKeuangan []repo.ReportPKKReportKeuangan `json:"report_keuangan"`
	}{
		ReportKeuangan: result,
	}

	_ = json.WriteJSON(w, http.StatusOK, response)
}

// GetLapangan Handler for fetching all lapangan records
func (h *Handler) GetLapangan(w http.ResponseWriter, r *http.Request) {
	lapangan, err := h.service.GetLapangan(r.Context())
	if err != nil {
		slog.Error("Failed to fetch lapangan records", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Masking DTO
	response := make([]LapanganResponse, 0, len(lapangan))
	for _, l := range lapangan {
		maskedID, _ := EncodeID(l.ID)
		hargaLap, _ := l.HargaLapangan.Float64Value()
		hargaBallboy, _ := l.HargaBallboy.Float64Value()

		response = append(response, LapanganResponse{
			ID:            maskedID,
			NamaLapangan:  l.NamaLapangan,
			HargaLapangan: hargaLap.Float64,
			HargaBallboy:  hargaBallboy.Float64,
		})
	}

	_ = json.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) GetLapanganByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	lapangan, err := h.service.GetLapanganByID(r.Context(), int32(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, lapangan)
}

// CreateLapangan Handler for creating a new lapangan record
func (h *Handler) CreateLapangan(w http.ResponseWriter, r *http.Request) {
	var req repo.CreateMasterDataLapanganParams
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	lapangan, err := h.service.CreateLapangan(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, lapangan)
}

// UpdateLapangan Handler for updating an existing lapangan record
func (h *Handler) UpdateLapangan(w http.ResponseWriter, r *http.Request) {
	var req repo.UpdateMasterDataLapanganParams
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	lapangan, err := h.service.UpdateLapangan(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, lapangan)
}

// DeleteLapangan Handler for deleting an existing lapangan record
func (h *Handler) DeleteLapangan(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteLapangan(r.Context(), int32(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetReclub Handler for fetching all reclub records
func (h *Handler) GetReclub(w http.ResponseWriter, r *http.Request) {
	reclub, err := h.service.GetReclub(r.Context())
	if err != nil {
		slog.Error("Failed to fetch reclub records", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := make([]ReclubResponse, 0, len(reclub))
	for _, l := range reclub {
		maskedID, _ := EncodeID(l.ID)
		biayaDaftar, _ := l.BiayaDaftar.Float64Value()
		biayaPerjam, _ := l.BiayaPerJam.Float64Value()
		totalLamaJadwal, _ := l.TotalLamaJadwal.Float64Value()

		response = append(response, ReclubResponse{
			ID:              maskedID,
			JadwalAtauHari:  l.JadwalAtauHari,
			BiayaDaftar:     biayaDaftar.Float64,
			BiayaPerJam:     biayaPerjam.Float64,
			TotalLamaJadwal: totalLamaJadwal.Float64,
		})
	}

	_ = json.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) GetReclubByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	reclub, err := h.service.GetReclubByID(r.Context(), int32(id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Reclub record not found", http.StatusNotFound)
			return
		}

		slog.Error("Failed to fetch reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, reclub)
}

// CreateReclub Handler for creating a new reclub record
func (h *Handler) CreateReclub(w http.ResponseWriter, r *http.Request) {
	var req repo.CreateMasterDataReclubParams
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	reclub, err := h.service.CreateReclub(r.Context(), req)
	if err != nil {
		slog.Error("Failed to create reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, reclub)
}

// UpdateReclub Handler for updating an existing reclub record
func (h *Handler) UpdateReclub(w http.ResponseWriter, r *http.Request) {
	var req repo.UpdateMasterDataReclubParams
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	reclub, err := h.service.UpdateReclub(r.Context(), req)
	if err != nil {
		slog.Error("Failed to update reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, reclub)
}

// DeleteReclub Handler for deleting an existing reclub record
func (h *Handler) DeleteReclub(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteReclub(r.Context(), int32(id)); err != nil {
		slog.Error("Failed to delete reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
