"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down (after 100px)
      else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/feed", label: "Feed", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { href: "/network", label: "Network", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/skills", label: "Skills", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
    { href: "/projects", label: "Projects", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-lg border-b border-border/50"
      onMouseEnter={() => setIsVisible(true)}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo / Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="text-white font-bold text-xl">P</span>
            </motion.div>
            <motion.span 
              className="text-xl font-bold text-foreground group-hover:text-primary transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              PeerFusion
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="relative px-4 py-2 group"
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg 
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className={`font-medium transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    }`}>
                      {item.label}
                    </span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {/* Enhanced Search Button */}
            <motion.div 
              className="relative"
              animate={{ width: isSearchFocused ? 300 : "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex items-center">
                <svg 
                  className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <motion.input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-4 py-2 bg-muted/30 border border-muted-foreground/20 rounded-lg text-foreground placeholder-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  animate={{ width: isSearchFocused ? 300 : 160 }}
                  transition={{ duration: 0.3 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
              </div>
            </motion.div>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <ThemeToggle />
            </motion.div>
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <NotificationBell />
                </motion.div>
                <div className="relative">
                  <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center ring-2 ring-primary/20"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="text-white font-medium text-sm">
                        {user.first_name?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </motion.div>
                    <span className="hidden sm:block font-medium text-foreground group-hover:text-primary transition-colors">
                      {user.first_name || 'User'}
                    </span>
                    <motion.svg 
                      className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: isMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* Enhanced Dropdown Menu */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        {/* Backdrop to close dropdown when clicking outside */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-2 w-56 glass-strong rounded-xl shadow-2xl py-2 z-50 border border-border overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-border/50">
                            <p className="text-sm font-medium text-foreground">{user.first_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          
                          <motion.div whileHover={{ backgroundColor: "rgba(16, 163, 127, 0.1)" }} className="mx-1 rounded-md">
                            <Link
                              href={`/profile/${user.id || 'me'}`}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-foreground transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>My Profile</span>
                            </Link>
                          </motion.div>
                          
                          <motion.div whileHover={{ backgroundColor: "rgba(16, 163, 127, 0.1)" }} className="mx-1 rounded-md">
                            <Link
                              href="/settings"
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-foreground transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Settings</span>
                            </Link>
                          </motion.div>
                          
                          <hr className="my-2 border-border/50 mx-2" />
                          
                          <motion.div whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }} className="mx-1 rounded-md">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-destructive transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Sign Out</span>
                            </button>
                          </motion.div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 163, 127, 0.3)" }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground hover:text-primary hover:bg-muted/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
          </motion.button>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border py-4"
            >
              <nav className="flex flex-col space-y-2">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive 
                            ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                            : 'text-foreground hover:text-primary hover:bg-muted/50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Mobile Search */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  className="px-4 py-2"
                >
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-muted-foreground/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                        }
                      }}
                    />
                  </div>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
