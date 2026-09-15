
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
    {/* // Navbar */}
    <div className="flex items-center justify-between p-4 bg-pkk-green text-pkk-cream"> 
      <Link to="/" className="text-md font-bold">PKK Tennis Community</Link>

      {/* Navbar Desktop component */}
      <div className="hidden sm:flex gap-4">
        <Link to="/" className=" cursor-pointer font-semibold">Home</Link>
        <Link to="/config" className=" cursor-pointer font-semibold">Config</Link>
      </div>

        <button  className="sm:hidden gap-4 p-2 rounded hover:bg-pkk-cream hover:text-pkk-green cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            ☰
        </button>

    </div>

    {isOpen && (
    <div className="flex flex-col gap-2 p-2 justify-center items-center bg-pkk-green text-pkk-cream text-center transition-all duration-250">
        <Link to="/" className="w-full cursor-pointer font-semibold p-1 rounded transition-colors hover:bg-pkk-cream hover:text-pkk-green">
        Home
        </Link>
        <Link to="/config" className="w-full cursor-pointer font-semibold p-1 rounded transition-colors hover:bg-pkk-cream hover:text-pkk-green">
        Config
        </Link>
    </div>
    )}
    </div>
  );
 
}