'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { migrateLocalToSupabase } from '@/lib/auth';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handle() {
      try {
        const error = searchParams.get('error');
        if (error) {
          console.error('OAuth error:', error, searchParams.get('error_description'));
          router.replace('/mypage');
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await migrateLocalToSupabase(session.user.id);
        }
      } catch (e) {
        console.error('Auth callback error:', e);
      }

      router.replace('/mypage');
    }
    handle();
  }, [router, searchParams]);

  return (
    <main className="app-container min-h-screen flex flex-col items-center justify-center">
      <p style={{ fontSize: 14, color: '#aaa' }}>
        로그인 처리 중<span className="blink">_</span>
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
