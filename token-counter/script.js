(function () {
  "use strict";

  var MODELS = {
    "gpt-5.6":               { label: "GPT-5.6",                cpt: 4.0, ctx: 1050000, vendor: "OpenAI" },
    "gpt-5.1":               { label: "GPT-5.1",                cpt: 4.0, ctx: 1050000, vendor: "OpenAI" },
    "gpt-5-mini":            { label: "GPT-5 Mini",             cpt: 4.0, ctx: 1050000, vendor: "OpenAI" },
    "gpt-4o":                { label: "GPT-4o",                 cpt: 4.0, ctx: 128000,  vendor: "OpenAI" },
    "gpt-4o-mini":           { label: "GPT-4o Mini",            cpt: 4.0, ctx: 128000,  vendor: "OpenAI" },
    "gpt-4.1":               { label: "GPT-4.1",                cpt: 4.0, ctx: 1050000, vendor: "OpenAI" },
    "gpt-4.1-mini":          { label: "GPT-4.1 Mini",           cpt: 4.0, ctx: 1050000, vendor: "OpenAI" },
    "gpt-4.1-nano":          { label: "GPT-4.1 Nano",           cpt: 4.0, ctx: 1050000, vendor: "OpenAI" },
    "o3":                    { label: "o3",                     cpt: 4.0, ctx: 200000,  vendor: "OpenAI" },
    "o3-mini":               { label: "o3-mini",                cpt: 4.0, ctx: 200000,  vendor: "OpenAI" },
    "o3-pro":                { label: "o3-pro",                 cpt: 4.0, ctx: 200000,  vendor: "OpenAI" },
    "o4-mini":               { label: "o4-mini",                cpt: 4.0, ctx: 200000,  vendor: "OpenAI" },
    "claude-sonnet-5":       { label: "Claude Sonnet 5",        cpt: 3.8, ctx: 200000,  vendor: "Anthropic" },
    "claude-opus-4-8":       { label: "Claude Opus 4.8",        cpt: 3.8, ctx: 200000,  vendor: "Anthropic" },
    "claude-fable-5":        { label: "Claude Fable 5",         cpt: 3.8, ctx: 200000,  vendor: "Anthropic" },
    "claude-mythos-5":       { label: "Claude Mythos 5",        cpt: 3.8, ctx: 200000,  vendor: "Anthropic" },
    "claude-haiku-4":        { label: "Claude Haiku 4",         cpt: 4.0, ctx: 200000,  vendor: "Anthropic" },
    "claude-sonnet-4":       { label: "Claude Sonnet 4",        cpt: 4.0, ctx: 200000,  vendor: "Anthropic" },
    "claude-haiku-3.5":      { label: "Claude Haiku 3.5",       cpt: 4.0, ctx: 200000,  vendor: "Anthropic" },
    "gemini-2.5-pro":        { label: "Gemini 2.5 Pro",         cpt: 4.0, ctx: 2000000, vendor: "Google" },
    "gemini-2.5-flash":      { label: "Gemini 2.5 Flash",       cpt: 4.0, ctx: 1000000, vendor: "Google" },
    "gemini-2.5-flash-lite": { label: "Gemini 2.5 Flash Lite",  cpt: 4.0, ctx: 1000000, vendor: "Google" },
    "gemini-2.0-flash":      { label: "Gemini 2.0 Flash",       cpt: 4.0, ctx: 1000000, vendor: "Google" },
    "gemini-2.0-flash-lite": { label: "Gemini 2.0 Flash Lite",  cpt: 4.0, ctx: 1000000, vendor: "Google" }
  };

  function estimate(text, cpt) {
    var len = text.length;
    if (len === 0) return 0;

    var cjk = (text.match(/[\u3000-\u9FFF\uF900-\uFAFF\u3400-\u4DBF]/g) || []).length;
    var latinWords = (text.match(/[a-zA-Z]+/g) || []).length;
    var nums = (text.match(/\d+/g) || []).length;
    var nonAscii = len - (text.match(/[\x00-\x7F]/g) || []).length;
    var ascii = len - nonAscii;

    var tokens;
    if (cjk > latinWords * 3) {
      tokens = cjk / 1.5 + latinWords * 2.5 + nums * 1.5;
    } else if (nonAscii > len * 0.3) {
      tokens = ascii / cpt + nonAscii / 3.0 + nums * 1.5;
    } else {
      tokens = len / cpt;
    }

    return Math.ceil(tokens * 1.05);
  }

  function update() {
    var sel = document.getElementById("model").value;
    var text = document.getElementById("text").value;
    var m = MODELS[sel];
    if (!m) return;

    var tokens = estimate(text, m.cpt);
    var chars = text.length;
    var words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    document.getElementById("tokenCount").textContent = tokens.toLocaleString();
    document.getElementById("charCount").textContent = chars.toLocaleString();
    document.getElementById("wordCount").textContent = words.toLocaleString();

    var warn = document.getElementById("warning");
    if (tokens > m.ctx) {
      warn.className = "status err";
      warn.textContent = "Warning: " + tokens.toLocaleString() + " tokens exceeds " + (m.ctx/1000).toLocaleString() + "K context window. Input will likely be truncated.";
    } else if (tokens > m.ctx * 0.8) {
      warn.className = "status";
      warn.textContent = "Using ~" + Math.round(tokens/m.ctx*100) + "% of " + (m.ctx/1000).toLocaleString() + "K context window. Leave room for output.";
    } else {
      warn.className = "status";
      warn.textContent = "";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("model").addEventListener("change", update);
    document.getElementById("text").addEventListener("input", update);
    update();
  });
}());
