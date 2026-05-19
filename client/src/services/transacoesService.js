import api from './api';

export const listarTransacoes = (params) => api.get('/transacoes', { params });
export const getTransacao = (id) => api.get(`/transacoes/${id}`);
export const criarTransacao = (data) => api.post('/transacoes', data);
export const atualizarTransacao = (id, data) => api.put(`/transacoes/${id}`, data);
export const excluirTransacao = (id) => api.delete(`/transacoes/${id}`);
export const alterarStatusTransacao = (id, status) => api.patch(`/transacoes/${id}/status`, { status });
