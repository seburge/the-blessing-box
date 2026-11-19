const santaEmail = 'santa@theblessingbox.com';
const adultEmailField = ['email', 'Adult’s email address', 254];
const kitFields = [
  ['experience-count', 'Number of Blessing Box Experiences', 1],
  ['adult-full-name', 'Adult’s full name', 80],
  adultEmailField,
  ['adult-mailing-address', 'Adult’s mailing address', 2000],
  ['adult-phone', 'Adult’s phone number', 30]
];

const forms = new Map([
  ['christmas-wish', {
    subject: 'A Christmas Wish for Santa',
    fields: [
      ['first-name', 'Child’s first name', 80],
      ['christmas-wish', 'Christmas wish', 2000],
      ['would-give', 'What they would give', 2000],
      adultEmailField
    ],
    copyAdult: true
  }],
  ['christmas-wish-from-santa', {
    subject: 'Blessing Box Experience Request from Santa',
    fields: kitFields,
    copyAdult: true
  }],
  ['blessing-box-for-others', {
    subject: 'Blessing Box Experience Request from Someone Other Than Santa',
    fields: kitFields,
    copyAdult: true
  }],
  ['reader-feedback', {
    subject: 'The Blessing Box Reader Feedback',
    fields: [
      ['reader-name', 'First name or pen name', 100],
      ['city-state', 'City and state', 150, { optional: true }],
      ['email', 'Email address', 254, { optional: true }],
      ['review', 'Review or comments', 10000]
    ]
  }]
]);

const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => htmlEntities[character]);
}

// Netlify invokes this reserved function for verified form submissions.
export default async function handleSubmission(request) {
  const { payload: { id, form_name: formName, data } } = await request.json();
  const form = forms.get(formName);
  if (!form || data['bot-field']) return new Response(null, { status: 204 });
  if (formName === 'christmas-wish' && data['adult-permission'] !== 'yes') {
    return new Response(null, { status: 204 });
  }

  const rows = [];
  for (const [field, label, limit, { optional = false } = {}] of form.fields) {
    const value = typeof data[field] === 'string' ? data[field].trim() : '';
    if (!value && optional) continue;
    if (!value || value.length > limit) throw new Error(`Invalid field in ${formName}: ${field}`);
    rows.push([label, value]);
  }
  if (data['experience-count'] && !/^[1-4]$/.test(data['experience-count'].trim())) {
    throw new Error(`Invalid kit quantity in ${formName}`);
  }
  if (formName === 'christmas-wish') rows.push(['Adult permission to send the wish', 'Confirmed']);
  if (formName === 'reader-feedback') {
    rows.push(['Permission to quote the review', data['quote-permission'] === 'yes' ? 'Yes' : 'No']);
  }

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (email && !/^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d-]+(?:\.[a-z\d-]+)+$/i.test(email)) {
    throw new Error(`Invalid email address in ${formName}`);
  }

  const apiKey = Netlify.env.get('RESEND_API_KEY');
  const from = Netlify.env.get('WISH_EMAIL_FROM');
  if (!apiKey || !from) {
    throw new Error('Form email delivery requires RESEND_API_KEY and WISH_EMAIL_FROM');
  }
  if (!id) throw new Error('Netlify submission ID is missing');

  const intro = 'Submitted through The Blessing Box website.';
  const message = {
    from,
    to: [santaEmail],
    subject: form.subject,
    text: [form.subject, intro, ...rows.map(([label, value]) => `${label}\n${value}`)].join('\n\n'),
    html: `<h1>${escapeHTML(form.subject)}</h1><p>${intro}</p>`
      + rows.map(([label, value]) => `<h2>${escapeHTML(label)}</h2><p>${escapeHTML(value).replace(/\r?\n/g, '<br>')}</p>`).join('')
  };
  if (email) message.reply_to = email;
  if (form.copyAdult && email && email.toLowerCase() !== santaEmail) message.cc = [email];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `blessing-box-submission-${id}`
    },
    body: JSON.stringify(message)
  });
  if (!response.ok) throw new Error(`Form email provider returned status ${response.status}`);

  return new Response(null, { status: 204 });
}
