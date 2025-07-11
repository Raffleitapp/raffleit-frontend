import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/constants';
import { useAuth } from '../../context/authUtils';
import { useNavigate } from 'react-router-dom';
import { X, Ticket, DollarSign, User as UserIcon } from 'lucide-react';

// Define a type for a user
interface User {
  user_id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  registration_date: string;
}

// Define types for tickets and payments
interface UserTicket {
  id: number;
  ticket_number: string;
  status: 'pending' | 'won' | 'lost';
  prize?: string;
  created_at: string;
  raffle?: {
    title: string;
    ending_date: string;
    ticket_price: number;
    type: 'raffle' | 'fundraising';
  };
}

interface UserPayment {
  id: number;
  amount: number;
  payment_method: string;
  payment_type: 'ticket' | 'donation';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  quantity?: number;
  created_at: string;
  raffle?: {
    title: string;
    type: 'raffle' | 'fundraising';
  };
}

interface UserTicketData {
  tickets: UserTicket[];
  payments: UserPayment[];
  summary: {
    total_tickets: number;
    total_spent: number;
    total_donations: number;
    active_raffles: number;
    won_tickets: number;
  };
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Ticket tracking modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTicketData, setUserTicketData] = useState<UserTicketData | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'payments'>('tickets');

  const { user: currentUser, isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || currentUser?.role !== 'admin') {
        setError("You do not have permission to view this page.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        
        // Map backend fields to frontend User type if needed
        interface BackendUser {
          id: string | number;
          first_name: string;
          last_name: string;
          email: string;
          role: 'user' | 'host' | 'admin';
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
        }

        const mappedUsers: User[] = data.map((u: BackendUser) => ({
          user_id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          role: u.role,
          status: u.status || 'active',
          registration_date: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : '',
        }));

        setUsers(mappedUsers);
      } catch {
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, currentUser, token]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (userId: string | number) => {
    navigate(`/dashboard/users/${userId}/edit`);
  };

  const handleChangeStatus = async (userId: string | number, currentStatus: string) => {
    // Example: PATCH /users/{id} with new status
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setUsers(users =>
        users.map(u => u.user_id === userId ? { ...u, status: newStatus } : u)
      );
    } catch {
      setError('Failed to update user status.');
    }
  };

  const handleDelete = async (userId: string | number) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users => users.filter(u => u.user_id !== userId));
    } catch {
      setError('Failed to delete user.');
    }
  };

  const handleViewTickets = async (user: User) => {
    setSelectedUser(user);
    setShowTicketModal(true);
    setTicketLoading(true);
    setUserTicketData(null);

    try {
      // Fetch comprehensive user analytics from the new endpoint
      const response = await fetch(`${API_BASE_URL}/users/${user.user_id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user analytics');
      }

      const analyticsData = await response.json();
      
      setUserTicketData({
        tickets: analyticsData.tickets,
        payments: analyticsData.payments,
        summary: analyticsData.summary
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      setError('Failed to load user ticket data');
    } finally {
      setTicketLoading(false);
    }
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedUser(null);
    setUserTicketData(null);
    setActiveTab('tickets');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
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
      <p className="text-lg text-gray-700 mb-8">Manage all registered users and track their ticket purchases.</p>

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
          onClick={() => navigate('/dashboard/users/new')}
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
                <tr key={user.user_id} className="hover:bg-gray-50">
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
                      onClick={() => handleViewTickets(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                      title="View Tickets"
                    >
                      <Ticket className="w-4 h-4 mr-1" />
                      Tickets
                    </button>
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

      {/* Ticket Tracking Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 backdrop-blur-sm transition-opacity bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <UserIcon className="w-6 h-6 text-gray-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedUser?.first_name} {selectedUser?.last_name} - Ticket History
                </h2>
              </div>
              <button
                onClick={closeTicketModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {ticketLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loader"></div>
                  <span className="ml-2">Loading ticket data...</span>
                </div>
              ) : userTicketData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-600 text-sm font-medium">Total Tickets</div>
                      <div className="text-2xl font-bold text-blue-900">{userTicketData.summary.total_tickets}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-600 text-sm font-medium">Total Spent</div>
                      <div className="text-2xl font-bold text-green-900">{formatCurrency(userTicketData.summary.total_spent)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-purple-600 text-sm font-medium">Donations</div>
                      <div className="text-2xl font-bold text-purple-900">{formatCurrency(userTicketData.summary.total_donations)}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-orange-600 text-sm font-medium">Active Raffles</div>
                      <div className="text-2xl font-bold text-orange-900">{userTicketData.summary.active_raffles}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-yellow-600 text-sm font-medium">Won Tickets</div>
                      <div className="text-2xl font-bold text-yellow-900">{userTicketData.summary.won_tickets}</div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`border-b-2 py-2 px-1 text-sm font-medium ${
                          activeTab === 'tickets' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Tickets ({userTicketData.tickets.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab('payments')}
                        className={`border-b-2 py-2 px-1 text-sm font-medium ${
                          activeTab === 'payments' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Payments ({userTicketData.payments.length})
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-4">
                    {activeTab === 'tickets' ? (
                      // Tickets List
                      userTicketData.tickets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No tickets found for this user.
                        </div>
                      ) : (
                        userTicketData.tickets.map((ticket) => (
                          <div key={ticket.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Ticket className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="font-medium text-gray-900">{ticket.ticket_number}</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    ticket.status === 'won' ? 'bg-green-100 text-green-800' :
                                    ticket.status === 'lost' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {ticket.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Raffle: {ticket.raffle?.title || 'Unknown Raffle'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Purchased: {formatDate(ticket.created_at)}
                                  {ticket.raffle?.ending_date && (
                                    <span className="ml-4">
                                      Draw Date: {formatDate(ticket.raffle.ending_date)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {ticket.raffle?.ticket_price && (
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(ticket.raffle.ticket_price)}
                                  </div>
                                )}
                                {ticket.prize && (
                                  <div className="text-sm text-green-600 font-medium">
                                    Won: {ticket.prize}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      // Payments List
                      userTicketData.payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No payments found for this user.
                        </div>
                      ) : (
                        userTicketData.payments.map((payment) => (
                          <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="font-medium text-gray-900">
                                    {formatCurrency(payment.amount)}
                                  </span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {payment.status.toUpperCase()}
                                  </span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.payment_type === 'ticket' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {payment.payment_type.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Raffle: {payment.raffle?.title || 'Unknown Raffle'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Date: {formatDate(payment.created_at)}
                                  <span className="ml-4">
                                    Method: {payment.payment_method}
                                  </span>
                                  {payment.quantity && (
                                    <span className="ml-4">
                                      Qty: {payment.quantity}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  ID: {payment.id}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">
                  Failed to load ticket data. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;