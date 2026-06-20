import { Modal } from "../components/Modal";
import { Segmented } from "../components/Segmented";
import { useA11y } from "./AccessibilityContext";

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div>
        <div className="font-medium">{title}</div>
        {hint && <div className="text-sm text-muted">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

export function AccessibilityPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const a11y = useA11y();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Accessibility & comfort"
      footer={
        <>
          <button className="btn-ghost" onClick={a11y.reset}>
            Reset
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <p className="mb-2 text-sm text-muted">
        Set this up however feels calm for you. Changes apply instantly and are
        remembered on this device.
      </p>

      <div className="divide-y divide-border">
        <Row title="Theme" hint="Lower glare or maximise contrast.">
          <Segmented
            label="Theme"
            value={a11y.theme}
            onChange={(v) => a11y.set("theme", v)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "contrast", label: "High contrast" },
            ]}
          />
        </Row>

        <Row title="Reading font" hint="Atkinson Hyperlegible aids many readers.">
          <Segmented
            label="Reading font"
            value={a11y.font}
            onChange={(v) => a11y.set("font", v)}
            options={[
              { value: "default", label: "Default" },
              { value: "dyslexia", label: "Hyperlegible" },
            ]}
          />
        </Row>

        <Row title="Text size">
          <Segmented
            label="Text size"
            value={a11y.textSize}
            onChange={(v) => a11y.set("textSize", v)}
            options={[
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
            ]}
          />
        </Row>

        <Row title="Motion" hint="Reduce animations and transitions.">
          <Segmented
            label="Motion"
            value={a11y.motion}
            onChange={(v) => a11y.set("motion", v)}
            options={[
              { value: "full", label: "Full" },
              { value: "reduced", label: "Reduced" },
            ]}
          />
        </Row>

        <Row title="Reading focus" hint="Dim distractions around result cards.">
          <Segmented
            label="Reading focus"
            value={a11y.ruler ? "on" : "off"}
            onChange={(v) => a11y.set("ruler", v === "on")}
            options={[
              { value: "off", label: "Off" },
              { value: "on", label: "On" },
            ]}
          />
        </Row>
      </div>
    </Modal>
  );
}
