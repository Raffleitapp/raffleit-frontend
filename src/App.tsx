import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
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
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import CompletedRaffles from './pages/dashboard/CompletedRaffles';
import LiveRaffles from './pages/dashboard/LiveRaffles';
import Category from './pages/dashboard/Category';
import Profile from './pages/dashboard/Profile';
import Users from './pages/dashboard/Users';
import NotFound from './pages/NotFound';
import Settings from './pages/dashboard/Settings';
import Tickets from './pages/dashboard/Tickets';

function PublicLayout() {
  const location = useLocation();

  // Define valid public routes where Navbar and Footer should be shown
  const validPublicRoutes = [
    '/',
    '/about',
    '/contact',
    '/howitworks',
    '/raffles',
  ];

  // Check if the route is valid or matches a dynamic raffle route (e.g., /raffles/:id)
  const isValidRoute =
    validPublicRoutes.includes(location.pathname) ||
    /^\/raffles\/[^/]+$/.test(location.pathname);

  // Explicitly exclude /login and /register from showing Navbar and Footer
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
        <Route path="/raffles" element={<Raffles />} />
        <Route path="/raffles/:id" element={<Raffles />} />
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
        <Route path="/dashboard/completed-raffles" element={<CompletedRaffles />} />
        <Route path="/dashboard/raffles" element={<Raffles />} />
        <Route path="/dashboard/raffles/:id" element={<Raffles />} />
        <Route path="/dashboard/raffles/:id/edit" element={<Raffles />} />
        <Route path="/dashboard/raffles/:id/view" element={<Raffles />} />
        <Route path="/dashboard/raffles/:id/winners" element={<Raffles />} />
        <Route path="/dashboard/raffles/:id/entries" element={<Raffles />} />
        <Route path="/dashboard/raffles/:id/entries/:entryId" element={<Raffles />} />
        <Route path="/dashboard/live-raffles" element={<LiveRaffles />} />
        <Route path="/dashboard/category" element={<Category />} />
        <Route path="/dashboard/category/:id" element={<Category />} />
        <Route path="/dashboard/category/:id/edit" element={<Category />} />
        <Route path="/dashboard/category/:id/view" element={<Category />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/users" element={<Users />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/tickets" element={<Tickets />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="App">
      {isDashboardRoute ? <DashboardLayoutRoutes /> : <PublicLayout />}
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