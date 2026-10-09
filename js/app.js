/*
 * Le Guide Sport de Papa : interface.
 * Calendrier du mois, programme du jour, cartes « immanquables », chaînes TV.
 */
(function () {
  'use strict';

  const C = window.SportConfig;
  const D = window.SportData;
  const TZ = 'Europe/Paris';
  const LEAGUE_BY_KEY = {};
  C.LEAGUES.forEach(function (l) { LEAGUE_BY_KEY[l.key] = l; });

  // ===================================================================
  // Petits dessins (drapeaux, motifs des clubs)
  // ===================================================================
  const FLAGS = {
    fr: '<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>',
    us: '<svg viewBox="0 0 38 20"><rect width="38" height="20" fill="#fff"/><g fill="#b22234"><rect width="38" height="1.54"/><rect y="3.08" width="38" height="1.54"/><rect y="6.15" width="38" height="1.54"/><rect y="9.23" width="38" height="1.54"/><rect y="12.3" width="38" height="1.54"/><rect y="15.4" width="38" height="1.54"/><rect y="18.46" width="38" height="1.54"/></g><rect width="15.2" height="10.77" fill="#3c3b6e"/></svg>',
    uk: '<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" stroke-width="2.4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></svg>',
  };
  FLAGS.es = '<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#c60b1e"/><rect y=".5" width="3" height="1" fill="#ffc400"/></svg>';
  FLAGS.it = '<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/></svg>';
  const REGION_LABEL = { fr: 'France', es: 'Espagne', it: 'Italie', us: 'États-Unis', uk: 'Royaume-Uni' };
  const REGIONS = ['fr', 'es', 'it', 'us', 'uk'];

  // Croix occitane (Toulouse), arbre (Forest), étoiles (les Bleus), ballon ovale (Stade)
  const MOTIFS = {
    tfc: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 50 38 20h24zM50 50l30-12v24zM50 50l12 30H38zM50 50 20 62V38z"/>' +
      '<circle cx="38" cy="14" r="5"/><circle cx="50" cy="10" r="5"/><circle cx="62" cy="14" r="5"/>' +
      '<circle cx="86" cy="38" r="5"/><circle cx="90" cy="50" r="5"/><circle cx="86" cy="62" r="5"/>' +
      '<circle cx="38" cy="86" r="5"/><circle cx="50" cy="90" r="5"/><circle cx="62" cy="86" r="5"/>' +
      '<circle cx="14" cy="38" r="5"/><circle cx="10" cy="50" r="5"/><circle cx="14" cy="62" r="5"/></svg>',
    forest: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 8c-9 0-15 7-15 14-8 1-13 8-12 15-7 3-10 11-6 18 3 6 10 9 17 7 2 5 8 8 14 7v15h4V69c6 1 12-2 14-7 7 2 14-1 17-7 4-7 1-15-6-18 1-7-4-14-12-15 0-7-6-14-15-14z"/>' +
      '<path d="M14 86c6-4 12-4 18 0s12 4 18 0 12-4 18 0 12 4 18 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M14 95c6-4 12-4 18 0s12 4 18 0 12-4 18 0 12 4 18 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
    // Deux étoiles (1998, 2018) au-dessus d'une coupe
    france: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M30 4l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4L30 27.9l-9.4 4.9 1.8-10.4-7.6-7.4 10.5-1.5z"/><path d="M70 4l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4L70 27.9l-9.4 4.9 1.8-10.4-7.6-7.4 10.5-1.5z"/>' +
      '<path d="M32 40h36v8c0 11-7 19-15 21v9h9v6H38v-6h9v-9c-8-2-15-10-15-21z"/><path d="M32 44h-8c0 9 5 14 11 15M68 44h8c0 9-5 14-11 15" fill="none" stroke="currentColor" stroke-width="4"/><rect x="34" y="88" width="32" height="7" rx="2"/></svg>',
    stade: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><ellipse cx="50" cy="50" rx="44" ry="26" transform="rotate(-30 50 50)"/><path d="M28 72 72 28M42 50l8 8M48 44l8 8M54 38l8 8" stroke-linecap="round"/></svg>',
    custom: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 6l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z"/></svg>',
  };

  // ===================================================================
  // Dates (tout est calculé à l'heure de Paris)
  // ===================================================================
  const fmtKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const fmtTime = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
  const fmtTimeNY = new Intl.DateTimeFormat('fr-FR', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
  const fmtTimeLDN = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
  const fmtKeyNY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
  const fmtLongDay = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
  const fmtShortDay = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
  const fmtMonth = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', month: 'long', year: 'numeric' });
  const fmtWd = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'short' });

  function dayKey(date) { return fmtKey.format(date instanceof Date ? date : new Date(date)); }
  function todayKey() { return dayKey(new Date()); }
  function keyToUTC(key) { const p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function addDays(key, n) { const d = keyToUTC(key); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function weekdayOf(key) { return keyToUTC(key).getUTCDay(); }
  function monthOf(key) { return key.slice(0, 7); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function hhmm(d) { return fmtTime.format(d).replace(':', 'h'); }

  function addMonths(ym, n) {
    const p = ym.split('-');
    const d = new Date(Date.UTC(+p[0], +p[1] - 1 + n, 1));
    return d.toISOString().slice(0, 7);
  }

  function relativeDay(key) {
    const t = todayKey();
    if (key === t) return "Aujourd'hui";
    if (key === addDays(t, 1)) return 'Demain';
    if (key === addDays(t, -1)) return 'Hier';
    return '';
  }

  function countdown(ev) {
    const st = ev.status.state;
    if (st === 'in') return 'En direct';
    if (st === 'post') return 'Terminé';
    if (ev.status.postponed) return 'Reporté';
    const diff = new Date(ev.start) - Date.now();
    if (diff <= 0) return 'Ça commence !';
    const min = Math.round(diff / 60000);
    if (min < 60) return 'dans ' + min + ' min';
    const h = Math.floor(min / 60), m = min % 60;
    if (h < 24) return 'dans ' + h + ' h ' + String(m).padStart(2, '0');
    const days = Math.round((keyToUTC(ev.dayKey) - keyToUTC(todayKey())) / 86400000);
    return 'dans ' + days + ' jour' + (days > 1 ? 's' : '');
  }

  // ===================================================================
  // Préférences (mémorisées dans le navigateur)
  // ===================================================================
  const PREFS_KEY = 'guide-sport-papa:prefs:v1';
  const defaults = {
    theme: 'bleus',
    bigText: false,
    onlyBig: false,
    sports: { foot: true, tennis: true, rugby: true, f1: true, nba: true, nfl: true },
    regions: { fr: true, es: true, it: true, us: true, uk: true },
    favOff: {},
    custom: [],
    subs: {},
    subsSet: false,
    onlyMine: false,
  };
  const prefs = loadPrefs();

  function loadPrefs() {
    try {
      const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
      return Object.assign({}, defaults, raw, {
        sports: Object.assign({}, defaults.sports, raw.sports),
        regions: Object.assign({}, defaults.regions, raw.regions),
        favOff: Object.assign({}, raw.favOff),
        subs: Object.assign({}, raw.subs),
        custom: Array.isArray(raw.custom) ? raw.custom : [],
      });
    } catch (e) {
      return JSON.parse(JSON.stringify(defaults));
    }
  }
  function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* stockage indisponible */ }
  }

  function activeFavorites() {
    const list = C.FAVORITES.filter(function (f) { return !prefs.favOff[f.id]; });
    prefs.custom.forEach(function (txt) { list.push(C.makeCustomFavorite(txt)); });
    return list;
  }

  // ===================================================================
  // Données
  // ===================================================================
  const state = {
    month: monthOf(todayKey()),
    selected: todayKey(),
    mode: 'day',             // day | weekend
    query: '',
    events: new Map(),
    loading: new Set(),
    fromCache: new Set(),
    errors: new Set(),
    retried: new Set(),
    lastUpdate: null,
    usingSnapshot: false,
    expanded: new Set(),
  };
  let favorites = activeFavorites();

  function enrich(ev) {
    const league = LEAGUE_BY_KEY[ev.league];
    if (!league) return null;
    ev.dayKey = dayKey(ev.start);
    // Un match affiché « en direct » depuis plus de 6 h (données anciennes) est forcément fini.
    if (ev.status.state === 'in' && Date.now() - new Date(ev.start) > 6 * 3600000) {
      ev.status = Object.assign({}, ev.status, { state: 'post', detail: '' });
    }
    ev.rating = C.rate(ev, league, favorites);
    ev.channels = C.channelsFor(ev, league);
    ev.note = typeof league.note === 'function' ? league.note(ev) : (league.note || '');
    return ev;
  }

  function rerateAll() {
    favorites = activeFavorites();
    state.events.forEach(function (ev) { ev.rating = C.rate(ev, LEAGUE_BY_KEY[ev.league], favorites); });
  }

  function putEvents(list, src) {
    list.forEach(function (raw) {
      const ev = enrich(Object.assign({}, raw, { src: src }));
      if (ev) state.events.set(ev.id, ev);
    });
  }

  function dropSource(src, leagueKey, ym) {
    state.events.forEach(function (ev, id) {
      if (ev.src === src) state.events.delete(id);
      else if (ev.src === 'snapshot' && ev.league === leagueKey && ev.start.slice(0, 7).replace('-', '') === ym) state.events.delete(id);
    });
  }

  // --- Cache local (évite de tout retélécharger à chaque ouverture) ---
  const CACHE_PREFIX = 'guide-sport-papa:cache:v2:';
  function cacheGet(k) {
    try { return JSON.parse(localStorage.getItem(CACHE_PREFIX + k) || 'null'); } catch (e) { return null; }
  }
  function cacheSet(k, events) {
    const payload = JSON.stringify({ t: Date.now(), events: events });
    try { localStorage.setItem(CACHE_PREFIX + k, payload); }
    catch (e) {
      // Plein : on fait le ménage dans les vieux mois puis on réessaie.
      try {
        Object.keys(localStorage).filter(function (x) { return x.indexOf(CACHE_PREFIX) === 0; })
          .forEach(function (x) { localStorage.removeItem(x); });
        localStorage.setItem(CACHE_PREFIX + k, payload);
      } catch (e2) { /* tant pis */ }
    }
  }
  // Ménage : les caches d'anciennes versions de l'appli peuvent contenir des erreurs corrigées depuis.
  try {
    Object.keys(localStorage).forEach(function (x) {
      if (x.indexOf('guide-sport-papa:cache:') === 0 && x.indexOf(CACHE_PREFIX) !== 0) localStorage.removeItem(x);
    });
  } catch (e) { /* stockage indisponible */ }

  function cacheTTL(ym) {
    const cur = todayKey().slice(0, 7).replace('-', '');
    if (ym === cur) return 10 * 60 * 1000;          // mois en cours : 10 min
    if (ym < cur) return 24 * 60 * 60 * 1000;       // passé : 1 jour
    return 3 * 60 * 60 * 1000;                      // à venir : 3 h
  }

  // --- File de téléchargement (6 en parallèle max) ---
  // Priorité 0 : ce qui s'affiche tout de suite (mois affiché, scores en direct).
  // Priorité 1 : classements. Priorité 2 : mois passés, utiles seulement pour la forme.
  const queue = [];
  let running = 0;
  function enqueue(job, prio) {
    job.prio = prio || 0;
    let i = queue.length;
    while (i > 0 && queue[i - 1].prio > job.prio) i--;
    queue.splice(i, 0, job);
    pump();
  }
  function pump() {
    while (running < 6 && queue.length) {
      const job = queue.shift();
      running++;
      job().catch(function () {}).then(function () { running--; pump(); });
    }
  }

  function loadMonth(ym, force, onlyKeys, prio) {
    const espnYm = ym.replace('-', '');
    C.LEAGUES.forEach(function (league) {
      if (onlyKeys && onlyKeys.indexOf(league.key) === -1) return;
      // Sport masqué dans les filtres : inutile de le télécharger (il le sera si on le réaffiche).
      if (!prefs.sports[league.sport]) return;
      const k = league.key + '|' + espnYm;
      const cached = cacheGet(k);
      if (cached && !state.fromCache.has(k)) {
        dropSource(k, league.key, espnYm);
        putEvents(cached.events, k);
      }
      state.fromCache.add(k);
      const fresh = cached && Date.now() - cached.t < cacheTTL(espnYm);
      if (fresh && !force) return;
      if (state.loading.has(k)) return;
      state.loading.add(k);
      enqueue(function () {
        return D.fetchLeague(league, espnYm).then(function (events) {
          dropSource(k, league.key, espnYm);
          putEvents(events, k);
          cacheSet(k, events);
          state.errors.delete(k);
          state.lastUpdate = new Date();
        }, function () {
          state.errors.add(k);
          // Le calendrier ne répond pas toujours du premier coup : nouvel essai dans 20 s.
          if (!state.retried.has(k)) {
            state.retried.add(k);
            setTimeout(function () { loadMonth(ym, true, [league.key], prio); }, 20000);
          }
        }).then(function () {
          state.loading.delete(k);
          scheduleRender();
        });
      }, prio);
    });
    scheduleRender();
  }

  // Copie de secours du programme, chargée seulement si le calendrier en ligne ne répond pas.
  function loadSnapshot() {
    if (state.snapshotRequested) return;
    state.snapshotRequested = true;
    const s = document.createElement('script');
    s.src = 'data/snapshot.js';
    s.onload = function () {
      const snap = window.SPORT_SNAPSHOT;
      if (!snap || !Array.isArray(snap.events)) return;
      state.snapshotDate = snap.generated;
      // On ne remplace pas ce qui est déjà arrivé en direct ou depuis le cache.
      const have = new Set();
      state.events.forEach(function (ev) { have.add(ev.league + '|' + ev.start.slice(0, 7)); });
      putEvents(snap.events.filter(function (ev) {
        return !have.has(ev.league + '|' + ev.start.slice(0, 7));
      }), 'snapshot');
      scheduleRender();
    };
    document.head.appendChild(s);
  }

  // Rafraîchit en direct les matchs du jour (scores) toutes les minutes.
  const liveStamp = {};
  function liveRefresh() {
    const now = Date.now();
    const need = new Map();
    state.events.forEach(function (ev) {
      if (ev.kind === 'tournament') return;
      const t = new Date(ev.start).getTime();
      const hot = ev.status.state === 'in' || (ev.status.state === 'pre' && t - now < 20 * 60000 && now - t < 4 * 3600000);
      if (!hot) return;
      const league = LEAGUE_BY_KEY[ev.league];
      const d = fmtKeyNY.format(new Date(ev.start)).replace(/-/g, '');
      need.set(league.key + '|' + d, { league: league, d: d });
    });
    need.forEach(function (job, k) {
      // Les flux tennis sont lourds (tout le tournoi) : toutes les 5 minutes suffisent.
      const every = job.league.kind === 'tennis' ? 5 * 60000 : 55000;
      if (now - (liveStamp[k] || 0) < every) return;
      liveStamp[k] = now;
      enqueue(function () {
        return D.fetchLeague(job.league, job.d).then(function (events) {
          events.forEach(function (raw) {
            const old = state.events.get(raw.id);
            const ev = enrich(Object.assign({}, raw, { src: old ? old.src : 'live' }));
            if (ev) state.events.set(ev.id, ev);
          });
          state.lastUpdate = new Date();
          scheduleRender();
        });
      });
    });
  }

  function allEvents() {
    const out = [];
    state.events.forEach(function (ev) { out.push(ev); });
    return out;
  }

  // Match jamais commencé alors que l'heure est passée depuis longtemps :
  // entrée « fantôme » du calendrier (ou match annulé sans mise à jour).
  function isGhost(ev) {
    if (ev.status.state !== 'pre' || ev.status.postponed) return false;
    const end = ev.kind === 'tournament' && ev.end ? new Date(ev.end) : new Date(ev.start);
    return Date.now() - end > 8 * 3600000;
  }

  function visible(ev) {
    if (!prefs.sports[ev.sport]) return false;
    if (isGhost(ev)) return false;
    if (prefs.onlyBig && ev.rating.level < 2) return false;
    if (prefs.onlyMine && prefs.subsSet && !canWatch(ev)) return false;
    return true;
  }

  function eventsOfDay(key) {
    return allEvents().filter(function (ev) { return ev.dayKey === key && visible(ev); });
  }

  // ===================================================================
  // Rendu
  // ===================================================================
  const $ = function (sel) { return document.querySelector(sel); };
  let renderPending = false;
  let lastRender = 0;
  function scheduleRender() {
    if (renderPending) return;
    renderPending = true;
    // Pendant le chargement, les calendriers arrivent un par un : on redessine
    // au plus deux fois par seconde au lieu d'une fois par compétition.
    const wait = state.loading.size ? Math.max(0, 500 - (Date.now() - lastRender)) : 0;
    setTimeout(function () {
      requestAnimationFrame(function () { renderPending = false; lastRender = Date.now(); render(); });
    }, wait);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function sportIcon(sport) {
    const s = C.SPORTS.find(function (x) { return x.key === sport; });
    return s ? s.icon : '';
  }

  function render() {
    renderGreeting();
    renderHero();
    renderUpcoming();
    renderTeams();
    renderCalendar();
    renderAgenda();
    renderStatus();
  }

  // ----------------------------------------------------------- Chaînes
  // Abonnements de Papa (France) : les chaînes gratuites comptent toujours.
  function owns(name) {
    const meta = C.CHANNELS[name] || {};
    if (meta.free) return true;
    return C.SUBSCRIPTIONS.some(function (sub) { return prefs.subs[sub.key] && sub.match.test(name); });
  }
  function canWatch(ev) {
    return (ev.channels.fr || []).some(owns);
  }

  function chip(name, region) {
    const meta = C.CHANNELS[name] || {};
    const style = '--chbg:' + (meta.bg || '#333') + ';--chfg:' + (meta.fg || '#fff');
    const mine = region === 'fr' && prefs.subsSet && owns(name);
    const title = (mine ? 'Vous l\'avez · ' : '') + (meta.free ? 'Chaîne gratuite' : (meta.web ? 'Application / streaming' : 'Chaîne payante'));
    return '<span class="ch' + (mine ? ' ch--mine' : '') + '" style="' + style + '" title="' + title + '">' +
      (mine ? '<span class="tick" aria-hidden="true">✓</span>' : '') + esc(name) +
      (meta.free ? '<span class="free">gratuit</span>' : '') + '</span>';
  }

  function channelsHTML(ev, opts) {
    opts = opts || {};
    const lines = [];
    REGIONS.forEach(function (r) {
      if (!prefs.regions[r]) return;
      const list = (ev.channels[r] || []).slice(0, opts.max || 2);
      const content = list.length ? list.map(function (n) { return chip(n, r); }).join('') : '<span class="ch-none">Pas de diffusion connue</span>';
      lines.push('<div class="ch-line"><span class="flag" title="' + REGION_LABEL[r] + '">' + FLAGS[r] + '</span><span class="chs">' + content + '</span></div>');
    });
    return '<div class="channels">' + lines.join('') + '</div>';
  }

  // ----------------------------------------------------------- Équipes
  function logo(t, size) {
    if (t && t.logo) return '<img src="' + esc(t.logo) + '" alt="" loading="lazy" width="' + size + '" height="' + size + '" onerror="this.style.visibility=\'hidden\'">';
    return '<span class="logo-ph" style="width:' + size + 'px;height:' + size + 'px">' + esc((t && t.name || '?').charAt(0)) + '</span>';
  }

  function teamLine(t, ev) {
    const showScore = ev.status.state !== 'pre' && t.score !== '';
    let cls = 'team';
    if (ev.status.state === 'post' && (ev.home.winner || ev.away.winner)) cls += t.winner ? ' is-winner' : ' is-loser';
    const fr = ev.sport === 'tennis' && t.country === 'France' ? ' <span class="fr-pill">' + FLAGS.fr.replace('<svg', '<svg width="14" height="10"') + ' FRA</span>' : '';
    return '<div class="' + cls + '">' + logo(t, 24) + '<span class="nm">' + esc(t.name) + '</span>' + fr +
      (showScore ? '<span class="sc">' + esc(t.score) + '</span>' : '') + '</div>';
  }

  function timeHTML(ev) {
    if (ev.status.state === 'in') {
      const big = ev.sport === 'foot' && ev.status.clock ? esc(ev.status.clock) : hhmm(new Date(ev.start));
      return '<div class="ev-time">' + big + '<small><span class="live">EN DIRECT</span></small></div>';
    }
    if (!ev.timeValid) return '<div class="ev-time"><span class="tbd">Horaire<br>à venir</span></div>';
    const d = new Date(ev.start);
    let small = '';
    if (ev.status.state === 'post') small = '<small>Terminé</small>';
    else if (ev.status.postponed) small = '<small>Reporté</small>';
    return '<div class="ev-time">' + hhmm(d) + small + '</div>';
  }

  function competitionLabel(ev) {
    const league = LEAGUE_BY_KEY[ev.league];
    if (ev.sport === 'tennis') return ev.tournament;
    if (ev.sport === 'f1') return 'F1 · ' + ev.title;
    return league.short;
  }

  function mainHTML(ev, withComp) {
    let body;
    if (ev.home && ev.away) {
      body = '<div class="teams">' + teamLine(ev.home, ev) + teamLine(ev.away, ev) + '</div>';
    } else {
      body = '<div class="title-line">' + esc(ev.sport === 'f1' ? ev.round : (ev.title || '')) + '</div>';
    }
    const meta = [];
    if (withComp) meta.push(sportIcon(ev.sport) + ' ' + esc(competitionLabel(ev)));
    if (ev.round && !(ev.sport === 'f1' && !(ev.home && ev.away))) meta.push(esc(ev.round));
    if (ev.sport === 'tennis' && ev.draw && ev.kind !== 'tournament') meta.push(esc(ev.draw));
    if (ev.venue) meta.push(esc(ev.venue));
    return '<div class="ev-main">' + body + '<div class="meta">' + meta.join('<span class="sep">·</span>') + '</div></div>';
  }

  function rowHTML(ev, withComp) {
    const french = ev.sport === 'tennis' && ((ev.home && ev.home.country === 'France') || (ev.away && ev.away.country === 'France'));
    return '<article class="row' + (french ? ' is-french' : '') + '" data-ev="' + esc(ev.id) + '" tabindex="0">' +
      '<div class="ev">' + timeHTML(ev) + mainHTML(ev, withComp) + channelsHTML(ev) + '</div></article>';
  }

  function favCardHTML(ev) {
    const fav = ev.rating.fav;
    const theme = fav ? fav.theme : 'hot';
    const badge = fav ? fav.badge : (ev.rating.reasons[0] || 'Immanquable');
    return '<article class="fav-card theme-' + theme + '" data-ev="' + esc(ev.id) + '" tabindex="0">' +
      '<div class="fav-inner">' +
      '<div class="fav-motif" style="color:var(--c2)">' + (MOTIFS[theme] || MOTIFS.custom) + '</div>' +
      '<div class="fav-ribbon"><span class="fire">🔥</span> Immanquable · ' + esc(badge) + '</div>' +
      '<div class="ev" style="margin-top:12px">' + timeHTML(ev) + mainHTML(ev, true) + channelsHTML(ev, { max: 4 }) + '</div>' +
      '</div></article>';
  }

  function hotCardHTML(ev) {
    const why = ev.rating.reasons.filter(Boolean)[0] || 'À suivre';
    return '<article class="hot-card" data-ev="' + esc(ev.id) + '" tabindex="0">' +
      '<div class="hot-tag">⭐ ' + esc(why) + '</div>' +
      '<div class="ev">' + timeHTML(ev) + mainHTML(ev, true) + channelsHTML(ev) + '</div></article>';
  }

  // ----------------------------------------------------------- À la une
  function pickHero() {
    const now = Date.now();
    const horizon = now + 8 * 86400000;
    const candidates = allEvents().filter(function (ev) {
      if (!visible(ev) || ev.rating.level < 2 || ev.kind === 'tournament') return false;
      const t = new Date(ev.start).getTime();
      if (ev.status.state === 'in') return true;
      if (ev.status.state === 'post') return false;
      return t > now - 3 * 3600000 && t < horizon;
    });
    // Les équipes de cœur d'abord, puis ce qui est en direct, puis le plus proche.
    candidates.sort(function (a, b) {
      if (a.rating.level !== b.rating.level) return b.rating.level - a.rating.level;
      const ia = a.status.state === 'in' ? 1 : 0, ib = b.status.state === 'in' ? 1 : 0;
      if (ia !== ib) return ib - ia;
      return new Date(a.start) - new Date(b.start);
    });
    return candidates[0] || null;
  }

  function scoreText(ev) {
    if (ev.sport === 'tennis') {
      const a = (ev.home.score || '').split(' '), b = (ev.away.score || '').split(' ');
      return a.map(function (x, i) { return x + '-' + (b[i] || '0'); }).join('  ');
    }
    return (ev.home.score || '0') + ' – ' + (ev.away.score || '0');
  }

  function heroKicker(ev) {
    if (ev.status.state === 'in') return '<span class="live" style="font-size:20px">EN DIRECT</span>';
    const rel = relativeDay(ev.dayKey);
    const h = +fmtTime.format(new Date(ev.start)).slice(0, 2);
    if (rel === "Aujourd'hui") return h >= 18 ? 'Ce soir' : "Aujourd'hui";
    if (rel === 'Demain') return h >= 18 ? 'Demain soir' : 'Demain';
    return cap(fmtLongDay.format(keyToUTC(ev.dayKey)));
  }

  function renderHero() {
    const el = $('#hero');
    const ev = pickHero();
    if (!ev) { el.innerHTML = ''; return; }
    const fav = ev.rating.fav;
    const theme = fav ? fav.theme : 'hot';
    const badge = fav ? fav.badge : (ev.rating.reasons[0] || 'À ne pas manquer');
    let match;
    if (ev.home && ev.away) {
      const live = ev.status.state !== 'pre';
      const mid = live
        ? '<div class="hero-score">' + esc(scoreText(ev)) + '</div>'
        : '<div class="hero-time">' + (ev.timeValid ? hhmm(new Date(ev.start)) : 'À venir') + '</div>';
      match = '<div class="hero-match">' +
        '<div class="hero-team">' + logo(ev.home, 68) + '<span class="name">' + esc(ev.home.name) + '</span></div>' +
        '<div class="hero-mid">' + mid + '<div class="hero-count" data-countdown="' + esc(ev.id) + '">' + countdown(ev) + '</div></div>' +
        '<div class="hero-team away">' + logo(ev.away, 68) + '<span class="name">' + esc(ev.away.name) + '</span></div>' +
        '</div>';
    } else {
      match = '<div class="hero-title">' + esc(ev.title) + ' · ' + esc(ev.round) + '</div>' +
        '<div class="hero-count" data-countdown="' + esc(ev.id) + '">' + (ev.timeValid ? hhmm(new Date(ev.start)) + ' · ' : '') + countdown(ev) + '</div>';
    }
    el.innerHTML =
      '<div class="hero-card theme-' + theme + '"><div class="hero-inner">' +
      '<div class="hero-motif" style="color:var(--c2)">' + (MOTIFS[theme] || MOTIFS.custom) + '</div>' +
      '<div class="hero-top"><div class="hero-kicker"><span class="fire">🔥</span>' + heroKicker(ev) + '</div>' +
      '<div class="fav-ribbon">' + esc(badge) + '</div></div>' +
      '<div class="hero-comp">' + sportIcon(ev.sport) + ' ' + esc(LEAGUE_BY_KEY[ev.league].name) + (ev.round ? ' · ' + esc(ev.round) : '') + (ev.venue ? ' · ' + esc(ev.venue) : '') + '</div>' +
      match +
      '<div class="hero-bottom"><div class="hero-channels">' + channelsHTML(ev, { max: 4 }) + '</div>' +
      '<div class="hero-actions"><button class="btn btn--primary" data-ics="' + esc(ev.id) + '">📅 Me le rappeler</button>' +
      '<button class="btn" data-ev="' + esc(ev.id) + '">Détails</button></div></div>' +
      '</div></div>';
  }

  // ----------------------------------------------------------- Prochains immanquables
  function renderUpcoming() {
    const el = $('#upcoming');
    if (!el) return;
    const hero = pickHero();
    const now = Date.now();
    const list = allEvents().filter(function (ev) {
      return ev.rating.level >= 3 && visible(ev) && ev.status.state === 'pre' && (!hero || ev.id !== hero.id) &&
        new Date(ev.start) > now - 3600000 && new Date(ev.start) < now + 30 * 86400000;
    }).sort(sortByTime).slice(0, 10);
    if (!list.length) { el.innerHTML = ''; return; }
    el.innerHTML = '<div class="section-title">🔥 Prochains immanquables</div><div class="up-strip">' + list.map(function (ev) {
      const theme = ev.rating.fav ? ev.rating.fav.theme : 'hot';
      const rel = relativeDay(ev.dayKey);
      const when = (rel || cap(fmtShortDay.format(keyToUTC(ev.dayKey)).replace('.', ''))) +
        (ev.timeValid ? ' · ' + hhmm(new Date(ev.start)) : '');
      const fr = (ev.channels.fr || [])[0];
      const teams = ev.home && ev.away
        ? '<span class="up-team">' + logo(ev.home, 20) + esc(ev.home.name) + '</span>' +
          '<span class="up-team">' + logo(ev.away, 20) + esc(ev.away.name) + '</span>'
        : '<span class="up-team">' + esc(ev.title || '') + '</span>';
      return '<button class="up-card theme-' + theme + '" data-day="' + ev.dayKey + '" data-focus="' + esc(ev.id) + '">' +
        '<span class="up-when">' + esc(when) + '</span>' + teams +
        '<span class="up-ch">' + (fr ? chip(fr, 'fr') : '<span class="ch-none">Chaîne à venir</span>') + '</span></button>';
    }).join('') + '</div>';
  }

  // ----------------------------------------------------------- Le petit mot du fiston
  const GREET_KEY = 'guide-sport-papa:greet:v1';
  function greetState() {
    try { return JSON.parse(localStorage.getItem(GREET_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveGreet(st) {
    try { localStorage.setItem(GREET_KEY, JSON.stringify(st)); } catch (e) { /* tant pis */ }
  }

  function favSummary() {
    const now = Date.now();
    const today = todayKey();
    const favs = allEvents().filter(function (ev) {
      return ev.rating.fav && !isGhost(ev) && ev.status.state !== 'post' && new Date(ev.start) > now - 3 * 3600000;
    }).sort(sortByTime);
    const label = function (ev) {
      const what = ev.home && ev.away ? ev.home.name + ' – ' + ev.away.name : ev.title;
      const ch = (ev.channels.fr || [])[0];
      return '<b>' + esc(what) + '</b>' + (ev.timeValid ? ' à ' + hhmm(new Date(ev.start)) : '') + (ch ? ' sur ' + esc(ch) : '');
    };
    const todays = favs.filter(function (ev) { return ev.dayKey === today; });
    if (todays.length) {
      return (todays[0].status.state === 'in' ? '🔴 En ce moment : ' : '📺 Aujourd\'hui : ') + todays.map(label).join(', puis ');
    }
    if (favs.length) {
      const ev = favs[0];
      const rel = relativeDay(ev.dayKey);
      return '📅 Prochain rendez-vous : ' + label(ev) + ', ' + (rel ? rel.toLowerCase() : fmtLongDay.format(keyToUTC(ev.dayKey)));
    }
    return '';
  }

  function renderGreeting() {
    const el = $('#greeting');
    if (!el) return;
    const st = greetState();
    if (st.dismissed === todayKey()) { el.innerHTML = ''; return; }
    const h = +fmtTime.format(new Date()).slice(0, 2);
    const evening = h >= 18 || h < 4;
    const summary = state.firstLoadDone ? favSummary() : '';
    el.innerHTML = '<div class="greet">' +
      '<span class="greet-emo" aria-hidden="true">' + (evening ? '🌙' : '☀️') + '</span>' +
      '<div class="greet-text"><p class="greet-title">' + (evening ? 'Bonne soirée Papa !' : 'Bonne journée Papa !') + '</p>' +
      '<p class="greet-from">de la part de ton fiston ❤️</p>' +
      (summary ? '<p class="greet-sum">' + summary + '</p>' : '') + '</div>' +
      '<button class="icon-btn small greet-close" data-greet-close aria-label="Masquer le message pour aujourd\'hui">✕</button></div>';
  }

  // Première ouverture : la surprise !
  function welcomeOnce() {
    const st = greetState();
    if (st.welcomed) return;
    const dlg = $('#welcome-dialog');
    if (!dlg) return;
    dlg.innerHTML =
      '<div class="welcome">' +
      '<div class="welcome-gift" aria-hidden="true">🎁</div>' +
      '<h3>Surprise, Papa !</h3>' +
      '<p>Je t\'ai fabriqué <b>ton propre guide du sport</b> : tous les matchs, et surtout <b>sur quelle chaîne les regarder</b>.</p>' +
      '<p>Les Bleus, le Téfécé, le Stade et Forest sont mis en avant 🔥, avec leurs résultats et leur classement, tenus à jour tout seuls.</p>' +
      '<p class="welcome-sign">Bonne journée, et bons matchs !<br><b>Ton fiston ❤️</b></p>' +
      '<button class="btn btn--primary welcome-go" data-welcome-go>C\'est parti ! ⚽</button>' +
      '</div>';
    showDialog(dlg);
    confetti();
  }

  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#0055a4', '#ffffff', '#ef4135', '#7b3fb8', '#f2c230', '#e2001a', '#dd0000'];
    const box = document.createElement('div');
    box.className = 'confetti';
    for (let i = 0; i < 110; i++) {
      const c = document.createElement('i');
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.9) + 's';
      c.style.animationDuration = (2.4 + Math.random() * 1.8) + 's';
      c.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
      box.appendChild(c);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 5200);
  }

  // ----------------------------------------------------------- Mes équipes (forme & classement)
  const STD_PREFIX = 'guide-sport-papa:std:v1:';
  // Zones du classement (libellés ESPN en anglais), du plus précis au plus général
  const ZONES_FR = [
    [/champions league qualif/i, 'Barrages Ligue des Champions'], [/champions league/i, 'Ligue des Champions'],
    [/europa league qualif/i, 'Barrages Ligue Europa'], [/europa league/i, 'Ligue Europa'],
    [/conference league qualif/i, 'Barrages Ligue Conférence'], [/conference league/i, 'Ligue Conférence'],
    [/qualifies for qfs.*promotion playoffs/i, 'Barrages (quarts ou montée)'], [/qualifies for qfs/i, 'Quarts de finale ou montée'],
    [/relegation play/i, 'Barrage de relégation'], [/relegation/i, 'Relégation'],
    [/promotion/i, 'Montée'], [/play-?off/i, 'Phase finale'],
  ];
  function zoneFr(label) {
    for (let i = 0; i < ZONES_FR.length; i++) if (ZONES_FR[i][0].test(label || '')) return ZONES_FR[i][1];
    return label || '';
  }

  function loadStandings(force) {
    state.standings = state.standings || {};
    C.TEAM_PANELS.forEach(function (panel) {
      const cfg = panel.standings;
      if (!cfg || prefs.favOff[panel.fav]) return;
      const k = STD_PREFIX + cfg.path;
      let cached = null;
      try { cached = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { /* rien */ }
      if (cached && !state.standings[cfg.path]) state.standings[cfg.path] = cached.data;
      if (cached && !force && Date.now() - cached.t < 30 * 60000) return;
      if (state.loading.has(k)) return;
      state.loading.add(k);
      enqueue(function () {
        return D.fetchStandings(cfg.path, cfg).then(function (data) {
          state.standings[cfg.path] = data;
          try { localStorage.setItem(k, JSON.stringify({ t: Date.now(), data: data })); } catch (e) { /* plein */ }
        }, function () { /* on garde l'ancien classement */ }).then(function () {
          state.loading.delete(k);
          scheduleRender();
        });
      }, 1);
    });
  }

  function standingOf(panel) {
    if (!panel.standings || !state.standings) return null;
    const data = state.standings[panel.standings.path];
    if (!data) return null;
    for (let i = 0; i < data.groups.length; i++) {
      const g = data.groups[i];
      for (let j = 0; j < g.entries.length; j++) {
        if (g.entries[j].teamId === panel.teamId) return { group: g, entry: g.entries[j] };
      }
    }
    return null;
  }

  // Le côté (domicile / extérieur) de l'équipe de cœur dans un match
  function favSide(fav, ev) {
    const blank = { name: '', raw: '' };
    if (fav.test(Object.assign({}, ev, { away: blank }))) return 'home';
    if (fav.test(Object.assign({}, ev, { home: blank }))) return 'away';
    return null;
  }

  function formOf(fav) {
    return allEvents().filter(function (ev) {
      return ev.home && ev.away && ev.status.state === 'post' && fav.test(ev);
    }).sort(function (a, b) { return new Date(b.start) - new Date(a.start); }).slice(0, 5).reverse().map(function (ev) {
      const side = favSide(fav, ev) || 'home';
      const me = ev[side], them = ev[side === 'home' ? 'away' : 'home'];
      let res = 'N';
      if (me.winner) res = 'V';
      else if (them.winner) res = 'D';
      else if (me.score !== '' && them.score !== '' && +me.score !== +them.score) res = +me.score > +them.score ? 'V' : 'D';
      return {
        res: res, ev: ev,
        tip: ev.home.name + ' ' + ev.home.score + '–' + ev.away.score + ' ' + ev.away.name + ' · ' +
          competitionLabel(ev) + ' · ' + fmtShortDay.format(keyToUTC(ev.dayKey)),
      };
    });
  }

  function nextOf(fav) {
    const now = Date.now();
    return allEvents().filter(function (ev) {
      return fav.test(ev) && !isGhost(ev) && ev.status.state !== 'post' && new Date(ev.start) > now - 3 * 3600000;
    }).sort(sortByTime)[0] || null;
  }

  function ordinal(n) { return n === 1 ? '1er' : n + 'e'; }

  function renderTeams() {
    const el = $('#teams');
    if (!el) return;
    const favById = {};
    C.FAVORITES.forEach(function (f) { favById[f.id] = f; });
    const cards = C.TEAM_PANELS.filter(function (p) { return !prefs.favOff[p.fav] && favById[p.fav]; }).map(function (panel) {
      const fav = favById[panel.fav];
      const st = standingOf(panel);
      const form = formOf(fav);
      const next = nextOf(fav);
      if (!st && !form.length && !next) return '';
      const logoUrl = st ? st.entry.logo : ((form[0] && form[0].ev[favSide(fav, form[0].ev) || 'home'].logo) || '');
      const rank = st
        ? '<button class="team-rank" data-table="' + esc(panel.fav) + '" title="Voir le classement complet">' +
          '<b>' + ordinal(st.entry.rank) + '</b> ' + esc(panel.standings.label) +
          (st.group.entries.length < 10 ? ' · ' + esc(st.group.name) : '') +
          ' <span>· ' + esc(st.entry.points) + ' pts · ' + esc(st.entry.played) + ' j.</span> <span class="chev">›</span></button>'
        : '';
      const formHTML = form.length
        ? '<div class="form" aria-label="5 derniers résultats">' + form.map(function (f) {
            return '<span class="form-pill form-' + f.res + '" title="' + esc(f.tip) + '" data-ev="' + esc(f.ev.id) + '">' + f.res + '</span>';
          }).join('') + '<span class="form-lbl" title="Du plus ancien (à gauche) au plus récent (à droite)">derniers résultats →</span></div>'
        : '<div class="form"><span class="form-lbl">Pas encore de résultat ce mois-ci</span></div>';
      let nextHTML = '';
      if (next) {
        const side = favSide(fav, next);
        const opp = next.home && next.away ? next[side === 'away' ? 'home' : 'away'] : null;
        const rel = relativeDay(next.dayKey);
        nextHTML = '<button class="team-next" data-day="' + next.dayKey + '" data-focus="' + esc(next.id) + '">Prochain : <b>' +
          (opp ? (side === 'away' ? 'à ' : 'contre ') + esc(opp.name) : esc(next.title || '')) + '</b> · ' +
          esc(rel || fmtShortDay.format(keyToUTC(next.dayKey))) + (next.timeValid ? ' ' + hhmm(new Date(next.start)) : '') +
          ((next.channels.fr || [])[0] ? ' · ' + esc(next.channels.fr[0]) : '') + '</button>';
      }
      return '<article class="team-card theme-' + fav.theme + '">' +
        '<div class="team-head">' + (logoUrl ? '<img src="' + esc(logoUrl) + '" alt="" width="34" height="34" loading="lazy">' : '') +
        '<h3>' + esc(panel.name) + '</h3></div>' + rank + formHTML + nextHTML + '</article>';
    }).filter(Boolean);
    el.innerHTML = cards.length ? '<div class="section-title">💪 Mes équipes : forme et classement</div><div class="team-grid">' + cards.join('') + '</div>' : '';
  }

  function openTable(favId) {
    const panel = C.TEAM_PANELS.find(function (p) { return p.fav === favId; });
    const st = panel && standingOf(panel);
    if (!st) return;
    const rows = st.group.entries.map(function (e) {
      const me = e.teamId === panel.teamId;
      return '<tr class="' + (me ? 'is-me' : '') + '">' +
        '<td class="rk"' + (e.zone && e.zone.color ? ' style="box-shadow: inset 3px 0 0 ' + esc(e.zone.color) + '" title="' + esc(zoneFr(e.zone.label)) + '"' : '') + '>' + e.rank + '</td>' +
        '<td class="tm"><span class="tmi">' + (e.logo ? '<img src="' + esc(e.logo) + '" alt="" width="20" height="20" loading="lazy">' : '') + esc(e.name) + '</span></td>' +
        '<td>' + esc(e.played) + '</td><td>' + esc(e.wins) + '</td><td>' + esc(e.draws) + '</td><td>' + esc(e.losses) + '</td>' +
        '<td>' + esc(e.diff) + '</td><td class="pts">' + esc(e.points) + '</td></tr>';
    }).join('');
    const zones = {};
    st.group.entries.forEach(function (e) {
      if (!e.zone || !e.zone.color) return;
      const lbl = zoneFr(e.zone.label);
      const list = zones[e.zone.color] = zones[e.zone.color] || [];
      if (list.indexOf(lbl) === -1) list.push(lbl);
    });
    Object.keys(zones).forEach(function (c) { zones[c] = zones[c].join(' / '); });
    const legend = Object.keys(zones).map(function (c) {
      return '<span><i style="background:' + esc(c) + '"></i>' + esc(zones[c]) + '</span>';
    }).join('');
    const dlg = $('#event-dialog');
    dlg.innerHTML =
      '<div class="dlg-head"><div class="comp">Classement · mis à jour automatiquement</div><h3>' + esc(panel.standings.label) +
      (st.group.entries.length < 10 ? ' · ' + esc(st.group.name) : '') + '</h3>' +
      '<button class="icon-btn dlg-close" data-close aria-label="Fermer">✕</button></div>' +
      '<div class="dlg-body"><div class="table-wrap"><table class="std"><thead><tr><th>#</th><th class="tm">Équipe</th><th title="Joués">J</th><th title="Victoires">V</th><th title="Nuls">N</th><th title="Défaites">D</th><th title="Différence">+/-</th><th>Pts</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      (legend ? '<p class="std-legend">' + legend + '</p>' : '') +
      '<div class="dlg-actions"><button class="btn" data-close>Fermer</button></div></div>';
    showDialog(dlg);
    const me = dlg.querySelector('tr.is-me');
    if (me) me.scrollIntoView({ block: 'center' });
  }

  // ----------------------------------------------------------- Calendrier
  function dayInfo(key) {
    const evs = eventsOfDay(key);
    const sports = {};
    let fav = null;
    evs.forEach(function (ev) {
      sports[ev.sport] = true;
      if (ev.rating.fav && (!fav || new Date(ev.start) < new Date(fav.ev.start))) fav = { f: ev.rating.fav, ev: ev };
    });
    return { count: evs.length, sports: Object.keys(sports), fav: fav };
  }

  function favBadge(fav) {
    if (!fav) return '';
    const t = fav.f.theme;
    if (t === 'france') return '<span class="fav-badge fr" title="' + esc(fav.f.label) + '"></span>';
    const ico = { tfc: '✚', stade: '🏉', forest: '🌳', custom: '★' }[t] || '★';
    return '<span class="fav-badge" title="' + esc(fav.f.label) + '">' + ico + '</span>';
  }

  function renderCalendar() {
    const ym = state.month;
    $('#month-title').textContent = fmtMonth.format(keyToUTC(ym + '-01'));
    const first = ym + '-01';
    const offset = (weekdayOf(first) + 6) % 7;          // semaine commençant le lundi
    const start = addDays(first, -offset);
    const today = todayKey();
    const selectedKeys = selectedDays();
    const order = ['foot', 'tennis', 'rugby', 'f1', 'nba', 'nfl'];

    let html = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('');
    for (let i = 0; i < 42; i++) {
      const key = addDays(start, i);
      if (i >= 35 && monthOf(key) !== ym) break;
      const info = dayInfo(key);
      const cls = ['cal-day'];
      if (monthOf(key) !== ym) cls.push('is-other');
      if (key === today) cls.push('is-today');
      if (selectedKeys.indexOf(key) !== -1) cls.push('is-selected');
      if (info.fav) cls.push('has-fav', 'theme-' + info.fav.f.theme);
      const dots = order.filter(function (s) { return info.sports.indexOf(s) !== -1; })
        .map(function (s) { return '<span class="dot s-' + s + '"></span>'; }).join('');
      html += '<button class="' + cls.join(' ') + '" data-day="' + key + '" aria-label="' + esc(fmtLongDay.format(keyToUTC(key))) + ', ' + info.count + ' événements">' +
        favBadge(info.fav) + '<span class="num">' + (+key.slice(8)) + '</span><span class="dots">' + dots + '</span></button>';
    }
    $('#calendar').innerHTML = html;

    // Bandeau de jours (mobile)
    const days = [];
    let k = ym + '-01';
    while (monthOf(k) === ym) { days.push(k); k = addDays(k, 1); }
    $('#daystrip').innerHTML = days.map(function (key) {
      const info = dayInfo(key);
      const cls = ['strip-day'];
      if (key === today) cls.push('is-today');
      if (selectedKeys.indexOf(key) !== -1) cls.push('is-selected');
      if (info.fav) cls.push('has-fav', 'theme-' + info.fav.f.theme);
      const dots = order.filter(function (s) { return info.sports.indexOf(s) !== -1; }).slice(0, 4)
        .map(function (s) { return '<span class="dot s-' + s + '"></span>'; }).join('');
      return '<button class="' + cls.join(' ') + '" data-day="' + key + '">' + favBadge(info.fav) +
        '<span class="wd">' + fmtWd.format(keyToUTC(key)).replace('.', '') + '</span><span class="num">' + (+key.slice(8)) + '</span>' +
        '<span class="dots">' + dots + '</span></button>';
    }).join('');
    const sel = $('#daystrip .is-selected') || $('#daystrip .is-today');
    if (sel && !state.stripScrolled) {
      sel.scrollIntoView({ inline: 'center', block: 'nearest' });
      state.stripScrolled = true;
    }

    $('#legend').innerHTML = C.SPORTS.map(function (s) {
      return '<li><span class="dot s-' + s.key + '"></span>' + s.label + '</li>';
    }).join('') + '<li><span class="dot" style="--dc:transparent;box-shadow:0 0 0 2px var(--accent)"></span>Équipe de cœur</li>';
  }

  // ----------------------------------------------------------- Agenda
  function selectedDays() {
    if (state.mode === 'weekend') {
      const t = todayKey();
      const wd = weekdayOf(t);
      if (wd === 0) return [t];
      const sat = addDays(t, (6 - wd + 7) % 7);
      return wd === 6 ? [t, addDays(t, 1)] : [sat, addDays(sat, 1)];
    }
    return [state.selected];
  }

  function isLoadingMonth(ym) {
    const espnYm = ym.replace('-', '');
    let busy = false;
    state.loading.forEach(function (k) { if (k.slice(-6) === espnYm) busy = true; });
    return busy;
  }

  function sortByTime(a, b) {
    return new Date(a.start) - new Date(b.start) || (b.rating.level - a.rating.level);
  }

  function renderAgenda() {
    const el = $('#agenda');
    if (state.query) { el.innerHTML = searchHTML(state.query); return; }
    el.innerHTML = selectedDays().map(dayHTML).join('');
  }

  function dayHTML(key) {
    const evs = eventsOfDay(key).sort(sortByTime);
    const rel = relativeDay(key);
    let html = '<section class="day"><div class="day-head"><h2>' + cap(fmtLongDay.format(keyToUTC(key))) +
      (rel ? '<small>' + rel + '</small>' : '') + '</h2>' +
      '<span class="day-count">' + (evs.length ? evs.length + ' événement' + (evs.length > 1 ? 's' : '') : '') + '</span></div>';

    if (!evs.length) {
      if (isLoadingMonth(monthOf(key)) || !state.firstLoadDone) {
        return html + '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></section>';
      }
      const next = nextDayWithEvents(key);
      return html + '<div class="empty"><span class="big">📺</span>Rien de prévu ce jour-là' +
        (prefs.onlyBig ? ' dans l\'essentiel' : '') + '.' +
        (next ? '<br><br><button class="btn" data-day="' + next + '">Prochain jour avec du sport : ' + fmtShortDay.format(keyToUTC(next)) + ' →</button>' : '') +
        '</div></section>';
    }

    const must = evs.filter(function (e) { return e.rating.level >= 3; });
    const hot = evs.filter(function (e) { return e.rating.level === 2; });
    const rest = evs.filter(function (e) { return e.rating.level < 2; });

    if (must.length) {
      html += '<div class="section-title">🔥 Immanquables</div>' + must.map(favCardHTML).join('');
    }
    if (hot.length) {
      html += '<div class="section-title">⭐ À suivre</div>' + hot.map(hotCardHTML).join('');
    }
    if (rest.length) {
      html += '<div class="section-title">📺 Tout le programme</div>' + groupsHTML(rest, key);
    }
    return html + '</section>';
  }

  function groupKey(ev) {
    return ev.sport === 'tennis' ? 'tennis:' + ev.tournamentId : (ev.sport === 'f1' ? 'f1:' + ev.title : ev.league);
  }

  function groupsHTML(evs, key) {
    const groups = new Map();
    evs.forEach(function (ev) {
      const gk = groupKey(ev);
      if (!groups.has(gk)) groups.set(gk, { key: gk, ev: ev, list: [] });
      groups.get(gk).list.push(ev);
    });
    const arr = Array.from(groups.values());
    arr.sort(function (a, b) {
      const la = LEAGUE_BY_KEY[a.ev.league], lb = LEAGUE_BY_KEY[b.ev.league];
      const ma = Math.max.apply(null, a.list.map(function (e) { return e.rating.level; }));
      const mb = Math.max.apply(null, b.list.map(function (e) { return e.rating.level; }));
      return (mb - ma) || (la.order - lb.order);
    });
    return arr.map(function (g) {
      const league = LEAGUE_BY_KEY[g.ev.league];
      const label = g.ev.sport === 'tennis' ? g.ev.tournament + ' (' + league.short + ')'
        : g.ev.sport === 'f1' ? 'Formule 1 · ' + g.ev.title : league.name;
      // Tennis : les Français d'abord
      const list = g.list.slice().sort(function (a, b) {
        if (a.sport === 'tennis') {
          const fa = (a.home && a.home.country === 'France') || (a.away && a.away.country === 'France') ? 1 : 0;
          const fb = (b.home && b.home.country === 'France') || (b.away && b.away.country === 'France') ? 1 : 0;
          if (fa !== fb) return fb - fa;
        }
        return sortByTime(a, b);
      });
      const minor = Math.max.apply(null, list.map(function (e) { return e.rating.level; })) === 0;
      const gid = key + '|' + g.key;
      const open = !minor || list.length <= 3 || state.expanded.has(gid);
      let limit = state.expanded.has(gid) ? list.length : (g.ev.sport === 'tennis' ? 6 : 14);
      if (list.length - limit <= 2) limit = list.length;
      const shown = list.slice(0, limit);
      const more = list.length - shown.length;
      return '<details class="group"' + (open ? ' open' : '') + '><summary><span class="emo">' + sportIcon(g.ev.sport) + '</span>' +
        esc(label) + ' <span class="cnt">' + list.length + '</span><span class="chev">›</span></summary>' +
        '<div class="group-body">' + shown.map(function (ev) { return rowHTML(ev, false); }).join('') +
        (more > 0 ? '<button class="more-btn" data-more="' + esc(gid) + '">Voir les ' + more + ' autres matchs</button>' : '') +
        '</div></details>';
    }).join('');
  }

  function nextDayWithEvents(key) {
    let best = null;
    allEvents().forEach(function (ev) {
      if (visible(ev) && ev.dayKey > key && (!best || ev.dayKey < best)) best = ev.dayKey;
    });
    return best;
  }

  function searchHTML(q) {
    const needle = C.normalizeText(q);
    const hits = allEvents().filter(function (ev) {
      if (!prefs.sports[ev.sport]) return false;
      const hay = [ev.home && ev.home.name, ev.away && ev.away.name, ev.home && ev.home.raw, ev.away && ev.away.raw,
        ev.title, ev.tournament, LEAGUE_BY_KEY[ev.league].name].filter(Boolean).map(C.normalizeText).join(' ');
      return hay.indexOf(needle) !== -1;
    }).sort(sortByTime);
    let html = '<section class="day"><div class="day-head"><h2>Recherche <small>« ' + esc(q) + ' »</small></h2>' +
      '<span class="day-count">' + hits.length + ' résultat' + (hits.length > 1 ? 's' : '') + '</span></div>';
    if (!hits.length) return html + '<div class="empty"><span class="big">🔎</span>Aucun match trouvé ce mois-ci.</div></section>';
    let lastDay = '';
    const today = todayKey();
    hits.slice(0, 120).forEach(function (ev) {
      if (ev.dayKey !== lastDay) {
        lastDay = ev.dayKey;
        html += '<div class="section-title">' + cap(fmtLongDay.format(keyToUTC(ev.dayKey))) + (ev.dayKey === today ? ' · aujourd\'hui' : '') + '</div>';
      }
      html += ev.rating.level >= 3 ? favCardHTML(ev) : rowHTML(ev, true);
    });
    return html + '</section>';
  }

  // ----------------------------------------------------------- Statut
  function renderStatus() {
    const el = $('#data-status');
    const busy = state.loading.size > 0;
    const rb = $('#btn-refresh');
    if (rb) rb.classList.toggle('is-busy', busy || !!state.refreshing);
    if (busy) { el.innerHTML = '<span class="st-dot warn"></span>Mise à jour des calendriers…'; return; }
    if (state.lastUpdate) {
      el.innerHTML = '<span class="st-dot"></span>Calendriers à jour (' + hhmm(state.lastUpdate) + ')' +
        (state.errors.size ? ' · quelques compétitions indisponibles pour le moment' : '');
    } else if (state.snapshotDate) {
      el.innerHTML = '<span class="st-dot warn"></span>Hors connexion : programme enregistré le ' +
        fmtShortDay.format(keyToUTC(dayKey(state.snapshotDate)));
    }
    if (!el.querySelector('[data-refresh]')) {
      el.insertAdjacentHTML('beforeend', '<button class="status-refresh" data-refresh>🔄 Actualiser</button>');
    }
  }

  // Bouton « Actualiser » : retélécharge tout le mois affiché (nouveaux matchs,
  // horaires fixés, scores) puis dit ce qui a changé.
  function refreshAll() {
    if (state.refreshing) return;
    state.refreshing = true;
    const before = new Set(state.events.keys());
    const months = [state.month];
    selectedDays().forEach(function (k) { if (months.indexOf(monthOf(k)) === -1) months.push(monthOf(k)); });
    if (+todayKey().slice(8) >= 24 && months.indexOf(addMonths(monthOf(todayKey()), 1)) === -1) {
      months.push(addMonths(monthOf(todayKey()), 1));
    }
    state.errors.clear();
    months.forEach(function (m) { loadMonth(m, true); });
    loadStandings(true);
    Object.keys(liveStamp).forEach(function (k) { delete liveStamp[k]; });
    liveRefresh();
    scheduleRender();
    const started = Date.now();
    const wait = setInterval(function () {
      if ((state.loading.size || queue.length || running) && Date.now() - started < 60000) return;
      clearInterval(wait);
      state.refreshing = false;
      let added = 0;
      state.events.forEach(function (ev, id) { if (!before.has(id) && visible(ev)) added++; });
      if (!state.lastUpdate || Date.now() - state.lastUpdate > 60000) {
        toast('⚠️ Pas de connexion au calendrier pour le moment. Réessayez dans un instant.');
      } else if (added) {
        toast('✅ Programme à jour : ' + added + ' nouveau' + (added > 1 ? 'x' : '') + ' match' + (added > 1 ? 's' : '') + ' ajouté' + (added > 1 ? 's' : '') + ' !');
      } else {
        toast('✅ Programme à jour (horaires, scores et chaînes).');
      }
      scheduleRender();
    }, 400);
  }

  // ===================================================================
  // Fiche détaillée & rappel agenda
  // ===================================================================
  function openEvent(id) {
    const ev = state.events.get(id);
    if (!ev) return;
    const league = LEAGUE_BY_KEY[ev.league];
    const d = new Date(ev.start);
    const title = ev.home && ev.away ? ev.home.name + ' – ' + ev.away.name : (ev.title + (ev.round ? ' · ' + ev.round : ''));
    const score = ev.home && ev.away && ev.status.state !== 'pre'
      ? '<p class="dlg-info"><b style="font-size:1.4em;color:var(--text)">' + esc(scoreText(ev)) + '</b> ' +
        (ev.status.state === 'in' ? '<span class="live">EN DIRECT</span>' : '(terminé)') + '</p>' : '';
    const times = ev.timeValid
      ? '<div class="dlg-times"><div><b>' + hhmm(d) + '</b><span>Paris</span></div><div><b>' + fmtTimeLDN.format(d).replace(':', 'h') +
        '</b><span>Londres</span></div><div><b>' + fmtTimeNY.format(d).replace(':', 'h') + '</b><span>New York</span></div></div>'
      : '<p class="dlg-info">Horaire pas encore fixé.</p>';
    const ch = REGIONS.map(function (r) {
      const list = ev.channels[r] || [];
      return '<div class="lbl"><span class="flag">' + FLAGS[r] + '</span>' + REGION_LABEL[r] + '</div><div class="list">' +
        (list.length ? list.map(function (n) { return chip(n, r); }).join('') : '<span class="ch-none">Pas de diffusion connue</span>') + '</div>';
    }).join('');
    const info = [cap(fmtLongDay.format(keyToUTC(ev.dayKey))), ev.round, ev.venue].filter(Boolean).map(esc).join(' · ');
    const why = ev.rating.fav ? '🔥 ' + ev.rating.fav.badge : (ev.rating.reasons[0] ? '⭐ ' + ev.rating.reasons[0] : '');
    const dlg = $('#event-dialog');
    dlg.innerHTML =
      '<div class="dlg-head"><div class="comp">' + sportIcon(ev.sport) + ' ' + esc(ev.sport === 'tennis' ? ev.tournament : league.name) + (why ? ' · ' + esc(why) : '') + '</div>' +
      '<h3>' + esc(title) + '</h3><button class="icon-btn dlg-close" data-close aria-label="Fermer">✕</button></div>' +
      '<div class="dlg-body"><p class="dlg-info">' + info + '</p>' + score + times +
      '<div class="dlg-ch">' + ch + '</div>' +
      (ev.note ? '<p class="dlg-info">ℹ️ ' + esc(ev.note) + '</p>' : '') +
      '<div class="dlg-actions"><button class="btn btn--primary" data-ics="' + esc(ev.id) + '">📅 Ajouter à mon agenda</button>' +
      '<button class="btn" data-close>Fermer</button></div></div>';
    showDialog(dlg);
  }

  function showDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }

  const DURATION = { foot: 120, rugby: 120, tennis: 150, f1: 120, nba: 150, nfl: 210 };

  function icsEvent(ev) {
    const league = LEAGUE_BY_KEY[ev.league];
    const start = new Date(ev.start);
    const end = new Date(start.getTime() + (DURATION[ev.sport] || 120) * 60000);
    const stamp = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
    const title = (ev.home && ev.away ? ev.home.name + ' – ' + ev.away.name : ev.title + ' · ' + ev.round) +
      ' (' + (ev.sport === 'tennis' ? ev.tournament : league.short) + ')';
    const chan = REGIONS.map(function (r) {
      return REGION_LABEL[r] + ' : ' + ((ev.channels[r] || []).join(', ') || '—');
    }).join('\\n');
    const icsEsc = function (s) { return String(s).replace(/([,;])/g, '\\$1'); };
    // Horaire pas encore fixé : on réserve la journée entière.
    const when = ev.timeValid
      ? ['DTSTART:' + stamp(start), 'DTEND:' + stamp(end)]
      : ['DTSTART;VALUE=DATE:' + ev.dayKey.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + addDays(ev.dayKey, 1).replace(/-/g, '')];
    return {
      title: title,
      lines: [
        'BEGIN:VEVENT',
        'UID:' + ev.id.replace(/[^\w.-]/g, '-') + '@guide-sport-papa',
        'DTSTAMP:' + stamp(new Date()),
      ].concat(when, [
        'SUMMARY:' + icsEsc(sportIcon(ev.sport) + ' ' + title),
        'DESCRIPTION:' + icsEsc('📺 Où regarder :') + '\\n' + icsEsc(chan) +
          (ev.timeValid ? '' : '\\n' + icsEsc('Horaire pas encore fixé.')),
        ev.venue ? 'LOCATION:' + icsEsc(ev.venue) : '',
        'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(title), 'END:VALARM',
        'END:VEVENT',
      ]).filter(Boolean),
    };
  }

  function saveICS(events, filename) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Guide Sport de Papa//FR', 'CALSCALE:GREGORIAN'];
    events.forEach(function (ev) { Array.prototype.push.apply(lines, icsEvent(ev).lines); });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (filename.replace(/[^\wÀ-ſ-]+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'match') + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function downloadICS(id) {
    const ev = state.events.get(id);
    if (!ev) return;
    saveICS([ev], icsEvent(ev).title);
    toast('📅 Rappel créé : ouvrez le fichier pour l\'ajouter à votre agenda (alerte 30 min avant).');
  }

  // Tous les prochains matchs d'une équipe de cœur d'un coup (ce mois-ci et le suivant).
  function exportFavorite(favId) {
    const fav = activeFavorites().concat(C.FAVORITES).find(function (f) { return f.id === favId; });
    if (!fav) return;
    const next = addMonths(monthOf(todayKey()), 1);
    loadMonth(monthOf(todayKey()));
    loadMonth(next);
    toast('⏳ Je rassemble les matchs de ' + fav.label + '…');
    const started = Date.now();
    const wait = setInterval(function () {
      if ((state.loading.size || queue.length || running) && Date.now() - started < 60000) return;
      clearInterval(wait);
      const now = Date.now();
      const list = allEvents().filter(function (ev) {
        return fav.test(ev) && !isGhost(ev) && ev.status.state !== 'post' && new Date(ev.start) > now - 3 * 3600000;
      }).sort(sortByTime);
      if (!list.length) { toast('Aucun match à venir trouvé pour ' + fav.label + '.'); return; }
      saveICS(list, 'Matchs ' + fav.label);
      toast('📅 ' + list.length + ' match' + (list.length > 1 ? 's' : '') + ' de ' + fav.label + ' prêts : ouvrez le fichier pour les ajouter à l\'agenda.');
    }, 400);
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3800);
  }

  // ===================================================================
  // Réglages
  // ===================================================================
  function openSettings() {
    const dlg = $('#settings-dialog');
    const exportBtn = function (id) {
      return '<button class="mini-btn" data-export-fav="' + esc(id) + '" title="Ajouter tous ses prochains matchs à l\'agenda">📅 Agenda</button>';
    };
    const favs = C.FAVORITES.map(function (f) {
      return '<div class="fav-item theme-' + f.theme + '"><span class="sw"></span><label><input type="checkbox" data-fav="' + f.id + '"' +
        (prefs.favOff[f.id] ? '' : ' checked') + '>' + esc(f.label) + '</label>' + exportBtn(f.id) + '</div>';
    }).join('') + prefs.custom.map(function (txt, i) {
      return '<div class="fav-item theme-custom"><span class="sw"></span><label>' + esc(txt) + '</label>' +
        exportBtn(C.makeCustomFavorite(txt).id) +
        '<button class="rm" data-rm="' + i + '" aria-label="Retirer">✕</button></div>';
    }).join('');
    const subs = C.SUBSCRIPTIONS.map(function (sub) {
      return '<label><input type="checkbox" data-sub="' + sub.key + '"' + (prefs.subs[sub.key] ? ' checked' : '') + '>' + esc(sub.label) + '</label>';
    }).join('');
    const regions = REGIONS.map(function (r) {
      return '<label><input type="checkbox" data-region="' + r + '"' + (prefs.regions[r] ? ' checked' : '') + '><span class="flag">' + FLAGS[r] + '</span>' + REGION_LABEL[r] + '</label>';
    }).join('');
    dlg.innerHTML =
      '<div class="dlg-head"><div class="comp">Réglages</div><h3>Mes équipes de cœur</h3>' +
      '<button class="icon-btn dlg-close" data-close aria-label="Fermer">✕</button></div>' +
      '<div class="dlg-body settings">' +
      '<h4>Mises en avant (🔥 immanquables)</h4><div class="fav-list">' + favs + '</div>' +
      '<form class="add-fav" id="add-fav"><input id="add-fav-input" placeholder="Ajouter une équipe ou un joueur (ex. : Marseille, Fils…)" maxlength="40">' +
      '<button class="btn btn--primary" type="submit">Ajouter</button></form>' +
      '<h4 id="subs-title">📺 Mes abonnements (France)</h4>' +
      '<p class="dlg-info" style="margin:0 0 8px">Cochez ce que vous avez : vos chaînes seront marquées ✓ et vous pourrez n\'afficher que les matchs que vous pouvez regarder. Les chaînes gratuites (TF1, France 2, M6, L\'Équipe…) comptent toujours.</p>' +
      '<div class="region-list">' + subs + '</div>' +
      '<h4>Chaînes à afficher</h4><div class="region-list">' + regions + '</div>' +
      (window.Mascot ? '<h4>🐾 Pitchoun, la mascotte</h4><div class="region-list"><label><input type="checkbox" data-mascot' +
        (window.Mascot.isRoaming() ? ' checked' : '') + '>Pitchoun se promène sur l\'écran</label></div>' +
        '<p class="dlg-info" style="margin:6px 0 0">Décoché, il attend sagement dans un bouton en bas à droite.</p>' : '') +
      '<h4>Données</h4><p class="dlg-info" style="margin:0 0 10px">Le programme se met à jour tout seul (toutes les 15 min, et chaque minute pendant les matchs). Pour forcer :</p>' +
      '<button class="btn" id="force-refresh">🔄 Actualiser maintenant</button>' +
      '</div>';
    showDialog(dlg);
  }

  function applyPrefs() {
    document.body.dataset.theme = prefs.theme;
    document.body.classList.toggle('big-text', !!prefs.bigText);
    $('#btn-text').setAttribute('aria-pressed', String(!!prefs.bigText));
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.themeBtn === prefs.theme));
    });
    // (index.html et app.js peuvent brièvement venir de deux versions différentes après une mise à jour)
    if ($('#only-big')) $('#only-big').checked = !!prefs.onlyBig;
    if ($('#only-mine')) $('#only-mine').checked = !!(prefs.onlyMine && prefs.subsSet);
    $('#sport-filters').innerHTML = C.SPORTS.map(function (s) {
      return '<button class="pill" data-sport="' + s.key + '" aria-pressed="' + (!!prefs.sports[s.key]) + '"><span class="emo">' + s.icon + '</span>' + s.label + '</button>';
    }).join('');
    $('#tag-flags').innerHTML = REGIONS.map(function (r) {
      return '<span class="flag" style="display:inline-block;width:20px;height:14px;border-radius:3px;overflow:hidden">' + FLAGS[r] + '</span>';
    }).join('');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#070b1a');
  }

  // ===================================================================
  // Navigation
  // ===================================================================
  function selectDay(key) {
    state.mode = 'day';
    state.selected = key;
    state.query = '';
    $('#search').value = '';
    if (monthOf(key) !== state.month) {
      state.month = monthOf(key);
      state.stripScrolled = false;
      loadMonth(state.month);
    }
    updateQuickDays();
    render();
  }

  function updateQuickDays() {
    const t = todayKey();
    document.querySelectorAll('[data-go]').forEach(function (b) {
      const go = b.dataset.go;
      const active = (go === 'weekend' && state.mode === 'weekend') ||
        (state.mode === 'day' && ((go === 'today' && state.selected === t) || (go === 'tomorrow' && state.selected === addDays(t, 1))));
      b.classList.toggle('is-active', active);
    });
  }

  function bind() {
    document.addEventListener('click', function (e) {
      const t = e.target;
      const ics = t.closest('[data-ics]');
      if (ics) { e.stopPropagation(); downloadICS(ics.dataset.ics); return; }
      const close = t.closest('[data-close]');
      if (close) { close.closest('dialog').close(); return; }
      const day = t.closest('[data-day]');
      if (day) {
        selectDay(day.dataset.day);
        const dlg = day.closest('dialog');
        if (dlg) dlg.close();
        if (window.matchMedia('(max-width: 820px)').matches && day.classList.contains('cal-day')) {
          document.querySelector('.calendar-panel').classList.remove('show-month');
          $('#agenda').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Depuis « Prochains immanquables » : on amène directement sur le match.
        if (day.dataset.focus) {
          const id = day.dataset.focus;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              const target = Array.prototype.find.call(document.querySelectorAll('#agenda [data-ev]'), function (x) { return x.dataset.ev === id; });
              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
          });
        }
        return;
      }
      const more = t.closest('[data-more]');
      if (more) { state.expanded.add(more.dataset.more); renderAgenda(); return; }
      const evEl = t.closest('[data-ev]');
      if (evEl) { openEvent(evEl.dataset.ev); return; }
      const go = t.closest('[data-go]');
      if (go) {
        const today = todayKey();
        if (go.dataset.go === 'today') selectDay(today);
        else if (go.dataset.go === 'tomorrow') selectDay(addDays(today, 1));
        else {
          state.mode = 'weekend';
          state.query = '';
          $('#search').value = '';
          const days = selectedDays();
          if (monthOf(days[days.length - 1]) !== state.month) { state.month = monthOf(days[0]); loadMonth(state.month); }
          days.forEach(function (k) { if (monthOf(k) !== state.month) loadMonth(monthOf(k)); });
          updateQuickDays();
          render();
        }
        return;
      }
      const sp = t.closest('[data-sport]');
      if (sp) {
        prefs.sports[sp.dataset.sport] = !prefs.sports[sp.dataset.sport];
        savePrefs(); applyPrefs(); render();
        if (prefs.sports[sp.dataset.sport]) selectedDays().forEach(function (k) { loadMonth(monthOf(k)); });
        return;
      }
      const th = t.closest('[data-theme-btn]');
      if (th) {
        prefs.theme = th.dataset.themeBtn;
        savePrefs(); applyPrefs();
        const names = { bleus: 'Allez les Bleus ! 🇫🇷', tfc: 'Allez le Téfécé ! 💜', stade: 'Allez le Stade ! ❤️🖤', forest: 'Come on you Reds! 🌳' };
        toast(names[prefs.theme] || '');
        return;
      }
      if (t.closest('[data-greet-close]')) {
        const st = greetState(); st.dismissed = todayKey(); saveGreet(st);
        renderGreeting();
        return;
      }
      if (t.closest('[data-welcome-go]')) {
        const st = greetState(); st.welcomed = true; saveGreet(st);
        t.closest('dialog').close();
        return;
      }
      const tbl = t.closest('[data-table]');
      if (tbl) { openTable(tbl.dataset.table); return; }
      const exp = t.closest('[data-export-fav]');
      if (exp) { exportFavorite(exp.dataset.exportFav); return; }
      const rm = t.closest('[data-rm]');
      if (rm) {
        prefs.custom.splice(+rm.dataset.rm, 1);
        savePrefs(); rerateAll(); openSettings(); render();
        return;
      }
      if (t.closest('#force-refresh') || t.closest('[data-refresh]')) {
        const dlg = t.closest('dialog');
        if (dlg) dlg.close();
        refreshAll();
        return;
      }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('article[data-ev]')) {
        e.preventDefault();
        openEvent(e.target.dataset.ev);
      }
    });

    document.addEventListener('change', function (e) {
      const t = e.target;
      if (t.dataset.fav) {
        prefs.favOff[t.dataset.fav] = !t.checked;
        savePrefs(); rerateAll(); loadStandings(); render();
      } else if (t.hasAttribute('data-mascot')) {
        if (window.Mascot) window.Mascot.setRoaming(t.checked);
      } else if (t.dataset.region) {
        prefs.regions[t.dataset.region] = t.checked;
        savePrefs(); render();
      } else if (t.dataset.sub) {
        prefs.subs[t.dataset.sub] = t.checked;
        prefs.subsSet = true;
        savePrefs(); applyPrefs(); render();
      } else if (t.id === 'only-mine') {
        if (!prefs.subsSet) {
          t.checked = false;
          openSettings();
          const st = document.getElementById('subs-title');
          if (st) st.scrollIntoView({ block: 'start' });
          toast('Cochez d\'abord vos abonnements 📺');
          return;
        }
        prefs.onlyMine = t.checked;
        savePrefs(); render();
      } else if (t.id === 'only-big') {
        prefs.onlyBig = t.checked;
        savePrefs(); render();
      }
    });

    document.addEventListener('submit', function (e) {
      if (e.target.id !== 'add-fav') return;
      e.preventDefault();
      const v = $('#add-fav-input').value.trim();
      if (v.length < 3) { toast('Tapez au moins 3 lettres.'); return; }
      prefs.custom.push(v);
      savePrefs(); rerateAll(); openSettings(); render();
      toast('⭐ ' + v + ' ajouté aux équipes de cœur');
    });

    $('#btn-settings').addEventListener('click', openSettings);
    if ($('#btn-refresh')) $('#btn-refresh').addEventListener('click', refreshAll);
    $('#btn-text').addEventListener('click', function () {
      prefs.bigText = !prefs.bigText;
      savePrefs(); applyPrefs();
    });
    $('#prev-month').addEventListener('click', function () { changeMonth(-1); });
    $('#next-month').addEventListener('click', function () { changeMonth(1); });
    $('#month-title').addEventListener('click', function () {
      document.querySelector('.calendar-panel').classList.toggle('show-month');
    });

    let searchTimer;
    $('#search').addEventListener('input', function (e) {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.query = e.target.value.trim();
        renderAgenda();
      }, 150);
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { loadMonth(state.month); liveRefresh(); }
    });
  }

  function changeMonth(n) {
    state.month = addMonths(state.month, n);
    state.stripScrolled = false;
    const t = todayKey();
    state.mode = 'day';
    state.query = '';
    $('#search').value = '';
    state.selected = monthOf(t) === state.month ? t : state.month + '-01';
    loadMonth(state.month);
    updateQuickDays();
    render();
  }

  function tick() {
    document.querySelectorAll('[data-countdown]').forEach(function (el) {
      const ev = state.events.get(el.dataset.countdown);
      if (!ev) return;
      const txt = (ev.home && ev.away) ? countdown(ev) : (ev.timeValid ? hhmm(new Date(ev.start)) + ' · ' : '') + countdown(ev);
      if (el.textContent !== txt) el.textContent = txt;
    });
  }


  // ===================================================================
  // Pour la mascotte : trouver le prochain rendez-vous d'une équipe ou
  // d'un joueur, et y emmener Papa dans le calendrier.
  // ===================================================================
  // Surnoms courants → nom tel qu'il apparaît dans le calendrier (ou équipe de cœur).
  const ALIASES = {
    'tfc': { fav: 'tfc' }, 'tefece': { fav: 'tfc' }, 'toulouse fc': { fav: 'tfc' }, 'le tfc': { fav: 'tfc' },
    'violets': { fav: 'tfc' }, 'les violets': { fav: 'tfc' }, 'toulouse foot': { fav: 'tfc' },
    'stade toulousain': { fav: 'stade' }, 'le stade': { fav: 'stade' }, 'toulouse rugby': { fav: 'stade' },
    'forest': { fav: 'forest' }, 'nottingham': { fav: 'forest' }, 'nottingham forest': { fav: 'forest' }, 'nffc': { fav: 'forest' },
    'bleus': { fav: 'france' }, 'les bleus': { fav: 'france' }, 'equipe de france': { fav: 'france' },
    'xv de france': { fav: 'france-rugby' }, 'france rugby': { fav: 'france-rugby' },
    'psg': { text: 'paris sg' }, 'paris saint germain': { text: 'paris sg' }, 'om': { text: 'marseille' },
    'ol': { text: 'lyon' }, 'asse': { text: 'saint-etienne' }, 'barca': { text: 'barcelona' },
    'real': { text: 'real madrid' }, 'atletico': { text: 'atletico madrid' }, 'bayern': { text: 'bayern munich' },
    'man city': { text: 'manchester city' }, 'city': { text: 'manchester city' },
    'man united': { text: 'manchester united' }, 'man utd': { text: 'manchester united' }, 'manchester utd': { text: 'manchester united' },
    'spurs': { text: 'tottenham' }, 'inter': { text: 'inter milan' }, 'milan': { text: 'ac milan' }, 'juve': { text: 'juventus' },
    'formule 1': { sport: 'f1' }, 'f1': { sport: 'f1' }, 'grand prix': { sport: 'f1' },
  };
  const FILLER = /\b(le|la|les|l|du|de|des|d|un|une|match|matchs|prochain|prochaine|quand|joue|jouent|contre|vs|et|equipe|club|moi|trouve|cherche|je|veux|voir)\b/g;

  function levenshtein(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    let prev = [];
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }
  // Un mot tapé ressemble-t-il à un mot du calendrier ? (tolère une faute de frappe : « Nottingam »)
  function wordMatches(w, words) {
    const tol = w.length >= 7 ? 2 : (w.length >= 4 ? 1 : 0);
    return words.some(function (x) {
      if (x === w || (w.length >= 3 && x.indexOf(w) === 0)) return true;
      return tol && levenshtein(w, x) <= tol;
    });
  }
  function eventWords(ev) {
    return C.normalizeText([ev.home && ev.home.name, ev.away && ev.away.name, ev.home && ev.home.raw, ev.away && ev.away.raw,
      ev.title, ev.tournament].filter(Boolean).join(' ')).split(/[^a-z0-9]+/).filter(Boolean);
  }

  function matcherFor(query) {
    const q = C.normalizeText(query).replace(/[’'-]/g, ' ').replace(/\s+/g, ' ').trim();
    const alias = ALIASES[q] || ALIASES[q.replace(FILLER, ' ').replace(/\s+/g, ' ').trim()];
    if (alias && alias.fav) {
      const fav = C.FAVORITES.find(function (f) { return f.id === alias.fav; });
      return { label: fav.label, test: fav.test };
    }
    if (alias && alias.sport) return { label: query, test: function (ev) { return ev.sport === alias.sport; } };
    const text = alias && alias.text ? alias.text : q;
    const words = text.replace(/-/g, ' ').replace(FILLER, ' ').split(/\s+/).filter(function (w) { return w.length >= 2; });
    if (!words.length) return null;
    return {
      label: query,
      test: function (ev) {
        const hay = eventWords(ev);
        return words.every(function (w) { return wordMatches(w, hay); });
      },
    };
  }

  // Le prochain rendez-vous (ou celui en cours) parmi ce qui est chargé.
  function findNext(query) {
    const m = matcherFor(query);
    if (!m) return null;
    const now = Date.now();
    const hits = allEvents().filter(function (ev) {
      if (ev.status.state === 'post' || isGhost(ev)) return false;
      if (ev.status.state !== 'in' && new Date(ev.kind === 'tournament' && ev.end ? ev.end : ev.start) < now - 3 * 3600000) return false;
      return m.test(ev);
    }).sort(function (a, b) {
      return ((b.status.state === 'in') - (a.status.state === 'in')) || sortByTime(a, b);
    });
    return hits[0] || null;
  }

  // Charge un mois (si besoin) et attend qu'il soit arrivé.
  function ensureMonth(ym) {
    loadMonth(ym);
    return new Promise(function (resolve) {
      const t0 = Date.now();
      (function wait() {
        if (!isLoadingMonth(ym) || Date.now() - t0 > 25000) resolve();
        else setTimeout(wait, 300);
      })();
    });
  }

  function describe(ev) {
    const title = ev.home && ev.away ? ev.home.name + ' – ' + ev.away.name : (ev.title + (ev.round ? ' · ' + ev.round : ''));
    const rel = relativeDay(ev.dayKey);
    const when = ev.status.state === 'in' ? 'en ce moment même'
      : (rel ? rel.toLowerCase() : fmtLongDay.format(keyToUTC(ev.dayKey))) + (ev.timeValid ? ' à ' + hhmm(new Date(ev.start)) : '');
    return {
      title: title,
      when: when,
      live: ev.status.state === 'in',
      competition: ev.sport === 'tennis' ? ev.tournament : LEAGUE_BY_KEY[ev.league].name,
      channels: (ev.channels.fr || []).slice(0, 3),
    };
  }

  // Affiche le jour du match (en levant les filtres qui le cacheraient) et renvoie sa carte.
  function revealEvent(id) {
    const ev = state.events.get(id);
    if (!ev) return null;
    let changed = false;
    if (!prefs.sports[ev.sport]) { prefs.sports[ev.sport] = true; changed = true; }
    if (prefs.onlyBig && ev.rating.level < 2) { prefs.onlyBig = false; $('#only-big').checked = false; changed = true; }
    if (prefs.onlyMine && prefs.subsSet && !canWatch(ev)) { prefs.onlyMine = false; $('#only-mine').checked = false; changed = true; }
    if (changed) { savePrefs(); applyPrefs(); }
    state.expanded.add(ev.dayKey + '|' + groupKey(ev));
    if (state.mode !== 'day' || state.selected !== ev.dayKey || state.query || changed) selectDay(ev.dayKey);
    else renderAgenda();
    return Array.prototype.find.call(document.querySelectorAll('#agenda [data-ev]'), function (x) { return x.dataset.ev === id; }) || null;
  }
  // La case du calendrier visible à l'écran (grille du mois, ou bandeau de jours sur téléphone).
  function dayElement(key) {
    const list = document.querySelectorAll('#calendar [data-day="' + key + '"], #daystrip [data-day="' + key + '"]');
    return Array.prototype.find.call(list, function (x) { return x.getClientRects().length > 0; }) || null;
  }

  window.GuideSport = {
    findNext: findNext,
    ensureMonth: ensureMonth,
    nextMonths: function (n) { const out = []; for (let i = 1; i <= n; i++) out.push(addMonths(monthOf(todayKey()), i)); return out; },
    isReady: function () { return !!state.firstLoadDone; },
    describe: describe,
    dayOf: function (id) { const ev = state.events.get(id); return ev && ev.dayKey; },
    showMonthOf: function (key) { if (monthOf(key) !== state.month) { state.month = monthOf(key); state.stripScrolled = false; render(); } },
    revealEvent: revealEvent,
    dayElement: dayElement,
    openEvent: openEvent,
  };

  // ===================================================================
  // Démarrage
  // ===================================================================
  function start() {
    applyPrefs();
    bind();
    if (navigator.onLine === false) loadSnapshot();
    updateQuickDays();
    render();
    loadMonth(state.month);
    // Le mois précédent pour les compétitions des équipes de cœur (leurs 5 derniers résultats).
    loadMonth(addMonths(monthOf(todayKey()), -1), false, C.FORM_LEAGUES, 2);
    loadMonth(addMonths(monthOf(todayKey()), -2), false, C.FORM_LEAGUES, 2);
    loadStandings();
    welcomeOnce();
    // Les derniers jours du mois, on prépare déjà le mois suivant.
    const t = todayKey();
    if (+t.slice(8) >= 24) loadMonth(addMonths(state.month, 1), false, null, 1);
    // Le programme est prêt dès que le mois affiché est arrivé (sans attendre les mois passés).
    const check = setInterval(function () {
      if (!isLoadingMonth(state.month)) {
        state.firstLoadDone = true;
        clearInterval(check);
        if (state.errors.size) loadSnapshot();
        scheduleRender();
      }
    }, 300);
    setTimeout(function () {
      state.firstLoadDone = true;
      if (!state.lastUpdate) loadSnapshot();
      scheduleRender();
    }, 12000);
    setInterval(tick, 20000);
    setInterval(liveRefresh, 60000);
    // Et toutes les 15 minutes, on vérifie tout seul s'il y a du nouveau.
    setInterval(function () { if (!document.hidden) { loadMonth(state.month); loadStandings(); } }, 15 * 60000);
    // Changement de jour à minuit
    let lastToday = t;
    setInterval(function () {
      const nt = todayKey();
      if (nt !== lastToday) { if (state.selected === lastToday) state.selected = nt; lastToday = nt; render(); }
    }, 60000);
  }

  start();
})();
