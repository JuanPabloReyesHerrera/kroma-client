import React, { useState } from "react";
import {
  User,
  Clock,
  Phone,
  Scissors,
  LogOut,
  Calendar,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Settings,
  MapPin,
  ChevronRight,
  Target,
  UserPlus,
  Star,
  DollarSign,
  BarChart3,
} from "lucide-react";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const [activeTab, setActiveTab] = useState("agenda");

  // Datos Mock Reales de Negocio
  const barberInfo = {
    nombre: "Juan Carlos",
    rol: "Barber Pro",
    sede: "ꓘROMA - Sede Central",
    stats: {
      gananciaMensual: 4850,
      clientesNuevos: 18,
      calificacionPromedio: 4.9,
      totalCortesMes: 142,
    },
    metas: {
      dia: { actual: 12, objetivo: 15, ganancia: 480 },
      semana: { actual: 58, objetivo: 80, ganancia: 2320 },
    },
  };

  const citasHoy = [
    {
      id: 1,
      hora: "09:00",
      cliente: "Carlos Méndez",
      servicio: "Corte Especial",
      cobro: "60 BOB",
      telefono: "+59177012345",
      estado: "completado",
    },
    {
      id: 2,
      hora: "10:00",
      cliente: "Andrés Rojas",
      servicio: "Corte Clásico + Barba",
      cobro: "70 BOB",
      telefono: "+59177067890",
      estado: "pendiente",
    },
    {
      id: 3,
      hora: "14:30",
      cliente: "Roberto Justiniano",
      servicio: "Perfilado de Barba",
      cobro: "30 BOB",
      telefono: "+59177122334",
      estado: "pendiente",
    },
    {
      id: 4,
      hora: "16:00",
      cliente: "Marcelo Vaca",
      servicio: "Corte Especial",
      cobro: "60 BOB",
      telefono: "+59177099887",
      estado: "pendiente",
    },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.user && credentials.pass) setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-all"
                placeholder="Tu usuario"
                onChange={(e) =>
                  setCredentials({ ...credentials, user: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-all"
                placeholder="••••••••"
                onChange={(e) =>
                  setCredentials({ ...credentials, pass: e.target.value })
                }
              />
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 mt-4">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header Limpio */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
            JC
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">
              {barberInfo.nombre}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {barberInfo.rol}
            </p>
          </div>
        </div>
        <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
            En línea
          </span>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {/* VISTA: AGENDA (Simple y Funcional) */}
        {activeTab === "agenda" && (
          <div className="animate-in fade-in duration-300">
            {/* Resumen Diario Compacto */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Cortes Hoy
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {barberInfo.metas.dia.actual}
                </p>
              </div>
              <div className="flex-1 bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <p className="text-[10px] font-bold text-indigo-200 uppercase">
                  Ganancia Hoy
                </p>
                <p className="text-2xl font-black">
                  {barberInfo.metas.dia.ganancia}{" "}
                  <span className="text-xs font-normal opacity-80">Bs</span>
                </p>
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Próximos Clientes
            </h3>

            <div className="space-y-3">
              {citasHoy.map((cita) => (
                <div
                  key={cita.id}
                  className={`bg-white border ${
                    cita.estado === "completado"
                      ? "border-slate-100"
                      : "border-l-4 border-l-indigo-600 border-slate-200"
                  } rounded-2xl p-5 shadow-sm transition-all`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`text-xl font-black ${
                        cita.estado === "completado"
                          ? "text-slate-300"
                          : "text-slate-800"
                      }`}
                    >
                      {cita.hora}
                    </span>
                    <span
                      className={`text-sm font-bold bg-slate-50 px-3 py-1 rounded-lg ${
                        cita.estado === "completado"
                          ? "text-slate-300"
                          : "text-indigo-600"
                      }`}
                    >
                      {cita.cobro}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4
                      className={`text-base font-bold ${
                        cita.estado === "completado"
                          ? "text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {cita.cliente}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {cita.servicio}
                    </p>
                  </div>

                  {cita.estado === "pendiente" && (
                    <div className="flex gap-2 border-t border-slate-50 pt-3">
                      <a
                        href={`tel:${cita.telefono}`}
                        className="flex-1 text-slate-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" /> Llamar
                      </a>
                      <a
                        href={`https://wa.me/${cita.telefono}`}
                        className="flex-1 text-green-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: METAS (ROBUSTA Y ANALÍTICA) */}
        {activeTab === "metas" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">
                Rendimiento Mensual
              </h3>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                Enero 2026
              </span>
            </div>

            {/* Tarjeta Principal de Ganancias */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Ganancia Acumulada
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-800">
                    {barberInfo.stats.gananciaMensual}
                  </span>
                  <span className="text-lg font-bold text-slate-400">Bs</span>
                </div>
                <div className="mt-2 text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded-md">
                  +12% vs mes anterior
                </div>
              </div>
              {/* Gráfico decorativo de fondo */}
              <TrendingUp
                className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-slate-50"
                strokeWidth={1}
              />
            </div>

            {/* Grid de Estadísticas Secundarias */}
            <div className="grid grid-cols-2 gap-4">
              {/* Clientes Nuevos */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800">
                    {barberInfo.stats.clientesNuevos}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    Clientes Nuevos
                  </p>
                </div>
              </div>

              {/* Calificación Promedio */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800">
                    {barberInfo.stats.calificacionPromedio}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    Calidad Servicio
                  </p>
                </div>
              </div>
            </div>

            {/* Objetivos de Producción */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-indigo-600" /> Objetivos de
                Producción
              </h4>

              {/* Meta Diaria */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500 font-medium">Cortes Hoy</span>
                  <span className="font-bold text-indigo-600">
                    {barberInfo.metas.dia.actual}/
                    {barberInfo.metas.dia.objetivo}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{
                      width: `${
                        (barberInfo.metas.dia.actual /
                          barberInfo.metas.dia.objetivo) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Meta Semanal */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500 font-medium">
                    Meta Semanal
                  </span>
                  <span className="font-bold text-indigo-600">
                    {barberInfo.metas.semana.actual}/
                    {barberInfo.metas.semana.objetivo}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{
                      width: `${
                        (barberInfo.metas.semana.actual /
                          barberInfo.metas.semana.objetivo) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: PERFIL */}
        {activeTab === "perfil" && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center mb-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-slate-800">
                {barberInfo.nombre}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                {barberInfo.rol}
              </p>

              <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Sede
                  </p>
                  <p className="text-sm font-bold text-slate-700">Central</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    ID Empleado
                  </p>
                  <p className="text-sm font-bold text-slate-700">#0042</p>
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
                onClick={() => setIsLoggedIn(false)}
                className="w-full p-4 flex items-center gap-4 hover:bg-red-50 transition-all text-left text-red-500"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-bold">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navegación Inferior (Minimalista) */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-6 flex justify-around items-center">
        <button
          onClick={() => setActiveTab("agenda")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "agenda"
              ? "text-indigo-600 scale-105"
              : "text-slate-300"
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Agenda
          </span>
        </button>
        <button
          onClick={() => setActiveTab("metas")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "metas"
              ? "text-indigo-600 scale-105"
              : "text-slate-300"
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Metas
          </span>
        </button>
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "perfil"
              ? "text-indigo-600 scale-105"
              : "text-slate-300"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Perfil
          </span>
        </button>
      </nav>
    </div>
  );
};

export default AdminPanel;
