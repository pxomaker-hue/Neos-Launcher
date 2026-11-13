const fs = require('node:fs');
const path = require('node:path');

const app = process.argv[2];
const read = file => fs.readFileSync(path.join(app, file), 'utf8');
const write = (file, source) => fs.writeFileSync(path.join(app, file), source);

function replace(source, needle, replacement) {
  if (!source.includes(needle)) throw new Error('Missing patch anchor: ' + needle.slice(0, 150));
  return source.replace(needle, () => replacement);
}

function section(source, start, end, replacement) {
  const first = source.indexOf(start);
  const last = source.indexOf(end, first + 1);
  if (first < 0 || last < 0) throw new Error('Missing patch section: ' + start);
  return source.slice(0, first) + replacement + source.slice(last);
}

let files = read('lib/Service/FileSearchService.php');
files = section(files, '/**', '    public function __construct', `/** Per-user filename search through Nextcloud's file index. */
final class FileSearchService {
    private const PAGE_SIZE = 40;

`);
files = replace(files, "string $sort = 'recent'): array", "string $sort = 'recent', int $offset = 0): array");
files = section(files, '        $queue =', '    private function matchesFilters', `        $results = [];
        foreach ($home->search($query) as $entry) {
            if (!($entry instanceof File || $entry instanceof Folder)
                || ($entry->getPermissions() & Constants::PERMISSION_READ) === 0
                || mb_stripos($entry->getName(), $query, 0, 'UTF-8') === false
                || !$this->matchesFilters($entry, $type, $cutoff, $size)) {
                continue;
            }
            $relative = $home->getRelativePath($entry->getPath());
            if (!is_string($relative) || trim($relative, '/') === '') {
                continue;
            }
            $path = '/' . ltrim($relative, '/');
            $folder = $entry instanceof Folder;
            $results[$path] = [
                'name' => $entry->getName(),
                'path' => $path,
                'parent' => dirname($path),
                'kind' => $folder ? 'folder' : 'file',
                'mtime' => (int)$entry->getMTime(),
                'size' => $folder ? null : (int)$entry->getSize(),
                'mime' => $folder ? 'httpd/unix-directory' : $entry->getMimetype(),
            ];
        }
        usort($results, static function (array $a, array $b) use ($sort): int {
            $order = match ($sort) {
                'name' => strnatcasecmp($a['name'], $b['name']),
                'size' => ($b['size'] ?? -1) <=> ($a['size'] ?? -1),
                default => $b['mtime'] <=> $a['mtime'],
            };
            return $order ?: strcmp($a['path'], $b['path']);
        });
        $total = count($results);
        $page = array_slice($results, $offset, self::PAGE_SIZE);
        $next = $offset + count($page);
        return ['items' => $page, 'total' => $total, 'nextOffset' => $next < $total ? $next : null];
    }

`);
files = files.replace('use Throwable;\n', '');
write('lib/Service/FileSearchService.php', files);

let notes = read('lib/Service/LocalNotesService.php');
notes = replace(notes, 'public function list(IUser $user): array', 'public function list(IUser $user, int $offset = 0): array');
notes = replace(notes, "return ['items' => [], 'source' => 'files', 'folder' => $this->relativeFolder()];", "return ['items' => [], 'source' => 'files', 'folder' => $this->relativeFolder(), 'nextOffset' => null];");
notes = section(notes, '        usort($items,', '    public function create', String.raw`        usort($items, static fn(File $a, File $b): int => ($b->getMTime() <=> $a->getMTime()) ?: ($a->getId() <=> $b->getId()));
        $selected = [];
        $budget = 8 * 1024 * 1024;
        $next = $offset;
        foreach (array_slice($items, $offset, self::LIMIT) as $file) {
            $size = max(0, (int)$file->getSize());
            if ($size > $budget) {
                break;
            }
            $selected[] = $this->serialize($file);
            $budget -= $size;
            $next++;
        }
        return [
            'items' => $selected,
            'source' => 'files',
            'folder' => $this->relativeFolder(),
            'nextOffset' => $next < count($items) ? $next : null,
        ];
    }

`);
write('lib/Service/LocalNotesService.php', notes);

let controller = read('lib/Controller/DataController.php');
const readOffset = `            $offset = filter_var($this->request->getParam('offset', 0), FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($offset === false) {
                return new JSONResponse(['error' => 'Position invalide'], 400);
            }
`;
controller = replace(controller, '            $response = new JSONResponse($this->fileSearch->search', readOffset + '            $response = new JSONResponse($this->fileSearch->search');
controller = replace(controller, "$filters['size'], $filters['sort']));", "$filters['size'], $filters['sort'], $offset));");
controller = replace(controller, '            $response = new JSONResponse($this->localNotes->list($user));', readOffset + '            $response = new JSONResponse($this->localNotes->list($user, $offset));');
write('lib/Controller/DataController.php', controller);

let js = read('js/app.js');
js = replace(js, "truncated:false,visited:0,type:'all'", "nextOffset:null,total:0,type:'all'");
js = replace(js, 'Recherche par nom, limitée à 2 500 éléments et 6 niveaux de dossiers.', 'Recherche par nom dans les fichiers et dossiers indexés par Nextcloud.');
js = replace(js, 'Aucun résultat ne correspond aux filtres dans les dossiers parcourus.', 'Aucun fichier ou dossier ne correspond aux filtres.');
js = replace(js, "${globalSearch.truncated?'<div class=\"neos-search-limited\">Résultats partiels : limite de recherche atteinte.</div>':''}", "<p class=\"neos-search-limited\">${globalSearch.items.length} sur ${globalSearch.total} résultats</p>${globalSearch.nextOffset!==null?'<button class=\"neos-btn\" type=\"button\" data-action=\"search-more\">Afficher plus de résultats</button>':''}");
js = replace(js, '  async function executeGlobalSearch(){', `  async function executeGlobalSearch(more=false){
    if(more&&(globalSearch.loading||globalSearch.nextOffset===null))return;
    const offset=more?globalSearch.nextOffset:0;
    if(!more){globalSearch.items=[];globalSearch.nextOffset=null;}`);
js = replace(js, "result={items:items.slice(0,40).map(x=>({...x,parent:x.path?.slice(0,x.path.lastIndexOf('/'))||'/'})),truncated:items.length>40,visited:items.length};", "result={items:items.slice(offset,offset+40).map(x=>({...x,parent:x.path?.slice(0,x.path.lastIndexOf('/'))||'/'})),nextOffset:offset+40<items.length?offset+40:null,total:items.length};");
js = replace(js, "        url.searchParams.set('q',q);", "        url.searchParams.set('q',q);\n        url.searchParams.set('offset',String(offset));");
js = replace(js, '      globalSearch.items=Array.isArray(result.items)?result.items:[];\n      globalSearch.truncated=Boolean(result.truncated);globalSearch.visited=number(result.visited);', `      const page=Array.isArray(result.items)?result.items:[];
      globalSearch.items=[...new Map([...globalSearch.items,...page].map(item=>[item.path,item])).values()];
      globalSearch.nextOffset=Number.isInteger(result.nextOffset)&&result.nextOffset>offset?result.nextOffset:null;
      globalSearch.total=number(result.total);`);
js = replace(js, "    if(action==='search-open'){", "    if(action==='search-more'){\n      void executeGlobalSearch(true).then(()=>{if(popMode==='global-search') (popHost.querySelector('[data-action=\"search-more\"]')||popHost.querySelector('[data-global-search-results]'))?.focus({preventScroll:true});});\n      return;\n    }\n    if(action==='search-open'){");

js = replace(js, "source:'api',folder:'Notes'};", "source:'api',folder:'Notes',pagesPending:false,pageError:''};");
js = replace(js, "    if(!all.length)return '<div class=\"neos-module-empty-small\">Aucune note.</div>';", `    const paging=notesState.pagesPending?'<p role="status">Chargement du reste des notes…</p>':notesState.pageError?'<p role="alert">'+esc(notesState.pageError)+'</p><button type="button" class="neos-btn" data-action="module-refresh">Réessayer</button>':'';
    if(!all.length)return paging||'<div class="neos-module-empty-small">Aucune note.</div>';`);
js = replace(js, "    if(!matching.length)return count+'<div class=\"neos-module-empty-small\">Aucune note ne correspond à cette recherche.</div>';", "    if(!matching.length)return count+(paging||'<div class=\"neos-module-empty-small\">Aucune note ne correspond à cette recherche.</div>');");
js = replace(js, '    return count+rows;', '    return count+rows+paging;');
js = replace(js, "    if(notesState.status!=='ready'||!notesState.items.length)return '';", "    if(notesState.status!=='ready')return '';");
js = replace(js, 'Rechercher dans les notes chargées', 'Rechercher dans les notes');
js = replace(js, '  function moduleRequest(url,options={}){', '  function moduleRequest(url,options={},readResponse=response=>response.json()){');
js = section(js, '  function moduleRequest(', '  const notesUrl=', js.slice(js.indexOf('  function moduleRequest('),js.indexOf('  const notesUrl=')).replace('return response.json();','return readResponse(response);'));
js = section(js, '  async function loadNotes(', '  async function loadDeck(', `  async function notesPage(source,cursor){
    if(source==='files'){
      const url=new URL(root.dataset.localNotesUrl,window.location.href);
      url.searchParams.set('offset',String(cursor||0));
      const result=await api(url.toString());
      return {items:result.items,cursor:result.nextOffset,folder:result.folder};
    }
    const url=new URL(notesUrl());
    url.searchParams.set('chunkSize','40');
    if(cursor)url.searchParams.set('chunkCursor',cursor);
    return moduleRequest(url.href,{},async response=>({
      items:await response.json(),cursor:response.headers.get('X-Notes-Chunk-Cursor'),
    }));
  }
  async function loadNotes(force=false){
    if(!force&&['loading','ready'].includes(notesState.status))return;
    const gen=++noteLoadGeneration;
    const preserve=notesState.status==='ready';
    if(!preserve){notesState.status='loading';notesState.error='';render();}
    let source=demo?'demo':availableApps().has('notes')?'api':'files';
    const seenCursors=new Set();
    const seenNotes=new Set();
    const current=()=>gen===noteLoadGeneration;
    const paintList=()=>{
      if(activeWorkspace!=='notes')return;
      const list=surface.querySelector('[data-note-list]');
      if(list){
        const active=document.activeElement?.closest?.('[data-note-id]');
        const id=active&&list.contains(active)?active.dataset.noteId:null;
        list.innerHTML=noteListMarkup();
        if(id!==null)[...list.querySelectorAll('[data-note-id]')].find(row=>row.dataset.noteId===id)?.focus({preventScroll:true});
      }
    };
    notesState.pageError='';
    notesState.pagesPending=true;
    if(preserve)paintList();
    try{
      let page;
      try{page=demo?{items:demo.notes,cursor:null}:await notesPage(source,null);}
      catch(error){
        if(source!=='api'||!/^HTTP 404(?:\u005cD|$)/.test(String(error.message)))throw error;
        source='files';page=await notesPage(source,null);
      }
      if(!current())return;
      notesState.source=source;notesState.folder=page.folder||'Notes';
      const keepIds=new Set(notesState.items.map(note=>String(note.id)));
      for(;;){
        if(!Array.isArray(page.items))throw Error('Format de liste de notes inattendu.');
        const byId=new Map(notesState.items.map(note=>[String(note.id),note]));
        for(const note of page.items){
          const key=String(note.id);
          seenNotes.add(key);
          const previous=byId.get(key);
          if(previous&&(notesState.dirty||noteSavePending)&&key===String(notesState.selected))continue;
          if(previous&&Number(previous.modified)>Number(note.modified))continue;
          byId.set(key,note);
        }
        notesState.items=[...byId.values()];
        const first=notesState.status!=='ready'||(notesState.selected===null&&notesState.items.length>0);
        if(first&&notesState.items.length){
          const selected=notesState.items[0];
          notesState.selected=selected.id;notesState.draftTitle=selected.title||'';notesState.draftContent=selected.content||'';
        }
        notesState.status='ready';notesState.error='';
        const cursor=page.cursor;
        notesState.pagesPending=cursor!==null&&cursor!==undefined&&cursor!=='';
        if(!notesState.pagesPending){
          let editorChanged=first;
          if(!noteSavePending)notesState.items=notesState.items.filter(note=>{
            const id=String(note.id);
            return seenNotes.has(id)||!keepIds.has(id)||(notesState.dirty&&id===String(notesState.selected));
          });
          if(!notesState.dirty&&!noteSavePending){
            const selected=notesState.items.find(note=>String(note.id)===String(notesState.selected))||notesState.items[0];
            editorChanged||=notesState.selected!==(selected?.id??null)||notesState.draftTitle!==(selected?.title||'')||notesState.draftContent!==(selected?.content||'');
            notesState.selected=selected?.id??null;notesState.draftTitle=selected?.title||'';notesState.draftContent=selected?.content||'';
          }
          if(editorChanged&&activeWorkspace==='notes'){
            const searching=document.activeElement?.matches('[data-note-search]');
            render();
            if(searching)surface.querySelector('[data-note-search]')?.focus({preventScroll:true});
          }else paintList();
        }else if(first&&activeWorkspace==='notes')render();
        else paintList();
        if(!notesState.pagesPending)break;
        if(seenCursors.has(cursor))throw Error('La pagination des notes n’avance plus.');
        seenCursors.add(cursor);
        page=await notesPage(source,cursor);
        if(!current())return;
      }
    }catch(error){
      if(!current())return;
      notesState.pagesPending=false;
      if(notesState.status==='ready'){
        notesState.pageError='Chargement des notes incomplet. '+String(error.message||error);paintList();
      }else{
        notesState.status='error';notesState.error='Notes indisponibles. '+String(error.message||error);
        if(activeWorkspace==='notes')render();
      }
    }
  }
`.replace('\\u005cD','\\D'));
js = replace(js, "let noteQuery='';", "let noteQuery='';\n  let noteLoadGeneration=0;");

js = js.replace('  const CONTACT_TOTAL_LIMIT=400;\n','').replace('  const CONTACT_PER_BOOK_LIMIT=250;\n','');
js = section(js, '    const entries=[];let unavailable=0,limited=false;', '  function contact', String.raw`    const entries=new Map();
    const failedBooks=[];
    for(const book of books){
      try{
        const headers={Depth:'1','Content-Type':'application/xml; charset=utf-8'};
        const listBody='<d:propfind xmlns:d="DAV:"><d:prop><d:getetag/></d:prop></d:propfind>';
        const listing=xmlDocument(await (await davRequest('PROPFIND',book.url,{headers,body:listBody})).text());
        const hrefs=new Set();
        for(const item of xmlChildren(listing.documentElement,'response')){
          try{
            const href=contactSafeUrl(xmlText(item,'href'),book.url);
            if(href!==book.url&&xmlText(item,'getetag'))hrefs.add(new URL(href).pathname);
          }catch{continue;}
        }
        const paths=[...hrefs];
        for(let start=0;start<paths.length;start+=60){
          const links=paths.slice(start,start+60).map(href=>'<d:href>'+esc(href)+'</d:href>').join('');
          const body='<card:addressbook-multiget xmlns:d="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav"><d:prop><d:getetag/><card:address-data content-type="text/vcard" version="3.0"><card:prop name="VERSION"/><card:prop name="FN"/><card:prop name="N"/><card:prop name="EMAIL"/><card:prop name="TEL"/><card:prop name="ORG"/></card:address-data></d:prop>'+links+'</card:addressbook-multiget>';
          const doc=xmlDocument(await (await davRequest('REPORT',book.url,{headers,body})).text());
          for(const item of xmlChildren(doc.documentElement,'response')){
            const raw=contactUnfold(xmlText(item,'address-data'));
            if(!raw.includes('BEGIN:VCARD'))continue;
            let href;try{href=contactSafeUrl(xmlText(item,'href'),book.url);}catch{continue;}
            const title=contactProp(raw,'FN')||contactProp(raw,'N')||'Contact sans nom';
            const [email='',email2='']=contactProps(raw,'EMAIL'),[phone='',phone2='']=contactProps(raw,'TEL');
            const org=contactProp(raw,'ORG');
            entries.set(href,{title,subtitle:email||phone||book.name,summary:email&&phone?phone:org,email,email2,phone,phone2,org,href,etag:xmlText(item,'getetag'),bookUrl:book.url,url:nativePath('contacts'),badge:book.name});
          }
        }
      }catch(error){
        failedBooks.push(book.name);
        console.warn('[Neos] carnet CardDAV',book.name,error.message);
      }
    }
    if(books.length&&!entries.size&&failedBooks.length===books.length)throw Error('Tous les carnets CardDAV ont refusé la consultation');
    const items=[...entries.values()].sort((a,b)=>a.title.localeCompare(b.title,'fr')||a.href.localeCompare(b.href));
    const note=failedBooks.length?'Consultation incomplète : '+failedBooks.join(', ')+'. Réessaie pour actualiser.':'';
    return {items,meta:{books,note}};
  }
`);

js = section(js, '  function editableCalendarEvent(', '  function calendarEventDetail(', String.raw`  function calendarComponents(raw){
    const lines=icsUnfold(raw).split('\n');
    const components=[];
    let depth=0,start=-1,properties;
    for(let index=0;index<lines.length;index++){
      const line=lines[index];
      if(/^BEGIN:/i.test(line)){
        if(depth===1&&/^BEGIN:VEVENT$/i.test(line)){start=index;properties=new Map();}
        depth++;
      }else if(/^END:/i.test(line)){
        if(depth===2&&start>=0&&/^END:VEVENT$/i.test(line)){
          components.push({start,end:index,properties});start=-1;
        }
        depth--;
      }else if(depth===2&&start>=0){
        const name=/^([\w-]+)(?:[;:])/i.exec(line)?.[1].toUpperCase();
        if(name&&!properties.has(name))properties.set(name,line);
      }
    }
    return {lines,components};
  }
  function recurringMaster(raw){
    return calendarComponents(raw).components.find(({properties})=>!properties.has('RECURRENCE-ID'));
  }
  function recurringResource(raw){
    return calendarComponents(raw).components.some(({properties})=>['RRULE','RDATE','EXDATE','RECURRENCE-ID'].some(key=>properties.has(key)));
  }
  function editableCalendarEvent(event){
    if(!event?.raw||!event.etag||!event.start||!event.end||event.source==='deck')return false;
    if(!groupware.calendars.some(calendar=>calendar.url===event.calendarUrl&&calendar.events&&calendar.writable))return false;
    if(event.recurrence){
      const {components}=calendarComponents(event.raw);
      return components.some(({properties})=>!properties.has('RECURRENCE-ID'))&&
        !components.some(({properties})=>properties.has('ATTENDEE')||properties.has('ORGANIZER')||properties.get('RECURRENCE-ID')?.includes('RANGE='));
    }
    const lines=icsUnfold(event.raw).split('\n');
    if(lines.filter(line=>/^BEGIN:VEVENT$/i.test(line)).length!==1)return false;
    if(lines.some(line=>/^(?:RRULE|RDATE|EXRULE|EXDATE|RECURRENCE-ID|ATTENDEE|ORGANIZER|DURATION)(?:[:;])/i.test(line)))return false;
    return ['DTSTART','DTEND'].every(key=>lines.some(line=>new RegExp('^'+key+':[0-9]{8}T[0-9]{6}Z$','i').test(line)));
  }
  function calendarEventKey(event){return event.key||event.href;}
  function calendarOccurrenceLine(raw,value){
    const original=recurringMaster(raw)?.properties.get('DTSTART');
    if(!original||!value)throw Error('Date d’origine de l’occurrence indisponible.');
    if(/^\d{8}$/.test(value))return 'RECURRENCE-ID;VALUE=DATE:'+value;
    const zone=/;TZID=(?:"([^"]+)"|([^;:]+))/i.exec(original);
    if(!zone)return 'RECURRENCE-ID:'+value;
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone[1]||zone[2],year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(icsTime(value)));
    const part=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    return 'RECURRENCE-ID;'+zone[0].slice(1)+':'+part.year+part.month+part.day+'T'+part.hour+part.minute+part.second;
  }
`);
js = replace(js, 'const event=groupware.events.find(e=>e.href===href);', 'const event=groupware.events.find(e=>calendarEventKey(e)===href);');
js = replace(js, 'data-action="cal-event" data-href="${esc(event.href)}"', 'data-action="cal-event" data-href="${esc(calendarEventKey(event))}"');
js = replace(js, 'data-action="cal-edit" data-href="${esc(event.href)}">Modifier</button>', 'data-action="cal-edit" data-href="${esc(calendarEventKey(event))}">${event.recurrence?\'Modifier la série\':\'Modifier\'}</button>${event.recurrence&&event.recurrenceId?`<button type="button" class="neos-btn" data-action="cal-edit" data-scope="occurrence" data-href="${esc(calendarEventKey(event))}">Modifier cette occurrence</button>`:\'\'}');
js = replace(js, "    if(action==='gw-save'){", "    if(action==='cal-edit'){const event=groupware.events.find(item=>calendarEventKey(item)===actionEl.dataset.href);if(editableCalendarEvent(event))groupwareEditor('event',event,null,actionEl.dataset.scope||'series');return;}\n    if(action==='gw-save'){");
js = replace(js, "    else if(action==='cal-edit'){const event=groupware.events.find(item=>item.href===target.dataset.href);if(editableCalendarEvent(event))groupwareEditor('event',event);}\n", '');
js = section(js, '    const result=[];\n    const responses=xmlChildren(xml.documentElement,\'response\');', '  async function loadGroupware(', String.raw`    const result=[];
    for(const entry of xmlChildren(xml.documentElement,'response')){
      const href=caldavHref(xmlText(entry,'href')),raw=xmlText(entry,'calendar-data');
      if(!href||!raw)continue;
      const etag=xmlText(entry,'getetag');
      const item=parseGroupwareObject(raw,type,href,etag,calendar);
      if(!item)continue;
      if(type==='VEVENT')item.recurrence=recurringResource(raw);
      result.push(item);
    }
    const recurring=new Map(result.filter(item=>item.recurrence).map(item=>[item.href,item]));
    if(!recurring.size)return result;
    const expand='<c:calendar-data><c:expand start="'+icsUtc(window.start)+'" end="'+icsUtc(window.end)+'"/></c:calendar-data>';
    const expanded=xmlDocument(await (await caldavRequest('REPORT',calendar.url,body.replace('<c:calendar-data/>',expand),{'Depth':'1','Content-Type':'application/xml; charset=utf-8'})).text());
    const occurrences=new Map();
    for(const entry of xmlChildren(expanded.documentElement,'response')){
      const href=caldavHref(xmlText(entry,'href')),item=recurring.get(href);
      if(!item)continue;
      const etag=xmlText(entry,'getetag');
      if(etag!==item.etag)continue;
      const expandedRaw=xmlText(entry,'calendar-data');
      const {lines,components}=calendarComponents(expandedRaw);
      for(const component of components){
        const raw=lines.slice(component.start,component.end+1).join('\n');
        const occurrence=parseGroupwareObject(raw,type,href,etag,calendar);
        if(!occurrence?.start)continue;
        const recurrenceId=icsProperty(raw,'RECURRENCE-ID')||icsProperty(raw,'DTSTART');
        const key=href+'#'+recurrenceId;
        occurrences.set(key,{...occurrence,key,recurrence:true,recurrenceId,occurrenceRaw:raw,raw:item.raw});
      }
    }
    return [...result.filter(item=>!item.recurrence),...occurrences.values()];
  }
`);
js = replace(js, 'function groupwareEditor(type,record=null,prefillDay=null){', "function groupwareEditor(type,record=null,prefillDay=null,scope='series'){");
js = replace(js, '    const start=dateInputLocal(record?.start', `    const recurring=calendar&&record?.recurrence;
    const series=recurring&&scope!=='occurrence';
    const wholeDay=recurring&&scope==='occurrence'&&/^\\d{8}$/.test(record.recurrenceId);
    const master=series?recurringMaster(record.raw):null;
    const simpleSeries=series&&calendarComponents(record.raw).components.length===1&&
      ['DTSTART','DTEND'].every(key=>/^[A-Z]+:[0-9]{8}T[0-9]{6}Z$/.test(master?.properties.get(key)||''))&&
      !['RDATE','EXDATE','EXRULE'].some(key=>master.properties.has(key))&&
      /^RRULE:FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)$/.test(master.properties.get('RRULE')||'');
    const metadataOnly=(series&&!simpleSeries)||wholeDay;
    const selectedRecord=series?parseGroupwareObject(record.raw,'VEVENT',record.href,record.etag,{url:record.calendarUrl,name:record.calendar}):record;
    const start=dateInputLocal(selectedRecord?.start`);
js = replace(js, 'end=dateInputLocal(record?.end||new Date(now', 'end=dateInputLocal(selectedRecord?.end||new Date(now');
js = replace(js, 'value="${esc(record?.title||\'\')}"', 'value="${esc(selectedRecord?.title||\'\')}"');
js = replace(js, '${calendar?`<div class="neos-gw-form-grid"><label>Début', "${calendar?`${recurring?'<p>'+ (series?(simpleSeries?'Les changements s’appliquent à la série.':'Modifier le titre, le lieu et la description de la série.'):'Modifier uniquement cette occurrence.')+'</p>':''}<div class=\"neos-gw-form-grid\" ${metadataOnly?'hidden':''}><label>Début");
js = replace(js, '${esc(record?.location||\'\')}', '${esc(selectedRecord?.location||\'\')}');
js = replace(js, '${esc(record?.description||\'\')}</textarea></label><p class="neos-gw-status"', '${esc(selectedRecord?.description||\'\')}</textarea></label>${calendar&&!record?\'<label>Répétition<select data-gw-repeat><option value="">Jamais</option><option value="DAILY">Chaque jour</option><option value="WEEKLY">Chaque semaine</option><option value="MONTHLY">Chaque mois</option><option value="YEARLY">Chaque année</option></select></label>\':\'\'}<p class="neos-gw-status"');
js = replace(js, "popHost.dataset.gwEtag=record?.etag||'';", "popHost.dataset.gwEtag=record?.etag||'';popHost.dataset.gwKey=record?calendarEventKey(record):'';popHost.dataset.gwScope=scope;popHost.dataset.gwMetadataOnly=metadataOnly?'1':'';");
js = replace(js, 'return {type,href,title:get', "return {type,href,key:popHost.dataset.gwKey,scope:popHost.dataset.gwScope,metadataOnly:popHost.dataset.gwMetadataOnly==='1',repeat:get('[data-gw-repeat]')?.value||'',title:get");
js = replace(js, "    if(fields.description)common.push", "    if(fields.type==='event'&&['DAILY','WEEKLY','MONTHLY','YEARLY'].includes(fields.repeat))common.push('RRULE:FREQ='+fields.repeat);\n    if(fields.description)common.push");
js = replace(js, "    if(fields.type==='event'&&(!fields.start||!fields.end||new Date(fields.end)<=new Date(fields.start)))", "    if(fields.type==='event'&&!fields.metadataOnly&&(!Number.isFinite(Date.parse(fields.start))||!Number.isFinite(Date.parse(fields.end))||new Date(fields.end)<=new Date(fields.start)))");
js = replace(js, '.find(x=>x.href===fields.href);', ".find(x=>fields.type==='event'?calendarEventKey(x)===fields.key:x.href===fields.href);");
js = replace(js, 'updateEventIcs(record,fields),', '(record.recurrence?updateRecurringEventIcs(record,fields):updateEventIcs(record,fields)),');
js = replace(js, '  function taskIcsUpdates(fields)', String.raw`  function updateRecurringEventIcs(record,fields){
    const {lines,components}=calendarComponents(record.raw);
    const master=recurringMaster(record.raw);
    if(!master)throw Error('Série Agenda introuvable.');
    const changes={SUMMARY:icsEscape(fields.title),LOCATION:fields.location?icsEscape(fields.location):null,
      DESCRIPTION:fields.description?icsEscape(fields.description):null,DTSTAMP:icsUtc(new Date())};
    const editComponent=(source,component,updates)=>{
      const next=['BEGIN:VEVENT'];
      const seen=new Set();
      let depth=0;
      for(const line of source.slice(component.start+1,component.end)){
        const key=/^([\w-]+)(?:[;:])/i.exec(line)?.[1].toUpperCase();
        if(depth===0&&key&&Object.hasOwn(updates,key)){
          if(!seen.has(key)&&updates[key]!==null)next.push(key+':'+updates[key]);
          seen.add(key);
        }else next.push(line);
        if(/^BEGIN:/i.test(line))depth++;
        else if(/^END:/i.test(line))depth--;
      }
      for(const [key,value] of Object.entries(updates))if(value!==null&&!seen.has(key))next.push(key+':'+value);
      next.push('END:VEVENT');
      return next;
    };
    if(fields.scope!=='occurrence'){
      if(fields.metadataOnly===false){
        for(const [key,field] of [['DTSTART','start'],['DTEND','end']]){
          const line=master.properties.get(key);
          if(line&&fields[field]!==dateInputLocal(icsTime(line.slice(line.indexOf(':')+1))))changes[key]=icsUtc(new Date(fields[field]));
        }
      }
      lines.splice(master.start,master.end-master.start+1,...editComponent(lines,master,changes));
    }else{
      const recurrence=calendarOccurrenceLine(record.raw,record.recurrenceId);
      const value=recurrence.slice(recurrence.indexOf(':')+1);
      const existing=components.find(({properties})=>{
        const id=properties.get('RECURRENCE-ID');
        const candidate=id?.slice(id.indexOf(':')+1);
        return candidate===value||candidate===record.recurrenceId;
      });
      if(!fields.metadataOnly){
        if(fields.start!==dateInputLocal(record.start))changes.DTSTART=icsUtc(new Date(fields.start));
        if(fields.end!==dateInputLocal(record.end))changes.DTEND=icsUtc(new Date(fields.end));
        if(Object.hasOwn(changes,'DTEND'))changes.DURATION=null;
      }
      if(existing){
        lines.splice(existing.start,existing.end-existing.start+1,...editComponent(lines,existing,changes));
      }else{
        const occurrence=calendarComponents('BEGIN:VCALENDAR\n'+record.occurrenceRaw+'\nEND:VCALENDAR');
        if(occurrence.components.length!==1)throw Error('Occurrence Agenda indisponible.');
        const next=editComponent(occurrence.lines,occurrence.components[0],{...changes,RRULE:null,RDATE:null,EXDATE:null,EXRULE:null,'RECURRENCE-ID':null});
        next.splice(1,0,recurrence);
        const end=lines.findIndex(line=>/^END:VCALENDAR$/i.test(line));
        if(end<0)throw Error('Série Agenda invalide.');
        lines.splice(end,0,...next);
      }
    }
    return icsFold(lines.join('\n').replace(/\n+$/,''));
  }
  function taskIcsUpdates(fields)`);

js = replace(js, "copySourceNotice:'',outboxId:", "copySourceNotice:'',attachments:[],outboxId:");
js = replace(js, "body:'',html:'',readError:'',choices:", "body:'',html:'',attachments:[],readError:'',choices:");
js = replace(js, "    if(!reuse){mailComposer.draftId='';", "    if(!reuse){mailComposer.attachments=[];mailComposer.draftId='';");
js = replace(js, "    mailComposer.draftId='';mailComposer.draftSavedAt=0;", "    mailComposer.attachments=[];mailComposer.draftId='';mailComposer.draftSavedAt=0;");
js = replace(js, "bcc:[],attachments:[],inReplyToMessageId:fields.inReplyToMessageId", "bcc:[],attachments:mailComposer.attachments.map(({id})=>({id,type:'local'})),inReplyToMessageId:fields.inReplyToMessageId");
js = replace(js, "    const copyNotice=c.copySourceNotice?", `    const attachments=c.attachments.length?'<ul class="neos-mail-attachment-list" aria-label="Pièces jointes de la copie">'+c.attachments.map(file=>'<li>'+esc(file.name)+'</li>').join('')+'</ul>':'';
    const copyNotice=c.copySourceNotice?`);
js = replace(js, '${copyNotice}${c.error?', '${copyNotice}${attachments}${c.error?');
js = replace(js, '<select data-mail-compose-field="accountId" ${blocked?', '<select data-mail-compose-field="accountId" ${blocked||c.attachments.length?');
js = replace(js, '!mailComposer.open||mailComposer.busy||mailComposer.status', '!mailComposer.open||mailComposer.busy||mailComposer.draftBusy||mailComposer.status');
js = section(js, '  // Safe draft resume:', '  function mailDraftsModule()', String.raw`  function draftAttachments(result){
    const data=result?.data??result;
    const list=[...(Array.isArray(data?.attachments)?data.attachments:[]),...(Array.isArray(data?.inlineAttachments)?data.inlineAttachments:[])];
    const files=new Map();
    for(const part of list){
      const id=String(part?.id??'');
      if(!/^\d+(?:\.\d+)*$/.test(id))throw Error('Une pièce jointe a un identifiant non reconnu.');
      files.set(id,{id,name:String(part.fileName||part.name||'Pièce jointe '+id)});
    }
    return [...files.values()];
  }
  async function copyDraftAttachments(messageId,accountId,files,cache=new Map(),mock=Boolean(demo)){
    if(!mock&&(!/^\d+$/.test(messageId)||!/^\d+$/.test(accountId)))throw Error('Références du brouillon indisponibles.');
    for(const file of files){
      if(cache.has(file.id))continue;
      if(mock){cache.set(file.id,{id:cache.size+1,name:file.name});continue;}
      const url=mailNative('/api/messages/'+encodeURIComponent(messageId)+'/attachment/'+encodeURIComponent(file.id));
      const response=await fetch(url,{credentials:'same-origin',cache:'no-store',redirect:'error',headers:{requesttoken:csrfToken()}});
      if(!response.ok||!response.headers.get('Content-Disposition'))throw Error('Téléchargement impossible : '+file.name);
      const form=new FormData();
      form.set('attachment',await response.blob(),file.name);
      form.set('accountId',accountId);
      const uploaded=await moduleRequest(mailNative('/api/attachments'),{method:'POST',body:form});
      const id=Number(uploaded?.data?.id??uploaded?.id);
      if(!Number.isSafeInteger(id)||id<=0)throw Error('Copie non confirmée : '+file.name);
      cache.set(file.id,{id,name:file.name});
    }
    return files.map(file=>cache.get(file.id));
  }
  async function mailResumeDraftAsCopy(){
    const d=mailDrafts,item=d.selected;
    if(!item||d.loading||d.readError||!d.loaded||d.copyBusy)return;
    if(!mailComposerAccounts().some(account=>String(account.id)===String(item.accountId))){
      toast('Compte expéditeur du brouillon introuvable.','error');return;
    }
    if(!window.confirm('Créer un nouveau message à partir de ce brouillon ?\n\n'+d.attachments.length+' pièce(s) jointe(s) seront reprises. Le message sera en texte simple.'))return;
    const gen=d.generation;
    d.copyBusy=true;d.copyError='';render();
    try{
      const attachments=await copyDraftAttachments(String(item.messageId),String(item.accountId),d.attachments,d.copiedFiles);
      if(gen!==d.generation||d.selected!==item||activeWorkspace!=='mail')return;
      mailComposer.mode='new';mailComposer.status='';mailComposer.fields={accountId:'',to:'',cc:'',subject:'',body:'',inReplyToMessageId:''};
      mailOpenComposer('new');
      mailComposer.fields={accountId:String(item.accountId),to:String(item.to||''),cc:'',subject:String(item.title||''),body:d.body,inReplyToMessageId:''};
      mailComposer.attachments=attachments;
      mailComposer.draftId='';mailComposer.dirty=true;
      mailComposer.copySourceNotice='Copie du brouillon IMAP · Texte simple et '+attachments.length+' pièce(s) jointe(s) · Destinataires en copie à renseigner si nécessaire.';
      render();
      surface.querySelector('[data-mail-compose-field="body"]')?.focus();
    }catch(error){
      if(gen===d.generation)d.copyError='Copie interrompue. '+String(error.message||error);
    }finally{
      d.copyBusy=false;
      if(gen===d.generation&&activeWorkspace==='mail'&&!mailComposer.open)render();
    }
  }
`);
js = replace(js, "    const gen=++d.generation;d.selected=item;d.loading=true;", "    const gen=++d.generation;d.selected=item;d.attachments=[];d.copiedFiles=new Map();d.copyError='';d.loading=true;");
js = replace(js, 'd.body=parsed.body;d.html=parsed.html;d.loaded=true;', 'd.body=parsed.body;d.html=parsed.html;d.attachments=draftAttachments(result);d.loaded=true;');
js = replace(js, "await moduleRequest(mailNative(`/api/messages/${encodeURIComponent(item.messageId)}/body`));\n      if(gen!==d.generation)", "await moduleRequest(mailNative(`/api/messages/${encodeURIComponent(item.messageId)}/body`));\n      if(gen!==d.generation)");
js = replace(js, '${body}<div class="neos-mail-draft-actions">', '${body}${d.attachments.length?`<ul class="neos-mail-attachment-list" aria-label="Pièces jointes">${mailAttachmentRows(d.attachments,m.messageId)}</ul>`:\'\'}${d.copyError?`<p role="alert">${esc(d.copyError)}</p>`:\'\'}<div class="neos-mail-draft-actions">');
js = replace(js, "${d.loading||d.readError?'disabled':''}>${icon('edit',15)} Reprendre dans Neos (copie)", "${d.loading||d.readError||d.copyBusy?'disabled':''}>${icon('edit',15)} ${d.copyBusy?'Copie des pièces jointes…':'Reprendre dans Neos (copie)'}");
js = replace(js, "La reprise crée un <strong>nouveau message</strong> : l'original reste intact. Les pièces jointes, Cc, Cci et la mise en forme HTML ne sont pas copiés. Pour modifier l'original, utilise Mail natif.", 'La reprise crée un <strong>nouveau message</strong> avec le texte et les pièces jointes. Les destinataires en copie restent à renseigner si nécessaire.');
js = replace(js, 'Pour modifier l\'original et conserver les pièces jointes, utilise Mail natif.', 'Pour modifier l\'original, utilise Mail natif.');
js = replace(js, "{mailResumeDraftAsCopy();}", "{void mailResumeDraftAsCopy();}");

js = replace(js, 'class="neos-workspace-tab ${activeWorkspace', 'title="${esc(appName(id))}" class="neos-workspace-tab ${activeWorkspace');
js = replace(js, '${flatTabIcon(id)}<span>${esc(appName(id))}</span>', '${flatTabIcon(id)}<span class="neos-workspace-label">${esc(appName(id))}</span>');
js = replace(js, '        if(target.kind===\'file\')await selectEntry(path);', `        if(target.kind==='file'&&activeWorkspace==='files'&&browser.path===parent&&!browser.error){
          if(browser.items.some(item=>item.path===path))await selectEntry(path);
          else if(!demo)await previewSearchFile(target);
        }`);
js = replace(js, "await browse(target.parent||target.path.slice(0,target.path.lastIndexOf('/'))||'/',true);\n        if(action==='quick-preview'&&target.kind==='file'){await selectEntry(target.path);fullPreview=true;renderFullPreview();}", `const folder=target.parent||target.path.slice(0,target.path.lastIndexOf('/'))||'/';
        await browse(folder,true);
        if(action==='quick-preview'&&target.kind==='file'&&activeWorkspace==='files'&&browser.path===folder&&!browser.error){
          if(browser.items.some(item=>item.path===target.path))await selectEntry(target.path);
          else if(!demo)await previewSearchFile(target);
          if(preview.entry?.path===target.path){fullPreview=true;renderFullPreview();}
        }`);
js = replace(js, '  function quickResultRow(item,tab){', `  async function previewSearchFile(item){
    const url=davFolderUrl(item.path);
    if(url)await previewFromDav(new URL(url).pathname,item.name,item.mime,number(item.size),item.path);
  }
  function quickResultRow(item,tab){`);
js = replace(js, '    if(globalSearch.loading){node.innerHTML=', '    if(globalSearch.loading&&!globalSearch.items.length){node.innerHTML=');
js = replace(js, '    if(globalSearch.error){node.innerHTML=', '    if(globalSearch.error&&!globalSearch.items.length){node.innerHTML=');
js = replace(js, '<button class="neos-btn" type="button" data-action="search-more">Afficher plus de résultats</button>', '<button class="neos-btn" type="button" data-action="search-more" \'+(globalSearch.loading?\'disabled\':\'\')+\'>\'+(globalSearch.loading?\'Chargement…\':globalSearch.error?\'Réessayer\':\'Afficher plus de résultats\')+\'</button>');
js = replace(js, '      globalSearch.loading=false;globalSearch.error=\'Recherche indisponible.', '      globalSearch.loading=false;globalSearch.error=more?\'Suite des résultats indisponible.\':\'Recherche indisponible.');
js = replace(js, "if(popMode==='global-search') (popHost.querySelector('[data-action=\"search-more\"]')", "if(popMode==='global-search'&&searchPanelTab==='search'&&document.activeElement===document.body) (popHost.querySelector('[data-action=\"search-more\"]')");
js = replace(js, ' record.start=icsTime(icsProperty(section,\'DTSTART\'));record.end=icsTime(icsProperty(section,\'DTEND\'));', String.raw` const starts=icsProperty(section,'DTSTART');
      record.start=icsTime(starts);record.end=icsTime(icsProperty(section,'DTEND'));
      if(record.start&&!record.end){
        const duration=/^P(?:(\d+)W|(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?)$/i.exec(icsProperty(section,'DURATION'));
        const end=new Date(record.start);
        if(duration){
          const [,weeks=0,days=0,hours=0,minutes=0,seconds=0]=duration;
          end.setTime(end.getTime()+(+weeks*604800+ +days*86400+ +hours*3600+ +minutes*60+ +seconds)*1000);
        }else if(/^\d{8}$/.test(starts))end.setDate(end.getDate()+1);
        else end.setHours(end.getHours()+1);
        if(Number.isFinite(end.getTime()))record.end=end.toISOString();
      }`);

write('css/app.css', read('css/app.css') + `
/* Neos 0.7 — compact navigation */
#nova-root .neos-workspace-tabs {flex-wrap:wrap;overflow:visible;}
#nova-root .neos-workspace-tab:focus-visible {outline:2px solid var(--accent,#24d9d1);outline-offset:-2px;}
#nova-root .neos-gw-form-grid[hidden] {display:none;}
#nova-root .neos-mail-attachment-list {overflow-wrap:anywhere;}
@media (max-width:1300px) {
  #nova-root .neos-workspace-tabs {
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(min(44px,100%),1fr));
    align-items:stretch;
  }
  #nova-root .neos-workspace-tabs .neos-tab-slider,
  #nova-root .neos-workspace-tabs .neos-workspace-label,
  #nova-root .neos-workspace-tabs .neos-tab-drag-indicator {display:none;}
  #nova-root .neos-workspace-tab {min-width:0;max-width:none;min-height:44px;padding:0;gap:0;}
  #nova-root .neos-workspace-tab.is-active {
    background:linear-gradient(110deg,rgba(21,108,118,.68),rgba(16,66,86,.82))!important;
    border-color:rgba(23,224,225,.78)!important;
  }
}
`);

js = replace(js, '<span>NEOS 0.6.51</span>', '<span>NEOS 0.7.0</span>');
write('js/app.js', js);
write('appinfo/info.xml', replace(read('appinfo/info.xml'), '<version>0.6.51</version>', '<version>0.7.0</version>'));
const release = `## Neos v0.7.0 — Recherche étendue, Agenda et Mail

- Fichiers recherche par nom dans l’index Nextcloud et permet de parcourir les résultats par lots.
- Notes charge les pages de la collection en arrière-plan et préserve le brouillon pendant la recherche.
- Contacts consulte tous les carnets accessibles et récupère les fiches CardDAV par lots.
- Agenda affiche les occurrences renvoyées par CalDAV. Création d’une répétition simple, modification du titre, du lieu et de la description d’une série, édition des occurrences individuelles prises en charge.
- Mail reprend les pièces jointes d’un brouillon IMAP dans une copie en texte simple via l’API Mail.
- La navigation se replie en icônes sur écran réduit, avec plusieurs lignes selon l’espace disponible.

`;
for (const file of ['README.md', 'CHANGELOG.md']) write(file, release + read(file));
write('PLAN-v0.7.md', `# Validation de Neos v0.7.0 sur Nextcloud 35.0.3

Les tests automatisés utilisent des données fictives. Les scénarios ci-dessous nécessitent une instance de test ou des éléments de test sur le NAS.

1. Déployer le ZIP avec Deploy-Neos.ps1. Vérifier la version des fichiers et la version installée, l’ouverture du dashboard et la disponibilité de la sauvegarde. Répéter le retour arrière sur une instance de test.
2. Dans À suivre, ouvrir une tâche du jour et une tâche en retard. Comparer au module Tâches et au Planning. Vérifier aussi le prochain événement, une liste en lecture seule et une liste indisponible. Sur des éléments de test, créer et modifier une tâche, une carte et un événement.
3. Dans Agenda, créer une répétition hebdomadaire, modifier la série puis une occurrence. Vérifier les jours suivants dans Agenda natif, une exception existante, un calendrier en lecture seule et une modification concurrente.
4. Dans Mail, charger des messages anciens et réessayer une lecture interrompue. Copier un brouillon IMAP contenant un PDF et une image, enregistrer la copie et comparer ses pièces jointes avec celles de l’original dans Mail natif.
5. Remonter dans Activité jusqu’aux entrées d’avant le 11 novembre 2026 à 15 h 52. Charger plusieurs pages de Talk, puis actualiser en vérifiant la position de lecture. Rechercher un contact au-delà de 250 fiches dans un carnet, une note ancienne et un fichier dans un dossier profond.
6. Au clavier, parcourir la topbar, la recherche, les destinations et l’éditeur Agenda. Vérifier le retour du focus à la fermeture et l’annonce des erreurs. En écran réduit, vérifier les 12 icônes et le passage sur plusieurs lignes sans défilement horizontal.

## Périmètre de l’édition Agenda

Neos édite le titre, le lieu et la description d’une série. Il édite aussi les dates des séries UTC simples et des occurrences horaires. Agenda natif reste disponible pour les règles de répétition avancées, les séries avec invitations et les modifications qui affectent toutes les occurrences suivantes.

` + read('PLAN-v0.7.md'));
