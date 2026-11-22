/**
 * Static page builder.
 *
 *   src/layout.html          – document shell (head, scripts)
 *   src/partials/*.html|svg  – header, footer, icon sprite
 *   src/pages/*.html         – page bodies, each starting with a <!--meta {...} --> JSON block
 *   site.config.json         – business details (phone, email, WhatsApp, form endpoint…)
 *
 * Output: one ready-to-host HTML file per page in the project root, plus sitemap.xml
 * and robots.txt. No runtime dependencies – the output is plain static HTML.
 *
 * Template syntax
 *   {{site.key}}  {{page.key}}   values from config / page meta
 *   {{icon:name}}                inline <svg><use> from the sprite
 *   {{arrow}}                    animated button arrow
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const site = JSON.parse(read('site.config.json'));
site.siteUrl = site.siteUrl.replace(/\/$/, '');
site.whatsappMessageEncoded = encodeURIComponent(site.whatsappMessage || '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const icon = (name) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
const arrow = `<span class="btn__arrow" aria-hidden="true">${icon('arrow-up-right')}${icon('arrow-up-right')}</span>`;

const socialLabels = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' };
const socialLinks = Object.entries(site.social || {}).filter(([, url]) => url);
const socialHtml = socialLinks.length
  ? `<ul class="social" role="list">${socialLinks.map(([k, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${socialLabels[k] || k} (opens in a new tab)">${icon(k)}</a></li>`).join('')}</ul>`
  : '';

function render(tpl, page) {
  return tpl
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => icon(n))
    .replace(/\{\{arrow\}\}/g, arrow)
    .replace(/\{\{social\}\}/g, socialHtml)
    .replace(/\{\{year\}\}/g, String(new Date().getFullYear()))
    .replace(/\{\{site\.(\w+)\}\}/g, (_, k) => esc(site[k] ?? ''))
    .replace(/\{\{page\.(\w+)\}\}/g, (_, k) => (k === 'preload' ? page[k] || '' : esc(page[k] ?? '')));
}

function jsonLd(page) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    description: 'Immigration consultancy offering personalised guidance for study, work, visitor, permanent residency, family and business migration.',
    url: site.siteUrl + '/',
    logo: site.siteUrl + '/assets/logos/logo.png',
    image: site.siteUrl + '/assets/images/hero-traveler.webp',
    areaServed: ['Canada', 'Australia', 'United Kingdom', 'United States', 'New Zealand', 'Germany'],
  };
  // Contact details are only published in structured data once marked as verified.
  if (site.verified) {
    org.telephone = site.phoneHref;
    org.email = site.email;
    org.address = { '@type': 'PostalAddress', ...(site.address || { streetAddress: site.addressLine1 }) };
    if (site.mapsUrl) org.hasMap = site.mapsUrl;
    const sameAs = socialLinks.map(([, u]) => u);
    if (sameAs.length) org.sameAs = sameAs;
  }
  const blocks = [org];
  if (page.breadcrumb) {
    blocks.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.siteUrl + '/' },
        { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: page.url },
      ],
    });
  }
  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n  ');
}

const layout = read('src/layout.html');
const header = read('src/partials/header.html');
const footer = read('src/partials/footer.html');
const icons = read('src/partials/icons.svg');
const clientConfig = JSON.stringify({
  formEndpoint: site.formEndpoint || '',
  email: site.email,
  phoneDisplay: site.phoneDisplay,
  phoneHref: site.phoneHref,
});

const pagesDir = path.join(ROOT, 'src', 'pages');
const built = [];
for (const file of fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'))) {
  const raw = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...} --> block`);
  const page = JSON.parse(m[1]);
  const content = raw.slice(m[0].length);
  page.file = file;
  page.url = file === 'index.html' ? site.siteUrl + '/' : `${site.siteUrl}/${file}`;
  page.robots = page.robots || 'index, follow';
  page.ogImage = page.ogImage || 'hero-traveler.webp';
  page.bodyClass = page.bodyClass || `page-${file.replace('.html', '')}`;

  const markCurrent = (html) => html.replace(new RegExp(`data-nav="${page.nav}"`, 'g'), `data-nav="${page.nav}" aria-current="page"`);

  // function replacers avoid `$&`-style patterns in content being interpreted
  let html = layout
    .replace('{{icons}}', () => icons)
    .replace('{{header}}', () => markCurrent(header))
    .replace('{{footer}}', () => footer)
    .replace('{{content}}', () => content)
    .replace('{{clientConfig}}', () => clientConfig)
    .replace('{{jsonld}}', () => jsonLd(page));
  if (file === '404.html') html = html.replace('<head>', () => `<head>
  <base href="${site.siteUrl}/">`); // nested 404 paths still resolve assets
  html = render(html, page);
  html = `<!-- Generated by scripts/build.js from src/pages/${file} – edit the source, not this file. -->\n` + html;
  fs.writeFileSync(path.join(ROOT, file), html);
  built.push(page);
}

// sitemap.xml + robots.txt
const today = new Date().toISOString().slice(0, 10);
const indexable = built.filter((p) => !p.robots.includes('noindex'));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexable.map((p) => `  <url><loc>${p.url}</loc><lastmod>${today}</lastmod><priority>${p.file === 'index.html' ? '1.0' : p.priority || '0.7'}</priority></url>`).join('\n') +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);

console.log(`Built ${built.length} pages: ${built.map((p) => p.file).join(', ')}`);
if (!site.verified) {
  console.warn('\n⚠  site.config.json still contains placeholder business details (verified: false).');
  console.warn('   Update phone, WhatsApp, email and address before going live.');
}
if (!site.formEndpoint) {
  console.warn('⚠  No formEndpoint configured – the contact form will hand enquiries off to the visitor\'s email app.');
}
