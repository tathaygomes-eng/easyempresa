import { useState } from 'react';
import StepBoasVindas from '../components/onboarding/StepBoasVindas';
import StepRamo from '../components/onboarding/StepRamo';
import StepObjetivo from '../components/onboarding/StepObjetivo';
import StepCategorias from '../components/onboarding/StepCategorias';
import { completarOnboarding } from '../services/empresaService';
import { useToast } from '../components/ui/Toast';

const steps = [
  { id: 'boasvindas', titulo: 'Boas-vindas', componente: StepBoasVindas },
  { id: 'ramo', titulo: 'Ramo', componente: StepRamo },
  { id: 'objetivo', titulo: 'Objetivo', componente: StepObjetivo },
  { id: 'categorias', titulo: 'Categorias', componente: StepCategorias },
];

export default function Onboarding({ usuario, onCompleto }) {
  const toast = useToast();
  const [stepAtual, setStepAtual] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState({
    nome_empresa: '',
    nome_responsavel: usuario?.nome || '',
    ramo_atividade: '',
    ramo_outro: '',
    objetivo: [],
    categorias_personalizadas: [],
  });

  const StepComponente = steps[stepAtual].componente;

  const podeAvancar = () => {
    switch (stepAtual) {
      case 0:
        return dados.nome_empresa.trim().length > 0;
      case 1:
        return dados.ramo_atividade.length > 0;
      case 2:
        return dados.objetivo.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleVoltar = () => {
    if (stepAtual > 0) {
      setStepAtual(stepAtual - 1);
    }
  };

  const handleAvancar = async () => {
    if (!podeAvancar()) return;

    if (stepAtual < steps.length - 1) {
      setStepAtual(stepAtual + 1);
      return;
    }

    // Último step - salvar
    setSalvando(true);
    try {
      const payload = {
        nome_empresa: dados.nome_empresa,
        ramo_atividade: dados.ramo_atividade === 'outro' ? dados.ramo_outro : dados.ramo_atividade,
        objetivo: dados.objetivo,
        categorias_personalizadas: dados.categorias_personalizadas,
      };

      await completarOnboarding(payload);
      toast.success('Configuração concluída!');
      onCompleto();
    } catch (err) {
      toast.error('Erro ao salvar configuração. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        {/* Header com progresso */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>EasyEmpresa</span>
          </div>

          <div className="onboarding-stepper">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`stepper-item ${index === stepAtual ? 'active' : ''} ${index < stepAtual ? 'completed' : ''}`}
              >
                <div className="stepper-number">
                  {index < stepAtual ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="stepper-label">{step.titulo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo do step */}
        <div className="onboarding-body">
          <StepComponente dados={dados} onChange={setDados} />
        </div>

        {/* Footer com botões */}
        <div className="onboarding-footer">
          <button
            className="btn-secondary"
            onClick={handleVoltar}
            disabled={stepAtual === 0}
            style={{ visibility: stepAtual === 0 ? 'hidden' : 'visible' }}
          >
            Voltar
          </button>

          <button
            className="btn-primary"
            onClick={handleAvancar}
            disabled={!podeAvancar() || salvando}
          >
            {salvando ? 'Salvando...' : stepAtual === steps.length - 1 ? 'Concluir' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
