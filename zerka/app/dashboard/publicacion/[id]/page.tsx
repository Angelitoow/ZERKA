"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  LuArrowLeft, LuCalendar, LuCircleCheck, LuFlag, LuHeart, LuLock, LuMail, LuMapPin, LuMessageSquare, LuPhone, LuSearchX, LuUsers,
} from "react-icons/lu";
import { MOTIVOS_REPORTE, UMBRAL_REPORTES, type Publicacion } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { fecha, hace, nombreCompleto } from "@/app/lib/utils";
import { AccionesPropias, Precio, TipoBadge } from "@/app/components/PublicacionCard";
import { Avatar, Barras, Estado, Estrellas, Modal, Vacio } from "@/app/components/ui";

export default function DetallePublicacion() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { yo, publicacion, usuario, reputacion, interesados, reportes, reportesDe, alternarInteres } = useDemo();
  const [imagen, setImagen] = useState(0);
  const [reportando, setReportando] = useState(false);
  const p = publicacion(Number(id));
  if (!p || !yo) return <Vacio icono={LuSearchX} titulo="Publicación no encontrada" texto="Puede que el enlace sea incorrecto."><Link href="/dashboard" className="btn btn-primario">Volver al inicio</Link></Vacio>;

  const autor = usuario(p.usuarioId);
  const rep = reputacion(autor.id);
  const propia = yo.id === p.usuarioId;
  const esUsuario = yo.rol === "usuario";
  const lista = interesados(p.id);
  const meInteresa = lista.some((i) => i.usuarioId === yo.id);
  const miReporte = reportes.find((r) => r.publicacionId === p.id && r.usuarioId === yo.id);
  const contactoVisible = p.visibilidad === "Público" || propia || meInteresa || !esUsuario;

  return (
    <article className="mx-auto max-w-6xl">
      <button onClick={() => router.back()} className="btn btn-suave mb-4 -ml-3"><LuArrowLeft /> Volver</button>

      {p.estado === "Retirada" && (
        <p role="status" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          Esta publicación fue retirada y ya no es visible para la comunidad. {p.motivoRetiro && `Motivo: ${p.motivoRetiro}.`}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Galería */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- imágenes locales (data:/blob:) */}
          <img src={p.imagenes[imagen] ?? p.imagenes[0]} alt={p.titulo} className="aspect-[4/3] w-full rounded-[20px] bg-white object-cover shadow-sm" />
          {p.imagenes.length > 1 && (
            <div className="scroll-x mt-3">
              {p.imagenes.map((src, i) => (
                <button key={i} onClick={() => setImagen(i)} aria-label={`Ver imagen ${i + 1}`} aria-pressed={i === imagen}
                  className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 ${i === imagen ? "border-lime-500" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <TipoBadge tipo={p.tipo} /><span className="chip bg-lime-100 text-green-800">{p.categoria}</span><Estado estado={p.estado} />
          </div>
          <div>
            <h1 className="titulo">{p.titulo}</h1>
            <p className="mt-2 text-2xl font-bold text-stone-900"><Precio p={p} /></p>
          </div>
          <p className="leading-relaxed whitespace-pre-line text-stone-700">{p.descripcion}</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-500">
            <span className="flex items-center gap-1"><LuMapPin /> {p.barrio}, Florencia</span>
            <span className="flex items-center gap-1"><LuCalendar /> {fecha(p.fecha)} ({hace(p.fecha)})</span>
          </p>

          {/* Interés en la publicación (mockup «Interés en las publicaciones») */}
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="flex items-center gap-2 text-sm text-stone-600">
              <LuUsers className="size-5 text-green-800" /><b className="text-lg text-green-900">{lista.length}</b> persona{lista.length === 1 ? "" : "s"} interesada{lista.length === 1 ? "" : "s"}
            </p>
            {propia ? (
              <div className="flex flex-wrap gap-2"><Link href="/dashboard/interesados" className="btn btn-primario btn-sm"><LuUsers /> Ver interesados</Link><AccionesPropias p={p} /></div>
            ) : esUsuario && p.estado === "Disponible" ? (
              <button onClick={() => alternarInteres(p.id)} aria-pressed={meInteresa}
                className={`btn ${meInteresa ? "btn-secundario" : "btn-primario"} px-6`}>
                <LuHeart className={meInteresa ? "fill-green-700 text-green-700" : ""} /> {meInteresa ? "Ya estás interesado · Quitar" : "Estoy interesado"}
              </button>
            ) : !esUsuario && <span className="text-xs text-stone-500">Vista de consulta del administrador.</span>}
          </div>

          {/* Proveedor y contacto */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar usuario={autor} size="size-12 text-base" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-green-900">{nombreCompleto(autor)}{propia && " (tú)"}</p>
                <p className="flex items-center gap-1 text-sm text-stone-500">
                  <Estrellas valor={rep.promedio} /> {rep.total ? `${rep.promedio.toFixed(1)} · ${rep.total} reseña${rep.total === 1 ? "" : "s"}` : "Sin calificaciones"}
                </p>
              </div>
              <span className="text-right text-xs text-stone-400">Miembro desde<br />{fecha(autor.registro)}</span>
            </div>
            <div className="mt-4 border-t border-stone-100 pt-3 text-sm">
              {contactoVisible ? (
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${autor.telefono}`} className="btn btn-secundario btn-sm"><LuPhone /> {autor.telefono}</a>
                  <a href={`mailto:${autor.correo}`} className="btn btn-secundario btn-sm"><LuMail /> {autor.correo}</a>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-stone-500"><LuLock className="shrink-0" /> Contacto restringido: pulsa «Estoy interesado» para ver el teléfono del proveedor.</p>
              )}
            </div>
          </div>

          {esUsuario && !propia && (
            miReporte
              ? <p className="flex items-center gap-2 text-sm text-stone-500"><LuFlag /> Ya reportaste esta publicación · Estado: <Estado estado={miReporte.estado} /></p>
              : p.estado !== "Retirada" && <button onClick={() => setReportando(true)} className="btn btn-suave self-start text-red-700 hover:bg-red-50"><LuFlag /> Reportar publicación</button>
          )}
        </div>
      </div>

      <Resenas p={p} />
      <ModalReporte p={p} abierto={reportando} onCerrar={() => setReportando(false)} conteo={reportesDe(p.id).length} />
    </article>
  );
}

/** Reporte de publicación (mockup «Reportar publicación»): un reporte por usuario, retiro automático al umbral. */
function ModalReporte({ p, abierto, onCerrar, conteo }: { p: Publicacion; abierto: boolean; onCerrar: () => void; conteo: number }) {
  const { reportar, publicacion } = useDemo();
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!motivo) return setError("Selecciona el motivo del reporte.");
    if (motivo === "Otro motivo" && !descripcion.trim()) return setError("Describe brevemente el motivo.");
    const fallo = await reportar(p.id, motivo, descripcion.trim());
    if (fallo) return setError(fallo);
    setEnviado(true);
  }
  function cerrar() { setMotivo(""); setDescripcion(""); setError(""); setEnviado(false); onCerrar(); }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo={enviado ? "Reporte enviado" : "Reportar publicación"}>
      {enviado ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <LuCircleCheck className="size-12 text-lime-600" />
          <p className="font-semibold text-green-900">Gracias por ayudar a mantener segura la comunidad.</p>
          <p className="text-sm text-stone-600">Estado del reporte: <Estado estado="Pendiente" /> El administrador lo revisará pronto.</p>
          {publicacion(p.id)?.estado === "Retirada" && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">La publicación alcanzó {UMBRAL_REPORTES} reportes y fue retirada automáticamente.</p>
          )}
          <button onClick={cerrar} className="btn btn-primario mt-2">Entendido</button>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="space-y-4">
          <p className="text-sm text-stone-600">¿Por qué quieres reportar «{p.titulo}»? Solo puedes reportar una vez cada publicación.</p>
          <fieldset className="space-y-2">
            <legend className="label">Motivo del reporte</legend>
            {MOTIVOS_REPORTE.map((m) => (
              <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${motivo === m ? "border-lime-500 bg-lime-50" : "border-stone-200 hover:bg-stone-50"}`}>
                <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => { setMotivo(m); setError(""); }} className="accent-green-800" /> {m}
              </label>
            ))}
          </fieldset>
          <label className="block">
            <span className="label">Descripción {motivo === "Otro motivo" ? "(obligatoria)" : "(opcional)"}</span>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={300} rows={3} className="input resize-none" placeholder="Cuéntanos qué viste..." />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <p className="text-xs text-stone-500">Reportes actuales: {conteo} de {UMBRAL_REPORTES}. Al llegar a {UMBRAL_REPORTES}, la publicación se retira automáticamente.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={cerrar} className="btn btn-secundario">Cancelar</button>
            <button className="btn btn-peligro"><LuFlag /> Enviar reporte</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/** Calificaciones y reseñas de la publicación, con registro tras confirmar interacción presencial. */
function Resenas({ p }: { p: Publicacion }) {
  const { yo, calificaciones, usuario, calificar } = useDemo();
  const [presencial, setPresencial] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const resenas = calificaciones.filter((c) => c.publicacionId === p.id);
  const promedio = resenas.length ? resenas.reduce((s, c) => s + c.puntuacion, 0) / resenas.length : 0;
  const yaCalifico = resenas.some((c) => c.autorId === yo?.id);
  const puede = yo?.rol === "usuario" && yo.id !== p.usuarioId && !yaCalifico;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!presencial) return setError("Confirma que tuviste una interacción presencial con el proveedor.");
    if (!puntuacion) return setError("Selecciona de 1 a 5 estrellas.");
    if (!comentario.trim()) return setError("Escribe un comentario breve.");
    await calificar(p.id, puntuacion, comentario.trim());
    setPresencial(false); setPuntuacion(0); setComentario(""); setError("");
  }

  return (
    <section id="resenas" className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="card h-fit p-5">
        <h2 className="mb-3 text-lg font-bold text-green-900">Calificaciones</h2>
        <p className="text-5xl font-black text-green-900">{resenas.length ? promedio.toFixed(1) : "–"}</p>
        <Estrellas valor={promedio} size="size-5" />
        <p className="mb-4 text-sm text-stone-500">{resenas.length} reseña{resenas.length === 1 ? "" : "s"}</p>
        <Barras color="bg-amber-400" datos={[5, 4, 3, 2, 1].map((n) => ({ etiqueta: `${n} estrella${n === 1 ? "" : "s"}`, valor: resenas.filter((c) => c.puntuacion === n).length }))} />
      </div>

      <div className="space-y-4">
        {puede ? (
          <form onSubmit={enviar} noValidate className="card space-y-3 p-5">
            <h3 className="font-bold text-green-900">Califica tu experiencia</h3>
            <label className="flex items-start gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={presencial} onChange={(e) => setPresencial(e.target.checked)} className="mt-0.5 size-4 accent-green-800" />
              Confirmo que realicé una interacción presencial con este proveedor (compra, venta o intercambio).
            </label>
            <fieldset disabled={!presencial} className="space-y-3 disabled:opacity-50">
              <Estrellas valor={puntuacion} onChange={setPuntuacion} size="size-7" />
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={100} rows={2} className="input resize-none" placeholder="Comentario (máx. 100 caracteres)" />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-stone-400">{comentario.length}/100</span>
                <button className="btn btn-primario">Enviar calificación</button>
              </div>
            </fieldset>
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          </form>
        ) : yo?.rol === "usuario" && (
          <p className="card p-4 text-sm text-stone-500">{yaCalifico ? "Ya calificaste esta publicación. ¡Gracias por tu opinión!" : "No puedes calificar tus propias publicaciones."}</p>
        )}

        {resenas.length === 0 ? (
          <Vacio icono={LuMessageSquare} titulo="Aún no hay reseñas" texto="Las reseñas aparecen después de una interacción presencial con el proveedor." />
        ) : resenas.map((c) => {
          const autor = usuario(c.autorId);
          return (
            <div key={c.id} className="card flex gap-3 p-4">
              <Avatar usuario={autor} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 font-semibold text-green-900">{nombreCompleto(autor)} <Estrellas valor={c.puntuacion} size="size-3.5" /></p>
                <p className="text-sm text-stone-700">{c.comentario}</p>
                <p className="mt-1 text-xs text-stone-400">{hace(c.fecha)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
