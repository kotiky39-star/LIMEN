/* =========================================================
   OBSIDIAN ARCHIVE // SHARED TERMINAL (terminal.js)
   Exposes:
     window.OA_TERMINAL.init(containerId, isDrawer)
     window.OA_TERMINAL.mountDrawer()
     window.OA_TERMINAL.toggleDrawer(force)
     window.OA_TERMINAL.isOpen()
   ========================================================= */
(function(global){
'use strict';

if(global.OA_TERMINAL && global.OA_TERMINAL.init) return;

var PROMPT = 'guest@obsidian:~$ ';

/* ---------------- injected CSS (never touches page CSS) ---------------- */
var CSS = [
'#oa-drawer{position:fixed;left:0;right:0;bottom:0;height:min(52vh,440px);z-index:9500;background:#050505;',
'border-top:1px solid #b9975b;box-shadow:0 -24px 60px rgba(0,0,0,.85);transform:translateY(105%);',
'transition:transform .38s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column}',
'#oa-drawer.open{transform:translateY(0)}',
'.oa-drawer-head{display:flex;align-items:center;gap:10px;padding:7px 12px;border-bottom:1px solid rgba(185,151,91,.35);',
'background:rgba(185,151,91,.06);font-family:"JetBrains Mono","Courier New",monospace;font-size:10px;letter-spacing:.2em;',
'color:#b9975b;text-transform:uppercase;flex-shrink:0}',
'.oa-drawer-head .sp{margin-left:auto;display:flex;gap:8px}',
'.oa-dhead-btn{font-family:inherit;background:transparent;border:1px solid rgba(185,151,91,.4);color:#b9975b;',
'font-size:10px;letter-spacing:.16em;padding:3px 9px;cursor:pointer;text-decoration:none;transition:background .2s,color .2s}',
'.oa-dhead-btn:hover{background:rgba(185,151,91,.15);color:#e5dfd1}',
'.oa-drawer-body{flex:1;min-height:0}',
'.oa-term{display:flex;flex-direction:column;height:100%;background:#050505;',
'font-family:"JetBrains Mono","Courier New",monospace;border:1px solid #b9975b}',
'#oa-drawer .oa-term{border:none}',
'.oa-term-bar{display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:1px solid rgba(185,151,91,.3);',
'font-size:10px;letter-spacing:.2em;color:#b9975b;text-transform:uppercase;flex-shrink:0}',
'.oa-term-bar .sp{margin-left:auto;display:flex;gap:8px;align-items:center}',
'.oa-term-out{flex:1;min-height:0;overflow-y:auto;padding:12px 14px;font-size:12.5px;line-height:1.65;',
'scrollbar-width:thin;scrollbar-color:#b9975b #050505}',
'.oa-term-out::-webkit-scrollbar{width:8px}',
'.oa-term-out::-webkit-scrollbar-thumb{background:rgba(185,151,91,.4)}',
'.oa-term-out .l{white-space:pre-wrap;word-break:break-word;margin:0 0 2px}',
'.oa-term-out .l.sys{color:#b9975b}',
'.oa-term-out .l.ok{color:#2e8b57}',
'.oa-term-out .l.err{color:#c8102e}',
'.oa-term-out .l.usr{color:#e5dfd1}',
'.oa-term-out .l.dim{color:rgba(229,223,209,.55)}',
'.oa-term-out .l.achv{color:#2e8b57;text-shadow:0 0 10px rgba(46,139,87,.6);letter-spacing:.12em}',
'.oa-term-in{display:flex;align-items:center;gap:8px;border-top:1px solid rgba(185,151,91,.3);padding:9px 14px;',
'cursor:text;flex-shrink:0}',
'.oa-prompt{color:#b9975b;font-size:12.5px;white-space:nowrap}',
'.oa-input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#e5dfd1;font-family:inherit;',
'font-size:12.5px;letter-spacing:.04em;caret-color:#b9975b}',
'.oa-cursor{color:#b9975b;animation:oablink 1s steps(1) infinite}',
'@keyframes oablink{0%,49%{opacity:1}50%,100%{opacity:0}}',
'.oa-skip{font-family:inherit;background:transparent;border:1px solid rgba(185,151,91,.4);color:#b9975b;',
'font-size:9px;letter-spacing:.2em;padding:2px 8px;cursor:pointer;display:none}',
'.oa-skip:hover{background:rgba(185,151,91,.15);color:#e5dfd1}',
'.oa-flash{position:fixed;inset:0;z-index:99995;pointer-events:none;background:rgba(200,16,46,.35);opacity:0}',
'.oa-shake{animation:oashake .35s ease-in-out infinite}',
'@keyframes oashake{0%,100%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}50%{transform:translate(3px,-2px)}75%{transform:translate(-2px,-2px)}}',
'#oa-matrix{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.88)}'
].join('\n');

function injectCSS(){
  if(document.getElementById('oa-term-css')) return;
  var s = document.createElement('style');
  s.id = 'oa-term-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ---------------- storage ---------------- */
function lsGet(k, fb){ try{ var v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); }catch(e){ return fb; } }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

/* ---------------- achievements (easter eggs) ---------------- */
var EGGS = {
  hack:'HACKERMAN',
  konami:'KONAMI MASTER',
  matrix:'REDPILL',
  love:'BELOVED',
  xyzzy:'ADVENTURER',
  '42':'THE ANSWER',
  rm:'SURVIVOR',
  coffee:'DECAF PROTOCOL',
  god:'FALSE PROPHET',
  sudo:'ROOT DENIED',
  secret:'CURIOUS MIND'
};

function unlock(key, ctx){
  var name = EGGS[key];
  if(!name) return;
  var a = lsGet('oa_achievements', {});
  if(a[key]) return;
  a[key] = new Date().toISOString();
  lsSet('oa_achievements', a);
  if(ctx && ctx.achv) ctx.achv('> ACHIEVEMENT UNLOCKED: [ ' + name + ' ]');
}

/* ---------------- game data ---------------- */
var FALLBACK_GAMES = [
  {id:'halo',title:'HALO',year:'2001'},
  {id:'mass_effect',title:'MASS EFFECT',year:'2007'},
  {id:'witcher3',title:'THE WITCHER 3',year:'2015'},
  {id:'cyberpunk',title:'CYBERPUNK 2077',year:'2020'},
  {id:'elden_ring',title:'ELDEN RING',year:'2022'},
  {id:'fallout',title:'FALLOUT',year:'1997'},
  {id:'zelda',title:'ZELDA',year:'1986'},
  {id:'pokemon',title:'POKEMON',year:'1996'},
  {id:'ff',title:'FINAL FANTASY',year:'1987'},
  {id:'resident_evil',title:'RESIDENT EVIL',year:'1996'},
  {id:'metal_gear',title:'METAL GEAR',year:'1987'},
  {id:'sekiro',title:'SEKIRO',year:'2019'}
];
var ALIAS = {
  mass_effect:'masseffect', witcher3:'witcher', the_witcher_3:'witcher',
  elden_ring:'eldenring', ff:'finalfantasy', final_fantasy:'finalfantasy',
  metal_gear:'metalgear', ac:'assassinscreed', assassins_creed:'assassinscreed',
  rdr:'rdr2', reddead:'rdr2'
};

function getGames(){
  try{
    if(global.OA_SHELF && typeof global.OA_SHELF.games === 'function'){
      var g = global.OA_SHELF.games();
      if(g && g.length) return g;
    }
  }catch(e){}
  if(global.GAMES && typeof global.GAMES === 'object' && !Array.isArray(global.GAMES)){
    return Object.keys(global.GAMES).map(function(k){
      var x = global.GAMES[k] || {};
      return {id:k, title:x.title || k, year:x.year || '????'};
    });
  }
  return FALLBACK_GAMES;
}

function knownId(id){
  var q = String(id || '').toLowerCase();
  if(!q) return null;
  var games = getGames();
  for(var i = 0; i < games.length; i++){
    if(games[i].id === q) return q;
  }
  if(ALIAS[q]) return ALIAS[q];
  return null;
}

function norm(str){ return String(str || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

/* ---------------- fx helpers ---------------- */
function flashRed(){
  var f = document.createElement('div');
  f.className = 'oa-flash';
  document.body.appendChild(f);
  if(typeof gsap !== 'undefined'){
    gsap.fromTo(f, {opacity:0}, {opacity:1, duration:.1, yoyo:true, repeat:3,
      onComplete:function(){ f.remove(); }});
  } else {
    f.style.opacity = '1';
    setTimeout(function(){ f.remove(); }, 400);
  }
}

function matrixRain(ctx){
  ctx.sys('> WAKE UP...');
  ctx.sys('> THE MATRIX HAS YOU...');
  var c = document.createElement('canvas');
  c.id = 'oa-matrix';
  document.body.appendChild(c);
  var g = c.getContext('2d');
  c.width = global.innerWidth;
  c.height = global.innerHeight;
  var chars = 'アカサタナハマヤラワガザダバパイキシチニヒミリウグズヅプ0123456789ABCDEFZ$#%&'.split('');
  var fs = 14;
  var cols = Math.max(1, Math.floor(c.width / fs));
  var drops = [];
  for(var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -50);
  var iv = setInterval(function(){
    g.fillStyle = 'rgba(0,0,0,.08)';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#2e8b57';
    g.font = fs + 'px monospace';
    for(var j = 0; j < drops.length; j++){
      var ch = chars[Math.floor(Math.random() * chars.length)];
      g.fillText(ch, j * fs, drops[j] * fs);
      if(drops[j] * fs > c.height && Math.random() > .975) drops[j] = 0;
      drops[j]++;
    }
  }, 50);
  setTimeout(function(){
    clearInterval(iv);
    if(typeof gsap !== 'undefined'){
      gsap.to(c, {opacity:0, duration:.5, onComplete:function(){ c.remove(); }});
    } else { c.remove(); }
  }, 5000);
  unlock('matrix', ctx);
}

function hackSeq(ctx){
  if(ctx.state.busy) return;
  ctx.state.busy = true;
  var steps = [
    '> BYPASSING ICE LAYER 1 .............. [OK]',
    '> SPOOFING UPLINK HANDSHAKE .......... [OK]',
    '> INJECTING PAYLOAD obsidian.bin ..... [OK]',
    '> ESCALATING PRIVILEGES .............. [OK]'
  ];
  var bars = [
    '> DECRYPTING [##------------------] 12%',
    '> DECRYPTING [#######-------------] 38%',
    '> DECRYPTING [############--------] 61%',
    '> DECRYPTING [#################---] 84%',
    '> DECRYPTING [####################] 100%'
  ];
  var i = 0;
  function step(){
    if(i < steps.length){ ctx.ok(steps[i]); i++; setTimeout(step, 380); return; }
    var b = i - steps.length;
    if(b < bars.length){ ctx.sys(bars[b]); i++; setTimeout(step, 300); return; }
    ctx.ok('> FIREWALL BREACHED. YOU ARE INSIDE.');
    ctx.err('> WARNING: INTRUSION LOGGED TO /var/log/obsidian.log');
    unlock('hack', ctx);
    ctx.state.busy = false;
  }
  step();
}

/* ---------------- command registry ---------------- */
var CATS = ['SYSTEM', 'NAVIGATION & DATA', 'LORE & IMMERSION', 'EASTER EGGS'];

var COMMANDS = {

/* ---- SYSTEM ---- */
help:{cat:'SYSTEM', desc:'List available commands',
  run:function(a, ctx){
    ctx.sys('+---[ OA-TERMINAL // COMMAND REGISTRY ]---+');
    CATS.forEach(function(cat){
      ctx.sys('  [' + cat + ']');
      Object.keys(COMMANDS).forEach(function(k){
        var c = COMMANDS[k];
        if(c.cat !== cat) return;
        ctx.print('    ' + (k + '             ').slice(0, 13) + ' ' + c.desc, 'dim');
      });
    });
    ctx.sys("> USE 'man <cmd>' FOR DETAILS");
  }},

clear:{cat:'SYSTEM', desc:'Clear terminal output',
  run:function(a, ctx){ ctx.clear(); }},

history:{cat:'SYSTEM', desc:'Show command history',
  run:function(a, ctx){
    if(!ctx.state.hist.length){ ctx.dim('> HISTORY EMPTY'); return; }
    ctx.state.hist.forEach(function(h, i){
      ctx.print('  ' + ((i + 1) + '   ').slice(0, 4) + h, 'dim');
    });
  }},

man:{cat:'SYSTEM', desc:'Show manual for a command', usage:'man <cmd>',
  man:'Displays NAME, CATEGORY, SYNOPSIS and DESCRIPTION\nfor the requested command.',
  run:function(a, ctx){
    var k = (a[0] || '').toLowerCase();
    if(!k){ ctx.err('> USAGE: man <cmd>'); return; }
    var c = COMMANDS[k];
    if(!c){ ctx.err('> NO MANUAL ENTRY: ' + k); return; }
    ctx.sys('> MANUAL: ' + k);
    ctx.print('  NAME    : ' + k, 'dim');
    ctx.print('  CATEGORY: ' + c.cat, 'dim');
    ctx.print('  SYNOPSIS: ' + (c.usage || k), 'dim');
    ctx.print('  DESC    : ' + c.desc, 'dim');
    if(c.man) c.man.split('\n').forEach(function(l){ ctx.print('            ' + l, 'dim'); });
  }},

/* ---- NAVIGATION & DATA ---- */
ls:{cat:'NAVIGATION & DATA', desc:'List all game IDs in the archive',
  run:function(a, ctx){
    var g = getGames();
    ctx.sys('> ARCHIVE INDEX // ' + g.length + ' RECORDS');
    var ids = g.map(function(x){ return x.id; });
    for(var i = 0; i < ids.length; i += 4){
      ctx.print('  ' + ids.slice(i, i + 4).map(function(s){
        return (s + '                ').slice(0, 16);
      }).join(''), 'dim');
    }
  }},

open:{cat:'NAVIGATION & DATA', desc:'Open a universe dossier', usage:'open <id>',
  man:'Navigates to universe.html?game=<id>.\nUse ls to list valid IDs.',
  run:function(a, ctx){
    var id = (a[0] || '').toLowerCase();
    if(!id){ ctx.err("> USAGE: open <id> // SEE 'ls'"); return; }
    var rid = knownId(id);
    if(!rid){ ctx.err("> RECORD NOT FOUND: '" + id + "' // TRY 'ls'"); return; }
    ctx.nav('universe.html?game=' + encodeURIComponent(rid));
  }},

search:{cat:'NAVIGATION & DATA', desc:'Find a game in the archive', usage:'search <query>',
  man:'On the index page: rotates the 3D shelf to the match.\nElsewhere: prints matching records.',
  run:function(a, ctx){
    var q = a.join(' ').trim();
    if(!q){ ctx.err('> USAGE: search <query>'); return; }
    var sh = global.OA_SHELF;
    if(sh && sh.find && sh.focus){
      var idx = sh.find(q);
      if(idx === -1){ ctx.err('> NO RECORD FOUND: "' + q.toUpperCase() + '"'); return; }
      sh.focus(idx);
      var gm = sh.games()[idx];
      ctx.ok('> MATCH: ' + gm.title + ' [' + gm.year + '] // ROTATING SHELF');
      return;
    }
    var nq = norm(q);
    var matches = getGames().filter(function(g){
      return norm(g.title).indexOf(nq) !== -1 || norm(g.id).indexOf(nq) !== -1;
    });
    if(!matches.length){ ctx.err('> NO RECORD FOUND: "' + q.toUpperCase() + '"'); return; }
    ctx.sys('> ' + matches.length + ' MATCH(ES):');
    matches.forEach(function(g){
      ctx.print('  ' + g.id + ' // ' + g.title + ' [' + g.year + ']', 'dim');
    });
  }},

goto:{cat:'NAVIGATION & DATA', desc:'Navigate between pages', usage:'goto <home|universe|lore|profile|terminal>',
  run:function(a, ctx){
    var map = {home:'index.html', index:'index.html', universe:'universe.html',
      lore:'lore.html', profile:'profile.html', terminal:'terminal.html'};
    var k = (a[0] || '').toLowerCase();
    if(!map[k]){ ctx.err('> USAGE: goto <home|universe|lore|profile|terminal>'); return; }
    ctx.nav(map[k]);
  }},

sort:{cat:'NAVIGATION & DATA', desc:'Change shelf sorting', usage:'sort <year|alpha|default>',
  man:'Only works on the index page where the 3D shelf lives.',
  run:function(a, ctx){
    var m = (a[0] || '').toLowerCase();
    if(['year', 'alpha', 'default'].indexOf(m) === -1){
      ctx.err('> USAGE: sort <year|alpha|default>'); return;
    }
    var sh = global.OA_SHELF;
    if(!sh || !sh.sort){ ctx.err('> SHELF OFFLINE // RUN FROM INDEX'); return; }
    sh.sort(m);
    ctx.ok('> SORT APPLIED: ' + m.toUpperCase());
  }},

theme:{cat:'NAVIGATION & DATA', desc:'Change accent color', usage:'theme <amber|green|ice>',
  run:function(a, ctx){
    var map = {amber:'#b9975b', green:'#2e8b57', ice:'#7fb6d9'};
    var k = (a[0] || '').toLowerCase();
    if(!map[k]){ ctx.err('> USAGE: theme <amber|green|ice>'); return; }
    document.documentElement.style.setProperty('--accent', map[k]);
    var p = lsGet('oa_profile', {});
    p.phosphor = k;
    lsSet('oa_profile', p);
    ctx.ok('> THEME APPLIED: ' + k.toUpperCase() + ' ' + map[k]);
  }},

random:{cat:'NAVIGATION & DATA', desc:'Open a random game',
  run:function(a, ctx){
    var g = getGames();
    var pick = g[Math.floor(Math.random() * g.length)];
    ctx.sys('> SELECTING RANDOM RECORD ... ' + String(pick.id).toUpperCase());
    ctx.nav('universe.html?game=' + encodeURIComponent(pick.id));
  }},

next:{cat:'NAVIGATION & DATA', desc:'Rotate the 3D shelf forward',
  run:function(a, ctx){
    var sh = global.OA_SHELF;
    if(!sh){ ctx.err('> SHELF OFFLINE // RUN FROM INDEX'); return; }
    sh.next();
    ctx.ok('> SHELF +1');
  }},

prev:{cat:'NAVIGATION & DATA', desc:'Rotate the 3D shelf backward',
  run:function(a, ctx){
    var sh = global.OA_SHELF;
    if(!sh){ ctx.err('> SHELF OFFLINE // RUN FROM INDEX'); return; }
    sh.prev();
    ctx.ok('> SHELF -1');
  }},

/* ---- LORE & IMMERSION ---- */
whoami:{cat:'LORE & IMMERSION', desc:'Display current identity',
  run:function(a, ctx){ ctx.sys('> USER: guest // CLEARANCE: L0 // STATUS: observer'); }},

about:{cat:'LORE & IMMERSION', desc:'What is the Obsidian Archive?',
  run:function(a, ctx){
    [
      '> THE OBSIDIAN ARCHIVE is a crystal-lattice vault',
      '> suspended beneath an abandoned arcade. Every',
      '> cartridge on the shelf is a world, every spine',
      '> a timeline. The Archivist curates; you observe.',
      '> Nothing here is real. Everything here is true.'
    ].forEach(function(l){ ctx.print(l, 'dim'); });
  }},

stats:{cat:'LORE & IMMERSION', desc:'Archive statistics',
  run:function(a, ctx){
    var games = getGames().length;
    var theories = lsGet('oa_theories', []).length + 3;
    var first = lsGet('oa_first_visit', null);
    if(!first){ first = Date.now(); lsSet('oa_first_visit', first); }
    var days = Math.max(1, Math.ceil((Date.now() - first) / 86400000));
    ctx.sys('> ' + games + ' games archived // ' + theories + ' theories // ' + days + ' days online');
  }},

logs:{cat:'LORE & IMMERSION', desc:'Dump system log',
  run:function(a, ctx){
    var L = [
      ['[OK] crystal lattice stable', 'ok'],
      ['[OK] coolant loop nominal', 'ok'],
      ['[OK] shelf gyros calibrated', 'ok'],
      ['[WARN] sector 7g hum detected', 'sys'],
      ['[OK] scanline emitter 100%', 'ok'],
      ['[ERR] caffeine module missing', 'err'],
      ['[OK] archive integrity verified', 'ok']
    ];
    L.forEach(function(x){ ctx.print('> ' + x[0], x[1]); });
  }},

access:{cat:'LORE & IMMERSION', desc:'Show clearance levels',
  run:function(a, ctx){
    [
      '> L0 OBSERVER   - public shelves',
      '> L1 CURATOR    - caption editing',
      '> L2 ARCHIVIST  - dossier access',
      '> L3 ORACLE     - timeline manipulation',
      '> L4 GHOST      - [REDACTED]',
      '> L5 ARCHITECT  - [REDACTED]'
    ].forEach(function(l){ ctx.print(l, 'dim'); });
    ctx.sys('> CURRENT: L0 // KEEP DIGGING.');
  }},

archive:{cat:'LORE & IMMERSION', desc:'List archive sectors',
  run:function(a, ctx){
    [
      '> SECTOR 01 // THE SHELF          (index.html)',
      '> SECTOR 02 // DOSSIER VAULT      (universe.html)',
      '> SECTOR 03 // COMMUNITY UPLINK   (lore.html)',
      '> SECTOR 04 // OPERATOR CONSOLE   (profile.html)',
      '> SECTOR 05 // THIS TERMINAL      (terminal.html)',
      '> SECTOR 07g // ??? (hum detected)'
    ].forEach(function(l){ ctx.print(l, 'dim'); });
  }},

date:{cat:'LORE & IMMERSION', desc:'Archive-synced date',
  run:function(a, ctx){
    var d = new Date();
    function p(n){ return (n < 10 ? '0' : '') + n; }
    ctx.sys('> OB-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' // sync: 99.8%');
  }},

credits:{cat:'LORE & IMMERSION', desc:'Engineering team credits',
  run:function(a, ctx){
    [
      '+======[ OBSIDIAN ARCHIVE // CREW ]======+',
      '| LEAD ENGINEER .......... A. OBSIDIAN    |',
      '| SHELF MATHEMATICIAN .... DR. BEZIER     |',
      '| CRT PHYSICS ............ V. SCANLINE    |',
      '| LORE KEEPERS ........... THE NIGHT SHIFT|',
      '| QA ..................... YOU, APPARENTLY|',
      '+=========================================+'
    ].forEach(function(l){ ctx.print(l, 'sys'); });
  }},

/* ---- EASTER EGGS ---- */
sudo:{cat:'EASTER EGGS', desc:'Execute as superuser',
  run:function(a, ctx){
    ctx.state.sudo++;
    if(ctx.state.sudo < 3){
      ctx.err('> PERMISSION DENIED');
    } else if(ctx.state.sudo === 3){
      ctx.err('> PERMISSION DENIED');
      ctx.err('> !! SECURITY BREACH ATTEMPT #3 LOGGED !!');
      flashRed();
      unlock('sudo', ctx);
    } else {
      ctx.err('> PERMISSION DENIED (x' + ctx.state.sudo + ')');
    }
  }},

matrix:{cat:'EASTER EGGS', desc:'Follow the white rabbit',
  run:function(a, ctx){ matrixRain(ctx); }},

hack:{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){ hackSeq(ctx); }},

konami:{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){
    ctx.sys('> UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A START');
    var sh = global.OA_SHELF;
    if(sh && sh.spin){
      sh.spin();
      ctx.ok('> SHELF OVERDRIVE ENGAGED');
    } else {
      ctx.err('> SHELF OFFLINE // GLITCH SIMULATED');
      var t = document.querySelector('.oa-term');
      if(t){ t.classList.add('oa-shake'); setTimeout(function(){ t.classList.remove('oa-shake'); }, 1600); }
    }
    flashRed();
    unlock('konami', ctx);
  }},

coffee:{cat:'EASTER EGGS', desc:'Request caffeine',
  run:function(a, ctx){
    ctx.err('> NO CAFFEINE MODULE FOUND');
    unlock('coffee', ctx);
  }},

'42':{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){
    ctx.sys('> THE ANSWER TO LIFE, THE UNIVERSE, AND EVERYTHING');
    unlock('42', ctx);
  }},

rm:{cat:'EASTER EGGS', desc:'Remove files (disabled for guests)', usage:'rm -rf /',
  run:function(a, ctx){
    if(a.join(' ') === '-rf /'){
      ctx.err('> NICE TRY.');
      unlock('rm', ctx);
    } else {
      ctx.err('> rm IS DISABLED FOR GUEST SESSIONS');
    }
  }},

love:{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){
    ctx.sys('> DECRYPTING /root/love_letter.txt ...');
    [
      '',
      '  To whoever found this little corner of the dark,',
      '  this archive was built one late night at a time,',
      '  for everyone who still believes games are worlds.',
      '  Thank you for exploring it.',
      '                              - The Archivist',
      ''
    ].forEach(function(l){ ctx.print(l, 'dim'); });
    unlock('love', ctx);
  }},

xyzzy:{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){
    ctx.dim('> A HOLLOW VOICE SAYS: "FOOL."');
    unlock('xyzzy', ctx);
  }},

secret:{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){
    ctx.sys("> HINT: TRY 'hack', 'matrix', OR 'konami'");
    unlock('secret', ctx);
  }},

god:{cat:'EASTER EGGS', desc:'??????????????',
  run:function(a, ctx){
    ctx.err('> GOD MODE: ERROR 403.');
    unlock('god', ctx);
  }}
};

/* ---------------- boot sequence ---------------- */
var BANNER = [
'▀█▀ █▀▀ █▀█ █▀▄▀█ █ █▄░█ ▄▀█ █░░',
'░█░ ██▄ █▀▄ █░▀░█ █ █░▀█ █▀█ █▄▄'
].join('\n');

var BOOT_LOG = [
  '> OA-KERNEL v4.2.1 ................. LOADED',
  '> MOUNTING /dev/obsidian ........... OK',
  '> CRYSTAL LATTICE .................. STABLE',
  '> UPLINK HANDSHAKE ................. 99.8%',
  '> GUEST SESSION ESTABLISHED.'
];

/* ---------------- initTerminal ---------------- */
function initTerminal(containerId, isDrawer){
  injectCSS();
  var host = document.getElementById(containerId);
  if(!host) return null;
  host.innerHTML = '';

  var term = document.createElement('div');
  term.className = 'oa-term';

  var bar = document.createElement('div');
  bar.className = 'oa-term-bar';
  bar.innerHTML = '<span>&gt;_ OBSIDIAN TERMINAL v1.0</span><span class="sp"></span>';
  var skipBtn = document.createElement('button');
  skipBtn.className = 'oa-skip';
  skipBtn.type = 'button';
  skipBtn.textContent = '[ SKIP ]';
  bar.querySelector('.sp').appendChild(skipBtn);

  var out = document.createElement('div');
  out.className = 'oa-term-out';

  var inLine = document.createElement('div');
  inLine.className = 'oa-term-in';
  var promptEl = document.createElement('span');
  promptEl.className = 'oa-prompt';
  promptEl.textContent = PROMPT;
  var input = document.createElement('input');
  input.className = 'oa-input';
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.maxLength = 200;
  input.setAttribute('aria-label', 'Terminal input');
  var cursorEl = document.createElement('span');
  cursorEl.className = 'oa-cursor';
  cursorEl.textContent = '█';
  inLine.appendChild(promptEl);
  inLine.appendChild(input);
  inLine.appendChild(cursorEl);

  term.appendChild(bar);
  term.appendChild(out);
  term.appendChild(inLine);
  host.appendChild(term);

  var state = {hist:[], hi:0, sudo:0, busy:false, booting:false};
  var bootCancelled = false;

  function print(text, cls){
    var d = document.createElement('div');
    d.className = 'l ' + (cls || 'dim');
    d.textContent = text == null ? '' : String(text);
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
    return d;
  }
  function clearOut(){ out.innerHTML = ''; }
  function updateCursor(){ cursorEl.style.display = input.value ? 'none' : ''; }

  var ctx = {
    print: print,
    sys: function(t){ print(t, 'sys'); },
    ok: function(t){ print(t, 'ok'); },
    err: function(t){ print(t, 'err'); },
    dim: function(t){ print(t, 'dim'); },
    achv: function(t){ print(t, 'achv'); },
    clear: clearOut,
    isDrawer: !!isDrawer,
    state: state,
    nav: function(url){
      print('> REDIRECTING: ' + url, 'sys');
      setTimeout(function(){ location.href = url; }, 350);
    }
  };

  function exec(raw){
    var t = String(raw || '').trim();
    print(PROMPT + t, 'usr');
    if(!t) return;
    state.hist.push(t);
    if(state.hist.length > 80) state.hist.shift();
    state.hi = state.hist.length;
    var low = t.toLowerCase();
    var parts = low.split(/\s+/);
    var name = parts[0];
    var args = t.split(/\s+/).slice(1);
    var entry = COMMANDS[name];
    if(!entry){
      print("> COMMAND NOT FOUND: " + name + " // TYPE 'help'", 'err');
      return;
    }
    try{ entry.run(args, ctx); }
    catch(e){ print('> RUNTIME ERROR: ' + (e && e.message ? e.message : e), 'err'); }
  }

  function complete(){
    var v = input.value.toLowerCase().trim();
    if(!v) return;
    var m = Object.keys(COMMANDS).filter(function(k){ return k.indexOf(v) === 0; });
    if(m.length === 1){ input.value = m[0] + ' '; updateCursor(); }
    else if(m.length > 1){ print(m.join('   '), 'sys'); }
  }

  input.addEventListener('keydown', function(e){
    // Input guard: arrows navigate history, never the 3D shelf
    e.stopPropagation();
    if(state.booting){ e.preventDefault(); return; }
    if(e.key === 'Enter'){
      e.preventDefault();
      var v = input.value;
      input.value = '';
      updateCursor();
      exec(v);
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      if(state.hi > 0){ state.hi--; input.value = state.hist[state.hi] || ''; updateCursor(); }
    } else if(e.key === 'ArrowDown'){
      e.preventDefault();
      if(state.hi < state.hist.length - 1){ state.hi++; input.value = state.hist[state.hi] || ''; }
      else { state.hi = state.hist.length; input.value = ''; }
      updateCursor();
    } else if(e.key === 'Tab'){
      e.preventDefault();
      complete();
    } else if(e.key === 'Escape'){
      if(isDrawer) OA.toggleDrawer(false);
    } else if(e.key === 'l' && e.ctrlKey){
      e.preventDefault();
      clearOut();
    }
  });
  input.addEventListener('input', updateCursor);
  out.addEventListener('click', function(){ input.focus(); });
  inLine.addEventListener('click', function(){ input.focus(); });

  /* ---- boot ---- */
  function typeText(text, cls, done){
    var d = print('', cls);
    var i = 0;
    (function tick(){
      if(bootCancelled){ d.textContent = text; done(); return; }
      i += 1;
      d.textContent = text.slice(0, i);
      out.scrollTop = out.scrollHeight;
      if(i < text.length) setTimeout(tick, 9);
      else setTimeout(done, 60);
    })();
  }

  function runBoot(done){
    if(lsGet('oa_skip_boot', 0)){
      print(BANNER, 'sys');
      print("> TYPE 'help' FOR COMMANDS.", 'sys');
      done();
      return;
    }
    state.booting = true;
    bootCancelled = false;
    skipBtn.style.display = '';
    print(BANNER, 'sys');
    var i = 0;
    (function next(){
      if(bootCancelled){ finish(); return; }
      if(i >= BOOT_LOG.length){ finish(); return; }
      typeText(BOOT_LOG[i], i === BOOT_LOG.length - 1 ? 'ok' : 'dim', function(){
        i++;
        setTimeout(next, 70);
      });
    })();
    function finish(){
      state.booting = false;
      skipBtn.style.display = 'none';
      print('', 'dim');
      print("> TYPE 'help' FOR COMMANDS.", 'sys');
      out.scrollTop = out.scrollHeight;
      done();
    }
    skipBtn.addEventListener('click', function(){
      lsSet('oa_skip_boot', 1);
      bootCancelled = true;
    });
  }

  input.disabled = true;
  runBoot(function(){
    input.disabled = false;
    if(!isDrawer || drawerOpen) input.focus();
  });

  return {
    el: term,
    print: print,
    exec: exec,
    focus: function(){ input.focus(); },
    out: out
  };
}

/* ---------------- drawer ---------------- */
var drawerEl = null;
var drawerTerm = null;
var drawerOpen = false;

function mountDrawer(){
  if(drawerEl) return;
  injectCSS();
  drawerEl = document.createElement('div');
  drawerEl.id = 'oa-drawer';
  drawerEl.innerHTML =
    '<div class="oa-drawer-head"><span>&gt;_ TERMINAL // DRAWER MODE // PRESS ~ TO TOGGLE</span>' +
    '<span class="sp"><a class="oa-dhead-btn" href="terminal.html">[ ↗ FULL ]</a>' +
    '<button class="oa-dhead-btn" id="oa-drawer-close" type="button">[ X ]</button></span></div>' +
    '<div class="oa-drawer-body" id="oa-drawer-term"></div>';
  document.body.appendChild(drawerEl);

  document.getElementById('oa-drawer-close').addEventListener('click', function(){
    toggleDrawer(false);
  });

  var btn = document.getElementById('oa-term-btn');
  if(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      // Stop the page-level nav interceptor from hijacking the button
      e.stopPropagation();
      toggleDrawer();
    });
  }

  document.addEventListener('keydown', function(e){
    if(e.key === '~' || e.key === '`'){
      var tag = ((e.target && e.target.tagName) || '').toLowerCase();
      if(tag === 'input' || tag === 'textarea' || tag === 'select' ||
         (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      toggleDrawer();
    }
  });
}

function toggleDrawer(force){
  if(!drawerEl) mountDrawer();
  var open = (force === undefined) ? !drawerOpen : !!force;
  if(open === drawerOpen) return;
  drawerOpen = open;
  if(open && !drawerTerm){
    drawerTerm = initTerminal('oa-drawer-term', true);
  }
  drawerEl.classList.toggle('open', open);
  if(open){
    setTimeout(function(){ if(drawerTerm) drawerTerm.focus(); }, 400);
  }
}

/* ---------------- public API ---------------- */
var OA = global.OA_TERMINAL = {
  version: '1.0.0',
  init: initTerminal,
  initTerminal: initTerminal,
  mountDrawer: mountDrawer,
  toggleDrawer: toggleDrawer,
  isOpen: function(){ return drawerOpen; },
  unlock: function(k){ unlock(k, null); },
  commands: COMMANDS,
  eggs: EGGS
};

})(window);
