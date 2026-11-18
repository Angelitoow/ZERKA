"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, type FormEvent } from "react";
import { LuImagePlus, LuStar, LuX } from "react-icons/lu";
import { BARRIOS, CATEGORIAS, TIPOS, ilustracion, type Publicacion, type Tipo, type Visibilidad } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { enfocarError, type Errores } from "@/app/lib/utils";
import { Campo } from "./ui";

const MAX_IMAGENES = 5;
const MAX_MB = 5;
const DESCRIPCION_TIPO: Record<Tipo, string> = {
  Producto: "Vender algo",
  Servicio: "Ofrecer un servicio",
  Trueque: "Intercambiar",
  Solicitud: "Pedir lo que necesitas",
};
const EMOJI_TIPO: Record<Tipo, string> = {
  Producto: "🛍️",
  Servicio: "🛠️",
  Trueque: "🔄",
  Solicitud: "📣",
};

/** Sube archivos a MongoDB vía /api/imagenes y devuelve los ObjectIds */
async function subirImagenesMongo(archivos: File[]): Promise<string[]> {
  if (archivos.length === 0) return [];
  const formData = new FormData();
  for (const file of archivos) {
    formData.append("file", file);
  }
  const res = await fetch("/api/imagenes", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Error al subir imágenes");
  const data = await res.json();
  return data.ids as string[];
}

/** Selector de imágenes: las vistas previas son URLs locales (blob:) que solo existen durante la sesión. */
function ImagenesInput({
  imagenes,
  onChange,
  onFilesChange,
}: {
  imagenes: string[];
  onChange: (i: string[]) => void;
  onFilesChange: (files: File[]) => void;
}) {
  const [error, setError] = useState("");
  const pendingFiles = useRef<File[]>([]);

  function agregar(files: FileList | null) {
    const errores: string[] = [];
    const nuevas: string[] = [];

    Array.from(files ?? []).forEach((f) => {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
        errores.push(`«${f.name}» no es una imagen JPG, PNG o WEBP.`);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        errores.push(`«${f.name}» supera ${MAX_MB} MB.`);
        return;
      }
      const url = URL.createObjectURL(f);
      nuevas.push(url);
      pendingFiles.current.push(f);
    });

    if (imagenes.length + nuevas.length > MAX_IMAGENES) {
      errores.push(`Puedes subir máximo ${MAX_IMAGENES} imágenes.`);
    }

    const final = [...imagenes, ...nuevas].slice(0, MAX_IMAGENES);
    onChange(final);
    onFilesChange([...pendingFiles.current]);
    setError(errores.join(" "));
  }

  function quitar(src: string) {
    const idx = imagenes.indexOf(src);
    if (idx >= 0 && idx < pendingFiles.current.length) {
      pendingFiles.current.splice(idx, 1);
      onFilesChange([...pendingFiles.current]);
    }
    onChange(imagenes.filter((x) => x !== src));
  }

  return (
    <div>
      <span className="label">
        Imágenes <span className="font-normal text-stone-500">(opcional, máx. {MAX_IMAGENES} · JPG recomendado)</span>
      </span>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          agregar(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-lime-400 bg-lime-50/60 px-4 py-6 text-center text-sm text-green-900 transition hover:bg-lime-50"
      >
        <LuImagePlus className="size-8 text-lime-700" />
        <b>Selecciona o arrastra tus imágenes</b>
        <span className="text-xs text-stone-500">JPG, PNG o WEBP hasta {MAX_MB} MB. Se guardan en MongoDB.</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            agregar(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      {imagenes.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {imagenes.map((src, i) => (
            <li key={src} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${i === 0 ? "border-lime-500" : "border-stone-200"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local */}
              <img src={src} alt={`Imagen ${i + 1}`} className="size-full object-cover" />
              {i === 0 ? (
                <span className="chip absolute bottom-1 left-1 bg-lime-500 text-white">Principal</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange([src, ...imagenes.filter((x) => x !== src)])}
                  aria-label="Usar como imagen principal"
                  className="absolute bottom-1 left-1 rounded-full bg-white/90 p-1.5 text-amber-500 shadow hover:bg-white"
                >
                  <LuStar className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => quitar(src)}
                aria-label="Quitar imagen"
                className="absolute top-1 right-1 rounded-full bg-white/90 p-1.5 text-red-500 shadow hover:bg-white"
              >
                <LuX className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PublicacionForm({ existente }: { existente?: Publicacion }) {
  const router = useRouter();
  const { yo, guardarPublicacion, confirmar, notificar } = useDemo();

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  const [f, setF] = useState({
    tipo: existente?.tipo ?? ("Producto" as Tipo),
    titulo: existente?.titulo ?? "",
    descripcion: existente?.descripcion ?? "",
    categoria: existente?.categoria ?? "",
    barrio: existente?.barrio ?? yo?.barrio ?? "",
    visibilidad: existente?.visibilidad ?? ("Público" as Visibilidad),
    imagenes: existente?.imagenes ?? [],
    precio: existente?.precio?.toString() ?? "",
    cambio: existente?.cambio ?? "",
  });
  const [errores, setErrores] = useState<Errores<typeof f>>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const conPrecio = f.tipo === "Producto" || f.tipo === "Servicio";

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const err: Errores<typeof f> = {};
    if (f.titulo.trim().length < 5) err.titulo = f.titulo.trim() ? "Mínimo 5 caracteres." : "El título es obligatorio.";
    if (f.descripcion.trim().length < 10) err.descripcion = f.descripcion.trim() ? "Mínimo 10 caracteres." : "La descripción es obligatoria.";
    if (!f.categoria) err.categoria = "Selecciona una categoría: es obligatoria.";
    if (!f.barrio) err.barrio = "Selecciona el barrio.";
    if (conPrecio && f.precio && !/^\d{1,9}$/.test(f.precio)) err.precio = "Escribe solo números, sin puntos ni signos.";
    if (f.tipo === "Trueque" && !f.cambio.trim()) err.cambio = "Indica qué te gustaría recibir a cambio.";
    setErrores(err);
    if (Object.keys(err).length) {
      enfocarError();
      return notificar("Hay campos obligatorios sin completar o con formato incorrecto.", "error");
    }

    const ok = await confirmar(
      existente
        ? { titulo: "¿Guardar los cambios?", mensaje: "La publicación se actualizará en todas las vistas.", aceptar: "Guardar cambios" }
        : { titulo: "¿Publicar ahora?", mensaje: "Tu publicación será visible para la comunidad de inmediato.", aceptar: "Publicar" }
    );
    if (!ok) return;

    try {
      setSubiendo(true);

      // 1. Subir imágenes nuevas a MongoDB
      let imagenesFinales: string[] = [];
      if (pendingFiles.length > 0) {
        const mongoIds = await subirImagenesMongo(pendingFiles);
        // Cada ID de Mongo se guarda como "/api/imagenes/<id>" en PostgreSQL (cabe en VARCHAR(60))
        imagenesFinales = mongoIds.map((id) => `/api/imagenes/${id}`);
      }

      // Si no hay imágenes nuevas, usar las existentes o el placeholder
      if (imagenesFinales.length === 0) {
        imagenesFinales = f.imagenes.length ? f.imagenes : [ilustracion(EMOJI_TIPO[f.tipo], f.categoria)];
      }

      // 2. Guardar publicación en PostgreSQL
      const id = await guardarPublicacion({
        id: existente?.id,
        tipo: f.tipo,
        titulo: f.titulo.trim(),
        descripcion: f.descripcion.trim(),
        categoria: f.categoria,
        barrio: f.barrio,
        visibilidad: f.visibilidad,
        precio: conPrecio && f.precio ? Number(f.precio) : undefined,
        cambio: f.tipo === "Trueque" ? f.cambio.trim() : undefined,
        imagenes: imagenesFinales,
      });

      notificar(existente ? "¡Cambios guardados exitosamente!" : "¡Publicación creada exitosamente!");
      router.push(`/dashboard/publicacion/${id}`);
    } catch (error) {
      console.error("Error al publicar:", error);
      notificar("Ocurrió un error al guardar la publicación.", "error");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="card mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      <div>
        <h1 className="titulo">{existente ? "Editar publicación" : "Nueva publicación"}</h1>
        <p className="mt-1 text-sm text-stone-500">{existente ? "Actualiza la información y guarda los cambios." : "Comparte con tu comunidad 💚"}</p>
      </div>

      <fieldset>
        <legend className="label">¿Qué quieres publicar?</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIPOS.map(({ tipo, icono: Icono }) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setF({ ...f, tipo })}
              aria-pressed={f.tipo === tipo}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all ${f.tipo === tipo ? "border-lime-500 bg-lime-50 text-green-800 shadow-md" : "border-stone-200 bg-white text-stone-500 hover:border-lime-300"}`}
            >
              <Icono className="size-6" />
              <span className="text-sm font-bold">{tipo}</span>
              <span className="text-[11px] text-stone-400">{DESCRIPCION_TIPO[tipo]}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <Campo label="Título" error={errores.titulo} ayuda={`${f.titulo.length}/70`}>
        <input value={f.titulo} onChange={set("titulo")} maxLength={70} className="input" placeholder="¿Qué vendes, ofreces o necesitas?" />
      </Campo>
      <Campo label="Descripción" error={errores.descripcion} ayuda={`${f.descripcion.length}/500`}>
        <textarea value={f.descripcion} onChange={set("descripcion")} maxLength={500} rows={4} className="input resize-none" placeholder="Describe con detalle: estado, horarios, condiciones..." />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Categoría" error={errores.categoria}>
          <select value={f.categoria} onChange={set("categoria")} className="input">
            <option value="">Seleccionar categoría...</option>
            {CATEGORIAS.map((c) => (
              <option key={c.nombre}>{c.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Barrio (Florencia)" error={errores.barrio}>
          <select value={f.barrio} onChange={set("barrio")} className="input">
            <option value="">Seleccionar barrio...</option>
            {BARRIOS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Campo>
        {conPrecio && (
          <Campo label="Precio en COP (opcional)" error={errores.precio} ayuda="Déjalo vacío si es a convenir.">
            <input value={f.precio} onChange={set("precio")} inputMode="numeric" className="input" placeholder="Ej. 25000" />
          </Campo>
        )}
        {f.tipo === "Trueque" && (
          <Campo label="¿Qué deseas a cambio?" error={errores.cambio}>
            <input value={f.cambio} onChange={set("cambio")} maxLength={50} className="input" placeholder="Ej. Celular en buen estado" />
          </Campo>
        )}
      </div>

      <fieldset>
        <legend className="label">Visibilidad del contacto</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["Público", "Tu teléfono y correo se muestran a todos."],
            ["Restringido", "Solo quienes marquen interés verán tu contacto."],
          ] as const).map(([v, texto]) => (
            <label key={v} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-3 text-sm transition ${f.visibilidad === v ? "border-lime-500 bg-lime-50" : "border-stone-200"}`}>
              <input type="radio" name="visibilidad" checked={f.visibilidad === v} onChange={() => setF({ ...f, visibilidad: v })} className="mt-1 accent-green-800" />
              <span>
                <b className="block text-green-900">{v}</b>
                <span className="text-stone-500">{texto}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <ImagenesInput imagenes={f.imagenes} onChange={(imagenes) => setF({ ...f, imagenes })} onFilesChange={setPendingFiles} />

      <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.back()} className="btn btn-secundario">Cancelar</button>
        <button className="btn btn-primario px-8" disabled={subiendo}>
          {subiendo ? "Subiendo imágenes..." : existente ? "Guardar cambios" : "Publicar anuncio"}
        </button>
      </div>
    </form>
  );
}
