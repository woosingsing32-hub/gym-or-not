'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser, setStoredUser, getStoredCheckins,
  CHARACTERS, getCharacterState, getRecentWorkoutCount, getConsecutiveWorkouts,
} from '@/lib/characters';
import { getSession, signOut, signInWithGoogle } from '@/lib/auth';
import { trackMypageVisited, trackRetestClick } from '@/lib/analytics';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { BottomTabBar } from '@/components/BottomTabBar';
import type { CharacterType, CharacterState, CheckIn } from '@/lib/types';

const COLOR: Record<CharacterType, string> = {
  three_day: '#FF9500', weather: '#FF9500', perfectionist: '#FF9500',
  godlife: '#FF9500', busy: '#FF9500',
};

const STATE_LABEL: Record<CharacterState, { text: string; color: string; bg: string; desc: string }> = {
  healthy: { text: '건강',  color: '#3AB85C', bg: '#E8F9EE', desc: '최근 7일 4회 이상 운동 — 완전 갓생!' },
  normal:  { text: '보통',  color: '#FF9500', bg: '#FFF4E5', desc: '최근 7일 2~3회 운동 — 나쁘지 않아' },
  wilted:  { text: '시들',  color: '#888888', bg: '#F0F0F0', desc: '최근 7일 1회 이하 — 캐릭터가 시들고 있어' },
};

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; nickname: string; character_type: CharacterType } | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState('');

  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState('');
  const [nickError, setNickError] = useState('');

  useEffect(() => {
    async function init() {
      const u = getStoredUser();
      if (!u) { router.replace('/onboarding'); return; }
      setUser(u);
      setCheckins(getStoredCheckins());
      trackMypageVisited();

      const session = await getSession();
      setIsLoggedIn(!!session);
      if (session?.user?.email) setLoggedInEmail(session.user.email);
    }
    init();
  }, [router]);

  const [loginError, setLoginError] = useState('');

  async function handleGoogleLogin() {
    setLoginError('');
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Login error:', error.message);
      setLoginError('로그인 중 오류가 발생했어. 잠시 후 다시 시도해줘.');
    }
  }

  async function handleSignOut() {
    await signOut();
    setIsLoggedIn(false);
    setLoggedInEmail('');
  }

  function saveNickname() {
    const name = nickDraft.trim();
    if (!name) { setNickError('닉네임을 입력해줘'); return; }
    if (name.length > 10) { setNickError('10자 이내로 입력해줘'); return; }
    const updated = { ...user!, nickname: name };
    setStoredUser(updated);
    setUser(updated);
    setEditingNick(false);
    setNickError('');
  }

  if (!user) return null;

  const char = CHARACTERS[user.character_type];
  const charState = getCharacterState(checkins);
  const recentCount = getRecentWorkoutCount(checkins);
  const streak = getConsecutiveWorkouts(checkins);
  const mainColor = COLOR[user.character_type];
  const stateInfo = STATE_LABEL[charState];
  const totalWorkouts = checkins.filter((c) => c.did_workout).length;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const c = checkins.find((ch) => new Date(ch.created_at).toDateString() === d.toDateString());
    return { day: ['일','월','화','수','목','금','토'][d.getDay()], date: d.getDate(), checkin: c };
  });

  return (
    <main className="app-container page-with-tab min-h-screen flex flex-col px-5 py-6 page-enter">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>마이페이지</h1>

      {/* ── 계정 / 로그인 (상단) ── */}
      {!isLoggedIn && (
        <div className="card mb-3" style={{ borderTop: '3px solid #e8e3da' }}>
          <div className="flex items-start gap-3 mb-4">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>로그인하고 데이터 저장하기</p>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                운동 기록과 캐릭터를 다른 기기에서도 유지하려면 로그인이 필요해.
              </p>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="btn w-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <GoogleIcon />
            <span style={{ fontWeight: 600 }}>구글로 로그인</span>
          </button>
          {loginError && (
            <p style={{ fontSize: 12, color: '#e53935', marginTop: 8, textAlign: 'center' }}>{loginError}</p>
          )}
        </div>
      )}

      {/* ── 테스트 다시하기 ── */}
      <div className="card mb-5" style={{ borderTop: '3px solid #e8e3da' }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>성향 테스트</p>
            <p style={{ fontSize: 12, color: '#aaa' }}>내 운동 핑계 유형이 바뀌었다면?</p>
          </div>
          <button
            onClick={() => { trackRetestClick(); router.push('/test'); }}
            className="btn btn-sm"
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            다시 하기
          </button>
        </div>
      </div>

      {/* ── Character card ── */}
      <div className="card mb-4" style={{ borderTop: `3px solid ${mainColor}`, background: char.bgColor }}>
        <div className="flex justify-between items-start mb-1">
          <span className="badge" style={{ background: stateInfo.bg, color: stateInfo.color }}>
            {stateInfo.text}
          </span>
        </div>
        <div className="flex justify-center my-3">
          <CharacterSVG type={user.character_type} state={charState} size={130} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: mainColor, marginBottom: 2 }}>
          {user.nickname}의 {char.name}
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#888' }}>{char.excuseType}</p>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 8, lineHeight: 1.7 }}>
          {stateInfo.desc}
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '이번 주 운동', value: recentCount, unit: '회', color: mainColor },
          { label: '연속 운동',   value: streak,      unit: '일', color: streak >= 3 ? '#3AB85C' : mainColor },
          { label: '총 운동 기록', value: totalWorkouts, unit: '회', color: '#888' },
        ].map((s) => (
          <div key={s.label} className="card-sm text-center">
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
              {s.value}<span style={{ fontSize: 11, fontWeight: 500 }}>{s.unit}</span>
            </p>
            <p className="section-label mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── 7-day activity ── */}
      <div className="card-sm mb-4">
        <p className="section-label mb-3">최근 7일</p>
        <div className="flex justify-between">
          {last7.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: d.checkin ? (d.checkin.did_workout ? mainColor : '#ddd') : 'rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {d.checkin && (
                  <span style={{ fontSize: 13, color: d.checkin.did_workout ? '#fff' : '#999', fontWeight: 700 }}>
                    {d.checkin.did_workout ? 'O' : 'X'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 10, color: '#bbb' }}>{d.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Character description ── */}
      <div className="card mb-4">
        <p style={{ fontSize: 13, fontWeight: 700, color: mainColor, marginBottom: 8 }}>{char.name} 설명</p>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>{char.description}</p>
        <div className="divider" />
        <p className="section-label mb-2">대표 핑계</p>
        {char.exampleExcuses.map((e, i) => (
          <p key={i} style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>"{e}"</p>
        ))}
      </div>

      {/* ── Nickname change ── */}
      <div className="card mb-4">
        <p className="section-label mb-3">닉네임 변경</p>
        {editingNick ? (
          <>
            <input
              type="text"
              value={nickDraft}
              onChange={(e) => setNickDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
              className="input mb-2"
              maxLength={10}
              placeholder="새 닉네임 (최대 10자)"
              autoFocus
            />
            {nickError && (
              <p style={{ fontSize: 12, color: '#e53935', marginBottom: 8 }}>{nickError}</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setEditingNick(false); setNickError(''); }}
                className="btn flex-1">
                취소
              </button>
              <button onClick={saveNickname}
                className="btn flex-1"
                style={{ background: mainColor, color: '#fff', borderColor: mainColor, fontWeight: 700 }}>
                저장
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{user.nickname}</p>
            <button onClick={() => { setNickDraft(user.nickname); setEditingNick(true); }}
              className="btn btn-sm">
              변경
            </button>
          </div>
        )}
      </div>

      {/* ── 로그인 상태일 때 계정 정보 (하단, 최소화) ── */}
      {isLoggedIn && (
        <div className="card-muted mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3AB85C', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#666' }}>{loggedInEmail}</p>
            </div>
            <button onClick={handleSignOut} className="btn-ghost btn" style={{ padding: '6px 10px' }}>
              로그아웃
            </button>
          </div>
        </div>
      )}

      <BottomTabBar />
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9086-2.2581c-.8055.54-1.8368.859-3.0478.859-2.3441 0-4.3282-1.5831-5.036-3.7104H.957v2.3318C2.4382 15.9832 5.4818 18 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.5955.1023-1.1741.2818-1.71V4.9582H.957A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.957 4.0418L3.964 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795Z" fill="#EA4335"/>
    </svg>
  );
}
