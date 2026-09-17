import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetReportKeuangan } from "../services/api";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function Dashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drill-down filter state: 'ALL' | 'INCOME' | 'EXPENSE'
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "tanggal",
    direction: "desc",
  });

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiGetReportKeuangan();
      setReports(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch financial report");
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = useMemo(
    () => reports.reduce((acc, curr) => acc + (curr.kas_in || 0), 0),
    [reports],
  );
  const totalExpense = useMemo(
    () => reports.reduce((acc, curr) => acc + (curr.kas_out || 0), 0),
    [reports],
  );
  const netBalance = totalIncome - totalExpense;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const processedReports = useMemo(() => {
    return reports
      .filter((item) => {
        // Tab Filter
        if (activeFilter === "INCOME" && item.kas_in <= 0) return false;
        if (activeFilter === "EXPENSE" && item.kas_out <= 0) return false;

        // Search Filter
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const rawDate = item.tanggal?.toLowerCase() || "";
          const formattedDate = formatDateIndo(item.tanggal).toLowerCase();
          const matchDesc = item.description?.toLowerCase().includes(query);

          return (
            matchDesc ||
            rawDate.includes(query) ||
            formattedDate.includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [reports, activeFilter, searchQuery, sortConfig]);

  // Filtered dataset for the drill-down table view
  const filteredReports = reports.filter((item) => {
    if (activeFilter === "INCOME") return item.kas_in > 0;
    if (activeFilter === "EXPENSE") return item.kas_out > 0;
    return true; // 'ALL'
  });

  if (loading) {
    return (
      <div className="w-24 h-24 flex items-center justify-center animate-pop-up">
        <DotLottieReact src="/loading.json" loop autoplay />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-lg font-semibold text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 gap-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="w-full max-w-xl mb-0 flex justify-start">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pkk-green text-pkk-cream font-semibold rounded-lg hover:bg-pkk-lime hover:scale-102 transition-all text-sm shadow cursor-pointer"
        >
          ← Kembali
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <img
          src="/logo_pkk.png"
          alt="Logo PKK"
          className="w-24 h-24 sm:w-32 sm:h-32"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-pkk-green">
          Laporan Kas
        </h1>
      </div>

      {/* 3 Main Summary Cards with PKK Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        {/* Net Balance Card - PKK Blue */}
        <div
          onClick={() => setActiveFilter("ALL")}
          className={`flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer shadow-md transition-all duration-250 border-2 ${
            activeFilter === "ALL"
              ? "bg-pkk-green text-pkk-cream border-pkk-lime scale-103"
              : "bg-white text-pkk-green border-pkk-green/20 hover:border-pkk-green hover:scale-103"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Total Kas
          </span>
          <h2 className="text-xl sm:text-2xl font-bold my-1">
            {formatCurrency(netBalance)}
          </h2>
          <span className="text-xs opacity-70">Semua Transaksi</span>
        </div>

        {/* Total Income Card - PKK Green */}
        <div
          onClick={() => setActiveFilter("INCOME")}
          className={`flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer shadow-md transition-all duration-250 border-2 ${
            activeFilter === "INCOME"
              ? "bg-pkk-green text-pkk-cream border-pkk-lime scale-103"
              : "bg-white text-pkk-green border-pkk-green/20 hover:border-pkk-green hover:scale-103"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Total Pendapatan
          </span>
          <h2 className="text-xl sm:text-2xl font-bold my-1">
            {formatCurrency(totalIncome)}
          </h2>
          <span className="text-xs opacity-70">Filter Pendapatan</span>
        </div>

        {/* Total Expense Card - PKK Yellow */}
        <div
          onClick={() => setActiveFilter("EXPENSE")}
          className={`flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer shadow-md transition-all duration-250 border-2 ${
            activeFilter === "EXPENSE"
              ? "bg-pkk-green text-pkk-cream border-pkk-lime scale-103"
              : "bg-white text-pkk-green border-pkk-green/20 hover:border-pkk-green hover:scale-103"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Total Pengeluaran
          </span>
          <h2 className="text-xl sm:text-2xl font-bold my-1">
            {formatCurrency(totalExpense)}
          </h2>
          <span className="text-xs opacity-70">Filter Pengeluaran</span>
        </div>
      </div>

      {/* Drill-down Table View */}
      <div className="w-full bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col gap-4">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-pkk-green">
              Rincian Laporan
            </h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                activeFilter === "ALL"
                  ? "bg-pkk-green text-pkk-cream"
                  : activeFilter === "INCOME"
                    ? "bg-pkk-green text-pkk-cream"
                    : "bg-pkk-green text-pkk-cream"
              }`}
            >
              {activeFilter === "ALL"
                ? "Semua"
                : activeFilter === "INCOME"
                  ? "Pendapatan"
                  : "Pengeluaran"}
            </span>
          </div>
          {/* Search Box */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari deskripsi atau tanggal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pkk-green text-gray-700"
            />
            {activeFilter !== "ALL" && (
              <button
                onClick={() => {
                  setActiveFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-xs font-semibold px-3 py-2 rounded-lg bg-pkk-blue text-pkk-cream hover:bg-pkk-cream hover:text-pkk-blue hover:border-pkk-blue border-1 hover:scale-103 transition-all duration-250 cursor-pointer whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-pkk-green uppercase tracking-wider">
                {/* Tanggal Column Header */}
                <th
                  onClick={() => handleSort("tanggal")}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-50 select-none"
                >
                  Tanggal{" "}
                  {sortConfig.key === "tanggal"
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>

                {/* Conditional Columns */}
                {(activeFilter === "ALL" || activeFilter === "INCOME") && (
                  <th
                    onClick={() => handleSort("kas_in")}
                    className="py-3 px-4 cursor-pointer hover:bg-gray-50 select-none"
                  >
                    Kas In{" "}
                    {sortConfig.key === "kas_in"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                )}

                {(activeFilter === "ALL" || activeFilter === "EXPENSE") && (
                  <th
                    onClick={() => handleSort("kas_out")}
                    className="py-3 px-4 cursor-pointer hover:bg-gray-50 select-none"
                  >
                    Kas Out{" "}
                    {sortConfig.key === "kas_out"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                )}

                {/* Deskripsi Column Header */}
                <th
                  onClick={() => handleSort("description")}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-50 select-none"
                >
                  Deskripsi{" "}
                  {sortConfig.key === "description"
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {processedReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeFilter === "ALL" ? 4 : 3}
                    className="py-6 text-center text-gray-400"
                  >
                    Tidak ada data transaksi.
                  </td>
                </tr>
              ) : (
                processedReports.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap font-medium">
                      {formatDateIndo(item.tanggal)}
                    </td>

                    {(activeFilter === "ALL" || activeFilter === "INCOME") && (
                      <td
                        className={`py-3 px-4 whitespace-nowrap font-semibold ${item.kas_in > 0 ? "text-green-600" : "text-gray-300"}`}
                      >
                        {item.kas_in > 0 ? formatCurrency(item.kas_in) : "-"}
                      </td>
                    )}

                    {(activeFilter === "ALL" || activeFilter === "EXPENSE") && (
                      <td
                        className={`py-3 px-4 whitespace-nowrap font-semibold ${item.kas_out > 0 ? "text-red-600" : "text-gray-300"}`}
                      >
                        {item.kas_out > 0 ? formatCurrency(item.kas_out) : "-"}
                      </td>
                    )}

                    <td className="py-3 px-4">{item.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
