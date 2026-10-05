/* Fonctions finales : Découvrir, missions/succès sans défilement, statistiques, laboratoire (fusion) */
(()=>{
  if(window.__WCFINALFEATURES)return; window.__WCFINALFEATURES=true;
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const availableStore=()=>Object.values(store||{}).filter(c=>c&&c.img);
  const catalogCount=async()=>{
    try{if(window.wcCatalogV41&&window.wcCatalogV41.count)return await window.wcCatalogV41.count()}catch(e){}
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
    }catch(e){}
    const L=availableStore();return L.length?L[Math.floor(Math.random()*L.length)]:null;
  };
  const discover=async()=>{
    try{bumpDaily('discover',1)}catch(e){}
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
    main.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const m=DAILY.find(x=>x.id===b.dataset.claim);if(!m||WCQ.c[m.id]||(WCQ.p[m.id]||0)<m.goal)return;WCQ.c[m.id]=1;gain(m.reward);try{localStorage.setItem('wc_daily2',JSON.stringify(WCQ))}catch(e){}toast('🎁 Mission terminée : +'+m.reward+' 🪙');missionsPage()});
  };
  window.succesPage=function(){
    const U=achCheck(),n=ACH.filter(a=>U[a.id]).length,pct=Math.round(n/ACH.length*100),list=ACH.filter(a=>ACHF==='all'||(ACHF==='ok')===!!U[a.id]);
    main.classList.add('wc-no-scroll-page');
    main.innerHTML=`<h2>🏆 Succès</h2><div class="sub">${n} / ${ACH.length} débloqués · chaque succès rapporte des pièces.</div><div class="wc-ach-wrap"><div class="dbox"><div style="display:flex;justify-content:space-between"><span>Progression</span><b style="color:#7cf5b0">${pct}%</b></div><div class="dbar" style="margin-top:6px"><i style="width:${pct}%"></i></div></div><div class="bar">${[['all','Tous'],['ok','Débloqués'],['no','À débloquer']].map(([k,l])=>`<button class="btn ${ACHF===k?'':'g'}" data-f="${k}">${l}</button>`).join('')}</div><div class="wc-ach-grid">${list.map(a=>{const ok=!!U[a.id];let v=0;try{v=a.v()}catch(e){}return `<div class="ach ${ok?'':'lock'}"><div class="aic">${a.ic}</div><div class="atx"><b>${esc(a.n)}${ok?' <span class="aok">✔</span>':''}</b><div class="ad">${esc(a.d)}</div><div class="ar">+${a.rw} 🪙${ok?'':' · '+Math.min(Math.floor(v),a.goal).toLocaleString('fr-FR')+' / '+a.goal.toLocaleString('fr-FR')}</div></div></div>`}).join('')||'<div class="msg">Rien à afficher ici.</div>'}</div></div>`;
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
  const _profile=profilePage;
  profilePage=function(){main.classList.remove('wc-no-scroll-page');_profile();appendProfileFeatures();};
  /* 10 — Laboratoire de cartes + bouton Découvrir dans le classeur */
  const appendLab=()=>{
    const A=Object.values(col).filter(c=>c&&c.n>0),ready=A.filter(c=>c.n>=3&&c.r<7).length;
    const el=document.createElement('div');el.className='wc-feature-panel';
    el.innerHTML=`<h3>🧪 Laboratoire de cartes</h3><div class="sub">Transforme tes doublons en cartes de rareté supérieure.</div><div class="wc-lab-grid"><div class="wc-lab-card"><b>⚗️ Fusion par rareté</b><p class="mut">3 exemplaires de la même carte → 1 exemplaire de cette carte avec la rareté supérieure.</p><div class="wc-rarity-bars" style="margin-top:10px">${R.slice(0,7).map((r,i)=>`<div class="rb" style="--rc:${r[1]};--rw:100%"><b>${esc(r[0])}</b><span>3 → ${esc(rarityName(i+1))}</span><i></i></div>`).join('')}</div><button class="btn" id="wcLabFusion" style="margin-top:12px">⚗️ Ouvrir le laboratoire</button></div><div class="wc-lab-card"><b>📦 Cartes prêtes</b><p class="mut">Tu as actuellement <strong>${ready}</strong> carte(s) différente(s) avec au moins 3 exemplaires et pouvant être améliorées.</p><p class="mut">Les cartes <strong>Légendaire holo full art</strong> ne peuvent pas être améliorées davantage.</p></div></div>`;
    main.insertBefore(el,main.firstChild);
    el.querySelector('#wcLabFusion').onclick=()=>openFusionPicker();
  };
  const _collection=collection;
  collection=function(){main.classList.remove('wc-no-scroll-page');_collection();appendLab()};
  const _all=all;
  all=async function(){await _all();if(window.__wcFocusCard){const c=window.__wcFocusCard;window.__wcFocusCard=null;const box=document.createElement('div');box.className='wc-feature-panel';box.innerHTML=`<div style="display:flex;gap:12px;align-items:center"><img src="${esc(c.img)}" style="width:70px;height:92px;object-fit:cover;border-radius:7px"><div><h3 style="margin:0 0 4px">🎲 Carte découverte : ${esc(c.t)}</h3><div class="mut">${esc(rarityName(c.r))} · ${Number(c.v||0).toLocaleString('fr-FR')} vues Wikipédia</div></div><button class="btn g" id="wcFocusOpen" style="margin-left:auto">Ouvrir la carte</button></div>`;main.insertBefore(box,main.firstChild);box.querySelector('#wcFocusOpen').onclick=()=>openModal(c.id)}};
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ug');if(b){try{bumpDaily('upgrade',1)}catch(x){}}});
  const oldDaily=DAILY.slice();
  [['discover','🎲 Découvreur','Découvrir 1 carte aléatoire',1,75],['wish','⭐ Collectionneur','Ajouter 1 carte à la liste de souhaits',1,75],['upgrade','⬆️ Expérimentateur','Tenter 1 Card Upgrade',1,100]].forEach(([id,name,desc,goal,reward])=>{if(!DAILY.some(m=>m.id===id))DAILY.push({id,name,goal,reward,d:desc})});
  /* Les missions/succès doivent revenir à leur comportement normal sur les autres onglets. */
  const clearPageClass=()=>{if(tab!==5&&tab!==8)main.classList.remove('wc-no-scroll-page')};
  setInterval(clearPageClass,500);
})();

