import { useState } from "react";

/** Copies text to the clipboard with an animated, screen-reader-announced confirm. */
export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      className="btn-quiet"
      onClick={onCopy}
      style={copied ? { color: "rgb(var(--positive))" } : undefined}
    >
      <span key={copied ? "y" : "n"} aria-hidden="true" className="animate-pop inline-block">
        {copied ? "✓" : "⧉"}
      </span>
      <span>{copied ? "Copied" : label}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
