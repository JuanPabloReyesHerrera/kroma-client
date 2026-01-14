import React, { useState } from "react";
import { supabase } from "../supabase/conection";
import {
  ChevronLeft,
  MapPin,
  Scissors,
  CalendarIcon,
  User,
  UserIcon,
  Phone,
  Loader2,
} from "lucide-react";

const Step6Resumen = ({ booking, onBack }) => {
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    comment: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  // Función para poner "Juan Pablo" bonito (Capitalizar)
  const formatName = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);

    try {
      // 1. LIMPIEZA DE DATOS
      const cleanName = formatName(clientData.name);
      const cleanPhone = clientData.phone.replace(/\D/g, ""); // Solo números

      // 2. GESTIÓN DE CLIENTE (UPSERT)
      // Buscamos o creamos al cliente en la tabla 'clients'
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .upsert(
          { nombre: cleanName, telefono: cleanPhone },
          { onConflict: "telefono" } // La clave es el teléfono
        )
        .select()
        .single();

      if (clientError) throw new Error(`Error cliente: ${clientError.message}`);

      // 3. PREPARAR CITA
      // Solo usamos las columnas que existen en tu base de datos SQL
      const appointmentToSave = {
        client_id: client.id, // EL VÍNCULO IMPORTANTE
        barber_id: booking.barber.id,
        sede_id: booking.sede.id,
        service_id: booking.servicio.id,

        // Snapshots (Datos congelados)
        price_snapshot: booking.servicio.precio_actual,
        service_name_snapshot: booking.servicio.nombre,

        // Tiempo
        fecha: booking.date, // Debe ser YYYY-MM-DD
        hora_inicio: booking.hour,

        status: "pending",
        comentario_cliente: clientData.comment, // Tu comentario opcional
      };

      console.log("🚀 Enviando a Supabase:", appointmentToSave);

      const { error: apptError } = await supabase
        .from("appointments")
        .insert([appointmentToSave]);

      if (apptError) throw new Error(`Error cita: ${apptError.message}`);

      // ÉXITO
      alert(`¡Reserva confirmada! Gracias ${cleanName}.`);
      window.location.reload();
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Hubo un problema: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    clientData.name.length > 2 && clientData.phone.length > 7 && acceptedTerms;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500"
      >
        <ChevronLeft size={20} /> Volver
      </button>

      <h3 className="text-xl font-bold flex gap-2 my-2">Finaliza tu reserva</h3>

      {/* Resumen de la reserva */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Tu selección
        </p>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-700">
            {booking.sede?.nombre}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Scissors className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-700">
            {booking.servicio?.nombre} —{" "}
            <span className="text-indigo-600 font-bold">
              {booking.servicio?.precio_actual} Bs
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CalendarIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-700">
            {booking?.date} a las {booking?.hour}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-700">
            Con {booking.barber?.nombre}
          </span>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Tu Nombre Completo
          </label>
          <div className="relative">
            <UserIcon
              className="absolute left-3 top-3 text-slate-400"
              size={20}
            />
            <input
              type="text"
              name="name"
              value={clientData.name}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez Suarez"
              className="w-full pl-10 p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Número de WhatsApp
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="number"
              name="phone"
              value={clientData.phone}
              onChange={handleInputChange}
              placeholder="Ej: 70012345"
              className="w-full pl-10 p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 ml-1">
            Sin código de país, solo el número.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            ¿Algún pedido especial? (Opcional)
          </label>
          <textarea
            name="comment"
            value={clientData.comment}
            onChange={handleInputChange}
            rows="2"
            placeholder="Ej: Tengo el cabello muy largo..."
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
          />

          <label className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors mt-2">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
            <span className="text-xs text-slate-500 leading-tight">
              Acepto recibir recordatorios de mi cita y promociones exclusivas.
            </span>
          </label>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleFinalConfirm}
              disabled={!isValid || isSubmitting}
              className={`
                w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex justify-center items-center gap-2
                ${
                  !isValid || isSubmitting
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]"
                }
            `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Procesando...
                </>
              ) : (
                <>Finalizar Reserva</>
              )}
            </button>

            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full text-slate-400 py-2 text-sm hover:text-indigo-600"
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Resumen;
