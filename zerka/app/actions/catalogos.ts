"use server";

import { prisma } from "../lib/prisma";

export async function obtenerCatalogos() {
  try {
    const [categorias, ciudades, visibilidades, estadosPublicacion, modalidadesServicio] =
      await Promise.all([
        prisma.categoria.findMany({
          orderBy: { nombre_categoria: "asc" },
        }),
        prisma.ciudad.findMany({
          include: { barrio: { orderBy: { nombre_barrio: "asc" } } },
          orderBy: { nombre_ciudad: "asc" },
        }),
        prisma.visibilidadcontacto.findMany(),
        prisma.estadopublicacion.findMany(),
        prisma.modalidadservicio.findMany(),
      ]);

    return {
      categorias: categorias.map((c) => ({
        id: c.pkid_categoria,
        nombre: c.nombre_categoria,
      })),
      ciudades: ciudades.map((c) => ({
        id: c.pkid_ciudad,
        nombre: c.nombre_ciudad,
        barrios: c.barrio.map((b) => ({
          id: b.pkid_barrio,
          nombre: b.nombre_barrio,
        })),
      })),
      visibilidades: visibilidades.map((v) => ({
        id: v.pkid_visibilidadcontacto,
        tipo: v.tipo_visibilidadcontacto,
      })),
      estadosPublicacion: estadosPublicacion.map((e) => ({
        id: e.pkid_estadopublicacion,
        tipo: e.tipo_estadopublicacion,
      })),
      modalidadesServicio: modalidadesServicio.map((m) => ({
        id: m.pkid_modalidadservicio,
        tipo: m.tipo_modalidadservicio,
      })),
    };
  } catch (error) {
    console.error("Error al obtener catálogos:", error);
    return {
      categorias: [],
      ciudades: [],
      visibilidades: [],
      estadosPublicacion: [],
      modalidadesServicio: [],
    };
  }
}
