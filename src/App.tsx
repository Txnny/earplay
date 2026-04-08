import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SubmitTrack from "./pages/SubmitTrack";
import MyTracks from "./pages/MyTracks";
import SpinAnalytics from "./pages/SpinAnalytics";
import TrackLibrary from "./pages/TrackLibrary";
import Playlists from "./pages/Playlists";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/submit" element={<ProtectedRoute><SubmitTrack /></ProtectedRoute>} />
            <Route path="/dashboard/tracks" element={<ProtectedRoute><MyTracks /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><SpinAnalytics /></ProtectedRoute>} />
            <Route path="/dashboard/library" element={<ProtectedRoute><TrackLibrary /></ProtectedRoute>} />
            <Route path="/dashboard/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/dashboard/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
