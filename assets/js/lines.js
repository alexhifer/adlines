function Lines() {
  // options
  this.fieldRows = 9;
  this.fieldColumns = 9;
  this.minApply = 5;
  this.numberBalls = 7;
  this.numberNextBalls = 3;
  this.gameFieldTableId = 'game_field';
  this.nextBallsTableId = 'next_balls';

  // variables for work
  this.step = null;
  this.score = null;
  this.selectBallRow = null;
  this.selectBallCol = null;
  this.moveBallArray = null;
  this.nextBalls = null;
  this.gameField = null;
  this.gameFieldShortestPath = null;
  this.clickBlock = false;
  this.ballJumpTop = '8px';

  this.scoreList = new ScoreList();
};

Lines.prototype.buildField = function(rows, columns) {
  var arr = new Array(this.fieldRows);

  for(var row = 0; row < rows; row++) {
    arr[row] = new Array(this.fieldColumns);
    for(var col = 0; col < columns; col++) {
      arr[row][col] = null;
    }
  }

  return arr;
};

Lines.prototype.drawScore = function() {
  $('#score').html(this.score);
};
Lines.prototype.updateScore = function(value) {
  this.score += value;
  this.drawScore();
};

Lines.prototype.drawStep = function() {
  $('#step').html(this.step);
};
Lines.prototype.updateStep = function() {
  this.step += 1;
  this.drawStep();
};

Lines.prototype.getNextBallsTable = function() {
  return document.getElementById(this.nextBallsTableId);
};
Lines.prototype.getGameFieldTable = function() {
  return document.getElementById(this.gameFieldTableId);
};

Lines.prototype.randomNumber = function(maxNumber) {
  return parseInt(Math.random() * ((maxNumber + 1) - 1) + 1, 10)
};
Lines.prototype.randomBall = function() {
  return this.randomNumber(this.numberBalls);
};
Lines.prototype.randomRow = function() {
  return this.randomNumber(this.fieldRows) - 1;
};
Lines.prototype.randomColumn = function() {
  return this.randomNumber(this.fieldColumns) - 1;
};

Lines.prototype.ballElement = function(number, animation) {
  animation = animation || false

  ballElement = $('<span>').addClass('ball-' + number);
  if(animation) {
    ballElement
      .css('width', '6px')
      .css('height', '6px')
      .css('opacity', '0.25')
      .css('border-radius', '3px')
  }

  return ballElement;
};
Lines.prototype.ballShowAnimate = function(ballElement) {
  ballElement.animate({ opacity: 1, height: '36px', width: '36px', borderRadius: '18px' });
};

Lines.prototype.generateNextBalls = function() {
  for(var col = 0; col < this.numberNextBalls; col++) {
    this.nextBalls[col] = this.randomBall();
  }
};
Lines.prototype.drawNextBalls = function() {
  var table = this.getNextBallsTable();

  for(var col = 0; col < this.numberNextBalls; col++) {
    var cell = $(table.rows[0].cells[col])

    cell.html('');
    ballElement = this.ballElement(this.nextBalls[col], true);
    cell.append(ballElement);
    this.ballShowAnimate(ballElement);
  }
};

Lines.prototype.generateGameField = function() {
  var throwBall = 0;

  while(throwBall < this.numberNextBalls) {
    var randomRow = this.randomRow();
    var randomColumn = this.randomColumn();

    if(this.gameField[randomRow][randomColumn] == null) {
      this.gameField[randomRow][randomColumn] = this.nextBalls[throwBall];
      throwBall++;
    }
  }
};

Lines.prototype.addBallEvent = function(ballElement) {
  var self = this;

  ballElement.click(function(event) {
    if(!self.canClick()) {
      return;
    }

    var tdElement = ballElement.closest('td');
  
    self.stopBallAnimation();
    self.selectBallRow = parseInt(tdElement.data('row'), 10);
    self.selectBallCol = parseInt(tdElement.data('col'), 10);
    self.startBallAnimation();
  });
}

Lines.prototype.hangFieldEvents = function() {
  var self = this;

  $(this.getGameFieldTable()).find('td').click(function(event) {
    var tdElement = $(event.target);

    if(!self.canClick() || (!self.hasSelect() || !tdElement.is($('td')) || tdElement.find('span').length > 0)) {
      return;
    }

    self.moveSelectBall(tdElement);
  });
};

Lines.prototype.moveSelectBall = function(tdElement) {
  destRow = parseInt(tdElement.data('row'), 10);
  destCol = parseInt(tdElement.data('col'), 10);

  this.buildShortestPath();

  if(this.canMoveSelectBall(destRow, destCol)) {
    this.updateStep();
    this.moveBallAnimate(destRow, destCol);
  }
};

Lines.prototype.canClick = function() {
  return !this.clickBlock;
};
Lines.prototype.allowClick = function() {
  this.clickBlock = false;
};
Lines.prototype.disallowClick = function() {
  this.clickBlock = true;
}

Lines.prototype.refresh = function() {
  this.resetSelectBall();
  applyScoreResult = this.applyScore();

  if(applyScoreResult) {
    var self = this;
    setTimeout(() => { 
      self.drawGameField(); 
      this.allowClick();
    }, 200);
  } else {
    this.generateGameField();
    if(this.applyScore(false)) {
      this.updateStep();
    }
    this.drawGameField();
    this.generateNextBalls();
    this.drawNextBalls();
    this.checkEndGame();
    this.allowClick();
  }
};

Lines.prototype.moveBallAnimate = function(destRow, destCol) {
  var iStep = 0;
  var self = this;

  this.stopBallAnimation();
  this.buildMovePath(destRow, destCol);
  this.disallowClick();

  this.moveBallAnimateTimerId = setInterval(function() {
    var step = self.moveBallArray[iStep];
    var stepRow = step[0];
    var stepCol = step[1];

    self.gameField[stepRow][stepCol] = self.gameField[self.selectBallRow][self.selectBallCol];
    self.gameField[self.selectBallRow][self.selectBallCol] = null;
    self.drawGameField(true);

    if(iStep + 1 >= self.moveBallArray.length) {
      self.refresh();
      clearInterval(self.moveBallAnimateTimerId);
    } else {
      self.selectBallRow = stepRow;
      self.selectBallCol = stepCol;
    }
    
    iStep++;
  }, 200);
};
Lines.prototype.stopMoveBallAnimate = function() {
  clearInterval(this.moveBallAnimateTimerId);
};
Lines.prototype.buildMovePath = function(destRow, destCol) {
  var curRow = destRow;
  var curCol = destCol;
  var prevRow = curRow;
  var prevCol = curCol;
  this.moveBallArray = new Array();

  do {
    this.moveBallArray.push([curRow, curCol]);

    var minPath = this.fieldRows * this.fieldColumns;
    var minRow = null;
    var minCol = null;

    // top
    if(!(prevRow == curRow - 1 && prevCol == curCol) && curRow - 1 >= 0 && this.gameFieldShortestPath[curRow - 1][curCol] < minPath) {
      minPath = this.gameFieldShortestPath[curRow - 1][curCol];
      minRow = curRow - 1;
      minCol = curCol;
    } 
    
    // right
    if(!(prevRow == curRow && prevCol == curCol + 1) && curCol + 1 < this.fieldColumns && this.gameFieldShortestPath[curRow][curCol + 1] < minPath) {
      minPath = this.gameFieldShortestPath[curRow][curCol + 1];
      minRow = curRow;
      minCol = curCol + 1;
    }
    
    // bottom
    if(!(prevRow == curRow + 1 && prevCol == curCol) && curRow + 1 < this.fieldRows && this.gameFieldShortestPath[curRow + 1][curCol] < minPath) {
      minPath = this.gameFieldShortestPath[curRow + 1][curCol];
      minRow = curRow + 1;
      minCol = curCol;
    }
    
    // left
    if(!(prevRow == curRow && prevCol == curCol - 1) && curCol - 1 >= 0 && this.gameFieldShortestPath[curRow][curCol - 1] < minPath) {
      minPath = this.gameFieldShortestPath[curRow][curCol - 1];
      minRow = curRow;
      minCol = curCol - 1;
    }

    prevRow = curRow
    prevCol = curCol;
    curRow = minRow;
    curCol = minCol;
  } while(!(curRow == this.selectBallRow && curCol == this.selectBallCol));
  this.moveBallArray.reverse();
}

Lines.prototype.resetSelectBall = function() {
  this.selectBallRow = null;
  this.selectBallCol = null;
};

Lines.prototype.applyScore = function(updateScore) {
  if(updateScore === undefined) {
    updateScore = true;
  }

  return this.applyHorizontalScore(updateScore) || this.applyVerticalScore(updateScore) || 
         this.applyDiagonalLeftToRightScore(updateScore) || this.applyDiagonalRightToLeftScore(updateScore) ||
         this.applyCrossScore(updateScore);
};
Lines.prototype.applyHorizontalVerticalScore = function(position, updateScore) {
  var anyUpdateScore = false;

  for(var row = 0; row < this.fieldRows; row++) {
    var resultString = '';

    for(var col = 0; col < this.fieldColumns; col++) {
      var fieldBall = position == 'horizontal' ? this.gameField[row][col] : this.gameField[col][row];
      resultString += fieldBall == null ? '#' : fieldBall.toString();
    }
    
    var scoreInfo = this.findAndUpdateScore(resultString);
    if(scoreInfo !== false) {
      var startScore = scoreInfo[0];
      var applyBalls = scoreInfo[1];

      for(var i = 0; i < applyBalls; i++) {
        if (position == 'horizontal') {
          this.gameField[row][startScore + i] = null;
        } else if (position == 'vertical') {
          this.gameField[startScore + i][row] = null;
        }
      }

      if(updateScore) {
        this.updateScore(applyBalls);
      }

      anyUpdateScore = true;
    }
  }

  return anyUpdateScore;
};
Lines.prototype.applyHorizontalScore = function(updateScore) {
  return this.applyHorizontalVerticalScore('horizontal', updateScore);
};
Lines.prototype.applyVerticalScore = function(updateScore) {
  return this.applyHorizontalVerticalScore('vertical', updateScore);
};
Lines.prototype.applyDiagonalLeftToRightScore = function(updateScore) {
  var startCoordinates = new Array([0, 0]);
  for(var row = 1; row <= this.fieldRows - this.minApply; row++) {
    startCoordinates.push([row, 0]);
  }
  for(var col = 1; col <= this.fieldColumns - this.minApply; col++) {
    startCoordinates.push([0, col]);
  }

  for(var i = 0; i < startCoordinates.length; i++) {
    var resultString = '';
    var coordinate = startCoordinates[i];
    var row = coordinate[0];
    var col = coordinate[1];

    for(var startIndex = 0; row + startIndex < this.fieldRows && col + startIndex < this.fieldColumns; startIndex++) {
      var fieldBall = this.gameField[row + startIndex][col + startIndex];
      resultString += fieldBall == null ? '#' : fieldBall.toString();
    }

    var scoreInfo = this.findAndUpdateScore(resultString);
    if(scoreInfo !== false) {
      var startScore = scoreInfo[0];
      var applyBalls = scoreInfo[1];

      for(var applyIndex = 0; applyIndex < applyBalls; applyIndex++) {
        this.gameField[row + startScore + applyIndex][col + startScore + applyIndex] = null;
      }

      if(updateScore) {
        this.updateScore(applyBalls);
      }
      
      return true;
    }
  }

  return false;
};
Lines.prototype.applyDiagonalRightToLeftScore = function(updateScore) {
  var startCoordinates = new Array();
  for(var row = 1; row <= this.fieldRows - this.minApply; row++) {
    startCoordinates.push([row, this.fieldRows - 1]);
  }
  for(var col = this.minApply - 1; col < this.fieldColumns; col++) {
    startCoordinates.push([0, col]);
  }

  for(var i = 0; i < startCoordinates.length; i++) {
    var resultString = '';
    var coordinate = startCoordinates[i];
    var row = coordinate[0];
    var col = coordinate[1];

    for(var startIndex = 0; row + startIndex < this.fieldRows && col - startIndex >= 0; startIndex++) {
      var fieldBall = this.gameField[row + startIndex][col - startIndex];
      resultString += fieldBall == null ? '#' : fieldBall.toString();
    }

    var scoreInfo = this.findAndUpdateScore(resultString);
    if(scoreInfo !== false) {
      var startScore = scoreInfo[0];
      var applyBalls = scoreInfo[1];

      for(var applyIndex = 0; applyIndex < applyBalls; applyIndex++) {
        this.gameField[row + startScore + applyIndex][col - startScore - applyIndex] = null;
      }

      if(updateScore) {
        this.updateScore(applyBalls);
      }
      
      return true;
    }
  }

  return false;
};
Lines.prototype.applyCrossScore = function(updateScore) {
  for(var row = 1; row < this.fieldRows - 1; row++) {
    for(var col = 1; col < this.fieldColumns - 1; col++) {
      var resultString = '';

      var addToResult = function(fieldBall) {
        if(fieldBall != null) {
          resultString += fieldBall.toString();
        }
      }

      // lefttop
      addToResult(this.gameField[row - 1][col - 1]);
      // righttop
      addToResult(this.gameField[row - 1][col + 1]);
      // leftbottom
      addToResult(this.gameField[row + 1][col - 1]);
      // rightbottom
      addToResult(this.gameField[row + 1][col + 1]);
      // current
      addToResult(this.gameField[row][col]);

      if(resultString.length == 5 && jQuery.unique(resultString.split('')).length == 1) {
        // lefttop
        this.gameField[row - 1][col - 1] = null;
        // righttop
        this.gameField[row - 1][col + 1] = null;
        // leftbottom
        this.gameField[row + 1][col - 1] = null;
        // rightbottom
        this.gameField[row + 1][col + 1] = null;
        // current
        this.gameField[row][col] = null;
  
        if(updateScore) {
          this.updateScore(5);
        }
  
        return true;
      }
    }
  }

  return false;
};
Lines.prototype.findAndUpdateScore = function(string) {
  for(var numBall = 1; numBall <= this.numberBalls; numBall++) {
    for(var applyBalls = this.fieldRows; this.minApply <= applyBalls; applyBalls--) {
      applySubString = (new Array(applyBalls + 1)).join(numBall.toString());
      startScore = string.indexOf(applySubString);

      if(startScore >= 0) {
        return [startScore, applyBalls];
      }
    }    
  }

  return false;
};

Lines.prototype.cloneArray = function(originalArray) {
  var returnArray = new Array();

  for(var i = 0; i < originalArray.length; i++) {
    returnArray[i] = originalArray[i].slice();
  }

  return returnArray;
};

Lines.prototype.buildShortestPath = function() {
  this.gameFieldShortestPath = this.cloneArray(this.gameField);
  var level = 0;

  // prepare buf array
  for(var row = 0; row < this.fieldRows; row++) {
    for(var col = 0; col < this.fieldColumns; col++) {
      if(this.gameFieldShortestPath[row][col] != null) {
        this.gameFieldShortestPath[row][col] = '#';
      }
    }
  }
  this.gameFieldShortestPath[this.selectBallRow][this.selectBallCol] = level;

  var changed = false;
  do {
    var nextLevel = level + 1;
    changed = false;

    for(var row = 0; row < this.fieldRows; row++) {
      for(var col = 0; col < this.fieldColumns; col++) {
        if(this.gameFieldShortestPath[row][col] == level) {
          // top
          if(row - 1 >= 0 && this.gameFieldShortestPath[row - 1][col] == null) {
            this.gameFieldShortestPath[row - 1][col] = nextLevel;
            changed = true;
          }
          // right
          if(col + 1 < this.fieldColumns && this.gameFieldShortestPath[row][col + 1] == null) {
            this.gameFieldShortestPath[row][col + 1] = nextLevel;
            changed = true;
          }
          // bottom
          if(row + 1 < this.fieldRows && this.gameFieldShortestPath[row + 1][col] == null) {
            this.gameFieldShortestPath[row + 1][col] = nextLevel;
            changed = true;
          }
          // left
          if(col - 1 >= 0 && this.gameFieldShortestPath[row][col - 1] == null) {
            this.gameFieldShortestPath[row][col - 1] = nextLevel;
            changed = true;
          }
        }
      }
    }

    level++;
  } while(changed);
};

Lines.prototype.canMoveSelectBall = function(destRow, destCol) {
  return parseInt(this.gameFieldShortestPath[destRow][destCol], 10) > 0;
};

Lines.prototype.hasSelect = function() {
  return this.selectBallRow != null && this.selectBallCol != null;
};

Lines.prototype.getSelectBall = function() {
  if(!this.hasSelect()) {
    return null;
  }

  return $(this.getGameFieldTable().rows[this.selectBallRow].cells[this.selectBallCol]).find('span');
};

Lines.prototype.startBallAnimation = function() {
  var ballElement = this.getSelectBall();
  if(ballElement == null) {
    return;
  }

  var marginIncrement = '+=' + this.ballJumpTop;
  var marginDecrement = '-=' + this.ballJumpTop;

  var bottomAnimate = function() { ballElement.animate({ marginTop: marginIncrement }, 200, topAnimate); }
  var topAnimate = function() { ballElement.animate({ marginTop: marginDecrement }, 200, bottomAnimate); }

  topAnimate();
};

Lines.prototype.stopBallAnimation = function() {
  var ballElement = this.getSelectBall();
  if(ballElement == null) {
    return;
  }

  ballElement.stop();
  ballElement.css('margin-top', this.ballJumpTop);
};

Lines.prototype.checkEndGame = function() {
  if(this.hasEndGame()) {
    if(this.score > 0) {
      this.scoreList.add(this.score, this.step);
    }

    var self = this;
    var gameOverBlock = $('<div>').addClass('game_over');
    var gameOverScore = $('<span>').addClass('game_over__score').text(this.score);
    var gameOverSteps = $('<span>').addClass('game_over__steps').text(this.step);
    gameOverBlock.append($('<div>').addClass('game_over__title').text('Game over!'));
    gameOverBlock.append($('<div>').addClass('game_over__score_text').text('Your score is ').append(gameOverScore).append(' and step ').append(gameOverSteps));

    $('#modal').html(gameOverBlock).modal({ onClose: function(dialog) {
      $.modal.close();
      self.start();
      self.scoreList.show();
    } });
  }
};

Lines.prototype.hasEndGame = function() {
  var countEmptyField = 0;

  for(var row = 0; row < this.fieldRows; row++) {
    for(var col = 0; col < this.fieldColumns; col++) {
      if(this.gameField[row][col] == null) {
        countEmptyField++;
      }

      if(countEmptyField > this.numberNextBalls) {
        return false;
      }
    }
  }

  return true;
};

Lines.prototype.drawGameField = function(withoutAnimate) {
  if(withoutAnimate === undefined) {
    withoutAnimate = false;
  }

  var table = this.getGameFieldTable();

  for(var row = 0; row < this.fieldRows; row++) {
    for(var col = 0; col < this.fieldColumns; col++) {
      var cell = $(table.rows[row].cells[col]);
      var ballNum = this.gameField[row][col];
      if(ballNum != null && cell.html().length == 0) {
        // add ball
        var ballElement = this.ballElement(ballNum, !withoutAnimate);
        this.addBallEvent(ballElement);
        cell.append(ballElement);
        if(!withoutAnimate) {
          this.ballShowAnimate(ballElement);
        }
      } else if(ballNum == null && cell.html().length > 0) {
        // remove ball
        if(withoutAnimate) {
          cell.html('');
        } else {
          cell.find('span').animate({ opacity: 0.25, height: '6px', width: '6px', borderRadius: '3px' }, 200, function() {
            $(this).remove();
          })
        }
      }
    }
  }
};

Lines.prototype.addScoreToList = function() {
  this.scoreList.unshift({ value: this.score, timestamp: this.getCurrentTimestamp() });
  this.saveScoreListToStorage();
};

Lines.prototype.start = function() {
  this.score = 0;
  this.step = 0;
  this.nextBalls = this.buildField(1, this.numberNextBalls);
  this.gameField = this.buildField(this.fieldRows, this.fieldColumns);

  this.drawScore();
  this.drawStep();
  this.generateNextBalls();
  this.generateGameField();
  this.generateNextBalls();
  this.drawNextBalls();
  this.drawGameField();
  this.hangFieldEvents();
  this.allowClick();
};

Lines.prototype.restart = function() {
  this.stopMoveBallAnimate();
  this.start();
}