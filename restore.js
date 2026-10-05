(function(){
 try{window.__LT0=+localStorage.getItem("wc_col_t")||0}catch(e){window.__LT0=0}
 window.__colChecked=false;
 const SKIP=/^wc_(rank|films)/;
 const keys=()=>{const a=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith("wc_")||k.startsWith("ACCOUNT_"))&&!SKIP.test(k))a.push(k)}return a};
 const snap=()=>{const d={};keys().forEach(k=>{d[k]=localStorage.getItem(k)});return{v:2,t:Date.now(),site:"WikiCollect",d}};
 const has=d=>{try{return Object.keys(JSON.parse(d.wc_col||"{}")).length>0}catch(e){return false}};
 const idb=()=>new Promise((res,rej)=>{try{const r=indexedDB.open("wikicollect_backup",1);r.onupgradeneeded=()=>r.result.createObjectStore("b");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
 const put=(k,v)=>idb().then(db=>new Promise((res,rej)=>{const t=db.transaction("b","readwrite");t.objectStore("b").put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})).catch(()=>{});
 const get=k=>idb().then(db=>new Promise(res=>{const q=db.transaction("b").objectStore("b").get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)})).catch(()=>null);
 const W=window.WCSAVE={keys,snap,has,put,get,ready:false,last:0,block:false};
 W.backup=async()=>{if(!W.ready||W.block)return;const s=snap();if(!has(s.d))return;const prev=await get("last");if(prev&&s.t-prev.t>36e5)await put("prev",prev);await put("last",s);W.last=s.t};
 if(!has(snap().d)&&!sessionStorage.getItem("wc_restored")){
  // navigateur vidé : on récupère la copie de secours (IndexedDB), puis on recharge une seule fois
  Promise.all([get("last"),get("prev")]).then(([a,b])=>{const best=[a,b].filter(x=>x&&x.d&&has(x.d)).sort((x,y)=>y.t-x.t)[0];
   if(best){W.block=true;Object.keys(best.d).forEach(k=>localStorage.setItem(k,best.d[k]));sessionStorage.setItem("wc_restored","1");location.reload()}else W.ready=true});
 }else W.ready=true;
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
})();
