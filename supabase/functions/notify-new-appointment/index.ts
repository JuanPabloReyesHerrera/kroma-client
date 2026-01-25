// --- SUPABASE EDGE FUNCTION PARA ONESIGNAL ---
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY') || '';

serve(async (req) => {
  try {
    // 1. Verificación de credenciales
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error("❌ ERROR: Faltan variables de entorno ONESIGNAL_APP_ID o ONESIGNAL_REST_API_KEY");
      return new Response("Missing Keys", { status: 500 });
    }

    const payload = await req.json();
    console.log("📦 Payload recibido de Supabase:", JSON.stringify(payload));

    // El registro insertado viene en payload.record
    const appointment = payload.record;
    
    if (!appointment) {
      console.error("❌ ERROR: No se encontró el registro de la cita en el payload");
      return new Response("No record found", { status: 400 });
    }

    // 2. Construcción del mensaje para OneSignal optimizado para Background
    const message = {
      app_id: ONESIGNAL_APP_ID,
      // Usamos "All Subscribed Users" para la fase de pruebas
      included_segments: ["All Subscribed Users"], 
      
      headings: {
        en: "New Appointment!",
        es: "¡Nueva Cita Agendada! ✂️"
      },
      contents: { 
        en: `Time: ${appointment.hora_inicio.slice(0, 5)}`,
        es: `Hora: ${appointment.hora_inicio.slice(0, 5)} - Toca para ver detalles.`
      },
      
      // Metadata importante para el manejo interno
      data: {
        appointment_id: appointment.id,
        type: "new_appointment"
      },

      // URL a abrir (Vital para PWAs en iOS)
      web_url: "https://tu-dominio.vercel.app/admin",

      // CONFIGURACIÓN DE ENTREGA DE ALTA PRIORIDAD
      priority: 10, // 10 = High Priority (Despierta dispositivos en reposo)
      
      // ESPECIFICACIONES PARA IOS (WEB PUSH / PWA)
      target_channel: "push",
      ios_sound: "default",
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
      // 'content_available': true ayuda a despertar el service worker en segundo plano
      content_available: true,

      // ESPECIFICACIONES PARA ANDROID
      android_channel_id: "kroma_channel_citas",
      android_accent_color: "4F46E5",
      android_visibility: 1, // 1 = Public (Visible en pantalla de bloqueo)
      
      // Evitar que se acumulen múltiples alertas de la misma cita
      collapse_id: `appt_${appointment.id}`
    };

    console.log("🚀 Enviando petición a la API de OneSignal...");

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("✅ Respuesta de OneSignal:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN EDGE FUNCTION:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
})