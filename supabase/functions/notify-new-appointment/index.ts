// --- SUPABASE EDGE FUNCTION PARA ONESIGNAL (CORRECCIÓN DE CANAL) ---
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY') || '';

serve(async (req) => {
  try {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error("❌ ERROR: Faltan variables de entorno");
      return new Response("Missing Keys", { status: 500 });
    }

    const payload = await req.json();
    const appointment = payload.record;
    
    if (!appointment) {
      return new Response("No record found", { status: 400 });
    }

    // Construcción del mensaje simplificada para evitar errores de validación
    const message = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["Total Subscriptions"], 
      
      headings: {
        en: "New Appointment! ✂️",
        es: "¡Nueva Cita Agendada! ✂️"
      },
      contents: { 
        en: `Service: ${appointment.service_name_snapshot || 'Appointment'} at ${appointment.hora_inicio?.slice(0, 5) || ''}`,
        es: `Cliente: ${appointment.service_name_snapshot || 'Cita'} a las ${appointment.hora_inicio?.slice(0, 5) || ''}`
      },
      
      data: {
        appointment_id: appointment.id,
        type: "new_appointment"
      },

      // URL para PWA
      web_url: "https://kroma-client.vercel.app/",

      // ALTA PRIORIDAD
      priority: 10,
      
      // CONFIGURACIÓN IOS (WEB PUSH)
      target_channel: "push",
      ios_sound: "default",
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
      content_available: true,

      // CONFIGURACIÓN ANDROID (SIMPLIFICADA)
      // Eliminamos 'android_channel_id' para que OneSignal use el canal "Restaurado/Default"
      // y no rechace la petición si el canal no existe en el dashboard.
      android_accent_color: "4F46E5",
      android_visibility: 1
    };

    console.log("🚀 Enviando a OneSignal sin restricciones de canal...");

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("✅ Respuesta final de OneSignal:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})