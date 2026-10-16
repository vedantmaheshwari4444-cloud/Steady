import type { Angle, Concern, Profile, Stage } from "./types";

export interface Product {
  id: string;
  name: string;
  concern: Concern;
  /** Routine items this product adds each day. */
  routine: { id: string; label: string; detail: string; cadence: "daily" | "weekly" | "wash-days" }[];
  isMinoxidil?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "minoxidil",
    name: "Minoxidil 5% solution",
    concern: "hair",
    isMinoxidil: true,
    routine: [
      { id: "minox-am", label: "Minoxidil, morning", detail: "On a dry scalp, the dose your doctor set", cadence: "daily" },
      { id: "minox-pm", label: "Minoxidil, night", detail: "Skip only if your doctor said once a day", cadence: "daily" },
    ],
  },
  {
    id: "minoxifin",
    name: "Minoxidil + Finasteride solution",
    concern: "hair",
    isMinoxidil: true,
    routine: [
      { id: "minoxifin-am", label: "Minoxidil + Finasteride, morning", detail: "On a dry scalp, the dose your doctor set", cadence: "daily" },
      { id: "minoxifin-pm", label: "Minoxidil + Finasteride, night", detail: "Skip only if your doctor said once a day", cadence: "daily" },
    ],
  },
  {
    id: "oral-minox",
    name: "Oral minoxidil tablets",
    concern: "hair",
    isMinoxidil: true,
    routine: [{ id: "oral-minox", label: "Tablet", detail: "As prescribed, same time each day", cadence: "daily" }],
  },
  {
    id: "gummies",
    name: "Biotin hair gummies",
    concern: "hair",
    routine: [{ id: "gummy", label: "Hair gummy", detail: "One a day, after a meal", cadence: "daily" }],
  },
  {
    id: "shampoo",
    name: "Anti-hairfall or anti-dandruff shampoo",
    concern: "hair",
    routine: [{ id: "shampoo", label: "Shampoo", detail: "On wash days", cadence: "wash-days" }],
  },
  {
    id: "roller",
    name: "Derma roller",
    concern: "hair",
    routine: [{ id: "roller", label: "Derma roller", detail: "Once a week, gently; clean it after", cadence: "weekly" }],
  },
  {
    id: "beard-minox",
    name: "Beard minoxidil",
    concern: "beard",
    isMinoxidil: true,
    routine: [{ id: "beard-minox", label: "Beard minoxidil", detail: "On clean, dry skin, the dose your kit says", cadence: "daily" }],
  },
  {
    id: "beard-tablet",
    name: "Beard tablets",
    concern: "beard",
    routine: [{ id: "beard-tablet", label: "Tablet", detail: "After breakfast", cadence: "daily" }],
  },
  {
    id: "beard-gummies",
    name: "Beard gummies",
    concern: "beard",
    routine: [{ id: "beard-gummy", label: "Beard gummy", detail: "One a day", cadence: "daily" }],
  },
  {
    id: "beard-roller",
    name: "Derma roller",
    concern: "beard",
    routine: [{ id: "beard-roller", label: "Derma roller", detail: "Once a week, light pressure", cadence: "weekly" }],
  },
  {
    id: "face-wash",
    name: "Face wash",
    concern: "beard",
    routine: [{ id: "face-wash", label: "Face wash", detail: "Before applying anything", cadence: "daily" }],
  },
];

export const STAGES: Record<Concern, { stage: Stage; title: string; detail: string }[]> = {
  hair: [
    { stage: 1, title: "Stage 1", detail: "More hair on the pillow or comb, no visible thinning yet" },
    { stage: 2, title: "Stage 2", detail: "Hairline starting to recede at the temples" },
    { stage: 3, title: "Stage 3", detail: "Clear thinning at the temples or the crown" },
    { stage: 4, title: "Stage 4+", detail: "Large thin areas on top or at the crown" },
  ],
  beard: [
    { stage: 1, title: "Light patches", detail: "Mostly full, a few thin spots" },
    { stage: 2, title: "Patchy", detail: "Visible gaps on the cheeks or chin" },
    { stage: 3, title: "Very patchy", detail: "Hair in a few areas only" },
    { stage: 4, title: "Barely any", detail: "Little or no beard growth yet" },
  ],
};

export const ANGLES: Record<Concern, { id: Angle; label: string; tip: string; facing: "user" | "environment" }[]> = {
  hair: [
    { id: "hairline", label: "Hairline", tip: "Face the camera, hair pulled back, chin level. Same spot, same light.", facing: "user" },
    { id: "crown", label: "Crown", tip: "Ask someone to shoot the top-back of your head from about 30 cm, or use a mirror.", facing: "environment" },
  ],
  beard: [
    { id: "beard-left", label: "Left side", tip: "Turn your head right so your left cheek faces the camera. Same light each time.", facing: "user" },
    { id: "beard-right", label: "Right side", tip: "Turn your head left so your right cheek faces the camera. Same light each time.", facing: "user" },
  ],
};

export function angleLabel(a: Angle): string {
  for (const list of Object.values(ANGLES)) {
    const found = list.find((x) => x.id === a);
    if (found) return found.label;
  }
  return a;
}

export interface Phase {
  id: string;
  name: string;
  fromWeek: number;
  toWeek: number | null;
  normal: string[];
  watchFor: string;
  keepGoing: string;
}

export function usesMinoxidil(profile: Profile): boolean {
  return profile.products.some((p) => PRODUCTS.find((x) => x.id === p)?.isMinoxidil);
}

export function phasesFor(profile: Profile): Phase[] {
  const minox = usesMinoxidil(profile);
  if (profile.concern === "beard") {
    return [
      {
        id: "start",
        name: "Getting started",
        fromWeek: 1,
        toWeek: 4,
        normal: [
          "Nothing visible yet. Follicles take weeks to respond.",
          minox ? "Mild dryness or flaking where you apply the solution." : "No visible change at all.",
        ],
        watchFor: "Redness or burning that doesn't settle in a few days.",
        keepGoing: "This stretch is about building the habit. Results are not expected yet.",
      },
      {
        id: "fine",
        name: "Fine new hairs",
        fromWeek: 5,
        toWeek: 12,
        normal: [
          "Existing hair may grow faster before new hair shows.",
          "Patches fill last. Fine, light hairs come before thick ones.",
        ],
        watchFor: "Skin irritation after rolling. Skip rolling until it settles.",
        keepGoing: "Many people stop around month 3 because the patches haven't filled. That is usually too early to judge.",
      },
      {
        id: "thicken",
        name: "Hairs thicken",
        fromWeek: 13,
        toWeek: 24,
        normal: ["Fine hairs darken and thicken.", "Progress is uneven. One side can lead the other."],
        watchFor: "Any new symptom that worries you. Use the 'Is this normal?' check.",
        keepGoing: "Compare against your first photo, not yesterday's mirror.",
      },
      {
        id: "maintain",
        name: "Maintain",
        fromWeek: 25,
        toWeek: null,
        normal: ["Results look good. This is the moment people stop too soon."],
        watchFor: "Thinning returning after a break in the routine.",
        keepGoing: "Talk to your doctor before stopping or tapering, so you keep what you've gained.",
      },
    ];
  }
  return [
    {
      id: "start",
      name: "Getting started",
      fromWeek: 1,
      toWeek: 2,
      normal: ["Nothing visible yet.", minox ? "Mild scalp dryness or itching as you adjust to the solution." : "No visible change at all."],
      watchFor: "Redness, burning or rash that doesn't settle.",
      keepGoing: "Results are not expected yet. Focus on doing the routine every day.",
    },
    {
      id: "shed",
      name: minox ? "Shedding phase" : "Settling in",
      fromWeek: 3,
      toWeek: 8,
      normal: minox
        ? [
            "More hair fall than before. Minoxidil pushes out old hairs to make room for new ones.",
            "Dandruff, flaking or a dry scalp. An anti-dandruff shampoo usually helps.",
          ]
        : ["No visible change yet.", "Seasonal hair fall can still happen."],
      watchFor: "Heavy shedding that continues past week 10.",
      keepGoing: minox
        ? "This is the phase that makes people quit. Shedding now usually means the treatment is working."
        : "Supplements work slowly. Judge them after 3 to 4 months, not weeks.",
    },
    {
      id: "early",
      name: "Early signs",
      fromWeek: 9,
      toWeek: 16,
      normal: [
        "Less hair on the pillow and comb.",
        "Fine, short baby hairs near the hairline. The crown usually lags the front.",
      ],
      watchFor: "No change at all in hair fall by week 16. Worth a doctor check.",
      keepGoing: "Changes are small week to week. Your photo timeline shows what the mirror can't.",
    },
    {
      id: "visible",
      name: "Visible change",
      fromWeek: 17,
      toWeek: 24,
      normal: ["Density improves in photos taken at the same angle and light.", "The crown catches up more slowly than the front."],
      watchFor: "Results stalling completely. Ask a doctor whether your plan fits your stage.",
      keepGoing: "Most people judge results at around 6 months of steady use.",
    },
    {
      id: "maintain",
      name: "Maintain",
      fromWeek: 25,
      toWeek: null,
      normal: ["Your hair looks better. This is when people stop too soon."],
      watchFor: "Hair fall returning after missed weeks.",
      keepGoing: minox
        ? "Stopping minoxidil usually brings the hair loss back over the following months. Talk to your doctor before you stop or taper."
        : "Talk to your doctor before stopping, so you keep what you've gained.",
    },
  ];
}

export function currentPhase(profile: Profile, week: number): Phase {
  const phases = phasesFor(profile);
  return phases.find((p) => week >= p.fromWeek && (p.toWeek === null || week <= p.toWeek)) ?? phases[phases.length - 1];
}

export function routineFor(profile: Profile) {
  return PRODUCTS.filter((p) => profile.products.includes(p.id)).flatMap((p) => p.routine);
}

/* ---------- Is this normal? ---------- */

export type Level = "normal" | "try" | "doctor" | "urgent";

export interface Symptom {
  id: string;
  label: string;
  concern: Concern | "both";
  assess: (ctx: { week: number; minox: boolean; products: string[] }) => { level: Level; text: string };
}

export const SYMPTOMS: Symptom[] = [
  {
    id: "shedding",
    label: "More hair fall than before",
    concern: "hair",
    assess: ({ week, minox }) => {
      if (minox && week <= 10)
        return {
          level: "normal",
          text: "Extra shedding in the first 2 to 3 months is expected with minoxidil. Old hairs make way for new ones. Keep going and keep taking check-in photos.",
        };
      if (minox && week <= 16)
        return {
          level: "try",
          text: "Shedding should be easing by now. Keep the routine steady and compare your next check-in with your first photo. If it hasn't eased in 2 weeks, talk to a doctor.",
        };
      return {
        level: "doctor",
        text: "Heavy hair fall at this point isn't the usual pattern. A doctor can check whether your plan fits your stage, or whether something else (like a deficiency) is involved.",
      };
    },
  },
  {
    id: "itch",
    label: "Itchy or flaky scalp, dandruff",
    concern: "hair",
    assess: () => ({
      level: "try",
      text: "Common when starting a solution. Apply it to a fully dry scalp, use an anti-dandruff shampoo on wash days, and don't scratch. If it lasts more than 2 weeks or gets worse, talk to a doctor.",
    }),
  },
  {
    id: "dry",
    label: "Hair feels very dry or rough",
    concern: "hair",
    assess: () => ({
      level: "try",
      text: "Some solutions dry the hair out. A light conditioner on the lengths (not the scalp) helps. Mention it at your next consult, since a different formulation may suit you better. Don't just stop.",
    }),
  },
  {
    id: "rash",
    label: "Redness, rash or burning",
    concern: "both",
    assess: () => ({
      level: "doctor",
      text: "Pause the derma roller and talk to a doctor, especially if it spreads, blisters or doesn't settle in a few days.",
    }),
  },
  {
    id: "roller-irritation",
    label: "Skin sore after derma rolling",
    concern: "both",
    assess: () => ({
      level: "try",
      text: "Roll more gently, skip rolling until the skin settles, and follow your kit's timing for applying solution after rolling. Replace the roller if the needles feel blunt or bent.",
    }),
  },
  {
    id: "acne",
    label: "Breakouts or acne",
    concern: "both",
    assess: () => ({
      level: "try",
      text: "Keep the area clean and avoid touching it. Mention it at your next consult if it continues past a couple of weeks.",
    }),
  },
  {
    id: "unwanted-hair",
    label: "Unwanted hair on face or body",
    concern: "hair",
    assess: ({ products }) => ({
      level: "doctor",
      text: products.includes("oral-minox")
        ? "This is a known effect of oral minoxidil. Talk to your doctor. A dose change often helps, and it's safer than stopping on your own."
        : "Make sure the solution doesn't drip onto your face. Talk to a doctor if it continues.",
    }),
  },
  {
    id: "sexual",
    label: "Lower sex drive or erection changes",
    concern: "both",
    assess: ({ products }) => ({
      level: "doctor",
      text: products.includes("minoxifin")
        ? "Talk to a doctor. This can happen with finasteride, and there are alternatives. Discuss it rather than quietly quitting the whole routine."
        : "Talk to a doctor so they can look at your routine and other possible causes.",
    }),
  },
  {
    id: "mood",
    label: "Low mood that won't lift",
    concern: "both",
    assess: () => ({
      level: "doctor",
      text: "Please talk to a doctor soon. Mention every product you're taking. If you ever feel unsafe, contact local emergency services or a helpline right away.",
    }),
  },
  {
    id: "dizzy",
    label: "Dizziness or light-headedness",
    concern: "both",
    assess: () => ({
      level: "doctor",
      text: "Talk to a doctor soon, especially if you take tablets. Don't change your dose on your own.",
    }),
  },
  {
    id: "swelling",
    label: "Swollen hands, feet or face",
    concern: "both",
    assess: () => ({
      level: "doctor",
      text: "Talk to a doctor soon, and mention any tablets you take.",
    }),
  },
  {
    id: "chest",
    label: "Chest pain, racing heartbeat or fainting",
    concern: "both",
    assess: () => ({
      level: "urgent",
      text: "Stop and get medical help now. Call emergency services (112 in India) or go to the nearest hospital.",
    }),
  },
];

export const LEVEL_META: Record<Level, { label: string; tone: "good" | "watch" | "alert" }> = {
  normal: { label: "Normal for now", tone: "good" },
  try: { label: "Try this first", tone: "watch" },
  doctor: { label: "Talk to a doctor", tone: "alert" },
  urgent: { label: "Get help now", tone: "alert" },
};

export const LEVEL_ORDER: Level[] = ["normal", "try", "doctor", "urgent"];

export const DOCTOR_URL = "https://manmatters.com/";
