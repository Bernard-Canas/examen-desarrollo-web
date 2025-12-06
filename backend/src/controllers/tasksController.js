const { pool } = require('../config/database');

// GET /api/v1/tasks - Obtener todas las tareas del usuario
const getTasks = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // TODO: Obtener del token JWT

    const query = `
      SELECT 
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.fecha_limite,
        t.peso_nota,
        t.esfuerzo_estimado,
        t.prioridad,
        t.estado,
        t.tiempo_trabajado,
        c.id_curso,
        c.nombre_curso,
        c.codigo_curso,
        c.color,
        EXTRACT(DAY FROM (t.fecha_limite - CURRENT_TIMESTAMP))::INTEGER as dias_restantes
      FROM tareas t
      INNER JOIN cursos c ON t.id_curso = c.id_curso
      WHERE c.id_usuario = $1
      ORDER BY 
        CASE t.prioridad
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baja' THEN 4
        END,
        t.fecha_limite ASC
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas',
      error: error.message
    });
  }
};

// POST /api/v1/tasks - Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { id_curso, titulo, descripcion, fecha_limite, peso_nota, esfuerzo_estimado } = req.body;

    // Validaciones
    if (!id_curso || !titulo || !fecha_limite) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_curso, titulo, fecha_limite'
      });
    }

    const query = `
      INSERT INTO tareas (
        id_curso, 
        titulo, 
        descripcion, 
        fecha_limite, 
        peso_nota, 
        esfuerzo_estimado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      id_curso,
      titulo,
      descripcion || null,
      fecha_limite,
      peso_nota || 0,
      esfuerzo_estimado || 60
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la tarea',
      error: error.message
    });
  }
};

// PUT /api/v1/tasks/:id - Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_limite, peso_nota, esfuerzo_estimado, estado } = req.body;

    const query = `
      UPDATE tareas 
      SET 
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        fecha_limite = COALESCE($3, fecha_limite),
        peso_nota = COALESCE($4, peso_nota),
        esfuerzo_estimado = COALESCE($5, esfuerzo_estimado),
        estado = COALESCE($6, estado),
        fecha_completado = CASE WHEN $6 = 'completada' THEN CURRENT_TIMESTAMP ELSE fecha_completado END
      WHERE id_tarea = $7
      RETURNING *
    `;

    const values = [titulo, descripcion, fecha_limite, peso_nota, esfuerzo_estimado, estado, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la tarea',
      error: error.message
    });
  }
};

// DELETE /api/v1/tasks/:id - Eliminar tarea
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM tareas WHERE id_tarea = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la tarea',
      error: error.message
    });
  }
};

// POST /api/v1/tasks/:id/pomodoro - Registrar sesión Pomodoro
const registerPomodoro = async (req, res) => {
  try {
    const { id } = req.params;
    const { duracion_minutos, completada, notas } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Registrar sesión
      const sessionQuery = `
        INSERT INTO sesiones_pomodoro (id_tarea, duracion_minutos, completada, notas, fecha_fin)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const sessionResult = await client.query(sessionQuery, [id, duracion_minutos, completada, notas]);

      // Actualizar tiempo trabajado en la tarea
      const updateQuery = `
        UPDATE tareas 
        SET tiempo_trabajado = tiempo_trabajado + $1
        WHERE id_tarea = $2
        RETURNING tiempo_trabajado
      `;
      await client.query(updateQuery, [duracion_minutos, id]);

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Sesión Pomodoro registrada',
        data: sessionResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al registrar Pomodoro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la sesión',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  registerPomodoro
};