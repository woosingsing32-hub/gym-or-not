'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUser } from '@/lib/characters';
import { trackRecordTabClick } from '@/lib/analytics';

const COLOR_MAP: Record<string, string> = {
  three_day:     '#FF9500',
  weather:       '#FF9500',
  perfectionist: '#FF9500',
  godlife: '#FF9500',
  busy:          '#FF9500',
};

function useCharacterColor(): string {
  if (typeof window === 'undefined') return '#FF9500';
  const user = getStoredUser();
  return user ? (COLOR_MAP[user.character_type] ?? '#FF9500') : '#FF9500';
}

function HomeIcon({ active, color }: { active: boolean; color: string }) {
  const c = active ? color : '#BBBBBB';
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" shapeRendering="crispEdges">
      <rect x="9"  y="0"  width="4" height="2" fill={c} />
      <rect x="7"  y="2"  width="8" height="2" fill={c} />
      <rect x="5"  y="4"  width="12" height="2" fill={c} />
      <rect x="3"  y="6"  width="16" height="2" fill={c} />
      <rect x="3"  y="8"  width="16" height="12" fill={c} />
      <rect x="8"  y="13" width="6"  height="7"  fill={active ? '#fff' : '#DDD'} />
      <rect x="13" y="16" width="1"  height="1"  fill={c} />
    </svg>
  );
}

function RecordIcon({ active, color }: { active: boolean; color: string }) {
  const c = active ? color : '#BBBBBB';
  const bg = active ? '#fff' : '#F0F0F0';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" shapeRendering="crispEdges">
      <rect x="2"  y="3"  width="16" height="17" fill={bg} />
      <rect x="2"  y="3"  width="16" height="17" fill="none" stroke={c} strokeWidth="2" />
      <rect x="7"  y="0"  width="6"  height="5"  fill={c} />
      <rect x="8"  y="1"  width="4"  height="3"  fill={bg} />
      <rect x="5"  y="8"  width="10" height="2" fill={c} />
      <rect x="5"  y="12" width="10" height="2" fill={c} />
      <rect x="5"  y="16" width="6"  height="2" fill={c} />
    </svg>
  );
}

function MyPageIcon({ active, color }: { active: boolean; color: string }) {
  const c = active ? color : '#BBBBBB';
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" shapeRendering="crispEdges">
      <rect x="6"  y="0"  width="8"  height="8"  fill={c} />
      <rect x="8"  y="8"  width="4"  height="2"  fill={c} />
      <rect x="2"  y="10" width="16" height="12" fill={c} />
      <rect x="7"  y="10" width="6"  height="4"  fill={active ? '#fff' : '#DDD'} />
    </svg>
  );
}

const TABS = [
  { href: '/',       label: '홈',  Icon: HomeIcon },
  { href: '/record', label: '기록', Icon: RecordIcon },
  { href: '/mypage', label: '마이', Icon: MyPageIcon },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  const activeColor = useCharacterColor();

  return (
    <nav className="bottom-tab-bar">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={href === '/record' ? trackRecordTabClick : undefined}
            className={`tab-item ${active ? 'active' : ''}`}
            style={active ? { background: activeColor + '15' } : {}}
          >
            <Icon active={active} color={activeColor} />
            <span className="tab-label" style={active ? { color: activeColor } : {}}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomTabBar;
