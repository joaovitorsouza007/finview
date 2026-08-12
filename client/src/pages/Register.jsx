import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(data) {
    setBusy(true);
    setError('');
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível criar a conta.');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-500">Leva menos de um minuto.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="label">Nome (opcional)</label>
            <input {...register('name')} autoComplete="name" className="input" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input {...register('email')} type="email" required autoComplete="email" className="input" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              {...register('password')}
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="input"
            />
            <p className="mt-1 text-xs text-slate-400">Mínimo de 6 caracteres.</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
