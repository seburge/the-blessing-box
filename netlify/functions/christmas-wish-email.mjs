import { createHash } from 'node:crypto';

export default {
  async formSubmitted(event) {
    const data = event.data;
    if (data['wish-type'] !== 'christmas-wish') return;
    if (data['bot-field'] || data['adult-permission'] !== 'yes') return;

    const fields = [
      ['Child’s first name', data['first-name'], 80],
      ['Christmas wish', data['christmas-wish'], 2000],
      ['What they would give', data['would-give'], 2000],
      ['Adult’s email address', data.email, 254]
    ];
    for (const [, value, limit] of fields) {
      if (typeof value !== 'string' || !value.trim() || value.length > limit) {
        throw new Error('Christmas wish has invalid or missing fields');
      }
    }

    const adultEmail = data.email.trim();
    if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(adultEmail)) {
      throw new Error('Christmas wish has an invalid adult email address');
    }

    const apiKey = Netlify.env.get('RESEND_API_KEY');
    const from = Netlify.env.get('WISH_EMAIL_FROM');
    if (!apiKey || !from) {
      throw new Error('Christmas wish email delivery requires RESEND_API_KEY and WISH_EMAIL_FROM');
    }

    const rows = fields.map(([label, value]) => [label, value.trim()]);
    rows.push(['Adult permission to send the wish', 'Confirmed']);
    const text = 'A Christmas wish submitted through The Blessing Box website.\n\n'
      + rows.map(([label, value]) => label + '\n' + value).join('\n\n');

    const escapeHTML = value => value.replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
    const html = '<h1>A Christmas Wish for Santa</h1>'
      + '<p>Submitted through The Blessing Box website. A copy is included for the adult whose email was provided.</p>'
      + rows.map(([label, value]) => '<h2>' + escapeHTML(label) + '</h2><p>'
        + escapeHTML(value).replace(/\r?\n/g, '<br>') + '</p>').join('');

    // Repeated delivery attempts for the same wish use the same provider key.
    const digest = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    const message = {
      from,
      to: ['santa@theblessingbox.com'],
      reply_to: adultEmail,
      subject: 'A Christmas Wish for Santa',
      text,
      html
    };
    if (adultEmail.toLowerCase() !== 'santa@theblessingbox.com') {
      message.cc = [adultEmail];
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'christmas-wish-' + digest
      },
      body: JSON.stringify(message)
    });
    if (!response.ok) {
      throw new Error('Christmas wish email provider returned status ' + response.status);
    }
  }
};
