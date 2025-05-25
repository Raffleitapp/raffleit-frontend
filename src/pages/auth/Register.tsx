import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import AxiosError for more specific typing
import { useAuth } from '../../context/authUtils';
import { API_BASE_URL } from '../../constants/constants';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'host'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        first_name,
        last_name,
        email,
        password,
        password_confirmation: confirmPassword,
        role,
      });

      const { token, role: returnedRole } = response.data || {};
      if (token && returnedRole) {
        register(returnedRole);
        localStorage.setItem('token', token);
        localStorage.setItem('role', returnedRole);
        navigate('/dashboard');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error: unknown) { // Changed from 'any' to 'unknown'
      console.error('Registration failed:', error);

      if (axios.isAxiosError(error)) { // Use axios.isAxiosError for type narrowing
        // Now 'error' is safely typed as AxiosError
        if (error.response && error.response.data && (error.response.data as { message?: string }).message) {
          setError((error.response.data as { message?: string }).message!); // Assert message exists if you're sure
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (error instanceof Error) {
        // Handle other general JavaScript errors
        setError(error.message);
      } else {
        // Fallback for truly unexpected error types
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component remains the same
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Register an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="rounded-lg bg-white shadow-md p-4">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Register as
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="accent-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">User</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={role === 'host'}
                    onChange={() => setRole('host')}
                    className="accent-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">Host</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-btn-primary transition duration-100 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="loader"></span> Registering...
                  </>
                ) : (
                  'Register'
                )}
              </button>
              <style>{`
                .loader {
                  border: 2px solid #f3f3f3;
                  border-top: 2px solid #3498db;
                  border-radius: 50%;
                  width: 16px;
                  height: 16px;
                  animation: spin 1s linear infinite;
                  display: inline-block;
                  margin-right: 8px;
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
          </form>

          <div className="mt-6">
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm/6 font-semibold text-gray-900 shadow-xs hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="h-5 w-5 mr-2"
              />
              Register with Google
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Already a member?{' '}
          <a
            href="/login"
            className="font-400 text-black-300 underline hover:text-green-800 ml-2"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};