const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validarRegistro, validarLogin } = require('../middleware/validators');

router.post('/registrar', validarRegistro, controller.registrar);
router.post('/login', validarLogin, controller.login);
router.get('/perfil', auth, controller.perfil);
router.put('/plano', auth, controller.atualizarPlano);

module.exports = router;
