(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  function parseHex(s) {
    var h = s.replace(/[^0-9a-fA-F]/g, "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return null;
    var r = parseInt(h.substr(0, 2), 16);
    var g = parseInt(h.substr(2, 2), 16);
    var b = parseInt(h.substr(4, 2), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r: r, g: g, b: b };
  }

  function parseRgb(s) {
    var m = s.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!m) m = s.match(/rgb\s*\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)/i);
    if (!m) m = s.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
    if (!m) return null;
    var r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
    return { r: r, g: g, b: b };
  }

  function parseHsl(s) {
    var m = s.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
    if (!m) m = s.match(/hsl\s*\(\s*(\d+)\s+(\d+)%\s+(\d+)%\s*\)/i);
    if (!m) m = s.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
    if (!m) return null;
    var h = parseInt(m[1]) % 360, s2 = parseInt(m[2]), l = parseInt(m[3]);
    if (s2 < 0 || s2 > 100 || l < 0 || l > 100) return null;
    return hslToRgb(h, s2, l);
  }

  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = 0; s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function toHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join("");
  }

  function toRgb(r, g, b) { return "rgb(" + r + ", " + g + ", " + b + ")"; }

  function toHsl(r, g, b) {
    var hsl = rgbToHsl(r, g, b);
    return "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
  }

  function setStatus(msg, isErr) {
    var s = $("color-status"); s.textContent = msg || ""; s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  var updating = false;
  function updateFromRgb(r, g, b, source) {
    if (updating) return;
    updating = true;
    var hex = toHex(r, g, b);
    var rgb = toRgb(r, g, b);
    var hsl = toHsl(r, g, b);
    if (source !== "hex") $("hex").value = hex;
    if (source !== "rgb") $("rgb").value = rgb;
    if (source !== "hsl") $("hsl").value = hsl;
    if (source !== "picker") $("picker").value = hex;
    $("color-swatch").style.background = hex;
    setStatus("");
    updating = false;
  }

  function parseAndUpdate(s, source) {
    var rgb = parseHex(s) || parseRgb(s) || parseHsl(s);
    if (rgb) {
      updateFromRgb(rgb.r, rgb.g, rgb.b, source);
    } else if (s.trim()) {
      setStatus("Could not parse that color. Try #ff0000, rgb(255,0,0), or hsl(0,100%,50%).", true);
    }
  }

  $("hex").addEventListener("input", function () { parseAndUpdate(this.value, "hex"); });
  $("rgb").addEventListener("input", function () { parseAndUpdate(this.value, "rgb"); });
  $("hsl").addEventListener("input", function () { parseAndUpdate(this.value, "hsl"); });
  $("picker").addEventListener("input", function () { parseAndUpdate(this.value, "picker"); });

  function setupCopy(id) {
    $(id).addEventListener("click", function () {
      var inputId = id.replace("copy-", "");
      var v = $(inputId).value;
      if (!v) return;
      if (navigator.clipboard && navigator.clipboard.writeText)
        navigator.clipboard.writeText(v).then(function () { setStatus("Copied " + inputId.toUpperCase() + "!"); });
    });
  }
  setupCopy("copy-hex");
  setupCopy("copy-rgb");
  setupCopy("copy-hsl");

  parseAndUpdate($("hex").value, "hex");
})();
