import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    window.location.href = "/login";
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Determine active page from location
  const getActivePage = () => {
    const path = location.split("/").pop();
    return path || "dashboard";
  };

  return (
    <div className="bg-gray-50 h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      {user && (
        <Sidebar user={user} activePage={getActivePage()} />
      )}
      
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 22h14a2 2 0 002-2V9a1 1 0 00-1-1h-3v-.777c0-2.896-1.2-5.545-3.134-7.447a1 1 0 00-1.732 0C10.2 2.678 9 5.327 9 8.223V8H6a1 1 0 00-1 1v11a2 2 0 002 2z" />
              </svg>
            </span>
            <h1 className="text-lg font-semibold text-gray-900">FlightTrack</h1>
          </div>
          <button className="text-gray-500" onClick={toggleMobileMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      {user && (
        <MobileNav userRole={user.role} activePage={getActivePage()} />
      )}
    </div>
  );
};

export default MainLayout;
