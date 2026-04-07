import { useEffect, useRef, useCallback, useState } from 'react';
import './5th.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CANVAS_W      = 420;
const CANVAS_H      = 700;
const BLOCK_H       = 44;          // height of each stacked block
const BLOCK_START_W = 280;         // starting block width
const MIN_BLOCK_W   = 40;
const BIRD_W        = 52;
const BIRD_H        = 52;
const PERFECT_TOL   = 16;          // px tolerance for perfect alignment
const HIT_MIN       = 10;          // min overlap px to survive
const BASE_SPEED    = 2.8;
const SPEED_INC     = 0.13;
const MAX_SPEED     = 10;
const JUMP_H        = 90;
const JUMP_MS       = 380;
const AUTO_FALL_MS  = 3000;

// Fixed screen positions
const BIRD_TOP_Y    = CANVAS_H / 2 - BIRD_H;   // bird top on screen
const BIRD_FEET_Y   = BIRD_TOP_Y + BIRD_H;      // bird feet on screen
const BLOCK_SCREEN_Y = BIRD_FEET_Y;             // incoming block top = bird feet

// Color palette for blocks — cycles through levels
const BLOCK_COLORS = [
  { top: '#6ee7f7', side: '#29b6d4', dark: '#1a8fa8' },
  { top: '#f7c96e', side: '#e8a020', dark: '#b87a10' },
  { top: '#a8f76e', side: '#5cc928', dark: '#3d9a18' },
  { top: '#f76e9a', side: '#e02060', dark: '#a81045' },
  { top: '#c96ef7', side: '#9020e0', dark: '#6010a8' },
  { top: '#f7956e', side: '#e05520', dark: '#a83510' },
  { top: '#6ef7c9', side: '#20e08a', dark: '#10a860' },
  { top: '#f7f06e', side: '#d4c020', dark: '#a09010' },
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi)  { return Math.max(lo, Math.min(hi, v)); }
function w2s(worldY, camY) { return (worldY - camY) + BIRD_FEET_Y; }

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
function makeState() {
  return {
    phase: 'start',
    score: 0, lives: 3, best: 0,
    cameraY: 0,

    // tower: array of { x, worldY, w, colorIdx }
    tower: [{ x: (CANVAS_W - BLOCK_START_W) / 2, worldY: 0, w: BLOCK_START_W, colorIdx: 0 }],

    movingBlock: null,
    secondBlock: null,

    birdWorldY:    0,
    birdX:         CANVAS_W / 2 - BIRD_W / 2,
    jumpActive:    false,
    jumpStartTime: 0,
    jumpVisualOff: 0,
    jumpTargetWY:  0,

    scrolling:     false,
    scrollTargetY: 0,

    birdFalling:   false,
    birdFallStart: 0,

    particles: [],
    popups:    [],
    showPerfect: false,
    speedLevel:  0,
    colorIdx:    0,
  };
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Game() {
  const S        = useRef(makeState());
  const rafRef   = useRef(null);
  const lastT    = useRef(null);
  const bestRef  = useRef(0);
  const [, tick] = useState(0);
  const redraw   = useCallback(() => tick(n => n + 1), []);

  // ── spawn block ──────────────────────────────────────────────────────────
  const spawnBlock = useCallback((asSecond = false) => {
    const s        = S.current;
    const top      = s.tower[s.tower.length - 1];
    const w        = Math.max(MIN_BLOCK_W, top.w - randInt(12, 28));
    const fromLeft = Math.random() < 0.5;
    const spd      = clamp(BASE_SPEED + s.speedLevel * SPEED_INC, BASE_SPEED, MAX_SPEED);
    const colorIdx = (s.colorIdx + 1) % BLOCK_COLORS.length;
    const worldY   = BLOCK_SCREEN_Y - BIRD_FEET_Y + s.cameraY;

    const block = {
      id:        Date.now() + Math.random(),
      x:         fromLeft ? -w : CANVAS_W,
      worldY,
      w,
      speed:     fromLeft ? spd : -spd,
      colorIdx,
      spawnTime: performance.now(),
    };

    if (asSecond) {
      s.secondBlock = block;
    } else {
      s.colorIdx  = colorIdx;
      s.movingBlock = block;
      if (Math.random() < 0.3) {
        setTimeout(() => {
          const cur = S.current;
          if (cur.phase === 'playing' && !cur.secondBlock && cur.movingBlock) {
            spawnBlock(true);
            redraw();
          }
        }, 800 + Math.random() * 600);
      }
    }
  }, [redraw]);

  // ── bird fall ────────────────────────────────────────────────────────────
  const triggerFall = useCallback(() => {
    const s = S.current;
    if (s.phase !== 'playing') return;
    s.lives       -= 1;
    s.movingBlock  = null;
    s.secondBlock  = null;
    s.birdFalling  = true;
    s.birdFallStart = performance.now();
    s.phase        = 'birdFalling';

    setTimeout(() => {
      const st = S.current;
      st.birdFalling = false;
      if (st.lives <= 0) {
        st.phase = 'gameover';
        st.best  = Math.max(st.best, st.score);
        bestRef.current = st.best;
      } else {
        const top     = st.tower[st.tower.length - 1];
        st.birdWorldY = top.worldY;
        st.birdX      = top.x + top.w / 2 - BIRD_W / 2;
        st.phase      = 'playing';
        spawnBlock();
      }
      redraw();
    }, 950);
    redraw();
  }, [spawnBlock, redraw]);

  // ── tap / place block ────────────────────────────────────────────────────
  const doPlace = useCallback(() => {
    const s = S.current;
    if (s.phase !== 'playing' || s.jumpActive || s.scrolling || !s.movingBlock) return;

    const mb  = s.movingBlock;
    const top = s.tower[s.tower.length - 1];

    const oL   = Math.max(mb.x, top.x);
    const oR   = Math.min(mb.x + mb.w, top.x + top.w);
    const over = oR - oL;

    // Particles
    fireParticles(mb.x + mb.w / 2, BLOCK_SCREEN_Y + BLOCK_H / 2, BLOCK_COLORS[mb.colorIdx].top);

    if (over < HIT_MIN) {
      triggerFall();
      return;
    }

    const perfect = Math.abs(mb.x - top.x) < PERFECT_TOL && Math.abs(over - top.w) < PERFECT_TOL;
    const pts     = perfect ? 3 : 1;
    s.score      += pts;

    const px       = perfect ? top.x : oL;
    const pw       = perfect ? top.w : over;
    const newWY    = top.worldY - BLOCK_H;
    s.tower.push({ x: px, worldY: newWY, w: pw, colorIdx: mb.colorIdx });

    if (perfect) {
      s.showPerfect = true;
      setTimeout(() => { S.current.showPerfect = false; redraw(); }, 700);
    }

    const pid = Date.now() + Math.random();
    s.popups.push({ id: pid, x: mb.x + mb.w / 2, y: BLOCK_SCREEN_Y - 10, pts, perfect });
    setTimeout(() => {
      S.current.popups = S.current.popups.filter(p => p.id !== pid);
      redraw();
    }, 1100);

    s.movingBlock = s.secondBlock || null;
    s.secondBlock = null;
    s.speedLevel  = Math.min(s.speedLevel + 1, Math.floor((MAX_SPEED - BASE_SPEED) / SPEED_INC));

    s.jumpActive    = true;
    s.jumpStartTime = performance.now();
    s.jumpTargetWY  = newWY;

    redraw();
  }, [triggerFall, redraw]);

  // ── particles ─────────────────────────────────────────────────────────────
  const fireParticles = (cx, cy, color) => {
    const s = S.current;
    for (let i = 0; i < 8; i++) {
      const a  = (i / 8) * Math.PI * 2;
      const d  = randInt(20, 55);
      const id = Date.now() + i + Math.random();
      s.particles.push({ id, cx, cy, color, tx: Math.cos(a)*d, ty: Math.sin(a)*d - 18 });
      setTimeout(() => {
        S.current.particles = S.current.particles.filter(p => p.id !== id);
      }, 750);
    }
  };

  // ── RAF loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = (ts) => {
      if (!lastT.current) lastT.current = ts;
      const dt = Math.min(ts - lastT.current, 50);
      lastT.current = ts;
      const s = S.current;

      if (s.phase === 'playing') {
        const moveBlock = (b) => {
          if (!b) return;
          b.x += b.speed * (dt / 16.67);
          if (b.x + b.w > CANVAS_W) { b.x = CANVAS_W - b.w; b.speed = -Math.abs(b.speed); }
          if (b.x < 0)              { b.x = 0;               b.speed =  Math.abs(b.speed); }
          b.worldY = BLOCK_SCREEN_Y - BIRD_FEET_Y + s.cameraY;
          if (ts - b.spawnTime > AUTO_FALL_MS && b === s.movingBlock) {
            triggerFall();
          }
        };
        moveBlock(s.movingBlock);
        moveBlock(s.secondBlock);

        if (s.jumpActive) {
          const t = clamp((ts - s.jumpStartTime) / JUMP_MS, 0, 1);
          s.jumpVisualOff = -JUMP_H * Math.sin(Math.PI * t);
          if (t >= 1) {
            s.jumpActive    = false;
            s.jumpVisualOff = 0;
            s.birdWorldY    = s.jumpTargetWY;
            const newTop    = s.tower[s.tower.length - 1];
            s.birdX         = newTop.x + newTop.w / 2 - BIRD_W / 2;
            s.scrolling     = true;
            s.scrollTargetY = s.jumpTargetWY;
          }
        }

        if (s.scrolling && !s.jumpActive) {
          const diff = s.scrollTargetY - s.cameraY;
          if (Math.abs(diff) < 1.5) {
            s.cameraY   = s.scrollTargetY;
            s.scrolling = false;
            if (!s.movingBlock) spawnBlock();
          } else {
            s.cameraY += diff * 0.13;
          }
        }

        tick(n => n + 1);
      }

      if (s.phase === 'birdFalling') tick(n => n + 1);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnBlock, triggerFall]);

  // ── input ─────────────────────────────────────────────────────────────────
  const onInput = useCallback(() => {
    const s = S.current;
    if (s.phase === 'start') { s.phase = 'playing'; spawnBlock(); redraw(); }
    else if (s.phase === 'playing') doPlace();
  }, [spawnBlock, doPlace, redraw]);

  const onRestart = useCallback(() => {
    const ns = makeState();
    ns.best = bestRef.current;
    ns.phase = 'playing';
    S.current = ns;
    spawnBlock();
    redraw();
  }, [spawnBlock, redraw]);

  // ── static stars ──────────────────────────────────────────────────────────
  const stars = useRef(Array.from({ length: 38 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*70,
    size: Math.random()*2+0.5,
    dur: (Math.random()*3+1.5).toFixed(1),
    delay: (Math.random()*3).toFixed(1),
  }))).current;

  // ── render ────────────────────────────────────────────────────────────────
  const s    = S.current;
  const cam  = s.cameraY;
  const bScrY = BIRD_TOP_Y + (s.jumpActive ? s.jumpVisualOff : 0);
  const fallAge = s.birdFalling ? clamp((performance.now() - s.birdFallStart)/950, 0, 1) : 0;

  const MAX_DOTS = 8;
  const activeDots = Math.min(MAX_DOTS, Math.floor(s.speedLevel / 2) + 1);

  return (
    <div
      className="gw"
      onMouseDown={onInput}
      onTouchStart={e => { e.preventDefault(); onInput(); }}
    >
      {/* Sky */}
      <div className="sky" />

      {/* Stars */}
      <div className="stars">
        {stars.map(st => (
          <div key={st.id} className="star" style={{
            left:`${st.x}%`, top:`${st.y}%`,
            width: st.size, height: st.size,
            '--dur': `${st.dur}s`, '--delay': `-${st.delay}s`,
          }}/>
        ))}
      </div>

      {/* HUD */}
      <div className="hud">
        <div className="score-box-hud">
          <span className="score-lbl">Score</span>
          <span className="score-val">{s.score}</span>
        </div>
        <div className="lives">
          {[0,1,2].map(i => (
            <span key={i} className={`heart${i >= s.lives ? ' gone' : ''}`}>♥</span>
          ))}
        </div>
      </div>

      {/* ── TOWER BLOCKS ── */}
      {s.tower.map((blk, idx) => {
        const sy = w2s(blk.worldY, cam);
        if (sy > CANVAS_H + 10 || sy + BLOCK_H < -10) return null;
        const c = BLOCK_COLORS[blk.colorIdx ?? 0];
        return (
          <Block3D key={idx} x={blk.x} y={sy} w={blk.w} h={BLOCK_H} color={c} />
        );
      })}

      {/* ── MOVING BLOCK ── */}
      {s.movingBlock && (s.phase === 'playing' || s.phase === 'birdFalling') && (() => {
        const b = s.movingBlock;
        const c = BLOCK_COLORS[b.colorIdx];
        return (
          <Block3D
            x={b.x} y={w2s(b.worldY, cam)}
            w={b.w} h={BLOCK_H} color={c}
            glow
          />
        );
      })()}

      {/* ── SECOND BLOCK ── */}
      {s.secondBlock && s.phase === 'playing' && (() => {
        const b = s.secondBlock;
        const c = BLOCK_COLORS[b.colorIdx];
        return (
          <Block3D
            x={b.x} y={w2s(b.worldY, cam)}
            w={b.w} h={BLOCK_H} color={c}
            dim
          />
        );
      })()}

      {/* ── BIRD (SVG) ── */}
      {s.phase !== 'start' && (
        <div
          className={`bird-wrap${s.jumpActive ? ' flap' : ''}${s.birdFalling ? ' fall' : ''}`}
          style={{
            left:    s.birdX,
            top:     bScrY + (s.birdFalling ? fallAge * 280 : 0),
            opacity: s.birdFalling ? 1 - fallAge : 1,
            width:   BIRD_W,
            height:  BIRD_H,
          }}
        >
          <BirdSVG />
        </div>
      )}

      {/* ── PARTICLES ── */}
      {s.particles.map(p => (
        <div key={p.id} className="chip" style={{
          left: p.cx, top: p.cy,
          background: p.color,
          '--tx': `${p.tx}px`, '--ty': `${p.ty}px`,
        }}/>
      ))}

      {/* ── POPUPS ── */}
      {s.popups.map(pop => (
        <div
          key={pop.id}
          className={`popup${pop.perfect ? ' perfect' : ''}`}
          style={{ left: clamp(pop.x - 36, 4, CANVAS_W - 80), top: pop.y }}
        >
          {pop.perfect ? '⭐ +3' : '+1'}
        </div>
      ))}

      {/* Perfect flash */}
      {s.showPerfect && (
        <div className="pf-overlay"><span className="pf-text">PERFECT!</span></div>
      )}

      {/* Speed dots */}
      {s.phase === 'playing' && (
        <div className="speed-bar">
          <span className="spd-lbl">Speed</span>
          <div className="spd-dots">
            {Array.from({length: MAX_DOTS}, (_, i) => (
              <div key={i} className={`spd-dot${i < activeDots ? ' on' : ''}`}/>
            ))}
          </div>
        </div>
      )}

      {/* ── START SCREEN ── */}
      {s.phase === 'start' && (
        <div className="overlay start-overlay">
          <div className="start-bird-anim"><BirdSVG size={110} /></div>
          <div className="title">🪵 Wood Stack</div>
          <div className="info-card">
            <p>
              Blocks slide in at bird level.<br/>
              <span className="hl">Tap</span> to jump onto the block!<br/><br/>
              <span className="hl">+1</span> — good land &nbsp;|&nbsp; <span className="hlp">⭐ +3</span> — PERFECT!<br/>
              Don't tap in time = fall = lose a life<br/>
              <strong>3 lives</strong> total
            </p>
          </div>
          <div className="tap-hint">👆 Tap to start!</div>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {s.phase === 'gameover' && (
        <div className="overlay go-overlay">
          <div className="go-title">Game Over!</div>
          <div style={{fontSize:60}}>😵</div>
          <div className="score-card">
            <span className="sc-lbl">Your Score</span>
            <span className="sc-val">{s.score}</span>
            {bestRef.current > 0 && <>
              <span className="sc-best-lbl">Best</span>
              <span className="sc-best-val">🏆 {bestRef.current}</span>
            </>}
          </div>
          <button
            className="play-btn"
            onMouseDown={e=>{e.stopPropagation();onRestart();}}
            onTouchStart={e=>{e.stopPropagation();e.preventDefault();onRestart();}}
          >🔄 Play Again</button>
        </div>
      )}
    </div>
  );
}

// ─── 3D BLOCK COMPONENT ───────────────────────────────────────────────────────
function Block3D({ x, y, w, h, color, glow = false, dim = false }) {
  const depth = 10;  // 3D side depth in px
  return (
    <div
      className={`block3d${glow ? ' block-glow' : ''}${dim ? ' block-dim' : ''}`}
      style={{ left: x, top: y, width: w, height: h }}
    >
      {/* Top face */}
      <div className="b-top" style={{ background: color.top }} />
      {/* Front face (main visible face) */}
      <div className="b-front" style={{ background: color.side }}>
        {/* Wood grain lines */}
        <div className="grain" />
        {/* Shine */}
        <div className="shine" />
      </div>
      {/* Right side face (3D depth) */}
      <div
        className="b-right"
        style={{
          background: color.dark,
          width: depth,
          height: h,
          top: 0,
          right: -depth,
          transform: `skewY(45deg)`,
          transformOrigin: 'top left',
        }}
      />
      {/* Bottom side face */}
      <div
        className="b-bottom-face"
        style={{
          background: color.dark,
          height: depth,
          bottom: -depth,
          left: depth,
          right: -depth,
          transform: `skewX(-45deg)`,
          transformOrigin: 'top right',
        }}
      />
    </div>
  );
}

// ─── SVG BIRD ─────────────────────────────────────────────────────────────────
function BirdSVG({ size = 52 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size} height={size}
      style={{ display:'block', overflow:'visible' }}
    >
      {/* Body */}
      <ellipse cx="50" cy="62" rx="28" ry="24" fill="#FFD54F" />
      {/* Head */}
      <circle cx="50" cy="38" r="22" fill="#FFD54F" />
      {/* Wing left */}
      <ellipse cx="26" cy="66" rx="12" ry="7" fill="#FF8F00" transform="rotate(-20 26 66)" />
      {/* Wing right */}
      <ellipse cx="74" cy="66" rx="12" ry="7" fill="#FF8F00" transform="rotate(20 74 66)" />
      {/* Eye white left */}
      <circle cx="41" cy="34" r="8" fill="white" />
      {/* Eye white right */}
      <circle cx="59" cy="34" r="8" fill="white" />
      {/* Pupil left */}
      <circle cx="43" cy="35" r="4.5" fill="#1a1a2e" />
      {/* Pupil right */}
      <circle cx="61" cy="35" r="4.5" fill="#1a1a2e" />
      {/* Eye shine left */}
      <circle cx="45" cy="33" r="1.5" fill="white" />
      {/* Eye shine right */}
      <circle cx="63" cy="33" r="1.5" fill="white" />
      {/* Beak */}
      <path d="M44 44 L56 44 L50 52 Z" fill="#FF6F00" />
      {/* Cheek blush left */}
      <ellipse cx="34" cy="42" rx="6" ry="4" fill="#FFB74D" opacity="0.6" />
      {/* Cheek blush right */}
      <ellipse cx="66" cy="42" rx="6" ry="4" fill="#FFB74D" opacity="0.6" />
      {/* Crown feathers */}
      <ellipse cx="42" cy="17" rx="4" ry="8" fill="#FF8F00" transform="rotate(-15 42 17)" />
      <ellipse cx="50" cy="14" rx="4" ry="9" fill="#FF8F00" />
      <ellipse cx="58" cy="17" rx="4" ry="8" fill="#FF8F00" transform="rotate(15 58 17)" />
      {/* Feet */}
      <line x1="42" y1="84" x2="36" y2="94" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round" />
      <line x1="42" y1="84" x2="28" y2="90" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round" />
      <line x1="42" y1="84" x2="30" y2="96" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="84" x2="64" y2="94" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="84" x2="72" y2="90" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="84" x2="70" y2="96" stroke="#FF6F00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
