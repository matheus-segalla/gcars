import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Award, 
  Loader2, 
  Power 
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function Equipe() {
  const { showToast, showConfirm } = useNotification();
  const [desempenho, setDesempenho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novoCargo, setNovoCargo] = useState('Mecânico Geral');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/funcionarios/relatorio-desempenho');
      setDesempenho(res.data || []);
    } catch (err) {
      showToast('Erro ao carregar dados da equipe.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setSalvando(true);
    try {
      await api.post('/api/funcionarios', { nome: novoNome, cargo: novoCargo });
      showToast(`Funcionário ${novoNome} cadastrado com sucesso!`, 'sucesso');
      setNovoNome('');
      carregarDados();
    } catch (err) {
      showToast(err.response?.data?.detail || err.message, 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = (func) => {
    const acao = func.ativo ? 'desativar' : 'reativar';
    showConfirm({
      titulo: `${func.ativo ? 'Desativar' : 'Reativar'} Funcionário?`,
      mensagem: `Deseja ${acao} o cadastro de ${func.nome}?`,
      confirmText: func.ativo ? 'Sim, Desativar' : 'Reativar',
      isDanger: func.ativo,
      onConfirm: async () => {
        try {
          await api.patch(`/api/funcionarios/${func.id}/toggle-status`);
          showToast(`Status de ${func.nome} atualizado!`, 'sucesso');
          carregarDados();
        } catch (err) {
          showToast('Erro ao alterar status.', 'erro');
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* ➕ Cadastro Rápido */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl transition-colors">
        <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-red-500" /> Cadastrar Novo Funcionário
        </h2>

        <form onSubmit={handleCadastrar} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">Nome Completo / Apelido</label>
            <input
              type="text"
              placeholder="Ex: Carlos Mecânico"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">Função / Especialidade</label>
            <select
              value={novoCargo}
              onChange={e => setNovoCargo(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="Mecânico Geral">Mecânico Geral</option>
              <option value="Mecânico Especialista (Motor)">Mecânico Especialista (Motor)</option>
              <option value="Alinhador / Suspensão">Alinhador / Suspensão</option>
              <option value="Eletricista / Diagnóstico">Eletricista / Diagnóstico</option>
              <option value="Auxiliar de Mecânica">Auxiliar de Mecânica</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Adicionar à Equipe
            </button>
          </div>
        </form>
      </div>

      {/* 📊 Relatório da Equipe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">Métricas & Produtividade</span>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">Desempenho dos Mecânicos</h3>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total de {desempenho.length} profissionais</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Calculando métricas da oficina...</span>
          </div>
        ) : desempenho.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs">
            Nenhum funcionário cadastrado ainda. Use o formulário acima para adicionar o primeiro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {desempenho.map((func, index) => (
              <div 
                key={func.id} 
                className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden transition ${
                  func.ativo 
                    ? 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700' 
                    : 'border-zinc-200 dark:border-zinc-800/40 opacity-60'
                }`}
              >
                {index === 0 && func.total_ordens > 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-black font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                    <Award className="w-3.5 h-3.5" /> Destaque
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      {func.nome}
                      {!func.ativo && (
                        <span className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-normal">
                          Inativo
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{func.cargo}</span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(func)}
                    className={`p-1.5 rounded-lg transition ${
                      func.ativo 
                        ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800' 
                        : 'text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    title={func.ativo ? "Desativar Funcionário" : "Reativar Funcionário"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-950/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Serviços Feitos</span>
                    <span className="text-base font-black text-zinc-900 dark:text-white">{func.total_ordens} OS</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Mão de Obra</span>
                    <span className="text-base font-black text-emerald-500 dark:text-emerald-400">
                      R$ {Number(func.total_mao_obra || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Ticket Médio por OS:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">R$ {Number(func.ticket_medio || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}