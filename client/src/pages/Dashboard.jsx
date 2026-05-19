import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getResumo, getProximosAgendamentos, getTransacoesRecentes } from '../services/dashboardService';
import { formatBRL, formatDate, formatDateTime, statusColors, statusLabels } from '../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
    const [resumo, setResumo] = useState(null);
    const [agendamentos, setAgendamentos] = useState([]);
    const [transacoes, setTransacoes] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="loading">Carregando...</div>;

    const cards = [
        { label: 'Saldo Total', value: resumo?.saldo, color: resumo?.saldo >= 0 ? 'var(--success)' : 'var(--danger)' },
        { label: 'Receitas do Mes', value: resumo?.receitasMes, color: 'var(--success)' },
        { label: 'Despesas do Mes', value: resumo?.despesasMes, color: 'var(--danger)' },
        { label: 'Contas Pendentes', value: resumo?.totalPendentes, sub: `${resumo?.pendentes} pendencias`, color: 'var(--warning)' },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-cards">
                {cards.map(card => (
                    <div key={card.label} className="dash-card">
                        <span className="dash-card-label">{card.label}</span>
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
