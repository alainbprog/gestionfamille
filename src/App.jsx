import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Agenda from './pages/Agenda';
import Taches from './pages/Taches';
import Famille from './pages/Famille';
import { FamilyProvider } from './context/FamilyContext';

function App() {
  return (
    <FamilyProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-800">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 pt-20 pb-24 sm:pb-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/taches" element={<Taches />} />
              <Route path="/famille" element={<Famille />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FamilyProvider>
  );
}

export default App;
