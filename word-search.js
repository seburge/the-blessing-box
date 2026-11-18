const wordSearch = document.querySelector('.elfecutive-word-search');

if (wordSearch) {
  const grid = wordSearch.querySelector('.word-search-grid');
  const size = Number(grid.dataset.size);
  const cells = [...grid.querySelectorAll('.word-search-cell')];
  const names = [...wordSearch.querySelectorAll('.word-search-names li')];
  const status = wordSearch.querySelector('.word-search-status');
  const found = new Set();
  let startIndex = null;

  function clearSelection() {
    if (startIndex !== null) {
      cells[startIndex].classList.remove('is-selected');
      cells[startIndex].setAttribute('aria-pressed', 'false');
    }
    startIndex = null;
  }

  function markFound(name, path) {
    found.add(name.dataset.word);
    name.classList.add('is-found');
    name.setAttribute('aria-label', name.textContent + ', found');
    path.forEach(index => cells[index].classList.add('is-found'));
  }

  function selectLetter(index) {
    if (startIndex === null) {
      startIndex = index;
      cells[index].classList.add('is-selected');
      cells[index].setAttribute('aria-pressed', 'true');
      status.textContent = 'First letter selected. Now select the last letter of the name.';
      return;
    }
    const rowDistance = Math.floor(index / size) - Math.floor(startIndex / size);
    const colDistance = index % size - startIndex % size;
    const straight = rowDistance === 0 || colDistance === 0 || Math.abs(rowDistance) === Math.abs(colDistance);
    const path = [];
    if (straight) {
      const step = Math.sign(rowDistance) * size + Math.sign(colDistance);
      const length = Math.max(Math.abs(rowDistance), Math.abs(colDistance)) + 1;
      for (let offset = 0; offset < length; offset += 1) {
        path.push(startIndex + offset * step);
      }
    }
    const letters = path.map(cellIndex => cells[cellIndex].textContent).join('');
    const reversed = [...letters].reverse().join('');
    const match = names.find(name => name.dataset.word === letters || name.dataset.word === reversed);
    clearSelection();
    if (!match) {
      status.textContent = 'Try again. Select both ends of a name in a straight line.';
      return;
    }
    markFound(match, path);
    status.textContent = found.size === names.length
      ? 'You found all eight elfecutives!'
      : match.textContent + ' found! ' + found.size + ' of ' + names.length + ' names found.';
  }

  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
      cells.forEach(item => { item.tabIndex = -1; });
      cell.tabIndex = 0;
      selectLetter(index);
    });
    cell.addEventListener('keydown', event => {
      const row = Math.floor(index / size);
      const col = index % size;
      const moves = {
        ArrowLeft: [row, col - 1],
        ArrowRight: [row, col + 1],
        ArrowUp: [row - 1, col],
        ArrowDown: [row + 1, col],
        Home: [row, 0],
        End: [row, size - 1]
      };
      if (event.key === 'Escape') {
        clearSelection();
        status.textContent = found.size + ' of ' + names.length + ' names found.';
        return;
      }
      const next = moves[event.key];
      if (!next) return;
      event.preventDefault();
      if (next[0] < 0 || next[0] >= size || next[1] < 0 || next[1] >= size) return;
      cell.tabIndex = -1;
      const target = cells[next[0] * size + next[1]];
      target.tabIndex = 0;
      target.focus();
    });
  });

  wordSearch.querySelectorAll('[data-word-search-action]').forEach(button => {
    button.addEventListener('click', () => {
      clearSelection();
      if (button.dataset.wordSearchAction === 'reveal') {
        names.forEach(name => markFound(name, name.dataset.path.split(',').map(Number)));
        status.textContent = 'All eight names are highlighted. Choose Start over to try the puzzle again.';
        return;
      }
      found.clear();
      cells.forEach(cell => cell.classList.remove('is-found'));
      names.forEach(name => {
        name.classList.remove('is-found');
        name.removeAttribute('aria-label');
      });
      status.textContent = '0 of 8 names found.';
    });
  });
}
