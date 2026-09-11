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