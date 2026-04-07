import { useState, useEffect, useRef } from "react";

const PLAYER_RADIUS = 10;
const SPEED = 4.8; 

const TESSERACT_MAPS = [
  {
    id: 0,
    title: "Sector 01: The Serpent",
    start: { x: 50, y: 200 },
    walls: [
      { x: 0, y: 0, w: 300, h: 150 },    { x: 0, y: 250, w: 500, h: 150 },
      { x: 400, y: 0, w: 400, h: 150 },  { x: 600, y: 250, w: 200, h: 150 },
    ],
    exits: [{ x: 740, y: 200, targetMap: 1 }]
  },
  {
    id: 1,
    title: "Sector 02: Laser Grid",
    start: { x: 40, y: 200 },
    walls: [{ x: 0, y: 0, w: 800, h: 20 }, { x: 0, y: 380, w: 800, h: 20 }],
    phaseWalls: [
      { id: 'g1', x: 200, y: 20, w: 15, h: 360, delay: 0, cycle: 2000 },
      { id: 'g2', x: 400, y: 20, w: 15, h: 360, delay: 1000, cycle: 2000 },
      { id: 'g3', x: 600, y: 20, w: 15, h: 360, delay: 0, cycle: 2000 },
    ],
    exits: [{ x: 750, y: 200, targetMap: 2 }]
  },
  {
    id: 2,
    title: "Sector 03: The Coiled Void",
    // PREVIOUSLY LEVEL 4: The Spiral
    start: { x: 40, y: 60 },
    walls: [
      { x: 0, y: 0, w: 800, h: 30 },
      { x: 0, y: 370, w: 800, h: 30 },
      { x: 0, y: 30, w: 30, h: 340 },
      { x: 770, y: 30, w: 30, h: 340 },
      { x: 30, y: 100, w: 650, h: 30 },
      { x: 680, y: 100, w: 30, h: 200 },
      { x: 100, y: 270, w: 610, h: 30 },
      { x: 100, y: 170, w: 30, h: 100 },
      { x: 130, y: 170, w: 450, h: 30 },
    ],
    exits: [{ x: 350, y: 220, targetMap: 3 }] 
  },
  {
    id: 3,
    title: "Sector 04: High Frequency",
    // PREVIOUSLY LEVEL 3: Fast Lasers
    start: { x: 40, y: 200 },
    walls: [{ x: 0, y: 0, w: 800, h: 20 }, { x: 0, y: 380, w: 800, h: 20 }],
    phaseWalls: [
      { id: 'f1', x: 150, y: 20, w: 12, h: 360, delay: 0, cycle: 1200 },
      { id: 'f2', x: 300, y: 20, w: 12, h: 360, delay: 400, cycle: 1200 },
      { id: 'f3', x: 450, y: 20, w: 12, h: 360, delay: 800, cycle: 1200 },
      { id: 'f4', x: 600, y: 20, w: 12, h: 360, delay: 0, cycle: 1200 },
    ],
    exits: [{ x: 750, y: 200, targetMap: 4 }]
  },
  {
    id: 4,
    title: "Sector 05: DEADLOCK",
    start: { x: 40, y: 200 },
    walls: [{ x: 0, y: 0, w: 800, h: 40 }, { x: 0, y: 360, w: 800, h: 40 }],
    phaseWalls: [
      { id: 'd1', x: 180, y: 40, w: 25, h: 320, delay: 0, cycle: 800 },
      { id: 'd2', x: 300, y: 40, w: 25, h: 320, delay: 200, cycle: 800 },
      { id: 'd3', x: 420, y: 40, w: 25, h: 320, delay: 400, cycle: 800 },
      { id: 'd4', x: 540, y: 40, w: 25, h: 320, delay: 600, cycle: 800 },
      { id: 'd5', x: 660, y: 40, w: 25, h: 320, delay: 0, cycle: 800 },
    ],
    exits: [{ x: 760, y: 200, isWin: true }]
  }
];

export default function TesseractMaze() {
  const [activeMap, setActiveMap] = useState(0);
  const [gameState, setGameState] = useState("start");
  const [visualPos, setVisualPos] = useState(TESSERACT_MAPS[0].start);
  const [phases, setPhases] = useState({});

  const posRef = useRef(TESSERACT_MAPS[0].start);
  const keysRef = useRef({});
  const requestRef = useRef();

  const checkCollision = (x, y, mapIdx, currentPhases) => {
    const map = TESSERACT_MAPS[mapIdx];
    for (const w of map.walls) {
      const dx = x - Math.max(w.x, Math.min(x, w.x + w.w));
      const dy = y - Math.max(w.y, Math.min(y, w.y + w.h));
      if ((dx * dx + dy * dy) < (PLAYER_RADIUS * PLAYER_RADIUS - 0.5)) return true;
    }
    if (map.phaseWalls) {
      for (const pw of map.phaseWalls) {
        if (currentPhases[pw.id]) {
          const dx = x - Math.max(pw.x, Math.min(x, pw.x + pw.w));
          const dy = y - Math.max(pw.y, Math.min(y, pw.y + pw.h));
          if ((dx * dx + dy * dy) < (PLAYER_RADIUS * PLAYER_RADIUS - 0.5)) return true;
        }
      }
    }
    return false;
  };

  const gameLoop = (time) => {
    if (gameState !== "playing") return;
    const map = TESSERACT_MAPS[activeMap];
    const newPhases = {};
    if (map.phaseWalls) {
      map.phaseWalls.forEach(pw => {
        newPhases[pw.id] = ((time + pw.delay) % pw.cycle) < (pw.cycle * 0.5);
      });
      setPhases(newPhases);
    }

    let dx = 0; let dy = 0;
    if (keysRef.current["ArrowUp"]) dy -= SPEED;
    if (keysRef.current["ArrowDown"]) dy += SPEED;
    if (keysRef.current["ArrowLeft"]) dx -= SPEED;
    if (keysRef.current["ArrowRight"]) dx += SPEED;

    if (dx !== 0 || dy !== 0) {
      const nextX = posRef.current.x + dx;
      const nextY = posRef.current.y + dy;
      if (checkCollision(nextX, nextY, activeMap, newPhases)) {
        setGameState("lost");
        return;
      }
      if (nextX > 10 && nextX < 790 && nextY > 10 && nextY < 390) {
        posRef.current = { x: nextX, y: nextY };
        setVisualPos({ x: nextX, y: nextY });
      }
    }

    for (const ex of map.exits) {
      if (Math.hypot(posRef.current.x - ex.x, posRef.current.y - ex.y) < 25) {
        if (ex.isWin) {
          setGameState("won");
        } else {
          setGameState("warp");
          setTimeout(() => {
            setActiveMap(ex.targetMap);
            posRef.current = TESSERACT_MAPS[ex.targetMap].start;
            setVisualPos(TESSERACT_MAPS[ex.targetMap].start);
            setGameState("playing");
          }, 800);
        }
        return;
      }
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === "playing") requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, activeMap]);

  useEffect(() => {
    const handleKey = (e, val) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = val;
      }
    };
    window.addEventListener("keydown", (e) => handleKey(e, true));
    window.addEventListener("keyup", (e) => handleKey(e, false));
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-white select-none">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-black italic text-blue-500 uppercase tracking-tighter">
          VOID<span className="text-white">_TESSERACT</span>
        </h1>
        <div className="flex gap-2 justify-center mt-2">
          {TESSERACT_MAPS.map((_, i) => (
            <div key={i} className={`h-1 w-8 ${i <= activeMap ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>

      <div className="relative w-200 h-100 bg-zinc-950 border-4 border-zinc-900 overflow-hidden shadow-2xl">
        {TESSERACT_MAPS[activeMap].walls.map((w, i) => (
          <div key={i} className="absolute bg-zinc-900 border border-zinc-800" style={{ left: w.x, top: w.y, width: w.w, height: w.h }} />
        ))}

        {TESSERACT_MAPS[activeMap].phaseWalls?.map((pw, i) => (
          <div key={i} 
               className={`absolute transition-all duration-75 ${phases[pw.id] ? 'bg-red-600 shadow-[0_0_15px_red]' : 'bg-blue-500/10 opacity-10'}`} 
               style={{ left: pw.x, top: pw.y, width: pw.w, height: pw.h }} />
        ))}

        {TESSERACT_MAPS[activeMap].exits.map((ex, i) => (
          <div key={i} className="absolute w-12 h-12 rounded-full border border-white/20 flex items-center justify-center" style={{ left: ex.x - 24, top: ex.y - 24 }}>
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        ))}

        <div className="absolute rounded-full z-50 bg-white shadow-[0_0_20px_white]" style={{ left: visualPos.x - 10, top: visualPos.y - 10, width: 20, height: 20 }} />

        {gameState === "start" && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-100">
            <button onClick={() => setGameState("playing")} className="px-12 py-4 bg-blue-600 text-white font-black text-2xl uppercase border-b-4 border-blue-900 active:border-0 transition-all">IGNITE DRIVE</button>
          </div>
        )}

        {gameState === "lost" && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-100 animate-pulse">
            <h2 className="text-7xl font-black mb-8 italic text-red-500 tracking-tighter uppercase">TERMINATED</h2>
            <button onClick={() => { setGameState("playing"); posRef.current = TESSERACT_MAPS[activeMap].start; setVisualPos(TESSERACT_MAPS[activeMap].start); keysRef.current = {}; }} className="px-10 py-3 bg-white text-black font-bold uppercase tracking-widest">Retry Sector</button>
          </div>
        )}

        {gameState === "warp" && (
          <div className="absolute inset-0 bg-blue-600 flex items-center justify-center z-100">
            <h2 className="text-4xl font-black text-white italic animate-ping uppercase tracking-[0.5em]">Jumping...</h2>
          </div>
        )}

        {gameState === "won" && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-100 text-black text-center p-10">
            <h2 className="text-8xl font-black italic mb-4 uppercase">Liberated</h2>
            <button onClick={() => window.location.href = "/"} className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest">Return to Hub</button>
          </div>
        )}
      </div>
      <div className="mt-8 text-zinc-700 text-[10px] tracking-[0.6em] uppercase">Status: [ Manual_Drive ] // Threat: [ Coiled_Void ]</div>
    </div>
  );
}