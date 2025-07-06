const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const gameWinScreen = document.getElementById('gameWin');
const restartButton = document.getElementById('restartButton');
const winRestartButton = document.getElementById('winRestartButton');

let score = 0;
let lives = 3; // Not implemented in UI yet, but good to have
let gameRunning = true;

// Ball properties
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Paddle properties
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Brick properties
let brickRowCount = 5;
let brickColumnCount = 8;
let brickWidth = 50;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

initBricks();

// Event Listeners for paddle movement
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// NEW: Touch event listeners for canvas
canvas.addEventListener('touchstart', touchHandler, false);
canvas.addEventListener('touchmove', touchHandler, false);

function touchHandler(e) {
    e.preventDefault(); // Prevent scrolling and other default touch behaviors
    if (e.touches.length === 1) {
        const touchX = e.touches[0].clientX;
        const canvasRect = canvas.getBoundingClientRect();
        const relativeX = touchX - canvasRect.left;

        // Position the paddle's center at the touch point
        paddleX = relativeX - paddleWidth / 2;

        // Ensure paddle stays within canvas bounds
        if (paddleX < 0) {
            paddleX = 0;
        }
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    }
}

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Draw functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    scoreDisplay.innerHTML = score;
                    if (score === brickRowCount * brickColumnCount) {
                        gameWinScreen.classList.remove('hidden');
                        gameRunning = false;
                    }
                }
            }
        }
    }
}

function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball movement
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (lives === 0) {
                gameOverScreen.classList.remove('hidden');
                gameRunning = false;
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    x += dx;
    y += dy;

    // Paddle movement (for keyboard) - REMOVED FOR TOUCH CONTROL
    // if (rightPressed && paddleX < canvas.width - paddleWidth) {
    //     paddleX += 7;
    // } else if (leftPressed && paddleX > 0) {
    //     paddleX -= 7;
    // }

    requestAnimationFrame(draw);
}

// Restart game
restartButton.addEventListener('click', startGame);
winRestartButton.addEventListener('click', startGame);

function startGame() {
    score = 0;
    lives = 3;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;
    initBricks();
    scoreDisplay.innerHTML = score;
    gameOverScreen.classList.add('hidden');
    gameWinScreen.classList.add('hidden');
    gameRunning = true;
    draw();
}

startGame();