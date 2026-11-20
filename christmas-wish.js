for (const wishForm of document.querySelectorAll('.christmas-wish-form, form[name="reader-feedback"]')) {
  const submitButton = wishForm.querySelector('button[type="submit"]');
  let wishStatus = wishForm.querySelector('.wish-status') || wishForm.nextElementSibling;
  if (!wishStatus?.classList.contains('wish-status')) {
    wishStatus = document.createElement('p');
    wishStatus.className = 'wish-status';
    wishStatus.setAttribute('role', 'status');
    wishStatus.setAttribute('aria-live', 'polite');
    wishForm.append(wishStatus);
  }
  const messageType = wishForm.name === 'christmas-wish' ? 'Christmas wish'
    : wishForm.name === 'reader-feedback' ? 'feedback' : 'request';
  const sourceChoices = wishForm.querySelectorAll('input[type="radio"][name="blessing-box-source"]');
  if (sourceChoices.length) {
    wishForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!wishForm.reportValidity()) return;
      const sourceChoice = wishForm.querySelector('input[type="radio"][name="blessing-box-source"]:checked');
      if (sourceChoice?.value === 'Santa') window.location.assign('from-santa.html');
      if (sourceChoice?.value === 'Someone other than Santa') window.location.assign('for-others.html');
    });
  }

  if (!sourceChoices.length) wishForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton.disabled || !wishForm.reportValidity()) return;

    submitButton.disabled = true;
    wishForm.setAttribute('aria-busy', 'true');
    wishStatus.textContent = `Submitting your ${messageType}…`;

    try {
      const response = await fetch(wishForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(wishForm)).toString()
      });
      if (!response.ok) throw new Error('Submission failed');
      wishForm.reset();
      wishStatus.textContent = `Your ${messageType} has been received. Thank you!`;
    } catch {
      wishStatus.textContent = `Your ${messageType} could not be submitted. Please try again. Your answers are still here.`;
    } finally {
      submitButton.disabled = false;
      wishForm.removeAttribute('aria-busy');
    }
  });
}
