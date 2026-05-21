// Banco de dados local usando localStorage
// Simula SQLite com tabelas JSON no localStorage

const DB_PREFIX = 'ee_db_';
const ID_COUNTER_KEY = 'ee_db_ids';

function getTableKey(table) {
    return `${DB_PREFIX}${table}`;
}

function getIds() {
    try {
        return JSON.parse(localStorage.getItem(ID_COUNTER_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveIds(ids) {
    localStorage.setItem(ID_COUNTER_KEY, JSON.stringify(ids));
}

function nextId(table) {
    const ids = getIds();
    const current = ids[table] || 0;
    const next = current + 1;
    ids[table] = next;
    saveIds(ids);
    return next;
}

function getTable(table) {
    try {
        return JSON.parse(localStorage.getItem(getTableKey(table)) || '[]');
    } catch {
        return [];
    }
}

function saveTable(table, data) {
    localStorage.setItem(getTableKey(table), JSON.stringify(data));
}

function now() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ---------- CRUD ----------

function insert(table, row) {
    const data = getTable(table);
    const id = nextId(table);
    const newRow = {
        id,
        ...row,
        criado_em: row.criado_em || now(),
        atualizado_em: row.atualizado_em || now()
    };
    data.push(newRow);
    saveTable(table, data);
    return { lastInsertRowid: id, changes: 1 };
}

function update(table, id, fields) {
    const data = getTable(table);
    const idx = data.findIndex(r => r.id === id);
    if (idx === -1) return { changes: 0 };
    data[idx] = { ...data[idx], ...fields, atualizado_em: now() };
    saveTable(table, data);
    return { changes: 1 };
}

function remove(table, id) {
    const data = getTable(table);
    const filtered = data.filter(r => r.id !== id);
    saveTable(table, filtered);
    return { changes: data.length - filtered.length };
}

function findById(table, id) {
    return getTable(table).find(r => r.id === id) || null;
}

function find(table, predicate) {
    return getTable(table).filter(predicate);
}

function findOne(table, predicate) {
    return getTable(table).find(predicate) || null;
}

function findAll(table) {
    return getTable(table);
}

function softDelete(table, id) {
    return update(table, id, { ativo: 0 });
}

// ---------- Busca com filtros ----------

function queryWithFilters(table, {
    filters = {},
    search = null,
    searchFields = [],
    orderBy = null,
    orderDir = 'DESC',
    limit = null,
    offset = 0,
    userId = null
} = {}) {
    let rows = getTable(table);

    // Filtrar por user_id
    if (userId !== null) {
        rows = rows.filter(r => r.user_id === userId || r.user_id === null || r.user_id === undefined);
    }

    // Filtros exatos
    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null || value === '') continue;
        rows = rows.filter(r => r[key] === value);
    }

    // Busca textual
    if (search && searchFields.length > 0) {
        const term = search.toLowerCase();
        rows = rows.filter(r =>
            searchFields.some(f => r[f] && String(r[f]).toLowerCase().includes(term))
        );
    }

    const total = rows.length;

    // Ordenação
    if (orderBy) {
        rows.sort((a, b) => {
            const va = a[orderBy];
            const vb = b[orderBy];
            if (va < vb) return orderDir === 'ASC' ? -1 : 1;
            if (va > vb) return orderDir === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    // Paginação
    if (limit) {
        rows = rows.slice(offset, offset + limit);
    }

    return { rows, total };
}

// ---------- Reset ----------

function resetDb() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DB_PREFIX)) {
            keys.push(key);
        }
    }
    keys.forEach(k => localStorage.removeItem(k));
}

export {
    insert,
    update,
    remove,
    findById,
    find,
    findOne,
    findAll,
    softDelete,
    queryWithFilters,
    getTable,
    saveTable,
    now,
    resetDb
};
