/** Subtext mark: two speech lines meeting — the "double empathy" handshake. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-xl"
      style={{
        width: size,
        height: size,
        backgroundImage:
          "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--accent)))",
        boxShadow: "0 6px 16px -6px rgb(var(--brand) / 0.7)",
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3H8l-3 2.5V12a3 3 0 0 1-2-3Z" opacity="0.95" />
        <path d="M21 16a3 3 0 0 0-3-3" opacity="0.6" />
      </svg>
    </span>
  );
}
