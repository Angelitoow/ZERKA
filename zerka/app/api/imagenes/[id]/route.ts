import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ImageModel } from "@/models/Image";
import mongoose from "mongoose";

/**
 * GET /api/imagenes/[id]
 * Devuelve la imagen almacenada en MongoDB por su ObjectId.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    await dbConnect();

    const img = await ImageModel.findById(id);
    if (!img) {
      return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
    }

    return new NextResponse(img.data, {
      headers: {
        "Content-Type": img.mimetype,
        "Content-Disposition": `inline; filename="${img.filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error al obtener imagen de MongoDB:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

