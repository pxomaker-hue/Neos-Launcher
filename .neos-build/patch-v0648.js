const fs=require('node:fs'),path=require('node:path');
const root=process.argv[2];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const write=(file,data)=>fs.writeFileSync(path.join(root,file),data);
function replace(source,before,after){
  if(!before||source.split(before).length!==2)throw Error('Ancre inattendue : '+before.slice(0,100));
  return source.replace(before,()=>after);
}
let js=read('js/app.js');
const edit=(before,after)=>{js=replace(js,before,after);};
const insert=(anchor,content)=>edit(anchor,content+anchor);

insert('  async function noteSave(){','  let noteSavePending=false;\n');
edit('if(!n||n.readonly)return;','if(!n||n.readonly||noteSavePending)return;');
insert("    try{const result=demo?{...n,title:notesState.draftTitle,content:notesState.draftContent,etag:'demo2'}:", "    const title=notesState.draftTitle,content=notesState.draftContent;\n    noteSavePending=true;\n");
edit("Object.assign(n,result);notesState.draftTitle=n.title||'';notesState.draftContent=n.content||'';notesState.dirty=false;render();toast('Note enregistrée','success');",
  `Object.assign(n,result);
      if(notesState.selected===n.id&&notesState.draftTitle===title&&notesState.draftContent===content){
        notesState.draftTitle=n.title||'';notesState.draftContent=n.content||'';notesState.dirty=false;
        if(activeWorkspace==='notes')render();
      }
      toast('Note enregistrée','success');`);
edit('  }\n  function deckDateFromInput','    finally{noteSavePending=false;}\n  }\n  function deckDateFromInput');

const oldWindow=js.slice(js.indexOf('  function calFetchWindow(){'),js.indexOf('  function calVisibleDays(){'));
edit(oldWindow,`  function calFetchWindow(){
    if(activeWorkspace==='planning'){
      const start=new Date();start.setHours(0,0,0,0);
      const end=new Date(start);end.setDate(end.getDate()+planningRange);
      return {start,end};
    }
    return {start:new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1),
      end:new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+3,1)};
  }
`);
edit("    if((id==='calendar'||id==='tasks'||id==='planning')&&groupware.status==='idle')void loadGroupware();",
  "    if((id==='calendar'||id==='tasks'||id==='planning')&&groupware.status==='idle')void loadGroupware();\n    else if((id==='calendar'||id==='planning')&&!demo&&(groupware.status==='loading'||!calendarWindowReady()))void loadGroupware(true);");
edit("if(planningRange===90&&!calendarWindowReady()&&!demo)", "if(!calendarWindowReady()&&!demo)");
edit("    if(planningRange===90)warnings.push('Agenda : la vue 90 jours peut nécessiter une nouvelle synchronisation.');\n","");
edit("  async function queryCalDav(calendar,type){\n    const window=calFetchWindow();","  async function queryCalDav(calendar,type,window=calFetchWindow()){");
edit("const events=[],tasks=[],taskErrors=[];let taskSources=0,taskSuccess=0;",
  "const events=[],tasks=[],taskErrors=[],eventErrors=[];let taskSources=0,taskSuccess=0;");
insert("        const calendars=await listCalDavCalendars();if(gen!==groupware.generation)return;","        const range=calFetchWindow();\n");
edit("try{events.push(...await queryCalDav(cal,'VEVENT'));}catch(error){console.warn('[Neos] événements CalDAV',error);}",
  "try{events.push(...await queryCalDav(cal,'VEVENT',range));}catch(error){eventErrors.push(cal.name);console.warn('[Neos] événements CalDAV',error);}");
edit("        const range=calFetchWindow();groupware.windowStart=range.start;groupware.windowEnd=range.end;\n      }",
  "        groupware.eventErrors=eventErrors;\n        groupware.windowStart=range.start;groupware.windowEnd=range.end;\n      }");
insert("    if(planningDeck.status==='error')", "    if(groupware.eventErrors?.length)warnings.push('Agendas non chargés : '+groupware.eventErrors.join(', '));\n");

const service='lib/Service/FileBrowserService.php';
let php=read(service);
php=replace(php,'browse(IUser $user, string $path): array','browse(IUser $user, string $path, int $offset = 0, bool $foldersOnly = false): array');
php=replace(php,'($node instanceof Folder || $node instanceof File)','($node instanceof Folder || (!$foldersOnly && $node instanceof File))');
php=replace(php,'return strnatcasecmp($a->getName(), $b->getName());','return strnatcasecmp($a->getName(), $b->getName()) ?: strcmp($a->getName(), $b->getName());');
php=replace(php,'array_slice($nodes, 0, self::DISPLAY_LIMIT)','array_slice($nodes, $offset, self::DISPLAY_LIMIT)');
php=replace(php,"'truncated' => $total > self::DISPLAY_LIMIT,","'truncated' => $total > $offset + count($entries),\n            'nextOffset' => $total > $offset + count($entries) ? $offset + count($entries) : null,");
write(service,php);
const controller='lib/Controller/DataController.php';
write(controller,replace(read(controller),'$result = $this->fileBrowser->browse($user, $path);',`$offset = filter_var($this->request->getParam('offset', 0), FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($offset === false) {
                return new JSONResponse(['error' => 'Position invalide'], 400);
            }
            $foldersOnly = $this->request->getParam('foldersOnly', '0') === '1';
            $result = $this->fileBrowser->browse($user, $path, $offset, $foldersOnly);`));

insert('  async function browse(path,',`  async function requestFilePage(path,offset=0,foldersOnly=false){
    if(demo)return demo.browse?.[path]||{path,items:[],total:0};
    const url=new URL(root.dataset.filesUrl,window.location.href);
    url.searchParams.set('path',path);
    if(offset)url.searchParams.set('offset',String(offset));
    if(foldersOnly)url.searchParams.set('foldersOnly','1');
    return api(url.toString());
  }
  function nextFileOffset(data,previous=0){
    return Number.isSafeInteger(data.nextOffset)&&data.nextOffset>previous?data.nextOffset:null;
  }
  function mergeFilePages(existing,incoming){
    const items=new Map(existing.map(item=>[item.path,item]));
    for(const item of incoming||[])items.set(item.path,item);
    return [...items.values()];
  }
  async function loadMoreFiles(){
    if(browser.loading||browser.moreLoading||!browser.nextOffset||fileBusy)return;
    const generation=browseGeneration,path=browser.path,offset=browser.nextOffset;
    browser.moreLoading=true;browser.moreError='';render();
    try{
      const data=await requestFilePage(path,offset);
      if(generation!==browseGeneration)return;
      browser.items=mergeFilePages(browser.items,data.items);
      browser.nextOffset=nextFileOffset(data,offset);browser.total=number(data.total);
      browser.truncated=browser.nextOffset!==null;
    }catch(error){
      if(generation===browseGeneration)browser.moreError='Chargement impossible. Réessaie.';
    }finally{
      if(generation===browseGeneration){
        browser.moreLoading=false;render();
        if(activeWorkspace==='files')(surface.querySelector('[data-action="files-more"]')||surface.querySelector('[data-browser-search]'))?.focus({preventScroll:true});
      }
    }
  }
`);
const browseStart=js.indexOf('      let data;\n      if (demo) data = demo.browse');
edit(js.slice(browseStart,js.indexOf('      if (g !== browseGeneration) return;',browseStart)),'      const data=await requestFilePage(path);\n');
edit("    browser.loading = true;\n    browser.error = '';","    browser.loading = true;\n    browser.nextOffset=null;browser.moreLoading=false;browser.moreError='';\n    browser.error = '';");
edit('      browser.truncated = Boolean(data.truncated);','      browser.nextOffset=nextFileOffset(data);\n      browser.truncated = browser.nextOffset!==null||Boolean(data.truncated);');
const fileFooterStart=js.indexOf('${browser.truncated?`<div class="neos-truncated">Premiers');
edit(js.slice(fileFooterStart,js.indexOf('</div>${previewPane()}',fileFooterStart)), '${browser.truncated?`<div class="neos-truncated"><span role="status">${browser.items.length} sur ${browser.total} · Recherche et tri sur les éléments chargés.</span> ${browser.nextOffset?`<button class="neos-btn" type="button" data-action="files-more" ${browser.moreLoading||fileBusy?\'disabled\':\'\'}>${browser.moreLoading?\'Chargement…\':\'Afficher la suite\'}</button>`:\'\'}</div>`:\'\'}${browser.moreError?`<p role="alert">${esc(browser.moreError)}</p>`:\'\'}');
insert("    else if(action==='module-refresh')","    else if(action==='files-more'){void loadMoreFiles();}\n");

edit('</div></div><footer class="neos-destination-footer">','</div>${p.nextOffset?`<button class="neos-btn" type="button" data-action="destination-more" ${p.moreLoading?\'disabled\':\'\'}>${p.moreLoading?\'Chargement…\':\'Plus de dossiers\'}</button><small role="status">${p.folders.length} sur ${p.total} dossiers chargés</small>`:\'\'}${p.moreError?`<p role="alert">${esc(p.moreError)}</p>`:\'\'}</div><footer class="neos-destination-footer">');
edit("    pickerState.path=path;pickerState.loading=true;pickerState.error='';pickerState.search='';",
  "    pickerState.path=path;pickerState.loading=true;pickerState.error='';pickerState.search='';\n    pickerState.folders=[];pickerState.nextOffset=null;pickerState.moreLoading=false;pickerState.moreError='';");
const pickerStart=js.indexOf('      let data;\n      if(demo){data=demo.browse');
edit(js.slice(pickerStart,js.indexOf('      if(generation!==pickerGeneration||!pickerState)return;',pickerStart)),'      const data=await requestFilePage(path,0,true);\n');
edit("      pickerState.loading=false;\n    }catch(error){","      pickerState.nextOffset=nextFileOffset(data);pickerState.total=number(data.total);\n      pickerState.loading=false;\n    }catch(error){");
insert('  function openDestinationPicker(',`  async function loadMoreDestinations(){
    const picker=pickerState;
    if(!picker?.nextOffset||picker.loading||picker.moreLoading)return;
    const generation=pickerGeneration,offset=picker.nextOffset;
    picker.moreLoading=true;picker.moreError='';renderFolderPicker();
    try{
      const data=await requestFilePage(picker.path,offset,true);
      if(generation!==pickerGeneration||pickerState!==picker)return;
      picker.folders=mergeFilePages(picker.folders,(data.items||[]).filter(item=>item.kind==='folder'));
      picker.nextOffset=nextFileOffset(data,offset);picker.total=number(data.total);
    }catch(error){
      if(generation===pickerGeneration&&pickerState===picker)picker.moreError='Chargement impossible. Réessaie.';
    }finally{
      if(generation===pickerGeneration&&pickerState===picker){
        picker.moreLoading=false;renderFolderPicker();
        (popHost.querySelector('[data-action="destination-more"]')||popHost.querySelector('[data-destination-search]'))?.focus({preventScroll:true});
      }
    }
  }
`);
insert("    if(action==='destination-confirm')","    if(action==='destination-more'){void loadMoreDestinations();return;}\n");

edit("  let taskQuery='';","  let taskQuery='';\n  let taskList='';\n  const TASK_PAGE_SIZE=50;\n  let taskVisible=TASK_PAGE_SIZE;");
edit("for(const entry of xmlChildren(xml.documentElement,'response').slice(0,200)){","const responses=xmlChildren(xml.documentElement,'response');\n    for(const entry of type==='VTODO'?responses:responses.slice(0,200)){");
edit("groupware.tasks=tasks.sort((a,b)=>Number(a.done)-Number(b.done)||(a.due||'9999').localeCompare(b.due||'9999')).slice(0,150);",
  "groupware.tasks=tasks.sort((a,b)=>Number(a.done)-Number(b.done)||(a.due||'9999').localeCompare(b.due||'9999'));\n        if(calendars.limited&&taskSuccess)taskErrors.push({calendar:'CalDAV',message:'seules les 16 premières listes ont été consultées'});");
edit('    return calendars.slice(0,16);','    const included=calendars.slice(0,16);\n    included.limited=calendars.length>included.length;\n    return included;');
edit('    taskQuery=input.value.slice(0,180);','    taskQuery=input.value.slice(0,180);taskVisible=TASK_PAGE_SIZE;');
edit('const matchingTasks=records.filter(t=>taskMatchesQuery(t,taskQuery));',
  "const taskLists=[...new Map(groupware.tasks.map(t=>[t.calendarUrl,t.calendar])).entries()].filter(([id])=>id).sort((a,b)=>a[1].localeCompare(b[1],'fr'));\n    if(!calendar&&isReady&&taskList&&!taskLists.some(([id])=>id===taskList))taskList='';\n    const matchingTasks=calendar?[]:records.filter(t=>(!taskList||t.calendarUrl===taskList)&&taskMatchesQuery(t,taskQuery));");
edit('const taskRows=filteredTasks.map(','const taskRows=filteredTasks.slice(0,taskVisible).map(');
edit('autocomplete="off"></label>${taskQuery?','autocomplete="off"></label><label>Liste <select data-task-list><option value="">Toutes les listes</option>${taskLists.map(([id,name])=>`<option value="${esc(id)}" ${id===taskList?\'selected\':\'\'}>${esc(name)}</option>`).join(\'\')}</select></label>${taskQuery?');
edit('Aucune tâche dans ce filtre.</div>\'}`;','Aucune tâche dans ce filtre.</div>\'}${filteredTasks.length>taskVisible?`<p role="status">${taskVisible} sur ${filteredTasks.length} tâches</p><button type="button" class="neos-btn" data-action="tasks-more">Afficher la suite</button>`:\'\'}`;');
edit("action==='task-search-clear'){taskQuery='';","action==='task-search-clear'){taskQuery='';taskVisible=TASK_PAGE_SIZE;");
edit("action==='task-view'){taskView=","action==='task-view'){taskVisible=TASK_PAGE_SIZE;taskView=");
insert("    else if(action==='files-more')","    else if(action==='tasks-more'){taskVisible+=TASK_PAGE_SIZE;render();(surface.querySelector('[data-action=\"tasks-more\"]')||surface.querySelector('[data-task-search]'))?.focus({preventScroll:true});}\n");
insert("  surface.addEventListener('input',updateTaskSearch);",`  surface.addEventListener('change',event=>{
    if(!event.target.matches('[data-task-list]'))return;
    taskList=event.target.value;taskVisible=TASK_PAGE_SIZE;render();
    surface.querySelector('[data-task-list]')?.focus({preventScroll:true});
  });
`);
insert('  function calendarEventDetail(href){',`  function editableCalendarEvent(event){
    if(!event?.raw||!event.etag||!event.start||!event.end||event.recurrence||event.source==='deck')return false;
    if(!groupware.calendars.some(calendar=>calendar.url===event.calendarUrl&&calendar.events&&calendar.writable))return false;
    const lines=icsUnfold(event.raw).split('\\n');
    if(lines.filter(line=>/^BEGIN:VEVENT$/i.test(line)).length!==1)return false;
    if(lines.some(line=>/^(?:RRULE|RDATE|EXRULE|EXDATE|RECURRENCE-ID|ATTENDEE|ORGANIZER|DURATION)(?:[:;])/i.test(line)))return false;
    return ['DTSTART','DTEND'].every(key=>lines.some(line=>new RegExp('^'+key+':[0-9]{8}T[0-9]{6}Z$','i').test(line)));
  }
`);
edit("${nativeModuleButton('calendar','Agenda')}</footer>", "${editableCalendarEvent(event)?`<button type=\"button\" class=\"neos-btn\" data-action=\"cal-edit\" data-href=\"${esc(event.href)}\">Modifier</button>`:''}${nativeModuleButton('calendar','Agenda')}</footer>");
insert("    else if(action==='cal-event')", "    else if(action==='cal-edit'){const event=groupware.events.find(item=>item.href===target.dataset.href);if(editableCalendarEvent(event))groupwareEditor('event',event);}\n");
edit("const start=dateInputLocal(now.toISOString()),end=dateInputLocal(new Date(now.getTime()+3600000).toISOString());",
  "const start=dateInputLocal(record?.start||now.toISOString()),end=dateInputLocal(record?.end||new Date(now.getTime()+3600000).toISOString());");
const editorTitle="calendar?'Nouvel événement':record?'Modifier la tâche':'Nouvelle tâche'";
if(js.split(editorTitle).length!==3)throw Error('Titres de formulaire introuvables');
js=js.replaceAll(editorTitle,"calendar?(record?'Modifier l’événement':'Nouvel événement'):record?'Modifier la tâche':'Nouvelle tâche'");
edit("popHost.dataset.gwRecord=record?.href||'';", "popHost.dataset.gwRecord=record?.href||'';popHost.dataset.gwEtag=record?.etag||'';");
edit('data-gw-location maxlength="180" placeholder="Facultatif"', 'data-gw-location maxlength="180" value="${esc(record?.location||\'\')}" placeholder="Facultatif"');
insert('  function taskIcsUpdates(',`  function updateEventIcs(record,fields){
    if(!editableCalendarEvent(record))throw Error('Cet événement doit être modifié dans Agenda.');
    const changes={SUMMARY:icsEscape(fields.title),LOCATION:fields.location?icsEscape(fields.location):null,
      DESCRIPTION:fields.description?icsEscape(fields.description):null,DTSTAMP:icsUtc(new Date())};
    if(fields.start!==dateInputLocal(record.start))changes.DTSTART=icsUtc(new Date(fields.start));
    if(fields.end!==dateInputLocal(record.end))changes.DTEND=icsUtc(new Date(fields.end));
    const updated=[],seen=new Set();
    let depth=0;
    for(const line of icsUnfold(record.raw).split('\\n')){
      if(/^BEGIN:VEVENT$/i.test(line)){depth=1;updated.push(line);continue;}
      if(depth===1&&/^END:VEVENT$/i.test(line)){
        for(const [key,value] of Object.entries(changes))if(value!==null&&!seen.has(key))updated.push(key+':'+value);
        depth=0;updated.push(line);continue;
      }
      if(depth===1){
        const key=/^([A-Z-]+)(?:[:;])/i.exec(line)?.[1]?.toUpperCase();
        if(key&&Object.hasOwn(changes,key)){
          if(!seen.has(key)&&changes[key]!==null)updated.push(key+':'+changes[key]);
          seen.add(key);continue;
        }
      }
      if(depth&&/^BEGIN:/i.test(line))depth++;
      else if(depth&&/^END:/i.test(line))depth--;
      updated.push(line);
    }
    return icsFold(updated.join('\\n').replace(/\\n+$/,''));
  }
`);
edit("    const record=groupware.tasks.find(x=>x.href===fields.href);","    const record=(fields.type==='event'?groupware.events:groupware.tasks).find(x=>x.href===fields.href);\n    if(fields.href&&!record){fail('Cet élément n’est plus chargé. Rouvre-le avant de l’enregistrer.');return;}\n    if(fields.type==='event'&&record&&!editableCalendarEvent(record)){fail('Ouvre cet événement dans Agenda pour le modifier.');return;}\n    if(fields.type==='event'&&record&&record.etag!==popHost.dataset.gwEtag){fail('Cet événement a changé. Rouvre-le pour afficher sa dernière version.');return;}");
edit("      }else if(record){\n        await updateExistingTodo(record,taskIcsUpdates(fields));",
  "      }else if(record&&fields.type==='event'){\n        await caldavRequest('PUT',record.href,updateEventIcs(record,fields),{'Content-Type':'text/calendar; charset=utf-8','If-Match':record.etag});\n      }else if(record){\n        await updateExistingTodo(record,taskIcsUpdates(fields));");
edit("if(record)Object.assign(record,{title:fields.title,description:fields.description,due:", "if(record&&fields.type==='event')Object.assign(record,{title:fields.title,description:fields.description,start:new Date(fields.start).toISOString(),end:new Date(fields.end).toISOString(),location:fields.location});\n        else if(record)Object.assign(record,{title:fields.title,description:fields.description,due:");

insert('  function mailReadModule(){',`  function mailAttachmentRows(attachments,messageId){
    if(!/^\\d+$/.test(messageId))return '';
    return attachments.map(attachment=>{
      const id=String(attachment?.id??'');
      if(!/^\\d+(?:\\.\\d+)*$/.test(id))return '';
      const url=mailNative('/api/messages/'+encodeURIComponent(messageId)+'/attachment/'+encodeURIComponent(id));
      const name=attachment.fileName||attachment.name||'Pièce jointe';
      return '<li><a class="neos-btn" href="'+esc(url)+'" download>'+icon('download',15)+' '+esc(name)+'</a></li>';
    }).join('');
  }
`);
const attachmentLine=js.split('\n').find(line=>line.includes('Pour les pièces jointes, utilise Mail natif.'));
edit(attachmentLine,`    const attachmentRows=mailAttachmentRows(mailReader.attachments,mailReader.id);
    const attachments=mailReader.attachments.length?'<div class="neos-mail-attachments"><strong>Pièces jointes</strong>'+(attachmentRows?'<ul>'+attachmentRows+'</ul>':'<p>Ouvre Mail pour accéder aux pièces jointes.</p>')+'</div>':'';`);
edit('Les pièces jointes restent dans Mail natif ; les réponses texte sont possibles dans Neos.','Les réponses texte sont possibles dans Neos.');

insert('  async function fetchMail(){',`  const MAIL_PAGE_SIZE=40;
  let mailHistoryLoading=false;
  let mailHistoryError='';
  function mailPageCursor(messages){
    if(messages.length<MAIL_PAGE_SIZE)return null;
    const last=messages[messages.length-1];
    const raw=last?.message||last?.envelope||last;
    const date=raw?.dateInt??raw?.sentAt??raw?.date??raw?.timestamp??raw?.receivedAt;
    const numeric=Number(date);
    const seconds=Number.isFinite(numeric)?Math.floor(numeric>100000000000?numeric/1000:numeric):Math.floor(Date.parse(date)/1000);
    return Number.isSafeInteger(seconds)&&seconds>0?seconds:null;
  }
  async function loadOlderMail(){
    const state=integrations.mail;
    if(state.status!=='ready'||mailHistoryLoading)return;
    const boxes=(state.meta?.mailboxes||[]).filter(box=>box.cursor&&(mailFolderFilter==='all'||box.key===mailFolderFilter));
    if(!boxes.length)return;
    const generation=state.generation;
    mailHistoryLoading=true;mailHistoryError='';render();
    const results=await Promise.allSettled(boxes.map(async box=>{
      const query=new URLSearchParams({mailboxId:box.id,limit:String(MAIL_PAGE_SIZE),view:'singleton',cursor:String(box.cursor)});
      const payload=await moduleRequest(mailNative('/api/messages?'+query.toString()));
      return {box,messages:mailEnvelopeList(payload)};
    }));
    mailHistoryLoading=false;
    if(generation!==state.generation)return;
    const known=new Set(state.items.filter(item=>item.messageId).map(item=>item.folderKey+':'+item.messageId));
    for(const result of results){
      if(result.status==='rejected'){mailHistoryError='Certaines boîtes n’ont pas répondu. Réessaie.';continue;}
      const {box,messages}=result.value;
      const cursor=mailPageCursor(messages);
      box.cursor=cursor!==box.cursor?cursor:null;
      for(const message of messages){
        const item=mailMessageToRow(message,box.account,box);
        const key=item.folderKey+':'+item.messageId;
        if(item.messageId&&!known.has(key)){known.add(key);state.items.push(item);}
      }
    }
    state.items.sort((a,b)=>b.sortTime-a.sortTime);
    if(mailReader.item)mailReader.index=state.items.indexOf(mailReader.item);
    if(activeWorkspace==='mail'){
      render();(surface.querySelector('[data-action="mail-older"]')||surface.querySelector('[data-integr-search="mail"]'))?.focus({preventScroll:true});
    }
  }
`);
edit("mailboxes.push({key,label:\`\${accountName} · \${inbox.displayName||inbox.name||'Réception'}\`});",
  "const mailbox={...inbox,id:boxId,key,account,label:\`\${accountName} · \${inbox.displayName||inbox.name||'Réception'}\`,cursor:null};\n        mailboxes.push(mailbox);");
edit('entries.push(...messages.slice(0,40).map(msg=>mailMessageToRow(msg,account,inbox)));','mailbox.cursor=mailPageCursor(messages);\n          entries.push(...messages.slice(0,MAIL_PAGE_SIZE).map(msg=>mailMessageToRow(msg,account,inbox)));');
edit('entries.sort((a,b)=>b.sortTime-a.sortTime).slice(0,160)','entries.sort((a,b)=>b.sortTime-a.sortTime)');
edit("id==='contacts'?contactDisplayCount:70", "id==='contacts'?contactDisplayCount:id==='mail'?mailDisplayCount:70");
insert('  const MAIL_PAGE_SIZE=40;', '  let mailDisplayCount=70;\n');
edit("if(id==='mail'&&state.status==='loading')return;", "if(id==='mail'&&(state.status==='loading'||mailHistoryLoading))return;\n    if(id==='mail'){mailDisplayCount=70;mailHistoryError='';}");
const activityFooterLine=js.split('\n').find(line=>line.includes("if(id==='activity'&&state.meta?.error)"));
if(!activityFooterLine)throw Error('Contrôles Mail introuvables');
insert(activityFooterLine,`        if(id==='mail'){
          const hasOlder=(state.meta?.mailboxes||[]).some(box=>box.cursor&&(mailFolderFilter==='all'||box.key===mailFolderFilter));
          if(matching.length>mailDisplayCount||hasOlder)body+='<button type="button" class="neos-btn" data-action="mail-older" '+(mailHistoryLoading?'disabled':'')+'>'+(mailHistoryLoading?'Chargement…':'Afficher plus de messages')+'</button>';
          if(mailHistoryError)body+='<p role="alert">'+esc(mailHistoryError)+'</p>';
        }
`);
insert("    else if(action==='mail-read-retry')","    else if(action==='mail-older'){mailDisplayCount+=MAIL_PAGE_SIZE;void loadOlderMail();render();}\n");
edit("if(integrations.mail.status!=='ready'||mailComposer.open", "if(integrations.mail.status!=='ready'||mailHistoryLoading||mailDisplayCount>70||mailComposer.open");
edit(" · Actualisation automatique toutes les 90 s quand Mail est ouvert.</p>", " · ${mailDisplayCount>70?'Synchronise pour revenir aux messages récents.':'Actualisation automatique toutes les 90 s.'}</p>");

edit('NEOS 0.6.47</span>','NEOS 0.6.48</span>');
write('js/app.js',js);
write('appinfo/info.xml',replace(read('appinfo/info.xml'),'<version>0.6.47</version>','<version>0.6.48</version>'));
const release='## Neos v0.6.48 — Notes, Planning, Fichiers et Tâches\n\n'
  +'- La sauvegarde d’une note préserve le brouillon affiché lorsque le texte ou la sélection a changé.\n'
  +'- Planning charge sa propre période. Agenda recharge sa période au retour si nécessaire.\n'
  +'- Fichiers et le sélecteur de destination chargent les dossiers par lots de 160. Le tri et le filtre portent sur les éléments chargés.\n'
  +'- Tâches filtre par liste, recherche dans les réponses des listes consultées et affiche les résultats par lots de 50.\n'
  +'- Agenda permet de modifier les événements simples datés en UTC. Les modifications vérifient la version CalDAV avant d’enregistrer.\n'
  +'- Mail charge davantage de messages dans les boîtes de réception et permet de télécharger les pièces jointes reconnues.\n\n';
for(const file of ['README.md','CHANGELOG.md'])write(file,release+read(file));
