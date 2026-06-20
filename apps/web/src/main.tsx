import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "./lib/Providers";
import { AccessibilityProvider } from "./a11y/AccessibilityContext";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <Providers>
        <App />
      </Providers>
    </AccessibilityProvider>
  </React.StrictMode>,
);
