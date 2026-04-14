export type CharacterType = 'three_day' | 'weather' | 'perfectionist' | 'godlife' | 'busy';
export type CharacterState = 'healthy' | 'normal' | 'wilted';

export interface UserProfile {
  id: string;
  nickname: string;
  character_type: CharacterType;
}

export interface CheckIn {
  id?: string;
  user_id?: string;
  did_workout: boolean;
  condition: number;
  memo: string;
  created_at: string;
}

export interface CharacterData {
  type: CharacterType;
  name: string;
  excuseType: string;
  description: string;
  color: string;
  bgColor: string;
  accentColor: string;
  exampleExcuses: string[];
}

export interface CharacterResponse {
  empathy: string;
  harsh: string;
  mission: string;
}

export interface TestQuestion {
  id: number;
  question: string;
  options: { text: string; type: CharacterType }[];
}
