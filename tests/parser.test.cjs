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
  'globalThis.__parseCarfaxText = parseCarfaxText;',
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

console.log('Parser regression test passed.');
