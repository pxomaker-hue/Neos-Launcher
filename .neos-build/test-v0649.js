const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const file = process.argv[2];
execFileSync(process.execPath,[path.join(__dirname,'test-v0648.js'),file],{stdio:'inherit'});
const source = fs.readFileSync(file,'utf8');
function extract(start,end){
  const first=source.indexOf('  '+start),last=source.indexOf('  '+end,first+1);
  assert.ok(first>=0&&last>first,start);
  return source.slice(first,last);
}
const code=extract('const deckFilters=','const deckCardEditor=')
  +extract('function deckDueLabel(','// Calendar navigation')
  +extract('function taskMatchesQuery(','function groupwareModule(')
  +extract('async function moveDeckCard(','async function saveDeckCard(');
const today=new Date();
const day=offset=>{
  const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()+offset,12);
  return date.toISOString();
};
const first={id:1,title:'À faire',cards:[
  {id:11,title:'Préparer le dossier',description:'Réunion équipe',duedate:day(-1)},
  {id:12,title:'Préparer la livraison',description:'Équipe',duedate:day(2),done:day(0)},
  {id:13,title:'Préparer la réunion',description:'Équipe',duedate:day(0)}
]};
const second={id:2,title:'Terminé',cards:[]};
const deckState={boardId:7,boards:[{id:7,title:'Projet'}],stacks:[first,second],status:'ready'};
let rendered;
const moduleForTest=new Function('deckState','icon','panelHeader','esc','safeUrl','moduleLink','emptyModule','afterRender',`
  const demo=false,activeWorkspace='deck',planningDeck={status:'idle'};
  let deckMoveBusy=false,deckDrag=null;
  const toast=()=>{};
  const render=()=>afterRender(deckModule());
  const deckCardApiPath=()=>'/card';
  const deckRequest=async()=>deckState.stacks[0].cards[0];
  const deckCardPayload=()=>({});
  const deckNextOrder=()=>1;
  const deckPersistMove=async({cardId})=>{
    const [from,to]=deckState.stacks;
    const card=from.cards.find(item=>item.id===cardId);
    from.cards=from.cards.filter(item=>item!==card);
    to.cards.push(card);
    render();
  };
  ${code}
  return {deckModule,deckFilters,deckCardMatches,moveDeckCard};
`)(deckState,()=>'',()=>'',value=>String(value).replace(/</g,'&lt;').replace(/"/g,'&quot;'),String,()=>'/deck',String,html=>{rendered=html;});
const {deckModule,deckFilters,deckCardMatches,moveDeckCard}=moduleForTest;
Object.assign(deckFilters,{query:'PREPARER equipe',status:'open',due:'overdue'});
const filtered=deckModule();
assert.match(filtered,/1 sur 3 cartes/);
assert.match(filtered,/data-card-id="11"/);
assert.doesNotMatch(filtered,/data-card-id="1[23]"/);
assert.match(filtered,/data-deck-drop-stack="2"/);
assert.match(filtered,/data-action="deck-add" data-stack-id="2"/);
assert.equal(first.cards.length,3);
assert.ok(deckCardMatches(first.cards[1],{query:'',status:'done',due:'upcoming'},today));
assert.ok(deckCardMatches(first.cards[2],{query:'',status:'open',due:'today'},today));
assert.equal(deckCardMatches(first.cards[2],{query:'',status:'all',due:'undated'},today),false);
assert.match(deckModule(),/value="PREPARER equipe"/);
moveDeckCard(1,11,2).then(()=>{
  assert.equal(first.cards.length,2);
  assert.equal(second.cards[0].id,11);
  assert.match(rendered,/1 sur 3 cartes/);
  assert.match(rendered,/data-deck-drop-stack="2"[\s\S]*draggable="true" data-action="deck-card-open" data-stack-id="2" data-card-id="11"/);
  console.log('Deck : recherche combinée, échéances et déplacement avec filtre actif OK');
}).catch(error=>{console.error(error);process.exitCode=1;});
