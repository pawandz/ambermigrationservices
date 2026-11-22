# Amber Migration Services: Website

A premium, responsive, multi-page **static website** for Amber Migration Services, an immigration and visa consultancy. Plain HTML, CSS and JavaScript, with no backend, database or server-side rendering. It can be hosted anywhere static files are served (GitHub Pages, Netlify, Apache/XAMPP, S3, …).

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| About Us | `about.html` |
| Our Services | `services.html` |
| Countries / Destinations | `destinations.html` |
| Immigration Process | `process.html` |
| Contact Us / Book a Consultation | `contact.html` |
| Privacy Policy | `privacy-policy.html` |
| Terms & Conditions | `terms.html` |
| Not found | `404.html` |

## Tech stack

- **HTML5**: semantic, accessible markup, generated from `src/` by a tiny Node script
- **Brand**: colours sampled from the official logo: navy `#0B2A55`, logo blue `#1556A0`, logo red `#D8231A` (`#B81C14` for small text)
- **SCSS → CSS**: design tokens, modular partials (`scss/`), compiled to `css/main.css`
- **JavaScript (ES6+)**: no framework, split into `navigation.js`, `components.js`, `animations.js`, `main.js`
- **GSAP 3.13 + ScrollTrigger + SplitText**: motion system (vendored in `js/vendor/`)
- **Lenis**: smooth scrolling, synced with ScrollTrigger
- **Icons**: inline SVG sprite (Lucide-style), no icon font

All content stays visible without JavaScript, and animations switch off for `prefers-reduced-motion`.

## Project structure

```text
├── *.html                 ← GENERATED pages (deployable output, committed)
├── sitemap.xml, robots.txt← GENERATED
├── site.config.json       ← business details: phone, email, WhatsApp, address, form endpoint
├── src/
│   ├── layout.html        ← <head>, scripts, shared document shell
│   ├── partials/          ← header.html, footer.html, icons.svg
│   └── pages/             ← one file per page (edit these!)
├── scss/
│   ├── main.scss
│   ├── abstracts/         ← tokens (colour, type, spacing, motion), mixins
│   ├── base/              ← reset, typography
│   ├── layout/            ← header, footer, grid
│   ├── components/        ← buttons, cards, destinations, timeline, map, slider, accordion, forms
│   └── pages/             ← page-specific sections
├── css/main.css           ← compiled stylesheet
├── js/                    ← main.js, navigation.js, components.js, animations.js, vendor/
├── assets/
│   ├── images/            ← WebP photography + world-dots.svg
│   └── logos/             ← logo.png (web), logo-original.png (master), favicon, apple-touch-icon
└── scripts/
    ├── build.js           ← builds the HTML pages, sitemap and robots.txt
    └── build-map.mjs      ← regenerates the dotted world map from Natural Earth data
```

## Getting started

Requires Node.js 18+.

```bash
npm install          # Sass + map tooling (dev only)
npm run build        # compile SCSS and generate all HTML pages
npm run serve        # preview at http://localhost:8080
npm run watch        # recompile CSS on change while editing styles
```

The site is also browsable directly from XAMPP at `http://localhost/ambermigrationservices/`.

> **Edit `src/pages/*.html`, `src/partials/*` and `scss/`, then run `npm run build`.**
> The root `*.html` files are generated and will be overwritten.

## Before going live: checklist

1. **Business details**: all contact details live in `site.config.json` (phone, WhatsApp number in international format without `+`, email, address, office hours, social links). Contact details are added to the structured data (JSON-LD) only while `"verified"` is `true`. Run `npm run build` after any change.
2. **Contact form**: a static site can't send email by itself. Create a form at [Formspree](https://formspree.io) (or another approved service) and put its endpoint URL in `formEndpoint`. Until then, the form validates input and hands the enquiry to the visitor's own email app. It says clearly that nothing has been sent yet and never shows a false success message.
3. **Site URL**: set `siteUrl` to the final domain (used for canonical URLs, Open Graph, sitemap).
4. **Testimonials**: the homepage shows client *commitments* until verified, consented testimonials are available. See the comment above the slider in `src/pages/index.html`.
5. **Credentials**: add verified registrations/licences to the notice on `src/pages/about.html`. Do not add unverified claims.
6. **Legal pages**: Privacy Policy and Terms are templates. Have them reviewed by a qualified professional.
7. **Destination content**: immigration rules change often. Review `src/pages/destinations.html` regularly against the official sources linked on each country.

## Deployment

### GitHub Pages
1. Push to the `main` branch of `github.com/<user>/ambermigrationservices`.
2. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`.
3. The site is published at `https://<user>.github.io/ambermigrationservices/`. All asset paths are relative, so this sub-path works as-is. `.nojekyll` is included so files are served untouched.

### Netlify
Drag-and-drop the project folder, or connect the repository. `netlify.toml` publishes the root directory and serves `404.html` for unknown routes. No build command is required, since the generated HTML is committed. If you prefer Netlify to build, set the build command to `npm run build`.

## Image credits

Photography from [Unsplash](https://unsplash.com) under the Unsplash License, converted to WebP and resized for the web. The world map is generated from [Natural Earth](https://www.naturalearthdata.com/) data (public domain) via `world-atlas`.

## Security

No credentials, tokens or secrets are stored in this repository. Authenticate to GitHub with Git Credential Manager or SSH keys. Never commit `.env` files or personal access tokens.
