/** Nova Dashboard 0.1.2 — CSRF token from Nextcloud page head. */
(() => {
  'use strict';
  const root = document.getElementById('nova-root');
  // Nextcloud 35 exposes the current CSRF token on <head data-requesttoken>.
  const getCsrfToken = () => document.head?.dataset?.requesttoken || window.OC?.requestToken || '';
  if (!root) return;

  const ICON = {
    sparkles: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 17 .8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    check: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="m8 12 3 3 5-6"/>',
    storage: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 12h18m-5 4h2"/><circle cx="7" cy="16" r="1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-6-6L4 21"/>',
    message: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/>',
    settings: '<path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    moon: '<path d="M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.8 9A7.5 7.5 0 0 1 19 6l1 1M4 17l1 1a7.5 7.5 0 0 0 13.2-3"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    chevronup: '<path d="m6 15 6-6 6 6"/>',
    chevrondown: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
    file: '<path d="M6 2h9l5 5v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6"/>',
    external: '<path d="M14 4h6v6m-9 3 9-9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3v.1"/>',
    cloud: '<path d="M5 18a4 4 0 0 1-.4-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 1 9H5Z"/>',
  };
  const icon = (name, size = 20) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[name] || ICON.grid}</svg>`;
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl = s => typeof s === 'string' && /^\/(?!\/)/.test(s) ? escapeHtml(s) : '#';
  const safeColor = s => typeof s === 'string' && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(s) ? s : '#8193ff';
  const number = n => Number.isFinite(Number(n)) ? Number(n) : 0;
  const humanSize = bytes => bytes === null || bytes === undefined ? '—' : new Intl.NumberFormat('fr-FR', {maximumFractionDigits: 1}).format(number(bytes) / (1024 ** (number(bytes) >= 1024**4 ? 4 : number(bytes) >= 1024**3 ? 3 : number(bytes) >= 1024**2 ? 2 : number(bytes) >= 1024 ? 1 : 0))) + ' ' + (number(bytes) >= 1024**4 ? 'To' : number(bytes) >= 1024**3 ? 'Go' : number(bytes) >= 1024**2 ? 'Mo' : number(bytes) >= 1024 ? 'Ko' : 'o');
  const when = iso => { if (!iso) return 'Sans échéance'; const d = new Date(iso); return Number.isNaN(d.valueOf()) ? 'Date inconnue' : new Intl.DateTimeFormat('fr-FR', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(d); };
  const ago = ts => { const days = Math.round((Date.now() - number(ts)*1000) / 86400000); return days <= 0 ? "Aujourd'hui" : days === 1 ? 'Hier' : `Il y a ${days} j`; };
  const labels = {storage:'Stockage', shortcuts:'Accès rapide', files:'Fichiers récents', calendar:'Prochains événements', tasks:'Tâches à faire'};
  let state = null, settings = null, editMode = false, busy = false, pending = false;
  const defaultPrefs = () => ({ theme:'system', order:['storage','shortcuts','files','calendar','tasks'], hidden:[] });

  function setTheme(theme) {
    root.classList.remove('nova-dark','nova-light');
    root.classList.add('nova-' + (theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme));
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (settings?.theme === 'system') setTheme('system'); });

  function panel(id, body, subtitle = '') {
    return `<section class="nova-widget nova-${id}" data-widget="${id}" draggable="${editMode}" aria-label="${labels[id]}">
      <header class="nova-panel-head"><span class="nova-panel-name">${icon(id === 'storage' ? 'storage' : id === 'shortcuts' ? 'grid' : id === 'files' ? 'folder' : id === 'calendar' ? 'calendar' : 'check',18)} ${labels[id]}</span>
      ${editMode ? `<span class="nova-drag" title="Glisser pour déplacer">${icon('grip',17)}</span>` : (subtitle ? `<span class="nova-small">${subtitle}</span>` : '')}</header>
      <div class="nova-panel-body">${body}</div></section>`;
  }
  function storageCard(data) {
    const used = data?.used ?? null, total = data?.total ?? null, percent = data?.percent ?? 0;
    return panel('storage', `<div class="nova-storage-total">${humanSize(used)}</div><div class="nova-muted">${total === null ? 'Quota illimité' : 'sur ' + humanSize(total)}</div>
      <div class="nova-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(number(percent))}"><span style="width:${Math.max(0, Math.min(100, number(percent)))}%"></span></div>
      <p class="nova-footnote">${total === null ? 'Aucune limite définie' : number(percent).toFixed(1).replace('.', ',') + '% du quota utilisé'} · Hors stockages externes</p>`);
  }
  function shortcutsCard(shortcuts) {
    return panel('shortcuts', (shortcuts.length ? `<div class="nova-shortcuts-grid">${shortcuts.map(item => `<a class="nova-shortcut" href="${safeUrl(item.url)}"><span class="nova-shortcut-icon">${icon(item.icon,23)}</span><span>${escapeHtml(item.label)}</span></a>`).join('')}</div>` : '<p class="nova-empty">Aucune application disponible.</p>'));
  }
  function filesCard(files) {
    return panel('files', files.length ? `<div class="nova-stack">${files.map(f => `<a href="${safeUrl(f.url)}" class="nova-row"><span class="nova-file-icon">${icon('file',20)}</span><span class="nova-row-main"><strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.folder)} · ${ago(f.mtime)}</small></span><span class="nova-row-end">${humanSize(f.size)} ${icon('chevron',14)}</span></a>`).join('')}</div><p class="nova-footnote">Derniers fichiers repérés dans les dossiers explorés (scan limité).</p>` : '<div class="nova-empty">Aucun fichier trouvé dans les dossiers explorés.</div>');
  }
  function calendarCard(events) {
    return panel('calendar', events.length ? `<div class="nova-stack">${events.map(ev => `<div class="nova-row"><span class="nova-event-marker" style="background:${safeColor(ev.color)}"></span><span class="nova-row-main"><strong>${escapeHtml(ev.title)}</strong><small>${escapeHtml(ev.calendar)}</small></span><span class="nova-date">${escapeHtml(when(ev.start))}</span></div>`).join('')}</div>` : '<div class="nova-empty">Aucun événement prévu sur les 30 prochains jours.</div>', '30 jours');
  }
  function tasksCard(tasks) {
    return panel('tasks', tasks.length ? `<div class="nova-stack">${tasks.map(task => `<div class="nova-row"><span class="nova-task-dot">${icon('check',14)}</span><span class="nova-row-main"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(when(task.due))}</small></span></div>`).join('')}</div>` : '<div class="nova-empty">Aucune tâche non terminée trouvée via CalDAV.</div>', 'CalDAV');
  }
  const widgetRender = {
    storage: () => storageCard(state.storage),
    shortcuts: () => shortcutsCard(state.shortcuts || []),
    files: () => filesCard(state.files || []),
    calendar: () => calendarCard(state.calendar || []),
    tasks: () => tasksCard(state.tasks || []),
  };
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  }
  function render() {
    if (!state || !settings) return;
    setTheme(settings.theme);
    const warnings = (state.warnings || []).map(w => `<span>${icon('alert',15)} ${escapeHtml(w)}</span>`).join('');
    root.innerHTML = `<div class="nova-app"><div class="nova-container">
      <nav class="nova-top" aria-label="Navigation Nova"><div class="nova-brand"><div class="nova-brand-icon">${icon('sparkles',24)}</div><span><strong>NOVA</strong><small>YOUR CLOUD, REIMAGINED</small></span></div>
      <div class="nova-actions"><span class="nova-online"><b></b> Mon espace</span><button type="button" class="nova-icon-button" data-action="refresh" title="Actualiser">${icon('refresh',19)}</button><button type="button" class="nova-setting-button" data-action="edit">${icon('settings',18)}<span>${editMode ? 'Terminer' : 'Personnaliser'}</span></button></div></nav>
      <div class="nova-hero"><div><div class="nova-kicker"><span class="nova-kicker-line"></span> TABLEAU DE BORD PERSONNEL</div><h1>${greeting()}, <span>${escapeHtml(root.dataset.displayName || 'bienvenue')}</span><span class="nova-hello"> ✦</span></h1><p>Ton espace de travail, tes fichiers et ton agenda. Tout au même endroit.</p></div><div class="nova-today">${icon('clock',17)} <span>${new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}</span></div></div>
      ${warnings ? `<div class="nova-warnings">${warnings}</div>` : ''}
      ${editMode ? `<div class="nova-editor">${icon('grip',18)} <span>Déplace les cartes pour les réordonner, ou utilise les flèches dans les réglages. Les changements sont enregistrés pour ton compte.</span><button type="button" data-action="preferences">Choisir les widgets</button></div>` : ''}
      <div class="nova-grid">${settings.order.filter(id => !settings.hidden.includes(id)).map(id => widgetRender[id] ? widgetRender[id]() : '').join('')}</div>
      <div class="nova-footer"><span>${icon('cloud',15)} Nova Dashboard v0.1.2</span><span>Intégré à Nextcloud · Respecte tes permissions</span></div>
      </div></div>${editMode ? preferencesDialog() : ''}`;
    bindControls();
  }
  function preferencesDialog() {
    return `<dialog id="nova-dialog" class="nova-dialog"><form method="dialog"><div class="nova-dialog-head"><div><strong>Personnalisation</strong><small>Ton dashboard, tes préférences</small></div><button type="submit" class="nova-icon-button" aria-label="Fermer">${icon('close',20)}</button></div>
      <div class="nova-dialog-scroll"><h3>Apparence</h3><div class="nova-themes">${[['system','Automatique','settings'],['dark','Sombre','moon'],['light','Clair','sun']].map(([v,label,i]) => `<label class="nova-theme-choice"><input type="radio" name="theme" value="${v}" ${settings.theme === v ? 'checked' : ''}/>${icon(i,19)} ${label}</label>`).join('')}</div>
      <h3>Widgets affichés et ordre</h3><p class="nova-help">Active les cartes souhaitées et change leur position.</p><div class="nova-pref-list">${settings.order.map((id, i) => `<div class="nova-pref-row"><label><input type="checkbox" data-toggle="${id}" ${settings.hidden.includes(id) ? '' : 'checked'}/> ${labels[id]}</label><span><button type="button" data-move="${id}" data-direction="-1" ${i === 0 ? 'disabled' : ''} title="Monter" aria-label="Monter ${labels[id]}">${icon('chevronup',16)}</button><button type="button" data-move="${id}" data-direction="1" ${i === settings.order.length-1 ? 'disabled' : ''} title="Descendre" aria-label="Descendre ${labels[id]}">${icon('chevrondown',16)}</button></span></div>`).join('')}</div></div>
      <div class="nova-dialog-footer"><button type="submit" class="nova-primary">Terminer</button></div></form></dialog>`;
  }
  function bindControls() {
    root.querySelector('[data-action="refresh"]')?.addEventListener('click', load);
    root.querySelector('[data-action="edit"]')?.addEventListener('click', () => { editMode = !editMode; render(); });
    root.querySelector('[data-action="preferences"]')?.addEventListener('click', () => root.querySelector('#nova-dialog')?.showModal());
    root.querySelectorAll('[name="theme"]').forEach(control => control.addEventListener('change', () => { settings.theme = control.value; setTheme(control.value); save(); }));
    root.querySelectorAll('[data-toggle]').forEach(control => control.addEventListener('change', () => {
      const id = control.dataset.toggle;
      settings.hidden = control.checked ? settings.hidden.filter(x => x !== id) : [...settings.hidden, id];
      save(); render(); root.querySelector('#nova-dialog')?.showModal();
    }));
    root.querySelectorAll('[data-move]').forEach(control => control.addEventListener('click', () => {
      const i = settings.order.indexOf(control.dataset.move), j = i + Number(control.dataset.direction);
      if (i < 0 || j < 0 || j >= settings.order.length) return;
      [settings.order[i], settings.order[j]] = [settings.order[j], settings.order[i]];
      save(); render(); root.querySelector('#nova-dialog')?.showModal();
    }));
    if (editMode) {
      let from = null;
      root.querySelectorAll('[data-widget]').forEach(el => {
        el.addEventListener('dragstart', event => { from = el.dataset.widget; event.dataTransfer.effectAllowed = 'move'; });
        el.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; });
        el.addEventListener('drop', event => {
          event.preventDefault(); const to = el.dataset.widget;
          if (!from || !to || from === to) return;
          const order = [...settings.order]; order.splice(order.indexOf(from), 1); order.splice(order.indexOf(to), 0, from);
          settings.order = order; save(); render();
        });
      });
    }
  }
  async function save() {
    if (busy) { pending = true; return; }
    busy = true;
    const form = new URLSearchParams();
    form.append('settings[theme]', settings.theme);
    settings.order.forEach((id,i) => form.append(`settings[order][${i}]`, id));
    settings.hidden.forEach((id,i) => form.append(`settings[hidden][${i}]`, id));
    try {
      const res = await fetch(root.dataset.settingsUrl, {
        method:'POST', credentials:'same-origin',
        headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8', 'requesttoken': getCsrfToken(), 'X-Requested-With':'XMLHttpRequest'},
        body:form.toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.settings && !pending) settings = data.settings;
    } catch (error) {
      showNotice('Échec de sauvegarde des préférences. Recharge la page et réessaie.');
    } finally {
      busy = false;
      if (pending) { pending = false; void save(); }
    }
  }
  function showNotice(message) {
    const notice = document.createElement('div'); notice.className = 'nova-toast'; notice.setAttribute('role','alert'); notice.textContent = message;
    document.body.appendChild(notice); setTimeout(() => notice.remove(), 6000);
  }
  async function load() {
    try {
      const response = await fetch(root.dataset.overviewUrl, {credentials:'same-origin', headers:{'Accept':'application/json','X-Requested-With':'XMLHttpRequest', 'requesttoken':getCsrfToken()},cache:'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      state = data.overview; settings = data.settings || defaultPrefs();
      root.dataset.displayName = data.user?.name || 'bienvenue';
      render();
    } catch (error) {
      console.error('[Nova Dashboard] Échec du chargement des données :', error);
      if (state) showNotice('Impossible d’actualiser les données.');
      else root.innerHTML = `<div class="nova-error" role="alert"><h2>Impossible de charger Nova Dashboard</h2><p>Vérifie ta session Nextcloud ou consulte les journaux de l’application.</p><button type="button" id="nova-retry">Réessayer</button></div>`;
      root.querySelector('#nova-retry')?.addEventListener('click', load);
    }
  }
  load();
})();
