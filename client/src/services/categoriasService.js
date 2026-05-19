import api from './api';

export const listarCategorias = (params) => api.get('/categorias', { params });
export const criarCategoria = (data) => api.post('/categorias', data);
export const atualizarCategoria = (id, data) => api.put(`/categorias/${id}`, data);
export const desativarCategoria = (id) => api.delete(`/categorias/${id}`);
