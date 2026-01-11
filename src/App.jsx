import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importamos la página de citas
import BookingFlow from "./pages/BookingFlow";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Prueba A: La raíz */}
        <Route path="/" element={<BookingFlow />} />

        {/* Prueba B: El admin con un estilo muy obvio */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Prueba C: Cualquier otra cosa */}
        <Route path="*" element={<h1>ERROR 404 - NO ENCONTRADO</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
