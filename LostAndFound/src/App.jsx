import React from "react";
import "./index.css";

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes"; // <-- Import ThemeProvider

import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotificationsPage from "./pages/NotificationsPage";

import { ItemsProvider } from "./context/ItemsContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Report from "./pages/Report";
import MapView from "./pages/MapView";
import ItemDetails from "./pages/ItemDetails";
import NotFound from "./pages/NotFound";
import AdminDashboard from './components/AdminDashboard';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem> {/* <-- Added here */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ItemsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/item/:id" element={<ItemDetails />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ItemsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
