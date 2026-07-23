(function () {
  "use strict";

  var CONFIG = {
    baseUrl: "https://Aibotflix.github.io/tools",
    siteName: "Boring Tools"
  };

  var CATEGORIES = [
    { slug: "text-writing", title: "Text & Writing", description: "Count words, convert case, compare text diffs and generate placeholder text." },
    { slug: "code-formatters", title: "Code Formatters", description: "Format, preview and validate JSON, Markdown, Regex and Protobuf data." },
    { slug: "encoders", title: "Encoders & Converters", description: "Encode and decode Base64, URL, binary, hex and cipher formats." },
    { slug: "data-converters", title: "Data Converters", description: "Convert between CSV, JSON, units and timestamps." },
    { slug: "design-tools", title: "Design Tools", description: "Convert colors and check contrast ratios for accessible design." },
    { slug: "generators", title: "Generators", description: "Generate UUIDs, QR codes, cron expressions and .gitignore files." },
    { slug: "security-tools", title: "Security & Tokens", description: "Generate passwords, hashes, HMAC signatures and decode JWT tokens." },
    { slug: "ai-prompting", title: "AI & Prompting", description: "Count tokens, estimate prompt costs and prepare code context for AI tools." },
    { slug: "developer-tools", title: "Developer Tools", description: "Compare .env files, debug URLs, convert API requests and more." }
  ];

  var TOOLS = [
    { slug: "password-generator", title: "Password Generator", category: "security-tools", description: "Generate strong, random passwords with a secure crypto RNG.", keywords: ["password","generator","random","secure","crypto"], related: ["uuid-generator","hash-generator"], priority: 0.8, featured: false },
    { slug: "word-counter", title: "Word Counter", category: "text-writing", description: "Count characters, words, sentences and reading time as you type.", keywords: ["word","counter","character","reading","time","text"], related: ["case-converter","lorem-ipsum"], priority: 0.8, featured: false },
    { slug: "case-converter", title: "Case Converter", category: "text-writing", description: "Convert text to UPPER, lower, Title, camelCase, snake_case and more.", keywords: ["case","converter","uppercase","lowercase","camelcase","snakecase"], related: ["word-counter","rot13"], priority: 0.8, featured: false },
    { slug: "uuid-generator", title: "UUID Generator", category: "generators", description: "Generate random RFC 4122 v4 UUIDs in your browser.", keywords: ["uuid","generator","random","rfc4122","identifier"], related: ["password-generator","hash-generator"], priority: 0.8, featured: true },
    { slug: "base64", title: "Base64 Encode / Decode", category: "encoders", description: "Convert text to and from Base64, with full UTF-8 support.", keywords: ["base64","encode","decode","utf8","encoding"], related: ["url-encoder","hash-generator"], priority: 0.8, featured: true },
    { slug: "json-formatter", title: "JSON Formatter", category: "code-formatters", description: "Beautify, minify and validate JSON with clear error messages.", keywords: ["json","formatter","beautify","minify","validate"], related: ["csv-json","markdown-preview"], priority: 0.8, featured: true },
    { slug: "unit-converter", title: "Unit Converter", category: "data-converters", description: "Convert length, weight and temperature between common units.", keywords: ["unit","converter","length","weight","temperature","metric","imperial"], related: ["timestamp-converter","binary-converter"], priority: 0.8, featured: false },
    { slug: "lorem-ipsum", title: "Lorem Ipsum Generator", category: "text-writing", description: "Generate placeholder paragraphs of dummy text for your layouts.", keywords: ["lorem","ipsum","placeholder","dummy","text","generator"], related: ["word-counter","markdown-preview"], priority: 0.8, featured: false },
    { slug: "timestamp-converter", title: "Timestamp Converter", category: "data-converters", description: "Convert Unix timestamps to dates and back. Auto-detect seconds vs milliseconds.", keywords: ["timestamp","unix","converter","epoch","date","time","javascript"], related: ["binary-converter","unit-converter"], priority: 0.9, featured: true },
    { slug: "url-encoder", title: "URL Encoder & Decoder", category: "encoders", description: "Encode and decode URLs with full UTF-8 support for international characters.", keywords: ["url","encoder","decoder","percent","encoding","utf8","query","string"], related: ["base64","hash-generator"], priority: 0.9, featured: false },
    { slug: "binary-converter", title: "Binary Decimal Hex Converter", category: "encoders", description: "Convert between binary, decimal, hexadecimal and octal instantly.", keywords: ["binary","decimal","hex","hexadecimal","octal","converter","number","base"], related: ["timestamp-converter","hash-generator"], priority: 0.9, featured: false },
    { slug: "jwt-decoder", title: "JWT Decoder", category: "security-tools", description: "Decode JWT tokens instantly — see header, payload and expiration.", keywords: ["jwt","decoder","json","web","token","auth","bearer"], related: ["hash-generator","base64"], priority: 0.9, featured: false },
    { slug: "hash-generator", title: "Hash Generator", category: "security-tools", description: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from any text.", keywords: ["hash","generator","md5","sha256","sha512","sha1","checksum","digest"], related: ["password-generator","jwt-decoder"], priority: 0.9, featured: true },
    { slug: "rot13", title: "Rot13 & Caesar Cipher", category: "encoders", description: "Encode and decode Rot13, Caesar cipher with custom shift, and Atbash cipher.", keywords: ["rot13","caesar","cipher","decode","encode","atbash","substitution"], related: ["case-converter","url-encoder"], priority: 0.8, featured: false },
    { slug: "markdown-preview", title: "Markdown Preview Editor", category: "code-formatters", description: "Write Markdown and see a live rendered preview. Split-pane editor, no signup.", keywords: ["markdown","preview","editor","live","render","syntax","readme"], related: ["json-formatter","regex-tester"], priority: 0.9, featured: true },
    { slug: "regex-tester", title: "Regex Tester & Debugger", category: "code-formatters", description: "Test regular expressions with live match highlighting and group capture details.", keywords: ["regex","regular","expression","tester","debugger","pattern","match"], related: ["markdown-preview","json-formatter"], priority: 0.9, featured: true },
    { slug: "csv-json", title: "CSV to JSON Converter", category: "data-converters", description: "Convert between CSV and JSON formats instantly. Handles quoted fields.", keywords: ["csv","json","converter","comma","separated","values","data","import"], related: ["json-formatter","url-encoder"], priority: 0.9, featured: false },
    { slug: "qr-code", title: "QR Code Generator", category: "generators", description: "Generate QR codes for any URL or text. Choose size, colors, error correction. Download PNG or SVG.", keywords: ["qr","code","generator","scan","barcode","url","png","svg","download"], related: ["base64","url-encoder"], priority: 0.9, featured: false },
    { slug: "cron-expression-generator", title: "Cron Expression Generator", category: "generators", description: "Build cron expressions from dropdowns. See the next 5 run times before you commit.", keywords: ["cron","expression","generator","schedule","linux","timer","job"], related: ["timestamp-converter","hash-generator"], priority: 0.9, featured: false },
    { slug: "hmac-generator", title: "HMAC Generator", category: "security-tools", description: "Generate HMAC-SHA256 and HMAC-SHA512 signatures from a message and secret key.", keywords: ["hmac","sha256","sha512","signature","authentication","api","webhook","security"], related: ["hash-generator","jwt-decoder"], priority: 0.9, featured: false },
{ slug: "protobuf-decoder", title: "Protobuf Decoder", category: "code-formatters", description: "Decode protobuf binary data into a readable tree. Paste hex or base64 — auto-detects format.", keywords: ["protobuf","decoder","protocol","buffers","grpc","binary","wire","format"], related: ["jwt-decoder","base64"], priority: 0.9, featured: false },
    { slug: "token-counter",   title: "Token Counter",    category: "ai-prompting",     description: "Estimate how many tokens your text will use for different AI models.", keywords: ["token","counter","ai","gpt","claude","gemini","prompt","context","window"], related: ["word-counter"], priority: 0.9, featured: false },
    { slug: "gitignore-generator", title: ".gitignore Generator", category: "generators", description: "Pick languages and frameworks to combine .gitignore templates from github/gitignore into one file.", keywords: ["gitignore","git","ignore","template","repo","project"], related: ["base64"], priority: 0.9, featured: false },
    { slug: "codebase-context-packer", title: "Codebase Context Packer", category: "ai-prompting", description: "Turn a folder into a Markdown blob with all file contents for pasting into an AI prompt.", keywords: ["codebase","context","prompt","llm","chatgpt","claude","folder","pack","markdown","ai"], related: ["token-counter"], priority: 0.9, featured: false },
    { slug: "text-diff", title: "Text Diff Checker", category: "text-writing", description: "Compare two texts side by side. See added, removed and unchanged lines highlighted.", keywords: ["diff","text","compare","difference","side","by","side","changes","lines"], related: ["markdown-preview","json-formatter"], priority: 0.9, featured: false },
    { slug: "color-converter", title: "Color Converter", category: "design-tools", description: "Convert colors between HEX, RGB and HSL with a live preview swatch.", keywords: ["color","converter","hex","rgb","hsl","css","design","preview"], related: ["color-contrast","json-formatter"], priority: 0.9, featured: false },
    { slug: "json-to-csv", title: "JSON to CSV Converter", category: "data-converters", description: "Convert JSON arrays into CSV spreadsheets. Handles nested objects and arrays.", keywords: ["json","csv","converter","array","export","flatten","nested","data"], related: ["csv-json","json-formatter"], priority: 0.9, featured: false },
    { slug: "color-contrast", title: "Color Contrast Checker", category: "design-tools", description: "See if two colors have enough contrast for readable text. Shows WCAG AA and AAA pass/fail.", keywords: ["color","contrast","checker","wcag","accessibility","a11y","ratio","aa","aaa","design"], related: ["color-converter"], priority: 0.9, featured: false },
    { slug: "css-minifier", title: "CSS Minifier", category: "code-formatters", description: "Shrink your CSS by stripping whitespace, comments and extra characters. Just paste and copy.", keywords: ["css","minifier","compress","minify","optimize","performance","stylesheet","code"], related: ["json-formatter","markdown-preview"], priority: 0.9, featured: false },
    { slug: "env-diff", title: "Environment Variable Diff", category: "developer-tools", description: "Compare .env files side by side. Find missing keys, changed values, duplicates, and unused variables.", keywords: ["env","environment","variable","diff","compare","dotenv","configuration","secret"], related: ["json-formatter","text-diff"], priority: 0.9, featured: true },
    { slug: "url-debugger", title: "URL Debugger", category: "developer-tools", description: "Paste a URL and see it broken down. Decoded, parsed, duplicates flagged, encoding checked.", keywords: ["url","debugger","parse","decode","parameters","query","encoding","percent"], related: ["url-encoder","env-diff"], priority: 0.9, featured: true },
    { slug: "request-converter", title: "Fetch → Axios → cURL Converter", category: "developer-tools", description: "Pick a method, add a URL, set some headers. Get the same request in Fetch, Axios, and cURL.", keywords: ["request","fetch","axios","curl","http","api","converter","code","generator"], related: ["json-formatter","env-diff"], priority: 0.9, featured: true },
    { slug: "flex-grid-playground", title: "CSS Flex/Grid Playground", category: "developer-tools", description: "Tweak Flexbox and Grid properties, see what changes. A playground for CSS layouts.", keywords: ["css","flexbox","grid","playground","layout","interactive","preview"], related: ["css-minifier","color-converter"], priority: 0.9, featured: true },
    { slug: "js-object-explorer", title: "JavaScript Object Explorer", category: "developer-tools", description: "Paste a JS object and browse it like a file tree. Collapse, expand, see types and values.", keywords: ["json","object","explorer","tree","inspect","browse","nested"], related: ["json-formatter","protobuf-decoder"], priority: 0.9, featured: true }
  ];

  var FEATURED_TOOLS = [];
  for (var i = 0; i < TOOLS.length; i++) {
    if (TOOLS[i].featured) FEATURED_TOOLS.push(TOOLS[i]);
  }

  function slugToTitle(slug) {
    return slug.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function escapeHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function toolUrl(slug) { return CONFIG.baseUrl + "/" + slug + "/"; }
  function catUrl(slug) { return CONFIG.baseUrl + "/categories/?cat=" + slug; }

  // --- Header ---
  function injectHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var p = location.pathname;
    function active(path) { return p.indexOf(path) !== -1 ? ' aria-current="page"' : ""; }
    el.outerHTML =
      '<header class="site"><div class="container">' +
        '<a class="brand" href="' + CONFIG.baseUrl + '/">' + CONFIG.siteName + '</a>' +
        '<button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>' +
        '<nav class="site" id="main-nav">' +
          '<a href="' + CONFIG.baseUrl + '/categories/"' + active("/categories/") + '>Tools</a>' +
          '<a href="' + CONFIG.baseUrl + '/about.html"' + active("about") + '>About</a>' +
          '<a href="' + CONFIG.baseUrl + '/contact.html"' + active("contact") + '>Contact</a>' +
          '<a href="' + CONFIG.baseUrl + '/privacy.html"' + active("privacy") + '>Privacy</a>' +
        '</nav>' +
      '</div></header>';
  }

  // --- Footer ---
  function injectFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.outerHTML =
      '<footer class="site"><div class="container">' +
        '<nav>' +
          '<a href="' + CONFIG.baseUrl + '/about.html">About</a>' +
          '<a href="' + CONFIG.baseUrl + '/contact.html">Contact</a>' +
          '<a href="' + CONFIG.baseUrl + '/privacy.html">Privacy</a>' +
          '<a href="' + CONFIG.baseUrl + '/terms.html">Terms</a>' +
        '</nav>' +
        '<span>&copy; 2026 ' + CONFIG.siteName + '</span>' +
      '</div></footer>';
  }

  // --- Breadcrumbs ---
  function injectBreadcrumbs() {
    var el = document.getElementById("breadcrumbs");
    if (!el) return;
    var path = location.pathname.replace(/\/$/, "").replace(/\/index\.html$/, "");
    var base = CONFIG.baseUrl.replace(/^https?:\/\/[^\/]+/, "").replace(/\/$/, "");
    var rel = path.replace(base, "").replace(/^\//, "").split("/");
    if (!rel.length || !rel[0]) return;
    var html = '<nav class="crumb" aria-label="Breadcrumb"><a href="' + CONFIG.baseUrl + '/">Home</a>';
    var cumPath = CONFIG.baseUrl;
    for (var i = 0; i < rel.length; i++) {
      cumPath += "/" + rel[i];
      var name = rel[i].endsWith(".html") ? slugToTitle(rel[i].replace(".html", "")) : slugToTitle(rel[i]);
      var safeName = escapeHtml(name);
      if (i === rel.length - 1) {
        html += ' / <span aria-current="page">' + safeName + '</span>';
      } else {
        html += ' / <a href="' + cumPath + '">' + safeName + '</a>';
      }
    }
    html += "</nav>";
    el.innerHTML = html;
  }

  // --- Related Tools ---
  function injectRelatedTools(currentSlug) {
    var el = document.getElementById("related-tools");
    if (!el) return;
    var current = null;
    for (var i = 0; i < TOOLS.length; i++) {
      if (TOOLS[i].slug === currentSlug) { current = TOOLS[i]; break; }
    }
    if (!current || !current.related || !current.related.length) return;
    var html = '<h2>Related tools</h2><ul class="cards">';
    for (var j = 0; j < current.related.length; j++) {
      for (var k = 0; k < TOOLS.length; k++) {
        if (TOOLS[k].slug === current.related[j]) {
          var t = TOOLS[k];
          html += '<li><a class="card" href="' + toolUrl(t.slug) + '"><span class="t">' + t.title + '</span><br><span class="d">' + t.description + '</span></a></li>';
          break;
        }
      }
    }
    html += "</ul>";
    el.innerHTML = html;
  }

  // --- Tool Grid ---
  function renderToolGrid(containerId, tools) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var html = "";
    for (var i = 0; i < tools.length; i++) {
      var t = tools[i];
      html += '<li><a class="card" href="' + toolUrl(t.slug) + '" data-keywords="' + (t.keywords || []).join(" ") + '"><span class="t">' + t.title + '</span><br><span class="d">' + t.description + '</span></a></li>';
    }
    el.innerHTML = html;
  }

  // --- Search ---
  function initSearch() {
    var input = document.getElementById("search-input");
    var grid = document.getElementById("tool-grid");
    if (!input || !grid) return;
    input.addEventListener("input", function () {
      var q = this.value.toLowerCase().trim();
      var cards = grid.querySelectorAll(".card");
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var text = card.textContent.toLowerCase();
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        card.closest("li").style.display = (text.indexOf(q) !== -1 || keywords.indexOf(q) !== -1) ? "" : "none";
      }
    });
  }

  // --- Mobile Menu ---
  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
    });
  }

  // --- Init ---
  injectHeader();
  injectFooter();
  injectBreadcrumbs();
  initMenu();
  initSearch();

  // --- Public API for tool pages ---
  window.BoringTools = {
    config: CONFIG,
    tools: TOOLS,
    featuredTools: FEATURED_TOOLS,
    categories: CATEGORIES,
    toolUrl: toolUrl,
    catUrl: catUrl,
    slugToTitle: slugToTitle,
    injectRelatedTools: injectRelatedTools,
    renderToolGrid: renderToolGrid
  };
})();
