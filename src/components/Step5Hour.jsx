import React, { useEffect } from "react";
import { ChevronLeft, Calendar } from "lucide-react";
import { useState } from "react";

const Step5Hour = ({ onBack, onSelectDate }) => {
  const availableHours = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
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
            : d.toLocaleDateString("es-BO", { weekday: "short" }), // HOY, MAÑANA, o el dia de la semana
        day: d.getDate(), //La fecha del dia exacto
        full: d.toLocaleDateString("es-BO", { day: "numeric", month: "long" }), //"5 de enero"
        id: d.toISOString().split("T")[0], //Separa en dos string de fecha y hora, y deja solo la hora
      });
    }
    return dates;
  };
  const availablesDates = getDatesAvailables();
  useEffect(() => {
    console.log(onSelectDate);
  });
  const handleConfirm = () => {
    // Solo enviamos si ambos datos existen (Doble seguridad)
    if (selectedDate && selectedHour) {
      // Empaquetamos todo en un objeto limpio
      const bookingData = {
        date: selectedDate.full, // Tu objeto con full, day, etc.
        hour: selectedHour,
      };

      // Enviamos el paquete al padre (App.jsx)
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
        Horarios disponibles para hoy
      </p>
      <div className="flex overflow-x-auto pb-4 no-scrollbar gap-2">
        {
          //Boton de selección de DIA de la semana
          availablesDates.map((date) => (
            <button
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
                {
                  date.label
                    .replace(".", "")
                    .toLocaleUpperCase() /**HOY-MAÑANA-LUN-MAR-MIE */
                }
              </span>
              <span
                className={`text-2xl font-bold ${
                  selectedDate?.id === date.id ? "text-white" : "opacity-60"
                }`}
              >
                {date.day /**Dia 7-8-9-10-11 */}
              </span>
            </button>
          ))
        }
      </div>
      {selectedDate && (
        <div>
          <h3 className="text-xs font-bold opacity-50 uppercase">{`HORARIOS DISPONIBLES PARA EL ${selectedDate.full}`}</h3>
          <div className="grid grid-cols-3 gap-3">
            {availableHours.map((hour) => (
              <button
                onClick={() => {
                  setSelectedHour(hour);
                }}
                className={`rounded-md p-5 hover:bg-indigo-200 hover:border-indigo-500 ${
                  hour === selectedHour
                    ? "border-2 border-indigo-500 shadow-2xl bg-indigo-600 text-white"
                    : "bg-slate-100 border border-slate-300 shadow-md"
                }`}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleConfirm}
          // LÓGICA: ¿Está deshabilitado? Si NO hay hora seleccionada.
          disabled={!selectedHour}
          className={`
      w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all
      flex items-center justify-center gap-2
      ${
        !selectedHour
          ? "bg-slate-300 cursor-not-allowed" // Estilo Desactivado
          : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]" // Estilo Activo
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
