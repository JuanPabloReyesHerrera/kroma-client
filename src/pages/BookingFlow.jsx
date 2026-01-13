import React, { useState, useEffect } from "react";
import MyAppointments from "../components/MyAppointments";
import Step1Sedes from "../components/Step1Sedes";
import Step2Category from "../components/Step2Category";
import Step3Service from "../components/Step3Service";
import Step4Barber from "../components/Step4Barber";
import Step5Hour from "../components/Step5Hour";
import Step6Resumen from "../components/Step6Resumen";
import { supabase } from "../supabase/conection";
import { Clock, Loader2, Calendar } from "lucide-react"; // Agregamos Loader2

function BookingFlow() {
  const [dbSedes, setDbSedes] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const [dbBarbers, setDbBarbers] = useState([]);
  const [barberShifts, setBarberShifts] = useState([]);
  const [view, setView] = useState("booking"); // 'booking' o 'my-appointments'`

  // --- NUEVO ESTADO DE CARGA ---
  const [loading, setLoading] = useState(false);

  // 2. Usa useEffect para cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true); // 🟢 ACTIVAMOS CARGA
      try {
        // Pide las sedes a Supabase
        const { data: sedes } = await supabase.from("sedes").select("*");
        if (sedes) setDbSedes(sedes);

        // Pide los servicios a Supabase
        const { data: services } = await supabase.from("services").select("*");
        if (services) setDbServices(services);

        // Pide las barbers a Supabase
        const { data: barbers } = await supabase.from("barbers").select("*");
        if (barbers) setDbBarbers(barbers);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setLoading(false); // 🔴 DESACTIVAMOS CARGA
      }
    };

    cargarDatos();
  }, []);

  // 3. CARGAR TURNOS
  const loadBarberShifts = async (barberId) => {
    console.log("⏳ Cargando turnos para barbero ID:", barberId);
    setLoading(true); // 🟢 ACTIVAMOS CARGA

    try {
      const { data, error } = await supabase
        .from("work_shifts")
        .select("*")
        .eq("barber_id", barberId);

      if (error) {
        console.error("Error cargando turnos:", error);
      } else {
        console.log("✅ Turnos encontrados:", data);
        setBarberShifts(data || []);
      }
    } catch (error) {
      console.error("Error en loadBarberShifts:", error);
    } finally {
      setLoading(false); // 🔴 DESACTIVAMOS CARGA
    }
  };

  console.log("Sedes desde Supabase:", dbSedes);
  console.log("Servicios desde Supabase:", dbServices);
  console.log("Barber desde Supabase:", dbBarbers);

  // --- ESTADO (MEMORIA) ---
  const [step, setStep] = useState(1);
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
    setBooking({ ...booking, sede: sedeSelectioned });
    setStep(2);
  };
  const handleCategorySelect = (categorySelection) => {
    setBooking({ ...booking, categoria: categorySelection });
    setStep(3);
  };

  const handleServiceSelect = (serviceSelection) => {
    setBooking({ ...booking, servicio: serviceSelection });
    setStep(4);
  };

  const handleBarberSelect = (barberSelected) => {
    setBooking({ ...booking, barber: barberSelected });
    // Al ser una promesa, el loading se manejará dentro de la función loadBarberShifts
    loadBarberShifts(barberSelected.id).then(() => {
      setStep(5);
    });
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
    setStep(step - 1);
  };

  console.log("📡 Conexión a Supabase:", supabase);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pb-32 font-sans relative">
      {/* --- NUEVO: PANTALLA DE CARGA (OVERLAY) --- */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-600 font-bold text-sm">Cargando...</p>
          </div>
        </div>
      )}

      {/* Header Simple */}
      <div className="w-full max-w-md mt-4 mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Reserva tu Cita</h1>
        <p className="text-slate-500 text-sm">ꓘROMA</p>
      </div>

      {/* Contenedor Principal (La "Caja Blanca") */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border border-slate-100 relative z-10">
        {view === "my-appointments" ? (
          <MyAppointments onBack={() => setView("booking")} />
        ) : (
          <>
            {step === 1 && (
              <Step1Sedes sedes={dbSedes} onSelect={handleSedeSelect} />
            )}
            {step === 1 && (
              <div className="my-6 border-t border-slate-200 items-center flex flex-col">
                <h3 className="text-slate-700 font-bold mb-4 items-center flex justify-center gap-2 mt-6">
                  ¿Ya tienes una cita?
                </h3>
                <button
                  onClick={() => setView("my-appointments")}
                  className="w-full max-w-80 mb-6 py-5 mt-5 bg-indigo-50 hover:bg-indigo-500 hover:text-white text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-indigo-200"
                >
                  <Calendar size={18} />
                  Ver mis reservas existentes
                </button>
              </div>
            )}

            {step === 2 && (
              <Step2Category
                onSelect={handleCategorySelect}
                onBack={handleBack}
              />
            )}

            {step === 3 && (
              <Step3Service
                onSelect={handleServiceSelect}
                onBack={handleBack}
                servicesList={dbServices.filter(
                  (serv) => serv.categoria === booking.categoria
                )}
              />
            )}

            {step === 4 && (
              <Step4Barber
                onSelect={handleBarberSelect}
                onBack={handleBack}
                barbers={dbBarbers.filter(
                  (barber) =>
                    barber.sede_id === booking.sede?.id &&
                    barber.categoria?.includes(booking.categoria)
                )}
                category={booking.categoria}
              ></Step4Barber>
            )}

            {step === 5 && (
              <Step5Hour
                onSelectDate={handleHourSelect}
                onBack={handleBack}
                barberShifts={barberShifts}
                barberId={booking.barber?.id}
                serviceDuration={booking.servicio?.duracion_min}
              ></Step5Hour>
            )}

            {step === 6 && (
              <Step6Resumen
                booking={booking}
                onBack={handleBack}
              ></Step6Resumen>
            )}
          </>
        )}
      </div>

      {/* Info Flotante */}
      <div className="fixed bottom-6 w-full max-w-md left-0 right-0 mx-auto px-4 pointer-events-none z-50">
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl flex justify-between items-center pointer-events-auto shadow-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p>
                <span className="font-bold">Estado del Local:</span>
                <span className="font-bold text-indigo-400">
                  {" "}
                  Abierto {" " /* Indicador animado de abierto */}
                  <span className="relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </span>
              </p>

              <p className=" text-[10px]">
                <span className="opacity-70">Lun a Sab: </span>
                <span className="font-bold text-indigo-400">8am-9pm</span>
                <span className="font-bold">, </span>
                <span className="opacity-70">Dom: </span>
                <span className="font-bold text-indigo-400">10am-4pm </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-indigo-400">
              Ubicación
            </p>
            <p className="text-xs font-medium">Trinidad, Bolivia</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFlow;
