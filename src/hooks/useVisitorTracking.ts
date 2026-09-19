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

async function getPreciseLocation() {
  if (!navigator.geolocation) return null;
  return new Promise<{ latitude: number; longitude: number; accuracy: number } | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy: p.coords.accuracy,
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

async function getGeo() {
  const cached = sessionStorage.getItem(GEO_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch { sessionStorage.removeItem(GEO_KEY); }
  }
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
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
    if (location.pathname.startsWith("/admin")) return;
    let cancelled = false;

    const record = async (heartbeat = false) => {
      const ua = navigator.userAgent;
      const { device, browser, os } = parseUA(ua);
      const [precise, geo] = await Promise.all([getPreciseLocation(), getGeo()]);
      if (cancelled) return;

      const { error } = await supabase.from("page_views").insert({
        session_id: getSessionId(),
        path: location.pathname,
        referrer: document.referrer || null,
        country: geo?.country ?? null,
        country_code: geo?.country_code ?? null,
        region: geo?.region ?? null,
        city: geo?.city ?? null,
        latitude: precise?.latitude ?? null,
        longitude: precise?.longitude ?? null,
        location_accuracy_m: precise?.accuracy ?? null,
        device,
        browser,
        os,
        user_agent: ua.slice(0, 500),
        is_heartbeat: heartbeat,
      });

      if (error) console.warn("Visitor tracking:", error.message);
    };

    void record(false);

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") void record(true);
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
    };
  }, [location.pathname]);
};
