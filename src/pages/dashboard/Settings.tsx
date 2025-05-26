import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // For real API calls
// import { API_BASE_URL } from '../../constants/constants'; // Your API base URL
import { useAuth } from '../../context/authUtils'; // To get current user info and token

// Define a type for notification preferences
interface NotificationPreferences {
  emailRaffleUpdates: boolean;
  smsRaffleUpdates: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
}

const Settings = () => {
  const { user, isAuthenticated } = useAuth(); // Get current user and auth status
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'notifications'

  // State for Profile Information
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || ''); // Often read-only or requires re-verification

  // State for Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State for Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emailRaffleUpdates: true,
    smsRaffleUpdates: false,
    emailMarketing: true,
    smsMarketing: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load initial settings (simulated)
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');

      // Simulate fetching actual notification preferences from backend
      // For now, use a default or mock previously saved ones
      setNotificationPrefs({
        emailRaffleUpdates: true,
        smsRaffleUpdates: false,
        emailMarketing: true,
        smsMarketing: false,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // In a real app, send data to your backend API
    try {
      // Example:
      // await axios.put(`${API_BASE_URL}/api/user/profile`, { firstName, lastName }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Potentially update user context if profile changes affect it
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      setLoading(false);
      return;
    }

    // In a real app, send data to your backend API
    try {
      // Example:
      // await axios.post(`${API_BASE_URL}/api/user/change-password`, { currentPassword, newPassword }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
      setMessage({ type: 'error', text: 'Failed to change password. Check current password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPrefs(prev => ({ ...prev, [name]: checked }));
    // Immediately save or provide a 'Save Changes' button
    // In a real app, you might debounce this or save on a dedicated button click
    // console.log(`Notification preference for ${name} changed to ${checked}`);
  };

  const handleSaveNotificationPrefs = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Example:
      // await axios.put(`${API_BASE_URL}/api/user/notifications`, notificationPrefs, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage({ type: 'success', text: 'Notification preferences saved!' });
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      setMessage({ type: 'error', text: 'Failed to save notification preferences.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Please log in to view your settings.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Account Settings</h1>
      <p className="text-lg text-gray-700 mb-8">Manage your profile, password, and notification preferences.</p>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="p-6">
          {message && (
            <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Profile</h2>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  readOnly // Often email is read-only or requires a different verification process
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  value={email}
                />
                <p className="mt-2 text-sm text-gray-500">Email address cannot be changed from here.</p>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                    <>
                      <span className="loader mr-2"></span> Updating Profile...
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
                    'Save Profile'
                  )}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Change Password</h2>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                 {loading ? (
                    <>
                      <span className="loader mr-2"></span> Changing Password...
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
                    'Change Password'
                  )}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Notification Preferences</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <input
                    id="emailRaffleUpdates"
                    name="emailRaffleUpdates"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={notificationPrefs.emailRaffleUpdates}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="emailRaffleUpdates" className="ml-3 block text-base font-medium text-gray-700">
                    Email updates for raffles I've entered
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="smsRaffleUpdates"
                    name="smsRaffleUpdates"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={notificationPrefs.smsRaffleUpdates}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="smsRaffleUpdates" className="ml-3 block text-base font-medium text-gray-700">
                    SMS updates for raffles I've entered
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="emailMarketing"
                    name="emailMarketing"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={notificationPrefs.emailMarketing}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="emailMarketing" className="ml-3 block text-base font-medium text-gray-700">
                    Receive marketing emails
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="smsMarketing"
                    name="smsMarketing"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={notificationPrefs.smsMarketing}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="smsMarketing" className="ml-3 block text-base font-medium text-gray-700">
                    Receive marketing SMS messages
                  </label>
                </div>
              </div>
              <button
                onClick={handleSaveNotificationPrefs}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                 {loading ? (
                    <>
                      <span className="loader mr-2"></span> Saving Preferences...
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
                    'Save Preferences'
                  )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Deactivation (Optional Section) */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8 border border-red-300">
        <h2 className="text-2xl font-bold mb-4 text-red-700">Danger Zone</h2>
        <p className="text-gray-700 mb-4">
          Permanently deactivate your account. This action cannot be undone.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
              alert('Account Deactivation initiated (simulated).');
              // Implement actual API call to deactivate account
              // e.g., axios.post(`${API_BASE_URL}/api/user/deactivate`, { userId: user.id }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
              // Then log the user out and redirect
            }
          }}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
        >
          Deactivate Account
        </button>
      </div>
    </div>
  );
};

export default Settings;