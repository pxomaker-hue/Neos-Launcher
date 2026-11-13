const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const file = process.argv[2];
execFileSync(process.execPath,[path.join(__dirname,'test-v0650.js'),file],{stdio:'inherit'});
const js=fs.readFileSync(file,'utf8');
function extract(start,end){
  const a=js.indexOf('  '+start),b=js.indexOf('  '+end,a+1);
  assert.ok(a>=0&&b>a,start);
  return js.slice(a,b);
}
const notesState={status:'ready',source:'files',items:[
  {id:1,title:'Budget',content:'Préparer la réunion',category:'Travail'},
  {id:2,title:'Équipe <Nord>',content:'Feuille de route'}
],selected:1,draftTitle:'Budget modifié',draftContent:'Brouillon non enregistré',dirty:true};
const list={innerHTML:''},clear={hidden:true};
const surface={querySelector:selector=>({
  '[data-note-list]':list,'[data-action="note-search-clear"]':clear
})[selector]};
const code=extract('function taskMatchesQuery(','function updateTaskSearch(')
  +extract('function noteListMarkup(','function deckDueLabel(');
const app=new Function('notesState','surface','esc','ago','panelHeader','icon','emptyModule',`
  let noteQuery='',noteView='edit';
  ${code}
  return {noteListMarkup,updateNoteSearch,noteModule};
`)(notesState,surface,value=>String(value).replace(/</g,'&lt;').replace(/"/g,'&quot;'),()=>'',()=>'',()=>'',String);
const field={value:'EQUIPE route',matches:selector=>selector==='[data-note-search]'};
app.updateNoteSearch({target:field,isComposing:true});
assert.equal(list.innerHTML,'');
app.updateNoteSearch({target:field});
assert.match(list.innerHTML,/1 résultat sur 2 notes chargées/);
assert.match(list.innerHTML,/Équipe &lt;Nord>/);
assert.doesNotMatch(list.innerHTML,/data-note-id="1"/);
assert.equal(clear.hidden,false);
const moduleHtml=app.noteModule();
assert.match(moduleHtml,/Budget modifié/);
assert.match(moduleHtml,/Brouillon non enregistré/);
assert.equal(notesState.selected,1);
assert.equal(notesState.dirty,true);
field.value='réunion';app.updateNoteSearch({target:field});
assert.match(list.innerHTML,/data-note-id="1" aria-current="true"/);
field.value='inconnue';app.updateNoteSearch({target:field});
assert.match(list.innerHTML,/0 résultats sur 2 notes chargées/);
field.value='';app.updateNoteSearch({target:field});
assert.equal(clear.hidden,true);
assert.match(list.innerHTML,/data-note-id="2"/);
console.log('Notes : recherche par titre et contenu, liste vide et conservation du brouillon OK');
