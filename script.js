const GameBoard = function () {
  const columns = 3;
  const rows = 3;
  const board = [];

  const newBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(cell());
      }
    }
  };

  const cell = () => {
    let value = 0;
    const getValue = () => value;
    const changeValue = (newValue) => (value = newValue);

    return { getValue, changeValue };
  };
  const displayBoard = () => {
    if (board.length === 0) return;
    return board.map((row) => row.map((column) => column.getValue()));
  };

  const addPlayerToken = (token, row, column) => {
    if (board[row][column].getValue() !== 0) return;
    board[row][column].changeValue(token);
  };

  const getBoard = () => board;

  return { getBoard, newBoard, displayBoard, addPlayerToken };
};

const GameControl = (playerOne = "Player One", playerTwo = "Player Two") => {
  const board = GameBoard();
  board.newBoard();

  const player = [
    {
      name: playerOne,
      token: 1,
    },
    {
      name: playerTwo,
      token: 2,
    },
  ];

  const turn = (() => {
    let currentTurn = 0;

    const switchTurn = () =>
      currentTurn === 0 ? (currentTurn = 1) : (currentTurn = 0);
    const getTurn = () => currentTurn;

    return { getTurn, switchTurn };
  })();
};

let game = GameControl("Heri", "Heru");
