/* Récompenses de connexion, paliers de collection, laboratoire */
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
  function saveLogin(s){try{localStorage.setItem(LOGIN_KEY,JSON.stringify(s))}catch(e){}}

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
  function saveMilestones(s){try{localStorage.setItem(MKEY,JSON.stringify(s))}catch(e){}}

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
      try{save()}catch(e){}
    }
    return res;
  };

  // Enrich profile with login + milestones.
  const oldProfile=profilePage;
  profilePage=function(){
    oldProfile();
    try{
      claimLoginIfNeeded();
      const wrap=document.createElement("div");
      wrap.id="wcLoginMilestones";
      wrap.innerHTML=loginHTML()+milestonesHTML();
      main.appendChild(wrap);
    }catch(e){}
  };

  // Also check milestone rewards after collection changes.
  const oldCollection=collection;
  collection=function(){
    oldCollection();
    try{
      claimMilestones();
      const holder=document.createElement("div");
      holder.id="wcMilestonesCollection";
      holder.innerHTML=milestonesHTML();
      main.appendChild(holder);
    }catch(e){}
  };

  // Claim today's login reward as soon as the game loads, while keeping the visual on Profile.
  try{claimLoginIfNeeded()}catch(e){}

})();

