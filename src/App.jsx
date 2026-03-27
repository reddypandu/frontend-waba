import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatbotWidget from "@/components/landing/ChatbotWidget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import WhatsAppSetup from "./pages/dashboard/WhatsAppSetup";
import BusinessProfile from "./pages/dashboard/BusinessProfile";
import Templates from "./pages/dashboard/Templates";
import CreateTemplate from "./pages/dashboard/CreateTemplate";
import EditTemplate from "./pages/dashboard/EditTemplate";
import Campaigns from "./pages/dashboard/Campaigns";
import CreateCampaign from "./pages/dashboard/CreateCampaign";
import CampaignDetail from "./pages/dashboard/CampaignDetail";
import Contacts from "./pages/dashboard/Contacts";
import Inbox from "./pages/dashboard/Inbox";
import Billing from "./pages/dashboard/Billing";
import Wallet from "./pages/dashboard/Wallet";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import AdminPanel from "./pages/dashboard/AdminPanel";
import AutoReplies from "./pages/dashboard/AutoReplies";
import Workflows from "./pages/dashboard/Workflows";
import Invoices from "./pages/dashboard/Invoices";
import Designs from "./pages/dashboard/Designs";
import DesignEditor from "./pages/dashboard/DesignEditor";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataDeletion from "./pages/DataDeletion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardOverview />} />
              <Route path="whatsapp-setup" element={<WhatsAppSetup />} />
              <Route path="business-profile" element={<BusinessProfile />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/create" element={<CreateTemplate />} />
              <Route path="templates/edit/:id" element={<EditTemplate />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/create" element={<CreateCampaign />} />
              <Route path="campaigns/:id" element={<CampaignDetail />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="billing" element={<Billing />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="auto-replies" element={<AutoReplies />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="designs" element={<Designs />} />
              <Route path="designs/editor/:id" element={<DesignEditor />} />
            </Route>
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
