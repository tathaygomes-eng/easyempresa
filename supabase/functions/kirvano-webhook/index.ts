import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapeamento de checkout IDs para planos
const CHECKOUT_PLAN_MAP: Record<string, { plano: string; valor: number }> = {
  '0b135afa-4b8f-490c-8c1c-c70ecffa8d5e': { plano: 'premium', valor: 49.90 },
  'c5a42b3d-f997-4438-bf82-7e927b125390': { plano: 'basico', valor: 9.90 },
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    console.log('Webhook recebido:', JSON.stringify(body))

    // Kirvano envia diferentes formatos dependendo da versão
    // Formato principal: { event, checkout_id, order_id, status, customer: { email } }
    const { event, checkout_id, order_id, status, customer } = body

    // Verificar se é um evento de pagamento aprovado
    const isApproved =
      event === 'PAYMENT_APPROVED' ||
      event === 'ORDER_PAID' ||
      status === 'approved' ||
      status === 'paid' ||
      status === 'APPROVED'

    if (!isApproved) {
      console.log('Evento ignorado:', event, status)
      return new Response(
        JSON.stringify({ message: 'Evento ignorado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Identificar o plano pelo checkout_id
    const checkoutId = checkout_id || body.checkout?.id
    const planInfo = CHECKOUT_PLAN_MAP[checkoutId]

    if (!planInfo) {
      console.log('Checkout nao encontrado:', checkoutId)
      return new Response(
        JSON.stringify({ error: 'Checkout nao reconhecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar usuario por email ou external_reference
    const customerEmail = customer?.email || body.customer_email || body.email
    const externalRef = body.external_reference || body.metadata?.user_id

    let userId: string | null = null

    if (externalRef) {
      // Buscar por ID (external_reference = user_id)
      const { data: user } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', externalRef)
        .single()
      userId = user?.id || null
    }

    if (!userId && customerEmail) {
      // Buscar por email
      const { data: user } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', customerEmail)
        .single()
      userId = user?.id || null
    }

    if (!userId) {
      console.log('Usuario nao encontrado:', { customerEmail, externalRef })
      return new Response(
        JSON.stringify({ error: 'Usuario nao encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calcular data de expiracao (30 dias)
    const dataExpiracao = new Date()
    dataExpiracao.setDate(dataExpiracao.getDate() + 30)

    // Atualizar plano do usuario
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        plano: planInfo.plano,
        plano_expira_em: dataExpiracao.toISOString(),
        kirvano_order_id: order_id || null,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erro ao atualizar usuario:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar plano' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Registrar assinatura
    const { error: insertError } = await supabase
      .from('assinaturas')
      .insert({
        user_id: userId,
        plano: planInfo.plano,
        valor: planInfo.valor,
        status: 'ativa',
        kirvano_order_id: order_id || null,
        kirvano_checkout_id: checkoutId,
        data_inicio: new Date().toISOString(),
        data_expiracao: dataExpiracao.toISOString()
      })

    if (insertError) {
      console.error('Erro ao registrar assinatura:', insertError)
    }

    console.log(`Plano ${planInfo.plano} ativado para usuario ${userId}`)

    return new Response(
      JSON.stringify({
        message: 'Plano ativado com sucesso',
        plano: planInfo.plano,
        expira_em: dataExpiracao.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
