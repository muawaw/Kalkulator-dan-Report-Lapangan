// config.jsx
import React, { useState, useEffect } from "react";
import {
  apiRequest,
  apiCreateLapangan,
  apiUpdateLapangan,
  apiDeleteLapangan,
  apiCreateReclub,
  apiUpdateReclub,
  apiDeleteReclub,
} from "../services/api";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Config() {
  const [activeTab, setActiveTab] = useState("lapangan");
  const [lapanganData, setLapanganData] = useState([]);
  const [reclubData, setReclubData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    nama_lapangan: "",
    harga_lapangan: 0,
    harga_ballboy: 0,
    jadwal_atau_hari: "",
    biaya_daftar: 0,
    biaya_per_jam: 0,
  });

  const LAPANGAN_ENDPOINT = "/config/lapangan";
  const RECLUB_ENDPOINT = "/config/reclub";

  useEffect(() => {
    setErrorMessage("");
  }, [isFormOpen, isDeleteOpen, activeTab]);

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

  const filteredData = (
    activeTab === "lapangan" ? lapanganData : reclubData
  ).filter((item) => {
    const search = searchTerm.toLowerCase();
    if (activeTab === "lapangan") {
      return item.nama_lapangan?.toLowerCase().includes(search);
    }
    return (item.nama_reclub || item.detail || item.name || "")
      .toLowerCase()
      .includes(search);
  });

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      nama_lapangan: "",
      harga_lapangan: 0,
      harga_ballboy: 0,
      jadwal_atau_hari: "",
      biaya_daftar: 0,
      biaya_per_jam: 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      nama_lapangan: item.nama_lapangan || "",
      harga_lapangan: item.harga_lapangan || 0,
      harga_ballboy: item.harga_ballboy || 0,
      jadwal_atau_hari: item.jadwal_atau_hari || "",
      biaya_daftar: item.biaya_daftar || 0,
      biaya_per_jam: item.biaya_per_jam || 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (activeTab === "lapangan") {
        const payload = {
          nama_lapangan: formData.nama_lapangan,
          harga_lapangan: parseInt(formData.harga_lapangan, 10) || 0,
          harga_ballboy: parseInt(formData.harga_ballboy, 10) || 0,
        };

        if (selectedItem?.id) {
          await apiUpdateLapangan({ id: selectedItem.id, ...payload });
        } else {
          await apiCreateLapangan(payload);
        }
      } else {
        const payload = {
          jadwal_atau_hari: formData.jadwal_atau_hari,
          biaya_daftar: parseInt(formData.biaya_daftar, 10) || 0,
          total_lama_jadwal: parseFloat(formData.total_lama_jadwal) || 0,
        };

        if (selectedItem?.id) {
          await apiUpdateReclub({ id: selectedItem.id, ...payload });
        } else {
          await apiCreateReclub(payload);
        }
      }

      setIsFormOpen(false);
      setSelectedItem(null);

      const [lapangan, reclub] = await Promise.all([
        apiRequest(LAPANGAN_ENDPOINT),
        apiRequest(RECLUB_ENDPOINT),
      ]);
      setLapanganData(lapangan || []);
      setReclubData(reclub || []);
    } catch (err) {
      console.error("Error saving item:", err);
      setErrorMessage("Gagal simpan data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      if (activeTab === "lapangan" && selectedItem?.id) {
        await apiDeleteLapangan(selectedItem.id);
      } else if (activeTab === "reclub" && selectedItem?.id) {
        await apiDeleteReclub(selectedItem.id);
      }

      setIsDeleteOpen(false);
      setSelectedItem(null);

      const [lapangan, reclub] = await Promise.all([
        apiRequest(LAPANGAN_ENDPOINT),
        apiRequest(RECLUB_ENDPOINT),
      ]);
      setLapanganData(lapangan || []);
      setReclubData(reclub || []);
    } catch (err) {
      console.error("Error deleting item:", err);
      setErrorMessage("Gagal hapus data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showSpinner, setShowSpinner] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!loading) {
      // 1. Wait 1 second minimum loading time, then start fadeout animation
      const startExitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 1200);

      // 2. Unmount the spinner after the fadeout animation finishes (~500ms)
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
      <div className="flex min-h-screen items-center justify-center p-4 text-lg font-semibold text-red-600">
        Error: {errorMessage}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-300 mb-6">
        <button
          style={{ animationDelay: "0.1s" }}
          className={`pb-2 px-4 transition-all duration-300 cursor-pointer animate__animated animate__fadeInUp ${
            activeTab === "lapangan"
              ? "border-b-2 border-emerald-600 font-bold text-pkk-green"
              : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("lapangan")}
        >
          Data Lapangan
        </button>
        <button
          style={{ animationDelay: "0.2s" }}
          className={`pb-2 px-4 transition-all duration-300 cursor-pointer animate__animated animate__fadeInUp ${
            activeTab === "reclub"
              ? "border-b-2 border-emerald-600 font-bold text-pkk-green"
              : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("reclub")}
        >
          Data Reclub
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-4 gap-4 w-full max-w-4xl">
        <input
          style={{ animationDelay: "0.3s" }}
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-slate-300 p-2 rounded-lg w-64 bg-white text-gray-800 transition-all duration-50 focus:outline-none focus:ring-2 focus:ring-pkk-green/50 shadow-xs animate__animated animate__fadeInUp"
        />
        <button
          style={{ animationDelay: "0.4s" }}
          onClick={handleOpenCreate}
          className="bg-pkk-green text-pkk-cream text-center p-2.5 px-5 text-lg font-semibold rounded-lg hover:bg-pkk-lime transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md animate__animated animate__fadeInUp"
        >
          Tambah {activeTab === "lapangan" ? "Lapangan" : "Reclub"}
        </button>
      </div>

      {/* DATA TABLE WRAPPER */}
      <div className="w-full max-w-4xl border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm max-h-[500px] overflow-y-auto">
        {loading ? (
          <p className="text-gray-500 my-6 text-center animate__animated animate__fadeIn">
            Memuat data...
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-1 bg-pkk-green text-pkk-cream border-pkk-lime border-b">
              <tr>
                {activeTab === "lapangan" ? (
                  <>
                    <th className="p-3">Nama Lapangan</th>
                    <th className="p-3">Harga Lapangan</th>
                    <th className="p-3">Harga Ballboy</th>
                  </>
                ) : (
                  <>
                    <th className="p-3">Jadwal / Hari</th>
                    <th className="p-3">Biaya Daftar</th>
                    <th className="p-3">Biaya Per Jam</th>
                    <th className="p-3">Total Lama Jadwal</th>
                  </>
                )}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "lapangan" ? 4 : 5}
                    className="p-4 text-center text-gray-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                    className="border-b border-slate-100 transition-colors duration-50 hover:bg-slate-50 animate__animated animate__fadeInUp"
                  >
                    {activeTab === "lapangan" ? (
                      <>
                        <td className="p-3 font-bold">{item.nama_lapangan}</td>
                        <td className="p-3 font-medium sm:text-sm">
                          Rp {item.harga_lapangan?.toLocaleString()}
                        </td>
                        <td className="p-3 font-medium sm:text-sm">
                          Rp {item.harga_ballboy?.toLocaleString()}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-bold">
                          {item.jadwal_atau_hari}
                        </td>
                        <td className="p-3 font-medium sm:text-sm">
                          Rp {item.biaya_daftar?.toLocaleString()}
                        </td>
                        <td className="p-3 font-medium sm:text-sm">
                          Rp {item.biaya_per_jam?.toLocaleString()}
                        </td>
                        <td className="p-3 font-medium">
                          {item.total_lama_jadwal?.toLocaleString()} Jam
                        </td>
                      </>
                    )}
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-4 py-1.5 border border-pkk-blue rounded-lg cursor-pointer transition-all duration-50 bg-pkk-blue text-pkk-cream hover:bg-white hover:text-pkk-blue active:scale-95 font-medium shadow-xs"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="px-4 py-1.5 border border-red-600 rounded-lg cursor-pointer transition-all duration-50 bg-red-600 text-pkk-cream hover:bg-white hover:text-red-700 active:scale-95 font-medium shadow-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-pkk-cream p-6 rounded-xl shadow-2xl w-96 border border-slate-200 animate__animated animate__fadeInUp animate__faster">
            <h3 className="text-lg font-bold mb-4 text-slate-800">
              {selectedItem ? `Ubah ${activeTab}` : `Tambah Data ${activeTab}`}
            </h3>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            {activeTab === "lapangan" ? (
              <>
                <input
                  type="text"
                  value={formData.nama_lapangan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_lapangan: e.target.value })
                  }
                  placeholder="Nama Lapangan"
                  className="border border-slate-300 p-2.5 w-full mb-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pkk-green/50 transition-all duration-50"
                />
                <input
                  type="number"
                  value={formData.harga_lapangan}
                  onChange={(e) =>
                    setFormData({ ...formData, harga_lapangan: e.target.value })
                  }
                  placeholder="Harga Lapangan"
                  className="border border-slate-300 p-2.5 w-full mb-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pkk-green/50 transition-all duration-50"
                />
                <input
                  type="number"
                  value={formData.harga_ballboy}
                  onChange={(e) =>
                    setFormData({ ...formData, harga_ballboy: e.target.value })
                  }
                  placeholder="Harga Ballboy"
                  className="border border-slate-300 p-2.5 w-full mb-4 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pkk-green/50 transition-all duration-50"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={formData.jadwal_atau_hari}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jadwal_atau_hari: e.target.value,
                    })
                  }
                  placeholder="Jadwal / Hari"
                  className="border border-slate-300 p-2.5 w-full mb-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pkk-green/50 transition-all duration-50"
                />
                <input
                  type="number"
                  value={formData.biaya_daftar}
                  onChange={(e) =>
                    setFormData({ ...formData, biaya_daftar: e.target.value })
                  }
                  placeholder="Biaya Daftar"
                  className="border border-slate-300 p-2.5 w-full mb-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pkk-green/50 transition-all duration-50"
                />
                <input
                  type="number"
                  value={formData.total_lama_jadwal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_lama_jadwal: e.target.value,
                    })
                  }
                  placeholder="Total Lama Jadwal"
                  className="border border-slate-300 p-2.5 w-full mb-4 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pkk-green/50 transition-all duration-50"
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setErrorMessage("");
                  setIsFormOpen(false);
                }}
                className="px-4 py-2 border border-pkk-blue rounded-lg cursor-pointer transition-all duration-50 bg-pkk-blue text-pkk-cream hover:bg-white hover:text-pkk-blue active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-pkk-green text-pkk-cream font-semibold rounded-lg cursor-pointer hover:bg-pkk-lime transition-all duration-50 active:scale-95 shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-pkk-cream p-6 rounded-xl shadow-2xl w-96 border border-slate-200 animate__animated animate__fadeInUp animate__faster">
            <h3 className="text-lg font-bold mb-2 text-slate-800">
              Konfirmasi Hapus
            </h3>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            <p className="mb-4 text-slate-600 text-sm">
              Apakah yakin ingin menghapus{" "}
              <b className="text-slate-800">
                {selectedItem?.nama_lapangan ||
                  selectedItem?.jadwal_atau_hari ||
                  selectedItem?.detail ||
                  selectedItem?.id}
              </b>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setErrorMessage("");
                  setIsDeleteOpen(false);
                }}
                className="px-4 py-2 border border-pkk-blue rounded-lg cursor-pointer transition-all duration-50 bg-pkk-blue text-pkk-cream hover:bg-white hover:text-pkk-blue active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-pkk-cream font-semibold rounded-lg cursor-pointer hover:bg-red-700 transition-all duration-50 active:scale-95 shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
