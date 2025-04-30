import './App.css'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/shared/Footer'
import Navbar from './components/shared/Navbar'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { HowItWorks } from './pages/HowItWorks'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register'];

  return (
    <div className="App">
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/howitworks" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </>
      {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
    </div>
  )
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
