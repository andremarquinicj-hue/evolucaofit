import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });
export function HomeIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>}
export function DumbbellIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M6 8v8M3 9.5v5M18 8v8M21 9.5v5M6 12h12"/></svg>}
export function ChartIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/></svg>}
export function ClockIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>}
export function UserIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 3.7-6 8-6s7 2 8 6"/></svg>}
export function TrophyIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v2a4 4 0 0 0 4 4M16 6h3v2a4 4 0 0 1-4 4M12 13v4M9 20h6M10 17h4"/></svg>}
export function CalendarIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>}
export function PlusIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14"/></svg>}
export function ChevronIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="m9 18 6-6-6-6"/></svg>}
export function HeartIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/></svg>}
export function CheckIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="m5 12 4 4L19 6"/></svg>}
export function FlameIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M13 3s1 4-2 6c-3 2-4 4-4 7a5 5 0 0 0 10 0c0-2-1-4-3-6 0 3-2 4-2 4s1-5 1-11Z"/></svg>}
export function CameraIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/></svg>}
export function EditIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/></svg>}
export function LogoutIcon({size=22,...p}:IconProps){return <svg {...base(size)} {...p}><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>}
