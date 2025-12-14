'use client';

import dynamic from 'next/dynamic';

const GameBoard = dynamic(() => import('@/components/GameBoard'), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/Leaderboard'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 flex flex-col items-center gap-8">
        <GameBoard />

        <div className="w-full flex justify-center">
          <Leaderboard />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm sm:text-base pb-6">
          <p className="font-semibold">Built with Next.js & TypeScript</p>
          <p className="mt-2 text-gray-600">Challenge yourself and beat the high score!</p>
        </footer>
      </div>
    </main>
  );
}
