const wishForm = document.querySelector('.christmas-wish-form');

if (wishForm) {
  const submitButton = wishForm.querySelector('button[type="submit"]');
  const wishStatus = document.querySelector('.wish-status');

  wishForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton.disabled || !wishForm.reportValidity()) return;

    submitButton.disabled = true;
    wishForm.setAttribute('aria-busy', 'true');
    wishStatus.textContent = 'Sending your Christmas wish…';

    try {
      const response = await fetch(wishForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(wishForm)).toString()
      });
      if (!response.ok) throw new Error('Submission failed');
      wishForm.reset();
      wishStatus.textContent = 'Your Christmas wish has been received. Thank you!';
    } catch {
      wishStatus.textContent = 'Your wish could not be sent. Please try again. Your answers are still here.';
    } finally {
      submitButton.disabled = false;
      wishForm.removeAttribute('aria-busy');
    }
  });
}
