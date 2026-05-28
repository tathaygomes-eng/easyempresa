import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { listarCategorias, criarCategoria, atualizarCategoria, desativarCategoria } from '../../services/categoriasService';
import { useAuth } from '../../context/AuthContext';
import { PLANOS } from '../../config/planos';
import './Categorias.css';

const emptyForm = { nome: '', tipo: 'receita', cor: '#10B981', icone: 'tag' };

const CORES = [
    '#10B981', '#0D9488', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
    '#EC4899', '#F43F5E', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#6B7280', '#78716C', '#1E293B'
];

const ICONES = [
    'tag', 'shopping-cart', 'briefcase', 'home', 'car', 'utensils',
    'heart', 'book', 'gift', 'music', 'camera', 'wifi',
    'zap', 'droplet', 'users', 'file-text', 'truck', 'megaphone',
    'percent', 'plus-circle', 'more-horizontal', 'message-circle'
];

export default function Categorias() {
    const toast = useToast();
    const { planoKey } = useAuth();
    const planoConfig = PLANOS[planoKey] || PLANOS.gratuito;
    const canCreateCustom = planoConfig.features.categoriasCustom;

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const fetchData = () => {
        setLoading(true);
        listarCategorias()
            .then(res => setCategorias(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canCreateCustom && !editingId) {
            toast.error('Upgrade para o plano Basico para criar categorias personalizadas.');
            return;
        }
        const promise = editingId ? atualizarCategoria(editingId, form) : criarCategoria(form);
        promise.then(() => {
            setShowModal(false);
            setEditingId(null);
            setForm(emptyForm);
            fetchData();
            toast.success(editingId ? 'Categoria atualizada!' : 'Categoria criada!');
        }).catch(err => toast.error(err.message));
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setForm({ nome: c.nome, tipo: c.tipo, cor: c.cor || '#6B7280', icone: c.icone || 'tag' });
        setShowModal(true);
    };

    const handleDelete = (c) => {
        if (c.user_id === null) {
            toast.error('Categorias do sistema nao podem ser desativadas.');
            return;
        }
        desativarCategoria(c.id).then(() => {
            fetchData();
            toast.success('Categoria desativada!');
        }).catch(err => toast.error(err.message));
    };

    const categoriasFiltradas = filtroTipo === 'todos'
        ? categorias
        : categorias.filter(c => c.tipo === filtroTipo);

    const receitas = categorias.filter(c => c.tipo === 'receita');
    const despesas = categorias.filter(c => c.tipo === 'despesa');

    return (
        <div className="categorias-page">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Categorias</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {categorias.length} categorias ({receitas.length} receitas, {despesas.length} despesas)
                    </p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
                    + Nova Categoria
                </button>
            </div>

            <div className="cat-filters">
                <button className={`cat-filter-btn ${filtroTipo === 'todos' ? 'active' : ''}`} onClick={() => setFiltroTipo('todos')}>Todas</button>
                <button className={`cat-filter-btn ${filtroTipo === 'receita' ? 'active receita' : ''}`} onClick={() => setFiltroTipo('receita')}>Receitas</button>
                <button className={`cat-filter-btn ${filtroTipo === 'despesa' ? 'active despesa' : ''}`} onClick={() => setFiltroTipo('despesa')}>Despesas</button>
            </div>

            {loading ? (
                <div className="loading-inline">Carregando...</div>
            ) : categoriasFiltradas.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhuma categoria encontrada.</p>
                </div>
            ) : (
                <div className="cat-grid">
                    {categoriasFiltradas.map(c => (
                        <div key={c.id} className="cat-card">
                            <div className="cat-card-left">
                                <div className="cat-icon" style={{ background: c.cor + '20', color: c.cor }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                </div>
                                <div className="cat-info">
                                    <span className="cat-nome">{c.nome}</span>
                                    <span className={`cat-tipo-badge ${c.tipo}`}>{c.tipo === 'receita' ? 'Receita' : 'Despesa'}</span>
                                </div>
                            </div>
                            <div className="cat-card-actions">
                                {c.user_id !== null ? (
                                    <>
                                        <button className="btn-icon" onClick={() => handleEdit(c)} title="Editar">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        <button className="btn-icon btn-danger" onClick={() => handleDelete(c)} title="Desativar">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                        </button>
                                    </>
                                ) : (
                                    <span className="cat-system-badge">Sistema</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <label>Nome *</label>
                                    <input type="text" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Marketing" />
                                </div>
                                <div className="form-row">
                                    <label>Tipo</label>
                                    <div className="radio-group">
                                        <label className={`radio-label ${form.tipo === 'receita' ? 'active receita' : ''}`}>
                                            <input type="radio" name="tipo" value="receita" checked={form.tipo === 'receita'} onChange={e => setForm({ ...form, tipo: e.target.value })} /> Receita
                                        </label>
                                        <label className={`radio-label ${form.tipo === 'despesa' ? 'active despesa' : ''}`}>
                                            <input type="radio" name="tipo" value="despesa" checked={form.tipo === 'despesa'} onChange={e => setForm({ ...form, tipo: e.target.value })} /> Despesa
                                        </label>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <label>Cor</label>
                                    <div className="color-grid">
                                        {CORES.map(cor => (
                                            <button
                                                key={cor}
                                                type="button"
                                                className={`color-swatch ${form.cor === cor ? 'selected' : ''}`}
                                                style={{ background: cor }}
                                                onClick={() => setForm({ ...form, cor })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">{editingId ? 'Salvar' : 'Criar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
