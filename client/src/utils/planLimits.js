import { supabase } from '../supabase';
import { PLANOS } from '../config/planos';

export async function checkPlanLimit(tipo) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario nao autenticado');

    const { data: profile } = await supabase
        .from('usuarios')
        .select('plano')
        .eq('id', user.id)
        .single();

    const planoKey = profile?.plano || 'gratuito';
    const plano = PLANOS[planoKey];
    if (!plano) return;

    const limites = plano.limites;
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    if (tipo === 'transacoes') {
        const limite = limites.transacoesMes;
        if (limite === Infinity) return;

        const { count } = await supabase
            .from('transacoes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('criado_em', inicioMes);

        if ((count || 0) >= limite) {
            throw new Error(`Limite de ${limite} transacoes/mes atingido. Faca upgrade do seu plano para continuar.`);
        }
    }

    if (tipo === 'clientes') {
        const limite = limites.clientes;
        if (limite === Infinity) return;

        const { count } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('ativo', 1);

        if ((count || 0) >= limite) {
            throw new Error(`Limite de ${limite} clientes atingido. Faca upgrade do seu plano para continuar.`);
        }
    }

    if (tipo === 'agendamentos') {
        const limite = limites.agendamentosMes;
        if (limite === Infinity) return;

        const { count } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('criado_em', inicioMes);

        if ((count || 0) >= limite) {
            throw new Error(`Limite de ${limite} agendamentos/mes atingido. Faca upgrade do seu plano para continuar.`);
        }
    }
}
