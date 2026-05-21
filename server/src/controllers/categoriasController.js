const { query, queryOne, run } = require('../database/db');

exports.listar = (req, res, next) => {
    try {
        const { tipo } = req.query;
        // Mostrar categorias do sistema (user_id IS NULL) + do usuario
        let sql = 'SELECT * FROM categorias WHERE ativo = 1 AND (user_id IS NULL OR user_id = ?)';
        const params = [req.userId];

        if (tipo) {
            sql += ' AND tipo = ?';
            params.push(tipo);
        }

        sql += ' ORDER BY nome';
        const categorias = query(sql, ...params);

        res.json({ success: true, data: categorias });
    } catch (err) {
        next(err);
    }
};

exports.criar = (req, res, next) => {
    try {
        const { nome, tipo, cor, icone } = req.body;

        if (!nome || !tipo) {
            return res.status(400).json({
                success: false,
                error: { message: 'Nome e tipo sao obrigatorios.' }
            });
        }

        const result = run(
            'INSERT INTO categorias (nome, tipo, cor, icone, user_id) VALUES (?, ?, ?, ?, ?)',
            nome, tipo, cor || '#6B7280', icone || 'tag', req.userId
        );

        const categoria = queryOne('SELECT * FROM categorias WHERE id = ?', result.lastInsertRowid);

        res.status(201).json({ success: true, data: categoria });
    } catch (err) {
        next(err);
    }
};

exports.atualizar = (req, res, next) => {
    try {
        const { id } = req.params;
        const { nome, tipo, cor, icone } = req.body;

        // So permite editar categorias proprias (nao do sistema)
        const existing = queryOne('SELECT id FROM categorias WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Categoria nao encontrada ou nao pode ser editada.' } });
        }

        run(
            "UPDATE categorias SET nome = ?, tipo = ?, cor = ?, icone = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ? AND user_id = ?",
            nome, tipo, cor, icone, id, req.userId
        );

        const categoria = queryOne('SELECT * FROM categorias WHERE id = ?', id);

        res.json({ success: true, data: categoria });
    } catch (err) {
        next(err);
    }
};

exports.desativar = (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = queryOne('SELECT id FROM categorias WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Categoria nao encontrada ou nao pode ser desativada.' } });
        }

        run("UPDATE categorias SET ativo = 0, atualizado_em = datetime('now', 'localtime') WHERE id = ? AND user_id = ?", id, req.userId);

        res.json({ success: true, message: 'Categoria desativada.' });
    } catch (err) {
        next(err);
    }
};
