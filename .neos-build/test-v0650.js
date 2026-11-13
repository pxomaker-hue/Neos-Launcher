const {execFileSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const file=process.argv[2];
execFileSync(process.execPath,[path.join(__dirname,'test-v0649.js'),file],{stdio:'inherit'});
const source=fs.readFileSync(file,'utf8');
function extract(from,to){
  const start=source.indexOf('  '+from),end=source.indexOf('  '+to,start+1);
  assert.ok(start>=0&&end>start,from);
  return source.slice(start,end);
}
function load(code,name,deps){
  return new Function(...Object.keys(deps),code+'\nreturn '+name+';')(...Object.values(deps));
}
async function test(){
  const now=new Date(2026,10,13,12);
  const groupware={status:'ready',taskSuccess:1,taskErrors:[{calendar:'Privé'}],tasks:[
    {dueDate:'2026-11-13'},{dueDate:'2026-11-12'},{dueDate:'2026-11-12',done:true}
  ]};
  const overview={calendar:[
    {start:new Date(2026,10,13,17).toISOString(),title:'Plus tard'},
    {start:new Date(2026,10,13,9).toISOString(),title:'Passé'},
    {start:new Date(2026,10,13,14).toISOString(),title:'Prochain'}
  ]};
  const box=(_id,html)=>html;
  const esc=value=>String(value).replace(/</g,'&lt;');
  const summary=load(extract('function taskMatchesView(','function groupwareModule(')
    +extract('function summaryWidget(','function homeHasTasks('),'summaryWidget',{groupware,overview,box,esc,fmtTime:()=> '14 h',icon:()=>''});
  const html=summary(now);
  assert.match(html,/data-view="today"><strong>1/);
  assert.match(html,/data-view="overdue"><strong>1/);
  assert.match(html,/>Prochain</);
  assert.doesNotMatch(html,/>Passé<|>Plus tard</);
  assert.match(html,/Certaines listes/);
  groupware.status='loading';
  assert.match(summary(now),/data-view="today"><strong>—/);
  groupware.status='ready';groupware.taskErrors=[];groupware.tasks=[];
  assert.match(summary(now),/data-view="today"><strong>0/);
  const fallback=load(extract('function homeTaskSelection(','function tasksWidget('),'homeTaskSelection',{
    groupware,overview:{tasks:[{title:'Ancien aperçu'}]}
  });
  assert.deepEqual(fallback().items,[]);

  const browser={path:'/',loading:false,items:[]};
  const calls=[];
  const recent=load("let activeWorkspace='home';\n"+extract('async function openHomeRecent(','function homeExplorerWidget('),'openHomeRecent',{
    browser,chooseWorkspace:async()=>{},browse:async()=>{throw Error('navigation refusée');},
    selectEntry:async()=>{},previewFromDav:async()=>{throw Error('aperçu inattendu');},number:Number,safeUrl:String,toast:()=>{}
  });
  await recent({folder:'/projet'});
  const open=load("let activeWorkspace='files';\n"+extract('async function openHomeRecent(','function homeExplorerWidget('),'openHomeRecent',{
    browser,chooseWorkspace:async()=>{},browse:async folder=>{browser.path=folder;},
    selectEntry:async p=>{calls.push(p);},previewFromDav:async(...args)=>{calls.push(args);},number:Number,safeUrl:String,toast:()=>{}
  });
  const info={folder:'/projet',name:'rapport.pdf',mime:'application/pdf',size:'12',path:'/projet/rapport.pdf',url:'/remote.php/dav/files/test/projet/rapport.pdf'};
  await open(info);
  assert.deepEqual(calls[0],[info.url,info.name,info.mime,12,info.path]);
  browser.items.push({path:info.path,kind:'file'});
  await open(info);
  assert.equal(calls[1],info.path);

  const note=load(extract('let homeNoteDraft=null;','function visibleFileEntries('),'notesWidget',{
    settings:{notes:'Note enregistrée'},surface:{},box,esc,icon:()=>''
  });
  assert.match(note(),/Note enregistrée/);
  assert.match(note(),/data-home-note-status/);
  console.log('Accueil : compteurs et états, prochain événement et raccourci fichier hors première page OK');
}
test().catch(error=>{console.error(error);process.exitCode=1;});
