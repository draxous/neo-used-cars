import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthProvider from "./components/AuthProvider";
import UserDataProvider from "./components/UserDataProvider";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./components/AdminLayout";

// Code-split subroutes to keep the initial homepage bundle lightweight (<250kB)
// for instant 0ms First Contentful Paint.
const StockCars = lazy(() => import("./pages/StockCars"));
const CarDetail = lazy(() => import("./pages/CarDetail"));
const Search = lazy(() => import("./pages/Search"));
const Auctions = lazy(() => import("./pages/Auctions"));
const Resources = lazy(() => import("./pages/Resources"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Faq = lazy(() => import("./pages/Faq"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Inquiry = lazy(() => import("./pages/Inquiry"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/Home"));
const DashboardActivity = lazy(() => import("./pages/dashboard/Activity"));
const DashboardFavorites = lazy(() => import("./pages/dashboard/Favorites"));
const DashboardVehicles = lazy(() => import("./pages/dashboard/MyVehicles"));
const AdminJoin = lazy(() => import("./pages/AdminJoin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// The admin screens load on demand
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const AdminVehicleEditor = lazy(() => import("./pages/admin/VehicleEditor"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminRequests = lazy(() => import("./pages/admin/Requests"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminQuotes = lazy(() => import("./pages/admin/Quotes"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminTeam = lazy(() => import("./pages/admin/Team"));

const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <UserDataProvider>
            <Suspense fallback={<RouteFallback />}>
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
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
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
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/inventory" element={<AdminInventory />} />
                  <Route path="/admin/inventory/new" element={<AdminVehicleEditor />} />
                  <Route path="/admin/inventory/:id" element={<AdminVehicleEditor />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/requests" element={<AdminRequests />} />
                  <Route path="/admin/customers" element={<AdminCustomers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/quotes" element={<AdminQuotes />} />
                  <Route path="/admin/messages" element={<AdminMessages />} />
                  <Route path="/admin/team" element={<AdminTeam />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </UserDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
