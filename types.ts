export type Concern = "hair" | "beard";
export type Stage = 1 | 2 | 3 | 4;

export type Angle = "hairline" | "crown" | "beard-left" | "beard-right";

export interface Profile {
  concern: Concern;
  stage: Stage;
  products: string[];
  startDate: string; // YYYY-MM-DD
}

export type Verdict = "on_track" | "too_early_to_tell" | "worth_a_doctor_check";
export type Change = "more_coverage" | "no_clear_change" | "less_coverage" | "cannot_tell";

export interface AiRead {
  photoQuality: "good" | "retake";
  retakeReason?: string;
  change: Change;
  whatISee: string;
  verdict: Verdict;
  why: string;
  nextStep: string;
  source: "ai" | "sample";
  createdAt: string;
}

export interface CheckIn {
  id: string;
  date: string; // ISO
  week: number;
  angle: Angle;
  photoId: string;
  read?: AiRead; // AI read comparing this photo to the first photo of the same angle
}

export interface AppState {
  profile: Profile | null;
  checkIns: CheckIn[];
  routine: Record<string, string[]>; // date -> done routine item ids
  demo: boolean;
  stayCommitments: number;
}

export const emptyState: AppState = {
  profile: null,
  checkIns: [],
  routine: {},
  demo: false,
  stayCommitments: 0,
};
