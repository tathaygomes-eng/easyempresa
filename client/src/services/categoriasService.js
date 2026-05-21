import { insert, update, softDelete, find } from '../db/localDb';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function listarCategorias(params = {}) {
    const userId = getCurrentUserId();
    let cats = find('categorias', c => c.user_id === userId || c.user_id === null);
    if (params.tipo) cats = cats.filter(c => c.tipo === params.tipo);
    cats = cats.filter(c => c.ativo !== 0);
    return Promise.resolve({ success: true, data: cats });
}

export function criarCategoria(data) {
    const userId = getCurrentUserId();
    const result = insert('categorias', {
        nome: data.nome,
        tipo: data.tipo,
        cor: data.cor || '#6B7280',
        icone: data.icone || 'tag',
        ativo: 1,
        user_id: userId
    });
    return Promise.resolve({ success: true, data: { id: result.lastInsertRowid, ...data } });
}

export function atualizarCategoria(id, data) {
    update('categorias', id, data);
    return Promise.resolve({ success: true });
}

export function desativarCategoria(id) {
    softDelete('categorias', id);
    return Promise.resolve({ success: true });
}
