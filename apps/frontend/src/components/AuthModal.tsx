import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function AuthModal() {
  const { login, register, checkAuth } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#13151f', border: '1px solid #2d3148', borderRadius: '12px',
        padding: '40px', width: '360px', display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>UI Builder</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Multiplayer Low-Code Platform</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required style={inputStyle} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required style={inputStyle} />
          {error && <p style={{ color: '#f87171', fontSize: '12px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            background: '#6366f1', border: 'none', color: 'white', padding: '10px',
            borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '6px',
  padding: '10px 12px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
};
