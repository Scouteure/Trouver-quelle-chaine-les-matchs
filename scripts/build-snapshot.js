#!/usr/bin/env node
/*
 * Génère data/snapshot.js : une copie du programme des prochaines semaines,
 * affichée si le calendrier en ligne ne répond pas (pas de réseau, etc.).
 *
 *   node scripts/build-snapshot.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

global.self = global;
require('../js/config.js');
const SportData = require('../js/espn.js');
const { LEAGUES } = global.SportConfig;

const DAYS_BEFORE = 2;
const DAYS_AFTER = 45;

function ym(d) { return d.toISOString().slice(0, 7).replace('-', ''); }

async function main() {
  const now = new Date();
  const from = new Date(now.getTime() - DAYS_BEFORE * 86400000);
  const to = new Date(now.getTime() + DAYS_AFTER * 86400000);
  const months = [];
  for (let d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1)); d <= to; d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push(ym(d));
  }

  const byId = new Map();
  for (const league of LEAGUES) {
    for (const m of months) {
      try {
        const events = await SportData.fetchLeague(league, m);
        events.forEach((ev) => byId.set(ev.id, ev));
        process.stdout.write(`✓ ${league.key} ${m} (${events.length})\n`);
      } catch (err) {
        process.stdout.write(`✗ ${league.key} ${m} : ${err.message}\n`);
      }
    }
  }

  const events = [...byId.values()]
    .filter((ev) => {
      const t = new Date(ev.start);
      return t >= from && t <= to;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const out = '/* Généré par scripts/build-snapshot.js — ne pas modifier à la main. */\n' +
    'window.SPORT_SNAPSHOT = ' + JSON.stringify({ generated: now.toISOString(), events }) + ';\n';
  const file = path.join(__dirname, '..', 'data', 'snapshot.js');
  fs.writeFileSync(file, out);
  console.log(`\n${events.length} événements enregistrés dans data/snapshot.js (${(out.length / 1024).toFixed(0)} Ko)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
