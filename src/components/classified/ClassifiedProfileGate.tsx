import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

/** Classified posting is intentionally open: no login or profile gate. */
export default function ClassifiedProfileGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
