import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Footer } from './components/shared/Footer';
import Navbar from './components/shared/Navbar';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Raffles } from './pages/Raffles';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Users } from './pages/dashboard/Users';
import { Analytics } from './pages/dashboard/Analytics';
import { Settings } from './pages/dashboard/Settings';
import { Reports } from './pages/dashboard/Reports';
import { Raffles as DashboardRaffles } from './pages/dashboard/DashboardRaffles';

function App() {
  const location = useLocation();
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/howitworks',
    '/raffles',
  ];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="App">
      {isPublicRoute && <Navbar />}
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/raffles" element={<Raffles />} />
        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={<DashboardLayout />}
              allowedRoles={['host', 'admin']}
            />
          }
        >
          <Route index element={<DashboardHome />} />
          <Route
            path="raffles"
            element={
              <ProtectedRoute
                element={<DashboardRaffles />}
                allowedRoles={['host', 'admin']}
              />
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute element={<Users />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute element={<Analytics />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute element={<Settings />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute element={<Reports />} allowedRoles={['admin']} />
            }
          />
        </Route>
        {/* 404 Route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      {isPublicRoute && <Footer />}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
}