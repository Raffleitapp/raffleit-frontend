import { useAuth } from '../../context/authUtils'; // Assuming this path is correct

export const DashboardHome = () => {
  const { user } = useAuth(); 


  const userRoleDisplay = user?.role === 'admin' ? 'Admin' :
    user?.role === 'host' ? 'Host' :
      'User'; // Default to 'User' if role isn't admin or host

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">Welcome to Your Dashboard, {user?.first_name || userRoleDisplay}!</h1>
      <p className="text-lg text-gray-700 mb-8">Here's a quick overview of your Raffleit platform activity.</p>

      {/* Quick Stats/KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">My Active Raffles</h2>
          <p className="text-4xl font-bold text-blue-700">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Tickets Purchased</h2>
          <p className="text-4xl font-bold text-green-600">42</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Upcoming Draws</h2>
          <p className="text-4xl font-bold text-purple-700">3</p>
        </div>
      </div>

      {/* Recent Activity/Updates */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <ul className="divide-y divide-gray-200">
          <li className="py-3 text-gray-700">You bought 5 tickets for 'Summer Getaway Raffle'.</li>
          <li className="py-3 text-gray-700">Your 'Gadget Extravaganza' raffle was completed.</li>
          <li className="py-3 text-gray-700">New raffle 'Luxury Car Draw' added to the platform.</li>
        </ul>
      </div>
    </div>
  );
}