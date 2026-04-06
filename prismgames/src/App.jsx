import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [task, setTask] = useState(null)
  const [clickCount, setClickCount] = useState(0)
  const [holdTime, setHoldTime] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [taskComplete, setTaskComplete] = useState(false)

  // Terror States
  const [jumpscare, setJumpscare] = useState(null)
  const [showJumpscare, setShowJumpscare] = useState(false)
  const [showRetry, setShowRetry] = useState(false)

  // Game States
  const [buttonColor, setButtonColor] = useState('blue')
  const [correctTaps, setCorrectTaps] = useState(0)
  const [score, setScore] = useState(0)

  const audioRef = useRef(null)
  const hasUnlockedAudio = useRef(false)

  const generateTask = () => {
    const tasks = [
      { type: 'click', count: Math.floor(Math.random() * 5) + 1 },
      { type: 'hold', duration: Math.floor(Math.random() * 5) + 1, maxDuration: Math.floor(Math.random() * 2) + 1 },
      { type: 'rapid', count: Math.floor(Math.random() * 15) + 5, duration: 5 },
      { type: 'colorMatch', targetColor: 'red', requiredTaps: Math.floor(Math.random() * 3) + 2, colorChangeSpeed: Math.floor(Math.random() * 500) + 300 },
    ]
    return tasks[Math.floor(Math.random() * tasks.length)]
  }

  const unlockAudio = () => {
    if (!hasUnlockedAudio.current) {
      audioRef.current = new Audio('/jumpscare.wav')
      audioRef.current.volume = 0

      audioRef.current.play().then(() => {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.volume = 1.0
        hasUnlockedAudio.current = true
      }).catch(e => {
        console.log("Audio unlock blocked by browser:", e)
      })
    }
  }

  const triggerJumpscare = () => {
    const terrors = [
      'https://imgs.search.brave.com/mryDoNLVvMNCeGhMZmcmDGvTYKQjTIokdYJgdUX_vUQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE4LzUxLzUwLzgz/LzM2MF9GXzE4NTE1/MDgzMjNfWm1jWjlP/SWFOWFlIU2hyamtS/WEZUU1NzOUZpTGFC/S2kuanBn',
      'https://imgs.search.brave.com/0DnNm_YxXCAU-n4FFCIHmNMzRTbUudXpuX70Tuu-40I/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE4LzUzLzUyLzk0/LzM2MF9GXzE4NTM1/Mjk0MDVfSXZTYW9H/QXAxcGRzS3NTbTBT/Y3BCSHl0Z0xRU2F4/WWsuanBn'
    ]

    setJumpscare(terrors[Math.floor(Math.random() * terrors.length)])
    setShowJumpscare(true)
    setShowRetry(false)

    if (audioRef.current && hasUnlockedAudio.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log("Audio play blocked during jumpscare", e))
    }

    setTimeout(() => {
      setShowRetry(true)
    }, 2500)
  }

  const handleRetry = () => {
    setShowJumpscare(false)
    setShowRetry(false)
    setClickCount(0)
    setHoldTime(0)
    setTimeLeft(null)
    setCorrectTaps(0)
    setIsHolding(false)
    setIsPressed(false)
    setTask(generateTask())
    setTaskComplete(false)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    setTask(generateTask())
  }, [])

  useEffect(() => {
    if (task?.type === 'click' && clickCount >= task.count && !taskComplete) {
      setTaskComplete(true)
      setScore(prev => prev + 100)
      setTimeout(() => { setClickCount(0); setTask(generateTask()); setTaskComplete(false) }, 500)
    }
  }, [clickCount, task, taskComplete])

  useEffect(() => {
    if (task?.type === 'hold' && holdTime >= task.duration && !taskComplete) {
      setTaskComplete(true)
      setScore(prev => prev + 100)
      setTimeout(() => { setHoldTime(0); setIsHolding(false); setTask(generateTask()); setTaskComplete(false) }, 500)
    }
  }, [holdTime, task, taskComplete])

  useEffect(() => {
    if (task?.type === 'hold' && holdTime > (task.duration + task.maxDuration) && !taskComplete && !showJumpscare) {
      setIsHolding(false)
      setIsPressed(false)
      triggerJumpscare()
    }
  }, [holdTime, task, taskComplete, showJumpscare])

  useEffect(() => {
    if (task?.type === 'colorMatch' && !taskComplete && !showJumpscare) {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
      let colorIndex = 0

      const interval = setInterval(() => {
        colorIndex = (colorIndex + 1) % colors.length
        setButtonColor(colors[colorIndex])
      }, task.colorChangeSpeed)

      return () => clearInterval(interval)
    }
  }, [task, taskComplete, showJumpscare])

  useEffect(() => {
    if (task?.type === 'colorMatch' && correctTaps >= task.requiredTaps && !taskComplete) {
      setTaskComplete(true)
      setScore(prev => prev + 100)
      setTimeout(() => { setCorrectTaps(0); setButtonColor('blue'); setTask(generateTask()); setTaskComplete(false) }, 500)
    }
  }, [correctTaps, task, taskComplete])

  useEffect(() => {
    if (task?.type === 'rapid' && timeLeft === null && !taskComplete) {
      setTimeLeft(task.duration)
    }
  }, [task, taskComplete, timeLeft])

  useEffect(() => {
    let interval

    if (task?.type === 'hold' && isHolding) {
      interval = setInterval(() => {
        setHoldTime(prev => prev + 0.1)
      }, 100)
    } else if (task?.type === 'rapid' && timeLeft !== null && timeLeft > 0 && !taskComplete) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            setTimeout(() => { triggerJumpscare() }, 0)
            return null
          }
          return prev - 0.1
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isHolding, task?.type, timeLeft, taskComplete, showJumpscare])

  const handleMouseDown = () => {
    unlockAudio()
    setIsPressed(true)

    if (task?.type === 'hold') {
      setIsHolding(true)
    } else if (task?.type === 'click') {
      setClickCount(prev => prev + 1)
    } else if (task?.type === 'rapid' && timeLeft !== null && timeLeft > 0) {
      setClickCount(prev => {
        const newCount = prev + 1
        if (newCount >= task.count) {
          setTaskComplete(true)
          setScore(prev => prev + 100)
          setTimeout(() => { setClickCount(0); setTimeLeft(null); setTask(generateTask()); setTaskComplete(false) }, 500)
        }
        return newCount
      })
    } else if (task?.type === 'colorMatch') {
      if (buttonColor === task.targetColor) {
        setCorrectTaps(prev => {
          const newTaps = prev + 1
          if (newTaps >= task.requiredTaps) {
            setTaskComplete(true)
            setScore(prev => prev + 100)
            setTimeout(() => { setCorrectTaps(0); setButtonColor('blue'); setTask(generateTask()); setTaskComplete(false) }, 500)
          }
          return newTaps
        })
      } else {
        triggerJumpscare()
      }
    }
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    setIsHolding(false)
    if (task?.type === 'hold' && !taskComplete) {
      setHoldTime(0)
    }
  }

  const getColorValue = (colorName) => {
    const colorMap = {
      'red': 'bg-red-500', 'blue': 'bg-blue-500', 'green': 'bg-green-500',
      'yellow': 'bg-yellow-400', 'purple': 'bg-purple-500', 'orange': 'bg-orange-500'
    }
    return colorMap[colorName] || 'bg-blue-500'
  }

  const getTaskText = () => {
    if (!task) return 'Loading...'
    switch (task.type) {
      case 'click': return `Click the button ${task.count} times\n(${clickCount}/${task.count})`
      case 'hold': return `Hold the button for ${task.duration}s\n(${holdTime.toFixed(1)}s)`
      case 'rapid': return `Click ${task.count} times in ${task.duration}s\n(${clickCount}/${task.count}) - ${timeLeft?.toFixed(1)}s`
      case 'colorMatch': return `Tap only when RED\n(${correctTaps}/${task.requiredTaps})`
      default: return 'Unknown task'
    }
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center gap-5 bg-gray-900 relative ${showJumpscare ? 'overflow-hidden' : ''}`}>

      {/* SCOREBOARD */}
      <div className="absolute top-8 left-8 bg-gray-800 rounded-lg shadow-lg p-6 border-4 border-red-600">
        <div className="text-center">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Score</p>
          <p className="text-5xl font-bold text-red-500 mt-2">{score}</p>
        </div>
      </div>

      {/* JUMPSCARE OVERLAY */}
      {showJumpscare && (
        <div className="jumpscare-overlay fixed inset-0 bg-black flex flex-col items-center justify-center z-50 w-screen h-screen">
          {jumpscare && (
            <img
              src={jumpscare}
              alt="jumpscare"
              className="w-full h-full object-cover absolute inset-0"
              style={{ animation: 'none', opacity: 1 }} /* THE OVERRIDE: Kills the CSS blinking ghost pop */
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {showRetry && (
            <button
              onClick={handleRetry}
              className="retry-btn absolute bottom-1/4 z-10 px-10 py-4 text-2xl font-black bg-red-700 text-white border-4 border-red-900 rounded-lg cursor-pointer uppercase tracking-widest hover:scale-110 transition-transform shadow-[0_0_20px_rgba(220,38,38,0.8)]"
            >
              Retry If You Dare
            </button>
          )}
        </div>
      )}

      <h1 className="text-5xl font-bold text-white mb-10 tracking-widest uppercase drop-shadow-lg">Prism Games</h1>

      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={showJumpscare}
        className={`${task?.type === 'colorMatch' ? getColorValue(buttonColor) : (taskComplete ? 'bg-green-600' : isPressed ? 'bg-red-800' : 'bg-red-700')} ${showJumpscare ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]'} px-20 py-10 text-2xl text-white border-none rounded-xl font-bold whitespace-pre-wrap transition-all min-w-[400px] border-4 border-black/20`}
      >
        {getTaskText()}
      </button>
    </div>
  )
}

export default App