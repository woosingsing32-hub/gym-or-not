// app/api/ingest/health/route.ts
// iOS 단축어가 보내는 건강 데이터를 받아 Supabase에 저장하는 엔드포인트 (1단계 스파이크용)
//
// 필요한 환경변수 (서버 전용, NEXT_PUBLIC_ 접두사를 붙이지 마세요)
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// 요청 형식
//   POST /api/ingest/health
//   Authorization: Bearer <내 토큰>
//   { "samples": [ { "type": "steps", "start": "2026-11-06T00:00:00+09:00",
//                    "end": "2026-11-06T23:59:59+09:00", "value": 8421, "unit": "count" } ],
//     "note": "선택: 어떤 트리거로 실행됐는지 등" }

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";


const ALLOWED_TYPES = new Set(["steps", "sleep", "workout", "heart_rate", "active_energy"]);
const MAX_SAMPLES = 500;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

type Row = {
  user_id: string;
  type: string;
  start_at: string;
  end_at: string;
  value: number | null;
  value_text: string | null;
  unit: string | null;
  source: string;
};

export async function POST(req: Request) {
  // 1) 토큰 확인
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "missing token" }, { status: 401 });
  }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const db = admin();

  const { data: tokenRow } = await db
    .from("ingest_tokens")
    .select("id, user_id")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  // 2) 본문 파싱
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const samples = Array.isArray(body?.samples) ? body.samples : null;
  if (!samples) {
    return NextResponse.json({ error: "samples must be an array" }, { status: 400 });
  }
  if (samples.length > MAX_SAMPLES) {
    return NextResponse.json({ error: `too many samples (max ${MAX_SAMPLES})` }, { status: 413 });
  }

  // 3) 검증 (단축어는 숫자를 문자열로 보내는 경우가 있어 Number()로 변환)
  const rows: Row[] = [];
  let invalid = 0;
  for (const s of samples) {
    const start = Date.parse(s?.start);
    const end = Date.parse(s?.end);
    const num = s?.value === undefined || s?.value === null || s?.value === "" ? null : Number(s.value);
    if (
      !ALLOWED_TYPES.has(s?.type) ||
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      end < start ||
      (num !== null && Number.isNaN(num))
    ) {
      invalid++;
      continue;
    }
    rows.push({
      user_id: tokenRow.user_id,
      type: s.type,
      start_at: new Date(start).toISOString(),
      end_at: new Date(end).toISOString(),
      value: num,
      value_text: typeof s.value_text === "string" ? s.value_text.slice(0, 100) : null,
      unit: typeof s.unit === "string" ? s.unit.slice(0, 20) : null,
      source: "shortcut",
    });
  }

  // 4) 저장 (같은 기록이 다시 와도 중복 저장 안 됨)
  let inserted = 0;
  if (rows.length > 0) {
    const { data, error } = await db
      .from("health_samples")
      .upsert(rows, {
        onConflict: "user_id,type,start_at,end_at,source",
        ignoreDuplicates: true,
      })
      .select("id");
    if (error) {
      return NextResponse.json({ error: "db error", detail: error.message }, { status: 500 });
    }
    inserted = data?.length ?? 0;
  }

  // 5) 로그: 빈 배열(샘플 0건)도 기록해야 "자동화는 돌았는데 데이터가 비었다"를 구분할 수 있음
  await db.from("ingest_log").insert({
    user_id: tokenRow.user_id,
    sample_count: samples.length,
    inserted_count: inserted,
    client_note: typeof body?.note === "string" ? body.note.slice(0, 200) : null,
  });
  await db.from("ingest_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", tokenRow.id);

  return NextResponse.json({
    received: samples.length,
    valid: rows.length,
    inserted,
    skipped_invalid: invalid,
  });
}
