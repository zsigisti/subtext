import { useState } from "react";
import { APP } from "@subtext/shared";
import { useSession } from "./lib/useSession";
import { Logo } from "./components/Logo";
import { AccessibilityPanel } from "./a11y/AccessibilityPanel";
import { AccountMenu } from "./features/auth/AccountMenu";
import { DecodeView } from "./features/decode/DecodeView";
import { ComposeView } from "./features/compose/ComposeView";
import { ProfileView } from "./features/profile/ProfileView";
import { LibraryView } from "./features/library/LibraryView";

type View = "decode" | "compose" | "library" | "profile";

const NAV: { id: View; label: string; needsAuth?: boolean }[] = [
  { id: "decode", label: "Decode" },
  { id: "compose", label: "Compose" },
  { id: "library", label: "Library", needsAuth: true },
  { id: "profile", label: "You", needsAuth: true },
];

export function App() {
  const [view, setView] = useState<View>("decode");
  const [a11yOpen, setA11yOpen] = useState(false);
  const { isLoggedIn } = useSession();

  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-calm"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <div>
              <div className="font-semibold leading-tight tracking-tight">{APP.name}</div>
              <div className="text-xs text-muted">{APP.tagline}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setA11yOpen(true)}
              aria-haspopup="dialog"
            >
              <span aria-hidden="true">⚙</span>
              <span className="hidden sm:inline">Accessibility</span>
            </button>
            <AccountMenu onNavigateHome={() => setView("decode")} />
          </div>
        </div>

        <nav aria-label="Primary" className="mx-auto max-w-5xl px-4">
          <ul className="flex gap-1 overflow-x-auto pb-px">
            {NAV.filter((n) => !n.needsAuth || isLoggedIn).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setView(n.id)}
                  aria-current={view === n.id ? "page" : undefined}
                  className={[
                    "relative px-4 py-2.5 text-sm font-medium transition-colors",
                    view === n.id
                      ? "text-brand"
                      : "text-muted hover:text-ink",
                  ].join(" ")}
                >
                  {n.label}
                  {view === n.id && (
                    <span
                      className="animate-fade-in absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                      style={{ backgroundImage: "linear-gradient(90deg, rgb(var(--brand)), rgb(var(--accent)))" }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8">
        {/* key on view => a fresh fade-in each time the tab changes */}
        <div key={view} className="animate-fade-in">
          {view === "decode" && <DecodeView />}
          {view === "compose" && <ComposeView />}
          {view === "library" && <LibraryView />}
          {view === "profile" && <ProfileView />}
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-sm text-muted">
        <div className="card px-5 py-4">
          <p>
            <strong className="font-medium text-ink">{APP.name}</strong> helps
            with communication — it isn't therapy, medical advice, or a
            diagnosis, and it doesn't replace human relationships or
            professional support.
          </p>
          <p className="mt-2">
            Messages are processed to generate a reading and then discarded.
            Nothing is saved unless you choose to save it. This uses Gemini's
            free tier, so please don't paste truly confidential information.
          </p>
        </div>
      </footer>

      <AccessibilityPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />
    </div>
  );
}
