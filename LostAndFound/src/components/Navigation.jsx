import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, Search, MapPin, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';

const NavLink = ({ to, icon, label, isActive }) => {
  const isMobile = useIsMobile();
  
  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      {!isMobile && <span>{label}</span>}
    </Link>
  );
};

const Navigation = ({ currentPath }) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-3 gap-2">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className={cn(isMobile ? "sr-only" : "")}>Campus Lost and Found</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center flex-wrap gap-4">
          <NavLink 
            to="/" 
            icon={<HomeIcon className="h-5 w-5" />} 
            label="Home"
            isActive={currentPath === '/'} 
          />
          <NavLink 
            to="/browse" 
            icon={<Search className="h-5 w-5" />} 
            label="Browse Items"
            isActive={currentPath === '/browse'} 
          />
          <NavLink 
            to="/map" 
            icon={<MapPin className="h-5 w-5" />} 
            label="Map View" 
            isActive={currentPath === '/map'}
          />
          <Button asChild size="sm" className="ml-2">
            <Link to="/report">
              <Plus className="h-4 w-4 mr-1" />
              Report Item
            </Link>
          </Button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden flex justify-around items-center bg-background border-t py-2 px-4 z-20">
        <NavLink 
          to="/" 
          icon={<HomeIcon className="h-5 w-5" />} 
          label="Home"
          isActive={currentPath === '/'} 
        />
        <NavLink 
          to="/browse" 
          icon={<Search className="h-5 w-5" />} 
          label="Browse"
          isActive={currentPath === '/browse'} 
        />
        <NavLink 
          to="/map" 
          icon={<MapPin className="h-5 w-5" />} 
          label="Map"
          isActive={currentPath === '/map'} 
        />
        <NavLink 
          to="/report" 
          icon={<Plus className="h-5 w-5" />} 
          label="Report"
          isActive={currentPath === '/report'} 
        />
      </nav>
    </header>
  );
};

export default Navigation;
