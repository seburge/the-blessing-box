const crossword = document.querySelector('.fun-fact-crossword');

if (crossword) {
  const inputs = [...crossword.querySelectorAll('input[data-answer]')];
  const status = crossword.querySelector('.crossword-status');
  const directions = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0]
  };

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 1);
      input.removeAttribute('aria-invalid');
      status.textContent = '';
    });
    input.addEventListener('keydown', event => {
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const row = Number(input.dataset.row) + direction[0];
      const col = Number(input.dataset.col) + direction[1];
      const next = crossword.querySelector('input[data-row="' + row + '"][data-col="' + col + '"]');
      if (next) {
        next.focus();
        next.select();
      }
    });
  });

  crossword.querySelectorAll('[data-crossword-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.crosswordAction;
      if (action === 'check') {
        let correct = 0;
        inputs.forEach(input => {
          const matches = input.value.toUpperCase() === input.dataset.answer;
          if (matches) correct += 1;
          input.setAttribute('aria-invalid', String(Boolean(input.value) && !matches));
        });
        status.textContent = correct === inputs.length
          ? 'You solved the Fun Fact Crossword!'
          : correct + ' of ' + inputs.length + ' squares are correct. Keep exploring!';
        return;
      }
      inputs.forEach(input => {
        input.value = action === 'reveal' ? input.dataset.answer : '';
        input.removeAttribute('aria-invalid');
      });
      status.textContent = action === 'reveal' ? 'The completed answer grid is shown.' : 'The grid is cleared.';
    });
  });
}
