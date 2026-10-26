// Exercise the installed Windows binary through Chromium's test-only debug port.
// The shipped application starts without a debug port during ordinary use.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createServer } = require('node:net');
const { once } = require('node:events');
const executable = process.argv[2];
assert.ok(executable && existsSync(executable), 'Installed executable exists');
const profile = mkdtempSync(join(tmpdir(), 'sprachplaner-installed-test-'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function checkPhase(phase) {
  console.log(`Installed Windows app ${phase}: starting`);
  const port = await freePort();
  const child = spawn(executable, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`], { stdio: 'ignore' });
  const exited = once(child, 'exit');
  let socket;
  try {
    let target;
    for (let i = 0; i < 150 && !target; i++) {
      if (child.exitCode !== null) throw new Error(`Installed app exited: ${child.exitCode}`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1000) });
        target = (await response.json()).find(page => page.url.startsWith('sprachplaner://app/'));
      } catch { /* Wait for the local test port, never an external service. */ }
      if (!target) await pause(100);
    }
    assert.ok(target, 'Installed app opened the planner');
    console.log(`Installed Windows app ${phase}: planner window opened`);
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await Promise.race([once(socket, 'open'), pause(10000).then(() => { throw new Error('Debug connection did not open'); })]);
    console.log(`Installed Windows app ${phase}: test connection ready`);
    let sequence = 0;
    const pending = new Map();
    socket.addEventListener('message', event => {
      const reply = JSON.parse(event.data);
      const entry = pending.get(reply.id);
      if (!entry) return;
      clearTimeout(entry.timer);
      pending.delete(reply.id);
      if (reply.error || reply.result?.exceptionDetails) entry.reject(new Error(JSON.stringify(reply)));
      else entry.resolve(reply.result);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Test command timed out: ${method}`)); }, 10000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    socket.addEventListener('close', () => {
      for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error('Test connection closed')); }
      pending.clear();
    });
    const evaluate = async expression => (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
    const waitFor = async expression => {
      for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(50); }
      throw new Error(`Installed app UI not ready: ${expression}`);
    };
    assert.equal(await evaluate('typeof require'), 'undefined');
    assert.equal(await evaluate('isSecureContext'), true);
    if (phase === 'create') {
      await waitFor("!!document.querySelector('#to-signup')");
      await evaluate("document.querySelector('#to-signup').click()");
      await evaluate("document.querySelector('#user').value='installedtest'; document.querySelector('#pw').value='synthetic-pass'; document.querySelector('#pw2').value='synthetic-pass'; document.querySelector('#go').click()");
      await waitFor("!!document.querySelector('#add')");
      await evaluate("document.querySelector('#add').click(); document.querySelector('#f-title').value='Installed app persistence'; document.querySelector('#f-save').click()");
      await waitFor("!document.querySelector('#f-save')");
    } else await waitFor("!!document.querySelector('#add')");
    assert.equal(await evaluate("(()=>{const db=JSON.parse(localStorage.getItem('sp_local_v1')); return db.data[db.session].some(item=>item.title==='Installed app persistence')})()"), true);
    // Close through the browser so Electron flushes storage during shutdown.
    console.log(`Installed Windows app ${phase}: assertions passed, closing`);
    void call('Runtime.evaluate', { expression: 'window.close()' }).catch(() => {});
    await Promise.race([exited, pause(15000).then(() => { throw new Error('Installed app did not close'); })]);
    console.log(`Installed Windows app ${phase}: passed`);
  } finally {
    socket?.close();
    if (child.exitCode === null) { child.kill(); await exited; }
  }
}
const deadline = setTimeout(() => { console.error('Installed app test timed out'); process.exit(1); }, 90000);
(async () => {
  try { await checkPhase('create'); await checkPhase('reopen'); }
  finally { clearTimeout(deadline); rmSync(profile, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
