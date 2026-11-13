const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];
if (!appDir) throw new Error('Application directory required');
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0 || text.indexOf(before, first + before.length) >= 0) throw new Error(`Expected one ${label} anchor`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}

const jsPath = path.join(appDir, 'js/app.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('NEOS 0.6.44</span>') || !js.includes('function renderFolderPicker(){')) {
  throw new Error('Expected published Neos v0.6.44 source');
}
js = replaceOnce(js,
  "  function renderFolderPicker(){\n    if(popMode!=='destination'||!pickerState)return;\n    const p=pickerState;",
  "  function renderFolderPicker(){\n    if(popMode!=='destination'||!pickerState)return;\n    const focused=popHost.contains(document.activeElement)?document.activeElement:null;\n    const searchFocused=focused?.matches?.('[data-destination-search]')||false;\n    const selection=searchFocused?[focused.selectionStart,focused.selectionEnd]:null;\n    const folderPath=focused?.matches?.('.neos-destination-folder')?focused.dataset.path:null;\n    const p=pickerState;",
  'destination focus capture');
js = replaceOnce(js,
  '<span class="neos-sr-only">Filtrer les dossiers</span><input type="search" data-destination-search',
  '<span class="neos-sr-only">Filtrer les dossiers</span><span id="neos-destination-keyboard-help" class="neos-sr-only">Flèche bas pour parcourir les dossiers ; flèche haut pour revenir au filtre.</span><input type="search" data-destination-search aria-describedby="neos-destination-keyboard-help"',
  'destination keyboard help');
js = replaceOnce(js,
  '  }\n  async function browseDestination(path){',
  "    const next=searchFocused?popHost.querySelector('[data-destination-search]'):folderPath?[...popHost.querySelectorAll('.neos-destination-folder')].find(el=>el.dataset.path===folderPath):null;\n    if(next){\n      next.focus({preventScroll:true});\n      if(searchFocused&&selection.every(Number.isInteger))next.setSelectionRange(...selection);\n    }\n  }\n  async function browseDestination(path){",
  'destination focus restoration');
js = replaceOnce(js,
  "  popHost.addEventListener('keydown',event=>{\n    if(popMode!=='global-search'",
  "  popHost.addEventListener('keydown',event=>{\n    if(popMode!=='destination'||event.altKey||event.ctrlKey||event.metaKey)return;\n    const folders=[...popHost.querySelectorAll('.neos-destination-folder')];\n    if(event.target.matches?.('[data-destination-search]')){\n      if(event.key==='ArrowDown'&&folders.length){event.preventDefault();event.stopPropagation();folders[0].focus({preventScroll:true});}\n      return;\n    }\n    const current=event.target.closest?.('.neos-destination-folder');\n    const index=folders.indexOf(current);\n    if(index<0)return;\n    const next=event.key==='ArrowDown'?folders[Math.min(index+1,folders.length-1)]:\n      event.key==='ArrowUp'?(index?folders[index-1]:popHost.querySelector('[data-destination-search]')):\n      event.key==='Home'?folders[0]:event.key==='End'?folders[folders.length-1]:null;\n    if(next){event.preventDefault();event.stopPropagation();next.focus({preventScroll:true});}\n  });\n  popHost.addEventListener('keydown',event=>{\n    if(popMode!=='global-search'",
  'destination keyboard navigation');
js = replaceOnce(js, 'NEOS 0.6.44</span>', 'NEOS 0.6.45</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const infoPath = path.join(appDir, 'appinfo/info.xml');
fs.writeFileSync(infoPath, replaceOnce(fs.readFileSync(infoPath, 'utf8'), '<version>0.6.44</version>', '<version>0.6.45</version>', 'app version'));
const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.45 — Navigation clavier dans les dossiers de destination

- Le filtre de la fenêtre Copier/Déplacer garde son focus et son curseur lorsque les dossiers se rechargent.
- Flèche bas entre dans la liste ; flèches haut/bas parcourent les dossiers ; Début/Fin rejoignent ses extrémités.
- Une aide discrète décrit ces touches aux lecteurs d'écran.
- Les opérations de copie/déplacement, les permissions et les données Nextcloud restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.45 — Parcours clavier des destinations

Le sélecteur de dossier préserve la saisie du filtre pendant le chargement et permet de parcourir les dossiers avec les flèches.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.45');
