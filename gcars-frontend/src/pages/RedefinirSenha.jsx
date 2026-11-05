import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useNotification();

  const [accessToken, setAccessToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // 1. Tenta extrair token do hash (#access_token=...&type=recovery)
    const hash = location.hash || window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        return;
      }
    }

    // 2. Tenta extrair da query string (?token=... ou ?access_token=...)
    const queryParams = new URLSearchParams(location.search);
    const tokenQuery = queryParams.get('token') || queryParams.get('access_token');
    if (tokenQuery) {
      setAccessToken(tokenQuery);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      return setErro('A nova senha deve ter no mínimo 6 caracteres.');
    }

    if (novaSenha !== confirmarSenha) {
      return setErro('As senhas digitadas não coincidem.');
    }

    if (!accessToken) {
      return setErro('Token de recuperação não identificado. Por favor, solicite um novo link de recuperação no login.');
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/redefinir-senha', {
        access_token: accessToken,
        nova_senha: novaSenha
      });

      if (res.data.sucesso) {
        setSucesso(true);
        showToast('Senha alterada com sucesso! Faça login com sua nova senha.', 'sucesso');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4">
      <Link to="/login" className="text-zinc-500 hover:text-white mb-6 flex items-center gap-2 text-xs font-semibold">
        <ArrowLeft className="w-4 h-4" /> Voltar para o login
      </Link>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/logo.png"
            alt="Logo GCARS Reparos Automotivos"
            className="w-48 h-auto object-contain mb-3 drop-shadow-md"
          />
          <h1 className="text-lg font-black text-white uppercase tracking-wider">
            Redefinir Senha
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Digite sua nova senha para acessar o painel da oficina
          </p>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold">Senha redefinida com sucesso!</p>
            <p className="text-zinc-400 text-[11px]">Redirecionando para a tela de login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Nova Senha (mínimo 6 caracteres)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-white focus:border-red-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando nova senha...</span>
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
