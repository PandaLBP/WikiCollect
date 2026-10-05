/* Sauvegarde : export / import du fichier, rappel */
(function(){
 const W=window.WCSAVE;if(!W)return;
 const tryf=f=>{try{f()}catch(e){}};
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
    W.block=true;try{await W.put("before-import",W.snap())}catch(x){}try{await W.put("col",null)}catch(x){}
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

