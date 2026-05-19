import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCliente, listarInteracoes, criarInteracao, listarTransacoesCliente } from '../../services/clientesService';
import { formatBRL, formatDate, formatDateTime, statusColors, statusLabels } from '../../utils/formatters';
import './ClienteDetalhes.css';

export default function ClienteDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [interacoes, setInteracoes] = useState([]);
    const [transacoes, setTransacoes] = useState([]);
    const [activeTab, setActiveTab] = useState('interacoes');
    const [showInteracaoModal, setShowInteracaoModal] = useState(false);
    const [interacaoForm, setInteracaoForm] = useState({ tipo: 'nota', descricao: '', data_interacao: new Date().toISOString().slice(0, 16) });
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getCliente(id), listarInteracoes(id), listarTransacoesCliente(id)])
            .then(([c, i, t]) => { setCliente(c.data); setInteracoes(i.data); setTransacoes(t.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleAddInteracao = (e) => {
        e.preventDefault();
        criarInteracao(id, interacaoForm)
            .then(() => { setShowInteracaoModal(false); setInteracaoForm({ tipo: 'nota', descricao: '', data_interacao: new Date().toISOString().slice(0, 16) }); listarInteracoes(id).then(res => setInteracoes(res.data)); })
            .catch(err => alert(err.message));
    };

    const tipoLabels = { reuniao: 'Reuniao', ligacao: 'Ligacao', email: 'Email', whatsapp: 'WhatsApp', nota: 'Nota', outro: 'Outro' };

    if (loading) return <div className="loading">Carregando...</div>;
    if (!cliente) return <div className="loading">Cliente nao encontrado.</div>;

    return (
        <div className="detalhes-page">
            <button className="btn-back" onClick={() => navigate('/agenda/clientes')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Voltar
            </button>

            <div className="cliente-card">
                <div className="cliente-info">
                    <h2>{cliente.nome}</h2>
                    <div className="cliente-meta">
                        {cliente.email && <span>{cliente.email}</span>}
                        {cliente.telefone && <span>{cliente.telefone}</span>}
                        {cliente.cpf_cnpj && <span>{cliente.cpf_cnpj}</span>}
                    </div>
                    <div className="cliente-meta">
                        {cliente.endereco && <span>{cliente.endereco}</span>}
                        {cliente.cidade && <span>{cliente.cidade} - {cliente.estado}</span>}
                    </div>
                    {cliente.observacoes && <p className="cliente-obs">{cliente.observacoes}</p>}
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'interacoes' ? 'active' : ''}`} onClick={() => setActiveTab('interacoes')}>Interacoes</button>
                <button className={`tab ${activeTab === 'transacoes' ? 'active' : ''}`} onClick={() => setActiveTab('transacoes')}>Transacoes</button>
            </div>

            {activeTab === 'interacoes' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h3>Historico de Interacoes</h3>
                        <button className="btn-primary" onClick={() => setShowInteracaoModal(true)}>+ Nova Interacao</button>
                    </div>
                    {interacoes.length === 0 ? (
                        <p className="empty-text">Nenhuma interacao registrada.</p>
                    ) : (
                        <div className="timeline">
                            {interacoes.map(i => (
                                <div key={i.id} className="timeline-item">
                                    <div className="timeline-dot" />
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className="timeline-tipo">{tipoLabels[i.tipo]}</span>
                                            <span className="timeline-data">{formatDateTime(i.data_interacao)}</span>
                                        </div>
                                        <p>{i.descricao}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'transacoes' && (
                <div className="tab-content">
                    <h3>Transacoes do Cliente</h3>
                    {transacoes.length === 0 ? (
                        <p className="empty-text">Nenhuma transacao vinculada.</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>Data</th><th>Descricao</th><th>Categoria</th><th>Valor</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {transacoes.map(t => (
                                        <tr key={t.id}>
                                            <td>{formatDate(t.data_transacao)}</td>
                                            <td><strong>{t.descricao}</strong></td>
                                            <td>{t.categoria_nome || '-'}</td>
                                            <td style={{ color: t.tipo === 'receita' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                                {t.tipo === 'receita' ? '+' : '-'} {formatBRL(t.valor)}
                                            </td>
                                            <td><span className="status-badge" style={{ background: statusColors[t.status]?.bg, color: statusColors[t.status]?.text }}>{statusLabels[t.status]}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showInteracaoModal && (
                <div className="modal-overlay" onClick={() => setShowInteracaoModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Nova Interacao</h2>
                        <form onSubmit={handleAddInteracao}>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Tipo</label>
                                    <select value={interacaoForm.tipo} onChange={e => setInteracaoForm({ ...interacaoForm, tipo: e.target.value })}>
                                        <option value="reuniao">Reuniao</option>
                                        <option value="ligacao">Ligacao</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="nota">Nota</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Data</label>
                                    <input type="datetime-local" value={interacaoForm.data_interacao} onChange={e => setInteracaoForm({ ...interacaoForm, data_interacao: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Descricao *</label>
                                <textarea required value={interacaoForm.descricao} onChange={e => setInteracaoForm({ ...interacaoForm, descricao: e.target.value })} rows="4" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowInteracaoModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
