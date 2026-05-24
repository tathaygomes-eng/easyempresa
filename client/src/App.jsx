import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/financeiro/Transacoes';
import Relatorios from './pages/financeiro/Relatorios';
import FluxoCaixa from './pages/financeiro/FluxoCaixa';
import Calendario from './pages/agenda/Calendario';
import Clientes from './pages/agenda/Clientes';
import ClienteDetalhes from './pages/agenda/ClienteDetalhes';
import Planos from './pages/Planos';
import NotFound from './pages/NotFound';
import { obterConfig } from './services/empresaService';

function AppRoutes() {
    const { usuario, loading, signOut } = useAuth();
    const [onboardingCompleto, setOnboardingCompleto] = useState(null);

    useEffect(() => {
        if (usuario) {
            obterConfig()
                .then((res) => {
                    if (res.success) {
                        setOnboardingCompleto(res.data.onboarding_completo === 1);
                    } else {
                        setOnboardingCompleto(false);
                    }
                })
                .catch(() => {
                    setOnboardingCompleto(false);
                });
        } else {
            setOnboardingCompleto(null);
        }
    }, [usuario]);

    if (loading) {
        return <LoadingSpinner fullScreen message="Iniciando EasyEmpresa..." />;
    }

    if (!usuario) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    if (onboardingCompleto === null) {
        return <LoadingSpinner fullScreen message="Carregando seu espaco..." />;
    }

    if (!onboardingCompleto) {
        return <Onboarding usuario={usuario} onCompleto={() => setOnboardingCompleto(true)} />;
    }

    return (
        <Layout usuario={usuario} onLogout={signOut}>
            <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/financeiro/transacoes" element={<ProtectedRoute requiredFeature="transacoes"><Transacoes /></ProtectedRoute>} />
                <Route path="/financeiro/relatorios" element={<ProtectedRoute requiredFeature="relatorios"><Relatorios /></ProtectedRoute>} />
                <Route path="/financeiro/fluxo-caixa" element={<ProtectedRoute requiredFeature="fluxoCaixa"><FluxoCaixa /></ProtectedRoute>} />
                <Route path="/agenda/calendario" element={<ProtectedRoute requiredFeature="calendario"><Calendario /></ProtectedRoute>} />
                <Route path="/agenda/clientes" element={<ProtectedRoute requiredFeature="clientes"><Clientes /></ProtectedRoute>} />
                <Route path="/agenda/clientes/:id" element={<ProtectedRoute requiredFeature="clientes"><ClienteDetalhes /></ProtectedRoute>} />
                <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
