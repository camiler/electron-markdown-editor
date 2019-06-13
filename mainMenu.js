const electron = require('electron');
var fs = require('fs');
const { app, dialog, ipcMain } = electron;

const THEMES = ['a11y-dark', 'a11y-light', 'agate', 'arta', 'ascetic', 'atom-one-dark', 'atom-one-light', 'Darcula', 'Dark', 'default', 'github', 'Googlecode', 'hybird', 'idea', 'nagula', 'Monokai', 'Ocean', 'Rainbow', 'Tomorrow'];
const filters = [{name: 'markdown', extensions: ['md']}];

const mainMenuTemplate = ({isMac, createWindow}) => {
  let themeChecked = 'Darcula';
  const genCodeThemeList = () => {
    const list = [];
    THEMES.forEach(theme => {
      list.push({
        label: theme,
        type: 'radio',
        checked: Boolean(themeChecked == theme),
        click(item, browserWindow) {
          themeChecked = theme;
          browserWindow.webContents.send('theme:set', theme);
        }
      })
    });
    return list;
  }

  const menus = [{
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: isMac ? 'Command+N' : 'Ctrl+N',
        click() {
          createWindow();
        }
      },
      {
        label: 'Open',
        accelerator: isMac ? 'Command+O' : 'Ctrl+O',
        click(item, browserWindow) {
          dialog.showOpenDialog(browserWindow, {properties: ['openFile', 'openDirectory'], filters}, function(filePaths){
            if (filePaths === undefined) {
              console.log("No file selected");
              return;
            }
            const file = filePaths && filePaths[0];
            fs.readFile(file, 'utf-8', (err, data) => {
              if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
              }
              browserWindow.webContents.send('file:open', data);
            })
          });
        }
      },
      {
        label: 'Save',
        accelerator: isMac ? 'Command+S' : 'Ctrl+S',
        click(item, browserWindow){
          dialog.showSaveDialog(browserWindow, {filters}, function(filename){
            if (filename === undefined) return;
            browserWindow.webContents.send('file:save', filename);
          })
        }
      },
      {
        label: 'Export As',
        submenu: [
          {label: 'HTML', click(item, browserWindow){
            dialog.showSaveDialog(browserWindow, {filters: [{name: 'html', extensions: ['html']}]}, function(filename){
              if (filename === undefined) return;
              browserWindow.webContents.send('file:export:html', filename);
            })
          }},
          {label: 'PDF', click(item, browserWindow){
            dialog.showSaveDialog(browserWindow, {filters: [{name: 'pdf', extensions: ['pdf']}]}, function(filename){
              if (filename === undefined) return;
              browserWindow.webContents.send('file:export:pdf', filename);
            })
          }},
        ]
      },
      {
        label: 'Clear All',
        click(item, browserWindow) {
          browserWindow.webContents.send('clear:all');
        }
      },
    ]
  }, {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { 
        label: 'code theme', 
        submenu: genCodeThemeList()
      }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  // {
  //   role: 'help',
  //   submenu: [
  //     {
  //       label: 'Learn More',
  //       click () { require('electron').shell.openExternalSync('https://electronjs.org') }
  //     }
  //   ]
  // }
  ];

  // if mac, add empty object to menu
  if (isMac) {
    menus.unshift({
      label: 'MarkD',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  };

  // add tools item if not production
  if (process.env.NODE_ENV !== 'production'){
    menus.push({
      label: 'Dev Tools',
      submenu: [{
        role: 'toggledevtools' 
      }, {
        role: 'reload'
      }] 
    })
  }
  return menus;
};

module.exports = mainMenuTemplate;