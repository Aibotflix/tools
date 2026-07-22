# Boring Tools

A free, no-nonsense collection of online tools that run entirely in your browser. Static HTML/CSS/JS — no build step, no framework, no tracking. Hosted free on GitHub Pages and staged to be monetized later.

```
boring/
├── index.html               # homepage — tool directory + SEO/FAQ landing
├── style.css                # shared styles (light + dark, responsive)
├── about.html               # trust page (AdSense requires one)
├── privacy.html             # privacy policy (AdSense requires one)
├── 404.html                 # self-styled — paths don't matter on 404s
├── robots.txt               # allow all + sitemap
├── sitemap.xml              # static list — add a line per tool
├── .nojekyll                # serve files as-is, skip Jekyll
├── password-generator/      # secure crypto RNG password generator
├── word-counter/            # live word/char/reading counts
├── case-converter/         # UPPER / lower / Title / camelCase / snake_case …
├── uuid-generator/         # RFC 4122 v4 UUIDs, crypto RNG
├── base64/                 # UTF-8-safe Base64 encode/decode
├── json-formatter/         # pretty-print / minify / validate
├── unit-converter/         # length, weight, temperature
└── lorem-ipsum/            # placeholder paragraphs
  # each tool folder contains a single index.html with inline JS — no deps, no build step
```

## Quick start (deploy to GitHub Pages)

1. Create a **public** repository on GitHub (e.g. `boring-tools`).
2. Push this folder:
   ```sh
   git init
   git add .
   git commit -m "Initial boring tools site"
   git branch -M main
   git remote add origin https://github.com/Aibotflix/tools.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source = "Deploy from a branch"**, branch = `main`, folder = `/ (root)`, **Save**.
4. After ~1 minute it's live at `https://Aibotflix.github.io/tools/`.

No GitHub Actions workflow needed — there's no build step. If you add one later, switch Pages source to "GitHub Actions" and add a workflow.

## Configure (one-time)

The site files are already configured for `Aibotflix/tools` (canonical/OG URLs, `robots.txt`, `sitemap.xml`, and the GitHub links in About/Privacy). If you fork this repo to your own username/repo, swap them out with PowerShell — `-creplace` is case-sensitive, so it won't mangle the word "repository":

```powershell
$u='your-username'; $r='your-repo'
Get-ChildItem -Recurse -Include *.html,*.xml,*.txt | ForEach-Object {
  (Get-Content $_.FullName) -creplace 'USERNAME',$u -creplace 'REPO',$r |
    Set-Content -Encoding utf8 $_.FullName
}
```

Then global-find/replace the brand name **Boring Tools** if you want a different name.

## Add a new tool

1. Copy `password-generator/` to a new folder, e.g. `word-counter/`.
2. In its `index.html`: update `<title>`, meta description, `canonical`/`og:url`, the `<h1>`, and the tool UI + `<script>` (it links `../style.css`).
3. Add a card to `index.html` inside `<ul class="cards">` linking to the new folder.
4. Add the URL to `sitemap.xml`.
5. Commit and push — it's live.

Each tool lives in its own folder with inline JavaScript, so there's nothing to wire up: drop in a page, link it, list it.

## Monetize later (the realistic path)

The site is staged for ads **without** turning them on yet:

- **Ad slots** are marked `<!-- TODO: ad slot ... -->` in the templates. Don't add AdSense until approved.
- **Trust pages** AdSense requires are already here: About, Privacy, clear nav.

To turn on Google AdSense once you have real traffic and original content:
1. Apply at adsense.google.com and get the site approved.
2. Add the AdSense `<script>` to each page's `<head>` and drop `<ins class="adsbygoogle">` units into the TODO slots.
3. Flesh out `privacy.html`'s "If we add advertising" section with the specifics once live; it already warns users ads may introduce cookies.

Honest reality check:
- Revenue = traffic × RPM. "Thousands a month" sites have many useful tools, good keyword coverage, and years of domain authority. Plan for 6–12+ months of SEO before meaningful income.
- Lower-competition niches (specific calculators, converters, dev tools) beat saturated ones. Pick tools people search for that aren't already dominated.
- AdSense alternatives: affiliate links, a Ko-fi/"Buy Me a Coffee" button, or paid premium features. No one option needs to be decided now.

## Why vanilla (no framework)

A boring tool site should run for years with zero maintenance. Frameworks go out of date; vanilla HTML/CSS/JS doesn't. No build step means deploys are just `git push`, and the site loads fast — which is what Google and users reward.
