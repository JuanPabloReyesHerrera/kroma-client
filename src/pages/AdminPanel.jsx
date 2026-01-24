import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/conection";
import {
  User,
  Calendar,
  BarChart3,
  BellRing,
  Smartphone,
  Zap,
} from "lucide-react";

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

  // ESTADOS DE DEBUGGING PARA IOS
  const [debugLog, setDebugLog] = useState("Listo para probar");
  const [osPermission, setOsPermission] = useState(false);

  const log = (msg) => {
    console.log(msg);
    setDebugLog(msg);
  };

  // --- 1. CONFIGURACIÓN ONESIGNAL (Mantenemos la escucha básica) ---
  useEffect(() => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function (OneSignal) {
        // Chequear permiso al cargar
        const permission = OneSignal.Notifications.permission;
        setOsPermission(permission === "granted");
        log(`Estado Inicial: ${permission}`);

        OneSignal.Notifications.addEventListener(
          "permissionChange",
          (permission) => {
            log(`Cambio Permiso: ${permission}`);
            setOsPermission(permission === "granted");
          },
        );
      });
    }
  }, []);

  // --- PRUEBA NATIVA (SIN ONESIGNAL) ---
  // Esta función usa el API estándar del navegador, igual que lo hacíamos antes.
  const testNativeNotification = async () => {
    log("⚡ Iniciando prueba nativa...");

    // 1. Verificar soporte
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }

    // 2. Verificar estado actual
    if (Notification.permission === "granted") {
      log("⚡ Enviando notificación directa...");
      try {
        // Intentamos registrar el SW primero para asegurar que funcione en PWA
        // Nota: En iOS PWA, a veces navigator.serviceWorker.ready tarda.
        // Si falla, el catch usará new Notification() estándar.
        const registration = await navigator.serviceWorker.ready;

        // Usamos showNotification del Service Worker (Mejor para PWA)
        await registration.showNotification("Prueba Nativa", {
          body: "Si ves esto, el iPhone está PERMITIENDO notificaciones ✅",
          icon: "/logo192.png",
          vibrate: [200, 100, 200],
        });
        alert("Se envió la señal. ¿Sonó?");
      } catch (e) {
        console.error(e);
        // Fallback al método simple
        new Notification("Prueba Nativa Simple", {
          body: "Prueba de fallback sin SW",
          icon: "/logo192.png",
        });
      }
    } else if (Notification.permission !== "denied") {
      log("⚡ Pidiendo permiso nativo...");
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("¡Permiso Concedido!", {
          body: "Ahora intenta enviar la prueba de nuevo.",
          icon: "/logo192.png",
        });
        setOsPermission(true);
      } else {
        alert("Permiso denegado por el usuario.");
      }
    } else {
      alert(
        "⚠️ El sistema dice DENIED (Bloqueado). Ve a Ajustes del iPhone > Notificaciones > Kroma Pro y actívalo.",
      );
    }
  };

  // --- 2. SESIÓN ---
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

  // --- 3. REALTIME (Tu código original que funcionaba) ---
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
          console.log("🔔 Nueva cita (Realtime):", payload.new);

          const { data } = await supabase
            .from("appointments")
            .select("*, clients(nombre)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            // Sonido
            new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
            )
              .play()
              .catch(() => {});

            // Intento de notificación nativa inmediata
            if (Notification.permission === "granted") {
              // Intentamos usar el SW si está disponible (más robusto en Android/iOS)
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready.then((registration) => {
                  registration.showNotification("✂️ Nueva Cita Agendada", {
                    body: `${data.hora_inicio.slice(0, 5)} - ${data.clients?.nombre || "Cliente"}`,
                    icon: "/logo192.png",
                    tag: "cita-nueva",
                  });
                });
              } else {
                // Fallback clásico
                new Notification("✂️ Nueva Cita Agendada", {
                  body: `${data.hora_inicio.slice(0, 5)} - ${data.clients?.nombre || "Cliente"}`,
                  icon: "/logo192.png",
                  tag: "cita-nueva",
                });
              }
            }

            fetchTodaysData(barberProfile.id);
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [barberProfile?.id]);

  // --- DATOS ---
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

  // --- LOGIN ---
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

        {/* ZONA DE PRUEBAS */}
        <div className="flex flex-col items-end">
          <button
            onClick={testNativeNotification}
            className={`p-2 rounded-full shadow-lg flex items-center gap-1 transition-all active:scale-95 ${osPermission ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-500"}`}
          >
            <Zap size={20} fill="currentColor" />
          </button>

          <span className="text-[9px] mt-1 font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
            {debugLog.substring(0, 20)}...
          </span>
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
