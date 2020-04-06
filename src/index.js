import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Cell(props) {
  return (<button onClick={props.onClick} className={"cell " + props.isChunkVer + " " + props.isChunkHor}>
    {props.value}

  </button>)
}

class Board extends React.Component {

  renderCell(cellNo, chunkVertical, chunkHorizontal) {
    return (<Cell key={cellNo} value={this.props.squares[cellNo]} isChunkVer={chunkVertical} isChunkHor={chunkHorizontal} onClick={() => this.props.onClick(cellNo)}/>)
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

    board.push(<div className="board-row">
      <React.Fragment>
        <button className="functions">Undo</button>
        <button className="functions" >Note</button>
        <button className="functions">Erase</button>
      </React.Fragment>
    </div>)



    return board;
  }

  render() {
    return <div>{this.createBoard(9, 9)}</div>;
  }
}

class Numbers extends React.Component {

  renderNum(){
    let numbers = []; let board =[];
    for (let x = 1; x <= 9; x++) {
      numbers.push(<button className="number-buttons" onClick={() => this.props.onClick(x)}>
        {x}</button>);
    }

    board.push(<div className="board-row">

        {numbers}
    </div>);

    return board;

    }

    render(){
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
      easyHistory: [0],
      mediumBoard: [0],
      mediumHistory: [0],
      hardBoard: [0],
      hardHistory:[0],
      notes: Array(81),
      selectedCell: "",
      input: ""
    };
  }

  easyBoard() {
    this.saveState();
    if (this.state.easyBoard[0] === 0) {
      let easyBoard = this.createBoard();
      let easyBoardDisp = [];
      for (let i = 0; i < 81; i++) {
        easyBoardDisp[i] = (Math.random() < 0.5)
          ? easyBoard[i]
          : "";
      }

      this.setState({squares: easyBoardDisp, easyHistory: easyBoardDisp,
        easyBoard: easyBoard,
        difficulty: "easy"
      })
    } else {
      this.setState({squares: this.state.easyHistory[this.state.history.length[0] - 1], difficulty: "easy"})
    }
  }

  mediumBoard() {
    this.saveState();
    if (this.state.mediumBoard[0] === 0) {
      let mediumBoard = this.createBoard();
      let mediumBoardDisp = [];
      for (let i = 0; i < 81; i++) {
        mediumBoardDisp[i] = (Math.random() < 0.4)
          ? mediumBoard[i]
          : "";
      }
      this.setState({squares: mediumBoardDisp, mediumHistory: mediumBoardDisp,
        mediumBoard: mediumBoard,
        difficulty: "medium"
      })
    } else {

      this.setState({squares: this.state.mediumHistory[this.state.history.length[1] - 1], difficulty: "medium"})
    }
  }

  hardBoard() {
    this.saveState();
    if (this.state.hardBoard[0] === 0) {
      let hardBoard = this.createBoard();
      let hardBoardDisp = [];
      for (let i = 0; i < 81; i++) {
        hardBoardDisp[i] = (Math.random() < 0.3)
          ? hardBoard[i]
          : "";
      }
      this.setState({squares: hardBoardDisp, hardHistory: hardBoardDisp,
        hardBoard: hardBoard,
        difficulty: "hard"
      })
    } else {
      this.setState({squares: this.state.hardHistory[this.state.history.length[2] - 1], difficulty: "hard"})
    }
  }

  saveState() {
    switch (this.state.difficulty) {
      case 1:
        this.setState({easyBoardDisp: this.state.squares})
        break;
      case 2:
        this.setState({mediumBoardDisp: this.state.squares})
        break;
      default:
        this.setState({hardBoardDisp: this.state.squares})
        break;
    }
  }

  createBoard() {

    let randomBoard = Array(9).fill(0);
    for (let x = 0; x < 9; x++) {
      randomBoard[x] = Array(9).fill(0); //initialize inner array
    };

    let board = this.solveBoard(randomBoard);

    let shuffledBoard = this.shuffleBoard(board);
    // let shuffledBoard = board;

    let cellNo = 0,
      completeBoard = []
    for (let i = 0; i < 9; i++) {
      for (let y = 0; y < 9; y++) {
        completeBoard[cellNo++] = shuffledBoard[i][y];
      }
    }
    return (completeBoard)
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

  shuffleBoard(board) {

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
    const current = this.state.squares;
    const history = this.state.squares;
    const easy = this.state.easyHistory;
    const medium = this.state.mediumHistory;
    const hard = this.state.hardHistory;
    const input = this.state.input;



    switch (this.state.difficulty) {
      case "easy":
        history.push(easy);
        this.setState({
          easyHistory : history
            })
        break;
      case "medium":
        history.push(medium)
        this.setState({
          mediumHistory : history
            })
        break;
      case "hard":
        history.push(hard)
        this.setState({
          hardHistory : history
            })
        break;
      default:
        return
    }

    console.log(current);
    console.log(input);

    current[i] = input;
    console.log(current);
    console.log(current[i]);

    this.setState({
      squares: current
    })

  //  this.state.notes[81]? this.set.state({notes[cellNo]:1}) : "";
  }

  inputChange(x){
    console.log("hello");
    this.setState({
      input: x,
    })
    console.log("x:"+x+" input:"+ this.state.input);
  }

  render() {
    return (<div className="game">
      <div className="game-board">
        <Board squares={this.state.squares} onClick={(i) => this.input(i)}/>
        <Numbers onClick={(x) => this.inputChange(x)}/>
      </div>
      <div className="difficulty-board">
        <div>
          <button className={"difficulty" + (
              this.state.difficulty === "easy"
              ? " difficulty--clicked"
              : "")} onClick={() => this.easyBoard()}>Easy
          </button>
          <button className={"difficulty" + (
              this.state.difficulty === "medium"
              ? " difficulty--clicked"
              : "")} onClick={() => this.mediumBoard()}>Medium</button>
          <button className={"difficulty" + (
              this.state.difficulty === "hard"
              ? " difficulty--clicked"
              : "")} onClick={() => this.hardBoard()}>Hard</button>
        </div>

      </div>

    </div>);
  }
}

ReactDOM.render(<Game/>, document.getElementById('root'));
