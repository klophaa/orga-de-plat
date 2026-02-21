// ─────────────────────────────────────────────────────────────────────────────
// ORGA DE PLAT — v4
// Firebase Auth + Firestore + PWA + Stats + Suggestions + Mode sombre
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, addDoc,
  serverTimestamp, query, orderBy, limit, getDoc
} from "firebase/firestore";

// ─── FIREBASE CONFIG — remplace avec tes propres valeurs ─────────────────────
// (voir guide de déploiement)
const firebaseConfig = {
  apiKey: "AIzaSyAEkCPxcQERPI3m8o5XBz3TjyYOlOjlbK4",
  authDomain: "orga-de-plat.firebaseapp.com",
  projectId: "orga-de-plat",
  storageBucket: "orga-de-plat.firebasestorage.app",
  messagingSenderId: "569810560696",
  appId: "1:569810560696:web:de7818a6d5293b0aa2764d"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

// ─── UTILISATEURS AUTORISÉS ──────────────────────────────────────────────────
// Les comptes sont créés dans Firebase Authentication (email/password).
// Seuls ces deux emails ont accès à l'app.
const ALLOWED_EMAILS = {
  "theo@orgadeplat.fr":   { displayName: "Théo",   avatar: "🧑‍🍳", color: "#4f86c6" },
  "elodie@orgadeplat.fr": { displayName: "Elodie", avatar: "👩‍🍳", color: "#6bab8a" },
};

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = ["Fat","Pas trop fat","Diet","Asiat","Finger food","Deux portions"];
const WEEKDAY_SLOTS = ["Lundi midi","Lundi soir","Mardi midi","Mardi soir","Mercredi midi","Mercredi soir","Jeudi midi","Jeudi soir","Vendredi midi"];
const WEEKEND_SLOTS = ["Vendredi soir","Samedi midi","Samedi soir","Dimanche midi","Dimanche soir"];
const ALL_SLOTS     = [...WEEKDAY_SLOTS, ...WEEKEND_SLOTS];

// ─── UTILS ───────────────────────────────────────────────────────────────────
function getWeekKey(date = new Date()) {
  const d = new Date(date); d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().slice(0,10);
}
function formatTimeAgo(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff  = Date.now() - date.getTime();
  if (diff < 60000)    return "à l'instant";
  if (diff < 3600000)  return `il y a ${Math.floor(diff/60000)}min`;
  if (diff < 86400000) return `il y a ${Math.floor(diff/3600000)}h`;
  return `il y a ${Math.floor(diff/86400000)}j`;
}
function formatDate(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
}
const makeEmptyWeek = () => { const p = {}; ALL_SLOTS.forEach(s => { p[s] = null; }); return p; };
const load = (k,d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── THÈMES ──────────────────────────────────────────────────────────────────
const lightTheme = {
  bg:"#f0f4f8", card:"#ffffff", cardBorder:"#dde5ee",
  text:"#1e2d3d", textMuted:"#5a7a94", textLight:"#94afc4",
  accent:"#4f86c6", accentLight:"#e8f1fb", accentDark:"#3a6fa8",
  green:"#6bab8a", greenLight:"#e8f5ee",
  teal:"#4a9ba8", tealLight:"#e4f4f7",
  weekdayBg:"#eef4fb", weekdayBorder:"#b8d4ef", weekdayHeader:"#4f86c6",
  weekendBg:"#eef7f1", weekendBorder:"#b8ddc9", weekendHeader:"#6bab8a",
  input:"#f7fafc", inputBorder:"#ccd9e6",
  shadow:"rgba(79,134,198,0.08)", shadowMd:"rgba(30,45,61,0.15)",
  danger:"#e05c6a",
  tagColors:[
    {bg:"#e8f1fb",color:"#3a6fa8"},{bg:"#e8f5ee",color:"#4a8a68"},
    {bg:"#e4f4f7",color:"#2e7a86"},{bg:"#f0eefc",color:"#6257b5"},
    {bg:"#fdf0e8",color:"#b0602a"},{bg:"#fbeaea",color:"#a83a3a"},
  ],
  navBg:"#ffffff", headerBg:"linear-gradient(135deg,#4f86c6 0%,#6bab8a 100%)",
  activityBg:"#f4f8fc", segBg:"#e8f0f8",
  statCard:"#eef4fb", warningBg:"#fffbeb", warningBorder:"#fcd34d",
};
const darkTheme = {
  bg:"#0e1621", card:"#162030", cardBorder:"#1e3045",
  text:"#d4e4f4", textMuted:"#6a90b0", textLight:"#3d5f78",
  accent:"#5b9ad6", accentLight:"#112035", accentDark:"#4a80bb",
  green:"#5a9e78", greenLight:"#0f2318",
  teal:"#3d8e9a", tealLight:"#0d2028",
  weekdayBg:"#101e30", weekdayBorder:"#1e3a5a", weekdayHeader:"#3a6fa8",
  weekendBg:"#0f1e16", weekendBorder:"#1a3828", weekendHeader:"#4a8a68",
  input:"#162030", inputBorder:"#1e3045",
  shadow:"rgba(0,0,0,0.3)", shadowMd:"rgba(0,0,0,0.5)",
  danger:"#e05c6a",
  tagColors:[
    {bg:"#112035",color:"#5b9ad6"},{bg:"#0f2318",color:"#5a9e78"},
    {bg:"#0d2028",color:"#3d8e9a"},{bg:"#1a1535",color:"#8a7fd4"},
    {bg:"#251408",color:"#c07040"},{bg:"#25080a",color:"#d06070"},
  ],
  navBg:"#162030", headerBg:"linear-gradient(135deg,#2a4f7a 0%,#2d6b4a 100%)",
  activityBg:"#101e2c", segBg:"#1a2e40",
  statCard:"#0d1e30", warningBg:"#1a1500", warningBorder:"#7a5800",
};

// ─── MICRO-COMPOSANTS ─────────────────────────────────────────────────────────
function StarRating({ icon, value, max=5, onChange, color, size=18 }) {
  return (
    <div style={{display:"flex",gap:3}}>
      {Array.from({length:max}).map((_,i) => (
        <span key={i} onClick={() => onChange?.(i+1)}
          style={{fontSize:size,cursor:onChange?"pointer":"default",opacity:i<value?1:0.15,color,userSelect:"none"}}>
          {icon}
        </span>
      ))}
    </div>
  );
}

function Avatar({user, size=28}) {
  const u = Object.values(ALLOWED_EMAILS).find(x => x.displayName === user);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:u?.color||"#8ab",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.52,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>
      {u?.avatar||"?"}
    </div>
  );
}

function Spinner({T}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg}}>
      <div style={{width:40,height:40,border:`3px solid ${T.accentLight}`,borderTop:`3px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]             = useState(() => load("dark", false));
  const T = dark ? darkTheme : lightTheme;

  // Auth state
  const [authUser, setAuthUser]     = useState(undefined); // undefined=loading
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [loginErr, setLoginErr]     = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Firestore data
  const [dishes, setDishes]         = useState([]);
  const [ideas, setIdeas]           = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [weekPlans, setWeekPlans]   = useState({});
  const [activityFeed, setActivityFeed] = useState([]);
  const [dataLoading, setDataLoading]   = useState(true);

  // UI
  const [tab, setTab]               = useState("dishes");
  const [showAddDish, setShowAddDish]   = useState(false);
  const [editDish, setEditDish]         = useState(null);
  const [viewDish, setViewDish]         = useState(null);
  const [showAddIdea, setShowAddIdea]   = useState(false);
  const [editIdea, setEditIdea]         = useState(null);
  const [planSlot, setPlanSlot]         = useState(null);
  const [pendingDishForPlan, setPendingDishForPlan] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [randomResult, setRandomResult] = useState(undefined);
  const [randomFilters, setRandomFilters] = useState({category:"",minTaste:1,maxTime:5,maxDishes:5});
  const [searchQ, setSearchQ]       = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [filterMinTaste, setFilterMinTaste] = useState(0);
  const [filterFavOnly, setFilterFavOnly]   = useState(false);
  const [historyWeek, setHistoryWeek]   = useState(null);
  const [addCatModal, setAddCatModal]   = useState(false);
  const [newCatName, setNewCatName]     = useState("");
  const [dragItem, setDragItem]         = useState(null);
  const [planView, setPlanView]         = useState("weekday");
  const [statsWeek, setStatsWeek]       = useState(null);

  useEffect(() => { save("dark", dark); }, [dark]);

  // ── Firebase Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user && ALLOWED_EMAILS[user.email]) setAuthUser(user);
      else { setAuthUser(null); if (user) signOut(auth); }
    });
    return unsub;
  }, []);

  // ── Firestore real-time listeners ──
  useEffect(() => {
    if (!authUser) { setDataLoading(false); return; }
    setDataLoading(true);
    const unsubs = [];

    unsubs.push(onSnapshot(collection(db,"dishes"), snap => {
      setDishes(snap.docs.map(d => ({id:d.id,...d.data()})));
    }));
    unsubs.push(onSnapshot(collection(db,"ideas"), snap => {
      setIdeas(snap.docs.map(d => ({id:d.id,...d.data()})));
    }));
    unsubs.push(onSnapshot(doc(db,"config","categories"), snap => {
      if (snap.exists()) setCategories(snap.data().list || DEFAULT_CATEGORIES);
    }));
    unsubs.push(onSnapshot(collection(db,"weekPlans"), snap => {
      const plans = {};
      snap.docs.forEach(d => { plans[d.id] = d.data(); });
      setWeekPlans(plans);
      setDataLoading(false);
    }));
    unsubs.push(onSnapshot(
      query(collection(db,"activity"), orderBy("ts","desc"), limit(50)),
      snap => setActivityFeed(snap.docs.map(d => ({id:d.id,...d.data()})))
    ));

    return () => unsubs.forEach(u => u());
  }, [authUser]);

  const currentUser       = authUser ? ALLOWED_EMAILS[authUser.email]?.displayName : null;
  const currentWeekKey    = getWeekKey();
  const currentWeekPlan   = weekPlans[currentWeekKey] || makeEmptyWeek();

  // ── Auth ──
  const handleLogin = async () => {
    setLoginLoading(true); setLoginErr("");
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch {
      setLoginErr("Email ou mot de passe incorrect.");
    }
    setLoginLoading(false);
  };
  const handleLogout = () => signOut(auth);

  // ── Activity logger ──
  const logActivity = useCallback(async (msg) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db,"activity"), { user: currentUser, msg, ts: serverTimestamp() });
    } catch {}
  }, [currentUser]);

  // ── Week plan helper ──
  const setCurrentWeekPlan = useCallback(async (plan) => {
    await setDoc(doc(db,"weekPlans",currentWeekKey), plan);
  }, [currentWeekKey]);

  // ── Dishes ──
  const avgTaste = d => {
    const v = Object.values(d.tasteByUser||{}).filter(Boolean);
    return v.length ? v.reduce((a,b)=>a+b,0)/v.length : 0;
  };

  const filteredDishes = useMemo(() => dishes.filter(d => {
    if (searchQ && !d.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (filterCat && !(d.categories||[]).includes(filterCat)) return false;
    if (filterFavOnly && !d.favorite) return false;
    if (filterMinTaste > 0 && avgTaste(d) < filterMinTaste) return false;
    return true;
  }), [dishes, searchQ, filterCat, filterFavOnly, filterMinTaste]);

  const saveDish = async (form, isEdit) => {
    const payload = { ...form, updatedBy: currentUser, updatedAt: serverTimestamp() };
    if (isEdit) {
      await updateDoc(doc(db,"dishes",form.id), payload);
      logActivity(`a modifié "${form.name}"`);
    } else {
      delete payload.id;
      payload.createdBy  = currentUser;
      payload.createdAt  = serverTimestamp();
      await addDoc(collection(db,"dishes"), payload);
      logActivity(`a ajouté "${form.name}"`);
    }
    setShowAddDish(false); setEditDish(null);
  };

  const deleteDish = async (id, name) => {
    await deleteDoc(doc(db,"dishes",id));
    // remove from all week plans
    const plans = { ...weekPlans };
    Object.keys(plans).forEach(wk => {
      let changed = false;
      const plan = { ...plans[wk] };
      Object.keys(plan).forEach(slot => { if (plan[slot]?.id === id) { plan[slot] = null; changed = true; } });
      if (changed) { plans[wk] = plan; setDoc(doc(db,"weekPlans",wk), plan); }
    });
    logActivity(`a supprimé "${name}"`);
  };

  const toggleFav = async (dish) => {
    await updateDoc(doc(db,"dishes",dish.id), { favorite: !dish.favorite, updatedBy: currentUser, updatedAt: serverTimestamp() });
  };

  const updateTaste = async (dish, value) => {
    const tasteByUser = { ...(dish.tasteByUser||{}), [currentUser]: value };
    await updateDoc(doc(db,"dishes",dish.id), { tasteByUser, updatedBy: currentUser, updatedAt: serverTimestamp() });
    if (viewDish?.id === dish.id) setViewDish(d => ({...d, tasteByUser}));
  };

  // ── Planning ──
  const assignDish = async (dish, slot) => {
    const plan = { ...currentWeekPlan, [slot]: { id: dish.id, name: dish.name, photo: dish.photo||null } };
    await setCurrentWeekPlan(plan);
    logActivity(`a planifié "${dish.name}" (${slot})`);
    setPlanSlot(null); setPendingDishForPlan(null);
  };

  const assignDishToMultipleSlots = async (dish, slots) => {
    if (!slots.length) return;
    const plan = { ...currentWeekPlan };
    slots.forEach(slot => { plan[slot] = { id: dish.id, name: dish.name, photo: dish.photo||null }; });
    await setCurrentWeekPlan(plan);
    logActivity(`a planifié "${dish.name}" sur ${slots.length} créneau${slots.length>1?"x":""}`);
    setPlanSlot(null); setPendingDishForPlan(null); setSelectedSlots([]);
  };

  const removeFromPlan = async (slot) => {
    const plan = { ...currentWeekPlan, [slot]: null };
    await setCurrentWeekPlan(plan);
  };

  const handleDrop = async (targetSlot) => {
    if (!dragItem) return;
    const plan = { ...currentWeekPlan };
    plan[targetSlot]       = dragItem.dish;
    plan[dragItem.slot]    = currentWeekPlan[targetSlot] || null;
    await setCurrentWeekPlan(plan);
    logActivity(`a déplacé "${dragItem.dish?.name}" → ${targetSlot}`);
    setDragItem(null);
  };

  // ── Ideas ──
  const saveIdea = async (form, isEdit) => {
    if (isEdit) {
      await updateDoc(doc(db,"ideas",form.id), { ...form, updatedAt: serverTimestamp() });
    } else {
      const { id: _id, ...rest } = form;
      await addDoc(collection(db,"ideas"), { ...rest, createdBy: currentUser, createdAt: serverTimestamp() });
      logActivity(`a ajouté l'idée "${form.title}"`);
    }
    setShowAddIdea(false); setEditIdea(null);
  };

  const toggleIdeaTested = async (idea) => {
    await updateDoc(doc(db,"ideas",idea.id), { tested: !idea.tested });
  };

  // ── Categories ──
  const addCategory = async (name) => {
    const newList = [...categories, name];
    await setDoc(doc(db,"config","categories"), { list: newList });
    setCategories(newList);
  };

  // ── Random ──
  const drawRandom = () => {
    const pool = dishes.filter(d =>
      (!randomFilters.category || (d.categories||[]).includes(randomFilters.category)) &&
      avgTaste(d) >= randomFilters.minTaste &&
      d.timeRating <= randomFilters.maxTime &&
      d.dishesRating <= randomFilters.maxDishes
    );
    setRandomResult(pool.length ? pool[Math.floor(Math.random()*pool.length)] : null);
  };

  // ── Stats ──
  const computeStats = useMemo(() => {
    const weekKeys = Object.keys(weekPlans).sort((a,b) => b.localeCompare(a));
    const dishCount = {}; // dishId -> count
    const totalPlanned = { total: 0 };
    weekKeys.forEach(wk => {
      Object.values(weekPlans[wk]||{}).forEach(entry => {
        if (!entry?.id) return;
        dishCount[entry.id] = (dishCount[entry.id]||0) + 1;
        totalPlanned.total++;
      });
    });

    const topDishes = dishes
      .filter(d => dishCount[d.id])
      .sort((a,b) => (dishCount[b.id]||0) - (dishCount[a.id]||0))
      .slice(0,5);

    // Days since last cooked per dish
    const lastCooked = {};
    weekKeys.forEach(wk => {
      const weekDate = new Date(wk);
      Object.values(weekPlans[wk]||{}).forEach(entry => {
        if (!entry?.id || lastCooked[entry.id]) return;
        lastCooked[entry.id] = weekDate;
      });
    });

    const forgottenDishes = dishes
      .filter(d => {
        if (!lastCooked[d.id]) return false;
        const days = (Date.now() - lastCooked[d.id].getTime()) / 86400000;
        return days >= 21;
      })
      .sort((a,b) => lastCooked[a.id] - lastCooked[b.id])
      .slice(0,3);

    const neverCooked = dishes.filter(d => !lastCooked[d.id]).slice(0,3);

    // Category distribution this week
    const thisWeekDishes = Object.values(currentWeekPlan||{})
      .filter(Boolean)
      .map(e => dishes.find(d => d.id === e.id))
      .filter(Boolean);
    const catDist = {};
    thisWeekDishes.forEach(d => (d.categories||[]).forEach(c => { catDist[c] = (catDist[c]||0)+1; }));

    // Missing slots this week
    const missingSlots = ALL_SLOTS.filter(s => !currentWeekPlan?.[s]);

    return { topDishes, forgottenDishes, neverCooked, catDist, missingSlots, totalPlanned: totalPlanned.total, dishCount, lastCooked };
  }, [dishes, weekPlans, currentWeekPlan]);

  const pastWeeks = Object.keys(weekPlans).filter(k => k !== currentWeekKey).sort((a,b) => b.localeCompare(a)).slice(0,10);
  const catColor  = cat => { const idx = categories.indexOf(cat) % T.tagColors.length; return T.tagColors[Math.max(0,idx)]; };

  // ── Styles ──
  const s = {
    app:     { fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:T.bg, minHeight:"100vh", maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column", color:T.text },
    card:    { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:14, padding:"14px 16px", boxShadow:`0 2px 12px ${T.shadow}` },
    input:   { width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${T.inputBorder}`, fontSize:14, background:T.input, color:T.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" },
    label:   { display:"block", fontSize:11, fontWeight:700, color:T.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:0.6 },
    primary: { background:T.accent, color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
    green:   { background:T.green, color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
    ghost:   { background:"transparent", color:T.textMuted, border:`1.5px solid ${T.inputBorder}`, borderRadius:10, padding:"10px 18px", fontWeight:500, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
    iconBtn: { background:"transparent", border:"none", cursor:"pointer", fontSize:15, padding:"4px 6px", borderRadius:6, color:T.textMuted, lineHeight:1 },
  };

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (authUser === undefined) return <Spinner T={T} />;

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  if (!authUser) return (
    <div style={{...s.app, alignItems:"center", justifyContent:"center"}}>
      <div style={{width:"100%", maxWidth:320, padding:24}}>
        <div style={{textAlign:"center", marginBottom:36}}>
          <div style={{fontSize:56, marginBottom:8}}>🥗</div>
          <div style={{fontSize:26, fontWeight:800, color:T.text, letterSpacing:-0.5}}>Orga de plat</div>
          <div style={{color:T.textMuted, fontSize:13, marginTop:4}}>Connexion sécurisée</div>
        </div>
        <div style={{...s.card, padding:24}}>
          <label style={s.label}>Email</label>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
            style={{...s.input, marginBottom:12}} placeholder="prenom@orgadeplat.fr" />
          <label style={s.label}>Mot de passe</label>
          <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleLogin()}
            style={{...s.input, marginBottom:12}} placeholder="••••••••" />
          {loginErr && <div style={{color:T.danger, fontSize:13, marginBottom:10}}>{loginErr}</div>}
          <button onClick={handleLogin} disabled={loginLoading} style={{...s.primary, width:"100%", opacity:loginLoading?0.7:1}}>
            {loginLoading ? "Connexion..." : "Se connecter"}
          </button>
          <div style={{fontSize:11, color:T.textLight, marginTop:14, textAlign:"center", lineHeight:1.6}}>
            Accès réservé à Théo et Elodie.<br/>Les mots de passe sont gérés par Firebase Auth.
          </div>
        </div>
      </div>
    </div>
  );

  if (dataLoading) return <Spinner T={T} />;

  // ─── ONGLETS ───────────────────────────────────────────────────────────────
  const TABS = [
    {id:"dishes",  icon:"🥘", label:"Plats"},
    {id:"plan",    icon:"📅", label:"Planning"},
    {id:"ideas",   icon:"💡", label:"Idées"},
    {id:"random",  icon:"🎲", label:"Aléatoire"},
    {id:"stats",   icon:"📊", label:"Stats"},
    {id:"activity",icon:"📰", label:"Activité"},
  ];

  // ─── CATEGORY PILLS ────────────────────────────────────────────────────────
  const CategoryPills = ({selected=[], onChange}) => (
    <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
      {categories.map(cat => {
        const active = selected.includes(cat);
        const c = catColor(cat);
        return (
          <button key={cat} onClick={() => onChange(active ? selected.filter(x=>x!==cat) : [...selected,cat])} style={{
            padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
            border:`1.5px solid ${active ? c.color : T.inputBorder}`,
            background: active ? c.bg : "transparent", color: active ? c.color : T.textMuted,
            fontFamily:"inherit", transition:"all 0.15s"
          }}>{cat}</button>
        );
      })}
      <button onClick={() => setAddCatModal(true)} style={{
        padding:"5px 10px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
        border:`1.5px dashed ${T.inputBorder}`, background:"transparent", color:T.textLight, fontFamily:"inherit"
      }}>+ Nouvelle</button>
    </div>
  );

  // ─── DISH CARD ─────────────────────────────────────────────────────────────
  const DishCard = ({dish, compact, onSelect}) => {
    const myTaste = dish.tasteByUser?.[currentUser] || 0;
    const avg     = avgTaste(dish);
    const cats    = dish.categories || [];
    return (
      <div onClick={onSelect ? () => onSelect(dish) : () => setViewDish(dish)} style={{
        ...s.card, display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer",
        borderColor: dish.favorite ? T.accent : T.cardBorder,
      }}>
        <div style={{width:compact?44:58, height:compact?44:58, borderRadius:12, background:T.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:compact?20:26, flexShrink:0, overflow:"hidden"}}>
          {dish.photo ? <img src={dish.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "🍽️"}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700, fontSize:compact?13:15, color:T.text, display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                {dish.name}
                {dish.favorite && <span style={{color:"#f59e0b", fontSize:13}}>★</span>}
              </div>
              {!compact && cats.length > 0 && (
                <div style={{display:"flex", flexWrap:"wrap", gap:4, marginBottom:6}}>
                  {cats.map(cat => { const c=catColor(cat); return <span key={cat} style={{fontSize:10, fontWeight:700, color:c.color, background:c.bg, borderRadius:10, padding:"2px 8px"}}>{cat}</span>; })}
                </div>
              )}
            </div>
            {!compact && (
              <div style={{display:"flex", gap:2, flexShrink:0}}>
                <button onClick={e=>{e.stopPropagation(); toggleFav(dish);}} style={{...s.iconBtn, color:dish.favorite?"#f59e0b":T.textLight, fontSize:17}}>{dish.favorite?"★":"☆"}</button>
                <button onClick={e=>{e.stopPropagation(); setEditDish(dish);}} style={s.iconBtn}>✏️</button>
                <button onClick={e=>{e.stopPropagation(); deleteDish(dish.id, dish.name);}} style={s.iconBtn}>🗑️</button>
              </div>
            )}
          </div>
          {!compact && (
            <>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                <StarRating icon="★" value={myTaste} max={5} color="#f59e0b" size={14} />
                <span style={{fontSize:11, color:T.textLight}}>{avg>0?`moy. ${avg.toFixed(1)}`:"pas encore noté"}</span>
              </div>
              <div style={{display:"flex", gap:10}}>
                <StarRating icon="🍽️" value={dish.dishesRating||0} max={5} color={T.accent} size={13} />
                <StarRating icon="⏱️" value={dish.timeRating||0} max={5} color={T.green} size={13} />
              </div>
              <div style={{marginTop:6, fontSize:11, color:T.textLight, display:"flex", alignItems:"center", gap:4}}>
                <Avatar user={dish.updatedBy} size={14} />
                {dish.updatedBy} · {formatTimeAgo(dish.updatedAt)}
              </div>
            </>
          )}
          {compact && cats.length > 0 && <div style={{fontSize:10, color:T.textMuted}}>{cats.join(", ")}</div>}
        </div>
      </div>
    );
  };

  // ─── PLAN SLOT ─────────────────────────────────────────────────────────────
  const PlanSlot = ({slot, isWeekend}) => {
    const entry   = currentWeekPlan[slot];
    const dish    = entry ? dishes.find(d => d.id === entry.id) : null;
    const display = dish || entry;
    const meal    = slot.split(" ").pop();
    const [over, setOver] = useState(false);
    return (
      <div onDragOver={e=>{e.preventDefault();setOver(true);}} onDragLeave={()=>setOver(false)}
        onDrop={e=>{e.preventDefault();setOver(false);handleDrop(slot);}}
        style={{background:over?(isWeekend?T.weekendBg:T.weekdayBg):"transparent", border:`1.5px ${over?"solid":"dashed"} ${over?(isWeekend?T.weekendHeader:T.weekdayHeader):(isWeekend?T.weekendBorder:T.weekdayBorder)}`, borderRadius:10, padding:"8px 10px", minHeight:62, transition:"all 0.15s"}}>
        <div style={{fontSize:10, fontWeight:700, color:isWeekend?T.weekendHeader:T.weekdayHeader, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5}}>
          {meal==="midi"?"☀️ Midi":"🌙 Soir"}
        </div>
        {display ? (
          <div draggable onDragStart={()=>setDragItem({slot, dish:entry})}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <div style={{width:26,height:26,borderRadius:7,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,overflow:"hidden",flexShrink:0}}>
                {display.photo ? <img src={display.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🍽️"}
              </div>
              <div style={{flex:1,fontSize:12,fontWeight:600,color:T.text,cursor:"grab",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{display.name}</div>
              <button onClick={()=>removeFromPlan(slot)} style={{...s.iconBtn,fontSize:14,flexShrink:0}}>×</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setPlanSlot(slot)} style={{background:"transparent",border:"none",color:T.textLight,fontSize:12,padding:"2px 0",cursor:"pointer",fontFamily:"inherit",width:"100%",textAlign:"left"}}>+ Assigner</button>
        )}
      </div>
    );
  };

  // ─── MODAL ─────────────────────────────────────────────────────────────────
  const Modal = ({title, onClose, children}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(10,20,35,0.55)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"0 24px 28px",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:`0 -20px 60px ${T.shadowMd}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 20px"}}>
          <div style={{width:36,height:4,background:T.inputBorder,borderRadius:2}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:800,color:T.text}}>{title}</h2>
          <button onClick={onClose} style={{...s.iconBtn,fontSize:22}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );

  // ─── DISH FORM ─────────────────────────────────────────────────────────────
  const DishForm = ({initial, onSave, onCancel}) => {
    const fromIdea = initial?.fromIdea;
    const def = fromIdea
      ? {name:fromIdea.title, categories:[], tasteByUser:{}, dishesRating:2, timeRating:2, recipe:fromIdea.note||"", photo:fromIdea.photo||null, favorite:false}
      : initial || {name:"", categories:[], tasteByUser:{}, dishesRating:2, timeRating:2, recipe:"", photo:null, favorite:false};
    const [form, setForm] = useState({...def, categories:def.categories||(def.category?[def.category]:[])});
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const myTaste    = form.tasteByUser?.[currentUser] || 3;
    const setMyTaste = v => set("tasteByUser",{...form.tasteByUser,[currentUser]:v});
    const handlePhoto = e => { const f=e.target.files[0]; if(!f)return; const reader=new FileReader(); reader.onload=ev=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");const MAX=400;const ratio=Math.min(MAX/img.width,MAX/img.height);canvas.width=img.width*ratio;canvas.height=img.height*ratio;canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);set("photo",canvas.toDataURL("image/jpeg",0.7));};img.src=ev.target.result;};reader.readAsDataURL(f);};

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <label style={s.label}>Nom du plat *</label>
          <input value={form.name} onChange={e=>set("name",e.target.value)} style={s.input} placeholder="Ex: Tarte aux poireaux"/>
        </div>
        <div>
          <label style={s.label}>Catégories (plusieurs possibles)</label>
          <CategoryPills selected={form.categories} onChange={v=>set("categories",v)}/>
        </div>
        <div>
          <label style={s.label}>Photo</label>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:60,height:60,borderRadius:12,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden"}}>
              {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
            </div>
            <label style={{...s.ghost,fontSize:13,cursor:"pointer",padding:"8px 14px"}}>
              📷 Choisir <input type="file" accept="image/*" style={{display:"none"}} onChange={const handlePhoto = e => {   const f = e.target.files[0];   if (!f) return;   const reader = new FileReader();   reader.onload = ev => {     const img = new Image();     img.onload = () => {       const canvas = document.createElement("canvas");       const MAX = 400;       const ratio = Math.min(MAX / img.width, MAX / img.height);       canvas.width = img.width * ratio;       canvas.height = img.height * ratio;       canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);       set("photo", canvas.toDataURL("image/jpeg", 0.7));     };     img.src = ev.target.result;   };   reader.readAsDataURL(f); };}/>
            </label>
            {form.photo && <button onClick={()=>set("photo",null)} style={{...s.iconBtn,color:T.danger}}>✕</button>}
          </div>
        </div>
        <div>
          <label style={s.label}>★ Mon goût ({currentUser})</label>
          <StarRating icon="★" value={myTaste} onChange={setMyTaste} color="#f59e0b" size={24}/>
        </div>
        <div>
          <label style={s.label}>🍽️ Vaisselle</label>
          <StarRating icon="🍽️" value={form.dishesRating} onChange={v=>set("dishesRating",v)} color={T.accent} size={22}/>
        </div>
        <div>
          <label style={s.label}>⏱️ Temps de préparation</label>
          <StarRating icon="⏱️" value={form.timeRating} onChange={v=>set("timeRating",v)} color={T.green} size={22}/>
        </div>
        <div>
          <label style={s.label}>Recette</label>
          <textarea value={form.recipe} onChange={e=>set("recipe",e.target.value)} style={{...s.input,height:90,resize:"vertical"}} placeholder="Instructions, lien YouTube, notes..."/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:14,color:T.textMuted}}>
          <input type="checkbox" checked={form.favorite} onChange={e=>set("favorite",e.target.checked)}/> Favori ★
        </label>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{...s.ghost,flex:1}}>Annuler</button>
          <button onClick={() => form.name && onSave({...form, tasteByUser:{...form.tasteByUser,[currentUser]:myTaste}})} style={{...s.primary,flex:1}} disabled={!form.name}>Enregistrer</button>
        </div>
      </div>
    );
  };

  // ─── IDEA FORM ─────────────────────────────────────────────────────────────
  const IdeaForm = ({initial, onSave, onCancel}) => {
    const [form, setForm] = useState(initial || {title:"",note:"",link:"",photo:null,tested:false});
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const handlePhoto = e => { const f=e.target.files[0]; if(!f)return; const reader=new FileReader(); reader.onload=ev=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");const MAX=400;const ratio=Math.min(MAX/img.width,MAX/img.height);canvas.width=img.width*ratio;canvas.height=img.height*ratio;canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);set("photo",canvas.toDataURL("image/jpeg",0.7));};img.src=ev.target.result;};reader.readAsDataURL(f);};
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={s.label}>Titre</label>
          <input value={form.title} onChange={e=>set("title",e.target.value)} style={s.input} placeholder="Ex: Shakshuka"/>
        </div>
        <div>
          <label style={s.label}>Notes</label>
          <textarea value={form.note} onChange={e=>set("note",e.target.value)} style={{...s.input,height:80,resize:"vertical"}} placeholder="Description, ingrédients..."/>
        </div>
        <div>
          <label style={s.label}>Lien vidéo / recette</label>
          <input value={form.link} onChange={e=>set("link",e.target.value)} style={s.input} placeholder="https://..."/>
        </div>
        <div>
          <label style={s.label}>Photo</label>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:52,height:52,borderRadius:10,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden"}}>
              {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"💡"}
            </div>
            <label style={{...s.ghost,fontSize:13,cursor:"pointer",padding:"8px 14px"}}>
              📷 Ajouter <input type="file" accept="image/*" style={{display:"none"}} onChange={const handlePhoto = e => {   const f = e.target.files[0];   if (!f) return;   const reader = new FileReader();   reader.onload = ev => {     const img = new Image();     img.onload = () => {       const canvas = document.createElement("canvas");       const MAX = 400;       const ratio = Math.min(MAX / img.width, MAX / img.height);       canvas.width = img.width * ratio;       canvas.height = img.height * ratio;       canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);       set("photo", canvas.toDataURL("image/jpeg", 0.7));     };     img.src = ev.target.result;   };   reader.readAsDataURL(f); };}/>
            </label>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{...s.ghost,flex:1}}>Annuler</button>
          <button onClick={()=>onSave(form)} style={{...s.primary,flex:1}}>Enregistrer</button>
        </div>
      </div>
    );
  };

  // ─── PLAN GROUPING ─────────────────────────────────────────────────────────
  const groupSlots = slots => {
    const map = {};
    slots.forEach(slot => {
      const parts = slot.split(" "); const meal = parts.pop(); const day = parts.join(" ");
      if (!map[day]) map[day] = {};
      map[day][meal] = slot;
    });
    return map;
  };
  const weekdayByDay = groupSlots(WEEKDAY_SLOTS);
  const weekendByDay = groupSlots(WEEKEND_SLOTS);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={s.app}>
      {/* HEADER */}
      <div style={{background:T.headerBg, padding:"18px 20px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"white",letterSpacing:-0.3}}>🥗 Orga de plat</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:2}}>
              {ALLOWED_EMAILS[authUser?.email]?.avatar} Bonjour, {currentUser}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"6px 10px",fontSize:16,cursor:"pointer",color:"white"}}>{dark?"☀️":"🌙"}</button>
            <button onClick={handleLogout} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",color:"white",fontFamily:"inherit",fontWeight:600}}>Quitter</button>
          </div>
        </div>
        {/* Smart suggestion banner */}
        {computeStats.missingSlots.length > 0 && (
          <div style={{marginTop:12,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 12px",fontSize:12,color:"rgba(255,255,255,0.9)"}}>
            💡 Il manque encore <strong>{computeStats.missingSlots.length}</strong> créneau{computeStats.missingSlots.length>1?"x":""} à planifier cette semaine
          </div>
        )}
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:T.navBg,borderBottom:`1px solid ${T.cardBorder}`,overflowX:"auto"}}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, minWidth:50, padding:"10px 2px", border:"none", background:"transparent",
            fontFamily:"inherit", fontWeight:tab===t.id?700:400,
            color:tab===t.id?T.accent:T.textMuted, fontSize:10,
            borderBottom:`2.5px solid ${tab===t.id?T.accent:"transparent"}`,
            marginBottom:-1, cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3
          }}>
            <span style={{fontSize:16}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex:1, padding:16, paddingBottom:36}}>

        {/* ══ DISHES ══ */}
        {tab==="dishes" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Rechercher un plat..." style={{...s.input,flex:1}}/>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
              <button onClick={()=>setFilterFavOnly(f=>!f)} style={{...s.ghost,fontSize:12,padding:"5px 11px",whiteSpace:"nowrap",borderColor:filterFavOnly?"#f59e0b":T.inputBorder,color:filterFavOnly?"#f59e0b":T.textMuted,flexShrink:0}}>★ Favoris</button>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...s.input,width:"auto",fontSize:12,padding:"5px 10px",flexShrink:0}}>
                <option value="">Toutes catégories</option>
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
              {[0,3,4,5].map(v=>(
                <button key={v} onClick={()=>setFilterMinTaste(filterMinTaste===v?0:v)} style={{...s.ghost,fontSize:12,padding:"5px 10px",whiteSpace:"nowrap",borderColor:filterMinTaste===v?"#f59e0b":T.inputBorder,color:filterMinTaste===v?"#f59e0b":T.textMuted,flexShrink:0}}>
                  {v===0?"Tous":`≥ ${"★".repeat(v)}`}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowAddDish(true)} style={{...s.primary,width:"100%",padding:12,marginBottom:14}}>+ Ajouter un plat</button>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filteredDishes.length===0 && <div style={{textAlign:"center",color:T.textLight,padding:"40px 0"}}>Aucun plat trouvé 🍽️</div>}
              {filteredDishes.map(d=><DishCard key={d.id} dish={d}/>)}
            </div>
          </div>
        )}

        {/* ══ PLANNING ══ */}
        {tab==="plan" && (
          <div>
            <div style={{display:"flex",background:T.segBg,borderRadius:12,padding:3,marginBottom:14,gap:3}}>
              {[{id:"weekday",label:"Lun → Ven midi",icon:"💼"},{id:"weekend",label:"Ven soir → Dim",icon:"🌿"}].map(v=>(
                <button key={v.id} onClick={()=>setPlanView(v.id)} style={{
                  flex:1, padding:"9px 6px", borderRadius:9, border:"none",
                  background:planView===v.id?T.card:"transparent",
                  color:planView===v.id?(v.id==="weekday"?T.weekdayHeader:T.weekendHeader):T.textMuted,
                  fontWeight:planView===v.id?700:400, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  boxShadow:planView===v.id?`0 2px 8px ${T.shadow}`:"none"
                }}>{v.icon} {v.label}</button>
              ))}
            </div>

            {planView==="weekday" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {Object.entries(weekdayByDay).map(([day,meals])=>(
                  <div key={day} style={{...s.card,padding:0,overflow:"hidden",borderColor:T.weekdayBorder}}>
                    <div style={{background:T.weekdayHeader,color:"white",padding:"8px 14px",fontWeight:700,fontSize:13}}>{day}</div>
                    <div style={{display:"grid",gridTemplateColumns:meals.soir?"1fr 1fr":"1fr",padding:8,gap:8}}>
                      {meals.midi && <PlanSlot slot={meals.midi} isWeekend={false}/>}
                      {meals.soir && <PlanSlot slot={meals.soir} isWeekend={false}/>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {planView==="weekend" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {Object.entries(weekendByDay).map(([day,meals])=>(
                  <div key={day} style={{...s.card,padding:0,overflow:"hidden",borderColor:T.weekendBorder}}>
                    <div style={{background:T.weekendHeader,color:"white",padding:"8px 14px",fontWeight:700,fontSize:13}}>{day}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",padding:8,gap:8}}>
                      {meals.midi && <PlanSlot slot={meals.midi} isWeekend={true}/>}
                      {meals.soir && <PlanSlot slot={meals.soir} isWeekend={true}/>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pastWeeks.length>0 && (
              <div style={{marginTop:24}}>
                <div style={{fontWeight:700,color:T.textMuted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>📚 Semaines passées</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {pastWeeks.map(wk=>(
                    <button key={wk} onClick={()=>setHistoryWeek(wk)} style={{...s.card,padding:"10px 14px",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontWeight:600,color:T.text,fontSize:13}}>Semaine du {wk}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>{Object.values(weekPlans[wk]||{}).filter(Boolean).length} repas</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ IDEAS ══ */}
        {tab==="ideas" && (
          <div>
            <button onClick={()=>setShowAddIdea(true)} style={{...s.green,width:"100%",padding:12,marginBottom:14}}>+ Nouvelle idée de plat</button>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {ideas.length===0 && <div style={{textAlign:"center",color:T.textLight,padding:"40px 0"}}>Aucune idée pour l'instant 💡</div>}
              {ideas.map(idea=>(
                <div key={idea.id} style={{...s.card,opacity:idea.tested?0.6:1}}>
                  <div style={{display:"flex",gap:10}}>
                    <div style={{width:50,height:50,borderRadius:10,background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden",flexShrink:0}}>
                      {idea.photo?<img src={idea.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"💡"}
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
                      {idea.note && <div style={{fontSize:13,color:T.textMuted,marginTop:6,lineHeight:1.5}}>{idea.note}</div>}
                      {idea.link && <a href={idea.link} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.accent,display:"block",marginTop:4}}>🔗 Voir la recette</a>}
                      <div style={{display:"flex",gap:8,marginTop:10}}>
                        <button onClick={()=>toggleIdeaTested(idea)} style={{...s.ghost,fontSize:12,padding:"5px 10px",borderColor:idea.tested?T.green:T.inputBorder,color:idea.tested?T.green:T.textMuted}}>
                          {idea.tested?"✅ Testé":"⏳ À tester"}
                        </button>
                        <button onClick={()=>{setShowAddDish({fromIdea:idea});setEditIdea(null);}} style={{...s.primary,fontSize:12,padding:"5px 12px"}}>→ Créer ce plat</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ RANDOM ══ */}
        {tab==="random" && (
          <div>
            <div style={{...s.card,marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:16,color:T.text,marginBottom:16}}>🎲 Tirer un plat au hasard</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div>
                  <label style={s.label}>Catégorie</label>
                  <select value={randomFilters.category} onChange={e=>setRandomFilters(f=>({...f,category:e.target.value}))} style={s.input}>
                    <option value="">Toutes</option>
                    {categories.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>★ Goût minimum : {randomFilters.minTaste}/5</label>
                  <input type="range" min={1} max={5} value={randomFilters.minTaste} onChange={e=>setRandomFilters(f=>({...f,minTaste:+e.target.value}))} style={{width:"100%",accentColor:T.accent}}/>
                </div>
                <div>
                  <label style={s.label}>⏱️ Temps max : {randomFilters.maxTime}/5</label>
                  <input type="range" min={1} max={5} value={randomFilters.maxTime} onChange={e=>setRandomFilters(f=>({...f,maxTime:+e.target.value}))} style={{width:"100%",accentColor:T.green}}/>
                </div>
                <div>
                  <label style={s.label}>🍽️ Vaisselle max : {randomFilters.maxDishes}/5</label>
                  <input type="range" min={1} max={5} value={randomFilters.maxDishes} onChange={e=>setRandomFilters(f=>({...f,maxDishes:+e.target.value}))} style={{width:"100%",accentColor:T.teal}}/>
                </div>
                <button onClick={drawRandom} style={{...s.primary,padding:13,fontSize:15}}>🎲 Tirer un plat !</button>
              </div>
            </div>
            {randomResult===null && <div style={{textAlign:"center",color:T.textLight,fontSize:14,padding:16}}>Aucun plat ne correspond aux filtres 😅</div>}
            {randomResult && (
              <div>
                <div style={{textAlign:"center",fontWeight:700,color:T.accent,marginBottom:10}}>✨ Et ce soir...</div>
                <DishCard dish={randomResult}/>
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={drawRandom} style={{...s.ghost,flex:1}}>🔄 Retirer</button>
                  <button onClick={()=>{setPendingDishForPlan(randomResult);setPlanSlot("__pick__");setSelectedSlots([]);}} style={{...s.primary,flex:1}}>📅 Planifier</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ STATS ══ */}
        {tab==="stats" && (
          <div>
            <div style={{fontWeight:800,fontSize:16,color:T.text,marginBottom:16}}>📊 Statistiques</div>

            {/* Résumé global */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {label:"Plats enregistrés", value:dishes.length, icon:"🍽️"},
                {label:"Repas planifiés (total)", value:computeStats.totalPlanned, icon:"📅"},
                {label:"Idées en attente", value:ideas.filter(i=>!i.tested).length, icon:"💡"},
                {label:"Favoris", value:dishes.filter(d=>d.favorite).length, icon:"★"},
              ].map(({label,value,icon})=>(
                <div key={label} style={{...s.card,background:T.statCard,textAlign:"center",padding:"14px 10px"}}>
                  <div style={{fontSize:24,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:22,fontWeight:800,color:T.accent}}>{value}</div>
                  <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Top plats */}
            {computeStats.topDishes.length > 0 && (
              <div style={{...s.card,marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:12}}>🏆 Plats les plus cuisinés</div>
                {computeStats.topDishes.map((d,i)=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:24,height:24,borderRadius:6,background:i===0?"#f59e0b":i===1?T.textMuted:"#cd7f32",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div>
                    <div style={{width:32,height:32,borderRadius:8,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,overflow:"hidden",flexShrink:0}}>
                      {d.photo?<img src={d.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{d.name}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>{computeStats.dishCount[d.id]} fois planifié</div>
                    </div>
                    <StarRating icon="★" value={Math.round(avgTaste(d))} max={5} color="#f59e0b" size={12}/>
                  </div>
                ))}
              </div>
            )}

            {/* Plats oubliés */}
            {computeStats.forgottenDishes.length > 0 && (
              <div style={{...s.card,marginBottom:12,borderColor:T.warningBorder,background:T.warningBg}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>⏰ Pas cuisiné depuis +3 semaines</div>
                {computeStats.forgottenDishes.map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{fontSize:18}}>🍽️</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{d.name}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>Dernier : {computeStats.lastCooked[d.id] ? formatDate({toDate:()=>computeStats.lastCooked[d.id]}) : "—"}</div>
                    </div>
                    <button onClick={()=>{setPendingDishForPlan(d);setPlanSlot("__pick__");setSelectedSlots([]);setTab("plan");}} style={{...s.primary,fontSize:11,padding:"4px 10px"}}>Planifier</button>
                  </div>
                ))}
              </div>
            )}

            {/* Jamais cuisinés */}
            {computeStats.neverCooked.length > 0 && (
              <div style={{...s.card,marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>🆕 Jamais planifiés</div>
                {computeStats.neverCooked.map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{fontSize:18}}>🍽️</div>
                    <div style={{flex:1,fontSize:13,fontWeight:600,color:T.text}}>{d.name}</div>
                    <button onClick={()=>{setPendingDishForPlan(d);setPlanSlot("__pick__");setSelectedSlots([]);setTab("plan");}} style={{...s.primary,fontSize:11,padding:"4px 10px"}}>Planifier</button>
                  </div>
                ))}
              </div>
            )}

            {/* Diversité catégories cette semaine */}
            {Object.keys(computeStats.catDist).length > 0 && (
              <div style={{...s.card}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>🗂️ Catégories cette semaine</div>
                {Object.entries(computeStats.catDist).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>{
                  const c = catColor(cat);
                  const pct = Math.round((count / Math.max(...Object.values(computeStats.catDist))) * 100);
                  return (
                    <div key={cat} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:600,color:T.text}}>{cat}</span>
                        <span style={{fontSize:11,color:T.textMuted}}>{count} repas</span>
                      </div>
                      <div style={{height:6,background:T.cardBorder,borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:c.color,borderRadius:3,transition:"width 0.4s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ ACTIVITY ══ */}
        {tab==="activity" && (
          <div>
            <div style={{fontWeight:800,fontSize:16,color:T.text,marginBottom:14}}>📰 Fil d'activité</div>
            {activityFeed.length===0 && <div style={{textAlign:"center",color:T.textLight,padding:"40px 0"}}>Aucune activité pour l'instant</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {activityFeed.map(a=>(
                <div key={a.id} style={{...s.card,display:"flex",gap:10,alignItems:"center"}}>
                  <Avatar user={a.user} size={34}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:T.text}}>
                      <strong style={{color:Object.values(ALLOWED_EMAILS).find(u=>u.displayName===a.user)?.color}}>{a.user}</strong> {a.msg}
                    </div>
                    <div style={{fontSize:11,color:T.textLight,marginTop:2}}>{formatTimeAgo(a.ts)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {(showAddDish||editDish) && (
        <Modal title={editDish?"Modifier le plat":"Nouveau plat"} onClose={()=>{setShowAddDish(false);setEditDish(null);}}>
          <DishForm initial={editDish||(showAddDish?.fromIdea?showAddDish:null)} onSave={form=>saveDish(form,!!editDish)} onCancel={()=>{setShowAddDish(false);setEditDish(null);}}/>
        </Modal>
      )}

      {viewDish && (() => {
        const d = dishes.find(x=>x.id===viewDish.id) || viewDish;
        const cats = d.categories||[];
        return (
          <Modal title={d.name} onClose={()=>setViewDish(null)}>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {d.photo && <img src={d.photo} alt="" style={{width:"100%",borderRadius:14,objectFit:"cover",maxHeight:190}}/>}
              {cats.length>0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {cats.map(cat=>{const c=catColor(cat);return <span key={cat} style={{fontSize:11,fontWeight:700,color:c.color,background:c.bg,borderRadius:10,padding:"3px 10px"}}>{cat}</span>;})}
                  {d.favorite && <span style={{fontSize:11,fontWeight:700,color:"#f59e0b",background:"#fef3c7",borderRadius:10,padding:"3px 10px"}}>★ Favori</span>}
                </div>
              )}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Notes de goût</div>
                {Object.values(ALLOWED_EMAILS).map(u=>(
                  <div key={u.displayName} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <Avatar user={u.displayName} size={24}/>
                    <span style={{fontSize:13,color:T.text,width:58,fontWeight:600}}>{u.displayName}</span>
                    <StarRating icon="★" value={d.tasteByUser?.[u.displayName]||0} max={5} color="#f59e0b" size={18}
                      onChange={currentUser===u.displayName ? v=>updateTaste(d,v) : undefined}/>
                    <span style={{fontSize:11,color:T.textLight}}>{d.tasteByUser?.[u.displayName]?`${d.tasteByUser[u.displayName]}/5`:"—"}</span>
                  </div>
                ))}
                {Object.keys(d.tasteByUser||{}).length>0 && (
                  <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Moyenne : <strong style={{color:T.text}}>{avgTaste(d).toFixed(1)}/5</strong></div>
                )}
              </div>
              <div style={{display:"flex",gap:20}}>
                <div><div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Vaisselle</div><StarRating icon="🍽️" value={d.dishesRating||0} max={5} color={T.accent} size={16}/></div>
                <div><div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Temps</div><StarRating icon="⏱️" value={d.timeRating||0} max={5} color={T.green} size={16}/></div>
              </div>
              {d.recipe && (
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Recette</div>
                  <div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap",background:T.activityBg,padding:"12px 14px",borderRadius:10}}>{d.recipe}</div>
                </div>
              )}
              <div style={{fontSize:11,color:T.textLight,display:"flex",alignItems:"center",gap:5}}>
                <Avatar user={d.updatedBy} size={14}/>
                Modifié par <strong>{d.updatedBy}</strong> · {formatTimeAgo(d.updatedAt)}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setEditDish(d);setViewDish(null);}} style={{...s.ghost,flex:1}}>✏️ Modifier</button>
                <button onClick={()=>{setPendingDishForPlan(d);setPlanSlot("__pick__");setSelectedSlots([]);setViewDish(null);}} style={{...s.primary,flex:1}}>📅 Planifier</button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {planSlot==="__pick__" && pendingDishForPlan && (
        <Modal title={`Planifier "${pendingDishForPlan.name}"`} onClose={()=>{setPlanSlot(null);setPendingDishForPlan(null);setSelectedSlots([]);}}>
          <div style={{fontSize:13,color:T.textMuted,marginBottom:4}}>Sélectionnez un ou plusieurs créneaux :</div>
          {selectedSlots.length>0 && <div style={{fontSize:12,color:T.accent,fontWeight:600,marginBottom:10}}>{selectedSlots.length} créneau{selectedSlots.length>1?"x":""} sélectionné{selectedSlots.length>1?"s":""}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:400,overflowY:"auto",marginBottom:14}}>
            {(() => {
              const days = {};
              ALL_SLOTS.forEach(slot=>{const parts=slot.split(" ");const meal=parts.pop();const day=parts.join(" ");if(!days[day])days[day]=[];days[day].push({slot,meal});});
              return Object.entries(days).map(([day,slots])=>(
                <div key={day}>
                  <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,padding:"8px 2px 4px"}}>{day}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {slots.map(({slot,meal})=>{
                      const isSelected = selectedSlots.includes(slot);
                      const occupied   = currentWeekPlan[slot];
                      return (
                        <button key={slot} onClick={()=>setSelectedSlots(ss=>isSelected?ss.filter(s=>s!==slot):[...ss,slot])} style={{
                          padding:"10px 12px",borderRadius:10,cursor:"pointer",
                          border:`2px solid ${isSelected?T.accent:occupied?T.inputBorder:T.cardBorder}`,
                          background:isSelected?T.accentLight:T.card,
                          fontFamily:"inherit",textAlign:"left",transition:"all 0.15s",
                          display:"flex",flexDirection:"column",gap:3
                        }}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:12,fontWeight:700,color:isSelected?T.accent:T.text}}>{meal==="midi"?"☀️ Midi":"🌙 Soir"}</span>
                            <span style={{fontSize:14,color:isSelected?T.accent:T.inputBorder}}>{isSelected?"✓":"○"}</span>
                          </div>
                          <span style={{fontSize:10,color:occupied?(isSelected?T.accentDark:T.textMuted):T.textLight,fontWeight:occupied?600:400}}>
                            {occupied?`↩ ${occupied.name}`:"Libre"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setPlanSlot(null);setPendingDishForPlan(null);setSelectedSlots([]);}} style={{...s.ghost,flex:1}}>Annuler</button>
            <button onClick={()=>assignDishToMultipleSlots(pendingDishForPlan,selectedSlots)} disabled={selectedSlots.length===0} style={{...s.primary,flex:2,opacity:selectedSlots.length===0?0.4:1}}>
              ✓ Confirmer {selectedSlots.length>0?`(${selectedSlots.length})`:""}
            </button>
          </div>
        </Modal>
      )}

      {planSlot && planSlot!=="__pick__" && (
        <Modal title={`Choisir pour : ${planSlot}`} onClose={()=>setPlanSlot(null)}>
          <input placeholder="🔍 Rechercher..." style={{...s.input,marginBottom:10}} onChange={e=>setSearchQ(e.target.value)}/>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:400,overflowY:"auto"}}>
            {dishes.filter(d=>!searchQ||d.name.toLowerCase().includes(searchQ.toLowerCase())).map(d=>(
              <DishCard key={d.id} dish={d} compact onSelect={dish=>assignDish(dish,planSlot)}/>
            ))}
          </div>
        </Modal>
      )}

      {(showAddIdea||editIdea) && (
        <Modal title={editIdea?"Modifier l'idée":"Nouvelle idée"} onClose={()=>{setShowAddIdea(false);setEditIdea(null);}}>
          <IdeaForm initial={editIdea} onSave={form=>saveIdea(form,!!editIdea)} onCancel={()=>{setShowAddIdea(false);setEditIdea(null);}}/>
        </Modal>
      )}

      {addCatModal && (
        <Modal title="Nouvelle catégorie" onClose={()=>setAddCatModal(false)}>
          <label style={s.label}>Nom</label>
          <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{...s.input,marginBottom:14}} placeholder="Ex: Soupe"
            onKeyDown={e=>{if(e.key==="Enter"&&newCatName.trim()){addCategory(newCatName.trim());setNewCatName("");setAddCatModal(false);}}}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setAddCatModal(false)} style={s.ghost}>Annuler</button>
            <button onClick={()=>{if(newCatName.trim()){addCategory(newCatName.trim());setNewCatName("");setAddCatModal(false);}}} style={s.primary}>Ajouter</button>
          </div>
        </Modal>
      )}

      {historyWeek && (
        <Modal title={`Semaine du ${historyWeek}`} onClose={()=>setHistoryWeek(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ALL_SLOTS.map(slot=>{
              const entry = weekPlans[historyWeek]?.[slot];
              if (!entry) return null;
              return (
                <div key={slot} style={{...s.card,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,overflow:"hidden",flexShrink:0}}>
                    {entry.photo?<img src={entry.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🍽️"}
                  </div>
                  <div>
                    <div style={{fontSize:11,color:T.textMuted}}>{slot}</div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>{entry.name}</div>
                  </div>
                </div>
              );
            })}
            {ALL_SLOTS.every(s=>!weekPlans[historyWeek]?.[s]) && <div style={{textAlign:"center",color:T.textLight,padding:"24px 0"}}>Aucun repas planifié</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
