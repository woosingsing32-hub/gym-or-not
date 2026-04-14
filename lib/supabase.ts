import { createClient } from '@supabase/supabase-js'

function isValidUrl(s: string | undefined): boolean {
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey && rawKey.length > 20 ? rawKey : 'placeholder-anon-key-not-configured';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
