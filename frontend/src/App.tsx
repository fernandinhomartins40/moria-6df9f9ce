import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StorePanel from "./pages/StorePanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CustomerPanel from "./pages/CustomerPanel";
import { NotificationContainer } from "./components/NotificationContainer";
import { ToastContainer } from "./components/ui/toast-custom";
import { ApiStatus } from "./components/ApiStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationContainer />
            <ToastContainer />
            <ApiStatus className="fixed top-4 right-4 z-50 max-w-md" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/customer" element={<CustomerPanel />} />
                <Route path="/store-panel" element={<StorePanel />} />
                <Route path="/admin" element={<Navigate to="/store-panel" replace />} />
                <Route path="/admin/*" element={<Navigate to="/store-panel" replace />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
