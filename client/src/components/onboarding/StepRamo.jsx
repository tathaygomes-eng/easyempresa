const ramos = [
  { id: 'restaurante', nome: 'Restaurante / Alimentação', icone: '🍽️' },
  { id: 'comercio', nome: 'Comércio / Varejo', icone: '🛍️' },
  { id: 'servicos', nome: 'Serviços / Consultoria', icone: '💼' },
  { id: 'saude', nome: 'Saúde / Bem-estar', icone: '🏥' },
  { id: 'educacao', nome: 'Educação', icone: '📚' },
  { id: 'tecnologia', nome: 'Tecnologia', icone: '💻' },
  { id: 'construcao', nome: 'Construção / Imobiliário', icone: '🏗️' },
  { id: 'beleza', nome: 'Beleza / Estética', icone: '💇' },
  { id: 'transporte', nome: 'Transporte / Logística', icone: '🚛' },
  { id: 'outro', nome: 'Outro', icone: '📋' },
];

export default function StepRamo({ dados, onChange }) {
  const handleSelect = (ramoId) => {
    onChange({ ...dados, ramo_atividade: ramoId });
  };

  return (
    <div className="onboarding-step">
      <h2>Qual é o ramo do seu negócio?</h2>
      <p className="step-description">
        Isso nos ajuda a sugerir categorias e configurações ideais para você.
      </p>

      <div className="ramo-grid">
        {ramos.map((ramo) => (
          <button
            key={ramo.id}
            className={`ramo-card ${dados.ramo_atividade === ramo.id ? 'selected' : ''}`}
            onClick={() => handleSelect(ramo.id)}
          >
            <span className="ramo-icone">{ramo.icone}</span>
            <span className="ramo-nome">{ramo.nome}</span>
          </button>
        ))}
      </div>

      {dados.ramo_atividade === 'outro' && (
        <div className="form-group" style={{ marginTop: '16px' }}>
          <input
            type="text"
            placeholder="Descreva seu ramo de atividade"
            value={dados.ramo_outro || ''}
            onChange={(e) => onChange({ ...dados, ramo_outro: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
