const express = require('express');
const pool = require('../db');

const router = express.Router();

// Crear colaborador
router.post('/', (req, res) => {
  const {
    nombre,
    correo,
    fecha_ingreso,
    onboarding_bienvenida = 0,
    onboarding_tecnico = 0,
    fecha_onboarding_tecnico = null
  } = req.body;

  if (!nombre || !correo || !fecha_ingreso) {
    return res.status(400).json({ error: 'nombre, correo y fecha_ingreso son obligatorios' });
  }

  const sql = `
    INSERT INTO colaboradores 
      (nombre, correo, fecha_ingreso, onboarding_bienvenida, onboarding_tecnico, fecha_onboarding_tecnico)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  pool.query(
    sql,
    [nombre, correo, fecha_ingreso, onboarding_bienvenida, onboarding_tecnico, fecha_onboarding_tecnico],
    (err, result) => {
      if (err) {
        console.error('❌ Error al crear colaborador:', err);
        return res.status(500).json({ error: 'Error al crear colaborador' });
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});

// Listar colaboradores
router.get('/', (req, res) => {
  pool.query('SELECT * FROM colaboradores', (err, rows) => {
    if (err) {
      console.error('❌ Error al listar colaboradores:', err);
      return res.status(500).json({ error: 'Error al listar colaboradores' });
    }
    res.json(rows);
  });
});

// Obtener uno por id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  pool.query('SELECT * FROM colaboradores WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err);
      return res.status(500).json({ error: 'Error al obtener colaborador' });
    }
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });

    res.json(rows[0]);
  });
});

// Actualizar colaborador
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    correo,
    fecha_ingreso,
    onboarding_bienvenida,
    onboarding_tecnico,
    fecha_onboarding_tecnico
  } = req.body;

  const sql = `
    UPDATE colaboradores
    SET nombre = ?, correo = ?, fecha_ingreso = ?,
        onboarding_bienvenida = ?, onboarding_tecnico = ?, 
        fecha_onboarding_tecnico = ?
    WHERE id = ?
  `;

  pool.query(
    sql,
    [
      nombre,
      correo,
      fecha_ingreso,
      onboarding_bienvenida,
      onboarding_tecnico,
      fecha_onboarding_tecnico,
      id
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al actualizar colaborador' });
      }
      res.json({ success: true });
    }
  );
});

// Eliminar colaborador
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM colaboradores WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar colaborador' });
    }
    res.json({ success: true });
  });
});

module.exports = router;