import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(x:any,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});try{
 const auth=req.headers.get("Authorization"); if(!auth)return json({error:"Sign in required."},401);
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
 const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
 const {data:{user}}=await client.auth.getUser(); if(!user)return json({error:"Sign in required."},401);
 const {session_id}=await req.json(); if(!session_id)return json({error:"Missing checkout session."},400);
 const secret=Deno.env.get("STRIPE_SECRET_KEY"); if(!secret)return json({error:"Stripe is not configured."},503);
 const res=await fetch("https://api.stripe.com/v1/checkout/sessions/"+encodeURIComponent(session_id),{headers:{Authorization:"Bearer "+secret}});
 const session=await res.json(); if(!res.ok)return json({error:session?.error?.message||"Stripe verification failed."},500);
 if(session.payment_status!=="paid"||session.metadata?.user_id!==user.id)return json({error:"Payment is not verified yet."},402);
 const plan=session.metadata?.plan; if(!["pro","business"].includes(plan))return json({error:"Invalid paid plan."},400);
 const {error}=await admin.from("public_crm_accounts").update({plan}).eq("user_id",user.id); if(error)return json({error:error.message},500);
 return json({success:true,plan});
}catch(e){return json({error:e instanceof Error?e.message:"Verification failed."},500)}});
