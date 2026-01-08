import React, { useState, useEffect } from "react";
import { sedes, servicios } from "./data/db"; // 1. Importamos las sedes de db.js
import Step1Sedes from "./components/Step1Sedes"; // 2. Importamos el componente visual
import Step2Category from "./components/Step2Category";
import Step3Service from "./components/Step3Service";
import Step4Barber from "./components/Step4Barber";
import Step5Hour from "./components/Step5Hour";
import Step6Resumen from "./components/Step6Resumen";

function App() {
  // --- ESTADO (MEMORIA) ---
  // Aquí guardaremos qué paso estamos viendo (1, 2, 3...)
  const [step, setStep] = useState(1);

  // Aquí guardaremos las elecciones del usuario
  const [booking, setBooking] = useState({
    sede: null,
    categoria: null,
    servicio: null,
    barber: null,
    date: null,
    hour: null,
  });
  useEffect(() => {
    console.log("Estado actualizado:", booking);
  }, [booking]);

  // --- FUNCIONES (LÓGICA) ---
  const handleSedeSelect = (sedeSelectioned) => {
    // 1. Guardamos la sede en la "memoria"
    setBooking({ ...booking, sede: sedeSelectioned });
    setStep(2);
  };
  const handleCategorySelect = (categorySelection) => {
    // 1. Guardamos hombre o mujer
    setBooking({ ...booking, categoria: categorySelection });
    setStep(3);
  };

  const handleServiceSelect = (serviceSelection) => {
    setBooking({ ...booking, servicio: serviceSelection });
    setStep(4);
  };

  const handleBarberSelect = (barberSlection) => {
    setBooking({ ...booking, barber: barberSlection });
    setStep(5);
  };

  const handleHourSelect = (hourSelection) => {
    setBooking({
      ...booking,
      hour: hourSelection.hour,
      date: hourSelection.date,
    });
    setStep(6);
  };

  const handleBack = () => {
    // Si estamos en el paso 2, volvemos al 1
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
      {/* Header Simple */}
      <div className="w-full max-w-md mt-4 mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Reserva tu Cita</h1>
        <p className="text-slate-500 text-sm">ꓘROMA</p>
      </div>

      {/* Contenedor Principal (La "Caja Blanca") */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
        {/* CONDICIONAL: Si el paso es 1, muestra el componente de Sedes */}
        {step === 1 && <Step1Sedes sedes={sedes} onSelect={handleSedeSelect} />}

        {/* Mensaje temporal para cuando avancemos */}
        {step === 2 && (
          <Step2Category onSelect={handleCategorySelect} onBack={handleBack} />
        )}
        {step === 3 && (
          <Step3Service
            onSelect={handleServiceSelect}
            onBack={handleBack}
            category={booking.categoria}
          />
        )}
        {step === 4 && (
          <Step4Barber
            onSelect={handleBarberSelect}
            onBack={handleBack}
            categoria={booking.categoria}
            sede={booking.sede}
          ></Step4Barber>
        )}
        {step === 5 && (
          <Step5Hour
            onSelectDate={handleHourSelect}
            onBack={handleBack}
          ></Step5Hour>
        )}
        {step === 6 && (
          <Step6Resumen booking={booking} onBack={handleBack}></Step6Resumen>
        )}
      </div>
    </div>
  );
}

export default App;
