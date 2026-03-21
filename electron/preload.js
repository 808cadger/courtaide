'use strict'

const { contextBridge, ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', () => {
  injectTitlebar({ color: '#2563EB', bg: 'rgba(5,10,20,0.96)' })
  injectDropZone()
})

function injectDropZone () {
  document.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation() })
  document.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onerror = () => console.warn('CourtAide: FileReader error on dropped file')
    if (file.type.startsWith('image/')) {
      reader.onload = ev => window.dispatchEvent(new CustomEvent('electronImageDrop', { detail: { data: ev.target.result, type: 'image' } }))
      reader.readAsDataURL(file)
    } else if (file.type === 'application/pdf' || file.name.endsWith('.txt') || file.name.endsWith('.doc')) {
      reader.onload = ev => window.dispatchEvent(new CustomEvent('electronFileDrop', { detail: { data: ev.target.result, name: file.name, type: 'document' } }))
      reader.readAsText(file)
    }
  })
}

function injectTitlebar ({ color, bg }) {
  const bar = document.createElement('div')
  bar.id = '_etb'
  bar.innerHTML = `
    <span class="_etb-title">CourtAide</span>
    <div class="_etb-drag"></div>
    <div class="_etb-controls">
      <button class="_etb-btn _min" title="Minimize">&#8722;</button>
      <button class="_etb-btn _max" title="Maximize">&#9633;</button>
      <button class="_etb-btn _cls" title="Close">&#215;</button>
    </div>
  `
  document.body.prepend(bar)

  const style = document.createElement('style')
  style.textContent = `
    #_etb {
      position: fixed; top: 0; left: 0; right: 0; height: 36px;
      display: flex; align-items: center;
      background: ${bg}; backdrop-filter: blur(12px);
      -webkit-app-region: drag; z-index: 2147483647;
      border-bottom: 1px solid rgba(201,168,76,0.18);
      user-select: none;
    }
    ._etb-title {
      font-family: -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif;
      font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
      color: ${color}; padding: 0 0 0 14px;
      -webkit-app-region: drag;
    }
    ._etb-drag { flex: 1; height: 100%; -webkit-app-region: drag; }
    ._etb-controls { display: flex; align-items: center; gap: 8px; padding: 0 14px; -webkit-app-region: no-drag; }
    ._etb-btn {
      width: 13px; height: 13px; border-radius: 50%; border: none;
      cursor: pointer; font-size: 0; transition: filter 0.15s, transform 0.1s;
    }
    ._etb-btn:hover { filter: brightness(1.25); transform: scale(1.1); font-size: 9px; color: rgba(0,0,0,0.6); }
    ._etb-btn:active { transform: scale(0.95); }
    ._min { background: #FEBC2E; } ._max { background: #28C840; } ._cls { background: #FF5F57; }
    body { padding-top: 36px !important; }
    * { -webkit-font-smoothing: antialiased; }
  `
  document.head.appendChild(style)
  bar.querySelector('._min').addEventListener('click', () => window.electronAPI.minimize())
  bar.querySelector('._max').addEventListener('click', () => window.electronAPI.maximize())
  bar.querySelector('._cls').addEventListener('click', () => window.electronAPI.close())
}

contextBridge.exposeInMainWorld('electronAPI', {
  minimize:       () => ipcRenderer.invoke('window:minimize'),
  maximize:       () => ipcRenderer.invoke('window:maximize'),
  close:          () => ipcRenderer.invoke('window:close'),
  isMaximized:    () => ipcRenderer.invoke('window:isMaximized'),
  exportPDF:      (filename, html) => ipcRenderer.invoke('dialog:exportPDF', { filename, html }),
  openDocument:   () => ipcRenderer.invoke('dialog:openDocument'),
  notify:         (title, body) => ipcRenderer.invoke('notify', { title, body }),
  store: {
    get:    key        => ipcRenderer.invoke('store:get', key),
    set:    (key, val) => ipcRenderer.invoke('store:set', key, val),
    delete: key        => ipcRenderer.invoke('store:delete', key),
    clear:  ()         => ipcRenderer.invoke('store:clear')
  },
  onNavigate:     cb => ipcRenderer.on('navigate', (_, screen) => cb(screen)),
  openExternal:   url => ipcRenderer.invoke('shell:openExternal', url),
  onUpdateReady:  cb => ipcRenderer.on('update:ready', cb),
  installUpdate:  () => ipcRenderer.invoke('update:install'),
  version:        () => ipcRenderer.invoke('app:version'),
  platform: process.platform,
  isElectron: true
})
