"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";

export async function obtenerPerfil() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  if (!userId) return null;

  try {
    const usuarioId = parseInt(userId, 10);
    const user = await prisma.usuario.findUnique({
      where: { pkid_usuario: usuarioId },
      include: { telefono: true },
    });

    if (!user) return null;

    return {
      nombres: user.nombres_usuario,
      apellidos: user.apellidos_usuario,
      correo: user.correo_usuario,
      telefonos: user.telefono.map((t) => ({ id: t.pkid_telefono, numero: t.numero_telefono })),
    };
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }
}

export async function actualizarPerfil(datos: { nombres: string; apellidos: string; telefonos: { id?: number; numero: string }[] }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  if (!userId) return { error: "Debes iniciar sesión para modificar tu perfil" };

  try {
    const usuarioId = parseInt(userId, 10);
    
    // Validaciones
    if (!datos.nombres?.trim() || !datos.apellidos?.trim()) {
      return { error: "Nombres y apellidos son obligatorios" };
    }

    await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      await tx.usuario.update({
        where: { pkid_usuario: usuarioId },
        data: {
          nombres_usuario: datos.nombres.trim(),
          apellidos_usuario: datos.apellidos.trim(),
        },
      });

      // Actualizar teléfonos
      const user = await tx.usuario.findUnique({
        where: { pkid_usuario: usuarioId },
        include: { telefono: true },
      });

      if (user) {
        const currentPhoneIds = user.telefono.map((t) => t.pkid_telefono);
        const updatedPhoneIds = datos.telefonos.filter((t) => t.id).map((t) => t.id as number);
        
        // Eliminar teléfonos que ya no están
        const toDelete = currentPhoneIds.filter((id) => !updatedPhoneIds.includes(id));
        if (toDelete.length > 0) {
          await tx.telefono.deleteMany({
            where: { pkid_telefono: { in: toDelete } },
          });
        }

        // Crear o actualizar teléfonos
        for (const t of datos.telefonos) {
          if (t.numero.trim()) {
            if (t.id && currentPhoneIds.includes(t.id)) {
              await tx.telefono.update({
                where: { pkid_telefono: t.id },
                data: { numero_telefono: t.numero.trim() },
              });
            } else {
              await tx.telefono.create({
                data: {
                  numero_telefono: t.numero.trim(),
                  fkidusuario_telefono: usuarioId,
                },
              });
            }
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return { error: "Error al actualizar la información. Intenta de nuevo." };
  }
}

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete("user_id");
  return { success: true };
}
