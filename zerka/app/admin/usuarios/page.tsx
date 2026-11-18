"use client";
import { useState } from "react";
import { LuSearchX, LuUserCheck, LuUserX } from "react-icons/lu";
import type { Usuario } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { fecha, nombreCompleto } from "@/app/lib/utils";
import { Encabezado, Tabla } from "@/app/components/admin";
import { Avatar, Estado, Estrellas, usePaginacion, Vacio } from "@/app/components/ui";

/** Gestión visual de usuarios: consulta y suspensión simulada (la cuenta suspendida no puede iniciar sesión). */
export default function AdminUsuarios() {
  const { usuarios, publicaciones, reputacion, actualizarUsuario, confirmar, notificar } = useDemo();
  const [q, setQ] = useState("");
  const lista = usuarios.filter((u) => `${nombreCompleto(u)} ${u.correo} ${u.barrio}`.toLowerCase().includes(q.toLowerCase()));
  const { visibles, controles } = usePaginacion(lista, 10, q);

  async function alternar(u: Usuario) {
    const suspender = u.activo;
    if (!(await confirmar({ titulo: suspender ? `¿Suspender a ${nombreCompleto(u)}?` : `¿Reactivar a ${nombreCompleto(u)}?`, peligro: suspender,
      aceptar: suspender ? "Suspender" : "Reactivar", mensaje: suspender ? "No podrá iniciar sesión mientras dure la demostración." : "Podrá volver a iniciar sesión." }))) return;
    actualizarUsuario(u.id, { activo: !suspender });
    notificar(suspender ? "Usuario suspendido." : "Usuario reactivado.");
  }

  return (
    <>
      <Encabezado titulo="Usuarios" subtitulo={`${usuarios.filter((u) => u.rol === "usuario").length} usuarios registrados · ${usuarios.filter((u) => !u.activo).length} suspendidos`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo o barrio..." className="input mb-4 max-w-sm" aria-label="Buscar usuarios" />
      {lista.length === 0 ? <Vacio icono={LuSearchX} titulo="No existen datos para mostrar" texto="Ningún usuario coincide con la búsqueda." /> : (
        <>
          <Tabla columnas={["Usuario", "Teléfono", "Barrio", "Rol", "Publicaciones", "Reputación", "Registro", "Estado", "Acción"]}>
            {visibles.map((u) => {
              const rep = reputacion(u.id);
              return (
                <tr key={u.id} className="hover:bg-lime-50/40">
                  <td><div className="flex items-center gap-3"><Avatar usuario={u} /><div><b className="block">{nombreCompleto(u)}</b><span className="text-xs text-stone-500">{u.correo}</span></div></div></td>
                  <td>{u.telefono}</td>
                  <td>{u.barrio}</td>
                  <td>{u.rol === "admin" ? "Superusuario" : "Usuario"}</td>
                  <td>{publicaciones.filter((p) => p.usuarioId === u.id).length}</td>
                  <td className="whitespace-nowrap">{rep.total ? <><Estrellas valor={rep.promedio} size="size-3" /> {rep.promedio.toFixed(1)}</> : "—"}</td>
                  <td className="whitespace-nowrap">{fecha(u.registro)}</td>
                  <td><Estado estado={u.activo ? "Activo" : "Suspendido"} /></td>
                  <td>{u.rol === "admin" ? <span className="text-xs text-stone-400">—</span>
                    : <button onClick={() => alternar(u)} className={`btn btn-sm ${u.activo ? "text-red-600 hover:bg-red-50" : "btn-secundario"}`}>
                      {u.activo ? <><LuUserX /> Suspender</> : <><LuUserCheck /> Reactivar</>}
                    </button>}
                  </td>
                </tr>
              );
            })}
          </Tabla>
          {controles}
        </>
      )}
    </>
  );
}
