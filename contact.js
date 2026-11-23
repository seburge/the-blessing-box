const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
const sendButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  sendButton.disabled = true;
  contactStatus.textContent = 'Sending your message…';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(new FormData(contactForm))
    });
    if (response.status !== 204) throw new Error('Message delivery failed');
    contactForm.reset();
    contactStatus.textContent = 'Thank you for getting in touch. Your message was sent.';
  } catch {
    contactStatus.textContent = 'Your message could not be sent. Please try again.';
  } finally {
    sendButton.disabled = false;
  }
});
