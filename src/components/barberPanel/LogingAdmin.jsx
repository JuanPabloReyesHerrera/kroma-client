import React from "react";
import { RefreshCw } from "lucide-react";

const AdminLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  loading,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-1">
            ꓘROMA{" "}
            <span className="text-indigo-600 not-italic font-bold text-sm">
              PRO
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Panel de Especialistas
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
              Usuario
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-all"
              placeholder="juan@kroma.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 mt-4 flex justify-center"
          >
            {loading ? <RefreshCw className="animate-spin" /> : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
