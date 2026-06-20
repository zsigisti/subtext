import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { useSession } from "../../lib/useSession";
import { AuthModal } from "./AuthModal";

export function AccountMenu({ onNavigateHome }: { onNavigateHome: () => void }) {
  const { user, isLoggedIn } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const utils = trpc.useUtils();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      onNavigateHome();
    },
  });

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted sm:inline">
          Hi, {user.displayName}
        </span>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setAuthOpen(true)}>
        Sign in
      </button>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={onNavigateHome}
      />
    </>
  );
}
