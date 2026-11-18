-- ========================================================================
-- SCRIPT DE INSERTS PARA POSTGRESQL (PROYECTO ZERKA)
-- Ejecuta este script en pgAdmin, DBeaver o psql si deseas restaurar
-- o poblar todos los catálogos y datos de prueba.
-- ========================================================================

-- 1. CIUDADES
INSERT INTO ciudad (pkid_ciudad, nombre_ciudad) VALUES
  (1, 'Florencia'),
  (2, 'Pitalito')
ON CONFLICT (pkid_ciudad) DO UPDATE SET nombre_ciudad = EXCLUDED.nombre_ciudad;

-- 2. BARRIOS
INSERT INTO barrio (pkid_barrio, fkidciudad_barrio, nombre_barrio) VALUES
  (1, 1, 'La Gloria'),
  (2, 1, 'Centro'),
  (3, 1, 'Atalaya'),
  (4, 1, 'Ciudadela Siglo XXI'),
  (5, 1, 'Juan XXIII'),
  (6, 1, 'La Consolata'),
  (7, 1, 'Los Pinos'),
  (8, 1, 'Pueblo Nuevo'),
  (9, 1, 'Siete de Agosto'),
  (10, 1, 'Versalles')
ON CONFLICT (pkid_barrio) DO UPDATE SET nombre_barrio = EXCLUDED.nombre_barrio;

-- 3. ROLES
INSERT INTO rol (pkid_rol, nombre_rol) VALUES
  (1, 'Administrador'),
  (2, 'Usuario')
ON CONFLICT (pkid_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;

-- 4. GÉNEROS
INSERT INTO genero (pkid_genero, tipo_genero) VALUES
  (1, 'Masculino'),
  (2, 'Femenino'),
  (3, 'Otro'),
  (4, 'Prefiero no decirlo')
ON CONFLICT (pkid_genero) DO UPDATE SET tipo_genero = EXCLUDED.tipo_genero;

-- 5. CATEGORÍAS
INSERT INTO categoria (pkid_categoria, nombre_categoria, descripcion_categoria) VALUES
  (1, 'Tecnología', 'Productos tecnológicos y electrónicos'),
  (2, 'Hogar', 'Artículos y servicios para el hogar'),
  (3, 'Alimentos y bebidas', 'Comida casera, postres y bebidas locales'),
  (4, 'Ropa y accesorios', 'Prendas de vestir, calzado y accesorios'),
  (5, 'Belleza y cuidado', 'Peluquería, cosmética y cuidado personal'),
  (6, 'Herramientas y construcción', 'Ferretería, herramientas y obras menores'),
  (7, 'Deportes', 'Artículos y servicios deportivos'),
  (8, 'Otros', 'Varios artículos y servicios generales')
ON CONFLICT (pkid_categoria) DO UPDATE SET 
  nombre_categoria = EXCLUDED.nombre_categoria,
  descripcion_categoria = EXCLUDED.descripcion_categoria;

-- 6. ESTADOS DE PUBLICACIÓN
INSERT INTO estadopublicacion (pkid_estadopublicacion, tipo_estadopublicacion) VALUES
  (1, 'Activa'),
  (2, 'Finalizada'),
  (3, 'Retirada')
ON CONFLICT (pkid_estadopublicacion) DO UPDATE SET tipo_estadopublicacion = EXCLUDED.tipo_estadopublicacion;

-- 7. ESTADOS DE REPORTE
INSERT INTO estadoreporte (pkid_estadoreporte, tipo_estadoreporte) VALUES
  (1, 'Pendiente'),
  (2, 'Revisado'),
  (3, 'Aprobado'),
  (4, 'Rechazado')
ON CONFLICT (pkid_estadoreporte) DO UPDATE SET tipo_estadoreporte = EXCLUDED.tipo_estadoreporte;

-- 8. MOTIVOS DE REPORTE
INSERT INTO motivoreporte (pkid_motivoreporte, tipo_motivoreporte) VALUES
  (1, 'Spam'),
  (2, 'Contenido ofensivo'),
  (3, 'Posible estafa o fraude'),
  (4, 'Información falsa o engañosa'),
  (5, 'Producto o servicio prohibido'),
  (6, 'Otro motivo')
ON CONFLICT (pkid_motivoreporte) DO UPDATE SET tipo_motivoreporte = EXCLUDED.tipo_motivoreporte;

-- 9. VISIBILIDAD DE CONTACTO
INSERT INTO visibilidadcontacto (pkid_visibilidadcontacto, tipo_visibilidadcontacto) VALUES
  (1, 'Publico'),
  (2, 'Privado')
ON CONFLICT (pkid_visibilidadcontacto) DO UPDATE SET tipo_visibilidadcontacto = EXCLUDED.tipo_visibilidadcontacto;

-- 10. MODALIDADES DE SERVICIO
INSERT INTO modalidadservicio (pkid_modalidadservicio, tipo_modalidadservicio) VALUES
  (1, 'Presencial'),
  (2, 'Virtual'),
  (3, 'A domicilio')
ON CONFLICT (pkid_modalidadservicio) DO UPDATE SET tipo_modalidadservicio = EXCLUDED.tipo_modalidadservicio;

-- 11. USUARIOS DE EJEMPLO
INSERT INTO usuario (pkid_usuario, fkidbarrio_usuario, fkidgenero_usuario, fkidrol_usuario, nombres_usuario, apellidos_usuario, fechanacimiento_usuario, correo_usuario, contrasena_usuario) VALUES
  (1, 1, 1, 1, 'Angel', 'Acosta', '1995-03-12', 'angel@gmail.com', 'angelitoow'),
  (2, 2, 2, 2, 'Maria', 'Lopez', '1998-07-20', 'maria@gmail.com', 'maria123'),
  (3, 1, 1, 1, 'Daniel Mauricio', 'Feria Gordillo', '1992-10-05', 'daniel@gmail.com', 'daniel123'),
  (4, 2, 1, 1, 'Sergio', 'Mosquera', '1994-01-18', 'sergio@gmail.com', 'sergio123'),
  (5, 5, 2, 2, 'Laura', 'Gómez', '1996-06-21', 'laura@zerka.com', 'laura123'),
  (6, 2, 1, 2, 'Carlos', 'Ruiz', '1987-03-02', 'carlos@zerka.com', 'carlos123')
ON CONFLICT (pkid_usuario) DO NOTHING;

-- 12. TELÉFONOS DE USUARIOS
INSERT INTO telefono (pkid_telefono, fkidusuario_telefono, numero_telefono) VALUES
  (1, 1, '3101234567'),
  (2, 2, '3119876543'),
  (3, 3, '3124567890'),
  (4, 4, '3131112233'),
  (5, 5, '3142223344'),
  (6, 6, '3153334455')
ON CONFLICT (pkid_telefono) DO NOTHING;

-- 13. PUBLICACIONES DE EJEMPLO
INSERT INTO publicacion (pkid_publicacion, fkidusuario_publicacion, fkidcategoria_publicacion, fkidbarrio_publicacion, fkidvisibilidadcontacto_publicacion, fkestadopublicacion_publicacion, titulo_publicacion, descripcion_publicacion, fecha_publicacion) VALUES
  (1, 1, 1, 1, 1, 1, 'Venta Samsung Galaxy A11', 'Celular en excelente estado con cargador original, 64GB de almacenamiento y batería de larga duración.', NOW() - INTERVAL '3 days'),
  (2, 2, 2, 2, 1, 1, 'Servicio de limpieza y mantenimiento de hogares', 'Ofrezco servicio de limpieza profunda para casas y oficinas en Florencia. Experiencia de más de 3 años.', NOW() - INTERVAL '2 days'),
  (3, 5, 3, 5, 1, 1, 'Tamales tolimenses caseros', 'Tamales tradicionales calientes todos los fines de semana. Pedidos por encargo con entrega a domicilio.', NOW() - INTERVAL '1 day'),
  (4, 6, 7, 2, 1, 1, 'Bicicleta de montaña GW Rin 29', 'Bicicleta de montaña en aluminio, 21 velocidades, frenos de disco hidráulicos. Cambio por laptop o vendo.', NOW())
ON CONFLICT (pkid_publicacion) DO NOTHING;

-- 14. SUBTIPOS DE PUBLICACIÓN (PRODUCTO, SERVICIO, TRUEQUE)
INSERT INTO producto (pfkidpublicacion_producto, precio_producto) VALUES
  (1, 350000.00),
  (3, 8000.00)
ON CONFLICT (pfkidpublicacion_producto) DO NOTHING;

INSERT INTO servicio (pfkidpublicacion_servicio, fkidmodalidadservicio_servicio, precio_servicio, experiencia_servicio) VALUES
  (2, 3, 50000, 'Más de 3 años')
ON CONFLICT (pfkidpublicacion_servicio) DO NOTHING;

INSERT INTO trueque (pfkidpublicacion_trueque, objetodeseado_trueque) VALUES
  (4, 'Laptop o tablet de gama media')
ON CONFLICT (pfkidpublicacion_trueque) DO NOTHING;

-- 15. IMÁGENES DE PUBLICACIONES
INSERT INTO imagen (pkid_imagen, fkidpublicacion_imagen, url_imagen) VALUES
  (1, 1, '/placeholder-samsung.jpg'),
  (2, 2, '/placeholder-limpieza.jpg'),
  (3, 3, '/placeholder-tamales.jpg'),
  (4, 4, '/placeholder-bici.jpg')
ON CONFLICT (pkid_imagen) DO NOTHING;

-- 16. AJUSTAR SECUENCIAS (Para evitar error de primary key duplicada en futuros inserts)
SELECT setval(pg_get_serial_sequence('ciudad', 'pkid_ciudad'), COALESCE((SELECT MAX(pkid_ciudad) FROM ciudad), 1));
SELECT setval(pg_get_serial_sequence('barrio', 'pkid_barrio'), COALESCE((SELECT MAX(pkid_barrio) FROM barrio), 1));
SELECT setval(pg_get_serial_sequence('rol', 'pkid_rol'), COALESCE((SELECT MAX(pkid_rol) FROM rol), 1));
SELECT setval(pg_get_serial_sequence('genero', 'pkid_genero'), COALESCE((SELECT MAX(pkid_genero) FROM genero), 1));
SELECT setval(pg_get_serial_sequence('categoria', 'pkid_categoria'), COALESCE((SELECT MAX(pkid_categoria) FROM categoria), 1));
SELECT setval(pg_get_serial_sequence('estadopublicacion', 'pkid_estadopublicacion'), COALESCE((SELECT MAX(pkid_estadopublicacion) FROM estadopublicacion), 1));
SELECT setval(pg_get_serial_sequence('estadoreporte', 'pkid_estadoreporte'), COALESCE((SELECT MAX(pkid_estadoreporte) FROM estadoreporte), 1));
SELECT setval(pg_get_serial_sequence('motivoreporte', 'pkid_motivoreporte'), COALESCE((SELECT MAX(pkid_motivoreporte) FROM motivoreporte), 1));
SELECT setval(pg_get_serial_sequence('visibilidadcontacto', 'pkid_visibilidadcontacto'), COALESCE((SELECT MAX(pkid_visibilidadcontacto) FROM visibilidadcontacto), 1));
SELECT setval(pg_get_serial_sequence('modalidadservicio', 'pkid_modalidadservicio'), COALESCE((SELECT MAX(pkid_modalidadservicio) FROM modalidadservicio), 1));
SELECT setval(pg_get_serial_sequence('usuario', 'pkid_usuario'), COALESCE((SELECT MAX(pkid_usuario) FROM usuario), 1));
SELECT setval(pg_get_serial_sequence('telefono', 'pkid_telefono'), COALESCE((SELECT MAX(pkid_telefono) FROM telefono), 1));
SELECT setval(pg_get_serial_sequence('publicacion', 'pkid_publicacion'), COALESCE((SELECT MAX(pkid_publicacion) FROM publicacion), 1));
SELECT setval(pg_get_serial_sequence('imagen', 'pkid_imagen'), COALESCE((SELECT MAX(pkid_imagen) FROM imagen), 1));
