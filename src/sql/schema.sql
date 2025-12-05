-- =========================================
-- CREACIÓN DE BASE DE DATOS
-- =========================================
CREATE DATABASE IF NOT EXISTS onboarding_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE onboarding_app;

-- =========================================
-- TABLA: colaboradores
-- Usada en:
--  - GET /colaboradores  (listado + filtros)
--  - POST /colaboradores/crear
--  - POST /colaboradores/:id/marcar
--  - POST /colaboradores/:id/actualizar
-- Campos usados en el código:
--  id, nombre, correo, fecha_ingreso,
--  onboarding_bienvenida, onboarding_tecnico,
--  fecha_onboarding_tecnico
-- =========================================
CREATE TABLE IF NOT EXISTS colaboradores (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    onboarding_bienvenida TINYINT(1) NOT NULL DEFAULT 0,
    onboarding_tecnico TINYINT(1) NOT NULL DEFAULT 0,
    fecha_onboarding_tecnico DATE NULL,
    PRIMARY KEY (id),
    KEY idx_colaboradores_nombre (nombre),
    KEY idx_colaboradores_correo (correo),
    KEY idx_colaboradores_fecha_ingreso (fecha_ingreso)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =========================================
-- TABLA: onboardings_tecnicos
-- Usada en:
--  - GET /colaboradores         (calendario + alertas)
--  - POST /calendario/crear     (crear sesión)
--  - ejecutarEnvioAlertas()     (envío / simulación de correos)
--  - GET /alertas/simular
--  - POST /alertas/enviar-uno
-- Campos usados en el código:
--  id, nombre, capitulo,
--  fecha_inicio, fecha_fin,
--  responsable_nombre, responsable_correo
-- =========================================
CREATE TABLE IF NOT EXISTS onboardings_tecnicos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    capitulo VARCHAR(150) NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    responsable_nombre VARCHAR(150) NULL,
    responsable_correo VARCHAR(150) NULL,
    PRIMARY KEY (id),
    KEY idx_onboardings_fecha_inicio (fecha_inicio),
    KEY idx_onboardings_fecha_fin (fecha_fin),
    KEY idx_onboardings_responsable_correo (responsable_correo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- Puedes borrarlos si no los quieres para la demo
-- =========================================

-- Colaboradores de prueba
INSERT INTO
    colaboradores (
        nombre,
        correo,
        fecha_ingreso,
        onboarding_bienvenida,
        onboarding_tecnico,
        fecha_onboarding_tecnico
    )
VALUES (
        'Juan Pérez',
        'juan.perez@example.com',
        '2025-01-10',
        1,
        0,
        NULL
    ),
    (
        'Ana López',
        'ana.lopez@example.com',
        '2025-02-05',
        0,
        0,
        NULL
    ),
    (
        'Carlos Ramírez',
        'carlos.ramirez@example.com',
        '2025-03-01',
        1,
        1,
        '2025-03-15'
    );

-- Sesiones de onboarding técnico de prueba
INSERT INTO
    onboardings_tecnicos (
        nombre,
        capitulo,
        fecha_inicio,
        fecha_fin,
        responsable_nombre,
        responsable_correo
    )
VALUES (
        'Onboarding Técnico Batch 1',
        'Módulo 1: Plataforma',
        '2025-02-15',
        '2025-02-16',
        'Líder Soporte',
        'lider.soporte@example.com'
    ),
    (
        'Onboarding Técnico Batch 2',
        'Módulo 2: Procesos',
        '2025-03-10',
        '2025-03-11',
        'Jefe Operaciones',
        'jefe.operaciones@example.com'
    );