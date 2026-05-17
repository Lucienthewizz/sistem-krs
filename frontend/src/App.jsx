import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DosenList from './components/DosenList';
import MahasiswaList from './components/MahasiswaList';
import { Users, GraduationCap } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-800 border-b border-dark-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-primary">
          <GraduationCap size={32} />
          <span className="text-xl font-bold tracking-wider uppercase">Sistem KRS</span>
        </div>
        <div className="flex space-x-6">
          <Link
            to="/dosen"
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              isActive('/dosen') ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={20} />
            <span className="font-medium">Data Dosen</span>
          </Link>
          <Link
            to="/mahasiswa"
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              isActive('/mahasiswa') ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <GraduationCap size={20} />
            <span className="font-medium">Data Mahasiswa</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto p-6">
          <Routes>
            <Route path="/" element={<div className="text-center mt-20"><h1 className="text-4xl font-bold text-gray-200 mb-4">Selamat Datang di Sistem KRS</h1><p className="text-gray-400">Silakan pilih menu di atas untuk mengelola data.</p></div>} />
            <Route path="/dosen" element={<DosenList />} />
            <Route path="/mahasiswa" element={<MahasiswaList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
