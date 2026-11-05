import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  FileText,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Trash2,
  FolderOpen,
  UserCheck,
  Bell,
  Sparkles,
  Calendar,
  Phone,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const comprimirImagem = (arquivo) => {
  return new Promise((resolve) => {
    if (!arquivo.type.startsWith('image/')) {
      return resolve(arquivo);
    }

    const leitor = new FileReader();
    leitor.readAsDataURL(arquivo);

    leitor.onerror = () => resolve(arquivo);

    leitor.onload = (evento) => {
      const img = new Image();
      img.src = evento.target.result;

      img.onerror = () => resolve(arquivo);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let largura = img.width;
        let altura = img.height;

        const MAX_DIMENSAO = 1600;
        if (largura > altura && largura > MAX_DIMENSAO) {
          altura = Math.round((altura * MAX_DIMENSAO) / largura);
          largura = MAX_DIMENSAO;
        } else if (altura > MAX_DIMENSAO) {
          largura = Math.round((largura * MAX_DIMENSAO) / altura);
          altura = MAX_DIMENSAO;
        }

        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, largura, altura);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(arquivo);
            const arquivoComprimido = new File([blob], arquivo.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(arquivoComprimido);
          },
          'image/jpeg',
          0.82
        );
      };
    };
  });
};

const FORMAS_PAGAMENTO = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Boleto Bancário',
  'A Prazo / Faturado',
  'Transferência (TED/DOC)',
  'Outro / Pendente'
];

function calcularDataRelativa(meses = 0, dias = 0) {
  const d = new Date();
  if (meses) d.setMonth(d.getMonth() + meses);
  if (dias) d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

const SUGESTOES_LEMBRETE = [
  { label: 'Troca de Óleo e Filtros', meses: 6, icone: '🛢️' },
  { label: 'Revisão dos Freios', meses: 12, icone: '🛑' },
  { label: 'Alinhamento & Balanceamento', meses: 6, icone: '📐' },
  { label: 'Revisão Geral Preventiva', meses: 6, icone: '🔍' },
  { label: 'Troca de Correia Dentada', meses: 36, icone: '⚙️' },
];

export default function Digitalizar() {
  const { showToast } = useNotification();

  const [loadingIA, setLoadingIA] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [arquivos, setArquivos] = useState([]);
  const [fotosUrls, setFotosUrls] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  const cameraInputRef = useRef(null);
  const galeriaInputRef = useRef(null);

  const [formData, setFormData] = useState({
    numero: '', data: '', cliente: '', telefone: '', veiculo: '',
    placa: '', cor: '', ano: '', km: '',
    forma_pagamento: '', funcionario_id: '', pecas: 0, mao_obra: 0, servicos: ''
  });

  // Estados de Agendamento de Lembrete Preventivo
  const [agendarLembrete, setAgendarLembrete] = useState(false);
  const [lembreteTitulo, setLembreteTitulo] = useState('');
  const [lembreteData, setLembreteData] = useState(() => calcularDataRelativa(6));
  const [lembreteTelefone, setLembreteTelefone] = useState('');
  const [lembreteObs, setLembreteObs] = useState('');

  useEffect(() => {
    async function carregarFuncionarios() {
      try {
        const res = await api.get('/api/funcionarios?apenas_ativos=true');
        setFuncionarios(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar funcionários:", err);
      }
    }
    carregarFuncionarios();
  }, []);

  // Sugere título inteligente com base nos serviços
  const sugerirTituloPorServicos = (texto) => {
    if (!texto) return 'Revisão Periódica Preventiva';
    const t = texto.toLowerCase();
    if (t.includes('oleo') || t.includes('óleo')) return 'Troca de Óleo e Filtros';
    if (t.includes('freio') || t.includes('pastilha')) return 'Revisão dos Freios / Pastilhas';
    if (t.includes('alinhamento') || t.includes('balanceamento')) return 'Alinhamento & Balanceamento';
    if (t.includes('correia')) return 'Troca de Correia Dentada';
    if (t.includes('arrefecimento') || t.includes('radiador')) return 'Líquido de Arrefecimento';
    const primeira = texto.split('\n').map(s => s.trim()).filter(Boolean)[0];
    return primeira || 'Revisão Geral Preventiva';
  };

  const handleToggleLembrete = (ativar) => {
    setAgendarLembrete(ativar);
    if (ativar) {
      if (!lembreteTitulo) {
        setLembreteTitulo(sugerirTituloPorServicos(formData.servicos));
      }
      if (!lembreteTelefone && formData.telefone) {
        setLembreteTelefone(formData.telefone);
      }
    }
  };

  const normalizarFormaPagamento = (valorBruto) => {
    if (!valorBruto) return '';
    const v = valorBruto.toLowerCase().trim();
    if (v.includes('pix')) return 'PIX';
    if (v.includes('débito') || v.includes('debito')) return 'Cartão de Débito';
    if (v.includes('crédito') || v.includes('credito') || v.includes('cartao') || v.includes('cartão')) return 'Cartão de Crédito';
    if (v.includes('dinheiro') || v.includes('especie') || v.includes('espécie')) return 'Dinheiro';
    if (v.includes('boleto')) return 'Boleto Bancário';
    if (v.includes('prazo') || v.includes('faturado') || v.includes('pendente') || v.includes('fiado')) return 'A Prazo / Faturado';
    if (v.includes('ted') || v.includes('doc') || v.includes('transf')) return 'Transferência (TED/DOC)';
    return 'Outro / Pendente';
  };

  const handleAdicionarArquivos = async (e) => {
    const input = e.target;
    if (input.files && input.files.length > 0) {
      const novos = Array.from(input.files);
      const comprimidos = await Promise.all(novos.map(file => comprimirImagem(file)));
      setArquivos(prev => [...prev, ...comprimidos]);
      input.value = null;
    }
  };

  const handleRemoverArquivo = (index) => {
    if (arquivos[index]) {
      URL.revokeObjectURL(arquivos[index]);
    }
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtrairIA = async () => {
    if (!arquivos || arquivos.length === 0) {
      return showToast("Tire uma foto ou selecione uma imagem da nota primeiro!", "aviso");
    }

    setLoadingIA(true);
    const data = new FormData();
    arquivos.forEach(file => data.append('files', file));

    try {
      const res = await api.post('/api/extrair-nota', data);
      const d = res.data.dados;
      const fotos = res.data.fotos || [];

      setFotosUrls(fotos);
      const servicosExtraidos = (d.servicos || []).join('\n');
      setFormData(prev => ({
        ...prev,
        numero: d.numero || '',
        data: d.data || '',
        cliente: d.cliente || '',
        telefone: d.telefone || prev.telefone || '',
        veiculo: d.veiculo || '',
        placa: d.placa || '',
        cor: d.cor || '',
        ano: d.ano || '',
        km: d.km || '',
        forma_pagamento: normalizarFormaPagamento(d.forma_pagamento),
        pecas: d.pecas || 0,
        mao_obra: d.mao_obra || 0,
        servicos: servicosExtraidos
      }));

      // Se o lembrete estiver ativo ou se sugerir, atualiza título sugerido
      if (servicosExtraidos && !lembreteTitulo) {
        setLembreteTitulo(sugerirTituloPorServicos(servicosExtraidos));
      }
      if (d.telefone && !lembreteTelefone) {
        setLembreteTelefone(d.telefone);
      }

      showToast("Dados e foto(s) extraídos com sucesso!", "sucesso");
    } catch (err) {
      showToast("Erro ao ler nota com IA: " + (err.response?.data?.detail || err.message), "erro");
    } finally {
      setLoadingIA(false);
    }
  };

  const handleSalvarOS = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const payload = {
      ...formData,
      telefone: formData.telefone ? formData.telefone.trim() : null,
      km: formData.km ? String(formData.km).trim() : null,
      funcionario_id: formData.funcionario_id ? parseInt(formData.funcionario_id, 10) : null,
      pecas: parseFloat(formData.pecas) || 0,
      mao_obra: parseFloat(formData.mao_obra) || 0,
      servicos: formData.servicos.split('\n').filter(s => s.trim() !== ''),
      fotos: fotosUrls
    };

    if (agendarLembrete && lembreteTitulo.trim()) {
      payload.lembrete = {
        titulo: lembreteTitulo.trim(),
        data_lembrete: lembreteData,
        cliente_telefone: lembreteTelefone ? lembreteTelefone.trim() : (formData.telefone ? formData.telefone.trim() : null),
        observacoes: lembreteObs ? lembreteObs.trim() : `Lembrete preventivo agendado na criação da OS #${formData.numero || 'S/N'}`
      };
    }

    try {
      const res = await api.post('/api/ordens-servico', payload);
      const msgSucesso = payload.lembrete
        ? `Ordem #${formData.numero || 'S/N'} e Lembrete Preventivo salvos com sucesso!`
        : `Ordem #${formData.numero || 'S/N'} salva com sucesso!`;
      showToast(msgSucesso, "sucesso");

      setFormData({
        numero: '', data: '', cliente: '', telefone: '', veiculo: '',
        placa: '', cor: '', ano: '', km: '',
        forma_pagamento: '', funcionario_id: '', pecas: 0, mao_obra: 0, servicos: ''
      });
      setAgendarLembrete(false);
      setLembreteTitulo('');
      setLembreteTelefone('');
      setLembreteObs('');
      setLembreteData(calcularDataRelativa(6));
      setArquivos([]);
      setFotosUrls([]);
    } catch (err) {
      showToast("Erro ao salvar: " + (err.response?.data?.detail || err.message), "erro");
    } finally {
      setSalvando(false);
    }
  };

  // Itens de serviço disponíveis como chips clicáveis
  const servicosLinhas = formData.servicos
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

      {/* 📸 Captura de Fotos */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl space-y-6 transition-colors duration-200">
        <div>
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-red-500" /> Foto(s) do Orçamento
          </h2>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleAdicionarArquivos}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            ref={galeriaInputRef}
            onChange={handleAdicionarArquivos}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-4 rounded-xl font-bold text-xs shadow-lg shadow-red-600/20 transition active:scale-95"
            >
              <Camera className="w-6 h-6" />
              <span>Tirar Foto</span>
              <span className="text-[9px] opacity-80 font-normal">(Abre Câmera)</span>
            </button>

            <button
              type="button"
              onClick={() => galeriaInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 p-4 rounded-xl font-bold text-xs transition active:scale-95"
            >
              <FolderOpen className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
              <span>Galeria / PC</span>
              <span className="text-[9px] text-zinc-500 font-normal">(Multi-seleção)</span>
            </button>
          </div>

          {arquivos.length > 0 ? (
            <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <span>{arquivos.length} foto(s) para extrair:</span>
                <button
                  type="button"
                  onClick={() => setArquivos([])}
                  className="text-[10px] text-red-500 hover:underline font-bold"
                >
                  Limpar todas
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {arquivos.map((file, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoverArquivo(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-md opacity-90 group-hover:opacity-100 transition shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1 bg-black/70 text-[9px] text-white rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-xs">
              Nenhuma foto capturada ainda. Use os botões acima para fotografar o talão.
            </div>
          )}

          {fotosUrls.length > 0 && (
            <div className="w-full mt-4 p-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400 block mb-2 flex items-center gap-1 justify-center">
                <ImageIcon className="w-3 h-3 text-emerald-500" /> Salvas no Storage ({fotosUrls.length})
              </span>
              <div className="flex gap-2 justify-center overflow-x-auto">
                {fotosUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="Talão" className="w-12 h-12 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-red-500 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleExtrairIA}
          disabled={loadingIA || arquivos.length === 0}
          className="w-full bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition disabled:opacity-40 flex justify-center items-center gap-2 active:scale-95"
        >
          {loadingIA ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Lendo Imagens com IA...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Extrair Dados da OS</>
          )}
        </button>
      </div>

      {/* 📋 Formulário de Conferência & Registro */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl transition-colors duration-200">
        <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider mb-6 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" /> Conferência & Registro
        </h2>

        <form onSubmit={handleSalvarOS} className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Nº Talão / OS</label>
            <input
              type="text"
              value={formData.numero}
              onChange={e => setFormData({ ...formData, numero: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Data</label>
            <input
              type="text"
              value={formData.data}
              onChange={e => setFormData({ ...formData, data: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Cliente</label>
            <input
              type="text"
              value={formData.cliente}
              onChange={e => setFormData({ ...formData, cliente: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium flex items-center gap-1">
              <Phone className="w-3 h-3 text-red-500" /> Telefone / WhatsApp
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={e => {
                const val = e.target.value;
                setFormData({ ...formData, telefone: val });
                if (!lembreteTelefone) setLembreteTelefone(val);
              }}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Veículo</label>
            <input
              type="text"
              value={formData.veiculo}
              onChange={e => setFormData({ ...formData, veiculo: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Placa</label>
            <input
              type="text"
              value={formData.placa}
              onChange={e => setFormData({ ...formData, placa: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Cor</label>
            <input
              type="text"
              placeholder="Ex: Prata"
              value={formData.cor}
              onChange={e => setFormData({ ...formData, cor: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">KM Rodados</label>
            <input
              type="number"
              value={formData.km || ''}
              onChange={e => setFormData({ ...formData, km: e.target.value })}
              placeholder="Ex: 85400"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Ano</label>
            <input
              type="text"
              value={formData.ano}
              onChange={e => setFormData({ ...formData, ano: e.target.value })}
              placeholder="Ex: 2019"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-red-500" /> Mecânico Responsável
            </label>
            <select
              value={formData.funcionario_id}
              onChange={e => setFormData({ ...formData, funcionario_id: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="">Selecione o mecânico...</option>
              {funcionarios.map((func) => (
                <option key={func.id} value={func.id}>
                  {func.nome} ({func.cargo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Forma de Pagamento</label>
            <select
              value={formData.forma_pagamento}
              onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="">Selecione...</option>
              {FORMAS_PAGAMENTO.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Peças (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.pecas}
              onChange={e => setFormData({ ...formData, pecas: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Mão de Obra (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.mao_obra}
              onChange={e => setFormData({ ...formData, mao_obra: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-bold text-emerald-600 dark:text-emerald-400">Total (R$)</label>
            <input
              type="text"
              value={`R$ ${(parseFloat(formData.pecas || 0) + parseFloat(formData.mao_obra || 0)).toFixed(2)}`}
              disabled
              className="w-full bg-zinc-100 dark:bg-zinc-950 border border-emerald-500/40 rounded-lg p-2.5 text-emerald-600 dark:text-emerald-400 font-extrabold outline-none"
            />
          </div>

          <div className="col-span-2 md:col-span-3 mt-1">
            <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Serviços / Peças Realizados (um por linha)</label>
            <textarea
              rows="3"
              value={formData.servicos}
              onChange={e => {
                const val = e.target.value;
                setFormData({ ...formData, servicos: val });
                if (agendarLembrete && !lembreteTitulo) {
                  setLembreteTitulo(sugerirTituloPorServicos(val));
                }
              }}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:border-red-500 outline-none font-mono text-xs leading-relaxed"
              placeholder="Ex: Troca de Óleo 5W30&#10;Filtro de Óleo&#10;Revisão de Pastilhas"
            />
          </div>

          {/* 📅 Seção Integrada: Lembrete Preventivo para o Cliente */}
          <div className="col-span-2 md:col-span-3 mt-3 bg-red-50/50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 sm:p-5 space-y-4 transition">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agendarLembrete}
                  onChange={e => handleToggleLembrete(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-300 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-600 text-white">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white block">
                      Agendar Lembrete Preventivo para o Cliente
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      O sistema avisará automaticamente na data para contato via WhatsApp
                    </span>
                  </div>
                </div>
              </label>

              {agendarLembrete && (
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  Ativo para esta OS
                </span>
              )}
            </div>

            {agendarLembrete && (
              <div className="pt-3 border-t border-red-200/60 dark:border-red-900/40 space-y-3.5 animate-in fade-in duration-200">
                
                {/* Sugestões rápidas de serviço baseadas na OS */}
                {(servicosLinhas.length > 0 || SUGESTOES_LEMBRETE.length > 0) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Clique para usar serviços desta OS ou sugestões:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {servicosLinhas.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLembreteTitulo(s)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition active:scale-95 ${
                            lembreteTitulo === s
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 hover:border-red-500'
                          }`}
                        >
                          ✓ {s}
                        </button>
                      ))}
                      {SUGESTOES_LEMBRETE.slice(0, 3).map((sug, idx) => (
                        <button
                          key={`sug-${idx}`}
                          type="button"
                          onClick={() => {
                            setLembreteTitulo(sug.label);
                            setLembreteData(calcularDataRelativa(sug.meses));
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition active:scale-95 ${
                            lembreteTitulo === sug.label
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-red-500'
                          }`}
                        >
                          {sug.icone} {sug.label} (+{sug.meses}m)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1">
                      Serviço a Lembrar:
                    </label>
                    <input
                      type="text"
                      value={lembreteTitulo}
                      onChange={e => setLembreteTitulo(e.target.value)}
                      placeholder="Ex: Troca de Óleo e Filtros"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-white font-semibold outline-none focus:border-red-500"
                      required={agendarLembrete}
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1">
                      Telefone para Contato (WhatsApp):
                    </label>
                    <input
                      type="text"
                      value={lembreteTelefone}
                      onChange={e => setLembreteTelefone(e.target.value)}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Prazo Recomendado */}
                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1 text-[11px] uppercase tracking-wider">
                    Quando avisar o cliente?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2">
                    {[
                      { label: '+30 dias', dias: 30 },
                      { label: '+3 meses', meses: 3 },
                      { label: '+6 meses (Recomendado)', meses: 6 },
                      { label: '+8 meses', meses: 8 },
                      { label: '+1 ano', meses: 12 },
                    ].map((at, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const nova = at.meses
                            ? calcularDataRelativa(at.meses, 0)
                            : calcularDataRelativa(0, at.dias);
                          setLembreteData(nova);
                        }}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 font-bold text-[10px] transition text-center"
                      >
                        {at.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="date"
                    value={lembreteData}
                    onChange={e => setLembreteData(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white font-bold outline-none focus:border-red-500 cursor-pointer"
                    required={agendarLembrete}
                  />
                </div>

                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">
                    Observações Internas do Lembrete:
                  </label>
                  <input
                    type="text"
                    value={lembreteObs}
                    onChange={e => setLembreteObs(e.target.value)}
                    placeholder="Ex: Verificar também o nível do líquido de arrefecimento"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

              </div>
            )}
          </div>

          <div className="col-span-2 md:col-span-3 mt-2">
            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/25 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando Ordem no Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {agendarLembrete ? "Salvar Ordem & Agendar Lembrete Preventivo" : "Salvar Ordem de Serviço"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
