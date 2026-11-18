"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import type { NuevaPublicacion } from "../context/DemoStore";

export async function guardarPublicacionDB(datos: NuevaPublicacion & { id?: number }): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id")?.value;

    if (!userIdCookie) {
      return { success: false, error: "Debes iniciar sesión para publicar." };
    }

    const usuarioId = parseInt(userIdCookie, 10);

    // 1. Resolver Categoría
    let categoriaId = 1;
    if (datos.categoria) {
      const c = await prisma.categoria.findFirst({
        where: { nombre_categoria: { contains: datos.categoria, mode: "insensitive" } },
      });
      if (c) categoriaId = c.pkid_categoria;
      else {
        const primeraCat = await prisma.categoria.findFirst();
        if (primeraCat) categoriaId = primeraCat.pkid_categoria;
      }
    }

    // 2. Resolver Barrio
    let barrioId = 1;
    if (datos.barrio) {
      const b = await prisma.barrio.findFirst({
        where: { nombre_barrio: { contains: datos.barrio, mode: "insensitive" } },
      });
      if (b) barrioId = b.pkid_barrio;
      else {
        const primerB = await prisma.barrio.findFirst();
        if (primerB) barrioId = primerB.pkid_barrio;
      }
    }

    // 3. Resolver Visibilidad
    let visibilidadId = 1;
    const v = await prisma.visibilidadcontacto.findFirst({
      where: {
        tipo_visibilidadcontacto: {
          contains: datos.visibilidad === "Restringido" ? "priv" : "pub",
          mode: "insensitive",
        },
      },
    });
    if (v) visibilidadId = v.pkid_visibilidadcontacto;

    // 4. Resolver Estado (Activa)
    let estadoId = 1;
    const e = await prisma.estadopublicacion.findFirst({
      where: { tipo_estadopublicacion: { contains: "activ", mode: "insensitive" } },
    });
    if (e) estadoId = e.pkid_estadopublicacion;

    // Si ya existe id -> Actualizar
    if (datos.id) {
      const pubId = datos.id;
      await prisma.$transaction(async (tx) => {
        await tx.publicacion.update({
          where: { pkid_publicacion: pubId },
          data: {
            titulo_publicacion: datos.titulo.trim(),
            descripcion_publicacion: datos.descripcion.trim(),
            fkidcategoria_publicacion: categoriaId,
            fkidbarrio_publicacion: barrioId,
            fkidvisibilidadcontacto_publicacion: visibilidadId,
          },
        });

        await tx.imagen.deleteMany({ where: { fkidpublicacion_imagen: pubId } });
        for (const img of datos.imagenes ?? []) {
          const urlFinal = img.startsWith("blob:") || img.startsWith("data:") ? "" : img.slice(0, 60);
          if (urlFinal) {
            await tx.imagen.create({
              data: {
                fkidpublicacion_imagen: pubId,
                url_imagen: urlFinal,
              },
            });
          }
        }

        if (datos.tipo === "Producto") {
          await tx.producto.upsert({
            where: { pfkidpublicacion_producto: pubId },
            update: { precio_producto: datos.precio ?? 0 },
            create: { pfkidpublicacion_producto: pubId, precio_producto: datos.precio ?? 0 },
          });
        } else if (datos.tipo === "Servicio") {
          const mod = await tx.modalidadservicio.findFirst();
          await tx.servicio.upsert({
            where: { pfkidpublicacion_servicio: pubId },
            update: { precio_servicio: datos.precio ?? 0, experiencia_servicio: "General" },
            create: { pfkidpublicacion_servicio: pubId, precio_servicio: datos.precio ?? 0, experiencia_servicio: "General", fkidmodalidadservicio_servicio: mod?.pkid_modalidadservicio ?? 1 },
          });
        } else if (datos.tipo === "Trueque") {
          await tx.trueque.upsert({
            where: { pfkidpublicacion_trueque: pubId },
            update: { objetodeseado_trueque: (datos.cambio ?? "Intercambio abierto").slice(0, 50) },
            create: { pfkidpublicacion_trueque: pubId, objetodeseado_trueque: (datos.cambio ?? "Intercambio abierto").slice(0, 50) },
          });
        }
      });

      return { success: true, id: pubId };
    }

    // Crear nueva publicación
    const resultado = await prisma.$transaction(async (tx) => {
      const pub = await tx.publicacion.create({
        data: {
          fkidusuario_publicacion: usuarioId,
          fkidcategoria_publicacion: categoriaId,
          fkidbarrio_publicacion: barrioId,
          fkidvisibilidadcontacto_publicacion: visibilidadId,
          fkestadopublicacion_publicacion: estadoId,
          titulo_publicacion: datos.titulo.trim().slice(0, 70),
          descripcion_publicacion: datos.descripcion.trim(),
        },
      });

      const pubId = pub.pkid_publicacion;

      if (datos.tipo === "Producto") {
        await tx.producto.create({
          data: {
            pfkidpublicacion_producto: pubId,
            precio_producto: datos.precio ?? 0,
          },
        });
      } else if (datos.tipo === "Servicio") {
        const mod = await tx.modalidadservicio.findFirst();
        await tx.servicio.create({
          data: {
            pfkidpublicacion_servicio: pubId,
            fkidmodalidadservicio_servicio: mod?.pkid_modalidadservicio ?? 1,
            precio_servicio: datos.precio ?? 0,
            experiencia_servicio: "General",
          },
        });
      } else if (datos.tipo === "Trueque") {
        await tx.trueque.create({
          data: {
            pfkidpublicacion_trueque: pubId,
            objetodeseado_trueque: (datos.cambio ?? "Intercambio abierto").slice(0, 50),
          },
        });
      }

      // Guardar imágenes: la URL es "/api/imagenes/<mongoId>" (~39 chars, cabe en VARCHAR(60))
      if (datos.imagenes && datos.imagenes.length > 0) {
        for (const img of datos.imagenes) {
          // Solo guardar URLs válidas (no blob: ni data:)
          const urlFinal = img.startsWith("blob:") || img.startsWith("data:") ? "" : img.slice(0, 60);
          if (urlFinal) {
            await tx.imagen.create({
              data: {
                fkidpublicacion_imagen: pubId,
                url_imagen: urlFinal,
              },
            });
          }
        }
      }

      return pub;
    });

    return { success: true, id: resultado.pkid_publicacion };
  } catch (error) {
    console.error("Error al guardar publicación en BD:", error);
    return { success: false, error: "Ocurrió un error al guardar la publicación en la base de datos." };
  }
}
