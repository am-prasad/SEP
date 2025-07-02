import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon, Search, MapPin, Plus, User, Sun, Moon, Bell, Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import RegistrationModal from '@/components/RegistrationModal';
import { useTheme } from 'next-themes';

const NavLink = ({ to, icon, label, isActive, onClick }) => {
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
      <span>{label}</span>
    </Link>
  );
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="transition-all duration-300 ease-in-out"
    >
      <span className="sr-only">Toggle Theme</span>
      <div className="relative h-5 w-5">
        <Sun
          className={cn(
            "absolute inset-0 h-5 w-5 transition-opacity duration-300",
            isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-5 w-5 transition-opacity duration-300",
            isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          )}
        />
      </div>
    </Button>
  );
};

const Navigation = ({ currentPath }) => {
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">

            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="text-xl font-bold text-primary flex items-center gap-1"
              >
                <MapPin className="h-6 w-6 text-primary" />
                <span>Campus Lost and Found</span>
              </Link>
            </div>

            {/* Right: Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
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
              <Button asChild size="sm">
                <Link to="/report">
                  <Plus className="h-4 w-4 mr-1" />
                  Report Item
                </Link>
              </Button>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>

            {/* Mobile: Hamburger menu */}
            <div className="sm:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <div className="sm:hidden mt-2 flex flex-col gap-2 border-t pt-3">
              <NavLink
                to="/"
                icon={<HomeIcon className="h-5 w-5" />}
                label="Home"
                isActive={currentPath === '/'}
                onClick={() => setMenuOpen(false)}
              />
              <NavLink
                to="/browse"
                icon={<Search className="h-5 w-5" />}
                label="Browse Items"
                isActive={currentPath === '/browse'}
                onClick={() => setMenuOpen(false)}
              />
              <NavLink
                to="/map"
                icon={<MapPin className="h-5 w-5" />}
                label="Map View"
                isActive={currentPath === '/map'}
                onClick={() => setMenuOpen(false)}
              />
              <Link to="/report" onClick={() => setMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Item
                </Button>
              </Link>
              <NavLink
                to="#"
                icon={<User className="h-5 w-5" />}
                label="Register"
                isActive={false}
                onClick={(e) => {
                  e.preventDefault();
                  setRegistrationModalOpen(true);
                  setMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
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
