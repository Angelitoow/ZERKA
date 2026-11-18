"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";

export interface UsuarioAutenticado {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  clave: string;
  telefono: string;
  ciudad: string;
  barrio: string;
  genero: string;
  nacimiento: string;
  rol: "admin" | "usuario";
  activo: boolean;
  registro: string;
}

export async function loginUser(correo: string, contrasena: string): Promise<{ success: boolean; user?: UsuarioAutenticado; error?: string }> {
  if (!correo?.trim() || !contrasena) {
    return { success: false, error: "Correo y contraseña son requeridos." };
  }

  try {
    const user = await prisma.usuario.findFirst({
      where: {
        correo_usuario: {
          equals: correo.trim(),
          mode: "insensitive",
        },
      },
      include: {
        rol: true,
        barrio: { include: { ciudad: true } },
        genero: true,
        telefono: true,
      },
    });

    if (!user) {
      return { success: false, error: "Correo o contraseña incorrectos." };
    }

    // Validación de contraseña (texto plano para el prototipo / compatibilidad)
    if (user.contrasena_usuario !== contrasena) {
      return { success: false, error: "Correo o contraseña incorrectos." };
    }

    // Guardar cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set("user_id", user.pkid_usuario.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    const rolNormalizado: "admin" | "usuario" =
      user.rol.nombre_rol.toLowerCase().includes("admin") ? "admin" : "usuario";

    const usuarioFormateado: UsuarioAutenticado = {
      id: user.pkid_usuario,
      nombres: user.nombres_usuario,
      apellidos: user.apellidos_usuario,
      correo: user.correo_usuario,
      clave: user.contrasena_usuario,
      telefono: user.telefono[0]?.numero_telefono ?? "",
      ciudad: user.barrio?.ciudad?.nombre_ciudad ?? "Florencia",
      barrio: user.barrio?.nombre_barrio ?? "Centro",
      genero: user.genero?.tipo_genero ?? "Prefiero no decirlo",
      nacimiento: user.fechanacimiento_usuario ? user.fechanacimiento_usuario.toISOString().split("T")[0] : "",
      rol: rolNormalizado,
      activo: true,
      registro: new Date().toISOString(),
    };

    return { success: true, user: usuarioFormateado };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Ocurrió un error al iniciar sesión en la base de datos." };
  }
}

export async function registerUser(datos: {
  nombres: string;
  apellidos: string;
  telefono: string;
  nacimiento?: string;
  genero?: string;
  ciudad?: string;
  barrio?: string;
  correo: string;
  clave: string;
}): Promise<{ success: boolean; user?: UsuarioAutenticado; error?: string }> {
  const { nombres, apellidos, telefono, nacimiento, genero, barrio, correo, clave } = datos;

  if (!nombres?.trim() || !apellidos?.trim() || !correo?.trim() || !clave) {
    return { success: false, error: "Todos los campos obligatorios deben ser completados." };
  }

  try {
    // 1. Validar que el correo no esté registrado
    const existente = await prisma.usuario.findFirst({
      where: {
        correo_usuario: {
          equals: correo.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existente) {
      return { success: false, error: "Ya existe una cuenta registrada con este correo electrónico." };
    }

    // 2. Resolver o buscar Barrio (por nombre o primer barrio disponible)
    let barrioId = 1;
    if (barrio) {
      const bDb = await prisma.barrio.findFirst({
        where: {
          nombre_barrio: {
            equals: barrio.trim(),
            mode: "insensitive",
          },
        },
      });
      if (bDb) {
        barrioId = bDb.pkid_barrio;
      } else {
        const primerBarrio = await prisma.barrio.findFirst();
        if (primerBarrio) barrioId = primerBarrio.pkid_barrio;
      }
    }

    // 3. Resolver Género
    let generoId = 1;
    if (genero) {
      const gDb = await prisma.genero.findFirst({
        where: {
          tipo_genero: {
            equals: genero.trim(),
            mode: "insensitive",
          },
        },
      });
      if (gDb) generoId = gDb.pkid_genero;
    }

    // 4. Resolver Rol (Rol "Usuario" = 2 por defecto)
    let rolId = 2;
    const rolUsuario = await prisma.rol.findFirst({
      where: {
        nombre_rol: {
          equals: "Usuario",
          mode: "insensitive",
        },
      },
    });
    if (rolUsuario) rolId = rolUsuario.pkid_rol;

    const fechaNac = nacimiento ? new Date(nacimiento) : null;

    // 5. Crear usuario y teléfono en transacción en PostgreSQL
    const nuevoUsuario = await prisma.$transaction(async (tx) => {
      const u = await tx.usuario.create({
        data: {
          nombres_usuario: nombres.trim(),
          apellidos_usuario: apellidos.trim(),
          correo_usuario: correo.trim().toLowerCase(),
          contrasena_usuario: clave,
          fechanacimiento_usuario: fechaNac && !isNaN(fechaNac.getTime()) ? fechaNac : null,
          fkidbarrio_usuario: barrioId,
          fkidrol_usuario: rolId,
          fkidgenero_usuario: generoId,
        },
        include: {
          rol: true,
          barrio: { include: { ciudad: true } },
          genero: true,
        },
      });

      if (telefono?.trim()) {
        await tx.telefono.create({
          data: {
            numero_telefono: telefono.trim(),
            fkidusuario_telefono: u.pkid_usuario,
          },
        });
      }

      return u;
    });

    // Iniciar sesión automáticamente
    const cookieStore = await cookies();
    cookieStore.set("user_id", nuevoUsuario.pkid_usuario.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const usuarioFormateado: UsuarioAutenticado = {
      id: nuevoUsuario.pkid_usuario,
      nombres: nuevoUsuario.nombres_usuario,
      apellidos: nuevoUsuario.apellidos_usuario,
      correo: nuevoUsuario.correo_usuario,
      clave: nuevoUsuario.contrasena_usuario,
      telefono: telefono?.trim() ?? "",
      ciudad: nuevoUsuario.barrio?.ciudad?.nombre_ciudad ?? "Florencia",
      barrio: nuevoUsuario.barrio?.nombre_barrio ?? "Centro",
      genero: nuevoUsuario.genero?.tipo_genero ?? "Prefiero no decirlo",
      nacimiento: nuevoUsuario.fechanacimiento_usuario ? nuevoUsuario.fechanacimiento_usuario.toISOString().split("T")[0] : "",
      rol: "usuario",
      activo: true,
      registro: new Date().toISOString(),
    };

    return { success: true, user: usuarioFormateado };
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, error: "Ocurrió un error al guardar en la base de datos." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_id");
  return { success: true };
}

export async function obtenerUsuarioActual(): Promise<UsuarioAutenticado | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id")?.value;
    if (!userIdCookie) return null;

    const id = parseInt(userIdCookie, 10);
    if (isNaN(id)) return null;

    const user = await prisma.usuario.findUnique({
      where: { pkid_usuario: id },
      include: {
        rol: true,
        barrio: { include: { ciudad: true } },
        genero: true,
        telefono: true,
      },
    });

    if (!user) return null;

    const rolNormalizado: "admin" | "usuario" =
      user.rol.nombre_rol.toLowerCase().includes("admin") ? "admin" : "usuario";

    return {
      id: user.pkid_usuario,
      nombres: user.nombres_usuario,
      apellidos: user.apellidos_usuario,
      correo: user.correo_usuario,
      clave: user.contrasena_usuario,
      telefono: user.telefono[0]?.numero_telefono ?? "",
      ciudad: user.barrio?.ciudad?.nombre_ciudad ?? "Florencia",
      barrio: user.barrio?.nombre_barrio ?? "Centro",
      genero: user.genero?.tipo_genero ?? "Prefiero no decirlo",
      nacimiento: user.fechanacimiento_usuario ? user.fechanacimiento_usuario.toISOString().split("T")[0] : "",
      rol: rolNormalizado,
      activo: true,
      registro: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error al obtener usuario de sesión:", error);
    return null;
  }
}

export async function actualizarPerfilUsuario(id: number, cambios: {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  barrio?: string;
  ciudad?: string;
  genero?: string;
  nacimiento?: string;
}) {
  try {
    let fkidbarrio: number | undefined;
    if (cambios.barrio) {
      const b = await prisma.barrio.findFirst({
        where: { nombre_barrio: { equals: cambios.barrio.trim(), mode: "insensitive" } },
      });
      if (b) fkidbarrio = b.pkid_barrio;
    }

    let fkidgenero: number | undefined;
    if (cambios.genero) {
      const g = await prisma.genero.findFirst({
        where: { tipo_genero: { equals: cambios.genero.trim(), mode: "insensitive" } },
      });
      if (g) fkidgenero = g.pkid_genero;
    }

    const fechaNac = cambios.nacimiento ? new Date(cambios.nacimiento) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { pkid_usuario: id },
        data: {
          ...(cambios.nombres && { nombres_usuario: cambios.nombres.trim() }),
          ...(cambios.apellidos && { apellidos_usuario: cambios.apellidos.trim() }),
          ...(fkidbarrio && { fkidbarrio_usuario: fkidbarrio }),
          ...(fkidgenero && { fkidgenero_usuario: fkidgenero }),
          ...(fechaNac && !isNaN(fechaNac.getTime()) && { fechanacimiento_usuario: fechaNac }),
        },
      });

      if (cambios.telefono) {
        const telExistente = await tx.telefono.findFirst({
          where: { fkidusuario_telefono: id },
        });
        if (telExistente) {
          await tx.telefono.update({
            where: { pkid_telefono: telExistente.pkid_telefono },
            data: { numero_telefono: cambios.telefono.trim() },
          });
        } else {
          await tx.telefono.create({
            data: {
              numero_telefono: cambios.telefono.trim(),
              fkidusuario_telefono: id,
            },
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { error: "No se pudo actualizar el perfil en la base de datos." };
  }
}

export async function cambiarClaveUsuario(id: number, claveNueva: string) {
  try {
    await prisma.usuario.update({
      where: { pkid_usuario: id },
      data: { contrasena_usuario: claveNueva },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return { error: "No se pudo actualizar la contraseña en la base de datos." };
  }
}
