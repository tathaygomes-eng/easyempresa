import api from './api';

export const listarClientes = (params) => api.get('/clientes', { params });
export const getCliente = (id) => api.get(`/clientes/${id}`);
export const criarCliente = (data) => api.post('/clientes', data);
export const atualizarCliente = (id, data) => api.put(`/clientes/${id}`, data);
export const desativarCliente = (id) => api.delete(`/clientes/${id}`);
export const listarInteracoes = (id) => api.get(`/clientes/${id}/interacoes`);
export const criarInteracao = (id, data) => api.post(`/clientes/${id}/interacoes`, data);
export const listarTransacoesCliente = (id) => api.get(`/clientes/${id}/transacoes`);
