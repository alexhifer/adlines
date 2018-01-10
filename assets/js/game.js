const electron = require('electron');

$(function(){
  (new Grid()).draw();
  window.Lines = new Lines();
  window.Lines.start();

  electron.ipcRenderer.on('newGame', function() {
    window.Lines.restart();
  });
  electron.ipcRenderer.on('showScores', function() {
    window.Lines.scoreList.show();
  });
});