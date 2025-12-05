# 🚀 Reto Fullstack – Sistema de Gestión de Onboarding

Aplicación web fullstack desarrollada para el reto técnico.  
Permite gestionar el onboarding de colaboradores, llevar el calendario técnico, enviar alertas por correo y administrar todo desde una interfaz moderna.

---

# 📘 Índice

- [Descripción General](#-descripción-general)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Requerimientos Previos](#-requerimientos-previos)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Variables de Entorno](#-variables-de-entorno)
- [Script SQL](#-script-sql)
- [Características Principales](#-características-principales)
- [Simulación y Evidencia de Correo](#-simulación-y-evidencia-de-correo)
- [Rutas Principales del Backend](#-rutas-principales-del-backend)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 📝 Descripción General

Este sistema centraliza la gestión del onboarding de nuevos colaboradores:

- Registro completo de colaboradores
- Dashboard con filtros por estado, tipo de onboarding, nombre y correo
- Calendario de sesiones técnicas
- Alertas automáticas por correo 7 días antes
- Envío manual de recordatorios
- CRUD completo
- Edición inline
- Diseño moderno con TailwindCSS

---

## 🧰 Tecnologías Utilizadas

### Backend

- Node.js
- Express
- MySQL (mysql2)
- Nodemailer
- node-cron

### Frontend

- HTML + CSS
- Handlebars (HBS)
- TailwindCSS
- JS vanilla

### Otros

- Dotenv
- Git / GitHub

---

## 🏗 Arquitectura del Proyecto

- **HBS** renderiza todo desde el servidor.
- **MySQL** almacena colaboradores y sesiones de onboarding técnico.
- **node-cron** ejecuta diariamente verificación de sesiones que están a 7 días.
- **Nodemailer** envía correos reales o simulados.
- **TailwindCSS** maneja el diseño visual.

---

## 📦 Requerimientos Previos

Asegúrate de tener instalado:

- Node.js 18+
- MySQL 5.7+ o MySQL 8
- Git

---

## ▶️ Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```
git clone https://github.com/Julian014/reto_fullstack.git
cd reto_fullstack
```

### 2️⃣ Instalar dependencias

```
npm install
```

### 3️⃣ Crear base de datos

Ejecuta `sql/schema.sql` en MySQL:

```
mysql -u root -p < sql/schema.sql
```

### 4️⃣ Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=onboarding_app

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_clave

PORT=8080
```

### 5️⃣ Iniciar el servidor

```
npm start
```

Servidor disponible en:

👉 http://localhost:8080/colaboradores

---

## 🔐 Variables de Entorno

| Variable    | Descripción      |
| ----------- | ---------------- |
| DB_HOST     | Host de MySQL    |
| DB_USER     | Usuario de MySQL |
| DB_PASSWORD | Contraseña       |
| DB_NAME     | Nombre BD        |
| SMTP_HOST   | Servidor SMTP    |
| SMTP_USER   | Correo emisor    |
| SMTP_PASS   | Contraseña SMTP  |
| PORT        | Puerto app       |

---

## 🗄 Script SQL

Este es el script exacto utilizado en el sistema:

```
CREATE DATABASE IF NOT EXISTS onboarding_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE onboarding_app;

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
);

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
);
```

---

## 🌟 Características Principales

### 🧑‍💼 Registro de Colaboradores

- CRUD completo
- Filtros por:
  - Tipo de onboarding
  - Estado
  - Nombre
  - Correo

---

### 📊 Dashboard

- Vista global
- Tabla dinámica
- Formateo profesional de fechas
- Edición rápida

---

### 📅 Calendario Técnico

- Crear sesiones con:
  - Nombre
  - Capítulo
  - Fechas
  - Responsable
- Cálculo automático de duración
- Botón de enviar recordatorio

---

### ✉️ Alertas Automáticas

- Envío automático de correos 7 días antes
- Envío manual desde el calendario
- Modo real y modo simulación por consola

---

## ✉️ Simulación y Evidencia de Correo

El sistema soporta dos modos:

### 🔴 **Modo real**

Se envían correos reales vía SMTP.

### 🟡 **Modo simulación**

Si SMTP no está configurado, el sistema imprime en consola:

```
[SIMULACIÓN] Se enviaría correo a: responsable@example.com
```

Esto cumple con la evidencia solicitada para el reto.

---

## 🔌 Rutas Principales del Backend

| Ruta                        | Método | Descripción            |
| --------------------------- | ------ | ---------------------- |
| `/colaboradores`            | GET    | Dashboard + calendario |
| `/colaboradores/crear`      | POST   | Registrar colaborador  |
| `/colaboradores/:id/marcar` | POST   | Marcar estado          |
| `/calendario/crear`         | POST   | Crear sesión           |
| `/alertas/enviar-uno`       | POST   | Enviar correo manual   |
| `/alertas/simular`          | GET    | Simulación de alertas  |

---

## 📂 Estructura del Proyecto

```
onboarding-app/
│
├── src/
│   ├── index.js
│   ├── routes/
│   ├── views/
│   │   ├── colaboradores.hbs
│   │   ├── layout.hbs
│   ├── public/
│
├── sql/
│   └── schema.sql
│
├── .env (no incluido)
├── package.json
├── README.md
```

---

## ✅ Estado

Proyecto funcional, deployado y demostrable con video, capturas y evidencia real de alertas.

---

## 👨‍💻 Autor

Carlos Julián Serna Amaya  
GitHub: **@Julian014**
