import { createClient } from '@supabase/supabase-js';

const psycaiUrl = process.env.NEXT_PUBLIC_SUPABASE_PSYCAI_URL!;
const psycaiAnonKey = process.env.SUPABASE_PSYCAI_ANON_KEY!;
const psycaiServiceKey = process.env.SUPABASE_PSYCAI_SERVICE_ROLE_KEY!;

// Client-side client (for auth, public operations)
export const supabasePsycai = createClient(psycaiUrl, psycaiAnonKey);

// Server-side client (for privileged operations)
export const supabasePsycaiAdmin = createClient(psycaiUrl, psycaiServiceKey);

export interface PsycaiUser {
  id: string; // Auto-generated UUID
  firebase_uid: string;
  name: string | null;
  email: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}
