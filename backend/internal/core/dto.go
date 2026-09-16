package core

import "time"

type LapanganResponse struct {
	ID            string  `json:"id"`
	NamaLapangan  string  `json:"nama_lapangan"`
	HargaLapangan float64 `json:"harga_lapangan"`
	HargaBallboy  float64 `json:"harga_ballboy"`
}

type ReclubResponse struct {
	ID              string  `json:"id"`
	JadwalAtauHari  string  `json:"jadwal_atau_hari"`
	BiayaDaftar     float64 `json:"biaya_daftar"`
	BiayaPerJam     float64 `json:"biaya_per_jam"`
	TotalLamaJadwal float64 `json:"total_lama_jadwal"`
}

type CreateReportKeuanganRequest struct {
	Tanggal     string  `json:"tanggal"`
	KasIn       float64 `json:"kas_in"`
	KasOut      float64 `json:"kas_out"`
	Description string  `json:"description"`
}

type UpdateReportKeuanganRequest struct {
	ID          string  `json:"id"`
	Tanggal     string  `json:"tanggal"`
	KasIn       float64 `json:"kas_in"`
	KasOut      float64 `json:"kas_out"`
	Description string  `json:"description"`
}

type ReportKeuanganResponse struct {
	ID          string    `json:"id"`
	Tanggal     string    `json:"tanggal"`
	KasIn       float64   `json:"kas_in"`
	KasOut      float64   `json:"kas_out"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DashboardSummaryResponse struct {
	TotalKasIn  float64 `json:"total_kas_in"`
	TotalKasOut float64 `json:"total_kas_out"`
	NetBalance  float64 `json:"net_balance"`
	TotalCount  int     `json:"total_count"`
}

type PaginatedReportsResponse struct {
	Data       []ReportKeuanganResponse `json:"data"`
	TotalCount int                      `json:"total_count"`
	Page       int                      `json:"page"`
	Limit      int                      `json:"limit"`
}
