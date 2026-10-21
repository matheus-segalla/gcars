import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare,
  Navigation,
  Sparkles,
  Lock,
  ChevronRight,
  Gauge,
  Cpu,
  Flame,
  Check,
  AlertTriangle,
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const TELEFONE_FORMATADO = "(11) 4014-7245";
  const TELEFONE_LINK = "551140147245";
  const ENDERECO_COMPLETO = "R. Pereira Cardoso, 749, Morungaba - SP, 13260-000";
  const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=R.+Pereira+Cardoso,+749,+Morungaba+-+SP";
  const WAZE_URL = "https://waze.com/ul?q=Rua+Pereira+Cardoso+749+Morungaba+SP";
  const WHATSAPP_BASE = `https://wa.me/${TELEFONE_LINK}`;
  
  const getWhatsappUrl = (assunto) => {
    const texto = assunto 
      ? `Olá! Gostaria de mais informações e orçamento sobre *${assunto}* na GCARS.`
      : "Olá! Gostaria de solicitar um orçamento para meu veículo na GCARS Reparos Automotivos.";
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(texto)}`;
  };

  // Dia atual da semana (0: Domingo, 1: Segunda ... 6: Sábado)
  const diaSemanaAtual = new Date().getDay();

  // Status de funcionamento em tempo real
  const statusFuncionamento = useMemo(() => {
    const agora = new Date();
    const dia = agora.getDay();
    const hora = agora.getHours() + agora.getMinutes() / 60;

    // Sábado (6) e Domingo (0) fechado
    if (dia === 0 || dia === 6) {
      return { aberto: false, texto: "Fechado no momento (Abre segunda às 07:30)" };
    }
    // Sexta-feira: 07:30 às 17:00
    if (dia === 5) {
      if (hora >= 7.5 && hora < 17) return { aberto: true, texto: "Aberto agora até às 17:00" };
      return { aberto: false, texto: "Fechado no momento (Abre segunda às 07:30)" };
    }
    // Segunda a Quinta: 07:30 às 18:00
    if (dia >= 1 && dia <= 4) {
      if (hora >= 7.5 && hora < 18) return { aberto: true, texto: "Aberto agora até às 18:00" };
      return { aberto: false, texto: "Fechado no momento (Abre amanhã às 07:30)" };
    }
    return { aberto: false, texto: "Fechado" };
  }, []);

  // Catálogo de Serviços Estilo Netflix
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');

  const servicosCatalogo = [
    {
      id: "oleo-motor",
      categoria: "preventiva",
      titulo: "Troca de Óleo de Motor & Filtros",
      subtitulo: "Lubrificantes 100% Homologados",
      desc: "Troca completa do óleo com viscosidade recomendada pela montadora, incluindo filtro de óleo, ar, combustível e cabine.",
      foto: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
      destaque: "Essencial",
      itens: ["Óleo sintético ou semissintético", "Filtro de óleo novo", "Check-up de níveis gratuitos"]
    },
    {
      id: "injecao",
      categoria: "eletronica",
      titulo: "Injeção Eletrônica & Diagnóstico Avançado",
      subtitulo: "Scanner de Última Geração",
      desc: "Diagnóstico computadorizado de falhas, bicos injetores, sensores, luz de injeção acesa e ajuste de consumo excessivo.",
      foto: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
      destaque: "Alta Tecnologia",
      itens: ["Leitura de parâmetros com scanner", "Limpeza de bicos e TBI", "Correção de consumo e falhas"]
    },
    {
      id: "freios",
      categoria: "seguranca",
      titulo: "Freios, ABS & Pastilhas",
      subtitulo: "Segurança Máxima para Você e Sua Família",
      desc: "Revisão e substituição de pastilhas, discos, fluido de freio DOT 4 / 5.1, tambores, lonas e sangria computadorizada do sistema ABS.",
      foto: "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?auto=format&fit=crop&w=800&q=80",
      destaque: "Item de Segurança",
      itens: ["Pastilhas de cerâmica/metálicas", "Discos de freio ventilados", "Teste de umidade do fluido"]
    },
    {
      id: "suspensao",
      categoria: "mecanica",
      titulo: "Suspensão, Amortecedores & Direção",
      subtitulo: "Conforto e Estabilidade ao Dirigir",
      desc: "Manutenção de amortecedores, molas, batentes, buchas, pivôs, terminais de direção e bandejas para eliminar ruídos e instabilidade.",
      foto: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80",
      destaque: "Conforto",
      itens: ["Eliminação de barulhos e rangidos", "Peças originais ou premium", "Alinhamento e balanceamento"]
    },
    {
      id: "motor",
      categoria: "mecanica",
      titulo: "Motor, Câmbio Manual & Embreagem",
      subtitulo: "Mecânica Pesada e Reparo Confiável",
      desc: "Troca de correia dentada, bomba d'água, retífica de cabeçote, kits de embreagem e reparos completos de motor e câmbio manual.",
      foto: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
      destaque: "Alta Precisão",
      itens: ["Kit de correia dentada e tensores", "Substituição de platô e disco", "Vedação de vazamentos de óleo"]
    },
    {
      id: "arrefecimento",
      categoria: "preventiva",
      titulo: "Arrefecimento, Radiador & Bomba d'Água",
      subtitulo: "Proteção Contra Superaquecimento",
      desc: "Limpeza completa do sistema de arrefecimento, aplicação de aditivo orgânico homologado, teste de estanqueidade e troca de válvula termostática.",
      foto: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      destaque: "Evita Quebra de Motor",
      itens: ["Fluido aditivo de alta durabilidade", "Teste pressurizado de vazamentos", "Revisão da ventoinha e radiador"]
    },
    {
      id: "revisao-viagem",
      categoria: "preventiva",
      titulo: "Mecânica Geral & Revisão Preventiva",
      subtitulo: "Check-up Completo Pré-Viagem",
      desc: "Inspeção rigorosa em mais de 40 itens essenciais do veículo: iluminação, palhetas, freios, correias, suspensão e níveis de todos os fluidos.",
      foto: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      destaque: "Tranquilidade Total",
      itens: ["Check-list de 40+ itens de segurança", "Histórico registrado na oficina", "Relatório de itens com desgaste"]
    }
  ];

  const servicosFiltrados = categoriaAtiva === 'todos' 
    ? servicosCatalogo 
    : servicosCatalogo.filter(s => s.categoria === categoriaAtiva);

  const horariosSemana = [
    { dia: "Segunda-feira", horario: "07:30 – 18:00", num: 1 },
    { dia: "Terça-feira", horario: "07:30 – 18:00", num: 2 },
    { dia: "Quarta-feira", horario: "07:30 – 18:00", num: 3 },
    { dia: "Quinta-feira", horario: "07:30 – 18:00", num: 4 },
    { dia: "Sexta-feira", horario: "07:30 – 17:00", num: 5 },
    { dia: "Sábado", horario: "Fechado", num: 6 },
    { dia: "Domingo", horario: "Fechado", num: 0 }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-600 selection:text-white flex flex-col antialiased">
      
      {/* 🧭 Topbar Institucional */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 text-xs py-2 px-4 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> R. Pereira Cardoso, 749 • Morungaba - SP
            </span>
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> {TELEFONE_FORMATADO}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Aberto/Fechado */}
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
              statusFuncionamento.aberto 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${statusFuncionamento.aberto ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
              {statusFuncionamento.texto}
            </div>

            {/* Acesso Restrito / Área da Equipe */}
            <Link 
              to="/login" 
              className="text-zinc-400 hover:text-white transition flex items-center gap-1 font-semibold text-[11px] ml-2"
            >
              <Lock className="w-3 h-3 text-red-500" /> Acesso Restrito
            </Link>
          </div>
        </div>
      </div>

      {/* 🚀 Header Principal */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-[37px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2.5 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black italic tracking-wider text-white">G CARS</span>
                <span className="text-[10px] font-black text-red-500 tracking-wider uppercase bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Desde 2017</span>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Reparos Automotivos</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#inicio" className="hover:text-red-400 transition">Início</a>
            <a href="#cambio-automatico" className="text-red-400 hover:text-red-300 transition flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Câmbio Automático
            </a>
            <a href="#servicos" className="hover:text-red-400 transition">Demais Serviços</a>
            <a href="#visitar" className="hover:text-red-400 transition">Localização & Contato</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${TELEFONE_LINK}`}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-bold transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Ligar
            </a>
            <a
              href={getWhatsappUrl("Orçamento Geral")}
              target="_blank"
              rel="noreferrer"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> 
              <span className="hidden xs:inline">Falar no</span> WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================
          📍 SEÇÃO 1: HERO COM A FACHADA REAL DA OFICINA
      ======================================================== */}
      <section id="inicio" className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden border-b border-zinc-800/80 bg-zinc-950">
        
        {/* Imagem de Fundo no Canto - Efeito Espairecido / Esmaecido */}
        <div className="absolute top-0 right-0 w-full sm:w-3/4 lg:w-3/5 h-full pointer-events-none overflow-hidden z-0">
          <img 
            src="/fachada-gcars.png" 
            alt="Fachada Oficial GCARS Reparos Automotivos" 
            className="w-full h-full object-cover object-center lg:object-right opacity-35 filter brightness-[0.75] contrast-[1.15] scale-105"
          />
          {/* Camadas de gradiente para espairecer suavemente para o fundo escuro */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_20%,#09090b_85%)]" />
        </div>

        {/* Efeito Glow Ambiente */}
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-red-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/10 blur-[160px] pointer-events-none rounded-full" />

        {/* Conteúdo Principal do Hero Centralizado */}
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 relative z-10 w-full flex flex-col items-center text-center">
          
          {/* Badges de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-extrabold text-white">4,8</span>
              <span className="text-xs text-zinc-400">• Avaliações no Google</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-red-400">
              <Sparkles className="w-3.5 h-3.5" /> Tradição Desde 2017 em Morungaba
            </div>
          </div>

          {/* Título de Alto Impacto */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6 max-w-3xl">
            Excelência e Confiança em <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Reparos Automotivos</span>
          </h1>

          {/* Descrição */}
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed mb-8">
            Oficina mecânica completa e especializada em Morungaba - SP. Estrutura própria, diagnóstico computadorizado avançado, peças com procedência garantida e atendimento transparente.
          </p>

          {/* Chamada para Ações: Solicitar Orçamento e Traçar Rota */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-10">
            <a
              href={getWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" /> Solicitar Orçamento via WhatsApp
            </a>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-100 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Navigation className="w-4 h-4 text-red-500" /> Traçar Rota até a Oficina
            </a>
          </div>

          {/* Destaques rápidos */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs border-t border-zinc-800/80 w-full max-w-2xl text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Peças com Garantia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Scanner Eletrônico</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Orçamento Transparente</span>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================
          🔥 SEÇÃO 2: CARRO-CHEFE - TROCA DE ÓLEO DE CÂMBIO AUTOMÁTICO
      ======================================================== */}
      <section id="cambio-automatico" className="py-20 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80 relative overflow-hidden">
        
        {/* Glow decorativo de alta potência */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/15 blur-[160px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 space-y-12 relative z-10">
          
          {/* Cabeçalho da Seção */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/40 text-red-400 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg">
              <Flame className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> Nosso Carro-Chefe Especializado
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Troca de Óleo de Câmbio Automático <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">100% por Diálise</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Evite prejuízos de mais de <strong className="text-white">R$ 15.000</strong> com quebra prematura de câmbio. Na GCARS realizamos a substituição total do fluido com equipamento computadorizado especializado.
            </p>
          </div>

          {/* Destaque Tecnológico: Comparativo Gravidade vs Diálise GCARS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Card Método Tradicional / Por Gravidade (Ruim) */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Método Convencional</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Apenas ~40% do Fluido
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-200">Troca Tradicional por Gravidade</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Ao abrir o bujão do cárter, apenas uma pequena parte do óleo escorre. O restante do fluido velho, queimado e contaminado com limalha continua retido no conversor de torque e corpo de válvulas.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Mistura óleo novo com 60% de óleo velho degradado</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Não limpa os canais do conversor de torque nem resfriador</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Provoca trancos nas marchas, patinação e perda de pressão</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-500 font-medium">
                Resultado: desgaste acelerado dos discos de fricção e solenóides.
              </div>
            </div>

            {/* Card Diálise GCARS (Revolucionário / Carro-Chefe) */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-red-950/40 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-red-900/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-red-400">Padrão GCARS Tecnologia</span>
                  <span className="text-xs font-black text-white bg-red-600 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-red-600/50">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> 100% de Substituição
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  Troca Total por Máquina de Diálise
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Conectamos a máquina especializada ao fluxo do câmbio. O equipamento extrai o fluido contaminado enquanto injeta fluido novo sob pressão e temperatura idênticas, renovando <strong className="text-white font-bold">100% do sistema</strong> sem riscos.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Substituição completa do óleo do conversor, cárter e radiador</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Fluido específico homologado pela montadora (ATF, CVT, DCT/DSG)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Troca do filtro de câmbio e diagnóstico eletrônico pré e pós troca</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                <div>
                  <span className="text-[11px] text-zinc-400 block">Investimento preventivo:</span>
                  <span className="text-xs font-bold text-white">Conserva seu câmbio como novo</span>
                </div>
                <a
                  href={getWhatsappUrl("Troca de Óleo de Câmbio Automático")}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-lg shadow-red-600/40 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Orçar Troca de Câmbio
                </a>
              </div>
            </div>

          </div>

          {/* 4 Pilares da Troca de Câmbio Automático */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Scanner & Leitura Eletrônica</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Varredura de códigos de falhas do módulo de transmissão (TCM) e monitoramento da temperatura ideal do óleo.
              </p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Fluidos Homologados</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Utilizamos exclusivamente os óleos certificados pela montadora para garantir a pressão e viscosidade exatas.
              </p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <Gauge className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Eliminação de Trancos</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trocas de marchas imperceptíveis, resposta rápida na aceleração e proteção total dos componentes internos.
              </p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Todos os Tipos de Câmbio</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Atendemos câmbios Automáticos Convencionais, CVT, Dupla Embreagem (DSG, Powershift) e Automatizados.
              </p>
            </div>

          </div>

          {/* Banner de Chamada para Ação no Fim do Carro-Chefe */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-white">Quando devo trocar o óleo do câmbio automático?</h4>
              <p className="text-xs sm:text-sm text-zinc-400">
                A maioria das montadoras recomenda a troca entre <strong className="text-white">40.000 km e 60.000 km</strong> ou a cada 3 anos. Não deixe o óleo degradar!
              </p>
            </div>

            <a
              href={getWhatsappUrl("Cotação Câmbio Automático - Quilometragem do Veículo")}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition shadow-xl shadow-red-600/30 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Consultar Prazos do Meu Carro
            </a>
          </div>

        </div>
      </section>


      {/* ========================================================
          🎬 SEÇÃO 3: DEMAIS SERVIÇOS (ESTILO NETFLIX)
      ======================================================== */}
      <section id="servicos" className="py-20 bg-zinc-950 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          
          {/* Cabeçalho do Catálogo */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Catálogo de Serviços
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Mecânica Completa para seu Veículo
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Além do câmbio automático, cuidamos de toda a mecânica e eletrônica do seu carro com excelência e peças com garantia.
              </p>
            </div>

            {/* Filtros de Categoria estilo streaming */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'todos', label: 'Todos os Serviços' },
                { id: 'preventiva', label: 'Preventiva' },
                { id: 'eletronica', label: 'Eletrônica' },
                { id: 'seguranca', label: 'Freios & Segurança' },
                { id: 'mecanica', label: 'Motor & Suspensão' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    categoriaAtiva === cat.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards Estilo Netflix com Imagem de Destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicosFiltrados.map((servico) => (
              <div 
                key={servico.id}
                className="group bg-zinc-900/80 border border-zinc-800 hover:border-red-500/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/30 flex flex-col justify-between"
              >
                {/* Imagem do Card (Poster Netflix Style com Zoom no Hover) */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-950">
                  <img 
                    src={servico.foto} 
                    alt={servico.titulo} 
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500 filter brightness-[0.85] group-hover:brightness-100"
                    loading="lazy"
                  />
                  {/* Gradiente escuro no rodapé da imagem para mesclar com o texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/40" />

                  {/* Badge de Destaque flutuante */}
                  {servico.destaque && (
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-red-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md shadow-lg">
                      {servico.destaque}
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 drop-shadow">
                      {servico.subtitulo}
                    </span>
                  </div>
                </div>

                {/* Conteúdo e Detalhes do Serviço */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-white group-hover:text-red-400 transition">
                      {servico.titulo}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {servico.desc}
                    </p>
                  </div>

                  {/* Lista de itens inclusos */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs">
                    {servico.itens.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-[11px]">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botão de Solicitação do Serviço */}
                  <a
                    href={getWhatsappUrl(servico.titulo)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full mt-2 pt-3 pb-2 text-xs font-bold text-zinc-200 group-hover:text-white flex items-center justify-between border-t border-zinc-800 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Consultar Valores
                    </span>
                    <span className="text-red-400 group-hover:translate-x-1 transition font-black text-[11px] flex items-center">
                      Agendar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Prova Social Rápida Google */}
          <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">4,8 de 5,0 no Google</span>
              <span>• Avaliado por clientes de Morungaba e região</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================
          📍 SEÇÃO 4: VENHA NOS VISITAR (LOCALIZAÇÃO & HORÁRIOS)
      ======================================================== */}
      <section id="visitar" className="py-20 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          
          {/* Título da Seção */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" /> Fácil Acesso
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Venha nos Visitar na GCARS
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Estamos situados no mesmo ponto em Morungaba desde 2017. Traga seu carro para uma avaliação sem compromisso!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Coluna 1: Informações, Endereço e Horários (7 colunas) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card de Endereço Completo */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-red-500 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Endereço da Oficina</span>
                    <h3 className="text-lg sm:text-xl font-black text-white">{ENDERECO_COMPLETO}</h3>
                    <p className="text-xs text-zinc-400">Fácil acesso com vagas na frente para comodidade no recebimento do seu veículo.</p>
                  </div>
                </div>

                {/* Botões de Ação de Rota */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4 text-red-500" /> Abrir no Google Maps
                  </a>

                  <a
                    href={WAZE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4 text-cyan-400" /> Abrir no Waze
                  </a>
                </div>

                {/* Telefones de Contato Direto */}
                <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Telefone Principal</span>
                      <strong className="text-white font-bold">{TELEFONE_FORMATADO}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-zinc-400 block text-[11px]">WhatsApp Oficina</span>
                      <a href={getWhatsappUrl()} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                        Enviar mensagem
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Tabela de Horários com Dia Atual em Destaque */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" /> Horários de Atendimento
                  </h4>
                  <span className="text-[11px] font-bold text-zinc-400">Atendimento presencial</span>
                </div>

                <div className="divide-y divide-zinc-800/80 text-xs">
                  {horariosSemana.map((item, idx) => {
                    const isHoje = item.num === diaSemanaAtual;
                    return (
                      <div 
                        key={idx} 
                        className={`py-2.5 px-3 rounded-lg flex justify-between items-center transition ${
                          isHoje 
                            ? 'bg-red-500/10 border border-red-500/30 font-bold' 
                            : 'hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isHoje ? "text-red-400" : "text-zinc-400"}>{item.dia}</span>
                          {isHoje && (
                            <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              Hoje
                            </span>
                          )}
                        </div>
                        <span className={item.horario === "Fechado" ? "text-zinc-500 font-medium" : (isHoje ? "text-emerald-400 font-black" : "text-zinc-200")}>
                          {item.horario}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <a
                    href={getWhatsappUrl("Agendamento de Horário")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <MessageSquare className="w-4 h-4" /> Agendar Horário via WhatsApp
                  </a>
                </div>
              </div>

            </div>

            {/* Coluna 2: Mapa e Reconhecimento da Fachada (5 colunas) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Mapa do Google Incorporado */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" /> Mapa no Local
                  </span>
                  <a 
                    href={GOOGLE_MAPS_URL} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 text-[11px]"
                  >
                    Expandir <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative h-72 sm:h-80 w-full bg-zinc-950">
                  <iframe 
                    title="Localização GCARS Morungaba"
                    src="https://maps.google.com/maps?q=R.+Pereira+Cardoso,+749,+Morungaba+-+SP&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="filter invert-[0.9] hue-rotate-180 contrast-125"
                  />
                </div>
              </div>

              {/* Card de Identificação Visual: Foto da Fachada para Facilitar Encontrar */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <Car className="w-4 h-4 text-red-500" /> Como Reconhecer Nossa Oficina ao Chegar:
                </div>

                <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-zinc-700/60">
                  <img 
                    src="/fachada-gcars.png" 
                    alt="Ponto de Referência GCARS" 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px]">
                    <strong className="block font-bold">Portão preto e letreiro GCARS em destaque</strong>
                    <span className="text-zinc-300 text-[10px]">Vagas de estacionamento direto na entrada</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* 🏁 Rodapé Oficial */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Car className="w-4 h-4 text-red-500" />
              <span className="font-bold text-zinc-200">GCARS Reparos Automotivos</span>
              <span className="text-zinc-400">• Desde 2017</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Morungaba - SP • R. Pereira Cardoso, 749 • Telefone / WhatsApp: (11) 4014-7245
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#inicio" className="text-zinc-400 hover:text-white transition">Voltar ao Topo</a>
            <Link to="/login" className="text-zinc-400 hover:text-red-500 transition font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Área do Mecânico
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
