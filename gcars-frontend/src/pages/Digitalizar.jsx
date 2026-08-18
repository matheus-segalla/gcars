import React, { useState } from 'react';
import { Camera, FileText, UploadCloud, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

export default function Digitalizar() {
  const [loadingIA, setLoadingIA] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [arquivos, setArquivos] = useState([]);
  const [fotosUrls, setFotosUrls] = useState([]);

  const [formData, setFormData] = useState({
    numero: '', data: '', cliente: '', veiculo: '',
    placa: '', cor: '', ano: '', km: '',
    forma_pagamento: '', pecas: 0, mao_obra: 0, servicos: ''
  });

  const handleExtrairIA = async () => {
    if (!arquivos || arquivos.length === 0) {
      return alert("Selecione a(s) imagem(ns) da nota primeiro!");
    }

    setLoadingIA(true);
    const data = new FormData();
    Array.from(arquivos).forEach(file => data.append('files', file));

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
        forma_pagamento: d.forma_pagamento || '',
        pecas: d.pecas || 0,
        mao_obra: d.mao_obra || 0,
        servicos: (d.servicos || []).join('\n')
      });
    } catch (err) {
      alert("Erro ao ler nota(s) com IA: " + (err.response?.data?.detail || err.message));
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
      alert("Ordem de Serviço e foto(s) salvas com sucesso!");
      setFormData({
        numero: '', data: '', cliente: '', veiculo: '',
        placa: '', cor: '', ano: '', km: '',
        forma_pagamento: '', pecas: 0, mao_obra: 0, servicos: ''
      });
      setArquivos([]);
      setFotosUrls([]);
    } catch (err) {
      alert("Erro ao salvar: " + (err.response?.data?.detail || err.message));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
        <h2 className="text-sm font-extrabold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-red-500" /> Foto(s) do Orçamento
        </h2>

        <div className="w-full border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl p-8 transition flex flex-col items-center cursor-pointer relative bg-zinc-950/60 group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setArquivos(Array.from(e.target.files))}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Camera className="w-12 h-12 text-zinc-500 group-hover:text-red-500 mb-3 transition" />
          <p className="text-xs font-medium text-zinc-200">
            {arquivos.length > 0
              ? `${arquivos.length} folha(s) selecionada(s)`
              : "Clique ou arraste a(s) foto(s) do talão"}
          </p>
          <span className="text-[10px] text-zinc-500 mt-1">Segure Ctrl/Shift para selecionar várias</span>
        </div>

        {/* Miniaturas das fotos enviadas para o Supabase */}
        {fotosUrls.length > 0 && (
          <div className="w-full mt-4 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-2 flex items-center gap-1 justify-center">
              <ImageIcon className="w-3 h-3 text-emerald-400" /> Salvas no Storage ({fotosUrls.length})
            </span>
            <div className="flex gap-2 justify-center overflow-x-auto">
              {fotosUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="Talão" className="w-14 h-14 object-cover rounded-lg border border-zinc-700 hover:border-red-500 transition" />
                </a>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleExtrairIA}
          disabled={loadingIA || arquivos.length === 0}
          className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loadingIA ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando foto & Lendo IA...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Extrair Dados da OS</>
          )}
        </button>
      </div>

      {/* Formulário */}
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
          <div>
            <label className="text-zinc-400 mb-1 block font-medium">Forma Pagamento</label>
            <input type="text" value={formData.forma_pagamento} onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none" />
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
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾 Salvar Ordem e Foto no Supabase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}