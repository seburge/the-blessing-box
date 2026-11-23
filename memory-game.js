const memoryGame = document.querySelector('.memory-game');

if (memoryGame) {
  const board = memoryGame.querySelector('.memory-game-board');
  const status = memoryGame.querySelector('.memory-game-status');
  const reset = memoryGame.querySelector('.memory-game-reset');
  const timer = memoryGame.querySelector('.memory-game-timer span');
  const characters = [
    ['Hugh', 'hugh-no-tassel', 41, 91],
    ['Missy', 'missy', 28, 77],
    ['Everly Grace', 'everly-grace', 35, 78],
    ['Hasp', 'hasp', 22, 77],
    ['Pitch', 'pitch', 28, 80],
    ['Frank', 'frank', 41, 79],
    ['Snowstorm Norm', 'snowstorm-norm', 28, 77],
    ['Sprite', 'sprite', 29, 79],
    ['Thin Mint', 'thin-mint', 30, 76],
    ['Frosty the Bowman', 'frosty-the-bowman', 28, 76]
  ];
  let firstCard = null;
  let flipTimer = null;
  let pairs = 0;
  let startedAt = null;
  let timerInterval = null;

  function showElapsedTime() {
    const elapsed = Math.floor((performance.now() - startedAt) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = String(elapsed % 60).padStart(2, '0');
    timer.textContent = minutes + ':' + seconds;
  }

  function setCardState(card, state) {
    card.dataset.state = state;
    const faceDown = state === 'down';
    const label = faceDown ? 'Face down' : card.dataset.character + (state === 'matched' ? ', matched' : '');
    card.setAttribute('aria-label', 'Card ' + card.dataset.position + '. ' + label);
    card.setAttribute('aria-disabled', String(!faceDown));
  }

  function playCard(card) {
    if (flipTimer !== null || card.dataset.state !== 'down') return;

    if (startedAt === null) {
      startedAt = performance.now();
      timerInterval = setInterval(showElapsedTime, 1000);
    }
    setCardState(card, 'up');
    if (!firstCard) {
      firstCard = card;
      status.textContent = card.dataset.character + '. Pick a second card.';
      return;
    }

    const previousCard = firstCard;
    firstCard = null;
    if (previousCard.dataset.character === card.dataset.character) {
      setCardState(previousCard, 'matched');
      setCardState(card, 'matched');
      pairs++;
      if (pairs === characters.length) {
        clearInterval(timerInterval);
        timerInterval = null;
        showElapsedTime();
        status.textContent = 'You found all ten pairs! Final time: ' + timer.textContent + '.';
      } else {
        status.textContent = 'You matched ' + card.dataset.character + '! ' + pairs + ' of ' + characters.length + ' pairs found.';
      }
      return;
    }

    status.textContent = previousCard.dataset.character + ' and ' + card.dataset.character + ' are different. Try again.';
    flipTimer = setTimeout(() => {
      setCardState(previousCard, 'down');
      setCardState(card, 'down');
      flipTimer = null;
    }, 1250);
  }

  function deal() {
    clearInterval(timerInterval);
    timerInterval = null;
    startedAt = null;
    timer.textContent = '0:00';
    clearTimeout(flipTimer);
    flipTimer = null;
    firstCard = null;
    pairs = 0;
    const deck = [...characters, ...characters];
    for (let index = deck.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[other]] = [deck[other], deck[index]];
    }

    board.replaceChildren(...deck.map(([name, asset, artTop, artBottom], index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.dataset.character = name;
      card.dataset.position = String(index + 1);

      const back = document.createElement('span');
      back.className = 'memory-card-back';
      back.setAttribute('aria-hidden', 'true');
      const puppy = document.createElement('img');
      puppy.src = 'assets/memory-card-puppy.jpg';
      puppy.alt = '';
      puppy.loading = 'lazy';
      back.append(puppy);

      const face = document.createElement('span');
      face.className = 'memory-card-face';
      face.setAttribute('aria-hidden', 'true');
      const artwork = document.createElement('span');
      artwork.className = 'memory-card-artwork';
      artwork.style.setProperty('--art-height', String((artBottom - artTop) / 100));
      artwork.style.setProperty('--art-top', String(artTop / 100));
      const image = document.createElement('img');
      image.src = 'assets/bookmark-' + asset + '.png';
      image.alt = '';
      image.loading = 'lazy';
      const caption = document.createElement('span');
      caption.textContent = name;

      artwork.append(image);
      face.append(artwork, caption);
      card.append(back, face);
      setCardState(card, 'down');
      return card;
    }));
    status.textContent = '0 of ' + characters.length + ' pairs found.';
  }

  board.addEventListener('click', event => {
    const card = event.target.closest('.memory-card');
    if (card) playCard(card);
  });
  reset.addEventListener('click', deal);
  deal();
}
