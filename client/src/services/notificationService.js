import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const CHANNEL_ID = 'easyempresa_lembretes';

export async function requestNotificationPermission() {
    if (!Capacitor.isNativePlatform()) return false;

    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display === 'prompt' || permStatus.display === 'prompt-with-rationale') {
        permStatus = await LocalNotifications.requestPermissions();
    }
    return permStatus.display === 'granted';
}

export async function createNotificationChannel() {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await LocalNotifications.createChannel({
            id: CHANNEL_ID,
            name: 'Lembretes de Agendamentos',
            description: 'Notificacoes de lembretes de agendamentos',
            importance: 4,
            visibility: 1,
            vibration: true,
            sound: 'default',
        });
    } catch (e) {
        console.warn('Channel creation:', e.message);
    }
}

export async function scheduleReminder(agendamento) {
    if (!Capacitor.isNativePlatform()) return -1;

    const granted = await requestNotificationPermission();
    if (!granted) return -1;

    const dataInicio = new Date(agendamento.data_inicio);
    const minutosAntes = agendamento.lembrete_minutos || 30;
    const triggerTime = new Date(dataInicio.getTime() - minutosAntes * 60 * 1000);

    if (triggerTime <= new Date()) return -1;

    const notifId = hashCode(agendamento.id);

    const bodyParts = [];
    if (agendamento.local) bodyParts.push(`Local: ${agendamento.local}`);
    bodyParts.push(`Horario: ${formatTime(dataInicio)}`);

    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: notifId,
                title: agendamento.titulo,
                body: bodyParts.join(' | '),
                schedule: { at: triggerTime },
                channelId: CHANNEL_ID,
                extra: { agendamentoId: agendamento.id },
            }]
        });
    } catch (e) {
        console.warn('Schedule notification:', e.message);
    }

    return notifId;
}

export async function cancelReminder(agendamentoId) {
    if (!Capacitor.isNativePlatform()) return;
    const notifId = hashCode(agendamentoId);
    try {
        await LocalNotifications.cancel({
            notifications: [{ id: notifId }]
        });
    } catch (e) {
        console.warn('Cancel notification:', e.message);
    }
}

export async function rescheduleReminder(agendamento) {
    await cancelReminder(agendamento.id);
    return scheduleReminder(agendamento);
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < String(str).length; i++) {
        const char = String(str).charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash) % 2147483647;
}

function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
