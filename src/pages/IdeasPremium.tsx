import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, UserCircle2, Users, Building2 } from "lucide-react";

const generalFeatures=[
  "Create a profile and build your identity",
  "Publish posts, articles, questions and discussions",
  "Follow people, join communities and attend events",
  "Like, comment, share, save and message",
  "Discover ideas, people and topics through Explore",
  "Earn reputation, levels and community achievements",
];

const creatorFeatures=[
  "Creator profile and creator badge",
  "Publish articles, media, ideas and professional content",
  "Build an audience and grow your personal brand",
  "Creator insights for posts, reach and engagement",
  "Creator communities, events and collaboration opportunities",
  "Portfolio-style profile for your work, skills and projects",
];

const teamFeatures=[
  "Create a team or organization presence",
  "Team members, roles and permissions",
  "Shared posts, announcements and content workflows",
  "Private or public team communities",
  "Team events and collaboration",
  "Team-level insights, management and branding",
];

const premiumFeatures=[
  "Advanced profile and audience insights",
  "Advanced post and content analytics",
  "Priority discovery and enhanced profile visibility",
  "Premium profile badge and profile customization",
  "Advanced creator and team tools",
  "Early access to selected new ANVYA features",
];

function FeatureList({items,icon="check"}:{items:string[];icon?:string}){
 return <ul className="mt-5 space-y-2.5 text-sm text-left">{items.map(x=><li className="flex gap-2.5" key={x}><Check className="mt-0.5 size-4 shrink-0 text-primary"/><span>{x}</span></li>)}</ul>;
}

export default function IdeasPremium(){
 return <div className="min-h-screen bg-[#f8f9fc] dark:bg-background">
  <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
   <div className="text-center">
    <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-1 text-white">ANVYA • PREMIUM &amp; ROLES</Badge>
    <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Choose how you want to use ANVYA</h1>
    <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">ANVYA is designed for everyday members, creators, teams and premium users. Each mode adds tools for a different way of sharing, growing and collaborating.</p>
   </div>

   <div className="mt-10 grid gap-5 md:grid-cols-2">
    <Card className="rounded-3xl border shadow-sm">
     <CardContent className="p-6 sm:p-7">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-slate-100 p-3 dark:bg-muted"><UserCircle2 className="size-6"/></div><div><h2 className="text-xl font-black">General</h2><p className="text-sm text-muted-foreground">Connect &amp; Discover</p></div></div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">For everyday ANVYA members who want to share ideas, ask questions, join conversations and discover people and communities.</p>
      <FeatureList items={generalFeatures}/>
     </CardContent>
    </Card>

    <Card className="rounded-3xl border shadow-sm">
     <CardContent className="p-6 sm:p-7">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-100 p-3 dark:bg-amber-950/40"><Sparkles className="size-6 text-amber-600"/></div><div><h2 className="text-xl font-black">Creators</h2><p className="text-sm text-muted-foreground">Create &amp; Grow</p></div></div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">For writers, educators, developers, artists, professionals and other creators who want to publish consistently and grow an audience.</p>
      <FeatureList items={creatorFeatures}/>
     </CardContent>
    </Card>

    <Card className="rounded-3xl border shadow-sm">
     <CardContent className="p-6 sm:p-7">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-100 p-3 dark:bg-blue-950/40"><Building2 className="size-6 text-blue-600"/></div><div><h2 className="text-xl font-black">Teams</h2><p className="text-sm text-muted-foreground">Collaborate &amp; Build</p></div></div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">For startups, organizations, communities and professional teams that need shared publishing, member management and collaboration.</p>
      <FeatureList items={teamFeatures}/>
     </CardContent>
    </Card>

    <Card className="relative overflow-hidden rounded-3xl border-primary/30 shadow-xl">
     <div className="absolute right-5 top-5"><Crown className="size-7 text-primary"/></div>
     <CardContent className="p-6 sm:p-7">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-950/40"><Crown className="size-6 text-violet-600"/></div><div><h2 className="text-xl font-black">Premium</h2><p className="text-sm text-muted-foreground">Unlock More</p></div></div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">Premium is planned for members who want deeper insights, enhanced visibility, advanced tools and early access to selected features.</p>
      <FeatureList items={premiumFeatures}/>
      <Button disabled className="mt-6 w-full rounded-xl">Premium Coming Soon</Button>
     </CardContent>
    </Card>
   </div>

   <Card className="mt-7 rounded-3xl border bg-background/80">
    <CardContent className="p-6 sm:p-7">
     <h2 className="text-xl font-black">ANVYA in one line</h2>
     <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
      <div className="rounded-2xl border p-4"><strong>General</strong><p className="mt-1 text-muted-foreground">Connect &amp; Discover</p></div>
      <div className="rounded-2xl border p-4"><strong>Creators</strong><p className="mt-1 text-muted-foreground">Create &amp; Grow</p></div>
      <div className="rounded-2xl border p-4"><strong>Teams</strong><p className="mt-1 text-muted-foreground">Collaborate &amp; Build</p></div>
      <div className="rounded-2xl border p-4"><strong>Premium</strong><p className="mt-1 text-muted-foreground">Unlock More</p></div>
     </div>
    </CardContent>
   </Card>
  </div>
 </div>;
}
