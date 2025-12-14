'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types/game';
import { getLeaderboard, clearLeaderboard } from '@/lib/storage';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    setEntries(getLeaderboard());
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the leaderboard?')) {
      clearLeaderboard();
      loadLeaderboard();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl px-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] border border-purple-500/50"
      >
        <span className="text-base sm:text-lg">
          {isVisible ? '▼ Hide' : '▶ Show'} Leaderboard
        </span>
      </button>

      {isVisible && (
        <div className="mt-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
              Top Scores
            </h2>
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors font-semibold px-3 py-1 rounded-lg hover:bg-red-900/20"
              >
                Clear All
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-base sm:text-lg">
              No scores yet. Play a game to get started! 🎮
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-gray-400 text-xs sm:text-sm font-semibold border-b-2 border-gray-700">
                    <th className="text-left py-3 px-2 sm:px-4">Rank</th>
                    <th className="text-right py-3 px-2 sm:px-4">Score</th>
                    <th className="text-right py-3 px-2 sm:px-4">Moves</th>
                    <th className="text-right py-3 px-2 sm:px-4">Time</th>
                    <th className="text-right py-3 px-2 sm:px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                        index === 0
                          ? 'text-yellow-400 bg-yellow-900/10'
                          : index === 1
                          ? 'text-gray-200'
                          : index === 2
                          ? 'text-orange-300'
                          : 'text-white'
                      }`}
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl">
                            {index === 0 && '🏆'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                          </span>
                          <span className="font-bold text-sm sm:text-base">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 sm:py-4 px-2 sm:px-4 font-bold text-sm sm:text-base">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-2 sm:px-4 text-gray-300 text-sm sm:text-base">
                        {entry.moves}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-2 sm:px-4 text-gray-300 text-sm sm:text-base">
                        {formatTime(entry.time)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-2 sm:px-4 text-gray-400 text-xs sm:text-sm">
                        {formatDate(entry.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
