import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(data) {
    setBusy(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white shadow-lg shadow-emerald-600/25">
            F
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo ao FinView</h1>
          <p className="mt-1 text-sm text-slate-500">Sua vida financeira em um só lugar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input
              {...register('email')}
              type="email"
              required
              autoComplete="email"
              className="input"
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              {...register('password')}
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
            <Sparkles className="h-4 w-4" /> Quer só explorar?
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            Use a conta demo: <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold">demo@finview.app</code> com senha{' '}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold">demo123</code>.
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-emerald-600 hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
