import React from "react";
import { ChevronLeft, Scissors } from "lucide-react";
const Step3Service = ({ onSelect, onBack, servicesList }) => {
  // Crear una copia del array para no mutar el original
  /* Ordenar los servicios por precio ascendente */
  const sortedServices = [...servicesList].sort((a, b) => {
    return a.precio_actual - b.precio_actual;
  });
  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500"
      >
        <ChevronLeft size={20} /> Volver
      </button>
      <h3 className="font-bold text-xl p-2.5">Seleccione el servicio</h3>
      {/* Lista de Servicios */}
      <div className="space-y-3 grid grid-flow-row ">
        {sortedServices.map((serv) => (
          <button
            className="w-full p-3 border border-slate-300 rounded-xl shadow-sm text-left flex justify-between items-center hover:bg-indigo-100 hover:border-indigo-500"
            key={serv.id}
            onClick={() => onSelect(serv)}
          >
            <div>
              <p className="font-bold text-slate-800">{serv.nombre}</p>
              <p className="font-bold text-indigo-600">
                {serv.precio_actual} BOB
              </p>
            </div>
            <Scissors
              className="text-slate-400 bg-slate-100 rounded-3xl m-3 p-1"
              size={35}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step3Service;
