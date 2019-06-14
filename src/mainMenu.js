const electron = require('electron');
// const fs = require('fs');
const path = require('path');
// const createPrintWindow = require('../print');
const { app, shell} = electron;

const { dialog } = electron;

const THEMES = ['a11y-dark', 'a11y-light', 'agate', 'arta', 'ascetic', 'atom-one-dark', 'atom-one-light', 'Darcula', 'Dark', 'default', 'github', 'Googlecode', 'hybird', 'idea', 'nagula', 'Monokai', 'Ocean', 'Rainbow', 'Tomorrow'];
const filters = [{name: 'markdown', extensions: ['md']}];

const mainMenuTemplate = ({isMac, createWindow}) => {
  let themeChecked = 'Darcula';
  let windowThemeChecked = 'light';

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

  const setWindowTheme = (item, browserWindow) => {
    windowThemeChecked = item.label;
    browserWindow.webContents.send('windowTheme:set', item.label);
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
          browserWindow.webContents.send('file:open:check');
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
      { type: 'separator' },
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
        label: 'Print',
        click(item, browserWindow){
          browserWindow.webContents.send('print:pdf');
        }
      },
      { type: 'separator' },
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
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { label: 'Hide left editor', 
        click(){

        }
      },
      { label: 'Hide right previwer', 
        click(){
          
        }
      },
      { type: 'separator' },
      { label: 'Open in browser',
        click(item, browserWindow) {
          browserWindow.webContents.send('file:export:html', {openInBrowser: true});
        }
      },
      { type: 'separator' },
      { 
        label: 'Code theme', 
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
      ] : [
        { role: 'close' },
      ]),
      {
        label: 'Theme',
        submenu: [{
          type: 'radio',
          label: 'light',
          checked: windowThemeChecked === 'ligth',
          click: setWindowTheme
        }, {
          type: 'radio',
          label: 'dark',
          checked: windowThemeChecked === 'dark',
          click: setWindowTheme
        }]
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { shell.openExternalSync('https://github.com/camiler/electron-markdwon-editor') }
      }
    ]
  }
  ];

  // if mac, add empty object to menu
  if (isMac) {
    menus.unshift({
      label: app.getName(),
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

  if (process.env.NODE_ENV === 'development'){
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