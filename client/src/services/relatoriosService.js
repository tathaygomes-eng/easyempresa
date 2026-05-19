import api from './api';

export const getRelatorioMensal = (params) => api.get('/relatorios/mensal', { params });
export const getRelatorioAnual = (params) => api.get('/relatorios/anual', { params });
export const getPorCategoria = (params) => api.get('/relatorios/por-categoria', { params });
export const getFluxoCaixa = (params) => api.get('/relatorios/fluxo-caixa', { params });
export const getPendencias = () => api.get('/relatorios/pendencias');
