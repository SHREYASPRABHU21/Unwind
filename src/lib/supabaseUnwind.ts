import { createClient } from '@supabase/supabase-js';

const unwindUrl = process.env.NEXT_PUBLIC_SUPABASE_UNWIND_URL!;
const unwindAnonKey = process.env.SUPABASE_UNWIND_ANON_KEY!;
const unwindServiceKey = process.env.SUPABASE_UNWIND_SERVICE_ROLE_KEY!;

// Client-side client
export const supabaseUnwind = createClient(unwindUrl, unwindAnonKey);

// Server-side client
export const supabaseUnwindAdmin = createClient(unwindUrl, unwindServiceKey);

export interface UnwindUser {
  id: string;
  firebase_uid: string;
  created_at: string;
}

export interface Session {
  id: string;
  firebase_uid: string;
  title: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Journal {
  id: string;
  firebase_uid: string;
  title: string;
  content: string;
  mood_score: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
