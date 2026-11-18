"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LuCamera, LuKeyRound, LuLock, LuMessageSquare, LuPencil, LuStore } from "react-icons/lu";
import { BARRIOS, CIUDADES, GENEROS, type Usuario } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { enfocarError, fecha, hace, nombreCompleto, REGLAS, validarPersona, type Errores } from "@/app/lib/utils";
import { Grid } from "./PublicacionCard";
import { Avatar, Campo, Estrellas, Vacio } from "./ui";

type Editables = Pick<Usuario, "nombres" | "apellidos" | "telefono" | "genero" | "nacimiento" | "ciudad" | "barrio">;

function DatosPersonales({ yo }: { yo: Usuario }) {
  const { actualizarUsuario, confirmar, notificar } = useDemo();
  const [editando, setEditando] = useState(false);
  const [d, setD] = useState<Editables>(yo);
  const [errores, setErrores] = useState<Errores<Editables>>({});
  const campo = (k: keyof Editables) => ({ value: d[k], className: "input", onChange: (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value }) });

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const err = validarPersona(d);
    setErrores(err);
    if (Object.keys(err).length) { enfocarError(); return notificar("Hay campos vacíos o con formato incorrecto.", "error"); }
    if (!(await confirmar({ titulo: "¿Guardar los cambios del perfil?", mensaje: "Tus datos se actualizarán en todas las pantallas.", aceptar: "Guardar" }))) return;
    const { nombres, apellidos, telefono, genero, nacimiento, ciudad, barrio } = d; // solo campos editables
    await actualizarUsuario(yo.id, { nombres: nombres.trim(), apellidos: apellidos.trim(), telefono: telefono.replace(/\s/g, ""), genero, nacimiento, ciudad, barrio });
    setEditando(false);
    notificar("¡Perfil actualizado exitosamente!");
  }
  const filas: [string, string][] = [["Nombres", yo.nombres], ["Apellidos", yo.apellidos], ["Correo", yo.correo], ["Teléfono", yo.telefono],
    ["Género", yo.genero], ["Fecha de nacimiento", fecha(`${yo.nacimiento}T12:00:00`)], ["Ciudad", yo.ciudad], ["Barrio", yo.barrio]];

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-green-900">Información personal</h2>
        {!editando && <button onClick={() => { setD(yo); setErrores({}); setEditando(true); }} className="btn btn-secundario btn-sm"><LuPencil /> Editar perfil</button>}
      </div>
      {editando ? (
        <form onSubmit={guardar} noValidate className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombres" error={errores.nombres}><input {...campo("nombres")} /></Campo>
          <Campo label="Apellidos" error={errores.apellidos}><input {...campo("apellidos")} /></Campo>
          <Campo label="Teléfono" error={errores.telefono}><input {...campo("telefono")} type="tel" inputMode="numeric" /></Campo>
          <Campo label="Fecha de nacimiento" error={errores.nacimiento}><input {...campo("nacimiento")} type="date" /></Campo>
          <Campo label="Género" error={errores.genero}><select {...campo("genero")}>{GENEROS.map((g) => <option key={g}>{g}</option>)}</select></Campo>
          <Campo label="Ciudad" error={errores.ciudad}><select {...campo("ciudad")}>{CIUDADES.map((c) => <option key={c}>{c}</option>)}</select></Campo>
          <Campo label="Barrio" error={errores.barrio}><select {...campo("barrio")}><option value="">Selecciona tu barrio</option>{BARRIOS.map((b) => <option key={b}>{b}</option>)}</select></Campo>
          <Campo label="Correo electrónico" ayuda="El correo no puede modificarse."><input value={yo.correo} disabled className="input" /></Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => { setEditando(false); notificar("Acción cancelada: no se realizaron cambios.", "info"); }} className="btn btn-secundario">Cancelar</button>
            <button className="btn btn-primario">Guardar cambios</button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {filas.map(([k, v]) => <div key={k}><dt className="text-xs text-stone-500">{k}</dt><dd className="font-medium break-words text-stone-800">{v}</dd></div>)}
        </dl>
      )}
    </div>
  );
}

function CambiarClave() {
  const { cambiarClave, bloqueoClave, confirmar, notificar } = useDemo();
  const vacio = { actual: "", nueva: "", repetir: "" };
  const [c, setC] = useState(vacio);
  const [error, setError] = useState("");
  const bloqueado = bloqueoClave.hasta > 0;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!c.actual || !c.nueva || !c.repetir) return setError("Completa los tres campos.");
    if (!REGLAS.clave.test(c.nueva)) return setError("La nueva contraseña debe tener mínimo 8 caracteres, con letras y números.");
    if (c.nueva !== c.repetir) return setError("La confirmación no coincide con la nueva contraseña.");
    if (c.nueva === c.actual) return setError("La nueva contraseña debe ser diferente a la actual.");
    if (!(await confirmar({ titulo: "¿Cambiar la contraseña?", mensaje: "Usarás la nueva contraseña en tu próximo inicio de sesión.", aceptar: "Cambiar" }))) return;
    const fallo = await cambiarClave(c.actual, c.nueva);
    setError(fallo ?? "");
    if (!fallo) { setC(vacio); notificar("¡Contraseña cambiada exitosamente!"); }
  }
  const campo = (k: keyof typeof vacio, label: string) => (
    <label className="block"><span className="label">{label}</span>
      <input type="password" value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} className="input" autoComplete={k === "actual" ? "current-password" : "new-password"} />
    </label>
  );

  return (
    <form onSubmit={enviar} noValidate className="card h-fit space-y-4 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-green-900"><LuKeyRound /> Cambiar contraseña</h2>
      {bloqueado && <p role="alert" className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"><LuLock className="mt-0.5 shrink-0" /> Opción bloqueada por intentos fallidos recurrentes.</p>}
      <fieldset disabled={bloqueado} className="space-y-4 disabled:opacity-50">
        {campo("actual", "Contraseña actual")}
        {campo("nueva", "Nueva contraseña")}
        {campo("repetir", "Confirmar nueva contraseña")}
        {error && !bloqueado && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <button className="btn btn-primario w-full">Actualizar contraseña</button>
      </fieldset>
    </form>
  );
}

export default function Perfil() {
  const { yo, publicaciones, intereses, calificaciones, reportes, usuarios, usuario, reputacion, actualizarUsuario, confirmar, notificar } = useDemo();
  if (!yo) return null;
  const admin = yo.rol === "admin";
  const rep = reputacion(yo.id);
  const mias = publicaciones.filter((p) => p.usuarioId === yo.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const resenas = calificaciones.filter((c) => c.usuarioId === yo.id);
  const actividad = admin
    ? [["Reportes pendientes", reportes.filter((r) => r.estado === "Pendiente").length], ["Reportes revisados", reportes.filter((r) => r.estado !== "Pendiente").length], ["Usuarios registrados", usuarios.filter((u) => u.rol === "usuario").length]]
    : [["Publicaciones activas", mias.filter((p) => p.estado !== "Retirada").length], ["Interesados recibidos", intereses.filter((i) => mias.some((p) => p.id === i.publicacionId)).length],
      ["Intereses realizados", intereses.filter((i) => i.usuarioId === yo.id).length], ["Reseñas recibidas", rep.total]];

  async function cambiarFoto(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) return notificar("La foto debe ser JPG, PNG o WEBP de máximo 5 MB.", "error");
    if (!(await confirmar({ titulo: "¿Usar esta imagen como foto de perfil?", aceptar: "Usar foto" }))) return;
    actualizarUsuario(yo!.id, { foto: URL.createObjectURL(file) }); // yo ya fue validado arriba
    notificar("Foto de perfil actualizada.");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="card overflow-hidden">
        <div className="h-28 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(90deg, rgba(20,83,45,.9), rgba(101,163,13,.55)), url('/mural.png')" }} />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-8">
          <div className="relative -mt-12 w-fit">
            <Avatar usuario={yo} size="size-24 text-3xl ring-4 ring-white" />
            <label className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-green-900 p-2 text-white shadow hover:bg-green-800" aria-label="Cambiar foto de perfil">
              <LuCamera className="size-4" />
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { cambiarFoto(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="titulo">{nombreCompleto(yo)}</h1>
            <p className="text-sm text-stone-500">
              <span className="chip mr-2 bg-lime-100 text-green-800">{admin ? "Superusuario administrador" : "Usuario"}</span>
              {yo.barrio}, {yo.ciudad} · Miembro desde {fecha(yo.registro)}
            </p>
          </div>
          {!admin && (
            <a href="#resenas" className="flex flex-col items-start sm:items-end">
              <span className="text-3xl font-black text-green-900">{rep.total ? rep.promedio.toFixed(1) : "–"}</span>
              <Estrellas valor={rep.promedio} /><span className="text-xs text-stone-500">{rep.total} reseña{rep.total === 1 ? "" : "s"}</span>
            </a>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${admin ? "sm:grid-cols-3" : "lg:grid-cols-4"}`}>
        {actividad.map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-3xl font-black text-green-900">{v}</p><p className="text-sm text-stone-500">{k}</p></div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <DatosPersonales key={yo.id} yo={yo} />
        <CambiarClave />
      </div>

      {!admin && (<>
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-green-900">Mis publicaciones</h2>
            <Link href="/dashboard/mis-publicaciones" className="btn btn-suave"><LuStore /> Gestionar</Link>
          </div>
          {mias.length ? <Grid items={mias} porPagina={4} /> : <Vacio icono={LuStore} titulo="No hay publicaciones" texto="Tus publicaciones aparecerán aquí." />}
        </section>

        <section id="resenas" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-bold text-green-900">Reseñas recibidas</h2>
          {resenas.length === 0 ? <Vacio icono={LuMessageSquare} titulo="Aún no tienes reseñas" /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {resenas.map((c) => (
                <div key={c.id} className="card flex gap-3 p-4">
                  <Avatar usuario={usuario(c.autorId)} />
                  <div><p className="flex flex-wrap items-center gap-2 font-semibold text-green-900">{nombreCompleto(usuario(c.autorId))} <Estrellas valor={c.puntuacion} size="size-3.5" /></p>
                    <p className="text-sm text-stone-700">{c.comentario}</p><p className="text-xs text-stone-400">{hace(c.fecha)}</p></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>)}
    </div>
  );
}
