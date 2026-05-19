import api from './api';

export const getResumo = () => api.get('/dashboard/resumo');
export const getProximosAgendamentos = () => api.get('/dashboard/proximos-agendamentos');
export const getTransacoesRecentes = () => api.get('/dashboard/transacoes-recentes');
