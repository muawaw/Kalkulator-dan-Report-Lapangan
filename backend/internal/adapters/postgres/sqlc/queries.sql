-- ============================================================================
-- ReportKeuangan CRUD
-- ============================================================================

-- name: GetReportKeuangan :many
SELECT * FROM "reportPKK"."ReportKeuangan"
ORDER BY tanggal DESC;

-- name: GetReportKeuanganByID :one
SELECT * FROM "reportPKK"."ReportKeuangan"
WHERE id = $1 LIMIT 1;

-- name: CreateReportKeuangan :one
INSERT INTO "reportPKK"."ReportKeuangan" (
    tanggal, kas_in, kas_out, description
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: UpdateReportKeuangan :one
UPDATE "reportPKK"."ReportKeuangan"
SET 
    tanggal = $2,
    kas_in = $3,
    kas_out = $4,
    description = $5,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteReportKeuangan :exec
DELETE FROM "reportPKK"."ReportKeuangan"
WHERE id = $1;

-- ============================================================================
-- MasterDataLapangan CRUD
-- ============================================================================

-- name: GetMasterDataLapangan :many
SELECT * FROM "reportPKK"."MasterDataLapangan"
ORDER BY id ASC;

-- name: GetMasterDataLapanganByID :one
SELECT * FROM "reportPKK"."MasterDataLapangan"
WHERE id = $1 LIMIT 1;

-- name: CreateMasterDataLapangan :one
INSERT INTO "reportPKK"."MasterDataLapangan" (
    nama_lapangan, harga_lapangan, harga_ballboy
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: UpdateMasterDataLapangan :one
UPDATE "reportPKK"."MasterDataLapangan"
SET 
    nama_lapangan = $2,
    harga_lapangan = $3,
    harga_ballboy = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteMasterDataLapangan :exec
DELETE FROM "reportPKK"."MasterDataLapangan"
WHERE id = $1;

-- ============================================================================
-- MasterDataReclub CRUD
-- ============================================================================

-- name: GetMasterDataReclub :many
SELECT * FROM "reportPKK"."MasterDataReclub"
ORDER BY id ASC;

-- name: GetMasterDataReclubByID :one
SELECT * FROM "reportPKK"."MasterDataReclub"
WHERE id = $1 LIMIT 1;

-- name: CreateMasterDataReclub :one
INSERT INTO "reportPKK"."MasterDataReclub" (
    jadwal_atau_hari, total_lama_jadwal, biaya_daftar
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: UpdateMasterDataReclub :one
UPDATE "reportPKK"."MasterDataReclub"
SET 
    jadwal_atau_hari = $2,
    total_lama_jadwal = $3,
    biaya_daftar = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteMasterDataReclub :exec
DELETE FROM "reportPKK"."MasterDataReclub"
WHERE id = $1;