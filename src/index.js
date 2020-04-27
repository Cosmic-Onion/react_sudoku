import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Cell(props) {
  return (<button onClick={props.onClick} className={"cell " + props.isChunkVer + " " + props.isChunkHor + " " + (props.isNote ? "cell--note" : "" )}>
    {props.value}

  </button>)
}

class Board extends React.Component {

  renderCell(cellNo, chunkVertical, chunkHorizontal) {
    return (<Cell key={cellNo} value={this.props.squares[cellNo]} isChunkVer={chunkVertical} isChunkHor={chunkHorizontal} isNote={this.props.notes[cellNo + 1]} onClick={() => this.props.onClick(cellNo)} />)
  }

  createBoard(col, row) {
    const board = [];
    let cellNo = 0;

    for (let i = 0; i < row; i++) {
      const columns = [];
      let chunkHorizontal = (i === 2 || i === 5)
        ? "cell--hor"
        : "";
      for (let y = 0; y < col; y++) {
        let chunkVertical = (y === 2 || y === 5)
          ? "cell--ver"
          : "";
        
        columns.push(this.renderCell(cellNo++, chunkVertical, chunkHorizontal));
      }
      board.push(<div key={i} className="board-row">{columns}</div>);
    }

    return board;
  }

  render() {
    return <div>{this.createBoard(9, 9)}</div>;
  }
}

class Numbers extends React.Component {

  renderNum() {
    let numbers = []; let board = [];
    for (let x = 1; x <= 9; x++) {
      numbers.push(<button className="number-buttons" onClick={() => this.props.onClick(x)}>
        {x}</button>);
    }

    board.push(<div className="board-row">

      {numbers}
    </div>);

    return board;

  }

  render() {
    return this.renderNum();
  };

}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      squares: [], //fill with random 0-9
      history: [],
      difficulty: "",
      easyBoard: [0],
      easyDisp: [0][0],
      mediumBoard: [0],
      mediumDisp: [0][0],
      hardBoard: [0],
      hardDisp: [0][0],
      selectedCell: "",
      input: "",
      erase: false,
      notes: Array(82).fill(false),
    };
  }


  difficultySelect(difficulty) {
    if (difficulty === this.state.difficulty) {
      return
    } else {
      this.setState({
        difficulty: difficulty
      })
    }

    // this.saveState();                       //rewriting individual functions to streamline

    let difficultyBoard;

    switch (difficulty) {
      case "easy":
        difficultyBoard = this.state.easyBoard
        break;
      case "medium":
        difficultyBoard = this.state.mediumBoard
        break;
      default:
        difficultyBoard = this.state.hardBoard
        break;
    }

    if (difficultyBoard[0] === 0) {

      let boards = this.createBoard(difficulty);
      let board = boards[0];
      let boardDisp = boards[1]

      switch (difficulty) {
        case "easy":
          this.setState({
            easyBoard: board,
            squares: boardDisp,
            easyDisp: [boardDisp],
          })
          break;
        case "medium":
          this.setState({
            mediumBoard: board,
            squares: boardDisp,
            mediumDisp: [boardDisp],
          })
          break;
        default:
          this.setState({
            hardBoard: board,
            squares: boardDisp,
            hardDisp: [boardDisp],
          })
          break;
      }
    } else {
      let display;
      switch (difficulty) {
        case "easy":
          display = this.state.easyDisp;
          this.setState({
            squares: display[display.length - 1]
          })
          break;
        case "medium":
          display = this.state.mediumDisp;
          this.setState({
            squares: display[display.length - 1]
          })
          break;
        case "hard":
          display = this.state.hardDisp;
          this.setState({
            squares: display[display.length - 1]
          })
          break;
      }

    }

  }

  saveState() {
    switch (this.state.difficulty) {
      case "easy":
        this.setState({ easyDisp: this.state.squares })
        break;
      case "medium":
        this.setState({ mediumDisp: this.state.squares })
        break;
      default:
        this.setState({ hardDisp: this.state.squares })
        break;
    }
  }

  createBoard(difficulty) {
    let threshold

    let randomBoard = Array(9).fill(0);
    for (let x = 0; x < 9; x++) {
      randomBoard[x] = Array(9).fill(0); //initialize inner array
    };

    let board = this.solveBoard(randomBoard);

    let shuffledBoard = this.shuffleBoard(board);

    switch (difficulty) {
      case "easy":
        threshold = 0.5;
        break;
      case "medium":
        threshold = 0.4;
        break;
      case "hard":
        threshold = 0.3;
        break;
      default:
        break;
    }

    let
      cellNo = 0,
      completeBoard = [],
      boardDisp = [];

    for (let i = 0; i < 9; i++) {
      for (let y = 0; y < 9; y++) {
        completeBoard[cellNo] = shuffledBoard[i][y];
        boardDisp[cellNo++] = (Math.random() < threshold)
          ? shuffledBoard[i][y]
          : "";
      }
    }
    return [completeBoard, boardDisp]
  }

  solveBoard(board) {

    function assignCell(board) {

      let emptyPositions = emptyCell(board)
      if (!emptyPositions[0]) {

        return (true) //no more empty cells should be complete

      }
      const row = emptyPositions[1];
      const col = emptyPositions[2];

      for (let num = 1; num < 10; num++) {
        if (isValid(board, num, row, col)) { //check if ok to place here
          board[row][col] = num; //assignment
          if (assignCell(board)) {
            return true;
          } else
            board[row][col] = (0);
        }

      }
      return false
    }

    function emptyCell(board) {

      for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

          if (board[row][col] === (0)) { //if cell is empty return true
            return [1, row, col];
          }
        }
      }
      return ([0, 0, 0])
    }

    function isValid(board, num, row, col) {

      if (!clashHorizontal(board, num, col) && !clashVertical(board, num, row) && !clashChunk(board, num, (row - row % 3), (col - col % 3))) { //calculate start of chunk and pass
        return true
      } else
        return false;
    }

    function clashHorizontal(board, num, col) {

      for (let i = 0; i < 9; i++) {

        if (board[i][col] === num) {
          return true
        }
      }
      return false
    }

    function clashVertical(board, num, row) {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
          return true
        }
      }
      return false
    }

    function clashChunk(board, num, chunkRow, chunkCol) {
      let chunkRowEnd = chunkRow + 3,
        chunkColEnd = chunkCol + 3;
      for (let row = chunkRow; row < chunkRowEnd; row++) {
        for (let col = chunkCol; col < chunkColEnd; col++) {
          if (board[row][col] === num) {
            return true
          }
        }
      }
      return false
    }

    if (assignCell(board)) {

      return (board) //DO SHIT TO MAKE IT RENDER
    } else
      return (board.fill(0));

  }

  shuffleBoard(board) {     //TODO: improve randomness

    for (var i = 0; i < 9; i++) {
      board = shuffleColumns(board);
      for (var x = 0; x < 9; x++) {
        board = shuffleRows(board);
      }
    }

    function shuffleColumns(board) {
      let shuffles = Math.floor(Math.random() * 200) + 100;
      for (let i = 0; i <= shuffles; i++) {
        let colOne = Math.floor(Math.random() * 3);
        let colTwo = (Math.random() < 0.4)
          ? colOne + 3
          : colOne + 6;

        for (let x = 0; x < 9; x++) { //forloop to swap values
          let temp = board[x][colOne]
          board[x][colOne] = board[x][colTwo];
          board[x][colTwo] = temp;
        }
      }
      return (board);
    }

    function shuffleRows(board) {
      let shuffles = Math.floor(Math.random() * 200) + 100;
      for (let i = 0; i <= shuffles; i++) {
        let rowOne = Math.floor(Math.random() * 9);

        let rowTwo = (rowOne % 3 === 0)
          ? rowOne + 2
          : rowOne - rowOne % 3;

        for (let x = 0; x < 9; x++) { //forloop to swap values
          let temp = board[rowOne][x]
          board[rowOne][x] = board[rowTwo][x];
          board[rowTwo][x] = temp;
        }
      }

      return (board);
    }

    return (board);
  }

  input(i) {

    let input = this.state.input;
    let erase = this.state.erase;
    let notes = this.state.notes;
    const current = this.state.squares.slice();

    if (erase === true) {
      current[i] = "";
      this.setState({
        erase: false,     //TODO: once CSS toggle is correct, don't change erase here
        squares: current,
      })
      return;
    }
    if (input === "") {
      return;
    }
    if (notes[0] === true){
      current[i] = current[i] + input ;
      notes[0] =false;
      notes[i+1] =true;
      this.setState({
        squares: current,
        notes : notes,
      })
    }



    current[i] = input;

    console.log(`input(${i})`)

    this.setState((state, props) => ({
      squares: current,
      input: "",
    }));

    let difficulty = this.state.difficulty;

    switch (difficulty) {
      case "easy":
        let easy = this.state.easyDisp;
        easy.push(current);
        this.setState({
          easyDisp: easy
        })
        break;
      case "medium":
        let medium = this.state.mediumDisp;
        medium.push(current)
        this.setState({
          mediumDisp: medium
        })
        break;
      case "hard":
        let hard = this.state.hardDisp;
        hard.push(current)
        this.setState({
          hardDisp: hard
        })
        break;
      default:
        return
    }

    this.checkComplete(difficulty, current);

  }

  checkComplete(difficulty, current) {

    let completeDifficulty;

    switch (difficulty) {
      case "easy":
        completeDifficulty = this.state.easyBoard;
        break;
      case "medium ":
        completeDifficulty = this.state.mediumBoard;
        break;
      case "hard":
        completeDifficulty = this.state.hardBoard;
        break;
      default:
        break;
    }

    for (let x = 0; x < 81; x++) {
      if (current[x] === completeDifficulty[x]) {
        continue;
      } else {
        return;
      }
    }
    alert("Yay!!");
  }

  undo() {

    let display;
    const difficulty = this.state.difficulty;

    if (difficulty === "") return;

    switch (this.state.difficulty) {
      case "easy":

        let easy = this.state.easyDisp;
        if (easy.length === 1) {
          return;
        } else {
          easy.pop()
        }

        display = easy[easy.length - 1]
        this.setState({
          easyDisp: easy,
          squares: display,
        })

        break;
      case "medium":

        let medium = this.state.mediumDisp;
        if (medium.length === 1) {
          return;
        } else {
          medium.pop()
        }

        display = medium[medium.length - 1];
        this.setState({
          mediumDisp: medium,
          squares: display,
        })

        break;
      case "hard":

        const hard = this.state.hardDisp;
        if (hard.length === 1) {
          return;
        } else {
          hard.pop()
        }

        display = hard[hard.length - 1]
        this.setState({
          hardDisp: hard,
          squares: display,
        })

        break;
      default:
        return;
    }
  }

  inputChange(x) {
    this.setState({
      input: x,
    })
    console.log("input:" + this.state.input);
  }

  handleErase() {
    this.setState({  //TODO: add css toggle marker
      erase: true,
    })
  }

  handleNote() {
    let trueNotes = this.state.notes;
    trueNotes[0] = true;
    this.setState({  //TODO: add css toggle marker
      notes : trueNotes,
    })
  }

  render() {
    return (<div className="game">
      <div className="game-board">
        <Board squares={this.state.squares} notes={this.state.notes} onClick={(i) => this.input(i)} />
        <div className="board-row">
          <button className="functions" onClick={() => this.undo()}>Undo</button>
          <button className="functions" onClick={() => this.handleNote()}>Note</button>
          <button className="functions" onClick={() => this.handleErase()}>Erase</button>
        </div>
        <Numbers onClick={(x) => this.inputChange(x)} />
      </div>
      <div className="difficulty-board">
        <div>
          <button className={"difficulty" + (
            this.state.difficulty === "easy"
              ? " difficulty--clicked"
              : "")} onClick={() => this.difficultySelect("easy")}>Easy
          </button>
          <button className={"difficulty" + (
            this.state.difficulty === "medium"
              ? " difficulty--clicked"
              : "")} onClick={() => this.difficultySelect("medium")}>Medium</button>
          <button className={"difficulty" + (
            this.state.difficulty === "hard"
              ? " difficulty--clicked"
              : "")} onClick={() => this.difficultySelect("hard")}>Hard</button>
        </div>

      </div>

    </div>);
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));
