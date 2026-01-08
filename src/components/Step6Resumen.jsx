import React, { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  Scissors,
  CalendarIcon,
  User,
  UserIcon,
  Phone,
} from "lucide-react";

const Step6Resumen = ({ booking, onBack }) => {
  // --- ESTADOS DEL FORMULARIO DE CLIENTE ---
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    comment: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para efecto de carga

  // Manejador de inputs genérico
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };
  // --- FUNCIÓN FINAL: CONFIRMAR RESERVA ---
  const handleFinalConfirm = () => {
    setIsSubmitting(true);

    // 1. Preparamos el PAQUETE FINAL para la Base de Datos
    const finalReservation = {
      // Datos de la Cita
      reservationDetails: {
        sedeId: booking.sede.id,
        sedeNombre: booking.sede.nombre,
        servicioId: booking.servicio.id,
        servicioNombre: booking.servicio.nombre,
        precio: booking.servicio.precio,
        barberoId: booking.barber.id,
        barberoNombre: booking.barber.name,
        fecha: booking.date.id, // YYYY-MM-DD
        hora: booking.hour,
      },
      // Datos del Cliente (Lo nuevo)
      client: {
        name: clientData.name,
        phone: clientData.phone, // Este será su ID único
        comment: clientData.comment,
      },
      // Metadatos
      status: "pending", // confirmada, cancelada, completada
      createdAt: new Date().toISOString(),
    };

    // --- AQUÍ CONECTAREMOS CON EL BACKEND (FIREBASE) LUEGO ---
    console.log("🚀 ENVIANDO A BASE DE DATOS:", finalReservation);

    // Simulación de espera (2 segundos)
    setTimeout(() => {
      alert(
        `¡Cita Confirmada para ${clientData.name}!\nTe llegará un WhatsApp al ${clientData.phone}`
      );
      setIsSubmitting(false);
      // Aquí podrías redirigir al inicio o mostrar pantalla de éxito
    }, 2000);
  };

  // Validación simple: Nombre + Telefono + Terminos
  const isValid =
    clientData.name.length > 2 && clientData.phone.length > 7 && acceptedTerms;
  return (
    <div>
      {/* Botton VOLVER */}
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
              {booking.servicio?.precio}
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
            Con {booking.barber?.name}
          </span>
        </div>
      </div>
      {/* 2. FORMULARIO DE REGISTRO */}
      <div className="space-y-4">
        {/* Input Nombre */}
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
        {/* Input Numero */}
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
        {/* Comentario Opcional, CheckBox Y Confirmar */}
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
          {/* Checkbox Legal */}
          <label className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
            <span className="text-xs text-slate-500 leading-tight">
              Acepto recibir recordatorios de mi cita y promociones exclusivas
              de KROMA al WhatsApp proporcionado.
            </span>
          </label>
          {/* 3. BOTÓN FINAL */}
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
              {isSubmitting ? <>Agendando...</> : <>Finalizar Reserva</>}
            </button>

            <button
              onClick={onBack}
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
