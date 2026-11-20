# The Blessing Box

A standalone book website for The Blessing Box by Liv Fuller.

## Preview
Open index.html, or serve this directory with any static web server. No build or dependencies required.

## Publish on GitHub Pages
In repository Settings → Pages, select Deploy from a branch, main, and / (root). The expected URL is https://seburge.github.io/the-blessing-box/.

## Contents
- Original Christmas design, using book artwork supplied by the author
- Full Chapter One sample
- Family reading ideas and an interactive kindness prompt
- Release information and FAQ
- Release signup links to the author website. Netlify Forms collects Christmas wishes, kit requests, and reader feedback on this site.

## Form email delivery

To route Santa’s mail the same way as the Liv Fuller author site, open the Netlify project’s **Forms → Submission notifications**. Add an **Email notification** for **Any form** to `santa@theblessingbox.com`. Confirm the address from Santa’s inbox if Netlify sends a confirmation request.

Netlify handles delivery to Santa for all verified submissions, including reader feedback. The `submission-created` function emails the adult address entered on a Christmas wish or kit request, with Santa as Reply-To. If the adult address is Santa’s, the Netlify notification serves as the only copy.

The adult copies use the existing `RESEND_API_KEY` and optional `WISH_EMAIL_FROM` settings.

Expected release: November 15, 2026. No purchase link is shown until available.

Copyright 2026 Liv Fuller. All rights reserved. Illustrations by Quincy Battieste.
