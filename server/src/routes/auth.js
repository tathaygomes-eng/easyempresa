const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/registrar', controller.registrar);
router.post('/login', controller.login);
router.get('/perfil', auth, controller.perfil);
router.put('/plano', auth, controller.atualizarPlano);

module.exports = router;
