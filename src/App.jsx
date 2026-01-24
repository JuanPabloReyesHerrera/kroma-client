import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase/conection";

// Importamos tus páginas
import BookingFlow from "./pages/BookingFlow";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para la "Puerta Trasera" (Secret Door)
  const [secretClicks, setSecretClicks] = useState(0);

  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios (Login / Logout) en tiempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LÓGICA DE LA PUERTA SECRETA ---
  // Si tocas 5 veces rápido el texto de versión, te lleva al admin.
  useEffect(() => {
    let timer;
    if (secretClicks > 0) {
      if (secretClicks >= 5) {
        // ¡SÉSAMO ÁBRETE!
        // Usamos window.location para forzar la navegación al admin
        window.location.href = "/admin";
        setSecretClicks(0);
      } else {
        // Si dejas de tocar por 1 segundo, el contador se reinicia
        timer = setTimeout(() => setSecretClicks(0), 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [secretClicks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-indigo-600 font-bold animate-pulse">
        Cargando Kroma...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA RAÍZ (/):
           - Si es Barbero (tiene sesión) -> Va DIRECTO al AdminPanel.
           - Si es Cliente (no sesión) -> Ve el BookingFlow (Citas).
        */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate to="/admin" replace />
            ) : (
              <div className="relative min-h-screen">
                {/* Renderizamos el flujo de citas */}
                <BookingFlow />

                {/* PIE DE PÁGINA INVISIBLE (SOLUCIÓN IOS):
                   Ya no hay enlace visible. El barbero debe tocar 5 veces
                   el texto de la versión para entrar.
                */}
                <div className="py-8 text-center bg-slate-50 border-t border-slate-100 select-none">
                  <p
                    onClick={() => setSecretClicks((prev) => prev + 1)}
                    className="text-[9px] text-slate-300 mt-1 cursor-default active:text-slate-400 transition-colors inline-block px-4 py-2"
                  >
                    Kroma Tech v1.0
                  </p>
                </div>
              </div>
            )
          }
        />

        {/* RUTA ADMIN (/admin) */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Error 404 */}
        <Route
          path="*"
          element={<div className="p-10 text-center">Página no encontrada</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
