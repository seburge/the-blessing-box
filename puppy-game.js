const puppyGame = document.querySelector('.puppy-game');

if (puppyGame) {
  const presents = puppyGame.querySelector('.puppy-presents');
  const difficulty = puppyGame.querySelector('#puppy-mode');
  const start = puppyGame.querySelector('.puppy-start');
  const status = puppyGame.querySelector('.puppy-game-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
  const positionNames = ['left', 'middle', 'right'];
  const modes = {
    easy: { swaps: 3, duration: 760, pause: 220 },
    medium: { swaps: 5, duration: 540, pause: 140 },
    hard: { swaps: 28, duration: 310, pause: 45, reducedSwaps: 8, reducedDelay: 1250 },
    impossible: { swaps: 60, duration: 220, pause: 30, reducedSwaps: 12, reducedDelay: 1250 }
  };
  let hidingPlace;
  let roundActive = false;

  start.addEventListener('click', async () => {
    if (roundActive) return;

    const mode = modes[difficulty.value];
    roundActive = true;
    difficulty.disabled = true;
    start.setAttribute('aria-disabled', 'true');
    const boxes = [...presents.children];
    boxes.forEach(box => {
      box.disabled = true;
      box.classList.remove('is-open', 'has-puppy', 'is-correct', 'is-missed', 'is-empty');
    });

    hidingPlace = boxes[Math.floor(Math.random() * boxes.length)];
    const position = () => [...presents.children].indexOf(hidingPlace);
    hidingPlace.classList.add('is-open', 'has-puppy');
    status.textContent = 'The puppy is hiding in the ' + positionNames[position()] + ' present.';
    await wait(2200);
    hidingPlace.classList.remove('is-open', 'has-puppy');
    await wait(430);

    const skipAnimation = reducedMotion.matches;
    const swapCount = skipAnimation ? (mode.reducedSwaps ?? mode.swaps) : mode.swaps;
    let lastPair;
    for (let turn = 0; turn < swapCount; turn++) {
      const choices = [[0, 1], [1, 2], [0, 2]].filter(pair => pair.join() !== lastPair);
      const [left, right] = choices[Math.floor(Math.random() * choices.length)];
      lastPair = [left, right].join();
      const order = [...presents.children];
      const first = order[left];
      const second = order[right];
      const firstX = first.getBoundingClientRect().left;
      const secondX = second.getBoundingClientRect().left;
      [order[left], order[right]] = [second, first];
      presents.append(...order);
      status.textContent = 'Swap ' + (turn + 1) + ' of ' + swapCount + '. The ' + positionNames[left] +
        ' and ' + positionNames[right] + ' presents trade places.';

      if (skipAnimation) {
        await wait(mode.reducedDelay ?? (1250 + mode.duration));
      } else {
        const animations = [[first, firstX - secondX, -1], [second, secondX - firstX, 1]]
          .map(([box, offset, direction]) => box.animate([
            { transform: 'translateX(' + offset + 'px)' },
            { transform: 'translate(' + offset / 2 + 'px, ' + direction * 22 + 'px)' },
            { transform: 'translateX(0)' }
          ], { duration: mode.duration, easing: 'ease-in-out' }));
        await Promise.all(animations.map(animation => animation.finished));
        await wait(mode.pause);
      }
    }

    status.textContent = 'Which present is hiding the puppy?';
    [...presents.children].forEach((box, index) => {
      box.setAttribute('aria-label', 'Open the ' + positionNames[index] + ' present');
      box.disabled = false;
    });
    if (document.activeElement === start) presents.firstElementChild.focus();
  });

  presents.addEventListener('click', event => {
    const box = event.target.closest('.puppy-box');
    if (!box || box.disabled || !roundActive) return;

    const found = box === hidingPlace;
    box.classList.add('is-open');
    box.classList.toggle('is-correct', found);
    box.classList.toggle('is-empty', !found);
    hidingPlace.classList.toggle('is-missed', !found);
    hidingPlace.classList.add('is-open', 'has-puppy');
    status.textContent = found
      ? 'You found the puppy!'
      : 'That present was empty. The puppy was in the ' +
        positionNames[[...presents.children].indexOf(hidingPlace)] + ' present!';
    roundActive = false;
    difficulty.disabled = false;
    start.removeAttribute('aria-disabled');
    start.textContent = 'Play again';
    if (document.activeElement === box) start.focus();
    [...presents.children].forEach(present => { present.disabled = true; });
  });
}
