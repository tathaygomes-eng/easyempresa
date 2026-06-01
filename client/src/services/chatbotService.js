const KNOWLEDGE_BASE = [
    {
        keywords: ['o que', 'easyempresa', 'sobre', 'aplicativo', 'app', 'servico'],
        answer: 'O EasyEmpresa e um aplicativo de gestao empresarial para pequenos negocios! Voce pode controlar financeiro, agendar reunioes, gerenciar clientes e acompanhar relatorios, tudo em um so lugar.'
    },
    {
        keywords: ['dashboard', 'painel', 'inicio', 'tela inicial', 'saldo', 'cards'],
        answer: 'O Dashboard mostra um resumo do seu negocio: saldo total, receitas e despesas do mes, proximos agendamentos e transacoes recentes. Os cards coloridos mostram indicadores importantes.'
    },
    {
        keywords: ['transacao', 'transacoes', 'financeiro', 'dinheiro', 'receita', 'despesa', 'lancamento'],
        answer: 'Para adicionar uma transacao, va em Financeiro > Transacoes e clique no botao "+ Nova Transacao". Preencha o tipo (receita ou despesa), descricao, valor e data. Voce tambem pode categorizar cada lancamento.'
    },
    {
        keywords: ['relatorio', 'relatorios', 'grafico', 'graficos', 'analise'],
        answer: 'Os Relatorios ficam em Financeiro > Relatorios. La voce ve graficos de receitas vs despesas, evolucao mensal e resumo por categorias. Selecione o periodo desejado para filtrar.'
    },
    {
        keywords: ['fluxo', 'caixa', 'fluxo de caixa', 'saldo'],
        answer: 'O Fluxo de Caixa em Financeiro > Fluxo de Caixa mostra a entrada e saida de dinheiro ao longo do tempo, com cards de resumo e grafico de evolucao.'
    },
    {
        keywords: ['categoria', 'categorias', 'tipo'],
        answer: 'As categorias organizam suas transacoes. Va em Financeiro > Categorias para criar, editar ou excluir categorias de receita e despesa. Cada uma pode ter uma cor e icone.'
    },
    {
        keywords: ['agendar', 'agendamento', 'agendamentos', 'reuniao', 'reunião', 'marcar', 'horario', 'agenda'],
        answer: 'Para agendar, va em Agenda > Calendario. Clique no dia desejado ou no botao "+ Novo". Preencha titulo, data/hora, local e escolha o cliente. Ative o lembrete para receber notificacao antes do horario!'
    },
    {
        keywords: ['cliente', 'clientes', 'cadastro', 'contato'],
        answer: 'Para gerenciar clientes, va em Agenda > Clientes. Voce pode cadastrar nome, email, telefone, CPF/CNPJ e observacoes. Ao criar transacoes ou agendamentos, associe ao cliente correspondente.'
    },
    {
        keywords: ['detalhes', 'historico', 'interacao'],
        answer: 'Clique em um cliente na lista para ver os detalhes completos: dados cadastrais, historico de transacoes e interacoes. Voce tambem pode adicionar novas interacoes la.'
    },
    {
        keywords: ['plano', 'planos', 'preco', 'preço', 'valor', 'gratis', 'gratuito', 'basico', 'premium', 'upgrade', 'assinatura'],
        answer: 'Temos 3 planos:\n\n- Gratuito: Funcionalidades basicas com limites\n- Basico (R$ 9,90/mes): Mais agendamentos e transacoes\n- Premium (R$ 49,90/mes): Sem limites + suporte prioritario\n\nVa em Planos para ver todos os detalhes e fazer upgrade!'
    },
    {
        keywords: ['configuracao', 'configuracoes', 'config', 'ajustes', 'settings'],
        answer: 'Em Configuracoes voce pode: alterar foto de perfil, editar dados pessoais, configurar dados da empresa, mudar a senha e personalizar a cor do tema.'
    },
    {
        keywords: ['foto', 'avatar', 'perfil', 'imagem'],
        answer: 'Para mudar sua foto, va em Configuracoes > Foto de Perfil. Clique na foto (ou no espaco vazio) e selecione uma imagem. A foto e salva automaticamente.'
    },
    {
        keywords: ['senha', 'password', 'trocar senha', 'alterar senha', 'mudar senha'],
        answer: 'Para alterar a senha, va em Configuracoes > Alterar Senha. Digite a nova senha e confirme. Precisa ter pelo menos 6 caracteres.'
    },
    {
        keywords: ['empresa', 'nome da empresa', 'ramo', 'negocio'],
        answer: 'Para configurar os dados da empresa, va em Configuracoes > Empresa. La voce define o nome da empresa, ramo de atividade e logo. Essas informacoes aparecem nos relatorios.'
    },
    {
        keywords: ['tema', 'cor', 'cores', 'personalizar', 'aparencia'],
        answer: 'Para mudar a cor do tema, va em Configuracoes > Cor do Tema. Escolha a cor que preferir e clique em salvar. A mudanca e aplicada imediatamente em todo o app.'
    },
    {
        keywords: ['notificacao', 'notificacoes', 'lembrete', 'lembretes', 'alerta'],
        answer: 'Ao criar um agendamento, ative a opcao "Lembrete" e escolha quantos minutos antes quer ser notificado. A notificacao aparece mesmo com o app em background!'
    },
    {
        keywords: ['celular', 'mobile', 'android', 'apk', 'download'],
        answer: 'O EasyEmpresa funciona tanto no computador (pelo navegador) quanto no celular (app Android). Baixe o APK e instale no seu celular para ter acesso rapido!'
    },
    {
        keywords: ['logout', 'sair', 'deslogar', 'encerrar sessao'],
        answer: 'Para sair da conta, clique no botao "Sair" no menu lateral (desktop) ou no final da barra de navegacao lateral.'
    },
    {
        keywords: ['problema', 'erro', 'nao funciona', 'bug', 'ajuda', 'suporte'],
        answer: 'Se voce esta com problemas, tente: 1) Atualizar a pagina, 2) Verificar sua conexao com a internet, 3) Sair e entrar novamente. Se persistir, entre em contato com o suporte.'
    },
    {
        keywords: ['como usar', 'tutorial', 'guia', 'comecar', 'iniciar', 'primeiro'],
        answer: 'Para comecar com o EasyEmpresa:\n\n1. Configure sua empresa em Configuracoes\n2. Cadastre seus clientes em Agenda > Clientes\n3. Comece a lancar transacoes em Financeiro\n4. Agende reunioes em Agenda > Calendario\n5. Acompanhe tudo pelo Dashboard!'
    },
];

export function getChatbotResponse(message) {
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

    if (bestMatch && bestScore > 0) {
        return bestMatch.answer;
    }

    return 'Desculpe, nao entendi sua pergunta. Tente usar palavras como "transacao", "agendamento", "cliente", "plano" ou "configuracao". Ou descreva o que precisa de outra forma!';
}

export const SUGGESTIONS = [
    'Como usar o app?',
    'Quais sao os planos?',
    'Como agendar?',
    'Como adicionar transacao?',
];
