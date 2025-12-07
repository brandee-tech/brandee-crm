import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { CurrentUserProvider } from "@/contexts/CurrentUserContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AdminSaas from "./pages/AdminSaas";
import Landing from "./pages/Landing";
import CompanyRegistration from "./pages/CompanyRegistration";
import NotFound from "./pages/NotFound";
import LeadAutomation from "./pages/LeadAutomation";
import PublicLeadForm from "./pages/PublicLeadForm";
import { CompanyEditPage } from "./pages/admin/CompanyEditPage";
import { WhatsAppButton } from "./components/WhatsAppButton";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <CurrentUserProvider>
          <PermissionsProvider>
            <AppointmentsProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Main app routes */}
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/leads" element={<Home />} />
                    <Route path="/tags" element={<Home />} />
                    <Route path="/products" element={<Home />} />
                    <Route path="/appointments" element={<Home />} />
                    <Route path="/meetings" element={<Home />} />
                    <Route path="/calendar" element={<Home />} />
                    <Route path="/schedule" element={<Home />} />
                    <Route path="/tasks" element={<Home />} />
                    <Route path="/scripts" element={<Home />} />
                    <Route path="/reports" element={<Home />} />
                    <Route path="/partners" element={<Home />} />
                    <Route path="/users" element={<Home />} />
                    <Route path="/settings" element={<Home />} />
                    <Route path="/whatsapp" element={<Home />} />
                    <Route path="/automation" element={<Home />} />
                    
                    {/* Other routes */}
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/form/:slug" element={<PublicLeadForm />} />
                    <Route path="/admin" element={<AdminSaas />} />
                    <Route path="/admin/companies/:id/edit" element={<CompanyEditPage />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/register-company" element={<CompanyRegistration />} />
                    <Route path="/company-registration" element={<CompanyRegistration />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <WhatsAppButton />
                  <Toaster />
                </div>
              </Router>
            </AppointmentsProvider>
          </PermissionsProvider>
        </CurrentUserProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;