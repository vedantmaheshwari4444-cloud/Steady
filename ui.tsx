"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAppState } from "@/lib/store";
import { loadPhoto } from "@/lib/photos";
import type { AppState } from "@/lib/types";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={small ? 22 : 28} height={small ? 22 : 28} viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="var(--brand)" />
        <path d="M8 20 L13 15 L17 18 L24 10" stroke="#f6f2ea" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`font-display font-semibold ${small ? "text-lg" : "text-2xl"}`}>Steady</span>
    </span>
  );
}

const NAV = [
  { href: "/home", label: "Today", icon: "M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" },
  { href: "/checkin", label: "Check-in", icon: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 100-8 4 4 0 000 8z" },
  { href: "/progress", label: "Progress", icon: "M4 19V5M4 19h16M8 15l3-4 3 2 5-6" },
  { href: "/symptoms", label: "Is this normal?", icon: "M12 21a9 9 0 110-18 9 9 0 010 18zM9.5 9a2.5 2.5 0 114 2c-1 .6-1.5 1.2-1.5 2.2M12 16.5v.5" },
];

/** Wraps every in-app screen: waits for local data, sends new users to setup, adds header and bottom nav. */
export function AppShell({ children }: { children: (state: AppState) => ReactNode }) {
  const state = useAppState();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (state && !state.profile) router.replace("/setup");
  }, [state, router]);

  if (!state || !state.profile) {
    return <div className="min-h-dvh grid place-items-center text-ink-soft text-sm">Loading…</div>;
  }

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-line/70">
        <div className="mx-auto max-w-md px-4 h-14 flex items-center justify-between">
          <Link href="/home" aria-label="Steady home">
            <Logo small />
          </Link>
          <div className="flex items-center gap-2">
            {state.demo && (
              <span className="text-xs font-semibold rounded-full bg-watch-soft text-watch px-2.5 py-1">Sample user</span>
            )}
            <Link href="/about" className="text-sm text-ink-soft underline-offset-4 hover:underline">
              About
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pt-5">{children(state)}</main>
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-card/95 backdrop-blur border-t border-line" aria-label="Main">
        <div className="mx-auto max-w-md grid grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-brand" : "text-ink-soft"}`}
                aria-current={active ? "page" : undefined}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={n.icon} />
                </svg>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PhotoImg({ photoId, alt, className }: { photoId: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    loadPhoto(photoId).then((s) => live && setSrc(s));
    return () => {
      live = false;
    };
  }, [photoId]);
  if (!src) return <div className={`bg-line/60 animate-pulse ${className ?? ""}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className ?? ""}`} />;
}

export function Tone({ tone, children }: { tone: "good" | "watch" | "alert" | "neutral"; children: ReactNode }) {
  const cls = {
    good: "bg-good-soft text-good",
    watch: "bg-watch-soft text-watch",
    alert: "bg-alert-soft text-alert",
    neutral: "bg-brand-soft text-brand",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-3 mt-7">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{children}</h2>
      {aside}
    </div>
  );
}
