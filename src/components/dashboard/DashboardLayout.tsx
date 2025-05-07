import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm mt-1">Role: {user?.role || 'Unknown'}</p>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `block px-4 py-2 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                }
              >
                Home
              </NavLink>
            </li>
            {user?.role === 'host' && (
              <li>
                <NavLink
                  to="/dashboard/raffles"
                  className={({ isActive }) =>
                    `block px-4 py-2 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                  }
                >
                  Raffles
                </NavLink>
              </li>
            )}
            {user?.role === 'admin' && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/users"
                    className={({ isActive }) =>
                      `block px-4 py-2 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                    }
                  >
                    Users
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/analytics"
                    className={({ isActive }) =>
                      `block px-4 py-2 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                    }
                  >
                    Analytics
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/settings"
                    className={({ isActive }) =>
                      `block px-4 py-2 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                    }
                  >
                    Settings
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/reports"
                    className={({ isActive }) =>
                      `block px-4 py-2 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                    }
                  >
                    Reports
                  </NavLink>
                </li>
              </>
            )}
            <li>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* Render nested dashboard routes */}
        </main>

        {/* Dashboard Footer */}
        <footer className="bg-gray-200 p-4 text-center text-gray-600">
          <p>&copy; 2025 Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};