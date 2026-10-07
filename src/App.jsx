import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Agenda from './pages/Agenda';
import Menus from './pages/Menus';
import Taches from './pages/Taches';
import Famille from './pages/Famille';
import Notes from './pages/Notes';
import Recettes from './pages/Recettes';
import Frigo from './pages/Frigo';
import Calories from './pages/Calories';
import Routines from './pages/Routines';
import Anniversaires from './pages/Anniversaires';
import BienEtre from './pages/BienEtre';
import { FamilyProvider } from './context/FamilyContext';

function Layout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="max-w-md mx-auto px-4 pt-4 pb-16">
        {!isHome && (
          <Link to="/" className="inline-flex items-center gap-1 mb-4 bg-white shadow-sm rounded-full pl-2 pr-4 py-1.5 font-bold text-ink/70 hover:text-ink active:scale-95 transition">
            <ChevronLeft size={18} /> Accueil
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <FamilyProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/menus" element={<Menus />} />
            <Route path="/taches" element={<Taches />} />
            <Route path="/famille" element={<Famille />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/recettes" element={<Recettes />} />
            <Route path="/frigo" element={<Frigo />} />
            <Route path="/calories" element={<Calories />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/anniversaires" element={<Anniversaires />} />
            <Route path="/bien-etre" element={<BienEtre />} />
          </Routes>
        </Layout>
      </Router>
    </FamilyProvider>
  );
}

export default App;
