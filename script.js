const GameBoard = function () {
  const rows = 3;
  const columns = 3;
  let board = [];

  const makeBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(cell(i, j));
      }
    }
  };

  const cell = () => {
    let value = 0;
    const getValue = () => value;
    const changeValue = (newValue) => (value = newValue);
    return { getValue, changeValue };
  };

  const getBoard = () => board;

  function addMark(mark, row, column) {
    //guardrail for inputing cell that already taken
    if (board[row][column].getValue() !== 0) return "invalid";

    return board[row][column].changeValue(mark);
  }
  const ownCell = (mark) => {
    let ownList = [];
    board.forEach((row, rowIndex) => {
      row.forEach((column, columIndex) => {
        if (column.getValue() === mark) {
          return ownList.push(`${rowIndex}${columIndex}`);
        }
      });
    });

    return ownList;
  };

  return { getBoard, addMark, makeBoard, ownCell };
};

const gameControl = function (
  playerOne = "Player One",
  playerTwo = "Player Two",
) {
  const player = [
    {
      name: playerOne,
      mark: 1,
    },
    {
      name: playerTwo,
      mark: 2,
    },
  ];
  let board = GameBoard();
  board.makeBoard();
  let turn = 0;
  const switchTurn = () => (turn === 0 ? (turn = 1) : (turn = 0));
  const activePlayer = () => player[turn];

  const printBoard = () => {
    return board.getBoard().map((row) => row.map((cell) => cell.getValue()));
  };

  const playRound = function (row, column) {
    // guard rail for invalid add mark
    if (board.addMark(activePlayer().mark, row, column) === "invalid") {
      return { status: "invalidMove" };
    }

    board.addMark(activePlayer().mark, row, column);
    if (gameWinner()) {
      const finalBoard = printBoard();
      const finalTurn = activePlayer().mark;
      board.makeBoard();
      scoreBoard.addScore(turn);
      scoreBoard.addRound();
      scoreBoard.addRoundwiner(turn);
      switchTurn();
      return {
        status: "winGame",
        finalBoard: finalBoard,
        finalTurn: finalTurn,
      };
    }

    if (!gameWinner() && gameDraw()) {
      const finalBoard = printBoard();
      board.makeBoard();
      scoreBoard.addRound();
      scoreBoard.drawRound();
      switchTurn();
      return { status: "drawRound", finalBoard: finalBoard };
    }
    switchTurn();
    return { status: "takeTurn" };
  };

  function gameDraw() {
    let evalCell = board.ownCell(0);
    return evalCell.length === 0;
  }

  function gameWinner() {
    let evalCell = board.ownCell(activePlayer().mark);
    if (evalCell.length < 3) return;

    const pattern = [
      // row pattern
      ["00", "01", "02"],
      ["10", "11", "12"],
      ["20", "21", "22"],
      //column pattern
      ["00", "10", "20"],
      ["01", "11", "21"],
      ["02", "12", "22"],
      // cross pattern
      ["00", "11", "22"],
      ["02", "11", "20"],
    ];

    return pattern.some((list) =>
      list.every((item) => evalCell.includes(item)),
    );
  }

  const scoreBoard = (() => {
    let scoreBoardObject = {
      score: [0, 0],
      round: 1,
      roundWinner: undefined,
      playerName: [player[0].name, player[1].name],
    };

    const getValue = () => {
      return scoreBoardObject;
    };
    const addRound = () => scoreBoardObject.round++;
    const addScore = (playerTurn) => scoreBoardObject.score[playerTurn]++;
    const addRoundwiner = (playerTurn) =>
      (scoreBoardObject.roundWinner = player[playerTurn].name);
    const drawRound = () => (scoreBoardObject.roundWinner = undefined);
    const reset = () => {
      scoreBoardObject.round = 0;
      scoreBoardObject.roundWinner = undefined;
      scoreBoardObject.score = [0, 0];
      turn = 0;
      return;
    };
    return { getValue, addRound, addScore, addRoundwiner, drawRound, reset };
  })();

  const resetGame = () => {
    board.makeBoard();
    scoreBoard.reset();
    return;
  };

  return {
    playRound,
    activePlayer,
    getScore: scoreBoard.getValue(),
    printBoard,
    resetGame,
  };
};

// Console Interface
const consoleGame = (function () {
  const game = gameControl();

  const updateDisplay = (board) => {
    console.log(`Round: ${game.getScore.round}`);
    console.log(`Score:`);
    console.log(`${game.getScore.playerName[0]}: ${game.getScore.score[0]}\n`);
    console.log(`${game.getScore.playerName[1]}: ${game.getScore.score[1]}\n`);
    console.log(board);
    console.log(`Now ${game.activePlayer().name} Turn`);
  };
  const takeTurn = (row, column) => {
    const turn = game.playRound(row, column);

    if (turn.status === "winGame") {
      console.log("==== Winner ====");
      return console.log(`${game.getScore.roundWinner} win this round`);
    }
    if (turn.status === "invalidMove") {
      return console.log("this cell already taken");
    }
    if (turn.status === "takeTurn") {
      updateDisplay(game.printBoard());
    }
    if (turn.status === "drawRound") {
      console.log("Now One Win in this round");
      console.log("====== Draw ======");
      return updateDisplay(turn.finalBoard);
    }
  };
  updateDisplay(game.printBoard());
  return { takeTurn };
})();

const uiControl = function () {
  let game = gameControl();
  const uiMark = ["", "o", "x"];
  const cellClass = ["empty", "player-one", "player-two"];
  const uiBoard = document.querySelector(".div-board");
  const uiScoreBoard = document.querySelector(".scoreboard");
  const endRoundDialog = document.querySelector(".round-dialog");
  const playerTurn = document.querySelector(".player-turn");
  const topContainer = document.querySelector(".top-container");

  const addResetButton = () => {
    const resetButton = document.createElement("button");
    resetButton.classList.add("reset-button");
    resetButton.textContent = "Reset Game";
    topContainer.append(resetButton);
  };

  const updateDisplay = (board) => {
    uiBoard.textContent = "";
    // create cell for div board
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columIndex) => {
        let uiCell = document.createElement("button");
        uiCell.classList.add("cell", cellClass[cell]);
        uiCell.textContent = uiMark[cell];
        uiCell.dataset.row = rowIndex;
        uiCell.dataset.column = columIndex;
        uiBoard.appendChild(uiCell);
      });
    });

    updatePlayerTurn();
  };

  const initGame = () => {
    const body = document.querySelector("body");

    const initDialog = document.createElement("dialog");
    initDialog.classList = "init-dialog";

    const initDialogText = document.createElement("span");
    initDialogText.classList = "init-dialog-text";
    initDialogText.textContent = "Player Name";

    const initForm = document.createElement("form");
    initForm.classList = "init-form";

    const playerOneNameLabel = document.createElement("label");
    playerOneNameLabel.setAttribute("for", "player-one-name");
    playerOneNameLabel.textContent = "Player One:";

    const playerOneNameInput = document.createElement("input");
    playerOneNameInput.setAttribute("id", "player-one-name");
    playerOneNameInput.setAttribute("type", "text");
    playerOneNameInput.setAttribute("required", "")

    const playerTwoNameLabel = document.createElement("label");
    playerTwoNameLabel.setAttribute("for", "player-two-name");
    playerTwoNameLabel.textContent = "Player two:";

    const playerTwoNameInput = document.createElement("input");
    playerTwoNameInput.setAttribute("id", "player-two-name");
    playerTwoNameInput.setAttribute("type", "text");
    playerTwoNameInput.setAttribute("required", "")

    const initButton = document.createElement("button");
    initButton.classList = "init-button";
    initButton.setAttribute("type", "submit");
    initButton.textContent = "Confirm";

    initForm.append(
      playerOneNameLabel,
      playerOneNameInput,
      playerTwoNameLabel,
      playerTwoNameInput,
      initButton,
    );
    initDialog.append(initDialogText, initForm);
    body.append(initDialog);
    initDialog.showModal();
    return;
  };

  const updatePlayerTurn = () => {
    playerTurn.textContent = "";

    const playerTurnText = document.createElement("span");
    playerTurnText.textContent = uiMark[game.activePlayer().mark];
    playerTurnText.classList = "player-turn-text";

    const playerName = document.createElement("span");
    playerName.classList = "player-name";
    playerName.textContent = game.activePlayer().name;

    playerTurn.classList = `player-turn ${cellClass[game.activePlayer().mark]}`;
    playerTurn.append(playerName, playerTurnText);
  };

  const updateScore = () => {
    uiScoreBoard.textContent = "";

    const round = document.createElement("div");
    round.classList.add("round-div");
    const roundText = document.createElement("span");
    roundText.classList.add("round-text");
    roundText.textContent = `Round: ${game.getScore.round}`;
    round.appendChild(roundText);
    uiScoreBoard.appendChild(round);

    const score = document.createElement("div");
    score.classList.add("score-div");
    const playerOneScore = document.createElement("span");
    const playerTwoScore = document.createElement("span");
    const scoreText = document.createElement("span");
    playerOneScore.classList.add("score-text", "player-one");
    playerTwoScore.classList.add("score-text", "player-two");
    scoreText.classList.add("score-text");
    playerOneScore.textContent = `${game.getScore.score[0]}`;
    playerTwoScore.textContent = `${game.getScore.score[1]}`;
    scoreText.textContent = "VS";
    score.append(playerOneScore, scoreText, playerTwoScore);
    uiScoreBoard.append(score);
  };

  const endRoundUpdate = () => {
    endRoundDialog.textContent = "";
    const endRoundText = document.createElement("span");
    endRoundText.classList.add("round-text");

    const addButton = () => {
      const endRoundBtn = document.createElement("button");
      endRoundBtn.classList.add("round-button");
      endRoundBtn.textContent = "Continue";
      endRoundDialog.append(endRoundBtn);
    };

    const winRound = (currentTurn) => {
      const playerTurn = currentTurn;
      endRoundText.textContent = `${game.getScore.roundWinner} Win`;
      endRoundDialog.classList = `win-round ${cellClass[playerTurn]}`;
      endRoundDialog.append(endRoundText);
      addButton();
      openDialog();
      return;
    };
    const drawRound = () => {
      endRoundText.textContent = `Draw`;
      endRoundDialog.classList = "draw-round";
      endRoundDialog.append(endRoundText);
      addButton();
      openDialog();
      return;
    };

    const openDialog = () => endRoundDialog.showModal();

    return { winRound, drawRound };
  };

  const clickHandler = (event) => {
    const target = event.target;
    let rowIndex = target.dataset.row;
    let columnIndex = target.dataset.column;
    if (!target.classList.contains("cell")) {
      return;
    }

    const turn = game.playRound(rowIndex, columnIndex);
    const turnResult = {
      takeTurn: () => updateDisplay(game.printBoard()),
      invalidMove: () => {
        return;
      },
      winGame: () => {
        updateDisplay(turn.finalBoard);
        updateScore();
        endRoundUpdate().winRound(turn.finalTurn);
        return;
      },
      drawRound: () => {
        updateDisplay(turn.finalBoard);
        updateScore();
        endRoundUpdate().drawRound();
        return;
      },
    };

    turnResult[turn.status]();
  };

  uiBoard.addEventListener("click", clickHandler);

  endRoundDialog.addEventListener("click", (event) => {
    const target = event.target;

    if (!target.classList.contains("round-button")) return;

    endRoundDialog.close();
    updateDisplay(game.printBoard());
  });

  topContainer.addEventListener("click", (event) => {
    const target = event.target;

    if (!target.classList.contains("reset-button")) return;

    game.resetGame();
    updateDisplay(game.printBoard());
    updateScore();
    return;
  });

  updateDisplay(game.printBoard());
  addResetButton();
  updateScore();
  initGame();

  const formInit = document.querySelector(".init-form");
  const initDialog = document.querySelector(".init-dialog");
  formInit.addEventListener("submit", (event) => {
    const target = event.target;
    event.preventDefault();

    const playerOneInput = document.getElementById("player-one-name").value;
    const playerTwoInput = document.getElementById("player-two-name").value;


    game = gameControl(playerOneInput, playerTwoInput);
    initDialog.close();

    updateDisplay(game.printBoard())
    updateScore()
    return
  });
};

uiControl();

// I chose to
// Decide to not add change name and new game
