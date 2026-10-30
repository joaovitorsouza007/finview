import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Categories from './pages/Categories.jsx';
import Goal from './pages/Goal.jsx';
import Accounts from './pages/Accounts.jsx';
import Rules from './pages/Rules.jsx';
import Settings from './pages/Settings.jsx';
import About from './pages/About.jsx';
import Loading from './components/Loading.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';
import { useState } from 'react';

// Área restrita: exige usuário logado
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Shell autenticado: o onboarding aparece por cima do layout enquanto
// o usuário ainda não concluiu o passo final (onboardedAt preenchido).
function AppShell() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(!user?.onboardedAt);

  return (
    <>
      <Layout />
      {showOnboarding && (
        <OnboardingWizard onFinish={() => setShowOnboarding(false)} />
      )}
    </>
  );
}

// Área pública: usuário logado não pode ver login/cadastro
function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Landing pública: página de entrada do projeto */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Guest><Login /></Guest>} />
        <Route path="/cadastro" element={<Guest><Register /></Guest>} />
        <Route path="/sobre" element={<About />} />

        {/* Área restrita do app */}
        <Route element={<Protected><AppShell /></Protected>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movimentacoes" element={<Transactions />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/metas" element={<Goal />} />
          <Route path="/contas" element={<Accounts />} />
          <Route path="/regras" element={<Rules />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Toasts globais de feedback (salvo, excluído, erro) */}
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </>
  );
}
