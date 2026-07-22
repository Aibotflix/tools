(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var dataEl = $("data"), sizeEl = $("size"), ecEl = $("ec");
  var fgEl = $("fg"), bgEl = $("bg"), canvas = $("qr"), qrInfo = $("qrInfo"), status = $("status");
  var ctx = canvas.getContext("2d");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function getECLevel() {
    var v = ecEl.value;
    return (v === "L" || v === "M" || v === "Q" || v === "H") ? v : "M";
  }

  function generate() {
    var text = dataEl.value.trim();
    var size = parseInt(sizeEl.value, 10);
    $("sizeVal").textContent = size;

    if (!text) {
      canvas.width = size; canvas.height = size;
      ctx.fillStyle = bgEl.value;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#999";
      ctx.font = "14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Enter text or URL above", size / 2, size / 2);
      qrInfo.textContent = "";
      return;
    }

    if (typeof qrcode === "undefined") {
      setStatus("QR library still loading — try again in a moment.", true);
      return;
    }

    try {
      var typeNumber = 0; // auto-detect
      var errorCorrectionLevel = getECLevel();
      var qr = qrcode(typeNumber, errorCorrectionLevel);
      qr.addData(text);
      qr.make();

      var moduleCount = qr.getModuleCount();
      var margin = 4;
      var totalModules = moduleCount + margin * 2;
      var cellSize = Math.floor(size / totalModules);
      var actualSize = cellSize * totalModules;

      canvas.width = actualSize;
      canvas.height = actualSize;

      // Background
      ctx.fillStyle = bgEl.value;
      ctx.fillRect(0, 0, actualSize, actualSize);

      // Modules
      ctx.fillStyle = fgEl.value;
      for (var r = 0; r < moduleCount; r++) {
        for (var c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect((c + margin) * cellSize, (r + margin) * cellSize, cellSize, cellSize);
          }
        }
      }

      qrInfo.textContent = moduleCount + "×" + moduleCount + " modules | " + ecEl.value + " error correction | " + text.length + " characters encoded";
      setStatus("");
    } catch (e) {
      setStatus("Could not generate QR code: " + (typeof e === "string" ? e : e.message), true);
    }
  }

  function downloadPNG() {
    if (!dataEl.value.trim()) { setStatus("Enter data first.", true); return; }
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
    setStatus("Downloaded qrcode.png");
  }

  function downloadSVG() {
    var text = dataEl.value.trim();
    if (!text) { setStatus("Enter data first.", true); return; }
    if (typeof qrcode === "undefined") { setStatus("Library still loading.", true); return; }

    try {
      var typeNumber = 0;
      var qr = qrcode(typeNumber, getECLevel());
      qr.addData(text);
      qr.make();

      var moduleCount = qr.getModuleCount();
      var cellSize = 10;
      var margin = 4;
      var total = (moduleCount + margin * 2) * cellSize;

      var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
      svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + total + '" height="' + total + '" viewBox="0 0 ' + total + ' ' + total + '">\n';
      svg += '<rect width="' + total + '" height="' + total + '" fill="' + bgEl.value + '"/>\n';
      svg += '<g fill="' + fgEl.value + '">\n';
      for (var r = 0; r < moduleCount; r++) {
        for (var c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            svg += '<rect x="' + (c + margin) * cellSize + '" y="' + (r + margin) * cellSize + '" width="' + cellSize + '" height="' + cellSize + '"/>\n';
          }
        }
      }
      svg += '</g>\n</svg>';

      var blob = new Blob([svg], { type: "image/svg+xml" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("Downloaded qrcode.svg");
    } catch (e) {
      setStatus("SVG export failed: " + e.message, true);
    }
  }

  dataEl.addEventListener("input", generate);
  sizeEl.addEventListener("input", generate);
  ecEl.addEventListener("change", generate);
  fgEl.addEventListener("input", generate);
  bgEl.addEventListener("input", generate);
  $("downloadPng").addEventListener("click", downloadPNG);
  $("downloadSvg").addEventListener("click", downloadSVG);

  generate();
})();
