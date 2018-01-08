const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')

const menuTemplate = [
  {
    label: 'Game',
    submenu: [
      {
        label: 'New',
        click (item, focusedWindow) {
          win.webContents.send('newGame')
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  }
];

let win

function createWindow () {
  win = new BrowserWindow({
    width: 545,
    height: 635,
    center: true,
    resizable: false,
    icon: path.join(__dirname, 'assets/images/icons/icon_256x256.png')
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open DevTools for testing
  // win.webContents.openDevTools()

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})