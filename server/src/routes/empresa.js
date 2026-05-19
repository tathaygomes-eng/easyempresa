const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const auth = require('../middleware/auth');

router.get('/config', auth, empresaController.obterConfig);
router.put('/config', auth, empresaController.salvarConfig);
router.post('/onboarding', auth, empresaController.completarOnboarding);
router.get('/categorias-sugeridas/:ramo', auth, empresaController.obterCategoriasSugeridas);

module.exports = router;
