'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const { login, signup, resetPassword, isAuthenticated, cloudMode } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/inicio');
  }, [isAuthenticated, router]);

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    return score;
  }, [password]);

  function changeMode(next: Mode) {
    setMode(next);
    setError('');
    setSuccess('');
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'forgot') {
      setBusy(true);
      const result = await resetPassword(email);
      setBusy(false);
      if (result.ok) {
        setSuccess('Enviamos um link para redefinir sua senha. Confira sua caixa de entrada e o spam.');
      } else setError(result.error || 'Não foi possível enviar o e-mail.');
      return;
    }

    if (mode === 'signup') {
      if (name.trim().length < 2) {
        setError('Digite seu nome para criar a conta.');
        return;
      }
      if (password.length < 6) {
        setError('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não são iguais.');
        return;
      }
    }

    setBusy(true);
    const result = mode === 'login'
      ? await login(email, password)
      : await signup(name, email, password);
    setBusy(false);

    if (result.ok) router.replace('/inicio');
    else setError(result.error || 'Não foi possível entrar.');
  }

  return (
    <div className="login-wrap auth-screen">
      <div className="auth-brand">
        <div className="login-logo">EF</div>
        <div>
          <span className="auth-kicker">EVOLUÇÃO FIT</span>
          <h1>{mode === 'signup' ? 'Crie sua conta' : mode === 'forgot' ? 'Recuperar senha' : 'Bem-vinda de volta'}</h1>
          <p>{mode === 'signup' ? 'Seu treino, sua evolução e seus recordes em um só lugar.' : mode === 'forgot' ? 'Informe seu e-mail e enviaremos as instruções.' : 'Continue evoluindo de onde você parou.'}</p>
        </div>
      </div>

      <form className="card login-card auth-card" onSubmit={submit}>
        {mode !== 'forgot' && (
          <div className="tabs auth-tabs">
            <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => changeMode('login')}>Entrar</button>
            <button type="button" className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => changeMode('signup')}>Criar conta</button>
          </div>
        )}

        {mode === 'forgot' && (
          <button type="button" className="auth-back" onClick={() => changeMode('login')}>← Voltar para entrar</button>
        )}

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {mode === 'signup' && (
          <div className="field">
            <label>NOME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você quer ser chamada?" autoComplete="name" required />
          </div>
        )}

        <div className="field" style={{ marginTop: mode === 'signup' ? 12 : 0 }}>
          <label>E-MAIL</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" required />
        </div>

        {mode !== 'forgot' && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>SENHA</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <>
            <div className="field" style={{ marginTop: 12 }}>
              <label>CONFIRMAR SENHA</label>
              <div className="password-field">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}>
                  {showConfirm ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="password-strength" aria-label="Força da senha">
              {[1, 2, 3, 4].map((item) => <span key={item} className={passwordStrength >= item ? 'on' : ''} />)}
            </div>
            <p className="password-hint">Use pelo menos 6 caracteres. Para maior segurança, misture letras e números.</p>
          </>
        )}

        {mode === 'login' && (
          <button type="button" className="forgot-link" onClick={() => changeMode('forgot')}>Esqueci minha senha</button>
        )}

        <button className="primary-btn full auth-submit" style={{ marginTop: 16 }} disabled={busy}>
          {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar no app' : mode === 'signup' ? 'Criar minha conta' : 'Enviar link de recuperação'}
        </button>

        {mode === 'signup' && <p className="auth-legal">Ao criar sua conta, seus treinos e sua evolução ficam vinculados ao seu acesso.</p>}

        {!cloudMode && (
          <div className="demo-note">
            <strong>Modo local para teste.</strong><br />
            O cadastro e a senha funcionam neste aparelho. Depois de configurar o Firebase, o aplicativo passa a usar autenticação real na nuvem e recuperação de senha por e-mail.
          </div>
        )}
      </form>

      <div className="auth-footer">Treine • Evolua • Conquiste ♡</div>
    </div>
  );
}
