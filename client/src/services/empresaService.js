import { findOne, insert, update, find } from '../db/localDb';
import { categoriasPorRamo } from '../db/seed';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function obterConfig() {
    const userId = getCurrentUserId();
    const config = findOne('empresa_config', c => c.user_id === userId);
    if (!config) {
        return Promise.resolve({
            success: true,
            data: { nome_empresa: '', ramo_atividade: '', objetivo: '[]', onboarding_completo: 0 }
        });
    }
    return Promise.resolve({ success: true, data: config });
}

export function salvarConfig(dados) {
    const userId = getCurrentUserId();
    const existente = findOne('empresa_config', c => c.user_id === userId);

    if (existente) {
        update('empresa_config', existente.id, {
            nome_empresa: dados.nome_empresa,
            ramo_atividade: dados.ramo_atividade,
            objetivo: dados.objetivo
        });
    } else {
        insert('empresa_config', {
            user_id: userId,
            nome_empresa: dados.nome_empresa,
            ramo_atividade: dados.ramo_atividade,
            objetivo: dados.objetivo,
            onboarding_completo: 0
        });
    }

    const config = findOne('empresa_config', c => c.user_id === userId);
    return Promise.resolve({ success: true, data: config });
}

export function completarOnboarding(dados) {
    const userId = getCurrentUserId();
    const { nome_empresa, ramo_atividade, objetivo, categorias_personalizadas } = dados;

    const existente = findOne('empresa_config', c => c.user_id === userId);

    if (existente) {
        update('empresa_config', existente.id, {
            nome_empresa,
            ramo_atividade,
            objetivo: JSON.stringify(objetivo),
            onboarding_completo: 1
        });
    } else {
        insert('empresa_config', {
            user_id: userId,
            nome_empresa,
            ramo_atividade,
            objetivo: JSON.stringify(objetivo),
            onboarding_completo: 1
        });
    }

    if (categorias_personalizadas && categorias_personalizadas.length > 0) {
        const existing = find('categorias', c => c.user_id === userId);
        categorias_personalizadas.forEach(cat => {
            const exists = existing.some(c => c.nome === cat.nome);
            if (!exists) {
                insert('categorias', {
                    nome: cat.nome,
                    tipo: 'despesa',
                    cor: cat.cor || '#6B7280',
                    icone: cat.icone || 'tag',
                    ativo: 1,
                    user_id: userId
                });
            }
        });
    }

    const config = findOne('empresa_config', c => c.user_id === userId);
    return Promise.resolve({ success: true, data: config });
}

export function obterCategoriasSugeridas(ramo) {
    const categorias = categoriasPorRamo[ramo] || { despesa: [] };
    return Promise.resolve({ success: true, data: categorias });
}
