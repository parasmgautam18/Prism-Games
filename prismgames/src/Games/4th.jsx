import React, { useState, useEffect, useRef } from 'react';

const WORDS_LIST = [
  "algorithm", "application", "compiler", "database", "developer",
  "framework", "function", "interface", "javascript", "kotlin",
  "network", "parameter", "programming", "python", "react",
  "repository", "server", "spring", "structure", "tailwind"
];

export default function TypingGame() {
  const [currentWord, setCurrentWord] = useState("Ready?");
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const inputRef = useRef(null);

  // Listen for 'Enter' to start the game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !isPlaying) {
        startGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Handle the countdown timer
  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
    
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(30);
    setScore(0);
    setInputValue("");
    setMessage({ text: "", type: "" });
    pickNewWord();
    
    // Slight delay to ensure the input is enabled before focusing
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 10);
  };

  const endGame = () => {
    setIsPlaying(false);
    setMessage({ text: "Game Over! Press Enter to restart.", type: "error" });
    setCurrentWord("Game Over");
    setInputValue("");
  };

  const pickNewWord = () => {
    const randomIndex = Math.floor(Math.random() * WORDS_LIST.length);
    setCurrentWord(WORDS_LIST[randomIndex]);
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Check if the typed word matches the current word exactly
    if (value.trim() === currentWord) {
      setScore((prev) => prev + 1);
      setTimeLeft((prev) => prev + 1); // +1 Second Bonus
      setInputValue("");
      setMessage({ text: "Correct!", type: "success" });
      pickNewWord();
    } else {
      // Clear the "Correct!" message as soon as they start typing the next word
      if (message.type === "success") {
        setMessage({ text: "", type: "" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-purple-500 selection:text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center border border-gray-700">
        
        <h1 className="text-4xl font-bold text-purple-400 mb-8">Speed Typer</h1>
        
        {/* Score and Timer Header */}
        <div className="flex justify-between items-center text-xl font-semibold mb-8 bg-gray-900 py-3 px-6 rounded-lg">
          <div>
            Time Left: <span className={`font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-purple-300'}`}>{timeLeft}</span>s
          </div>
          <div>
            Score: <span className="font-mono text-purple-300">{score}</span>
          </div>
        </div>

        {/* Word Display */}
        <div className="text-4xl md:text-5xl font-bold tracking-widest my-8 min-h-[60px] text-gray-100 drop-shadow-md">
          {currentWord}
        </div>

        {/* Input Area */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInput}
          disabled={!isPlaying}
          placeholder={isPlaying ? "Start typing..." : "Press Enter to start"}
          className="w-full bg-gray-700 border-2 border-gray-600 text-white text-center text-2xl p-4 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Feedback Message */}
        <div 
          className={`mt-6 text-xl font-medium h-8 transition-opacity duration-200 ${
            message.type === 'error' ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {message.text}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-sm text-gray-400 leading-relaxed bg-gray-900/50 p-4 rounded-lg">
          Type the word above as fast as you can. <br />
          Hit <strong className="text-gray-200 bg-gray-700 px-2 py-1 rounded">Enter</strong> to begin a 30-second round. <br />
          <span className="text-purple-400/80 mt-2 block italic">Earn +1 second for every correct word!</span>
        </div>

      </div>
    </div>
  );
}
