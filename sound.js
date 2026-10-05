/* Sons et effets audio du jeu */
/* ===== V67 : sons partout ===== */
(function(){
 const sfx=n=>(...a)=>{try{return SFX[n](...a)}catch(e){}};
 // curseur de volume
 const vs=document.getElementById('volSlider');
 if(vs){vs.value=Math.round(SFX.getVol()*100);vs.oninput=()=>SFX.setVol(vs.value/100);vs.onchange=()=>SFX.click()}
 // fenêtre de détail d'une carte
 const _om=openModal;openModal=function(){sfx('open')();return _om.apply(this,arguments)};
 const _cm=closeModal;closeModal=function(){try{if(M.style.display==='flex')SFX.close()}catch(e){}return _cm.apply(this,arguments)};
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
  const c=Math.abs(Math.log((w/h)/(bw/bh)))>.22;i.classList.toggle("fitc",c);b.classList.toggle("fitb",c);i.dataset.f=1}catch(e){}}
 document.addEventListener("load",e=>{const t=e.target;if(t&&t.tagName=="IMG"&&t.closest&&t.closest(".card .in"))fit(t)},true);
 setInterval(()=>document.querySelectorAll(".card .in img:not([data-f])").forEach(i=>{if(i.complete&&i.naturalWidth)fit(i)}),700);
})();

