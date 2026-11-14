# Security

## Reporting a problem

If you find a security issue on the CulChar website, email us at the address shown in the site's Contact panel, with the subject "Security". Please don't open a public GitHub issue for it.

## How the site is protected

- **No third-party code or fonts.** Every script, stylesheet and font is served from the site itself.
- **Content Security Policy.** Scripts, styles and fonts may only load from this site, and the page may only send data to FormSubmit (the contact form). The policy is set in `index.html` and, with more headers, in `_headers`.
- **No inline scripts or styles**, so the policy can block injected code.
- **No secrets in the repository.** The site is static and holds no keys. `.gitignore` blocks `.env` and key files.
- **Contact form.** Validated in the browser, sent over HTTPS to FormSubmit, with a honeypot field against spam bots. Personal information is handled as set out in the privacy notice on the site.

## Before going live

- [ ] Host behind HTTPS with the headers in `_headers` applied. Cloudflare Pages and Netlify read that file; GitHub Pages does not.
- [ ] Activate FormSubmit, then swap the email address in `assets/js/site.js` for the random alias FormSubmit provides, so the address isn't in the code.
- [ ] Replace the personal email address with a business address on the CulChar domain.
- [ ] Add `.well-known/security.txt` with that business address as the contact, and renew it yearly.
