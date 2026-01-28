const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbPath = path.join(__dirname, 'alito.db');

const db = new sqlite3.Database(dbPath);

// Empleados seed (mismo listado original)
const seedEmployees = [
  { id: "E01", company: "ALITO EIRL", name: "YOHANDER DE LA ROSA DE LA ROSA", docId: "402-4136846-9" },
  { id: "E02", company: "ALITO EIRL", name: "WILKINS GUERRERO RAVELO", docId: "028-0081479-6" },
  { id: "E03", company: "ALITO EIRL", name: "ALITO DE LA ROSA DE LA ROSA", docId: "002-0108216-1" },
  { id: "E04", company: "ALITO EIRL", name: "KENIA BANESA CANARIO", docId: "018-0077090-9" },
  { id: "E05", company: "ALITO EIRL", name: "ISAI MEJIA RAVELO", docId: "028-0115579-3" },
  { id: "E06", company: "ALITO EIRL", name: "EDGAR FRANCISCO SANTIAGO FAMILIA", docId: "402-0880328-4" },
  { id: "E07", company: "ALITO EIRL", name: "BERNARDO ASENCIO GERMAN", docId: "093-0048068-9" },
  { id: "E08", company: "ALITO EIRL", name: "FRANCISCO GARAVITO SOSA", docId: "100-0006202-5" },
  { id: "E09", company: "ALITO EIRL", name: "JUAN PABLO MARTE", docId: "005-0039972-0" },
  { id: "E10", company: "ALITO EIRL", name: "WALNIN ESTEVIN SANTOS MOSCAT", docId: "402-3327881-7" },
  { id: "E11", company: "ALITO EIRL", name: "MELVIN VILOMAR PEGUERO", docId: "008-0027674-3" },
  { id: "E12", company: "ALITO EIRL", name: "MARTHA MARTE VILLA", docId: "104-0004233-8" },
  { id: "E13", company: "ALITO EIRL", name: "ALEXIS ROLANDO PEREZ MATOS", docId: "402-3339366-5" },
  { id: "E14", company: "ALITO EIRL", name: "AMELI CABRERA MEJIA", docId: "402-1887854-0" },
  { id: "E15", company: "ALITO EIRL", name: "RAYSA ESTHERLINA NUÑEZ PEÑA", docId: "402-3923417-8" },
  { id: "E16", company: "ALITO EIRL", name: "LUIS MIGUEL FAMILIA", docId: "012-0116390-2" },
  { id: "E17", company: "ALITO EIRL", name: "JUAN MANUEL LORA PAULA", docId: "402-3946714-1" },
  { id: "E18", company: "ALITO EIRL", name: "ANDRY RODELIN BATISTA SANTOS", docId: "402-2470114-0" },
  { id: "G01", company: "ALITO GROUP SRL", name: "JHOJANDER DE LA ROSA DE LA ROSA", docId: "402-2936619-6" },
  { id: "G02", company: "ALITO GROUP SRL", name: "YVELIS DE LA ROSA DE LA ROSA", docId: "402-2762310-1" },
  { id: "G03", company: "ALITO GROUP SRL", name: "QUIARA NICOLE LARA SOTO", docId: "402-3425457-7" },
  { id: "G04", company: "ALITO GROUP SRL", name: "JAVIER DE JESUS ROBLES", docId: "402-1871835-7" },
  { id: "G05", company: "ALITO GROUP SRL", name: "YEURI HERNANDEZ", docId: "402-5291344-3" },
  { id: "G06", company: "ALITO GROUP SRL", name: "WINIFEL ALIANNY DE LA ROSA MARTE", docId: "402-3050971-9" },
  { id: "G07", company: "ALITO GROUP SRL", name: "WILBER ALFREDO DE LA ROSA MARTE", docId: "402-0970743-5" },
  { id: "G08", company: "ALITO GROUP SRL", name: "JOSE EDUARDO FELIZ ROSARIO", docId: "402-1080512-9" },
  { id: "G09", company: "ALITO GROUP SRL", name: "JAIRO ANGEL TORRES SANCHEZ", docId: "008-0034296-6" },
  { id: "G10", company: "ALITO GROUP SRL", name: "ANA JULIA CANARIO ROMERO", docId: "019-0082123-1" },
  { id: "G11", company: "ALITO GROUP SRL", name: "JOSE EMILIO ALMONTE TRUFEL", docId: "133-0001166-8" },
  { id: "G12", company: "ALITO GROUP SRL", name: "DUARTE DE LA ROSA", docId: "001-1315228-4" },
  { id: "G13", company: "ALITO GROUP SRL", name: "RAFAEL LORENZO", docId: "001-1500785-8" },
  { id: "G14", company: "ALITO GROUP SRL", name: "JUAN PABLO DE LOS SANTOS", docId: "402-3614009-7" },
  { id: "G15", company: "ALITO GROUP SRL", name: "LUIS ELIAS VICIOSO HEREDIA", docId: "008-0032814-8" },
  { id: "G16", company: "ALITO GROUP SRL", name: "ELVIN MARTINEZ", docId: "028-0082923-2" },
  { id: "G17", company: "ALITO GROUP SRL", name: "EDGAR MIGUEL PEREZ GUERRERO", docId: "402-2853589-0" },
  { id: "G18", company: "ALITO GROUP SRL", name: "FRANCIS MARTES ROSARIO", docId: "402-1998334-9" },
  { id: "G19", company: "ALITO GROUP SRL", name: "JORGE DAVID DE LA ROSA", docId: "402-2938152-6" },
  { id: "G20", company: "ALITO GROUP SRL", name: "KELVIN GABRIEL NOLAZCO", docId: "032-0036887-0" },
  { id: "G21", company: "ALITO GROUP SRL", name: "RAFAEL DE JESUS DOMINGUEZ SERRATA", docId: "402-2569789-1" },
  { id: "G22", company: "ALITO GROUP SRL", name: "DANIEL CAMPUSANO VALDEZ", docId: "002-0183579-0" },
  { id: "G23", company: "ALITO GROUP SRL", name: "LEOVALDO FAMILIA", docId: "402-4190079-0" },
  { id: "G24", company: "ALITO GROUP SRL", name: "JERERMY TOMAS NUEZ MORILLO", docId: "402-1479402-2" },
  { id: "G25", company: "ALITO GROUP SRL", name: "STARLING MOTA VENTURA", docId: "402-2383265-6" },
  { id: "G26", company: "ALITO GROUP SRL", name: "ROLANDO MOYA CORPORAN", docId: "100-0007193-5" },
  { id: "G27", company: "ALITO GROUP SRL", name: "ORLANDO PLASCENCIA", docId: "008-0034343-6" },
  { id: "G28", company: "ALITO GROUP SRL", name: "LUIS DANIEL DE JESUS", docId: "402-0049003-1" },
  { id: "G29", company: "ALITO GROUP SRL", name: "JOSE LUIS CAMPUSANO", docId: "002-0120532-5" }
];

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      docId TEXT,
      jobTitle TEXT,
      notes TEXT
    )`);

    // Migration for existing tables
    db.run("ALTER TABLE employees ADD COLUMN jobTitle TEXT", () => { });
    db.run("ALTER TABLE employees ADD COLUMN notes TEXT", () => { });

    db.run(`CREATE TABLE IF NOT EXISTS states (
      id TEXT PRIMARY KEY,
      state TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      employeeIds TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      notes TEXT,
      createdBy TEXT
    )`);

    // Seed employees if table empty
    db.get('SELECT COUNT(1) as cnt FROM employees', (err, row) => {
      if (err) return console.error('Seed check failed', err);
      if (row && row.cnt === 0) {
        const stmt = db.prepare('INSERT INTO employees(id,name,company,docId) VALUES (?,?,?,?)');
        seedEmployees.forEach(e => stmt.run(e.id, e.name, e.company, e.docId));
        stmt.finalize();
        console.log('Seeded employees');
      }
    });
  });
}

function getAllStates() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, state FROM states', (err, rows) => {
      if (err) return reject(err);
      const obj = {};
      rows.forEach(r => { obj[r.id] = JSON.parse(r.state); });
      resolve(obj);
    });
  });
}

function upsertState(id, state) {
  return new Promise((resolve, reject) => {
    const stateStr = JSON.stringify(state);
    db.run('INSERT INTO states(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state', [id, stateStr], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function resetStates() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM states', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getAllEmployees() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, company, docId, jobTitle, notes FROM employees ORDER BY company, name', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getEmployeeById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, name, company, docId, jobTitle, notes FROM employees WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function upsertEmployee(emp) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO employees(id,name,company,docId,jobTitle,notes) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, company=excluded.company, docId=excluded.docId, jobTitle=excluded.jobTitle, notes=excluded.notes',
      [emp.id, emp.name, emp.company, emp.docId, emp.jobTitle, emp.notes], function (err) {
        if (err) return reject(err);
        resolve();
      });
  });
}

function deleteEmployee(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function bulkUpsertStates(statesObj) {
  const entries = Object.entries(statesObj || {});
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare('INSERT INTO states(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state');
      entries.forEach(([id, state]) => stmt.run(id, JSON.stringify(state)));
      stmt.finalize(err => err ? reject(err) : resolve());
    });
  });
}

function exportAll() {
  return Promise.all([getAllEmployees(), getAllStates()]).then(([emps, states]) => ({ employees: emps, states }));
}

// ========== REQUESTS FUNCTIONS ==========
function getAllRequests() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM requests ORDER BY createdAt DESC', (err, rows) => {
      if (err) return reject(err);
      // Parse employeeIds JSON
      const parsed = rows.map(r => ({
        ...r,
        employeeIds: JSON.parse(r.employeeIds || '[]')
      }));
      resolve(parsed);
    });
  });
}

function getRequestById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM requests WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      if (row) {
        row.employeeIds = JSON.parse(row.employeeIds || '[]');
      }
      resolve(row);
    });
  });
}

function createRequest(req) {
  return new Promise((resolve, reject) => {
    const id = req.id || `REQ-${Date.now()}`;
    const employeeIds = JSON.stringify(req.employeeIds || []);
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO requests(id, type, status, employeeIds, createdAt, updatedAt, notes, createdBy) VALUES(?,?,?,?,?,?,?,?)',
      [id, req.type, req.status, employeeIds, createdAt, createdAt, req.notes || '', req.createdBy || 'system'],
      function (err) {
        if (err) return reject(err);
        resolve({ id });
      }
    );
  });
}

function updateRequest(id, updates) {
  return new Promise((resolve, reject) => {
    const updatedAt = new Date().toISOString();
    const employeeIds = updates.employeeIds ? JSON.stringify(updates.employeeIds) : undefined;

    const fields = [];
    const values = [];

    if (updates.type) { fields.push('type = ?'); values.push(updates.type); }
    if (updates.status) { fields.push('status = ?'); values.push(updates.status); }
    if (employeeIds) { fields.push('employeeIds = ?'); values.push(employeeIds); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    fields.push('updatedAt = ?'); values.push(updatedAt);

    values.push(id);

    db.run(
      `UPDATE requests SET ${fields.join(', ')} WHERE id = ?`,
      values,
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function deleteRequest(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM requests WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  init,
  getAllStates,
  upsertState,
  resetStates,
  getAllEmployees,
  getEmployeeById,
  upsertEmployee,
  deleteEmployee,
  bulkUpsertStates,
  exportAll,
  // Requests
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
};
