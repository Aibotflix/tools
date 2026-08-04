# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and technical people: engineers, IT, and tech-adjacent users who need a specific utility now — regex testing, JWT decoding, cron generation, token counting, .env diffing — without an account, install, or ads. Secondary audience: general users arriving for the simple utilities (password generator, unit converter, lorem ipsum), served by the same pages.

## Product Purpose

A directory of 35 (and growing) free, client-side online tools. Every tool runs entirely in the browser: no signup, no ads, no tracking, no upload. Success is organic traffic: visitors land from search, use a tool, and leave satisfied — and search engines keep sending more of them.

## Positioning

The "boring" choice that just works. Most free tool sites bury the tool under ads, popups, and trackers; Boring Tools is fast, clean, and privacy-respecting by construction — nothing leaves the device, so there is nothing to exploit. The name is the brand: boring as a promise, not an insult.

## Operating Context

- Hosted on GitHub Pages at `https://Aibotflix.github.io/tools/` (no build step, static files served as-is).
- Users land directly on tool pages from search (deep links with canonical URLs, breadcrumbs, JSON-LD) and from the homepage/category pages.
- Everything runs client-side; page weight and load time are first-class concerns on slow/limited connections.
- Search engines are a primary visitor channel: per-tool SEO metadata, sitemap, llms.txt, and FAQ markup already exist.

## Capabilities and Constraints

- 35 tools, each a folder with `index.html` (+ `script.js`), sharing `style.css` and a header/footer injected from `js/app.js`.
- Single source of truth for tool data: `TOOLS` array in `js/app.js`.
- Vanilla HTML/CSS/JS only. No frameworks, no build step, no dependencies, no CDN assets. This is binding.
- Pages must stay lightweight and accessible; keyboard-usable controls and WCAG-conscious contrast are existing commitments.
- Must remain GitHub Pages compatible (static, relative paths, `.nojekyll`).

## Brand Commitments

- Name: "Boring Tools". The boring identity is deliberate: plain, fast, no-nonsense, anti-hype. Gray-blue neutral palette, system fonts, no marketing gloss. Do not decorate it.
- Tagline: "the boring choice that just works."
- No ads, no tracking, no signup — these are product truths, not marketing claims.

## Evidence on Hand

- 35 working tools in-repo with per-tool pages (paths: `password-generator/`, `regex-tester/`, `jwt-decoder/`, etc.).
- README.md documents the full catalog and the privacy positioning.
- SEO assets already shipped: sitemap.xml, robots.txt, llms.txt, llms-full.txt, JSON-LD (WebSite, Organization, ItemList, FAQPage, BreadcrumbList, WebApplication) on pages, social-card.svg.
- No testimonials, no press, no user data. Future work must not fabricate these.

## Product Principles

- The tool is the product: remove everything between the visitor and the result.
- Boring wins: restraint, predictability, and speed are features; decoration is a defect.
- Trust by construction: client-side execution and no tracking are non-negotiable.
- Search-friendliness is a feature: every tool deserves clean, unique, indexable metadata.
- Consistency across 35+ pages matters more than cleverness on any one page.

## Accessibility & Inclusion

- No product-specific accessibility standard beyond web defaults; existing work uses semantic markup, keyboard-reachable controls, visible focus, and contrast-safe tokens. Future work must not regress these.
