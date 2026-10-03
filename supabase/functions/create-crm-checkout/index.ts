import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(x:any,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...cors,"Content-Type":"application/json"}});
const prices={pro:Deno.env.get("STRIPE_PRO_PRICE_ID")||"",business:Deno.env.get("STRIPE_BUSINESS_PRICE_ID")||""};
Deno.serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});try{
 const auth=req.headers.get("Authorization"); if(!auth)return json({error:"Sign in required."},401);
 const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return json({error:"Sign in required."},401);
 const {plan}=await req.json(); if(!["pro","business"].includes(plan))return json({error:"Invalid plan."},400);
 const price=prices[plan as keyof typeof prices]; const secret=Deno.env.get("STRIPE_SECRET_KEY"); if(!secret||!price)return json({error:"Stripe checkout is not configured yet. Add STRIPE_SECRET_KEY and the plan Price IDs in Supabase secrets."},503);
 const origin=new URL(req.headers.get("origin")||"https://www.crazyseoteam.in").origin;
 const body=new URLSearchParams({mode:"subscription","line_items[0][price]":price,"line_items[0][quantity]":"1","success_url":origin+"/crm/upgrade?session_id={CHECKOUT_SESSION_ID}","cancel_url":origin+"/crm/upgrade","customer_email":user.email||"","metadata[user_id]":user.id,"metadata[plan]":plan});
 const res=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:"Bearer "+secret,"Content-Type":"application/x-www-form-urlencoded"},body});
 const data=await res.json(); if(!res.ok)return json({error:data?.error?.message||"Stripe error."},500); return json({url:data.url});
}catch(e){return json({error:e instanceof Error?e.message:"Checkout failed."},500)}});
