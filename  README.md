# 🚀 Reto Fullstack – Sistema de Gestión de Onboarding

Aplicación web fullstack desarrollada para el reto técnico solicitado.  
Permite gestionar de forma completa el onboarding de nuevos colaboradores, desde su registro hasta el seguimiento del onboarding técnico, incluyendo calendario, estado de procesos y alertas automáticas por correo.

## 📝 **Descripción general**

Este sistema centraliza la gestión del onboarding en una sola interfaz moderna y clara.  
Incluye:

- Registro de colaboradores
- Dashboard de visualización
- Calendario de sesiones técnicas
- Envío manual de recordatorios
- Envío automático de alertas 7 días antes
- Edición inline
- CRUD completo
- Formateo profesional de fechas

---

## 🧰 **Tecnologías utilizadas**

### **Backend**

- Node.js
- Express
- MySQL (mysql2)
- Nodemailer
- node-cron

### **Frontend**

- Handlebars (HBS)
- TailwindCSS
- HTML + JS Vanilla

### **Otros**

- Dotenv
- Git / GitHub

---

## 🌟 **Características principales**

### 🧑‍💼 **1. Registro de Colaboradores**

- CRUD completo
- Datos:
  - Nombre
  - Correo
  - Fecha de ingreso
  - Fecha de onboarding técnico (opcional)
  - Estados de onboarding (bienvenida / técnico)

---

### 📊 **2. Dashboard**

- Vista general de todos los colaboradores
- Filtros por:
  - Tipo de onboarding (bienvenida / técnico)
  - Estado (completado / pendiente)
- Edición en línea
- Botones para marcar onboarding como completado

---

### 📅 **3. Calendario Técnico**

- Crear sesiones técnicas:
  - Nombre
  - Capítulo
  - Responsable
  - Correo responsable
  - Fechas
- Cálculo automático de duración
- Botón **Recordar** para enviar correo manual

---

### ✉️ **4. Alertas por correo**

- Envío **manual** desde el calendario
- Envío **automático** (via cron) 7 días antes de la fecha de inicio
- Se permite:
  - Envío real (SMTP)
  - Envío simulado (console.log) si no hay SMTP configurado

---
