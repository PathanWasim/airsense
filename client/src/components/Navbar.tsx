import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

import LoginModal from "./LoginModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = (userData: any) => {
    login(userData);
    setIsLoginModalOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Update navbar style when scrolled
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]");

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop - 100;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute("id");

        if (
          window.scrollY > sectionTop &&
          window.scrollY <= sectionTop + sectionHeight &&
          sectionId
        ) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", text: "Home" },
    { href: "#about", text: "About" },
    { href: "#features", text: "Features" },
    { href: "#how-it-works", text: "How It Works" },
    { href: "#contact", text: "Contact" },
  ];

 

  return (
    <>
      <nav
        className="fixed w-full z-40 transition-all duration-300"
        style={{
          backgroundColor: 'white',
          boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
          padding: isScrolled ? '0.75rem 0' : '1.25rem 0'
        }}
      >
        
        <div className="container mx-auto px-4 flex justify-between items-center">
         
            <div className="font-bold text-xl font-montserrat flex items-center" style={{ color: '#3B82F6' }}>
           <svg className="h-7 w-7 mr-2" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2C9.163 2 2 9.163 2 18C2 26.837 9.163 34 18 34C26.837 34 34 26.837 34 18C34 9.163 26.837 2 18 2Z" fill="#3B82F6" opacity="0.4"/>
                <path d="M18 4C10.268 4 4 10.268 4 18C4 25.732 10.268 32 18 32C25.732 32 32 25.732 32 18C32 10.268 25.732 4 18 4Z" fill="#3B82F6" opacity="0.7"/>
                <path d="M13 10C13 10 10 14 10 18C10 22 13 26 13 26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M23 10C23 10 26 14 26 18C26 22 23 26 23 26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 12C16.343 12 15 14.686 15 18C15 21.314 16.343 24 18 24C19.657 24 21 21.314 21 18C21 14.686 19.657 12 18 12Z" fill="#36B37E"/>
                <circle cx="18" cy="18" r="3" fill="white"/>
            </svg>
              <span style={{ color: '#36B37E' }}></span>AirSense
            
          </div>

          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-medium relative px-1 py-2 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
                style={{
                  color: activeSection === link.href.substring(1) ? '#0000FF' : '#000000',
                  fontWeight: activeSection === link.href.substring(1) ? '600' : '400',
                }}
                
              >
                {link.text}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="default"
                  className="text-white px-6 py-2 rounded-full transition transform hover:scale-105"
                  style={{ 
                    backgroundColor: isAdmin ? '#2563EB' : '#3B82F6',
                  }}
                  disabled={!isAuthenticated}
                  onClick={() => {
                    if (isAuthenticated) window.location.href = '/home';
                  }}
                >
                  Explore Dashboard
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative rounded-full h-10 w-10 p-0 overflow-hidden border-2"
                      style={{
                        borderColor: isAdmin ? '#36B37E' : '#3B82F6',
                        backgroundColor: isAdmin ? 'rgba(54, 179, 126, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback
                          style={{
                            backgroundColor: isAdmin ? 'rgba(54, 179, 126, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: isAdmin ? '#36B37E' : '#3B82F6',
                            fontWeight: 'bold'
                          }}
                        >
                          {user?.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {isAdmin ? "Administrator" : "User"}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer"
                      style={{ color: '#DC2626' }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="default"
                className="text-white px-6 py-2 rounded-full transition-all transform hover:scale-105 shadow-md"
                style={{ backgroundColor: '#3B82F6' }}
                onClick={handleLoginClick}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              className="focus:outline-none"
              style={{ color: '#3B82F6' }}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 pt-16 transition-transform duration-300"
        style={{
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className="px-4 py-2 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-medium relative px-1 py-2 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
              style={{
                color: activeSection === link.href.substring(1) ? '#36B37E' : 'inherit',
                fontWeight: activeSection === link.href.substring(1) ? '600' : '400',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.text}
            </a>
          ))}

          {isAuthenticated ? (
            <>
              <Button
                variant="default"
                className="text-white px-5 py-2 rounded-full w-full"
                style={{ 
                  backgroundColor: isAdmin ? '#36B37E' : '#3B82F6',
                }}
                disabled={!isAuthenticated}
              >
                Explore Dashboard
              </Button>

              <div className="pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                <div className="flex items-center space-x-2 px-1 py-2">
                  <Avatar>
                    <AvatarFallback
                      style={{
                        backgroundColor: isAdmin ? 'rgba(54, 179, 126, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: isAdmin ? '#36B37E' : '#3B82F6',
                        fontWeight: 'bold'
                      }}
                    >
                      {user?.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500">
                      {isAdmin ? "Administrator" : "User"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="px-4 py-2 w-full flex items-center justify-start hover:bg-red-50 mt-2"
                  style={{ color: '#DC2626' }}
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="default"
              className="text-white px-6 py-2 rounded-full w-full"
              style={{ backgroundColor: '#3B82F6' }}
              onClick={() => {
                setIsMenuOpen(false);
                handleLoginClick();
              }}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLogin={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;

