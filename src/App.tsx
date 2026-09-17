import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StockCars from "./pages/StockCars";
import CarDetail from "./pages/CarDetail";
import Search from "./pages/Search";
import Auctions from "./pages/Auctions";
import Resources from "./pages/Resources";
import Faq from "./pages/Faq";
import AboutUs from "./pages/AboutUs";
import Inquiry from "./pages/Inquiry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/Home";
import DashboardActivity from "./pages/dashboard/Activity";
import DashboardFavorites from "./pages/dashboard/Favorites";
import DashboardVehicles from "./pages/dashboard/MyVehicles";
import AuthProvider from "./components/AuthProvider";
import UserDataProvider from "./components/UserDataProvider";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./components/AdminLayout";
import AdminQuotes from "./pages/admin/Quotes";
import AdminMessages from "./pages/admin/Messages";
import AdminTeam from "./pages/admin/Team";
import AdminJoin from "./pages/AdminJoin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <UserDataProvider>
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Stock — the SEO-facing routes.
                  The static "collection" segment is matched ahead of :makeSlug. */}
              <Route path="/stock-cars" element={<StockCars variant="all" />} />
              <Route
                path="/stock-cars/collection/:collectionSlug"
                element={<StockCars variant="collection" />}
              />
              <Route path="/stock-cars/:makeSlug" element={<StockCars variant="make" />} />
              <Route
                path="/stock-cars/:makeSlug/:modelSlug"
                element={<StockCars variant="model" />}
              />
              <Route path="/stock-cars/:makeSlug/:modelSlug/:id" element={<CarDetail />} />

              <Route path="/search" element={<Search />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/inquiry" element={<Inquiry />} />

              {/* Account */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/home" replace />} />

              {/* Signed-in area — its own chrome, four tabs */}
              <Route
                element={
                  <RequireAuth>
                    <DashboardLayout />
                  </RequireAuth>
                }
              >
                <Route path="/dashboard/home" element={<DashboardHome />} />
                <Route path="/dashboard/activity" element={<DashboardActivity />} />
                <Route path="/dashboard/favorites" element={<DashboardFavorites />} />
                <Route path="/dashboard/vehicles" element={<DashboardVehicles />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              {/* Admin — gated by role; the real boundary is RLS in the database */}
              <Route path="/admin" element={<Navigate to="/admin/quotes" replace />} />
              {/* Redeeming an invitation happens before the role exists, so
                  this one sits outside the guard on purpose. */}
              <Route path="/admin/join" element={<AdminJoin />} />
              <Route
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route path="/admin/quotes" element={<AdminQuotes />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/team" element={<AdminTeam />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
