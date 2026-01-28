import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/conection";
import { User, Calendar, BarChart3, Zap } from "lucide-react";

// Componentes locales
import LoginAdmin from "../components/barberPanel/LoginAdmin";
import AgendAdmin from "../components/barberPanel/AgendAdmin";
import MetasAdmin from "../components/barberPanel/MetasAdmin";
import PerfilAdmin from "../components/barberPanel/PerfilAdmin";

const AdminPanel = () => {
  // --- ESTADOS ---
  const [session, setSession] = useState(null);
  const [barberProfile, setBarberProfile] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  // Datos
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ cortesHoy: 0, gananciaHoy: 0 });
  const [activeTab, setActiveTab] = useState("agenda");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ESTADOS DE DEBUGGING PARA ONESIGNAL
  const [osStatus, setOsStatus] = useState("Cargando...");
  const [subscriptionId, setSubscriptionId] = useState(null);

  // --- 1. SINCRONIZACIÓN CON ONESIGNAL ---
  useEffect(() => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function (OneSignal) {
        // A. Verificar ID de suscripción real
        const id = await OneSignal.User.PushSubscription.id;
        setSubscriptionId(id);

        if (id) {
          setOsStatus("✅ Suscrito");
        } else {
          setOsStatus("⚠️ Sin Suscripción");
        }

        // B. Escuchar cambios de permiso y suscripción
        ("permissionChange",
          OneSignal.Notifications.addEventListener((permission) => {
            if (permission === "granted") setOsStatus("✅ Permitido");
            else setOsStatus("❌ Bloqueado");
          }));

        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          setSubscriptionId(event.current.id);
        });
      });
    } else {
      setOsStatus("❌ SDK no cargado");
    }
  }, []);

  // PRUEBA FORZADA (Vía Service Worker para iOS/Safari)
  const sendTestNotification = async () => {
    if (Notification.permission !== "granted") {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal) {
          await OneSignal.Notifications.requestPermission();
        });
      }
      return;
    }

    try {
      const timestamp = new Date().toLocaleTimeString();
      // En PWA iOS, usamos el registro del Service Worker directamente para asegurar la alerta visual
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("Kroma Pro", {
          body: `Prueba visual exitosa: ${timestamp}`,
          icon: "/logo192.png",
          badge: "/logo192.png",
          tag: "test-" + Date.now(),
          renotify: true,
          data: { url: window.location.origin },
        });
      } else {
        new Notification("Kroma Pro", { body: `Prueba simple: ${timestamp}` });
      }
    } catch (error) {
      console.error("Error en notificación:", error);
    }
  };

  // --- 2. SESIÓN Y PERFIL ---
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

  // --- 3. REALTIME (ALERTAS LOCALES) ---
  useEffect(() => {
    if (!barberProfile?.id) return;
    const channel = supabase
      .channel("cambios-citas-admin")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `barber_id=eq.${barberProfile.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("appointments")
            .select("*, clients(nombre)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            // Reproducir sonido para feedback inmediato
            new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
            )
              .play()
              .catch(() => {});

            // Notificación visual persistente
            if (
              Notification.permission === "granted" &&
              "serviceWorker" in navigator
            ) {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification("✂️ Nueva Cita", {
                body: `${data.hora_inicio.slice(0, 5)} - ${data.clients?.nombre || "Cliente"}`,
                icon: "/logo192.png",
                tag: "cita-" + data.id,
                renotify: true,
              });
            }
            fetchTodaysData(barberProfile.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: `barber_id=eq.${barberProfile.id}`,
        },
        async (payload) => {
          // Detectamos si el cambio fue a cancelado
          if (
            payload.new.status === "cancelled" &&
            payload.old.status !== "cancelled"
          ) {
            const { data } = await supabase
              .from("clients")
              .select("nombre")
              .eq("id", payload.new.client_id)
              .single();

            enviarNotificacion(
              "❌ Cita Cancelada",
              `El cliente ${data?.nombre || ""} ha cancelado su cita.`,
            );
            fetchTodaysData(barberProfile.id);
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [barberProfile?.id]);

  // --- MÉTODOS DE DATOS ---
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold animate-pulse text-sm uppercase tracking-widest">
        Iniciando Kroma Pro...
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
      {/* HEADER */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-indigo-100 shadow-lg uppercase">
            {barberProfile.nombre?.substring(0, 2)}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {barberProfile.nombre}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${subscriptionId ? "bg-green-500" : "bg-slate-300 animate-pulse"}`}
              ></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {osStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={sendTestNotification}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${subscriptionId ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-slate-200 text-slate-400"} shadow-lg`}
          >
            <Zap size={20} fill={subscriptionId ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

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

      {/* NAVBAR */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab("agenda")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "agenda" ? "text-indigo-600 scale-110" : "text-slate-300"}`}
        >
          <Calendar size={24} />
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Agenda
          </span>
        </button>
        <button
          onClick={() => setActiveTab("metas")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "metas" ? "text-indigo-600 scale-110" : "text-slate-300"}`}
        >
          <BarChart3 size={24} />
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Metas
          </span>
        </button>
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "perfil" ? "text-indigo-600 scale-110" : "text-slate-300"}`}
        >
          <User size={24} />
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Perfil
          </span>
        </button>
      </nav>
    </div>
  );
};

export default AdminPanel;
