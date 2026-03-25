// ╔══════════════════════════════════════════════════════════════╗
// ║                    ORGA DE PLAT                              ║
// ╚══════════════════════════════════════════════════════════════╝
//
// ── v6 ──────────────────────────────────────────────────────────
// + Grille 2 colonnes avec grandes miniatures
// + Note de goût en haut gauche, favori en haut droit de la miniature
// + Swipe droit = planifier, swipe gauche = toggle favori
// + Appui long = modale notation goût
// + Tri catégories par boutons (plus de select)
// + Suppression filtre note de goût
// + Bouton remise à zéro du planning
// + Bouton retour Android : revient à la page précédente, double tap = quitter
//
// ── v7 ──────────────────────────────────────────────────────────
// + Nouveaux emojis onglets : 🥘 📅 💡 🪄 🏆 📰
// + Style A onglets : pill actif avec fond coloré dans le bandeau
// + Catégories sans scroll horizontal (flexWrap)
// + Loupe cliquable : barre de recherche masquée par défaut
// + Étoile favori en doré sur la miniature
//
// ── v7.1 ────────────────────────────────────────────────────────
// + Barre de recherche masquée par défaut (searchQ initialisé à null)
//
// ── v8 ──────────────────────────────────────────────────────────
// + En-tête compact : onglets intégrés dans le bandeau coloré
// + Cartes modernisées : sans bordure, ombres douces, coins arrondis 18px
// + Fiche plat : photo plein écran bord à bord avec titre en overlay
// + Dégradé sur photo + bouton fermer avec backdrop-filter
//
// ── v8.1 ────────────────────────────────────────────────────────
// + Photo fiche : objectFit contain → photo entière sans rognage
// + overflow:hidden sur la modale pour coins arrondis propres
//
// ── v8.2 ────────────────────────────────────────────────────────
// + Photo fiche : width 100% sans hauteur fixe → photo entière bord à bord
//
// ── v9 ──────────────────────────────────────────────────────────
// + Animation cascade au chargement des cartes (délai 60ms entre chaque)
// + Swipe feedback progressif : icône grossit selon la distance du swipe
// + Dark mode affiné : fond bleuté, cartes avec dégradé, texte plus lumineux
// + Icône vaisselle : 🍽️ → 🫧 (bulles de savon)
// + Bug scroll modale corrigé : l'arrière-plan reste figé à l'ouverture d'une fiche
// + Historique des versions ajouté en commentaire
//
// ── v9.1 ────────────────────────────────────────────────────────
// + Swipe plus facile : seuil réduit 60px → 40px
// + Détection du flick (geste rapide court) pour déclencher le swipe sans distance complète
//
// ── v9.2 ────────────────────────────────────────────────────────
// + Support souris sur desktop : clic + drag sur les cartes (onMouseDown/Move/Up/Leave)
//
// ── v10 ─────────────────────────────────────────────────────────
// + ① Fond dégradé animé (aurora) sur l'en-tête
// + ② 3 palettes couleur : Océan (actuel), Coucher de soleil, Lavande — dans Outils
// + ③ Photo fond flouté ambient dans la fiche plat
// + ④ Micro-animations : étoile pop au tap, boutons rebond au clic
// + ⑤ Streak hebdomadaire — affiché dans Stats
// + ⑥ Badges à débloquer — affichés dans Stats
// + ⑦ Roue aléatoire animée — remplace l'onglet 🪄
// + ⑧ Confettis + toast quand planning de la semaine est complet
// + ⑩ Minuteur de cuisson configurable — dans onglet Outils
// + ⑮ Compatibilité des goûts Théo & Elodie — dans onglet Outils
// + Onglet 🔧 Outils ajouté (7ème onglet)
// + Toggle dark mode déplacé dans Outils (avec beau switch)
//
// ── v10.1 ────────────────────────────────────────────────────────
// + Planning : saisie libre d'un plat (sans créer de fiche)
// + Planning : fix recherche (state local, plus de perte de focus)
// + Planning : miniatures agrandies (44×44px)
// + Activité : log de connexion avec heure et date
//
// ── v10.2 ────────────────────────────────────────────────────────
// + Planning : fix clavier mobile (PlanPickModal composant externe, inputs non-contrôlés)
// + Planning : miniatures encore agrandies (56×56px)
//
// ── v10.3 ────────────────────────────────────────────────────────
// + Fiche plat : fix photo bord à bord (hauteur naturelle, objectFit cover)
// + Fiche plat : fix titre + catégories visibles (zIndex corrigé)
// + Fiche plat : fix fond flouté visible (blur 22px derrière la photo)
//
// ── v10.4 ────────────────────────────────────────────────────────
// + Roue aléatoire : mode "Choix manuel" — sélection de fiches ou saisie libre
// + Roue aléatoire : composant WheelTab externe (clavier stable)
//
// ── v10.5 ────────────────────────────────────────────────────────
// + Onglets Stats + Activité fusionnés en un seul onglet "Suivi" (🔎)
// + Minuteur : saisie libre MM:SS (composant TimerInput externe)
//
// ── v10.6 ────────────────────────────────────────────────────────
// + Fix minuteur : React.useRef → useRef (erreur page blanche onglet Outils)
//
// ── v10.7 ────────────────────────────────────────────────────────
// + Header : suppression bouton mode sombre (déjà dans Outils)
// + Onglet Suivi : icône 📊 → 🔎
//
// ── v10.8 ────────────────────────────────────────────────────────
// + Planning : créneau redesigné — photo au-dessus, nom en dessous (2 colonnes)
// + Minuteur : suppression des raccourcis prédéfinis (saisie libre uniquement)
// + Thèmes : affichage en grille 3×2 (au lieu de liste verticale)
// + Thèmes : 2 nouveaux thèmes — 🌿 Forêt et 🍬 Bonbon (5 thèmes au total)
// + Onglets : Outils placé avant Suivi
//
// ── v10.9 ────────────────────────────────────────────────────────
// + Outils : minuteur déplacé au-dessus des thèmes couleur
//
// ── v11.0 ────────────────────────────────────────────────────────
// + Onglets privés Élodie : "Plats Élodie" (👩‍🍳) + "Planning Élodie" (💜)
// + Visibles et modifiables UNIQUEMENT quand Élodie est connectée
// + Collections Firestore séparées : elodieDishes / elodieWeekPlans
// + Totalement isolés du planning commun, de la roue et des stats
// + Bannière violette dans chaque onglet pour signaler la nature privée
//
// ── v12.0 — 2026-03-07 ───────────────────────────────────────────
// + Tri par vaisselle et temps dans l'onglet Plats (3 icônes max)
// + Notes vaisselle et temps réduites à 3 icônes max (au lieu de 5)
// + Ordre d'affichage : derniers plats ajoutés en premier
// + Planning Théo : 3 vues — W-E (semaine en cours), Semaine pro, W-E pro
// + Planning Élodie : drag & drop + saisie libre (même niveau que Théo)
// + Confirmation avant suppression / modification / retrait du planning
// + Chargement initial accéléré (dataLoading sur dishes au lieu de weekPlans)
// + Cache localStorage : dishes, weekPlans, idées chargés instantanément au 2ème lancement
//
// ── v12.1 — 2026-03-09 ───────────────────────────────────────────
// + PlanPickModal : liste de plats remonte au-dessus du clavier virtuel (visualViewport)
//
// ── v12.2 — 2026-03-14 ───────────────────────────────────────────
// + Onglet "Plats Élodie" visible par Théo (lecture seule, pas d'ajout/modif)
// + Planning Théo : toggle source plats (ses plats / plats Élodie)
// + Planning Élodie : toggle source plats (ses plats / plats Théo)
// + Bannière onglet Élodie adaptée selon l'utilisateur connecté
// + Règles Firestore : Théo peut lire elodieDishes (écriture Élodie uniquement)
//
// ── v12.3 — 2026-03-25 ───────────────────────────────────────────
// + Roue aléatoire : "Choix manuel" à gauche, "Filtre auto" à droite
// + Roue aléatoire : clic sur le centre pour tourner (plus de bouton dédié)
// + Roue aléatoire : "Choix manuel" sélectionné par défaut
// + Roue aléatoire : saisie libre au-dessus de "Ajouter une fiche"
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEkCPxcQERPI3m8o5XBz3TjyYOlOjlbK4",
  authDomain: "orga-de-plat.firebaseapp.com",
  projectId: "orga-de-plat",
  storageBucket: "orga-de-plat.firebasestorage.app",
  messagingSenderId: "569810560696",
  appId: "1:569810560696:web:de7818a6d5293b0aa2764d",
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const ALLOWED_EMAILS = {
  "theo@orgadeplat.fr":   { displayName: "Théo",   avatar: "🧑‍🍳", color: "#4f86c6" },
  "elodie@orgadeplat.fr": { displayName: "Elodie", avatar: "👩‍🍳", color: "#6bab8a" },
};
const DEFAULT_CATEGORIES = ["Fat","Pas trop fat","Diet","Asiat","Finger food","Deux portions"];
const WEEKDAY_SLOTS = ["Lundi midi","Lundi soir","Mardi midi","Mardi soir","Mercredi midi","Mercredi soir","Jeudi midi","Jeudi soir","Vendredi midi"];
const WEEKEND_SLOTS = ["Vendredi soir","Samedi midi","Samedi soir","Dimanche midi","Dimanche soir"];
const ALL_SLOTS = [...WEEKDAY_SLOTS, ...WEEKEND_SLOTS];
const SWIPE_THRESHOLD = 40; // px — seuil réduit pour swipe plus facile
const LONG_PRESS_MS = 500;

function getWeekKey(d = new Date()) {
  const x = new Date(d); x.setHours(0,0,0,0);
  x.setDate(x.getDate() - x.getDay() + 1);
  return x.toISOString().slice(0,10);
}
function formatTimeAgo(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "à l'instant";
  if (diff < 3600000) return `il y a ${Math.floor(diff/60000)}min`;
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

// ── PALETTES ─────────────────────────────────────────────────────
const PALETTES = {
  ocean:    { name:"Océan",           emoji:"🌊", a:"#4f86c6", b:"#6bab8a",
    headerBg:"linear-gradient(135deg,#4f86c6 0%,#6bab8a 100%)",
    darkHeaderBg:"linear-gradient(135deg,#305888 0%,#2e6e50 100%)" },
  sunset:   { name:"Coucher de soleil", emoji:"🌅", a:"#e07040", b:"#c0509a",
    headerBg:"linear-gradient(135deg,#e07040 0%,#c0509a 100%)",
    darkHeaderBg:"linear-gradient(135deg,#803020 0%,#702060 100%)" },
  lavender: { name:"Lavande",         emoji:"💜", a:"#8b6fd4", b:"#4ab8c8",
    headerBg:"linear-gradient(135deg,#8b6fd4 0%,#4ab8c8 100%)",
    darkHeaderBg:"linear-gradient(135deg,#503890 0%,#226878 100%)" },
  forest:   { name:"Forêt",           emoji:"🌿", a:"#2d8a5e", b:"#7ab840",
    headerBg:"linear-gradient(135deg,#2d8a5e 0%,#7ab840 100%)",
    darkHeaderBg:"linear-gradient(135deg,#145030 0%,#3a6010 100%)" },
  candy:    { name:"Bonbon",          emoji:"🍬", a:"#e8529a", b:"#f5a623",
    headerBg:"linear-gradient(135deg,#e8529a 0%,#f5a623 100%)",
    darkHeaderBg:"linear-gradient(135deg,#901050 0%,#905010 100%)" },
};

function buildTheme(palette, dark) {
  const p = PALETTES[palette] || PALETTES.ocean;
  if (!dark) return {
    bg:"#f0f4f8", card:"#ffffff", cardBorder:"#dde5ee",
    text:"#1e2d3d", textMuted:"#5a7a94", textLight:"#94afc4",
    accent:p.a, accentLight:`${p.a}22`, accentDark:p.a,
    green:p.b, greenLight:`${p.b}22`, teal:"#4a9ba8",
    weekdayBg:"#eef4fb", weekdayBorder:"#b8d4ef", weekdayHeader:p.a,
    weekendBg:"#eef7f1", weekendBorder:"#b8ddc9", weekendHeader:p.b,
    input:"#f7fafc", inputBorder:"#ccd9e6",
    shadow:"rgba(79,134,198,0.08)", shadowMd:"rgba(30,45,61,0.15)",
    danger:"#e05c6a",
    tagColors:[{bg:`${p.a}18`,color:p.a},{bg:`${p.b}18`,color:p.b},{bg:"#e4f4f7",color:"#2e7a86"},{bg:"#f0eefc",color:"#6257b5"},{bg:"#fdf0e8",color:"#b0602a"},{bg:"#fbeaea",color:"#a83a3a"}],
    navBg:"#ffffff", headerBg:p.headerBg,
    activityBg:"#f4f8fc", segBg:"#e8f0f8",
    statCard:"#eef4fb", warningBg:"#fffbeb", warningBorder:"#fcd34d",
  };
  return {
    bg:"#0d1520", card:"linear-gradient(180deg,#1e2d42 0%,#192538 100%)", cardBorder:"#253a52",
    text:"#e8f4ff", textMuted:"#7aaccc", textLight:"#4a7090",
    accent:p.a, accentLight:"#152840", accentDark:p.a,
    green:p.b, greenLight:"#102a1c", teal:"#4aa8b8",
    weekdayBg:"#111e30", weekdayBorder:"#1e3a5a", weekdayHeader:p.a,
    weekendBg:"#101e18", weekendBorder:"#1a3828", weekendHeader:p.b,
    input:"#1a2a3c", inputBorder:"#253a52",
    shadow:"rgba(0,0,0,0.4)", shadowMd:"rgba(0,0,0,0.6)",
    danger:"#e86070",
    tagColors:[{bg:"#152840",color:p.a},{bg:"#102a1c",color:p.b},{bg:"#0d2830",color:"#4aa8b8"},{bg:"#1e1840",color:"#9a8fe0"},{bg:"#2a1808",color:"#d08050"},{bg:"#280a0c",color:"#e07080"}],
    navBg:"#1a2a3c", headerBg:p.darkHeaderBg,
    activityBg:"#111e2c", segBg:"#1a2e42",
    statCard:"#111e30", warningBg:"#1c1600", warningBorder:"#8a6400",
  };
}

const lightTheme = buildTheme("ocean", false);
const darkTheme = buildTheme("ocean", true);

function StarRating({ icon, value, max=5, onChange, color, size=18 }) {
  return (
    <div style={{display:"flex",gap:3}}>
      {Array.from({length:max}).map((_,i) => (
        <span key={i} onClick={() => onChange?.(i+1)}
          style={{fontSize:size,cursor:onChange?"pointer":"default",opacity:i<value?1:0.15,color,userSelect:"none"}}>{icon}</span>
      ))}
    </div>
  );
}
function Avatar({user, size=28}) {
  const u = Object.values(ALLOWED_EMAILS).find(x => x.displayName === user);
  return <div style={{width:size,height:size,borderRadius:"50%",background:u?.color||"#8ab",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.52,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>{u?.avatar||"?"}</div>;
}
function Spinner({T}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg}}>
      <div style={{width:40,height:40,border:`3px solid ${T.accentLight}`,borderTop:`3px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── CROP TOOL ───────────────────────────────────────────────────────────────
function CropTool({ src, onDone, onCancel, T }) {
  const SIZE = 300;
  const [imgNat, setImgNat] = useState({ w:1, h:1 });
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [scale, setScale] = useState(1);
  const imgRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x:0, y:0 });
  const minSc = (w,h) => Math.max(SIZE/w, SIZE/h);
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w=img.naturalWidth, h=img.naturalHeight;
      setImgNat({w,h});
      const ms=minSc(w,h);
      setScale(ms);
      setOffset({x:(SIZE-w*ms)/2, y:(SIZE-h*ms)/2});
    };
    img.src = src;
  }, [src]);
  const clamp = (ox,oy,sc) => ({
    x: Math.min(0, Math.max(SIZE-imgNat.w*sc, ox)),
    y: Math.min(0, Math.max(SIZE-imgNat.h*sc, oy)),
  });
  const onPD = e => { dragging.current=true; lastPos.current={x:e.clientX,y:e.clientY}; e.currentTarget.setPointerCapture(e.pointerId); };
  const onPM = e => {
    if (!dragging.current) return;
    const dx=e.clientX-lastPos.current.x, dy=e.clientY-lastPos.current.y;
    lastPos.current={x:e.clientX,y:e.clientY};
    setOffset(o=>clamp(o.x+dx, o.y+dy, scale));
  };
  const onPU = () => { dragging.current=false; };
  const onW = e => {
    e.preventDefault();
    const ns=Math.max(minSc(imgNat.w,imgNat.h), Math.min(6, scale*(e.deltaY>0?0.92:1.08)));
    setScale(ns); setOffset(o=>clamp(o.x,o.y,ns));
  };
  const confirm = () => {
    const img=imgRef.current;
    const tc=document.createElement("canvas"); tc.width=400; tc.height=400;
    tc.getContext("2d").drawImage(img, -offset.x/scale, -offset.y/scale, SIZE/scale, SIZE/scale, 0, 0, 400, 400);
    const thumbnail=tc.toDataURL("image/jpeg",0.85);
    const fc=document.createElement("canvas");
    const r=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));
    fc.width=img.naturalWidth*r; fc.height=img.naturalHeight*r;
    fc.getContext("2d").drawImage(img,0,0,fc.width,fc.height);
    onDone({thumbnail, full:fc.toDataURL("image/jpeg",0.85)});
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center"}}>
      <div style={{fontSize:13,color:T.textMuted,textAlign:"center",lineHeight:1.5}}><strong>Déplace</strong> pour cadrer · <strong>Zoom</strong> avec le curseur ou la molette</div>
      <div style={{position:"relative",width:SIZE,height:SIZE,overflow:"hidden",borderRadius:16,border:`2.5px solid ${T.accent}`,cursor:"grab",touchAction:"none",userSelect:"none",background:"#000"}}
        onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPU} onWheel={onW}>
        <img ref={imgRef} src={src} alt="" draggable={false} style={{position:"absolute",left:offset.x,top:offset.y,width:imgNat.w*scale,height:imgNat.h*scale,pointerEvents:"none"}}/>
        {[1,2].map(i=><div key={"h"+i} style={{position:"absolute",left:0,right:0,top:`${i*33.33}%`,height:1,background:"rgba(255,255,255,0.25)",pointerEvents:"none"}}/>)}
        {[1,2].map(i=><div key={"v"+i} style={{position:"absolute",top:0,bottom:0,left:`${i*33.33}%`,width:1,background:"rgba(255,255,255,0.25)",pointerEvents:"none"}}/>)}
        {[[0,0],[0,1],[1,0],[1,1]].map(([r,c])=><div key={r+"-"+c} style={{position:"absolute",width:18,height:18,top:r?undefined:4,bottom:r?4:undefined,left:c?undefined:4,right:c?4:undefined,borderTop:r?"none":"2px solid white",borderBottom:r?"2px solid white":"none",borderLeft:c?"none":"2px solid white",borderRight:c?"2px solid white":"none",pointerEvents:"none"}}/>)}
      </div>
      <div style={{width:"100%"}}>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:4,fontWeight:600}}>🔍 Zoom</div>
        <input type="range" min={minSc(imgNat.w,imgNat.h)} max={6} step={0.01} value={scale}
          onChange={e=>{const ns=+e.target.value;setScale(ns);setOffset(o=>clamp(o.x,o.y,ns));}} style={{width:"100%",accentColor:T.accent}}/>
      </div>
      <div style={{display:"flex",gap:8,width:"100%"}}>
        <button onClick={onCancel} style={{flex:1,padding:"11px",borderRadius:10,border:`1.5px solid ${T.inputBorder}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Annuler</button>
        <button onClick={confirm} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:T.accent,color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14}}>✓ Valider ce cadrage</button>
      </div>
    </div>
  );
}

// ─── LIENS EDITOR ────────────────────────────────────────────────────────────
function LinksEditor({ links=[], onChange, T, s }) {
  const add = () => onChange([...links, {label:"",url:""}]);
  const upd = (i,f,v) => onChange(links.map((l,idx)=>idx===i?{...l,[f]:v}:l));
  const rem = i => onChange(links.filter((_,idx)=>idx!==i));
  return (
    <div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {links.map((link,i)=>(
          <div key={i} style={{display:"flex",gap:6,alignItems:"center"}}>
            <input value={link.label} onChange={e=>upd(i,"label",e.target.value)} style={{...s.input,width:90,flexShrink:0,fontSize:12}} placeholder="Libellé"/>
            <input value={link.url} onChange={e=>upd(i,"url",e.target.value)} style={{...s.input,flex:1,fontSize:12}} placeholder="https://..."/>
            <button onClick={()=>rem(i)} style={{background:"transparent",border:"none",cursor:"pointer",color:T.danger,fontSize:20,padding:"0 4px",lineHeight:1,flexShrink:0}}>×</button>
          </div>
     