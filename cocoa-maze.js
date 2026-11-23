const cocoaMaze = document.querySelector('.cocoa-maze');

if (cocoaMaze) {
  const board = cocoaMaze.querySelector('canvas');
  const ctx = board.getContext('2d');
  const status = cocoaMaze.querySelector('.cocoa-maze-status');
  const cellSize = 24;
  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  // Inclusive column spans outline the cream, snowman head and body, and left handle.
  const silhouette = [
    [[15, 17]],
    [[13, 17]],
    [[11, 18]],
    [[10, 19]],
    [[8, 20]],
    [[7, 21]],
    [[7, 22]],
    [[4, 23]],
    [[2, 23]],
    [[1, 4], [7, 23]],
    [[1, 3], [7, 23]],
    [[1, 3], [8, 22]],
    [[1, 4], [9, 21]],
    [[2, 4], [9, 21]],
    [[2, 22]],
    [[4, 23]],
    [[6, 24]],
    [[5, 24]],
    [[5, 25]],
    [[5, 25]],
    [[5, 25]],
    [[5, 25]],
    [[6, 24]],
    [[7, 23]],
    [[8, 22]],
    [[11, 19]]
  ];
  const columns = 26;
  const cells = silhouette.map(row => Array.from({ length: columns }, (_, x) =>
    row.some(([left, right]) => x >= left && x <= right) ? { walls: 15 } : null));
  const start = [16, 0];
  const finish = [2, 11];
  let trail = [start];
  let won = false;

  function draw() {
    ctx.clearRect(0, 0, board.width, board.height);
    const wallEdges = [[0, 0, 1, 0], [1, 0, 1, 1], [1, 1, 0, 1], [0, 1, 0, 0]];
    const visits = new Set(trail.map(point => point.join()));
    cells.forEach((row, y) => row.forEach((cell, x) => {
      if (!cell) return;
      const left = (x + .5) * cellSize;
      const top = (y + .5) * cellSize;
      const isGoal = x === finish[0] && y === finish[1];
      const mugColor = y < 5 ? '#fff4df' : y === 5 ? '#d7a582' : '#f5f8fc';
      ctx.fillStyle = isGoal ? '#ffdc86' : visits.has([x, y].join()) ? '#b6e0ff' : mugColor;
      ctx.fillRect(left, top, cellSize, cellSize);
    }));

    // Keep the illustration under the walls so the passages stay readable.
    const coal = [
      [12, 8, .66], [18, 8, .66],
      [10, 10, .27], [11, 11, .27], [13, 12, .29], [15, 12, .29],
      [17, 12, .29], [19, 11, .27], [20, 10, .27],
      [15, 16, .64], [15, 19, .64], [15, 22, .64]
    ];
    ctx.fillStyle = '#788da4';
    coal.forEach(([x, y, radius]) => {
      ctx.beginPath();
      ctx.arc((x + 1) * cellSize, (y + 1) * cellSize, radius * cellSize, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#eda363';
    ctx.beginPath();
    ctx.moveTo(15 * cellSize, 10 * cellSize);
    ctx.lineTo(18.6 * cellSize, 10.7 * cellSize);
    ctx.lineTo(15 * cellSize, 11.05 * cellSize);
    ctx.closePath();
    ctx.fill();

    cells.forEach((row, y) => row.forEach((cell, x) => {
      if (!cell) return;
      const left = (x + .5) * cellSize;
      const top = (y + .5) * cellSize;
      wallEdges.forEach(([x1, y1, x2, y2], direction) => {
        if (!(cell.walls & (1 << direction))) return;
        const [dx, dy] = directions[direction];
        const neighbor = cells[y + dy]?.[x + dx];
        if (neighbor && direction > 1) return;
        ctx.strokeStyle = '#26344b';
        ctx.lineWidth = neighbor ? 1.8 : 3.3;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(left + x1 * cellSize, top + y1 * cellSize);
        ctx.lineTo(left + x2 * cellSize, top + y2 * cellSize);
        ctx.stroke();
      });
    }));

    ctx.fillStyle = '#634116';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', (finish[0] + 1) * cellSize, (finish[1] + 1) * cellSize);

    const [x, y] = trail.at(-1);
    ctx.fillStyle = '#16478f';
    ctx.beginPath();
    ctx.arc((x + 1) * cellSize, (y + 1) * cellSize, cellSize * .29, 0, Math.PI * 2);
    ctx.fill();
  }

  function reset(message) {
    trail = [start];
    won = false;
    status.textContent = message;
    draw();
  }

  function generate() {
    cells.forEach(row => row.forEach(cell => {
      if (cell) cell.walls = 15;
    }));
    const stack = [start];
    const visited = new Set([start.join()]);
    while (stack.length) {
      const [x, y] = stack.at(-1);
      const options = directions.flatMap(([dx, dy], direction) => {
        const next = [x + dx, y + dy];
        return cells[next[1]]?.[next[0]] && !visited.has(next.join()) ? [{ next, direction }] : [];
      });
      if (!options.length) {
        stack.pop();
        continue;
      }
      const { next, direction } = options[Math.floor(Math.random() * options.length)];
      cells[y][x].walls &= ~(1 << direction);
      cells[next[1]][next[0]].walls &= ~(1 << ((direction + 2) % 4));
      visited.add(next.join());
      stack.push(next);
    }
  }

  function move(direction, steps = 1) {
    if (won) return;
    let changed = false;
    for (let step = 0; step < steps; step++) {
      const [x, y] = trail.at(-1);
      if (cells[y][x].walls & (1 << direction)) break;
      const [dx, dy] = directions[direction];
      const next = [x + dx, y + dy];
      if (trail.at(-2)?.join() === next.join()) trail.pop();
      else trail.push(next);
      changed = true;
      if (next.join() === finish.join()) {
        won = true;
        break;
      }
    }
    status.textContent = won ? 'You found the golden star! Maze complete.'
      : changed ? '' : 'There’s a wall that way. Try another direction.';
    if (changed) draw();
  }

  if (ctx) {
    const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    cocoaMaze.addEventListener('keydown', event => {
      const direction = keys.indexOf(event.key);
      if (direction === -1) return;
      event.preventDefault();
      move(direction);
    });

    board.addEventListener('click', event => {
      const bounds = board.getBoundingClientRect();
      const x = Math.floor((event.clientX - bounds.left) * board.width / bounds.width / cellSize - .5);
      const y = Math.floor((event.clientY - bounds.top) * board.height / bounds.height / cellSize - .5);
      if (!cells[y]?.[x]) return;
      const [currentX, currentY] = trail.at(-1);
      const dx = x - currentX;
      const dy = y - currentY;
      if ((dx === 0) === (dy === 0)) return;
      const direction = directions.findIndex(([vx, vy]) => vx === Math.sign(dx) && vy === Math.sign(dy));
      move(direction, Math.abs(dx || dy));
    });

    cocoaMaze.querySelectorAll('[data-maze-move]').forEach(button => {
      button.addEventListener('click', () => move(Number(button.dataset.mazeMove)));
    });
    cocoaMaze.querySelector('[data-maze-reset]').addEventListener('click', () => reset('Back at the top of the whipped cream.'));
    cocoaMaze.querySelector('[data-maze-new]').addEventListener('click', () => {
      generate();
      reset('New maze. Start at the top of the whipped cream.');
    });
    generate();
    draw();
  }
}
