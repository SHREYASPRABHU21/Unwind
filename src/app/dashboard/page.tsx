'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


// Add these imports at the top
import ChatInterface from '@/components/chat/ChatInterface';
import ResearchInterface from '@/components/dashboard/ResearchInterface';
import HistoryInterface from '@/components/dashboard/HistoryInterface';
import JournalingInterface from '@/components/dashboard/JournalingInterface';
import AccountInterface from '@/components/dashboard/AccountInterface';
// import BookmarksInterface from '@/components/dashboard/BookmarksInterface';


type CardType = 'session' | 'research' | 'history' | 'bookmarks' | 'journaling' | 'account' | null;

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [activeCard, setActiveCard] = useState<CardType>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const getGridClasses = () => {
    switch (activeCard) {
      case 'session':
        return 'grid-cols-3 grid-rows-3';
      case 'research':
        return 'grid-cols-3 grid-rows-2';
      case 'journaling':
        return 'grid-cols-3 grid-rows-3';
      case 'account':
        return 'grid-cols-3 grid-rows-2';
      case 'bookmarks':
        return 'grid-cols-3 grid-rows-2';
      case 'history':
        return 'grid-cols-3 grid-rows-3';
      default:
        return 'grid-cols-3 grid-rows-2';
    }
  };

  const getCardPosition = (cardName: string) => {
    if (activeCard === null) {
      // Default 2x3 grid positions
      const positions = {
        session: 'row-start-1 col-start-1',
        research: 'row-start-1 col-start-2', 
        history: 'row-start-1 col-start-3',
        bookmarks: 'row-start-2 col-start-1',
        journaling: 'row-start-2 col-start-2',
        account: 'row-start-2 col-start-3'
      };
      return positions[cardName as keyof typeof positions];
    }

    // Expanded states with specific positioning
    if (activeCard === 'session') {
      const positions = {
        session: 'row-start-2 col-start-2 col-span-1 row-span-2', // Center expanded
        research: 'row-start-1 col-start-3 col-span-1 row-span-2', // Right side
        history: 'row-start-2 col-start-1 col-span-1 row-span-2', // Left side
        bookmarks: 'row-start-3 col-start-1',
        journaling: 'row-start-3 col-start-2', 
        account: 'row-start-3 col-start-3'
      };
      return positions[cardName as keyof typeof positions];
    }

    if (activeCard === 'research') {
      const positions = {
        research: 'row-start-1 col-start-1 col-span-2 row-span-2', // Expanded left
        session: 'row-start-1 col-start-3',
        history: 'row-start-2 col-start-3',
        bookmarks: 'row-start-1 col-start-3',
        journaling: 'row-start-2 col-start-3',
        account: 'row-start-2 col-start-3'
      };
      return positions[cardName as keyof typeof positions];
    }

    // Add more positioning logic for other active cards...
    
    return '';
  };

  const getCardSize = (cardName: string) => {
    if (activeCard === cardName) {
      switch (cardName) {
        case 'session':
          return 'col-span-1 row-span-2';
        case 'research':
          return 'col-span-2 row-span-2';
        case 'journaling':
          return 'col-span-3 row-span-2';
        case 'account':
          return 'col-span-2 row-span-2';
        default:
          return 'col-span-1 row-span-1';
      }
    }
    return 'col-span-1 row-span-1';
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome, {user?.displayName?.split(' ')[0]}
        </h1>
        
        <div className="flex items-center gap-4">
          <img 
            src={user?.photoURL || ''} 
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
          />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className={`grid gap-6 h-[calc(100vh-200px)] ${getGridClasses()}`}>
        {/* Session Card */}
        <div 
          className={`bg-yellow-100 rounded-2xl p-6 cursor-pointer card-transition
                     hover:shadow-lg border-2 border-yellow-200
                     ${getCardPosition('session')} ${getCardSize('session')}`}
          onClick={() => setActiveCard(activeCard === 'session' ? null : 'session')}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-2">Session</h3>
          {activeCard === 'session' ? (
            <div className="h-full">
              <ChatInterface />
            </div>
          ) : (
            <p className="text-slate-600">Start your therapy session</p>
          )}
        </div>

        {/* Research & Books Card */}
        <div 
          className={`bg-white rounded-2xl p-6 cursor-pointer card-transition
                     hover:shadow-lg border-2 border-slate-200
                     ${getCardPosition('research')} ${getCardSize('research')}`}
          onClick={() => setActiveCard(activeCard === 'research' ? null : 'research')}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-2">Research & Books</h3>
          {activeCard === 'research' ? (
            <div className="h-full">
              <ResearchInterface />
            </div>
          ) : (
            <p className="text-slate-600">Explore mental health resources</p>
          )}
        </div>

        {/* History Card */}
        <div 
          className={`bg-white rounded-2xl p-6 cursor-pointer card-transition
                     hover:shadow-lg border-2 border-slate-200
                     ${getCardPosition('history')} ${getCardSize('history')}`}
          onClick={() => setActiveCard(activeCard === 'history' ? null : 'history')}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-2">History</h3>
          {activeCard === 'history' ? (
            <div className="h-full">
              <HistoryInterface />
            </div>
          ) : (
            <p className="text-slate-600">View past sessions</p>
          )}
        </div>

        {/* Continue with other cards... */}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>© 2025 Unwind - Your mental wellness companion</p>
      </footer>
    </div>
  );
}
