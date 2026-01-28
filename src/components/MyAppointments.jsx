import React, { useState } from "react";
import { supabase } from "../supabase/conection";
import {
  ChevronLeft,
  Search,
  Calendar,
  Clock,
  MapPin,
  Scissors,
} from "lucide-react";

const MyAppointments = ({ onBack }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState(null); // null = no se ha buscado, [] = buscó y no halló nada
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (phone.length < 8) return;

    setLoading(true);
    setSearched(false);

    try {
      // 1. Primero buscamos el ID del cliente basado en el teléfono
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, nombre") // Seleccionamos el ID y nombre del cliente
        .eq("telefono", phone) // Filtramos por el número de teléfono
        .single(); // Esperamos un solo resultado

      if (clientError || !clientData) {
        setAppointments([]); // No existe el cliente
        setSearched(true); // Indicamos que ya se realizó una búsqueda
        setLoading(false); // Desactivamos el loading
        return;
      }

      // 2. Buscamos las citas PENDIENTES o CONFIRMADAS de ese cliente
      // Filtramos para que solo salgan las de HOY en adelante (no las viejas)
      const today = new Date().toISOString().split("T")[0];

      const { data: apptData, error: apptError } = await supabase
        .from("appointments")
        .select(
          `
            *,
            sedes ( nombre ), 
            barbers ( nombre )
        `,
        )
        .eq("client_id", clientData.id) // Filtrar por ID de cliente
        .in("status", ["pending", "confirmed"]) // Solo pendientes o confirmadas
        .neq("status", "cancelled") // Excluir canceladas
        .gte("fecha", today) // Mayor o igual a hoy
        .order("fecha", { ascending: true }) // Ordenar por fecha ascendente
        .order("hora_inicio", { ascending: true }); // Ordenar por hora ascendente

      if (apptData) {
        setAppointments(apptData); // Guardar las citas encontradas
      } else {
        setAppointments([]); // No hay citas
      }
    } catch (err) {
      console.error(err); // En caso de error, asumimos que no hay citas
      setAppointments([]); // No hay citas
    } finally {
      setLoading(false); // Siempre desactivamos el loading
      setSearched(true); // Indicamos que ya se realizó una búsqueda
    }
  };
  const handleCancel = async (appointmentId) => {
    // Lógica para cancelar la cita con el ID proporcionado
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) {
      alert("Error al cancelar la cita. Por favor, intenta de nuevo.");
    } else {
      // Actualizar la lista de citas en el estado
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appt) => appt.id !== appointmentId),
      );
      alert("Cita cancelada exitosamente.");
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500 mb-6"
      >
        <ChevronLeft size={20} /> Volver al inicio
      </button>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">Mis Reservas</h2>
      <p className="text-slate-500 text-sm mb-6">
        Ingresa tu número de celular para ver tus próximas citas.
      </p>

      {/* BUSCADOR */}
      <form onSubmit={handleSearch} className="mb-8">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">
          Número de Celular
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 70012345"
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-lg"
          />
          <button
            type="submit"
            disabled={loading || phone.length < 5}
            className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="animate-spin block">↻</span>
            ) : (
              <Search />
            )}
          </button>
        </div>
      </form>

      {/* RESULTADOS */}
      {searched && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">
                No encontramos reservas activas.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Verifica tu número o crea una nueva reserva.
              </p>
            </div>
          ) : (
            appointments
              .filter((appt) => appt.status !== "cancelled")
              .map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white border border-l-4 border-l-indigo-600 border-slate-100 p-5 rounded-2xl shadow-sm"
                >
                  {/* Encabezado con nombre del servicio, precio y estado */}
                  <div className="flex justify-between items-start mb-3">
                    {/* Nombre del servicio y precio */}
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {appt.service_name_snapshot}
                      </h3>
                      <p className="text-indigo-600 font-bold text-sm">
                        {appt.price_snapshot} BOB
                      </p>
                    </div>
                    {/*Estado de la cita*/}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                        appt.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {appt.status === "pending" ? "Pendiente" : "Confirmada"}
                    </span>
                  </div>
                  {/* Detalles de la cita */}
                  <div className="space-y-2 text-sm text-slate-600 grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="capitalize">
                          {new Date(
                            appt.fecha + "T00:00:00",
                          ).toLocaleDateString("es-BO", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span className="font-bold">
                          {appt.hora_inicio.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scissors size={16} className="text-slate-400" />
                        <span>
                          Barbero:{" "}
                          <strong>
                            {appt.barbers?.nombre || "Especialista"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <span>{appt.sedes?.nombre}</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        className="bg-red-500 border border-red-600 border-l-2 text-white shadow-md font-bold px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        onClick={() => handleCancel(appt.id)}
                      >
                        CANCELAR
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
