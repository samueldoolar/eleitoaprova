'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro ao cadastrar: ${error.message}`);
      } else {
        setMessage('Cadastro realizado com sucesso! Você já pode fazer login.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro ao entrar: ${error.message}`);
      } else {
        router.push('/');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8', fontSize: '1.5rem', textAlign: 'center' }}>
          AprovaTrilha
        </h1>
        <p style={{ margin: '0 0 1.5rem 0', color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center' }}>
          {isSignUp ? 'Crie sua conta para estudar' : 'Acesse sua conta para continuar'}
        </p>

        {message && (
          <div style={{ backgroundColor: '#334155', color: '#facc15', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
