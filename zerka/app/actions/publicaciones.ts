"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import type { EstadoPublicacion, EstadoReporte, Publicacion, Tipo, Visibilidad } from "../data/demo";

export async function obtenerPublicaciones(): Promise<Publicacion[]> {
  try {
    const pubs = await prisma.publicacion.findMany({
      include: {
        usuario: true,
        categoria: true,
        barrio: true,
        estadopublicacion: true,
        visibilidadcontacto: true,
        producto: true,
        servicio: true,
        trueque: true,
        solicitud: true,
        imagen: true,
      },
      orderBy: { fecha_publicacion: "desc" },
    });

    return pubs.map((p) => {
      let tipo: Tipo = "Producto";
      let precio: number | undefined = undefined;
      let cambio: string | undefined = undefined;

      if (p.servicio) {
        tipo = "Servicio";
        precio = p.servicio.precio_servicio;
      } else if (p.trueque) {
        tipo = "Trueque";
        cambio = p.trueque.objetodeseado_trueque;
      } else if (p.solicitud) {
        tipo = "Solicitud";
      } else if (p.producto) {
        tipo = "Producto";
        precio = Number(p.producto.precio_producto);
      }

      const estadoTexto = p.estadopublicacion.tipo_estadopublicacion.toLowerCase();
      let estado: EstadoPublicacion = "Disponible";
      if (estadoTexto.includes("retirada") || estadoTexto.includes("inactiva")) {
        estado = "Retirada";
      } else if (estadoTexto.includes("finalizada") || estadoTexto.includes("no disponible")) {
        estado = "No disponible";
      }

      const visTexto = p.visibilidadcontacto.tipo_visibilidadcontacto.toLowerCase();
      const visibilidad: Visibilidad = visTexto.includes("priv") || visTexto.includes("restring") ? "Restringido" : "Público";

      const imagenes = p.imagen.length > 0 ? p.imagen.map((img) => img.url_imagen) : ["/fondoLogin.png"];

      return {
        id: p.pkid_publicacion,
        usuarioId: p.fkidusuario_publicacion,
        tipo,
        titulo: p.titulo_publicacion,
        descripcion: p.descripcion_publicacion,
        categoria: p.categoria.nombre_categoria,
        barrio: p.barrio.nombre_barrio,
        visibilidad,
        imagenes,
        estado,
        fecha: p.fecha_publicacion.toISOString(),
        precio,
        cambio,
      };
    });
  } catch (error) {
    console.error("Error al obtener publicaciones de la BD:", error);
    return [];
  }
}

export async function obtenerIntereses(): Promise<{ usuarioId: number; publicacionId: number; fecha: string }[]> {
  try {
    const list = await prisma.interes.findMany({
      orderBy: { fecha_interes: "desc" },
    });
    return list.map((i) => ({
      usuarioId: i.pfkidusuario_interes,
      publicacionId: i.pfkidpublicacion_interes,
      fecha: i.fecha_interes.toISOString(),
    }));
  } catch (error) {
    console.error("Error al obtener intereses:", error);
    return [];
  }
}

export async function alternarInteresDB(publicacionId: number): Promise<{ success: boolean; agregado?: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id")?.value;
    if (!userIdCookie) return { success: false, error: "Debes iniciar sesión para mostrar interés." };

    const usuarioId = parseInt(userIdCookie, 10);
    const existente = await prisma.interes.findUnique({
      where: {
        pfkidusuario_interes_pfkidpublicacion_interes: {
          pfkidusuario_interes: usuarioId,
          pfkidpublicacion_interes: publicacionId,
        },
      },
    });

    if (existente) {
      await prisma.interes.delete({
        where: {
          pfkidusuario_interes_pfkidpublicacion_interes: {
            pfkidusuario_interes: usuarioId,
            pfkidpublicacion_interes: publicacionId,
          },
        },
      });
      return { success: true, agregado: false };
    } else {
      await prisma.interes.create({
        data: {
          pfkidusuario_interes: usuarioId,
          pfkidpublicacion_interes: publicacionId,
        },
      });
      return { success: true, agregado: true };
    }
  } catch (error) {
    console.error("Error al alternar interés en BD:", error);
    return { success: false, error: "No se pudo actualizar el interés en la base de datos." };
  }
}

export async function cambiarEstadoPublicacionDB(id: number, nuevoEstado: EstadoPublicacion): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar el ID del estado correspondiente
    const estados = await prisma.estadopublicacion.findMany();
    let estadoDb = estados.find((e) => {
      const t = e.tipo_estadopublicacion.toLowerCase();
      if (nuevoEstado === "Disponible") return t.includes("activ") || t.includes("disp");
      if (nuevoEstado === "No disponible") return t.includes("finaliz") || t.includes("no disp");
      if (nuevoEstado === "Retirada") return t.includes("retir");
      return false;
    });

    if (!estadoDb && estados.length > 0) estadoDb = estados[0];
    if (!estadoDb) return { success: false, error: "Estado no encontrado en la base de datos." };

    await prisma.publicacion.update({
      where: { pkid_publicacion: id },
      data: { fkestadopublicacion_publicacion: estadoDb.pkid_estadopublicacion },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado de publicación:", error);
    return { success: false, error: "No se pudo actualizar el estado en la base de datos." };
  }
}

export async function eliminarPublicacion(idPublicacion: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(userId, 10);
    const pub = await prisma.publicacion.findUnique({
      where: { pkid_publicacion: idPublicacion },
      select: { fkidusuario_publicacion: true },
    });

    if (!pub || pub.fkidusuario_publicacion !== usuarioId) {
      return { error: "No tienes permiso para eliminar esta publicación" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.imagen.deleteMany({ where: { fkidpublicacion_imagen: idPublicacion } });
      await tx.interes.deleteMany({ where: { pfkidpublicacion_interes: idPublicacion } });
      await tx.reporte.deleteMany({ where: { fkidpublicacion_reporte: idPublicacion } });
      await tx.producto.deleteMany({ where: { pfkidpublicacion_producto: idPublicacion } });
      await tx.servicio.deleteMany({ where: { pfkidpublicacion_servicio: idPublicacion } });
      await tx.trueque.deleteMany({ where: { pfkidpublicacion_trueque: idPublicacion } });
      await tx.solicitud.deleteMany({ where: { pfkidpublicacion_solicitud: idPublicacion } });
      await tx.publicacion.delete({ where: { pkid_publicacion: idPublicacion } });
    });

    return { success: true };
  } catch (error) {
    console.error("Error eliminando publicación:", error);
    return { error: "Ocurrió un error al eliminar. Intenta de nuevo." };
  }
}

export async function reportarPublicacionDB(publicacionId: number, motivoTexto: string, descripcion: string) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id")?.value;
    if (!userIdCookie) return { error: "Debes iniciar sesión para reportar una publicación." };

    const usuarioId = parseInt(userIdCookie, 10);

    // Buscar motivo de reporte
    let motivoDb = await prisma.motivoreporte.findFirst({
      where: { tipo_motivoreporte: { contains: motivoTexto, mode: "insensitive" } },
    });
    if (!motivoDb) {
      motivoDb = await prisma.motivoreporte.findFirst();
    }
    if (!motivoDb) {
      motivoDb = await prisma.motivoreporte.create({ data: { tipo_motivoreporte: motivoTexto.slice(0, 30) } });
    }

    await prisma.reporte.create({
      data: {
        fkidusuario_reporte: usuarioId,
        fkidpublicacion_reporte: publicacionId,
        fkidmotivoreporte_reporte: motivoDb.pkid_motivoreporte,
        descripcion_reporte: descripcion.trim() || motivoTexto,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al crear reporte:", error);
    return { error: "No se pudo registrar el reporte en la base de datos." };
  }
}

export async function calificarUsuarioDB(publicacionId: number, puntuacion: number, comentario: string) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id")?.value;
    if (!userIdCookie) return { error: "Debes iniciar sesión para calificar." };

    const usuarioCalificadorId = parseInt(userIdCookie, 10);
    const pub = await prisma.publicacion.findUnique({
      where: { pkid_publicacion: publicacionId },
      select: { fkidusuario_publicacion: true },
    });

    if (!pub) return { error: "Publicación no encontrada." };

    await prisma.calificacion.create({
      data: {
        fkidusuariocalificador_calificacion: usuarioCalificadorId,
        fkidusuariocalificado_calificacion: pub.fkidusuario_publicacion,
        puntuacion_calificacion: Math.min(5, Math.max(1, Math.round(puntuacion))),
        comentario_calificacion: comentario.trim().slice(0, 100),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al calificar:", error);
    return { error: "No se pudo guardar la calificación en la base de datos." };
  }
}

export async function obtenerCalificacionesDB() {
  try {
    const cals = await prisma.calificacion.findMany({
      orderBy: { fecha_calificacion: "desc" },
    });

    return cals.map((c) => ({
      id: c.pkid_calificacion,
      autorId: c.fkidusuariocalificador_calificacion,
      usuarioId: c.fkidusuariocalificado_calificacion,
      publicacionId: 0,
      puntuacion: c.puntuacion_calificacion,
      comentario: c.comentario_calificacion,
      fecha: c.fecha_calificacion.toISOString(),
    }));
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    return [];
  }
}

export async function obtenerReportesDB(): Promise<{
  id: number;
  usuarioId: number;
  publicacionId: number;
  motivo: string;
  descripcion: string;
  fecha: string;
  estado: EstadoReporte;
  revisado?: string;
}[]> {
  try {
    const reps = await prisma.reporte.findMany({
      include: { motivoreporte: true },
      orderBy: { fecha_reporte: "desc" },
    });

    return reps.map((r) => ({
      id: r.pkid_reporte,
      usuarioId: r.fkidusuario_reporte,
      publicacionId: r.fkidpublicacion_reporte,
      motivo: r.motivoreporte.tipo_motivoreporte,
      descripcion: r.descripcion_reporte,
      fecha: r.fecha_reporte.toISOString(),
      estado: "Pendiente" as EstadoReporte,
    }));
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return [];
  }
}

export async function moderarReporteDB(reporteId: number, estado: EstadoReporte) {
  try {
    if (estado === "Aprobado") {
      const rep = await prisma.reporte.findUnique({
        where: { pkid_reporte: reporteId },
      });
      if (rep) {
        await cambiarEstadoPublicacionDB(rep.fkidpublicacion_reporte, "Retirada");
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error al moderar reporte:", error);
    return { error: "Error al actualizar la moderación." };
  }
}

export async function obtenerUsuariosDB() {
  try {
    const us = await prisma.usuario.findMany({
      include: {
        rol: true,
        barrio: { include: { ciudad: true } },
        genero: true,
        telefono: true,
      },
    });

    return us.map((u) => {
      const rolNormalizado: "admin" | "usuario" =
        u.rol.nombre_rol.toLowerCase().includes("admin") ? "admin" : "usuario";
      return {
        id: u.pkid_usuario,
        nombres: u.nombres_usuario,
        apellidos: u.apellidos_usuario,
        correo: u.correo_usuario,
        clave: u.contrasena_usuario,
        telefono: u.telefono[0]?.numero_telefono ?? "",
        ciudad: u.barrio?.ciudad?.nombre_ciudad ?? "Florencia",
        barrio: u.barrio?.nombre_barrio ?? "Centro",
        genero: u.genero?.tipo_genero ?? "Prefiero no decirlo",
        nacimiento: u.fechanacimiento_usuario ? u.fechanacimiento_usuario.toISOString().split("T")[0] : "",
        rol: rolNormalizado,
        activo: true,
        registro: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error al obtener usuarios de BD:", error);
    return [];
  }
}
