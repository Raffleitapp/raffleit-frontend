import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import Navbar from './components/Navbar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Raffles } from './pages/Raffles';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';

function App() {
  const location = useLocation();

  // Define routes where Navbar and Footer should be hidden
  const hideNavbarFooterRoutes = ['/login', '/register', '/dashboard'];

  const shouldShowNavbarFooter = !hideNavbarFooterRoutes.includes(location.pathname);

  return (
    <div className="App">
      {shouldShowNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/raffles" element={<Raffles />} />
        <Route path="/raffles/:id" element={<Raffles />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* 404 Not Found Route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      {shouldShowNavbarFooter && <Footer />}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
