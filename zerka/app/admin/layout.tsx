"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuChartColumn, LuFlag, LuLayoutDashboard, LuLogOut, LuSearch, LuStore, LuUsers } from "react-icons/lu";
import { useDemo, useProteger, useSalir } from "@/app/context/DemoStore";
import { Campana, MenuCuenta } from "@/app/components/header";
import Logo from "@/app/components/logo";

const NAV = [
  { href: "/admin", label: "Inicio", icono: LuLayoutDashboard },
  { href: "/admin/publicaciones", label: "Publicaciones", icono: LuStore },
  { href: "/admin/reportes", label: "Reportes", icono: LuFlag },
  { href: "/admin/usuarios", label: "Usuarios", icono: LuUsers },
  { href: "/admin/estadisticas", label: "Estadísticas", icono: LuChartColumn },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const permitido = useProteger(true);
  const pathname = usePathname();
  const { reportes } = useDemo();
  const salir = useSalir();
  if (!permitido) return <p className="grid min-h-screen place-items-center text-sm text-stone-500">Redirigiendo…</p>;
  const pendientes = reportes.filter((r) => r.estado === "Pendiente").length;

  return (
    <div className="min-h-screen bg-crema">
      {/* Barra superior */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/95 pr-3 backdrop-blur sm:pr-5 print:hidden">
        <Logo href="/admin" />
        <p className="hidden font-bold text-green-900 md:block">Panel del superusuario</p>
        <span className="chip hidden bg-green-100 text-green-800 sm:inline-flex">Base de datos PostgreSQL</span>
        <div className="ml-auto flex items-center gap-2"><Campana /><MenuCuenta /></div>
      </header>

      <div className="lg:flex">
        {/* Menú lateral (en móvil se convierte en una barra desplazable) */}
        <aside className="bg-green-950 text-lime-50 lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:w-64 lg:shrink-0 lg:flex-col print:hidden">
          <nav aria-label="Administración" className="scroll-x p-3 lg:flex-col lg:overflow-visible">
            {NAV.map(({ href, label, icono: Icono }) => {
              const activo = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={activo ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activo ? "bg-lime-500 text-green-950" : "hover:bg-white/10"}`}>
                  <Icono className="size-5" /> {label}
                  {href === "/admin/reportes" && pendientes > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 text-xs text-white">{pendientes}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden space-y-1 border-t border-white/10 p-3 lg:block">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm hover:bg-white/10"><LuSearch className="size-5" /> Explorar como usuario</Link>
            <button onClick={salir} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-200 hover:bg-white/10"><LuLogOut className="size-5" /> Cerrar sesión</button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
