import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getFluxoCaixa } from '../../services/relatoriosService';
import { formatBRL } from '../../utils/formatters';
import PlanGate from '../../components/ui/PlanGate';
import './FluxoCaixa.css';

export default function FluxoCaixa() {
    return (
        <PlanGate feature="fluxoCaixa">
            <FluxoCaixaContent />
        </PlanGate>
    );
}

function FluxoCaixaContent() {
    const [dados, setDados] = useState(null);
    const [meses, setMeses] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getFluxoCaixa({ meses })
            .then(res => setDados(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [meses]);

    if (loading) return <div className="loading">Carregando...</div>;

    const chartData = [
        ...(dados?.historico || []).map(d => ({ ...d, projetado: false })),
        ...(dados?.projecoes || [])
    ];

    const saldoAtual = dados?.historico?.reduce((acc, d) => acc + (d.receitas - d.despesas), 0) || 0;
    const mediaReceita = dados?.medias?.receita || 0;
    const mediaDespesa = dados?.medias?.despesa || 0;

    return (
        <div className="fluxo-page">
            <div className="page-header">
                <h2>Fluxo de Caixa</h2>
                <select value={meses} onChange={e => setMeses(+e.target.value)}>
                    <option value={3}>Ultimos 3 meses</option>
                    <option value={6}>Ultimos 6 meses</option>
                    <option value={12}>Ultimos 12 meses</option>
                </select>
            </div>

            <div className="fluxo-cards">
                <div className="fluxo-card">
                    <span>Saldo Acumulado</span>
                    <strong style={{ color: saldoAtual >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatBRL(saldoAtual)}</strong>
                </div>
                <div className="fluxo-card">
                    <span>Media Receita/Mes</span>
                    <strong style={{ color: 'var(--success)' }}>{formatBRL(mediaReceita)}</strong>
                </div>
                <div className="fluxo-card">
                    <span>Media Despesa/Mes</span>
                    <strong style={{ color: 'var(--danger)' }}>{formatBRL(mediaDespesa)}</strong>
                </div>
                <div className="fluxo-card">
                    <span>Previsao Proximo Mes</span>
                    <strong style={{ color: (mediaReceita - mediaDespesa) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatBRL(mediaReceita - mediaDespesa)}</strong>
                </div>
            </div>

            <div className="chart-panel">
                <h3>Fluxo de Caixa com Projecao</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="mes" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" tickFormatter={v => formatBRL(v)} />
                        <Tooltip formatter={v => formatBRL(v)} />
                        <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10B981" fill="#D1FAE5" name="Receitas" />
                        <Area type="monotone" dataKey="despesas" stackId="2" stroke="#EF4444" fill="#FEE2E2" name="Despesas" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
