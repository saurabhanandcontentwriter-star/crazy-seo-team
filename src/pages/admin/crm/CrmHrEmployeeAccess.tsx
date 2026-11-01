import { useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/crm/CrmUI";
import { saveTeamMemberAuth } from "@/lib/crm";
import { toast } from "sonner";

export default function CrmHrEmployeeAccess() {
  const [form,setForm]=useState({name:"",email:"",login_id:"",password:"",position:"Employee"});
  const [saving,setSaving]=useState(false);
  const update=(key:keyof typeof form,value:string)=>setForm(v=>({...v,[key]:value}));
  const submit=async()=>{
    if(!form.name.trim()||!form.email.trim()||!form.login_id.trim()||!form.password) return toast.error("Name, email, Employee ID and password are required.");
    if(form.password.length<8) return toast.error("Password must be at least 8 characters.");
    setSaving(true);
    try {
      await saveTeamMemberAuth({name:form.name.trim(),email:form.email.trim(),login_id:form.login_id.trim(),password:form.password,position:form.position.trim()||"Employee",status:"active",working_days:["Mon","Tue","Wed","Thu","Fri"],working_hours:"10:00 - 19:00"});
      toast.success("Employee account created. Employee can now log in with Employee ID and password.");
      setForm({name:"",email:"",login_id:"",password:"",position:"Employee"});
    } catch(e:any) { toast.error(e?.message||"Could not create employee login."); }
    finally { setSaving(false); }
  };
  return <GlassCard className="p-5">
    <div className="flex items-center gap-2"><KeyRound size={20} className="text-primary"/><div><p className="text-lg font-black">Employee Login & Password</p><p className="text-xs text-muted-foreground">HR/Admin can create an employee account and set the first password.</p></div></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold">Employee name<Input value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Full name" className="mt-1"/></label>
      <label className="text-xs font-semibold">Employee email<Input type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="employee@company.com" className="mt-1"/></label>
      <label className="text-xs font-semibold">Employee ID / Login ID<Input value={form.login_id} onChange={e=>update("login_id",e.target.value)} placeholder="e.g. CST-001" className="mt-1"/></label>
      <label className="text-xs font-semibold">Create password<Input type="password" autoComplete="new-password" value={form.password} onChange={e=>update("password",e.target.value)} placeholder="At least 8 characters" className="mt-1"/></label>
      <label className="text-xs font-semibold sm:col-span-2">Designation<Input value={form.position} onChange={e=>update("position",e.target.value)} placeholder="Employee" className="mt-1"/></label>
    </div>
    <Button onClick={submit} disabled={saving} className="mt-4 rounded-xl"><UserPlus size={15} className="mr-2"/>{saving?"Creating account…":"Create Employee Login"}</Button>
    <p className="mt-3 text-xs text-muted-foreground">Login page: /admin/crm/login · Employee ID + password sign-in must be enabled on the deployed backend.</p>
  </GlassCard>;
}
