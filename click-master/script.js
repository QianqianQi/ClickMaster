let score;
let timeLeft;
let timer;
let isGameOver;
let spawnInterval;
let targetSize;
let intervalId;
let isPaused;
const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('timeLeft');
const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('endBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const pauseCountdownDisplay = document.getElementById('pauseCountdown');
const clickSound = new Audio('assets/single.wav');
const backgroundMusic = new Audio('assets/background2.mp3');
backgroundMusic.loop = true;  // 背景音乐循环播放
backgroundMusic.volume = 0.3;  // 设置音量为 20%

const images = [
    'assets/image/office365.png',
    'assets/image/office1.png',
    'assets/image/office2.png',
    'assets/image/office3.png',
    'assets/image/office4.png',
    'assets/image/office5.png',
    'assets/image/office6.png',
    'assets/image/bing.png',
    'assets/image/cosmos.png',
    'assets/image/datafactory.png',
    'assets/image/keyvault.png',
    'assets/image/msft.png',
    'assets/image/sql.png',
    'assets/image/oneDrive.png',
    'assets/image/azure.png',
    'assets/image/xbox.png',
    // 添加更多图片，直到 20 张
];

function startGame() {
    score = 0;
    timeLeft = 60;
    spawnInterval = 1500;  // 初始的生成间隔时间（毫秒）
    targetSize = 100;  // 初始目标大小
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    startBtn.disabled = true;
    startBtn.classList.add('disabled');  // 添加禁用样式类
    exitBtn.disabled = false;
    exitBtn.classList.remove('disabled');  // 移除禁用样式类
    const targets = gameArea.querySelectorAll('.target, .bomb');
    targets.forEach(target => target.remove());
    isPaused = false;
    isGameOver = false;  // 游戏开始，标志位设为 false
    targetSize = 100;  // 重置目标大小       
    timer = setInterval(updateTime, 1000); // 开始倒计时
    startSpawningTargets();  // 开始生成目标
}

function updateTime() {
    if (isGameOver) return;  // 如果游戏结束，跳过计时更新
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        endGame();
    }
}

function startSpawningTargets() {
    targetSpawnInterval = setInterval(() => {
        if (!isGameOver) {
            spawnMultipleTargets();  // 每隔一段时间生成目标
        }
    }, spawnInterval);  // 每2秒生成一次目标（可以根据需要调整时间）
}

// 随机生成1-3个目标
function spawnMultipleTargets() {
    const targetCount = Math.floor(Math.random() * 2) + 1;  // 随机生成 1 到 3 个目标
    for (let i = 0; i < targetCount; i++) {
        if (gameArea.children.length <= 5) {
            spawnTarget();  // 每次生成一个目标
        }
    }
}

function spawnTarget() {
    if (isGameOver || isPaused) return;  // 如果游戏结束，停止生成新目标

    const target = document.createElement('img');

    // 10%的几率生成炸弹
    const isBomb = Math.random() < 0.3;
    if (isBomb) {
        target.classList.add('target');
        target.src = Math.random() < 0.5 ? 'assets/image/bug2.png' : 'assets/image/bug3.png'; 
    } else {
        target.classList.add('target');
        target.src = images[Math.floor(Math.random() * images.length)];
    }

    const x = Math.random() * (gameArea.offsetWidth - 50);
    const y = Math.random() * (gameArea.offsetHeight - 50);

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.style.width = `${targetSize}px`;
    target.style.height = `${targetSize}px`;

    target.addEventListener('click', (e) => {
        if (isGameOver) return;  // 确保在游戏结束时点击无效

        if (isBomb) {
            spawnTarget();               
            // 点击炸弹，暂停游戏 5 秒
            pauseGame(5);  // 调用暂停函数
            target.remove();  // 移除炸弹        
        } else {
            score++;
            scoreDisplay.textContent = score;
            clickSound.play();

            // 获取目标和gameArea的位置
            const targetRect = target.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            // 计算目标中心的相对位置
            const targetX = targetRect.left + targetRect.width / 2 - gameAreaRect.left;
            const targetY = targetRect.top + targetRect.height / 2 - gameAreaRect.top;
            createExplosion(targetX, targetY);  // 在目标中心生成爆炸效果
            gameArea.removeChild(target);
            spawnTarget();
        }        
    });

    gameArea.appendChild(target);

    // 随着时间的推移，增加难度
    if (timeLeft % 10 === 0 && timeLeft !== 60) {
        if (targetSize > 50) {
            targetSize -= 3;  // 每10秒目标变小
        }
        if (spawnInterval > 500) {
            spawnInterval -= 30;  // 每10秒目标生成速度加快
        }
    }

    setTimeout(() => {
        if (!isGameOver && gameArea.contains(target)) {
            gameArea.removeChild(target);
            spawnTarget();  // 目标未被点击，生成新的
        }
    }, spawnInterval);
}

function pauseGame(seconds) {
    isPaused = true;
    let countdown = seconds;  // 倒计时初始值为传入的秒数
    pauseCountdownDisplay.textContent = countdown; // 初始显示倒计时
    pauseOverlay.style.display = 'flex'; // 显示覆盖层

    // 禁用所有现有目标的点击事件
    const targets = document.querySelectorAll('.target, .bomb');
    targets.forEach(target => {
        target.style.pointerEvents = 'none';  // 禁用点击
    });

    // 每秒更新倒计时
    intervalId = setInterval(() => {
        countdown--;
        pauseCountdownDisplay.textContent = countdown;

        // 当倒计时结束时恢复游戏
        if (countdown <= 0) {
            resumeGame();
        }
    }, 1000);  // 每 1 秒更新一次
}

function resumeGame() {
    isPaused = false;
    pauseOverlay.style.display = 'none'; // 隐藏覆盖层
    clearInterval(intervalId); // 清除倒计时

    // 恢复所有目标的点击事件
    const targets = document.querySelectorAll('.target, .bomb');
    targets.forEach(target => {
        target.style.pointerEvents = 'auto';  // 启用点击
    });
}

function endGame() {
    isGameOver = true;  // 标志游戏结束

    resumeGame();  // 恢复游戏状态
    // 停止倒计时和移除所有未点击的目标
    clearInterval(timer);
    const targets = gameArea.querySelectorAll('.target, .bomb');
    targets.forEach(target => target.remove());

    // 暂停背景音乐
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;  // 将音乐重置到开始位置

    // 显示游戏结束信息
    const message = document.createElement('p');
    message.classList.add('game-over-message');
    message.textContent = `Game Over! Your final score: ${score}. Want to play again?`;
    gameArea.appendChild(message);
    
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Play Again';
    restartBtn.addEventListener('click', () => {
        const targets = gameArea.querySelectorAll('.target, .bomb');
        targets.forEach(target => target.remove());
        // 启用开始按钮
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');  // 移除禁用样式类
        const existingMessage = gameArea.querySelector('.game-over-message');
        if (existingMessage) {
            gameArea.removeChild(existingMessage);
        }
        restartBtn.remove();
    });
    
    gameArea.appendChild(restartBtn);
    exitBtn.disabled = true;
    exitBtn.classList.add('disabled'); 
}

function createExplosion(x, y) {
    const canvas = document.createElement('canvas');
    canvas.width = gameArea.offsetWidth;
    canvas.height = gameArea.offsetHeight;
    canvas.classList.add('explosion');
    gameArea.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];

    for (let i = 0; i < 30; i++) {
        particles.push({
            x: x,
            y: y,
            speedX: (Math.random() - 0.5) * 10,
            speedY: (Math.random() - 0.5) * 10,
            size: Math.random() * 5 + 2,
            color: `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`
        });
    }

    const explode = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.size *= 0.95;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        if (particles[0].size > 0.5) {
            requestAnimationFrame(explode);
        } else {
            gameArea.removeChild(canvas);  // 移除粒子效果
        }
    };
    explode();
}

startBtn.addEventListener('click', () => {
    startGame();
    backgroundMusic.play();  // 游戏开始时播放背景音乐
});

exitBtn.addEventListener('click', () => {
    endGame();
});





