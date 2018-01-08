$(function(){
  require('electron').ipcRenderer.on('newGame', function() {
    (new Lines()).start();
  });

  (new Grid()).draw();
  (new Lines()).start();
});