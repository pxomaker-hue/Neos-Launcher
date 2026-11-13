const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content);
function replace(source, before, after) {
  if (!before || source.split(before).length !== 2) throw Error('Ancre inattendue : ' + before.slice(0, 90));
  return source.replace(before, () => after);
}

let js = read('js/app.js');
const edit = (before, after) => { js = replace(js, before, after); };
const insert = (anchor, content) => edit(anchor, content + anchor);
insert('  const deckCardEditor=', `  const deckFilters={boardId:null,query:'',status:'all',due:'all'};
  const deckStatusOptions=[['all','Tous les états'],['open','À faire'],['done','Terminées']];
  const deckDueOptions=[['all','Toutes les échéances'],['overdue','Date passée'],['today','Aujourd’hui'],['upcoming','7 prochains jours'],['undated','Sans échéance']];
`);
insert('  function deckModule(){', [
  '  function deckCardMatches(card,filters,now){',
  "    if(filters.status==='open'&&card.done)return false;",
  "    if(filters.status==='done'&&!card.done)return false;",
  '    return taskMatchesQuery(card,filters.query)&&taskMatchesView({due:card.duedate},filters.due,now);',
  '  }',
  '  function deckFiltersMarkup(visible,total,filtered){',
  '    const options=(choices,value)=>choices.map(([id,label])=>`<option value="${id}" ${id===value?\'selected\':\'\'}>${label}</option>`).join(\'\');',
  '    return `<div class="neos-deck-filters">',
  '      <label class="neos-deck-search"><span>Rechercher</span><input type="search" data-deck-search maxlength="180" value="${esc(deckFilters.query)}" placeholder="Titre ou description…" autocomplete="off"></label>',
  '      <label><span>État</span><select data-deck-filter="status">${options(deckStatusOptions,deckFilters.status)}</select></label>',
  '      <label><span>Échéance</span><select data-deck-filter="due">${options(deckDueOptions,deckFilters.due)}</select></label>',
  '      ${filtered?\'<button type="button" class="neos-btn" data-action="deck-filters-clear">Effacer les filtres</button>\':\'\'}',
  '    </div><p class="neos-deck-filter-count" role="status">${filtered?`${visible} sur ${total} cartes`:`${total} carte${total===1?\'\':\'s\'}`}</p>`;',
  '  }',
  '  function renderDeckFilters(selector,selection){',
  "    const scroll=surface.querySelector('.neos-kanban')?.scrollLeft||0;",
  '    render();',
  "    const board=surface.querySelector('.neos-kanban');",
  '    if(board)board.scrollLeft=scroll;',
  '    const control=surface.querySelector(selector);',
  '    control?.focus({preventScroll:true});',
  '    if(control&&selection?.every(Number.isInteger))control.setSelectionRange(...selection);',
  '  }',
  '  function updateDeckSearch(event){',
  '    const field=event.target;',
  "    if(!field.matches?.('[data-deck-search]')||event.isComposing||field.value===deckFilters.query)return;",
  '    deckFilters.query=field.value.slice(0,180);',
  "    renderDeckFilters('[data-deck-search]',[field.selectionStart,field.selectionEnd]);",
  '  }',
  ''
].join('\n'));
const stackMarkup=js.split('\n').find(line=>line.includes('const stacks=deckState.stacks.map(stack=>'));
edit(stackMarkup,[
  '    const now=new Date();',
  "    const filtered=Boolean(deckFilters.query.trim())||deckFilters.status!=='all'||deckFilters.due!=='all';",
  '    let total=0,visible=0;',
  '    const stacks=deckState.stacks.map(stack=>{',
  '      const cards=stack.cards||[];',
  '      const matching=filtered?cards.filter(card=>deckCardMatches(card,deckFilters,now)):cards;',
  '      total+=cards.length;visible+=matching.length;',
  stackMarkup.trim()
    .replace('const stacks=deckState.stacks.map(stack=>','      return ')
    .replace('${(stack.cards||[]).length}','${filtered?`${matching.length}/${cards.length}`:cards.length}')
    .replace('${(stack.cards||[]).map(card=>','${matching.map(card=>')
    .replace(".join('')}</div>", ".join('')||(filtered?'<p class=\"neos-deck-stack-empty\">Aucun résultat</p>':'')}</div>")
    .replace("`).join('');","`;"),
  "    }).join('');"
].join('\n'));
edit('${boardButtons}</div><p class="neos-deck-instructions">','${boardButtons}</div>${deckFiltersMarkup(visible,total,filtered)}<p class="neos-deck-instructions">');
insert("    deckState.boardId=id;deckState.status='loading';", [
  "    if(deckFilters.boardId!==String(id)){",
  "      Object.assign(deckFilters,{boardId:String(id),query:'',status:'all',due:'all'});",
  '    }',
  ''
].join('\n'));
insert("    else if(action==='deck-card-open')", [
  "    else if(action==='deck-filters-clear'){",
  "      Object.assign(deckFilters,{query:'',status:'all',due:'all'});",
  "      renderDeckFilters('[data-deck-search]');",
  '    }',
  ''
].join('\n'));
insert("  surface.addEventListener('input',updateTaskSearch);", [
  "  surface.addEventListener('input',updateDeckSearch);",
  "  surface.addEventListener('compositionend',updateDeckSearch);",
  "  surface.addEventListener('change',event=>{",
  '    const field=event.target;',
  "    if(!field.matches('[data-deck-filter]'))return;",
  '    const key=field.dataset.deckFilter;',
  "    const options=key==='status'?deckStatusOptions:key==='due'?deckDueOptions:[];",
  '    if(!options.some(([id])=>id===field.value))return;',
  '    deckFilters[key]=field.value;',
  '    renderDeckFilters(\'[data-deck-filter="\'+key+\'"]\');',
  '  });',
  ''
].join('\n'));
// Refresh the cards after releasing the lock so the next drag can start.
edit("target.cards.push({...card,stackId:target.id});render();","target.cards.push({...card,stackId:target.id});");
edit("finally{deckMoveBusy=false;deckDrag=null;}","finally{deckMoveBusy=false;deckDrag=null;if(activeWorkspace==='deck')render();}");
edit('NEOS 0.6.48</span>','NEOS 0.6.49</span>');
write('js/app.js',js);
write('appinfo/info.xml',replace(read('appinfo/info.xml'),'<version>0.6.48</version>','<version>0.6.49</version>'));
fs.appendFileSync(path.join(root,'css/app.css'),`
#nova-root .neos-deck-filters{display:flex;align-items:end;flex-wrap:wrap;gap:10px;margin:14px 0 5px}
#nova-root .neos-deck-filters label{display:grid;gap:4px;color:var(--muted);font-size:12px;font-weight:650;min-width:0}
#nova-root .neos-deck-filters .neos-deck-search{flex:1 1 220px}
#nova-root .neos-deck-filters input,#nova-root .neos-deck-filters select{width:100%;min-height:40px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel-2);color:var(--text);font:inherit}
#nova-root .neos-deck-filter-count,#nova-root .neos-deck-stack-empty{color:var(--muted);font-size:12px}
#nova-root .neos-deck-stack-empty{padding:8px 4px;pointer-events:none}
`);
const release='## Neos v0.6.49 — Recherche et filtres Deck\n\n'
  +'- Recherche dans les titres et descriptions du tableau ouvert, sans distinction d’accents ou de casse.\n'
  +'- Filtres combinables par état et échéance, avec compteurs par colonne. Une colonne sans résultat reste disponible pour ajouter ou déplacer une carte.\n'
  +'- Les filtres sont conservés pendant l’actualisation du tableau et réinitialisés lors d’un changement de tableau.\n\n';
for(const file of ['README.md','CHANGELOG.md'])write(file,release+read(file));
