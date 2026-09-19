import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "cst_session_id";
const GEO_KEY = "cst_geo";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function parseUA(ua: string) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  let os = "Other";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return { device, browser, os };
}

async function getPreciseLocation() {\n  if (!navigator.geolocation) return null;\n  return new Promise<{ latitude:number; longitude:number; accuracy:number } | null>((resolve) => {\n    navigator.geolocation.getCurrentPosition(\n      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }),\n      () => resolve(null),\n      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 },\n    );\n  });\n}\n\nasync function getGeo() {
  const cached = sessionStorage.getItem(GEO_KEY);
  if (cached) return JSON.parse(cached);
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    const geo = {
      country: data.country_name ?? null,
      country_code: data.country_code ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
    };
    sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
    return geo;
  } catch {
    return null;
  }
}

export const useVisitorTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith("/admin")) return;

    let cancelled = false;
    (async () => {
      const ua = navigator.userAgent;
      const { device, browser, os } = parseUA(ua);
      const geo = await getGeo();
      if (cancelled) return;
      await supabase.from("page_views").insert({
        session_id: getSessionId(),
        path: location.pathname,
        referrer: document.referrer || null,
        country: geo?.country ?? null,
        country_code: geo?.country_code ?? null,
        region: geo?.region ?? null,
        city: geo?.city ?? null,
        device,
        browser,
        os,
        user_agent: ua.slice(0, 500),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);
};

export const logToolUsage = (toolName: string) => {
  const sessionId = getSessionId();
  return supabase.from("tool_usage").insert({ tool_name: toolName, session_id: sessionId });
};
