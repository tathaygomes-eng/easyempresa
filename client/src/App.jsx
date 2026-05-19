import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
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
import { obterConfig } from './services/empresaService';

function App() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [onboardingCompleto, setOnboardingCompleto] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioSalvo = localStorage.getItem('usuario');
        if (token && usuarioSalvo) {
            setUsuario(JSON.parse(usuarioSalvo));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (usuario) {
            obterConfig()
                .then((res) => {
                    if (res.success) {
                        setOnboardingCompleto(res.data.onboarding_completo === 1);
                    }
                })
                .catch(() => {
                    setOnboardingCompleto(false);
                });
        }
    }, [usuario]);

    const handleLogin = (usuario) => {
        setUsuario(usuario);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
        setOnboardingCompleto(null);
    };

    const handleOnboardingCompleto = () => {
        setOnboardingCompleto(true);
    };

    if (loading) {
        return <div className="loading-screen">Carregando...</div>;
    }

    if (!usuario) {
        return <Login onLogin={handleLogin} />;
    }

    if (onboardingCompleto === null) {
        return <div className="loading-screen">Carregando...</div>;
    }

    if (!onboardingCompleto) {
        return <Onboarding usuario={usuario} onCompleto={handleOnboardingCompleto} />;
    }

    return (
        <BrowserRouter>
            <Layout usuario={usuario} onLogout={handleLogout}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/financeiro/transacoes" element={<Transacoes />} />
                    <Route path="/financeiro/relatorios" element={<Relatorios />} />
                    <Route path="/financeiro/fluxo-caixa" element={<FluxoCaixa />} />
                    <Route path="/agenda/calendario" element={<Calendario />} />
                    <Route path="/agenda/clientes" element={<Clientes />} />
                    <Route path="/agenda/clientes/:id" element={<ClienteDetalhes />} />
                    <Route path="/planos" element={<Planos usuario={usuario} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
