export type ClassifiedMedia = { id: string; kind: "photo" | "video"; name: string; type: string; size: number };
export type ClassifiedListing = { id: string; title: string; description: string; category: string; price: string; location: string; seller: string; phone: string; photos: ClassifiedMedia[]; video?: ClassifiedMedia; createdAt: string };
const DB="crazy-classified-media", STORE="files";
const openDb=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
export const saveMedia=async(listingId:string,files:File[])=>{const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");files.forEach((f,i)=>tx.objectStore(STORE).put(f,`${listingId}-${i}-${f.name}`));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()};
export const getMedia=async(key:string)=>{const db=await openDb();return await new Promise<File|null>((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})};
export const saveListing=(listing:ClassifiedListing)=>{localStorage.setItem(`crazy-classified:${listing.id}`,JSON.stringify(listing));localStorage.setItem("crazy-classified:last",listing.id)};
export const getListing=(id:string):ClassifiedListing|null=>{try{return JSON.parse(localStorage.getItem(`crazy-classified:${id}`)||"null")}catch{return null}};
