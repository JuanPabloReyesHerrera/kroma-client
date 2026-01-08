import React from "react";
import { ChevronLeft, User, StarIcon } from "lucide-react";
import { barbers } from "../data/db";

const Step4Barber = ({ onBack, onSelect }) => {
  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-500"
      >
        <ChevronLeft size={20} /> Volver
      </button>
      <h3 className="text-xl font-bold">Escoge a tu profesional</h3>
      <p className="text-xs text-slate-500 pb-2">
        Basado en tus preferencias y calificaciones de clientes
      </p>
      <div className="w-full space-y-2">
        {barbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => onSelect(barber)}
            className="w-full gap-4 flex justify-between items-center text-left p-4 border-slate-200 border-2 shadow-sm rounded-xl hover:border-indigo-500 hover:bg-indigo-100"
          >
            <User
              size={45}
              className="text-slate-600 bg-slate-300 rounded-full p-2"
            ></User>
            <div className="flex-1">
              <p className="font-bold">{barber.name}</p>
              <p className="text-xs text-slate-500">{barber.especialidad}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-slate-700">
                  {barber.rating}
                </span>
                <StarIcon
                  size={16}
                  className="text-yellow-400 fill-yellow-400"
                />
              </div>
              <span className="text-xs text-slate-400">
                ({barber.reviews} reseñas)
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step4Barber;
