/*
 * Configuration : compétitions suivies, chaînes TV par pays, équipes de cœur
 * et règles pour savoir ce qui est « immanquable ».
 *
 * Les droits TV changent d'une saison à l'autre : tout est rassemblé ici
 * pour pouvoir les mettre à jour facilement (saison 2026-27).
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------------
  // Chaînes : nom affiché, couleur de la pastille, gratuite ou non.
  // ---------------------------------------------------------------------
  const CHANNELS = {
    // France
    'TF1':               { bg: '#0a3d91', fg: '#fff', free: true },
    'TF1+':              { bg: '#0a3d91', fg: '#fff', free: true, web: true },
    'M6':                { bg: '#e2001a', fg: '#fff', free: true },
    'France 2':          { bg: '#e2001a', fg: '#fff', free: true },
    'France 3':          { bg: '#0055a4', fg: '#fff', free: true },
    'france.tv':         { bg: '#1b1b1b', fg: '#fff', free: true, web: true },
    "L'Équipe":          { bg: '#e30613', fg: '#fff', free: true },
    "L'Équipe live foot":{ bg: '#e30613', fg: '#fff', web: true },
    'TMC':               { bg: '#0a3d91', fg: '#fff', free: true },
    'France TV':         { bg: '#1b1b1b', fg: '#fff', free: true },
    'Disney+':           { bg: '#0e3cb3', fg: '#fff', web: true },
    'Canal+':            { bg: '#000', fg: '#fff' },
    'Canal+ Sport':      { bg: '#000', fg: '#fff' },
    'Canal+ Foot':       { bg: '#000', fg: '#fff' },
    'Canal+ Sport 360':  { bg: '#000', fg: '#fff' },
    'beIN Sports':       { bg: '#5c2d91', fg: '#fff' },
    'beIN Sports 1':     { bg: '#5c2d91', fg: '#fff' },
    'beIN Sports Max':   { bg: '#5c2d91', fg: '#fff' },
    'Ligue 1+':          { bg: '#085fff', fg: '#fff', web: true },
    'DAZN':              { bg: '#f8fc00', fg: '#0c161c' },
    'Eurosport':         { bg: '#141b4d', fg: '#fff' },
    'Prime Video':       { bg: '#00a8e1', fg: '#04131c', web: true },
    'RMC Sport':         { bg: '#00327d', fg: '#fff' },
    // USA
    'FOX':               { bg: '#003366', fg: '#fff', free: true },
    'FS1':               { bg: '#003366', fg: '#fff' },
    'FS2':               { bg: '#003366', fg: '#fff' },
    'Fox One':           { bg: '#003366', fg: '#fff', web: true },
    'Tubi':              { bg: '#fa541c', fg: '#fff', free: true, web: true },
    'NBC':               { bg: '#6e3fa3', fg: '#fff', free: true },
    'Peacock':           { bg: '#111', fg: '#fff', web: true },
    'USA Network':       { bg: '#1b3f8b', fg: '#fff' },
    'CBS':               { bg: '#0b3ea8', fg: '#fff', free: true },
    'CBS Sports Network':{ bg: '#0b3ea8', fg: '#fff' },
    'CBS Sports Golazo': { bg: '#0b3ea8', fg: '#fff' },
    'Paramount+':        { bg: '#0064ff', fg: '#fff', web: true },
    'ESPN':              { bg: '#c8102e', fg: '#fff' },
    'ESPN2':             { bg: '#c8102e', fg: '#fff' },
    'ESPN+':             { bg: '#c8102e', fg: '#fff', web: true },
    'ESPN Deportes':     { bg: '#c8102e', fg: '#fff' },
    'ABC':               { bg: '#111', fg: '#fff', free: true },
    'Tennis Channel':    { bg: '#c4d600', fg: '#0f1a00' },
    'beIN Sports USA':   { bg: '#5c2d91', fg: '#fff' },
    'Apple TV':          { bg: '#1d1d1f', fg: '#fff', web: true },
    'NBA TV':            { bg: '#1d428a', fg: '#fff' },
    'NFL Network':       { bg: '#013369', fg: '#fff' },
    'TNT':               { bg: '#111', fg: '#fff' },
    'truTV':             { bg: '#111', fg: '#fff' },
    'HBO Max':           { bg: '#3b1fd1', fg: '#fff', web: true },
    'Netflix':           { bg: '#e50914', fg: '#fff', web: true },
    'Telemundo':         { bg: '#111', fg: '#fff', free: true },
    'Universo':          { bg: '#111', fg: '#fff' },
    'FloRugby':          { bg: '#111', fg: '#fff', web: true },
    // Royaume-Uni
    'Sky Sports':        { bg: '#0b1e66', fg: '#fff' },
    'Sky Sports F1':     { bg: '#0b1e66', fg: '#fff' },
    'Sky Sports Tennis': { bg: '#0b1e66', fg: '#fff' },
    'Sky Sports NFL':    { bg: '#0b1e66', fg: '#fff' },
    'TNT Sports':        { bg: '#111', fg: '#fff' },
    'BBC':               { bg: '#111', fg: '#fff', free: true },
    'ITV':               { bg: '#13104d', fg: '#fff', free: true },
    'Channel 4':         { bg: '#0d0d0d', fg: '#fff', free: true },
    'Channel 5':         { bg: '#d4145a', fg: '#fff', free: true },
    'Premier Sports':    { bg: '#00205b', fg: '#fff' },
    'Amazon Prime':      { bg: '#00a8e1', fg: '#04131c', web: true },
  };

  // ---------------------------------------------------------------------
  // Compétitions suivies (source : calendrier public ESPN)
  //   tier : importance de base (0 = mineur, 1 = normal, 2 = gros morceau)
  //   fr / us / uk : chaînes par défaut ; une fonction peut affiner par match
  // ---------------------------------------------------------------------
  const LEAGUES = [
    // ---------------- Football ----------------
    {
      key: 'uefa.nations', path: 'soccer/uefa.nations', sport: 'foot', kind: 'team',
      name: 'Ligue des Nations', short: 'Ligue des Nations', tier: 1, order: 1,
      fr: function (ev) {
        return involves(ev, 'France') ? ['TF1', 'TF1+'] : ["L'Équipe live foot"];
      },
      note: function (ev) {
        return involves(ev, 'France') ? '' :
          "Les autres matchs sont sur L'Équipe live foot ; La Chaîne L'Équipe (gratuite) en diffuse un par soirée.";
      },
      us: ['FS1', 'Fox One'],
      uk: function (ev) {
        if (involves(ev, 'England')) return ['ITV'];
        if (involves(ev, 'Scotland') || involves(ev, 'Wales') || involves(ev, 'Northern Ireland')) return ['BBC'];
        return [];
      },
    },
    {
      key: 'fifa.friendly', path: 'soccer/fifa.friendly', sport: 'foot', kind: 'team',
      name: 'Matchs amicaux', short: 'Amical', tier: 0, order: 9,
      fr: function (ev) { return involves(ev, 'France') ? ['TF1', 'TF1+'] : []; },
      us: [], uk: [],
    },
    {
      key: 'fra.1', path: 'soccer/fra.1', sport: 'foot', kind: 'team',
      name: 'Ligue 1', short: 'Ligue 1', tier: 1, order: 2,
      fr: ['Ligue 1+'],
      note: 'Ligue 1+ diffuse les 9 matchs de chaque journée (via Orange, SFR, Free, Bouygues, Prime Video, DAZN…).',
      us: ['beIN Sports USA'],
      uk: ['Ligue 1+'],
    },
    {
      key: 'eng.1', path: 'soccer/eng.1', sport: 'foot', kind: 'team',
      name: 'Premier League', short: 'Premier League', tier: 1, order: 3,
      fr: ['Canal+ Foot', 'Canal+ Sport 360'],
      us: ['Peacock', 'NBC', 'USA Network'],
      uk: function (ev) {
        const d = parisParts(ev.start);
        // Samedi 16h à Paris = 15h à Londres : créneau jamais télévisé au Royaume-Uni.
        if (d.weekday === 6 && d.hour === 16 && d.minute === 0) return [];
        return ['Sky Sports', 'TNT Sports'];
      },
      note: function (ev) {
        const d = parisParts(ev.start);
        return d.weekday === 6 && d.hour === 16 && d.minute === 0
          ? 'Au Royaume-Uni, les matchs du samedi 15h (heure de Londres) ne passent jamais en direct à la télé.' : '';
      },
    },
    {
      key: 'uefa.champions', path: 'soccer/uefa.champions', sport: 'foot', kind: 'team',
      name: 'Ligue des Champions', short: 'Ligue des Champions', tier: 1, order: 2,
      fr: ['Canal+', 'Canal+ Foot'],
      note: 'Canal+ diffuse tous les matchs (Canal+, Canal+ Foot, Canal+ Sport, Canal+ Live).',
      us: ['Paramount+', 'CBS'],
      uk: function (ev) {
        return parisParts(ev.start).weekday === 2 ? ['TNT Sports', 'Amazon Prime'] : ['TNT Sports'];
      },
    },
    {
      key: 'uefa.europa', path: 'soccer/uefa.europa', sport: 'foot', kind: 'team',
      name: 'Ligue Europa', short: 'Ligue Europa', tier: 1, order: 4,
      fr: ['Canal+ Foot', 'Canal+ Sport 360'],
      us: ['Paramount+', 'CBS Sports Golazo'],
      uk: ['TNT Sports'],
    },
    {
      key: 'uefa.europa.conf', path: 'soccer/uefa.europa.conf', sport: 'foot', kind: 'team',
      name: 'Ligue Conférence', short: 'Ligue Conférence', tier: 0, order: 5,
      fr: ['Canal+ Foot', 'Canal+ Sport 360'],
      us: ['Paramount+'],
      uk: ['TNT Sports'],
    },
    {
      key: 'fra.coupe_de_france', path: 'soccer/fra.coupe_de_france', sport: 'foot', kind: 'team',
      name: 'Coupe de France', short: 'Coupe de France', tier: 1, order: 6,
      fr: ['beIN Sports'],
      note: 'Quelques affiches (dont la finale) passent aussi sur une chaîne gratuite.',
      us: ['beIN Sports USA'], uk: [],
    },
    {
      key: 'esp.1', path: 'soccer/esp.1', sport: 'foot', kind: 'team',
      name: 'Liga (Espagne)', short: 'Liga', tier: 0, order: 7,
      fr: ['DAZN', 'Disney+'], us: ['ESPN+'], uk: ['Premier Sports'],
    },
    {
      key: 'ita.1', path: 'soccer/ita.1', sport: 'foot', kind: 'team',
      name: 'Serie A (Italie)', short: 'Serie A', tier: 0, order: 8,
      fr: ['DAZN'], us: ['Paramount+', 'CBS Sports Golazo'], uk: ['DAZN', 'TNT Sports'],
    },
    {
      key: 'ger.1', path: 'soccer/ger.1', sport: 'foot', kind: 'team',
      name: 'Bundesliga (Allemagne)', short: 'Bundesliga', tier: 0, order: 8,
      fr: ['beIN Sports'], us: ['USA Network'], uk: ['Sky Sports'],
    },
    {
      key: 'fra.2', path: 'soccer/fra.2', sport: 'foot', kind: 'team',
      name: 'Ligue 2', short: 'Ligue 2', tier: 0, order: 10,
      fr: ['beIN Sports'], us: ['beIN Sports USA'], uk: [],
    },
    {
      key: 'eng.league_cup', path: 'soccer/eng.league_cup', sport: 'foot', kind: 'team',
      name: 'Carabao Cup', short: 'Carabao Cup', tier: 0, order: 10,
      fr: ['beIN Sports'], us: ['Paramount+'], uk: ['Sky Sports'],
    },

    // ---------------- Tennis ----------------
    {
      key: 'atp', path: 'tennis/atp', sport: 'tennis', kind: 'tennis',
      name: 'Tennis ATP', short: 'ATP', tier: 0, order: 20,
      fr: function (ev) {
        return /Paris/i.test(ev.tournament || '') ? ['Eurosport', 'france.tv', 'France 3'] : ['Eurosport'];
      },
      note: function (ev) {
        if (/Paris/i.test(ev.tournament || '')) return 'Rolex Paris Masters : Eurosport + france.tv, finale en clair sur France 3.';
        return 'Eurosport diffuse les Masters 1000, les ATP 500 et les ATP Finals.';
      },
      us: ['Tennis Channel'], uk: ['Sky Sports Tennis'],
    },
    {
      key: 'wta', path: 'tennis/wta', sport: 'tennis', kind: 'tennis',
      name: 'Tennis WTA', short: 'WTA', tier: 0, order: 21,
      fr: ['beIN Sports'], us: ['Tennis Channel'], uk: ['Sky Sports Tennis'],
    },

    // ---------------- Rugby ----------------
    {
      key: 'rugby.nations', path: 'rugby/17567', sport: 'rugby', kind: 'team',
      name: 'Nations Championship (rugby)', short: 'Nations Championship', tier: 1, order: 30,
      fr: function (ev) { return involves(ev, 'France') ? ['TF1', 'TF1+'] : ['TMC', 'TF1+']; },
      note: 'Le groupe TF1 a toute la compétition : TF1, TMC et TF1+.',
      us: [], uk: [],
    },
    {
      key: 'rugby.top14', path: 'rugby/270559', sport: 'rugby', kind: 'team',
      name: 'Top 14', short: 'Top 14', tier: 1, order: 32,
      fr: ['Canal+', 'Canal+ Sport'], us: ['FloRugby'], uk: ['Premier Sports'],
    },
    {
      key: 'rugby.cc', path: 'rugby/271937', sport: 'rugby', kind: 'team',
      name: 'Champions Cup (rugby)', short: 'Champions Cup', tier: 1, order: 33,
      fr: ['beIN Sports'],
      note: 'France 2 / France 3 diffusent aussi environ deux matchs par journée en clair.',
      us: ['FloRugby'], uk: ['Premier Sports'],
    },

    // ---------------- Formule 1 ----------------
    {
      key: 'f1', path: 'racing/f1', sport: 'f1', kind: 'racing',
      name: 'Formule 1', short: 'F1', tier: 1, order: 40,
      fr: ['Canal+', 'Canal+ Sport'], us: ['Apple TV'], uk: ['Sky Sports F1'],
      note: function (ev) { return ev.session === 'Race' ? 'Au Royaume-Uni, résumé en clair sur Channel 4.' : ''; },
    },

    // ---------------- Sports US ----------------
    {
      key: 'nba', path: 'basketball/nba', sport: 'nba', kind: 'team',
      name: 'NBA', short: 'NBA', tier: 0, order: 50,
      fr: ['beIN Sports', 'Prime Video'], us: [], uk: ['Sky Sports', 'Amazon Prime'],
    },
    {
      key: 'nfl', path: 'football/nfl', sport: 'nfl', kind: 'team',
      name: 'NFL', short: 'NFL', tier: 0, order: 51,
      fr: function (ev) { return isAbroad(ev) ? ['France TV', 'beIN Sports'] : ['beIN Sports']; },
      us: [], uk: ['Sky Sports NFL'],
      note: function (ev) {
        return /Paris|Saint-Denis/i.test(ev.venue || '') ? 'Match de NFL à Paris ! En clair sur France Télévisions.' : '';
      },
    },
  ];

  // ---------------------------------------------------------------------
  // Sports (filtres)
  // ---------------------------------------------------------------------
  const SPORTS = [
    { key: 'foot', label: 'Foot', icon: '⚽' },
    { key: 'tennis', label: 'Tennis', icon: '🎾' },
    { key: 'rugby', label: 'Rugby', icon: '🏉' },
    { key: 'f1', label: 'F1', icon: '🏎️' },
    { key: 'nba', label: 'NBA', icon: '🏀' },
    { key: 'nfl', label: 'NFL', icon: '🏈' },
  ];

  // ---------------------------------------------------------------------
  // Les équipes de cœur de Papa
  //   theme : habillage visuel de la carte (couleurs du club)
  // ---------------------------------------------------------------------
  const FAVORITES = [
    {
      id: 'france', label: 'Équipe de France (foot)', theme: 'france', badge: 'Allez les Bleus !',
      test: function (ev) { return ev.sport === 'foot' && involves(ev, 'France'); },
    },
    {
      id: 'france-rugby', label: 'XV de France', theme: 'france', badge: 'Allez les Bleus !',
      test: function (ev) { return ev.sport === 'rugby' && involves(ev, 'France'); },
    },
    {
      id: 'tfc', label: 'Toulouse FC', theme: 'tfc', badge: 'Allez le Téfécé !',
      test: function (ev) { return ev.sport === 'foot' && (matchTeam(ev, /^toulouse( fc)?$/i)); },
    },
    {
      id: 'stade', label: 'Stade Toulousain', theme: 'stade', badge: 'Allez le Stade !',
      test: function (ev) { return ev.sport === 'rugby' && matchTeam(ev, /toulous/i); },
    },
    {
      id: 'forest', label: 'Nottingham Forest', theme: 'forest', badge: 'Come on you Reds!',
      test: function (ev) { return ev.sport === 'foot' && matchTeam(ev, /nottingham forest/i); },
    },
  ];

  // Grands clubs : une affiche entre deux d'entre eux mérite le coup d'œil.
  const BIG_CLUBS = /^(Paris SG|Paris Saint-Germain|Marseille|Lyon|Monaco|Lille|Lens|Real Madrid|Barcelona|Atlético Madrid|Bayern Munich|Borussia Dortmund|Liverpool|Manchester City|Manchester United|Arsenal|Chelsea|Tottenham Hotspur|Juventus|Inter Milan|AC Milan|Napoli)$/;
  const FRENCH_CLUBS = /^(Paris SG|Marseille|Lyon|Monaco|Lille|Lens|Nice|Rennes|Strasbourg|Nantes|Brest|Toulouse|Auxerre|Angers|Le Havre|Lorient|Metz|Paris FC|Troyes|Le Mans|Saint-Etienne|Montpellier|Reims)$/;
  const BIG_NATIONS = /^(France|Espagne|Angleterre|Allemagne|Italie|Portugal|Pays-Bas|Belgique|Croatie|Brésil|Argentine)$/;
  const TENNIS_STARS = /(Sinner|Alcaraz|Djokovic|Zverev|Fritz|Draper|Shelton|Musetti|Fonseca|Mensik|Sabalenka|Swiatek|Gauff|Rybakina|Anisimova|Pegula|Andreeva|Paolini)/;

  // ---------------------------------------------------------------------
  // Importance d'un événement : 3 = immanquable, 2 = à suivre, 1 = normal, 0 = mineur
  // ---------------------------------------------------------------------
  function rate(ev, league, favorites) {
    const reasons = [];
    let level = league.tier;
    let fav = null;

    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].test(ev)) { fav = favorites[i]; break; }
    }
    if (fav) return { level: 3, fav: fav, reasons: [fav.label] };

    const h = ev.home ? ev.home.name : '';
    const a = ev.away ? ev.away.name : '';

    if (ev.sport === 'foot') {
      if (ev.league === 'uefa.nations' && (BIG_NATIONS.test(h) && BIG_NATIONS.test(a))) {
        level = 2; reasons.push('Choc entre grandes nations');
      } else if (ev.league === 'uefa.nations' && (BIG_NATIONS.test(h) || BIG_NATIONS.test(a))) {
        level = Math.max(level, 1);
      }
      if (BIG_CLUBS.test(h) && BIG_CLUBS.test(a)) { level = 2; reasons.push('Grosse affiche'); }
      if (/^uefa\./.test(ev.league) && ev.league !== 'uefa.nations' && (FRENCH_CLUBS.test(h) || FRENCH_CLUBS.test(a))) {
        level = Math.max(level, 2); reasons.push('Club français en Coupe d\'Europe');
      }
      if ((h === 'Paris SG' && a === 'Marseille') || (h === 'Marseille' && a === 'Paris SG')) {
        level = 2; reasons.push('Le Classique');
      }
    } else if (ev.sport === 'tennis') {
      const french = (ev.home && ev.home.country === 'France') || (ev.away && ev.away.country === 'France');
      const star = TENNIS_STARS.test(h) || TENNIS_STARS.test(a);
      const late = /Demi|Finale/.test(ev.round || '') && !/8es|16es/.test(ev.round || '');
      const big = ev.major || /Masters|Finals/i.test(ev.tournament || '');
      level = big ? 1 : 0;
      if (french) {
        level = Math.max(level, 1);
        if (big || /Quart|Demi|Finale/.test(ev.round || '')) level = 2;
        reasons.push(/dames/.test(ev.draw || '') ? 'Joueuse française' : 'Joueur français');
      }
      if (star) { level = Math.max(level, 1); }
      if (late && (big || star)) { level = Math.max(level, 2); reasons.push(ev.round); }
      if (french && /^Finale$/.test(ev.round || '')) { level = 3; reasons.push('Finale avec un Français'); }
      if (ev.kind === 'tournament' && /Paris/i.test(ev.tournament || '')) { level = 2; reasons.push('Tournoi à Paris'); }
      level = Math.min(level, 3);
    } else if (ev.sport === 'rugby') {
      if (BIG_NATIONS.test(h) || BIG_NATIONS.test(a) || /Nouvelle-Zélande|Afrique du Sud|Irlande/.test(h + a)) {
        level = Math.max(level, 2);
      }
    } else if (ev.sport === 'f1') {
      if (ev.session === 'Race') { level = 2; reasons.push('Grand Prix'); }
      else if (ev.session === 'Qual' || ev.session === 'SR') level = 1;
      else level = 0;
    } else if (ev.sport === 'nba') {
      if (/San Antonio Spurs/.test((ev.home && ev.home.raw) + (ev.away && ev.away.raw))) {
        level = 1; reasons.push('Wembanyama 🇫🇷');
      }
      if (ev.preseason) level = 0;
    } else if (ev.sport === 'nfl') {
      if (/Paris|Saint-Denis/i.test(ev.venue || '')) { level = 2; reasons.push('La NFL à Paris'); }
    }

    if (ev.preseason) level = Math.min(level, 0);
    return { level: Math.max(0, Math.min(level, 3)), fav: null, reasons: reasons };
  }

  // ---------------------------------------------------------------------
  // Aides
  // ---------------------------------------------------------------------
  function involves(ev, name) {
    return !!(ev.home && ev.away && (ev.home.name === name || ev.away.name === name ||
      ev.home.raw === name || ev.away.raw === name));
  }

  // Match NFL/NBA délocalisé hors d'Amérique du Nord (ex. : match NFL à Paris)
  function isAbroad(ev) {
    return /Paris|Saint-Denis|London|Londres|Madrid|Berlin|Dublin|Munich|Frankfurt|Mexico/i.test(ev.venue || '');
  }

  function matchTeam(ev, re) {
    if (!ev.home || !ev.away) return false;
    return re.test(ev.home.raw) || re.test(ev.away.raw) || re.test(ev.home.name) || re.test(ev.away.name);
  }

  const PARTS_FMT = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function parisParts(iso) {
    const parts = {};
    PARTS_FMT.formatToParts(new Date(iso)).forEach(function (p) { parts[p.type] = p.value; });
    return { weekday: WEEKDAYS[parts.weekday], hour: +parts.hour, minute: +parts.minute };
  }

  function channelsFor(ev, league) {
    function pick(v) { return typeof v === 'function' ? v(ev) : (v || []).slice(); }
    const fr = pick(league.fr);
    let us = pick(league.us);
    // ESPN connaît les diffuseurs américains match par match : on les préfère.
    if (ev.us && ev.us.length) {
      us = ev.us.filter(function (n) { return !/^(ESPN Deportes|Telemundo|Universo|TUDN|Univision)$/.test(n); });
      if (!us.length) us = ev.us.slice();
    }
    return { fr: fr, us: us, uk: pick(league.uk) };
  }

  function makeCustomFavorite(text) {
    const needle = normalizeText(text);
    return {
      id: 'custom:' + needle, label: text, theme: 'custom', badge: 'Équipe de cœur', custom: true,
      test: function (ev) {
        const names = [ev.home && ev.home.name, ev.away && ev.away.name, ev.home && ev.home.raw,
          ev.away && ev.away.raw, ev.title].filter(Boolean).map(normalizeText);
        return names.some(function (n) { return n.indexOf(needle) !== -1; });
      },
    };
  }

  function normalizeText(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  root.SportConfig = {
    CHANNELS: CHANNELS,
    LEAGUES: LEAGUES,
    SPORTS: SPORTS,
    FAVORITES: FAVORITES,
    rate: rate,
    channelsFor: channelsFor,
    parisParts: parisParts,
    makeCustomFavorite: makeCustomFavorite,
    normalizeText: normalizeText,
  };
})(typeof self !== 'undefined' ? self : this);
