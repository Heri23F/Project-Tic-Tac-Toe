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
  const boardState = () =>
    board.map((row) => row.map((cell) => cell.getValue()));

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

  return { getBoard, boardState, addMark, makeBoard, ownCell };
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

  // used for console based not needed for ui
  const displayTurn = (() => {
    const takeTurn = () => {
      console.log(activePlayer().name + " take turn");
      console.log(board.boardState());
    };
    const newTurn = () => console.log(`Now ${activePlayer().name} Turn`);
    const errorTurn = () =>
      `Cell already taken still ${activePlayer().name} turn`;

    return { takeTurn, newTurn, errorTurn };
  })();

  const playRound = function (row, column) {
    // guard rail for invalid add mark
    if (board.addMark(activePlayer().mark, row, column) === "invalid") {
      return console.log(displayTurn.errorTurn());
    }

    board.addMark(activePlayer().mark, row, column);
    if (gameWinner()) {
      board.makeBoard();
      scoreBoard.addScore(turn);
      scoreBoard.addRound();
      scoreBoard.addRoundwiner(turn);
      console.log(`${activePlayer().name} win`);
      console.log(scoreBoard.getValue());
    }
    displayTurn.takeTurn();
    switchTurn();
    displayTurn.newTurn();
  };

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
    };

    const getValue = () => {
      return scoreBoardObject;
    };
    const addRound = () => scoreBoardObject.round++;
    const addScore = (playerTurn) => scoreBoardObject.score[playerTurn]++;
    const addRoundwiner = (playerTurn) =>
      (scoreBoardObject.roundWinner = player[playerTurn].name);

    return { getValue, addRound, addScore, addRoundwiner };
  })();

  return { playRound, activePlayer, getScore: scoreBoard.getValue() };
};

let game = gameControl();

function simulateTurn() {
  game.playRound(0, 0);
  game.playRound(0, 2);
  game.playRound(1, 0);
  game.playRound(1, 1);
  game.playRound(2, 0);
}

simulateTurn();
