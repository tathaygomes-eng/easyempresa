const express = require('express');
const router = express.Router();
const controller = require('../controllers/agendamentosController');

router.get('/', controller.listar);
router.get('/lembretes', controller.lembretes);
router.get('/:id', controller.detalhes);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);
router.patch('/:id/status', controller.alterarStatus);

module.exports = router;
