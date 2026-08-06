import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import SEOTools from "./pages/SEOTools.tsx";
import Services from "./pages/Services.tsx";
import Results from "./pages/Results.tsx";
import Blog from "./pages/Blog.tsx";
import FAQ from "./pages/FAQ.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsConditions from "./pages/TermsConditions.tsx";
import PaymentPolicy from "./pages/PaymentPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminGuard from "./components/admin/AdminGuard.tsx";
import AdminSkeleton from "./components/admin/AdminSkeleton.tsx";
import About from "./pages/src/pages/Team.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";

// Admin panel is code-split so the public site stays lightweight and
// each admin route streams in with a skeleton instead of blocking.
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx"));
const AdminHome = lazy(() => import("./pages/admin/Home.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const AdminLive = lazy(() => import("./pages/admin/Live.tsx"));
const AdminNews = lazy(() => import("./pages/admin/NewsAdmin.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/Users.tsx"));
const AdminSubscribers = lazy(() => import("./pages/admin/Subscribers.tsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics.tsx"));
const AdminReports = lazy(() => import("./pages/admin/Reports.tsx"));

import AITools from "./pages/AITools.tsx";
import News from "./pages/News.tsx";
import AIChatbot from "./components/AIChatbot.tsx";
import AuroraBackground from "./components/AuroraBackground.tsx";
import WebsiteTour from "./components/WebsiteTour.tsx";
import WelcomeExperience from "./components/WelcomeExperience.tsx";
import { useVisitorTracking } from "./hooks/useVisitorTracking.ts";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

const AdminFallback = () => (
  <div className="p-4 md:p-6">
    <AdminSkeleton />
  </div>
);


const TrackingLayer = () => {
  useVisitorTracking();
  return null;
};

// Public-site-only overlays (chatbot, welcome popup, tour) — never on /admin.
const PublicOverlays = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <AIChatbot />
      <WelcomeExperience />
      <WebsiteTour />
    </>
  );
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuroraBackground />
        <TrackingLayer />


        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          
          <Route path="/seo-tools" element={<SEOTools />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/about" element={<About />} />
          <Route path="/results" element={<Results />} />
          <Route path="/news" element={<News />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Suspense fallback={<AdminFallback />}>
                  <AdminLayout />
                </Suspense>
              </AdminGuard>
            }
          >
            <Route index element={<Suspense fallback={<AdminSkeleton />}><AdminHome /></Suspense>} />
            <Route path="live" element={<Suspense fallback={<AdminSkeleton />}><AdminLive /></Suspense>} />
            <Route path="blog" element={<Suspense fallback={<AdminSkeleton />}><AdminDashboard /></Suspense>} />
            <Route path="news" element={<Suspense fallback={<AdminSkeleton />}><AdminNews /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<AdminSkeleton />}><AdminUsers /></Suspense>} />
            <Route path="subscribers" element={<Suspense fallback={<AdminSkeleton />}><AdminSubscribers /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={<AdminSkeleton />}><AdminAnalytics /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<AdminSkeleton />}><AdminReports /></Suspense>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatbot />
        <WelcomeExperience />
        <WebsiteTour />

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
