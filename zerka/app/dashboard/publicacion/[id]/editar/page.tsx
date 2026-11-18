"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LuLock } from "react-icons/lu";
import { useDemo } from "@/app/context/DemoStore";
import PublicacionForm from "@/app/components/PublicacionForm";
import { Vacio } from "@/app/components/ui";

export default function EditarPublicacion() {
  const { id } = useParams<{ id: string }>();
  const { yo, publicacion } = useDemo();
  const p = publicacion(Number(id));
  if (!p || p.usuarioId !== yo?.id)
    return <Vacio icono={LuLock} titulo="No puedes editar esta publicación" texto="Solo quien la creó puede modificarla."><Link href="/dashboard/mis-publicaciones" className="btn btn-primario">Ir a mis publicaciones</Link></Vacio>;
  return <PublicacionForm key={p.id} existente={p} />;
}
