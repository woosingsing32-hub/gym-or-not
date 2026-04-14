'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser, getStoredCheckins, addStoredCheckin,
  CHARACTERS, getCharacterState, getCharacterResponse,
  getConsecutiveWorkouts, generateId,
} from '@/lib/characters';
import { supabase } from '@/lib/supabase';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { BottomTabBar } from '@/components/BottomTabBar';
import {
  trackWorkoutSelected, trackConditionInput,
  trackMemoInput, trackCheckinComplete,
} from '@/lib/analytics';
import type { CharacterType, CharacterResponse, CheckIn } from '@/lib/types';

const COLOR: Record<CharacterType, string> = {
  three_day: '#FF9500', weather: '#FF9500', perfectionist: '#FF9500',
  godlife: '#FF9500', busy: '#FF9500',
};

type Step = 'form' | 'response';

export default function RecordPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; nickname: string; character_type: CharacterType } | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [step, setStep] = useState<Step>('form');

  const [didWorkout, setDidWorkout] = useState<boolean | null>(null);
  const [condition, setCondition] = useState(3);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState<CharacterResponse | null>(null);
  const [todayAlreadyDone, setTodayAlreadyDone] = useState(false);
  const memoTracked = useRef(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.replace('/onboarding'); return; }
    setUser(u);
    const all = getStoredCheckins();
    setCheckins(all);
    const todayDone = all.some((c) => new Date(c.created_at).toDateString() === new Date().toDateString());
    setTodayAlreadyDone(todayDone);
  }, [router]);

  if (!user) return null;

  const char = CHARACTERS[user.character_type];
  const charState = getCharacterState(checkins);
  const mainColor = COLOR[user.character_type];

  async function handleSubmit() {
    if (didWorkout === null || saving || !user) return;
    setSaving(true);

    const streak = getConsecutiveWorkouts(checkins);
    const newCheckin: CheckIn = {
      id: generateId(),
      user_id: user.id,
      did_workout: didWorkout,
      condition,
      memo: memo.trim(),
      created_at: new Date().toISOString(),
    };
    addStoredCheckin(newCheckin);

    const resp = getCharacterResponse(
      user.character_type,
      didWorkout,
      condition,
      streak + (didWorkout ? 1 : 0),
    );
    setResponse(resp);

    try {
      await supabase.from('checkins').insert({ ...newCheckin });
    } catch { /* non-blocking */ }

    trackCheckinComplete(didWorkout, condition);
    setSaving(false);
    setStep('response');
  }

  // ── Response screen ──
  if (step === 'response' && response) {
    return (
      <main className="app-container page-with-tab min-h-screen flex flex-col px-5 py-6 page-enter">
        <div className="text-center mb-6">
          <CharacterSVG
            type={user.character_type}
            state={didWorkout ? 'healthy' : 'wilted'}
            size={140}
          />
          <span
            className="badge mt-3"
            style={{
              background: didWorkout ? '#E8F9EE' : '#F0F0F0',
              color: didWorkout ? '#3AB85C' : '#888',
            }}
          >
            {didWorkout ? '운동 완료! 💪' : '오늘은 패스'}
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {/* 오늘의 한마디: 공감 + 쓴소리 */}
          <div className="card" style={{ borderTop: `3px solid ${mainColor}` }}>
            <p className="section-label mb-3">오늘의 한마디</p>
            <p style={{ fontSize: 14, color: '#333', lineHeight: 1.8 }}>{response.empathy}</p>
            <div className="divider" />
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>{response.harsh}</p>
          </div>
          {/* 오늘의 미션 */}
          <div className="card" style={{ borderTop: '3px solid #3AB85C' }}>
            <p className="section-label mb-3" style={{ color: '#3AB85C' }}>오늘의 미션</p>
            <p style={{ fontSize: 14, color: '#333', lineHeight: 1.8 }}>{response.mission}</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="pixel-btn pixel-btn-primary w-full text-center font-pixel mb-3"
          style={{ fontSize: 10, background: mainColor }}
        >
          홈으로 돌아가기
        </button>

        <BottomTabBar />
      </main>
    );
  }

  // ── Already done today ──
  if (todayAlreadyDone) {
    const todayCheckin = checkins.find(
      (c) => new Date(c.created_at).toDateString() === new Date().toDateString(),
    );
    return (
      <main className="app-container page-with-tab min-h-screen flex flex-col px-5 py-6 page-enter">
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>오늘의 기록</h1>
        <div className="card text-center mb-6" style={{ borderTop: `3px solid ${mainColor}` }}>
          <CharacterSVG type={user.character_type} state={charState} size={120} />
          <p style={{ fontSize: 16, fontWeight: 700, color: mainColor, marginTop: 12 }}>오늘 기록 완료!</p>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
            {todayCheckin?.did_workout ? '오늘도 수고했어 💪' : '내일은 꼭 가보자'}
          </p>
        </div>
        {renderHistory(checkins, mainColor)}
        <BottomTabBar />
      </main>
    );
  }

  // ── Form ──
  return (
    <main className="app-container page-with-tab min-h-screen flex flex-col px-5 py-6 page-enter">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>오늘의 기록</h1>

      {/* Character mini */}
      <div className="flex items-center gap-3 mb-5">
        <CharacterSVG type={user.character_type} state={charState} size={64} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: mainColor }}>{char.name}</p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
      </div>

      {/* Workout? */}
      <div className="card mb-3">
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>오늘 운동 했어?</p>
        <div className="flex gap-3">
          {([true, false] as const).map((val) => {
            const isSelected = didWorkout === val;
            return (
              <button
                key={String(val)}
                onClick={() => { setDidWorkout(val); trackWorkoutSelected(val); }}
                className="flex-1"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'Noto Sans KR, sans-serif',
                  padding: '14px 8px',
                  borderRadius: 12,
                  border: isSelected
                    ? `2px solid ${val ? '#3AB85C' : '#888'}`
                    : '1.5px solid #e8e3da',
                  background: isSelected
                    ? (val ? '#E8F9EE' : '#F2F2F2')
                    : '#fff',
                  color: isSelected ? (val ? '#3AB85C' : '#555') : '#555',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {val ? '응, 갔어 💪' : '못 갔어 😅'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div className="card mb-3">
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>오늘 컨디션은?</p>
        <p className="section-label mb-3">1 = 최악 &nbsp;/&nbsp; 5 = 최고</p>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => { setCondition(n); trackConditionInput(n); }}
              className="condition-star"
              style={{ color: n <= condition ? '#FFD700' : '#e0dbd0' }}
            >
              ★
            </button>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: mainColor, marginTop: 8, fontWeight: 500 }}>
          {condition === 1 && '완전 최악...'}
          {condition === 2 && '별로야...'}
          {condition === 3 && '그냥 평범해'}
          {condition === 4 && '꽤 좋은 편!'}
          {condition === 5 && '최고야!'}
        </p>
      </div>

      {/* Memo */}
      <div className="card mb-5">
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
          {didWorkout ? '오늘 운동 어땠어?' : '못 간 이유는?'}
          <span style={{ fontSize: 12, color: '#bbb', fontWeight: 400, marginLeft: 6 }}>(선택)</span>
        </p>
        <textarea
          value={memo}
          onChange={(e) => {
              setMemo(e.target.value);
              if (!memoTracked.current && e.target.value.length > 0) {
                trackMemoInput();
                memoTracked.current = true;
              }
            }}
          placeholder={
            didWorkout === false
              ? (char.exampleExcuses[0] ? `예: ${char.exampleExcuses[0]}` : '오늘의 한 마디')
              : '짧게 기록해봐'
          }
          maxLength={200}
          rows={3}
          className="input mt-2"
          style={{ resize: 'none', lineHeight: 1.7 }}
        />
        <p style={{ textAlign: 'right', fontSize: 11, color: '#ccc', marginTop: 4 }}>{memo.length}/200</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={didWorkout === null || saving}
        className="pixel-btn pixel-btn-primary pixel-btn-lg w-full text-center font-pixel mb-6"
        style={{
          fontSize: 10,
          background: mainColor,
          opacity: didWorkout === null ? 0.35 : 1,
          cursor: didWorkout === null ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? '저장 중...' : '기록 완료'}
      </button>

      {/* Past records */}
      {checkins.length > 0 && renderHistory(checkins, mainColor)}

      <BottomTabBar />
    </main>
  );
}

function renderHistory(checkins: CheckIn[], mainColor: string) {
  return (
    <div>
      {/* Visual separator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: '#d4cfc6' }} />
        <p className="section-label">지난 기록</p>
        <div style={{ flex: 1, height: 1, background: '#d4cfc6' }} />
      </div>

      <div className="flex flex-col gap-2">
        {checkins.slice(0, 10).map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: c.did_workout ? 'rgba(58,184,92,0.07)' : 'rgba(0,0,0,0.03)',
            }}
          >
            {/* Status dot */}
            <div
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: c.did_workout ? mainColor : '#ddd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700, fontSize: 15, color: '#fff',
              }}
            >
              {c.did_workout ? 'O' : <span style={{ color: '#999' }}>X</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex justify-between items-center">
                <p style={{ fontSize: 13, fontWeight: 600, color: c.did_workout ? mainColor : '#888' }}>
                  {c.did_workout ? '운동 완료' : '오늘은 패스'}
                </p>
                <p style={{ fontSize: 11, color: '#bbb' }}>
                  {new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map((n) => (
                  <span key={n} style={{ fontSize: 10, color: n <= c.condition ? '#FFD700' : '#e0dbd0' }}>★</span>
                ))}
              </div>
              {c.memo && (
                <p style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.6 }}>{c.memo}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
