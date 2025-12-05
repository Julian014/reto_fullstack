const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const colaboradoresRoutes = require('./routes/colaboradores');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();




const app = express();
const PORT = 3000;

// Helpers para formatear fechas (display e inputs tipo="date")
function formatDateDisplay(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 🔹 Transporter REAL usando tus variables de entorno
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // Gmail con 587 usa STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// (Opcional pero útil para ver si la config está bien)
mailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error verificando el transporter SMTP:', error);
  } else {
    console.log('✅ Servidor SMTP listo para enviar correos');
  }
});




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // para formularios

// 🔹 Motor de vistas: HBS
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Probar conexión
pool.query('SELECT 1 AS test', (err) => {
  if (err) console.log('❌ Error SQL:', err);
  else console.log('✅ Conexión MySQL OK');
});

// Home → redirige a /colaboradores
app.get('/', (req, res) => {
  res.redirect('/colaboradores');
});




// Vista HTML con HBS: todo en la misma página (colaboradores + calendario + alertas)
app.get('/colaboradores', (req, res) => {
  const { tipoOnboarding, estado, desde, hasta, nombre, correo } = req.query;

  // -----------------------------
  // 1) Consultar colaboradores (con filtros)
  // -----------------------------
  let sqlColab = 'SELECT * FROM colaboradores WHERE 1=1';
  const paramsColab = [];

  if (tipoOnboarding === 'bienvenida') {
    if (estado === 'completado') sqlColab += ' AND onboarding_bienvenida = 1';
    if (estado === 'pendiente')  sqlColab += ' AND onboarding_bienvenida = 0';
  }

  if (tipoOnboarding === 'tecnico') {
    if (estado === 'completado') sqlColab += ' AND onboarding_tecnico = 1';
    if (estado === 'pendiente')  sqlColab += ' AND onboarding_tecnico = 0';
  }

  // 🔎 Filtro por nombre (LIKE, insensible a mayúsculas)
  if (nombre && nombre.trim() !== '') {
    sqlColab += ' AND LOWER(nombre) LIKE ?';
    paramsColab.push(`%${nombre.toLowerCase()}%`);
  }

  // 🔎 Filtro por correo (LIKE, insensible a mayúsculas)
  if (correo && correo.trim() !== '') {
    sqlColab += ' AND LOWER(correo) LIKE ?';
    paramsColab.push(`%${correo.toLowerCase()}%`);
  }

  pool.query(sqlColab, paramsColab, (errColab, colaboradores) => {
    if (errColab) {
      console.error('❌ Error cargando colaboradores:', errColab);
      return res.status(500).send('Error cargando colaboradores');
    }

    // -----------------------------
    // 2) Consultar calendario (con posible filtro por rango de fechas)
    // -----------------------------
    let sqlCal = `
      SELECT *,
             DATEDIFF(fecha_fin, fecha_inicio) + 1 AS duracion_dias
      FROM onboardings_tecnicos
      WHERE 1=1
    `;
    const paramsCal = [];

    // Filtro por rango de fechas (opcional)
    if (desde) {
      sqlCal += ' AND fecha_inicio >= ?';
      paramsCal.push(desde);
    }

    if (hasta) {
      sqlCal += ' AND fecha_fin <= ?';
      paramsCal.push(hasta);
    }

    sqlCal += ' ORDER BY fecha_inicio';

    pool.query(sqlCal, paramsCal, (errCal, sesiones) => {
      if (errCal) {
        console.error('❌ Error cargando calendario:', errCal);
        return res.status(500).send('Error cargando calendario');
      }

      // -----------------------------
      // 3) Consultar sesiones que generan alerta (una semana antes)
      // -----------------------------
      const sqlAlertas = `
        SELECT *,
               DATEDIFF(fecha_inicio, CURDATE()) AS dias_para_inicio
        FROM onboardings_tecnicos
        WHERE DATEDIFF(fecha_inicio, CURDATE()) = 7
      `;

      pool.query(sqlAlertas, (errAlertas, alertas) => {
        if (errAlertas) {
          console.error('❌ Error consultando alertas:', errAlertas);
          return res.status(500).send('Error consultando alertas');
        }

        if (alertas.length > 0) {
          console.log('📧 [SIMULACIÓN] Estas sesiones deberían generar alerta una semana antes:');
          console.log(alertas);
        }

        // -----------------------------
        // 4) Formatear datos para la vista
        // -----------------------------
        const colaboradoresFmt = colaboradores.map((c) => ({
          ...c,
          fecha_ingreso_display: formatDateDisplay(c.fecha_ingreso),
          fecha_onboarding_tecnico_display: formatDateDisplay(c.fecha_onboarding_tecnico),
          fecha_ingreso_input: formatDateInput(c.fecha_ingreso),
          fecha_onboarding_tecnico_input: formatDateInput(c.fecha_onboarding_tecnico)
        }));

        const sesionesFmt = sesiones.map((s) => ({
          ...s,
          fecha_inicio_display: formatDateDisplay(s.fecha_inicio),
          fecha_fin_display: formatDateDisplay(s.fecha_fin)
        }));

        const alertasFmt = alertas.map((a) => ({
          ...a,
          fecha_inicio_display: formatDateDisplay(a.fecha_inicio),
          fecha_fin_display: formatDateDisplay(a.fecha_fin)
        }));

        res.render('colaboradores', {
          colaboradores: colaboradoresFmt,
          sesiones: sesionesFmt,
          alertas: alertasFmt,
          // flags para manejar selects en la vista (sin helpers extra)
          tieneFiltroTipo: !!tipoOnboarding,
          esBienvenida: tipoOnboarding === 'bienvenida',
          esTecnico: tipoOnboarding === 'tecnico',
          tieneFiltroEstado: !!estado,
          estadoCompletado: estado === 'completado',
          estadoPendiente: estado === 'pendiente',
          // filtros de texto (nombre/correo) para mantener en los inputs
          filtroNombre: nombre || '',
          filtroCorreo: correo || '',
          // filtros de calendario (por si luego los quieres usar en value="")
          filtroDesde: desde || '',
          filtroHasta: hasta || ''
        });
      });
    });
  });
});



// Crear colaborador desde el formulario de la vista
app.post('/colaboradores/crear', (req, res) => {
  const { nombre, correo, fecha_ingreso, fecha_onboarding_tecnico } = req.body;

  const sql = `
    INSERT INTO colaboradores
      (nombre, correo, fecha_ingreso, onboarding_bienvenida, onboarding_tecnico, fecha_onboarding_tecnico)
    VALUES (?, ?, ?, 0, 0, ?)
  `;

  const fechaOnb = fecha_onboarding_tecnico && fecha_onboarding_tecnico.trim() !== ''
    ? fecha_onboarding_tecnico
    : null;

  pool.query(sql, [nombre, correo, fecha_ingreso, fechaOnb], (err) => {
    if (err) {
      console.error('❌ Error al crear colaborador:', err);
      return res.status(500).send('Error al crear colaborador');
    }
    res.redirect('/colaboradores');
  });
});

// Marcar onboarding (bienvenida o técnico) como completado
app.post('/colaboradores/:id/marcar', (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  let campo = null;
  if (tipo === 'bienvenida') campo = 'onboarding_bienvenida';
  if (tipo === 'tecnico') campo = 'onboarding_tecnico';

  if (!campo) {
    return res.status(400).send('Tipo de onboarding no válido');
  }

  const sql = `UPDATE colaboradores SET ${campo} = 1 WHERE id = ?`;

  pool.query(sql, [id], (err) => {
    if (err) {
      console.error('❌ Error al actualizar estado de onboarding:', err);
      return res.status(500).send('Error al actualizar estado');
    }
    res.redirect('/colaboradores');
  });
});

// Actualizar colaborador (edición desde la misma vista)
app.post('/colaboradores/:id/actualizar', (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    correo,
    fecha_ingreso,
    fecha_onboarding_tecnico,
    onboarding_bienvenida,
    onboarding_tecnico
  } = req.body;

  const bienvenidaVal = onboarding_bienvenida ? 1 : 0;
  const tecnicoVal = onboarding_tecnico ? 1 : 0;
  const fechaOnb = fecha_onboarding_tecnico && fecha_onboarding_tecnico.trim() !== ''
    ? fecha_onboarding_tecnico
    : null;

  const sql = `
    UPDATE colaboradores
    SET nombre = ?, correo = ?, fecha_ingreso = ?,
        onboarding_bienvenida = ?, onboarding_tecnico = ?,
        fecha_onboarding_tecnico = ?
    WHERE id = ?
  `;

  pool.query(
    sql,
    [nombre, correo, fecha_ingreso, bienvenidaVal, tecnicoVal, fechaOnb, id],
    (err) => {
      if (err) {
        console.error('❌ Error al actualizar colaborador:', err);
        return res.status(500).send('Error al actualizar colaborador');
      }
      res.redirect('/colaboradores');
    }
  );
});

// Crear sesión de onboarding técnico (gestionar calendario desde la misma página)
app.post('/calendario/crear', (req, res) => {
  const {
    nombre,
    capitulo,
    fecha_inicio,
    fecha_fin,
    responsable_nombre,
    responsable_correo
  } = req.body;

  const sql = `
    INSERT INTO onboardings_tecnicos (nombre, capitulo, fecha_inicio, fecha_fin, responsable_nombre, responsable_correo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  pool.query(sql, [nombre, capitulo, fecha_inicio, fecha_fin, responsable_nombre, responsable_correo], (err) => {
    if (err) {
      console.error('❌ Error al crear sesión de onboarding técnico:', err);
      return res.status(500).send('Error al crear sesión de onboarding técnico');
    }
    res.redirect('/colaboradores');
  });
});

// Función compartida para enviar/simular alertas (usada por botón manual y por CRON)
function ejecutarEnvioAlertas() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *,
             DATEDIFF(fecha_inicio, CURDATE()) AS dias_para_inicio
      FROM onboardings_tecnicos
      WHERE DATEDIFF(fecha_inicio, CURDATE()) = 7
        AND responsable_correo IS NOT NULL
        AND responsable_correo <> ''
    `;

    pool.query(sql, async (err, filas) => {
      if (err) {
        console.error('❌ Error consultando alertas para envío:', err);
        return reject(err);
      }

      if (!filas.length) {
        console.log('✉️ [ALERTAS] No hay sesiones que requieran envío de correo hoy.');
        return resolve();
      }

      // Simulación o envío real según configuración SMTP
      for (const sesion of filas) {
        const para = sesion.responsable_correo;
        const asunto = `Recordatorio onboarding técnico: ${sesion.nombre}`;
        const mensajeTexto = `
Hola ${sesion.responsable_nombre || ''},

Este es un recordatorio automático de que la sesión de onboarding técnico "${sesion.nombre}" 
comienza en una semana.

• Capítulo: ${sesion.capitulo || 'N/A'}
• Fecha inicio: ${sesion.fecha_inicio}
• Fecha fin: ${sesion.fecha_fin}

Saludos,
Sistema de Onboarding
        `.trim();

        if (canSendRealEmail && mailTransporter) {
          try {
            await mailTransporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER,
              to: para,
              subject: asunto,
              text: mensajeTexto
            });
            console.log(`✉️ [ENVIADO] Alerta enviada a ${para} para la sesión "${sesion.nombre}"`);
          } catch (e) {
            console.error(`❌ Error enviando correo a ${para}:`, e);
          }
        } else {
          // Modo simulación: solo imprimir en consola
          console.log('✉️ [SIMULACIÓN] Se enviaría correo a:', para);
          console.log('Asunto:', asunto);
          console.log('Mensaje:\n', mensajeTexto);
        }
      }

      resolve();
    });
  });
}

// Enviar alertas reales o simuladas a responsables (sesiones que comienzan en 7 días) - vía botón manual
app.post('/alertas/enviar', async (req, res) => {
  try {
    await ejecutarEnvioAlertas();
    res.redirect('/colaboradores#alertas');
  } catch (e) {
    return res.status(500).send('Error consultando alertas para envío');
  }
});

// CRON: ejecutar automáticamente todos los días a las 09:00 (hora del servidor)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ [CRON] Ejecutando tarea diaria de envío de alertas de onboarding técnico...');
  try {
    await ejecutarEnvioAlertas();
  } catch (e) {
    console.error('❌ [CRON] Error ejecutando envío de alertas:', e);
  }
});

// Simulación de alertas (sesiones que comienzan en 7 días)
app.get('/alertas/simular', (req, res) => {
  const sql = `
    SELECT * 
    FROM onboardings_tecnicos 
    WHERE DATEDIFF(fecha_inicio, CURDATE()) = 7
  `;

  pool.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error consultando alertas:', err);
      return res.status(500).send('Error consultando alertas');
    }

    // Aquí podrías en un futuro enviar correo real.
    console.log('📧 Estas sesiones deberían generar alerta:', rows);
    res.render('alertas', { sesiones: rows });
  });
});

// Enviar alerta/manual para una sola sesión seleccionada
app.post('/alertas/enviar-uno', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).send('ID de sesión requerido');
  }

  const sql = `
    SELECT *
    FROM onboardings_tecnicos
    WHERE id = ?
  `;

  pool.query(sql, [id], async (err, filas) => {
    if (err) {
      console.error('❌ Error consultando sesión para envío manual:', err);
      return res.status(500).send('Error consultando sesión para envío manual');
    }

    if (!filas.length) {
      console.log('✉️ [ALERTAS] No se encontró la sesión indicada para envío manual.');
      return res.redirect('/colaboradores#alertas');
    }

    const sesion = filas[0];
    const para = sesion.responsable_correo;

    if (!para) {
      console.log('✉️ [ALERTAS] La sesión seleccionada no tiene correo de responsable configurado.');
      return res.redirect('/colaboradores#alertas');
    }

    const asunto = `Recordatorio onboarding técnico: ${sesion.nombre}`;
    const mensajeTexto = `
Hola ${sesion.responsable_nombre || ''},

Este es un recordatorio automático de la sesión de onboarding técnico "${sesion.nombre}".

• Capítulo: ${sesion.capitulo || 'N/A'}
• Fecha inicio: ${sesion.fecha_inicio}
• Fecha fin: ${sesion.fecha_fin}

(Este recordatorio fue disparado manualmente desde el panel de alertas.)

Saludos,
Sistema de Onboarding
    `.trim();

    try {
      await mailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: para,
        subject: asunto,
        text: mensajeTexto,
      });

      console.log(`✉️ [ENVIADO - MANUAL] Alerta enviada a ${para} para la sesión "${sesion.nombre}"`);
    } catch (e) {
      console.error(`❌ Error enviando correo manual a ${para}:`, e);
      // Si quieres informar fallo al usuario:
      // return res.status(500).send('No se pudo enviar el correo');
    }

    res.redirect('/colaboradores#alertas');
  });
});





// API REST
app.use('/api/colaboradores', colaboradoresRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});