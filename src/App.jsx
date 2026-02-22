
  const CategoryPills=({selected=[],onChange})=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {categories.map(cat=>{const active=selected.includes(cat);const c=catColor(cat);return <button key={cat} onClick={()=>onChange(active?selected.filter(x=>x!==cat):[...selected,cat])} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${active?c.color:T.inputBorder}`,background:active?c.bg:"transparent",color:active?c.color:T.textMuted,fontFamily:"inherit"}}>{cat}</button>;})}
      <button onClick={()=>setAddCatModal(true)} style={{padding:"5px 10px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px dashed ${T.inputBorder}`,background:"transparent",color:T.textLight,fontFamily:"inherit"}}>+ Nouvelle</button>
    </div>
  );

  const CompactDishCard=({dish,onSelect})=>{
    const thumb=dish.thumbnail||dish.photo;
    const cats=dish.categories||[];
    return (
      <div onClick={()=>onSelect(dish)} style={{...s.card,display:"flex",gap:12,alignItems:"center",cursor:"pointer"}}>
        <div style={{width:44,height:44,borderRadius:10,background:T.accentLight,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
          {thumb?<img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:13,color:T.text}}>{dish.name}</div>
          {cats.length>0&&<div style={{fontSize:10,color:T.textMuted}}>{cats.join(", ")}</div>}
        </div>
      </div>
    );
  };

  const PlanSlot=({slot,isWeekend})=>{
    const entry=currentWeekPlan[slot];
    const dish=entry?dishes.find(d=>d.id===entry.id):null;
    const display=dish||entry;
    const meal=slot.split(" ").pop();
    const [over,setOver]=useState(false);
    return (
      <div onDragOver={e=>{e.preventDefault();setOver(true);}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);handleDrop(slot);}}
        style={{background:over?(isWeekend?T.weekendBg:T.weekdayBg):"transparent",border:`1.5px ${over?"solid":"dashed"} ${over?(isWeekend?T.weekendHeader:T.weekdayHeader):(isWeekend?T.weekendBorder:T.weekdayBorder)}`,borderRadius:10,padding:"8px 10px",minHeight:62,transition:"all 0.15s"}}>
        <div style={{fontSize:10,fontWeight:700,color:isWeekend?T.weekendHeader:T.weekdayHeader,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>{meal==="midi"?"☀️ Midi":"🌙 Soir"}</div>
        {display?(
          <div draggable onDragStart={()=>setDragItem({slot,dish:entry})}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:26,height:26,borderRadius:7,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,overflow:"hidden",flexShrink:0}}>
                {(display.photo||display.thumbnail)?<img src={display.thumbnail||display.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
              </div>
              <div style={{flex:1,fontSize:12,fontWeight:600,color:T.text,cursor:"grab",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{display.name}</div>
              <button onClick={()=>removeFromPlan(slot)} style={{...s.iconBtn,fontSize:14,flexShrink:0}}>×</button>
            </div>
          </div>
        ):<button onClick={()=>setPlanSlot(slot)} style={{background:"transparent",border:"none",color:T.textLight,fontSize:12,padding:"2px 0",cursor:"pointer",fontFamily:"inherit",width:"100%",textAlign:"left"}}>+ Assigner</button>}
      </div>
    );
  };

  const Modal=({title,onClose,children})=>(
    <div style={{position:"fixed",inset:0,background:"rgba(10,20,35,0.55)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"0 24px 28px",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:`0 -20px 60px ${T.shadowMd}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 20px"}}><div style={{width:36,height:4,background:T.inputBorder,borderRadius:2}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:800,color:T.text}}>{title}</h2>
          <button onClick={onClose} style={{...s.iconBtn,fontSize:22}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );

  const DishForm=({initial,onSave,onCancel})=>{
    const fromIdea=initial?.fromIdea;
    const def=fromIdea?{name:fromIdea.title,categories:[],tasteByUser:{},dishesRating:2,timeRating:2,recipe:fromIdea.note||"",photo:null,thumbnail:null,favorite:false,links:fromIdea.links||[]}:initial||{name:"",categories:[],tasteByUser:{},dishesRating:2,timeRating:2,recipe:"",photo:null,thumbnail:null,favorite:false,links:[]};
    const [form,setForm]=useState({...def,categories:def.categories||(def.category?[def.category]:[]),links:def.links||[]});
    const set=(k,v)=>setForm(f=>({...f,[k]:v}));
    const myTaste=form.tasteByUser?.[currentUser]||3;
    const [cropSrc,setCropSrc]=useState(null);
    const handleFile=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCropSrc(ev.target.result);r.readAsDataURL(f);};
    const handleCropDone=({thumbnail,full})=>{set("thumbnail",thumbnail);set("photo",full);setCropSrc(null);};
    if(cropSrc)return <CropTool src={cropSrc} onDone={handleCropDone} onCancel={()=>setCropSrc(null)} T={T}/>;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><label style={s.label}>Nom du plat *</label><input value={form.name} onChange={e=>set("name",e.target.value)} style={s.input} placeholder="Ex: Tarte aux poireaux"/></div>
        <div><label style={s.label}>Catégories</label><CategoryPills selected={form.categories} onChange={v=>set("categories",v)}/></div>
        <div>
          <label style={s.label}>Photo</label>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:60,height:60,borderRadius:12,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",flexShrink:0}}>
              {form.thumbnail?<img src={form.thumbnail} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
            </div>
            <label style={{...s.ghost,fontSize:13,cursor:"pointer",padding:"8px 14px"}}>📷 Choisir<input type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/></label>
            {form.thumbnail&&<button onClick={()=>{set("thumbnail",null);set("photo",null);}} style={{...s.iconBtn,color:T.danger}}>✕</button>}
          </div>
        </div>
        <div><label style={s.label}>★ Mon goût ({currentUser})</label><StarRating icon="★" value={myTaste} onChange={v=>set("tasteByUser",{...form.tasteByUser,[currentUser]:v})} color="#f59e0b" size={24}/></div>
        <div><label style={s.label}>🍽️ Vaisselle</label><StarRating icon="🫧" value={form.dishesRating} onChange={v=>set("dishesRating",v)} color={T.accent} size={22}/></div>
        <div><label style={s.label}>⏱️ Temps de préparation</label><StarRating icon="⏱️" value={form.timeRating} onChange={v=>set("timeRating",v)} color={T.green} size={22}/></div>
        <div><label style={s.label}>Recette</label><textarea value={form.recipe} onChange={e=>set("recipe",e.target.value)} style={{...s.input,height:90,resize:"vertical"}} placeholder="Instructions, notes..."/></div>
        <div><label style={s.label}>Liens</label><LinksEditor links={form.links} onChange={v=>set("links",v)} T={T} s={s}/></div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:14,color:T.textMuted}}><input type="checkbox" checked={form.favorite} onChange={e=>set("favorite",e.target.checked)}/> Favori ★</label>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{...s.ghost,flex:1}}>Annuler</button>
          <button onClick={()=>form.name&&onSave({...form,tasteByUser:{...form.tasteByUser,[currentUser]:myTaste}})} style={{...s.primary,flex:1}} disabled={!form.name}>Enregistrer</button>
        </div>
      </div>
    );
  };

  const IdeaForm=({initial,onSave,onCancel})=>{
    const [form,setForm]=useState(initial||{title:"",note:"",links:[],photo:null,thumbnail:null,tested:false});
    const set=(k,v)=>setForm(f=>({...f,[k]:v}));
    const [cropSrc,setCropSrc]=useState(null);
    const handleFile=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCropSrc(ev.target.result);r.readAsDataURL(f);};
    const handleCropDone=({thumbnail,full})=>{set("thumbnail",thumbnail);set("photo",full);setCropSrc(null);};
    if(cropSrc)return <CropTool src={cropSrc} onDone={handleCropDone} onCancel={()=>setCropSrc(null)} T={T}/>;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><label style={s.label}>Titre</label><input value={form.title} onChange={e=>set("title",e.target.value)} style={s.input} placeholder="Ex: Shakshuka"/></div>
        <div><label style={s.label}>Notes</label><textarea value={form.note} onChange={e=>set("note",e.target.value)} style={{...s.input,height:80,resize:"vertical"}} placeholder="Description, ingrédients..."/></div>
        <div><label style={s.label}>Liens</label><LinksEditor links={form.links||[]} onChange={v=>set("links",v)} T={T} s={s}/></div>
        <div>
          <label style={s.label}>Photo</label>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:52,height:52,borderRadius:10,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden"}}>
              {form.thumbnail?<img src={form.thumbnail} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"💡"}
            </div>
            <label style={{...s.ghost,fontSize:13,cursor:"pointer",padding:"8px 14px"}}>📷 Ajouter<input type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/></label>
            {form.thumbnail&&<button onClick={()=>{set("thumbnail",null);set("photo",null);}} style={{...s.iconBtn,color:T.danger}}>✕</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{...s.ghost,flex:1}}>Annuler</button>
          <button onClick={()=>onSave(form)} style={{...s.primary,flex:1}}>Enregistrer</button>
        </div>
      </div>
    );
  };

  const groupSlots=slots=>{const m={};slots.forEach(slot=>{const p=slot.split(" ");const meal=p.pop();const day=p.join(" ");if(!m[day])m[day]={};m[day][meal]=slot;});return m;};
  const weekdayByDay=groupSlots(WEEKDAY_SLOTS);
  const weekendByDay=groupSlots(WEEKEND_SLOTS);

  return (
    <div style={s.app}>
      {/* HEADER COMPACT + TABS INTÉGRÉS */}
      <style>{`
        @keyframes aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .aurora-hdr{background-size:300% 300%!important;animation:aurora 10s ease infinite}
        @keyframes starPop{0%{transform:scale(1)}40%{transform:scale(1.5)}70%{transform:scale(0.9)}100%{transform:scale(1)}}
        @keyframes btnPress{0%{transform:scale(1)}40%{transform:scale(0.93)}100%{transform:scale(1)}}
        .star-anim{animation:starPop 0.35s ease}
        .btn-anim:active{animation:btnPress 0.2s ease}
      `}</style>
      <div className="aurora-hdr" style={{background:T.headerBg}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 6px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>🥗</span>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:"white",letterSpacing:-0.3,lineHeight:1.1}}>Orga de plat</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",lineHeight:1.2}}>
                {ALLOWED_EMAILS[authUser?.email]?.avatar} {currentUser}
                {computeStats.missingSlots.length>0&&<span style={{marginLeft:6,opacity:0.85}}>· {computeStats.missingSlots.length} créneaux à planifier</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:8,padding:"5px 9px",fontSize:15,cursor:"pointer",color:"white"}}>{dark?"☀️":"🌙"}</button>
            <button onClick={()=>signOut(auth)} style={{background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",color:"white",fontFamily:"inherit",fontWeight:600}}>Quitter</button>
          </div>
        </div>
        {/* TABS fondus dans le bandeau */}
        <div style={{display:"flex",gap:2,padding:"0 6px"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              padding:"5px 2px 7px", border:"none", cursor:"pointer", fontFamily:"inherit",
              background: tab===t.id ? "rgba(255,255,255,0.18)" : "transparent",
              borderRadius:"10px 10px 0 0",
              transition:"background 0.15s",
            }}>
              <span style={{fontSize:17, filter: tab===t.id ? "none" : "grayscale(1) opacity(0.5)"}}>{t.icon}</span>
              <span style={{fontSize:9, fontWeight: tab===t.id?700:500, color: tab===t.id?"white":"rgba(255,255,255,0.55)"}}>{t.label}</span>
            </button>
          ))}
        </div>
        {/* Barre blanche de séparation avec fond page */}
        <div style={{height:10,background:T.bg,borderRadius:"14px 14px 0 0",marginTop:-1}}/>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,padding:16,paddingBottom:36}}>

        {/* ══ PLATS ══ */}
        {tab==="dishes"&&<div>
          {/* Barre loupe + ajouter */}
          <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
            <button onClick={()=>setSearchQ(q=>q===null?"":null)} style={{
              width:42,height:42,borderRadius:11,border:`1.5px solid ${searchQ!==null?T.accent:T.inputBorder}`,
              background:searchQ!==null?T.accentLight:T.card,cursor:"pointer",fontSize:19,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              boxShadow:`0 1px 6px ${T.shadow}`,
            }}>🔍</button>
            <button onClick={()=>setShowAddDish(true)} style={{...s.primary,flex:1,padding:"10px 0",textAlign:"center"}}>+ Ajouter un plat</button>
          </div>

          {/* Barre de recherche (dépliable) */}
          {searchQ!==null&&<div style={{marginBottom:10}}>
            <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              placeholder="Rechercher un plat..." style={{...s.input}}/>
          </div>}

          {/* Filtres en grille wrap — sans scroll */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            <button onClick={()=>setFilterFavOnly(f=>!f)} style={{fontSize:12,padding:"5px 12px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${filterFavOnly?"#f59e0b":T.inputBorder}`,background:filterFavOnly?"#fef3c7":"transparent",color:filterFavOnly?"#d97706":T.textMuted,fontFamily:"inherit",fontWeight:filterFavOnly?700:400}}>★ Favoris</button>
            <button onClick={()=>setFilterCat("")} style={{fontSize:12,padding:"5px 12px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${filterCat===""?T.accent:T.inputBorder}`,background:filterCat===""?T.accentLight:"transparent",color:filterCat===""?T.accent:T.textMuted,fontFamily:"inherit",fontWeight:filterCat===""?700:400}}>Tous</button>
            {categories.map(cat=>{const active=filterCat===cat;const c=catColor(cat);return <button key={cat} onClick={()=>setFilterCat(active?"":cat)} style={{fontSize:12,padding:"5px 12px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${active?c.color:T.inputBorder}`,background:active?c.bg:"transparent",color:active?c.color:T.textMuted,fontFamily:"inherit",fontWeight:active?700:400}}>{cat}</button>;})}
          </div>

          {/* Astuce swipe */}
          <div style={{fontSize:11,color:T.textLight,textAlign:"center",marginBottom:10}}>
            ← favori &nbsp;|&nbsp; appui long = noter &nbsp;|&nbsp; planifier →
          </div>

          {/* Grille 2 colonnes */}
          {filteredDishes.length===0&&<div style={{textAlign:"center",color:T.textLight,padding:"40px 0"}}>Aucun plat trouvé 🍽️</div>}
          <style>{`
            @keyframes cardSlideUp {
              from { opacity: 0; transform: translateY(22px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {filteredDishes.map((d,i)=>(
              <div key={d.id} style={{animation:`cardSlideUp 0.35s ease both`,animationDelay:`${Math.min(i*0.06,0.5)}s`}}>
                <SwipeCard dish={d} T={T} catColor={catColor}
                  onTap={dish=>setViewDish(dish)}
                  onSwipeRight={dish=>{ setPendingDishForPlan(dish); setPlanSlot("__pick__"); setSelectedSlots([]); }}
                  onSwipeLeft={dish=>toggleFav(dish)}
                  onLongPress={dish=>setRatingModal(dish)}
                />
              </div>
            ))}
          </div>
        </div>}

        {/* ══ PLANNING ══ */}
        {tab==="plan"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
            <div style={{display:"flex",background:T.segBg,borderRadius:12,padding:3,flex:1,gap:3}}>
              {[{id:"weekday",label:"Lun → Ven midi",icon:"💼"},{id:"weekend",label:"Ven soir → Dim",icon:"🌿"}].map(v=><button key={v.id} onClick={()=>setPlanView(v.id)} style={{flex:1,padding:"9px 6px",borderRadius:9,border:"none",background:planView===v.id?T.card:"transparent",color:planView===v.id?(v.id==="weekday"?T.weekdayHeader:T.weekendHeader):T.textMuted,fontWeight:planView===v.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:planView===v.id?`0 2px 8px ${T.shadow}`:"none"}}>{v.icon} {v.label}</button>)}
            </div>
            <button onClick={()=>setConfirmResetPlan(true)} title="Remettre à zéro" style={{background:T.card,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,padding:"8px 10px",cursor:"pointer",fontSize:16,color:T.danger,flexShrink:0}}>🗑️</button>
          </div>

          {planView==="weekday"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{Object.entries(weekdayByDay).map(([day,meals])=><div key={day} style={{...s.card,padding:0,overflow:"hidden",borderColor:T.weekdayBorder}}><div style={{background:T.weekdayHeader,color:"white",padding:"8px 14px",fontWeight:700,fontSize:13}}>{day}</div><div style={{display:"grid",gridTemplateColumns:meals.soir?"1fr 1fr":"1fr",padding:8,gap:8}}>{meals.midi&&<PlanSlot slot={meals.midi} isWeekend={false}/>}{meals.soir&&<PlanSlot slot={meals.soir} isWeekend={false}/>}</div></div>)}</div>}
          {planView==="weekend"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{Object.entries(weekendByDay).map(([day,meals])=><div key={day} style={{...s.card,padding:0,overflow:"hidden",borderColor:T.weekendBorder}}><div style={{background:T.weekendHeader,color:"white",padding:"8px 14px",fontWeight:700,fontSize:13}}>{day}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",padding:8,gap:8}}>{meals.midi&&<PlanSlot slot={meals.midi} isWeekend={true}/>}{meals.soir&&<PlanSlot slot={meals.soir} isWeekend={true}/>}</div></div>)}</div>}

          {pastWeeks.length>0&&<div style={{marginTop:24}}><div style={{fontWeight:700,color:T.textMuted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>📚 Semaines passées</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{pastWeeks.map(wk=><button key={wk} onClick={()=>setHistoryWeek(wk)} style={{...s.card,padding:"10px 14px",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontWeight:600,color:T.text,fontSize:13}}>Semaine du {wk}</div><div style={{fontSize:11,color:T.textMuted}}>{Object.values(weekPlans[wk]||{}).filter(Boolean).length} repas</div></button>)}</div></div>}
        </div>}

        {/* ══ IDÉES ══ */}
        {tab==="ideas"&&<div>
          <button onClick={()=>setShowAddIdea(true)} style={{...s.green,width:"100%",padding:12,marginBottom:14}}>+ Nouvelle idée de plat</button>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ideas.length===0&&<div style={{textAlign:"center",color:T.textLight,padding:"40px 0"}}>Aucune idée pour l'instant 💡</div>}
            {ideas.map(idea=><div key={idea.id} style={{...s.card,opacity:idea.tested?0.6:1}}>
              <div style={{display:"flex",gap:10}}>
                <div style={{width:50,height:50,borderRadius:10,background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden",flexShrink:0}}>
                  {(idea.thumbnail||idea.photo)?<img src={idea.thumbnail||idea.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"💡"}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{idea.title||"Sans titre"}</div>
                    <div style={{display:"flex",gap:2}}>
                      <button onClick={()=>setEditIdea(idea)} style={s.iconBtn}>✏️</button>
                      <button onClick={()=>deleteDoc(doc(db,"ideas",idea.id))} style={s.iconBtn}>🗑️</button>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Par {idea.createdBy} · {formatTimeAgo(idea.createdAt)}</div>
                  {idea.note&&<div style={{fontSize:13,color:T.textMuted,marginTop:6,lineHeight:1.5}}>{idea.note}</div>}
                  {(idea.links||[]).filter(l=>l.url).map((l,i)=><a key={i} href={l.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.accent,display:"block",marginTop:4}}>🔗 {l.label||l.url}</a>)}
                  {!idea.links&&idea.link&&<a href={idea.link} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.accent,display:"block",marginTop:4}}>🔗 Voir la recette</a>}
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={()=>updateDoc(doc(db,"ideas",idea.id),{tested:!idea.tested})} style={{...s.ghost,fontSize:12,padding:"5px 10px",borderColor:idea.tested?T.green:T.inputBorder,color:idea.tested?T.green:T.textMuted}}>{idea.tested?"✅ Testé":"⏳ À tester"}</button>
                    <button onClick={()=>setShowAddDish({fromIdea:idea})} style={{...s.primary,fontSize:12,padding:"5px 12px"}}>→ Créer ce plat</button>
                  </div>
                </div>
              </div>
            </div>)}
          </div>
        </div>}

        {/* ══ ALÉATOIRE — ROUE ══ */}
        {tab==="random"&&(()=>{
          const wheelDishes=dishes.filter(d=>{
            const avg=avgTaste(d);
            if(randomFilters.category&&!(d.categories||[]).includes(randomFilters.category))return false;
            if(avg>0&&avg<randomFilters.minTaste)return false;
            if((d.timeRating||0)>randomFilters.maxTime&&d.timeRating>0)return false;
            if((d.dishesRating||0)>randomFilters.maxDishes&&d.dishesRating>0)return false;
            return true;
          }).slice(0,8);
          const segCount=wheelDishes.length||1;
          const segAngle=360/segCount;
          const SEG_COLORS=[T.accent,T.green,"#9b7fd4","#e07040","#4aa8b8","#d97706","#e05c6a","#5a9e78"];
          return <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Filtres */}
            <div style={{...s.card}}>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div><label style={s.label}>Catégorie</label><select value={randomFilters.category} onChange={e=>setRandomFilters(f=>({...f,category:e.target.value}))} style={s.input}><option value="">Toutes</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label style={s.label}>★ Goût minimum : {randomFilters.minTaste}/5</label><input type="range" min={1} max={5} value={randomFilters.minTaste} onChange={e=>setRandomFilters(f=>({...f,minTaste:+e.target.value}))} style={{width:"100%",accentColor:T.accent}}/></div>
                <div><label style={s.label}>⏱️ Temps max : {randomFilters.maxTime}/5</label><input type="range" min={1} max={5} value={randomFilters.maxTime} onChange={e=>setRandomFilters(f=>({...f,maxTime:+e.target.value}))} style={{width:"100%",accentColor:T.green}}/></div>
                <div><label style={s.label}>🫧 Vaisselle max : {randomFilters.maxDishes}/5</label><input type="range" min={1} max={5} value={randomFilters.maxDishes} onChange={e=>setRandomFilters(f=>({...f,maxDishes:+e.target.value}))} style={{width:"100%",accentColor:T.teal}}/></div>
              </div>
            </div>
            {wheelDishes.length===0&&<div style={{textAlign:"center",color:T.textLight,fontSize:14,padding:24}}>Aucun plat ne correspond aux filtres 😅</div>}
            {wheelDishes.length>0&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
              {/* Pointeur + Roue */}
              <div style={{position:"relative",display:"flex",justifyContent:"center",width:"100%"}}>
                <div style={{position:"absolute",top:-12,zIndex:10,fontSize:24,color:T.accent,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}}>▼</div>
                <svg width="260" height="260" viewBox="-130 -130 260 260"
                  style={{transform:`rotate(${wheelAngle}deg)`,
                    transition:wheelSpinning?"transform 4s cubic-bezier(0.17,0.67,0.12,1)":"none",
                    filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.18))"}}>
                  {wheelDishes.map((dish,i)=>{
                    const sa=(i*segAngle-90)*Math.PI/180;
                    const ea=((i+1)*segAngle-90)*Math.PI/180;
                    const r=120,x1=r*Math.cos(sa),y1=r*Math.sin(sa),x2=r*Math.cos(ea),y2=r*Math.sin(ea);
                    const large=segAngle>180?1:0;
                    const ma=((i+0.5)*segAngle-90)*Math.PI/180;
                    const tx=72*Math.cos(ma),ty=72*Math.sin(ma);
                    const nm=dish.name.length>9?dish.name.slice(0,8)+"…":dish.name;
                    return <g key={dish.id}>
                      <path d={`M0,0 L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={SEG_COLORS[i%SEG_COLORS.length]} stroke="white" strokeWidth="2.5"/>
                      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                        fontSize={segCount>6?9:11} fontWeight="700" fill="white"
                        transform={`rotate(${(i+0.5)*segAngle},${tx},${ty})`}>{nm}</text>
                    </g>;
                  })}
                  <circle cx="0" cy="0" r="20" fill="white" stroke={T.accent} strokeWidth="3"/>
                  <text x="0" y="6" textAnchor="middle" fontSize="15">🪄</text>
                </svg>
              </div>
              <button onClick={()=>spinWheel(wheelDishes)} disabled={wheelSpinning} className="btn-anim"
                style={{...s.primary,padding:"14px 40px",fontSize:16,fontWeight:800,
                  opacity:wheelSpinning?0.6:1,
                  background:`linear-gradient(135deg,${T.accent},${T.green})`}}>
                {wheelSpinning?"🌀 En train de tourner…":"🎰 Tourner la roue !"}
              </button>
              {wheelResult&&!wheelSpinning&&<div style={{...s.card,width:"100%",border:`2px solid ${T.accent}`}}>
                <div style={{textAlign:"center",fontWeight:800,fontSize:13,color:T.accent,marginBottom:10}}>✨ Ce soir c'est...</div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:56,height:56,borderRadius:12,background:T.accentLight,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                    {(wheelResult.thumbnail||wheelResult.photo)?<img src={wheelResult.thumbnail||wheelResult.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:16,color:T.text}}>{wheelResult.name}</div>
                    <StarRating icon="★" value={Math.round(avgTaste(wheelResult))} max={5} color="#f59e0b" size={14}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={()=>{setWheelResult(null);spinWheel(wheelDishes);}} style={{...s.ghost,flex:1}}>🔄 Retourner</button>
                  <button className="btn-anim" onClick={()=>{setPendingDishForPlan(wheelResult);setPlanSlot("__pick__");setSelectedSlots([]);}} style={{...s.primary,flex:1}}>📅 Planifier</button>
                </div>
              </div>}
            </div>}
          </div>;
        })()}

        {/* ══ STATS ══ */}
        {tab==="stats"&&<div>
          <div style={{fontWeight:800,fontSize:16,color:T.text,marginBottom:16}}>📊 Statistiques</div>
          {/* STREAK */}
          {streakCount>0&&<div style={{...s.card,marginBottom:14,background:"linear-gradient(135deg,#fff7ed,#fef3c7)",border:"1.5px solid #fcd34d"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:38}}>🔥</div>
              <div style={{flex:1}}>
                <div style={{fontSize:20,fontWeight:800,color:"#d97706"}}>{streakCount} semaine{streakCount>1?"s":""} de suite !</div>
                <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Planning complet 🎉</div>
              </div>
            </div>
          </div>}
          {/* BADGES */}
          {(()=>{
            const totalPlanned=computeStats.totalPlanned;
            const ideasTested=ideas.filter(i=>i.tested).length;
            const favCount=dishes.filter(d=>d.favorite).length;
            const BADGES=[
              {id:"cook",icon:"🏅",label:"Cuisinier du mois",desc:"20 repas planifiés",unlocked:totalPlanned>=20},
              {id:"adv",icon:"🌟",label:"Aventurier",desc:"5 idées testées",unlocked:ideasTested>=5},
              {id:"fire",icon:"🔥",label:"En feu",desc:"10 semaines de suite",unlocked:streakCount>=10},
              {id:"gourmet",icon:"⭐",label:"Gourmet",desc:"10 favoris",unlocked:favCount>=10},
              {id:"balance",icon:"🌈",label:"Équilibré",desc:"50 repas planifiés",unlocked:totalPlanned>=50},
              {id:"legend",icon:"💎",label:"Légende",desc:"50 plats enregistrés",unlocked:dishes.length>=50},
            ];
            const unlocked=BADGES.filter(b=>b.unlocked);
            const locked=BADGES.filter(b=>!b.unlocked);
            return <div style={{...s.card,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>🏆 Badges</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[...unlocked,...locked].map(b=><div key={b.id} style={{textAlign:"center",padding:"10px 6px",borderRadius:12,background:b.unlocked?T.accentLight:T.bg,border:`1.5px solid ${b.unlocked?T.accent:T.cardBorder}`,opacity:b.unlocked?1:0.45}}>
                  <div style={{fontSize:26,filter:b.unlocked?"none":"grayscale(1)"}}>{b.icon}</div>
                  <div style={{fontSize:9,fontWeight:700,color:T.text,marginTop:4,lineHeight:1.3}}>{b.label}</div>
                  <div style={{fontSize:8,color:T.textMuted,marginTop:2}}>{b.desc}</div>
                </div>)}
              </div>
            </div>;
          })()}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{label:"Plats enregistrés",value:dishes.length,icon:"🍽️"},{label:"Repas planifiés",value:computeStats.totalPlanned,icon:"📅"},{label:"Idées en attente",value:ideas.filter(i=>!i.tested).length,icon:"💡"},{label:"Favoris",value:dishes.filter(d=>d.favorite).length,icon:"★"}].map(({label,value,icon})=><div key={label} style={{...s.card,background:T.statCard,textAlign:"center",padding:"14px 10px"}}><div style={{fontSize:24,marginBottom:4}}>{icon}</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>{value}</div><div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{label}</div></div>)}
          </div>
          {computeStats.topDishes.length>0&&<div style={{...s.card,marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:12}}>🏆 Plats les plus cuisinés</div>{computeStats.topDishes.map((d,i)=><div key={d.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:24,height:24,borderRadius:6,background:i===0?"#f59e0b":i===1?T.textMuted:"#cd7f32",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div><div style={{width:32,height:32,borderRadius:8,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,overflow:"hidden",flexShrink:0}}>{(d.thumbnail||d.photo)?<img src={d.thumbnail||d.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{d.name}</div><div style={{fontSize:11,color:T.textMuted}}>{computeStats.dishCount[d.id]} fois planifié</div></div><StarRating icon="★" value={Math.round(avgTaste(d))} max={5} color="#f59e0b" size={12}/></div>)}</div>}
          {computeStats.forgottenDishes.length>0&&<div style={{...s.card,marginBottom:12,borderColor:T.warningBorder,background:dark?darkTheme.warningBg:lightTheme.warningBg}}><div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>⏰ Pas cuisiné depuis +3 semaines</div>{computeStats.forgottenDishes.map(d=><div key={d.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{fontSize:18}}>🍽️</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{d.name}</div><div style={{fontSize:11,color:T.textMuted}}>Dernier : {computeStats.lastCooked[d.id]?formatDate({toDate:()=>computeStats.lastCooked[d.id]}):"—"}</div></div><button onClick={()=>{setPendingDishForPlan(d);setPlanSlot("__pick__");setSelectedSlots([]);setTab("plan");}} style={{...s.primary,fontSize:11,padding:"4px 10px"}}>Planifier</button></div>)}</div>}
          {computeStats.neverCooked.length>0&&<div style={{...s.card,marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>🆕 Jamais planifiés</div>{computeStats.neverCooked.map(d=><div key={d.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{fontSize:18}}>🍽️</div><div style={{flex:1,fontSize:13,fontWeight:600,color:T.text}}>{d.name}</div><button onClick={()=>{setPendingDishForPlan(d);setPlanSlot("__pick__");setSelectedSlots([]);setTab("plan");}} style={{...s.primary,fontSize:11,padding:"4px 10px"}}>Planifier</button></div>)}</div>}
          {Object.keys(computeStats.catDist).length>0&&<div style={{...s.card}}><div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>🗂️ Catégories cette semaine</div>{Object.entries(computeStats.catDist).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>{const c=catColor(cat);const pct=Math.round((count/Math.max(...Object.values(computeStats.catDist)))*100);return <div key={cat} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:T.text}}>{cat}</span><span style={{fontSize:11,color:T.textMuted}}>{count} repas</span></div><div style={{height:6,background:T.cardBorder,borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:c.color,borderRadius:3}}/></div></div>;})}
          </div>}
        </div>}

        {/* ══ ACTIVITÉ ══ */}
        {tab==="activity"&&<div>
          <div style={{fontWeight:800,fontSize:16,color:T.text,marginBottom:14}}>📰 Fil d'activité</div>
          {activityFeed.length===0&&<div style={{textAlign:"center",color:T.textLight,padding:"40px 0"}}>Aucune activité pour l'instant</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {activityFeed.map(a=><div key={a.id} style={{...s.card,display:"flex",gap:10,alignItems:"center"}}><Avatar user={a.user} size={34}/><div style={{flex:1}}><div style={{fontSize:13,color:T.text}}><strong style={{color:Object.values(ALLOWED_EMAILS).find(u=>u.displayName===a.user)?.color}}>{a.user}</strong> {a.msg}</div><div style={{fontSize:11,color:T.textLight,marginTop:2}}>{formatTimeAgo(a.ts)}</div></div></div>)}
          </div>
        </div>}

        {/* ══ OUTILS ══ */}
        {tab==="tools"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontWeight:800,fontSize:16,color:T.text,marginBottom:4}}>🔧 Outils & Réglages</div>

          {/* ── THÈMES ── */}
          <div style={{...s.card}}>
            <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:12}}>🎨 Thème couleur</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {Object.entries(PALETTES).map(([key,p])=>(
                <button key={key} onClick={()=>setPalette(key)} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,
                  border:`2px solid ${palette===key?T.accent:T.cardBorder}`,
                  background:palette===key?T.accentLight:T.bg,
                  cursor:"pointer",fontFamily:"inherit",textAlign:"left"
                }}>
                  <div style={{width:36,height:36,borderRadius:10,background:p.headerBg,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>{p.emoji} {p.name}</div>
                  </div>
                  {palette===key&&<div style={{fontSize:16,color:T.accent}}>✓</div>}
                </button>
              ))}
            </div>
            <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:12,background:T.bg,border:`1.5px solid ${T.cardBorder}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>🌙 Mode sombre</div>
                <div style={{fontSize:11,color:T.textMuted}}>Interface sombre</div>
              </div>
              <button onClick={()=>setDark(d=>!d)} style={{
                width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",position:"relative",
                background:dark?"#4f86c6":"#ccd9e6",transition:"background 0.2s"
              }}>
                <div style={{
                  position:"absolute",top:3,left:dark?22:3,width:20,height:20,borderRadius:10,
                  background:"white",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"
                }}/>
              </button>
            </div>
          </div>

          {/* ── MINUTEUR ── */}
          <div style={{...s.card}}>
            <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:12}}>⏱️ Minuteur de cuisson</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:52,fontWeight:800,color:timerSeconds===0?"#e05c6a":T.accent,fontVariantNumeric:"tabular-nums",letterSpacing:2,marginBottom:8}}>
                {timerSeconds===null ? formatTimer(timerInitial) : formatTimer(timerSeconds)}
              </div>
              {timerSeconds!==null&&timerSeconds!==timerInitial&&<div style={{width:"100%",height:8,background:T.cardBorder,borderRadius:4,overflow:"hidden",marginBottom:14}}>
                <div style={{width:`${(timerSeconds/timerInitial)*100}%`,height:"100%",background:`linear-gradient(90deg,${T.accent},${T.green})`,borderRadius:4,transition:"width 1s linear"}}/>
              </div>}
              <div style={{display:"flex",gap:8,marginBottom:12,justifyContent:"center",flexWrap:"wrap"}}>
                {[5,10,15,20,30,45].map(m=>(
                  <button key={m} onClick={()=>startTimer(m)} style={{
                    padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",
                    border:`1.5px solid ${timerInitial===m*60?T.accent:T.inputBorder}`,
                    background:timerInitial===m*60?T.accentLight:"transparent",
                    color:timerInitial===m*60?T.accent:T.textMuted,fontFamily:"inherit"
                  }}>{m}min</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setTimerSeconds(timerInitial);setTimerRunning(false);}} style={{...s.ghost,flex:1,fontSize:18}}>↺</button>
                <button onClick={()=>setTimerRunning(r=>!r)} disabled={timerSeconds===null||timerSeconds===0} className="btn-anim" style={{
                  ...s.primary,flex:2,fontSize:15,
                  opacity:(timerSeconds===null||timerSeconds===0)?0.5:1
                }}>
                  {timerRunning?"⏸ Pause":"▶ Démarrer"}
                </button>
              </div>
              {timerSeconds===0&&<div style={{marginTop:12,padding:"10px",background:"#fbeaea",borderRadius:10,color:"#e05c6a",fontWeight:700,fontSize:13}}>🔔 C'est prêt !</div>}
            </div>
          </div>

          {/* ── COMPATIBILITÉ GOÛTS ── */}
          {(()=>{
            const users=Object.values(ALLOWED_EMAILS).map(u=>u.displayName);
            const commonDishes=dishes.filter(d=>{
              const ratings=users.map(u=>d.tasteByUser?.[u]).filter(v=>v!=null&&v>0);
              return ratings.length>=2;
            });
            if(commonDishes.length<3) return <div style={{...s.card}}>
              <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:6}}>💑 Compatibilité des goûts</div>
              <div style={{fontSize:12,color:T.textMuted}}>Notez au moins 3 plats en commun pour voir votre score de compatibilité !</div>
            </div>;
            const diffs=commonDishes.map(d=>{
              const r=users.map(u=>d.tasteByUser?.[u]||0);
              return {dish:d,diff:Math.abs(r[0]-r[1]),avg:(r[0]+r[1])/2};
            });
            const compat=Math.round(100-((diffs.reduce((a,x)=>a+x.diff,0)/diffs.length)/4)*100);
            const agree=diffs.filter(x=>x.diff<=1).sort((a,b)=>b.avg-a.avg).slice(0,3);
            const disagree=diffs.filter(x=>x.diff>=2).sort((a,b)=>b.diff-a.diff).slice(0,3);
            return <div style={{...s.card}}>
              <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:14}}>💑 Compatibilité des goûts</div>
              <div style={{textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:44,fontWeight:800,background:`linear-gradient(135deg,${T.accent},${T.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{compat}%</div>
                <div style={{fontSize:12,color:T.textMuted}}>{compat>=80?"Vous avez des goûts très proches 💚":compat>=60?"Quelques différences, mais ça se complète 👍":"Vos goûts divergent souvent 🤔"}</div>
                <div style={{width:"100%",height:8,background:T.cardBorder,borderRadius:4,overflow:"hidden",marginTop:8}}>
                  <div style={{width:`${compat}%`,height:"100%",background:`linear-gradient(90deg,${T.accent},${T.green})`,borderRadius:4}}/>
                </div>
                <div style={{fontSize:11,color:T.textLight,marginTop:4}}>Sur {commonDishes.length} plats notés par les deux</div>
              </div>
              {agree.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:800,color:T.green,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>💚 En accord</div>
                {agree.map(({dish})=><div key={dish.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:28,height:28,borderRadius:7,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,overflow:"hidden",flexShrink:0}}>{(dish.thumbnail||dish.photo)?<img src={dish.thumbnail||dish.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}</div>
                  <div style={{fontSize:12,color:T.text,flex:1}}>{dish.name}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{users.map(u=>`${dish.tasteByUser?.[u]||0}`).join(" / ")}</div>
                </div>)}
              </div>}
              {disagree.length>0&&<div>
                <div style={{fontSize:10,fontWeight:800,color:"#e05c6a",textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>🤔 Désaccords</div>
                {disagree.map(({dish})=><div key={dish.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:28,height:28,borderRadius:7,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,overflow:"hidden",flexShrink:0}}>{(dish.thumbnail||dish.photo)?<img src={dish.thumbnail||dish.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}</div>
                  <div style={{fontSize:12,color:T.text,flex:1}}>{dish.name}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{users.map(u=>`${dish.tasteByUser?.[u]||0}`).join(" / ")}</div>
                </div>)}
              </div>}
            </div>;
          })()}
        </div>}
      </div>

      {/* ══ CONFETTIS ══ */}
      {showConfetti&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
        <style>{`
          @keyframes confettiFall{
            0%{transform:translateY(-30px) rotate(0deg) scale(1);opacity:1}
            80%{opacity:1}
            100%{transform:translateY(110vh) rotate(720deg) scale(0.7);opacity:0}
          }
        `}</style>
        {Array.from({length:30}).map((_,i)=>{
          const colors=["#f59e0b","#4f86c6","#6bab8a","#e05c6a","#9b7fd4","#4aa8b8"];
          const color=colors[i%colors.length];
          const left=Math.random()*100;
          const delay=Math.random()*1.5;
          const dur=2+Math.random()*2;
          const size=6+Math.random()*10;
          return <div key={i} style={{
            position:"absolute",top:-20,left:`${left}%`,
            width:size,height:size,
            background:color,
            borderRadius:Math.random()>0.5?"50%":"2px",
            animation:`confettiFall ${dur}s ease ${delay}s both`
          }}/>;
        })}
        <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",
          background:"white",borderRadius:20,padding:"20px 32px",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:44,marginBottom:6}}>🎉</div>
          <div style={{fontSize:18,fontWeight:800,color:"#1e2d3d"}}>Semaine complète !</div>
          {streakCount>1&&<div style={{fontSize:13,color:"#d97706",fontWeight:700,marginTop:6}}>🔥 {streakCount} semaines de suite !</div>}
        </div>
      </div>}

      {/* ══ MODALS ══ */}

      {(showAddDish||editDish)&&<Modal title={editDish?"Modifier le plat":"Nouveau plat"} onClose={()=>{setShowAddDish(false);setEditDish(null);}}>
        <DishForm initial={editDish||(showAddDish?.fromIdea?showAddDish:null)} onSave={form=>saveDish(form,!!editDish)} onCancel={()=>{setShowAddDish(false);setEditDish(null);}}/>
      </Modal>}

      {viewDish&&(()=>{
        const d=dishes.find(x=>x.id===viewDish.id)||viewDish;
        const cats=d.categories||[];
        const links=d.links||[];
        const hasPhoto=!!(d.photo||d.thumbnail);
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(10,20,35,0.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setViewDish(null)}>
            <div style={{background:T.card,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",overscrollBehavior:"contain",WebkitOverflowScrolling:"touch",boxShadow:`0 -20px 60px ${T.shadowMd}`}} onClick={e=>e.stopPropagation()}>
              {/* Photo plein écran bord à bord + fond flouté */}
              <div style={{position:"relative",width:"100%",flexShrink:0,background:hasPhoto?"#111":T.headerBg,overflow:"hidden"}}>
                {/* Fond flouté ambient */}
                {hasPhoto&&<img src={d.photo||d.thumbnail} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"blur(24px) brightness(0.5)",transform:"scale(1.15)",zIndex:0}}/>}
                {hasPhoto
                  ? <img src={d.photo||d.thumbnail} alt="" style={{width:"100%",display:"block",position:"relative",zIndex:1}}/>
                  : <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>🍽️</div>
                }
                {/* Dégradé bas pour lisibilité du titre */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)"}}/>
                {/* Titre + catégories en overlay */}
                <div style={{position:"absolute",bottom:14,left:16,right:48}}>
                  <div style={{fontSize:20,fontWeight:800,color:"white",lineHeight:1.2,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{d.name}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                    {cats.map(cat=>{const c=catColor(cat);return <span key={cat} style={{fontSize:10,fontWeight:700,color:c.color,background:"rgba(255,255,255,0.92)",borderRadius:8,padding:"2px 8px"}}>{cat}</span>;})}
                    {d.favorite&&<span style={{fontSize:10,fontWeight:700,color:"#d97706",background:"rgba(255,255,255,0.92)",borderRadius:8,padding:"2px 8px"}}>★ Favori</span>}
                  </div>
                </div>
                {/* Bouton fermer */}
                <button onClick={()=>setViewDish(null)} style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.4)",border:"none",borderRadius:10,padding:"5px 10px",fontSize:18,color:"white",cursor:"pointer",lineHeight:1,backdropFilter:"blur(4px)"}}>×</button>
              </div>

              {/* Contenu scrollable */}
              <div style={{padding:"18px 18px 28px",display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Notes de goût</div>
                  {Object.values(ALLOWED_EMAILS).map(u=><div key={u.displayName} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><Avatar user={u.displayName} size={24}/><span style={{fontSize:13,color:T.text,width:58,fontWeight:600}}>{u.displayName}</span><StarRating icon="★" value={d.tasteByUser?.[u.displayName]||0} max={5} color="#f59e0b" size={18} onChange={currentUser===u.displayName?v=>updateTaste(d,v):undefined}/><span style={{fontSize:11,color:T.textLight}}>{d.tasteByUser?.[u.displayName]?`${d.tasteByUser[u.displayName]}/5`:"—"}</span></div>)}
                  {Object.keys(d.tasteByUser||{}).length>0&&<div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Moyenne : <strong style={{color:T.text}}>{avgTaste(d).toFixed(1)}/5</strong></div>}
                </div>
                <div style={{display:"flex",gap:20}}>
                  <div><div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Vaisselle</div><StarRating icon="🫧" value={d.dishesRating||0} max={5} color={T.accent} size={16}/></div>
                  <div><div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Temps</div><StarRating icon="⏱️" value={d.timeRating||0} max={5} color={T.green} size={16}/></div>
                </div>
                {d.recipe&&<div><div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Recette</div><div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap",background:T.activityBg,padding:"12px 14px",borderRadius:12}}>{d.recipe}</div></div>}
                {links.filter(l=>l.url).length>0&&<div><div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Liens</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{links.filter(l=>l.url).map((l,i)=><a key={i} href={l.url} target="_blank" rel="noreferrer" style={{fontSize:13,color:T.accent,display:"flex",alignItems:"center",gap:6}}>🔗 {l.label||l.url}</a>)}</div></div>}
                <div style={{fontSize:11,color:T.textLight,display:"flex",alignItems:"center",gap:5}}><Avatar user={d.updatedBy} size={14}/>Modifié par <strong>{d.updatedBy}</strong> · {formatTimeAgo(d.updatedAt)}</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setEditDish(d);setViewDish(null);}} style={{...s.ghost,flex:1}}>✏️ Modifier</button>
                  <button onClick={()=>{setPendingDishForPlan(d);setPlanSlot("__pick__");setSelectedSlots([]);setViewDish(null);}} className="btn-anim" style={{...s.primary,flex:1}}>📅 Planifier</button>
                </div>
                <button onClick={()=>{deleteDish(d.id,d.name);setViewDish(null);}} style={{...s.ghost,width:"100%",color:T.danger,borderColor:T.danger}}>🗑️ Supprimer ce plat</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modale notation rapide (appui long) */}
      {ratingModal&&(()=>{
        const d=dishes.find(x=>x.id===ratingModal.id)||ratingModal;
        const myVal=d.tasteByUser?.[currentUser]||0;
        return <Modal title={`Noter "${d.name}"`} onClose={()=>setRatingModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:20,alignItems:"center",paddingTop:8}}>
            <div style={{width:80,height:80,borderRadius:16,background:T.accentLight,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>
              {(d.thumbnail||d.photo)?<img src={d.thumbnail||d.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
            </div>
            <div style={{fontSize:15,fontWeight:700,color:T.text}}>{d.name}</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>Ta note ({currentUser})</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {Array.from({length:5}).map((_,i)=>(
                  <span key={i} onClick={()=>{updateTaste(d,i+1);setRatingModal(null);}} style={{fontSize:36,cursor:"pointer",opacity:i<myVal?1:0.2,color:"#f59e0b",userSelect:"none",transition:"opacity 0.1s"}}>★</span>
                ))}
              </div>
              {myVal>0&&<div style={{fontSize:13,color:T.textMuted,marginTop:8}}>Ta note actuelle : {myVal}/5</div>}
            </div>
            <button onClick={()=>setRatingModal(null)} style={{...s.ghost,width:"100%"}}>Fermer</button>
          </div>
        </Modal>;
      })()}

      {/* Modale confirmation reset planning */}
      {confirmResetPlan&&<Modal title="Remettre à zéro ?" onClose={()=>setConfirmResetPlan(false)}>
        <div style={{fontSize:14,color:T.textMuted,marginBottom:20,lineHeight:1.6}}>
          Tous les plats planifiés pour la semaine en cours seront supprimés. Cette action ne peut pas être annulée.
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setConfirmResetPlan(false)} style={{...s.ghost,flex:1}}>Annuler</button>
          <button onClick={resetPlanning} style={{...s.danger,flex:1}}>🗑️ Remettre à zéro</button>
        </div>
      </Modal>}

      {planSlot==="__pick__"&&pendingDishForPlan&&<Modal title={`Planifier "${pendingDishForPlan.name}"`} onClose={()=>{setPlanSlot(null);setPendingDishForPlan(null);setSelectedSlots([]);}}>
        <div style={{fontSize:13,color:T.textMuted,marginBottom:4}}>Sélectionnez un ou plusieurs créneaux :</div>
        {selectedSlots.length>0&&<div style={{fontSize:12,color:T.accent,fontWeight:600,marginBottom:10}}>{selectedSlots.length} créneau{selectedSlots.length>1?"x":""} sélectionné{selectedSlots.length>1?"s":""}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:400,overflowY:"auto",marginBottom:14}}>
          {(()=>{const days={};ALL_SLOTS.forEach(slot=>{const p=slot.split(" ");const meal=p.pop();const day=p.join(" ");if(!days[day])days[day]=[];days[day].push({slot,meal});});return Object.entries(days).map(([day,slots])=><div key={day}><div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,padding:"8px 2px 4px"}}>{day}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{slots.map(({slot,meal})=>{const isSel=selectedSlots.includes(slot);const occ=currentWeekPlan[slot];return <button key={slot} onClick={()=>setSelectedSlots(ss=>isSel?ss.filter(x=>x!==slot):[...ss,slot])} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",border:`2px solid ${isSel?T.accent:occ?T.inputBorder:T.cardBorder}`,background:isSel?T.accentLight:T.card,fontFamily:"inherit",textAlign:"left",transition:"all 0.15s",display:"flex",flexDirection:"column",gap:3}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color:isSel?T.accent:T.text}}>{meal==="midi"?"☀️ Midi":"🌙 Soir"}</span><span style={{fontSize:14,color:isSel?T.accent:T.inputBorder}}>{isSel?"✓":"○"}</span></div><span style={{fontSize:10,color:occ?(isSel?T.accentDark:T.textMuted):T.textLight,fontWeight:occ?600:400}}>{occ?`↩ ${occ.name}`:"Libre"}</span></button>;})}
          </div></div>);})()}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setPlanSlot(null);setPendingDishForPlan(null);setSelectedSlots([]);}} style={{...s.ghost,flex:1}}>Annuler</button>
          <button onClick={()=>assignDishToMultipleSlots(pendingDishForPlan,selectedSlots)} disabled={selectedSlots.length===0} style={{...s.primary,flex:2,opacity:selectedSlots.length===0?0.4:1}}>✓ Confirmer {selectedSlots.length>0?`(${selectedSlots.length})`:""}</button>
        </div>
      </Modal>}

      {planSlot&&planSlot!=="__pick__"&&<Modal title={`Choisir pour : ${planSlot}`} onClose={()=>setPlanSlot(null)}>
        <input placeholder="🔍 Rechercher..." style={{...s.input,marginBottom:10}} onChange={e=>setSearchQ(e.target.value)}/>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:400,overflowY:"auto"}}>
          {dishes.filter(d=>!searchQ||d.name.toLowerCase().includes(searchQ.toLowerCase())).map(d=><CompactDishCard key={d.id} dish={d} onSelect={dish=>assignDish(dish,planSlot)}/>)}
        </div>
      </Modal>}

      {(showAddIdea||editIdea)&&<Modal title={editIdea?"Modifier l'idée":"Nouvelle idée"} onClose={()=>{setShowAddIdea(false);setEditIdea(null);}}>
        <IdeaForm initial={editIdea} onSave={form=>saveIdea(form,!!editIdea)} onCancel={()=>{setShowAddIdea(false);setEditIdea(null);}}/>
      </Modal>}

      {addCatModal&&<Modal title="Nouvelle catégorie" onClose={()=>setAddCatModal(false)}>
        <label style={s.label}>Nom</label>
        <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{...s.input,marginBottom:14}} placeholder="Ex: Soupe" onKeyDown={e=>{if(e.key==="Enter"&&newCatName.trim()){addCategory(newCatName.trim());setNewCatName("");setAddCatModal(false);}}}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={()=>setAddCatModal(false)} style={s.ghost}>Annuler</button>
          <button onClick={()=>{if(newCatName.trim()){addCategory(newCatName.trim());setNewCatName("");setAddCatModal(false);}}} style={s.primary}>Ajouter</button>
        </div>
      </Modal>}

      {historyWeek&&<Modal title={`Semaine du ${historyWeek}`} onClose={()=>setHistoryWeek(null)}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {ALL_SLOTS.map(slot=>{const entry=weekPlans[historyWeek]?.[slot];if(!entry)return null;return <div key={slot} style={{...s.card,display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,overflow:"hidden",flexShrink:0}}>{(entry.thumbnail||entry.photo)?<img src={entry.thumbnail||entry.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}</div><div><div style={{fontSize:11,color:T.textMuted}}>{slot}</div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{entry.name}</div></div></div>;})}
          {ALL_SLOTS.every(x=>!weekPlans[historyWeek]?.[x])&&<div style={{textAlign:"center",color:T.textLight,padding:"24px 0"}}>Aucun repas planifié</div>}
        </div>
      </Modal>}

      {/* TOAST */}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1e2d3d",color:"white",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 24px rgba(0,0,0,0.3)",zIndex:2000,maxWidth:340,width:"calc(100% - 32px)"}}>
        <span style={{flex:1,fontSize:13,fontWeight:500}}>{toast.msg}</span>
        {toast.onUndo&&<button onClick={()=>{if(toast.timer)clearTimeout(toast.timer);toast.onUndo();setToast(null);}} style={{background:T.accent,color:"white",border:"none",borderRadius:8,padding:"6px 14px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Annuler</button>}
        <button onClick={()=>{if(toast.timer)clearTimeout(toast.timer);setToast(null);}} style={{background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:20,padding:"0 2px",lineHeight:1}}>×</button>
      </div>}
    </div>
  );
}
