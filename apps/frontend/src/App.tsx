import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { RevisionsProvider } from "./contexts/RevisionsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { PWAManifest } from "./components/pwa/PWAManifest";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StorePanel from "./pages/StorePanel";
import MechanicPanelPage from "./pages/MechanicPanelPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CustomerPanel from "./pages/CustomerPanel";
import MyAccount from "./pages/MyAccount";
import Promocoes from "./pages/Promocoes";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <AdminAuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <RevisionsProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <PWAManifest />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/promocoes" element={<Promocoes />} />
                        <Route path="/customer" element={<CustomerPanel />} />
                        <Route path="/my-account" element={<MyAccount />} />
                        <Route path="/store-panel" element={<StorePanel />} />
                        <Route path="/mechanic-panel" element={<MechanicPanelPage />} />
                        <Route path="/admin" element={<Navigate to="/store-panel" replace />} />
                        <Route path="/admin/*" element={<Navigate to="/store-panel" replace />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TooltipProvider>
                  </RevisionsProvider>
                </CartProvider>
              </FavoritesProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
