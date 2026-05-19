import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Sidebar.css';

const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'grid' },
    {
        label: 'Financeiro',
        icon: 'dollar',
        badge: 'PREMIUM',
        children: [
            { path: '/financeiro/transacoes', label: 'Transacoes' },
            { path: '/financeiro/relatorios', label: 'Relatorios' },
            { path: '/financeiro/fluxo-caixa', label: 'Fluxo de Caixa' },
        ]
    },
    {
        label: 'Agenda',
        icon: 'calendar',
        children: [
            { path: '/agenda/calendario', label: 'Calendario' },
            { path: '/agenda/clientes', label: 'Clientes' },
        ]
    },
    { path: '/planos', label: 'Planos', icon: 'crown' }
];

const icons = {
    grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    dollar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    crown: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>,
    logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function Sidebar({ usuario, onLogout }) {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (item) => {
        if (item.path) return location.pathname === item.path;
        return item.children?.some(c => location.pathname.startsWith(c.path));
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo.png" alt="EasyEmpresa" className="sidebar-logo-img" />
                    <span>EasyEmpresa</span>
                </div>
                {usuario && (
                    <div className="sidebar-user">
                        <div className="user-avatar">{usuario.nome?.charAt(0)?.toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{usuario.nome}</span>
                            <span className="user-plan">{usuario.plano === 'premium' ? 'Premium' : usuario.plano === 'basico' ? 'Basico' : 'Gratuito'}</span>
                        </div>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">MENU</div>
                {menuItems.map(item => (
                    <div key={item.label} className="nav-item-wrapper">
                        {item.path ? (
                            <NavLink to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                {icons[item.icon]}
                                <span>{item.label}</span>
                            </NavLink>
                        ) : (
                            <>
                                <button
                                    className={`nav-item has-children ${isActive(item) ? 'active' : ''}`}
                                    onClick={() => toggleMenu(item.label)}
                                >
                                    {icons[item.icon]}
                                    <span>{item.label}</span>
                                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                                    <svg className={`nav-arrow ${openMenus[item.label] ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                {(openMenus[item.label] || isActive(item)) && (
                                    <div className="nav-children">
                                        {item.children.map(child => (
                                            <NavLink key={child.path} to={child.path} className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}>
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    {icons.logout}
                    <span>Sair</span>
                </button>
                <span className="version">v1.0.0</span>
            </div>
        </aside>
    );
}
