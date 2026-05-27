import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { listarAgendamentos, criarAgendamento, atualizarAgendamento, excluirAgendamento, alterarStatusAgendamento } from '../../services/agendamentosService';
import { listarClientes } from '../../services/clientesService';
import { formatDateTime, statusColors, statusLabels } from '../../utils/formatters';
import './Calendario.css';

const emptyForm = {
    titulo: '', descricao: '', data_inicio: '', data_fim: '', dia_inteiro: 0,
    cliente_id: '', local: '', status: 'agendado', lembrete: 1, lembrete_minutos: 30, cor: '#3B82F6'
};

export default function Calendario() {
    const toast = useToast();
    const [agendamentos, setAgendamentos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fetchData = () => {
        setLoading(true);
        const inicio = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const fim = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

        listarAgendamentos({ data_inicio: inicio, data_fim: fim })
            .then(res => setAgendamentos(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [currentDate]);
    useEffect(() => {
        listarClientes({ limit: 100 }).then(res => setClientes(res.data)).catch(console.error);
    }, []);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    const getAgendamentosDoDia = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return agendamentos.filter(a => a.data_inicio.startsWith(dateStr));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const promise = editingId ? atualizarAgendamento(editingId, form) : criarAgendamento(form);
        promise.then(() => { setShowModal(false); setEditingId(null); setForm(emptyForm); fetchData(); toast.success(editingId ? 'Agendamento atualizado!' : 'Agendamento criado!'); }).catch(err => toast.error(err.message));
    };

    const handleEdit = (a) => {
        setEditingId(a.id);
        setForm({ ...a, cliente_id: a.cliente_id || '' });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Deseja excluir este agendamento?')) {
            excluirAgendamento(id).then(() => { fetchData(); toast.success('Agendamento excluido!'); }).catch(err => toast.error(err.message));
        }
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    return (
        <div className="calendario-page">
            <div className="page-header">
                <div className="cal-nav">
                    <button onClick={prevMonth} className="btn-icon-nav">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <h2>{meses[month]} {year}</h2>
                    <button onClick={nextMonth} className="btn-icon-nav">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
                <button className="btn-primary" onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
                    + Novo Agendamento
                </button>
            </div>

            <div className="cal-grid">
                {diasSemana.map(d => <div key={d} className="cal-header">{d}</div>)}
                {blanks.map(b => <div key={`b${b}`} className="cal-day blank" />)}
                {days.map(day => {
                    const ags = getAgendamentosDoDia(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                    return (
                        <div key={day} className={`cal-day ${isToday ? 'today' : ''} ${selectedDay === day ? 'selected' : ''} ${ags.length > 0 ? 'has-events' : ''}`} onClick={() => setSelectedDay(selectedDay === day ? null : day)}>
                            <span className="cal-day-num">{day}</span>
                            <div className="cal-events">
                                {ags.slice(0, 2).map(a => (
                                    <div key={a.id} className="cal-event" style={{ background: a.cor }} title={a.titulo}>
                                        {a.titulo}
                                    </div>
                                ))}
                                {ags.length > 2 && <div className="cal-event-more">+{ags.length - 2}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedDay && (
                <div className="day-detail">
                    <h3>Agendamentos - {selectedDay}/{month + 1}/{year}</h3>
                    {getAgendamentosDoDia(selectedDay).length === 0 ? (
                        <p className="empty-text">Nenhum agendamento neste dia.</p>
                    ) : (
                        <div className="day-list">
                            {getAgendamentosDoDia(selectedDay).map(a => (
                                <div key={a.id} className="day-item">
                                    <div className="day-item-info">
                                        <strong>{a.titulo}</strong>
                                        <span>{a.cliente_nome || 'Sem cliente'} - {a.local || 'Sem local'}</span>
                                        <span className="status-badge" style={{ background: statusColors[a.status]?.bg, color: statusColors[a.status]?.text }}>{statusLabels[a.status]}</span>
                                    </div>
                                    <div className="day-item-actions">
                                        <button className="btn-icon" onClick={() => handleEdit(a)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        <button className="btn-icon btn-danger" onClick={() => handleDelete(a.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label>Titulo *</label>
                                <input type="text" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <label>Descricao</label>
                                <textarea value={form.descricao || ''} onChange={e => setForm({ ...form, descricao: e.target.value })} rows="2" />
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Data/Hora Inicio *</label>
                                    <input type="datetime-local" required value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Data/Hora Fim *</label>
                                    <input type="datetime-local" required value={form.data_fim} onChange={e => setForm({ ...form, data_fim: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Cliente</label>
                                    <select value={form.cliente_id || ''} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                                        <option value="">Selecione</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Local</label>
                                    <input type="text" value={form.local || ''} onChange={e => setForm({ ...form, local: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row-group">
                                <div className="form-row">
                                    <label>Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="agendado">Agendado</option>
                                        <option value="confirmado">Confirmado</option>
                                        <option value="concluido">Concluido</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Cor</label>
                                    <input type="color" value={form.cor} onChange={e => setForm({ ...form, cor: e.target.value })} />
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
