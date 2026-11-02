import { useEffect, useState } from "react";
import { KeyRound, Pencil, Save, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/crm/CrmUI";
import { fetchTeam, saveTeamMemberAuth, type TeamMember } from "@/lib/crm";
import { toast } from "sonner";

type CredentialForm = { name:string; email:string; login_id:string; password:string; position:string };
const emptyForm:CredentialForm={name:"",email:"",login_id:"",password:"",position:"Employee"};

export default function CrmHrEmployeeAccess() {
  const [form,setForm]=useState<CredentialForm>(emptyForm);
  const [members,setMembers]=useState<TeamMember[]>([]);
  const [editing,setEditing]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const update=(key:keyof CredentialForm,value:string)=>setForm(v=>({...v,[key]:value}));
  const load=async()=>{setLoading(true);try{setMembers(await fetchTeam());}catch(e:any){toast.error(e?.message||"Could not load employee accounts.");}finally{setLoading(false);}};
  useEffect(()=>{void load();},[]);
  const startEdit=(m:TeamMember)=>{setEditing(m.id);setForm({name:m.name,email:m.email,login_id:m.login_id||"",password:"",position:m.position||"Employee"});};
  const cancelEdit=()=>{setEditing(null);setForm(emptyForm);};
  const submit=async()=>{
    if(!form.name.trim()||!form.email.trim()||!form.login_id.trim()) return toast.error("Name, email and Employee ID are required.");
    if(form.password&&form.password.length<8) return toast.error("New password must be at least 8 characters.");
    if(!editing&&!form.password) return toast.error("Password is required for a new employee.");
    setSaving(true);
    try{
      await saveTeamMemberAuth({...(editing?{id:editing}:{}),name:form.name.trim(),email:form.email.trim(),login_id:form.login_id.trim(),password:form.password||undefined,position:form.position.trim()||"Employee",status:"active",working_days:["Mon","Tue","Wed","Thu","Fri"],working_hours:"10:00 - 19:00"});
      toast.success(editing?"Employee ID / password updated.":"Employee account created.");
      cancelEdit(); await load();
    }catch(e:any){toast.error(e?.message||"Could not save employee login.");}
    finally{setSaving(false);}
  };
  return <div className="space-y-4">
    <GlassCard className="p-5">
      <div className="flex items-center gap-2"><KeyRound size={20} className="text-primary"/><div><p className="text-lg font-black">Employee ID & Password</p><p className="text-xs text-muted-foreground">Create new login credentials or edit an existing employee's ID and password. Leave password blank to keep the current password.</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold">Employee name<Input value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Full name" className="mt-1"/></label>
        <label className="text-xs font-semibold">Employee email<Input type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="employee@company.com" className="mt-1"/></label>
        <label className="text-xs font-semibold">Employee ID / Login ID<Input value={form.login_id} onChange={e=>update("login_id",e.target.value)} placeholder="e.g. CST-001" className="mt-1"/></label>
        <label className="text-xs font-semibold">{editing?"New password (optional)":"Create password"}<Input type="password" autoComplete="new-password" value={form.password} onChange={e=>update("password",e.target.value)} placeholder={editing?"Blank = keep current password":"At least 8 characters"} className="mt-1"/></label>
        <label className="text-xs font-semibold sm:col-span-2">Designation<Input value={form.position} onChange={e=>update("position",e.target.value)} placeholder="Employee" className="mt-1"/></label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button onClick={submit} disabled={saving} className="rounded-xl">{editing?<Save size={15} className="mr-2"/>:<UserPlus size={15} className="mr-2"/>}{saving?"Saving…":editing?"Save Login Changes":"Create Employee Login"}</Button>{editing&&<Button type="button" variant="outline" onClick={cancelEdit} disabled={saving} className="rounded-xl"><X size={15} className="mr-1"/>Cancel</Button>}</div>
      <p className="mt-3 text-xs text-muted-foreground">Employee login page: /admin/crm/login · Password is never displayed; set a new one to replace it.</p>
    </GlassCard>
    <GlassCard className="p-5">
      <p className="font-black text-lg">Existing Employee Accounts</p>
      {loading?<p className="mt-3 text-sm text-muted-foreground">Loading employees…</p>:<div className="mt-3 space-y-2">{members.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"><div className="min-w-0"><p className="font-bold">{m.name}</p><p className="text-xs text-muted-foreground">{m.login_id||"No Employee ID"} · {m.email}</p></div><Button size="sm" variant="outline" className="rounded-xl" onClick={()=>startEdit(m)}><Pencil size={14} className="mr-1"/>Edit ID / Password</Button></div>)}{!members.length&&<p className="py-4 text-sm text-muted-foreground">No employee accounts found.</p>}</div>}
    </GlassCard>
  </div>;
}
