import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getRelatorioMensal, getPorCategoria } from '../../services/relatoriosService';
import { formatBRL } from '../../utils/formatters';
import PlanGate from '../../components/ui/PlanGate';
import './Relatorios.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#6B7280'];

export default function Relatorios() {
    return (
        <PlanGate feature="relatorios">
            <RelatoriosContent />
        </PlanGate>
    );
}

function RelatoriosContent() {
    const [periodo, setPeriodo] = useState({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
    const [dados, setDados] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getRelatorioMensal(periodo),
            getPorCategoria({ data_inicio: `${periodo.ano}-${String(periodo.mes).padStart(2, '0')}-01`, data_fim: `${periodo.ano}-${String(periodo.mes).padStart(2, '0')}-31` })
        ])
            .then(([r, c]) => { setDados(r.data); setCategorias(c.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [periodo]);

    const meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const despesasCategoria = categorias.filter(c => c.tipo === 'despesa');
    const receitasCategoria = categorias.filter(c => c.tipo === 'receita');

    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <div className="relatorios-page">
            <div className="page-header">
                <h2>Relatorios</h2>
                <div className="periodo-select">
                    <select value={periodo.mes} onChange={e => setPeriodo({ ...periodo, mes: +e.target.value })}>
                        {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={periodo.ano} onChange={e => setPeriodo({ ...periodo, ano: +e.target.value })}>
                        {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            <div className="resumo-cards">
                <div className="resumo-card receita">
                    <span>Receitas</span>
                    <strong>{formatBRL(dados?.receitas)}</strong>
                </div>
                <div className="resumo-card despesa">
                    <span>Despesas</span>
                    <strong>{formatBRL(dados?.despesas)}</strong>
                </div>
                <div className="resumo-card saldo">
                    <span>Saldo</span>
                    <strong>{formatBRL(dados?.saldo)}</strong>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-panel">
                    <h3>Despesas por Categoria</h3>
                    {despesasCategoria.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={despesasCategoria} dataKey="total" nameKey="nome" cx="50%" cy="50%" outerRadius={100} label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                                    {despesasCategoria.map((entry, i) => <Cell key={i} fill={entry.cor || COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => formatBRL(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="empty-text">Sem dados de despesas.</p>}
                </div>

                <div className="chart-panel">
                    <h3>Receitas por Categoria</h3>
                    {receitasCategoria.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={receitasCategoria} dataKey="total" nameKey="nome" cx="50%" cy="50%" outerRadius={100} label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                                    {receitasCategoria.map((entry, i) => <Cell key={i} fill={entry.cor || COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => formatBRL(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="empty-text">Sem dados de receitas.</p>}
                </div>
            </div>
        </div>
    );
}
