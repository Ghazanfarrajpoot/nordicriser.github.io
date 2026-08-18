# Legal Pages — Professional Translation Queue

Generated 2026-08-19, alongside the Part B legal rebuild (see commit history around this date).

## Why this file exists

The site ships in 11 languages, but legal text is different from marketing copy: a wrong word
in a privacy policy or terms of service is a liability, not a typo. So for this rebuild:

- **English and Swedish** were written directly by a fluent legal/business writer (not machine
  translated) — see `src/_data/locales/en.json` and `src/_data/locales/sv.json`.
- **The other 9 languages below are deliberately NOT translated yet.** Until a professional
  translator does that work, those locales fall back to showing the **English** text, with a
  visible banner at the top of the page saying so (see `common.legalPendingTranslationPrefix` /
  `legalPendingTranslationSuffix` in `en.json`, rendered by the `isFallback` logic in
  `src/pages/legal-*.njk`). This is intentional: a fluent-looking but wrong Arabic privacy policy
  is worse than an honest English one.

## What needs translating

Four documents, into nine languages: German (de), French (fr), Spanish (es), Italian (it),
Polish (pl), Dutch (nl), Portuguese (pt), Urdu (ur, RTL), Arabic (ar, RTL).

| Document | Source key (`en.json`) | Approx. length | Live English fallback URL (example: German) |
|---|---|---|---|
| Privacy Policy | `pages.privacy` | ~1,900 words of prose (15 sections) | `/de/legal/privacy/` |
| Terms of Service | `pages.legalTerms` | ~1,100 words of prose (14 sections) | `/de/legal/terms/` |
| Data Processing Agreement | `pages.legalDpa` | ~950 words of prose (13 clauses) | `/de/legal/dpa/` |
| Sub-processors | `pages.legalSubprocessors` | ~330 words of prose (table + notes) | `/de/legal/subprocessors/` |
| Legal index | `pages.legal` | ~90 words (4 short card descriptions) | `/de/legal/` |

Swap `/de/` for `/fr/`, `/es/`, `/it/`, `/pl/`, `/nl/`, `/pt/`, `/ur/`, `/ar/` to see the same
fallback behavior in each language today.

## Terminology that must stay consistent once translated

These are the same five things called out to the Swedish translator — the same care applies to
every other language:

1. **GDPR terms** — "controller" and "processor" have precise legal meanings distinct from a
   plain-language translation (e.g. Swedish uses *personuppgiftsansvarig* /
   *personuppgiftsbiträde*, not a literal word-for-word rendering). Use each language's
   established GDPR/data-protection-authority terminology, not a fresh translation.
2. **Section 6.4 of the Privacy Policy (AI Processing in NR-BOS)** discloses, by name, that
   NR-BOS sends project data — including full employee names — to DeepSeek, a China-based AI
   provider, with Standard Contractual Clauses as the only transfer safeguard, and that personal
   identifiers are **not** currently redacted before transmission. This must be translated as
   plainly and specifically as the English. Do not soften it.
3. **ToS Section 8.5 (Revocation)** states that revoking an NR-BOS license code prevents future
   redemption but does **not** claw back access already granted by an earlier redemption of that
   code — a real product limitation, not a stylistic hedge. Translate it with the same plainness.
4. **"Nordic Riser AB"**, **"NR-BOS"**, **"Global Reach"**, **"Member Portal"**, **"GDPR"**, and
   named sub-processors (Google Ireland Limited, DeepSeek / Hangzhou DeepSeek Artificial
   Intelligence Co., Ltd., PostgreSQL) are proper nouns — do not translate them.
5. **"Stockholm District Court"** should use each language's standard rendering of *Stockholms
   tingsrätt* as a proper noun (transliterate/gloss, don't translate the institution's actual
   Swedish name).

## Known content gaps to resolve before any language is finalized — including English

Three rows in the Sub-processors table (`pages.legalSubprocessors.table`) are marked "pending
internal confirmation": NR-BOS's production database host, its object-storage vendor/region, and
Global Reach's translation API vendor. These need to be confirmed and filled in across **all**
languages (English and Swedish included) before this page is considered complete — a translator
should not be asked to translate a table that's still being finished. See the conversation/commit
history for the open questions.

## Suggested process once a translator is engaged

1. Export `pages.privacy`, `pages.legalTerms`, `pages.legalDpa`, `pages.legalSubprocessors`, and
   `pages.legal` from `en.json` (source of truth) for the target language.
2. Translate, preserving the JSON structure and every key name — only string values change.
3. Add the translated block to that locale's file in `src/_data/locales/`.
4. Also add that locale's own `translationNotice` string (see `sv.json` for the pattern: state
   plainly that this is a professional/reviewed translation and that the English version governs
   in case of a discrepancy — not the generic machine-translation notice used elsewhere on the
   site for non-legal pages).
5. Rebuild (`npm run build`) and confirm the fallback banner disappears for that language on all
   five URLs above, and that RTL layout (Urdu, Arabic) still renders correctly now that real
   translated text — not English-in-an-LTR-wrapper — is in place.
