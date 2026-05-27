import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getResumo, getProximosAgendamentos, getTransacoesRecentes } from '../services/dashboardService';
import { formatBRL, formatDateTime, statusColors, statusLabels } from '../utils/formatters';
import { PLANOS } from '../config/planos';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { planoKey } = useAuth();
    const [resumo, setResumo] = useState(null);
    const [agendamentos, setAgendamentos] = useState([]);
    const [transacoes, setTransacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    const planoInfo = PLANOS[planoKey] || PLANOS.gratuito;

    useEffect(() => {
        Promise.all([getResumo(), getProximosAgendamentos(), getTransacoesRecentes()])
            .then(([r, a, t]) => {
                setResumo(r.data);
                setAgendamentos(a.data);
                setTransacoes(t.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner fullScreen message="Carregando dashboard..." />;

    const cards = [
        {
            label: 'Saldo Total', value: resumo?.saldo,
            color: resumo?.saldo >= 0 ? 'var(--success)' : 'var(--danger)',
            iconBg: resumo?.saldo >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resumo?.saldo >= 0 ? '#059669' : '#DC2626'} strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        },
        {
            label: 'Receitas do Mes', value: resumo?.receitasMes,
            color: 'var(--success)',
            iconBg: 'var(--success-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        },
        {
            label: 'Despesas do Mes', value: resumo?.despesasMes,
            color: 'var(--danger)',
            iconBg: 'var(--danger-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
        },
        {
            label: 'Contas Pendentes', value: resumo?.totalPendentes,
            sub: `${resumo?.pendentes} pendencias`,
            color: 'var(--warning)',
            iconBg: 'var(--warning-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        },
    ];

    return (
        <div className="dashboard">
            {/* Banner do plano */}
            {planoKey !== 'premium' && (
                <div className="plan-banner" style={{ borderColor: planoInfo?.cor }}>
                    <div className="plan-banner-info">
                        <span className="plan-banner-name" style={{ color: planoInfo?.cor }}>
                            Plano {planoInfo?.nome}
                        </span>
                        <span className="plan-banner-limits">
                            {planoInfo.limites.transacoesMes === Infinity ? 'Transacoes ilimitadas' : `${planoInfo.limites.transacoesMes} transacoes/mes`}
                            {' · '}
                            {planoInfo.limites.clientes === Infinity ? 'Clientes ilimitados' : `${planoInfo.limites.clientes} clientes`}
                        </span>
                    </div>
                    <button className="plan-banner-btn" onClick={() => navigate('/planos')}>
                        Fazer upgrade
                    </button>
                </div>
            )}

            <div className="dashboard-cards">
                {cards.map(card => (
                    <div key={card.label} className="dash-card">
                        <div className="dash-card-header">
                            <div className="dash-card-icon" style={{ background: card.iconBg }}>
                                {card.icon}
                            </div>
                            <span className="dash-card-label">{card.label}</span>
                        </div>
                        <span className="dash-card-value" style={{ color: card.color }}>
                            {formatBRL(card.value)}
                        </span>
                        {card.sub && <span className="dash-card-sub">{card.sub}</span>}
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dash-panel">
                    <h3>Proximos Agendamentos</h3>
                    {agendamentos.length === 0 ? (
                        <p className="empty-text">Nenhum agendamento proximo.</p>
                    ) : (
                        <div className="dash-list">
                            {agendamentos.map(a => (
                                <div key={a.id} className="dash-list-item">
                                    <div className="dash-list-info">
                                        <strong>{a.titulo}</strong>
                                        <span>{a.cliente_nome || 'Sem cliente'}</span>
                                    </div>
                                    <span className="dash-list-date">{formatDateTime(a.data_inicio)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dash-panel">
                    <h3>Transacoes Recentes</h3>
                    {transacoes.length === 0 ? (
                        <p className="empty-text">Nenhuma transacao registrada.</p>
                    ) : (
                        <div className="dash-list">
                            {transacoes.map(t => (
                                <div key={t.id} className="dash-list-item">
                                    <div className="dash-list-info">
                                        <strong>{t.descricao}</strong>
                                        <span className={`status-badge`} style={{ background: statusColors[t.status]?.bg, color: statusColors[t.status]?.text }}>
                                            {statusLabels[t.status]}
                                        </span>
                                    </div>
                                    <span className="dash-list-value" style={{ color: t.tipo === 'receita' ? 'var(--success)' : 'var(--danger)' }}>
                                        {t.tipo === 'receita' ? '+' : '-'} {formatBRL(t.valor)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
