import React, { useState, useEffect } from "react";
import { ChevronLeft, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "../supabase/conection";

const Step5Hour = ({
  onBack,
  onSelectDate,
  barberShifts = [],
  barberId,
  serviceDuration,
}) => {
  // Estado original
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  // Estados nuevos para la lógica dinámica
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);

  // --- 1. GENERADOR DE DÍAS (Tu función original + dayOfWeek) ---
  const getDatesAvailables = () => {
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        label:
          i === 0
            ? "HOY"
            : i === 1
            ? "MAÑANA"
            : d.toLocaleDateString("es-BO", { weekday: "short" }),
        day: d.getDate(),
        full: d.toLocaleDateString("es-BO", { day: "numeric", month: "long" }),
        id: d.toISOString().split("T")[0], // YYYY-MM-DD
        dayOfWeek: d.getDay(), // 0=Domingo, 1=Lunes... (Necesario para buscar el turno)
      });
    }
    return dates;
  };

  const availablesDates = getDatesAvailables();

  // --- 2. EFECTO: BUSCAR CITAS OCUPADAS ---
  useEffect(() => {
    if (selectedDate) {
      // Si elegiste un día, vamos a ver qué horas están ocupadas
      const fetchOccupied = async () => {
        setLoadingHours(true);
        try {
          const { data } = await supabase
            .from("appointments")
            .select("hora_inicio")
            .eq("barber_id", barberId)
            .eq("fecha", selectedDate.id) // Usamos el ID YYYY-MM-DD
            .neq("status", "cancelled"); // Ignoramos canceladas

          // Guardamos las horas ocupadas: ['09:00', '10:00']
          const times = data
            ? data.map((appt) => appt.hora_inicio.slice(0, 5))
            : [];
          setOccupiedSlots(times);
        } catch (error) {
          console.error("Error cargando citas:", error);
        } finally {
          setLoadingHours(false);
        }
      };

      fetchOccupied();
      setSelectedHour(null); // Limpiamos la hora seleccionada anterior
    }
  }, [selectedDate, barberId]);

  // --- 3. LÓGICA MATEMÁTICA (Calculadora de Horarios) ---
  const getDynamicHours = () => {
    if (!selectedDate) return [];

    // A. Buscamos el turno del barbero para este día de la semana
    const shift = barberShifts.find(
      (s) => s.dia_semana === selectedDate.dayOfWeek
    );

    // Si no trabaja hoy (no hay turno), devolvemos lista vacía
    if (!shift) return [];

    const slots = [];

    // Convertimos horas a minutos para poder sumar
    const timeToMinutes = (str) => {
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    };
    const minutesToTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    };

    let currentMins = timeToMinutes(shift.hora_inicio);
    const endMins = timeToMinutes(shift.hora_fin);
    // Duración del servicio (si no llega, asumimos 45 min)
    const duration = serviceDuration || 45;

    // B. Bucle: Generar huecos
    while (currentMins + duration <= endMins) {
      const timeString = minutesToTime(currentMins);

      // Filtro 1: ¿Ya está reservado?
      const isOccupied = occupiedSlots.includes(timeString);

      // Filtro 2: ¿Ya pasó la hora? (Solo para HOY)
      let isPast = false;
      if (selectedDate.label === "HOY") {
        const now = new Date();
        const [h, m] = timeString.split(":");
        const slotTime = new Date();
        slotTime.setHours(h, m, 0);
        if (slotTime < now) isPast = true;
      }

      if (!isOccupied && !isPast) {
        slots.push(timeString);
      }

      currentMins += duration;
    }

    return slots;
  };

  // Reemplazamos tu array estático con la función dinámica
  const availableHours = getDynamicHours();

  const handleConfirm = () => {
    if (selectedDate && selectedHour) {
      const bookingData = {
        date: selectedDate.id, // IMPORTANTE: Usamos .id (YYYY-MM-DD) para la base de datos
        displayDate: selectedDate.full, // Guardamos el nombre bonito por si acaso
        hour: selectedHour,
      };
      return onSelectDate(bookingData);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500"
      >
        <ChevronLeft size={20} /> Volver
      </button>
      <h3 className="text-xl font-bold flex gap-2 my-2">
        <Calendar className="text-indigo-500 font-bold" />
        ¿Cuándo vienes?
      </h3>
      <p className="text-xs text-slate-500 pb-2 ">
        Duración estimada: {serviceDuration || 45} min
      </p>

      {/* CARRUSEL DE DÍAS */}
      <div className="flex overflow-x-auto pb-4 no-scrollbar gap-2">
        {availablesDates.map((date) => (
          <button
            key={date.id}
            onClick={() => {
              setSelectedDate(date);
              setSelectedHour(null);
            }}
            className={`border flex-shrink-0 w-20 py-4 rounded-xl flex flex-col items-center transition-colors ${
              selectedDate?.id === date.id
                ? "bg-indigo-600 text-white"
                : "border-slate-200 bg-slate-100 hover:border-indigo-500 hover:bg-indigo-100"
            }`}
          >
            <span
              className={`text-[10px] font-bold ${
                selectedDate?.id === date.id ? "text-white" : "opacity-60"
              }`}
            >
              {date.label.replace(".", "").toLocaleUpperCase()}
            </span>
            <span
              className={`text-2xl font-bold ${
                selectedDate?.id === date.id ? "text-white" : "opacity-60"
              }`}
            >
              {date.day}
            </span>
          </button>
        ))}
      </div>

      {/* GRILLA DE HORAS */}
      {selectedDate && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold opacity-50 uppercase">{`HORARIOS DISPONIBLES (${selectedDate.full})`}</h3>
            {loadingHours && (
              <span className="text-xs text-indigo-500 animate-pulse">
                Cargando...
              </span>
            )}
          </div>

          {availableHours.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableHours.map((hour) => (
                <button
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`rounded-md p-3 hover:bg-indigo-200 hover:border-indigo-500 transition-all ${
                    hour === selectedHour
                      ? "border-2 border-indigo-500 shadow-2xl bg-indigo-600 text-white transform scale-105"
                      : "bg-slate-100 border border-slate-300 shadow-sm"
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <AlertCircle className="mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-sm text-slate-500">
                No hay horarios disponibles.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleConfirm}
          disabled={!selectedHour}
          className={`
            w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all
            flex items-center justify-center gap-2
            ${
              !selectedHour
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]"
            }
            `}
        >
          Confirmar Cita
        </button>
      </div>
    </div>
  );
};

export default Step5Hour;
