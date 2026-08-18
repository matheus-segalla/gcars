import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.sucesso) {
        localStorage.setItem('gcars_token', res.data.token);
        navigate('/admin');
      }
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4">
      <Link to="/" className="text-zinc-500 hover:text-white mb-6 flex items-center gap-2 text-xs font-semibold">
        <ArrowLeft className="w-4 h-4" /> Voltar para o site
      </Link>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg shadow-red-600/30 mb-3">
            <Car className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-black text-white italic tracking-wider">GCARS REPAROS</h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase font-bold">Acesso Restrito à Oficina</p>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4 text-center">
            {erro}
          </div>
        )}

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
                placeholder="email@gmail.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1.5 font-medium">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}