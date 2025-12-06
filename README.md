# 📚 AgendCanas (Frontend)
# Creado por: Bernardo Canas
# Examen Final  DESARROLLO WEB

**AgendCanas** es una aplicación web de planificación académica inteligente diseñada para ayudar a los estudiantes universitarios a gestionar su carga de trabajo, combatir la procrastinación y priorizar tareas basándose en su impacto real en la nota final.


### ❌ El Problema
La principal dificultad que enfrentan los estudiantes es la falta de herramientas optimizadas para el contexto académico que permitan **gestionar de manera centralizada y eficiente** su carga (tareas, exámenes, fechas límite) de múltiples cursos, lo que resulta en procrastinación y una visión incompleta de su progreso.

### ✅ La Solución
**AgendCanas** es un gestor de carga académica que integra técnicas de productividad (como el método Pomodoro adaptado) para:

* **Centralizar** todas las tareas y exámenes por curso.
* **Priorizar** automáticamente las tareas basándose en la fecha límite, el **peso en la nota final** y el esfuerzo estimado.
* Generar sesiones de estudio **enfocadas** con un temporizador Pomodoro integrado.

## 🚀 Características Principales

* **Gestión de Cursos y Tareas (CRUD):** Creación y administración completa de la vida académica.
* **Priorización Inteligente:** Visualización del peso de la tarea en la nota final (`peso_nota%`) para una priorización basada en el impacto.
* **Temporizador Pomodoro Integrado:** Inicia un ciclo de 25 minutos de enfoque directamente desde la tarjeta de la tarea y registra el tiempo completado en el historial de la API.
* **Visualización Detallada:** Muestra el esfuerzo estimado vs. el tiempo real trabajado en cada tarea.
* **Estilo Moderno:** Interfaz de usuario limpia y minimalista, diseñada para el enfoque.

## 🛠️ Tecnologías del Frontend

Este proyecto está construido sobre el ecosistema moderno de JavaScript:

| Tecnología | Versión | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| **React** | `^19.x` | Framework | Librería principal para la construcción de la UI. |
| **Vite** | `^7.x` | Build Tool | Servidor de desarrollo rápido y empaquetador. |
| **Axios** | `^1.13.2` | HTTP Client | Utilizado para la configuración base de la comunicación API. |
| **Lucide-React** | `^0.556.0` | Íconos | Conjunto de íconos limpios y modernos. |
| **Tailwind CSS** | `^3.4.18` | Styling | Framework CSS para el diseño de la interfaz. |

## 📦 Estructura del Código Relevante

* `src/api.js`: Configuración de **Axios**, interceptores de errores y definición de endpoints (`tasksAPI`, `coursesAPI`).
* `src/AgendCanas.jsx`: Componente principal que maneja el estado (`useState`), la lógica del Pomodoro y las interacciones con la API (incluyendo los modales de creación de Tareas y Cursos).
* `src/index.html`: Archivo HTML base que define el punto de montaje (`#root`).

## ⚙️ Configuración y Ejecución

Para ejecutar la aplicación localmente, necesitarás tener tanto el servicio de **Backend (API)** como el **Frontend** (este repositorio) corriendo.

### 1. Requisitos Previos

* [Node.js](https://nodejs.org/en) (versión recomendada LTS)
* npm

### 2. Ejecutar el Backend

Asegúrate de que la API que alimenta la aplicación esté disponible.

1.  Clona el repositorio del Backend (si es diferente).
2.  Instala dependencias y arranca el servidor API:
    ```bash
    # En el directorio del Backend
    npm install
    npm run dev 
    ```

### 3. Ejecutar el Frontend (Este Repositorio)

1.  Clona este repositorio:
    ```bash
    git clone [URL_DE_TU_REPOSITORIO]
    cd frontend 
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo de Vite. **Asegúrate de que el Backend ya esté corriendo.**
    ```bash
    npm run dev
    ```

La aplicación se abrirá automáticamente en tu navegador (típicamente `http://localhost:5173`).