const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: { message: errors.array().map(e => e.msg).join(', ') }
        });
    }
    next();
};

const validarRegistro = [
    body('nome')
        .trim()
        .notEmpty().withMessage('Nome e obrigatorio.')
        .isLength({ max: 100 }).withMessage('Nome muito longo.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email e obrigatorio.')
        .isEmail().withMessage('Email invalido.')
        .normalizeEmail(),
    body('senha')
        .notEmpty().withMessage('Senha e obrigatoria.')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
    handleValidation
];

const validarLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email e obrigatorio.')
        .isEmail().withMessage('Email invalido.')
        .normalizeEmail(),
    body('senha')
        .notEmpty().withMessage('Senha e obrigatoria.'),
    handleValidation
];

module.exports = { validarRegistro, validarLogin };
