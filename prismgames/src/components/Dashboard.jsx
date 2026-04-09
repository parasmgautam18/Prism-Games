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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GAMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-12 text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]" />

      <header className="relative z-10 mb-20 text-center">
        <h1 className="text-6xl font-black uppercase tracking-tighter text-white md:text-8xl italic scale-x-95">
          PRISM <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">ARCADE</span>
        </h1>
        <div className="mt-4 flex justify-center gap-1.5">
          {GAMES.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? "w-12 bg-cyan-400" : "w-4 bg-slate-800"}`} />
          ))}
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={game.id}
              to={game.path}
              onMouseEnter={() => setActiveIndex(index)}
              className={`
                group relative flex min-h-[18rem] flex-col rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${isActive 
                  ? "border-cyan-400 bg-slate-800 shadow-[0_0_20px_rgba(34,211,238,0.2)] translate-y-[-4px]" 
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:translate-y-[-2px]"
                }
              `}
            >
              {/* Image Layer - Optimized Contrast */}
              <div className="absolute inset-0 z-0 bg-slate-950">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className={`h-full w-full object-cover transition-transform duration-700 ${isActive ? 'scale-105 opacity-60' : 'opacity-50 grayscale-[0.1]'}`}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x300/1e293b/ffffff?text=LOGO"; }}
                />
              </div>

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent z-10" />

              <div className="relative flex flex-1 flex-col p-8 z-20">
                <div className="flex justify-between items-center mb-4">
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isActive ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {game.tag}
                  </span>
                  {isActive && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />}
                </div>

                <h2 className={`text-3xl font-black uppercase tracking-tighter italic ${isActive ? "text-cyan-400" : "text-white"}`}>
                  {game.title}
                </h2>

                <p className="mt-3 text-sm text-slate-200 line-clamp-2 leading-relaxed opacity-95">
                  {game.description}
                </p>

                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${isActive ? "text-cyan-400" : "text-slate-500"}`}>
                    {isActive ? "READY_TO_PLAY" : "SELECT_GAME"}
                  </span>
                  <div className={`h-1 transition-all duration-500 ${isActive ? "bg-cyan-400 w-16" : "bg-slate-800 w-12"}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="relative z-10 mt-24 text-center">
        <div className="inline-block py-4 border-t border-slate-900 w-full max-w-xs">
          <p className="text-[10px] uppercase font-mono tracking-[0.5em] text-slate-500">
            &copy; 2026 Prism Games Inc // Systems_Online
          </p>
        </div>
      </footer>
    </main>
  );
}