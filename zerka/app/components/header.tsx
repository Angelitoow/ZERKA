"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, type MouseEvent } from "react";
import {
  LuBell, LuBellOff, LuHeart, LuLayoutDashboard, LuLogOut, LuSearch, LuStar, LuStore, LuUser, LuUsers, LuX,
} from "react-icons/lu";
import { useDemo, useSalir } from "@/app/context/DemoStore";
import { hace, nombreCompleto } from "@/app/lib/utils";
import { Avatar } from "./ui";
import Logo from "./logo";

/** Cierra el popover nativo cuando se elige una opción dentro de él. */
const cerrarAlElegir = (e: MouseEvent<HTMLElement>) => (e.target as HTMLElement).closest("a,button") && e.currentTarget.hidePopover();

export function Campana() {
  const { notificaciones, sinLeer, marcarLeidas } = useDemo();
  return (
    <>
      <button popoverTarget="notificaciones" aria-label={`Notificaciones (${sinLeer} sin leer)`}
        className="relative rounded-full p-2 text-stone-600 transition hover:bg-lime-100 hover:text-green-900">
        <LuBell className="size-6" />
        {sinLeer > 0 && <span className="absolute top-0.5 right-0.5 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{sinLeer}</span>}
      </button>
      <div id="notificaciones" popover="auto" className="menu w-80" onClick={cerrarAlElegir}
        onToggle={(e) => e.newState === "closed" && marcarLeidas()}>
        <p className="px-3 pt-2 pb-1 font-bold text-green-900">Notificaciones</p>
        {notificaciones.length === 0
          ? <p className="flex items-center gap-2 px-3 py-6 text-sm text-stone-500"><LuBellOff /> No hay notificaciones.</p>
          : <ul className="max-h-80 overflow-y-auto">
            {notificaciones.slice(0, 12).map((n, i) => (
              <li key={i}><Link href={n.href} className="menu-item flex-col items-start gap-0.5">
                <span>{n.texto}</span><span className="text-xs text-stone-400">{hace(n.fecha)}</span>
              </Link></li>
            ))}
          </ul>}
        <p className="px-3 pt-1 pb-2 text-[11px] text-stone-400">Notificaciones basadas en la actividad de tu cuenta.</p>
      </div>
    </>
  );
}

export function MenuCuenta() {
  const { yo } = useDemo();
  const salir = useSalir();
  if (!yo) return null;
  const admin = yo.rol === "admin";
  const enlaces = admin
    ? [{ href: "/admin", label: "Panel administrativo", icono: LuLayoutDashboard }, { href: "/admin/perfil", label: "Mi perfil", icono: LuUser }, { href: "/dashboard", label: "Explorar como usuario", icono: LuSearch }]
    : [{ href: "/dashboard/perfil", label: "Mi perfil", icono: LuUser }, { href: "/dashboard/mis-publicaciones", label: "Mis publicaciones", icono: LuStore },
      { href: "/dashboard/intereses", label: "Mis intereses", icono: LuHeart }, { href: "/dashboard/interesados", label: "Interesados", icono: LuUsers }];
  return (
    <>
      <button popoverTarget="cuenta" aria-label="Menú de cuenta" className="rounded-full ring-lime-400 transition hover:ring-2">
        <Avatar usuario={yo} />
      </button>
      <div id="cuenta" popover="auto" className="menu" onClick={cerrarAlElegir}>
        <div className="flex items-center gap-3 border-b border-stone-100 px-3 pt-2 pb-3">
          <Avatar usuario={yo} size="size-11" />
          <div className="min-w-0">
            <p className="truncate font-bold text-green-900">{nombreCompleto(yo)}</p>
            <p className="text-xs font-semibold text-lime-700">{admin ? "Superusuario administrador" : "Usuario"}</p>
            <p className="truncate text-xs text-stone-500">{yo.correo}</p>
          </div>
        </div>
        <nav className="py-1">
          {enlaces.map(({ href, label, icono: Icono }) => <Link key={href} href={href} className="menu-item"><Icono className="size-4" />{label}</Link>)}
        </nav>
        <button onClick={salir} className="menu-item border-t border-stone-100 text-red-600 hover:bg-red-50 hover:text-red-700">
          <LuLogOut className="size-4" /> Cerrar sesión
        </button>
      </div>
    </>
  );
}

const Header = () => {
  const { yo, busqueda, setBusqueda, reputacion } = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const rep = yo && yo.rol === "usuario" ? reputacion(yo.id) : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-2 border-b border-stone-200/60 bg-crema/85 pr-3 backdrop-blur-md sm:gap-3 sm:pr-5 print:hidden">
      <Logo className="hidden lg:flex" />
      {/* Buscar desde cualquier pantalla lleva a la exploración con el texto aplicado */}
      <form role="search" onSubmit={(e) => { e.preventDefault(); if (!/^\/dashboard(\/(productos|servicios|trueques|solicitudes))?$/.test(pathname)) router.push("/dashboard"); }}
        className="mx-auto ml-3 flex w-full max-w-xl items-center rounded-2xl border border-stone-400 bg-white px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-lime-400 lg:ml-auto">
        <input ref={inputRef} type="text" name="buscar" autoComplete="off" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos, servicios, trueques..." aria-label="Buscar publicaciones"
          className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-stone-500 sm:text-base" />
        {busqueda && (
          <button type="button" onClick={() => { setBusqueda(""); inputRef.current?.focus(); }} className="ml-1 text-stone-400 hover:text-red-500" aria-label="Limpiar búsqueda">
            <LuX className="size-5" />
          </button>
        )}
        <button type="submit" className="ml-2 text-stone-500 hover:text-green-700" aria-label="Buscar"><LuSearch className="size-5" /></button>
      </form>
      <Campana />
      {rep && (
        <Link href="/dashboard/perfil#resenas" aria-label="Mi reputación" className="hidden items-center gap-1 rounded-full px-2 py-1 font-bold text-amber-600 hover:bg-amber-50 sm:flex">
          <LuStar className="size-6 fill-amber-400 text-amber-400" />{rep.total ? rep.promedio.toFixed(1) : "–"}
        </Link>
      )}
      <MenuCuenta />
    </header>
  );
};

export default Header;
