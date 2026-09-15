import React, { useState, useEffect } from "react";
import { apiRequest, apiCreateLapangan, apiUpdateLapangan, apiDeleteLapangan, apiCreateReclub, apiUpdateReclub, apiDeleteReclub } from "../services/api";

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
    const [selectedItem, setSelectedItem] = useState(null); // null = Create Mode, object = Edit Mode
    const [formData, setFormData] = useState({
      nama_lapangan: "",
      harga_lapangan: 0,
      harga_ballboy: 0,
      jadwal_atau_hari: "",
      biaya_daftar: 0,
      biaya_per_jam: 0,
    });

    // Constant endpoint for configs
    const LAPANGAN_ENDPOINT = '/config/lapangan';
    const RECLUB_ENDPOINT = '/config/reclub';

    useEffect(() => {
      setErrorMessage("");
    }, [isFormOpen, isDeleteOpen, activeTab]);

    useEffect(() => {
      async function fetchAllData() {
        setLoading(true);
        try {
          const [lapangan, reclub] = await Promise.all([
            apiRequest(LAPANGAN_ENDPOINT),
            apiRequest(RECLUB_ENDPOINT)
          ]);
          setLapanganData(lapangan || []);
          setReclubData(reclub || []);
        } catch (err) {
          console.error('Error fetching config:', err);
        } finally {
          setLoading(false);
        }
      }

      fetchAllData();
    }, []);

    const filteredData = (activeTab === 'lapangan' ? lapanganData : reclubData).filter((item) => {
        const search = searchTerm.toLowerCase();
        if (activeTab === 'lapangan') {
          return item.nama_lapangan?.toLowerCase().includes(search);
        }
        return (item.nama_reclub || item.detail || item.name || '').toLowerCase().includes(search);
      });

    // Modal Action State Handlers
    const handleOpenCreate = () => {
        setSelectedItem(null); // Clear form for new item
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
        setSelectedItem(item); // Load item details into form
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
        setSelectedItem(item); // Store item target for deletion
        setIsDeleteOpen(true);
    };

    // Handlers API
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
          await apiUpdateLapangan({ 
            id: selectedItem.id, 
            ...payload 
          });
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
            await apiUpdateReclub({ 
              id: selectedItem.id, 
              ...payload 
            });
          } else {
            await apiCreateReclub(payload);
          }
        }

        setIsFormOpen(false);
        setSelectedItem(null);

        // Optionally, refresh the data after insertion
        try {
          const [lapangan, reclub] = await Promise.all([
            apiRequest(LAPANGAN_ENDPOINT),
            apiRequest(RECLUB_ENDPOINT)
          ]);
          setLapanganData(lapangan || []);
          setReclubData(reclub || []);
        } catch (err) {
          console.error('Error fetching config:', err);
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error saving item:', err);
        setErrorMessage('Gagal simpan data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async () => {
      try {
        setLoading(true);

        console.log('Deleting item with ID:', selectedItem?.id);

        if (activeTab === "lapangan" && selectedItem?.id) {
          await apiDeleteLapangan(selectedItem.id);
        } else if (activeTab === "reclub" && selectedItem?.id) {
          await apiDeleteReclub(selectedItem.id);
        }

        setIsDeleteOpen(false);
        setSelectedItem(null);

        // Optionally, refresh the data after deletion
        try {
          const [lapangan, reclub] = await Promise.all([
            apiRequest(LAPANGAN_ENDPOINT),
            apiRequest(RECLUB_ENDPOINT)
          ]);
          setLapanganData(lapangan || []);
          setReclubData(reclub || []);
        } catch (err) {
          console.error('Error fetching config:', err);
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error deleting item:', err);
        setErrorMessage('Gagal hapus data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

  return (
  <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-8">
    {/* Tab Navigation */}
    <div className="flex gap-4 border-b mb-6">
      <button
        className={`pb-2 px-4 ${activeTab === "lapangan" ? "border-b-2 border-emerald-600 font-bold" : ""}`}
        onClick={() => setActiveTab("lapangan")}
      >
        Data Lapangan
      </button>
      <button
        className={`pb-2 px-4 ${activeTab === "reclub" ? "border-b-2 border-emerald-600 font-bold" : ""}`}
        onClick={() => setActiveTab("reclub")}
      >
        Data Reclub
      </button>
    </div>

    {/* TOOLBAR: Search & Add Button */}
    <div className="flex justify-between items-center mb-4 gap-4 w-full max-w-4xl">
      <input
        type="text"
        placeholder={`Search ${activeTab}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-64 bg-white text-gray-800"
      />
      <button
        onClick={handleOpenCreate}
        className="bg-pkk-green text-pkk-cream text-center p-2 px-5 text-lg font-semibold rounded-lg hover:bg-pkk-lime hover:scale-103 transition-all duration-250 cursor-pointer shadow-md"
      >
        Tambah {activeTab === "lapangan" ? "Lapangan" : "Reclub"}
      </button>
    </div>

    {/* DATA TABLE WRAPPER */}
    <div className="w-full max-w-4xl border rounded-lg overflow-hidden bg-white shadow-sm max-h-[500px] overflow-y-auto">
      {loading ? (
        <p className="text-gray-500 my-4 text-center">Memuat data...</p>
      ) : (
        <table className="w-full text-left border-collapse">
          {/* Lower z-index to stay under modal */}
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
                <td colSpan={activeTab === "lapangan" ? 4 : 5} className="p-4 text-center text-gray-500">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b">
                  {activeTab === "lapangan" ? (
                    <>
                      <td className="p-3 font-bold">{item.nama_lapangan}</td>
                      <td className="p-3 font-medium sm:text-sm">Rp {item.harga_lapangan?.toLocaleString()}</td>
                      <td className="p-3 font-medium sm:text-sm">Rp {item.harga_ballboy?.toLocaleString()}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-bold">{item.jadwal_atau_hari}</td>
                      <td className="p-3 font-medium sm:text-sm">Rp {item.biaya_daftar?.toLocaleString()}</td>
                      <td className="p-3 font-medium sm:text-sm">Rp {item.biaya_per_jam?.toLocaleString()}</td>
                      <td className="p-3 font-medium">{item.total_lama_jadwal?.toLocaleString()} Jam</td>
                    </>
                  )}
                  <td className="p-3 flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(item)} 
                      className="px-4 py-2 border rounded cursor-pointer p-1 transition-all duration-200 bg-pkk-blue text-pkk-cream hover:bg-pkk-cream hover:text-pkk-blue hover:scale-102 hover:font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(item)} 
                      className="px-4 py-2 border rounded cursor-pointer p-1 transition-all duration-200 bg-red-600 text-pkk-cream hover:bg-pkk-cream hover:text-red-700 hover:scale-102 hover:font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>      
        </table>
      )}
    </div>

    {/* FORM MODAL (z-50 overlays sticky header) */}
    {isFormOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-pkk-cream p-6 rounded shadow-lg w-96">
          <h3 className="text-lg font-bold mb-4">
            {selectedItem ? `Edit ${activeTab}` : `Tambah Data ${activeTab}`}
          </h3>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {errorMessage}
            </div>
          )}

          {activeTab === "lapangan" ? (
            <>
              <input
                type="text"
                value={formData.nama_lapangan}
                onChange={(e) => setFormData({ ...formData, nama_lapangan: e.target.value })}
                placeholder="Nama Lapangan"
                className="border p-2 w-full mb-3 rounded"
              />
              <input
                type="number"
                value={formData.harga_lapangan}
                onChange={(e) => setFormData({ ...formData, harga_lapangan: e.target.value })}
                placeholder="Harga Lapangan"
                className="border p-2 w-full mb-3 rounded"
              />
              <input
                type="number"
                value={formData.harga_ballboy}
                onChange={(e) => setFormData({ ...formData, harga_ballboy: e.target.value })}
                placeholder="Harga Ballboy"
                className="border p-2 w-full mb-4 rounded"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                value={formData.jadwal_atau_hari}
                onChange={(e) => setFormData({ ...formData, jadwal_atau_hari: e.target.value })}
                placeholder="Jadwal / Hari"
                className="border p-2 w-full mb-4 rounded"
              />
              <input
                type="number"
                value={formData.biaya_daftar}
                onChange={(e) => setFormData({ ...formData, biaya_daftar: e.target.value })}
                placeholder="Biaya Daftar"
                className="border p-2 w-full mb-4 rounded"
              />
              <input
                type="number"
                value={formData.total_lama_jadwal}
                onChange={(e) => setFormData({ ...formData, total_lama_jadwal: e.target.value })}
                placeholder="Total Lama Jadwal"
                className="border p-2 w-full mb-4 rounded"
              />
            </>
          )}
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { setErrorMessage(""); setIsFormOpen(false); }} 
              className="px-4 py-2 border rounded cursor-pointer hover:bg-pkk-blue hover:text-pkk-cream"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-pkk-green text-pkk-cream cursor-pointer rounded hover:bg-pkk-lime"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

    {/* DELETE CONFIRMATION MODAL (z-50 overlays sticky header) */}
    {isDeleteOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-pkk-cream p-6 rounded shadow-lg w-96">
          <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {errorMessage}
            </div>
          )}

          <p className="mb-4 text-slate-600">
            Are you sure you want to delete <b>{selectedItem?.nama_lapangan || selectedItem?.jadwal_atau_hari || selectedItem?.detail || selectedItem?.id}</b>?
          </p>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { setErrorMessage(""); setIsDeleteOpen(false); }} 
              className="px-4 py-2 border rounded cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-pkk-cream rounded cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
