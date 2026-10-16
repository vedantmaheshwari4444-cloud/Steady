"use client";

import { addDays, todayKey, weekOf } from "./time";
import type { AppState, CheckIn } from "./types";
import { savePhoto } from "./photos";

/** Seeded random so the sample photos look the same every time. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * An illustrated hairline (not a real person) whose coverage grows with `density` (0..1).
 * Used only for the sample user, so the demo works without anyone's photos.
 */
export function sampleHairline(density: number, seed: number): string {
  const r = rng(seed);
  const cx = 300;
  const centerY = 300 + density * 40;
  const templeY = centerY - (1 - density) * 230;
  const hairlineY = (x: number) => {
    const t = Math.min(1, Math.abs(x - cx) / 230);
    return centerY + (templeY - centerY) * t * t;
  };

  const pts: string[] = [];
  for (let x = 40; x <= 560; x += 10) pts.push(`${x},${hairlineY(x).toFixed(1)}`);
  const region = `M40,0 L${pts.join(" L")} L560,0 Z`;

  const strokes: string[] = [];
  const count = Math.round(900 + 2200 * density);
  for (let i = 0; i < count; i++) {
    const x = 40 + r() * 520;
    const yMax = hairlineY(x);
    const y = r() * yMax;
    // fewer, finer hairs right at the hairline
    const nearEdge = yMax - y < 18;
    if (nearEdge && r() > density) continue;
    const len = 10 + r() * 16;
    const ang = -Math.PI / 2 + (x - cx) / 380 + (r() - 0.5) * 0.5;
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    const w = nearEdge ? 0.8 : 1.3 + r() * 0.9;
    strokes.push(`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${w.toFixed(2)}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
<defs>
<radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#ece6dc"/><stop offset="1" stop-color="#cfc7ba"/></radialGradient>
<radialGradient id="skin" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#d8a988"/><stop offset="1" stop-color="#b98667"/></radialGradient>
<clipPath id="head"><ellipse cx="300" cy="500" rx="260" ry="400"/></clipPath>
</defs>
<rect width="600" height="600" fill="url(#bg)"/>
<ellipse cx="300" cy="500" rx="260" ry="400" fill="url(#skin)"/>
<g clip-path="url(#head)">
<path d="${region}" fill="#2a1d17" fill-opacity="${(0.25 + 0.55 * density).toFixed(2)}"/>
<g stroke="#1c120d" stroke-linecap="round">${strokes.join("")}</g>
</g>
<path d="M190 520 Q235 500 275 516" stroke="#5a3a2a" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M325 516 Q365 500 410 520" stroke="#5a3a2a" stroke-width="7" fill="none" stroke-linecap="round"/>
<text x="300" y="585" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#7b7366">Sample illustration</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function loadDemo(): Promise<AppState> {
  const today = todayKey();
  const start = addDays(today, -66);
  const plan = [
    { day: 0, density: 0.35 },
    { day: 14, density: 0.31 },
    { day: 28, density: 0.3 },
    { day: 42, density: 0.42 },
    { day: 56, density: 0.55 },
  ];
  const checkIns: CheckIn[] = [];
  for (const [i, p] of plan.entries()) {
    const id = `demo-${i}`;
    await savePhoto(id, sampleHairline(p.density, 7));
    const dateKey = addDays(start, p.day);
    const date = new Date(`${dateKey}T09:00:00`).toISOString();
    checkIns.push({ id, date, week: weekOf(start, new Date(`${dateKey}T09:00:00`)), angle: "hairline", photoId: id });
  }
  const now = new Date().toISOString();
  checkIns[2].read = {
    photoQuality: "good",
    change: "less_coverage",
    whatISee: "Compared with your first photo, the temples look slightly thinner and the front looks a little sparser.",
    verdict: "too_early_to_tell",
    why: "Week 5 sits in the shedding phase. A small dip here is common with minoxidil and usually comes before regrowth.",
    nextStep: "Keep the routine steady. Your next photo in 2 weeks will show whether the shedding is easing.",
    source: "sample",
    createdAt: now,
  };
  checkIns[4].read = {
    photoQuality: "good",
    change: "more_coverage",
    whatISee: "Compared with your first photo, both temples look fuller and the fine hairs along the front edge are more visible. Angle and light match well.",
    verdict: "on_track",
    why: "At week 9 the shedding phase is ending, and small gains at the front are what usually shows first. The crown typically follows later.",
    nextStep: "Keep going, and take your next hairline photo in about 2 weeks.",
    source: "sample",
    createdAt: now,
  };

  const routine: Record<string, string[]> = {};
  for (let d = 1; d <= 12; d++) {
    if (d === 4 || d === 9) continue;
    routine[addDays(today, -d)] = ["minox-am", "minox-pm", "gummy"];
  }
  routine[today] = ["minox-am", "gummy"];

  return {
    profile: { concern: "hair", stage: 2, products: ["minoxidil", "gummies", "shampoo", "roller"], startDate: start },
    checkIns,
    routine,
    demo: true,
    stayCommitments: 0,
  };
}
