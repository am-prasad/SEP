import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, Search, MapPin, Plus, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import RegistrationModal from '@/components/RegistrationModal';

const NavLink = ({ to, icon, label, isActive, onClick }) => {
  const isMobile = useIsMobile();

  return (
    <Link 
      to={to}
      onClick={onClick}
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
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  return (
    <>
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

            {/* Register Link opens modal */}
            <NavLink 
              to="#"
              icon={<User className="h-5 w-5" />}
              label="Register"
              isActive={false}
              onClick={(e) => {
                e.preventDefault();
                setRegistrationModalOpen(true);
              }}
            />
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
          <NavLink 
            to="#" 
            icon={<User className="h-5 w-5" />} 
            label="Register"
            isActive={false}
            onClick={(e) => {
              e.preventDefault();
              setRegistrationModalOpen(true);
            }}
          />
        </nav>
      </header>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={registrationModalOpen} 
        onClose={() => setRegistrationModalOpen(false)} 
      />
    </>
  );
};

export default Navigation;
