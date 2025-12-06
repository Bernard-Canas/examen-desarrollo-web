const { pool } = require('../config/database');

// GET /api/v1/courses - Obtener todos los cursos del usuario
const getCourses = async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const query = `
      SELECT 
        c.*,
        COUNT(t.id_tarea) as total_tareas,
        COUNT(CASE WHEN t.estado = 'pendiente' THEN 1 END) as tareas_pendientes
      FROM cursos c
      LEFT JOIN tareas t ON c.id_curso = t.id_curso
      WHERE c.id_usuario = $1
      GROUP BY c.id_curso
      ORDER BY c.nombre_curso
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos',
      error: error.message
    });
  }
};

// POST /api/v1/courses - Crear nuevo curso
const createCourse = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { nombre_curso, codigo_curso, color, creditos } = req.body;

    if (!nombre_curso) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del curso es requerido'
      });
    }

    const query = `
      INSERT INTO cursos (id_usuario, nombre_curso, codigo_curso, color, creditos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [userId, nombre_curso, codigo_curso, color || '#4A90E2', creditos || 3];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el curso',
      error: error.message
    });
  }
};

module.exports = {
  getCourses,
  createCourse
};