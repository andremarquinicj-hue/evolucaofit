'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import BottomNav from './BottomNav';

export default function AppShell({children}:{children:React.ReactNode}){
  const {ready,user,cloudMode}=useApp();
  const router=useRouter();
  const pathname=usePathname();
  useEffect(()=>{
    if(ready && cloudMode && !user && pathname!=='/login') router.replace('/login');
  },[ready,cloudMode,user,pathname,router]);
  if(!ready) return <div className="splash"><div className="brand-mark">EF</div><strong>Evolução Fit</strong><span>Carregando seu progresso...</span></div>;
  if(cloudMode && !user && pathname!=='/login') return null;
  const showNav=pathname!=='/login';
  return <div className="app-frame"><main className={showNav?'page with-nav':'page'}>{children}</main>{showNav&&<BottomNav/>}</div>
}
