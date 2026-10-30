import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/brand/Logo.jsx';

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
      navigate('/dashboard');
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
          <Logo size={52} variant="mark" tone="color" className="mx-auto mb-3" />
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
            <input {...register('password')} type="password" required autoComplete="new-password" className="input" />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Entrar
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/sobre" className="hover:text-slate-600">
            Sobre o projeto
          </Link>{' '}
          ·{' '}
          <Link to="/" className="hover:text-slate-600">
            Página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
