import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

interface UserProfile {
  user_id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  phone_number?: string | null;
  address?: string | null;
  raffles_entered?: number;
  tickets_purchased?: number;
  raffles_won?: number;
  profile_picture_url?: string;
  registration_date?: string;
}

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError("No authentication token found. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching profile data...');
        
        const res = await apiClient.get('/profile');
        
        console.log('Response status:', res.status);
        console.log('Response ok:', res.status === 200);
        
        const data = res.data;
        console.log('Profile data received:', data);

        // Map backend fields to UserProfile
        const userProfile: UserProfile = {
          user_id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role: data.role,
          phone_number: data.phone_number ?? null,
          address: data.address ?? null,
          raffles_entered: data.raffles_entered ?? 0,
          tickets_purchased: data.tickets_purchased ?? 0,
          raffles_won: data.raffles_won ?? 0,
          profile_picture_url: data.image ?? '/images/tb2.png',
          registration_date: data.created_at,
        };

        setProfileData(userProfile);

      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        setError(`Failed to load profile data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center text-gray-700">
        <div className="loader"></div> Loading Profile...
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

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Please log in to view your profile.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-gray-700 text-center text-lg">
        No profile data available after loading. This indicates an issue.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">My Profile</h1>
      <p className="text-lg text-gray-700 mb-8">View and manage your personal information and account statistics.</p>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-shrink-0">
          <img
            src={'/images/tb2.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
          />
          <button
            className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors"
            onClick={() => navigate('/dashboard/settings')}
          >
            Change Photo
          </button>
        </div>

        <div className="flex-grow text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {profileData.first_name || 'Guest'} {profileData.last_name || 'User'}
          </h2>
          <p className="text-xl text-gray-600 mb-4">{profileData.email || 'no-email@example.com'}</p>
          <p className="text-md text-gray-700 mb-2">
            Role: <span className={`font-semibold ${
              profileData.role === 'admin' ? 'text-purple-700' :
              profileData.role === 'host' ? 'text-orange-700' :
              'text-green-700'
            }`}>
              {(profileData.role || 'user').charAt(0).toUpperCase() + (profileData.role || 'user').slice(1)}
            </span>
          </p>
          {profileData.phone_number && (
            <p className="text-md text-gray-700 mb-2">Phone: {profileData.phone_number}</p>
          )}
          {profileData.address && (
            <p className="text-md text-gray-700 mb-2">Address: {profileData.address}</p>
          )}
          {profileData.registration_date && (
            <p className="text-md text-gray-700 mb-2">
              Member Since: {new Date(profileData.registration_date).toLocaleDateString()}
            </p>
          )}

          <button
            onClick={() => navigate('/dashboard/settings')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-4xl font-bold text-blue-600">{profileData.raffles_entered ?? 0}</p>
            <p className="text-lg text-gray-700">Raffles Entered</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-4xl font-bold text-green-600">{profileData.tickets_purchased ?? 0}</p>
            <p className="text-lg text-gray-700">Tickets Purchased</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <p className="text-4xl font-bold text-purple-600">{profileData.raffles_won ?? 0}</p>
            <p className="text-lg text-gray-700">Raffles Won</p>
          </div>
        </div>
        <div className="mt-8 text-center">
            <button
                onClick={() => navigate('/dashboard/tickets')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
                View My Tickets
            </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;