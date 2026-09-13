'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartIcon, ClockIcon, DumbbellIcon, HomeIcon, UserIcon } from './icons';

const items = [
  { href: '/inicio', label: 'Início', Icon: HomeIcon },
  { href: '/treinos', label: 'Treinos', Icon: DumbbellIcon },
  { href: '/evolucao', label: 'Evolução', Icon: ChartIcon },
  { href: '/historico', label: 'Histórico', Icon: ClockIcon },
  { href: '/perfil', label: 'Perfil', Icon: UserIcon },
];
export default function BottomNav(){
  const pathname = usePathname();
  return <nav className="bottom-nav">{items.map(({href,label,Icon})=>{
    const active = pathname.startsWith(href) || (href==='/treinos' && pathname.startsWith('/treino'));
    return <Link className={active?'nav-item active':'nav-item'} href={href} key={href}><Icon/><span>{label}</span></Link>
  })}</nav>
}
