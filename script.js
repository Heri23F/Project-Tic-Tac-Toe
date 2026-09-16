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

  const cell = (indexRow, indexColumn) => {
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
          return ownList.push([rowIndex, columIndex]);
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
  const getTurn = () => player[turn].name;
  const playRound = function (row, column) {
    if (board.addMark(player[turn].mark, row, column) === "invalid") {
      return console.log(displayTurn.errorTurn());
    }

    board.addMark(player[turn].mark, row, column);
    displayTurn.takeTurn();
    switchTurn();
    displayTurn.newTurn();
  };

  // used for console based not needed for ui
  const displayTurn = (() => {
    const takeTurn = () => {
      console.log(getTurn() + " take turn");
      console.log(board.boardState());
    };
    const newTurn = () => console.log(`Now ${getTurn()} Turn`);
    const errorTurn = () => `Cell already taken still ${getTurn()} turn`;

    return { takeTurn, newTurn, errorTurn };
  })();

  const getPlayerCell = () => {
    let playerCell = {
      playerOne: board.ownCell(player[0].mark),
      playerTwo: board.ownCell(player[1].mark),
    };

    return playerCell;
  };

  return { playRound, getPlayerCell };
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
