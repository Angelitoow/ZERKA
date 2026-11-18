"use client";
import { useDemo } from "@/app/context/DemoStore";
import { Encabezado, Exportar, Indicadores, Panel } from "@/app/components/admin";
import { Barras } from "@/app/components/ui";

/** Panel de estadísticas (RF-11): todo se calcula del estado actual, así que refleja cada acción de la sesión. */
export default function AdminEstadisticas() {
  const { estadisticas: e } = useDemo();
  return (
    <>
      <Encabezado titulo="Estadísticas" subtitulo={`Generado el ${new Date().toLocaleString("es-CO")} · datos de demostración`}><Exportar /></Encabezado>
      <Indicadores />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel titulo="Publicaciones activas por tipo"><Barras datos={e.porTipo} /></Panel>
        <Panel titulo="Reportes por estado"><Barras datos={e.porEstadoReporte} color="bg-red-400" /></Panel>
        <Panel titulo="Publicaciones por categoría"><Barras datos={e.porCategoria} color="bg-lime-600" /></Panel>
        <Panel titulo="Publicaciones por barrio"><Barras datos={e.porBarrio} color="bg-amber-500" /></Panel>
      </div>
    </>
  );
}
