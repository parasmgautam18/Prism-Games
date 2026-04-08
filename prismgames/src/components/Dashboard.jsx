import { Link } from "react-router-dom";

const GAMES = [
  {
    id: "prism-game",
    title: "Prism Tasks",
    description:
      "Refine your reflexes with a precision tap challenge where only red targets score.",
    path: "/prism",
    color: "from-red-600 to-red-900",
    tag: "Reflex",
    image: "/Press.png",
  },
  {
    id: "void-maze",
    title: "Void Maze",
    description:
      "Navigate dynamic laser corridors and avoid every boundary in this timed maze.",
    path: "/void",
    color: "from-blue-600 to-blue-900",
    tag: "Skill",
    image: "/maze.png",
  },
  {
    id: "echo-tiles",
    title: "Echo Tiles",
    description:
      "Memorize the sequence and reproduce it before the pattern fades away.",
    path: "/echo",
    color: "from-purple-600 to-purple-900",
    tag: "Memory",
    image: "/tiles.png",
  },
  {
    id: "typing-words",
    title: "TypingStud",
    description:
      "Type accurately under pressure to score points and extend the countdown timer.",
    path: "/typing",
    color: "from-green-600 to-blue-900",
    tag: "Typing",
    image: "/typingGame.png",
  },
  {
    id: "wood-stack",
    title: "Wood Stack",
    description:
      "Stack moving blocks with precision and build the tallest stable tower.",
    path: "/wood",
    color: "from-yellow-600 to-orange-900",
    tag: "Balance",
    image: "/StackTower.png",
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 md:px-12 md:py-16 text-slate-100">
      <header className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.6em] text-slate-500">
          curated arcade experience
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase tracking-tight text-white md:text-6xl">
          Prism <span className="text-red-600">Arcade</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Discover polished microgames designed for sharp focus, quick
          decision-making, and repeat play.
        </p>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            to={game.path}
            aria-label={`Open ${game.title}`}
            className="group relative flex min-h-[20rem] flex-col overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/95 shadow-2xl transition duration-300 hover:-translate-y-2 hover:border-red-600"
            style={{
              backgroundImage: `url(${game.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className={`pointer-events-none absolute inset-0 opacity-20 bg-gradient-to-br ${game.color} group-hover:opacity-40 transition-opacity`}
            />

            <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-90 transition-opacity" />

            <div className="relative flex flex-1 flex-col p-8">
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded-full bg-red-600 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white">
                  {game.tag}
                </span>
                <div className="text-slate-500 transition-colors group-hover:text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-semibold text-white transition-colors group-hover:text-red-500">
                {game.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {game.description}
              </p>

              <div className="mt-auto pt-8">
                <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-all group-hover:gap-4">
                  Open game
                  <span className="text-red-600">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}

        <div className="flex min-h-[20rem] items-center justify-center rounded-[28px] border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
          <p className="max-w-xs text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            More experiences arriving soon
          </p>
        </div>
      </section>

      <footer className="mt-20 text-center text-xs uppercase tracking-[0.35em] text-slate-600">
        &copy; 2026 Prism Games Inc. All rights reserved.
      </footer>
    </main>
  );
}
