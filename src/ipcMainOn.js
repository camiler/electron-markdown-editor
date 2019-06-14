const {ipcMain, dialog} = require('electron');
const fs = require('fs');
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

const EventOn = (mainWindow) => {
  ipcMain.on('file:save', function(err){
    if (!err) {
      dialog.showMessageBox({type: 'info', message: 'file saved successfully!'})
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
}

module.exports = EventOn;

