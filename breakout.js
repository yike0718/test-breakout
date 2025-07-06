const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const gameWinScreen = document.getElementById('gameWin');
const restartButton = document.getElementById('restartButton');
const winRestartButton = document.getElementById('winRestartButton');

// Base game resolution for scaling
const BASE_GAME_WIDTH = 480;
const BASE_GAME_HEIGHT = 320;

// Ball speed increment per paddle hit
const BALL_SPEED_INCREMENT = 0.2; // Adjust this value as needed

let score = 0;
let lives = 3;
let gameRunning = true;

// Ball properties
let ballRadius;
let x, y;
let dx, dy;

// Paddle properties
let paddleHeight;
let paddleWidth;
let paddleX;
let rightPressed = false; // Keep for keyboard control
let leftPressed = false;  // Keep for keyboard control

// Brick properties
let brickRowCount = 5;
let brickColumnCount = 8;
let brickWidth;
let brickHeight;
let brickPadding;
let brickOffsetTop;
let brickOffsetLeft;

let bricks = [];

// Scaling factor
let scaleFactor = 1;

// Mouse control variable
let isDragging = false;

function resizeGame() {
    const gameContainer = document.querySelector('.game-container');
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    let newCanvasWidth;
    let newCanvasHeight;

    // Check if it's a desktop view (e.g., wider than a typical mobile screen)
    if (window.innerWidth > 768) { // You can adjust this breakpoint
        newCanvasWidth = BASE_GAME_WIDTH;
        newCanvasHeight = BASE_GAME_HEIGHT;
        scaleFactor = 1; // No scaling for desktop
    } else {
        // Mobile view: responsive scaling
        newCanvasWidth = containerWidth;
        newCanvasHeight = (BASE_GAME_HEIGHT / BASE_GAME_WIDTH) * newCanvasWidth;

        if (newCanvasHeight > containerHeight) {
            newCanvasHeight = containerHeight;
            newCanvasWidth = (BASE_GAME_WIDTH / BASE_GAME_HEIGHT) * newCanvasHeight;
        }
        scaleFactor = newCanvasWidth / BASE_GAME_WIDTH;
    }

    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;

    // Scale game elements based on the determined scaleFactor
    ballRadius = 10 * scaleFactor;
    paddleHeight = 10 * scaleFactor;
    paddleWidth = 75 * scaleFactor;
    brickWidth = 50 * scaleFactor;
    brickHeight = 20 * scaleFactor;
    brickPadding = 10 * scaleFactor;
    brickOffsetTop = 30 * scaleFactor;
    brickOffsetLeft = 30 * scaleFactor;

    // Re-initialize positions based on new scale
    x = canvas.width / 2;
    y = canvas.height - (30 * scaleFactor);
    dx = 2 * scaleFactor;
    dy = -2 * scaleFactor;
    paddleX = (canvas.width - paddleWidth) / 2;

    initBricks(); // Re-initialize bricks with new scaled dimensions
}

function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Event Listeners for paddle movement
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// Touch event listeners for canvas
canvas.addEventListener('touchstart', touchHandler, false);
canvas.addEventListener('touchmove', touchHandler, false);

// Mouse event listeners for canvas
canvas.addEventListener('mousedown', mouseDownHandler, false);
canvas.addEventListener('mousemove', mouseMoveHandler, false);
canvas.addEventListener('mouseup', mouseUpHandler, false);
canvas.addEventListener('mouseleave', mouseUpHandler, false); // Stop dragging if mouse leaves canvas

function updatePaddlePosition(clientX) {
    const canvasRect = canvas.getBoundingClientRect();
    const relativeX = clientX - canvasRect.left;

    // Position the paddle's center at the touch/mouse point
    paddleX = relativeX - paddleWidth / 2;

    // Ensure paddle stays within canvas bounds
    if (paddleX < 0) {
        paddleX = 0;
    }
    if (paddleX + paddleWidth > canvas.width) {
        paddleX = canvas.width - paddleWidth;
    }
}

function touchHandler(e) {
    e.preventDefault(); // Prevent scrolling and other default touch behaviors
    if (e.touches.length === 1) {
        updatePaddlePosition(e.touches[0].clientX);
    }
}

function mouseDownHandler(e) {
    isDragging = true;
    updatePaddlePosition(e.clientX);
}

function mouseMoveHandler(e) {
    if (isDragging) {
        updatePaddlePosition(e.clientX);
    }
}

function mouseUpHandler(e) {
    isDragging = false;
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
            // Increase ball speed on paddle hit
            dx *= (1 + BALL_SPEED_INCREMENT);
            dy *= (1 + BALL_SPEED_INCREMENT);
        } else {
            lives--;
            if (lives === 0) {
                gameOverScreen.classList.remove('hidden');
                gameRunning = false;
            } else {
                // Reset ball and paddle position after losing a life
                x = canvas.width / 2;
                y = canvas.height - (30 * scaleFactor);
                dx = 2 * scaleFactor;
                dy = -2 * scaleFactor;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    x += dx;
    y += dy;

    // Paddle movement for keyboard (continuous movement)
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7 * scaleFactor;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7 * scaleFactor;
    }

    requestAnimationFrame(draw);
}

// Restart game
restartButton.addEventListener('click', startGame);
winRestartButton.addEventListener('click', startGame);

function startGame() {
    score = 0;
    lives = 3;
    resizeGame(); // Ensure game is sized correctly on start
    scoreDisplay.innerHTML = score;
    gameOverScreen.classList.add('hidden');
    gameWinScreen.classList.add('hidden');
    gameRunning = true;
    draw();
}

// Initial game setup and resize
resizeGame();
window.addEventListener('resize', resizeGame);
startGame();