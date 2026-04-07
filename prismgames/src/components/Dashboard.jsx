import { Link } from 'react-router-dom';
// THE CONFIGURATION: Updated for the Maze Game
const GAMES = [
  {
    id: 'prism-game',
    title: 'Prism Tasks',
    description: 'Test your reflexes and survive the terrors. Tap only when red... or else.',
    path: '/prism',
    color: 'from-red-600 to-red-900',
    tag: 'Reflex'
  },
  {
    id: 'void-maze',
    title: 'Void Maze',
    description: 'Navigate the Tesseract. A contiguous labyrinth of shifting lasers and coiled paths. Don\'t touch the walls.',
    path: '/void', // Make sure this matches your Route path in App.jsx
    color: 'from-blue-600 to-blue-900',
    tag: 'Skill'
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 md:p-16">
      {/* HEADER */}
      <header className="mb-16 text-center">
        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase">
          PRISM<span className="text-red-600">ARCADE</span>
        </h1>
        <p className="text-gray-500 mt-4 tracking-widest uppercase text-sm">
          Select a Game to play
        </p>
      </header>

      {/* DYNAMIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {GAMES.map((game) => (
          <Link 
            key={game.id} 
            to={game.path}
            className="group relative block overflow-hidden rounded-2xl bg-gray-900 border-2 border-gray-800 transition-all duration-300 hover:border-red-600 hover:-translate-y-2 shadow-2xl"
          >
            {/* Visual Background Decor */}
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${game.color} group-hover:opacity-40 transition-opacity`} />
            
            <div className="relative p-8 flex flex-col h-full min-h-[250px]">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full uppercase tracking-tighter">
                  {game.tag}
                </span>
                <div className="text-gray-600 group-hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white group-hover:text-red-500 transition-colors">
                {game.title}
              </h2>
              
              <p className="text-gray-400 mt-4 leading-relaxed">
                {game.description}
              </p>

              <div className="mt-auto pt-6">
                <span className="text-white font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all uppercase text-sm tracking-widest">
                  Launch Game <span className="text-red-600">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* COMING SOON PLACEHOLDER */}
        <div className="border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center min-h-[250px] bg-black/20">
          <p className="text-gray-700 font-bold uppercase tracking-widest">More Tasks Loading...</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-20 text-center text-gray-700 text-xs uppercase tracking-[0.3em]">
        &copy; 2026 Prism Games Inc. // Keep Your Eyes Open.
      </footer>
    </div>
  );
}