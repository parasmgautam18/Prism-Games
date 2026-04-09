import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    // Simulate a brief save operation
    setTimeout(() => {
      localStorage.setItem("gs_username", name.trim());
      setIsLoading(false);
      // Redirect to dashboard
      navigate("/");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Prism{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
              Arcade
            </span>
          </h1>
          <p className="text-slate-400">Enter your name to start playing</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-white/10"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your name"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isLoading ? "Starting..." : "Start Playing"}
          </button>
        </form>
      </div>
    </div>
  );
}
