import { useState, useEffect } from 'react';
// import axios from 'axios'; // You'll use this for real API calls
// import { API_BASE_URL } from '../../constants/constants'; // Your API base URL
// import { useAuth } from '../../context/authUtils'; // If you need to check user's role for permissions

// Define a type for a user
interface User {
  user_id: string | number; // Assuming user_id based on your login response
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  status: 'active' | 'inactive' | 'pending'; // Example status
  registration_date: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'user', 'host', 'admin'

  // const { user: currentUser, isAuthenticated } = useAuth(); // Uncomment when ready to use authentication

  useEffect(() => {
    const fetchUsers = async () => {
      // if (!isAuthenticated || currentUser?.role !== 'admin') {
      //   setError("You do not have permission to view this page.");
      //   setLoading(false);
      //   return;
      // }

      setLoading(true);
      setError(null);

      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        // Mock data for users
        const mockUsers: User[] = [
          {
            user_id: 1,
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@Funditzone.com',
            role: 'admin',
            status: 'active',
            registration_date: '2023-01-15',
          },
          {
            user_id: 2,
            first_name: 'Alice',
            last_name: 'Smith',
            email: 'alice@example.com',
            role: 'user',
            status: 'active',
            registration_date: '2023-03-20',
          },
          {
            user_id: 3,
            first_name: 'Bob',
            last_name: 'Johnson',
            email: 'bob@example.com',
            role: 'host',
            status: 'pending',
            registration_date: '2024-01-01',
          },
          {
            user_id: 4,
            first_name: 'Charlie',
            last_name: 'Brown',
            email: 'charlie@example.com',
            role: 'user',
            status: 'inactive',
            registration_date: '2023-07-10',
          },
          {
            user_id: 5,
            first_name: 'Diana',
            last_name: 'Prince',
            email: 'diana@example.com',
            role: 'host',
            status: 'active',
            registration_date: '2024-02-28',
          },
        ];
        setUsers(mockUsers);

        // In a real app:
        // const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // setUsers(response.data.users); // Adjust based on your API response structure
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (userId: string | number) => {
    alert(`Edit user with ID: ${userId}`);
    // Implement navigation to a user edit page or open a modal
  };

  const handleChangeStatus = (userId: string | number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    alert(`Changing status for user ${userId} to ${newStatus}`);
    // In a real app, send API call to update status and then refresh users
  };

  const handleDelete = (userId: string | number) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      alert(`Deleting user with ID: ${userId}`);
      // In a real app, send API call to delete user and then remove from state
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="loader"></div> Loading Users...
        <style>{`
                  .loader {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-left: 10px;
                  }

                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">User Management</h1>
      <p className="text-lg text-gray-700 mb-8">Manage all registered users on your platform.</p>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="host">Host</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => alert('Add New User functionality')} // Replace with actual Add User modal/page
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New User
        </button>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No users match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'host' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.registration_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user.user_id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleChangeStatus(user.user_id, user.status)}
                      className={`${
                        user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      } mr-4`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;