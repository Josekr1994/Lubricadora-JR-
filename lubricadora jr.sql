-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.3 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para lubricadora_jr
CREATE DATABASE IF NOT EXISTS `lubricadora_jr` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lubricadora_jr`;

-- Volcando estructura para tabla lubricadora_jr.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_categorias_usuario` (`id_usuario`),
  CONSTRAINT `fk_categorias_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lubricadora_jr.categorias: ~6 rows (aproximadamente)
INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `id_usuario`, `fecha_creacion`) VALUES
	(1, 'Aceite Motor', 'Lubricantes para motor a gasolina o diésel.', 1, '2025-11-20 15:50:58'),
	(2, 'Filtro de Aceite', 'Filtros para purificación de aceite de motor.', 1, '2025-11-20 15:50:58'),
	(3, 'Filtro de Aire', 'Filtros para purificación de aire de admisión.', 1, '2025-11-20 15:50:58'),
	(4, 'Refrigerante', 'Líquidos anticongelantes y refrigerantes para radiador.', 1, '2025-11-20 15:50:58'),
	(5, 'Grasa', 'Grasas para chasis, rodamientos y juntas.', 1, '2025-11-20 15:50:58'),
	(6, 'Aditivo', 'Aditivos para combustible o aceite.', 1, '2025-11-20 15:50:58');

-- Volcando estructura para tabla lubricadora_jr.inventario
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_marca` int DEFAULT NULL,
  `id_proveedor` int DEFAULT NULL,
  `id_categoria` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `especificacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidad` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio_venta` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `info_adicional` text COLLATE utf8mb4_unicode_ci,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_inv_marca` (`id_marca`),
  KEY `fk_inv_proveedor` (`id_proveedor`),
  KEY `fk_inv_categoria` (`id_categoria`),
  KEY `fk_inv_usuario` (`id_usuario`),
  CONSTRAINT `fk_inv_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_marca` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=242 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lubricadora_jr.inventario: ~0 rows (aproximadamente)
INSERT INTO `inventario` (`id`, `nombre`, `id_marca`, `id_proveedor`, `id_categoria`, `id_usuario`, `especificacion`, `unidad`, `costo`, `precio_venta`, `stock`, `info_adicional`, `fecha_creacion`) VALUES
	(1, 'Aceite PREMIUM JP full sintético', 2, 1, 1, NULL, 'WL7299', 'Kilo (Kg)', 20.00, 25.00, 30, 'aceite para vehiculo', '2025-11-20 17:08:07'),
	(2, 'Super Movil 20W50', 1, 1, 1, 1, 'Mineral API SL', 'Galón', 15.00, 22.50, 100, 'Aceite mineral de alta rotación para taxis.', '2025-11-20 17:27:44'),
	(3, 'Mobil 1 5W-30', 1, 1, 1, 1, 'Full Sintético', 'Cuarto (qt)', 9.50, 14.00, 48, 'Para vehículos modernos.', '2025-11-20 17:27:44'),
	(4, 'Castrol GTX 10W-30', 3, 2, 1, 1, 'Semi-Sintético', 'Galón', 18.00, 26.00, 30, 'Protección contra sedimentos.', '2025-11-20 17:27:44'),
	(5, 'Castrol Magnatec 5W-40', 3, 2, 1, 1, 'Full Sintético', 'Litro', 11.00, 16.50, 24, 'Moléculas inteligentes para arranque.', '2025-11-20 17:27:44'),
	(6, 'Shell Helix HX7 10W-40', 4, 3, 1, 1, 'Semi-Sintético', 'Litro', 7.00, 10.50, 60, 'Tecnología de limpieza activa.', '2025-11-20 17:27:44'),
	(7, 'Shell Helix Ultra 0W-20', 4, 3, 1, 1, 'Sintético Puro', 'Litro', 13.00, 19.00, 12, 'Para híbridos y motores nuevos.', '2025-11-20 17:27:44'),
	(8, 'Havoline Motor Oil 20W-50', 5, 2, 1, 1, 'Mineral', 'Cuarto (qt)', 4.50, 6.50, 80, 'Económico de buena calidad.', '2025-11-20 17:27:44'),
	(9, 'Kendall GT-1 Max 5W-20', 7, 4, 1, 1, 'Sintético con Titanio', 'Cuarto (qt)', 8.50, 12.50, 36, 'Protección extra contra desgaste.', '2025-11-20 17:27:44'),
	(10, 'Filtro Aceite Aveo/Corsa', 2, 1, 2, 1, 'Elemento Metálico', 'Unidad', 3.50, 6.00, 50, 'Compatible con Chevrolet familia 1.', '2025-11-20 17:27:44'),
	(11, 'Filtro Aceite Toyota Hilux', 10, 5, 2, 1, 'Elemento Cartucho', 'Unidad', 5.00, 8.50, 25, 'Para motores diésel D-4D.', '2025-11-20 17:27:44'),
	(12, 'Filtro Aceite Hyundai Tucson', 6, 5, 2, 1, 'Blindado', 'Unidad', 4.00, 7.00, 40, 'Serie PH9688 o equivalente.', '2025-11-20 17:27:44'),
	(13, 'Filtro Aceite Nissan Sentra', 2, 5, 2, 1, 'Blindado', 'Unidad', 3.80, 6.50, 35, 'Rosca M20x1.5.', '2025-11-20 17:27:44'),
	(14, 'Filtro Aire Grand Vitara SZ', 10, 5, 3, 1, 'Panel Plano', 'Unidad', 8.00, 14.00, 15, 'Cambio cada 10,000 km.', '2025-11-20 17:27:44'),
	(15, 'Filtro Aire Chevrolet Spark', 6, 5, 3, 1, 'Panel Pequeño', 'Unidad', 5.50, 9.00, 20, 'Modelo Spark GT.', '2025-11-20 17:27:44'),
	(16, 'Filtro Aire Kia Sportage R', 10, 4, 3, 1, 'Panel Rectangular', 'Unidad', 9.50, 16.00, 10, 'Alta eficiencia de filtrado.', '2025-11-20 17:27:44'),
	(17, 'ATF Dexron VI', 1, 1, 4, 1, 'Sintético Transmisión', 'Cuarto (qt)', 10.00, 15.00, 24, 'Para cajas automáticas GM.', '2025-11-20 17:27:44'),
	(18, 'Mercon V ATF', 3, 2, 4, 1, 'Fluido Transmisión', 'Cuarto (qt)', 9.00, 13.50, 18, 'Especificación Ford.', '2025-11-20 17:27:44'),
	(19, 'Valvulina 80W-90', 5, 3, 4, 1, 'Manual GL-5', 'Galón', 20.00, 30.00, 10, 'Para diferenciales y cajas manuales.', '2025-11-20 17:27:44'),
	(20, 'CVT Fluid Universal', 4, 4, 4, 1, 'Transmisión CVT', 'Litro', 14.00, 22.00, 8, 'Para cajas continuas Nissan/Honda.', '2025-11-20 17:27:44'),
	(21, 'Refrigerante 50/50 Verde', 8, 4, 5, 1, 'Listo para usar', 'Galón', 12.00, 18.00, 30, 'Protección anticorrosiva estándar.', '2025-11-20 17:27:44'),
	(22, 'Refrigerante Rojo Larga Vida', 8, 4, 5, 1, 'Concentrado', 'Galón', 22.00, 35.00, 12, 'Vida extendida OAT.', '2025-11-20 17:27:44'),
	(23, 'Agua Destilada', 8, 4, 5, 1, 'Desmineralizada', 'Litro', 1.00, 2.00, 50, 'Para baterías o diluir refrigerante.', '2025-11-20 17:27:44'),
	(24, 'Limpia Inyectores', 9, 1, 6, 1, 'Tanque Gasolina', 'Botella 350ml', 5.00, 8.00, 40, 'Usar cada 5,000 km.', '2025-11-20 17:27:44'),
	(25, 'Elevador de Octanaje', 1, 1, 6, 1, 'Booster', 'Botella 250ml', 6.00, 10.00, 20, 'Mejora potencia y reduce cascabeleo.', '2025-11-20 17:27:44'),
	(26, 'Limpia Motores Interno', 3, 2, 6, 1, 'Engine Flush', 'Botella 500ml', 7.00, 12.00, 15, 'Usar antes del cambio de aceite.', '2025-11-20 17:27:44'),
	(27, 'Grasa Azul Litio', 9, 3, 6, 1, 'Rodamientos', 'Kilo', 8.00, 14.00, 12, 'Alta temperatura.', '2025-11-20 17:27:44'),
	(28, 'Grasa Chasis Roja', 9, 3, 6, 1, 'Multiuso', 'Tanque 5Kg', 35.00, 55.00, 4, 'Para engrase general.', '2025-11-20 17:27:44'),
	(29, 'Líquido de Frenos DOT 4', 2, 5, 6, 1, 'Sintético', 'Botella 500ml', 4.50, 7.50, 30, 'Alto punto de ebullición.', '2025-11-20 17:27:44'),
	(30, 'Silicona Gris', 1, 1, 6, 1, 'Formador Juntas', 'Tubo', 3.00, 5.00, 25, 'Para cárter y tapas de válvulas.', '2025-11-20 17:27:44'),
	(31, 'Desengrasante Motor', 3, 2, 6, 1, 'Spray', 'Lata 400ml', 4.00, 7.00, 20, 'Limpieza externa del motor.', '2025-11-20 17:27:44');

-- Volcando estructura para tabla lubricadora_jr.marcas
CREATE TABLE IF NOT EXISTS `marcas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_marcas_usuario` (`id_usuario`),
  CONSTRAINT `fk_marcas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lubricadora_jr.marcas: ~5 rows (aproximadamente)
INSERT INTO `marcas` (`id`, `nombre`, `descripcion`, `id_usuario`, `fecha_creacion`) VALUES
	(1, 'Mobil', 'Líder en aceites sintéticos.', 1, '2025-11-20 15:50:58'),
	(2, 'Bosch', 'Componentes eléctricos y filtros de alta calidad.', 1, '2025-11-20 15:50:58'),
	(3, 'Chevron', 'Aceites y lubricantes de uso pesado.', 1, '2025-11-20 15:50:58'),
	(4, 'Prestone', 'Especialistas en refrigerantes y líquidos de frenos.', 1, '2025-11-20 15:50:58'),
	(5, 'Wix', 'Filtros de rendimiento superior.', 1, '2025-11-20 15:50:58'),
	(6, 'Castrol', 'Lubricantes premium para motores', 1, '2025-11-20 17:15:56'),
	(7, 'Shell', 'Tecnología avanzada en aceites de motor', 1, '2025-11-20 17:15:56'),
	(8, 'Havoline', 'Protección contra depósitos y desgaste', 1, '2025-11-20 17:15:56'),
	(9, 'Fram', 'Líder en filtros de aceite y aire', 1, '2025-11-20 17:15:56'),
	(10, 'Kendall', 'Aceites con aditivos de titanio líquido', 1, '2025-11-20 17:15:56');

-- Volcando estructura para tabla lubricadora_jr.proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruc` varchar(13) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `persona_contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `ruc` (`ruc`),
  KEY `fk_proveedores_usuario` (`id_usuario`),
  CONSTRAINT `fk_proveedores_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lubricadora_jr.proveedores: ~0 rows (aproximadamente)
INSERT INTO `proveedores` (`id`, `nombre`, `ruc`, `telefono`, `correo`, `persona_contacto`, `id_usuario`, `fecha_creacion`) VALUES
	(1, 'Motul', '1790000000001', '+57 601 432 5359', 'info@co.motul.com', 'Sra. Jennifer carrasco', NULL, '2025-11-20 17:06:24'),
	(2, 'Distribuidora Central', '1712345678001', '0991112222', 'ventas@central.com', 'Carlos Ruiz', 1, '2025-11-20 17:16:30'),
	(3, 'Importadora Andina', '0923456789001', '042888999', 'pedidos@andina.ec', 'María López', 1, '2025-11-20 17:16:30'),
	(4, 'Lubricantes del Valle', '1834567890001', '032555666', 'info@lubrivalle.com', 'Jorge Pérez', 1, '2025-11-20 17:16:30'),
	(5, 'Repuestos Globales', '0145678901001', '072333444', 'contacto@rglobales.com', 'Ana Torres', 1, '2025-11-20 17:16:30'),
	(6, 'Filtros y Más S.A.', '1156789012001', '0987778888', 'ventas@filtrosymas.com', 'Luis Gómez', 1, '2025-11-20 17:16:30');

-- Volcando estructura para tabla lubricadora_jr.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'vendedor',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lubricadora_jr.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre_usuario`, `clave`, `nombre_completo`, `rol`, `fecha_creacion`) VALUES
	(1, 'admin', '12345', 'Administrador Principal', 'administrador', '2025-11-20 15:50:58'),
	(2, 'vendedor1', '12345', 'Juan El Vendedor', 'vendedor', '2025-11-20 15:50:58');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
