const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appDir = path.dirname(path.dirname(process.argv[2]));
const js = fs.readFileSync(process.argv[2], 'utf8');
const css = fs.readFileSync(path.join(appDir, 'css/app.css'), 'utf8');
const start = js.indexOf('  function brandMark(){');
const end = js.indexOf('\n', start);
const brandMark = new Function('kitFile', 'safeUrl', js.slice(start, end) + '\nreturn brandMark;')(
  value => `/assets/${value}`, value => value);
const html = brandMark();

assert.match(html, /neos-logo-approved-v0638\.png/, 'approved image retained');
assert.match(html, /neos-logo-05-hybrid-v0641\.png/, 'chosen concept 05 symbol used');
assert.equal((html.match(/<img /g) || []).length, 2);
assert.match(html, /alt="Neos"/);
assert.match(html, /<span class="neos-logo-subtitle">Dashboard<\/span>/);
assert.match(html, /<span class="neos-symbol-crop" aria-hidden="true">/);
assert.doesNotMatch(html, /neos-logo-pulse/, 'old octagon animation removed');
assert.match(js, /NEOS 0\.6\.45<\/span>/);

const whiteBounds = {left: 755, right: 2016, top: 244, bottom: 526};
const layouts = [
  {boxW: 205, boxH: 52, imgW: 200, imgH: 67, imgL: -5, imgT: -9, textL: 65, textT: 42, textH: 9, clip: 66},
  {boxW: 180, boxH: 48, imgW: 186, imgH: 62, imgL: -9, imgT: -8, textL: 56, textT: 39, textH: 8, clip: 62},
  {boxW: 150, boxH: 42, imgW: 157, imgH: 52, imgL: -7, imgT: -6, textL: 48, textT: 34, textH: 8, clip: 52},
];
for (const layout of layouts) {
  const symbolRight = layout.imgL + 675 * layout.imgW / 2172;
  const clipLeft = layout.imgL + layout.clip;
  const wordLeft = layout.imgL + whiteBounds.left * layout.imgW / 2172;
  const wordBottom = layout.imgT + whiteBounds.bottom * layout.imgH / 724;
  assert.ok(symbolRight < clipLeft && clipLeft < wordLeft, 'clip hides old symbol without cutting NEOS');
  assert.ok(Math.abs(wordLeft - layout.textL) < 2, 'subtitle aligns with NEOS');
  assert.ok(layout.textT >= wordBottom, 'subtitle does not cover NEOS');
  assert.ok(layout.textT + layout.textH <= layout.boxH, 'subtitle fits in logo box');
}
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{clip-path:inset\(0 0 0 66px\)\}/);
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{clip-path:inset\(0 0 0 62px\)\}/);
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{clip-path:inset\(0 0 0 52px\)\}/);
assert.match(css, /@keyframes neos-symbol-five-charge/);
assert.match(css, /#nova-root\[data-motion="subtle"\] \.neos-symbol-crop img\.neos-symbol-five\{animation-duration:8s/);
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-symbol-crop img\.neos-symbol-five\{animation:none\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*#nova-root \.neos-symbol-crop img\.neos-symbol-five\{animation:none!important\}/);
assert.match(css, /#nova-root \.neos-symbol-crop\{[^}]*pointer-events:none/,
  'animation does not intercept clicks');
const halo = css.match(/#nova-root \.neos-brand-mark::before\{([^}]+)\}/)?.[1];
assert.ok(halo, 'steady background layer is present');
assert.match(halo, /z-index:0;inset:0;pointer-events:none/);
assert.match(halo, /radial-gradient\(ellipse 72% 105%/, 'cyan halo');
assert.match(halo, /14px 14px,14px 14px/, 'light grid');
assert.doesNotMatch(halo, /animation:/, 'background remains visible with motion off');
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{z-index:1\}/,
  'wordmark stays above the background');
assert.match(css, /mask-image:radial-gradient\(ellipse 53% 45% at 44% 50%/,
  'elliptical mask fades before the container edges');
assert.match(css, /transparent 100%\);transform-origin:44% 50%;animation:neos-logo-halo-breathe/,
  'halo breathes slowly inside the fade');
assert.match(css, /@keyframes neos-logo-halo-breathe/);
assert.match(css, /#nova-root\[data-motion="subtle"\] \.neos-brand-mark\{--neos-halo-min:\.76;--neos-halo-max:\.86;--neos-halo-expand:1\.015;--neos-halo-time:16s\}/);
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-brand-mark::before\{animation:none;opacity:\.82;transform:none\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*#nova-root \.neos-brand-mark::before\{animation:none!important;opacity:\.82!important;transform:none!important\}/);
assert.match(css, /#nova-root \.neos-symbol-crop\{left:0;width:63px\}/);
assert.match(css, /#nova-root \.neos-symbol-crop\{left:0;width:55px\}/);
assert.match(css, /#nova-root \.neos-symbol-crop\{left:0;width:47px\}/);
assert.match(css, /#nova-root \.neos-symbol-crop img\.neos-symbol-five\{left:-23px\}/);
assert.match(css, /#nova-root \.neos-symbol-crop img\.neos-symbol-five\{left:-22px\}/);
assert.match(css, /#nova-root \.neos-symbol-crop img\.neos-symbol-five\{left:-17px\}/);
assert.match(css, /rgba\(94,214,237,\.26\) 1px/, 'grid is more visible');
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-brand-mark::before\{opacity:\.94\}/);
const oldCrop = [[7,-30],[5,-27],[6,-23]];
const newCrop = [[0,-23],[0,-22],[0,-17]];
for(let i=0;i<oldCrop.length;i++){
  assert.equal(oldCrop[i][0]+oldCrop[i][1],newCrop[i][0]+newCrop[i][1],
    'symbol image stays aligned while its left crop opens');
}
const logo = fs.readFileSync(path.join(__dirname, 'neos-logo-05-hybrid-v0641.png'));
assert.equal(logo.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
const pickerStart=js.indexOf('  function renderFolderPicker(){');
const pickerEnd=js.indexOf('\n  async function browseDestination',pickerStart);
assert.ok(pickerStart>=0&&pickerEnd>pickerStart,'destination picker found');
const pickerHost={innerHTML:'',contains:()=>false};
global.document={activeElement:null};
const renderPicker=state=>new Function('popHost','pickerState','popMode','esc','icon','fileBusy',
  js.slice(pickerStart,pickerEnd)+'\nreturn renderFolderPicker;')(
    pickerHost,state,'destination',value=>String(value),()=>'<svg></svg>',false)();
const pickerState={mode:'copy',entries:[{name:'a'}],path:'/',folders:[],search:'',loading:true,error:''};
renderPicker(pickerState);
assert.match(pickerHost.innerHTML, /aria-label="Racine des fichiers"/);
assert.match(pickerHost.innerHTML, /<span class="neos-sr-only">Filtrer les dossiers<\/span>/);
assert.match(pickerHost.innerHTML, /aria-describedby="neos-destination-keyboard-help"/);
assert.match(pickerHost.innerHTML, /role="status" aria-live="polite"[^>]*>.*Chargement des dossiers…/);
pickerState.loading=false;pickerState.error='Dossier inaccessible';renderPicker(pickerState);
assert.match(pickerHost.innerHTML, /class="neos-destination-empty neos-destination-error" role="alert"/);
pickerState.error='';renderPicker(pickerState);
assert.match(pickerHost.innerHTML, /role="status">Aucun sous-dossier<\/div>/);
assert.match(js, /role="status">Aucun dossier correspondant<\/div>/);
const oldSearch={selectionStart:2,selectionEnd:4,matches:selector=>selector==='[data-destination-search]'};
const newSearch={selection:null,focus(){document.activeElement=this;},setSelectionRange(a,b){this.selection=[a,b];}};
const focusHost={contains:el=>el===oldSearch,querySelector:()=>newSearch,querySelectorAll:()=>[],set innerHTML(value){this.html=value;}};
document.activeElement=oldSearch;
new Function('popHost','pickerState','popMode','esc','icon','fileBusy',
  js.slice(pickerStart,pickerEnd)+'\nreturn renderFolderPicker;')(
    focusHost,pickerState,'destination',value=>String(value),()=>'<svg></svg>',false)();
assert.equal(document.activeElement,newSearch,'search retains focus after a folder refresh');
assert.deepEqual(newSearch.selection,[2,4],'search selection survives a folder refresh');
const navStart=js.indexOf("  popHost.addEventListener('keydown',event=>{\n    if(popMode!=='destination'");
const navEnd=js.indexOf("\n  popHost.addEventListener('keydown',event=>{\n    if(popMode!=='global-search'",navStart);
assert.ok(navStart>=0&&navEnd>navStart,'destination keyboard handler found');
const first={focus(){document.activeElement=this;},closest(selector){return selector==='.neos-destination-folder'?this:null;}};
const second={focus(){document.activeElement=this;},closest(selector){return selector==='.neos-destination-folder'?this:null;}};
const search={focus(){document.activeElement=this;},matches:selector=>selector==='[data-destination-search]'};
let keyHandler;
const navHost={addEventListener:(type,handler)=>{if(type==='keydown')keyHandler=handler;},querySelectorAll:()=>[first,second],querySelector:()=>search};
new Function('popHost','popMode',js.slice(navStart,navEnd))(navHost,'destination');
const press=(target,key)=>{const event={target,key,prevented:false,altKey:false,ctrlKey:false,metaKey:false,preventDefault(){this.prevented=true;},stopPropagation(){}};keyHandler(event);return event;};
assert.ok(press(search,'ArrowDown').prevented);assert.equal(document.activeElement,first);
assert.ok(press(first,'ArrowDown').prevented);assert.equal(document.activeElement,second);
assert.ok(press(second,'Home').prevented);assert.equal(document.activeElement,first);
assert.ok(press(first,'ArrowUp').prevented);assert.equal(document.activeElement,search);
assert.ok(press(first,'End').prevented);assert.equal(document.activeElement,second);
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'),
  'previous fixes retained');
console.log('Neos v0.6.45 destination keyboard checks passed');
