const { app, BrowserWindow, Menu, protocol, session, dialog } = require('electron');
const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { resolveAsset, CSP, WORKER_CSP } = require('./assets.cjs');
const { allowAudioRequest, allowAudioCheck } = require('./media-policy.cjs');

protocol.registerSchemesAsPrivileged([
  { scheme: 'sprachplaner', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

let mainWindow;
const ownsLock = app.requestSingleInstanceLock();
if (!ownsLock) app.quit();
else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
      callback(contents === mainWindow?.webContents && allowAudioRequest(contents.getURL(), permission, details));
    });
    session.defaultSession.setPermissionCheckHandler((contents, permission, origin, details) =>
      contents === mainWindow?.webContents && allowAudioCheck(contents.getURL(), permission, origin, details));
    session.defaultSession.on('will-download', event => event.preventDefault());
    protocol.handle('sprachplaner', async request => {
      const asset = resolveAsset(request.url, request.method);
      if (!asset) return new Response('Nicht gefunden', { status: 404 });
      try {
        return new Response(await readFile(path.join(__dirname, 'web', asset.name)), {
          headers: { 'Content-Type': asset.type, 'Content-Security-Policy': asset.name === 'vosk-worker.js' ? WORKER_CSP : CSP, 'X-Content-Type-Options': 'nosniff' },
        });
      } catch {
        return new Response('App-Datei fehlt. Bitte Sprachplaner erneut installieren.', { status: 500 });
      }
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'Datei', submenu: [{ role: 'quit', label: 'Beenden' }] },
      { label: 'Bearbeiten', submenu: [
        { role: 'undo', label: 'Rückgängig' }, { role: 'redo', label: 'Wiederholen' }, { type: 'separator' },
        { role: 'cut', label: 'Ausschneiden' }, { role: 'copy', label: 'Kopieren' },
        { role: 'paste', label: 'Einfügen' }, { role: 'selectAll', label: 'Alles auswählen' },
      ] },
      { label: 'Ansicht', submenu: [
        { role: 'resetZoom', label: 'Originalgröße' }, { role: 'zoomIn', label: 'Vergrößern' },
        { role: 'zoomOut', label: 'Verkleinern' }, { role: 'togglefullscreen', label: 'Vollbild' },
      ] },
      { label: 'Hilfe', submenu: [{ label: 'Über Sprachplaner', click: () => dialog.showMessageBox(mainWindow, {
        type: 'info', title: 'Sprachplaner', message: `Sprachplaner ${app.getVersion()}`,
        detail: 'Termine, To-dos und Listen werden lokal auf diesem PC gespeichert.\n\nZum Einsprechen auf das Mikrofon klicken. Die deutsche Spracherkennung läuft lokal auf diesem PC. Spracheingaben verlassen die App nicht.\n\nKeine Synchronisierung mit dem Handy.',
      }) }] },
    ]));
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch(error => {
    dialog.showErrorBox('Sprachplaner konnte nicht starten', error.message);
    app.quit();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120, height: 800, minWidth: 600, minHeight: 560,
    title: 'Sprachplaner', backgroundColor: '#0f1220', show: false,
    icon: path.join(__dirname, 'web/icons/icon-512.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, autoplayPolicy: 'no-user-gesture-required' },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.loadURL('sprachplaner://app/index.html').catch(error => {
    dialog.showErrorBox('Sprachplaner konnte nicht geladen werden', error.message);
    app.quit();
  });
}

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
