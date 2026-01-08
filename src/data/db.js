// src/data/db.js

export const sedes = [
  {
    id: 1,
    nombre: "ꓘROMA - Sede 1",
    direccion: "Calle Principal #123",
  },
  {
    id: 2,
    nombre: "ꓘROMA - Sede 2",
    direccion: "Av. Comercial esq. Junín",
  },
];

export const servicios = {
  hombre: [
    { id: 101, nombre: "Corte Clásico / Tradicional", precio: "40 BOB" },
    { id: 102, nombre: "Corte Especial / Degradado", precio: "60 BOB" },
    { id: 103, nombre: "Barba Completa", precio: "30 BOB" },
  ],
  mujer: [
    { id: 201, nombre: "Corte de Puntas / Mantenimiento", precio: "50 BOB" },
    { id: 202, nombre: "Corte de Cambio de Imagen", precio: "100 BOB" },
    { id: 203, nombre: "Lavado y Peinado", precio: "80 BOB" },
  ],
};

export const barbers = [
  {
    id: 1,
    name: "Juan Carlos",
    especialidad: "Barbero Senior",
    rating: 4.9,
    reviews: 12,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", // Foto falsa
    servicios: ["hombre"], // Solo atiende hombres
  },
  {
    id: 2,
    name: "María Elena",
    especialidad: "Estilista Master",
    rating: 4.8,
    reviews: 85,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    servicios: ["mujer", "hombre"], // Atiende ambos (Tu regla de negocio)
  },
  {
    id: 3,
    name: "Ricardo",
    especialidad: "Cortes Urbanos",
    rating: 4.5,
    reviews: 40,
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    servicios: ["hombre"],
  },
  {
    id: 4,
    name: "Ana",
    especialidad: "Colorista",
    rating: 5.0,
    reviews: 21,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
    servicios: ["mujer"], // Solo atiende mujeres
  },
];
