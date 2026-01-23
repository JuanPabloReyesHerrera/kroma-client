// --- SUPABASE EDGE FUNCTION PARA ONESIGNAL ---
// Esta función se ejecuta en los servidores de Supabase.
// Recibe los datos de la nueva cita y le dice a OneSignal que envíe la notificación.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Obtenemos las claves secretas que configuraste en Supabase (secrets set)
const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID") || "";
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY") || "";

serve(async (req) => {
  try {
    // 1. Recibir los datos del Webhook de la base de datos (Supabase)
    const payload = await req.json();

    // payload.record contiene la fila exacta que se acabó de crear en la tabla 'appointments'
    const appointment = payload.record;

    // Validamos que existan las claves
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error(
        "Faltan las claves de OneSignal en las variables de entorno",
      );
    }

    console.log("🔔 Procesando notificación para cita ID:", appointment.id);

    // 2. Construir el mensaje para OneSignal
    // Documentación: https://documentation.onesignal.com/reference/create-notification
    const message = {
      app_id: ONESIGNAL_APP_ID,

      // "Subscribed Users" envía a todos los dispositivos registrados en la app.
      // Para hacerlo más específico (solo al barbero dueño de la cita),
      // necesitaríamos lógica adicional, pero para la demo "Todos" funciona perfecto.
      included_segments: ["Subscribed Users"],

      contents: {
        en: `New appointment at ${appointment.hora_inicio.slice(0, 5)}`,
        es: `✂️ Nueva cita agendada a las ${appointment.hora_inicio.slice(0, 5)}`,
      },
      headings: {
        en: "New Reservation",
        es: "¡Nueva Reserva Recibida!",
      },

      // Datos extra para que la app sepa qué abrir si tocan la notificación
      data: {
        appointment_id: appointment.id,
        barber_id: appointment.barber_id,
      },

      // Configuración de Android para prioridad alta (Head-up notification)
      android_channel_id: "kroma_channel_citas",
      priority: 10,
      android_accent_color: "4F46E5", // Color Índigo de tu marca
      small_icon: "ic_stat_onesignal_default",
    };

    // 3. Enviar la petición a OneSignal (API REST)
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
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
});
