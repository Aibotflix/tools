(function () {
  "use strict";
  var input = document.getElementById("input");
  var tree = document.getElementById("tree");

  function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function typeLabel(v) {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array[" + v.length + "]";
    return typeof v;
  }

  function render(key, val, depth) {
    var indent = "  ".repeat(depth);
    var t = typeLabel(val);
    var cls = t === "object" || t.indexOf("array") === 0 ? " branch" : " leaf";
    var html = '<div class="jsoe-node' + cls + '" style="padding-left:' + (depth * 20) + 'px">';

    if (t === "object" || t.indexOf("array") === 0) {
      var isArr = Array.isArray(val);
      var keys = isArr ? val.map(function(_,i){return i}) : Object.keys(val);
      var open = depth < 1 ? " open" : "";
      var preview = isArr ? "(" + val.length + ")" : "{" + Object.keys(val).slice(0,3).join(", ") + (Object.keys(val).length > 3 ? ", …" : "") + "}";
      html += '<span class="jsoe-toggle' + open + '" data-depth="' + depth + '">&#9654;</span> ';
      html += '<span class="jsoe-key">' + esc(key === undefined ? "" : key) + '</span>';
      html += '<span class="jsoe-type"> ' + esc(t) + '</span>';
      html += '<span class="jsoe-preview"> ' + esc(preview) + '</span>';
      html += '<div class="jsoe-children"' + (open ? '' : ' style="display:none"') + '>';
      keys.forEach(function (k) {
        html += render(isArr ? k : k, val[k], depth + 1);
      });
      html += '</div>';
    } else {
      var display = t === "string" ? '"' + esc(String(val)) + '"' : esc(String(val));
      html += '<span class="jsoe-key">' + esc(key === undefined ? "" : key) + '</span>';
      html += '<span class="jsoe-type"> ' + t + '</span>';
      html += '<span class="jsoe-value"> ' + display + '</span>';
    }

    html += '</div>';
    return html;
  }

  function explore() {
    var raw = input.value.trim();
    if (!raw) { tree.innerHTML = '<span style="color:var(--muted)">Paste an object above.</span>'; return; }

    var obj;
    try { obj = JSON.parse(raw); }
    catch (e) {
      try {
        var wrapped = "(" + raw + ")";
        obj = eval(wrapped);
        if (typeof obj !== "object" || obj === null) throw new Error("not an object");
      } catch (e2) {
        tree.innerHTML = '<div class="status err">Invalid: ' + esc(e2.message) + '</div>';
        return;
      }
    }

    tree.innerHTML = '<style>.jsoe-node{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:.88rem;line-height:1.8}.jsoe-node.leaf{cursor:default}.jsoe-node.branch{cursor:pointer}.jsoe-node.branch:hover>.jsoe-key{color:var(--accent)}.jsoe-key{color:var(--fg);font-weight:600}.jsoe-type{color:var(--muted);font-size:.82rem}.jsoe-value{color:#3aa757}.jsoe-preview{color:var(--muted);font-size:.82rem}.jsoe-toggle{display:inline-block;width:12px;transition:transform .12s ease;color:var(--muted);font-size:.75rem}.jsoe-toggle.open{transform:rotate(90deg)}.jsoe-children{padding-left:0}</style>' + render("root", obj, 0);

    tree.querySelectorAll(".jsoe-toggle").forEach(function (tog) {
      tog.addEventListener("click", function (e) {
        e.stopPropagation();
        var children = this.parentElement.querySelector(".jsoe-children");
        if (children) {
          var isOpen = children.style.display !== "none";
          children.style.display = isOpen ? "none" : "";
          this.classList.toggle("open", !isOpen);
        }
      });
    });

    tree.querySelectorAll(".jsoe-node.branch > .jsoe-key, .jsoe-node.branch > .jsoe-type, .jsoe-node.branch > .jsoe-preview").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var tog = this.parentElement.querySelector(".jsoe-toggle");
        if (tog) tog.click();
      });
    });
  }

  input.addEventListener("input", explore);
  explore();
})();