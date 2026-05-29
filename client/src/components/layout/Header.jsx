import { useLocation } from 'react-router-dom';
import './Header.css';

const pageTitles = {
    '/': 'Dashboard',
    '/financeiro/transacoes': 'Transacoes',
    '/financeiro/relatorios': 'Relatorios',
    '/financeiro/fluxo-caixa': 'Fluxo de Caixa',
    '/agenda/calendario': 'Calendario',
    '/agenda/clientes': 'Clientes',
    '/planos': 'Planos',
    '/configuracoes': 'Configuracoes',
};

export default function Header({ onMenuClick }) {
    const location = useLocation();

    const getTitle = () => {
        if (location.pathname.startsWith('/agenda/clientes/')) return 'Detalhes do Cliente';
        return pageTitles[location.pathname] || 'EasyEmpresa';
    };

    const hoje = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-title-row">
                    <button className="header-menu-btn" onClick={onMenuClick}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    </button>
                    <img src="/logo.png" alt="EasyEmpresa" className="header-logo-img" />
                    <h1 className="header-title">{getTitle()}</h1>
                </div>
                <span className="header-date">{hoje}</span>
            </div>
            <div className="header-right">
                <div className="header-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
            </div>
        </header>
    );
}
