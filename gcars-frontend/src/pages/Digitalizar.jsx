import React, { useState, useRef } from 'react';
import { 
  Camera, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Image as ImageIcon,
  Trash2,
  FolderOpen,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

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

export default function Digitalizar() {
  const { showToast } = useNotification();

  const [loadingIA, setLoadingIA] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [arquivos, setArquivos] = useState([]);
  const [fotosUrls, setFotosUrls] = useState([]);

  // Referências para os inputs de câmera e galeria
  const cameraInputRef = useRef(null);
  const galeriaInputRef = useRef(null);

  const [formData, setFormData] = useState({
    numero: '', data: '', cliente: '', veiculo: '',
    placa: '', cor: '', ano: '', km: '',
    forma_pagamento: '', pecas: 0, mao_obra: 0, servicos: ''
  });

  // Normaliza o texto que a IA encontrou para casar com o select
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

  // Adiciona novos arquivos à lista existente (permite tirar várias fotos)
  const handleAdicionarArquivos = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const novos = Array.from(e.target.files);
      setArquivos(prev => [...prev, ...novos]);
      e.target.value = null; // Reseta para permitir capturar a mesma foto se necessário
    }
  };

  // Remove uma foto específica antes de enviar para a IA
  const handleRemoverArquivo = (index) => {
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
      setFormData({
        numero: d.numero || '',
        data: d.data || '',
        cliente: d.cliente || '',
        veiculo: d.veiculo || '',
        placa: d.placa || '',
        cor: d.cor || '',
        ano: d.ano || '',
        km: d.km || '',
        forma_pagamento: normalizarFormaPagamento(d.forma_pagamento),
        pecas: d.pecas || 0,
        mao_obra: d.mao_obra || 0,
        servicos: (d.servicos || []).join('\n')
      });
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
      pecas: parseFloat(formData.pecas) || 0,
      mao_obra: parseFloat(formData.mao_obra) || 0,
      servicos: formData.servicos.split('\n').filter(s => s.trim() !== ''),
      fotos: fotosUrls
    };

    try {
      await api.post('/api/ordens-servico', payload);
      showToast(`Ordem #${formData.numero || 'S/N'} salva com sucesso!`, "sucesso");
      
      setFormData({
        numero: '', data: '', cliente: '', veiculo: '',
        placa: '', cor: '', ano: '', km: '',
        forma_pagamento: '', pecas: 0, mao_obra: 0, servicos: ''
      });
      setArquivos([]);
      setFotosUrls([]);
    } catch (err) {
      showToast("Erro ao salvar: " + (err.response?.data?.detail || err.message), "erro");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 📸 Seção de Captura e Upload */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-6">
        <div>
          <h2 className="text-sm font-extrabold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-red-500" /> Foto(s) do Orçamento
          </h2>

          {/* Inputs invisíveis disparados pelos botões estilizados */}
          {/* 1. Câmera traseira do celular */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleAdicionarArquivos}
            className="hidden"
          />
          {/* 2. Galeria / Arquivo do PC */}
          <input
            type="file"
            accept="image/*"
            multiple
            ref={galeriaInputRef}
            onChange={handleAdicionarArquivos}
            className="hidden"
          />

          {/* Botões de Ação de Captura */}
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
              className="flex flex-col items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 p-4 rounded-xl font-bold text-xs transition active:scale-95"
            >
              <FolderOpen className="w-6 h-6 text-zinc-400" />
              <span>Galeria / PC</span>
              <span className="text-[9px] text-zinc-500 font-normal">(Multi-seleção)</span>
            </button>
          </div>

          {/* Miniaturas das Fotos Selecionadas antes do envio */}
          {arquivos.length > 0 ? (
            <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>{arquivos.length} foto(s) para extrair:</span>
                <button
                  type="button"
                  onClick={() => setArquivos([])}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  Limpar todas
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {arquivos.map((file, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-800 aspect-square bg-zinc-900">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoverArquivo(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-md opacity-90 group-hover:opacity-100 transition shadow"
                      title="Remover foto"
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
            <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-xs">
              Nenhuma foto capturada ainda. Use os botões acima para fotografar o talão.
            </div>
          )}

          {/* Fotos já salvas no Storage */}
          {fotosUrls.length > 0 && (
            <div className="w-full mt-4 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-2 flex items-center gap-1 justify-center">
                <ImageIcon className="w-3 h-3 text-emerald-400" /> Salvas no Storage ({fotosUrls.length})
              </span>
              <div className="flex gap-2 justify-center overflow-x-auto">
                {fotosUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="Talão" className="w-12 h-12 object-cover rounded-lg border border-zinc-700 hover:border-red-500 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Processar IA */}
        <button
          type="button"
          onClick={handleExtrairIA}
          disabled={loadingIA || arquivos.length === 0}
          className="w-full bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition disabled:opacity-40 flex justify-center items-center gap-2"
        >
          {loadingIA ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Lendo Imagens com IA...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Extrair Dados da OS</>
          )}
        </button>
      </div>

      {/* 📋 Formulário de Conferência */}
      <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-extrabold text-zinc-300 uppercase tracking-wider mb-6 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" /> Conferência & Registro
        </h2>

        <form onSubmit={handleSalvarOS} className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Nº Talão / OS</label>
            <input type="text" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-bold" required />
          </div>
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Data</label>
            <input type="text" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none" required />
          </div>
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Cliente</label>
            <input type="text" value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none" required />
          </div>
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Veículo</label>
            <input type="text" value={formData.veiculo} onChange={e => setFormData({ ...formData, veiculo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none" required />
          </div>
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Placa</label>
            <input type="text" value={formData.placa} onChange={e => setFormData({ ...formData, placa: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none uppercase font-mono" />
          </div>

          {/* Select de Formas de Pagamento Padronizadas */}
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Forma de Pagamento</label>
            <select
              value={formData.forma_pagamento}
              onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none cursor-pointer"
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
            <label className="text-zinc-400 mb-1 block font-medium">Peças (R$)</label>
            <input type="number" step="0.01" value={formData.pecas} onChange={e => setFormData({ ...formData, pecas: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Mão de Obra (R$)</label>
            <input type="number" step="0.01" value={formData.mao_obra} onChange={e => setFormData({ ...formData, mao_obra: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="text-zinc-400 mb-1 block font-bold text-emerald-400">Total (R$)</label>
            <input type="text" value={`R$ ${(parseFloat(formData.pecas || 0) + parseFloat(formData.mao_obra || 0)).toFixed(2)}`} disabled className="w-full bg-zinc-950 border border-emerald-500/40 rounded-lg p-2.5 text-emerald-400 font-extrabold outline-none" />
          </div>

          <div className="col-span-2 md:col-span-3 mt-2">
            <label className="text-zinc-400 mb-1 block font-medium">Serviços / Peças Realizados (um por linha)</label>
            <textarea rows="4" value={formData.servicos} onChange={e => setFormData({ ...formData, servicos: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs leading-relaxed" />
          </div>

          <div className="col-span-2 md:col-span-3 mt-4">
            <button type="submit" disabled={salvando} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/25 flex justify-center items-center gap-2">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾 Salvar Ordem no Supabase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}