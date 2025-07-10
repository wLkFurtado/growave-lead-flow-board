
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ClientProvider } from "@/contexts/ClientContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // ✅ 30 segundos (para debug - era 5 minutos)
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: true, // ✅ Refetch ao voltar à aba
      refetchOnMount: true, // ✅ Refetch ao montar componente
      refetchOnReconnect: true, // ✅ Refetch ao reconectar à internet
      retry: 2
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ClientProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ClientProvider>
        </AuthProvider>
      </TooltipProvider>
    </div>
  </QueryClientProvider>
);

export default App;
