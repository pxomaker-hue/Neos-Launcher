/** Neos 0.6.36 — CalDAV task creation eligibility and guidance. */
(() => {
  'use strict';
  const root = document.getElementById('nova-root');
  if (!root) return;
  root.innerHTML = '<div id="neos-surface"></div><div id="neos-editor-host"></div><div id="neos-pop-host"></div><div id="neos-toast-host" aria-live="polite"></div><div id="neos-upload-host" role="region" aria-label="Progression des téléversements"></div>';
  const surface = root.querySelector('#neos-surface');
  const editorHost = root.querySelector('#neos-editor-host');
  const popHost = root.querySelector('#neos-pop-host');
  const toastHost = root.querySelector('#neos-toast-host');
  const uploadHost = root.querySelector('#neos-upload-host');
  const ambientHost = document.createElement('div');
  ambientHost.className = 'neos-ambient';
  ambientHost.setAttribute('aria-hidden', 'true');
  root.insertBefore(ambientHost, surface);
  ambientHost.innerHTML = `<div class="neos-ambient-mesh"></div><div class="neos-ambient-grid"></div><div class="neos-ambient-beam"></div><div class="neos-ambient-aurora"></div><div class="neos-ambient-noise"></div>
  <svg class="neos-ambient-orbits" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="neos-v045-orbit"><stop stop-color="#36d5fb" stop-opacity="0"/><stop offset=".48" stop-color="#42b7ff" stop-opacity=".14"/><stop offset="1" stop-color="#9084ff" stop-opacity="0"/></linearGradient></defs><g fill="none" stroke="url(#neos-v045-orbit)" stroke-width=".85"><ellipse cx="1075" cy="265" rx="440" ry="200" transform="rotate(-17 1075 265)"/><ellipse cx="1075" cy="265" rx="575" ry="280" transform="rotate(-17 1075 265)"/><ellipse cx="1075" cy="265" rx="710" ry="360" transform="rotate(-17 1075 265)"/></g></svg>`;


  // Low-cost, local data-field animation. It is visual only, never reads files or user data.
  const dataCanvas = document.createElement('canvas');
  dataCanvas.className = 'neos-datafield';
  dataCanvas.setAttribute('aria-hidden', 'true');
  ambientHost.appendChild(dataCanvas);
  function launchDatafield(){
    const ctx=dataCanvas.getContext('2d',{alpha:true}); if(!ctx)return;
    let width=0,height=0,dpr=1,last=0,frame=0;
    const pointer={x:.5,y:.48,targetX:.5,targetY:.48};
    const resize=()=>{
      width=Math.max(320,root.clientWidth||window.innerWidth);
      height=Math.max(400,root.clientHeight||window.innerHeight);
      dpr=Math.min(1.5,window.devicePixelRatio||1);
      dataCanvas.width=Math.round(width*dpr);dataCanvas.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const draw=now=>{
      ctx.clearRect(0,0,width,height);
      const t=now*.00015, mobile=width<760, rows=mobile?7:11;
      pointer.x+=(pointer.targetX-pointer.x)*.045;
      pointer.y+=(pointer.targetY-pointer.y)*.045;
      const horizon=height*(.52+(.5-pointer.y)*.055);
      for(let j=0;j<rows;j++){
        const base=horizon+j*(mobile?22:26), amp=(mobile?11:18)*(1+j*.025);
        const g=ctx.createLinearGradient(0,base,width,base);
        g.addColorStop(0,'rgba(42,156,240,0)');
        g.addColorStop(.25,'rgba(55,155,240,.06)');
        g.addColorStop(.58,j%4===0?'rgba(144,113,249,.115)':'rgba(49,203,250,.115)');
        g.addColorStop(1,'rgba(45,164,255,0)');
        ctx.strokeStyle=g;ctx.lineWidth=.65;ctx.beginPath();
        for(let i=0;i<=56;i++){
          const x=width*i/56;
          const y=base + amp*Math.sin(i*.23+t*4+j*.18+pointer.x*.8) + amp*.32*Math.cos(i*.37-t*3+j*.45);
          i?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.stroke();
      }
      const count=mobile?24:54;
      for(let i=0;i<count;i++){
        const fx=((i*137.508+9)%997)/997, fy=((i*91.17+16)%991)/991;
        const x=width*(fx+.01*Math.sin(t*3+i)),y=height*(fy*.79+.12+.01*Math.cos(t*4+i*.31));
        const a=.07+.16*(Math.sin(t*3+i*.7)+1)/2;
        ctx.fillStyle=i%9===0?`rgba(170,144,255,${a})`:`rgba(99,203,250,${a})`;
        ctx.beginPath();ctx.arc(x,y,i%7===0?1.25:.65,0,Math.PI*2);ctx.fill();
      }
      if(!mobile){
        const gx=pointer.x*width,gy=pointer.y*height;
        const halo=ctx.createRadialGradient(gx,gy,0,gx,gy,260);
        halo.addColorStop(0,'rgba(73,157,255,.038)');halo.addColorStop(1,'rgba(73,157,255,0)');
        ctx.fillStyle=halo;ctx.fillRect(gx-260,gy-260,520,520);
      }
    };
    const tick=now=>{
      frame=requestAnimationFrame(tick);
      if(!document.hidden&&motionEnabled()&&now-last>48){last=now;draw(now);}
    };
    root.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse')return;
      const r=root.getBoundingClientRect();
      pointer.targetX=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)));
      pointer.targetY=Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)));
    },{passive:true});
    root.addEventListener('pointerleave',()=>{pointer.targetX=.5;pointer.targetY=.48;},{passive:true});
    resize();draw(0);frame=requestAnimationFrame(tick);
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){resize();last=0;}});
  }

  const demo = window.NOVA_DEMO_DATA && root.dataset.demo === 'true' ? window.NOVA_DEMO_DATA : null;
  const csrfToken = () => document.head?.getAttribute('data-requesttoken') || window.OC?.requestToken || '';

  const icons = {
    sparkles:'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 17 .8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    check:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="m8 12 3 3 5-6"/>',
    storage:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 12h18m-5 4h2"/><circle cx="7" cy="16" r="1"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-6-6L4 21"/>',
    message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/>',
    settings:'<path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.8 9A7.5 7.5 0 0 1 19 6l1 1M4 17l1 1a7.5 7.5 0 0 0 13.2-3"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    close:'<path d="M5 5l14 14M19 5 5 19"/>',
    grip:'<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
    file:'<path d="M6 2h9l5 5v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6"/>',
    external:'<path d="M14 4h6v6m-9 3 9-9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3v.1"/>',
    cloud:'<path d="M5 18a4 4 0 0 1-.4-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 1 9H5Z"/>',
    link:'<path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 1 0 7.1 7.1l1.7-1.7"/>',
    note:'<path d="M4 3h16v18H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    chart:'<path d="M3 20h18M6 17v-4m6 4V6m6 11v-8"/>',
    plus:'<path d="M12 4v16M4 12h16"/>',
    minus:'<path d="M4 12h16"/>',
    'chevrons-down':'<path d="m6 7 6 6 6-6m-12 6 6 6 6-6"/>',
    'chevrons-up':'<path d="m6 17 6-6 6 6m-12-6 6-6 6 6"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    star:'<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.8 9.7l6.4-.9L12 3Z"/>',
    list:'<path d="M9 5h12M9 12h12M9 19h12"/><path d="M3 5h.1M3 12h.1M3 19h.1"/>',
    sort:'<path d="M7 4v16m0 0-4-4m4 4 4-4M17 20V4m0 0-4 4m4-4 4 4"/>',
    arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>',
    home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 1 0 0-8m4 18v-2a4 4 0 0 0-3-3.87"/>',
    mail:'<path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="m22 7-10 7L2 7"/>',
    kanban:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-16v9"/>',
    map:'<path d="M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Z"/><path d="M9 4v14m6-12v14"/>',
    news:'<path d="M4 5h13a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V5Z"/><path d="M19 9h1a2 2 0 0 1 2 2v6H8"/><path d="M8 9h7M8 13h5"/>',
    sheet:'<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16m5-16v16"/>',
    play:'<path d="m8 5 11 7-11 7V5Z"/>',
    open:'<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    forward:'<path d="m9 18 6-6-6-6"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    download:'<path d="M12 3v12m0 0 5-5m-5 5-5-5M4 17v3h16v-3"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    upload:'<path d="M12 17V4m0 0 5 5m-5-5-5 5M4 17v3h16v-3"/>',
    filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
  };
  const icon = (name, size=18) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.file}</svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = s => typeof s === 'string' && ((/^\/(?!\/)/.test(s) && !s.includes('\\')) || /^https?:\/\//i.test(s) || (root.dataset.demo === 'true' && /^\.\/novadashboard\/img\/(?:[\w.%-]+\/)*[\w.%-]+$/.test(s))) || (demo && /^data:image\/(?:png|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(s)) ? esc(s) : '#';
  const safeColor = s => /^#[0-9a-f]{6}$/i.test(String(s)) ? s : '#7f8dff';
  const number = n => Number.isFinite(Number(n)) ? Number(n) : 0;
  const humanSize = b => { if (b == null) return '—'; const n = Math.max(0, number(b)); const p = n ? Math.min(4, Math.floor(Math.log(n)/Math.log(1024))) : 0; return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(n/Math.pow(1024,p)) + ' ' + ['o','Ko','Mo','Go','To'][p]; };
  const ago = ts => { const d = Math.max(0, Math.round((Date.now()-number(ts)*1000)/86400000)); return d===0?'Aujourd’hui':d===1?'Hier':`Il y a ${d} j`; };
  const fmtTime = iso => { if (!iso) return 'Sans échéance'; const d = new Date(iso); return Number.isNaN(+d) ? 'Date inconnue' : new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(d); };
  const ext = name => String(name || '').split('.').pop().toLowerCase();
  const isImage = e => String(e?.mime || '').startsWith('image/');
  const isPdf = e => String(e?.mime || '') === 'application/pdf' || ext(e?.name) === 'pdf';
  const isCsv = e => ['csv','tsv'].includes(ext(e?.name));
  const isText = e => String(e?.mime || '').startsWith('text/') || ['txt','md','markdown','json','log','ini','yaml','yml','xml','html','css','js','ts','php','sql','csv','tsv'].includes(ext(e?.name));
  const isAudio = e => String(e?.mime||'').startsWith('audio/') || ['mp3','m4a','ogg','opus','flac','wav'].includes(ext(e?.name));
  const isVideo = e => String(e?.mime||'').startsWith('video/') || ['mp4','webm','ogv','mov','m4v'].includes(ext(e?.name));
  const isMarkdown = e => ['md','markdown'].includes(ext(e?.name));
  // Only a small, safe subset of Markdown: all source content is escaped first.
  function markdownHtml(value){
    const lines=String(value||'').slice(0,180000).replace(/\r\n?/g,'\n').split('\n');
    const inline=line=>esc(line).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>');
    let list=false,code=false;const out=[];
    for(const line of lines){
      if(/^```/.test(line)){if(list){out.push('</ul>');list=false;}out.push(code?'</code></pre>':'<pre><code>');code=!code;continue;}
      if(code){out.push(esc(line)+'\n');continue;}
      const bullet=/^\s*[-*+]\s+(.+)$/.exec(line);
      if(bullet){if(!list){out.push('<ul>');list=true;}out.push('<li>'+inline(bullet[1])+'</li>');continue;}
      if(list){out.push('</ul>');list=false;}
      const heading=/^(#{1,4})\s+(.+)$/.exec(line);
      if(heading){const level=heading[1].length;out.push('<h'+level+'>'+inline(heading[2])+'</h'+level+'>');}
      else if(line.trim())out.push('<p>'+inline(line)+'</p>');
    }
    if(list)out.push('</ul>');if(code)out.push('</code></pre>');
    return out.join('');
  }
  const isOffice = e => ['xlsx','xls','ods','docx','doc','odt','pptx','ppt','odp'].includes(ext(e?.name));

  const widgetLabels = {
    explorer:'Fichiers', storage:'Stockage', shortcuts:'Hub apps', clock:'Horloge', files:'Récents',
    calendar:'Agenda', tasks:'Tâches', summary:'À suivre', links:'Liens', notes:'Notes', deck:'Deck'
  };
  const widgetIcons = { explorer:'folder', storage:'storage', shortcuts:'grid', clock:'clock', files:'file', calendar:'calendar', tasks:'check', summary:'chart', links:'link', notes:'note', deck:'kanban' };
  const widgetIds = Object.keys(widgetLabels);
  const defaultSizes = { explorer:12, storage:3, shortcuts:6, clock:3, files:6, calendar:6, tasks:6, summary:6, links:6, notes:6, deck:6 };
  const adaptiveSizes = { explorer:8, storage:4, shortcuts:8, clock:4, files:6, calendar:6, tasks:6, summary:4, links:6, notes:6, deck:6 };
  const allowedSizes = [3,4,6,8,9,12];
  const allowedHeights = [0,160,220,300,400,520,680];
  const defaultHeights = Object.fromEntries(widgetIds.map(id=>[id,0]));
  let masonryFrame=0;
  let lastMasonryWidth=0;
  const defaults = () => ({ theme:'dark', density:'comfortable', accent:'cyan', layout:'wide', motion:'full', launcherMode:'topbar', gridMode:'adaptive', order:[...widgetIds], hidden:['links','notes'], sizes:{...defaultSizes}, heights:{...defaultHeights}, links:[], notes:'', pins:[], topApps:['files','calendar','tasks','talk'], tabOrder:['home','files','photos','planning','calendar','tasks','talk','contacts','mail','activity','deck','notes'] });

  let overview = null;
  let settings = null;
  let editing = false;
  let editorOpen = false;
  let dragWidgetId = '';
  let dragTabId = '';
  let dragEditorTabId = '';
  let activityCategory = 'all';
  let activityPeriod = 'all';
  let activityDisplayCount = 15;
  const ACTIVITY_PAGE_SIZE = 15;
  const ACTIVITY_MAX_ITEMS = 300;
  const talkChat={token:'',messages:[],status:'idle',error:'',draft:'',busy:false,readBusy:false,generation:0,cursor:0,hasMore:false,lastSync:0};
  let contactDetail=-1;
  let contactBookFilter='all';
  let contactDisplayCount=35;
  const CONTACT_PAGE_SIZE=35;
  const contactDelete={open:false,busy:false,error:'',href:'',bookUrl:'',etag:'',name:''};
  const contactEditor={open:false,mode:'new',loading:false,busy:false,error:'',url:'',etag:'',raw:'',fields:{name:'',email:'',email2:'',phone:'',phone2:'',org:''},bookUrl:''};
  let mailUnreadOnly=false;
  let talkUnreadOnly=false;
  let mailFolderFilter="all";
  // A single refresh sequence at a time; mailbox syncing is server-side and must not be spammed.
  const mailRefreshState={lastAttempt:0,lastSuccess:0,checks:0};
  // Mail bodies stay in volatile memory only; never cache email contents in settings/localStorage.
  const mailReader={id:'',index:-1,item:null,loading:false,error:'',body:'',html:'',display:'formatted',attachments:[],generation:0};
  const mailComposer={open:false,mode:'new',returnToReader:false,busy:false,error:'',status:'',copySourceNotice:'',attachments:[],outboxId:'',draftId:'',draftSavedAt:0,draftBusy:false,dirty:false,outboxCheck:null,fields:{accountId:'',to:'',cc:'',subject:'',body:'',inReplyToMessageId:''}};
  const mailOutbox={open:false,status:'idle',items:[],error:'',generation:0};
  // Read-only IMAP draft browser: do not mutate/reuse original IMAP drafts.
  const mailDrafts={open:false,status:'idle',items:[],error:'',note:'',generation:0,selected:null,loading:false,loaded:false,body:'',html:'',attachments:[],readError:'',choices:[],selectedMailbox:'auto'};
  let layoutAnnounce = '';
  let saving = false;
  let saveQueued = false;
  let popMode = '';
  let browseGeneration = 0;
  let previewGeneration = 0;
  let hasEntered = false;
  let clockTimer = null;
  const browser = { path:'/', davUrl:'', items:[], total:0, truncated:false, limit:160, filesUrl:'#', loading:true, error:'', query:'', sort:'name', type:'all', view:'list', canCreate:true };
  const fileSelection=new Set();
  const fileClipboard={mode:'', entries:[]};
  let fileAnchorPath='';
  let fileBusy=false;
  let fileDragPaths=[];
  let pickerState=null;
  let pickerGeneration=0;
  const globalSearch={query:'',items:[],loading:false,error:'',nextOffset:null,total:0,type:'all',date:'all',size:'all',sort:'recent'};
  let searchPanelTab='search';
  const favoriteState={status:'idle',items:[],error:''};
  const favoritePaths=new Set();
  const recentViewed=[];

  let globalSearchGeneration=0;
  let globalSearchTimer=0;
  const uploadState={active:false,files:[],currentIndex:-1,loaded:0,totalBytes:0,doneBytes:0,xhr:null,cancel:false,finished:false};

  let dropZonePath='';
  const preview = { entry:null, status:'empty', mode:'empty', text:'', rows:[], error:'', title:'' };
  // Topbar navigation changes only this workspace, without a Nextcloud page load.
  let activeWorkspace = 'home';
  let transitionSequence = 0;
  const workspaceScroll = new Map();
  let moduleGeneration = 0;
  const photoState={status:'idle',items:[],partial:false,error:'',selected:-1};
  const notesState={status:'idle',items:[],selected:null, draftTitle:'',draftContent:'',dirty:false,error:'',source:'api',folder:'Notes',pagesPending:false,pageError:''};
  const deckState={status:'idle',boards:[],boardId:null,stacks:[],error:''};
  const deckFilters={boardId:null,query:'',status:'all',due:'all'};
  const deckStatusOptions=[['all','Tous les états'],['open','À faire'],['done','Terminées']];
  const deckDueOptions=[['all','Toutes les échéances'],['overdue','Date passée'],['today','Aujourd’hui'],['upcoming','7 prochains jours'],['undated','Sans échéance']];
  const deckCardEditor={boardId:null,stackId:null,cardId:null,card:null,create:false,draftStackId:null,loading:false,loadFailed:false,saving:false,error:'',dirty:false};
  let deckDrag=null;
  let deckMoveBusy=false;
  // Native CalDAV data. Only the signed-in user's accessible calendars are queried.
  const groupware={status:'idle',calendars:[],events:[],tasks:[],error:'',taskErrors:[],taskSources:0,taskSuccess:0,windowStart:null,windowEnd:null,busy:false,generation:0};
  const planningDeck={status:'idle',cards:[],error:'',updatedAt:0,generation:0};
  const integrations=Object.fromEntries(['talk','activity','contacts','mail'].map(id=>[id,{status:'idle',items:[],meta:{},error:'',generation:0,updatedAt:0}]));
  const integrationQueries={contacts:'',talk:'',activity:'',mail:''};
  let planningRange=30;
  let planningKinds=new Set(['event','task','deck']);
  let planningSearch='';
  let planningUrgentOnly=false;
  let calendarView='month';
  let calendarCursor=new Date();calendarCursor.setHours(12,0,0,0);
  let taskView='open';
  let taskQuery='';
  let taskList='';
  const TASK_PAGE_SIZE=50;
  let taskVisible=TASK_PAGE_SIZE;
  let noteQuery='';
  let noteLoadGeneration=0;
  let noteView='edit';
  let markdownPreview=false;
  const builtInApps=new Set(['files','photos','calendar','tasks','deck','notes','talk','contacts','mail','activity']);

  const history = ['/']; let historyIndex=0; let contextPath=''; let fullPreview=false; let previewBlobUrl=''; let previewError=false;

  const motionEnabled = () => settings && settings.motion !== 'off' && !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const motionFactor = () => settings?.motion === 'subtle' ? .7 : 1;

  function toast(message, type='info') {
    const node = document.createElement('div');
    node.className = `neos-toast neos-toast-${type}`;
    node.setAttribute('role', type==='error'?'alert':'status');
    node.setAttribute('aria-atomic','true');
    node.textContent = message;
    toastHost.replaceChildren(node);
    setTimeout(() => node.remove(), 3200);
  }

  async function api(url, options={}) {
    if (demo) throw new Error('Démo');
    const token = csrfToken();
    if (!token) throw new Error('Jeton CSRF manquant');
    const response = await fetch(url, {
      credentials:'same-origin', cache:'no-store', ...options,
      headers:{ Accept:'application/json', requesttoken:token, 'X-Requested-With':'XMLHttpRequest', ...(options.headers || {}) }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function applyTheme() {
    const pref = settings?.theme || 'system';
    const light = pref === 'light' || (pref === 'system' && window.matchMedia?.('(prefers-color-scheme: light)').matches);
    root.classList.toggle('neos-light', !!light);
    root.classList.toggle('neos-dark', !light);
    root.dataset.accent = settings?.accent || 'indigo';
    root.dataset.density = settings?.density || 'comfortable';
    root.dataset.layout = settings?.layout || 'wide';
    root.dataset.motion = settings?.motion || 'full';
    root.dataset.launcherMode = settings?.launcherMode || 'topbar';
  }

  // Timing, staging and stagger concepts adapted from Anime.js v4 documentation.
  // Uses the native Web Animations API to avoid remote scripts and CSP changes.
  function animateIn(nodes, delay=40, base=0) {
    if (!motionEnabled()) return;
    [...nodes].slice(0,28).forEach((el, i) => {
      if (!el?.animate) return;
      const duration = Math.round(560*motionFactor());
      el.animate([
        { opacity:0, transform:'translate3d(0,22px,0) scale(.982)', filter:'blur(3px)' },
        { opacity:1, transform:'translate3d(0,0,0) scale(1)', filter:'blur(0)' }
      ], { duration, delay:base + i*delay*motionFactor(), easing:'cubic-bezier(.16,1,.3,1)', fill:'backwards' });
    });
  }
  function animatePreview() {
    if (!motionEnabled()) return;
    const content=surface.querySelector('.neos-preview-body');
    content?.animate?.([
      {opacity:.1,transform:'translate3d(10px,0,0)'},
      {opacity:1,transform:'translate3d(0,0,0)'}
    ],{duration:340*motionFactor(),easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function animateRows() {
    animateIn(surface.querySelectorAll('.neos-file-row'),19,0);
  }

  function pulse(el) {
    if (!motionEnabled() || !el?.animate) return;
    el.animate([{transform:'scale(.985)'},{transform:'scale(1.02)'},{transform:'scale(1)'}], { duration:380*motionFactor(), easing:'cubic-bezier(.17,.89,.32,1.27)' });
  }
  // v0.6.30: Accessible keyboard focus for the existing modals. No API calls,
  // user data, or preferences are changed by this focus manager.
  const modalFocusable='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const modalOrigins=new WeakMap();
  let latestModalTrigger=null;
  function recordModalTrigger(node){
    const el=node?.closest?.('[data-action]');
    if(el && !el.closest('[role="dialog"]')) latestModalTrigger={element:el,action:el.dataset.action||'',workspace:el.dataset.workspace||'',time:Date.now()};
  }
  // Capture the opener before other handlers remove/re-render it.
  document.addEventListener('click',event=>recordModalTrigger(event.target),true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' ')recordModalTrigger(event.target);
  },true);
  function modalElements(dialog){
    return [...dialog.querySelectorAll(modalFocusable)].filter(el=>
      !el.disabled && el.getAttribute('aria-hidden')!=='true' &&
      getComputedStyle(el).visibility!=='hidden' && el.getClientRects().length>0);
  }
  function restoreModalOpener(origin){
    const el=origin?.element;
    const action=origin?.action;
    const workspace=origin?.workspace;
    let target=el?.isConnected&&!el?.inert?el:null;
    if(!target&&action){
      target=[...surface.querySelectorAll('[data-action]')].find(candidate=>
        candidate.dataset.action===action&&(!workspace||candidate.dataset.workspace===workspace))||null;
    }
    if(!target)target=surface.querySelector('[data-action="customize"], [data-action="toggle-hub"], [data-action="workspace"]');
    if(target?.isConnected&&!target.closest('[inert]'))target.focus({preventScroll:true});
  }
  function syncModalFocus(host){
    const dialog=host.querySelector('[role="dialog"][aria-modal="true"]');
    const prior=modalOrigins.get(host);
    if(dialog){
      if(!prior){
        const origin=latestModalTrigger&&Date.now()-latestModalTrigger.time<6000?latestModalTrigger:null;
        modalOrigins.set(host,{dialog,origin});
      }else{prior.dialog=dialog;}
      surface.inert=true;
      // A prior render may already have focused the title field; preserve it.
      if(!dialog.contains(document.activeElement)){
        const best=dialog.querySelector('[autofocus], [data-gw-title], [data-deck-title], [data-destination-search]');
        const first=(best&&!best.disabled?best:null)||modalElements(dialog)[0];
        if(first)first.focus({preventScroll:true});
        else{dialog.tabIndex=-1;dialog.focus({preventScroll:true});}
      }
    }else if(prior){
      modalOrigins.delete(host);
      surface.inert=!!editorHost.querySelector('[role="dialog"][aria-modal="true"]')||!!popHost.querySelector('[role="dialog"][aria-modal="true"]');
      requestAnimationFrame(()=>{
        if(!editorHost.querySelector('[role="dialog"][aria-modal="true"]')&&!popHost.querySelector('[role="dialog"][aria-modal="true"]'))
          restoreModalOpener(prior.origin);
      });
    }
  }
  // Only top-level child replacements are watched, not every keystroke inside
  // the forms. This also covers modal dialogs rendered asynchronously.
  new MutationObserver(()=>syncModalFocus(popHost)).observe(popHost,{childList:true});
  new MutationObserver(()=>syncModalFocus(editorHost)).observe(editorHost,{childList:true});
  function activeNeosDialog(){
    return editorHost.querySelector('[role="dialog"][aria-modal="true"]')||
      popHost.querySelector('[role="dialog"][aria-modal="true"]');
  }
  function neosDialogBusy(){
    return (popMode==='deck-card' && deckCardEditor.saving) ||
      (popMode==='groupware-edit' && groupware.busy) ||
      (popMode==='destination' && fileBusy);
  }
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab'||event.altKey||event.ctrlKey||event.metaKey)return;
    const dialog=activeNeosDialog();if(!dialog)return;
    const elements=modalElements(dialog);
    if(!elements.length){event.preventDefault();dialog.tabIndex=-1;dialog.focus({preventScroll:true});return;}
    const first=elements[0],last=elements[elements.length-1];
    if(!dialog.contains(document.activeElement)){
      event.preventDefault();(event.shiftKey?last:first).focus({preventScroll:true});return;
    }
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){
      event.preventDefault();last.focus({preventScroll:true});
    }else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){
      event.preventDefault();first.focus({preventScroll:true});
    }
  },true);

  function animateLayerOpen(host, panelSelector, axis='x') {
    if (!motionEnabled()) return;
    const overlay = host.firstElementChild; const panel = host.querySelector(panelSelector); const shift = axis === 'y' ? '0,18px,0' : '24px,0,0';
    overlay?.animate?.([{opacity:0},{opacity:1}],{duration:220*motionFactor(),easing:'ease-out'});
    panel?.animate?.([{opacity:0,transform:`translate3d(${shift}) scale(.986)`,filter:'blur(6px)'},{opacity:1,transform:'translate3d(0,0,0) scale(1)',filter:'blur(0)'}],{duration:420*motionFactor(),easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function animateLayerClose(host, panelSelector, done, axis='x') {
    const overlay = host.firstElementChild; const panel = host.querySelector(panelSelector); if (!motionEnabled() || !overlay) { done(); return; }
    const shift = axis === 'y' ? '0,18px,0' : '20px,0,0';
    overlay.animate([{opacity:1},{opacity:0}],{duration:180*motionFactor(),easing:'ease-in'});
    panel?.animate?.([{opacity:1,transform:'translate3d(0,0,0) scale(1)',filter:'blur(0)'},{opacity:0,transform:`translate3d(${shift}) scale(.99)`,filter:'blur(5px)'}],{duration:180*motionFactor(),easing:'cubic-bezier(.4,0,1,1)'});
    setTimeout(done, Math.round(195*motionFactor()));
  }

  function widgetMinHeight(id){
    if(settings?.gridMode!=='manual')return 0;
    const value=Number(settings.heights?.[id]||0);
    return allowedHeights.includes(value)?value:0;
  }
  function widgetSpan(id){
    const requested = Number(settings?.sizes?.[id]);
    return settings?.gridMode==='adaptive' ? (adaptiveSizes[id] || 6) : (allowedSizes.includes(requested) ? requested : defaultSizes[id] || 6);
  }
  function editWidgetTools(id){
    if(!editing||activeWorkspace!=='home')return '';
    const order=settings.order.filter(key=>!settings.hidden.includes(key)&&(key!=='shortcuts'||settings.launcherMode==='widget'));
    const index=order.indexOf(id);const span=widgetSpan(id);const height=widgetMinHeight(id);
    const minHeightLabel=height?`${height} px`:'Auto';
    return `<div class="neos-widget-edit-controls"><button type="button" class="neos-mini-action neos-drag-handle" draggable="true" data-drag-widget="${id}" title="Déplacer par glisser-déposer" aria-label="Déplacer ${esc(widgetLabels[id])} par glisser-déposer">${icon('grip',17)}</button><button type="button" class="neos-mini-action" data-action="widget-move" data-id="${id}" data-step="-1" ${index<=0?'disabled':''} aria-label="Déplacer ${esc(widgetLabels[id])} vers le début">${icon('back',14)}</button><button type="button" class="neos-mini-action" data-action="widget-move" data-id="${id}" data-step="1" ${index>=order.length-1?'disabled':''} aria-label="Déplacer ${esc(widgetLabels[id])} vers la fin">${icon('forward',14)}</button><span class="neos-edit-sep"></span><button type="button" class="neos-mini-action" data-action="widget-resize" data-id="${id}" data-step="-1" ${settings.gridMode==='adaptive'?'disabled':''} title="Réduire la largeur">${icon('minus',13)}</button><span class="neos-widget-span" title="Largeur actuelle">${Math.round(span/12*100)}%</span><button type="button" class="neos-mini-action" data-action="widget-resize" data-id="${id}" data-step="1" ${settings.gridMode==='adaptive'?'disabled':''} title="Agrandir la largeur">${icon('plus',13)}</button><span class="neos-edit-sep"></span><button type="button" class="neos-mini-action" data-action="widget-height" data-id="${id}" data-step="-1" ${settings.gridMode==='adaptive'?'disabled':''} title="Réduire la hauteur minimale">${icon('chevrons-down',15)}</button><span class="neos-widget-span neos-height-indicator" title="Hauteur minimale">${minHeightLabel}</span><button type="button" class="neos-mini-action" data-action="widget-height" data-id="${id}" data-step="1" ${settings.gridMode==='adaptive'?'disabled':''} title="Augmenter la hauteur minimale">${icon('chevrons-up',15)}</button></div>`;
  }
  function box(id, body, sub='', tools='') {
    const size=widgetSpan(id);
    return `<section class="neos-card neos-${id} ${editing&&activeWorkspace==='home'?'neos-editable-card':''}" data-widget="${id}" data-size="${size}" data-min-height="${widgetMinHeight(id)}" draggable="false">
      <header class="neos-card-head"><div class="neos-card-name">${icon(widgetIcons[id],18)}<span>${esc(widgetLabels[id])}</span></div><div class="neos-card-actions">${editing&&activeWorkspace==='home'?editWidgetTools(id):tools}<span class="neos-card-sub">${editing&&activeWorkspace==='home'?'':sub}</span></div></header>
      <div class="neos-card-body">${body}</div>
    </section>`;
  }

  function filesHomeUrl(){ return browser.filesUrl && browser.filesUrl !== '#' ? browser.filesUrl : ((overview?.shortcuts || []).find(x => x.id === 'files')?.url || '/index.php/apps/files/'); }

  function breadcrumb() {
    const names = browser.path.split('/').filter(Boolean);
    const crumbs = [`<button type="button" class="neos-crumb ${names.length ? '' : 'active'}" data-action="browse-path" data-path="/">${icon('home',14)}</button>`];
    let path = '';
    names.forEach((part, idx) => { path += '/' + part; crumbs.push(`${icon('chevron',12)}<button type="button" class="neos-crumb ${idx===names.length-1?'active':''}" data-action="browse-path" data-path="${esc(path)}">${esc(part)}</button>`); });
    return crumbs.join('');
  }

  function appColor(id){return ({files:'#FFBC4B',photos:'#2CC9FC',calendar:'#B480FF',tasks:'#36D6AD',talk:'#F77BAE',contacts:'#58BAFF',mail:'#628FFF',activity:'#FFB14D',deck:'#22CDD7',notes:'#B78AFF',bookmarks:'#FFCF59',news:'#7abfff',maps:'#36d6ad',tables:'#59BAFF',office:'#B480FF'})[id]||'#95a5ff';}
  const appAsset=name=>(demo && window.NEOS_PREVIEW_ASSETS?.[name]) || (demo?'./novadashboard/img/':String(root.dataset.assetBase||'/apps/novadashboard/img/').replace(/\/?$/,'/')) + String(name).split('/').map(encodeURIComponent).join('/');
  const kitFile=path=>appAsset('kit/'+path);
  const flatIconMap={files:'fichiers',photos:'photos',calendar:'agenda',tasks:'taches',talk:'talk',contacts:'contacts',mail:'mail',activity:'activite',deck:'deck',notes:'notes'};
  const flatIconId=id=>flatIconMap[id]||'';
  const flatIconAsset=(kind,id)=>{const mapped=flatIconId(id);return mapped?kitFile(`icons/${kind==='glyphs'?'apps':'tiles'}/${mapped}.svg`):'';};
  const glyphPaths={
    files:'<path d="M3.5 8v10.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2h-6l-2.1-2.6H5.5a2 2 0 0 0-2 2V8Z"/>',
    photos:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m5 18 5.5-6 3.3 3 2.1-2 3.2 5"/>',
    calendar:'<rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M7.8 3.5v4M16 3.5v4M3.5 10h17"/><path d="M8 14h2m4 0h2m-8 3h2"/>',
    planning:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
    tasks:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8 12 2.8 2.8 5.2-5.7"/>',
    talk:'<path d="M20 11.1a7.9 7.9 0 0 1-8.1 7.8c-1.3 0-2.7-.3-3.8-1L4 20l1.2-4.5A7.7 7.7 0 0 1 4 11.1a8 8 0 0 1 16 0Z"/><path d="M8 11.4h.1m3.9 0h.1m3.9 0h.1"/>',
    contacts:'<circle cx="9" cy="8" r="3"/><path d="M3.5 19v-1.4A5.5 5.5 0 0 1 9 12a5.5 5.5 0 0 1 5.5 5.6V19"/><path d="M16 5.5a3 3 0 0 1 0 5.8m1.2 2a5 5 0 0 1 3.3 4.8V19"/>',
    mail:'<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="m4.5 7 7.5 6 7.5-6"/>',
    activity:'<path d="M2.8 12h4.1l2.5-6.6 4.2 13.2 2.3-6.6h5.3"/>',
    deck:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9.5 4v16m5-16v16M5.8 8h1.6m3.6 0h1.6m3.6 0h1.6M5.8 12h1.6"/>',
    notes:'<path d="M6 3.5h9l3 3V20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M14 3.5v4h4M8 12h7M8 15.5h5"/>',
    bookmarks:'<path d="M6 3.5h12v17l-6-4-6 4v-17Z"/>',
    maps:'<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6Zm5-2v14m6-12v14"/>',
    tables:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17m-11-5.5v15m5-15v15"/>',
    office:'<path d="M6 3.5h8l4 4v13H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M14 3.5v4h4M8 12h7m-7 3h7"/>',
    news:'<path d="M5 4.5h12v12H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M17 8h2a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.5M7 9h7M7 12h5"/>'
  };
  const appGlyph=(id,size=23)=>`<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${glyphPaths[id]||icons.grid}</svg>`;
  function topApps(){const allowed=new Set(settings.topApps||[]);const filesInWorkspace=!(settings.hidden||[]).includes('explorer');return (overview?.shortcuts||[]).filter(a=>allowed.has(a.id)&&!(a.id==='files'&&filesInWorkspace)).slice(0,8);}
  function brandMark(){return `<span class="neos-symbol-crop" aria-hidden="true"><img class="neos-symbol-five" src="${safeUrl(kitFile('branding/neos-logo-05-hybrid-v0641.png'))}" alt="" loading="eager"></span><img class="neos-wordmark-approved" src="${safeUrl(kitFile('branding/neos-logo-approved-v0638.png'))}" alt="Neos" loading="eager"><span class="neos-logo-subtitle">Dashboard</span>`;}
  function appGlyphMarkup(id,label,size=19){const src=flatIconAsset('glyphs',id);return src?`<img src="${safeUrl(src)}" alt="" loading="lazy" class="neos-glyph-img" width="${size}" height="${size}">`:appGlyph(id,size);}
  function appTileMarkup(id,label){const src=flatIconAsset('tiles',id);return src?`<img src="${safeUrl(src)}" alt="" loading="lazy" class="neos-app-tile">`:`<span class="neos-app-glyph">${appGlyph(id,27)}</span>`;}
  function hubIconMarkup(id,label){
    // Supplied Planning artwork: transparent PNG processed for Neos tiles.
    if(id==='planning')return `<img class="neos-hub-icon neos-hub-png256 neos-hub-planning" src="${safeUrl(kitFile('icons/png256/planning.png'))}" alt="" loading="lazy" width="76" height="76">`;
    const mapped=flatIconId(id);
    if(mapped){
      const png=kitFile(`icons/png256/${mapped}.png`);
      return `<img class="neos-hub-icon neos-hub-png256" src="${safeUrl(png)}" alt="" loading="lazy" width="76" height="76">`;
    }
    return appGlyphMarkup(id,label,55);
  }
  function hubGrid(compact=false){
    const installed=availableApps();
    const builtIn=orderedApps.map(id=>({id,label:appName(id),available:id==='planning'||installed.has(id)}));
    const extra=(overview?.shortcuts||[]).filter(a=>!orderedApps.includes(a.id));
    const list=[{id:'home',label:'Accueil',available:true},...builtIn,...extra];
    return `<div class="neos-hub-grid neos-hub-icons ${compact?'is-compact':''}">${list.map(app=>{
      const internal=installedTabs().includes(app.id);
      const src=app.id==='home'?safeUrl(kitFile('icons/ui/accueil.svg')):'';
      const picture=app.id==='home'?`<img class="neos-hub-icon neos-hub-png256" src="${safeUrl(appAsset('neos-home-cyan-v056-256.png'))}" alt="" loading="eager" width="76" height="76">`:hubIconMarkup(app.id,app.label);
      const action=internal?`<button type="button" class="neos-app ${app.available?'':'is-unavailable'}" data-action="workspace" data-workspace="${esc(app.id)}" title="${esc(app.label)}" aria-label="Ouvrir ${esc(app.label)} dans Neos">`:`<a class="neos-app" href="${safeUrl(app.url)}" title="${esc(app.label)}">`;
      return `${action}<span class="neos-app-visual">${picture}</span><span class="neos-app-meta"><span class="neos-app-label">${esc(app.label)}</span>${!app.available&&internal?'<small>À activer</small>':''}</span>${internal?'</button>':'</a>'}`;
    }).join('')}</div>`;
  }

  const appName=id=>({'home':'Accueil','files':'Fichiers','photos':'Photos','calendar':'Agenda','planning':'Planning','tasks':'Tâches','talk':'Talk','contacts':'Contacts','mail':'Mail','activity':'Activité','deck':'Deck','notes':'Notes'})[id]||id;
  const orderedApps=['files','photos','planning','calendar','tasks','talk','contacts','mail','activity','deck','notes'];
  const defaultTabOrder=['home', ...orderedApps];
  function normalizeTabOrder(order){
    const valid=Array.isArray(order)?order.filter(id=>typeof id==='string'&&defaultTabOrder.includes(id)):[];
    return [...new Set([...valid,...defaultTabOrder])];
  }
  function installedTabs(){
    // Order is stored in each user's Nextcloud preferences, not localStorage.
    // Keep unavailable apps visible with their existing empty/error states.
    return normalizeTabOrder(settings?.tabOrder);
  }
  function moveTab(from,to,after=false){
    const order=installedTabs();
    if(!order.includes(from)||!order.includes(to)||from===to)return;
    const previous=order.join('|');
    order.splice(order.indexOf(from),1);
    const index=order.indexOf(to)+(after?1:0);
    order.splice(index,0,from);
    if(order.join('|')===previous)return;
    settings.tabOrder=order;
    queueSave();render();
    if(editorOpen)renderEditor();
  }
  function moveTabStep(id,step){
    const order=installedTabs();const current=order.indexOf(id);const target=current+step;
    if(current<0||target<0||target>=order.length)return;
    moveTab(id,order[target],step>0);
  }
  function resetTabOrder(){settings.tabOrder=[...defaultTabOrder];queueSave();render();if(editorOpen)renderEditor();}
  function clearTabDragHints(){
    surface.querySelectorAll('.neos-tab-drop-before,.neos-tab-drop-after,.neos-tab-dragging').forEach(el=>el.classList.remove('neos-tab-drop-before','neos-tab-drop-after','neos-tab-dragging'));
    editorHost.querySelectorAll('.neos-tab-order-over,.neos-tab-order-dragging').forEach(el=>el.classList.remove('neos-tab-order-over','neos-tab-order-dragging'));
  }
  const availableApps=()=>new Set((overview?.shortcuts||[]).map(x=>x.id));
  // The home icon remains flat in the tab bar. The enlarged image is used in the hub only.
  function flatTabIcon(id){
    const asset=id==='home'?kitFile('icons/ui/accueil.svg'):flatIconAsset('glyphs',id);
    return asset?`<img class="neos-tab-flat-icon" src="${safeUrl(asset)}" alt="" loading="eager" width="21" height="21">`:`<span class="neos-tab-flat-icon">${appGlyph(id,20)}</span>`;
  }
  function tabBar(){return `<nav class="neos-workspace-tabs ${editing?'neos-tabs-arranging':''}" aria-label="Espaces de travail"><span class="neos-tab-slider" aria-hidden="true"></span>${installedTabs().map(id=>`<button type="button" data-action="workspace" data-workspace="${id}" data-drag-tab="${id}" ${editing?'draggable="true"':''} title="${esc(appName(id))}" class="neos-workspace-tab ${activeWorkspace===id?'is-active':''}" aria-current="${activeWorkspace===id?'page':'false'}" aria-label="Onglet ${esc(appName(id))}${editing?' — déplacer par glisser-déposer':''}">${flatTabIcon(id)}<span class="neos-workspace-label">${esc(appName(id))}</span>${editing?`<span class="neos-tab-drag-indicator">${icon('grip',13)}</span>`:''}</button>`).join('')}</nav>`;}
  let pillFrame=0;
  function positionTabSlider(from=null){
    const nav=surface.querySelector('.neos-workspace-tabs');
    const slider=nav?.querySelector('.neos-tab-slider');
    const active=nav?.querySelector('.neos-workspace-tab.is-active');
    if(!nav||!slider||!active)return;
    const x=active.offsetLeft, width=active.offsetWidth;
    const initial=from&&Number.isFinite(from.x)&&from.width>0?from:{x,width};
    slider.style.width=`${initial.width}px`;
    slider.style.transform=`translate3d(${initial.x}px,-50%,0)`;
    if(pillFrame)cancelAnimationFrame(pillFrame);
    const move=()=>{
      // Force the initial layout before toggling the transition on a re-render.
      void slider.offsetWidth;
      const animated=motionEnabled()&&Math.abs(initial.x-x)>1;
      if(animated)slider.classList.add('neos-tab-slider-ready');
      slider.style.width=`${width}px`;
      slider.style.transform=`translate3d(${x}px,-50%,0)`;
      if(!animated)slider.classList.remove('neos-tab-slider-ready');
    };
    pillFrame=requestAnimationFrame(()=>{pillFrame=0;move();});
  }
  function previousTabPosition(){
    const old=surface.querySelector('.neos-workspace-tabs .neos-workspace-tab.is-active');
    return old?{x:old.offsetLeft,width:old.offsetWidth}:null;
  }
  function workspaceHero(){
    const label=activeWorkspace==='home'?'Tableau de bord':activeWorkspace==='files'?'Fichiers':appName(activeWorkspace);
    const count=activeWorkspace==='planning'?'Agenda · Tâches · Deck':activeWorkspace==='home'?'Vue d’ensemble':activeWorkspace==='files'?`${browser.total} éléments`:activeWorkspace==='photos'?`${photoState.items.length} images`:activeWorkspace==='notes'?`${notesState.items.length} notes`:activeWorkspace==='deck'?`${deckState.boards.length} tableaux`:'Nextcloud';
    return `<div class="neos-hero"><div class="neos-hero-motion" aria-hidden="true"><span class="neos-hero-arc neos-hero-arc-one"></span><span class="neos-hero-arc neos-hero-arc-two"></span><span class="neos-hero-diagonal neos-hero-diagonal-one"></span><span class="neos-hero-diagonal neos-hero-diagonal-two"></span><span class="neos-hero-pulse"></span></div><div class="neos-hero-head"><span class="neos-hero-eyebrow">NEOS <span>/</span> ${esc(activeWorkspace.toUpperCase())}</span><h1>${esc(label)}</h1></div><div class="neos-hero-meta"><span class="neos-dot"></span><span>${esc(count)}</span><span class="neos-hero-clock" data-clock>--:--</span></div></div>`;
  }
  function panelHeader(title,subtitle='',actions=''){
    return `<div class="neos-module-header"><div><span class="neos-module-eyebrow">ESPACE INTÉGRÉ</span><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><div class="neos-module-actions">${actions}</div></div>`;
  }
  function emptyModule(text,link='',href='#'){
    return `<div class="neos-module-empty"><span class="neos-module-empty-mark">${icon('grid',30)}</span><strong>${esc(text)}</strong>${link?`<a class="neos-btn" href="${safeUrl(href)}">${esc(link)} ${icon('external',15)}</a>`:''}</div>`;
  }
  const moduleLink=id=>(overview?.shortcuts||[]).find(app=>app.id===id)?.url || `/index.php/apps/${id}/`;
  function photoModule(){
    const body=photoState.status==='loading' ? '<div class="neos-module-loader"><span class="neos-spinner"></span>Chargement des images</div>' :
      photoState.status==='error'?emptyModule(photoState.error||'Photos indisponibles','Ouvrir Photos',moduleLink('photos')) :
      photoState.items.length?`<div class="neos-photo-grid">${photoState.items.map((photo,i)=>`<button type="button" class="neos-photo-item" data-action="photo-open" data-photo-index="${i}" title="${esc(photo.name)}"><img src="${safeUrl(photo.previewUrl||photo.davUrl)}" loading="lazy" alt=""><span>${esc(photo.name)}</span></button>`).join('')}</div>${photoState.partial?'<p class="neos-module-small">Résultats partiels — limite de scan atteinte.</p>':''}`:emptyModule('Aucune image trouvée dans les dossiers accessibles.');
    return `<section class="neos-module neos-photo-module">${panelHeader('Photos','Images de tes fichiers Nextcloud',`<button class="neos-iconbtn" data-action="module-refresh" title="Rafraîchir" aria-label="Rafraîchir">${icon('refresh',17)}</button><a class="neos-btn" href="${safeUrl(moduleLink('photos'))}">${icon('external',15)} Albums natifs</a>`)}<div class="neos-module-body">${body}</div></section>`;
  }
  function noteListMarkup(){
    if(notesState.status==='loading')return '<div class="neos-module-loader" role="status">Chargement des notes…</div>';
    if(notesState.status==='error')return `<div class="neos-notes-error" role="alert">${esc(notesState.error)}</div>`;
    const all=notesState.items;
    const query=noteQuery.trim();
    const matching=query?all.filter(note=>matchesWords([note.title,note.content],query)):all;
    const paging=notesState.pagesPending?'<p role="status">Chargement du reste des notes…</p>':notesState.pageError?'<p role="alert">'+esc(notesState.pageError)+'</p><button type="button" class="neos-btn" data-action="module-refresh">Réessayer</button>':'';
    if(!all.length)return paging||'<div class="neos-module-empty-small">Aucune note.</div>';
    const count=query?`<p class="neos-note-search-count" role="status">${matching.length} résultat${matching.length===1?'':'s'} sur ${all.length} notes chargées</p>`:'';
    if(!matching.length)return count+(paging||'<div class="neos-module-empty-small">Aucune note ne correspond à cette recherche.</div>');
    const rows=matching.map(note=>{
      const active=String(note.id)===String(notesState.selected);
      return `<button type="button" class="neos-note-row ${active?'is-active':''}" data-action="note-select" data-note-id="${esc(note.id)}" ${active?'aria-current="true"':''}><strong>${esc(note.title||'Sans titre')}</strong><span>${esc(note.category||'Notes')} · ${ago(note.modified)}</span></button>`;
    }).join('');
    return count+rows+paging;
  }
  function noteSearchMarkup(){
    if(notesState.status!=='ready')return '';
    return `<div class="neos-note-search"><label class="neos-sr-only" for="neos-note-query">Rechercher dans les notes</label><input id="neos-note-query" type="search" data-note-search maxlength="180" value="${esc(noteQuery)}" placeholder="Titre ou contenu…" autocomplete="off"><button type="button" class="neos-btn" data-action="note-search-clear" ${noteQuery?'':'hidden'}>Effacer</button></div>`;
  }
  function updateNoteSearch(event){
    const field=event.target;
    if(!field.matches?.('[data-note-search]')||event.isComposing||field.value===noteQuery)return;
    noteQuery=field.value.slice(0,180);
    const results=surface.querySelector('[data-note-list]');
    if(results)results.innerHTML=noteListMarkup();
    const clear=surface.querySelector('[data-action="note-search-clear"]');
    if(clear)clear.hidden=!noteQuery;
  }
  function noteModule(){
    const list=notesState.items;
    const selected=list.find(n=>String(n.id)===String(notesState.selected));
    const sidebar=noteSearchMarkup()+`<div data-note-list>${noteListMarkup()}</div>`;
    const editor=selected?`<div class="neos-note-editor"><div class="neos-note-titleline"><input data-note-title class="neos-note-title-input" maxlength="180" value="${esc(notesState.draftTitle)}" ${selected.readonly?'readonly':''} aria-label="Titre de la note"><button type="button" class="neos-btn neos-btn-small" data-action="note-preview-toggle" aria-pressed="${noteView==='preview'}">${icon('note',15)} ${noteView==='preview'?'Éditer':'Aperçu'}</button></div>${noteView==='preview'?`<article class="neos-markdown-preview neos-note-rendered">${markdownHtml(notesState.draftContent)}</article>`:`<textarea data-note-content class="neos-note-content-input" spellcheck="true" ${selected.readonly?'readonly':''} aria-label="Contenu de la note">${esc(notesState.draftContent)}</textarea>`}<div class="neos-note-bottom"><span data-note-status>${notesState.dirty?'Modifications non enregistrées':selected.readonly?'Lecture seule':'Enregistré'}</span><span data-note-count>${notesState.draftContent.trim()?notesState.draftContent.trim().split(/\s+/).length:0} mots</span><button class="neos-btn neos-btn-primary" type="button" data-action="note-save" ${selected.readonly?'disabled':''}>${icon('check',16)} Enregistrer</button></div></div>`:emptyModule('Sélectionne une note.');
    return `<section class="neos-module">${panelHeader('Notes',notesState.source==='files'?'Édition des fichiers Markdown Nextcloud (API Notes absente)':'Consultation et édition dans Neos',`<button class="neos-btn neos-btn-primary" data-action="note-new">${icon('plus',16)} Nouvelle note</button>${notesState.source==='api'?`<a class="neos-btn" href="${safeUrl(moduleLink('notes'))}">${icon('external',15)} Notes</a>`:''}`)}<div class="neos-module-body neos-notes-layout"><aside class="neos-notes-sidebar">${sidebar}</aside><div class="neos-notes-main">${editor}</div></div></section>`;
  }
  function deckDueLabel(value){
    if(!value)return '';
    const date=new Date(value);
    if(!Number.isFinite(date.getTime()))return '';
    return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(date);
  }
  function deckCardMatches(card,filters,now){
    if(filters.status==='open'&&card.done)return false;
    if(filters.status==='done'&&!card.done)return false;
    return taskMatchesQuery(card,filters.query)&&taskMatchesView({due:card.duedate},filters.due,now);
  }
  function deckFiltersMarkup(visible,total,filtered){
    const options=(choices,value)=>choices.map(([id,label])=>`<option value="${id}" ${id===value?'selected':''}>${label}</option>`).join('');
    return `<div class="neos-deck-filters">
      <label class="neos-deck-search"><span>Rechercher</span><input type="search" data-deck-search maxlength="180" value="${esc(deckFilters.query)}" placeholder="Titre ou description…" autocomplete="off"></label>
      <label><span>État</span><select data-deck-filter="status">${options(deckStatusOptions,deckFilters.status)}</select></label>
      <label><span>Échéance</span><select data-deck-filter="due">${options(deckDueOptions,deckFilters.due)}</select></label>
      ${filtered?'<button type="button" class="neos-btn" data-action="deck-filters-clear">Effacer les filtres</button>':''}
    </div><p class="neos-deck-filter-count" role="status">${filtered?`${visible} sur ${total} cartes`:`${total} carte${total===1?'':'s'}`}</p>`;
  }
  function renderDeckFilters(selector,selection){
    const scroll=surface.querySelector('.neos-kanban')?.scrollLeft||0;
    render();
    const board=surface.querySelector('.neos-kanban');
    if(board)board.scrollLeft=scroll;
    const control=surface.querySelector(selector);
    control?.focus({preventScroll:true});
    if(control&&selection?.every(Number.isInteger))control.setSelectionRange(...selection);
  }
  function updateDeckSearch(event){
    const field=event.target;
    if(!field.matches?.('[data-deck-search]')||event.isComposing||field.value===deckFilters.query)return;
    deckFilters.query=field.value.slice(0,180);
    renderDeckFilters('[data-deck-search]',[field.selectionStart,field.selectionEnd]);
  }
  function deckModule(){
    const board=deckState.boards.find(b=>String(b.id)===String(deckState.boardId));
    const boardButtons=deckState.boards.map(b=>`<button type="button" class="neos-board-chip ${String(b.id)===String(deckState.boardId)?'is-active':''}" data-action="deck-board" data-board-id="${esc(b.id)}">${esc(b.title)}</button>`).join('');
    const now=new Date();
    const filtered=Boolean(deckFilters.query.trim())||deckFilters.status!=='all'||deckFilters.due!=='all';
    let total=0,visible=0;
    const stacks=deckState.stacks.map(stack=>{
      const cards=stack.cards||[];
      const matching=filtered?cards.filter(card=>deckCardMatches(card,deckFilters,now)):cards;
      total+=cards.length;visible+=matching.length;
      return `<section class="neos-stack" data-deck-drop-stack="${esc(stack.id)}"><header><h3>${esc(stack.title)}</h3><span>${filtered?`${matching.length}/${cards.length}`:cards.length}</span></header><div class="neos-stack-cards" data-deck-drop-stack="${esc(stack.id)}">${matching.map(card=>`<button type="button" class="neos-deck-card ${card.done?'is-done':''}" draggable="${!deckMoveBusy}" data-action="deck-card-open" data-stack-id="${esc(stack.id)}" data-card-id="${esc(card.id)}" aria-label="Ouvrir ${esc(card.title||'Carte')} — déplacer par glisser-déposer"><span class="neos-deck-card-title">${card.done?icon('check',14):''}${esc(card.title||'Sans titre')}</span><small>${card.duedate?`Échéance ${esc(deckDueLabel(card.duedate))}`:card.description?'Description disponible':'Déplacer vers une autre colonne'}</small></button>`).join('')||(filtered?'<p class="neos-deck-stack-empty">Aucun résultat</p>':'')}</div><button type="button" class="neos-stack-add" data-action="deck-add" data-stack-id="${esc(stack.id)}">${icon('plus',15)} Ajouter une carte</button></section>`;
    }).join('');
    const body=deckState.status==='loading'?'<div class="neos-module-loader"><span class="neos-spinner"></span>Chargement Deck</div>':deckState.status==='error'?emptyModule(deckState.error||'Deck indisponible','Ouvrir Deck',moduleLink('deck')):board?`<div class="neos-board-nav">${boardButtons}</div>${deckFiltersMarkup(visible,total,filtered)}<p class="neos-deck-instructions">Glisse une carte vers une colonne ou ouvre-la pour changer sa colonne, son échéance ou son état.</p><div class="neos-kanban">${stacks||emptyModule('Aucune colonne sur ce tableau.')}</div>`:emptyModule('Aucun tableau disponible.');
    return `<section class="neos-module">${panelHeader('Deck','Tableaux et cartes de tes projets',`<button class="neos-iconbtn" data-action="module-refresh" title="Rafraîchir" aria-label="Rafraîchir">${icon('refresh',17)}</button><a class="neos-btn" href="${safeUrl(moduleLink('deck'))}">${icon('external',15)} Deck</a>`)}<div class="neos-module-body">${body}</div></section>`;
  }

  // Calendar navigation uses local days to avoid UTC date drift on time-zone boundaries.
  const calDayKey=(date)=>{const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const calFromKey=(key)=>{const [y,m,d]=String(key).split('-').map(Number);return new Date(y,m-1,d,12,0,0,0);};
  function calStartOfWeek(date){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);d.setDate(d.getDate()-(d.getDay()+6)%7);return d;}
  function calFetchWindow(){
    if(activeWorkspace==='planning'){
      const start=new Date();start.setHours(0,0,0,0);
      const end=new Date(start);end.setDate(end.getDate()+planningRange);
      return {start,end};
    }
    return {start:new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1),
      end:new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+3,1)};
  }
  function calVisibleDays(){
    let first,count;
    if(calendarView==='week'){first=calStartOfWeek(calendarCursor);count=7;}
    else {first=calStartOfWeek(new Date(calendarCursor.getFullYear(),calendarCursor.getMonth(),1,12));count=42;}
    return Array.from({length:count},(_,i)=>{const day=new Date(first);day.setDate(first.getDate()+i);return day;});
  }
  function calEventsOn(day){
    const from=new Date(day.getFullYear(),day.getMonth(),day.getDate());const to=new Date(from);to.setDate(to.getDate()+1);
    return groupware.events.filter(event=>{const start=Date.parse(event.start),end=Date.parse(event.end)||start+3600000;return start<to.getTime()&&end>from.getTime();});
  }
  const nativeModuleAvailable=id=>(overview?.shortcuts||[]).some(x=>x.id===id);
  const nativeModuleButton=(id,label='Ouvrir')=>nativeModuleAvailable(id)?`<a class="neos-btn" href="${safeUrl(moduleLink(id))}" target="_blank" rel="noopener noreferrer">${icon('external',14)} ${esc(label)}</a>`:'';
  function calendarWindowReady(){
    const days=calVisibleDays();
    const range=activeWorkspace==='planning'?calFetchWindow():{start:new Date(days[0].getFullYear(),days[0].getMonth(),days[0].getDate()),end:new Date(days[days.length-1].getFullYear(),days[days.length-1].getMonth(),days[days.length-1].getDate()+1)};
    return groupware.windowStart&&groupware.windowEnd&&range.start>=groupware.windowStart&&range.end<=groupware.windowEnd;
  }
  function moveCalendar(step){
    if(step==='today')calendarCursor=new Date();
    else if(calendarView==='week')calendarCursor.setDate(calendarCursor.getDate()+Number(step)*7);
    else calendarCursor.setMonth(calendarCursor.getMonth()+Number(step),1);
    calendarCursor.setHours(12,0,0,0);
    if(!calendarWindowReady()&&!demo)void loadGroupware(true);else render();
  }
  function calendarGrid(){
    const days=calVisibleDays(),now=calDayKey(new Date());
    const monthName=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(calendarCursor);
    const from=days[0],to=days[days.length-1];
    const weekName=`${new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(from)} – ${new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(to)}`;
    const dayNames=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const headings=dayNames.map(x=>`<div class="neos-cal-weekday">${x}</div>`).join('');
    const dayCells=days.map(day=>{
      const key=calDayKey(day),events=calEventsOn(day),today=key===now,other=calendarView==='month'&&day.getMonth()!==calendarCursor.getMonth();
      return `<div class="neos-cal-day ${today?'is-today':''} ${other?'is-other':''}" data-cal-day="${key}"><button type="button" class="neos-cal-day-number" data-action="cal-day" data-date="${key}" aria-label="Créer un événement le ${esc(new Intl.DateTimeFormat('fr-FR',{dateStyle:'full'}).format(day))}">${day.getDate()}${today?'<span class="neos-cal-today-label">Aujourd’hui</span>':''}</button><div class="neos-cal-events">${events.slice(0,calendarView==='week'?9:3).map(event=>`<button type="button" class="neos-cal-event" data-action="cal-event" data-href="${esc(calendarEventKey(event))}" title="${esc(event.title)}"><span>${esc(event.title)}</span>${calendarView==='week'?`<small>${esc(fmtTime(event.start))}</small>`:''}</button>`).join('')}${events.length>(calendarView==='week'?9:3)?`<span class="neos-cal-more">+${events.length-(calendarView==='week'?9:3)} autres</span>`:''}</div></div>`;
    }).join('');
    const currentTitle=calendarView==='month'?monthName:weekName;
    return `<div class="neos-calendar-workspace"><div class="neos-calendar-toolbar"><div class="neos-calendar-nav"><button type="button" class="neos-iconbtn" data-action="cal-prev" aria-label="Période précédente">${icon('chevron',17)}</button><button type="button" class="neos-btn neos-btn-small" data-action="cal-today">Aujourd’hui</button><button type="button" class="neos-iconbtn" data-action="cal-next" aria-label="Période suivante">${icon('chevron',17)}</button><strong>${esc(currentTitle)}</strong></div><div class="neos-calendar-views"><button type="button" data-action="cal-view" data-view="month" aria-pressed="${calendarView==='month'}" class="${calendarView==='month'?'is-active':''}">Mois</button><button type="button" data-action="cal-view" data-view="week" aria-pressed="${calendarView==='week'}" class="${calendarView==='week'?'is-active':''}">Semaine</button></div></div><div class="neos-calendar-grid ${calendarView==='week'?'is-week':'is-month'}">${headings}${dayCells}</div><p class="neos-gw-hint">Clique sur un jour pour créer un événement, ou sur un événement pour consulter ses détails. Les récurrences complexes restent gérées dans Agenda Nextcloud.</p></div>`;
  }
  function calendarComponents(raw){
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
  function calendarEventDetail(href){
    const event=groupware.events.find(e=>calendarEventKey(e)===href);if(!event)return;
    const when=iso=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'full',timeStyle:'short'}).format(new Date(iso));
    popMode='calendar-detail';
    popHost.innerHTML=`<div class="neos-pop-layer" data-action="close-pop"><section class="neos-groupware-dialog neos-framed" role="dialog" aria-modal="true" aria-label="Détails de l’événement"><header><strong>${esc(event.title)}</strong><button type="button" class="neos-iconbtn" data-action="close-pop" aria-label="Fermer">${icon('close',19)}</button></header><div class="neos-cal-detail"><div><span>Début</span><strong>${esc(when(event.start))}</strong></div>${event.end?`<div><span>Fin</span><strong>${esc(when(event.end))}</strong></div>`:''}<div><span>Calendrier</span><strong>${esc(event.calendar)}</strong></div>${event.location?`<div><span>Lieu</span><strong>${esc(event.location)}</strong></div>`:''}${event.description?`<p>${esc(event.description)}</p>`:''}</div><footer><button type="button" class="neos-btn neos-btn-primary" data-action="close-pop">Fermer</button>${editableCalendarEvent(event)?`<button type="button" class="neos-btn" data-action="cal-edit" data-href="${esc(calendarEventKey(event))}">${event.recurrence?'Modifier la série':'Modifier'}</button>${event.recurrence&&event.recurrenceId?`<button type="button" class="neos-btn" data-action="cal-edit" data-scope="occurrence" data-href="${esc(calendarEventKey(event))}">Modifier cette occurrence</button>`:''}`:''}${nativeModuleButton('calendar','Agenda')}</footer></section></div>`;
    animateLayerOpen(popHost,'.neos-groupware-dialog','y');
  }
  // CalDAV uses the same-origin Nextcloud session; no stored passwords or API tokens.
  const groupwareRoot=()=>`${ncWebroot()}/remote.php/dav/calendars/${encodeURIComponent(root.dataset.currentUid||'')}/`;
  function caldavHref(href){
    try { const result=new URL(String(href||''),window.location.origin);
      if(result.origin!==window.location.origin || !result.pathname.includes('/remote.php/dav/calendars/'))return '';
      return result.href;
    }catch{return '';}
  }
  // Deck exports its boards as virtual read-only VTODO calendars. Their card-X.ics
  // resources can be read via CalDAV but MUST be updated via the Deck API.
  function deckVirtualResource(href){
    try{
      const path=decodeURIComponent(new URL(String(href||''),window.location.origin).pathname);
      const match=/(?:^|\/)app-generated--deck--board-(\d+)\/(?:card-(\d+)\.ics)?$/i.exec(path);
      return match?{boardId:match[1],cardId:match[2]||null}:null;
    }catch{return null;}
  }
  function xmlChildren(node,name){return node?[...node.getElementsByTagName('*')].filter(e=>e.localName===name):[];}
  function xmlText(node,name){return xmlChildren(node,name)[0]?.textContent?.trim()||'';}
  function xmlDocument(text){const dom=new DOMParser().parseFromString(text,'application/xml');if(dom.querySelector('parsererror'))throw Error('Réponse XML CalDAV invalide');return dom;}
  function icsUnfold(raw){return String(raw||'').replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'');}
  function icsSection(raw,type){
    const text=icsUnfold(raw);const start=text.indexOf('BEGIN:'+type+'\n');const end=start<0?-1:text.indexOf('END:'+type,start);
    return start<0||end<0?'':text.slice(start+('BEGIN:'+type+'\n').length,end);
  }
  function icsProperty(section,key){const line=section.split('\n').find(s=>s.toUpperCase().startsWith(key+':')||s.toUpperCase().startsWith(key+';'))||'';return line.slice(line.indexOf(':')+1);}
  function icsUnescape(text){return String(text||'').replace(/\\[nN]/g,'\n').replace(/\\([,;\\])/g,'$1');}
  function icsEscape(text){return String(text||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
  function icsTime(value){
    const m=/^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(\d\d)?(Z)?)?/.exec(String(value||''));if(!m)return '';
    const parts=[+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0)];
    const d=m[7]?new Date(Date.UTC(...parts)):new Date(...parts);return Number.isFinite(d.getTime())?d.toISOString():'';
  }
  function icsUtc(date){const d=new Date(date);if(!Number.isFinite(d.getTime()))throw Error('Date invalide');return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
  function icsDateOnly(date){return String(date||'').replace(/-/g,'');}
  function dateInputLocal(value){if(!value)return '';const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';const two=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`;}
  function icsFold(text){
    // Enforce RFC 5545 75-octet folding without splitting Unicode code points.
    return String(text).split('\n').map(line=>{let chunk='',bytes=0,parts=[];for(const ch of line){const len=new TextEncoder().encode(ch).length;if(bytes+len>73&&chunk){parts.push(chunk);chunk=' ';bytes=1;}chunk+=ch;bytes+=len;}parts.push(chunk);return parts.join('\r\n');}).join('\r\n')+'\r\n';
  }
  function icsUpdateTodo(raw,updates){
    const lines=icsUnfold(raw).split('\n');let within=false,count=0;const seen=new Set();const next=[];
    for(const line of lines){
      if(line==='BEGIN:VTODO'){within=true;count++;next.push(line);continue;}
      if(within&&line==='END:VTODO'){
        for(const [key,value] of Object.entries(updates))if(value!==null&&!seen.has(key))next.push(`${key==='DUE'?'DUE;VALUE=DATE':key}:${value}`);
        within=false;next.push(line);continue;
      }
      if(within){const match=/^([A-Z-]+)(?:;[^:]*)?:/i.exec(line);if(match&&Object.hasOwn(updates,match[1].toUpperCase())){
        const key=match[1].toUpperCase(),value=updates[key];if(!seen.has(key)&&value!==null)next.push(`${key==='DUE'?'DUE;VALUE=DATE':key}:${value}`);
        seen.add(key);continue;
      }}
      next.push(line);
    }
    if(count!==1||within)throw Error('Tâche CalDAV complexe : édition disponible dans Tâches Nextcloud');
    return icsFold(next.join('\n').replace(/\n+$/,''));
  }
  function parseGroupwareObject(raw,type,href,etag,calendar){
    const section=icsSection(raw,type);if(!section)return null;
    const record={href,etag,raw,calendarUrl:calendar.url,calendar:calendar.name,type,uid:icsProperty(section,'UID'),title:icsUnescape(icsProperty(section,'SUMMARY'))||'Sans titre',description:icsUnescape(icsProperty(section,'DESCRIPTION'))};
    if(type==='VEVENT'){
      const starts=icsProperty(section,'DTSTART');
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
      }
      record.location=icsUnescape(icsProperty(section,'LOCATION'));
      record.recurrence=Boolean(icsProperty(section,'RRULE'));
    }else{
      const dueRaw=icsProperty(section,'DUE');
      record.dueDate=/^\d{8}$/.test(dueRaw)?`${dueRaw.slice(0,4)}-${dueRaw.slice(4,6)}-${dueRaw.slice(6,8)}`:'';
      record.due=record.dueDate?`${record.dueDate}T12:00:00`:icsTime(dueRaw);
      record.done=icsProperty(section,'STATUS').toUpperCase()==='COMPLETED'||Boolean(icsProperty(section,'COMPLETED'));
    }
    if(type==='VTODO'){
      const deck=deckVirtualResource(href);
      record.source=deck?'deck':'caldav';
      record.deckBoardId=deck?.boardId||null;
      record.deckCardId=deck?.cardId||null;
      record.writable=!deck&&!!calendar.writable;
    }
    return record;
  }
  async function caldavRequest(method,url,body='',headers={}){
    if(!caldavHref(url))throw Error('Adresse CalDAV non autorisée');
    const r=await fetch(url,{method,body:body||undefined,credentials:'same-origin',cache:'no-store',headers:{requesttoken:csrfToken(),'X-Requested-With':'XMLHttpRequest',...headers}});
    if(r.redirected&&!caldavHref(r.url))throw Error('Session Nextcloud redirigée : reconnecte-toi puis réessaie.');
    if(!r.ok){
      const err=new Error(`HTTP ${r.status} (${method} CalDAV)`);
      err.status=r.status;err.method=method;
      console.warn('[Neos] CalDAV',method,r.status,new URL(url,window.location.origin).pathname);
      throw err;
    }
    return r;
  }
  // CalDAV: the resource GET may be redirected to an HTML page or return a
  // representation that is not a VTODO. RFC 4791 calendar-multiget offers an
  // independent, read-only way to obtain the current calendar-data + ETag.
  // No PUT is allowed until we have verified both UID and server ETag.
  const xmlEscape=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function todoSnapshot(raw,etag,href,expectedUid){
    const section=icsSection(raw,'VTODO'),uid=icsProperty(section,'UID');
    if(!section||!uid)throw Error('Objet CalDAV illisible (VTODO/UID absent)');
    if(expectedUid&&uid!==expectedUid){const error=Error('Identité de la tâche modifiée : actualise la liste');error.identityMismatch=true;throw error;}
    if(!etag)throw Error('ETag absent : écriture protégée annulée');
    return {href,raw,etag,uid};
  }
  async function multigetTodo(href,expectedUid){
    const resource=caldavHref(href);
    if(!resource)throw Error('Adresse de tâche non autorisée');
    const parsed=new URL(resource),collection=resource.slice(0,resource.lastIndexOf('/')+1);
    const body=`<?xml version="1.0"?><c:calendar-multiget xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:getetag/><c:calendar-data/></d:prop><d:href>${xmlEscape(parsed.pathname)}</d:href></c:calendar-multiget>`;
    // RFC 4791, §7.9: omit Depth for calendar-multiget on a collection.
    const response=await caldavRequest('REPORT',collection,body,{'Content-Type':'application/xml; charset=utf-8','Accept':'application/xml'});
    const xml=xmlDocument(await response.text());
    const matching=xmlChildren(xml.documentElement,'response').find(entry=>{
      const candidate=caldavHref(xmlText(entry,'href'));
      return candidate&&new URL(candidate).pathname===parsed.pathname;
    });
    if(!matching)throw Error('REPORT multiget : aucune réponse pour cette tâche');
    for(const propstat of xmlChildren(matching,'propstat')){
      if(!/\b200\b/.test(xmlText(propstat,'status')))continue;
      const props=xmlChildren(propstat,'prop')[0];
      const raw=xmlText(props,'calendar-data'),etag=xmlText(props,'getetag');
      if(raw)return todoSnapshot(raw,etag,resource,expectedUid);
    }
    const statuses=xmlChildren(matching,'status').map(node=>node.textContent||'');
    if(statuses.some(status=>/\b404\b/.test(status))){const error=Error('Objet absent dans REPORT multiget (404)');error.status=404;throw error;}
    throw Error('REPORT multiget : données VTODO/ETag absentes');
  }
  // If GET fails or returns HTML, transparently try calendar-multiget.
  // A stale href is resolved by UID only if exactly one matching task exists.
  async function freshTodo(record){
    async function readAt(href){
      let getFailure;
      try{
        const response=await caldavRequest('GET',href,'',{'Accept':'text/calendar'});
        const raw=await response.text(),etag=response.headers.get('ETag');
        getFailure=Error(`GET ${response.status} : ${response.headers.get('Content-Type')||'type inconnu'}, VTODO/ETag non vérifiable`);
        return todoSnapshot(raw,etag,href,record.uid);
      }catch(error){
        if(error.identityMismatch)throw error;
        getFailure=error;
      }
      try{return await multigetTodo(href,record.uid);}catch(error){
        if(error.identityMismatch)throw error;
        const detail=`Lecture CalDAV impossible (GET : ${getFailure.message} ; REPORT multiget : ${error.message})`;
        const failure=Error(detail);
        if(error.status===404||getFailure.status===404)failure.status=404;
        throw failure;
      }
    }
    try{return await readAt(record.href);}catch(error){
      if(error.status!==404||!record.uid)throw error;
      const matches=[];
      for(const calendar of groupware.calendars.filter(c=>c.tasks).slice(0,16)){
        try{
          for(const candidate of await queryCalDav(calendar,'VTODO')){
            if(candidate.uid===record.uid&&!matches.some(x=>x.href===candidate.href))matches.push(candidate);
          }
        }catch(e){console.warn('[Neos] Recherche UID CalDAV',calendar.name,e.message);}
      }
      if(matches.length!==1)throw Error('Tâche déplacée ou introuvable : recherche par UID non concluante. Actualise Tâches. ('+error.message+')');
      return readAt(matches[0].href);
    }
  }
  async function updateExistingTodo(record,updates){
    if(record.source==='deck'||deckVirtualResource(record.href))throw Error('Ce VTODO provient de Deck : modification CalDAV interdite. Utilise l’API Deck.');
    if(record.writable===false)throw Error('Cette liste CalDAV est en lecture seule.');
    const latest=await freshTodo(record);
    try{
      await caldavRequest('PUT',latest.href,icsUpdateTodo(latest.raw,updates),{'Content-Type':'text/calendar; charset=utf-8','If-Match':latest.etag});
    }catch(error){
      if(error.status===404)throw Error('PUT CalDAV 404 : ressource disparue ou collection non modifiable. Actualise les listes ; pour Deck, utilise l’API Deck.');
      if(error.status===412)throw Error('La tâche a changé ailleurs (HTTP 412). Actualise Tâches puis réessaie.');
      throw error;
    }
    // Verify the persisted state, including removals (e.g. clearing DUE).
    try{
      const check=await freshTodo({...record,href:latest.href});
      const section=icsSection(check.raw,'VTODO');
      for(const [key,value] of Object.entries(updates)){
        if(icsProperty(section,key)!==(value??''))throw Error('Écriture non confirmée par Nextcloud : recharge la tâche et vérifie son état');
      }
    }catch(error){throw Error('Écriture envoyée mais vérification impossible : '+error.message);}
  }
  async function listCalDavCalendars(){
    const body='<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:displayname/><d:resourcetype/><d:current-user-privilege-set/><c:supported-calendar-component-set/></d:prop></d:propfind>';
    const xml=xmlDocument(await (await caldavRequest('PROPFIND',groupwareRoot(),body,{'Depth':'1','Content-Type':'application/xml; charset=utf-8'})).text());
    const calendars=[];
    for(const item of xmlChildren(xml.documentElement,'response')){
      const href=caldavHref(xmlText(item,'href'));
      const props=xmlChildren(item,'prop').find(p=>xmlChildren(p,'calendar').length)||null;
      if(!href||!props)continue;
      const supports=xmlChildren(props,'supported-calendar-component-set');
      const components=supports.length?xmlChildren(supports[0],'comp').map(e=>e.getAttribute('name')||''):['VEVENT','VTODO'];
      const privileges=xmlChildren(props,'current-user-privilege-set');
      const rights=privileges[0];
      const hasRight=name=>!rights||xmlChildren(rights,name).length>0||xmlChildren(rights,'all').length>0;
      const writable=hasRight('write-content')||hasRight('write');
      const canCreate=hasRight('bind')||hasRight('write');
      const virtual=deckVirtualResource(href.endsWith('/')?href:href+'/');
      calendars.push({url:href.endsWith('/')?href:href+'/',name:xmlText(props,'displayname')||decodeURIComponent(href.split('/').filter(Boolean).pop()||'Calendrier'),events:components.includes('VEVENT'),tasks:components.includes('VTODO'),writable:writable&&!virtual,canCreate:canCreate&&!virtual,source:virtual?'deck':'caldav'});
    }
    const included=calendars.slice(0,16);
    included.limited=calendars.length>included.length;
    return included;
  }
  async function queryCalDav(calendar,type,window=calFetchWindow()){
    const span=type==='VEVENT'?`<c:time-range start="${icsUtc(window.start)}" end="${icsUtc(window.end)}"/>`:'';
    const body=`<?xml version="1.0"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="${type}">${span}</c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`;
    const xml=xmlDocument(await (await caldavRequest('REPORT',calendar.url,body,{'Depth':'1','Content-Type':'application/xml; charset=utf-8'})).text());
    const result=[];
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
  async function loadGroupware(force=false,quiet=false){
    if(!force&&(groupware.status==='loading'||groupware.status==='ready'))return;
    const gen=++groupware.generation;groupware.status=quiet?'ready':'loading';groupware.error='';if(!quiet)render();
    try{
      if(demo){
        groupware.calendars=[{url:'demo://personal/',name:'Personnel',events:true,tasks:true,writable:true,canCreate:true,source:'caldav'}];
        groupware.events=(overview?.calendar||[]).map((e,i)=>({href:'demo-event-'+i,calendar:'Personnel',calendarUrl:'demo://personal/',title:e.title,start:e.start,end:new Date(new Date(e.start).getTime()+3600000).toISOString(),description:'',location:''}));
        groupware.tasks=(overview?.tasks||[]).map((t,i)=>({href:'demo-task-'+i,calendar:t.source==='deck'?'Deck : Projet Neos':'Personnel',calendarUrl:'demo://personal/',title:t.title,due:t.due||'',description:'',done:!!t.done,raw:'',source:t.source||'caldav',deckBoardId:t.deckBoardId||null,deckCardId:t.deckCardId||null,writable:t.source!=='deck'}));
        groupware.taskSources=1;groupware.taskSuccess=1;groupware.taskErrors=[];const range=calFetchWindow();groupware.windowStart=range.start;groupware.windowEnd=range.end;
      }else{
        const range=calFetchWindow();
        const calendars=await listCalDavCalendars();if(gen!==groupware.generation)return;
        const events=[],tasks=[],taskErrors=[],eventErrors=[];let taskSources=0,taskSuccess=0;
        for(const cal of calendars){
          if(cal.events){try{events.push(...await queryCalDav(cal,'VEVENT',range));}catch(error){eventErrors.push(cal.name);console.warn('[Neos] événements CalDAV',error);}}
          if(cal.tasks){taskSources++;try{tasks.push(...await queryCalDav(cal,'VTODO'));taskSuccess++;}catch(error){taskErrors.push({calendar:cal.name,message:String(error.message||'Erreur')});console.warn('[Neos] tâches CalDAV',error);}}
          if(gen!==groupware.generation)return;
        }
        groupware.calendars=calendars;
        groupware.events=events.filter(x=>x.start).sort((a,b)=>new Date(a.start)-new Date(b.start)).slice(0,350);
        groupware.tasks=tasks.sort((a,b)=>Number(a.done)-Number(b.done)||(a.due||'9999').localeCompare(b.due||'9999'));
        if(calendars.limited&&taskSuccess)taskErrors.push({calendar:'CalDAV',message:'seules les 16 premières listes ont été consultées'});
        groupware.taskErrors=taskErrors;groupware.taskSources=taskSources;groupware.taskSuccess=taskSuccess;
        groupware.eventErrors=eventErrors;
        groupware.windowStart=range.start;groupware.windowEnd=range.end;
      }
      groupware.status='ready';groupware.error='';if(gen===groupware.generation)render();
    }catch(error){if(gen!==groupware.generation)return;groupware.status='error';groupware.error='CalDAV indisponible ('+String(error.message||'erreur')+'). Ouvre Agenda ou Tâches pour vérifier la configuration.';console.warn('[Neos] CalDAV',error);render();}
  }
  function taskMatchesQuery(task,query){
    return matchesWords([task.title,task.description,task.calendar],query);
  }
  function matchesWords(fields,query){
    const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
    const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
    if(!terms.length)return true;
    const haystack=normalize(fields.filter(Boolean).join(' '));
    return terms.every(term=>haystack.includes(term));
  }
  function updateTaskSearch(event){
    const input=event.target;
    if(!input.matches?.('[data-task-search]')||event.isComposing)return;
    taskQuery=input.value.slice(0,180);taskVisible=TASK_PAGE_SIZE;
    const start=input.selectionStart,end=input.selectionEnd;
    render();
    const next=surface.querySelector('[data-task-search]');
    if(next){next.focus({preventScroll:true});if(start!==null&&end!==null)next.setSelectionRange(start,end);}
  }
  function taskMatchesView(task,view,now=new Date()){
    if(view==='all')return true;
    if(view==='done')return !!task.done;
    if(task.done)return false;
    if(view==='open')return true;
    const raw=task.dueDate||task.due;
    if(view==='undated')return !raw;
    if(!raw)return false;
    const dateOnly=/^\d{4}-\d{2}-\d{2}$/.test(raw);
    const due=dateOnly?new Date(raw+'T00:00:00'):new Date(raw);
    if(Number.isNaN(due.getTime()))return false;
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const day=new Date(due.getFullYear(),due.getMonth(),due.getDate());
    const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
    const limit=new Date(today);limit.setDate(limit.getDate()+8);
    return view==='today'?day.getTime()===today.getTime():view==='overdue'?day<today:view==='upcoming'?day>=tomorrow&&day<limit:false;
  }
  function groupwareModule(type){
    const calendar=type==='calendar',isReady=groupware.status==='ready';
    const records=calendar?groupware.events:groupware.tasks;
    const title=calendar?'Agenda':'Tâches';
    const taskNow=new Date();
    const taskLists=[...new Map(groupware.tasks.map(t=>[t.calendarUrl,t.calendar])).entries()].filter(([id])=>id).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
    if(!calendar&&isReady&&taskList&&!taskLists.some(([id])=>id===taskList))taskList='';
    const matchingTasks=calendar?[]:records.filter(t=>(!taskList||t.calendarUrl===taskList)&&taskMatchesQuery(t,taskQuery));
    const filteredTasks=matchingTasks.filter(t=>taskMatchesView(t,taskView,taskNow));
    const taskRows=filteredTasks.slice(0,taskVisible).map(t=>{const isDeck=t.source==='deck';const canToggle=t.writable!==false||isDeck&&!!t.deckCardId&&availableApps().has('deck');const canEdit=t.writable!==false||isDeck&&!!t.deckCardId&&availableApps().has('deck');return `<div class="neos-gw-entry ${t.done?'neos-gw-done':''}"><button type="button" class="neos-gw-check" data-action="gw-toggle-done" data-href="${esc(t.href)}" aria-label="${t.done?'Rouvrir':'Terminer'} ${esc(t.title)}" title="${isDeck?'Modifier via Deck':canToggle?'Modifier via CalDAV':'Liste en lecture seule'}" ${groupware.busy||!canToggle?'disabled':''}>${icon(t.done?'check':'plus',15)}</button><div class="neos-gw-detail"><strong>${esc(t.title)}</strong><small>${isDeck?'<span class="neos-source neos-source-deck">Deck</span> ':''}${esc(t.calendar)}${t.due?' · '+esc(fmtTime(t.due)):''}${!canToggle?' · Lecture seule':''}</small></div><button type="button" class="neos-mini-action" data-action="gw-edit-task" data-href="${esc(t.href)}" title="${isDeck?'Ouvrir dans Deck':'Modifier'}" ${groupware.busy||!canEdit?'disabled':''}>${icon(isDeck?'kanban':'settings',16)}</button></div>`;}).join('');
    const hasNative=nativeModuleAvailable(calendar?'calendar':'tasks');
    const canCreate=groupware.calendars.some(c=>c.canCreate&&(calendar?c.events:c.tasks));
    const toolbar=`<button type="button" class="neos-iconbtn" data-action="gw-refresh" title="Actualiser" aria-label="Actualiser">${icon('refresh',16)}</button><button type="button" class="neos-btn neos-btn-primary" data-action="gw-new" data-gw-type="${calendar?'event':'task'}" ${!isReady||!canCreate?'disabled':''}>${icon('plus',15)} ${calendar?'Événement':'Tâche'}</button>${nativeModuleButton(calendar?'calendar':'tasks','Ouvrir')}`;
    let content;
    if(groupware.status==='loading')content='<div class="neos-module-loader"><span class="neos-spinner"></span>Chargement CalDAV…</div>';
    else if(groupware.status==='error')content=emptyModule(groupware.error);
    else if(!groupware.calendars.length)content=emptyModule('Aucun calendrier accessible. Vérifie tes calendriers Nextcloud.');
    else if(calendar)content=calendarGrid();
    else if(groupware.taskSources===0)content=`<div class="neos-gw-info"><strong>Aucune liste de tâches CalDAV</strong><p>Ton Agenda fonctionne, mais aucun calendrier compatible VTODO n’est disponible. Crée une liste de tâches dans Nextcloud, ou active l’application Tâches si elle n’est pas installée.</p></div>`;
    else if(groupware.taskSuccess===0&&groupware.taskErrors.length)content=`<div class="neos-gw-info"><strong>Impossible de lire les listes de tâches</strong><p>${esc(groupware.taskErrors.map(e=>`${e.calendar} : ${e.message}`).join(' · '))}</p><p>L’Agenda peut continuer à fonctionner normalement. Vérifie le code HTTP de la requête REPORT CalDAV dans F12 → Réseau.</p></div>`;
    else content=`<div class="neos-task-searchbar"><label class="neos-task-search"><span class="neos-sr-only">Rechercher dans les tâches</span><input type="search" data-task-search maxlength="180" placeholder="Titre, description ou liste…" value="${esc(taskQuery)}" autocomplete="off"></label><label>Liste <select data-task-list><option value="">Toutes les listes</option>${taskLists.map(([id,name])=>`<option value="${esc(id)}" ${id===taskList?'selected':''}>${esc(name)}</option>`).join('')}</select></label>${taskQuery?'<button type="button" class="neos-btn" data-action="task-search-clear">Effacer</button>':''}</div>${taskQuery?`<p class="neos-task-search-summary" role="status">${filteredTasks.length} résultat${filteredTasks.length===1?'':'s'} dans cette vue · tâches chargées</p>`:''}<div class="neos-task-filters">${[['open','À faire'],['today','Aujourd’hui'],['overdue','En retard'],['upcoming','7 prochains jours'],['undated','Sans échéance'],['done','Terminées'],['all','Toutes']].map(([id,label])=>`<button type="button" data-action="task-view" data-view="${id}" class="${taskView===id?'is-active':''}" aria-pressed="${taskView===id}">${label} <span class="neos-task-count">${matchingTasks.filter(t=>taskMatchesView(t,id,taskNow)).length}</span></button>`).join('')}</div>${!hasNative?'<div class="neos-gw-info neos-gw-info-inline">Le module Tâches de Neos reste accessible via CalDAV. Le raccourci vers l’application Tâches native est masqué si elle n’est pas activée.</div>':''}${groupware.taskErrors.length?`<p class="neos-gw-warning">Certaines listes n’ont pas pu être chargées : ${esc(groupware.taskErrors.map(e=>`${e.calendar} (${e.message})`).join(', '))}</p>`:''}${taskRows?`<div class="neos-gw-list">${taskRows}</div>`:'<div class="neos-empty">Aucune tâche dans ce filtre.</div>'}${filteredTasks.length>taskVisible?`<p role="status">${taskVisible} sur ${filteredTasks.length} tâches</p><button type="button" class="neos-btn" data-action="tasks-more">Afficher la suite</button>`:''}`;
    if(!calendar&&isReady&&!canCreate)content=`<p class="neos-gw-warning" role="status">Création indisponible : aucune liste de tâches CalDAV n’autorise l’ajout. Les cartes Deck ne sont pas des listes de tâches modifiables.</p>${content}`;
    return `<section class="neos-module">${panelHeader(title,calendar?'Calendrier mensuel et hebdomadaire':'Tâches CalDAV synchronisées avec Nextcloud',toolbar)}<div class="neos-module-body">${content}</div></section>`;
  }
  function groupwareEditor(type,record=null,prefillDay=null,scope='series'){
    if(record?.source==='deck'){
      if(record.deckBoardId&&record.deckCardId&&availableApps().has('deck'))void openDeckFromVirtual(record);
      else toast('Carte Deck en lecture seule : ouvre Deck pour la modifier.','error');
      return;
    }
    if(record?.writable===false){toast('Liste CalDAV en lecture seule','error');return;}
    const calendar=type==='event';const candidates=groupware.calendars.filter(c=>(record?c.writable:c.canCreate)&&(calendar?c.events:c.tasks));
    if(!candidates.length){toast('Aucun calendrier autorisant les modifications','error');return;}
    const first=candidates.find(c=>c.url===record?.calendarUrl)||candidates[0];
    const now=new Date();now.setMinutes(0,0,0);now.setHours(now.getHours()+1);
    if(prefillDay){const picked=calFromKey(prefillDay);picked.setHours(now.getHours(),0,0,0);now.setTime(picked.getTime());}
    const recurring=calendar&&record?.recurrence;
    const series=recurring&&scope!=='occurrence';
    const wholeDay=recurring&&scope==='occurrence'&&/^\d{8}$/.test(record.recurrenceId);
    const master=series?recurringMaster(record.raw):null;
    const simpleSeries=series&&calendarComponents(record.raw).components.length===1&&
      ['DTSTART','DTEND'].every(key=>/^[A-Z]+:[0-9]{8}T[0-9]{6}Z$/.test(master?.properties.get(key)||''))&&
      !['RDATE','EXDATE','EXRULE'].some(key=>master.properties.has(key))&&
      /^RRULE:FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)$/.test(master.properties.get('RRULE')||'');
    const metadataOnly=(series&&!simpleSeries)||wholeDay;
    const selectedRecord=series?parseGroupwareObject(record.raw,'VEVENT',record.href,record.etag,{url:record.calendarUrl,name:record.calendar}):record;
    const start=dateInputLocal(selectedRecord?.start||now.toISOString()),end=dateInputLocal(selectedRecord?.end||new Date(now.getTime()+3600000).toISOString());
    popMode='groupware-edit';
    popHost.innerHTML=`<div class="neos-pop-layer" data-action="close-pop"><div class="neos-groupware-dialog neos-framed" role="dialog" aria-modal="true" aria-label="${calendar?(record?'Modifier l’événement':'Nouvel événement'):record?'Modifier la tâche':'Nouvelle tâche'}"><header><strong>${calendar?(record?'Modifier l’événement':'Nouvel événement'):record?'Modifier la tâche':'Nouvelle tâche'}</strong><button type="button" class="neos-iconbtn" data-action="close-pop" aria-label="Fermer">${icon('close',19)}</button></header><div class="neos-gw-form"><label>Titre<input data-gw-title maxlength="180" required value="${esc(selectedRecord?.title||'')}" placeholder="${calendar?'Rendez-vous, réunion…':'À faire…'}"></label><label>Calendrier<select data-gw-calendar ${record?'disabled':''}>${candidates.map(c=>`<option value="${esc(c.url)}" ${c.url===first.url?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>${calendar?`${recurring?'<p>'+ (series?(simpleSeries?'Les changements s’appliquent à la série.':'Modifier le titre, le lieu et la description de la série.'):'Modifier uniquement cette occurrence.')+'</p>':''}<div class="neos-gw-form-grid" ${metadataOnly?'hidden':''}><label>Début<input data-gw-start type="datetime-local" value="${esc(start)}" required></label><label>Fin<input data-gw-end type="datetime-local" value="${esc(end)}" required></label></div><label>Lieu<input data-gw-location maxlength="180" value="${esc(selectedRecord?.location||'')}" placeholder="Facultatif"></label>`:`<label>Échéance<input data-gw-due type="date" value="${esc(record?.dueDate||record?.due?.slice(0,10)||'')}"></label><label class="neos-gw-checkline"><input type="checkbox" data-gw-done ${record?.done?'checked':''}> Tâche terminée</label>`}<label>Description<textarea data-gw-description rows="4" maxlength="12000" placeholder="Détails facultatifs">${esc(selectedRecord?.description||'')}</textarea></label>${calendar&&!record?'<label>Répétition<select data-gw-repeat><option value="">Jamais</option><option value="DAILY">Chaque jour</option><option value="WEEKLY">Chaque semaine</option><option value="MONTHLY">Chaque mois</option><option value="YEARLY">Chaque année</option></select></label>':''}<p class="neos-gw-status" data-gw-error role="alert" aria-live="assertive" aria-atomic="true"></p></div><footer><span class="neos-modal-progress" data-gw-progress role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="neos-btn" data-action="close-pop">Annuler</button><button type="button" class="neos-btn neos-btn-primary" data-action="gw-save" ${groupware.busy?'disabled':''}>${icon('check',16)} Enregistrer</button></footer></div></div>`;
    popHost.dataset.gwType=type;popHost.dataset.gwRecord=record?.href||'';popHost.dataset.gwEtag=record?.etag||'';popHost.dataset.gwKey=record?calendarEventKey(record):'';popHost.dataset.gwScope=scope;popHost.dataset.gwMetadataOnly=metadataOnly?'1':'';
    popHost.querySelector('[data-gw-title]')?.focus();animateLayerOpen(popHost,'.neos-groupware-dialog','y');
  }
  function gwReadForm(){
    const get=q=>popHost.querySelector(q);const type=popHost.dataset.gwType,href=popHost.dataset.gwRecord;
    return {type,href,key:popHost.dataset.gwKey,scope:popHost.dataset.gwScope,metadataOnly:popHost.dataset.gwMetadataOnly==='1',repeat:get('[data-gw-repeat]')?.value||'',title:get('[data-gw-title]')?.value?.trim()||'',calendarUrl:get('[data-gw-calendar]')?.value||'',start:get('[data-gw-start]')?.value||'',end:get('[data-gw-end]')?.value||'',due:get('[data-gw-due]')?.value||'',location:get('[data-gw-location]')?.value?.trim()||'',description:get('[data-gw-description]')?.value?.trim()||'',done:!!get('[data-gw-done]')?.checked};
  }
  function createIcs(fields,uid){
    const stamp=icsUtc(new Date()),common=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Neos//Nextcloud Workspace//FR',`BEGIN:${fields.type==='event'?'VEVENT':'VTODO'}`,`UID:${uid}`,`DTSTAMP:${stamp}`,`SUMMARY:${icsEscape(fields.title)}`];
    if(fields.type==='event')common.push(`DTSTART:${icsUtc(new Date(fields.start))}`,`DTEND:${icsUtc(new Date(fields.end))}`,...(fields.location?[`LOCATION:${icsEscape(fields.location)}`]:[]));
    else common.push(`STATUS:${fields.done?'COMPLETED':'NEEDS-ACTION'}`,...(fields.done?[`COMPLETED:${stamp}`,'PERCENT-COMPLETE:100']:[]),...(fields.due?[`DUE;VALUE=DATE:${icsDateOnly(fields.due)}`]:[]));
    if(fields.type==='event'&&['DAILY','WEEKLY','MONTHLY','YEARLY'].includes(fields.repeat))common.push('RRULE:FREQ='+fields.repeat);
    if(fields.description)common.push(`DESCRIPTION:${icsEscape(fields.description)}`);
    common.push(`END:${fields.type==='event'?'VEVENT':'VTODO'}`,'END:VCALENDAR');return icsFold(common.join('\n'));
  }
  function updateEventIcs(record,fields){
    if(!editableCalendarEvent(record))throw Error('Cet événement doit être modifié dans Agenda.');
    const changes={SUMMARY:icsEscape(fields.title),LOCATION:fields.location?icsEscape(fields.location):null,
      DESCRIPTION:fields.description?icsEscape(fields.description):null,DTSTAMP:icsUtc(new Date())};
    if(fields.start!==dateInputLocal(record.start))changes.DTSTART=icsUtc(new Date(fields.start));
    if(fields.end!==dateInputLocal(record.end))changes.DTEND=icsUtc(new Date(fields.end));
    const updated=[],seen=new Set();
    let depth=0;
    for(const line of icsUnfold(record.raw).split('\n')){
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
    return icsFold(updated.join('\n').replace(/\n+$/,''));
  }
  function updateRecurringEventIcs(record,fields){
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
  function taskIcsUpdates(fields){return {'SUMMARY':icsEscape(fields.title),'DESCRIPTION':fields.description?icsEscape(fields.description):null,'DUE':fields.due?icsDateOnly(fields.due):null,'STATUS':fields.done?'COMPLETED':'NEEDS-ACTION','COMPLETED':fields.done?icsUtc(new Date()):null,'PERCENT-COMPLETE':fields.done?'100':null};}
  async function saveGroupware(){
    if(groupware.busy)return;
    const fields=gwReadForm();const error=popHost.querySelector('[data-gw-error]');const fail=msg=>{if(error)error.textContent=msg;};
    if(!fields.title||fields.title.length>180){fail('Indique un titre (180 caractères maximum).');return;}
    if(fields.type==='event'&&!fields.metadataOnly&&(!Number.isFinite(Date.parse(fields.start))||!Number.isFinite(Date.parse(fields.end))||new Date(fields.end)<=new Date(fields.start))){fail('La fin doit être après le début.');return;}
    const selected=groupware.calendars.find(c=>c.url===fields.calendarUrl);
    const record=(fields.type==='event'?groupware.events:groupware.tasks).find(x=>fields.type==='event'?calendarEventKey(x)===fields.key:x.href===fields.href);
    if(fields.href&&!record){fail('Cet élément n’est plus chargé. Rouvre-le avant de l’enregistrer.');return;}
    if(fields.type==='event'&&record&&!editableCalendarEvent(record)){fail('Ouvre cet événement dans Agenda pour le modifier.');return;}
    if(fields.type==='event'&&record&&record.etag!==popHost.dataset.gwEtag){fail('Cet événement a changé. Rouvre-le pour afficher sa dernière version.');return;}
    if(!record&&(!selected||!selected.canCreate||(fields.type==='event'?!selected.events:!selected.tasks))){fail('Choisis une liste autorisant la création.');return;}
    groupware.busy=true;const btn=popHost.querySelector('[data-action="gw-save"]');
    const dialog=popHost.querySelector('.neos-gw-form');
    const progress=popHost.querySelector('[data-gw-progress]');
    if(dialog)dialog.setAttribute('aria-busy','true');
    if(progress)progress.textContent='Enregistrement en cours…';
    if(btn){btn.disabled=true;btn.setAttribute('aria-disabled','true');}
    let createdHref='';
    try{
      if(demo){
        if(record&&fields.type==='event')Object.assign(record,{title:fields.title,description:fields.description,start:new Date(fields.start).toISOString(),end:new Date(fields.end).toISOString(),location:fields.location});
        else if(record)Object.assign(record,{title:fields.title,description:fields.description,due:fields.due?new Date(fields.due+'T00:00:00').toISOString():'',done:fields.done});
        else if(fields.type==='event')groupware.events.push({href:'demo-'+Date.now(),title:fields.title,start:new Date(fields.start).toISOString(),end:new Date(fields.end).toISOString(),calendar:selected.name,calendarUrl:selected.url,location:fields.location,description:fields.description});
        else groupware.tasks.unshift({href:'demo-'+Date.now(),title:fields.title,due:fields.due?new Date(fields.due+'T00:00:00').toISOString():'',done:fields.done,calendar:selected.name,calendarUrl:selected.url,description:fields.description});
      }else if(record&&fields.type==='event'){
        await caldavRequest('PUT',record.href,(record.recurrence?updateRecurringEventIcs(record,fields):updateEventIcs(record,fields)),{'Content-Type':'text/calendar; charset=utf-8','If-Match':record.etag});
      }else if(record){
        await updateExistingTodo(record,taskIcsUpdates(fields));
      }else{
        const uuid=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const href=selected.url+encodeURIComponent(uuid)+'.ics';
        await caldavRequest('PUT',href,createIcs(fields,uuid+'@neos.local'),{'Content-Type':'text/calendar; charset=utf-8','If-None-Match':'*'});
        createdHref=href;
      }
      groupware.busy=false;popMode='';popHost.replaceChildren();
      if(!demo)await loadGroupware(true);else render();
      const notReadBack=fields.type==='task'&&createdHref&&!groupware.tasks.some(task=>task.href===createdHref);
      toast(notReadBack?'Création acceptée, mais tâche non relue. Vérifie dans Tâches Nextcloud avant de réessayer.':'Enregistré dans Nextcloud',notReadBack?'info':'success');
      if(!demo)void load(true);
    }catch(e){
      groupware.busy=false;
      if(dialog)dialog.removeAttribute('aria-busy');
      if(progress)progress.textContent='';
      if(btn){btn.disabled=false;btn.removeAttribute('aria-disabled');}
      fail('Échec de l’enregistrement ('+e.message+'). Un conflit peut nécessiter une actualisation.');
    }
  }
  async function openDeckFromVirtual(record){
    const boardId=record.deckBoardId,cardId=record.deckCardId;
    try{
      await chooseWorkspace('deck');
      if(deckState.status!=='ready')await loadDeck(true);
      if(String(deckState.boardId)!==String(boardId)||deckState.status!=='ready')await loadDeckStacks(boardId);
      const stack=deckState.stacks.find(st=>(st.cards||[]).some(c=>String(c.id)===String(cardId)));
      if(!stack)throw Error('Carte introuvable dans les colonnes du tableau');
      await openDeckCard(stack.id,cardId);
    }catch(error){toast('Ouverture Deck impossible : '+error.message,'error');}
  }
  // Prefer Deck's own atomic completion routes. The REST card-update endpoint
  // requires a full payload and is rejected with HTTP 400 on some versions.
  // Never retry a failed write through CalDAV or silently change its metadata.
  async function deckNativeCompletion(cardId,wantDone){
    const action=wantDone?'done':'undone';
    const pathname=`/apps/deck/cards/${encodeURIComponent(cardId)}/${action}`;
    const generated=window.OC?.generateUrl?.(pathname);
    const target=new URL(generated||`${ncWebroot()}/index.php${pathname}`,window.location.origin);
    if(target.origin!==window.location.origin)throw Error('URL Deck externe non autorisée');
    const headers={Accept:'application/json','X-Requested-With':'XMLHttpRequest'};
    const csrf=csrfToken();if(csrf)headers.requesttoken=csrf;
    const response=await fetch(target.href,{method:'PUT',credentials:'same-origin',cache:'no-store',headers});
    if(!response.ok){
      let detail='';
      if((response.headers.get('Content-Type')||'').toLowerCase().includes('json')){
        const data=await response.json().catch(()=>null);
        const message=data?.message||data?.ocs?.meta?.message||data?.error;
        if(typeof message==='string')detail=message.slice(0,160);
      }
      throw Error(`Deck ${action} : HTTP ${response.status}${detail?' — '+detail:''}`);
    }
    return response;
  }
  async function writeDeckDone(boardId,cardId,wantDone,stackHint=null){
    if(demo){const card=(demo.deckStacks?.[boardId]||[]).flatMap(s=>s.cards||[]).find(c=>String(c.id)===String(cardId));if(!card)throw Error('Carte Deck démo introuvable');card.done=wantDone?new Date().toISOString():null;return card;}
    let stackId=stackHint;
    if(!stackId){
      const stacks=await deckRequest(`/boards/${encodeURIComponent(boardId)}/stacks`);
      const match=(Array.isArray(stacks)?stacks:[]).find(st=>(st.cards||[]).some(c=>String(c.id)===String(cardId)));
      if(!match)throw Error('Carte Deck introuvable dans le tableau. Actualise Tâches.');
      stackId=match.id;
    }
    const path=deckCardApiPath(boardId,stackId,cardId);
    const old=await deckRequest(path);
    if(String(old?.id)!==String(cardId))throw Error('Identité de la carte Deck non confirmée');
    if(!!old.done===!!wantDone)return old;
    await deckNativeCompletion(cardId,wantDone);
    // Native done() can automatically move the card to a completion column.
    // The REST GET fetches by card id, even when the stack has changed.
    const verified=await deckRequest(path);
    if(String(verified?.id)!==String(cardId)||!!verified.done!==!!wantDone){
      throw Error('Écriture Deck acceptée, mais état non confirmé : actualise Tâches / Deck.');
    }
    return verified;
  }
  async function togglePlanningDeckDone(boardId,stackId,cardId){
    if(groupware.busy)return;
    const card=planningDeck.cards.find(c=>String(c.boardId)===String(boardId)&&String(c.cardId)===String(cardId));
    if(!card)return;
    groupware.busy=true;
    try{
      await writeDeckDone(boardId,cardId,!card.done,stackId);
      card.done=!card.done;
      render();toast(card.done?'Carte Deck terminée':'Carte Deck rouverte','success');
      if(!demo){void loadPlanningDeck(true);void loadGroupware(true,true);}
    }catch(error){toast('Modification Deck impossible : '+error.message,'error');}
    finally{groupware.busy=false;render();}
  }
  async function toggleTaskDone(href){
    if(groupware.busy)return;
    const record=groupware.tasks.find(x=>x.href===href);if(!record)return;
    if(record.writable===false&&record.source!=='deck'){toast('Cette liste CalDAV est en lecture seule.','error');return;}
    if(record.source==='deck'&&!record.deckCardId){toast('Impossible d’identifier la carte Deck : ouvre-la depuis Deck.','error');return;}
    groupware.busy=true;
    try{
      if(record.source==='deck'){
        await writeDeckDone(record.deckBoardId,record.deckCardId,!record.done);
        record.done=!record.done;groupware.busy=false;render();toast(record.done?'Carte Deck terminée':'Carte Deck rouverte','success');
        if(!demo){void loadGroupware(true,true);void loadPlanningDeck(true);}
        return;
      }
      if(demo){record.done=!record.done;groupware.busy=false;render();toast(record.done?'Tâche terminée':'Tâche rouverte','success');return;}
      await updateExistingTodo(record,{'STATUS':record.done?'NEEDS-ACTION':'COMPLETED','COMPLETED':record.done?null:icsUtc(new Date()),'PERCENT-COMPLETE':record.done?null:'100'});
      record.done=!record.done;groupware.busy=false;render();toast(record.done?'Tâche terminée':'Tâche rouverte','success');
      // Refresh in the background: the completed task disappears immediately from "À faire".
      void loadGroupware(true,true);
    }catch(error){groupware.busy=false;toast('Impossible de modifier cette tâche : '+error.message,'error');void loadGroupware(true);}
  }
  function planningMatches(title,subtitle=''){
    const query=planningSearch.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
    if(!query)return true;
    return `${title||''} ${subtitle||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').includes(query);
  }
  function planningItems(){
    const start=new Date();start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+planningRange);
    const items=[];
    for(const event of groupware.events){
      const date=new Date(event.start);if(!Number.isFinite(date.getTime())||date<start||date>=end)continue;
      items.push({kind:'event',date,title:event.title,subtitle:event.calendar,href:event.href});
    }
    for(const task of groupware.tasks){
      if(task.source==='deck'||task.done||!task.due)continue;
      const date=new Date(task.due);if(!Number.isFinite(date.getTime())||date>=end)continue;
      // Include overdue tasks in the first day; never silently discard them.
      items.push({kind:'task',date:date<start?start:date,overdue:date<start,title:task.title,subtitle:task.calendar,href:task.href});
    }
    for(const card of planningDeck.cards){
      if(card.done||!card.due)continue;
      const date=new Date(card.due);if(!Number.isFinite(date.getTime())||date>=end)continue;
      items.push({kind:'deck',date:date<start?start:date,overdue:date<start,title:card.title,subtitle:card.boardTitle+' · '+card.stackTitle,boardId:card.boardId,stackId:card.stackId,cardId:card.cardId});
    }
    return items.filter(item=>planningKinds.has(item.kind)&&(!planningUrgentOnly||!!item.overdue)&&planningMatches(item.title,item.subtitle)).sort((a,b)=>a.date-b.date).slice(0,200);
  }
  function planningModule(){
    const current=new Date();current.setHours(0,0,0,0);
    const activeTasks=groupware.tasks.filter(t=>t.source!=='deck'&&!t.done);
    const undatedTasks=planningUrgentOnly?[]:activeTasks.filter(t=>!t.due&&planningMatches(t.title,t.calendar));
    const overdueTasks=activeTasks.filter(t=>t.due&&new Date(t.due)<current);
    const activeDeck=planningDeck.cards.filter(c=>!c.done);
    const undatedDeck=planningUrgentOnly?[]:activeDeck.filter(c=>!c.due&&planningMatches(c.title,c.boardTitle+' '+c.stackTitle));
    const overdueDeck=activeDeck.filter(c=>c.due&&new Date(c.due)<current);
    const counts={event:groupware.events.length,task:activeTasks.length,deck:activeDeck.length};
    const kindNames={event:'Agenda',task:'Tâche',deck:'Deck'};
    const entries=planningItems();let prev='';
    const timeline=entries.map(item=>{
      const key=calDayKey(item.date);const title=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(item.date);
      const header=key===prev?'':`<h3 class="neos-plan-day">${esc(title)}</h3>`;prev=key;
      const typeLabel=kindNames[item.kind];const action=item.kind==='event'?'plan-event':item.kind==='task'?'plan-task':'plan-deck';
      const attrs=item.kind==='deck'?`data-board-id="${esc(item.boardId)}" data-stack-id="${esc(item.stackId)}" data-card-id="${esc(item.cardId)}"`:`data-href="${esc(item.href)}"`;
      const hour=item.kind==='event'?new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(item.date):'Échéance';
      return `${header}<button type="button" class="neos-plan-item neos-plan-${item.kind}" data-action="${action}" ${attrs}><span class="neos-plan-kind">${icon(item.kind==='event'?'calendar':item.kind==='task'?'check':'kanban',18)}</span><span class="neos-plan-item-info"><strong>${esc(item.title)}</strong><small>${esc(item.subtitle||'')} · ${esc(typeLabel)}${item.overdue?' · En retard':''}</small></span><span class="neos-plan-time">${esc(hour)} ${icon('chevron',13)}</span></button>`;
    }).join('');
    const rangeButtons=[7,30,90].map(days=>`<button type="button" class="${planningRange===days?'is-active':''}" data-action="plan-range" data-days="${days}" aria-pressed="${planningRange===days}">${days} jours</button>`).join('');
    const kinds=['event','task','deck'].map(k=>`<button type="button" class="${planningKinds.has(k)?'is-active':''}" data-action="plan-kind" data-kind="${k}" aria-pressed="${planningKinds.has(k)}">${esc(kindNames[k])} <span>${counts[k]}</span></button>`).join('');
    const discovery=`<div class="neos-plan-discovery"><label class="neos-plan-search">${icon('search',17)}<input type="search" data-planning-search aria-label="Rechercher dans le Planning" maxlength="80" placeholder="Rechercher une tâche, carte ou événement…" value="${esc(planningSearch)}" autocomplete="off"></label><button type="button" class="neos-plan-urgent ${planningUrgentOnly?'is-active':''}" data-action="plan-urgent" aria-pressed="${planningUrgentOnly}">${icon('alert',16)} En retard <span>${overdueTasks.length+overdueDeck.length}</span></button>${planningSearch||planningUrgentOnly?`<button type="button" class="neos-plan-clear" data-action="plan-clear">Effacer les filtres</button>`:''}</div>`;
    const loading=groupware.status==='loading'||planningDeck.status==='loading';
    const warnings=[];
    if(groupware.status==='error')warnings.push(groupware.error);
    if(groupware.taskErrors.length)warnings.push('Certaines listes Tâches indisponibles.');
    if(groupware.eventErrors?.length)warnings.push('Agendas non chargés : '+groupware.eventErrors.join(', '));
    if(planningDeck.status==='error')warnings.push('Deck : '+planningDeck.error);
    const actions=`<button type="button" class="neos-iconbtn" title="Actualiser le planning" data-action="plan-refresh">${icon('refresh',16)}</button><button type="button" class="neos-btn neos-btn-primary" data-action="workspace" data-workspace="calendar">${icon('calendar',16)} Agenda</button>`;
    const undatedTaskRows=planningKinds.has('task')?undatedTasks.slice(0,30).map(task=>`<div class="neos-plan-undated-row"><button type="button" class="neos-gw-check" data-action="gw-toggle-done" data-href="${esc(task.href)}" aria-label="Terminer ${esc(task.title)}" ${groupware.busy||task.writable===false?'disabled':''}>${icon('plus',15)}</button><button type="button" class="neos-plan-undated-open" data-action="plan-task" data-href="${esc(task.href)}"><strong>${esc(task.title)}</strong><small>${esc(task.calendar)} · CalDAV</small>${icon('chevron',14)}</button></div>`).join(''):'';
    const undatedDeckRows=planningKinds.has('deck')?undatedDeck.slice(0,30).map(card=>`<div class="neos-plan-undated-row neos-plan-undated-deck"><button type="button" class="neos-gw-check" data-action="plan-deck-toggle" data-board-id="${esc(card.boardId)}" data-stack-id="${esc(card.stackId)}" data-card-id="${esc(card.cardId)}" aria-label="Terminer la carte ${esc(card.title)}" ${groupware.busy?'disabled':''}>${icon('plus',15)}</button><button type="button" class="neos-plan-undated-open" data-action="plan-deck" data-board-id="${esc(card.boardId)}" data-stack-id="${esc(card.stackId)}" data-card-id="${esc(card.cardId)}"><strong>${esc(card.title)}</strong><small><span class="neos-source neos-source-deck">Deck</span> ${esc(card.boardTitle)} · ${esc(card.stackTitle)}</small>${icon('chevron',14)}</button></div>`).join(''):'';
    const noDue=undatedTaskRows||undatedDeckRows?`<section class="neos-plan-undated"><header><div><strong>Sans échéance</strong><span>${(planningKinds.has('task')?undatedTasks.length:0)+(planningKinds.has('deck')?undatedDeck.length:0)} éléments à organiser</span></div><button type="button" class="neos-btn neos-btn-small" data-action="workspace" data-workspace="tasks">Voir les tâches</button></header><div class="neos-plan-undated-list">${undatedTaskRows}${undatedDeckRows}</div>${undatedTasks.length>30||undatedDeck.length>30?'<small class="neos-gw-hint">D’autres éléments sont disponibles dans Tâches ou Deck.</small>':''}</section>`:'';
    const summary=`<div class="neos-plan-summary" aria-label="État du planning"><span>${icon('check',16)} <strong>${planningKinds.has('task')?activeTasks.length:0}</strong> tâches à faire</span><span>${icon('kanban',16)} <strong>${planningKinds.has('deck')?activeDeck.length:0}</strong> cartes Deck</span><span class="${overdueTasks.length+overdueDeck.length?'is-alert':''}">${icon('alert',16)} <strong>${(planningKinds.has('task')?overdueTasks.length:0)+(planningKinds.has('deck')?overdueDeck.length:0)}</strong> en retard</span><span>${icon('clock',16)} <strong>${(planningKinds.has('task')?undatedTasks.length:0)+(planningKinds.has('deck')?undatedDeck.length:0)}</strong> sans échéance</span></div>`;
    const body=`<div class="neos-plan-container"><div class="neos-plan-toolbar"><div class="neos-calendar-views">${rangeButtons}</div><div class="neos-calendar-views">${kinds}</div></div>${discovery}${summary}${warnings.length?`<div class="neos-gw-warning">${esc(warnings.join(' '))}</div>`:''}${loading?'<p class="neos-plan-loading">Synchronisation en cours…</p>':''}${timeline?`<div class="neos-plan-timeline">${timeline}</div>`:'<div class="neos-empty">Aucun événement ni échéance datée dans cette période.</div>'}${noDue}<p class="neos-gw-hint">Données CalDAV accessibles au compte et échéances Deck de 8 tableaux maximum · événements récurrents complexes gérés dans Agenda.</p></div>`;
    return `<section class="neos-module neos-plan-module">${panelHeader('Planning','Une chronologie pour Agenda, Tâches et Deck',actions)}<div class="neos-module-body">${body}</div></section>`;
  }
  async function loadPlanningDeck(force=false){
    if(!force&&(planningDeck.status==='loading'||(planningDeck.status==='ready'&&Date.now()-planningDeck.updatedAt<300000)))return;
    if(!demo&&!availableApps().has('deck')){planningDeck.status='ready';planningDeck.cards=[];planningDeck.updatedAt=Date.now();return;}
    const gen=++planningDeck.generation;planningDeck.status='loading';planningDeck.error='';if(activeWorkspace==='planning')render();
    try{
      let raw=demo?demo.deckBoards:await deckRequest('/boards');if(raw?.ocs?.data)raw=raw.ocs.data;
      const boards=(Array.isArray(raw)?raw:[]).slice(0,8);const cards=[];
      for(const board of boards){
        let stacks=demo?(demo.deckStacks?.[board.id]||[]):await deckRequest(`/boards/${encodeURIComponent(board.id)}/stacks`);
        if(stacks?.ocs?.data)stacks=stacks.ocs.data;
        for(const stack of (Array.isArray(stacks)?stacks:[]))for(const card of (stack.cards||[])){
          cards.push({kind:'deck',title:card.title||'Sans titre',due:card.duedate||'',done:!!card.done,boardId:board.id,boardTitle:board.title||'Deck',stackId:stack.id,stackTitle:stack.title||'Colonne',cardId:card.id});
        }
        if(gen!==planningDeck.generation)return;
      }
      if(gen!==planningDeck.generation)return;
      planningDeck.cards=cards.slice(0,300);planningDeck.status='ready';planningDeck.updatedAt=Date.now();
    }catch(error){if(gen!==planningDeck.generation)return;planningDeck.status='error';planningDeck.error=error.message||'Indisponible';}
    if(activeWorkspace==='planning')render();
  }
  async function planningDeckOpen(boardId,stackId,cardId){
    await chooseWorkspace('deck');
    if(String(deckState.boardId)!==String(boardId)||deckState.status!=='ready')await loadDeckStacks(boardId);
    if(deckState.status==='ready')await openDeckCard(stackId,cardId);
  }
  // v0.6.9: read-only workspaces powered by Nextcloud APIs. These stay within
  // the same authenticated origin and never use a password, app token or iframe.
  function talkChatModule(){
    const room=integrations.talk.items.find(item=>item.token===talkChat.token);
    if(!room){talkChat.token='';return '<div class="neos-module-empty-small">Cette conversation n’est plus accessible.</div>';}
    const messages=talkChat.messages.map(message=>{
      const own=String(message.actorId||'')===String(root.dataset.currentUid||'')&&String(message.actorType||'users')==='users';
      const display=String(message.actorDisplayName||message.actorId||'Participant');
      const date=Number(message.timestamp)||0;
      const when=date?new Date(date*1000).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'';
      const body=String(message.message||message.messageText||'');
      return `<div class="neos-talk-message ${own?'is-own':''}${message.messageType==='system'?' is-system':''}"><div class="neos-talk-message-meta"><strong>${esc(display)}</strong><small>${esc(when)}</small></div><p>${esc(body||'Message système')}</p></div>`;
    }).join('');
    const older=talkChat.hasMore?`<button type="button" class="neos-btn neos-talk-older" data-action="talk-older" ${talkChat.status==='loading'?'disabled':''}>${icon('clock',15)} Messages plus anciens</button>`:'';
    const loader=talkChat.status==='loading'?'<p class="neos-integr-hint">Chargement des messages…</p>':'';
    const error=talkChat.error?`<p class="neos-talk-error" role="alert">${esc(talkChat.error)}</p>`:'';
    const syncInfo=talkChat.lastSync?` · Actualisé à ${esc(new Date(talkChat.lastSync).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))}`:'';
    const readControls=`<div class="neos-talk-read-controls"><span>${room.unreadCount>0?`${esc(room.unreadCount)} message(s) non lu(s)`:'Lecture des messages'}${syncInfo}</span><button type="button" class="neos-btn" data-action="talk-mark-read" ${talkChat.readBusy||talkChat.status==='loading'||!talkChat.messages.length?'disabled':''}>${icon('check',15)} ${talkChat.readBusy?'Confirmation…':'Marquer comme lu'}</button></div>`;
    const composer=`<form class="neos-talk-composer" data-talk-form><label for="neos-talk-message">Message</label><textarea id="neos-talk-message" data-talk-draft rows="3" maxlength="32000" placeholder="Écrire un message…" ${talkChat.busy?'disabled':''}>${esc(talkChat.draft)}</textarea><div><small>Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne</small><button type="submit" class="neos-btn neos-btn-primary" ${talkChat.busy?'disabled':''}>${icon('message',16)} ${talkChat.busy?'Envoi…':'Envoyer'}</button></div></form>`;
    return `<div class="neos-talk-chat"><div class="neos-talk-chat-head"><button type="button" class="neos-btn" data-action="talk-back">${icon('chevron',15)} Conversations</button><div><h4>${esc(room.title)}</h4><small>${esc(room.subtitle)}</small></div><button type="button" class="neos-iconbtn" data-action="talk-reload" aria-label="Actualiser les messages" title="Actualiser les messages">${icon('refresh',16)}</button></div>${error}${readControls}${older}${loader}<div class="neos-talk-messages" aria-label="Messages de la conversation">${messages||(!loader?'<p class="neos-module-empty-small">Aucun message dans cette conversation.</p>':'')}</div>${composer}<p class="neos-integr-hint">Messages texte uniquement pour cette étape. Les appels, fichiers et réactions restent disponibles dans Talk natif.</p></div>`;
  }
  function contactDetailModule(item){
    const details=[['Courriel principal',item.email],['Deuxième courriel',item.email2],['Téléphone principal',item.phone],['Deuxième téléphone',item.phone2],['Organisation',item.org],['Carnet',item.badge]].filter(([,v])=>v);
    const editable=item.href&&item.bookUrl;
    const deletePanel=contactDelete.open&&contactDelete.href===item.href?`<div class="neos-contact-delete-panel" role="group" aria-label="Confirmer la suppression du contact"><strong>${icon('alert',16)} Supprimer « ${esc(item.title)} » ?</strong><p>Cette action efface la fiche du carnet CardDAV. Vérification de la version du contact juste avant suppression. La suppression est irréversible dans Neos.</p>${contactDelete.busy?'<p role="status" aria-live="polite" aria-atomic="true">Vérification et suppression du contact en cours…</p>':''}${contactDelete.error?`<p class="neos-talk-error" role="alert">${esc(contactDelete.error)}</p>`:''}<div aria-busy="${contactDelete.busy?'true':'false'}"><button type="button" class="neos-btn" data-action="contact-delete-cancel" ${contactDelete.busy?'disabled':''}>Annuler</button><button type="button" class="neos-btn neos-btn-danger" data-action="contact-delete-confirm" ${contactDelete.busy?'disabled':''}>${icon('trash',15)} ${contactDelete.busy?'Suppression…':'Confirmer la suppression'}</button></div></div>`:'';
    return `<div class="neos-contact-detail"><button type="button" class="neos-btn" data-action="contact-back">${icon('chevron',15)} Tous les contacts</button><div class="neos-contact-identity"><span>${icon('users',28)}</span><div><h4>${esc(item.title)}</h4><small>${esc(item.badge||'CardDAV')}</small></div></div><dl>${details.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="neos-contact-actions">${editable?`<button type="button" class="neos-btn neos-btn-primary" data-action="contact-edit">${icon('edit',15)} Modifier le contact</button><button type="button" class="neos-btn neos-btn-danger" data-action="contact-delete-start">${icon('trash',15)} Supprimer</button>`:''}<a class="neos-btn" href="${safeUrl(nativePath('contacts'))}">${icon('external',15)} Contacts natif</a></div>${deletePanel}<p class="neos-integr-hint">Les modifications seront vérifiées sur le serveur. En cas de conflit, Neos n'écrase pas la fiche plus récente.</p></div>`;
  }
  function contactEditorModule(){
    const editor=contactEditor,books=integrations.contacts.meta?.books||[];
    const isNew=editor.mode==='new',fields=editor.fields;
    const input=(field,label,attrs='')=>`<label class="neos-contact-field"><span>${esc(label)}</span><input name="${field}" data-contact-field="${field}" value="${esc(fields[field]||'')}" ${attrs} ${editor.busy||editor.loading?'disabled':''}></label>`;
    const select=isNew?`<label class="neos-contact-field"><span>Carnet d'adresses</span><select name="bookUrl" data-contact-book required ${editor.busy||editor.loading?'disabled':''}>${books.map(book=>`<option value="${esc(book.url)}" ${editor.bookUrl===book.url?'selected':''}>${esc(book.name)}</option>`).join('')}</select></label>`:`<p class="neos-contact-book">${icon('users',16)} Carnet : ${esc(books.find(book=>book.url===editor.bookUrl)?.name||'Contacts')}</p>`;
    return `<div class="neos-contact-editor"><div class="neos-contact-editor-head"><button type="button" class="neos-btn" data-action="contact-cancel">${icon('chevron',15)} Retour</button><div><h4>${isNew?'Nouveau contact':'Modifier le contact'}</h4><small>CardDAV · Enregistrement sécurisé</small></div></div>${editor.error?`<p class="neos-talk-error" role="alert">${esc(editor.error)}</p>`:''}${editor.loading?'<div class="neos-module-loader"><span class="neos-spinner"></span>Lecture de la fiche sur le serveur…</div>':`<form data-contact-form class="neos-contact-form">${select}<div class="neos-contact-form-grid">${input('name','Nom complet *','required maxlength="200" autocomplete="name"')}${input('email','Courriel principal','type="email" maxlength="254" autocomplete="email"')}${input('email2','Deuxième courriel','type="email" maxlength="254" autocomplete="off"')}${input('phone','Téléphone principal','type="tel" maxlength="100" autocomplete="tel"')}${input('phone2','Deuxième téléphone','type="tel" maxlength="100" autocomplete="off"')}${input('org','Organisation','maxlength="200" autocomplete="organization"')}</div><p class="neos-integr-hint">${isNew?'Le nouveau contact est créé dans le carnet choisi.':'La version courante est vérifiée avant de modifier la fiche. Les autres propriétés vCard sont conservées.'} Si le carnet est en lecture seule, Nextcloud refusera l’écriture.</p><div class="neos-contact-form-actions"><button type="button" class="neos-btn" data-action="contact-cancel">Annuler</button><button type="submit" class="neos-btn neos-btn-primary" ${editor.busy||(editor.mode==='edit'&&!editor.etag)?'disabled':''}>${icon('check',16)} ${editor.busy?'Enregistrement…':isNew?'Créer le contact':'Enregistrer'}</button></div></form>`}</div>`;
  }
  // v0.6.15: a detached template is never added to the page. Walk only a strict
  // allow-list. Email scripts, styles, embedded media, forms, remote images,
  // tracking pixels and every event handler are discarded, never copied.
  function mailSafeHtml(raw){
    if(typeof raw!=='string'||!raw.trim())return '';
    const template=document.createElement('template');
    template.innerHTML=raw.slice(0,240000);
    const allowed=new Set(['P','BR','DIV','SPAN','B','STRONG','EM','I','U','S','DEL','SMALL','SUB','SUP','H1','H2','H3','H4','H5','H6','UL','OL','LI','BLOCKQUOTE','PRE','CODE','HR','TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','A']);
    const blocked=new Set(['SCRIPT','STYLE','SVG','MATH','IFRAME','FRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEXTAREA','SELECT','META','LINK','BASE','NOSCRIPT','TEMPLATE','VIDEO','AUDIO','SOURCE','PICTURE','IMG','CANVAS']);
    const clean=node=>{
      if(node.nodeType===3)return esc(node.nodeValue||'');
      if(node.nodeType!==1)return '';
      const tag=node.tagName;
      if(blocked.has(tag))return '';
      const children=[...node.childNodes].map(clean).join('');
      if(!allowed.has(tag))return children;
      const type=tag.toLowerCase();
      if(type==='br'||type==='hr')return `<${type}>`;
      if(type==='a'){
        const href=(node.getAttribute('href')||'').trim();
        // Only absolute http(s) and mailto. Links always open outside Neos.
        if(!/^(https?:\/\/|mailto:)/i.test(href))return children;
        try{
          const url=new URL(href);
          if(!['http:','https:','mailto:'].includes(url.protocol))return children;
        }catch{return children;}
        return `<a href="${esc(href)}" rel="noopener noreferrer" target="_blank">${children||esc(href)}</a>`;
      }
      if(type==='td'||type==='th'){
        const span=Number(node.getAttribute('colspan')||1);
        return `<${type}${Number.isInteger(span)&&span>1&&span<=8?` colspan="${span}"`:''}>${children}</${type}>`;
      }
      return `<${type}>${children}</${type}>`;
    };
    return [...template.content.childNodes].map(clean).join('');
  }
  function mailHtmlToText(html){
    const template=document.createElement('template');
    template.innerHTML=html.replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote|pre)>/ig,'$&\n').replace(/<br\s*\/?\s*>/ig,'\n');
    return (template.content.textContent||'').replace(/\n{3,}/g,'\n\n').trim().slice(0,180000);
  }
  function mailContentFromResponse(source){
    const data=source?.data&&typeof source.data==='object'&&!Array.isArray(source.data)?source.data:source;
    const plain=[data?.plainBody,data?.bodyText,data?.textBody,data?.body?.plain,data?.body?.text,data?.text,data?.body]
      .find(v=>typeof v==='string'&&v.trim())||'';
    const html=[data?.htmlBody,data?.bodyHtml,data?.htmlMessage,data?.body?.html,data?.body?.htmlBody,data?.html]
      .find(v=>typeof v==='string'&&v.trim())||'';
    // Some Mail API responses put HTML directly in the plainBody field.
    const mixed=!html&&/<\s*(?:!doctype|html|body|p|div|br|table|ul|li|a|img|span|h[1-6])(?:\s|>|\/)/i.test(plain);
    const safe=mailSafeHtml(html||(mixed?plain:''));
    const text=(mixed?'':plain).trim().slice(0,180000)||(safe?mailHtmlToText(safe):'');
    return {html:safe,body:text};
  }

  function mailRecipientAddress(value){
    if(Array.isArray(value))return mailRecipientAddress(value[0]);
    if(value&&typeof value==='object')return String(value.email||value.address||'').trim();
    const raw=String(value||'').trim();
    const angle=raw.match(/<([^<>\s]+@[^<>\s]+)>/);
    return angle?angle[1]:raw.match(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i)?.[0]||'';
  }
  function mailFormRecipients(raw){
    const parts=String(raw||'').split(/[;,\n]+/).map(part=>part.trim()).filter(Boolean);
    const entries=parts.map(part=>mailRecipientAddress(part));
    if(entries.length>30)throw Error('30 destinataires au maximum.');
    if(!entries.length)throw Error('Renseigne au moins une adresse destinataire.');
    for(const addr of entries)if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(addr)||addr.length>254)throw Error('Adresse e-mail invalide : '+addr.slice(0,80));
    return [...new Set(entries)].map(email=>({label:email,email}));
  }
  function mailComposerAccounts(){return integrations.mail.meta?.accounts||[];}
  function mailOpenComposer(mode='new'){
    const item=mode==='reply'?mailReader.item:null;
    const accounts=mailComposerAccounts();
    if(!accounts.length){toast('Aucun compte Mail disponible pour rédiger.','error');return;}
    const accountId=String(item?.accountId||accounts[0]?.id||'');
    const reuse=mode==='new'&&mailComposer.mode==='new'&&!mailComposer.status&&(mailComposer.fields.to||mailComposer.fields.subject||mailComposer.fields.body);
    mailComposer.open=true;mailComposer.mode=mode==='reply'?'reply':'new';mailComposer.returnToReader=!!item;mailComposer.copySourceNotice='';
    mailComposer.busy=false;mailComposer.error='';mailComposer.status='';mailComposer.outboxId='';mailComposer.outboxCheck=null;
    if(!reuse){mailComposer.attachments=[];mailComposer.draftId='';mailComposer.draftSavedAt=0;mailComposer.dirty=false;}
    if(!reuse)mailComposer.fields={accountId,to:item?.senderEmail||'',cc:'',subject:item?(/^re\s*:/i.test(item.title)?item.title:'Re: '+item.title):'',body:'',inReplyToMessageId:item?.rfcMessageId||''};
    render();
    surface.querySelector('[data-mail-compose-field="to"]')?.focus();
  }
  function mailCloseComposer(){
    if(mailComposer.busy||mailComposer.draftBusy)return;
    if(mailComposer.dirty&&!['sent','queued','uncertain'].includes(mailComposer.status)&&!window.confirm('Le brouillon a été modifié sans être enregistré dans Nextcloud Mail. Quitter la rédaction ?'))return;
    // Closing a composer never reuses the last server draft as a new message.
    mailComposer.fields={accountId:'',to:'',cc:'',subject:'',body:'',inReplyToMessageId:''};
    mailComposer.attachments=[];mailComposer.draftId='';mailComposer.draftSavedAt=0;
    const refreshAfterSend=mailComposer.status==='sent';
    mailComposer.open=false;mailComposer.error='';mailComposer.status='';mailComposer.copySourceNotice='';mailComposer.outboxId='';mailComposer.outboxCheck=null;mailComposer.dirty=false;
    render();
    if(refreshAfterSend&&!demo)void loadIntegration('mail',true);
  }
  // Only Native Mail holds draft bodies. Neos never stores message contents in preferences or localStorage.
  function mailComposePayload(fields,allowEmpty=false){
    if(!mailComposerAccounts().some(a=>String(a.id)===String(fields.accountId)))throw Error('Compte expéditeur indisponible.');
    const to=fields.to.trim()?mailFormRecipients(fields.to):[];
    const cc=fields.cc.trim()?mailFormRecipients(fields.cc):[];
    if(!allowEmpty&&(!to.length||!fields.subject.trim()||!fields.body.trim()))throw Error('Renseigne destinataire, objet et message avant l’envoi.');
    return {accountId:Number(fields.accountId),subject:fields.subject.trim(),bodyPlain:fields.body,bodyHtml:null,editorBody:fields.body,isHtml:false,smimeSign:false,smimeEncrypt:false,to,cc,bcc:[],attachments:mailComposer.attachments.map(({id})=>({id,type:'local'})),inReplyToMessageId:fields.inReplyToMessageId||null};
  }
  async function mailSaveDraft(){
    const c=mailComposer;
    if(!c.open||c.busy||c.draftBusy||['sent','queued','uncertain','draft-moved','draft-uncertain'].includes(c.status))return;
    let payload;
    try{payload=mailComposePayload(c.fields,true);}catch(e){c.error=String(e.message||e);render();return;}
    c.draftBusy=true;c.error='';render();
    try{
      if(demo){
        // Mirror the API's two-step workflow without contacting a real account.
        c.draftId='';c.draftSavedAt=Date.now();c.dirty=false;c.status='draft-moved';
        toast('Transfert IMAP simulé (démo)','success');return;
      }
      const existing=c.draftId;
      const endpoint=existing?`/api/drafts/${encodeURIComponent(existing)}`:'/api/drafts';
      const result=await moduleRequest(mailNative(endpoint),{method:existing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const savedId=String(result?.data?.id??result?.id??existing??'');
      if(!/^\d+$/.test(savedId))throw Error('Réponse sans identifiant de brouillon valide. Consulte Mail natif avant une autre tentative.');
      // POST /api/drafts (201) and PUT /api/drafts/{id} (202) persist to
      // Nextcloud's local draft database, NOT to the IMAP Drafts folder.
      c.draftId=savedId;c.draftSavedAt=Date.now();c.dirty=false;
      try{
        // The native Mail app transfers the local draft with this explicit route.
        // It removes the local draft ID after successful IMAP persistence.
        const moved=await moduleRequest(mailNative('/api/drafts/move/'+encodeURIComponent(savedId)),{method:'POST'});
        if(moved?.status==='error'||moved?.ocs?.meta?.status==='failure')throw Error('Réponse de transfert IMAP non confirmée.');
        c.draftId='';c.status='draft-moved';
        toast('Brouillon transféré vers le dossier IMAP','success');
      }catch(error){
        // The transfer may have succeeded despite a lost response. Lock further
        // writes to avoid silently creating duplicate IMAP drafts.
        c.status='draft-uncertain';
        c.error='Brouillon local n°'+savedId+' créé, mais transfert vers le dossier IMAP non confirmé : '+String(error.message||error)+' Vérifie Mail natif → Brouillons avant un nouvel essai. Aucun nouvel envoi n’a été effectué.';
      }
    }catch(error){
      c.error='Enregistrement local du brouillon non confirmé : '+String(error.message||error)+' Vérifie Mail natif avant de recommencer.';
    }finally{c.draftBusy=false;if(activeWorkspace==='mail')render();}
  }
  const outboxLabels={0:'En attente de traitement',1:'Dossier Envoyés non configuré',2:'Certificat de signature manquant',3:'Certificat de signature invalide',4:'Échec de signature',5:'Certificat de chiffrement manquant',6:'Certificat de chiffrement invalide',7:'Échec de chiffrement',8:'Trop de destinataires',9:'Limite d’envoi atteinte',10:'Échec du serveur SMTP',11:'Échec de copie vers Envoyés — envoi possiblement effectué',12:'Traitement terminé',13:'Erreur d’expédition non précisée'};
  function mailOutboxLabel(status){return outboxLabels[Number(status)]||'État non reconnu';}
  function mailOutboxModule(){
    const o=mailOutbox;
    const rows=o.items.map(m=>`<div class="neos-mail-outbox-row"><span class="neos-mail-outbox-indicator">${icon('mail',18)}</span><div><strong>${esc(m.subject||'(sans objet)')}</strong><small>Référence ${esc(m.id)} · Compte ${esc(m.accountId||'—')}</small><span class="neos-mail-outbox-state">${esc(mailOutboxLabel(m.status))}${m.failed?' · Échec signalé':''}</span></div><a class="neos-btn" href="${safeUrl(mailNative('/outbox/'+encodeURIComponent(m.id)))}" target="_blank" rel="noopener noreferrer">Ouvrir dans Mail</a></div>`).join('');
    return `<div class="neos-mail-outbox"><div class="neos-mail-compose-head"><div><span class="neos-integr-eyebrow">MESSAGERIE · SUIVI EN LECTURE SEULE</span><h4>Boîte d’envoi</h4><p>États renvoyés par Nextcloud Mail · Aucun renvoi automatique</p></div><button type="button" class="neos-btn" data-action="mail-outbox-close">${icon('chevron',15)} Retour</button></div><div class="neos-mail-outbox-toolbar"><button type="button" class="neos-btn neos-btn-primary" data-action="mail-outbox-refresh" ${o.status==='loading'?'disabled':''}>${icon('refresh',15)} Actualiser le suivi</button><small>Un état « en attente » ne prouve pas qu’un message sera automatiquement envoyé.</small></div>${o.error?`<p class="neos-talk-error" role="alert">${esc(o.error)}</p>`:''}${o.status==='loading'?'<p class="neos-integr-hint">Consultation de la boîte d’envoi…</p>':rows||'<div class="neos-module-empty-small">Aucun message en attente affiché par Nextcloud Mail. Cela ne remplace pas la vérification du dossier Envoyés.</div>'}<p class="neos-integr-hint">En cas de doute sur une expédition, vérifie Mail natif et le destinataire avant d’envoyer un nouveau message.</p></div>`;
  }
  async function mailLoadOutbox(){
    if(mailOutbox.status==='loading')return;
    const gen=++mailOutbox.generation;mailOutbox.status='loading';mailOutbox.error='';if(activeWorkspace==='mail')render();
    try{
      const payload=demo?{data:{messages:[{id:17,subject:'Compte rendu de réunion',accountId:1,status:1,failed:false},{id:18,subject:'Livraison du prototype',accountId:1,status:0,failed:false}]}}:await moduleRequest(mailNative('/api/outbox'));
      const raw=payload?.data?.messages??payload?.messages??[];
      if(!Array.isArray(raw))throw Error('Format inattendu de la boîte d’envoi.');
      if(gen!==mailOutbox.generation)return;
      mailOutbox.items=raw.filter(m=>/^[0-9]+$/.test(String(m?.id??''))&&Number(m?.type??0)===0).slice(0,40).map(m=>({id:String(m.id),subject:String(m.subject||''),accountId:String(m.accountId||''),status:Number(m.status??0),failed:!!m.failed}));
      mailOutbox.status='ready';
    }catch(e){if(gen!==mailOutbox.generation)return;mailOutbox.status='error';mailOutbox.error='Suivi indisponible : '+String(e.message||e);}
    finally{if(gen===mailOutbox.generation&&activeWorkspace==='mail')render();}
  }
  async function mailCheckSending(){
    const c=mailComposer,id=c.outboxId;
    if(!/^\d+$/.test(id)||c.busy||c.draftBusy)return;
    c.draftBusy=true;c.error='';render();
    try{
      const data=demo?{data:{id:Number(id),status:1,failed:false}}:await moduleRequest(mailNative('/api/outbox/'+encodeURIComponent(id)));
      const m=data?.data||data;
      c.outboxCheck={status:Number(m?.status??-1),failed:!!m?.failed};
      if(!Number.isInteger(c.outboxCheck.status)||c.outboxCheck.status<0)throw Error('Statut absent de la réponse serveur.');
    }catch(error){c.error='Vérification de la référence '+id+' impossible : '+String(error.message||error)+' Consulte les dossiers Envoyés et Boîte d’envoi dans Mail natif.';}
    finally{c.draftBusy=false;if(activeWorkspace==='mail')render();}
  }
  function mailComposerModule(){
    const c=mailComposer,f=c.fields,accounts=mailComposerAccounts();
    const options=accounts.map(account=>`<option value="${esc(String(account.id))}" ${String(account.id)===String(f.accountId)?'selected':''}>${esc(account.email||account.name||'Compte '+account.id)}</option>`).join('');
    const blocked=c.busy||c.draftBusy||['sent','uncertain','queued','draft-moved','draft-uncertain'].includes(c.status);
    const input=(id,label,type='text',attrs='')=>`<label class="neos-mail-compose-field"><span>${label}</span><input type="${type}" data-mail-compose-field="${id}" value="${esc(f[id]||'')}" ${attrs} ${blocked?'disabled':''}></label>`;
    const draftState=c.status==='draft-moved'?'<span class="neos-mail-draft-state">Brouillon transmis au dossier IMAP · Modification possible dans Mail natif</span>':c.draftId?`<span class="neos-mail-draft-state">${icon('clock',14)} Brouillon local n°${esc(c.draftId)} · transfert IMAP non confirmé</span>`:c.dirty?'<span class="neos-mail-draft-state">Modifications non enregistrées</span>':'';
    const check=c.outboxCheck?`<p class="neos-mail-compose-warning" role="status">Référence ${esc(c.outboxId)} : ${esc(mailOutboxLabel(c.outboxCheck.status))}${c.outboxCheck.failed?' · Échec signalé':''}. Aucune nouvelle tentative n'a été effectuée.</p>`:'';
    const follow=c.outboxId&&c.status!=='sent'?`<button type="button" class="neos-btn" data-action="mail-check-send" ${c.draftBusy?'disabled':''}>${icon('refresh',15)} Vérifier l’état</button>`:'';
    const attachments=c.attachments.length?'<ul class="neos-mail-attachment-list" aria-label="Pièces jointes de la copie">'+c.attachments.map(file=>'<li>'+esc(file.name)+'</li>').join('')+'</ul>':'';
    const copyNotice=c.copySourceNotice?`<p class="neos-mail-compose-warning" role="status">${esc(c.copySourceNotice)}</p>`:'';
    return `<div class="neos-mail-composer"><div class="neos-mail-compose-head"><div><span class="neos-integr-eyebrow">MESSAGERIE · NEXTCLOUD MAIL 5.13</span><h4>${c.mode==='reply'?'Répondre':'Nouveau message'}</h4><p>Éditeur texte · Transfert des brouillons vers le dossier IMAP de Nextcloud Mail</p></div><button type="button" class="neos-btn" data-action="mail-compose-close" ${c.busy||c.draftBusy?'disabled':''}>${icon('chevron',15)} Retour</button></div>${copyNotice}${attachments}${c.error?`<p class="neos-talk-error" role="alert">${esc(c.error)}</p>`:''}${c.status==='sent'?'<p class="neos-mail-compose-ok" role="status">Message expédié : l’API Mail a confirmé l’envoi.</p>':''}${c.status==='draft-moved'?'<p class="neos-mail-compose-ok" role="status">Transfert du brouillon vers le dossier IMAP accepté par Mail. Retrouve-le dans Mail natif → Brouillons pour le modifier. Aucun courriel n’a été envoyé.</p>':''}${c.status==='draft-uncertain'?'<p class="neos-mail-compose-warning" role="alert">Transfert du brouillon non confirmé. Vérifie dans Mail natif → Brouillons avant tout nouvel essai, pour éviter un doublon.</p>':''}${c.status==='queued'||c.status==='uncertain'?`<p class="neos-mail-compose-warning" role="alert">Expédition non confirmée. Vérifie la référence ${esc(c.outboxId||'—')} avant toute autre tentative. Aucun renvoi automatique.</p>`:''}${check}<form data-mail-compose-form><div class="neos-mail-compose-grid"><label class="neos-mail-compose-field"><span>De</span><select data-mail-compose-field="accountId" ${blocked||c.attachments.length?'disabled':''}>${options}</select></label>${input('to','À *','text','required maxlength="1800" autocomplete="off" placeholder="destinataire@exemple.fr"')}${input('cc','Cc','text','maxlength="1800" autocomplete="off" placeholder="facultatif"')}${input('subject','Objet *','text','required maxlength="998"')}</div><label class="neos-mail-compose-field"><span>Message (facultatif pour un brouillon)</span><textarea rows="11" data-mail-compose-field="body" maxlength="120000" placeholder="Écris ton message ici…" ${blocked?'disabled':''}>${esc(f.body)}</textarea></label><div class="neos-mail-compose-actions"><small>${icon('shield',14)} Le bouton transfère le brouillon dans le dossier IMAP, sans l'envoyer. Pour le modifier ensuite : Mail natif → Brouillons. Pas de copie dans le navigateur.</small><div class="neos-mail-compose-actions-buttons"><a class="neos-btn" href="${safeUrl(mailNative('/'))}" target="_blank" rel="noopener noreferrer">Mail natif</a>${follow}<button type="button" class="neos-btn" data-action="mail-draft-save" ${blocked?'disabled':''}>${icon('check',15)} ${c.draftBusy?'Transfert en cours…':'Enregistrer dans Brouillons'}</button><button type="submit" class="neos-btn neos-btn-primary" ${blocked?'disabled':''}>${icon('mail',16)} ${c.busy?'Envoi en cours…':'Envoyer le message'}</button></div></div>${draftState}</form></div>`;
  }
  async function mailSendComposer(){
    if(!mailComposer.open||mailComposer.busy||mailComposer.draftBusy||mailComposer.status==='queued'||mailComposer.status==='uncertain'||mailComposer.status==='sent'||mailComposer.status==='draft-moved'||mailComposer.status==='draft-uncertain')return;
    const c=mailComposer,f=c.fields;
    let recipients,cc=[];
    try{
      if(!mailComposerAccounts().some(a=>String(a.id)===String(f.accountId)))throw Error('Compte expéditeur indisponible.');
      recipients=mailFormRecipients(f.to);
      if(f.cc.trim())cc=mailFormRecipients(f.cc);
      if(!f.subject.trim())throw Error('Renseigne un objet.');
      if(!f.body.trim())throw Error('Renseigne un message.');
    }catch(err){c.error=String(err.message||err);render();return;}
    c.busy=true;c.error='';c.status='';render();
    if(demo){c.busy=false;c.status='sent';c.error='Mode démo : simulation uniquement, aucun courriel n’a été envoyé.';render();return;}
    const payload=mailComposePayload(f); // Do not consume a saved draft before the SMTP send is confirmed.
    try{
      let created;
      try{
        created=await moduleRequest(mailNative('/api/outbox'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      }catch(error){
        // Network failures may leave a queued message; refuse an automatic retry.
        c.status=/^HTTP (400|401|403|404|405|422)\b/.test(String(error.message||''))?'':'uncertain';
        c.error=`Création dans la boîte d’envoi non confirmée : ${String(error.message||error)}. ${c.status==='uncertain'?'Vérifie Mail natif avant de recommencer.':'Vérifie le format de la requête dans F12 → Réseau.'}`;
        return;
      }
      const id=String(created?.data?.id??created?.id??created?.data?.databaseId??'');
      if(!/^\d+$/.test(id)){c.status='uncertain';c.error='Réponse de création inattendue : boîte d’envoi potentiellement créée. Vérifie Mail natif.';return;}
      c.outboxId=id;c.status='queued';
      let sent;
      try{sent=await moduleRequest(mailNative('/api/outbox/'+encodeURIComponent(id)),{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});}
      catch(error){c.error=`Expédition non confirmée (référence ${id}) : ${String(error.message||error)}. Ne réessaie pas automatiquement.`;return;}
      if(sent?.status==='error'||sent?.ocs?.meta?.status==='failure'){c.error='Le serveur a signalé un échec de l’envoi ; vérifie Mail natif.';return;}
      c.status='sent';c.error='';c.dirty=false;toast('Courriel envoyé','success');
      if(c.draftId){try{await moduleRequest(mailNative('/api/drafts/'+encodeURIComponent(c.draftId)),{method:'DELETE'});c.draftId='';}catch(error){c.error='Message envoyé, mais la suppression du brouillon n’a pas été confirmée : vérifie les Brouillons dans Mail natif.';}}
    }finally{c.busy=false;if(activeWorkspace==='mail')render();}
  }
  function draftAttachments(result){
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
  function mailDraftsModule(){
    const d=mailDrafts;
    const header=`<div class="neos-mail-drafts-head"><button type="button" class="neos-btn" data-action="mail-drafts-close">${icon('chevron',15)} Retour à Réception</button><div><h4>Brouillons IMAP</h4><small>Lecture dans Neos · édition préservée dans Mail natif</small></div><button type="button" class="neos-btn" data-action="mail-drafts-refresh" ${d.status==='loading'?'disabled':''}>${icon('refresh',15)} Actualiser</button></div>`;
    const warning=`<p class="neos-integr-hint">Les brouillons sont lus depuis les dossiers IMAP du compte. Neos ne les déplace, ne les efface et ne les expédie jamais. Pour modifier l'original, utilise Mail natif.</p>`;
    if(d.selected){
      const m=d.selected;
      const body=d.loading?'<div class="neos-module-loader"><span class="neos-spinner"></span>Lecture du brouillon…</div>':d.readError?`<div class="neos-mail-read-retry"><p class="neos-talk-error" role="alert">${esc(d.readError)}</p><button type="button" class="neos-btn" data-action="mail-draft-retry">${icon('refresh',15)} Réessayer la lecture</button></div>`:d.html?`<div class="neos-mail-formatted">${d.html}</div>`:`<div class="neos-mail-plain">${esc(d.body||'Brouillon sans texte. Tu peux le reprendre pour le compléter.')}</div>`;
      return `<div class="neos-mail-drafts">${header}<div class="neos-mail-draft-detail"><button type="button" class="neos-btn" data-action="mail-draft-back">${icon('chevron',14)} Tous les brouillons</button><h4>${esc(m.title)}</h4><p>${esc(m.summary||'')}</p><p>Destinataire : ${esc(m.to||'Non indiqué')}</p>${body}${d.attachments.length?`<ul class="neos-mail-attachment-list" aria-label="Pièces jointes">${mailAttachmentRows(d.attachments,m.messageId)}</ul>`:''}${d.copyError?`<p role="alert">${esc(d.copyError)}</p>`:''}<div class="neos-mail-draft-actions"><button type="button" class="neos-btn neos-btn-primary" data-action="mail-draft-copy" ${d.loading||d.readError||d.copyBusy?'disabled':''}>${icon('edit',15)} ${d.copyBusy?'Copie des pièces jointes…':'Reprendre dans Neos (copie)'}</button><a class="neos-btn" href="${safeUrl(m.url)}" target="_blank" rel="noopener noreferrer">${icon('external',15)} Modifier l'original dans Mail natif</a></div><p class="neos-integr-hint">La reprise crée un <strong>nouveau message</strong> avec le texte et les pièces jointes. Les destinataires en copie restent à renseigner si nécessaire.</p></div>${warning}</div>`;
    }
    const selector=d.choices.length?`<label class="neos-mail-draft-selector">${icon('folder',16)} Dossier Brouillons <select data-mail-draft-folder aria-label="Dossier des brouillons IMAP"><option value="auto" ${d.selectedMailbox==='auto'?'selected':''}>Détection automatique</option>${d.choices.map(choice=>`<option value="${esc(choice.key)}" ${d.selectedMailbox===choice.key?'selected':''}>${esc(choice.label)}</option>`).join('')}</select></label>`:'';
    const rows=d.items.map((m,i)=>`<button type="button" class="neos-integr-row" data-action="mail-draft-open" data-index="${i}"><span class="neos-integr-avatar">${icon('mail',20)}</span><span class="neos-integr-item"><strong>${esc(m.title)}</strong><small>${esc(m.accountName||'Compte Mail')} · ${esc(m.summary||'Brouillon')}</small></span><span class="neos-integr-next">${icon('chevron',16)}</span></button>`).join('');
    const status=d.status==='loading'?'<div class="neos-module-loader"><span class="neos-spinner"></span>Recherche dans les dossiers Brouillons…</div>':d.error?`<p class="neos-talk-error" role="alert">${esc(d.error)}</p>`:rows?`<div class="neos-integr-list">${rows}</div>`:'<div class="neos-module-empty-small">Aucun brouillon IMAP accessible. Vérifie les dossiers par défaut dans Mail natif.</div>';
    return `<div class="neos-mail-drafts">${header}<p class="neos-integr-hint">${esc(d.note||'Brouillons enregistrés dans les dossiers IMAP des comptes connectés.')}</p>${selector}${status}${warning}</div>`;
  }
  // Discover the configured Drafts mailbox ID first. Folder names and IMAP
  // special-use flags are not stable across providers and translated accounts.
  function mailDraftMailboxId(account){
    const raw=account?.draftsMailboxId??account?.draftMailboxId??account?.draftsFolderId??account?.draftMailbox?.databaseId??account?.mailboxIds?.drafts;
    return /^\d+$/.test(String(raw??''))?String(raw):'';
  }
  function mailIsDraftFolder(box){
    const role=String(box?.specialRole||box?.specialUse||box?.role||'').toLowerCase();
    const name=String(box?.name||box?.displayName||box?.path||'').toLowerCase();
    return /draft|brouillon|entw[uü]rf|borrador|bozz|rascunh|konzept/.test(role+' '+name);
  }
  async function mailLoadDrafts(){
    const d=mailDrafts,gen=++d.generation;
    d.open=true;d.status='loading';d.error='';d.note='';d.selected=null;d.items=[];d.readError='';d.loaded=false;d.loading=false;if(activeWorkspace==='mail')render();
    try{
      if(demo){
        d.choices=[{key:'1:7',label:'Projet · Brouillons'},{key:'2:11',label:'Personnel · Brouillons'}];
        d.items=[{messageId:'101',accountId:'1',accountName:'projet@example.test',title:'Compte rendu de réunion',to:'camille@example.test',summary:'Aujourd’hui · 18:20',url:mailNative('/box/7/thread/new/101'),mailboxKey:'1:7',demoBody:'Bonjour Camille,\n\nVoici le premier brouillon.\n\nÀ bientôt.'},{messageId:'102',accountId:'2',accountName:'perso@example.test',title:'Invitation projet',to:'alex@example.test',summary:'Hier · 15:10',url:mailNative('/box/11/thread/new/102'),mailboxKey:'2:11',demoBody:'Bonjour, voici un deuxième brouillon.'},{messageId:'103',accountId:'1',accountName:'projet@example.test',title:'Brouillon vide à compléter',to:'camille@example.test',summary:'Aujourd’hui · 17:45',url:mailNative('/box/7/thread/new/103'),mailboxKey:'1:7',demoBody:''}];
        if(d.selectedMailbox!=='auto')d.items=d.items.filter(item=>item.mailboxKey===d.selectedMailbox);
        d.note='Démonstration : brouillons fictifs, aucune suppression ni expédition.';
      }else{
        // Fetch full account records: fetchMail() intentionally stores only
        // an account summary and previously discarded draftsMailboxId.
        const accounts=integrationArray(await moduleRequest(mailNative('/api/accounts')));
        if(!accounts.length)throw Error('Aucun compte Mail configuré.');
        let scanned=0,detected=0;const warnings=[],items=[],choices=[];
        for(const account of accounts.slice(0,10)){
          if(!/^\d+$/.test(String(account?.id??'')))continue;
          const accountName=String(account.email||account.name||'Compte '+account.id);
          try{
            const foldersResponse=await moduleRequest(mailNative(`/api/mailboxes?accountId=${encodeURIComponent(account.id)}`));
            const folders=mailFolders(foldersResponse?.mailboxes||foldersResponse?.data?.mailboxes||foldersResponse?.data||foldersResponse);
            scanned+=folders.length;
            const preferredId=mailDraftMailboxId(account);
            for(const box of folders){
              const id=mailMailboxId(box);
              choices.push({key:`${account.id}:${id}`,label:`${accountName} · ${String(box.displayName||box.name||'Dossier '+id)}`});
            }
            // The configured ID is authoritative, even if the mailbox list
            // does not mark it as a drafts folder or flattens it differently.
            const configured=preferredId?[folders.find(box=>mailMailboxId(box)===preferredId)||{databaseId:preferredId,name:'Brouillons configurés'}]:[];
            const inferred=folders.filter(mailIsDraftFolder);
            const candidates=d.selectedMailbox!=='auto'
              ?folders.filter(box=>`${account.id}:${mailMailboxId(box)}`===d.selectedMailbox)
              :configured.length?configured:inferred;
            const unique=[...new Map(candidates.map(box=>[mailMailboxId(box),box])).values()].slice(0,3);
            for(const box of unique){
              const boxId=mailMailboxId(box);if(!boxId)continue;
              detected++;
              const syncWarning=await mailSyncInbox(boxId);
              if(syncWarning)warnings.push(`${accountName} : ${syncWarning}`);
              const payload=await moduleRequest(mailNative(`/api/messages?mailboxId=${encodeURIComponent(boxId)}&limit=40&view=singleton`));
              const messages=mailEnvelopeList(payload);
              for(const msg of messages.slice(0,40)){
                const row=mailMessageToRow(msg,account,box);
                if(!row.messageId)continue;
                const raw=msg?.message||msg?.envelope||msg;
                row.to=Array.isArray(raw?.to)?raw.to.map(e=>mailRecipientAddress(e)).filter(Boolean).join(', '):mailRecipientAddress(raw?.to);
                row.accountName=accountName;
                row.url=mailNative(`/box/${encodeURIComponent(boxId)}/thread/new/${encodeURIComponent(row.messageId)}`);
                items.push(row);
              }
            }
            if(!unique.length&&d.selectedMailbox==='auto')warnings.push(`${accountName} : aucun dossier Brouillons reconnu automatiquement (configuré : ${preferredId||'non indiqué'}).`);
          }catch(error){warnings.push(`${accountName} : ${String(error.message||error).slice(0,125)}`);}
          if(gen!==d.generation)return;
        }
        d.choices=choices;
        if(d.selectedMailbox!=='auto'&&!choices.some(c=>c.key===d.selectedMailbox))d.selectedMailbox='auto';
        d.items=items.sort((a,b)=>b.sortTime-a.sortTime).slice(0,120);
        d.note=`${scanned} dossier(s) disponibles ; ${detected} dossier(s) consulté(s) ; ${d.items.length} brouillon(s) trouvé(s). ${warnings.length?'Diagnostics : '+warnings.join(' · '):'Si le résultat est vide, choisis ton dossier Brouillons dans le menu ci-dessous.'}`;
        if(!detected&&warnings.some(w=>/HTTP 4|HTTP 5/.test(w)))throw Error(d.note);
      }
      d.status='ready';
    }catch(error){if(gen!==d.generation)return;d.status='error';d.error=String(error.message||error);}
    if(gen===d.generation&&activeWorkspace==='mail')render();
  }
  async function mailOpenDraft(index){
    const d=mailDrafts,item=d.items[index];if(!item)return;
    const gen=++d.generation;d.selected=item;d.attachments=[];d.copiedFiles=new Map();d.copyError='';d.loading=true;d.loaded=false;d.body='';d.html='';d.readError='';render();
    try{
      const result=demo?{plainBody:item.demoBody||''}:await moduleRequest(mailNative(`/api/messages/${encodeURIComponent(item.messageId)}/body`));
      if(gen!==d.generation)return;
      const parsed=mailContentFromResponse(result);d.body=parsed.body;d.html=parsed.html;d.attachments=draftAttachments(result);d.loaded=true;
    }catch(error){if(gen!==d.generation)return;d.readError=String(error.message||error);}
    finally{if(gen===d.generation){d.loading=false;if(activeWorkspace==='mail')render();}}
  }
  function mailAttachmentRows(attachments,messageId){
    if(!/^\d+$/.test(messageId))return '';
    return attachments.map(attachment=>{
      const id=String(attachment?.id??'');
      if(!/^\d+(?:\.\d+)*$/.test(id))return '';
      const url=mailNative('/api/messages/'+encodeURIComponent(messageId)+'/attachment/'+encodeURIComponent(id));
      const name=attachment.fileName||attachment.name||'Pièce jointe';
      return '<li><a class="neos-btn" href="'+esc(url)+'" download>'+icon('download',15)+' '+esc(name)+'</a></li>';
    }).join('');
  }
  function mailReadModule(){
    const item=mailReader.item;
    if(!item)return '<div class="neos-module-empty-small">Sélectionne un message à lire.</div>';
    const back=`<button type="button" class="neos-btn" data-action="mail-back">${icon('chevron',15)} Boîte de réception</button>`;
    const native=`<a class="neos-btn" href="${safeUrl(item.url||mailNative('/'))}">${icon('external',15)} Ouvrir dans Mail</a>`;
    const state=mailReader.loading?'<div class="neos-module-loader"><span class="neos-spinner"></span>Chargement du contenu…</div>':mailReader.error?`<div class="neos-mail-read-retry"><p class="neos-talk-error" role="alert">${esc(mailReader.error)}</p><button type="button" class="neos-btn" data-action="mail-read-retry">${icon('refresh',15)} Réessayer la lecture</button></div>`:'';
    const hasHtml=Boolean(mailReader.html);
    const tabs=hasHtml?`<div class="neos-mail-view-switch" role="group" aria-label="Mode de lecture"><button type="button" data-action="mail-display" data-mode="formatted" aria-pressed="${mailReader.display==='formatted'}" class="${mailReader.display==='formatted'?'is-active':''}">Mise en forme</button><button type="button" data-action="mail-display" data-mode="plain" aria-pressed="${mailReader.display==='plain'}" class="${mailReader.display==='plain'?'is-active':''}">Texte</button></div>`:'';
    const body=mailReader.loading||mailReader.error?'':hasHtml&&mailReader.display==='formatted'?`<div class="neos-mail-formatted" aria-label="Corps du message mis en forme">${mailReader.html}</div>`:mailReader.body?`<div class="neos-mail-plain" aria-label="Corps du message en texte">${esc(mailReader.body)}</div>`:'<p class="neos-module-empty-small">Aucun contenu lisible détecté. Ouvre-le dans Mail natif.</p>';
    const index=mailReader.index;
    const nav=`<div class="neos-mail-reader-navigation"><button type="button" class="neos-btn" data-action="mail-prev" ${index<=0?'disabled':''}>${icon('chevron',14)} Précédent</button><button type="button" class="neos-btn" data-action="mail-next" ${index<0||index>=integrations.mail.items.length-1?'disabled':''}>Suivant ${icon('chevron',14)}</button></div>`;
    const attachmentRows=mailAttachmentRows(mailReader.attachments,mailReader.id);
    const attachments=mailReader.attachments.length?'<div class="neos-mail-attachments"><strong>Pièces jointes</strong>'+(attachmentRows?'<ul>'+attachmentRows+'</ul>':'<p>Ouvre Mail pour accéder aux pièces jointes.</p>')+'</div>':'';
    return `<div class="neos-mail-reader"><div class="neos-mail-reader-toolbar">${back}<div class="neos-mail-reader-navigation"><button type="button" class="neos-btn neos-btn-primary" data-action="mail-reply">${icon('mail',15)} Répondre</button>${native}</div></div><div class="neos-mail-reader-head"><span class="neos-integr-eyebrow">LECTURE MAIL · CONTENU FILTRÉ</span><h4>${esc(item.title)}</h4><div>${icon('users',16)} ${esc(item.subtitle||'Expéditeur inconnu')}</div><small>${esc(item.summary||'')}</small></div><div class="neos-mail-reader-options">${tabs}${nav}</div>${state}${body}${attachments}<p class="neos-integr-hint">HTML filtré : scripts, formulaires, images et contenus externes bloqués. Les liens s'ouvrent dans un nouvel onglet. Les réponses texte sont possibles dans Neos.</p></div>`;
  }
  async function openMailMessage(index){
    const item=integrations.mail.items[index];
    if(!item)return;
    const gen=++mailReader.generation;
    mailReader.item=item;mailReader.index=index;mailReader.id=String(item.messageId||'');mailReader.body='';mailReader.html='';mailReader.error='';mailReader.attachments=[];mailReader.loading=true;mailReader.display='formatted';render();
    try{
      let data;
      if(demo){
        data={htmlBody:item.demoHtml||'<h2>Bonjour !</h2><p>Voici les <strong>dernières informations</strong> du projet Neos.</p><p>Cette nouvelle version affiche enfin les courriels HTML sans montrer les balises brutes.</p><ul><li>Lecture mise en forme</li><li>Images distantes bloquées</li><li>Mode texte disponible</li></ul><p>À bientôt,<br>L’équipe Neos</p><img src="https://tracker.example/pixel" />',attachments:[]};
      }else if(/^\d+$/.test(mailReader.id)){
        data=await moduleRequest(mailNative(`/api/messages/${encodeURIComponent(mailReader.id)}/body`));
      }else throw Error('Identifiant de message indisponible : utilise Mail natif.');
      if(gen!==mailReader.generation)return;
      const parsed=mailContentFromResponse(data);
      mailReader.body=parsed.body;mailReader.html=parsed.html;
      mailReader.attachments=Array.isArray(data?.attachments)?data.attachments:[];
      mailReader.error='';
    }catch(error){if(gen!==mailReader.generation)return;mailReader.error=`Lecture impossible : ${String(error.message||error)}. Le message reste accessible dans Mail natif.`;}
    finally{if(gen===mailReader.generation){mailReader.loading=false;if(activeWorkspace==='mail')render();}}
  }
  function closeMailReader(){mailReader.generation++;mailReader.index=-1;mailReader.item=null;mailReader.id='';mailReader.body='';mailReader.html='';mailReader.attachments=[];mailReader.error='';mailReader.loading=false;render();}
  function integrationModule(id){
    const state=integrations[id]; const search=integrationQueries[id].trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
    // Keep the original item index during filtering (avoids repeated O(n²) indexOf
    // work when displaying large Contacts address books).
    const periodDays=activityPeriod==='7'?7:activityPeriod==='30'?30:0;
    const periodCutoff=periodDays?Date.now()-periodDays*86400000:0;
    const matching=state.items.map((item,idx)=>({item,idx})).filter(({item})=>
      (id!=='activity'||activityCategory==='all'||item.category===activityCategory)&&
      (id!=='activity'||!periodDays||(Number(item.timestamp)>0&&Number(item.timestamp)>=periodCutoff))&&
      (id!=='talk'||!talkUnreadOnly||Number(item.unreadCount)>0)&&
      (id!=='mail'||((!mailUnreadOnly||item.unread)&&(mailFolderFilter==='all'||item.folderKey===mailFolderFilter)))&&
      (id!=='contacts'||contactBookFilter==='all'||item.bookUrl===contactBookFilter)&&
      (id==='contacts'?[item.title,item.subtitle,item.summary,item.email,item.email2,item.phone,item.phone2,item.org,item.badge].join(' '):`${item.title||''} ${item.subtitle||''} ${item.summary||''}`).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').includes(search)
    );
    const description={talk:'Conversations et messages dans Neos',activity:'Historique paginé des modifications et partages',contacts:'Carnets d’adresses et fiches CardDAV',mail:'Lire, rédiger et répondre dans Neos, sans charger les images distantes'}[id];
    const outside=moduleLink(id); const extra=id==='mail'?`<button type="button" class="neos-btn" data-action="mail-drafts-open">${icon('mail',15)} Brouillons</button><button type="button" class="neos-btn" data-action="mail-outbox-open">${icon('clock',15)} Boîte d’envoi</button><button type="button" class="neos-btn neos-btn-primary" data-action="mail-compose-new">${icon('plus',16)} Rédiger</button>`:id==='contacts'?`<button type="button" class="neos-btn neos-btn-primary" data-action="contact-new" ${!(state.meta?.books||[]).length?'disabled':''}>${icon('plus',16)} Nouveau contact</button>`:'';
    const mailRefreshLocked=mailComposer.open||mailDrafts.open||mailOutbox.open||Boolean(mailReader.item);
    const refreshAction=id==='mail'?`<button type="button" class="neos-btn neos-mail-refresh" data-action="integr-refresh" data-integr-id="mail" ${state.status==='loading'||mailRefreshLocked?'disabled':''} title="${mailRefreshLocked?'Ferme la lecture ou la rédaction avant de synchroniser la réception':'Synchroniser les boîtes avec le serveur IMAP puis relire les messages'}">${icon('refresh',16)} ${state.status==='loading'?'Synchronisation…':'Synchroniser'}</button>`:`<button type="button" class="neos-iconbtn" data-action="integr-refresh" data-integr-id="${id}" title="Actualiser" aria-label="Actualiser">${icon('refresh',16)}</button>`;
    const actions=`${refreshAction}${extra}<a class="neos-btn" href="${safeUrl(outside)}">${icon('external',15)} ${esc(appName(id))} natif</a>`;
    const visibleCount=id==='mail'&&mailOutbox.open?mailOutbox.items.length:state.items.length;
    const countLabel=visibleCount===1?'élément':'éléments';
    const countAria=state.status==='ready'?`${visibleCount} ${countLabel}`:state.status==='loading'?'Synchronisation en cours':'Données Nextcloud indisponibles';
    const countCaption=state.status==='ready'?countLabel:state.status==='loading'?'Synchronisation…':'Nextcloud';
    // Le grand nombre cyan porte la valeur ; son libellé ne répète pas le nombre.
    // L'attribut aria-label conserve la quantité complète pour la lecture vocale.
    const header=`<div class="neos-integr-overview"><p>${esc(description)}</p><div class="neos-integr-count" aria-label="${esc(countAria)}"><strong>${state.status==='ready'?visibleCount:'—'}</strong><span>${esc(countCaption)}</span></div></div>`;
    let body='';
    if(state.status==='loading')body='<div class="neos-module-loader"><span class="neos-spinner"></span>Connexion à Nextcloud…</div>';
    else if(state.status==='error')body=`<div class="neos-integr-unavailable">${icon('alert',19)}<div><strong>Synchronisation indisponible</strong><p>${esc(state.error)}</p><small>Le module reste indépendant des autres applications.</small></div></div>`;
    else if(state.status==='ready'){
      if(id==='mail'&&mailComposer.open)body=mailComposerModule();
      else if(id==='mail'&&mailDrafts.open)body=mailDraftsModule();
      else if(id==='mail'&&mailOutbox.open)body=mailOutboxModule();
      else if(id==='talk'&&talkChat.token)body=talkChatModule();
      else if(id==='mail'&&mailReader.item)body=mailReadModule();
      else if(id==='contacts'&&contactEditor.open)body=contactEditorModule();
      else if(id==='contacts'&&contactDetail>=0&&state.items[contactDetail])body=contactDetailModule(state.items[contactDetail]);
      else {
        // Le total des résultats ne s'affiche que si un filtre actif le rend utile.
        // Sans filtre, il ferait doublon avec le nombre cyan du bandeau.
        const filtersActive=Boolean(search)||
          (id==='mail'&&(mailUnreadOnly||mailFolderFilter!=='all'))||
          (id==='talk'&&talkUnreadOnly)||
          (id==='contacts'&&contactBookFilter!=='all')||
          (id==='activity'&&(activityCategory!=='all'||activityPeriod!=='all'));
        const resultsStatus=filtersActive?`<span role="status" aria-live="polite">${matching.length} résultat${matching.length===1?'':'s'}</span>`:'';
        const filter=`<div class="neos-integr-toolbar"><label class="neos-integr-search">${icon('search',16)}<input type="search" data-integr-search="${id}" maxlength="90" value="${esc(integrationQueries[id])}" placeholder="Rechercher dans ${esc(appName(id))}…" aria-label="Rechercher dans ${esc(appName(id))}" aria-keyshortcuts="/"><kbd class="neos-integr-keyhint" aria-hidden="true">/</kbd></label>${resultsStatus}</div>`;
        const activityFilters=id==='activity'?`<div class="neos-activity-controls"><div class="neos-activity-filters" role="group" aria-label="Filtrer l'activité par source">${[['all','Toutes'],['files','Fichiers'],['deck','Deck'],['talk','Talk'],['other','Autres']].map(([category,label])=>`<button type="button" data-action="activity-filter" data-category="${category}" aria-pressed="${activityCategory===category}" class="${activityCategory===category?'is-active':''}">${label}</button>`).join('')}</div><label class="neos-activity-period">Période <select data-activity-period aria-label="Filtrer l'activité par période"><option value="all" ${activityPeriod==='all'?'selected':''}>Toutes les dates</option><option value="7" ${activityPeriod==='7'?'selected':''}>7 derniers jours</option><option value="30" ${activityPeriod==='30'?'selected':''}>30 derniers jours</option></select></label></div>`:'';
        const rows=matching.slice(0,id==='activity'?activityDisplayCount:id==='contacts'?contactDisplayCount:id==='mail'?mailDisplayCount:70).map(({item,idx})=>{
          const href=safeUrl(item.url||outside);
          const content=`<span class="neos-integr-avatar" style="--integr-color:${appColor(id)}">${icon(id==='talk'?'message':id==='activity'?'bolt':id==='contacts'?'users':'mail',20)}</span><span class="neos-integr-item"><strong>${esc(item.title||'Sans titre')}</strong><small>${esc(item.subtitle||'')}</small>${item.summary?`<span class="neos-integr-summary">${esc(item.summary)}</span>`:''}</span>${item.badge?`<em class="neos-integr-badge">${esc(item.badge)}</em>`:''}<span class="neos-integr-next">${icon('chevron',16)}</span>`;
          if(id==='talk'&&item.token)return `<button type="button" class="neos-integr-row" data-action="talk-open" data-token="${esc(item.token)}" title="Ouvrir la conversation">${content}</button>`;
          if(id==='contacts')return `<button type="button" class="neos-integr-row" data-action="contact-open" data-index="${idx}" title="Voir la fiche contact">${content}</button>`;
          if(id==='mail'&&item.messageId)return `<button type="button" class="neos-integr-row" data-action="mail-open" data-index="${idx}" title="Lire le message dans Neos">${content}</button>`;
          return `<a class="neos-integr-row" href="${href}" title="Ouvrir dans ${esc(appName(id))}">${content}</a>`;
        }).join('');
        const mailOptions=id==='mail'?(state.meta?.mailboxes||[]):[];
        const folderOptions=mailOptions.length?`<label class="neos-mail-folder-label">${icon('folder',15)} Boîte<select data-mail-folder aria-label="Choisir le dossier Mail"><option value="all" ${mailFolderFilter==='all'?'selected':''}>Toutes les boîtes de réception</option>${mailOptions.map(m=>`<option value="${esc(m.key)}" ${mailFolderFilter===m.key?'selected':''}>${esc(m.label)}</option>`).join('')}</select></label>`:'';
        const contactBooks=id==='contacts'?(state.meta?.books||[]):[];
        const contactFilters=id==='contacts'?`<div class="neos-contact-list-controls"><label class="neos-contact-book-picker">${icon('users',16)} Carnet d’adresses<select data-contact-book-filter aria-label="Filtrer les contacts par carnet"><option value="all" ${contactBookFilter==='all'?'selected':''}>Tous les carnets</option>${contactBooks.map(book=>`<option value="${esc(book.url)}" ${contactBookFilter===book.url?'selected':''}>${esc(book.name)}</option>`).join('')}</select></label><span role="status">${Math.min(matching.length,contactDisplayCount)} sur ${matching.length} contact${matching.length>1?'s':''} affiché${Math.min(matching.length,contactDisplayCount)>1?'s':''}</span></div>`:'';
        const talkFilters=id==='talk'?`<div class="neos-activity-filters" aria-label="Filtrer les conversations Talk"><button type="button" data-action="talk-filter" data-unread="false" class="${!talkUnreadOnly?'is-active':''}" aria-pressed="${!talkUnreadOnly}">Toutes</button><button type="button" data-action="talk-filter" data-unread="true" class="${talkUnreadOnly?'is-active':''}" aria-pressed="${talkUnreadOnly}">Non lues (${state.items.filter(m=>Number(m.unreadCount)>0).length})</button></div>`:'';
        const mailFilters=id==='mail'?`<div class="neos-mail-controls"><div class="neos-activity-filters" aria-label="Filtrer les mails"><button type="button" data-action="mail-filter" data-unread="false" class="${!mailUnreadOnly?'is-active':''}" aria-pressed="${!mailUnreadOnly}">Tous</button><button type="button" data-action="mail-filter" data-unread="true" class="${mailUnreadOnly?'is-active':''}" aria-pressed="${mailUnreadOnly}">Non lus (${state.items.filter(m=>m.unread).length})</button></div>${folderOptions}</div>`:'';
        const mailboxNotes=id==='mail'?(state.meta?.warnings||[]):[];
        body=filter+activityFilters+talkFilters+mailFilters+contactFilters+(id==='activity'?`<p class="neos-activity-progress" role="status" aria-live="polite">${Math.min(activityDisplayCount,matching.length)} sur ${matching.length} activité${matching.length>1?'s':''} affichée${Math.min(activityDisplayCount,matching.length)>1?'s':''} · ${state.items.length} chargée${state.items.length>1?'s':''} depuis Nextcloud${activityPeriod!=='all'?' · filtre temporel appliqué aux activités chargées':''}</p>`:'')+(rows?`<div class="neos-integr-list" ${id==='activity'&&state.meta?.loading?'aria-busy="true"':''}>${rows}</div>`:`<div class="neos-module-empty-small">${search||(id==='mail'&&(mailUnreadOnly||mailFolderFilter!=='all'))||(id==='talk'&&talkUnreadOnly)?'Aucun élément ne correspond aux filtres.':id==='mail'?'Aucun message synchronisé dans les boîtes accessibles.':id==='contacts'?'Aucun contact accessible.':'Aucune activité à afficher.'}</div>`);
        if(mailboxNotes.length)body+=`<div class="neos-mail-warnings" role="status"><strong>${icon('alert',15)} Diagnostic Mail</strong>${mailboxNotes.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
        if(id==='contacts'&&matching.length>contactDisplayCount)body+=`<button type="button" class="neos-btn neos-contact-more" data-action="contacts-more" aria-label="Afficher davantage de contacts">${icon('plus',15)} Afficher ${Math.min(CONTACT_PAGE_SIZE,matching.length-contactDisplayCount)} contacts de plus <small>(${contactDisplayCount} / ${matching.length})</small></button>`;
        if(id==='activity'&&(matching.length>activityDisplayCount||state.meta?.hasNext)){
          const localRemaining=matching.length-activityDisplayCount;
          body+=`<button type="button" class="neos-btn neos-activity-more" data-action="activity-older" aria-label="${localRemaining>0?'Afficher davantage d’activités':'Charger les activités précédentes depuis Nextcloud'}" ${state.meta.loading?'disabled':''}>${icon(localRemaining>0?'plus':'refresh',15)} ${state.meta.loading?'Chargement…':localRemaining>0?`Voir ${Math.min(ACTIVITY_PAGE_SIZE,localRemaining)} activités de plus`:'Voir les activités plus anciennes'} <small>${localRemaining>0?`(${Math.min(activityDisplayCount,matching.length)} / ${matching.length})`:'depuis Nextcloud'}</small></button>`;
        }
        if(id==='mail'){
          const hasOlder=(state.meta?.mailboxes||[]).some(box=>box.cursor&&(mailFolderFilter==='all'||box.key===mailFolderFilter));
          if(matching.length>mailDisplayCount||hasOlder)body+='<button type="button" class="neos-btn" data-action="mail-older" '+(mailHistoryLoading?'disabled':'')+'>'+(mailHistoryLoading?'Chargement…':'Afficher plus de messages')+'</button>';
          if(mailHistoryError)body+='<p role="alert">'+esc(mailHistoryError)+'</p>';
        }
        if(id==='activity'&&state.meta?.error)body+=`<p class="neos-talk-error" role="alert">${esc(state.meta.error)}</p>`;
        if(id==='mail'&&state.meta?.syncedAt)body+=`<p class="neos-mail-sync-stamp" role="status">${icon('refresh',14)} Synchronisation demandée à ${esc(new Date(state.meta.syncedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))} · ${mailDisplayCount>70?'Synchronise pour revenir aux messages récents.':'Actualisation automatique toutes les 90 s.'}</p>`;
        if(state.meta?.note)body+=`<p class="neos-integr-hint">${esc(state.meta.note)}</p>`;
      }
    }else body=emptyModule('Ouvre cet espace pour charger ses données.');
    return `<section class="neos-module neos-integr-module neos-integr-${id}">${panelHeader(appName(id),'',actions)}<div class="neos-module-body">${header}${body}</div></section>`;
  }
  function liteModule(id){
    if(id==='calendar')return groupwareModule('calendar');
    if(id==='tasks')return groupwareModule('tasks');
    if(id==='planning')return planningModule();
    if(integrations[id])return integrationModule(id);
    return `<section class="neos-module">${panelHeader(appName(id),'Application externe',`<a class="neos-btn neos-btn-primary" href="${safeUrl(moduleLink(id))}">${icon('external',16)} Ouvrir ${esc(appName(id))}</a>`)}<div class="neos-module-body">${emptyModule('Module natif non intégré dans cette version.')}</div></section>`;
  }
  function currentModule(){switch(activeWorkspace){case 'photos':return photoModule();case 'notes':return noteModule();case 'deck':return deckModule();default:return liteModule(activeWorkspace);}}
  const integratedIds=new Set(['talk','activity','contacts','mail']);
  const mailNative=path=>window.OC?.generateUrl?.('/apps/mail'+path)||`${ncWebroot()}/index.php/apps/mail${path}`;
  function nativePath(id,path=''){
    const endpoint=id==='talk'?'/apps/spreed/':id==='activity'?'/apps/activity/':id==='contacts'?'/apps/contacts/':'/apps/mail/';
    return window.OC?.generateUrl?.(endpoint+path)||`${ncWebroot()}/index.php${endpoint}${path}`;
  }
  function integrationArray(result){if(Array.isArray(result))return result;return Array.isArray(result?.items)?result.items:Array.isArray(result?.data)?result.data:Array.isArray(result?.accounts)?result.accounts:Array.isArray(result?.messages)?result.messages:[];}
  async function ocsIntegrationGet(path){
    const response=await fetch(`${ncWebroot()}/ocs/v2.php/${path}`,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json','OCS-APIRequest':'true','X-Requested-With':'XMLHttpRequest'}});
    if(response.status===204)return [];
    if(!response.ok)throw Error('OCS HTTP '+response.status);
    const json=await response.json();
    const status=Number(json?.ocs?.meta?.statuscode||100);
    if(status!==100&&status!==200)throw Error(`OCS ${status} : ${json?.ocs?.meta?.message||'réponse inattendue'}`);
    return json?.ocs?.data??json;
  }
  async function ocsIntegrationRequest(path,options={}){
    const token=csrfToken();
    const headers={Accept:'application/json','OCS-APIRequest':'true','X-Requested-With':'XMLHttpRequest',...(token?{requesttoken:token}:{}),...(options.headers||{})};
    const response=await fetch(`${ncWebroot()}/ocs/v2.php/${path}`,{credentials:'same-origin',cache:'no-store',...options,headers});
    if(response.status===204||response.status===304)return {data:[],headers:response.headers,code:response.status};
    let json=null;
    try{json=await response.json();}catch{if(!response.ok)throw Error('HTTP '+response.status);throw Error('Réponse OCS non JSON');}
    const code=Number(json?.ocs?.meta?.statuscode??100);
    if(!response.ok||![100,200,201].includes(code))throw Error(`HTTP ${response.status} · ${String(json?.ocs?.meta?.message||json?.message||'Erreur OCS').slice(0,160)}`);
    return {data:json?.ocs?.data??json,headers:response.headers,code:response.status};
  }
  // Rerenders should not jump to the top or drop keyboard focus while Talk
  // refreshes. Older-page inserts keep the same message in view; live updates
  // follow the bottom only when the user was already near the bottom.
  function renderTalkPreservingPosition(older=false){
    if(activeWorkspace!=='talk'||!talkChat.token)return;
    const before=surface.querySelector('.neos-talk-messages');
    const oldHeight=before?.scrollHeight||0,oldTop=before?.scrollTop||0;
    const nearBottom=!before||oldHeight-before.clientHeight-oldTop<72;
    const draft=surface.querySelector('[data-talk-draft]');
    const focused=draft&&document.activeElement===draft;
    const selection=focused?{start:draft.selectionStart,end:draft.selectionEnd}:null;
    render();
    const after=surface.querySelector('.neos-talk-messages');
    if(after)after.scrollTop=older?oldTop+Math.max(0,after.scrollHeight-oldHeight):nearBottom?after.scrollHeight:oldTop;
    if(focused){
      const next=surface.querySelector('[data-talk-draft]');
      if(next&&!next.disabled){
        next.focus({preventScroll:true});
        try{next.setSelectionRange(selection.start,selection.end);}catch{/* Input may have changed */}
      }
    }
  }
  const talkChatPath=token=>`apps/spreed/api/v1/chat/${encodeURIComponent(token)}`;
  async function loadTalkChat(older=false,silent=false){
    const token=talkChat.token;
    if(!token||!integrations.talk.items.some(item=>item.token===token)||talkChat.busy)return;
    const gen=++talkChat.generation;
    if(!silent){talkChat.status='loading';talkChat.error='';renderTalkPreservingPosition();}
    try{
      const offset=older&&talkChat.cursor>0?`&lastKnownMessageId=${talkChat.cursor}`:'';
      const result=demo?{data:older?[]:[
        {id:101,actorType:'users',actorId:'camille',actorDisplayName:'Camille Bernard',timestamp:1762852200,message:'Bonjour ! La revue des cartes Deck est terminée.'},
        {id:102,actorType:'users',actorId:'morgan',actorDisplayName:'Morgan Petit',timestamp:1762853100,message:'Parfait, on peut vérifier le Planning dans Neos.'},
        {id:103,actorType:'users',actorId:'demo',actorDisplayName:'Moi',timestamp:1762854000,message:'Je m’en occupe, merci !'}],headers:new Headers()}:await ocsIntegrationRequest(talkChatPath(token)+`?lookIntoFuture=0&limit=30&setReadMarker=0&markNotificationsAsRead=0${offset}`);
      if(gen!==talkChat.generation||talkChat.token!==token)return;
      const received=integrationArray(result.data).filter(m=>m&&Number(m.id)>0);
      const seen=new Map(talkChat.messages.map(m=>[Number(m.id),m]));
      for(const m of received)seen.set(Number(m.id),m);
      talkChat.messages=[...seen.values()].sort((a,b)=>Number(a.id)-Number(b.id));
      const headerCursor=Number(result.headers.get('X-Chat-Last-Given'));
      const minId=received.length?Math.min(...received.map(m=>Number(m.id))):0;
      const previousCursor=talkChat.cursor;
      // The pagination cursor refers to the oldest loaded page, NOT the latest
      // refresh. Advancing it on a silent poll would skip older Talk messages.
      if(older||!previousCursor)talkChat.cursor=Number.isInteger(headerCursor)&&headerCursor>0?headerCursor:(minId||previousCursor);
      if(older||!previousCursor)talkChat.hasMore=!demo&&received.length>=30&&(!older||talkChat.cursor!==previousCursor);
      talkChat.status='ready';talkChat.error='';talkChat.lastSync=Date.now();
    }catch(error){
      if(gen!==talkChat.generation)return;
      // Network hiccups during background polling must not hide the readable
      // history or permanently disable polling on the next interval.
      if(silent&&talkChat.messages.length){talkChat.status='ready';talkChat.error='Actualisation temporairement indisponible : '+String(error.message||error);}
      else {talkChat.status='error';talkChat.error=String(error.message||error);}
    }
    if(gen===talkChat.generation)renderTalkPreservingPosition(older);
  }
  async function markTalkChatRead(){
    const token=talkChat.token;
    if(!token||talkChat.readBusy||talkChat.status==='loading')return;
    const room=integrations.talk.items.find(item=>item.token===token);
    if(!room)return;
    const lastId=Math.max(0,...talkChat.messages.map(m=>Number(m.id)||0));
    if(!lastId){talkChat.error='Impossible de confirmer la lecture : aucun identifiant de message valide.';render();return;}
    talkChat.readBusy=true;talkChat.error='';render();
    try{
      if(!demo){
        await ocsIntegrationRequest(talkChatPath(token)+'/read',{
          method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
          body:new URLSearchParams({lastReadMessage:String(lastId)}).toString()
        });
      }
      // Update the badge locally only after the server confirmed the read marker.
      if(talkChat.token===token){
        room.unreadCount=0;room.badge='';room.subtitle=String(room.subtitle||'').replace(/^\d+(?: messages?)? non lu(?:s|\(s\))? · /,'Lu · ');
        toast('Conversation marquée comme lue','success');
      }
      // Re-fetch server truth without leaving the conversation.
      if(!demo)void loadIntegration('talk',true);
    }catch(error){if(talkChat.token===token)talkChat.error='Lecture non confirmée : '+String(error.message||error);}
    finally{talkChat.readBusy=false;if(activeWorkspace==='talk'&&talkChat.token===token)render();}
  }
  async function sendTalkMessage(){
    const token=talkChat.token, message=talkChat.draft.trim();
    if(!token||talkChat.busy||!message||!integrations.talk.items.some(item=>item.token===token))return;
    if(message.length>32000){toast('Message trop long','error');return;}
    talkChat.busy=true;talkChat.error='';if(activeWorkspace==='talk')render();
    try{
      if(demo){talkChat.messages.push({id:Date.now(),actorId:'demo',actorType:'users',actorDisplayName:'Moi',timestamp:Math.floor(Date.now()/1000),message});}
      else{
        const result=await ocsIntegrationRequest(talkChatPath(token),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:new URLSearchParams({message}).toString()});
        const posted=result.data;
        if(posted&&Number(posted.id)>0){talkChat.messages=[...talkChat.messages.filter(m=>Number(m.id)!==Number(posted.id)),posted].sort((a,b)=>Number(a.id)-Number(b.id));}
        else {talkChat.busy=false;talkChat.draft='';await loadTalkChat(false);toast('Message envoyé','success');return;}
      }
      talkChat.draft='';toast('Message envoyé','success');
    }catch(error){talkChat.error='Envoi impossible : '+String(error.message||error);}
    finally{talkChat.busy=false;if(activeWorkspace==='talk'&&talkChat.token===token)render();}
  }
  function activityItem(a){
    const id=Number(a.activity_id)||0;
    const timestamp=a.datetime?Date.parse(String(a.datetime)):NaN;
    return {id,key:id>0?'id:'+id:'fallback:'+String(a.datetime||'')+':'+String(a.subject||a.message||''),timestamp:Number.isFinite(timestamp)?timestamp:0,title:a.subject||a.message||'Activité',category:/^(files|dav|files_sharing|files_versions|comments)$/.test(String(a.app||''))?'files':String(a.app||'')==='deck'?'deck':String(a.app||'')==='spreed'?'talk':'other',subtitle:`${a.app||'Nextcloud'} · ${a.datetime?new Date(a.datetime).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''}`,summary:a.message&&a.message!==a.subject?a.message:'',url:(()=>{try{const u=new URL(a.link||'',window.location.origin);return u.origin===window.location.origin?u.pathname+u.search:nativePath('activity');}catch{return nativePath('activity');}})()};
  }
  function activityNextCursor(linkHeader){
    // Nextcloud Activity v2 uses Link: <...since=123>; rel="next".
    // Never fetch the URL from this header: only extract the numeric since ID
    // and construct our own same-origin OCS URL below.
    for(const part of String(linkHeader||'').split(/,(?=\s*<)/)){
      const match=part.match(/<([^>]+)>\s*;[^,]*\brel\s*=\s*["']?next["']?/i);
      if(!match)continue;
      try{
        const next=new URL(match[1],window.location.href.startsWith('http')?window.location.href:'https://nextcloud.invalid/');
        // Reverse proxies may advertise another public hostname: only the
        // documented endpoint path and numeric cursor are used, never the URL.
        if(!next.pathname.includes('/apps/activity/api/v2/activity'))continue;
        const n=Number(next.searchParams.get('since'));
        if(Number.isSafeInteger(n)&&n>0)return n;
      }catch{/* Ignore invalid response links */}
    }
    return 0;
  }
  async function activityPage(since=0){
    const url=`apps/activity/api/v2/activity?limit=30&sort=desc${since?'&since='+encodeURIComponent(since):''}`;
    const response=await ocsIntegrationRequest(url);
    const acts=integrationArray(response.data);
    const link=response.headers?.get('Link')||'';
    const linkedCursor=activityNextCursor(link);
    const rawHeader=Number(response.headers?.get('X-Activity-Last-Given'));
    const headerCursor=Number.isSafeInteger(rawHeader)&&rawHeader>0?rawHeader:0;
    const lastId=acts.length?Number(acts[acts.length-1].activity_id)||0:0;
    const cursor=linkedCursor||headerCursor||lastId;
    // A grouped page can contain fewer than the requested 30 items despite
    // there being older events. The old "acts.length >= 30" check truncated
    // history. Follow rel=next; without Link, allow a guarded cursor probe.
    const hasNext=!!linkedCursor||(!link&&acts.length>0&&cursor>0&&cursor!==since);
    return {items:acts.map(activityItem),cursor,hasNext};
  }
  async function loadOlderActivities(){
    const state=integrations.activity,meta=state.meta||{};
    if(!meta.hasNext||meta.loading||state.status!=='ready')return;
    const generation=state.generation,previousCursor=meta.cursor;
    if(state.items.length>=ACTIVITY_MAX_ITEMS){meta.hasNext=false;meta.error='Limite de 300 activités chargées atteinte. Pour consulter le reste, ouvre Activité natif.';render();return;}
    meta.loading=true;meta.error='';render();
    try{
      const page=demo?{items:[{id:11,key:'id:11',title:'Nouvelle tâche terminée',category:'other',subtitle:'Tâches · jeudi',summary:'Préparation de la livraison Neos',url:nativePath('activity'),timestamp:Date.now()-86400000},{id:10,key:'id:10',title:'Salon de discussion mis à jour',category:'talk',subtitle:'Talk · mercredi',summary:'Équipe projet Neos',url:nativePath('activity'),timestamp:Date.now()-172800000},{id:9,key:'id:9',title:'Un contact a été ajouté',category:'other',subtitle:'Contacts · mardi',summary:'Carnet Équipe',url:nativePath('activity'),timestamp:Date.now()-259200000}],cursor:0,hasNext:false}:await activityPage(previousCursor);
      // Ignore a late response from an obsolete refresh or workspace generation.
      if(state.status!=='ready'||state.generation!==generation||state.meta!==meta)return;
      const existing=new Set(state.items.map(i=>i.key||('id:'+i.id)));
      const additional=page.items.filter(i=>{const key=i.key||('id:'+i.id);if(existing.has(key))return false;existing.add(key);return true;});
      const remaining=Math.max(0,ACTIVITY_MAX_ITEMS-state.items.length);
      state.items.push(...additional.slice(0,remaining));
      const stoppedByLimit=additional.length>=remaining;
      const seen=meta.seenCursors||[];
      const repeatedCursor=page.cursor===previousCursor||seen.includes(page.cursor);
      meta.seenCursors=[...seen,previousCursor].filter(v=>Number.isSafeInteger(v)&&v>0).slice(-24);
      meta.stalledPages=additional.length?0:(meta.stalledPages||0)+1;
      meta.hasNext=!stoppedByLimit&&page.hasNext&&!repeatedCursor&&meta.stalledPages<3;
      meta.cursor=page.cursor;
      if(stoppedByLimit)meta.error='Limite de 300 activités chargées atteinte. Pour consulter le reste, ouvre Activité natif.';
      else if(repeatedCursor&&page.items.length)meta.error='Le serveur a répété le même curseur. Pagination arrêtée pour éviter une boucle.';
      else if(meta.stalledPages>=3)meta.error='Plusieurs pages identiques reçues. Pagination arrêtée pour éviter une boucle.';
      // Immediately reveal a new batch after a server request: no second click needed.
      if(additional.length)activityDisplayCount+=ACTIVITY_PAGE_SIZE;
    }catch(error){if(state.generation===generation&&state.meta===meta)meta.error='Impossible de charger la suite : '+String(error.message||error);}
    finally{if(state.generation===generation&&state.meta===meta){meta.loading=false;if(activeWorkspace==='activity'){render();(surface.querySelector('[data-action="activity-older"]')||surface.querySelector('[data-integr-search="activity"]'))?.focus({preventScroll:true});}}}
  }
  // CardDAV URLs must remain within the signed-in user's addressbook tree.
  const contactRoot=()=>`${ncWebroot()}/remote.php/dav/addressbooks/users/${encodeURIComponent(String(root.dataset.currentUid||''))}/`;
  function contactSafeUrl(raw,bookUrl=''){
    try{
      const url=new URL(raw,window.location.origin);
      const rootUrl=new URL(contactRoot(),window.location.origin);
      if(url.origin!==window.location.origin||!url.pathname.startsWith(rootUrl.pathname)||url.username||url.password||url.search||url.hash)throw Error('URL CardDAV externe ou invalide');
      if(bookUrl&&!url.pathname.startsWith(new URL(bookUrl,window.location.origin).pathname))throw Error('Contact hors du carnet');
      return url.href;
    }catch{throw Error('URL CardDAV non autorisée');}
  }
  function contactUnfold(value){return String(value||'').replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'');}
  function contactProp(raw,key){
    const line=contactUnfold(raw).split('\n').find(line=>new RegExp('^(?:[A-Za-z0-9-]+\\.)?'+key+'(?:;[^:]*)?:','i').test(line))||'';
    return line?icsUnescape(line.slice(line.indexOf(':')+1)):'';
  }
  function contactProps(raw,key){
    const rx=new RegExp('^(?:[A-Za-z0-9-]+\\.)?'+key+'(?:;[^:]*)?:','i');
    return contactUnfold(raw).split('\n').filter(line=>rx.test(line)).map(line=>icsUnescape(line.slice(line.indexOf(':')+1)));
  }
  function contactSetNthProp(lines,key,nth,value){
    const rx=new RegExp('^(?:[A-Za-z0-9-]+\\.)?'+key+'(?:;[^:]*)?:','i');
    const hits=lines.map((line,i)=>rx.test(line)?i:-1).filter(i=>i>=0);
    if(hits[nth]!==undefined){
      if(value)lines[hits[nth]]=lines[hits[nth]].slice(0,lines[hits[nth]].indexOf(':')+1)+contactEscape(value);
      else lines.splice(hits[nth],1);
    }else if(value){
      const end=lines.findIndex(line=>/^END:VCARD$/i.test(line));
      lines.splice(end<0?lines.length:end,0,`${key};TYPE=${key==='EMAIL'?'INTERNET':'CELL'}:${contactEscape(value)}`);
    }
  }
  function contactEscape(value){return String(value||'').trim().replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
  function contactSetProp(lines,key,value){
    const regex=new RegExp('^(?:[A-Za-z0-9-]+\\.)?'+key+'(?:;[^:]*)?:','i');
    const at=lines.findIndex(line=>regex.test(line));
    if(at>=0)lines[at]=lines[at].slice(0,lines[at].indexOf(':')+1)+contactEscape(value);
    else if(value)lines.splice(lines.findIndex(line=>/^END:VCARD$/i.test(line)),0,`${key}:${contactEscape(value)}`);
  }
  function contactFoldLine(line){
    const encoder=new TextEncoder();let out='',bytes=0;
    for(const char of line){const width=encoder.encode(char).length;if(bytes+width>75){out+='\r\n ';bytes=1;}out+=char;bytes+=width;}
    return out;
  }
  function contactUpdateVcard(raw,fields){
    const lines=contactUnfold(raw).split('\n').filter(Boolean);
    if(!lines.some(line=>/^BEGIN:VCARD$/i.test(line))||!lines.some(line=>/^END:VCARD$/i.test(line)))throw Error('Fiche vCard invalide');
    const nameChanged=contactProp(raw,'FN')!==fields.name;
    for(const [key,field] of [['FN','name'],['EMAIL','email'],['TEL','phone'],['ORG','org']])contactSetProp(lines,key,fields[field]);
    contactSetNthProp(lines,'EMAIL',1,fields.email2||'');
    contactSetNthProp(lines,'TEL',1,fields.phone2||'');
    if(nameChanged){
      const parts=fields.name.trim().split(/\s+/),family=parts.length>1?parts.pop():fields.name,given=parts.length?parts.join(' '):'';
      const nameAt=lines.findIndex(line=>/^N(?:;[^:]*)?:/i.test(line));
      if(nameAt>=0)lines[nameAt]=`N:${contactEscape(family)};${contactEscape(given)};;;`;
    }
    // Preserve all additional properties, including alternate addresses, extra
    // phone numbers, photos, groups, labels and extension properties.
    return lines.map(contactFoldLine).join('\r\n')+'\r\n';
  }
  function contactNewVcard(fields,uid){
    const full=fields.name.trim(),parts=full.split(/\s+/),family=parts.length>1?parts.pop():full,given=parts.length?parts.join(' '):'';
    const lines=['BEGIN:VCARD','VERSION:3.0',`UID:${uid}`,`FN:${contactEscape(full)}`,`N:${contactEscape(family)};${contactEscape(given)};;;`];
    if(fields.email)lines.push(`EMAIL;TYPE=INTERNET:${contactEscape(fields.email)}`);
    if(fields.email2)lines.push(`EMAIL;TYPE=INTERNET:${contactEscape(fields.email2)}`);
    if(fields.phone)lines.push(`TEL;TYPE=VOICE:${contactEscape(fields.phone)}`);
    if(fields.phone2)lines.push(`TEL;TYPE=CELL:${contactEscape(fields.phone2)}`);
    if(fields.org)lines.push(`ORG:${contactEscape(fields.org)}`);
    return [...lines,'END:VCARD',''].map(contactFoldLine).join('\r\n');
  }
  function contactUuid(){
    if(window.crypto?.randomUUID)return window.crypto.randomUUID();
    const bytes=new Uint8Array(16);window.crypto.getRandomValues(bytes);
    bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    return [...bytes].map((v,i)=>[4,6,8,10].includes(i)?'-'+v.toString(16).padStart(2,'0'):v.toString(16).padStart(2,'0')).join('');
  }
  async function fetchContacts(){
    const uid=String(root.dataset.currentUid||'');
    if(!uid||uid==='demo')throw Error('Identifiant utilisateur Nextcloud introuvable');
    const base=contactRoot();
    const response=await davRequest('PROPFIND',base,{headers:{Depth:'1','Content-Type':'application/xml; charset=utf-8'},body:'<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>'});
    const xml=xmlDocument(await response.text());
    const books=[];
    for(const item of xmlChildren(xml.documentElement,'response')){
      const found=xmlChildren(item,'addressbook').length>0;
      const href=xmlText(item,'href');if(!href)continue;
      let url;try{url=contactSafeUrl(href);}catch{continue;}
      if(!found||url===new URL(base,window.location.origin).href)continue;
      if(!url.endsWith('/'))url+='/';
      books.push({url,name:xmlText(item,'displayname')||'Contacts'});
    }
    const entries=new Map();
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
  function contactStartDelete(){
    const item=integrations.contacts.items[contactDetail];
    if(!item?.href||!item?.bookUrl)return;
    Object.assign(contactDelete,{open:true,busy:false,error:'',href:item.href,bookUrl:item.bookUrl,etag:item.etag||'',name:item.title});
    render();
    // Keyboard users enter the destructive confirmation instead of losing focus.
    surface.querySelector('[data-action="contact-delete-cancel"]')?.focus({preventScroll:true});
  }
  async function contactConfirmDelete(){
    const c=contactDelete;
    if(!c.open||c.busy)return;
    const item=integrations.contacts.items[contactDetail];
    if(!item||item.href!==c.href||item.bookUrl!==c.bookUrl){c.error='Contact différent : action annulée.';render();return;}
    c.busy=true;c.error='';render();
    try{
      if(demo){integrations.contacts.items.splice(contactDetail,1);}
      else{
        const url=contactSafeUrl(c.href,c.bookUrl);
        const before=await davRequest('GET',url);
        const currentEtag=before.headers.get('ETag');
        if(!currentEtag||!c.etag||currentEtag!==c.etag)throw Error('La fiche a changé depuis son affichage. Recharge Contacts avant de supprimer.');
        const raw=await before.text();
        if(!raw.includes('BEGIN:VCARD'))throw Error('Contenu vCard non vérifiable : suppression annulée.');
        await davRequest('DELETE',url,{headers:{'If-Match':currentEtag}});
        // Verify the deletion before reporting success. Never retry a DELETE automatically.
        let missing=false;
        try{await davRequest('GET',url);}catch(error){if(/HTTP 404\b/.test(String(error.message||error)))missing=true;else throw Error('Suppression envoyée mais contrôle impossible : '+String(error.message||error));}
        if(!missing)throw Error('Réponse de suppression reçue, mais la fiche existe encore. Actualise avant de réessayer.');
      }
      c.open=false;contactDetail=-1;toast('Contact supprimé et vérifié','success');
      if(demo)render();else await loadIntegration('contacts',true);
    }catch(error){c.error=String(error.message||error);}
    finally{
      c.busy=false;
      if(activeWorkspace==='contacts'){
        render();
        if(c.open)surface.querySelector('[data-action="contact-delete-cancel"]')?.focus({preventScroll:true});
        else surface.querySelector('[data-integr-search="contacts"]')?.focus({preventScroll:true});
      }
    }
  }
  function contactCloseEditor(){contactEditor.open=false;contactEditor.busy=false;contactEditor.loading=false;contactEditor.error='';render();}
  async function contactOpenEditor(mode){
    if(mode==='edit'&&integrations.contacts.items[contactDetail]?.href){
      const contact=integrations.contacts.items[contactDetail];
      Object.assign(contactEditor,{open:true,mode:'edit',loading:true,busy:false,error:'',url:contact.href,etag:'',raw:'',bookUrl:contact.bookUrl,fields:{name:contact.title,email:contact.email,email2:contact.email2||'',phone:contact.phone,phone2:contact.phone2||'',org:contact.org}});
      render();
      try{
        if(demo){Object.assign(contactEditor,{raw:contactNewVcard(contactEditor.fields,'demo'),etag:'"demo"',loading:false});render();return;}
        const response=await davRequest('GET',contactSafeUrl(contact.href,contact.bookUrl));
        const raw=await response.text(),etag=response.headers.get('ETag');
        if(!raw.includes('BEGIN:VCARD')||!etag)throw Error('vCard ou ETag absent : édition sécurisée indisponible');
        contactEditor.raw=raw;contactEditor.etag=etag;
        const emails=contactProps(raw,'EMAIL'),phones=contactProps(raw,'TEL');
        contactEditor.fields={name:contactProp(raw,'FN')||contact.title,email:emails[0]||'',email2:emails[1]||'',phone:phones[0]||'',phone2:phones[1]||'',org:contactProp(raw,'ORG')};
      }catch(error){contactEditor.error='Lecture impossible : '+String(error.message||error);}
      contactEditor.loading=false;render();return;
    }
    const books=integrations.contacts.meta?.books||[];
    if(!books.length)return toast('Aucun carnet CardDAV disponible','error');
    Object.assign(contactEditor,{open:true,mode:'new',loading:false,busy:false,error:'',url:'',etag:'',raw:'',bookUrl:books[0].url,fields:{name:'',email:'',email2:'',phone:'',phone2:'',org:''}});
    contactDetail=-1;render();
  }
  async function contactSave(form){
    if(!contactEditor.open||contactEditor.busy||contactEditor.loading)return;
    const fields=Object.fromEntries(['name','email','email2','phone','phone2','org'].map(key=>[key,String(new FormData(form).get(key)||'').trim()]));
    const bookUrl=contactEditor.mode==='new'?String(new FormData(form).get('bookUrl')||''):contactEditor.bookUrl;
    contactEditor.fields=fields;contactEditor.bookUrl=bookUrl;contactEditor.error='';
    if(!fields.name||fields.name.length>200){contactEditor.error='Renseigne un nom valide (200 caractères maximum).';render();return;}
    if([fields.email,fields.email2].some(email=>email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){contactEditor.error='Adresse e-mail invalide.';render();return;}
    if(!demo&&!(integrations.contacts.meta?.books||[]).some(book=>book.url===bookUrl)){contactEditor.error='Carnet non autorisé.';render();return;}
    contactEditor.busy=true;render();
    try{
      if(demo){
        if(contactEditor.mode==='new')integrations.contacts.items.push({title:fields.name,subtitle:fields.email||fields.phone||'Contacts',summary:fields.org,email:fields.email,phone:fields.phone,org:fields.org,badge:'Équipe',href:'demo-contact-'+contactUuid(),bookUrl,etag:'"demo"',url:nativePath('contacts')});
        else{const old=integrations.contacts.items[contactDetail];if(!old)throw Error('Contact absent');Object.assign(old,{title:fields.name,subtitle:fields.email||fields.phone||old.badge,summary:fields.org,...fields});}
        integrations.contacts.items.sort((a,b)=>a.title.localeCompare(b.title,'fr'));
      }else if(contactEditor.mode==='new'){
        const uid=contactUuid(),url=contactSafeUrl(davJoin(bookUrl,uid+'.vcf'),bookUrl);
        const body=contactNewVcard(fields,uid);
        await davRequest('PUT',url,{headers:{'Content-Type':'text/vcard; charset=utf-8','If-None-Match':'*'},body});
        const after=await davRequest('GET',url);const created=await after.text();
        if(contactProp(created,'FN')!==fields.name||contactProps(created,'EMAIL')[1]!==((fields.email2)||undefined)&&!!fields.email2)throw Error('Contact créé, mais lecture de vérification incohérente. Actualise Contacts avant de réessayer.');
      }else{
        const url=contactSafeUrl(contactEditor.url,bookUrl);
        const before=await davRequest('GET',url);
        const etag=before.headers.get('ETag'),raw=await before.text();
        if(!etag||etag!==contactEditor.etag)throw Error('La fiche a changé depuis son ouverture. Annule et recharge-la avant de modifier.');
        if(!raw.includes('BEGIN:VCARD'))throw Error('Contenu vCard illisible : écriture annulée.');
        const body=contactUpdateVcard(raw,fields);
        await davRequest('PUT',url,{headers:{'Content-Type':'text/vcard; charset=utf-8','If-Match':etag},body});
        const after=await davRequest('GET',url);const verified=await after.text();
        if(contactProp(verified,'FN')!==fields.name||fields.email2&&contactProps(verified,'EMAIL')[1]!==fields.email2||fields.phone2&&contactProps(verified,'TEL')[1]!==fields.phone2)throw Error('Réponse d’écriture reçue, mais le contact ne correspond pas. Actualise avant de réessayer.');
      }
      contactEditor.open=false;contactDetail=-1;toast(contactEditor.mode==='new'?'Contact créé':'Contact modifié','success');
      if(demo)render();else await loadIntegration('contacts',true);
      return;
    }catch(error){
      const msg=String(error.message||error);
      contactEditor.error=/HTTP 412/.test(msg)?'Conflit de version (412) : le contact a été modifié ailleurs. Recharge sa fiche.':/[Hh][Tt][Tt][Pp] (403|405)/.test(msg)?'Écriture non autorisée par Nextcloud : carnet peut-être en lecture seule.':msg;
    }finally{contactEditor.busy=false;if(activeWorkspace==='contacts')render();}
  }
  // Mail's API exposes databaseId + specialRole; older versions may also use id.
  // Do not silently classify a valid account as empty when the mailbox shape differs.
  function mailMailboxId(box){
    const raw=box?.databaseId??box?.id;
    return /^\d+$/.test(String(raw??''))?String(raw):'';
  }
  function mailFolders(list){
    const found=[];const walk=(nodes,depth=0)=>{if(depth>8)return;
      for(const node of Array.isArray(nodes)?nodes:[]){
        if(!node||typeof node!=='object')continue;
        if(mailMailboxId(node))found.push(node);
        walk(node.children||node.mailboxes||node.subfolders,depth+1);
      }
    };walk(list);return [...new Map(found.map(m=>[mailMailboxId(m),m])).values()];
  }
  function mailEnvelopeList(response){
    if(Array.isArray(response))return response;
    for(const values of [response?.messages,response?.envelopes,response?.items,response?.data,response?.threads,response?.data?.messages,response?.data?.envelopes])if(Array.isArray(values))return values;
    return [];
  }
  function mailMessageToRow(msg,account,box){
    const raw=msg?.message||msg?.envelope||msg;
    const from=raw?.from||raw?.sender||'';
    const author=Array.isArray(from)?from.map(f=>typeof f==='string'?f:(f.label||f.name||f.email||'')).join(', '):typeof from==='string'?from:(from?.label||from?.email||'');
    const date=raw?.dateInt??raw?.sentAt??raw?.date??raw?.timestamp??raw?.receivedAt;
    const numeric=typeof date==='number'?date:typeof date==='string'&&/^\d+$/.test(date)?Number(date):NaN;
    const timestamp=Number.isFinite(numeric)?(numeric>100000000000?numeric:numeric*1000):Date.parse(date||'');
    const key=raw?.databaseId??raw?.id;
    const messageId=/^\d+$/.test(String(key??''))?String(key):'';
    const folderKey=`${account.id}:${mailMailboxId(box)}`;
    const seen=raw?.flags?.seen;
    return {folderKey,messageId,accountId:String(account.id),senderEmail:mailRecipientAddress(raw?.replyTo)||mailRecipientAddress(from),rfcMessageId:typeof raw?.messageId==='string'&&raw.messageId.includes('@')?raw.messageId:'',title:raw?.subject||'(sans objet)',subtitle:author||account?.email||'Compte Mail',summary:Number.isFinite(timestamp)?new Date(timestamp).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'',url:messageId?mailNative(`/open/${encodeURIComponent(messageId)}`):mailNative(`/box/${encodeURIComponent(mailMailboxId(box))}`),badge:seen===false||raw?.unread?'Non lu':'',unread:seen===false||Boolean(raw?.unread),sortTime:Number.isFinite(timestamp)?timestamp:0};
  }
  async function mailSyncInbox(boxId){
    const url=mailNative(`/api/mailboxes/${encodeURIComponent(boxId)}/sync`);
    const options=(init)=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:[],lastMessageTimestamp:null,init,sortOrder:'newest',query:null})});
    try{
      const reply=await moduleRequest(url,options(false));
      // 202 means the server has only partially synchronized; avoid retry storms.
      if(reply?.status==='fail')return 'Synchronisation incomplète ; réessaie dans un instant.';
      return '';
    }catch(error){
      const message=String(error.message||error);
      if(/^HTTP 428\b/.test(message)){
        try{await moduleRequest(url,options(true));return '';}
        catch(initError){return `Initialisation différée (${String(initError.message||initError).slice(0,90)}).`; }
      }
      if(/^HTTP (409|423)\b/.test(message))return 'Boîte déjà en cours de synchronisation ; nouvelle vérification au prochain passage.';
      return `Synchronisation IMAP indisponible (${message.slice(0,100)}).`;
    }
  }
  let mailDisplayCount=70;
  const MAIL_PAGE_SIZE=40;
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
  async function fetchMail(){
    const accounts=integrationArray(await moduleRequest(mailNative('/api/accounts')));
    if(!accounts.length)return {items:[],meta:{accounts:[],mailboxes:[],warnings:[],note:'Aucun compte Mail configuré. Configure ton compte dans Nextcloud Mail natif.'}};
    const entries=[],warnings=[],mailboxes=[];
    let syncAttempted=0;let syncWarnings=0;
    mailRefreshState.lastAttempt=Date.now();
    let validAccounts=0;
    for(const account of accounts.slice(0,10)){
      if(!/^\d+$/.test(String(account?.id??''))){warnings.push('Un compte ne possède pas d’identifiant numérique reconnu.');continue;}
      validAccounts++;
      const accountName=String(account?.email||account?.name||`Compte ${account.id}`);
      try{
        const boxResponse=await moduleRequest(mailNative(`/api/mailboxes?accountId=${encodeURIComponent(account.id)}`));
        const folders=mailFolders(boxResponse?.mailboxes||boxResponse?.data?.mailboxes||boxResponse);
        const targetId=String(account?.inboxMailboxId??'');
        const inbox=folders.find(box=>mailMailboxId(box)===targetId&&targetId!=='')
          ||folders.find(box=>String(box.specialRole||box.specialUse||box.role||'').toLowerCase()==='inbox')
          ||folders.find(box=>/^(inbox|boîte de réception|boite de reception|réception|reception)$/i.test(String(box.name||box.displayName||'')));
        if(!inbox){warnings.push(`${accountName} : aucun dossier Réception reconnu (${folders.length} dossier(s) reçu(s)).`);continue;}
        const boxId=mailMailboxId(inbox);
        const key=`${account.id}:${boxId}`;
        const mailbox={...inbox,id:boxId,key,account,label:`${accountName} · ${inbox.displayName||inbox.name||'Réception'}`,cursor:null};
        mailboxes.push(mailbox);
        // Reading /api/messages only reads Mail's cache. Native Mail performs this sync first.
        if(!demo){
          syncAttempted++;
          const syncWarning=await mailSyncInbox(boxId);
          if(syncWarning){warnings.push(`${accountName} : ${syncWarning}`);syncWarnings++;}
        }
        try{
          const payload=await moduleRequest(mailNative(`/api/messages?mailboxId=${encodeURIComponent(boxId)}&limit=40&view=singleton`));
          const messages=mailEnvelopeList(payload);
          // Keep the diagnostic if a previously unknown response shape is returned.
          if(!Array.isArray(payload)&&messages.length===0&&!['messages','envelopes','items','data','threads'].some(k=>k in (payload||{}))){
            warnings.push(`${accountName} : réponse de la liste des messages non reconnue.`);
          }
          mailbox.cursor=mailPageCursor(messages);
          entries.push(...messages.slice(0,MAIL_PAGE_SIZE).map(msg=>mailMessageToRow(msg,account,inbox)));
        }catch(error){warnings.push(`${accountName} : lecture de Réception impossible (${String(error.message||error).slice(0,110)}). Vérifie la synchronisation dans Mail natif.`);}
      }catch(error){warnings.push(`${accountName} : liste des dossiers inaccessible (${String(error.message||error).slice(0,110)}).`);}
    }
    if(validAccounts===0)throw Error('API Mail : aucun identifiant de compte exploitable.');
    if(mailboxes.length===0)throw Error(`Aucune boîte de réception Mail reconnue. ${warnings.join(' ')}`);
    if(mailFolderFilter!=='all'&&!mailboxes.some(m=>m.key===mailFolderFilter))mailFolderFilter='all';
    if(syncAttempted>0&&syncWarnings===0)mailRefreshState.lastSuccess=Date.now();
    return {items:entries.sort((a,b)=>b.sortTime-a.sortTime),meta:{accounts:accounts.filter(a=>/^\d+$/.test(String(a.id))).map(a=>({id:String(a.id),email:String(a.email||a.name||'Compte '+a.id),draftsMailboxId:mailDraftMailboxId(a)})),mailboxes,warnings,syncedAt:mailRefreshState.lastSuccess||null,note:`${accounts.length} compte(s), ${mailboxes.length} boîte(s) de réception détectée(s). Synchronisation IMAP puis lecture du cache. Une boîte en cours de synchronisation pourra afficher temporairement les anciens messages.`}};
  }
  async function loadIntegration(id,force=false){
    if(!integratedIds.has(id))return;
    const state=integrations[id];
    if(id==='mail'&&(state.status==='loading'||mailHistoryLoading))return;
    if(id==='mail'){mailDisplayCount=70;mailHistoryError='';}
    if(!force&&(state.status==='loading'||state.status==='ready'))return;
    const gen=++state.generation;state.status='loading';state.error='';if(activeWorkspace===id)render();
    try{
      let result;
      if(demo){
        const fixtures={
          talk:[{title:'Équipe projet Neos',token:'demo-room-1',subtitle:'3 messages non lus · Hier',summary:'Le prototype est prêt pour la revue',badge:'3',unreadCount:3,url:nativePath('talk')},{title:'Atelier design',token:'demo-room-2',subtitle:'Conversation · Aujourd’hui',summary:'Nouvelle proposition de palette',badge:'1',unreadCount:1,url:nativePath('talk')},{title:'Support NAS',token:'demo-room-3',subtitle:'Conversation · Lundi',summary:'Maintenance terminée',url:nativePath('talk')}],
          activity:[{title:'Un fichier a été partagé',category:'files',subtitle:'Fichiers · il y a 2 h',summary:'Maquette Interface Neos',url:nativePath('activity')},{title:'Carte Deck mise à jour',category:'deck',subtitle:'Deck · hier',summary:'Validation du Planning',url:nativePath('activity')},{title:'Une note a été modifiée',category:'other',subtitle:'Notes · mardi',summary:'Prochain sprint',url:nativePath('activity')}],
          contacts:[{href:'demo-camille',bookUrl:'demo-book',title:'Camille Bernard',subtitle:'camille@example.test',summary:'+33 6 00 00 00 01',email:'camille@example.test',phone:'+33 6 00 00 00 01',org:'Atelier Neos',badge:'Équipe',url:nativePath('contacts')},{href:'demo-morgan',bookUrl:'demo-book',title:'Morgan Petit',subtitle:'morgan@example.test',email:'morgan@example.test',email2:'secondaire-morgan@example.test',phone2:'+33 6 42 42 42 42',org:'Atelier Neos',badge:'Équipe',url:nativePath('contacts')},{href:'demo-alex',bookUrl:'demo-personal',title:'Alex Dupont',subtitle:'alex@example.test',email:'alex@example.test',badge:'Personnel',url:nativePath('contacts')}],
          mail:[{messageId:'101',title:'Revue du prototype',subtitle:'Camille Bernard <camille@example.test>',summary:'Aujourd’hui · 10:32',badge:'Non lu',unread:true,demoBody:'Bonjour,\n\nJe te confirme que la revue du prototype Neos est prévue vendredi.\nLa nouvelle fenêtre de lecture Mail sera prête à tester.\n\nCamille',url:nativePath('mail')},{messageId:'102',title:'Compte rendu du projet',subtitle:'Morgan Petit',summary:'Hier · 16:20',url:nativePath('mail')},{messageId:'103',title:'Réunion de vendredi',subtitle:'Alex Dupont',summary:'Lundi · 08:15',url:nativePath('mail')}]
        };
        if(id==='contacts'&&state.status==='ready'&&state.items.length)fixtures.contacts=state.items;
        if(id==='mail')fixtures.mail=fixtures.mail.map((m,i)=>({...m,folderKey:i===2?'2:11':'1:7'}));
        result={items:fixtures[id],meta:{note:'Données fictives de présentation, sans connexion à un compte.',...(id==='activity'?{hasNext:true,cursor:50}:{}),...(id==='contacts'?{books:[{url:'demo-book',name:'Équipe'},{url:'demo-personal',name:'Personnel'}]}:{}),...(id==='mail'?{accounts:[{id:'1',email:'projet@example.test'},{id:'2',email:'perso@example.test'}],mailboxes:[{key:'1:7',label:'projet@example.test · Réception'},{key:'2:11',label:'perso@example.test · Réception'}],warnings:[],syncedAt:Date.now(),note:'Démo · Le bouton Synchroniser ne contacte aucun serveur. Sur le NAS, Neos synchronise via l’API Mail puis recharge les messages.'}: {})}};
      }else if(id==='talk'){
        const rooms=integrationArray(await ocsIntegrationGet('apps/spreed/api/v4/room?noStatusUpdate=1'));
        result={items:rooms.slice(0,75).map(room=>({title:room.displayName||room.name||'Conversation',token:String(room.token||''),subtitle:`${Number(room.unreadMessages)||0} non lu(s) · ${room.type===1?'Discussion directe':'Salon'}`,summary:room.lastMessage?.message||'',badge:Number(room.unreadMessages)>0?String(room.unreadMessages):'',unreadCount:Number(room.unreadMessages)||0,url:nativePath('talk',`call/${encodeURIComponent(room.token||'')}`)})),meta:{note:'Lire et envoyer des messages texte directement dans Neos. Pour les appels et les pièces jointes, utilise Talk natif.'}};
      }else if(id==='activity'){
        const page=await activityPage();
        result={items:page.items,meta:{cursor:page.cursor,hasNext:page.hasNext,note:'Pagination serveur. Les activités dépendent des préférences de confidentialité et de notifications Nextcloud.'}};
      }else if(id==='contacts')result=await fetchContacts();
      else result=await fetchMail();
      if(gen!==state.generation)return;
      state.items=result.items;state.meta=result.meta||{};state.updatedAt=Date.now();state.status='ready';
      if(id==='contacts'){contactDetail=-1;contactDelete.open=false;if(!contactEditor.open)contactEditor.error='';}
      if(id==='mail'&&mailReader.item){mailReader.generation++;mailReader.item=null;mailReader.index=-1;mailReader.body='';mailReader.html='';}
      if(id==='talk'&&talkChat.token&&!state.items.some(item=>item.token===talkChat.token)){talkChat.token='';talkChat.generation++;}
    }catch(error){if(gen!==state.generation)return;state.status='error';state.error=String(error.message||'Erreur de connexion');}
    if(gen===state.generation&&activeWorkspace===id)render();
  }
  function moduleRequest(url,options={},readResponse=response=>response.json()){
    const token=csrfToken(); const headers={Accept:'application/json','OCS-APIRequest':'true','X-Requested-With':'XMLHttpRequest',...(token?{requesttoken:token}:{}),...(options.headers||{})};
    return fetch(url,{credentials:'same-origin',cache:'no-store',...options,headers}).then(async response=>{
      if(!response.ok){
        let detail='';
        if((response.headers.get('Content-Type')||'').toLowerCase().includes('json')){
          const data=await response.json().catch(()=>null);
          const msg=data?.message||data?.ocs?.meta?.message||data?.error;
          if(typeof msg==='string')detail=msg.slice(0,160);
        }
        throw new Error(`HTTP ${response.status}${detail?' — '+detail:''}`);
      }
      return readResponse(response);
    });
  }
  const notesUrl=()=>`${ncWebroot()}/index.php/apps/notes/api/v1/notes`;
  const deckUrl=()=>`${ncWebroot()}/index.php/apps/deck/api/v1.0`;
  function deckApiBases(){
    const generated=window.OC?.generateUrl?.('/apps/deck/api/v1.0');
    return [...new Set([
      ...(generated?[String(generated).replace(/\/$/,'')]:[]),
      deckUrl(),
      `${ncWebroot()}/ocs/v2.php/apps/deck/api/v1.0`,
    ])];
  }
  let deckResolvedBase='';
  async function deckRequest(path,options={}){
    if(demo)return null;
    const bases=deckResolvedBase?[deckResolvedBase]:deckApiBases();
    let last=null;
    for(const base of bases){
      try{
        const data=await moduleRequest(base+path,{
          ...options,
          headers:{'Content-Type':'application/json',...(options.headers||{})},
        });
        if(data?.ocs?.meta?.statuscode && ![100,200].includes(Number(data.ocs.meta.statuscode))){
          throw new Error(`HTTP ${data.ocs.meta.statuscode}`);
        }
        deckResolvedBase=base;
        return data?.ocs?.data??data;
      }catch(error){
        last=error;
        // A forbidden request or a server failure must not be masked by another route.
        if(!/HTTP 404(?:\D|$)/.test(String(error.message)))throw error;
      }
    }
    throw last||new Error('HTTP 404');
  }
  function deckUnavailableMessage(error){
    if(!availableApps().has('deck'))return 'Deck n’est pas activé pour cet utilisateur. Vérifie les applications installées dans Nextcloud.';
    if(/404/.test(String(error.message)))return 'API Deck introuvable (404). Vérifie la version de Deck et son activation dans Nextcloud. Les autres modules Neos restent disponibles.';
    return `Connexion à Deck impossible (${error.message}).`;
  }

  async function loadPhotos(force=false){
    if(!force&&photoState.status==='ready')return;
    const gen=++moduleGeneration;photoState.status='loading';render();
    try{const result=demo?demo.gallery:await api(root.dataset.galleryUrl);if(gen!==moduleGeneration)return;
      photoState.items=Array.isArray(result?.items)?result.items:[];photoState.partial=!!result?.partial;photoState.status='ready';photoState.error='';
    }catch(error){if(gen!==moduleGeneration)return;photoState.error=`Photos indisponibles (${error.message}).`;photoState.status='error';}
    if(activeWorkspace==='photos')render();
  }
  async function notesPage(source,cursor){
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
        if(source!=='api'||!/^HTTP 404(?:\D|$)/.test(String(error.message)))throw error;
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
  async function loadDeck(force=false){
    if(!force&&deckState.status==='ready')return;
    if(force)deckResolvedBase='';
    if(!demo && !availableApps().has('deck')){deckState.status='error';deckState.error='Deck n’est pas activé pour cet utilisateur. Vérifie les applications Nextcloud.';if(activeWorkspace==='deck'||(activeWorkspace==='home'&&!settings.hidden.includes('deck')))render();return;}
    const gen=++moduleGeneration;deckState.status='loading';if(activeWorkspace==='deck'||(activeWorkspace==='home'&&!settings.hidden.includes('deck')))render();
    try{let data=demo?demo.deckBoards:await deckRequest('/boards');if(gen!==moduleGeneration)return;
      if(data?.ocs?.data)data=data.ocs.data;deckState.boards=Array.isArray(data)?data:[];
      deckState.boardId=deckState.boards.some(b=>String(b.id)===String(deckState.boardId))?deckState.boardId:deckState.boards[0]?.id||null;
      deckState.status='ready';deckState.error='';
      if(deckState.boardId){await loadDeckStacks(deckState.boardId,gen);return;}
    }catch(error){if(gen!==moduleGeneration)return;deckState.status='error';deckState.error=deckUnavailableMessage(error);} if(activeWorkspace==='deck'||(activeWorkspace==='home'&&!settings.hidden.includes('deck')))render();
  }
  async function loadDeckStacks(id, gen=++moduleGeneration){
    if(deckFilters.boardId!==String(id)){
      Object.assign(deckFilters,{boardId:String(id),query:'',status:'all',due:'all'});
    }
    deckState.boardId=id;deckState.status='loading';if(activeWorkspace==='deck'||(activeWorkspace==='home'&&!settings.hidden.includes('deck')))render();
    try{let data=demo?(demo.deckStacks?.[id]||[]):await deckRequest(`/boards/${encodeURIComponent(id)}/stacks`);
      if(gen!==moduleGeneration)return;if(data?.ocs?.data)data=data.ocs.data;deckState.stacks=(Array.isArray(data)?data:[]).sort((a,b)=>Number(a.order||0)-Number(b.order||0));deckState.status='ready';deckState.error='';
    }catch(error){if(gen!==moduleGeneration)return;deckState.status='error';deckState.error=deckUnavailableMessage(error);} if(activeWorkspace==='deck'||(activeWorkspace==='home'&&!settings.hidden.includes('deck')))render();
  }
  function noteSelect(id){
    if(notesState.dirty&&!window.confirm('Abandonner les modifications non enregistrées ?'))return;
    const n=notesState.items.find(n=>String(n.id)===String(id));if(!n)return;
    notesState.selected=n.id;notesState.draftTitle=n.title||'';notesState.draftContent=n.content||'';notesState.dirty=false;noteView='edit';render();
  }
  async function noteCreate(){
    if(notesState.dirty&&!window.confirm('Abandonner les modifications non enregistrées ?'))return;
    const title=window.prompt('Titre de la nouvelle note','Nouvelle note');if(title===null||!title.trim())return;
    try{const n=demo?{id:Date.now(),title:title.trim(),content:'',category:'',etag:'demo',modified:Date.now()/1000}:
      notesState.source==='files' ? await api(root.dataset.createLocalNoteUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({title:title.trim(),content:''}).toString()}) :
      await moduleRequest(notesUrl(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:title.trim(),content:''})});
      notesState.items.unshift(n);notesState.selected=n.id;notesState.draftTitle=n.title||'';notesState.draftContent=n.content||'';notesState.dirty=false;notesState.status='ready';render();toast('Note créée','success');
    }catch(error){toast(`Création de note impossible : ${error.message}`,'error');}
  }
  let noteSavePending=false;
  async function noteSave(){
    const n=notesState.items.find(n=>String(n.id)===String(notesState.selected));if(!n||n.readonly||noteSavePending)return;
    if(!notesState.draftTitle.trim()){toast('Titre requis','error');return;}
    const title=notesState.draftTitle,content=notesState.draftContent;
    noteSavePending=true;
    try{const result=demo?{...n,title:notesState.draftTitle,content:notesState.draftContent,etag:'demo2'}:
      notesState.source==='files' ? await api(root.dataset.saveLocalNoteUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({id:String(n.id),title:notesState.draftTitle,content:notesState.draftContent,etag:n.etag||''}).toString()}) :
      await moduleRequest(notesUrl()+`/${encodeURIComponent(n.id)}`,{method:'PUT',headers:{'Content-Type':'application/json',...(n.etag?{'If-Match':n.etag}:{})},body:JSON.stringify({title:notesState.draftTitle,content:notesState.draftContent})});
      Object.assign(n,result);
      if(notesState.selected===n.id&&notesState.draftTitle===title&&notesState.draftContent===content){
        notesState.draftTitle=n.title||'';notesState.draftContent=n.content||'';notesState.dirty=false;
        if(activeWorkspace==='notes')render();
      }
      toast('Note enregistrée','success');
    }catch(error){toast(error.message.includes('412')?'La note a changé ailleurs. Copie ton texte avant de recharger.':`Enregistrement impossible : ${error.message}`,'error');}
    finally{noteSavePending=false;}
  }
  function deckDateFromInput(input,previous){
    if(!input)return null;
    if(previous&&String(previous).slice(0,10)===input)return previous;
    const date=new Date(`${input}T12:00:00`);
    if(!Number.isFinite(date.getTime()))throw new Error('Date invalide');
    return date.toISOString();
  }
  function deckCardPayload(card,{title,description,duedate,done,order}){
    return {
      title,description,type:card?.type||'plain',owner:(typeof card?.owner==='string'?card.owner:card?.owner?.uid||card?.owner?.primaryKey||root.dataset.currentUid||''),
      order:Number.isFinite(Number(order))?Number(order):999,
      duedate:duedate||null,archived:!!card?.archived,done:done||null,
    };
  }
  function deckNextOrder(stack){
    return Math.max(0,...(stack?.cards||[]).map(card=>Number(card.order)||0))+1;
  }
  function deckCardApiPath(boardId,stackId,cardId){
    return `/boards/${encodeURIComponent(boardId)}/stacks/${encodeURIComponent(stackId)}/cards/${encodeURIComponent(cardId)}`;
  }
  function deckCardPath(){
    return deckCardApiPath(deckCardEditor.boardId,deckCardEditor.stackId,deckCardEditor.cardId);
  }
  function deckCreateCard(stackId){
    if(deckMoveBusy||!deckState.boardId)return;
    Object.assign(deckCardEditor,{boardId:deckState.boardId,stackId,cardId:null,card:{title:'',description:'',duedate:null,done:null,type:'plain'},create:true,draftStackId:String(stackId),loading:false,loadFailed:false,saving:false,error:'',dirty:false});
    popMode='deck-card';renderDeckCardEditor();
  }
  async function openDeckCard(stackId,cardId){
    if(deckMoveBusy)return;
    const stack=deckState.stacks.find(x=>String(x.id)===String(stackId));
    const summary=stack?.cards?.find(x=>String(x.id)===String(cardId));if(!summary)return;
    Object.assign(deckCardEditor,{boardId:deckState.boardId,stackId,cardId,card:{...summary},create:false,draftStackId:String(stackId),loading:!demo,loadFailed:false,saving:false,error:'',dirty:false});
    popMode='deck-card';renderDeckCardEditor();
    if(demo)return;
    try{
      const details=await deckRequest(deckCardPath());
      if(popMode!=='deck-card'||String(deckCardEditor.cardId)!==String(cardId))return;
      deckCardEditor.card={...summary,...details};deckCardEditor.loading=false;renderDeckCardEditor();
    }catch(e){if(popMode!=='deck-card')return;deckCardEditor.loading=false;deckCardEditor.loadFailed=true;deckCardEditor.error=`Détails indisponibles (${e.message}). Pour protéger les autres champs, l'édition est bloquée.`;renderDeckCardEditor();}
  }
  function renderDeckCardEditor(){
    if(popMode!=='deck-card')return;
    const card=deckCardEditor.card||{};
    const busy=deckCardEditor.loading||deckCardEditor.saving||deckCardEditor.loadFailed;
    const isCreate=deckCardEditor.create;
    const stackOptions=deckState.stacks.map(stack=>`<option value="${esc(stack.id)}" ${String(stack.id)===String(deckCardEditor.draftStackId||deckCardEditor.stackId)?'selected':''}>${esc(stack.title)}</option>`).join('');
    const dateValue=card.duedate?String(card.duedate).slice(0,10):'';
    popHost.innerHTML=`<div class="neos-pop-layer" data-action="close-pop"><section class="neos-deck-dialog neos-framed" role="dialog" aria-modal="true" aria-label="${isCreate?'Créer une carte Deck':'Modifier une carte Deck'}"><header><div><small>DECK · ${isCreate?'NOUVELLE CARTE':'CARTE'}</small><h2>${isCreate?'Créer une carte':'Éditer la carte'}</h2></div><button type="button" class="neos-iconbtn" data-action="deck-card-close" aria-label="Fermer">${icon('close',18)}</button></header>${deckCardEditor.loading?'<div class="neos-module-loader" role="status" aria-live="polite"><span class="neos-spinner"></span>Chargement des détails…</div>':`<div class="neos-deck-fields" aria-busy="${deckCardEditor.saving?'true':'false'}">${deckCardEditor.error?`<p class="neos-deck-error" role="alert">${esc(deckCardEditor.error)}</p>`:''}<label>Titre<input data-deck-title maxlength="255" value="${esc(card.title||'')}" ${busy?'disabled':''} placeholder="Titre de la carte"></label><label>Colonne<select data-deck-stack ${busy?'disabled':''}>${stackOptions}</select></label><label>Description (Markdown)<textarea data-deck-description rows="6" maxlength="30000" ${busy?'disabled':''} placeholder="Détails, liens, étapes…">${esc(card.description||'')}</textarea></label><label>Échéance (facultative)<input data-deck-duedate type="date" value="${esc(dateValue)}" ${busy?'disabled':''}></label>${!isCreate?`<label class="neos-deck-check"><input data-deck-done type="checkbox" ${card.done?'checked':''} ${busy?'disabled':''}><span>Carte terminée</span></label>`:''}<small>Les changements sont enregistrés dans Deck. Les déplacements sont vérifiés après synchronisation.</small></div>`}<footer><span class="neos-modal-progress" data-deck-progress role="status" aria-live="polite" aria-atomic="true">${deckCardEditor.saving?'Enregistrement en cours…':''}</span><button type="button" class="neos-btn" data-action="deck-card-close">Annuler</button><button type="button" class="neos-btn neos-btn-primary" data-action="deck-card-save" ${busy?'disabled':''}>${icon('check',16)} ${deckCardEditor.saving?'Enregistrement…':isCreate?'Créer la carte':'Enregistrer'}</button></footer></section></div>`;
    if(!busy)popHost.querySelector('[data-deck-title]')?.focus();
  }
  async function deckCheckStack(boardId,cardId,targetStackId){
    await loadDeckStacks(boardId);
    return !!deckState.stacks.find(stack=>String(stack.id)===String(targetStackId))?.cards?.some(card=>String(card.id)===String(cardId));
  }
  async function deckPersistMove({boardId,sourceStackId,targetStackId,cardId,details,payload}){
    // Deck API versions differ in how they handle the stackId in the route.
    // Never report a move as successful without refetching the target stack.
    const targetPath=deckCardApiPath(boardId,targetStackId,cardId);
    let firstError=null;
    try{
      await deckRequest(targetPath,{method:'PUT',body:JSON.stringify(payload)});
      if(await deckCheckStack(boardId,cardId,targetStackId))return;
    }catch(e){firstError=e;}
    // Fallback: documented reorder route using the *target* in both route/body.
    try{
      await deckRequest(`${targetPath}/reorder`,{method:'PUT',body:JSON.stringify({order:payload.order,stackId:Number(targetStackId)})});
      if(await deckCheckStack(boardId,cardId,targetStackId))return;
    }catch(e){firstError=e;}
    await loadDeckStacks(boardId);
    throw new Error(`déplacement non confirmé${firstError?` (${firstError.message})`:''}. Essaie depuis Deck natif.`);
  }
  async function moveDeckCard(sourceStackId,cardId,targetStackId){
    if(deckMoveBusy||String(sourceStackId)===String(targetStackId))return;
    const boardId=deckState.boardId;
    const source=deckState.stacks.find(x=>String(x.id)===String(sourceStackId));
    const target=deckState.stacks.find(x=>String(x.id)===String(targetStackId));
    const card=source?.cards?.find(x=>String(x.id)===String(cardId));
    if(!source||!target||!card||!boardId)return;
    deckMoveBusy=true;
    try{
      if(demo){source.cards=source.cards.filter(x=>String(x.id)!==String(cardId));target.cards.push({...card,stackId:target.id});}
      else{
        const details=await deckRequest(deckCardApiPath(boardId,sourceStackId,cardId));
        const payload=deckCardPayload(details,{title:details.title,description:details.description||'',duedate:details.duedate,done:details.done,order:deckNextOrder(target)});
        await deckPersistMove({boardId,sourceStackId,targetStackId,cardId,details,payload});
      }
      if(planningDeck.status!=='idle')void loadPlanningDeck(true);
      toast(`Carte déplacée vers « ${target.title} »`,'success');
    }catch(e){toast(`Déplacement impossible : ${e.message}`,'error');if(!demo)void loadDeckStacks(boardId);}
    finally{deckMoveBusy=false;deckDrag=null;if(activeWorkspace==='deck')render();}
  }
  async function saveDeckCard(){
    if(deckCardEditor.loading||deckCardEditor.saving||deckCardEditor.loadFailed)return;
    const title=popHost.querySelector('[data-deck-title]')?.value.trim()||'';
    const description=popHost.querySelector('[data-deck-description]')?.value||'';
    const targetStackId=popHost.querySelector('[data-deck-stack]')?.value||String(deckCardEditor.stackId);
    const duedateInput=popHost.querySelector('[data-deck-duedate]')?.value||'';
    const doneInput=popHost.querySelector('[data-deck-done]')?.checked||false;
    if(!title){toast('Titre requis','error');return;}
    const target=deckState.stacks.find(x=>String(x.id)===String(targetStackId));
    if(!target){toast('Colonne introuvable','error');return;}
    const original=deckCardEditor.card||{};
    const isCreate=deckCardEditor.create;
    const boardId=deckCardEditor.boardId;
    const sourceStackId=deckCardEditor.stackId;
    deckCardEditor.saving=true;deckCardEditor.error='';
    const deckDialog=popHost.querySelector('.neos-deck-fields');
    if(deckDialog)deckDialog.setAttribute('aria-busy','true');
    const deckProgress=popHost.querySelector('[data-deck-progress]');
    if(deckProgress)deckProgress.textContent='Enregistrement en cours…';
    for(const action of ['deck-card-close','deck-card-save']){
      popHost.querySelectorAll(`[data-action="${action}"]`).forEach(btn=>btn.setAttribute('aria-disabled','true'));
    }
    try{
      const duedate=deckDateFromInput(duedateInput,original.duedate);
      const done=isCreate?null:doneInput?(original.done||new Date().toISOString()):null;
      const moved=!isCreate&&String(sourceStackId)!==String(targetStackId);
      const payload=deckCardPayload(original,{title,description,duedate,done,order:moved?deckNextOrder(target):original.order||999});
      if(isCreate){
        if(demo){const card={id:Date.now(),...payload,stackId:Number(targetStackId)};target.cards.push(card);}
        else await deckRequest(`/boards/${encodeURIComponent(boardId)}/stacks/${encodeURIComponent(targetStackId)}/cards`,{method:'POST',body:JSON.stringify({title,description,type:'plain',order:deckNextOrder(target),duedate})});
      }else if(moved){
        if(demo){const source=deckState.stacks.find(x=>String(x.id)===String(sourceStackId));source.cards=source.cards.filter(x=>String(x.id)!==String(deckCardEditor.cardId));target.cards.push({...original,...payload,stackId:Number(targetStackId)});}
        else await deckPersistMove({boardId,sourceStackId,targetStackId,cardId:deckCardEditor.cardId,details:original,payload});
      }else if(title===String(original.title||'')&&description===String(original.description||'')&&String(duedate||'')===String(original.duedate||'')&&!!done!==!!original.done){
        // Completion-only edits use the same dedicated Deck route as Tâches / Planning.
        if(!demo)await writeDeckDone(boardId,deckCardEditor.cardId,!!done,sourceStackId);
        const stack=deckState.stacks.find(x=>String(x.id)===String(sourceStackId));
        const card=stack?.cards?.find(x=>String(x.id)===String(deckCardEditor.cardId));if(card)card.done=done;
      }else{
        if(!demo)await deckRequest(deckCardPath(),{method:'PUT',body:JSON.stringify(payload)});
        const stack=deckState.stacks.find(x=>String(x.id)===String(sourceStackId));
        const card=stack?.cards?.find(x=>String(x.id)===String(deckCardEditor.cardId));if(card)Object.assign(card,payload);
      }
      deckCardEditor.saving=false;popMode='';popHost.replaceChildren();
      if(!demo)await loadDeckStacks(boardId);else render();
      if(planningDeck.status!=='idle')void loadPlanningDeck(true);
      toast(isCreate?'Carte créée':moved?'Carte déplacée':'Carte mise à jour','success');
    }catch(e){
      deckCardEditor.saving=false;deckCardEditor.draftStackId=String(targetStackId);
      deckCardEditor.card={...original,title,description,duedate:duedateInput?deckDateFromInput(duedateInput,original.duedate):null,done:doneInput?(original.done||new Date().toISOString()):null};
      deckCardEditor.error=`Enregistrement refusé (${e.message}). Vérifie les permissions Deck.`;renderDeckCardEditor();
    }
  }

  async function chooseWorkspace(id){
    if(!installedTabs().includes(id))return;
    if(id===activeWorkspace)return;
    if(notesState.dirty&&activeWorkspace==='notes'&&!window.confirm('Abandonner les modifications non enregistrées ?'))return;
    const old=activeWorkspace;
    const sequence=++transitionSequence;
    const direction=installedTabs().indexOf(id)>=installedTabs().indexOf(old)?1:-1;
    const stage=surface.querySelector('#neos-workspace-stage');
    workspaceScroll.set(old,root.scrollTop);
    if(motionEnabled()&&stage?.animate){
      try{
        const exit=stage.animate([{opacity:1,transform:'translate3d(0,0,0)',filter:'blur(0)'},{opacity:.07,transform:`translate3d(${-direction*24}px,0,0)`,filter:'blur(2px)'}],{duration:Math.round(160*motionFactor()),easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
        await exit.finished;
      }catch(error){ /* interrupted by a newer navigation */ }
    }
    if(sequence!==transitionSequence)return;
    ++moduleGeneration;
    activeWorkspace=id;
    render();
    root.scrollTop=workspaceScroll.get(id)||0;
    surface.querySelectorAll('[data-action="workspace"]').forEach(el=>{
      if(el.dataset.workspace===id)el.setAttribute('aria-current','page');
    });
    if(motionEnabled()){
      const incoming=surface.querySelector('#neos-workspace-stage');
      incoming?.animate?.([{opacity:0,transform:`translate3d(${direction*28}px,0,0)`,filter:'blur(3px)'},{opacity:1,transform:'translate3d(0,0,0)',filter:'blur(0)'}],{duration:Math.round(410*motionFactor()),easing:'cubic-bezier(.16,1,.3,1)'});
      animateIn(surface.querySelectorAll('#neos-workspace-stage .neos-card, #neos-workspace-stage .neos-module'),40,65);
    }
    if(id==='photos'&&photoState.status==='idle')void loadPhotos();
    if(id==='notes'&&notesState.status==='idle')void loadNotes();
    if(id==='deck'&&deckState.status==='idle')void loadDeck();
    if((id==='calendar'||id==='tasks'||id==='planning')&&groupware.status==='idle')void loadGroupware();
    else if((id==='calendar'||id==='planning')&&!demo&&(groupware.status==='loading'||!calendarWindowReady()))void loadGroupware(true);
    if(id==='planning')void loadPlanningDeck();
    if(id==='home'&&homeHasTasks()&&groupware.status==='idle')void loadGroupware();
    if(integrations[id]&&integrations[id].status==='idle')void loadIntegration(id);
  }
  function photoLightbox(index){
    const img=photoState.items[index];if(!img)return;
    popMode='photo';popHost.innerHTML=`<div class="neos-fullscreen-overlay" data-action="close-pop"><div class="neos-photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo en plein écran"><header><strong>${esc(img.name)}</strong><button class="neos-iconbtn" data-action="close-pop" aria-label="Fermer">${icon('close',18)}</button></header><div><img src="${safeUrl(img.previewUrl||img.davUrl)}" alt="${esc(img.name)}"></div><footer><span>${esc(img.folder||'')}</span><a href="${safeUrl(img.url||moduleLink('photos'))}" class="neos-btn">${icon('external',15)} Fichiers</a></footer></div></div>`;
    animateLayerOpen(popHost,'.neos-photo-lightbox','y');
  }

  function summaryWidget(now=new Date()) {
    const tasksKnown=groupware.status==='ready'&&groupware.taskSuccess>0;
    const partial=tasksKnown&&groupware.taskErrors?.length;
    const metric=(view,label)=>{
      const count=tasksKnown?groupware.tasks.filter(task=>taskMatchesView(task,view,now)).length:'—';
      return `<button type="button" class="neos-home-summary-metric" data-action="home-task-view" data-view="${view}"><strong>${count}</strong><span>${label}</span></button>`;
    };
    let status='';
    if(partial)status='Certaines listes de tâches n’ont pas été chargées.';
    else if(groupware.status==='loading'||groupware.status==='idle')status='Chargement des tâches…';
    else if(!tasksKnown)status='Aucun compteur de tâches disponible.';
    const next=(overview?.calendar||[]).filter(event=>Date.parse(event.start)>=+now)
      .sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))[0];
    const event=next?`<strong>${esc(next.title||'Sans titre')}</strong><small>${esc(fmtTime(next.start))}${next.calendar?' · '+esc(next.calendar):''}</small>`:
      '<small>Aucun événement à venir dans l’aperçu.</small>';
    return box('summary',`<div class="neos-home-summary-grid">${metric('today','À faire aujourd’hui')}${metric('overdue','En retard')}</div>${status?`<p class="neos-home-summary-status" role="status">${status}</p>`:''}<button type="button" class="neos-home-summary-event" data-action="workspace" data-workspace="planning"><span>Prochain événement</span>${event}<small>Voir le planning ${icon('chevron',14)}</small></button>`);
  }
  function homeHasTasks(){
    return ['tasks','summary'].some(widget=>!settings.hidden.includes(widget));
  }
  function recentFileAttributes(file){
    return `data-action="home-open-recent" data-folder="${esc(file.folder||'/')}" data-name="${esc(file.name)}" data-path="${esc(file.path||'')}" data-url="${esc(file.davUrl||'')}" data-mime="${esc(file.mime||'')}" data-size="${number(file.size)}"`;
  }
  async function openHomeRecent(file){
    const folder=file.folder||'/';
    await chooseWorkspace('files');
    if(activeWorkspace!=='files')return;
    if(folder!==browser.path||browser.loading)await browse(folder);
    if(activeWorkspace!=='files'||browser.path!==folder)return;
    const entry=browser.items.find(item=>item.kind==='file'&&(file.path?item.path===file.path:item.name===file.name));
    if(entry){await selectEntry(entry.path);return;}
    if(file.url&&safeUrl(file.url)!=='#'&&/^\/(?!\/)/.test(file.url)){
      await previewFromDav(file.url,file.name,file.mime,number(file.size),file.path||'');return;
    }
    toast('Ce fichier n’est plus disponible dans l’aperçu.','info');
  }
  function homeExplorerWidget(){
    const recent=(overview?.files||[]).slice(0,5);
    const pins=(settings.pins||[]).slice(0,4);
    const content=`<div class="neos-home-files-head"><div class="neos-home-file-stats"><strong>${browser.loading||browser.error?'—':number(browser.total)}</strong><span>${browser.loading?'Chargement du dossier…':browser.error?'Dossier indisponible':`éléments dans ${browser.path==='/'?'la racine':esc(browser.path)}`}</span></div><button type="button" class="neos-btn neos-btn-primary" data-action="workspace" data-workspace="files">${icon('arrow',16)} Ouvrir Fichiers</button></div>${pins.length?`<div class="neos-home-pins">${pins.map(path=>`<button type="button" data-action="home-open-folder" data-path="${esc(path)}">${icon('folder',15)} ${esc(path.split('/').pop())}</button>`).join('')}</div>`:''}<div class="neos-home-files-list">${recent.length?recent.map(f=>`<button type="button" class="neos-home-file" ${recentFileAttributes(f)}><span>${icon(String(f.mime||'').startsWith('image/')?'image':'file',17)}</span><strong title="${esc(f.name)}">${esc(f.name)}</strong><small>${humanSize(f.size)}</small>${icon('chevron',14)}</button>`).join(''):'<div class="neos-empty">Aucun fichier récent.</div>'}</div>`;
    return box('explorer',content,'Raccourcis');
  }

  function storageWidget(){
    const data=overview?.storage||{};
    if(data.used==null)return box('storage','<div class="neos-empty" role="status">Informations de stockage indisponibles.</div>');
    const knownQuota=data.total!=null && number(data.total)>0;
    const pct=knownQuota?Math.max(0,Math.min(100,number(data.percent))):null;
    const ringProgress=pct==null?58:pct;
    const used=humanSize(data.used);
    return box('storage', `<div class="neos-storage-console">
      <div class="neos-storage-values"><span class="neos-data-label">ESPACE UTILISÉ</span><div class="neos-stat-main">${used}</div><p class="neos-subtle">${knownQuota?`Sur ${humanSize(data.total)}`:'Quota illimité'}</p></div>
      <div class="neos-storage-orb" role="img" aria-label="${knownQuota?`${pct}% du quota utilisé`:'Espace sans limite définie'}"><svg viewBox="0 0 116 116" aria-hidden="true"><circle cx="58" cy="58" r="43" class="neos-orb-track"/><circle cx="58" cy="58" r="43" class="neos-orb-progress" style="--neos-circle-progress:${ringProgress};"/><circle cx="58" cy="58" r="28" class="neos-orb-inner"/><g class="neos-orb-dots"><circle cx="58" cy="10" r="2.2"/><circle cx="106" cy="58" r="2.2"/><circle cx="58" cy="106" r="2.2"/><circle cx="10" cy="58" r="2.2"/></g></svg><span class="neos-orb-value">${pct==null?'∞':`${Math.round(pct)}%`}</span></div>
    </div><div class="neos-storage-track"><div class="neos-meter ${pct==null?'neos-meter-unlimited':''}" role="progressbar" aria-label="Stockage utilisé" ${knownQuota?`aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"`:''}><span style="width:${pct==null?100:pct}%"></span></div><span class="neos-storage-track-hint">${knownQuota?'QUOTA':'SANS LIMITE'}</span></div>${data.volume&&number(data.volume.total)>0?`<div class="neos-storage-volume" title="${esc(data.volume.note||'Capacité du système de fichiers, pas capacité physique brute du NAS')}"><div class="neos-volume-heading"><strong>Volume de données</strong><span>${humanSize(data.volume.free)} libres</span></div><div class="neos-volume-progress" role="progressbar" aria-label="Occupation du volume Nextcloud" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.max(0,Math.min(100,number(data.volume.percent)))}"><span style="width:${Math.max(0,Math.min(100,number(data.volume.percent)))}%"></span></div><small>${humanSize(data.volume.used)} utilisés / ${humanSize(data.volume.total)} · système de fichiers</small></div>`:''}`);
  }
  function shortcutsWidget(){
    return box('shortcuts',hubGrid(true));
  }
  function clockWidget(){
    const tickMarks=Array.from({length:12},(_,i)=>`<line x1="62" y1="10" x2="62" y2="${i%3===0?18:15}" transform="rotate(${i*30} 62 62)"/>`).join('');
    return box('clock', `<div class="neos-holo-clock"><div class="neos-clock-details"><span class="neos-data-label"><i class="neos-clock-live"></i> HEURE LOCALE</span><div class="neos-clock" data-clock>--:--</div><div class="neos-subtle" data-clock-date>—</div></div><div class="neos-clock-dial"><div class="neos-clock-orbit"></div><svg viewBox="0 0 124 124" aria-hidden="true"><circle cx="62" cy="62" r="52" class="neos-dial-track"/><circle cx="62" cy="62" r="42" class="neos-dial-grid"/><g class="neos-dial-ticks">${tickMarks}</g><line class="neos-clock-hour-hand" data-holo-hour x1="62" y1="62" x2="62" y2="37"/><line class="neos-clock-minute-hand" data-holo-minute x1="62" y1="62" x2="62" y2="24"/><circle cx="62" cy="62" r="4" class="neos-clock-center"/></svg><span class="neos-clock-orbit-dot"></span></div></div>`);
  }
  function recentWidget(){
    const list = overview?.files || [];
    return box('files', list.length ? `<div class="neos-list">${list.map(f => `<button type="button" class="neos-item" ${recentFileAttributes(f)}><span class="neos-item-icon">${icon(String(f.mime||'').startsWith('image/') ? 'image' : 'file',16)}</span><span class="neos-item-title"><strong>${esc(f.name)}</strong><small>${esc(f.folder)} · ${ago(f.mtime)}</small></span><span class="neos-item-meta">${humanSize(f.size)}</span></button>`).join('')}</div>` : '<div class="neos-empty">Aucun fichier récent.</div>');
  }
  function calendarWidget(){
    const list = overview?.calendar || [];
    const content=list.length ? `<div class="neos-list">${list.map(x => `<div class="neos-item"><span class="neos-event-bar" style="background:${safeColor(x.color)}"></span><span class="neos-item-title"><strong>${esc(x.title)}</strong><small>${esc(x.calendar)}</small></span><span class="neos-item-meta">${fmtTime(x.start)}</span></div>`).join('')}</div>` : '<div class="neos-empty">Aucun événement à venir dans l’aperçu.</div>';
    return box('calendar',content+'<div class="neos-task-widget-footer"><button type="button" class="neos-btn" data-action="workspace" data-workspace="calendar">Ouvrir Agenda</button></div>','30 jours');
  }
  // Home and the Tasks module share the SAME CalDAV/virtual-Deck data.
  // The dashboard API provides an early fallback until the CalDAV scan completes.
  function homeTaskSelection(){
    const fresh=groupware.status==='ready'&&groupware.taskSuccess>0;
    const records=fresh?groupware.tasks.filter(t=>!t.done):[];
    const seen=new Set();
    const unique=(tasks,source)=>tasks.filter(t=>{
      const isDeck=source==='deck';
      const id=isDeck&&t.deckBoardId&&t.deckCardId?
        'deck:'+String(t.deckBoardId)+':'+String(t.deckCardId):
        (t.href?'caldav:'+String(t.href):'overview:'+String(t.title)+'|'+String(t.due||''));
      if(seen.has(id))return false;
      seen.add(id);return true;
    });
    const deck=unique(records.filter(t=>t.source==='deck'),'deck');
    const canonical=unique(records.filter(t=>t.source!=='deck'),'caldav');
    const dashboard=(overview?.tasks||[]).filter(t=>!t.done);
    // If one calendar is unreachable, keep the existing dashboard Tasks list.
    const caldav=fresh?canonical:unique(dashboard.filter(t=>t.source!=='deck'),'caldav');
    // A dashboard item without source metadata may actually be a Deck VTODO.
    // Once Deck records are available, prefer their stable board/card identity.
    const deckTitles=new Set(deck.map(t=>String(t.title||'').trim().toLowerCase()+'|'+String(t.due||'')));
    const regular=canonical.length?canonical:caldav.filter(t=>t.source==='caldav'||!deckTitles.has(String(t.title||'').trim().toLowerCase()+'|'+String(t.due||'')));
    // A compact widget must show BOTH sources even with many CalDAV tasks.
    const maximum=8;
    const deckReserve=Math.min(deck.length,4);
    const selected=[...deck.slice(0,deckReserve),...regular.slice(0,maximum-deckReserve)];
    const remaining=[...deck.slice(deckReserve),...regular.slice(maximum-deckReserve)];
    selected.push(...remaining.slice(0,maximum-selected.length));
    const sortTime=t=>{const value=Date.parse(String(t.due||''));return Number.isFinite(value)?value:Number.MAX_SAFE_INTEGER;};
    selected.sort((a,b)=>sortTime(a)-sortTime(b));
    const error=groupware.status==='error'?'Impossible de charger les tâches CalDAV. Ouvre le module Tâches pour le détail.':groupware.status==='ready'&&(groupware.taskErrors||[]).length?(groupware.taskSuccess===0?'Les listes de tâches CalDAV sont indisponibles.':'Certaines listes de tâches CalDAV sont indisponibles.')+' Ouvre le module Tâches pour le détail.':'';
    return {items:selected,total:regular.length+deck.length,deckCount:deck.length,loading:groupware.status==='loading',error};
  }
  function tasksWidget(){
    const data=homeTaskSelection();
    const entries=data.items.map(t=>{
      const isDeck=t.source==='deck';
      const canOpen=!!t.href;
      const target=canOpen?`data-action="home-task-open" data-href="${esc(t.href)}"`:'data-action="workspace" data-workspace="tasks"';
      return `<button type="button" class="neos-item neos-home-task-item" ${target} aria-label="Ouvrir ${isDeck?'la carte Deck':'la tâche'} ${esc(t.title||'Sans titre')}"><span class="neos-item-icon">${icon(isDeck?'kanban':'check',16)}</span><span class="neos-item-title"><strong>${esc(t.title||'Sans titre')}</strong><small>${isDeck?'<span class="neos-source neos-source-deck">Deck</span> ':''}${t.due?esc(fmtTime(t.due)):'Sans échéance'}</small></span>${icon('chevron',14)}</button>`;
    }).join('');
    const status=data.error?`<p class="neos-task-widget-status neos-task-widget-error" role="alert">${esc(data.error)}</p>`:data.loading?'<p class="neos-task-widget-status" role="status">Recherche des tâches…</p>':'';
    const notes=data.total>data.items.length?`<p class="neos-task-widget-status">${data.total-data.items.length} autre${data.total-data.items.length>1?'s':''} tâche${data.total-data.items.length>1?'s':''} dans le module Tâches.</p>`:'';
    const content=entries?`<div class="neos-list">${entries}</div>${status}${notes}`:data.error?status:`<div class="neos-empty">${data.loading?'Chargement des tâches…':'Aucune tâche ouverte.'}</div>`;
    return box('tasks',`${content}<div class="neos-task-widget-footer"><button type="button" class="neos-btn" data-action="workspace" data-workspace="tasks">${icon('arrow',16)} Ouvrir Tâches</button></div>`);
  }
  function linksWidget(){
    const list = settings.links || [];
    return box('links', list.length ? `<div class="neos-link-grid">${list.map(x => `<a href="${safeUrl(x.url)}" class="neos-link-card">${icon('link',15)}<span>${esc(x.title)}</span>${icon('open',14)}</a>`).join('')}</div>` : '<div class="neos-empty">Aucun lien.</div>');
  }
  function deckWidget(){
    let content='';
    const installed=availableApps().has('deck');
    if(!installed){content=`<div class="neos-widget-state">${icon('kanban',24)}<span>Deck n'est pas activé pour ce compte.</span></div>`;}
    else if(deckState.status==='idle'||deckState.status==='loading'){
      content='<div class="neos-widget-state"><span class="neos-spinner"></span><span>Chargement des tableaux…</span></div>';
    }else if(deckState.status==='error'){
      content=`<div class="neos-widget-state">${icon('alert',21)}<span>${esc(deckState.error||'Deck indisponible')}</span></div>`;
    }else{
      const boards=(deckState.boards||[]);
      content=boards.length?`<div class="neos-deck-widget-boards">${boards.slice(0,6).map((b,i)=>`<button type="button" class="neos-deck-board-row" data-action="deck-widget-open" data-board-id="${esc(b.id)}"><span class="neos-deck-board-symbol" style="--board-color:${['#39c9ff','#b88dff','#33dbb5','#f4b85b'][i%4]}">${icon('kanban',18)}</span><strong>${esc(b.title||'Tableau')}</strong><span>${icon('chevron',15)}</span></button>`).join('')}</div>`:'<div class="neos-widget-state">Aucun tableau disponible.</div>';
    }
    return box('deck',`${content}<div class="neos-deck-widget-footer"><button type="button" class="neos-btn" data-action="workspace" data-workspace="deck">${icon('arrow',16)} Ouvrir Deck</button></div>`,`${(deckState.boards||[]).length} tableaux`);
  }

  let homeNoteDraft=null;
  let homeNoteStatus='';
  function setHomeNoteStatus(message){
    homeNoteStatus=message;
    const status=surface.querySelector('[data-home-note-status]');
    if(status)status.textContent=message;
  }
  function notesWidget(){
    return box('notes', `<textarea id="neos-note" class="neos-note" aria-label="Note rapide" placeholder="Écrire une note rapide…" spellcheck="false">${esc(homeNoteDraft??settings.notes??'')}</textarea><div class="neos-note-tools"><span role="status" data-home-note-status>${esc(homeNoteStatus)}</span><button type="button" data-action="save-note" class="neos-btn">${icon('check',16)} Enregistrer</button></div>`);
  }

  function visibleFileEntries(){
    const term=browser.query.trim().toLocaleLowerCase('fr-FR');
    let items=browser.items.filter(x=>(browser.type==='all'||x.kind===browser.type)&&(!term||String(x.name).toLocaleLowerCase('fr-FR').includes(term)));
    if(browser.sort==='recent')items=[...items].sort((a,b)=>number(b.mtime)-number(a.mtime));
    else if(browser.sort==='size')items=[...items].sort((a,b)=>number(b.size)-number(a.size));
    else items=[...items].sort((a,b)=>(a.kind==='folder'?0:1)-(b.kind==='folder'?0:1)||String(a.name).localeCompare(String(b.name),'fr',{numeric:true}));
    return items;
  }
  function selectedEntries(){return browser.items.filter(item=>fileSelection.has(item.path));}
  function selectionToolbar(){
    const count=fileSelection.size;
    const all=visibleFileEntries();
    const clipboardCount=fileClipboard.entries.length;
    const currentClip=clipboardCount&&fileClipboard.mode==='cut'?'déplacer':'copier';
    return `<div class="neos-files-selectionbar ${count?'has-selection':''} ${fileBusy?'is-busy':''}" role="toolbar" aria-label="Actions groupées sur les fichiers">
      <div class="neos-selection-count"><span class="neos-selection-dot"></span><strong>${fileBusy?'Opération en cours…':count?`${count} sélectionné${count>1?'s':''}`:'Sélection multiple'}</strong><small>${browser.truncated?'Dossier partiellement affiché':`${all.length} éléments visibles`}</small></div>
      <div class="neos-selection-actions">
        <button type="button" class="neos-btn neos-btn-small" data-action="files-select-all" ${!all.length||fileBusy?'disabled':''}>${icon('check',15)} ${count?(all.every(x=>fileSelection.has(x.path))?'Tout désélectionner':'Tout sélectionner'):'Sélectionner'}</button>
        ${count?`<button type="button" class="neos-btn neos-btn-small" data-action="files-copy" ${fileBusy?'disabled':''}>${icon('copy',15)} Copier</button><button type="button" class="neos-btn neos-btn-small" data-action="files-cut" ${fileBusy?'disabled':''}>${icon('arrow',15)} Déplacer</button><button type="button" class="neos-btn neos-btn-small" data-action="files-duplicate" ${fileBusy?'disabled':''}>${icon('copy',15)} Dupliquer</button><button type="button" class="neos-btn neos-btn-small neos-target-action" data-action="files-copy-to" ${fileBusy?'disabled':''}>${icon('folder',15)} Copier vers…</button><button type="button" class="neos-btn neos-btn-small neos-target-action" data-action="files-move-to" ${fileBusy?'disabled':''}>${icon('arrow',15)} Déplacer vers…</button><button type="button" class="neos-btn neos-btn-small neos-danger-soft" data-action="files-delete" ${fileBusy?'disabled':''}>${icon('trash',15)} Supprimer</button><button type="button" class="neos-iconbtn" data-action="files-clear" title="Désélectionner" aria-label="Désélectionner">${icon('close',16)}</button>`:''}
        ${clipboardCount?`<button type="button" class="neos-btn neos-btn-small neos-clipboard-paste" data-action="files-paste" ${fileBusy?'disabled':''}>${icon('check',15)} Coller (${clipboardCount} · ${currentClip})</button><button type="button" class="neos-iconbtn" data-action="files-cancel-paste" title="Vider le presse-papiers Neos" aria-label="Vider le presse-papiers">${icon('close',16)}</button>`:''}
      </div>
    </div>`;
  }
  function refreshSelectionDisplay(){
    const results=surface.querySelector('#neos-file-results');
    if(results)results.innerHTML=browserItems();
    const toolbar=surface.querySelector('[data-selection-toolbar]');
    if(toolbar)toolbar.innerHTML=selectionToolbar();
  }
  function toggleFileSelection(path,shift=false,force=null){
    if(fileBusy)return;
    const entries=visibleFileEntries(), current=entries.findIndex(x=>x.path===path);
    if(current<0)return;
    if(shift&&fileAnchorPath){
      const anchor=entries.findIndex(x=>x.path===fileAnchorPath);
      if(anchor>=0){const a=Math.min(anchor,current),b=Math.max(anchor,current);entries.slice(a,b+1).forEach(x=>fileSelection.add(x.path));}
      else fileSelection.add(path);
    }else{
      if(force===true)fileSelection.add(path);
      else if(force===false)fileSelection.delete(path);
      else if(fileSelection.has(path))fileSelection.delete(path);
      else fileSelection.add(path);
    }
    fileAnchorPath=path;
    refreshSelectionDisplay();
  }
  function selectAllFiles(){
    if(fileBusy)return;
    const entries=visibleFileEntries();
    const allSelected=entries.every(x=>fileSelection.has(x.path));
    entries.forEach(x=>allSelected?fileSelection.delete(x.path):fileSelection.add(x.path));
    fileAnchorPath=entries.at(-1)?.path||'';
    refreshSelectionDisplay();
  }
  function browserItems() {
    if(browser.loading)return '<div class="neos-browser-state"><span class="neos-spinner"></span></div>';
    if(browser.error)return `<div class="neos-browser-state is-error">${icon('alert',20)}<strong>${esc(browser.error)}</strong></div>`;
    const items=visibleFileEntries();
    if(!items.length)return '<div class="neos-browser-state neos-drop-zone" data-drop-folder="'+esc(browser.path)+'">Aucun élément dans ce dossier · dépose des fichiers ici</div>';
    return `<div class="neos-file-list ${browser.view==='grid'?'is-grid':''}">${items.map(item=>{
      const pinned=(settings.pins||[]).includes(item.path);
      const active=preview.entry?.path===item.path;
      const selected=fileSelection.has(item.path);
      const title=item.kind==='folder'?`Ouvrir ${item.name}`:`Prévisualiser ${item.name}`;
      const action=item.kind==='folder'?'browse-path':'select-entry';
      const thumb=item.kind==='file'&&isImage(item)&&item.previewUrl?`<img class="neos-thumb" loading="lazy" alt="" src="${safeUrl(item.previewUrl)}">`:'';
      return `<div class="neos-file-row ${active?'is-active':''} ${selected?'is-selected':''} ${item.kind==='folder'?'is-folder':'is-file'}" draggable="${!fileBusy}" data-file-row="${esc(item.path)}" ${item.kind==='folder'?`data-drop-folder="${esc(item.path)}"`:''}>
        <label class="neos-file-select" title="Sélectionner ${esc(item.name)}"><input type="checkbox" data-file-checkbox data-path="${esc(item.path)}" aria-label="Sélectionner ${esc(item.name)}" ${selected?'checked':''} ${fileBusy?'disabled':''}><span></span></label>
        <button type="button" class="neos-file-main" data-action="${action}" data-path="${esc(item.path)}" title="${esc(title)}">
          <span class="neos-file-symbol">${thumb||icon(item.kind==='folder'?'folder':isImage(item)?'image':isPdf(item)?'file':isOffice(item)?'sheet':'file',18)}</span>
          <span class="neos-file-label"><strong>${esc(item.name)}</strong><small>${item.kind==='folder'?'Dossier':esc(item.mime||'Fichier')} · ${ago(item.mtime)}</small></span>
          <span class="neos-file-size">${item.kind==='folder'?'—':humanSize(item.size)}</span>
        </button>
        <div class="neos-file-actions">
          <button type="button" class="neos-iconbtn neos-favorite-toggle ${favoritePaths.has(item.path)?'is-on':''}" data-action="toggle-favorite" data-path="${esc(item.path)}" aria-pressed="${favoritePaths.has(item.path)}" title="${favoritePaths.has(item.path)?'Retirer des favoris Nextcloud':'Ajouter aux favoris Nextcloud'}" aria-label="${favoritePaths.has(item.path)?'Retirer des favoris':'Ajouter aux favoris'} : ${esc(item.name)}">${icon('star',15)}</button>
          ${item.kind==='folder'?`<button type="button" class="neos-iconbtn ${pinned?'is-on':''}" data-action="pin-folder" data-path="${esc(item.path)}" title="${pinned?'Retirer du raccourci Accueil':'Épingler à l’Accueil'}" aria-label="${pinned?'Retirer de l’Accueil':'Épingler à l’Accueil'} : ${esc(item.name)}">${icon('home',15)}</button>`:''}
          <button type="button" class="neos-iconbtn" data-action="file-menu" data-path="${esc(item.path)}" title="Actions" aria-label="Actions sur ${esc(item.name)}">${icon('more',16)}</button>
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  function inlinePdfUrl(entry){
    if(!entry?.path||!root.dataset.inlinePdfUrl)return '';
    const url=new URL(root.dataset.inlinePdfUrl,window.location.href);
    url.searchParams.set('path',entry.path);
    return url.pathname+url.search;
  }
  function previewPane() {
    const entry=preview.entry;
    const hasFile=entry?.kind==='file';
    const actions=entry?`<div class="neos-preview-actions">
      ${hasFile&&entry.davUrl?`<button type="button" class="neos-iconbtn" data-action="download-selected" title="Télécharger" aria-label="Télécharger">${icon('download',16)}</button><button type="button" class="neos-iconbtn" data-action="share-selected" title="Créer un lien public" aria-label="Créer un lien public">${icon('link',16)}</button><button type="button" class="neos-iconbtn" data-action="copy-selected-link" title="Copier le lien interne" aria-label="Copier le lien interne">${icon('copy',16)}</button>`:''}
      ${hasFile&&isMarkdown(entry)?`<button type="button" class="neos-iconbtn" data-action="preview-markdown" title="${markdownPreview?'Voir le code Markdown':'Voir le rendu Markdown'}" aria-label="Changer la vue Markdown">${icon('note',16)}</button>`:''}
      ${hasFile?`<button type="button" class="neos-iconbtn" data-action="expand-preview" title="Agrandir" aria-label="Agrandir l'aperçu">${icon('expand',16)}</button>`:''}
      ${entry.url?`<a class="neos-iconbtn" href="${safeUrl(entry.url)}" title="Ouvrir dans Fichiers">${icon('external',16)}</a>`:''}
    </div>`:'';
    const head=entry?`<div class="neos-preview-head"><div class="neos-preview-title"><small>APERÇU</small><strong title="${esc(entry.name)}">${esc(entry.name)}</strong><span>${esc(entry.mime||'Fichier')} ${entry.kind==='file'?'· '+humanSize(entry.size):''}</span></div>${actions}</div>`:`<div class="neos-preview-head"><div class="neos-preview-title"><small>APERÇU</small><strong>—</strong></div></div>`;
    let body=`<div class="neos-preview-empty"><span class="neos-empty-symbol">${icon('file',32)}</span><span>Aperçu du fichier</span><small>Sélectionner un élément dans la liste</small></div>`;
    if(preview.status==='loading')body=`<div class="neos-preview-loading"><span class="neos-spinner"></span></div>`;
    else if(preview.status==='error')body=`<div class="neos-preview-empty">${icon('alert',22)}<span>${esc(preview.error||'Prévisualisation indisponible')}</span></div>`;
    else if(entry){
      if(entry.kind==='folder')body=`<div class="neos-folder-preview"><div class="neos-folder-emblem">${icon('folder',42)}</div><div class="neos-preview-meta"><span>Chemin</span><code>${esc(entry.path)}</code></div></div>`;
      else if(preview.mode==='image')body=`<div class="neos-image-preview"><img src="${safeUrl(entry.previewUrl||entry.davUrl||'')}" alt="${esc(entry.name)}" loading="eager" data-dav-fallback="${safeUrl(entry.davUrl||'')}"></div>`;
      else if(preview.mode==='text')body=isMarkdown(entry)&&markdownPreview?`<article class="neos-markdown-preview">${markdownHtml(preview.text)}</article>`:`<pre class="neos-text-preview">${esc(preview.text)}</pre>`;
      else if(preview.mode==='audio')body=`<div class="neos-media-preview"><span class="neos-media-emblem">${icon('play',38)}</span><strong>${esc(entry.name)}</strong><audio controls preload="metadata" src="${safeUrl(entry.davUrl)}">Ton navigateur ne peut pas lire ce fichier audio.</audio><small>La lecture dépend du format et du navigateur.</small></div>`;
      else if(preview.mode==='video')body=`<div class="neos-media-preview neos-video-preview"><video controls playsinline preload="metadata" src="${safeUrl(entry.davUrl)}">Ton navigateur ne peut pas lire cette vidéo.</video><small>Lecture intégrée si le codec est pris en charge.</small></div>`;
      else if(preview.mode==='table')body=`<div class="neos-table-preview"><table>${preview.rows.map((row,i)=>`<tr>${row.map(cell=>i===0?`<th>${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</table></div>`;
      else if(preview.mode==='pdf'){
        const src=inlinePdfUrl(entry);
        body=src?`<div class="neos-pdf-container"><iframe class="neos-pdf-preview" title="PDF ${esc(entry.name)}" referrerpolicy="same-origin" loading="lazy" src="${safeUrl(src)}"></iframe><div class="neos-pdf-fallback"><span>Si l’aperçu ne charge pas :</span><a href="${safeUrl(src)}" target="_blank" rel="noopener noreferrer">Ouvrir le PDF</a>${entry.url?`<a href="${safeUrl(entry.url)}">Ouvrir dans Fichiers</a>`:''}</div></div>`:
          `<div class="neos-preview-empty">Aperçu PDF indisponible dans cette vue. Ouvre le fichier depuis l'explorateur.</div>`;
      }
      else if(preview.mode==='office')body=`<div class="neos-office-preview"><div class="neos-office-illustration">${icon('sheet',42)}</div><strong>${esc(entry.name)}</strong><span>Document Office</span>${entry.previewUrl?`<img loading="lazy" src="${safeUrl(entry.previewUrl)}" alt="Aperçu si disponible" class="neos-office-thumb" data-hide-on-error="1">`:''}<a href="${safeUrl(entry.url)}" class="neos-btn neos-btn-primary">${icon('external',15)} Ouvrir dans Office</a></div>`;
      else body=`<div class="neos-preview-empty">${icon('file',28)}<span>Pas d'aperçu pour ce format</span></div>`;
    }
    return `<aside class="neos-preview" data-preview-pane>${head}<div class="neos-preview-body">${body}</div><div class="neos-preview-foot"><span>${entry?esc(entry.path||'/'):'Lecture seule'}</span><span>${hasFile?'↑ Aperçu':'Fichiers / Neos'}</span></div></aside>`;
  }
  function renderPreview() {
    const node=surface.querySelector('[data-preview-pane]');
    if(node){node.outerHTML=previewPane();animatePreview();}
    surface.querySelectorAll('.neos-file-row').forEach(el=>{
      const path=el.querySelector('[data-path]')?.dataset.path;
      el.classList.toggle('is-active',Boolean(path&&path===preview.entry?.path));
    });
    if(fullPreview)renderFullPreview();
  }

  function explorerWidget() {
    const pins = (settings.pins || []).slice(0, 12);
    return box('explorer', `<div class="neos-browser-shell">
      <div class="neos-browser-tools">
        <div class="neos-breadcrumb"><button class="neos-iconbtn neos-nav-btn" data-action="history-back" title="Retour" aria-label="Retour" ${historyIndex===0?'disabled':''}>${icon('back',16)}</button><button class="neos-iconbtn neos-nav-btn" data-action="history-forward" title="Suivant" aria-label="Suivant" ${historyIndex>=history.length-1?'disabled':''}>${icon('forward',16)}</button><span class="neos-breadcrumb-items" data-drop-folder="${esc(browser.path)}" title="Déposer dans ce dossier">${breadcrumb()}</span><span class="neos-browser-total">${browser.loading?'…':browser.total+' élément'+(browser.total>1?'s':'')}</span></div>
        <div class="neos-browser-actions">
          ${pins.length ? `<div class="neos-pins">${pins.map(p => `<button type="button" class="neos-pin" data-action="browse-path" data-path="${esc(p)}">${icon('folder',13)} ${esc(p.split('/').pop())}</button>`).join('')}</div>` : ''}
          <label class="neos-search">${icon('search',16)}<input type="search" data-browser-search value="${esc(browser.query)}" placeholder="Rechercher dans ce dossier" aria-label="Rechercher dans ce dossier"><kbd>/</kbd></label>
          <button type="button" class="neos-btn neos-global-search-trigger" data-action="global-search" data-tab="search" title="Rechercher dans tous mes dossiers">${icon('search',15)} Partout</button>
          <button type="button" class="neos-btn neos-quick-trigger" data-action="global-search" data-tab="favorites">${icon('star',15)} Favoris</button>
          <button type="button" class="neos-btn neos-quick-trigger" data-action="global-search" data-tab="recent">${icon('clock',15)} Consultés</button>
          <select data-browser-type><option value="all" ${browser.type==='all'?'selected':''}>Tout</option><option value="folder" ${browser.type==='folder'?'selected':''}>Dossiers</option><option value="file" ${browser.type==='file'?'selected':''}>Fichiers</option></select>
          <select data-browser-sort><option value="name" ${browser.sort==='name'?'selected':''}>Nom</option><option value="recent" ${browser.sort==='recent'?'selected':''}>Récents</option><option value="size" ${browser.sort==='size'?'selected':''}>Taille</option></select>
          <button type="button" class="neos-btn" data-action="new-folder">${icon('folder',15)} Nouveau dossier</button>
          <button type="button" class="neos-btn" data-action="upload-trigger">${icon('upload',15)} Téléverser</button>
          <button type="button" class="neos-iconbtn" data-action="toggle-view" title="Changer la vue">${icon(browser.view === 'grid' ? 'list' : 'grid',16)}</button>
          <button type="button" class="neos-iconbtn" data-action="reload-folder" title="Recharger ce dossier">${icon('refresh',16)}</button>
          <a class="neos-btn" href="${safeUrl(filesHomeUrl())}">${icon('external',15)} Fichiers</a>
          <input type="file" data-upload-input hidden multiple>
        </div>
      </div>
      <div data-selection-toolbar>${selectionToolbar()}</div>
      <div class="neos-browser-main"><div class="neos-browser-list-wrap neos-drop-zone" data-drop-folder="${esc(browser.path)}"><div class="neos-list-caption"><span>Nom</span><span>Modifié</span><span>Taille</span></div><div id="neos-file-results">${browserItems()}</div>${browser.truncated?`<div class="neos-truncated"><span role="status">${browser.items.length} sur ${browser.total} · Recherche et tri sur les éléments chargés.</span> ${browser.nextOffset?`<button class="neos-btn" type="button" data-action="files-more" ${browser.moreLoading||fileBusy?'disabled':''}>${browser.moreLoading?'Chargement…':'Afficher la suite'}</button>`:''}</div>`:''}${browser.moreError?`<p role="alert">${esc(browser.moreError)}</p>`:''}</div>${previewPane()}</div>
    </div>`, browser.path);
  }

  function filesWorkspace(){
    return `<div class="neos-files-workspace">${explorerWidget()}</div>`;
  }
  function homeWorkspace(widgets){
    const visible=settings.order.filter(id=>!settings.hidden.includes(id)&&(id!=='shortcuts'||settings.launcherMode==='widget'));
    const homeWidgets={...widgets,explorer:homeExplorerWidget};
    return `${editing?`<div class="neos-editbar neos-layout-toolbar"><div class="neos-layout-toolbar-heading"><span class="neos-layout-pulse"></span><strong>Mode disposition</strong><small>Déplace, redimensionne et remplis les espaces</small></div><div class="neos-layout-toolbar-actions"><button type="button" class="neos-layout-toggle ${settings.gridMode==='adaptive'?'is-active':''}" data-action="grid-mode" data-mode="adaptive">Adaptatif</button><button type="button" class="neos-layout-toggle ${settings.gridMode==='manual'?'is-active':''}" data-action="grid-mode" data-mode="manual">Libre</button><button type="button" class="neos-btn neos-btn-primary" data-action="finish-arrange">${icon('check',16)} Terminer</button></div></div>`:''}${editing?`<div class="neos-grid-legend" aria-hidden="true"><span class="neos-grid-legend-dot"></span> GRILLE 12 COLONNES <span class="neos-grid-legend-divider"></span> DÉPOSE SUR UNE CARTE POUR RÉORGANISER <span class="neos-grid-legend-flex"></span> ${settings.gridMode==='manual'?'DIMENSIONS LIBRES':'TAILLES ADAPTATIVES'}</div>`:''}<div class="neos-grid-cards neos-home-grid ${editing?'neos-arranging':''}" data-grid-mode="${esc(settings.gridMode||'adaptive')}">${visible.map(id=>homeWidgets[id]?homeWidgets[id]():'').join('')}</div>${editing?`<div class="neos-layout-announce" role="status" aria-live="polite">${esc(layoutAnnounce||'Déplacement et tailles enregistrés automatiquement.')}</div>`:''}`;
  }

  // Dense 12-column grid. The cards are measured by their content and assigned
  // short implicit rows, so a tall widget no longer stretches an entire row.
  function scheduleMasonry(){
    if(masonryFrame)cancelAnimationFrame(masonryFrame);
    masonryFrame=requestAnimationFrame(()=>{masonryFrame=0;layoutMasonry();});
  }
  function layoutMasonry(){
    const grid=surface.querySelector('.neos-home-grid');if(!grid)return;
    const cards=[...grid.querySelectorAll(':scope > .neos-card')];
    const narrow=window.matchMedia('(max-width:700px)').matches;
    if(narrow){
      cards.forEach(card=>{card.style.gridRowEnd='auto';card.style.minHeight='';});
      return;
    }
    const style=getComputedStyle(grid);const rowHeight=Number.parseFloat(style.gridAutoRows)||8;
    const rowGap=Number.parseFloat(style.rowGap)||14;
    const pxPerRow=rowHeight+rowGap;
    for(const card of cards){
      // Measure content rather than the stretched grid slot.
      card.style.gridRowEnd='span 1';
      card.style.minHeight='';
      const head=card.querySelector(':scope > .neos-card-head');
      const body=card.querySelector(':scope > .neos-card-body');
      const cs=getComputedStyle(card);
      const marginHead=head?Number.parseFloat(getComputedStyle(head).marginBottom)||0:0;
      const natural=(head?.scrollHeight||0)+(body?.scrollHeight||0)+marginHead+
        (Number.parseFloat(cs.paddingTop)||0)+(Number.parseFloat(cs.paddingBottom)||0)+2;
      const chosen=widgetMinHeight(card.dataset.widget);
      const height=Math.max(natural, chosen, 112);
      const rows=Math.max(1,Math.ceil((height+rowGap)/pxPerRow));
      card.style.gridRowEnd=`span ${rows}`;
      card.style.minHeight=`${height}px`;
    }
  }
  window.addEventListener('resize',()=>{if(activeWorkspace==='home')scheduleMasonry();positionTabSlider();},{passive:true});

  function render() {
    const pillFrom=previousTabPosition();
    applyTheme();
    const warnings=overview?.warnings||[];
    const activeTopApps=settings.launcherMode==='topbar' ? topApps() : [];
    const widgets={explorer:explorerWidget,storage:storageWidget,shortcuts:shortcutsWidget,clock:clockWidget,files:recentWidget,calendar:calendarWidget,tasks:tasksWidget,summary:summaryWidget,links:linksWidget,notes:notesWidget,deck:deckWidget};
    // One launcher placement at a time: topbar OR widget. The Apps button opens the full catalogue.
    const visible = settings.order.filter(id=>!settings.hidden.includes(id) && (id!=='shortcuts'||settings.launcherMode==='widget'));
    surface.innerHTML=`<main class="neos-shell"><div class="neos-layout">
      <a class="neos-skip-link" href="#neos-workspace-stage">Aller au contenu de Neos</a>
      <header class="neos-topbar">
        <div class="neos-brand"><span class="neos-brand-mark">${brandMark()}</span></div>
        <button type="button" class="neos-topsearch" data-action="global-search" title="Rechercher dans tous mes dossiers"><span>${icon('search',16)}</span><span>Recherche · Favoris · Récents</span><kbd>Ctrl K</kbd></button>
        <div class="neos-top-actions"><span class="neos-header-readout" data-clock>--:--</span><button type="button" class="neos-btn neos-hub-trigger" data-action="toggle-hub" title="Applications">${icon('grid',17)}<span>Applications</span></button><button type="button" class="neos-iconbtn" data-action="refresh" title="Actualiser" aria-label="Actualiser">${icon('refresh',17)}</button><button type="button" class="neos-btn neos-btn-primary" data-action="customize" aria-label="${editing ? 'Terminer' : 'Personnaliser'}">${icon(editing?'check':'settings',17)}<span>${editing?'Terminer':'Personnaliser'}</span></button></div>
      </header>
      ${tabBar()}
      <div id="neos-workspace-stage" class="neos-workspace-stage" tabindex="-1" data-active-workspace="${esc(activeWorkspace)}">
        ${workspaceHero()}
        ${(activeWorkspace==='files'||activeWorkspace==='home')&&warnings.length?`<div class="neos-warning">${icon('info',16)} ${esc(warnings[0])}</div>`:''}
        ${activeWorkspace==='home'?homeWorkspace(widgets):activeWorkspace==='files'?filesWorkspace():currentModule()}
      </div>
      <footer class="neos-footer"><span>NEOS 0.7.0</span><span>Nextcloud 35</span></footer>
    </div></main>`;
    updateClock();
    positionTabSlider(pillFrom);
    if(activeWorkspace==='home')scheduleMasonry();
    if(!hasEntered){hasEntered=true;animateIn(surface.querySelectorAll('.neos-topbar,.neos-card'),42,35);}
  }

  function updateClock() {
    const date = new Date();
    surface.querySelectorAll('[data-clock]').forEach(el => el.textContent = new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(date));
    surface.querySelectorAll('[data-clock-date]').forEach(el => el.textContent = new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date));
    const minuteAngle=(date.getMinutes()+date.getSeconds()/60)*6;
    const hourAngle=(date.getHours()%12+date.getMinutes()/60)*30;
    surface.querySelectorAll('[data-holo-minute]').forEach(el=>el.style.transform=`rotate(${minuteAngle}deg)`);
    surface.querySelectorAll('[data-holo-hour]').forEach(el=>el.style.transform=`rotate(${hourAngle}deg)`);
  }

  function choosePreviewCandidate() {
    const current = preview.entry?.path && browser.items.find(x => x.path === preview.entry.path);
    if (current) return current;
    return browser.items.find(x => x.kind === 'file') || browser.items[0] || null;
  }

  async function requestFilePage(path,offset=0,foldersOnly=false){
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
  async function browse(path, resetQuery=true, recordHistory=true) {
    if (!path || !path.startsWith('/') || path.includes('\\') || path.split('/').slice(1).some(x=>x==='..'||x==='.')) return;
    ++previewGeneration;
    preview.entry=null;preview.status='empty';preview.mode='empty';
    if(recordHistory&&path!==history[historyIndex]){
      history.splice(historyIndex+1);
      history.push(path);
      if(history.length>25)history.shift();
      historyIndex=history.length-1;
    }
    if(path!==browser.path){fileSelection.clear();fileAnchorPath='';}
    browser.path = path;
    if (resetQuery) browser.query = '';
    browser.loading = true;
    browser.nextOffset=null;browser.moreLoading=false;browser.moreError='';
    browser.error = '';
    render();
    const g = ++browseGeneration;
    try {
      const data=await requestFilePage(path);
      if (g !== browseGeneration) return;
      browser.path = data.path || path;
      browser.davUrl = data.davUrl || '';
      browser.items = Array.isArray(data.items) ? data.items : [];
      browser.canCreate = data.canCreate !== false;
      for(const path of [...fileSelection])if(!browser.items.some(item=>item.path===path))fileSelection.delete(path);
      browser.total = number(data.total);
      browser.nextOffset=nextFileOffset(data);
      browser.truncated = browser.nextOffset!==null||Boolean(data.truncated);
      browser.limit = number(data.limit) || 160;
      browser.filesUrl = data.filesUrl || '#';
      browser.loading = false;
      browser.error = '';
      render();
      const candidate = choosePreviewCandidate();
      if (candidate?.kind === 'file') void selectEntry(candidate.path, true);
      else if(candidate){preview.entry=candidate;preview.mode='folder';preview.status='ready';renderPreview();}
      animateRows();
      if(favoriteState.status==='idle')void loadFavorites();
    } catch (error) {
      if (g !== browseGeneration) return;
      console.error('[Neos] dossier indisponible', error);
      browser.loading = false;
      browser.error = 'Impossible de charger ce dossier.';
      render();
    }
  }

  async function previewFromDav(url,name,mime,size=0,path=''){
    if(!url||!(/^\/(?!\/)/.test(url)))return;
    ++previewGeneration;
    preview.entry={name,mime,kind:'file',davUrl:url,url:filesHomeUrl(),size,path};
    if(path)recordRecent(preview.entry);
    preview.mode=isPdf({name,mime})?'pdf':isImage({mime})?'image':isVideo({name,mime})?'video':isAudio({name,mime})?'audio':'meta';preview.status='ready';preview.error='';
    renderPreview();
    if(isText({name,mime})&&!isCsv({name,mime})&&size<=2*1024*1024){
      preview.status='loading';renderPreview();const g=++previewGeneration;
      try{
        const r=await fetch(url,{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);
        const value=await r.text();if(g!==previewGeneration)return;
        preview.text=value.slice(0,160000);preview.mode='text';preview.status='ready';
      }catch(e){if(g!==previewGeneration)return;preview.status='error';preview.error='Lecture impossible';}renderPreview();
    }
  }
  function parseDelimited(text,delimiter){
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length&&rows.length<60;i++){
      const c=text[i];
      if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
      else if(c===delimiter&&!quoted){row.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row.slice(0,20));row=[];cell='';}
      else cell+=c;
    }
    if(row.length||cell){row.push(cell);rows.push(row.slice(0,20));}
    return rows.slice(0,60);
  }
  async function selectEntry(path, silent=false){
    const entry=browser.items.find(x=>x.path===path);if(!entry)return;
    if(entry.kind==='file'&&!silent)recordRecent(entry);
    const g=++previewGeneration;
    preview.entry=entry;preview.text='';preview.rows=[];preview.error='';
    if(entry.kind==='folder'){preview.mode='folder';preview.status='ready';renderPreview();return;}
    preview.status='loading';preview.mode='meta';renderPreview();
    try{
      if(isImage(entry)){preview.status='ready';preview.mode='image';}
      else if(isVideo(entry)){preview.status='ready';preview.mode='video';}
      else if(isAudio(entry)){preview.status='ready';preview.mode='audio';}
      else if(isPdf(entry)){preview.status='ready';preview.mode='pdf';}
      else if(isOffice(entry)){preview.status='ready';preview.mode='office';}
      else if(isText(entry)){
        if(number(entry.size)>2*1024*1024){preview.status='error';preview.error='Fichier trop volumineux pour un aperçu texte';}
        else{
          const r=await fetch(entry.davUrl,{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);
          const value=(await r.text()).slice(0,180000);if(g!==previewGeneration)return;
          if(isCsv(entry)){
            const delimiter=ext(entry.name)==='tsv'?'\t':((value.match(/;/g)||[]).length>(value.match(/,/g)||[]).length?';':',');
            preview.rows=parseDelimited(value,delimiter);preview.mode='table';
          }else{preview.text=value;preview.mode='text';}
          preview.status='ready';
        }
      }else{preview.status='ready';preview.mode='meta';}
    }catch(error){if(g!==previewGeneration)return;console.error('[Neos] aperçu indisponible',error);preview.status='error';preview.error='Aperçu indisponible';}
    if(g===previewGeneration)renderPreview();
  }
  function openInFiles(entry){if(entry?.url)window.location.assign(entry.url);}
  async function copyCurrentLink(entry){
    if(!entry?.url)return;
    try{await navigator.clipboard.writeText(new URL(entry.url,window.location.href).href);toast('Lien copié','success');}
    catch(e){toast('Copie impossible','error');}
  }
  function downloadCurrent(entry){
    if(!entry?.davUrl)return;
    const anchor=document.createElement('a');anchor.href=entry.davUrl;anchor.download=entry.name||'';anchor.rel='noreferrer';
    document.body.appendChild(anchor);anchor.click();anchor.remove();
  }
  const ncWebroot=()=>window.OC?.getRootPath?.()||'';
  const davJoin=(base,name)=>`${String(base||'').replace(/\/+$/,'')}/${String(name||'').split('/').map(part=>encodeURIComponent(part)).join('/')}`;
  async function davRequest(method,url,{headers={},body}={}){
    const response=await fetch(url,{method,body,credentials:'same-origin',cache:'no-store',headers:{requesttoken:csrfToken(),'X-Requested-With':'XMLHttpRequest',...headers}});
    if(!response.ok&&![201,204,207].includes(response.status))throw new Error(`HTTP ${response.status}`);
    return response;
  }
  // File Manager Pro — native Nextcloud WebDAV operations. Mutations are always
  // non-overwriting; the server decides whether the user has sufficient rights.
  function davRoot(){
    if(!browser.davUrl)return '';
    try{
      const current=new URL(browser.davUrl,window.location.href);
      if(current.origin!==window.location.origin)return '';
      const marker='/remote.php/dav/files/';
      const i=current.pathname.indexOf(marker);
      if(i<0)return '';
      const rest=current.pathname.slice(i+marker.length),uid=rest.split('/')[0];
      return uid?current.origin+current.pathname.slice(0,i+marker.length)+uid:'';
    }catch{return '';}
  }
  function validFileFolderPath(path){
    return typeof path==='string'&&path.startsWith('/')&&path.length<=1024&&(path==='/'||(!path.includes('\\')&&
      !/[\x00-\x1f\x7f]/.test(path)&&!path.split('/').some((p,i)=>i>0&&(p==='.'||p==='..'||p===''))));
  }
  function davFolderUrl(path){
    if(!validFileFolderPath(path))return '';
    const base=davRoot();if(!base)return '';
    return base+(path==='/'?'':path.split('/').slice(1).map(encodeURIComponent).reduce((a,b)=>a+'/'+b,''));
  }
  function sameOrChild(candidate,parent){return candidate===parent||candidate.startsWith(parent+'/');}
  function filenameCopyName(name,number){
    const i=name.lastIndexOf('.');
    const stem=i>0?name.slice(0,i):name,extension=i>0?name.slice(i):'';
    return `${stem} (copie${number>1?' '+number:''})${extension}`;
  }
  function rememberFiles(mode,entries){
    if(fileBusy||!entries.length)return;
    fileClipboard.mode=mode;
    fileClipboard.entries=entries.map(x=>({path:x.path,name:x.name,kind:x.kind,davUrl:x.davUrl}));
    fileSelection.clear();fileAnchorPath='';refreshSelectionDisplay();
    toast(`${entries.length} élément${entries.length>1?'s':''} à ${mode==='cut'?'déplacer':'copier'} — ouvre le dossier cible puis clique Coller`,'success');
  }
  function copyOrCutFiles(mode,entries=selectedEntries()){rememberFiles(mode,entries);}
  function busyFiles(active){fileBusy=active;const toolbar=surface.querySelector('[data-selection-toolbar]');if(toolbar)toolbar.innerHTML=selectionToolbar();}
  function summarizeFiles(operation,done,conflicts,errors){
    const parts=[`${operation} : ${done} réussi${done>1?'s':''}`];
    if(conflicts)parts.push(`${conflicts} conflit${conflicts>1?'s':''} (non remplacé${conflicts>1?'s':''})`);
    if(errors)parts.push(`${errors} erreur${errors>1?'s':''}`);
    toast(parts.join(' · '),conflicts||errors?'error':'success');
  }
  async function transferFiles(entries,targetFolder,mode){
    if(fileBusy||!entries?.length)return;
    if(demo){toast('Opération désactivée dans l’aperçu','error');return;}
    const targetBase=davFolderUrl(targetFolder);
    if(!targetBase){toast('Dossier de destination inaccessible','error');return;}
    const operations=entries.filter(x=>x&&x.davUrl&&x.path&&x.name);
    if(!operations.length)return;
    // Prevent drag/move of a folder into itself or a descendant, and do not
    // silently turn a no-op move to the same folder into a destructive action.
    if(operations.some(x=>x.kind==='folder'&&sameOrChild(targetFolder,x.path))){toast('Impossible de déplacer/copier un dossier dans lui-même ou un sous-dossier','error');return;}
    const moving=mode==='cut',method=moving?'MOVE':'COPY';
    busyFiles(true);let done=0,conflicts=0,errors=0;
    const failed=[];
    for(const entry of operations){
      const sourceFolder=entry.path.slice(0,entry.path.lastIndexOf('/'))||'/';
      if(moving&&sourceFolder===targetFolder){done++;continue;}
      let success=false,conflict=false;
      for(let attempt=0;attempt<(moving?1:30);attempt++){
        // Copying in the same folder must use a new name; for other folders,
        // try original first, then auto-rename if a non-overwrite conflict occurs.
        const name=attempt===0&&sourceFolder!==targetFolder?entry.name:filenameCopyName(entry.name,sourceFolder===targetFolder?attempt+1:attempt);
        const destination=new URL(davJoin(targetBase,name),window.location.href);
        if(destination.origin!==window.location.origin){errors++;break;}
        try{
          await davRequest(method,entry.davUrl,{headers:{Destination:destination.href,Overwrite:'F'}});
          done++;success=true;break;
        }catch(error){
          const isConflict=/HTTP (409|412)/.test(String(error));
          if(isConflict){conflict=true;if(!moving&&attempt<29)continue;conflicts++;}
          else errors++;
          console.warn('[Neos] transfert refusé',method,entry.name,error);
          break;
        }
      }
      if(!success)failed.push(entry);
    }
    if(moving&&fileClipboard.mode==='cut'){
      fileClipboard.entries=failed;
      if(!failed.length)fileClipboard.mode='';
    }
    busyFiles(false);fileSelection.clear();fileAnchorPath='';
    summarizeFiles(moving?'Déplacement':'Copie',done,conflicts,errors);
    await browse(browser.path,false,false);
    refreshSelectionDisplay();
  }
  // Destination chooser: calls the existing Neos directory endpoint, which enforces
  // user access through Nextcloud. No extra server route or privileged token.
  function renderFolderPicker(){
    if(popMode!=='destination'||!pickerState)return;
    const focused=popHost.contains(document.activeElement)?document.activeElement:null;
    const searchFocused=focused?.matches?.('[data-destination-search]')||false;
    const selection=searchFocused?[focused.selectionStart,focused.selectionEnd]:null;
    const folderPath=focused?.matches?.('.neos-destination-folder')?focused.dataset.path:null;
    const p=pickerState;
    const parts=p.path.split('/').filter(Boolean);
    const title=p.mode==='cut'?'Déplacer vers…':'Copier vers…';
    const destinations=p.folders.filter(x=>x.name.toLocaleLowerCase('fr').includes(p.search.toLocaleLowerCase('fr')));
    popHost.innerHTML=`<div class="neos-pop-layer neos-destination-layer" data-action="close-pop"><section class="neos-destination-dialog neos-framed" role="dialog" aria-modal="true" aria-labelledby="neos-destination-heading"><header class="neos-destination-header"><div><small>GESTIONNAIRE DE FICHIERS</small><h2 id="neos-destination-heading">${title}</h2><span>${p.entries.length} élément${p.entries.length>1?'s':''} sélectionné${p.entries.length>1?'s':''}</span></div><button type="button" class="neos-iconbtn" data-action="destination-close" aria-label="Fermer">${icon('close',18)}</button></header><div class="neos-destination-body"><div class="neos-destination-path"><button type="button" class="neos-iconbtn" data-action="destination-up" ${p.path==='/'?'disabled':''} title="Remonter d’un dossier" aria-label="Remonter d’un dossier">${icon('back',16)}</button><button type="button" class="neos-path-root" data-action="destination-browse" data-path="/" aria-label="Racine des fichiers">${icon('home',15)}</button>${parts.map((part,i)=>`<span class="neos-path-separator">/</span><button type="button" class="neos-path-part" data-action="destination-browse" data-path="/${esc(parts.slice(0,i+1).join('/'))}">${esc(part)}</button>`).join('')}</div><label class="neos-destination-search">${icon('search',16)}<span class="neos-sr-only">Filtrer les dossiers</span><span id="neos-destination-keyboard-help" class="neos-sr-only">Flèche bas pour parcourir les dossiers ; flèche haut pour revenir au filtre.</span><input type="search" data-destination-search aria-describedby="neos-destination-keyboard-help" placeholder="Filtrer les dossiers" value="${esc(p.search)}" autocomplete="off"></label><div class="neos-destination-list" data-destination-results>${p.loading?'<div class="neos-destination-empty" role="status" aria-live="polite"><span class="neos-spinner" aria-hidden="true"></span>Chargement des dossiers…</div>':p.error?`<div class="neos-destination-empty neos-destination-error" role="alert">${icon('alert',18)} ${esc(p.error)}</div>`:destinations.length?destinations.map(f=>`<button type="button" class="neos-destination-folder" data-action="destination-browse" data-path="${esc(f.path)}">${icon('folder',19)}<span>${esc(f.name)}</span>${icon('chevron',16)}</button>`).join(''):'<div class="neos-destination-empty" role="status">Aucun sous-dossier</div>'}</div>${p.nextOffset?`<button class="neos-btn" type="button" data-action="destination-more" ${p.moreLoading?'disabled':''}>${p.moreLoading?'Chargement…':'Plus de dossiers'}</button><small role="status">${p.folders.length} sur ${p.total} dossiers chargés</small>`:''}${p.moreError?`<p role="alert">${esc(p.moreError)}</p>`:''}</div><footer class="neos-destination-footer"><div class="neos-destination-current"><span>Destination</span><strong title="${esc(p.path)}">${esc(p.path)}</strong></div><button type="button" class="neos-btn" data-action="destination-close">Annuler</button><button type="button" class="neos-btn neos-btn-primary" data-action="destination-confirm" ${p.loading||p.error||fileBusy?'disabled':''}>${icon(p.mode==='cut'?'arrow':'copy',16)} ${p.mode==='cut'?'Déplacer ici':'Copier ici'}</button></footer></section></div>`;
    const next=searchFocused?popHost.querySelector('[data-destination-search]'):folderPath?[...popHost.querySelectorAll('.neos-destination-folder')].find(el=>el.dataset.path===folderPath):null;
    if(next){
      next.focus({preventScroll:true});
      if(searchFocused&&selection.every(Number.isInteger))next.setSelectionRange(...selection);
    }
  }
  async function browseDestination(path){
    if(!pickerState||!validFileFolderPath(path))return;
    pickerState.path=path;pickerState.loading=true;pickerState.error='';pickerState.search='';
    pickerState.folders=[];pickerState.nextOffset=null;pickerState.moreLoading=false;pickerState.moreError='';
    renderFolderPicker();
    const generation=++pickerGeneration;
    try{
      const data=await requestFilePage(path,0,true);
      if(generation!==pickerGeneration||!pickerState)return;
      pickerState.folders=(Array.isArray(data.items)?data.items:[]).filter(x=>x.kind==='folder');
      pickerState.nextOffset=nextFileOffset(data);pickerState.total=number(data.total);
      pickerState.loading=false;
    }catch(error){
      if(generation!==pickerGeneration||!pickerState)return;
      console.warn('[Neos] destination inaccessible',error);
      pickerState.loading=false;pickerState.error='Dossier inaccessible ou non autorisé';
    }
    renderFolderPicker();
  }
  async function loadMoreDestinations(){
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
  function openDestinationPicker(mode,entries=selectedEntries()){
    if(fileBusy||!Array.isArray(entries)||!entries.length)return;
    if(!['cut','copy'].includes(mode))return;
    const snapshot=entries.filter(e=>e?.path&&e?.davUrl&&e?.name).map(e=>({...e}));
    if(!snapshot.length)return;
    pickerState={mode,entries:snapshot,path:browser.path,folders:[],loading:true,error:'',search:''};
    popMode='destination';renderFolderPicker();
    animateLayerOpen(popHost,'.neos-destination-dialog','y');
    void browseDestination(browser.path);
  }
  function destinationConfirm(){
    if(!pickerState||pickerState.loading||pickerState.error||fileBusy)return;
    const {entries,mode,path}=pickerState;
    if(entries.some(entry=>entry.kind==='folder'&&sameOrChild(path,entry.path))){toast('Impossible de placer un dossier dans lui-même','error');return;}
    pickerGeneration++;pickerState=null;popMode='';popHost.replaceChildren();
    void transferFiles(entries,path,mode);
  }
  async function pasteFiles(folder=browser.path){
    if(!fileClipboard.entries.length)return;
    const snap=[...fileClipboard.entries];
    await transferFiles(snap,folder,fileClipboard.mode);
  }
  async function duplicateFiles(entries=selectedEntries()){
    if(!entries.length)return;
    await transferFiles(entries,browser.path,'copy');
  }
  async function deleteFiles(entries=selectedEntries()){
    if(fileBusy||!entries.length)return;
    if(demo){toast('Suppression désactivée dans l’aperçu','error');return;}
    const folderCount=entries.filter(x=>x.kind==='folder').length;
    const text=`Supprimer ${entries.length} élément${entries.length>1?'s':''}${folderCount?` (dont ${folderCount} dossier${folderCount>1?'s':''} et leur contenu)`:''} ? La récupération dépend de la corbeille Nextcloud.`;
    if(!window.confirm(text))return;
    busyFiles(true);let done=0,errors=0;
    for(const entry of entries){
      try{await davRequest('DELETE',entry.davUrl);done++;if(preview.entry?.path===entry.path){preview.entry=null;preview.status='empty';preview.mode='empty';}}
      catch(error){errors++;console.warn('[Neos] suppression refusée',entry.name,error);}
    }
    busyFiles(false);fileSelection.clear();fileAnchorPath='';
    summarizeFiles('Suppression',done,0,errors);
    await browse(browser.path,false,false);
  }

  async function ocsRequest(path,{method='GET',headers={},body}={}){
    const response=await fetch(`${ncWebroot()}/ocs/v2.php${path}${path.includes('?')?'&':'?'}format=json`,{method,body,credentials:'same-origin',headers:{Accept:'application/json','OCS-APIRequest':'true',requesttoken:csrfToken(),'X-Requested-With':'XMLHttpRequest',...headers}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    const status=Number(data?.ocs?.meta?.statuscode||0);
    if(status&&status!==100&&status!==200)throw new Error(data?.ocs?.meta?.message||'OCS');
    return data?.ocs?.data;
  }
  function namePrompt(message,placeholder=''){
    const value=window.prompt(message,placeholder);
    if(value==null)return '';
    return value.trim().replace(/[\\/]/g,'').slice(0,180);
  }
  async function createFolder(){
    if(!browser.davUrl)return toast('Dossier courant indisponible','error');
    const name=namePrompt('Nom du nouveau dossier','Nouveau dossier');
    if(!name)return;
    try{await davRequest('MKCOL',davJoin(browser.davUrl,name));toast('Dossier créé','success');await browse(browser.path,false,false);}catch(error){console.error(error);toast('Création impossible','error');}
  }
  // XHR is used only for PUT: it exposes upload byte progress and allows abort.
  function uploadProgressUi(){
    if(!uploadState.active&&!uploadState.finished){uploadHost.replaceChildren();return;}
    const state=uploadState;
    const total=state.totalBytes, loaded=state.doneBytes+state.loaded;
    const percent=total?Math.min(100,Math.round(loaded/total*100)):(state.finished?100:0);
    const current=state.files[state.currentIndex];
    uploadHost.innerHTML=`<section class="neos-upload-panel" role="status" aria-live="off"><header><span class="neos-upload-indicator">${icon('upload',16)}</span><div><strong>${state.active?'Téléversement en cours':state.cancel?'Téléversement interrompu':'Téléversement terminé'}</strong><small>${state.files.filter(f=>f.status==='done').length} / ${state.files.length} fichier(s) transmis</small></div><button type="button" class="neos-iconbtn" data-upload-action="${state.active?'cancel':'dismiss'}" title="${state.active?'Annuler les téléversements':'Fermer'}" aria-label="${state.active?'Annuler les téléversements':'Fermer'}">${icon('close',16)}</button></header><div class="neos-upload-meter"><div style="width:${percent}%"></div></div><div class="neos-upload-totals"><span>${humanSize(loaded)} / ${humanSize(total)}</span><strong>${percent}%</strong></div><div class="neos-upload-current">${current?`${esc(current.name)} <small>${current.status==='sending'?'Envoi…':current.status==='done'?'Terminé':current.status==='conflict'?'Nom déjà utilisé':current.status==='error'?'Échec':current.status==='cancelled'?'Annulé':'En attente'}</small>`:'—'}</div></section>`;
  }
  function uploadPut(file,url,progress){
    return new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();uploadState.xhr=xhr;
      xhr.open('PUT',url,true);xhr.withCredentials=true;
      const token=csrfToken();if(token)xhr.setRequestHeader('requesttoken',token);
      xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
      xhr.setRequestHeader('Content-Type',file.type||'application/octet-stream');
      xhr.setRequestHeader('If-None-Match','*');
      xhr.upload.addEventListener('progress',event=>{if(event.lengthComputable)progress(event.loaded);});
      xhr.addEventListener('load',()=>{uploadState.xhr=null;if(xhr.status>=200&&xhr.status<300)resolve();else reject(new Error('HTTP '+xhr.status));});
      xhr.addEventListener('error',()=>{uploadState.xhr=null;reject(new Error('Erreur réseau'));});
      xhr.addEventListener('abort',()=>{uploadState.xhr=null;reject(new DOMException('Téléversement annulé','AbortError'));});
      xhr.send(file);
    });
  }
  async function uploadSelection(files,targetFolder=browser.path){
    const list=[...(files||[])].filter(file=>file instanceof File);
    if(!list.length)return;
    if(fileBusy)return toast('Une opération est déjà en cours','error');
    if(demo)return toast('Téléversement désactivé dans l’aperçu','error');
    const target=davFolderUrl(targetFolder);
    if(!target)return toast('Dossier de destination indisponible','error');
    uploadState.active=true;uploadState.finished=false;uploadState.cancel=false;uploadState.files=list.map(file=>({name:file.name,size:file.size,status:'pending'}));
    uploadState.totalBytes=list.reduce((acc,file)=>acc+file.size,0);uploadState.doneBytes=0;uploadState.loaded=0;uploadState.currentIndex=-1;
    busyFiles(true);uploadProgressUi();
    let uploaded=0,conflicts=0,errors=0;
    for(let i=0;i<list.length;i++){
      if(uploadState.cancel)break;
      const file=list[i],row=uploadState.files[i];
      uploadState.currentIndex=i;uploadState.loaded=0;row.status='sending';uploadProgressUi();
      if(!file.name||file.name.includes('/')||file.name.includes('\\')){errors++;row.status='error';uploadState.doneBytes+=file.size;continue;}
      try{
        await uploadPut(file,davJoin(target,file.name),loaded=>{uploadState.loaded=loaded;uploadProgressUi();});
        row.status='done';uploaded++;
      }catch(error){
        if(error?.name==='AbortError'){row.status='cancelled';uploadState.cancel=true;break;}
        if(/HTTP (409|412)/.test(String(error))){conflicts++;row.status='conflict';}
        else{errors++;row.status='error';}
        console.warn('[Neos] téléversement refusé',file.name,error);
      }
      uploadState.doneBytes+=file.size;uploadState.loaded=0;uploadProgressUi();
    }
    uploadState.active=false;uploadState.finished=true;uploadState.loaded=0;uploadState.xhr=null;
    if(uploadState.cancel)uploadState.files.filter(f=>f.status==='pending').forEach(f=>f.status='cancelled');
    busyFiles(false);uploadProgressUi();
    summarizeFiles('Téléversement',uploaded,conflicts,errors);
    if(uploaded)await browse(browser.path,false,false);
  }

  async function renameEntry(entry){
    if(!entry?.path||!entry?.name||!browser.davUrl)return;
    const name=namePrompt('Nouveau nom',entry.name); if(!name||name===entry.name)return;
    try{await davRequest('MOVE',entry.davUrl,{headers:{Destination:new URL(davJoin(browser.davUrl,name),window.location.origin).href,Overwrite:'F'}});toast('Élément renommé','success');await browse(browser.path,false,false);}catch(error){console.error(error);toast('Renommage impossible','error');}
  }
  async function deleteEntry(entry){
    if(!entry?.davUrl)return;
    if(!window.confirm(`Supprimer « ${entry.name} » ? La récupération dépend de la configuration de la corbeille Nextcloud.`))return;
    try{await davRequest('DELETE',entry.davUrl);toast('Élément supprimé','success');if(preview.entry?.path===entry.path){preview.entry=null;preview.status='empty';preview.mode='empty';}await browse(browser.path,false,false);}catch(error){console.error(error);toast('Suppression impossible','error');}
  }
  async function shareEntry(entry){
    if(!entry?.path)return;
    if(!window.confirm(`Créer un lien public accessible aux personnes qui le possèdent pour « ${entry.name} » ?`))return;
    try{
      const data=await ocsRequest('/apps/files_sharing/api/v1/shares',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({path:entry.path,shareType:'3'}).toString()});
      const url=data?.url||'';
      if(url&&navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);toast('Lien public copié','success');}
      else if(url){window.prompt('Lien public',url);toast('Lien public créé','success');}
      else toast('Lien public créé','success');
    }catch(error){console.error(error);toast('Partage indisponible','error');}
  }
  function renderFullPreview(){
    if(!fullPreview){if(popMode!=='hub'&&popMode!=='context')popHost.replaceChildren();return;}
    popHost.innerHTML=`<div class="neos-fullscreen-overlay" data-action="close-full-preview"><div class="neos-fullscreen-panel" role="dialog" aria-modal="true" aria-label="Aperçu de fichier"><header><strong>${esc(preview.entry?.name||'Aperçu')}</strong><div><button type="button" class="neos-iconbtn" data-action="download-selected" title="Télécharger">${icon('download',17)}</button><button type="button" class="neos-iconbtn" data-action="close-full-preview" title="Fermer">${icon('close',18)}</button></div></header><div class="neos-fullscreen-content">${previewPane()}</div></div></div>`;
    animateLayerOpen(popHost,'.neos-fullscreen-panel','y');
  }
  function renderContextMenu(){
    if(popMode!=='context')return;
    const entry=browser.items.find(x=>x.path===contextPath);if(!entry){popMode='';popHost.replaceChildren();return;}
    popHost.innerHTML=`<div class="neos-pop-layer neos-context-overlay" data-action="close-pop"><div class="neos-context-menu" role="menu"><div class="neos-context-title">${esc(entry.name)}</div>${entry.kind==='file'?`<button role="menuitem" data-action="menu-preview">${icon('expand',16)} Aperçu</button><button role="menuitem" data-action="menu-download">${icon('download',16)} Télécharger</button>`:`<button role="menuitem" data-action="menu-open-folder">${icon('folder',16)} Ouvrir le dossier</button>`}<button role="menuitem" data-action="menu-favorite">${icon('star',16)} ${favoritePaths.has(entry.path)?'Retirer des favoris':'Ajouter aux favoris'}</button><button role="menuitem" data-action="menu-share">${icon('link',16)} Créer un lien public</button><button role="menuitem" data-action="menu-rename">${icon('edit',16)} Renommer</button><button role="menuitem" data-action="menu-duplicate">${icon('copy',16)} Dupliquer ici</button><button role="menuitem" data-action="menu-move-to">${icon('arrow',16)} Déplacer vers…</button><button role="menuitem" data-action="menu-copy-to">${icon('copy',16)} Copier vers…</button><button role="menuitem" class="is-danger" data-action="menu-delete">${icon('trash',16)} Supprimer</button><button role="menuitem" data-action="menu-copy">${icon('copy',16)} Copier le lien interne</button><a href="${safeUrl(entry.url)}" role="menuitem">${icon('external',16)} Ouvrir dans Fichiers</a></div></div>`;
    animateLayerOpen(popHost,'.neos-context-menu','y');
  }

  function encodeSettings() {
    const form = new URLSearchParams();
    const put = (key, value) => form.append(`settings[${key}]`, String(value));
    ['theme','density','accent','layout','motion','launcherMode','gridMode','notes'].forEach(key => put(key, settings[key] || ''));
    settings.order.forEach((v,i) => form.append(`settings[order][${i}]`, v));
    settings.hidden.forEach((v,i) => form.append(`settings[hidden][${i}]`, v));
    Object.entries(settings.sizes || {}).forEach(([id,v]) => form.append(`settings[sizes][${id}]`, String(v)));
    Object.entries(settings.heights || {}).forEach(([id,v]) => form.append(`settings[heights][${id}]`, String(v)));
    (settings.links || []).forEach((l,i) => { form.append(`settings[links][${i}][title]`, l.title); form.append(`settings[links][${i}][url]`, l.url); });
    (settings.pins || []).forEach((p,i) => form.append(`settings[pins][${i}]`, p));
    (settings.topApps || []).forEach((id,i) => form.append(`settings[topApps][${i}]`, id));
    installedTabs().forEach((id,i) => form.append(`settings[tabOrder][${i}]`, id));
    return form;
  }

  async function save() {
    if (saving) return;
    saving = true;
    while (saveQueued) {
      saveQueued = false;
      const notePending=homeNoteStatus==='Enregistrement…';
      const noteSent=settings.notes;
      updateSaveIndicator('Enregistrement…');
      try {
        await api(root.dataset.settingsUrl, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body:encodeSettings().toString() });
        if(notePending&&homeNoteStatus==='Enregistrement…'&&homeNoteDraft===noteSent&&!saveQueued)setHomeNoteStatus('Note enregistrée');
        updateSaveIndicator('Enregistré');
      } catch (error) {
        console.error('[Neos] sauvegarde impossible', error);
        if(homeNoteStatus==='Enregistrement…')setHomeNoteStatus('Échec de l’enregistrement');
        updateSaveIndicator('Erreur');
        toast('Impossible d’enregistrer.', 'error');
        break;
      }
    }
    saving = false;
  }

  function queueSave() { if(demo){ updateSaveIndicator('Démo — réglages temporaires'); return; } saveQueued = true; if (!saving) void save(); }

  function radio(name, choices) {
    return `<div class="neos-choice-set">${choices.map(([value,label]) => `<label class="neos-choice"><input type="radio" name="${name}" value="${value}" ${settings[name]===value?'checked':''}><span>${label}</span></label>`).join('')}</div>`;
  }

  function renderEditor() {
    if (!editorOpen) { editorHost.replaceChildren(); return; }
    const appChoices = (overview?.shortcuts || []).map(app => `<label class="neos-check"><input type="checkbox" data-topapp="${esc(app.id)}" ${settings.topApps.includes(app.id)?'checked':''}><span>${esc(app.label)}</span></label>`).join('');
    editorHost.innerHTML = `<div class="neos-overlay" data-action="editor-backdrop"><aside class="neos-editor" role="dialog" aria-modal="true" aria-labelledby="neos-editor-title">
      <header class="neos-editor-head"><h2 id="neos-editor-title">Neos</h2><button type="button" class="neos-iconbtn" data-action="close-editor">${icon('close',18)}</button></header>
      <div class="neos-editor-body">
        <section class="neos-tab-order-section" data-tab-order-section><h3>Ordre des onglets</h3><p class="neos-pref-hint">Glisse un onglet pour le déplacer, ou utilise les flèches sur mobile. L'ordre est enregistré sur ton compte Nextcloud et synchronisé sur tes appareils. Le bouton « Réorganiser » permet aussi de glisser directement les onglets de la barre.</p>
          <div class="neos-tab-order-list" aria-label="Ordre d'affichage des onglets">${installedTabs().map((id,i)=>`<div class="neos-tab-order-row" data-editor-tab="${id}" draggable="true"><span class="neos-tab-order-grip" aria-hidden="true">${icon('grip',16)}</span>${flatTabIcon(id)}<span class="neos-tab-order-name">${esc(appName(id))}</span><div class="neos-tab-order-buttons"><button class="neos-iconbtn" type="button" data-action="tab-order-up" data-tab="${id}" aria-label="Monter ${esc(appName(id))}" ${i===0?'disabled':''}>${icon('back',16)}</button><button class="neos-iconbtn" type="button" data-action="tab-order-down" data-tab="${id}" aria-label="Descendre ${esc(appName(id))}" ${i===installedTabs().length-1?'disabled':''}>${icon('forward',16)}</button></div></div>`).join('')}</div><button type="button" class="neos-btn neos-tab-order-reset" data-action="tab-order-reset">${icon('refresh',15)} Ordre par défaut</button>
        </section>
        <section><h3>Apparence</h3>${radio('theme',[['system','Auto'],['dark','Sombre'],['light','Clair']])}${radio('accent',[['cyan','Cyan'],['indigo','Indigo'],['rose','Violet/Rose'],['emerald','Turquoise'],['amber','Ambre']])}${radio('density',[['comfortable','Aérée'],['compact','Compacte']])}${radio('layout',[['wide','Pleine largeur'],['focused','Centrée']])}${radio('motion',[['full','Animé'],['subtle','Discret'],['off','Off']])}</section>
        <section><h3>Disposition de l'accueil</h3><div class="neos-pref-hint">Choisis « Libre » pour régler largeur et hauteur minimale. La grille compacte automatiquement les espaces entre les cartes.</div>${radio('gridMode',[['adaptive','Adaptatif'],['manual','Libre']])}<div class="neos-pref-list">${settings.order.filter(id=>id!=='shortcuts').map((id,i)=>`<div class="neos-pref-row"><label class="neos-check"><input type="checkbox" data-toggle="${id}" ${settings.hidden.includes(id)?'':'checked'}><span>${esc(widgetLabels[id])}</span></label><div class="neos-pref-tools"><select data-size="${id}" ${settings.gridMode==='adaptive'?'disabled':''}>${[[3,'25%'],[4,'33%'],[6,'50%'],[8,'67%'],[9,'75%'],[12,'100%']].map(([size,label])=>`<option value="${size}" ${Number(settings.sizes[id])===size?'selected':''}>${label}</option>`).join('')}</select><select data-height="${id}" ${settings.gridMode==='adaptive'?'disabled':''} aria-label="Hauteur minimale de ${esc(widgetLabels[id])}">${[[0,'Auto'],[160,'160 px'],[220,'220 px'],[300,'300 px'],[400,'400 px'],[520,'520 px'],[680,'680 px']].map(([h,label])=>`<option value="${h}" ${widgetMinHeight(id)===h?'selected':''}>${label}</option>`).join('')}</select><button type="button" class="neos-iconbtn" data-action="move-up" data-id="${id}" ${settings.order.indexOf(id)===0?'disabled':''} aria-label="Monter ${esc(widgetLabels[id])}">↑</button><button type="button" class="neos-iconbtn" data-action="move-down" data-id="${id}" ${settings.order.indexOf(id)===settings.order.length-1?'disabled':''} aria-label="Descendre ${esc(widgetLabels[id])}">↓</button></div></div>`).join('')}</div></section>
        <section><h3>Position du lanceur</h3>${radio('launcherMode',[['topbar','Barre supérieure'],['widget','Widget']])}<div class="neos-app-picks">${settings.launcherMode==='topbar' ? appChoices : ''}</div></section>
        <section><h3>Liens</h3><div class="neos-custom-links">${(settings.links || []).map((entry, i) => `<div class="neos-link-edit"><input data-link-title="${i}" value="${esc(entry.title)}" maxlength="80"><input data-link-url="${i}" value="${esc(entry.url)}" maxlength="600"><button type="button" class="neos-iconbtn" data-action="remove-link" data-index="${i}">${icon('trash',15)}</button></div>`).join('')}</div><button type="button" class="neos-btn" data-action="add-link">${icon('plus',15)} Ajouter</button></section>
      </div>
      <footer class="neos-editor-foot"><span data-save-indicator>Préférences individuelles</span><div><button type="button" class="neos-btn" data-action="arrange">Réorganiser</button><button type="button" class="neos-btn neos-btn-primary" data-action="close-editor">Terminer</button></div></footer>
    </aside></div>`;
    animateLayerOpen(editorHost,'.neos-editor','x');
  }
  function updateSaveIndicator(text){ const el = editorHost.querySelector('[data-save-indicator]'); if (el) el.textContent = text; }
  function openEditor(){ editing=true;editorOpen=true;render();renderEditor();surface.inert=true; }
  function closeEditor(keepEditing=false){
    harvestLinks(); queueSave();
    const finish = () => { editorOpen=false;editing=keepEditing;surface.inert=false;renderEditor();render();surface.querySelector('[data-action=customize]')?.focus(); };
    if(editorHost.firstElementChild) animateLayerClose(editorHost,'.neos-editor',finish,'x'); else finish();
  }
  function harvestLinks(){ editorHost.querySelectorAll('[data-link-title]').forEach(input => { const i = Number(input.dataset.linkTitle); if (settings.links[i]) settings.links[i].title = input.value.trim().slice(0,80); }); editorHost.querySelectorAll('[data-link-url]').forEach(input => { const i = Number(input.dataset.linkUrl); if (settings.links[i]) settings.links[i].url = input.value.trim().slice(0,600); }); }

  // Favorite state is stored by Nextcloud via WebDAV oc:favorite (not in Neos
  // preferences). Recently opened paths are only stored locally in this browser
  // under a per-user key; no file content is retained.
  function recentStorageKey(){
    const uid=root.dataset.currentUid||'demo';
    return `neos-v060-recent:${uid}`;
  }
  function readRecent(){
    recentViewed.splice(0);
    try{
      const value=JSON.parse(localStorage.getItem(recentStorageKey())||'[]');
      if(Array.isArray(value))for(const item of value.slice(0,24)){
        if(validFileFolderPath(item?.path)&&item.path!=='/'&&typeof item.name==='string'&&item.name.length<300){
          recentViewed.push({name:item.name,path:item.path,parent:item.path.slice(0,item.path.lastIndexOf('/'))||'/',kind:'file',size:number(item.size),mime:String(item.mime||''),mtime:number(item.mtime),openedAt:number(item.openedAt)});
        }
      }
    }catch{/* Storage may be blocked by the browser */}
  }
  function recordRecent(entry){
    if(!entry?.path||entry.kind!=='file'||!validFileFolderPath(entry.path))return;
    const current={name:entry.name,path:entry.path,parent:entry.path.slice(0,entry.path.lastIndexOf('/'))||'/',kind:'file',size:number(entry.size),mime:String(entry.mime||''),mtime:number(entry.mtime),openedAt:Date.now()};
    const idx=recentViewed.findIndex(item=>item.path===entry.path);
    if(idx!==-1)recentViewed.splice(idx,1);
    recentViewed.unshift(current);recentViewed.length=Math.min(recentViewed.length,24);
    try{localStorage.setItem(recentStorageKey(),JSON.stringify(recentViewed));}catch{/* History remains available for this page */}
  }
  function favoriteDavRoot(){
    const uid=root.dataset.currentUid;
    if(uid){
      // The webroot is supplied by Nextcloud itself. Never derive it from
      // the overview route: pretty routes do not contain '/index.php/'.
      const webroot=String(root.dataset.webroot ?? window.OC?.getRootPath?.() ?? '');
      if(webroot&&!webroot.startsWith('/'))return '';
      return window.location.origin+webroot.replace(/\/+$/,'')+'/remote.php/dav/files/'+encodeURIComponent(uid);
    }
    return davRoot();
  }
  function favoriteDavUrl(path){
    if(!validFileFolderPath(path)||path==='/')return '';
    const base=favoriteDavRoot();
    return base?base+path.split('/').slice(1).map(encodeURIComponent).reduce((a,b)=>a+'/'+b,''):'';
  }
  function xmlNodeValue(node,namespace,name){
    return node?.getElementsByTagNameNS(namespace,name)?.[0]?.textContent||'';
  }
  function parseFavoriteXml(xml,base){
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.getElementsByTagName('parsererror').length)throw Error('Réponse WebDAV invalide');
    const rootPath=new URL(base,window.location.href).pathname.replace(/\/+$/,'');
    const results=[];
    for(const entry of doc.getElementsByTagNameNS('DAV:','response')){
      const href=xmlNodeValue(entry,'DAV:','href');if(!href)continue;
      const url=new URL(href,window.location.origin);
      const pathname=url.pathname.replace(/\/+$/,'');
      if(url.origin!==window.location.origin||!pathname.startsWith(rootPath+'/'))continue;
      const segments=pathname.slice(rootPath.length+1).split('/').map(x=>decodeURIComponent(x));
      const path='/'+segments.join('/');
      if(!validFileFolderPath(path))continue;
      const collection=entry.getElementsByTagNameNS('DAV:','collection').length>0;
      const name=segments.at(-1);
      const mime=collection?'httpd/unix-directory':xmlNodeValue(entry,'DAV:','getcontenttype');
      const mtime=Math.floor(Date.parse(xmlNodeValue(entry,'DAV:','getlastmodified'))/1000)||0;
      const size=Number(xmlNodeValue(entry,'DAV:','getcontentlength')||xmlNodeValue(entry,'http://owncloud.org/ns','size'))||0;
      results.push({name,path,parent:path.slice(0,path.lastIndexOf('/'))||'/',kind:collection?'folder':'file',mime,size:collection?null:size,mtime,davUrl:url.pathname});
    }
    return results.slice(0,100);
  }
  async function loadFavorites(){
    if(favoriteState.status==='loading')return;
    favoriteState.status='loading';favoriteState.error='';renderGlobalSearchResults();
    try{
      let entries;
      if(demo){
        const browseItems=Object.values(demo.browse||{}).flatMap(x=>x.items||[]);
        entries=browseItems.filter(x=>favoritePaths.has(x.path)).map(x=>({...x,parent:x.path.slice(0,x.path.lastIndexOf('/'))||'/'}));
      }else{
        const base=favoriteDavRoot();if(!base)throw Error('Racine WebDAV inconnue');
        const body='<?xml version="1.0"?><oc:filter-files xmlns:oc="http://owncloud.org/ns" xmlns:d="DAV:"><oc:filter-rules><oc:favorite>1</oc:favorite></oc:filter-rules><d:prop><d:resourcetype/><d:getcontenttype/><d:getlastmodified/><d:getcontentlength/><oc:size/><oc:favorite/></d:prop></oc:filter-files>';
        const response=await fetch(base,{method:'REPORT',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/xml;charset=UTF-8',requesttoken:csrfToken()},body});
        if(!response.ok)throw Error('HTTP '+response.status);
        entries=parseFavoriteXml(await response.text(),base);
      }
      favoriteState.items=entries;favoritePaths.clear();for(const entry of entries)favoritePaths.add(entry.path);
      favoriteState.status='ready';favoriteState.error='';
      if(activeWorkspace==='files'){
        const list=surface.querySelector('#neos-file-results');if(list)list.innerHTML=browserItems();
      }
    }catch(error){console.error('[Neos] favoris Nextcloud',error);favoriteState.status='error';favoriteState.error='Favoris indisponibles : vérifier WebDAV et les permissions.';}
    renderGlobalSearchResults();
  }
  async function toggleFavorite(entry){
    if(!entry?.path||!validFileFolderPath(entry.path))return;
    const enabled=!favoritePaths.has(entry.path);
    if(demo){enabled?favoritePaths.add(entry.path):favoritePaths.delete(entry.path);favoriteState.status='idle';await loadFavorites();return;}
    const url=favoriteDavUrl(entry.path);if(!url){toast('Chemin de favori invalide','error');return;}
    const body=`<?xml version="1.0"?><d:propertyupdate xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns"><d:set><d:prop><oc:favorite>${enabled?1:0}</oc:favorite></d:prop></d:set></d:propertyupdate>`;
    try{
      const response=await fetch(url,{method:'PROPPATCH',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/xml;charset=UTF-8',requesttoken:csrfToken()},body});
      if(!response.ok)throw Error('HTTP '+response.status);
      const reply=await response.text();
      if(/<\?xml|multistatus/i.test(reply)&&!/HTTP\/\d(?:\.\d)? 200 /i.test(reply))throw Error('Favori refusé par WebDAV');
      enabled?favoritePaths.add(entry.path):favoritePaths.delete(entry.path);
      toast(enabled?'Ajouté aux favoris Nextcloud':'Retiré des favoris','success');
      favoriteState.status='idle';await loadFavorites();
    }catch(error){console.error('[Neos] modification favori',error);toast('Favori non enregistré sur Nextcloud','error');}
  }

  // Filename search is bounded and permission-aware on the server. This is not
  // an unrestricted NAS filesystem crawler and does not search file contents.
  function searchFilterSelect(name,label,options){
    return `<label class="neos-search-filter"><span>${label}</span><select data-global-filter="${name}">${options.map(([value,text])=>`<option value="${value}" ${globalSearch[name]===value?'selected':''}>${text}</option>`).join('')}</select></label>`;
  }
  function nextSearchTab(current,key){
    const tabs=['search','favorites','recent'];
    const index=tabs.indexOf(current);
    if(index<0)return null;
    if(key==='Home')return tabs[0];
    if(key==='End')return tabs[tabs.length-1];
    if(key==='ArrowRight')return tabs[(index+1)%tabs.length];
    if(key==='ArrowLeft')return tabs[(index+tabs.length-1)%tabs.length];
    return null;
  }
  function selectSearchPanelTab(tab){
    if(!['search','favorites','recent'].includes(tab))return;
    searchPanelTab=tab;renderGlobalSearch();
    popHost.querySelector('[data-action="search-tab"][data-tab="'+tab+'"]')?.focus({preventScroll:true});
    if(tab==='favorites')void loadFavorites();
  }
  function renderGlobalSearch(){
    if(popMode!=='global-search')return;
    const search=searchPanelTab==='search';
    popHost.innerHTML=`<div class="neos-pop-layer" data-action="close-pop"><section class="neos-search-dialog neos-search-v060" role="dialog" aria-modal="true" aria-label="Recherche, favoris et fichiers récents"><header><div><strong>Accès aux fichiers</strong><p>Recherche, favoris Nextcloud et fichiers consultés</p></div><button type="button" class="neos-iconbtn" data-action="close-pop" aria-label="Fermer">${icon('close',18)}</button></header><nav class="neos-search-tabs" role="tablist" aria-label="Type de fichiers"><button type="button" role="tab" id="neos-search-tab-search" aria-controls="neos-search-panel" aria-selected="${search}" tabindex="${search?0:-1}" class="${search?'is-active':''}" data-action="search-tab" data-tab="search">${icon('search',16)} Recherche</button><button type="button" role="tab" id="neos-search-tab-favorites" aria-controls="neos-search-panel" aria-selected="${searchPanelTab==='favorites'}" tabindex="${searchPanelTab==='favorites'?0:-1}" class="${searchPanelTab==='favorites'?'is-active':''}" data-action="search-tab" data-tab="favorites">${icon('star',16)} Favoris</button><button type="button" role="tab" id="neos-search-tab-recent" aria-controls="neos-search-panel" aria-selected="${searchPanelTab==='recent'}" tabindex="${searchPanelTab==='recent'?0:-1}" class="${searchPanelTab==='recent'?'is-active':''}" data-action="search-tab" data-tab="recent">${icon('clock',16)} Consultés</button></nav>${search?`<label class="neos-search-dialog-input">${icon('search',19)}<input data-global-search type="search" autocomplete="off" spellcheck="false" placeholder="Nom du fichier ou dossier (2 caractères min.)" value="${esc(globalSearch.query)}"></label><div class="neos-search-filter-grid">${searchFilterSelect('type','Type',[['all','Tous'],['folder','Dossiers'],['image','Images'],['document','Documents'],['video','Vidéos'],['audio','Audio'],['other','Autres fichiers']])}${searchFilterSelect('date','Modifié',[['all','Toutes dates'],['7','7 derniers jours'],['30','30 derniers jours'],['365','12 derniers mois']])}${searchFilterSelect('size','Taille',[['all','Toutes tailles'],['small','Moins de 1 Mo'],['medium','1 à 10 Mo'],['large','10 à 100 Mo'],['huge','Plus de 100 Mo']])}${searchFilterSelect('sort','Tri',[['recent','Dernière modification'],['name','Nom'],['size','Taille décroissante']])}</div>`:''}<span class="neos-sr-only" data-global-search-announce role="status" aria-live="polite" aria-atomic="true"></span><div class="neos-search-dialog-results" id="neos-search-panel" data-global-search-results role="tabpanel" aria-labelledby="neos-search-tab-${searchPanelTab}" tabindex="0"></div><footer>${search?'Recherche par nom dans les fichiers et dossiers indexés par Nextcloud.':searchPanelTab==='recent'?'<span>Historique propre à ce navigateur et à ce compte.</span><button type="button" class="neos-search-clear" data-action="recent-clear">Effacer l’historique</button>':'Favoris synchronisés avec Nextcloud (WebDAV).'}</footer></section></div>`;
    renderGlobalSearchResults();
  }
  async function previewSearchFile(item){
    const url=davFolderUrl(item.path);
    if(url)await previewFromDav(new URL(url).pathname,item.name,item.mime,number(item.size),item.path);
  }
  function quickResultRow(item,tab){
    const isFolder=item.kind==='folder';
    return `<div class="neos-search-quick-row"><button type="button" class="neos-search-result" data-action="search-open" data-path="${esc(item.path)}" data-parent="${esc(item.parent||'/')}"><span class="neos-search-result-icon">${icon(isFolder?'folder':String(item.mime||'').startsWith('image/')?'image':'file',19)}</span><span class="neos-search-result-name"><strong>${esc(item.name)}</strong><small>${esc(item.parent||'/')} · ${isFolder?'Dossier':humanSize(item.size)}${tab==='recent'?' · Consulté '+new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(new Date(item.openedAt||Date.now())):''}</small></span>${icon('chevron',16)}</button><div class="neos-quick-actions">${!isFolder?`<button type="button" class="neos-iconbtn" data-action="quick-preview" data-path="${esc(item.path)}" title="Aperçu intégré" aria-label="Aperçu de ${esc(item.name)}">${icon('expand',16)}</button>`:''}<button type="button" class="neos-iconbtn" data-action="quick-parent" data-path="${esc(item.path)}" title="Ouvrir le dossier" aria-label="Ouvrir le dossier de ${esc(item.name)}">${icon('folder',16)}</button><button type="button" class="neos-iconbtn neos-favorite-toggle ${favoritePaths.has(item.path)?'is-on':''}" data-action="quick-favorite" data-path="${esc(item.path)}" title="${favoritePaths.has(item.path)?'Retirer des favoris':'Ajouter aux favoris'}" aria-label="${favoritePaths.has(item.path)?'Retirer des favoris':'Ajouter aux favoris'} : ${esc(item.name)}">${icon('star',16)}</button></div></div>`;
  }
  function renderGlobalSearchResults(){
    const node=popHost.querySelector('[data-global-search-results]');if(!node)return;
    const announcer=popHost.querySelector('[data-global-search-announce]');
    const loading=searchPanelTab==='favorites'?favoriteState.status==='loading':searchPanelTab==='search'&&globalSearch.loading;
    node.setAttribute('aria-busy',loading?'true':'false');
    const announce=(message)=>{if(announcer&&announcer.textContent!==message)announcer.textContent=message;};
    if(loading)announce(searchPanelTab==='favorites'?'Chargement des favoris en cours.':'Recherche en cours.');
    else if(searchPanelTab==='favorites')announce(favoriteState.status==='error'?'Erreur de chargement des favoris.':`${favoriteState.items.length} favori${favoriteState.items.length===1?'':'s'} disponible${favoriteState.items.length===1?'':'s'}.`);
    else if(searchPanelTab==='recent')announce(`${recentViewed.length} fichier${recentViewed.length===1?'':'s'} consulté${recentViewed.length===1?'':'s'}.`);
    else if(globalSearch.error)announce('Erreur de recherche : '+globalSearch.error);
    else if(globalSearch.query.trim().length>=2)announce(`${globalSearch.items.length} résultat${globalSearch.items.length===1?'':'s'} trouvé${globalSearch.items.length===1?'':'s'}.`);
    else announce('Saisis au moins deux caractères pour lancer la recherche.');
    if(searchPanelTab==='favorites'){
      if(favoriteState.status==='loading'){node.innerHTML='<div class="neos-search-status"><span class="neos-spinner"></span> Chargement des favoris Nextcloud…</div>';return;}
      if(favoriteState.status==='error'){node.innerHTML=`<div class="neos-search-status">${icon('alert',18)} ${esc(favoriteState.error)}</div>`;return;}
      node.innerHTML=favoriteState.items.length?`<div class="neos-search-results-list">${favoriteState.items.map(x=>quickResultRow(x,'favorites')).join('')}</div>`:'<div class="neos-search-status">Aucun favori Nextcloud. Utilise l’étoile dans Fichiers.</div>';
      return;
    }
    if(searchPanelTab==='recent'){
      node.innerHTML=recentViewed.length?`<div class="neos-search-results-list">${recentViewed.map(x=>quickResultRow(x,'recent')).join('')}</div>`:'<div class="neos-search-status">Aucun fichier consulté dans Neos avec ce navigateur.</div>';
      return;
    }
    if(globalSearch.loading&&!globalSearch.items.length){node.innerHTML='<div class="neos-search-status"><span class="neos-spinner"></span> Recherche en cours…</div>';return;}
    if(globalSearch.error&&!globalSearch.items.length){node.innerHTML=`<div class="neos-search-status">${icon('alert',18)} ${esc(globalSearch.error)}</div>`;return;}
    if(globalSearch.query.trim().length<2){node.innerHTML='<div class="neos-search-status">Saisis au moins deux caractères pour lancer la recherche.</div>';return;}
    if(!globalSearch.items.length){node.innerHTML='<div class="neos-search-status">Aucun fichier ou dossier ne correspond aux filtres.</div>';return;}
    node.innerHTML=`<div class="neos-search-results-list">${globalSearch.items.map(x=>quickResultRow(x,'search')).join('')}</div><p class="neos-search-limited">${globalSearch.items.length} sur ${globalSearch.total} résultats</p>${globalSearch.nextOffset!==null?'<button class="neos-btn" type="button" data-action="search-more" '+(globalSearch.loading?'disabled':'')+'>'+(globalSearch.loading?'Chargement…':globalSearch.error?'Réessayer':'Afficher plus de résultats')+'</button>':''}`;
  }
  async function executeGlobalSearch(more=false){
    if(more&&(globalSearch.loading||globalSearch.nextOffset===null))return;
    const offset=more?globalSearch.nextOffset:0;
    if(!more){globalSearch.items=[];globalSearch.nextOffset=null;}
    const requestId=++globalSearchGeneration;
    const q=globalSearch.query.trim();
    if(q.length<2){globalSearch.loading=false;globalSearch.items=[];globalSearch.error='';renderGlobalSearchResults();return;}
    globalSearch.loading=true;globalSearch.error='';renderGlobalSearchResults();
    try{
      let result;
      if(demo){
        const browses=Object.values(demo.browse||{});
        const cutoff=globalSearch.date==='all'?0:Date.now()/1000-Number(globalSearch.date)*86400;
        const mi=1024*1024;
        let items=browses.flatMap(x=>x.items||[]).filter(x=>x.name.toLocaleLowerCase('fr').includes(q.toLocaleLowerCase('fr'))).filter(x=>{
          if(number(x.mtime)<cutoff)return false;
          if(globalSearch.type==='folder')return x.kind==='folder'&&globalSearch.size==='all';
          if(globalSearch.type!=='all'){
            if(x.kind==='folder')return false;
            const mime=String(x.mime||'').toLowerCase(),extension=ext(x.name);
            const image=mime.startsWith('image/'),audio=mime.startsWith('audio/'),video=mime.startsWith('video/'),doc=mime.startsWith('text/')||['pdf','doc','docx','odt','xls','xlsx','ods','ppt','pptx','odp','txt','md','csv','rtf'].includes(extension);
            if(!({image,video,audio,document:doc,other:!image&&!video&&!audio&&!doc}[globalSearch.type]))return false;
          }
          if(globalSearch.size!=='all'){
            if(x.kind==='folder')return false;
            const z=number(x.size);
            if(globalSearch.size==='small'&&z>=mi)return false;
            if(globalSearch.size==='medium'&&(z<mi||z>=mi*10))return false;
            if(globalSearch.size==='large'&&(z<mi*10||z>=mi*100))return false;
            if(globalSearch.size==='huge'&&z<mi*100)return false;
          }
          return true;
        });
        if(globalSearch.sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name,'fr'));
        else if(globalSearch.sort==='size')items.sort((a,b)=>number(b.size)-number(a.size));
        else items.sort((a,b)=>number(b.mtime)-number(a.mtime));
        result={items:items.slice(offset,offset+40).map(x=>({...x,parent:x.path?.slice(0,x.path.lastIndexOf('/'))||'/'})),nextOffset:offset+40<items.length?offset+40:null,total:items.length};
      }else{
        const url=new URL(root.dataset.searchUrl,window.location.href);
        url.searchParams.set('q',q);
        url.searchParams.set('offset',String(offset));
        for(const field of ['type','date','size','sort'])url.searchParams.set(field,globalSearch[field]);
        result=await api(url.toString());
      }
      if(requestId!==globalSearchGeneration||popMode!=='global-search')return;
      const page=Array.isArray(result.items)?result.items:[];
      globalSearch.items=[...new Map([...globalSearch.items,...page].map(item=>[item.path,item])).values()];
      globalSearch.nextOffset=Number.isInteger(result.nextOffset)&&result.nextOffset>offset?result.nextOffset:null;
      globalSearch.total=number(result.total);
      globalSearch.loading=false;renderGlobalSearchResults();
    }catch(error){
      if(requestId!==globalSearchGeneration||popMode!=='global-search')return;
      console.error('[Neos] recherche multi-dossiers',error);
      globalSearch.loading=false;globalSearch.error=more?'Suite des résultats indisponible.':'Recherche indisponible. Vérifie la mise à jour de Neos.';renderGlobalSearchResults();
    }
  }
  function openGlobalSearch(tab='search'){
    popMode='global-search';searchPanelTab=['search','favorites','recent'].includes(tab)?tab:'search';
    globalSearchGeneration++;
    renderGlobalSearch();animateLayerOpen(popHost,'.neos-search-dialog','y');
    if(searchPanelTab==='search'){
      const input=popHost.querySelector('[data-global-search]');input?.focus();input?.select();
      if(globalSearch.query.length>=2)void executeGlobalSearch();
    }else if(searchPanelTab==='favorites')void loadFavorites();
  }

  function renderHubPanel() {
    if(popMode==='destination'){renderFolderPicker();return;}
    if(popMode==='context'){renderContextMenu();return;}
    if(popMode!=='hub'){if(!fullPreview)popHost.replaceChildren();return;}
    popHost.innerHTML = `<div class="neos-pop-layer" data-action="close-pop"><div class="neos-hub-pop neos-framed" role="dialog" aria-modal="true" aria-label="Applications"><header><div class="neos-hub-header-title"><strong>Applications</strong><span>${(overview?.shortcuts || []).length} disponibles</span></div><button type="button" class="neos-iconbtn" data-action="close-pop" title="Fermer">${icon('close',18)}</button></header><div class="neos-hub-shell"><div class="neos-hub-main">${hubGrid(false)}${settings.links?.length ? `<div class="neos-hub-links">${settings.links.map(x => `<a href="${safeUrl(x.url)}" class="neos-link-card">${icon('link',14)}<span>${esc(x.title)}</span></a>`).join('')}</div>` : ''}</div></div></div></div>`;
    animateLayerOpen(popHost,'.neos-hub-pop','y');
  }

  function hidePop(){
    const finish = () => { popMode=''; fullPreview=false;pickerState=null;pickerGeneration++; popHost.replaceChildren(); };
    if(popHost.firstElementChild) animateLayerClose(popHost,'.neos-hub-pop, .neos-context-menu, .neos-fullscreen-panel, .neos-destination-dialog, .neos-search-dialog, .neos-groupware-dialog',finish,'y'); else finish();
  }

  async function load(silent=false) {
    try {
      const data = demo ? demo.overview : await api(root.dataset.overviewUrl);
      if (!data.overview || !data.settings) throw new Error('Réponse API inattendue');
      overview = data.overview;
      if (!settings || !silent) settings = { ...defaults(), ...data.settings, sizes:{...defaultSizes,...(data.settings.sizes||{})},heights:{...defaultHeights,...(data.settings.heights||{})}, topApps:data.settings.topApps || ['files','calendar','tasks','talk'], tabOrder:normalizeTabOrder(data.settings.tabOrder), launcherMode:data.settings.launcherMode || 'topbar', gridMode:data.settings.gridMode || 'manual', accent: data.settings.accent === 'copper' ? 'cyan' : (data.settings.accent || 'cyan') };
      settings.order=[...new Set([...(Array.isArray(settings.order)?settings.order:[]),...widgetIds])];
      if(!Array.isArray(settings.hidden))settings.hidden=[];
      settings.heights={...defaultHeights,...(settings.heights||{})};
      root.dataset.displayName = data.user?.name || 'toi';
      if(root.dataset.currentUid!==String(data.user?.uid||'demo')){
        root.dataset.currentUid=String(data.user?.uid||'demo');
        readRecent();favoriteState.status='idle';favoriteState.items=[];favoritePaths.clear();
      }
      render();
      if (browser.loading || (!browser.items.length && !browser.error)) void browse(browser.path, false);
      if (activeWorkspace==='home' && !settings.hidden.includes('deck') && deckState.status==='idle') void loadDeck();
      if ((activeWorkspace==='calendar'||activeWorkspace==='tasks'||activeWorkspace==='planning') && groupware.status==='idle')void loadGroupware();
      if(activeWorkspace==='planning'&&planningDeck.status==='idle')void loadPlanningDeck();
    if(activeWorkspace==='home'&&homeHasTasks()&&groupware.status==='idle')void loadGroupware();
      if(integrations[activeWorkspace]&&integrations[activeWorkspace].status==='idle')void loadIntegration(activeWorkspace);
      if (silent) toast('Actualisé','success');
    } catch (error) {
      console.error('[Neos] chargement impossible', error);
      surface.innerHTML = `<div class="neos-fatal">${icon('alert',28)}<strong>Chargement impossible</strong><button type="button" class="neos-btn" data-action="refresh">Réessayer</button></div>`;
    }
  }

  surface.addEventListener('click',event=>{
    const input=event.target.closest('input[data-file-checkbox]');
    if(!input)return;
    event.stopPropagation();
    if(fileBusy){event.preventDefault();return;}
    toggleFileSelection(input.dataset.path||'',event.shiftKey);
  });
  surface.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'refresh') { if(activeWorkspace==='home'&&homeHasTasks())void loadGroupware(true,true); void load(true); if(activeWorkspace==='files')void browse(browser.path,false); else if(activeWorkspace==='photos')void loadPhotos(true); else if(activeWorkspace==='deck')void loadDeck(true); else if(activeWorkspace==='notes')void loadNotes(true); else if(activeWorkspace==='calendar'||activeWorkspace==='tasks'||activeWorkspace==='planning'){void loadGroupware(true);if(activeWorkspace==='planning')void loadPlanningDeck(true);}else if(integrations[activeWorkspace])void loadIntegration(activeWorkspace,true); }
    else if (action === 'customize') { if (editorOpen) closeEditor(); else openEditor(); }
    else if(action==='workspace'){if(popMode)hidePop();void chooseWorkspace(target.dataset.workspace);}
    else if(action==='global-search'){openGlobalSearch(target.dataset.tab||'search');}
    else if(action==='toggle-favorite'){const entry=browser.items.find(x=>x.path===target.dataset.path);if(entry)void toggleFavorite(entry);}
    else if(action==='home-open-folder'){const path=target.dataset.path||'/';void chooseWorkspace('files').then(()=>browse(path));}
    else if(action==='home-open-recent'){void openHomeRecent({...target.dataset});}
    else if(action==='focus-search'){void chooseWorkspace('files').then(()=>surface.querySelector('[data-browser-search]')?.focus());}
    else if(action==='finish-arrange'){editing=false;layoutAnnounce='';render();queueSave();}
    else if(action==='grid-mode'){settings.gridMode=target.dataset.mode==='manual'?'manual':'adaptive';layoutAnnounce=settings.gridMode==='manual'?'Largeurs manuelles activées.':'Mise en page adaptative activée.';queueSave();render();}
    else if(action==='widget-move'){moveWidget(target.dataset.id,Number(target.dataset.step)||0);}
    else if(action==='widget-resize'){resizeWidget(target.dataset.id,Number(target.dataset.step)||0);}
    else if(action==='widget-height'){resizeWidgetHeight(target.dataset.id,Number(target.dataset.step)||0);}
    else if(action==='deck-widget-open'){const boardId=target.dataset.boardId;void chooseWorkspace('deck').then(()=>{if(boardId)void loadDeckStacks(boardId);});}
    else if(action==='integr-refresh'){void loadIntegration(target.dataset.integrId,true);}
    else if(action==='talk-open'){const token=target.dataset.token||'';if(integrations.talk.items.some(r=>r.token===token)){talkChat.token=token;talkChat.messages=[];talkChat.cursor=0;talkChat.hasMore=false;talkChat.draft='';void loadTalkChat(false);}}
    else if(action==='talk-back'){talkChat.generation++;talkChat.token='';talkChat.error='';render();if(!demo)void loadIntegration('talk',true);}
    else if(action==='talk-reload'){void loadTalkChat(false);}
    else if(action==='talk-mark-read'){void markTalkChatRead();}
    else if(action==='talk-older'){void loadTalkChat(true);}
    else if(action==='contact-open'){const idx=Number(target.dataset.index);if(Number.isInteger(idx)&&idx>=0&&integrations.contacts.items[idx]){contactDetail=idx;contactDelete.open=false;render();}}
    else if(action==='contact-back'){contactDetail=-1;contactEditor.open=false;contactDelete.open=false;render();}
    else if(action==='contacts-more'){contactDisplayCount=Math.min(integrations.contacts.items.length,contactDisplayCount+CONTACT_PAGE_SIZE);render();}
    else if(action==='contact-new'){void contactOpenEditor('new');}
    else if(action==='contact-edit'){void contactOpenEditor('edit');}
    else if(action==='contact-cancel'){contactCloseEditor();}
    else if(action==='contact-delete-start'){contactStartDelete();}
    else if(action==='contact-delete-cancel'){
      if(contactDelete.busy)return;
      contactDelete.open=false;contactDelete.error='';render();
      surface.querySelector('[data-action="contact-delete-start"]')?.focus({preventScroll:true});
    }
    else if(action==='contact-delete-confirm'){void contactConfirmDelete();}
    else if(action==='mail-compose-new'){mailOutbox.open=false;mailDrafts.open=false;mailOpenComposer('new');}
    else if(action==='mail-drafts-open'){if(mailComposer.open){mailCloseComposer();if(mailComposer.open)return;}mailOutbox.open=false;void mailLoadDrafts();}
    else if(action==='mail-drafts-close'){mailDrafts.open=false;mailDrafts.generation++;mailDrafts.selected=null;mailDrafts.loaded=false;mailDrafts.loading=false;render();}
    else if(action==='mail-drafts-refresh'){void mailLoadDrafts();}
    else if(action==='mail-draft-back'){mailDrafts.generation++;mailDrafts.selected=null;mailDrafts.body='';mailDrafts.html='';mailDrafts.loaded=false;mailDrafts.loading=false;render();}
    else if(action==='mail-draft-open'){const idx=Number(target.dataset.index);if(Number.isInteger(idx))void mailOpenDraft(idx);}
    else if(action==='mail-draft-retry'){const idx=mailDrafts.items.indexOf(mailDrafts.selected);if(idx>=0&&!mailDrafts.loading)void mailOpenDraft(idx);}
    else if(action==='mail-older'){mailDisplayCount+=MAIL_PAGE_SIZE;void loadOlderMail();render();}
    else if(action==='mail-read-retry'){if(mailReader.index>=0&&!mailReader.loading)void openMailMessage(mailReader.index);}
    else if(action==='mail-draft-copy'){void mailResumeDraftAsCopy();}
    else if(action==='mail-outbox-open'){if(mailComposer.open){mailCloseComposer();if(mailComposer.open)return;}mailOutbox.open=true;void mailLoadOutbox();}
    else if(action==='mail-outbox-close'){mailOutbox.open=false;render();}
    else if(action==='mail-outbox-refresh'){void mailLoadOutbox();}
    else if(action==='mail-draft-save'){void mailSaveDraft();}
    else if(action==='mail-check-send'){void mailCheckSending();}
    else if(action==='mail-reply'){mailOpenComposer('reply');}
    else if(action==='mail-compose-close'){mailCloseComposer();}
    else if(action==='mail-filter'){mailUnreadOnly=target.dataset.unread==='true';render();surface.querySelector(`[data-action="mail-filter"][data-unread="${mailUnreadOnly}"]`)?.focus({preventScroll:true});}
    else if(action==='talk-filter'){talkUnreadOnly=target.dataset.unread==='true';render();surface.querySelector(`[data-action="talk-filter"][data-unread="${talkUnreadOnly}"]`)?.focus({preventScroll:true});}
    else if(action==='mail-open'){const idx=Number(target.dataset.index);if(Number.isInteger(idx))void openMailMessage(idx);}
    else if(action==='mail-back'){closeMailReader();}
    else if(action==='mail-display'){mailReader.display=target.dataset.mode==='plain'?'plain':'formatted';render();}
    else if(action==='mail-prev'&&mailReader.index>0){void openMailMessage(mailReader.index-1);}
    else if(action==='mail-next'&&mailReader.index<integrations.mail.items.length-1){void openMailMessage(mailReader.index+1);}
    else if(action==='activity-older'){
      const periodDays=activityPeriod==='7'?7:activityPeriod==='30'?30:0;
      const cutoff=periodDays?Date.now()-periodDays*86400000:0;
      const matching=integrations.activity.items.filter(item=>(activityCategory==='all'||item.category===activityCategory)&&(!periodDays||(Number(item.timestamp)>0&&Number(item.timestamp)>=cutoff)));
      if(matching.length>activityDisplayCount){activityDisplayCount+=ACTIVITY_PAGE_SIZE;render();surface.querySelector('[data-action="activity-older"]')?.focus({preventScroll:true});}
      else void loadOlderActivities();
    }
    else if(action==='activity-filter'){const cat=target.dataset.category;if(['all','files','deck','talk','other'].includes(cat)){activityCategory=cat;activityDisplayCount=ACTIVITY_PAGE_SIZE;render();surface.querySelector(`[data-action="activity-filter"][data-category="${cat}"]`)?.focus({preventScroll:true});}}
    else if(action==='tasks-more'){taskVisible+=TASK_PAGE_SIZE;render();(surface.querySelector('[data-action="tasks-more"]')||surface.querySelector('[data-task-search]'))?.focus({preventScroll:true});}
    else if(action==='files-more'){void loadMoreFiles();}
    else if(action==='module-refresh'){if(activeWorkspace==='photos')void loadPhotos(true);else if(activeWorkspace==='deck')void loadDeck(true);else if(activeWorkspace==='notes')void loadNotes(true);}
    else if(action==='photo-open'){photoLightbox(Number(target.dataset.photoIndex));}
    else if(action==='note-search-clear'){
      const field=surface.querySelector('[data-note-search]');
      if(field){field.value='';updateNoteSearch({target:field});field.focus({preventScroll:true});}
    }
    else if(action==='note-select'){noteSelect(target.dataset.noteId);}
    else if(action==='note-new'){void noteCreate();}
    else if(action==='note-save'){void noteSave();}
    else if(action==='note-preview-toggle'){noteView=noteView==='edit'?'preview':'edit';render();}
    else if(action==='gw-new'){groupwareEditor(target.dataset.gwType||'task');}
    else if(action==='cal-view'){calendarView=target.dataset.view==='week'?'week':'month';render();}
    else if(action==='cal-prev'){moveCalendar(-1);}
    else if(action==='cal-next'){moveCalendar(1);}
    else if(action==='cal-today'){moveCalendar('today');}
    else if(action==='cal-day'){groupwareEditor('event',null,target.dataset.date);}
    else if(action==='cal-event'){calendarEventDetail(target.dataset.href||'');}
    else if(action==='plan-range'){planningRange=[7,30,90].includes(Number(target.dataset.days))?Number(target.dataset.days):30;if(!calendarWindowReady()&&!demo)void loadGroupware(true);else render();}
    else if(action==='plan-kind'){const kind=target.dataset.kind;if(['event','task','deck'].includes(kind)){if(planningKinds.has(kind))planningKinds.delete(kind);else planningKinds.add(kind);render();}}
    else if(action==='plan-urgent'){planningUrgentOnly=!planningUrgentOnly;render();}
    else if(action==='plan-clear'){planningSearch='';planningUrgentOnly=false;render();}
    else if(action==='plan-refresh'){void loadGroupware(true);void loadPlanningDeck(true);}
    else if(action==='plan-event'){calendarEventDetail(target.dataset.href||'');}
    else if(action==='plan-task'){const entry=groupware.tasks.find(t=>t.href===target.dataset.href);if(entry)groupwareEditor('task',entry);}
    else if(action==='plan-deck'){void planningDeckOpen(target.dataset.boardId,target.dataset.stackId,target.dataset.cardId);}
    else if(action==='plan-deck-toggle'){void togglePlanningDeckDone(target.dataset.boardId,target.dataset.stackId,target.dataset.cardId);}
    else if(action==='task-search-clear'){taskQuery='';taskVisible=TASK_PAGE_SIZE;render();surface.querySelector('[data-task-search]')?.focus({preventScroll:true});}
    else if(action==='task-view'){taskVisible=TASK_PAGE_SIZE;taskView=['open','today','overdue','upcoming','undated','done','all'].includes(target.dataset.view)?target.dataset.view:'open';render();surface.querySelector('[data-action="task-view"][data-view="'+taskView+'"]')?.focus({preventScroll:true});}
    else if(action==='gw-refresh'){void loadGroupware(true);}
    else if(action==='gw-toggle-done'){void toggleTaskDone(target.dataset.href);}
    else if(action==='home-task-view'){
      taskView=target.dataset.view==='overdue'?'overdue':'today';
      taskQuery='';taskList='';taskVisible=TASK_PAGE_SIZE;
      void chooseWorkspace('tasks');
    }
    else if(action==='home-task-open'){
      const record=groupware.tasks.find(t=>t.href===target.dataset.href);
      if(record?.source==='deck'&&record.deckBoardId&&record.deckCardId&&availableApps().has('deck'))void openDeckFromVirtual(record);
      else void chooseWorkspace('tasks').then(()=>{if(record&&record.source!=='deck'&&record.writable!==false)groupwareEditor('task',record);});
    }
    else if(action==='gw-edit-task'){const record=groupware.tasks.find(t=>t.href===target.dataset.href);if(record)groupwareEditor('task',record);}
    else if(action==='deck-board'){if(deckMoveBusy){toast('Déplacement en cours…');return;}void loadDeckStacks(Number(target.dataset.boardId));}
    else if(action==='deck-add'){deckCreateCard(target.dataset.stackId);}
    else if(action==='deck-filters-clear'){
      Object.assign(deckFilters,{query:'',status:'all',due:'all'});
      renderDeckFilters('[data-deck-search]');
    }
    else if(action==='deck-card-open'){void openDeckCard(target.dataset.stackId,target.dataset.cardId);}
    else if (action === 'toggle-hub') { if(popMode === 'hub') hidePop(); else {popMode = 'hub'; renderHubPanel();} }
    else if(action==='history-back'&&historyIndex>0){historyIndex--;void browse(history[historyIndex],true,false);}
    else if(action==='history-forward'&&historyIndex<history.length-1){historyIndex++;void browse(history[historyIndex],true,false);}
    else if (action === 'browse-path') { if((event.ctrlKey||event.metaKey||event.shiftKey)&&target.closest('[data-file-row]'))toggleFileSelection(target.dataset.path||'',event.shiftKey);else void browse(target.dataset.path || '/'); }
    else if (action === 'reload-folder') { void browse(browser.path, false); }
    else if (action === 'toggle-view') { browser.view = browser.view === 'grid' ? 'list' : 'grid'; render(); }
    else if (action === 'pin-folder') {
      const path = target.dataset.path; if (!path) return;
      const current = settings.pins || [];
      settings.pins = current.includes(path) ? current.filter(x => x !== path) : [...current, path].slice(0,12);
      queueSave(); render();
    }
    else if (action === 'select-entry') { if(event.ctrlKey||event.metaKey||event.shiftKey)toggleFileSelection(target.dataset.path||'',event.shiftKey);else void selectEntry(target.dataset.path || ''); }
    else if(action==='file-menu'){contextPath=target.dataset.path||'';popMode='context';renderContextMenu();}
    else if(action==='files-select-all'){selectAllFiles();}
    else if(action==='files-clear'){fileSelection.clear();fileAnchorPath='';refreshSelectionDisplay();}
    else if(action==='files-copy'){copyOrCutFiles('copy');}
    else if(action==='files-cut'){copyOrCutFiles('cut');}
    else if(action==='files-delete'){void deleteFiles();}
    else if(action==='files-paste'){void pasteFiles();}
    else if(action==='files-cancel-paste'){fileClipboard.mode='';fileClipboard.entries=[];refreshSelectionDisplay();}
    else if(action==='files-duplicate'){void duplicateFiles();}
    else if(action==='files-copy-to'){openDestinationPicker('copy');}
    else if(action==='files-move-to'){openDestinationPicker('cut');}
    else if(action==='copy-selected-link'){void copyCurrentLink(preview.entry);}
    else if(action==='download-selected'){downloadCurrent(preview.entry);}
    else if(action==='share-selected'){void shareEntry(preview.entry);}
    else if(action==='expand-preview'){fullPreview=true;renderFullPreview();}
    else if(action==='preview-markdown'){markdownPreview=!markdownPreview;renderPreview();}
    else if(action==='new-folder'){void createFolder();}
    else if(action==='upload-trigger'){surface.querySelector('[data-upload-input]')?.click();}
    else if (action === 'open-file') { const entry = browser.items.find(x => x.path === target.dataset.path); if (entry?.url) window.location.assign(entry.url); }
    else if (action === 'save-note') {
      const note=(homeNoteDraft??surface.querySelector('#neos-note')?.value??'').trim();
      if(new TextEncoder().encode(note).length>3000){setHomeNoteStatus('Note trop longue. Raccourcis-la avant d’enregistrer.');return;}
      homeNoteDraft=note;settings.notes=note;
      if(demo){setHomeNoteStatus('Enregistrée pour cet aperçu');return;}
      setHomeNoteStatus('Enregistrement…');queueSave();
    }
    else if (action === 'preview-dav') { void previewFromDav(target.dataset.url || '', target.dataset.name || '', target.dataset.mime || '', Number(target.dataset.size)||0, target.dataset.path||''); }
    pulse(target);
  });

  surface.addEventListener('submit',event=>{if(event.target.matches('[data-talk-form]')){event.preventDefault();void sendTalkMessage();}else if(event.target.matches('[data-contact-form]')){event.preventDefault();void contactSave(event.target);}else if(event.target.matches('[data-mail-compose-form]')){event.preventDefault();void mailSendComposer();}});
  surface.addEventListener('keydown',event=>{if(event.target.matches('[data-talk-draft]')&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void sendTalkMessage();}});
  surface.addEventListener('change',event=>{
    if(!event.target.matches('[data-task-list]'))return;
    taskList=event.target.value;taskVisible=TASK_PAGE_SIZE;render();
    surface.querySelector('[data-task-list]')?.focus({preventScroll:true});
  });
  surface.addEventListener('input',updateDeckSearch);
  surface.addEventListener('compositionend',updateDeckSearch);
  surface.addEventListener('change',event=>{
    const field=event.target;
    if(!field.matches('[data-deck-filter]'))return;
    const key=field.dataset.deckFilter;
    const options=key==='status'?deckStatusOptions:key==='due'?deckDueOptions:[];
    if(!options.some(([id])=>id===field.value))return;
    deckFilters[key]=field.value;
    renderDeckFilters('[data-deck-filter="'+key+'"]');
  });
  surface.addEventListener('input',updateNoteSearch);
  surface.addEventListener('compositionend',updateNoteSearch);
  surface.addEventListener('input',updateTaskSearch);
  surface.addEventListener('compositionend',updateTaskSearch);
  surface.addEventListener('input', event => {
    const el = event.target;
    if(el.matches('[data-mail-compose-field]')){const field=el.dataset.mailComposeField;if(Object.hasOwn(mailComposer.fields,field)){if(mailComposer.fields[field]!==el.value){mailComposer.fields[field]=el.value;mailComposer.dirty=true;}}return;}
    if(el.matches('[data-talk-draft]')){talkChat.draft=el.value.slice(0,32000);return;}
    if(el.matches('[data-integr-search]')){
      const id=el.dataset.integrSearch;if(integratedIds.has(id)){integrationQueries[id]=el.value.slice(0,90);if(id==='contacts')contactDisplayCount=CONTACT_PAGE_SIZE;const cursor=el.selectionStart;render();const next=surface.querySelector(`[data-integr-search="${id}"]`);if(next){next.focus({preventScroll:true});if(cursor!==null)next.setSelectionRange(cursor,cursor);}}return;
    }
    if(el.matches('[data-planning-search]')){
      planningSearch=el.value.slice(0,80);
      const cursor=el.selectionStart;render();
      const next=surface.querySelector('[data-planning-search]');
      if(next){next.focus({preventScroll:true});if(cursor!==null)next.setSelectionRange(cursor,cursor);}
      return;
    }
    if(el.matches('[data-browser-search]')){ browser.query=el.value; const results=surface.querySelector('#neos-file-results');if(results)results.innerHTML=browserItems();const tb=surface.querySelector('[data-selection-toolbar]');if(tb)tb.innerHTML=selectionToolbar(); }
    if (el.matches('#neos-note')) settings.notes = el.value;
    if(el.matches('#neos-note')){homeNoteDraft=el.value;setHomeNoteStatus('Modifications non enregistrées');return;}
    if(el.matches('[data-note-title]')){notesState.draftTitle=el.value;notesState.dirty=true;surface.querySelector('[data-note-status]')?.replaceChildren(document.createTextNode('Modifications non enregistrées'));}
    if(el.matches('[data-note-content]')){notesState.draftContent=el.value;notesState.dirty=true;surface.querySelector('[data-note-status]')?.replaceChildren(document.createTextNode('Modifications non enregistrées'));const count=surface.querySelector('[data-note-count]');if(count)count.textContent=(el.value.trim()?el.value.trim().split(/\s+/).length:0)+' mots';}
  });
  surface.addEventListener('change', event => {
    const uploadEl = event.target;
    if(uploadEl.matches('[data-upload-input]')){ const files=uploadEl.files; void uploadSelection(files); uploadEl.value=''; }
  });
  surface.addEventListener('change', event => {
    const el = event.target;
    if(el.matches('[data-mail-compose-field]')){const field=el.dataset.mailComposeField;if(Object.hasOwn(mailComposer.fields,field)){if(mailComposer.fields[field]!==el.value){mailComposer.fields[field]=el.value;mailComposer.dirty=true;}}return;}
    if(el.matches('[data-contact-book-filter]')){contactBookFilter=el.value||'all';contactDisplayCount=CONTACT_PAGE_SIZE;render();surface.querySelector('[data-contact-book-filter]')?.focus({preventScroll:true});return;}
    if(el.matches('[data-activity-period]')){activityPeriod=['all','7','30'].includes(el.value)?el.value:'all';activityDisplayCount=ACTIVITY_PAGE_SIZE;render();surface.querySelector('[data-activity-period]')?.focus({preventScroll:true});return;}
    if(el.matches('[data-mail-folder]')){mailFolderFilter=el.value||'all';render();surface.querySelector('[data-mail-folder]')?.focus({preventScroll:true});return;}
    if(el.matches('[data-mail-draft-folder]')){mailDrafts.selectedMailbox=el.value||'auto';void mailLoadDrafts();return;}
    if(el.matches('[data-browser-sort]')){ browser.sort=el.value; const results=surface.querySelector('#neos-file-results');if(results)results.innerHTML=browserItems();const tb=surface.querySelector('[data-selection-toolbar]');if(tb)tb.innerHTML=selectionToolbar();animateRows(); }
    if(el.matches('[data-browser-type]')){ browser.type=el.value; const results=surface.querySelector('#neos-file-results');if(results)results.innerHTML=browserItems();const tb=surface.querySelector('[data-selection-toolbar]');if(tb)tb.innerHTML=selectionToolbar();animateRows(); }
  });

  popHost.addEventListener('change',event=>{
    const select=event.target.closest('[data-global-filter]');if(!select)return;
    globalSearch[select.dataset.globalFilter]=select.value;
    globalSearchGeneration++;clearTimeout(globalSearchTimer);
    if(globalSearch.query.trim().length>=2)void executeGlobalSearch();else renderGlobalSearchResults();
  });
  popHost.addEventListener('input',event=>{
    if(!event.target.matches('[data-global-search]'))return;
    globalSearch.query=event.target.value.slice(0,100);
    globalSearchGeneration++;
    globalSearch.items=[];globalSearch.error='';
    clearTimeout(globalSearchTimer);
    if(globalSearch.query.trim().length<2){globalSearch.loading=false;renderGlobalSearchResults();return;}
    globalSearch.loading=true;renderGlobalSearchResults();
    globalSearchTimer=setTimeout(()=>void executeGlobalSearch(),340);
  });
  popHost.addEventListener('input',event=>{
    if(!event.target.matches('[data-destination-search]')||!pickerState)return;
    pickerState.search=event.target.value;
    const target=popHost.querySelector('[data-destination-results]');
    if(target){const q=pickerState.search.toLocaleLowerCase('fr');const found=pickerState.folders.filter(f=>f.name.toLocaleLowerCase('fr').includes(q));
      target.innerHTML=found.map(f=>`<button type="button" class="neos-destination-folder" data-action="destination-browse" data-path="${esc(f.path)}">${icon('folder',19)}<span>${esc(f.name)}</span>${icon('chevron',16)}</button>`).join('')||'<div class="neos-destination-empty" role="status">Aucun dossier correspondant</div>';
    }
  });
  uploadHost.addEventListener('click',event=>{
    const btn=event.target.closest('[data-upload-action]');if(!btn)return;
    if(btn.dataset.uploadAction==='cancel'&&uploadState.active){uploadState.cancel=true;uploadState.xhr?.abort();uploadProgressUi();}
    else if(btn.dataset.uploadAction==='dismiss'&&!uploadState.active){uploadState.finished=false;uploadProgressUi();}
  });

  editorHost.addEventListener('click', event => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'editor-backdrop' && event.target === actionEl) { closeEditor(); return; }
    if (action === 'close-editor') { closeEditor(); return; }
    if (action === 'arrange') { closeEditor(true); return; }
    if(action==='tab-order-up'||action==='tab-order-down'){moveTabStep(actionEl.dataset.tab,action==='tab-order-up'?-1:1);return;}
    if(action==='tab-order-reset'){resetTabOrder();return;}
    if (action === 'add-link') { harvestLinks(); if ((settings.links || []).length < 12) settings.links.push({title:'Lien', url:'/'}); queueSave(); renderEditor(); render(); }
    if (action === 'remove-link') { harvestLinks(); settings.links.splice(Number(actionEl.dataset.index), 1); queueSave(); renderEditor(); render(); }
    if (action === 'move-up' || action === 'move-down') {
      const id = actionEl.dataset.id; const idx = settings.order.indexOf(id); const next = idx + (action === 'move-up' ? -1 : 1); if (idx < 0 || next < 0 || next >= settings.order.length) return;
      [settings.order[idx], settings.order[next]] = [settings.order[next], settings.order[idx]]; queueSave(); renderEditor(); render();
    }
  });
  editorHost.addEventListener('change', event => {
    const el = event.target;
    if (el.matches('input[type="radio"]')) {
      settings[el.name] = el.value;
      if (el.name === 'launcherMode' && el.value === 'widget') settings.hidden = settings.hidden.filter(id=>id!=='shortcuts');
      queueSave(); render();
      if (el.name === 'launcherMode' || el.name === 'gridMode') renderEditor();
    }
    else if (el.matches('[data-toggle]')) { const id = el.dataset.toggle; settings.hidden = el.checked ? settings.hidden.filter(x => x !== id) : [...settings.hidden, id]; queueSave(); render(); if(id==='deck'&&el.checked&&deckState.status==='idle')void loadDeck(); if(el.checked&&['summary','tasks'].includes(id)&&groupware.status==='idle')void loadGroupware(); }
    else if (el.matches('[data-size]')) { settings.sizes[el.dataset.size] = Number(el.value); queueSave(); render(); }
    else if (el.matches('[data-height]')) { settings.heights[el.dataset.height] = Number(el.value); queueSave(); render(); }
    else if (el.matches('[data-topapp]')) {
      const id = el.dataset.topapp;
      settings.topApps = el.checked ? [...new Set([...(settings.topApps || []), id])] : (settings.topApps || []).filter(x => x !== id);
      queueSave(); render();
    }
    else if (el.matches('[data-link-title],[data-link-url]')) { harvestLinks(); queueSave(); }
  });
  editorHost.addEventListener('dragstart',event=>{
    const row=event.target.closest('[data-editor-tab]');if(!row)return;
    dragEditorTabId=row.dataset.editorTab;
    if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','neos-tab:'+dragEditorTabId);}
    row.classList.add('neos-tab-order-dragging');
  });
  editorHost.addEventListener('dragover',event=>{
    if(!dragEditorTabId)return;
    const row=event.target.closest('[data-editor-tab]');if(!row||row.dataset.editorTab===dragEditorTabId)return;
    event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    editorHost.querySelectorAll('.neos-tab-order-over').forEach(el=>el.classList.remove('neos-tab-order-over'));
    row.classList.add('neos-tab-order-over');
  });
  editorHost.addEventListener('drop',event=>{
    if(!dragEditorTabId)return;
    event.preventDefault();const row=event.target.closest('[data-editor-tab]');
    const source=dragEditorTabId;dragEditorTabId='';clearTabDragHints();
    if(!row)return;
    const bounds=row.getBoundingClientRect();moveTab(source,row.dataset.editorTab,event.clientY>bounds.top+bounds.height/2);
  });
  editorHost.addEventListener('dragend',()=>{dragEditorTabId='';clearTabDragHints();});

  document.addEventListener('keydown', event => {
    // In an integrated module, Escape clears only the focused search.
    // It must never close a modal, wipe an editor draft or navigate away.
    const target=event.target;
    if(event.key==='Escape'&&!editorOpen&&!popMode&&!fullPreview&&target?.matches?.('[data-integr-search]')){
      const id=target.dataset.integrSearch;
      if(integratedIds.has(id)&&integrationQueries[id]){
        event.preventDefault();event.stopPropagation();
        integrationQueries[id]='';if(id==='contacts')contactDisplayCount=CONTACT_PAGE_SIZE;
        render();surface.querySelector(`[data-integr-search="${id}"]`)?.focus({preventScroll:true});
        return;
      }
    }
    if (event.key === 'Escape') {
      if(neosDialogBusy()){ event.preventDefault();event.stopPropagation();return; }
      if (editorOpen) { event.preventDefault(); closeEditor(); }
      else if (popMode || fullPreview) { event.preventDefault(); hidePop(); }
      else if (activeWorkspace==='contacts' && contactDelete.open && !contactDelete.busy) {
        event.preventDefault(); contactDelete.open=false; contactDelete.error=''; render();
        surface.querySelector('[data-action="contact-delete-start"]')?.focus({preventScroll:true});
      }
    }
    if(popMode==='deck-card'&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void saveDeckCard();return;}
    if(!editorOpen&&!popMode&&!fullPreview&&activeWorkspace==='notes'&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void noteSave();return;}
    if(!editorOpen&&!popMode&&!fullPreview&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openGlobalSearch();return;}
    if(!editorOpen&&!popMode&&!fullPreview&&activeWorkspace==='files'&& !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')){
      const key=event.key.toLowerCase();
      if((event.ctrlKey||event.metaKey)&&key==='a'){event.preventDefault();selectAllFiles();}
      else if((event.ctrlKey||event.metaKey)&&key==='c'&&fileSelection.size){event.preventDefault();copyOrCutFiles('copy');}
      else if((event.ctrlKey||event.metaKey)&&key==='x'&&fileSelection.size){event.preventDefault();copyOrCutFiles('cut');}
      else if((event.ctrlKey||event.metaKey)&&key==='v'&&fileClipboard.entries.length){event.preventDefault();void pasteFiles();}
      else if(event.key==='Delete'&&fileSelection.size){event.preventDefault();void deleteFiles();}
    }
    if(!editorOpen&&!popMode&&!fullPreview&&event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&
       !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')&&!document.activeElement?.isContentEditable){
      // Keep slash local to the current integrated module; never unexpectedly
      // navigate from Contacts / Mail / Talk / Activity to Files.
      const localSearch=integratedIds.has(activeWorkspace)
        ?surface.querySelector(`[data-integr-search="${activeWorkspace}"]`)
        :activeWorkspace==='planning'?surface.querySelector('[data-planning-search]')
        :activeWorkspace==='files'?surface.querySelector('[data-browser-search]'):null;
      if(localSearch){event.preventDefault();localSearch.focus({preventScroll:true});}
      else if(!integratedIds.has(activeWorkspace)&&activeWorkspace!=='planning'){
        event.preventDefault();void chooseWorkspace('files').then(()=>surface.querySelector('[data-browser-search]')?.focus());
      }
    }
  }, true);
  popHost.addEventListener('keydown',event=>{
    if(popMode!=='destination'||event.altKey||event.ctrlKey||event.metaKey)return;
    const folders=[...popHost.querySelectorAll('.neos-destination-folder')];
    if(event.target.matches?.('[data-destination-search]')){
      if(event.key==='ArrowDown'&&folders.length){event.preventDefault();event.stopPropagation();folders[0].focus({preventScroll:true});}
      return;
    }
    const current=event.target.closest?.('.neos-destination-folder');
    const index=folders.indexOf(current);
    if(index<0)return;
    const next=event.key==='ArrowDown'?folders[Math.min(index+1,folders.length-1)]:
      event.key==='ArrowUp'?(index?folders[index-1]:popHost.querySelector('[data-destination-search]')):
      event.key==='Home'?folders[0]:event.key==='End'?folders[folders.length-1]:null;
    if(next){event.preventDefault();event.stopPropagation();next.focus({preventScroll:true});}
  });
  popHost.addEventListener('keydown',event=>{
    if(popMode!=='global-search'||event.altKey||event.ctrlKey||event.metaKey)return;
    const tab=event.target.closest?.('[data-action="search-tab"]');
    if(!tab)return;
    const next=nextSearchTab(tab.dataset.tab,event.key);
    if(!next)return;
    event.preventDefault();event.stopPropagation();selectSearchPanelTab(next);
  });
  popHost.addEventListener('click', event => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action=actionEl.dataset.action;
    if(neosDialogBusy() && ['close-pop','deck-card-close','destination-close'].includes(action))return;
    if(action==='workspace') { const id=actionEl.dataset.workspace; hidePop(); void chooseWorkspace(id); return; }
    if(action==='cal-edit'){const event=groupware.events.find(item=>calendarEventKey(item)===actionEl.dataset.href);if(editableCalendarEvent(event))groupwareEditor('event',event,null,actionEl.dataset.scope||'series');return;}
    if(action==='gw-save'){void saveGroupware();return;}
    if(action==='deck-card-close'){hidePop();return;}
    if(action==='deck-card-save'){void saveDeckCard();return;}
    if(action==='search-tab'){
      selectSearchPanelTab(actionEl.dataset.tab||'search');
      return;
    }
    if(action==='recent-clear'){
      recentViewed.splice(0);
      try{localStorage.removeItem(recentStorageKey());}catch{/* No local persistence */}
      renderGlobalSearchResults();toast('Historique local effacé','success');return;
    }
    if(action==='quick-favorite'){
      const path=actionEl.dataset.path;
      const entry=[...favoriteState.items,...recentViewed,...globalSearch.items].find(x=>x.path===path);
      if(entry)void toggleFavorite(entry);
      return;
    }
    if(action==='quick-preview'||action==='quick-parent'){
      const path=actionEl.dataset.path||'';
      const target=[...globalSearch.items,...favoriteState.items,...recentViewed].find(x=>x.path===path);
      if(!target)return;
      globalSearchGeneration++;clearTimeout(globalSearchTimer);popMode='';popHost.replaceChildren();
      void (async()=>{
        await chooseWorkspace('files');
        const folder=target.parent||target.path.slice(0,target.path.lastIndexOf('/'))||'/';
        await browse(folder,true);
        if(action==='quick-preview'&&target.kind==='file'&&activeWorkspace==='files'&&browser.path===folder&&!browser.error){
          if(browser.items.some(item=>item.path===target.path))await selectEntry(target.path);
          else if(!demo)await previewSearchFile(target);
          if(preview.entry?.path===target.path){fullPreview=true;renderFullPreview();}
        }
      })();
      return;
    }
    if(action==='search-more'){
      void executeGlobalSearch(true).then(()=>{if(popMode==='global-search'&&searchPanelTab==='search'&&document.activeElement===document.body) (popHost.querySelector('[data-action="search-more"]')||popHost.querySelector('[data-global-search-results]'))?.focus({preventScroll:true});});
      return;
    }
    if(action==='search-open'){
      const path=actionEl.dataset.path||'';
      const parent=actionEl.dataset.parent||'/';
      const target=[...globalSearch.items,...favoriteState.items,...recentViewed].find(x=>x.path===path);
      if(!target)return;
      globalSearchGeneration++;clearTimeout(globalSearchTimer);
      hidePop();
      void (async()=>{
        await chooseWorkspace('files');
        await browse(target.kind==='folder'?path:parent,true);
        if(target.kind==='file'&&activeWorkspace==='files'&&browser.path===parent&&!browser.error){
          if(browser.items.some(item=>item.path===path))await selectEntry(path);
          else if(!demo)await previewSearchFile(target);
        }
      })();
      return;
    }
    if(action==='close-full-preview'){if(event.target===actionEl||actionEl.tagName==='BUTTON'){hidePop();}return;}
    if(action==='download-selected'){downloadCurrent(preview.entry);return;}
    if(action==='preview-markdown'){markdownPreview=!markdownPreview;renderFullPreview();return;}
    if(action==='destination-close'){pickerGeneration++;pickerState=null;hidePop();return;}
    if(action==='destination-up'){const parts=pickerState?.path.split('/').filter(Boolean)||[];parts.pop();void browseDestination('/'+parts.join('/'));return;}
    if(action==='destination-browse'){void browseDestination(actionEl.dataset.path||'/');return;}
    if(action==='destination-more'){void loadMoreDestinations();return;}
    if(action==='destination-confirm'){destinationConfirm();return;}
    if(action==='menu-copy-to'||action==='menu-move-to'){
      const entry=browser.items.find(x=>x.path===contextPath);
      if(entry)openDestinationPicker(action==='menu-move-to'?'cut':'copy',[entry]);
      return;
    }
    if(['menu-preview','menu-download','menu-copy','menu-share','menu-rename','menu-delete','menu-open-folder','menu-duplicate','menu-cut','menu-copy-file','menu-favorite'].includes(action)){const entry=browser.items.find(x=>x.path===contextPath);if(!entry)return;hidePop();if(action==='menu-preview')void selectEntry(contextPath);else if(action==='menu-download')downloadCurrent(entry);else if(action==='menu-favorite')void toggleFavorite(entry);else if(action==='menu-copy')void copyCurrentLink(entry);else if(action==='menu-share')void shareEntry(entry);else if(action==='menu-rename')void renameEntry(entry);else if(action==='menu-delete')void deleteEntry(entry);else if(action==='menu-open-folder')void browse(entry.path);else if(action==='menu-duplicate')void duplicateFiles([entry]);else if(action==='menu-cut')copyOrCutFiles('cut',[entry]);else if(action==='menu-copy-file')copyOrCutFiles('copy',[entry]);return;}
    if(action==='close-pop'){if(event.target===actionEl||actionEl.tagName==='BUTTON'){hidePop();}}
  });

  function flashLayoutOrder(changedId){
    const cards=[...surface.querySelectorAll('.neos-home-grid [data-widget]')];
    if(motionEnabled()){
      cards.slice(0,12).forEach((el,i)=>el.animate?.([{opacity:.75,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:320*motionFactor(),delay:i*18*motionFactor(),easing:'cubic-bezier(.16,1,.3,1)'}));
    }
    const moved=surface.querySelector(`.neos-home-grid [data-widget="${changedId}"]`);
    moved?.classList.add('neos-just-moved');
    setTimeout(()=>moved?.classList.remove('neos-just-moved'),750);
  }
  function reorderWidget(id,targetId,after=false){
    if(!editing||activeWorkspace!=='home'||!widgetIds.includes(id)||!widgetIds.includes(targetId)||id===targetId)return;
    const next=[...settings.order];const from=next.indexOf(id);if(from<0)return;
    next.splice(from,1);
    let at=next.indexOf(targetId);if(at<0)return;
    if(after)at++;
    next.splice(at,0,id);
    settings.order=next;
    layoutAnnounce=`${widgetLabels[id]} déplacé.`;
    queueSave();render();flashLayoutOrder(id);
  }
  function moveWidget(id,delta){
    const visible=settings.order.filter(key=>!settings.hidden.includes(key)&&(key!=='shortcuts'||settings.launcherMode==='widget'));
    const i=visible.indexOf(id);const to=visible[i+delta];if(!to)return;
    reorderWidget(id,to,delta>0);
  }
  function resizeWidget(id,delta){
    if(settings.gridMode!=='manual')return;
    const current=widgetSpan(id);const idx=allowedSizes.indexOf(current);
    const next=allowedSizes[Math.max(0,Math.min(allowedSizes.length-1,idx+delta))];
    if(next===current)return;
    settings.sizes[id]=next;layoutAnnounce=`${widgetLabels[id]} : ${Math.round(next/12*100)} % de largeur.`;
    queueSave();render();flashLayoutOrder(id);
  }
  function resizeWidgetHeight(id,delta){
    if(settings.gridMode!=='manual')return;
    const current=widgetMinHeight(id);const i=allowedHeights.indexOf(current);
    let next=allowedHeights[Math.max(0,Math.min(allowedHeights.length-1,i+delta))];
    if(delta>0&&current===0){
      const card=surface.querySelector(`.neos-home-grid [data-widget="${id}"]`);
      const naturalHeight=Math.ceil((card?.getBoundingClientRect().height||160)+20);
      next=allowedHeights.find(h=>h>=naturalHeight)||allowedHeights[allowedHeights.length-1];
    }
    if(next===current)return;
    settings.heights[id]=next;
    layoutAnnounce=`${widgetLabels[id]} : hauteur ${next?next+' pixels':'automatique'}.`;
    queueSave();render();flashLayoutOrder(id);
  }
  function clearDropGuide(){surface.querySelectorAll('.neos-drop-before,.neos-drop-after,.neos-is-dragging').forEach(el=>el.classList.remove('neos-drop-before','neos-drop-after','neos-is-dragging'));}
  function clearDeckDropGuide(){surface.querySelectorAll('.neos-deck-drop-target,.neos-deck-dragging').forEach(el=>el.classList.remove('neos-deck-drop-target','neos-deck-dragging'));}
  surface.addEventListener('dragstart',event=>{
    if(activeWorkspace!=='deck'||deckMoveBusy||deckState.status!=='ready')return;
    const card=event.target.closest('.neos-deck-card[data-card-id]');if(!card)return;
    deckDrag={boardId:String(deckState.boardId),cardId:card.dataset.cardId,stackId:card.dataset.stackId};
    if(event.dataTransfer){event.dataTransfer.setData('application/x-neos-deck-card',JSON.stringify(deckDrag));event.dataTransfer.effectAllowed='move';}
    card.classList.add('neos-deck-dragging');
  });
  surface.addEventListener('dragover',event=>{
    if(activeWorkspace!=='deck'||!deckDrag||deckMoveBusy)return;
    const stack=event.target.closest('[data-deck-drop-stack]');if(!stack)return;
    event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    clearDeckDropGuide();stack.closest('.neos-stack')?.classList.add('neos-deck-drop-target');
  });
  surface.addEventListener('drop',event=>{
    if(activeWorkspace!=='deck'||!deckDrag)return;
    const stack=event.target.closest('[data-deck-drop-stack]');
    if(!stack)return;
    event.preventDefault();
    const source=deckDrag;deckDrag=null;clearDeckDropGuide();
    if(String(source.boardId)!==String(deckState.boardId))return;
    void moveDeckCard(source.stackId,source.cardId,stack.dataset.deckDropStack);
  });
  surface.addEventListener('dragend',()=>{deckDrag=null;clearDeckDropGuide();});

  // File rows may be dragged to another directory. OS file drops upload to
  // that directory. Modifier Ctrl/Cmd on drop means COPY; otherwise MOVE.
  function dropFolderForEvent(event){
    const target=event.target.closest('[data-drop-folder]');
    return target?.dataset.dropFolder||browser.path;
  }
  function clearFileDropGuide(){surface.querySelectorAll('.neos-file-drop-target').forEach(el=>el.classList.remove('neos-file-drop-target'));}
  surface.addEventListener('dragstart',event=>{
    if(activeWorkspace!=='files'||fileBusy)return;
    const row=event.target.closest('[data-file-row]');if(!row)return;
    const path=row.dataset.fileRow;
    if(!fileSelection.has(path)){fileSelection.clear();fileSelection.add(path);fileAnchorPath=path;}
    fileDragPaths=[...fileSelection];
    event.dataTransfer?.setData('application/x-neos-files+json',JSON.stringify(fileDragPaths));
    if(event.dataTransfer)event.dataTransfer.effectAllowed='copyMove';
    row.classList.add('neos-file-dragging');
    const toolbar=surface.querySelector('[data-selection-toolbar]');if(toolbar)toolbar.innerHTML=selectionToolbar();
  });
  surface.addEventListener('dragover',event=>{
    if(activeWorkspace!=='files'||fileBusy)return;
    const types=[...(event.dataTransfer?.types||[])];
    if(!types.includes('Files')&&!types.includes('application/x-neos-files+json'))return;
    event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect=types.includes('Files')?'copy':event.ctrlKey||event.metaKey?'copy':'move';
    clearFileDropGuide();
    const target=event.target.closest('[data-drop-folder]');
    if(target){target.classList.add('neos-file-drop-target');dropZonePath=target.dataset.dropFolder||browser.path;}
  });
  surface.addEventListener('dragleave',event=>{
    if(activeWorkspace!=='files')return;
    if(!event.relatedTarget?.closest?.('[data-drop-folder]'))clearFileDropGuide();
  });
  surface.addEventListener('drop',event=>{
    if(activeWorkspace!=='files'||fileBusy)return;
    const types=[...(event.dataTransfer?.types||[])];
    if(!types.includes('Files')&&!types.includes('application/x-neos-files+json'))return;
    event.preventDefault();
    const targetFolder=dropFolderForEvent(event);
    clearFileDropGuide();dropZonePath='';
    if(types.includes('Files')){
      const list=event.dataTransfer?.files;
      if(list?.length)void uploadSelection(list,targetFolder);
      return;
    }
    const raw=event.dataTransfer?.getData('application/x-neos-files+json')||'[]';
    let paths=[];try{paths=JSON.parse(raw);}catch{return;}
    if(!Array.isArray(paths)||!paths.every(p=>typeof p==='string'))return;
    const entries=browser.items.filter(x=>paths.includes(x.path));
    if(!entries.length)return;
    const mode=(event.ctrlKey||event.metaKey)?'copy':'cut';
    if(mode==='cut'&&!window.confirm(`Déplacer ${entries.length} élément${entries.length>1?'s':''} vers ${targetFolder} ?`))return;
    void transferFiles(entries,targetFolder,mode);
  });
  surface.addEventListener('dragend',()=>{fileDragPaths=[];clearFileDropGuide();surface.querySelectorAll('.neos-file-dragging').forEach(el=>el.classList.remove('neos-file-dragging'));});

  // Editing mode: move workspace tabs directly, with no page navigation.
  surface.addEventListener('dragstart',event=>{
    if(!editing)return;
    const tab=event.target.closest('.neos-workspace-tabs [data-drag-tab]');if(!tab)return;
    dragTabId=tab.dataset.dragTab;
    if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','neos-tab:'+dragTabId);}
    tab.classList.add('neos-tab-dragging');
  });
  surface.addEventListener('dragover',event=>{
    if(!editing||!dragTabId)return;
    const tab=event.target.closest('.neos-workspace-tabs [data-drag-tab]');if(!tab||tab.dataset.dragTab===dragTabId)return;
    event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    clearTabDragHints();
    tab.classList.add(event.clientX>tab.getBoundingClientRect().left+tab.offsetWidth/2?'neos-tab-drop-after':'neos-tab-drop-before');
  });
  surface.addEventListener('drop',event=>{
    if(!editing||!dragTabId)return;
    const tab=event.target.closest('.neos-workspace-tabs [data-drag-tab]');
    const source=dragTabId;dragTabId='';clearTabDragHints();
    if(!tab)return;event.preventDefault();
    const bounds=tab.getBoundingClientRect();moveTab(source,tab.dataset.dragTab,event.clientX>bounds.left+bounds.width/2);
  });
  surface.addEventListener('dragend',()=>{dragTabId='';clearTabDragHints();});

  surface.addEventListener('dragstart',event=>{
    if(!editing||activeWorkspace!=='home')return;
    const handle=event.target.closest('[data-drag-widget]');
    const id=handle?.dataset.dragWidget;if(!id)return;
    dragWidgetId=id;
    event.dataTransfer?.setData('text/plain',id);
    if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
    surface.querySelector(`.neos-home-grid [data-widget="${id}"]`)?.classList.add('neos-is-dragging');
  });
  surface.addEventListener('dragover',event=>{
    if(!editing||!dragWidgetId)return;
    const target=event.target.closest('.neos-home-grid [data-widget]');if(!target||target.dataset.widget===dragWidgetId)return;
    event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    clearDropGuide();
    const bounds=target.getBoundingClientRect();
    const midpoint=bounds.left+bounds.width/2;
    const after=Math.abs(event.clientX-midpoint)<14 ? settings.order.indexOf(dragWidgetId)<settings.order.indexOf(target.dataset.widget) : event.clientX>midpoint;
    target.classList.add(after?'neos-drop-after':'neos-drop-before');
    surface.querySelector(`.neos-home-grid [data-widget="${dragWidgetId}"]`)?.classList.add('neos-is-dragging');
  });
  surface.addEventListener('drop',event=>{
    if(!editing||!dragWidgetId)return;
    const target=event.target.closest('.neos-home-grid [data-widget]');
    if(!target){clearDropGuide();dragWidgetId='';return;}
    event.preventDefault();
    const rect=target.getBoundingClientRect();const midpoint=rect.left+rect.width/2;
    const after=Math.abs(event.clientX-midpoint)<14 ? settings.order.indexOf(dragWidgetId)<settings.order.indexOf(target.dataset.widget) : event.clientX>midpoint;
    const from=dragWidgetId;dragWidgetId='';clearDropGuide();reorderWidget(from,target.dataset.widget,after);
  });
  surface.addEventListener('dragend',()=>{dragWidgetId='';clearDropGuide();});

  surface.addEventListener('pointermove', event => {
    if (!motionEnabled() || event.pointerType === 'touch') return;
    const card = event.target.closest('.neos-card'); if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`); card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }, { passive:true });

  window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(settings?.theme==='system')applyTheme();});
  root.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement))return;
    if(img.dataset.davFallback && img.dataset.davFallback!=='#' && !img.dataset.fallbackUsed){
      img.dataset.fallbackUsed='1';img.src=img.dataset.davFallback;return;
    }
    if(img.matches('.neos-thumb,.neos-office-thumb') || img.dataset.fallbackUsed){img.style.display='none';}
  },true);
  clockTimer = setInterval(updateClock, 30000);
  // Never poll when hidden, reading or composing; avoid overlapping IMAP requests.
  const autoSyncMail=()=>{
    if(demo||document.visibilityState!=='visible'||activeWorkspace!=='mail')return;
    if(integrations.mail.status!=='ready'||mailHistoryLoading||mailDisplayCount>70||mailComposer.open||mailDrafts.open||mailOutbox.open||mailReader.item)return;
    if(Date.now()-mailRefreshState.lastAttempt<80000)return;
    void loadIntegration('mail',true);
  };
  setInterval(autoSyncMail,90000);
  const autoRefreshTalk=()=>{
    if(demo||document.visibilityState!=='visible'||activeWorkspace!=='talk'||!talkChat.token)return;
    if(talkChat.busy||talkChat.readBusy||talkChat.status!=='ready'||talkChat.draft.trim())return;
    if(Date.now()-talkChat.lastSync<55000)return;
    void loadTalkChat(false,true);
  };
  setInterval(autoRefreshTalk,60000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')autoSyncMail();});
  void load();
  launchDatafield();
})();
