import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow z-40 md:left-64">
      <div className="max-w-full mx-auto px-2 sm:px-6 lg:px-8 h-full">
        <div className="relative flex items-center justify-between h-full">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex space-x-4">
              <a
                href="/dashboard"
                className="text-gray-900 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-lg font-semibold"
              >
                Dashboard
              </a>
            </div>

            <div className="relative">
              <button
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                id="user-menu-button"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img
                  className="h-8 w-8 rounded-full"
                  src="/images/tb2.png"
                  alt="Profile"
                />
              </button>
              {menuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="py-1" role="none">
                    <a
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Profile
                    </a>
                    <a
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar;