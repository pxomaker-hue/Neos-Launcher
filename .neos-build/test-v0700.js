const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const file = process.argv[2];
const js = fs.readFileSync(file, 'utf8');
execFileSync(process.execPath, [path.join(__dirname, 'test-v0651.js'), file], {stdio: 'inherit'});

function get(first, last) {
  const start = js.indexOf('  ' + first);
  const end = js.indexOf('  ' + last, start + 1);
  assert.ok(start >= 0 && end > start, first);
  return js.slice(start, end);
}

function load(source, value, variables = {}) {
  return new Function(...Object.keys(variables), source + '\nreturn ' + value)(...Object.values(variables));
}

function recurringEdits() {
  const source = get('function calendarComponents(', 'function calendarEventDetail(')
    + get('function icsUnfold(', 'function icsUpdateTodo(')
    + get('function updateRecurringEventIcs(', 'function taskIcsUpdates(');
  const {edit, components, unfold} = load(source,
    '{edit:updateRecurringEventIcs,components:calendarComponents,unfold:icsUnfold}');
  const raw = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VTIMEZONE', 'TZID:Europe/Paris', 'END:VTIMEZONE',
    'BEGIN:VEVENT', 'UID:neosevent', 'DTSTART;TZID=Europe/Paris:20261019T100000',
    'DTEND;TZID=Europe/Paris:20261019T110000', 'RRULE:FREQ=WEEKLY', 'EXDATE;TZID=Europe/Paris:20261102T100000',
    'SUMMARY:Réunion', 'BEGIN:VALARM', 'DESCRIPTION:Rappel', 'END:VALARM', 'END:VEVENT',
    'BEGIN:VEVENT', 'UID:neosevent', 'RECURRENCE-ID;TZID=Europe/Paris:20261109T100000',
    'DTSTART;TZID=Europe/Paris:20261109T110000', 'DTEND;TZID=Europe/Paris:20261109T120000', 'SUMMARY:Exception', 'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const changed = unfold(edit({raw}, {scope: 'series', title: 'Série', description: 'Texte', location: 'Bureau'}));
  assert.match(changed, /SUMMARY:Série/);
  assert.match(changed, /RRULE:FREQ=WEEKLY/);
  assert.match(changed, /EXDATE;TZID=Europe\/Paris:20261102T100000/);
  assert.match(changed, /SUMMARY:Exception/);
  assert.match(changed, /DESCRIPTION:Rappel/);
  const occurrenceRaw = 'BEGIN:VEVENT\nUID:neosevent\nDTSTART:20261116T090000Z\nDTEND:20261116T100000Z\nSUMMARY:Réunion\nEND:VEVENT';
  const fields = {scope: 'occurrence', title: 'Occurrence', metadataOnly: true};
  const occurrence = edit({raw, recurrenceId: '20261116T090000Z', occurrenceRaw}, fields);
  assert.equal(components(occurrence).components.length, 3);
  assert.match(unfold(occurrence), /RECURRENCE-ID;TZID=Europe\/Paris:20261116T100000/);
  const revised = edit({raw: occurrence, recurrenceId: '20261116T090000Z', occurrenceRaw}, {...fields, title: 'Relue'});
  assert.equal(components(revised).components.length, 3);
  assert.match(unfold(revised), /SUMMARY:Relue/);
  assert.match(unfold(revised), /SUMMARY:Réunion/);
}

async function mailCopy() {
  const fetched = [], uploaded = [];
  let fail = true;
  const {list, copy} = load(get('function draftAttachments(', 'async function mailResumeDraftAsCopy('),
    '{list:draftAttachments,copy:copyDraftAttachments}', {
      mailNative: url => url,
      csrfToken: () => 'csrf-test',
      fetch: async url => {
        fetched.push(url);
        if (url.endsWith('/2') && fail) throw Error('connexion interrompue');
        return new Response('contenu fictif', {headers: {'Content-Disposition': 'attachment'}});
      },
      moduleRequest: async (url, {method, body}) => {
        assert.equal(url, '/api/attachments');
        assert.equal(method, 'POST');
        assert.equal(body.get('accountId'), '7');
        uploaded.push(body.get('attachment').name);
        return {id: uploaded.length + 20};
      },
    });
  const files = list({attachments: [{id: '1.2', fileName: 'devis.pdf'}], inlineAttachments: [{id: '2', fileName: 'image.png'}]});
  const cache = new Map();
  await assert.rejects(copy('45', '7', files, cache, false), /interrompue/);
  fail = false;
  const copied = await copy('45', '7', files, cache, false);
  assert.deepEqual(copied, [{id: 21, name: 'devis.pdf'}, {id: 22, name: 'image.png'}]);
  assert.deepEqual(uploaded, ['devis.pdf', 'image.png']);
  assert.deepEqual(fetched, ['/api/messages/45/attachment/1.2', '/api/messages/45/attachment/2', '/api/messages/45/attachment/2']);
  assert.throws(() => list({attachments: [{id: '../../autre'}]}), /identifiant/);
}

async function notesPages() {
  const state = {status: 'ready', items: [{id: 1, title: 'Original', content: 'V1'}], selected: 1, draftTitle: 'Brouillon', draftContent: 'À garder', dirty: true};
  const cursors = [];
  const loadNotes = load("let noteLoadGeneration=0; const noteSavePending=false;\n" + get('async function notesPage(', 'async function loadDeck('), 'loadNotes', {
    notesState: state, demo: null, availableApps: () => new Set(['notes']), activeWorkspace: 'home',
    notesUrl: () => 'https://example.test/notes', render() {},
    moduleRequest: async (url, options, read) => {
      const cursor = new URL(url).searchParams.get('chunkCursor');
      cursors.push(cursor);
      const items = cursor ? [{id: 52, title: 'Note ancienne', content: 'Rare'}] : [{id: 1, title: 'Original', content: 'V2'}];
      return read(new Response(JSON.stringify(items), {headers: cursor ? {} : {'X-Notes-Chunk-Cursor': 'page-suivante'}}));
    },
  });
  await loadNotes(true);
  assert.deepEqual(cursors, [null, 'page-suivante']);
  assert.equal(state.pagesPending, false);
  assert.equal(state.items[1].id, 52);
  assert.equal(state.draftContent, 'À garder');
  assert.equal(state.dirty, true);
}

async function largeContactsBook() {
  const base = 'https://example.test/dav/';
  const book = base + 'test/';
  const cards = Array.from({length: 450}, (_, i) => ({href: `${book}${i}.vcf`, getetag: `"${i}"`}));
  const reports = [];
  const fetchContacts = load(get('async function fetchContacts(', 'function contactStartDelete('), 'fetchContacts', {
    root: {dataset: {currentUid: 'test'}}, window: {location: {origin: 'https://example.test'}},
    contactRoot: () => base, contactSafeUrl: url => new URL(url, base).href,
    xmlDocument: documentElement => ({documentElement}),
    xmlChildren: (node, name) => name === 'response' ? node : name === 'addressbook' && node.addressbook ? [node] : [],
    xmlText: (node, name) => node[name] || '', esc: String, contactUnfold: String,
    contactProp: (raw, name) => new RegExp('^' + name + ':(.*)$', 'm').exec(raw)?.[1] || '',
    contactProps: () => [], nativePath: () => '/contacts',
    davRequest: async (method, url, {body}) => ({text: async () => {
      if (url === base) return [{href: book, displayname: 'Test', addressbook: true}];
      if (method === 'PROPFIND') return cards;
      const page = [...body.matchAll(/<d:href>(.*?)<\/d:href>/g)];
      reports.push(page.length);
      return page.map(([, href]) => ({href, getetag: '"v1"', 'address-data': `BEGIN:VCARD\nFN:${href}\nEND:VCARD`}));
    }}),
  });
  const result = await fetchContacts();
  assert.equal(result.items.length, 450);
  assert.deepEqual(reports, [60,60,60,60,60,60,60,30]);
  assert.ok(result.items.some(item => item.href.endsWith('/449.vcf')));
}

async function filePages() {
  const state = {query: 'facture', items: [], nextOffset: null, type: 'all', date: 'all', size: 'all', sort: 'name'};
  const offsets = [];
  const execute = load('let globalSearchGeneration=0;\n' + get('async function executeGlobalSearch(', 'function openGlobalSearch('), 'executeGlobalSearch', {
    globalSearch: state, popMode: 'global-search', demo: null, number: Number,
    root: {dataset: {searchUrl: '/api/search'}}, window: {location: {href: 'https://example.test/dashboard'}},
    renderGlobalSearchResults() {}, api: async url => {
      const offset = Number(new URL(url).searchParams.get('offset'));
      offsets.push(offset);
      return offset === 0 ? {items: [{path: '/facture-1.pdf'}], nextOffset: 1, total: 2} :
        {items: [{path: '/facture-1.pdf'}, {path: '/archives/facture-2.pdf'}], nextOffset: null, total: 2};
    },
  });
  await execute();
  await execute(true);
  await execute(true);
  assert.deepEqual(offsets, [0, 1]);
  assert.deepEqual(state.items.map(item => item.path), ['/facture-1.pdf', '/archives/facture-2.pdf']);
}

async function main() {
  recurringEdits();
  await mailCopy();
  await notesPages();
  await largeContactsBook();
  await filePages();
  console.log('v0.7 — séries et exceptions, copie des pièces jointes avec reprise et pagination des notes : OK');
  console.log('v0.7 — carnet CardDAV de 450 contacts et chargement des pages de recherche Fichiers : OK');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
