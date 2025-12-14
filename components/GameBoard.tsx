'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Position } from '@/types/game';
import {
  createBoard,
  areAdjacent,
  swapGems,
  findMatches,
  removeMatches,
  applyGravity,
  calculateScore,
  hasValidMoves,
  shuffleBoard,
} from '@/lib/gameLogic';
import { getHighScore, saveScore } from '@/lib/storage';
import Gem from './Gem';

const BOARD_SIZE = 8;
const INITIAL_TIME = 60; // 60 seconds per game
const CELL_SIZE = 50; // Base cell size in pixels

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createBoard(BOARD_SIZE),
    score: 0,
    moves: 0,
    timeLeft: INITIAL_TIME,
    combo: 0,
    selectedGem: null,
    isProcessing: false,
    isGameOver: false,
    highScore: 0,
  }));

  const [animatingMatches, setAnimatingMatches] = useState<Position[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [cellSize, setCellSize] = useState(CELL_SIZE);

  // Load high score on mount
  useEffect(() => {
    setGameState(prev => ({ ...prev, highScore: getHighScore() }));
  }, []);

  // Responsive cell size
  useEffect(() => {
    const updateCellSize = () => {
      const screenWidth = window.innerWidth;
      const padding = 48; // Total horizontal padding (increased for better margins)
      const maxBoardWidth = screenWidth - padding;
      const calculatedSize = Math.floor(maxBoardWidth / BOARD_SIZE);
      // Min 35px for very small screens, max 70px for larger screens
      const finalSize = Math.max(35, Math.min(calculatedSize, 70));
      setCellSize(finalSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState.isGameOver || gameState.timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;

        if (newTimeLeft <= 0) {
          // Game over - save score
          saveScore({
            score: prev.score,
            date: new Date().toISOString(),
            moves: prev.moves,
            time: INITIAL_TIME - newTimeLeft,
          });

          return { ...prev, timeLeft: 0, isGameOver: true };
        }

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.timeLeft]);

  // Process matches recursively for cascading
  const processMatches = useCallback(
    async (board = gameState.board, currentCombo = 0) => {
      const matches = findMatches(board);

      if (matches.length === 0) {
        // Check if board has valid moves
        if (!hasValidMoves(board)) {
          const shuffled = shuffleBoard(board);
          setGameState(prev => ({
            ...prev,
            board: shuffled,
            isProcessing: false,
            combo: 0,
          }));
        } else {
          setGameState(prev => ({ ...prev, isProcessing: false, combo: 0 }));
        }
        return;
      }

      // Animate matches
      const matchPositions = matches.flatMap(m => m.positions);
      setAnimatingMatches(matchPositions);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate score
      const points = calculateScore(matches, currentCombo);

      // Remove matches
      let newBoard = removeMatches(board, matches);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Apply gravity
      newBoard = applyGravity(newBoard);

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        score: prev.score + points,
        highScore: Math.max(prev.highScore, prev.score + points),
        combo: currentCombo + 1,
      }));

      setAnimatingMatches([]);

      // Check for new matches (cascade)
      await new Promise(resolve => setTimeout(resolve, 400));
      processMatches(newBoard, currentCombo + 1);
    },
    [gameState.board]
  );

  const handleGemClick = useCallback(
    (row: number, col: number) => {
      if (gameState.isProcessing || gameState.isGameOver) return;

      const clickedPos: Position = { row, col };

      if (!gameState.selectedGem) {
        // First selection
        setGameState(prev => ({ ...prev, selectedGem: clickedPos }));
      } else {
        // Second selection
        const { selectedGem } = gameState;

        if (selectedGem.row === row && selectedGem.col === col) {
          // Deselect
          setGameState(prev => ({ ...prev, selectedGem: null }));
          return;
        }

        if (areAdjacent(selectedGem, clickedPos)) {
          // Valid swap
          setGameState(prev => ({ ...prev, isProcessing: true, selectedGem: null }));

          const swappedBoard = swapGems(gameState.board, selectedGem, clickedPos);
          const matches = findMatches(swappedBoard);

          if (matches.length > 0) {
            // Valid move
            setGameState(prev => ({
              ...prev,
              board: swappedBoard,
              moves: prev.moves + 1,
            }));

            // Trigger haptic feedback if available
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate(50);
            }

            processMatches(swappedBoard, 0);
          } else {
            // Invalid move - swap back
            setTimeout(() => {
              setGameState(prev => ({ ...prev, isProcessing: false }));
            }, 300);
          }
        } else {
          // Not adjacent - select new gem
          setGameState(prev => ({ ...prev, selectedGem: clickedPos }));
        }
      }
    },
    [gameState, processMatches]
  );

  const resetGame = () => {
    setGameState({
      board: createBoard(BOARD_SIZE),
      score: 0,
      moves: 0,
      timeLeft: INITIAL_TIME,
      combo: 0,
      selectedGem: null,
      isProcessing: false,
      isGameOver: false,
      highScore: getHighScore(),
    });
    setAnimatingMatches([]);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 text-transparent bg-clip-text">
          Match-3 Puzzle
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-700/50">
            <div className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Score</div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {gameState.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-700/50">
            <div className="text-gray-400 text-xs sm:text-sm font-medium mb-1">High Score</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {gameState.highScore.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-700/50">
            <div className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Time</div>
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                gameState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'
              }`}
            >
              {gameState.timeLeft}s
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-700/50">
            <div className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Moves</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              {gameState.moves}
            </div>
          </div>
        </div>

        {/* Combo indicator */}
        {gameState.combo > 0 && (
          <div className="text-center mb-4">
            <span className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-base sm:text-lg md:text-xl shadow-lg animate-pulse-gem border-2 border-white/30">
              {gameState.combo}x COMBO!
            </span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-3 shadow-2xl border-2 border-gray-700/50"
        style={{
          width: `${cellSize * BOARD_SIZE + 24}px`,
          height: `${cellSize * BOARD_SIZE + 24}px`,
        }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          }}
        >
          {gameState.board.gems?.map((row, rowIndex) =>
            row?.map((gem, colIndex) => {
              if (!gem) return null;

              const isSelected =
                gameState.selectedGem?.row === rowIndex &&
                gameState.selectedGem?.col === colIndex;

              const isMatched = animatingMatches.some(
                pos => pos.row === rowIndex && pos.col === colIndex
              );

              return (
                <Gem
                  key={`${gem.id}-${rowIndex}-${colIndex}`}
                  type={gem.type}
                  isSelected={isSelected}
                  isMatched={isMatched}
                  onClick={() => handleGemClick(rowIndex, colIndex)}
                  size={cellSize}
                />
              );
            })
          )}
        </div>

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                Game Over!
              </h2>
              <p className="text-2xl sm:text-3xl mb-3 text-yellow-400 font-bold">
                Final Score: {gameState.score.toLocaleString()}
              </p>
              <p className="text-lg sm:text-xl mb-8 text-gray-300">
                Moves: {gameState.moves}
              </p>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 hover:from-purple-600 hover:via-pink-600 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg text-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 text-center">How to Play</h3>
        <div className="space-y-2 text-gray-300 text-sm sm:text-base">
          <p className="flex items-start gap-2">
            <span className="text-purple-400 font-bold flex-shrink-0">1.</span>
            <span>Tap a gem to <strong className="text-white">select it</strong> (it will show a white ring)</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-400 font-bold flex-shrink-0">2.</span>
            <span>Tap an <strong className="text-white">adjacent gem</strong> (up, down, left, or right) to swap them</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-400 font-bold flex-shrink-0">3.</span>
            <span>Match <strong className="text-yellow-400">3 or more</strong> of the same color to score points!</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-400 font-bold flex-shrink-0">4.</span>
            <span>Create chain reactions for <strong className="text-orange-400">combo bonuses!</strong></span>
          </p>
        </div>
      </div>

      {/* Reset Button */}
      {!gameState.isGameOver && (
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-gray-600"
        >
          New Game
        </button>
      )}
    </div>
  );
}
