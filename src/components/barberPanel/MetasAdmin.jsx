import React from "react";
import { TrendingUp, DollarSign, UserPlus, Star, Target } from "lucide-react";

// FIX: Agregamos valores por defecto en la desestructuración de props
// Esto evita que la app explote si 'stats' llega vacío o undefined
const AdminMetas = ({
  stats = {
    gananciaMensual: 0,
    clientesNuevos: 0,
    cortesHoy: 0,
    gananciaHoy: 0,
  },
  rating,
}) => {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-800">Rendimiento</h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
          Mes Actual
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Ganancia Proyectada
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-800">
              {stats.gananciaMensual || 0}
            </span>
            <span className="text-lg font-bold text-slate-400">Bs</span>
          </div>
        </div>
        <TrendingUp
          className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-slate-50"
          strokeWidth={1}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">
              {stats.clientesNuevos || 0}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
              Nuevos
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">
              {rating || 5.0}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
              Calificación
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-indigo-600" /> Meta Diaria
        </h4>
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-500 font-medium">Progreso</span>
            <span className="font-bold text-indigo-600">
              {stats.cortesHoy || 0}/10
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((stats.cortesHoy || 0) / 10) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMetas;
