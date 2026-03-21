'use strict'

const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, dialog, shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const Store = require('electron-store')
const path = require('path')
const fs = require('fs')

const store = new Store({ encryptionKey: 'courtaide-v1-secure' })

let win, tray

const APP = {
  name: 'CourtAide',
  color: '#2563EB',
  bgColor: '#050A14',
  width: 1280,
  height: 900,
  minWidth: 1000,
  minHeight: 700,
  trayTooltip: 'CourtAide — AI Legal Assistant',
  icon: path.join(__dirname, '../icons/icon-512.png'),
  trayIcon: path.join(__dirname, '../icons/icon-192.png')
}

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0) }
app.on('second-instance', () => {
  if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus() }
})

function createWindow () {
  win = new BrowserWindow({
    width: store.get('win.width', APP.width),
    height: store.get('win.height', APP.height),
    x: store.get('win.x'),
    y: store.get('win.y'),
    minWidth: APP.minWidth,
    minHeight: APP.minHeight,
    frame: false,
    backgroundColor: APP.bgColor,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: true  // Legal docs benefit from spellcheck
    },
    icon: APP.icon
  })

  win.loadFile(path.join(__dirname, '../index.html'))

  win.once('ready-to-show', () => {
    win.show(); win.focus()
    if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify()
  })

  const saveState = () => {
    if (!win || win.isDestroyed() || win.isMinimized() || win.isMaximized()) return
    const [w, h] = win.getSize(); const [x, y] = win.getPosition()
    store.set({ 'win.width': w, 'win.height': h, 'win.x': x, 'win.y': y })
  }
  win.on('resize', saveState); win.on('move', saveState)
  win.on('close', e => { if (!app.isQuitting) { e.preventDefault(); win.hide() } })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
}

function createTray () {
  let icon
  try { icon = nativeImage.createFromPath(APP.trayIcon).resize({ width: 16, height: 16 }) }
  catch { icon = nativeImage.createEmpty() }

  tray = new Tray(icon)
  tray.setToolTip(APP.trayTooltip)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '⚖️ CourtAide', enabled: false },
    { type: 'separator' },
    { label: 'Open', click: () => { win.show(); win.focus() } },
    { label: 'New Case', click: () => { win.show(); win.focus(); win.webContents.send('navigate', 'intake') } },
    { label: 'AI Scout', click: () => { win.show(); win.focus(); win.webContents.send('navigate', 'chat') } },
    { label: 'My Documents', click: () => { win.show(); win.focus(); win.webContents.send('navigate', 'documents') } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit() } }
  ]))
  tray.on('double-click', () => { win.show(); win.focus() })
}

ipcMain.handle('window:minimize', () => win.minimize())
ipcMain.handle('window:maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize())
ipcMain.handle('window:close', () => win.hide())
ipcMain.handle('window:isMaximized', () => win.isMaximized())

ipcMain.handle('notify', (_, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title, body, icon: APP.icon }).show()
})

// Legal doc PDF export via Electron print
ipcMain.handle('dialog:exportPDF', async (_, { filename, html }) => {
  const pdfWin = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } })
  await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  const result = await dialog.showSaveDialog(win, {
    defaultPath: filename || 'courtaide-document.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
    title: 'Export Legal Document'
  })
  if (result.canceled) { pdfWin.destroy(); return false }
  try {
    const pdfData = await pdfWin.webContents.printToPDF({
      pageSize: 'Letter', printBackground: true, margins: { top: 1, bottom: 1, left: 1, right: 1 }
    })
    fs.writeFileSync(result.filePath, pdfData)
    pdfWin.destroy()
    return true
  } catch { pdfWin.destroy(); return false }
})

ipcMain.handle('dialog:openDocument', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'txt', 'doc', 'docx'] },
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
    ],
    title: 'Open Court Document'
  })
  if (result.canceled || !result.filePaths.length) return null
  try {
    const data = fs.readFileSync(result.filePaths[0])
    const ext = path.extname(result.filePaths[0]).toLowerCase().replace('.', '')
    if (['jpg','jpeg','png','webp'].includes(ext)) {
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
      return { type: 'image', data: `data:${mime};base64,${data.toString('base64')}`, ext }
    }
    return { type: 'text', data: data.toString('utf8'), ext }
  } catch { return null }
})

ipcMain.handle('store:get', (_, key) => store.get(key))
ipcMain.handle('store:set', (_, key, value) => store.set(key, value))
ipcMain.handle('store:delete', (_, key) => store.delete(key))
ipcMain.handle('store:clear', () => store.clear())
ipcMain.handle('shell:openExternal', (_, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) shell.openExternal(url)
})
ipcMain.handle('app:version', () => app.getVersion())

autoUpdater.on('update-downloaded', () => { if (win) win.webContents.send('update:ready') })
ipcMain.handle('update:install', () => { app.isQuitting = true; autoUpdater.quitAndInstall() })

app.whenReady().then(() => { createWindow(); createTray() })
app.on('window-all-closed', e => e.preventDefault())
app.on('before-quit', () => { app.isQuitting = true })
