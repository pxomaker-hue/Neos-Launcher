const assert = require('node:assert/strict');
const fs = require('node:fs');

const js = fs.readFileSync(process.argv[2], 'utf8');
const first = js.indexOf('  function nextSearchTab(');
const last = js.indexOf('  function renderGlobalSearch(){', first);
assert.ok(first > 0 && last > first, 'tab helpers present');
let selected = null;
let renderCount = 0;
let favoriteLoads = 0;
const popHost = {
  querySelector(selector) {
    const match = selector.match(/data-tab="(search|favorites|recent)"/);
    return match ? {focus() { selected = match[1]; }} : null;
  },
};
const create = new Function('popHost', 'renderGlobalSearch', 'loadFavorites',
  "let searchPanelTab='search';\n" + js.slice(first, last) +
  '\nreturn {nextSearchTab,selectSearchPanelTab,current:()=>searchPanelTab};');
const tabs = create(popHost, () => renderCount++, () => favoriteLoads++);

assert.equal(tabs.nextSearchTab('search', 'ArrowRight'), 'favorites');
assert.equal(tabs.nextSearchTab('recent', 'ArrowRight'), 'search');
assert.equal(tabs.nextSearchTab('search', 'ArrowLeft'), 'recent');
assert.equal(tabs.nextSearchTab('favorites', 'Home'), 'search');
assert.equal(tabs.nextSearchTab('favorites', 'End'), 'recent');
assert.equal(tabs.nextSearchTab('search', 'ArrowDown'), null);
tabs.selectSearchPanelTab('favorites');
assert.equal(tabs.current(), 'favorites');
assert.equal(selected, 'favorites', 'focus stays on the selected tab');
assert.equal(favoriteLoads, 1, 'favorites are loaded after selection');
tabs.selectSearchPanelTab('recent');
assert.equal(selected, 'recent');
assert.equal(renderCount, 2);
tabs.selectSearchPanelTab('unknown');
assert.equal(renderCount, 2, 'unknown tab ignored');

for (const id of ['search', 'favorites', 'recent']) {
  assert.ok(js.includes(`id="neos-search-tab-${id}" aria-controls="neos-search-panel"`),
    `${id} tab identifies its panel`);
}
assert.ok(js.includes('role="tabpanel" aria-labelledby="neos-search-tab-${searchPanelTab}"'),
  'panel names its selected tab');
assert.ok(js.includes('tabindex="${search?0:-1}"') &&
  js.includes('tabindex="${searchPanelTab===\'favorites\'?0:-1}"') &&
  js.includes('tabindex="${searchPanelTab===\'recent\'?0:-1}"'),
  'only the selected tab participates in Tab navigation');
assert.ok(js.includes("event.preventDefault();event.stopPropagation();selectSearchPanelTab(next);"),
  'arrow keys activate tabs');
assert.ok(js.includes("selectSearchPanelTab(actionEl.dataset.tab||'search');"),
  'mouse and keyboard selection share the same focus behavior');
assert.ok(js.includes('neos-task-widget-error') && js.includes('notReadBack'),
  'previous task fixes retained');

console.log('Neos v0.6.35 search tab keyboard tests passed');
