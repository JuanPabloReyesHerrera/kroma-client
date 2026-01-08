import React from "react";
import { MapPin, ChevronRight } from "lucide-react"; // Importamos los iconos
const Step1Sedes = ({ sedes, onSelect }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="text-indigo-600" /> Selecione la sede
      </h2>
      <div className="space-y-3">
        {sedes.map((sede) => (
          // map() es como una fabrica de botones por cada sede que hay en sedes
          <button
            key={sede.id} //id de la sede
            onClick={() => onSelect(sede)} //Cuando clickeamos se ejecuta la función y enviamos la sede
            className="w-full p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex justify-between items-center group bg-white"
          >
            <div>
              <p className="font-bold text-slate-800">{sede.nombre}</p>
              <p className="text-sm text-slate-500">{sede.direccion}</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step1Sedes;
