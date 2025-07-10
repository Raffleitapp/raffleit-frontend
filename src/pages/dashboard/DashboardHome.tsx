import { useAuth } from '../../context/authUtils';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/constants';
import { Activity, BarChart3, FileText, Plus, Ticket, Users, TrendingUp, Calendar, Gift, Trophy, Clock, DollarSign } from 'lucide-react';
import { RaffleAnalyticsComponent } from '../../components/dashboard/RaffleAnalytics';
import ErrorBoundary from '../../components/shared/ErrorBoundary';

interface RaffleStats {
  myActiveRaffles: number;
  ticketsPurchased: number;
  upcomingDraws: number;
  recentActivity: string[];
}

interface RaffleAnalytics {
  total_raffles: number;
  active_raffles: number;
  pending_raffles: number;
  completed_raffles: number;
  total_revenue: number;
  recent_raffles: Array<{
    id: number;
    title: string;
    host_name: string;
    approve_status: string;
    type: string;
    tickets_sold: number;
    current_amount: number;
    target?: number;
    ticket_price?: number;
    ending_date: string;
    created_at: string;
    category_name: string;
  }>;
  top_performing_raffles: Array<{
    id: number;
    title: string;
    host_name: string;
    type: string;
    tickets_sold: number;
    current_amount: number;
    target?: number;
    ticket_price?: number;
    ending_date: string;
    category_name: string;
  }>;
}

interface TicketAnalytics {
  total_tickets: number;
  won_tickets: number;
  lost_tickets: number;
  pending_tickets: number;
  recent_tickets: Array<{
    id: number;
    ticket_number: string;
    status: string;
    user: {
      first_name: string;
      last_name: string;
    };
    raffle: {
      title: string;
    };
    created_at: string;
  }>;
  top_users: Array<{
    user_name: string;
    total_tickets: number;
    won_tickets: number;
  }>;
}

interface Raffle {
  approve_status: string;
  ending_date: string;
  title?: string;
  host_name?: string;
}

interface Ticket {
  id: string;
  raffle_id: string;
  user_id: string;
  purchase_date: string;
  status?: string;
  raffle?: {
    title: string;
    ending_date: string;
  };
}

interface Category {
  id: number;
  category_name: string;
}

interface Organisation {
  id: number;
  organisation_name: string;
}

export const DashboardHome = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<RaffleStats>({
    myActiveRaffles: 0,
    ticketsPurchased: 0,
    upcomingDraws: 0,
    recentActivity: [],
  });
  const [ticketAnalytics, setTicketAnalytics] = useState<TicketAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Create raffle modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    host_name: '',
    description: '',
    starting_date: '',
    ending_date: '',
    target: '',
    category_id: '',
    organisation_id: '',
    fundraising_id: '',
    state_raffle_hosted: '',
    type: 'raffle' as 'raffle' | 'fundraising',
    ticket_price: '',
    max_tickets: '',
    image1: null as File | null,
    image2: null as File | null,
    image3: null as File | null,
    image4: null as File | null,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [hostType, setHostType] = useState<'personal' | 'organisation' | null>(null);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchStats();
    if (user?.role === 'admin') {
      fetchTicketAnalytics();
    }

    const interval = setInterval(() => {
      fetchStats();
      if (user?.role === 'admin') {
        fetchTicketAnalytics();
      }
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Fetch categories and organisations when modal opens
  useEffect(() => {
    if (showCreateModal) {
      fetchCategories();
      fetchOrganisations();
    }
  }, [showCreateModal]);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!user?.user_id || !token) return;
    
    setLoading(true);
    try {
      // Fetch user's raffles and tickets in parallel
      const [rafflesRes, ticketsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${user.user_id}/raffles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/users/${user.user_id}/tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const raffles: Raffle[] = rafflesRes.ok ? await rafflesRes.json() : [];
      const tickets: Ticket[] = ticketsRes.ok ? await ticketsRes.json() : [];

      // Calculate statistics
      const myActiveRaffles = raffles.filter(
        (r: Raffle) => r.approve_status === 'approved' && new Date(r.ending_date) > new Date()
      ).length;

      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);
      const upcomingDraws = raffles.filter((r: Raffle) => {
        const end = new Date(r.ending_date);
        return end > now && end <= in7Days;
      }).length;

      // Enhanced recent activity with ticket information
      const recentActivity: string[] = [];
      
      // Add raffle activity
      if (raffles.length > 0) {
        raffles.slice(0, 2).forEach((r: Raffle) => {
          recentActivity.push(`Your raffle '${r.title || r.host_name}' was ${r.approve_status}.`);
        });
      }

      // Add recent ticket activity
      if (tickets.length > 0) {
        const recentTickets = tickets.slice(0, 2);
        recentTickets.forEach((ticket: Ticket) => {
          if (ticket.status === 'won') {
            recentActivity.push(`🏆 You won a prize with ticket ${ticket.id}!`);
          } else if (ticket.raffle?.title) {
            recentActivity.push(`🎫 You purchased a ticket for '${ticket.raffle.title}'.`);
          }
        });
      }

      setStats({
        myActiveRaffles,
        ticketsPurchased: tickets.length,
        upcomingDraws,
        recentActivity: recentActivity.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        myActiveRaffles: 0,
        ticketsPurchased: 0,
        upcomingDraws: 0,
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketAnalytics = async () => {
    const token = localStorage.getItem('token');
    if (!token || user?.role !== 'admin') return;

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTicketAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching ticket analytics:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrganisations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/organisations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrganisations(data);
      }
    } catch (error) {
      console.error('Error fetching organisations:', error);
    }
  };

  const handleCreateRaffle = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);
    
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a raffle');
      setCreating(false);
      return;
    }

    if (!isAuthenticated || !user) {
      setError('Authentication required. Please log in again.');
      setCreating(false);
      return;
    }
    
    // Validation
    if (!newRaffle.title.trim()) {
      setError('Title is required');
      setCreating(false);
      return;
    }
    if (!newRaffle.host_name.trim()) {
      setError('Host name is required');
      setCreating(false);
      return;
    }
    if (!newRaffle.category_id) {
      setError('Please select a category');
      setCreating(false);
      return;
    }
    if (!newRaffle.ending_date) {
      setError('End date is required');
      setCreating(false);
      return;
    }
    if (newRaffle.type === 'raffle') {
      if (!newRaffle.ticket_price || parseFloat(newRaffle.ticket_price) <= 0) {
        setError('Valid ticket price is required for raffles');
        setCreating(false);
        return;
      }
    }

    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('title', newRaffle.title);
      formData.append('host_name', newRaffle.host_name);
      formData.append('description', newRaffle.description);
      formData.append('starting_date', newRaffle.starting_date);
      formData.append('ending_date', newRaffle.ending_date);
      formData.append('target', newRaffle.target);
      formData.append('category_id', newRaffle.category_id);
      formData.append('type', newRaffle.type);
      
      if (newRaffle.type === 'raffle') {
        formData.append('ticket_price', newRaffle.ticket_price);
        if (newRaffle.max_tickets) formData.append('max_tickets', newRaffle.max_tickets);
      }
      
      if (newRaffle.organisation_id) formData.append('organisation_id', newRaffle.organisation_id);
      if (newRaffle.fundraising_id) formData.append('fundraising_id', newRaffle.fundraising_id);
      if (newRaffle.state_raffle_hosted) formData.append('state_raffle_hosted', newRaffle.state_raffle_hosted);
      
      // Explicitly add user_id to FormData (backend should also set this)
      if (user?.user_id) {
        formData.append('user_id', user.user_id.toString());
      }
      
      // Validation: Ensure consistent organization tracking
      if (hostType === 'personal' && newRaffle.organisation_id) {
        console.warn('Warning: Personal raffle should not have organisation_id');
      }
      if (hostType === 'organisation' && !newRaffle.organisation_id) {
        setError('Please select an organisation for organisation raffles');
        setCreating(false);
        return;
      }
      
      // Add images if they exist
      if (newRaffle.image1) formData.append('image1', newRaffle.image1);
      if (newRaffle.image2) formData.append('image2', newRaffle.image2);
      if (newRaffle.image3) formData.append('image3', newRaffle.image3);
      if (newRaffle.image4) formData.append('image4', newRaffle.image4);

      // Debug: Log what's being sent
      console.log('FormData being sent to API:');
      console.log('Host Type:', hostType);
      console.log('Current User ID:', user?.user_id);
      console.log('Organisation ID from form:', newRaffle.organisation_id);
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }

      const res = await fetch(`${API_BASE_URL}/raffles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log('Raffle created successfully:', responseData);
        console.log('Created raffle user_id:', responseData.user_id);
        console.log('Current authenticated user ID:', user?.user_id);
        resetModal();
        fetchStats(); // Refresh stats after creating raffle
        setSuccess('Raffle created successfully!');
        setError(null);
      } else if (res.status === 401) {
        // Authentication failed
        setError('Authentication failed. Please log in again.');
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('role');
        window.location.href = '/login';
      } else if (res.status === 422) {
        // Validation errors
        try {
          const errorData = await res.json();
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat();
            setError(errorMessages.join(', '));
          } else {
            setError(errorData.message || 'Validation failed');
          }
        } catch (parseError) {
          setError('Validation failed. Please check your inputs.');
        }
      } else {
        const errorData = await res.text();
        try {
          const parsedError = JSON.parse(errorData);
          setError(parsedError.message || 'Failed to create raffle');
        } catch (parseError) {
          setError(`Failed to create raffle (${res.status}): ${errorData}`);
        }
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An error occurred while creating the raffle: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setCreating(false);
    }
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setStep(1);
    setHostType(null);
    setNewRaffle({
      title: '',
      host_name: '',
      description: '',
      starting_date: '',
      ending_date: '',
      target: '',
      category_id: '',
      organisation_id: '',
      fundraising_id: '',
      state_raffle_hosted: '',
      type: 'raffle',
      ticket_price: '',
      max_tickets: '',
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
    setError(null);
    setSuccess(null);
    setCreating(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const userRoleDisplay = user?.role === 'admin' ? 'Administrator' : 
                          user?.role === 'host' ? 'Host' : 'User';

  // Image handling functions
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2 | 3 | 4) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, JPG, GIF, SVG)');
        return;
      }
      
      // Validate file size (4MB = 4 * 1024 * 1024 bytes)
      const maxSize = 4 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image file size must be less than 4MB');
        return;
      }
      
      const imageKey = `image${imageNumber}` as keyof typeof newRaffle;
      setNewRaffle({ ...newRaffle, [imageKey]: file });
      setError(null); // Clear any previous error
    }
  };

  const removeImage = (imageNumber: 1 | 2 | 3 | 4) => {
    const imageKey = `image${imageNumber}` as keyof typeof newRaffle;
    setNewRaffle({ ...newRaffle, [imageKey]: null });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.first_name || userRoleDisplay}!
              </h1>
              <p className="mt-2 text-lg text-slate-200">
                Here's what's happening with your Funditzone account
              </p>
              <p className="text-sm text-slate-300 mt-1">
                Last updated: {formatTime(lastUpdate)}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <Users className="w-4 h-4 mr-1" />
                {userRoleDisplay}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Gift className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">My Active Raffles</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.myActiveRaffles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Ticket className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">My Tickets</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.ticketsPurchased}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Upcoming Draws</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.upcomingDraws}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Ticket Analytics */}
        {user?.role === 'admin' && ticketAnalytics && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg text-white p-6 mb-6">
              <h2 className="text-xl font-bold mb-2">Platform Ticket Analytics</h2>
              <p className="text-blue-100">Real-time ticket tracking across the platform</p>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Ticket className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Total Tickets</p>
                    <p className="text-2xl font-bold text-slate-800">{ticketAnalytics.total_tickets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Won Tickets</p>
                    <p className="text-2xl font-bold text-slate-800">{ticketAnalytics.won_tickets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Pending</p>
                    <p className="text-2xl font-bold text-slate-800">{ticketAnalytics.pending_tickets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Active Users</p>
                    <p className="text-2xl font-bold text-slate-800">{ticketAnalytics.top_users.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tickets and Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tickets */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Recent Tickets</h3>
                {ticketAnalytics.recent_tickets.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No recent tickets</p>
                ) : (
                  <div className="space-y-3">
                    {ticketAnalytics.recent_tickets.slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                          <Ticket className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {ticket.ticket_number}
                            </div>
                            <div className="text-xs text-slate-500">
                              {ticket.user.first_name} {ticket.user.last_name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ticket.status === 'won' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'lost' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ticket.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {formatDate(ticket.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Users */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Top Ticket Holders</h3>
                {ticketAnalytics.top_users.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No users yet</p>
                ) : (
                  <div className="space-y-3">
                    {ticketAnalytics.top_users.slice(0, 5).map((user, index) => (
                      <div key={user.user_name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' : 'bg-slate-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {user.user_name}
                            </div>
                            {user.won_tickets > 0 && (
                              <div className="text-xs text-green-600">
                                🏆 {user.won_tickets} wins
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {user.total_tickets}
                          </div>
                          <div className="text-xs text-slate-500">tickets</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Raffle Analytics */}
        <ErrorBoundary>
          <RaffleAnalyticsComponent userRole={user?.role || ''} />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 border border-green-300 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-3 text-white" />
                    Create New Raffle
                  </button>
                  
                  <Link
                    to="/raffles"
                    className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <Ticket className="w-4 h-4 mr-3 text-slate-400" />
                    Browse Raffles
                  </Link>

                  <Link
                    to="/dashboard/tickets"
                    className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <Activity className="w-4 h-4 mr-3 text-slate-400" />
                    My Tickets
                  </Link>

                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/dashboard/analytics"
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-200"
                      >
                        <BarChart3 className="w-4 h-4 mr-3 text-blue-500" />
                        Admin Analytics
                      </Link>
                      
                      <Link
                        to="/dashboard/reports"
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-200"
                      >
                        <FileText className="w-4 h-4 mr-3 text-blue-500" />
                        Platform Reports
                      </Link>

                      <Link
                        to="/dashboard/users"
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-200"
                      >
                        <Users className="w-4 h-4 mr-3 text-blue-500" />
                        Manage Users
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-800">Recent Activity</h3>
                  <button 
                    onClick={() => {
                      fetchStats();
                      if (user?.role === 'admin') fetchTicketAnalytics();
                      setLastUpdate(new Date());
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  </div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No recent activity to display</p>
                    <p className="text-sm text-slate-400 mt-1">Start by creating a raffle or purchasing tickets</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-shrink-0">
                          <Activity className="h-5 w-5 text-slate-400 mt-0.5" />
                        </div>
                        <p className="text-sm text-slate-700">{activity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Raffle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Modal Overlay */}
          <div
            className="absolute inset-0 backdrop-blur-sm backdrop-blur-sm transition-opacity bg-opacity-50 transition-opacity"
            onClick={resetModal}
            aria-label="Close modal"
          />
          {/* Modal Content */}
          <div
            className="relative bg-white p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200 z-10 max-h-[95vh] overflow-y-auto my-4"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Step 1: Host Type Selection */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Host Your Raffle</h2>
                <div className="flex flex-col gap-4">
                  <button
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    onClick={() => {
                      setHostType('personal');
                      setStep(2);
                      setNewRaffle(r => ({
                        ...r,
                        organisation_id: '',
                        host_name: user ? `${user.first_name} ${user.last_name}` : '',
                      }));
                    }}
                  >
                    Personal Account
                  </button>
                  <button
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    onClick={() => {
                      setHostType('organisation');
                      setStep(2);
                    }}
                  >
                    Organisation
                  </button>
                  <button
                    className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                    onClick={resetModal}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Raffle Form */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Create New Raffle</h2>
                {error && <div className="text-red-600 mb-4 text-center bg-red-50 p-3 rounded-lg">{error}</div>}
                {success && <div className="text-green-600 mb-4 text-center bg-green-50 p-3 rounded-lg">{success}</div>}
                
                {/* Organisation Selection for Organisation Host */}
                {hostType === 'organisation' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organisation</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newRaffle.organisation_id}
                      onChange={e => setNewRaffle({ ...newRaffle, organisation_id: e.target.value })}
                      required
                    >
                      <option value="">Select Organisation</option>
                      {organisations.map((org) => (
                        <option key={org.id} value={org.id}>{org.organisation_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <form
                  className="flex flex-col gap-4"
                  onSubmit={e => { e.preventDefault(); handleCreateRaffle(); }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter raffle title"
                      value={newRaffle.title}
                      onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Host Name</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter host name"
                      value={newRaffle.host_name}
                      onChange={e => setNewRaffle({ ...newRaffle, host_name: e.target.value })}
                      required
                      disabled={hostType === 'personal'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter raffle description"
                      value={newRaffle.description}
                      onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newRaffle.category_id}
                      onChange={e => setNewRaffle({ ...newRaffle, category_id: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newRaffle.type}
                      onChange={e => setNewRaffle({ ...newRaffle, type: e.target.value as 'raffle' | 'fundraising' })}
                    >
                      <option value="raffle">Raffle</option>
                      <option value="fundraising">Fundraising</option>
                    </select>
                  </div>

                  {newRaffle.type === 'raffle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter ticket price"
                          value={newRaffle.ticket_price}
                          onChange={e => setNewRaffle({ ...newRaffle, ticket_price: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Tickets (Optional)</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter maximum tickets"
                          value={newRaffle.max_tickets}
                          onChange={e => setNewRaffle({ ...newRaffle, max_tickets: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {newRaffle.type === 'fundraising' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter target amount"
                        value={newRaffle.target}
                        onChange={e => setNewRaffle({ ...newRaffle, target: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Starting Date</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newRaffle.starting_date}
                      onChange={e => setNewRaffle({ ...newRaffle, starting_date: e.target.value })}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Images (Optional)</h3>
                    <p className="text-sm text-gray-600">Upload up to 4 images for your raffle. Accepted formats: JPG, PNG, GIF, SVG (max 4MB each)</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image 1</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => handleImageChange(e, 1)}
                        />
                        {newRaffle.image1 && (
                          <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700 truncate">{newRaffle.image1.name}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(1)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image 2</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => handleImageChange(e, 2)}
                        />
                        {newRaffle.image2 && (
                          <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700 truncate">{newRaffle.image2.name}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(2)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image 3</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => handleImageChange(e, 3)}
                        />
                        {newRaffle.image3 && (
                          <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700 truncate">{newRaffle.image3.name}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(3)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image 4</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                          className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => handleImageChange(e, 4)}
                        />
                        {newRaffle.image4 && (
                          <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700 truncate">{newRaffle.image4.name}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(4)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ending Date</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newRaffle.ending_date}
                      onChange={e => setNewRaffle({ ...newRaffle, ending_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                      type="button"
                      className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition"
                    >
                      {creating ? 'Creating...' : 'Create Raffle'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};