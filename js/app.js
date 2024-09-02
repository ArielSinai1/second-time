'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'
const PURPLE_GAMER = '<img src="img/gamer-purple.png">'

// Model:
var gBoard
var gGamerPos
var gIntervalBall
var gIntervalGlue
var ballCount
var isGlued
var glueIdx
var steppedOnGlue
const audio = new Audio('electronic-pinging.mp3')

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gIntervalBall = setInterval(newBall, 4000)
    gIntervalGlue = setInterval(newGlue, 5000)
    ballCount = 0
    renderBallCount()
    isGlued = false
    steppedOnGlue = false
    glueIdx ={i: 20 ,j: 20}
}

function buildBoard() {
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    // DONE: Place the gamer and two balls
    const board = []
    const rowsCount = 10
    const colsCount = 12
    for (var i = 0; i < rowsCount; i++) {
        board[i] = []
        for (var j = 0; j < colsCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowsCount - 1 ||
                j === 0 || j === colsCount - 1) {
                board[i][j].type = WALL
            }
        }
    }
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    board[0][5].type = FLOOR
    board[9][5].type = FLOOR
    board[6][11].type = FLOOR
    board[6][0].type = FLOOR
    return board
}

//* Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) // cell-i-j floor

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j}), isAllCollected(), countNegs()" >`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    // console.log(strHTML)
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

//* Move the player to a specific location
function moveTo(i, j) {
    if(gGamerPos.i === glueIdx.i && gGamerPos.j === glueIdx.j) {
        steppedOnGlue = true
    }
    if (isGlued) return
    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    //* Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    //* If the clicked Cell is one of the four allowed or secret passage
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)
        || ((gGamerPos.i === 0 && gGamerPos.j === 5) && (i === 9 && j === 5))
        || ((gGamerPos.i === 6 && gGamerPos.j === 11) && (i === 6 && j === 0))
        || ((i === 0 && j === 5) && (gGamerPos.i === 9 && gGamerPos.j === 5))
        || ((i === 6 && j === 11) && (gGamerPos.i === 6 && gGamerPos.j === 0))) {

        if (targetCell.gameElement === BALL) {
            console.log('Collecting!')
            ballCount++
            renderBallCount()
            audio.play()
        } else if (targetCell.gameElement === GLUE) {
            console.log('Stuck on Glue!')
            isGlued = true
            glueIdx = {i ,j}
            setTimeout(() => {
                isGlued = false
                renderCell(gGamerPos, GAMER_IMG) 
            }, 3000)
            
            
        }

        //* REMOVE FROM LAST CELL
        // update the MODEl
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update the DOM
        renderCell(gGamerPos, '')


        //* ADD TO NEXT CELL
        // update the MODEl
        gBoard[i][j].gameElement = GAMER
        gGamerPos = { i, j }
        // update the DOM
        if (!isGlued) {
            renderCell(gGamerPos, GAMER_IMG)
        } else {
            renderCell(gGamerPos, PURPLE_GAMER)
        }
        
    }

    else {
        console.log('TOO FAR', iAbsDiff, jAbsDiff)
    }
    if(steppedOnGlue) {
        gBoard[glueIdx.i][glueIdx.j].gameElement = GLUE //update model
        renderCell(glueIdx, GLUE_IMG)  //update dome
        setTimeout(() => {
            gBoard[glueIdx.i][glueIdx.j].gameElement = null //update model
            renderCell(glueIdx, '')   //update dome
        }, 3000)
        steppedOnGlue = false
    }

}

//* Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

//* Move the player by keyboard arrows
function onKey(ev) {

    const i = gGamerPos.i
    const j = gGamerPos.j
    // console.log('ev.code:', ev.code)

    if (ev.code === 'ArrowLeft' && i === 6 && j === 0) {
        moveTo(6, 11)
    }
    if (ev.code === 'ArrowRight' && i === 6 && j === 11) {
        moveTo(6, 0)
    }
    if (ev.code === 'ArrowUp' && i === 0 && j === 5) {
        moveTo(9, 5)
    }
    if (ev.code === 'ArrowDown' && i === 9 && j === 5) {
        moveTo(0, 5)
    }
    switch (ev.code) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break

    }
    isAllCollected()
    countNegs()
}

//* Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

// Every few seconds a new ball is added in a random empty cell

function newBall() {

    var emptyCells = []

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].gameElement === null && gBoard[i][j].type === FLOOR) {
                emptyCells.push({ i, j })
            }
        }

    }
    var ballIdx = emptyCells[getRandomInt(0, emptyCells.length)]
    placeBall(ballIdx)
}

function placeBall(placeBallAtIdx) {
    // Update the model
    gBoard[placeBallAtIdx.i][placeBallAtIdx.j].gameElement = BALL
    // Update the DOM
    renderCell({ i: placeBallAtIdx.i, j: placeBallAtIdx.j }, BALL_IMG)
    countNegs()
}

// Show how many balls were collected

function renderBallCount() {
    var elBallCount = document.querySelector('.ballCount span')
    elBallCount.innerText = ballCount
}

// When all balls have been collected, end the game and show a 
// restart button

function isAllCollected() {
    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].gameElement === BALL) {
                return
            }
        }

    }
    clearInterval(gIntervalBall)
    // alert('You did it!')
    renderButton()
}

function renderButton() {
    var elRestartDiv = document.querySelector('.restart')
    elRestartDiv.innerHTML = `<button onclick="removeRestart()">restart</button>`
}

function removeRestart() {
    var elRestartDiv = document.querySelector('.restart')
    elRestartDiv.innerHTML = ''
    onInitGame()
}

// Play a sound when collecting a ball

// Count the number of balls in the cells neighboring the player 
// and display it in the header. 
// o Note that this number should update when the player 
// moves around the board and when a new ball is added 
// in one of its neighbor cells.

function countNegs() {
    var negsCount = 0
    var rowIdx = gGamerPos.i
    var collIdx = gGamerPos.j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = collIdx - 1; j <= collIdx + 1; j++) {
            if (i === rowIdx && j === collIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (gBoard[i][j].gameElement === BALL) {
                negsCount++
            }
        }
    }
    renderNegs(negsCount)
}

function renderNegs(counter) {
    var elH2 = document.querySelector('h2')
    elH2.innerText = `you have ${counter} balls near you`
}

// Add “secret passages” in the walls surrounding the game
// board.
// When the gamer travels through the top passage, he
// reappears at the bottom passage and vise versa.
// The same behavior applies to the left and right
// passages.

// Every 5 seconds, a GLUE game element is placed in a random
// empty cell

function newGlue() {

    var emptyCells = []

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].gameElement === null && gBoard[i][j].type === FLOOR) {
                emptyCells.push({ i, j })
            }
        }

    }
    var glueIdx = emptyCells[getRandomInt(0, emptyCells.length)]
    placeGlue(glueIdx)
}

function placeGlue(placeGlueAtIdx) {
    // Update the model
    gBoard[placeGlueAtIdx.i][placeGlueAtIdx.j].gameElement = GLUE
    // Update the DOM
    renderCell({ i: placeGlueAtIdx.i, j: placeGlueAtIdx.j }, GLUE_IMG)
    countNegs()

    setTimeout(() => {
        if (gBoard[placeGlueAtIdx.i][placeGlueAtIdx.j].gameElement === GLUE) {
            // Update the model
            gBoard[placeGlueAtIdx.i][placeGlueAtIdx.j].gameElement = null;
            // Update the DOM
            renderCell({ i: placeGlueAtIdx.i, j: placeGlueAtIdx.j }, '');
        }
    }, 3000)
}

// When the gamer steps in a cell with GLUE inside it, he gets
// stuck for 3 seconds (cannot move).

// If the gamer doesn’t step in the GLUE, it is removed 3 
// seconds after it was placed in the cell 

// If the gamer steps on the GLUE, it is removed 3 seconds after 
// the gamer stepped on it