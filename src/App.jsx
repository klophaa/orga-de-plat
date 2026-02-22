// === Updated components implementing requested fixes & features ===
// Includes:
// - Dish photo blur + overlay text restored
// - Activity login logging + display
// - Timer with custom minutes input
// - Wheel with manual dish selection
// - PlanSlot drag safety fix

import React, { useState, useEffect, useMemo } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import dayjs from "dayjs";

// =========================
// DISH PHOTO (BLUR FIXED)
// =========================
export function DishPhoto({ form, blur }) {
  const cats = Array.isArray(form.categories)
    ? form.categories
    : form.category
    ? [form.category]
    : [];

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
      <img
        src={form.photo}
        className="w-full h-full object-cover"
        style={{ filter: blur ? "blur(12px)" : "none" }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="text-white font-semibold text-lg">
          {form.name || "Nom du plat"}
        </div>
        <div className="text-white/90 text-xs">{cats.join(" • ")}</div>
      </div>
    </div>
  );
}

// =========================
// FIREBASE LOGIN ACTIVITY
// =========================
export function useLoginActivity(auth, db) {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await addDoc(collection(db, "activity"), {
          type: "login",
          user: user.uid,
          email: user.email,
          time: serverTimestamp(),
        });
      }
    });
    return () => unsub();
  }, [auth, db]);
}

// =========================
// ACTIVITY TAB
// =========================
export function ActivityTab({ db }) {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "activity"), orderBy("time", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setActivity(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db]);

  return (
    <div className="space-y-2">
      {activity
        .filter((a) => a.type === "login")
        .map((a) => (
          <div key={a.id} className="text-sm bg-neutral-800 rounded-xl px-3 py-2">
            <div className="font-medium">{a.email}</div>
            <div className="text-neutral-400 text-xs">
              connecté à {a.time ? dayjs(a.time.toDate()).format("HH:mm") : "..."}
            </div>
          </div>
        ))}
    </div>
  );
}

// =========================
// TIMER MODAL
// =========================
export function TimerModal({ onStart }) {
  const [customMin, setCustomMin] = useState("");

  return (
    <div className="p-4 space-y-3">
      <div className="text-lg font-semibold">Minuteur</div>

      <div className="flex gap-2">
        {[5, 10, 15, 20, 30].map((m) => (
          <button
            key={m}
            className="px-3 py-1 rounded-lg bg-neutral-800"
            onClick={() => onStart(m)}
          >
            {m} min
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="number"
          min="1"
          placeholder="minutes"
          className="w-20 px-2 py-1 rounded-lg bg-neutral-800"
          value={customMin}
          onChange={(e) => setCustomMin(e.target.value)}
        />
        <button
          className="px-3 py-1 rounded-lg bg-emerald-600 text-white"
          onClick={() => customMin && onStart(Number(customMin))}
        >
          OK
        </button>
      </div>
    </div>
  );
}

// =========================
// PLAN SLOT SAFE DRAG
// =========================
export function PlanSlot({ slot, currentWeekPlan, dishes, setDragItem }) {
  const [over, setOver] = useState(false);

  const entry = currentWeekPlan[slot];
  const dish = entry ? dishes.find((d) => d.id === entry.id) : null;
  const display = dish || null;

  if (!display) return <div className="h-16 bg-neutral-900 rounded-xl" />;

  return (
    <div
      className={`h-16 rounded-xl ${over ? "bg-emerald-900" : "bg-neutral-800"}`}
      draggable
      onDragStart={() => setDragItem({ slot, dish })}
      onDragOver={(e) => {
        e.preventDefault();
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={() => setOver(false)}
    >
      <div className="px-2 py-1 text-sm">{dish.name}</div>
    </div>
  );
}

// =========================
// WHEEL WITH SELECTION
// =========================
export function Wheel({ dishes, filtered }) {
  const [wheelSelection, setWheelSelection] = useState([]);
  const [result, setResult] = useState(null);

  const wheelDishes = useMemo(() => {
    if (wheelSelection.length > 0) {
      return dishes.filter((d) => wheelSelection.includes(d.id));
    }
    return filtered;
  }, [wheelSelection, dishes, filtered]);

  function spin() {
    if (!wheelDishes.length) return;
    const pick = wheelDishes[Math.floor(Math.random() * wheelDishes.length)];
    setResult(pick);
  }

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Roue</div>

      <div className="max-h-40 overflow-auto grid grid-cols-2 gap-1">
        {dishes.map((d) => {
          const active = wheelSelection.includes(d.id);
          return (
            <div
              key={d.id}
              onClick={() =>
                setWheelSelection((prev) =>
                  active ? prev.filter((x) => x !== d.id) : [...prev, d.id]
                )
              }
              className={`px-2 py-1 rounded-lg cursor-pointer text-sm ${
                active ? "bg-emerald-600 text-white" : "bg-neutral-800"
              }`}
            >
              {d.name}
            </div>
          );
        })}
      </div>

      <button className="px-4 py-2 rounded-xl bg-emerald-600" onClick={spin}>
        Lancer
      </button>

      {result && (
        <div className="text-center text-lg font-semibold">{result.name}</div>
      )}
    </div>
  );
}
