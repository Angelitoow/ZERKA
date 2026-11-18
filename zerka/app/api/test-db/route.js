export const runtime = 'nodejs';

import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany();

    return Response.json({
      ok: true,
      data: usuarios
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message
    });
  }
}