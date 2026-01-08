import React from "react";
import { servicios } from "../data/db";
import { ChevronLeft, Scissors } from "lucide-react";

const Step3Service = ({ onSelect, onBack, category }) => {
  const maleOrFemale = servicios[category];
  return (
    <div className="w-full">
      {console.log("ESto Es" + maleOrFemale)}
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500"
      >
        <ChevronLeft size={20} /> Volver
      </button>
      <h3 className="font-bold text-xl p-2.5">Seleccione el servicio</h3>
      <div className="space-y-3 grid grid-flow-row ">
        {maleOrFemale.map((serv) => (
          <button
            className="w-full p-3 border border-slate-300 rounded-xl shadow-sm text-left flex justify-between items-center hover:bg-indigo-100 hover:border-indigo-500"
            key={serv.id}
            onClick={() => onSelect(serv)}
          >
            <div>
              <p className="font-bold text-slate-800 ">{serv.nombre}</p>
              <p className="font-bold text-indigo-600">{serv.precio}</p>
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
