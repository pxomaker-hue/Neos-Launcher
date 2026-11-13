const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const write = (file,content) => fs.writeFileSync(path.join(root,file),content);
function replace(source,before,after){
  if(!before||source.split(before).length!==2)throw Error('Ancre inattendue : '+before.slice(0,90));
  return source.replace(before,()=>after);
}
let js=read('js/app.js');
const edit=(before,after)=>{js=replace(js,before,after);};
const insert=(anchor,content)=>edit(anchor,content+anchor);
insert("  let noteView='edit';","  let noteQuery='';\n");

const taskMatcher=js.slice(js.indexOf('  function taskMatchesQuery('),js.indexOf('  function updateTaskSearch('));
edit(taskMatcher,taskMatcher.replace(
  '  function taskMatchesQuery(task,query){',
  '  function taskMatchesQuery(task,query){\n    return matchesWords([task.title,task.description,task.calendar],query);\n  }\n  function matchesWords(fields,query){'
).replace(
  "    const haystack=normalize([task.title,task.description,task.calendar].filter(Boolean).join(' '));",
  "    if(!terms.length)return true;\n    const haystack=normalize(fields.filter(Boolean).join(' '));"
));

const sidebar=js.split('\n').find(line=>line.includes('const sidebar=notesState.status'));
edit(sidebar,"    const sidebar=noteSearchMarkup()+`<div data-note-list>${noteListMarkup()}</div>`;");
insert('  function noteModule(){',[
  '  function noteListMarkup(){',
  "    if(notesState.status==='loading')return '<div class=\"neos-module-loader\" role=\"status\">Chargement des notes…</div>';",
  "    if(notesState.status==='error')return `<div class=\"neos-notes-error\" role=\"alert\">${esc(notesState.error)}</div>`;",
  '    const all=notesState.items;',
  '    const query=noteQuery.trim();',
  '    const matching=query?all.filter(note=>matchesWords([note.title,note.content],query)):all;',
  "    if(!all.length)return '<div class=\"neos-module-empty-small\">Aucune note.</div>';",
  '    const count=query?`<p class="neos-note-search-count" role="status">${matching.length} résultat${matching.length===1?\'\':\'s\'} sur ${all.length} notes chargées</p>`:\'\';',
  "    if(!matching.length)return count+'<div class=\"neos-module-empty-small\">Aucune note ne correspond à cette recherche.</div>';",
  '    const rows=matching.map(note=>{',
  '      const active=String(note.id)===String(notesState.selected);',
  '      return `<button type="button" class="neos-note-row ${active?\'is-active\':\'\'}" data-action="note-select" data-note-id="${esc(note.id)}" ${active?\'aria-current="true"\':\'\'}><strong>${esc(note.title||\'Sans titre\')}</strong><span>${esc(note.category||\'Notes\')} · ${ago(note.modified)}</span></button>`;',
  "    }).join('');",
  '    return count+rows;',
  '  }',
  '  function noteSearchMarkup(){',
  "    if(notesState.status!=='ready'||!notesState.items.length)return '';",
  '    return `<div class="neos-note-search"><label class="neos-sr-only" for="neos-note-query">Rechercher dans les notes chargées</label><input id="neos-note-query" type="search" data-note-search maxlength="180" value="${esc(noteQuery)}" placeholder="Titre ou contenu…" autocomplete="off"><button type="button" class="neos-btn" data-action="note-search-clear" ${noteQuery?\'\':\'hidden\'}>Effacer</button></div>`;',
  '  }',
  '  function updateNoteSearch(event){',
  '    const field=event.target;',
  "    if(!field.matches?.('[data-note-search]')||event.isComposing||field.value===noteQuery)return;",
  '    noteQuery=field.value.slice(0,180);',
  "    const results=surface.querySelector('[data-note-list]');",
  '    if(results)results.innerHTML=noteListMarkup();',
  "    const clear=surface.querySelector('[data-action=\"note-search-clear\"]');",
  '    if(clear)clear.hidden=!noteQuery;',
  '  }',
  ''
].join('\n'));
insert("    else if(action==='note-select')",[
  "    else if(action==='note-search-clear'){",
  "      const field=surface.querySelector('[data-note-search]');",
  "      if(field){field.value='';updateNoteSearch({target:field});field.focus({preventScroll:true});}",
  '    }',
  ''
].join('\n'));
insert("  surface.addEventListener('input',updateTaskSearch);","  surface.addEventListener('input',updateNoteSearch);\n  surface.addEventListener('compositionend',updateNoteSearch);\n");
edit('NEOS 0.6.50</span>','NEOS 0.6.51</span>');
write('js/app.js',js);
write('appinfo/info.xml',replace(read('appinfo/info.xml'),'<version>0.6.50</version>','<version>0.6.51</version>'));
fs.appendFileSync(path.join(root,'css/app.css'),`
#nova-root .neos-note-search{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap}
#nova-root .neos-note-search input{flex:1 1 110px;min-width:0;min-height:38px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--panel-2);color:var(--text);font:inherit}
#nova-root .neos-note-search button[hidden]{display:none}
#nova-root .neos-note-search-count{margin:5px 6px;color:var(--muted);font-size:12px}
`);
const release='## Neos v0.6.51 — Recherche dans Notes\n\n'
  +'- Recherche par titre et contenu dans les notes chargées, avec compteur de résultats et bouton Effacer. Les accents et majuscules sont ignorés.\n'
  +'- La recherche filtre la liste pendant la saisie et laisse la note sélectionnée et le brouillon ouverts.\n\n';
for(const file of ['README.md','CHANGELOG.md'])write(file,release+read(file));
