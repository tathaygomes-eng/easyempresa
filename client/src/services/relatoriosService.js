import { find } from '../db/localDb';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function getRelatorioMensal(params = {}) {
    const userId = getCurrentUserId();
    const now = new Date();
    const mes = params.mes || String(now.getMonth() + 1).padStart(2, '0');
    const ano = params.ano || String(now.getFullYear());
    const dataRef = `${ano}-${mes}`;

    const transacoes = find('transacoes', t =>
        t.user_id === userId && t.data_transacao?.startsWith(dataRef)
    );

    const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

    const categorias = find('categorias', () => true);

    const porCategoriaMap = {};
    transacoes.forEach(t => {
        if (!t.categoria_id) return;
        const cat = categorias.find(c => c.id === t.categoria_id);
        if (!cat) return;
        const key = `${t.categoria_id}_${t.tipo}`;
        if (!porCategoriaMap[key]) porCategoriaMap[key] = { nome: cat.nome, cor: cat.cor, tipo: t.tipo, total: 0 };
        porCategoriaMap[key].total += t.valor;
    });

    const porDiaMap = {};
    transacoes.forEach(t => {
        const key = `${t.data_transacao}_${t.tipo}`;
        if (!porDiaMap[key]) porDiaMap[key] = { data_transacao: t.data_transacao, tipo: t.tipo, total: 0 };
        porDiaMap[key].total += t.valor;
    });

    return Promise.resolve({
        success: true,
        data: {
            periodo: dataRef,
            receitas,
            despesas,
            saldo: receitas - despesas,
            porCategoria: Object.values(porCategoriaMap).sort((a, b) => b.total - a.total),
            porDia: Object.values(porDiaMap).sort((a, b) => a.data_transacao.localeCompare(b.data_transacao))
        }
    });
}

export function getRelatorioAnual(params = {}) {
    const userId = getCurrentUserId();
    const ano = params.ano || new Date().getFullYear();

    const transacoes = find('transacoes', t =>
        t.user_id === userId && t.data_transacao?.startsWith(String(ano))
    );

    const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

    const porMesMap = {};
    transacoes.forEach(t => {
        const mes = t.data_transacao?.slice(5, 7);
        const key = `${mes}_${t.tipo}`;
        if (!porMesMap[key]) porMesMap[key] = { mes, tipo: t.tipo, total: 0 };
        porMesMap[key].total += t.valor;
    });

    return Promise.resolve({
        success: true,
        data: {
            ano: Number(ano),
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            porMes: Object.values(porMesMap).sort((a, b) => a.mes.localeCompare(b.mes))
        }
    });
}

export function getPorCategoria(params = {}) {
    const userId = getCurrentUserId();
    let transacoes = find('transacoes', t => t.user_id === userId && t.categoria_id !== null);

    if (params.tipo) transacoes = transacoes.filter(t => t.tipo === params.tipo);
    if (params.data_inicio) transacoes = transacoes.filter(t => t.data_transacao >= params.data_inicio);
    if (params.data_fim) transacoes = transacoes.filter(t => t.data_transacao <= params.data_fim);

    const categorias = find('categorias', () => true);
    const grouped = {};

    transacoes.forEach(t => {
        const cat = categorias.find(c => c.id === t.categoria_id);
        if (!cat) return;
        if (!grouped[t.categoria_id]) grouped[t.categoria_id] = { nome: cat.nome, cor: cat.cor, tipo: t.tipo, total: 0, quantidade: 0 };
        grouped[t.categoria_id].total += t.valor;
        grouped[t.categoria_id].quantidade++;
    });

    return Promise.resolve({ success: true, data: Object.values(grouped).sort((a, b) => b.total - a.total) });
}

export function getFluxoCaixa(params = {}) {
    const userId = getCurrentUserId();
    const meses = parseInt(params.meses) || 6;
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - meses);
    const inicio = dataInicio.toISOString().slice(0, 10);

    const transacoes = find('transacoes', t => t.user_id === userId && t.data_transacao >= inicio);

    const porMes = {};
    transacoes.forEach(t => {
        const mes = t.data_transacao?.slice(0, 7);
        if (!porMes[mes]) porMes[mes] = { mes, receitas: 0, despesas: 0 };
        if (t.tipo === 'receita') porMes[mes].receitas += t.valor;
        else porMes[mes].despesas += t.valor;
    });

    const historico = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes));

    const mediaReceita = historico.length > 0 ? historico.reduce((s, m) => s + m.receitas, 0) / historico.length : 0;
    const mediaDespesa = historico.length > 0 ? historico.reduce((s, m) => s + m.despesas, 0) / historico.length : 0;

    const projecoes = [];
    const hoje = new Date();
    for (let i = 1; i <= 3; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
        projecoes.push({
            mes: d.toISOString().slice(0, 7),
            receitas: Math.round(mediaReceita * 100) / 100,
            despesas: Math.round(mediaDespesa * 100) / 100,
            projetado: true
        });
    }

    return Promise.resolve({
        success: true,
        data: { historico, projecoes, medias: { receita: mediaReceita, despesa: mediaDespesa } }
    });
}

export function getPendencias() {
    const userId = getCurrentUserId();
    const categorias = find('categorias', () => true);
    const clientes = find('clientes', () => true);

    const pendentes = find('transacoes', t =>
        t.user_id === userId && (t.status === 'pendente' || t.status === 'atrasado')
    ).map(t => ({
        ...t,
        categoria_nome: categorias.find(c => c.id === t.categoria_id)?.nome || null,
        cliente_nome: clientes.find(cl => cl.id === t.cliente_id)?.nome || null
    })).sort((a, b) => (a.data_vencimento || '').localeCompare(b.data_vencimento || ''));

    const resumoMap = {};
    pendentes.forEach(t => {
        if (!resumoMap[t.status]) resumoMap[t.status] = { status: t.status, quantidade: 0, total: 0 };
        resumoMap[t.status].quantidade++;
        resumoMap[t.status].total += t.valor;
    });

    return Promise.resolve({ success: true, data: { pendentes, resumo: Object.values(resumoMap) } });
}
