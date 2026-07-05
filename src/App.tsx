import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminAnalytics from "./pages/admin/Analytics.tsx";
import AdminReports from "./pages/admin/Reports.tsx";
import AdminGuard from "./components/admin/AdminGuard.tsx";
import About from "./pages/src/pages/Team.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";

import AITools from "./pages/AITools.tsx";
import News from "./pages/News.tsx";
import AIChatbot from "./components/AIChatbot.tsx";
import { useVisitorTracking } from "./hooks/useVisitorTracking.ts";

const queryClient = new QueryClient();

const TrackingLayer = () => {
  useVisitorTracking();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
          <Route path="/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
