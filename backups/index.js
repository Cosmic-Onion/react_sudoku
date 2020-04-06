import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Cell(props) {
  return (<button className={"cell " + (
      props.isChunkHor && props.isChunkVer
      ? "cell--ver cell--hor"
      : props.isChunkVer
        ? "cell--ver"
        : props.isChunkHor
          ? "cell--hor"
          : "")}>
    {props.value}

  </button>)
}

class Board extends React.Component {

  renderCell(cellNo, chunkVertical, chunkHorizontal) {
    return (<Cell key={cellNo} value={this.props.squares[cellNo]} isChunkVer={chunkVertical} isChunkHor={chunkHorizontal}/>)
  }

  createBoard(col, row) {
    const board = [];
    let cellNo = 0;

    for (let i = 0; i < row; i++) {
      const columns = [];
      let chunkHorizontal = (i === 2 || i === 5)
        ? "chunkVertical"
        : "";
      for (let y = 0; y < col; y++) {
        let chunkVertical = (y === 2 || y === 5)
          ? "chunkRight"
          : "";
        columns.push(this.renderCell(cellNo++, chunkVertical, chunkHorizontal));
      }
      board.push(<div key={i} className="board-row">{columns}</div>);
    }

    board.push(<div className="board-row">
      <React.Fragment>
        <button className="functions">Undo</button>
        <button className="functions">Note</button>
        <button className="functions">Erase</button>
      </React.Fragment>
    </div>)

    cellNo = 0;
    let numbers = []

    for (let i = 0; i < 9; i++) {
      numbers.push(<button className="number-buttons">{++cellNo}</button>);
    }

    board.push(<div className="board-row">
      <React.Fragment>
        {numbers}</React.Fragment>
    </div>);
    return board;
  }

  render() {
    return <div>{this.createBoard(9, 9)}</div>;
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      squares: [], //fill with random 0-9
      easyBoard       : [0],
      easyBoardDisp   : [0],
      easyClicked     : false,
      mediumBoard     : [0],
      mediumBoardDisp : [0],
      mediumClicked   : false,
      hardBoard       : [0],
      hardBoardDisp   : [0],
      hardClicked     : false,
      difficulty      : "",
      note            : false,
    };
  }

  easyBoard() {
    this.saveState();
    if (this.state.easyBoard[0] === 0){
    let easyBoard = this.createBoard();
    let easyBoardDisp = [];
    for (let i = 0; i < 81; i++) {
        easyBoardDisp[i] = (Math.random() < 0.5) ? easyBoard[i] : "";
    }
    this.setState({
      squares : easyBoardDisp,
      easyBoardDisp : easyBoardDisp,
      easyBoard : easyBoard,
      difficulty: "easy",
    })
  }  else {
    this.setState({
      squares:this.state.easyBoardDisp,
      difficulty: "easy",
    })
  }
}

  mediumBoard() {
    this.saveState();
    if (this.state.mediumBoard[0] === 0){
     let mediumBoard = this.createBoard();
     let mediumBoardDisp = [];
     for (let i = 0; i < 81; i++) {
         mediumBoardDisp[i] = (Math.random() < 0.4) ? mediumBoard[i] : "";
     }
     this.setState({
       squares : mediumBoardDisp,
       mediumBoardDisp : mediumBoardDisp,
       mediumBoard : mediumBoard,
       difficulty: "medium",
     })
   }  else {
     this.setState({
       squares:this.state.mediumBoardDisp,
       difficulty: "medium",
     })
   }
 }



  hardBoard() {
    this.saveState();
    if (this.state.hardBoard[0] === 0){
     let hardBoard = this.createBoard();
     let hardBoardDisp = [];
     for (let i = 0; i < 81; i++) {
         hardBoardDisp[i] = (Math.random() < 0.3) ? hardBoard[i] : "";
     }
     this.setState({
       squares : hardBoardDisp,
       hardBoardDisp : hardBoardDisp,
       hardBoard : hardBoard,
       difficulty: "hard",
     })
   }  else {
     this.setState({
       squares:this.state.hardBoardDisp,
       difficulty: "hard",
     })
   }
  }

  saveState(){
    switch (this.state.difficulty) {
      case "easy":
        this.setState({
          easyBoardDisp : this.state.squares
        })
        break;
      case "medium":
      this.setState({
        mediumBoardDisp : this.state.squares
      })
        break;
      case "hard":
      this.setState({
        hardBoardDisp : this.state.squares
      })
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

      if (!clashHorizontal(board, num, col)
          && !clashVertical(board, num, row)
          && !clashChunk(board, num, (row - row % 3), (col - col % 3))) { //calculate start of chunk and pass
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

    function shuffleColumns(board){
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
      return(board);
    }

    function shuffleRows(board){
      let shuffles = Math.floor(Math.random() * 200) + 100;
      for (let i = 0; i <= shuffles; i++) {
        let rowOne = Math.floor(Math.random() * 9);

        let rowTwo = (rowOne%3 === 0) ? rowOne + 2 : rowOne - rowOne%3;

        for (let x = 0; x < 9; x++) { //forloop to swap values
          let temp = board[rowOne][x]
          board[rowOne][x] = board[rowTwo][x];
          board[rowTwo][x] = temp;
        }
      }

      return(board);
    }

    return (board);
  }

  render() {
    return (<div className="game">
      <div className="game-board">
        <Board squares={this.state.squares}/>
      </div>
      <div className="difficulty-board">
        <div>
          <button className={"difficulty" + (this.state.difficulty === "easy" ? " difficulty--clicked" : "")} onClick={() => this.easyBoard()}>Easy </button>
          <button className={"difficulty" + (this.state.difficulty === "medium" ? " difficulty--clicked" : "")} onClick={() => this.mediumBoard()}>Medium</button>
          <button className={"difficulty" + (this.state.difficulty === "hard" ? " difficulty--clicked" : "")} onClick={() => this.hardBoard() }>Hard</button>
        </div>

      </div>

    </div>);
  }
}

ReactDOM.render(<Game/>, document.getElementById('root'));

// createChunk(chunkNo){
//   const board = [];
//   const chunk = [];
//   let cellNo =0;
//   for (var x = 0; x < 3; x++) {
//     const columns = [];
//     for (var y = 0; y < 3; y++) {
//       columns.push(this.renderCell(cellNo++, chunkNo));
//     }
//   board.push(columns);
// }
//   chunk.push(<div key={"chunk" + chunkNo} className="chunk">{board}</div>)
//   return (chunk)
// }
//
// createBoard(){
//   const chunkBoard = [];
//   let chunkNo = 0;
//   for (let x = 0; x < 3; x++) {
//     const chunkColumns = [];
//     for (let y = 0; y < 3; y++) {
//       chunkColumns.push(this.createChunk(chunkNo++));
//     }
//     chunkBoard.push(<div key={x} className="board-row">{chunkColumns}</div>)
//   }
//   return chunkBoard;
//   }
