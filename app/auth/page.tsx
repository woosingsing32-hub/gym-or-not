'use client';

// /auth is no longer the entry point — login lives on /mypage.
// Redirect anyone who lands here to /mypage.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/mypage'); }, [router]);
  return null;
}
