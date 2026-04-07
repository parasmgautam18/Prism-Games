import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard'; 
import PrismGame from './Games/1st'; 
// Renamed the import to match the new game logic
import VoidMaze from './Games/2nd'; 
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container bg-gray-900 min-h-screen text-white">
        <Routes>
          {/* Main Hub / Home Page */}
          <Route path="/" element={<Dashboard />} />

          {/* Individual Game Routes */}
          <Route path="/prism" element={<PrismGame />} />
          
          {/* Path updated to /void to match the Dashboard link */}
          <Route path="/void" element={<VoidMaze />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;