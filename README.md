# 🎫 ALITO - Sistema de Gestión de Carnets

Sistema completo de gestión de carnets de acceso para empleados en Punta Cana y Cap Cana.

## 🚀 Características

### ✅ Gestión de Empleados
- Alta, baja y modificación de empleados
- Campos personalizados: Cargo, Notas/Anomalías
- Búsqueda global avanzada
- Filtros contextuales por empresa y estado

### 🎯 Gestión de Pases
- **Punta Cana (PC)** y **Cap Cana (CC)**
- Estados detallados: ACTIVE, PROCESSING, RENEWAL, PAYMENT_PENDING, etc.
- Seguimiento de fechas de expiración y solicitud
- Alertas automáticas de vencimiento (30 días)
- Gestión de empleados excluidos

### 📋 Sistema de Solicitudes Inteligente
- **Sugerencias automáticas** de empleados sin pases
- **Detección de vencimientos** próximos
- **Selección múltiple** para solicitudes masivas
- **Cola de solicitudes** con estados manipulables
- Historial completo de solicitudes

### 🎨 Interfaz Moderna
- Diseño **Glassmorphism** responsive
- Navegación por pestañas
- Búsqueda contextual por vista
- Filtros avanzados en Dashboard
- Modales interactivos

### 📊 API REST Documentada
- Swagger UI integrado en `/api-docs`
- Endpoints completos para empleados, estados y solicitudes
- Validación de datos

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- SQLite3
- Swagger/OpenAPI

**Frontend:**
- Vanilla JavaScript
- Tailwind CSS
- HTML5

## 📦 Instalación

```bash
# Instalar dependencias
cd backend
npm install

# Iniciar servidor
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## 📖 Documentación API

Accede a la documentación interactiva en: `http://localhost:3000/api-docs`

### Endpoints Principales

**Empleados:**
- `GET /api/employees` - Listar todos
- `GET /api/employees/:id` - Obtener por ID
- `POST /api/employees` - Crear nuevo
- `PUT /api/employees/:id` - Actualizar
- `DELETE /api/employees/:id` - Eliminar

**Estados:**
- `GET /api/state` - Obtener todos los estados
- `POST /api/state` - Actualizar estado de empleado

**Solicitudes:**
- `GET /api/requests` - Listar todas las solicitudes
- `POST /api/requests` - Crear nueva solicitud
- `GET /api/requests/:id` - Ver detalles
- `PUT /api/requests/:id` - Actualizar solicitud
- `DELETE /api/requests/:id` - Eliminar solicitud
- `GET /api/requests/suggestions?type=PC|CC` - Sugerencias inteligentes

## 📁 Estructura del Proyecto

```
APP HERRAMIENTAS/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── db.js              # Gestión de base de datos
│   ├── swagger.config.js  # Configuración API docs
│   ├── package.json
│   └── alito.db          # SQLite database (auto-generada)
├── frontend/
│   ├── index.html        # UI principal
│   ├── app.js            # Lógica frontend
│   └── styles.css        # Estilos (Tailwind CDN)
└── README.md
```

## 🎯 Uso

### Dashboard
Visualiza estadísticas generales y aplica filtros por empresa y estado de pases.

### Vistas Especializadas
- **Punta Cana:** Solo empleados con pase PC
- **Cap Cana:** Solo empleados con pase CC
- **Excluidos/Alertas:** Empleados con anomalías

### Solicitudes
1. Ve a la pestaña "Solicitudes"
2. Revisa las sugerencias inteligentes (si hay)
3. Click en "Nueva Solicitud"
4. Selecciona tipo de pase (PC/CC)
5. Marca empleados (Sin Pases / Próximos a Vencer / Manual)
6. Agrega notas opcionales
7. Crear Solicitud

### Administración
Click en "Administrar" para gestionar datos de empleados y estados de pases.

## 🔄 Próximas Funcionalidades

- [ ] Sincronización con Supabase
- [ ] Generación de reportes PDF
- [ ] Plantillas de documentos personalizables
- [ ] Dashboard analítico avanzado
- [ ] Notificaciones automáticas

## 📝 Licencia

MIT

## 👨‍💻 Autor

Wilber De La Rosa - ALITO EIRL / ALITO GROUP SRL
