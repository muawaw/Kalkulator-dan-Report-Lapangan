import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-pkk-green text-pkk-cream shadow-md transition-all duration-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <Link
          to="/"
          className="text-md font-bold transition-transform duration-200 active:scale-95 hover:opacity-90"
        >
          PKK Tennis Community
        </Link>

        {/* Navbar Desktop component */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 ease-out hover:bg-pkk-cream/20 active:scale-95"
          >
            Home
          </Link>
          <Link
            to="/config"
            className="px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 ease-out hover:bg-pkk-cream/20 active:scale-95"
          >
            Config
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="sm:hidden p-2 rounded-lg transition-all duration-200 active:scale-90 hover:bg-pkk-cream hover:text-pkk-green"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <span
            className={`inline-block transition-transform duration-500 ${isOpen ? "rotate-90" : "rotate-0"}`}
          >
            ☰
          </span>
        </button>
      </div>

      {/* Smooth Expandable Mobile Dropdown */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-40 opacity-100 py-2 border-t border-pkk-cream/10"
            : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 text-center">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="w-full font-semibold py-2 rounded-lg transition-all duration-200 ease-out hover:bg-pkk-cream hover:text-pkk-green active:scale-98"
          >
            Home
          </Link>
          <Link
            to="/config"
            onClick={() => setIsOpen(false)}
            className="w-full font-semibold py-2 rounded-lg transition-all duration-200 ease-out hover:bg-pkk-cream hover:text-pkk-green active:scale-98"
          >
            Config
          </Link>
        </div>
      </div>
    </nav>
  );
}
