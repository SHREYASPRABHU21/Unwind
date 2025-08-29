'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Journal {
  id: string;
  title: string;
  content: string;
  mood_score: number;
  created_at: string;
}

interface MoodData {
  date: string;
  mood: number;
}

export default function JournalingInterface() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [currentJournal, setCurrentJournal] = useState<Journal | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [showMoodChart, setShowMoodChart] = useState(false);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [user] = useAuthState(auth);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadJournals();
    loadMoodData();
  }, [user]);

  const loadJournals = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/journals?userId=${user.uid}`);
      const data = await response.json();
      setJournals(data.journals || []);
    } catch (error) {
      console.error('Error loading journals:', error);
    }
  };

  const loadMoodData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/journals/mood-data?userId=${user.uid}`);
      const data = await response.json();
      setMoodData(data.moodData || []);
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  };

  const analyzeMoodFromContent = (content: string): number => {
    // Simple sentiment analysis - in production, use a proper sentiment analysis API
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'excited', 'grateful'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'anxious'];
    
    const words = content.toLowerCase().split(/\s+/);
    let score = 5; // neutral
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.5;
      if (negativeWords.includes(word)) score -= 0.5;
    });
    
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const saveJournal = async () => {
    if (!user || !title.trim() || !content.trim()) return;

    const autoMood = analyzeMoodFromContent(content);
    
    try {
      const response = await fetch('/api/journals', {
        method: currentJournal ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentJournal?.id,
          userId: user.uid,
          title: title.trim(),
          content: content.trim(),
          mood_score: moodScore || autoMood
        })
      });

      if (response.ok) {
        await loadJournals();
        await loadMoodData();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };

  const resetForm = () => {
    setCurrentJournal(null);
    setTitle('');
    setContent('');
    setMoodScore(5);
    setIsEditing(false);
  };

  const loadJournal = (journal: Journal) => {
    setCurrentJournal(journal);
    setTitle(journal.title);
    setContent(journal.content);
    setMoodScore(journal.mood_score);
    setIsEditing(true);
  };

  const deleteJournal = async (id: string) => {
    try {
      await fetch('/api/journals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: user?.uid })
      });
      
      await loadJournals();
      await loadMoodData();
      if (currentJournal?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'text-red-500';
    if (mood <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😟';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '🙂';
    return '😊';
  };

  return (
    <div className="h-full flex">
      {/* Journal Editor - Left Side */}
      <div className="flex-1 p-4 border-r">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Journal' : 'New Journal Entry'}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={resetForm}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => setShowMoodChart(!showMoodChart)}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              {showMoodChart ? 'Hide' : 'Show'} Mood Chart
            </button>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Journal title..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Content Editor */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today?"
          className="w-full h-64 p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Mood Slider */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling? {getMoodEmoji(moodScore)} ({moodScore}/10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={moodScore}
            onChange={(e) => setMoodScore(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Very Low</span>
            <span>Neutral</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveJournal}
          disabled={!title.trim() || !content.trim()}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isEditing ? 'Update Entry' : 'Save Entry'}
        </button>

        {/* Mood Chart */}
        {showMoodChart && moodData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Mood Over Time</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Journal List - Right Side */}
      <div className="w-80 p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Previous Entries</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {journals.map((journal) => (
            <div 
              key={journal.id}
              className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 
                  className="font-medium text-gray-900 text-sm flex-1 mr-2"
                  onClick={() => loadJournal(journal)}
                >
                  {journal.title}
                </h5>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${getMoodColor(journal.mood_score)}`}>
                    {getMoodEmoji(journal.mood_score)}
                  </span>
                  <button
                    onClick={() => deleteJournal(journal.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-2">
                {journal.content.substring(0, 60)}...
              </p>
              <p className="text-gray-400 text-xs">
                {new Date(journal.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
