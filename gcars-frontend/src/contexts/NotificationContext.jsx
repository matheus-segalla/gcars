import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Trash2, 
  Loader2 
} from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  // Estado do Toast
  const [toast, setToast] = useState({
    aberto: false,
    tipo: 'sucesso', // 'sucesso' | 'erro' | 'aviso' | 'info'
    titulo: '',
    mensagem: '',
  });

  // Estado do Modal de Confirmação
  const [confirmDialog, setConfirmDialog] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
    loading: false,
    isDanger: true,
  });

  // Função para abrir o Toast
  const showToast = useCallback((mensagem, tipo = 'sucesso', titulo = '') => {
    const titulosPadrao = {
      sucesso: 'Sucesso!',
      erro: 'Ocorreu um erro',
      aviso: 'Atenção',
      info: 'Informação',
    };

    setToast({
      aberto: true,
      tipo,
      titulo: titulo || titulosPadrao[tipo] || 'Aviso',
      mensagem,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, aberto: false }));
    }, 4000);
  }, []);

  // Função para abrir o Modal de Confirmação
  const showConfirm = useCallback(({ 
    titulo = 'Confirmar Ação', 
    mensagem = 'Tem certeza que deseja continuar?', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    onConfirm = () => {},
    isDanger = true 
  }) => {
    setConfirmDialog({
      aberto: true,
      titulo,
      mensagem,
      confirmText,
      cancelText,
      onConfirm,
      loading: false,
      isDanger,
    });
  }, []);

  const handleExecuteConfirm = async () => {
    if (confirmDialog.onConfirm) {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      try {
        await confirmDialog.onConfirm();
        setConfirmDialog((prev) => ({ ...prev, aberto: false, loading: false }));
      } catch (err) {
        setConfirmDialog((prev) => ({ ...prev, loading: false }));
      }
    } else {
      setConfirmDialog((prev) => ({ ...prev, aberto: false }));
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* 🔔 Toast Flutuante Global */}
      {toast.aberto && (
        <div className="fixed top-6 right-6 z-50 flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-sm transition-all animate-bounce-short">
          <div className="p-1.5 rounded-xl flex-shrink-0 mt-0.5">
            {toast.tipo === 'sucesso' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.tipo === 'erro' && <XCircle className="w-5 h-5 text-red-500" />}
            {toast.tipo === 'aviso' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.tipo === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>

          <div className="flex-1 pr-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{toast.titulo}</h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.mensagem}</p>
          </div>

          <button
            onClick={() => setToast((prev) => ({ ...prev, aberto: false }))}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ⚠️ Modal de Confirmação Global */}
      {confirmDialog.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmDialog.titulo}</h3>
                <p className="text-xs text-zinc-400">Confirme para prosseguir</p>
              </div>
            </div>

            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
              {confirmDialog.mensagem}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, aberto: false }))}
                disabled={confirmDialog.loading}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition"
              >
                {confirmDialog.cancelText}
              </button>

              <button
                type="button"
                onClick={handleExecuteConfirm}
                disabled={confirmDialog.loading}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 disabled:opacity-50 text-white ${
                  confirmDialog.isDanger
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {confirmDialog.loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                ) : (
                  confirmDialog.confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

// Hook personalizado para usar em qualquer tela
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
}