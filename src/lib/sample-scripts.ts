import { Script } from "./types";

// High-quality sample scripts for prototype — viral-worthy, funny, well-structured
export const sampleScripts: Omit<Script, "id" | "createdAt" | "updatedAt">[] = [
  // ===================== CHAMEI =====================
  // Chamei × DOR
  {
    brandId: "brand_chamei",
    pillarId: "pillar_dor",
    templateId: "tmpl_pov_frustracao",
    title: "POV: Orçamento no GetNinjas",
    hook: 'POV: você pediu orçamento no GetNinjas',
    body: `[TEXTO NA TELA: "Dia 1: pedi orçamento pra um encanador"]
[Pessoa animada olhando o celular]

[TEXTO NA TELA: "Dia 3..."]
[Pessoa olhando o celular, nada]

[TEXTO NA TELA: "Dia 7..."]
[Pessoa com teia de aranha no celular, envelheceu 30 anos]

[TEXTO NA TELA: "Enquanto isso no Chamei..."]
[CORTE rápido]
[WhatsApp tocando sem parar]
[TEXTO NA TELA: "5 orçamentos em 10 minutos"]
[Pessoa dançando com o celular]

[TEXTO NA TELA: "E o melhor? R$0"]`,
    visualNotes: "Começar com expressão esperançosa. Envelhecimento gradual com filtros. Corte seco pro WhatsApp. Música que muda de triste pra animada no corte. Formato split screen no final.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_chamei",
    pillarId: "pillar_dor",
    templateId: "tmpl_tipos",
    title: "5 Tipos de Profissional que Todo Mundo Já Pegou",
    hook: "5 tipos de profissional de serviço que você COM CERTEZA já pegou",
    body: `[TEXTO NA TELA: "Tipo 1: O Fantasma 👻"]
Aceita o serviço, marca o dia, e some. Ligou? Não atende. WhatsApp? Visualizou.

[TEXTO NA TELA: "Tipo 2: O Orçamento Surpresa 💸"]
"Vai ficar uns R$200." Na hora de pagar: "Ah, com material ficou R$900."

[TEXTO NA TELA: "Tipo 3: O Gambiarra Master 🔧"]
Resolve com fita isolante e um "confia". Dois dias depois vazou de novo.

[TEXTO NA TELA: "Tipo 4: O Coach do Serviço 🗣️"]
Não trabalha, mas te dá conselho por 40 minutos sobre como a torneira funciona.

[TEXTO NA TELA: "Tipo 5: O Profissional do Chamei ✅"]
Responde na hora, dá orçamento real, aparece no dia combinado.

[TEXTO NA TELA: "Qual você já pegou? 👇"]`,
    visualNotes: "Transição rápida entre tipos com som de notificação. Cada tipo tem uma atuação exagerada. O tipo 5 entra com brilho e música épica. Usar cores do Chamei no tipo 5.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_chamei",
    pillarId: "pillar_solucao",
    templateId: "tmpl_3_passos",
    title: "Como Achar Profissional em 3 Passos",
    hook: "Como encontrar um profissional confiável em 3 passos (sem gastar nada)",
    body: `[TEXTO NA TELA: "Passo 1"]
Abre o Chamei no WhatsApp. Sim, é pelo WhatsApp. Sem baixar app nenhum.

[TEXTO NA TELA: "Passo 2"]
Fala o que você precisa. "Preciso de um eletricista pra trocar chuveiro."

[TEXTO NA TELA: "Passo 3"]
Recebe até 5 orçamentos de profissionais da sua região. Em 10 minutos.

[CORTE para tela do WhatsApp com orçamentos chegando]

[TEXTO NA TELA: "Quanto custa?"]
[Pausa dramática]
[TEXTO NA TELA: "R$0. De graça. Grátis. Free. Zero. Nada."]

[Pessoa chocada]`,
    visualNotes: "Estilo tutorial clean. Cada passo com animação de número grande. No final, zoom dramático na palavra GRÁTIS. Expressão de choque genuíno. Fundo azul Chamei.",
    voiceoverText: "Cansou de ficar ligando pra profissional que não atende? Em 3 passos você resolve.",
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_chamei",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_numero_pessoas",
    title: "+8.000 Profissionais Já Estão no Chamei",
    hook: "+8.000 profissionais já estão recebendo clientes pelo Chamei",
    body: `[TEXTO NA TELA: "+8.000 profissionais"]
[Número crescendo com animação]

[TEXTO NA TELA: "117 cidades"]
[Mapa do Brasil com pontos acendendo]

[TEXTO NA TELA: "Eletricistas, encanadores, pintores, diaristas..."]
[Montagem rápida de profissionais trabalhando]

[TEXTO NA TELA: "Todos recebendo clientes pelo WhatsApp. Grátis."]

[CORTE para print de WhatsApp]
"Oi, vi seu perfil no Chamei. Preciso de um orçamento."
"Oi, consegue vir amanhã?"
"Quanto cobra pra pintar uma sala?"

[TEXTO NA TELA: "E você? Ainda esperando indicação?"]`,
    visualNotes: "Números com animação de contador rápido. Mapa do Brasil estilizado com pontos luminosos. Prints reais de WhatsApp (ou mockup). Trilha sonora motivacional crescendo. Fechar com logo Chamei.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // ===================== DELAS CLUB =====================
  {
    brandId: "brand_delas",
    pillarId: "pillar_dor",
    templateId: "tmpl_pov_frustracao",
    title: "POV: Manicure do Instagram",
    hook: "POV: você agendou uma manicure que achou no Instagram",
    body: `[TEXTO NA TELA: "O perfil dela:"]
[Print de feed lindo, unhas perfeitas, 10k seguidores]

[TEXTO NA TELA: "A realidade:"]
[Unha toda torta, cutícula sangrando]

[Pessoa olhando pra mão em choque]
[TEXTO NA TELA: "Casamento é em 3 dias"]
[Pessoa começando a chorar]

[CORTE SECO]
[TEXTO NA TELA: "Na Delas Club..."]
[Print do perfil com avaliações de outras mulheres]
[TEXTO NA TELA: "Profissional indicada por 47 mulheres"]
[Unha perfeita]
[Pessoa feliz]

[TEXTO NA TELA: "Indicação de amiga > feed bonito"]`,
    visualNotes: "Split screen Instagram vs realidade. Emoção real no rosto. Corte seco com mudança de música (drama pra empoderamento). Cores rosa da Delas. Usar prints mockados do app.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_delas",
    pillarId: "pillar_dor",
    templateId: "tmpl_red_flags",
    title: "Red Flags da Esteticista",
    hook: "Red flags da esteticista que você deveria ter visto 🚩",
    body: `[TEXTO NA TELA: "Red flag 1 🚩"]
"O preço? A gente vê depois." — Depois: R$350 por uma sobrancelha.

[TEXTO NA TELA: "Red flag 2 🚩"]
Não mostra foto de ANTES. Só o depois com filtro. Irmã, cadê a prova?

[TEXTO NA TELA: "Red flag 3 🚩"]
"Eu aprendi no YouTube." Moça, a minha cara não é tutorial.

[TEXTO NA TELA: "Red flag 4 🚩"]
Não tem avaliação de NINGUÉM. Você vai ser o cobaia.

[TEXTO NA TELA: "Na Delas Club cada profissional tem avaliações de mulheres REAIS 💅"]
[Print de avaliações]
[TEXTO NA TELA: "Porque sua cara merece mais que um 'confia'"]`,
    visualNotes: "Cada red flag com emoji de bandeira animado. Humor feminino, expressões exageradas. Usar trending audio de 'red flag'. Encerrar com cores Delas e tom empoderado.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_delas",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_depoimento",
    title: "A Carla e o Casamento",
    hook: "A Carla tinha o casamento em 3 dias e ZERO manicure",
    body: `[TEXTO NA TELA: "A história da Carla"]
Casamento em 3 dias. A manicure cancelou.

[Carla no telefone, desesperada]
Ligou pra 5 manicures. Nenhuma tinha horário.

[TEXTO NA TELA: "Até que uma amiga mandou o link da Delas Club"]
[Print do WhatsApp: "usa esse app, confia"]

[Carla no app, rolando perfis]
[TEXTO NA TELA: "Ana — Manicure — 4.9 ⭐ — 47 avaliações"]

[TEXTO NA TELA: "Encaixou no mesmo dia"]

[Foto da unha perfeita no casamento]
[TEXTO NA TELA: "'Melhor unha da minha vida' — Carla"]

[TEXTO NA TELA: "Indicação de mulher pra mulher. Delas Club 💅"]`,
    visualNotes: "Storytelling emocional. Começar tenso, resolver com alívio. Fotos reais (ou mockup convincente). Música que vai de tensa pra emocionante. Fechar com logo e emojis.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // ===================== SONINHO =====================
  {
    brandId: "brand_soninho",
    pillarId: "pillar_dor",
    templateId: "tmpl_expectativa_realidade",
    title: "Expectativa vs Realidade: Hora de Dormir",
    hook: "Hora de dormir: Expectativa vs Realidade",
    body: `[TEXTO NA TELA: "Expectativa"]
[Criança deitando na cama, sorrindo, dormindo em 5 minutos]
[Pais no sofá tomando vinho]

[TEXTO NA TELA: "Realidade"]
[Criança: "água", "xixi", "medo do escuro", "conta outra história"]
[40 minutos depois, pais dormindo no chão do quarto]

[TEXTO NA TELA: "Mais uma?"]
[Criança: "SIM"]
[Pai morrendo por dentro]

[CORTE SECO]
[TEXTO NA TELA: "Com o Soninho..."]
[Criança ouvindo história calminha no app]
[10 minutos depois: dormindo]
[Pais no sofá, EM PAZ]

[TEXTO NA TELA: "Rotina de sono sem drama 🌙"]`,
    visualNotes: "Humor de pai/mãe cansado. Expressões de desespero. A parte do Soninho tem iluminação quente, acolhedora. Música calm lo-fi no final. Cores roxas suaves.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_soninho",
    pillarId: "pillar_solucao",
    templateId: "tmpl_descobri",
    title: "Descobri Como Fazer Meu Filho Dormir",
    hook: "Eu descobri como fazer meu filho dormir em 15 minutos (sem briga)",
    body: `[Pai/mãe exausto na câmera]
"Gente, eu preciso contar isso."

"Meu filho de 4 anos levava 1 HORA pra dormir toda noite."
"Era negociação, chantagem, drama, choro — e isso era só EU."

[TEXTO NA TELA: "Até que descobri o Soninho"]
"É um app que conta histórias adaptadas pro ritmo do dia."

"Se ele teve um dia agitado, a história é mais calm."
"Se tá tranquilo, já vai direto pra soninho."

[TEXTO NA TELA: "Resultado:"]
"15 minutos. Dormindo. TODA NOITE."

[Vídeo da criança dormindo tranquila]
[Pai/mãe fazendo sinal de vitória em silêncio]

[TEXTO NA TELA: "Soninho — Rotina de sono sem briga 🌙"]`,
    visualNotes: "Formato talking head autêntico. Iluminação de noite (quente, baixa). Expressões reais de cansaço → alívio. Vídeo da criança dormindo (wholesome). Fechar com humor (pai dançando em silêncio).",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_soninho",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_antes_agora",
    title: "Antes e Depois do Soninho",
    hook: "Antes eu chorava junto. Agora eu assisto série.",
    body: `[TEXTO NA TELA: "Antes do Soninho"]
[Montagem rápida:]
- Criança pulando na cama às 22h
- Pai contando a 5a história
- Mãe dormindo no chão do quarto
- Relógio: 23:30, criança ACORDADA

[TEXTO NA TELA: "Depois do Soninho"]
[Montagem:]
- Criança ouvindo historinha no app
- 15 minutos: dormindo profundamente
- Pais no sofá assistindo série
- Relógio: 20:30, PAZ

[TEXTO NA TELA: "O que mudou?"]
[Tela do app Soninho]
"Histórias que realmente fazem dormir."
"Não é YouTube Kids. É ciência + carinho."

[TEXTO NA TELA: "Seus filhos dormem. Você vive. 🌙"]`,
    visualNotes: "Antes: câmera caótica, luz fria, expressões de desespero. Depois: câmera estável, luz quente, paz. Contraste forte. Trilha que muda de caos pra lo-fi. Cores Soninho no final.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // ===================== SIMPLIFICA =====================
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_dor",
    templateId: "tmpl_pov_frustracao",
    title: "POV: Avó Tentando Pagar Conta Online",
    hook: "POV: sua avó tentando pagar uma conta pelo app do banco",
    body: `[Avó no celular, confusa]
[TEXTO NA TELA: "Passo 1: Abra o app"]
[Avó: "Qual app? Tenho 47 aqui"]

[TEXTO NA TELA: "Passo 2: Faça login"]
[Avó: "Qual senha? A do CPF ou a do cartão?"]
[Erro: "Senha incorreta. Conta bloqueada."]
[Avó: olha pra câmera, desolada]

[TEXTO NA TELA: "Passo 3: Escaneie o código de barras"]
[Avó tirando foto da tela com OUTRO celular]

[CORTE]
[TEXTO NA TELA: "Com o SimplificaApp"]
[Interface gigante, botão enorme: "PAGAR CONTA"]
[Avó sorrindo: "Até que enfim!"]

[TEXTO NA TELA: "Tecnologia que respeita quem a gente ama 👴💚"]`,
    visualNotes: "Humor wholesome, nunca desrespeitoso. Avó simpática. Interface do banco vs SimplificaApp (contraste gritante). Música fofa. Emoção no final. Muito potencial de compartilhamento por filhos/netos.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_solucao",
    templateId: "tmpl_app_resolve",
    title: "O App Que Seu Avô Merecia",
    hook: "Existe um app que transforma QUALQUER site num site que seu avô consegue usar",
    body: `[TEXTO NA TELA: "Site do governo hoje:"]
[Tela com menu infinito, fonte tamanho 8, botão escondido]

[TEXTO NA TELA: "Mesmo site com SimplificaApp:"]
[Tela limpa, fonte enorme, 3 botões claros]

[TEXTO NA TELA: "App do banco hoje:"]
[15 opções na tela, popup de segurança, autenticação dupla]

[TEXTO NA TELA: "Mesmo app com SimplificaApp:"]
[3 opções: "Ver saldo", "Pagar conta", "Ligar pro banco"]

[Pessoa idosa usando com facilidade]
[Sorrindo]

[TEXTO NA TELA: "Ninguém deveria ser excluído por ser menos digital"]
[TEXTO NA TELA: "SimplificaApp — Internet pra todo mundo 👴💚"]`,
    visualNotes: "Side by side comparison. Exagerar a complexidade dos sites reais. O SimplificaApp mostra interface extremamente limpa. Close no rosto do idoso sorrindo (emoção). Pode viralizar por empatia.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_depoimento",
    title: "A Dona Maria Voltou a Ser Independente",
    hook: "Dona Maria tinha vergonha de pedir ajuda pro neto toda vez",
    body: `[TEXTO NA TELA: "Dona Maria, 73 anos"]
"Toda vez que eu precisava pagar uma conta, tinha que ligar pro meu neto."
"Eu me sentia... inútil."

[TEXTO NA TELA: "O neto instalou o SimplificaApp"]
"Ele colocou um negócio no meu celular que mudou tudo."

[Dona Maria mostrando o celular]
"Olha, é tudo grandão. Eu consigo ler. Eu consigo apertar."

[Ela pagando uma conta sozinha]
[Sorriso enorme]
"Hoje eu pago minhas contas sozinha."

[TEXTO NA TELA: "Fez ela chorar 🥲"]
[Dona Maria: "Eu me sinto útil de novo."]

[TEXTO NA TELA: "SimplificaApp — Dignidade digital pra quem a gente ama"]`,
    visualNotes: "Depoimento real/documental. Câmera próxima, íntima. Luz natural. SEM filtro. A emoção vende sozinha. Print de avó no WhatsApp agradecendo o neto (emoção máxima). Potencial viral ENORME por empatia.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },

  // Chamei × DOR (3rd)
  {
    brandId: "brand_chamei",
    pillarId: "pillar_dor",
    templateId: "tmpl_red_flags",
    title: "Red Flags do Profissional Picareta",
    hook: "Red flags de que o profissional vai te dar dor de cabeca 🚩",
    body: `[TEXTO NA TELA: "Red flag 1 🚩"]
"Cobro baratinho." Baratinho = vai fazer mal feito e sumir.

[TEXTO NA TELA: "Red flag 2 🚩"]
Nao tem foto de trabalho anterior. Nem uma. Zero portfólio.

[TEXTO NA TELA: "Red flag 3 🚩"]
"Material fica por sua conta." Chega no dia: "ah, vai precisar de mais coisa."

[TEXTO NA TELA: "Red flag 4 🚩"]
Nao da nota fiscal. Nao da recibo. Nao da garantia.

[TEXTO NA TELA: "No Chamei:"]
Profissionais com avaliacao, portfolio e orcamento por escrito.
Pelo WhatsApp. De graca.

[TEXTO NA TELA: "Sem surpresa. Sem dor de cabeca. 📞"]`,
    visualNotes: "Cada red flag com som de buzina/alerta. Humor exagerado. Corte final com azul do Chamei. Formato lista que gera comentarios.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // Chamei × SOLUCAO (2nd and 3rd)
  {
    brandId: "brand_chamei",
    pillarId: "pillar_solucao",
    templateId: "tmpl_before_after",
    title: "Antes vs Depois do Chamei",
    hook: "Antes vs Depois de conhecer o Chamei",
    body: `[TEXTO NA TELA: "ANTES"]
[Pessoa no telefone, ligando]
"Alo, voce faz instalacao de chuveiro?"
"Nao trabalho com isso."
[Ligando de novo]
"Alo, preciso de um eletricista..."
"So semana que vem."
[3a ligacao]
Caixa postal.

[TEXTO NA TELA: "DEPOIS"]
[Pessoa no WhatsApp]
"Preciso trocar um chuveiro"
[5 notificacoes em sequencia]
"Orcamento: R$120" "Posso ir amanha" "Tenho horario hoje" "R$100 com material" "Disponivel agora"

[Pessoa sorrindo]
[TEXTO NA TELA: "De 0 respostas pra 5 em 10 minutos"]
[TEXTO NA TELA: "Chamei — Gratis pelo WhatsApp 📞"]`,
    visualNotes: "Split screen claro. Antes: frustracao, musica tensa, cor fria. Depois: alivio, musica animada, cor quente. Notificacoes do WhatsApp com som real.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_chamei",
    pillarId: "pillar_solucao",
    templateId: "tmpl_descobri",
    title: "Descobri Que Da Pra Resolver Pelo WhatsApp",
    hook: "Eu descobri que da pra contratar qualquer profissional em 10 minutos pelo WhatsApp",
    body: `[Pessoa animada na camera]
"Gente, eu tava precisando de um pintor."
"Pesquisei no Google: site desatualizado, telefone que ninguem atende."

"Ai uma amiga falou: usa o Chamei."

[TEXTO NA TELA: "O que aconteceu:"]
1. Mandei mensagem no WhatsApp
2. Descrevi o servico (pintar sala + quarto)
3. Em 10 minutos: 4 orcamentos

[TEXTO NA TELA: "O melhor:"]
"Um profissional com 47 avaliacoes positivas cobrou R$800 com material."
"Veio no dia combinado. Fez o servico perfeito."

[Parede pintada linda]
"E eu nao paguei NADA pro Chamei."

[TEXTO NA TELA: "Gratis. Pelo WhatsApp. Profissional real."]
[TEXTO NA TELA: "Chamei 📞"]`,
    visualNotes: "Talking head casual e autentico. Mostrar prints reais do WhatsApp. Foto da parede pintada. Musica animada. Formato de indicacao de amiga.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // Chamei × SOCIAL PROOF (2nd and 3rd)
  {
    brandId: "brand_chamei",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_antes_agora",
    title: "Antes Eu Ligava Pra 10, Agora Eu Mando 1 Mensagem",
    hook: "Antes eu ligava pra 10 profissionais. Agora mando 1 mensagem.",
    body: `[TEXTO NA TELA: "Antes"]
[Montagem rapida]
- Lista de telefones no papel
- Ligando, caixa postal
- "Nao trabalho no seu bairro"
- "So mes que vem"
- Desistindo no sofa

[TEXTO NA TELA: "Agora"]
[WhatsApp aberto]
"Oi, preciso de um eletricista pra trocar disjuntor"
[5 respostas em 8 minutos]
[Comparando orcamentos]
[Escolhendo o melhor]
[Eletricista chegando]
[Servico feito]

[TEXTO NA TELA: "1 mensagem. 5 orcamentos. 0 reais."]
[TEXTO NA TELA: "Chamei mudou minha vida (sem drama) 📞"]`,
    visualNotes: "Antes: camera tremida, frustracao real, som de telefone tocando. Depois: camera estavel, paz, som de notificacao do WhatsApp. Ritmo rapido.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_chamei",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_depoimento",
    title: "O Seu Jorge e a Torneira Que Vazava Ha 3 Meses",
    hook: "Seu Jorge deixou a torneira vazando 3 meses. Ate descobrir o Chamei.",
    body: `[TEXTO NA TELA: "A historia do Seu Jorge"]
Torneira da cozinha vazando ha 3 meses.
"Eu nao conhecia nenhum encanador de confianca."

Pediu indicacao pros vizinhos — ninguem sabia.
Procurou no Google — orcamento de R$500 so pra olhar.

[TEXTO NA TELA: "Ate que o filho mostrou o Chamei"]
"Pai, manda mensagem aqui."

[Print do WhatsApp]
10 minutos: 3 orcamentos de encanador da regiao.
Escolheu o com mais avaliacoes.

[TEXTO NA TELA: "Resultado:"]
Torneira consertada. R$80. No mesmo dia.

[Seu Jorge sorrindo]
"3 meses sofrendo. Resolvi em 10 minutos."

[TEXTO NA TELA: "Chamei — Todo mundo merece um profissional bom 📞"]`,
    visualNotes: "Storytelling emocional. Seu Jorge simpatico, classe media. Filho mostrando celular (wholesome). Antes e depois da torneira. Musica que emociona suave.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // Delas × SOLUCAO (2nd and 3rd)
  {
    brandId: "brand_delas",
    pillarId: "pillar_solucao",
    templateId: "tmpl_3_passos",
    title: "Como Achar Manicure Confiavel Em 3 Passos",
    hook: "Como achar uma manicure que nao vai destruir sua unha (em 3 passos)",
    body: `[TEXTO NA TELA: "Passo 1"]
Abre a Delas Club. So tem profissional indicada por outras mulheres. Nao entra qualquer uma.

[TEXTO NA TELA: "Passo 2"]
Filtra por regiao e servico. Ve as avaliacoes de mulheres REAIS. Foto do antes e depois DE VERDADE.

[TEXTO NA TELA: "Passo 3"]
Agenda direto. Sem surpresa de preco. Sem "ah, mas com esmalte fica mais caro".

[TEXTO NA TELA: "Resultado:"]
[Unha perfeita em close]
Profissional indicada. Preco combinado. Unha linda.

[TEXTO NA TELA: "Sua unha merece melhor que um 'confia' 💅"]
[TEXTO NA TELA: "Delas Club"]`,
    visualNotes: "Estilo tutorial girly. Cores rosa da marca. Close em unhas lindas. Musica empoderada feminina. Screenshots do app.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_delas",
    pillarId: "pillar_solucao",
    templateId: "tmpl_app_resolve",
    title: "O App Que Toda Mulher Precisava",
    hook: "Existe um app onde toda profissional de beleza e indicada por mulheres reais",
    body: `[TEXTO NA TELA: "O problema:"]
Voce acha manicure no Instagram.
Feed lindo. Nenhuma avaliacao real.
Resultado: decepao.

[TEXTO NA TELA: "A solucao:"]
Delas Club — so entra quem for indicada.

[Tela do app]
Cada profissional tem:
- Nota de 0 a 5 dada por mulheres
- Fotos REAIS (antes e depois)
- Preco FIXO (sem surpresa)
- Agenda disponivel

[TEXTO NA TELA: "Tipo um grupo de amigas, mas em app"]

[Mulheres sorrindo com unhas lindas]
[TEXTO NA TELA: "Beleza com seguranca. So na Delas. 💅"]`,
    visualNotes: "Tom de empoderamento feminino. Paleta rosa/dourado. Screenshots mockados do app. Mulheres diversas. Trending audio feminino.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // Delas × SOCIAL PROOF (2nd and 3rd)
  {
    brandId: "brand_delas",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_numero_pessoas",
    title: "Mais de 500 Mulheres Ja Indicaram",
    hook: "+500 mulheres ja indicaram profissionais na Delas Club",
    body: `[TEXTO NA TELA: "+500 indicacoes reais"]
[Numero crescendo com animacao]

[TEXTO NA TELA: "De mulheres REAIS para mulheres REAIS"]
[Montagem de prints de avaliacoes]

"Melhor manicure que ja fiz" — Ana, 28
"Finalmente uma depiladora que nao cancela" — Julia, 33
"Sobrancelha perfeita, recomendo demais" — Camila, 25

[TEXTO NA TELA: "Nada de avaliacao fake"]
"Cada nota e de uma mulher que realmente usou o servico."

[TEXTO NA TELA: "Indicacao de mulher pra mulher. E assim que funciona. 💅"]`,
    visualNotes: "Prints reais de avaliacoes. Fotos de mulheres felizes. Numeros animados. Rosa e dourado. Formato que gera confianca.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_delas",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_antes_agora",
    title: "Antes Eu Tinha Medo de Ir Na Esteticista",
    hook: "Antes eu tinha MEDO de ir na esteticista. Agora eu amo.",
    body: `[TEXTO NA TELA: "Antes da Delas Club"]
- Marcava pelo Instagram (sem referencia)
- Chegava la: ambiente duvidoso
- Preco diferente do combinado
- Resultado: nada como a foto
- Nunca mais voltava

[TEXTO NA TELA: "Depois da Delas Club"]
- Escolhi pela nota e avaliacoes
- 47 mulheres recomendaram
- Preco combinado antes
- Resultado: EXATAMENTE como prometido
- Ja marquei o proximo

[TEXTO NA TELA: "A diferenca?"]
"Confiar em mulher que ja testou > confiar em feed bonito."

[TEXTO NA TELA: "Delas Club — Beleza sem risco 💅"]`,
    visualNotes: "Antes: cores frias, inseguranca. Depois: cores quentes, confianca. Rosto de alivio real. Formato relatable para mulheres.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // Soninho x DOR (2nd and 3rd)
  {
    brandId: "brand_soninho",
    pillarId: "pillar_dor",
    templateId: "tmpl_ninguem_fala",
    title: "Ninguem Fala Sobre o YouTube Kids",
    hook: "Ninguem fala sobre o que seu filho REALMENTE assiste no YouTube Kids",
    body: `[Pai/mae na camera, serio]
"Voce acha que YouTube Kids e seguro?"

[TEXTO NA TELA: "Vamos ver o que aparece:"]
- Video de slime com 45 minutos (hipnotico)
- Desenho com humor violento
- Propaganda de brinquedo disfarçada de conteudo
- Unboxing infinito ($$$)

[TEXTO NA TELA: "Seu filho assiste isso 2h por dia"]

"E depois voce se pergunta por que ele ta ansioso, nao dorme e nao larga o celular."

[TEXTO NA TELA: "O algoritmo nao se importa com o seu filho."]

[Pausa]

"Mas e se existisse um app que cuida do conteudo como voce cuidaria?"
"Historias calmas. Sem propaganda. Sem algoritmo viciante."

[TEXTO NA TELA: "Soninho — Conteudo que cuida 🌙"]`,
    visualNotes: "Tom de documentario. Pai/mae genuinamente preocupado. Screenshots reais do YouTube Kids (borrados). Mudanca de tom quando apresenta Soninho. Pode gerar debate nos comentarios.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_soninho",
    pillarId: "pillar_dor",
    templateId: "tmpl_tipos",
    title: "5 Tipos de Rotina de Sono",
    hook: "5 tipos de rotina de sono (qual e a sua?)",
    body: `[TEXTO NA TELA: "Tipo 1: O Negociador 🤝"]
"Mais uma historia." "Mais um copo d'agua." "Mais um beijo." Sao 23h e ninguem dormiu.

[TEXTO NA TELA: "Tipo 2: O Refem 🪢"]
Dorme do lado ate a crianca pegar no sono. Acorda as 3h com pe na cara.

[TEXTO NA TELA: "Tipo 3: O Screenzeiro 📱"]
Liga o tablet e reza. Funciona? As vezes. Culpa depois? Sempre.

[TEXTO NA TELA: "Tipo 4: O Motorista 🚗"]
Bota no carro e da uma volta no quarteirão. Funciona, mas custa gasolina.

[TEXTO NA TELA: "Tipo 5: O Pai/Mae do Soninho 🌙"]
Rotina de 15 minutos. Historia adaptada. Crianca dormindo em paz.
Pai no sofa. Serie ligada. Vida.

[TEXTO NA TELA: "Qual tipo voce e? 👇"]`,
    visualNotes: "Humor de pai/mae. Cada tipo com atuacao exagerada. O tipo 5 e o heroi. Trending audio. Formato lista que gera comentarios. Cores roxas.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // Soninho × SOLUCAO (2nd and 3rd)
  {
    brandId: "brand_soninho",
    pillarId: "pillar_solucao",
    templateId: "tmpl_3_passos",
    title: "Rotina de Sono em 3 Passos",
    hook: "Como criar uma rotina de sono em 3 passos (que realmente funciona)",
    body: `[TEXTO NA TELA: "Passo 1: Desacelerar"]
30 minutos antes de dormir: sem tela. Luz baixa. Voz calma.
O Soninho faz isso por voce com historias que vao ficando mais lentas.

[TEXTO NA TELA: "Passo 2: A Historia Certa"]
Nao e qualquer historia. E uma adaptada ao DIA da crianca.
Dia agitado = historia mais longa e calmante.
Dia tranquilo = historia curta e doce.

[TEXTO NA TELA: "Passo 3: Consistencia"]
Mesma rotina. Todo dia. O cerebro aprende: "historia do Soninho = hora de dormir."

[TEXTO NA TELA: "Resultado em 1 semana:"]
Crianca dormindo em 15 minutos. Sem briga. Sem negociacao.

[TEXTO NA TELA: "Ciencia + carinho = sono bom 🌙"]`,
    visualNotes: "Estilo educativo mas leve. Iluminacao quente. Diagramas simples. Crianca dormindo no final. Musica lo-fi suave.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_soninho",
    pillarId: "pillar_solucao",
    templateId: "tmpl_app_resolve",
    title: "O App Que Faz Seu Filho Dormir",
    hook: "Existe um app que faz seu filho dormir em 15 minutos (sem tela, sem briga)",
    body: `[TEXTO NA TELA: "O problema:"]
Seu filho nao dorme. Voce ja tentou tudo.
YouTube? Deixa mais acordado.
Historias? Voce nao aguenta mais inventar.

[TEXTO NA TELA: "A solucao:"]
Soninho — historias que realmente fazem dormir.

[Tela do app]
- So audio (sem tela brilhante)
- Adapta ao ritmo do dia da crianca
- Personagens que a crianca escolhe
- Sons ambientes: chuva, grilo, oceano

[TEXTO NA TELA: "Nao e entretenimento. E sono."]

[Crianca dormindo, pai/mae em paz]
[TEXTO NA TELA: "15 minutos. Toda noite. Garantido. 🌙"]`,
    visualNotes: "Demo do app em acao. Iluminacao noturna. Close em crianca dormindo (ternura). Pai/mae aliviado. Cores roxas e azul escuro.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // Soninho × SOCIAL PROOF (2nd and 3rd)
  {
    brandId: "brand_soninho",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_depoimento",
    title: "Depoimento: A Marina e o Pedro de 3 Anos",
    hook: "A Marina nao dormia mais que 4 horas seguidas ha 2 anos",
    body: `[TEXTO NA TELA: "Marina, mae do Pedro, 3 anos"]
"O Pedro nunca dormiu bem. Nunca."
"Eu acordava 3, 4 vezes por noite."

[TEXTO NA TELA: "Ja tinha tentado:"]
- Pediatra: "e fase"
- Remedio: nao queria medicar
- YouTube: piorava
- Musica classica: nao funcionava

[TEXTO NA TELA: "Uma amiga mandou o Soninho"]
"Na primeira noite eu nao acreditei."
"Ele DORMIU. Em 20 minutos. Sem acordar."

[Marina chorando de alivio]
"Na terceira noite eu chorei. De felicidade."

[TEXTO NA TELA: "Hoje o Pedro dorme 10h seguidas"]
[TEXTO NA TELA: "'O Soninho devolveu minha sanidade' — Marina"]

[TEXTO NA TELA: "Soninho 🌙"]`,
    visualNotes: "Depoimento real/documental. Mae genuinamente emocionada. Iluminacao natural. Sem filtro. A emocao e o conteudo. Potencial viral por empatia entre pais.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_soninho",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_numero_pessoas",
    title: "Mais de 5.000 Criancas Dormem Com o Soninho",
    hook: "+5.000 criancas dormem melhor com o Soninho toda noite",
    body: `[TEXTO NA TELA: "+5.000 criancas"]
[Numero crescendo com animacao]

[TEXTO NA TELA: "E +5.000 pais dormindo em paz"]

[Montagem rapida de depoimentos:]
"Meu filho dorme em 10 minutos agora" — Juliana
"Eu nao sabia que noite podia ser tranquila" — Rafael
"Melhor app que ja baixei" — Camila
"Minha filha PEDE a historia do Soninho" — André

[TEXTO NA TELA: "Media: 15 minutos pra dormir"]
[TEXTO NA TELA: "vs 47 minutos sem o app"]

[Criancas dormindo, pais felizes]
[TEXTO NA TELA: "Seu filho merece dormir bem. Voce tambem. 🌙"]`,
    visualNotes: "Numeros com animacao epica. Depoimentos em cards coloridos. Fotos de criancas dormindo (ternura maxima). Dados comparativos. Roxo/azul escuro.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // SimplificaApp × DOR (2nd and 3rd)
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_dor",
    templateId: "tmpl_ninguem_fala",
    title: "Ninguem Fala Sobre Exclusao Digital",
    hook: "Ninguem fala sobre os 50 milhoes de brasileiros excluidos digitalmente",
    body: `[Dados na tela, tom serio]
[TEXTO NA TELA: "50 milhoes de brasileiros com mais de 60 anos"]
[TEXTO NA TELA: "72% tem dificuldade com apps de banco"]
[TEXTO NA TELA: "84% precisa de ajuda pra acessar servicos online"]

"Seu avo construiu uma vida inteira sem internet."
"Agora precisa dela pra TUDO."
"E ninguem facilitou pra ele."

[TEXTO NA TELA: "O governo criou sites impossiveis"]
[TEXTO NA TELA: "Os bancos criaram apps confusos"]
[TEXTO NA TELA: "E a gente diz: 'e so clicar ali, vo'"]

[Pausa]
"Nao. Nao e 'so clicar'."
"E uma geracao inteira sendo excluida."

[TEXTO NA TELA: "SimplificaApp — porque clicar deveria ser simples 👴💚"]`,
    visualNotes: "Tom de manifesto/documentario. Dados impactantes. Emocao real. Pode fazer chorar. Potencial viral ENORME por empatia intergeracional.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_dor",
    templateId: "tmpl_tipos",
    title: "5 Tipos de Site Que Seu Avo Odeia",
    hook: "5 tipos de site que fazem seu avo querer jogar o celular fora",
    body: `[TEXTO NA TELA: "Tipo 1: O Banco 🏦"]
15 opcoes na tela. Popup de segurança. Token. Senha. Contra-senha. Biometria.

[TEXTO NA TELA: "Tipo 2: O Gov.br 🏛️"]
Menu com 47 opcoes. Fonte tamanho 8. Botao "voltar" que some.

[TEXTO NA TELA: "Tipo 3: A Farmacia 💊"]
"Cadastre-se com CPF, email, telefone, endereco, tipo sanguineo..."

[TEXTO NA TELA: "Tipo 4: O Delivery 🍕"]
"Adicione ao carrinho. Mas antes: cupom? Fidelidade? PIX ou cartao? Troco?"

[TEXTO NA TELA: "Tipo 5: Com SimplificaApp ✅"]
3 botoes. Fonte enorme. Linguagem simples.
Ate sua avo de 85 consegue usar.

[TEXTO NA TELA: "Qual tipo seu avo mais sofre? 👇"]`,
    visualNotes: "Humor leve e respeitoso. Screenshots exagerados de sites reais. O tipo 5 e a redenção. Som de clique frustrante vs som de sucesso. Verde da marca.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // SimplificaApp × SOLUCAO (2nd and 3rd)
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_solucao",
    templateId: "tmpl_3_passos",
    title: "Como Simplificar a Internet Pro Seu Avo",
    hook: "Como fazer seu avo usar a internet sozinho em 3 passos",
    body: `[TEXTO NA TELA: "Passo 1"]
Instala o SimplificaApp no celular dele. 2 minutos.

[TEXTO NA TELA: "Passo 2"]
Escolhe quais sites ele mais usa: banco, farmacia, gov.br
O app transforma cada um em interface simples.

[TEXTO NA TELA: "Passo 3"]
Mostra pra ele. Uma vez. Ele vai entender.
Porque agora tem 3 botoes em vez de 30.

[TEXTO NA TELA: "Resultado:"]
Seu avo pagando conta sozinho.
Seu avo pedindo remedio sozinho.
Seu avo FELIZ. Independente.

[TEXTO NA TELA: "E voce sem receber ligacao as 7h da manha perguntando 'como faz' 😅"]
[TEXTO NA TELA: "SimplificaApp — Internet pra todo mundo 👴💚"]`,
    visualNotes: "Tutorial simples e direto. Demonstracao do app. Close no rosto do idoso feliz ao conseguir fazer sozinho. Humor leve no final.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_solucao",
    templateId: "tmpl_teste_comparacao",
    title: "Teste: Com vs Sem SimplificaApp",
    hook: "Pedi pra minha avo pagar uma conta. Com e sem o SimplificaApp.",
    body: `[TEXTO NA TELA: "O Teste"]
Mesma conta. Mesma avo. Duas tentativas.

[TEXTO NA TELA: "Sem SimplificaApp:"]
- Abrir app do banco: 2 minutos
- Encontrar "pagar conta": 5 minutos e 3 telas erradas
- Escanear boleto: "onde aperta?" 3 tentativas
- Confirmar: "qual senha? a do cartao?"
- Resultado: CONTA BLOQUEADA
- Tempo: desistiu depois de 12 minutos

[TEXTO NA TELA: "Com SimplificaApp:"]
- Abrir: 1 toque
- "PAGAR CONTA": botao enorme no meio da tela
- Camera abre automatica pro boleto
- Confirmar: 1 botao
- Resultado: CONTA PAGA
- Tempo: 2 minutos

[Avo sorrindo, mostrando tela: "Paguei!"]
[TEXTO NA TELA: "12 minutos vs 2 minutos. Sem stress."]
[TEXTO NA TELA: "SimplificaApp 👴💚"]`,
    visualNotes: "Formato experimento com timer na tela. Gravacao real com idosa (ou mockup). Frustracao vs sucesso lado a lado. Emocao no resultado. Compartilhavel por netos.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // SimplificaApp × SOCIAL PROOF (2nd and 3rd)
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_numero_pessoas",
    title: "Mais de 2.000 Familias Ja Usam",
    hook: "+2.000 familias ja simplificaram a vida dos avos com o SimplificaApp",
    body: `[TEXTO NA TELA: "+2.000 familias"]
[Numero crescendo]

[Depoimentos rapidos:]
"Minha mae de 78 anos paga conta sozinha agora" — Carlos
"Meu pai parou de me ligar todo dia pedindo ajuda" — Ana
"Minha avo AMA. Ela se sente independente" — Lucas
"Melhor presente que ja dei pro meu avo" — Julia

[TEXTO NA TELA: "Resultado mais comum:"]
"Idosos que se sentem uteis de novo."

[TEXTO NA TELA: "Porque ninguem deveria depender dos outros pra pagar uma conta."]
[TEXTO NA TELA: "SimplificaApp — Dignidade digital 👴💚"]`,
    visualNotes: "Depoimentos em cards. Fotos de idosos felizes com celular. Numeros animados. Tom emocional. Verde da marca. Formato que faz compartilhar e marcar parentes.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_simplifica",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_por_que_escolheram",
    title: "Por Que 2.000 Familias Escolheram o SimplificaApp",
    hook: "Por que 2.000 familias escolheram o SimplificaApp pro seu idoso?",
    body: `[TEXTO NA TELA: "Motivo 1: Independencia"]
"Minha avo parou de precisar de mim pra tudo. Ela se sente util."

[TEXTO NA TELA: "Motivo 2: Seguranca"]
"Nao preciso mais me preocupar que ela clique em golpe. O app filtra."

[TEXTO NA TELA: "Motivo 3: Simplicidade"]
"Ela aprendeu em 5 minutos. CINCO MINUTOS."

[TEXTO NA TELA: "Motivo 4: Emocao"]
"No dia que ela pagou a primeira conta sozinha, ela chorou."
"Eu chorei tambem."

[TEXTO NA TELA: "Tecnologia nao precisa ser complicada."]
[TEXTO NA TELA: "So precisa respeitar quem usa."]
[TEXTO NA TELA: "SimplificaApp 👴💚"]`,
    visualNotes: "Cada motivo com icone e cor. O motivo 4 e o mais emotivo — pausa maior. Musica que cresce. Formato manifesto. Potencial viral por emocao.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // Spark × DOR (3rd)
  {
    brandId: "brand_spark",
    pillarId: "pillar_dor",
    templateId: "tmpl_expectativa_realidade",
    title: "Expectativa vs Realidade: First Date",
    hook: "First date de app: Expectativa vs Realidade",
    body: `[TEXTO NA TELA: "Expectativa"]
[Casal rindo, conversa fluindo, quimica]
"A gente conversou tanto no app..."

[TEXTO NA TELA: "Realidade"]
[Silencio constrangedor]
"Entao... voce gosta de... coisas?"
[Olhando pro celular]
[Desculpa inventada pra ir embora]

[TEXTO NA TELA: "Por que isso acontece?"]
"Porque no Tinder voce conversa sobre NADA antes de encontrar."
"Oi, tudo bem, o que voce faz, ah legal."

[TEXTO NA TELA: "No Spark:"]
"Antes do date, voce faz uma experiencia a dois."
"Descobre compatibilidade REAL."
"Chega no date com assunto."

[TEXTO NA TELA: "Menos silencio constrangedor. Mais conexao real. 🔥"]`,
    visualNotes: "Split screen comico. Atuacao exagerada do constrangimento. Musica romantica que para de repente. Humor relatable. O Spark entra como heroi.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // Spark × SOLUCAO (2nd and 3rd)
  {
    brandId: "brand_spark",
    pillarId: "pillar_solucao",
    templateId: "tmpl_descobri",
    title: "Descobri Por Que Meus Dates Sempre Davam Errado",
    hook: "Eu descobri por que TODOS os meus dates de app davam errado",
    body: `[Pessoa na camera, reflexiva]
"Eu fazia tudo certinho. Perfil bom. Fotos reais. Bio criativa."
"Mas os dates eram sempre... mediocres."

[TEXTO NA TELA: "Ate que eu entendi:"]
"O problema nao era EU. Era o PROCESSO."

"Match → oi → conversa generica → date sem contexto → constrangimento."

[TEXTO NA TELA: "Faltava uma etapa entre match e date"]
"Algo que criasse conexao ANTES de encontrar."

"Ai conheci o Spark."
"Depois do match, a gente fez uma 'experiencia': perguntas que fazem pensar."
"Descobri que ele ama cachorro, odeia sertanejo e chora com filme."

[TEXTO NA TELA: "O date?"]
"Melhor date da minha vida. A gente ja se CONHECIA."

[TEXTO NA TELA: "Spark — O que falta entre match e date 🔥"]`,
    visualNotes: "Talking head autentico. Expressoes reais. Mudanca de tom quando fala do Spark (luz muda, sorri). Formato confessional que gera identificacao.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_spark",
    pillarId: "pillar_solucao",
    templateId: "tmpl_3_passos",
    title: "Como Ter Um Date Que Presta Em 3 Passos",
    hook: "Como ter um date que PRESTA em 3 passos (sem ghosting)",
    body: `[TEXTO NA TELA: "Passo 1: Match com filtro"]
No Spark voce nao da like em 500 pessoas. Voce seleciona com intencao.
Menos match, mais qualidade.

[TEXTO NA TELA: "Passo 2: Experiencia pre-date"]
Antes de marcar encontro, voces fazem uma atividade juntos no app.
Perguntas criativas. Desafios. Voces se conhecem DE VERDADE.

[TEXTO NA TELA: "Passo 3: Date com contexto"]
Voce chega no date sabendo do que conversar.
Nao e mais "oi, tudo bem?". E "lembra quando voce disse que..."

[TEXTO NA TELA: "Resultado:"]
Dates reais. Conversas reais. Conexoes reais.
E zero ghosting — porque quem faz a experiencia, quer encontrar.

[TEXTO NA TELA: "Spark — Dating com proposito 🔥"]`,
    visualNotes: "Tutorial visual. Cada passo com animacao. Screenshots do app. Casal rindo no date (imagem final). Musica animada. Laranja e preto.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // Spark × SOCIAL PROOF (2nd and 3rd)
  {
    brandId: "brand_spark",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_depoimento",
    title: "O Lucas e a Mari Se Conheceram No Spark",
    hook: "O Lucas estava prestes a deletar todos os apps de namoro",
    body: `[TEXTO NA TELA: "A historia do Lucas"]
"Eu tinha 3 apps de namoro. 200+ matches. Zero conexao real."

"Tava prestes a deletar tudo."

[TEXTO NA TELA: "Uma amiga mandou o Spark"]
"'Tenta esse. E diferente.' Eu pensei: 'mais um.'"

"Dei match com a Mari. Ao inves de 'oi', o app sugeriu uma experiencia."
"A gente respondeu perguntas um pro outro. Descobri que ela ama astronomia."

[TEXTO NA TELA: "Primeiro date: observatorio"]
"Fui no date SABENDO do que falar."
"Sem constrangimento. Sem silencio. Conversa fluindo."

[Lucas e Mari juntos, sorrindo]
[TEXTO NA TELA: "3 meses juntos"]

"Se eu tivesse deletado os apps antes de conhecer o Spark..."

[TEXTO NA TELA: "Spark — Onde match vira historia 🔥"]`,
    visualNotes: "Storytelling romantico. Lucas contando a historia. Fotos do casal. Musica que vai crescendo. Emocao genuina. Formato que faz suspirar e baixar o app.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_spark",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_numero_pessoas",
    title: "Mais de 1.000 Dates Reais No Spark",
    hook: "+1.000 dates reais ja aconteceram por causa do Spark",
    body: `[TEXTO NA TELA: "+1.000 dates"]
[Numero crescendo]

[TEXTO NA TELA: "Nao matches. DATES. Encontros reais."]

[TEXTO NA TELA: "Taxa de conversao match → date:"]
"Tinder: 2%"
"Spark: 38%"

[TEXTO NA TELA: "Por que?"]
"Porque a experiencia pre-date filtra quem quer conexao real."
"Quem faz a experiencia, vai pro date."

[Depoimentos rapidos:]
"Melhor date da minha vida" — Ana
"Finalmente alguem que nao deu ghost" — Pedro
"A gente ta namorando faz 2 meses" — Julia

[TEXTO NA TELA: "Menos swipe. Mais vida. 🔥"]`,
    visualNotes: "Dados impactantes com animacao. Comparativo Tinder vs Spark. Depoimentos rapidos. Fotos de casais. Musica energetica. Laranja vibrante.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },

  // Blackcube × DOR (2nd and 3rd)
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_dor",
    templateId: "tmpl_pov_frustracao",
    title: "POV: Reuniao Com Sua Agencia Digital",
    hook: "POV: voce esta na 47a reuniao de 'alinhamento' com sua agencia",
    body: `[TEXTO NA TELA: "Mes 1"]
"Vamos fazer o briefing." [Slide bonito, nenhuma entrega]

[TEXTO NA TELA: "Mes 2"]
"Estamos finalizando a estrategia." [Mais um slide]

[TEXTO NA TELA: "Mes 3"]
"A landing page ta quase pronta." [Wireframe do Canva]

[TEXTO NA TELA: "Mes 4"]
"Tivemos uns ajustes." [Voce ja pagou R$20k]

[TEXTO NA TELA: "Mes 5"]
"Vamos remarcar pra proxima semana." [Voce querendo chorar]

[TEXTO NA TELA: "Mes 6"]
[Landing page entregue. E um template do WordPress.]

[CORTE SECO]
[TEXTO NA TELA: "Na Blackcube: landing page em 48h"]
[TEXTO NA TELA: "Porque a gente builda. Nao faz slide. ◼️"]`,
    visualNotes: "Humor de escritorio. Expressao de frustracao crescente. Cada mes com envelhecimento comico. Corte seco pro estilo minimalista da Blackcube. Preto e branco.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_dor",
    templateId: "tmpl_ninguem_fala",
    title: "Ninguem Fala Sobre o Que Agencias Realmente Fazem",
    hook: "Ninguem fala sobre o que sua agencia digital REALMENTE faz com seu dinheiro",
    body: `[Tom serio, dados na tela]
"Voce paga R$5k por mes pra sua agencia."

[TEXTO NA TELA: "O que voce acha que eles fazem:"]
- Estrategia de marketing
- Gestao de redes sociais
- Trafego pago otimizado
- Analise de dados

[TEXTO NA TELA: "O que eles realmente fazem:"]
- 3 posts no Canva por semana
- Boost de R$50 no Instagram
- Relatorio copiado do Google Analytics
- Reuniao de 1h pra justificar o mes

[TEXTO NA TELA: "Custo real do trabalho: R$500"]
[TEXTO NA TELA: "Voce paga: R$5.000"]
[TEXTO NA TELA: "Margem da agencia: 900%"]

[Pausa]

"Dados > opiniao. Codigo > slide. Resultado > promessa."

[TEXTO NA TELA: "Blackcube — Anti-agencia ◼️"]`,
    visualNotes: "Formato expose/denuncia. Dados em infografico. Tom provocativo. Vai incomodar agencias (gera debate = viral). Preto e branco com numeros em vermelho.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },

  // Blackcube × SOLUCAO (2nd and 3rd)
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_solucao",
    templateId: "tmpl_3_passos",
    title: "Como Parar de Perder Dinheiro Com Agencia",
    hook: "Como parar de jogar dinheiro fora com agencia digital em 3 passos",
    body: `[TEXTO NA TELA: "Passo 1: Pare de pagar por reuniao"]
Se sua agencia faz mais reuniao que entrega, voce tem um problema.
Peca RESULTADOS, nao slides.

[TEXTO NA TELA: "Passo 2: Automatize o que e repetitivo"]
Respostas no WhatsApp. Qualificacao de lead. Follow-up.
Nada disso precisa de humano. Precisa de codigo.

[TEXTO NA TELA: "Passo 3: Meça o que importa"]
Views nao pagam boleto. Impressoes nao sao vendas.
Meça: leads, conversoes, receita.

[TEXTO NA TELA: "Resultado:"]
Menos gasto. Mais resultado. Dados reais.

[TEXTO NA TELA: "A Blackcube faz os 3 passos pra voce."]
[TEXTO NA TELA: "Automacao que funciona. ◼️"]`,
    visualNotes: "Estilo educativo mas provocativo. Cada passo com icone minimalista. Dados no final. Tom de autoridade. Preto e branco. LinkedIn + Instagram.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_solucao",
    templateId: "tmpl_teste_comparacao",
    title: "Blackcube vs Agencia Tradicional",
    hook: "Comparei: Blackcube vs agencia tradicional. Olha o resultado em 30 dias.",
    body: `[TEXTO NA TELA: "O Teste: 30 dias"]
Mesmo orcamento. Mesma empresa. Dois fornecedores.

[TEXTO NA TELA: "Agencia Tradicional — 30 dias:"]
- 3 reunioes de alinhamento
- 1 apresentacao de estrategia (PDF)
- 12 posts no Instagram (template Canva)
- Resultado: 47 curtidas, 0 leads
- Custo: R$5.000

[TEXTO NA TELA: "Blackcube — 30 dias:"]
- Landing page no ar em 48h
- WhatsApp bot respondendo 24/7
- Automacao de lead scoring
- Dashboard em tempo real
- Resultado: 127 leads, 23 vendas
- Custo: R$3.000

[TEXTO NA TELA: "Agencia: R$5k → 0 vendas"]
[TEXTO NA TELA: "Blackcube: R$3k → 23 vendas"]

[TEXTO NA TELA: "Numeros nao mentem. ◼️"]`,
    visualNotes: "Formato comparativo com split screen. Numeros destacados. Animacao de crescimento. Tom de case study. Preto e branco com dados em verde (Blackcube) e vermelho (agencia).",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },

  // Blackcube × SOCIAL PROOF (2nd and 3rd)
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_depoimento",
    title: "O Marcos Gastava R$5k Por Mes Com Agencia",
    hook: "O Marcos gastava R$5k por mes com agencia e nao vendia nada",
    body: `[TEXTO NA TELA: "Marcos, dono de e-commerce"]
"Eu pagava R$5.000 por mes. Fazia 2 reunioes por semana."
"Em 6 meses: 3.000 curtidas. Zero vendas atribuidas a agencia."

[TEXTO NA TELA: "Ate que conheceu a Blackcube"]
"Em 1 semana eles entregaram o que a agencia prometeu em 6 meses."

"Landing page. Bot no WhatsApp. Dashboard com metricas reais."

[Print do dashboard]
[TEXTO NA TELA: "Primeiro mes: 47 leads qualificados"]
[TEXTO NA TELA: "Segundo mes: R$23k em vendas"]

"E eu pago MENOS do que pagava pra agencia."

[Marcos sorrindo]
"Dados > opiniao. Codigo > slide. Resultado > promessa."

[TEXTO NA TELA: "Blackcube ◼️"]`,
    visualNotes: "Depoimento de empresario. Print real de dashboard. Numeros crescendo. Tom de confianca. Preto e branco com dados destacados. LinkedIn + Instagram.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_por_que_escolheram",
    title: "Por Que Empresas Estao Largando Agencias",
    hook: "Por que cada vez mais empresas estao trocando agencias pela Blackcube?",
    body: `[TEXTO NA TELA: "Motivo 1: Velocidade"]
"Agencia: 6 meses pra landing page."
"Blackcube: 48 horas."

[TEXTO NA TELA: "Motivo 2: Resultado mensuravel"]
"Agencia: 'seu post teve 500 impressoes'"
"Blackcube: 'voce teve 47 leads e 12 vendas'"

[TEXTO NA TELA: "Motivo 3: Custo-beneficio"]
"Agencia: R$5k/mes por templates de Canva"
"Blackcube: R$3k/mes por automacao real"

[TEXTO NA TELA: "Motivo 4: Zero enrolacao"]
"Agencia: 3 reunioes por semana"
"Blackcube: dashboard em tempo real, sem reuniao"

[TEXTO NA TELA: "A era da agencia de slide acabou."]
[TEXTO NA TELA: "Bem-vindo a era da automacao. ◼️"]`,
    visualNotes: "Formato comparativo direto. Side by side. Tom provocativo. Numeros em destaque. Minimalista. Preto e branco. Vai irritar agencias = viralizar.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },

  // ===================== SPARK =====================
  {
    brandId: "brand_spark",
    pillarId: "pillar_dor",
    templateId: "tmpl_tipos",
    title: "5 Tipos de Match no Tinder",
    hook: "5 tipos de match que todo mundo já teve (e sofreu)",
    body: `[TEXTO NA TELA: "Tipo 1: O Oi Sumido 👋"]
Match → "Oi" → Nunca mais. Nem tchau. Nem block. Só o vácuo eterno.

[TEXTO NA TELA: "Tipo 2: O Entrevistador 📋"]
"O que você faz?" "Onde mora?" "Signo?" Parece processo seletivo.

[TEXTO NA TELA: "Tipo 3: O Fotógrafo de 2019 📸"]
Foto de viagem de 5 anos atrás. Chegou no date 15kg e uma barba depois.

[TEXTO NA TELA: "Tipo 4: O Terapeuta Reverso 🛋️"]
Primeiro date e já tá contando trauma de infância. Irmão, pede o café primeiro.

[TEXTO NA TELA: "Tipo 5: O Match do Spark ✨"]
Match → Experiência guiada → Conversa REAL → Date com contexto
Porque match sem conexão é só notificação.

[TEXTO NA TELA: "Cansou de match vazio? 🔥"]`,
    visualNotes: "Transições rápidas, humor ácido. Cada tipo com atuação exagerada. Trending audio. O tipo 5 (Spark) entra com brilho e música diferente. Cores laranja/preto. Formato que convida comentários.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_spark",
    pillarId: "pillar_dor",
    templateId: "tmpl_ninguem_fala",
    title: "O Problema Real do Tinder",
    hook: "Ninguém fala sobre o REAL problema dos apps de namoro",
    body: `[Pessoa olhando pra câmera, sério]
"O problema do Tinder não é que falta gente."

[TEXTO NA TELA: "50 milhões de usuários"]
"É que sobra match e falta conexão."

[TEXTO NA TELA: "Dado real: 95% das conversas morrem antes de 10 mensagens"]

"Sabe por quê? Porque 'oi, tudo bem?' não constrói nada."
"Você tá falando com 5 pessoas ao mesmo tempo sobre NADA."

[TEXTO NA TELA: "O resultado?"]
"Solidão com notificação."

[Pausa]

[TEXTO NA TELA: "E se depois do match viesse uma experiência?"]
"Uma pergunta que faz pensar. Um desafio a dois. Um motivo real pra conversar."

[TEXTO NA TELA: "Spark — Match é só o começo 🔥"]`,
    visualNotes: "Talking head sério/reflexivo. Dados na tela como infográfico. Mudança de tom quando apresenta o Spark (luz muda, música muda). Formato polêmico que gera debate nos comentários.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_spark",
    pillarId: "pillar_solucao",
    templateId: "tmpl_teste_comparacao",
    title: "Spark vs Tinder: O Teste",
    hook: "Fiz o teste: Spark vs Tinder por 7 dias. Olha o resultado.",
    body: `[TEXTO NA TELA: "O Experimento"]
Mesmo perfil. Mesmas fotos. 7 dias em cada app.

[TEXTO NA TELA: "Tinder — 7 dias"]
- 23 matches
- 15 conversas iniciadas
- 12 "oi, tudo bem?"
- 2 que passaram de 10 mensagens
- 0 dates

[TEXTO NA TELA: "Spark — 7 dias"]
- 8 matches (menos, mas com filtro)
- 8 experiências completadas
- 6 conversas reais (com profundidade)
- 3 dates

[TEXTO NA TELA: "Tinder: 23 matches → 0 dates"]
[TEXTO NA TELA: "Spark: 8 matches → 3 dates"]

[Pessoa sorrindo]
"Menos match, mais conexão. Era isso que faltava."

[TEXTO NA TELA: "Spark — Menos swipe, mais vida 🔥"]`,
    visualNotes: "Formato vlog/experimento social. Números aparecendo com animação. Gráfico comparativo visual. Expressão de surpresa genuína no resultado. Música de revelação no final.",
    voiceoverText: null,
    duration: 60,
    status: "draft",
    feedback: null,
  },

  // ===================== BLACKCUBE =====================
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_dor",
    templateId: "tmpl_red_flags",
    title: "Red Flags da Sua Agência Digital",
    hook: "Red flags de que sua agência digital tá te roubando 🚩",
    body: `[TEXTO NA TELA: "Red flag 1 🚩"]
"Reunião de alinhamento" toda semana. Nenhuma entrega concreta.

[TEXTO NA TELA: "Red flag 2 🚩"]
Relatório mensal com métricas de vaidade. "Seu post teve 500 impressões!" Impressão não paga boleto.

[TEXTO NA TELA: "Red flag 3 🚩"]
Leva 3 meses pra entregar uma landing page. Você faria no Wix em 2 horas.

[TEXTO NA TELA: "Red flag 4 🚩"]
Cobra R$5k/mês e terceiriza pro estagiário do Canva.

[TEXTO NA TELA: "Red flag 5 🚩"]
Nunca mostra quanto de DINHEIRO as ações trouxeram. Só likes.

[TEXTO NA TELA: "Na Blackcube: dados > opinião"]
"A gente entrega build, não slide. Resultado, não relatório."

[TEXTO NA TELA: "Automação que funciona. ◼️"]`,
    visualNotes: "Tom provocativo, autoridade. Fundo escuro. Texto branco bold. Cada red flag com som de buzina. No final, transição pro estilo Blackcube (minimalista, preto e branco). LinkedIn-friendly.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_solucao",
    templateId: "tmpl_before_after",
    title: "Antes e Depois da Automação",
    hook: "Antes: 6 meses e R$15k pra uma landing page. Depois da Blackcube:",
    body: `[TEXTO NA TELA: "O que sua agência entrega:"]
- 1 landing page em 6 meses
- 1 relatório de 40 páginas que ninguém lê
- 1 "estratégia" que é um PDF bonito
- Custo: R$15.000

[TEXTO NA TELA: "O que a Blackcube entrega:"]
- Landing page em 48h
- Dashboard em tempo real com métricas que importam
- Automação de leads rodando 24/7
- WhatsApp bot respondendo enquanto você dorme
- Custo: menos que sua agência

[TEXTO NA TELA: "A diferença?"]
"A gente builda. Não faz reunião sobre buildar."

[TEXTO NA TELA: "Seu negócio precisa de código, não de slides."]
[TEXTO NA TELA: "Blackcube ◼️"]`,
    visualNotes: "Estilo corporate provocativo. Split screen. Lado da agência: colorido, cheio, confuso. Lado Blackcube: minimalista, preto, dados. Tom de manifesto. LinkedIn + Instagram.",
    voiceoverText: null,
    duration: 45,
    status: "draft",
    feedback: null,
  },
  {
    brandId: "brand_blackcube",
    pillarId: "pillar_social_proof",
    templateId: "tmpl_olha_resultado",
    title: "Resultado Real: Automação de Leads",
    hook: "Olha o que 1 semana de automação Blackcube fez pro meu negócio",
    body: `[TEXTO NA TELA: "Antes da Blackcube:"]
- 5 leads por semana (todos manuais)
- 2 horas por dia respondendo DM
- Taxa de conversão: 3%

[TEXTO NA TELA: "1 semana depois:"]
[Print do dashboard]
- 47 leads qualificados (automático)
- Bot respondendo 24/7
- Taxa de conversão: 12%

[TEXTO NA TELA: "O que mudou?"]
- Landing page com copy que converte
- WhatsApp bot que qualifica lead
- Dashboard que mostra o que importa

[TEXTO NA TELA: "Custo total da automação:"]
"Menos do que 1 mês da agência anterior."

[TEXTO NA TELA: "Resultados falam. ◼️"]`,
    visualNotes: "Prints reais de dashboards (mockados). Números crescendo com animação. Tom de case study mas formato reel. Preto e branco com dados coloridos. Profissional mas acessível.",
    voiceoverText: null,
    duration: 30,
    status: "draft",
    feedback: null,
  },
];

// Generate sample scripts for API calls — returns 3 variants for a brand × pillar combination
export function getSampleScripts(brandId: string, pillarId: string): Omit<Script, "id" | "createdAt" | "updatedAt">[] {
  const matching = sampleScripts.filter(
    (s) => s.brandId === brandId && s.pillarId === pillarId
  );
  if (matching.length >= 3) return matching.slice(0, 3);

  // Pad with other scripts from same brand
  const brandMatch = sampleScripts.filter((s) => s.brandId === brandId && !matching.includes(s));
  const combined = [...matching, ...brandMatch];
  if (combined.length >= 3) return combined.slice(0, 3);

  // Pad with pillar matches
  const pillarMatch = sampleScripts.filter((s) => s.pillarId === pillarId && !combined.includes(s));
  const all = [...combined, ...pillarMatch];
  if (all.length >= 3) return all.slice(0, 3);

  return [...all, ...sampleScripts.filter((s) => !all.includes(s))].slice(0, 3);
}
