package core

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
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
	var req LapanganResponse
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	decodedID, err := DecodeID(req.ID)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	// Convert incoming float64 fields to pgtype.Numeric
	var hargaLapangan, hargaBallboy pgtype.Numeric
	if err := hargaLapangan.Scan(fmt.Sprintf("%v", req.HargaLapangan)); err != nil {
		http.Error(w, "Invalid harga_lapangan format", http.StatusBadRequest)
		return
	}
	if err := hargaBallboy.Scan(fmt.Sprintf("%v", req.HargaBallboy)); err != nil {
		http.Error(w, "Invalid harga_ballboy format", http.StatusBadRequest)
		return
	}

	params := repo.UpdateMasterDataLapanganParams{
		ID:            decodedID,
		NamaLapangan:  req.NamaLapangan,
		HargaLapangan: hargaLapangan,
		HargaBallboy:  hargaBallboy,
	}

	lapangan, err := h.service.UpdateLapangan(r.Context(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Transform service result back to LapanganResponse with masked ID & float64 values
	maskedID, _ := EncodeID(lapangan.ID)
	hargaLapVal, _ := lapangan.HargaLapangan.Float64Value()
	hargaBallboyVal, _ := lapangan.HargaBallboy.Float64Value()

	response := LapanganResponse{
		ID:            maskedID,
		NamaLapangan:  lapangan.NamaLapangan,
		HargaLapangan: hargaLapVal.Float64,
		HargaBallboy:  hargaBallboyVal.Float64,
	}

	_ = json.WriteJSON(w, http.StatusOK, response)
}

// DeleteLapangan Handler for deleting an existing lapangan record
func (h *Handler) DeleteLapangan(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("delete ID: %s\n", r.URL.Query().Get("id"))
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	fmt.Println("Deleting Lapangan with ID:", idStr)
	// Decode Sqid string back to internal int32 ID
	id, err := DecodeID(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	fmt.Printf("ID after decoding: %d\n", id)
	// Pass the decoded int32 to your service layer
	if err := h.service.DeleteLapangan(r.Context(), id); err != nil {
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
	var req ReclubResponse
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var totalLamaJadwal, biayaDaftar pgtype.Numeric
	if err := totalLamaJadwal.Scan(fmt.Sprintf("%v", req.TotalLamaJadwal)); err != nil {
		http.Error(w, "Invalid total_lama_jadwal format", http.StatusBadRequest)
		return
	}
	if err := biayaDaftar.Scan(fmt.Sprintf("%v", req.BiayaDaftar)); err != nil {
		http.Error(w, "Invalid biaya_daftar format", http.StatusBadRequest)
		return
	}

	params := repo.CreateMasterDataReclubParams{
		JadwalAtauHari:  req.JadwalAtauHari,
		TotalLamaJadwal: totalLamaJadwal,
		BiayaDaftar:     biayaDaftar,
	}

	reclub, err := h.service.CreateReclub(r.Context(), params)
	if err != nil {
		slog.Error("Failed to create reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	maskedID, _ := EncodeID(reclub.ID)
	totalLamaVal, _ := reclub.TotalLamaJadwal.Float64Value()
	biayaDaftarVal, _ := reclub.BiayaDaftar.Float64Value()
	biayaPerJamVal, _ := reclub.BiayaPerJam.Float64Value()

	response := ReclubResponse{
		ID:              maskedID,
		JadwalAtauHari:  reclub.JadwalAtauHari,
		TotalLamaJadwal: totalLamaVal.Float64,
		BiayaDaftar:     biayaDaftarVal.Float64,
		BiayaPerJam:     biayaPerJamVal.Float64,
	}

	_ = json.WriteJSON(w, http.StatusOK, response)
}

// UpdateReclub Handler for updating an existing reclub record
func (h *Handler) UpdateReclub(w http.ResponseWriter, r *http.Request) {
	var req ReclubResponse
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	decodedID, err := DecodeID(req.ID)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var totalLamaJadwal, biayaDaftar pgtype.Numeric
	if err := totalLamaJadwal.Scan(fmt.Sprintf("%v", req.TotalLamaJadwal)); err != nil {
		http.Error(w, "Invalid total_lama_jadwal format", http.StatusBadRequest)
		return
	}
	if err := biayaDaftar.Scan(fmt.Sprintf("%v", req.BiayaDaftar)); err != nil {
		http.Error(w, "Invalid biaya_daftar format", http.StatusBadRequest)
		return
	}

	params := repo.UpdateMasterDataReclubParams{
		ID:              decodedID,
		JadwalAtauHari:  req.JadwalAtauHari,
		TotalLamaJadwal: totalLamaJadwal,
		BiayaDaftar:     biayaDaftar,
	}

	reclub, err := h.service.UpdateReclub(r.Context(), params)
	if err != nil {
		slog.Error("Failed to update reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	maskedID, _ := EncodeID(reclub.ID)
	totalLamaVal, _ := reclub.TotalLamaJadwal.Float64Value()
	biayaDaftarVal, _ := reclub.BiayaDaftar.Float64Value()
	biayaPerJamVal, _ := reclub.BiayaPerJam.Float64Value()

	response := ReclubResponse{
		ID:              maskedID,
		JadwalAtauHari:  reclub.JadwalAtauHari,
		TotalLamaJadwal: totalLamaVal.Float64,
		BiayaDaftar:     biayaDaftarVal.Float64,
		BiayaPerJam:     biayaPerJamVal.Float64,
	}

	_ = json.WriteJSON(w, http.StatusOK, response)
}

// DeleteReclub Handler for deleting an existing reclub record
func (h *Handler) DeleteReclub(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	decodedID, err := DecodeID(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteReclub(r.Context(), decodedID); err != nil {
		slog.Error("Failed to delete reclub record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// CreateReportKeuangan Handler (Calculator Save POST)
func (h *Handler) CreateReportKeuangan(w http.ResponseWriter, r *http.Request) {
	var req CreateReportKeuanganRequest
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := h.service.CreateReportKeuangan(r.Context(), req)
	if err != nil {
		slog.Error("Failed to create report keuangan", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusCreated, res)
}

// GetReportKeuangan Handler
func (h *Handler) GetReportKeuangan(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reports, err := h.service.GetReportKeuangan(ctx)
	if err != nil {
		slog.Error("Failed to fetch report keuangan list", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, reports)
}

// GetReportKeuanganByID Handler
func (h *Handler) GetReportKeuanganByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	decodedID, err := DecodeID(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	report, err := h.service.GetReportKeuanganByID(r.Context(), decodedID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Record not found", http.StatusNotFound)
			return
		}
		slog.Error("Failed to fetch report keuangan by ID", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, report)
}

// UpdateReportKeuangan Handler
func (h *Handler) UpdateReportKeuangan(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	var req UpdateReportKeuanganRequest
	if err := json.ReadJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	req.ID = idStr // Bind URL path ID to request DTO

	res, err := h.service.UpdateReportKeuangan(r.Context(), req)
	if err != nil {
		slog.Error("Failed to update report keuangan", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.WriteJSON(w, http.StatusOK, res)
}

// DeleteReportKeuangan Handler
func (h *Handler) DeleteReportKeuangan(w http.ResponseWriter, r *http.Request) {
	// Extract ID from Chi URL path instead of query params
	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	decodedID, err := DecodeID(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteReportKeuangan(r.Context(), decodedID); err != nil {
		slog.Error("Failed to delete report keuangan record", "error", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
