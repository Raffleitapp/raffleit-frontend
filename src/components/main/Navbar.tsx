import { useState } from "react";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "How it works", href: "/howitworks" },
    ];

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false); // Close mobile menu on link click
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 z-50">
            <nav className="flex justify-between items-center">
                <div className="text-lg font-bold">Funditzone</div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-4">
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <a href={item.href} className="hover:text-gray-400">
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="hidden md:flex items-center space-x-4">
                    {/* Desktop Buttons */}
                    <a href="/register" className="bg-btn-primary hover:bg-btn-secondary text-white font-bold py-2 px-4 rounded text-center">
                        Sign Up
                    </a>
                    <a href="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-center">
                        Sign In
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                    aria-expanded={isMobileMenuOpen}
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
                <div className="md:hidden absolute left-0 w-full bg-gray-800 text-white p-4 z-50">
                    <ul className="flex flex-col space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className="hover:text-gray-400"
                                    onClick={handleLinkClick}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col space-y-2 mt-4">
                        <a
                            href="/register"
                            className="bg-btn-primary hover:bg-btn-secondary text-white font-bold py-2 px-4 rounded text-center"
                            onClick={handleLinkClick}
                        >
                            Sign Up
                        </a>
                        <a
                            href="/login"
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-center"
                            onClick={handleLinkClick}
                        >
                            Sign In
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;