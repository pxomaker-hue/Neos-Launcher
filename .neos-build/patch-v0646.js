const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2];
function once(s,a,b){if(s.split(a).length!==2)throw Error('Missing/duplicate anchor: '+a.slice(0,80));return s.replace(a,()=>b);}
const file=path.join(dir,'js/app.js');let js=fs.readFileSync(file,'utf8');
const helper=`  function taskMatchesView(task,view,now=new Date()){
    if(view==='all')return true;
    if(view==='done')return !!task.done;
    if(task.done)return false;
    if(view==='open')return true;
    const raw=task.dueDate||task.due;
    if(view==='undated')return !raw;
    if(!raw)return false;
    const dateOnly=/^\\d{4}-\\d{2}-\\d{2}$/.test(raw);
    const due=dateOnly?new Date(raw+'T00:00:00'):new Date(raw);
    if(Number.isNaN(due.getTime()))return false;
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const day=new Date(due.getFullYear(),due.getMonth(),due.getDate());
    const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
    const limit=new Date(today);limit.setDate(limit.getDate()+8);
    return view==='today'?day.getTime()===today.getTime():view==='overdue'?day<today:view==='upcoming'?day>=tomorrow&&day<limit:false;
  }
`;
js=once(js,'  function groupwareModule(type){',helper+'  function groupwareModule(type){');
js=once(js,"const filteredTasks=records.filter(t=>taskView==='all'||(taskView==='done'?t.done:!t.done));","const taskNow=new Date();\n    const filteredTasks=records.filter(t=>taskMatchesView(t,taskView,taskNow));");
js=once(js,"[['open','À faire'],['done','Terminées'],['all','Toutes']]","[['open','À faire'],['today','Aujourd’hui'],['overdue','En retard'],['upcoming','7 prochains jours'],['undated','Sans échéance'],['done','Terminées'],['all','Toutes']]");
js=once(js,'${label}</button>`).join(\'\')}</div>${!hasNative?', '${label} <span class="neos-task-count">${records.filter(t=>taskMatchesView(t,id,taskNow)).length}</span></button>`).join(\'\')}</div>${!hasNative?');
js=once(js,"taskView=['open','done','all'].includes(target.dataset.view)?target.dataset.view:'open';render();","taskView=['open','today','overdue','upcoming','undated','done','all'].includes(target.dataset.view)?target.dataset.view:'open';render();surface.querySelector('[data-action=\"task-view\"][data-view=\"'+taskView+'\"]')?.focus({preventScroll:true});");
js=once(js,'NEOS 0.6.45</span>','NEOS 0.6.46</span>');fs.writeFileSync(file,js);
fs.appendFileSync(path.join(dir,'css/app.css'),'\n/* v0.6.46: deadline views */\n#nova-root .neos-task-filters{flex-wrap:wrap;gap:6px}\n#nova-root .neos-task-count{display:inline-block;min-width:1.4em;margin-left:4px;opacity:.8;font-variant-numeric:tabular-nums}\n');
const info=path.join(dir,'appinfo/info.xml');fs.writeFileSync(info,once(fs.readFileSync(info,'utf8'),'<version>0.6.45</version>','<version>0.6.46</version>'));
for(const name of ['README.md','CHANGELOG.md']){const p=path.join(dir,name);fs.writeFileSync(p,'## Neos v0.6.46 — Tâches par échéance\n\nVues Aujourd’hui, En retard, 7 prochains jours et Sans échéance avec compteurs. Les tâches terminées sont exclues de ces quatre vues. Les dates sont comparées au jour local ; les sept prochains jours commencent demain. Les compteurs concernent les tâches chargées.\n\n'+fs.readFileSync(p,'utf8'));}
