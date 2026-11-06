const IMAGE = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';

// The archive is franchise-first. Each record is intentionally compact so new lore can be added later.
const GAMES = {
  rdr2: {
    id:'rdr2', franchiseId:'reddead', franchiseTitle:'RED DEAD REDEMPTION', title:'RED DEAD REDEMPTION', subtitle:'The frontier remembers.', heroColor:'#8b0000', category:'Western', year:'2010',
    desc:'Outlaws, loyalty, and the slow death of the West.',
    genres:['Action','Adventure','Open World'],
    codex:[{title:'The Frontier',desc:'A dying frontier forces every outlaw to choose between loyalty, freedom, and survival.',img:IMAGE}],
    characters:[{name:'John Marston',bio:'A former outlaw chasing redemption and a quiet life.',img:IMAGE,thoughts:['I just want my family back.'],equipment:['Revolver','Lasso']}],
    timeline:[{year:'1911',event:'Redemption',desc:'John Marston is forced to hunt the gang he once called family.'}]
  },
  cyberpunk: {
    id:'cyberpunk', franchiseId:'cyberpunk', franchiseTitle:'CYBERPUNK', title:'CYBERPUNK', subtitle:'Seize the future.', heroColor:'#fcee0a', category:'Sci-Fi', year:'2020',
    desc:'Cyber-enhanced mercenaries, corporations, and the blackwall.',
    genres:['Action','RPG','Open World'],
    codex:[{title:'Night City',desc:'A megacity ruled by corporations, chrome, and the dreams of people who refuse to stay small.',img:IMAGE}],
    characters:[{name:'V',bio:'A mercenary chasing immortality in a city that eats legends.',img:IMAGE,thoughts:['Night City will chew you up.'],equipment:['Cyberdeck','Pistol']}],
    timeline:[{year:'2077',event:'The Heist',desc:'A stolen relic puts one mercenary on a collision course with Arasaka.'}]
  },
  witcher: {
    id:'witcher', franchiseId:'witcher', franchiseTitle:'THE WITCHER', title:'THE WITCHER', subtitle:'A monster hunter\'s path.', heroColor:'#2f5597', category:'Fantasy', year:'2015',
    desc:'Monster hunters, ancient magic, and destiny across a war-torn world.',
    genres:['Action','RPG','Open World'],
    codex:[{title:'The Path',desc:'Witchers travel from contract to contract, navigating monsters and the moral cost of every choice.',img:IMAGE}],
    characters:[{name:'Geralt of Rivia',bio:'A mutant monster hunter with a code and a soft spot for the lost.',img:IMAGE,thoughts:['Evil is evil.'],equipment:['Steel Sword','Silver Sword']}],
    timeline:[{year:'1272',event:'The Hunt',desc:'Geralt searches a continent at war for the child of prophecy.'}]
  },
  eldenring: {
    id:'eldenring', franchiseId:'eldenring', franchiseTitle:'ELDEN RING', title:'ELDEN RING', subtitle:'Rise, Tarnished.', heroColor:'#c9a227', category:'Dark Fantasy', year:'2022',
    desc:'A shattered order and the path to the Elden Throne.',
    genres:['Action','RPG','Open World'],
    codex:[{title:'The Shattering',desc:'A broken ring leaves a broken order, and the Tarnished return to claim what remains.',img:IMAGE}],
    characters:[{name:'The Tarnished',bio:'A forgotten warrior called back to repair a shattered world.',img:IMAGE,thoughts:['The grace guides my blade.'],equipment:['Longsword','Spectral Steed']}],
    timeline:[{year:'Era I',event:'Limgrave',desc:'The Tarnished awakens among ruins and follows the light of grace.'}]
  },
  assassinscreed: {
    id:'assassinscreed', franchiseId:'assassinscreed', franchiseTitle:'ASSASSIN\'S CREED', title:'ASSASSIN\'S CREED', subtitle:'Nothing is true, everything is permitted.', heroColor:'#c8102e', category:'Action-Adventure', year:'2007',
    desc:'A war across centuries between Assassins and Templars.',
    codex:[{title:'The Animus',desc:'A genetic memory device reveals hidden wars between those who protect free will and those who impose order.',img:IMAGE}],
    characters:[{name:'Altaïr Ibn-La\'Ahad',bio:'A legendary Assassin who redefined the Creed.',img:IMAGE,thoughts:['Nothing is true, everything is permitted.'],equipment:['Hidden Blade','Sword']}],
    timeline:[{year:'1191',event:'The Third Crusade',desc:'Altaïr\'s Creed is tested in the Holy Land.'}]
  },
  masseffect: {
    id:'masseffect', franchiseId:'masseffect', franchiseTitle:'MASS EFFECT', title:'MASS EFFECT', subtitle:'The galaxy is waiting.', heroColor:'#12b0c9', category:'Sci-Fi', year:'2007',
    desc:'A galactic alliance faces ancient forces beyond known space.',
    codex:[{title:'The Relay Network',desc:'Mass relays connect distant civilizations, allowing an uneasy galaxy to trade, fight, and survive together.',img:IMAGE}],
    characters:[{name:'Commander Shepard',bio:'A decorated soldier chosen to unite the galaxy against an impossible threat.',img:IMAGE,thoughts:['We can do this together.'],equipment:['Omni-Tool','Service Rifle']}],
    timeline:[{year:'2183',event:'The Reaper Signal',desc:'A warning from beyond the edge of the galaxy changes everything.'}]
  },
  halo: {
    id:'halo', franchiseId:'halo', franchiseTitle:'HALO', title:'HALO', subtitle:'Finish the fight.', heroColor:'#70c7d9', category:'Sci-Fi', year:'2001',
    desc:'Humanity and an ancient alliance battle for control of the rings.',
    codex:[{title:'The Forerunners',desc:'An extinct civilization left behind weapons capable of ending life across the galaxy.',img:IMAGE}],
    characters:[{name:'Master Chief',bio:'A super-soldier who stands between humanity and extinction.',img:IMAGE,thoughts:['Wake me when you need me.'],equipment:['MA5 Rifle','Energy Sword']}],
    timeline:[{year:'2552',event:'Installation 04',desc:'The discovery of a Halo ring turns a military retreat into a galactic crisis.'}]
  },
  elder_scrolls: {
    id:'elder_scrolls', franchiseId:'elderscrolls', franchiseTitle:'THE ELDER SCROLLS', title:'THE ELDER SCROLLS', subtitle:'Tamriel awaits.', heroColor:'#8d6e4a', category:'Fantasy', year:'1994',
    desc:'Ancient prophecies and living gods shape the history of Tamriel.',
    codex:[{title:'The Elder Scrolls',desc:'Prophetic artifacts record possible futures while empires rise and fall around them.',img:IMAGE}],
    characters:[{name:'The Nerevarine',bio:'A prophesied hero whose arrival disrupts the politics of Morrowind.',img:IMAGE,thoughts:['The prophecy has awakened.'],equipment:['Blade','Spellbook']}],
    timeline:[{year:'3E 427',event:'Morrowind',desc:'The Nerevarine returns to a land divided by faith and empire.'}]
  },
  godofwar: {
    id:'godofwar', franchiseId:'godofwar', franchiseTitle:'GOD OF WAR', title:'GOD OF WAR', subtitle:'The gods are listening.', heroColor:'#b45309', category:'Mythic', year:'2005',
    desc:'A fallen warrior crosses mythic realms with his son.',
    codex:[{title:'The Pantheon',desc:'Gods, monsters, and old prophecies collide as one family tries to escape its inheritance.',img:IMAGE}],
    characters:[{name:'Kratos',bio:'A former god learning to live beyond his rage.',img:IMAGE,thoughts:['Close your heart.'],equipment:['Leviathan Axe','Blades']}],
    timeline:[{year:'2018',event:'The Journey',desc:'Kratos and Atreus carry a final wish to the highest peak.'}]
  },
  horizon: {
    id:'horizon', franchiseId:'horizon', franchiseTitle:'HORIZON', title:'HORIZON', subtitle:'The old world is buried.', heroColor:'#d97706', category:'Post-Apocalyptic', year:'2017',
    desc:'A hunter explores a machine-ruled Earth to uncover its origin.',
    codex:[{title:'The Derangement',desc:'Machines once built to heal the planet now roam as dangerous predators.',img:IMAGE}],
    characters:[{name:'Aloy',bio:'A resourceful outcast searching for the truth of her origins.',img:IMAGE,thoughts:['The truth is out there.'],equipment:['Hunter Bow','Focus']}],
    timeline:[{year:'3040',event:'The Proving',desc:'Aloy leaves the Nora valley and begins a search that reaches across history.'}]
  },
  lastofus: {
    id:'lastofus', franchiseId:'lastofus', franchiseTitle:'THE LAST OF US', title:'THE LAST OF US', subtitle:'Endure and survive.', heroColor:'#55704b', category:'Post-Apocalyptic', year:'2013',
    desc:'Survivors cross a ruined America in search of a future.',
    codex:[{title:'The Cordyceps',desc:'A fungal infection transforms civilization and leaves scattered communities fighting over tomorrow.',img:IMAGE}],
    characters:[{name:'Ellie',bio:'A resilient teenager carrying a secret that could change the world.',img:IMAGE,thoughts:['After all we have been through.'],equipment:['Bow','Switchblade']}],
    timeline:[{year:'2033',event:'The Fireflies',desc:'A journey across quarantine zones becomes a test of love and sacrifice.'}]
  },
  darksouls: {
    id:'darksouls', franchiseId:'darksouls', franchiseTitle:'DARK SOULS', title:'DARK SOULS', subtitle:'Prepare to die.', heroColor:'#6b7280', category:'Dark Fantasy', year:'2011',
    desc:'Cursed undead challenge a dying age and its impossible bosses.',
    codex:[{title:'The First Flame',desc:'When the first flame fades, kingdoms cling to cycles they no longer understand.',img:IMAGE}],
    characters:[{name:'The Chosen Undead',bio:'A cursed wanderer drawn toward the fading flame.',img:IMAGE,thoughts:['Praise the sun.'],equipment:['Estoc','Estus Flask']}],
    timeline:[{year:'Age of Fire',event:'Undead Asylum',desc:'An exile escapes confinement and enters a world built on fading light.'}]
  },
  bloodborne: {
    id:'bloodborne', franchiseId:'bloodborne', franchiseTitle:'BLOODBORNE', title:'BLOODBORNE', subtitle:'Fear the old blood.', heroColor:'#8b1e3f', category:'Gothic Horror', year:'2015',
    desc:'A hunter descends into a plague-riddled city of beasts and old gods.',
    codex:[{title:'The Old Blood',desc:'A miraculous treatment promises healing, but its cure transforms the city into a nightmare.',img:IMAGE}],
    characters:[{name:'The Hunter',bio:'A stranger trapped in a night of endless hunting.',img:IMAGE,thoughts:['A hunter must hunt.'],equipment:['Saw Cleaver','Hunter Pistol']}],
    timeline:[{year:'Night of the Hunt',event:'Yharnam',desc:'The city locks its gates as the beast plague reaches its peak.'}]
  },
  sekiro: {
    id:'sekiro', franchiseId:'sekiro', franchiseTitle:'SEKIRO', title:'SEKIRO', subtitle:'Shadows die twice.', heroColor:'#9a3412', category:'Action-Adventure', year:'2019',
    desc:'A shinobi fights through a war-torn Japan to protect his master.',
    codex:[{title:'Dragon Heritage',desc:'An immortal bloodline draws warriors and clans into a struggle for endless life.',img:IMAGE}],
    characters:[{name:'Wolf',bio:'A shinobi bound by duty, loyalty, and a lost arm.',img:IMAGE,thoughts:['Hesitation is defeat.'],equipment:['Kusabimaru','Shuriken']}],
    timeline:[{year:'Sengoku',event:'Ashina Castle',desc:'Wolf returns from death to reclaim his stolen master.'}]
  },
  resident_evil: {
    id:'resident_evil', franchiseId:'residentevil', franchiseTitle:'RESIDENT EVIL', title:'RESIDENT EVIL', subtitle:'Enter the survival horror.', heroColor:'#991b1b', category:'Horror', year:'1996',
    desc:'Agents and survivors confront bio-weapons born from corporate ambition.',
    codex:[{title:'The T-Virus',desc:'A viral experiment turns human bodies into weapons and leaves a trail of contaminated cities.',img:IMAGE}],
    characters:[{name:'Jill Valentine',bio:'A S.T.A.R.S. officer who survives impossible outbreaks.',img:IMAGE,thoughts:['We have to get out of here.'],equipment:['Handgun','Lockpick']}],
    timeline:[{year:'1998',event:'Raccoon City',desc:'A quiet mountain incident becomes the beginning of a global biohazard.'}]
  },
  metalgear: {
    id:'metalgear', franchiseId:'metalgear', franchiseTitle:'METAL GEAR', title:'METAL GEAR', subtitle:'Tactical espionage action.', heroColor:'#64748b', category:'Espionage', year:'1987',
    desc:'Soldiers and spies confront weapons that can make nuclear war mobile.',
    codex:[{title:'Metal Gear',desc:'A walking nuclear platform threatens the balance of power between nations.',img:IMAGE}],
    characters:[{name:'Solid Snake',bio:'A legendary infiltrator drawn into wars created by his own legacy.',img:IMAGE,thoughts:['Kept you waiting, huh?'],equipment:['SOCOM','Cardboard Box']}],
    timeline:[{year:'1995',event:'Outer Heaven',desc:'A lone operative infiltrates a fortress hiding a weapon of mass destruction.'}]
  },
  finalfantasy: {
    id:'finalfantasy', franchiseId:'finalfantasy', franchiseTitle:'FINAL FANTASY', title:'FINAL FANTASY', subtitle:'The crystal remembers.', heroColor:'#7c3aed', category:'Fantasy', year:'1987',
    desc:'Heroes, crystals, and impossible summons shape worlds on the brink.',
    codex:[{title:'The Crystals',desc:'Crystals carry the elemental balance of their worlds and draw heroes into ancient conflicts.',img:IMAGE}],
    characters:[{name:'Cloud Strife',bio:'A guarded mercenary confronting a past that may not be his own.',img:IMAGE,thoughts:['Not interested.'],equipment:['Buster Sword','Materia']}],
    timeline:[{year:'Unknown',event:'The Calling',desc:'Four unlikely heroes are drawn toward crystals threatened by darkness.'}]
  },
  pokemon: {
    id:'pokemon', franchiseId:'pokemon', franchiseTitle:'POKÉMON', title:'POKÉMON', subtitle:'Gotta catch them all.', heroColor:'#eab308', category:'Adventure', year:'1996',
    desc:'Trainers and creatures travel together toward mastery and discovery.',
    codex:[{title:'The Pokédex',desc:'A living archive records the habits, habitats, and powers of creatures across every region.',img:IMAGE}],
    characters:[{name:'Red',bio:'A determined young trainer who climbs from Pallet Town to legend.',img:IMAGE,thoughts:['The battle starts now.'],equipment:['Poké Ball','Town Map']}],
    timeline:[{year:'1996',event:'Pallet Town',desc:'A new trainer receives a first partner and steps onto the road.'}]
  },
  zelda: {
    id:'zelda', franchiseId:'zelda', franchiseTitle:'THE LEGEND OF ZELDA', title:'THE LEGEND OF ZELDA', subtitle:'Courage begins the quest.', heroColor:'#16a34a', category:'Fantasy', year:'1986',
    desc:'A hero, a princess, and an ancient kingdom resist returning darkness.',
    codex:[{title:'The Triforce',desc:'Three sacred virtues grant power, wisdom, and courage to those strong enough to bear them.',img:IMAGE}],
    characters:[{name:'Link',bio:'A quiet hero whose courage repeatedly saves Hyrule.',img:IMAGE,thoughts:['Hyah!'],equipment:['Master Sword','Hylian Shield']}],
    timeline:[{year:'Era of Decline',event:'Hyrule',desc:'A sleeping kingdom calls on a hero to recover the fragments of its lost power.'}]
  },
  fallout: {
    id:'fallout', franchiseId:'fallout', franchiseTitle:'FALLOUT', title:'FALLOUT', subtitle:'War never changes.', heroColor:'#65a30d', category:'Post-Apocalyptic', year:'1997',
    desc:'Vault survivors navigate the ruins of a world ended by nuclear fire.',
    codex:[{title:'The Wasteland',desc:'Shelters, settlements, and old-world machines compete for meaning in a radioactive future.',img:IMAGE}],
    characters:[{name:'The Vault Dweller',bio:'A survivor forced beyond the vault into a dangerous new civilization.',img:IMAGE,thoughts:['War never changes.'],equipment:['Pip-Boy','Laser Pistol']}],
    timeline:[{year:'2161',event:'The Water Chip',desc:'A vault resident enters the wasteland to save their underground home.'}]
  },
};

function nexusImage(url) {
  try { const parsed = new URL(url); return /^https?:$/.test(parsed.protocol) ? parsed.href : IMAGE; }
  catch { return IMAGE; }
}
function nexusParagraphs(value) {
  const text = String(value || '').replace(/\\+n/g, '\n');
  const template = document.createElement('template');
  template.innerHTML = text;
  if (!template.content.querySelector('p')) template.innerHTML = '<p>' + text + '</p>';
  return template.innerHTML;
}
function nexusPlainText(value) {
  const template = document.createElement('template');
  template.innerHTML = String(value || '').replace(/\\+n/g, ' ');
  return template.content.textContent.replace(/\s+/g, ' ').trim().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

Object.values(GAMES).forEach(game => {
  game.codex.forEach(entry => { entry.img = nexusImage(entry.img); });
  game.characters.forEach(character => { character.img = nexusImage(character.img); });
});

document.addEventListener('error', event => {
  const image = event.target;
  if (image.tagName !== 'IMG') return;
  if (!image.dataset.fallback) { image.dataset.fallback = 'true'; image.src = IMAGE; }
  else image.style.visibility = 'hidden';
}, true);

function polishNexusCards(root=document) {
  const cards = [...root.querySelectorAll('.card')].filter(card => !card.dataset.entrance && card.getClientRects().length);
  cards.forEach(card => { card.dataset.entrance = 'true'; });
  if (cards.length && typeof gsap !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.from(cards, {opacity:0, y:30, stagger:.1, duration:.65, clearProps:'opacity,transform'});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  polishNexusCards();
  let frame;
  new MutationObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => polishNexusCards());
  }).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
});

function initNexusSearch() {
  const input = document.getElementById('nexus-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  const wrap = input.closest('.search-wrap');
  const render = q => {
    const term = q.trim().toLowerCase();
    if (!term) { results.classList.add('hidden'); return; }
    const matches = Object.values(GAMES).filter(game => game.franchiseTitle.toLowerCase().includes(term));
    if (!matches.length) { results.classList.add('hidden'); return; }
    results.innerHTML = matches.map(game =>
      `<button type="button" class="block w-full text-left px-4 py-2 text-sm hover:bg-white/10" data-id="${game.id}">${game.franchiseTitle}</button>`
    ).join('');
    results.classList.remove('hidden');
  };
  input.addEventListener('input', event => render(event.target.value));
  results.addEventListener('click', event => {
    const button = event.target.closest('button[data-id]');
    if (button) location.href = `universe.html?game=${encodeURIComponent(button.dataset.id)}`;
  });
  document.addEventListener('click', event => {
    if (wrap && !wrap.contains(event.target)) results.classList.add('hidden');
  });
}
document.addEventListener('DOMContentLoaded', initNexusSearch);
