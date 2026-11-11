import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: "new", label: "Enquiry Submitted", detail: "Your enquiry has reached our team." },
  { id: "review", label: "Under Review", detail: "Our team is reviewing your request." },
  { id: "qualified", label: "Accepted", detail: "Your request has been accepted." },
  { id: "lost", label: "Rejected", detail: "Your request was not accepted." },
  { id: "progress", label: "In Progress", detail: "Work on your service request is underway." },
  { id: "won", label: "Completed", detail: "Your service request has been completed." },
];

function currentStage(status: string) {
  if (status === "lost") return "lost";
  if (status === "won") return "won";
  if (status === "qualified") return "qualified";
  if (["contacted", "proposal_sent", "negotiation"].includes(status)) return "progress";
  return status === "new" ? "new" : "review";
}

export default function EnquiryTracking() {
  const { id = "" } = useParams();
  const [status, setStatus] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!id) return;
    const { data, error: queryError } = await supabase.from("leads").select("id,status,created_at").eq("id", id).maybeSingle();
    if (queryError) { setError("Tracking is temporarily unavailable. Please contact our team with your Enquiry ID."); }
    else if (!data) { setError("Enquiry not found. Please check your Enquiry ID."); }
    else { setStatus(data.status || "new"); setCreatedAt(data.created_at || ""); setError(""); }
    setLoading(false);
  }, [id]);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, [load]);
  const stage = currentStage(status);
  const rejected = stage === "lost";
  const complete = stage === "won";
  const sequence = ["new", "review", "qualified", "progress", "won"];
  const index = sequence.indexOf(stage);
  return <div className="cst-public-page min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-3xl px-4 pb-16 pt-24">
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <p className="text-sm font-semibold text-primary">Crazy SEO Team</p><h1 className="mt-2 text-3xl font-black">Track your enquiry</h1>
      <p className="mt-2 text-sm text-muted-foreground">Live status updates for your submitted service request.</p>
      <div className="mt-6 rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Your Enquiry ID</p><p className="mt-1 break-all font-mono text-sm font-bold">{id}</p></div>
      {loading ? <p className="py-8 text-sm text-muted-foreground">Loading enquiry status…</p> : error ? <p className="py-8 text-sm text-destructive">{error}</p> : <>
        <div className="mt-6 flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Current status</p><p className="mt-1 text-xl font-bold">{steps.find(s => s.id === stage)?.label || "Under Review"}</p></div><button onClick={() => { setLoading(true); void load(); }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={14}/> Refresh</button></div>
        {rejected ? <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"><XCircle className="mt-0.5 text-destructive"/><div><p className="font-semibold">Enquiry Rejected</p><p className="text-sm text-muted-foreground">Our team has rejected this request. Please contact us if you need clarification.</p></div></div> : <div className="mt-7 space-y-5">{sequence.map((step, i) => { const item = steps.find(s => s.id === step)!; const active = i <= index; return <div key={step} className="flex gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i < index || complete ? <CheckCircle2 size={17}/> : <Clock3 size={17}/>}</div><div><p className={`font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</p><p className="text-sm text-muted-foreground">{item.detail}</p></div></div>; })}</div>}
        {createdAt && <p className="mt-6 text-xs text-muted-foreground">Submitted: {new Date(createdAt).toLocaleString()}</p>}
        <p className="mt-4 text-xs text-muted-foreground">This page checks for CRM status changes every 10 seconds.</p>
      </>}
      <Link to="/services" className="mt-7 inline-flex text-sm font-semibold text-primary hover:underline">Back to Solutions</Link>
    </div>
  </main><Footer /></div>;
}
