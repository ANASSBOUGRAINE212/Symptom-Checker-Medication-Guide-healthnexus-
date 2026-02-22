import React from "react";
import { ModernHeader } from "./modern-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, Link } from "react-router-dom";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backTo?: string;
  hideNavigation?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  useBackground?: boolean;
}

export function PageContainer({
  children,
  title,
  showBackButton,
  onBackClick,
  backTo,
  hideNavigation,
  className = "",
  headerClassName = "",
  contentClassName = "",
  useBackground = true,
}: PageContainerProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const containerContent = (
    <>
      <ModernHeader
        title={title}
        showBackButton={showBackButton}
        onBackClick={backTo ? () => navigate(backTo) : onBackClick}
        hideNavigation={hideNavigation}
        className={headerClassName}
      />
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? 'pb-20' : 'pb-12'} ${contentClassName}`}>
        {children}
      </main>
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <p>© {new Date().getFullYear()} HealthNexus. All rights reserved.</p>
          <span className="hidden sm:inline">•</span>
          <Link
            to="/privacy"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </>
  );

  if (useBackground) {
    return (
      <div className={`relative min-h-screen ${className}`}>
        {/* Background Image Section */}
        <div className="fixed top-0 left-0 right-0 bottom-0 z-0">
          <img 
            src="/page-bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/85 to-purple-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {containerContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
      {containerContent}
    </div>
  );
}