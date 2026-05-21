function errorHandler(err, req, res, next) {
    console.error('Erro:', err.message);

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({
            success: false,
            error: { message: 'Registro duplicado.' }
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(400).json({
            success: false,
            error: { message: 'Referencia invalida.' }
        });
    }

    const status = err.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(status).json({
        success: false,
        error: {
            message: status === 500 && isProduction
                ? 'Erro interno do servidor.'
                : (err.message || 'Erro interno do servidor.')
        }
    });
}

module.exports = errorHandler;
