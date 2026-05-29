import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

const KIRVANO_PLANS = {
    '0b135afa-4b8f-490c-8c1c-c70ecffa8d5e': 'premium',
    'c5a42b3d-f997-4438-bf82-7e927b125390': 'basico'
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        console.log('[Kirvano Webhook] Payload:', JSON.stringify(body));

        const event = body.event || body.status;
        const email = body.customer?.email || body.email || body.buyer?.email;
        const externalRef = body.external_reference || body.customer?.external_id || body.metadata?.external_reference;
        const checkoutId = body.checkout_id || body.product?.checkout_id || body.offer?.checkout_id;

        if (!email && !externalRef) {
            console.log('[Kirvano Webhook] Sem email ou external_reference');
            return res.status(400).json({ error: 'Missing identifiers' });
        }

        const isApproved = ['purchase.approved', 'purchase.completed', 'APPROVED', 'COMPLETED', 'paid'].some(
            s => (event || '').toLowerCase().includes(s.toLowerCase())
        ) || body.type === 'SALE' || body.paid === true;

        if (!isApproved) {
            console.log('[Kirvano Webhook] Evento nao e aprovado:', event);
            return res.status(200).json({ received: true, action: 'ignored' });
        }

        let plano = KIRVANO_PLANS[checkoutId] || null;
        if (!plano) {
            const productName = (body.product?.name || body.offer?.name || '').toLowerCase();
            if (productName.includes('premium')) plano = 'premium';
            else if (productName.includes('basico') || productName.includes('básico')) plano = 'basico';
        }

        if (!plano) {
            console.log('[Kirvano Webhook] Nao foi possivel identificar o plano');
            return res.status(200).json({ received: true, action: 'plan_not_identified' });
        }

        let userId = externalRef;

        if (!userId && email) {
            const { data: users } = await supabase
                .from('usuarios')
                .select('id')
                .eq('email', email)
                .limit(1);

            if (users && users.length > 0) {
                userId = users[0].id;
            }
        }

        if (!userId) {
            console.log('[Kirvano Webhook] Usuario nao encontrado:', email, externalRef);
            return res.status(200).json({ received: true, action: 'user_not_found' });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ plano, atualizado_em: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            console.error('[Kirvano Webhook] Erro ao atualizar:', error);
            return res.status(500).json({ error: 'Update failed' });
        }

        console.log(`[Kirvano Webhook] Plano ${plano} ativado para usuario ${userId}`);
        return res.status(200).json({ received: true, action: 'plan_updated', plano });

    } catch (err) {
        console.error('[Kirvano Webhook] Erro:', err);
        return res.status(500).json({ error: 'Internal error' });
    }
}
