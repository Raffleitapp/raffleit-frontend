import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Footer } from './components/shared/Footer'
import Navbar from './components/shared/Navbar'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { HowItWorks } from './pages/HowItWorks'

function App() {

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/howitworks" element={<HowItWorks />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
