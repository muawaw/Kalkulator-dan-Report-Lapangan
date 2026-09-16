import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6">
        <img src="/logo_pkk.png" alt="Logo" className="w-64 h-64" />

        <div className="flex flex-col sm:flex-row items-center justify-center p-4 gap-6 w-full max-w-xl">
            <Link to="/calculator" className="w-full sm:w-64 py-4 px-6 bg-pkk-green text-pkk-cream text-center text-lg font-semibold rounded-xl hover:bg-pkk-lime hover:scale-103 transition-all duration-250 cursor-pointer shadow-md">
            Hitung Pendapatan
            </Link>
            <div className="w-full sm:w-64 py-4 px-6 bg-pkk-green text-pkk-cream text-center text-lg font-semibold rounded-xl hover:bg-pkk-lime hover:scale-103 transition-all duration-250 cursor-pointer shadow-md">
            Menu 2
            </div>
        </div>
    </div>
    );
}