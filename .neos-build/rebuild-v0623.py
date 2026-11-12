#!/usr/bin/env python3
"""Deterministically rebuild Neos 0.6.23 from verified v0.6.22 ZIP.
The patch only changes IMAP empty-draft copy behavior, documentation, and version.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import zipfile
import xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parents[1]
OLD = BASE / 'neos-nextcloud35-v0.6.22.zip'
OUT = BASE / 'neos-nextcloud35-v0.6.23.zip'
EXPECTED_CONTENT_SHA256 = 'a454246232a69c9dc8c620c29281402b41642bd94d550573a0b4e48f44b802f6'

def replace_once(s, old, new):
    hits=s.count(old)
    if hits != 1:
        raise RuntimeError('Unexpected patch precondition: expected 1, found %d for %r' % (hits,old[:100]))
    return s.replace(old,new)

def patch_js(src):
    s=src.decode('utf-8')
    s=replace_once(s,
      '/** Neos 0.6.22 — safe IMAP draft text reprise, explicit Talk read markers and refresh. */',
      '/** Neos 0.6.23 — allow genuinely empty IMAP drafts to be copied, without altering the original. */')
    s=replace_once(s,
      "const mailDrafts={open:false,status:'idle',items:[],error:'',note:'',generation:0,selected:null,loading:false,body:'',html:'',readError:'',choices:[],selectedMailbox:'auto'};",
      "const mailDrafts={open:false,status:'idle',items:[],error:'',note:'',generation:0,selected:null,loading:false,loaded:false,body:'',html:'',readError:'',choices:[],selectedMailbox:'auto'};")
    s=replace_once(s,
      "if(!item||d.loading||d.readError||!d.body.trim()){\n      toast('Le texte du brouillon doit être chargé avant la reprise.','error');return;",
      "if(!item||d.loading||d.readError||!d.loaded){\n      toast('Le brouillon doit terminer son chargement avant la reprise.','error');return;")
    s=replace_once(s,
      "d.open=true;d.status='loading';d.error='';d.note='';d.selected=null;d.items=[];d.readError='';if(activeWorkspace==='mail')render();",
      "d.open=true;d.status='loading';d.error='';d.note='';d.selected=null;d.items=[];d.readError='';d.loaded=false;d.loading=false;if(activeWorkspace==='mail')render();")
    s=replace_once(s,
      "const gen=++d.generation;d.selected=item;d.loading=true;d.body='';d.html='';d.readError='';render();",
      "const gen=++d.generation;d.selected=item;d.loading=true;d.loaded=false;d.body='';d.html='';d.readError='';render();")
    s=replace_once(s,
      "const parsed=mailContentFromResponse(result);d.body=parsed.body;d.html=parsed.html;",
      "const parsed=mailContentFromResponse(result);d.body=parsed.body;d.html=parsed.html;d.loaded=true;")
    s=replace_once(s,
      "else if(action==='mail-drafts-close'){mailDrafts.open=false;mailDrafts.generation++;mailDrafts.selected=null;render();}",
      "else if(action==='mail-drafts-close'){mailDrafts.open=false;mailDrafts.generation++;mailDrafts.selected=null;mailDrafts.loaded=false;mailDrafts.loading=false;render();}")
    s=replace_once(s,
      "else if(action==='mail-draft-back'){mailDrafts.generation++;mailDrafts.selected=null;mailDrafts.body='';mailDrafts.html='';render();}",
      "else if(action==='mail-draft-back'){mailDrafts.generation++;mailDrafts.selected=null;mailDrafts.body='';mailDrafts.html='';mailDrafts.loaded=false;mailDrafts.loading=false;render();}")
    s=replace_once(s,
      "d.html?`<div class=\"neos-mail-formatted\">${d.html}</div>`:`<div class=\"neos-mail-plain\">${esc(d.body||'Brouillon sans texte.')}</div>`;",
      "d.html?`<div class=\"neos-mail-formatted\">${d.html}</div>`:`<div class=\"neos-mail-plain\">${esc(d.body||'Brouillon sans texte. Tu peux le reprendre pour le compléter.')}</div>`;")
    s=replace_once(s,
      '${icon(\'edit\',15)} Reprendre le texte dans Neos (copie)',
      '${icon(\'edit\',15)} Reprendre dans Neos (copie)')
    s=replace_once(s,
      '<span>Message *</span><textarea rows="11" data-mail-compose-field="body" required maxlength="120000"',
      '<span>Message (facultatif pour un brouillon)</span><textarea rows="11" data-mail-compose-field="body" maxlength="120000"')
    s=replace_once(s,
      "d.items=[{messageId:'101',accountId:'1',accountName:'projet@example.test',title:'Compte rendu de réunion',to:'camille@example.test',summary:'Aujourd’hui · 18:20',url:mailNative('/box/7/thread/new/101'),demoBody:'Bonjour Camille,\\n\\nVoici le premier brouillon.\\n\\nÀ bientôt.'},{messageId:'102',accountId:'2',accountName:'perso@example.test',title:'Invitation projet',to:'alex@example.test',summary:'Hier · 15:10',url:mailNative('/box/11/thread/new/102'),demoBody:'Bonjour, voici un deuxième brouillon.'}];",
      "d.items=[{messageId:'101',accountId:'1',accountName:'projet@example.test',title:'Compte rendu de réunion',to:'camille@example.test',summary:'Aujourd’hui · 18:20',url:mailNative('/box/7/thread/new/101'),mailboxKey:'1:7',demoBody:'Bonjour Camille,\\n\\nVoici le premier brouillon.\\n\\nÀ bientôt.'},{messageId:'102',accountId:'2',accountName:'perso@example.test',title:'Invitation projet',to:'alex@example.test',summary:'Hier · 15:10',url:mailNative('/box/11/thread/new/102'),mailboxKey:'2:11',demoBody:'Bonjour, voici un deuxième brouillon.'},{messageId:'103',accountId:'1',accountName:'projet@example.test',title:'Brouillon vide à compléter',to:'camille@example.test',summary:'Aujourd’hui · 17:45',url:mailNative('/box/7/thread/new/103'),mailboxKey:'1:7',demoBody:''}];")
    s=replace_once(s,
      "if(d.selectedMailbox!=='auto')d.items=d.items.filter((_,i)=>d.choices[i]?.key===d.selectedMailbox);",
      "if(d.selectedMailbox!=='auto')d.items=d.items.filter(item=>item.mailboxKey===d.selectedMailbox);")
    return s.encode('utf-8')

def patch_info(src):
    s=src.decode('utf-8')
    s=replace_once(s,'<version>0.6.22</version>','<version>0.6.23</version>')
    ET.fromstring(s)
    return s.encode('utf-8')

def patch_doc(path,src):
    s=src.decode('utf-8')
    if path.endswith('CHANGELOG.md'):
        s='# Neos 0.6.23 — correctif brouillons vides\n\n- Mail : après chargement réussi, la reprise en copie autorise les brouillons IMAP sans texte. L’original reste intact.\n- Mail : message vide explicitement signalé, champ Message facultatif pour enregistrer un brouillon ; l’envoi exige toujours un corps non vide.\n- Talk, Contacts, Planning et autres fonctions conservés de v0.6.22.\n\n'+s
    elif path.endswith('INSTALLATION-OMV.md'):
        s=s.replace('v0.6.22','v0.6.23').replace('0.6.22','0.6.23').replace('v0622','v0623')
        s=s.replace('Sauvegarde de la v0.6.21', 'Sauvegarde de la v0.6.22')
        s=s.replace('Elle ajoute la reprise **en copie texte**', 'Elle corrige la reprise **en copie texte, y compris pour les brouillons vides**')
        s=s.replace('**Mail → Brouillons :** ouvre un brouillon de test', '**Mail → Brouillons :** ouvre un brouillon vide puis un brouillon avec texte, confirme que les deux peuvent être repris en copie ; puis ouvre un brouillon de test')
    elif path.endswith('TESTS.md'):
        s='# Tests v0.6.23 — à valider sur NAS\n\n- Brouillon IMAP vide : reprise autorisée seulement après chargement réussi, éditeur texte vide, original inchangé.\n- Brouillon IMAP avec texte : reprise identique à v0.6.22.\n- Erreur de lecture IMAP : aucune reprise autorisée.\n- L’envoi d’un courriel vide reste refusé par la validation Neos.\n\n'+s
    return s.encode('utf-8')

def build():
    if not OLD.exists():raise SystemExit('Missing source ZIP: '+str(OLD))
    with zipfile.ZipFile(OLD) as inz:
        if inz.testzip() is not None:raise SystemExit('Corrupt source ZIP')
        with zipfile.ZipFile(OUT,'w') as outz:
            for info in inz.infolist():
                data=inz.read(info.filename)
                if info.filename=='novadashboard/js/app.js':data=patch_js(data)
                elif info.filename=='novadashboard/appinfo/info.xml':data=patch_info(data)
                elif info.filename in ('novadashboard/CHANGELOG.md','novadashboard/INSTALLATION-OMV.md','novadashboard/TESTS.md'):
                    data=patch_doc(info.filename,data)
                outz.writestr(info,data)
    with zipfile.ZipFile(OUT) as z:
        assert z.testzip() is None
        assert b'<version>0.6.23</version>' in z.read('novadashboard/appinfo/info.xml')
        digest=hashlib.sha256()
        for name in sorted(z.namelist()):
            digest.update(name.encode('utf-8')+b'\x00'+hashlib.sha256(z.read(name)).digest())
    if digest.hexdigest()!=EXPECTED_CONTENT_SHA256:
        OUT.unlink(missing_ok=True)
        raise SystemExit('Rebuilt archive contents differ from the validated v0.6.23')
    print('CREATED:',OUT,OUT.stat().st_size,'bytes, content_sha256:',digest.hexdigest())
    print('ZIP_SHA256:',hashlib.sha256(OUT.read_bytes()).hexdigest())

if __name__=='__main__':build()