import { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Request = { id:string; user_id:string; email:string; full_name:string|null; status:"pending"|"approved"|"rejected"; created_at:string; };
export default function CrmHrAccessRequests(){
  const [items,setItems]=useState<Request[]>([]);
  const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);try{const {data,error}=await (supabase as any).from("crm_access_requests").select("*").order("created_at",{ascending:false});if(error)throw error;setItems(data||[]);}catch(e:any){toast.error(e?.message||"Access requests could not load");}finally{setLoading(false);}};
  useEffect(()=>{void load();},[]);
  const review=async(item:Request,status:"approved"|"rejected")=>{try{const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please sign in again.");const {error}=await (supabase as any).from("crm_access_requests").update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",item.id).eq("status","pending");if(error)throw error;toast.success(status==="approved"?"Gmail access approved.":"Access request rejected.");await load();}catch(e:any){toast.error(e?.message||"Could not review request");}};
  return <GlassCard className="p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Gmail Access Requests</h2><p className="text-xs text-muted-foreground">Approve a Google account to grant CRM access. HR employee records are not required.</p></div><Button size="sm" variant="outline" onClick={()=>void load()}><RefreshCw size={14} className="mr-1"/>Refresh</Button></div>
  {loading?<p className="py-6 text-sm text-muted-foreground">Loading requests…</p>:<div className="mt-4 space-y-3">{items.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"><div><p className="font-semibold">{item.full_name||"Google user"}</p><p className="text-sm text-muted-foreground">{item.email}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p><p className="mt-1 text-xs font-bold uppercase">{item.status}</p></div>{item.status==="pending"&&<div className="flex gap-2"><Button size="sm" onClick={()=>void review(item,"approved")}><Check size={14} className="mr-1"/>Accept</Button><Button size="sm" variant="destructive" onClick={()=>void review(item,"rejected")}><X size={14} className="mr-1"/>Reject</Button></div>}</div>)}{!items.length&&<p className="py-8 text-center text-sm text-muted-foreground">No Gmail access requests yet.</p>}</div>}</GlassCard>;
}