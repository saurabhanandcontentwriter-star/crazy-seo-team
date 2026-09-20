import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, UserRound, Phone, Mail, History } from "lucide-react";
import { toast } from "sonner";

export default function ClassifiedProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        const db = supabase as any;
        const [p, l] = await Promise.all([
          db.from("classified_profiles").select("*").eq("user_id", auth.user.id).maybeSingle(),
          db.from("classified_listings").select("id,title,category,price,city,state,status,created_at,seller_profile_photo_url").eq("user_id", auth.user.id).order("created_at", { ascending: false })
        ]);
        if (p.error) throw p.error;
        if (l.error) throw l.error;
        setProfile(p.data);
        setPosts(l.data || []);
      } catch (e: any) {
        toast.error(e?.message || "Could not load profile");
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="container mx-auto flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" /></div>;

  if (!profile) return <div className="container mx-auto px-4 py-16 text-center"><Card className="mx-auto max-w-xl"><CardContent className="py-10"><UserRound className="mx-auto mb-4 h-10 w-10 text-muted-foreground"/><h1 className="text-2xl font-bold">Create your classified profile first</h1><p className="my-3 text-muted-foreground">A profile photo and phone number are required before you can publish a post.</p><Button asChild><Link to="/post-ad">Create Profile</Link></Button></CardContent></Card></div>;

  return <div className="container mx-auto px-4 py-8 md:py-12"><div className="grid gap-6 lg:grid-cols-[340px_1fr]"><Card className="h-fit rounded-3xl"><CardContent className="p-6 text-center"><div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border bg-muted flex items-center justify-center">{profile.profile_photo_url ? <img src={profile.profile_photo_url} alt={profile.name} className="h-full w-full object-cover"/> : <UserRound className="h-12 w-12 text-muted-foreground"/>}</div><h1 className="text-2xl font-bold">{profile.name}</h1><p className="mt-1 text-sm text-muted-foreground">Classified Seller Profile</p><div className="mt-5 space-y-3 text-left text-sm"><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary"/>{profile.phone}</div>{profile.email&&<div className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-primary"/>{profile.email}</div>}</div><div className="mt-6 grid gap-2"><Button className="w-full" asChild><Link to="/classified-dashboard">Open Dashboard</Link></Button><Button variant="outline" className="w-full" asChild><Link to="/post-ad"><Plus className="mr-2 h-4 w-4"/>Post New Ad</Link></Button></div></CardContent></Card><section><div className="mb-5 flex items-center justify-between"><div><Badge variant="secondary"><History className="mr-1 h-3 w-3"/>Post History</Badge><h2 className="mt-2 text-2xl font-bold">My Classified Posts</h2><p className="text-sm text-muted-foreground">Your submitted ads and their current moderation status.</p></div></div>{posts.length===0?<Card><CardContent className="py-12 text-center text-muted-foreground">No posts yet. Your published and pending ads will appear here.</CardContent></Card>:<div className="grid gap-4 sm:grid-cols-2">{posts.map(post=><Card key={post.id} className="overflow-hidden"><CardContent className="p-5"><div className="flex gap-4"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted flex items-center justify-center">{post.seller_profile_photo_url||profile.profile_photo_url?<img src={post.seller_profile_photo_url||profile.profile_photo_url} alt="" className="h-full w-full object-cover"/>:<UserRound className="h-6 w-6"/>}</div><div className="min-w-0 flex-1"><h3 className="font-semibold line-clamp-2">{post.title}</h3><p className="mt-1 text-sm text-muted-foreground">{post.city||"India"}{post.state?`, ${post.state}`:""}</p><div className="mt-3 flex items-center justify-between gap-2"><Badge variant={post.status==="active"?"default":"secondary"}>{post.status||"pending"}</Badge><Button size="sm" variant="outline" asChild><Link to={`/listing/${post.id}`}>View</Link></Button></div></div></div></CardContent></Card>)}</div>}</section></div></div>;
}
