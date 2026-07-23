(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var editor = $("editor"), preview = $("preview"), status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  var defaultMd = "# Hello World\n\nThis is a **live Markdown preview**. Start typing on the left.\n\n## Features\n\n- Headings, bold, italic\n- Lists and task lists\n- Code blocks\n- Tables\n- Links and images\n\n> Blockquotes look like this.\n\n```js\nconsole.log('Hello from Markdown!');\n```\n\n| Feature | Status |\n|---------|--------|\n| Headings | Supported |\n| Tables | Supported |\n| Code | Supported |\n";

  function escape(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function render() {
    var text = editor.value;
    if (!text) { preview.innerHTML = '<p style="color:var(--muted)">Start typing Markdown on the left…</p>'; return; }
    var s = escape(text);
    // code blocks
    s = s.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>');
    // blockquotes
    s = s.replace(/^&gt; (.+)$/gm, "<blockquote><p>$1</p></blockquote>");
    // tables
    s = s.replace(/\n?\|(.+)\|(.+)\|(\n\|[-:| ]+\|)?/g, function(m, h, r) {
      var o = "<table><thead><tr>";
      h.split("|").forEach(function(c){ o += "<th>"+c.trim()+"</th>"; });
      o += "</tr></thead><tbody>";
      r.split("\n").forEach(function(row){
        if (row.indexOf("---") > -1) return;
        o += "<tr>";
        row.split("|").forEach(function(c){ o += "<td>"+c.trim()+"</td>"; });
        o += "</tr>";
      });
      return o + "</tbody></table>";
    });
    // headings
    s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    s = s.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    s = s.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    // lists
    s = s.replace(/^- (.+)$/gm, "<li>$1</li>");
    // inline
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\n/g, "<br>");
    preview.innerHTML = s;
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
