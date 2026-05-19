export const formatBRL = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const formatPercent = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
};

export const statusColors = {
    pago: { bg: '#D1FAE5', text: '#065F46' },
    pendente: { bg: '#FEF3C7', text: '#92400E' },
    atrasado: { bg: '#FEE2E2', text: '#991B1B' },
    agendado: { bg: '#DBEAFE', text: '#1E40AF' },
    confirmado: { bg: '#D1FAE5', text: '#065F46' },
    concluido: { bg: '#E0E7FF', text: '#3730A3' },
    cancelado: { bg: '#F3F4F6', text: '#374151' },
};

export const statusLabels = {
    pago: 'Pago',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    concluido: 'Concluido',
    cancelado: 'Cancelado',
};
