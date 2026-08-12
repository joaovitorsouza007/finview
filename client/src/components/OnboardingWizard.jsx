import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const GOALS = [
  { value: 'investir', label: 'Investir', emoji: '📈' },
  { value: 'quitar_dividas', label: 'Quitar dívidas', emoji: '💳' },
  { value: 'viajar', label: 'Viajar', emoji: '✈️' },
  { value: 'comprar_imovel', label: 'Comprar imóvel', emoji: '🏠' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
];

// Fluxo de boas-vindas exibido na primeira vez que o usuário entra.
// O progresso é salvo no servidor (onboardingStep) e o fluxo só aparece
// novamente para quem ainda não concluiu.
export default function OnboardingWizard({ onFinish }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(Math.min(user?.onboardingStep || 1, 3) || 1);
  const [income, setIncome] = useState(user?.monthlyIncome ? (user.monthlyIncome / 100).toFixed(2) : '');
  const [goal, setGoal] = useState(user?.primaryGoal || '');
  const [busy, setBusy] = useState(false);

  async function saveStep(data) {
    const res = await api.put('/auth/onboarding', data);
    updateUser(res.data.user);
  }

  async function next() {
    setBusy(true);
    try {
      if (step === 1) {
        await saveStep({ step: 2 });
        setStep(2);
      } else if (step === 2) {
        await saveStep({ step: 3, monthlyIncome: income ? Number(income) : undefined, primaryGoal: goal || undefined });
        setStep(3);
      } else {
        await saveStep({ complete: true });
        onFinish();
      }
    } catch {
      /* toast já avisou */
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    setBusy(true);
    try {
      await saveStep({ complete: true });
      onFinish();
    } catch {
      /* toast já avisou */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Barra de progresso */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-7">
          {step === 1 && (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white shadow-lg shadow-emerald-600/25">
                F
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo ao FinView</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Em 1 minuto você vai entender para onde seu dinheiro está indo — e o que precisa mudar.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Vamos organizar suas finanças</h1>
              <p className="mt-1 text-sm text-slate-500">Duas perguntinhas rápidas para ajustar tudo por você.</p>

              <label className="label mt-5">Qual a sua renda mensal aproximada? (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Ex.: 5200"
                className="input"
                autoFocus
              />

              <label className="label mt-4">Qual seu principal objetivo?</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      goal === g.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{g.emoji}</span> {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sparkles className="h-8 w-8" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Primeiro passo</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Adicione sua primeira movimentação para começar a ver seus gráficos, ou conecte seu banco para importar
                tudo de uma vez.
              </p>
              <div className="mt-5 grid gap-2">
                <button
                  onClick={() => { onFinish(); navigate('/movimentacoes'); }}
                  className="btn-primary w-full"
                >
                  Adicionar minha primeira movimentação <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { onFinish(); navigate('/bancos'); }}
                  className="btn-secondary w-full"
                >
                  Conectar conta bancária
                </button>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 && step < 3 ? (
              <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            ) : (
              <span />
            )}
            <button onClick={skip} disabled={busy} className="text-sm font-medium text-slate-400 hover:text-slate-600 disabled:opacity-50">
              Pular
            </button>
          </div>

          {step < 3 && (
            <button onClick={next} disabled={busy} className="btn-primary mt-3 w-full">
              {busy ? 'Salvando...' : step === 2 ? 'Continuar' : 'Começar'} <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {step === 3 && (
            <button onClick={next} disabled={busy} className="btn-primary mt-3 w-full">
              {busy ? 'Finalizando...' : 'Concluir'} <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
