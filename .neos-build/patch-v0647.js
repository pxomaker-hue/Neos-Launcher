const fs=require('node:fs'),path=require('node:path');const dir=process.argv[2];
function once(s,a,b){if(s.split(a).length!==2)throw Error('Missing/duplicate anchor: '+a.slice(0,70));return s.replace(a,()=>b);}
const file=path.join(dir,'js/app.js');let js=fs.readFileSync(file,'utf8');
js=once(js,"  let taskView='open';","  let taskView='open';\n  let taskQuery='';");
js=once(js,'  function taskMatchesView(',`  function taskMatchesQuery(task,query){
    const normalize=value=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLocaleLowerCase('fr');
    const terms=normalize(query).trim().split(/\\s+/).filter(Boolean);
    const haystack=normalize([task.title,task.description,task.calendar].filter(Boolean).join(' '));
    return terms.every(term=>haystack.includes(term));
  }
  function updateTaskSearch(event){
    const input=event.target;
    if(!input.matches?.('[data-task-search]')||event.isComposing)return;
    taskQuery=input.value.slice(0,180);
    const start=input.selectionStart,end=input.selectionEnd;
    render();
    const next=surface.querySelector('[data-task-search]');
    if(next){next.focus({preventScroll:true});if(start!==null&&end!==null)next.setSelectionRange(start,end);}
  }
  function taskMatchesView(`);
js=once(js,'const filteredTasks=records.filter(t=>taskMatchesView(t,taskView,taskNow));','const matchingTasks=records.filter(t=>taskMatchesQuery(t,taskQuery));\n    const filteredTasks=matchingTasks.filter(t=>taskMatchesView(t,taskView,taskNow));');
js=once(js,'${records.filter(t=>taskMatchesView(t,id,taskNow)).length}','${matchingTasks.filter(t=>taskMatchesView(t,id,taskNow)).length}');
js=once(js,'else content=`<div class="neos-task-filters">','else content=`<div class="neos-task-searchbar"><label class="neos-task-search"><span class="neos-sr-only">Rechercher dans les tâches</span><input type="search" data-task-search maxlength="180" placeholder="Titre, description ou liste…" value="${esc(taskQuery)}" autocomplete="off"></label>${taskQuery?\'<button type="button" class="neos-btn" data-action="task-search-clear">Effacer</button>\':\'\'}</div>${taskQuery?`<p class="neos-task-search-summary" role="status">${filteredTasks.length} résultat${filteredTasks.length===1?\'\':\'s\'} dans cette vue · tâches chargées</p>`:\'\'}<div class="neos-task-filters">');
js=once(js,"    else if(action==='task-view')", "    else if(action==='task-search-clear'){taskQuery='';render();surface.querySelector('[data-task-search]')?.focus({preventScroll:true});}\n    else if(action==='task-view')");
js=once(js,"  surface.addEventListener('input', event => {","  surface.addEventListener('input',updateTaskSearch);\n  surface.addEventListener('compositionend',updateTaskSearch);\n  surface.addEventListener('input', event => {");
js=once(js,'NEOS 0.6.46</span>','NEOS 0.6.47</span>');fs.writeFileSync(file,js);
fs.appendFileSync(path.join(dir,'css/app.css'),'\n/* v0.6.47: task search */\n#nova-root .neos-task-searchbar{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}\n#nova-root .neos-task-search{flex:1;min-width:160px}\n#nova-root .neos-task-search input{width:100%;min-height:40px;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel-2);color:var(--text);font:inherit}\n#nova-root .neos-task-search-summary{color:var(--muted);font-size:12px;margin:0 0 10px}\n');
const info=path.join(dir,'appinfo/info.xml');fs.writeFileSync(info,once(fs.readFileSync(info,'utf8'),'<version>0.6.46</version>','<version>0.6.47</version>'));
for(const name of ['README.md','CHANGELOG.md']){const p=path.join(dir,name);fs.writeFileSync(p,'## Neos v0.6.47 — Recherche dans les tâches\n\nRecherche par titre, description et liste, combinée aux vues d’échéance. Les accents et majuscules sont ignorés ; plusieurs mots doivent tous correspondre. Les compteurs suivent la recherche parmi les tâches chargées. Bouton Effacer et curseur conservé pendant la saisie.\n\n'+fs.readFileSync(p,'utf8'));}
