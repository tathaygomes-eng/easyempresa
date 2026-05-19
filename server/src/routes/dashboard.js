const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');

router.get('/resumo', controller.resumo);
router.get('/proximos-agendamentos', controller.proximosAgendamentos);
router.get('/transacoes-recentes', controller.transacoesRecentes);

module.exports = router;
