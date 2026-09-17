// home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6 text-center select-none">
      {/* Logo */}
      <img
        src="/logo_pkk.png"
        alt="Logo PKK"
        className="w-56 h-56 md:w-64 md:h-64 object-contain animate__animated animate__fadeInUp transition-transform duration-300 hover:scale-105"
        style={{ animationDelay: "0.1s" }}
      />

      {/* Hero Title Container */}
      <div
        className="animate__animated animate__fadeInUp transition-all duration-300"
        style={{ animationDelay: "0.3s" }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-pkk-green tracking-tight">
          Pukul Kiri Kanan
        </h1>
      </div>

      {/* Hero Subtitle Container */}
      <div
        className="animate__animated animate__fadeInUp max-w-md transition-all duration-300"
        style={{ animationDelay: "0.5s" }}
      >
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          Aplikasi monitoring & pencatatan kas, serta kalkulasi perhitungan
          lapangan.
        </p>
      </div>

      {/* Action Buttons Container */}
      <div className="flex flex-col sm:flex-row items-center justify-center p-4 gap-4 sm:gap-6 w-full max-w-xl">
        <Link
          to="/dashboard"
          className="w-full sm:w-64 py-4 px-6 bg-pkk-green text-pkk-cream text-center text-lg font-semibold rounded-xl hover:bg-pkk-lime transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer shadow-md animate__animated animate__fadeInUp"
          style={{ animationDelay: "0.7s" }}
        >
          Dashboard
        </Link>
        <Link
          to="/calculator"
          className="w-full sm:w-64 py-4 px-6 bg-pkk-green text-pkk-cream text-center text-lg font-semibold rounded-xl hover:bg-pkk-lime transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer shadow-md animate__animated animate__fadeInUp"
          style={{ animationDelay: "0.9s" }}
        >
          Hitung Pendapatan
        </Link>
        <Link
          to="/extend"
          className="w-full sm:w-64 py-4 px-6 bg-pkk-green text-pkk-cream text-center text-lg font-semibold rounded-xl hover:bg-pkk-lime transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer shadow-md animate__animated animate__fadeInUp"
          style={{ animationDelay: "1.1s" }}
        >
          Hitung Pembagian Lapangan
        </Link>
      </div>
    </div>
  );
}
