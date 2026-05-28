import { supabase } from '../supabase';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function listarCategorias(params = {}) {
    let query = supabase
        .from('categorias')
        .select('*')
        .eq('ativo', 1);

    if (params.tipo) query = query.eq('tipo', params.tipo);

    const { data, error } = await query.order('nome');
    if (error) throw new Error(error.message);

    return { success: true, data: data || [] };
}

export async function criarCategoria(data) {
    const userId = await getCurrentUserId();

    const { data: result, error } = await supabase
        .from('categorias')
        .insert({
            nome: data.nome,
            tipo: data.tipo,
            cor: data.cor || '#6B7280',
            icone: data.icone || 'tag',
            ativo: 1,
            user_id: userId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return { success: true, data: result };
}

export async function atualizarCategoria(id, data) {
    const { error } = await supabase
        .from('categorias')
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function desativarCategoria(id) {
    const { error } = await supabase
        .from('categorias')
        .update({ ativo: 0, atualizado_em: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}
