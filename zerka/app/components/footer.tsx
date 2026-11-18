"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuHeart, LuHouse, LuPlus, LuStore, LuUser } from "react-icons/lu";
import type { IconType } from "react-icons";

/* Botón de navegación reutilizable */
const NavBtn = ({ href, icon: Icon, label, corto = label, activo }: { href: string; icon: IconType; label: string; corto?: string; activo: boolean }) => (
  <Link href={href} aria-current={activo ? "page" : undefined}
    className={`flex flex-1 flex-col items-center gap-0.5 transition-all active:scale-95 ${activo ? "font-semibold text-lime-600" : "text-stone-500 hover:text-lime-600"}`}>
    {/* Icono + label: columna en mobile, fila en lg */}
    <span className="flex flex-col items-center lg:flex-row lg:gap-2">
      <Icon className="size-6" />
      <span className="text-[10px] whitespace-nowrap lg:hidden">{corto}</span>
      <span className="hidden lg:inline lg:text-base">{label}</span>
    </span>
    {/* Indicador verde — siempre debajo */}
    <span className={`h-1 w-full rounded-full transition-all duration-300 lg:w-40 ${activo ? "bg-lime-600" : "bg-transparent"}`} />
  </Link>
);

const Footer = () => {
  const pathname = usePathname();
  const esInicio = /^\/dashboard(\/(productos|servicios|trueques|solicitudes|publicacion\/.*))?$/.test(pathname);
  return (
    <footer className="fixed bottom-0 left-0 z-40 w-full border-t border-stone-200 bg-white shadow-lg lg:bottom-3 lg:left-1/2 lg:w-[90%] lg:-translate-x-1/2 lg:rounded-2xl lg:border print:hidden">
      {/* ---- Botón central flotante: publicar ---- */}
      <Link href="/dashboard/publicar" aria-label="Crear publicación"
        className="absolute -top-7 left-1/2 z-10 grid size-14 -translate-x-1/2 place-items-center rounded-full bg-green-900 text-white shadow-xl ring-4 ring-white transition hover:bg-lime-600 active:scale-95">
        <LuPlus className="size-8" />
      </Link>
      {/* ---- Barra de iconos ---- */}
      <nav className="flex items-center justify-around px-2 py-2">
        <NavBtn href="/dashboard" icon={LuHouse} label="Inicio" activo={esInicio} />
        <NavBtn href="/dashboard/mis-publicaciones" icon={LuStore} label="Mis publicaciones" corto="Publicaciones" activo={pathname.startsWith("/dashboard/mis-publicaciones")} />
        {/* Espacio para el botón flotante central */}
        <div className="flex-1" />
        <NavBtn href="/dashboard/intereses" icon={LuHeart} label="Intereses" activo={/^\/dashboard\/interes(es|ados)/.test(pathname)} />
        <NavBtn href="/dashboard/perfil" icon={LuUser} label="Perfil" activo={pathname.startsWith("/dashboard/perfil")} />
      </nav>
    </footer>
  );
};

export default Footer;
