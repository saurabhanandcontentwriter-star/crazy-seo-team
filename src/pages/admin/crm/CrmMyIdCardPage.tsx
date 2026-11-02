import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CrmHrIdCards from "./CrmHrIdCards";
import { GlassCard } from "@/components/crm/CrmUI";

export default function CrmMyIdCardPage(){
  const [members,setMembers]=useState<any[]>([]);
  const [profiles,setProfiles]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){if(active)setLoading(false);return;}
    const [m,p]=await Promise.all([
      (supabase as any).from("crm_team_members").select("id,auth_user_id,name,email,login_id,position").eq("auth_user_id",user.id).eq("status","active").maybeSingle(),
      (supabase as any).from("crm_employee_profiles").select("id,user_id,joining_date,designation,department").eq("user_id",user.id).maybeSingle()
    ]);
    if(active){setMembers(m.data?[m.data]:[]);setProfiles(p.data?[p.data]:[]);setLoading(false);}
  })();return()=>{active=false}},[]);
  if(loading)return <GlassCard className="p-5"><p className="text-sm text-muted-foreground">Aapka ID card load ho raha hai…</p></GlassCard>;
  return <CrmHrIdCards members={members} profiles={profiles} admin={false}/>;
}
