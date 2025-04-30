import { useState } from "react";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-gray-800 text-white p-4 w-full">
            <nav className="flex justify-between items-center">
                <div className="text-lg font-bold">RaffleitApp</div>
                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-4">
                    <li>
                        <a href="/" className="hover:text-gray-400">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="/about" className="hover:text-gray-400">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="/contact" className="hover:text-gray-400">
                            Contact
                        </a>
                    </li>
                    <li>
                        <a href="/howitworks" className="hover:text-gray-400">
                            How it works
                        </a>
                    </li>
                </ul>
                <div className="hidden md:flex items-center space-x-4">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Sign Up
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                        Sign In
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </nav>

            {/* Mobile Navbar */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute left-0 w-full bg-gray-800 text-white p-4">
                    <ul className="flex flex-col space-y-2">
                        <li>
                            <a href="/" className="hover:text-gray-400">
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="/about" className="hover:text-gray-400">
                                About
                            </a>
                        </li>
                        <li>
                            <a href="/contact" className="hover:text-gray-400">
                                Contact
                            </a>
                        </li>
                        <li>
                            <a href="/howitworks" className="hover:text-gray-400">
                                How it works
                            </a>
                        </li>
                    </ul>
                    <div className="flex flex-col space-y-2 mt-4">
                        <a href="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
                            Sign Up
                        </a>
                        <a href="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-center">
                            Sign In
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;