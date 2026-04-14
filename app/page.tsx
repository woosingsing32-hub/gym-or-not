'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { BottomTabBar } from '@/components/BottomTabBar';
import {
  getStoredUser,
  getStoredCheckins,
  CHARACTERS,
  getCharacterState,
  getRecentWorkoutCount,
  getTodayMessage,
  getGoOrNotVerdict,
  VERDICT_LABEL,
  type GoCondition,
  type GoVerdict,
} from '@/lib/characters';
import { getSession, syncFromSupabase } from '@/lib/auth';
import {
  trackHomeVisited, trackAskButtonClick,
  trackConditionSelected, trackVerdictShown, trackCtaClick,
} from '@/lib/analytics';
import type { CharacterType, CharacterState, CheckIn } from '@/lib/types';

const COLOR: Record<CharacterType, string> = {
  three_day: '#FF9500', weather: '#FF9500', perfectionist: '#FF9500',
  godlife: '#FF9500', busy: '#FF9500',
};

const STATE_LABEL: Record<CharacterState, { text: string; color: string; bg: string }> = {
  healthy: { text: '건강',  color: '#3AB85C', bg: '#E8F9EE' },
  normal:  { text: '보통',  color: '#FF9500', bg: '#FFF4E5' },
  wilted:  { text: '시들',  color: '#888888', bg: '#F0F0F0' },
};

export default function HomePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<{ id: string; nickname: string; character_type: CharacterType } | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);

  type AskStep = 'idle' | 'choosing' | 'result';
  const [askStep, setAskStep] = useState<AskStep>('idle');
  const [goResult, setGoResult] = useState<{ verdict: GoVerdict; message: string } | null>(null);

  useEffect(() => {
    async function init() {
      const localUser = getStoredUser();
      if (!localUser) { router.replace('/onboarding'); return; }
      setUser(localUser);
      setCheckins(getStoredCheckins());
      setLoaded(true);
      trackHomeVisited();

      const session = await getSession();
      if (session && session.user.id === localUser.id) {
        const { profile, checkins: remote } = await syncFromSupabase(session.user.id);
        if (profile) setUser(profile);
        if (remote.length > 0) setCheckins(remote);
      }
    }
    init();
  }, [router]);

  if (!loaded || !user) return null;

  const char = CHARACTERS[user.character_type];
  const charState = getCharacterState(checkins);
  const recentCount = getRecentWorkoutCount(checkins);
  const mainColor = COLOR[user.character_type];
  const stateInfo = STATE_LABEL[charState];
  const todayMsg = getTodayMessage(user.character_type, charState, recentCount);

  const todayCheckin = checkins.find(
    (c) => new Date(c.created_at).toDateString() === new Date().toDateString(),
  );

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const c = checkins.find((ch) => new Date(ch.created_at).toDateString() === d.toDateString());
    return { day: ['일','월','화','수','목','금','토'][d.getDay()], checkin: c };
  });

  return (
    <main className="app-container page-with-tab min-h-screen flex flex-col px-5 pt-7 page-enter">

      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
            안녕, <span style={{ color: mainColor }}>{user.nickname}</span>!
          </p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>오늘도 단단하게</p>
        </div>
        <span
          className="badge"
          style={{ background: stateInfo.bg, color: stateInfo.color }}
        >
          {stateInfo.text}
        </span>
      </div>

      {/* Character */}
      <div className="flex flex-col items-center mb-6">
        <CharacterSVG type={user.character_type} state={charState} size={170} />
        <p style={{ fontSize: 12, color: mainColor, marginTop: 8, fontWeight: 600 }}>
          {user.nickname}의 {char.name}
        </p>
      </div>

      {/* 갈지말지 물어보기 */}
      <div className="mb-4">
        {askStep === 'idle' && (
          <button
            onClick={() => { trackAskButtonClick(); setAskStep('choosing'); }}
            className="pixel-btn pixel-btn-lg w-full text-center font-pixel"
            style={{ fontSize: 14, background: '#fff', color: mainColor, borderColor: mainColor }}
          >
            오늘 갈지 말지 물어보기
          </button>
        )}

        {askStep === 'choosing' && (
          <div className="card" style={{ borderTop: `3px solid ${mainColor}`, borderRadius: '0 0 16px 16px', paddingTop: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>오늘 컨디션은?</p>
            <div className="flex gap-2">
              {([
                { key: 'good',   label: '좋아 😊' },
                { key: 'normal', label: '보통 😐' },
                { key: 'bad',    label: '별로 😩' },
              ] as { key: GoCondition; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    const result = getGoOrNotVerdict(user.character_type, key, recentCount);
                    trackConditionSelected(key);
                    trackVerdictShown(result.verdict);
                    setGoResult(result);
                    setAskStep('result');
                  }}
                  className="btn flex-1"
                  style={{ fontSize: 13, padding: '12px 4px' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {askStep === 'result' && goResult && (() => {
          const { text, color } = VERDICT_LABEL[goResult.verdict];
          return (
            <div className="card" style={{ borderTop: `3px solid ${color}` }}>
              <span className="badge mb-3" style={{ background: color + '1A', color }}>
                {text}
              </span>
              <p style={{ fontSize: 15, color: '#333', lineHeight: 1.8, marginTop: 8 }}>
                "{goResult.message}"
              </p>
              <button
                onClick={() => { setAskStep('idle'); setGoResult(null); }}
                className="btn btn-sm w-full mt-4"
                style={{ color: '#888' }}
              >
                다시 물어보기
              </button>
            </div>
          );
        })()}
      </div>

      {/* 오늘의 한마디 */}
      <div className="card mb-4" style={{ background: char.bgColor }}>
        <p className="section-label mb-2">오늘의 한마디</p>
        <p style={{ fontSize: 14, lineHeight: 1.9, color: '#333' }}>"{todayMsg}"</p>
      </div>

      {/* 7-day dots */}
      <div className="card-sm mb-4">
        <p className="section-label mb-3">최근 7일</p>
        <div className="flex justify-between">
          {last7.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: d.checkin
                    ? d.checkin.did_workout ? mainColor : '#ddd'
                    : 'rgba(0,0,0,0.06)',
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
        <div className="flex gap-3 mt-3 justify-end">
          <div className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: 2, background: mainColor }} />
            <p style={{ fontSize: 10, color: '#aaa' }}>운동함</p>
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ddd' }} />
            <p style={{ fontSize: 10, color: '#aaa' }}>안 감</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card-sm text-center">
          <p style={{ fontSize: 24, fontWeight: 700, color: mainColor }}>
            {recentCount}<span style={{ fontSize: 13, fontWeight: 500 }}>회</span>
          </p>
          <p className="section-label mt-1">이번 주 운동</p>
        </div>
        <div className="card-sm text-center">
          <p style={{ fontSize: 24, fontWeight: 700, color: mainColor }}>
            {checkins.filter((c) => c.did_workout).length}<span style={{ fontSize: 13, fontWeight: 500 }}>회</span>
          </p>
          <p className="section-label mt-1">총 운동 기록</p>
        </div>
      </div>

      {/* CTA */}
      {todayCheckin ? (
        <div className="card text-center mb-2" style={{ background: char.bgColor }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: mainColor }}>오늘 기록 완료!</p>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
            {todayCheckin.did_workout ? '오늘도 수고했어 💪' : '내일은 꼭 가보자'}
          </p>
        </div>
      ) : (
        <Link
          href="/record"
          onClick={trackCtaClick}
          className="pixel-btn pixel-btn-primary pixel-btn-lg block text-center font-pixel mb-2"
          style={{ fontSize: 14, background: mainColor }}
        >
          오늘 기록하러 가기
        </Link>
      )}

      <BottomTabBar />
    </main>
  );
}
