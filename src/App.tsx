import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { Categories } from "./pages/Categories";
import Cigs from "./pages/Cigs";
import Vapes from "./pages/Vapes";
import Liquor from "./pages/Liquor";
import NotFound from "./pages/NotFound";
import Weed from "./pages/Weed";
import WeedHistory from "./pages/WeedHistory";
import CigsHistory from "./pages/CigsHistory";
import VapesHistory from "./pages/VapesHistory";
import LiquorHistory from "./pages/LiquorHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cigs" element={<Cigs />} />
              <Route path="/cigs/history" element={<CigsHistory />} />
              <Route path="/vapes" element={<Vapes />} />
              <Route path="/vapes/history" element={<VapesHistory />} />
              <Route path="/liquor" element={<Liquor />} />
              <Route path="/liquor/history" element={<LiquorHistory />} />
              <Route path="/weed" element={<Weed />} />
              <Route path="/weed/history" element={<WeedHistory />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
