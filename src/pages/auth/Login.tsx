import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';
import { API_BASE_URL } from '../../constants/constants';
import { User } from '../../context/authUtils';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;

      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: emailInput?.value,
        password: passwordInput?.value,
      });
      console.log('Login response:', response.data);

      const { token, ...userDataFromApi } = response.data; // Destructure token, rest is user data

      const userToStore: User = {
          user_id: userDataFromApi.user_id, // Map user_id from API to user_id in interface
          first_name: userDataFromApi.first_name,
          last_name: userDataFromApi.last_name,
          email: userDataFromApi.email,
          role: userDataFromApi.role
      };

      login(token, userToStore);

      // navigate('/dashboard'); // REMOVE or COMMENT OUT this line
      navigate('/'); // Redirect to home page after login
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-6 sm:mt-10 text-center text-xl sm:text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-6 sm:mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="rounded-lg bg-white shadow-md p-4 sm:p-6">
            <form action="#" method="POST" className="space-y-4 sm:space-y-6">
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
                    className="block w-full rounded-md bg-white px-3 py-2 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
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
                      href="/forgot-password"
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
                    className="block w-full rounded-md bg-white px-3 py-2 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-1 focus:-outline-offset-1 focus:outline-black sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="space-y-3">
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
                      console.log('Login failed. Please check your email or password.');
                    } finally {
                      if (button) {
                        button.innerHTML = 'Sign in';
                        button.disabled = false;
                      }
                    }
                  }}
                  className="flex w-full justify-center rounded-md bg-btn-primary transition duration-100 px-3 py-2 sm:py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
                
                {/* Cancel/Back Button */}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex w-full justify-center rounded-md bg-slate-100 text-slate-600 px-3 py-2 sm:py-1.5 text-sm/6 font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
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

            <div className="mt-4 sm:mt-6">
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 sm:py-1.5 text-sm/6 font-semibold text-gray-900 shadow-xs hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                />
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Google</span>
              </button>
            </div>
          </div>

          <p className="mt-6 sm:mt-10 text-center text-sm/6 text-gray-500">
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