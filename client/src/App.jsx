import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
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
import { seedSystemCategories } from './db/seed';

function AppRoutes({ usuario, onLogin, onLogout }) {
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
        }
    }, [usuario]);

    if (!usuario) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={onLogin} />} />
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
        <Layout usuario={usuario} onLogout={onLogout}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/financeiro/transacoes" element={<Transacoes />} />
                <Route path="/financeiro/relatorios" element={<Relatorios />} />
                <Route path="/financeiro/fluxo-caixa" element={<FluxoCaixa />} />
                <Route path="/agenda/calendario" element={<Calendario />} />
                <Route path="/agenda/clientes" element={<Clientes />} />
                <Route path="/agenda/clientes/:id" element={<ClienteDetalhes />} />
                <Route path="/planos" element={<Planos usuario={usuario} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
}

function App() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Seed categorias do sistema na inicializacao
        seedSystemCategories();

        const token = localStorage.getItem('token');
        const usuarioSalvo = localStorage.getItem('usuario');
        if (token && usuarioSalvo) {
            try {
                setUsuario(JSON.parse(usuarioSalvo));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (usuario) => {
        setUsuario(usuario);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Iniciando EasyEmpresa..." />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AppRoutes
                    usuario={usuario}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                />
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
