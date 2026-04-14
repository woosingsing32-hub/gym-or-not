'use client';

import type { CharacterType, CharacterState } from '@/lib/types';

interface CharacterSVGProps {
  type: CharacterType;
  state?: CharacterState;
  size?: number;
  className?: string;
}

// public/characters/{PREFIX}-{VARIANT}.png
const PREFIX: Record<CharacterType, string> = {
  three_day:     'jakshim',
  weather:       'gisang',
  perfectionist: 'wanbyeok',
  godlife:       'gat',
  busy:          'busy',
};

const VARIANT: Record<CharacterState, string> = {
  healthy: 'healthy',
  normal:  'default',
  wilted:  'sad',
};

// default/sad = 4 frames, healthy = 5 frames, gat-healthy = 4 frames
function getFrameCount(type: CharacterType, state: CharacterState): number {
  if (state === 'healthy') return type === 'godlife' ? 4 : 5;
  return 4;
}

// Sprite cycle duration (seconds). Shorter = more energetic.
const CYCLE: Record<CharacterState, number> = {
  healthy: 0.5,   // 5×0.1s per frame — bouncy
  normal:  0.8,   // 4×0.2s per frame — calm
  wilted:  1.2,   // 4×0.3s per frame — sluggish
};

// Wrapper class drives the secondary motion (bounce / sway / droop)
const STATE_CLASS: Record<CharacterState, string> = {
  healthy: 'char-healthy',
  normal:  'char-normal',
  wilted:  'char-wilted',
};

export function CharacterSVG({ type, state = 'normal', size = 120, className = '' }: CharacterSVGProps) {
  const src = `/characters/${PREFIX[type]}-${VARIANT[state]}.png`;

  return (
    // Outer div carries the bounce/sway/droop animation
    <div
      className={`${STATE_CLASS[state]} ${className}`}
      style={{
        width:      size,
        height:     size,
        display:    'inline-block',
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width:          size,
          height:         size,
          display:        'block',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}

export default CharacterSVG;
