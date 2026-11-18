"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuEye, LuEyeOff, LuHeart, LuMapPin, LuPencil, LuRotateCcw, LuStar, LuTrash2 } from "react-icons/lu";
import { RETIRO_USUARIO, TIPOS, type Publicacion } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { cop, hace } from "@/app/lib/utils";
import { Estado, usePaginacion } from "./ui";

export function Precio({ p }: { p: Publicacion }) {
  if (p.tipo === "Trueque") return <>A cambio de: {p.cambio}</>;
  if (p.tipo === "Solicitud") return <>Solicitud de la comunidad</>;
  return <>{p.precio ? cop(p.precio) : "Precio a convenir"}</>;
}

export function TipoBadge({ tipo, className = "" }: { tipo: Publicacion["tipo"]; className?: string }) {
  const Icono = TIPOS.find((t) => t.tipo === tipo)!.icono;
  return <span className={`chip bg-green-900/85 text-white backdrop-blur-sm ${className}`}><Icono /> {tipo}</span>;
}

export default function PublicacionCard({ p, acciones }: { p: Publicacion; acciones?: ReactNode }) {
  const { yo, reputacion, interesados, alternarInteres } = useDemo();
  const rep = reputacion(p.usuarioId);
  const lista = interesados(p.id);
  const meInteresa = lista.some((i) => i.usuarioId === yo?.id);
  const puedeInteresarse = yo?.rol === "usuario" && yo.id !== p.usuarioId && p.estado === "Disponible";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[20px] border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="relative h-44 w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- imágenes locales (data:/blob:) */}
        <img src={p.imagenes[0]} alt={p.titulo} loading="lazy" className={`size-full object-cover transition-transform duration-700 group-hover:scale-105 ${p.estado !== "Disponible" ? "grayscale-[.6]" : ""}`} />
        <TipoBadge tipo={p.tipo} className="absolute top-3 left-3" />
        {p.estado !== "Disponible" && <span className="absolute top-3 right-3"><Estado estado={p.estado} /></span>}
      </div>

      <div className="flex flex-grow flex-col p-4">
        <p className="mb-1 text-xs font-semibold text-lime-700">{p.categoria}</p>
        <h3 className="mb-1 line-clamp-2 text-[16px] leading-tight font-semibold text-stone-800">
          {/* Enlace extendido: toda la tarjeta abre el detalle sin anidar botones dentro del enlace */}
          <Link href={`/dashboard/publicacion/${p.id}`} className="after:absolute after:inset-0 hover:text-green-800">{p.titulo}</Link>
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-stone-500">{p.descripcion}</p>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold text-stone-900"><Precio p={p} /></p>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-stone-600">
              <LuStar className="fill-amber-400 text-amber-400" />
              <b>{rep.total ? rep.promedio.toFixed(1) : "Nuevo"}</b><span className="text-stone-400">({rep.total})</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-[12px] text-stone-500">
              <LuMapPin className="shrink-0" /><span className="truncate">{p.barrio} · {hace(p.fecha)}</span>
            </p>
          </div>
          {puedeInteresarse ? (
            <button onClick={() => alternarInteres(p.id)} aria-pressed={meInteresa} aria-label={`Me interesa (${lista.length})`}
              className="relative z-10 flex shrink-0 items-center gap-1 rounded-full border border-stone-100 bg-stone-50 p-2.5 text-xs font-bold transition-colors hover:bg-lime-50">
              <LuHeart className={`size-5 ${meInteresa ? "fill-green-700 text-green-700" : "text-stone-400"}`} />{lista.length}
            </button>
          ) : (
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-stone-500" title="Interesados"><LuHeart className="size-4" />{lista.length}</span>
          )}
        </div>
      </div>
      {acciones && <div className="relative z-10 flex flex-wrap gap-2 border-t border-stone-100 p-3">{acciones}</div>}
    </article>
  );
}

/** Acciones del propietario: editar, pausar/activar, retirar (con confirmación) o reactivar. */
export function AccionesPropias({ p }: { p: Publicacion }) {
  const { cambiarEstado, confirmar, notificar } = useDemo();
  async function retirar() {
    if (!(await confirmar({ titulo: "¿Retirar esta publicación?", aceptar: "Sí, retirar", peligro: true,
      mensaje: `«${p.titulo}» dejará de mostrarse a los demás usuarios. Podrás reactivarla desde Mis publicaciones.` }))) return;
    cambiarEstado(p.id, "Retirada", RETIRO_USUARIO);
    notificar("Publicación retirada correctamente.");
  }
  function alternar(estado: Publicacion["estado"], mensaje: string) { cambiarEstado(p.id, estado); notificar(mensaje); }

  if (p.estado === "Retirada")
    return p.motivoRetiro === RETIRO_USUARIO
      ? <button onClick={() => alternar("Disponible", "Publicación reactivada.")} className="btn btn-secundario btn-sm"><LuRotateCcw /> Reactivar</button>
      : <p className="text-xs font-medium text-red-700">{p.motivoRetiro}. Solo el administrador puede restaurarla.</p>;
  return (
    <>
      <Link href={`/dashboard/publicacion/${p.id}/editar`} className="btn btn-secundario btn-sm"><LuPencil /> Editar</Link>
      {p.estado === "Disponible"
        ? <button onClick={() => alternar("No disponible", "Marcada como no disponible.")} className="btn btn-secundario btn-sm"><LuEyeOff /> No disponible</button>
        : <button onClick={() => alternar("Disponible", "Marcada como disponible.")} className="btn btn-secundario btn-sm"><LuEye /> Disponible</button>}
      <button onClick={retirar} className="btn btn-sm text-red-600 hover:bg-red-50"><LuTrash2 /> Retirar</button>
    </>
  );
}

/** Grilla de tarjetas con paginación. Para reiniciar la página al filtrar, se monta con una `key` distinta. */
export function Grid({ items, acciones, porPagina = 12 }: { items: Publicacion[]; acciones?: (p: Publicacion) => ReactNode; porPagina?: number }) {
  const { visibles, controles } = usePaginacion(items, porPagina);
  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibles.map((p) => <PublicacionCard key={p.id} p={p} acciones={acciones?.(p)} />)}
      </div>
      {controles}
    </>
  );
}
