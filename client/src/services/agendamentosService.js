import { supabase } from '../supabase';
import { checkPlanLimit } from '../utils/planLimits';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function listarAgendamentos(params = {}) {
    const userId = await getCurrentUserId();

    let query = supabase
        .from('agendamentos')
        .select('*, clientes(nome)')
        .eq('user_id', userId);

    if (params.data_inicio) query = query.gte('data_inicio', params.data_inicio);
    if (params.data_fim) query = query.lte('data_inicio', params.data_fim);
    if (params.cliente_id) query = query.eq('cliente_id', Number(params.cliente_id));
    if (params.status) query = query.eq('status', params.status);

    query = query.order('data_inicio', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const agendamentos = (data || []).map(a => ({
        ...a,
        cliente_nome: a.clientes?.nome || null
    }));

    return { success: true, data: agendamentos };
}

export async function getAgendamento(id) {
    const { data: a, error } = await supabase
        .from('agendamentos')
        .select('*, clientes(nome)')
        .eq('id', id)
        .single();

    if (error || !a) throw new Error('Agendamento nao encontrado.');
    return { success: true, data: { ...a, cliente_nome: a.clientes?.nome } };
}

export async function criarAgendamento(data) {
    await checkPlanLimit('agendamentos');
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
        .from('agendamentos')
        .insert({
            titulo: data.titulo,
            descricao: data.descricao || null,
            data_inicio: data.data_inicio,
            data_fim: data.data_fim || null,
            cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
            local: data.local || null,
            lembrete_minutos: data.lembrete != null && data.lembrete !== 1 ? null : (data.lembrete_minutos || 30),
            status: data.status || 'agendado',
            user_id: userId
        })
        .select('id, titulo, descricao, data_inicio, data_fim, cliente_id, local, lembrete_minutos, status, user_id')
        .single();

    if (error) throw new Error(error.message);
    return { success: true, data: result };
}

export async function atualizarAgendamento(id, data) {
    const { error } = await supabase
        .from('agendamentos')
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function excluirAgendamento(id) {
    const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function alterarStatusAgendamento(id, status) {
    const { error } = await supabase
        .from('agendamentos')
        .update({ status, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getLembretes() {
    const userId = await getCurrentUserId();
    const agora = new Date().toISOString();

    const { data } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'cancelado')
        .gte('data_inicio', agora)
        .order('data_inicio', { ascending: true })
        .limit(5);

    return { success: true, data: data || [] };
}
