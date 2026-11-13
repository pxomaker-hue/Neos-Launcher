const fs=require('node:fs');
const path=require('node:path');
const root=process.argv[2];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const write=(file,data)=>fs.writeFileSync(path.join(root,file),data);
function replace(source,before,after){
  if(!before||source.split(before).length!==2)throw Error('Ancre inattendue : '+before.slice(0,100));
  return source.replace(before,()=>after);
}
let js=read('js/app.js');
const edit=(before,after)=>{js=replace(js,before,after);};
const insert=(anchor,value)=>edit(anchor,value+anchor);
function replaceFunction(name,next,body){
  const start=js.indexOf('  '+name),end=js.indexOf('  '+next,start+1);
  if(start<0||end<=start)throw Error('Fonction introuvable : '+name);
  edit(js.slice(start,end),body+'\n');
}

edit("calendar:'Agenda', tasks:'Tâches', summary:'Synthèse'", "calendar:'Agenda', tasks:'Tâches', summary:'À suivre'");
replaceFunction('function summaryWidget()', 'function homeExplorerWidget()', [
  '  function summaryWidget(now=new Date()) {',
  "    const tasksKnown=groupware.status==='ready'&&groupware.taskSuccess>0;",
  '    const partial=tasksKnown&&groupware.taskErrors?.length;',
  "    const metric=(view,label)=>{",
  '      const count=tasksKnown?groupware.tasks.filter(task=>taskMatchesView(task,view,now)).length:\'—\';',
  '      return `<button type="button" class="neos-home-summary-metric" data-action="home-task-view" data-view="${view}"><strong>${count}</strong><span>${label}</span></button>`;',
  '    };',
  "    let status='';",
  "    if(partial)status='Certaines listes de tâches n’ont pas été chargées.';",
  "    else if(groupware.status==='loading'||groupware.status==='idle')status='Chargement des tâches…';",
  "    else if(!tasksKnown)status='Aucun compteur de tâches disponible.';",
  '    const next=(overview?.calendar||[]).filter(event=>Date.parse(event.start)>=+now)',
  '      .sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))[0];',
  '    const event=next?`<strong>${esc(next.title||\'Sans titre\')}</strong><small>${esc(fmtTime(next.start))}${next.calendar?\' · \'+esc(next.calendar):\'\'}</small>`:',
  "      '<small>Aucun événement à venir dans l’aperçu.</small>';",
  '    return box(\'summary\',`<div class="neos-home-summary-grid">${metric(\'today\',\'À faire aujourd’hui\')}${metric(\'overdue\',\'En retard\')}</div>${status?`<p class="neos-home-summary-status" role="status">${status}</p>`:\'\'}<button type="button" class="neos-home-summary-event" data-action="workspace" data-workspace="planning"><span>Prochain événement</span>${event}<small>Voir le planning ${icon(\'chevron\',14)}</small></button>`);',
  '  }'
].join('\n'));
insert('  function homeExplorerWidget(){',[
  '  function homeHasTasks(){',
  "    return ['tasks','summary'].some(widget=>!settings.hidden.includes(widget));",
  '  }',
  '  function recentFileAttributes(file){',
  '    return `data-action="home-open-recent" data-folder="${esc(file.folder||\'/\')}" data-name="${esc(file.name)}" data-path="${esc(file.path||\'\')}" data-url="${esc(file.davUrl||\'\')}" data-mime="${esc(file.mime||\'\')}" data-size="${number(file.size)}"`;',
  '  }',
  '  async function openHomeRecent(file){',
  "    const folder=file.folder||'/';",
  "    await chooseWorkspace('files');",
  "    if(activeWorkspace!=='files')return;",
  "    if(folder!==browser.path||browser.loading)await browse(folder);",
  "    if(activeWorkspace!=='files'||browser.path!==folder)return;",
  "    const entry=browser.items.find(item=>item.kind==='file'&&(file.path?item.path===file.path:item.name===file.name));",
  '    if(entry){await selectEntry(entry.path);return;}',
  "    if(file.url&&safeUrl(file.url)!=='#'&&/^\\/(?!\\/)/.test(file.url)){",
  "      await previewFromDav(file.url,file.name,file.mime,number(file.size),file.path||'');return;",
  '    }',
  "    toast('Ce fichier n’est plus disponible dans l’aperçu.','info');",
  '  }',
  ''
].join('\n'));
edit('<strong>${number(browser.total)}</strong><span>éléments dans ${esc(browser.path)}</span>', '<strong>${browser.loading||browser.error?\'—\':number(browser.total)}</strong><span>${browser.loading?\'Chargement du dossier…\':browser.error?\'Dossier indisponible\':`éléments dans ${browser.path===\'/\'?\'la racine\':esc(browser.path)}`}</span>');
edit('data-action="home-open-recent" data-folder="${esc(f.folder||\'/\')}" data-name="${esc(f.name)}"', '${recentFileAttributes(f)}');
edit('data-action="preview-dav" data-url="${safeUrl(f.davUrl || \'\')}" data-name="${esc(f.name)}" data-mime="${esc(f.mime || \'\')}" data-size="${Number(f.size)||0}" data-path="${esc(f.path||\'\')}"', '${recentFileAttributes(f)}');
edit(js.split('\n').find(line=>line.includes("else if(action==='home-open-recent')")),"    else if(action==='home-open-recent'){void openHomeRecent({...target.dataset});}");
insert("    else if(action==='home-task-open')",[
  "    else if(action==='home-task-view'){",
  "      taskView=target.dataset.view==='overdue'?'overdue':'today';",
  "      taskQuery='';taskList='';taskVisible=TASK_PAGE_SIZE;",
  "      void chooseWorkspace('tasks');",
  '    }',
  ''
].join('\n'));
const taskWidgetGate="!settings.hidden.includes('tasks')";
if(js.split(taskWidgetGate).length!==4)throw Error('Conditions de chargement de l’accueil inattendues');
js=js.replaceAll(taskWidgetGate,'homeHasTasks()');
edit("if(id==='deck'&&el.checked&&deckState.status==='idle')void loadDeck();", "if(id==='deck'&&el.checked&&deckState.status==='idle')void loadDeck(); if(el.checked&&['summary','tasks'].includes(id)&&groupware.status==='idle')void loadGroupware();");
edit("const caldav=canonical.length?canonical:unique(dashboard.filter(t=>t.source!=='deck'),'caldav');", "const caldav=fresh?canonical:unique(dashboard.filter(t=>t.source!=='deck'),'caldav');");
edit("      if(fields.type==='task'&&!demo)void load(true);", "      if(!demo)void load(true);");
insert('    const knownQuota=data.total', `    if(data.used==null)return box('storage','<div class="neos-empty" role="status">Informations de stockage indisponibles.</div>');
`);
const agendaLine=js.split('\n').find(line=>line.includes("return box('calendar', list.length"));
edit(agendaLine,agendaLine
  .replace("return box('calendar', list.length ?","const content=list.length ?")
  .replace("'<div class=\"neos-empty\">Aucun événement.</div>', '30 j');","'<div class=\"neos-empty\">Aucun événement à venir dans l’aperçu.</div>';\n    return box('calendar',content+'<div class=\"neos-task-widget-footer\"><button type=\"button\" class=\"neos-btn\" data-action=\"workspace\" data-workspace=\"calendar\">Ouvrir Agenda</button></div>','30 jours');"));

insert('  function notesWidget(){', [
  "  let homeNoteDraft=null;",
  "  let homeNoteStatus='';",
  "  function setHomeNoteStatus(message){",
  "    homeNoteStatus=message;",
  "    const status=surface.querySelector('[data-home-note-status]');",
  "    if(status)status.textContent=message;",
  "  }",
  ''
].join('\n'));
edit('<textarea id="neos-note" class="neos-note" placeholder="" spellcheck="false">${esc(settings.notes || \'\')}</textarea><div class="neos-note-tools">','<textarea id="neos-note" class="neos-note" aria-label="Note rapide" placeholder="Écrire une note rapide…" spellcheck="false">${esc(homeNoteDraft??settings.notes??\'\')}</textarea><div class="neos-note-tools"><span role="status" data-home-note-status>${esc(homeNoteStatus)}</span>');
edit("else if (action === 'save-note') { settings.notes = surface.querySelector('#neos-note')?.value || ''; queueSave(); toast('Note enregistrée', 'success'); }",[
  "else if (action === 'save-note') {",
  "      const note=(homeNoteDraft??surface.querySelector('#neos-note')?.value??'').trim();",
  "      if(new TextEncoder().encode(note).length>3000){setHomeNoteStatus('Note trop longue. Raccourcis-la avant d’enregistrer.');return;}",
  "      homeNoteDraft=note;settings.notes=note;",
  "      if(demo){setHomeNoteStatus('Enregistrée pour cet aperçu');return;}",
  "      setHomeNoteStatus('Enregistrement…');queueSave();",
  "    }"
].join('\n'));
insert("    if(el.matches('[data-note-title]'))", "    if(el.matches('#neos-note')){homeNoteDraft=el.value;setHomeNoteStatus('Modifications non enregistrées');return;}\n");
insert("      updateSaveIndicator('Enregistrement…');","      const notePending=homeNoteStatus==='Enregistrement…';\n      const noteSent=settings.notes;\n");
insert("        updateSaveIndicator('Enregistré');", "        if(notePending&&homeNoteStatus==='Enregistrement…'&&homeNoteDraft===noteSent&&!saveQueued)setHomeNoteStatus('Note enregistrée');\n");
insert("        updateSaveIndicator('Erreur');", "        if(homeNoteStatus==='Enregistrement…')setHomeNoteStatus('Échec de l’enregistrement');\n");

edit('NEOS 0.6.49</span>','NEOS 0.6.50</span>');
write('js/app.js',js);
write('appinfo/info.xml',replace(read('appinfo/info.xml'),'<version>0.6.49</version>','<version>0.6.50</version>'));
fs.appendFileSync(path.join(root,'css/app.css'),`
#nova-root .neos-home-summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#nova-root .neos-home-summary-metric,#nova-root .neos-home-summary-event{display:grid;justify-items:start;gap:4px;padding:10px 12px;text-align:left;color:var(--text);border:1px solid var(--line);border-radius:10px;background:var(--panel-2)}
#nova-root .neos-home-summary-metric:hover,#nova-root .neos-home-summary-event:hover{border-color:var(--accent)}
#nova-root .neos-home-summary-metric strong{font-size:1.45rem;line-height:1.15}
#nova-root .neos-home-summary-metric span,#nova-root .neos-home-summary-event span,#nova-root .neos-home-summary-event small,#nova-root .neos-home-summary-status{font-size:12px;color:var(--muted);overflow-wrap:anywhere}
#nova-root .neos-home-summary-event{width:100%;margin-top:9px}
#nova-root .neos-home-summary-event strong{overflow-wrap:anywhere;max-width:100%}
#nova-root .neos-home-summary-event small:last-child{display:flex;align-items:center;gap:4px}
#nova-root [data-home-note-status]{color:var(--muted);font-size:12px}
`);
const release='## Neos v0.6.50 — Accueil et widget À suivre\n\n'
  +'- À suivre remplace Synthèse avec les tâches du jour, les retards et le prochain événement. Les raccourcis ouvrent les vues correspondantes.\n'
  +'- Les fichiers récents ouvrent Fichiers avec un aperçu, y compris lorsque le fichier se trouve au-delà de la première page.\n'
  +'- Le stockage indisponible et les dossiers en chargement sont signalés. La note rapide conserve sa saisie pendant les actualisations et affiche le résultat de la sauvegarde.\n\n';
for(const file of ['README.md','CHANGELOG.md'])write(file,release+read(file));
