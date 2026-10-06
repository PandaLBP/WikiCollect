/* ===== WIKICOLLECT CATALOG V4.1 — massif, persistant, image-only =====
   Le moteur est séparé de wc_col / wc_money et reprend exactement où il s'est arrêté.
   Il ne promet pas artificiellement 3 M : il collecte réellement les cartes trouvées avec image.
*/
(()=>{
  if(window.__WCV41Installed)return; window.__WCV41Installed=true;
  const DBN='WikiCollectCatalogV41',DBV=3,STORE='cards',META='meta';
  const API='https://fr.wikipedia.org/w/api.php?format=json&origin=*';
  const TARGET=3000000,BATCH=100,WAIT=90,MAX_CAT_DEPTH=8;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const title=s=>String(s||'').replace(/_/g,' ').trim();
  const bad=/^(liste|portail|homonymie|catégorie|modèle|annexe|fichier|aide|projet|chronologie|bibliographie|discographie|filmographie|sitographie|webographie|navigation):/i;
  const OV={};
  [['Pelé',7],['Cristiano Ronaldo',7],['Lionel Messi',7],['Karim Benzema',7],['Kylian Mbappé',7],['Michael Jackson',7],['Paris',7],['Tokyo',7],['New York',7],['Londres',7],['Los Angeles',7],['Albert Einstein',7],['Stephen Hawking',7],['Rayan Cherki',6]].forEach(([x,r])=>OV[norm(x)]=r);
  const SEEDS=[
   'Footballeur','Footballeuse','Joueur de football','Joueuse de football','Entraîneur de football','Arbitre de football','Joueur de basket-ball','Joueuse de basket-ball','Joueur de tennis','Joueuse de tennis','Pilote automobile','Pilote de Formule 1','Boxeur','Boxeuse','Arts martiaux mixtes',
   'Acteur français','Actrice française','Acteur américain','Actrice américaine','Acteur britannique','Actrice britannique','Acteur canadien','Actrice canadienne','Acteur allemand','Actrice allemande','Acteur japonais','Actrice japonaise','Acteur italien','Actrice italienne','Acteur espagnol','Actrice espagnole','Acteur sud-coréen','Actrice sud-coréenne',
   'Acteur de films pornographiques','Actrice de films pornographiques','Acteur de films pornographiques français','Actrice de films pornographiques française','Acteur de films pornographiques américain','Actrice de films pornographiques américaine','Film pornographique','Film pornographique français','Film pornographique américain','Réalisateur de films pornographiques',
   'Chanteur français','Chanteuse française','Chanteur américain','Chanteuse américaine','Chanteur britannique','Chanteuse britannique','Groupe musical','K-pop','Groupe de K-pop','Idole sud-coréenne','Chanteur sud-coréen','Chanteuse sud-coréenne','Musicien','Musicienne',
   'YouTubeur','Youtubeuse','Streamer','Streameuse','Personnalité d Internet','Personnalité du web','Créateur de contenu',
   'Film français','Film américain','Film britannique','Film japonais','Film sud-coréen','Série télévisée française','Série télévisée américaine','Série télévisée britannique','Série télévisée japonaise','Série télévisée sud-coréenne','Anime','Manga','Jeu vidéo','Personnage de jeu vidéo',
   'Animal','Insecte','Araignée','Poisson','Oiseau','Reptile','Mammifère','Dinosaure','Plante','Fleur','Arbre','Champignon','Bactérie','Virus','Espèce animale','Espèce végétale',
   'Astronomie','Étoile','Galaxie','Planète','Exoplanète','Objet céleste','Physicien','Mathématicien','Scientifique','Chimiste','Biologiste','Médecin','Ingénieur',
   'Écrivain français','Écrivain américain','Écrivain britannique','Poète','Artiste','Peintre','Sculpteur','Photographe','Personnalité historique','Chef d État','Monarque','Empereur','Impératrice','Roi','Reine',
   'Ville','Capitale','Pays','Commune de France','Monument historique','Architecture','Château','Cathédrale','Église','Musée','Pont','Stade','Aéroport','Gare',
   'Entreprise','Marque automobile','Automobile','Moto','Train','Avion','Hélicoptère','Bateau','Navire','Technologie','Informatique','Logiciel','Smartphone',
   'Cuisine française','Plat','Fromage','Dessert','Boisson','Livre','Album musical','Chanson','Compétition sportive','Trophée sportif','Événement historique','Guerre','Catastrophe naturelle','Événement culturel'
  ];
  const seeds=[...new Set(SEEDS)]; let dbp=null;
  const db=()=>dbp||(dbp=new Promise((resolve,reject)=>{const q=indexedDB.open(DBN,DBV);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains(STORE)){const st=d.createObjectStore(STORE,{keyPath:'k'});st.createIndex('title','title',{unique:false});st.createIndex('r','r',{unique:false})}if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'k'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)}));
  const tx=(sn,mode,fn)=>db().then(d=>new Promise((res,rej)=>{const t=d.transaction(sn,mode),st=t.objectStore(sn);let o;try{o=fn(st)}catch(e){rej(e);return}t.oncomplete=()=>res(o);t.onerror=()=>rej(t.error)}));
  const get=k=>tx(STORE,'readonly',s=>new Promise((r,j)=>{const q=s.get(k);q.onsuccess=()=>r(q.result||null);q.onerror=()=>j(q.error)}));
  const putMany=a=>a.length?tx(STORE,'readwrite',s=>a.forEach(x=>s.put(x))):Promise.resolve();
  const metaGet=k=>tx(META,'readonly',s=>new Promise((r,j)=>{const q=s.get(k);q.onsuccess=()=>r(q.result?.v);q.onerror=()=>j(q.error)}));
  const metaSet=(k,v)=>tx(META,'readwrite',s=>s.put({k,v}));
  const count=()=>tx(STORE,'readonly',s=>new Promise((r,j)=>{const q=s.count();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)}));
  const sample=async(limit=600)=>tx(STORE,'readonly',s=>new Promise((res,rej)=>{
    const out=[],seen=new Set(); let r=7;
    const next=()=>{
      if(out.length>=limit||r<0){res(out);return;}
      const q=s.index('r').openCursor(IDBKeyRange.only(r),'next');
      q.onsuccess=e=>{
        const c=e.target.result;
        if(!c){r--;next();return;}
        if(c.value?.img&&!seen.has(c.value.k)){
          seen.add(c.value.k);
          out.push({id:'v4-'+c.value.k,pid:'v4-'+c.value.k,t:c.value.title,r:c.value.r,v:c.value.v||0,img:c.value.img,src:'wiki',d:c.value.desc||'',url:c.value.url,cats:c.value.cats||[]});
        }
        if(out.length>=limit){res(out);return;}
        c.continue();
      };
      q.onerror=()=>rej(q.error);
    };
    next();
  }));
  /* V116 : cartes tirées au hasard n'importe où dans le catalogue, pour une rareté donnée (counts = {rareté: nombre}) */
  const randomSample=async(counts)=>{const out=[];
   for(const [rs,n] of Object.entries(counts||{})){const r=+rs;
    const total=await tx(STORE,'readonly',s=>new Promise((res,rej)=>{const q=s.index('r').count(IDBKeyRange.only(r));q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}));
    if(!total)continue;
    const want=Math.min(n,total),pk=new Set();let g=0;while(pk.size<want&&g++<want*6)pk.add(Math.floor(Math.random()*total));
    const offs=[...pk].sort((a,b)=>a-b);
    await tx(STORE,'readonly',s=>new Promise((res,rej)=>{const q=s.index('r').openCursor(IDBKeyRange.only(r));let j=0,pos=0;
     q.onsuccess=e=>{const c=e.target.result;if(!c){res();return}
      if(pos===offs[j]){const v=c.value;if(v&&v.img)out.push({id:'v4-'+v.k,pid:'v4-'+v.k,t:v.title,r:v.r,v:v.v||0,img:v.img,src:'wiki',d:v.desc||'',url:v.url,cats:v.cats||[]});j++}
      if(j>=offs.length){res();return}
      const step=offs[j]-pos;pos=offs[j];c.advance(Math.max(1,step))};
     q.onerror=()=>rej(q.error)}));
   }
   return out};
  async function api(params,base){
   const u=new URL(base||API);Object.entries(params||{}).forEach(([k,v])=>u.searchParams.set(k,v));u.searchParams.set("origin","*");
   let last=null;
   for(let n=0;n<6;n++){
    while(typeof navigator!=='undefined'&&navigator.onLine===false)await sleep(3000);
    const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);
    try{
     const r=await fetch(u.toString(),{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",headers:{"Accept":"application/json"},signal:ac.signal});
     if(!r.ok)throw Error("HTTP "+r.status);
     const ct=(r.headers.get("content-type")||"").toLowerCase();
     if(ct&&!ct.includes("json"))throw Error("Réponse non-JSON");
     return await r.json();
    }catch(e){last=e}finally{clearTimeout(tm)}
    if(n<5)await sleep(Math.min(20000,1000*Math.pow(2,n)));
   }
   throw last||Error("Wikipédia inaccessible");
  }
  /*
   * Rareté V4.2 : notoriété réelle avant catégorie.
   * Les vues sont mesurées sur 30 jours. La portée internationale et
   * la couverture encyclopédique servent seulement de départage.
   */
  const rarity=(t,pv,cats=[],meta={})=>{
    const forced=OV[norm(t)];
    if(forced!=null)return forced;
    try{const ff=forcedRarity(t);if(ff!=null)return ff}catch(e){wcDbg(e)}
    const views=Math.max(0,Number(pv)||0);
    const langs=Math.max(0,Number(meta.langs)||0);
    const length=Math.max(0,Number(meta.length)||0);
    let r =
      views>=3000000 ? 6 :
      views>=1500000 ? 5 :
      views>=500000  ? 4 :
      views>=150000  ? 3 :
      views>=30000   ? 2 :
      views>=5000    ? 1 : 0;
    /* Bonus de notoriété (plafonné à +2) : rayonnement international, article développé, importance historique / culturelle (catégories). */
    const ctx=(Array.isArray(cats)?cats:[]).join(' | '),strong=NOTABLE_STRONG.test(ctx);
    let bonus=0;
    if(r>=2 && langs>=30)bonus++;
    if(r>=1 && langs>=120)bonus++;                                        // article dans 120+ langues (Wikidata)
    if(r>=1 && (Number(meta.aw)||0)>=3)bonus++;                           // plusieurs prix / distinctions (Wikidata)
    if(r>=1 && meta.human && (Number(meta.pos)||0)>=2)bonus++;            // a occupé des fonctions importantes (Wikidata)
    if(r>=1 && (Number(meta.works)||0)>=5)bonus++;                        // nombreuses œuvres notables (Wikidata)
    if(r>=3 && length>=120000)bonus++;
    if(strong)bonus++;                                                   // souverains, chefs d'État, penseurs, savants, inventeurs, prophètes…
    else if(r>=1 && (langs>=20 || length>=40000) && NOTABLE_MEDIUM.test(ctx))bonus++; // artistes, écrivains, guerres, mouvements… quand l'article est vaste
    r+=Math.min(strong?3:2,bonus);
    if(strong)r=Math.max(r,views>=5000?2:1);                             // un souverain / penseur même peu consulté reste au moins Peu commun
    return Math.min(6,r);
  };
  const NOTABLE_STRONG=/(empereur|pharaon|monarque|souverain|\broi\b|\breine\b|tsar|sultan|calife|shogun|dictateur|chef d.[ée]tat|pr[ée]sident de la r[ée]publique|premier ministre|proph[èe]te|\bpape\b|philosoph|physicien|math[ée]maticien|astronome|chimiste|inventeur|explorateur|conqu[ée]rant|r[ée]volutionnaire|prix nobel|fondateur)/i;
  const NOTABLE_MEDIUM=/(personnalit|[ée]crivain|po[èe]te|compositeur|peintre|sculpteur|architecte|r[ée]alisateur|scientifique|[ée]conomiste|historien|th[ée]ologien|guerre|bataille|r[ée]volution|empire|dynastie|trait[ée]|mouvement|civilisation|religion|g[ée]n[ée]ral)/i;
  async function pageInfo(titles){if(!titles.length)return[];const j=await api({action:'query',prop:'pageimages|description|info|pageviews|langlinks|pageprops',ppprop:'wikibase_item',inprop:'url',piprop:'thumbnail',pithumbsize:'500',pilicense:'free',pvipdays:'30',lllimit:'100',titles:titles.join('|'),formatversion:'2'});return j.query?.pages||[]}
  async function ingest(pages,cats,{refresh=false}={}){
    const rows=[];
    for(const p of pages){
      const t=title(p.title),k=norm(t);
      if(!p.thumbnail?.source||!k||bad.test(t)||p.missing)continue;
      const old=await get(k);
      if(old?.img&&!refresh)continue;
      const pv=p.pageviews?Object.values(p.pageviews).reduce((a,b)=>a+(Number(b)||0),0):0;
      const langs=Array.isArray(p.langlinks)?p.langlinks.length:0;
      const length=Number(p.length)||0;
      const r=rarity(t,pv,[...(old?.cats||[]),...cats],wdMeta({...(old||{}),langs,length}));
      rows.push({
        ...(old||{}),k,title:t,id:old?.id||'wiki-v41-'+String(p.pageid),
        r,v:pv,img:p.thumbnail.source,desc:p.description||old?.desc||'',
        url:p.fullurl||old?.url||('https://fr.wikipedia.org/wiki/'+encodeURIComponent(t.replace(/ /g,'_'))),
        src:'wiki',qid:p.pageprops?.wikibase_item||old?.qid||'',cats:[...new Set([...(old?.cats||[]),...cats])],
        langs,length,pop:Math.round(Math.min(100,
          Math.log10(1+pv)/7*75 +
          Math.min(langs,100)/100*15 +
          Math.min(length,120000)/120000*10
        )),updatedAt:Date.now()
      });
    }
    try{await enrichWD(rows)}catch(e){console.info('ℹ️ Wikidata indisponible, enrichissement repoussé')}
    if(rows.length)await putMany(rows);
    return rows;
  }
  /* V4.4 : Wikidata (notoriété réelle) pour les articles déjà un minimum consultés. Langues d'Wikipédia, distinctions, fonctions occupées, œuvres notables. */
  const WDAPI='https://www.wikidata.org/w/api.php';
  const WD_SKIP=/^(commons|species|meta|wikidata|mediawiki|incubator|outreach|strategy|foundation|sources)wiki$/;
  const wdMeta=v=>({langs:Math.max(v.langs||0,v.sl||0),length:v.length||0,aw:v.aw||0,pos:v.pos||0,works:v.works||0,human:!!v.human});
  async function enrichWD(rows){
    const need=rows.filter(r=>r&&r.title&&(r.v||0)>=5000&&!r.wd);
    if(!need.length)return 0;
    for(let i=0;i<need.length;i+=50){
      const part=need.slice(i,i+50);
      const missing=part.filter(r=>!r.qid);
      if(missing.length){
        const j=await api({action:'query',prop:'pageprops',ppprop:'wikibase_item',titles:missing.map(r=>r.title).join('|'),formatversion:'2'});
        const map={};(j.query?.pages||[]).forEach(p=>{if(p.pageprops?.wikibase_item)map[norm(title(p.title))]=p.pageprops.wikibase_item});
        (j.query?.normalized||[]).forEach(n=>{const q=map[norm(n.to)];if(q)map[norm(n.from)]=q});
        missing.forEach(r=>{r.qid=map[norm(r.title)]||''});
      }
      const withQ=part.filter(r=>r.qid);
      if(withQ.length){
        const ids=withQ.map(r=>r.qid).join('|');
        const sj=await api({action:'wbgetentities',ids,props:'sitelinks',format:'json'},WDAPI);
        withQ.forEach(r=>{const e=sj.entities?.[r.qid];if(e&&e.sitelinks)r.sl=Object.keys(e.sitelinks).filter(k=>/^[a-z_]+wiki$/.test(k)&&!WD_SKIP.test(k)).length});
        const big=withQ.filter(r=>(r.v||0)>=30000);
        if(big.length){
          const cj=await api({action:'wbgetentities',ids:big.map(r=>r.qid).join('|'),props:'claims',format:'json'},WDAPI);
          big.forEach(r=>{const c=cj.entities?.[r.qid]?.claims;if(!c)return;
            r.aw=(c.P166||[]).length;r.pos=(c.P39||[]).length;r.works=(c.P800||[]).length;
            r.human=(c.P31||[]).some(x=>x.mainsnak?.datavalue?.value?.id==='Q5')});
        }
      }
      part.forEach(r=>{r.wd=Date.now();r.r=rarity(r.title,r.v||0,r.cats||[],wdMeta(r))});
      await sleep(300);
    }
    return need.length;
  }
  async function enrichExisting(limit=400){
    const rows=[];
    await tx(STORE,'readonly',st=>new Promise((res,rej)=>{const cur=st.openCursor();cur.onsuccess=e=>{const c=e.target.result;if(!c||rows.length>=limit){res();return}const v=c.value;if(v&&v.img&&v.title&&(v.v||0)>=5000&&!v.wd)rows.push({...v});c.continue()};cur.onerror=()=>rej(cur.error)}));
    if(!rows.length)return 0;
    const n=await enrichWD(rows);
    await putMany(rows.filter(r=>r.wd));
    return n;
  }
  async function rerateLocal(){
    if(await metaGet('rar43'))return 0;
    const buf=[];
    await tx(STORE,'readonly',st=>new Promise((res,rej)=>{const cur=st.openCursor();cur.onsuccess=e=>{const c=e.target.result;if(!c){res();return}const v=c.value;if(v&&v.img&&v.title){const r=rarity(v.title,v.v||0,v.cats||[],wdMeta(v));if(r!==v.r)buf.push({...v,r})}c.continue()};cur.onerror=()=>rej(cur.error)}));
    for(let i=0;i<buf.length;i+=500)await putMany(buf.slice(i,i+500));
    await metaSet('rar43',1);return buf.length}
  async function refreshExisting(limit=200){
    const keys=[];
    await tx(STORE,'readonly',st=>new Promise((resolve,reject)=>{
      const cur=st.openCursor();
      cur.onsuccess=e=>{
        const c=e.target.result;
        if(!c||keys.length>=limit){resolve();return;}
        if(c.value?.img&&c.value?.url)keys.push(c.value.title);
        c.continue();
      };
      cur.onerror=()=>reject(cur.error);
    }));
    for(let i=0;i<keys.length;i+=50){
      try{await ingest(await pageInfo(keys.slice(i,i+50)),['refresh'],{refresh:true})}
      catch(e){console.warn('refresh batch',e)}
      await sleep(250);
    }
    return keys.length;
  }
  let running=false;
  async function crawlCategory(root,state){
    state.catQueue=state.catQueue||[];state.doneCats=state.doneCats||{};
    if(!state.catQueue.length)state.catQueue=[{cat:root,depth:0,cont:''}];
    while(state.catQueue.length&&(await count())<TARGET){const item=state.catQueue.shift(),ck=norm(item.cat);if(item.depth>MAX_CAT_DEPTH)continue;if(state.doneCats[ck]&&!item.cont)continue;
      const j=await api({action:'query',list:'categorymembers',cmtitle:'Catégorie:'+item.cat,cmtype:'page|subcat',cmnamespace:'0|14',cmlimit:'500',...(item.cont?{cmcontinue:item.cont}:{})});
      const pages=[],subs=[];for(const x of Object.values(j.query?.categorymembers||{})){if(x.ns===14){subs.push({cat:x.title.replace(/^Catégorie:/i,''),depth:item.depth+1,cont:''})}else if(x.ns===0)pages.push(x.title)}
      for(const sub of subs){const sk=norm(sub.cat);if(!state.doneCats[sk]&&sub.depth<=MAX_CAT_DEPTH&&!state.catQueue.some(x=>norm(x.cat)===sk&&!x.cont))state.catQueue.push(sub)}
      for(let i=0;i<pages.length&&await count()<TARGET;i+=BATCH){try{const rows=await ingest(await pageInfo(pages.slice(i,i+BATCH)),[root,item.cat]);state.added=(state.added||0)+rows.length}catch(e){console.warn('batch',e)}state.processed=(state.processed||0)+Math.min(BATCH,pages.length-i);await metaSet('state',state);await sleep(WAIT)}
      const next=j.continue?.cmcontinue||'';if(next)state.catQueue.push({cat:item.cat,depth:item.depth,cont:next});else state.doneCats[ck]=1;await metaSet('state',state);
      console.log('📚',root,'→',await count(),'cartes · file',state.catQueue.length);
    }
  }
  async function run(){if(running)return;running=true;try{await db();let st=await metaGet('state')||{seed:0,added:0,processed:0,catQueue:[],doneCats:{},globalCursor:''};
    const beforeCol=(()=>{try{return Object.keys(JSON.parse(localStorage.getItem('wc_col')||'{}')).length}catch{return -1}})(),beforeMoney=localStorage.getItem('wc_money');
    console.log('🎴 WikiCollect V4.2 — objectif',TARGET.toLocaleString('fr-FR'),'· collection protégée',beforeCol,'· WikiCo',beforeMoney);
    try{const rr=await rerateLocal();if(rr)console.log('⚖️ Raretés du catalogue réévaluées (notoriété + importance) :',rr,'cartes')}catch(e){console.warn('rerate',e)}
    try{const en=await enrichExisting(400);if(en)console.log('🌐 Wikidata : notoriété ajoutée à',en,'articles (le robot continue à chaque lancement)')}catch(e){console.info('ℹ️ Wikidata indisponible pour le moment, réessai au prochain lancement.')}
    try{const refreshed=await refreshExisting(200);console.log('🔄 Rareté/notoriété réévaluées :',refreshed,'cartes')}catch(e){console.warn('refresh rarity',e)}
    for(;st.seed<seeds.length&&(await count())<TARGET;st.seed++){const root=seeds[st.seed];console.log(`🚀 [${st.seed+1}/${seeds.length}] ${root}`);for(let at=0;at<3;at++){try{await crawlCategory(root,st);break}catch(e){if(at<2){await sleep(8000*(at+1))}else console.info('ℹ️ Catalogue : catégorie « '+root+' » passée (réseau instable), reprise au prochain lancement.')}}st.catQueue=[];st.doneCats={};await metaSet('state',st)}
    while((await count())<TARGET){const j=await api({action:'query',list:'allpages',apnamespace:'0',aplimit:'500',...(st.globalCursor?{apcontinue:st.globalCursor}:{})});const titles=(j.query?.allpages||[]).map(x=>x.title);if(!titles.length)break;for(let i=0;i<titles.length&&await count()<TARGET;i+=BATCH){try{const rows=await ingest(await pageInfo(titles.slice(i,i+BATCH)),['Catalogue Wikipédia FR']);st.added=(st.added||0)+rows.length}catch(e){console.warn('allpages',e)}await metaSet('state',st);await sleep(WAIT)}st.globalCursor=j.continue?.apcontinue||'';await metaSet('state',st);if(!st.globalCursor)break}
    const afterCol=(()=>{try{return Object.keys(JSON.parse(localStorage.getItem('wc_col')||'{}')).length}catch{return -1}})();const afterMoney=localStorage.getItem('wc_money');console.log('━━━━━━━━━━━━━━━━━━━━');console.log('✅ Catalogue V4.1 :',(await count()).toLocaleString('fr-FR'),'cartes avec image');console.log('➕ nouvelles cartes :',(st.added||0).toLocaleString('fr-FR'));console.log('🛡️ Collection',beforeCol,'→',afterCol,'· WikiCo',beforeMoney,'→',afterMoney);console.log('💾 Progression persistante dans IndexedDB');
  }catch(e){console.error('❌ WCV4.1',e)}running=false}
  async function queryPage(opts={}){
    const page=Math.max(1,opts.page|0),size=Math.min(50,Math.max(1,opts.size||50)),term=norm(opts.q||''),rs=Array.isArray(opts.rarities)?opts.rarities.map(Number):[],az=opts.sort==='az',skip=(page-1)*size;
    const make=c=>({id:'v4-'+c.k,pid:'v4-'+c.k,t:c.title,r:c.r,v:c.v||0,pop:c.pop||0,langs:c.langs||0,length:c.length||0,img:c.img,src:'wiki',d:c.desc||'',url:c.url});
    return tx(STORE,'readonly',s=>new Promise((resolve,reject)=>{
      const out=[];let matched=0;
      const accept=c=>!!c?.img&&(!rs.length||rs.includes(c.r))&&(!term||norm(c.title).includes(term));
      if(az){
        const cur=s.index('title').openCursor(null,'next');
        cur.onsuccess=e=>{const c=e.target.result;if(!c){resolve({rows:out,matched});return;}if(accept(c.value)){if(matched>=skip&&out.length<size)out.push(make(c.value));matched++;}if(out.length>=size){resolve({rows:out,matched});return;}c.continue()};
        cur.onerror=()=>reject(cur.error);return;
      }
      const ranks=rs.length?rs:[7,6,5,4,3,2,1,0];let ri=0;
      const openRank=()=>{
        if(ri>=ranks.length){resolve({rows:out,matched});return;}
        const cur=s.index('r').openCursor(IDBKeyRange.only(ranks[ri]),'prev');
        cur.onsuccess=e=>{const c=e.target.result;if(!c){ri++;openRank();return;}if(accept(c.value)){if(matched>=skip&&out.length<size)out.push(make(c.value));matched++;}if(out.length>=size){resolve({rows:out,matched});return;}c.continue()};
        cur.onerror=()=>reject(cur.error);
      };
      openRank();
    }));
  }

  window.wcCatalogV41={start:run,count,progress:async()=>console.table(await metaGet('state')||{}),sample,randomSample,queryPage,resetProgress:async()=>{await metaSet('state',{seed:0,added:0,processed:0,catQueue:[],doneCats:{},globalCursor:''});console.log('Progression remise à zéro — catalogue conservé.')}};
  db().catch(()=>{});setTimeout(run,1200);
})();
