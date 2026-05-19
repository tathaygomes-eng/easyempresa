export default function StepBoasVindas({ dados, onChange }) {
  return (
    <div className="onboarding-step">
      <div className="step-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <h2>Bem-vindo ao EasyEmpresa!</h2>
      <p className="step-description">
        Vamos configurar o sistema para o seu negócio. Isso leva menos de 2 minutos.
      </p>

      <div className="form-group">
        <label htmlFor="nome_empresa">Nome da sua empresa ou negócio</label>
        <input
          type="text"
          id="nome_empresa"
          placeholder="Ex: Minha Empresa LTDA"
          value={dados.nome_empresa}
          onChange={(e) => onChange({ ...dados, nome_empresa: e.target.value })}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="nome_responsavel">Seu nome</label>
        <input
          type="text"
          id="nome_responsavel"
          placeholder="Como você gostaria de ser chamado?"
          value={dados.nome_responsavel}
          onChange={(e) => onChange({ ...dados, nome_responsavel: e.target.value })}
        />
      </div>
    </div>
  );
}
