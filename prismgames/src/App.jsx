import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PrismGame from './Games/1st';
import VoidMaze from './Games/2nd';
import EchoTiles from './Games/3rd'; // NEW IMPORT

function App() {
  return (
    <Router>
      <div className="app-container bg-gray-900 min-h-screen text-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prism" element={<PrismGame />} />
          <Route path="/void" element={<VoidMaze />} />
          <Route path="/echo" element={<EchoTiles />} /> {/* NEW ROUTE */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;