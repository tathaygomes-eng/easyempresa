import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarClientes, criarCliente, atualizarCliente, desativarCliente } from '../../services/clientesService';
import './Clientes.css';

const emptyForm = { nome: '', email: '', telefone: '', cpf_cnpj: '', endereco: '', cidade: '', estado: '', observacoes: '' };

export default function Clientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const fetchData = (page = 1) => {
        setLoading(true);
        listarClientes({ search, page, limit: 20 })
            .then(res => { setClientes(res.data); setPagination(res.pagination); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [search]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const promise = editingId ? atualizarCliente(editingId, form) : criarCliente(form);
        promise.then(() => { setShowModal(false); setEditingId(null); setForm(emptyForm); fetchData(); }).catch(err => alert(err.message));
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setForm(c);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Deseja desativar este cliente?')) {
            desativarCliente(id).then(fetchData).catch(err => alert(err.message));
        }
    };

    return (
        <div className="clientes-page">
            <div className="page-header">
                <div className="search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
                    + Novo Cliente
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Cidade</th>
                            <th>Acoes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="empty-text">Carregando...</td></tr>
                        ) : clientes.length === 0 ? (
                            <tr><td colSpan="5" className="empty-text">Nenhum cliente encontrado.</td></tr>
                        ) : clientes.map(c => (
                            <tr key={c.id}>
                                <td><strong>{c.nome}</strong></td>
                                <td>{c.email || '-'}</td>
                                <td>{c.telefone || '-'}</td>
                                <td>{c.cidade || '-'}</td>
                                <td className="acoes">
                                    <button className="btn-icon" onClick={() => navigate(`/agenda/clientes/${c.id}`)} title="Ver detalhes">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                    <button className="btn-icon" onClick={() => handleEdit(c)} title="Editar">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button className="btn-icon btn-danger" onClick={() => handleDelete(c.id)} title="Desativar">
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
                    <button disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>Anterior</button>
                    <span>Pagina {pagination.page} de {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)}>Proxima</button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label>Nome *</label>
                                <input type="text" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Email</label>
                                    <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Telefone</label>
                                    <input type="text" value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>CPF/CNPJ</label>
                                    <input type="text" value={form.cpf_cnpj || ''} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Cidade</label>
                                    <input type="text" value={form.cidade || ''} onChange={e => setForm({ ...form, cidade: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Endereco</label>
                                    <input type="text" value={form.endereco || ''} onChange={e => setForm({ ...form, endereco: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Estado</label>
                                    <input type="text" value={form.estado || ''} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength="2" />
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Observacoes</label>
                                <textarea value={form.observacoes || ''} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows="3" />
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
