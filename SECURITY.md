# Security

## Reporting a problem

If you find a security issue in anything CulChar runs, email us at the address shown in the website's Contact panel, with the subject "Security". Please don't open a public GitHub issue for it.

## Rules for this repository

- **Keep the repository private.** It holds the business platform.
- **Never commit secrets or data.** No `.env` files, databases, uploads, generated documents, keys or credential files. `.gitignore` blocks them, and CI fails the build if one is committed anyway.
- **Secrets live only on the server**, in `platform/.env`. Use fresh keys for CulChar; never reuse another client's.
- **Production dependencies stay at zero known vulnerabilities.** CI runs `npm audit --omit=dev` on every push and pull request.
- **Tests never use real data.** The platform's test suite always starts from an empty database.
- **CI scans for secrets** on every push and pull request.

## Website

- No third-party scripts or fonts: everything is served from the site itself.
- A strict Content Security Policy only lets the page load its own files and send form data to FormSubmit. It's set in `website/index.html` and, with more headers, in `website/_headers`.
- No inline scripts or styles, so the policy can block injected code.

## Platform

- Every admin route checks the user's role on the server.
- Passwords are stored as bcrypt hashes. The first administrator's one-time password is written to a file only the server account can read; change it at first sign-in and delete the file.
- Rate limits on public and sign-in routes. PayFast payments count only after the signed server notification is verified.
- The platform's planned additions (two-step admin sign-in, encrypted off-server backups) are tracked in the CulChar Platform Plan.

## Before going live

- [ ] Host the website behind HTTPS with the headers in `website/_headers` applied. Cloudflare Pages and Netlify read that file; GitHub Pages does not.
- [ ] Activate FormSubmit, then swap the email address in `website/assets/js/site.js` for the random alias FormSubmit provides.
- [ ] Replace the personal email address with a business address on the CulChar domain.
- [ ] Add `website/.well-known/security.txt` with that business address, and renew it yearly.
- [ ] Generate fresh platform secrets (`SESSION_SECRET`, `SETTINGS_ENCRYPTION_KEY`, email, PayFast, Google) on the server only.
