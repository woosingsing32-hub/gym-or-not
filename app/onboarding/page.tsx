'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { getStoredUser } from '@/lib/characters';
import { trackTestStart } from '@/lib/analytics';
import type { CharacterType } from '@/lib/types';

const PREVIEWS: CharacterType[] = ['three_day', 'weather', 'perfectionist', 'godlife', 'busy'];

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredUser()) router.replace('/');
  }, [router]);

  return (
    <main className="app-container min-h-screen flex flex-col items-center justify-between px-5 pt-16 pb-12 page-enter">
      {/* Logo + headline */}
      <div className="w-full text-center">
        <p className="font-pixel text-xs mb-3" style={{ color: '#aaa', letterSpacing: '0.2em' }}>
          d a n d a n
        </p>
        <h1 className="font-pixel mb-4" style={{ fontSize: 32, color: '#FF9500', lineHeight: 1.5, textShadow: '3px 3px 0 rgba(0,0,0,0.12)' }}>
          단단
        </h1>
        <div className="pixel-divider" style={{ width: 160, margin: '0 auto 20px' }} />
        <p className="font-body font-medium" style={{ fontSize: 17, lineHeight: 1.8, color: '#333' }}>
          오늘 운동 갈지 말지,<br />
          <span style={{ color: '#FF9500', fontWeight: 700 }}>캐릭터한테 물어봐</span>
        </p>
        <p className="font-body mt-2" style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
          나의 운동 핑계 유형을 파악하고<br />
          내 캐릭터가 매일 반응해줘
        </p>
      </div>

      {/* Character preview row */}
      <div className="flex items-end justify-center gap-3 my-8">
        {PREVIEWS.map((type, i) => (
          <div
            key={type}
            style={{
              transform: i === 2 ? 'scale(1.25)' : 'scale(0.8)',
              opacity: i === 2 ? 1 : i === 1 || i === 3 ? 0.65 : 0.3,
              transition: 'all 0.3s',
              transformOrigin: 'bottom center',
            }}
          >
            <CharacterSVG type={type} state={i === 2 ? 'healthy' : 'normal'} size={76} />
          </div>
        ))}
      </div>

      {/* Feature pills */}
      <div className="w-full flex flex-col gap-3 mb-8">
        {[
          { label: '유형 테스트', desc: '10문항으로 나의 핑계 캐릭터 파악' },
          { label: '매일 체크인', desc: '운동 여부·컨디션·메모 기록' },
          { label: '캐릭터 반응', desc: '기록에 따라 캐릭터가 직접 반응' },
        ].map((f) => (
          <div key={f.label} className="pixel-card-sm flex items-center gap-4">
            <div
              className="font-pixel"
              style={{ fontSize: 7, color: '#FF9500', border: '3px solid #FF9500', padding: '4px 6px', minWidth: 56, textAlign: 'center', whiteSpace: 'nowrap' }}
            >
              {f.label}
            </div>
            <p className="font-body" style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full">
        <Link href="/test" onClick={trackTestStart} className="pixel-btn pixel-btn-primary pixel-btn-lg block text-center w-full font-pixel" style={{ fontSize: 10 }}>
          테스트 시작하기
        </Link>
        <p className="font-body text-center mt-3" style={{ fontSize: 11, color: '#aaa' }}>
          약 2분 소요 · 총 10문항
        </p>
      </div>
    </main>
  );
}
