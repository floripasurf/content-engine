export interface CarouselSlideData {
  type: "cover" | "content" | "comparison" | "checklist" | "cta";
  content: string;
  subtext?: string;
  number?: string;
  emoji?: string;
}

export interface CarouselData {
  id: string;
  brand: "chamei" | "squad";
  title: string;
  slides: CarouselSlideData[];
}

// ---------------------------------------------------------------------------
// CHAMEI CAROUSELS
// ---------------------------------------------------------------------------

export const chameiCarousels: CarouselData[] = [
  {
    id: "chamei-01",
    brand: "chamei",
    title: "5 sinais de que o encanador vai te dar dor de cabeca",
    slides: [
      { type: "cover", content: "5 sinais de que o encanador vai te dar dor de cabeca (e como evitar)" },
      { type: "content", number: "01", content: "Nao tem avaliacao de outros clientes", subtext: "Se ninguem avaliou, voce e o cobaia. No Chamei, todo profissional tem nota real." },
      { type: "content", number: "02", content: "Pede pra pagar tudo adiantado", subtext: "Profissional confiavel combina pagamento por etapa. Desconfia se pedir 100% antes." },
      { type: "content", number: "03", content: "Nao manda orcamento por escrito", subtext: "Orcamento de boca e receita pra dor de cabeca. Peca sempre por WhatsApp." },
      { type: "content", number: "04", content: "Da desculpa pra nao mostrar trabalhos anteriores", subtext: "Bom profissional tem portfolio. Peca fotos de servicos feitos." },
      { type: "content", number: "05", content: "Demora mais de 24h pra responder", subtext: "Se ele demora pra responder, imagina pra aparecer no dia." },
      { type: "cta", content: "No Chamei voce ve avaliacao, manda WhatsApp direto e recebe orcamento em minutos. Gratis.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-02",
    brand: "chamei",
    title: "Quanto custa REALMENTE uma reforma de banheiro em 2026?",
    slides: [
      { type: "cover", content: "Quanto custa REALMENTE uma reforma de banheiro em 2026?" },
      { type: "content", number: "\uD83D\uDCB0", content: "Troca de revestimento: R$3.000 a R$8.000", subtext: "Depende do tamanho e material. Porcelanato e 2x mais caro que ceramica." },
      { type: "content", number: "\uD83D\uDEBF", content: "Encanamento novo: R$1.500 a R$4.000", subtext: "Se o cano e antigo (ferro galvanizado), melhor trocar tudo de uma vez." },
      { type: "content", number: "\u26A1", content: "Parte eletrica: R$800 a R$2.500", subtext: "Chuveiro eletrico novo + fiacao dedicada. Nao economize aqui." },
      { type: "content", number: "\uD83E\uDDF1", content: "Mao de obra: R$3.000 a R$7.000", subtext: "O maior custo. Peca NO MINIMO 3 orcamentos antes de fechar." },
      { type: "comparison", content: "Total medio: R$8.000 a R$20.000\n\nDica: quem pede 3 orcamentos economiza em media 30%.", subtext: "vs quem fecha com o primeiro que aparece" },
      { type: "cta", content: "Peca 3 orcamentos gratis em 10 minutos no Chamei.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-03",
    brand: "chamei",
    title: "Checklist: 7 perguntas ANTES de contratar qualquer profissional",
    slides: [
      { type: "cover", content: "7 perguntas pra fazer ANTES de contratar qualquer profissional" },
      { type: "checklist", content: "\u2610 Tem avaliacoes de clientes anteriores?\n\u2610 Pode mandar fotos de trabalhos feitos?\n\u2610 O orcamento e por escrito (WhatsApp conta)?" },
      { type: "checklist", content: "\u2610 Qual o prazo de garantia do servico?\n\u2610 O material esta incluso no preco?\n\u2610 Qual a forma de pagamento?" },
      { type: "checklist", content: "\u2610 Pode dar referencia de um cliente recente?" },
      { type: "content", emoji: "\uD83D\uDCA1", content: "Dica de ouro: peca tudo por WhatsApp", subtext: "Assim voce tem registro de tudo. Se der problema, tem prova." },
      { type: "cta", content: "No Chamei, todas essas perguntas ja estao respondidas no perfil do profissional.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-04",
    brand: "chamei",
    title: "Profissional bom vs profissional ruim",
    slides: [
      { type: "cover", content: "Profissional bom vs profissional ruim — o comparativo visual" },
      { type: "comparison", content: "\u274C Chega atrasado sem avisar\n\u2705 Confirma horario no dia anterior" },
      { type: "comparison", content: "\u274C Orcamento 'mais ou menos uns R$500'\n\u2705 Orcamento detalhado por WhatsApp com prazo" },
      { type: "comparison", content: "\u274C Deixa a sujeira pra voce limpar\n\u2705 Limpa tudo antes de ir embora" },
      { type: "comparison", content: "\u274C Some quando da problema\n\u2705 Da garantia e atende se precisar voltar" },
      { type: "cta", content: "No Chamei, voce escolhe profissional por avaliacao real de outros clientes. Sem surpresa.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-05",
    brand: "chamei",
    title: "Os 10 servicos mais procurados na sua cidade",
    slides: [
      { type: "cover", content: "Os 10 servicos domesticos mais procurados no Chamei" },
      { type: "content", number: "\uD83E\uDD47", content: "1. Eletricista\n2. Encanador\n3. Pintor", subtext: "O trio de ouro. Todo mundo precisa, poucos encontram rapido." },
      { type: "content", number: "\uD83E\uDD48", content: "4. Pedreiro\n5. Diarista\n6. Marceneiro", subtext: "Reforma + limpeza. Os servicos que mais crescem." },
      { type: "content", number: "\uD83E\uDD49", content: "7. Ar condicionado\n8. Jardineiro\n9. Desentupidor\n10. Serralheiro", subtext: "Servicos de emergencia: quando precisa, precisa AGORA." },
      { type: "cta", content: "Encontre qualquer profissional perto de voce em minutos. Gratis.", subtext: "chamei.app — 117 cidades — link na bio" },
    ],
  },
  {
    id: "chamei-06",
    brand: "chamei",
    title: "Como uma dona de casa economizou R$2.400",
    slides: [
      { type: "cover", content: "Como uma dona de casa economizou R$2.400 pedindo 3 orcamentos" },
      { type: "content", number: "\uD83D\uDCCB", content: "Sandra precisava reformar a cozinha", subtext: "Piso novo, pia, torneira e pintura." },
      { type: "content", number: "1\uFE0F\u20E3", content: "Orcamento 1: R$8.400", subtext: "Profissional indicado pela vizinha. Sem avaliacao, sem portfolio." },
      { type: "content", number: "2\uFE0F\u20E3", content: "Orcamento 2: R$7.200", subtext: "Encontrou no Google. 4 estrelas, mas demorou 3 dias pra responder." },
      { type: "content", number: "3\uFE0F\u20E3", content: "Orcamento 3: R$6.000 \u2705", subtext: "Chamei. 4.8 estrelas, 47 avaliacoes. Respondeu em 8 minutos." },
      { type: "cta", content: "Economia de R$2.400 em 10 minutos de pesquisa. Quanto VOCE pode economizar?", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-07",
    brand: "chamei",
    title: "Seus direitos quando o servico da errado",
    slides: [
      { type: "cover", content: "Guia: seus direitos quando o servico domestico da errado" },
      { type: "content", number: "\u2696\uFE0F", content: "Voce tem direito a garantia", subtext: "CDC Art. 26: 90 dias pra servicos. Se deu problema, o profissional tem que voltar." },
      { type: "content", number: "\uD83D\uDCF1", content: "Registre TUDO por WhatsApp", subtext: "Orcamento, prazo, combinados. Conversa por escrito vale como prova." },
      { type: "content", number: "\uD83D\uDEAB", content: "Nao pague tudo adiantado", subtext: "Combine 50% no inicio e 50% na entrega. E seu direito." },
      { type: "content", number: "\uD83D\uDCE2", content: "Se nao resolver: Procon ou Juizado Especial", subtext: "Ate R$20 mil, sem advogado. Leve as provas (WhatsApp, fotos, recibos)." },
      { type: "cta", content: "No Chamei, profissionais com ma avaliacao ficam atras. A reputacao importa.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-08",
    brand: "chamei",
    title: "Por que profissional bom some do Google?",
    slides: [
      { type: "cover", content: "Por que profissional bom some do Google? Porque ele ta no Chamei." },
      { type: "comparison", content: "\u274C No Google voce precisa:\nLigar um por um\nSalvar numero no celular\nMandar WhatsApp manualmente\nTorcer pra alguem responder" },
      { type: "comparison", content: "\u2705 No Chamei:\nBusca por servico + bairro\nVe avaliacoes reais\nManda WhatsApp em 1 toque\nRecebe orcamento em minutos" },
      { type: "content", number: "\uD83C\uDFAF", content: "O profissional bom esta OCUPADO", subtext: "Ele nao tem tempo de ficar aparecendo no Google. Mas ele responde rapido quem chega pelo Chamei." },
      { type: "cta", content: "Pare de ligar pra numero que nao atende. Use o Chamei.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-09",
    brand: "chamei",
    title: "117 cidades — a sua ta aqui?",
    slides: [
      { type: "cover", content: "Mapa: as 117 cidades onde o Chamei ja funciona" },
      { type: "content", number: "\uD83C\uDFD9\uFE0F", content: "Todas as 27 capitais", subtext: "Sao Paulo, Rio, BH, Brasilia, Curitiba, Floripa, Porto Alegre..." },
      { type: "content", number: "\uD83C\uDFD8\uFE0F", content: "+ 90 cidades do interior", subtext: "Campinas, Santos, Joinville, Londrina, Ribeirao Preto, Sao Jose dos Campos..." },
      { type: "content", number: "\uD83D\uDCC8", content: "8.000+ profissionais cadastrados", subtext: "E crescendo todo dia. Mais profissionais = mais opcoes pra voce." },
      { type: "content", number: "\uD83C\uDD93", content: "100% gratis pra quem procura", subtext: "Sem taxa, sem cadastro obrigatorio. Busca, compara e chama no WhatsApp." },
      { type: "cta", content: "Sua cidade ja tem Chamei. Confira.", subtext: "chamei.app — link na bio" },
    ],
  },
  {
    id: "chamei-10",
    brand: "chamei",
    title: "De autonomo a 47 clientes por mes",
    slides: [
      { type: "cover", content: "De eletricista autonomo a 47 clientes/mes: a historia do Carlos" },
      { type: "content", number: "\uD83D\uDE30", content: "Antes do Chamei: 8-10 clientes por mes", subtext: "Tudo por indicacao. Meses bons e meses ruins. Zero previsibilidade." },
      { type: "content", number: "\uD83D\uDCF2", content: "Cadastrou no Chamei em marco", subtext: "Preencheu perfil, adicionou fotos dos trabalhos, pediu avaliacao pros ultimos clientes." },
      { type: "content", number: "\uD83D\uDCCA", content: "3 meses depois: 47 clientes/mes", subtext: "4.9 estrelas, 89 avaliacoes. Agenda cheia. Comecou a escolher os servicos." },
      { type: "content", number: "\uD83D\uDCB0", content: "Faturamento: +380% sem gastar 1 real", subtext: "Sem anuncio, sem mensalidade. So perfil completo e bom atendimento." },
      { type: "cta", content: "E profissional? Cadastre-se gratis no Chamei.", subtext: "chamei.app/para-profissionais — link na bio" },
    ],
  },
];

// ---------------------------------------------------------------------------
// SQUAD CAROUSELS
// ---------------------------------------------------------------------------

export const squadCarousels: CarouselData[] = [
  {
    id: "squad-01",
    brand: "squad",
    title: "Sua empresa ainda usa planilha pra avaliacao?",
    slides: [
      { type: "cover", content: "Sua empresa ainda usa planilha pra avaliacao de desempenho?" },
      { type: "content", number: "01", content: "73% das PMEs brasileiras avaliam por planilha", subtext: "E 68% dessas planilhas nunca sao preenchidas por completo." },
      { type: "content", number: "02", content: "O gestor perde 4h montando formulario", subtext: "Copia do ano passado, ajusta nomes, manda por email. Ninguem responde." },
      { type: "content", number: "03", content: "Sem historico, sem comparativo", subtext: "Quando chega a hora de promover ou demitir, nao tem dado nenhum." },
      { type: "comparison", content: "\u274C Planilha: manual, demorada, sem insight\n\u2705 Squad: automatica, rapida, com dashboard" },
      { type: "cta", content: "Troque a planilha por um sistema que funciona. Teste gratis por 14 dias.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-02",
    brand: "squad",
    title: "Avaliacao de desempenho em 2026: o que mudou",
    slides: [
      { type: "cover", content: "Avaliacao de desempenho em 2026: o que mudou (e o que nao funciona mais)" },
      { type: "content", number: "01", content: "Avaliacao anual morreu", subtext: "Empresas de alta performance fazem ciclos trimestrais ou continuos." },
      { type: "content", number: "02", content: "Feedback em tempo real virou padrao", subtext: "Esperar 12 meses pra dizer que alguem precisa melhorar e absurdo." },
      { type: "content", number: "03", content: "Autoavaliacao + avaliacao 360", subtext: "O gestor nao e o unico que avalia. Pares, liderados e o proprio colaborador participam." },
      { type: "content", number: "04", content: "Dados, nao achismo", subtext: "Decisao de promocao baseada em historico de performance, nao em 'feeling'." },
      { type: "cta", content: "Squad ja faz tudo isso. Simples, em portugues, feito pra PME.", subtext: "squadperformance.com — teste gratis" },
    ],
  },
  {
    id: "squad-03",
    brand: "squad",
    title: "Como montar um ciclo de avaliacao em 4 passos",
    slides: [
      { type: "cover", content: "Como montar um ciclo de avaliacao de desempenho em 4 passos" },
      { type: "content", number: "01", content: "Defina as competencias", subtext: "Escolha 5-7 competencias relevantes pro seu negocio. Menos e mais." },
      { type: "content", number: "02", content: "Monte o formulario", subtext: "Escala de 1-5 + campo aberto pra comentario. Simples, objetivo." },
      { type: "content", number: "03", content: "Defina quem avalia quem", subtext: "Gestor avalia liderado. Opcional: autoavaliacao e avaliacao de pares." },
      { type: "content", number: "04", content: "Rode o ciclo e acompanhe", subtext: "Envie, cobre respostas, consolide resultados. Faca a reuniao de feedback." },
      { type: "cta", content: "No Squad, esses 4 passos levam 15 minutos pra configurar. O sistema faz o resto.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-04",
    brand: "squad",
    title: "Squad vs Qulture vs Feedz: comparativo pra PMEs",
    slides: [
      { type: "cover", content: "Squad vs Qulture.Rocks vs Feedz: qual e melhor pra PME?" },
      { type: "comparison", content: "\u274C Qulture.Rocks: a partir de R$15/usuario\n\u2705 Squad: plano gratis ate 15 pessoas" },
      { type: "comparison", content: "\u274C Feedz: setup complexo, precisa de consultoria\n\u2705 Squad: configura sozinho em 15 minutos" },
      { type: "comparison", content: "\u274C Ambos: feitos pra enterprise, adaptados pra PME\n\u2705 Squad: nasceu pra PME brasileira" },
      { type: "content", number: "\uD83C\uDFAF", content: "O que importa pra PME", subtext: "Preco justo, setup rapido, interface simples, suporte em portugues." },
      { type: "cta", content: "Teste gratis. Sem cartao. Sem vendedor.", subtext: "squadperformance.com" },
    ],
  },
  {
    id: "squad-05",
    brand: "squad",
    title: "O custo de NAO ter avaliacao (com numeros)",
    slides: [
      { type: "cover", content: "O custo de NAO ter avaliacao de desempenho (com numeros reais)" },
      { type: "content", number: "\uD83D\uDCB8", content: "Custo de turnover: 50-200% do salario anual", subtext: "Funcionario que sai custa caro. Recrutamento, treinamento, produtividade perdida." },
      { type: "content", number: "\uD83D\uDCC9", content: "Sem feedback, engajamento cai 40%", subtext: "Gallup: funcionarios que nao recebem feedback sao 4x mais propensos a desengajar." },
      { type: "content", number: "\uD83D\uDE36", content: "67% pedem demissao por falta de reconhecimento", subtext: "Nao e so salario. E saber que alguem ve o trabalho que voce faz." },
      { type: "content", number: "\uD83D\uDCC6", content: "Exemplo: empresa de 30 pessoas", subtext: "3 demissoes/ano evitaveis = R$90.000+ em custos. Avaliacao custa R$0 no Squad." },
      { type: "cta", content: "Quanto sua empresa perde por nao avaliar? Calcule gratis.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-06",
    brand: "squad",
    title: "5 templates prontos de feedback",
    slides: [
      { type: "cover", content: "5 templates prontos de feedback que voce pode usar hoje" },
      { type: "content", number: "01", content: "Feedback positivo de reforco", subtext: "'[Nome], quero reconhecer [acao especifica]. Isso impactou [resultado]. Continue assim.'" },
      { type: "content", number: "02", content: "Feedback corretivo construtivo", subtext: "'Percebi que [situacao]. O impacto foi [consequencia]. Sugiro que [acao]. Posso ajudar?'" },
      { type: "content", number: "03", content: "Feedback de desenvolvimento", subtext: "'Voce tem potencial em [area]. Pra crescer, sugiro focar em [competencia]. Vamos montar um plano?'" },
      { type: "content", number: "04", content: "Feedback pra equipe", subtext: "'Time, o resultado de [periodo] foi [dado]. O que funcionou: [X]. O que melhorar: [Y].'" },
      { type: "content", number: "05", content: "Feedback de reconhecimento publico", subtext: "'Quero destacar o trabalho do [nome] em [projeto]. [Resultado concreto]. Parabens!'" },
      { type: "cta", content: "No Squad, esses templates ja vem prontos. E pra copiar, colar e enviar.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-07",
    brand: "squad",
    title: "Case: empresa de 35 pessoas reduziu turnover 40%",
    slides: [
      { type: "cover", content: "Case real: como uma empresa de 35 pessoas reduziu turnover em 40%" },
      { type: "content", number: "\uD83D\uDE30", content: "O problema: 8 demissoes em 12 meses", subtext: "Agencia de marketing. Crescendo rapido, mas perdendo gente mais rapido." },
      { type: "content", number: "\uD83D\uDD0D", content: "O diagnostico: zero feedback estruturado", subtext: "Ninguem sabia como estava performando. Promocoes eram por 'feeling' do dono." },
      { type: "content", number: "\uD83D\uDEE0\uFE0F", content: "A solucao: Squad + ciclos trimestrais", subtext: "Implementaram em 1 dia. Primeiro ciclo rodou em 2 semanas." },
      { type: "content", number: "\uD83D\uDCC8", content: "Resultado: turnover caiu de 23% pra 14%", subtext: "6 meses depois. Engajamento subiu. 2 promocoes internas (antes nunca tinham feito)." },
      { type: "cta", content: "Sua empresa pode ter o mesmo resultado. Comece gratis.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-08",
    brand: "squad",
    title: "7 erros que RH de PME comete",
    slides: [
      { type: "cover", content: "7 erros que todo RH de PME comete em avaliacao de desempenho" },
      { type: "checklist", content: "\u274C Avaliar so uma vez por ano\n\u274C Usar a mesma planilha de 2019\n\u274C Nao treinar gestores pra dar feedback" },
      { type: "checklist", content: "\u274C Fazer avaliacao sem definir competencias\n\u274C Nao dar devolutiva pro colaborador\n\u274C Ignorar autoavaliacao" },
      { type: "checklist", content: "\u274C Nao usar os dados pra decisao (promocao, demissao, treinamento)" },
      { type: "content", number: "\uD83D\uDCA1", content: "O erro mais comum: fazer avaliacao e nao fazer nada com o resultado", subtext: "Avaliacao sem acao e burocracia. Avaliacao com acao e gestao." },
      { type: "cta", content: "Squad transforma avaliacao em acao. Dashboards, planos de desenvolvimento, acompanhamento.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-09",
    brand: "squad",
    title: "OKR, KPI, competencia — qual modelo usar?",
    slides: [
      { type: "cover", content: "OKR, KPI ou competencia: qual modelo de avaliacao usar na sua PME?" },
      { type: "content", number: "\uD83C\uDFAF", content: "OKR (Objectives & Key Results)", subtext: "Melhor pra: empresas com metas claras e ciclos curtos. Google, Intel usam. Bom pra startups." },
      { type: "content", number: "\uD83D\uDCCA", content: "KPI (Key Performance Indicators)", subtext: "Melhor pra: areas com metricas claras (vendas, suporte, producao). Facil de medir." },
      { type: "content", number: "\uD83E\uDDE0", content: "Competencias (comportamental)", subtext: "Melhor pra: avaliar soft skills, cultura, lideranca. Essencial pra cargos de gestao." },
      { type: "content", number: "\u2705", content: "A resposta certa: combine 2 modelos", subtext: "KPI ou OKR pra resultado + competencias pra comportamento. Squad suporta os 3." },
      { type: "cta", content: "Configure o modelo ideal pra sua empresa em 15 minutos.", subtext: "squadperformance.com — link na bio" },
    ],
  },
  {
    id: "squad-10",
    brand: "squad",
    title: "Por que avaliacao anual morreu",
    slides: [
      { type: "cover", content: "Por que avaliacao anual morreu (e o que fazer no lugar)" },
      { type: "content", number: "01", content: "Em 12 meses, tudo muda", subtext: "Metas de janeiro nao fazem sentido em outubro. O mercado muda, a equipe muda." },
      { type: "content", number: "02", content: "Vies de recencia domina", subtext: "O gestor so lembra dos ultimos 2 meses. 10 meses de trabalho jogados fora." },
      { type: "content", number: "03", content: "Funcionario so descobre o problema em dezembro", subtext: "Podia ter corrigido em marco. Agora e tarde. Vai embora em janeiro." },
      { type: "comparison", content: "\u274C Anual: 1 feedback por ano, atrasado, inutil\n\u2705 Continuo: feedback toda semana, em tempo real, com acao" },
      { type: "cta", content: "Squad faz avaliacao continua. Simples, rapida, com resultado.", subtext: "squadperformance.com — teste gratis 14 dias" },
    ],
  },
];

// ---------------------------------------------------------------------------
// ALL CAROUSELS
// ---------------------------------------------------------------------------

export const allCarousels: CarouselData[] = [
  ...chameiCarousels,
  ...squadCarousels,
];

// ---------------------------------------------------------------------------
// BRAND CONFIGS (for rendering)
// ---------------------------------------------------------------------------

export const brandConfigs: Record<string, {
  brandName: string;
  brandEmoji: string;
  accentColor: string;
  secondaryColor: string;
}> = {
  chamei: {
    brandName: "Chamei",
    brandEmoji: "\uD83D\uDCDE",
    accentColor: "#2563EB",
    secondaryColor: "#1E40AF",
  },
  squad: {
    brandName: "Squad Performance",
    brandEmoji: "\uD83C\uDFAF",
    accentColor: "#1B3A6B",
    secondaryColor: "#2563EB",
  },
};
