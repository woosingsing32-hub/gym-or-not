import { supabase } from './supabase';
import { setStoredUser, getStoredUser, getStoredCheckins } from './characters';
import type { CharacterType, CheckIn } from './types';

export type UserProfile = { id: string; nickname: string; character_type: CharacterType };

// ── Google OAuth ──────────────────────────────────────────────

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  });
}

// Sign out — does NOT clear localStorage so guest data is preserved
export async function signOut() {
  return supabase.auth.signOut();
}

// ── Session ───────────────────────────────────────────────────

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Supabase data fetchers ────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, nickname, character_type')
      .eq('id', userId)
      .maybeSingle();
    return data as UserProfile | null;
  } catch {
    return null;
  }
}

export async function fetchCheckins(userId: string): Promise<CheckIn[]> {
  try {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data ?? []) as CheckIn[];
  } catch {
    return [];
  }
}

// ── First Google login: migrate localStorage → Supabase ──────
// Called once from /auth/callback after OAuth succeeds.
export async function migrateLocalToSupabase(authUserId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const localUser = getStoredUser();
  if (!localUser) return;

  // 1. Create Supabase profile if this is a brand-new Google account
  const existing = await fetchUserProfile(authUserId);
  if (!existing) {
    try {
      await supabase.from('users').insert({
        id: authUserId,
        nickname: localUser.nickname,
        character_type: localUser.character_type,
      });
    } catch { /* ignore duplicate key */ }
  }

  // 2. Re-key localStorage user to the real auth UUID
  const updatedUser = { ...localUser, id: authUserId };
  setStoredUser(updatedUser);

  // 3. Upsert local checkins under the new user ID
  const local = getStoredCheckins();
  if (local.length > 0) {
    const toInsert = local.map((c) => ({ ...c, user_id: authUserId }));
    try {
      await supabase.from('checkins').upsert(toInsert, { onConflict: 'id' });
      localStorage.setItem(
        'dandan_checkins',
        JSON.stringify(local.map((c) => ({ ...c, user_id: authUserId }))),
      );
    } catch { /* non-blocking */ }
  }
}

// ── Background sync: Supabase → localStorage (used on home) ──
export async function syncFromSupabase(userId: string): Promise<{
  profile: UserProfile | null;
  checkins: CheckIn[];
}> {
  const [profile, checkins] = await Promise.all([
    fetchUserProfile(userId),
    fetchCheckins(userId),
  ]);
  if (profile) setStoredUser(profile);
  if (checkins.length > 0 && typeof window !== 'undefined') {
    localStorage.setItem('dandan_checkins', JSON.stringify(checkins));
  }
  return { profile, checkins };
}
