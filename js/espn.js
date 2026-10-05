/*
 * Couche de données : récupère les calendriers publics d'ESPN et les
 * transforme en une liste d'événements simple, la même pour tous les sports.
 *
 * Utilisable dans le navigateur (window.SportData) et dans Node
 * (require('./espn.js')) pour générer l'instantané hors-ligne.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SportData = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BASE = 'https://site.api.espn.com/apis/site/v2/sports/';

  // ---------------------------------------------------------------------
  // Traductions
  // ---------------------------------------------------------------------
  const COUNTRIES_FR = {
    'Albania': 'Albanie', 'Algeria': 'Algérie', 'Andorra': 'Andorre', 'Argentina': 'Argentine',
    'Armenia': 'Arménie', 'Australia': 'Australie', 'Austria': 'Autriche', 'Azerbaijan': 'Azerbaïdjan',
    'Belarus': 'Biélorussie', 'Belgium': 'Belgique', 'Bosnia-Herzegovina': 'Bosnie-Herzégovine',
    'Bosnia and Herzegovina': 'Bosnie-Herzégovine', 'Brazil': 'Brésil', 'Bulgaria': 'Bulgarie',
    'Cameroon': 'Cameroun', 'Canada': 'Canada', 'Chile': 'Chili', 'China': 'Chine', 'Colombia': 'Colombie',
    'Croatia': 'Croatie', 'Cyprus': 'Chypre', 'Czechia': 'Tchéquie', 'Czech Republic': 'Tchéquie',
    'Denmark': 'Danemark', 'Ecuador': 'Équateur', 'Egypt': 'Égypte', 'England': 'Angleterre',
    'Estonia': 'Estonie', 'Faroe Islands': 'Îles Féroé', 'Fiji': 'Fidji', 'Finland': 'Finlande',
    'France': 'France', 'Georgia': 'Géorgie', 'Germany': 'Allemagne', 'Gibraltar': 'Gibraltar',
    'Greece': 'Grèce', 'Hungary': 'Hongrie', 'Iceland': 'Islande', 'Ireland': 'Irlande',
    'Republic of Ireland': 'Irlande', 'Israel': 'Israël', 'Italy': 'Italie', 'Ivory Coast': 'Côte d\'Ivoire',
    "Cote d'Ivoire": 'Côte d\'Ivoire', 'Japan': 'Japon', 'Kazakhstan': 'Kazakhstan', 'Kosovo': 'Kosovo',
    'Latvia': 'Lettonie', 'Liechtenstein': 'Liechtenstein', 'Lithuania': 'Lituanie',
    'Luxembourg': 'Luxembourg', 'Malta': 'Malte', 'Mexico': 'Mexique', 'Moldova': 'Moldavie',
    'Monaco': 'Monaco', 'Montenegro': 'Monténégro', 'Morocco': 'Maroc', 'Netherlands': 'Pays-Bas',
    'New Zealand': 'Nouvelle-Zélande', 'Nigeria': 'Nigeria', 'North Macedonia': 'Macédoine du Nord',
    'Northern Ireland': 'Irlande du Nord', 'Norway': 'Norvège', 'Paraguay': 'Paraguay', 'Peru': 'Pérou',
    'Poland': 'Pologne', 'Portugal': 'Portugal', 'Romania': 'Roumanie', 'Russia': 'Russie',
    'Samoa': 'Samoa', 'San Marino': 'Saint-Marin', 'Saudi Arabia': 'Arabie saoudite', 'Scotland': 'Écosse',
    'Senegal': 'Sénégal', 'Serbia': 'Serbie', 'Slovakia': 'Slovaquie', 'Slovenia': 'Slovénie',
    'South Africa': 'Afrique du Sud', 'South Korea': 'Corée du Sud', 'Spain': 'Espagne',
    'Sweden': 'Suède', 'Switzerland': 'Suisse', 'Tonga': 'Tonga', 'Tunisia': 'Tunisie',
    'Turkey': 'Turquie', 'Türkiye': 'Turquie', 'Ukraine': 'Ukraine', 'United States': 'États-Unis',
    'USA': 'États-Unis', 'Uruguay': 'Uruguay', 'Wales': 'Pays de Galles',
  };

  const CLUBS_FR = {
    'Internazionale': 'Inter Milan', 'Bayern Munich': 'Bayern Munich', 'Stade Rennais': 'Rennes',
    'AS Monaco': 'Monaco', 'Le Havre AC': 'Le Havre', 'Paris Saint-Germain': 'Paris SG',
    'Montpellier Herault': 'Montpellier', 'Bordeaux Begles': 'Bordeaux-Bègles',
    'Stade Francais Paris': 'Stade Français', 'Clermont Auvergne': 'Clermont',
    'Castres Olympique': 'Castres', 'LOU Rugby': 'Lyon (LOU)', 'Feyenoord Rotterdam': 'Feyenoord',
  };

  const ROUNDS_FR = {
    'Round 1': '1er tour', 'Round 2': '2e tour', 'Round 3': '3e tour', 'Round 4': '4e tour',
    'Round of 128': '1er tour', 'Round of 64': '2e tour', 'Round of 32': '16es de finale',
    'Round of 16': '8es de finale', 'Quarterfinal': 'Quart de finale', 'Quarterfinals': 'Quarts de finale',
    'Semifinal': 'Demi-finale', 'Semifinals': 'Demi-finales', 'Final': 'Finale',
    'Round Robin': 'Phase de groupes',
  };

  const F1_SESSIONS = {
    FP1: 'Essais libres 1', FP2: 'Essais libres 2', FP3: 'Essais libres 3',
    SS: 'Qualifs Sprint', SR: 'Sprint', Qual: 'Qualifications', Race: 'Course',
  };

  const US_NAMES = {
    'USA Net': 'USA Network', 'NFL Net': 'NFL Network', 'CBSSN': 'CBS Sports Network',
    'ESPN Deportes': 'ESPN Deportes', 'Tele': 'Telemundo', 'Universo': 'Universo',
    'MNMT': 'Monumental', 'NBCSN': 'NBC Sports',
  };

  function frName(name) {
    if (!name) return '';
    return COUNTRIES_FR[name] || CLUBS_FR[name] || name;
  }

  function translateGroup(name) {
    // "Group A2" (Ligue des Nations) -> "Ligue A · Groupe 2"
    const m = /^Group ([A-D])(\d)$/.exec(name || '');
    if (m) return 'Ligue ' + m[1] + ' · Groupe ' + m[2];
    const g = /^Group (\w+)$/.exec(name || '');
    if (g) return 'Groupe ' + g[1];
    return name || '';
  }

  // ---------------------------------------------------------------------
  // Utilitaires
  // ---------------------------------------------------------------------
  function teamOf(c) {
    const t = c.team || {};
    return {
      id: t.id || '',
      name: frName(t.displayName || t.name || ''),
      raw: t.displayName || t.name || '',
      short: frName(t.shortDisplayName || t.displayName || ''),
      abbr: t.abbreviation || '',
      logo: t.logo || '',
      color: t.color ? '#' + t.color : '',
      score: c.score != null && c.score !== '' ? String(c.score) : '',
      winner: !!c.winner,
    };
  }

  function athleteOf(c) {
    const a = c.athlete || {};
    const flag = a.flag || {};
    return {
      id: c.id || a.id || '',
      tbd: !(a.displayName || a.fullName),
      name: a.displayName || a.fullName || 'À déterminer',
      raw: a.displayName || '',
      short: a.shortName || a.displayName || 'À déterminer',
      country: flag.alt || '',
      logo: flag.href || '',
      score: (c.linescores || []).map(function (l) { return l.value; }).join(' '),
      winner: !!c.winner,
    };
  }

  function statusOf(st) {
    const type = (st && st.type) || {};
    return {
      state: type.state || 'pre',            // pre | in | post
      detail: type.shortDetail || type.detail || '',
      clock: st && st.displayClock ? st.displayClock : '',
      completed: !!type.completed,
      postponed: /postponed|canceled|cancelled|suspended/i.test(type.name || ''),
    };
  }

  function usBroadcasts(comp) {
    const out = [];
    (comp.broadcasts || []).forEach(function (b) {
      if (b.market && b.market !== 'national') return;
      (b.names || []).forEach(function (n) {
        const name = US_NAMES[n] || n;
        if (out.indexOf(name) === -1) out.push(name);
      });
    });
    return out;
  }

  // ---------------------------------------------------------------------
  // Normalisation par type de sport
  // ---------------------------------------------------------------------
  function normalizeTeamSport(league, json) {
    const out = [];
    (json.events || []).forEach(function (e) {
      const comp = (e.competitions || [])[0];
      if (!comp) return;
      const cs = comp.competitors || [];
      const home = cs.find(function (c) { return c.homeAway === 'home'; }) || cs[0];
      const away = cs.find(function (c) { return c.homeAway === 'away'; }) || cs[1];
      if (!home || !away) return;
      const venue = comp.venue || e.venue || {};
      const addr = venue.address || {};
      const notes = (comp.notes || []).map(function (n) { return n.headline || n.text; }).filter(Boolean);
      out.push({
        id: league.key + ':' + e.id,
        league: league.key,
        sport: league.sport,
        start: e.date,
        timeValid: comp.timeValid !== false,
        status: statusOf(e.status || comp.status),
        home: teamOf(home),
        away: teamOf(away),
        round: translateGroup(comp.group && comp.group.name) || notes[0] || '',
        venue: [venue.fullName || venue.displayName, addr.city].filter(Boolean).join(', '),
        us: usBroadcasts(comp),
        preseason: !!(e.season && /pre/i.test(e.season.slug || '')),
      });
    });
    return out;
  }

  // ESPN publie parfois le même match deux fois (ou une version « fantôme »
  // jamais mise à jour). On garde, pour une même affiche le même jour, la
  // version la plus avancée (terminé > en cours > à venir).
  const STATE_RANK = { post: 3, in: 2, pre: 1 };
  function dedupe(list) {
    const best = {};
    list.forEach(function (ev) {
      if (!ev.home || !ev.away) { best[ev.id] = ev; return; }
      const k = ev.start.slice(0, 10) + '|' + [ev.home.id, ev.away.id].sort().join('|');
      const cur = best[k];
      if (!cur || (STATE_RANK[ev.status.state] || 0) > (STATE_RANK[cur.status.state] || 0)) best[k] = ev;
    });
    return Object.keys(best).map(function (k) { return best[k]; });
  }

  function normalizeTennis(league, json) {
    const out = [];
    (json.events || []).forEach(function (t) {
      const groupings = t.groupings || [];
      let matches = 0;
      groupings.forEach(function (g) {
        const slug = (g.grouping && g.grouping.slug) || '';
        if (!/singles/.test(slug)) return;                       // pas les doubles
        // Tournois mixtes (ex. China Open) : présents dans les deux flux, on ne garde
        // que les hommes côté ATP et que les femmes côté WTA.
        if (league.key === 'atp' && /women/.test(slug)) return;
        if (league.key === 'wta' && !/women/.test(slug)) return;
        (g.competitions || []).forEach(function (c) {
          const roundName = (c.round && c.round.displayName) || '';
          if (/qualif/i.test(roundName)) return;                 // pas les qualifs
          const cs = c.competitors || [];
          if (cs.length < 2) return;
          matches++;
          const a = cs.find(function (x) { return x.order === 1; }) || cs[0];
          const b = cs.find(function (x) { return x.order === 2; }) || cs[1];
          // Tableau pas encore rempli (« À déterminer » contre « À déterminer ») : rien à afficher.
          if (!(a.athlete && a.athlete.displayName) && !(b.athlete && b.athlete.displayName)) return;
          out.push({
            id: league.key + ':' + t.id + ':' + c.id,
            league: league.key,
            sport: 'tennis',
            start: c.date || c.startDate,
            timeValid: c.timeValid !== false,
            status: statusOf(c.status),
            home: athleteOf(a),
            away: athleteOf(b),
            tournament: t.name,
            tournamentId: String(t.id),
            major: !!t.major,
            draw: /women/.test(slug) ? 'Simple dames' : 'Simple messieurs',
            round: ROUNDS_FR[roundName] || roundName,
            roundRaw: roundName,
            venue: (c.venue && c.venue.fullName) || '',
            us: usBroadcasts(c),
          });
        });
      });
      if (!matches) {
        // Tableau pas encore publié : on affiche le tournoi lui-même.
        out.push({
          id: league.key + ':' + t.id + ':tournoi',
          league: league.key,
          sport: 'tennis',
          kind: 'tournament',
          start: t.date,
          end: t.endDate,
          timeValid: false,
          status: { state: 'pre', detail: '', clock: '', completed: false, postponed: false },
          title: t.name,
          tournament: t.name,
          tournamentId: String(t.id),
          major: !!t.major,
          round: 'Début du tournoi',
          venue: '',
          us: [],
        });
      }
    });
    return out;
  }

  function normalizeRacing(league, json) {
    const out = [];
    (json.events || []).forEach(function (e) {
      (e.competitions || []).forEach(function (c) {
        const abbr = (c.type && c.type.abbreviation) || '';
        const venue = (e.circuit && e.circuit.fullName) || (c.venue && c.venue.fullName) || '';
        out.push({
          id: league.key + ':' + e.id + ':' + (c.id || abbr),
          league: league.key,
          sport: 'f1',
          kind: 'session',
          start: c.date,
          timeValid: c.timeValid !== false,
          status: statusOf(c.status),
          title: e.shortName || e.name,
          session: abbr,
          round: F1_SESSIONS[abbr] || abbr,
          venue: venue,
          us: usBroadcasts(c),
        });
      });
    });
    return out;
  }

  function normalize(league, json) {
    if (league.kind === 'tennis') return normalizeTennis(league, json);
    if (league.kind === 'racing') return normalizeRacing(league, json);
    return dedupe(normalizeTeamSport(league, json));
  }

  function scoreboardUrl(league, dates) {
    return BASE + league.path + '/scoreboard?dates=' + dates + '&limit=500';
  }

  // dates : "YYYYMM" (un mois) ou "YYYYMMDD" (un jour)
  async function fetchLeague(league, dates, fetchImpl) {
    const f = fetchImpl || fetch;
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await f(scoreboardUrl(league, dates));
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return normalize(league, json);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }

  return {
    fetchLeague: fetchLeague,
    normalize: normalize,
    scoreboardUrl: scoreboardUrl,
    frName: frName,
  };
});
