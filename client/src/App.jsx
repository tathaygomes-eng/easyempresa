import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Code splitting - cada pagina carrega so quando necessario
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transacoes = lazy(() => import('./pages/financeiro/Transacoes'));
const Relatorios = lazy(() => import('./pages/financeiro/Relatorios'));
const FluxoCaixa = lazy(() => import('./pages/financeiro/FluxoCaixa'));
const Calendario = lazy(() => import('./pages/agenda/Calendario'));
const Clientes = lazy(() => import('./pages/agenda/Clientes'));
const ClienteDetalhes = lazy(() => import('./pages/agenda/ClienteDetalhes'));
const Planos = lazy(() => import('./pages/Planos'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppRoutes() {
    const { usuario, loading, signOut } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen message="Iniciando EasyEmpresa..." />;
    }

    if (!usuario) {
        return (
            <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
        );
    }

    return (
        <Layout usuario={usuario} onLogout={signOut}>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/financeiro/transacoes" element={<ProtectedRoute requiredFeature="transacoes"><Transacoes /></ProtectedRoute>} />
                    <Route path="/financeiro/relatorios" element={<ProtectedRoute requiredFeature="relatorios"><Relatorios /></ProtectedRoute>} />
                    <Route path="/financeiro/fluxo-caixa" element={<ProtectedRoute requiredFeature="fluxoCaixa"><FluxoCaixa /></ProtectedRoute>} />
                    <Route path="/agenda/calendario" element={<ProtectedRoute requiredFeature="calendario"><Calendario /></ProtectedRoute>} />
                    <Route path="/agenda/clientes" element={<ProtectedRoute requiredFeature="clientes"><Clientes /></ProtectedRoute>} />
                    <Route path="/agenda/clientes/:id" element={<ProtectedRoute requiredFeature="clientes"><ClienteDetalhes /></ProtectedRoute>} />
                    <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
                    <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ErrorBoundary>
        </BrowserRouter>
    );
}
