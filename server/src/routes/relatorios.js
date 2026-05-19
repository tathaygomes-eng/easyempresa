const express = require('express');
const router = express.Router();
const controller = require('../controllers/relatoriosController');

router.get('/mensal', controller.mensal);
router.get('/anual', controller.anual);
router.get('/por-categoria', controller.porCategoria);
router.get('/fluxo-caixa', controller.fluxoCaixa);
router.get('/pendencias', controller.pendencias);

module.exports = router;
