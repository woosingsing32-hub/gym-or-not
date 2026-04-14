'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TEST_QUESTIONS, calculateCharacterType } from '@/lib/characters';
import { trackTestQuestion, trackTestComplete, trackCharacterAssigned } from '@/lib/analytics';
import type { CharacterType } from '@/lib/types';

export default function TestPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<CharacterType[]>([]);
  const [selected, setSelected] = useState<CharacterType | null>(null);
  const [leaving, setLeaving] = useState(false);

  const question = TEST_QUESTIONS[currentQ];
  const isLast = currentQ === TEST_QUESTIONS.length - 1;
  const progress = Math.round((currentQ / TEST_QUESTIONS.length) * 100);

  useEffect(() => {
    trackTestQuestion(question.id);
  }, [currentQ, question.id]);

  function handleNext() {
    if (!selected || leaving) return;
    const newAnswers = [...answers, selected];

    if (isLast) {
      setLeaving(true);
      const result = calculateCharacterType(newAnswers);
      trackTestComplete();
      trackCharacterAssigned(result);
      setTimeout(() => router.push(`/result?type=${result}`), 320);
      return;
    }

    setLeaving(true);
    setTimeout(() => {
      setAnswers(newAnswers);
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setLeaving(false);
    }, 220);
  }

  function handleBack() {
    if (currentQ === 0) { router.push('/onboarding'); return; }
    setCurrentQ((q) => q - 1);
    setAnswers((a) => a.slice(0, -1));
    setSelected(null);
  }

  const OPTION_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <main className="app-container min-h-screen flex flex-col px-5 py-6 page-enter">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleBack} className="pixel-btn pixel-btn-secondary pixel-btn-sm font-pixel" style={{ fontSize: 8 }}>
          ◀
        </button>
        <span className="font-pixel" style={{ fontSize: 8, color: '#888' }}>
          {currentQ + 1} / {TEST_QUESTIONS.length}
        </span>
        <Link href="/onboarding" className="pixel-btn pixel-btn-secondary pixel-btn-sm font-pixel" style={{ fontSize: 8 }}>
          ✕
        </Link>
      </div>

      {/* Progress bar */}
      <div className="pixel-progress mb-6">
        <div
          className="pixel-progress-fill"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#FF9500,#FF8C5A)' }}
        />
      </div>

      {/* Question card */}
      <div
        className="pixel-card mb-5 flex-1"
        style={{
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateX(-16px)' : 'translateX(0)',
          transition: 'all 0.22s ease',
        }}
      >
        {/* Q badge */}
        <div
          className="pixel-badge mb-4 inline-block"
          style={{ background: '#FF9500', color: '#fff', fontSize: 8 }}
        >
          Q{question.id}
        </div>

        {/* Question text */}
        <p className="font-body font-medium mb-6" style={{ fontSize: 16, lineHeight: 1.7, color: '#1a1a1a' }}>
          {question.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {question.options.map((opt, idx) => {
            const isSelected = selected === opt.type;
            return (
              <button
                key={idx}
                onClick={() => setSelected(opt.type)}
                className="option-btn"
                style={
                  isSelected
                    ? { background: '#FF9500', color: '#fff', boxShadow: 'none', transform: 'translate(3px,3px)', border: '3px solid #1a1a1a' }
                    : {}
                }
              >
                <span
                  className="font-pixel"
                  style={{ fontSize: 8, marginRight: 10, color: isSelected ? '#fff' : '#FF9500' }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!selected}
        className="pixel-btn pixel-btn-primary pixel-btn-lg w-full text-center font-pixel"
        style={{
          fontSize: 14,
          opacity: selected ? 1 : 0.35,
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
      >
        {isLast ? '결과 보기' : '다음'}
      </button>

      <p className="font-body text-center mt-3" style={{ fontSize: 11, color: '#aaa' }}>
        솔직하게 고를수록 더 정확한 결과가 나와<span className="blink">_</span>
      </p>
    </main>
  );
}
