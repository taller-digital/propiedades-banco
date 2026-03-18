import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/hooks/useRole";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import PropertiesPage from "@/pages/PropertiesPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import ContractsPage from "@/pages/ContractsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import DocumentsPage from "@/pages/DocumentsPage";
import AlertsPage from "@/pages/AlertsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/propiedades" element={<PropertiesPage />} />
              <Route path="/propiedades/:id" element={<PropertyDetailPage />} />
              <Route path="/contratos" element={<ContractsPage />} />
              <Route path="/mantenimiento" element={<MaintenancePage />} />
              <Route path="/documentos" element={<DocumentsPage />} />
              <Route path="/alertas" element={<AlertsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
