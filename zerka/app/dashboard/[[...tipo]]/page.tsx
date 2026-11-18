"use client";
/** Inicio y exploración: /dashboard (todo), /dashboard/productos, /servicios, /trueques y /solicitudes. */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LuInbox, LuPlus, LuRotateCcw, LuSearchX } from "react-icons/lu";
import { BARRIOS, CATEGORIAS, TIPOS } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import Categories from "@/app/components/categories";
import { Grid } from "@/app/components/PublicacionCard";
import { Vacio } from "@/app/components/ui";

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Explorar() {
  const slug = useParams<{ tipo?: string[] }>().tipo;
  const seccion = TIPOS.find((t) => t.slug === slug?.[0]);
  const { publicaciones, busqueda, setBusqueda } = useDemo();
  const [categoria, setCategoria] = useState("");
  const [barrio, setBarrio] = useState("");
  const [orden, setOrden] = useState("recientes");

  const texto = normalizar(busqueda.trim());
  const visibles = publicaciones.filter((p) => p.estado !== "Retirada" && (!seccion || p.tipo === seccion.tipo));
  const resultados = visibles
    .filter((p) => (!categoria || p.categoria === categoria) && (!barrio || p.barrio === barrio)
      && (!texto || normalizar(`${p.titulo} ${p.descripcion} ${p.categoria} ${p.barrio}`).includes(texto)))
    .sort((a, b) => (orden === "recientes" ? b.fecha.localeCompare(a.fecha) : a.fecha.localeCompare(b.fecha)));
  const conteos = Object.fromEntries(CATEGORIAS.map((c) => [c.nombre, visibles.filter((p) => p.categoria === c.nombre).length]));

  // Carga simulada breve cada vez que cambian los criterios (no hay servidor que consultar).
  const firma = [seccion?.slug, categoria, barrio, orden, texto].join("|");
  const [listo, setListo] = useState("");
  useEffect(() => { const t = setTimeout(() => setListo(firma), 300); return () => clearTimeout(t); }, [firma]);
  const hayFiltros = !!(categoria || barrio || texto || orden !== "recientes");
  const limpiar = () => { setCategoria(""); setBarrio(""); setOrden("recientes"); setBusqueda(""); };

  if (slug && (!seccion || slug.length > 1))
    return <Vacio icono={LuSearchX} titulo="Sección no encontrada" texto="La dirección no corresponde a ningún tipo de publicación."><Link href="/dashboard" className="btn btn-primario">Ir al inicio</Link></Vacio>;

  return (
    <div className="flex gap-6 lg:gap-8">
      <Categories selectedCategoria={categoria} onSelectCategoria={setCategoria} conteos={conteos} />

      <section className="min-w-0 flex-1">
        {seccion ? (
          <h1 className="titulo mb-5 flex items-center gap-3"><seccion.icono className="text-lime-600" /> {seccion.plural}</h1>
        ) : (
          /* Banner del mockup de la página principal */
          <div className="relative mb-6 hidden h-40 overflow-hidden rounded-[20px] bg-green-800 shadow-md sm:block md:h-48">
            <div className="absolute inset-0 bg-cover bg-[center_60%]" style={{ backgroundImage: "url('/Background.png')" }} />
            <div className="absolute inset-0 flex items-center justify-between gap-4 bg-gradient-to-r from-green-950/95 via-green-900/70 to-transparent p-8 md:p-12">
              <p className="max-w-[500px] text-2xl leading-tight font-black tracking-wide text-white italic drop-shadow-lg md:text-4xl">
                PRODUCTOS HECHOS CON ESFUERZO, PARA TODOS <span className="text-lime-400 not-italic">💚</span>
              </p>
            </div>
          </div>
        )}

        {/* Navegación entre tipos de publicación */}
        <nav aria-label="Tipos de publicación" className="scroll-x mb-4">
          {[{ slug: "", plural: "Todos" }, ...TIPOS].map((t) => {
            const activo = (seccion?.slug ?? "") === t.slug;
            return (
              <Link key={t.plural} href={`/dashboard${t.slug && `/${t.slug}`}`} aria-current={activo ? "page" : undefined}
                className={`rounded-full px-5 py-2.5 font-bold whitespace-nowrap transition-all ${activo ? "bg-green-800 text-white shadow-md" : "border border-green-200 bg-white text-green-900 hover:bg-green-50"}`}>
                {t.plural}
              </Link>
            );
          })}
        </nav>

        {/* Filtros: categoría (en móvil), barrio y orden por fecha */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input w-auto lg:hidden" aria-label="Filtrar por categoría">
            <option value="">Todas las categorías</option>{CATEGORIAS.map((c) => <option key={c.nombre}>{c.nombre}</option>)}
          </select>
          <select value={barrio} onChange={(e) => setBarrio(e.target.value)} className="input w-auto" aria-label="Filtrar por barrio">
            <option value="">Todos los barrios</option>{BARRIOS.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className="input w-auto" aria-label="Ordenar por fecha">
            <option value="recientes">Más recientes</option><option value="antiguos">Más antiguas</option>
          </select>
          {hayFiltros && <button onClick={limpiar} className="btn btn-suave"><LuRotateCcw /> Limpiar filtros</button>}
          <p className="ml-auto text-sm text-stone-600" aria-live="polite">{resultados.length} resultado{resultados.length === 1 ? "" : "s"}</p>
        </div>

        {listo !== firma ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-busy="true" aria-label="Cargando publicaciones">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-[20px] bg-white/70" />)}
          </div>
        ) : visibles.length === 0 ? (
          <Vacio icono={LuInbox} titulo="Aún no hay publicaciones" texto="Sé la primera persona en publicar en esta sección.">
            <Link href="/dashboard/publicar" className="btn btn-primario"><LuPlus /> Publicar</Link>
          </Vacio>
        ) : resultados.length === 0 ? (
          <Vacio icono={LuSearchX} titulo="No encontramos publicaciones" texto="Ninguna publicación coincide con tu búsqueda o filtros. Prueba con otras palabras.">
            <button onClick={limpiar} className="btn btn-primario"><LuRotateCcw /> Limpiar filtros</button>
          </Vacio>
        ) : (
          <Grid key={firma} items={resultados} />
        )}
      </section>
    </div>
  );
}
