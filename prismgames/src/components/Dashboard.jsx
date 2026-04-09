import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const GAMES = [
  { id: "prism", title: "Prism Tasks", description: "Refine your reflexes with a precision tap challenge.", path: "/prism", tag: "Reflex", image: "/Press.png" },
  { id: "void", title: "Void Maze", description: "Navigate dynamic laser corridors and avoid boundaries.", path: "/void", tag: "Skill", image: "/maze.png" },
  { id: "echo", title: "Echo Tiles", description: "Memorize the sequence and reproduce the pattern.", path: "/echo", tag: "Memory", image: "/tiles.png" },
  { id: "typing", title: "TypingStud", description: "Type accurately under pressure to score points.", path: "/typing", tag: "Typing", image: "/typingGame.png" },
  { id: "wood", title: "Wood Stack", description: "Stack moving blocks with precision for stability.", path: "/wood", tag: "Balance", image: "/StackTower.png" },
  { id: "ball", title: "Ball Switch", description: "Switch the ball between tracks to avoid spikes.", path: "/ball", tag: "Switch", image: "/ball.png" }
];

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle focus every 4 seconds, but mouse hover will override it
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GAMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-12 text-slate-100 selection:bg-red-500/30">
      <header className="mb-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.6em] text-red-500/80 animate-pulse mb-4">
          Neural Interface: Select Protocol
        </p>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white md:text-7xl italic">
          PRISM <span className="text-red-600">ARCADE</span>
        </h1>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={game.id}
              to={game.path}
              // REINSTATED: Hover logic for instant selection
              onMouseEnter={() => setActiveIndex(index)}
              className={`
                group relative flex min-h-[22rem] flex-col overflow-hidden rounded-[32px] border-2 transition-all duration-500
                ${isActive 
                  ? "scale-[1.05] border-red-600 shadow-[0_0_50px_-10px_rgba(220,38,38,0.6)] z-10 cursor-pointer" 
                  : "border-slate-800 opacity-80 cursor-pointer"
                }
              `}
            >
              {/* Game Logo - Always Visible with high contrast logic */}
              <div className="absolute inset-0 z-0 bg-slate-900">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className={`h-full w-full object-cover transition-all duration-1000 ${isActive ? 'scale-110 opacity-60 grayscale-0' : 'opacity-50 grayscale hover:grayscale-0'}`}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x600/0f172a/ef4444?text=PRISM"; }}
                />
              </div>

              {/* Scanline Effect */}
              {isActive && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-red-500 shadow-[0_0_20px_red] animate-scanline" />
                </div>
              )}

              {/* Scrim Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent transition-opacity duration-700 ${isActive ? "opacity-80" : "opacity-90"}`} />
              
              <div className="relative flex flex-1 flex-col p-8 z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {game.tag}
                  </span>
                  {isActive && <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_red] animate-ping" />}
                </div>

                <h2 className={`text-3xl font-black uppercase tracking-tighter transition-colors duration-500 ${isActive ? "text-white" : "text-slate-500"}`}>
                  {game.title}
                </h2>

                <p className={`mt-4 text-sm leading-relaxed text-slate-200 transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  {game.description}
                </p>

                <div className="mt-auto pt-8">
                  <div className={`flex items-center gap-3 text-xs font-black uppercase tracking-[0.4em] transition-all duration-700 ${isActive ? "text-red-500 translate-x-0 opacity-100" : "text-slate-800 -translate-x-4 opacity-0"}`}>
                    Initialize Connection →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="mt-24 text-center">
        <div className="inline-block py-2 px-6 border-t border-slate-900">
           <p className="text-[10px] uppercase tracking-[0.5em] text-slate-600">
            &copy; 2026 Prism Games Inc // All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}