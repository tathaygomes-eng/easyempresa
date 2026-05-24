import { supabase } from '../supabase';

async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function obterConfig() {
    const userId = await getCurrentUserId();
    if (!userId) return { success: true, data: { nome_empresa: '', ramo_atividade: '', objetivo: '[]', onboarding_completo: 0 } };

    const { data } = await supabase
        .from('empresa_config')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!data) {
        return { success: true, data: { nome_empresa: '', ramo_atividade: '', objetivo: '[]', onboarding_completo: 0 } };
    }
    return { success: true, data };
}

export async function salvarConfig(dados) {
    const userId = await getCurrentUserId();

    await supabase
        .from('empresa_config')
        .upsert({
            user_id: userId,
            nome_empresa: dados.nome_empresa,
            ramo_atividade: dados.ramo_atividade,
            objetivo: dados.objetivo,
            atualizado_em: new Date().toISOString()
        }, { onConflict: 'user_id' });

    const { data: config } = await supabase
        .from('empresa_config')
        .select('*')
        .eq('user_id', userId)
        .single();

    return { success: true, data: config };
}

export async function completarOnboarding(dados) {
    const userId = await getCurrentUserId();
    const { nome_empresa, ramo_atividade, objetivo, categorias_personalizadas } = dados;

    await supabase
        .from('empresa_config')
        .upsert({
            user_id: userId,
            nome_empresa,
            ramo_atividade,
            objetivo: JSON.stringify(objetivo),
            onboarding_completo: 1,
            atualizado_em: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (categorias_personalizadas && categorias_personalizadas.length > 0) {
        const { data: existing } = await supabase
            .from('categorias')
            .select('nome')
            .eq('user_id', userId);

        const existingNames = (existing || []).map(c => c.nome);
        const newCats = categorias_personalizadas
            .filter(cat => !existingNames.includes(cat.nome))
            .map(cat => ({
                nome: cat.nome,
                tipo: 'despesa',
                cor: cat.cor || '#6B7280',
                icone: cat.icone || 'tag',
                ativo: 1,
                user_id: userId
            }));

        if (newCats.length > 0) {
            await supabase.from('categorias').insert(newCats);
        }
    }

    const { data: config } = await supabase
        .from('empresa_config')
        .select('*')
        .eq('user_id', userId)
        .single();

    return { success: true, data: config };
}

export function obterCategoriasSugeridas(ramo) {
    const categoriasPorRamo = {
        restaurante: { despesa: [{ nome: 'Ingredientes', cor: '#EF4444', icone: 'utensils' }, { nome: 'Bebidas', cor: '#F97316', icone: 'wine' }, { nome: 'Embalagens', cor: '#8B5CF6', icone: 'package' }] },
        comercio: { despesa: [{ nome: 'Estoque', cor: '#EF4444', icone: 'box' }, { nome: 'Fornecedores', cor: '#F97316', icone: 'truck' }, { nome: 'Frete', cor: '#8B5CF6', icone: 'package' }] },
        servicos: { despesa: [{ nome: 'Materiais', cor: '#EF4444', icone: 'tool' }, { nome: 'Software', cor: '#F97316', icone: 'monitor' }, { nome: 'Treinamento', cor: '#8B5CF6', icone: 'book' }] },
    };
    const categorias = categoriasPorRamo[ramo] || { despesa: [] };
    return Promise.resolve({ success: true, data: categorias });
}
