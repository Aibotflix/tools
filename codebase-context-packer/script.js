(function () {
  "use strict";

  var SKIP_DIRS = new Set(["node_modules",".git","dist","build",".next","__pycache__",".venv","venv",".vscode",".idea",".cache"]);

  var SKIP_PATTERNS = [
    /package-lock\.json$/, /yarn\.lock$/, /pnpm-lock\.yaml$/,
    /\.min\.(js|css)$/, /\.map$/,
    /\.(png|jpg|jpeg|gif|ico|svg|webp|pdf|zip|tar|gz|woff2?|ttf|eot|exe|dll|so|dylib|pyc|class|jar|wasm)$/i
  ];

  var TEXT_EXTS = new Set([
    "js","ts","jsx","tsx","mjs","cjs","json","yaml","yml","toml","md","txt","html","css","scss","sass","less","py","rb","go","rs","java","kt","swift","c","cpp","h","hpp","cs","php","sh","bash","zsh","fish","lua","r","m","sql","graphql","proto","env","ini","cfg","conf","xml","csv"
  ]);

  function $(id) { return document.getElementById(id); }

  function setStatus(msg, isErr) {
    var s = $("status");
    s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
    s.textContent = msg || "";
  }

  function shouldSkip(name, isDir) {
    if (isDir) return SKIP_DIRS.has(name);
    return SKIP_PATTERNS.some(function (p) { return p.test(name); });
  }

  function countTokens(str) {
    var cjk = (str.match(/[\u3000-\u9FFF\uF900-\uFAFF\u3400-\u4DBF]/g) || []).length;
    var words = (str.match(/[a-zA-Z0-9_]+/g) || []).length;
    var codeSymbols = (str.match(/[{}()\[\];,=><!+\-*/|&~^%]+/g) || []).length;
    return Math.ceil((str.length / 4) + cjk * 0.5 + words * 0.3 + codeSymbols * 0.3);
  }

  function buildTree(files) {
    var root = {};
    files.forEach(function (f) {
      var parts = f.rel.split("/");
      var cur = root;
      parts.forEach(function (p, i) {
        if (!cur[p]) cur[p] = {};
        cur = cur[p];
      });
    });

    function render(node, prefix, isLast) {
      var out = "";
      var keys = Object.keys(node).sort();
      keys.forEach(function (k, i) {
        var last = i === keys.length - 1;
        var connector = last ? "+--" : "|--";
        out += prefix + connector + k + "\n";
        if (Object.keys(node[k]).length) {
          out += render(node[k], prefix + (last ? "    " : "|   "), last);
        }
      });
      return out;
    }
    return render(root, "", true);
  }

  $("folder").addEventListener("change", function () {
    $("pack").disabled = !this.files.length;
    if (this.files.length) {
      var names = Array.from(this.files).map(function (f) { return f.webkitRelativePath || f.name; });
      var tree = buildTree(Array.from(this.files).map(function (f) { return { path: f.webkitRelativePath || f.name }; }));
      $("tree").textContent = tree || "(empty folder)";
    }
  });

  $("pack").addEventListener("click", function () {
    var files = Array.from($("folder").files);
    var skipBin = $("skipBin").checked;
    var skipDirs = $("skipDirs").checked;
    var skipMeta = $("skipMeta").checked;
    setStatus("Reading " + files.length + " files…");
    $("stats").textContent = "";

    var output = "";
    var skipped = 0;
    var totalTokens = 0;
    var fileEntries = [];

    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var path = f.webkitRelativePath || f.name;
      var parts = path.split("/");

      var fname = parts[parts.length - 1];
      var skip = false;
      if (skipDirs && parts.some(function (p, idx) { return idx < parts.length - 1 && SKIP_DIRS.has(p); })) skip = true;
      if (skipMeta && SKIP_PATTERNS.some(function (p) { return p.test(fname); })) skip = true;
      fname.split(".").slice(1).forEach(function (ext) {
        if (skipBin && TEXT_EXTS.size && !TEXT_EXTS.has(ext)) skip = true;
      });

      if (skip) { skipped++; continue; }

      var reader = new FileReader();
      var done = false;
      reader.onload = (function (p, file) {
        return function (e) {
          var text = e.target.result;
          if (typeof text !== "string") { skipped++; return; }
          var lines = text.split("\n").length;
          var tokens = countTokens(text);
          totalTokens += tokens;
          fileEntries.push({ path: p, text: text, tokens: tokens, lines: lines, ext: p.split(".").pop() });
          setStatus("Processed " + fileEntries.length + " of ~" + (files.length - skipped) + " files…");
          if (fileEntries.length === files.length - skipped) {
            finish();
          }
        };
      })(path, f);

      reader.readAsText(f);
    }

    if (files.length === skipped) { setStatus("No matching files found. Adjust filters.", true); return; }

    function finish() {
      fileEntries.sort(function (a, b) { return a.path.localeCompare(b.path); });

      var treeLines = buildTree(fileEntries.map(function (f) { return { path: f.path }; }));

      output += "# Codebase Context\n";
      output += "> " + fileEntries.length + " files, ~" + Math.round(totalTokens / 1000) + "K estimated tokens\n\n";
      output += "## File Tree\n```\n" + treeLines + "```\n\n";
      output += "## Files\n\n";

      fileEntries.forEach(function (f) {
        output += "### `" + f.path + "` — " + f.lines + " lines, ~" + Math.ceil(f.tokens / 10) * 10 + " tokens\n";
        output += "```" + f.ext + "\n" + f.text + "\n```\n\n";
      });

      $("output").textContent = output;
      $("copy").disabled = false;
      $("dl").style.display = "";
      $("dl").href = URL.createObjectURL(new Blob([output], { type: "text/markdown" }));
      $("stats").textContent = fileEntries.length + " files | ~" + Math.round(totalTokens / 1000) + "K tokens | " + skipped + " skipped";
      setStatus("Done.");
    }
  });

  $("copy").addEventListener("click", function () {
    if (!$("copy").disabled) {
      navigator.clipboard.writeText($("output").textContent).then(function () {
        setStatus("Copied!");
      }).catch(function () {
        setStatus("Copy failed.", true);
      });
    }
  });
}());
