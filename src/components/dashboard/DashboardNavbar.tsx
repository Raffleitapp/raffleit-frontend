const DashboardNavbar = () => {
  return (
    <div>
      <nav className="bg-white shadow w-full z-1 relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            <div className="flex-1 flex items-center justify-between">
              {/* Left side: Dashboard */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-900 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
              </div>

              {/* Right side: Profile and Settings */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-900 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="text-gray-900 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default DashboardNavbar