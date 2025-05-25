import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';
import { API_BASE_URL } from '../../constants/constants';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Function to handle login
  const handleLogin = async () => {
    try {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;

      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email: emailInput?.value,
        password: passwordInput?.value,
      });
      console.log('Login response:', response.data);

      const { token, role } = response.data;
      login(role);
      localStorage.setItem('token', token); // Store token
      localStorage.setItem('role', role); // Store role
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Let button handler show error
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="rounded-lg bg-white shadow-md p-4">
            <form action="#" method="POST" className="space-y-6">
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
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={async () => {
                    const button = document.querySelector(
                      'button[type="button"]'
                    ) as HTMLButtonElement;
                    if (button) {
                      button.innerHTML =
                        '<span class="loader"></span> Signing in...';
                      button.disabled = true;
                    }
                    try {
                      await handleLogin();
                    } catch {
                      // Show error (e.g., alert or UI element)
                      alert('Login failed. Please check your email or password.');
                    } finally {
                      if (button) {
                        button.innerHTML = 'Sign in';
                        button.disabled = false;
                      }
                    }
                  }}
                  className="flex w-full justify-center rounded-md bg-btn-primary transition duration-100 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
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
                Sign in with Google
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <a
              href="/register"
              className="font-400 text-black-300 hover:text-green-800 ml-2 underline"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </>
  );
};