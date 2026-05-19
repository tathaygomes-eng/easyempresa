import api from './api';

export const listarAgendamentos = (params) => api.get('/agendamentos', { params });
export const getAgendamento = (id) => api.get(`/agendamentos/${id}`);
export const criarAgendamento = (data) => api.post('/agendamentos', data);
export const atualizarAgendamento = (id, data) => api.put(`/agendamentos/${id}`, data);
export const excluirAgendamento = (id) => api.delete(`/agendamentos/${id}`);
export const alterarStatusAgendamento = (id, status) => api.patch(`/agendamentos/${id}/status`, { status });
export const getLembretes = () => api.get('/agendamentos/lembretes');
