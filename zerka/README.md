# ZERKA · Prototipo frontend

Sistema de Gestión del Comercio Informal y Servicios Locales en Florencia, Caquetá.
Prototipo navegable construido con **Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + react-icons (Lucide)**.

> ⚠️ **Este prototipo es solo frontend.** No hay backend, base de datos, API ni autenticación real.
> Todos los datos son **ficticios** y viven **en la memoria de React** durante la sesión.
> No se usa `localStorage`, `sessionStorage`, cookies ni IndexedDB, y no se hace ninguna petición `fetch`.
> **Al recargar la página todo vuelve a su estado inicial** (y la sesión simulada se cierra).

## Ejecutar

Requisitos: Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>.

El repositorio conserva sin cambios el backend previo (`app/actions/`, `app/api/`, `app/lib/prisma.ts`, `prisma/`). El prototipo **no lo importa ni lo llama**, por lo que `npm run dev` no lo necesita. `npm run build` sí compila esas rutas y, como antes de este cambio, requiere el cliente de Prisma generado (`npx prisma generate`).

## Acceso de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Superusuario administrador | `superadmin@zerka.demo` | `ZerkaDemo2026!` |
| Usuario normal (Laura Gómez) | `usuario@zerka.demo` | `UsuarioDemo2026!` |
| Otros usuarios de prueba | `carlos.ruiz@zerka.demo`, `maria.ortiz@zerka.demo`, `rosa.quintero@zerka.demo`… | `UsuarioDemo2026!` |
| Usuario suspendido (para probar el bloqueo) | `pedro.lozano@zerka.demo` | `UsuarioDemo2026!` |

El login incluye un recuadro **«Acceso de demostración»** con botones que rellenan estas credenciales. El superusuario entra al panel administrativo; el usuario normal, al inicio de exploración. Iniciar sesión como otro usuario de prueba permite ver la experiencia del proveedor (por ejemplo, la notificación de interés que recibe Carlos cuando Laura marca «Estoy interesado»).

Este acceso es solo para desarrollo y demostración: **no es un mecanismo de autenticación seguro**.

## Pantallas y rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio de sesión y registro (pestañas) + acceso de demostración |
| `/dashboard` | Inicio del usuario: exploración, búsqueda, filtros por categoría, barrio y fecha |
| `/dashboard/productos` · `/servicios` · `/trueques` · `/solicitudes` | Vista por tipo de publicación |
| `/dashboard/publicacion/[id]` | Detalle: galería, «Estoy interesado», contacto, reporte (modal), calificaciones y reseñas |
| `/dashboard/publicar` | Crear publicación (con carga de imágenes) |
| `/dashboard/publicacion/[id]/editar` | Editar publicación |
| `/dashboard/mis-publicaciones` | Mis publicaciones: editar, marcar no disponible, retirar, reactivar |
| `/dashboard/intereses` | Intereses realizados |
| `/dashboard/interesados` | Interesados en mis publicaciones, con contacto ficticio |
| `/dashboard/perfil` | Perfil: datos, edición, foto, cambio de contraseña, actividad, publicaciones y reseñas |
| `/admin` | Inicio del superusuario: indicadores, reportes pendientes, publicaciones reportadas, actividad |
| `/admin/publicaciones` | Gestión visual de publicaciones (retirar / restaurar) |
| `/admin/reportes` | Consulta y moderación de reportes (aprobar, rechazar, marcar revisado) |
| `/admin/usuarios` | Gestión visual de usuarios (suspender / reactivar) |
| `/admin/estadisticas` | Estadísticas y exportación |
| `/admin/perfil` | Perfil del superusuario |

El menú de cuenta (avatar) y la barra lateral del panel incluyen **Cerrar sesión**.

## Requisitos funcionales cubiertos

| RF | Implementación en el prototipo |
| --- | --- |
| RF-01 Registro | Ciudad, barrio, nombres, apellidos, género, nacimiento, correo, contraseña y teléfono, con errores bajo cada campo, correo duplicado y confirmación. El usuario queda registrado en memoria y puede iniciar sesión. |
| RF-02 Autenticación | Validación en el cliente, carga simulada, mensaje de éxito, redirección según rol, cierre de sesión. |
| RF-03 Perfil | Consulta y edición con confirmación; los cambios se reflejan en menús y tarjetas. Cambio de contraseña con bloqueo indicativo de 24 h al tercer intento fallido. |
| RF-04 Publicaciones | Productos, servicios, trueques y solicitudes; confirmación antes de publicar o guardar; retiro con confirmación; estados disponible, no disponible y retirada. |
| RF-05 Imágenes | Selección o arrastre, vista previa, validación de tipo y tamaño, quitar e imagen principal. Las imágenes usan `URL.createObjectURL`: no se suben a ningún servidor. |
| RF-06 Búsqueda | Texto (sin distinguir tildes), tipo, categoría, barrio, orden por fecha, limpiar filtros, carga simulada, estados vacíos y paginación. |
| RF-07 Calificaciones | Estrellas y comentario tras confirmar una interacción presencial; promedio y distribución que se recalculan; reputación en tarjetas y perfil. |
| RF-08 Interés | Botón «Estoy interesado» con contador, notificación al proveedor (derivada del estado), contacto restringido visible tras el interés y retiro del interés. |
| RF-09 Reportes | Modal con motivos, un reporte por usuario y publicación, estado del reporte y **retiro automático al llegar a 5 reportes**. |
| RF-10 Categorías | Estructura reutilizable en `app/data/demo.ts`; obligatoria en el formulario; visible en filtros, tarjetas, detalle y estadísticas. |
| RF-11 Panel y estadísticas | Indicadores y gráficos calculados del estado de la sesión. **Exportar Excel** genera un CSV en el navegador; **Exportar PDF** abre el diálogo de impresión («Guardar como PDF»). |

### Qué sigue siendo simulado

- Autenticación, sesiones, contraseñas y bloqueo de 24 h (solo en memoria; se reinician al recargar).
- Notificaciones al proveedor (se calculan a partir de los intereses, calificaciones y reportes).
- Moderación, suspensión de usuarios y retiro automático por reportes.
- La verificación de la interacción presencial antes de calificar (solo una casilla de confirmación).
- Las imágenes de las publicaciones de prueba son ilustraciones SVG locales marcadas como «Imagen de demostración».

## Organización del código

```
app/
  data/demo.ts           Datos ficticios y catálogos (tipos, categorías, barrios, motivos)
  context/DemoStore.tsx  Estado temporal compartido, acciones, avisos y confirmaciones
  lib/utils.ts           Formato (Intl), validaciones y descarga de archivos en el cliente
  components/            UI reutilizable: ui.tsx (modal <dialog>, campos, estrellas, paginación,
                         gráficos), tarjeta y formulario de publicación, perfil, encabezado,
                         barra inferior, categorías y piezas del panel administrativo
  page.tsx               Login y registro
  dashboard/             Área del usuario (layout con guardia de sesión)
  admin/                 Panel del superusuario (layout con guardia de rol)
  ui/globals.css         Tailwind y clases base (btn, input, card, chip…)
```

Se reutilizan APIs nativas en lugar de dependencias: `<dialog>` para los modales, el atributo `popover` para los menús desplegables, `Intl` para fechas y moneda, y `Blob` para la exportación.
