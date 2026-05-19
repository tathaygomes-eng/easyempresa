import { useState, useEffect } from 'react';
import { obterCategoriasSugeridas } from '../../services/empresaService';

export default function StepCategorias({ dados, onChange }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');

  useEffect(() => {
    if (dados.ramo_atividade && dados.ramo_atividade !== 'outro') {
      obterCategoriasSugeridas(dados.ramo_atividade)
        .then((res) => {
          if (res.success) {
            setSugestoes(res.data.despesa || []);
            // Pré-selecionar todas as sugestões
            if (!dados.categorias_personalizadas || dados.categorias_personalizadas.length === 0) {
              onChange({ ...dados, categorias_personalizadas: res.data.despesa || [] });
            }
          }
        })
        .catch(() => {});
    }
  }, [dados.ramo_atividade]);

  const toggleCategoria = (cat) => {
    const atuais = dados.categorias_personalizadas || [];
    const existe = atuais.find((c) => c.nome === cat.nome);
    const novas = existe
      ? atuais.filter((c) => c.nome !== cat.nome)
      : [...atuais, cat];
    onChange({ ...dados, categorias_personalizadas: novas });
  };

  const adicionarCategoria = () => {
    if (!novaCategoria.trim()) return;
    const atuais = dados.categorias_personalizadas || [];
    const jaExiste = atuais.find(
      (c) => c.nome.toLowerCase() === novaCategoria.trim().toLowerCase()
    );
    if (jaExiste) return;

    const nova = {
      nome: novaCategoria.trim(),
      cor: '#6B7280',
      icone: 'tag',
    };
    onChange({ ...dados, categorias_personalizadas: [...atuais, nova] });
    setNovaCategoria('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarCategoria();
    }
  };

  const selecionadas = dados.categorias_personalizadas || [];

  return (
    <div className="onboarding-step">
      <h2>Categorias de despesas</h2>
      <p className="step-description">
        Selecionamos categorias baseadas no seu ramo. Você pode ajustar conforme necessidade.
      </p>

      {sugestoes.length > 0 && (
        <div className="categorias-section">
          <h3>Sugeridas para seu ramo</h3>
          <div className="categorias-grid">
            {sugestoes.map((cat) => {
              const selecionada = selecionadas.find((c) => c.nome === cat.nome);
              return (
                <button
                  key={cat.nome}
                  className={`categoria-chip ${selecionada ? 'selected' : ''}`}
                  onClick={() => toggleCategoria(cat)}
                  style={{
                    '--cat-cor': cat.cor,
                    borderColor: selecionada ? cat.cor : undefined,
                    backgroundColor: selecionada ? `${cat.cor}15` : undefined,
                  }}
                >
                  <span className="cat-dot" style={{ backgroundColor: cat.cor }} />
                  {cat.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="categorias-section">
        <h3>Adicionar categoria personalizada</h3>
        <div className="add-categoria-row">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn-primary btn-sm"
            onClick={adicionarCategoria}
            disabled={!novaCategoria.trim()}
          >
            Adicionar
          </button>
        </div>
      </div>

      {selecionadas.length > 0 && (
        <div className="categorias-section">
          <h3>Categorias que serão criadas ({selecionadas.length})</h3>
          <div className="categorias-preview">
            {selecionadas.map((cat) => (
              <span key={cat.nome} className="preview-tag" style={{ borderColor: cat.cor }}>
                <span className="cat-dot" style={{ backgroundColor: cat.cor }} />
                {cat.nome}
                <button
                  className="remove-btn"
                  onClick={() => toggleCategoria(cat)}
                  title="Remover"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
