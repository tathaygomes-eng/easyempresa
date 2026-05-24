import { supabase } from '../supabase';
import { checkPlanLimit } from '../utils/planLimits';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function listarClientes(params = {}) {
    const userId = await getCurrentUserId();

    let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('ativo', 1);

    if (params.search) {
        query = query.or(`nome.ilike.%${params.search}%,email.ilike.%${params.search}%,telefone.ilike.%${params.search}%`);
    }

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const offset = (page - 1) * limit;

    query = query
        .order('criado_em', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
        success: true,
        data: data || [],
        pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
    };
}

export async function getCliente(id) {
    const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !cliente) throw new Error('Cliente nao encontrado.');

    const { data: interacoes } = await supabase
        .from('interacoes')
        .select('*')
        .eq('cliente_id', id)
        .order('data_interacao', { ascending: false })
        .limit(10);

    return { success: true, data: { ...cliente, interacoes: interacoes || [] } };
}

export async function criarCliente(data) {
    await checkPlanLimit('clientes');
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
        .from('clientes')
        .insert({ ...data, ativo: 1, user_id: userId })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return { success: true, data: result };
}

export async function atualizarCliente(id, data) {
    const { error } = await supabase
        .from('clientes')
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function desativarCliente(id) {
    const { error } = await supabase
        .from('clientes')
        .update({ ativo: 0, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function listarInteracoes(clienteId) {
    const { data } = await supabase
        .from('interacoes')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data_interacao', { ascending: false });

    return { success: true, data: data || [] };
}

export async function criarInteracao(clienteId, data) {
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
        .from('interacoes')
        .insert({
            cliente_id: clienteId,
            tipo: data.tipo,
            descricao: data.descricao,
            data_interacao: data.data_interacao || new Date().toISOString(),
            user_id: userId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return { success: true, data: result };
}

export async function listarTransacoesCliente(clienteId) {
    const { data } = await supabase
        .from('transacoes')
        .select('*, categorias(nome)')
        .eq('cliente_id', clienteId)
        .order('data_transacao', { ascending: false });

    const transacoes = (data || []).map(t => ({
        ...t,
        categoria_nome: t.categorias?.nome || null
    }));

    return { success: true, data: transacoes };
}
