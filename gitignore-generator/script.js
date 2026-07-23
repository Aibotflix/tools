(function () {
  "use strict";

  var API = "https://api.github.com/repos/github/gitignore/contents";
  var RAW = "https://raw.githubusercontent.com/github/gitignore/main";
  var checked = {};

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.textContent = html;
    return n;
  }

  function $(id) { return document.getElementById(id); }

  function setStatus(msg, isErr) {
    var s = $("status");
    s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
    s.textContent = msg || "";
  }

  function renderCategories() {
    var list = $("cat-list");
    list.innerHTML = "";

    var groups = [
      { name: "Languages",        ids: ["Python","JavaScript","TypeScript","Java","Kotlin","Swift","Go","Rust","Ruby","PHP","C","CSharp","C++","Dart","Scala","Clojure","Haskell","Lua","Julia","R"] },
      { name: "Frameworks",       ids: ["Rails","Laravel","Django","Flask","Node","Express","React","Vue","Angular","Svelte","Next.js","Nuxt","Symfony","Spring","Dotnet","Flutter","Godot","Unity","UnrealEngine","Laravel"] },
      { name: "Tools / Editors",  ids: ["VisualStudio","VisualStudioCode","JetBrains","Eclipse","Vim","Emacs","SublimeText","Xcode","VSCode","IntelliJ","Neovim"] },
      { name: "OS",               ids: ["Windows","macOS","Linux","Ubuntu","ArchLinux","macOS","Debian","Fedora","openSUSE","FreeBSD","OpenBSD","NetBSD"] },
      { name: "Other",            ids: ["Node","npm","Yarn","pnpm","Docker","Pipenv","Poetry","JupyterNotebooks","Terraform","Unity","UnrealEngine","Composer","Composer.lock","Pip","conda","Maven","Gradle","Bundler","Composer","Global","apple","OSX","Jenv"] }
    ];

    groups.forEach(function (g) {
      var h2 = el("h2", null, g.name);
      list.appendChild(h2);

      var field = el("div", "field checks");
      g.ids.forEach(function (id) {
        var label = el("label");
        var cb = el("input");
        cb.type = "checkbox";
        cb.value = id;
        cb.addEventListener("change", function () {
          checked[this.value] = this.checked;
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(" " + id));
        field.appendChild(label);
      });
      list.appendChild(field);
    });
  }

  async function fetchTemplate(name) {
    var url = API + "/" + name;
    var r = await fetch(url);
    if (!r.ok) throw new Error("Can't fetch " + name + " (" + r.status + ")");
    var data = await r.json();
    var bytes = atob(data.content.replace(/\n/g, ""));
    var text = "";
    for (var i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes.charCodeAt(i));
    return text;
  }

  async function generate() {
    var ids = Object.keys(checked).filter(function (k) { return checked[k]; });
    if (!ids.length) { setStatus("Select at least one template first.", true); return; }

    setStatus("Fetching templates…");
    var parts = {};
    var errors = [];

    for (var i = 0; i < ids.length; i++) {
      try {
        var name = ids[i] + ".gitignore";
        var content = await fetchTemplate(name);
        parts[ids[i]] = content;
      } catch (e) {
        errors.push(ids[i]);
      }
      setStatus("Fetching " + (i + 1) + "/" + ids.length + "…");
    }

    var out = "";
    for (var id in parts) {
      out += "# " + id + "\n" + parts[id] + "\n\n";
    }

    var custom = $("custom").value.trim();
    if (custom) {
      out += "# Custom\n" + custom;
    }

    if (errors.length) {
      setStatus("Done (" + errors.join(", ") + " not found).");
    } else {
      setStatus("Done — " + ids.length + " template" + (ids.length > 1 ? "s" : "") + " combined.");
    }

    $("output").textContent = out;
    $("copy").disabled = false;
    $("dl").style.display = "";
    $("dl").href = URL.createObjectURL(new Blob([out], { type: "text/plain" }));
  }

  function init() {
    renderCategories();

    $("generate").addEventListener("click", generate);
    $("copy").addEventListener("click", function () {
      if (!$("copy").disabled) {
        navigator.clipboard.writeText($("output").textContent).then(function () {
          setStatus("Copied!");
        }).catch(function () {
          setStatus("Copy failed.", true);
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
}());
