const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, 'index.html contains duplicate IDs');

const referencedIds = [...app.matchAll(/\$\('#([^']+)'\)/g)].map(match => match[1]);
const missingIds = [...new Set(referencedIds)].filter(id => !htmlIds.includes(id));
assert.deepEqual(missingIds, [], `app.js references missing element IDs: ${missingIds.join(', ')}`);

assert.match(html, /id="dueNowCount"/, 'The factual due-now indicator is missing');
assert.doesNotMatch(html, /id="healthScore"/, 'The deprecated opaque health score returned');
assert.match(html, /id="exportHistoryCsvBtn"/, 'Full-history export is missing');
assert.match(html, /id="vehicleVinInput"/, 'Flexible VIN/chassis field is missing');
assert.match(html, /id="dataLocation"/, 'Visible desktop data location is missing');
assert.match(html, /id="chooseBackupFolderBtn"/, 'Automatic backup-folder control is missing');
assert.match(html, /id="checkUpdatesBtn"/, 'Manual update check is missing');
assert.match(html, /id="updateNotes"/, 'Update overview is missing');
assert.match(html, /id="estimatedValue"/, 'Market-value estimate is missing');
assert.match(html, /id="statMsrp"/, 'MSRP value step is missing');
assert.match(html, /id="msrpInput"/, 'MSRP input is missing');
assert.match(html, /id="msrpLookupStatus"/, 'Automatic MSRP lookup status is missing');
assert.match(html, /id="depreciationMethod"/, 'Depreciation method explanation is missing');
assert.match(html, /id="valueExplanation"/, 'Value calculation explanation is missing');
assert.match(html, /id="comparableRows"/, 'Comparable-listing evidence is missing');
assert.match(html, /id="comparableSummary"/, 'Comparable-listing summary is missing');
assert.match(html, /id="syncVisorBtn"/, 'Car-value calculation control is missing');
assert.match(html, /id="depreciationChart"/, 'Depreciation history chart is missing');
assert.doesNotMatch(html, /id="clearVisorKeyBtn"/, 'Obsolete Visor API controls returned');
assert.match(html, /id="marketResearchLinks"/, 'Open market research links are missing');
assert.match(html, /id="exportFilteredMaintenanceBtn"/, 'Filtered maintenance export is missing');
assert.match(html, /id="carfaxFileDrop"/, 'Desktop offline import hook is missing');
assert.doesNotMatch(app, /cdnjs\.cloudflare\.com|pdf\.min\.mjs/, 'PDF import must not depend on a remote runtime');

console.log('UI contract regression test passed.');
