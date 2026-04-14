'use client';

export const dynamic = 'force-dynamic';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTERS, setStoredUser, generateId } from '@/lib/characters';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { trackSignupPageView, trackSignupComplete } from '@/lib/analytics';
import type { CharacterType } from '@/lib/types';

const COLOR: Record<CharacterType, string> = {
  three_day: '#FF9500', weather: '#FF9500', perfectionist: '#FF9500',
  godlife: '#FF9500', busy: '#FF9500',
};

export default function ResultPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = use(searchParams);
  const type = (params.type ?? 'three_day') as CharacterType;
  const char = CHARACTERS[type] ?? CHARACTERS.three_day;
  const color = COLOR[type];

  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackSignupPageView();
  }, []);

  async function handleSave() {
    const name = nickname.trim();
    if (!name) { setError('닉네임을 입력해줘!'); return; }
    if (name.length > 10) { setError('10자 이내로 입력해줘'); return; }

    setSaving(true);
    setError('');

    const session = await getSession();
    const id = session?.user.id ?? generateId();
    setStoredUser({ id, nickname: name, character_type: type });

    if (session) {
      try {
        await supabase.from('users').insert({ id, nickname: name, character_type: type });
      } catch { /* non-blocking */ }
    }

    trackSignupComplete(type);
    router.push('/');
  }

  return (
    <main className="app-container min-h-screen flex flex-col px-5 py-8 page-enter">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="pixel-badge mb-3" style={{ background: color, color: '#fff', fontSize: 8 }}>
          결과 발표
        </div>
        <p className="font-body" style={{ fontSize: 13, color: '#888' }}>
          당신의 운동 핑계 유형은...
        </p>
      </div>

      {/* Character card */}
      <div className="pixel-card mb-5 text-center" style={{ borderColor: color, borderWidth: 4 }}>
        <div className="flex justify-center mb-3">
          <CharacterSVG type={type} state="healthy" size={150} />
        </div>

        <div className="pixel-badge mb-2" style={{ background: color, color: '#fff', fontSize: 7 }}>
          {char.excuseType}
        </div>
        <h2 className="font-pixel mt-2 mb-4" style={{ fontSize: 18, color }}>{char.name}</h2>

        <div className="pixel-divider" />

        <p className="font-body" style={{ fontSize: 14, lineHeight: 1.8, color: '#444' }}>
          {char.description}
        </p>

        <div className="mt-4 p-3" style={{ background: char.bgColor, border: `3px solid ${color}` }}>
          <p className="font-pixel mb-2" style={{ fontSize: 7, color }}>대표 핑계</p>
          {char.exampleExcuses.map((e, i) => (
            <p key={i} className="font-body" style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>
              "{e}"
            </p>
          ))}
        </div>
      </div>

      {/* Nickname input */}
      <div className="pixel-card mb-4">
        <p className="font-body font-medium mb-3" style={{ fontSize: 14, color: '#333' }}>
          이 캐릭터와 함께할 닉네임을 정해줘
        </p>
        <input
          type="text"
          placeholder="닉네임 (최대 10자)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="pixel-input mb-2 font-body"
          maxLength={10}
        />
        {error && (
          <p className="font-body mb-2" style={{ fontSize: 12, color: '#FF4444' }}>{error}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="pixel-btn pixel-btn-primary w-full text-center font-pixel"
          style={{ fontSize: 14, background: color, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? '저장 중...' : '시작하기'}
        </button>
      </div>

      <button
        onClick={() => router.push('/test')}
        className="pixel-btn pixel-btn-secondary w-full text-center font-pixel"
        style={{ fontSize: 12 }}
      >
        테스트 다시 하기
      </button>
    </main>
  );
}
