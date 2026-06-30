const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY;
const MIMO_BASE_URL = import.meta.env.VITE_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';
const MIMO_MODEL = import.meta.env.VITE_MIMO_MODEL || 'mimo-v2.5-pro';

const SYSTEM_PROMPT = `Você é o assistente virtual do EasyEmpresa, um aplicativo de gestão empresarial para pequenos negócios brasileiros.

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja direto e objetivo (máximo 5-6 linhas)
- Use emojis com moderação (1-2 por resposta)
- Foque em como o EasyEmpresa pode ajudar
- Se a pergunta não for sobre o app ou finanças/gestão, responda educadamente que só pode ajudar com assuntos do EasyEmpresa

SOBRE O APP:
- Dashboard: resumo do negócio (saldo, receitas, despesas, agendamentos)
- Financeiro: transações, relatórios, fluxo de caixa, categorias
- Agenda: calendário de agendamentos, cadastro de clientes
- Configurações: dados da empresa, senha, tema, foto
- Planos: Gratuito (limitado), Básico R$9,90/mês, Premium R$49,90/mês
- Funciona no navegador e app Android (APK)
- Notificações de agendamento via push
- Upload de foto/logo da empresa

Se o usuário perguntar algo que o app faz, ensine como acessar a funcionalidade.`;

const KNOWLEDGE_BASE = [
    {
        keywords: ['o que', 'easyempresa', 'sobre', 'aplicativo', 'app', 'servico'],
        answer: 'O EasyEmpresa é um aplicativo de gestão empresarial para pequenos negócios! Você pode controlar financeiro, agendar reuniões, gerenciar clientes e acompanhar relatórios, tudo em um só lugar.'
    },
    {
        keywords: ['dashboard', 'painel', 'inicio', 'tela inicial', 'saldo', 'cards'],
        answer: 'O Dashboard mostra um resumo do seu negócio: saldo total, receitas e despesas do mês, próximos agendamentos e transações recentes. Os cards coloridos mostram indicadores importantes.'
    },
    {
        keywords: ['transacao', 'transacoes', 'financeiro', 'dinheiro', 'receita', 'despesa', 'lancamento'],
        answer: 'Para adicionar uma transação, vá em Financeiro > Transações e clique no botão "+ Nova Transação". Preencha o tipo (receita ou despesa), descrição, valor e data. Você também pode categorizar cada lançamento.'
    },
    {
        keywords: ['relatorio', 'relatorios', 'grafico', 'graficos', 'analise'],
        answer: 'Os Relatórios ficam em Financeiro > Relatórios. Lá você vê gráficos de receitas vs despesas, evolução mensal e resumo por categorias. Selecione o período desejado para filtrar.'
    },
    {
        keywords: ['fluxo', 'caixa', 'fluxo de caixa'],
        answer: 'O Fluxo de Caixa em Financeiro > Fluxo de Caixa mostra a entrada e saída de dinheiro ao longo do tempo, com cards de resumo e gráfico de evolução.'
    },
    {
        keywords: ['categoria', 'categorias', 'tipo'],
        answer: 'As categorias organizam suas transações. Vá em Financeiro > Categorias para criar, editar ou excluir categorias de receita e despesa. Cada uma pode ter uma cor e ícone.'
    },
    {
        keywords: ['agendar', 'agendamento', 'agendamentos', 'reuniao', 'reunião', 'marcar', 'horario', 'agenda'],
        answer: 'Para agendar, vá em Agenda > Calendário e clique em "+ Novo Agendamento". Preencha os dados do cliente, data, hora e tipo de serviço. Você pode configurar lembrete automático.'
    },
    {
        keywords: ['cliente', 'clientes', 'cadastro', 'cliente novo'],
        answer: 'Para cadastrar clientes, vá em Agenda > Clientes e clique em "+ Novo Cliente". Preencha os dados pessoais, endereço e informações de contato. Eles serão usados nos agendamentos.'
    },
    {
        keywords: ['senha', 'password', 'trocar senha', 'alterar senha', 'mudar senha'],
        answer: 'Para alterar a senha, vá em Configurações > Alterar Senha. Digite a nova senha e confirme. Precisa ter pelo menos 6 caracteres.'
    },
    {
        keywords: ['empresa', 'nome da empresa', 'ramo', 'negocio'],
        answer: 'Para configurar os dados da empresa, vá em Configurações > Empresa. Lá você define o nome da empresa, ramo de atividade e logo. Essas informações aparecem nos relatórios.'
    },
    {
        keywords: ['tema', 'cor', 'cores', 'personalizar', 'aparência'],
        answer: 'Para mudar a cor do tema, vá em Configurações > Cor do Tema. Escolha a cor que preferir e clique em salvar. A mudança é aplicada imediatamente em todo o app.'
    },
    {
        keywords: ['notificacao', 'notificacoes', 'lembrete', 'lembretes', 'alerta'],
        answer: 'Ao criar um agendamento, ative a opção "Lembrete" e escolha quantos minutos antes quer ser notificado. A notificação aparece mesmo com o app em background!'
    },
    {
        keywords: ['celular', 'mobile', 'android', 'apk', 'download'],
        answer: 'O EasyEmpresa funciona tanto no computador (pelo navegador) quanto no celular (app Android). Baixe o APK e instale no seu celular para ter acesso rápido!'
    },
    {
        keywords: ['logout', 'sair', 'deslogar', 'encerrar sessao'],
        answer: 'Para sair da conta, clique no botão "Sair" no menu lateral (desktop) ou no final da barra de navegação lateral.'
    },
    {
        keywords: ['plano', 'planos', 'preco', 'preço', 'valor', 'gratis', 'gratuito', 'basico', 'premium', 'assinatura'],
        answer: 'O EasyEmpresa tem 3 planos:\n\n• Gratuito: recursos básicos com limites\n• Básico (R$9,90/mês): mais transações e clientes\n• Premium (R$49,90/mês): sem limites + recursos avançados\n\nVeja os detalhes em Configurações > Planos.'
    },
    {
        keywords: ['foto', 'logo', 'upload', 'imagem', 'avatar'],
        answer: 'Para adicionar a logo da empresa, vá em Configurações e clique no ícone de câmera sobre a foto. Aceita JPG e PNG. Aparece nos relatórios e no perfil.'
    },
    {
        keywords: ['problema', 'erro', 'nao funciona', 'bug', 'ajuda', 'suporte'],
        answer: 'Se você está com problemas, tente: 1) Atualizar a página, 2) Verificar sua conexão, 3) Sair e entrar novamente. Se persistir, entre em contato com o suporte.'
    },
    {
        keywords: ['como usar', 'tutorial', 'guia', 'comecar', 'iniciar', 'primeiro'],
        answer: 'Para começar com o EasyEmpresa:\n\n1. Configure sua empresa em Configurações\n2. Cadastre seus clientes em Agenda > Clientes\n3. Comece a lançar transações em Financeiro\n4. Agende reuniões em Agenda > Calendário\n5. Acompanhe tudo pelo Dashboard!'
    },
    {
        keywords: ['economizar', 'economia', 'poupar'],
        answer: 'Para economizar:\n\n1. Use categorias para acompanhar gastos\n2. Revise transações regularmente\n3. Identifique gastos supérfluos nos relatórios\n4. Defina metas de economia mensal'
    },
    {
        keywords: ['gastei', 'gastar', 'comprei', 'compras'],
        answer: 'Para controlar gastos:\n\n1. Registre cada compra em Financeiro > Transações\n2. Use categorias específicas\n3. Veja o relatório de despesas mensais\n4. Compare receita vs despesas'
    },
    {
        keywords: ['dívida', 'divida', 'fatura'],
        answer: 'Para lidar com dívidas:\n\n1. Registre todas como despesas\n2. Use categorias "Empréstimos" ou "Financiamentos"\n3. Priorize dívidas com juros altos\n4. Use o fluxo de caixa para ver sobra'
    },
    {
        keywords: ['investir', 'investimento', 'renda extra'],
        answer: 'Para investimentos:\n\n1. Crie categoria "Investimentos"\n2. Registre todo dinheiro investido\n3. Acompanhe retorno com relatórios\n4. Comece com valores pequenos e consistentes'
    }
];

function matchKnowledgeBase(message) {
    const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let bestMatch = null;
    let bestScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
        let score = 0;
        for (const keyword of entry.keywords) {
            const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (lower.includes(normalizedKeyword)) {
                score += normalizedKeyword.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    if (bestMatch && bestScore >= 4) {
        return bestMatch.answer;
    }
    return null;
}

async function callMimoAPI(message, history = []) {
    if (!MIMO_API_KEY) {
        return null;
    }

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-6).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        })),
        { role: 'user', content: message }
    ];

    try {
        const response = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MIMO_API_KEY}`
            },
            body: JSON.stringify({
                model: MIMO_MODEL,
                messages,
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error('Mimo API error:', response.status);
            return null;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error('Mimo API fetch error:', err);
        return null;
    }
}

export async function getChatbotResponse(message, history = []) {
    // 1. Tenta keyword matching primeiro (instantâneo)
    const kbAnswer = matchKnowledgeBase(message);
    if (kbAnswer) {
        return kbAnswer;
    }

    // 2. Fallback: chama IA para respostas complexas
    const aiAnswer = await callMimoAPI(message, history);
    if (aiAnswer) {
        return aiAnswer;
    }

    // 3. Fallback final
    return 'Desculpe, não consegui processar sua pergunta. Tente usar palavras como "transação", "agendamento", "cliente", "plano" ou "relatório".';
}

export const SUGGESTIONS = [
    'Como cadastrar um cliente?',
    'Como adicionar uma transação?',
    'Quais são os planos?',
    'Como funciona a agenda?',
    'Como ver relatórios?'
];
