interface PageBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function PageBackground({ children, className = "" }: PageBackgroundProps) {
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
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
