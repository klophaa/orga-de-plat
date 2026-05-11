    const total = ALL_SLOTS.length;
    if (filled === total && filled > 0) {
      // Semaine complète !
      if (streakLastWeek !== currentWeek) {
        const prevWeekDate = new Date();
        prevWeekDate.setDate(prevWeekDate.getDate() - 7);
        const prevWeek = getWeekKey(prevWeekDate);
        const newStreak = streakLastWeek === prevWeek ? streakCount + 1 : 1;
        setStreakCount(newStreak);
        setStreakLastWeek(currentWeek);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
  }, [weekPlans]);

  // ── Timer ──
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const startTimer = (mins) => {
    const secs = mins * 60;
    setTimerInitial(secs);
    setTimerSeconds(secs);
    setTimerRunning(true);
  };
  const formatTimer = (s) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ── Roue aléatoire ──
  const spinWheel = (wheelDishes) => {
    if (wheelSpinning || wheelDishes.length === 0) return;
    setWheelSpinning(true);
    setWheelResult(null);
    const spins = 5 + Math.random() * 5; // 5-10 tours
    const resultIdx = Math.floor(Math.random() * wheelDishes.length);
    const segAngle = 360 / wheelDishes.length;
    // L'angle final pointe sur le résultat (pointeur en haut = 0°)
    const targetAngle = wheelAngle + spins * 360 + (360 - resultIdx * segAngle - segAngle / 2);
    setWheelAngle(targetAngle);
    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(wheelDishes[resultIdx]);
    }, 4000);
  };

  // ── Android back button ──
  useEffect(() => {
    const handleBack = e => {
      // Check if any modal is open
      const anyModal = showAddDish||editDish||viewDish||showAddIdea||editIdea||
        planSlot||historyWeek||addCatModal||ratingModal||confirmResetPlan||
        elodieShowAddDish||elodieViewDish||elodieEditDish||elodiePlanSlot||elodieHistoryWeek||elodieConfirmReset;
      if (anyModal) {
        e.preventDefault();
        // Close topmost modal
        if (confirmResetPlan) { setConfirmResetPlan(false); return; }
        if (elodieConfirmReset) { setElodieConfirmReset(false); return; }
        if (elodieHistoryWeek) { setElodieHistoryWeek(null); return; }
        if (elodiePlanSlot) { setElodiePlanSlot(null); setElodiePendingDish(null); return; }
        if (elodieViewDish) { setElodieViewDish(null); return; }
        if (elodieEditDish) { setElodieEditDish(null); return; }
        if (elodieShowAddDish) { setElodieShowAddDish(false); return; }
        if (ratingModal) { setRatingModal(null); return; }
        if (addCatModal) { setAddCatModal(false); return; }
        if (historyWeek) { setHistoryWeek(null); return; }
        if (planSlot) { setPlanSlot(null); setPendingDishForPlan(null); setSelectedSlots([]); return; }
        if (editIdea) { setEditIdea(null); return; }
        if (showAddIdea) { setShowAddIdea(false); return; }
        if (viewDish) { setViewDish(null); return; }
        if (editDish) { setEditDish(null); return; }
        if (showAddDish) { setShowAddDish(false); return; }
      } else {
        // No modal open — double tap to exit
        const now = Date.now();
        if (now - lastBackPress.current < 2000) {
          // Allow natural back (exit)
          return;
        }
        e.preventDefault();
        lastBackPress.current = now;
        showToastMsg("Appuie à nouveau sur Retour pour quitter");
      }
    };
    window.addEventListener("popstate", handleBack);
    // Push a dummy state so popstate fires on back press
    window.history.pushState(null, "", window.location.href);
    return () => window.removeEventListener("popstate", handleBack);
  }, [showAddDish,editDish,viewDish,showAddIdea,editIdea,planSlot,historyWeek,addCatModal,ratingModal,confirmResetPlan]);

  const prevAuthUser = useRef(null);
  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      if (user && ALLOWED_EMAILS[user.email]) {
        const wasLoggedOut = !prevAuthUser.current;
        prevAuthUser.current = user;
        setAuthUser(user);
        if (wasLoggedOut) {
          const uInfo = ALLOWED_EMAILS[user.email];
          const now = new Date();
          const timeStr = now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
          const dateStr = now.toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
          addDoc(collection(db,"activity"),{
            user: uInfo.displayName,
            msg: `s'est connecté(e) à ${timeStr} le ${dateStr}`,
            ts: serverTimestamp(),
            type: "login"
          }).catch(()=>{});
        }
      } else {
        prevAuthUser.current = null;
        setAuthUser(null);
        if (user) signOut(auth);
      }
    });
  }, []);

  useEffect(() => {
    if (!authUser) { setDataLoading(false); return; }
    setDataLoading(dishes.length === 0);
    const u = [];
    u.push(onSnapshot(collection(db,"dishes"), s=>{ const data=s.docs.map(d=>({id:d.id,...d.data()})); setDishes(data); try{localStorage.setItem("cache_dishes",JSON.stringify(data));}catch{}; setDataLoading(false); }));
    u.push(onSnapshot(collection(db,"ideas"), s=>{ const data=s.docs.map(d=>({id:d.id,...d.data()})); setIdeas(data); try{localStorage.setItem("cache_ideas",JSON.stringify(data));}catch{}; }));
    u.push(onSnapshot(doc(db,"config","categories"), s=>{ if(s.exists()) setCategories(s.data().list||DEFAULT_CATEGORIES); }));
    u.push(onSnapshot(collection(db,"weekPlans"), s=>{ const p={}; s.docs.forEach(d=>{p[d.id]=d.data();}); setWeekPlans(p); try{localStorage.setItem("cache_weekPlans",JSON.stringify(p));}catch{}; }));
    u.push(onSnapshot(query(collection(db,"activity"),orderBy("ts","desc"),limit(50)), s=>setActivityFeed(s.docs.map(d=>({id:d.id,...d.data()})))));
    // Collections privées Élodie
    u.push(onSnapshot(collection(db,"elodieDishes"), s=>setElodieDishes(s.docs.map(d=>({id:d.id,...d.data()})))));
    u.push(onSnapshot(collection(db,"elodieWeekPlans"), s=>{ const p={}; s.docs.forEach(d=>{p[d.id]=d.data();}); setElodieWeekPlans(p); }));
    return () => u.forEach(f=>f());
  }, [authUser]);

  const currentUser = authUser ? ALLOWED_EMAILS[authUser.email]?.displayName : null;
  const currentWeekKey = getWeekKey();
  const currentWeekPlan = weekPlans[currentWeekKey] || makeEmptyWeek();
  const nextWeekDate = new Date(); nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekKey = getWeekKey(nextWeekDate);
  const nextWeekPlan = weekPlans[nextWeekKey] || makeEmptyWeek();

  const handleLogin = async () => {
    setLoginLoading(true); setLoginErr("");
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPass); }
    catch { setLoginErr("Email ou mot de passe incorrect."); }
    setLoginLoading(false);
  };

  const logActivity = useCallback(async msg => {
    if (!currentUser) return;
    try { await addDoc(collection(db,"activity"),{user:currentUser,msg,ts:serverTimestamp()}); } catch {}
  }, [currentUser]);

  const setCurrentWeekPlan = useCallback(async plan => {
    await setDoc(doc(db,"weekPlans",currentWeekKey), plan);
  }, [currentWeekKey]);

  const setNextWeekPlan = useCallback(async plan => {
    await setDoc(doc(db,"weekPlans",nextWeekKey), plan);
  }, [nextWeekKey]);

  // Simple toast (no undo)
  const showToastMsg = useCallback((msg) => {
    setToast(prev=>{if(prev?.timer)clearTimeout(prev.timer);return null;});
    const timer = setTimeout(()=>setToast(null), 3000);
    setToast({msg, timer, onUndo:null});
  }, []);

  // Toast with undo
  const showToast = useCallback((msg, onUndo) => {
    setToast(prev=>{if(prev?.timer)clearTimeout(prev.timer);return null;});
    const timer = setTimeout(()=>setToast(null), 6000);
    setToast({msg, onUndo, timer});
  }, []);

  const avgTaste = d => { const v=Object.values(d.tasteByUser||{}).filter(Boolean); return v.length?v.reduce((a,b)=>a+b,0)/v.length:0; };

  const filteredDishes = useMemo(() => {
    let list = dishes.filter(d => {
      if (searchQ && !d.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (filterCat && !(d.categories||[]).includes(filterCat)) return false;
      if (filterFavOnly && !d.favorite) return false;
      if (filterDishes > 0 && (d.dishesRating||0) > filterDishes) return false;
      if (filterTime > 0 && (d.timeRating||0) > filterTime) return false;
      return true;
    });
    // Tri récents toujours appliqué en base
    list = [...list].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    if (sortBy === "dishes") list = [...list].sort((a,b) => (a.dishesRating||0) - (b.dishesRating||0));
    else if (sortBy === "time") list = [...list].sort((a,b) => (a.timeRating||0) - (b.timeRating||0));
    return list;
  }, [dishes, searchQ, filterCat, filterFavOnly, filterDishes, filterTime, sortBy]);

  const saveDish = async (form, isEdit) => {
    const payload = {...form, updatedBy:currentUser, updatedAt:serverTimestamp()};
    if (isEdit) { await updateDoc(doc(db,"dishes",form.id),payload); logActivity(`a modifié "${form.name}"`); }
    else { delete payload.id; payload.createdBy=currentUser; payload.createdAt=serverTimestamp(); await addDoc(collection(db,"dishes"),payload); logActivity(`a ajouté "${form.name}"`); }
    setShowAddDish(false); setEditDish(null);
  };

  const deleteDish = async (id, name) => {
    const snap = dishes.find(d=>d.id===id);
    if (!snap) return;
    await deleteDoc(doc(db,"dishes",id));
    Object.keys(weekPlans).forEach(wk=>{ const plan={...weekPlans[wk]}; let ch=false; Object.keys(plan).forEach(slot=>{if(plan[slot]?.id===id){plan[slot]=null;ch=true;}}); if(ch)setDoc(doc(db,"weekPlans",wk),plan); });
    logActivity(`a supprimé "${name}"`);
    showToast(`"${name}" supprimé`, async()=>{ const{id:_id,...data}=snap; await addDoc(collection(db,"dishes"),{...data,updatedBy:currentUser,updatedAt:serverTimestamp()}); logActivity(`a restauré "${name}"`); });
  };

  const toggleFav = async dish => { await updateDoc(doc(db,"dishes",dish.id),{favorite:!dish.favorite,updatedBy:currentUser,updatedAt:serverTimestamp()}); };

  const updateTaste = async (dish, value) => {
    const tasteByUser={...(dish.tasteByUser||{}),[currentUser]:value};
    await updateDoc(doc(db,"dishes",dish.id),{tasteByUser,updatedBy:currentUser,updatedAt:serverTimestamp()});
    if(viewDish?.id===dish.id) setViewDish(d=>({...d,tasteByUser}));
  };

  // ── Export / Restauration ──────────────────────────────────────
  const exportData = async () => {
    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser,
        dishes: dishes,
        weekPlans: weekPlans,
        ideas: ideas,
        elodieDishes: elodieDishes,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0,10);
      a.href = url; a.download = `orga-de-plat-backup-${date}.json`;
      a.click(); URL.revokeObjectURL(url);
    } catch(e) { alert("Erreur export : "+e.message); }
  };
