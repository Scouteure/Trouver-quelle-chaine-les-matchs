/*
 * Pitchoun, la mascotte aux couleurs du Téfécé.
 *
 * Il se promène tout seul sur l'écran (comme un petit animal de compagnie).
 * Un clic dessus ouvre une bulle : on tape une équipe ou un joueur, et il
 * emmène Papa dans le calendrier, jusqu'au prochain rendez-vous.
 *
 * Désactivé (dans ⚙ ou depuis sa bulle), il attend dans un bouton rond en
 * bas à droite, comme un assistant de discussion.
 */
(function () {
  'use strict';

  const KEY = 'guide-sport-papa:mascot:v1';
  const G = function () { return window.GuideSport; };
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const saved = (function () {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  })();
  const conf = { roaming: saved.roaming !== false, greeted: !!saved.greeted };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(conf)); } catch (e) { /* stockage indisponible */ } }

  // -------------------------------------------------------------------
  // Le dessin : une petite violette (Toulouse, la ville rose… et violette)
  // en maillot du Téfécé, avec la croix occitane et son ballon.
  // -------------------------------------------------------------------
  const CROSS = '<path d="M50 50 38 20h24zM50 50l30-12v24zM50 50l12 30H38zM50 50 20 62V38z"/>' +
    '<circle cx="38" cy="14" r="5"/><circle cx="50" cy="10" r="5"/><circle cx="62" cy="14" r="5"/>' +
    '<circle cx="86" cy="38" r="5"/><circle cx="90" cy="50" r="5"/><circle cx="86" cy="62" r="5"/>' +
    '<circle cx="38" cy="86" r="5"/><circle cx="50" cy="90" r="5"/><circle cx="62" cy="86" r="5"/>' +
    '<circle cx="14" cy="38" r="5"/><circle cx="10" cy="50" r="5"/><circle cx="14" cy="62" r="5"/>';
  function petals() {
    let out = '';
    for (let i = 0; i < 5; i++) {
      out += '<ellipse cx="50" cy="22" rx="12" ry="15" fill="' + (i % 2 ? '#9a5fd0' : '#7b3fb8') + '" transform="rotate(' + (i * 72 - 36) + ' 50 40)"/>';
    }
    return out;
  }
  const FACE =
    '<g class="m-head">' + petals() +
      '<circle cx="50" cy="40" r="19" fill="#ffe9c9"/>' +
      '<g class="m-eyes"><ellipse cx="43" cy="39" rx="3" ry="4" fill="#1a1030"/><ellipse cx="57" cy="39" rx="3" ry="4" fill="#1a1030"/>' +
        '<circle cx="44" cy="37.5" r="1.1" fill="#fff"/><circle cx="58" cy="37.5" r="1.1" fill="#fff"/></g>' +
      '<g class="m-eyes-closed" stroke="#1a1030" stroke-width="2" stroke-linecap="round" fill="none"><path d="M40 40q3 2 6 0"/><path d="M54 40q3 2 6 0"/></g>' +
      '<ellipse cx="38" cy="46" rx="3.5" ry="2" fill="#ff8fab" opacity=".7"/><ellipse cx="62" cy="46" rx="3.5" ry="2" fill="#ff8fab" opacity=".7"/>' +
      '<path class="m-mouth" d="M44 47q6 6 12 0" stroke="#1a1030" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    '</g>';
  const SVG =
    '<svg viewBox="0 0 100 120" aria-hidden="true">' +
      '<ellipse class="m-shadow" cx="50" cy="115" rx="22" ry="4" fill="rgba(0,0,0,.35)"/>' +
      '<g class="m-leg m-leg-l"><rect x="38" y="92" width="8" height="16" rx="3" fill="#5b2a86"/><rect x="33" y="105" width="13" height="7" rx="3.5" fill="#15101f"/></g>' +
      '<g class="m-leg m-leg-r"><rect x="54" y="92" width="8" height="16" rx="3" fill="#5b2a86"/><rect x="54" y="105" width="13" height="7" rx="3.5" fill="#15101f"/></g>' +
      '<g class="m-bob">' +
        '<g class="m-arm m-arm-l"><path d="M34 67q-10 7-11 17" stroke="#5b2a86" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="23" cy="86" r="4.5" fill="#ffe9c9"/></g>' +
        '<g class="m-arm m-arm-r"><path d="M66 67q10 7 11 17" stroke="#5b2a86" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="77" cy="86" r="4.5" fill="#ffe9c9"/></g>' +
        '<path d="M32 64q18-7 36 0l2 26q-20 5-40 0z" fill="#5b2a86"/>' +
        '<path d="M44 60q6 4 12 0" stroke="#f2c230" stroke-width="2.5" fill="none"/>' +
        '<g transform="translate(43 68) scale(.14)" fill="#f2c230">' + CROSS + '</g>' +
        '<path d="M30 88q20 5 40 0v8q-20 4-40 0z" fill="#fff"/>' +
        FACE +
      '</g>' +
      '<g class="m-ball"><circle cx="78" cy="109" r="6" fill="#fff" stroke="#15101f" stroke-width="1.2"/>' +
        '<path d="M78 105.5l3 2.2-1.1 3.5h-3.8l-1.1-3.5z" fill="#15101f"/></g>' +
    '</svg>';
  const FACE_ONLY = '<svg viewBox="16 6 68 62" aria-hidden="true">' + FACE + '</svg>';

  // -------------------------------------------------------------------
  // Construction
  // -------------------------------------------------------------------
  const pet = document.createElement('div');
  pet.className = 'mascot';
  pet.hidden = true;
  pet.innerHTML = '<button class="mascot-btn" type="button" aria-label="Pitchoun, la mascotte : cliquez pour chercher un match">' +
    '<span class="mascot-flip">' + SVG + '</span><span class="mascot-zz" aria-hidden="true">z<span>z</span><span>z</span></span></button>' +
    '<div class="mascot-say" aria-hidden="true"></div>';
  const dock = document.createElement('button');
  dock.type = 'button';
  dock.className = 'mascot-dock';
  dock.hidden = true;
  dock.setAttribute('aria-label', 'Demander à Pitchoun de trouver un match');
  dock.innerHTML = FACE_ONLY + '<span class="mascot-dock-dot"></span>';
  const bubble = document.createElement('div');
  bubble.className = 'mascot-bubble';
  bubble.hidden = true;
  bubble.setAttribute('role', 'dialog');
  bubble.setAttribute('aria-label', 'Pitchoun');
  document.body.appendChild(pet);
  document.body.appendChild(dock);
  document.body.appendChild(bubble);
  const btn = pet.querySelector('.mascot-btn');
  const say = pet.querySelector('.mascot-say');

  // -------------------------------------------------------------------
  // Déplacements
  // -------------------------------------------------------------------
  const me = { x: 0, y: 0, facing: -1, mode: 'idle', until: 0, target: null, speed: 60, onArrive: null, busy: false, lastTouch: Date.now() };
  function size() { return { w: pet.offsetWidth || 72, h: pet.offsetHeight || 86 }; }
  // Il se promène surtout dans le bas de l'écran, pour ne pas gêner la lecture.
  function bounds() {
    const s = size();
    const maxY = Math.max(80, window.innerHeight - s.h - 4);
    // Sur téléphone, il reste au ras du bas de l'écran pour ne pas cacher les chaînes.
    const minY = window.innerWidth < 600 ? Math.max(80, maxY - 40) : Math.max(80, window.innerHeight * 0.5);
    return { minX: 6, maxX: Math.max(6, window.innerWidth - s.w - 6), minY: minY, maxY: maxY };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function place() {
    pet.style.transform = 'translate3d(' + Math.round(me.x) + 'px,' + Math.round(me.y) + 'px,0)';
    pet.classList.toggle('is-left', me.facing < 0);
    if (!bubble.hidden && !dockedBubble) positionBubble();
  }
  function setPose(p) {
    ['is-walking', 'is-running', 'is-waving', 'is-juggling', 'is-sleeping', 'is-happy', 'is-looking'].forEach(function (c) { pet.classList.remove(c); });
    if (p) pet.classList.add(p);
  }
  function homeSpot() {
    const b = bounds();
    return { x: b.maxX - 10, y: b.maxY };
  }

  function walkTo(target, speed, cb) {
    me.mode = 'walk';
    me.target = target;
    me.speed = speed || 60;
    me.onArrive = cb || null;
    setPose(me.speed > 120 ? 'is-running' : 'is-walking');
  }

  function idle(ms) {
    me.mode = 'idle';
    me.until = performance.now() + ms;
    setPose(null);
  }

  // Choisit la prochaine petite occupation quand il ne fait rien.
  function nextActivity() {
    if (me.busy || !bubble.hidden) return idle(1500);
    if (Date.now() - me.lastTouch > 3 * 60000) { me.mode = 'sleep'; setPose('is-sleeping'); return; }
    const r = Math.random();
    if (r < 0.5) {
      const b = bounds();
      walkTo({ x: b.minX + Math.random() * (b.maxX - b.minX), y: b.minY + Math.random() * (b.maxY - b.minY) }, 45 + Math.random() * 30, function () { idle(1500 + Math.random() * 4000); });
    } else if (r < 0.65) {
      idle(2600); setPose('is-juggling');
    } else if (r < 0.75) {
      idle(1800); setPose('is-waving');
    } else if (r < 0.85) {
      idle(2500); setPose('is-looking');
    } else if (r < 0.9) {
      idle(3000); speak(['Allez le Téfécé ! 💜', 'Qui joue ce soir ? 🤔', 'Clique sur moi ! 😉', 'Un match à trouver ? ⚽', 'Pitchoun à votre service !'][Math.floor(Math.random() * 5)]);
    } else {
      idle(3000 + Math.random() * 4000);
    }
  }

  let last = 0;
  function frame(t) {
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    if (!pet.hidden && me.mode !== 'drag') {
      if (me.mode === 'walk' && me.target) {
        const tg = typeof me.target === 'function' ? me.target() : me.target;
        const dx = tg.x - me.x, dy = tg.y - me.y;
        const dist = Math.hypot(dx, dy);
        const step = me.speed * dt;
        if (Math.abs(dx) > 2) me.facing = dx > 0 ? 1 : -1;
        if (dist <= step || dist < 1) {
          me.x = tg.x; me.y = tg.y;
          me.mode = 'idle'; me.until = Infinity;
          setPose(null);
          const cb = me.onArrive; me.onArrive = null;
          if (cb) cb(); else idle(1500);
        } else {
          me.x += dx / dist * step; me.y += dy / dist * step;
        }
        place();
      } else if (me.mode === 'idle' && t > me.until && roamingNow()) {
        nextActivity();
      }
    }
    requestAnimationFrame(frame);
  }
  function roamingNow() { return conf.roaming && !reduceMotion && !me.busy; }

  window.addEventListener('resize', function () {
    if (pet.hidden || me.busy) return;
    const b = bounds();
    me.x = clamp(me.x, b.minX, b.maxX); me.y = clamp(me.y, b.minY, b.maxY);
    place();
  });

  // -------------------------------------------------------------------
  // Petites phrases au-dessus de sa tête
  // -------------------------------------------------------------------
  let sayTimer;
  function speak(text, ms) {
    say.textContent = text;
    // Près d'un bord de l'écran, la petite bulle se décale pour rester visible.
    const s = size();
    const mid = me.x + s.w / 2;
    say.classList.toggle('to-left', mid > window.innerWidth - 130);
    say.classList.toggle('to-right', mid < 130);
    say.classList.add('show');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say.classList.remove('show'); }, ms || 3200);
  }

  // -------------------------------------------------------------------
  // La bulle de recherche
  // -------------------------------------------------------------------
  let dockedBubble = false;
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  const CHIPS = [['💜', 'Toulouse FC'], ['🌳', 'Nottingham Forest'], ['❤️🖤', 'Stade Toulousain'], ['🇫🇷', 'Les Bleus']];

  function footer() {
    return '<div class="mb-foot">' + (conf.roaming
      ? '<button type="button" class="mb-link" data-mb="dock">Me ranger dans le coin</button>'
      : '<button type="button" class="mb-link" data-mb="roam">🐾 Me laisser me promener</button>') + '</div>';
  }
  function askHTML(msg) {
    return '<button type="button" class="mb-close" data-mb="close" aria-label="Fermer">✕</button>' +
      '<p class="mb-msg">' + (msg || 'Salut Papa ! 👋<br><b>Quel sportif ou quel match tu cherches ?</b>') + '</p>' +
      '<form class="mb-form"><input class="mb-input" type="text" placeholder="Ex. : Nottingham Forest, Sinner, PSG…" maxlength="50" autocomplete="off" enterkeyhint="search" aria-label="Équipe ou joueur">' +
      '<button class="btn btn--primary" type="submit">Go !</button></form>' +
      '<div class="mb-chips">' + CHIPS.map(function (c) {
        return '<button type="button" class="mb-chip" data-mb-q="' + esc(c[1]) + '">' + c[0] + ' ' + esc(c[1]) + '</button>';
      }).join('') + '</div>' + footer();
  }

  function openBubble(html, focus) {
    bubble.innerHTML = html;
    bubble.hidden = false;
    dockedBubble = pet.hidden;
    positionBubble();
    requestAnimationFrame(function () { bubble.classList.add('show'); });
    if (focus) {
      const input = bubble.querySelector('.mb-input');
      // Sur téléphone, on évite d'ouvrir le clavier d'office quand c'est la mascotte qui parle.
      if (input && focus === 'input') input.focus({ preventScroll: true });
    }
  }
  function closeBubble() {
    bubble.classList.remove('show');
    bubble.hidden = true;
    if (!conf.roaming && !pet.hidden && !me.busy) goBackToDock();
  }

  function positionBubble() {
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    let anchor;
    if (pet.hidden) {
      const r = dock.getBoundingClientRect();
      anchor = { x: r.left + r.width / 2, top: r.top, bottom: r.bottom };
    } else {
      const s = size();
      anchor = { x: me.x + s.w / 2, top: me.y + 4, bottom: me.y + s.h };
    }
    let top = anchor.top - bh - 10;
    let below = false;
    if (top < 8) { top = Math.min(vh - bh - 8, anchor.bottom + 10); below = true; }
    const left = clamp(anchor.x - bw / 2, 8, vw - bw - 8);
    bubble.style.left = Math.round(left) + 'px';
    bubble.style.top = Math.round(Math.max(8, top)) + 'px';
    bubble.classList.toggle('is-below', below);
    bubble.style.setProperty('--tail', Math.round(clamp(anchor.x - left, 20, bw - 20)) + 'px');
  }

  function wake() {
    me.lastTouch = Date.now();
    if (me.mode === 'sleep') { idle(800); speak('Hein ? Je dormais pas ! 😳', 1800); }
  }

  bubble.addEventListener('submit', function (e) {
    e.preventDefault();
    const q = bubble.querySelector('.mb-input').value.trim();
    if (q.length < 2) { bubble.querySelector('.mb-input').focus(); return; }
    search(q);
  });
  bubble.addEventListener('click', function (e) {
    const t = e.target.closest('[data-mb], [data-mb-q], [data-mb-ev]');
    if (!t) return;
    if (t.dataset.mbQ) { search(t.dataset.mbQ); return; }
    if (t.dataset.mbEv) { closeBubble(); G().openEvent(t.dataset.mbEv); return; }
    const a = t.dataset.mb;
    if (a === 'close') closeBubble();
    else if (a === 'again') openBubble(askHTML(), 'input');
    else if (a === 'dock') { setRoaming(false); }
    else if (a === 'roam') { setRoaming(true); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !bubble.hidden) closeBubble();
  });
  document.addEventListener('pointerdown', function (e) {
    if (bubble.hidden || me.busy) return;
    if (bubble.contains(e.target) || pet.contains(e.target) || dock.contains(e.target)) return;
    closeBubble();
  });

  // Clic (ou glisser-déposer) sur la mascotte
  let drag = null;
  btn.addEventListener('pointerdown', function (e) {
    if (me.busy) return;
    drag = { sx: e.clientX, sy: e.clientY, ox: e.clientX - me.x, oy: e.clientY - me.y, moved: false, id: e.pointerId };
  });
  btn.addEventListener('pointermove', function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) return;
    if (!drag.moved) { drag.moved = true; btn.setPointerCapture(e.pointerId); me.mode = 'drag'; setPose('is-happy'); wake(); }
    const s = size();
    me.x = clamp(e.clientX - drag.ox, 0, window.innerWidth - s.w);
    me.y = clamp(e.clientY - drag.oy, 0, window.innerHeight - s.h);
    place();
  });
  function endDrag() {
    if (drag && drag.moved) { idle(2500); speak('Wouah ! 😵‍💫', 1500); btn.dataset.dragged = '1'; }
    drag = null;
  }
  btn.addEventListener('pointerup', endDrag);
  btn.addEventListener('pointercancel', endDrag);
  btn.addEventListener('click', function () {
    if (btn.dataset.dragged) { delete btn.dataset.dragged; return; }
    if (me.busy) return;
    wake();
    say.classList.remove('show');
    if (!bubble.hidden) { closeBubble(); return; }
    if (me.mode === 'walk') idle(1000);
    setPose('is-waving');
    openBubble(askHTML(), 'input');
  });
  dock.addEventListener('click', function () {
    if (me.busy) return;
    if (!bubble.hidden) { closeBubble(); return; }
    openBubble(askHTML(), 'input');
  });

  // -------------------------------------------------------------------
  // La recherche et le guidage jusqu'au calendrier
  // -------------------------------------------------------------------
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function until(test, max) {
    const t0 = Date.now();
    return new Promise(function (resolve) {
      (function loop() { if (test() || Date.now() - t0 > max) resolve(); else setTimeout(loop, 250); })();
    });
  }
  function walkToP(target, speed) {
    return new Promise(function (resolve) {
      if (reduceMotion) {
        const tg = typeof target === 'function' ? target() : target;
        me.x = tg.x; me.y = tg.y; place(); resolve(); return;
      }
      walkTo(target, speed, resolve);
    });
  }
  // Point où se placer pour « montrer » un élément de la page : juste au-dessus.
  // L'élément est recherché à chaque image, car la page peut se redessiner pendant le trajet.
  function spotFor(find, side) {
    let lastSpot = null;
    return function () {
      const s = size();
      const el = find();
      if (!el) return lastSpot || { x: me.x, y: me.y };
      const r = el.getBoundingClientRect();
      const x = side === 'right' ? r.right - s.w * 0.6 : r.left + r.width / 2 - s.w / 2;
      lastSpot = {
        x: clamp(x, 4, window.innerWidth - s.w - 4),
        y: clamp(r.top - s.h + 14, 4, window.innerHeight - s.h - 4),
      };
      return lastSpot;
    };
  }
  function cardOf(id) {
    return function () {
      return Array.prototype.find.call(document.querySelectorAll('#agenda [data-ev]'), function (x) { return x.dataset.ev === id; }) || null;
    };
  }
  // Fait briller la carte du match quelques secondes (même si la page se redessine entre-temps).
  let spotTimer;
  function highlight(find) {
    clearInterval(spotTimer);
    document.querySelectorAll('.mascot-spot').forEach(function (x) { x.classList.remove('mascot-spot'); });
    const t0 = Date.now();
    spotTimer = setInterval(function () {
      const el = find();
      if (Date.now() - t0 > 5000) { clearInterval(spotTimer); if (el) el.classList.remove('mascot-spot'); return; }
      if (el && !el.classList.contains('mascot-spot')) el.classList.add('mascot-spot');
    }, 100);
  }

  let searchId = 0;
  async function search(query) {
    const id = ++searchId;
    const api = G();
    if (!api) return;
    wake();
    openBubble('<p class="mb-msg">🔎 Je cherche <b>' + esc(query) + '</b>…</p>');
    if (!api.isReady()) await until(api.isReady, 20000);
    let ev = api.findNext(query);
    const months = api.nextMonths(2);
    for (let i = 0; !ev && i < months.length; i++) {
      if (id !== searchId) return;
      openBubble('<p class="mb-msg">🔎 Je regarde plus loin dans le calendrier…</p>');
      await api.ensureMonth(months[i]);
      ev = api.findNext(query);
    }
    if (id !== searchId) return;
    if (!ev) {
      openBubble(askHTML('Oups, je ne trouve pas <b>' + esc(query) + '</b> dans les prochaines semaines 🤔<br>' +
        '<small>Essaie avec le nom d\'une équipe ou d\'un joueur de tennis (ex. : « Marseille », « Fils »).</small>'), 'input');
      setPose('is-looking');
      return;
    }
    guide(ev, id);
  }

  async function guide(ev, id) {
    const api = G();
    me.busy = true;
    closeBubbleQuiet();
    // En mode « rangé », Pitchoun sort de son bouton le temps de montrer le chemin.
    if (pet.hidden) {
      const r = dock.getBoundingClientRect();
      const s = size();
      me.x = clamp(r.left + r.width / 2 - s.w / 2, 0, window.innerWidth - s.w);
      me.y = clamp(r.top - s.h / 2, 0, window.innerHeight - s.h);
      pet.hidden = false;
      dock.classList.add('is-out');
      place();
      pet.classList.add('pop');
      await wait(350);
      pet.classList.remove('pop');
    }
    speak('Suis-moi ! 🏃', 1800);
    const key = ev.dayKey;
    api.showMonthOf(key);
    await wait(60);
    const cellOf = function () { return api.dayElement(key); };
    const cell = cellOf();
    if (cell) {
      cell.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center', inline: 'center' });
      await wait(reduceMotion ? 50 : 450);
      await walkToP(spotFor(cellOf), 320);
      if (id !== searchId) { me.busy = false; return; }
      setPose('is-happy');
      const c = cellOf();
      if (c) c.classList.add('mascot-tap');
      await wait(450);
    }
    const card = api.revealEvent(ev.id);
    if (card) {
      card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      await wait(reduceMotion ? 50 : 600);
      highlight(cardOf(ev.id));
      await walkToP(spotFor(cardOf(ev.id), 'right'), 320);
    }
    if (id !== searchId) { me.busy = false; return; }
    setPose('is-happy');
    me.busy = false;
    const d = api.describe(ev);
    openBubble('<button type="button" class="mb-close" data-mb="close" aria-label="Fermer">✕</button>' +
      '<p class="mb-msg">' + (d.live ? '🔴 Ça joue en ce moment !' : 'Voilà le prochain rendez-vous ! 🎉') + '</p>' +
      '<div class="mb-match"><b>' + esc(d.title) + '</b><span>' + esc(d.competition) + '</span>' +
      '<span class="mb-when">' + esc(d.when.charAt(0).toUpperCase() + d.when.slice(1)) + '</span>' +
      (d.channels.length ? '<span class="mb-ch">📺 ' + d.channels.map(esc).join(', ') + '</span>' : '') + '</div>' +
      '<div class="mb-actions"><button type="button" class="btn btn--primary" data-mb-ev="' + esc(ev.id) + '">Voir les chaînes</button>' +
      '<button type="button" class="btn" data-mb="again">Chercher autre chose</button></div>' + footer());
    idle(6000);
  }
  function closeBubbleQuiet() { bubble.classList.remove('show'); bubble.hidden = true; }

  function goBackToDock() {
    me.busy = true;
    const r = dock.getBoundingClientRect();
    const s = size();
    walkToP({ x: clamp(r.left + r.width / 2 - s.w / 2, 0, window.innerWidth - s.w), y: clamp(r.top - s.h / 3, 0, window.innerHeight - s.h) }, 260).then(function () {
      me.busy = false;
      if (conf.roaming) return;
      pet.hidden = true;
      dock.classList.remove('is-out');
      dock.hidden = false;
    });
  }

  // -------------------------------------------------------------------
  // Activer / désactiver
  // -------------------------------------------------------------------
  function show() {
    if (conf.roaming) {
      dock.hidden = true;
      if (pet.hidden) {
        pet.hidden = false;
        const h = homeSpot();
        me.x = h.x; me.y = h.y; me.facing = -1;
        place();
        pet.classList.add('pop');
        setTimeout(function () { pet.classList.remove('pop'); }, 400);
        idle(1500);
      }
    } else {
      if (!me.busy) pet.hidden = true;
      dock.hidden = false;
    }
  }

  function setRoaming(on) {
    conf.roaming = !!on;
    save();
    const settingsBox = document.querySelector('[data-mascot]');
    if (settingsBox) settingsBox.checked = conf.roaming;
    if (conf.roaming) {
      closeBubbleQuiet();
      if (pet.hidden) {
        // Il sort de son bouton.
        const r = dock.getBoundingClientRect();
        const s = size();
        pet.hidden = false;
        me.x = clamp(r.left - s.w / 2, 0, window.innerWidth - s.w);
        me.y = clamp(r.top - s.h / 2, 0, window.innerHeight - s.h);
        place();
        pet.classList.add('pop');
        setTimeout(function () { pet.classList.remove('pop'); }, 400);
      }
      dock.hidden = true;
      speak('Youpi, je me promène ! 🐾', 2200);
      idle(2200);
    } else {
      closeBubbleQuiet();
      if (!pet.hidden) {
        dock.hidden = false;
        dock.classList.add('is-out');
        speak('À plus tard ! 👋', 1500);
        goBackToDock();
      } else {
        dock.hidden = false;
      }
    }
  }

  window.Mascot = {
    isRoaming: function () { return conf.roaming; },
    setRoaming: setRoaming,
  };

  // Il arrive une fois la page affichée, sans gêner le chargement.
  setTimeout(function () {
    show();
    requestAnimationFrame(frame);
    if (conf.roaming && !conf.greeted) {
      setTimeout(function () { speak('Coucou ! Clique sur moi pour trouver un match 😉', 5000); }, 900);
      conf.greeted = true;
      save();
    }
  }, 1200);
})();
