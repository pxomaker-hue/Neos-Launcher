const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];
if (!appDir) throw new Error('Application directory required');

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected one ${label} anchor`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const jsPath = path.join(appDir, 'js', 'app.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('NEOS 0.6.33</span>') || !js.includes('canCreate=hasRight(')) {
  throw new Error('Expected Neos v0.6.33 with the CalDAV creation fix');
}

js = replaceOnce(js,
  "    const regular=caldav.filter(t=>!deckTitles.has(String(t.title||'').trim().toLowerCase()+'|'+String(t.due||'')));",
  "    const regular=canonical.length?canonical:caldav.filter(t=>t.source==='caldav'||!deckTitles.has(String(t.title||'').trim().toLowerCase()+'|'+String(t.due||'')));",
  'task collision');
js = replaceOnce(js,
  "    return {items:selected,total:regular.length+deck.length,deckCount:deck.length,loading:groupware.status==='loading'};",
  "    const error=groupware.status==='error'?'Impossible de charger les tâches CalDAV. Ouvre le module Tâches pour le détail.':groupware.status==='ready'&&(groupware.taskErrors||[]).length?(groupware.taskSuccess===0?'Les listes de tâches CalDAV sont indisponibles.':'Certaines listes de tâches CalDAV sont indisponibles.')+' Ouvre le module Tâches pour le détail.':'';\n    return {items:selected,total:regular.length+deck.length,deckCount:deck.length,loading:groupware.status==='loading',error};",
  'widget error state');
js = replaceOnce(js,
  "    const status=data.loading?'<p class=\"neos-task-widget-status\" role=\"status\">Recherche des tâches Deck…</p>':'';",
  "    const status=data.error?`<p class=\"neos-task-widget-status neos-task-widget-error\" role=\"alert\">${esc(data.error)}</p>`:data.loading?'<p class=\"neos-task-widget-status\" role=\"status\">Recherche des tâches…</p>':'';",
  'widget status');
js = replaceOnce(js,
  "    const content=entries?`<div class=\"neos-list\">${entries}</div>${status}${notes}`:`<div class=\"neos-empty\">${data.loading?'Chargement des tâches…':'Aucune tâche ouverte.'}</div>`;",
  "    const content=entries?`<div class=\"neos-list\">${entries}</div>${status}${notes}`:data.error?status:`<div class=\"neos-empty\">${data.loading?'Chargement des tâches…':'Aucune tâche ouverte.'}</div>`;",
  'widget empty state');
js = replaceOnce(js, 'NEOS 0.6.33</span>', 'NEOS 0.6.34</span>', 'footer version');
js = js.replaceAll('Neos 0.6.33 —', 'Neos 0.6.34 —');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css', 'app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.34:')) throw new Error('v0.6.34 styles already present');
css += '\n/* v0.6.34: task loading errors on the home page */\n#nova-root .neos-task-widget-error{color:#ffd3a1}\n';
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo', 'info.xml');
let info = fs.readFileSync(infoPath, 'utf8');
info = replaceOnce(info, '<version>0.6.33</version>', '<version>0.6.34</version>', 'app version');
fs.writeFileSync(infoPath, info);

const changelogPath = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelogPath, `## 0.6.34 — Robustesse du widget Tâches

- Deux tâches CalDAV et Deck distinctes restent visibles même si elles portent le même titre et la même échéance.
- Le dédoublonnage par titre et échéance ne concerne que les données provisoires du tableau de bord sans source connue.
- Une erreur de lecture CalDAV est annoncée dans le widget au lieu d’être présentée comme une liste vide ; les tâches déjà disponibles restent affichées.
- Les permissions et les opérations de création CalDAV de la v0.6.32 ainsi que les actions Deck de la v0.6.33 restent inchangées.

` + fs.readFileSync(changelogPath, 'utf8'));

const planPath = path.join(appDir, 'PLAN-v0.7.md');
fs.writeFileSync(planPath, `## Après Neos v0.6.34
- Confirmer sur NAS les états d’erreur du widget Tâches en cas de liste CalDAV indisponible.
- Poursuivre l’audit d’accessibilité clavier et des boîtes de dialogue complexes avant v0.7.

` + fs.readFileSync(planPath, 'utf8'));

console.log('Patched Neos v0.6.34');
