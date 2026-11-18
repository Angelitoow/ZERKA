"use client";
/**
 * Almacén central de estado sincronizado directamente con PostgreSQL a través de Server Actions.
 * Persiste usuarios, publicaciones, intereses, calificaciones y reportes en la base de datos real.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LuCircleCheck, LuInfo, LuTriangleAlert } from "react-icons/lu";
import {
  TIPOS, UMBRAL_REPORTES,
  type EstadoPublicacion, type EstadoReporte, type Publicacion, type Usuario,
} from "@/app/data/demo";
import { nombreCompleto } from "@/app/lib/utils";
import { Modal } from "@/app/components/ui";
import {
  loginUser,
  logoutUser,
  obtenerUsuarioActual,
  registerUser,
  actualizarPerfilUsuario,
  cambiarClaveUsuario,
} from "@/app/actions/auth";
import {
  obtenerPublicaciones,
  obtenerIntereses,
  alternarInteresDB,
  cambiarEstadoPublicacionDB,
  reportarPublicacionDB,
  calificarUsuarioDB,
  obtenerCalificacionesDB,
  obtenerReportesDB,
  moderarReporteDB,
  obtenerUsuariosDB,
} from "@/app/actions/publicaciones";
import { guardarPublicacionDB } from "@/app/actions/publicar";

type Toast = { id: number; texto: string; tipo: "exito" | "error" | "info" };
type Confirmacion = { titulo: string; mensaje?: string; aceptar?: string; peligro?: boolean };
export type Notificacion = { fecha: string; texto: string; href: string };
export type NuevaPublicacion = Omit<Publicacion, "id" | "usuarioId" | "fecha" | "estado"> & { id?: number };

const ahora = () => new Date().toISOString();
const contarPor = (ps: Publicacion[], clave: "categoria" | "barrio") =>
  Object.entries(ps.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p[clave]]: (acc[p[clave]] ?? 0) + 1 }), {}))
    .map(([etiqueta, valor]) => ({ etiqueta, valor })).sort((a, b) => b.valor - a.valor);

function useEstadoApp() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [intereses, setIntereses] = useState<{ usuarioId: number; publicacionId: number; fecha: string }[]>([]);
  const [reportes, setReportes] = useState<{ id: number; usuarioId: number; publicacionId: number; motivo: string; descripcion: string; fecha: string; estado: EstadoReporte; revisado?: string }[]>([]);
  const [calificaciones, setCalificaciones] = useState<{ id: number; autorId: number; usuarioId: number; publicacionId: number; puntuacion: number; comentario: string; fecha: string }[]>([]);
  const [yo, setYo] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [vistoHasta, setVistoHasta] = useState("");
  const [bloqueoClave, setBloqueoClave] = useState({ intentos: 0, hasta: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmacion, setConfirmacion] = useState<(Confirmacion & { resolver: (ok: boolean) => void }) | null>(null);

  // Carga inicial directa desde PostgreSQL
  useEffect(() => {
    let montado = true;
    async function sincronizarConBD() {
      try {
        const [uActual, pubs, ints, reps, cals, us] = await Promise.all([
          obtenerUsuarioActual(),
          obtenerPublicaciones(),
          obtenerIntereses(),
          obtenerReportesDB(),
          obtenerCalificacionesDB(),
          obtenerUsuariosDB(),
        ]);
        if (!montado) return;
        if (uActual) setYo(uActual);
        setPublicaciones(pubs);
        setIntereses(ints);
        setReportes(reps);
        setCalificaciones(cals);
        setUsuarios(us);
      } catch (err) {
        console.error("Error al sincronizar datos con PostgreSQL:", err);
      }
    }
    sincronizarConBD();
    return () => { montado = false; };
  }, []);

  const usuario = (id: number) => usuarios.find((u) => u.id === id) ?? {
    id,
    nombres: "Usuario",
    apellidos: "",
    correo: "",
    clave: "",
    telefono: "",
    ciudad: "Florencia",
    barrio: "Centro",
    genero: "",
    nacimiento: "",
    rol: "usuario" as const,
    activo: true,
    registro: ahora(),
  };
  const publicacion = (id: number) => publicaciones.find((p) => p.id === id);
  const interesados = (publicacionId: number) => intereses.filter((i) => i.publicacionId === publicacionId);
  const reportesDe = (publicacionId: number) => reportes.filter((r) => r.publicacionId === publicacionId && r.estado !== "Rechazado");
  const reputacion = (usuarioId: number) => {
    const cs = calificaciones.filter((c) => c.usuarioId === usuarioId);
    return { promedio: cs.length ? cs.reduce((s, c) => s + c.puntuacion, 0) / cs.length : 0, total: cs.length };
  };

  /* ───── Retroalimentación ───── */
  function notificar(texto: string, tipo: Toast["tipo"] = "exito") {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, texto, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }
  const confirmar = (c: Confirmacion) => new Promise<boolean>((resolver) => setConfirmacion({ ...c, resolver }));
  function responder(ok: boolean) {
    confirmacion?.resolver(ok);
    setConfirmacion(null);
    if (!ok) notificar("Acción cancelada.", "info");
  }

  /* ───── Sesión y cuenta conectada a PostgreSQL ───── */
  async function iniciarSesion(correo: string, clave: string): Promise<Usuario | string> {
    const res = await loginUser(correo, clave);
    if (!res.success || !res.user) {
      return res.error ?? "Correo o contraseña incorrectos.";
    }
    setYo(res.user);
    setVistoHasta("");
    setBloqueoClave({ intentos: 0, hasta: 0 });

    // Recargar datos actualizados
    const [pubs, ints, us] = await Promise.all([
      obtenerPublicaciones(),
      obtenerIntereses(),
      obtenerUsuariosDB(),
    ]);
    setPublicaciones(pubs);
    setIntereses(ints);
    setUsuarios(us);
    return res.user;
  }

  async function cerrarSesion() {
    await logoutUser();
    setYo(null);
    setBusqueda("");
  }

  async function registrar(datos: {
    nombres: string;
    apellidos: string;
    telefono: string;
    nacimiento?: string;
    genero?: string;
    ciudad?: string;
    barrio?: string;
    correo: string;
    clave: string;
  }): Promise<string | null> {
    const res = await registerUser(datos);
    if (!res.success || !res.user) {
      return res.error ?? "No se pudo registrar el usuario en la base de datos.";
    }
    setYo(res.user);
    const us = await obtenerUsuariosDB();
    setUsuarios(us);
    return null;
  }

  async function actualizarUsuario(id: number, cambios: Partial<Usuario>) {
    await actualizarPerfilUsuario(id, {
      nombres: cambios.nombres,
      apellidos: cambios.apellidos,
      telefono: cambios.telefono,
      barrio: cambios.barrio,
      ciudad: cambios.ciudad,
      genero: cambios.genero,
      nacimiento: cambios.nacimiento,
    });
    const uActual = await obtenerUsuarioActual();
    if (uActual) setYo(uActual);
    const us = await obtenerUsuariosDB();
    setUsuarios(us);
  }

  async function cambiarClave(actual: string, nueva: string): Promise<string | null> {
    if (!yo) return "Inicia sesión primero.";
    if (actual !== yo.clave) {
      const intentos = bloqueoClave.intentos + 1;
      setBloqueoClave({ intentos, hasta: intentos >= 3 ? Date.now() + 864e5 : 0 });
      return intentos >= 3
        ? "Tercer intento fallido: opción bloqueada temporalmente."
        : `La contraseña actual no es correcta. Intento ${intentos} de 3.`;
    }
    const res = await cambiarClaveUsuario(yo.id, nueva);
    if (res.error) return res.error;
    setYo({ ...yo, clave: nueva });
    setBloqueoClave({ intentos: 0, hasta: 0 });
    return null;
  }

  /* ───── Publicaciones conectadas a PostgreSQL ───── */
  async function guardarPublicacion({ id, ...datos }: NuevaPublicacion): Promise<number> {
    const res = await guardarPublicacionDB({ ...datos, id });
    if (res.success && res.id) {
      const pubs = await obtenerPublicaciones();
      setPublicaciones(pubs);
      return res.id;
    }
    throw new Error(res.error ?? "Error al guardar publicación en la base de datos.");
  }

  async function cambiarEstado(id: number, estado: EstadoPublicacion, _motivoRetiro?: string) {
    await cambiarEstadoPublicacionDB(id, estado);
    const pubs = await obtenerPublicaciones();
    setPublicaciones(pubs);
  }

  async function alternarInteres(publicacionId: number) {
    if (!yo) {
      notificar("Debes iniciar sesión para mostrar interés.", "error");
      return;
    }
    const res = await alternarInteresDB(publicacionId);
    if (res.success) {
      const ints = await obtenerIntereses();
      setIntereses(ints);
      notificar(
        res.agregado
          ? "¡Interés registrado en la base de datos!"
          : "Retiraste tu interés de la publicación.",
        res.agregado ? "exito" : "info"
      );
    } else if (res.error) {
      notificar(res.error, "error");
    }
  }

  async function reportar(publicacionId: number, motivo: string, descripcion: string): Promise<string | null> {
    const res = await reportarPublicacionDB(publicacionId, motivo, descripcion);
    if (res.error) return res.error;
    const reps = await obtenerReportesDB();
    setReportes(reps);
    if (reportesDe(publicacionId).length + 1 >= UMBRAL_REPORTES) {
      await cambiarEstado(publicacionId, "Retirada", `Retirada automáticamente por acumular reportes`);
    }
    return null;
  }

  async function moderar(reporteId: number, estado: EstadoReporte) {
    await moderarReporteDB(reporteId, estado);
    const [reps, pubs] = await Promise.all([obtenerReportesDB(), obtenerPublicaciones()]);
    setReportes(reps);
    setPublicaciones(pubs);
    notificar(estado === "Aprobado" ? "Reporte aprobado: la publicación fue retirada." : `Reporte marcado como ${estado.toLowerCase()}.`);
  }

  async function calificar(publicacionId: number, puntuacion: number, comentario: string) {
    await calificarUsuarioDB(publicacionId, puntuacion, comentario);
    const cals = await obtenerCalificacionesDB();
    setCalificaciones(cals);
    notificar("¡Gracias! Tu calificación fue registrada en PostgreSQL.");
  }

  /* ───── Notificaciones derivadas del estado de la base de datos ───── */
  const titulo = (id: number) => `«${publicacion(id)?.titulo ?? "Publicación"}»`;
  const notificaciones: Notificacion[] = !yo ? [] : (yo.rol === "admin"
    ? reportes.filter((r) => r.estado === "Pendiente").map((r) => ({ fecha: r.fecha, href: "/admin/reportes", texto: `Nuevo reporte sobre ${titulo(r.publicacionId)}: ${r.motivo}.` }))
    : [
      ...intereses.filter((i) => publicacion(i.publicacionId)?.usuarioId === yo.id)
        .map((i) => ({ fecha: i.fecha, href: "/dashboard/interesados", texto: `${nombreCompleto(usuario(i.usuarioId))} está interesado(a) en ${titulo(i.publicacionId)}.` })),
      ...calificaciones.filter((c) => c.usuarioId === yo.id)
        .map((c) => ({ fecha: c.fecha, href: "/dashboard/perfil", texto: `${nombreCompleto(usuario(c.autorId))} te calificó con ${c.puntuacion}★ en ${titulo(c.publicacionId)}.` })),
      ...reportes.filter((r) => r.usuarioId === yo.id && r.revisado)
        .map((r) => ({ fecha: r.revisado!, href: `/dashboard/publicacion/${r.publicacionId}`, texto: `Tu reporte sobre ${titulo(r.publicacionId)} fue ${r.estado.toLowerCase()}.` })),
    ]).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const sinLeer = notificaciones.filter((n) => n.fecha > vistoHasta).length;

  /* ───── Indicadores del panel administrativo ───── */
  const activas = publicaciones.filter((p) => p.estado !== "Retirada");
  const contar = (tipo: string) => activas.filter((p) => p.tipo === tipo).length;
  const estadisticas = {
    indicadores: [
      { etiqueta: "Usuarios registrados", valor: usuarios.filter((u) => u.rol === "usuario").length },
      { etiqueta: "Publicaciones reportadas", valor: new Set(reportes.map((r) => r.publicacionId)).size },
      { etiqueta: "Reportes revisados", valor: reportes.filter((r) => r.estado !== "Pendiente").length },
      { etiqueta: "Productos publicados", valor: contar("Producto") },
      { etiqueta: "Servicios ofrecidos", valor: contar("Servicio") },
      { etiqueta: "Solicitudes anunciadas", valor: contar("Solicitud") },
    ],
    porTipo: TIPOS.map((t) => ({ etiqueta: t.plural, valor: contar(t.tipo) })),
    porCategoria: contarPor(activas, "categoria"),
    porBarrio: contarPor(activas, "barrio"),
    porEstadoReporte: (["Pendiente", "Revisado", "Aprobado", "Rechazado"] as const).map((e) => ({ etiqueta: e, valor: reportes.filter((r) => r.estado === e).length })),
  };

  return {
    usuarios, publicaciones, intereses, reportes, calificaciones, yo, busqueda, setBusqueda,
    usuario, publicacion, interesados, reportesDe, reputacion, notificaciones, sinLeer, estadisticas, bloqueoClave,
    marcarLeidas: () => setVistoHasta(ahora()),
    notificar, confirmar, iniciarSesion, cerrarSesion, registrar, actualizarUsuario, cambiarClave,
    guardarPublicacion, cambiarEstado, alternarInteres, reportar, moderar, calificar,
    _ui: { toasts, confirmacion, responder },
  };
}

const Contexto = createContext<ReturnType<typeof useEstadoApp> | null>(null);

export function useDemo() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useDemo debe usarse dentro de <DemoProvider>");
  return ctx;
}

/** Guardia de rutas: sin sesión vuelve al login; sin rol admin vuelve a dashboard. */
export function useProteger(soloAdmin = false) {
  const { yo } = useDemo();
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Breve pausa para esperar que cargue la cookie de sesión en el cliente
    const timer = setTimeout(() => {
      setCargando(false);
      if (!yo) {
        router.replace("/");
      } else if (soloAdmin && yo.rol !== "admin") {
        router.replace("/dashboard");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [yo, soloAdmin, router]);

  return !cargando && !!yo && (!soloAdmin || yo.rol === "admin");
}

/** Cierra la sesión y vuelve al login. */
export function useSalir() {
  const { cerrarSesion, notificar } = useDemo();
  const router = useRouter();
  return async () => {
    await cerrarSesion();
    router.replace("/");
    notificar("Sesión cerrada correctamente.", "info");
  };
}

const ICONOS = { exito: LuCircleCheck, error: LuTriangleAlert, info: LuInfo };
const TONOS = { exito: "border-lime-300 bg-lime-50 text-green-900", error: "border-red-200 bg-red-50 text-red-800", info: "border-sky-200 bg-sky-50 text-sky-900" };

export function DemoProvider({ children }: { children: ReactNode }) {
  const demo = useEstadoApp();
  const { toasts, confirmacion, responder } = demo._ui;
  return (
    <Contexto.Provider value={demo}>
      {children}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 print:hidden">
        {toasts.map((t) => {
          const Icono = ICONOS[t.tipo];
          return (
            <p key={t.id} className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${TONOS[t.tipo]}`}>
              <Icono className="mt-0.5 size-4 shrink-0" />{t.texto}
            </p>
          );
        })}
      </div>

      <Modal abierto={!!confirmacion} onCerrar={() => confirmacion && responder(false)} titulo={confirmacion?.titulo ?? ""} ancho="max-w-md">
        {confirmacion?.mensaje && <p className="text-sm text-stone-600">{confirmacion.mensaje}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-secundario" onClick={() => responder(false)}>Cancelar</button>
          <button autoFocus className={`btn ${confirmacion?.peligro ? "btn-peligro" : "btn-primario"}`} onClick={() => responder(true)}>
            {confirmacion?.aceptar ?? "Confirmar"}
          </button>
        </div>
      </Modal>
    </Contexto.Provider>
  );
}
