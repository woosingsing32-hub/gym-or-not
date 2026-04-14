import type { CharacterType, CharacterData, CharacterState, CheckIn, CharacterResponse, TestQuestion } from './types';

export const CHARACTERS: Record<CharacterType, CharacterData> = {
  three_day: {
    type: 'three_day',
    name: '작심삼일러',
    excuseType: '의지력 과잉형',
    description: '의지는 넘치는데 3일이 한계인 타입. 매번 "이번엔 다르다!"고 다짐하지만 결국 4일째 무너진다. 하지만 그 열정만큼은 진짜야.',
    color: '#FF6B35',
    bgColor: '#FFF3EF',
    accentColor: '#FF4500',
    exampleExcuses: ['오늘만 쉬고 내일부터', '이번 주는 쉬어가는 주야', '몸 회복되고 나서 시작할게'],
  },
  weather: {
    type: 'weather',
    name: '기상캐스터',
    excuseType: '날씨 민감형',
    description: '날씨가 조금만 이상해도 운동 취소. 비가 오거나, 너무 춥거나, 너무 덥거나, 흐리거나... 항상 이유가 생긴다.',
    color: '#F5CB46',
    bgColor: '#FFFBEF',
    accentColor: '#D4A800',
    exampleExcuses: ['비 올 것 같은데?', '오늘 너무 덥잖아', '이런 날씨엔 운동하면 안 되는데'],
  },
  perfectionist: {
    type: 'perfectionist',
    name: '완벽주의자',
    excuseType: '컨디션 집착형',
    description: '컨디션 100%가 아니면 절대 안 가는 타입. 몸이 조금이라도 무거우면 포기. 완벽한 준비가 될 때까지 기다리다 평생 못 간다.',
    color: '#2C3E6E',
    bgColor: '#EEF1FF',
    accentColor: '#1A2A50',
    exampleExcuses: ['오늘은 몸이 좀 무거운 것 같아', '컨디션이 완벽하지 않아서', '제대로 준비가 안 된 것 같아'],
  },
  godlife: {
    type: 'godlife',
    name: '갓생러',
    excuseType: '핑계 없음',
    description: '운동을 즐기는 유형. 핑계가 거의 없고 운동을 일상으로 만들었어. 모든 사람의 이상향이자 목표. 가끔 쉬는 것도 실력임을 배워야 해.',
    color: '#3AB85C',
    bgColor: '#EDFFF5',
    accentColor: '#1E8040',
    exampleExcuses: ['오늘은 몸 회복이 필요해', '액티브 레스트 데이야', '내일 더 잘하기 위해서 쉬어'],
  },
  busy: {
    type: 'busy',
    name: '바쁜척러',
    excuseType: '바쁨 과장형',
    description: '항상 할 일이 많다는 핑계로 운동을 미루는 타입. 근데 넷플릭스는 꼭 본다. 진짜 바쁜 건지 바쁜 척인지 본인도 모르는 상태.',
    color: '#E09448',
    bgColor: '#FFF8EF',
    accentColor: '#B06820',
    exampleExcuses: ['오늘 진짜 너무 바빠', '할 일이 산더미야', '마감이 내일인데 어떻게 해'],
  },
};

// 10 questions, 4 options each (one character type excluded per question, cycling through)
// Exclusion: Q1,Q6→busy / Q2,Q7→godlife / Q3,Q8→perfectionist / Q4,Q9→weather / Q5,Q10→three_day
export const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: '운동 계획을 세웠는데 당일에 취소할 가능성은?',
    options: [
      { text: '"이번엔 꼭 간다!"다짐 후 3일째 포기 중', type: 'three_day' },
      { text: '날씨 앱 먼저 확인하고 결정함', type: 'weather' },
      { text: '컨디션이 완벽해야만 가는 편', type: 'perfectionist' },
      { text: '계획 세운 건 무조건 지킴', type: 'godlife' },
    ],
  },
  {
    id: 2,
    question: '운동 안 간 날 가장 많이 하는 생각은?',
    options: [
      { text: '"내일부터 진짜로 할 거야!"', type: 'three_day' },
      { text: '"날씨가 별로였으니까 어쩔 수 없지"', type: 'weather' },
      { text: '"컨디션이 100%가 아니었으니까"', type: 'perfectionist' },
      { text: '"오늘 진짜 할 일이 너무 많았어"', type: 'busy' },
    ],
  },
  {
    id: 3,
    question: '갑자기 비가 오면?',
    options: [
      { text: '"아 오늘은 쉬어야겠다. 내일부터 다시!"', type: 'three_day' },
      { text: '"이런 날씨에 무리하면 감기 걸려"', type: 'weather' },
      { text: '"출퇴근도 힘든데 운동까지 어떻게 해"', type: 'busy' },
      { text: '"비 와도 상관없어. 헬스장은 실내잖아"', type: 'godlife' },
    ],
  },
  {
    id: 4,
    question: '운동 목표를 세울 때 나는?',
    options: [
      { text: '"이번 달은 20kg 감량! 매일 2시간씩!"', type: 'three_day' },
      { text: '"완벽한 식단과 운동 계획을 세운 후 시작"', type: 'perfectionist' },
      { text: '"바쁜 일 끝나면 그때부터 열심히 할 거야"', type: 'busy' },
      { text: '"일주일에 4회, 꾸준히. 작지만 확실하게"', type: 'godlife' },
    ],
  },
  {
    id: 5,
    question: '친구가 같이 운동하자고 하면?',
    options: [
      { text: '"날씨 보고 연락할게"', type: 'weather' },
      { text: '"같이 가면 내 루틴이 흐트러지는데..."', type: 'perfectionist' },
      { text: '"요즘 너무 바빠서... 다음에 가자"', type: 'busy' },
      { text: '"오케이! 몇 시에 만날까?"', type: 'godlife' },
    ],
  },
  {
    id: 6,
    question: '운동 안 하면 기분이 어때?',
    options: [
      { text: '"죄책감 MAX. 근데 내일 또 안 감"', type: 'three_day' },
      { text: '"날씨 탓이라 어쩔 수 없었어"', type: 'weather' },
      { text: '"컨디션 완벽할 때 제대로 하려고 아낀 거야"', type: 'perfectionist' },
      { text: '"오늘은 회복 일이었어. 내일 더 잘하면 돼"', type: 'godlife' },
    ],
  },
  {
    id: 7,
    question: '운동 유튜브 영상을 보면?',
    options: [
      { text: '"나도 저렇게 할 수 있어! 내일부터 시작하자!"', type: 'three_day' },
      { text: '"저 사람 자세가 완벽하지 않은데..."', type: 'perfectionist' },
      { text: '"저 사람들은 시간이 어디서 나는 거야..."', type: 'busy' },
      { text: '"오 새로운 루틴이네. 내일 따라해봐야지"', type: 'godlife' },
    ],
  },
  {
    id: 8,
    question: '헬스장 등록은 언제 하나요?',
    options: [
      { text: '월초마다 새로 등록함 (그리고 월말엔 못 감)', type: 'three_day' },
      { text: '날씨 좋은 날에 충동적으로 등록함', type: 'weather' },
      { text: '등록은 했는데 가는 시간이 없음', type: 'busy' },
      { text: '꾸준히 다니고 있어서 재등록만 함', type: 'godlife' },
    ],
  },
  {
    id: 9,
    question: '운동 전 준비하기 귀찮으면?',
    options: [
      { text: '"귀찮아서 그냥 오늘은 패스"', type: 'three_day' },
      { text: '"준비가 완벽하지 않으면 시작하기 싫어"', type: 'perfectionist' },
      { text: '"준비할 시간도 없어. 지금 얼마나 바쁜데"', type: 'busy' },
      { text: '"5분이면 준비 끝. 간단하게 해"', type: 'godlife' },
    ],
  },
  {
    id: 10,
    question: '운동 관련 앱을 사용한다면?',
    options: [
      { text: '날씨 앱이 제일 중요. 운동 앱은 보조', type: 'weather' },
      { text: '완벽한 앱 찾다가 결국 운동 못 함', type: 'perfectionist' },
      { text: '앱 쓸 시간도 없음', type: 'busy' },
      { text: '꾸준히 기록하고 데이터 분석까지 함', type: 'godlife' },
    ],
  },
];

export function calculateCharacterType(answers: CharacterType[]): CharacterType {
  const counts: Record<CharacterType, number> = {
    three_day: 0, weather: 0, perfectionist: 0, godlife: 0, busy: 0,
  };
  answers.forEach((a) => { counts[a]++; });
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as CharacterType;
}

export function getCharacterState(checkins: CheckIn[]): CharacterState {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const count = checkins.filter((c) => new Date(c.created_at) >= sevenDaysAgo && c.did_workout).length;
  if (count >= 4) return 'healthy';
  if (count >= 2) return 'normal';
  return 'wilted';
}

export function getRecentWorkoutCount(checkins: CheckIn[]): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return checkins.filter((c) => new Date(c.created_at) >= sevenDaysAgo && c.did_workout).length;
}

export function getConsecutiveWorkouts(checkins: CheckIn[]): number {
  const sorted = [...checkins]
    .filter((c) => c.did_workout)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  let streak = 0;
  let prev = new Date();
  prev.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.created_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((prev.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) { streak++; prev = d; } else break;
  }
  return streak;
}

export function getCharacterResponse(
  characterType: CharacterType,
  didWorkout: boolean,
  condition: number,
  consecutiveWorkouts: number,
): CharacterResponse {
  if (didWorkout) {
    if (consecutiveWorkouts >= 3) {
      return {
        empathy: `${consecutiveWorkouts}일째 연속이야?`,
        harsh: '이러다 갓생러 되는 거 아니야?',
        mission: '오늘도 수고했어. 내일도 기대할게!',
      };
    }
    if (condition >= 4) {
      return {
        empathy: '오늘 완전 갓생이었는데?',
        harsh: '최고야!',
        mission: '이 기세 유지해봐. 내일도 가능!',
      };
    }
    return {
      empathy: '몸도 안 좋은데 갔어?',
      harsh: '진짜 대단한데. 오늘은 진짜야.',
      mission: '내일은 좀 더 쉽게 갈 수 있을 거야!',
    };
  }

  const map: Record<CharacterType, CharacterResponse> = {
    three_day: {
      empathy: '오늘도 내일부터 모드 ON이구나ㅋㅋ',
      harsh: '근데 이거 저번 주에도 들었는데?',
      mission: '오늘 밤 운동복만 꺼내놔봐',
    },
    weather: {
      empathy: '날씨 때문에 힘들었구나',
      harsh: '헬스장은 실내인데...?',
      mission: '실내 스트레칭 5분만',
    },
    perfectionist: {
      empathy: '컨디션이 별로면 쉬는 것도 전략이지',
      harsh: '완벽한 날은 평생 안 와',
      mission: '내일 운동복만 입어봐',
    },
    godlife: {
      empathy: '그럴 수도 있어.',
      harsh: '갓생러가 이러면 안 되지!',
      mission: '내일은 꼭 다시 시작해',
    },
    busy: {
      empathy: '오늘 진짜 바빴구나',
      harsh: '근데 넷플릭스는 봤지?',
      mission: '자기 전 스트레칭 3분만',
    },
  };
  return map[characterType];
}

export function getTodayMessage(
  characterType: CharacterType,
  charState: CharacterState,
  recentWorkouts: number,
): string {
  if (charState === 'healthy') {
    return `${recentWorkouts}회 운동 중이야. 완전 갓생! 오늘도 가자!`;
  }
  if (charState === 'normal') {
    return `이번 주 ${recentWorkouts}회. 괜찮은 페이스야. 오늘 한 번 더?`;
  }
  const msgs: Record<CharacterType, string> = {
    three_day: '내일부터가 아니라 오늘 딱 10분만 해봐.',
    weather: '날씨 확인은 그만하고 일단 신발 신어봐.',
    perfectionist: '완벽할 필요 없어. 5분만 움직여봐.',
    godlife: '갓생러가 슬럼프? 다시 시작하기 딱 좋은 날이야.',
    busy: '바쁘다고? 자기 전 스트레칭 3분은 할 수 있잖아.',
  };
  return msgs[characterType];
}

// localStorage helpers
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('dandan_user') ?? 'null'); } catch { return null; }
}

export function setStoredUser(user: { id: string; nickname: string; character_type: CharacterType }) {
  localStorage.setItem('dandan_user', JSON.stringify(user));
}

export function getStoredCheckins(): CheckIn[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('dandan_checkins') ?? '[]'); } catch { return []; }
}

export function addStoredCheckin(checkin: CheckIn) {
  const all = getStoredCheckins();
  all.unshift(checkin);
  localStorage.setItem('dandan_checkins', JSON.stringify(all));
}

export function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

// ─────────────────────────────────────────────────────────────
// "오늘 갈지 말지" 판정
// ─────────────────────────────────────────────────────────────

export type GoCondition = 'good' | 'normal' | 'bad';
export type GoVerdict   = 'go_now' | 'go_if_possible' | 'go_or_rest' | 'light_go' | 'rest';

export const VERDICT_LABEL: Record<GoVerdict, { text: string; color: string }> = {
  go_now:         { text: '무조건 가라!',          color: '#E53935' },
  go_if_possible: { text: '가는 게 좋아',          color: '#FF6B35' },
  go_or_rest:     { text: '가도 되고 쉬어도 돼',  color: '#3AB85C' },
  light_go:       { text: '가볍게라도 가봐',       color: '#D4A800' },
  rest:           { text: '오늘은 쉬어',           color: '#888888' },
};

// recentCount = 최근 7일 운동 횟수
export function getGoOrNotVerdict(
  type: CharacterType,
  condition: GoCondition,
  recentCount: number,
): { verdict: GoVerdict; message: string } {
  const countLevel = recentCount >= 4 ? 'many' : recentCount >= 2 ? 'normal' : 'few';

  let verdict: GoVerdict;
  if (condition === 'bad') {
    verdict = countLevel === 'few' ? 'light_go' : 'rest';
  } else if (countLevel === 'many') {
    verdict = 'go_or_rest';        // 좋음/보통 + 많음
  } else if (countLevel === 'normal') {
    verdict = 'go_if_possible';    // 좋음/보통 + 보통
  } else {
    verdict = 'go_now';            // 좋음/보통 + 적음
  }

  const MESSAGES: Record<GoVerdict, Record<CharacterType, string>> = {
    go_now: {
      three_day:     '이번 주 거의 못 갔잖아. 오늘은 진짜야. 지금 가!',
      weather:       '날씨 핑계 댈 컨디션도 아니고 횟수도 없어. 고고!',
      perfectionist: '이번 주 실적이 너무 저조해. 오늘은 무조건 가야 해.',
      godlife:       '이번 주 좀 쉬었지? 오늘은 당연히 가야지!',
      busy:          '바빴던 거 알아. 근데 오늘만큼은 30분만 내봐.',
    },
    go_if_possible: {
      three_day:     '컨디션 괜찮으면 가는 거야. 내일부터는 없어!',
      weather:       '오늘 날씨랑 몸 상태 봐서는 가도 될 것 같은데?',
      perfectionist: '조건이 갖춰졌어. 가는 게 맞아.',
      godlife:       '가볍게라도 가봐. 분명 후회 안 할 거야!',
      busy:          '딱 30분만. 그 정도는 낼 수 있잖아.',
    },
    go_or_rest: {
      three_day:     '이번 주 잘 했어! 오늘은 쉬어도 돼. 근데 내일은 가야 해.',
      weather:       '이번 주 열심히 했으니까 오늘은 날씨 봐서 결정해도 돼.',
      perfectionist: '이번 주 목표 달성했어. 오늘은 선택이야.',
      godlife:       '충분히 했어! 오늘은 몸이 원하는 대로 해.',
      busy:          '이번 주 바쁜 중에도 잘 했어. 오늘은 쉬어도 OK.',
    },
    light_go: {
      three_day:     '몸은 좀 그렇지만 이번 주 너무 안 갔어. 10분만이라도!',
      weather:       '몸은 별론데 이번 주 횟수가 너무 없어. 산책이라도?',
      perfectionist: '컨디션이 완벽하진 않지만 이번 주 실적이 너무 아쉬워. 스트레칭이라도.',
      godlife:       '몸이 별로면 억지로는 말고. 가볍게 걷기 정도는 어때?',
      busy:          '몸도 별론데 이번 주도 못 갔네. 5분만이라도 움직여봐.',
    },
    rest: {
      three_day:     '오늘은 진짜 쉬어. 몸이 신호 보내고 있잖아.',
      weather:       '이런 날은 쉬는 게 맞아. 내일 날씨 보고 결정해.',
      perfectionist: '컨디션 안 좋을 때 운동은 역효과야. 오늘은 휴식이 정답.',
      godlife:       '몸이 쉬라고 하면 쉬어야 해. 내일 더 잘할 수 있어.',
      busy:          '오늘은 진짜 쉬어. 이건 핑계가 아니라 회복이야.',
    },
  };

  return { verdict, message: MESSAGES[verdict][type] };
}
