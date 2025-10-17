import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { RevisionsProvider } from "./contexts/RevisionsContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StorePanel from "./pages/StorePanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CustomerPanel from "./pages/CustomerPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <RevisionsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
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
        </RevisionsProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
