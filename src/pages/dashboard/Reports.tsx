import { useState, useEffect } from 'react';
// import axios from 'axios'; // For real API calls
// import { API_BASE_URL } from '../../constants/constants'; // Your API base URL
// import { useAuth } from '../../context/authUtils'; // If you need to check admin role for permissions

// Mock data structures for different reports
interface FinancialReportData {
  totalRevenue: number;
  totalTicketsSold: number;
  totalPayouts: number;
  platformFees: number;
  revenueByMonth: { month: string; revenue: number }[];
}

interface UserGrowthReportData {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthOverTime: { month: string; newUsers: number }[];
}

interface RafflePerformanceData {
  totalRaffles: number;
  liveRaffles: number;
  completedRaffles: number;
  topPerformingRaffles: { id: string; title: string; ticketsSold: number; revenue: number }[];
  leastPerformingRaffles: { id: string; title: string; ticketsSold: number; revenue: number }[];
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState('financial'); // 'financial', 'users', 'raffles'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for report data
  const [financialReport, setFinancialReport] = useState<FinancialReportData | null>(null);
  const [userReport, setUserReport] = useState<UserGrowthReportData | null>(null);
  const [rafflePerformanceReport, setRafflePerformanceReport] = useState<RafflePerformanceData | null>(null);

  // State for date filters (example)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // const { isAuthenticated, user } = useAuth(); // Uncomment when ready to use authentication

  useEffect(() => {
    const fetchReport = async () => {
      // if (!isAuthenticated || user?.role !== 'admin') {
      //   setError("You do not have permission to view reports.");
      //   setLoading(false);
      //   return;
      // }

      setLoading(true);
      setError(null);
      setMessage(null); // Clear previous messages

      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

        // Simulate fetching data based on activeTab and filters
        if (activeTab === 'financial') {
          const mockFinancial: FinancialReportData = {
            totalRevenue: 150000,
            totalTicketsSold: 25000,
            totalPayouts: 80000,
            platformFees: 70000,
            revenueByMonth: [
              { month: 'Jan', revenue: 10000 },
              { month: 'Feb', revenue: 12000 },
              { month: 'Mar', revenue: 18000 },
              { month: 'Apr', revenue: 25000 },
              { month: 'May', revenue: 30000 },
            ],
          };
          setFinancialReport(mockFinancial);
        } else if (activeTab === 'users') {
          const mockUsers: UserGrowthReportData = {
            totalUsers: 1250,
            newUsersThisMonth: 85,
            activeUsers: 980,
            userGrowthOverTime: [
              { month: 'Jan', newUsers: 50 },
              { month: 'Feb', newUsers: 60 },
              { month: 'Mar', newUsers: 75 },
              { month: 'Apr', newUsers: 80 },
              { month: 'May', newUsers: 85 },
            ],
          };
          setUserReport(mockUsers);
        } else if (activeTab === 'raffles') {
          const mockRaffles: RafflePerformanceData = {
            totalRaffles: 120,
            liveRaffles: 15,
            completedRaffles: 105,
            topPerformingRaffles: [
              { id: 'R001', title: 'Luxury Car Raffle', ticketsSold: 4500, revenue: 112500 },
              { id: 'R002', title: 'Tech Gadget Bundle', ticketsSold: 900, revenue: 9000 },
            ],
            leastPerformingRaffles: [
              { id: 'R010', title: 'Old Book Collection', ticketsSold: 50, revenue: 250 },
              { id: 'R011', title: 'Mystery Box', ticketsSold: 80, revenue: 400 },
            ],
          };
          setRafflePerformanceReport(mockRaffles);
        }
        // In a real app:
        // const response = await axios.get(`${API_BASE_URL}/api/admin/reports/${activeTab}?startDate=${startDate}&endDate=${endDate}`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // setYourReportState(response.data);

      } catch (err) {
        console.error(`Failed to fetch ${activeTab} report:`, err);
        setError(`Failed to load ${activeTab} report. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [activeTab, startDate, endDate]); // Re-fetch when tab or dates change

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  const handleGenerateReport = () => {
    // This function would typically trigger the API call or data processing
    // For now, it just re-fetches the data based on current filters
    setMessage({ type: 'success', text: `Generating ${activeTab} report...` });
    setLoading(true);
    // Simulate generation/fetch
    setTimeout(() => {
        setMessage({ type: 'success', text: `${activeTab} report generated successfully!` });
        setLoading(false);
        // In a real app, you'd trigger the useEffect's data fetch here or directly handle data
    }, 500);
  };


  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Reports & Analytics</h1>
      <p className="text-lg text-gray-700 mb-8">Access key insights and performance metrics for your platform.</p>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'financial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('financial')}
          >
            Financial
          </button>
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'raffles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('raffles')}
          >
            Raffle Performance
          </button>
        </div>

        {/* Report Controls (Date Filters & Generate Button) */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center">
          <label htmlFor="startDate" className="text-gray-700 font-medium">From:</label>
          <input
            type="date"
            id="startDate"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="endDate" className="text-gray-700 font-medium">To:</label>
          <input
            type="date"
            id="endDate"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            onClick={handleGenerateReport}
            className="ml-0 md:ml-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
                <>
                  <span className="loader mr-2"></span> Generating...
                  <style>{`
                    .loader {
                      border: 2px solid #f3f3f3;
                      border-top: 2px solid #fff;
                      border-radius: 50%;
                      width: 16px;
                      height: 16px;
                      animation: spin 1s linear infinite;
                      display: inline-block;
                      vertical-align: middle;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </>
              ) : (
                'Generate Report'
              )}
          </button>
        </div>

        {message && (
            <div className={`p-3 mx-6 mt-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

        {/* Report Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center text-gray-600 flex items-center justify-center py-10">
                <span className="loader mr-3"></span> Loading data...
                <style>{`
                  .loader {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
            </div>
          )}

          {!loading && activeTab === 'financial' && financialReport && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Financial Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">${financialReport.totalRevenue.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Total Revenue</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{financialReport.totalTicketsSold.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Tickets Sold</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-red-600">${financialReport.totalPayouts.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Total Payouts</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-yellow-600">${financialReport.platformFees.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Platform Fees</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4 text-gray-800">Revenue Over Time</h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {/* Simple text-based chart, replace with a real charting library */}
                  {financialReport.revenueByMonth.map(data =>
                    `${data.month}: ${'█'.repeat(Math.floor(data.revenue / 1000))} $${data.revenue.toLocaleString()}`
                  ).join('\n')}
                </pre>
              </div>
            </div>
          )}

          {!loading && activeTab === 'users' && userReport && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">User Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{userReport.totalUsers.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Total Users</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{userReport.newUsersThisMonth.toLocaleString()}</p>
                  <p className="text-md text-gray-700">New Users (This Month)</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{userReport.activeUsers.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Active Users</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4 text-gray-800">User Growth Over Time</h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {/* Simple text-based chart */}
                  {userReport.userGrowthOverTime.map(data =>
                    `${data.month}: ${'█'.repeat(Math.floor(data.newUsers / 10))} ${data.newUsers.toLocaleString()} new users`
                  ).join('\n')}
                </pre>
              </div>
            </div>
          )}

          {!loading && activeTab === 'raffles' && rafflePerformanceReport && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Raffle Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{rafflePerformanceReport.totalRaffles.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Total Raffles</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{rafflePerformanceReport.liveRaffles.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Live Raffles</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{rafflePerformanceReport.completedRaffles.toLocaleString()}</p>
                  <p className="text-md text-gray-700">Completed Raffles</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4 text-gray-800">Top Performing Raffles</h3>
              <div className="bg-white rounded-lg shadow-md overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rafflePerformanceReport.topPerformingRaffles.map(raffle => (
                      <tr key={raffle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{raffle.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{raffle.ticketsSold.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${raffle.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-4 text-gray-800">Least Performing Raffles</h3>
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rafflePerformanceReport.leastPerformingRaffles.map(raffle => (
                      <tr key={raffle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{raffle.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{raffle.ticketsSold.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${raffle.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && !financialReport && !userReport && !rafflePerformanceReport && (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
                  Select a report type and date range to begin.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;