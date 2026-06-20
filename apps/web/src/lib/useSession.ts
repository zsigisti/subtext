import { trpc } from "./trpc";

/** Convenience wrapper around the current-user query. */
export function useSession() {
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 60_000 });
  return {
    user: me.data ?? null,
    isLoading: me.isLoading,
    isLoggedIn: !!me.data,
    refetch: me.refetch,
  };
}
