import api from './api';

export const login = (email, senha) => api.post('/auth/login', { email, senha });
export const registrar = (nome, email, senha) => api.post('/auth/registrar', { nome, email, senha });
export const getPerfil = () => api.get('/auth/perfil');
export const atualizarPlano = (plano) => api.put('/auth/plano', { plano });
