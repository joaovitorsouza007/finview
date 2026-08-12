import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, Lock } from 'lucide-react';

// Página simulada de login do banco (modo demonstração). Em produção,
// o usuário é levado ao ambiente real da instituição pelo Pluggy.
export default function BankDemoAuth() {
  const [params] = useSearchParams();
  const institutionId = params.get('institutionId') || 'nubank';
  const callbackUrl = params.get('callbackUrl') || '/bancos/callback?ref=';
  const institutionName = {
    nubank: 'Nubank',
    itau: 'Itaú',
    bradesco: 'Bradesco',
    santander: 'Santander',
    bb: 'Banco do Brasil',
    caixa: 'Caixa',
  }[institutionId] || institutionId;

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!cpf.trim() || !password.trim()) return;
    setLoading(true);
    // Simula o tempo de autenticação e volta para o FinView com o item autorizado
    setTimeout(() => {
      const itemId = `demo-${institutionId}-${Date.now()}`;
      const separator = callbackUrl.includes('?') ? '&' : '?';
      window.location.href = `${callbackUrl}${separator}item_id=${itemId}`;
    }, 1400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-5 rounded-2xl bg-amber-100 px-4 py-3 text-center text-xs font-medium text-amber-800">
          Ambiente de demonstração — nenhum dado real é enviado.
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
              {institutionName[0]}
            </span>
            <h1 className="mt-3 text-lg font-bold text-slate-900">{institutionName}</h1>
            <p className="text-sm text-slate-500">Entre com sua conta para continuar</p>
          </div>

          <label className="label">CPF</label>
          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
            className="input mb-3"
          />
          <label className="label">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input mb-5"
          />

          <button
            type="submit"
            disabled={loading || !cpf.trim() || !password.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              'Acessar minha conta'
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="h-3 w-3" />
            Conexão segura e criptografada
          </p>
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-emerald-50/80">
          <ShieldCheck className="h-3.5 w-3.5" />
          O FinView vai receber os seus saldos e movimentações com sua autorização
        </p>
      </div>
    </div>
  );
}
