const SAFE_STORAGE = {
  get(key){ try { return window.localStorage?.getItem(key) || null; } catch { return null; } },
  set(key,value){ try { window.localStorage?.setItem(key,value); } catch {} }
};
const SAVED_LANG = String(SAFE_STORAGE.get('implacavel:lang') || 'PT').toUpperCase();
const INITIAL_LANG = SAVED_LANG === 'EN' ? 'EN' : 'PT';
const state = {
  lang: INITIAL_LANG,
  openPillar: 'p1',
  typingTimer: null,
  wordIndex: 0,
  chatOpen: false,
  chatTurns: 0,
  chatTopic: '',
  chatFlow: null,
  chatLead: {},
  chatHistory: [],
  chatBusy: false,
  chatContext: { topic: '', stage: 'intro', captured: {} }, chatResponseLang: INITIAL_LANG,
  terminalTab: 'core',
  terminalOutput: [],
  interactions: [],
  theme: SAFE_STORAGE.get('implacavel:theme') === 'light' ? 'light' : 'dark',
};

/* ==================== CONFIGURAÇÕES EXTERNAS / PREENCHER NO FUTURO ==================== */
/*
  CAMPOS VAZIOS ABAIXO SÃO OPCIONAIS E O SITE CONTINUA FUNCIONANDO SEM ELES.
  PREENCHA SOMENTE QUANDO TIVER OS DADOS OFICIAIS DA EMPRESA.
*/
const CONFIG = Object.assign({
  whatsapp: '',           // PREENCHER COM O NÚMERO OFICIAL DO WHATSAPP.
  formEndpoint: '',      // PREENCHER COM O ENDPOINT REAL DO FORMULÁRIO, SE EXISTIR.
  companyEmail: '',      // PREENCHER COM O E-MAIL OFICIAL DA EMPRESA, SE FOR UTILIZADO.
  aiEndpoint: '',        // PREENCHER COM O ENDPOINT DA IA REAL, SE FOR CONECTADA.
  socials: { instagram: 'https://www.instagram.com/implacavel.mkt/', github: '', facebook: '', linkedin: '' }
  // PREENCHER GITHUB, FACEBOOK E LINKEDIN QUANDO OS LINKS OFICIAIS ESTIVEREM DEFINIDOS.
}, window.IMPLACAVEL_CONFIG || {});

const CHAT_VARIANTS = {
  PT: {
    greeting: [
      'Oi. 👋 Seja bem-vindo à IMPLACÁVEL. Pode falar comigo normalmente. O que você está tentando destravar agora?',
      'Olá. 👋 Bom ter você por aqui. Me conta o cenário como ele é e eu te mostro onde a IMPLACÁVEL pode entrar.',
      'E aí. 👋 Vamos direto ao ponto: vender mais, organizar a operação, usar melhor os dados ou construir tecnologia?'
    ],
    fallback: [
      'Entendi. Para eu te direcionar sem te enfiar numa resposta de robô, me diz uma coisa: o gargalo está em vendas, operação, dados ou tecnologia?',
      'Faz sentido. Me dá mais um pouco de contexto. O que está travando hoje: aquisição, conversão, processos, dados ou sistemas?',
      'Certo. Vamos por partes. O que você quer resolver primeiro? A partir disso eu te mostro a frente mais próxima.'
    ]
  },
  EN: {
    greeting: [
      'Hi. 👋 Welcome to IMPLACÁVEL. Talk to me naturally. What are you trying to unlock right now?',
      'Hello. 👋 Good to have you here. Tell me the real scenario and I will point to where IMPLACÁVEL can help.',
      'Hey. 👋 Let’s get practical: more sales, a cleaner operation, better data, or technology?'
    ],
    fallback: [
      'Got it. To avoid a robotic answer, tell me where the bottleneck is: sales, operations, data, or technology?',
      'Makes sense. Give me a little more context. Is the issue acquisition, conversion, processes, data, or systems?',
      'Sure. Let’s take it one step at a time. What do you want to solve first?'
    ]
  }
};

const nav = {
  PT: [
    ['home','INÍCIO'],['about','SOBRE'],['solutions','SOLUÇÕES'],['pillars','PILARES'],
    ['technology','TECNOLOGIA'],['cases','CASES'],['team','EQUIPE'],['contact','CONTATO']
  ],
  EN: [
    ['home','HOME'],['about','ABOUT'],['solutions','SOLUTIONS'],['pillars','PILLARS'],
    ['technology','TECHNOLOGY'],['cases','CASES'],['team','TEAM'],['contact','CONTACT']
  ]
};

const words = {
  PT: ['Estratégia','Growth','Tecnologia','Performance'],
  EN: ['Strategy','Growth','Technology','Performance']
};

const copy = {
  PT: {
    hero: {
      eyebrow:'GROWTH · INTELIGÊNCIA DE NEGÓCIOS · SOLUÇÕES B2B',
      before:'Inteligência implacável em', after:'para quem governa o mercado.',
      lead:'Assessoria de Growth, Inteligência de Negócios (BI) e Soluções Estratégicas B2B. Estratégia, tecnologia e performance integradas em uma operação Mid/High-Ticket — fee fixo e variável sobre resultado.',
      primary:'INICIAR PROJETO →', secondary:'CONHECER SOLUÇÕES', badge:'MID/HIGH-TICKET · FEE FIXO + PERFORMANCE', bottom:'ROLE PARA EXPLORAR ↓'
    },
    about:{eyebrow:'POSICIONAMENTO',num:'02',title:'Quem é a IMPLACÁVEL.',body:'Uma assessoria multidisciplinar que conecta crescimento, gestão, dados e tecnologia. A proposta é simples: transformar estratégia em rotina operacional, com responsáveis claros e indicadores que orientam a próxima decisão.'},
    pillars:{eyebrow:'ARQUITETURA OPERACIONAL',num:'03',title:'Quatro pilares. Uma operação.',body:'Quatro disciplinas complementares para acompanhar o negócio de ponta a ponta: aquisição, marca e experiência, gestão e dados, tecnologia e infraestrutura.'},
    solutions:{eyebrow:'O QUE ENTREGAMOS',num:'04',title:'Soluções integradas.',body:'Serviços organizados por problema de negócio, não por moda de ferramenta. Cada frente tem escopo claro e pode ser combinada conforme a operação exigir.'},
    tech:{eyebrow:'CAPACIDADE TÉCNICA',num:'05',title:'Tecnologia que sustenta o negócio.',body:'Backend, sistemas, integrações, automações e segurança aplicados ao processo real da empresa, com arquitetura pensada para manutenção e escala.'},
    cases:{eyebrow:'LEITURA EXECUTIVA',num:'06',title:'Dados que comandam a operação.',body:'Indicadores organizados para revelar gargalos, acompanhar eficiência e orientar decisões. O painel é consequência do diagnóstico, não enfeite.'},
    traffic:{eyebrow:'PERFORMANCE',num:'07',title:'Mídia paga conectada ao resultado.',body:'Planejamento, execução e leitura de campanhas com o restante da operação no mesmo raciocínio: investimento, conversão, eficiência e retorno.'},
    operation:{eyebrow:'OPERAÇÃO',num:'09',title:'Do primeiro clique ao backoffice.',body:'Aquisição, conversão, atendimento, e-commerce, processos, financeiro e tecnologia conectados para a operação não quebrar entre uma etapa e outra.'},
    process:{eyebrow:'MÉTODO',num:'11',title:'Um método, cinco etapas.',body:'Diagnóstico, desenho, execução, otimização e escala. A cada etapa, uma decisão mais clara e uma operação menos dependente de improviso.'},
    team:{eyebrow:'GOVERNANÇA',num:'10',title:'As pessoas por trás da operação.',body:'Raphael, Victor, Wadson e Fabiano em frentes complementares, com espaço para mostrar os retratos, responsabilidades e especialidades de cada fundador.'},
    contact:{eyebrow:'CONTATO',title:'Vamos transformar estratégia em operação.',body:'Conte o contexto, o gargalo e o objetivo. A primeira conversa deve terminar com um próximo passo claro, não com uma apresentação genérica.'},
    stack:{eyebrow:'STACK OPERACIONAL',num:'12',title:'Tecnologia, criatividade e operação no mesmo ecossistema.',body:'Uma base essencial de linguagens, sistemas, dados, design, mídia e automação. A escolha varia conforme o problema e a etapa da operação.'}
  },
  EN: {
    hero:{eyebrow:'GROWTH · BUSINESS INTELLIGENCE · B2B SOLUTIONS',before:'Relentless intelligence in',after:'for those who lead their market.',lead:'Growth, Business Intelligence (BI) and strategic B2B solutions advisory. Strategy, technology and performance integrated into one Mid/High-Ticket operation — fixed fee plus performance-based variable.',primary:'START A PROJECT →',secondary:'EXPLORE SOLUTIONS',badge:'MID/HIGH-TICKET · FIXED FEE + PERFORMANCE',bottom:'SCROLL TO EXPLORE ↓'},
    about:{eyebrow:'POSITIONING',num:'02',title:'Who is IMPLACÁVEL.',body:'IMPLACÁVEL is a Growth, Business Intelligence (BI) and strategic B2B solutions advisory. A lean, multidisciplinary, outcome-driven operation — technical depth and disciplined execution.'},
    pillars:{eyebrow:'OPERATING ARCHITECTURE',num:'03',title:'Four pillars. One operation.',body:'IMPLACÁVEL structures delivery across four integrated fronts — from strategy to code, from traffic to closing.'},
    solutions:{eyebrow:'WHAT WE DELIVER',num:'04',title:'Integrated solutions.',body:'A service architecture built on the four pillars — no loose capabilities, no empty promises.'},
    tech:{eyebrow:'TECHNICAL CAPACITY',num:'05',title:'Technology as business infrastructure.',body:'Not startup aesthetics: engineering in service of the operation.'},
    cases:{eyebrow:'PROOF IN NUMBERS',num:'06',title:'Data that commands the operation.',body:'Dashboards, funnels and indicators that turn information into decisions — and decisions into results.'},
    traffic:{eyebrow:'PERFORMANCE',num:'07',title:'Traffic management with business vision.',body:'Executive reading of campaigns: investment, scale, efficiency and return in the same panel.'},
    operation:{eyebrow:'OPERATIONS',num:'09',title:'An operation designed from front to backoffice.',body:'Commercial strategy, e-commerce, processes and systems operating within the same decision logic.'},
    process:{eyebrow:'METHOD',num:'11',title:'One method, five stages.',body:'A workflow designed for progression — each stage introduces the next.'},
    team:{eyebrow:'GOVERNANCE',num:'10',title:'The structure behind the operation.',body:'Four executives, surgical roles and zero corporate fatigue.'},
    contact:{eyebrow:'CONTACT',title:'Let’s turn strategy into operation.',body:'Tell us your challenge. We will respond with clarity and direction — no empty promises.'},
    stack:{eyebrow:'OPERATIONAL STACK',num:'12',title:'Technology, creativity and operations in one ecosystem.',body:'An essential base of languages, systems, data, design, media and automation. The choice varies with the problem and the operational stage.'}
  }
};

const pillars = {
  PT:[
    ['p1','Growth, Performance & Gestão de E-commerce','RAPHAEL · VICTOR · FABIANO · WADSON','Unificação da estratégia de tráfego pago, análise de dados e infraestrutura comercial para lojas online.',['Tráfego pago e funis de conversão','Gestão avançada de plataforma de e-commerce','Logística e notas fiscais','Extração e leitura de métricas']],
    ['p2','Branding, UX & Direção de Arte','RAPHAEL · FABIANO · WADSON','Posicionamento visual corporativo, design digital e modelagem 3D com padrão de qualidade premium.',['Concepção de marca e diretrizes estéticas','Design digital e UX/UI','Modelagem 3D (Blender)','IA Generativa para ativos visuais e textos']],
    ['p3','Consultoria de Gestão, BI & Administrativo','VICTOR · FABIANO · WADSON','Saúde financeira, estruturação de DRE, fechamento de mês e inteligência de dados para decisões.',['Consultoria de processos','Auditoria e estruturação de DRE','Fechamento de mês e administrativo','Dashboards de BI']],
    ['p4','Infraestrutura Tecnológica, Sistemas & Criptografia','FABIANO','Desenvolvimento de software de alta performance e segurança de dados corporativos.',['Backend em Java, Kotlin e Python','Automação de processos','Sistemas estruturados e encapsulados','Criptografia e segurança cibernética']]
  ],
  EN:[
    ['p1','Growth, Performance & E-commerce Management','RAPHAEL · VICTOR · FABIANO · WADSON','Unified paid-traffic strategy, data analysis and commercial infrastructure for online stores.',['Paid traffic and conversion funnels','Advanced e-commerce platform management','Logistics and tax invoices','Metrics extraction and reading']],
    ['p2','Branding, UX & Art Direction','RAPHAEL · FABIANO · WADSON','Corporate visual positioning, digital design and 3D modeling with a premium quality standard.',['Brand conception and aesthetic guidelines','Digital design and UX/UI','3D modeling (Blender)','Generative AI for visual assets and copy']],
    ['p3','Management Consulting, BI & Backoffice','VICTOR · FABIANO · WADSON','Financial health, P&L structuring, month-end closing and data intelligence for decisions.',['Process consulting','P&L auditing and structuring','Month-end and administrative closing','BI dashboards']],
    ['p4','Technology Infrastructure, Systems & Cryptography','FABIANO','High-performance software development and corporate data security.',['Backend in Java, Kotlin and Python','Process automation','Structured, encapsulated systems','Cryptography and cybersecurity']]
  ]
};

const services={
  PT:[
    ['c1','Growth & Performance',['Tráfego pago e mídia','Funis, CRO e conversão','Otimização orientada a resultado']],
    ['c2','Marketing & Conteúdo',['Copy B2B e ofertas','Conteúdo estratégico','Criativos com IA Generativa']],
    ['c3','E-commerce & Logística',['Plataforma e catálogo','Fluxo logístico e backoffice','Emissão e organização fiscal']],
    ['c4','BI & Inteligência de Dados',['Dashboards executivos','KPIs, DRE e indicadores','Estruturação e leitura de dados']],
    ['c5','Branding & Direção de Arte',['Posicionamento visual','UX/UI e interfaces','Direção criativa e ativos 3D']],
    ['c6','Estratégia Digital',['Arquitetura de jornadas','Experiência e conversão','Design systems e governança']],
    ['c7','Automação & IA',['Workflows e automações','Agentes e copilotos','Integrações entre ferramentas']],
    ['c8','Software & Sistemas',['Backend Java/Kotlin/Python','Sistemas sob medida','APIs e integrações']],
    ['c9','Infraestrutura & Segurança',['Segurança da informação','Infraestrutura tecnológica','Governança e continuidade']],
    ['c10','Consultoria de Gestão',['Processos e organização','Auditoria de DRE','Plano de ação executivo']],
    ['c11','CRM & RevOps',['Pipeline e rotinas comerciais','Automação de follow-up','Indicadores de conversão']],
    ['c12','Analytics & CRO',['Experimentação orientada por dados','Mapeamento de jornada','Otimização contínua']]
  ],
  EN:[
    ['c1','Growth & Performance',['Paid media and traffic','Funnels, CRO and conversion','Outcome-oriented optimization']],
    ['c2','Marketing & Content',['B2B copy and offers','Strategic content','Generative AI creatives']],
    ['c3','E-commerce & Logistics',['Platform and catalog','Logistics and backoffice','Tax and invoicing organization']],
    ['c4','BI & Data Intelligence',['Executive dashboards','KPIs, P&L and indicators','Data structuring and analysis']],
    ['c5','Branding & Art Direction',['Visual positioning','UX/UI and interfaces','Creative direction and 3D assets']],
    ['c6','Digital Strategy',['Journey architecture','Experience and conversion','Design systems and governance']],
    ['c7','Automation & AI',['Workflows and automation','Agents and copilots','Tool integrations']],
    ['c8','Software & Systems',['Java/Kotlin/Python backend','Custom systems','APIs and integrations']],
    ['c9','Infrastructure & Security',['Information security','Technology infrastructure','Governance and continuity']],
    ['c10','Management Consulting',['Processes and organization','P&L auditing','Executive action plan']],
    ['c11','CRM & RevOps',['Pipeline and sales routines','Follow-up automation','Conversion indicators']],
    ['c12','Analytics & CRO',['Data-led experimentation','Journey mapping','Continuous optimization']]
  ]
};

const team={
  PT:[
    ['Raphael','CMO & HEAD DE GROWTH','Direção criativa, funis, UX/UI, fechamento High-Ticket e IA Generativa.',['VISIONÁRIO','ESTRATÉGICO','CARISMÁTICO']],
    ['Victor','COO & DIRETOR COMERCIAL','Prospecção ativa, BI, consultoria de DRE, gestão de e-commerce e administração.',['ANALÍTICO','PERSUASIVO','INTEGRADOR']],
    ['Wadson','HEAD DE BACKOFFICE & BI','Operação de campanhas de tráfego, dashboards, copywriting e backoffice.',['ANALÍTICO','TÁTICO','EXECUTOR SILENCIOSO']],
    ['Fabiano','CTO & HEAD DE TECNOLOGIA & OPERAÇÕES','Backend Java/Kotlin/Python, criptografia, e-commerce, logística e notas fiscais.',['TÉCNICO','DESENVOLVEDOR','SÊNIOR/PLENO']]
  ],
  EN:[
    ['Raphael','CMO & HEAD OF GROWTH','Creative direction, funnels, UX/UI, High-Ticket closing and Generative AI.',['VISIONARY','STRATEGIC','CHARISMATIC']],
    ['Victor','COO & COMMERCIAL DIRECTOR','Active prospecting, BI, P&L consulting, e-commerce management and administration.',['ANALYTICAL','PERSUASIVE','INTEGRATOR']],
    ['Wadson','HEAD OF BACKOFFICE & BI','Traffic campaign operations, dashboards, copywriting and backoffice.',['ANALYTICAL','TACTICAL','SILENT EXECUTOR']],
    ['Fabiano','CTO & HEAD OF TECHNOLOGY & OPERATIONS','Java/Kotlin/Python backend, cryptography, e-commerce, logistics and invoicing.',['TECHNICAL','DEVELOPER','SENIOR/MID']]
  ]
};

const testimonials={
  PT:[
    ['“Conectaram estratégia e execução com uma clareza que não víamos no mercado.”','DIRETOR DE MARKETING','EMPRESA DE TECNOLOGIA'],
    ['“O e-commerce ganhou previsibilidade — do tráfego à nota fiscal.”','CEO','OPERAÇÃO DE E-COMMERCE'],
    ['“O BI virou a base das nossas reuniões de gestão.”','SÓCIO','CONSULTORIA'],
    ['“Sistema sob medida que funciona como extensão da operação.”','HEAD DE OPERAÇÕES','INDÚSTRIA'],
    ['“Tratamento estratégico do início ao fim. Zero achismo.”','FUNDADOR','SAAS B2B'],
    ['“Campanhas com lógica, dados e foco em margem.”','COO','VAREJO DIGITAL'],
    ['“Direção de arte que elevou a percepção da marca.”','CMO','MARCA PREMIUM'],
    ['“Uma operação séria para quem quer resultado sério.”','DIRETOR COMERCIAL','SERVIÇOS B2B']
  ],
  EN:[
    ['“They connected strategy and execution with a clarity we had not seen in the market.”','MARKETING DIRECTOR','TECH COMPANY'],
    ['“The e-commerce gained predictability — from traffic to invoicing.”','CEO','E-COMMERCE OPERATION'],
    ['“BI became the foundation of our management meetings.”','PARTNER','CONSULTING'],
    ['“A custom system that works as an extension of the operation.”','HEAD OF OPERATIONS','INDUSTRY'],
    ['“Strategic treatment from start to finish. Zero guesswork.”','FOUNDER','B2B SAAS'],
    ['“Campaigns with logic, data and margin focus.”','COO','DIGITAL RETAIL'],
    ['“Art direction that raised the brand perception.”','CMO','PREMIUM BRAND'],
    ['“A serious operation for people who want serious results.”','COMMERCIAL DIRECTOR','B2B SERVICES']
  ]
};

const process={
  PT:[['01','Diagnóstico','Leitura profunda da operação, dados, processos e mercado.'],['02','Estratégia','Arquitetura de solução com objetivos, prioridades e indicadores.'],['03','Execução','Implementação das frentes críticas com cadência e responsabilidade.'],['04','Otimização','Leitura dos sinais, correção de gargalos e ganho de eficiência.'],['05','Escala','Documentação, automação e evolução da operação para o próximo nível.']],
  EN:[['01','Diagnosis','Deep reading of operation, data, processes and market.'],['02','Strategy','Solution architecture with goals, priorities and indicators.'],['03','Execution','Implementation of critical fronts with cadence and accountability.'],['04','Optimization','Signal reading, bottleneck correction and efficiency gains.'],['05','Scale','Documentation, automation and operational evolution to the next level.']]
};

const operationCards={
  PT:[
    ['01','Aquisição','Tráfego, conteúdo e posicionamento trabalhando para gerar demanda qualificada.',['TRÁFEGO PAGO','CONTEÚDO','DEMANDA']],
    ['02','Conversão','Landing pages, UX, ofertas e funis alinhados ao processo comercial.',['LANDING PAGES','UX / OFERTAS','FUNIS']],
    ['03','Operação','E-commerce, backoffice, logística, financeiro e dados dentro da mesma leitura.',['E-COMMERCE','BACKOFFICE','DADOS']],
    ['04','Tecnologia','Sistemas, automações e infraestrutura para sustentar escala sem improviso.',['SISTEMAS','AUTOMAÇÃO','INFRAESTRUTURA']]
  ],
  EN:[
    ['01','Acquisition','Traffic, content and positioning working to generate qualified demand.',['PAID TRAFFIC','CONTENT','DEMAND']],
    ['02','Conversion','Landing pages, UX, offers and funnels aligned to the commercial process.',['LANDING PAGES','UX / OFFERS','FUNNELS']],
    ['03','Operations','E-commerce, backoffice, logistics, finance and data within the same reading.',['E-COMMERCE','BACKOFFICE','DATA']],
    ['04','Technology','Systems, automation and infrastructure to support scale without improvisation.',['SYSTEMS','AUTOMATION','INFRASTRUCTURE']]
  ]
};

function escapeHTML(value){
  return String(value).replace(/[&<>'"]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[m]));
}

function sectionHead(key, id){
  const d=copy[state.lang][key];
  return `<div class="section-head reveal"><div class="eyebrow"><span class="line"></span>${escapeHTML(d.eyebrow)} <span class="mono-kicker">${d.num||''}</span></div><h2>${escapeHTML(d.title)}</h2><p>${escapeHTML(d.body)}</p></div>`;
}

function techIcon(key){
  const file=({
    python:'python',java:'java',kotlin:'kotlin',javascript:'javascript',typescript:'typescript',html5:'html5',css3:'css3',tailwind:'tailwind',react:'react',nodejs:'nodejs',sql:'sql',postgresql:'postgresql',git:'git',github:'github',docker:'docker',aws:'aws',linux:'linux',figma:'figma',photoshop:'photoshop',meta:'meta',google:'google',n8n:'n8n',powerbi:'powerbi',owasp:'owasp'
  })[key] || key;
  return `<img src="assets/icons/${file}.svg" alt="" loading="lazy" decoding="async">`;
}

function iconPerson(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3"></circle><path d="M6.8 19.2a5.2 5.2 0 0 1 10.4 0"></path></svg>`;
}

function socialIcon(name){
  const icons={
    instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.6"></circle><circle cx="17.4" cy="6.8" r=".9" fill="currentColor" stroke="none"></circle></svg>',
    github:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 .9-4-2-5-2m10 4v-3.9c0-1.1.4-1.7 1-2.1-3.3-.4-6.8-1.6-6.8-7.1 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.7.1-3.4 0 0 1.1-.4 3.5 1.3a12 12 0 0 1 6.4 0c2.4-1.7 3.5-1.3 3.5-1.3.7 1.7.2 3.1.1 3.4.8.9 1.3 2 1.3 3.4 0 5.5-3.5 6.7-6.8 7.1.6.5 1 1.4 1 2.7V21"></path></svg>',
    facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h2.8l.4-3H14V8.2c0-.9.3-1.5 1.6-1.5h1.7V4a21 21 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.6v8"></path></svg>',
    linkedin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8v10"></path><path d="M6 5.2v.1"></path><path d="M10 18V8h3v1.4c.7-1.2 1.9-2 3.8-2 3 0 4.2 2 4.2 5.2V18h-3v-5c0-1.6-.6-2.8-2-2.8-1.5 0-2 1.1-2 2.8v5"></path></svg>'
  };
  return icons[name]||'';
}

/* ==================== NAVEGAÇÃO / HEADER DINÂMICO ==================== */
function renderNav(){
  document.getElementById('primaryNav').innerHTML=nav[state.lang].map(([id,label])=>`<a href="#${id}" data-nav="${id}">${escapeHTML(label)}</a>`).join('');
  document.getElementById('languageSelect').value=state.lang;
  document.getElementById('headerProject').textContent=copy[state.lang].hero.primary.replace(' →','');
}

/* ==================== RENDER PRINCIPAL / TODAS AS SEÇÕES DO SITE ==================== */
function render(){
  // ==================== CONTEUDO PRINCIPAL / TODAS AS SECOES ====================
  renderNav();
  const d=copy[state.lang];
  const pillarsHTML=pillars[state.lang].map(([id,title,meta,desc,list])=>`
    <article class="pillar ${state.openPillar===id?'is-open':''}">
      <button class="pillar-head" type="button" data-pillar="${id}" aria-expanded="${state.openPillar===id}">
        <span class="pillar-code">${id}</span>
        <span><span class="pillar-title">${escapeHTML(title)}</span><span class="pillar-meta">${escapeHTML(meta)}</span></span>
        <span class="pillar-chevron">⌄</span>
      </button>
      ${state.openPillar===id?`<div class="pillar-body"><p>${escapeHTML(desc)}</p><ul class="pillar-list">${list.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>`:''}
    </article>`).join('');

  const serviceHTML=services[state.lang].map(([id,title,list],i)=>`<article class="service-card reveal" data-interact="${escapeHTML(title)}" style="--reveal-delay:${Math.min(i,8)*55}ms"><div class="service-top"><span>${id}</span><b>↗</b></div><h3>${escapeHTML(title)}</h3><ul class="service-list">${list.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></article>`).join('');
  const teamHTML=team[state.lang].map(([name,role,desc,tags],i)=>`<article class="person-card person-card-photo reveal" data-interact="${escapeHTML(name)}" style="--reveal-delay:${Math.min(i,3)*70}ms"><div class="person-photo-wrap"><img class="person-photo" src="assets/images/team/${escapeHTML(name.toLowerCase())}.png" alt="Retrato de ${escapeHTML(name)}" loading="lazy" onload="this.closest('.person-photo-wrap').classList.add('photo-ready')" onerror="this.closest('.person-photo-wrap').classList.add('photo-missing')"><span class="photo-hint">SUBSTITUIR FOTO</span><div class="photo-initials">${escapeHTML(name.slice(0,1))}</div><div class="photo-frame-mark" aria-hidden="true"></div></div><div class="person-content"><div class="person-top"><span class="person-code">m${i+1}</span><span class="person-icon">${iconPerson()}</span></div><h3>${escapeHTML(name)}</h3><div class="person-role">${escapeHTML(role)}</div><p>${escapeHTML(desc)}</p><div class="person-tags">${tags.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div></div></article>`).join('');
  const processHTML=process[state.lang].map(([n,t,p],i)=>`<article class="process-card reveal" data-interact="${escapeHTML(t)}" style="--reveal-delay:${Math.min(i,4)*55}ms"><div class="process-num">${n}</div><h3>${escapeHTML(t)}</h3><p>${escapeHTML(p)}</p></article>`).join('');
  const opHTML=operationCards[state.lang].map(([n,t,p,tags],i)=>`<article class="operation-card reveal" data-interact="${escapeHTML(t)}" style="--reveal-delay:${Math.min(i,3)*65}ms"><div class="service-top"><span>OP${n}</span><b>↗</b></div><h3>${escapeHTML(t)}</h3><p>${escapeHTML(p)}</p><div class="operation-tags">${tags.map(tag=>`<span>${escapeHTML(tag)}</span>`).join('')}</div></article>`).join('');

  document.getElementById('app').innerHTML=`
    <!-- ==================== HERO / PRIMEIRO DOBRA ==================== -->
    <section class="section hero" id="home">
      <div class="hero-grid-glow"></div>
      <div class="hero-lion" aria-hidden="true"><img src="assets/images/lion-background-final.webp" alt="" loading="eager" decoding="async" fetchpriority="high"></div>
      <div class="section-ghost" aria-hidden="true">01</div>
      <div class="container section-inner">
        <div class="hero-copy reveal visible">
          <div class="eyebrow"><span class="line"></span>${escapeHTML(d.hero.eyebrow)}</div>
          <h1>${escapeHTML(d.hero.before)}<br><span class="hero-word" id="heroWord">${escapeHTML(words[state.lang][0])}</span><br>${escapeHTML(d.hero.after)}</h1>
          <p class="hero-lead">${escapeHTML(d.hero.lead)}</p>
          <div class="hero-actions">
            <a class="button button-gold" href="#contact" data-scroll="contact">${escapeHTML(d.hero.primary)}</a>
            <a class="button" href="#solutions" data-scroll="solutions">${escapeHTML(d.hero.secondary)}</a>
          </div>
          <div class="hero-badge">${escapeHTML(d.hero.badge)}</div>
          <div class="hero-explorer">
            <div class="hero-explorer-list">
              <span class="hero-explorer-item"><b>01</b> GROWTH</span>
              <span class="hero-explorer-item"><b>02</b> ${state.lang==='PT'?'BI':'BI'}</span>
              <span class="hero-explorer-item"><b>03</b> ${state.lang==='PT'?'TECNOLOGIA':'TECHNOLOGY'}</span>
              <span class="hero-explorer-item"><b>04</b> PERFORMANCE</span>
            </div>
            <a href="#about" data-scroll="about">${escapeHTML(d.hero.bottom)}</a>
          </div>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">${state.lang==='PT'?'GROWTH <b>✦</b> INTELIGÊNCIA DE NEGÓCIOS <b>✦</b> SOLUÇÕES B2B <b>✦</b> PERFORMANCE <b>✦</b> TECNOLOGIA <b>✦</b> E-COMMERCE <b>✦</b> AUTOMAÇÃO <b>✦</b> DADOS':'GROWTH <b>✦</b> BUSINESS INTELLIGENCE <b>✦</b> B2B SOLUTIONS <b>✦</b> PERFORMANCE <b>✦</b> TECHNOLOGY <b>✦</b> E-COMMERCE <b>✦</b> AUTOMATION <b>✦</b> DATA'} <b>✦</b> ${state.lang==='PT'?'GROWTH <b>✦</b> INTELIGÊNCIA DE NEGÓCIOS <b>✦</b> SOLUÇÕES B2B <b>✦</b> PERFORMANCE <b>✦</b> TECNOLOGIA <b>✦</b> E-COMMERCE <b>✦</b> AUTOMAÇÃO <b>✦</b> DADOS':'GROWTH <b>✦</b> BUSINESS INTELLIGENCE <b>✦</b> B2B SOLUTIONS <b>✦</b> PERFORMANCE <b>✦</b> TECHNOLOGY <b>✦</b> E-COMMERCE <b>✦</b> AUTOMATION <b>✦</b> DATA'}</div></div>

    <!-- ==================== SOBRE / POSICIONAMENTO ==================== -->
    <section class="section" id="about"><div class="section-ghost">02</div><div class="container section-inner">
      ${sectionHead('about','about')}
      <div class="metric-strip about-metrics"><div class="metric"><strong>04</strong><span>${state.lang==='PT'?'PILARES DE ATUAÇÃO':'OPERATING PILLARS'}</span></div><div class="metric"><strong>05</strong><span>${state.lang==='PT'?'ETAPAS DO MÉTODO':'METHOD STAGES'}</span></div><div class="metric"><strong>02</strong><span>${state.lang==='PT'?'IDIOMAS DE OPERAÇÃO':'OPERATING LANGUAGES'}</span></div></div>
      <div class="about-grid">
        ${(state.lang==='PT'?[
          ['O que é','Assessoria, direção e execução para operações que precisam transformar estratégia em resultado.'],
          ['O que faz','Growth, BI, tecnologia e gestão atuando sobre a mesma operação, do diagnóstico ao acompanhamento.'],
          ['Como pensamos','Interdisciplinaridade, leitura de dados e foco no que realmente move o negócio.'],
          ['Como crescemos','Tráfego, tecnologia, produto e automação trabalhando sobre uma única lógica de execução.']
        ]:[
          ['What it is','Advisory, direction and execution for operations that need to turn strategy into measurable results.'],
          ['What it does','Growth, BI, technology and management working across the same operation, from diagnosis to follow-up.'],
          ['How we think','Interdisciplinary work, data reading and focus on what actually moves the business.'],
          ['How we grow','Traffic, technology, product and automation working under one execution logic.']
        ]).map(([t,p],i)=>`<article class="about-card reveal"><span class="card-index">0${i+1}</span><h3>${escapeHTML(t)}</h3><p>${escapeHTML(p)}</p></article>`).join('')}
      </div>
    </div></section>

    <!-- ==================== PILARES / ARQUITETURA OPERACIONAL ==================== -->
    <section class="section" id="pillars"><div class="section-ghost">03</div><div class="container section-inner">
      ${sectionHead('pillars','pillars')}
      <div class="accordion">${pillarsHTML}</div>
    </div></section>

    <!-- ==================== SOLUCOES / SERVICOS ==================== -->
    <section class="section" id="solutions"><div class="section-ghost">04</div><div class="container section-inner">
      ${sectionHead('solutions','solutions')}
      <div class="services-grid">${serviceHTML}</div>
    </div></section>

    <!-- ==================== TECNOLOGIA / CAPACIDADE TECNICA ==================== -->
    <section class="section" id="technology"><div class="section-ghost">05</div><div class="container section-inner">
      ${sectionHead('tech','technology')}
      <div class="tech-terminal-shell reveal">
        <div class="terminal-tabs" id="terminalTabs" aria-label="Terminal interativo">
          <div class="terminal-dots" role="tablist" aria-label="Módulos do terminal">
            <button type="button" data-terminal-tab="core" class="is-active" aria-selected="true" role="tab" aria-label="Core"></button>
            <button type="button" data-terminal-tab="lab" aria-selected="false" role="tab" aria-label="Lab"></button>
            <button type="button" data-terminal-tab="live" aria-selected="false" role="tab" aria-label="Live"></button>
          </div>
          <span class="terminal-tab-label">IMPLACAVEL@CORE:~</span>
          <span class="terminal-live-chip"><i></i> LIVE</span>
        </div>
        <div class="terminal-pane is-active" data-terminal-pane="core">
          <div class="code-grid">
            <pre class="code-line"><span class="code-dim">$</span> <span class="code-cmd">system --init implacavel_core</span>
<span class="code-dim">&gt;</span> <span class="code-key">${state.lang==='PT'?'carregando módulos':'loading modules'}</span>: <span class="code-green">growth [ok]</span> · <span class="code-green">bi [ok]</span> · <span class="code-green">tech [ok]</span>
<span class="code-dim">&gt;</span> <span class="code-key">backend</span> .......... <span class="code-blue">java · kotlin · python</span>
<span class="code-dim">&gt;</span> <span class="code-key">${state.lang==='PT'?'sistemas':'systems'}</span> ......... <span class="code-blue">${state.lang==='PT'?'estruturados · encapsulados':'structured · encapsulated'}</span>
<span class="code-dim">&gt;</span> <span class="code-key">${state.lang==='PT'?'criptografia':'cryptography'}</span> ..... <span class="code-gold">${state.lang==='PT'?'corporativa · ativa':'corporate · active'}</span>
<span class="code-dim">&gt;</span> <span class="code-key">${state.lang==='PT'?'automação':'automation'}</span> ........ <span class="code-green">online</span>
<span class="code-dim">&gt;</span> <span class="code-key">status</span> ........... <span class="code-bright">${state.lang==='PT'?'OPERAÇÃO ESTRUTURADA':'STRUCTURED OPERATION'}</span>
<span class="code-prompt">$ ${state.lang==='PT'?'governe seu mercado':'lead your market'}_</span></pre>
            <div class="terminal-aside"><span class="aside-label">RUNTIME</span><strong>${state.lang==='PT'?'STACK MODULAR':'MODULAR STACK'}</strong><p>${state.lang==='PT'?'Escolhemos a tecnologia pela função que precisa cumprir, não pelo hype do mês.':'We choose technology by the function it must fulfill, not by the hype of the month.'}</p><div class="runtime-bars"><span style="--w:92%"></span><span style="--w:76%"></span><span style="--w:58%"></span></div></div>
          </div>
        </div>
        <div class="terminal-pane" data-terminal-pane="lab">
          <div class="lab-grid">
            <div><span class="aside-label">INTERACTIVE LAB</span><h3>${state.lang==='PT'?'Teste uma hipótese de operação.':'Test an operating hypothesis.'}</h3><p>${state.lang==='PT'?'Escolha um foco e veja como a IMPLACÁVEL mudaria o primeiro passo do diagnóstico.':'Choose a focus and see how IMPLACÁVEL would change the first diagnostic step.'}</p><div class="lab-actions"><button type="button" data-lab="growth">GROWTH</button><button type="button" data-lab="data">${state.lang==='PT'?'BI / DADOS':'BI / DATA'}</button><button type="button" data-lab="tech">${state.lang==='PT'?'TECNOLOGIA':'TECHNOLOGY'}</button></div></div><div class="lab-output" id="labOutput"><span>&gt; selecione um módulo_</span></div>
          </div>
        </div>
        <div class="terminal-pane" data-terminal-pane="live">
          <div class="live-head"><div><span class="aside-label">LIVE SYSTEM</span><h3>${state.lang==='PT'?'O site reage ao visitante.':'The site reacts to the visitor.'}</h3></div><span class="live-status"><i></i> ONLINE</span></div>
          <div class="activity-log" id="activityLog">${state.interactions.length?state.interactions.map(item=>`<div><span>&gt;</span> <b>${escapeHTML(item.time)}</b> <span class="activity-kind">${escapeHTML(item.kind.toUpperCase())}</span> <em>${escapeHTML(item.label)}</em></div>`).join(''):`<div>&gt; ${state.lang==='PT'?'aguardando primeira interação_':'waiting for first interaction_'}</div>`}</div>
        </div>
      </div>
      <div class="tech-list reveal">${(state.lang==='PT'?[
          ['◉','Backend de alta performance','Java, Kotlin e Python para sistemas estáveis e escaláveis.'],
          ['⬡','Sistemas sob medida','Arquiteturas estruturadas e encapsuladas, desenvolvidas para o seu processo.'],
          ['⌑','Criptografia corporativa','Segurança de dados e proteção da informação em toda a operação.'],
          ['⌁','Automação inteligente','Processos automatizados para eliminar gargalos e custos desnecessários.']
        ]:[
          ['◉','High-performance backend','Java, Kotlin and Python for stable, scalable systems.'],
          ['⬡','Custom systems','Structured, encapsulated architectures built for your operation.'],
          ['⌑','Corporate cryptography','Data security and information protection across the operation.'],
          ['⌁','Intelligent automation','Automated processes to remove bottlenecks and unnecessary costs.']
        ]).map(([i,t,p])=>`<article class="tech-card reveal" data-interact="${escapeHTML(t)}"><span class="tech-icon">${i}</span><h3>${escapeHTML(t)}</h3><p>${escapeHTML(p)}</p></article>`).join('')}</div>
    </div></section>

    <!-- ==================== CASES / LEITURA EXECUTIVA ==================== -->
    <section class="section" id="cases"><div class="section-ghost">06</div><div class="container section-inner">
      <div class="cases-head reveal"><div><div class="eyebrow"><span class="line"></span>${escapeHTML(d.cases.eyebrow)} <span class="mono-kicker">${d.cases.num}</span></div><h2>${escapeHTML(d.cases.title)}</h2><p>${escapeHTML(d.cases.body)}</p></div><div><span class="demo-note">ⓘ DEMONSTRAÇÃO — PAINÉIS ILUSTRATIVOS. DADOS REAIS NASCEM DO DIAGNÓSTICO DE CADA OPERAÇÃO.</span></div></div>
      <div class="case-layout">
        <div class="metric-panel reveal">${[['-38%','CAC'],['3,4×','ROAS'],['+62%','CONVERSÃO'],['+24%','TICKET MÉDIO']].map(([v,l])=>`<div class="metric-box"><span class="metric-label">${l}</span><span class="metric-value">${v}</span></div>`).join('')}</div>
        <div class="funnel-panel reveal"><h3 class="funnel-title"><span>▥</span> FUNIL DE CONVERSÃO — SIMULAÇÃO</h3>${[['ACESSOS',100],['LEADS',68],['OPORTUNIDADES',41],['VENDAS',23]].map(([l,v])=>`<div class="funnel-row"><label>${l}</label><div class="funnel-bar"><i style="width:${v}%"></i></div></div>`).join('')}<p class="funnel-foot">DEMONSTRAÇÃO — PAINÉIS ILUSTRATIVOS. DADOS REAIS NASCEM DO DIAGNÓSTICO DE CADA OPERAÇÃO.</p></div>
      </div>
    </div></section>

    <!-- ==================== PERFORMANCE / MIDIA PAGA ==================== -->
    <section class="section" id="traffic"><div class="section-ghost">07</div><div class="container section-inner">
      <div class="traffic-intro reveal"><div><div class="eyebrow"><span class="line"></span>${escapeHTML(d.traffic.eyebrow)} <span class="mono-kicker">${d.traffic.num}</span></div><h2>${escapeHTML(d.traffic.title)}</h2></div><p>${escapeHTML(d.traffic.body)}</p></div>
      <div class="ad-grid">
        ${[
          ['Meta Ads',['38','44','61','52','78','66'],'3,4×','-31%','2,4M'],
          ['Instagram Ads',['29','41','55','49','70','62'],'2,1×','-24%','1,8M'],
          ['Google Ads',['35','47','57','63','73','69'],'2,8×','-27%','980K']
        ].map(([name,bars,roas,cpa,reach])=>`<article class="ad-card reveal"><div class="ad-card-top"><span>${escapeHTML(name)}</span><strong>↗</strong></div><div class="ad-bars">${bars.map(h=>`<span style="--h:${h}%"></span>`).join('')}</div><div class="ad-stat-grid"><div class="ad-stat"><label>ROAS</label><b>${roas}</b></div><div class="ad-stat"><label>CPA</label><b>${cpa}</b></div><div class="ad-stat"><label>ALCANCE</label><b>${reach}</b></div></div><div class="ad-foot">JAN — DEZ 2026 · SIMULADO</div></article>`).join('')}
      </div>
    </div></section>

    <!-- ==================== PROVA / DEPOIMENTOS ILUSTRATIVOS ==================== -->
    <section class="section" id="proof"><div class="section-ghost">08</div><div class="container section-inner">
      <div class="proof-head reveal"><div><div class="eyebrow"><span class="line"></span>${state.lang==='PT'?'CONFIANÇA':'CONFIDENCE'} <span class="mono-kicker">08</span></div><h2>${state.lang==='PT'?'Quem trabalha com a IMPLACÁVEL.':'Who works with IMPLACÁVEL.'}</h2><p>${state.lang==='PT'?'Estrutura pronta para receber depoimentos reais. O conteúdo abaixo é demonstrativo.':'A structure ready for real testimonials. The content below is illustrative.'}</p></div><span class="demo-note">◉ ${state.lang==='PT'?'EXEMPLO DE CONTEÚDO — DEPOIMENTOS ILUSTRATIVOS, SEM CLIENTES REAIS.':'CONTENT EXAMPLE — ILLUSTRATIVE TESTIMONIALS, NO REAL CLIENTS.'}</span></div>
      <div class="testimonial-grid">${testimonials[state.lang].map(([quote,role,sector],i)=>`<article class="testimonial-card reveal" style="--reveal-delay:${(i%4)*55}ms"><div class="quote-mark">❞</div><p>${escapeHTML(quote)}</p><div class="testimonial-meta"><strong>${escapeHTML(role)}</strong><span>${escapeHTML(sector)}</span></div></article>`).join('')}</div>
    </div></section>

    <!-- ==================== OPERACAO / FRONT AO BACKOFFICE ==================== -->
    <section class="section" id="operation"><div class="section-ghost">09</div><div class="container section-inner">
      ${sectionHead('operation','operation')}
      <div class="operation-grid">${opHTML}</div>
    </div></section>

    <!-- ==================== EQUIPE / GOVERNANCA ==================== -->
    <section class="section" id="team"><div class="section-ghost">10</div><div class="container section-inner">
      ${sectionHead('team','team')}
      <div class="governance-grid">${teamHTML}</div>
    </div></section>

    <!-- ==================== METODO / CINCO ETAPAS ==================== -->
    <section class="section" id="process"><div class="section-ghost">11</div><div class="container section-inner">
      ${sectionHead('process','process')}
      <div class="process-timeline">${processHTML}</div>
    </div></section>

    <!-- ===================================================================== -->
    <!-- STACK / TECNOLOGIAS, FERRAMENTAS, PROGRAMAS E CAPACIDADES -->
    <!-- ===================================================================== -->
    <section class="section stack-section" id="stack"><div class="section-ghost">12</div><div class="container section-inner">
      ${sectionHead('stack','stack')}
      <div class="stack-showcase">
        <div class="stack-manifesto reveal">
          <span class="stack-manifesto-kicker">IMPLACÁVEL / ECOSSISTEMA TÉCNICO</span>
          <strong>${state.lang==='PT'?'Tecnologia certa. Ferramenta certa. Processo certo.':'The right technology. The right tool. The right process.'}</strong>
          <p>${state.lang==='PT'?'Um catálogo amplo de linguagens, frameworks, dados, cloud, segurança, design, audiovisual, marketing e automação. A escolha varia conforme o problema, o estágio e a operação.':'A broad catalog spanning languages, frameworks, data, cloud, security, design, audiovisual, marketing and automation. The choice varies by problem, stage and operation.'}</p>
          <div class="stack-signal"><span></span><span>${state.lang==='PT'?'STACK MODULAR · CAPACIDADE MULTIDISCIPLINAR':'MODULAR STACK · MULTIDISCIPLINARY CAPABILITY'}</span></div>
        </div>
        <div class="tech-ecosystem reveal">
          <div class="tech-filter" role="tablist" aria-label="Filtros de tecnologia">
            <button type="button" data-tech-filter="dev" role="tab" aria-selected="false">DEV</button>
            <button type="button" data-tech-filter="data" role="tab" aria-selected="false">DADOS</button>
            <button type="button" data-tech-filter="cloud" role="tab" aria-selected="false">CLOUD</button>
            <button type="button" data-tech-filter="security" role="tab" aria-selected="false">SECURITY</button>
            <button type="button" data-tech-filter="creative" role="tab" aria-selected="false">CRIATIVO</button>
            <button type="button" data-tech-filter="marketing" role="tab" aria-selected="false">MARKETING</button>
            <button type="button" data-tech-filter="automation" role="tab" aria-selected="false">AUTOMAÇÃO</button>
          </div>
          <div class="tech-catalog" id="techCatalog">
            ${[
              ['dev','python','Python'],['dev','java','Java'],['dev','kotlin','Kotlin'],['dev','javascript','JavaScript'],['dev','typescript','TypeScript'],['dev','html5','HTML5'],['dev','css3','CSS3'],['dev','tailwind','Tailwind CSS'],['dev','react','React'],['dev','nodejs','Node.js'],['dev','git','Git'],['dev','github','GitHub'],
              ['data','sql','SQL'],['data','postgresql','PostgreSQL'],['data','powerbi','Power BI'],
              ['cloud','aws','AWS'],['cloud','docker','Docker'],['cloud','linux','Linux'],
              ['security','owasp','OWASP'],
              ['creative','figma','Figma'],['creative','photoshop','Photoshop'],
              ['marketing','meta','Meta Ads'],['marketing','google','Google Ads'],
              ['automation','n8n','n8n']
            ].map(([cat,key,label])=>`<button class="tech-item" type="button" data-tech-category="${cat}" data-tech-key="${key}" data-interact="${escapeHTML(label)}" title="${escapeHTML(label)}"><span class="tech-icon">${techIcon(key)}</span><span class="tech-name">${escapeHTML(label)}</span><span class="tech-arrow">↗</span></button>`).join('')}
          </div>
          <div class="tech-catalog-foot"><span id="techCatalogStatus">TODAS AS CAPACIDADES</span><span>${state.lang==='PT'?'Clique em uma tecnologia para marcar a seleção e registrar a interação no terminal.':'Click a technology to select it and register the interaction in the terminal.'}</span></div>
        </div>
      </div>
    </div></section>

    <!-- ===================================================================== -->
    <!-- CONTATO / FORMULARIO, WHATSAPP E REDES SOCIAIS -->
    <!-- ===================================================================== -->
    <section class="section contact" id="contact"><div class="container section-inner">
      <div class="contact-grid">
        <div class="contact-copy reveal"><div class="eyebrow"><span class="line"></span>${escapeHTML(d.contact.eyebrow)}</div><h2>${escapeHTML(d.contact.title)}</h2><p>${escapeHTML(d.contact.body)}</p><button class="whats-button" id="whatsButton" type="button"><span class="social-inline-dot"></span>${state.lang==='PT'?'FALAR NO WHATSAPP':'TALK ON WHATSAPP'} <b>↗</b></button><span class="contact-note">ⓘ ${state.lang==='PT'?'Use o formulário para contexto e uma das conexões abaixo para entrar no canal certo.':'Use the form for context and one of the connections below to reach the right channel.'}</span></div>
        <form class="contact-form reveal" id="contactForm" novalidate>
          <div class="form-row"><label class="field"><span>${state.lang==='PT'?'SEU NOME':'YOUR NAME'}</span><input name="name" autocomplete="name" placeholder="${state.lang==='PT'?'Seu nome completo':'Your full name'}" required></label><label class="field"><span>${state.lang==='PT'?'NOME DA EMPRESA':'COMPANY'}</span><input name="company" autocomplete="organization" placeholder="${state.lang==='PT'?'Nome da empresa':'Company name'}"></label></div>
          <div class="form-row"><label class="field"><span>E-MAIL</span><input type="email" name="email" autocomplete="email" placeholder="voce@empresa.com.br" required></label><label class="field"><span>WHATSAPP</span><input name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></label></div>
          <label class="field"><span>${state.lang==='PT'?'TIPO DE PROJETO':'PROJECT TYPE'}</span><select name="type" required><option value="">${state.lang==='PT'?'Selecione uma opção':'Select an option'}</option>${(state.lang==='PT'?['Growth & Performance','E-commerce','Branding & UX/UI','Tecnologia & Sistemas','Consultoria & BI']:['Growth & Performance','E-commerce','Branding & UX/UI','Technology & Systems','Consulting & BI']).map(x=>`<option>${escapeHTML(x)}</option>`).join('')}</select></label>
          <label class="field"><span>${state.lang==='PT'?'MENSAGEM':'MESSAGE'}</span><textarea name="message" placeholder="${state.lang==='PT'?'Descreva seu desafio...':'Describe your challenge...'}" required></textarea></label>
          <div class="form-actions"><button class="button button-gold" type="submit">${state.lang==='PT'?'ENVIAR MENSAGEM':'SEND MESSAGE'}</button><span class="form-status" id="formStatus"></span></div>
        </form>
      </div>
      <div class="contact-socials reveal">
        <div class="contact-socials-head"><div><span class="eyebrow"><span class="line"></span>${state.lang==='PT'?'CANAIS DIGITAIS':'DIGITAL CHANNELS'}</span><h3>${state.lang==='PT'?'Escolha onde continuar a conversa.':'Choose where to continue the conversation.'}</h3></div><span class="contact-socials-note">${state.lang==='PT'?'LINKS CONFIGURÁVEIS NO BLOCO IMPLACAVEL_CONFIG.':'LINKS ARE CONFIGURABLE IN IMPLACAVEL_CONFIG.'}</span></div>
        <div class="social-grid">
          ${(state.lang==='PT'?[
          ['whatsapp','WhatsApp','FALAR COM A EQUIPE'],
          ['instagram','Instagram','VER A MARCA'],
          ['github','GitHub','CÓDIGO & PROJETOS'],
          ['facebook','Facebook','ACOMPANHAR ATUALIZAÇÕES'],
          ['linkedin','LinkedIn','REDE PROFISSIONAL']
        ]:[
          ['whatsapp','WhatsApp','TALK TO THE TEAM'],
          ['instagram','Instagram','VIEW THE BRAND'],
          ['github','GitHub','CODE & PROJECTS'],
          ['facebook','Facebook','FOLLOW UPDATES'],
          ['linkedin','LinkedIn','PROFESSIONAL NETWORK']
        ]).map(([key,label,sub])=>`<a class="social-card ${CONFIG.socials?.[key]?'is-live':'is-config'}" data-social="${key}" href="${CONFIG.socials?.[key]||'#contact'}" ${CONFIG.socials?.[key]?'target="_blank" rel="noreferrer"':''}><span class="social-icon">${key==='whatsapp'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.5-4A8 8 0 1 1 20 11.5Z"></path><path d="M9.3 8.7c.2 2.8 1.8 4.6 4.4 5.2.7.2 1.6.1 2-.4l.7-.8-1.8-1.1-.8.7c-1.3-.4-2.2-1.2-2.8-2.3l.6-.8-1.1-1.7-.8.6c-.4.1-.5.4-.4.6Z"></path></svg>':socialIcon(key)}</span><span><b>${escapeHTML(label)}</b><small>${escapeHTML(sub)}</small></span><em>${CONFIG.socials?.[key]?'↗':'+'}</em></a>`).join('')}
        </div>
      </div>
    </div></section>`;

  renderFooter();
  refreshChatLanguage();
  bindPageInteractions();
  setupReveal();
  setupScrollSpy();
  setupPointerGlow();
  startHeroTypewriter();
  setTerminalTab(state.terminalTab);
  setupTerminal();
  setupTechCatalog();
}

/* ==================== FOOTER / RODAPÉ INSTITUCIONAL ==================== */
function renderFooter(){
  const PT=state.lang==='PT';
  document.getElementById('footer').innerHTML=`
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand" href="#home"><span class="brand-mark"></span><span>IMPLACÁVEL</span></a>
        <span class="brand-sub">MARKETING INSTITUCIONAL</span>
        <p>${PT?'Growth, Inteligência de Negócios e Soluções Estratégicas B2B. Estratégia, tecnologia e performance em uma única operação.':'Growth, Business Intelligence and Strategic B2B Solutions. Strategy, technology and performance in one operation.'}</p>
        <div class="footer-slogan">${PT?'Governe seu mercado.':'Lead your market.'}</div>
      </div>
      <div class="footer-col"><h4>${PT?'NAVEGAÇÃO':'NAVIGATION'}</h4>${nav[state.lang].map(([id,label])=>`<a href="#${id}">${escapeHTML(label[0]+label.slice(1).toLowerCase())}</a>`).join('')}</div>
      <div class="footer-col"><h4>${PT?'SOLUÇÕES':'SOLUTIONS'}</h4><a href="#solutions">Growth & Performance</a><a href="#solutions">${PT?'E-commerce & Logística':'E-commerce & Logistics'}</a><a href="#solutions">Branding & UX/UI</a><a href="#solutions">${PT?'BI & Consultoria':'BI & Consulting'}</a><a href="#solutions">${PT?'Tecnologia & Sistemas':'Technology & Systems'}</a></div>
      <div class="footer-col"><h4>${PT?'CONTATO':'CONTACT'}</h4><a class="footer-contact" href="#contact"><span>${CONFIG.whatsapp?(PT?'WhatsApp — falar com a equipe':'WhatsApp — talk to the team'):(PT?'WhatsApp — configurar número':'WhatsApp — configure number')}</span><span class="footer-arrow">↗</span></a><a href="#contact">${PT?'Contato':'Contact'}</a><a href="${CONFIG.socials?.instagram||'#contact'}" ${CONFIG.socials?.instagram?'target="_blank" rel="noreferrer"':''}>Instagram ↗</a></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getFullYear()} IMPLACÁVEL Marketing Institucional. ${PT?'Todos os direitos reservados.':'All rights reserved.'}</span><span class="conf">${PT?'DOCUMENTO ESTRATÉGICO CONFIDENCIAL.':'CONFIDENTIAL STRATEGIC DOCUMENT.'}</span></div>`;
}

/* ==================== INTERAÇÕES DE PÁGINA / LINKS / FORMULÁRIO ==================== */
function bindPageInteractions(){
  document.querySelectorAll('[data-scroll]').forEach(el=>el.addEventListener('click',()=>{document.getElementById(el.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'})}));
  document.querySelectorAll('[data-pillar]').forEach(btn=>btn.addEventListener('click',()=>{state.openPillar=state.openPillar===btn.dataset.pillar?'':btn.dataset.pillar; const y=window.scrollY; render(); requestAnimationFrame(()=>window.scrollTo(0,y));}));
  document.getElementById('contactForm')?.addEventListener('submit',handleForm);
  document.getElementById('whatsButton')?.addEventListener('click',()=>{const number=CONFIG.whatsapp||window.IMPLACAVEL_WHATSAPP||''; if(number){window.open('https://wa.me/'+String(number).replace(/\D/g,''),'_blank','noopener');}else{toast(state.lang==='PT'?'WhatsApp: configure o número oficial no bloco IMPLACAVEL_CONFIG.':'WhatsApp: configure the official number in IMPLACAVEL_CONFIG.');}});
  document.querySelectorAll('.social-card').forEach(card=>card.addEventListener('click',e=>{const key=card.dataset.social;const url=CONFIG.socials?.[key]||'';if(url)return;if(key==='whatsapp'){e.preventDefault();document.getElementById('whatsButton')?.click();return;}e.preventDefault();toast(state.lang==='PT'?`${card.querySelector('b')?.textContent||key}: configure o link no bloco IMPLACAVEL_CONFIG.`:`${card.querySelector('b')?.textContent||key}: configure the link in IMPLACAVEL_CONFIG.`);}));
  document.querySelectorAll('.primary-nav a,.site-footer a[href^="#"]').forEach(a=>a.addEventListener('click',()=>closeMobileMenu()));
}

/* ==================== FORMULÁRIO DE CONTATO / INTEGRAÇÃO OPCIONAL ==================== */
async function handleForm(event){
  event.preventDefault();
  const form=event.currentTarget;
  const fd=new FormData(form);
  const data=Object.fromEntries(fd.entries());
  const required=['name','email','type','message'];
  let valid=true;
  required.forEach(key=>{const field=form.elements[key]; if(!data[key]?.trim()){field.classList.add('has-error');valid=false}else field.classList.remove('has-error')});
  if(!/^\S+@\S+\.\S+$/.test(data.email||'')){form.elements.email.classList.add('has-error');valid=false}
  const status=document.getElementById('formStatus');
  if(!valid){status.textContent=state.lang==='PT'?'PREENCHA OS CAMPOS OBRIGATÓRIOS.':'PLEASE COMPLETE THE REQUIRED FIELDS.';return}
  Object.values(form.elements).forEach(el=>{if(el?.classList)el.classList.remove('has-error')});

  const payload={...data,createdAt:new Date().toISOString(),lang:state.lang};
  const submitButton=form.querySelector('button[type="submit"]');
  if(submitButton){submitButton.disabled=true;submitButton.dataset.original=submitButton.textContent;submitButton.textContent=state.lang==='PT'?'ENVIANDO...':'SENDING...'}

  try{
    if(CONFIG.formEndpoint){
      const response=await fetch(CONFIG.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error('form endpoint failed');
      status.textContent=state.lang==='PT'?'MENSAGEM ENVIADA.':'MESSAGE SENT.';
      toast(state.lang==='PT'?'Seu contato foi enviado com sucesso.':'Your message was sent successfully.');
    }else{
      localStorage.setItem('implacavel:lastLead',JSON.stringify(payload));
      status.textContent=state.lang==='PT'?'MENSAGEM VALIDADA E PREPARADA.':'MESSAGE VALIDATED AND PREPARED.';
      toast(state.lang==='PT'?'Formulário validado. Configure o endpoint oficial para envio automático.':'Form validated. Configure the official endpoint for automatic delivery.');
    }
    form.reset();
  }catch(error){
    status.textContent=state.lang==='PT'?'NÃO FOI POSSÍVEL ENVIAR AGORA.':'COULD NOT SEND RIGHT NOW.';
    toast(state.lang==='PT'?'Não foi possível concluir o envio. Tente novamente.':'The message could not be sent. Please try again.');
  }finally{
    if(submitButton){submitButton.disabled=false;submitButton.textContent=submitButton.dataset.original|| (state.lang==='PT'?'ENVIAR MENSAGEM':'SEND MESSAGE')}
    setTimeout(()=>{if(status)status.textContent=''},4200);
  }
}

/* ==================== NOTIFICAÇÕES / TOAST ==================== */
function toast(message){
  const el=document.getElementById('toast');
  el.textContent=message;el.hidden=false;clearTimeout(window.__toast);window.__toast=setTimeout(()=>{el.hidden=true},3800);
}

/* ==================== SCROLL SPY / NAVEGAÇÃO ATIVA ==================== */
function setupScrollSpy(){
  const ids=['home','about','pillars','solutions','technology','cases','traffic','proof','operation','team','process','stack','contact'];
  const sync=()=>{
    const marker=window.scrollY+Math.max(110,Math.min(190,window.innerHeight*.25));
    let current='home';
    ids.forEach(id=>{const el=document.getElementById(id); if(el && el.offsetTop<=marker) current=id;});
    document.querySelectorAll('.primary-nav a').forEach(a=>{const navCurrent=current==='stack'?'technology':current;const active=a.dataset.nav===navCurrent;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  };
  window.removeEventListener('scroll',window.__implacavelSpyScroll);
  window.__implacavelSpyScroll=sync;
  window.addEventListener('scroll',sync,{passive:true});
  sync();
}

/* ==================== REVEAL / ANIMAÇÕES DE ENTRADA ==================== */
function setupReveal(){
  if(window.__reveal){window.__reveal.disconnect()}
  const targets=[...document.querySelectorAll('.reveal:not(.visible)')];
  if(!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('visible'));return}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  }),{threshold:.09,rootMargin:'0px 0px -5% 0px'});
  targets.forEach((el,i)=>{
    if(!el.style.getPropertyValue('--reveal-delay') && i<10) el.style.setProperty('--reveal-delay',`${i*35}ms`);
    observer.observe(el);
  });
  window.__reveal=observer;
}

/* ==================== HERO / SCRAMBLE DE PALAVRAS ==================== */
function startHeroTypewriter(){
  clearTimeout(state.typingTimer);
  const el=document.getElementById('heroWord');
  if(!el)return;
  if(new URLSearchParams(location.search).has('visualTest')){ el.textContent=words[state.lang][0]; return; }
  const list=words[state.lang];
  const glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#*+!/?';
  let index=0;

  const wait=(ms)=>new Promise(resolve=>{state.typingTimer=setTimeout(resolve,ms)});
  const scrambleTo=async(target)=>{
    el.classList.add('is-decoding');
    const start=performance.now();
    const duration=520;
    while(performance.now()-start<duration){
      const progress=(performance.now()-start)/duration;
      const locked=Math.floor(progress*target.length*1.15);
      let out='';
      for(let i=0;i<target.length;i++){
        out += i<locked ? target[i] : glyphs[Math.floor(Math.random()*glyphs.length)];
      }
      el.textContent=out;
      await wait(42);
    }
    el.textContent=target;
    el.classList.remove('is-decoding');
  };
  const loop=async()=>{
    while(document.body.contains(el)){
      await scrambleTo(list[index]);
      await wait(2100);
      index=(index+1)%list.length;
    }
  };
  el.textContent='';
  loop();
}

function closeMobileMenu(){
  const header=document.getElementById('siteHeader');header.classList.remove('menu-open');document.getElementById('menuToggle')?.setAttribute('aria-expanded','false');document.body.classList.remove('nav-locked');
}

/* ==================== CHAT / ESTADO INICIAL ==================== */
function clearInitialChatState(){
  const body=document.getElementById('chatBody');
  if(!body || state.chatHistory.length>0) return;
  body.querySelectorAll('.chat-message').forEach(el=>el.remove());
  body.querySelectorAll('.chat-inline-action').forEach(el=>el.remove());
}

/* ==================== CHAT / ABERTURA E FECHAMENTO ==================== */
function openChat(){
  clearInitialChatState();
  const panel=document.getElementById('chatPanel');
  panel.hidden=false;
  document.getElementById('chatFab').setAttribute('aria-expanded','true');
  state.chatOpen=true;
  requestAnimationFrame(()=>document.getElementById('chatInput')?.focus());
}
function closeChat(){document.getElementById('chatPanel').hidden=true;document.getElementById('chatFab').setAttribute('aria-expanded','false');state.chatOpen=false}

function normalizeQuery(query){
  return query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}
function detectMessageLanguage(query){
  const q=normalizeQuery(query);
  const pt=['oi','ola','voce','voces','quero','preciso','como','onde','quanto','preco','valor','vendas','venda','cliente','empresa','equipe','falar','contato','ajuda','tecnologia','sistema','dados','automacao','obrigado','obrigada','por favor','pode','bom dia','boa tarde','boa noite'];
  const en=['hello','hi','hey','you','your','what','where','how','need','want','can','price','cost','sales','customer','company','team','contact','help','technology','system','data','automation','thanks','thank you','please','could','good morning','good afternoon','good evening'];
  let ptScore=0,enScore=0;
  for(const w of pt) if(q.includes(normalizeQuery(w))) ptScore+=w.includes(' ')?2:1;
  for(const w of en) if(q.includes(normalizeQuery(w))) enScore+=w.includes(' ')?2:1;
  if(/[ãõçáéíóúâêôà]/i.test(query)) ptScore+=2;
  if(enScore>ptScore) return 'EN';
  if(ptScore>enScore) return 'PT';
  return state.lang;
}
function responseLanguage(query){
  state.chatResponseLang=detectMessageLanguage(query);
  return state.chatResponseLang;
}
function pickVariant(group){
  const arr=group[state.chatResponseLang||state.lang]||group.PT;
  const value=arr[state.chatTurns%arr.length];
  state.chatTurns += 1;
  return value;
}
function chatReplyLegacy(query){
  const q=normalizeQuery(query);
  responseLanguage(query);
  const pt=state.chatResponseLang==='PT';
  const say=(ptText,enText)=>pt?ptText:enText;
  const go=(topic,ptText,enText)=>{state.chatTopic=topic;return say(ptText,enText)};

  if(/^(oi|ola|hello|hi|e ai|eai|bom dia|boa tarde|boa noite|hey)\b/.test(q)) return pickVariant(CHAT_VARIANTS).replace(/^Olá\./,'Oi.');
  if(/^(ok|beleza|blz|show|legal|entendi|certo|sim|s|uhum)\b/.test(q)){
    if(state.chatFlow==='budget') return go('budget',
      'Perfeito. Para montar um caminho de orçamento, eu preciso de três coisas: o que você vende, qual é o principal gargalo e qual frente você quer atacar primeiro.',
      'Perfect. To shape a pricing path, I need three things: what you sell, the main bottleneck, and which front you want to tackle first.');
    return say('Perfeito. Então vamos ao próximo ponto. O que você quer resolver primeiro?', 'Perfect. Let’s move to the next point. What do you want to solve first?');
  }
  if(/^(nao|não|n|no|nop|ainda nao)\b/.test(q)) return say('Sem problema. Me diga o que ficou estranho ou o que você realmente precisa, e eu ajusto a conversa.', 'No problem. Tell me what felt off or what you actually need, and I will adjust the conversation.');
  if(/obrigad|valeu|thanks|thank you/.test(q)) return say('Imagina. Pode continuar daqui. Eu prefiro entender o contexto antes de jogar uma lista de serviços na sua frente.', 'You’re welcome. Keep going from here. I would rather understand the context before throwing a service list at you.');
  if(/quem e voce|quem eh voce|o que voce e|who are you|what are you/.test(q)) return say('Sou o assistente digital da IMPLACÁVEL. Trabalho com respostas locais e contexto simples para orientar a navegação. A IA real pode ser conectada depois sem mudar a interface.', 'I am the IMPLACÁVEL digital assistant. I use local responses and simple context to guide navigation. A real AI can be connected later without changing the interface.');
  if(/preco|valor|quanto custa|orcamento|budget|price|cost/.test(q)){
    state.chatFlow='budget';
    return go('budget', 'Preço depende do escopo. A forma mais honesta é entender a operação primeiro e só depois fechar proposta. Se quiser começar agora, eu te levo ao contato e a equipe parte do contexto.', 'Pricing depends on scope. The honest path is to understand the operation first and then build a proposal. I can take you to contact and let the team start from your context.');
  }
  if(/prazo|tempo|quanto demora|deadline|timeline/.test(q)) return say('O prazo muda bastante conforme a frente. Estratégia e diagnóstico podem avançar rápido; integrações, sistemas e automações exigem mais etapas. O cronograma nasce do escopo.', 'Timing varies by workstream. Strategy and diagnosis can move quickly; integrations, systems and automation need more stages. The schedule starts with scope.');
  if(/venda|ecom|e-commerce|fatur|loja|commerce|convers/.test(q)) return go('commerce','Se o problema está em vendas ou e-commerce, eu olharia o caminho inteiro: aquisição, conversão, plataforma, logística, backoffice e métricas. Quer entrar por essa frente?','If the issue is sales or e-commerce, I would look at the whole path: acquisition, conversion, platform, logistics, backoffice and metrics.');
  if(/serv|pilar|soluc|o que voces fazem|o que vcs fazem|what do you do|services/.test(q)) return go('services','A IMPLACÁVEL trabalha em quatro pilares: Growth & Performance, Branding/UX, Consultoria & BI e Tecnologia. As soluções se conectam para a estratégia chegar na operação.','IMPLACÁVEL works across four pillars: Growth & Performance, Branding/UX, Consulting & BI, and Technology. The solutions connect so strategy reaches the operation.');
  if(/marketing|trafego|ads|campanha|performance|growth|funil/.test(q)) return go('growth','Na frente de Growth, o foco está em aquisição, funil, oferta, tráfego pago e leitura de performance. O objetivo é ligar investimento a resultado e melhorar o que acontece depois do clique.','On Growth, the focus is acquisition, funnels, offers, paid traffic and performance. The goal is to connect investment to outcomes and improve what happens after the click.');
  if(/bi|dashboard|dados|metrica|dre|finance|financeiro/.test(q)) return go('bi','BI entra para transformar operação em leitura executiva: indicadores, dashboards, DRE, fechamento e sinais que ajudam a decidir antes de o problema ficar caro.','BI turns the operation into executive visibility: indicators, dashboards, P&L, closing and signals that help you decide before the problem gets expensive.');
  if(/tec|sistem|software|backend|java|kotlin|python|automat|infra|cript|segur/.test(q)) return go('technology','Aqui tecnologia é infraestrutura de negócio: sistemas sob medida, backend, automações, integrações e segurança. A regra é simples: a tecnologia precisa sustentar o processo.','Here technology is business infrastructure: custom systems, backend, automation, integrations and security. The rule is simple: technology has to support the process.');
  if(/metodo|process|como funciona|how does it work|etapas/.test(q)) return go('method','O método passa por diagnóstico, estratégia, execução, otimização e escala. A ideia é que cada etapa deixe a próxima mais previsível.','The method moves through diagnosis, strategy, execution, optimization and scale. Each stage should make the next one more predictable.');
  if(/equipe|time|people|team|quem trabalha/.test(q)) return go('team','A estrutura é enxuta e multidisciplinar, dividida entre Growth, comercial, BI/backoffice e tecnologia. Você pode conhecer os quatro executivos na seção de equipe.','The structure is lean and multidisciplinary, covering Growth, commercial, BI/backoffice and technology. You can meet the four executives in the team section.');
  if(/contato|falar|humano|whatsapp|contact|talk|contratar/.test(q)) return go('contact','Claro. Quando a conversa pede contexto de verdade, o próximo passo é contato. Posso te levar direto ao formulário para você já deixar o cenário organizado.','Absolutely. When the conversation needs real context, the next step is contact. I can take you directly to the form so the scenario is organized.');
  if(/ajuda|help|menu/.test(q)) return say('Posso conversar sobre serviços, Growth, e-commerce, BI, tecnologia, método, equipe, prazo ou orçamento. Escreva do seu jeito.', 'I can talk about services, Growth, e-commerce, BI, technology, method, team, timing or pricing. Write naturally.');
  return pickVariant({PT:CHAT_VARIANTS.PT.fallback,EN:CHAT_VARIANTS.EN.fallback});
}


function detectChatIntent(query){
  const q=normalizeQuery(query);
  const intents={
    greeting:['oi','ola','hello','hi','e ai','eai','bom dia','boa tarde','boa noite','hey'],
    sales:['venda','vendas','fatur','converter','conversao','lead','leads','cliente','clientes','comercial','pipeline'],
    growth:['marketing','trafego','ads','campanha','performance','growth','funil','cpc','cpa','roas','midia'],
    ecommerce:['ecommerce','e-commerce','loja','shopify','catalogo','checkout','logistica','pedido','pedidos'],
    bi:['bi','dashboard','dados','metrica','metricas','dre','financeiro','finance','indicador','indicadores','relatorio'],
    technology:['tec','tecnologia','sistema','sistemas','software','backend','api','apis','python','java','kotlin','infra','seguranca','criptografia'],
    stack:['stack','linguagem','linguagens','ferramenta','ferramentas','programa','programas','framework','frameworks'],
    automation:['automat','automacao','automacoes','workflow','workflows','agente','agentes','ia','inteligencia artificial','integracao','integracoes'],
    branding:['branding','marca','identidade','ux','ui','design','criativo','criativos','visual'],
    process:['metodo','processo','processos','como funciona','etapas','diagnostico','estrategia'],
    team:['equipe','time','fundadores','donos','pessoas','raphael','victor','wadson','fabiano'],
    contact:['contato','falar','whatsapp','contratar','humano','reuniao','reunião'],
    budget:['preco','valor','orcamento','budget','cost','price','custo'],
    timing:['prazo','tempo','deadline','timeline','quando','rapido','rápido']
  };
  let best='unknown',score=0;
  for(const [intent,words] of Object.entries(intents)){
    const local=words.reduce((sum,w)=>{
      const hit=w.length<=3 ? new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`).test(q) : q.includes(w);
      return sum+(hit?(w.length>4?2:1):0);
    },0);
    if(local>score){score=local;best=intent}
  }
  return {intent:best,score};
}

/* ==================== CHAT / SAUDAÇÃO INTELIGENTE E BILÍNGUE ==================== */
function contextualGreeting(){
  const hour=new Date().getHours();
  const lang=state.chatResponseLang||state.lang;
  if(lang==='PT'){
    const prefix=hour<12?'Bom dia.':hour<18?'Boa tarde.':'Boa noite.';
    const variants=[
      `${prefix} 👋 Aqui é a IMPLACÁVEL AI. Me conta o que você está tentando melhorar hoje. Pode ser direto: vendas, operação, dados, tecnologia ou marca.`,
      `${prefix} 👋 Sou a IMPLACÁVEL AI. Vamos direto ao ponto: qual parte da operação está mais difícil hoje?`,
      `${prefix} 👋 Estou por aqui para organizar a conversa. Você quer falar de vendas, Growth, e-commerce, dados, tecnologia ou automação?`
    ];
    return variants[state.chatTurns%variants.length];
  }
  const prefix=hour<12?'Good morning.':hour<18?'Good afternoon.':'Good evening.';
  const variants=[
    `${prefix} 👋 This is IMPLACÁVEL AI. Tell me what you are trying to improve today. Be direct: sales, operations, data, technology or brand.`,
    `${prefix} 👋 I’m the IMPLACÁVEL AI assistant. Let’s keep it practical: what part of the operation is hardest right now?`,
    `${prefix} 👋 I’m here to organize the conversation. Do you want to talk about sales, Growth, e-commerce, data, technology or automation?`
  ];
  return variants[state.chatTurns%variants.length];
}

/* ==================== CHAT / MEMÓRIA DE CONTEXTO E SINAIS DO VISITANTE ==================== */
function updateChatMemory(query,intent){
  const q=normalizeQuery(query);
  if(intent && intent!=='unknown') state.chatContext.topic=intent;
  if(/loja|ecommerce|e-commerce|checkout|shopify|catalogo/.test(q)) state.chatContext.captured.businessModel='ecommerce';
  if(/lead|pipeline|prospeccao|prospeccao|cliente|venda|vendas|fatur/.test(q)) state.chatContext.captured.need='sales';
  if(/dashboard|kpi|metric|metrica|dre|finance/.test(q)) state.chatContext.captured.need='bi';
  if(/api|backend|software|sistema|codigo|python|java|kotlin|react/.test(q)) state.chatContext.captured.need='technology';
  if(/automat|workflow|agente|copilot/.test(q)) state.chatContext.captured.need='automation';
  if(/marca|branding|ux|ui|design/.test(q)) state.chatContext.captured.need='branding';
}

function contextualFollowUp(topic,pt){
  const map={
    sales:pt?'Posso aprofundar por aquisição, conversão ou processo comercial. Qual deles está mais pressionado hoje?':'I can go deeper into acquisition, conversion, or the sales process. Which one is under the most pressure today?',
    growth:pt?'Posso entrar em funil, oferta, mídia ou leitura de performance. Onde você sente que o dinheiro está vazando?':'I can go deeper into funnels, offers, media, or performance analysis. Where do you feel the money is leaking?',
    ecommerce:pt?'Posso olhar checkout, catálogo, logística ou margem. O problema aparece antes da compra ou depois do pedido?':'I can look at checkout, catalog, logistics, or margin. Does the problem show up before purchase or after the order?',
    bi:pt?'Posso começar por KPIs, DRE ou dashboards. O que hoje é mais difícil: encontrar os dados ou decidir com eles?':'I can start with KPIs, P&L, or dashboards. What is harder today: finding the data or making decisions with it?',
    technology:pt?'Posso detalhar sistemas, APIs, backend, segurança ou arquitetura. Você quer construir, integrar ou automatizar?':'I can detail systems, APIs, backend, security, or architecture. Do you want to build, integrate, or automate?',
    automation:pt?'Posso mapear um fluxo e mostrar onde automatizar primeiro. Qual tarefa repetitiva mais consome tempo hoje?':'I can map a workflow and show where to automate first. Which repetitive task consumes the most time today?',
    branding:pt?'Posso separar posicionamento, UX/UI e direção visual. O desafio é percepção, clareza ou conversão?':'I can separate positioning, UX/UI, and visual direction. Is the challenge perception, clarity, or conversion?',
    process:pt?'Posso explicar cada etapa e o que entra em cada uma. Você está no diagnóstico ou já executando?':'I can explain each stage and what goes into it. Are you at diagnosis or already executing?',
    team:pt?'Posso detalhar o papel de cada fundador e como as frentes se conectam. Quer ver por área?':'I can detail each founder’s role and how the fronts connect. Do you want to see it by area?',
    stack:pt?'Posso abrir a stack por desenvolvimento, dados, cloud, segurança, criativo, marketing ou automação. Qual grupo interessa mais?':'I can break the stack down into development, data, cloud, security, creative, marketing, or automation. Which group interests you most?',
    contact:pt?'Posso te orientar para o contato e já deixar o contexto organizado. O objetivo é conversar sobre projeto, parceria ou diagnóstico?':'I can take you to contact and keep the context organized. Is the goal a project, partnership, or diagnosis?',
    budget:pt?'Posso ajudar a enquadrar o escopo antes de falar em preço. Você busca algo pontual ou uma operação recorrente?':'I can help frame the scope before talking price. Are you looking for a one-off project or an ongoing operation?'
  };
  return map[topic]|| (pt?'Me conta mais sobre o cenário e eu continuo daqui.':'Tell me a little more about the scenario and I’ll continue from there.');
}

function smartChatReply(query){
  const q=normalizeQuery(query);
  responseLanguage(query);
  const pt=state.chatResponseLang==='PT';
  const say=(a,b)=>pt?a:b;
  const {intent,score}=detectChatIntent(query);
  state.chatContext.stage='active';
  updateChatMemory(query,intent);
  if(intent==='greeting'){
    state.chatContext.topic='greeting';
    return contextualGreeting();
  }
  if(/(me explique melhor|explique melhor|fala mais|fale mais|tell me more|explain more|go deeper|more details)/.test(q)){
    const topic=state.chatContext.topic;
    return contextualFollowUp(topic,pt);
  }
  if(/(o que recomenda|que voce recomenda|qual recomenda|qual o melhor caminho|what do you recommend|what would you recommend|best approach|best path)/.test(q)){
    const topic=state.chatContext.topic;
    const rec={
      sales:say('Eu começaria medindo onde a venda quebra: aquisição, conversão ou processo comercial. Só depois mexeria no investimento.','I would start by measuring where the sale breaks: acquisition, conversion, or the sales process. Only then would I change the investment.'),
      growth:say('Eu começaria pelo funil e pela qualidade da demanda. Aumentar tráfego antes de corrigir a conversão só amplia o desperdício.','I would start with the funnel and demand quality. Increasing traffic before fixing conversion usually just scales the waste.'),
      ecommerce:say('Eu começaria pelo caminho do pedido: descoberta, produto, checkout, pagamento, logística e pós-venda. Isso mostra onde a margem e a conversão estão escapando.','I would start with the order journey: discovery, product, checkout, payment, logistics, and after-sales. That shows where margin and conversion are leaking.'),
      bi:say('Eu começaria pelos indicadores que explicam decisão, não pelos que apenas parecem bonitos no dashboard.','I would start with the indicators that explain decisions, not the ones that merely look good on a dashboard.'),
      technology:say('Eu começaria pelo processo e pelos requisitos. Depois arquitetura, integração e stack. Escolher tecnologia antes do problema costuma sair caro.','I would start with the process and requirements. Then architecture, integration, and stack. Choosing technology before the problem often gets expensive.'),
      automation:say('Eu começaria pela tarefa repetitiva com maior volume e regra mais estável. É onde a automação costuma gerar aprendizado rápido.','I would start with the repetitive task with the highest volume and the most stable rules. That is usually where automation teaches you the most, fastest.'),
      branding:say('Eu começaria por posicionamento e clareza da proposta. A estética entra para reforçar a mensagem, não para esconder uma mensagem fraca.','I would start with positioning and offer clarity. Aesthetics should reinforce the message, not hide a weak one.'),
      process:say('Eu começaria pelo diagnóstico. Sem entender o estado atual, o plano vira opinião com layout bonito.','I would start with diagnosis. Without understanding the current state, the plan becomes opinion wrapped in nice slides.'),
      stack:say('Eu escolheria a stack pela função e pelo nível de manutenção necessário. Não existe uma tecnologia “melhor” fora de contexto.','I would choose the stack by function and maintenance needs. There is no “best” technology outside context.')
    };
    if(rec[topic]) return rec[topic];
  }
  if(/(como voces podem me ajudar|como podem ajudar|can you help|how can you help|what can you help with)/.test(q)){
    return say('Posso organizar o problema com você. Me diga o objetivo e o principal gargalo; daí eu separo a frente certa e te mostro o próximo passo.','I can help frame the problem with you. Tell me the goal and the main bottleneck; then I can separate the right workstream and show the next step.');
  }
  if(/^(obrigad|valeu|thanks|thank you)/.test(q)) return say('Por nada. Agora que já estamos conversando como gente normal, me conta qual é o gargalo de verdade.','You’re welcome. Now that we are talking like normal humans, tell me the real bottleneck.');
  if(/^(sim|s|ok|beleza|blz|show|certo|isso|e isso)/.test(q)){
    const t=state.chatContext.topic;
    const follow={
      growth:say('Perfeito. No Growth, eu começaria por aquisição, conversão e qualidade do tráfego. Hoje o maior problema está em gerar demanda ou em transformar demanda em venda?','Good. On Growth, I would start with acquisition, conversion and traffic quality. Is the bigger issue generating demand or turning demand into sales?'),
      ecommerce:say('Perfeito. Em e-commerce, eu olharia plataforma, checkout, operação, logística e margem. O gargalo está antes da compra ou depois que o pedido entra?','Good. In e-commerce, I would look at platform, checkout, operations, logistics and margin. Is the bottleneck before purchase or after the order comes in?'),
      technology:say('Certo. Em tecnologia, a pergunta principal é o processo que precisa ficar mais previsível. Você quer construir algo novo, integrar ferramentas ou automatizar uma rotina?','Got it. In technology, the main question is which process needs to become more predictable. Do you want to build something new, integrate tools, or automate a routine?'),
      bi:say('Certo. Em BI, eu começaria pelos indicadores críticos. Você hoje sofre mais com falta de dados ou com excesso de dados sem leitura?','Got it. In BI, I would start with the critical indicators. Is the issue lack of data or too much data without interpretation?'),
      branding:say('Perfeito. Em marca e experiência, eu separaria percepção, posicionamento e conversão. Você quer reposicionar a marca ou melhorar como o usuário entende e usa o produto?','Good. In brand and experience, I would separate perception, positioning and conversion. Do you want to reposition the brand or improve how users understand and use the product?'),
      contact:say('Perfeito. Vamos tirar isso da conversa e colocar em pauta. Preencha o contato com contexto, objetivo e urgência.','Perfect. Let’s move this from chat to action. Fill the contact form with context, objective and urgency.')
    }[t];
    if(follow)return follow;
  }
  if(/quem são vocês|quem é a implacável|o que vocês fazem|o que a implacável faz|sobre a empresa|sobre vocês/.test(q)){
    state.chatContext.topic='about';
    return say('Somos uma operação multidisciplinar que conecta Growth, BI, tecnologia e execução. Em vez de vender uma ferramenta isolada, organizamos o problema e montamos a frente necessária para resolvê-lo.','We are a multidisciplinary operation connecting Growth, BI, technology and execution. Instead of selling an isolated tool, we organize the problem and build the workstream needed to solve it.');
  }
  if(/tecnologias|ferramentas|programas|stack|software que usam|linguagens/.test(q)){
    state.chatContext.topic='stack';
    return say('A base é modular: Java, Kotlin, Python, JavaScript, TypeScript, HTML, CSS, React, SQL/PostgreSQL, Git/GitHub, BI, APIs, automação e ferramentas criativas e de mídia. Você pode ver a arquitetura completa na seção de tecnologias.','The stack is modular: Java, Kotlin, Python, JavaScript, TypeScript, HTML, CSS, React, SQL/PostgreSQL, Git/GitHub, BI, APIs, automation, plus creative and media tools. The full architecture is in the technology section.');
  }
  if(/instagram|github|facebook|linkedin|rede social|redes sociais/.test(q)){
    state.chatContext.topic='contact';
    return say('Os canais ficam na seção de contato. O Instagram da marca está conectado; os demais links podem ser configurados no bloco IMPLACAVEL_CONFIG.','The channels live in the contact section. The brand Instagram is connected; the remaining links can be configured in IMPLACAVEL_CONFIG.');
  }
  const responseMap={
    sales:say('Se a meta é vender mais, eu não começaria jogando anúncio. Primeiro eu separaria aquisição, conversão, oferta, processo comercial e retenção. Depois escolhemos a frente que merece investimento.','If the goal is more sales, I would not start by throwing ads at the problem. First I would separate acquisition, conversion, offer, sales process and retention. Then we choose where investment belongs.'),
    growth:say('Growth aqui significa juntar mídia, oferta, funil e leitura de resultado. A ideia é descobrir onde cada real ou cada hora de trabalho está travando o avanço.','Growth here means connecting media, offer, funnel and outcome analysis. The goal is to find where each real or each hour of work is blocking progress.'),
    ecommerce:say('Para e-commerce, a leitura precisa atravessar a jornada inteira: catálogo, tráfego, checkout, pedido, logística, fiscal, atendimento e margem.','For e-commerce, the view has to cross the entire journey: catalog, traffic, checkout, order, logistics, tax, service and margin.'),
    bi:say('BI serve para reduzir dúvida operacional. Dashboards, DRE e KPIs só valem quando ajudam alguém a decidir o próximo movimento com mais segurança.','BI exists to reduce operational uncertainty. Dashboards, P&L and KPIs only matter when they help someone decide the next move with more confidence.'),
    technology:say('Tecnologia entra quando o processo precisa de previsibilidade, integração ou escala. Podemos falar de sistemas sob medida, backend, APIs, automação ou segurança.','Technology comes in when a process needs predictability, integration or scale. That can mean custom systems, backend, APIs, automation or security.'),
    automation:say('Automação e IA fazem sentido quando existe um fluxo repetitivo e mensurável. O primeiro passo é mapear a tarefa, as regras e a saída esperada.','Automation and AI make sense when there is a repetitive, measurable flow. The first step is mapping the task, rules and expected output.'),
    branding:say('Marca e UX precisam ser legíveis antes de serem bonitas. Posicionamento, interface e direção visual trabalham juntos para tornar a proposta mais clara e mais fácil de escolher.','Brand and UX need to be legible before being beautiful. Positioning, interface and visual direction work together to make the offer clearer and easier to choose.'),
    process:say('O método é diagnóstico, estratégia, execução, otimização e escala. A ideia é deixar cada etapa mais previsível do que a anterior.','The method is diagnosis, strategy, execution, optimization and scale. Each stage should make the next one more predictable.'),
    team:say('A operação é formada por Raphael, Victor, Wadson e Fabiano, cada um em uma frente complementar. A seção de equipe foi preparada para receber os retratos e detalhes de cada fundador.','The operation is built around Raphael, Victor, Wadson and Fabiano, each covering a complementary front. The team section is prepared to receive portraits and details for each founder.'),
    contact:say('Claro. Para falar com a equipe, use o formulário de contato. Quanto melhor o contexto, mais objetiva tende a ser a primeira resposta.','Absolutely. To talk to the team, use the contact form. The better the context, the more focused the first response tends to be.'),
    stack:say('A stack é modular: Java, Kotlin, Python, JavaScript, TypeScript, HTML, CSS, React, SQL/PostgreSQL, Git/GitHub, BI, APIs, automação e ferramentas criativas e de mídia. A escolha depende do problema, não da moda.','The stack is modular: Java, Kotlin, Python, JavaScript, TypeScript, HTML, CSS, React, SQL/PostgreSQL, Git/GitHub, BI, APIs, automation, plus creative and media tools. The choice depends on the problem, not the trend.'),
    budget:say('Preço depende do escopo e da profundidade da operação. Antes de falar em número, eu fecharia o problema, a frente e o nível de envolvimento necessário.','Pricing depends on scope and operational depth. Before talking numbers, I would define the problem, workstream and level of involvement.'),
    timing:say('Prazo depende da frente e das integrações envolvidas. Estratégia e diagnóstico avançam em um ritmo; sistemas e automações podem exigir outro.','Timing depends on the workstream and integrations involved. Strategy and diagnosis move at one pace; systems and automation may require another.')
  };
  if(responseMap[intent]){state.chatContext.topic=intent; return responseMap[intent];}
  if(score===0){
    const options=pt?[
      'Entendi. Me dá um pouco mais de contexto. O que você quer melhorar primeiro: vendas, operação, dados, tecnologia ou marca?',
      'Vamos organizar isso. Qual é o resultado que você quer alcançar e o que mais está atrapalhando hoje?',
      'Pode falar do jeito que você falaria com uma pessoa. Eu separo o problema por frente e continuo daqui.'
    ]:[
      'Got it. Give me a little more context. What do you want to improve first: sales, operations, data, technology, or brand?',
      'Let’s frame it. What result are you trying to reach, and what is getting in the way today?',
      'Talk to me naturally. I’ll separate the problem by workstream and take it from there.'
    ];
    return options[state.chatTurns%options.length];
  }
  return chatReplyLegacy(query);
}

/* ==================== CHAT / RENDERIZAÇÃO DE MENSAGENS ==================== */
function addChatMessage(role,text){
  const body=document.getElementById('chatBody');
  const div=document.createElement('div');
  div.className=`chat-message ${role}`;
  div.textContent=text;
  body.appendChild(div);
  body.scrollTop=body.scrollHeight;
}
function addChatAction(label,id){
  const body=document.getElementById('chatBody');
  const row=document.createElement('div');
  row.className='chat-inline-action';
  const button=document.createElement('button');
  button.type='button';
  button.textContent=label;
  button.addEventListener('click',()=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});closeChat()});
  row.appendChild(button); body.appendChild(row); body.scrollTop=body.scrollHeight;
}
/* ==================== CHAT / ENVIO, IA LOCAL E IA REMOTA ==================== */
async function sendChat(text){
  if(state.chatBusy)return;
  const q=text.trim(); if(!q)return;
  state.chatBusy=true;
  responseLanguage(q);
  addChatMessage('user',q);
  state.chatHistory.push({role:'user',content:q});
  const input=document.getElementById('chatInput'); if(input)input.value='';
  const quick=document.getElementById('quickActions');
  if(quick) quick.classList.add('is-hidden');
  const suggestionsToggle=document.getElementById('chatSuggestionsToggle');
  if(suggestionsToggle){
    suggestionsToggle.setAttribute('aria-expanded','false');
    suggestionsToggle.closest('.chat-suggestions-toggle')?.classList.add('is-first-turn-hidden');
  }
  const body=document.getElementById('chatBody');
  const typing=document.createElement('div'); typing.className='chat-message bot'; typing.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
  body.appendChild(typing); body.scrollTop=body.scrollHeight;
  // NO ARTIFICIAL WAIT: LOCAL REPLIES FEEL INSTANT; REMOTE ENDPOINTS USE REAL NETWORK LATENCY.
  await new Promise(requestAnimationFrame);
  let reply='';
  try{
    if(CONFIG.aiEndpoint){
      const response=await fetch(CONFIG.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,lang:state.chatResponseLang||state.lang,uiLang:state.lang,history:state.chatHistory.slice(-10),context:state.chatContext,brand:'IMPLACÁVEL',instruction:`Reply only in ${state.chatResponseLang||state.lang==='PT'?'Brazilian Portuguese':'English'}.`})});
      if(!response.ok)throw new Error('AI endpoint failed');
      const payload=await response.json();
      reply=payload.reply||payload.message||'';
      if(!reply)throw new Error('empty AI reply');
    }else{
      reply=smartChatReply(q);
    }
  }catch(error){
    reply=smartChatReply(q);
  }
  typing.remove();
  addChatMessage('bot',reply);
  state.chatHistory.push({role:'assistant',content:reply});
  state.chatBusy=false;
  const lower=normalizeQuery(q);
  const jump=(id,label)=>setTimeout(()=>addChatAction(label,id),90);
  const detected=detectChatIntent(q).intent;
  if(['services','growth','ecommerce','sales'].includes(detected)) jump('solutions',state.chatResponseLang==='PT'?'Abrir soluções':'View solutions');
  else if(detected==='technology'||detected==='automation') jump('technology',state.chatResponseLang==='PT'?'Ver tecnologia':'View technology');
  else if(detected==='stack') jump('stack',state.chatResponseLang==='PT'?'Ver tecnologias e ferramentas':'View technologies and tools');
  else if(detected==='bi') jump('cases',state.chatResponseLang==='PT'?'Ver leitura executiva':'View executive reading');
  else if(detected==='process') jump('process',state.chatResponseLang==='PT'?'Ver método':'View method');
  else if(detected==='team') jump('team',state.chatResponseLang==='PT'?'Conhecer a equipe':'Meet the team');
  else if(['contact','budget'].includes(detected)) jump('contact',state.chatResponseLang==='PT'?'Abrir contato':'Open contact');
  else if(detected==='growth'||/traffic|performance/.test(lower)) jump('traffic',state.chatResponseLang==='PT'?'Ver performance':'View performance');
}

/* ==================== CHAT / TRADUÇÃO DA INTERFACE ==================== */
function refreshChatLanguage(){
  const pt=state.lang==='PT';
  const subtitle=document.getElementById('chatSubtitle');
  if(subtitle)subtitle.textContent=pt?'ASSISTENTE ESTRATÉGICO · CONTEXTO DE NEGÓCIO · RESPOSTAS CONTEXTUAIS.':'STRATEGIC ASSISTANT · BUSINESS CONTEXT · CONTEXTUAL RESPONSES.';
  const labels=pt?['Conhecer os serviços','Preciso aumentar minhas vendas','Quero automatizar minha operação','Preciso desenvolver um sistema','Quero falar com a equipe']:['Explore the services','I need to increase sales','I want to automate my operation','I need a custom system','I want to talk to the team'];
  document.querySelectorAll('#quickActions button').forEach((b,i)=>{
    if(labels[i]) b.textContent=labels[i];
    const intents=['services','sales','automation','technology','team'];
    b.dataset.chatIntent=intents[i]||'';
  });
  const input=document.getElementById('chatInput'); if(input)input.placeholder=pt?'Digite sua mensagem...':'Type your message...';
  const sug=document.getElementById('chatSuggestionsToggle'); if(sug)sug.textContent=pt?'SUGESTÕES':'SUGGESTIONS';  const note=document.getElementById('chatDemoNote'); if(note)note.textContent=pt?'ASSISTENTE DIGITAL · CONTEXTO DA IMPLACÁVEL.':'DIGITAL ASSISTANT · IMPLACÁVEL CONTEXT.';  const fab=document.getElementById('chatFab'); if(fab)fab.setAttribute('aria-label',pt?'Abrir IMPLACÁVEL AI':'Open IMPLACÁVEL AI'); const close=document.getElementById('chatClose'); if(close)close.setAttribute('aria-label',pt?'Fechar chat':'Close chat');
}

/* ==================== ACESSIBILIDADE / ATALHOS DE TECLADO ==================== */
function setupKeyboardShortcuts(){
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeChat();
      closeMobileMenu();
    }
  });
}

/* ==================== TEMA / DARK E LIGHT MODE ==================== */
function applyTheme(theme){
  const light=theme==='light';
  document.body.classList.toggle('theme-light',light);
  document.documentElement.style.background=light?'#f4f2ed':'#070707';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content',light?'#f4f2ed':'#070707');
  const btn=document.getElementById('themeToggle');
  btn?.setAttribute('aria-pressed',String(light));
  btn?.setAttribute('aria-label',light?'Ativar modo escuro':'Ativar modo claro');
  SAFE_STORAGE.set('implacavel:theme',theme);
}

/* ==================== CURSOR / INTERAÇÃO EM TEMPO REAL ==================== */
function setupThematicCursor(){
  const dot=document.getElementById('cursorDot'),ring=document.getElementById('cursorRing'),cross=document.getElementById('cursorCrosshair');
  if(!dot||!ring||!cross||window.matchMedia('(pointer: coarse)').matches)return;
  window.addEventListener('pointermove',e=>{
    const x=e.clientX,y=e.clientY;
    const px=(x/window.innerWidth)*100,py=(y/window.innerHeight)*100;
    dot.style.transform=`translate3d(${x-3}px,${y-3}px,0)`;
    ring.style.transform=`translate3d(${x-18}px,${y-18}px,0)`;
    cross.style.transform=`translate3d(${x-7}px,${y-7}px,0)`;
    document.documentElement.style.setProperty('--page-x',`${x}px`);
    document.documentElement.style.setProperty('--page-y',`${y}px`);
    document.documentElement.style.setProperty('--mouse-x',`${px}%`);
    document.documentElement.style.setProperty('--mouse-y',`${py}%`);
    document.documentElement.style.setProperty('--hero-parallax-x',`${(px-50)/18}px`);
    document.documentElement.style.setProperty('--hero-parallax-y',`${(py-50)/18}px`);
  },{passive:true});
  document.addEventListener('pointerover',e=>{if(e.target.closest('a,button,input,textarea,select,.person-card,.service-card,.operation-card,.about-card,.process-card,.tech-card,.ad-card,.stack-group,.social-card'))document.body.classList.add('cursor-focus');});
  document.addEventListener('pointerout',e=>{if(e.target.closest('a,button,input,textarea,select,.person-card,.service-card,.operation-card,.about-card,.process-card,.tech-card,.ad-card,.stack-group,.social-card'))document.body.classList.remove('cursor-focus');});
}

/* ==================== MICROINTERAÇÃO / GLOW DOS CARDS ==================== */
function setupPointerGlow(){
  const cards=document.querySelectorAll('.about-card,.service-card,.operation-card,.person-card,.process-card,.tech-card,.ad-card,.stack-group,.social-card');
  cards.forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`)},{passive:true}));
}

/* ==================== TERMINAL / ABAS CORE, LAB E LIVE ==================== */
function setTerminalTab(tab){
  state.terminalTab=tab;
  document.querySelectorAll('[data-terminal-tab]').forEach(btn=>{const active=btn.dataset.terminalTab===tab;btn.classList.toggle('is-active',active);btn.setAttribute('aria-selected',String(active));});
  document.querySelectorAll('[data-terminal-pane]').forEach(p=>p.classList.toggle('is-active',p.dataset.terminalPane===tab));
  const label=document.querySelector('.terminal-tab-label');
  if(label) label.textContent = tab==='core'?'IMPLACAVEL@CORE:~':tab==='lab'?'IMPLACAVEL@LAB:~':'IMPLACAVEL@LIVE:~';
}
function updateTerminalActivity(label,kind='interaction'){
  const clean=String(label||'interação').replace(/\s+/g,' ').trim().slice(0,64);
  state.interactions.unshift({label:clean,kind,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})});
  state.interactions=state.interactions.slice(0,8);
  const log=document.getElementById('activityLog'); if(!log) return;
  log.innerHTML=state.interactions.map(item=>`<div><span>&gt;</span> <b>${escapeHTML(item.time)}</b> <span class="activity-kind">${escapeHTML(item.kind.toUpperCase())}</span> <em>${escapeHTML(item.label)}</em></div>`).join('');
}
/* ==================== STACK / FILTROS E TECNOLOGIAS ==================== */
function setupTechCatalog(){
  const root=document.getElementById('techCatalog');
  if(!root)return;
  const filters=document.querySelectorAll('[data-tech-filter]');
  const items=root.querySelectorAll('.tech-item');
  const status=document.getElementById('techCatalogStatus');
  let active='all';
  const sync=()=>{
    items.forEach(item=>{
      const show=active==='all'||item.dataset.techCategory===active;
      item.hidden=!show;
      item.classList.toggle('is-visible',show);
    });
    filters.forEach(btn=>{
      const selected=active!=='all' && btn.dataset.techFilter===active;
      btn.classList.toggle('is-active',selected);
      btn.setAttribute('aria-selected',String(selected));
    });
    if(status)status.textContent=active==='all'?'CATÁLOGO BASE COMPLETO':String(active).toUpperCase()+' · FILTRO ATIVO';
  };
  filters.forEach(btn=>btn.addEventListener('click',()=>{const next=btn.dataset.techFilter;active=active===next?'all':next;sync();updateTerminalActivity('filtro / '+(active==='all'?'catálogo completo':active),'stack');}));
  items.forEach(item=>item.addEventListener('click',()=>{
    items.forEach(other=>other.classList.remove('is-selected'));
    item.classList.add('is-selected');
    if(status)status.textContent='SELECIONADO · '+(item.dataset.interact||'TECNOLOGIA').toUpperCase();
    updateTerminalActivity('stack / '+(item.dataset.interact||'tecnologia'),'stack');
  }));
  sync();
}

/* ==================== TERMINAL / LAB E REGISTRO DE EVENTOS ==================== */
function setupTerminal(){
  document.querySelectorAll('[data-terminal-tab]').forEach(btn=>btn.addEventListener('click',()=>{setTerminalTab(btn.dataset.terminalTab);updateTerminalActivity('terminal / '+btn.dataset.terminalTab,'tab') }));
  document.querySelectorAll('[data-lab]').forEach(btn=>btn.addEventListener('click',()=>{
    const out=document.getElementById('labOutput'); if(!out) return;
    const map={
      growth:['GROWTH','Separar aquisição, conversão e qualidade do tráfego antes de aumentar investimento.','FOCO: FUNIL · OFERTA · MARGEM'],
      data:['BI / DADOS','Definir os indicadores que explicam o gargalo antes de desenhar um dashboard.','FOCO: KPI · DRE · DECISÃO'],
      tech:['TECNOLOGIA','Mapear o processo, integrações e risco antes de escolher stack ou arquitetura.','FOCO: PROCESSO · API · ESCALA']
    };
    const [title,text,signal]=map[btn.dataset.lab];
    out.innerHTML=`<span class="lab-code">[${escapeHTML(title)}]</span><strong>${escapeHTML(signal)}</strong><p>${escapeHTML(text)}</p><span class="lab-caret">_</span>`;
    updateTerminalActivity('lab / '+title,'lab');
  }));
}
/* ==================== LIVE SYSTEM / FEED DE INTERAÇÕES ==================== */
function setupGlobalInteractionFeed(){
  if(window.__implacavelFeedBound)return; window.__implacavelFeedBound=true;
  document.addEventListener('click',e=>{
    const el=e.target.closest('a,button,input,select,textarea,[data-interact],.pillar-head,.metric,.social-card,.stack-group');
    if(!el)return;
    let label=el.dataset.interact||el.getAttribute('aria-label')||el.querySelector('h3, h4, b, span')?.textContent||el.textContent||'interação';
    updateTerminalActivity(label,'site');
  },true);
}

/* ==================== BOOTSTRAP / INICIALIZAÇÃO GLOBAL ==================== */
function initGlobal(){
  clearInitialChatState();
  applyTheme(state.theme);
  document.getElementById('themeToggle')?.addEventListener('click',()=>{state.theme=state.theme==='light'?'dark':'light';applyTheme(state.theme)});
  setupThematicCursor();
  document.getElementById('languageSelect').addEventListener('change',e=>{state.lang=e.target.value;SAFE_STORAGE.set('implacavel:lang',state.lang);render()});
  document.getElementById('menuToggle').addEventListener('click',()=>{const h=document.getElementById('siteHeader');const is=h.classList.toggle('menu-open');document.getElementById('menuToggle').setAttribute('aria-expanded',String(is));document.body.classList.toggle('nav-locked',is)});
  document.getElementById('chatFab').addEventListener('click',()=>state.chatOpen?closeChat():openChat());
  document.getElementById('chatSuggestionsToggle')?.addEventListener('click',()=>{const q=document.getElementById('quickActions');if(!q)return;const hidden=q.classList.toggle('is-hidden');document.getElementById('chatSuggestionsToggle')?.setAttribute('aria-expanded',String(!hidden));});
  document.getElementById('chatClose').addEventListener('click',closeChat);
  document.querySelectorAll('#quickActions button').forEach(b=>b.addEventListener('click',()=>sendChat(b.textContent)));
  document.getElementById('chatForm').addEventListener('submit',e=>{e.preventDefault();sendChat(document.getElementById('chatInput').value)});
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;document.getElementById('scrollProgress').style.width=`${max>0?(window.scrollY/max)*100:0}%`};
  window.addEventListener('scroll',updateProgress,{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});
  updateProgress();
  setupKeyboardShortcuts();
  setupGlobalInteractionFeed();
}

/* ==================== FIM DAS FUNÇÕES PRINCIPAIS / INÍCIO DO BOOT ==================== */
try {
  initGlobal();
  render();
  requestAnimationFrame(setupPointerGlow);
  document.body.classList.add('app-ready');
  document.documentElement.classList.add('app-ready');
} catch (error) {
  console.error('[IMPLACÁVEL] Initialization failed:', error);
  document.body.classList.remove('app-ready');
  document.documentElement.classList.remove('app-ready');
}
