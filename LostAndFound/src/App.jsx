import React from 'react';
import './index.css';
// App.css is now imported in main.jsx instead of here

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { ItemsProvider } from "./context/ItemsContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Report from "./pages/Report";
import MapView from "./pages/MapView";
import ItemDetails from "./pages/ItemDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ItemsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;