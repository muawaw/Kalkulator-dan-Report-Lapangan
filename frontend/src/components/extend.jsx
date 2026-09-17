import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { apiRequest } from "../services/api";

const LAPANGAN_ENDPOINT = "/config/lapangan";
const RECLUB_ENDPOINT = "/config/reclub";

export default function Extend() {
  const navigate = useNavigate();

  // API Data State
  const [lapanganData, setLapanganData] = useState([]);
  const [reclubData, setReclubData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Custom Mode Toggles
  const [isCustomLapangan, setIsCustomLapangan] = useState(false);
  const [isCustomReclub, setIsCustomReclub] = useState(false);

  // Form Inputs - Lapangan
  const [selectedLapanganId, setSelectedLapanganId] = useState("");
  const [customHargaLapangan, setCustomHargaLapangan] = useState("");
  const [customHargaBallboy, setCustomHargaBallboy] = useState("");

  // Form Inputs - Reclub / Session
  const [selectedReclubId, setSelectedReclubId] = useState("");
  const [customTotalJam, setCustomTotalJam] = useState("");
  const [customBiayaDaftar, setCustomBiayaDaftar] = useState("");

  // Form Inputs - Players & Tips
  const [playerInternal, setPlayerInternal] = useState("");
  const [playerExternal, setPlayerExternal] = useState("");
  const [tips, setTips] = useState("");

  // Computed Values
  const [patunganPerInternal, setPatunganPerInternal] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalExtRevenue, setTotalExtRevenue] = useState(0);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setErrorMessage("");
      try {
        const [lapangan, reclub] = await Promise.all([
          apiRequest(LAPANGAN_ENDPOINT),
          apiRequest(RECLUB_ENDPOINT),
        ]);
        setLapanganData(lapangan || []);
        setReclubData(reclub || []);
      } catch (err) {
        console.error("Error fetching config:", err);
        setErrorMessage("Gagal memuat data konfigurasi: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Timer & FadeOut Effect for Loading State
  useEffect(() => {
    if (!loading) {
      const startExitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 1200);

      const unmountTimer = setTimeout(() => {
        setShowSpinner(false);
      }, 1600);

      return () => {
        clearTimeout(startExitTimer);
        clearTimeout(unmountTimer);
      };
    } else {
      setShowSpinner(true);
      setIsExiting(false);
    }
  }, [loading]);

  useEffect(() => {
    // Determine Lapangan Prices
    let hargaLap = 0;
    let hargaBallboy = 0;

    if (isCustomLapangan) {
      hargaLap = parseFloat(customHargaLapangan) || 0;
      hargaBallboy = parseFloat(customHargaBallboy) || 0;
    } else if (selectedLapanganId) {
      const selected = lapanganData.find(
        (item) =>
          String(item.id || item._id || item.ID) === String(selectedLapanganId),
      );
      hargaLap =
        parseFloat(
          selected?.HargaLapangan ||
            selected?.harga_lapangan ||
            selected?.hargaLapangan,
        ) || 0;
      hargaBallboy =
        parseFloat(
          selected?.HargaBallboy ||
            selected?.harga_ballboy ||
            selected?.hargaBallboy,
        ) || 0;
    }

    // Determine Reclub Session Variables
    let totalJam = 0;
    let biayaDaftar = 0;

    if (isCustomReclub) {
      totalJam = parseFloat(customTotalJam) || 0;
      biayaDaftar = parseFloat(customBiayaDaftar) || 0;
    } else if (selectedReclubId) {
      const selected = reclubData.find(
        (item) =>
          String(item.id || item._id || item.ID) === String(selectedReclubId),
      );
      totalJam =
        parseFloat(
          selected?.TotalLamaJadwal ||
            selected?.total_lama_jadwal ||
            selected?.totalLamaJadwal,
        ) || 0;
      biayaDaftar =
        parseFloat(
          selected?.BiayaDaftar ||
            selected?.biaya_daftar ||
            selected?.biayaDaftar,
        ) || 0;
    }

    const numInternal = parseInt(playerInternal, 10) || 0;
    const numExternal = parseInt(playerExternal, 10) || 0;
    const tipAmount = parseFloat(tips) || 0;
    const costPerRegister = parseFloat(biayaDaftar) || 0;

    // Calculations
    const calculatedExpenses = (hargaLap + hargaBallboy) * totalJam + tipAmount;
    const totalPlayers = numInternal + numExternal;

    let calculatedExtRevenue = 0;
    let calculatedPatungan = 0;

    if (costPerRegister <= 0) {
      // If no registration fee, share expenses evenly across all players
      calculatedExtRevenue = 0;
      calculatedPatungan =
        totalPlayers > 0 ? calculatedExpenses / totalPlayers : 0;
    } else {
      // Standard calculation with external revenue offset
      calculatedExtRevenue = numExternal * costPerRegister;
      const baseBalance = calculatedExpenses - calculatedExtRevenue;

      if (numInternal > 0) {
        calculatedPatungan = baseBalance > 0 ? baseBalance / numInternal : 0;
      } else {
        calculatedPatungan = 0;
      }
    }

    setTotalExpenses(calculatedExpenses);
    setTotalExtRevenue(calculatedExtRevenue);
    setPatunganPerInternal(calculatedPatungan);
  }, [
    isCustomLapangan,
    selectedLapanganId,
    customHargaLapangan,
    customHargaBallboy,
    isCustomReclub,
    selectedReclubId,
    customTotalJam,
    customBiayaDaftar,
    playerInternal,
    playerExternal,
    tips,
    lapanganData,
    reclubData,
  ]);

  const handleReset = () => {
    setIsCustomLapangan(false);
    setIsCustomReclub(false);
    setSelectedLapanganId("");
    setCustomHargaLapangan("");
    setCustomHargaBallboy("");
    setSelectedReclubId("");
    setCustomTotalJam("");
    setCustomBiayaDaftar("");
    setPlayerInternal("");
    setPlayerExternal("");
    setTips("");
  };

  if (showSpinner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className={`w-24 h-24 flex items-center justify-center animate__animated ${
            isExiting ? "animate__fadeOut" : "animate__fadeIn"
          }`}
          style={{ animationDuration: "200ms" }}
        >
          <DotLottieReact src="/loading.json" loop autoplay />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-lg font-semibold text-red-600 mb-4">
          {errorMessage}
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pkk-green text-pkk-cream font-semibold rounded-lg hover:bg-pkk-lime transition-all text-sm shadow cursor-pointer"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-4">
      {/* Back Button */}
      <div className="w-full max-w-xl mb-4 flex justify-start">
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ animationDelay: "0.1s" }}
          className="px-4 py-2 bg-pkk-green text-pkk-cream font-semibold rounded-lg hover:bg-pkk-lime hover:scale-102 transition-all text-sm shadow cursor-pointer animate__animated animate__fadeInUp"
        >
          ← Kembali
        </button>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-white border rounded-xl shadow-md p-6 relative">
        {/* HEADER */}
        <div
          style={{ animationDelay: "0.2s" }}
          className="bg-pkk-green p-6 -m-6 mb-6 rounded-t-xl border-b border-pkk-lime flex items-center justify-between animate__animated animate__fadeInUp"
        >
          <div>
            <h2 className="text-2xl font-bold text-pkk-cream">
              Perhitungan Pembagian Lapangan
            </h2>
            <p className="text-sm text-pkk-cream/80 mt-1">
              Hitung pembagian patungan/shared payment per sesi tanpa simpan
              laporan.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* SECTION LAPANGAN */}
          <div
            style={{ animationDelay: "0.3s" }}
            className="p-4 border rounded-xl bg-gray-50/50 space-y-3 animate__animated animate__fadeInUp"
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">
                Pilihan Lapangan
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-pkk-green font-semibold">
                <input
                  type="checkbox"
                  checked={isCustomLapangan}
                  onChange={(e) => {
                    setIsCustomLapangan(e.target.checked);
                    setSelectedLapanganId("");
                  }}
                  className="w-4 h-4 accent-pkk-green rounded cursor-pointer"
                />
                Custom Lapangan
              </label>
            </div>

            {!isCustomLapangan ? (
              <select
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
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Harga Lapangan (/Jam)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customHargaLapangan}
                      onChange={(e) => setCustomHargaLapangan(e.target.value)}
                      className="w-full border p-2 text-sm pl-8 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Harga Ballboy (/Jam)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 (jika tidak ada)"
                      value={customHargaBallboy}
                      onChange={(e) => setCustomHargaBallboy(e.target.value)}
                      className="w-full border p-2 text-sm pl-8 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION SESI RECLUB */}
          <div
            style={{ animationDelay: "0.4s" }}
            className="p-4 border rounded-xl bg-gray-50/50 space-y-3 animate__animated animate__fadeInUp"
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">
                Pilihan Sesi / Reclub
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-pkk-green font-semibold">
                <input
                  type="checkbox"
                  checked={isCustomReclub}
                  onChange={(e) => {
                    setIsCustomReclub(e.target.checked);
                    setSelectedReclubId("");
                  }}
                  className="w-4 h-4 accent-pkk-green rounded cursor-pointer"
                />
                Custom Sesi
              </label>
            </div>

            {!isCustomReclub ? (
              <select
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
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Total Durasi (Jam)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Contoh: 2"
                    value={customTotalJam}
                    onChange={(e) => setCustomTotalJam(e.target.value)}
                    className="w-full border p-2 text-sm rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Biaya Daftar / Player Ext
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customBiayaDaftar}
                      onChange={(e) => setCustomBiayaDaftar(e.target.value)}
                      className="w-full border p-2 text-sm pl-8 rounded-lg bg-white focus:ring-2 focus:ring-pkk-green outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PLAYERS GRID */}
          <div
            style={{ animationDelay: "0.5s" }}
            className="grid grid-cols-2 gap-4 animate__animated animate__fadeInUp"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pemain Internal
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
                Pemain External
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

          {/* TIPS FIELD */}
          <div
            style={{ animationDelay: "0.6s" }}
            className="animate__animated animate__fadeInUp"
          >
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

          {/* CALCULATOR DISPLAY SUMMARY */}
          <div
            style={{ animationDelay: "0.7s" }}
            className="p-4 bg-pkk-green border border-pkk-lime rounded-lg space-y-3 animate__animated animate__fadeInUp"
          >
            <div className="flex justify-between items-center text-xs text-pkk-cream/90 border-b border-pkk-lime/40 pb-2">
              <span>Total Biaya (Sewa + Ballboy + Tips):</span>
              <span className="font-semibold">
                Rp {Math.ceil(totalExpenses).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-pkk-cream/90 border-b border-pkk-lime/40 pb-2">
              <span>Pemasukan External:</span>
              <span className="font-semibold">
                Rp {Math.ceil(totalExtRevenue).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-pkk-cream">
                Patungan / Member Internal:
              </span>
              <span className="text-2xl font-extrabold text-pkk-yellow">
                Rp {Math.ceil(patunganPerInternal).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* RESET BUTTON */}
          <div
            style={{ animationDelay: "0.8s" }}
            className="flex justify-end pt-2 animate__animated animate__fadeInUp"
          >
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 border rounded-lg bg-pkk-blue text-pkk-cream hover:bg-pkk-cream hover:text-pkk-blue hover:border-pkk-blue transition-all duration-300 font-medium cursor-pointer"
            >
              Reset Kalkulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
