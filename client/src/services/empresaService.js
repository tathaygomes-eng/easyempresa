import api from './api';

export function obterConfig() {
  return api.get('/empresa/config');
}

export function salvarConfig(dados) {
  return api.put('/empresa/config', dados);
}

export function completarOnboarding(dados) {
  return api.post('/empresa/onboarding', dados);
}

export function obterCategoriasSugeridas(ramo) {
  return api.get(`/empresa/categorias-sugeridas/${ramo}`);
}
