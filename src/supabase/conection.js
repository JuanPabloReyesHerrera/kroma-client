import { createClient } from "@supabase/supabase-js";

const projectUrl = import.meta.env?.VITE_SUPABASE_URL || "";
const projectKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

if (!projectUrl || !projectKey) {
  console.warn("⚠️ Faltan las credenciales de Supabase.");
}

export const supabase = createClient(
  projectUrl || "https://placeholder.supabase.co",
  projectKey || "placeholder",
);
