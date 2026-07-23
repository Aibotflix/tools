(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var editor = $("editor"), preview = $("preview"), status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  var defaultMd = "# Hello World\n\nThis is a **live Markdown preview**. Start typing on the left.\n\n## Features\n\n- Headings, bold, italic\n- Lists and task lists\n- Code blocks\n- Tables\n- Links and images\n\n> Blockquotes look like this.\n\n```js\nconsole.log('Hello from Markdown!');\n```\n\n| Feature | Status |\n|---------|--------|\n| Headings | Supported |\n| Tables | Supported |\n| Code | Supported |\n";

  function render() {
    var text = editor.value;
    if (!text) { preview.innerHTML = '<p style="color:var(--muted)">Start typing Markdown on the left…</p>'; return; }
    if (typeof marked !== "undefined") {
      preview.innerHTML = marked.parse(text, { html: false });
    } else {
      var safe = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      var html = safe
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/\n/g, "<br>");
      preview.innerHTML = html;
    }
  }

  // Load from localStorage if available
  var saved = localStorage.getItem("md_editor_content");
  editor.value = saved || defaultMd;

  editor.addEventListener("input", function () {
    render();
    try { localStorage.setItem("md_editor_content", editor.value); } catch (e) {}
  });

  $("copyHtml").addEventListener("click", function () {
    var html = preview.innerHTML;
    if (!html) { setStatus("Nothing to copy.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(html).then(function () { setStatus("HTML copied to clipboard!"); });
    }
  });

  $("download").addEventListener("click", function () {
    var text = editor.value;
    if (!text) { setStatus("Nothing to download.", true); return; }
    var blob = new Blob([text], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("Downloaded document.md");
  });

  $("clear").addEventListener("click", function () {
    editor.value = "";
    localStorage.removeItem("md_editor_content");
    render();
  });

  render();
})();
