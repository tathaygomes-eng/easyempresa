import { supabase } from '../supabase';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function getRelatorioMensal(params = {}) {
    const userId = await getCurrentUserId();
    const now = new Date();
    const mes = params.mes || String(now.getMonth() + 1).padStart(2, '0');
    const ano = params.ano || String(now.getFullYear());
    const dataRef = `${ano}-${mes}`;
    const dataInicio = `${dataRef}-01`;
    const dataFim = `${dataRef}-31`;

    const { data: transacoes } = await supabase
        .from('transacoes')
        .select('*, categorias(nome, cor)')
        .eq('user_id', userId)
        .gte('data_transacao', dataInicio)
        .lte('data_transacao', dataFim);

    const todas = transacoes || [];
    const receitas = todas.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const despesas = todas.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

    const porCategoriaMap = {};
    todas.forEach(t => {
        if (!t.categoria_id) return;
        const cat = t.categorias;
        if (!cat) return;
        const key = `${t.categoria_id}_${t.tipo}`;
        if (!porCategoriaMap[key]) porCategoriaMap[key] = { nome: cat.nome, cor: cat.cor, tipo: t.tipo, total: 0 };
        porCategoriaMap[key].total += t.valor;
    });

    const porDiaMap = {};
    todas.forEach(t => {
        const key = `${t.data_transacao}_${t.tipo}`;
        if (!porDiaMap[key]) porDiaMap[key] = { data_transacao: t.data_transacao, tipo: t.tipo, total: 0 };
        porDiaMap[key].total += t.valor;
    });

    return {
        success: true,
        data: {
            periodo: dataRef,
            receitas,
            despesas,
            saldo: receitas - despesas,
            porCategoria: Object.values(porCategoriaMap).sort((a, b) => b.total - a.total),
            porDia: Object.values(porDiaMap).sort((a, b) => a.data_transacao.localeCompare(b.data_transacao))
        }
    };
}

export async function getRelatorioAnual(params = {}) {
    const userId = await getCurrentUserId();
    const ano = params.ano || new Date().getFullYear();
    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;

    const { data: transacoes } = await supabase
        .from('transacoes')
        .select('tipo, valor, data_transacao')
        .eq('user_id', userId)
        .gte('data_transacao', dataInicio)
        .lte('data_transacao', dataFim);

    const todas = transacoes || [];
    const totalReceitas = todas.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const totalDespesas = todas.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

    const porMesMap = {};
    todas.forEach(t => {
        const mes = t.data_transacao?.slice(5, 7);
        const key = `${mes}_${t.tipo}`;
        if (!porMesMap[key]) porMesMap[key] = { mes, tipo: t.tipo, total: 0 };
        porMesMap[key].total += t.valor;
    });

    return {
        success: true,
        data: {
            ano: Number(ano),
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            porMes: Object.values(porMesMap).sort((a, b) => a.mes.localeCompare(b.mes))
        }
    };
}

export async function getPorCategoria(params = {}) {
    const userId = await getCurrentUserId();

    let query = supabase
        .from('transacoes')
        .select('tipo, valor, categoria_id, categorias(nome, cor)')
        .eq('user_id', userId)
        .not('categoria_id', 'is', null);

    if (params.tipo) query = query.eq('tipo', params.tipo);
    if (params.data_inicio) query = query.gte('data_transacao', params.data_inicio);
    if (params.data_fim) query = query.lte('data_transacao', params.data_fim);

    const { data: transacoes } = await query;
    const todas = transacoes || [];

    const grouped = {};
    todas.forEach(t => {
        const cat = t.categorias;
        if (!cat) return;
        if (!grouped[t.categoria_id]) grouped[t.categoria_id] = { nome: cat.nome, cor: cat.cor, tipo: t.tipo, total: 0, quantidade: 0 };
        grouped[t.categoria_id].total += t.valor;
        grouped[t.categoria_id].quantidade++;
    });

    return { success: true, data: Object.values(grouped).sort((a, b) => b.total - a.total) };
}

export async function getFluxoCaixa(params = {}) {
    const userId = await getCurrentUserId();
    const meses = parseInt(params.meses) || 6;
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - meses);
    const inicio = dataInicio.toISOString().slice(0, 10);

    const { data: transacoes } = await supabase
        .from('transacoes')
        .select('tipo, valor, data_transacao')
        .eq('user_id', userId)
        .gte('data_transacao', inicio);

    const todas = transacoes || [];
    const porMes = {};
    todas.forEach(t => {
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

    return {
        success: true,
        data: { historico, projecoes, medias: { receita: mediaReceita, despesa: mediaDespesa } }
    };
}

export async function getPendencias() {
    const userId = await getCurrentUserId();

    const { data: pendentes } = await supabase
        .from('transacoes')
        .select('*, categorias(nome), clientes(nome)')
        .eq('user_id', userId)
        .in('status', ['pendente', 'atrasado'])
        .order('data_vencimento', { ascending: true });

    const lista = (pendentes || []).map(t => ({
        ...t,
        categoria_nome: t.categorias?.nome || null,
        cliente_nome: t.clientes?.nome || null
    }));

    const resumoMap = {};
    lista.forEach(t => {
        if (!resumoMap[t.status]) resumoMap[t.status] = { status: t.status, quantidade: 0, total: 0 };
        resumoMap[t.status].quantidade++;
        resumoMap[t.status].total += t.valor;
    });

    return { success: true, data: { pendentes: lista, resumo: Object.values(resumoMap) } };
}
