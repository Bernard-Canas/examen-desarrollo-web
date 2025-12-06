const express = require('express');
const router = express.Router();

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  registerPomodoro
} = require('../controllers/tasksController');

const {
  getCourses,
  createCourse
} = require('../controllers/coursesController');

// Rutas de Tareas
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/:id/pomodoro', registerPomodoro);

// Rutas de Cursos
router.get('/courses', getCourses);
router.post('/courses', createCourse);

module.exports = router;