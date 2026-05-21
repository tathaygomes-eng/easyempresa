// Categorias do sistema (seed) - mesmas do backend
import { findAll, insert, saveTable, getTable } from './localDb';

const SYSTEM_CATEGORIES = [
    // Receitas
    { nome: 'Vendas', tipo: 'receita', cor: '#10B981', icone: 'shopping-cart' },
    { nome: 'Servicos', tipo: 'receita', cor: '#3B82F6', icone: 'briefcase' },
    { nome: 'Consultoria', tipo: 'receita', cor: '#8B5CF6', icone: 'message-circle' },
    { nome: 'Comissoes', tipo: 'receita', cor: '#F59E0B', icone: 'percent' },
    { nome: 'Outros Recebimentos', tipo: 'receita', cor: '#6366F1', icone: 'plus-circle' },
    // Despesas
    { nome: 'Aluguel', tipo: 'despesa', cor: '#EF4444', icone: 'home' },
    { nome: 'Salarios', tipo: 'despesa', cor: '#F97316', icone: 'users' },
    { nome: 'Impostos', tipo: 'despesa', cor: '#DC2626', icone: 'file-text' },
    { nome: 'Energia', tipo: 'despesa', cor: '#FBBF24', icone: 'zap' },
    { nome: 'Agua', tipo: 'despesa', cor: '#06B6D4', icone: 'droplet' },
    { nome: 'Internet', tipo: 'despesa', cor: '#8B5CF6', icone: 'wifi' },
    { nome: 'Marketing', tipo: 'despesa', cor: '#EC4899', icone: 'megaphone' },
    { nome: 'Transporte', tipo: 'despesa', cor: '#14B8A6', icone: 'truck' },
    { nome: 'Outros Gastos', tipo: 'despesa', cor: '#6B7280', icone: 'more-horizontal' },
];

export function seedSystemCategories() {
    const existing = findAll('categorias');
    if (existing.length > 0) return;

    SYSTEM_CATEGORIES.forEach(cat => {
        insert('categorias', { ...cat, user_id: null, ativo: 1 });
    });
}

// Categorias sugeridas por ramo (para onboarding)
export const categoriasPorRamo = {
    restaurante: {
        despesa: [
            { nome: 'Ingredientes', cor: '#EF4444', icone: 'utensils' },
            { nome: 'Bebidas', cor: '#F97316', icone: 'wine' },
            { nome: 'Embalagens', cor: '#8B5CF6', icone: 'package' },
            { nome: 'Equipamentos', cor: '#06B6D4', icone: 'tool' },
            { nome: 'Delivery', cor: '#10B981', icone: 'truck' },
        ],
    },
    comercio: {
        despesa: [
            { nome: 'Estoque', cor: '#EF4444', icone: 'box' },
            { nome: 'Fornecedores', cor: '#F97316', icone: 'truck' },
            { nome: 'Frete', cor: '#8B5CF6', icone: 'package' },
            { nome: 'Embalagens', cor: '#06B6D4', icone: 'package' },
        ],
    },
    servicos: {
        despesa: [
            { nome: 'Materiais', cor: '#EF4444', icone: 'tool' },
            { nome: 'Software', cor: '#F97316', icone: 'monitor' },
            { nome: 'Treinamento', cor: '#8B5CF6', icone: 'book' },
            { nome: 'Deslocamento', cor: '#06B6D4', icone: 'map' },
        ],
    },
    saude: {
        despesa: [
            { nome: 'Materiais', cor: '#EF4444', icone: 'tool' },
            { nome: 'Equipamentos', cor: '#F97316', icone: 'cpu' },
            { nome: 'Medicamentos', cor: '#8B5CF6', icone: 'heart' },
            { nome: 'Laboratorio', cor: '#06B6D4', icone: 'flask' },
        ],
    },
    educacao: {
        despesa: [
            { nome: 'Material Didatico', cor: '#EF4444', icone: 'book' },
            { nome: 'Tecnologia', cor: '#F97316', icone: 'monitor' },
            { nome: 'Eventos', cor: '#8B5CF6', icone: 'calendar' },
        ],
    },
    tecnologia: {
        despesa: [
            { nome: 'Software', cor: '#EF4444', icone: 'code' },
            { nome: 'Hardware', cor: '#F97316', icone: 'cpu' },
            { nome: 'Cloud', cor: '#8B5CF6', icone: 'cloud' },
            { nome: 'Licencas', cor: '#06B6D4', icone: 'key' },
        ],
    },
    construcao: {
        despesa: [
            { nome: 'Materiais', cor: '#EF4444', icone: 'tool' },
            { nome: 'Mao de Obra', cor: '#F97316', icone: 'users' },
            { nome: 'Equipamentos', cor: '#8B5CF6', icone: 'truck' },
            { nome: 'Transporte', cor: '#06B6D4', icone: 'map' },
        ],
    },
    beleza: {
        despesa: [
            { nome: 'Produtos', cor: '#EF4444', icone: 'droplet' },
            { nome: 'Equipamentos', cor: '#F97316', icone: 'scissors' },
            { nome: 'Descartaveis', cor: '#8B5CF6', icone: 'trash' },
        ],
    },
    transporte: {
        despesa: [
            { nome: 'Combustivel', cor: '#EF4444', icone: 'fuel' },
            { nome: 'Manutencao', cor: '#F97316', icone: 'tool' },
            { nome: 'Pedagio', cor: '#8B5CF6', icone: 'map' },
            { nome: 'Seguro', cor: '#06B6D4', icone: 'shield' },
        ],
    },
};
