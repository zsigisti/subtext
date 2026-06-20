import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { Modal } from "../../components/Modal";
import { ErrorNote } from "../../components/Notes";

export function AuthModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const utils = trpc.useUtils();
  const done = async () => {
    await utils.auth.me.invalidate();
    onSuccess();
    onClose();
  };

  const login = trpc.auth.login.useMutation({ onSuccess: done });
  const signup = trpc.auth.signup.useMutation({ onSuccess: done });
  const demo = trpc.auth.demoLogin.useMutation({ onSuccess: done });

  const pending = login.isPending || signup.isPending || demo.isPending;
  const error = login.error || signup.error || demo.error;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") login.mutate({ email, password });
    else signup.mutate({ email, password, displayName });
  }

  return (
    <Modal open={open} onClose={onClose} title="Welcome to Subtext">
      <button
        type="button"
        className="btn-primary w-full"
        disabled={pending}
        onClick={() => demo.mutate()}
      >
        <span aria-hidden="true">✨</span> Try a demo account — no signup
      </button>
      <p className="mt-2 text-center text-sm text-muted">
        Preloaded with examples so you can explore instantly.
      </p>

      <div className="my-5 flex items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <div role="tablist" aria-label="Sign in or create account" className="mb-4 flex gap-1 rounded-xl bg-surface-2 p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={[
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium",
              mode === m ? "bg-surface text-ink shadow-sm" : "text-muted",
            ].join(" ")}
            onClick={() => setMode(m)}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <div>
            <label className="label" htmlFor="auth-name">Your name</label>
            <input
              id="auth-name"
              className="field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signup" ? 8 : undefined}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && <ErrorNote>{error.message}</ErrorNote>}

        <button type="submit" className="btn-ghost w-full" disabled={pending}>
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </Modal>
  );
}
