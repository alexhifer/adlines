function Grid() {
  this.mainRows = 9;
  this.mainColumns = 9;
  this.gameFieldTableId = 'game_field';
  this.nextBallsTableId = 'next_balls';
  this.gameFieldWrapperSelector = '#game_field_wrapper';
  this.nextBallsWrapperSelector = '#next_balls_wrapper';
};
Grid.prototype.getGameFieldWrapper = function() {
  return $(this.gameFieldWrapperSelector);
};
Grid.prototype.getNextBallsWrapper = function() {
  return $(this.nextBallsWrapperSelector);
};
Grid.prototype.render = function(rows, columns) {
  var table = $('<table>');
  var tbody = $('<tbody>');

  for (var row = 0; row < rows; row++) {
    var tableTR = $('<tr>');

    for (var col = 0; col < columns; col++) {
      var tableTD = $('<td>');
      tableTD.attr('data-row', row);
      tableTD.attr('data-col', col);

      tableTR.append(tableTD);
    }

    tbody.append(tableTR);
  }

  table.append(tbody);

  return table;
};
Grid.prototype.renderNextBalls = function() {
  table = this.render(1, 3);
  table.attr('id', this.nextBallsTableId);

  this.getNextBallsWrapper().append(table);
};
Grid.prototype.renderGameField = function() {
  table = this.render(this.mainRows, this.mainColumns);
  table.attr('id', this.gameFieldTableId);

  this.getGameFieldWrapper().append(table);
};
Grid.prototype.draw = function() {
  this.renderNextBalls();
  this.renderGameField();
}