const {ipcMain, dialog, BrowserWindow, shell} = require('electron');
const fs = require('fs');
const url = require('url');
const filters = [{name: 'markdown', extensions: ['md']}];

const openFile = (browserWindow) => {
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

const EventOn = (mainWindow, printWindow) => {
  ipcMain.on('file:save', function(e, err){
    if (err) {
      console.log(err);
    }
  })

  ipcMain.on('file:open:check', function(e, open){
    if (open) {
      openFile(mainWindow);
    } else {
      dialog.showMessageBox({type: 'warning', buttons: ['yes', 'no'], message: 'The current doc will be emptied, Are you sure you want to replece it?'}, (response) => {
        if (response === 1) return;
        openFile(mainWindow);
      })
    }
  })

  ipcMain.on('print:pdf:ready', function(e, filename){
    const printWindow = new BrowserWindow({
      show: false
    });
    printWindow.loadURL(url.format({
      protocol: 'file',
      slashes: true,
      pathname: filename
    }));
    printWindow.webContents.print({}, (error, data) => {
      if (error) throw error;
      console.log('print PDF successfully.')
      printWindow.close();
    })
  })

  ipcMain.on('html:open:ready', function(e, filename){
    shell.openExternalSync('file://' + filename);
  })
}

module.exports = EventOn;

