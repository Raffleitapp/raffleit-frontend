import './App.css';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, ReactNode } from 'react'; // Import ReactNode

import { Footer } from './components/main/Footer';
import Navbar from './components/main/Navbar';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Raffles } from './pages/Raffles';
import PublicRaffles from './pages/PublicRaffles';
import PaymentSuccess from './pages/PaymentSuccess';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import CompletedRaffles from './pages/dashboard/CompletedRaffles';
import LiveRaffles from './pages/dashboard/LiveRaffles';
import Category from './pages/dashboard/Category';
import Analytics from './pages/dashboard/Analytics';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import Profile from './pages/dashboard/Profile';
import Reports from './pages/dashboard/Reports';
import Users from './pages/dashboard/Users';
import NotFound from './pages/NotFound';
import Settings from './pages/dashboard/Settings';
import Tickets from './pages/dashboard/Tickets';
import AllTickets from './pages/dashboard/AllTickets';
import { useAuth } from './context/authUtils';

function PublicLayout() {
  const location = useLocation();

  const validPublicRoutes = [
    '/',
    '/about',
    '/contact',
    '/howitworks',
    '/raffles',
    '/payment-success',
  ];

  const isValidRoute =
    validPublicRoutes.includes(location.pathname) ||
    /^\/raffles\/[^/]+$/.test(location.pathname);

  const showLayout = isValidRoute && !['/login', '/register'].includes(location.pathname);

  return (
    <>
      {showLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/raffles" element={<PublicRaffles />} />
        <Route path="/raffles/:id" element={<PublicRaffles />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showLayout && <Footer />}
    </>
  );
}

function DashboardLayoutRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />}>
        <Route index element={<DashboardHome />} />
        <Route path="completed-raffles" element={<CompletedRaffles />} />
        <Route path="live-raffles" element={<LiveRaffles />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="category" element={<Category />} />
        <Route path="category/:id" element={<Category />} />
        <Route path="category/:id/edit" element={<Category />} />
        <Route path="category/:id/view" element={<Category />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="all-tickets" element={<AllTickets />} />
        <Route path="raffles" element={<Raffles />} />
        <Route path="raffles/:id" element={<Raffles />} />
        <Route path="raffles/:id/edit" element={<Raffles />} />
        <Route path="raffles/:id/view" element={<Raffles />} />
        <Route path="raffles/:id/winners" element={<Raffles />} />
        <Route path="raffles/:id/entries" element={<Raffles />} />
        <Route path="raffles/:id/entries/:entryId" element={<Raffles />} />
        <Route path="home" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Define the props interface for ProtectedRoute
interface ProtectedRouteProps {
  children: ReactNode;
}

// Apply the props interface to ProtectedRoute
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while authentication is being determined
  }

  return isAuthenticated ? <>{children}</> : null;
}

function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="App">
      {isDashboardRoute ? (
        <ProtectedRoute>
          <DashboardLayoutRoutes />
        </ProtectedRoute>
      ) : (
        <PublicLayout />
      )}
    </div>
  );
}

const AppWrapper = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppWrapper;