import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api"; // Adjust import path if needed

const LAPANGAN_ENDPOINT = "/config/lapangan";
const RECLUB_ENDPOINT = "/config/reclub";
// const REPORT_ENDPOINT = "/report-keuangan";

const ALLOWED_USERS = import.meta.env.VITE_ALLOWED_USERS
  ? import.meta.env.VITE_ALLOWED_USERS.split(",")
  : [];

export default function Calculator() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // API Data State
  const [lapanganData, setLapanganData] = useState([]);
  const [reclubData, setReclubData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Inputs
  const [tanggal, setTanggal] = useState(today);
  const [selectedLapanganId, setSelectedLapanganId] = useState("");
  const [selectedReclubId, setSelectedReclubId] = useState("");
  const [playerInternal, setPlayerInternal] = useState("");
  const [playerExternal, setPlayerExternal] = useState("");
  const [patunganPerInternal, setPatunganPerInternal] = useState(0);
  const [tips, setTips] = useState("");

  // Computed Values
  const [kasIn, setKasIn] = useState(0);

  // Kas Out & Description
  const [hasKasOut, setHasKasOut] = useState(false);
  const [kasOut, setKasOut] = useState("");
  const [description, setDescription] = useState("");

  // Authorization Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [picName, setPicName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsModalOpen(true);
  };

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const [lapangan, reclub] = await Promise.all([
          apiRequest(LAPANGAN_ENDPOINT),
          apiRequest(RECLUB_ENDPOINT),
        ]);
        setLapanganData(lapangan || []);
        setReclubData(reclub || []);
      } catch (err) {
        console.error("Error fetching config:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  useEffect(() => {
    // If dropdowns aren't selected yet, keep calculations at 0
    if (!selectedLapanganId || !selectedReclubId) {
      setPatunganPerInternal(0);
      setKasIn(0);
      return;
    }

    const selectedLapangan = lapanganData.find(
      (item) =>
        String(item.id || item._id || item.ID) === String(selectedLapanganId),
    );
    const selectedReclub = reclubData.find(
      (item) =>
        String(item.id || item._id || item.ID) === String(selectedReclubId),
    );

    const numInternal = parseInt(playerInternal, 10) || 0;
    const numExternal = parseInt(playerExternal, 10) || 0;
    const tipAmount = parseFloat(tips) || 0;

    const hargaLap =
      parseFloat(
        selectedLapangan?.HargaLapangan ||
          selectedLapangan?.harga_lapangan ||
          selectedLapangan?.hargaLapangan,
      ) || 0;
    const hargaBallboy =
      parseFloat(
        selectedLapangan?.HargaBallboy ||
          selectedLapangan?.harga_ballboy ||
          selectedLapangan?.hargaBallboy,
      ) || 0;
    const totalJam =
      parseFloat(
        selectedReclub?.TotalLamaJadwal ||
          selectedReclub?.total_lama_jadwal ||
          selectedReclub?.totalLamaJadwal,
      ) || 0;
    const biayaDaftar =
      parseFloat(
        selectedReclub?.BiayaDaftar ||
          selectedReclub?.biaya_daftar ||
          selectedReclub?.biayaDaftar,
      ) || 0;

    // 1. Total expenses
    const totalExpenses = (hargaLap + hargaBallboy) * totalJam + tipAmount;

    // 2. Revenue from external players
    const extRevenue = numExternal * biayaDaftar;

    // 3. Base balance before internal contribution
    const baseBalance = extRevenue - totalExpenses;

    let calculatedKasIn = 0;
    let calculatedPatungan = 0;

    if (numInternal === 0) {
      calculatedPatungan = 0;
      calculatedKasIn = baseBalance;
    } else if (baseBalance >= 0) {
      // Case A: Profit / Break-even (with internal players present)
      calculatedPatungan = 20000;
      calculatedKasIn = baseBalance + numInternal * calculatedPatungan;
    } else {
      // Case B: Deficit (with internal players present)
      const absoluteDeficit = Math.abs(baseBalance);
      calculatedPatungan = absoluteDeficit / numInternal + 10000;
      calculatedKasIn = numInternal * calculatedPatungan;
    }

    setPatunganPerInternal(calculatedPatungan);
    setKasIn(calculatedKasIn);
  }, [
    selectedLapanganId,
    selectedReclubId,
    playerInternal,
    playerExternal,
    tips,
    lapanganData,
    reclubData,
  ]);

  const handleFinalSave = async () => {
    const formattedPicName = picName.trim().toUpperCase();

    if (!formattedPicName) {
      setErrorMessage("Nama PIC wajib diisi.");
      return;
    }
    console.log("Formatted PIC Name:", formattedPicName);

    const formattedAllowedUsers = ALLOWED_USERS.map((user) =>
      user.toUpperCase(),
    );

    if (!formattedAllowedUsers.includes(formattedPicName)) {
      setErrorMessage("Nama PIC tidak diizinkan.");
      return;
    }

    const payload = {
      tanggal: tanggal || today,
      kas_in: parseFloat(kasIn) || 0,
      kas_out: hasKasOut ? parseFloat(kasOut) || 0 : 0,
      description,
    };

    console.log("Final Payload for ReportKeuangan:", payload, picName);

    // TODO: Add API POST request here
    setIsModalOpen(false);
    setPicName("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-4">
      {/* Container Card */}
      {/* Back Button */}
      <div className="w-full max-w-xl mb-4 flex justify-start">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pkk-green text-pkk-cream font-semibold rounded-lg hover:bg-pkk-lime hover:scale-102 transition-all text-sm shadow cursor-pointer"
        >
          ← Kembali
        </button>
      </div>
      <div className="w-full max-w-xl bg-white border rounded-xl shadow-md p-6 relative">
        {/* HEADER */}
        <div className="bg-pkk-green p-6 -m-6 mb-6 rounded-t-xl border-b border-pkk-lime flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-pkk-cream">
              Input Report Keuangan
            </h2>
            <p className="text-sm text-pkk-cream/80 mt-1">
              Catat pemasukan dan pengeluaran kas harian.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium">
            Memuat data konfigurasi...
          </div>
        ) : (
          <form onSubmit={handlePreSubmit} className="space-y-5">
            {/* Tanggal Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
              />
            </div>

            {/* Lapangan Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pilih Lapangan <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedLapanganId}
                onChange={(e) => setSelectedLapanganId(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
              >
                <option value="">Pilih Lapangan</option>
                {lapanganData.map((item) => (
                  <option
                    key={item.id || item._id || item.ID}
                    value={item.id || item._id || item.ID}
                  >
                    {item.NamaLapangan ||
                      item.nama_lapangan ||
                      item.namaLapangan ||
                      item.nama ||
                      item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reclub Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pilih Sesi Reclub <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedReclubId}
                onChange={(e) => setSelectedReclubId(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
              >
                <option value="">Pilih Sesi Reclub</option>
                {reclubData.map((item) => (
                  <option
                    key={item.id || item._id || item.ID}
                    value={item.id || item._id || item.ID}
                  >
                    {item.JadwalAtauHari ||
                      item.jadwal_atau_hari ||
                      item.jadwalAtauHari ||
                      item.nama ||
                      item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pemain Internal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={playerInternal}
                  onChange={(e) => setPlayerInternal(e.target.value)}
                  className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pemain External <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={playerExternal}
                  onChange={(e) => setPlayerExternal(e.target.value)}
                  className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                />
              </div>
            </div>

            {/* Tips Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tips (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  className="w-full border p-2.5 pl-10 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                />
              </div>
            </div>

            {/* Calculator Output */}
            <div>
              <div className="p-4 bg-pkk-green border border-pkk-lime rounded-lg space-y-3">
                {/* Patungan Per Internal Player */}
                <div className="flex justify-between items-center border-b border-pkk-lime pb-2">
                  <span className="text-sm font-semibold text-pkk-cream">
                    Patungan / Member Internal:
                  </span>
                  <span className="text-lg font-bold text-pkk-cream">
                    Rp {Math.ceil(patunganPerInternal).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Final Calculated Kas In */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-pkk-cream uppercase tracking-wider">
                    Total Kas In:
                  </span>
                  <span className="text-2xl font-extrabold text-pkk-yellow">
                    Rp {Math.ceil(kasIn).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Kas Out Checkbox Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasKasOut}
                  onChange={(e) => {
                    setHasKasOut(e.target.checked);
                    if (!e.target.checked) setKasOut(""); // Clear value if unchecked
                  }}
                  className="w-4 h-4 accent-pkk-green rounded cursor-pointer transition-all"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Ada Pengeluaran?
                </span>
              </label>
            </div>

            {/* Conditional Kas Out Field */}
            {hasKasOut && (
              <div className="pt-2 px-2 pb-2 mt-2 bg-pkk-green border border-pkk-lime rounded-lg transition-all">
                <label className="block pb-1 text-sm font-semibold text-pkk-cream mb-1">
                  Pengeluaran (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    required={hasKasOut}
                    placeholder="0"
                    value={kasOut}
                    onChange={(e) => setKasOut(e.target.value)}
                    className="w-full border border-pkk-lime p-2.5 pl-10 rounded-lg bg-white text-gray-500 focus:ring-2 focus:ring-pkk-lime outline-none"
                  />
                </div>
              </div>
            )}

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                rows="3"
                placeholder="Contoh: Pemasukan reclub Sabtu 19.00 - 23.00 & Pengeluaran untuk pembelian bola"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setTanggal(today);
                  setSelectedLapanganId("");
                  setSelectedReclubId("");
                  setPlayerInternal(0);
                  setPlayerExternal(0);
                  setTips("");
                  // setKasIn(0);
                  setPatunganPerInternal(0);
                  setHasKasOut(false);
                  setKasOut("");
                  setDescription("");
                }}
                className="px-5 py-2.5 border rounded-lg bg-pkk-blue text-pkk-cream hover:bg-pkk-cream hover:text-pkk-blue hover:border-pkk-blue hover:scale-102 duration-300 transition-all font-medium"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-pkk-green text-pkk-cream font-semibold rounded-lg hover:bg-pkk-lime hover:scale-102 transition-all duration-300 shadow-md cursor-pointer"
              >
                Simpan Laporan
              </button>
            </div>
          </form>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-pkk-cream p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Konfirmasi Simpan Laporan
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Masukkan nama penanggung jawab (PIC) untuk menyimpan transaksi
              ini.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                {errorMessage}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama PIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Masukkan nama Anda..."
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg bg-pkk-blue text-pkk-cream hover:bg-pkk-cream hover:text-pkk-blue hover:border-pkk-blue hover:scale-102 transition-all font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFinalSave}
                className="px-5 py-2 bg-pkk-green text-pkk-cream font-semibold rounded-lg hover:bg-pkk-lime hover:scale-102 transition-all duration-300 shadow-md cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
