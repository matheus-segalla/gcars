import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Estados de Esqueci Minha Senha
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [msgSucessoRecuperacao, setMsgSucessoRecuperacao] = useState('');

  const navigate = useNavigate();
  const { showToast } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.sucesso) {
        localStorage.setItem('gcars_token', res.data.token);
        if (res.data.usuario?.nome) {
          showToast(`Bem-vindo, ${res.data.usuario.nome}!`, 'sucesso');
        }
        navigate('/admin');
      }
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarRecuperacao = async (e) => {
    e.preventDefault();
    setEnviandoRecuperacao(true);
    setErro('');
    setMsgSucessoRecuperacao('');

    try {
      const res = await api.post('/api/auth/recuperar-senha', {
        email: emailRecuperacao.trim()
      });

      setMsgSucessoRecuperacao(
        res.data.mensagem ||
        `Enviamos um e-mail com instruções para redefinição de senha para ${emailRecuperacao}.`
      );
      showToast('E-mail de recuperação enviado com sucesso!', 'sucesso');
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao solicitar recuperação de senha.');
    } finally {
      setEnviandoRecuperacao(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-8">
      <Link to="/" className="text-zinc-500 hover:text-white mb-6 flex items-center gap-2 text-xs font-semibold transition">
        <ArrowLeft className="w-4 h-4" /> Voltar para o site
      </Link>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition">
        
        {/* 🌟 Logotipo Oficial GCARS */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 mb-3 shadow-inner flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo Oficial GCARS Reparos Automotivos"
              className="w-48 sm:w-56 h-auto max-h-24 object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-sm font-black text-white italic tracking-wider uppercase mt-1">
            GCARS REPAROS AUTOMOTIVOS
          </h1>
          <p className="text-[11px] text-zinc-400 mt-0.5 uppercase font-bold tracking-wider">
            {modoEsqueciSenha ? 'Recuperação de Acesso' : 'Acesso Restrito à Oficina'}
          </p>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4 text-center">
            {erro}
          </div>
        )}

        {msgSucessoRecuperacao && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs mb-4 text-center space-y-2 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-bold">{msgSucessoRecuperacao}</p>
            <p className="text-zinc-400 text-[11px]">
              Verifique sua caixa de entrada e pasta de spam e clique no link recebido.
            </p>
          </div>
        )}

        {!modoEsqueciSenha ? (
          /* Formulário de Login Tradicional */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-400 font-medium">Senha</label>
                <button
                  type="button"
                  onClick={() => {
                    setModoEsqueciSenha(true);
                    setErro('');
                    setMsgSucessoRecuperacao('');
                    if (!emailRecuperacao && email) setEmailRecuperacao(email);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-red-400 transition font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 mt-2 active:scale-95 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar no Sistema'}
            </button>
          </form>
        ) : (
          /* Formulário de Esqueci Minha Senha */
          <form onSubmit={handleSolicitarRecuperacao} className="space-y-4 text-xs animate-in fade-in duration-200">
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              <KeyRound className="w-4 h-4 text-amber-500 inline mr-1.5" />
              Digite o e-mail associado à sua conta. Enviaremos um link seguro para confirmação e troca de senha.
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Seu E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={emailRecuperacao}
                  onChange={e => setEmailRecuperacao(e.target.value)}
                  placeholder="piresluccas@hotmail.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviandoRecuperacao}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 active:scale-95 cursor-pointer"
            >
              {enviandoRecuperacao ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando confirmação...</span>
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setModoEsqueciSenha(false);
                  setErro('');
                  setMsgSucessoRecuperacao('');
                }}
                className="text-xs text-zinc-400 hover:text-white transition font-bold"
              >
                ← Voltar para o formulário de login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
