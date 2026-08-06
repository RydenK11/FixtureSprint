# FixtureSprint

A one-page static website for FixtureSprint, a custom FDM production
tooling business. Built with plain HTML, CSS, and JavaScript only —
no frameworks, no build tools, no server, no database. Deploys directly
to GitHub Pages by uploading the files as-is.

## Files

```
index.html          Main page (all 10 sections)
styles.css           All styling, mobile-first responsive
script.js            Mobile nav, smooth scroll, form validation/AJAX, footer year
404.html             Custom "page not found" page for GitHub Pages
CNAME.example        Example custom-domain file (see "Connecting a custom domain")
README.md            This file
assets/              hero-jig-and-stand.jpg, gpu-stand.jpg, jig-empty.jpg,
                     jig-loaded.jpg — all in place (see "Placeholders to
                     replace" for what's still outstanding)
```

---

## 1. Previewing locally

No build step is required. Either:

- Double-click `index.html` to open it directly in a browser, **or**
- Serve the folder locally (recommended, so relative image paths behave
  exactly like they will on GitHub Pages):

  ```bash
  # From inside the FixtureSprint folder:
  python3 -m http.server 8000
  # then open http://localhost:8000 in your browser
  ```

The contact form will still attempt to submit to Formspree when tested
locally, so use a real or disposable Formspree form ID while testing.

---

## 2. Creating a GitHub repository

1. Go to https://github.com/new
2. Name the repository whatever you like (e.g. `fixturesprint-site`).
   - If you want the site at `https://<username>.github.io/` directly,
     name the repo `<username>.github.io` instead.
3. Leave it public (GitHub Pages on free plans requires a public repo,
   unless you have GitHub Pro/Team/Enterprise for private Pages).
4. Do **not** initialize with a README (you already have one here) —
   or if you do, you'll resolve the conflict during your first push.

---

## 3. Pushing the files

From inside this project folder:

```bash
git init
git add .
git commit -m "Initial FixtureSprint static site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

---

## 4. Enabling GitHub Pages from the main branch and repository root

1. In your GitHub repository, go to **Settings → Pages**.
2. Under "Build and deployment" → **Source**, choose **Deploy from a branch**.
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Wait 1–2 minutes, then refresh the Pages settings page — it will show
   your live URL (e.g. `https://<username>.github.io/<repo>/`).

---

## 5. Creating a Formspree form and replacing REPLACE_WITH_FORM_ID

1. Go to https://formspree.io and create a free account.
2. Create a new form and copy its **Form ID** (the string after `/f/` in
   the endpoint Formspree gives you, e.g. `https://formspree.io/f/abc123xy`).
3. Open `index.html` and find the comment block:
   ```html
   <!-- PLACEHOLDER (2): FORMSPREE ENDPOINT ... -->
   ```
   Replace `REPLACE_WITH_FORM_ID` in the form's `action` attribute with
   your real form ID.
4. Commit and push the change. `script.js` reads the `action` attribute
   automatically, so no JavaScript edits are needed.
5. Submit a real test entry from the live site once and confirm it
   arrives in your Formspree dashboard/email.
6. In your Formspree form settings, it's worth enabling their built-in
   spam filtering in addition to the honeypot field already in the HTML.

The Formspree form ID is meant to be public (it appears in the page
source of every Formspree-powered static site) — it is not a secret key,
so there is nothing to hide or move into an environment variable.

---

## 6. Connecting a custom domain

1. Copy `CNAME.example` to a new file named exactly `CNAME` (no extension)
   in the repository root.
2. Edit `CNAME` and replace the placeholder domain with your real domain,
   e.g.:
   ```
   www.fixturesprint.com
   ```
3. Commit and push the `CNAME` file.
4. In **Settings → Pages**, under **Custom domain**, enter the same
   domain and click **Save**. GitHub will attempt a DNS check.

---

## 7. Adding the required DNS records

At your domain registrar/DNS provider, add records pointing to GitHub Pages:

**For an apex/root domain (e.g. `fixturesprint.com`):**
Add four `A` records for `@` pointing to GitHub Pages' IP addresses:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**For a `www` subdomain (e.g. `www.fixturesprint.com`):**
Add a `CNAME` record:
```
www.fixturesprint.com  →  <your-username>.github.io.
```

Use whichever matches the domain you put in your `CNAME` file (or both,
if you want the apex domain to redirect to `www`). DNS propagation can
take anywhere from a few minutes to 24 hours.

---

## 8. Enabling HTTPS in GitHub Pages

1. After DNS has propagated and GitHub verifies the custom domain in
   **Settings → Pages**, an **Enforce HTTPS** checkbox will become
   available.
2. Check **Enforce HTTPS**. GitHub provisions a free TLS certificate via
   Let's Encrypt automatically — this can take up to a few hours after
   the domain is first verified.
3. Once enabled, all HTTP traffic is redirected to HTTPS automatically.

---

## 9. Replacing all placeholders before launch

Every placeholder is marked in the source with an HTML comment
(`<!-- PLACEHOLDER ... -->`). Search `index.html` for the word
`PLACEHOLDER` to jump to each one. Full list:

### Content placeholders
- [x] **Case study metrics** — in `index.html`, the `.metrics` block, now
      shows verified figures from three timed assemblies: 142 sec before,
      77 sec after, 65 sec/unit saved, 46% reduction. The former "Fixture
      Print Cost" card was removed since no verified value exists for it
      yet — add it back only once a real number is available.

### Technical placeholders
- [ ] **Formspree endpoint** — `REPLACE_WITH_FORM_ID` in the form's
      `action` attribute in `index.html` (see section 5 above).
- [ ] **Domain** — `https://example.com/` in the `<link rel="canonical">`,
      Open Graph `og:url`, and Twitter meta tags in `index.html`'s `<head>`;
      also the `CNAME` file itself (see sections 4 and 6).
- [ ] **Contact email** — `hello@rapidtoolingworks.com` appears in
      `index.html` (contact section and footer). Replace every instance
      with the real business email.

### Assets
- [x] `assets/hero-jig-and-stand.jpg` — hero image and Open Graph/Twitter
      preview image
- [x] `assets/gpu-stand.jpg` — case-study gallery, finished GPU support product
- [x] `assets/jig-empty.jpg` — case-study gallery, empty fixture
- [x] `assets/jig-loaded.jpg` — case-study gallery, fixture loaded with parts

All four images are in place. The case-study video (`assets/before-after.mp4`,
`assets/poster.jpg`) was removed from the page entirely rather than left as
a placeholder — there was no verified footage to show. If a before/after
clip becomes available later, it can be re-added as a new section.

### Business name
- [ ] "FixtureSprint" appears throughout `index.html` (title, meta tags,
      nav logo, hero, footer) and in `404.html`. Search both files for
      `FixtureSprint` if the business name ever changes.

---

## Troubleshooting: "I pushed a fix but the live site looks unchanged"

This is almost always a browser cache issue, not a deployment issue —
especially on mobile Safari, which aggressively caches `styles.css` and
`script.js` by their plain filename even after GitHub Pages has served
the updated version.

- **Fastest check:** open the site in a Private/Incognito tab. If it
  looks correct there, it's confirmed to be a cache issue on your
  regular tab/browser, not a real bug.
- **Fix for that device:** on iOS, go to Settings → Safari → Advanced →
  Website Data, find the site, and delete just that entry (or clear all
  history/website data as a heavier-handed option).
- **Permanent fix (already in place):** `index.html` and `404.html`
  load `styles.css` and `script.js` with a version query string
  (`styles.css?v=2`). Bump that number (`?v=3`, `?v=4`, ...) any time
  you edit either file and push — a changed URL forces every browser to
  fetch the new version instead of reusing a cached one.

---

## Notes

- All asset references use **relative paths** (`assets/...`, not
  `/assets/...`), so the site works correctly whether it's hosted at a
  domain root or inside a GitHub Pages project subdirectory
  (`https://username.github.io/repo-name/`).
- The favicon is an inline SVG data URI as a placeholder — replace it
  with a real favicon file (e.g. `assets/favicon.ico`) when branding is
  finalized, and update the `<link rel="icon">` tag accordingly.
- The contact form degrades gracefully: if JavaScript is disabled, the
  `<noscript>` notice near the form explains that it will still submit
  directly to Formspree via a normal page redirect instead of showing
  inline success/error messages.
