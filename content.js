/* Conteúdo de referência: proposta OCT-178840, Carta Benefício Club Med, normas da
   paróquia de Trancoso e pesquisa (outubro de 2026). Os registros do casal ficam no aparelho. */

const DEFAULTS = {
  nomes:'Talita & David', data:'2028-07-14', hora:'20:00', cerimoniaHora:'',
  igreja:'Igreja São João Batista · Quadrado', local:'Chez Bisutti Trancoso', convidados:225,
  reuniao:'2026-11-06', reuniaoHora:'13:30', reuniaoFesta:'',
  civilData:'', civilCartorio:'', contrato:'', reuniaoClubMed:'', meta:0,
  propostaValidade:'2026-10-26',
  simHosp:150, simNoites:3, simDlx:20, simSup:989, simDlxV:1236, simExt:4, simBeauty:true, simEarly:true
};

const CATS = ['Igreja & cerimônia','Local & estrutura','Buffet','Bebidas','Decoração & flores','Som, luz & DJ','Equipe operacional','Assessoria','Fotografia','Filme','Vestido & acessórios','Traje do noivo','Beleza','Alianças','Música & banda','Cartório & documentos','Papelaria & convites','Bolo & doces','Lembranças & brindes','Hospedagem','Transporte','Lua de mel','Outros'];
const STATUS = {cotacao:['Cotação',''],negociando:['Negociando','warn'],fechado:['Fechado','ok'],descartado:['Descartado','crit']};
/* Cada frente é paga separadamente: a igreja não entra no contrato da festa. */
const FRENTES = [['festa','Festa · contrato Bisutti'],['porfora','Festa · por conta de vocês'],['igreja','Cerimônia · Igreja'],['civil','Civil · São Paulo'],['viagem','Hospedagem e transporte'],['noivos','Noivos'],['outros','Outros']];
const FRENTE_DE_CAT = {'Bolo & doces':'porfora','Lembranças & brindes':'porfora','Papelaria & convites':'porfora','Fotografia':'porfora','Filme':'porfora','Música & banda':'porfora','Igreja & cerimônia':'igreja','Cartório & documentos':'civil','Hospedagem':'viagem','Transporte':'viagem','Lua de mel':'viagem','Vestido & acessórios':'noivos','Traje do noivo':'noivos','Beleza':'noivos','Alianças':'noivos'};
const frenteOf = r => r.frente || FRENTE_DE_CAT[r.categoria] || 'festa';

const PHASES = [
 {id:'p1',nome:'Base do projeto',de:21,ate:18,tasks:[
  ['a01','Definir juntos o orçamento total e quem contribui','Anote a meta em Ajustes. A proposta da Bisutti sozinha soma R$ 410.260,23.'],
  ['a02','Fazer a lista prévia de convidados (A e B)','A proposta usa 225 pessoas, cerca de R$ 1.823 por convidado só na festa.'],
  ['a03','Reunião sobre a cerimônia na igreja (06/11/2026, 13h30)','Abra a aba Reunião, pauta "Cerimônia na igreja". Comece dizendo que nenhum de vocês é católico.'],
  ['a13','Confirmar com a paróquia se a igreja celebra para um casal não católico','E em que formato. Peça a resposta por escrito (mensagem ou e-mail).'],
  ['a14','Conversar com o pastor da sua igreja','Se ele pode celebrar em Trancoso, sozinho ou junto com o padre, e quanto custam viagem e hospedagem dele.'],
  ['a04','Reservar a igreja quando a agenda de 2028 abrir (janeiro de 2027)','Informação que você conseguiu com a secretaria paroquial. Descubra o dia exato e o canal.'],
  ['a05','Pedir a proposta OCT-178840 reemitida','A validade venceu em 26/10/2026, e a proposta não bloqueia a data.'],
  ['a06','Manter a cerimônia na proposta da Bisutti até a igreja confirmar','Se a igreja não for possível, o Chez Bisutti já tem cerimônia prevista (36 bancos, altar, arco). Só peça para tirar depois da confirmação por escrito.'],
  ['a07','Ler o contrato da festa inteiro antes de assinar','Confira cancelamento, adiamento, reajuste até 2028, mínimo de convidados e cronograma de pagamento.'],
  ['a08','Assinar o contrato Bisutti e pagar o sinal','Só com tudo o que foi combinado escrito no contrato. Guarde os recibos.'],
  ['a09','Preencher e assinar a Carta Benefício Club Med','Os campos de nome e data do evento estão em branco.'],
  ['a10','Agendar a reunião de apresentação do Club Med','Para eventos a partir de 2028, ela acontece a partir de 90 dias após o contrato Bisutti.'],
  ['a11','Marcar o prazo de 120 dias após a reunião do Club Med','É o prazo para contratar o Pacote Especial nas condições da Carta Benefício.'],
  ['a12','Criar a pasta de documentos, separada por frente','Igreja, festa e civil têm contratos e pagamentos diferentes.']
 ]},
 {id:'p2',nome:'Fornecedores e documentos',de:18,ate:12,tasks:[
  ['b01','Fechar a fotografia (igreja e festa)','Contratação de vocês. Parceiros indicados: Marcos Mesquita, Rodolfo Santos, Produtora 7. Compare com outros.'],
  ['b02','Fechar o filme','Contratação de vocês. Parceiros indicados: Ateliê Filmes, Vinicius Credidio, Produtora 7.'],
  ['b03','Conferir a certidão de nascimento brasileira do David','Nascido na Escócia, ele precisa ter o registro consular de nascimento transcrito num cartório brasileiro. É o documento que o cartório de São Paulo vai pedir.'],
  ['b08','Definir quem celebra: padre, pastor ou os dois','Depende da resposta da paróquia.'],
  ['b05','Usar a Noite de Experiência Club Med','Cortesia para 2 pessoas após a reunião com o Club Med. Não vale em janeiro, julho nem feriados.'],
  ['b06','Começar a pesquisa de vestido','Igreja à tarde, festa à noite: pense na cauda, no véu e numa troca de look.'],
  ['b13','Conferir todas as peças do traje do David','Ele já tem o kilt. Veja se tem casaco e colete, sporran de gala, meias com flashes, ghillie brogues, alfinete do kilt, sgian-dubh, camisa e gravata ou gravata-borboleta.'],
  ['b07','Definir padrinhos e madrinhas','Eles vão viajar e pagar a própria hospedagem.'],
  ['b09','Decidir a música: DJ, banda e música da cerimônia','O DJ CX da festa está incluso. Banda e música da igreja são contratações de vocês.'],
  ['b10','Planejar a lua de mel fora de julho se quiserem o desconto Club Med','O desconto de 10% não vale em janeiro, julho, feriados, Natal e Ano Novo.'],
  ['b11','Ativar o site do casamento (cortesia Casar.com por 1 ano)','Ative por volta de julho de 2027 para cobrir até o casamento.'],
  ['b12','Montar o guia de viagem para os convidados','Voo para Porto Seguro, transfer, como reservar no Club Med e como ir da igreja para a festa.']
 ]},
 {id:'p3',nome:'Convidados avisados',de:12,ate:9,tasks:[
  ['c01','Enviar o save the date','Para casamento no destino, o recomendado é 9 a 12 meses antes, com o site já no ar. Pode ser digital ou fazer parte da papelaria.'],
  ['c02','Encomendar o vestido','Sob medida: no mínimo 8 meses antes. A primeira prova costuma ser 6 a 8 meses antes.'],
  ['c12','Encomendar ou alugar o que faltar no traje do David','Peças sob medida no Reino Unido podem levar de 7 a 14 semanas. Peça com folga.'],
  ['c03','Resolver o curso de noivos','A secretaria disse que é obrigatório. Pergunte se vale para vocês e se pode ser feito na sua igreja evangélica.'],
  ['c04','Degustação oficial e escolha do cardápio','4 canapés frios, 4 quentes, 2 cumbuquinhas, 2 entradas, 1 massa, 1 peixe, 1 carne, 1 risoto, 1 acompanhamento e 4 sobremesas.'],
  ['c05','Contratar bolo, doces finos e bem-casados','A Bisutti não fornece. A decoração já prevê mesa de doces, boleira de cobre e mesa de bem-casados. Confirme se a confeitaria de fora pode entrar e se há taxa.'],
  ['c06','Definir vinho e espumante do brinde','A proposta lista só Heineken e o bar de drinks.'],
  ['c07','Contratar a maquiadora','Pergunte se ela viaja, quanto cobra de deslocamento e se atende madrinhas e mães.'],
  ['c11','Contratar a profissional de cabelo','Confira se ela trabalha bem com a umidade e o vento de Trancoso.'],
  ['c09','Escolher as alianças',''],
  ['c10','Marcar a data do casamento civil em São Paulo','Antes de 14/07/2028. Anote em Ajustes para o app calcular a habilitação.']
 ]},
 {id:'p4',nome:'Detalhes e experiência',de:9,ate:6,tasks:[
  ['d02','Definir a decoração da cerimônia','Na igreja histórica, nada pode descaracterizar o interior nem a fachada.'],
  ['d03','Contratar a música da cerimônia','Coral, quarteto de cordas ou voz e violão. Confirme as regras de som com quem cede o espaço.'],
  ['d04','Cotar o transporte dos convidados','Vans da igreja para a festa e transfers do aeroporto de Porto Seguro. Empresas da região: Nativos Transfer e Welcome Trancoso.'],
  ['d05','Contratar a papelaria','Convites, menus, marcadores de lugar, sinalização e tags dos brindes. Não está na proposta da Bisutti.'],
  ['d15','Escolher as lembranças','A Bisutti não fornece. Pense em algo que viaje bem na mala dos convidados.'],
  ['d06','Lista de presentes',''],
  ['d07','Planejar o jantar pré-wedding no LUA (13/07/2028)','Cortesia na véspera, das 20h às 22h. Mínimo de 60 pessoas, até 150 sentadas.'],
  ['d08','Montar a programação dos convidados','Yoga das madrinhas, beach tênis, futebol dos padrinhos, passeio no Quadrado.'],
  ['d09','Criar o kit de boas-vindas','Abertura de porta cortesia com 40 apartamentos. Cada abertura extra custa R$ 15.'],
  ['d10','Definir as noites dos noivos e um possível upgrade para a Suíte Brisa','Só existe 1 Suíte Brisa e ela não é garantida.'],
  ['d11','Teste de maquiagem e penteado','Leve fotos do vestido, do decote e do véu. Fotografe o resultado com e sem flash.'],
  ['d13','Definir manicure e pedicure','Quem faz, onde e quando (o ideal é 1 a 2 dias antes).'],
  ['d14','Decidir se padrinhos também vão de kilt','Aluguel ou compra, num tartan que converse com o do David.'],
  ['d12','Começar o cronograma de pele, dentes e saúde','']
 ]},
 {id:'p5',nome:'Reta organizada',de:6,ate:3,tasks:[
  ['e01','Enviar os convites formais com pedido de confirmação','Em geral 2 a 3 meses antes.'],
  ['e02','Reunir os documentos que a igreja pedir','Depende do formato combinado com a paróquia.'],
  ['e03','Separar os documentos do civil com o cartório de São Paulo','O David usa os documentos brasileiros dele.'],
  ['e04','Primeira prova do vestido',''],
  ['e09','Prova do traje completo do David','O kilt deve bater no meio do joelho. Mande limpar e passar as pregas antes da viagem.'],
  ['e05','Sapatos e acessórios','O Quadrado tem gramado e chão irregular: salto bloco ou plataforma.'],
  ['e10','Definir horário e local da preparação da noiva','Beauty Center do Club Med, o quarto ou outro lugar. Conte o deslocamento até a igreja.'],
  ['e11','Confirmar deslocamento, hospedagem e refeições das profissionais de beleza','No Club Med: produção no quarto custa R$ 505 por profissional, e a refeição R$ 420. Confirme se profissionais de fora podem entrar.'],
  ['e06','Roupas de daminhas e pajens',''],
  ['e07','Fechar o transporte dos convidados',''],
  ['e12','Acompanhar quem já reservou hospedagem','Use a lista de Convidados. O Club Med não bloqueia quartos.'],
  ['e08','Confirmar os fornecedores externos com o Club Med','Só foto, filme e assessoria entram sem taxa, no máximo 10. Refeição de R$ 420 por pessoa.']
 ]},
 {id:'p6',nome:'Últimos acertos',de:3,ate:1,tasks:[
  ['f01','Dar entrada na habilitação no cartório de São Paulo','O certificado vale 90 dias, e o civil precisa acontecer dentro desse prazo. Conte a partir da data do civil.'],
  ['f02','Casamento civil em São Paulo',''],
  ['f03','Entregar a certidão do civil a quem celebrar, se pedirem',''],
  ['f04','Fechar o número final de convidados com a Bisutti',''],
  ['f05','Reservar o jantar no LUA com o Village (30 dias antes)',''],
  ['f06','Reservar o Beauty Center, se for usar','Privatização: 30 dias antes. Cadeira individual: 10 dias antes.'],
  ['f07','Fazer o mapa de mesas',''],
  ['f08','Montar o roteiro do dia com todos os horários','Preparação, saída para a igreja, cerimônia, fotos, vans e chegada à festa. Defina quem coordena a igreja, já que vocês não terão assessora.'],
  ['f09','Escrever os votos',''],
  ['f10','Segunda prova do vestido',''],
  ['f11','Contratar o early check-in dos noivos','Entrada às 9h por 50% da diária.']
 ]},
 {id:'p7',nome:'Último mês',de:1,ate:0.25,tasks:[
  ['g01','Prova final do vestido (1 a 2 semanas antes)',''],
  ['g07','Confirmar horários com maquiadora, cabeleireira e manicure',''],
  ['g02','Pagamentos finais: igreja, festa e demais fornecedores','Cada frente tem seu próprio pagamento.'],
  ['g03','Agendar a abertura de porta (7 dias úteis antes)',''],
  ['g04','Montar a mala dos noivos e o kit de emergência','Veja a lista no Guia.'],
  ['g08','Pôr o sgian-dubh do kilt na mala despachada','É uma faca: não pode ir na bagagem de mão.'],
  ['g05','Separar documentos, alianças e certidões',''],
  ['g06','Acompanhar a previsão do tempo e confirmar o plano B','Saída da igreja e trajeto até a festa.']
 ]},
 {id:'p8',nome:'Semana e o grande dia',de:0.25,ate:0,tasks:[
  ['h01','Viajar com folga (chegar pelo menos 2 dias antes)',''],
  ['h06','Manicure e pedicure',''],
  ['h02','Ensaio da cerimônia',''],
  ['h03','Jantar pré-wedding no LUA (13/07)',''],
  ['h04','Entregar o roteiro e os contatos para quem vai coordenar a igreja',''],
  ['h05','Descansar e comer bem no dia','']
 ]},
 {id:'p9',nome:'Depois do sim',de:0,ate:-2,tasks:[
  ['i01','Retirar a certidão de casamento no cartório de São Paulo',''],
  ['i02','Para usar no Reino Unido: apostilar e traduzir a certidão','O Reino Unido reconhece casamentos válidos no país onde aconteceram e não exige registro lá.'],
  ['i03','Atualizar documentos e passaportes, se houver mudança de nome',''],
  ['i04','Enviar os agradecimentos',''],
  ['i05','Avaliar os fornecedores',''],
  ['i06','Limpar e guardar o vestido e o kilt','']
 ]}
];

/* Pautas de reunião. [id, prioridade, pergunta, contexto] */
const PAUTAS = [
 {id:'cerimonia',nome:'Cerimônia na igreja',cfgData:'reuniao',cfgHora:'reuniaoHora',groups:[
  {g:'Nós não somos católicos',items:[
   ['c30',1,'Nenhum de nós é católico: eu sou evangélica e o David também não é católico. A igreja celebra o nosso casamento mesmo assim? Em que formato?','A Igreja Católica costuma celebrar o casamento quando pelo menos um dos noivos é católico. Para dois não católicos, depende da paróquia e do bispo.'],
   ['c31',1,'Um pastor evangélico pode celebrar dentro da igreja, sozinho ou junto com o padre?','As normas antigas da paróquia pedem que celebrante de fora seja padre católico.'],
   ['c32',1,'Se for possível, precisa de autorização do bispo? Quem pede e quanto tempo leva?',''],
   ['c33',1,'O curso de noivos vale para nós? Pode ser feito na minha igreja evangélica ou on-line?','Você confirmou com a secretaria que o curso é obrigatório.'],
   ['c34',0,'Que documentos pedem para um casal não católico? Aceitam a certidão de batismo da minha igreja?',''],
   ['c35',0,'Se a cerimônia não puder ser na igreja, podemos ao menos fazer fotos lá ou uma bênção rápida?','']
  ]},
  {g:'Reserva da igreja',items:[
   ['c01',1,'Em que dia de janeiro de 2027 a agenda de 2028 abre? Por onde se reserva e é por ordem de pedido?','Você já confirmou com a secretaria que as datas de 2028 abrem em janeiro de 2027.'],
   ['c03',1,'Qual é a contribuição para a igreja e como se paga? Há sinal na reserva? Ele é devolvido se cancelarmos?','Normas antigas da paróquia citavam 20% na reserva, que ficava com a igreja em caso de cancelamento.'],
   ['c04',1,'Quantas pessoas cabem sentadas na igreja? E em pé ou do lado de fora?','A lista prévia tem 225 convidados.'],
   ['c05',1,'Quanto tempo dura a cerimônia e qual é a tolerância de atraso?','Normas antigas: cerca de 20 minutos, e acima de 30 a cerimônia podia não acontecer.'],
   ['c06',0,'A contribuição tem recibo? O pagamento é direto com a paróquia, separado da festa?','']
  ]},
  {g:'Como será a cerimônia',items:[
   ['c10',0,'Pedem o casamento civil feito antes? Precisamos levar a certidão de São Paulo?','O civil será em São Paulo, antes de 14/07/2028.'],
   ['c14',0,'O que pode na decoração: flores, tapete, velas, arranjos na porta? Quem pode decorar?','A igreja não pode ser descaracterizada por dentro nem por fora.'],
   ['c15',0,'Que música é permitida: coral, cordas, som amplificado? A igreja tem som próprio?',''],
   ['c16',0,'Quais são as regras para fotógrafo e filmmaker (flash, altar, drone)?',''],
   ['c17',0,'Pode jogar pétalas ou arroz na saída?',''],
   ['c18',0,'Dá para fazer o ensaio na véspera? Em que horário?','O jantar no LUA é na véspera, às 20h.'],
   ['c19',0,'Se chover, onde os convidados esperam na saída?','Julho está entre os meses mais chuvosos de Trancoso.'],
   ['c36',0,'Alguém da igreja organiza a entrada e o cortejo no dia?','Vocês não terão assessora.']
  ]},
  {g:'Da igreja para a festa',items:[
   ['c20',1,'Que horário de cerimônia combina com a festa às 20h? Quanto tempo leva da igreja até o Chez Bisutti?','O sol se põe por volta de 17h18 em julho.'],
   ['c21',1,'Como os convidados chegam ao Quadrado e voltam para o Club Med? Vans podem parar perto da igreja?',''],
   ['c22',0,'Onde a noiva se arruma e como chega à igreja?','O Beauty Center fica no Club Med.']
  ]}
 ]},
 {id:'festa',nome:'Festa · Bisutti e Club Med',cfgData:'reuniaoFesta',groups:[
  {g:'Proposta e contrato',items:[
   ['q01',1,'A proposta venceu em 26/10/2026. Vocês reemitem com os mesmos valores? Até quando eles valem?',''],
   ['q02',1,'A partir de quando a data 14/07/2028 fica bloqueada para nós?','A proposta diz que a data pode ser vendida até o contrato ser fechado.'],
   ['q40',1,'Se a cerimônia for mesmo na igreja, quanto abate tirar a decoração da cerimônia, o rider de cerimônia externa e o carrinho de golfe? E se a igreja não der certo, a cerimônia pode ser no Chez Bisutti?','A decoração inclui 36 bancos, altar, arco e jardineiras. O rider custa R$ 3.300.'],
   ['q43',1,'Sem assessora, até onde vai o Concierge Bisutti? Alguém da Bisutti coordena a chegada dos convidados vindos da igreja?','O Concierge custa R$ 2.200 na proposta.'],
   ['q03',1,'Como fica o pagamento: sinal, quantas parcelas, quando quita? Há desconto à vista?',''],
   ['q04',1,'Os valores serão reajustados até 2028? Por qual índice e em que datas?',''],
   ['q05',1,'Quais as regras de cancelamento e de adiamento? Quanto de multa por prazo?',''],
   ['q06',1,'Qual o mínimo de convidados? Quanto custa cada convidado a mais ou a menos e até quando posso ajustar?',''],
   ['q07',0,'Taxa de serviço, impostos e ECAD estão dentro do total de R$ 410.260,23?','A cobrança do ECAD em festas de casamento é tema de disputa judicial.'],
   ['q08',0,'Quem é nosso contato único do contrato até o dia?','Uma avaliação pública do espaço cita falhas de comunicação.'],
   ['q09',0,'Posso ver fotos e vídeos de casamentos reais recentes nesse espaço, à noite e em julho?','']
  ]},
  {g:'Horário e chegada',items:[
   ['q10',1,'A festa começa às 20h. A que horas os convidados podem chegar vindos da igreja? Há coquetel de recepção?',''],
   ['q11',0,'Qual o horário de término? Quanto custa cada hora extra?','O gerador está previsto para 9 horas de evento.'],
   ['q12',0,'Dá para fazer fotos dos noivos na falésia entre a igreja e a festa?','O carrinho de golfe até a falésia está na proposta.'],
   ['q41',0,'A Bisutti Destinations indica transporte da igreja para a festa?','']
  ]},
  {g:'Gastronomia',items:[
   ['q17',1,'O cardápio se chama "Piemonte Franco Americano – Chez Lake – Julio Perinetto". Ele vale para Trancoso, com o mesmo chef?','Chez Lake aparece no título, mas o evento é no Chez Trancoso.'],
   ['q18',1,'Quando é a degustação oficial? Quantas pessoas podem ir? Tem custo?',''],
   ['q19',0,'Tem opções infantis, vegetarianas, veganas e sem glúten ou lactose?',''],
   ['q20',1,'Bolo, doces e bem-casados serão de fora. A confeitaria pode entrar? Há taxa? A mesa de doces e a boleira da decoração recebem esses itens? Vocês indicam alguém?','A Carta Benefício só libera fornecedores externos de foto, filme e assessoria.'],
   ['q44',0,'A Bisutti indica papelaria ou faz a impressão de menus e marcadores de mesa?',''],
   ['q45',0,'Transporte e hospedagem dos convidados ficam fora do contrato. O Concierge ajuda com transfers e reservas?','A proposta só inclui o carrinho de golfe da noiva.'],
   ['q21',0,'Posso trocar um prato depois de fechar o cardápio? Tem taxa?',''],
   ['q22',0,'Fotógrafo e filmmaker comem por conta de vocês ou pagamos R$ 420 por pessoa?','']
  ]},
  {g:'Bebidas',items:[
   ['q23',1,'Só vi Heineken e o bar de drinks. Tem vinho, espumante para o brinde e whisky? Posso levar bebida própria?',''],
   ['q24',0,'Quantos drinks do cardápio Eleven posso escolher? Tem opção sem álcool?','']
  ]},
  {g:'Decoração, som e luz',items:[
   ['q25',0,'Quando definimos a paleta com a Mariana Bassi? Quantas revisões o projeto tem?','A proposta diz "paleta de cores e estilo: a definir".'],
   ['q26',0,'Quais flores existem em julho no sul da Bahia? Quanto custa pedir uma flor específica?',''],
   ['q42',0,'A Mariana Bassi pode decorar também a igreja? Com preço separado?',''],
   ['q27',0,'O DJ faz reunião de repertório? Se quisermos banda, quanto custa rider e backline?',''],
   ['q28',0,'Podemos usar o painel de LED para vídeos e fotos?','']
  ]},
  {g:'Hospedagem Club Med',items:[
   ['q29',1,'As tarifas de R$ 989 e R$ 1.236 valem para julho de 2028, que é alta temporada? Podem mandar por escrito?','A carta diz "a partir de".'],
   ['q30',1,'"Até 40 diárias" no Pacote Especial são por pessoa ou por apartamento? E quem passar disso paga quanto?',''],
   ['q31',1,'Quando abrem as vendas de julho de 2028 para os convidados reservarem?','Não há bloqueio de quartos.'],
   ['q32',0,'Quantos quartos o resort tem e qual a ocupação esperada para essa semana?','Fontes de viagem falam em cerca de 250 quartos.'],
   ['q33',0,'Quanto custa o night-use para quem não estiver hospedado?',''],
   ['q34',0,'Como é calculado o "período de maior adesão" das noites de cortesia dos noivos?',''],
   ['q35',0,'Crianças pagam? A partir de que idade?',''],
   ['q36',0,'O desconto de 10% na lua de mel vale para agosto de 2028?','']
  ]},
  {g:'Logística e beleza',items:[
   ['q37',0,'Os parceiros Bisutti Destinations têm preço especial para transfer do aeroporto de Porto Seguro?',''],
   ['q38',0,'Os blocos do resort não têm elevador. Como fica a acessibilidade para idosos?',''],
   ['q39',0,'Posso trazer maquiadora e cabeleireira de fora? Elas contam nos 10 fornecedores externos?','']
  ]}
 ]}
];

const CONTACTS = [
 {g:'Igreja do Quadrado',items:[
  ['Paróquia São João Batista · Secretaria Paroquial','Reserva pelo formulário do site da paróquia','',"https://www.igrejasaojoaobatista.com.br/casamentos/"],
  ['O telefone que a secretaria te passou','Anote em Fornecedores › Paróquia São João Batista',''],
  ['Telefones citados em fontes antigas (podem ter mudado)','(73) 3668-1099 · (73) 9930-4183','']
 ]},
 {g:'Bisutti',items:[
  ['Tainara Almeida Faustino · consultora','(11) 99223-7878','tainara.faustino@bisutti.com.br'],
  ['Comercial Bisutti','','eventos@bisutti.com.br'],
  ['Administrativo e financeiro','','administrativofinanceiro@bisutti.com.br'],
  ['Jurídico','','juridico@bisutti.com.br'],
  ['Ouvidoria','','ouvidoria@bisutti.com.br']
 ]},
 {g:'Club Med',items:[
  ['Central de Eventos Sociais Club Med Brasil','(11) 2126-9600 · ramal 2','reservas.chezbisutti.br@clubmed.com'],
  ['Trancoso Beauty Center','(73) 99914-4816','']
 ]},
 {g:'Endereços',items:[
  ['Igreja São João Batista','Quadrado, Trancoso · Porto Seguro, BA',''],
  ['Chez Bisutti Trancoso','Estrada Municipal, Km 18, Fazenda Taipe s/n · Porto Seguro, BA','']
 ]}
];

const SOURCES = [
 ['Paróquia São João Batista · casamentos','https://www.igrejasaojoaobatista.com.br/casamentos/'],
 ['Paróquia São João Batista · curso de noivos','https://www.igrejasaojoaobatista.com.br/curso-de-noivos/'],
 ['Aleteia · noivo evangélico e casamento na Igreja Católica','https://pt.aleteia.org/2019/12/26/padre-meu-namorado-e-evangelico-podemos-nos-casar-na-igreja-catolica/'],
 ['Canção Nova · casar na Igreja com alguém não católico','https://formacao.cancaonova.com/relacionamento/casamento/posso-me-casar-na-igreja-com-alguem-nao-catolico/'],
 ['Vaticano · Código de Direito Canônico, cânones 1108 a 1123','https://www.vatican.va/archive/cod-iuris-canonici/esp/documents/cic_libro4_cann1108-1123_sp.html'],
 ['Casamentos.com.br · casamento ecumênico e inter-religioso','https://www.casamentos.com.br/artigos/casamento-ecumenico-e-inter-religioso--c5040'],
 ['MacGregor and MacDuff · traje escocês completo','https://macgregorandmacduff.co.uk/products/kilt-outfit-prince-charlie-jacket'],
 ['Glasgow Airport · viajar com o sgian-dubh','https://www.glasgowairport.com/blog/2024/tartan-army-travel-guide/'],
 ['Normas de casamento no Quadrado (página antiga)','http://www.igrejadoquadrado.com.br/casamentosnormas.html'],
 ['Constance Zahn · guia de casamento em Trancoso','https://www.constancezahn.com/guia-de-casamento-em-trancoso-o-que-voce-precisa-saber-e-opcoes-de-fornecedores/'],
 ['Eu Amo Trancoso · casamento em Trancoso','https://www.euamotrancoso.com.br/casamento-em-trancoso/'],
 ['Casamentos.com.br · dúvidas sobre casamento na Igreja Católica','https://www.casamentos.com.br/artigos/perguntas-frequentes-sobre-o-casamento-na-igreja-catolica--c5990'],
 ['Casamentos.com.br · o curso de noivos é obrigatório?','https://www.casamentos.com.br/artigos/o-curso-de-noivos-e-mesmo-obrigatorio--c5393'],
 ['CNJ · Resolução 155/2012 (transcrição de registros consulares)','https://atos.cnj.jus.br/atos/detalhar/57'],
 ['Âmbito Jurídico · documentos para casar no civil','https://ambitojuridico.com.br/documentos-necessarios-para-casar-no-civil/'],
 ['Wandsworth Council · getting married abroad (Reino Unido)','https://wandsworth.gov.uk/registration-services/marriage-and-civil-partnership/getting-married-abroad'],
 ['Surrey County Council · marriage overseas','https://www.surreycc.gov.uk/birth-death-and-ceremonies/ceremonies/other/overseas'],
 ['Climatempo · climatologia de Trancoso','https://www.climatempo.com.br/climatologia/58/trancoso-ba'],
 ['Melhores Destinos · quando ir a Trancoso','https://guia.melhoresdestinos.com.br/quando-ir-a-trancoso-224-2942-p.html'],
 ['Temperatura do Mar · pôr do sol em Porto Seguro','https://www.temperaturadomar.pt/america-do-sul/brasil/porto-seguro/weather.html'],
 ['Casamentos.com.br · Chez Bisutti Trancoso','https://www.casamentos.com.br/sitio-casamento/chez-bisutti-trancoso--e435988'],
 ['Casamentos.com.br · transporte para casamento em Trancoso','https://www.casamentos.com.br/carros-casamento/bahia/trancoso'],
 ['Procon Goiás · dicas para noivos','https://goias.gov.br/procon/confira-dicas-do-procon-goias-para-que-a-cerimonia-de-casamento-saia-como-planejado/'],
 ['Migalhas · STJ e ECAD em festa de casamento','https://www.migalhas.com.br/quentes/180096/ecad-pode-cobrar-direitos-autorais-em-festa-de-casamento-realizada-em-clube'],
 ['Casamentos.com.br · vestido sob medida','https://www.casamentos.com.br/artigos/o-que-toda-noiva-deve-saber-sobre-os-vestidos-de-noiva-a-medida--c5941'],
 ['Casamentos.com.br · dicas de degustação','https://www.casamentos.com.br/artigos/6-conselhos-para-a-degustacao-do-menu-do-casamento--c6004'],
 ['The Knot · 2027 Wedding Trends Report','https://www.theknot.com/content/new-wedding-trends'],
 ['The Knot · vestidos 2027 (NYBFW)','https://www.theknot.com/content/wedding-dress-trends'],
 ['Bridebook · Wedding Trends 2027','https://bridebook.com/uk/article/wedding-trends'],
 ['Pinterest · relatório de casamentos 2026','https://newsroom.pinterest.com/pt-br/news/wedding-trend-report-2026/'],
 ['Vistaprint · quando enviar o save the date','https://www.vistaprint.com/hub/when-to-send-save-the-dates'],
 ['Dicas de Viagem · Club Med Trancoso','https://www.dicasdeviagem.com/club-med-trancoso/']
];

const GUIDE = [
 ['Como o seu casamento está dividido',`<p>São três frentes, cada uma com contrato e pagamento próprios:</p><ul><li><b>Civil em São Paulo:</b> é o que vale na lei e acontece antes de 14/07/2028.</li><li><b>Cerimônia na Igreja São João Batista</b>, no Quadrado: tratada direto com a paróquia, com pagamento separado.</li><li><b>Festa no Chez Bisutti Trancoso</b>, dentro do Club Med: a Tainara cuida dessa parte.</li></ul><p><b>Com a Bisutti (Tainara):</b> espaço, buffet, bar, decoração da festa, som, luz e DJ, equipe e o Concierge. O jantar pré-wedding no LUA é cortesia do Club Med.</p><p><b>Por conta de vocês:</b> igreja e celebrante, fotografia, filme, música da cerimônia (e banda, se quiserem), vestido e acessórios, beleza da noiva, alianças, bolo, doces finos e bem-casados, lembranças, papelaria e convites, hospedagem e transporte dos convidados, e o civil. O David já tem o kilt.</p><p>Atenção: a Carta Benefício só libera fornecedores externos de foto, filme e assessoria. Para confeitaria, maquiadora e músicos, confirme a entrada com a Tainara e o Club Med.</p><p>Vocês não terão assessora por enquanto. Por isso o roteiro do dia e quem coordena a igreja ficam como tarefas no app.</p>`],
 ['Casar na Igreja do Quadrado',`<ul><li>A igreja é a Igreja São João Batista, do século XVII, no Quadrado. É católica e segue o Direito Canônico.</li><li><b>Reserva:</b> com a Secretaria Paroquial, pelo formulário do site da paróquia. Guias locais recomendam reservar com cerca de <b>1 ano e meio</b> de antecedência, porque ela é muito procurada.</li><li><b>Contribuição:</b> normas antigas da paróquia pediam 20% na reserva, que ficava com a igreja em caso de cancelamento. Um guia de 2016 citava R$ 4.000 de doação. Esses valores certamente mudaram: confirme.</li><li><b>Datas evitadas pela paróquia:</b> Semana Santa, 20 de janeiro, 3 de fevereiro e 15 a 24 de junho (festas do povoado). Julho não está na lista.</li><li><b>Pontualidade:</b> as normas antigas falavam em cerca de 20 minutos de tolerância e risco de a cerimônia não acontecer passados 30 minutos. Planeje a saída do Club Med com folga.</li><li><b>Decoração:</b> por ser igreja histórica, não se pode descaracterizar o interior nem a fachada.</li><li><b>Padre de fora:</b> é possível, mas ele precisa enviar à paróquia o comprovante de ordenação e de comunhão com a Igreja Católica.</li><li><b>Capacidade:</b> nenhuma fonte informa. Pergunte, porque a lista prévia tem 225 convidados.</li></ul><p class="muted small">As normas encontradas têm datas variadas. Confirme tudo com a Secretaria Paroquial.</p>`],
 ['Casal evangélico na Igreja do Quadrado',`<ul><li>A Igreja São João Batista é católica. Pelo Direito Canônico (cânon 1117), a forma católica de casamento é obrigatória só quando pelo menos um dos noivos é católico.</li><li>Na prática, a Igreja Católica costuma celebrar o casamento quando há um católico no casal. Para dois noivos que não são católicos, a resposta depende do padre da paróquia e do bispo. Relatos de casais mostram respostas diferentes de paróquia para paróquia.</li><li>As normas antigas desta paróquia pedem que um celebrante de fora seja padre católico. Isso sugere que um pastor celebrar sozinho ali pode não ser aceito. Pergunte.</li><li><b>O que você já confirmou:</b> as datas de 2028 abrem em janeiro de 2027, e o curso de noivos é obrigatório. Como a secretaria pode ter imaginado que vocês são católicos, conte logo na reunião que não são.</li></ul><p><b>Caminhos possíveis, em ordem:</b></p><ul><li><b>A:</b> a paróquia aceita uma celebração para vocês (padre, ou padre e pastor juntos). Peça a confirmação por escrito, com documentos e curso exigidos.</li><li><b>B:</b> a paróquia não celebra, mas permite fotos ou uma bênção rápida. A cerimônia com o seu pastor acontece em outro lugar.</li><li><b>C:</b> cerimônia evangélica com o seu pastor no próprio Chez Bisutti, que já tem cerimônia prevista na proposta (bancos, altar, arco e som). Por isso, não peça para tirar a cerimônia da proposta antes de ter a resposta da igreja.</li></ul><p class="muted small">Esta parte depende da decisão da paróquia. Leve as perguntas da pauta "Cerimônia na igreja".</p>`],
 ['Civil em São Paulo (com o David)',`<ul><li>O processo se chama <b>habilitação de casamento</b> e é feito no Cartório de Registro Civil da residência de um de vocês em São Paulo.</li><li>Depois da entrada, os proclamas ficam expostos por <b>15 dias</b>. Sem impugnação, o cartório emite o certificado, que vale <b>90 dias</b>. O civil precisa acontecer dentro desse prazo.</li><li><b>O David tem dupla cidadania.</b> Como brasileiro nascido na Escócia, o nascimento dele deve ter sido registrado no consulado e depois <b>transcrito num cartório brasileiro</b> (o 1º Ofício do domicílio dele ou o de Brasília). Com essa certidão brasileira, ele casa como qualquer brasileiro e não precisa de apostila nem de tradução.</li><li>Se o registro consular nunca foi transcrito, essa é a primeira providência. Se não houver registro consular, o caminho muda (documentos escoceses com apostila e tradução juramentada). Confirme com o cartório.</li><li>Documentos comuns: RG e CPF, certidão de nascimento atualizada, comprovante de residência e 2 testemunhas maiores de idade.</li><li><b>Regime de bens:</b> o padrão é comunhão parcial. Para outro regime, faça antes um pacto antenupcial num Tabelionato de Notas.</li><li><b>Para o Reino Unido:</b> o casamento válido no Brasil é reconhecido lá, e não há registro a fazer. Para usar a certidão em órgãos britânicos, apostile e traduza.</li></ul><p class="muted small">As regras variam por cartório. Confirme a lista com o cartório escolhido antes de dar entrada.</p>`],
 ['Por onde começar (a ordem das decisões)',`<ul><li><b>Orçamento e quem paga.</b> Sem isso nenhuma proposta pode ser avaliada.</li><li><b>Número de convidados.</b> Buffet, bebida e decoração são cobrados por pessoa.</li><li><b>Igreja e festa reservadas.</b> A agenda de 2028 da igreja abre em janeiro de 2027.</li><li><b>Foto e filme.</b> Os bons fecham agenda com mais de um ano.</li><li><b>Vestido.</b> Sob medida pede 8 meses ou mais.</li><li><b>Convidados avisados:</b> save the date de 9 a 12 meses antes.</li><li><b>Documentos:</b> curso de noivos, processo na paróquia, habilitação no cartório.</li><li><b>Detalhes:</b> cardápio, bolo, papelaria, música, beleza e lembranças.</li></ul>`],
 ['Casamento no destino: etiqueta com os convidados',`<ul><li><b>Save the date com 9 a 12 meses</b>, e só para quem com certeza será convidado.</li><li>Deixe o <b>site pronto antes</b>: como chegar a Porto Seguro, transfer, como reservar no Club Med, o horário da igreja e como ir da igreja para a festa.</li><li><b>Seja transparente sobre custos.</b> No Club Med cada convidado paga a própria hospedagem, e não há quartos bloqueados.</li><li>As condições especiais <b>só valem pelos canais oficiais</b> do Club Med. Reservas por agência não contam.</li><li>Convidados não hospedados só acessam o espaço do evento.</li><li>Ofereça transporte da igreja para a festa. Vans saindo do Quadrado evitam carros espalhados e atrasos.</li><li>O convite formal com confirmação sai de 2 a 3 meses antes.</li></ul>`],
 ['Clima e horário em Trancoso em julho',`<ul><li>Médias de julho: mínima perto de <b>19 °C</b>, máxima de <b>24 a 25 °C</b> e cerca de <b>69 mm</b> de chuva. Julho está entre os meses mais chuvosos, mas a chuva costuma vir em pancadas.</li><li>O sol se põe por volta de <b>17h18</b>. Uma cerimônia no fim da tarde aproveita a luz do Quadrado na saída da igreja.</li><li>À noite pode esfriar. Considere mangas, capa ou xale, e guarda-chuvas para a saída da igreja.</li><li>Julho é alta temporada: voos, transfers e balsa ficam cheios.</li></ul>`],
 ['Vestido de noiva: prazos e escolhas',`<ul><li><b>Prazos:</b> sob medida, encomende com 8 meses ou mais. A primeira prova costuma ser 6 a 8 meses antes, e a última de 1 a 2 semanas antes.</li><li><b>Igreja:</b> se a cerimônia for na igreja católica, pergunte se há regra de vestimenta (ombros cobertos, véu).</li><li><b>Quadrado:</b> o gramado e o chão irregular pedem cauda que dê para levantar ou destacar, e salto bloco.</li><li><b>Dois looks:</b> um para a igreja e um mais leve para a festa. Vestidos transformáveis estão em alta.</li><li><b>Viagem:</b> pergunte ao ateliê sobre capa de viagem e se o vestido pode ir na cabine.</li></ul>`],
 ['O kilt do David',`<p>O David já tem o kilt. Para casamento, o traje escocês completo costuma ter:</p><ul><li><b>Casaco e colete:</b> o Prince Charlie é o mais formal, usado à noite e em casamentos, com camisa social e gravata-borboleta. O Argyll é um pouco menos formal e combina com gravata comum.</li><li><b>Sporran</b> de gala com corrente, <b>alfinete do kilt</b>, <b>meias</b> com flashes e os sapatos <b>ghillie brogues</b>.</li><li><b>Sgian-dubh</b>, a pequena faca presa na meia. Ela não pode ir na bagagem de mão: vai na mala despachada.</li></ul><ul><li><b>Clima:</b> as noites de julho em Trancoso ficam entre 19 e 24 °C, temperatura confortável para um kilt de lã.</li><li><b>Cuidados:</b> mande limpar e passar as pregas antes da viagem. Leve o kilt numa capa, enrolado, e não dobrado nas pregas.</li><li><b>Padrinhos:</b> podem ir de kilt (aluguel ou compra) ou de terno claro de linho. Combine as cores com a paleta do casamento.</li><li>Peças compradas sob medida no Reino Unido podem levar de 7 a 14 semanas. Se faltar alguma, encomende com folga.</li></ul>`],
 ['Beleza da noiva: passo a passo',`<ul><li><b>6 a 12 meses antes:</b> dermatologista, dentista e cuidados com o cabelo.</li><li><b>9 a 12 meses antes:</b> contrate a maquiadora e a cabeleireira. Pergunte se viajam até Trancoso, quanto cobram de deslocamento, hospedagem e diária, e se atendem madrinhas e mães.</li><li><b>3 a 6 meses antes:</b> teste de maquiagem e penteado juntos, com fotos do vestido, do decote e do véu. Fotografe com e sem flash.</li><li><b>Horário e local da preparação:</b> conte de trás para a frente a partir da hora da igreja. Maquiagem e cabelo da noiva levam cerca de 3 horas, mais o tempo das madrinhas e o deslocamento.</li><li><b>No Club Med:</b> o Beauty Center pode ser privatizado (R$ 4.500, 8 cadeiras e 2 de manicure, 8 horas) ou alugado por cadeira (R$ 200 por 2 horas, das 10h às 18h). Produção no quarto só para noiva e mãe da noiva (R$ 505 por profissional). A refeição de cada profissional custa R$ 420. Confirme se profissionais de fora podem entrar.</li><li><b>Manicure e pedicure:</b> 1 a 2 dias antes. Pode ser no Beauty Center.</li><li><b>No dia:</b> maquiagem de longa duração e penteado preso ou semipreso por causa da umidade e do vento. Deixe um kit de retoque com uma madrinha.</li></ul>`],
 ['Como aproveitar uma degustação',`<ul><li>Marque no horário em que a comida será servida no casamento.</li><li>Prove tudo e anote na hora no app: cada um dá sua nota.</li><li>Observe temperatura, tempero, porção e apresentação.</li><li>Pergunte se dá para trocar pratos depois de fechar e se há taxa.</li><li>Fotografe cada prato.</li><li>Não feche nada na hora.</li></ul>`],
 ['Contratos: o que conferir antes de assinar',`<ul><li>Tudo o que foi combinado de boca precisa estar escrito. Nunca assine com campos em branco.</li><li>Multas de cancelamento e adiamento devem estar em destaque e ser proporcionais.</li><li>Confira convidados, preço por convidado extra, prazo para ajustar, horários, hora extra, reajuste e cronograma de pagamento.</li><li>Peça recibo de todo pagamento. Guarde os da igreja separados dos da festa.</li><li>Em caso de cláusula abusiva, o Procon pode orientar e mediar.</li></ul>`],
 ['Tendências para 2027 e 2028',`<ul><li><b>Beach club italiano</b> (The Knot: buscas subiram 315%). Combina com um aperitivo na chegada à festa.</li><li><b>Prata e tons frios</b> no lugar do dourado.</li><li><b>Cores:</b> merlot, ameixa, azul empoeirado e verde-musgo.</li><li><b>Instalações monoflorais</b>, uma única flor em grande volume. Pode ser uma boa solução para a igreja histórica, que não pode ser descaracterizada.</li><li><b>Aperitivo itinerante e comida interativa.</b></li><li><b>Casamentos de 3 dias:</b> jantar LUA, igreja e festa já formam um fim de semana.</li><li><b>Renda antiga e inspiração vitoriana</b>, que conversam com uma igreja do século XVII.</li><li><b>"Whimsy"</b> (Bridebook): detalhes pessoais, cartões escritos à mão.</li><li><b>Vestidos 2027:</b> minimalismo anos 90, laços e mangas longas.</li></ul>`],
 ['Kit de emergência do dia',`<ul><li>Agulha, linha nas cores do vestido, alfinetes e fita dupla face</li><li>Analgésico, antialérgico, curativos</li><li>Retoque de maquiagem, lenço, desodorante</li><li>Repelente e protetor solar</li><li>Rasteira, xale ou capa, guarda-chuva</li><li>Carregador, alianças, votos, documentos</li><li>Snacks e água para os noivos</li></ul>`]
];

/* Registros iniciais, carregados só na primeira abertura do app. */
const SEED = {
 config:{geral:{nomes:'Talita & David',data:'2028-07-14',hora:'20:00',convidados:225,local:'Chez Bisutti Trancoso',reuniao:'2026-11-06',reuniaoHora:'13:30'}},
 orcamentos:{
  'oct-locacao':{frente:'festa',categoria:'Local & estrutura',fornecedor:'Bisutti · Chez Bisutti Trancoso',descricao:'Locação do espaço (até 280 sentados), carrinho de golfe, diesel do gerador 9 h, gerador full time, painel de LED',valor:46016.30,status:'negociando',pago:0,notas:'Proposta OCT-178840 de 24/10/2026, validade 26/10/2026'},
  'oct-som':{frente:'festa',categoria:'Som, luz & DJ',fornecedor:'Bisutti · Chez Bisutti Trancoso',descricao:'Equipamentos de sonorização (som e luz de pista fixos)',valor:3300,status:'negociando',pago:0,notas:'Proposta OCT-178840'},
  'oct-diversos':{frente:'festa',categoria:'Som, luz & DJ',fornecedor:'Bisutti · Chez Bisutti Trancoso',descricao:'Rider para cerimônia externa (mesa de áudio, microfone, 2 caixas, técnico)',valor:3300,status:'negociando',pago:0,notas:'Proposta OCT-178840. A cerimônia será na igreja: pedir para retirar.'},
  'oct-concierge':{frente:'festa',categoria:'Assessoria',fornecedor:'Bisutti · Concierge Destinations',descricao:'Concierge Bisutti: atendimento dedicado, gestão de prazos, orientação de hospedagem e transporte',valor:2200,status:'negociando',pago:0,notas:'Proposta OCT-178840'},
  'oct-brigada':{frente:'festa',categoria:'Equipe operacional',fornecedor:'Bisutti · Chez Bisutti Trancoso',descricao:'Brigada: 2 porteiros, 2 recepcionistas, 4 limpeza, 1 manutenção, 1 garçom sombra, 2 produtores, 1 bombeiro',valor:24750,status:'negociando',pago:0,notas:'Proposta OCT-178840'},
  'oct-cx':{frente:'festa',categoria:'Som, luz & DJ',fornecedor:'Bisutti · CX',descricao:'DJ CX completo: DJ, house DJ, controladora, palco 8 × 3 m, monitor',valor:9900,status:'negociando',pago:0,notas:'Proposta OCT-178840'},
  'oct-decor':{frente:'festa',categoria:'Decoração & flores',fornecedor:'Bisutti · Mariana Bassi',descricao:'Decoração completa com cerimônia: mesas, café, buffet, doces, bar, bem-casados, lounges, 36 bancos, arco, iluminação cênica',valor:106380.18,status:'negociando',pago:0,notas:'Proposta OCT-178840. A cerimônia será na igreja: pedir o abatimento da parte de cerimônia.'},
  'oct-buffet':{frente:'festa',categoria:'Buffet',fornecedor:'Bisutti · Julio Perinetto',descricao:'Cardápio Piemonte Franco Americano: coquetel 1h30, buffet 4h, sobremesas 2h, ilha gourmet 2h30, mesa de saída, sucos',valor:148747.50,status:'negociando',pago:0,notas:'Proposta OCT-178840. Cerca de R$ 661,10 por convidado'},
  'oct-bebidas':{frente:'festa',categoria:'Bebidas',fornecedor:'Bisutti · Eleven Bar',descricao:'Open bar com bar de drinks Eleven e cerveja Heineken 600 ml',valor:65666.25,status:'negociando',pago:0,notas:'Proposta OCT-178840. Sem vinho e espumante listados'},
  'igr-contrib':{frente:'igreja',categoria:'Igreja & cerimônia',fornecedor:'Paróquia São João Batista',descricao:'Contribuição para a cerimônia na Igreja do Quadrado',valor:0,status:'cotacao',pago:0,notas:'A cotar na reunião de 06/11. Referências antigas: R$ 4.000 (2016) e 20% na reserva, não devolvidos em cancelamento.'},
  'igr-decor':{frente:'igreja',categoria:'Decoração & flores',fornecedor:'A definir',descricao:'Decoração da igreja (respeitando as regras da igreja histórica)',valor:0,status:'cotacao',pago:0,notas:'A cotar'},
  'igr-musica':{frente:'igreja',categoria:'Música & banda',fornecedor:'A definir',descricao:'Música da cerimônia (coral, cordas ou voz e violão)',valor:0,status:'cotacao',pago:0,notas:'A cotar'},
  'igr-transp':{frente:'viagem',categoria:'Transporte',fornecedor:'A definir',descricao:'Vans da igreja para a festa (225 convidados)',valor:0,status:'cotacao',pago:0,notas:'A cotar. Empresas da região: Nativos Transfer, Welcome Trancoso.'},
  'pf-bolo':{frente:'porfora',categoria:'Bolo & doces',fornecedor:'A definir',descricao:'Bolo de casamento',valor:0,status:'cotacao',pago:0,notas:'A Bisutti não fornece. Confirmar entrada de fornecedor externo.'},
  'pf-doces':{frente:'porfora',categoria:'Bolo & doces',fornecedor:'A definir',descricao:'Doces finos',valor:0,status:'cotacao',pago:0,notas:'A Bisutti não fornece.'},
  'pf-bemcasados':{frente:'porfora',categoria:'Bolo & doces',fornecedor:'A definir',descricao:'Bem-casados',valor:0,status:'cotacao',pago:0,notas:'A Bisutti não fornece.'},
  'pf-lembrancas':{frente:'porfora',categoria:'Lembranças & brindes',fornecedor:'A definir',descricao:'Lembranças e kit de boas-vindas',valor:0,status:'cotacao',pago:0,notas:'A Bisutti não fornece.'},
  'pf-papelaria':{frente:'porfora',categoria:'Papelaria & convites',fornecedor:'A definir',descricao:'Save the date, convites, menus, marcadores e sinalização',valor:0,status:'cotacao',pago:0,notas:'Não está na proposta da Bisutti.'},
  'pf-foto':{frente:'porfora',categoria:'Fotografia',fornecedor:'A definir',descricao:'Fotografia da igreja e da festa',valor:0,status:'cotacao',pago:0,notas:'Parceiros Bisutti com preço especial: Marcos Mesquita, Rodolfo Santos, Produtora 7.'},
  'pf-filme':{frente:'porfora',categoria:'Filme',fornecedor:'A definir',descricao:'Filme da igreja e da festa',valor:0,status:'cotacao',pago:0,notas:'Parceiros Bisutti: Ateliê Filmes, Vinicius Credidio, Produtora 7.'},
  'nv-make':{frente:'noivos',categoria:'Beleza',fornecedor:'A definir',descricao:'Maquiadora (com teste)',valor:0,status:'cotacao',pago:0,notas:'Incluir deslocamento, hospedagem e refeição.'},
  'nv-cabelo':{frente:'noivos',categoria:'Beleza',fornecedor:'A definir',descricao:'Cabeleireira (com teste)',valor:0,status:'cotacao',pago:0,notas:'Incluir deslocamento, hospedagem e refeição.'},
  'nv-manicure':{frente:'noivos',categoria:'Beleza',fornecedor:'A definir',descricao:'Manicure e pedicure',valor:0,status:'cotacao',pago:0,notas:''},
  'nv-vestido':{frente:'noivos',categoria:'Vestido & acessórios',fornecedor:'A definir',descricao:'Vestido, véu, sapatos e acessórios',valor:0,status:'cotacao',pago:0,notas:''},
  'vg-transfer':{frente:'viagem',categoria:'Transporte',fornecedor:'A definir',descricao:'Transfers do aeroporto de Porto Seguro para os convidados',valor:0,status:'cotacao',pago:0,notas:'Decida se vocês pagam ou só indicam.'},
  'civ-cartorio':{frente:'civil',categoria:'Cartório & documentos',fornecedor:'Cartório de Registro Civil · São Paulo',descricao:'Habilitação e casamento civil',valor:0,status:'cotacao',pago:0,notas:'A cotar com o cartório'}
 },
 fornecedores:{
  'paroquia':{nome:'Paróquia São João Batista (Igreja do Quadrado)',categoria:'Igreja & cerimônia',status:'contato',pros:'Igreja histórica no Quadrado de Trancoso',contras:'Muito disputada; regras rígidas de horário e decoração'},
  'bisutti':{nome:'Chez Bisutti Trancoso',categoria:'Local & estrutura',status:'visitado',contato:'Tainara Almeida Faustino · (11) 99223-7878',instagram:'@bisuttioficial',pros:'Vista para as falésias, estrutura de madeira com pé-direito de 6 a 8 m, pacote completo',contras:'Hospedagem sem bloqueio de quartos; proposta vencida em 26/10/2026'},
  'clubmed':{nome:'Club Med Trancoso · Eventos Sociais',categoria:'Hospedagem',status:'contato',contato:'(11) 2126-9600 ramal 2 · reservas.chezbisutti.br@clubmed.com'},
  'mariana-bassi':{nome:'Mariana Bassi',categoria:'Decoração & flores',status:'contato',pros:'Decoração da proposta Bisutti'},
  'beauty-center':{nome:'Trancoso Beauty Center',categoria:'Beleza',status:'pesquisar',contato:'(73) 99914-4816'},
  'produtora7':{nome:'Produtora 7',categoria:'Fotografia',status:'pesquisar',instagram:'@produtora7',pros:'Parceiro Bisutti'},
  'marcos-mesquita':{nome:'Marcos Mesquita',categoria:'Fotografia',status:'pesquisar',instagram:'@marcosmesquitafotografia',pros:'Parceiro Bisutti'},
  'rodolfo-santos':{nome:'Rodolfo Santos',categoria:'Fotografia',status:'pesquisar',instagram:'@rodolfosantosfotografo',pros:'Parceiro Bisutti'},
  'atelie-filmes':{nome:'Ateliê Filmes',categoria:'Filme',status:'pesquisar',instagram:'@ateliefilmes',pros:'Parceiro Bisutti'},
  'vinicius-credidio':{nome:'Vinicius Credidio',categoria:'Filme',status:'pesquisar',instagram:'@viniciuscredidiofilms',pros:'Parceiro Bisutti'},
  'nativos':{nome:'Nativos Transfer',categoria:'Transporte',status:'pesquisar',pros:'Especialista em transporte para casamentos em Trancoso (SUVs e vans). Pede 30 dias de antecedência.'},
  'welcome':{nome:'Welcome Trancoso',categoria:'Transporte',status:'pesquisar',pros:'Frota de 15 vans e 20 carros. Pede 15 dias de antecedência, mínimo de 24 horas de locação.'}
 }
};

Object.assign(IC, {
 church:'<path d="M12 2v4M10 4h4M6 21V11l6-5 6 5v10M3 21h18M10 21v-4a2 2 0 0 1 4 0v4"/>',
 share:'<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>',
 offline:'<path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5M5 12.9a10 10 0 0 1 3.3-1.9M19 12.9a10 10 0 0 0-2.4-1.6M8.5 16.4a5 5 0 0 1 5.7-.8M12 20h.01M3 3l18 18"/>'
});
