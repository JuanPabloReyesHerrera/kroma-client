import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/conection";
import { User, Calendar, BarChart3, BellRing } from "lucide-react";

// Componentes locales
import LoginAdmin from "../components/barberPanel/LoginAdmin";
import AgendAdmin from "../components/barberPanel/AgendAdmin";
import MetasAdmin from "../components/barberPanel/MetasAdmin";
import PerfilAdmin from "../components/barberPanel/PerfilAdmin";

/**
 * AdminPanel Component
 * Integra Supabase Realtime y OneSignal para notificaciones profesionales.
 */
const AdminPanel = () => {
  // --- ESTADOS ---
  const [session, setSession] = useState(null);
  const [barberProfile, setBarberProfile] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  // Datos de Negocio
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ cortesHoy: 0, gananciaHoy: 0 });
  const [activeTab, setActiveTab] = useState("agenda");

  // Formulario de Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ID de OneSignal
  const [oneSignalId, setOneSignalId] = useState(null);

  // --- 1. CONFIGURACIÓN ONESIGNAL ---
  useEffect(() => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function (OneSignal) {
        // Obtener ID de suscripción
        const userId = await OneSignal.User.PushSubscription.id;
        if (userId) {
          console.log("✅ OneSignal User ID:", userId);
          setOneSignalId(userId);
        }

        // Listener para cambios en la suscripción
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          if (event.current.id) setOneSignalId(event.current.id);
        });
      });
    }
  }, []);

  const requestOSPermission = () => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.Notifications.requestPermission();
      });
    }
  };

  // --- 2. GESTIÓN DE SESIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchBarberProfile(session.user.id);
      else setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchBarberProfile(session.user.id);
      else {
        setBarberProfile(null);
        setAppointments([]);
        setAuthChecking(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- 3. REALTIME Y NOTIFICACIONES LOCALES ---
  useEffect(() => {
    if (!barberProfile?.id) return;

    const channel = supabase
      .channel("cambios-citas-os")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `barber_id=eq.${barberProfile.id}`,
        },
        async (payload) => {
          console.log("🔔 Nueva cita recibida:", payload.new);

          const { data } = await supabase
            .from("appointments")
            .select("*, clients(nombre)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            // Sonido de alerta
            new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
            )
              .play()
              .catch(() => {});

            // Notificación nativa si el permiso está concedido
            if (Notification.permission === "granted") {
              new Notification("✂️ Nueva Cita Agendada", {
                body: `${data.hora_inicio.slice(0, 5)} - ${data.clients?.nombre || "Cliente"}`,
                icon: "https://cdn-icons-png.flaticon.com/512/1039/1039328.png",
                tag: "cita-nueva",
              });
            }

            fetchTodaysData(barberProfile.id);
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [barberProfile?.id]);

  // --- 4. CARGA DE DATOS ---
  const fetchBarberProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("barbers")
        .select("*, sedes(nombre)")
        .eq("linked_user_id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setBarberProfile(data);
        fetchTodaysData(data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchTodaysData = async (barberId) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("appointments")
      .select("*, clients(nombre, telefono)")
      .eq("barber_id", barberId)
      .eq("fecha", today)
      .neq("status", "cancelled")
      .order("hora_inicio", { ascending: true });

    const safeData = data || [];
    setAppointments(safeData);
    setStats({
      cortesHoy: safeData.length,
      gananciaHoy: safeData.reduce(
        (acc, curr) => acc + (Number(curr.price_snapshot) || 0),
        0,
      ),
    });
  };

  // --- HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- RENDER ---
  if (authChecking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold animate-pulse">
        Cargando KROMA...
      </div>
    );

  if (!session || !barberProfile)
    return (
      <LoginAdmin
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        loading={loading}
      />
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 uppercase text-lg">
            {barberProfile.nombre?.substring(0, 2)}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">
              {barberProfile.nombre}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {barberProfile.sedes?.nombre || "Especialista"}
            </p>
          </div>
        </div>

        {/* Estado Notificaciones */}
        <div className="flex items-center gap-2">
          {!oneSignalId ? (
            <button
              onClick={requestOSPermission}
              className="p-2 bg-indigo-600 text-white rounded-full animate-bounce shadow-lg"
            >
              <BellRing size={20} />
            </button>
          ) : (
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              NOTIFICACIONES ON
            </div>
          )}
        </div>
      </header>

      {/* Contenido según Tab */}
      <main className="p-6 max-w-md mx-auto">
        {activeTab === "agenda" ? (
          <AgendAdmin
            stats={stats}
            appointments={appointments}
            onRefresh={() => fetchTodaysData(barberProfile.id)}
          />
        ) : activeTab === "metas" ? (
          <MetasAdmin stats={stats} />
        ) : (
          <PerfilAdmin
            barberProfile={barberProfile}
            email={session.user.email}
            handleLogout={handleLogout}
          />
        )}
      </main>

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-6 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab("agenda")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "agenda" ? "text-indigo-600 scale-105" : "text-slate-300"}`}
        >
          <Calendar size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Agenda
          </span>
        </button>
        <button
          onClick={() => setActiveTab("metas")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "metas" ? "text-indigo-600 scale-105" : "text-slate-300"}`}
        >
          <BarChart3 size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Metas
          </span>
        </button>
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "perfil" ? "text-indigo-600 scale-105" : "text-slate-300"}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Perfil
          </span>
        </button>
      </nav>
    </div>
  );
};

export default AdminPanel;
