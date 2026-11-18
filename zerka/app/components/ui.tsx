"use client";
import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuStar, LuX } from "react-icons/lu";
import type { Usuario } from "@/app/data/demo";
import { iniciales } from "@/app/lib/utils";

/** Ventana modal basada en <dialog> nativo: foco atrapado, Esc y fondo bloqueado sin librerías. */
export function Modal({ abierto, onCerrar, titulo, children, ancho = "max-w-lg" }: {
  abierto: boolean; onCerrar: () => void; titulo: string; children: ReactNode; ancho?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (abierto && !d?.open) d?.showModal();
    if (!abierto && d?.open) d.close();
  }, [abierto]);
  return (
    <dialog ref={ref} onClose={onCerrar} onClick={(e) => e.target === ref.current && onCerrar()}
      className={`m-auto w-[calc(100%-2rem)] ${ancho} max-h-[90dvh] rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm`}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-green-100 bg-white/95 px-6 py-4">
        <h2 className="text-lg font-bold text-green-900">{titulo}</h2>
        <button onClick={onCerrar} className="rounded-full p-2 text-stone-400 hover:bg-red-50 hover:text-red-500" aria-label="Cerrar">
          <LuX className="size-5" />
        </button>
      </div>
      <div className="px-6 py-5">{abierto && children}</div>
    </dialog>
  );
}

/** Etiqueta + control + mensaje de error debajo del campo, enlazados con id para lectores de pantalla. */
export function Campo({ label, error, ayuda, children, extra, className = "" }: {
  label: string; error?: string; ayuda?: string; children: ReactElement<Record<string, unknown>>; extra?: ReactNode; className?: string;
}) {
  const id = useId();
  const nota = error || ayuda;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        {cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": nota ? `${id}-nota` : undefined })}
        {extra}
      </div>
      {nota && <p id={`${id}-nota`} role={error ? "alert" : undefined} className={`mt-1 text-xs ${error ? "font-medium text-red-600" : "text-stone-500"}`}>{nota}</p>}
    </div>
  );
}

export function Estrellas({ valor, onChange, size = "size-4" }: { valor: number; onChange?: (n: number) => void; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icono = <LuStar className={`${size} ${n <= Math.round(valor) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />;
        return onChange
          ? <button key={n} type="button" role="radio" aria-checked={n === valor} aria-label={`${n} estrellas`} onClick={() => onChange(n)} className="p-0.5 transition hover:scale-110">{icono}</button>
          : <span key={n}>{icono}</span>;
      })}
    </span>
  );
}

export function Vacio({ icono: Icono, titulo, texto, children }: { icono: IconType; titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-lime-100 text-green-800"><Icono className="size-7" /></span>
      <p className="text-lg font-bold text-green-900">{titulo}</p>
      {texto && <p className="max-w-md text-sm text-stone-500">{texto}</p>}
      {children}
    </div>
  );
}

export function Avatar({ usuario, size = "size-9 text-sm" }: { usuario: Pick<Usuario, "nombres" | "apellidos" | "foto">; size?: string }) {
  return usuario.foto
    // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
    ? <img src={usuario.foto} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
    : <span className={`${size} grid shrink-0 place-items-center rounded-full bg-green-800 font-bold text-lime-200`}>{iniciales(usuario)}</span>;
}

const COLORES_ESTADO: Record<string, string> = {
  Disponible: "bg-lime-100 text-green-800", Activo: "bg-lime-100 text-green-800",
  "No disponible": "bg-amber-100 text-amber-800", Pendiente: "bg-amber-100 text-amber-800",
  Revisado: "bg-sky-100 text-sky-800", Aprobado: "bg-red-100 text-red-700",
  Retirada: "bg-red-100 text-red-700", Suspendido: "bg-red-100 text-red-700", Rechazado: "bg-stone-200 text-stone-700",
};
export const Estado = ({ estado }: { estado: string }) => <span className={`chip ${COLORES_ESTADO[estado] ?? "bg-stone-100"}`}>{estado}</span>;

/** Paginación reutilizable: devuelve la porción visible y los controles. Vuelve a la página 1 cuando cambia `clave` (filtros). */
export function usePaginacion<T>(items: T[], porPagina: number, clave = "") {
  const [estado, setEstado] = useState({ clave, pagina: 1 });
  const elegida = estado.clave === clave ? estado.pagina : 1;
  const setPagina = (pagina: number) => setEstado({ clave, pagina });
  const total = Math.ceil(items.length / porPagina);
  const pagina = Math.min(elegida, Math.max(1, total));
  const controles = total > 1 && (
    <nav aria-label="Paginación" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button className="btn btn-secundario btn-sm" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => setPagina(n)} aria-current={n === pagina ? "page" : undefined}
          className={`size-10 rounded-[10px] font-bold transition-all ${n === pagina ? "bg-green-800 text-white shadow-md" : "bg-white/70 text-stone-600 hover:bg-white"}`}>{n}</button>
      ))}
      <button className="btn btn-secundario btn-sm" disabled={pagina === total} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
    </nav>
  );
  return { visibles: items.slice((pagina - 1) * porPagina, pagina * porPagina), controles };
}

/** Gráfico de barras horizontal en CSS puro, conectado a los datos que recibe. */
export function Barras({ datos, color = "bg-green-700" }: { datos: { etiqueta: string; valor: number }[]; color?: string }) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  return (
    <ul className="space-y-3">
      {datos.map((d) => (
        <li key={d.etiqueta} className="text-sm">
          <div className="mb-1 flex justify-between gap-2"><span className="truncate text-stone-600">{d.etiqueta}</span><b className="text-green-900">{d.valor}</b></div>
          <div className="h-2.5 rounded-full bg-stone-100"><div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(d.valor / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
