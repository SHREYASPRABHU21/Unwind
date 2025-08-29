'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface Session {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  message_count: number;
}

export default function HistoryInterface() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions?userId=${user.uid}`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async (sessionId: string) => {
    try {
      const response = await fetch('/api/sessions/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId: user?.uid })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div className="h-full p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Session History</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{session.title}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => generatePDF(session.id)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {selectedSession?.id === session.id ? '▼' : '▶'}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">
                {new Date(session.created_at).toLocaleDateString()} • {session.message_count} messages
              </p>
              
              {selectedSession?.id === session.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <h5 className="font-medium text-gray-800 mb-2">Session Summary:</h5>
                  <p className="text-gray-700 text-sm">{session.summary}</p>
                </div>
              )}
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No sessions yet. Start your first therapy session!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
