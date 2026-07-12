const DB_KEY = 'roadbook-ledger-v2';
const LEGACY_DB_KEY = 'cx5-care-ledger-v1';
const METER_CIRC = 389;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (date) => {
  if (!date) return 'No date';
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
const money = (value) => `${state.vehicle.currency || '$'}${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const miles = (value) => Number(value || 0).toLocaleString();
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const defaultServices = [
  {
    id: 'engine_oil', name: 'Engine oil', category: 'Engine', official: true,
    normalMiles: 7500, severeMiles: 5000, intervalMonthsNormal: 6, intervalMonthsSevere: 4, firstDue: 5000,
    note: 'Use this with the oil filter. Schedule 2 is more frequent and fits tougher driving.', keywords: ['oil change', 'engine oil', 'lube']
  },
  {
    id: 'engine_oil_filter', name: 'Engine oil filter', category: 'Engine', official: true,
    normalMiles: 7500, severeMiles: 5000, intervalMonthsNormal: 6, intervalMonthsSevere: 4, firstDue: 5000,
    note: 'Track with engine oil. If Carfax only says oil change, the app usually imports both oil and filter.', keywords: ['oil filter', 'filter replaced', 'oil and filter']
  },
  {
    id: 'tire_rotation', name: 'Tire rotation', category: 'Tires', official: true,
    normalMiles: 7500, severeMiles: 5000, intervalMonthsNormal: 6, intervalMonthsSevere: 4, firstDue: 5000,
    note: 'Keeps wear even, especially useful on AWD vehicles.', keywords: ['tire rotation', 'tires rotated', 'rotate tires']
  },
  {
    id: 'spark_plugs', name: 'Spark plugs', category: 'Ignition', official: true,
    normalMiles: 75000, severeMiles: 75000, intervalMonthsNormal: null, intervalMonthsSevere: null, firstDue: 75000,
    note: 'Intervals vary by engine. Verify the correct interval in the owner’s manual.', keywords: ['spark plug', 'spark plugs']
  },
  {
    id: 'coolant_fl22', name: 'Engine coolant', category: 'Cooling', official: true,
    normalMiles: 60000, severeMiles: 60000, intervalMonthsNormal: 60, intervalMonthsSevere: 60, firstDue: 120000,
    note: 'Coolant type and first replacement interval vary by vehicle. Verify both before servicing.', keywords: ['coolant', 'antifreeze', 'fl22']
  },
  {
    id: 'cabin_air_filter', name: 'Cabin air filter', category: 'HVAC', official: true,
    normalMiles: 25000, severeMiles: 25000, intervalMonthsNormal: 24, intervalMonthsSevere: 24, firstDue: 25000,
    note: 'Helps airflow and smell. Cheap and easy to forget.', keywords: ['cabin air filter', 'pollen filter']
  },
  {
    id: 'engine_air_filter', name: 'Engine air filter', category: 'Engine', official: true,
    normalMiles: 37500, severeMiles: 30000, intervalMonthsNormal: 30, intervalMonthsSevere: 24, firstDue: 30000,
    note: 'Replace more often if dusty or dirty. Inspect visually if unsure.', keywords: ['air filter', 'engine air filter']
  },
  {
    id: 'brake_inspection', name: 'Brake inspection', category: 'Brakes', official: true,
    normalMiles: 15000, severeMiles: 10000, intervalMonthsNormal: 12, intervalMonthsSevere: 8, firstDue: 10000,
    note: 'Logs inspections, pads, rotors, calipers, brake lines, and brake wear notes.', keywords: ['brake inspection', 'brakes checked', 'brake pads', 'rotors', 'caliper']
  },
  {
    id: 'brake_fluid_check', name: 'Brake fluid level/check', category: 'Brakes', official: true,
    normalMiles: 7500, severeMiles: 5000, intervalMonthsNormal: 6, intervalMonthsSevere: 4, firstDue: 5000,
    note: 'Official schedule emphasizes checking the level. Add a custom fluid flush reminder if your mechanic recommends it.', keywords: ['brake fluid', 'brake flush']
  },
  {
    id: 'drive_belts', name: 'Drive belts inspection', category: 'Engine', official: true,
    normalMiles: 37500, severeMiles: 40000, intervalMonthsNormal: 30, intervalMonthsSevere: 32, firstDue: 37500,
    note: 'Inspect for cracks/noise. Replace when worn.', keywords: ['drive belt', 'serpentine belt', 'belts inspected']
  },
  {
    id: 'suspension_steering', name: 'Steering/suspension inspection', category: 'Chassis', official: true,
    normalMiles: 30000, severeMiles: 30000, intervalMonthsNormal: 24, intervalMonthsSevere: 24, firstDue: 30000,
    note: 'Covers steering, suspension, ball joints, bearings, and related play/noise.', keywords: ['suspension', 'steering', 'ball joint', 'wheel bearing', 'alignment']
  },
  {
    id: 'exhaust_heat_shields', name: 'Exhaust and heat shield inspection', category: 'Chassis', official: true,
    normalMiles: 45000, severeMiles: 45000, intervalMonthsNormal: 60, intervalMonthsSevere: 60, firstDue: 45000,
    note: 'Rust-prone area on older northern cars. Listen for rattles.', keywords: ['exhaust', 'heat shield', 'muffler']
  },
  {
    id: 'rear_diff_oil', name: 'Rear differential oil', category: 'Drivetrain', official: true, drivetrain: 'AWD',
    normalMiles: null, severeMiles: 30000, intervalMonthsNormal: null, intervalMonthsSevere: null, firstDue: 30000,
    note: 'Only applies to AWD/4WD vehicles. Verify the interval and required fluid in the owner’s manual.', keywords: ['rear differential', 'differential fluid', 'rear diff']
  },
  {
    id: 'transfer_oil', name: 'Transfer case oil', category: 'Drivetrain', official: true, drivetrain: 'AWD',
    normalMiles: null, severeMiles: 30000, intervalMonthsNormal: null, intervalMonthsSevere: null, firstDue: 30000,
    note: 'Only applies to AWD. Track with rear differential service if applicable.', keywords: ['transfer case', 'transfer oil', 'transfer fluid']
  },
  {
    id: 'transmission_service', name: 'Automatic transmission drain/fill', category: 'Drivetrain', official: false,
    normalMiles: 60000, severeMiles: 50000, intervalMonthsNormal: null, intervalMonthsSevere: null, firstDue: 60000,
    note: 'A planning reminder only. Transmission designs and fluid requirements vary; check the manual or ask a qualified mechanic.', keywords: ['transmission fluid', 'atf', 'transmission service', 'drain and fill']
  },
  {
    id: 'battery', name: 'Battery test / replacement', category: 'Electrical', official: false,
    normalMiles: null, severeMiles: null, intervalMonthsNormal: 48, intervalMonthsSevere: 42, firstDue: null,
    note: 'Custom reminder. Heat/cold and short trips can shorten battery life.', keywords: ['battery', 'charging system']
  },
  {
    id: 'wipers', name: 'Wiper blades', category: 'Visibility', official: false,
    normalMiles: null, severeMiles: null, intervalMonthsNormal: 12, intervalMonthsSevere: 12, firstDue: null,
    note: 'Custom comfort/safety reminder.', keywords: ['wiper', 'wipers', 'windshield blade']
  }
];


const seededMaintenance = [
  { id: 'cf-oil-2015-11051', serviceId: 'engine_oil', date: '2015-08-21', mileage: 11051, amount: 0, vendor: 'Clinton Auto Service', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-filter-2015-11051', serviceId: 'engine_oil_filter', date: '2015-08-21', mileage: 11051, amount: 0, vendor: 'Clinton Auto Service', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-rotate-2016-26005', serviceId: 'tire_rotation', date: '2016-06-22', mileage: 26005, amount: 0, vendor: 'Clinton Auto Service', notes: 'Tires rotated.', source: 'carfax' },
  { id: 'cf-oil-2017-49468', serviceId: 'engine_oil', date: '2017-11-22', mileage: 49468, amount: 0, vendor: 'Clinton Auto Service', notes: 'Oil and filter changed during recommended maintenance.', source: 'carfax' },
  { id: 'cf-filter-2017-49468', serviceId: 'engine_oil_filter', date: '2017-11-22', mileage: 49468, amount: 0, vendor: 'Clinton Auto Service', notes: 'Oil and filter changed during recommended maintenance.', source: 'carfax' },
  { id: 'cf-brakes-2017-49468', serviceId: 'brake_inspection', date: '2017-11-22', mileage: 49468, amount: 0, vendor: 'Clinton Auto Service', notes: 'Front and rear brake pads and rotors replaced.', source: 'carfax' },
  { id: 'cf-air-2018-62494', serviceId: 'engine_air_filter', date: '2018-09-17', mileage: 62494, amount: 0, vendor: 'Lindfield Transmission', notes: 'Engine air filter replaced.', source: 'carfax' },
  { id: 'cf-cabin-2018-62494', serviceId: 'cabin_air_filter', date: '2018-09-17', mileage: 62494, amount: 0, vendor: 'Lindfield Transmission', notes: 'Cabin air filter replaced/cleaned.', source: 'carfax' },
  { id: 'cf-rotate-2018-64502', serviceId: 'tire_rotation', date: '2018-10-31', mileage: 64502, amount: 0, vendor: 'Lindfield Transmission', notes: 'Tires balanced and rotated; alignment performed.', source: 'carfax' },
  { id: 'cf-oil-2019-77420', serviceId: 'engine_oil', date: '2019-09-11', mileage: 77420, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-filter-2019-77420', serviceId: 'engine_oil_filter', date: '2019-09-11', mileage: 77420, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-oil-2020-92018', serviceId: 'engine_oil', date: '2020-09-17', mileage: 92018, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-filter-2020-92018', serviceId: 'engine_oil_filter', date: '2020-09-17', mileage: 92018, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-battery-2021-95552', serviceId: 'battery', date: '2021-01-27', mileage: 95552, amount: 0, vendor: 'Lindfield Transmission', notes: 'Battery replaced; charging system checked.', source: 'carfax' },
  { id: 'cf-air-2021-95552', serviceId: 'engine_air_filter', date: '2021-01-27', mileage: 95552, amount: 0, vendor: 'Lindfield Transmission', notes: 'Engine air filter replaced.', source: 'carfax' },
  { id: 'cf-cabin-2021-95552', serviceId: 'cabin_air_filter', date: '2021-01-27', mileage: 95552, amount: 0, vendor: 'Lindfield Transmission', notes: 'Cabin air filter replaced/cleaned.', source: 'carfax' },
  { id: 'cf-brakes-2021-95552', serviceId: 'brake_inspection', date: '2021-01-27', mileage: 95552, amount: 0, vendor: 'Lindfield Transmission', notes: 'Front and rear brake pads and rotors replaced.', source: 'carfax' },
  { id: 'cf-belt-2021-98000', serviceId: 'drive_belts', date: '2021-06-01', mileage: 98000, amount: 0, vendor: 'Steet Ponte Mazda', notes: 'Serpentine belt replaced.', source: 'carfax' },
  { id: 'cf-suspension-2021-98000', serviceId: 'suspension_steering', date: '2021-06-01', mileage: 98000, amount: 0, vendor: 'Steet Ponte Mazda', notes: 'Rear shock absorbers replaced.', source: 'carfax' },
  { id: 'cf-brakes-2022', serviceId: 'brake_inspection', date: '2022-03-22', mileage: 104264, amount: 0, vendor: 'Lindfield Transmission', notes: 'Brake pads and rotors replaced; mileage anchored to the adjacent inspection record.', source: 'carfax' },
  { id: 'cf-suspension-2022', serviceId: 'suspension_steering', date: '2022-03-22', mileage: 104264, amount: 0, vendor: 'Lindfield Transmission', notes: 'Rear springs, stabilizer links, and sway-bar links replaced.', source: 'carfax' },
  { id: 'cf-oil-2022-109036', serviceId: 'engine_oil', date: '2022-09-19', mileage: 109036, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-filter-2022-109036', serviceId: 'engine_oil_filter', date: '2022-09-19', mileage: 109036, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-battery-2023-120039', serviceId: 'battery', date: '2023-10-17', mileage: 120039, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Battery replaced.', source: 'carfax' },
  { id: 'cf-oil-2023-120039', serviceId: 'engine_oil', date: '2023-10-17', mileage: 120039, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-filter-2023-120039', serviceId: 'engine_oil_filter', date: '2023-10-17', mileage: 120039, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-suspension-2024-128300', serviceId: 'suspension_steering', date: '2024-06-20', mileage: 128300, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Front wheel bearings and both outer tie-rod ends replaced.', source: 'carfax' },
  { id: 'cf-air-2024-131411', serviceId: 'engine_air_filter', date: '2024-09-01', mileage: 131411, amount: 0, vendor: 'Valvoline Instant Oil Change', notes: 'Engine air filter replaced.', source: 'carfax' },
  { id: 'cf-oil-2024-135065', serviceId: 'engine_oil', date: '2024-12-19', mileage: 135065, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Oil and filter changed; water pump and serpentine belt replaced.', source: 'carfax' },
  { id: 'cf-filter-2024-135065', serviceId: 'engine_oil_filter', date: '2024-12-19', mileage: 135065, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Oil and filter changed.', source: 'carfax' },
  { id: 'cf-belt-2024-135065', serviceId: 'drive_belts', date: '2024-12-19', mileage: 135065, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Serpentine belt replaced.', source: 'carfax' },
  { id: 'cf-battery-check-2026', serviceId: 'battery', date: '2026-01-23', mileage: 144515, amount: 0, vendor: 'Jerry Smith & Sons Car Care Center', notes: 'Battery/charging system checked for a no-start complaint.', source: 'carfax' },
  { id: 'cf-oil-2026-145519', serviceId: 'engine_oil', date: '2026-05-07', mileage: 145519, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed; tire condition and pressure checked.', source: 'carfax' },
  { id: 'cf-filter-2026-145519', serviceId: 'engine_oil_filter', date: '2026-05-07', mileage: 145519, amount: 0, vendor: 'Lindfield Transmission', notes: 'Oil and filter changed.', source: 'carfax' }
];

const defaultState = () => ({
  vehicle: {
    name: 'My vehicle', year: '', make: '', model: '', trim: '', drivetrain: 'unknown',
    currentMileage: 0, startMileage: 0, currency: '$', dueSoonMiles: 1200, scheduleProfile: 'normal'
  },
  services: structuredClone(defaultServices),
  maintenance: [],
  expenses: [],
  parsedDrafts: [],
  onboardingComplete: false
});

const demoState = () => ({
  ...defaultState(),
  vehicle: { name: 'My CX-5', year: 2015, make: 'Mazda', model: 'CX-5', trim: 'Grand Touring · 2.5L', drivetrain: 'AWD', currentMileage: 147000, startMileage: 145914, currency: '$', dueSoonMiles: 1200, scheduleProfile: 'severe' },
  maintenance: structuredClone(seededMaintenance),
  onboardingComplete: true
});

let state = loadState();
let currentView = 'dashboard';
let dialogMode = null;
let editingId = null;

function loadState() {
  try {
    const currentSaved = localStorage.getItem(DB_KEY);
    const legacySaved = localStorage.getItem(LEGACY_DB_KEY);
    const saved = currentSaved || legacySaved;
    if (!saved) return defaultState();
    const parsed = JSON.parse(saved);
    const fresh = defaultState();
    return {
      ...fresh,
      ...parsed,
      vehicle: { ...fresh.vehicle, ...(parsed.vehicle || {}) },
      services: mergeServices(parsed.services || []),
      maintenance: Array.isArray(parsed.maintenance) ? parsed.maintenance : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      parsedDrafts: [],
      onboardingComplete: currentSaved ? Boolean(parsed.onboardingComplete) : Boolean(legacySaved)
    };
  } catch (error) {
    console.error(error);
    return defaultState();
  }
}

function mergeServices(savedServices) {
  const byId = new Map(defaultServices.map(service => [service.id, structuredClone(service)]));
  savedServices.forEach(service => byId.set(service.id, { ...(byId.get(service.id) || {}), ...service }));
  return Array.from(byId.values());
}

function saveState() {
  localStorage.setItem(DB_KEY, JSON.stringify({ ...state, parsedDrafts: [] }));
}

function toast(message) {
  const toastEl = $('#toast');
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function activeInterval(service) {
  const severe = state.vehicle.scheduleProfile === 'severe';
  return {
    miles: severe ? service.severeMiles : service.normalMiles,
    months: severe ? service.intervalMonthsSevere : service.intervalMonthsNormal
  };
}

function serviceApplies(service) {
  if (!service.drivetrain) return true;
  if (state.vehicle.drivetrain === 'unknown') return true;
  return service.drivetrain === state.vehicle.drivetrain;
}

function getServiceRecords(serviceId) {
  return state.maintenance
    .filter(item => item.serviceId === serviceId)
    .sort((a, b) => Number(b.mileage || 0) - Number(a.mileage || 0) || new Date(b.date || 0) - new Date(a.date || 0));
}

function addMonths(dateISO, months) {
  if (!dateISO || !months) return null;
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

function calcDue(service) {
  const records = getServiceRecords(service.id);
  const last = records[0];
  const interval = activeInterval(service);
  const current = Number(state.vehicle.currentMileage || 0);
  const dueSoon = Number(state.vehicle.dueSoonMiles || 1200);
  let dueMileage = null;
  let dueDate = null;
  let basis = [];
  let status = 'ok';
  let reason = '';

  if (!serviceApplies(service)) {
    return { service, status: 'ok', reason: 'Not applicable to current drivetrain', dueMileage: null, dueDate: null, last: null, basis: [] };
  }

  if (interval.miles) {
    if (last?.mileage) {
      dueMileage = Number(last.mileage) + Number(interval.miles);
    } else if (service.firstDue) {
      const first = Number(service.firstDue);
      dueMileage = current > first ? Math.ceil(current / Number(interval.miles)) * Number(interval.miles) : first;
    }
    if (dueMileage) basis.push(`${miles(dueMileage)} mi`);
  }

  if (interval.months) {
    if (last?.date) dueDate = addMonths(last.date, interval.months);
    else if (!interval.miles) dueDate = null;
    if (dueDate) basis.push(fmtDate(dueDate));
  }

  const noHistoryNeeded = !last && (service.firstDue || interval.miles || interval.months);
  const today = todayISO();
  const mileOver = dueMileage && current >= dueMileage;
  const dateOver = dueDate && today >= dueDate;
  const mileSoon = dueMileage && current >= dueMileage - dueSoon;
  const dateSoon = dueDate && daysBetween(today, dueDate) <= 30 && daysBetween(today, dueDate) >= 0;

  if (mileOver || dateOver) {
    status = 'overdue';
    reason = mileOver ? `${miles(current - dueMileage)} miles overdue` : `Due by date`;
  } else if (mileSoon || dateSoon) {
    status = 'soon';
    reason = mileSoon ? `${miles(dueMileage - current)} miles left` : `Due within 30 days`;
  } else if (noHistoryNeeded) {
    status = 'unknown';
    reason = 'No service history logged yet';
  } else {
    status = 'ok';
    reason = dueMileage ? `${miles(Math.max(0, dueMileage - current))} miles left` : 'No immediate action';
  }

  if (!dueMileage && !dueDate && !last) {
    status = 'unknown';
    reason = 'Add a first service record';
  }

  return { service, status, reason, dueMileage, dueDate, last, basis };
}

function daysBetween(a, b) {
  const ad = new Date(`${a}T00:00:00`);
  const bd = new Date(`${b}T00:00:00`);
  return Math.round((bd - ad) / 86400000);
}

function dueRank(item) {
  const rank = { overdue: 0, soon: 1, unknown: 2, ok: 3 }[item.status] ?? 4;
  return rank * 100000000 + (item.dueMileage || 99999999);
}

function getDueItems() {
  return state.services.filter(serviceApplies).map(calcDue).sort((a, b) => dueRank(a) - dueRank(b));
}

function render() {
  saveState();
  $('#mileageInput').value = state.vehicle.currentMileage;
  $('#vehicleIdentityChip').textContent = [state.vehicle.year, state.vehicle.make, state.vehicle.model].filter(Boolean).join(' ') || 'Your vehicle';
  $('#vehicleDetailChip').textContent = [state.vehicle.trim, state.vehicle.drivetrain !== 'unknown' ? state.vehicle.drivetrain : ''].filter(Boolean).join(' · ') || 'Ready when you are';
  $('#todayLabel').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  renderDashboard();
  renderMaintenance();
  renderExpenses();
  renderReports();
  renderSettings();
}

function renderDashboard() {
  const dueItems = getDueItems();
  const overdue = dueItems.filter(item => item.status === 'overdue').length;
  const soon = dueItems.filter(item => item.status === 'soon').length;
  const unknown = dueItems.filter(item => item.status === 'unknown').length;
  const expensesTotal = state.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthTotal = state.expenses.filter(item => (item.date || '').slice(0,7) === month).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const milesTracked = Math.max(0, Number(state.vehicle.currentMileage || 0) - Number(state.vehicle.startMileage || state.vehicle.currentMileage || 0));
  const costPerMile = milesTracked > 0 ? expensesTotal / milesTracked : 0;
  const score = Math.max(0, Math.min(100, Math.round(100 - overdue * 10 - soon * 5 - unknown * 2.5)));

  $('#heroTitle').textContent = overdue ? `${overdue} service item${overdue === 1 ? '' : 's'} need a decision.` : 'Your ownership, clearly organized.';
  const highestHistoryMileage = Math.max(0, ...state.maintenance.map(item => Number(item.mileage || 0)));
  $('#heroSubtitle').textContent = overdue ? `${state.maintenance.length ? `Your history is organized through ${miles(highestHistoryMileage)} miles. ` : ''}Prioritize safety and fluid items first.` : 'Maintenance history is organized. Add expenses as they happen to build the true cost of ownership.';
  $('#totalSpent').textContent = money(expensesTotal);
  $('#monthSpent').textContent = money(monthTotal);
  $('#overdueCount').textContent = overdue;
  $('#costPerMile').textContent = money(costPerMile);
  $('#healthScore').textContent = score;
  $('#healthMeter').style.strokeDashoffset = String(METER_CIRC - METER_CIRC * (score / 100));

  $('#nextDueList').innerHTML = dueItems.slice(0, 6).map(renderServiceCard).join('') || empty('No maintenance items yet.');
  renderTimeline();
  drawCategoryChart();
}

function renderMaintenance() {
  const filter = $('#statusFilter').value || 'all';
  const items = getDueItems().filter(item => filter === 'all' || item.status === filter);
  $('#maintenanceList').innerHTML = items.map(renderServiceCard).join('') || empty('Nothing matches this filter.');

  const historyBody = $('#maintenanceHistoryRows');
  if (historyBody) {
    const history = [...state.maintenance].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || Number(b.mileage || 0) - Number(a.mileage || 0));
    historyBody.innerHTML = history.map(item => `
      <tr>
        <td>${fmtDate(item.date)}</td>
        <td>${item.mileage ? `${miles(item.mileage)} mi` : '—'}</td>
        <td><strong>${escapeHTML(serviceName(item.serviceId))}</strong></td>
        <td><span class="badge ${item.source === 'carfax' ? 'custom' : 'official'}">${escapeHTML(item.vendor || item.source || 'Manual')}</span></td>
        <td>${item.amount ? money(item.amount) : '—'}</td>
        <td>${escapeHTML(item.notes || '')}</td>
      </tr>`).join('') || '<tr><td colspan="6">No service history yet.</td></tr>';
  }
}

function renderServiceCard(item) {
  const { service, status, reason, dueMileage, dueDate, last } = item;
  const interval = activeInterval(service);
  const intervalCopy = [interval.miles ? `every ${miles(interval.miles)} mi` : null, interval.months ? `every ${interval.months} mo` : null].filter(Boolean).join(' / ') || 'as needed';
  const dueCopy = [dueMileage ? `Due ${miles(dueMileage)} mi` : null, dueDate ? `Due ${fmtDate(dueDate)}` : null].filter(Boolean).join(' · ') || 'Due after first log';
  const lastCopy = last ? `Last done ${last.mileage ? `${miles(last.mileage)} mi` : ''}${last.date ? ` on ${fmtDate(last.date)}` : ''}` : 'No saved history';
  return `
    <article class="service-card" data-service-id="${service.id}">
      <div class="service-main">
        <div class="service-title-row">
          <h4>${escapeHTML(service.name)}</h4>
          <span class="badge ${status}">${statusLabel(status)}</span>
          <span class="badge ${service.official ? 'official' : 'custom'}">${service.official ? 'Suggested' : 'Custom'}</span>
        </div>
        <div class="service-meta">
          <span>${escapeHTML(service.category || 'Service')}</span>
          <span>${intervalCopy}</span>
          <span>${dueCopy}</span>
          <span>${lastCopy}</span>
        </div>
        <div class="service-note">${escapeHTML(reason)}. ${escapeHTML(service.note || '')}</div>
      </div>
      <div class="service-actions">
        <button class="tiny-button" data-action="log-service" data-service-id="${service.id}">Log done</button>
        <button class="tiny-button" data-action="edit-service" data-service-id="${service.id}">Edit</button>
      </div>
    </article>
  `;
}

function statusLabel(status) {
  return ({ overdue: 'Overdue', soon: 'Due soon', ok: 'Okay', unknown: 'Needs history' })[status] || status;
}

function renderExpenses() {
  const query = ($('#expenseSearch').value || '').toLowerCase();
  const rows = [...state.expenses]
    .filter(item => !query || `${item.category} ${item.vendor} ${item.notes} ${item.amount}`.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || Number(b.mileage || 0) - Number(a.mileage || 0));

  $('#expenseRows').innerHTML = rows.map(item => `
    <tr>
      <td>${fmtDate(item.date)}</td>
      <td><span class="badge custom">${escapeHTML(item.category || 'Other')}</span></td>
      <td>${escapeHTML(item.vendor || '—')}</td>
      <td>${item.mileage ? `${miles(item.mileage)} mi` : '—'}</td>
      <td><strong>${money(item.amount)}</strong></td>
      <td>${escapeHTML(item.notes || '')}</td>
      <td><button class="tiny-button" data-action="delete-expense" data-expense-id="${item.id}">Delete</button></td>
    </tr>
  `).join('') || `<tr><td colspan="7">${empty('No expenses yet. Add fuel, repairs, parts, insurance, registration, tolls, and washes here.')}</td></tr>`;
}

function renderTimeline() {
  const activities = [
    ...state.maintenance.map(item => ({ type: 'Service', date: item.date, mileage: item.mileage, title: serviceName(item.serviceId), notes: item.notes, amount: item.amount })),
    ...state.expenses.map(item => ({ type: item.category || 'Expense', date: item.date, mileage: item.mileage, title: item.vendor || 'Expense', notes: item.notes, amount: item.amount }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 10);

  $('#activityTimeline').innerHTML = activities.map(item => `
    <div class="timeline-item">
      <time>${fmtDate(item.date)}</time>
      <div><strong>${escapeHTML(item.title || item.type)}</strong><span>${escapeHTML(item.notes || item.type || '')}${item.mileage ? ` · ${miles(item.mileage)} mi` : ''}</span></div>
      <div>${item.amount ? money(item.amount) : ''}</div>
    </div>
  `).join('') || empty('No activity yet. Import records or log your first service.');
}

function renderReports() {
  const due = getDueItems();
  const total = state.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const repairMaint = state.expenses.filter(item => ['Maintenance', 'Repair', 'Parts'].includes(item.category)).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const fuel = state.expenses.filter(item => item.category === 'Fuel').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  $('#reportSummary').innerHTML = [
    ['Overdue services', due.filter(item => item.status === 'overdue').length],
    ['Due soon services', due.filter(item => item.status === 'soon').length],
    ['Unknown history items', due.filter(item => item.status === 'unknown').length],
    ['Maintenance/repair spend', money(repairMaint)],
    ['Fuel spend', money(fuel)],
    ['Total spend', money(total)],
    ['Maintenance records', state.maintenance.length]
  ].map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`).join('');

  drawMonthlyChart();
}

function renderSettings() {
  $('#vehicleNameInput').value = state.vehicle.name || '';
  $('#vehicleYearInput').value = state.vehicle.year || '';
  $('#vehicleMakeInput').value = state.vehicle.make || '';
  $('#vehicleModelInput').value = state.vehicle.model || '';
  $('#vehicleTrimInput').value = state.vehicle.trim || '';
  $('#drivetrainInput').value = state.vehicle.drivetrain || 'unknown';
  $('#scheduleProfileInput').value = state.vehicle.scheduleProfile || 'severe';
  $('#currencyInput').value = state.vehicle.currency || '$';
  $('#startMileageInput').value = state.vehicle.startMileage || state.vehicle.currentMileage || 0;
  $('#dueSoonInput').value = state.vehicle.dueSoonMiles || 1200;
  $('#scheduleRules').innerHTML = state.services.map(service => {
    const interval = activeInterval(service);
    return `<div class="rule-card"><strong>${escapeHTML(service.name)}</strong><span>${interval.miles ? `${miles(interval.miles)} mi` : ''}${interval.months ? ` / ${interval.months} months` : ''}${service.drivetrain ? ` · ${service.drivetrain} only` : ''}</span></div>`;
  }).join('');
}

function saveSettings() {
  state.vehicle = {
    ...state.vehicle,
    name: $('#vehicleNameInput').value.trim() || 'My vehicle',
    year: Number($('#vehicleYearInput').value || 0),
    make: $('#vehicleMakeInput').value.trim(),
    model: $('#vehicleModelInput').value.trim(),
    trim: $('#vehicleTrimInput').value.trim(),
    drivetrain: $('#drivetrainInput').value,
    scheduleProfile: $('#scheduleProfileInput').value,
    currency: $('#currencyInput').value.trim() || '$',
    startMileage: Number($('#startMileageInput').value || state.vehicle.currentMileage || 0),
    dueSoonMiles: Number($('#dueSoonInput').value || 1200)
  };
  toast('Settings saved.');
  render();
}

function serviceName(serviceId) {
  return state.services.find(service => service.id === serviceId)?.name || 'Service';
}

function empty(text) {
  return `<div class="empty-state">${escapeHTML(text)}</div>`;
}

function openDialog(mode, payload = {}) {
  dialogMode = mode;
  editingId = payload.id || null;
  const titleMap = { expense: 'Add expense', maintenance: 'Log service', service: 'Edit service', customService: 'Add custom service' };
  $('#dialogTitle').textContent = titleMap[mode] || 'Add entry';
  $('#dialogFields').innerHTML = dialogFields(mode, payload);
  $('#entryDialog').showModal();
}

function dialogFields(mode, payload) {
  if (mode === 'expense') {
    const item = payload.item || {};
    return `
      <label>Date<input name="date" type="date" value="${item.date || todayISO()}" required /></label>
      <label>Category
        <select name="category">
          ${['Fuel','Maintenance','Repair','Parts','Insurance','Registration','Parking','Tolls','Car wash','Inspection','Other'].map(cat => `<option ${item.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
      </label>
      <label>Vendor<input name="vendor" type="text" value="${escapeAttr(item.vendor || '')}" placeholder="Dealer, repair shop, parts store..." /></label>
      <label>Amount<input name="amount" type="number" min="0" step="0.01" value="${item.amount || ''}" required /></label>
      <label>Mileage<input name="mileage" type="number" min="0" step="1" value="${item.mileage || state.vehicle.currentMileage || ''}" /></label>
      <label>Notes<textarea name="notes" rows="3" placeholder="What was this for?">${escapeHTML(item.notes || '')}</textarea></label>
    `;
  }

  if (mode === 'maintenance') {
    const serviceId = payload.serviceId || state.services[0]?.id;
    return `
      <label>Service
        <select name="serviceId">
          ${state.services.filter(serviceApplies).map(service => `<option value="${service.id}" ${serviceId === service.id ? 'selected' : ''}>${escapeHTML(service.name)}</option>`).join('')}
        </select>
      </label>
      <label>Date<input name="date" type="date" value="${payload.date || todayISO()}" required /></label>
      <label>Mileage<input name="mileage" type="number" min="0" step="1" value="${payload.mileage || state.vehicle.currentMileage || ''}" required /></label>
      <label>Cost, optional<input name="amount" type="number" min="0" step="0.01" value="${payload.amount || ''}" /></label>
      <label>Vendor<input name="vendor" type="text" value="${escapeAttr(payload.vendor || '')}" /></label>
      <label>Notes<textarea name="notes" rows="3">${escapeHTML(payload.notes || '')}</textarea></label>
      <label><span><input name="alsoExpense" type="checkbox" ${payload.amount ? 'checked' : ''} /> Also add this as an expense</span></label>
    `;
  }

  if (mode === 'service' || mode === 'customService') {
    const service = payload.service || { id: '', name: '', category: '', official: false };
    const interval = activeInterval(service);
    return `
      <label>Name<input name="name" type="text" value="${escapeAttr(service.name || '')}" required /></label>
      <label>Category<input name="category" type="text" value="${escapeAttr(service.category || '')}" placeholder="Engine, Brakes, Tires..." /></label>
      <label>Interval miles<input name="intervalMiles" type="number" min="0" step="1" value="${interval.miles || ''}" placeholder="Leave blank if date-only" /></label>
      <label>Interval months<input name="intervalMonths" type="number" min="0" step="1" value="${interval.months || ''}" placeholder="Leave blank if mileage-only" /></label>
      <label>First due mileage<input name="firstDue" type="number" min="0" step="1" value="${service.firstDue || ''}" /></label>
      <label>Applies to drivetrain
        <select name="drivetrain">
          <option value="" ${!service.drivetrain ? 'selected' : ''}>All / unknown</option>
          <option value="FWD" ${service.drivetrain === 'FWD' ? 'selected' : ''}>FWD only</option>
          <option value="AWD" ${service.drivetrain === 'AWD' ? 'selected' : ''}>AWD only</option>
        </select>
      </label>
      <label>Note<textarea name="note" rows="3">${escapeHTML(service.note || '')}</textarea></label>
    `;
  }
  return '';
}

function saveDialog(event) {
  event.preventDefault();
  const form = new FormData($('#entryForm'));
  if (dialogMode === 'expense') {
    state.expenses.push({
      id: uid(), date: form.get('date'), category: form.get('category'), vendor: form.get('vendor'),
      amount: Number(form.get('amount') || 0), mileage: Number(form.get('mileage') || 0), notes: form.get('notes') || ''
    });
    updateMileageFromForm(form.get('mileage'));
    toast('Expense saved.');
  }

  if (dialogMode === 'maintenance') {
    const record = {
      id: uid(), serviceId: form.get('serviceId'), date: form.get('date'), mileage: Number(form.get('mileage') || 0),
      amount: Number(form.get('amount') || 0), vendor: form.get('vendor') || '', notes: form.get('notes') || '', source: 'manual'
    };
    state.maintenance.push(record);
    if (form.get('alsoExpense') && record.amount) {
      state.expenses.push({ id: uid(), date: record.date, category: 'Maintenance', vendor: record.vendor, amount: record.amount, mileage: record.mileage, notes: `${serviceName(record.serviceId)}. ${record.notes || ''}`.trim() });
    }
    updateMileageFromForm(record.mileage);
    toast('Maintenance logged.');
  }

  if (dialogMode === 'service' || dialogMode === 'customService') {
    const serviceId = editingId || slugify(form.get('name')) || uid();
    const existing = state.services.find(service => service.id === serviceId);
    const intervalMiles = Number(form.get('intervalMiles') || 0) || null;
    const intervalMonths = Number(form.get('intervalMonths') || 0) || null;
    const updated = {
      ...(existing || {}),
      id: serviceId,
      name: form.get('name'),
      category: form.get('category') || 'Custom',
      normalMiles: intervalMiles,
      severeMiles: intervalMiles,
      intervalMonthsNormal: intervalMonths,
      intervalMonthsSevere: intervalMonths,
      firstDue: Number(form.get('firstDue') || 0) || null,
      drivetrain: form.get('drivetrain') || undefined,
      note: form.get('note') || '',
      official: existing?.official || false,
      keywords: existing?.keywords || []
    };
    if (existing) Object.assign(existing, updated); else state.services.push(updated);
    toast(existing ? 'Service rule updated.' : 'Custom service added.');
  }

  $('#entryDialog').close();
  render();
}

function updateMileageFromForm(value) {
  const n = Number(value || 0);
  if (n > Number(state.vehicle.currentMileage || 0)) state.vehicle.currentMileage = n;
}

function slugify(text) {
  return String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function drawCategoryChart() {
  const canvas = $('#categoryChart');
  const title = $('#categoryChartTitle');
  if (state.expenses.length) {
    if (title) title.textContent = 'Expense mix';
    drawBarChart(canvas, aggregateBy(state.expenses, 'category'), 'No expenses yet', value => money(value));
    return;
  }
  const byCategory = state.maintenance.reduce((acc, item) => {
    const category = state.services.find(service => service.id === item.serviceId)?.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  if (title) title.textContent = 'Service history mix';
  drawBarChart(canvas, byCategory, 'No maintenance history yet', value => `${value} records`);
}

function drawMonthlyChart() {
  const title = $('#monthlyChartTitle');
  if (state.expenses.length) {
    const byMonth = {};
    state.expenses.forEach(item => {
      const key = (item.date || '').slice(0, 7) || 'Unknown';
      byMonth[key] = (byMonth[key] || 0) + Number(item.amount || 0);
    });
    const ordered = Object.fromEntries(Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12));
    if (title) title.textContent = 'Monthly spending';
    drawBarChart($('#monthlyChart'), ordered, 'No monthly data yet', value => money(value));
    return;
  }
  const byYear = {};
  state.maintenance.forEach(item => {
    const key = (item.date || '').slice(0, 4) || 'Unknown';
    byYear[key] = (byYear[key] || 0) + 1;
  });
  if (title) title.textContent = 'Service events by year';
  drawBarChart($('#monthlyChart'), Object.fromEntries(Object.entries(byYear).sort(([a], [b]) => a.localeCompare(b))), 'No service history yet', value => `${value}`);
}

function aggregateBy(items, key) {
  return items.reduce((acc, item) => {
    const label = item[key] || 'Other';
    acc[label] = (acc[label] || 0) + Number(item.amount || 0);
    return acc;
  }, {});
}

function drawBarChart(canvas, data, emptyLabel, valueFormatter = value => money(value)) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = Math.max(240, Math.round(cssWidth * 0.42));
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  const entries = Object.entries(data).filter(([, value]) => value > 0).sort((a,b) => b[1] - a[1]).slice(0, 8);
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#687172';
  if (!entries.length) {
    ctx.fillText(emptyLabel, 20, 40);
    return;
  }
  const max = Math.max(...entries.map(([, value]) => value));
  const left = 116;
  const top = 18;
  const barH = 24;
  const gap = 12;
  const maxBar = cssWidth - left - 28;
  entries.forEach(([label, value], i) => {
    const y = top + i * (barH + gap);
    const width = Math.max(8, (value / max) * maxBar);
    ctx.fillStyle = 'rgba(17,44,53,0.08)';
    roundRect(ctx, left, y, maxBar, barH, 9);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1473e6';
    roundRect(ctx, left, y, width, barH, 9);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1e2728';
    ctx.fillText(label.slice(0, 18), 0, y + 17);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#687172';
    ctx.fillText(valueFormatter(value), left + Math.min(width + 8, maxBar - 86), y + 17);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function readCarfaxFile(file) {
  if (!file) return '';
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return await readPdf(file);
  return await file.text();
}

async function readPdf(file) {
  try {
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let output = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      output += content.items.map(item => item.str).join(' ') + '\n';
    }
    return output;
  } catch (error) {
    console.error(error);
    throw new Error('PDF text extraction failed. Paste the Carfax service history text instead, or run with internet access so the PDF parser can load.');
  }
}

function parseCarfaxText(text) {
  const clean = String(text || '').replace(/\r/g, '\n').replace(/[\t ]+/g, ' ');
  const lines = clean.split('\n').map(line => line.trim()).filter(Boolean);
  const results = [];

  const dateRegex = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/i;
  const mileageRegex = /\b(\d{1,3}(?:,\d{3})+|\d{5,6})\s*(?:mi|miles|mileage|odometer)?\b/i;
  const servicePatterns = [
    { ids: ['engine_oil', 'engine_oil_filter'], label: 'Oil/filter service', re: /\b(oil\s*(?:and|&)\s*filter|oil change|engine oil|lube)\b/i },
    { ids: ['tire_rotation'], label: 'Tire rotation', re: /\b(tires? rotated|tire rotation|rotate tires?)\b/i },
    { ids: ['spark_plugs'], label: 'Spark plugs', re: /\b(spark plugs?|ignition plugs?)\b/i },
    { ids: ['coolant_fl22'], label: 'Coolant service', re: /\b(coolant|antifreeze|fl22|cooling system)\b/i },
    { ids: ['cabin_air_filter'], label: 'Cabin air filter', re: /\b(cabin air filter|pollen filter)\b/i },
    { ids: ['engine_air_filter'], label: 'Engine air filter', re: /\b(engine air filter|air filter replaced|air filter serviced)\b/i },
    { ids: ['brake_inspection'], label: 'Brake service / inspection', re: /\b(brake pads?|rotors?|brake service|brakes? checked|calipers?)\b/i },
    { ids: ['brake_fluid_check'], label: 'Brake fluid', re: /\b(brake fluid|brake flush)\b/i },
    { ids: ['drive_belts'], label: 'Drive belt inspection/service', re: /\b(drive belt|serpentine belt|belts?)\b/i },
    { ids: ['suspension_steering'], label: 'Suspension/steering/alignment', re: /\b(suspension|steering|alignment|ball joint|wheel bearing|strut|shock)\b/i },
    { ids: ['exhaust_heat_shields'], label: 'Exhaust / heat shield', re: /\b(exhaust|heat shield|muffler)\b/i },
    { ids: ['rear_diff_oil'], label: 'Rear differential fluid', re: /\b(rear differential|differential fluid|rear diff)\b/i },
    { ids: ['transfer_oil'], label: 'Transfer case fluid', re: /\b(transfer case|transfer fluid|transfer oil)\b/i },
    { ids: ['transmission_service'], label: 'Transmission fluid/service', re: /\b(transmission fluid|transmission service|atf|drain and fill)\b/i },
    { ids: ['battery'], label: 'Battery', re: /\b(battery|charging system)\b/i },
    { ids: ['wipers'], label: 'Wipers', re: /\b(wipers?|windshield blades?)\b/i }
  ];

  lines.forEach((line, index) => {
    // Match the service on its own line so a neighboring event cannot leak into
    // this record. Previous lines are context only for reports that put the date
    // or odometer on a separate line above the service description.
    const contextText = [lines[index - 2], lines[index - 1], line].filter(Boolean).join(' | ');
    const matched = servicePatterns.filter(pattern => pattern.re.test(line));
    if (!matched.length) return;
    const dateMatch = line.match(dateRegex) || contextText.match(dateRegex);
    const mileageMatch = line.match(mileageRegex) || contextText.match(mileageRegex);
    const date = dateMatch ? normalizeDate(dateMatch[0]) : '';
    const mileage = mileageMatch ? Number(mileageMatch[1].replace(/,/g, '')) : 0;

    matched.forEach(pattern => {
      pattern.ids.forEach(serviceId => {
        if (!state.services.find(service => service.id === serviceId)) return;
        const key = `${serviceId}-${date}-${mileage}`;
        if (results.some(result => result.key === key)) return;
        results.push({
          id: uid(), key, serviceId, serviceName: serviceName(serviceId), date, mileage,
          notes: compactLine(line), sourceLine: line, confidence: confidenceScore(date, mileage, line), selected: true
        });
      });
    });
  });

  return results.sort((a, b) => Number(a.mileage || 0) - Number(b.mileage || 0) || new Date(a.date || 0) - new Date(b.date || 0));
}

function compactLine(text) {
  return String(text || '').replace(/\s+/g, ' ').slice(0, 320);
}

function confidenceScore(date, mileage, line) {
  let score = 45;
  if (date) score += 25;
  if (mileage) score += 20;
  if (/service|replaced|performed|maintenance|vehicle serviced/i.test(line)) score += 10;
  return Math.min(98, score);
}

function normalizeDate(raw) {
  if (!raw) return '';
  const parsed = new Date(raw.replace(/-/g, '/'));
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  const parts = raw.split(/[\/\-]/);
  if (parts.length === 3) {
    let [m, d, y] = parts.map(part => part.padStart(2, '0'));
    if (y.length === 2) y = Number(y) > 70 ? `19${y}` : `20${y}`;
    return `${y}-${m}-${d}`;
  }
  return '';
}

function renderParsedResults() {
  const box = $('#parsedResults');
  if (!state.parsedDrafts.length) {
    box.innerHTML = empty('No parsed records yet.');
    return;
  }
  box.innerHTML = state.parsedDrafts.map(item => `
    <label class="parsed-card">
      <input type="checkbox" data-parsed-id="${item.id}" ${item.selected ? 'checked' : ''} />
      <span>
        <strong>${escapeHTML(item.serviceName)}</strong>
        <p>${item.date ? fmtDate(item.date) : 'No date found'} · ${item.mileage ? `${miles(item.mileage)} mi` : 'No mileage found'} · ${item.confidence}% match</p>
        <p>${escapeHTML(item.notes)}</p>
      </span>
    </label>
  `).join('');
}

function importParsed() {
  const selectedIds = new Set($$('[data-parsed-id]').filter(input => input.checked).map(input => input.dataset.parsedId));
  const selected = state.parsedDrafts.filter(item => selectedIds.has(item.id));
  selected.forEach(item => {
    const exists = state.maintenance.some(record => record.serviceId === item.serviceId && record.date === item.date && Number(record.mileage || 0) === Number(item.mileage || 0));
    if (exists) return;
    state.maintenance.push({
      id: uid(), serviceId: item.serviceId, date: item.date || todayISO(), mileage: Number(item.mileage || 0), amount: 0,
      vendor: 'Carfax import', notes: item.notes, source: 'carfax'
    });
  });
  const maxImportedMileage = Math.max(0, ...selected.map(item => Number(item.mileage || 0)));
  updateMileageFromForm(maxImportedMileage);
  state.parsedDrafts = [];
  $('#carfaxText').value = '';
  $('#importStatus').textContent = '';
  toast(`Imported ${selected.length} maintenance record${selected.length === 1 ? '' : 's'}.`);
  renderParsedResults();
  render();
}

function exportJson() {
  const data = JSON.stringify({ ...state, parsedDrafts: [] }, null, 2);
  downloadFile(`roadbook-backup-${todayISO()}.json`, data, 'application/json');
}

function exportCsv() {
  const header = ['Date','Category','Vendor','Mileage','Amount','Notes'];
  const rows = state.expenses.map(item => [item.date, item.category, item.vendor, item.mileage, item.amount, item.notes]);
  const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
  downloadFile(`roadbook-expenses-${todayISO()}.csv`, csv, 'text/csv');
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function restoreJson(file) {
  if (!file) return;
  try {
    const restored = JSON.parse(await file.text());
    state = {
      ...defaultState(),
      ...restored,
      vehicle: { ...defaultState().vehicle, ...(restored.vehicle || {}) },
      services: mergeServices(restored.services || []),
      maintenance: Array.isArray(restored.maintenance) ? restored.maintenance : [],
      expenses: Array.isArray(restored.expenses) ? restored.expenses : [],
      parsedDrafts: []
    };
    toast('Backup restored.');
    render();
  } catch (error) {
    toast('Could not restore that JSON file.');
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}
function escapeAttr(value) { return escapeHTML(value).replace(/`/g, '&#96;'); }


function loadDemoReview() {
  state.parsedDrafts = seededMaintenance.map(item => ({
    id: uid(), key: item.id, serviceId: item.serviceId, serviceName: serviceName(item.serviceId),
    date: item.date, mileage: Number(item.mileage || 0), notes: `${item.vendor}. ${item.notes}`,
    confidence: 99, selected: true
  }));
  $('#importStatus').textContent = `Loaded ${state.parsedDrafts.length} sample matches so you can try the review flow. Existing duplicates will be skipped.`;
  renderParsedResults();
}

function finishOnboarding(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const year = Number(form.get('year'));
  const make = String(form.get('make') || '').trim();
  const model = String(form.get('model') || '').trim();
  const mileage = Number(form.get('mileage') || 0);
  state.vehicle = { ...state.vehicle, name: `My ${model}`, year, make, model, trim: String(form.get('trim') || '').trim(), drivetrain: String(form.get('drivetrain') || 'unknown'), currentMileage: mileage, startMileage: mileage };
  state.onboardingComplete = true;
  $('#welcomeDialog').close();
  render();
  if (form.get('nextStep') === 'import') showView('carfax');
  toast(`${year} ${make} ${model} is ready.`);
}

function useDemo() {
  state = demoState();
  $('#welcomeDialog').close();
  render();
  toast('Demo loaded. Reset data when you are ready to add your own vehicle.');
}

function applyTheme(theme) {
  const chosen = theme || localStorage.getItem('roadbook-theme') || 'light';
  document.documentElement.dataset.theme = chosen;
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('roadbook-theme', next);
  applyTheme(next);
  render();
}

function attachEvents() {
  $$('.nav-item').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
  $$('[data-jump]').forEach(button => button.addEventListener('click', () => showView(button.dataset.jump)));

  $('#mileageInput').addEventListener('change', event => {
    state.vehicle.currentMileage = Number(event.target.value || 0);
    render();
  });

  $('#addExpenseBtn').addEventListener('click', () => openDialog('expense'));
  $('#addExpenseTopBtn').addEventListener('click', () => openDialog('expense'));
  $('#addMaintenanceBtn').addEventListener('click', () => openDialog('maintenance'));
  $('#heroLogServiceBtn')?.addEventListener('click', () => openDialog('maintenance'));
  $('#addCustomServiceBtn').addEventListener('click', () => openDialog('customService'));
  $('#saveSettingsBtn').addEventListener('click', saveSettings);
  $('#themeToggleBtn')?.addEventListener('click', toggleTheme);
  $('#loadDemoBtn')?.addEventListener('click', loadDemoReview);
  $('#welcomeForm')?.addEventListener('submit', finishOnboarding);
  $('#useDemoBtn')?.addEventListener('click', useDemo);
  $('#exportCsvInlineBtn')?.addEventListener('click', exportCsv);
  $('#statusFilter').addEventListener('change', renderMaintenance);
  $('#expenseSearch').addEventListener('input', renderExpenses);
  $('#entryForm').addEventListener('submit', saveDialog);
  $('#closeDialogBtn').addEventListener('click', () => $('#entryDialog').close());
  $('#cancelDialogBtn').addEventListener('click', () => $('#entryDialog').close());

  document.addEventListener('click', event => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'log-service') openDialog('maintenance', { serviceId: actionEl.dataset.serviceId });
    if (action === 'edit-service') {
      const service = state.services.find(item => item.id === actionEl.dataset.serviceId);
      openDialog('service', { id: service.id, service });
    }
    if (action === 'delete-expense') {
      state.expenses = state.expenses.filter(item => item.id !== actionEl.dataset.expenseId);
      toast('Expense deleted.');
      render();
    }
  });

  $('#carfaxFile').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    $('#importStatus').textContent = `Reading ${file.name}...`;
    try {
      const text = await readCarfaxFile(file);
      $('#carfaxText').value = text;
      $('#importStatus').textContent = `Loaded ${file.name}. Now click Parse history.`;
    } catch (error) {
      $('#importStatus').textContent = error.message;
    }
  });

  $('#parseCarfaxBtn').addEventListener('click', () => {
    const text = $('#carfaxText').value;
    state.parsedDrafts = parseCarfaxText(text);
    $('#importStatus').textContent = state.parsedDrafts.length ? `Found ${state.parsedDrafts.length} possible maintenance records. Review before importing.` : 'No obvious maintenance records found. Try pasting the service history section only.';
    renderParsedResults();
  });
  $('#clearImportBtn').addEventListener('click', () => {
    state.parsedDrafts = [];
    $('#carfaxText').value = '';
    $('#carfaxFile').value = '';
    $('#importStatus').textContent = '';
    renderParsedResults();
  });
  $('#selectAllParsedBtn').addEventListener('click', () => $$('[data-parsed-id]').forEach(input => input.checked = true));
  $('#importParsedBtn').addEventListener('click', importParsed);

  $('#exportJsonBtn').addEventListener('click', exportJson);
  $('#quickExportBtn').addEventListener('click', exportJson);
  $('#exportCsvBtn').addEventListener('click', exportCsv);
  $('#restoreFile').addEventListener('change', event => restoreJson(event.target.files[0]));
  $('#resetDataBtn').addEventListener('click', () => {
    if (!confirm('Reset all saved car data in this browser? Export a backup first if you need it.')) return;
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(LEGACY_DB_KEY);
    state = defaultState();
    toast('App data reset.');
    render();
    $('#welcomeDialog').showModal();
  });
}

function showView(view) {
  currentView = view;
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  $$('.view').forEach(section => section.classList.toggle('active', section.id === `${view}View`));
  $('#pageTitle').textContent = ({ dashboard: 'Overview', maintenance: 'Maintenance', expenses: 'Expenses', carfax: 'Import records', reports: 'Reports', settings: 'Settings' })[view] || 'Overview';
  requestAnimationFrame(render);
}

applyTheme();
attachEvents();
renderParsedResults();
render();
if (!state.onboardingComplete) $('#welcomeDialog').showModal();
