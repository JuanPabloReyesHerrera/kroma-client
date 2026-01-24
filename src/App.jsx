import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase/conection";

// Importamos tus páginas
import BookingFlow from "./pages/BookingFlow";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    // Spinner simple mientras Supabase revisa si eres barbero o cliente
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
           Aquí está el truco. 
           - Si hay sesión (es barbero) -> Lo mandamos directo a /admin
           - Si no hay sesión (es cliente) -> Ve la Agenda
        */}
        <Route
          path="/"
          element={session ? <Navigate to="/admin" replace /> : <BookingFlow />}
        />

        {/* RUTA ADMIN (/admin):
           - Muestra el Panel.
           - El propio componente AdminPanel ya maneja su Login interno si no hay sesión.
        */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Manejo de errores 404 */}
        <Route
          path="*"
          element={<div className="p-10 text-center">Página no encontrada</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
