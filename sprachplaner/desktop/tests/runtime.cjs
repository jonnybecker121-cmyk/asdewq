const { app, BrowserWindow, net } = require('electron');
const { once } = require('node:events');
const { writeFile } = require('node:fs/promises');
const assert = require('node:assert/strict');
if (process.platform === 'linux') app.disableHardwareAcceleration();
app.commandLine.appendSwitch('use-fake-device-for-media-stream');
app.commandLine.appendSwitch('use-file-for-fake-audio-capture', require('node:path').join(__dirname, 'fixtures/german.wav'));
app.setPath('userData', process.env.SP_DESKTOP_TEST_DATA);
require('../main.cjs');

async function run() {
  await app.whenReady();
  const win = BrowserWindow.getAllWindows()[0];
  assert.ok(win, 'Desktop window created');
  win.webContents.on('console-message', event => { if (['error','warning'].includes(event.level)) console.error('Renderer:', event.message.slice(0, 700)); });
  if (win.webContents.isLoadingMainFrame()) await once(win.webContents, 'did-finish-load');
  const runJS = code => win.webContents.executeJavaScript(code);
  const waitFor = async condition => {
    for (let i = 0; i < 1600; i++) {
      if (await runJS(condition)) return;
      if (i === 100 || i === 400) console.log('Waiting for UI:', await runJS("document.body.innerText"));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error(`UI did not become ready: ${condition}; ${await runJS("document.body.innerText")}`);
  };
  const prefs = win.webContents.getLastWebPreferences();
  assert.equal(prefs.nodeIntegration, false);
  assert.equal(prefs.contextIsolation, true);
  assert.equal(prefs.sandbox, true);
  assert.equal(await runJS('typeof require'), 'undefined');
  assert.equal(await runJS('isSecureContext'), true);
  assert.equal((await net.fetch('sprachplaner://app/main.cjs')).status, 404);
  await assert.rejects(() => runJS("fetch('https://example.com')"));
  if (process.env.SP_DESKTOP_TEST_PHASE === 'create') {
    await waitFor("!!document.querySelector('#to-signup')");
    await runJS("document.querySelector('#to-signup').click()");
    await runJS("document.querySelector('#user').value='desktoptest'; document.querySelector('#pw').value='synthetic-pass'; document.querySelector('#pw2').value='synthetic-pass'; document.querySelector('#go').click()");
    await waitFor("!!document.querySelector('#add')");
    await runJS("document.querySelector('#add').click(); document.querySelector('#f-title').value='Desktop-Testaufgabe'; document.querySelector('#f-save').click()");
    await waitFor("!document.querySelector('#f-save')");
    await runJS("document.querySelector('#mic').click()");
    await waitFor("!!document.querySelector('#live') && /zahnarzt/i.test(document.querySelector('#live').textContent) && /uhr/i.test(document.querySelector('#live').textContent)");
    console.log('Offline speech recognition:', await runJS("document.querySelector('#live').textContent"));
    await runJS("document.querySelector('#l-stop').click()");
    await waitFor("!document.querySelector('#live')");
    await runJS("document.querySelector('#add').click(); document.querySelector('[data-kind=list]').click(); document.querySelector('#f-title').value='PC-Einkauf'; document.querySelector('#f-items').value='Milch\\nBrot'; document.querySelector('#f-save').click()");
    await waitFor("!document.querySelector('#f-save')");
    await runJS("document.querySelector('.detail button[aria-label=Zurück]')?.click(); document.querySelector('[data-tab=tasks]').click()");
    await waitFor("document.body.textContent.includes('Desktop-Testaufgabe')");
  } else {
    await waitFor("!!document.querySelector('#add')");
  }
  const db = await runJS("JSON.parse(localStorage.getItem('sp_local_v1'))");
  const items = db.data[db.session];
  assert.ok(items.some(item => item.title === 'Desktop-Testaufgabe'));
  const appointment = items.find(item => item.kind === 'event' && item.title.toLowerCase().includes('zahnarzt'));
  if (!appointment) console.log("Recognized items:", JSON.stringify(items));
  assert.ok(appointment);
  assert.equal(new Date(appointment.starts_at).getHours(), 15);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  assert.equal(new Date(appointment.starts_at).getDate(), tomorrow.getDate());
  assert.ok(items.some(item => item.kind === 'list' && item.title === 'PC-Einkauf'));
  assert.equal(items.filter(item => item.kind === 'item').length, 2);
  assert.equal(await runJS('document.documentElement.scrollWidth > innerWidth'), false);
  assert.ok((await net.fetch('sprachplaner://app/app.js')).headers.get('Content-Security-Policy').includes("connect-src 'none'"));
  if (process.env.SP_DESKTOP_TEST_SCREENSHOT) {
    await writeFile(process.env.SP_DESKTOP_TEST_SCREENSHOT, (await win.webContents.capturePage()).toPNG());
  }
  await win.webContents.session.flushStorageData();
  console.log(`Desktop runtime ${process.env.SP_DESKTOP_TEST_PHASE}: passed`);
  app.exit(0);
}
const timeout = setTimeout(() => { console.error('Desktop test timed out'); app.exit(1); }, 120000);
run().catch(error => { console.error(error); clearTimeout(timeout); app.exit(1); });
