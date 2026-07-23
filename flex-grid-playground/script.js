(function () {
  "use strict";
  var mode = "flex";
  var controls = [
    { key: "flex-wrap", label: "Flex Wrap", mode: "flex", options: ["nowrap", "wrap", "wrap-reverse"] },
    { key: "justify-content", label: "Justify Content", mode: "both", options: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"] },
    { key: "align-items", label: "Align Items", mode: "both", options: ["flex-start", "flex-end", "center", "stretch", "baseline"] },
    { key: "align-content", label: "Align Content", mode: "both", options: ["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"] },
    { key: "flex-direction", label: "Direction", mode: "flex", options: ["row", "row-reverse", "column", "column-reverse"] },
    { key: "grid-template-columns", label: "Grid Columns", mode: "grid", type: "text", placeholder: "1fr 1fr 1fr" },
    { key: "grid-template-rows", label: "Grid Rows", mode: "grid", type: "text", placeholder: "auto" },
    { key: "gap", label: "Gap (px)", mode: "both", type: "number", min: 0, max: 40, val: 8 },
    { key: "items", label: "Item Count", mode: "both", type: "number", min: 1, max: 12, val: 5 }
  ];

  var preview = document.getElementById("preview");
  var cssDisplay = document.getElementById("css-display");
  var controlsEl = document.getElementById("controls");
  var modeBtns = document.querySelectorAll("[data-mode]");

  var vals = {};

  function init() {
    controls.forEach(function (c) {
      vals[c.key] = c.val !== undefined ? c.val : (c.options ? c.options[0] : "");
    });
    renderControls();
    update();
  }

  function renderControls() {
    var html = "";
    controls.forEach(function (c) {
      if (c.mode !== "both" && c.mode !== mode) return;
      html += '<div><label>' + c.label + '</label>';
      if (c.options) {
        html += '<select data-key="' + c.key + '">';
        c.options.forEach(function (o) {
          html += '<option value="' + o + '"' + (vals[c.key] === o ? " selected" : "") + '>' + o + '</option>';
        });
        html += '</select>';
      } else if (c.type === "number") {
        html += '<input type="number" data-key="' + c.key + '" min="' + c.min + '" max="' + c.max + '" value="' + vals[c.key] + '">';
      } else {
        html += '<input type="text" data-key="' + c.key + '" placeholder="' + (c.placeholder || "") + '" value="' + vals[c.key] + '">';
      }
      html += '</div>';
    });
    controlsEl.innerHTML = html;

    controlsEl.querySelectorAll("select, input").forEach(function (el) {
      el.addEventListener("change", function () {
        vals[this.getAttribute("data-key")] = this.value;
        update();
      });
      el.addEventListener("input", function () {
        vals[this.getAttribute("data-key")] = this.value;
        update();
      });
    });
  }

  function update() {
    preview.style.flexDirection = mode === "flex" ? vals["flex-direction"] : "";
    preview.style.flexWrap = mode === "flex" ? vals["flex-wrap"] : "";
    preview.style.justifyContent = vals["justify-content"] || "";
    preview.style.alignItems = vals["align-items"] || "";
    preview.style.alignContent = vals["align-content"] || "";
    preview.style.gap = (vals.gap || 0) + "px";

    if (mode === "grid") {
      preview.style.display = "grid";
      preview.style.gridTemplateColumns = vals["grid-template-columns"] || "";
      preview.style.gridTemplateRows = vals["grid-template-rows"] || "";
      preview.style.flexDirection = "";
      preview.style.flexWrap = "";
    } else {
      preview.style.display = "flex";
      preview.style.gridTemplateColumns = "";
      preview.style.gridTemplateRows = "";
    }

    // Render items
    var count = Math.max(1, Math.min(12, parseInt(vals.items) || 1));
    var colors = ["", "x", "y", "", "x", "y", "", "x", "y", "", "x", "y"];
    var html = "";
    for (var i = 0; i < count; i++) {
      html += '<div class="fpg-item' + (colors[i] ? " " + colors[i] : "") + '">' + (i + 1) + '</div>';
    }
    preview.innerHTML = html;

    // CSS display
    var css = "/* " + (mode === "flex" ? "Flexbox" : "CSS Grid") + " */\n";
    css += ".container {\n  display: " + mode + ";\n";
    if (mode === "flex") {
      css += "  flex-direction: " + vals["flex-direction"] + ";\n";
      css += "  flex-wrap: " + vals["flex-wrap"] + ";\n";
    }
    if (mode === "grid") {
      if (vals["grid-template-columns"]) css += "  grid-template-columns: " + vals["grid-template-columns"] + ";\n";
      if (vals["grid-template-rows"]) css += "  grid-template-rows: " + vals["grid-template-rows"] + ";\n";
    }
    css += "  justify-content: " + vals["justify-content"] + ";\n";
    css += "  align-items: " + vals["align-items"] + ";\n";
    css += "  align-content: " + vals["align-content"] + ";\n";
    css += "  gap: " + vals.gap + "px;\n}";
    cssDisplay.textContent = css;
  }

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      mode = this.getAttribute("data-mode");
      modeBtns.forEach(function (b) { b.classList.toggle("secondary", b.getAttribute("data-mode") !== mode); });
      renderControls();
      update();
    });
  });

  init();
})();