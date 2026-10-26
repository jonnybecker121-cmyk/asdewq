const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const profile = mkdtempSync(path.join(tmpdir(), 'sprachplaner-desktop-test-'));
try {
  for (const phase of ['create', 'reopen']) {
    const result = spawnSync(require('electron'), [path.join(__dirname, 'runtime.cjs')], {
      env: { ...process.env, SP_DESKTOP_TEST_DATA: profile, SP_DESKTOP_TEST_PHASE: phase },
      stdio: 'inherit', timeout: 45000,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) { process.exitCode = 1; break; }
  }
} finally { rmSync(profile, { recursive: true, force: true }); }
