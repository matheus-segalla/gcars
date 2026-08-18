import React, { useMemo } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const TELEFONE_FORMATADO = "(11) 4014-7245";
  const TELEFONE_LINK = "551140147245";
  const ENDERECO_COMPLETO = "R. Pereira Cardoso, 749, Morungaba - SP, 13260-000";
  const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=R.+Pereira+Cardoso,+749,+Morungaba+-+SP";
  const WHATSAPP_URL = `https://wa.me/${TELEFONE_LINK}?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20meu%20ve%C3%ADculo%20na%20GCARS.`;

  // Calcula em tempo real se a oficina está aberta ou fechada
  const statusFuncionamento = useMemo(() => {
    const agora = new Date();
    const dia = agora.getDay(); // 0 = Domingo, 1 = Segunda ... 6 = Sábado
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

  const servicos = [
    {
      titulo: "Revisão Preventiva & Check-up",
      desc: "Inspeção completa de itens de segurança, fluidos, filtros e correias para viagens sem surpresas.",
      destaque: "Mais procurado"
    },
    {
      titulo: "Freios, ABS & Suspensão",
      desc: "Troca de pastilhas, discos, amortecedores, pivôs e alinhamento de direção com precisão.",
      destaque: null
    },
    {
      titulo: "Injeção Eletrônica & Diagnóstico",
      desc: "Varredura computadorizada com scanner de última geração para falhas de motor e consumo excessivo.",
      destaque: "Tecnologia"
    },
    {
      titulo: "Troca de Óleo & Lubrificantes",
      desc: "Óleos sintéticos, semissintéticos e minerais com as viscosidades homologadas pela montadora.",
      destaque: null
    },
    {
      titulo: "Motor, Câmbio & Embreagem",
      desc: "Retífica, substituição de kits de embreagem, cabeçote e reparos mecânicos de alta complexidade.",
      destaque: null
    },
    {
      titulo: "Arrefecimento & Radiador",
      desc: "Limpeza de sistema, teste de estanqueidade e troca de aditivos para evitar superaquecimento.",
      destaque: null
    }
  ];

  const avaliacoes = [
    {
      nome: "Valdir P.",
      avaliacao: "Excelente atendimento! Mecânico de extrema confiança, serviço rápido e preço justo. Meu Uno ficou impecável.",
      estrelas: 5
    },
    {
      nome: "Alan S.",
      avaliacao: "Oficina organizada e transparente no diagnóstico. Explicam exatamente o que foi trocado na nota.",
      estrelas: 5
    },
    {
      nome: "Marcos R.",
      avaliacao: "Melhor oficina de Morungaba. Profissionais qualificados e pontualidade na entrega do carro.",
      estrelas: 5
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-600 selection:text-white flex flex-col">
      
      {/* 🧭 Topbar Institucional */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 text-xs py-2 px-4 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> Morungaba - SP
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
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

            {/* Acesso Restrito / Área do Mecânico */}
            <Link 
              to="/login" 
              className="text-zinc-400 hover:text-white transition flex items-center gap-1 font-semibold text-[11px] ml-2"
            >
              <Lock className="w-3 h-3 text-red-500" /> Acesso Restrito
            </Link>
          </div>
        </div>
      </div>

      {/* 🚀 Header Principal / Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black italic tracking-wider text-white">G CARS</span>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Reparos Automotivos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${TELEFONE_LINK}`}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-bold transition"
            >
              <Phone className="w-4 h-4 text-emerald-400" /> Ligar
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Solicitar Orçamento
            </a>
          </div>
        </div>
      </header>

      {/* 🌟 Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-zinc-800/60">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center space-y-6">
          
          {/* Badge Google Reviews */}
          <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-full shadow-xl">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-extrabold text-white">4,8</span>
            <span className="text-xs text-zinc-400">• 10 avaliações no Google</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Excelência e Confiança em <span className="text-red-500">Reparos Automotivos</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Oficina mecânica especializada em Morungaba - SP. Diagnóstico computadorizado preciso, peças de qualidade comprovada e atendimento transparente para o seu veículo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Falar pelo WhatsApp
            </a>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-red-500" /> Como Chegar (Rotas)
            </a>
          </div>

          {/* 3 Pilares Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 max-w-4xl mx-auto text-left">
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Garantia & Procedência</h4>
                <p className="text-[11px] text-zinc-400">Peças novas e com nota fiscal</p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Diagnóstico Digital</h4>
                <p className="text-[11px] text-zinc-400">Scanner e histórico registrado</p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Pontualidade</h4>
                <p className="text-[11px] text-zinc-400">Seu carro pronto no prazo combinado</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🔧 Catálogo de Serviços */}
      <section className="py-16 bg-zinc-950 border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">Nossos Serviços</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Soluções Completas para seu Carro</h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">Atendemos todas as marcas e modelos com equipamentos modernos e mão de obra capacitada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicos.map((s, idx) => (
              <div key={idx} className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 p-6 rounded-2xl space-y-3 transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
                      <Wrench className="w-5 h-5" />
                    </div>
                    {s.destaque && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full">
                        {s.destaque}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition">{s.titulo}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="pt-3 text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 group/btn"
                >
                  Consultar valor <ChevronRight className="w-3.5 h-3.5 text-red-500 group-hover/btn:translate-x-1 transition" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ Avaliações & Prova Social */}
      <section className="py-16 bg-zinc-900/30 border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">Opinião dos Clientes</span>
              <h2 className="text-2xl font-black text-white mt-1">O que dizem sobre a G CARS</h2>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
              <div className="text-right">
                <p className="text-xs font-black text-white">4,8 de 5,0</p>
                <span className="text-[10px] text-zinc-400">Avaliações no Google</span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {avaliacoes.map((av, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex text-amber-400">
                  {[...Array(av.estrelas)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 italic leading-relaxed">"{av.avaliacao}"</p>
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-white">
                  <span>{av.nome}</span>
                  <span className="text-[10px] font-normal text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cliente Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📍 Localização, Horários e Contato */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 lg:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Informações da Oficina */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">Venha nos Visitar</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Facilidade de Acesso em Morungaba</h2>
                <p className="text-xs text-zinc-400 mt-2">Estamos prontos para atender você com agilidade e transparência.</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Endereço */}
                <div className="flex items-start gap-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">Endereço</strong>
                    <p className="text-zinc-300 mt-0.5">{ENDERECO_COMPLETO}</p>
                    <a
                      href={GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-red-400 font-bold mt-2 hover:underline text-[11px]"
                    >
                      Abrir no Google Maps <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Telefone & WhatsApp */}
                <div className="flex items-start gap-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
                  <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">Telefone / WhatsApp</strong>
                    <p className="text-zinc-300 mt-0.5">{TELEFONE_FORMATADO}</p>
                    <a
                      href={`tel:${TELEFONE_LINK}`}
                      className="inline-flex items-center gap-1 text-emerald-400 font-bold mt-2 hover:underline text-[11px]"
                    >
                      Ligar diretamente <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Horário de Funcionamento */}
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" /> Horário de Atendimento
              </h3>

              <div className="divide-y divide-zinc-800/60 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-zinc-400">Segunda-feira</span>
                  <span className="font-bold text-zinc-200">07:30 – 18:00</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-zinc-400">Terça-feira</span>
                  <span className="font-bold text-zinc-200">07:30 – 18:00</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-zinc-400">Quarta-feira</span>
                  <span className="font-bold text-zinc-200">07:30 – 18:00</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-zinc-400">Quinta-feira</span>
                  <span className="font-bold text-zinc-200">07:30 – 18:00</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-zinc-400">Sexta-feira</span>
                  <span className="font-bold text-emerald-400">07:30 – 17:00</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-zinc-500">
                  <span>Sábado</span>
                  <span className="font-medium">Fechado</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-zinc-500">
                  <span>Domingo</span>
                  <span className="font-medium">Fechado</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" /> Agendar Horário via WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🏁 Rodapé Oficial */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-red-500" />
            <span className="font-bold text-zinc-300">G CARS Reparos Automotivos</span>
            <span>• CNPJ & Inscrição Municipal</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Morungaba - SP</span>
            <Link to="/login" className="text-zinc-400 hover:text-red-500 transition font-bold">
              Área do Mecânico
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}