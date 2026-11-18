import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ImageModel } from "@/models/Image";

/**
 * POST /api/imagenes
 * Recibe un FormData con uno o más campos "file" (archivos de imagen).
 * Guarda cada imagen en MongoDB y devuelve un array de ObjectIds.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const files = formData.getAll("file");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se recibieron archivos." }, { status: 400 });
    }

    const ids: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // Leer los bytes del archivo
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Guardar en MongoDB
      const doc = await ImageModel.create({
        filename: file.name,
        mimetype: file.type,
        data: buffer,
      });

      ids.push(doc._id.toString());
    }

    return NextResponse.json({ ids });
  } catch (error) {
    console.error("Error al subir imágenes a MongoDB:", error);
    return NextResponse.json({ error: "Error interno al guardar imágenes." }, { status: 500 });
  }
}

