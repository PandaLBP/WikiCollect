// Raretés : [nom, couleur, poids de tirage par carte].
const R=[["Commun","#c4c8cc",50.735],["Peu commune","#7ee29a",27.988],["Rare","#6cb2ff",12.439],["Holo","#8feaff",6.219],["Ultra rare","#ffae5c",1.555],["Full art","#ff7676",0.777],["Légendaire","#ffd23c",0.207],["Légendaire holo full art","#fff2a8",0.080]];const HID=new Set();
const SYM=["●","◆","★","✧","✦","✦✦","♛","♛♛♛"];
// Rareté = vues PAR MOIS de la page Wikipédia FR. Seuil minimum de chaque rareté.
// Commun < 1 000 · Peu commune 1 000 · Rare 5 000 · Holo 15 000 · Ultra rare 125 000 · Full art 250 000 · Légendaire 500 000 · Légendaire holo full art 1 000 000
const THR=[0,1000,5000,15000,125000,250000,500000,1000000];
// Forçages manuels (titre Wikipédia exact → rareté 0-7)
const OVR={
 "Paris":7,"Tokyo":7,"New York":7,"Londres":7,"Los Angeles":7,"Dubaï":7,
 "Michael Jackson":7,"Marilyn Monroe":7,"Mia Khalifa":7,"Sophie Rain":7,"Blackpink":7,"BTS":7,"Albert Einstein":7,"Stephen Hawking":7,"Cristiano Ronaldo":7,"Lionel Messi":7,
 "Oussama ben Laden":7,"Jeffrey Dahmer":7,"Charles Manson":7,
 "Attentats du 11 septembre 2001":7,"Attentats de Paris du 13 novembre 2015":7,"Attentat contre Charlie Hebdo":7,"Mort de Diana, princesse de Galles":7,
 "Naufrage du Titanic":7,"Catastrophe nucléaire de Tchernobyl":7,"Accident nucléaire de Fukushima":7,"Incendie de Notre-Dame de Paris":7,"Explosions au port de Beyrouth en 2020":7
};

/* ===== V99 : catalogue de cartes par catégorie (titres Wikipédia FR + rareté forcée) ===== */
let CG="";
const nz2=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g," ").trim().toLowerCase();
/* const CATALOG= → voir data.js */
/* const CATGROUPS= → voir data.js */
/* V108 — chaque grand univers possède des cartes sur toute l'échelle de rareté.
   Les noms ci-dessous servent d'ancrages de notoriété ; le moteur conserve les overrides
   individuels et les cartes Wikipédia sans image ne sont jamais ajoutées. */
const TIER_ANCHORS={
 adult:{
  7:"Mia Khalifa|Sophie Rain|Sweetie Fox",
  6:"Sasha Grey|Jenna Jameson|Sunny Leone|Lana Rhoades",
  5:"Angela White|Riley Reid|Lisa Ann|Stormy Daniels",
  4:"Abella Danger|Kendra Lust|Alexis Texas",
  3:"Mia Malkova|Dani Daniels|Tori Black",
  2:"Bree Olson|Sophie Dee|Nikki Benz",
  1:"Teagan Presley|Lexi Belle"
 },
 music:{
  7:"BTS|Blackpink|Michael Jackson|Taylor Swift|The Beatles|Queen (groupe)",
  6:"TWICE (groupe)|Stray Kids|NewJeans|Ariana Grande|Billie Eilish|The Weeknd",
  5:"EXO (groupe)|Seventeen (groupe)|Red Velvet|Aespa|Dua Lipa|Olivia Rodrigo",
  4:"Itzy|Ateez|Super Junior|Katy Perry|Doja Cat|Nicki Minaj",
  3:"Mylène Farmer|Stromae|Soprano|Vitaa|Gims|Christine and the Queens"
 },
 foot:{
  7:"Kylian Mbappé|Lionel Messi|Cristiano Ronaldo|Pelé|Diego Maradona|Zinédine Zidane",
  6:"Karim Benzema|Neymar|Erling Haaland|Robert Lewandowski|Ronaldinho",
  5:"Antoine Griezmann|Luka Modrić|Thierry Henry|Zlatan Ibrahimović",
  4:"Olivier Giroud|Ousmane Dembélé|Rayan Cherki|Pedri|Gavi"
 }
};
const OVRN={};Object.keys(OVR).forEach(t=>OVRN[nz2(t)]=OVR[t]);
const VIPT=[],VIPR={},ADULT=new Set();
(()=>{const seen=new Set(),gs=Object.keys(CATALOG);let n=0;
 for(const t of [7,6,5,4,3,2,1,0]){const L=gs.map(g=>[g,(CATALOG[g]["t"+t]||"").split("|").filter(Boolean)]);
  for(let j=0;L.some(x=>j<x[1].length);j++)L.forEach(([g,a])=>{const x=a[j];if(!x)return;const k=nz2(x);if(!k||seen.has(k))return;seen.add(k);VIPR[k]=OVRN[k]??t;VIPT.push({t:x,r:VIPR[k],g,o:1e6-(n++)});if(g==="adult")ADULT.add(k)})}})();
/* Ancrages de catégorie : ils garantissent qu'une catégorie ne se retrouve pas bloquée dans une seule rareté. */
Object.entries(TIER_ANCHORS).forEach(([g,tiers])=>Object.entries(tiers).forEach(([rr,names])=>String(names).split("|").forEach(x=>{const k=nz2(x);if(!k)return;VIPR[k]=OVRN[k]??+rr;if(!VIPT.some(v=>nz2(v.t)===k))VIPT.push({t:x,r:OVRN[k]??+rr,g,o:900000-(VIPT.length)});})));
function withVip(L){const idx=new Map();L.forEach(e=>{if(e.t){e.t=canonicalTitle(e.t);idx.set(nz2(e.t),e)}if(e.cr&&!e.g)e.g="creator";if(e.src==="film"&&!e.g)e.g="film"});
 VIPT.forEach(v=>{const e=idx.get(nz2(v.t));if(e){if(!e.cr&&e.src!=="film"){e.r=v.r;e.g=v.g;e.o=v.o}}else{const x={t:v.t,r:v.r,v:0,src:"wiki",g:v.g,o:v.o};L.push(x);idx.set(nz2(v.t),x)}});
 return L}
const catList=g=>{const out=[];((CATGROUPS[g]||{}).c||[]).forEach(c=>{const m=/\{(\d+)-(\d+)\}/.exec(c);if(m){for(let y=+m[2];y>=+m[1];y--)out.push(c.replace(m[0],y))}else out.push(c)});return out};
const groupSelectHTML=()=>`<select id="cg" style="background:var(--sf2);border:1px solid #3a2f4d;color:var(--fg);border-radius:9px;padding:0 12px;font:inherit"><option value="">Toutes les catégories</option>${Object.entries(CATGROUPS).map(([k,v])=>`<option value="${k}" ${CG==k?"selected":""}>${v.l}</option>`).join("")}</select>`;

// Migration des anciennes sauvegardes : anciens index → 8 raretés actuelles.
const OLD_TO_NEW={0:0,1:1,2:2,3:3,4:3,5:4,6:5,7:6,8:6,9:7,10:7};
// V88/V89 utilisent déjà 8 raretés indexées 0→7 : ne remappe plus une sauvegarde déjà migrée.
const CURRENT_RARITY_SCHEMAS=new Set(["v88","v89","v90","v91","v92"]);
const NEEDS_RARITY_MIGRATION=!CURRENT_RARITY_SCHEMAS.has(localStorage.getItem("wc_rarity_schema"));
const MR=r=>NEEDS_RARITY_MIGRATION?(OLD_TO_NEW[+r]??Math.max(0,Math.min(7,+r||0))):Math.max(0,Math.min(7,+r||0));
/* V130 : une seule rareté officielle par article (forçages OVR / liste VIP), partout dans le jeu. */
function forcedRarity(t){const k=nz2(t),f=(OVR[t]!=null?OVR[t]:(OVRN[k]!=null?OVRN[k]:VIPR[k]));return f==null?null:+f}
// Créateurs : nom|y(outube)/t(witch)|identifiant|rareté (selon leur popularité)
/* const PHOTO= → voir data.js */
/* const PHOTO_OVERRIDES= → voir data.js */
const CRE="Squeezie|y|squeezie|10,Cyprien|y|cyprien|8,Norman|y|normanfaitdesvideos|8,Michou|y|michou|8,Inoxtag|y|inoxtag|8,Amixem|y|amixem|8,Tibo InShape|y|tiboinshape|8,Mister V|y|misterv|7,Joyca|y|joyca|7,Léna Situations|y|lenasituations|8,EnjoyPhoenix|y|enjoyphoenix|6,Natoo|y|natoo|6,Seb la Frite|y|seblafrite|5,McFly et Carlito|y|LeFatShow|8,Hugo Décrypte|y|hugodecrypte|8,Underscore_|y|underscore_|6,Dr Nozman|y|drnozman|5,Fabien Olicard|y|fabienolicard|5,Nota Bene|y|notabenemovies|5,Mastu|y|mastu|6,Wankil Studio|y|wankilstudio|7,Amine|y|amineoff|5,Gotaga|t|gotaga|8,ZeratoR|t|zerator|8,Kameto|t|kamet0|8,Domingo|t|domingo|8,Locklear|t|locklear|7,Ponce|t|ponce|7,Sardoche|t|sardoche|7,Anyme023|t|anyme023|6,Hapsolutelly|t|hapsolutelly/hapsolutely|6,Chelxie|t|chelxie|6,Doigby|t|doigby|5,Maghla|t|maghla|5,Mynthos|t|mynthos|5,Rebeudeter|t|rebeudeter|6,Ultia|t|ultia|6,Baghera Jones|t|bagherajones|6,Jiraya|t|jiraya|6,Nikof|t|nikof|5,MisterMV|t|mistermv|6,Byilhan|t|byilhan|5,MrBeast|y|mrbeast|10,PewDiePie|y|pewdiepie|10,Markiplier|y|markiplier|8,Ninja|t|ninja|8,Pokimane|t|pokimane|8,xQc|t|xqc|8,Kai Cenat|t|kaicenat|8,Ibai|t|ibai|8,Shroud|t|shroud|8,Dream|y|dream|8,TommyInnit|y|tommyinnit|8,Valkyrae|t|valkyrae|7,Ludwig|t|ludwig|8,Asmongold|t|asmongold|8,Sykkuno|t|sykkuno|7,iShowSpeed|y|ishowspeed|8,KSI|y|ksi|8,Logan Paul|y|loganpaul|8,Mark Rober|y|markrober|8,Dude Perfect|y|dudeperfect|8,Emma Chamberlain|y|emmachamberlain|7,TimTheTatman|t|timthetatman|7,Tfue|t|tfue|7,Dr Disrespect|t|drdisrespect|7,Kurzgesagt|y|kurzgesagt|8,Vsauce|y|vsauce|8,Linus Tech Tips|y|linustechtips|7,MKBHD|y|mkbhd|8,AmineMaTue|t|aminematue|8,PFut|t|pfut|7,Ravus|t|ravus|5,Snakou|t|snakou|5,Xari|t|xari|6,Jeel|t|jeel|5,Deujna|t|deujna|5,Julia Bayonetta|t|juliabayonetta|4,Little Big Whale|t|littlebigwhale|6,Lebouseuh|t|lebouseuh|4,Alderiate|t|alderiate|6,MoMaN|t|moman|5,Etoiles|t|etoiles|5,Ninjaxx|y|ninjaxx|5,LeStream|t|lestream|4,Skyyart|t|skyyart|5,Rivenzi|t|rivenzi|5,JL Tomy|t|jltomy|5,Chowh1|t|chowh1|5".split(",").map((s,i)=>{const [n,p,hd0,r]=s.split("|"),hd=hd0.split("/")[0],yt=p=="y",av=(pl,k)=>`https://unavatar.io/${pl}/${encodeURIComponent(k)}?fallback=false`,imgs=[...hd0.split("/").map(k=>av(yt?"youtube":"twitch",k)),av(yt?"twitch":"youtube",hd),av("x",hd),av("instagram",hd)];return{id:"c"+i+"-"+MR(r),pid:"c"+i,t:n,plat:yt?"YouTube":"Twitch",d:`${yt?"YouTubeur":"Streamer"} — @${hd} sur ${yt?"YouTube":"Twitch"}.`,img:PHOTO[n]||imgs[0],imgs:PHOTO[n]?[PHOTO[n]]:imgs,realImg:PHOTO[n],lock:PHOTO[n]?1:0,r:MR(r),url:(yt?"https://www.youtube.com/@":"https://www.twitch.tv/")+hd,src:"cr"}}).filter(c=>!["amine","zbb"].includes(String(c.t||"").trim().toLowerCase()));
// V86 : pool Légendaire holo full art élargi avec drames historiques, catastrophes, attentats, disparitions, scandales connus, grandes villes, personnalités historiques, culture, sport et monuments.

const CRE_LEGENDARY=new Set(["Squeezie","Cyprien","Norman","Michou","Inoxtag","Amixem","Tibo InShape","Mister V","Joyca","Léna Situations","McFly et Carlito","Hugo Décrypte","Gotaga","ZeratoR","Domingo","MrBeast","PewDiePie","Markiplier","Ninja","Kai Cenat","Ibai","KSI","iShowSpeed","MKBHD"]);
CRE.forEach(c=>{if(CRE_LEGENDARY.has(c.t)){c.r=7;c.id=c.pid+"-7"}});
try{JSON.parse(localStorage.getItem("wc_cre")||"[]").forEach((l,i)=>{const [n,p,hd,r]=l,yt=p=="y",av=(pl,k)=>`https://unavatar.io/${pl}/${encodeURIComponent(k)}?fallback=false`,imgs=[av(yt?"youtube":"twitch",hd),av(yt?"twitch":"youtube",hd),av("x",hd),av("instagram",hd)];
 if(!["zbb","amine"].includes(n.toLowerCase())&&!CRE.some(c=>c.t.toLowerCase()==n.toLowerCase()))CRE.push({id:"x"+i+"-"+MR(r),pid:"x"+i,t:n,plat:yt?"YouTube":"Twitch",d:`${yt?"YouTubeur":"Streamer"} — @${hd} sur ${yt?"YouTube":"Twitch"}.`,img:imgs[0],imgs,r:MR(r),url:(yt?"https://www.youtube.com/@":"https://www.twitch.tv/")+hd,src:"cr"})})}catch(e){wcDbg(e)}
const CD=10*1000,MAXB=10,PS=50,BOOSTER_COOLDOWN=10*60*1000;
let boosterCooldowns=Array(MAXB).fill(0);
try{const bc=JSON.parse(localStorage.getItem("wc_booster_cooldowns_v57")||"null");if(Array.isArray(bc)&&bc.length===MAXB)boosterCooldowns=bc.map(x=>Math.max(0,+x||0))}catch(e){wcDbg(e)}
const boosterReady=i=>i>=0&&i<MAXB&&(boosterCooldowns[i]||0)<=Date.now();
const boosterLeft=i=>Math.max(0,(boosterCooldowns[i]||0)-Date.now());
const saveBoosterCooldowns=()=>{try{localStorage.setItem("wc_booster_cooldowns_v57",JSON.stringify(boosterCooldowns))}catch(e){wcDbg(e)}};
const h=n=>{n=Math.imul(n^n>>>15,2246822507);n=Math.imul(n^n>>>13,3266489909);return((n^n>>>16)>>>0)/4294967296};
const WT=R.reduce((s,x)=>s+x[2],0);
const pick=r=>{let t=WT*r,i=0;for(;i<R.length-1&&(t-=R[i][2])>=0;i++);return i};
const rarOf=v=>{let r=0;THR.forEach((t,i)=>{if(v>=t)r=i});return r};
const SEX=/sexe|sexuel|sexualit|vagin|vulve|clitoris|p[ée]nis|testicul|anus|sodomie|fellation|cunnilingus|masturbation|[ée]jacul|orgasme|[ée]rection|kama|porno|[ée]rotique|prostitu|bdsm|f[ée]tichis|\bseins?\b|fesses|godemich|libertin|[ée]changisme|position sexuelle|\b69\b/i;
const DRAMA=/attentat|g[ée]nocide|massacre|shoah|holocauste|tuerie|assassinat|terroris|catastrophe|naufrage|crash|s[ée]isme|tsunami|camp de concentration|goulag|bombardement|11 septembre|guerre mondiale|pand[ée]mie|peste|famine|tueur en s[ée]rie|disparition|effondrement|incendie|mar[ée]e noire|accident/i;
const boost=(t,r)=>DRAMA.test(t)?Math.min(7,r+3):r;
const EXTRA=["Attentats du 11 septembre 2001","Attentats de Paris du 13 novembre 2015","Attentats de janvier 2015 en France","Attentat contre Charlie Hebdo","Attentat de Nice du 14 juillet 2016","Attentats de Madrid du 11 mars 2004","Attentats de Londres du 7 juillet 2005","Attentats de Bruxelles de 2016","Attentats de Bombay de 2008","Attentat du marathon de Boston","Attentat d'Oklahoma City","Attentats de Bali de 2002","Attentats de Casablanca de 2003","Attentats d'Oslo et d'Utøya","Attentat de Christchurch","Prise d'otages de Beslan","Attentat de Lockerbie","Shoah","Génocide arménien","Génocide des Tutsi au Rwanda","Naufrage du Titanic","Catastrophe nucléaire de Tchernobyl","Accident nucléaire de Fukushima","Tsunami de 2004 dans l'océan Indien","Séisme d'Haïti de 2010","Séisme et tsunami de Tōhoku de 2011","Ouragan Katrina","Catastrophe de Bhopal","Catastrophe de Seveso","Explosion de l'usine AZF","Marée noire de l'Exxon Valdez","Marée noire du Prestige","Marée noire de l'Erika","Catastrophe du Hindenburg","Accident du Concorde","Naufrage de l'Estonia","Vol Air France 447","Vol Malaysia Airlines 370","Vol Malaysia Airlines 17","Accident de la navette spatiale Challenger","Accident de la navette spatiale Columbia","Catastrophe de Deepwater Horizon","Effondrement du Rana Plaza","Incendie de la tour Grenfell","Incendie de Notre-Dame de Paris","Catastrophe de Hillsborough","Catastrophe du Heysel","Effondrement du Sampoong","Bombardements atomiques de Hiroshima et Nagasaki","Première Guerre mondiale","Seconde Guerre mondiale","Peste noire","Grippe espagnole","Pandémie de Covid-19","Mort de Diana, princesse de Galles","Disparition de Maddie McCann","Affaire du petit Grégory","Affaire Dutroux","Affaire Outreau","Affaire Dupont de Ligonnès","Affaire JonBenét Ramsey","Explosions au port de Beyrouth en 2020","Séisme en Turquie et en Syrie de 2023","Cyclone Nargis","Typhon Haiyan","Éruption de la montagne Pelée en 1902","Séisme de Tangshan de 1976","Séisme de Valdivia de 1960","Catastrophe ferroviaire de Brétigny-sur-Orge","Accident ferroviaire de Lac-Mégantic","Incendie du Bazar de la Charité","New York","Tokyo","Londres","Los Angeles","Dubaï","Marseille","Lyon","Madrid","Barcelone","Rome","Las Vegas","Hong Kong","Singapour","Istanbul","Rio de Janeiro","Mexico","Buenos Aires","Sydney","Berlin","Oussama ben Laden","Jeffrey Dahmer","Ted Bundy","Charles Manson","John Wayne Gacy","Zodiaque (tueur en série)","Jack l'Éventreur","Aileen Wuornos","Michael Jackson","Beyoncé","Rihanna","Eminem","Leonardo DiCaprio","Johnny Hallyday","Bruce Lee","Marilyn Monroe","Freddie Mercury","Albert Einstein","Stephen Hawking","Neil Armstrong","Cristiano Ronaldo","Lionel Messi","Diego Maradona","Tour Eiffel","Statue de la Liberté","Burj Khalifa","Mont Everest","Grand Canyon"];
const $=id=>document.getElementById(id),main=$("main"),store={};
CRE.forEach(c=>store[c.id]=c);
const BASE="https://fr.wikipedia.org/w/api.php?format=json&origin=*&action=query&";
const API=BASE+"prop=pageimages|description|pageviews&piprop=thumbnail&pithumbsize=400&pilimit=50&pvipdays=30&";
let SO="rare",tab=0,q="",fr=new Set(),page=1,cursors=["r:0"],totalArticles=null,timer=null,rawTot=0,imgTot=0,topCache=null;
/* V92 : remise à zéro complète du compte demandée par le joueur. Les données du catalogue et les préférences du site restent intactes. */
const ACCOUNT_RESET_V92="wc_account_reset_v92";
let ACCOUNT_WAS_RESET_V92=false;
try{
 if(false){
  ["wc_col","wc_money","wc_stock","wc_t0","wc_mk2","wc_mk3","wc_dly","wc_daily2","wc_jackpot","wc_jhist","wc_ach","wc_stats","wc_col_ui","wc_booster_cooldowns_v57","wc_card_case_inv","wc_fusion_v45_reset","wc_money_reset_v42","wc_money_bonus_v55","wc_reset_a"].forEach(k=>localStorage.removeItem(k));
  ACCOUNT_WAS_RESET_V92=true;
  localStorage.setItem(ACCOUNT_RESET_V92,"1");
  localStorage.setItem("wc_money","50");
 }
}catch(e){wcDbg(e)}
/* V105 : nouveau reset explicite — collection + succès + statistiques remises à zéro.
   On utilise une nouvelle clé pour forcer le reset même si une ancienne version avait déjà marqué le compte comme réinitialisé. */
const ACCOUNT_RESET_V105="wc_account_reset_v105_collection_success_stats";
try{
  if(false){
    ["wc_col","wc_ach","wc_col_ui","wc_stats"].forEach(k=>localStorage.removeItem(k));
    localStorage.setItem(ACCOUNT_RESET_V105,"1");
  }
}catch(e){wcDbg(e)}
let col={},stock=MAXB,t0=0,money=50;
let WCJ=0,WCJL=[];
try{WCJ=+(localStorage.getItem("wc_jackpot")||"10000");WCJL=JSON.parse(localStorage.getItem("wc_jhist")||"[]")}catch(e){wcDbg(e)}
const saveJ=()=>{try{localStorage.setItem("wc_jackpot",String(Math.max(10000,Math.floor(WCJ))));localStorage.setItem("wc_jhist",JSON.stringify(WCJL.slice(0,12)))}catch(e){wcDbg(e)}};
let WCQ=null;
const dayKey=()=>new Date().toISOString().slice(0,10);
const DAILY=[
 {id:"open",name:"Ouvrir 2 boosters",goal:2,reward:75},
 {id:"rare",name:"Obtenir 1 carte Rare ou mieux",goal:1,reward:100},
 {id:"casino",name:"Jouer 4 parties au Casino",goal:4,reward:150},
 {id:"open5",name:"Ouvrir 5 boosters",goal:5,reward:100},
 {id:"holo",name:"Obtenir 1 carte Holo ou mieux",goal:1,reward:125},
 {id:"fusion",name:"Réussir 1 fusion",goal:1,reward:150},
 {id:"creator",name:"Obtenir 1 carte de créateur",goal:1,reward:100},
 {id:"dupe",name:"Obtenir 1 doublon",goal:1,reward:100},
 {id:"case",name:"Ouvrir 1 Card Case",goal:1,reward:125}

,{id:"daily_extra_01",t:"Collectionneur",d:"Ajoute 3 cartes à ta collection.",goal:3,reward:45}
,{id:"daily_extra_02",t:"Explorateur",d:"Découvre 2 cartes avec «  ».",goal:2,reward:35}
,{id:"daily_extra_03",t:"Curieux",d:"Consulte 5 cartes différentes dans Toutes les cartes.",goal:5,reward:40}
,{id:"daily_extra_04",t:"Chasseur de rareté",d:"Obtiens 1 carte Rare ou supérieure.",goal:1,reward:60}
,{id:"daily_extra_05",t:"Passionné",d:"Ouvre 2 boosters aujourd’hui.",goal:2,reward:50}
,{id:"daily_extra_06",t:"Encyclopédiste",d:"Consulte 10 cartes Wikipédia différentes.",goal:10,reward:55}

,{id:"daily_extra_07",t:"Chasseur de doublons",d:"Obtiens 2 exemplaires d’une même carte.",goal:2,reward:50}
,{id:"daily_extra_08",t:"Collection parfaite",d:"Ajoute 5 cartes différentes à ta collection.",goal:5,reward:65}
,{id:"daily_extra_09",t:"Petit investisseur",d:"Dépense 500 WikiCo dans la boutique.",goal:500,reward:75}
];
function loadDaily(){
 try{
  const d=JSON.parse(localStorage.getItem("wc_daily2")||"null");
  WCQ=d&&d.day==dayKey()?d:{day:dayKey(),p:{open:0,rare:0,casino:0},c:{}};
 }catch(e){WCQ={day:dayKey(),p:{open:0,rare:0,casino:0},c:{}}}
 WCQ.p=WCQ.p||{open:0,rare:0,casino:0};WCQ.c=WCQ.c||{};
 DAILY.forEach(m=>{if(WCQ.p[m.id]==null)WCQ.p[m.id]=0});
 try{localStorage.setItem("wc_daily2",JSON.stringify(WCQ))}catch(e){wcDbg(e)}
 return WCQ
}
function bumpDaily(id,n=1){try{wcCount(id,n)}catch(e){wcDbg(e)}loadDaily();WCQ.p[id]=Math.min(DAILY.find(x=>x.id==id).goal,WCQ.p[id]+n);try{localStorage.setItem("wc_daily2",JSON.stringify(WCQ))}catch(e){wcDbg(e)}}
function todayEvent(){
 const E=[
  ["📚 Journée Encyclopédie","Les cartes Wikipédia communes et peu communes sont mises à l'honneur.","Complète ta collection avec les petites raretés."],
  ["⚽ Journée Football","Les joueurs et clubs sont au centre de la vitrine.","Ouvre des boosters et surveille les enchères football."],
  ["💎 Marché Premium","Les cartes rares attirent davantage l'attention des collectionneurs.","Regarde les enchères avant de vendre."],
  ["🎴 Journée Collection","Les doublons sont à l'honneur.","Utilise la fusion pour faire monter des variantes."]
 ];
 const i=Math.floor(Date.now()/864e5)%E.length;return E[i]
}
function profileStats(){
 const A=Object.values(col),total=A.reduce((s,c)=>s+c.n,0),value=A.reduce((s,c)=>s+fair(c)*c.n,0);
 const best=A.length?Math.max(...A.map(c=>c.r)):-1, xp=total*10+Math.floor(value/100),lvl=Math.max(1,1+Math.floor(xp/250));
 const pct=Math.min(100,Math.floor((xp%250)/2.5));
 return {A,total,value,best,xp,lvl,pct}
}
const rarityName=r=>r>=0&&r<R.length?R[r][0]:"—";
function eventPage(){
 const ev=todayEvent();
 const remain=86400000-(Date.now()%86400000);
 main.innerHTML=`<h2>🔥 Événement du jour</h2>
  <div class="sub">Un thème temporaire qui change automatiquement chaque jour.</div>
  <div class="dbox eventbox" style="max-width:920px">
   <div class="mut" style="font-size:11px;font-weight:800;letter-spacing:.08em">ÉVÉNEMENT ACTIF</div>
   <h1 style="margin:10px 0 8px">${ev[0]}</h1>
   <p class="mut" style="font-size:15px;line-height:1.6">${ev[1]}</p>
   <div style="margin-top:18px;padding:15px 16px;background:#171326;border:1px solid #372b4b;border-radius:12px;font-weight:900;color:#e7d7ff">${ev[2]}</div>
   <div class="row" style="margin-top:16px"><span>Rotation</span><span>Dans ${fmt(remain)}</span></div>
  </div>
  <div class="dbox" style="max-width:920px;margin-top:16px">
   <h3 style="margin-top:0">💡 Ce que ça change</h3>
   <div class="mut" style="font-size:13px;line-height:1.65">L'événement sert de thème du jour : certaines cartes, le marché ou tes objectifs peuvent être mis en avant sans modifier définitivement les règles du jeu.</div>
  </div>`;
}

/* ===== Points d'extension =====
   Les modules complémentaires (extras.js) ajoutent leurs blocs APRÈS l'affichage de base de ces pages, dans l'ordre d'enregistrement,
   au lieu de remplacer les fonctions par-dessus. */
const AFTER={collection:[],profile:[]};
const runAfter=k=>AFTER[k].forEach(f=>{try{f()}catch(e){wcDbg(e)}});
function collection(){main.classList.remove("wc-no-scroll-page");collectionBase();runAfter("collection")}
function profilePage(){main.classList.remove("wc-no-scroll-page");profilePageBase();runAfter("profile")}
function profilePageBase(){
 const s=profileStats();
 const best=rarityName(s.best);
 const top=Object.values(col).sort((a,b)=>fair(b)*b.n-fair(a)*a.n).slice(0,10);
 main.innerHTML=`<h2>👤 Profil</h2>
  <div class="sub">Ta progression de collectionneur et les statistiques de ta collection.</div>
  <div class="dbox" style="max-width:1000px">
   <div class="dhero">
    <div><div class="mut" style="font-size:11px;font-weight:800;letter-spacing:.08em">COLLECTIONNEUR</div>
    <h1 style="margin:6px 0">Niveau ${s.lvl}</h1>
    <div class="mut">${s.total.toLocaleString("fr-FR")} cartes possédées</div></div>
    <div style="text-align:right"><div class="mut" style="font-size:11px">Valeur estimée</div>
    <b style="font-size:28px;color:#ffd23c">🪙 ${s.value.toLocaleString("fr-FR")}</b></div>
   </div>
   <div class="dbar" style="margin:14px 0 8px"><i style="width:${s.pct}%"></i></div>
   <div class="mut" style="font-size:12px">${s.pct}% vers le niveau suivant</div>
  </div>
  <div class="dstats" style="max-width:1000px;margin-top:16px">
   <div class="dstat"><b>${s.A.length}</b><span>Cartes différentes</span></div>
   <div class="dstat"><b>${s.A.filter(c=>c.n>1).length}</b><span>Avec doublons</span></div>
   <div class="dstat"><b>${s.A.filter(c=>c.r>=2).length}</b><span>Rare ou mieux</span></div>
   <div class="dstat"><b style="color:${s.best>=0?R[s.best][1]:"var(--fg)"}">${best}</b><span>Meilleure rareté</span></div>
  </div>
  <div class="dbox" style="max-width:1000px;margin-top:16px">
   <h3 style="margin-top:0">💎 Cartes les plus valorisées</h3>
   <div class="mgrid">${top.length?top.map(c=>`<div class="mission"><b>${c.t}</b><small>${rarityName(c.r)} · ×${c.n}</small><div style="margin-top:8px;font-weight:900;color:#ffd23c">🪙 ${(fair(c)*c.n).toLocaleString("fr-FR")}</div></div>`).join(""):'<div class="mut">Ta collection est encore vide.</div>'}</div>
  </div>`;
}

try{col=JSON.parse(localStorage.getItem("wc_col")||"{}");const s=localStorage.getItem("wc_stock");if(s!==null){stock=+s;t0=+localStorage.getItem("wc_t0")||0}const m=localStorage.getItem("wc_money");if(m!==null)money=+m}catch(e){wcDbg(e)}
/* V105 : garde-fou — au premier lancement de cette version, aucune carte/succès/statistique ne doit survivre. */
if(false){
  try{
    col={};
    localStorage.removeItem("wc_col");
    localStorage.removeItem("wc_ach");
    localStorage.removeItem("wc_stats");
    localStorage.removeItem("wc_col_ui");
    localStorage.setItem("ACCOUNT_RESET_V105_GUARD","1");
  }catch(e){wcDbg(e)}
}
let SAVEFAIL=false,IDBONLY=false;try{IDBONLY=localStorage.getItem("wc_col_idb")==="1"}catch(e){wcDbg(e)}
let _mt=0,_sw=false;
/* V142 : si le navigateur (≈ 5 Mo) est plein, la collection vit dans IndexedDB (des centaines de Mo) — plus de limite pratique. */
function warnFull(){if(!SAVEFAIL){SAVEFAIL=true;try{toast("⚠️ Stockage du navigateur plein et copie de secours impossible : exporte ta sauvegarde (Profil → Sauvegarde) et libère de la place.")}catch(x){wcDbg(x)}}}
function toIdb(){if(!window.__colChecked)return void setTimeout(toIdb,300);if(_sw||!window.WCSAVE)return;_sw=true;window.WCSAVE.put("col",{t:Date.now(),ls:false,col}).then(ok=>{_sw=false;if(!ok){warnFull();return}try{localStorage.setItem("wc_col_idb","1");localStorage.removeItem("wc_col")}catch(e){wcDbg(e)}const first=!IDBONLY;IDBONLY=true;SAVEFAIL=false;if(first){try{toast("💾 Collection déplacée dans la mémoire étendue du navigateur : plus de limite de 5 Mo.")}catch(x){wcDbg(x)}}})}
function mirrorCol(){clearTimeout(_mt);_mt=setTimeout(()=>{if(!window.__colChecked)return mirrorCol();try{if(window.WCSAVE)window.WCSAVE.put("col",{t:Date.now(),ls:!(SAVEFAIL||IDBONLY),col}).then(ok=>{if(!ok&&IDBONLY)warnFull()})}catch(e){wcDbg(e)}},IDBONLY?150:500)}
try{if(window.WCSAVE)window.WCSAVE.colJson=()=>JSON.stringify(col,function(k,v){if(k==="d"&&this&&(this.src==="wiki"||this.src===undefined))return undefined;return typeof v=="string"&&v.startsWith("data:image/jpeg")?undefined:v})}catch(e){wcDbg(e)}
/* V141 : le stockage du navigateur (≈ 5 Mo) était saturé. Les descriptions des cartes Wikipédia ne sont plus sauvegardées (elles se rechargent à l'ouverture de la fiche), les gros caches (classement, films) vivent dans IndexedDB, et le jeu libère lui-même de la place si besoin. */
function freeSpace(){try{["wc_rank6","wc_rank7","wc_films_1000_v1","wc_wish_log"].forEach(k=>localStorage.removeItem(k))}catch(e){wcDbg(e)}try{saveMk()}catch(e){wcDbg(e)}}
try{["wc_rank6","wc_rank7","wc_films_1000_v1"].forEach(k=>localStorage.removeItem(k))}catch(e){wcDbg(e)}
const save=()=>{try{try{stampRecent()}catch(e){wcDbg(e)}localStorage.setItem("wc_rarity_schema","v92");
 const strip=(k,v)=>typeof v=="string"&&v.startsWith("data:image/jpeg")?undefined:v,slim=(k,v)=>k==="d"?undefined:strip(k,v);
 const compact=function(k,v){if(k==="d"&&this&&(this.src==="wiki"||this.src===undefined))return undefined;return strip(k,v)};
 const put=rep=>{localStorage.setItem("wc_col",JSON.stringify(col,rep));localStorage.setItem("wc_col_t",String(Date.now()));SAVEFAIL=false};
 if(IDBONLY){localStorage.setItem("wc_col_t",String(Date.now()))}
 else try{put(compact)}
 catch(e){try{freeSpace();put(compact)}catch(e2){try{put(slim)}catch(e3){toIdb()}}}
 localStorage.setItem("wc_stock",stock);localStorage.setItem("wc_t0",t0);localStorage.setItem("wc_money",money);saveBoosterCooldowns()}catch(e){wcDbg(e)}try{mirrorCol()}catch(e){wcDbg(e)}};
// V87 : Kameto canonique = créateur Twitch @kamet0 avec sa vraie photo de profil.
// L'ancienne carte Wikipédia « Kameto » est la mauvaise variante pour ce jeu : on la retire du catalogue et de la collection,
// puis on conserve/restaure uniquement la carte créateur correcte.
try{
 const before=Object.keys(col).length;
 Object.keys(col).forEach(k=>{const c=col[k]; if(c && String(c.t||'').trim().toLowerCase()==='kameto' && c.src!=='cr') delete col[k]});
 if(Object.keys(col).length!==before)save();
}catch(e){wcDbg(e)}
// remet les bonnes photos / raretés sur les créateurs déjà possédés et supprime les doublons
const DUPLICATE_TITLES=new Set(["norman thavaud"]);
const EXCLUDED_TITLES=new Set(["lizzie","catherine ringer","traci lords"]);
const isExcludedTitle=t=>EXCLUDED_TITLES.has(String(t||"").trim().toLowerCase());
const isRemovedTitle=t=>isExcludedTitle(t)||DUPLICATE_TITLES.has(String(t||"").trim().toLowerCase());
// V86 : force le recalcul du classement pour faire apparaître les nouvelles cartes sélectionnées.
try{if(localStorage.getItem("wc_v86_rank_refresh")!=="1"){localStorage.removeItem("wc_rank7");localStorage.removeItem("wc_rank6");localStorage.setItem("wc_v86_rank_refresh","1")}}catch(e){wcDbg(e)}
function hyd(){const N={};Object.values(col).forEach(c=>{
 if(c&&String(c.t||"").trim().toLowerCase()==="sophie reine")c.t="Sophie Rain";
 if(c.src=="cr"){const k=CRE.find(x=>x.pid==c.pid);if(k){c.r=k.r;c.id=k.id;c.url=k.url;if(k.lock){c.img=k.img;c.imgs=k.imgs;c.realImg=k.realImg}}}
 else { const nr=MR(c.r); if(nr!==c.r){c.r=nr;c.id=String(c.id).replace(/-\d+$/,"-"+nr)} }
 if(c.src!=="cr"&&c.src!=="film"){const f=forcedRarity(c.t);if(f!=null&&f!==+c.r){c.r=f;if(/^\d+-\d+$/.test(String(c.id)))c.id=String(c.id).replace(/-\d+$/,"-"+f)}}
 if(DUPLICATE_TITLES.has(String(c.t||"").trim().toLowerCase()))return;
 if(N[c.id])N[c.id].n+=c.n;else N[c.id]=c});col=N}
hyd();
// V81 : purge les titres explicitement retirés du catalogue.
try{
 const before=Object.keys(col).length;
 Object.keys(col).forEach(k=>{const c=col[k];if(c&&isRemovedTitle(c.t))delete col[k]});
 if(Object.keys(col).length!==before)save();
}catch(e){wcDbg(e)}
// V75 : « Amine » (@amineoff) est retiré définitivement du catalogue des créateurs.
try{
 const before=Object.keys(col).length;
 Object.keys(col).forEach(k=>{
  const c=col[k];
  if(c&&String(c.t||"").trim().toLowerCase()==="amine")delete col[k];
 });
 if(Object.keys(col).length!==before)save();
}catch(e){wcDbg(e)}
// V74 : Zbb retiré du jeu. On purge aussi toute carte Zbb éventuellement restée dans la sauvegarde.
try{
 const before=Object.keys(col).length;
 Object.keys(col).forEach(k=>{const c=col[k];if(c&&["zbb","amine"].includes(String(c.t||"").trim().toLowerCase()))delete col[k]});
 if(Object.keys(col).length!==before)save();
}catch(e){wcDbg(e)}
// V87 supprimé : il effaçait toutes tes cartes Kameto et en redonnait une gratuite à chaque rechargement de la page.
// découpe crantée des paquets
document.documentElement.style.setProperty("--clip","polygon("+Array.from({length:15},(_,i)=>`${i*100/14}% ${i%2?0:2.4}%`).join(",")+","+Array.from({length:15},(_,i)=>`${100-i*100/14}% ${i%2?100:97.6}%`).join(",")+")");
// effet holo / inclinaison au survol
document.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".card");if(!c||c.dataset.drag)return;const b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
 c.style.setProperty("--mx",x*100);c.style.setProperty("--my",y*100);c.style.setProperty("--ry",(x-.5)*10*(c.classList.contains("pack")?3:1)+"deg");c.style.setProperty("--rx",(.5-y)*10*(c.classList.contains("pack")?3:1)+"deg");c.style.setProperty("--s",1.03)});
document.addEventListener("pointerout",e=>{const c=e.target.closest&&e.target.closest(".card");if(c&&!c.contains(e.relatedTarget))["--rx","--ry","--s"].forEach(k=>c.style.removeProperty(k))});
const p2=v=>String(v).padStart(2,"0");
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),hh=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return hh?`${hh}h ${p2(m)}min ${p2(x)}s`:`${p2(m)}:${p2(x)}`};
const NO_IMAGE_TITLES=new Set(["lorenzo staelens"]);
const noImageTitle=t=>NO_IMAGE_TITLES.has(nz2(t));
try{
 const byTitle=new Map();
 Object.keys(col).forEach(k=>{const c=col[k];if(!c)return;const key=nz2(c.t);if(!key)return;const prev=byTitle.get(key);if(!prev||(+c.n||1)>(+prev.n||1))byTitle.set(key,c)});
 const keep=new Set([...byTitle.values()].map(c=>c.id));
 Object.keys(col).forEach(k=>{const c=col[k];if(!c||!c.img||typeof c.img!=="string"||noImageTitle(c.t)||!keep.has(c.id))delete col[k]});
 save();
}catch(e){wcDbg(e)}
const CANONICAL_TITLES={"Sophie Reine":"Sophie Rain"};
const canonicalTitle=t=>CANONICAL_TITLES[String(t||"")]||t;
const SPECIAL_ADULT_CARD={id:"special-sweetie-fox-7",pid:"special-sweetie-fox",t:"Sweetie Fox",d:"Créatrice de contenu et modèle connue sous le nom Sweetie Fox",img:SPECIAL_ADULT_IMG,r:7,src:"wiki",nsfw:true,v:900000};
try{store[SPECIAL_ADULT_CARD.id]=SPECIAL_ADULT_CARD}catch(e){wcDbg(e)}
const isSweetie=t=>String(t||"").normalize("NFD").replace(/[^a-zA-Z0-9]/g,"").toLowerCase()==="sweetiefox";
/* V139 : images « par défaut » de Wikipédia (silhouette « Vous possédez une image… »). Reconnues par leur nom de fichier : liste apprise (partagée par des centaines d'articles) + motifs connus. */
let BADIMG=new Set();try{BADIMG=new Set(JSON.parse(localStorage.getItem("wc_badimg")||"[]"))}catch(e){wcDbg(e)}
const BADIMG_RE=/manquant|missing[ _-]?(image|photo|portrait)|image[ _-]manquante|replace[ _-]this[ _-]image|placeholder|no[ _-]?(image|photo)[ _-]?(available|found)?\b|image[ _-]non[ _-]disponible|photo[ _-]non[ _-]disponible|portrait[ _-]manquant/i;
function imgFile(u){try{const a=String(u||"").split("?")[0].split("/");let f=a[a.length-1];if(/^\d+px-/.test(f)&&a.length>1)f=a[a.length-2];return decodeURIComponent(f)}catch(e){return""}}
const _seenImg=new Map();
function badImg(u){if(!u||typeof u!=="string"||u.startsWith("data:"))return false;const f=imgFile(u);return !!f&&(BADIMG.has(f)||BADIMG_RE.test(f))}
function addBadImg(files){let ch=0;files.forEach(f=>{if(f&&!BADIMG.has(f)){BADIMG.add(f);ch++}});if(ch)try{localStorage.setItem("wc_badimg",JSON.stringify([...BADIMG].slice(-300)))}catch(e){wcDbg(e)}return ch}
/* apprentissage en direct : un même fichier vu sur 6 articles différents pendant la session = image par défaut */
function learnImg(p){try{const u=p.thumbnail&&p.thumbnail.source;if(!u)return;const f=imgFile(u);if(!f||BADIMG.has(f))return;let s=_seenImg.get(f);if(!s){s=new Set();_seenImg.set(f,s);if(_seenImg.size>3000)_seenImg.clear()}s.add(p.title);if(s.size>=6)addBadImg([f])}catch(e){wcDbg(e)}}
const ok=p=>{learnImg(p);return !!(p.thumbnail&&!badImg(p.thumbnail.source))&&ok0(p)};const ok0=p=>p.thumbnail&&!noImageTitle(p.title)&&!/homonymie/i.test(p.description||"")&&!isRemovedTitle(p.title);
function rp(p){
 if(OVR[p.title]!=null)return OVR[p.title];
 const k=nz2(p.title);
 if(OVRN[k]!=null)return OVRN[k];
 if(VIPR[k]!=null)return VIPR[k];
 const s=Object.values(p.pageviews||{}).reduce((a,b)=>a+(b||0),0);
 const g=inferCardCategory(p);
 const cr=categoryRankRarity(p.title,s,g);
 return boost(p.title,cr==null?rarOf(s):cr);
}
function mk(p,rf,vf){const title=canonicalTitle(p.title),pp=title===p.title?p:{...p,title};const r=rf??rp(pp),pv=p.pageviews?Object.values(p.pageviews).reduce((a,b)=>a+(b||0),0):vf,c={v:pv,id:p.pageid+"-"+r,pid:"w"+p.pageid,t:title,d:p.description||"",img:p.thumbnail.source,r,src:"wiki",nsfw:SEX.test(title)||ADULT.has(nz2(title))||/pornograph|érotique|hentai|sexuel/i.test(p.description||"")};if(nz2(title)==="sweetie fox"){c.img=SPECIAL_ADULT_CARD.img;c.d="Créatrice de contenu et modèle connue sous le nom Sweetie Fox";c.r=7;c.id=String(c.id).replace(/-\d+$/,"-7")}store[c.id]=c;return c}
function card(c){const [n,cl]=R[c.r];
return `<div class="card r${c.r} ${c.nsfw?"nsfw":""} ${c.src=="film"?"film-art":""}" style="--c:${cl}" data-id="${c.id}"><div class="in"><span class="bd">${SYM[c.r]}</span>${c.n>1?`<span class="cnt">×${c.n}</span>`:""}<img class="${c.src=="cr"?"creator-art":c.src=="film"?"film-art":""}" src="${c.img}" referrerpolicy="no-referrer" alt="${(c.t||"").replace(/"/g,"&quot;")}"><div class="nm"><span class="t">${c.t}</span><small>${SYM[c.r]} ${n}${c.src=="film"?`<span class="film-badge">🎬 FILM</span>`:""}</small></div></div><i class="foil"></i><i class="tex"></i><i class="glare"></i><i class="spk"></i><i class="gl a"></i><i class="gl b"></i></div>`}
const ph=t=>"data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'><rect width='4' height='4' fill='#6b21a8'/><text x='2' y='2.9' font-size='2.4' text-anchor='middle' fill='#e9d5ff' font-family='sans-serif'>${(t||"?")[0]}</text></svg>`);
// rm=true : carte supprimée si aucune image ne charge ; sinon image de remplacement. Créateurs : YouTube → Twitch → X → Instagram
const nz=s=>(s||"").normalize("NFD").replace(/[^a-z0-9]/gi,"").toLowerCase();
async function creatorWikiImage(c){
 if(c.realImg) return c.realImg;
 const enc=encodeURIComponent(c.t), U=`https://fr.wikipedia.org/w/api.php?format=json&origin=*&action=query&generator=search&gsrsearch=${enc}&gsrnamespace=0&gsrlimit=6&prop=pageimages&piprop=thumbnail&pithumbsize=700`;
 try{
  const j=await (await fetch(U)).json(), ps=Object.values(j.query?.pages||{});
  ps.sort((a,b)=>((a.title||'').toLowerCase()==c.t.toLowerCase()?0:1)-((b.title||'').toLowerCase()==c.t.toLowerCase()?0:1));
  const p=ps.find(x=>x.thumbnail?.source&&nz(x.title)==nz(c.t));
  if(p?.thumbnail?.source){c.realImg=p.thumbnail.source;return c.realImg}
 }catch(e){wcDbg(e)}
 try{
  const s=await (await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${enc}&language=fr&format=json&origin=*&limit=5`)).json();
  const ids=(s.search||[]).filter(x=>nz(x.label)==nz(c.t)).slice(0,5).map(x=>x.id).join('|'); if(!ids)return null;
  const j=await (await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims&format=json&origin=*`)).json();
  for(const id of ids.split('|')){
   const file=j.entities?.[id]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
   if(file){c.realImg=`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=700`;return c.realImg}
  }
 }catch(e){wcDbg(e)}
 return null
}
function bindCards(root,rm=true){root.querySelectorAll(".card").forEach(e=>{const c=store[e.dataset.id],img=e.querySelector("img");
 if(!c||!img)return;
 if(c.src=="cr"){const k=CRE.find(x=>x.pid==c.pid);if(k&&k.lock){c.img=k.img;c.imgs=k.imgs;c.realImg=k.realImg;if(img.src!==k.img)img.src=k.img}else if(k&&!c.imgs)c.imgs=k.imgs}
 const L=(c.imgs&&c.imgs.length?c.imgs:[c.img]).filter(Boolean);let i=0,n=0,dead=false;
 const preloadSwap=src=>new Promise(resolve=>{if(!src||dead||img.src===src)return resolve(false);const pre=new Image();pre.referrerPolicy="no-referrer";pre.onload=()=>{if(dead)return resolve(false);img.src=src;img.classList.remove("img-loading");img.dataset.ready="1";resolve(true)};pre.onerror=()=>resolve(false);pre.src=src});
 const fail=async()=>{if(dead)return;img.classList.add("img-loading");
  while(i<L.length-1){i++;if(await preloadSwap(L[i]))return}
  if(c.src=="cr"){const u=await creatorWikiImage(c);if(u&&await preloadSwap(u))return}
  if(!c.imgs&&n<3){n++;const u=c.img+(c.img.includes("?")?"&":"?")+"r="+n;if(await preloadSwap(u))return}
  dead=true;img.classList.remove("img-loading");if(rm&&c.pid!==SPECIAL_ADULT_CARD.pid)e.remove();else img.src=ph(c.t)
 };
 img.onload=()=>{img.classList.remove("img-loading");img.dataset.ready="1";if(!img.src.startsWith("data:"))c.img=img.currentSrc||img.src};
 img.onerror=fail;
 e.onclick=()=>openModal(e.dataset.id)})}
const M=$("modal");M.onclick=e=>{if(e.target===M)closeModal()};document.addEventListener("keydown",e=>{if(e.key=="Escape")closeModal()});
function closeModal(){M.style.display="none";M.innerHTML=""}
async function openModal(id){const c=store[id];if(!c)return;const [n,cl]=R[c.r];M.style.display="flex";let desc=c.d||"…",tabm=0;
 const url=c.src=="wiki"?"https://fr.wikipedia.org/wiki/"+encodeURIComponent(c.t.replace(/ /g,"_")):c.src=="film"?(c.url||null):(c.url||(CRE.find(x=>x.pid==c.pid)||{}).url);
 const link=url?`<a class="lnk" target="_blank" rel="noopener" href="${url}">${c.src=="wiki"?"Voir l'article sur Wikipédia":c.src=="film"?"Voir la fiche IMDb":"Voir la chaîne "+c.plat} →</a>`:"",own=col[c.id];
 const draw=()=>{
  const det=`<p style="line-height:1.55;margin:0 0 6px">${desc}</p><label class="lab">ÉTIQUETTES</label><div class="tgs">${((col[c.id]||own||{}).tags||[]).map((t,ti)=>`<span class="tpill" style="--tag-color:${tagColor(t,ti)}">${tagLabel(t)}<i data-t="${t.replace(/"/g,"&quot;")}">×</i></span>`).join("")}</div>${own?`<div class="tcb"><input id="tin" class="tin" placeholder="Ajouter une étiquette…" autocomplete="off"><div class="tdd" id="tdd" hidden></div></div>`:""}
   <div class="sb2"><div><b>🪙 ${fair(c)}</b><span>Valeur estimée</span></div><div><b>👁 ${c.v!=null?Math.round(c.v).toLocaleString("fr-FR"):"—"}</b><span>${c.src=="film"?"Votes IMDb":"Vues / mois"}</span></div></div>
   <div class="sub">Exemplaires : ${own?own.n:0}${c.src=="cr"?" · "+c.plat:""}</div><div style="margin-top:10px">${link}</div>${c.src=="wiki"?`<div class="sub" style="margin-top:8px">Texte de l'article : CC BY-SA 4.0 — crédits sur la page Wikipédia.</div>`:""}`;
  const hist=MK.H.filter(x=>x.r==c.r).slice(0,6),act=MK.A.filter(a=>!a.done&&a.c.pid==c.pid).length;
  const mkt=marketBlock(c)+`<div class="sub" style="margin-top:10px">Dernières ventes (${n}) : ${hist.length?hist.map(x=>x.p+" 🪙").join(" · "):"aucune pour l'instant"}</div><div class="sub" style="margin-top:6px">${act?act+" exemplaire(s) en vente en ce moment.":"Aucun exemplaire en vente en ce moment."}</div>`;
  M.innerHTML=`<div class="mbox v2"><button class="btn g x" id="mx">✕</button><div class="mtop"><div class="mcard">${card(c)}</div><div class="minfo"><h2>${c.t}</h2><button class="btn g wlbtn ${isW(c)?"on":""}" id="wl">${isW(c)?"⭐ Suivie":"☆ Suivre"}</button><div class="hd"><span class="rchip" style="background:${cl}">${n}</span>${c.src=="film"?`<span class="film-badge">🎬 ${c.year||""}${c.rating?` · ⭐ ${c.rating.toFixed(1)}`:""}</span>`:""}<span class="tabs"><button class="${tabm?"":"on"}" data-m="0">Détails</button><button class="${tabm?"on":""}" data-m="1">Marché</button></span></div>${tabm?mkt:det}</div></div>${own?`<div class="mbot"><button class="btn" id="au">🔨 Mettre aux enchères</button><button class="btn g" id="ds">🗑 Défausser (+${dsc(c)} 🪙)</button></div>`:""}</div>`;
  $("mx").onclick=closeModal;M.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{tabm=+b.dataset.m;draw()});
  if($("wl"))$("wl").onclick=()=>{toggleW(c);if(tab==3&&!AV.d)paintMk(true);draw()};
  if($("au"))$("au").onclick=()=>openAuction(c.id);
  if($("ds"))$("ds").onclick=()=>{if(!confirm("Défausser « "+c.t+" » pour "+dsc(c)+" 🪙 ?"))return;const e=col[c.id];e.n>1?e.n--:delete col[c.id];gain(dsc(c));closeModal();render()};
  const ti=$("tin"),dd=$("tdd");
  if(ti&&dd){
   const addT=raw=>{const o=col[c.id]||own,t=cleanTag(raw);if(!t)return;o.tags=o.tags||[];if(o.tags.includes(t)){toast("Déjà sur cette carte.");return}if(o.tags.length>=8){toast("8 étiquettes maximum par carte.");return}
    o.tags.push(t);save();try{if(tab==2)collection()}catch(e){wcDbg(e)}draw();const n=$("tin");if(n)n.focus()};
   let hl=-1,items=[];
   const paint=()=>{const q=ti.value.trim().toLowerCase(),have=new Set((col[c.id]||own).tags||[]),all=colTags(),list=all.filter(t=>!have.has(t)&&(!q||t.toLowerCase().includes(q)));
    items=list.map(t=>({t,n:0}));const exact=all.some(t=>t.toLowerCase()==q);
    dd.innerHTML=list.map((t,i)=>`<button type="button" data-v="${t.replace(/"/g,"&quot;")}" class="${i==hl?"hl":""}"><span class="tdot" style="--tag-color:${tagColor(t,all.indexOf(t))}"></span>${tagLabel(t)}</button>`).join("")+(q&&!exact?`<button type="button" class="tnew" data-v="${ti.value.trim().replace(/"/g,"&quot;")}">➕ Créer « ${ti.value.trim().replace(/</g,"&lt;")} »</button>`:"");
    dd.hidden=!dd.innerHTML};
   ti.onfocus=()=>{hl=-1;paint()};ti.oninput=()=>{hl=-1;paint()};
   dd.onmousedown=e=>{const b=e.target.closest("button[data-v]");if(b){e.preventDefault();addT(b.dataset.v)}};
   ti.onkeydown=e=>{const bs=[...dd.querySelectorAll("button[data-v]")];
    if(e.key=="ArrowDown"||e.key=="ArrowUp"){e.preventDefault();if(!bs.length)return;hl=(hl+(e.key=="ArrowDown"?1:-1)+bs.length)%bs.length;bs.forEach((b,i)=>b.classList.toggle("hl",i==hl));bs[hl].scrollIntoView({block:"nearest"})}
    else if(e.key=="Enter"){e.preventDefault();if(hl>=0&&bs[hl])addT(bs[hl].dataset.v);else if(ti.value.trim())addT(ti.value)}
    else if(e.key=="Escape"){dd.hidden=true}};
   ti.onblur=()=>setTimeout(()=>{dd.hidden=true},120)}
  M.querySelectorAll(".tgs i").forEach(i=>i.onclick=()=>{const o=col[c.id]||own;o.tags=(o.tags||[]).filter(x=>x!=i.dataset.t);save();try{if(tab==2)collection()}catch(e){wcDbg(e)}draw()});
  const im=M.querySelector("img");if(im)im.onerror=()=>{im.src=ph(c.t)}};
 draw();
 if(c.src=="wiki"){try{const j=await(await fetch("https://fr.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(c.t))).json();if(M.style.display=="flex"&&j.extract&&store[id]===c){desc=j.extract;draw()}}catch(e){wcDbg(e)}}}
function render(){clearInterval(timer);closeModal();try{SFX.stopAll()}catch(e){wcDbg(e)}try{simulate()}catch(e){wcDbg(e)}
 [0,1,2,3,4,5,6,7,8].forEach(i=>{const e=$("t"+i);if(e)e.className=tab==i?"on":""});
 try{([packs,all,collection,market,casino,(typeof missionsPage=="function"?missionsPage:packs),eventPage,profilePage,succesPage][tab]||packs)()}
 catch(e){console.error(e);main.innerHTML=`<div class="msg">Oups, une erreur est survenue.<br><br><button class="btn" onclick="render()">Réessayer</button></div>`}}
/* ===== PAQUETS ===== */
const SPECIALS=[
 {id:"rare",name:"Booster Rare",price:500,min:2,icon:"★",c1:"#5aa8ff",c2:"#1f4d98",note:"",short:"RARE GARANTIE"},
 {id:"holo",name:"Booster Holo",price:900,min:3,icon:"✧",c1:"#5ee7ff",c2:"#0d7c9a",note:"",short:"HOLO GARANTIE"},
 {id:"ultra",name:"Booster Ultra",price:4000,min:4,icon:"✦✦",c1:"#ffb15f",c2:"#a83b22",note:"",short:"ULTRA GARANTIE"},
 {id:"legend",name:"Booster Légendaire",price:12500,min:6,icon:"♛",c1:"#ffe66b",c2:"#9b6d16",note:"",short:"LÉGENDAIRE + CHANCE GRAAL"}
];
const moneyFmt=n=>n.toLocaleString("fr-FR");
const LEGEND_HFA_BOOSTER_CHANCE=.08; // 8 % sur l'emplacement garanti du Booster Légendaire
let pendingSpecialMin=null,pendingSpecialName="";
const specialHTML=o=>`<div class="special-pack" data-special="${o.id}" style="--pc1:${o.c1};--pc2:${o.c2}"><div class="swrap"></div><div class="sinfo"><div class="smini"><div><b>${o.icon}</b><span>WIKICOLLECT</span><span>10 CARTES</span></div></div><div class="sbody"><h3>${o.name}</h3><span class="guarantee">${o.short}</span><p>${o.note}</p><div class="buyline"><span class="price">🪙 ${moneyFmt(o.price)}</span><button class="btn" data-buy="${o.id}">Acheter</button></div></div></div></div>`;
function buySpecial(id){const o=SPECIALS.find(x=>x.id==id);if(!o)return;if(money<o.price)return alert("Pas assez de pièces.");money-=o.price;pendingSpecialMin=o.min;pendingSpecialName=o.name;save();upM();tear(null,o)}
const packHTML=x=>`<div class="pack ${x||""}"><i class="sh"></i>${[1,2,3,4,5,6,7].map(k=>`<i class="ly" style="transform:translateZ(${-k*2}px)"></i>`).join("")}<i class="ly bk" style="transform:translateZ(-16px)"><b>W</b></i><div class="body" style="transform:translateZ(3px)"><div class="crimp t"></div><div class="crimp b"></div><div class="pk"><div class="emb">W</div><div class="ttl">Wiki<b>Collect</b></div><div class="stars">★ ★ ★</div><div class="tag">BOOSTER · 10 CARTES</div><div class="dots">● ◆ ★ ✦ ♛</div></div></div><span class="cdt"></span></div>`;
function packs(){
 clearInterval(timer);
 main.innerHTML=`<div class="booster-head"><h2>Boosters</h2><div class="booster-count" id="ps"></div></div><div class="packs">${Array.from({length:MAXB},()=>packHTML()).join("")}</div>
 <div style="display:flex;justify-content:center;margin:4px 0 8px"><button class="btn" id="bp">🎁 Acheter & ouvrir un Booster classique · 250 🪙</button></div>
 <h2 style="margin-top:34px">🔥 Boosters spéciaux</h2><div class="specials">${SPECIALS.map(specialHTML).join("")}</div>`;
 const P=[...main.querySelectorAll(".packs .pack")];
 const tick=()=>{
  const now=Date.now();
  let ready=0;
  P.forEach((e,i)=>{
   const left=boosterLeft(i),ok=left<=0;
   if(ok)ready++;
   e.classList.toggle("lock",!ok);
   e.classList.toggle("cooling",!ok);
   const cdt=e.querySelector(".cdt");
   if(cdt)cdt.innerHTML=ok?"":`<b>${fmt(left)}</b>`;
  });
  $("ps").textContent=`${ready}/${MAXB} disponibles`;
  $("bp").disabled=ready>=MAXB;
 };
 const buy=()=>{
  if(money<250)return alert("Pas assez de pièces.");
  money-=250;
  save();
  upM();
  toast("🎁 Booster classique acheté !");
  tear(null,null,-1);
 };
 $("bp").onclick=buy;
 tick();timer=setInterval(tick,1000);
 P.forEach((e,i)=>e.onclick=()=>{if(!boosterReady(i))return;tear(null,null,i)});
 main.querySelectorAll("[data-buy]").forEach(b=>b.onclick=e=>{e.stopPropagation();buySpecial(b.dataset.buy)});
 main.querySelectorAll("[data-special]").forEach(e=>e.onclick=()=>buySpecial(e.dataset.special));
}
async function getTop(){if(topCache)return topCache;
 try{const d=new Date(),y=d.getMonth()?d.getFullYear():d.getFullYear()-1,m=d.getMonth()||12;
  const j=await(await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia/all-access/${y}/${p2(m)}/all-days`)).json(),dim=new Date(y,m,0).getDate();
  topCache=j.items[0].articles.filter(a=>!/:/.test(a.article)&&a.article!="Accueil"&&!isRemovedTitle(a.article.replace(/_/g," "))).map(a=>({t:a.article.replace(/_/g," "),r:OVR[a.article.replace(/_/g," ")]??boost(a.article.replace(/_/g," "),rarOf(a.views))}))}
 catch(e){topCache=[]}return topCache}
/* ===== V116 : boosters plus variés (tout le catalogue, pas de thème, pas de doublons récents) ===== */
const SRC=new WeakMap();
const tkey=c=>String((c&&c.t)||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const RECENT_MAX=150;let RECENT=[];try{RECENT=JSON.parse(localStorage.getItem("wc_recent_pulls")||"[]")||[]}catch(e){wcDbg(e)}
let RECENT_SET=new Set(RECENT);
const isRecent=c=>RECENT_SET.has(tkey(c));
function recordPulled(cs){try{cs.forEach(c=>{const k=tkey(c);if(k)RECENT.push(k)});RECENT=RECENT.slice(-RECENT_MAX);RECENT_SET=new Set(RECENT);localStorage.setItem("wc_recent_pulls",JSON.stringify(RECENT))}catch(e){wcDbg(e)}}
/* V117 : tirage purement aléatoire. La rareté suit les % du jeu, puis la carte est tirée UNIFORMÉMENT parmi toutes les cartes candidates de cette rareté
   (pages Wikipédia au hasard + tout le catalogue + cartes VIP). Aucune catégorie, aucun thème, aucune préférence. Seule règle : ne pas redonner
   une carte tirée dans les 150 dernières. */
/* V140 : un booster privilégie d'abord les cartes que tu n'as JAMAIS eues, puis celles que tu as le moins, puis celles pas tirées récemment */
function pickSmart(cs){
 const n=c=>{try{return ownN(c)}catch(e){return 0}};
 let a=cs.filter(c=>!n(c));
 if(!a.length){const m=Math.min(...cs.map(n));a=cs.filter(c=>n(c)===m)}
 const b=a.filter(c=>!isRecent(c));if(b.length)a=b;
 return a[Math.floor(Math.random()*a.length)]}
const CRATE=.03; // chance qu'une carte d'un booster soit un créateur (≈ 26 % des boosters en contiennent un)
async function buildPack(minRarity=null){
 const rollCount=minRarity!=null?9:10; const rolls=Array.from({length:rollCount},()=>pick(Math.random())).sort((a,b)=>a-b); // 10 cartes au total, dont 1 garantie pour les boosters spéciaux
 const top=await getTop().catch(()=>[]);
 const randomResults=await Promise.all([0,1,2,3].map(()=>
  fetch(API+"generator=random&grnnamespace=0&grnlimit=50")
   .then(r=>{if(!r.ok)throw new Error("Wikipedia HTTP "+r.status);return r.json()})
   .catch(()=>null)
 ));
 const seen=new Set(),pool=[];
 const add=(j,tag)=>Object.values(j?.query?.pages||{}).filter(ok).filter(p=>!isExcludedTitle(p.title)).forEach(p=>{if(!seen.has(p.pageid)){seen.add(p.pageid);const c=mk(p);SRC.set(c,tag||"rnd");pool.push(c)}});
 randomResults.filter(Boolean).forEach(j=>add(j,"rnd"));
 // Secours : si Wikipédia refuse les requêtes depuis un fichier local, on utilise les cartes
 // déjà réellement présentes dans la collection. On ne crée aucune fausse carte.
 if(pool.length<10){
  Object.values(col||{}).filter(c=>c&&c.img&&typeof c.img==="string"&&!noImageTitle(c.t)&&!isExcludedTitle(c.t)).forEach(c=>{
   const pid=c.pid||("col-"+c.id);
   if(!seen.has(pid)){seen.add(pid);const cc={...c,pid,src:c.src||"wiki"};SRC.set(cc,"col");pool.push(cc)}
  });
 }
 try{
  const vt=[],dr=new Set(rolls.filter(r=>r>=1)),vper=Math.max(8,Math.min(30,Math.floor(48/Math.max(1,dr.size))));dr.forEach(r=>vt.push(...VIPT.filter(v=>v.r==r&&(v.g!=="adult"||Math.random()<.2)).sort(()=>Math.random()-.5).slice(0,vper)));
  if(vt.length){const {pages,rd}=await wq(APIB+"redirects=1&titles="+encodeURIComponent(vt.slice(0,50).map(v=>v.t).join("|")));const forced={};vt.forEach(v=>{const a=rd[v.t]||v.t;forced[nz2(rd[a]||a)]=v.r});
   Object.values(pages).filter(ok).forEach(p=>{if(isExcludedTitle(p.title)||seen.has(p.pageid))return;seen.add(p.pageid);const c=mk(p,forced[nz2(p.title)]);SRC.set(c,"vip");pool.push(c)})}
  if(vt.some(v=>isSweetie(v.t))&&!pool.some(c=>c.pid===SPECIAL_ADULT_CARD.pid)){const c={...SPECIAL_ADULT_CARD};SRC.set(c,"vip");pool.push(c)}
 }catch(e){wcDbg(e)}
 try{if(window.wcCatalogV41&&window.wcCatalogV41.randomSample){const need={};rolls.forEach(r=>{need[r]=(need[r]||0)+1});const counts={};Object.keys(need).forEach(r=>{counts[r]=Math.max(40,need[r]*20)});
  const extra=await window.wcCatalogV41.randomSample(counts);extra.forEach(c=>{if(!seen.has(c.pid)&&!isExcludedTitle(c.t)){seen.add(c.pid);SRC.set(c,"cat");store[c.id]=c;pool.push(c)}})}}catch(e){wcDbg(e)}
 if(rolls.some(r=>r>=2)&&top.length){ // articles très consultés (top mensuel) pour les rangs hauts
  const T=[],rr=[...new Set(rolls.filter(r=>r>=1))],tper=Math.max(5,Math.min(14,Math.floor(48/Math.max(1,rr.length))));rr.forEach(r=>T.push(...top.filter(x=>x.r==r).sort(()=>Math.random()-.5).slice(0,tper)));
  if(T.length)try{add(await(await fetch(API+"titles="+encodeURIComponent(T.slice(0,50).map(x=>x.t).join("|")))).json(),"top")}catch(e){wcDbg(e)}}
 const used=new Set(),res=[];
 if(minRarity!=null){
  const creatorCand=CRE.filter(c=>c.r>=minRarity);
  let guaranteed=creatorCand.length?pickSmart(creatorCand):null;
  if(!guaranteed){const wc=pool.filter(c=>c.r>=minRarity&&!used.has(c.pid));if(wc.length)guaranteed=pickSmart(wc);}
  if(!guaranteed&&top.length){const TT=top.filter(x=>x.r>=minRarity).sort(()=>Math.random()-.5).slice(0,12);if(TT.length)try{const jj=await (await fetch(API+"titles="+encodeURIComponent(TT.map(x=>x.t).join("|")))).json();add(jj,"top");const wc=pool.filter(c=>c.r>=minRarity&&!used.has(c.pid));if(wc.length)guaranteed=pickSmart(wc);}catch(e){wcDbg(e)}}
  if(guaranteed){
   // Dans le Booster Légendaire, l'emplacement garanti peut devenir un Légendaire holo full art.
   if(minRarity===6 && Math.random()<LEGEND_HFA_BOOSTER_CHANCE){
    const graal=creatorCand.filter(c=>c.r>=7).concat(pool.filter(c=>c.r===7&&!used.has(c.pid)));
    if(graal.length) guaranteed=pickSmart(graal);
    else if(top.length){
     const TG=top.filter(x=>x.r===7).sort(()=>Math.random()-.5).slice(0,12);
     if(TG.length)try{
      const jj=await (await fetch(API+"titles="+encodeURIComponent(TG.map(x=>x.t).join("|")))).json();
      add(jj,"top");
      const wc=pool.filter(c=>c.r===7&&!used.has(c.pid));
      if(wc.length) guaranteed=pickSmart(wc);
     }catch(e){wcDbg(e)}
    }
   }
   used.add(guaranteed.pid);res.push(guaranteed)
  }
 }
 const usedT=new Set(res.map(tkey));
 [...rolls].reverse().forEach(rt=>{
  if(Math.random()<CRATE){let cs=CRE.filter(c=>!used.has(c.pid)&&!usedT.has(tkey(c)));const fresh=cs.filter(c=>!isRecent(c));if(fresh.length)cs=fresh;
   if(cs.length){const dm=Math.min(...cs.map(c=>Math.abs(c.r-rt))),cc=cs.filter(c=>Math.abs(c.r-rt)==dm);
    if(cc.length){const c=pickSmart(cc);used.add(c.pid);usedT.add(tkey(c));res.push(c);return}}}
  const order=[];for(let i=rt;i>=0;i--)order.push(i);for(let i=rt+1;i<=7;i++)order.push(i);
  for(const r of order){const cs=pool.filter(c=>c.r==r&&!used.has(c.pid)&&!usedT.has(tkey(c)));if(cs.length){const c=pickSmart(cs);used.add(c.pid);usedT.add(tkey(c));res.push(c);break}}});
 if(res.length<10)throw 0;
 return res.sort((a,b)=>a.r-b.r)}
function tear(force,offer,slotIndex=-1){clearInterval(timer);
 main.innerHTML=`<h2>${force!=null?"Booster test · "+R[force][0]:offer?offer.name:"Ouvre ton booster"}</h2><div class="sub">✂️ Découpe le sachet : attrape la ligne en pointillés et fais glisser les ciseaux de gauche à droite</div><div class="stage">${packHTML()}</div>`;
 const pk=main.querySelector(".pack");pk.insertAdjacentHTML("beforeend",'<div class="tz"><span>✂️ Fais glisser pour découper</span></div><div class="tl"></div>');
 const z=pk.querySelector(".tz"),tl=pk.querySelector(".tl");let x0=null,done=false;
 const cut=(e)=>{if(x0===null||done)return;const b=pk.getBoundingClientRect();const t=Math.max(0,Math.min(1,(e.clientX-b.left)/(b.width*.92)));pk.style.setProperty("--t",t);tl.style.width=(t*100)+"%";pk.classList.toggle("cutting",t>0);if(t>=1){done=true;x0=null;SFX.cut();strip(pk);setTimeout(()=>openPack(force,slotIndex),1000)}};
 z.onpointerdown=e=>{if(done)return;x0=e.clientX;z.setPointerCapture(e.pointerId);pk.classList.add("cutting");cut(e)};
 z.onpointermove=cut;
 z.onpointerup=z.onpointercancel=()=>{if(x0!==null&&!done){x0=null;pk.classList.remove("cutting");pk.style.setProperty("--t",0);tl.style.width="0%"}};
 pk.onpointerdown=e=>{if(done)return;const b=pk.getBoundingClientRect(),y=e.clientY-b.top;if(Math.abs(y-32)<24&&e.target!==z){x0=e.clientX;pk.setPointerCapture(e.pointerId);cut(e)}};
 pk.onpointermove=e=>{if(x0!==null&&e.buttons)cut(e)};
 pk.onpointerup=pk.onpointercancel=e=>{if(x0!==null&&!done){x0=null;pk.classList.remove("cutting");pk.style.setProperty("--t",0);tl.style.width="0%"}}
}
// le haut du sachet (au-dessus de la ligne) s'envole, un trait de lumière sort de la coupure, puis le reste s'efface
function strip(pk){const st=pk.parentNode;st.style.position="relative";
 const c=pk.cloneNode(true);c.classList.remove("cutting");c.classList.add("strip");c.querySelectorAll(".tz,.tl").forEach(x=>x.remove());
 c.style.cssText=`position:absolute;left:${pk.offsetLeft}px;top:${pk.offsetTop}px;width:${pk.offsetWidth}px;height:${pk.offsetHeight}px;margin:0`;st.appendChild(c);
 st.insertAdjacentHTML("beforeend",`<i class="lb" style="left:${pk.offsetLeft-8}px;top:${pk.offsetTop+27}px;width:${pk.offsetWidth+16}px"></i>`);
 pk.querySelectorAll(".tz").forEach(x=>x.remove());pk.classList.add("half");
 setTimeout(()=>pk.classList.add("opened"),520)}
async function openPack(force,slotIndex=-1){clearInterval(timer);
 const sm=pendingSpecialMin,sn=pendingSpecialName;
 SFX.packOpen();
 pendingSpecialMin=null;pendingSpecialName="";
 // On affiche immédiatement le sachet : aucun écran de chargement bloquant.
 main.innerHTML=`<h2>${sn||"Ouverture du booster"}</h2><div class="stage pack-stage"><div class="open-inline"><span class="pulse"></span><span>Le paquet s'ouvre…</span></div></div>`;
 try{const cs=await buildPack(sm);
  if(force!=null){const k={...cs[cs.length-1],r:force,id:"test"+force};store[k.id]=k;cs[cs.length-1]=k;cs.sort((a,b)=>a.r-b.r)}
  else{recordPulled(cs);if(slotIndex>=0&&slotIndex<MAXB)boosterCooldowns[slotIndex]=Date.now()+BOOSTER_COOLDOWN;cs.forEach(c=>{const had=!!col[c.id];col[c.id]=had?{...col[c.id],n:col[c.id].n+1}:{...c,n:1};if(had)bumpDaily("dupe",1)});bumpDaily("open",1);bumpDaily("open5",1);if(cs.some(c=>c.r>=2))bumpDaily("rare",1);if(cs.some(c=>c.r>=3))bumpDaily("holo",1);if(cs.some(c=>c.src==="cr"))bumpDaily("creator",1);save();saveBoosterCooldowns()}
  reveal(cs,0,false,force!=null)}
 catch(e){if(sm!=null){const o=SPECIALS.find(x=>x.min==sm);if(o){money+=o.price;save();upM()}}main.innerHTML='<div class="msg">Impossible de charger le booster (ouvre ce fichier directement dans ton navigateur, avec internet). Ton booster n\'a pas été consommé.<br><br><button class="btn" onclick="render()">Retour</button></div>'}}
const back=()=>`<div class="back"><div class="emb">W</div><div class="ttl">Wiki<b>Collect</b></div><div class="stars">★ ★ ★</div></div>`;
function reveal(cs,i,flip,T){const c=cs[i],end=i==cs.length-1;
 main.innerHTML=`<h2>Ouverture du booster</h2><div class="stage" id="st">${flip?card(c):back()}</div><div class="sub" style="text-align:center;margin:-2px 0 10px">Carte ${i+1} / ${cs.length}</div><div class="pag">${flip?`<button class="btn" id="nx">${end?(T?"Retour aux boosters":"Voir ma collection"):"Carte suivante →"}</button>`:"<span>Clique sur la carte pour la révéler</span>"}</div><div class="reveal">${cs.slice(0,i).map(card).join("")}</div>`;
 if(!flip)$("st").onclick=()=>{SFX.cardFlip();c.r>=7?walkout(c,()=>reveal(cs,i,true,T)):reveal(cs,i,true,T)};
 else{SFX.reveal(c.r);$("nx").onclick=()=>{if(end){tab=T?0:2;render()}else reveal(cs,i+1,false,T)};main.querySelector("#st .card").classList.add("pop")}
 bind(main,false)}
// 3 indices : origine (drapeau), domaine, thème (catégorie Wikipédia sans les mots du titre)
async function clues(c){
 if(c.src=="cr")return[`<small>Plateforme</small>${c.plat}`,`<small>Métier</small>${c.plat=="Twitch"?"Streamer":"Créateur de vidéos"}`,`<small>Indice</small>Une communauté de millions de fans`];
 if(c.src=="film")return[`<small>Année</small>${c.year||"Inconnue"}`,`<small>Genre</small>${c.genres||"Cinéma"}`,`<small>Note IMDb</small>${c.rating?c.rating.toFixed(1)+" / 10":"—"}`];
 const J=u=>fetch(u).then(r=>r.json()),out=[];
 try{const s=await J("https://fr.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(c.t)),q=s.wikibase_item,
  g=async(ids,pr)=>(await J(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=${pr}&languages=fr|en&format=json&origin=*`)).entities,
  v=(e,p)=>((e.claims||{})[p]||[]).map(x=>x.mainsnak.datavalue&&x.mainsnak.datavalue.value.id).filter(Boolean);
  const e=(await g(q,"claims"))[q];let ct=v(e,"P27")[0]||v(e,"P17")[0]||v(e,"P495")[0];
  if(!ct){const pb=v(e,"P19")[0]||v(e,"P131")[0];if(pb)ct=v((await g(pb,"claims"))[pb],"P17")[0]}
  const oc=v(e,"P106")[0]||v(e,"P31")[0],ids=[ct,oc].filter(Boolean).join("|"),E=ids?await g(ids,"claims|labels"):{};
  if(ct&&E[ct]){const iso=((E[ct].claims.P297||[])[0]||{}).mainsnak?.datavalue?.value,l=E[ct].labels;if(iso)out.push(`<small>Origine</small><img class="fl" src="https://flagcdn.com/w320/${iso.toLowerCase()}.png" alt=""> ${(l.fr||l.en||{}).value||""}`)}
  if(oc&&E[oc]){const l=E[oc].labels;if(l.fr||l.en)out.push(`<small>Domaine</small>${(l.fr||l.en).value}`)}
  const w=c.t.toLowerCase().split(/\W+/).filter(x=>x.length>2),cj=await J(BASE+"prop=categories&clshow=!hidden&cllimit=40&titles="+encodeURIComponent(c.t)),
   cats=(Object.values(cj.query.pages)[0].categories||[]).map(x=>x.title.replace(/^Catégorie:/,"")).filter(x=>!w.some(y=>x.toLowerCase().includes(y)));
  if(cats.length)out.push(`<small>Thème</small>${cats[Math.floor(Math.random()*cats.length)]}`)}catch(e){wcDbg(e)}
 while(out.length<3)out.push(`<small>Indice</small>${out.length?"…":(c.d||"Un grand mystère")}`);
 return out}
// tunnel : plus la rareté est haute, plus c'est long ; holo full art = 15 s, arc-en-ciel, 3 indices, secousses et anneaux de choc
function walkout(c,done){
 const o=document.createElement("div");o.id="wo";o.innerHTML='<canvas></canvas><div id="wt"></div><button class="btn g" id="wsk">Passer ⏭</button>';document.body.appendChild(o);
 const cv=o.querySelector("canvas"),W=cv.width=innerWidth,H=cv.height=innerHeight,x=cv.getContext("2d"),cx=W/2,cy=H/2,R0=Math.hypot(cx,cy),top=c.r>=7,N=top?3:2,T=top?15000:c.r>=6?10000:7500;
 const P=Array.from({length:top?420:260},()=>({a:Math.random()*6.283,d:Math.random()})),rings=[];let CL=null,shown=0,fin=false,raf;clues(c).then(v=>CL=v);
 const t0=performance.now(),step=T*.9/(N+1);
 const end=()=>{if(fin)return;fin=true;cancelAnimationFrame(raf);o.style.transition="background .4s";o.style.background="#fff";cv.style.opacity=0;o.querySelector("#wt").innerHTML="";setTimeout(()=>{o.remove();done()},350)};
 o.querySelector("#wsk").onclick=end;
 (function f(now){if(fin)return;const t=now-t0,sp=.003+Math.min(t,T*.8)/(T*.8)*(top?.028:.02);
  x.fillStyle="rgba(5,2,15,.3)";x.fillRect(0,0,W,H);
  const col=top?`hsl(${t/6%360},100%,62%)`:c.r>=6?"#f3d474":"#ffd23c";x.strokeStyle=col;x.lineWidth=2;x.beginPath();
  for(const p of P){p.d+=sp*(.3+p.d*3);if(p.d>1){p.d=0;p.a=Math.random()*6.283}const a=R0*p.d,b=R0*Math.max(0,p.d-sp*5*(.3+p.d*3)),co=Math.cos(p.a),si=Math.sin(p.a);x.moveTo(cx+co*b,cy+si*b);x.lineTo(cx+co*a,cy+si*a)}
  x.stroke();
  rings.forEach(r=>{r.s+=9;x.globalAlpha=Math.max(0,1-r.s/R0);x.lineWidth=5;x.beginPath();x.arc(cx,cy,r.s,0,6.283);x.stroke()});x.globalAlpha=1;
  const n=Math.min(N,Math.floor(t/step));if(n>shown&&CL){for(let k=shown;k<n;k++){o.querySelector("#wt").insertAdjacentHTML("beforeend",`<div class="cl">${CL[k]}</div>`);rings.push({s:0})}shown=n}
  o.style.transform=top&&t>T*.75?`translate(${(Math.random()-.5)*12}px,${(Math.random()-.5)*12}px)`:"";
  if(t>T)end();else raf=requestAnimationFrame(f)})(t0)}
/* ===== FILMS : 1000 films de toutes les époques, avec affiche obligatoire ===== */
const FILM_GZ_URL="https://quantavil.github.io/imdb-dataset/titles.json.gz";
const FILM_JSON_URL="https://quantavil.github.io/imdb-dataset/titles.json";
const FILM_CACHE_KEY="wc_films_1000_v1";
let FILMS=[],FILMS_READY=false,FILMS_LOADING=null;
const FILM_BUCKETS=[
  [2020,2026,150],[2010,2019,220],[2000,2009,180],[1990,1999,150],[1980,1989,100],[1970,1979,70],[1960,1969,50],[1950,1959,40],[1900,1949,40]
];
function filmScore(m){
 const rating=Math.max(0,Math.min(1,(+m.rating-5)/5));
 const votes=Math.min(1,Math.log10(Math.max(10,+m.votes||10)+1)/7);
 const pop=m.popularity!=null?1-Math.min(1,Math.log10(Math.max(1,+m.popularity)+1)/5.5):.28;
 const y=+m.year||0,rec=y>=2020?.10:y>=2010?.07:y>=2000?.045:y>=1990?.025:0;
 return rating*.34+votes*.42+pop*.19+rec*.05;
}
function filmRarity(i){
 if(i<15)return 7; if(i<65)return 6; if(i<190)return 5; if(i<410)return 4; if(i<650)return 3; if(i<820)return 2; if(i<930)return 1; return 0;
}
function makeFilm(m,r){
 const year=+m.year||0,title=String(m.title||m.original_title||"").trim(),id=String(m.id||"").trim(),poster=String(m.poster||"").trim();
 return {
   id:`f-${id}-${r}`,pid:id,t:title+(year?` (${year})`:""),baseTitle:title,year,genres:m.genres||"",rating:+m.rating||0,v:+m.votes||0,
   d:`Film${year?` — ${year}`:""}${m.genres?` · ${m.genres}`:""}${m.cast?` · ${m.cast.split(",").slice(0,2).join(", ")}`:""}`,
   img:poster,r,src:"film",url:id?`https://www.imdb.com/title/${id}/`:"",nsfw:false,filmRank:m.rank||null
 };
}
async function loadFilms(){
 if(FILMS_READY)return FILMS;
 if(FILMS_LOADING)return FILMS_LOADING;
 FILMS_LOADING=(async()=>{
   try{
     let cached=null;try{cached=window.WCSAVE?await window.WCSAVE.get("films"):null}catch(e){wcDbg(e)}
     if(cached&&Array.isArray(cached)&&cached.length===1000){FILMS=cached;FILMS_READY=true;return FILMS}
     let payload=null;
     try{
       const r=await fetch(FILM_GZ_URL,{cache:"no-cache"});
       if(!r.ok)throw new Error("Films: téléchargement impossible");
       if("DecompressionStream" in window){
         const stream=r.body.pipeThrough(new DecompressionStream("gzip"));
         payload=JSON.parse(await new Response(stream).text());
       }else throw new Error("gzip navigateur indisponible");
     }catch(e){
       const r=await fetch(FILM_JSON_URL,{cache:"no-cache"});
       if(!r.ok)throw new Error("Films: source indisponible");
       payload=await r.json();
     }
     const fields=payload.fields||[], data=Array.isArray(payload.data)?payload.data:[], ix=Object.fromEntries(fields.map((f,i)=>[f,i]));
     const rows=data.map(row=>({id:row[ix.id],title:row[ix.title],original_title:row[ix.original_title],type:row[ix.type],year:row[ix.year],rating:row[ix.rating],votes:row[ix.votes],genres:row[ix.genres],is_adult:row[ix.is_adult],poster:row[ix.poster],cast:row[ix.cast],popularity:row[ix.popularity],rank:row[ix.rank]}));
     let pool=rows.filter(m=>m&&m.type==="movie"&&m.poster&&m.is_adult!==1&&m.title&&(+m.votes||0)>=1500);
     pool.forEach(m=>m.__score=filmScore(m));
     const used=new Set(),selected=[];
     for(const [lo,hi,n] of FILM_BUCKETS){
       const band=pool.filter(m=>{const y=+m.year||0;return !used.has(m.id)&&y>=lo&&y<=hi}).sort((a,b)=>b.__score-a.__score||(+b.votes||0)-(+a.votes||0));
       for(const m of band.slice(0,n)){used.add(m.id);selected.push(m)}
     }
     if(selected.length<1000){
       const rem=pool.filter(m=>!used.has(m.id)).sort((a,b)=>b.__score-a.__score||(+b.votes||0)-(+a.votes||0));
       for(const m of rem){if(selected.length>=1000)break;used.add(m.id);selected.push(m)}
     }
     if(selected.length<1000)throw new Error(`Seulement ${selected.length} films avec affiche disponibles`);
     selected.sort((a,b)=>b.__score-a.__score||(+b.votes||0)-(+a.votes||0));
     FILMS=selected.slice(0,1000).map((m,i)=>makeFilm(m,filmRarity(i)));
     try{if(window.WCSAVE)window.WCSAVE.put("films",FILMS)}catch(e){wcDbg(e)}
     FILMS_READY=true;return FILMS;
   }catch(e){
     console.warn("Catalogue films indisponible",e);FILMS=[];FILMS_READY=true;return FILMS;
   }
 })();
 return FILMS_LOADING;
}

/* ===== TOUTES LES CARTES : 50 par page ===== */
async function totalOf(){
 if(q){
   const j=await(await fetch(BASE+"list=search&srlimit=1&srinfo=totalhits&srsearch="+encodeURIComponent(q))).json();
   const fq=FILMS.filter(f=>(f.t||"").toLowerCase().includes(q.toLowerCase())||(f.baseTitle||"").toLowerCase().includes(q.toLowerCase())).length;
   return (j.query.searchinfo.totalhits||0)+fq;
 }
 if(totalArticles==null){const j=await(await fetch(BASE+"meta=siteinfo&siprop=statistics")).json();totalArticles=j.query.statistics.articles}
 return totalArticles+FILMS.length}

/* V2 CATEGORY RARITY ENGINE
   - categories are inferred from existing real card titles/metadata
   - rarity is ranked inside the category, not only globally
   - explicit OVR/TIER_ANCHORS always win
   - no synthetic category-name cards are created
*/
const CAT_RARITY_META={
 foot:["football","footballeur","footballeuse","joueur de football","joueuse de football","ligue 1","champions league","coupe du monde"],
 act:["acteur","actrice","cinéma","film","réalisateur","réalisatrice"],
 music:["chanteur","chanteuse","musicien","musicienne","groupe musical","k-pop","rappeur","rappeuse","album","musique"],
 game:["jeu vidéo","jeu vidéo","gaming","esport","playstation","xbox","nintendo"],
 film:["film","long métrage","court métrage","cinéma"],
 animal:["mammifère","oiseau","poisson","reptile","amphibien","insecte","araignée","animal","espèce animale","dinosaure"],
 plant:["plante","fleur","arbre","arbuste","botanique","champignon"],
 science:["scientifique","physicien","physicienne","mathématicien","mathématicienne","astronome","astronomie","science"],
 place:["ville","commune","capitale","pays","métropole","géographie","monument","quartier","lieu"],
 vehicle:["automobile","voiture","constructeur automobile","formule 1","pilote automobile","avion","aéronef","navire","bateau","train","moto"],
 book:["roman","livre","écrivain","écrivaine","auteur","autrice","œuvre littéraire"],
 hist:["histoire","historique","personnalité historique","guerre","révolution"],
 sport:["sportif","sportive","athlète","tennis","basket-ball","boxe","mma","cyclisme","natation","athlétisme"],
 myth:["mythologie","mythologique","dieu","déesse","divinité","légende"],
 food:["cuisine","aliment","plat","recette","fromage","dessert","boisson"],
 tech:["technologie","informatique","logiciel","entreprise","smartphone","ordinateur","internet"],
 event:["attentat","catastrophe","événement","incendie","naufrage","tremblement de terre","pandémie"],
 creator:["youtubeur","youtubeuse","streameur","streameuse","créateur de contenu","créatrice de contenu","influenceur","influenceuse"],
 adult:["pornographique","pornographie","actrice de films pornographiques","acteur de films pornographiques","star du porno","modèle érotique"],
 anime:["anime","animé","manga","shōnen","shoujo"],
 space:["astronomie","planète","étoile","galaxie","constellation","satellite","astéroïde","espace"]
};
const CAT_STATS={};
const _catNorm=x=>nz2(x);
let _CGI=null,_CGIn=-1;
function catGroupOf(t){
  const n=Object.keys(CATALOG||{}).length;
  if(!_CGI||_CGIn!==n){_CGI=new Map();_CGIn=n;
    for(const [g,z] of Object.entries(CATALOG||{})){
      for(const k of [7,6,5,4,3,2,1,0]){
        for(const x of String(z["t"+k]||"").split("|")){if(!x)continue;const key=_catNorm(x);if(key&&!_CGI.has(key))_CGI.set(key,g)}
      }
    }
  }
  return _CGI.get(_catNorm(t))||null;
}
function inferCardCategory(e){
  if(e?.g && CAT_RARITY_META[e.g]) return e.g;
  if(e?.cr) return "creator";
  if(e?.src==="film") return "film";
  const t=String(e?.t||"").toLowerCase();
  const d=String(e?.d||"").toLowerCase();
  const hay=t+" "+d;
  // Prefer explicit CATALOG membership: it is curated with real Wikipedia titles.
  // (index construit une seule fois : avant, chaque article reparcourait tout le catalogue → plusieurs dizaines de secondes de gel)
  {const g=catGroupOf(e.t);if(g)return g}
  // Stronger/specific domains first.
  const order=["adult","creator","anime","space","foot","sport","vehicle","game","film","music","animal","plant","science","place","book","hist","myth","food","tech","event","act"];
  for(const g of order){
    if((CAT_RARITY_META[g]||[]).some(k=>hay.includes(k))) return g;
  }
  return null;
}
function buildCategoryStats(list){
  for(const k of Object.keys(CAT_STATS)) delete CAT_STATS[k];
  (list||[]).forEach(e=>{
    const g=inferCardCategory(e);
    if(!g || !Number.isFinite(+e.v)) return;
    (CAT_STATS[g]||(CAT_STATS[g]=[])).push({t:e.t,v:+e.v,r:e.r});
  });
  Object.keys(CAT_STATS).forEach(g=>{
    const a=CAT_STATS[g].sort((x,y)=>y.v-x.v);
    // Keep a compact rank lookup for fast rarity decisions.
    CAT_STATS[g]=a;
  });
}
function categoryRankRarity(title,views,g){
  const a=CAT_STATS[g];
  if(!a || a.length<12 || !Number.isFinite(+views)) return null;
  const v=+views;
  let pos=a.findIndex(x=>x.v<=v);
  if(pos<0) pos=a.length-1;
  const q=a.length<=1?0:pos/(a.length-1);
  // Deliberately top-heavy: the biggest names in each domain rise much faster.
  if(q<=0.015) return 7;
  if(q<=0.045) return 6;
  if(q<=0.10) return 5;
  if(q<=0.20) return 4;
  if(q<=0.36) return 3;
  if(q<=0.58) return 2;
  if(q<=0.80) return 1;
  return 0;
}

const APIB=BASE+"prop=pageimages|description&piprop=thumbnail&pithumbsize=400&pilimit=50&";
let RANK=[],RANKSET=new Set(),FL=[];
// lot complet : suit les continuations des propriétés (sinon certaines pages perdent leur image)
const J=async u=>{
 const makeUrl=raw=>{try{const x=new URL(raw);if(!x.searchParams.has("origin"))x.searchParams.set("origin","*");return x.toString()}catch(e){return raw}};
 let last=null;
 for(let i=0;i<4;i++){
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);
  try{
   const r=await fetch(makeUrl(u),{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",headers:{"Accept":"application/json"},signal:ac.signal});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const ct=(r.headers.get("content-type")||"").toLowerCase();
   if(ct&&!ct.includes("json"))throw new Error("Réponse Wikipédia non-JSON");
   return await r.json();
  }catch(e){last=e}finally{clearTimeout(tm)}
  await new Promise(r=>setTimeout(r,700*(i+1)));
 }
 throw new Error("Wikipédia inaccessible : "+(last?.message||"connexion refusée"));
};
async function wq(u){const pages={},rd={};let cont={},gen=null;
 for(let i=0;i<8;i++){const j=await J(u+"&"+new URLSearchParams(cont));
  (j.query?.normalized||[]).concat(j.query?.redirects||[]).forEach(x=>rd[x.from]=x.to);
  Object.values(j.query?.pages||{}).forEach(p=>{const k=p.pageid??p.title;pages[k]=Object.assign(pages[k]||{},p)});
  const c=j.continue;if(!c)break;
  if(c.gapcontinue!==undefined||c.gsroffset!==undefined||c.gcmcontinue!==undefined){gen=c.gapcontinue??c.gsroffset??c.gcmcontinue;break}
  cont=c}
 return{pages,next:gen,rd}}
// classement : top des articles les plus vus sur 6 mois + créateurs, du plus rare au plus commun
async function loadRank(){if(RANK.length)return;
 const filmPromise=loadFilms();
 const today=new Date().toISOString().slice(0,10);let W=null;
 try{const s=window.WCSAVE?await window.WCSAVE.get("rank7"):null;if(s&&s.day==today)W=s.l}catch(e){wcDbg(e)}
 if(!W){const d=new Date(),ms=Array.from({length:18},(_,i)=>i+1).map(n=>{const x=new Date(d.getFullYear(),d.getMonth()-n,1);return[x.getFullYear(),x.getMonth()+1]});
  const js=await Promise.all(ms.map(([y,m])=>fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia/all-access/${y}/${p2(m)}/all-days`).then(r=>r.json()).catch(()=>null)));
  const sum={},nm={},pk={};
  /* V138 : on regarde 18 mois. Les 6 derniers donnent le niveau actuel ; le meilleur mois sur 18 donne la notoriété « historique » (un événement majeur ne doit pas être oublié au bout de 6 mois). */
  js.forEach((j,ji)=>(j&&j.items?j.items[0].articles:[]).forEach(a=>{if(/:/.test(a.article)||a.article=="Accueil")return;const t=a.article.replace(/_/g," ");pk[t]=Math.max(pk[t]||0,a.views);if(ji<6){sum[t]=(sum[t]||0)+a.views;nm[t]=(nm[t]||0)+1}}));
  const dd={},days=Array.from({length:30},(_,k)=>{const x=new Date(Date.now()-(k+2)*864e5);return x.getFullYear()+"/"+p2(x.getMonth()+1)+"/"+p2(x.getDate())});
  for(let k=0;k<days.length;k+=30){const dj=await Promise.all(days.slice(k,k+30).map(u=>fetch("https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia/all-access/"+u).then(r=>r.json()).catch(()=>null)));
   dj.forEach(j=>(j&&j.items?j.items[0].articles:[]).forEach(a=>{if(/:/.test(a.article)||a.article=="Accueil")return;const t=a.article.replace(/_/g," ");dd[t]=(dd[t]||0)+a.views}))}
  // Les titres forcés doivent rester dans le classement, mais ne doivent surtout pas recevoir 1 000 milliards de vues fictives.
// La rareté est forcée par OVR ; les vues affichées restent celles réellement récupérées, ou « — » si absentes.
Object.keys(OVR).forEach(t=>{if(sum[t]==null&&dd[t]==null)sum[t]=0});
EXTRA.forEach(t=>{sum[t]=Math.max(sum[t]||0,2e5)});
  W=[...new Set([...Object.keys(sum),...Object.keys(dd),...Object.keys(pk)])].filter(t=>!isRemovedTitle(t)).map(t=>{const a=Math.round(Math.max(sum[t]!==undefined?sum[t]/(nm[t]||1):0,dd[t]||0,(pk[t]||0)*.4));return[t,OVR[t]??boost(t,rarOf(a)),a]});
  try{if(window.WCSAVE)window.WCSAVE.put("rank7",{day:today,l:W})}catch(e){wcDbg(e)}}
 const films=await filmPromise;
 const cn=new Set(CRE.map(c=>c.t));
 RANK=withVip([...W.filter(x=>!cn.has(x[0])).map(x=>({t:x[0],r:x[1],v:x[2],src:"wiki"})),...CRE.map(c=>({t:c.t,r:c.r,v:1e11,cr:c})),...films]).sort((a,b)=>b.r-a.r||(b.o||0)-(a.o||0)||b.v-a.v||String(a.t).localeCompare(String(b.t)));
 buildCategoryStats(RANK);
 // Re-evaluate non-forced cards using their category's internal popularity rank.
 RANK.forEach(e=>{
   const k=nz2(e.t);
   if(OVRN[k]!=null || OVR[e.t]!=null || VIPR[k]!=null || e.cr || e.src==="film") return;
   const rr=categoryRankRarity(e.t,e.v,inferCardCategory(e));
   if(rr!=null)e.r=boost(e.t,rr);
 });
 RANK.sort((a,b)=>b.r-a.r||(b.o||0)-(a.o||0)||b.v-a.v||String(a.t).localeCompare(String(b.t)));
 RANKSET=new Set(RANK.map(e=>e.t))}
// curseur : "r:i" = classement, "a:Titre" = reste de Wikipédia A→Z, "s:n" = recherche
async function collect(cur){let mode=cur[0],val=cur.slice(2),out=[];
 if(mode=="r"&&(SO=="az"||fr.size&&![...fr].some(r=>RANK.some(e=>e.r==r&&(!CG||e.g===CG))))){mode=CG?"c":"a";val=CG?"0|":""}
 const push=c=>{const k=nz2(c&&c.t);if(!k||out.some(o=>nz2(o&&o.t)===k))return;if(noImageTitle(c.t))return;if(!fr.size||fr.has(c.r))out.push(c)};
 for(let t=0;t<(fr.size?45:14)&&out.length<PS;t++){
  if(mode=="r"){const i=+val;if(i>=FL.length){if(fr.size&&!fr.has(0))return{out,next:null};mode=CG?"c":"a";val=CG?"0|":"";continue}
   const B=FL.slice(i,i+50),T=B.filter(e=>!e.cr&&e.src!=="film").map(e=>e.t),info={};
   let rdm={};if(T.length){const {pages,rd}=await wq(APIB+"redirects=1&titles="+encodeURIComponent(T.join("|")));rdm=rd||{};Object.values(pages).forEach(p=>{info[p.title]=p;info["~"+nz2(p.title)]=p})}
   let k=0;for(;k<B.length&&out.length<PS;k++){const e=B[k];if(isSweetie(e.t)){push({...SPECIAL_ADULT_CARD});continue}if(e.cr){push(e.cr);continue}if(e.src==="film"){store[e.id]=e;push(e);continue}let k2=rdm[e.t]||e.t;k2=rdm[k2]||k2;const p=info[k2]||info[e.t]||info["~"+nz2(k2)]||info["~"+nz2(e.t)];if(p&&ok(p))push(mk(p,e.r,e.v>0&&e.v<1e9?Math.round(e.v):undefined))}
   val=i+k}
  else if(mode=="c"){const cats=catList(CG);let [cis,cont]=val.split("|");const ci=+cis||0;
   if(CG==="adult"&&ci===0&&+cis===0){push(SPECIAL_ADULT_CARD);}if(ci>=cats.length)return{out,next:null};
   const need=Math.max(10,PS-out.length);let r={pages:{},next:null};
   try{r=await wq(API+"generator=categorymembers&gcmtitle="+encodeURIComponent("Catégorie:"+cats[ci])+"&gcmtype=page&gcmlimit="+need+(cont?"&gcmcontinue="+encodeURIComponent(cont):""))}catch(e){wcDbg(e)}
   Object.values(r.pages).sort((a,b)=>(a.index||0)-(b.index||0)).forEach(p=>{if(isSweetie(p.title)){push({...SPECIAL_ADULT_CARD});return}if(isRemovedTitle(p.title)||RANKSET.has(p.title))return;rawTot++;if(!ok(p))return;imgTot++;push(mk(p))});
   val=r.next!=null?ci+"|"+r.next:(ci+1)+"|"}
  else{const off=val,u=API+(mode=="s"?"generator=search&gsrlimit=50&gsrsearch="+encodeURIComponent(q)+"&gsroffset="+off:"generator=allpages&gaplimit=50&gapfilterredir=nonredirects"+(off?"&gapfrom="+encodeURIComponent(off):""));
   const {pages,next}=await wq(u),ps=Object.values(pages).sort((a,b)=>a.index-b.index);
   let k=0;for(;k<ps.length&&out.length<PS;k++){const p=ps[k];if(isSweetie(p.title)){push({...SPECIAL_ADULT_CARD});continue}if(isRemovedTitle(p.title))continue;if(mode=="a"&&SO=="rare"&&RANKSET.has(p.title))continue;rawTot++;if(!ok(p))continue;imgTot++;push(mk(p))}
   if(k<ps.length)val=mode=="s"?+off+k:ps[k].title;
   else{if(next===null||next===undefined)return{out,next:null};val=next}}}
 if(mode=="r"&&fr.size&&!fr.has(0)&&+val>=FL.length)return{out,next:null};
 return{out,next:mode+":"+val}}

async function localCatalogFallback(){
 const out=[],seen=new Set(),add=c=>{
  const key=nz2(c&&c.t);
  if(!c||!c.id||!key||seen.has(key)||noImageTitle(c.t)||!c.img||typeof c.img!=="string")return;
  if(fr.size&&!fr.has(+c.r))return;
  if(q&&!String(c.t||"").toLowerCase().includes(q.toLowerCase()))return;
  seen.add(key);out.push(c);
 };
 try{
  const db=await new Promise((resolve,reject)=>{const req=indexedDB.open("WikiCollectCatalogV41");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
  if(db.objectStoreNames.contains("cards")){
   const rows=await new Promise((resolve,reject)=>{
    const a=[],tx=db.transaction("cards","readonly"),s=tx.objectStore("cards"),rq=s.openCursor();
    rq.onsuccess=()=>{const c=rq.result;if(!c)return resolve(a);a.push(c.value);c.continue()};rq.onerror=()=>reject(rq.error);
   });
   rows.sort((a,b)=>(b.r||0)-(a.r||0)||(a.t||"").localeCompare(b.t||"")).forEach(add);
  }
  db.close();
 }catch(e){wcDbg(e)}
 // Secours immédiat : la collection locale contient déjà des milliers de cartes avec image.
 // On l'utilise si l'API Wikipédia est momentanément indisponible.
 try{Object.values(col||{}).forEach(add)}catch(e){wcDbg(e)}
 CRE.forEach(add);
 return out.slice((page-1)*PS,page*PS);
}
async function all(){
 main.innerHTML=`<h2>Toutes les cartes</h2><div class="sub" id="cnt">Chargement…</div>
 <div class="bar"><input id="q" placeholder="Rechercher un article…" value="${q}"><select id="so" style="background:var(--sf2);border:1px solid #3a2f4d;color:var(--fg);border-radius:9px;padding:0 12px;font:inherit"><option value="rare" ${SO=="rare"?"selected":""}>Du plus rare au plus commun</option><option value="az" ${SO=="az"?"selected":""}>A → Z (toutes les raretés, communes comprises)</option></select>${groupSelectHTML()}</div>
 <div class="chips">${R.map((r,i)=>HID.has(i)?"":`<button class="chip ${fr.has(i)?"on":""}" style="background:${r[1]}" data-r="${i}">${r[0]}</button>`).join("")}</div>
 <div id="g" class="grid"><div class="msg">Chargement des 50 cartes…</div></div><div class="pag"><button class="btn g" id="pv">← Précédent</button><span id="pn">Page ${page}</span><button class="btn g" id="nx">Suivant →</button></div>`;
 const reset=()=>{page=1;cursors=[q?"s:0":CG?(SO=="az"?"c:0|":"r:0"):SO=="az"?"a:":"r:0"]};$("so").onchange=e=>{SO=e.target.value;reset();all()};$("cg").onchange=e=>{CG=e.target.value;reset();all()};
 $("q").onkeydown=e=>{if(e.key=="Enter"){q=e.target.value.trim();reset();all()}};
 main.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{const i=+b.dataset.r;fr.has(i)?fr.delete(i):fr.add(i);reset();all()});
 $("pv").onclick=()=>{page--;all();main.scrollTo(0,0)};$("nx").onclick=()=>{page++;all();main.scrollTo(0,0)};
 $("pv").disabled=page<2;$("nx").disabled=true;const cw=main.clientWidth;$("g").style.gridTemplateColumns="repeat("+(cw>=900?8:cw>=560?4:2)+",1fr)";
 try{if(!q&&SO=="rare"){try{await loadRank()}catch(rankErr){console.warn("Classement Wikipédia indisponible, utilisation du classement local.",rankErr);RANK=Object.values(col||{}).filter(c=>c&&c.t&&c.img&&!noImageTitle(c.t)).map(c=>({t:c.t,r:+c.r||0,v:+c.v||0,src:c.src||"wiki",cr:c.src==="cr"?c:null,g:inferCardCategory(c)}));RANK=(_sn=>RANK.filter(e=>{const k=nz2(e.t);if(_sn.has(k))return false;_sn.add(k);return true}))(new Set()).sort((a,b)=>b.r-a.r||b.v-a.v||String(a.t).localeCompare(String(b.t)));RANKSET=new Set(RANK.map(e=>e.t));buildCategoryStats(RANK)}const base=CG?RANK.filter(e=>e.g===CG):RANK;FL=fr.size?base.filter(e=>fr.has(e.r)):base}else if(q){await loadFilms()}const [r,tot]=await Promise.all([collect(cursors[page-1]),totalOf()]);
  if(!$("g")||tab!==1)return;cursors[page]=r.next;if(q&&page==1){const needle=q.toLowerCase();const local=[...FILMS.filter(f=>(f.t||"").toLowerCase().includes(needle)||(f.baseTitle||"").toLowerCase().includes(needle)),...CRE.filter(c=>c.t.toLowerCase().includes(needle)&&(!fr.size||fr.has(c.r)))];const seen=new Set();r.out=[...local,...r.out].filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true}).slice(0,PS)}
  $("g").innerHTML=r.out.length?r.out.map(card).join(""):'<div class="msg">Aucune carte avec image trouvée.</div>';bind($("g"));
  const SH=[.9,.08,.015,.004,.0008,.0003,.00005,.00001],frac=fr.size?Math.max(.0001,[...fr].reduce((s,i)=>s+SH[i],0)):1,rr=rawTot?imgTot/rawTot:.4,tp=(!q&&SO=="rare"&&fr.size&&!fr.has(0))?Math.max(page,Math.ceil(FL.length*.7/PS)):Math.max(page,Math.ceil((q?tot*rr:RANK.length*.8+Math.max(0,tot-RANK.length)*rr)*frac/PS));
  $("pn").textContent=`Page ${page.toLocaleString("fr-FR")} / ~${tp.toLocaleString("fr-FR")}`;if(CG)$("pn").textContent="Page "+page.toLocaleString("fr-FR")+" · "+CATGROUPS[CG].l;
  $("cnt").textContent=`${tot.toLocaleString("fr-FR")} cartes au catalogue · dont ${FILMS.length.toLocaleString("fr-FR")} films avec affiche · ${PS} cartes par page · ${SO=="az"?"ordre alphabétique · toutes les raretés":"classées de la plus rare à la plus commune"}${SO=="rare"&&fr.size?" · "+(fr.has(0)?"filtre actif":FL.length.toLocaleString("fr-FR")+" cartes dans ce filtre"):""}`;
  $("nx").disabled=r.next===null}
 catch(e){
 console.error("Wikipédia indisponible, bascule sur le catalogue local.",e);
 const local=await localCatalogFallback();
 if(!$("g")||tab!==1)return;
 $("g").innerHTML=local.length?local.map(card).join(""):'<div class="msg">Wikipédia est momentanément inaccessible. Aucun catalogue local disponible. <button class="btn g" id="rt">Réessayer</button></div>';
 bind($("g"));
 $("cnt").textContent=local.length?`${local.length.toLocaleString("fr-FR")} cartes locales disponibles · Wikipédia sera réessayé au prochain chargement.`:"Wikipédia indisponible";
 $("pn").textContent=`Page ${page}`;
 $("nx").disabled=true;
 $("rt")?.addEventListener("click",all);
}}
/* ===== ARGENT · MARCHÉ (IA) · CASINO ===== */
/* V136 : prix équitables et vivants.
   - base par rareté : un seul étage tout en haut (Légendaire holo full art ≈ 3 500 🪙, très peu de cartes dépassent 5 000)
   - chaque carte varie selon sa popularité (vues Wikipédia) autour de cette base
   - le cours bouge chaque jour (marche aléatoire stable : même résultat toute la journée, historique reconstructible sur 30 jours)
   - la demande des acheteurs (tendance de catégorie) s'y ajoute en direct */
const PRICE=[10,25,60,140,320,800,1800,3500];
const _ph=s=>{let n=2166136261;for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619)}n^=n>>>15;n=Math.imul(n,2246822507);n^=n>>>13;n=Math.imul(n,3266489909);n^=n>>>16;return(n>>>0)/4294967296};
const dayNow=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const _wc=new Map();
function walkArr(key,amp,from,to){const ck=key+"|"+amp+"|"+from+"|"+to;let r=_wc.get(ck);if(r)return r;
 const W=24;let x=0;const out=[];
 for(let d=from-W;d<=to;d++){x=.62*x+amp*(_ph(key+"#"+d)*2-1)*1.73;if(d>=from)out.push(x)}
 if(_wc.size>4000)_wc.clear();_wc.set(ck,out);return out}
const _gc=new Map();
function catOf(c){const k=c.id||c.pid;let g=_gc.get(k);if(g!==undefined)return g;try{g=inferCardCategory(c)||""}catch(e){g=""}if(_gc.size>60000)_gc.clear();_gc.set(k,g);return g}
function popF(c){if(c.src==="cr")return 1.15;if(c.src==="film")return 1;const v=+c.v;if(!(v>0)||v>1e10)return 1;return Math.max(.75,Math.min(1.4,.78+.2*(Math.log10(v)-4)))}
const _pdc=new Map();
function priceSeries(c,days){ // prix « du jour » (sans la demande en direct) pour les `days` derniers jours, aujourd'hui compris
 const t=dayNow(),from=t-days+1,key=String(c.pid||c.id||"x"),r=Math.max(0,Math.min(R.length-1,c.r)),g=catOf(c);
 const a=walkArr("c:"+key,.045*(1+.12*r),from,t),b=walkArr("g:"+g,.03,from,t),m=walkArr("all",.02,from,t),base=PRICE[r]*popF(c);
 return a.map((x,i)=>Math.max(1,Math.round(base*Math.exp(x+b[i]+m[i]))))}
function priceDay(c){const t=dayNow(),k=(c.pid||c.id)+"|"+c.r+"|"+t;let v=_pdc.get(k);if(v!==undefined)return v;
 v=priceSeries(c,1)[0];if(_pdc.size>60000)_pdc.clear();_pdc.set(k,v);return v}
const price=c=>{let tr=1;try{tr=trend(catOf(c))}catch(e){}return Math.max(1,Math.round(priceDay(c)*tr))};
/* historique (30 j) + statistiques de ventes de chaque carte */
const stKey=c=>String(c.pid||c.id);
function stRec(a){const c=a.c,k=stKey(c),t=dayNow(),e=MK.ST[k]||(MK.ST[k]={n:0,v:0,hi:0,lo:0,d:{},bids:0,mb:0,ms:0});
 e.n++;e.v+=a.b;e.hi=Math.max(e.hi,a.b);e.lo=e.lo?Math.min(e.lo,a.b):a.b;e.bids+=(a.hs||[]).length;e.ts=Date.now();e.last={u:a.w,p:a.b,ts:Date.now()};
 e.d[t]=(e.d[t]||0)+1;Object.keys(e.d).forEach(x=>{if(+x<t-14)delete e.d[x]});
 if(a.w==ME)e.mb++;if(a.s==ME)e.ms++;
 const ks=Object.keys(MK.ST);if(ks.length>500)ks.sort((x,y)=>(MK.ST[x].ts||0)-(MK.ST[y].ts||0)).slice(0,100).forEach(x=>delete MK.ST[x])}
function sparkSVG(arr,color,w,h){w=w||300;h=h||70;const lo=Math.min(...arr),hi=Math.max(...arr),sp=Math.max(1,hi-lo),px=i=>(i/(arr.length-1))*(w-8)+4,py=v=>h-8-((v-lo)/sp)*(h-16);
 const pts=arr.map((v,i)=>px(i).toFixed(1)+","+py(v).toFixed(1)).join(" ");
 return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block" role="img" aria-label="Cours sur ${arr.length} jours"><polygon points="4,${h-8} ${pts} ${w-4},${h-8}" fill="${color}" opacity=".13"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><circle cx="${px(arr.length-1)}" cy="${py(arr[arr.length-1])}" r="3.5" fill="${color}"/></svg>`}
function priceInfo(c){const ser=priceSeries(c,30),now=price(c);ser[ser.length-1]=now;const y=ser[ser.length-2]!=null?ser[ser.length-2]:now,dp=y?(now-y)/y*100:0;return{ser,now,dp,lo:Math.min(...ser),hi:Math.max(...ser),avg:Math.round(ser.reduce((s,x)=>s+x,0)/ser.length)}}
const fmtPct=d=>(d>=0?"▲ +":"▼ ")+Math.abs(d).toFixed(1).replace(".",",")+" %";
const pctCol=d=>d>=0?"#7ee29a":"#ff9a7a";
function marketBlock(c){const pi=priceInfo(c),col0=R[Math.max(0,Math.min(R.length-1,c.r))][1],e=MK.ST[stKey(c)],t=dayNow();
 const bars=(()=>{const a=[];for(let d=t-13;d<=t;d++)a.push(e&&e.d[d]||0);const mx=Math.max(1,...a);return `<div style="display:flex;align-items:flex-end;gap:5px;height:34px">${a.map(v=>`<i title="${v} vente(s)" style="flex:0 0 16px;background:${col0};opacity:${v?0.9:.18};height:${Math.max(3,Math.round(v/mx*34))}px;border-radius:2px"></i>`).join("")}</div>`})();
 return `<div class="sb2"><div><b>🪙 ${pi.now.toLocaleString("fr-FR")}</b><span>Cours du jour · <b style="color:${pctCol(pi.dp)}">${fmtPct(pi.dp)}</b></span></div><div><b>${pi.lo.toLocaleString("fr-FR")} – ${pi.hi.toLocaleString("fr-FR")}</b><span>Min – max sur 30 j</span></div></div>
 <div style="margin:8px 0 2px">${sparkSVG(pi.ser,col0,560,84)}</div><div class="sub" style="margin:0 0 10px;font-size:11px">Cours des 30 derniers jours (moyenne ${pi.avg.toLocaleString("fr-FR")} 🪙) · le prix change chaque jour et réagit à la demande des acheteurs.</div>
 <label class="lab">VENTES DANS TA PARTIE</label>${e?`<div class="sb2"><div><b>${e.n}</b><span>Achats (enchères conclues)</span></div><div><b>${Math.round(e.v/e.n).toLocaleString("fr-FR")} 🪙</b><span>Prix moyen payé</span></div></div><div class="sub">Plus haut ${e.hi.toLocaleString("fr-FR")} 🪙 · plus bas ${e.lo.toLocaleString("fr-FR")} 🪙 · ${e.bids} mises au total · volume ${e.v.toLocaleString("fr-FR")} 🪙${e.mb?` · tu l'as achetée ${e.mb}×`:""}${e.ms?` · tu l'as vendue ${e.ms}×`:""}</div><div class="sub">Dernière vente : ${e.last.p.toLocaleString("fr-FR")} 🪙 à ${nm(e.last.u)} · ${ago(e.last.ts)}</div><div class="sub" style="margin:8px 0 3px">Achats par jour (14 derniers jours)</div>${bars}`:`<div class="sub">Aucune vente de cette carte pour l'instant. Les statistiques se remplissent à chaque enchère conclue.</div>`}`}
function priceMini(c){const pi=priceInfo(c),col0=R[Math.max(0,Math.min(R.length-1,c.r))][1];
 return `<div class="abox" style="margin-top:12px"><div class="arow"><span>📈 Cours du jour</span><b>🪙 ${pi.now.toLocaleString("fr-FR")} <small style="color:${pctCol(pi.dp)}">${fmtPct(pi.dp)}</small></b></div>${sparkSVG(pi.ser,col0,420,60)}<div class="sub" style="margin:2px 0 0;font-size:11px">30 j : ${pi.lo.toLocaleString("fr-FR")} – ${pi.hi.toLocaleString("fr-FR")} 🪙</div></div>`}
/* onglet « Cours » : plus fortes hausses / baisses du jour et cartes les plus échangées */
function coursTab(){
 const seen=new Map();const add=c=>{if(c&&c.id&&c.img&&!seen.has(c.pid||c.id)&&seen.size<500){seen.set(c.pid||c.id,c)}};
 MK.A.forEach(a=>add(a.c));MK.H.forEach(x=>add(x.c));Object.values(col).forEach(add);
 const rows=[...seen.values()].map(c=>{const ser=priceSeries(c,2),now=price(c),y=ser[0],dp=y?(now-y)/y*100:0;store[c.id]=c;return{c,now,dp}});
 const row=x=>`<div class="off" data-oc="${String(x.c.id).replace(/"/g,"&quot;")}" style="cursor:pointer"><b style="color:${R[x.c.r][1]}">${R[x.c.r][0]}</b> · ${x.c.t} · <b>${x.now.toLocaleString("fr-FR")} 🪙</b> <span style="margin-left:auto;color:${pctCol(x.dp)};font-weight:800">${fmtPct(x.dp)}</span></div>`;
 const up=rows.slice().sort((a,b)=>b.dp-a.dp).slice(0,8),dn=rows.slice().sort((a,b)=>a.dp-b.dp).slice(0,8);
 const tr=Object.entries(MK.ST).sort((a,b)=>b[1].n-a[1].n).slice(0,8).map(([k,e])=>{const c=[...seen.values()].find(x=>String(x.pid||x.id)==k)||(MK.H.find(x=>String(x.c.pid||x.c.id)==k)||{}).c;if(!c)return"";store[c.id]=c;return `<div class="off" data-oc="${String(c.id).replace(/"/g,"&quot;")}" style="cursor:pointer"><b style="color:${R[c.r][1]}">${R[c.r][0]}</b> · ${c.t} · <b>${e.n}</b> vente(s) · moy. ${Math.round(e.v/e.n).toLocaleString("fr-FR")} 🪙 <span class="sub" style="margin:0 0 0 auto">${ago(e.ts)}</span></div>`}).join("");
 return `<div class="sub" style="margin:0 0 6px">Le prix de chaque carte change chaque jour. Clique sur une carte → onglet « Marché » pour voir son cours sur 30 jours et ses statistiques.</div>
 <h3 style="margin-top:14px">📈 Plus fortes hausses aujourd'hui</h3>${up.map(row).join("")||'<div class="sub">—</div>'}
 <h3 style="margin-top:22px">📉 Plus fortes baisses aujourd'hui</h3>${dn.map(row).join("")||'<div class="sub">—</div>'}
 <h3 style="margin-top:22px">🔥 Cartes les plus échangées</h3>${tr||'<div class="sub">Aucune vente enregistrée pour l\'instant.</div>'}`}
function upM(){$("mn").textContent="🪙 "+money.toLocaleString("fr-FR")}
const gain=n=>{money+=n;save();upM();if(n>=1)try{SFX.cash()}catch(e){wcDbg(e)}};
/* ===== ENCHÈRES (toi et des joueurs IA aux pseudos humains) ===== */
const DUR=[["10 min",6e5],["30 min",18e5],["1 h",36e5],["3 h",108e5],["6 h",216e5],["12 h",432e5]];
const ME="__me",MAXS=5;
const PSEUDOS=(()=>{const base="Willkoursk,floreal,yvan28,babarceleste,tibiz,jeunepousse2kk,sorrenuwu,Lavrano,M4rcelin,Ninon_b,xXPierreXx,cl0tilde,Kevinou75,Alizé_,mathis.d,Le_Gaulois,Pixelle,TheoBg,hugo_w,Camille.R,LaRoussette,DarkNono,zoe_cards,Bastos,Nadjib,Lucie2k4,Romain_V,ElFuego,mimi_chouette,Jules44,Sarah.k,Gaspard_,MaxouLeBoss,Inès_p,Tonio83,Mélusine,Zack_TV,Clem1,Oscar.m,Nolhan,Anaïs_r,LeGrosPat,Yannick.b,Célia_w,Dylan_49,Margaux,Kiki_le_Kid,RaphaelC,Louane.d,Amaury_,Théo.lcs,Manon_Gm,Sofiane07,Jade_pl".split(",");
 /* 2 945 pseudos supplémentaires, générés de façon déterministe (toujours les mêmes) */
 const F="Léo,Lucas,Hugo,Louis,Jules,Gabin,Adam,Nathan,Tom,Enzo,Noah,Liam,Ethan,Maël,Raphaël,Arthur,Paul,Victor,Axel,Kylian,Mathéo,Rayan,Ilyes,Yanis,Sacha,Timéo,Noé,Evan,Lény,Alexis,Quentin,Clément,Maxime,Antoine,Baptiste,Romain,Florian,Valentin,Dorian,Bastien,Emma,Léa,Chloé,Inès,Jade,Louise,Alice,Lina,Sarah,Manon,Camille,Lola,Zoé,Eva,Juliette,Anna,Rose,Nina,Clara,Léonie,Maëlys,Océane,Pauline,Marion,Laura,Margot,Elsa,Mila,Ambre,Lou,Yasmine,Nour,Sofia,Maya,Ayoub,Karim,Samir,Bilal,Idriss,Omar,Mehdi,Walid,Sami,Elias,Tiago,Diego,Marco,Luca,Matteo,Kevin,Dylan,Jordan,Steven,Théo,Mathis".split(",");
 const N="Loup,Panda,Dragon,Renard,Pixel,Ninja,Tigre,Faucon,Hibou,Lynx,Corbeau,Phoenix,Cobra,Koala,Yeti,Orage,Comète,Nova,Turbo,Zen,Retro,Cosmos,Lagune,Bambou,Sushi,Waffle,Crêpe,Churros,Raclette,Brioche,Baguette,Camembert,Mochi,Ramen,Gaufre,Cookie,Tonnerre,Mistral,Éclair,Volcan,Glacier,Rubis,Saphir,Onyx,Jade,Ambre,Cactus,Bison,Gecko,Albatros,Narval,Axolotl,Capybara,Mangouste,Fennec,Chouette,Marmotte,Hérisson,Pingouin".split(",");
 const A="Rapide,Sombre,Cosmic,Lunaire,Solaire,Furtif,Rusé,Sauvage,Mystic,Epic,Chill,Fou,Grand,Petit,Vieux,Neon,Glacé,Doré,Argenté,Bleu,Rouge,Noir,Blanc,Vert,Pourpre,Électrique,Magique,Secret,Royal,Lucky".split(",");
 let sd=20241007;const rnd=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296};
 const pick=a=>a[Math.floor(rnd()*a.length)],seen=new Set(base.map(x=>x.toLowerCase())),out=[];
 const fm=[()=>pick(F)+Math.floor(rnd()*99),()=>pick(F)+"_"+pick(N),()=>"xX"+pick(F)+"Xx",()=>pick(F)+"."+String.fromCharCode(97+Math.floor(rnd()*26)),()=>pick(N)+pick(A),()=>pick(A)+pick(N),()=>pick(N)+Math.floor(rnd()*999),()=>pick(F)+(1990+Math.floor(rnd()*16)),()=>pick(F).toLowerCase()+"_"+pick(N).toLowerCase(),()=>pick(N)+"_"+pick(F),()=>"The"+pick(N),()=>pick(F)+"Cards",()=>pick(N)+"Collect",()=>pick(F)+"_"+Math.floor(rnd()*99)];
 let g=0;while(out.length<2945&&g++<200000){const x=fm[Math.floor(rnd()*fm.length)]();if(x.length>16||seen.has(x.toLowerCase()))continue;seen.add(x.toLowerCase());out.push(x)}
 return base.concat(out)})();
const hs=x=>{let n=0;for(const ch of x)n=Math.imul(n,31)+ch.charCodeAt(0)|0;return n};
const pv=u=>.75+.5*h(hs(u)),ac=u=>.5+h(hs(u)+7); // avarice / activité de chaque joueur IA
const BOT_STYLE={
 Willkoursk:{m:1.14,a:1.25,s:0.82}, floreal:{m:1.08,a:1.10,s:0.55}, yvan28:{m:1.22,a:0.92,s:0.45}, babarceleste:{m:1.35,a:0.78,s:0.28}, tibiz:{m:1.16,a:1.35,s:0.72}, jeunepousse2kk:{m:1.28,a:0.62,s:0.18}, sorrenuwu:{m:1.12,a:1.45,s:0.90}, Lavrano:{m:1.20,a:1.05,s:0.40}, M4rcelin:{m:1.32,a:0.70,s:0.20}, Ninon_b:{m:1.10,a:1.20,s:0.62}, Kevinou75:{m:1.18,a:1.02,s:0.38}, Pixelle:{m:1.26,a:0.88,s:0.36}, TheoBg:{m:1.09,a:1.28,s:0.68}, hugo_w:{m:1.16,a:1.16,s:0.52}, "Camille.R":{m:1.24,a:0.96,s:0.44}, Le_Gaulois:{m:1.38,a:0.70,s:0.16}, DarkNono:{m:1.20,a:1.30,s:0.58}, zoe_cards:{m:1.30,a:1.00,s:0.34}, Bastos:{m:1.15,a:1.34,s:0.64}, Nadjib:{m:1.27,a:0.83,s:0.31}
};
const AUC_TARGET=240,AUC_PAGE=48;
let MK={A:[],H:[],W:[],PX:{},n:5,BB:{},BI:[],TR:{},TRt:0,ST:{}};
try{const x=JSON.parse(localStorage.getItem("wc_mk3")||"null");if(x&&x.A)MK={...MK,...x};
 else{const o=JSON.parse(localStorage.getItem("wc_mk2")||"null");if(o&&o.A){o.A.forEach(a=>{if(a.s==-1){if(a.w==-1)money+=a.b;const c={...a.c};col[c.id]=col[c.id]?{...col[c.id],n:col[c.id].n+1}:{...c,n:1}}else if(a.w==-1)money+=a.b});localStorage.removeItem("wc_mk2");save()}}}catch(e){wcDbg(e)}

// V81 : purge les cartes explicitement retirées des enchères sauvegardées.
try{
 const isBlocked=x=>x&&x.c&&isRemovedTitle(x.c.t);
 MK.A=(MK.A||[]).filter(a=>!isBlocked(a));MK.H=(MK.H||[]).filter(a=>!isBlocked(a));MK.W=(MK.W||[]).filter(a=>!isBlocked(a));
}catch(e){wcDbg(e)}
// V84 : retire aussi l'ancienne carte Wiki « Kameto » des enchères, sans toucher à la carte créateur.
try{
 const bad=a=>a&&a.c&&(()=>false)(a.c);
 MK.A=(MK.A||[]).filter(a=>!bad(a));MK.H=(MK.H||[]).filter(a=>!bad(a));MK.W=(MK.W||[]).filter(a=>!bad(a));
}catch(e){wcDbg(e)}
// V79 : supprime Norman Thavaud, doublon de Norman, dans la sauvegarde des enchères.
try{
 const isDup=c=>c&&DUPLICATE_TITLES.has(String(c.t||"").trim().toLowerCase());
 MK.A=(MK.A||[]).filter(x=>!isDup(x.c));MK.H=(MK.H||[]).filter(x=>!isDup(x.c));MK.W=(MK.W||[]).filter(x=>!isDup(x.c));
}catch(e){wcDbg(e)}
MK.W=MK.W||[];
// V80 : remet aussi les cartes d'enchères sur les 8 raretés actuelles.
try{
 const normMkCard=c=>{
  if(!c)return c;
  if(c.src=="cr"){const k=CRE.find(x=>x.pid==c.pid);if(k){c.r=k.r;c.id=k.id;c.url=k.url;if(k.lock){c.img=k.img;c.imgs=k.imgs;c.realImg=k.realImg}}}
  else{const nr=MR(c.r);if(nr!==c.r){c.r=nr;c.id=String(c.id).replace(/-\d+$/,"-"+nr)}}
  return c;
 };
 MK.A=(MK.A||[]).map(a=>({...a,c:normMkCard(a.c)}));MK.H=(MK.H||[]).map(a=>({...a,c:normMkCard(a.c)}));MK.W=(MK.W||[]).map(a=>({...a,c:normMkCard(a.c)}));
 MK.PX={};
}catch(e){wcDbg(e)}
const saveMk=()=>{try{/* on ne garde que tes enchères, tes mises, l'historique et les stats : les annonces des bots se régénèrent toutes seules */const sl=c=>{if(!c)return c;const x={...c};delete x.d;delete x.cats;return x};
 const o={...MK,A:MK.A.filter(a=>a.s==ME||a.mine||a.w==ME).map(a=>({...a,c:sl(a.c)})),H:(MK.H||[]).slice(0,60).map(x=>({...x,c:sl(x.c)})),W:(MK.W||[]).map(x=>({...x,c:sl(x.c)})),BI:(MK.BI||[]).map(x=>({...x,c:sl(x.c)}))};
 localStorage.setItem("wc_mk3",JSON.stringify(o))}catch(e){wcDbg(e)}};
// V74 : purge des anciennes annonces Zbb dans les enchères sauvegardées.
try{
 const isZbb=x=>x&&x.c&&["zbb","amine"].includes(String(x.c.t||"").trim().toLowerCase());
 MK.A=(MK.A||[]).filter(a=>!isZbb(a));
 MK.H=(MK.H||[]).filter(a=>!isZbb(a));
 MK.W=(MK.W||[]).filter(a=>!isZbb(a));
 saveMk();
}catch(e){wcDbg(e)}
const fair=c=>Math.max(1,Math.round(price(c)*.6+(MK.PX[c.r]||price(c))*.4));
/* V114 : toute carte défaussée rapporte 10 🪙, quelle que soit sa rareté */
const DISCARD_VALUE=10;
const dsc=c=>DISCARD_VALUE;
const SNIPE_MS=20000,RESET_MS=60000;
const nextBid=a=>a.w==null?a.st:Math.max(a.b+1,Math.ceil(a.b*1.05)),AID=()=>"a"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const nm=u=>u==ME?"Toi":u,ago=ts=>{const s=Math.max(0,Math.round((Date.now()-ts)/1e3));return s<60?"il y a "+s+" s":s<3600?"il y a "+Math.floor(s/60)+" min":s<86400?"il y a "+Math.floor(s/3600)+" h":"il y a "+Math.floor(s/86400)+" j"};
const dt=l=>{const s=Math.ceil(l/1e3),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+"h "+p2(m)+"m":m+"m "+p2(s%60)+"s"};
let TL=[];function toast(m){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}TL=[...TL.slice(-2),m];t.innerHTML=TL.join("<br>");t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>{t.classList.remove("on");TL=[]},5000)}
const addCard=c=>{const had=!!col[c.id];col[c.id]=had?{...col[c.id],n:col[c.id].n+1}:{...c,n:1};if(had)bumpDaily("dupe",1);if(c.src==="cr")bumpDaily("creator",1)};
// ===== MOTEUR D'ENCHÈRES IA : comportements différenciés, activité progressive et surenchères =====
/* V135 : marché vivant — 600+ acheteurs aux profils, goûts et budgets différents */
let AD=1;try{AD=Math.max(0,Math.min(2,+localStorage.getItem("wc_aucdiff")||1))}catch(e){AD=1}
const ADIFF=[{n:"Généreux",m:1.15,p:1.2},{n:"Normal",m:1,p:1},{n:"Difficile",m:.87,p:.8}];
const BOT_BUDGET={collector:[2000,14000],flipper:[3000,12000],sniper:[1500,8000],casual:[600,4000],whale:[30000,120000],lowball:[300,2000]};
const BOT_TYPE_LABEL={collector:"collectionneur",flipper:"revendeur",sniper:"sniper",casual:"occasionnel",whale:"gros portefeuille",lowball:"chasseur de bonnes affaires"};
const _bp={};
function botProfile(u){let p=_bp[u];if(p)return p;
 const base=BOT_STYLE[u]||{m:.9+pv(u)*.35,a:.7+ac(u)*.55,s:.35+h(hs(u)+17)*.45};
 const x=h(hs(u)+101),type=x<.30?"collector":x<.50?"flipper":x<.65?"sniper":x<.93?"casual":x<.97?"whale":"lowball";
 const keys=Object.keys(CATGROUPS).filter(k=>k!="adult"),fav=[keys[Math.floor(h(hs(u)+211)*keys.length)],keys[Math.floor(h(hs(u)+317)*keys.length)]];
 const B=BOT_BUDGET[type],budget=Math.round(B[0]+(B[1]-B[0])*h(hs(u)+419));
 return _bp[u]={...base,type,fav,budget}}
/* budget : se vide quand un acheteur gagne, se recharge en 12 h */
function botBudget(u,now){const p=botProfile(u),s=MK.BB[u];if(!s)return p.budget;const f=Math.min(1,Math.max(0,(now-s.t)/432e5));return Math.round(s.b+(p.budget-s.b)*f)}
function botSpend(u,v,now){const cur=botBudget(u,now);MK.BB[u]={b:Math.max(0,cur-v),t:now};const k=Object.keys(MK.BB);if(k.length>400)k.sort((x,y)=>MK.BB[x].t-MK.BB[y].t).slice(0,100).forEach(x=>delete MK.BB[x])}
/* catégorie d'une enchère + tendance du marché (la demande monte quand on se bat pour une catégorie, retombe avec le temps) */
const aCat=a=>a.g!==undefined?a.g:(a.g=(()=>{try{return inferCardCategory(a.c)||""}catch(e){return ""}})());
const trend=g=>(g&&MK.TR[g])||1;
const trendBump=(g,d)=>{if(!g)return;MK.TR[g]=Math.max(.85,Math.min(1.25,(MK.TR[g]||1)+d))};
function trendDecay(now){const dt=now-(MK.TRt||now);MK.TRt=now;if(dt<=0)return;const k=Math.exp(-dt/216e5);for(const g in MK.TR){MK.TR[g]=1+(MK.TR[g]-1)*k;if(Math.abs(MK.TR[g]-1)<.002)delete MK.TR[g]}}
function botCeil(a,u,now){
 const p=botProfile(u),f=fair(a.c),seed=h(hs(a.id+u)+Math.floor(now/12000));
 /* Chaque acheteur a une vraie "opinion" du prix : certains sous-évaluent,
   la plupart sont proches du marché, quelques collectionneurs surpaient. */
 let view;
 if(seed<.10)view=.64+h(hs(u+a.c.pid))*.18;         // lowball
 else if(seed<.88)view=.88+h(hs(a.id+u+37))*.28;      // marché
 else if(seed<.97)view=1.12+h(hs(u+a.id+91))*.30;      // coup de cœur
 else view=1.40+h(hs(u+a.id+173))*.32;            // gros surpaiement
 let cap=f*p.m*view*(.94+h(hs(u+String(Math.floor(now/60000))))*.12);
 if(a.c.r>=6)cap*=1.02+(.25*pv(u));
 if(a.c.r<=2&&h(hs(u+a.c.pid))<.22)cap*=.86;
 const g=aCat(a);
 if(p.type=="collector")cap*=p.fav.includes(g)?1.15+.3*h(hs(u+"f")):.92;
 else if(p.type=="flipper")cap*=.8;
 else if(p.type=="whale")cap*=1.4+.5*h(hs(u+"w"));
 else if(p.type=="lowball")cap*=.7;
 cap*=trend(g)*ADIFF[AD].m;
 return Math.max(f*.5,Math.round(cap));
}
function maybeBid(a,u,now){
 if(a.done||u==a.s||u==a.w)return false;
 a.cool=a.cool||{};a.hs=a.hs||[];
 const p=botProfile(u),left=a.end-now,nb=nextBid(a),cap=botCeil(a,u,now);
 if(nb>cap||nb>botBudget(u,now))return false;
 const first=a.w==null,g=aCat(a);
 const urgency=left<15000?2.8:left<45000?2.0:left<120000?1.25:.72;
 const listingAge=Math.min(1.8,1+Math.max(0,now-a.ts)/90000);
 const rivalry=a.w&&a.w!=u?1.32:1;
 const personal=Math.min(2.2,p.a*urgency*listingAge*rivalry);
 let probability=first?.095:Math.min(.52,.018*personal);
 if(p.type=="sniper")probability=left<14000?.55:probability*.06;
 else if(p.type=="collector")probability*=p.fav.includes(g)?1.7:.5;
 else if(p.type=="flipper"){if(first&&a.st<fair(a.c)*.6)probability*=1.5}
 else if(p.type=="whale")probability*=.6;
 else if(p.type=="lowball"&&first&&nb>fair(a.c)*.7)return false;
 probability=Math.min(.9,probability*ADIFF[AD].p);
 if(Math.random()>probability)return false;
 let aggression=Math.random()<.18?(1.025+Math.random()*.055):(1.002+Math.random()*.018);
 if(p.type=="whale")aggression=1.12+Math.random()*.23;      // grosse surenchère pour intimider
 else if(p.type=="sniper")aggression=1.01+Math.random()*.03;
 const amt=Math.min(cap,botBudget(u,now),Math.max(nb,Math.round(nb*aggression)));
 if(amt<nb||amt>cap)return false;
 if(a.w==ME){money+=a.b;toast(`🔔 ${u} te surenchérit sur « ${a.c.t} » : ${amt} 🪙`)}
 a.b=amt;a.w=u;a.n=(a.n||0)+1;a.hs.push({u,p:amt,ts:now});a.cool[u]=now+(1800+Math.floor(Math.random()*6500));
 if(a.end-now<SNIPE_MS)a.end=Math.max(a.end,now+RESET_MS);
 a.last=now;a.lastBidder=u;trendBump(g,.004);return true;
}
/* choisit quelques acheteurs parmi tous les profils, en favorisant ceux que la carte intéresse */
function pickBots(a,k,now){const g=aCat(a),left=a.end-now,c=[];
 for(let i=0;i<k*4;i++){const u=PSEUDOS[(Math.random()*PSEUDOS.length)|0];if(u==a.s||u==a.w||c.some(x=>x.u==u))continue;
  const p=botProfile(u);let sc=Math.random();
  if(p.type=="collector"&&p.fav.includes(g))sc+=1.2;
  if(p.type=="sniper"&&left<25000)sc+=1.5;
  if(p.type=="flipper"&&a.w==null&&a.st<fair(a.c)*.6)sc+=.8;
  c.push({u,sc})}
 return c.sort((x,y)=>y.sc-x.sc).slice(0,k).map(x=>x.u)}
/* pendant ton absence (onglet fermé / en veille) les acheteurs ont continué à enchérir */
function catchUp(a,now){
 const from=a.lastSim||a.t||now,span=Math.min(now,a.end)-from;
 if(span<30000)return false;
 const steps=Math.min(16,Math.ceil(span/30000));let ch=false;
 for(let i=1;i<=steps;i++){const vt=from+span*i/steps;if(a.done||a.end<=vt)break;
  pickBots(a,3,vt).forEach(u=>{if(vt>=(a.cool[u]||0)&&maybeBid(a,u,vt))ch=true})}
 return ch}
function simulate(){
 const now=Date.now();let ch=0;try{trendDecay(now)}catch(e){wcDbg(e)}
 MK.A.forEach(a=>{
  if(a.done)return;
  a.hs=a.hs||[];a.cool=a.cool||{};a.nextBot=a.nextBot||now+1200+Math.random()*3500;
  if(now-(a.lastSim||a.t||now)>=30000){try{if(catchUp(a,now))ch=1}catch(e){wcDbg(e)}}
  const left=Math.max(0,a.end-now);
  if(now>=a.nextBot&&left>0){
   const count=1+Math.floor(Math.random()*3);
   pickBots(a,count,now).forEach(u=>{if(now>=(a.cool[u]||0)&&maybeBid(a,u,now))ch=1});
   a.nextBot=now+2200+Math.random()*5200;
  }
  if(left>0&&left<SNIPE_MS&&Math.random()<.45){
   pickBots(a,2,now).forEach(u=>{if(now>=(a.cool[u]||0)&&maybeBid(a,u,now))ch=1});
  }
  a.lastSim=now;
  if(a.end<=now){
   a.done=1;ch=1;const c=a.c,rec={id:a.id,c,r:c.r,p:a.b,ts:a.end,s:a.s,u:a.w};
   if(a.w!=null){
    try{stRec(a)}catch(e){wcDbg(e)}
    MK.H.unshift(rec);MK.H.length=Math.min(MK.H.length,120);MK.PX[c.r]=Math.round((MK.PX[c.r]||a.b)*.8+a.b*.2);
    if(a.w!=ME){try{botSpend(a.w,a.b,now);const cc={...c};delete cc.n;MK.BI.push({u:a.w,c:cc,p:a.b,ts:now});if(MK.BI.length>60)MK.BI.shift()}catch(e){wcDbg(e)}}
    if(a.s==ME){const net=Math.round(a.b*.95);money+=net;toast(`Vendu : « ${c.t} » à ${a.w} pour ${a.b} 🪙 (frais 5 % → +${net})`)}
    if(a.w==ME){addCard(c);MK.W.unshift(rec);MK.W.length=Math.min(MK.W.length,60);toast(`🏆 Enchère remportée : « ${c.t} » pour ${a.b} 🪙`) }
   }else{trendBump(aCat(a),-.008);if(a.s==ME){addCard(c);MK.H.unshift(rec);toast(`Aucun acheteur pour « ${c.t} » : carte rendue.`)}}
  }
 });
 MK.A=MK.A.filter(a=>!a.done);if(ch){save();upM();saveMk()}return ch
}
/* revente : un acheteur qui a gagné une carte peut la remettre en vente plus tard, souvent plus cher */
function botResell(){
 const now=Date.now();if(!MK.BI.length)return;
 if(MK.A.filter(a=>!a.done&&a.s!=ME).length>=AUC_TARGET+25)return;
 let n=0;
 for(let i=MK.BI.length-1;i>=0&&n<2;i--){const b=MK.BI[i],p=botProfile(b.u);if(now-b.ts<36e4)continue;
  const pr=p.type=="flipper"?.25:p.type=="whale"?.04:p.type=="collector"?.03:.08;if(Math.random()>pr)continue;
  MK.BI.splice(i,1);const c=b.c,f=fair(c),d=[3e5,48e4,72e4,12e5,18e5][Math.floor(Math.random()*5)];
  const st=Math.max(1,Math.round(Math.max(b.p*(p.type=="flipper"?1.08+Math.random()*.3:.8+Math.random()*.4),f*.5)));
  store[c.id]=c;const a={id:AID(),c,s:b.u,st,b:st,w:null,n:0,hs:[],cool:{},end:now+d,t:now,ts:now,dur:d,nextBot:now+2000+Math.random()*8000,resale:1};
  MK.A.push(a);try{wlOnListed(a)}catch(e){wcDbg(e)}n++}
 if(n){saveMk();if(tab==3)paintMk(true)}
}
setInterval(()=>{try{botResell()}catch(e){wcDbg(e)}},30000);

/* ===== V100 : liste de souhaits + alertes d'enchères ===== */
let WL={},WLOG=[],WLU=0,WLV=0;
try{WL=JSON.parse(localStorage.getItem("wc_wish")||"{}")||{};WLOG=JSON.parse(localStorage.getItem("wc_wish_log")||"[]")||[];WLU=+localStorage.getItem("wc_wish_unread")||0}catch(e){WL={};WLOG=[]}
const saveWL=()=>{try{localStorage.setItem("wc_wish",JSON.stringify(WL));localStorage.setItem("wc_wish_log",JSON.stringify(WLOG.slice(0,40)));localStorage.setItem("wc_wish_unread",String(WLU))}catch(e){wcDbg(e)}};
const isW=c=>!!(c&&WL[c.pid]);
function wlBadge(){const b=$("t3");if(b)b.innerHTML="🔨 Enchères"+(WLU>0?` <span class="wlb" title="Alertes de ta liste de souhaits">⭐${WLU}</span>`:"")}
function toggleW(c){if(!c)return false;
 if(!WL[c.pid]&&ownN(c)>0){toast("Tu as déjà « "+c.t+" » : pas besoin de la suivre.");return false}
 if(WL[c.pid]){delete WL[c.pid];toast("⭐ « "+c.t+" » retirée de ta liste de souhaits.")}
 else{const k={...c};delete k.n;WL[c.pid]={c:k,ts:Date.now(),warned:{}};store[c.id]=c;MK.A.forEach(a=>{if(a.c.pid==c.pid)a.wl=1});toast("⭐ « "+c.t+" » ajoutée. Tu seras prévenue dès qu'elle est mise en vente.")}
 WLV++;saveWL();return isW(c)}
function wlAlert(a,kind){
 const w=WL[a.c.pid];if(!w)return;
 const cur=a.w==null?a.st:a.b;
 const msg=kind=="soon"?`⏰ « ${a.c.t} » (liste de souhaits) se termine bientôt · ${cur} 🪙`:`⭐ « ${a.c.t} » vient d'être mise en vente · dès ${cur} 🪙`;
 WLOG.unshift({pid:a.c.pid,t:a.c.t,k:kind,p:cur,ts:Date.now(),aid:a.id});WLOG.length=Math.min(WLOG.length,40);
 if(!(tab==3&&AV.tab=="w"))WLU++;
 WLV++;saveWL();wlBadge();toast(msg);try{SFX.reveal(Math.min(3,a.c.r))}catch(e){wcDbg(e)}
 try{if(document.hidden&&window.Notification&&Notification.permission=="granted")new Notification("WikiCollect",{body:msg.replace(/^[^ ]+ /,"")})}catch(e){wcDbg(e)}
}
function wlOnListed(a){if(a&&a.s!=ME&&WL[a.c.pid]){a.wl=1;wlAlert(a,"listed")}}
/* V112 : une carte de la liste de souhaits qu'on obtient (booster, enchère, fusion…) en est retirée automatiquement */
function wlPrune(){let ch=0;try{_own.t=0}catch(e){wcDbg(e)}
 Object.keys(WL).forEach(k=>{const w=WL[k];if(w&&w.c&&ownN(w.c)>0){delete WL[k];ch++;WLOG.unshift({pid:k,t:w.c.t,k:"got",p:0,ts:Date.now()});toast(`🎉 Tu as obtenu « ${w.c.t} » : retirée de ta liste de souhaits.`)}});
 if(ch){WLOG.length=Math.min(WLOG.length,40);WLV++;saveWL();try{if(tab==3)paintMk(true)}catch(e){wcDbg(e)}}return ch}
function wlTick(){
 wlPrune();
 const now=Date.now();let ch=0;
 MK.A.forEach(a=>{if(a.done||a.s==ME||!WL[a.c.pid])return;
  if(!a.wl){a.wl=1;wlAlert(a,"listed");ch=1}
  else if(a.end-now<120000&&a.end>now&&!a.wlSoon){a.wlSoon=1;wlAlert(a,"soon");ch=1}});
 if(ch)saveMk();
}
/* une carte suivie finit par apparaître : les acheteurs IA la mettent en vente de temps en temps */
function wlSpawn(){
 const now=Date.now();let n=0;
 Object.values(WL).forEach(w=>{
  const c=w.c;if(!c||!c.pid)return;
  if(MK.A.some(a=>!a.done&&a.c.pid==c.pid&&a.s!=ME))return;
  if(Math.random()>.1)return;
  const s=PSEUDOS[Math.floor(Math.random()*PSEUDOS.length)],f=fair(c);
  const d=[300000,420000,600000,900000,1800000,3600000][Math.floor(Math.random()*6)];
  const m=Math.random(),sf=m<.42?.30+Math.random()*.25:m<.72?.55+Math.random()*.22:m<.9?.77+Math.random()*.23:1+Math.random()*.4;
  const st=Math.max(1,Math.round(f*sf));store[c.id]=c;
  const a={id:AID(),c:{...c},s,st,b:st,w:null,n:0,hs:[],cool:{},end:now+d,t:now,ts:now,dur:d,nextBot:now+2000+Math.random()*9000};
  MK.A.push(a);wlOnListed(a);n++});
 if(n){saveMk();if(tab==3)paintMk(true)}
}
setInterval(()=>{try{wlSpawn()}catch(e){wcDbg(e)}},20000);
setInterval(()=>{try{wlTick()}catch(e){wcDbg(e)}},4000);
setTimeout(()=>{try{wlBadge();wlTick()}catch(e){wcDbg(e)}},1500);
function wishTab(){
 wlPrune();
 const L=Object.values(WL).sort((x,y)=>y.ts-x.ts);
 const sale=pid=>MK.A.find(a=>!a.done&&a.c.pid==pid&&a.s!=ME);
 const items=L.map(w=>{const c=w.c;store[c.id]=c;const a=sale(c.pid);
  return `<div class="at" ${a?`data-id="${a.id}" data-auid="${a.id}"`:""}>${card(c)}<div class="as">${a?`<b style="color:#7ee29a">En vente · ${a.w==null?a.st:a.b} 🪙</b><br><span class="cd" data-e="${a.end}"></span>`:`<span style="color:var(--mut)">Pas en vente pour l'instant</span>`}<div class="wll"><button class="btn g wlrm" data-p="${String(c.pid).replace(/"/g,"&quot;")}">Retirer</button></div></div></div>`}).join("");
 const lg=WLOG.slice(0,12).map(x=>`<div class="off">${x.k=="got"?"✅":x.k=="soon"?"⏰":"⭐"} « ${x.t} » ${x.k=="got"?"obtenue — retirée de ta liste":x.k=="soon"?"se termine bientôt":"mise en vente"}${x.k=="got"?"":` · <b>${x.p} 🪙</b>`} <span class="sub" style="margin:0 0 0 auto">${ago(x.ts)}</span></div>`).join("");
 const perm=window.Notification&&Notification.permission=="default"?`<button class="btn g" id="wlnotif">🔔 Activer les notifications du navigateur</button>`:"";
 return `<div class="sub" style="margin:0 0 12px">Suis une carte avec le bouton ⭐ sur sa fiche. Tu es prévenue quand elle est mise en vente (et quand son enchère se termine bientôt).</div>${perm}
 <div class="grid mg">${items||'<div class="msg">Ta liste est vide. Ouvre une carte (Toutes les cartes, Collection…) et clique sur « ⭐ Suivre ».</div>'}</div>
 <h3 style="margin-top:26px">Alertes récentes</h3>${lg||'<div class="sub">Aucune alerte pour le moment.</div>'}`}

/* ===== V111 : repère « déjà à toi » dans Toutes les cartes et Enchères ===== */
let _own={t:0,m:null};
function ownMap(){const now=Date.now();if(_own.m&&now-_own.t<1500)return _own.m;const m=new Map();
 Object.values(col).forEach(c=>{if(!c||!(c.n>0))return;const k=[c.id,c.pid,c.t?"t:"+String(c.t).toLowerCase():null];k.forEach(x=>{if(x)m.set(x,(m.get(x)||0)+c.n)})});_own={t:now,m};return m}
function ownN(c){if(!c)return 0;const m=ownMap();return Math.max(m.get(c.id)||0,c.pid?m.get(c.pid)||0:0,c.t?m.get("t:"+String(c.t).toLowerCase())||0:0)}
function markOwned(root){if(!root)return;_own.t=0;root.querySelectorAll(".card").forEach(e=>{if(e.classList.contains("isown"))return;const c=store[e.dataset.id],n=ownN(c);if(!n)return;
 e.classList.add("isown");const inn=e.querySelector(".in");if(inn&&!inn.querySelector(".ownb")){const b=document.createElement("span");b.className="ownb";b.textContent="✓ POSSÉDÉE"+(n>1?" ×"+n:"");inn.appendChild(b)}})}
/* bind = branche les cartes (image, effets) puis repère celles que tu possèdes déjà dans « Toutes les cartes » et « Enchères ». */
function bind(root,rm=true){bindCards(root,rm);try{if(root&&((root.id=="g"&&tab==1)||(root.id=="ah"&&tab==3)))markOwned(root)}catch(e){wcDbg(e)}}
/* V126 : « Plus récentes d'abord » = vraiment l'ordre d'obtention. Chaque carte reçoit une date quand elle arrive (ou quand un nouvel exemplaire arrive). */
let _ln=null;
function stampRecent(){if(!_ln)return;const now=Date.now();let k=0;Object.keys(col).forEach(id=>{const c=col[id];if(!c)return;const n=c.n||0,p=_ln[id];if(p===undefined||n>p)c.addedAt=now+(k++);_ln[id]=n});Object.keys(_ln).forEach(id=>{if(!col[id])delete _ln[id]})}
function stampInit(){const ids=Object.keys(col),base=Date.now()-1e9;_ln={};ids.forEach((id,i)=>{const c=col[id];if(!c)return;if(!c.addedAt)c.addedAt=base+i;_ln[id]=c.n||0})}
try{stampInit()}catch(e){console.warn("stampInit",e)}
/* V129 : copie complète de la collection dans IndexedDB. Si le stockage normal du navigateur était plein, on récupère cette copie au démarrage. */
(async()=>{try{const W=window.WCSAVE;if(!W){window.__colChecked=true;return}const r=await W.get("col");const lt=window.__LT0||0;
 if(r&&r.col&&((IDBONLY&&Object.keys(r.col).length>0)||(r.ls===false&&lt>0&&r.t>lt+1500))){const n=Object.keys(r.col).length;if(n>=Object.keys(col).length){col=r.col;try{hyd()}catch(e){wcDbg(e)}try{stampInit()}catch(e){wcDbg(e)}save();try{render()}catch(e){wcDbg(e)}if(!IDBONLY)try{toast("♻️ Collection récupérée depuis la copie de secours ("+n.toLocaleString("fr-FR")+" cartes)")}catch(e){wcDbg(e)}}}}catch(e){console.warn("récup collection",e)}window.__colChecked=true})();
let filling=false;
async function refill(){
 if(filling)return;
 const target=AUC_TARGET,bots=MK.A.filter(a=>a.s!=ME).length;
 if(bots>=target)return;
 filling=true;
 try{
  const seen=new Set(MK.A.map(a=>a.c.pid)),need=Math.min(target-bots,70),all=[],got=[];
  const addPool=c=>{
   if(c&&c.img&&!seen.has(c.pid)&&!all.some(x=>x.pid==c.pid))all.push(c)
  };
  Object.values(store).forEach(addPool);
  Object.values(col).forEach(addPool);
  /* V137 : source locale rapide = le catalogue exploré par le robot (aucune requête réseau) */
  try{if(window.wcCatalogV41&&window.wcCatalogV41.randomSample){const W=[44,26,15,8,4,2,.8,.2],tw=W.reduce((x,y)=>x+y,0),counts={};W.forEach((w,r)=>{counts[r]=Math.max(r>=5?3:6,Math.ceil(need*2.5*w/tw))});
   (await window.wcCatalogV41.randomSample(counts)).forEach(c=>{if(c&&c.img&&!isExcludedTitle(c.t)&&!noImageTitle(c.t)){store[c.id]=c;addPool(c)}})}}catch(e){wcDbg(e)}

  for(let k=0;k<2&&all.length<need*1.5;k++){
   const bs=(await Promise.all(
    Array.from({length:Math.max(1,Math.ceil((need*2-all.length)/8))},
     ()=>buildPack().catch(()=>[]))
   )).flat();
   bs.forEach(addPool);
  }

  const buckets=Array.from({length:R.length},()=>[]);
  all.forEach(c=>{if(buckets[c.r])buckets[c.r].push(c)});
  buckets.forEach(a=>a.sort(()=>Math.random()-.5));

  // Répartition volontairement très variée : beaucoup de Communes/Peu communes,
  // quelques cartes premium, et seulement une poignée de Légendaires.
  const RW=[44,26,15,8,4,2,.8,.2]; // le marché montre plus de cartes intéressantes que les boosters
  const totalW=RW.reduce((a,b)=>a+b,0);
  const weightedR=()=>{
   let x=Math.random()*totalW;
   for(let i=0;i<RW.length;i++){x-=RW[i];if(x<0)return i}
   return 0
  };

  while(got.length<need && all.length){
   let r=weightedR(),c=null;
   for(let step=0;step<R.length;step++){
    const rr=(r+step)%R.length;
    if(buckets[rr]&&buckets[rr].length){c=buckets[rr].pop();break}
   }
   if(!c)break;
   if(!seen.has(c.pid)){seen.add(c.pid);got.push(c)}
  }

  // Complément si une rareté ciblée n'est pas représentée dans les données chargées.
  for(const c of all){
   if(got.length>=need)break;
   if(c&&!seen.has(c.pid)){seen.add(c.pid);got.push(c)}
  }

  const now=Date.now();
  got.slice(0,need).forEach(c=>{
   const s=PSEUDOS[Math.floor(Math.random()*PSEUDOS.length)],f=fair(c);
   const dModes=[60000,90000,120000,150000,180000,240000,300000,420000,600000,900000,1200000,1800000,2700000,3600000,7200000];
   const d=dModes[Math.floor(Math.random()*dModes.length)];

   // Prix de départ : parfois très intéressant, parfois normal,
   // parfois trop haut. La base reste calculée sur la valeur réelle de la rareté.
   const mode=Math.random();
   let startFactor;
   if(mode<.42)startFactor=.30+Math.random()*.25;
   else if(mode<.72)startFactor=.55+Math.random()*.22;
   else if(mode<.90)startFactor=.77+Math.random()*.23;
   else if(mode<.975)startFactor=1.00+Math.random()*.28;
   else startFactor=1.28+Math.random()*.52;

   const startBid=Math.max(1,Math.round(f*startFactor));
   store[c.id]=c;
   const ends=now+d*(.85+.3*Math.random());
   const a={
    id:AID(),c,s,st:startBid,b:startBid,w:null,n:0,hs:[],cool:{},
    end:ends,t:now,ts:now-Math.floor(Math.random()*420000),
    dur:d,nextBot:now+(1800+Math.random()*13000)
   };

   if(Math.random()<.34){
    const u=PSEUDOS[Math.floor(Math.random()*PSEUDOS.length)];
    const first=Math.max(1,nextBid(a));
    a.b=first;a.w=u;a.n=1;
    a.hs.push({u,p:first,ts:now-Math.floor(2000+Math.random()*30000)});
    a.last=a.hs[0].ts;
    a.cool[u]=now+4000+Math.random()*9000;
   }
   MK.A.push(a);try{wlOnListed(a)}catch(e){wcDbg(e)}
  });
  saveMk()
 }catch(e){console.error(e)}finally{filling=false;try{const nb=MK.A.filter(a=>a.s!=ME).length;if(tab==3&&nb<AUC_TARGET&&nb>bots){clearTimeout(refill._t);refill._t=setTimeout(()=>{if(tab==3)refill().then(()=>paintMk(true)).catch(()=>{})},2500)}}catch(e){wcDbg(e)}}
}
const STP=v=>`<div class="stp"><button class="btn g" id="mi">−</button><span>🪙 <input id="sv" type="number" min="1" value="${v}"></span><button class="btn g" id="pl">+</button></div>`;
const wireStp=(min,step)=>{$("mi").onclick=()=>{$("sv").value=Math.max(min,(+$("sv").value||min)-step)};$("pl").onclick=()=>{$("sv").value=(+$("sv").value||min)+step}};
// ---- mettre une de mes cartes aux enchères ----
function openAuction(id){const c=store[id],own=c&&col[c.id];if(!own)return;
 if(MK.A.filter(a=>a.s==ME).length>=MAXS){M.style.display="flex";M.innerHTML=`<div class="mbox v2 auc"><button class="btn g x" id="mx">✕</button><h2>🔨 Limite atteinte</h2><div class="sub">Tu as déjà ${MAXS} ventes en cours. Attends la fin d'une enchère.</div></div>`;$("mx").onclick=closeModal;return}
 M.style.display="flex";let di=2;const f=fair(c),hist=MK.H.filter(x=>x.r==c.r&&x.u).slice(0,5).map(x=>x.p),rn=R[c.r][0],cl=R[c.r][1];
 M.innerHTML=`<div class="mbox v2 auc"><button class="btn g x" id="mx">✕</button><h2 style="margin:0">🔨 Mettre aux enchères</h2><div class="sub">Un exemplaire sera mis en réserve pour la durée de l'enchère.</div>
 <div class="mtop"><div class="mcard sm">${card(c)}</div><div class="minfo"><h3 style="margin:0 0 8px">${c.t}</h3><div class="sub">Valeur estimée ≈ <b>${f} 🪙</b> · <span style="color:${cl};font-weight:800">${rn}</span>${hist.length?` · dernières ventes (${R[c.r][0]}) : ${hist.join(", ")} 🪙`:""}</div><div class="sub" style="margin-top:6px">Les joueurs n'enchérissent que sous leur estimation : une mise de départ trop haute ne trouvera pas d'acheteur. Frais de vente : 5 %.</div></div></div>
 <label class="lab">MISE DE DÉPART</label>${STP(Math.max(1,Math.round(f*.7)))}<label class="lab">DURÉE</label><div class="dch">${DUR.map((d,i)=>`<button class="dchip ${i==di?"on":""}" data-i="${i}">${d[0]}</button>`).join("")}</div>
 <div class="mbot"><button class="btn g" id="cn">Annuler</button><button class="btn" id="go">Lancer l'enchère</button></div></div>`;
 wireStp(1,Math.max(1,Math.round(f*.05)));$("mx").onclick=$("cn").onclick=closeModal;
 M.querySelectorAll(".dchip").forEach(b=>b.onclick=()=>{di=+b.dataset.i;M.querySelectorAll(".dchip").forEach(x=>x.classList.toggle("on",x==b))});
 $("go").onclick=()=>{const st=Math.max(1,Math.floor(+$("sv").value)||1),e=col[c.id];if(!e)return closeModal();if(MK.A.filter(a=>a.s==ME).length>=MAXS)return toast("Limite de "+MAXS+" ventes atteinte.");
  e.n>1?e.n--:delete col[c.id];const cc={...c};delete cc.n;const now=Date.now();MK.A.push({id:AID(),c:cc,s:ME,st,b:st,w:null,n:0,hs:[],end:now+DUR[di][1],t:now,ts:now,dur:DUR[di][1]});save();saveMk();closeModal();toast(`Enchère lancée : « ${c.t} » (${DUR[di][0]})`);AV.tab="v";AV.d=null;tab=3;render()}}
function pickSell(){M.style.display="flex";const L=Object.values(col).sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t));L.forEach(c=>store[c.id]=c);
 M.innerHTML=`<div class="mbox v2 auc"><button class="btn g x" id="mx">✕</button><h2 style="margin:0">Choisis une carte à vendre</h2><div class="grid lg" id="pk" style="--n:4">${L.length?L.map(card).join(""):'<div class="msg">Ta collection est vide.</div>'}</div></div>`;$("mx").onclick=closeModal;
 bind($("pk"),false);$("pk").querySelectorAll(".card").forEach(e=>e.onclick=()=>{closeModal();openAuction(e.dataset.id)})}
// ---- page Enchères ----
let AV={tab:"b",q:"",sort:"new",fr:new Set(),d:null,hideOwn:false,page:0};
const tile=a=>{store[a.c.id]=a.c;const cur=a.w==null?a.st:a.b;
 return `<div class="at" data-id="${a.id}" data-auid="${a.id}">${WL[a.c.pid]?'<div class="wst" title="Dans ta liste de souhaits">⭐</div>':""}${card(a.c)}<div class="ar"><div><small data-au-label="price-label">${a.w==null?"MISE DE DÉPART":"MISE ACTUELLE"}</small><b data-au-price>🪙 ${cur}</b></div><div style="text-align:right"><small>⏱ DURÉE</small><b class="cd" data-e="${a.end}"></b></div></div><div class="as"><span data-au-status>${a.s==ME?"Ta vente":"Vendu par "+a.s+(a.resale?" ♻ revente":"")}${a.w?` · ${a.w==ME?"<b style='color:#7ee29a'>tu mènes</b>":"👑 "+a.w}`:""}${a.mine&&a.w!=ME?" · <b style='color:#ff9a7a'>surenchéri</b>":""}</span></div></div>`};
const SORTS={new:["Récemment listées",(x,y)=>y.ts-x.ts],end:["Se termine bientôt",(x,y)=>x.end-y.end],pa:["Prix croissant",(x,y)=>(x.w==null?x.st:x.b)-(y.w==null?y.st:y.b)],pd:["Prix décroissant",(x,y)=>(y.w==null?y.st:y.b)-(x.w==null?x.st:x.b)],rar:["Rareté",(x,y)=>y.c.r-x.c.r]};
const aucViewSig=()=>AV.page+"|"+WLV+"|"+(AV.hideOwn?1:0)+"|"+AV.tab+"|"+AV.d+"|"+AV.q+"|"+AV.sort+"|"+[...AV.fr].join(",");
let mkViewSig="";
function paintMk(force){if(!$("ah"))return;const viewSig=aucViewSig();
 if(force||viewSig!==mkViewSig){mkViewSig=viewSig;if(AV.d){detailPage()}else listPage()}
 updateAuctionDom();
}
function updateAuctionDom(){
 const now=Date.now();
 main.querySelectorAll(".cd").forEach(e=>{const l=+e.dataset.e-now;e.textContent=l>0?dt(l):"Terminée"});
 main.querySelectorAll("[data-auid]").forEach(el=>{
  const a=MK.A.find(x=>x.id===el.dataset.auid);if(!a||a.done)return;
  const price=el.querySelector("[data-au-price]"),label=el.querySelector("[data-au-label='price-label']"),status=el.querySelector("[data-au-status]");
  if(price)price.textContent="🪙 "+(a.w==null?a.st:a.b);
  if(label)label.textContent=a.w==null?"MISE DE DÉPART":"MISE ACTUELLE";
  if(status){status.innerHTML=`${a.s==ME?"Ta vente":"Vendu par "+a.s+(a.resale?" ♻ revente":"")}${a.w?` · ${a.w==ME?"<b style='color:#7ee29a'>tu mènes</b>":"👑 "+a.w}`:""}${a.mine&&a.w!=ME?" · <b style='color:#ff9a7a'>surenchéri</b>":""}`}
 });
 const tl=$("atl"),a=AV.d&&MK.A.find(x=>x.id==AV.d&&!x.done);if(tl&&a){const l=a.end-now;tl.textContent=l>0?"Se termine dans "+dt(l):"Terminée"}
}
function mktInfo(){try{const t=Object.entries(MK.TR||{}).filter(([g,v])=>CATGROUPS[g]&&Math.abs(v-1)>=.015).sort((x,y)=>Math.abs(y[1]-1)-Math.abs(x[1]-1)).slice(0,4).map(([g,v])=>`${CATGROUPS[g].l} ${v>1?'<b style="color:#7ee29a">▲ +':'<b style="color:#ff9a7a">▼ '}${Math.round((v-1)*100)} %</b>`);
 return `👥 ${PSEUDOS.length} acheteurs actifs · `+(t.length?"Demande : "+t.join(" · "):"marché calme")}catch(e){return ""}}
function listPage(){
 const A=MK.A.filter(a=>!a.done),mineS=A.filter(a=>a.s==ME),mineB=A.filter(a=>a.mine),myH=MK.H.filter(x=>x.s==ME||x.u==ME);
 const tabs=[["b","Parcourir"],["v",`Mes ventes (${mineS.length}/${MAXS})`],["e","Mes enchères"],["g",`Gagnées (${MK.W.length})`],["h",`Historique (${myH.length})`],["w",`⭐ Souhaits (${Object.keys(WL).length})`],["m","📈 Cours"]];
 let body="";
 if(AV.tab=="b"){let L=A.filter(a=>a.s!=ME&&(!AV.q||a.c.t.toLowerCase().includes(AV.q.toLowerCase()))&&(!AV.fr.size||AV.fr.has(a.c.r))&&(!AV.hideOwn||!ownN(a.c))).sort(SORTS[AV.sort][1]);
  const NP=Math.max(1,Math.ceil(L.length/AUC_PAGE));if(AV.page>NP-1)AV.page=NP-1;if(AV.page<0)AV.page=0;const PL=L.slice(AV.page*AUC_PAGE,(AV.page+1)*AUC_PAGE);
  body=`<div class="bar"><input id="aq" placeholder="Rechercher une carte…" value="${AV.q}"><button class="btn" id="ago">🔍 Rechercher</button><button class="btn g ${AV.hideOwn?"on":""}" id="aown" title="Cache les cartes que tu possèdes déjà">${AV.hideOwn?"✓ ":""}Masquer celles que j'ai déjà</button><select id="asr">${Object.entries(SORTS).map(([k,v])=>`<option value="${k}" ${k==AV.sort?"selected":""}>${v[0]}</option>`).join("")}</select><select id="adf" title="Difficulté du marché : plus c'est dur, moins les acheteurs paient cher">${ADIFF.map((d,i)=>`<option value="${i}" ${i==AD?"selected":""}>Marché : ${d.n}</option>`).join("")}</select></div>
  <div class="sub" style="margin:0 0 8px">${mktInfo()}</div>
  <div class="chips">${R.map((r,i)=>HID.has(i)?"":`<button class="chip ${AV.fr.has(i)?"on":""}" style="background:${r[1]}" data-r="${i}">${SYM[i]} ${r[0]}</button>`).join("")}</div>
  <div class="sub" style="margin:0 0 8px"><b>${L.length.toLocaleString("fr-FR")}</b> enchère${L.length>1?"s":""} en cours${NP>1?` · page ${AV.page+1} / ${NP}`:""}</div><div class="grid mg">${L.length?PL.map(tile).join(""):'<div class="msg">Aucune enchère ne correspond.</div>'}</div>
  ${NP>1?`<div class="pag"><button class="btn g" id="apv" ${AV.page<1?"disabled":""}>← Précédent</button><span id="apn">Page ${AV.page+1} / ${NP}</span><button class="btn g" id="anx" ${AV.page>=NP-1?"disabled":""}>Suivant →</button></div>`:""}
  <h3 style="margin-top:26px">Dernières ventes</h3>${MK.H.filter(x=>x.u).slice(0,10).map(x=>`<div class="off">${x.c.t} · <b style="color:${R[x.r][1]}">${R[x.r][0]}</b> · <b>${x.p} 🪙</b> · ${nm(x.u)} <span class="sub" style="margin:0">(vendeur : ${nm(x.s)} · ${ago(x.ts)})</span></div>`).join("")||'<div class="sub">Aucune vente pour le moment.</div>'}`}
 else if(AV.tab=="v")body=`<div class="bar"><button class="btn" id="sell">➕ Mettre une carte aux enchères</button><span class="sub" style="align-self:center;margin:0">Frais de vente 5 % · ${MAXS} ventes max en même temps</span></div><div class="grid mg">${mineS.sort((x,y)=>x.end-y.end).map(a=>tile(a)+"").join("")||'<div class="msg">Aucune vente en cours. Mets une carte de ta collection aux enchères.</div>'}</div>`;
 else if(AV.tab=="e")body=`<div class="grid mg">${mineB.sort((x,y)=>x.end-y.end).map(tile).join("")||'<div class="msg">Tu n\'as misé sur aucune enchère.</div>'}</div>`;
 else if(AV.tab=="g")body=`<div class="grid mg">${MK.W.map(x=>{store[x.c.id]=x.c;return `<div class="at">${card(x.c)}<div class="as">Gagnée pour <b>${x.p} 🪙</b> · ${ago(x.ts)}<br>Vendeur : ${nm(x.s)}</div></div>`}).join("")||'<div class="msg">Tu n\'as encore rien gagné.</div>'}</div>`;
 else if(AV.tab=="m")body=coursTab();
 else if(AV.tab=="w"){body=wishTab();if(WLU){WLU=0;saveWL();wlBadge()}}
 else body=myH.map(x=>`<div class="off">${x.s==ME?(x.u?`💰 Vendue à <b>${x.u}</b> pour <b>${x.p} 🪙</b>`:"↩ Invendue"):`🛒 Achetée à <b>${nm(x.s)}</b> pour <b>${x.p} 🪙</b>`} · « ${x.c.t} » <b style="color:${R[x.r][1]}">${R[x.r][0]}</b> <span class="sub" style="margin:0">${ago(x.ts)}</span></div>`).join("")||'<div class="sub">Aucun historique.</div>';
 $("ah").innerHTML=`<div class="tabs2">${tabs.map(t=>`<button class="${AV.tab==t[0]?"on":""}" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>${body}`;
 $("ah").querySelectorAll(".tabs2 button").forEach(b=>b.onclick=()=>{AV.tab=b.dataset.t;AV.page=0;paintMk(true)});
 if($("aq")){const go=()=>{AV.q=$("aq").value.trim();AV.page=0;paintMk(true)};$("aq").onkeydown=e=>{if(e.key=="Enter")go()};$("ago").onclick=go;$("aown").onclick=()=>{AV.hideOwn=!AV.hideOwn;AV.page=0;paintMk(true)};$("asr").onchange=e=>{AV.sort=e.target.value;AV.page=0;paintMk(true)};if($("apv"))$("apv").onclick=()=>{AV.page--;paintMk(true);main.scrollTo(0,0)};if($("anx"))$("anx").onclick=()=>{AV.page++;paintMk(true);main.scrollTo(0,0)};$("adf").onchange=e=>{AD=+e.target.value;try{localStorage.setItem("wc_aucdiff",String(AD))}catch(x){wcDbg(x)}paintMk(true)};
  $("ah").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{const i=+b.dataset.r;AV.fr.has(i)?AV.fr.delete(i):AV.fr.add(i);AV.page=0;paintMk(true)})}
 if($("sell"))$("sell").onclick=pickSell;
 $("ah").querySelectorAll(".wlrm").forEach(b=>b.onclick=e=>{e.stopPropagation();const p=b.dataset.p;if(WL[p]){delete WL[p]}else{const k=Object.keys(WL).find(x=>String(x)==p);if(k)delete WL[k]}WLV++;saveWL();paintMk(true)});
 $("ah").querySelectorAll("[data-oc]").forEach(e=>e.onclick=()=>openModal(e.dataset.oc));
 if($("wlnotif"))$("wlnotif").onclick=()=>{try{Notification.requestPermission().then(()=>paintMk(true))}catch(e){wcDbg(e)}};
 bind($("ah"),false);$("ah").querySelectorAll(".at").forEach(t=>{const cd=t.querySelector(".card");if(cd)cd.onclick=null;if(t.dataset.id)t.onclick=()=>{AV.d=t.dataset.id;paintMk(true)}})}
function detailPage(){const a=MK.A.find(x=>x.id==AV.d&&!x.done);
 if(!a){AV.d=null;return listPage()}
 store[a.c.id]=a.c;const mine=a.s==ME,cur=a.w==null?a.st:a.b,nb=nextBid(a),f=fair(a.c),hs=(a.hs||[]).slice().reverse();
 const box=mine?`<div class="abox"><div class="arow"><span>Valeur estimée</span><b>≈ ${f} 🪙 <small style="color:var(--mut)">(${Math.round(f*.8)}–${Math.round(f*1.25)})</small></b></div><div class="arow"><span>Si l'enchère s'arrêtait maintenant</span><b style="color:#7ee29a">${a.w==null?"aucune mise":"+"+Math.round(a.b*.95)+" 🪙 (après 5 % de frais)"}</b></div>${a.n==0?`<button class="btn g" id="acn" style="margin-top:10px">Annuler l'enchère (aucune mise)</button>`:""}</div>`
 :`<div class="abox"><div class="arow"><span>Votre solde : <b style="color:var(--fg)">${money.toLocaleString("fr-FR")}</b> pièces</span><span>Mise minimum : <b style="color:var(--fg)">${nb}</b></span></div><div class="abid">${STP(nb)}<button class="btn" id="abd">Miser</button></div>${a.w==ME?`<div class="sub" style="color:#7ee29a;margin:8px 0 0">Tu mènes avec ${a.b} 🪙 — ta mise actuelle te sera rendue si tu surenchéris.</div>`:""}<div class="sub" style="font-size:11px;margin:10px 0 0">La mise est débitée de votre solde immédiatement. Si vous êtes surenchéri, elle vous est intégralement remboursée. Une mise dans les 20 dernières secondes remet le chronomètre à 1 minute.</div></div>`;
 $("ah").innerHTML=`<div class="bkl" id="abk">← Retour aux enchères</div><div class="ad"><div class="adl">${card(a.c)}</div><div class="adr"><h2 style="margin:0">${a.c.t}</h2>${ownN(a.c)?`<div class="ownline">✓ Tu as déjà cette carte (×${ownN(a.c)})</div><br>`:""}<button class="btn g wlbtn ${isW(a.c)?"on":""}" id="wlD" style="margin-top:8px">${isW(a.c)?"⭐ Suivie":"☆ Suivre cette carte"}</button><div class="sub" style="margin:4px 0 14px">${mine?"Ta vente":"Mis en vente par <b style='color:var(--ac)'>"+a.s+"</b>"}</div>
 <div class="abox"><div class="arow"><span>${a.w==null?"MISE DE DÉPART":"MISE ACTUELLE"}</span><b class="big">🪙 ${cur}</b></div>${a.w?`<div class="arow"><span>Meilleur enchérisseur</span><b>${a.w==ME?"Toi":"👑 "+a.w}</b></div>`:""}<div class="arow"><span>🔨 Temps restant</span><b id="atl"></b></div></div>${box}${priceMini(a.c)}
 <h4 class="lab" style="margin-top:22px">HISTORIQUE DES MISES (${hs.length})</h4>${hs.length?hs.map(x=>`<div class="off"><b>${nm(x.u)}</b> a misé <b>${x.p} 🪙</b> <span class="sub" style="margin:0 0 0 auto">${ago(x.ts)}</span></div>`).join(""):'<div class="sub">Aucune mise placée pour l\'instant.</div>'}</div></div>`;
 $("abk").onclick=()=>{AV.d=null;paintMk(true)};bind($("ah"),false);const cd=$("ah").querySelector(".card");if(cd)cd.onclick=()=>openModal(a.c.id);
 if($("wlD"))$("wlD").onclick=()=>{toggleW(a.c);paintMk(true)};
 if($("acn"))$("acn").onclick=()=>{MK.A=MK.A.filter(x=>x!==a);addCard(a.c);save();saveMk();toast("Enchère annulée, carte rendue.");AV.d=null;paintMk(true)};
 if($("abd")){wireStp(nb,Math.max(1,Math.round(nb*.05)));$("abd").onclick=()=>{simulate();const b=MK.A.find(x=>x.id==a.id);if(!b){toast("Cette enchère est terminée.");AV.d=null;return paintMk(true)}
  const v=Math.floor(+$("sv").value)||0,mn=nextBid(b);if(v<mn)return toast("Mise trop basse (minimum "+mn+" 🪙).");if(v>money+(b.w==ME?b.b:0))return toast("Pas assez de pièces.");
  if(b.w==ME)money+=b.b;money-=v;b.b=v;b.w=ME;b.n++;b.mine=1;b.hs.push({u:ME,p:v,ts:Date.now()});if(b.end-Date.now()<SNIPE_MS)b.end=Math.max(b.end,Date.now()+RESET_MS);save();saveMk();upM();toast("Mise de "+v+" 🪙 placée.");paintMk(true)}}}
let tk=0;
async function market(){
 MK.n=main.clientWidth>=1150?12:main.clientWidth>=850?8:main.clientWidth>=560?4:2;
 main.style.setProperty("--n",MK.n);
 simulate();tk=0;
 // Affiche immédiatement les enchères déjà en mémoire : le remplissage IA ne doit jamais bloquer l'ouverture du marché.
 main.innerHTML=`<h2>🔨 Enchères <span class="botdot">marché en direct</span></h2><div class="sub">Enchéris sur des cartes ou vends les tiennes contre des pièces. Les acheteurs IA peuvent se surenchérir entre eux, avec des enchères qui évoluent en direct.</div><div id="ah"></div>`;
 paintMk(true);
 // Le remplissage lourd se fait après le premier rendu, en arrière-plan.
 setTimeout(()=>{if(tab!==3)return;refill().then(()=>{if(tab===3)paintMk(true)}).catch(e=>console.warn("refill marché",e))},0);
 timer=setInterval(()=>{if(tab!=3)return;simulate();paintMk(false);if(++tk%30==0)refill().then(()=>paintMk(true)).catch(()=>{})},1000)}
setInterval(()=>{try{if(tab!=3)simulate();else {simulate();updateAuctionDom()}}catch(e){wcDbg(e)}},15000);
const take=b=>{b=Math.floor(b);if(!(b>=1)||b>money){try{SFX.error()}catch(e){wcDbg(e)}alert("Mise invalide ou pas assez de pièces.");return 0}money-=b;SFX.bet();WCJ+=Math.max(1,Math.floor(b*.02));bumpDaily("casino",1);save();saveJ();upM();return b};
const alive=id=>!!$(id);
/* V99 : ancienne version de casino() supprimée (elle était écrasée par la suivante) */
const bk=()=>`<button class="btn g" id="bk" style="margin-bottom:14px">← Retour au casino</button>`;()=>`<button class="btn g" id="bk" style="margin-bottom:14px">← Retour au casino</button>`;
/* ---------- MINES ---------- */
function mines(){
 let G=null;
 main.innerHTML=`${bk()}<h2>💣 Mines</h2><div class="sub">25 cases. Découvre des 💎 sans toucher une mine 💣 : chaque case sûre augmente ton gain et tu peux encaisser à tout moment. Retour ≈ 97 %. Si tu quittes la partie en cours, la mise est perdue.</div>
 <div class="bar"><input id="mb" type="number" min="1" value="50" style="width:120px"><select id="mm">${[1,3,5,10,15,20,24].map(v=>`<option value="${v}" ${v==3?"selected":""}>${v} mine${v>1?"s":""}</option>`).join("")}</select><button class="btn" id="mgo">Jouer</button><button class="btn g" id="mcash" disabled>Encaisser</button></div>
 <div id="mst" class="sub"></div><div class="mg5" id="mgrid"></div>`;
 $("bk").onclick=()=>casino();
 const mult=(k,m)=>{let p=1;for(let i=0;i<k;i++)p*=(25-m-i)/(25-i);return .97/p};
 const paint=()=>{$("mgrid").innerHTML=Array.from({length:25},(_,i)=>{const o=G&&G.open.has(i),b=G&&G.over&&G.mines.has(i);return `<button class="mc ${o?"ok":b?"bm":""}" data-i="${i}">${o?"💎":b?"💣":""}</button>`}).join("");
  const k=G?G.open.size:0;$("mcash").disabled=!G||G.over||k==0;$("mgo").disabled=!!G&&!G.over;
  if(G&&!G.over)$("mst").innerHTML=`Mise ${G.b} 🪙 · gain actuel <b>${Math.floor(G.b*mult(k,G.m))} 🪙</b> (×${mult(k,G.m).toFixed(2)})${k<25-G.m?" · prochaine case ×"+mult(k+1,G.m).toFixed(2):""}`};
 const cash=()=>{if(!G||G.over||!G.open.size)return;const w=Math.floor(G.b*mult(G.open.size,G.m));G.over=true;gain(w);paint();$("mst").textContent="✅ Encaissé : +"+w+" 🪙 (×"+mult(G.open.size,G.m).toFixed(2)+")"};
 $("mgo").onclick=()=>{if(G&&!G.over)return;const b=take(+$("mb").value);if(!b)return;const m=+$("mm").value,mines=new Set();while(mines.size<m)mines.add(Math.floor(Math.random()*25));G={b,m,mines,open:new Set(),over:false};paint()};
 $("mcash").onclick=cash;
 $("mgrid").onclick=e=>{const c=e.target.closest(".mc");if(!c||!G||G.over)return;const i=+c.dataset.i;if(G.open.has(i))return;
  if(G.mines.has(i)){try{SFX.mineBoom()}catch(e){wcDbg(e)}G.over=true;paint();$("mst").textContent="💥 Mine ! Tu perds "+G.b+" 🪙";return}
  G.open.add(i);try{SFX.gem()}catch(e){wcDbg(e)}paint();if(G.open.size==25-G.m)cash()};
 paint()}

/* ---------- PILE OU FACE ---------- */
/* V99 : ancienne version de coinflip() supprimée (elle était écrasée par la suivante) */
/* ---------- DOUBLE OU RIEN ---------- */
/* V99 : ancienne version de doublegame() supprimée (elle était écrasée par la suivante) */

/* ---------- CARD UPGRADE ---------- */
function cardupgrade(){
 let stakeId=null,targetId=null,busy=false,history=[],multiplier=1;
 const owned=()=>Object.values(col).filter(c=>c&&c.n>0).sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t));
 const known=()=>{const m=new Map();Object.values(store).forEach(c=>{if(c&&c.id&&c.img)m.set(c.id,c)});Object.values(col).forEach(c=>{if(c&&c.id&&c.img)m.set(c.id,c)});return [...m.values()].sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t))};
 const val=c=>Math.max(1,price(c));
 const chance=(a,b)=>{const ratio=val(b)/Math.max(1,val(a));const base=96/Math.pow(ratio,.72);return Math.max(1,Math.min(95,Math.round(base/multiplier))) };
 const filtered=(arr,term)=>{term=(term||'').trim().toLowerCase();return term?arr.filter(c=>c.t.toLowerCase().includes(term)):arr};
 const mini=(c,kind)=>`<button class="csi ${kind==='s'&&c.id===stakeId||kind==='t'&&c.id===targetId?'sel':''}" data-${kind}="${c.id}"><img src="${c.img}" referrerpolicy="no-referrer"><span><b>${c.t}</b><small>${R[c.r][0]}</small></span><span class="v">${val(c).toLocaleString('fr-FR')} 🪙</span></button>`;
 const stat=()=>{const a=stakeId?store[stakeId]:null,b=targetId?store[targetId]:null;if(!a||!b||a.id===b.id)return {p:0,ratio:0,valid:false};return {p:chance(a,b),ratio:val(b)/val(a),valid:!!(col[a.id]&&col[a.id].n>0)} };
 const draw=()=>{
  const A=owned(),B=known(),st=stat();
  const a=stakeId?store[stakeId]:null,b=targetId?store[targetId]:null;
  const al=A.length?A.map(c=>mini(c,'s')).join(''):'<div class="upg-empty">Aucune carte dans ta collection.</div>';
  const bl=filtered(B,$('uq')?.value||'');
  const br=bl.length?bl.map(c=>mini(c,'t')).join(''):'<div class="upg-empty">Aucune carte trouvée.</div>';
  const focus=(c,empty)=>c?card(c):`<div class="csfocus empty">${empty}</div>`;
  main.innerHTML=`${bk()}<div class="cspage"><div class="cstop"><div><h2>⬆️ Card Upgrade</h2><div class="sub">Sélectionne une carte que tu possèdes, choisis ta cible et règle ton multiplicateur.</div></div><div class="csbalance">🪙 ${money.toLocaleString('fr-FR')}</div></div>
   <div class="csboard">
    <section class="cscol"><div class="csh"><span>MES CARTES</span><span class="mut">${A.length} cartes</span></div><div class="cslist">${al}</div></section>
    <section class="csmid">
     <div class="csmain"><div class="csfocus">${focus(a,'Choisis une carte à miser')}</div><div class="upg-wheelbox"><div class="cswheel${st.valid&&!busy?" ready":""}" id="upWheel" style="--win-angle:${Math.max(4,st.p*3.6)}deg"><div class="wheel-center"><b id="uprob">${st.p?st.p.toFixed(2):'0.00'}%</b><span>chance de réussite</span></div><i class="wheel-label win">SUCCÈS</i><i class="wheel-label lose">ÉCHEC</i></div><div class="cspointer"></div><div class="wheel-legend"><span><i></i> Réussite</span><span><i></i> Échec</span></div></div><div class="csfocus">${focus(b,'Choisis une carte cible')}</div></div>
     <div class="csbar"><div class="csprobhead"><span>Probabilité de réussite</span><b>${st.ratio?`×${st.ratio.toFixed(2)}`:''}</b></div><div class="csprob">${st.p?st.p+'%':'0.00%'}</div><div class="csprobnote">Chance de recevoir la carte sélectionnée</div><div class="csprog"><i style="width:${st.p}%"></i></div>
      <div class="csmults">${[1,1.5,2,5,10].map(v=>`<button class="btn g ${multiplier===v?'on':''}" data-mult="${v}">${v===1?'BASE':'×'+v}</button>`).join('')}</div>
      <div class="csgo"><button class="btn" id="ug" ${st.valid&&!busy?'':'disabled'}>⬆ AMÉLIORER</button><button class="btn g" id="ureset" ${busy?'disabled':''}>Réinitialiser</button></div>
     </div><div id="ur" class="csresult"></div><div class="csnote">La carte mise est retirée en cas d'échec. Une réussite retire la carte mise et ajoute la cible.</div>
    </section>
    <section class="cscol"><div class="csh"><span>AMÉLIORER</span><span class="mut">Cible</span></div><div class="csearch"><input id="uq" placeholder="🔍 Chercher une carte..."></div><div class="cslist" id="tl">${br}</div></section>
   </div>
   <div class="upg-panel" style="margin-top:12px"><h3 style="margin-top:0">Historique</h3><div id="uh">${history.length?history.slice().reverse().map(x=>`<div class="upg-hrow"><span>${x.a} → ${x.b} · ×${x.m}</span><span class="${x.w?'g':'r'}">${x.w?'✅ Réussi':'❌ Perdu'}</span></div>`).join(''):'<div class="sub">Aucune tentative dans cette session.</div>'}</div></div>
  </div></div>`;
  $('bk').onclick=()=>casino();
  main.querySelectorAll('[data-s]').forEach(e=>e.onclick=()=>{if(busy)return;stakeId=e.dataset.s;draw()});
  const wireTargets=()=>{main.querySelectorAll('[data-t]').forEach(e=>e.onclick=()=>{if(busy)return;targetId=e.dataset.t;draw()})};wireTargets();$('uq').oninput=()=>{const arr=filtered(known(),$('uq').value);$('tl').innerHTML=arr.length?arr.map(c=>mini(c,'t')).join(''):'<div class="upg-empty">Aucune carte trouvée.</div>';wireTargets()};
  main.querySelectorAll('[data-mult]').forEach(e=>e.onclick=()=>{if(busy)return;multiplier=+e.dataset.mult;draw()});
  $('ug').onclick=run;$('ureset').onclick=()=>{if(busy)return;stakeId=targetId=null;multiplier=1;draw()};bind(main,false);
 };
 const run=()=>{
  if(busy)return;
  SFX.upgrade();
  const a=stakeId?store[stakeId]:null,b=targetId?store[targetId]:null;
  if(!a||!b||a.id===b.id||!(col[a.id]&&col[a.id].n>0))return;
  const p=chance(a,b),ratio=val(b)/val(a);
  busy=true;
  const wheel=$("upWheel"),prob=$("uprob"),result=$("ur"),go=$("ug");
  if(go)go.disabled=true;
  if(result){result.className="csresult";result.innerHTML='<span class="upgrade-suspense">🎡 La roue tourne…<small>Le vert représente exactement ta chance de réussite</small></span>';}
  if(wheel){
   wheel.classList.remove("spin-upgrade");
   wheel.style.transition="none";
   wheel.style.transform="rotate(0deg)";
   wheel.offsetHeight;
   wheel.classList.add("spin-upgrade");
  }
  let ticks=0;
  const tickTimer=setInterval(()=>{ticks++;SFX.rouletteTick();if(prob){const lo=Math.max(1,p-10),hi=Math.min(95,p+10);prob.textContent=(lo+Math.random()*(hi-lo)).toFixed(2)+"%";}},125);
  const win=Math.random()*100<p;
  const winAngle=Math.max(4,p*3.6);
  const targetLow=win?8:winAngle+8;
  const targetHigh=win?Math.max(10,winAngle-8):352;
  const landing=targetLow+Math.random()*Math.max(1,targetHigh-targetLow);
  const pointer=180;
  const fullTurns=3;
  const finalRot=fullTurns*360 + pointer - landing;
  requestAnimationFrame(()=>{if(wheel){wheel.style.transform=`rotate(${finalRot}deg)`;}});
  setTimeout(()=>{
   clearInterval(tickTimer);
   if(wheel){wheel.classList.remove("spin-upgrade");wheel.style.transition="none";wheel.style.transform=`rotate(${finalRot}deg)`;}
   if(prob)prob.textContent=p.toFixed(2)+"%";
   const ca=col[a.id];
   if(!ca||ca.n<1){busy=false;draw();return}
   ca.n--;if(ca.n<=0)delete col[a.id];
   if(win){
    SFX.win();
    col[b.id]=col[b.id]?{...col[b.id],n:col[b.id].n+1}:{...b,n:1};
    history.push({a:a.t,b:b.t,m:(ratio*multiplier).toFixed(2),w:1});
    save();wcCount("upgrade",1);busy=false;toast(`✅ Upgrade réussi : ${a.t} → ${b.t}`)
   }else{
    SFX.lose();
    history.push({a:a.t,b:b.t,m:(ratio*multiplier).toFixed(2),w:0});
    save();wcCount("upgrade",1);busy=false;toast(`❌ Upgrade raté : ${a.t} a été perdue.`)
   }
   draw();
  },3800)
 };
 draw();
}

/* ---------- CARD CASE OPENING : cartes provenant du catalogue "Toutes les cartes" ---------- */
const CARD_CASES=[
 // Chaque caisse peut donner les 8 raretés actuelles. Poids = % par ouverture.
 {n:'Starter Case',p:250,items:[{r:0,w:55},{r:1,w:25},{r:2,w:10},{r:3,w:8},{r:4,w:1.2},{r:5,w:.6},{r:6,w:.19},{r:7,w:.01}]},
 {n:'Premium Case',p:900,items:[{r:0,w:14},{r:1,w:23},{r:2,w:23},{r:3,w:22},{r:4,w:7},{r:5,w:5},{r:6,w:3},{r:7,w:3}]},
 {n:'Legend Case',p:3000,items:[{r:0,w:5},{r:1,w:10},{r:2,w:18},{r:3,w:35},{r:4,w:12},{r:5,w:10},{r:6,w:9},{r:7,w:1}]}
];
let CASE_POOL=[];
async function loadCasePool(need){
 if(CASE_POOL.length>=180&&(need==null||CASE_POOL.some(c=>c.r===need)))return CASE_POOL;
 const seen=new Set(CASE_POOL.map(c=>c.id));
 const add=c=>{if(!c||!c.id||!c.img||seen.has(c.id))return;seen.add(c.id);CASE_POOL.push(c);store[c.id]=c};
 Object.values(store).filter(c=>c&&c.img&&c.src==="wiki").forEach(add);
 Object.values(col).filter(c=>c&&c.img).forEach(add);
 CRE.forEach(add);
 try{
  await loadRank();
  const hi=RANK.filter(e=>!e.cr&&e.r>=7).map(e=>e.t),mid=RANK.filter(e=>!e.cr&&e.r<7).sort(()=>Math.random()-.5).slice(0,120).map(e=>e.t),ranked=[...new Set([...hi.slice(0,60),...mid])];
  for(let i=0;i<ranked.length;i+=50){
   const {pages}=await wq(APIB+"titles="+encodeURIComponent(ranked.slice(i,i+50).join("|")));
   Object.values(pages).forEach(p=>{if(ok(p))add(mk(p))});
  }
  for(let i=0;i<5&&CASE_POOL.length<180;i++){
   const j=await (await fetch(API+"generator=random&grnnamespace=0&grnlimit=50")).json();
   Object.values(j.query?.pages||{}).forEach(pg=>{if(ok(pg))add(mk(pg))});
  }
 }catch(e){wcDbg(e)}
 return CASE_POOL;
}
function chooseCaseCard(r,pool){
 const valid=pool.filter(c=>c&&c.img);
 let a=valid.filter(c=>c.r===r);
 if(!a.length){
  // Une case ne doit jamais rester bloquée si le catalogue local ne contient
  // momentanément aucune carte du rang demandé. On prend le rang disponible
  // le plus proche, sans inventer une carte absente du catalogue.
  const ranks=[...new Set(valid.map(c=>c.r))].sort((x,y)=>Math.abs(x-r)-Math.abs(y-r)||x-y);
  if(ranks.length)a=valid.filter(c=>c.r===ranks[0]);
 }
 return a.length?a[Math.floor(Math.random()*a.length)]:null
}
async function cardcases(){
 let ci=0,busy=false,inv=[],spinTimer=null,tickTimer=null,spinStop=null,tickRaf=0,grantFn=null;
 const loadInv=()=>{try{inv=JSON.parse(localStorage.getItem('wc_card_case_inv')||'[]')}catch(e){inv=[]}};
 const esc=s=>(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const rollRare=C=>{let z=Math.random()*C.items.reduce((a,x)=>a+x.w,0);for(const x of C.items){z-=x.w;if(z<=0)return x.r}return C.items[C.items.length-1].r};
 const reelCardHTML=c=>`<div class="caseitem"><img src="${c.img||ph(c.t)}" alt="${esc(c.t)}" onerror="this.src='${ph(c.t)}'"><b title="${esc(c.t)}">${esc(c.t)}</b><small>${R[c.r]?.[0]||'Carte'}</small></div>`;
 const stopCurrent=()=>{
  cancelAnimationFrame(tickRaf);
  if(grantFn){const g=grantFn;grantFn=null;try{g()}catch(e){wcDbg(e)}}
  if(spinTimer){clearTimeout(spinTimer);spinTimer=null}
  if(tickTimer){clearInterval(tickTimer);tickTimer=null}
  if(spinStop){try{spinStop()}catch(e){wcDbg(e)};spinStop=null}
  try{SFX.stopAll()}catch(e){wcDbg(e)}
 };
 const draw=async()=>{
  stopCurrent();const C=CARD_CASES[ci];loadInv();
  main.innerHTML=`${bk()}<div class="cspage cscase"><div class="cstop"><div><h2>🃏 Card Case Opening</h2><div class="sub">Une roulette courte et fluide : les cartes restent visibles pendant tout le tirage.</div></div><div class="csbalance">🪙 ${money.toLocaleString('fr-FR')}</div></div>
  <div class="case-tabs">${CARD_CASES.map((c,i)=>`<button class="case-tab ${i===ci?'sel':''}" data-i="${i}"><b>${c.n}</b><span>${c.p.toLocaleString('fr-FR')} 🪙</span><small>${c.items.length} raretés</small></button>`).join('')}</div>
  <div class="caseui"><div class="casehead"><b>${C.n}</b><span>${C.p.toLocaleString('fr-FR')} 🪙</span></div>
   <div class="casevisual slow"><div class="casepointer"></div><div class="case-placeholder"><b>?</b><span>CARTE MYSTÈRE</span></div><div class="casereel" id="creel"></div></div>
   <div class="casehint" id="chint">La roulette reste visible jusqu'à l'arrêt.</div><div class="casewin" id="cwin">Choisis une caisse puis lance l'ouverture.</div>
   <div id="caseReveal" class="case-reveal hide"></div><div class="case-openbar"><button class="btn" id="copen">🔓 OUVRIR · ${C.p.toLocaleString('fr-FR')} 🪙</button></div>
   <div class="caseprob">${C.items.map(x=>`<div class="cprob"><b>${R[x.r][0]}</b><span>${x.w}%</span><small>Probabilité par ouverture</small></div>`).join('')}</div></div>
  <h3 style="margin-top:18px">Cartes gagnées avec les cases</h3><div class="caseinvent">${inv.slice().reverse().slice(0,30).map(x=>`<div class="caseitem"><img src="${x.img||ph(x.t)}" alt="${esc(x.t)}" onerror="this.src='${ph(x.t)}'"><b>${esc(x.t)}</b><small>${R[x.r]?.[0]||'Carte'}</small></div>`).join('')||'<div class="sub">Aucune carte gagnée dans une case.</div>'}</div></div>`;
  $('bk').onclick=()=>{stopCurrent();casino()};
  main.querySelectorAll('[data-i]').forEach(e=>e.onclick=()=>{if(busy)return;stopCurrent();ci=+e.dataset.i;draw()});
  $('copen').onclick=async()=>{
   if(busy)return;if(!take(C.p))return;busy=true;$('copen').disabled=true;stopCurrent();
   $('caseReveal').classList.add('hide');$('caseReveal').innerHTML='';$('cwin').textContent='';$('chint').textContent='';
   try{
    // Use the current local catalogue immediately. The network loader can enrich CASE_POOL in the background.
    const immediate=[...new Map(Object.values(store).filter(c=>c&&c.img).map(c=>[c.id,c])).values()];
    if(!CASE_POOL.length)CASE_POOL.push(...immediate.filter(c=>c.src==='wiki'||c.src==='cr'));
    let pool=CASE_POOL.filter(c=>c&&c.img);
    const rewardR=rollRare(C);if(rewardR>=8&&!pool.some(c=>c.r===rewardR)){await loadCasePool(rewardR);pool=CASE_POOL.filter(c=>c&&c.img)}let win=chooseCaseCard(rewardR,pool);
    if(!win){await loadCasePool();pool=CASE_POOL.filter(c=>c&&c.img);win=chooseCaseCard(rewardR,pool)}
    if(!win)throw new Error('pool vide');
    const reel=[],N=80,target=62;
    for(let i=0;i<N;i++){const tw=C.items.map(x=>Math.pow(x.w,.45)),tt=tw.reduce((p,q)=>p+q,0);let z=Math.random()*tt,r0=C.items[0].r;for(let k=0;k<tw.length;k++){z-=tw[k];if(z<=0){r0=C.items[k].r;break}}reel.push(chooseCaseCard(r0,pool)||win)}
    reel[target]=win;
    const rr=$('creel'),cv=document.querySelector('.casevisual');
    rr.style.transition='none';rr.style.transform='translate3d(0,0,0)';
    rr.innerHTML=reel.map(reelCardHTML).join('');
    cv.classList.add('running');
    $('cwin').textContent='Préparation des cartes…';
    // toutes les images sont chargées AVANT le départ : plus de cartes vides pendant le défilement
    await Promise.all([...rr.querySelectorAll('img')].map(im=>im.complete?0:new Promise(r=>{const t=setTimeout(r,3000),f=()=>{clearTimeout(t);r()};im.addEventListener('load',f,{once:true});im.addEventListener('error',f,{once:true})})));
    await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    const targetEl=rr.children[target];if(!targetEl)throw new Error('cible absente');
    const cs0=getComputedStyle(rr),gap=parseFloat(cs0.columnGap||cs0.gap)||8,stride=targetEl.offsetWidth+gap;
    const centerX=cv.clientWidth/2,targetCenter=targetEl.offsetLeft+targetEl.offsetWidth/2,shift=centerX-targetCenter+(Math.random()-.5)*40;
    $('cwin').textContent='La roulette tourne…';$('chint').textContent='Les cartes défilent…';
    const DUR=7.5;let lastIdx=-1,finished=false;
    // un « tic » à chaque carte qui passe sous le curseur
    const tickLoop=()=>{if(finished)return;try{const tx=new DOMMatrix(getComputedStyle(rr).transform).m41,idx=Math.floor((centerX-rr.offsetLeft-tx)/stride);if(idx!==lastIdx){lastIdx=idx;SFX.tick(idx)}}catch(e){wcDbg(e)}tickRaf=requestAnimationFrame(tickLoop)};
    // la carte est créditée même si tu quittes la page pendant le tirage
    const grant=()=>{let a=[];try{a=JSON.parse(localStorage.getItem('wc_card_case_inv')||'[]')}catch(e){wcDbg(e)}a.push({...win,ts:Date.now()});try{localStorage.setItem('wc_card_case_inv',JSON.stringify(a))}catch(e){wcDbg(e)}
     const had=!!col[win.id];col[win.id]=had?{...col[win.id],n:col[win.id].n+1}:{...win,n:1};if(had)bumpDaily("dupe",1);if(win.src==="cr")bumpDaily("creator",1);bumpDaily("case",1);save();upM();loadInv();busy=false;const ob=$('copen');if(ob)ob.disabled=false};
    grantFn=grant;
    try{SFX.riser(2.4)}catch(e){wcDbg(e)}tickRaf=requestAnimationFrame(tickLoop);
    requestAnimationFrame(()=>{rr.style.transition=`transform ${DUR}s cubic-bezier(.17,.55,.12,1)`;rr.style.transform=`translate3d(${shift}px,0,0)`});
    const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(tickRaf);if(spinTimer){clearTimeout(spinTimer);spinTimer=null}
     if(grantFn){grantFn=null;grant()}
     if(!document.body.contains(rr))return;
     SFX.reelStop();
     const items=rr.querySelectorAll('.caseitem');items.forEach(x=>x.classList.remove('win'));if(items[target])items[target].classList.add('win');
     SFX.win();SFX.fanfare(win.r);$('cwin').innerHTML=`🎯 <strong>${esc(win.t)}</strong><small>${R[win.r][0]}</small>`;$('chint').textContent='Récompense obtenue !';
     const rv=$('caseReveal');rv.classList.remove('hide');rv.innerHTML=card(win);bind(rv,false)};
    rr.addEventListener('transitionend',e=>{if(e.target===rr&&e.propertyName==='transform')finish()});
    spinTimer=setTimeout(finish,DUR*1000+500);
   }catch(e){stopCurrent();gain(C.p);busy=false;$('copen').disabled=false;$('cwin').innerHTML='⚠️ Ouverture annulée — ta mise a été rendue. Réessaie.'}
  };
 };await draw();
}

/* ---------- CRASH ---------- */
function crash(){
 let G=null,hist=[],raf=0,last=0;
 const crashPoint=()=>Math.max(1.01,Math.floor((0.96/(1-Math.random()))*100)/100);
 const paint=()=>{
  const active=!!G&&!G.over;
  main.innerHTML=`${bk()}<div class="cspage"><div class="cstop"><div><h2>✈️ Crash</h2><div class="sub">Le multiplicateur monte. Encaisse avant le crash.</div></div><div class="csbalance">🪙 ${money.toLocaleString('fr-FR')}</div></div>
   <div class="crashbox"><div class="crashsky"><div class="crashsub">${active?'EN VOL':'NOUVELLE MANCHE'}</div><div class="crashgrid"></div><div class="crashline" id="cLine"></div><div class="crashplane" id="cPlane">✈️</div><div class="crashmult" id="cMult">${G?G.m.toFixed(2):'1.00'}×</div></div>
   <div class="crashstats"><div class="crashstat"><span>MISE</span><b>${G?G.bet:50} 🪙</b></div><div class="crashstat"><span>MULTIPLICATEUR</span><b id="cNow">${G?G.m.toFixed(2):'1.00'}×</b></div><div class="crashstat"><span>GAIN POTENTIEL</span><b id="cWin">${G?Math.floor(G.bet*G.m):0} 🪙</b></div></div>
   <div class="crash-actions"><input id="crBet" class="crashbet" type="number" min="1" value="${G?G.bet:50}" ${active?'disabled':''}><button class="btn" id="cGo" ${active?'disabled':''}>🚀 Lancer</button><button class="btn crashcash" id="cCash" ${active?'':'disabled'}>💰 ENCAISSER ${active?Math.floor(G.bet*G.m).toLocaleString('fr-FR'):''} 🪙</button><button class="btn g" id="cHalf" ${active?'disabled':''}>½</button><button class="btn g" id="cDouble" ${active?'disabled':''}>×2</button></div>
   <div id="cMsg" class="bjm">${G&&G.msg?G.msg:'À toi de sentir quand sortir.'}</div><div class="crashhist">${hist.slice(-14).reverse().map(x=>`<span class="${x>=3?'':'hot'}">${x.toFixed(2)}×</span>`).join('')}</div></div></div>`;
  $("bk").onclick=()=>{cancelAnimationFrame(raf);casino()};
  $("cGo").onclick=start;$("cCash").onclick=cash;
  $("cHalf").onclick=()=>{$("crBet").value=Math.max(1,Math.floor((+$("crBet").value||1)/2))};
  $("cDouble").onclick=()=>{$("crBet").value=Math.min(money,Math.max(1,Math.floor((+$("crBet").value||1)*2)))};
  if(active)updateVisual();
 };
 const updateVisual=()=>{
  if(!G||G.over)return;
  const cm=$("cMult"),cn=$("cNow"),cw=$("cWin"),cc=$("cCash"),pl=$("cPlane"),line=$("cLine");
  if(!cm||!cn||!cw||!cc||!pl||!line)return;
  cm.textContent=G.m.toFixed(2)+'×';cn.textContent=G.m.toFixed(2)+'×';cw.textContent=Math.floor(G.bet*G.m).toLocaleString('fr-FR')+' 🪙';cc.textContent='💰 ENCAISSER '+Math.floor(G.bet*G.m).toLocaleString('fr-FR')+' 🪙';
  const k=Math.log(G.m+1);pl.style.left=Math.min(82,10+k*18)+'%';pl.style.bottom=Math.min(58,19+k*8)+'%';pl.style.transform=`rotate(${-10+Math.min(12,k*3)}deg)`;line.style.transform=`rotate(${Math.min(16,6+k*3)}deg) scaleX(${Math.min(1.35,1+k*.05)})`;
 };
 const tick=(now)=>{
  if(!G||G.over)return;
  const dt=Math.min(100,now-last);last=now;
  G.m*=Math.pow(1.00035,dt);
  if(G.m>=G.cp){
   try{SFX.crashBoom()}catch(e){wcDbg(e)}G.m=G.cp;G.over=true;hist.push(G.cp);G.msg=`💥 Crash à ${G.cp.toFixed(2)}× · mise perdue : ${G.bet.toLocaleString('fr-FR')} 🪙`;cancelAnimationFrame(raf);paint();return;
  }
  updateVisual();raf=requestAnimationFrame(tick);
 };
 const start=()=>{
  if(G&&!G.over)return;
  const b=Math.floor(+$("crBet").value);
  if(!b||b<1||b>money)return alert('Mise invalide ou pas assez de pièces.');
  if(!take(b))return;
  G={bet:b,m:1,cp:crashPoint(),over:false,msg:'✈️ Décollage…'};
  paint();last=performance.now();raf=requestAnimationFrame(tick);
 };
 const cash=()=>{
  if(!G||G.over)return;
  const w=Math.floor(G.bet*G.m);
  G.over=true;cancelAnimationFrame(raf);hist.push(G.m);gain(w);G.msg=`✅ Encaissé à ${G.m.toFixed(2)}× · +${w.toLocaleString('fr-FR')} 🪙`;paint();
 };
 paint();
}

/* ---------- ROULETTE EUROPÉENNE ---------- */
const WHL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26],REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const rcol=n=>n==0?"#16a34a":REDS.has(n)?"#dc2626":"#151515";
const OUT={d1:[1,12],d2:[13,24],d3:[25,36],lo:[1,18],hi:[19,36]};
function outNums(k){const a=[];for(let n=1;n<=36;n++){if(OUT[k]?n>=OUT[k][0]&&n<=OUT[k][1]:k=="k1"?n%3==1:k=="k2"?n%3==2:k=="k3"?n%3==0:k=="ev"?n%2==0:k=="od"?n%2==1:k=="rd"?REDS.has(n):k=="bl"?!REDS.has(n):0)a.push(n)}return a}
function roulette(){
 let chip=10,bets=[],last=[],busy=false,hist=[],th=0;
 const cells=[];for(let r=0;r<12;r++)for(let c=0;c<3;c++){const n=r*3+c+1;cells.push(`<div class="rn" data-n="${n}" style="grid-column:${c+2};grid-row:${r+2};background:${rcol(n)}">${n}</div>`)}
 main.innerHTML=`${bk()}<h2>🎡 Roulette</h2><div class="sub">Clique une case pour miser un numéro. Clique près d'un bord pour un cheval (2 numéros), au coin pour un carré, sur le bord gauche pour une transversale (3) ou un sixain (6). Zéro : cheval avec 1-2-3 et trio.</div>
 <div class="rl"><div class="rwl"><canvas id="rw" width="340" height="340"></canvas><div id="rh" class="rhist"></div><div id="rm" class="sub" style="text-align:center"></div></div>
 <div class="rtw"><div class="bar">${[1,5,10,25,100,500].map(v=>`<button class="btn g ch ${v==chip?"sel":""}" data-v="${v}">${v}</button>`).join("")}</div>
 <div class="rtab" id="rt"><div class="rn" data-n="0" style="grid-column:2/5;grid-row:1;background:#16a34a">0</div>${cells.join("")}
 <div class="ro" data-k="d1" style="grid-column:1;grid-row:2/6">1<sup>re</sup> 12</div><div class="ro" data-k="d2" style="grid-column:1;grid-row:6/10">2<sup>e</sup> 12</div><div class="ro" data-k="d3" style="grid-column:1;grid-row:10/14">3<sup>e</sup> 12</div>
 <div class="ro" data-k="lo" style="grid-column:5;grid-row:2/4">1-18</div><div class="ro" data-k="ev" style="grid-column:5;grid-row:4/6">PAIR</div><div class="ro" data-k="rd" style="grid-column:5;grid-row:6/8;background:#dc2626">ROUGE</div><div class="ro" data-k="bl" style="grid-column:5;grid-row:8/10;background:#151515">NOIR</div><div class="ro" data-k="od" style="grid-column:5;grid-row:10/12">IMPAIR</div><div class="ro" data-k="hi" style="grid-column:5;grid-row:12/14">19-36</div>
 <div class="ro" data-k="k1" style="grid-column:2;grid-row:14">2:1</div><div class="ro" data-k="k2" style="grid-column:3;grid-row:14">2:1</div><div class="ro" data-k="k3" style="grid-column:4;grid-row:14">2:1</div></div>
 <div class="bar" style="margin-top:12px"><button class="btn g" id="un">↩ Annuler</button><button class="btn g" id="cl">Effacer</button><button class="btn g" id="rb">↻ Rejouer</button><button class="btn g" id="x2">×2</button><button class="btn" id="go">🎡 Lancer</button></div><div id="tot" class="sub"></div></div></div>`;
 $("bk").onclick=()=>casino();
 const cv=$("rw"),x=cv.getContext("2d"),A=2*Math.PI/37;let lastWheelStep=-1;
 const paint=(t,ba,br,hl)=>{x.clearRect(0,0,340,340);x.save();x.translate(170,170);
  x.beginPath();x.arc(0,0,166,0,7);x.fillStyle="#3b2410";x.fill();
  WHL.forEach((n,i)=>{const a0=t+i*A-A/2-Math.PI/2,a1=a0+A;x.beginPath();x.moveTo(0,0);x.arc(0,0,158,a0,a1);x.closePath();x.fillStyle=rcol(n);x.fill();x.strokeStyle="#c9a44a";x.lineWidth=1;x.stroke();
   if(hl===n){x.fillStyle="#ffffff55";x.fill()}
   x.save();x.rotate(a0+A/2);x.translate(138,0);x.rotate(Math.PI/2);x.fillStyle="#fff";x.font="bold 11px sans-serif";x.textAlign="center";x.fillText(n,0,4);x.restore()});
  x.beginPath();x.arc(0,0,112,0,7);x.fillStyle="#2a1a0a";x.fill();x.beginPath();x.arc(0,0,98,0,7);x.fillStyle="#7a5a1c";x.fill();x.beginPath();x.arc(0,0,14,0,7);x.fillStyle="#e6c060";x.fill();
  if(ba!=null){const a=ba-Math.PI/2;x.beginPath();x.arc(Math.cos(a)*br,Math.sin(a)*br,6,0,7);x.fillStyle="#fff";x.shadowColor="#000";x.shadowBlur=4;x.fill()}
  x.restore()};
 paint(th);
 const tot=()=>bets.reduce((s,b)=>s+b.a,0),draw=()=>{
  const rt=$("rt"),R0=rt.getBoundingClientRect();rt.querySelectorAll(".bt").forEach(e=>e.remove());const seen={};
  bets.forEach(b=>{if(!seen[b.k])seen[b.k]={...b};else seen[b.k].a+=b.a});
  Object.values(seen).forEach(b=>rt.insertAdjacentHTML("beforeend",`<i class="bt" style="left:${b.x}%;top:${b.y}%">${b.a}</i>`));
  $("tot").textContent=bets.length?`Mise totale : ${tot()} 🪙 · ${Object.keys(seen).length} mise(s)`:"Aucune mise"};draw();
 main.querySelectorAll(".ch").forEach(b=>b.onclick=()=>{chip=+b.dataset.v;main.querySelectorAll(".ch").forEach(y=>y.classList.toggle("sel",y==b))});
 $("rt").onclick=e=>{if(busy)return;const rt=$("rt"),R0=rt.getBoundingClientRect(),el=e.target.closest("[data-n],[data-k]");if(!el)return;
  let nums,k,cx,cy;const b=el.getBoundingClientRect(),fx=(e.clientX-b.left)/b.width,fy=(e.clientY-b.top)/b.height,T=.27;
  if(el.dataset.k){k=el.dataset.k;nums=outNums(k);cx=(b.left+b.width/2-R0.left)/R0.width*100;cy=(b.top+b.height/2-R0.top)/R0.height*100}
  else{const n=+el.dataset.n;cx=(e.clientX-R0.left)/R0.width*100;cy=(e.clientY-R0.top)/R0.height*100;
   if(n==0){if(fy>1-T){const c=Math.floor(fx*3),edge=Math.abs(fx*3-c)<.4||Math.abs(fx*3-c-1)<.4;const nb=Math.round(fx*3);nums=(nb==1||nb==2)&&(Math.abs(fx*3-nb)<.35)?[0,nb,nb+1].map((v,i)=>i==0?0:v):[0,c+1]}else nums=[0]}
   else{const r=Math.floor((n-1)/3),c=(n-1)%3;let dx=0,dy=0,st=false;
    if(fx<T){if(c>0)dx=-1;else st=true}else if(fx>1-T&&c<2)dx=1;
    if(fy<T)dy=-1;else if(fy>1-T)dy=1;
    if(r==0&&dy==-1){nums=dx?[0,n,n+dx].sort((a,b)=>a-b):[0,n];if(dx&&!((n==1&&dx==1)||(n==2)||(n==3&&dx==-1)))nums=[0,n];if(n==2&&dx==-1)nums=[0,1,2];if(n==2&&dx==1)nums=[0,2,3];if(n==1&&dx==1)nums=[0,1,2];if(n==3&&dx==-1)nums=[0,2,3];if(!dx)nums=[0,n]}
    else if(r==11&&dy==1)dy=0;
    if(!nums){if(st){const r2=dy==-1?r-1:dy==1?r+1:r,ra=Math.min(r,r2);nums=dy?Array.from({length:6},(_,i)=>ra*3+1+i):[r*3+1,r*3+2,r*3+3]}
     else{const S=[n];if(dx)S.push(n+dx);if(dy)S.push(n+3*dy);if(dx&&dy)S.push(n+dx+3*dy);nums=S}}}
   nums=[...new Set(nums)].sort((a,b)=>a-b);k="i"+nums.join("-")}
  if(bets.reduce((s,y)=>s+y.a,0)+chip>money)return alert("Pas assez de pièces.");
  bets.push({k,nums,a:chip,x:cx,y:cy});try{SFX.chip()}catch(e){wcDbg(e)}draw()};
 $("un").onclick=()=>{if(!busy){bets.pop();draw()}};$("cl").onclick=()=>{if(!busy){bets=[];draw()}};
 $("rb").onclick=()=>{if(!busy&&last.length){bets=last.map(b=>({...b}));draw()}};
 $("x2").onclick=()=>{if(!busy&&bets.length){if(tot()*2>money)return alert("Pas assez de pièces.");bets=bets.concat(bets.map(b=>({...b})));draw()}};
 const pay={1:35,2:17,3:11,4:8,6:5};
 $("go").onclick=()=>{if(busy||!bets.length)return;const T=tot();if(!take(T))return;busy=true;last=bets.map(b=>({...b}));$("rm").textContent="Rien ne va plus…";
  const k=Math.floor(Math.random()*37),n=WHL[k],t0=performance.now(),D=11000,th0=th,thF=th0+2*Math.PI*3+Math.random()*6,baF=thF+k*A-2*Math.PI*7,ba0=th0;
  const f=now=>{if(!alive("rw")){let w=0;bets.forEach(b=>{if(!b.nums.includes(n))return;const L=b.nums.length,o=!b.k.startsWith("i");w+=b.a*((o?(L==12?2:1):pay[L])+1)});if(w)gain(w);return}const p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,3),e2=1-Math.pow(1-p,4),th1=th0+(thF-th0)*e,ba=ba0+(baF-ba0)*e2,br=172-26*Math.max(0,Math.min(1,(p-.55)/.4));
   th=th1;paint(th1,ba,p<1?br:146,p==1?n:null);
   const wheelStep=Math.floor((th1-th0)/A);if(wheelStep!==lastWheelStep){lastWheelStep=wheelStep;SFX.rouletteTick()}
   if(p<1)requestAnimationFrame(f);else{SFX.reelStop();let w=0;// plein 35:1, cheval 17:1, transversale 11:1, carré 8:1, sixain 5:1, douzaines/colonnes 2:1, chances simples 1:1 (mise rendue incluse)
    bets.forEach(b=>{if(!b.nums.includes(n))return;const L=b.nums.length,o=!b.k.startsWith("i");w+=b.a*((o?(L==12?2:1):pay[L])+1)});
    if(w)gain(w);bets=[];hist.unshift(n);$("rh").innerHTML=hist.slice(0,14).map(v=>`<span style="background:${rcol(v)}">${v}</span>`).join("");
    try{w?SFX.win():SFX.lose()}catch(e){wcDbg(e)}$("rm").innerHTML=`<b style="font-size:22px">${n}</b> ${n==0?"vert":REDS.has(n)?"rouge":"noir"} · ${w?`🎉 Tu gagnes ${w} 🪙 (net ${w-T>=0?"+":""}${w-T})`:"Perdu"}`;busy=false;draw()}};
  requestAnimationFrame(f)}}
/* ---------- BLACKJACK ---------- */
const SU=["♠","♥","♦","♣"],RK=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];let shoe=[];
const newShoe=()=>{shoe=[];for(let d=0;d<6;d++)for(let s=0;s<4;s++)for(let r=0;r<13;r++)shoe.push({r,s});for(let i=shoe.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shoe[i],shoe[j]]=[shoe[j],shoe[i]]}};
const dr=()=>{if(!shoe.length)newShoe();const c=shoe.pop();if(typeof SFX!=='undefined')setTimeout(()=>SFX.cardDraw(),0);return c},cvl=c=>c.r==0?11:Math.min(10,c.r+1);
function hv(cs){let t=0,a=0;cs.forEach(c=>{t+=cvl(c);if(c.r==0)a++});while(t>21&&a>0){t-=10;a--}return{t,soft:a>0}}
const pcd=c=>`<div class="pc ${c.s==1||c.s==2?"rd":""}">${RK[c.r]}<span>${SU[c.s]}</span></div>`;
function blackjack(){
 let S={ph:"bet",H:[],cur:0,D:[],ins:0,msg:""},bet=50;if(shoe.length<80)newShoe();
 const paint=()=>{const hid=S.ph=="ins"||S.ph=="play",h=S.H[S.cur],can=S.ph=="play"&&h;
  main.innerHTML=`${bk()}<h2>🃏 Blackjack</h2><div class="sub">6 jeux · le croupier reste sur 17 · blackjack payé 3:2 · double sur 2 cartes · séparation (jusqu'à 4 mains) · assurance 2:1 · sabot : ${shoe.length} cartes</div>
  <div class="bjt"><div class="bjr"><h3>Croupier ${S.D.length&&!hid?"· "+hv(S.D).t:""}</h3><div class="bjc">${S.D.map((c,i)=>i==1&&hid?`<div class="pc bkc"></div>`:pcd(c)).join("")}</div></div>
  <div class="bjr"><h3>Toi</h3><div class="bjh">${S.H.map((x,i)=>`<div class="bjhd ${S.ph=="play"&&i==S.cur?"act":""}"><div class="bjc">${x.c.map(pcd).join("")}</div><div class="sub">${hv(x.c).t}${hv(x.c).t>21?" · brûlé":""} · mise ${x.b} 🪙${x.r?" · "+x.r:""}</div></div>`).join("")}</div></div></div>
  <div id="bm" class="bjm">${S.msg}</div>
  ${S.ph=="bet"||S.ph=="end"?`<div class="bar" style="max-width:520px"><input id="bb" type="number" min="1" value="${bet}"><button class="btn g" data-m="10">10</button><button class="btn g" data-m="100">100</button><button class="btn g" data-m="1000">1000</button><button class="btn g" data-m="0">Tout</button><button class="btn" id="dl">🃏 Distribuer</button></div>`:""}
  ${S.ph=="ins"?`<div class="bar"><button class="btn" id="iy">Assurance (${Math.floor(S.H[0].b/2)} 🪙)</button><button class="btn g" id="in">Non merci</button></div>`:""}
  ${can?`<div class="bar"><button class="btn" id="hit">Tirer</button><button class="btn g" id="sta">Rester</button><button class="btn g" id="dbl" ${h.c.length==2&&money>=h.b&&!h.sa?"":"disabled"}>Doubler</button><button class="btn g" id="spl" ${h.c.length==2&&cvl(h.c[0])==cvl(h.c[1])&&S.H.length<4&&money>=h.b?"":"disabled"}>Séparer</button></div>`:""}`;
  $("bk").onclick=()=>casino();
  main.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{$("bb").value=+b.dataset.m||money});
  if($("dl"))$("dl").onclick=deal;if($("iy"))$("iy").onclick=()=>insure(1);if($("in"))$("in").onclick=()=>insure(0);
  if($("hit"))$("hit").onclick=hit;if($("sta"))$("sta").onclick=stand;if($("dbl"))$("dbl").onclick=dbl;if($("spl"))$("spl").onclick=spl};
 const nat=x=>x.c.length==2&&hv(x.c).t==21&&!x.sp,dbj=()=>S.D.length==2&&hv(S.D).t==21;
 const deal=()=>{bet=Math.floor(+$("bb").value);if(!take(bet))return;try{[0,180,360,540].forEach(t=>setTimeout(()=>SFX.cardDraw(),t))}catch(e){wcDbg(e)}if(shoe.length<80)newShoe();
  S={ph:"play",H:[{c:[dr(),dr()],b:bet}],cur:0,D:[dr(),dr()],ins:0,msg:""};
  if(S.D[0].r==0){S.ph="ins";paint();return}
  peek()};
 const peek=()=>{const up=cvl(S.D[0]);if(up==10&&dbj()||nat(S.H[0]))return settle();S.ph="play";paint()};
 const insure=y=>{if(y){const i=Math.floor(S.H[0].b/2);if(take(i))S.ins=i}
  if(dbj()||nat(S.H[0]))return settle();S.msg=S.ins?"Pas de blackjack du croupier : l'assurance est perdue.":"";S.ph="play";paint()};
 const nxt=()=>{const i=S.H.findIndex(x=>!x.done);if(i<0)return dealer();S.cur=i;paint()};
 const hit=()=>{const h=S.H[S.cur];try{SFX.cardDraw()}catch(e){wcDbg(e)}h.c.push(dr());if(hv(h.c).t>=21)h.done=1;nxt()};
 const stand=()=>{S.H[S.cur].done=1;nxt()};
 const dbl=()=>{const h=S.H[S.cur];if(!take(h.b))return;h.b*=2;try{SFX.cardDraw()}catch(e){wcDbg(e)}h.c.push(dr());h.done=1;nxt()};
 const spl=()=>{const h=S.H[S.cur];if(!take(h.b))return;const a=h.c[0].r==0,x={c:[h.c[0],dr()],b:h.b,sp:1,sa:a,done:a},y={c:[h.c[1],dr()],b:h.b,sp:1,sa:a,done:a};S.H.splice(S.cur,1,x,y);nxt()};
 const dealer=()=>{S.ph="dealer";if(S.H.some(x=>hv(x.c).t<=21))while(hv(S.D).t<17)S.D.push(dr());if(typeof SFX!=="undefined")SFX.cardPlace();settle()};
 const settle=()=>{S.ph="end";const dt=hv(S.D).t,db=dbj();let ret=0,bets=0,msg=[];
  S.H.forEach(x=>{const pt=hv(x.c).t;bets+=x.b;let r=0;
   if(nat(x)&&!db)r=x.b*2.5;else if(nat(x)&&db)r=x.b;else if(pt>21)r=0;else if(db)r=0;else if(dt>21||pt>dt)r=x.b*2;else if(pt==dt)r=x.b;
   x.r=nat(x)&&!db?"Blackjack ! 3:2":pt>21?"Brûlé":r>x.b?"Gagné":r==x.b?"Égalité":"Perdu";ret+=r});
  if(S.ins){bets+=S.ins;if(db)ret+=S.ins*3}
  if(ret)gain(ret);const net=ret-bets;try{net>0?SFX.win():net<0?SFX.lose():SFX.nav()}catch(e){wcDbg(e)}S.msg=(db?"Blackjack du croupier. ":"")+(net>0?`🎉 +${net} 🪙`:net==0?"Égalité, mise rendue.":`${net} 🪙`);paint()};
 paint()}
/* ---------- MACHINE À SOUS : 5 rouleaux × 3 lignes, 20 lignes de gain ---------- */
const SL=["🍒","🍋","🍊","🍇","🔔","⭐","💎","7️⃣","🃏","🎰"],SW=[26,24,20,16,12,8,5,3,4,3],
SP=[[10,30,60],[11,34,68],[16,45,90],[23,58,116],[30,90,180],[48,150,350],[58,245,590],[115,590,2950]],
SLN=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],[1,0,1,0,1],[1,2,1,2,1],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0],[2,2,0,2,2],[0,2,2,2,0]];
function slRoll(reel){const w=SW.map((v,i)=>i==8&&(reel<1||reel>3)?0:v),t=w.reduce((a,b)=>a+b,0);let r=Math.random()*t,i=0;for(;i<9&&(r-=w[i])>=0;i++);return i}
function slEval(g,bet){let win=0,L=[];SLN.forEach((ln,li)=>{const s=ln.map((row,r)=>g[r][row]);if(s[0]==9)return;const b=s[0];let n=1;for(let r=1;r<5;r++){if(s[r]==b||s[r]==8)n++;else break}
  if(n>=3&&b<8){win+=SP[b][n-3]*bet/20;L.push({li,n,b,w:SP[b][n-3]*bet/20})}});
 let sc=0;g.forEach(c=>c.forEach(v=>{if(v==9)sc++}));sc=Math.min(5,sc);let fs=0;
 if(sc>=3){win+=[2,10,50][sc-3]*bet;fs=[10,15,20][sc-3]}
 return{win:Math.round(win),L,fs,sc}}
function slotsBase(){
 let bet=100,free=0,fw=0,busy=false,g=Array.from({length:5},()=>[0,1,2]);
 const cols=[0,1,2,3,4];
 main.innerHTML=`${bk()}<h2>🎰 Machine à sous</h2><div class="sub">20 lignes · 3 symboles identiques (ou Wild 🃏) de gauche à droite · 3+ Scatter 🎰 = tours gratuits (gains ×2) · le Wild remplace tout sauf le Scatter</div>
 <div class="slm"><div id="sfs" class="slf"></div><div class="sreels" id="sr">${cols.map(c=>`<div class="sre">${[0,1,2].map(r=>`<div class="sc" id="s${c}${r}"></div>`).join("")}</div>`).join("")}</div>
 <div id="sm" class="bjm"></div><div class="bar" style="justify-content:center"><span class="sub" style="align-self:center">Mise :</span>${[20,50,100,200,500,1000].map(v=>`<button class="btn g sb ${v==bet?"sel":""}" data-v="${v}">${v}</button>`).join("")}<button class="btn" id="sp">🎰 Lancer</button></div></div>
 <details class="sub" style="margin-top:14px"><summary>Table des gains (× mise par ligne = mise ÷ 20)</summary><div class="ptb">${SP.map((p,i)=>`<div>${SL[i]} ×3 <b>${p[0]}</b> · ×4 <b>${p[1]}</b> · ×5 <b>${p[2]}</b></div>`).join("")}<div>🎰 Scatter : 3 = 2× la mise + 10 tours · 4 = 10× + 15 tours · 5 = 50× + 20 tours</div></div></details>`;
 $("bk").onclick=()=>casino();
 const show=()=>g.forEach((c,i)=>c.forEach((v,r)=>{const e=$(`s${i}${r}`);if(e){e.textContent=SL[v];e.classList.remove("win")}}));show();
 main.querySelectorAll(".sb").forEach(b=>b.onclick=()=>{if(busy||free)return;bet=+b.dataset.v;main.querySelectorAll(".sb").forEach(y=>y.classList.toggle("sel",y==b))});
 const spin=()=>{if(busy)return;if(!free&&!take(bet))return;const isF=free>0;if(isF)free--;busy=true;$("sm").textContent="";
  const ng=cols.map(c=>[0,1,2].map(()=>slRoll(c))),T=[1200,2100,3000,3900,4800],t0=performance.now();
  const iv=setInterval(()=>{if(!alive("sr")){clearInterval(iv);const ev=slEval(ng,bet),w=ev.win*(isF?2:1);if(w)gain(w);return}const t=performance.now()-t0;cols.forEach(c=>[0,1,2].forEach(r=>{const e=$(`s${c}${r}`);if(e)e.textContent=SL[t>T[c]?ng[c][r]:Math.floor(Math.random()*10)]}));
   if(t>T[4]+50){clearInterval(iv);g=ng;show();const ev=slEval(g,bet),w=ev.win*(isF?2:1);
    ev.L.forEach(l=>{for(let r=0;r<l.n;r++){const e=$(`s${r}${SLN[l.li][r]}`);if(e)e.classList.add("win")}});
    if(ev.sc>=3)g.forEach((c,i)=>c.forEach((v,r)=>{if(v==9){const e=$(`s${i}${r}`);if(e)e.classList.add("win")}}));
    if(ev.fs){SFX.win();free+=isF?Math.floor(ev.fs/2):ev.fs}
    if(isF)fw+=w;if(w)gain(w);
    try{w?SFX.win():SFX.lose()}catch(e){wcDbg(e)}$("sm").innerHTML=(w?`🎉 <b>+${w} 🪙</b>${isF?" (×2)":""} · ${ev.L.length} ligne(s)${ev.sc>=3?" · Scatter !":""}`:"Perdu…")+(ev.fs?` · <b>${ev.fs} tours gratuits !</b>`:"");
    $("sfs").textContent=free?`✨ Tours gratuits : ${free} restants · gains cumulés ${fw} 🪙`:"";busy=false;
    if(free>0)setTimeout(()=>{if(alive("sr"))spin()},3200);else if(isF){$("sm").innerHTML+=` · <b>Fin des tours gratuits : ${fw} 🪙</b>`;fw=0}}},50)};
 $("sp").onclick=()=>{SFX.slots();spin()}}

async function fusionSame(c){
 if(!c||c.n<3||c.r>=7)return;
 SFX.fusionStart();
 const source={...c};
 const targetR=Math.min(7,source.r+1);
 c.n-=3;
 if(c.n<=0)delete col[c.id];
 save();

 const result={...source,r:targetR,n:1};
 result.id=source.id;
 result.pid=source.pid||source.id;
 result.t=source.t;
 store[result.id]=result;

 const overlay=document.createElement("div");
 overlay.id="fusionOverlay";
 overlay.innerHTML=`<div class="fusionStage" id="fusionStage">
  <div class="fusionTitle">⚗️ FUSION</div>
  <div class="fusionSub">Les 3 cartes se combinent pour créer une version de rareté supérieure.</div>
  <div class="fusionSlots">
   <div class="fusionSlot">${card({...source,n:1})}</div><div class="fusionPlus">+</div>
   <div class="fusionSlot">${card({...source,n:1})}</div><div class="fusionPlus">+</div>
   <div class="fusionSlot">${card({...source,n:1})}</div>
  </div>
  <div class="fusionCore"></div>
  <div class="fusionBurst"></div>
  <div class="fusionResultWrap" id="fusionResultWrap"></div>
  <div class="fusionChance">3 × ${esc(rarityName(source.r))} → 1 × ${esc(rarityName(targetR))}</div>
  <div class="fusionDone" id="fusionDone"></div>
 </div>`;
 document.body.appendChild(overlay);
 const stage=$("fusionStage");
 requestAnimationFrame(()=>stage.classList.add("active"));

 try{
  await new Promise(res=>setTimeout(res,2350));
  $("fusionResultWrap").innerHTML=`<div class="fusionResult">${card(result)}<div class="fusionResultTag">${SYM[result.r]} ${rarityName(result.r)}</div></div>`;
  addCard(result);
  bumpDaily("fusion",1);
  save();
  stage.classList.remove("active");
  stage.classList.add("reveal");
  $("fusionDone").innerHTML=`<b>${source.t}</b> passe de ${rarityName(source.r)} à <b>${rarityName(targetR)}</b>.`;
  setTimeout(()=>{
   overlay.remove();
   collection();
   SFX.fusionSuccess(result.r);
   toast("✨ Fusion : 3 × "+rarityName(source.r)+" → 1 × "+rarityName(targetR));
  },3600);
 }catch(e){
  SFX.fusionFail();
  addCard({...source,n:1});
  save();
  overlay.remove();
  collection();
  toast("Fusion annulée : les cartes ont été rendues.");
 }
}
/* V99 : ancienne version de fusionHTML() supprimée (elle était écrasée par la suivante) */

/* ===== COLLECTION ===== */
/* ===== COLLECTION V55 : tags + sélection + suppression + 50 cartes/page ===== */
const UNTAGGED_FILTER="__NO_TAG__";
let colPage=1,colTagFilter="",colSearch="",colSort="rar",colSelected=new Set();
const COL_PAGE_SIZE=50;let colView="binder",bkIdx=0,bkPer=9,bkAnim="";try{const u=JSON.parse(localStorage.getItem("wc_bk")||"null");if(u){colView="binder";bkPer=9;bkIdx=u.i|0}}catch(e){wcDbg(e)}const saveBk=()=>{colView="binder";try{localStorage.setItem("wc_bk",JSON.stringify({v:"binder",p:9,i:bkIdx}))}catch(e){wcDbg(e)}};
const selKey=v=>String(v);
const selHas=v=>colSelected.has(selKey(v));
const selAdd=v=>colSelected.add(selKey(v));
const selDel=v=>colSelected.delete(selKey(v));
const selClear=()=>colSelected.clear();
const colTags=()=>{
 const s=new Set();
 try{const saved=JSON.parse(localStorage.getItem("wc_col_tags")||"[]");if(Array.isArray(saved))saved.forEach(t=>{t=cleanTag(t);if(t)s.add(t)})}catch(e){wcDbg(e)}
 Object.values(col).forEach(c=>(c.tags||[]).forEach(t=>s.add(t)));
 return orderedColTags([...s]);
};
const cleanTag=t=>(t||"").trim().replace(/\s+/g," ").slice(0,40);
const colTagOrder=()=>{try{const x=JSON.parse(localStorage.getItem("wc_col_tag_order")||"[]");return Array.isArray(x)?x.map(cleanTag).filter(Boolean):[]}catch(e){return []}};
const saveColTagOrder=order=>{try{localStorage.setItem("wc_col_tag_order",JSON.stringify([...new Set(order.map(cleanTag).filter(Boolean))]))}catch(e){wcDbg(e)}};
const orderedColTags=tags=>{const clean=[...new Set(tags.map(cleanTag).filter(Boolean))],saved=colTagOrder(),set=new Set(clean),out=[...saved.filter(t=>set.has(t)),...clean.filter(t=>!saved.includes(t)).sort((a,b)=>a.localeCompare(b,"fr"))];if(out.length!==saved.length||out.some((x,i)=>x!==saved[i]))saveColTagOrder(out);return out};
const TAG_COLORS=["#a855f7","#3b82f6","#22c55e","#f59e0b","#ef4444","#ec4899","#14b8a6","#8b5cf6","#06b6d4","#f97316"];
const validTagColor=c=>/^#[0-9a-fA-F]{6}$/.test(c||"")?c:"#a855f7";
const tagMeta=()=>{try{const x=JSON.parse(localStorage.getItem("wc_col_tag_meta")||"{}");return x&&typeof x==="object"?x:{}}catch(e){return {}}};
const saveTagMeta=m=>{try{localStorage.setItem("wc_col_tag_meta",JSON.stringify(m))}catch(e){wcDbg(e)}};
const tagLabel=t=>{const x=String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");return /^\d+\s*-/.test(t)?"#"+x:x};
const tagColor=(t,i=0)=>validTagColor(tagMeta()[t]||TAG_COLORS[i%TAG_COLORS.length]);
const setTagColor=(t,c)=>{const m=tagMeta();m[t]=validTagColor(c);saveTagMeta(m)};
function saveCollectionState(){try{localStorage.setItem("wc_col_ui",JSON.stringify({tag:colTagFilter,q:colSearch,sort:colSort,page:colPage}))}catch(e){wcDbg(e)}}
try{const u=JSON.parse(localStorage.getItem("wc_col_ui")||"null");if(u){colTagFilter=u.tag||"";colSearch=u.q||"";colSort=u.sort||"rar";colPage=Math.max(1,+u.page||1)}}catch(e){wcDbg(e)}
/* ===== V115 : recherche dans la Collection par nom ET par thème (animal, film, jeu vidéo, streamer…) ===== */
const SQ_STOP=new Set(["de","du","des","la","le","les","un","une","et","en","au","aux","d","l","a"]);
const sqNorm=v=>String(v||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const sqStem=w=>w.length>3?w.replace(/[sx]$/,""):w;
/* chaque thème : mots-clés tapés par la joueuse + ce qu'on cherche dans la description Wikipédia / le type de carte */
const SQ_THEMES=[
 {k:["animal","animaux","bete","faune"],re:/\b(espece|animal|mammifere|oiseau|reptile|poisson|insecte|arachnide|serpent|lezard|requin|chat|chien|cheval|felin|rongeur|crustace|amphibien|grenouille|araignee|scorpion|dinosaure|primate|baleine|dauphin|loup|ours|singe)/},
 {k:["reptile","reptiles"],re:/\b(reptile|serpent|lezard|tortue|crocodile|alligator|varan|cobra|vipere|python|couleuvre|iguane|gecko|cameleon)/},
 {k:["insecte","insectes","bestiole"],re:/\b(insecte|arachnide|araignee|scorpion|papillon|abeille|fourmi|coleoptere|moustique|guepe|mouche|libellule|criquet|cafard|scarabee)/},
 {k:["oiseau","oiseaux"],re:/\b(oiseau|passereau|rapace|perroquet|aigle|hibou|chouette|pingouin|manchot|canard|corbeau|faucon)/},
 {k:["poisson","poissons","marin"],re:/\b(poisson|requin|raie|thon|saumon|baleine|dauphin|crustace|mollusque|pieuvre|meduse|corail)/},
 {k:["dinosaure","dinosaures","dino"],re:/\b(dinosaure|saurien|tyrannosaure|raptor|diplodocus|theropode)/},
 {k:["plante","plantes","fleur","fleurs","arbre","arbres","vegetal"],re:/\b(plante|fleur|arbre|champignon|espece vegetale|genre botanique|famille botanique|arbuste|fruit|legume)/},
 {k:["film","films","cinema"],src:"film",re:/\b(film|cinema|long metrage|realisateur)\b/},
 {k:["serie","series","tv","television"],re:/\b(serie televisee|serie d animation|serie tv|sitcom|telenovela|feuilleton)/},
 {k:["anime","animes","manga","mangas"],re:/\b(anime|manga|dessin anime|animation japonaise)/},
 {k:["jeu video","jeux video","jv","gaming","gamer","videoludique","console"],re:/\b(jeu video|jeux video|videoludique|jeu de role|jeu de combat|jeu de plateforme|jeu de course|jeu de tir|jeu d aventure|console de jeu|personnage de jeu)/},
 {k:["streamer","streamers","streameur","streameuse","youtubeur","youtubeurs","youtubeuse","youtube","twitch","createur","createurs","influenceur","influenceuse","tiktokeur"],src:"cr",re:/\b(streamer|streameur|streameuse|youtubeur|youtubeuse|influenceu|createur de contenu|creatrice de contenu|vlogueur|tiktokeu|personnalite d internet|vtubeur)/},
 {k:["sport","sports","sportif","sportive","foot","football","footballeur","basket","tennis","rugby"],re:/\b(football|footballeur|basket|tennis|rugby|sportif|sportive|athlete|cycliste|pilote|boxeur|nageur|olympique|handball|judoka|golfeur|champion)/},
 {k:["musique","chanteur","chanteuse","musicien","rappeur","rappeuse","groupe","artiste"],re:/\b(chanteu|chanteuse|musici|rappeu|compositeur|groupe de musique|groupe musical|album|chanson|dj\b|auteur compositeur|interprete)/},
 {k:["acteur","actrice","acteurs","actrices","comedien","realisateur"],re:/\b(acteur|actrice|realisateur|realisatrice|comedien|comedienne)/},
 {k:["pays","ville","villes","capitale","region","commune"],re:/\b(pays|ville|capitale|commune|etat|region|departement|ile|province|archipel)/},
 {k:["histoire","roi","reine","empereur","monarque","president","guerre","politique","politicien"],re:/\b(roi|reine|empereur|imperatrice|monarque|president|chef d etat|premier ministre|guerre|bataille|homme politique|femme politique|dictateur)/},
 {k:["science","scientifique","physicien","chimiste","mathematicien","medecin","inventeur"],re:/\b(physicien|chimiste|mathematicien|biologiste|scientifique|astronome|medecin|inventeur|ingenieur|chercheur)/},
 {k:["nourriture","plat","cuisine","fromage","dessert","boisson","aliment"],re:/\b(plat|fromage|dessert|boisson|cuisine|aliment|specialite culinaire|gateau|vin|biere)/},
 {k:["voiture","voitures","auto","automobile","vehicule","moto","avion","bateau","train"],re:/\b(voiture|automobile|constructeur|moto|avion|bateau|navire|train|helicoptere|vehicule)/},
 {k:["monument","monuments","chateau","cathedrale","eglise","musee","pont","stade"],re:/\b(monument|chateau|cathedrale|eglise|musee|pont|stade|tour|palais|basilique)/}
];
const SQ_THEME_BY_WORD=(()=>{const m=new Map();SQ_THEMES.forEach(t=>t.k.forEach(k=>{const n=sqNorm(k);m.set(n,t);m.set(n.split(" ").map(sqStem).join(" "),t)}));return m})();
const sqCache=new WeakMap();
function sqHay(c){let h=sqCache.get(c);if(h!==undefined)return h;
 h=" "+sqNorm([c.t,c.d,c.desc,c.genres,c.plat,c.year,c.category,c.type,c.kind,c.genre,c.subcategory,c.src=="film"?"film cinema":"",c.src=="cr"?"streamer youtubeur createur "+(c.plat||""):""].filter(Boolean).join(" "));
 try{sqCache.set(c,h)}catch(e){wcDbg(e)}return h}
function sqParse(q){const raw=String(q||"").trim();if(!raw)return null;
 const n=sqNorm(raw),words=n.split(" ").filter(w=>w&&!SQ_STOP.has(w)).map(sqStem);if(!words.length)return null;
 const phrase=words.join(" "),themePhrase=SQ_THEME_BY_WORD.get(phrase)||null;
 return{words,themePhrase,perWord:words.map(w=>SQ_THEME_BY_WORD.get(w)||null)}}
function sqMatch(c,q){const h=sqHay(c)+" "+sqNorm((c.tags||[]).join(" "));
 const th=t=>t&&((t.src&&c.src===t.src)||t.re.test(h));
 if(q.themePhrase&&th(q.themePhrase))return true;
 return q.words.every((w,i)=>h.includes(" "+w)||th(q.perWord[i]))}
function collectionBase(){
 try{const s=(SAVEFAIL||IDBONLY)?null:JSON.parse(localStorage.getItem("wc_col")||"null");if(s){col=s;hyd()}}catch(e){wcDbg(e)}
 colSelected=new Set([...colSelected].map(selKey));
 Object.values(col).forEach(c=>{c.tags=Array.isArray(c.tags)?c.tags.filter(Boolean).slice(0,8):[];store[c.id]=c});
 const A=Object.values(col).filter(c=>c&&c.n>0);
 const term=(colSearch||"").trim().toLowerCase();
 const sq=sqParse(colSearch);
 let L=A.filter(c=>!fr.size||fr.has(c.r));
 if(sq)L=L.filter(c=>sqMatch(c,sq));
 if(colTagFilter===UNTAGGED_FILTER)L=L.filter(c=>(c.tags||[]).length===0);
 else if(colTagFilter)L=L.filter(c=>(c.tags||[]).includes(colTagFilter));
 if(colSort==="az")L.sort((a,b)=>a.t.localeCompare(b.t,"fr"));
 else if(colSort==="count")L.sort((a,b)=>b.n-a.n||a.t.localeCompare(b.t,"fr"));
 else if(colSort==="recent")L.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0)||b.r-a.r);
 else L.sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t,"fr"));
 const totalPages=Math.max(1,Math.ceil(L.length/COL_PAGE_SIZE));
 colPage=Math.min(Math.max(1,colPage),totalPages);saveCollectionState();
 const pageItems=L.slice((colPage-1)*COL_PAGE_SIZE,colPage*COL_PAGE_SIZE);
 const tags=colTags();
 const selectedVisible=pageItems.filter(c=>selHas(c.id)).length;
 const allVisible=pageItems.length>0&&selectedVisible===pageItems.length;
 const cnt=R.map((r,i)=>A.filter(c=>c.r==i).length);
 const escAttr=t=>(t||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 const wrap=c=>{const sel=selHas(c.id);const tagHtml=(c.tags||[]).map((t,ti)=>{const tc=tagColor(t,ti);return `<span class="colTag" title="${escAttr(t)}" data-card-tag="${escAttr(t)}" style="--tag-color:${tc};border-color:${tc};background:${tc}22;color:${tc}">🏷 ${escAttr(t)}</span>`}).join("");const untagged=!(c.tags||[]).length;return `<div class="colTile ${sel?"selected":""}" data-col-id="${c.id}"><button class="colPick ${sel?"on":""}" data-pick="${c.id}" title="${sel?"Désélectionner":"Sélectionner"}">${sel?"✓":""}</button>${untagged?`<span class="colNew">NON CLASSÉE</span>`:""}${card(c)}<span class="pocketFilm" aria-hidden="true"></span>${tagHtml?`<div class="colTags">${tagHtml}</div>`:""}</div>`};
 const single=main.clientWidth<900,per=bkPer,np=Math.max(1,Math.ceil(L.length/per)),step=single?1:2;
 bkIdx=Math.min(Math.max(0,bkIdx),np-1);if(!single)bkIdx-=bkIdx%2;
 const bcols=per==4?2:per==12?4:3,blab=colTagFilter===UNTAGGED_FILTER?"Sans étiquette":colTagFilter||"Toutes les cartes";
 const pocket=c=>c?`<div class="pkt">${wrap(c)}<i class="pkg"></i></div>`:`<div class="pkt empty"><i class="pkg"></i></div>`;
 const bkPage=(p,side)=>p>=np?`<div class="bkPage ${side} blank"></div>`:`<div class="bkPage ${side}"><div class="bkHead"><span>${escAttr(blab)}</span><b>${p+1}</b></div><div class="bkGrid" style="--cols:${bcols}">${Array.from({length:per},(_,i)=>pocket(L[p*per+i])).join("")}</div></div>`;
 const banim=bkAnim;bkAnim="";
 const bookHTML=`<div class="bkWrap"><div class="bkCover ${single?"single":""}"><div class="bkSpread ${banim?"enter"+banim:""}">${bkPage(bkIdx,"left")}${single?"":`<div class="bkRings">${"<i></i>".repeat(6)}</div>`+bkPage(bkIdx+1,"right")}</div></div>
  <div class="bkNav"><button class="btn g" id="bkPrev" ${bkIdx<=0?"disabled":""}>◀ Page précédente</button><span>${single||bkIdx+1>=np?"Page "+(bkIdx+1):"Pages "+(bkIdx+1)+"–"+Math.min(bkIdx+2,np)} / ${np} · ${L.length} cartes</span><button class="btn g" id="bkNext" ${bkIdx+step>=np?"disabled":""}>Page suivante ▶</button></div>${L.length?"":'<div class="msg">Aucune carte ne correspond à ta recherche ou à tes filtres.</div>'}</div>`;
 const visItems=colView==="binder"?L.slice(bkIdx*per,(bkIdx+step)*per):pageItems,allVis2=visItems.length>0&&visItems.every(c=>selHas(c.id));
 main.innerHTML=`<div class="colHead"><div><h2>📚 Ma collection</h2><div class="sub">${A.length} cartes différentes · ${A.reduce((s,c)=>s+c.n,0)} au total · ${L.length} dans le filtre</div></div></div>
  <!-- V118 : bandeau « Fusion · style reroll » retiré (la fusion reste dans le Laboratoire de cartes) -->
  <div class="colTools">
   <div class="colToolTop"><input id="colSearch" placeholder="🔍 Rechercher : un nom, un thème (scorpion, serpent, film, jeu vidéo, streamer…)" value="${colSearch.replace(/"/g,"&quot;")}"><select id="colSort"><option value="rar" ${colSort==="rar"?"selected":""}>Plus rares d'abord</option><option value="az" ${colSort==="az"?"selected":""}>A → Z</option><option value="count" ${colSort==="count"?"selected":""}>Plus de doublons</option><option value="recent" ${colSort==="recent"?"selected":""}>Plus récentes</option></select></div>
   <div class="colTagCreate"><span class="lab" style="margin:0">🏷 Étiquettes</span>${(()=>{const cnt=t=>A.filter(c=>(c.tags||[]).includes(t)).length,nt=A.filter(c=>!(c.tags||[]).length).length;
   const cur=colTagFilter===UNTAGGED_FILTER?`<span class="tpill" style="--tag-color:#6b6588">Sans étiquette (${nt})</span>`:colTagFilter&&tags.includes(colTagFilter)?`<span class="tpill" style="--tag-color:${tagColor(colTagFilter,tags.indexOf(colTagFilter))}">${tagLabel(colTagFilter)}</span>`:`<b style="padding:4px 4px">Toutes les étiquettes</b>`;
   return `<div class="tfdd" id="tfdd"><button type="button" class="tfbtn" id="tfbtn">${cur}<span class="chev">⌃</span></button><div class="tflist">
   <button type="button" class="tfi plain ${!colTagFilter?"on":""}" data-tag-filter="">Toutes les étiquettes</button><button type="button" class="tfi plain ${colTagFilter===UNTAGGED_FILTER?"on":""}" data-tag-filter="${UNTAGGED_FILTER}">Sans étiquette <span style="opacity:.7">(${nt})</span></button>
   ${tags.map((t,ti)=>`<button type="button" class="tfi ${colTagFilter===t?"on":""}" data-tag-filter="${escAttr(t)}"><span class="tpill" style="--tag-color:${tagColor(t,ti)}">${tagLabel(t)}<span class="tcount">(${cnt(t)})</span></span></button>`).join("")}</div></div>`})()}<input id="newTag" maxlength="40" placeholder="Créer une étiquette…"><input id="newTagColor" type="color" value="${tagColor("",tags.length)}" title="Couleur de la nouvelle étiquette" aria-label="Couleur de la nouvelle étiquette" style="width:44px;min-width:44px;height:42px;padding:3px;border-radius:10px"><button class="btn g" id="addTag">Ajouter</button><button class="btn g" id="manageTags">⚙️ Gérer</button></div>
   <div class="colActions"><button class="btn g" id="selectPage">${allVis2?"☐ Désélectionner la page":"☑ Sélectionner toute la page"}</button><button class="btn g" id="selAllFilter">${L.length&&L.every(c=>selHas(c.id))?"☐ Tout désélectionner":"☑ Tout sélectionner ("+L.length.toLocaleString("fr-FR")+")"}</button><button class="btn g" id="clearSel">✕ Effacer sélection</button><button class="btn g" id="multiTag">🏷 Plusieurs étiquettes</button><button class="btn g" id="rmTags">🧹 Retirer des étiquettes</button><button class="btn g" id="delSelected">🗑 Supprimer la sélection</button></div>
   <div class="colHint">Classeur : « Toutes » affiche tout, une étiquette affiche uniquement ses cartes, et « Sans étiquette » affiche les cartes non classées. 50 cartes maximum par page.</div>
  </div>
  <div class="chips">${R.map((r,i)=>HID.has(i)?"":`<button class="chip ${fr.has(i)?"on":""}" style="background:${r[1]}" data-r="${i}">${r[0]} (${cnt[i]})</button>`).join("")}</div>
  ${colView==="binder"?bookHTML:`<div class="binder"><div class="binderRail"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="binderPage"><div class="binderLabel"><span>WIKICOLLECT · CLASSEUR</span><b>Page ${colPage} / ${totalPages}</b></div><div id="g" class="grid lg colGrid">${pageItems.length?pageItems.map(wrap).join(""):'<div class="msg">Aucune carte ne correspond à ta recherche ou à tes filtres.</div>'}</div></div></div>`}
  <div class="pag" style="${colView==="binder"?"display:none":""}"><button class="btn g" id="colPrev" ${colPage<=1?"disabled":""}>← Précédent</button><span>Page <b>${colPage}</b> / <b>${totalPages}</b> · ${pageItems.length} cartes affichées</span><button class="btn g" id="colNext" ${colPage>=totalPages?"disabled":""}>Suivant →</button></div>`;

 main.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{const i=+b.dataset.r;fr.has(i)?fr.delete(i):fr.add(i);colPage=1;colSelected.clear();collection()});
 let colSearchTimer=null;
 main.querySelector("#colSearch").oninput=e=>{
   colSearch=e.target.value;colPage=1;colSelected.clear();saveCollectionState();
   clearTimeout(colSearchTimer);
   const input=e.target;
   colSearchTimer=setTimeout(()=>{
     const pos=input.selectionStart;
     collection();
     const ni=$("colSearch");
     if(ni){ni.focus();try{ni.setSelectionRange(pos,pos)}catch(_){wcDbg(_)}}
   },140);
 };
 main.querySelector("#colSearch").onkeydown=e=>{if(e.key==="Enter"){clearTimeout(colSearchTimer);collection()}};
 main.querySelector("#colSort").onchange=e=>{colSort=e.target.value;colPage=1;colSelected.clear();collection()};
 const bkP=$("bkPrev"),bkN=$("bkNext");
 const turn=d=>{const sp=document.querySelector(".bkSpread"),go=()=>{bkIdx=Math.max(0,bkIdx+d*step);bkAnim=d>0?"N":"P";saveBk();collection()};if(!sp){go();return}sp.classList.add(d>0?"leaveN":"leaveP");setTimeout(go,230)};
 if(bkP)bkP.onclick=()=>turn(-1);if(bkN)bkN.onclick=()=>turn(1);
 main.querySelector("#colPrev").onclick=()=>{if(colPage>1){colPage--;colSelected.clear();collection();main.scrollTo(0,0)}};
 main.querySelector("#colNext").onclick=()=>{if(colPage<totalPages){colPage++;colSelected.clear();collection();main.scrollTo(0,0)}};
 main.querySelector("#selectPage").onclick=()=>{if(allVis2)visItems.forEach(c=>selDel(c.id));else visItems.forEach(c=>selAdd(c.id));collection()};
 main.querySelector("#clearSel").onclick=()=>{selClear();collection()};
 main.querySelectorAll("[data-pick]").forEach(b=>b.onclick=e=>{e.stopPropagation();const id=selKey(b.dataset.pick);selHas(id)?selDel(id):selAdd(id);collection()});
 {const dd=$("tfdd"),bt=$("tfbtn");if(bt)bt.onclick=e=>{e.stopPropagation();dd.classList.toggle("open")};if(!window.__tfOut){window.__tfOut=1;document.addEventListener("click",e=>{const d=document.getElementById("tfdd");if(d&&!d.contains(e.target))d.classList.remove("open")})}}
 main.querySelectorAll("[data-tag-filter]").forEach(b=>b.onclick=()=>{colTagFilter=b.dataset.tagFilter||"";colPage=1;colSelected.clear();saveCollectionState();collection()});
 const tagTarget=()=>{
  // Une sélection explicite reste prioritaire, même après un rerendu de la collection.
  const ids=[...colSelected].map(selKey).filter(id=>Object.prototype.hasOwnProperty.call(col,id));
  return ids.length?ids:visItems.map(c=>c.id);
};
 const persistTagNames=names=>{const clean=[...new Set(names.map(cleanTag).filter(Boolean))];try{localStorage.setItem("wc_col_tags",JSON.stringify(clean))}catch(e){wcDbg(e)};saveColTagOrder([...colTagOrder().filter(t=>clean.includes(t)),...clean.filter(t=>!colTagOrder().includes(t))])};
 const addTag=()=>{const inp=$("newTag"),t=cleanTag(inp&&inp.value),ci=$("newTagColor"),tc=validTagColor(ci&&ci.value);if(!t)return;const target=tagTarget();if(!target.length)return toast("Aucune carte sélectionnée.");target.forEach(id=>{const c=col[id];if(c){c.tags=c.tags||[];if(!c.tags.includes(t))c.tags.push(t);c.tags=c.tags.slice(0,8)}});setTagColor(t,tc);persistTagNames([...colTags(),t]);save();toast(`🏷 Étiquette « ${t} » ajoutée à ${target.length} carte(s).`);collection()};
 main.querySelector("#addTag").onclick=addTag;main.querySelector("#newTag").onkeydown=e=>{if(e.key==="Enter")addTag()};
 main.querySelector("#manageTags").onclick=()=>{
  const cur=colTags();
  const rows=cur.map((t,i)=>{const tc=tagColor(t,i);return `<div class="tagMgrRow" data-tag-index="${i}"><span class="tagMgrBadge" style="color:${tc};background:${tc}22;border-color:${tc}">🏷</span><input class="tagMgrInput" data-old="${escAttr(t)}" value="${escAttr(t)}" maxlength="24"><input class="tagMgrColor" type="color" data-old="${escAttr(t)}" value="${tc}" title="Couleur de ${escAttr(t)}" aria-label="Couleur de ${escAttr(t)}"><button class="btn g" type="button" data-move-tag="up" ${i===0?"disabled":""}>↑</button><button class="btn g" type="button" data-move-tag="down" ${i===cur.length-1?"disabled":""}>↓</button><button class="btn g" data-rename-tag="${i}">Enregistrer</button><button class="btn g danger" data-delete-tag="${i}">Supprimer</button></div>`}).join("");
  M.style.display="flex";
  M.innerHTML=`<div class="mbox tagManager"><button class="btn g x" id="tagMgrClose">✕</button><h2>⚙️ Gérer les étiquettes</h2><div class="sub">Renomme, change la couleur, supprime et choisis l’ordre de tes étiquettes.</div><div id="tagMgrList" class="tagMgrList">${rows||'<div class="sub">Aucune étiquette créée.</div>'}</div></div>`;
  const close=()=>{M.style.display="none";M.innerHTML=""};
  $("tagMgrClose").onclick=close;
  M.querySelectorAll("[data-move-tag]").forEach(b=>b.onclick=()=>{const row=b.closest(".tagMgrRow"),idx=+row.dataset.tagIndex,dir=b.dataset.moveTag,next=dir==="up"?idx-1:idx+1;if(next<0||next>=cur.length)return;const order=[...cur],[item]=order.splice(idx,1);order.splice(next,0,item);saveColTagOrder(order);close();collection();toast(`↕ « ${item} » déplacée.`)});
  M.querySelectorAll("[data-rename-tag]").forEach(b=>b.onclick=()=>{
    const row=b.closest(".tagMgrRow"),inp=row.querySelector(".tagMgrInput"),ci=row.querySelector(".tagMgrColor"),old=inp.dataset.old,nu=cleanTag(inp.value),tc=validTagColor(ci&&ci.value);
    if(!nu)return toast("Le nom est vide.");
    if(old===nu)return toast("Aucun changement.");
    if(cur.includes(nu)&&nu!==old)return toast("Cette étiquette existe déjà.");
    Object.values(col).forEach(c=>{if(Array.isArray(c.tags))c.tags=c.tags.map(x=>x===old?nu:x)});
    const meta=tagMeta();delete meta[old];meta[nu]=tc;saveTagMeta(meta);
    persistTagNames(colTags().map(x=>x===old?nu:x));saveColTagOrder(colTagOrder().map(x=>x===old?nu:x));save();toast(`🏷 « ${old} » renommée en « ${nu} ».`);close();collection();
  });
  M.querySelectorAll("[data-delete-tag]").forEach(b=>b.onclick=()=>{
    const t=cur[+b.dataset.deleteTag];
    if(!confirm(`Supprimer l’étiquette « ${t} » de toutes les cartes ?`))return;
    Object.values(col).forEach(c=>{if(Array.isArray(c.tags))c.tags=c.tags.filter(x=>x!==t)});
    const meta=tagMeta();delete meta[t];saveTagMeta(meta);
    persistTagNames(colTags().filter(x=>x!==t));
    saveColTagOrder(colTagOrder().filter(x=>x!==t));
    if(colTagFilter===t)colTagFilter="";
    saveCollectionState();save();toast(`🗑 Étiquette « ${t} » supprimée.`);close();collection();
  });
 };

 {const ds=main.querySelector("#delSelected");if(ds)ds.onclick=()=>{const ids=[...colSelected].map(selKey).filter(id=>col[id]&&col[id].n>0);if(!ids.length)return toast("Sélectionne d'abord des cartes.");
  const copies=ids.reduce((a,id)=>a+col[id].n,0),gainT=copies*DISCARD_VALUE;
  if(!confirm("Défausser "+ids.length+" carte"+(ids.length>1?"s":"")+" ("+copies+" exemplaire"+(copies>1?"s":"")+" au total, tous les exemplaires de chaque carte sélectionnée) pour "+gainT.toLocaleString("fr-FR")+" 🪙 ?\n\nIrréversible."))return;
  ids.forEach(id=>delete col[id]);colSelected.clear();gain(gainT);save();toast("🗑 "+ids.length+" carte"+(ids.length>1?"s":"")+" défaussée"+(ids.length>1?"s":"")+" : +"+gainT.toLocaleString("fr-FR")+" 🪙");collection()}}
 {const sa=main.querySelector("#selAllFilter");if(sa)sa.onclick=()=>{const all=L.length>0&&L.every(c=>selHas(c.id));if(all)L.forEach(c=>selDel(c.id));else L.forEach(c=>selAdd(c.id));collection()}}
 main.querySelector("#rmTags").onclick=()=>{
  const target=tagTarget();if(!target.length)return toast("Aucune carte à traiter.");
  const cnt={};target.forEach(id=>{const c=col[id];(c&&c.tags||[]).forEach(t=>{cnt[t]=(cnt[t]||0)+1})});
  const names=Object.keys(cnt);if(!names.length)return toast("Ces cartes n'ont aucune étiquette.");
  const order=colTags();names.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
  const items=names.map(t=>{const tc=tagColor(t,order.indexOf(t));return `<label class="multiTagItem" style="--tag-color:${tc}"><input type="checkbox" value="${escAttr(t)}"><span class="tdot"></span><span class="mtn">${tagLabel(t)}</span><span class="rmn">${cnt[t]}</span></label>`}).join("");
  const pl=target.length>1?"s":"";
  M.style.display="flex";
  M.innerHTML=`<div class="mbox tagManager"><button class="btn g x" id="rmClose">✕</button><h2>🧹 Retirer des étiquettes</h2><div class="sub">${target.length.toLocaleString("fr-FR")} carte${pl} ciblée${pl}${colSelected.size?"":" (cartes de la page affichée : aucune sélection)"} · coche les étiquettes à retirer. Le nombre à droite = cartes qui l'ont.</div><div class="multiTagList">${items}</div><div class="mtfoot"><span class="sub" id="rmCount" style="margin:0 auto 0 0">0 cochée</span><button class="btn g" id="rmAll">Tout cocher</button><button class="btn g" id="rmCancel">Annuler</button><button class="btn dgr" id="rmApply" disabled>Retirer</button></div></div>`;
  const close=()=>{M.style.display="none";M.innerHTML=""};
  const boxes=()=>[...M.querySelectorAll(".multiTagItem input")],upd=()=>{const n=boxes().filter(x=>x.checked).length;$("rmCount").textContent=n+" cochée"+(n>1?"s":"");$("rmApply").disabled=!n};
  boxes().forEach(i=>i.onchange=upd);
  $("rmClose").onclick=close;$("rmCancel").onclick=close;
  $("rmAll").onclick=()=>{const all=boxes().every(x=>x.checked);boxes().forEach(x=>x.checked=!all);$("rmAll").textContent=all?"Tout cocher":"Tout décocher";upd()};
  $("rmApply").onclick=()=>{const chosen=new Set(boxes().filter(x=>x.checked).map(x=>x.value));if(!chosen.size)return;
   const nb=target.filter(id=>{const c=col[id];return c&&(c.tags||[]).some(t=>chosen.has(t))}).length;
   if(!confirm(`Retirer ${chosen.size} étiquette${chosen.size>1?"s":""} de ${nb.toLocaleString("fr-FR")} carte${nb>1?"s":""} ?`))return;
   target.forEach(id=>{const c=col[id];if(c&&Array.isArray(c.tags))c.tags=c.tags.filter(t=>!chosen.has(t))});
   save();toast(`🧹 ${chosen.size} étiquette${chosen.size>1?"s":""} retirée${chosen.size>1?"s":""} de ${nb.toLocaleString("fr-FR")} carte${nb>1?"s":""}.`);close();collection();
  };
 };
 main.querySelector("#multiTag").onclick=()=>{
  const cur=colTags(),target=tagTarget();
  if(!target.length)return toast("Sélectionne au moins une carte.");
  const choices=cur.map((t,i)=>{const tc=tagColor(t,i);return `<label class="multiTagItem" style="--tag-color:${tc}"><input type="checkbox" value="${escAttr(t)}"><span class="tdot"></span><span class="mtn">${tagLabel(t)}</span></label>`}).join("");
  M.style.display="flex";
  M.innerHTML=`<div class="mbox tagManager"><button class="btn g x" id="multiTagClose">✕</button><h2>🏷 Ajouter plusieurs étiquettes</h2><div class="sub">${target.length} carte${target.length>1?"s":""} ciblée${target.length>1?"s":""} · coche une ou plusieurs étiquettes à ajouter.</div><div class="multiTagList">${choices||'<div class="sub">Crée d’abord une étiquette.</div>'}</div><div class="mtfoot"><span class="sub" id="mtcount" style="margin:0 auto 0 0">0 sélectionnée</span><button class="btn g" id="multiTagClose2">Annuler</button><button class="btn" id="applyMultiTags" ${cur.length?"":"disabled"}>Appliquer</button></div></div>`;
  const close=()=>{M.style.display="none";M.innerHTML=""};
  $("multiTagClose").onclick=close;$("multiTagClose2").onclick=close;
  M.querySelectorAll(".multiTagItem input").forEach(i=>i.onchange=()=>{const n=M.querySelectorAll(".multiTagItem input:checked").length;$("mtcount").textContent=n+" sélectionnée"+(n>1?"s":"")});
  const ap=$("applyMultiTags");
  if(ap)ap.onclick=()=>{
    const chosen=[...M.querySelectorAll(".multiTagItem input:checked")].map(x=>x.value);
    if(!chosen.length)return toast("Choisis au moins une étiquette.");
    target.forEach(id=>{const c=col[id];if(c){c.tags=c.tags||[];chosen.forEach(t=>{if(!c.tags.includes(t)&&c.tags.length<8)c.tags.push(t)})}});
    save();toast(`🏷 ${chosen.length} étiquette(s) appliquée(s) à ${target.length} carte(s).`);close();collection();
  };
 };
 bind($("g")||main.querySelector(".bkWrap")||main,false);main.querySelectorAll(".colTile .card").forEach(e=>{e.onclick=()=>openModal(e.dataset.id)});
 main.querySelectorAll(".colTile").forEach(w=>w.onclick=e=>{
  // Seul le clic sur la zone de la pochette sélectionne/désélectionne la carte.
  // Les étiquettes, boutons et la carte elle-même ne doivent jamais inverser la sélection par accident.
  if(e.target.closest("button,.card,.colTags,.colTag"))return;
  const id=selKey(w.dataset.colId);
  if(!id)return;
  selHas(id)?selDel(id):selAdd(id);
  collection();
});
 const tagButtons=main.querySelectorAll(".colTag");tagButtons.forEach(b=>b.onclick=e=>{e.stopPropagation();colTagFilter=b.dataset.cardTag||"";colPage=1;colSelected.clear();saveCollectionState();collection()});
}
/* ===== CRÉATEURS ===== */
function creators(){
 const L=CRE.filter(c=>!fr.size||fr.has(c.r)).sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t));
 main.innerHTML=`<h2>Créateurs</h2><div class="sub">${CRE.length} YouTubeurs & streamers · rareté selon leur popularité · photo de profil (carte supprimée si elle ne charge pas)</div><div class="chips">${R.map((r,i)=>HID.has(i)?"":`<button class="chip ${fr.has(i)?"on":""}" style="background:${r[1]}" data-r="${i}">${r[0]}</button>`).join("")}</div><div id="g" class="grid">${L.map(card).join("")}</div>`;
 main.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{const i=+b.dataset.r;fr.has(i)?fr.delete(i):fr.add(i);creators()});bind($("g"))}
$("hw").onclick=()=>{M.style.display="flex";M.innerHTML=`<div class="mbox" style="flex-direction:column"><button class="btn g x" id="mx">✕</button><h2>Comment ça marche ?</h2><div class="sub">Chaque carte est un vrai article Wikipédia (ou un créateur). Sa rareté dépend du nombre de <b>vues par mois</b> de la page : plus elle est consultée, plus la carte est rare.</div>${R.map((r,i)=>HID.has(i)?"":`<div class="row"><span style="color:${r[1]};font-weight:800">${SYM[i]} ${r[0]}</span><span>${i==0?"moins de "+THR[1]:THR[i].toLocaleString("fr-FR")+"+"} vues/mois</span></div>`).join("")}<p class="sub" style="margin-top:14px">Les sujets sexuels (+5 rangs) et les drames / attentats (+3 rangs) montent en grade. Boosters : 10 max, 1 rechargé toutes les 10 minutes. « Toutes les cartes » est classé de la plus rare à la plus commune.</p><button class="btn" id="mo">Compris !</button></div>`;$("mx").onclick=$("mo").onclick=closeModal};
[0,1,2,3,4,5,6,7,8].forEach(i=>{const e=$("t"+i);if(e)e.onclick=()=>{tab=i;render()}});
/* V92 : après le reset, la collection reste réellement vide. Aucun cadeau de test automatique. */
try{col=JSON.parse(localStorage.getItem("wc_col")||"{}");hyd()}catch(e){wcDbg(e)}
upM();render();

function closeFusionPicker(){const o=$("fusionPickOverlay");if(o)o.remove()}
function openFusionPicker(){
 const A=Object.values(col).filter(c=>c&&c.n>=3&&c.r<7).sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t));
 let pickedId=null,picked=0;
 const slots=()=>Array.from({length:3},(_,i)=>{const c=pickedId&&picked>i?store[pickedId]:null;return `<div class="fpSlot ${c?'filled':''}">${c?`${card({...c,n:1})}<button class="fpRm" data-rm="${i}" title="Retirer">✕</button>`:`<span class="mut">Emplacement ${i+1}</span><small class="mut">Dépose la même carte ici</small>`}</div>`}).join("");
 const eligible=c=>!pickedId||pickedId===c.id;
 const deck=()=>A.map(c=>`<div class="fpCard ${eligible(c)?'':'locked'}" data-add="${c.id}"><img src="${c.img}" referrerpolicy="no-referrer"><div class="fpMeta"><b>${c.t}</b><span>${rarityName(c.r)}</span></div><div class="fpCount">Possédées : ×${c.n}</div><div style="display:flex;gap:5px;margin-top:7px"><button class="btn g" data-one="${c.id}" style="flex:1;padding:7px 8px;font-size:11px">+ 1</button><button class="btn" data-three="${c.id}" style="flex:1;padding:7px 8px;font-size:11px">+ 3</button></div></div>`).join("");
 const o=document.createElement("div");o.id="fusionPickOverlay";o.className="fusionPickOverlay";
 o.innerHTML=`<div class="fusionPicker"><div class="fusionPickHead"><div><h2>⚗️ Fusion</h2><div class="mut">Choisis uniquement une carte que tu possèdes en <b>3 exemplaires ou plus</b>, puis ajoute-la par <b>+1</b> ou <b>+3</b>.</div></div><button class="btn g" id="fpClose">✕ Fermer</button></div><div class="fpPill" style="margin-top:14px">Règle <strong>même rareté ou supérieure</strong> · 70 % / 25 % / 5 %</div><div class="fpSlots" id="fpSlots">${slots()}</div><div class="fpDeck" id="fpDeck">${deck()||'<div class="msg">Aucune carte compatible.</div>'}</div><div class="fpActions"><span class="fpPill">Cartes placées : <strong id="fpCount">${picked}/3</strong></span><button class="btn" id="fpGo" disabled>⚗️ FUSIONNER</button></div><div class="fpHint">Astuce : clique 3 fois sur la même carte ou utilise « +3 ».</div></div>`;
 document.body.appendChild(o);
 const paint=()=>{$("fpSlots").innerHTML=slots();$("fpCount").textContent=`${picked}/3`;$("fpGo").disabled=picked!==3||!pickedId;const D=$("fpDeck");if(D)D.querySelectorAll(".fpCard").forEach(e=>e.classList.toggle("locked",!eligible({id:e.dataset.add})));};
 const add=(id,n=1)=>{const c=col[id];if(!c)return;if(pickedId&&pickedId!==id)return;pickedId=id;picked=Math.min(3,picked+n);paint()};
 o.querySelectorAll("[data-one]").forEach(b=>b.onclick=e=>{e.stopPropagation();add(b.dataset.one,1)});
 o.querySelectorAll("[data-three]").forEach(b=>b.onclick=e=>{e.stopPropagation();add(b.dataset.three,3)});
 o.querySelector("#fpDeck").addEventListener("click",e=>{const c=e.target.closest(".fpCard");if(c&&!e.target.closest("button"))add(c.dataset.add,1)});
 o.querySelector("#fpSlots").addEventListener("click",e=>{const b=e.target.closest("[data-rm]");if(!b)return;const i=+b.dataset.rm;if(i<picked)picked--;if(picked<=0)pickedId=null;paint()});
 o.querySelector("#fpClose").onclick=closeFusionPicker;
 o.querySelector("#fpGo").onclick=()=>{if(picked!==3||!pickedId)return;const c=col[pickedId];if(!c||c.n<3)return;closeFusionPicker();fusionSame(c)};
}
function fusionHTML(A){
 const candidates=A.filter(c=>c.n>=3&&c.r<7).sort((a,b)=>a.r-b.r||a.t.localeCompare(b.t));
 return `<div class="fusion"><div class="dhero"><div><h3 style="margin:0">⚗️ Fusion · style reroll</h3><div class="mut" style="font-size:12px">Choisis 3 exemplaires de la même carte, puis lance la fusion.</div></div><span class="mut" style="font-size:12px">${candidates.length} carte(s) prête(s)</span></div><div class="frow" style="margin-top:12px"><span class="fpPill">3 identiques → 1 carte</span><span class="fpPill">Même rareté <strong>70 %</strong></span><span class="fpPill">+1 <strong>25 %</strong></span><span class="fpPill">+2 <strong>5 %</strong></span><button class="btn" id="openFusionPicker">⚗️ Ouvrir la fusion</button></div>${candidates.length?`<div class="mut" style="font-size:11px;margin-top:10px">Disponible : ${candidates.slice(0,8).map(c=>`${c.t} ×${c.n}`).join(" · ")}${candidates.length>8?'…':''}</div>`:`<div class="mut" style="font-size:11px;margin-top:10px">Il faut 3 exemplaires d'une même carte.</div>`}</div>`
}

/* Better casino landing page */
function casino(g){
 try{SFX.stopAll()}catch(e){wcDbg(e)}
 if(g=="roulette")return roulette();if(g=="blackjack")return blackjack();if(g=="slots")return slots();if(g=="mines")return mines();
 if(g=="coin")return coinflip();if(g=="double")return doublegame();if(g=="cardcases")return cardcases();if(g=="upgrade")return cardupgrade();if(g=="crash")return crash();
 const games=[
  ["roulette","🎡","Roulette","Table européenne · numéros, couleurs, douzaines.","CLASSIQUE","Mise dès 1 🪙"],
  ["blackjack","🃏","Blackjack","6 jeux · double, split et assurance.","CARDS","Mise dès 1 🪙"],
  ["mines","💣","Mines","Chaque clic peut faire monter ton multiplicateur.","RISK","Mise dès 1 🪙"],
  ["slots","🎰","Machine à sous","5 rouleaux · 20 lignes · bonus gratuits.","HOT","Mise dès 20 🪙"],
  ["coin","🪙","Pile ou Face","Un duel instantané avec vraie animation de pièce.","FAST","Gain 2×"],
  ["double","✖️","Double ou Rien","Monte étape par étape et encaisse quand tu veux.","CLIMB","Risque à chaque clic"],
  ["cardcases","🃏","Card Case Opening","Cases avec de vraies cartes du catalogue.","CARDS","À partir de 250 🪙"],
  ["upgrade","⬆️","Card Upgrade","Carte contre carte · chance affichée avant le clic.","UPGRADE","Carte contre carte"],
  ["crash","✈️","Crash","Le multiplicateur monte, tu choisis quand sortir.","LIVE","Mise dès 1 🪙"]
 ];
 main.innerHTML=`<div class="casino-v2"><div class="arcade-head"><div><h2>🎰 Casino</h2><div class="sub">Une mini-arcade interactive · chaque jeu a ses propres animations et interactions.</div></div><div class="arcade-stat"><div><b>${money.toLocaleString('fr-FR')}</b><span>SOLDE 🪙</span></div><div><b>${WCJ.toLocaleString('fr-FR')}</b><span>JACKPOT 🪙</span></div><div><b>${Object.values(col).reduce((s,c)=>s+c.n,0)}</b><span>CARTES</span></div></div></div>
  <div class="jbox" style="margin-bottom:16px"><div class="jnum">${WCJ.toLocaleString("fr-FR")} 🪙</div><div class="jsub">JACKPOT WIKICOLLECT · 2 % des mises alimentent la cagnotte</div><div class="frow" style="justify-content:center;margin-top:10px"><button class="btn" id="jgo">🎯 Tenter le jackpot · 1000 🪙</button><span class="mut" style="font-size:11px">chance rare · animation instantanée</span></div><div class="jhist">${WCJL.map(x=>`<span>${x.n} · ${x.p.toLocaleString("fr-FR")} 🪙</span>`).join("")||"<span>Aucun gagnant récent</span>"}</div></div>
  <div class="casino-grid">${games.map(x=>`<div class="cg" data-g="${x[0]}"><span class="badge">${x[4]}</span><div class="ico">${x[1]}</div><div><h3>${x[2]}</h3><p>${x[3]}</p></div><div class="cglive"><i></i>PRÊT À JOUER</div><div class="cost">${x[5]}</div></div>`).join("")}</div>
  <button class="btn g" id="dly" style="margin-top:22px">🎁 Cadeau quotidien : +200 🪙</button></div>`;
 main.querySelectorAll(".cg").forEach(e=>e.onclick=()=>casino(e.dataset.g));
 $("jgo").onclick=()=>{if(money<1000)return alert("Pas assez de pièces.");money-=1000;WCJ+=20;save();saveJ();upM();const win=Math.random()<0.01;if(win){const w=WCJ;WCJ=10000;WCJL.unshift({n:"Toi",p:w,ts:Date.now()});saveJ();gain(w);toast("🏆 JACKPOT : +"+w.toLocaleString("fr-FR")+" 🪙");casino()}else toast("Pas cette fois… le jackpot continue de monter.")};
 $("dly").onclick=()=>{const l=+localStorage.getItem("wc_dly")||0;if(Date.now()-l<864e5)return alert("Reviens dans "+fmt(864e5-(Date.now()-l))+".");try{localStorage.setItem("wc_dly",Date.now())}catch(e){wcDbg(e)}gain(200)};
}

/* Better Pile ou Face */
function coinflip(){
 let bet=50,choice="pile",busy=false,streak=0;
 main.innerHTML=`${bk()}<div class="cgame"><h2>🪙 Pile ou Face</h2><div class="sub">Choisis ton côté. La pièce tourne avant de révéler le résultat.</div><div class="choice-row"><button class="btn g choice sel" data-c="pile">🪙 Pile</button><button class="btn g choice" data-c="face">🔵 Face</button></div><div class="coin3dWrap"><div class="coin3d" id="coin3d"><span>🪙 PILE</span><span class="back">🔵 FACE</span></div></div><div class="bar" style="justify-content:center"><span class="sub" style="align-self:center">Mise :</span><input id="cfb" type="number" min="1" value="${bet}"><button class="btn" id="cgo">Lancer la pièce</button></div><div id="cfr" class="bjm">Prêt · série ${streak}</div></div>`;
 $("bk").onclick=()=>casino();main.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{if(busy)return;choice=b.dataset.c;main.querySelectorAll(".choice").forEach(x=>x.classList.toggle("sel",x===b))});
 $("cgo").onclick=()=>{if(busy)return;SFX.coin();bet=Math.floor(+$("cfb").value);if(!take(bet))return;busy=true;$("cgo").disabled=true;const coin=$("coin3d");coin.classList.remove("flip");void coin.offsetWidth;coin.classList.add("flip");let n=0;const iv=setInterval(()=>{n++;if(n%2==0)coin.style.filter="brightness(1.25)";else coin.style.filter="brightness(.9)";if(n>14){clearInterval(iv);coin.style.filter="";const r=Math.random()<.5?"pile":"face";const ok=r===choice;if(ok){streak++;gain(bet*2);$("cfr").innerHTML=`🎉 ${r=="pile"?"🪙 Pile":"🔵 Face"} · <b>+${bet*2} 🪙</b><div class="sub" style="margin:4px 0 0">Série : ${streak}</div>`}else{streak=0;$("cfr").innerHTML=`❌ ${r=="pile"?"🪙 Pile":"🔵 Face"} · Perdu<div class="sub" style="margin:4px 0 0">La série repart à zéro</div>`}busy=false;$("cgo").disabled=false}},170)};
}

/* Better Double ou Rien with a visible ladder */
function doublegame(){
 let G=null,busy=false;const levels=[1,2,3,4,5,8,12,20];
 const paint=()=>{const active=!!G&&!G.over,next=G?levels[Math.min(levels.length-1,G.i+1)]:2;main.innerHTML=`${bk()}<div class="cgame double-v2"><h2>✖️ Double ou Rien</h2><div class="sub">À chaque clic, 50 % de chance de monter. Tu peux encaisser à n'importe quelle étape.</div><div class="double-ladder">${levels.map((v,i)=>`<span class="${G&&G.i==i?'on':G&&G.i+1==i?'next':''}">×${v}</span>`).join('')}</div><div class="double-wheel"><div class="double-core"><b>${G?('×'+G.m.toFixed(2)):'×1.00'}</b><span>multiplicateur</span><div style="font-size:20px;font-weight:900;color:#ffd23c;margin-top:6px">${G?Math.floor(G.bet*G.m).toLocaleString('fr-FR'):0} 🪙</div></div></div><div class="bar" style="justify-content:center"><span class="sub" style="align-self:center">Mise :</span><input id="dbet" type="number" min="1" value="${G?G.bet:50}" ${active?'disabled':''}><button class="btn g" id="dstart" ${active?'disabled':''}>Commencer</button></div><div class="bar" style="justify-content:center"><button class="btn" id="drisk" ${active?'':'disabled'}>🎲 Tenter ×${next}</button><button class="btn g" id="dcash" ${active&&G.i>=0?'':'disabled'}>💰 Encaisser ${active?Math.floor(G.bet*G.m).toLocaleString('fr-FR'):''} 🪙</button></div><div id="dmsg" class="bjm">${G&&G.msg?G.msg:'Choisis ton risque.'}</div></div>`;$("bk").onclick=()=>casino();$("dstart").onclick=start;$("drisk").onclick=risk;$("dcash").onclick=cash};
 const start=()=>{if(G&&!G.over)return;const b=Math.floor(+$("dbet").value);if(!b||b<1||b>money)return alert("Mise invalide ou pas assez de pièces.");if(!take(b))return;G={bet:b,m:1,i:0,over:false,msg:"Tu es à ×1.00."};paint()};
 const risk=()=>{if(busy||!G||G.over)return;busy=true;$("drisk").disabled=true;$("dcash").disabled=true;const next=levels[Math.min(levels.length-1,G.i+1)];const core=document.querySelector(".double-core");const msg=$("dmsg");if(core){core.classList.remove("double-suspense");void core.offsetWidth;core.classList.add("double-suspense");}if(msg){msg.className="bjm double-thinking";msg.innerHTML=`<span>⚡ Tirage en cours</span><small>Calcul du résultat…</small>`;}let ticks=0;const fake=setInterval(()=>{ticks++;if(core){const f=(0.85+Math.random()*0.3).toFixed(2);core.style.setProperty("--pulse",f);}if(msg){const dots=".".repeat((ticks%3)+1);msg.querySelector("span")&&(msg.querySelector("span").textContent=`⚡ Tirage en cours${dots}`)}},180);setTimeout(()=>{clearInterval(fake);if(core)core.style.removeProperty("--pulse");const win=Math.random()<.5,target=next;if(win){G.i=Math.min(levels.length-1,G.i+1);G.m=levels[G.i];G.msg=`✅ Passage à ×${G.m}.`;if(G.i>=levels.length-1){G.over=true;const w=Math.floor(G.bet*G.m);gain(w);G.msg=`🏆 Maximum atteint · +${w.toLocaleString('fr-FR')} 🪙`}}else{G.over=true;G.msg=`💥 Échec sur ×${target} · mise perdue.`}busy=false;paint()},2600)};
 const cash=()=>{if(busy||!G||G.over)return;const w=Math.floor(G.bet*G.m);G.over=true;gain(w);G.msg=`✅ Encaissé à ×${G.m} · +${w.toLocaleString('fr-FR')} 🪙`;paint()};paint();
}

/* Better slots with lever interaction while preserving the existing reel math */
const _oldSlots=slotsBase;
function slots(){
 _oldSlots();
 setTimeout(()=>{
  const root=$("sr")?.closest(".slm");if(!root)return;root.classList.add("slots-v2");
  const bar=root.querySelector("#sp")?.parentElement; if(bar&&!root.querySelector(".slot-machine-head")){
   const head=document.createElement("div");head.className="slot-machine-head";head.innerHTML='<div><b>🎰 WIKICOLLECT JACKPOT REELS</b><div class="slot-led">20 LIGNES · WILD 🃏 · SCATTER 🎰</div></div><div class="slot-lever" id="slotLever"><span class="rod"></span><span class="ball"></span></div>';root.insertBefore(head,root.firstChild);const lv=$("slotLever"),sp=$("sp");if(lv&&sp)lv.onclick=()=>{if(sp.disabled)return;lv.classList.add("pull");setTimeout(()=>lv.classList.remove("pull"),350);sp.click()};
  }
 },0);
}

/* Global interaction layer */
(function(){
 const rip=e=>{const b=e.target.closest&&e.target.closest(".btn,.choice,.cg,.mc,.case-tab,.fpCard");if(!b||b.disabled)return;const r=b.getBoundingClientRect();if(getComputedStyle(b).position==="static")b.style.position="relative";b.style.overflow="hidden";const s=document.createElement("i");s.className="rippleFx";const d=Math.max(r.width,r.height)*.55;s.style.width=s.style.height=d+"px";s.style.left=(e.clientX-r.left-d/2)+"px";s.style.top=(e.clientY-r.top-d/2)+"px";b.appendChild(s);setTimeout(()=>s.remove(),700)};
 document.addEventListener("pointerdown",rip,{passive:true});
 document.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".cg,.game-tile,.cgame,.case-tab,.fpCard");if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(850px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateY(-2px)`},{passive:true});
 document.addEventListener("pointerout",e=>{const c=e.target.closest&&e.target.closest(".cg,.game-tile,.cgame,.case-tab,.fpCard");if(c&&!c.contains(e.relatedTarget))c.style.transform=""});
 document.addEventListener("click",e=>{const m=e.target.closest&&e.target.closest(".mc");if(m){m.classList.contains("ok")?SFX.click():m.classList.contains("bm")&&SFX.lose();setTimeout(()=>{if(m.classList.contains("ok")){m.classList.add("pop");setTimeout(()=>m.classList.remove("pop"),450)}else if(m.classList.contains("bm")){m.classList.add("shake");setTimeout(()=>m.classList.remove("shake"),500)}},10)}});
})();

/* ===== V64 : identité + système audio WebAudio enrichi ===== */
const SFX=(()=>{
 // Sons doux : sinus / triangle filtrés, attaque arrondie, cloches pentatoniques, léger écho. Aucune onde carrée ni aiguë.
 let ctx=null,master=null,bus=null,activeSpin=null,enabled=true,vol=.55;
 try{enabled=localStorage.getItem('wc_sound')!=='0';const v=parseFloat(localStorage.getItem('wc_vol2'));if(v>=0&&v<=1)vol=v}catch(e){wcDbg(e)}
 const init=()=>{
  if(!enabled)return null;
  if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();
   master=ctx.createGain();master.gain.value=vol;
   const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;lp.Q.value=.4;
   const cp=ctx.createDynamicsCompressor();cp.threshold.value=-16;cp.ratio.value=5;
   master.connect(lp);lp.connect(cp);cp.connect(ctx.destination);
   bus=ctx.createGain();bus.gain.value=1;bus.connect(master);
   try{const len=Math.floor(ctx.sampleRate*1.7),ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);let l=0;for(let k=0;k<len;k++){l=l*.72+(Math.random()*2-1)*.28;d[k]=l*Math.pow(1-k/len,3.4)}}
    const cv=ctx.createConvolver();cv.buffer=ir;const wet=ctx.createGain();wet.gain.value=.3;bus.connect(cv);cv.connect(wet);wet.connect(master)}catch(e){wcDbg(e)}}
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
 };
 const voice=(f,d=.1,type='sine',v=.1,delay=0,to=null,att=.012,dst=null)=>{
  const c=init();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
  o.type=(type==='square'||type==='sawtooth')?'triangle':type;o.frequency.setValueAtTime(f,t);if(to!=null)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+d);
  lp.type='lowpass';lp.frequency.value=Math.min(4200,Math.max(900,f*4));lp.Q.value=.4;
  att=Math.min(att,d*.9);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(lp);lp.connect(g);g.connect(dst||bus);o.start(t);o.stop(t+d+.04);
 };
 const tone=(f,d=.1,type='sine',v=.12,delay=0,to=null)=>voice(f,d,type,v*.6,delay,to);
 const soft=(d=.15,v=.06,f0=500,f1=1500,delay=0,Q=.7,dst=null)=>{
  const c=init();if(!c)return;const t=c.currentTime+delay,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
  const n=c.createBufferSource(),f=c.createBiquadFilter(),l=c.createBiquadFilter(),g=c.createGain();
  f.type='bandpass';f.Q.value=Q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(60,f1),t+d);l.type='lowpass';l.frequency.value=2800;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.04,d/3));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  n.buffer=b;n.connect(f);f.connect(l);l.connect(g);g.connect(dst||bus);n.start(t);n.stop(t+d+.02);
 };
 const noise=(d=.1,v=.1,delay=0)=>soft(d,v*.5,450,1500,delay,.6);
 const bell=(f,d=.7,v=.1,delay=0)=>{voice(f,d,'sine',v,delay,null,.006);voice(f*2.01,d*.5,'sine',v*.25,delay,null,.004);voice(f*3.02,d*.28,'sine',v*.08,delay,null,.003)};
 const pad=(fs,d=1.6,v=.06,delay=0)=>fs.forEach(f=>voice(f,d,'sine',v,delay,null,d*.35));
 const seq=a=>a.forEach(x=>tone(...x));
 const P=[262,294,330,392,440,523,587,659,784,880,1047,1175,1319,1568];
 const click=()=>{voice(520,.07,'sine',.07);voice(780,.05,'sine',.025,.008)};
 const nav=()=>voice(392,.13,'sine',.07);
 const bet=()=>{voice(330,.1,'sine',.08);voice(440,.12,'sine',.06,.06)};
 const cut=()=>{soft(.18,.06,900,2200);voice(620,.05,'triangle',.05,.02)};
 const packOpen=()=>{soft(.5,.08,300,1800);bell(659,.6,.06,.2)};
 let riserG=null;
 const riserStop=()=>{if(riserG&&ctx){try{riserG.gain.cancelScheduledValues(ctx.currentTime);riserG.gain.setTargetAtTime(0,ctx.currentTime,.06)}catch(e){wcDbg(e)}}riserG=null};
 const swell=(d=3)=>{const c=init();if(!c)return;riserStop();const g=c.createGain();g.gain.value=1;g.connect(bus);riserG=g;voice(130,d,'sine',.07,0,520,d*.85,g);soft(d,.05,250,1500,0,.9,g)};
 const riser=(d=3)=>swell(d);
 const boom=()=>{voice(110,.7,'sine',.2,0,44,.01);voice(55,.9,'sine',.09,.02,40,.02)};
 const sparkle=(n=6,base=1000)=>{for(let i=0;i<n;i++)bell(Math.min(1900,base*[1,1.125,1.25,1.5,1.667,2][i%6]*(i>5?2:1)),.5,.04,i*.075)};
 const fanfare=(r=0)=>{
  if(r<3)return;
  if(r<=4){[523,659,784].concat(r==4?[1047]:[]).forEach((f,i)=>bell(f,.8,.08,i*.09));return}
  if(r<=6){pad([262,330,392],1.3,.05);[523,659,784,1047,1319].forEach((f,i)=>bell(f,.9,.075,i*.08));return}
  pad([196,262,330,392],1.9,.06);[392,523,659,784,1047,1319].forEach((f,i)=>bell(f,1,.08,i*.09));boom();
  if(r>=7){pad([262,330,392,523],1.9,.05,.5);sparkle(8,900);pad([330,392,494,659],2.2,.05,1.0);[1047,1319,1568,1760].forEach((f,i)=>bell(f,1.4,.06,.9+i*.14));swell(1.6)}};
 const reveal=(r=0)=>{const f=P[Math.max(0,Math.min(7,r))+2];bell(f,.5,.08);fanfare(r)};
 const clue=()=>{bell(784,.7,.09);bell(1175,.8,.06,.1)};
 const fusionStart=()=>{voice(220,.7,'sine',.07,0,660,.4);soft(.6,.05,300,1600)};
 const fusionSuccess=(r=0)=>{const b=P[Math.min(7,r)+1];[b,b*1.25,b*1.5,b*2].forEach((f,i)=>bell(Math.min(f,1900),.8,.07,i*.1))};
 const fusionFail=()=>{voice(294,.3,'sine',.09,0,220);voice(220,.4,'sine',.08,.18,165)};
 const win=()=>[523,659,784,1047].forEach((f,i)=>bell(f,.7,.08,i*.09));
 const lose=()=>{voice(262,.35,'sine',.08,0,196);voice(196,.45,'sine',.07,.2,147)};
 const trackedTimers=new Set();
 const tick=(k=0)=>{voice(440+(k%5)*28,.04,'sine',.05);soft(.025,.025,800,1200)};
 const rouletteTick=()=>tick(Math.floor(Math.random()*5));
 const spin=(duration=3000)=>{if(activeSpin)activeSpin();const ms=Math.max(120,duration|0);let stopped=false,n=0;const id=setInterval(()=>{if(stopped)return;tick(n++)},170);trackedTimers.add(id);const to=setTimeout(()=>stop(),ms+60);trackedTimers.add(to);const stop=()=>{if(stopped)return;stopped=true;clearInterval(id);clearTimeout(to);trackedTimers.delete(id);trackedTimers.delete(to);if(activeSpin===stop)activeSpin=null};activeSpin=stop;return stop};
 const suspense=(d=2600)=>{let n=0;const step=Math.max(180,Math.floor(d/12));const id=setInterval(()=>{n++;voice(262+n*16,.07,'sine',.05);if(n>=Math.ceil(d/step))clearInterval(id)},step);trackedTimers.add(id);return id};
 const stopAll=()=>{riserStop();if(activeSpin){try{activeSpin()}catch(e){wcDbg(e)}activeSpin=null}for(const id of trackedTimers){clearInterval(id);clearTimeout(id)}trackedTimers.clear()};
 const coin=()=>{for(let i=0;i<7;i++)bell(P[5+(i%4)]*(i>3?1.5:1),.35,.04,i*.1)};
 const upgrade=()=>{voice(262,.4,'sine',.08,0,523,.2);bell(784,.7,.07,.32)};
 const slots=()=>{for(let i=0;i<10;i++)voice(P[3+(i*3)%6],.07,'sine',.04,i*.13)};
 const scratch=()=>soft(.1,.05,700,1500);
 const cardDraw=()=>{soft(.1,.06,500,1400);voice(330,.07,'sine',.04,.02)};
 const cardFlip=()=>{soft(.13,.07,350,1300);voice(523,.14,'sine',.05,.05)};
 const cardPlace=()=>{voice(260,.08,'sine',.06);voice(390,.07,'sine',.03,.03)};
 const reelStop=()=>{voice(180,.2,'sine',.1,0,110,.01);bell(523,.5,.05,.06)};
 const tear=()=>{soft(.55,.09,500,2600);for(let i=0;i<7;i++)soft(.03,.045,700,1400,i*.065)};
 const snip=()=>{voice(660,.05,'triangle',.06,0,520,.004);soft(.03,.04,900,1400)};
 const bid=()=>{voice(523,.12,'sine',.07);voice(784,.15,'sine',.06,.06)};
 const outbid=()=>{voice(330,.14,'sine',.07);voice(247,.22,'sine',.07,.1)};
 let lastCash=0;const cash=()=>{const n=performance.now();if(n-lastCash<250)return;lastCash=n;bell(1319,.5,.06);bell(1760,.6,.05,.08)};
 const notify=()=>bell(880,.45,.07);
 const error=()=>{voice(196,.2,'sine',.09);voice(165,.25,'sine',.07,.1)};
 const open=()=>{soft(.14,.04,350,1000);voice(440,.1,'sine',.04,.03,520)};
 const close=()=>voice(392,.1,'sine',.04,0,330);
 let lastHover=0;const hover=(r=3)=>{const n=performance.now();if(n-lastHover<250)return;lastHover=n;bell(1046+r*30,.4,.025)};
 const gem=()=>{bell(1047,.5,.08);bell(1568,.6,.055,.06)};
 const mineBoom=()=>{boom();soft(.3,.07,300,500)};
 const crashBoom=()=>{boom();voice(330,.5,'sine',.05,0,120)};
 const chip=()=>{voice(300,.06,'sine',.06,0,230);soft(.02,.03,900,1300)};
 const setVol=v=>{vol=Math.max(0,Math.min(1,v));try{localStorage.setItem('wc_vol2',vol)}catch(e){wcDbg(e)}if(master)master.gain.value=vol};
 const getVol=()=>vol;
 const toggle=()=>{enabled=!enabled;try{localStorage.setItem('wc_sound',enabled?'1':'0')}catch(e){wcDbg(e)};return enabled};
 const refresh=()=>{const b=document.getElementById('soundToggle');if(b){b.textContent=enabled?'🔊 Sons':'🔇 Sons';b.classList.toggle('off',!enabled)}};
 window.addEventListener('pointerdown',()=>init(),{once:true,passive:true});
 setTimeout(refresh,0);
 return {click,nav,bet,cut,packOpen,reveal,fusionStart,fusionSuccess,fusionFail,suspense,win,lose,spin,stopAll,coin,upgrade,slots,rouletteTick,scratch,cardDraw,cardFlip,cardPlace,reelStop,toggle,refresh,isOn:()=>enabled,setVol,getVol,tear,snip,riser,riserStop,boom,fanfare,clue,tick,bid,outbid,cash,notify,error,open,close,hover,gem,mineBoom,crashBoom,chip,sparkle};
})();
if($('soundToggle')){$('soundToggle').onclick=()=>{SFX.toggle();SFX.refresh();};}
/* petits sons universels + sons contextuels pour les interactions principales */
document.addEventListener('click',e=>{
 const t=e.target.closest&&e.target.closest('button,.cg,.game-tile,.chip,.case-tab,.pack,.card');
 if(!t||t.id==='soundToggle')return;
 if(t.closest('.pack:not(.lock)'))SFX.click();
 else if(t.classList.contains('cg')||t.classList.contains('case-tab'))SFX.nav();
 else if(t.classList.contains('card')){}
 else SFX.click();
},{passive:true});

/* ===================== V71 : anti-clignotement, 9 missions, succès étendus, fusion filtrée ===================== */
let _ST=null;const stGet=()=>{if(!_ST){try{_ST=JSON.parse(localStorage.getItem("wc_stats")||"{}")}catch(e){_ST={}}}return _ST};
function wcCount(id,n){const t=stGet();t[id]=(t[id]||0)+n;try{localStorage.setItem("wc_stats",JSON.stringify(t))}catch(e){wcDbg(e)}}
const ACH=(()=>{const L=[],C=()=>Object.values(col).filter(c=>c&&c.n>0),cnt=r=>C().reduce((t,c)=>t+(c.r==r?c.n:0),0),tot=()=>C().reduce((t,c)=>t+c.n,0),uniq=()=>C().length,maxn=()=>Math.max(0,...C().map(c=>c.n)),dbl=()=>C().filter(c=>c.n>=2).length,crs=()=>C().filter(c=>c.src=="cr").length,st=k=>stGet()[k]||0;
 const add=(id,ic,n,d,rw,v,goal)=>L.push({id,ic,n,d,rw,v,goal});
 [[2,"💙","Premier éclat",25],[3,"💎","Reflets",40],[4,"🔥","Ultra chanceux",100],[5,"🌟","Pleine page",200],[6,"👑","Légendaire !",400],[7,"🌈","Le Graal",2000]].forEach(([r,ic,n,rw])=>add("r"+r,ic,n,"Obtenir ta première carte "+R[r][0],rw,()=>cnt(r),1));
 [[10,"📖","Premiers pas",20],[50,"📘","Débutant",50],[100,"🏅","Amateur",100],[250,"🎖️","Collectionneur",200],[500,"🥇","Expert",400],[1000,"📕","Maître collectionneur",800],[2500,"🏛️","Encyclopédiste",1500],[5000,"📜","Archiviste",3000]].forEach(([g,ic,n,rw])=>add("q"+g,ic,n,"Posséder "+g.toLocaleString("fr-FR")+" cartes",rw,tot,g));
 [[25,"🗂️","Variété",50],[100,"🧩","Éclectique",200],[500,"🌍","Curieux du monde",800]].forEach(([g,ic,n,rw])=>add("u"+g,ic,n,"Posséder "+g+" cartes différentes",rw,uniq,g));
 add("d2","♻️","Déjà vu","Obtenir un doublon d'une carte",30,maxn,2);add("d3","🔁","Trio","Avoir 3 copies d'une même carte (de quoi fusionner !)",60,maxn,3);add("d5","🧱","Stockeur","Avoir 5 copies de la même carte",150,maxn,5);add("d10","📦","Entrepôt","Avoir 10 cartes en double",300,dbl,10);
 [[1,"🎮","Fan de stream",30],[10,"📺","Abonné",150],[30,"🏆","Roi du direct",400]].forEach(([g,ic,n,rw])=>add("c"+g,ic,n,"Posséder "+g+" carte"+(g>1?"s":"")+" de créateur",rw,crs,g));
 [[1,"🎁","Premier booster",25],[10,"🛍️","Déballeur",100],[50,"📦","Accro aux boosters",300],[100,"💼","Grossiste",600]].forEach(([g,ic,n,rw])=>add("o"+g,ic,n,"Ouvrir "+g+" booster"+(g>1?"s":""),rw,()=>st("open"),g));
 [[10,"🎲","Joueur",50],[50,"🎰","Habitué",150],[200,"💸","High roller",500]].forEach(([g,ic,n,rw])=>add("k"+g,ic,n,"Jouer "+g+" parties au casino",rw,()=>st("casino"),g));
 add("w1","🔨","Adjugé !","Gagner une enchère",50,()=>(MK.W||[]).length,1);add("w10","🦅","Chasseur d'enchères","Gagner 10 enchères",300,()=>(MK.W||[]).length,10);
 add("s1","🏷️","Premier vendeur","Vendre une carte aux enchères",50,()=>(MK.H||[]).filter(x=>x.s==ME).length,1);add("s5","🤝","Commerçant","Vendre 5 cartes aux enchères",200,()=>(MK.H||[]).filter(x=>x.s==ME).length,5);
 [[10000,"💰","Petit trésor",100],[100000,"🏦","Fortune",500],[1000000,"💎","Collection de roi",2000]].forEach(([g,ic,n,rw])=>add("v"+g,ic,n,"Avoir une collection valant "+g.toLocaleString("fr-FR")+" 🪙",rw,()=>profileStats().value,g));
 [[5,"⭐","Niveau 5",100],[10,"🌠","Niveau 10",300],[25,"🚀","Niveau 25",1000]].forEach(([g,ic,n,rw])=>add("l"+g,ic,n,"Atteindre le niveau "+g,rw,()=>profileStats().lvl,g));
 [[1,"⚗️","Premier alchimiste",100],[10,"🧪","Maître de la fusion",500]].forEach(([g,ic,n,rw])=>add("f"+g,ic,n,"Réussir "+g+" fusion"+(g>1?"s":""),rw,()=>st("fusion"),g));
 [[1,"🃏","Première caisse",75]].forEach(([g,ic,n,rw])=>add("cc"+g,ic,n,"Ouvrir "+g+" Card Case",rw,()=>st("case"),g));
 [[1,"⬆️","Premier upgrade",100],[10,"🔺","Upgrade en série",400]].forEach(([g,ic,n,rw])=>add("ug"+g,ic,n,"Tenter "+g+" Card Upgrade",rw,()=>st("upgrade"),g));
 [[5,"✨","Brillance",150],[25,"🌟","Galerie holo",600]].forEach(([g,ic,n,rw])=>add("h"+g,ic,n,"Obtenir "+g+" cartes Holo ou mieux",rw,()=>st("holo"),g));
 [[5,"🏷️","Étiqueteur",100]].forEach(([g,ic,n,rw])=>add("tg"+g,ic,n,"Appliquer une étiquette à "+g+" cartes",rw,()=>st("tag"),g));
 return L})();
function achCheck(){let U={};try{U=JSON.parse(localStorage.getItem("wc_ach")||"{}")}catch(e){wcDbg(e)}
 const nw=[];ACH.forEach(a=>{if(U[a.id])return;let v=0;try{v=a.v()}catch(e){wcDbg(e)}if(v>=a.goal){U[a.id]=Date.now();nw.push(a)}});
 if(nw.length){try{localStorage.setItem("wc_ach",JSON.stringify(U))}catch(e){wcDbg(e)}const sum=nw.reduce((t,a)=>t+a.rw,0);gain(sum);try{toast(nw.length==1?"🏆 Succès débloqué : "+nw[0].n+" (+"+nw[0].rw+" 🪙)":"🏆 "+nw.length+" succès débloqués (+"+sum+" 🪙)")}catch(e){wcDbg(e)}}
 return U}
let ACHF="all";
setInterval(()=>{try{achCheck()}catch(e){wcDbg(e)}},5000);
// timer avant la prochaine rotation des missions (même minuit UTC que le changement de jour du jeu)
function mTimer(){clearInterval(timer);const p2=x=>String(x).padStart(2,"0"),f=()=>{const e=document.getElementById("mt");if(!e){clearInterval(timer);return}
  const r=86400000-(Date.now()%86400000);if(r<=1000){clearInterval(timer);missionsPage();return}
  e.textContent=p2(Math.floor(r/36e5))+":"+p2(Math.floor(r%36e5/6e4))+":"+p2(Math.floor(r%6e4/1e3));
  const m2=document.getElementById("mt2");if(m2)m2.textContent="(à "+new Date(Math.ceil(Date.now()/864e5)*864e5).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})+")"};
 f();timer=setInterval(f,1000)}
// fusion : le bouton « Ouvrir la fusion » n'était relié à rien
document.addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest("#openFusionPicker");if(b)openFusionPicker()});

document.addEventListener("keydown",e=>{if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;const b=e.key=="ArrowRight"?document.getElementById("bkNext"):e.key=="ArrowLeft"?document.getElementById("bkPrev"):null;if(b&&!b.disabled)b.click()});
