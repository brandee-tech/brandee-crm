
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AdminSaas from "./pages/AdminSaas";
import Landing from "./pages/Landing";
import CompanyRegistration from "./pages/CompanyRegistration";
import NotFound from "./pages/NotFound";
import { WhatsAppButton } from "./components/WhatsAppButton";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppointmentsProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminSaas />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/register-company" element={<CompanyRegistration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppButton />
            <Toaster />
          </div>
        </Router>
      </AppointmentsProvider>
    </QueryClientProvider>
  );
}

export default App;
