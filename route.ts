/**
 * AI progress read: compares a baseline photo with a newer one using Google's Gemini API.
 * The API key stays on the server (Vercel environment variable GEMINI_API_KEY).
 * Photos are sent to Gemini for this one request and not stored by this app.
 */

const MAX_IMAGE_CHARS = 3_000_000; // ~2.2 MB of base64 per photo
const DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash"];

interface Body {
  baseline: string;
  current: string;
  context: {
    concern: "hair" | "beard";
    stage: number;
    angle: string;
    baselineWeek: number;
    currentWeek: number;
    phaseName: string;
    phaseNormal: string[];
    products: string[];
  };
}

function splitDataUrl(url: unknown): { mimeType: string; data: string } | null {
  if (typeof url !== "string" || url.length > MAX_IMAGE_CHARS) return null;
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(url);
  return m ? { mimeType: m[1], data: m[2] } : null;
}

const schema = {
  type: "OBJECT",
  properties: {
    photo_quality: { type: "STRING", enum: ["good", "retake"] },
    retake_reason: { type: "STRING" },
    change: { type: "STRING", enum: ["more_coverage", "no_clear_change", "less_coverage", "cannot_tell"] },
    what_i_see: { type: "STRING" },
    verdict: { type: "STRING", enum: ["on_track", "too_early_to_tell", "worth_a_doctor_check"] },
    why: { type: "STRING" },
    next_step: { type: "STRING" },
  },
  required: ["photo_quality", "change", "what_i_see", "verdict", "why", "next_step"],
};

function prompt(c: Body["context"]): string {
  const area = c.concern === "hair" ? "scalp and hair" : "beard area";
  return `You help someone on a ${c.concern} regrowth treatment understand their progress from two photos of the same ${area} (view: ${c.angle}).
Photo A is the baseline, taken in week ${c.baselineWeek}. Photo B was taken in week ${c.currentWeek}.
Their self-reported starting point: stage ${c.stage}. Products: ${c.products.join(", ") || "not given"}.
They are now in the "${c.phaseName}" phase. What is normal in this phase: ${c.phaseNormal.join(" ")}

Do this:
1. Check that the two photos are comparable: same area, similar angle, distance and lighting, hair dry, the ${area} clearly visible. If they are not comparable, set photo_quality to "retake" and give one short, practical retake_reason. Still fill the other fields as best you can, using "cannot_tell" for change.
2. In what_i_see, describe visible differences between A and B in coverage, density, hairline or fine new hairs, in at most 2 short sentences. If a difference could come from lighting, angle or hair length, say so.
3. Choose verdict:
   - "on_track": visible improvement, or holding steady after week 12.
   - "too_early_to_tell": before week 12 with no clear change, or a small dip that fits the shedding phase, or photos too different to judge.
   - "worth_a_doctor_check": clear worsening after week 12 beyond what the phase explains, or anything that looks like a skin problem (redness, rash, sores, scaling patches).
4. why: one sentence linking the verdict to their week and phase.
5. next_step: one practical sentence (for example: keep the routine, retake the photo in better light, or book a consult).

Rules: you are not giving medical advice. Never diagnose, name diseases, or suggest changing, starting or stopping any medicine or dose. Don't promise results. Use simple, warm, plain English for someone who may be anxious. Talk to the person as "you". Don't mention that you are an AI.`;
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({ error: "not_configured", message: "AI reads aren't switched on for this site yet." }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "bad_request", message: "Invalid request." }, { status: 400 });
  }
  const a = splitDataUrl(body.baseline);
  const b = splitDataUrl(body.current);
  if (!a || !b || !body.context) {
    return Response.json({ error: "bad_request", message: "Two photos (JPEG or PNG) are needed." }, { status: 400 });
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt(body.context) },
          { text: "Photo A (baseline):" },
          { inlineData: a },
          { text: "Photo B (latest):" },
          { inlineData: b },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema: schema },
  };

  const models = [process.env.GEMINI_MODEL, ...DEFAULT_MODELS].filter((m): m is string => !!m);
  const headers = { "Content-Type": "application/json", "x-goog-api-key": key };
  let lastError = "The AI service didn't respond.";

  // 1) generateContent (fully supported). 2) If that fails, the newer Interactions API.
  const attempts: { label: string; run: (model: string) => Promise<Response> }[] = [
    {
      label: "generateContent",
      run: (model) =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }),
    },
    ...["v1beta2", "v1beta"].map((version) => ({
      label: `interactions ${version}`,
      run: (model: string) =>
        fetch(`https://generativelanguage.googleapis.com/${version}/interactions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            input: [
              { type: "text", text: prompt(body.context) },
              { type: "text", text: "Photo A (baseline):" },
              { type: "image", mime_type: a.mimeType, data: a.data },
              { type: "text", text: "Photo B (latest):" },
              { type: "image", mime_type: b.mimeType, data: b.data },
            ],
            response_format: { type: "text", mime_type: "application/json", schema: lowercaseSchema(schema) },
          }),
        }),
    })),
  ];

  for (const attempt of attempts) {
    for (const model of models) {
      let res: Response;
      try {
        res = await attempt.run(model);
      } catch {
        lastError = "Couldn't reach the AI service.";
        continue;
      }
      if (res.status === 429) {
        return Response.json({ error: "busy", message: "The AI is busy or the free quota is used up. Try again in a minute." }, { status: 429 });
      }
      if (!res.ok) {
        lastError = `AI service error (${res.status}, ${attempt.label}, ${model}).`;
        continue;
      }
      const text = extractText(await res.json().catch(() => null));
      const read = text ? toRead(text) : null;
      if (read) return Response.json(read);
      lastError = "The AI answer couldn't be read.";
    }
  }
  console.error("analyze failed:", lastError);
  return Response.json({ error: "failed", message: lastError }, { status: 502 });
}

/** Text from either API's response shape. */
function extractText(json: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j = json as any;
  const gc = j?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
  if (gc) return gc;
  const steps = Array.isArray(j?.steps) ? j.steps.filter((s: { type?: string }) => s.type === "model_output") : [];
  const last = steps[steps.length - 1];
  const txt = last?.content?.filter((c: { type?: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  if (txt) return txt;
  if (typeof j?.output_text === "string") return j.output_text;
  return null;
}

const VERDICTS = ["on_track", "too_early_to_tell", "worth_a_doctor_check"];
const CHANGES = ["more_coverage", "no_clear_change", "less_coverage", "cannot_tell"];

function toRead(text: string) {
  try {
    const r = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    if (!r.what_i_see) return null;
    return {
      photoQuality: r.photo_quality === "retake" ? "retake" : "good",
      retakeReason: r.retake_reason || undefined,
      change: CHANGES.includes(r.change) ? r.change : "cannot_tell",
      whatISee: String(r.what_i_see),
      verdict: VERDICTS.includes(r.verdict) ? r.verdict : "too_early_to_tell",
      why: String(r.why ?? ""),
      nextStep: String(r.next_step ?? ""),
      source: "ai",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** The Interactions API uses JSON Schema with lowercase type names. */
function lowercaseSchema(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(lowercaseSchema);
  if (x && typeof x === "object") {
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [k, k === "type" && typeof v === "string" ? v.toLowerCase() : lowercaseSchema(v)]),
    );
  }
  return x;
}
