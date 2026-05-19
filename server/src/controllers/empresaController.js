const { query, queryOne, run, exec } = require('../database/db');

// Mapa de categorias por ramo de atividade
const categoriasPorRamo = {
  restaurante: {
    despesa: [
      { nome: 'Ingredientes', cor: '#EF4444', icone: 'utensils' },
      { nome: 'Bebidas', cor: '#F97316', icone: 'wine' },
      { nome: 'Embalagens', cor: '#8B5CF6', icone: 'package' },
      { nome: 'Equipamentos', cor: '#06B6D4', icone: 'tool' },
      { nome: 'Delivery', cor: '#10B981', icone: 'truck' },
    ],
  },
  comercio: {
    despesa: [
      { nome: 'Estoque', cor: '#EF4444', icone: 'box' },
      { nome: 'Fornecedores', cor: '#F97316', icone: 'truck' },
      { nome: 'Frete', cor: '#8B5CF6', icone: 'package' },
      { nome: 'Embalagens', cor: '#06B6D4', icone: 'package' },
    ],
  },
  servicos: {
    despesa: [
      { nome: 'Materiais', cor: '#EF4444', icone: 'tool' },
      { nome: 'Software', cor: '#F97316', icone: 'monitor' },
      { nome: 'Treinamento', cor: '#8B5CF6', icone: 'book' },
      { nome: 'Deslocamento', cor: '#06B6D4', icone: 'map' },
    ],
  },
  saude: {
    despesa: [
      { nome: 'Materiais', cor: '#EF4444', icone: 'tool' },
      { nome: 'Equipamentos', cor: '#F97316', icone: 'cpu' },
      { nome: 'Medicamentos', cor: '#8B5CF6', icone: 'heart' },
      { nome: 'Laboratorio', cor: '#06B6D4', icone: 'flask' },
    ],
  },
  educacao: {
    despesa: [
      { nome: 'Material Didatico', cor: '#EF4444', icone: 'book' },
      { nome: 'Tecnologia', cor: '#F97316', icone: 'monitor' },
      { nome: 'Eventos', cor: '#8B5CF6', icone: 'calendar' },
    ],
  },
  tecnologia: {
    despesa: [
      { nome: 'Software', cor: '#EF4444', icone: 'code' },
      { nome: 'Hardware', cor: '#F97316', icone: 'cpu' },
      { nome: 'Cloud', cor: '#8B5CF6', icone: 'cloud' },
      { nome: 'Licencas', cor: '#06B6D4', icone: 'key' },
    ],
  },
  construcao: {
    despesa: [
      { nome: 'Materiais', cor: '#EF4444', icone: 'tool' },
      { nome: 'Mao de Obra', cor: '#F97316', icone: 'users' },
      { nome: 'Equipamentos', cor: '#8B5CF6', icone: 'truck' },
      { nome: 'Transporte', cor: '#06B6D4', icone: 'map' },
    ],
  },
  beleza: {
    despesa: [
      { nome: 'Produtos', cor: '#EF4444', icone: 'droplet' },
      { nome: 'Equipamentos', cor: '#F97316', icone: 'scissors' },
      { nome: 'Descartaveis', cor: '#8B5CF6', icone: 'trash' },
    ],
  },
  transporte: {
    despesa: [
      { nome: 'Combustivel', cor: '#EF4444', icone: 'fuel' },
      { nome: 'Manutencao', cor: '#F97316', icone: 'tool' },
      { nome: 'Pedagio', cor: '#8B5CF6', icone: 'map' },
      { nome: 'Seguro', cor: '#06B6D4', icone: 'shield' },
    ],
  },
};

exports.obterConfig = (req, res, next) => {
  try {
    const config = queryOne('SELECT * FROM empresa_config WHERE user_id = ?', req.userId);
    if (!config) {
      return res.json({
        success: true,
        data: {
          nome_empresa: '',
          ramo_atividade: '',
          objetivo: '[]',
          onboarding_completo: 0,
        },
      });
    }
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

exports.salvarConfig = (req, res, next) => {
  try {
    const { nome_empresa, ramo_atividade, objetivo } = req.body;

    const existente = queryOne('SELECT id FROM empresa_config WHERE user_id = ?', req.userId);

    if (existente) {
      run(
        "UPDATE empresa_config SET nome_empresa = ?, ramo_atividade = ?, objetivo = ?, atualizado_em = datetime('now', 'localtime') WHERE user_id = ?",
        nome_empresa,
        ramo_atividade,
        objetivo,
        req.userId
      );
    } else {
      run(
        'INSERT INTO empresa_config (user_id, nome_empresa, ramo_atividade, objetivo) VALUES (?, ?, ?, ?)',
        req.userId,
        nome_empresa,
        ramo_atividade,
        objetivo
      );
    }

    const config = queryOne('SELECT * FROM empresa_config WHERE user_id = ?', req.userId);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

exports.completarOnboarding = (req, res, next) => {
  try {
    const { nome_empresa, ramo_atividade, objetivo, categorias_personalizadas } = req.body;

    // Salvar ou atualizar config
    const existente = queryOne('SELECT id FROM empresa_config WHERE user_id = ?', req.userId);

    if (existente) {
      run(
        "UPDATE empresa_config SET nome_empresa = ?, ramo_atividade = ?, objetivo = ?, onboarding_completo = 1, atualizado_em = datetime('now', 'localtime') WHERE user_id = ?",
        nome_empresa,
        ramo_atividade,
        JSON.stringify(objetivo),
        req.userId
      );
    } else {
      run(
        'INSERT INTO empresa_config (user_id, nome_empresa, ramo_atividade, objetivo, onboarding_completo) VALUES (?, ?, ?, ?, 1)',
        req.userId,
        nome_empresa,
        ramo_atividade,
        JSON.stringify(objetivo)
      );
    }

    // Criar categorias personalizadas
    if (categorias_personalizadas && categorias_personalizadas.length > 0) {
      for (const cat of categorias_personalizadas) {
        run(
          'INSERT OR IGNORE INTO categorias (nome, tipo, cor, icone) VALUES (?, ?, ?, ?)',
          cat.nome,
          'despesa',
          cat.cor || '#6B7280',
          cat.icone || 'tag'
        );
      }
    }

    const config = queryOne('SELECT * FROM empresa_config WHERE user_id = ?', req.userId);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

exports.obterCategoriasSugeridas = (req, res, next) => {
  try {
    const { ramo } = req.params;
    const categorias = categoriasPorRamo[ramo] || { despesa: [] };
    res.json({ success: true, data: categorias });
  } catch (err) {
    next(err);
  }
};
