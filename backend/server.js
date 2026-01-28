const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger.config');

// Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Retrieve a list of all employees
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: A list of employees.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 */
app.get('/api/employees', async (req, res) => {
  try {
    const emps = await db.getAllEmployees();
    res.json(emps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get an employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee ID
 *     responses:
 *       200:
 *         description: The employee description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: The employee was not found
 */
app.get('/api/employees/:id', async (req, res) => {
  try {
    const emp = await db.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create or Update an employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: The employee was successfully created/updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 */
app.post('/api/employees', [
  body('id').isString().notEmpty(),
  body('name').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await db.upsertEmployee(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Remove an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee ID
 *     responses:
 *       200:
 *         description: The employee was deleted
 *       500:
 *         description: DB error
 */
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.deleteEmployee(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// API: obtener todos los estados
/**
 * @swagger
 * /api/state:
 *   get:
 *     summary: Get all employee states (access permissions)
 *     tags: [State]
 *     responses:
 *       200:
 *         description: Key-value object of states
 */
app.get('/api/state', async (req, res) => {
  try {
    const states = await db.getAllStates();
    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// API: upsert estado por id
/**
 * @swagger
 * /api/state:
 *   post:
 *     summary: Update state for a single employee
 *     tags: [State]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeState'
 *     responses:
 *       200:
 *         description: State updated
 */
app.post('/api/state', [
  body('id').isString().notEmpty(),
  body('state').isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id, state } = req.body;
  try {
    await db.upsertState(id, state);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// API: bulk states
/**
 * @swagger
 * /api/state/bulk:
 *   post:
 *     summary: Bulk update states
 *     tags: [State]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Map of IDs to state objects
 *     responses:
 *       200:
 *         description: Bulk update successful
 */
app.post('/api/state/bulk', async (req, res) => {
  const statesObj = req.body;
  if (typeof statesObj !== 'object') return res.status(400).json({ error: 'body must be an object' });
  try {
    await db.bulkUpsertStates(statesObj);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// API: reset
/**
 * @swagger
 * /api/reset:
 *   post:
 *     summary: Reset all employee states (Danger Zone)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: System reset successful
 */
app.post('/api/reset', async (req, res) => {
  try {
    await db.resetStates();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// API: export all
/**
 * @swagger
 * /api/export:
 *   get:
 *     summary: Export all data
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: JSON dump of employees and states
 */
app.get('/api/export', async (req, res) => {
  try {
    const dump = await db.exportAll();
    res.json(dump);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ============ REQUESTS API ============

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
 *     responses:
 *       200:
 *         description: List of all requests
 */
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await db.getAllRequests();
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get a request by ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request details
 *       404:
 *         description: Request not found
 */
app.get('/api/requests/:id', async (req, res) => {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PC, CC]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED]
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request created successfully
 */
app.post('/api/requests', async (req, res) => {
  try {
    const result = await db.createRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update a request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Request updated successfully
 */
app.put('/api/requests/:id', async (req, res) => {
  try {
    await db.updateRequest(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete a request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request deleted successfully
 */
app.delete('/api/requests/:id', async (req, res) => {
  try {
    await db.deleteRequest(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /api/requests/suggestions:
 *   get:
 *     summary: Get intelligent suggestions for creating requests
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PC, CC]
 *         required: true
 *     responses:
 *       200:
 *         description: Suggested employees for the request
 */
app.get('/api/requests/suggestions', async (req, res) => {
  try {
    const { type } = req.query; // PC or CC
    const employees = await db.getAllEmployees();
    const states = await db.getAllStates();

    const WARNING_DAYS = 30;
    const now = new Date();

    const suggestions = {
      noPasses: [],
      expiring: []
    };

    employees.forEach(emp => {
      const state = states[emp.id] || {};
      const statusKey = type === 'PC' ? 'pc_status' : 'cc_status';
      const expiresKey = type === 'PC' ? 'pc_expires' : 'cc_expires';

      const status = state[statusKey] || 'NONE';
      const expires = state[expiresKey];

      // No pass
      if (status === 'NONE' && !state.excluded) {
        suggestions.noPasses.push(emp);
      }

      // Expiring soon
      if (status === 'ACTIVE' && expires) {
        const expDate = new Date(expires);
        const daysUntil = Math.floor((expDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntil <= WARNING_DAYS && daysUntil >= 0) {
          suggestions.expiring.push({ ...emp, daysUntilExpire: daysUntil });
        }
      }
    });

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Iniciar DB y servidor
db.init();

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
