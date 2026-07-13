# nordicriser.github.io

Nordic Riser AB marketing site — static, multilingual, built with [Eleventy](https://www.11ty.dev/).

## Structure

- `src/` — source templates, partials, styles, scripts, and i18n data. Edit here.
- `docs/` — **build output**, committed to git. This is the GitHub Pages publish source.
- `_site/` — local dev server output (gitignored).

Three service pillars (Consulting, IT Services, Global Reach) each get their own landing page,
generated in 11 languages. English is unprefixed (`/consulting/`); every other locale is prefixed
(`/de/consulting/`, `/ur/consulting/`, etc.) — see `src/_data/site.json` for the locale list and
`.eleventy.js` for the `localePath`/`localeUrl` filters that implement this.

## Commands

```
npm install       # first time only
npm run dev       # local dev server with live reload (localhost:8080), outputs to _site/
npm run build     # production build, outputs to docs/
```

After `npm run build`, review the diff in `docs/` and commit it like any other change — there is
no CI build step yet.

## Adding a language

1. Add the locale to `src/_data/site.json`'s `locales` array (`code`, native `name`, `dir`).
2. Copy `src/_data/locales/en.json` to `src/_data/locales/<code>.json` and translate every string,
   keeping the exact same key structure. Set `meta.status` to `MACHINE_TRANSLATED_NEEDS_REVIEW`
   until a human reviews it.
3. `npm run build` — every page template automatically fans out to the new locale.

## One-time manual step (owner only)

This site used to be served from the repository root. The build now outputs to `docs/`, so on
GitHub: **Settings → Pages → Source → branch `main`, folder `/docs`**. `docs/CNAME` already
contains `nordicriser.com`, so the custom domain carries over automatically once the source is
switched.

## Notes

- `services.html` and `who-we-help.html` no longer exist as content pages — their content was
  merged into `/consulting/`. The old URLs now redirect there (with anchors preserved) via
  `src/redirects/`.
- `portal.html` is a single, non-localized, `noindex` splash page — it is not part of the pillar
  restructuring and always renders in English.
