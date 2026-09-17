import { Navigate } from "react-router-dom";

/** Classified posting is intentionally open: no login or profile gate. */
export default function ClassifiedProfileGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
