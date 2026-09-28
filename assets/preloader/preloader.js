(function () {
  var DURATION = 3200; // duração mínima da animação (ms)
  var pre  = document.getElementById('bv-preloader');
  var fill = document.getElementById('bvFill');
  var text = document.getElementById('bvText');
  var start = performance.now();
  var loaded = false;
  var done   = false;

  window.addEventListener('load', function () { loaded = true; });
  if (document.readyState === 'complete') loaded = true;

  // Easing suave (ease-out cúbico)
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  // Atualiza o glow de forma desacoplada do loop da barra
  var glow = pre ? pre.querySelector('.bv-glow') : null;
  var lastGlowP = -1;
  function updateGlow(p) {
    // Só reatualiza o glow a cada 2% para não poluir o compositor
    var rounded = Math.round(p / 2) * 2;
    if (rounded === lastGlowP || !glow) return;
    lastGlowP = rounded;
    var ratio = rounded / 100;
    glow.style.opacity   = (0.3 + ratio * 0.7).toFixed(3);
    glow.style.transform = 'scale(' + (0.9 + ratio * 0.2).toFixed(4) + ')';
  }

  // Texto: atualiza apenas quando a porcentagem inteira muda
  var lastPct = -1;
  function updateText(p) {
    var pct = Math.round(p);
    if (pct !== lastPct) {
      lastPct = pct;
      text.textContent = pct + '%';
    }
  }

  function frame(now) {
    var elapsed = now - start;
    var t = Math.min(elapsed / DURATION, 1);
    var p = ease(t) * 100;

    // Trava em 92% até a página terminar de carregar
    if (!loaded && p > 92) p = 92;

    // transform:scaleX — zero reflow, pura GPU
    fill.style.transform = 'scaleX(' + (p / 100).toFixed(4) + ')';

    updateGlow(p);
    updateText(p);

    if (p < 100) {
      requestAnimationFrame(frame);
    } else if (!done) {
      done = true;
      setTimeout(function () {
        pre.classList.add('bv-hide');
        document.documentElement.classList.remove('bv-loading');
        setTimeout(function () { pre.remove(); }, 900);
        window.dispatchEvent(new Event('bravky:ready'));
      }, 700);
    }
  }

  requestAnimationFrame(frame);
})();
