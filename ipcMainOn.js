const {ipcMain, dialog} = require('electron');

const EventOn = (mainWindow) => {
  ipcMain.on('file:save', function(err){
    if (!err) {
      dialog.showMessageBox({type: 'info', message: '保存成功'})
    }
  })
}

module.exports = EventOn;

