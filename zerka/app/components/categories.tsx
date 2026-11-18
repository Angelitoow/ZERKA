import { LuLayoutGrid, LuX } from "react-icons/lu";
import { CATEGORIAS } from "@/app/data/demo";

interface CategoriesProps {
  selectedCategoria: string;
  onSelectCategoria: (nombre: string) => void;
  conteos: Record<string, number>;
}

/** Menú lateral de categorías (escritorio). En móvil el filtro equivalente está en la barra de filtros. */
const Categories = ({ selectedCategoria, onSelectCategoria, conteos }: CategoriesProps) => (
  <aside className="sticky top-24 hidden w-64 shrink-0 self-start overflow-hidden rounded-2xl bg-white shadow-md lg:block xl:w-72">
    <button onClick={() => onSelectCategoria("")} className="flex w-full items-center gap-4 bg-lime-700 px-5 py-3 font-bold text-white">
      <LuLayoutGrid className="size-6" /> Explora categorías
    </button>
    <nav className="flex flex-col gap-1 p-2">
      {selectedCategoria && (
        <button onClick={() => onSelectCategoria("")} className="flex items-center gap-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
          <LuX /> Quitar filtro: {selectedCategoria}
        </button>
      )}
      {CATEGORIAS.map(({ nombre, icono: Icono }) => {
        const activo = selectedCategoria === nombre;
        return (
          <button key={nombre} onClick={() => onSelectCategoria(activo ? "" : nombre)} aria-pressed={activo}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activo ? "bg-lime-700 font-bold text-white" : "text-stone-800 hover:bg-lime-700 hover:text-white"}`}>
            <Icono className={`size-5 shrink-0 ${activo ? "" : "text-lime-700 group-hover:text-white"}`} />
            <span className="flex-1">{nombre}</span>
            <span className="text-xs opacity-70">{conteos[nombre] ?? 0}</span>
          </button>
        );
      })}
    </nav>
  </aside>
);

export default Categories;
