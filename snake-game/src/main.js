(function () {
  'use strict';

  var GRID_SIZE = 22;
  var INITIAL_SNAKE = [
    { x: 10, y: 11 },
    { x: 9, y: 11 },
    { x: 8, y: 11 }
  ];
  var DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  var OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  var STATUS_TEXT = { idle: '待开始', running: '运行中', paused: '暂停', gameover: '结束' };

  var canvas = document.getElementById('board');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var statusEl = document.getElementById('status');
  var restartBtn = document.getElementById('restart');
  var pauseBtn = document.getElementById('pause');
  var ctx = canvas.getContext('2d');

  var snake = cloneSnake(INITIAL_SNAKE);
  var food = randomFood(snake);
  var direction = 'right';
  var nextDirection = 'right';
  var state = 'idle';
  var score = 0;
  var best = readBest();
  var timer = null;
  var boardSize = 320;

  function cloneSnake(source) {
    var copy = [];
    for (var i = 0; i < source.length; i += 1) copy.push({ x: source[i].x, y: source[i].y });
    return copy;
  }

  function keyOf(point) { return point.x + ',' + point.y; }

  function readBest() {
    try { return Number(window.localStorage.getItem('snake-best') || 0); }
    catch (err) { return 0; }
  }

  function saveBest(value) {
    try { window.localStorage.setItem('snake-best', String(value)); }
    catch (err) {}
  }

  function randomFood(currentSnake) {
    var occupied = {};
    var available = [];
    for (var i = 0; i < currentSnake.length; i += 1) occupied[keyOf(currentSnake[i])] = true;
    for (var y = 0; y < GRID_SIZE; y += 1) {
      for (var x = 0; x < GRID_SIZE; x += 1) {
        if (!occupied[x + ',' + y]) available.push({ x: x, y: y });
      }
    }
    return available[Math.floor(Math.random() * available.length)] || { x: 0, y: 0 };
  }

  function setState(next) {
    state = next;
    statusEl.textContent = STATUS_TEXT[state];
    pauseBtn.textContent = state === 'paused' || state === 'idle' ? '▶' : '⏸';
    if (state === 'running') startTimer();
    else stopTimer();
    draw();
  }

  function updateStats() {
    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
    statusEl.textContent = STATUS_TEXT[state];
  }

  function startTimer() {
    stopTimer();
    var speed = Math.max(75, 155 - Math.floor(score / 5) * 10);
    timer = window.setInterval(tick, speed);
  }

  function stopTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function changeDirection(dir) {
    if (!DIRS[dir]) return;
    if (OPPOSITE[dir] !== direction) nextDirection = dir;
    if (state === 'idle') setState('running');
  }

  function restart() {
    snake = cloneSnake(INITIAL_SNAKE);
    food = randomFood(snake);
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    updateStats();
    setState('running');
  }

  function togglePause() {
    if (state === 'running') setState('paused');
    else if (state === 'paused' || state === 'idle') setState('running');
  }

  function tick() {
    if (state !== 'running') return;
    if (OPPOSITE[nextDirection] !== direction) direction = nextDirection;
    var head = snake[0];
    var vector = DIRS[direction];
    var newHead = { x: head.x + vector.x, y: head.y + vector.y };
    var ate = newHead.x === food.x && newHead.y === food.y;
    var hitWall = newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID_SIZE || newHead.y >= GRID_SIZE;
    var bodyLimit = ate ? snake.length : snake.length - 1;
    var hitSelf = false;
    for (var i = 0; i < bodyLimit; i += 1) {
      if (snake[i].x === newHead.x && snake[i].y === newHead.y) hitSelf = true;
    }
    if (hitWall || hitSelf) {
      best = Math.max(best, score);
      saveBest(best);
      updateStats();
      setState('gameover');
      return;
    }
    snake.unshift(newHead);
    if (ate) {
      score += 1;
      food = randomFood(snake);
      startTimer();
    } else {
      snake.pop();
    }
    updateStats();
    draw();
  }

  function roundedRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function drawCell(point, fill, glow, radius) {
    var cell = boardSize / GRID_SIZE;
    var padding = cell * 0.12;
    var x = point.x * cell + padding;
    var y = point.y * cell + padding;
    var size = cell - padding * 2;
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = glow;
    ctx.fillStyle = fill;
    ctx.beginPath();
    roundedRect(x, y, size, size, radius || 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function resizeCanvas() {
    var width = window.innerWidth || document.documentElement.clientWidth || 360;
    var max = Math.min(width - 32, 560);
    boardSize = Math.max(280, max);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(boardSize * dpr);
    canvas.height = Math.floor(boardSize * dpr);
    canvas.style.width = boardSize + 'px';
    canvas.style.height = boardSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    if (!ctx) return;
    var cell = boardSize / GRID_SIZE;
    ctx.clearRect(0, 0, boardSize, boardSize);
    var gradient = ctx.createLinearGradient(0, 0, boardSize, boardSize);
    gradient.addColorStop(0, '#111633');
    gradient.addColorStop(1, '#050611');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, boardSize, boardSize);
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
    ctx.lineWidth = 1;
    for (var i = 0; i <= GRID_SIZE; i += 1) {
      var p = i * cell;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, boardSize); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(boardSize, p); ctx.stroke();
    }
    for (var s = 0; s < snake.length; s += 1) {
      drawCell(snake[s], s === 0 ? '#76fff8' : '#39ff88', s === 0 ? '#00f5ff' : '#00ff85', s === 0 ? 10 : 7);
    }
    drawCell(food, '#ff3df2', '#ff3df2', 999);
    if (state !== 'running') {
      ctx.fillStyle = 'rgba(3, 4, 16, 0.62)';
      ctx.fillRect(0, 0, boardSize, boardSize);
      ctx.fillStyle = '#f7fbff';
      ctx.textAlign = 'center';
      ctx.font = '700 28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
      var title = state === 'gameover' ? 'GAME OVER' : state === 'paused' ? 'PAUSED' : 'NEON SNAKE';
      ctx.fillText(title, boardSize / 2, boardSize / 2 - 10);
      ctx.font = '500 15px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
      ctx.fillText(state === 'gameover' ? '按 Enter 或点击重开' : '方向键 / WASD 开始，空格暂停', boardSize / 2, boardSize / 2 + 24);
    }
  }

  function bindEvents() {
    restartBtn.addEventListener('click', restart, false);
    pauseBtn.addEventListener('click', togglePause, false);
    var buttons = document.querySelectorAll('[data-dir]');
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].addEventListener('click', function (event) {
        changeDirection(event.currentTarget.getAttribute('data-dir'));
      }, false);
    }
    window.addEventListener('keydown', function (event) {
      var map = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };
      if (map[event.key]) { event.preventDefault(); changeDirection(map[event.key]); }
      else if (event.key === ' ') { event.preventDefault(); togglePause(); }
      else if (event.key === 'Enter') { event.preventDefault(); restart(); }
    }, false);
    window.addEventListener('resize', resizeCanvas, false);
    window.addEventListener('orientationchange', function () { window.setTimeout(resizeCanvas, 250); }, false);
  }

  if (!canvas || !ctx) {
    document.body.innerHTML = '<p style="color:white;padding:24px">当前浏览器不支持 Canvas，无法运行游戏。</p>';
    return;
  }

  bindEvents();
  updateStats();
  resizeCanvas();
})();
