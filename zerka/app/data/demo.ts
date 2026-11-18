/**
 * DATOS DE DEMOSTRACIÓN — información ficticia, solo para el prototipo frontend.
 * Nada de esto representa ciudadanos ni comerciantes reales. Todo vive en memoria:
 * al recargar la página la aplicación vuelve a estos valores iniciales.
 */
import type { IconType } from "react-icons";
import {
  LuShoppingBag, LuWrench, LuRepeat, LuMegaphone, LuUtensils, LuShirt, LuHouse,
  LuSparkles, LuHammer, LuSmartphone, LuEllipsis,
} from "react-icons/lu";

export type Tipo = "Producto" | "Servicio" | "Trueque" | "Solicitud";
export type EstadoPublicacion = "Disponible" | "No disponible" | "Retirada";
export type EstadoReporte = "Pendiente" | "Revisado" | "Aprobado" | "Rechazado";
export type Visibilidad = "Público" | "Restringido";

export interface Usuario {
  id: number; nombres: string; apellidos: string; correo: string; clave: string;
  telefono: string; ciudad: string; barrio: string; genero: string; nacimiento: string;
  rol: "admin" | "usuario"; activo: boolean; registro: string; foto?: string;
}
export interface Publicacion {
  id: number; usuarioId: number; tipo: Tipo; titulo: string; descripcion: string;
  categoria: string; barrio: string; visibilidad: Visibilidad; imagenes: string[];
  estado: EstadoPublicacion; fecha: string; precio?: number; cambio?: string; motivoRetiro?: string;
}
export interface Interes { usuarioId: number; publicacionId: number; fecha: string }
export interface Reporte {
  id: number; usuarioId: number; publicacionId: number; motivo: string;
  descripcion: string; fecha: string; estado: EstadoReporte; revisado?: string;
}
export interface Calificacion {
  id: number; autorId: number; usuarioId: number; publicacionId: number;
  puntuacion: number; comentario: string; fecha: string;
}

/* ───────────── Catálogos reutilizables ───────────── */
export const TIPOS: { tipo: Tipo; slug: string; plural: string; icono: IconType }[] = [
  { tipo: "Producto", slug: "productos", plural: "Productos", icono: LuShoppingBag },
  { tipo: "Servicio", slug: "servicios", plural: "Servicios", icono: LuWrench },
  { tipo: "Trueque", slug: "trueques", plural: "Trueques", icono: LuRepeat },
  { tipo: "Solicitud", slug: "solicitudes", plural: "Solicitudes", icono: LuMegaphone },
];

export const CATEGORIAS: { nombre: string; icono: IconType; colores: [string, string] }[] = [
  { nombre: "Tecnología", icono: LuSmartphone, colores: ["#e2e8f0", "#94a3b8"] },
  { nombre: "Hogar", icono: LuHouse, colores: ["#e0f2fe", "#7dd3fc"] },
  { nombre: "Alimentos y bebidas", icono: LuUtensils, colores: ["#fef3c7", "#fcd34d"] },
  { nombre: "Ropa y accesorios", icono: LuShirt, colores: ["#fce7f3", "#f9a8d4"] },
  { nombre: "Belleza y cuidado", icono: LuSparkles, colores: ["#f3e8ff", "#d8b4fe"] },
  { nombre: "Herramientas y construcción", icono: LuHammer, colores: ["#ffedd5", "#fdba74"] },
  { nombre: "Deportes", icono: LuSparkles, colores: ["#ffedd5", "#fdba74"] },
  { nombre: "Otros", icono: LuEllipsis, colores: ["#ecfccb", "#86efac"] },
];

export const CIUDADES = ["Florencia"];
export const BARRIOS = [
  "Atalaya", "Centro", "Ciudadela Siglo XXI", "Juan XXIII", "La Consolata",
  "La Gloria", "Los Pinos", "Pueblo Nuevo", "Siete de Agosto", "Versalles",
];
export const GENEROS = ["Femenino", "Masculino", "Otro", "Prefiero no decirlo"];
export const MOTIVOS_REPORTE = [
  "Posible estafa o fraude", "Contenido inapropiado", "Información falsa o engañosa",
  "Producto o servicio prohibido", "Spam o publicación repetida", "Otro motivo",
];
export const UMBRAL_REPORTES = 5;
export const RETIRO_USUARIO = "Retirada por el usuario";

export const CREDENCIALES_DEMO = {
  admin: { correo: "angel@gmail.com", clave: "123456" },
  usuario: { correo: "maria@gmail.com", clave: "abcdef" },
};

/* ───────────── Utilidades de la semilla ───────────── */
const hace = (dias: number) => new Date(Date.now() - dias * 864e5).toISOString();

/** Ilustración SVG local (sin servicios externos) para las publicaciones de prueba. */
export function ilustracion(emoji: string, categoria: string) {
  const [a, b] = CATEGORIAS.find((c) => c.nombre === categoria)?.colores ?? ["#ecfccb", "#86efac"];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x2='1' y2='1'><stop stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><circle cx='340' cy='40' r='110' fill='#fff' opacity='.3'/><text x='200' y='158' font-size='120' text-anchor='middle' dominant-baseline='middle'>${emoji}</text><text x='388' y='288' font-size='13' text-anchor='end' fill='#14532d' opacity='.6' font-family='sans-serif'>Imagen de demostración</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const persona = (id: number, nombres: string, apellidos: string, barrio: string, genero: string, nacimiento: string, dias: number): Usuario => ({
  id, nombres, apellidos, barrio, genero, nacimiento, ciudad: "Florencia", rol: "usuario", activo: true,
  correo: `${nombres.split(" ")[0]}.${apellidos.split(" ")[0]}@zerka.demo`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
  clave: CREDENCIALES_DEMO.usuario.clave, telefono: `30000000${String(id).padStart(2, "0")}`, registro: hace(dias),
});

export const USUARIOS: Usuario[] = [
  { ...persona(1, "Super", "Administrador", "Centro", "Prefiero no decirlo", "1990-01-15", 200), rol: "admin", ...CREDENCIALES_DEMO.admin },
  { ...persona(2, "Laura", "Gómez", "Juan XXIII", "Femenino", "1995-06-21", 150), ...CREDENCIALES_DEMO.usuario },
  persona(3, "Carlos", "Ruiz", "Centro", "Masculino", "1987-03-02", 140),
  persona(4, "María Fernanda", "Ortiz", "La Gloria", "Femenino", "1992-11-09", 130),
  persona(5, "Jhon", "Pérez", "Versalles", "Masculino", "1999-08-30", 110),
  persona(6, "Diana", "Castro", "La Consolata", "Femenino", "1985-01-25", 95),
  persona(7, "Andrés", "Murcia", "Los Pinos", "Masculino", "2001-04-12", 60),
  persona(8, "Rosa", "Quintero", "Pueblo Nuevo", "Femenino", "1970-09-05", 45),
  { ...persona(9, "Pedro", "Lozano", "Atalaya", "Masculino", "1994-02-17", 20), activo: false },
];

type Semilla = Omit<Publicacion, "imagenes" | "estado" | "visibilidad" | "fecha"> &
  Partial<Pick<Publicacion, "estado" | "visibilidad" | "motivoRetiro">> & { dias: number; emojis: string[] };

const pub = ({ dias, emojis, ...p }: Semilla): Publicacion => ({
  estado: "Disponible", visibilidad: "Público", ...p, fecha: hace(dias),
  imagenes: emojis.map((e) => ilustracion(e, p.categoria)),
});

export const PUBLICACIONES: Publicacion[] = [
  pub({ id: 1, usuarioId: 2, tipo: "Producto", categoria: "Alimentos y bebidas", barrio: "Juan XXIII", dias: 1, emojis: ["🥟", "🌶️"], precio: 2500,
    titulo: "Empanadas de carne caseras", descripcion: "Empanadas de maíz rellenas de carne y papa, con ají casero. Pedidos desde 10 unidades, entrega en el barrio." }),
  pub({ id: 2, usuarioId: 2, tipo: "Servicio", categoria: "Belleza y cuidado", barrio: "Juan XXIII", dias: 4, emojis: ["💅"], precio: 25000, visibilidad: "Restringido",
    titulo: "Manicure y pedicure a domicilio", descripcion: "Servicio de manicure y pedicure tradicional y semipermanente. Atiendo de lunes a sábado con cita previa." }),
  pub({ id: 3, usuarioId: 2, tipo: "Trueque", categoria: "Hogar y reparaciones", barrio: "Juan XXIII", dias: 9, emojis: ["🥤"], cambio: "Plancha de ropa en buen estado",
    titulo: "Cambio licuadora por plancha", descripcion: "Licuadora de 3 velocidades, funciona perfectamente. Busco cambiarla por una plancha de ropa." }),
  pub({ id: 4, usuarioId: 2, tipo: "Solicitud", categoria: "Otros", barrio: "Juan XXIII", dias: 20, emojis: ["📐"], estado: "No disponible",
    titulo: "Busco profesor de matemáticas", descripcion: "Necesito clases de refuerzo de matemáticas para estudiante de grado 9, dos tardes por semana." }),
  pub({ id: 5, usuarioId: 3, tipo: "Servicio", categoria: "Hogar y reparaciones", barrio: "Centro", dias: 2, emojis: ["🔧", "🧊"], precio: 40000,
    titulo: "Reparación de neveras y lavadoras", descripcion: "Técnico con 10 años de experiencia. Diagnóstico a domicilio y repuestos con garantía." }),
  pub({ id: 6, usuarioId: 3, tipo: "Producto", categoria: "Electrónica", barrio: "Centro", dias: 6, emojis: ["🔌"], precio: 15000,
    titulo: "Cargadores y cables USB-C", descripcion: "Cargadores de carga rápida y cables USB-C de 1 y 2 metros. Pregunta por disponibilidad." }),
  pub({ id: 7, usuarioId: 4, tipo: "Producto", categoria: "Alimentos y bebidas", barrio: "La Gloria", dias: 0, emojis: ["🫓", "🧀"], precio: 3000,
    titulo: "Arepas de chócolo con queso", descripcion: "Arepas de maíz tierno con queso campesino, hechas al momento. Fines de semana desde las 7 a. m." }),
  pub({ id: 8, usuarioId: 4, tipo: "Producto", categoria: "Alimentos y bebidas", barrio: "La Gloria", dias: 3, emojis: ["🧃"], precio: 4000,
    titulo: "Jugos naturales de copoazú", descripcion: "Jugo de copoazú y arazá de la región, sin conservantes. Botella de 500 ml." }),
  pub({ id: 9, usuarioId: 5, tipo: "Servicio", categoria: "Belleza y cuidado", barrio: "Versalles", dias: 5, emojis: ["💈"], precio: 12000,
    titulo: "Corte de cabello a domicilio", descripcion: "Cortes para hombre y niño, diseños y arreglo de barba. Voy hasta tu casa." }),
  pub({ id: 10, usuarioId: 5, tipo: "Trueque", categoria: "Otros", barrio: "Versalles", dias: 8, emojis: ["🚲"], cambio: "Celular Android funcional",
    titulo: "Bicicleta rin 26 por celular", descripcion: "Bicicleta todoterreno rin 26 en buen estado, frenos nuevos. La cambio por un celular." }),
  pub({ id: 11, usuarioId: 6, tipo: "Producto", categoria: "Ropa y accesorios", barrio: "La Consolata", dias: 7, emojis: ["👜", "🧶"], precio: 45000,
    titulo: "Bolsos tejidos a mano", descripcion: "Bolsos en hilo con diseños de la Amazonía. Se hacen por encargo en los colores que prefieras." }),
  pub({ id: 12, usuarioId: 6, tipo: "Solicitud", categoria: "Herramientas y construcción", barrio: "La Consolata", dias: 1, emojis: ["💡"],
    titulo: "Necesito electricista", descripcion: "Busco electricista para instalar tres tomas y revisar el tablero de una casa." }),
  pub({ id: 13, usuarioId: 7, tipo: "Servicio", categoria: "Otros", barrio: "Los Pinos", dias: 10, emojis: ["🎸"], precio: 20000,
    titulo: "Clases de guitarra", descripcion: "Clases personalizadas de guitarra acústica para principiantes. Precio por hora." }),
  pub({ id: 14, usuarioId: 7, tipo: "Producto", categoria: "Electrónica", barrio: "Los Pinos", dias: 2, emojis: ["📱"], precio: 300000,
    titulo: "Celular de alta gama a precio de remate", descripcion: "Celular nuevo sellado, último modelo. Solo pago anticipado por transferencia." }),
  pub({ id: 15, usuarioId: 8, tipo: "Producto", categoria: "Alimentos y bebidas", barrio: "Pueblo Nuevo", dias: 3, emojis: ["🍌", "🥔"], precio: 2000,
    titulo: "Plátano y yuca de la finca", descripcion: "Plátano hartón y yuca recién cosechados. Precio por libra, pedidos por arroba." }),
  pub({ id: 16, usuarioId: 8, tipo: "Trueque", categoria: "Otros", barrio: "Pueblo Nuevo", dias: 12, emojis: ["🐔"], cambio: "Bulto de concentrado",
    titulo: "Gallinas criollas por concentrado", descripcion: "Tengo cuatro gallinas criollas ponedoras. Las cambio por un bulto de concentrado." }),
  pub({ id: 17, usuarioId: 8, tipo: "Solicitud", categoria: "Alimentos y bebidas", barrio: "Pueblo Nuevo", dias: 4, emojis: ["🧀"], visibilidad: "Restringido",
    titulo: "Busco queso campesino al por mayor", descripcion: "Compro queso campesino por kilos para venta en tienda. Escribe con tu precio." }),
  pub({ id: 18, usuarioId: 3, tipo: "Solicitud", categoria: "Hogar y reparaciones", barrio: "Centro", dias: 0, emojis: ["🚚"],
    titulo: "Necesito transporte para trasteo", descripcion: "Trasteo pequeño del Centro a Ciudadela Siglo XXI, este sábado en la mañana." }),
  pub({ id: 19, usuarioId: 4, tipo: "Servicio", categoria: "Alimentos y bebidas", barrio: "La Gloria", dias: 11, emojis: ["🎂"], precio: 60000,
    titulo: "Tortas personalizadas por encargo", descripcion: "Tortas para cumpleaños y eventos, decoración temática. Encargos con tres días de anticipación." }),
  pub({ id: 20, usuarioId: 6, tipo: "Servicio", categoria: "Ropa y accesorios", barrio: "La Consolata", dias: 14, emojis: ["✂️", "🧵"], precio: 8000,
    titulo: "Arreglos de ropa y modistería", descripcion: "Dobladillos, cremalleras, ajustes y confección sencilla. Entrega en 48 horas." }),
  pub({ id: 21, usuarioId: 5, tipo: "Producto", categoria: "Ropa y accesorios", barrio: "Versalles", dias: 16, emojis: ["👕"], precio: 25000, estado: "Retirada",
    motivoRetiro: "Retirada por moderación", titulo: "Camisetas estampadas", descripcion: "Camisetas con estampados personalizados en todas las tallas." }),
  pub({ id: 22, usuarioId: 7, tipo: "Trueque", categoria: "Otros", barrio: "Los Pinos", dias: 5, emojis: ["📚"], cambio: "Útiles escolares",
    titulo: "Libros escolares por útiles", descripcion: "Libros de primaria en buen estado. Los cambio por cuadernos, colores u otros útiles." }),
];

const int = (usuarioId: number, publicacionId: number, dias: number): Interes => ({ usuarioId, publicacionId, fecha: hace(dias) });
export const INTERESES: Interes[] = [
  int(2, 5, 1), int(2, 8, 2), int(2, 11, 3),
  int(3, 1, 0.2), int(4, 1, 0.5), int(6, 1, 0.8), int(8, 1, 0.1), int(5, 2, 2), int(7, 3, 4),
  int(3, 7, 0.3), int(4, 13, 6), int(6, 15, 1), int(7, 19, 5), int(8, 5, 1),
];

const rep = (id: number, usuarioId: number, publicacionId: number, motivo: string, descripcion: string, dias: number, estado: EstadoReporte = "Pendiente"): Reporte =>
  ({ id, usuarioId, publicacionId, motivo, descripcion, fecha: hace(dias), estado, ...(estado !== "Pendiente" && { revisado: hace(dias - 0.5) }) });
export const REPORTES: Reporte[] = [
  rep(1, 3, 14, "Posible estafa o fraude", "Pide pago anticipado y el precio no es real.", 1.5),
  rep(2, 4, 14, "Información falsa o engañosa", "", 1.2),
  rep(3, 5, 14, "Posible estafa o fraude", "Me pidió transferir antes de ver el equipo.", 1),
  rep(4, 8, 14, "Posible estafa o fraude", "", 0.6),
  rep(5, 5, 6, "Información falsa o engañosa", "Los cables no son de carga rápida como dice.", 2),
  rep(6, 6, 21, "Contenido inapropiado", "Los estampados tienen contenido ofensivo.", 10, "Aprobado"),
  rep(7, 4, 10, "Spam o publicación repetida", "", 6, "Rechazado"),
  rep(8, 7, 9, "Otro motivo", "El número de contacto no responde.", 4, "Revisado"),
];

const cal = (id: number, autorId: number, usuarioId: number, publicacionId: number, puntuacion: number, comentario: string, dias: number): Calificacion =>
  ({ id, autorId, usuarioId, publicacionId, puntuacion, comentario, fecha: hace(dias) });
export const CALIFICACIONES: Calificacion[] = [
  cal(1, 3, 2, 1, 5, "Las empanadas llegaron calientitas y muy bien sazonadas.", 3),
  cal(2, 4, 2, 1, 4, "Muy ricas, el pedido tardó un poco.", 6),
  cal(3, 5, 2, 2, 5, "Excelente atención y muy puntual.", 0.4),
  cal(4, 2, 3, 5, 5, "Arregló mi nevera el mismo día.", 5),
  cal(5, 7, 3, 5, 4, "Buen trabajo y precio justo.", 9),
  cal(6, 2, 4, 8, 5, "El jugo de copoazú es delicioso.", 2),
  cal(7, 6, 4, 7, 5, "Arepas buenísimas, volveré a pedir.", 1),
  cal(8, 8, 5, 9, 3, "Buen corte, pero llegó tarde.", 4),
  cal(9, 2, 6, 11, 5, "Bolso hermoso y resistente.", 4),
  cal(10, 3, 7, 13, 4, "Muy paciente para enseñar.", 7),
  cal(11, 4, 8, 15, 5, "Productos frescos de la finca.", 2),
];
