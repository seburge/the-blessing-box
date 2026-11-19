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

Verified Netlify Forms submissions are emailed to `santa@theblessingbox.com`. Christmas wishes and both kit request forms also copy the adult email address. Reader feedback uses the optional email as Reply-To.

Verify a sending domain in Resend and create a sending API key. In the Netlify project’s environment variables, add the key as a Functions-scoped secret named `RESEND_API_KEY` and set `WISH_EMAIL_FROM` to a sender address on the verified domain. Redeploy after saving both settings. Keep form detection enabled in Netlify.

The `submission-created` Netlify function sends these emails. If the project also has built-in Netlify email notifications for the same forms and inbox, those rules can send an additional copy.

Expected release: November 15, 2026. No purchase link is shown until available.

Copyright 2026 Liv Fuller. All rights reserved. Illustrations by Quincy Battieste.
