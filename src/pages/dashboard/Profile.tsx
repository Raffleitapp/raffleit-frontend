import { useState, useEffect } from 'react';
// import axios from 'axios'; // You'll use this for real API calls
// import { API_BASE_URL } from '../../constants/constants'; // Your API base URL
import { useAuth } from '../../context/authUtils'; // To get the current authenticated user

// This interface should ideally be consistent with your User interface in authUtils.ts
// but including it here for clarity on what this component expects.
interface UserProfile {
  user_id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  phone_number?: string;
  address?: string;
  raffles_entered?: number;
  tickets_purchased?: number;
  raffles_won?: number;
  profile_picture_url?: string;
  registration_date?: string;
}

const Profile = () => {
  const { user, isAuthenticated } = useAuth(); // Get the authenticated user from your context
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        setError("Please log in to view your profile.");
        return;
      }

      setLoading(true);
      setError(null);

      // Simulate API call to fetch detailed user profile data
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        // Mock data based on the logged-in user
        // In a real app, you'd fetch this from your backend (e.g., /api/user/profile)
        const mockUserProfile: UserProfile = {
          user_id: user.user_id, // Use the ID from the authenticated user
          first_name: user.first_name || 'N/A',
          last_name: user.last_name || 'N/A',
          email: user.email,
          role: user.role,
          phone_number: user.role === 'admin' ? '+1234567890' : (user.role === 'host' ? '+1987654321' : null),
          address: user.role === 'admin' ? '123 Admin St, City, Country' : (user.role === 'host' ? '456 Host Ave, Town, Country' : null),
          raffles_entered: 15,
          tickets_purchased: 42,
          raffles_won: 3,
          profile_picture_url: 'https://via.placeholder.com/150/7f8c8d/ffffff?text=User', // Generic placeholder
          registration_date: '2023-01-15',
        };

        setProfileData(mockUserProfile);

        // In a real app:
        // const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // setProfileData(response.data.profile); // Adjust based on your API response structure
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, user]); // Re-fetch if authentication status or user changes

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
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

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Error: {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-gray-700 text-center text-lg">
        No profile data available.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">My Profile</h1>
      <p className="text-lg text-gray-700 mb-8">View and manage your personal information and account statistics.</p>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            src={profileData.profile_picture_url || 'https://via.placeholder.com/150/7f8c8d/ffffff?text=User'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
          />
          {/* Add an upload button here if desired */}
          <button className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors">
            Change Photo
          </button>
        </div>

        {/* Profile Details */}
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {profileData.first_name} {profileData.last_name}
          </h2>
          <p className="text-xl text-gray-600 mb-4">{profileData.email}</p>
          <p className="text-md text-gray-700 mb-2">
            **Role:** <span className={`font-semibold ${
              profileData.role === 'admin' ? 'text-purple-700' :
              profileData.role === 'host' ? 'text-orange-700' :
              'text-green-700'
            }`}>{profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}</span>
          </p>
          {profileData.phone_number && (
            <p className="text-md text-gray-700 mb-2">**Phone:** {profileData.phone_number}</p>
          )}
          {profileData.address && (
            <p className="text-md text-gray-700 mb-2">**Address:** {profileData.address}</p>
          )}
          {profileData.registration_date && (
            <p className="text-md text-gray-700 mb-2">
              **Member Since:** {new Date(profileData.registration_date).toLocaleDateString()}
            </p>
          )}

          {/* Quick Actions / Edit Profile Link */}
          <button
            onClick={() => alert('Navigate to Settings or Profile Edit Page')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Account Statistics Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-4xl font-bold text-blue-600">{profileData.raffles_entered || 0}</p>
            <p className="text-lg text-gray-700">Raffles Entered</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-4xl font-bold text-green-600">{profileData.tickets_purchased || 0}</p>
            <p className="text-lg text-gray-700">Tickets Purchased</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <p className="text-4xl font-bold text-purple-600">{profileData.raffles_won || 0}</p>
            <p className="text-lg text-gray-700">Raffles Won</p>
          </div>
        </div>
        {/* You could add a link to "My Tickets" or "My Wins" here */}
        <div className="mt-8 text-center">
            <button
                onClick={() => alert('Navigate to My Tickets page')}
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