import { supabase } from "@/integrations/supabase/client";

export type ClassifiedMedia = { id: string; kind: "photo" | "video"; name: string; type: string; size: number; url?: string };
export type ClassifiedListing = { id: string; title: string; description: string; category: string; price: string; location: string; seller: string; phone: string; photos: ClassifiedMedia[]; video?: ClassifiedMedia; createdAt: string; source?: "mobile" | "web"; deviceType?: string; latitude?: number | null; longitude?: number | null; slug?: string; status?: string };

const DB = "crazy-classified-media";
const STORE = "files";
const openDb = () => new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });

export const saveMedia = async (listingId: string, files: File[]) => { const db = await openDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, "readwrite"); files.forEach((f, i) => tx.objectStore(STORE).put(f, `${listingId}-${i}-${f.name}`)); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close(); };
export const getMedia = async (key: string) => { const db = await openDb(); return await new Promise<File | null>((resolve, reject) => { const r = db.transaction(STORE).objectStore(STORE).get(key); r.onsuccess = () => resolve(r.result || null); r.onerror = () => reject(r.error); }); };
export const saveListing = (listing: ClassifiedListing) => { localStorage.setItem(`crazy-classified:${listing.id}`, JSON.stringify(listing)); localStorage.setItem("crazy-classified:last", listing.id); };
export const getListing = (id: string): ClassifiedListing | null => { try { return JSON.parse(localStorage.getItem(`crazy-classified:${id}`) || "null"); } catch { return null; } };

const isMissingClassifiedTable = (message = "") => /classified_listings|schema cache|relation.*does not exist/i.test(message);

export const uploadClassifiedMedia = async (listingId: string, files: File[]): Promise<ClassifiedMedia[]> => {
  const uploaded: ClassifiedMedia[] = [];
  for (const file of files) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `classified/${listingId}/${crypto.randomUUID()}-${safe}`;
    let bucket = "classified-media";
    let result = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
    if (result.error && /bucket.*not found|not found/i.test(result.error.message || "")) {
      bucket = "blog-images";
      result = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
    }
    if (result.error) throw result.error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    uploaded.push({ id: path, kind: file.type.startsWith("video/") ? "video" : "photo", name: file.name, type: file.type, size: file.size, url: data.publicUrl });
  }
  return uploaded;
};

export const createLiveListing = async (listing: ClassifiedListing) => {
  const base = { id: listing.id, category: listing.category, title: listing.title, description: listing.description, price: listing.price, location: listing.location, seller_type: listing.seller, phone: listing.phone, photos: listing.photos, video_url: listing.video?.url || null, slug: listing.slug || listing.id, status: "approved", created_at: listing.createdAt, updated_at: listing.createdAt };
  const full = { ...base, source: listing.source || "web", device_type: listing.deviceType || "desktop", latitude: listing.latitude ?? null, longitude: listing.longitude ?? null };
  let result = await (supabase as any).from("classified_listings").insert(full).select().single();
  if (result.error && /source|device_type|latitude|longitude|column/i.test(result.error.message || "")) result = await (supabase as any).from("classified_listings").insert(base).select().single();
  if (result.error) {
    // Production projects that have not received the migration yet should still be able to publish.
    // Persist the complete listing locally and let the UI use it until the database table is available.
    if (isMissingClassifiedTable(result.error.message)) {
      saveListing(listing);
      return listing;
    }
    throw result.error;
  }
  return result.data;
};

const mapListing = (data: any): ClassifiedListing => ({ id: data.id, title: data.title, description: data.description, category: data.category, price: data.price, location: data.location, seller: data.seller_type || "Individual", phone: data.phone, photos: Array.isArray(data.photos) ? data.photos : [], video: data.video_url ? { id: `${data.id}-video`, kind: "video", name: "Listing video", type: "video/mp4", size: 0, url: data.video_url } : undefined, createdAt: data.created_at, source: data.source, deviceType: data.device_type, latitude: data.latitude, longitude: data.longitude, slug: data.slug, status: data.status });

export const getLiveListing = async (idOrSlug: string): Promise<ClassifiedListing | null> => {
  const { data, error } = await (supabase as any).from("classified_listings").select("*").or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).maybeSingle();
  if (!error && data) return mapListing(data);
  return getListing(idOrSlug) || null;
};

export const getLiveListings = async (): Promise<ClassifiedListing[]> => {
  const { data, error } = await (supabase as any).from("classified_listings").select("*").eq("status", "approved").order("created_at", { ascending: false });
  if (!error && data) return data.map(mapListing);

  const local: ClassifiedListing[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (!key.startsWith("crazy-classified:") || key === "crazy-classified:last") continue;
    try {
      const item = JSON.parse(localStorage.getItem(key) || "null");
      if (item?.id) local.push(item);
    } catch { /* ignore malformed local entries */ }
  }
  return local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
