import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  // Dummy Data for Charts (replace with actual data fetched from your API)

  const dailyUsersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Active Users',
        data: [300, 450, 600, 500, 750, 800, 700],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const ticketSalesData = {
    labels: ['Raffle A', 'Raffle B', 'Raffle C', 'Raffle D', 'Raffle E'],
    datasets: [
      {
        label: 'Tickets Sold',
        data: [1200, 850, 1500, 700, 1100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const raffleStatusData = {
    labels: ['Live', 'Completed', 'Upcoming'],
    datasets: [
      {
        label: 'Raffle Count',
        data: [25, 70, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Define a baseOptions object, without the specific legend position
  const baseChartOptions = {
    responsive: true,
    plugins: {
      // Keep plugins object, but don't define 'legend.position' here
      // We'll define it directly in each chart's options
    },
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Platform Analytics</h1>
      <p className="text-lg text-gray-700 mb-8">Gain insights into your Raffleit platform's performance and user engagement.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Total Users</h2>
          <p className="text-4xl font-bold text-blue-700">12,345</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Active Raffles</h2>
          <p className="text-4xl font-bold text-green-600">25</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Tickets Sold (24h)</h2>
          <p className="text-4xl font-bold text-purple-700">5,678</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Total Revenue (Est.)</h2>
          <p className="text-4xl font-bold text-yellow-600">$123,456</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Daily Active Users</h3>
          <Line
            options={{
              ...baseChartOptions,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Daily Active Users Trends',
                },
              },
            }}
            data={dailyUsersData}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Top Raffle Ticket Sales</h3>
          <Bar
            options={{
              ...baseChartOptions,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tickets Sold per Raffle',
                },
              },
            }}
            data={ticketSalesData}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Raffle Status Distribution</h3>
          <div className="flex justify-center h-80">
            <Pie
              options={{
                ...baseChartOptions,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Current Raffle Status Overview',
                  },
                },
              }}
              data={raffleStatusData}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">User Registration Trends</h3>
          <p className="text-gray-500">
            Chart showing new user registrations over time will go here.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recent User Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">U001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Bought 5 tickets for Raffle X</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-05-26 10:30 AM</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">U002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Created new account</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-05-26 09:45 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;