"use client";

import { useSyncExternalStore } from "react";
import { emptyState, type AppState } from "./types";

const KEY = "steady.v1";
const listeners = new Set<() => void>();
let cache: AppState | null = null;

function read(): AppState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...emptyState, ...(JSON.parse(raw) as AppState) } : emptyState;
  } catch {
    cache = emptyState;
  }
  return cache;
}

export function getState(): AppState {
  return read();
}

export function setState(update: (s: AppState) => AppState) {
  cache = update(read());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function resetState() {
  setState(() => emptyState);
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns null during server render, the stored state after hydration. */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
