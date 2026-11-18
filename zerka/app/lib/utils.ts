import type { Usuario } from "@/app/data/demo";

/* ───────────── Formato (APIs nativas Intl) ───────────── */
const moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const relativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

export const cop = (n: number) => moneda.format(n);
export const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
export const nombreCompleto = (u: Pick<Usuario, "nombres" | "apellidos">) => `${u.nombres} ${u.apellidos}`;
export const iniciales = (u: Pick<Usuario, "nombres" | "apellidos">) => (u.nombres[0] + (u.apellidos[0] ?? "")).toUpperCase();

export function hace(iso: string) {
  const dias = Math.round((new Date(iso).getTime() - Date.now()) / 864e5);
  if (dias !== 0) return relativo.format(dias, "day");
  const horas = Math.round((new Date(iso).getTime() - Date.now()) / 36e5);
  return horas ? relativo.format(horas, "hour") : "hace un momento";
}

/* ───────────── Validación de formularios ───────────── */
export type Errores<T> = Partial<Record<keyof T, string>>;

export const REGLAS = {
  correo: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  telefono: /^3\d{9}$/,
  nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]{2,40}$/,
  clave: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
};

const edad = (nacimiento: string) => (Date.now() - new Date(nacimiento).getTime()) / (365.25 * 864e5);

type DatosPersona = Pick<Usuario, "nombres" | "apellidos" | "telefono" | "ciudad" | "barrio" | "genero" | "nacimiento"> &
  Partial<Pick<Usuario, "correo" | "clave">>;

/** Valida los datos de registro y de edición de perfil. Devuelve solo los campos con error. */
export function validarPersona(d: DatosPersona, conCredenciales = false): Errores<DatosPersona> {
  const e: Errores<DatosPersona> = {};
  if (!d.ciudad) e.ciudad = "Selecciona tu ciudad.";
  if (!d.barrio) e.barrio = "Selecciona tu barrio.";
  if (!REGLAS.nombre.test(d.nombres.trim())) e.nombres = d.nombres.trim() ? "Usa solo letras (mínimo 2)." : "Los nombres son obligatorios.";
  if (!REGLAS.nombre.test(d.apellidos.trim())) e.apellidos = d.apellidos.trim() ? "Usa solo letras (mínimo 2)." : "Los apellidos son obligatorios.";
  if (!d.genero) e.genero = "Selecciona una opción.";
  if (!d.nacimiento) e.nacimiento = "La fecha de nacimiento es obligatoria.";
  else if (edad(d.nacimiento) < 18 || edad(d.nacimiento) > 100) e.nacimiento = "Debes ser mayor de edad (18 años o más).";
  if (!REGLAS.telefono.test(d.telefono.replace(/\s/g, ""))) e.telefono = d.telefono ? "Debe tener 10 dígitos y empezar por 3." : "El teléfono es obligatorio.";
  if (conCredenciales) {
    if (!REGLAS.correo.test(d.correo?.trim() ?? "")) e.correo = d.correo ? "Formato de correo inválido (ej. nombre@correo.com)." : "El correo es obligatorio.";
    if (!REGLAS.clave.test(d.clave ?? "")) e.clave = "Mínimo 8 caracteres, con al menos una letra y un número.";
  }
  return e;
}

/** Lleva el foco (y el scroll) al primer campo marcado como inválido tras validar. */
export const enfocarError = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());

/** Genera y descarga un archivo en el propio navegador (sin servidor ni almacenamiento). */
export function descargar(nombre: string, contenido: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  Object.assign(document.createElement("a"), { href: url, download: nombre }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
