import React from "react";
import { User, ChevronLeft } from "lucide-react";
const Step2Category = ({ onSelect, onBack }) => {
  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500"
      >
        <ChevronLeft size={20} /> Volver
      </button>
      <h2 className="text-xl font-bold mb-4">¿Para quién es el servicio?</h2>

      {/* GRID LAYOUT (La clave del Responsive) */}
      {/* grid-cols-2: Crea dos columnas de igual tamaño. gap-4: Espacio entre ellas */}
      <div className="grid grid-cols-2 gap-4">
        {
          /* OPCIÓN HOMBRE */
          <button
            onClick={() => onSelect("hombre")}
            className="p-8 px-12 border-2 border-slate-100 rounded-3xl flex flex-col items-center gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <User className="size-20 p-5 text-indigo-800 border-indigo-500 bg-indigo-300 rounded-full" />
            <span className="font-bold">Hombre</span>
          </button>
        }
        {
          /* OPCIÓN MUJER */
          <button
            onClick={() => onSelect("mujer")}
            className="p-8 px-12 border-2 border-slate-100 rounded-3xl flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 transition-all"
          >
            <User className="size-20 p-5 text-pink-800 border-pink-500 bg-pink-300 rounded-full" />
            <span className="font-bold">Mujer</span>
          </button>
        }
      </div>
    </div>
  );
};

export default Step2Category;
