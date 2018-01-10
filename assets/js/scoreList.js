const storage = require('electron-json-storage');

function ScoreList() {
  this.cutSize = 5;
  this.name = 'scoreList';
  this.list = [];
  this.configure();
};

ScoreList.prototype.save = function() {
  this.sort();
  this.cut();
  storage.set(this.name, JSON.stringify(this.list), function(error) {
    if (error) throw error;
  });
};

ScoreList.prototype.get = function() {
  var self = this;

  storage.get(this.name, function(error, data) {
    if (error) throw error;
   
    if(data.length === undefined) {
      self.save();
    } else {
      self.list = JSON.parse(data);
    }
  });
};

ScoreList.prototype.getCurrentTimestamp = function() {
  var cur = new Date();
  addZero = function(number) {
    return ('0' + number).slice(-2);
  }

  var date = addZero(cur.getDate()) + '-' + addZero(cur.getMonth() + 1) + '-' + addZero(cur.getFullYear());
  var time = addZero(cur.getHours()) + ':' + addZero(cur.getMinutes());

  return date + ' ' + time;
};

ScoreList.prototype.configure = function() {
  this.get();
};

ScoreList.prototype.add = function(score, steps) {
  this.list.push({ score: score, steps: steps, timestamp: this.getCurrentTimestamp() })
  this.save();
};

ScoreList.prototype.buildHtmlTable = function() {
  var table = $('<table>').attr('cellspacing', 0).attr('cellpadding', 0).addClass('score_table');
  var thead = $('<thead>');
  var tbody = $('<tbody>');

  // Build head
  thead.append($('<tr>').append($('<th>').addClass('score_table__title').attr('colspan', 4).text('Scores')))
  if(this.list.length > 0) {
    var tr = $('<tr>');

    tr.append($('<th>').addClass('score_table__num_title').text('#'));
    tr.append($('<th>').addClass('score_table__score_title').text('Score'));
    tr.append($('<th>').addClass('score_table__steps_title').text('Steps'));
    tr.append($('<th>').addClass('score_table__timestamp_title').text('Timestamp'));

    thead.append(tr);
  }
  table.append(thead);

  // Build body
  for(var i = 0; i < this.list.length; i++) {
    var scoreItem = this.list[i];
    var tr = $('<tr>');
    
    tr.append($('<td>').addClass('score_table__num').text((i + 1).toString()));
    tr.append($('<td>').addClass('score_table__score').text(scoreItem.score));
    tr.append($('<td>').addClass('score_table__steps').text(scoreItem.steps));
    tr.append($('<td>').addClass('score_table__timestamp').text(scoreItem.timestamp));

    tbody.append(tr);
  }

  // No results
  if(this.list.length == 0) {
    tbody.append($('<tr>').append($('<td>').attr('colspan', 4).addClass('score_table__no_results').text('No results')))
  }

  return table.append(tbody);
};
ScoreList.prototype.show = function() {
  $('#modal').html(this.buildHtmlTable()).modal({ autoResize: true });
};

ScoreList.prototype.sortCompare = function(a, b) {
  if(a.score > b.score) {
    return -1;
  }

  if(a.score < b.score) {
    return 1;
  }

  return 0;
};
ScoreList.prototype.sort = function() {
  this.list.sort(this.sortCompare);
};

ScoreList.prototype.cut = function() {
  this.list.splice(this.cutSize);
}