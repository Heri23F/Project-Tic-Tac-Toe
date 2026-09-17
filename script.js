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
      board.makeBoard();
      scoreBoard.addScore(turn);
      scoreBoard.addRound();
      scoreBoard.addRoundwiner(turn);
      switchTurn();
      return { status: "winGame" };
    }

    if (!gameWinner() && gameDraw()) {
      board.makeBoard();
      scoreBoard.addRound();
      scoreBoard.drawRound();
      return { status: "drawRound" };
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
    return { getValue, addRound, addScore, addRoundwiner, drawRound };
  })();

  return {
    playRound,
    activePlayer,
    getScore: scoreBoard.getValue(),
    printBoard,
  };
};

// Console Interface
const consoleGame = (function () {
  const game = gameControl();

  const updateDisplay = () => {
    console.log(`Round: ${game.getScore.round}`);
    console.log(`Score:`);
    console.log(`${game.getScore.playerName[0]}: ${game.getScore.score[0]}\n`);
    console.log(`${game.getScore.playerName[1]}: ${game.getScore.score[1]}\n`);
    console.log(game.printBoard());
    console.log(`Now ${game.activePlayer().name} Turn`);
  };
  const takeTurn = (row, column) => {
    const status = game.playRound(row, column).status;
    if (status === "winGame") {
      console.log("==== Winner ====");
      return console.log(`${game.getScore.roundWinner} win this round`);
    }
    if (status === "invalidMove") {
      return console.log("this cell already taken");
    }
    if (status === "takeTurn") {
      updateDisplay();
    }
    if (status === "drawRound") {
      console.log("Now One Win in this round");
      console.log("====== Draw ======");
      return updateDisplay();
    }
  };
  updateDisplay();
  return { takeTurn };
})();

// test game

// consoleGame.takeTurn(0, 0); // P1
// consoleGame.takeTurn(1, 0); // P2
// consoleGame.takeTurn(0, 1); // P1
// consoleGame.takeTurn(1, 1); // P2
// consoleGame.takeTurn(0, 2); // P1 — completes row 0, should trigger "winGame"

consoleGame.takeTurn(0, 0); // P1
consoleGame.takeTurn(0, 1); // P2
consoleGame.takeTurn(0, 2); // P1
consoleGame.takeTurn(1, 2); // P2
consoleGame.takeTurn(1, 0); // P1
consoleGame.takeTurn(2, 0); // P2
consoleGame.takeTurn(1, 1); // P1
consoleGame.takeTurn(2, 2); // P2
consoleGame.takeTurn(2, 1); // P1 — board now full, no winning line, should trigger "draw" once you add it

const uiControl = function () {
  const game = gameControl();
  const uiMark = ["", "o", "x"];
  const uiBoard = document.querySelector(".div-board");

  const updateDisplay = () => {
    uiBoard.textContent = "";
    // create cell for div board
    game.printBoard().forEach((row, rowIndex) => {
      row.forEach((cell, columIndex) => {
        let uiCell = document.createElement("button");
        uiCell.classList = "cell";
        uiCell.textContent = uiMark[cell];
        uiCell.dataset.row = rowIndex;
        uiCell.dataset.column = columIndex;
        uiBoard.appendChild(uiCell);
      });
    });
  };

  updateDisplay()
};

uiControl();
