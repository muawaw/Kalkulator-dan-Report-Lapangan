package core

import (
	"context"

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

	Calculator(ctx context.Context) ([]repo.ReportPKKReportKeuangan, error)
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

func (s *svc) Calculator(ctx context.Context) ([]repo.ReportPKKReportKeuangan, error) {
	// return s.repo.Calculator(ctx)
	return nil, nil
}
