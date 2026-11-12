from pathlib import Path
import re

NEW_TASK_WIDGET = r'''  // Home and the Tasks module share the SAME CalDAV/virtual-Deck data.
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
    const caldav=canonical.length?canonical:unique(dashboard.filter(t=>t.source!=='deck'),'caldav');
    // A dashboard item without source metadata may actually be a Deck VTODO.
    // Once Deck records are available, prefer their stable board/card identity.
    const deckTitles=new Set(deck.map(t=>String(t.title||'').trim().toLowerCase()+'|'+String(t.due||'')));
    const regular=caldav.filter(t=>!deckTitles.has(String(t.title||'').trim().toLowerCase()+'|'+String(t.due||'')));
    // A compact widget must show BOTH sources even with many CalDAV tasks.
    const maximum=8;
    const deckReserve=Math.min(deck.length,4);
    const selected=[...deck.slice(0,deckReserve),...regular.slice(0,maximum-deckReserve)];
    const remaining=[...deck.slice(deckReserve),...regular.slice(maximum-deckReserve)];
    selected.push(...remaining.slice(0,maximum-selected.length));
    const sortTime=t=>{const value=Date.parse(String(t.due||''));return Number.isFinite(value)?value:Number.MAX_SAFE_INTEGER;};
    selected.sort((a,b)=>sortTime(a)-sortTime(b));
    return {items:selected,total:regular.length+deck.length,deckCount:deck.length,loading:groupware.status==='loading'};
  }
  function tasksWidget(){
    const data=homeTaskSelection();
    const entries=data.items.map(t=>{
      const isDeck=t.source==='deck';
      const canOpen=!!t.href;
      const target=canOpen?`data-action="home-task-open" data-href="${esc(t.href)}"`:'data-action="workspace" data-workspace="tasks"';
      return `<button type="button" class="neos-item neos-home-task-item" ${target} aria-label="Ouvrir ${isDeck?'la carte Deck':'la tâche'} ${esc(t.title||'Sans titre')}"><span class="neos-item-icon">${icon(isDeck?'kanban':'check',16)}</span><span class="neos-item-title"><strong>${esc(t.title||'Sans titre')}</strong><small>${isDeck?'<span class="neos-source neos-source-deck">Deck</span> ':''}${t.due?esc(fmtTime(t.due)):'Sans échéance'}</small></span>${icon('chevron',14)}</button>`;
    }).join('');
    const status=data.loading?'<p class="neos-task-widget-status" role="status">Recherche des tâches Deck…</p>':'';
    const notes=data.total>data.items.length?`<p class="neos-task-widget-status">${data.total-data.items.length} autre${data.total-data.items.length>1?'s':''} tâche${data.total-data.items.length>1?'s':''} dans le module Tâches.</p>`:'';
    const content=entries?`<div class="neos-list">${entries}</div>${status}${notes}`:`<div class="neos-empty">${data.loading?'Chargement des tâches…':'Aucune tâche ouverte.'}</div>`;
    return box('tasks',`${content}<div class="neos-task-widget-footer"><button type="button" class="neos-btn" data-action="workspace" data-workspace="tasks">${icon('arrow',16)} Ouvrir Tâches</button></div>`);
  }
'''

CSS = '''\n/* v0.6.33: mixed CalDAV / Deck Tasks in the home widget */
#nova-root .neos-home-task-item{cursor:pointer}
#nova-root .neos-home-task-item:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
#nova-root .neos-home-task-item>.neos-icon{flex-shrink:0;color:var(--muted)}
#nova-root .neos-task-widget-status{margin:7px 8px 2px;color:var(--muted);font-size:10.5px}
#nova-root .neos-task-widget-footer{display:flex;justify-content:flex-end;align-items:center;padding-top:13px;margin-top:11px;border-top:1px solid var(--line)}
'''


def patch(app_dir:Path,old_version:str):
    assert old_version in ('0.6.31','0.6.32')
    app=app_dir/'js'/'app.js'
    text=app.read_text('utf-8')
    first=text.index('  function tasksWidget(){')
    last=text.index('  function linksWidget(){',first)
    assert 0<last-first<3000,(first,last)
    text=text[:first]+NEW_TASK_WIDGET+text[last:]

    # Called on the homepage only when the Tasks widget is visible.
    markers=[
      "    if(id==='planning')void loadPlanningDeck();",
      "      if(activeWorkspace==='planning'&&planningDeck.status==='idle')void loadPlanningDeck();",
    ]
    for item in markers:
      if text.count(item)!=1:raise ValueError(f'Missing load anchor: {item}')
      scope = "id==='home'" if item.startswith('    if(id') else "activeWorkspace==='home'"
      text=text.replace(item,item+f"\n    if({scope}&&!settings.hidden.includes('tasks')&&groupware.status==='idle')void loadGroupware();",1)

    marker="    else if(action==='gw-edit-task'){const record=groupware.tasks.find(t=>t.href===target.dataset.href);if(record)groupwareEditor('task',record);}"
    if text.count(marker)!=1:raise ValueError('Missing action anchor')
    action="""    else if(action==='home-task-open'){
      const record=groupware.tasks.find(t=>t.href===target.dataset.href);
      if(record?.source==='deck'&&record.deckBoardId&&record.deckCardId&&availableApps().has('deck'))void openDeckFromVirtual(record);
      else void chooseWorkspace('tasks').then(()=>{if(record&&record.source!=='deck'&&record.writable!==false)groupwareEditor('task',record);});
    }
"""
    text=text.replace(marker,action+marker,1)
    # Explicit refresh should update the widget as well as the overview.
    refresh="    if (action === 'refresh') { void load(true);"
    if text.count(refresh)!=1:raise ValueError('Missing refresh anchor')
    text=text.replace(refresh,"    if (action === 'refresh') { if(activeWorkspace==='home'&&!settings.hidden.includes('tasks'))void loadGroupware(true,true); void load(true);",1)

    text=text.replace(f'NEOS {old_version}</span>', 'NEOS 0.6.33</span>')
    text=text.replace(f'Neos {old_version} —', 'Neos 0.6.33 —')
    if 'NEOS 0.6.33</span>' not in text: raise ValueError('Footer not updated')
    app.write_text(text,'utf-8')

    css=app_dir/'css'/'app.css'
    existing=css.read_text('utf-8')
    assert '/* v0.6.33:' not in existing
    css.write_text(existing+CSS,'utf-8')

    info=app_dir/'appinfo'/'info.xml'
    xml=info.read_text('utf-8')
    assert f'<version>{old_version}</version>' in xml
    info.write_text(xml.replace(f'<version>{old_version}</version>','<version>0.6.33</version>'),'utf-8')

    changelog=app_dir/'CHANGELOG.md'
    content=changelog.read_text('utf-8')
    changelog.write_text('''## 0.6.33 — Widget accueil Tâches CalDAV + Deck

- Le widget Tâches de l'accueil lit les mêmes données CalDAV / Deck que le module Tâches dès que leur chargement est terminé.
- Cartes Deck visibles dans le widget, avec accès à leur carte d'origine, dédoublonnage par ID de carte, et sélection équilibrée des deux sources.
- Les tâches normales continuent d'être affichées et se créent comme avant via CalDAV. Les actions Deck restent assurées exclusivement par les API natives Deck.
- Rafraîchissement du widget lors du chargement de la page, du retour sur l'accueil et de la commande Actualiser.
- Le correctif v0.6.32 des permissions de création CalDAV est conservé.
- Tests sur navigateur de démonstration et validation ZIP ; vérifier le fonctionnement sur le NAS.

'''+content,'utf-8')
    for fname in ['README.md','INSTALLATION-OMV.md']:
      path=app_dir/fname
      if path.exists():
        original=path.read_text('utf-8')
        path.write_text('## Neos v0.6.33 — Widget Tâches incluant Deck\n\nLe widget d’accueil montre les tâches CalDAV et Deck déjà consultables dans le module Tâches ; mise à jour non destructive. Installe via Deploy-Neos.ps1 après sauvegarde.\n\n'+original,'utf-8')
    return app

if __name__=='__main__':
    import sys
    patch(Path(sys.argv[1]),sys.argv[2] if len(sys.argv)>2 else '0.6.31')