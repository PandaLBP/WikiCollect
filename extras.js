/* WikiCollect — modules complémentaires (chaque module est isolé : une erreur dans l'un n'empêche pas les autres). */

/* ----- wc-v41-integration ----- */
try{
/* ===== V4.1 : branche le gros catalogue sur Toutes les cartes + cases + boosters ===== */
(()=>{
 if(window.__WCV41Integration)return;window.__WCV41Integration=true;
 const wait=fn=>setTimeout(fn,1800);
 /* V130 : le catalogue ne propose plus un article à une rareté différente de sa rareté officielle (Johnny Depp = toujours la même). */
 {let tries=0;const tw=()=>{const w=window.wcCatalogV41;if(!w){if(tries++<60)setTimeout(tw,500);return}
  ['sample','randomSample'].forEach(fn=>{const o=w[fn];if(typeof o!=='function'||o.__wc130)return;const n=async function(){const r=await o.apply(this,arguments);return Array.isArray(r)?r.filter(c=>{const f=forcedRarity(c&&c.t);return f==null||f===+c.r}):r};n.__wc130=true;w[fn]=n})};tw()}
 /* V121 : mémoire des pages déjà vues + préchargement silencieux de la page suivante (Toutes les cartes) */
 {const _collect=collect,MEM=new Map(),TTL=6e5,ctx=()=>[SO,CG,q,[...fr].sort().join()].join("¦");
  const run=(cur,c)=>{const k=c+"¦"+cur,e=MEM.get(k);if(e&&Date.now()-e.t<TTL)return e.p;const p=_collect(cur);MEM.set(k,{t:Date.now(),p});p.catch(()=>MEM.delete(k));if(MEM.size>14)MEM.delete(MEM.keys().next().value);return p};
  collect=function(cur){const c=ctx(),p=run(cur,c);p.then(r=>{if(r&&r.next&&ctx()===c&&tab===1)setTimeout(()=>{if(ctx()===c&&tab===1)run(r.next,c)},300)}).catch(()=>{});return p}}
 const oldLoad=loadCasePool;
 loadCasePool=async function(need){let pool=await oldLoad(need);try{if(window.wcCatalogV41){const extra=await window.wcCatalogV41.sample(700);const seen=new Set(pool.map(c=>c.id));extra.forEach(c=>{if(c.img&&(!need||c.r>=need)&&!seen.has(c.id)){seen.add(c.id);pool.push(c);store[c.id]=c}})}}catch(e){wcDbg(e)}return pool};
 const oldChoose=typeof chooseCaseCard==='function'?chooseCaseCard:null;
 wait(()=>{try{if(typeof render==='function'&&typeof tab!=='undefined'&&tab===1)all()}catch(e){wcDbg(e)}});
 console.log('🔌 WikiCollect V4.1 connecté : Toutes les cartes / Card Case / boosters utilisent le nouveau catalogue quand disponible.');
})();
}catch(e){console.error("[module wc-v41-integration]",e)}

/* ----- wc-final-features-js ----- */
try{
(()=>{
  if(window.__WCFINALFEATURES)return; window.__WCFINALFEATURES=true;
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const availableStore=()=>Object.values(store||{}).filter(c=>c&&c.img);
  const catalogCount=async()=>{
    try{if(window.wcCatalogV41&&window.wcCatalogV41.count)return await window.wcCatalogV41.count()}catch(e){wcDbg(e)}
    return availableStore().length;
  };
  const openCatalogCard=async()=>{
    try{
      const db=await new Promise((res,rej)=>{const r=indexedDB.open('WikiCollectCatalogV41');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
      const st=db.transaction('cards','readonly').objectStore('cards');
      const counts=[];for(let r=0;r<=7;r++)counts[r]=await new Promise(ok=>{const q=st.index('r').count(IDBKeyRange.only(r));q.onsuccess=()=>ok(q.result||0);q.onerror=()=>ok(0)});
      const total=counts.reduce((a,b)=>a+b,0);if(total){let x=Math.floor(Math.random()*total),rar=0;for(;rar<counts.length;rar++){if(x<counts[rar])break;x-=counts[rar]}
        const c=await new Promise(ok=>{const q=st.index('r').openCursor(IDBKeyRange.only(rar),'next');let n=x;q.onsuccess=e=>{const cur=e.target.result;if(!cur){ok(null);return}if(n--<=0){const v=cur.value;ok(v?.img?{id:'v4-'+v.k,pid:'v4-'+v.k,t:v.title,r:v.r,v:v.v||0,pop:v.pop||0,img:v.img,src:'wiki',d:v.desc||'',url:v.url,cats:v.cats||[],langs:v.langs||0,length:v.length||0}:null);return}cur.continue()};q.onerror=()=>ok(null)});
        if(c){store[c.id]=c;return c}
      }
    }catch(e){wcDbg(e)}
    const L=availableStore();return L.length?L[Math.floor(Math.random()*L.length)]:null;
  };
  const discover=async()=>{
    try{bumpDaily('discover',1)}catch(e){wcDbg(e)}
    const host=document.createElement('div');host.id='wcDiscoverOverlay';host.className='modal';host.style.display='flex';host.innerHTML='<div id="wcDiscoverBody" style="min-height:250px;display:grid;place-items:center"><div class="msg">Recherche d’une carte…</div></div></div>';document.body.appendChild(host);
    const close=()=>host.remove();host.querySelector('#wcDx').onclick=close;
    const c=await openCatalogCard();const body=host.querySelector('#wcDiscoverBody');
    if(!c){body.innerHTML='<div class="msg">Aucune carte avec image n’est actuellement disponible.</div>';return}
    const cat=(c.cats&&c.cats.length?c.cats[0]:(c.src==='cr'?'Créateur':'Wikipédia'));
    const pop=Number(c.pop||0);const views=Number(c.v||0);
    body.innerHTML=`<div class="wc-discover"><img src="${esc(c.img)}" referrerpolicy="no-referrer" alt="${esc(c.t)}"><div class="wc-discover-info"><h3>${esc(c.t)}</h3><div class="wc-discover-meta"><span class="wc-pill">${esc(cat)}</span><span class="wc-pill">${esc(rarityName(c.r))}</span><span class="wc-pill">⭐ Popularité ${pop?pop.toFixed(0):'—'}</span><span class="wc-pill">👁 ${views.toLocaleString('fr-FR')} vues Wikipédia</span></div><p class="mut" style="line-height:1.55">${esc(c.d||'Aucune description disponible pour cette carte.')}</p><div class="wc-discover-actions"><button class="btn" id="wcWish">${isW(c)?'⭐ Retirer de ma liste':'⭐ Ajouter à ma liste de souhaits'}</button><button class="btn g" id="wcAll">🌍 Voir dans Toutes les cartes</button><button class="btn g" id="wcAgain">🎲 Une autre carte</button></div></div></div>`;
    host.querySelector('#wcWish').onclick=()=>{toggleW(c);host.querySelector('#wcWish').textContent=isW(c)?'⭐ Retirer de ma liste':'⭐ Ajouter à ma liste de souhaits'};
    host.querySelector('#wcAgain').onclick=()=>{close();setTimeout(discover,0)};
    host.querySelector('#wcAll').onclick=()=>{window.__wcFocusCard=c;tab=1;q='';page=1;close();render()};
  };
  window.wcDiscover=discover;
  window.missionsPage=function(){
    loadDaily();
    const done=DAILY.filter(m=>WCQ.c[m.id]).length;
    main.classList.add('wc-no-scroll-page');
    const cards=DAILY.map(m=>{const p=WCQ.p[m.id]||0,claimed=!!WCQ.c[m.id],pct=Math.min(100,Math.round(p/m.goal*100));return `<div class="mission"><div style="display:flex;justify-content:space-between;gap:6px;align-items:flex-start"><div><b>${esc(m.name)}</b><small>${p} / ${m.goal}</small></div><b style="color:#ffd23c;font-size:11px">+${m.reward} 🪙</b></div><div class="dbar"><i style="width:${pct}%"></i></div><button class="btn ${claimed||p<m.goal?'g':''}" data-claim="${m.id}" ${claimed||p<m.goal?'disabled':''}>${claimed?'✅ Pris':p>=m.goal?'🎁 Réclamer':'En cours'}</button></div>`}).join('');
    main.innerHTML=`<h2>🎯 Missions du jour</h2><div class="sub">${done}/${DAILY.length} terminées · les missions se renouvellent chaque jour.</div><div class="mtimer">⏳ Nouvelles missions dans <b id="mt">…</b></div><div class="wc-mission-grid">${cards}</div>`;mTimer();
    main.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const m=DAILY.find(x=>x.id===b.dataset.claim);if(!m||WCQ.c[m.id]||(WCQ.p[m.id]||0)<m.goal)return;WCQ.c[m.id]=1;gain(m.reward);try{localStorage.setItem('wc_daily2',JSON.stringify(WCQ))}catch(e){wcDbg(e)}toast('🎁 Mission terminée : +'+m.reward+' 🪙');missionsPage()});
  };
  window.succesPage=function(){
    const U=achCheck(),n=ACH.filter(a=>U[a.id]).length,pct=Math.round(n/ACH.length*100),list=ACH.filter(a=>ACHF==='all'||(ACHF==='ok')===!!U[a.id]);
    main.classList.add('wc-no-scroll-page');
    main.innerHTML=`<h2>🏆 Succès</h2><div class="sub">${n} / ${ACH.length} débloqués · chaque succès rapporte des pièces.</div><div class="wc-ach-wrap"><div class="dbox"><div style="display:flex;justify-content:space-between"><span>Progression</span><b style="color:#7cf5b0">${pct}%</b></div><div class="dbar" style="margin-top:6px"><i style="width:${pct}%"></i></div></div><div class="bar">${[['all','Tous'],['ok','Débloqués'],['no','À débloquer']].map(([k,l])=>`<button class="btn ${ACHF===k?'':'g'}" data-f="${k}">${l}</button>`).join('')}</div><div class="wc-ach-grid">${list.map(a=>{const ok=!!U[a.id];let v=0;try{v=a.v()}catch(e){wcDbg(e)}return `<div class="ach ${ok?'':'lock'}"><div class="aic">${a.ic}</div><div class="atx"><b>${esc(a.n)}${ok?' <span class="aok">✔</span>':''}</b><div class="ad">${esc(a.d)}</div><div class="ar">+${a.rw} 🪙${ok?'':' · '+Math.min(Math.floor(v),a.goal).toLocaleString('fr-FR')+' / '+a.goal.toLocaleString('fr-FR')}</div></div></div>`}).join('')||'<div class="msg">Rien à afficher ici.</div>'}</div></div>`;
    main.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ACHF=b.dataset.f;succesPage()});
  };
  /* 8 — Statistiques avancées + Encyclopédie + Collections / Sets */
  const statsHTML=async()=>{
    const A=Object.values(col).filter(c=>c&&c.n>0),uniq=A.length,total=A.reduce((s,c)=>s+c.n,0),value=A.reduce((s,c)=>s+fair(c)*c.n,0),cre=A.filter(c=>c.src==='cr').length,dupes=A.filter(c=>c.n>1).length;
    const counts=R.map((_,i)=>A.filter(c=>c.r===i).reduce((s,c)=>s+c.n,0));
    const catNames=[['⚽ Football',/foot|football|joueur|joueuse|club/i],['🎵 Musique',/musique|chanteur|chanteuse|groupe|album|chanson|k-pop/i],['🎬 Cinéma & séries',/acteur|actrice|film|série|cinéma|anime|manga/i],['🎮 Jeux vidéo',/jeu vidéo|personnage de jeu|nintendo|playstation|xbox/i],['🐾 Animaux',/animal|mammifère|oiseau|poisson|reptile|insecte|araignée/i],['🔬 Science',/science|physicien|chimie|biolog|astronom|mathématique/i],['🌍 Géographie',/ville|pays|commune|région|géograph|monument/i],['🎥 Créateurs',/youtube|streamer|créateur|twitch/i]];
    const indexed=await catalogCount();
    const setCards=catNames.map(([name,re])=>{const av=availableStore().filter(c=>re.test((c.cats||[]).join(' ')+' '+c.t));const owned=new Set(A.filter(c=>re.test((c.cats||[]).join(' ')+' '+c.t)).map(c=>c.id));const pct=av.length?Math.min(100,Math.round(owned.size/av.length*100)):0;return {name,owned:owned.size,total:av.length,pct}});
    return `<div class="wc-feature-panel"><h3>📊 Statistiques avancées</h3><div class="wc-feature-grid"><div class="wc-stat"><b>${uniq.toLocaleString('fr-FR')}</b><span>Cartes différentes</span></div><div class="wc-stat"><b>${total.toLocaleString('fr-FR')}</b><span>Cartes possédées au total</span></div><div class="wc-stat"><b>${value.toLocaleString('fr-FR')} 🪙</b><span>Valeur estimée</span></div><div class="wc-stat"><b>${cre.toLocaleString('fr-FR')}</b><span>Créateurs dans la collection</span></div><div class="wc-stat"><b>${dupes.toLocaleString('fr-FR')}</b><span>Cartes avec doublons</span></div><div class="wc-stat"><b>${rarityName(A.length?Math.max(...A.map(c=>c.r)):-1)}</b><span>Plus haute rareté</span></div><div class="wc-stat"><b>${indexed.toLocaleString('fr-FR')}</b><span>Cartes actuellement indexées</span></div><div class="wc-stat"><b>${Object.keys(WL).length.toLocaleString('fr-FR')}</b><span>Liste de souhaits</span></div></div><div class="wc-rarity-bars">${R.map((r,i)=>{const n=counts[i]||0,p=total?Math.round(n/total*100):0;return `<div class="rb" style="--rc:${r[1]};--rw:${p}%"><b>${esc(r[0])}</b><span> ${n.toLocaleString('fr-FR')} · ${p}%</span><i></i></div>`}).join('')}</div></div><div class="wc-feature-panel"><h3>🥇 Collections / Sets</h3><div class="sub">Progression calculée sur les cartes actuellement indexées dans ton catalogue.</div><div class="wc-set-grid">${setCards.map(s=>`<div class="wc-set"><b>${s.name}</b><small>${s.owned} / ${s.total} · ${s.pct}%</small><div class="dbar"><i style="width:${s.pct}%"></i></div></div>`).join('')}</div></div><div class="wc-feature-panel"><h3>🥈 Encyclopédie</h3><div class="sub">Pas de faux objectif à 3 millions : WikiCollect suit les cartes que tu peux réellement obtenir avec image.</div><div class="wc-feature-grid"><div class="wc-stat"><b>${indexed.toLocaleString('fr-FR')}</b><span>Cartes disponibles / indexées</span></div><div class="wc-stat"><b>${uniq.toLocaleString('fr-FR')}</b><span>Déjà collectionnées</span></div><div class="wc-stat"><b>${Math.max(0,indexed-uniq).toLocaleString('fr-FR')}</b><span>Encore à découvrir</span></div><div class="wc-stat"><b>${indexed?Math.min(100,(uniq/indexed*100)).toFixed(2):'0.00'}%</b><span>Encyclopédie complétée</span></div></div></div>`;
  };
  const appendProfileFeatures=()=>{const holder=document.createElement('div');holder.id='wcProfileFeatures';holder.innerHTML='<div class="msg">Chargement des statistiques…</div>';main.appendChild(holder);statsHTML().then(x=>{if(document.getElementById('wcProfileFeatures'))holder.innerHTML=x}).catch(()=>{holder.innerHTML='<div class="msg">Statistiques momentanément indisponibles.</div>'})};
  AFTER.profile.push(appendProfileFeatures);
  /* 10 — Laboratoire de cartes + bouton Découvrir dans le classeur */
  const appendLab=()=>{
    const A=Object.values(col).filter(c=>c&&c.n>0),ready=A.filter(c=>c.n>=3&&c.r<7).length;
    const el=document.createElement('div');el.className='wc-feature-panel';
    el.innerHTML=`<h3>🧪 Laboratoire de cartes</h3><div class="sub">Transforme tes doublons en cartes de rareté supérieure.</div><div class="wc-lab-grid"><div class="wc-lab-card"><b>⚗️ Fusion par rareté</b><p class="mut">3 exemplaires de la même carte → 1 exemplaire de cette carte avec la rareté supérieure.</p><div class="wc-rarity-bars" style="margin-top:10px">${R.slice(0,7).map((r,i)=>`<div class="rb" style="--rc:${r[1]};--rw:100%"><b>${esc(r[0])}</b><span>3 → ${esc(rarityName(i+1))}</span><i></i></div>`).join('')}</div><button class="btn" id="wcLabFusion" style="margin-top:12px">⚗️ Ouvrir le laboratoire</button></div><div class="wc-lab-card"><b>📦 Cartes prêtes</b><p class="mut">Tu as actuellement <strong>${ready}</strong> carte(s) différente(s) avec au moins 3 exemplaires et pouvant être améliorées.</p><p class="mut">Les cartes <strong>Légendaire holo full art</strong> ne peuvent pas être améliorées davantage.</p></div></div>`;
    main.insertBefore(el,main.firstChild);
    el.querySelector('#wcLabFusion').onclick=()=>openFusionPicker();
  };
  AFTER.collection.push(appendLab);
  const _all=all;
  all=async function(){await _all();if(window.__wcFocusCard){const c=window.__wcFocusCard;window.__wcFocusCard=null;const box=document.createElement('div');box.className='wc-feature-panel';box.innerHTML=`<div style="display:flex;gap:12px;align-items:center"><img src="${esc(c.img)}" style="width:70px;height:92px;object-fit:cover;border-radius:7px"><div><h3 style="margin:0 0 4px">🎲 Carte découverte : ${esc(c.t)}</h3><div class="mut">${esc(rarityName(c.r))} · ${Number(c.v||0).toLocaleString('fr-FR')} vues Wikipédia</div></div><button class="btn g" id="wcFocusOpen" style="margin-left:auto">Ouvrir la carte</button></div>`;main.insertBefore(box,main.firstChild);box.querySelector('#wcFocusOpen').onclick=()=>openModal(c.id)}};
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ug');if(b){try{bumpDaily('upgrade',1)}catch(x){wcDbg(x)}}});
  const oldDaily=DAILY.slice();
  [['discover','🎲 Découvreur','Découvrir 1 carte aléatoire',1,75],['wish','⭐ Collectionneur','Ajouter 1 carte à la liste de souhaits',1,75],['upgrade','⬆️ Expérimentateur','Tenter 1 Card Upgrade',1,100]].forEach(([id,name,desc,goal,reward])=>{if(!DAILY.some(m=>m.id===id))DAILY.push({id,name,goal,reward,d:desc})});
  /* Les missions/succès doivent revenir à leur comportement normal sur les autres onglets. */
  const clearPageClass=()=>{if(tab!==5&&tab!==8)main.classList.remove('wc-no-scroll-page')};
  setInterval(clearPageClass,500);
})();
}catch(e){console.error("[module wc-final-features-js]",e)}

/* ----- wc-login-milestones-lab-v1 ----- */
try{
(()=>{
  if(window.__WCLOGINMILESTONES)return;
  window.__WCLOGINMILESTONES=true;

  const esc2=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  // ---------- Daily login ----------
  const LOGIN_KEY="wc_login_rewards_v1";
  const loginRewards=[
    {d:1,icon:"🪙",title:"Bienvenue",desc:"Récompense de connexion",money:75},
    {d:2,icon:"🎁",title:"Deuxième jour",desc:"Un booster offert",booster:1},
    {d:3,icon:"💎",title:"Troisième jour",desc:"Un booster avec au moins une carte Rare",rare:1},
    {d:4,icon:"🪙",title:"Quatrième jour",desc:"Récompense de connexion",money:150},
    {d:5,icon:"🎁",title:"Cinquième jour",desc:"Un booster offert",booster:1},
    {d:6,icon:"🪙",title:"Sixième jour",desc:"Récompense de connexion",money:300},
    {d:7,icon:"🔥",title:"Semaine complète",desc:"Gros booster spécial + 500 WikiCo",booster:2,money:500}
  ];

  const loginDate=()=>new Date().toISOString().slice(0,10);
  const prevDate=d=>{const x=new Date(d+"T00:00:00Z");x.setUTCDate(x.getUTCDate()-1);return x.toISOString().slice(0,10)};

  function loginState(){
    try{
      const s=JSON.parse(localStorage.getItem(LOGIN_KEY)||"null");
      return s&&typeof s==="object"?s:{last:"",streak:0,pendingRare:0};
    }catch(e){return {last:"",streak:0,pendingRare:0}}
  }
  function saveLogin(s){try{localStorage.setItem(LOGIN_KEY,JSON.stringify(s))}catch(e){wcDbg(e)}}

  function grantBooster(){
    // A ready slot is made immediately available without touching existing cooldowns negatively.
    try{
      const now=Date.now();
      let idx=boosterCooldowns.findIndex(x=>x>now);
      if(idx<0) idx=0;
      boosterCooldowns[idx]=0;
      saveBoosterCooldowns();
      return true;
    }catch(e){return false}
  }

  function claimLoginIfNeeded(){
    const today=loginDate(),s=loginState();
    if(s.last===today)return {s,reward:null};
    if(s.last===prevDate(today))s.streak=Math.min(7,(+s.streak||0)+1);
    else s.streak=1;
    const day=s.streak;
    const reward=loginRewards[day-1]||loginRewards[0];
    if(reward.money)gain(reward.money);
    for(let i=0;i<(reward.booster||0);i++)grantBooster();
    if(reward.rare)s.pendingRare=1;
    s.last=today;
    saveLogin(s);
    save();
    return {s,reward};
  }

  function loginHTML(){
    const s=loginState();
    const today=loginDate();
    const claimed=s.last===today;
    const current=claimed?Math.max(1,Math.min(7,+s.streak||1)):Math.min(7,(s.last===prevDate(today)?(+s.streak||0)+1:1));
    return `<div class="wc-feature-panel"><h3>🎁 Récompense de connexion</h3>
      <div class="sub">${claimed?"Récompense d’aujourd’hui récupérée. Reviens demain pour continuer la série.":"Connecte-toi chaque jour pour avancer dans la série et obtenir de meilleures récompenses."}</div>
      <div class="wc-login-days">${loginRewards.map((r,i)=>`<div class="wc-login-day ${i+1<current?'done':''} ${i+1===current?'current':''} ${i+1<=current&&claimed?'claimed':''}">
        <div class="wc-login-num">J${i+1}</div><div class="wc-login-icon">${r.icon}</div><b>${esc2(r.title)}</b><small>${esc2(r.desc)}</small>
      </div>`).join('')}</div>
      <div class="mut" style="margin-top:10px;font-size:12px">Série actuelle : <strong>${current}/7 jours</strong> · La série se réinitialise si tu manques une journée.</div>
    </div>`;
  }

  // ---------- Collection milestones ----------
  const MILESTONES=[
    [100,250,"🪙","Premier cap"],
    [500,500,"🎁","Collectionneur"],
    [1000,1000,"💎","Grand collectionneur"],
    [5000,2500,"🏆","Archiviste"],
    [10000,5000,"🔥","Maître de collection"],
    [25000,15000,"👑","Légende de WikiCollect"]
  ];
  const MKEY="wc_collection_milestones_v1";

  function milestoneState(){
    try{return JSON.parse(localStorage.getItem(MKEY)||"{}")||{}}catch(e){return {}}
  }
  function saveMilestones(s){try{localStorage.setItem(MKEY,JSON.stringify(s))}catch(e){wcDbg(e)}}

  function claimMilestones(){
    const state=milestoneState();
    const unique=Object.values(col).filter(c=>c&&c.n>0).length;
    let changed=false;
    for(const [goal,reward] of MILESTONES){
      if(unique>=goal&&!state[goal]){
        state[goal]=Date.now();
        gain(reward);
        changed=true;
        toast(`🏆 Palier ${goal.toLocaleString("fr-FR")} cartes atteint : +${reward} 🪙`);
      }
    }
    if(changed){saveMilestones(state);save()}
    return {state,unique};
  }

  function milestonesHTML(){
    const {state,unique}=claimMilestones();
    return `<div class="wc-feature-panel"><h3>🏆 Paliers de collection</h3>
      <div class="sub">Chaque palier compte les <strong>cartes différentes</strong> de ta collection.</div>
      <div class="wc-milestones">${MILESTONES.map(([goal,reward,icon,name])=>{
        const done=!!state[goal],pct=Math.min(100,Math.round(unique/goal*100));
        return `<div class="wc-milestone ${done?'done':''}">
          <div class="wc-milestone-top"><span>${icon} <b>${name}</b></span><strong>${goal.toLocaleString("fr-FR")}</strong></div>
          <div class="dbar"><i style="width:${pct}%"></i></div>
          <div class="wc-milestone-bottom"><span>${Math.min(unique,goal).toLocaleString("fr-FR")} / ${goal.toLocaleString("fr-FR")}</span><span>${done?'✅ Réclamé':'🎁 +'+reward+' 🪙'}</span></div>
        </div>`;
      }).join('')}</div>
    </div>`;
  }

  // Make the rare-guaranteed login reward affect the next normal booster.
  const oldBuildPack=buildPack;
  buildPack=async function(minRarity=null){
    const s=loginState();
    let forced=false;
    if(minRarity==null&&s.pendingRare){minRarity=2;forced=true}
    const res=await oldBuildPack(minRarity);
    if(forced){
      s.pendingRare=0;
      saveLogin(s);
      try{save()}catch(e){wcDbg(e)}
    }
    return res;
  };

  // Profil : récompenses de connexion + paliers.
  AFTER.profile.push(()=>{
    claimLoginIfNeeded();
    const wrap=document.createElement("div");
    wrap.id="wcLoginMilestones";
    wrap.innerHTML=loginHTML()+milestonesHTML();
    main.appendChild(wrap);
  });

  // Collection : vérifie les paliers atteints et les affiche.
  AFTER.collection.push(()=>{
    claimMilestones();
    const holder=document.createElement("div");
    holder.id="wcMilestonesCollection";
    holder.innerHTML=milestonesHTML();
    main.appendChild(holder);
  });

  // Claim today's login reward as soon as the game loads, while keeping the visual on Profile.
  try{claimLoginIfNeeded()}catch(e){wcDbg(e)}

})();
}catch(e){console.error("[module wc-login-milestones-lab-v1]",e)}

/* ----- wc-wikipedia-diagnostic-v2 ----- */
try{
(()=>{if(window.__WCDiagV2)return;window.__WCDiagV2=true;
window.wikiDiagnostics=async()=>{try{const j=await J("https://fr.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general&format=json&origin=*");const ok=!!j?.query?.general?.sitename;console.log(ok?"✅ Wikipédia accessible":"❌ Wikipédia inaccessible",j);return ok}catch(e){console.error("❌ Wikipédia inaccessible",e);return false}};
})();
}catch(e){console.error("[module wc-wikipedia-diagnostic-v2]",e)}

/* ----- v67-sons ----- */
try{
/* ===== V67 : sons partout ===== */
(function(){
 const sfx=n=>(...a)=>{try{return SFX[n](...a)}catch(e){wcDbg(e)}};
 // curseur de volume
 const vs=document.getElementById('volSlider');
 if(vs){vs.value=Math.round(SFX.getVol()*100);vs.oninput=()=>SFX.setVol(vs.value/100);vs.onchange=()=>SFX.click()}
 // fenêtre de détail d'une carte
 const _om=openModal;openModal=function(){sfx('open')();return _om.apply(this,arguments)};
 const _cm=closeModal;closeModal=function(){try{if(M.style.display==='flex')SFX.close()}catch(e){wcDbg(e)}return _cm.apply(this,arguments)};
 // notifications (enchères, ventes, erreurs…)
 const _t=toast;toast=function(m){const t=String(m);
  if(/surench/i.test(t))sfx('outbid')();else if(/^Vendu|vendue/i.test(t))sfx('cash')();else if(/remport|gagn/i.test(t))sfx('win')();
  else if(/^Mise de/i.test(t))sfx('bid')();else if(/impossible|invalide|pas assez|limite|trop basse|annul/i.test(t))sfx('error')();else sfx('notify')();
  return _t.apply(this,arguments)};
 // ouverture du booster : déchirure du haut du sachet + ciseaux pendant la découpe
 let snipT=null;const snipStop=()=>{if(snipT){clearInterval(snipT);snipT=null}};
 const cutting=()=>!!document.querySelector('.pack.cutting:not(.half)');
 const _st=strip;strip=function(){snipStop();sfx('tear')();return _st.apply(this,arguments)};
 // les « snip » s'arrêtent dès que la découpe est finie, annulée ou que le sachet disparaît de l'écran
 new MutationObserver(()=>{const on=cutting();
  if(on&&!snipT){sfx('snip')();snipT=setInterval(()=>{if(!cutting()){snipStop();return}sfx('snip')()},170)}else if(!on)snipStop();
 }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
 // animation légendaire : montée en tension + un son par indice
 const _wo=walkout;walkout=function(c){sfx('riser')(c&&c.r>=7?15:c&&c.r>=6?10:7.5);
  const r=_wo.apply(this,arguments),wt=document.getElementById('wt');
  // si on passe l'animation (ou qu'elle se termine), la montée sonore s'arrête aussitôt
  const ob=new MutationObserver(()=>{if(!document.getElementById('wo')){sfx('riserStop')();ob.disconnect()}});ob.observe(document.body,{childList:true});
  if(wt)new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes.length))sfx('clue')()}).observe(wt,{childList:true});return r};
 // survol des cartes très rares : petit scintillement
 document.addEventListener('pointerover',e=>{const c=e.target.closest&&e.target.closest('.card');if(!c||c.contains(e.relatedTarget))return;
  const m=/\br(\d+)\b/.exec(c.className);if(m&&+m[1]>=7)sfx('hover')(+m[1])},{passive:true});
})();

// ---- dézoom automatique : si l'image n'a pas les proportions du cadre (drapeaux, cartes, tableaux...), on l'affiche en entier ----
(function(){
 function fit(i){try{const w=i.naturalWidth,h=i.naturalHeight,bw=i.clientWidth,bh=i.clientHeight,b=i.closest(".in");if(!b||!w||!h)return;
  b.style.setProperty("--im","url('"+(i.currentSrc||i.src).replace(/'/g,"%27")+"')");if(!bw||!bh)return;
  const c=Math.abs(Math.log((w/h)/(bw/bh)))>.22;i.classList.toggle("fitc",c);b.classList.toggle("fitb",c);i.dataset.f=1}catch(e){wcDbg(e)}}
 document.addEventListener("load",e=>{const t=e.target;if(t&&t.tagName=="IMG"&&t.closest&&t.closest(".card .in"))fit(t)},true);
 setInterval(()=>document.querySelectorAll(".card .in img:not([data-f])").forEach(i=>{if(i.complete&&i.naturalWidth)fit(i)}),700);
})();
}catch(e){console.error("[module v67-sons]",e)}

/* ----- wc-save-ui ----- */
try{
(function(){
 const W=window.WCSAVE;if(!W)return;
 const tryf=f=>{try{f()}catch(e){wcDbg(e)}};
 const autosave=()=>{if(W.block)return;tryf(()=>save());tryf(()=>saveMk());tryf(()=>saveBoosterCooldowns());tryf(()=>saveCollectionState());tryf(()=>W.backup())};
 setInterval(autosave,15000);setTimeout(()=>tryf(()=>W.backup()),4000);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)autosave()});addEventListener("pagehide",autosave);
 const hw=document.getElementById("hw");
 if(hw&&!document.getElementById("svb")){hw.insertAdjacentHTML("afterend",'<button id="svb">💾 Sauvegarde</button>');document.getElementById("svb").onclick=openSave}
 function openSave(){
  autosave();
  let nCards=0,nDiff=0;tryf(()=>{const c=Object.values(col);nDiff=c.length;nCards=c.reduce((s,x)=>s+(x.n||0),0)});
  const t=W.last?new Date(W.last).toLocaleTimeString("fr-FR"):"en cours…";let le=0;tryf(()=>{le=+localStorage.getItem("wc_lastexport")||0});const les=le?new Date(le).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})+" ("+Math.floor((Date.now()-le)/864e5)+" j)":"jamais";
  M.style.display="flex";
  M.innerHTML=`<div class="mbox v2" style="flex-direction:column;max-width:540px"><button class="btn g x" id="mx">✕</button><h2 style="margin:0">💾 Sauvegarde</h2>
  <div class="sub">Ta progression (cartes, pièces, succès, missions, enchères…) est enregistrée automatiquement toutes les 15 secondes dans ce navigateur, avec une copie de secours. Pour la mettre à l'abri ou la changer d'appareil, exporte-la dans un fichier.</div>
  <div class="row"><span>Cartes différentes</span><b>${nDiff.toLocaleString("fr-FR")}</b></div><div class="row"><span>Cartes au total</span><b>${nCards.toLocaleString("fr-FR")}</b></div><div class="row"><span>Pièces</span><b>${(typeof money!=="undefined"?money:0).toLocaleString("fr-FR")} 🪙</b></div><div class="row"><span>Dernière copie de secours</span><b>${t}</b></div><div class="row"><span>Dernier export en fichier</span><b>${les}</b></div>
  <div class="bar" style="margin-top:14px"><button class="btn" id="svx">⬇️ Exporter ma sauvegarde</button><label class="btn g" style="cursor:pointer">⬆️ Importer<input id="svi" type="file" accept=".json,application/json" hidden></label></div><div id="svm" class="sub"></div></div>`;
  document.getElementById("mx").onclick=closeModal;
  document.getElementById("svx").onclick=()=>{autosave();const d=W.snap();const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:"application/json"}));a.download="wikicollect-sauvegarde-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600);tryf(()=>{localStorage.setItem("wc_lastexport",Date.now());localStorage.removeItem("wc_remind_snooze")});document.getElementById("svm").textContent="✅ Sauvegarde exportée ("+Object.keys(d.d).length+" éléments)."};
  document.getElementById("svi").onchange=async e=>{const f=e.target.files[0];if(!f)return;const m=document.getElementById("svm");
   try{const j=JSON.parse(await f.text());if(!j||!j.d||typeof j.d!=="object"||!Object.keys(j.d).some(k=>k.startsWith("wc_")))throw 0;
    const n=Object.keys(JSON.parse(j.d.wc_col||"{}")).length;
    if(!confirm("Remplacer ta progression actuelle par cette sauvegarde ("+n+" cartes différentes, "+(+j.d.wc_money||0)+" pièces) ?\n(Ta progression actuelle est gardée en copie de secours.)"))return;
    W.block=true;try{await W.put("before-import",W.snap())}catch(x){wcDbg(x)}try{await W.put("col",null)}catch(x){wcDbg(x)}
    W.keys().forEach(k=>localStorage.removeItem(k));
    Object.keys(j.d).forEach(k=>{if(typeof j.d[k]==="string")localStorage.setItem(k,j.d[k])});
    localStorage.setItem("ACCOUNT_RESET_V105_GUARD","1");sessionStorage.setItem("wc_restored","1");location.reload()}
   catch(err){m.textContent="❌ Fichier invalide : choisis un fichier .json exporté depuis WikiCollect."}}
 }

 /* V99 : rappel de sauvegarde — la progression n'est que dans ce navigateur, donc on rappelle d'exporter un fichier */
 (function(){
  const DAYS=7,SNOOZE=864e5;
  const css=document.createElement("style");css.textContent="#bkRemind{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9500;width:min(560px,calc(100vw - 24px));display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 16px;border-radius:16px;background:#1d1432;border:1px solid #a855f7;box-shadow:0 14px 40px rgba(0,0,0,.65);color:#f2ecff;font-size:14px;line-height:1.35;animation:bkR .35s ease-out}#bkRemind b{color:#ffd86b}#bkRemind .bkrb{display:flex;gap:8px;margin-left:auto}@keyframes bkR{from{opacity:0;transform:translate(-50%,20px)}}";document.head.appendChild(css);
  const prog=()=>{let n=0;tryf(()=>{n=Object.values(col).filter(c=>c&&c.n>0).length});return n};
  function check(){
   if(document.getElementById("bkRemind")||document.hidden)return;
   if(typeof M!=="undefined"&&M.style.display==="flex")return;
   let le=0,sn=0;tryf(()=>{le=+localStorage.getItem("wc_lastexport")||0;sn=+localStorage.getItem("wc_remind_snooze")||0});
   const n=prog(),age=le?(Date.now()-le)/864e5:Infinity;
   if(Date.now()<sn)return;
   if(le?age<DAYS:n<10)return;   // jamais exporté : on attend 10 cartes différentes ; sinon, rappel après 7 jours
   const txt=le?"Ta dernière sauvegarde en fichier date de <b>"+Math.floor(age)+" jours</b>. Ta progression ne vit que dans ce navigateur : exporte-la pour ne rien perdre.":"Tu as déjà <b>"+n+" cartes différentes</b> mais aucune sauvegarde en fichier. Si tu vides ton navigateur ou changes d'adresse, tout disparaît.";
   const d=document.createElement("div");d.id="bkRemind";d.innerHTML='<span>💾 '+txt+'</span><span class="bkrb"><button class="btn" id="bkrGo">Sauvegarder</button><button class="btn g" id="bkrLater">Plus tard</button></span>';
   document.body.appendChild(d);
   document.getElementById("bkrGo").onclick=()=>{d.remove();openSave()};
   document.getElementById("bkrLater").onclick=()=>{tryf(()=>localStorage.setItem("wc_remind_snooze",Date.now()+SNOOZE));d.remove()};
  }
  setTimeout(check,9000);setInterval(check,5*60*1000);
  window.wcBackupCheck=check;
 })();
})();
}catch(e){console.error("[module wc-save-ui]",e)}
