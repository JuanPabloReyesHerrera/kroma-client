// --- SUPABASE EDGE FUNCTION PARA ONESIGNAL (IOS & ANDROID) ---
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY') || '';

serve(async (req) => {
  try {
    const payload = await req.json();
    const appointment = payload.record;
    
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error("Faltan las claves de OneSignal");
    }

    console.log("🔔 Procesando notificación para cita ID:", appointment.id);

    const message = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"], 
      
      // 1. CONTENIDO
      contents: { 
        en: `New appointment at ${appointment.hora_inicio.slice(0, 5)}`,
        es: `✂️ Nueva cita a las ${appointment.hora_inicio.slice(0, 5)}`
      },
      headings: {
        en: "New Reservation",
        es: "¡Nueva Reserva Recibida!"
      },
      
      // 2. DATOS (Para que al tocar abra la cita específica)
      data: {
        appointment_id: appointment.id,
        barber_id: appointment.barber_id,
        url: "/admin" // Forzar apertura en admin
      },

      // --- 3. CONFIGURACIÓN ANDROID ---
      android_channel_id: "kroma_channel_citas", 
      priority: 10,
      android_accent_color: "4F46E5",
      small_icon: "ic_stat_onesignal_default",
      android_group: "citas_nuevas", // Agrupa notificaciones para no llenar la barra

      // --- 4. CONFIGURACIÓN IOS (AGREGADO) ---
      // 'target_channel': Asegura que sea Push y no Email/SMS
      target_channel: "push",
      
      // 'ios_sound': CRÍTICO. Si no lo pones, llega en silencio.
      ios_sound: "default", 
      
      // 'ios_badgeType': Incrementa el numerito rojo en el icono de la app
      ios_badgeType: "Increase",
      ios_badgeCount: 1,

      // 'collapse_id': Si actualizas la misma cita, reemplaza la notificación anterior
      // en vez de apilar basura.
      collapse_id: `cita_${appointment.id}` 
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("✅ Respuesta OneSignal:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Error enviando notificación:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
})