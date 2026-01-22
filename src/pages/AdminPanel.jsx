import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/conection";
import {
  User,
  Calendar,
  BarChart3,
  LogOut,
  Bell,
  BellRing,
} from "lucide-react";

// Componentes locales (Asegúrate de que las rutas coincidan con la estructura regenerada)
import LoginAdmin from "../components/barberPanel/LoginAdmin";
import AgendAdmin from "../components/barberPanel/AgendAdmin";
import MetasAdmin from "../components/barberPanel/MetasAdmin";
import PerfilAdmin from "../components/barberPanel/PerfilAdmin";

const AdminPanel = () => {
  // --- ESTADOS ---
  const [session, setSession] = useState(null);
  const [barberProfile, setBarberProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Datos
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ cortesHoy: 0, gananciaHoy: 0 });

  // UI
  const [activeTab, setActiveTab] = useState("agenda");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Notificaciones
  const [permission, setPermission] = useState(Notification.permission);

  // --- FUNCIÓN: SOLICITAR PERMISOS ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      new Notification("¡Notificaciones activadas!", {
        body: "Te avisaremos aquí cuando llegue un cliente, incluso con la pantalla bloqueada.",
        icon: "https://cdn-icons-png.flaticon.com/512/1039/1039328.png",
      });
    }
  };

  // --- FUNCIÓN: DISPARAR NOTIFICACIÓN REAL ---
  const sendSystemNotification = (cita) => {
    // Sonido
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.play().catch((e) => console.log("Audio background restricted"));

    // Notificación Visual (Pantalla Bloqueada)
    // El flag 'true' es para forzar el envío en la demo, en prod usar document.hidden
    if (Notification.permission === "granted") {
      const notif = new Notification("✂️ Nueva Cita Agendada", {
        body: `${cita.hora_inicio.substring(0, 5)} - ${cita.clients?.nombre || "Nuevo Cliente"}\nServicio: ${cita.service_name_snapshot}`,
        icon: "https://cdn-icons-png.flaticon.com/512/1039/1039328.png",
        tag: "cita-nueva", // Evita duplicados
        vibrate: [200, 100, 200],
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
  };

  // --- 1. MANEJO DE SESIÓN ---
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

  // --- 2. REALTIME (CONECTADO A NOTIFICACIONES) ---
  useEffect(() => {
    if (!barberProfile?.id) return;
    console.log("📡 Conectando Realtime...");

    const channel = supabase
      .channel("cambios-citas")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `barber_id=eq.${barberProfile.id}`,
        },
        async (payload) => {
          console.log("🔔 Cita Recibida", payload.new);

          // Buscamos datos extra del cliente para mostrar el nombre en la notificación
          const { data: fullData } = await supabase
            .from("appointments")
            .select("*, clients(nombre)")
            .eq("id", payload.new.id)
            .single();

          if (fullData) {
            sendSystemNotification(fullData);
            fetchTodaysData(barberProfile.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [barberProfile?.id]);

  // --- 3. FUNCIONES DE DATOS ---
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
      console.error("Error perfil:", err);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchTodaysData = async (barberId) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients(nombre, telefono)")
        .eq("barber_id", barberId)
        .eq("fecha", today)
        .neq("status", "cancelled")
        .order("hora_inicio", { ascending: true });

      if (error) throw error;

      const safeData = data || [];
      setAppointments(safeData);

      const totalCortes = safeData.length;
      const totalGanancia = safeData.reduce(
        (acc, curr) => acc + (Number(curr.price_snapshot) || 0),
        0,
      );
      setStats({ cortesHoy: totalCortes, gananciaHoy: totalGanancia });
    } catch (err) {
      console.error("Error data:", err);
    }
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
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- RENDER ---
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold animate-pulse">
        Cargando Sistema...
      </div>
    );
  }

  if (!session || !barberProfile) {
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
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* HEADER */}
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

        {/* BOTÓN ACTIVAR NOTIFICACIONES */}
        {permission !== "granted" ? (
          <button
            onClick={requestNotificationPermission}
            className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors animate-bounce shadow-lg shadow-indigo-200"
            title="Activar Notificaciones"
          >
            <BellRing size={20} />
          </button>
        ) : (
          <div className="p-2 text-green-500 bg-green-50 rounded-full">
            <Bell size={20} />
          </div>
        )}
      </header>

      {/* Main Content */}
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

      {/* Navbar */}
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
