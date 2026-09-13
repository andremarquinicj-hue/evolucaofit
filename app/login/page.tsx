'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';

export default function LoginPage(){
  const {login,signup,user,cloudMode}=useApp();
  const router=useRouter();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [mode,setMode]=useState<'login'|'signup'>('login'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(user) router.replace('/inicio')},[user,router]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');const result=mode==='login'?await login(email,password):await signup(email,password);setBusy(false);if(result.ok)router.replace('/inicio');else setError(result.error||'Erro ao entrar.');}
  return <div className="login-wrap">
    <div className="login-logo">EF</div><h1>Evolução Fit</h1><p>Disciplina hoje, a sua melhor versão amanhã.</p>
    <form className="card login-card" onSubmit={submit}>
      <div className="tabs"><button type="button" className={mode==='login'?'tab active':'tab'} onClick={()=>setMode('login')}>Entrar</button><button type="button" className={mode==='signup'?'tab active':'tab'} onClick={()=>setMode('signup')}>Criar conta</button></div>
      {error&&<div className="error">{error}</div>}
      <div className="field"><label>E-MAIL</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/></div>
      <div className="field" style={{marginTop:12}}><label>SENHA</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required/></div>
      <button className="primary-btn full" style={{marginTop:16}} disabled={busy}>{busy?'Carregando...':mode==='login'?'Entrar no app':'Criar minha conta'}</button>
      {!cloudMode&&<div className="demo-note"><strong>Modo demonstração ativo.</strong><br/>O Firebase ainda não está configurado, então os dados ficam salvos neste aparelho. Após inserir as chaves do Firebase, o login e a nuvem entram em funcionamento.</div>}
    </form>
  </div>
}
