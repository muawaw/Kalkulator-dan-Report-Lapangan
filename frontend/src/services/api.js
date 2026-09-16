const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const LAPANGAN_ENDPOINT = '/config/lapangan';
const RECLUB_ENDPOINT = '/config/reclub';
const REPORT_KEUANGAN_ENDPOINT = '/report-keuangan';

export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiCreateLapangan(payload) {
  return apiRequest(LAPANGAN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateLapangan(payload) {
  console.log('Updating Lapangan with ID:', payload);
  return apiRequest(LAPANGAN_ENDPOINT, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteLapangan(id) {
  if (!id) {
    throw new Error("ID is required to delete item");
  }

  return apiRequest(`${LAPANGAN_ENDPOINT}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function apiCreateReclub(payload) {
  return apiRequest(RECLUB_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateReclub(payload) {
  console.log('Updating Reclub with ID:', payload);
  return apiRequest(RECLUB_ENDPOINT, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteReclub(id) {
  if (!id) {
    throw new Error("ID is required to delete item");
  }

  return apiRequest(`${RECLUB_ENDPOINT}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ============================================================================
// Report Keuangan API
// ============================================================================
export async function apiGetReportKeuangan() {
  return apiRequest(REPORT_KEUANGAN_ENDPOINT, {
    method: "GET",
  });
}

export async function apiGetReportKeuanganByID(id) {
  if (!id) throw new Error("ID is required");
  return apiRequest(`${REPORT_KEUANGAN_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function apiCreateReportKeuangan(payload) {
  return apiRequest(REPORT_KEUANGAN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateReportKeuangan(id, payload) {
  if (!id) throw new Error("ID is required");
  return apiRequest(`${REPORT_KEUANGAN_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteReportKeuangan(id) {
  if (!id) throw new Error("ID is required");
  return apiRequest(`${REPORT_KEUANGAN_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}