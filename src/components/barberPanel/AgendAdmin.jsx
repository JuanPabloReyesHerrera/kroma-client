import React from "react";
import { Calendar, RefreshCw, Phone, MessageCircle } from "lucide-react";
const AgendAdmin = ({
  stats = { cortesHoy: 0, gananciaHoy: 0 },
  appointments = [],
  onRefresh,
}) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Cortes Hoy
          </p>
          <p className="text-2xl font-black text-slate-800">
            {stats.cortesHoy || 0}
          </p>
        </div>
        <div className="flex-1 bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white">
          <p className="text-[10px] font-bold text-indigo-200 uppercase">
            Ganancia Hoy
          </p>
          <p className="text-2xl font-black">
            {stats.gananciaHoy || 0}{" "}
            <span className="text-xs font-normal opacity-80">Bs</span>
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Próximos Clientes
        </h3>
        <button
          onClick={onRefresh}
          className="p-2 bg-white rounded-full text-indigo-600 shadow-sm border border-slate-100 hover:rotate-180 transition-all"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-10 opacity-50 text-sm">
            No hay citas programadas para hoy.
          </div>
        ) : (
          appointments.map((cita) => (
            <div
              key={cita.id}
              className={`bg-white border ${
                cita.status === "completed"
                  ? "border-slate-100 opacity-60"
                  : "border-l-4 border-l-indigo-600 border-slate-200"
              } rounded-2xl p-5 shadow-sm transition-all`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-black text-slate-800">
                  {cita.hora_inicio?.slice(0, 5)}
                </span>
                <span className="text-sm font-bold bg-slate-50 px-3 py-1 rounded-lg text-indigo-600">
                  {cita.price_snapshot} BOB
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-base font-bold text-slate-800">
                  {cita.clients?.nombre || "Cliente"}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {cita.service_name_snapshot}
                </p>
                {cita.comentario_cliente && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-100">
                    📝 Nota: {cita.comentario_cliente}
                  </p>
                )}
              </div>

              <div className="flex gap-2 border-t border-slate-50 pt-3">
                {cita.clients?.telefono && (
                  <>
                    <a
                      href={`tel:${cita.clients.telefono}`}
                      className="flex-1 text-slate-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" /> Llamar
                    </a>
                    <a
                      href={`https://wa.me/591${cita.clients.telefono}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-green-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgendAdmin;
