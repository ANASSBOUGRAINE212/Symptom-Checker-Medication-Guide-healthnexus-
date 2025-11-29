import { Info } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
          <Info className="h-4 w-4" />
          <span>
            <strong>Demo Mode:</strong> All data is stored locally in your browser. 
            Use <strong>admin@demo.com</strong> with any password for admin access.
          </span>
        </div>
      </div>
    </div>
  );
}
