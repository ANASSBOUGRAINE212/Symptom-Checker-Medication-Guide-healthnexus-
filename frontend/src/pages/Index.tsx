import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Loader2 } from "lucide-react";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/home");
      } else {
        navigate("/signin");
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 rounded-full">
            <Heart className="h-12 w-12 text-white" />
          </div>
        </div>
  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">HealthNexus</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">Your Health, Our Priority</p>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading your health dashboard...</p>
      </div>
    </div>
  );
}
