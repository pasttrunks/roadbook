const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const appPath = path.join(__dirname, '..', 'app.js');
const source = fs.readFileSync(appPath, 'utf8');
const startupIndex = source.indexOf('\napplyTheme();');
assert.notEqual(startupIndex, -1, 'Could not find the app startup boundary');

const sandbox = {
  console,
  Date,
  Intl,
  Math,
  structuredClone,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(
  `${source.slice(0, startupIndex)}\n` +
  'globalThis.__parseCarfaxText = parseCarfaxText;\n' +
  'globalThis.__calculateFuelEconomy = calculateFuelEconomy;\n' +
  'globalThis.__buildHistoryCsv = buildHistoryCsv;\n' +
  'globalThis.__calculateMarketValue = calculateMarketValue;\n' +
  'globalThis.__calculateDepreciationEstimate = calculateDepreciationEstimate;\n' +
  'globalThis.__toLocalISO = toLocalISO;\n' +
  'globalThis.__addMonths = addMonths;\n' +
  'globalThis.__normalizeDate = normalizeDate;',
  sandbox,
  { filename: appPath }
);

const records = sandbox.__parseCarfaxText(
  '06/15/2025 45,000 miles Vehicle serviced. Oil and filter changed. Tires rotated.\n' +
  '01/10/2026 47,500 miles Brake pads replaced.'
).map(({ serviceName, date, mileage }) => ({ serviceName, date, mileage }));

assert.deepEqual(JSON.parse(JSON.stringify(records)), [
  { serviceName: 'Engine oil', date: '2025-06-15', mileage: 45000 },
  { serviceName: 'Engine oil filter', date: '2025-06-15', mileage: 45000 },
  { serviceName: 'Tire rotation', date: '2025-06-15', mileage: 45000 },
  { serviceName: 'Brake inspection', date: '2026-01-10', mileage: 47500 }
]);

const fuelSummary = sandbox.__calculateFuelEconomy([
  { category: 'Fuel', date: '2026-01-01', mileage: 10000, gallons: 10, fullTank: true },
  { category: 'Fuel', date: '2026-01-08', mileage: 10120, gallons: 4, fullTank: false },
  { category: 'Fuel', date: '2026-01-15', mileage: 10300, gallons: 8, fullTank: true },
  { category: 'Repair', date: '2026-01-16', mileage: 10310, amount: 100 }
]);
assert.equal(fuelSummary.gallons, 22);
assert.equal(fuelSummary.measuredMiles, 300);
assert.equal(fuelSummary.mpg, 25);

const historyCsv = sandbox.__buildHistoryCsv({
  vehicle: { year: 1965, make: 'Ford', model: 'Mustang', name: 'Fastback', vin: '5F09A', plate: 'OLD-65' },
  services: [{ id: 'oil', name: 'Oil change', category: 'Engine' }],
  maintenance: [{ serviceId: 'oil', date: '2026-02-01', mileage: 50000, vendor: 'DIY', amount: 45, notes: 'Oil, filter' }],
  expenses: [{ category: 'Fuel', date: '2026-02-02', mileage: 50100, vendor: 'Station', amount: 40, gallons: 10, fullTank: true, notes: '' }]
});
assert.match(historyCsv, /"VIN or chassis number","5F09A"/);
assert.match(historyCsv, /"Service","2026-02-01","50000","Engine","Oil change","DIY","45","Oil, filter"/);
assert.match(historyCsv, /"Fuel","2026-02-02","50100","Fuel","Fuel","Station","40","10 gallons, full fill-up"/);

const market = sandbox.__calculateMarketValue([
  { price: 14000 }, { price: 12000 }, { price: 15000 }, { price: 13000 }
]);
assert.deepEqual(JSON.parse(JSON.stringify(market)), { count: 4, median: 13500, low: 12000, high: 15000 });

const toyotaEstimate = sandbox.__calculateDepreciationEstimate(
  { purchasePrice: 30000, purchaseDate: '2021-07-13' },
  { make: 'Toyota', year: 2021 },
  new Date(2026, 6, 13, 12)
);
assert.ok(Math.abs(toyotaEstimate.value - 19470) <= 2);
assert.equal(toyotaEstimate.isBrandSpecific, true);
const generalEstimate = sandbox.__calculateDepreciationEstimate(
  { msrp: 30000 },
  { make: 'Unknown', year: 2021 },
  new Date(2026, 6, 13, 12)
);
assert.equal(generalEstimate.value, 15000);

assert.equal(sandbox.__toLocalISO(new Date(2026, 6, 12, 0, 5)), '2026-07-12');
assert.equal(sandbox.__addMonths('2026-07-12', 1), '2026-08-12');
assert.equal(sandbox.__normalizeDate('07/12/2026'), '2026-07-12');
assert.doesNotMatch(source, /toISOString\(\)\.slice\(0,\s*(7|10)\)/, 'Local calendar dates must not be formatted through UTC');

console.log('Parser, fuel-economy, and history-export regression tests passed.');
