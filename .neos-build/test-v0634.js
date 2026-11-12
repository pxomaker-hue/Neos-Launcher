const assert = require('node:assert/strict');
const fs = require('node:fs');

const js = fs.readFileSync(process.argv[2], 'utf8');
const start = js.indexOf('  function homeTaskSelection(){');
const end = js.indexOf('  function linksWidget(){', start);
assert.ok(start > 0 && end > start, 'widget source available');
assert.ok(js.includes('canCreate=hasRight(') && js.includes('notReadBack'), 'CalDAV creation fix retained');

function run(groupware, overview) {
  const make = new Function('groupware', 'overview', 'box', 'icon', 'esc', 'fmtTime',
    js.slice(start, end) + '\nreturn {homeTaskSelection,tasksWidget};');
  return make(groupware, overview, (_name, html) => html, () => '',
    value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;'), value => String(value));
}

let view = run({status: 'idle', taskSuccess: 0, taskErrors: [], tasks: []},
  {tasks: [{title: 'Provisoire', source: 'caldav', due: ''}]});
assert.equal(view.homeTaskSelection().items.length, 1, 'dashboard fallback');

const sameDue = '2026-11-13T10:00:00Z';
view = run({status: 'ready', taskSuccess: 2, taskErrors: [], tasks: [
  {title: 'Même titre', source: 'caldav', href: '/tasks/1', due: sameDue},
  {title: 'Même titre', source: 'deck', href: '/deck/1', deckBoardId: 1, deckCardId: 2, due: sameDue},
  {title: 'Même titre', source: 'deck', href: '/deck/copy', deckBoardId: 1, deckCardId: 2, due: sameDue},
]}, {tasks: []});
assert.equal(view.homeTaskSelection().items.length, 2, 'distinct CalDAV and Deck records retained');
assert.equal(view.homeTaskSelection().deckCount, 1, 'same Deck card deduplicated');

view = run({status: 'ready', taskSuccess: 2, taskErrors: [], tasks: [
  ...Array.from({length: 12}, (_, i) => ({title: `CalDAV ${i}`, source: 'caldav', href: `/tasks/${i}`})),
  ...Array.from({length: 3}, (_, i) => ({title: `Deck ${i}`, source: 'deck', href: `/deck/${i}`, deckBoardId: 1, deckCardId: i + 1})),
]}, {tasks: []});
assert.equal(view.homeTaskSelection().items.length, 8, 'widget limit');
assert.equal(view.homeTaskSelection().items.filter(t => t.source === 'deck').length, 3, 'Deck cards included');

view = run({status: 'error', taskSuccess: 0, taskErrors: [], tasks: []}, {tasks: []});
assert.match(view.tasksWidget(), /role="alert"/, 'loading error announced');
assert.doesNotMatch(view.tasksWidget(), /Aucune tâche ouverte/, 'failure is not empty state');
view = run({status: 'error', taskSuccess: 0, taskErrors: [], tasks: []},
  {tasks: [{title: 'Disponible', source: 'caldav'}]});
assert.match(view.tasksWidget(), /Disponible/, 'fallback data retained on error');
assert.match(view.tasksWidget(), /role="alert"/, 'error shown alongside fallback data');
view = run({status: 'ready', taskSuccess: 0, taskErrors: [{message: 'REPORT 503'}], tasks: []}, {tasks: []});
assert.match(view.tasksWidget(), /role="alert"/, 'per-list REPORT failure announced');
view = run({status: 'ready', taskSuccess: 1, taskErrors: [{message: 'REPORT 503'}], tasks: [
  {title: 'Liste disponible', source: 'caldav', href: '/tasks/1'},
]}, {tasks: []});
assert.match(view.tasksWidget(), /Liste disponible/, 'successful list remains visible');
assert.match(view.tasksWidget(), /Certaines listes de tâches CalDAV sont indisponibles/, 'partial REPORT failure announced');

console.log('Neos v0.6.34 widget regression tests passed');
