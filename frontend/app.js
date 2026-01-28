let employees = [];
let systemState = {};
let requests = [];

// DOM
const views = ['dashboard', 'pc_view', 'cc_view', 'excluded_view', 'requests_view'];
const globalSearch = document.getElementById('globalSearch');
const manageBtn = document.getElementById('manageBtn');

// Dashboard Counters
const countPC = document.getElementById('countPC');
const countCC = document.getElementById('countCC');
const countPendingPay = document.getElementById('countPendingPay');
const countExpiring = document.getElementById('countExpiring');
const employeeList = document.getElementById('employeeList');

// Filter Inputs
const dashboardFilterStatus = document.getElementById('dashboardFilterStatus');
const dashboardFilterCompany = document.getElementById('dashboardFilterCompany');

// Specific Table Bodies
const pcTableBody = document.getElementById('pcTableBody');
const ccTableBody = document.getElementById('ccTableBody');
const excludedGrid = document.getElementById('excludedGrid');

// Admin Modal
const adminPanel = document.getElementById('adminPanel');
const adminSearch = document.getElementById('adminSearch');
const adminList = document.getElementById('adminList');
const empForm = document.getElementById('empForm');

// Inputs
const empIdInput = document.getElementById('empId');
const empNameInput = document.getElementById('empName');
const empCompanyInput = document.getElementById('empCompany');
const empDocInput = document.getElementById('empDoc');
const empJobInput = document.getElementById('empJob');
const empNotesInput = document.getElementById('empNotes');
const checkExcluded = document.getElementById('checkExcluded');

const pcStatus = document.getElementById('pcStatus');
const pcExpires = document.getElementById('pcExpires');
const pcRequested = document.getElementById('pcRequested');

const ccStatus = document.getElementById('ccStatus');
const ccExpires = document.getElementById('ccExpires');
const ccRequested = document.getElementById('ccRequested');

const WARNING_DAYS = 30;

// --- INIT ---
async function init() {
  await fetchInitialData();
  setupEventListeners();

  // Filter Listeners
  dashboardFilterStatus.addEventListener('change', refreshAllViews);
  dashboardFilterCompany.addEventListener('change', refreshAllViews);

  await fetchRequests(); // Load requests

  switchTab('dashboard');
}

async function fetchInitialData() {
  try {
    const [eRes, sRes] = await Promise.all([fetch('/api/employees'), fetch('/api/state')]);
    employees = await eRes.json();
    systemState = await sRes.json();
    refreshAllViews();
  } catch (e) { console.error(e); }
}

function normalizeState(id) {
  let s = systemState[id] || {};
  // ensure fields
  return {
    pc_status: s.pc_status || 'NONE',
    pc_expires: s.pc_expires || '',
    pc_requested: s.pc_requested || '',
    cc_status: s.cc_status || 'NONE',
    cc_expires: s.cc_expires || '',
    cc_requested: s.cc_requested || '',
    excluded: !!s.excluded
  };
}

// --- TABS & NAVIGATION ---
window.switchTab = function (viewId) {
  views.forEach(v => {
    document.getElementById(v).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');

  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-slate-900', 'border-b-2', 'border-brand-500');
    if (btn.getAttribute('onclick').includes(viewId)) {
      btn.classList.add('active', 'text-slate-900', 'border-b-2', 'border-brand-500');
    }
  });

  refreshAllViews(); // Re-render to ensure fresh data/search
}

// --- RENDERING ---
// --- RENDERING ---
function getFilteredList(viewContext) {
  const term = globalSearch.value.toLowerCase();

  return employees.filter(emp => {
    const s = normalizeState(emp.id);

    // 1. Text Search
    const text = (emp.name + emp.id + emp.company + (emp.jobTitle || '') + (emp.notes || '')).toLowerCase();
    if (!text.includes(term)) return false;

    // 2. View Context Rules
    if (viewContext === 'pc_view') {
      // STRICT: Only show if they have a PC pass (not NONE)
      if (s.pc_status === 'NONE') return false;
    }
    if (viewContext === 'cc_view') {
      // STRICT: Only show if they have a CC pass
      if (s.cc_status === 'NONE') return false;
    }
    if (viewContext === 'excluded_view') {
      if (!s.excluded) return false;
    }

    // 3. Dashboard Filters (APPLES TO DASHBOARD VIEW ONLY)
    if (viewContext === 'dashboard') {
      // Status Filter
      const statusMode = dashboardFilterStatus.value;
      if (statusMode === 'pc_active' && s.pc_status !== 'ACTIVE') return false;
      if (statusMode === 'cc_active' && s.cc_status !== 'ACTIVE') return false;
      if (statusMode === 'both' && (s.pc_status !== 'ACTIVE' || s.cc_status !== 'ACTIVE')) return false;
      if (statusMode === 'none' && (s.pc_status !== 'NONE' || s.cc_status !== 'NONE')) return false;
      if (statusMode === 'pending' && (s.pc_status !== 'PAYMENT_PENDING' && s.cc_status !== 'PAYMENT_PENDING')) return false;

      // Company Filter
      const compMode = dashboardFilterCompany.value;
      if (compMode !== 'all' && emp.company !== compMode) return false;
    }

    return true;
  });
}

function refreshAllViews() {
  // 1. Dashboard Logic
  const dashList = getFilteredList('dashboard');
  renderDashboard(dashList);

  // 2. PC Table
  const pcList = getFilteredList('pc_view');
  renderPCTable(pcList);

  // 3. CC Table
  const ccList = getFilteredList('cc_view');
  renderCCTable(ccList);

  // 4. Excluded
  const exList = getFilteredList('excluded_view');
  renderExcluded(exList);

  updateCounters();
}

// --- DASHBOARD RENDER ---
function renderDashboard(list) {
  employeeList.innerHTML = '';
  // Show only "Active" or interesting ones in dashboard summary, typically
  // For now show all filtered for "Global list" view
  list.slice(0, 50).forEach(emp => { // Limit 50 for perf
    const s = normalizeState(emp.id);
    const li = document.createElement('li');
    li.className = `p-4 flex justify-between items-center hover:bg-slate-50 ${s.excluded ? 'bg-rose-50' : ''}`;

    const badges = [];
    if (s.pc_status === 'ACTIVE') badges.push('<span class="bg-teal-100 text-teal-800 text-xs px-2 rounded">PC</span>');
    if (s.cc_status === 'ACTIVE') badges.push('<span class="bg-indigo-100 text-indigo-800 text-xs px-2 rounded">CC</span>');
    if (s.excluded) badges.push('<span class="bg-rose-600 text-white text-xs px-2 rounded font-bold">EXCLUIDO</span>');

    li.innerHTML = `
            <div>
                <div class="font-bold text-slate-700">${emp.name}</div>
                <div class="text-xs text-slate-400 flex gap-2">
                    <span>${emp.company}</span>
                    ${emp.jobTitle ? `<span>• ${emp.jobTitle}</span>` : ''}
                </div>
            </div>
            <div class="flex gap-2 items-center">
                <div class="flex gap-1">${badges.join('')}</div>
                <button onclick="editEmp('${emp.id}')" class="text-slate-300 hover:text-blue-600">✎</button>
            </div>
        `;
    employeeList.appendChild(li);
  });
}

// --- PC TABLE RENDER ---
function renderPCTable(list) {
  pcTableBody.innerHTML = '';
  list.filter(e => {
    const s = normalizeState(e.id);
    return s.pc_status !== 'NONE' || globalSearch.value; // Show if has status OR searching
  }).forEach(emp => {
    const s = normalizeState(emp.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td class="px-4 py-3">
                <div class="font-medium text-slate-900">${emp.name}</div>
                <div class="text-xs text-slate-500">${emp.id}</div>
            </td>
            <td class="px-4 py-3 text-slate-600">${emp.jobTitle || '-'}</td>
            <td class="px-4 py-3">${getBadgeHTML(s.pc_status)}</td>
            <td class="px-4 py-3 text-slate-600 text-xs">${formatDate(s.pc_expires)}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="editEmp('${emp.id}')" class="text-brand-600 hover:underline">Editar</button>
            </td>
        `;
    pcTableBody.appendChild(tr);
  });
}

// --- CC TABLE RENDER ---
function renderCCTable(list) {
  ccTableBody.innerHTML = '';
  list.filter(e => {
    const s = normalizeState(e.id);
    return s.cc_status !== 'NONE' || globalSearch.value;
  }).forEach(emp => {
    const s = normalizeState(emp.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td class="px-4 py-3">
                <div class="font-medium text-slate-900">${emp.name}</div>
                <div class="text-xs text-slate-500">${emp.id}</div>
            </td>
            <td class="px-4 py-3 text-slate-600">${emp.jobTitle || '-'}</td>
            <td class="px-4 py-3">${getBadgeHTML(s.cc_status)}</td>
            <td class="px-4 py-3 text-slate-600 text-xs">${formatDate(s.cc_expires)}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="editEmp('${emp.id}')" class="text-brand-600 hover:underline">Editar</button>
            </td>
        `;
    ccTableBody.appendChild(tr);
  });
}

// --- EXCLUDED RENDER ---
function renderExcluded(list) {
  excludedGrid.innerHTML = '';
  list.filter(e => {
    const s = normalizeState(e.id);
    return s.excluded || e.notes || globalSearch.value;
  }).forEach(emp => {
    const s = normalizeState(emp.id);
    const div = document.createElement('div');
    div.className = `p-4 rounded-xl border ${s.excluded ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`;
    div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold ${s.excluded ? 'text-rose-800' : 'text-slate-800'}">${emp.name}</h4>
                ${s.excluded ? '⛔' : ''}
            </div>
            <p class="text-xs text-slate-500 mb-2">${emp.company}</p>
            ${emp.notes ? `<div class="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100 my-2">📝 ${emp.notes}</div>` : ''}
            <button onclick="editEmp('${emp.id}')" class="w-full mt-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-50">Gestionar</button>
        `;
    excludedGrid.appendChild(div);
  });
}

// --- HELPERS ---
function getBadgeHTML(status) {
  const map = {
    'ACTIVE': '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">ACTIVO</span>',
    'PROCESSING': '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Proceso</span>',
    'RENEWAL': '<span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">Renovar</span>',
    'PENDING_UPDATE': '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">Pendiente</span>',
    'PAYMENT_PENDING': '<span class="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">💰 Pago</span>',
    'NONE': '<span class="text-slate-400 text-xs">-</span>'
  };
  return map[status] || map['NONE'];
}

function formatDate(d) {
  if (!d) return '-';
  // Format YYYY-MM-DD to DD/MM/YYYY
  const [y, m, d2] = d.split('-');
  return `${d2}/${m}/${y}`;
}

function updateCounters() {
  let pc = 0, cc = 0, pay = 0, exp = 0;
  employees.forEach(e => {
    const s = normalizeState(e.id);
    if (s.excluded) return;
    if (s.pc_status === 'ACTIVE') pc++;
    if (s.cc_status === 'ACTIVE') cc++;

    if (s.pc_status === 'PAYMENT_PENDING' || s.cc_status === 'PAYMENT_PENDING') pay++;

    if ((s.pc_status === 'ACTIVE' && isExpiring(s.pc_expires)) || (s.cc_status === 'ACTIVE' && isExpiring(s.cc_expires))) exp++;
  });

  countPC.innerText = pc;
  countCC.innerText = cc;
  countPendingPay.innerText = pay;
  countExpiring.innerText = exp;
}

function isExpiring(dateStr) {
  if (!dateStr) return false;
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days < 30; // < 30 days
}

// --- ADMIN / EDITLOGIC ---
window.editEmp = function (id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  const s = normalizeState(id);

  // BASIC
  empIdInput.value = emp.id;
  empIdInput.setAttribute('disabled', 'true');
  empNameInput.value = emp.name;
  empCompanyInput.value = emp.company;
  empDocInput.value = emp.docId || '';
  empJobInput.value = emp.jobTitle || '';
  empNotesInput.value = emp.notes || '';
  checkExcluded.checked = s.excluded;

  // PASSES
  pcStatus.value = s.pc_status;
  pcExpires.value = s.pc_expires;
  pcRequested.value = s.pc_requested;

  ccStatus.value = s.cc_status;
  ccExpires.value = s.cc_expires;
  ccRequested.value = s.cc_requested;

  adminPanel.classList.remove('hidden');
}

// Save Basic Info
empForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    id: empIdInput.value.trim(),
    name: empNameInput.value.trim(),
    company: empCompanyInput.value.trim(),
    docId: empDocInput.value.trim(),
    jobTitle: empJobInput.value.trim(),
    notes: empNotesInput.value.trim()
  };

  await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  // Auto Update Exclusion if checked, via State API (separate call simplified here)
  // Realistically better to have one atomic save, but we split them in this backend.

  await fetchInitialData();
  alert('Datos guardados');
});

// Save State
document.getElementById('saveStateBtn').addEventListener('click', async () => {
  const id = empIdInput.value;
  if (!id) return;

  const newState = {
    pc_status: pcStatus.value,
    pc_expires: pcExpires.value,
    pc_requested: pcRequested.value,
    cc_status: ccStatus.value,
    cc_expires: ccExpires.value,
    cc_requested: ccRequested.value,
    excluded: checkExcluded.checked
  };

  await fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, state: newState })
  });

  // Also save notes if changed in this view?
  // For now assume user clicked "Guardar Datos" for notes.

  await fetchInitialData();
  adminPanel.classList.add('hidden');
});

// Admin List Render
function renderAdminList() {
  const term = adminSearch.value.toLowerCase();
  adminList.innerHTML = employees
    .filter(e => e.name.toLowerCase().includes(term))
    .map(e => `
            <div onclick="editEmp('${e.id}')" class="p-2 border-b hover:bg-slate-100 cursor-pointer text-xs">
                <b>${e.name}</b> <br> <span class="text-slate-500">${e.company}</span>
            </div>
        `).join('');
}
adminSearch.addEventListener('input', renderAdminList);


// Event Listeners for main UI
globalSearch.addEventListener('input', refreshAllViews);
manageBtn.addEventListener('click', () => {
  empForm.reset();
  empIdInput.removeAttribute('disabled');
  adminPanel.classList.remove('hidden');
  renderAdminList();
});
document.getElementById('closeAdmin').addEventListener('click', () => adminPanel.classList.add('hidden'));
document.getElementById('clearEmp').addEventListener('click', () => {
  empForm.reset();
  empIdInput.removeAttribute('disabled');
});


// ========== REQUESTS FUNCTIONALITY ==========

let selectedRequestType = 'PC';
let selectedEmployees = new Set();
let currentSuggestions = { noPasses: [], expiring: [] };

// DOM References
const requestModal = document.getElementById('requestModal');
const newRequestBtn = document.getElementById('newRequestBtn');
const closeRequestModal = document.getElementById('closeRequestModal');
const cancelRequestBtn = document.getElementById('cancelRequestBtn');
const saveRequestBtn = document.getElementById('saveRequestBtn');
const typePC = document.getElementById('typePC');
const typeCC = document.getElementById('typeCC');
const tabNoPasses = document.getElementById('tabNoPasses');
const tabExpiring = document.getElementById('tabExpiring');
const tabManual = document.getElementById('tabManual');
const noPassesList = document.getElementById('noPassesList');
const expiringList = document.getElementById('expiringList');
const manualList = document.getElementById('manualList');
const selectedCount = document.getElementById('selectedCount');
const requestNotes = document.getElementById('requestNotes');
const requestsTableBody = document.getElementById('requestsTableBody');
const suggestionsContainer = document.getElementById('suggestionsContainer');

// Fetch Requests
async function fetchRequests() {
  try {
    const res = await fetch('/api/requests');
    requests = await res.json();
    renderRequestsTable();
    renderSuggestions();
  } catch (e) {
    console.error(e);
  }
}

// Render Requests Table
function renderRequestsTable() {
  if (!requestsTableBody) return;

  if (requests.length === 0) {
    requestsTableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">No hay solicitudes creadas</td></tr>';
    return;
  }

  const rows = requests.map(req => {
    const statusColors = {
      DRAFT: 'bg-slate-100 text-slate-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };

    const badge = statusColors[req.status] || statusColors.DRAFT;
    const date = new Date(req.createdAt).toLocaleDateString('es-DO');

    return `
      <tr class="hover:bg-slate-50">
        <td class="px-4 py-3 text-sm font-mono text-slate-600">${req.id}</td>
        <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-medium rounded ${req.type === 'PC' ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}">${req.type}</span></td>
        <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-medium rounded ${badge}">${req.status}</span></td>
        <td class="px-4 py-3 text-sm">${req.employeeIds.length} personas</td>
        <td class="px-4 py-3 text-sm text-slate-600">${date}</td>
        <td class="px-4 py-3">
          <button onclick="viewRequest('${req.id}')" class="text-purple-600 hover:text-purple-800 text-sm font-medium">Ver</button>
          <button onclick="deleteRequestConfirm('${req.id}')" class="ml-3 text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');

  requestsTableBody.innerHTML = rows;
}

// Render Suggestions
function renderSuggestions() {
  if (!suggestionsContainer) return;

  const pcSuggestions = calculateSuggestions('PC');
  const ccSuggestions = calculateSuggestions('CC');

  let html = '';

  if (pcSuggestions.noPasses.length > 0 || pcSuggestions.expiring.length > 0) {
    html += `
      <div class="glass-panel border-l-4 border-teal-500 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <div class="bg-teal-100 p-2 rounded-lg">
            <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-teal-900">Punta Cana</h4>
            <p class="text-sm text-teal-700 mt-1">
              ${pcSuggestions.noPasses.length > 0 ? `<span class="font-semibold">${pcSuggestions.noPasses.length}</span> sin pase` : ''}
              ${pcSuggestions.noPasses.length > 0 && pcSuggestions.expiring.length > 0 ? ' • ' : ''}
              ${pcSuggestions.expiring.length > 0 ? `<span class="font-semibold">${pcSuggestions.expiring.length}</span> próximos a vencer` : ''}
            </p>
          </div>
          <button onclick="openRequestModalWithType('PC')" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Crear Solicitud
          </button>
        </div>
      </div>
    `;
  }

  if (ccSuggestions.noPasses.length > 0 || ccSuggestions.expiring.length > 0) {
    html += `
      <div class="glass-panel border-l-4 border-indigo-500 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <div class="bg-indigo-100 p-2 rounded-lg">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-indigo-900">Cap Cana</h4>
            <p class="text-sm text-indigo-700 mt-1">
              ${ccSuggestions.noPasses.length > 0 ? `<span class="font-semibold">${ccSuggestions.noPasses.length}</span> sin pase` : ''}
              ${ccSuggestions.noPasses.length > 0 && ccSuggestions.expiring.length > 0 ? ' • ' : ''}
              ${ccSuggestions.expiring.length > 0 ? `<span class="font-semibold">${ccSuggestions.expiring.length}</span> próximos a vencer` : ''}
            </p>
          </div>
          <button onclick="openRequestModalWithType('CC')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Crear Solicitud
          </button>
        </div>
      </div>
    `;
  }

  suggestionsContainer.innerHTML = html || '<p class="text-slate-500 text-center py-8">No hay sugerencias en este momento ✅</p>';
}

function calculateSuggestions(type) {
  const now = new Date();
  const noPasses = [];
  const expiring = [];

  employees.forEach(emp => {
    const state = normalizeState(emp.id);
    const statusKey = type === 'PC' ? 'pc_status' : 'cc_status';
    const expiresKey = type === 'PC' ? 'pc_expires' : 'cc_expires';

    const status = state[statusKey];
    const expires = state[expiresKey];

    if (status === 'NONE' && !state.excluded) {
      noPasses.push(emp);
    }

    if (status === 'ACTIVE' && expires) {
      const expDate = new Date(expires);
      const daysUntil = Math.floor((expDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntil <= WARNING_DAYS && daysUntil >= 0) {
        expiring.push({ ...emp, daysUntilExpire: daysUntil });
      }
    }
  });

  return { noPasses, expiring };
}

// Open Modal
window.openRequestModalWithType = function (type) {
  selectedRequestType = type;
  selectedEmployees.clear();
  requestNotes.value = '';

  // Update UI
  if (type === 'PC') {
    typePC.classList.add('border-teal-300', 'bg-teal-50', 'text-teal-700');
    typePC.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
    typeCC.classList.remove('border-indigo-300', 'bg-indigo-50', 'text-indigo-700');
    typeCC.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  } else {
    typeCC.classList.add('border-indigo-300', 'bg-indigo-50', 'text-indigo-700');
    typeCC.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
    typePC.classList.remove('border-teal-300', 'bg-teal-50', 'text-teal-700');
    typePC.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  }

  loadSuggestions(type);
  requestModal.classList.remove('hidden');
};

newRequestBtn.addEventListener('click', () => openRequestModalWithType('PC'));

typePC.addEventListener('click', () => {
  selectedRequestType = 'PC';
  typePC.classList.add('border-teal-300', 'bg-teal-50', 'text-teal-700');
  typePC.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
  typeCC.classList.remove('border-indigo-300', 'bg-indigo-50', 'text-indigo-700');
  typeCC.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  loadSuggestions('PC');
});

typeCC.addEventListener('click', () => {
  selectedRequestType = 'CC';
  typeCC.classList.add('border-indigo-300', 'bg-indigo-50', 'text-indigo-700');
  typeCC.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
  typePC.classList.remove('border-teal-300', 'bg-teal-50', 'text-teal-700');
  typePC.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  loadSuggestions('CC');
});

async function loadSuggestions(type) {
  currentSuggestions = calculateSuggestions(type);

  renderEmployeeCheckboxes(noPassesList, currentSuggestions.noPasses);
  renderEmployeeCheckboxes(expiringList, currentSuggestions.expiring);
  renderEmployeeCheckboxes(manualList, employees);

  document.getElementById('countNoPasses').textContent = currentSuggestions.noPasses.length;
  document.getElementById('countExpiring').textContent = currentSuggestions.expiring.length;
}

function renderEmployeeCheckboxes(container, list) {
  if (list.length === 0) {
    container.innerHTML = '<p class="text-slate-500 text-sm">No hay empleados</p>';
    return;
  }

  const html = list.map(emp => {
    const checked = selectedEmployees.has(emp.id) ? 'checked' : '';
    return `
      <label class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
        <input type="checkbox" ${checked} value="${emp.id}" onchange="toggleEmployee('${emp.id}')" class="w-4 h-4 text-purple-600 rounded">
        <span class="text-sm flex-1">${emp.name} <span class="text-xs text-slate-500">(${emp.company})</span></span>
        ${emp.daysUntilExpire !== undefined ? `<span class="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">${emp.daysUntilExpire}d</span>` : ''}
      </label>
    `;
  }).join('');

  container.innerHTML = html;
}

window.toggleEmployee = function (id) {
  if (selectedEmployees.has(id)) {
    selectedEmployees.delete(id);
  } else {
    selectedEmployees.add(id);
  }
  selectedCount.textContent = `${selectedEmployees.size} empleados seleccionados`;
};

// Switch tabs
tabNoPasses.addEventListener('click', () => switchSuggestionTab('noPasses'));
tabExpiring.addEventListener('click', () => switchSuggestionTab('expiring'));
tabManual.addEventListener('click', () => switchSuggestionTab('manual'));

function switchSuggestionTab(tab) {
  // Update tabs
  [tabNoPasses, tabExpiring, tabManual].forEach(t => {
    t.classList.remove('active', 'border-purple-500', 'text-purple-600');
    t.classList.add('border-transparent', 'text-slate-500');
  });

  // Update lists
  [noPassesList, expiringList, manualList].forEach(l => l.classList.add('hidden'));

  if (tab === 'noPasses') {
    tabNoPasses.classList.add('active', 'border-purple-500', 'text-purple-600');
    tabNoPasses.classList.remove('border-transparent', 'text-slate-500');
    noPassesList.classList.remove('hidden');
  } else if (tab === 'expiring') {
    tabExpiring.classList.add('active', 'border-purple-500', 'text-purple-600');
    tabExpiring.classList.remove('border-transparent', 'text-slate-500');
    expiringList.classList.remove('hidden');
  } else {
    tabManual.classList.add('active', 'border-purple-500', 'text-purple-600');
    tabManual.classList.remove('border-transparent', 'text-slate-500');
    manualList.classList.remove('hidden');
  }
}

// Save Request
saveRequestBtn.addEventListener('click', async () => {
  if (selectedEmployees.size === 0) {
    alert('Debes seleccionar al menos un empleado');
    return;
  }

  const request = {
    type: selectedRequestType,
    status: 'PENDING',
    employeeIds: Array.from(selectedEmployees),
    notes: requestNotes.value
  };

  try {
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    requestModal.classList.add('hidden');
    await fetchRequests();
    alert('✅ Solicitud creada exitosamente');
  } catch (e) {
    console.error(e);
    alert('❌ Error al crear solicitud');
  }
});

closeRequestModal.addEventListener('click', () => requestModal.classList.add('hidden'));
cancelRequestBtn.addEventListener('click', () => requestModal.classList.add('hidden'));

window.viewRequest = function (id) {
  const req = requests.find(r => r.id === id);
  if (!req) return;

  const empNames = req.employeeIds.map(eid => {
    const emp = employees.find(e => e.id === eid);
    return emp ? emp.name : eid;
  }).join(', ');

  alert(`Solicitud: ${req.id}\nTipo: ${req.type}\nEstado: ${req.status}\nEmpleados: ${empNames}\nNotas: ${req.notes || 'N/A'}`);
};

window.deleteRequestConfirm = async function (id) {
  if (!confirm('¿Eliminar esta solicitud?')) return;

  try {
    await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    await fetchRequests();
  } catch (e) {
    console.error(e);
  }
};

init();
