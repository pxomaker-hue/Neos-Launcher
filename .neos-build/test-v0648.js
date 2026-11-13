const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(process.argv[2],'utf8');
for(const version of ['0646','0647']){
  execFileSync(process.execPath,[path.join(__dirname,'test-v'+version+'.js'),process.argv[2]],{stdio:'inherit'});
}
function extract(from,to){
  const start=source.indexOf('  '+from);
  const end=source.indexOf('  '+to,start+1);
  assert.ok(start>=0&&end>start,from);
  return source.slice(start,end);
}
function load(code,name,deps={}){
  return new Function(...Object.keys(deps),code+'\nreturn '+name+';')(...Object.values(deps));
}
async function run(){
  const now=new Date();
  const window=load(extract('function calFetchWindow(){','function calVisibleDays(){'),'calFetchWindow',{
    calendarCursor:new Date(now.getFullYear(),now.getMonth()+5,1),activeWorkspace:'planning',planningRange:30
  })();
  assert.equal(window.start.toDateString(),now.toDateString());
  const end=new Date(window.start);end.setDate(end.getDate()+30);
  assert.equal(+window.end,+end);

  const noteCode=extract('let noteSavePending=false;','function deckDateFromInput(');
  const state={items:[{id:1,title:'Première'},{id:2,title:'Seconde'}],selected:1,draftTitle:'Première modifiée',draftContent:'Texte',dirty:true,source:'api'};
  let complete;
  const save=load(noteCode,'noteSave',{
    notesState:state,demo:false,moduleRequest:()=>new Promise(resolve=>{complete=resolve;}),notesUrl:()=>'/notes',
    activeWorkspace:'notes',render:()=>{},toast:()=>{}
  });
  const saving=save();
  state.selected=2;state.draftTitle='Seconde en cours';state.draftContent='Brouillon';state.dirty=true;
  complete({title:'Première modifiée',content:'Texte'});await saving;
  assert.equal(state.items[0].title,'Première modifiée');
  assert.equal(state.draftContent,'Brouillon');
  assert.equal(state.dirty,true);

  const fileCode=extract('async function requestFilePage(','async function browse(path,');
  const requests=[],browser={path:'/a',nextOffset:160,items:[{path:'/a/existant'}]};
  let respond;
  const file=load('let browseGeneration=1;\n'+fileCode,'{loadMoreFiles,cancel:()=>++browseGeneration}',{
    demo:false,root:{dataset:{filesUrl:'/api/files'}},window:{location:{href:'https://nextcloud.test/'}},
    api:url=>{requests.push(new URL(url));return new Promise(resolve=>{respond=resolve;});},browser,fileBusy:false,
    render:()=>{},activeWorkspace:'home',number:Number
  });
  const loading=file.loadMoreFiles();
  assert.equal(requests[0].searchParams.get('offset'),'160');
  respond({items:[{path:'/a/existant'},{path:'/a/suite'}],total:2,nextOffset:null});await loading;
  assert.deepEqual(browser.items.map(item=>item.path),['/a/existant','/a/suite']);
  assert.equal(browser.truncated,false);
  browser.nextOffset=320;
  const late=file.loadMoreFiles();file.cancel();
  respond({items:[{path:'/a/ancien'}],total:3,nextOffset:null});await late;
  assert.equal(browser.items.length,2);
  const picker={path:'/b',nextOffset:160,folders:[{path:'/b/existant'}],search:'test'};
  const pickerCode=extract('async function loadMoreDestinations(){','function openDestinationPicker(');
  const pickerLoad=load(fileCode+pickerCode,'loadMoreDestinations',{
    demo:false,root:{dataset:{filesUrl:'/api/files'}},window:{location:{href:'https://nextcloud.test/'}},
    api:async url=>{
      const query=new URL(url).searchParams;
      assert.equal(query.get('foldersOnly'),'1');
      assert.equal(query.get('offset'),'160');
      return {items:[{path:'/b/suite',kind:'folder'}],total:2,nextOffset:null};
    },
    pickerState:picker,pickerGeneration:1,renderFolderPicker:()=>{},popHost:{querySelector:()=>null},number:Number
  });
  await pickerLoad();
  assert.deepEqual(picker.folders.map(item=>item.path),['/b/existant','/b/suite']);
  assert.equal(picker.search,'test');

  const tasks=Array.from({length:180},(_,i)=>({
    title:i===179?'Dernière tâche':'Tâche '+i,href:'/task/'+i,calendarUrl:i>=120?'/b/':'/a/',calendar:i>=120?'Projet B':'Projet A'
  }));
  const taskModule=load(extract('function taskMatchesQuery(','function groupwareEditor('),'groupwareModule',{
    groupware:{status:'ready',tasks,calendars:[{tasks:true,canCreate:true}],taskSources:2,taskSuccess:2,taskErrors:[]},
    taskQuery:'',taskList:'/b/',taskView:'open',taskVisible:50,nativeModuleAvailable:()=>true,
    nativeModuleButton:()=>'',panelHeader:()=>'',icon:()=>'',esc:String
  });
  const html=taskModule('tasks');
  assert.match(html,/50 sur 60 tâches/);
  assert.match(html,/value="\/b\/" selected/);
  assert.doesNotMatch(html,/>Tâche 119</);
  const taskSearch=load(extract('function taskMatchesQuery(','function groupwareEditor('),'groupwareModule',{
    groupware:{status:'ready',tasks,calendars:[{tasks:true,canCreate:true}],taskSources:2,taskSuccess:2,taskErrors:[]},
    taskQuery:'derniere',taskList:'/b/',taskView:'open',taskVisible:50,nativeModuleAvailable:()=>true,
    nativeModuleButton:()=>'',panelHeader:()=>'',icon:()=>'',esc:String
  });
  assert.match(taskSearch('tasks'),/>Dernière tâche</);

  const eventCode=extract('function editableCalendarEvent(','function calendarEventDetail(')
    +extract('function updateEventIcs(','function taskIcsUpdates(');
  const start='2026-11-13T11:00:00.000Z',finish='2026-11-13T12:00:00.000Z';
  const event={etag:'"v1"',start,end:finish,calendarUrl:'/cal/',raw:[
    'BEGIN:VCALENDAR','BEGIN:VEVENT','UID:test','SUMMARY:Avant','DTSTART:20261113T110000Z','DTEND:20261113T120000Z',
    'X-NEOS:à conserver','BEGIN:VALARM','DESCRIPTION:Rappel','END:VALARM','END:VEVENT','END:VCALENDAR'
  ].join('\r\n')};
  const calendar=load(eventCode,'{editableCalendarEvent,updateEventIcs}',{
    groupware:{calendars:[{url:'/cal/',events:true,writable:true}]},icsUnfold:s=>s.replace(/\r\n/g,'\n'),
    icsEscape:String,icsUtc:()=> '20261113T130000Z',dateInputLocal:s=>s.slice(0,16),icsFold:s=>s
  });
  assert.equal(calendar.editableCalendarEvent(event),true);
  assert.equal(calendar.editableCalendarEvent({...event,raw:event.raw.replace('UID:test','UID:test\r\nRRULE:FREQ=DAILY')}),false);
  const updated=calendar.updateEventIcs(event,{title:'Après',description:'Rendez-vous',location:'Salle',start:start.slice(0,16),end:finish.slice(0,16)});
  assert.match(updated,/SUMMARY:Après/);
  assert.match(updated,/DTSTART:20261113T110000Z/);
  assert.match(updated,/X-NEOS:à conserver\nBEGIN:VALARM\nDESCRIPTION:Rappel\nEND:VALARM/);

  const attachmentRows=load(extract('function mailAttachmentRows(','function mailReadModule('),'mailAttachmentRows',{
    mailNative:p=>'/apps/mail'+p,esc:s=>String(s).replace(/</g,'&lt;'),icon:()=>''
  });
  const attachments=attachmentRows([{id:'1.2',fileName:'<rapport.pdf>'},{id:'../../bad',fileName:'incorrect'}],'42');
  assert.match(attachments,/\/messages\/42\/attachment\/1\.2/);
  assert.match(attachments,/&lt;rapport/);
  assert.doesNotMatch(attachments,/incorrect/);
  const original={folderKey:'1:7',messageId:'40',sortTime:1700000000000};
  const mailbox={id:'7',key:'1:7',cursor:1700000000,account:{id:'1'}};
  const mail={status:'ready',generation:1,items:[original],meta:{mailboxes:[mailbox]}};
  const older=load(extract('let mailDisplayCount=70;','async function fetchMail(){'),'loadOlderMail',{
    integrations:{mail},mailFolderFilter:'all',render:()=>{},mailNative:p=>'/apps/mail'+p,
    moduleRequest:async url=>{
      assert.equal(new URL(url,'https://nextcloud.test').searchParams.get('cursor'),'1700000000');
      return [{id:'40',dateInt:1700000000},{id:'39',dateInt:1699999000}];
    },
    mailEnvelopeList:messages=>messages,mailMessageToRow:(msg,_account,box)=>({messageId:msg.id,folderKey:box.key,sortTime:msg.dateInt*1000}),
    mailReader:{},activeWorkspace:'home'
  });
  await older();
  assert.deepEqual(mail.items.map(item=>item.messageId),['40','39']);
  assert.equal(mailbox.cursor,null);
  console.log('Notes, Planning, pagination Fichiers et Mail, édition Agenda et pièces jointes : scénarios ciblés OK');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
