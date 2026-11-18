import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany();
    return NextResponse.json({ ok: true, data: usuarios });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener usuarios";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

