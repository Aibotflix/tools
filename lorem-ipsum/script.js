(function () {
  "use strict";
  function $(id){ return document.getElementById(id); }
  var words = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");
  var n = words.length;
  function ri(max){ return Math.floor(Math.random() * max); }
  function sentence(){
    var len = 4 + ri(9), s = [], i;
    for (i = 0; i < len; i++) s.push(words[ri(n)]);
    var str = s.join(" ");
    return str.charAt(0).toUpperCase() + str.slice(1) + ".";
  }
  function paragraph(){
    var len = 3 + ri(4), s = [], i;
    for (i = 0; i < len; i++) s.push(sentence());
    var p = s.join(" ");
    if ($("classic").checked) {
      p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " + p;
    }
    return p;
  }
  function generate(){
    $("countVal").textContent = $("count").value;
    var count = parseInt($("count").value, 10) || 1, ps = [], i;
    for (i = 0; i < count; i++) ps.push(paragraph());
    $("out").value = ps.join("\n\n");
  }
  $("count").addEventListener("input", generate);
  $("classic").addEventListener("change", generate);
  $("gen").addEventListener("click", generate);
  $("copy").addEventListener("click", function () {
    var v = $("out").value;
    if (!v) return;
    var b = $("copy");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function(){ b.textContent="Copied!"; setTimeout(function(){ b.textContent="Copy"; },1200); }, function(){ b.textContent="Copy failed"; });
    else b.textContent = "Copy not supported";
  });
  generate();
})();
