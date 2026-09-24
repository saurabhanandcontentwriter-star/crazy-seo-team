import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { CalendarDays } from "lucide-react";
import App from "./App.tsx";
import "./index.css";
import AppErrorBoundary from "./components/AppErrorBoundary.tsx";

// Compatibility guard for older/lazily-loaded ANVYA chunks.
(globalThis as typeof globalThis & { CalendarDays?: typeof CalendarDays }).CalendarDays = CalendarDays;

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </HelmetProvider>,
);
