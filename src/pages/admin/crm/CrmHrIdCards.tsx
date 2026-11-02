import { useEffect, useMemo, useState } from "react";
import { Download, IdCard, Printer, QrCode, Save, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Member = { id:string; auth_user_id:string|null; name:string; email:string; login_id:string|null; position:string|null };
type Profile = { user_id:string; joining_date:string|null; designation:string|null; department:string|null };
type CardData = { user_id:string; employee_name:string; employee_id:string; designation:string; department:string; email:string; phone:string; joining_date:string; photo_data_url:string };

const emptyCard=(userId:string):CardData=>({user_id:userId,employee_name:"",employee_id:"",designation:"",department:"",email:"",phone:"",joining_date:"",photo_data_url:""});
const makeQr=(value:string)=>"https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data="+encodeURIComponent(value);

export default function CrmHrIdCards({members,profiles,admin}:{members:Member[];profiles:Profile[];admin:boolean}){
  const [userId,setUserId]=useState("");
  const [card,setCard]=useState<CardData>(emptyCard(""));
  const [saved,setSaved]=useState(false);
  const [busy,setBusy]=useState(false);
  const current=useMemo(()=>members.find(m=>m.auth_user_id===userId),[members,userId]);
  useEffect(()=>{let active=true;(async()=>{
    const {data}=await supabase.auth.getUser(); if(!active||!data.user)return;
    const own=data.user.id; const target=admin?(userId||own):own;
    if(!userId&&admin)setUserId(own);
    const {data:row,error}=await (supabase as any).from("crm_employee_id_cards").select("*").eq("user_id",target).maybeSingle();
    if(!active)return;
    if(row){setCard({...emptyCard(target),...row,joining_date:row.joining_date||""});setSaved(true);}
    else {
      const m=members.find(x=>x.auth_user_id===target); const p=profiles.find(x=>x.user_id===target);
      setCard({...emptyCard(target),employee_name:m?.name||"",employee_id:m?.login_id||"",email:m?.email||"",designation:p?.designation||m?.position||"",department:p?.department||"",joining_date:p?.joining_date||""});setSaved(false);
    }
  })();return()=>{active=false}},[userId,admin,members,profiles]);
  const qrText=useMemo(()=>[
    "CRAZY SEO TEAM - EMPLOYEE ID",
    "Name: "+card.employee_name,
    "Employee ID: "+card.employee_id,
    "Designation: "+card.designation,
    "Department: "+card.department,
    "Email: "+card.email,
    "Phone: "+card.phone,
    "Joining Date: "+card.joining_date
  ].join("\n"),[card]);
  const set=(key:keyof CardData,value:string)=>setCard(c=>({...c,[key]:value}));
  const uploadPhoto=async(file?:File)=>{
    if(!file)return;
    if(!file.type.startsWith("image/"))return toast.error("Image file select karein.");
    if(file.size>8*1024*1024)return toast.error("Photo 8 MB se chhoti honi chahiye.");
    const reader=new FileReader();
    reader.onload=()=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");const scale=Math.min(1,600/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d")?.drawImage(img,0,0,canvas.width,canvas.height);set("photo_data_url",canvas.toDataURL("image/jpeg",.78));};img.src=String(reader.result);};
    reader.readAsDataURL(file);
  };
  const save=async()=>{
    if(!card.user_id||!card.employee_name.trim()||!card.employee_id.trim())return toast.error("Employee name aur ID zaroor bharein.");
    setBusy(true);try{
      const payload={...card,employee_name:card.employee_name.trim(),employee_id:card.employee_id.trim(),updated_at:new Date().toISOString()};
      const {error}=await (supabase as any).from("crm_employee_id_cards").upsert(payload,{onConflict:"user_id"});
      if(error)throw error;setSaved(true);toast.success("Employee ID card save ho gaya.");
    }catch(e:any){toast.error(e?.message||"ID card save nahi hua. SQL migration run karein.");}finally{setBusy(false);}
  };
  const print=()=>{
    const el=document.getElementById("crm-employee-id-card");if(!el)return;
    const w=window.open("","_blank","width=700,height=850");if(!w)return;
    w.document.write('<html><head><title>Employee ID Card</title><style>body{font-family:Arial,sans-serif;padding:30px}.card{width:340px;border:1px solid #ddd;border-radius:18px;overflow:hidden;margin:auto;color:#172033}.head{background:#102c55;color:white;padding:20px;text-align:center}.body{padding:20px;text-align:center}.photo{width:105px;height:105px;border-radius:14px;object-fit:cover;border:3px solid white;margin-top:-5px}.name{font-size:20px;font-weight:bold;margin:10px 0 4px}.muted{color:#64748b;font-size:12px}.details{text-align:left;font-size:12px;line-height:1.8;margin-top:15px}.qr{width:105px;height:105px;margin:12px auto 0;display:block}.foot{background:#f1f5f9;padding:10px;text-align:center;font-size:10px}</style></head><body>'+el.innerHTML+'</body></html>');
    w.document.close();w.focus();w.print();
  };
  const m=current;
  return <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><IdCard/></div><div><h3 className="text-lg font-black">Employee ID Card Generator</h3><p className="text-xs text-muted-foreground">Photo, employee details aur QR code ke saath digital ID banayein.</p></div></div>
      {admin&&<label className="block text-xs font-bold">Employee select karein<select className="mt-1 w-full rounded-xl border bg-background p-3 text-sm" value={userId} onChange={e=>{setUserId(e.target.value);setSaved(false)}}>{members.filter(x=>x.auth_user_id).map(x=><option key={x.id} value={x.auth_user_id!}>{x.name} · {x.login_id||x.email}</option>)}</select></label>}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border p-3"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-muted">{card.photo_data_url?<img src={card.photo_data_url} className="h-full w-full object-cover" alt="Employee"/>:<UserRound className="text-muted-foreground"/>}</div><label className="cursor-pointer"><span className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold"><Upload size={14}/> Photo upload karein</span><input type="file" accept="image/*" className="hidden" onChange={e=>void uploadPhoto(e.target.files?.[0])}/><span className="mt-1 block text-[10px] text-muted-foreground">JPG/PNG, maximum 8 MB</span></label></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {([{key:"employee_name",label:"Employee ka naam"},{key:"employee_id",label:"Employee ID"},{key:"designation",label:"Designation"},{key:"department",label:"Department"},{key:"email",label:"Official email"},{key:"phone",label:"Phone number"},{key:"joining_date",label:"Joining date",type:"date"}] as const).map(f=><label key={f.key} className="text-xs font-bold">{f.label}<Input className="mt-1 rounded-xl" type={"type" in f?f.type:"text"} value={card[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.label}/></label>)}
      </div>
      <Button onClick={()=>void save()} disabled={busy} className="w-full rounded-xl"><Save size={15} className="mr-2"/>{busy?"Saving…":"ID Card Save karein"}</Button>
      <p className="text-[11px] text-muted-foreground">{saved?"Saved ID card. Details badalne ke baad dobara Save karein.":"Save karne par card employee ke account se link ho jayega."}</p>
    </GlassCard>
    <div className="space-y-3">
      <div className="flex items-center gap-2"><QrCode size={18}/><h3 className="font-black">ID Card Preview</h3></div>
      <div id="crm-employee-id-card" className="mx-auto w-full max-w-[360px] overflow-hidden rounded-3xl border bg-white text-slate-900 shadow-xl">
        <div className="bg-gradient-to-r from-slate-950 to-blue-800 px-5 py-5 text-center text-white"><p className="text-[10px] font-bold tracking-[.25em]">CRAZY SEO TEAM</p><p className="mt-1 text-lg font-black">EMPLOYEE ID CARD</p></div>
        <div className="p-5 text-center"><div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow">{card.photo_data_url?<img src={card.photo_data_url} className="h-full w-full object-cover" alt="Employee photo"/>:<div className="flex h-full items-center justify-center text-slate-400"><UserRound size={42}/></div>}</div>
          <p className="mt-3 text-xl font-black">{card.employee_name||"Employee Name"}</p><p className="text-sm font-semibold text-blue-700">{card.designation||"Designation"}</p>
          <div className="mt-4 space-y-1 text-left text-xs"><p><b>Employee ID:</b> {card.employee_id||"—"}</p><p><b>Department:</b> {card.department||"—"}</p><p><b>Email:</b> {card.email||"—"}</p><p><b>Phone:</b> {card.phone||"—"}</p><p><b>Joining:</b> {card.joining_date||"—"}</p></div>
          <img className="qr mx-auto mt-4 h-[112px] w-[112px]" src={makeQr(qrText)} alt="Employee details QR code"/><p className="mt-1 text-[10px] text-slate-500">Scan QR to read employee details</p>
        </div><div className="bg-slate-100 px-4 py-3 text-center text-[10px] font-semibold text-slate-600">If found, please return to Crazy SEO Team</div>
      </div>
      <div className="flex gap-2"><Button variant="outline" onClick={print} className="flex-1 rounded-xl"><Printer size={15} className="mr-2"/>Print / PDF</Button><Button variant="outline" onClick={()=>{const a=document.createElement("a");a.href=makeQr(qrText);a.download="employee-id-qr.png";a.click()}} className="flex-1 rounded-xl"><Download size={15} className="mr-2"/>QR Download</Button></div>
      <p className="text-[11px] text-muted-foreground">QR scan karne par employee ki ID details text ke roop mein dikhegi. QR mein wahi details hain jo card par bhari gayi hain.</p>
    </div>
  </div>;
}
