const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientesController');

router.get('/', controller.listar);
router.get('/:id', controller.detalhes);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.desativar);
router.get('/:id/interacoes', controller.listarInteracoes);
router.post('/:id/interacoes', controller.criarInteracao);
router.get('/:id/transacoes', controller.listarTransacoes);

module.exports = router;
