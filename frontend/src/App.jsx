import React, { useState, useEffect } from 'react';
import { Clock, Plus, Play, Pause, CheckCircle2, AlertCircle, Calendar, BookOpen, Timer, Trash2, X } from 'lucide-react';
import './AgendCanas.css';

const API_URL = 'http://localhost:3000/api/v1';

const AgendCanas = () => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [activePomodoro, setActivePomodoro] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchCourses();
  }, []);

  useEffect(() => {
    let interval;
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handlePomodoroComplete = async () => {
    if (activePomodoro) {
      try {
        await fetch(`${API_URL}/tasks/${activePomodoro.id_tarea}/pomodoro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duracion_minutos: 25,
            completada: true,
            notas: 'Sesión completada'
          })
        });
        alert('¡Pomodoro completado! Toma un descanso de 5 minutos. 🎉');
        setActivePomodoro(null);
        setPomodoroRunning(false);
        fetchTasks();
      } catch (error) {
        console.error('Error registrando pomodoro:', error);
      }
    }
  };

  const startPomodoro = (task) => {
    setActivePomodoro(task);
    setPomodoroTime(25 * 60);
    setPomodoroRunning(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityClass = (priority) => {
    const classes = {
      urgente: 'badge-urgente',
      alta: 'badge-alta',
      media: 'badge-media',
      baja: 'badge-baja'
    };
    return classes[priority] || classes.media;
  };

  const deleteTask = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskComplete = async (task) => {
    try {
      await fetch(`${API_URL}/tasks/${task.id_tarea}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: task.estado === 'completada' ? 'pendiente' : 'completada'
        })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">
              <BookOpen size={32} color="white" />
            </div>
            <div className="logo-text">
              <h1>AgendCanas</h1>
              <p>Tu planificador académico inteligente</p>
            </div>
          </div>
          <div className="header-buttons">
            <button onClick={() => setShowNewCourseModal(true)} className="btn btn-curso">
              <Plus size={20} />
              <span>Curso</span>
            </button>
            <button onClick={() => setShowNewTaskModal(true)} className="btn btn-tarea">
              <Plus size={20} />
              <span>Tarea</span>
            </button>
          </div>
        </div>
      </header>

      {activePomodoro && (
        <div className="pomodoro-timer">
          <div className="pomodoro-header">
            <h3>⏱️ Pomodoro</h3>
            <button onClick={() => { setActivePomodoro(null); setPomodoroRunning(false); }}>
              <X size={24} />
            </button>
          </div>
          <p className="pomodoro-task">{activePomodoro.titulo}</p>
          <div className="pomodoro-display">
            <div className="pomodoro-time">{formatTime(pomodoroTime)}</div>
            <p className="pomodoro-status">
              {pomodoroRunning ? '🎯 Enfócate en tu tarea' : '✨ Listo para empezar'}
            </p>
          </div>
          <div className="pomodoro-controls">
            <button onClick={() => setPomodoroRunning(!pomodoroRunning)}>
              {pomodoroRunning ? <><Pause size={24} />Pausar</> : <><Play size={24} />Iniciar</>}
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        <section className="section">
          <h2 className="section-title">
            <Calendar size={28} />
            📚 Mis Cursos
          </h2>
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>No tienes cursos creados. ¡Crea tu primer curso!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id_curso} className="course-card" style={{ borderLeftColor: course.color }}>
                  <h3>{course.nombre_curso}</h3>
                  <p>{course.codigo_curso}</p>
                  <div className="course-info">
                    <span className="course-credits">{course.creditos} créditos</span>
                    <span className="course-pending" style={{ background: course.color }}>
                      {course.tareas_pendientes || 0} pendientes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <h2 className="section-title">
            <CheckCircle2 size={28} />
            ✅ Mis Tareas ({tasks.length})
          </h2>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={80} />
              <p>No tienes tareas pendientes</p>
              <button onClick={() => setShowNewTaskModal(true)} className="btn btn-tarea">
                Crear primera tarea
              </button>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <div
                  key={task.id_tarea}
                  className={`task-card ${task.estado === 'completada' ? 'completed' : ''}`}
                  style={{ borderLeftColor: task.color }}
                >
                  <div className="task-header">
                    <div style={{ flex: 1 }}>
                      <div className="task-badges">
                        <span className={`badge ${getPriorityClass(task.prioridad)}`}>
                          {task.prioridad.toUpperCase()}
                        </span>
                        <span className="badge badge-curso" style={{ background: task.color }}>
                          {task.nombre_curso}
                        </span>
                      </div>
                      <h3 className={`task-title ${task.estado === 'completada' ? 'completed' : ''}`}>
                        {task.titulo}
                      </h3>
                      {task.descripcion && (
                        <p className="task-description">{task.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="task-stats">
                    <div className="stat-item stat-fecha">
                      <Calendar size={16} color="#6366f1" />
                      <span>{new Date(task.fecha_limite).toLocaleDateString('es-GT')}</span>
                    </div>
                    <div className="stat-item stat-peso">
                      <AlertCircle size={16} color="#8b5cf6" />
                      <span>{task.peso_nota}% nota</span>
                    </div>
                    <div className="stat-item stat-esfuerzo">
                      <Clock size={16} color="#f97316" />
                      <span>{task.esfuerzo_estimado} min</span>
                    </div>
                    <div className="stat-item stat-tiempo">
                      <Timer size={16} color="#10b981" />
                      <span>{task.tiempo_trabajado || 0} min</span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      onClick={() => toggleTaskComplete(task)}
                      className={task.estado === 'completada' ? 'btn-reabrir' : 'btn-completar'}
                    >
                      {task.estado === 'completada' ? '↩️ Reabrir' : '✅ Completar'}
                    </button>
                    {task.estado !== 'completada' && (
                      <button onClick={() => startPomodoro(task)} className="btn-pomodoro">
                        <Play size={16} />
                        Pomodoro
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id_tarea)} className="btn-eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showNewTaskModal && (
        <NewTaskModal
          courses={courses}
          onClose={() => setShowNewTaskModal(false)}
          onSuccess={() => {
            fetchTasks();
            setShowNewTaskModal(false);
          }}
        />
      )}

      {showNewCourseModal && (
        <NewCourseModal
          onClose={() => setShowNewCourseModal(false)}
          onSuccess={() => {
            fetchCourses();
            setShowNewCourseModal(false);
          }}
        />
      )}
    </div>
  );
};

const NewTaskModal = ({ courses, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_curso: '',
    titulo: '',
    descripcion: '',
    fecha_limite: '',
    peso_nota: 0,
    esfuerzo_estimado: 60
  });

  const handleSubmit = async () => {
    if (!formData.id_curso || !formData.titulo || !formData.fecha_limite) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">📝 Nueva Tarea</h2>
        <div>
          <div className="form-group">
            <label className="form-label">Curso *</label>
            <select
              value={formData.id_curso}
              onChange={(e) => setFormData({...formData, id_curso: e.target.value})}
              className="form-select"
            >
              <option value="">Selecciona un curso</option>
              {courses.map(course => (
                <option key={course.id_curso} value={course.id_curso}>
                  {course.nombre_curso}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="form-input"
              placeholder="Ej: Tarea de cálculo"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="form-textarea"
              rows="3"
              placeholder="Describe la tarea..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Límite *</label>
            <input
              type="datetime-local"
              value={formData.fecha_limite}
              onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Peso en Nota (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.peso_nota}
                onChange={(e) => setFormData({...formData, peso_nota: parseFloat(e.target.value)})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Esfuerzo (min)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.esfuerzo_estimado}
                onChange={(e) => setFormData({...formData, esfuerzo_estimado: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button onClick={handleSubmit} className="btn-crear">Crear Tarea</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewCourseModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_curso: '',
    codigo_curso: '',
    color: '#4A90E2',
    creditos: 3
  });

  const handleSubmit = async () => {
    if (!formData.nombre_curso) {
      alert('El nombre del curso es requerido');
      return;
    }
    try {
      await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const colors = ['#4A90E2', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFD93D'];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">📚 Nuevo Curso</h2>
        <div>
          <div className="form-group">
            <label className="form-label">Nombre del Curso *</label>
            <input
              type="text"
              value={formData.nombre_curso}
              onChange={(e) => setFormData({...formData, nombre_curso: e.target.value})}
              className="form-input"
              placeholder="Ej: Cálculo Diferencial"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Código del Curso</label>
            <input
              type="text"
              value={formData.codigo_curso}
              onChange={(e) => setFormData({...formData, codigo_curso: e.target.value})}
              className="form-input"
              placeholder="Ej: MAT101"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Color del Curso</label>
            <div className="color-picker">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData({...formData, color})}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Créditos</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.creditos}
              onChange={(e) => setFormData({...formData, creditos: parseInt(e.target.value)})}
              className="form-input"
            />
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button onClick={handleSubmit} className="btn-crear">Crear Curso</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendCanas;