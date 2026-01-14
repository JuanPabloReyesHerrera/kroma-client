import React from "react";
import { User, Settings, LogOut } from "lucide-react";

const AdminProfile = ({ barberProfile, session, handleLogout }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center mb-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4 font-bold text-2xl uppercase">
          {barberProfile?.nombre ? barberProfile.nombre.substring(0, 2) : "AD"}
        </div>
        <h3 className="font-black text-lg text-slate-800">
          {barberProfile?.nombre}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          {barberProfile?.especialidad}
        </p>

        <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-2xl">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">
              Sede
            </p>
            <p className="text-sm font-bold text-slate-700">
              {barberProfile?.sedes?.nombre || "Central"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">
              Usuario
            </p>
            <p className="text-sm font-bold text-slate-700 truncate">
              {session?.user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <button className="w-full p-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50 transition-all text-left">
          <Settings className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">
            Configuración
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full p-4 flex items-center gap-4 hover:bg-red-50 transition-all text-left text-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
