import React, { useState, useEffect } from "react";
import { apiRequest } from "../services/api";

export default function Config() {

    const [activeTab, setActiveTab] = useState("lapangan");
    const [lapanganData, setLapanganData] = useState([]);
    const [reclubData, setReclubData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // null = Create Mode, object = Edit Mode

    useEffect(() => {
      async function fetchAllData() {
        setLoading(true);
        try {
          const [lapangan, reclub] = await Promise.all([
            apiRequest('/config/lapangan'),
            apiRequest('/config/reclub')
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
        setIsFormOpen(true);
    };

    const handleOpenEdit = (item) => {
        setSelectedItem(item); // Load item details into form
        setIsFormOpen(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item); // Store item target for deletion
        setIsDeleteOpen(true);
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b mb-6 ">
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
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleOpenCreate}
          className="bg-pkk-green text-pkk-cream text-center p-2 px-5 text-lg font-semibold rounded-lg hover:bg-pkk-lime hover:scale-103 transition-all duration-250 cursor-pointer shadow-md"
        >
          Tambah {activeTab === "lapangan" ? "Lapangan" : "Reclub"}
        </button>
      </div>

      {/* DATA TABLE */}
      {loading ? (
        <p className="text-gray-500 my-4">Loading configuration data...</p>
      ) : (
        <table className="w-full max-w-4xl text-left border-collapse border">
          <thead>
            <tr className="bg-pkk-green text-pkk-cream border-pkk-lime border-1">
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
                <td colSpan={activeTab === "lapangan" ? 4 : 3} className="p-4 text-center text-gray-500">
                  No data found.
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

        {/* FORM MODAL (Create / Edit Popup) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-pkk-cream p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {selectedItem ? `Edit ${activeTab}` : `Tambah Data ${activeTab}`}
            </h3>
            {activeTab === "lapangan" ? (
              <>
                <input
                  type="text"
                  defaultValue={selectedItem ? selectedItem.nama_lapangan : ""}
                  placeholder="Nama Lapangan"
                  className="border p-2 w-full mb-3 rounded"
                />
                <input
                  type="number"
                  defaultValue={selectedItem ? selectedItem.harga_lapangan : ""}
                  placeholder="Harga Lapangan"
                  className="border p-2 w-full mb-3 rounded"
                />
                <input
                  type="number"
                  defaultValue={selectedItem ? selectedItem.harga_ballboy : ""}
                  placeholder="Harga Ballboy"
                  className="border p-2 w-full mb-4 rounded"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  defaultValue={selectedItem ? selectedItem.jadwal_atau_hari : ""}
                  placeholder="Jadwal / Hari"
                  className="border p-2 w-full mb-4 rounded"
                />
                <input
                  type="number"
                  defaultValue={selectedItem ? selectedItem.biaya_daftar : ""}
                  placeholder="Biaya Daftar"
                  className="border p-2 w-full mb-4 rounded"
                />
                <input
                  type="number"
                  defaultValue={selectedItem ? selectedItem.biaya_per_jam : ""}
                  placeholder="Biaya Per Jam"
                  className="border p-2 w-full mb-4 rounded"
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="px-4 py-2 border rounded cursor-pointer hover:bg-pkk-blue hover:text-pkk-cream"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-pkk-green text-pkk-cream cursor-pointer rounded hover:bg-pkk-lime">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-pkk-cream p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="mb-4 text-slate-600">
              Are you sure you want to delete <b>{selectedItem?.nama_lapangan || selectedItem?.jadwal_atau_hari || selectedItem?.detail || selectedItem?.id}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-pkk-cream rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
