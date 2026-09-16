package core

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/muawaw/Kalkulator-dan-Report-Lapangan/backend/internal/adapters/postgres/sqlc"
)

type Service interface {
	GetLapangan(ctx context.Context) ([]repo.ReportPKKMasterDataLapangan, error)
	GetLapanganByID(ctx context.Context, id int32) (LapanganResponse, error)
	CreateLapangan(ctx context.Context, arg repo.CreateMasterDataLapanganParams) (repo.ReportPKKMasterDataLapangan, error)
	UpdateLapangan(ctx context.Context, arg repo.UpdateMasterDataLapanganParams) (repo.ReportPKKMasterDataLapangan, error)
	DeleteLapangan(ctx context.Context, id int32) error

	GetReclub(ctx context.Context) ([]repo.ReportPKKMasterDataReclub, error)
	GetReclubByID(ctx context.Context, id int32) (ReclubResponse, error)
	CreateReclub(ctx context.Context, arg repo.CreateMasterDataReclubParams) (repo.ReportPKKMasterDataReclub, error)
	UpdateReclub(ctx context.Context, arg repo.UpdateMasterDataReclubParams) (repo.ReportPKKMasterDataReclub, error)
	DeleteReclub(ctx context.Context, id int32) error

	CreateReportKeuangan(ctx context.Context, req CreateReportKeuanganRequest) (ReportKeuanganResponse, error)
	GetReportKeuangan(ctx context.Context) ([]ReportKeuanganResponse, error)
	GetReportKeuanganByID(ctx context.Context, id int32) (ReportKeuanganResponse, error)
	UpdateReportKeuangan(ctx context.Context, req UpdateReportKeuanganRequest) (ReportKeuanganResponse, error)
	DeleteReportKeuangan(ctx context.Context, id int32) error
}

type svc struct {
	repo repo.Querier
}

func NewService(repo repo.Querier) Service {
	return &svc{
		repo: repo,
	}
}

func (s *svc) GetLapangan(ctx context.Context) ([]repo.ReportPKKMasterDataLapangan, error) {
	return s.repo.GetMasterDataLapangan(ctx)
}

func (s *svc) GetLapanganByID(ctx context.Context, id int32) (LapanganResponse, error) {
	l, err := s.repo.GetMasterDataLapanganByID(ctx, id)
	if err != nil {
		return LapanganResponse{}, err
	}

	maskedID, _ := EncodeID(l.ID)
	hargaLap, _ := l.HargaLapangan.Float64Value()
	hargaBallboy, _ := l.HargaBallboy.Float64Value()

	return LapanganResponse{
		ID:            maskedID,
		NamaLapangan:  l.NamaLapangan,
		HargaLapangan: hargaLap.Float64,
		HargaBallboy:  hargaBallboy.Float64,
	}, nil
}

func (s *svc) CreateLapangan(ctx context.Context, arg repo.CreateMasterDataLapanganParams) (repo.ReportPKKMasterDataLapangan, error) {
	return s.repo.CreateMasterDataLapangan(ctx, arg)
}

func (s *svc) UpdateLapangan(ctx context.Context, arg repo.UpdateMasterDataLapanganParams) (repo.ReportPKKMasterDataLapangan, error) {
	return s.repo.UpdateMasterDataLapangan(ctx, arg)
}

func (s *svc) GetReclub(ctx context.Context) ([]repo.ReportPKKMasterDataReclub, error) {
	return s.repo.GetMasterDataReclub(ctx)
}

func (s *svc) GetReclubByID(ctx context.Context, id int32) (ReclubResponse, error) {
	l, err := s.repo.GetMasterDataReclubByID(ctx, id)
	if err != nil {
		return ReclubResponse{}, err
	}

	maskedID, _ := EncodeID(l.ID)
	biayaDaftar, _ := l.BiayaDaftar.Float64Value()
	biayaPerjam, _ := l.BiayaPerJam.Float64Value()
	totalLamaJadwal, _ := l.TotalLamaJadwal.Float64Value()

	return ReclubResponse{
		ID:              maskedID,
		JadwalAtauHari:  l.JadwalAtauHari,
		BiayaDaftar:     biayaDaftar.Float64,
		BiayaPerJam:     biayaPerjam.Float64,
		TotalLamaJadwal: totalLamaJadwal.Float64,
	}, nil
}

func (s *svc) CreateReclub(ctx context.Context, arg repo.CreateMasterDataReclubParams) (repo.ReportPKKMasterDataReclub, error) {
	return s.repo.CreateMasterDataReclub(ctx, arg)
}

func (s *svc) UpdateReclub(ctx context.Context, arg repo.UpdateMasterDataReclubParams) (repo.ReportPKKMasterDataReclub, error) {
	return s.repo.UpdateMasterDataReclub(ctx, arg)
}

func (s *svc) DeleteLapangan(ctx context.Context, id int32) error {
	return s.repo.DeleteMasterDataLapangan(ctx, id)
}

func (s *svc) DeleteReclub(ctx context.Context, id int32) error {
	return s.repo.DeleteMasterDataReclub(ctx, id)
}

func (s *svc) CreateReportKeuangan(ctx context.Context, req CreateReportKeuanganRequest) (ReportKeuanganResponse, error) {
	// Parse date and numbers for sqlc/pgxpool
	var kasIn, kasOut pgtype.Numeric
	_ = kasIn.Scan(fmt.Sprintf("%v", req.KasIn))
	_ = kasOut.Scan(fmt.Sprintf("%v", req.KasOut))

	t, err := time.Parse("2006-01-02", req.Tanggal)
	if err != nil {
		t = time.Now()
	}

	arg := repo.CreateReportKeuanganParams{
		Tanggal:     pgtype.Date{Time: t, Valid: true},
		KasIn:       kasIn,
		KasOut:      kasOut,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
	}

	res, err := s.repo.CreateReportKeuangan(ctx, arg)
	if err != nil {
		return ReportKeuanganResponse{}, err
	}

	maskedID, _ := EncodeID(res.ID)
	kasInVal, _ := res.KasIn.Float64Value()
	kasOutVal, _ := res.KasOut.Float64Value()

	return ReportKeuanganResponse{
		ID:          maskedID,
		Tanggal:     res.Tanggal.Time.Format("2006-01-02"),
		KasIn:       kasInVal.Float64,
		KasOut:      kasOutVal.Float64,
		Description: res.Description.String,
		CreatedAt:   res.CreatedAt.Time,
		UpdatedAt:   res.UpdatedAt.Time,
	}, nil
}

func (s *svc) GetReportKeuangan(ctx context.Context) ([]ReportKeuanganResponse, error) {
	rows, err := s.repo.GetReportKeuangan(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch report keuangan: %w", err)
	}

	response := make([]ReportKeuanganResponse, 0, len(rows))
	for _, row := range rows {
		maskedID, err := EncodeID(row.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to encode ID %d: %w", row.ID, err)
		}

		kasInVal, _ := row.KasIn.Float64Value()
		kasOutVal, _ := row.KasOut.Float64Value()

		var tanggalStr string
		if row.Tanggal.Valid {
			tanggalStr = row.Tanggal.Time.Format("2006-01-02")
		}

		response = append(response, ReportKeuanganResponse{
			ID:          maskedID,
			Tanggal:     tanggalStr,
			KasIn:       kasInVal.Float64,
			KasOut:      kasOutVal.Float64,
			Description: row.Description.String,
			CreatedAt:   row.CreatedAt.Time,
			UpdatedAt:   row.UpdatedAt.Time,
		})
	}

	return response, nil
}

func (s *svc) GetReportKeuanganByID(ctx context.Context, id int32) (ReportKeuanganResponse, error) {
	res, err := s.repo.GetReportKeuanganByID(ctx, id)
	if err != nil {
		return ReportKeuanganResponse{}, err
	}

	maskedID, _ := EncodeID(res.ID)
	kasInVal, _ := res.KasIn.Float64Value()
	kasOutVal, _ := res.KasOut.Float64Value()

	return ReportKeuanganResponse{
		ID:          maskedID,
		Tanggal:     res.Tanggal.Time.Format("2006-01-02"),
		KasIn:       kasInVal.Float64,
		KasOut:      kasOutVal.Float64,
		Description: res.Description.String,
		CreatedAt:   res.CreatedAt.Time,
		UpdatedAt:   res.UpdatedAt.Time,
	}, nil
}

func (s *svc) UpdateReportKeuangan(ctx context.Context, req UpdateReportKeuanganRequest) (ReportKeuanganResponse, error) {
	decodedID, err := DecodeID(req.ID)
	if err != nil {
		return ReportKeuanganResponse{}, err
	}

	var kasIn, kasOut pgtype.Numeric
	_ = kasIn.Scan(fmt.Sprintf("%v", req.KasIn))
	_ = kasOut.Scan(fmt.Sprintf("%v", req.KasOut))

	t, err := time.Parse("2006-01-02", req.Tanggal)
	if err != nil {
		t = time.Now()
	}

	arg := repo.UpdateReportKeuanganParams{
		ID:          decodedID,
		Tanggal:     pgtype.Date{Time: t, Valid: true},
		KasIn:       kasIn,
		KasOut:      kasOut,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
	}

	res, err := s.repo.UpdateReportKeuangan(ctx, arg)
	if err != nil {
		return ReportKeuanganResponse{}, err
	}

	maskedID, _ := EncodeID(res.ID)
	kasInVal, _ := res.KasIn.Float64Value()
	kasOutVal, _ := res.KasOut.Float64Value()

	return ReportKeuanganResponse{
		ID:          maskedID,
		Tanggal:     res.Tanggal.Time.Format("2006-01-02"),
		KasIn:       kasInVal.Float64,
		KasOut:      kasOutVal.Float64,
		Description: res.Description.String,
		CreatedAt:   res.CreatedAt.Time,
		UpdatedAt:   res.UpdatedAt.Time,
	}, nil
}

func (s *svc) DeleteReportKeuangan(ctx context.Context, id int32) error {
	return s.repo.DeleteReportKeuangan(ctx, id)
}
