import { useState, useEffect } from 'react';
import { listarTransacoes, criarTransacao, atualizarTransacao, excluirTransacao, alterarStatusTransacao } from '../../services/transacoesService';
import { listarCategorias } from '../../services/categoriasService';
import { listarClientes } from '../../services/clientesService';
import { formatBRL, formatDate, statusColors, statusLabels } from '../../utils/formatters';
import './Transacoes.css';

const emptyForm = {
    tipo: 'despesa', descricao: '', valor: '', data_transacao: new Date().toISOString().slice(0, 10),
    data_vencimento: '', status: 'pendente', categoria_id: '', cliente_id: '', forma_pagamento: '', observacoes: ''
};

export default function Transacoes() {
    const [transacoes, setTransacoes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ tipo: '', status: '', page: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        listarTransacoes(filters)
            .then(res => { setTransacoes(res.data); setPagination(res.pagination); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [filters]);
    useEffect(() => {
        listarCategorias().then(res => setCategorias(res.data)).catch(console.error);
        listarClientes({ limit: 100 }).then(res => setClientes(res.data)).catch(console.error);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...form, valor: parseFloat(form.valor), categoria_id: form.categoria_id || null, cliente_id: form.cliente_id || null };
        const promise = editingId ? atualizarTransacao(editingId, data) : criarTransacao(data);
        promise.then(() => { setShowModal(false); setEditingId(null); setForm(emptyForm); fetchData(); }).catch(err => alert(err.message));
    };

    const handleEdit = (t) => {
        setEditingId(t.id);
        setForm({ ...t, valor: String(t.valor), categoria_id: t.categoria_id || '', cliente_id: t.cliente_id || '' });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Deseja excluir esta transacao?')) {
            excluirTransacao(id).then(fetchData).catch(err => alert(err.message));
        }
    };

    const handleStatusChange = (id, status) => {
        alterarStatusTransacao(id, status).then(fetchData).catch(err => alert(err.message));
    };

    return (
        <div className="transacoes-page">
            <div className="page-header">
                <div className="filters">
                    <select value={filters.tipo} onChange={e => setFilters({ ...filters, tipo: e.target.value, page: 1 })}>
                        <option value="">Todos os tipos</option>
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                    </select>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                        <option value="">Todos os status</option>
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                        <option value="atrasado">Atrasado</option>
                    </select>
                </div>
                <button className="btn-primary" onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
                    + Nova Transacao
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descricao</th>
                            <th>Categoria</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Acoes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="empty-text">Carregando...</td></tr>
                        ) : transacoes.length === 0 ? (
                            <tr><td colSpan="7" className="empty-text">Nenhuma transacao encontrada.</td></tr>
                        ) : transacoes.map(t => (
                            <tr key={t.id}>
                                <td>{formatDate(t.data_transacao)}</td>
                                <td><strong>{t.descricao}</strong></td>
                                <td>{t.categoria_nome || '-'}</td>
                                <td>{t.cliente_nome || '-'}</td>
                                <td className={`valor ${t.tipo}`}>{t.tipo === 'receita' ? '+' : '-'} {formatBRL(t.valor)}</td>
                                <td>
                                    <span className="status-badge" style={{ background: statusColors[t.status]?.bg, color: statusColors[t.status]?.text }}>
                                        {statusLabels[t.status]}
                                    </span>
                                </td>
                                <td className="acoes">
                                    <select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} className="status-select">
                                        <option value="pendente">Pendente</option>
                                        <option value="pago">Pago</option>
                                        <option value="atrasado">Atrasado</option>
                                    </select>
                                    <button className="btn-icon" onClick={() => handleEdit(t)} title="Editar">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button className="btn-icon btn-danger" onClick={() => handleDelete(t.id)} title="Excluir">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}>Anterior</button>
                    <span>Pagina {pagination.page} de {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}>Proxima</button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingId ? 'Editar Transacao' : 'Nova Transacao'}</h2>
                        <form onSubmit={handleSubmit}>
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
                                <label>Descricao *</label>
                                <input type="text" required value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <label>Valor *</label>
                                <input type="number" step="0.01" min="0.01" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Data *</label>
                                    <input type="date" required value={form.data_transacao} onChange={e => setForm({ ...form, data_transacao: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Vencimento</label>
                                    <input type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Categoria</label>
                                    <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                                        <option value="">Selecione</option>
                                        {categorias.filter(c => c.tipo === form.tipo).map(c => (
                                            <option key={c.id} value={c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="pendente">Pendente</option>
                                        <option value="pago">Pago</option>
                                        <option value="atrasado">Atrasado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Cliente</label>
                                    <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                                        <option value="">Selecione</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Forma Pagamento</label>
                                    <select value={form.forma_pagamento} onChange={e => setForm({ ...form, forma_pagamento: e.target.value })}>
                                        <option value="">Selecione</option>
                                        <option value="pix">PIX</option>
                                        <option value="cartao">Cartao</option>
                                        <option value="boleto">Boleto</option>
                                        <option value="dinheiro">Dinheiro</option>
                                        <option value="transferencia">Transferencia</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Observacoes</label>
                                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows="3" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">{editingId ? 'Salvar' : 'Criar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
