-- +goose Up
-- +goose StatementBegin
CREATE SCHEMA IF NOT EXISTS "reportPKK";

CREATE TABLE "reportPKK"."MasterDataLapangan" (
    id SERIAL PRIMARY KEY,
    nama_lapangan VARCHAR(100) NOT NULL,
    harga_lapangan NUMERIC(12, 2) NOT NULL DEFAULT 0,
    harga_ballboy NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "reportPKK"."MasterDataReclub" (
    id SERIAL PRIMARY KEY,
    jadwal_atau_hari VARCHAR(100) NOT NULL,
    total_lama_jadwal NUMERIC(5, 2) NOT NULL,
    biaya_daftar NUMERIC(12, 2) NOT NULL DEFAULT 0,
    biaya_per_jam NUMERIC(12, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_lama_jadwal > 0 THEN biaya_daftar / total_lama_jadwal 
            ELSE 0 
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "reportPKK"."ReportKeuangan" (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kas_in NUMERIC(12, 2) NOT NULL DEFAULT 0,
    kas_out NUMERIC(12, 2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "reportPKK"."ReportKeuangan";
DROP TABLE IF EXISTS "reportPKK"."MasterDataReclub";
DROP TABLE IF EXISTS "reportPKK"."MasterDataLapangan";
DROP SCHEMA IF EXISTS "reportPKK";
-- +goose StatementEnd