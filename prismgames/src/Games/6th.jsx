import { useState, useEffect, useRef, useCallback } from "react";

const W = 420;
const H = 540;
const TRACK_Y = [H * 0.37, H * 0.63];
const BALL_X = 110;
const BALL_R = 13;
const BASE_SPEED = 4;
const BASE_INTERVAL = 88;

function useAnimationFrame(callback, active) {
  const rafRef = useRef();
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useEffect(() => {
    if (!active) { cancelAnimationFrame(rafRef.current); return; }
    const loop = () => { cbRef.current(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}

function drawBg(ctx, frame, speed) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0d0d1a");
  grad.addColorStop(1, "#0a1628");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // scrolling grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  const offset = (frame * speed * 0.4) % 50;
  for (let x = -50 + (offset % 50); x < W + 50; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawTracks(ctx, frame, speed, ballTrack) {
  TRACK_Y.forEach((ty, i) => {
    const active = i === ballTrack;
    ctx.save();
    ctx.shadowColor = active ? "rgba(80,220,255,0.5)" : "rgba(255,255,255,0.08)";
    ctx.shadowBlur = active ? 14 : 4;
    ctx.strokeStyle = active ? "rgba(80,220,255,0.9)" : "rgba(255,255,255,0.2)";
    ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.setLineDash([16, 10]);
    ctx.lineDashOffset = -((frame * speed * 0.5) % 26);
    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(W, ty); ctx.stroke();
    ctx.restore();
  });
}

function drawBall(ctx, ballY, switchAnim, dead) {
  if (dead) return;
  const x = BALL_X, y = ballY;
  const scale = switchAnim > 0 ? 1 + switchAnim * 0.025 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const grd = ctx.createRadialGradient(-4, -5, 2, 0, 0, BALL_R);
  grd.addColorStop(0, "#a0eeff");
  grd.addColorStop(0.5, "#30b8f0");
  grd.addColorStop(1, "#1060c0");
  ctx.shadowColor = "rgba(60,200,255,0.8)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath(); ctx.arc(-4, -5, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawTriangle(ctx, tri) {
  const ty = TRACK_Y[tri.track];
  const s = tri.size;
  ctx.save();
  ctx.translate(tri.x, ty);
  ctx.shadowColor = "rgba(255,80,60,0.7)";
  ctx.shadowBlur = 16;
  const g = ctx.createLinearGradient(0, -s, 0, 2);
  g.addColorStop(0, "#ff6040");
  g.addColorStop(1, "#c01010");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.62, 2);
  ctx.lineTo(-s * 0.62, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,180,160,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawParticles(ctx, particles) {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export default function RushGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    phase: "idle",
    ballTrack: 0,
    ballY: TRACK_Y[0],
    ballTargetY: TRACK_Y[0],
    score: 0,
    frame: 0,
    speed: BASE_SPEED,
    triInterval: BASE_INTERVAL,
    triangles: [],
    particles: [],
    switchAnim: 0,
    dead: false,
  });
  const [phase, setPhase] = useState("idle"); // idle | playing | dead
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.phase = "playing";
    s.ballTrack = 0;
    s.ballY = TRACK_Y[0];
    s.ballTargetY = TRACK_Y[0];
    s.score = 0;
    s.frame = 0;
    s.speed = BASE_SPEED;
    s.triInterval = BASE_INTERVAL;
    s.triangles = [];
    s.particles = [];
    s.switchAnim = 0;
    s.dead = false;
    setScore(0);
    setPhase("playing");
  }, []);

  const handleSwitch = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "playing") return;
    s.ballTrack = 1 - s.ballTrack;
    s.ballTargetY = TRACK_Y[s.ballTrack];
    s.switchAnim = 10;
  }, []);

  const spawnParticles = (x, y) => {
    const s = stateRef.current;
    const colors = ["#f85", "#fc5", "#f55", "#ff9", "#f44", "#fa0"];
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2.5 + Math.random() * 5;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        r: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  const checkCollision = (triangles, ballY) => {
    for (const tri of triangles) {
      const ty = TRACK_Y[tri.track];
      const dx = tri.x - BALL_X;
      const dy = ty - ballY;
      if (Math.abs(dx) < tri.size * 0.52 + BALL_R * 0.65 &&
          Math.abs(dy) < tri.size * 0.65 + BALL_R * 0.65) return true;
    }
    return false;
  };

  useAnimationFrame(() => {
    const s = stateRef.current;
    if (s.phase !== "playing") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      drawBg(ctx, s.frame, BASE_SPEED);
      drawTracks(ctx, s.frame, BASE_SPEED, s.ballTrack);
      drawParticles(ctx, s.particles);
      if (!s.dead) drawBall(ctx, s.ballY, 0, false);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.03;
      });
      s.particles = s.particles.filter(p => p.life > 0);
      return;
    }

    s.frame++;

    // progressive speed: increase every 5 points
    s.speed = BASE_SPEED + Math.floor(s.score / 5) * 0.35;

    // spawn triangles, interval tightens with score
    const interval = Math.max(32, BASE_INTERVAL - Math.floor(s.score / 3) * 4);
    if (s.frame % interval === 0) {
      const track = Math.floor(Math.random() * 2);
      const size = 20 + Math.random() * 18;
      s.triangles.push({ x: W + 50, track, size, scored: false });
    }

    // move ball
    s.ballY += (s.ballTargetY - s.ballY) * 0.18;
    if (s.switchAnim > 0) s.switchAnim--;

    // move triangles
    s.triangles.forEach(t => { t.x -= s.speed; });
    s.triangles.forEach(t => {
      if (!t.scored && t.x + t.size < BALL_X - BALL_R) {
        t.scored = true;
        s.score++;
        setScore(s.score);
      }
    });
    s.triangles = s.triangles.filter(t => t.x > -80);

    // particles
    s.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.03;
    });
    s.particles = s.particles.filter(p => p.life > 0);

    // collision
    if (checkCollision(s.triangles, s.ballY)) {
      spawnParticles(BALL_X, s.ballY);
      s.dead = true;
      s.phase = "dead";
      setBestScore(prev => Math.max(prev, s.score));
      setTimeout(() => setPhase("dead"), 700);
    }

    // draw
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, s.frame, s.speed);
    drawTracks(ctx, s.frame, s.speed, s.ballTrack);
    s.triangles.forEach(t => drawTriangle(ctx, t));
    drawParticles(ctx, s.particles);
    drawBall(ctx, s.ballY, s.switchAnim, s.dead);
  }, true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080812",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
        padding: "16px",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        marginBottom: "14px", width: "100%", maxWidth: W,
      }}>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "10px 16px",
          textAlign: "center",
        }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "2px", marginBottom: "4px" }}>SCORE</div>
          <div style={{
            color: "#50dcff",
            fontSize: "32px",
            fontWeight: "bold",
            lineHeight: 1,
            textShadow: "0 0 16px rgba(80,220,255,0.6)",
            transition: "all 0.1s",
          }}>{score}</div>
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "10px 16px",
          textAlign: "center",
        }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "2px", marginBottom: "4px" }}>BEST</div>
          <div style={{
            color: "#ffcc44",
            fontSize: "32px",
            fontWeight: "bold",
            lineHeight: 1,
            textShadow: "0 0 16px rgba(255,200,60,0.5)",
          }}>{bestScore}</div>
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "10px 16px",
          textAlign: "center",
        }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "2px", marginBottom: "4px" }}>SPEED</div>
          <div style={{
            color: "#ff6644",
            fontSize: "20px",
            fontWeight: "bold",
            lineHeight: 1.6,
            textShadow: "0 0 12px rgba(255,100,60,0.5)",
          }}>{(BASE_SPEED + Math.floor(score / 5) * 0.35).toFixed(1)}x</div>
        </div>
      </div>

      {/* Canvas wrapper */}
      <div
        onClick={phase === "playing" ? handleSwitch : undefined}
        onTouchStart={phase === "playing" ? (e) => { e.preventDefault(); handleSwitch(); } : undefined}
        style={{
          position: "relative",
          cursor: phase === "playing" ? "pointer" : "default",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 40px rgba(80,150,255,0.12), 0 0 80px rgba(0,0,0,0.5)",
          maxWidth: W,
          width: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", width: "100%", touchAction: "none" }}
        />

        {/* Idle overlay */}
        {phase === "idle" && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(8,8,18,0.85)",
          }}>
            <div style={{
              fontSize: "52px", fontWeight: "900", color: "#50dcff",
              letterSpacing: "8px",
              textShadow: "0 0 30px rgba(80,220,255,0.8), 0 0 60px rgba(80,220,255,0.4)",
              marginBottom: "8px",
            }}>RUSH</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", letterSpacing: "2px", marginBottom: "36px" }}>
              TAP TO SWITCH TRACKS
            </div>
            <button
              onClick={startGame}
              style={{
                background: "#50dcff",
                color: "#080812",
                border: "none",
                borderRadius: "10px",
                padding: "12px 36px",
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "2px",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(80,220,255,0.5)",
                transition: "transform 0.1s",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; startGame(); }}
            >
              PLAY
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {phase === "dead" && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(8,8,18,0.88)",
          }}>
            <div style={{
              fontSize: "30px", fontWeight: "900", color: "#ff5540",
              letterSpacing: "4px",
              textShadow: "0 0 20px rgba(255,80,60,0.7)",
              marginBottom: "20px",
            }}>GAME OVER</div>
            <div style={{ marginBottom: "6px" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "2px" }}>SCORE  </span>
              <span style={{ color: "#50dcff", fontSize: "36px", fontWeight: "bold", textShadow: "0 0 14px rgba(80,220,255,0.5)" }}>{score}</span>
            </div>
            {score >= bestScore && score > 0 && (
              <div style={{
                color: "#ffcc44", fontSize: "12px", letterSpacing: "2px",
                marginBottom: "24px", textShadow: "0 0 10px rgba(255,200,60,0.5)",
              }}>★ NEW BEST ★</div>
            )}
            {!(score >= bestScore && score > 0) && <div style={{ marginBottom: "24px" }} />}
            <button
              onClick={startGame}
              style={{
                background: "transparent",
                color: "#50dcff",
                border: "2px solid #50dcff",
                borderRadius: "10px",
                padding: "10px 32px",
                fontSize: "15px",
                fontWeight: "bold",
                letterSpacing: "2px",
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(80,220,255,0.25)",
              }}
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <div style={{
        marginTop: "14px",
        color: "rgba(255,255,255,0.2)",
        fontSize: "11px",
        letterSpacing: "2px",
        textAlign: "center",
      }}>
        CLICK OR TAP TO SWITCH TRACKS
      </div>
    </div>
  );
}
