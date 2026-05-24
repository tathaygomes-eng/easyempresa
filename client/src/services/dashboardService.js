import { supabase } from '../supabase';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function getResumo() {
    const userId = await getCurrentUserId();
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    const { data: transacoes } = await supabase
        .from('transacoes')
        .select('tipo, valor, data_transacao, status')
        .eq('user_id', userId);

    const todas = transacoes || [];
    const saldo = todas.reduce((acc, t) => acc + (t.tipo === 'receita' ? t.valor : -t.valor), 0);

    const transacoesMes = todas.filter(t => t.data_transacao?.startsWith(mesAtual));
    const receitasMes = transacoesMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesasMes = transacoesMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

    const pendentesArr = todas.filter(t => t.status === 'pendente' || t.status === 'atrasado');

    return {
        success: true,
        data: {
            saldo,
            receitasMes,
            despesasMes,
            pendentes: pendentesArr.length,
            totalPendentes: pendentesArr.reduce((acc, t) => acc + t.valor, 0)
        }
    };
}

export async function getProximosAgendamentos() {
    const userId = await getCurrentUserId();
    const hoje = new Date().toISOString();

    const { data } = await supabase
        .from('agendamentos')
        .select('*, clientes(nome)')
        .eq('user_id', userId)
        .gte('data_inicio', hoje)
        .neq('status', 'cancelado')
        .order('data_inicio', { ascending: true })
        .limit(5);

    const agendamentos = (data || []).map(a => ({
        ...a,
        cliente_nome: a.clientes?.nome || null
    }));

    return { success: true, data: agendamentos };
}

export async function getTransacoesRecentes() {
    const userId = await getCurrentUserId();

    const { data } = await supabase
        .from('transacoes')
        .select('*, categorias(nome), clientes(nome)')
        .eq('user_id', userId)
        .order('data_transacao', { ascending: false })
        .order('criado_em', { ascending: false })
        .limit(5);

    const transacoes = (data || []).map(t => ({
        ...t,
        categoria_nome: t.categorias?.nome || null,
        cliente_nome: t.clientes?.nome || null
    }));

    return { success: true, data: transacoes };
}
