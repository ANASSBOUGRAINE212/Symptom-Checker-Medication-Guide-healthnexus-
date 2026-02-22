import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, Menu, X, Home, Stethoscope, BookOpen, Pill, User, ArrowLeft, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ModernHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  hideNavigation?: boolean;
  className?: string;
}

export function ModernHeader({
  title = "HealthNexus",
  showBackButton = false,
  onBackClick,
  hideNavigation = false,
  className = "",
}: ModernHeaderProps) {
  const isMobile = useIsMobile();
  const { user, isLoading, logout, accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dbFirstName, setDbFirstName] = useState<string>("");
  const [isVerifiedDoctor, setIsVerifiedDoctor] = useState(false);

  const isAdmin = (() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const email = user?.email?.toLowerCase();
    if (!email) return false;
    return !!adminEmail && email === adminEmail.toLowerCase();
  })();

  // Fetch user's first name and doctor verification status from database
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !accessToken) return;
      try {
        const response = await apiFetch("/user/profile", {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (response.ok) {
          const profileData = await response.json();
          setDbFirstName(profileData?.user?.firstName || "");
        }

        // Check if user is a verified doctor
        if (user.role === 'DOCTOR') {
          const doctorResponse = await fetch('http://localhost:5174/api/v1/doctors', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (doctorResponse.ok) {
            const doctors = await doctorResponse.json();
            const myDoctor = doctors.find((d: any) => d.userId === user.id);
            setIsVerifiedDoctor(myDoctor?.isVerified && myDoctor?.isActive);
          }
        }
      } catch (error) {
        // fallback: do nothing
      }
    };
    fetchProfile();
  }, [user, accessToken]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Diagnose", path: "/diagnose", icon: <Stethoscope className="h-5 w-5" /> },
    { name: "Doctors", path: "/doctors", icon: <Stethoscope className="h-5 w-5" /> },
    { name: "Diseases", path: "/diseases", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Medications", path: "/medications", icon: <Pill className="h-5 w-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
  ];

  // Add Patients link for verified doctors and admins only
  const isDoctorOrAdmin = isAdmin || (user?.role === 'DOCTOR' && isVerifiedDoctor);
  if (isDoctorOrAdmin) {
    navItems.splice(3, 0, { name: "Patients", path: "/doctor-patients", icon: <User className="h-5 w-5" /> });
  }

  if (isLoading) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? "bg-white/10 dark:bg-gray-900/10 backdrop-blur-md shadow-sm"
        : "bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm"
        } border-b border-white/20 dark:border-gray-700/20 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="mr-2 text-white hover:text-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <img
                    src="/icon.png"
                    alt="HealthNexus Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
            )}
            <h1 className="ml-2 text-xl font-bold text-white">
              {title}
            </h1>
          </div>

          {/* Desktop Navigation */}
          {!hideNavigation && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>
          )}

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <span className="text-sm text-white mr-2">
                {dbFirstName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")?.[0]}
              </span>
            )}
            <ThemeToggle />

            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:text-gray-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}

            {/* Mobile menu button */}
            {isMobile && !hideNavigation && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                  {/* Visually hidden title and description for accessibility */}
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigation drawer for mobile users</SheetDescription>
                  <div className="flex flex-col h-full gap-4 p-4 text-base rounded-xl shadow-lg">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex flex-col items-center w-full">
                        <img
                          src="/icon.png"
                          alt="HealthNexus Logo"
                          className="h-8 w-8 rounded-lg mb-2"
                        />
                        <span className="text-base font-medium text-white mb-1 text-center">
                          Welcome to HealthNexus,
                          <span className="text-base font-medium text-[#00B4B8] ml-1">
                            {dbFirstName}
                          </span>
                        </span>
                      </div>
                      {/* Only one close button, keep this one and remove any duplicate below */}
                    </div>

                    <div className="flex-1 overflow-auto py-2">
                      <div className="flex flex-col space-y-1 p-2">
                        {/* ...existing code... */}
                        {navItems.map((item, idx) => (
                          <SheetClose asChild key={item.path}>
                            <Link
                              to={item.path}
                              className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </Link>
                          </SheetClose>
                        ))}
                        {isAdmin && (
                          <SheetClose asChild>
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-4 py-3 rounded-md text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                              >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                              </svg>
                              <span>Admin</span>
                            </Link>
                          </SheetClose>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center justify-center">
                      <Button
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}