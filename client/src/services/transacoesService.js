import { supabase } from '../supabase';
import { checkPlanLimit } from '../utils/planLimits';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function listarTransacoes(params = {}) {
    const userId = await getCurrentUserId();

    let query = supabase
        .from('transacoes')
        .select('*, categorias(nome, cor), clientes(nome)', { count: 'exact' })
        .eq('user_id', userId);

    if (params.tipo) query = query.eq('tipo', params.tipo);
    if (params.status) query = query.eq('status', params.status);
    if (params.categoria_id) query = query.eq('categoria_id', Number(params.categoria_id));
    if (params.cliente_id) query = query.eq('cliente_id', Number(params.cliente_id));
    if (params.data_inicio) query = query.gte('data_transacao', params.data_inicio);
    if (params.data_fim) query = query.lte('data_transacao', params.data_fim);

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const offset = (page - 1) * limit;

    query = query
        .order('data_transacao', { ascending: false })
        .order('criado_em', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const transacoes = (data || []).map(t => ({
        ...t,
        categoria_nome: t.categorias?.nome || null,
        cliente_nome: t.clientes?.nome || null
    }));

    return {
        success: true,
        data: transacoes,
        pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
    };
}

export async function getTransacao(id) {
    const { data: t, error } = await supabase
        .from('transacoes')
        .select('*, categorias(nome), clientes(nome)')
        .eq('id', id)
        .single();

    if (error || !t) throw new Error('Transacao nao encontrada.');

    return {
        success: true,
        data: { ...t, categoria_nome: t.categorias?.nome, cliente_nome: t.clientes?.nome }
    };
}

export async function criarTransacao(data) {
    await checkPlanLimit('transacoes');
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
        .from('transacoes')
        .insert({
            tipo: data.tipo,
            descricao: data.descricao,
            valor: Number(data.valor),
            data_transacao: data.data_transacao,
            data_vencimento: data.data_vencimento || null,
            status: data.status || 'pendente',
            categoria_id: data.categoria_id ? Number(data.categoria_id) : null,
            cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
            forma_pagamento: data.forma_pagamento || null,
            observacoes: data.observacoes || null,
            recorrente: data.recorrente ? 1 : 0,
            recorrencia_tipo: data.recorrencia_tipo || null,
            user_id: userId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return { success: true, data: result };
}

export async function atualizarTransacao(id, data) {
    const { error } = await supabase
        .from('transacoes')
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function excluirTransacao(id) {
    const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function alterarStatusTransacao(id, status) {
    const { error } = await supabase
        .from('transacoes')
        .update({ status, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}
