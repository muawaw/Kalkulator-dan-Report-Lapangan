# API Documentation - Kalkulator dan Report Lapangan

This document details all available HTTP API endpoints, authentication requirements, request/response formats, and `curl` examples to hit the API.

---

## 1. Overview & Server Configuration

- **Default Base URL:** `http://localhost:8000`
- **Port:** Configured in `backend/cmd/main.go` (default `:8000`)
- **Global Middlewares:**
  - `RequestID`: Generates a unique request ID.
  - `RealIP`: Extracts client IP.
  - `Logger`: Logs incoming requests and timings.
  - `Recoverer`: Recovers from panics with HTTP 500.
  - `Timeout`: 60-second request timeout limit.

---

## 2. Authentication

Endpoints under `/api/config/*` are protected by `core.SecurityMiddleware`.

- **Header Name:** `X-API-KEY`
- **Value:** Must match the `API_KEY` defined in the server's `.env` file (e.g., `TEST_API_KEY`).
- **Missing or Invalid Key Response:**
  ```http
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json

  {"error":"Unauthorized: Invalid API Key"}
  ```

> *Note:* If `API_KEY` is not set in `.env` (empty string), the middleware allows requests without key verification.

---

## 3. General Request & Response Rules

1. **Content-Type**:
   - For `POST` and `PUT` requests, send `Content-Type: application/json`.
   - Maximum body size is **1 MB**.
2. **Disallow Unknown Fields**:
   - The JSON parser rejects extra or unrecognized fields. Only send the fields documented in each schema.
3. **ID Obfuscation (sqids)**:
   - For `GET` endpoints (`/api/config/lapangan`, `/api/config/reclub`, and their `/detail` endpoints), the returned `id` is a masked string generated using Sqids (minimum length 8 characters, alphanumeric).
   - For query parameters (`?id=...`) and update bodies (`"id": ...`), endpoints currently expect the numeric integer ID (`int32`).

---

## 4. Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | No | Health check endpoint |
| `GET` | `/api/config/lapangan` | **Yes** | Fetch all master data lapangan |
| `GET` | `/api/config/lapangan/detail?id={id}` | **Yes** | Fetch detail of a single lapangan by ID |
| `POST` | `/api/config/lapangan` | **Yes** | Create a new master data lapangan |
| `PUT` | `/api/config/lapangan` | **Yes** | Update an existing master data lapangan |
| `DELETE` | `/api/config/lapangan?id={id}` | **Yes** | Delete master data lapangan by ID |
| `GET` | `/api/config/reclub` | **Yes** | Fetch all master data reclub |
| `GET` | `/api/config/reclub/detail?id={id}` | **Yes** | Fetch detail of a single reclub by ID |
| `POST` | `/api/config/reclub` | **Yes** | Create a new master data reclub |
| `PUT` | `/api/config/reclub` | **Yes** | Update an existing master data reclub |
| `DELETE` | `/api/config/reclub?id={id}` | **Yes** | Delete master data reclub by ID |
| `POST` | `/api/report-keuangan/` | **Yes** | Create a new financial report |
| `GET` | `/api/report-keuangan/` | **Yes** | Fetch all financial reports |
| `GET` | `/api/report-keuangan/{id}` | **Yes** | Fetch a specific financial report by ID |
| `PUT` | `/api/report-keuangan/{id}` | **Yes** | Update an existing financial report |
| `DELETE` | `/api/report-keuangan/{id}` | **Yes** | Delete a financial report by ID |

---

## 5. Endpoints Reference

### 5.1. System Endpoints

#### 5.1.1. Health Check
Checks if the API server is up and responsive.

- **Method:** `GET`
- **Path:** `/api/health`
- **Authentication:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body (Text):**
    ```
    Status: OK
    ```

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/health
```

---

### 5.2. Master Data Lapangan (`/api/config/lapangan`)

#### 5.2.1. Get All Lapangan
Retrieves a list of all court (lapangan) records.

- **Method:** `GET`
- **Path:** `/api/config/lapangan`
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    [
      {
        "id": "b9a5Wj7K",
        "nama_lapangan": "Lapangan A",
        "harga_lapangan": 150000,
        "harga_ballboy": 25000
      }
    ]
    ```

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/config/lapangan \
  -H "X-API-KEY: TEST_API_KEY"
```

---

#### 5.2.2. Get Lapangan by ID
Retrieves details of a specific court (lapangan) by its numeric ID.

- **Method:** `GET`
- **Path:** `/api/config/lapangan/detail`
- **Query Parameters:**
  - `id` (*required*, integer): The database ID of the court (e.g., `?id=1`).
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": "b9a5Wj7K",
      "nama_lapangan": "Lapangan A",
      "harga_lapangan": 150000,
      "harga_ballboy": 25000
    }
    ```
- **Error Responses:**
  - `400 Bad Request` if `id` is missing or not a valid number (`Invalid ID`).
  - `500 Internal Server Error` if database lookup fails.

**Example cURL:**
```bash
curl -X GET "http://localhost:8000/api/config/lapangan/detail?id=1" \
  -H "X-API-KEY: TEST_API_KEY"
```

---

#### 5.2.3. Create Lapangan
Creates a new court (lapangan) record.

- **Method:** `POST`
- **Path:** `/api/config/lapangan`
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-KEY: <your-api-key>`
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |---|---|:---:|---|
  | `nama_lapangan` | `string` | Yes | Name of the court |
  | `harga_lapangan` | `number` / `numeric` | Yes | Rental price of the court |
  | `harga_ballboy` | `number` / `numeric` | Yes | Ballboy service fee |

  ```json
  {
    "nama_lapangan": "Lapangan B",
    "harga_lapangan": 175000,
    "harga_ballboy": 30000
  }
  ```
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": 2,
      "nama_lapangan": "Lapangan B",
      "harga_lapangan": 175000,
      "harga_ballboy": 30000,
      "created_at": "2026-09-12T08:30:00Z",
      "updated_at": "2026-09-12T08:30:00Z"
    }
    ```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/config/lapangan \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: TEST_API_KEY" \
  -d '{
    "nama_lapangan": "Lapangan B",
    "harga_lapangan": 175000,
    "harga_ballboy": 30000
  }'
```

---

#### 5.2.4. Update Lapangan
Updates an existing court (lapangan) record.

- **Method:** `PUT`
- **Path:** `/api/config/lapangan`
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-KEY: <your-api-key>`
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |---|---|:---:|---|
  | `id` | `integer` | Yes | Numeric primary key of the record |
  | `nama_lapangan` | `string` | Yes | Updated name |
  | `harga_lapangan` | `number` / `numeric` | Yes | Updated rental price |
  | `harga_ballboy` | `number` / `numeric` | Yes | Updated ballboy fee |

  ```json
  {
    "id": 2,
    "nama_lapangan": "Lapangan B Indoor",
    "harga_lapangan": 190000,
    "harga_ballboy": 35000
  }
  ```
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": 2,
      "nama_lapangan": "Lapangan B Indoor",
      "harga_lapangan": 190000,
      "harga_ballboy": 35000,
      "created_at": "2026-09-12T08:30:00Z",
      "updated_at": "2026-09-12T08:45:00Z"
    }
    ```

**Example cURL:**
```bash
curl -X PUT http://localhost:8000/api/config/lapangan \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: TEST_API_KEY" \
  -d '{
    "id": 2,
    "nama_lapangan": "Lapangan B Indoor",
    "harga_lapangan": 190000,
    "harga_ballboy": 35000
  }'
```

---

#### 5.2.5. Delete Lapangan
Deletes a court (lapangan) record by numeric ID.

- **Method:** `DELETE`
- **Path:** `/api/config/lapangan`
- **Query Parameters:**
  - `id` (*required*, integer): The database ID of the court to delete (e.g., `?id=2`).
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `204 No Content` (empty body)

**Example cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/config/lapangan?id=2" \
  -H "X-API-KEY: TEST_API_KEY"
```

---

### 5.3. Master Data Reclub (`/api/config/reclub`)

#### 5.3.1. Get All Reclub
Retrieves all reclub schedule configurations.

- **Method:** `GET`
- **Path:** `/api/config/reclub`
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    [
      {
        "id": "m9a1Pn3L",
        "jadwal_atau_hari": "Senin 18:00 - 20:00",
        "biaya_daftar": 50000,
        "biaya_per_jam": 25000,
        "total_lama_jadwal": 2
      }
    ]
    ```

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/config/reclub \
  -H "X-API-KEY: TEST_API_KEY"
```

---

#### 5.3.2. Get Reclub by ID
Retrieves details of a single reclub entry by numeric ID.

- **Method:** `GET`
- **Path:** `/api/config/reclub/detail`
- **Query Parameters:**
  - `id` (*required*, integer): The database ID (e.g., `?id=1`).
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": "m9a1Pn3L",
      "jadwal_atau_hari": "Senin 18:00 - 20:00",
      "biaya_daftar": 50000,
      "biaya_per_jam": 25000,
      "total_lama_jadwal": 2
    }
    ```
- **Error Responses:**
  - `400 Bad Request` if `id` parameter is missing (`Missing id parameter`) or invalid (`Invalid ID`).
  - `404 Not Found` if record does not exist (`Reclub record not found`).

**Example cURL:**
```bash
curl -X GET "http://localhost:8000/api/config/reclub/detail?id=1" \
  -H "X-API-KEY: TEST_API_KEY"
```

---

#### 5.3.3. Create Reclub
Creates a new reclub entry. Note that `biaya_per_jam` is automatically computed by the database generated column as `biaya_daftar / total_lama_jadwal`.

- **Method:** `POST`
- **Path:** `/api/config/reclub`
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-KEY: <your-api-key>`
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |---|---|:---:|---|
  | `jadwal_atau_hari` | `string` | Yes | Day or schedule description (e.g., "Rabu 19:00 - 22:00") |
  | `total_lama_jadwal` | `number` / `numeric` | Yes | Duration in hours (e.g., `3.0`) |
  | `biaya_daftar` | `number` / `numeric` | Yes | Total registration fee |

  ```json
  {
    "jadwal_atau_hari": "Rabu 19:00 - 22:00",
    "total_lama_jadwal": 3.0,
    "biaya_daftar": 75000
  }
  ```
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": 1,
      "jadwal_atau_hari": "Rabu 19:00 - 22:00",
      "total_lama_jadwal": 3,
      "biaya_daftar": 75000,
      "biaya_per_jam": 25000,
      "created_at": "2026-09-12T08:30:00Z",
      "updated_at": "2026-09-12T08:30:00Z"
    }
    ```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/config/reclub \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: TEST_API_KEY" \
  -d '{
    "jadwal_atau_hari": "Rabu 19:00 - 22:00",
    "total_lama_jadwal": 3.0,
    "biaya_daftar": 75000
  }'
```

---

#### 5.3.4. Update Reclub
Updates an existing reclub entry.

- **Method:** `PUT`
- **Path:** `/api/config/reclub`
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-KEY: <your-api-key>`
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |---|---|:---:|---|
  | `id` | `integer` | Yes | Numeric primary key of the record |
  | `jadwal_atau_hari` | `string` | Yes | Updated day or schedule |
  | `total_lama_jadwal` | `number` / `numeric` | Yes | Updated duration in hours |
  | `biaya_daftar` | `number` / `numeric` | Yes | Updated registration fee |

  ```json
  {
    "id": 1,
    "jadwal_atau_hari": "Rabu 19:00 - 21:00",
    "total_lama_jadwal": 2.0,
    "biaya_daftar": 60000
  }
  ```
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": 1,
      "jadwal_atau_hari": "Rabu 19:00 - 21:00",
      "total_lama_jadwal": 2,
      "biaya_daftar": 60000,
      "biaya_per_jam": 30000,
      "created_at": "2026-09-12T08:30:00Z",
      "updated_at": "2026-09-12T08:50:00Z"
    }
    ```

**Example cURL:**
```bash
curl -X PUT http://localhost:8000/api/config/reclub \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: TEST_API_KEY" \
  -d '{
    "id": 1,
    "jadwal_atau_hari": "Rabu 19:00 - 21:00",
    "total_lama_jadwal": 2.0,
    "biaya_daftar": 60000
  }'
```

---

#### 5.3.5. Delete Reclub
Deletes a reclub record by its numeric ID.

- **Method:** `DELETE`
- **Path:** `/api/config/reclub`
- **Query Parameters:**
  - `id` (*required*, integer): The database ID of the record to delete (e.g., `?id=1`).
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `204 No Content` (empty body)

**Example cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/config/reclub?id=1" \
  -H "X-API-KEY: TEST_API_KEY"
```

---

### 5.4. Financial Report (`/api/report-keuangan`)

#### 5.4.1. Create Financial Report
Creates a new financial report entry with income and expense data.

- **Method:** `POST`
- **Path:** `/api/report-keuangan/`
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-KEY: <your-api-key>`
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |---|---|:---:|---|
  | `tanggal` | `string` | Yes | Date of the report (e.g., "2026-09-16") |
  | `kas_in` | `number` | Yes | Cash inflow amount |
  | `kas_out` | `number` | Yes | Cash outflow amount |
  | `description` | `string` | Yes | Description of the transaction |

  ```json
  {
    "tanggal": "2026-09-16",
    "kas_in": 500000,
    "kas_out": 150000,
    "description": "Daily revenue from court rental"
  }
  ```
- **Response:**
  - **Status:** `201 Created`
  - **Body (JSON):**
    ```json
    {
      "id": "a7b2Nk5M",
      "tanggal": "2026-09-16",
      "kas_in": 500000,
      "kas_out": 150000,
      "description": "Daily revenue from court rental",
      "created_at": "2026-09-16T10:30:00Z",
      "updated_at": "2026-09-16T10:30:00Z"
    }
    ```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/report-keuangan/ \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: TEST_API_KEY" \
  -d '{
    "tanggal": "2026-09-16",
    "kas_in": 500000,
    "kas_out": 150000,
    "description": "Daily revenue from court rental"
  }'
```

---

#### 5.4.2. Get All Financial Reports
Retrieves a list of all financial reports.

- **Method:** `GET`
- **Path:** `/api/report-keuangan/`
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    [
      {
        "id": "a7b2Nk5M",
        "tanggal": "2026-09-16",
        "kas_in": 500000,
        "kas_out": 150000,
        "description": "Daily revenue from court rental",
        "created_at": "2026-09-16T10:30:00Z",
        "updated_at": "2026-09-16T10:30:00Z"
      }
    ]
    ```

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/report-keuangan/ \
  -H "X-API-KEY: TEST_API_KEY"
```

---

#### 5.4.3. Get Financial Report by ID
Retrieves details of a specific financial report by its ID.

- **Method:** `GET`
- **Path:** `/api/report-keuangan/{id}`
- **Path Parameters:**
  - `id` (*required*, string): The masked ID of the report (e.g., `a7b2Nk5M`).
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": "a7b2Nk5M",
      "tanggal": "2026-09-16",
      "kas_in": 500000,
      "kas_out": 150000,
      "description": "Daily revenue from court rental",
      "created_at": "2026-09-16T10:30:00Z",
      "updated_at": "2026-09-16T10:30:00Z"
    }
    ```
- **Error Responses:**
  - `400 Bad Request` if `id` is missing or invalid (`ID parameter is required` or `Invalid ID format`).
  - `404 Not Found` if record does not exist (`Record not found`).

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/report-keuangan/a7b2Nk5M \
  -H "X-API-KEY: TEST_API_KEY"
```

---

#### 5.4.4. Update Financial Report
Updates an existing financial report record.

- **Method:** `PUT`
- **Path:** `/api/report-keuangan/{id}`
- **Path Parameters:**
  - `id` (*required*, string): The masked ID of the report to update.
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-KEY: <your-api-key>`
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |---|---|:---:|---|
  | `tanggal` | `string` | Yes | Updated date of the report |
  | `kas_in` | `number` | Yes | Updated cash inflow amount |
  | `kas_out` | `number` | Yes | Updated cash outflow amount |
  | `description` | `string` | Yes | Updated description |

  ```json
  {
    "tanggal": "2026-09-16",
    "kas_in": 550000,
    "kas_out": 200000,
    "description": "Corrected daily revenue"
  }
  ```
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "id": "a7b2Nk5M",
      "tanggal": "2026-09-16",
      "kas_in": 550000,
      "kas_out": 200000,
      "description": "Corrected daily revenue",
      "created_at": "2026-09-16T10:30:00Z",
      "updated_at": "2026-09-16T11:00:00Z"
    }
    ```

**Example cURL:**
```bash
curl -X PUT http://localhost:8000/api/report-keuangan/a7b2Nk5M \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: TEST_API_KEY" \
  -d '{
    "tanggal": "2026-09-16",
    "kas_in": 550000,
    "kas_out": 200000,
    "description": "Corrected daily revenue"
  }'
```

---

#### 5.4.5. Delete Financial Report
Deletes a financial report record by its ID.

- **Method:** `DELETE`
- **Path:** `/api/report-keuangan/{id}`
- **Path Parameters:**
  - `id` (*required*, string): The masked ID of the report to delete.
- **Headers:**
  - `X-API-KEY: <your-api-key>`
- **Response:**
  - **Status:** `204 No Content` (empty body)

**Example cURL:**
```bash
curl -X DELETE http://localhost:8000/api/report-keuangan/a7b2Nk5M \
  -H "X-API-KEY: TEST_API_KEY"
```

---

## 6. Common Status Codes

| Code | Status | Meaning |
|---|---|---|
| `200` | `OK` | Request succeeded with response body |
| `204` | `No Content` | Request succeeded with no response body (used for `DELETE`) |
| `400` | `Bad Request` | Invalid query parameter (e.g. invalid `id`), invalid JSON payload, or unknown JSON fields |
| `401` | `Unauthorized` | Missing or invalid `X-API-KEY` header |
| `404` | `Not Found` | The requested resource does not exist |
| `500` | `Internal Server Error` | Database or unhandled server error |
