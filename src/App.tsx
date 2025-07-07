
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AdminSaas from "./pages/AdminSaas";
import Landing from "./pages/Landing";
import CompanyRegistration from "./pages/CompanyRegistration";
import NotFound from "./pages/NotFound";
import { CompanyEditPage } from "./pages/admin/CompanyEditPage";
import { WhatsAppButton } from "./components/WhatsAppButton";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppointmentsProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
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
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
