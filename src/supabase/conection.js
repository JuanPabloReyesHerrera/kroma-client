import { createClient } from "@supabase/supabase-js";

// Usamos cadenas vacías '' como respaldo por si las variables fallan
const projectUrl = import.meta.env.VITE_SUPABASE_URL || "";
const projectKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Si las variables están vacías, esto lanzará un error claro en consola en lugar de un error raro de importación
if (!projectUrl || !projectKey) {
  console.error("🚨 ERROR CRÍTICO: Faltan las variables de entorno en .env");
}

export const supabase = createClient(projectUrl, projectKey);
