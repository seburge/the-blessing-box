const recipients = new Map([
  ['Liv Fuller', 'livfullerauthor@gmail.com'],
  ['Quincy Battieste', 'Quincy@themousepatrol.com']
]);

export default async function sendContact(request) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (request.headers.get('sec-fetch-site') === 'cross-site') return new Response(null, { status: 403 });

  const body = await request.text();
  if (body.length > 25000) return new Response('Message is too long.', { status: 413 });
  const fields = new URLSearchParams(body);
  const success = () => request.headers.get('accept') === 'application/json'
    ? new Response(null, { status: 204 })
    : new Response('Thank you for getting in touch. Your message was sent.');
  if (fields.get('bot-field')) return success();

  const recipient = recipients.get(fields.get('recipient'));
  const name = fields.get('name')?.trim() || '';
  const email = fields.get('email')?.trim() || '';
  const topic = fields.get('topic')?.trim() || '';
  const message = fields.get('message')?.trim() || '';
  if (!recipient || name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !topic || topic.length > 100 || !message || message.length > 5000) {
    return new Response('Check your email address and complete the required fields.', { status: 400 });
  }

  const apiKey = Netlify.env.get('RESEND_API_KEY');
  const from = Netlify.env.get('WISH_EMAIL_FROM') || 'The Blessing Box <santa@theblessingbox.com>';
  if (!apiKey) return new Response('Message delivery is temporarily unavailable.', { status: 503 });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: 'New message from The Blessing Box website',
        text: `From: ${name || '(name omitted)'} <${email}>\nTopic: ${topic}\n\n${message}`
      })
    });
    return response.ok ? success() : new Response('Message delivery failed.', { status: 502 });
  } catch {
    return new Response('Message delivery failed.', { status: 502 });
  }
}
