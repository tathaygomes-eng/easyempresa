const objetivos = [
  {
    id: 'financeiro',
    nome: 'Controle financeiro',
    descricao: 'Gerenciar receitas, despesas e fluxo de caixa',
    icone: '💰',
  },
  {
    id: 'clientes',
    nome: 'Gestão de clientes',
    descricao: 'Cadastrar e acompanhar seus clientes',
    icone: '👥',
  },
  {
    id: 'agenda',
    nome: 'Agenda de compromissos',
    descricao: 'Organizar reuniões e eventos',
    icone: '📅',
  },
  {
    id: 'relatorios',
    nome: 'Relatórios e análises',
    descricao: 'Visualizar métricas e tomar decisões',
    icone: '📊',
  },
];

export default function StepObjetivo({ dados, onChange }) {
  const toggleObjetivo = (id) => {
    const atuais = dados.objetivo || [];
    const novos = atuais.includes(id)
      ? atuais.filter((o) => o !== id)
      : [...atuais, id];
    onChange({ ...dados, objetivo: novos });
  };

  return (
    <div className="onboarding-step">
      <h2>O que você mais precisa?</h2>
      <p className="step-description">
        Selecione um ou mais objetivos. Vamos priorizar essas funcionalidades.
      </p>

      <div className="objetivo-list">
        {objetivos.map((obj) => (
          <button
            key={obj.id}
            className={`objetivo-card ${(dados.objetivo || []).includes(obj.id) ? 'selected' : ''}`}
            onClick={() => toggleObjetivo(obj.id)}
          >
            <span className="objetivo-icone">{obj.icone}</span>
            <div className="objetivo-info">
              <span className="objetivo-nome">{obj.nome}</span>
              <span className="objetivo-desc">{obj.descricao}</span>
            </div>
            <div className={`objetivo-check ${(dados.objetivo || []).includes(obj.id) ? 'checked' : ''}`}>
              {(dados.objetivo || []).includes(obj.id) && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
