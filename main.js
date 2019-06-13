const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow;

const isMac = process.platform === 'darwin';
const mainMenuTemplate = require('./mainMenu');

app.on('ready', createWindow);

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 1160,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载index.html文件
  mainWindow.loadFile('index.html');

  // 当 window 被关闭，这个事件会被触发。
  mainWindow.on('closed', () => {
    mainWindow = null;
  })

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate({mainWindow, isMac, createWindow}));
  Menu.setApplicationMenu(mainMenu);
}

require('./ipcMainOn')(mainWindow);
// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})