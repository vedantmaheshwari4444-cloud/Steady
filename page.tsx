"use client";

import { useState } from "react";
import { AppShell, Tone } from "@/components/ui";
import { DOCTOR_URL, LEVEL_META, LEVEL_ORDER, SYMPTOMS, usesMinoxidil, type Level } from "@/lib/content";
import { weekOf } from "@/lib/time";
import type { AppState } from "@/lib/types";

export default function SymptomsPage() {
  return <AppShell>{(s) => <Symptoms state={s} />}</AppShell>;
}

function Symptoms({ state }: { state: AppState }) {
  const profile = state.profile!;
  const week = weekOf(profile.startDate);
  const ctx = { week, minox: usesMinoxidil(profile), products: profile.products };
  const options = SYMPTOMS.filter((s) => s.concern === "both" || s.concern === profile.concern);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const results = options.filter((o) => picked.includes(o.id)).map((o) => ({ symptom: o, ...o.assess(ctx) }));
  const top: Level = results.reduce<Level>((acc, r) => (LEVEL_ORDER.indexOf(r.level) > LEVEL_ORDER.indexOf(acc) ? r.level : acc), "normal");
  results.sort((a, b) => LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level));

  const banner = {
    normal: { cls: "bg-good-soft text-good", title: "This sounds normal for week " + week, body: "Keep your routine going and keep taking check-in photos." },
    try: { cls: "bg-watch-soft text-watch", title: "Usually manageable. Try this first", body: "These are common. Small changes often help. Don't stop your treatment because of them." },
    doctor: { cls: "bg-alert-soft text-alert", title: "Worth talking to a doctor", body: "Not an emergency, but a doctor should hear about this. Don't change doses on your own." },
    urgent: { cls: "bg-alert text-white", title: "Get medical help now", body: "Call emergency services (112 in India) or go to the nearest hospital." },
  }[top];

  return (
    <>
      <h1 className="font-display text-3xl">Is this normal?</h1>
      <p className="text-sm text-ink-soft mt-1">You&apos;re in week {week}. Tap everything you&apos;ve noticed.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            className="chip"
            aria-pressed={picked.includes(o.id)}
            onClick={() => {
              setChecked(false);
              setPicked((p) => (p.includes(o.id) ? p.filter((x) => x !== o.id) : [...p, o.id]));
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      <button className="btn btn-primary w-full mt-6" disabled={picked.length === 0} onClick={() => setChecked(true)}>
        Check
      </button>

      {checked && results.length > 0 && (
        <section className="mt-6" aria-live="polite">
          <div className={`rounded-[20px] p-5 ${banner.cls}`}>
            <p className="font-semibold">{banner.title}</p>
            <p className="text-sm mt-1 leading-relaxed opacity-90">{banner.body}</p>
          </div>

          <div className="mt-4 space-y-3">
            {results.map((r) => (
              <div key={r.symptom.id} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{r.symptom.label}</h3>
                  <Tone tone={LEVEL_META[r.level].tone}>{LEVEL_META[r.level].label}</Tone>
                </div>
                <p className="text-sm mt-2 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>

          {(top === "doctor" || top === "urgent") && (
            <a href={DOCTOR_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full mt-5">
              Book a doctor consult
            </a>
          )}
        </section>
      )}

      <p className="mt-8 text-xs text-ink-soft leading-relaxed">
        This check gives general guidance based on your week of treatment. It isn&apos;t a diagnosis. If something feels seriously wrong, get
        medical help right away.
      </p>
    </>
  );
}
