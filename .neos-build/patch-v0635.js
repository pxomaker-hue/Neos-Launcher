const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];
if (!appDir) throw new Error('Application directory required');
const file = path.join(appDir, 'js', 'app.js');
let js = fs.readFileSync(file, 'utf8');
if (!js.includes('NEOS 0.6.34</span>') || !js.includes('neos-task-widget-error')) {
  throw new Error('Expected the published Neos v0.6.34 source');
}
function replaceOnce(before, after, label) {
  const first = js.indexOf(before);
  if (first < 0 || js.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one ${label} anchor`);
  }
  js = js.slice(0, first) + after + js.slice(first + before.length);
}

replaceOnce(
  '  function renderGlobalSearch(){',
  `  function nextSearchTab(current,key){
    const tabs=['search','favorites','recent'];
    const index=tabs.indexOf(current);
    if(index<0)return null;
    if(key==='Home')return tabs[0];
    if(key==='End')return tabs[tabs.length-1];
    if(key==='ArrowRight')return tabs[(index+1)%tabs.length];
    if(key==='ArrowLeft')return tabs[(index+tabs.length-1)%tabs.length];
    return null;
  }
  function selectSearchPanelTab(tab){
    if(!['search','favorites','recent'].includes(tab))return;
    searchPanelTab=tab;renderGlobalSearch();
    popHost.querySelector('[data-action="search-tab"][data-tab="'+tab+'"]')?.focus({preventScroll:true});
    if(tab==='favorites')void loadFavorites();
  }
  function renderGlobalSearch(){`,
  'search tab helpers');

replaceOnce('role="tab" aria-selected="${search}" class="${search?',
  'role="tab" id="neos-search-tab-search" aria-controls="neos-search-panel" aria-selected="${search}" tabindex="${search?0:-1}" class="${search?',
  'search tab markup');
replaceOnce('role="tab" aria-selected="${searchPanelTab===\'favorites\'}"',
  'role="tab" id="neos-search-tab-favorites" aria-controls="neos-search-panel" aria-selected="${searchPanelTab===\'favorites\'}" tabindex="${searchPanelTab===\'favorites\'?0:-1}"',
  'favorites tab markup');
replaceOnce('role="tab" aria-selected="${searchPanelTab===\'recent\'}"',
  'role="tab" id="neos-search-tab-recent" aria-controls="neos-search-panel" aria-selected="${searchPanelTab===\'recent\'}" tabindex="${searchPanelTab===\'recent\'?0:-1}"',
  'recent tab markup');
replaceOnce('<div class="neos-search-dialog-results" data-global-search-results role="tabpanel"></div>',
  '<div class="neos-search-dialog-results" id="neos-search-panel" data-global-search-results role="tabpanel" aria-labelledby="neos-search-tab-${searchPanelTab}" tabindex="0"></div>',
  'search panel markup');

replaceOnce("  popHost.addEventListener('click', event => {",
  `  popHost.addEventListener('keydown',event=>{
    if(popMode!=='global-search'||event.altKey||event.ctrlKey||event.metaKey)return;
    const tab=event.target.closest?.('[data-action="search-tab"]');
    if(!tab)return;
    const next=nextSearchTab(tab.dataset.tab,event.key);
    if(!next)return;
    event.preventDefault();event.stopPropagation();selectSearchPanelTab(next);
  });
  popHost.addEventListener('click', event => {`,
  'search tab keyboard handler');
replaceOnce(
  "      searchPanelTab=actionEl.dataset.tab||'search';renderGlobalSearch();\n      if(searchPanelTab==='favorites')void loadFavorites();\n      if(searchPanelTab==='search'){popHost.querySelector('[data-global-search]')?.focus();}",
  "      selectSearchPanelTab(actionEl.dataset.tab||'search');",
  'search tab click handler');
replaceOnce('NEOS 0.6.34</span>', 'NEOS 0.6.35</span>', 'footer version');
js = js.replaceAll('Neos 0.6.34 —', 'Neos 0.6.35 —');
fs.writeFileSync(file, js);

const infoPath = path.join(appDir, 'appinfo', 'info.xml');
let info = fs.readFileSync(infoPath, 'utf8');
if (!info.includes('<version>0.6.34</version>')) throw new Error('Wrong input version');
info = info.replace('<version>0.6.34</version>', '<version>0.6.35</version>');
fs.writeFileSync(infoPath, info);

const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.35 — Navigation clavier dans les onglets de recherche

- Dans la fenêtre Accès aux fichiers, le focus reste sur l’onglet choisi après un changement entre Recherche, Favoris et Consultés.
- Flèches gauche/droite et touches Début/Fin permettent de parcourir les trois onglets, avec un seul onglet dans l’ordre de tabulation.
- Chaque onglet est relié au panneau qu’il affiche pour les lecteurs d’écran.
- Les recherches, favoris et fichiers récemment consultés conservent leur fonctionnement et leurs données.

` + fs.readFileSync(changelog, 'utf8'));
const plan = path.join(appDir, 'PLAN-v0.7.md');
fs.writeFileSync(plan, `## Après Neos v0.6.35
- Vérifier au clavier et avec un lecteur d’écran la fenêtre Accès aux fichiers sur le NAS.
- Poursuivre l’audit des autres fenêtres complexes avant v0.7.

` + fs.readFileSync(plan, 'utf8'));
console.log('Patched Neos v0.6.35');
