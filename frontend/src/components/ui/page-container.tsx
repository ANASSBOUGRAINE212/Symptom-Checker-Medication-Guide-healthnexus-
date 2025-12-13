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
}: PageContainerProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
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
    </div>
  );
}