function errorHandler(err, req, res, next) {
    console.error('Erro:', err.message);

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({
            success: false,
            error: { message: 'Registro duplicado.', details: err.message }
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(400).json({
            success: false,
            error: { message: 'Referencia invalida.', details: err.message }
        });
    }

    res.status(err.status || 500).json({
        success: false,
        error: { message: err.message || 'Erro interno do servidor.' }
    });
}

module.exports = errorHandler;
