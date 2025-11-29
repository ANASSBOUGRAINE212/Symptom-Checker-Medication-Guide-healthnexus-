import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Home,
  Stethoscope,
  BookOpen,
  Pill,
  User,
  Shield,
  ArrowLeft
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Theme toggle is handled by the header */}

      <div className="max-w-2xl w-full">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full">
                <ArrowLeft className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg dark:text-gray-300">
              The page you're looking for doesn't exist or may have been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Tip:</strong> Make sure you're using the correct URL. Here are the available pages:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/home">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-gray-100">Home Dashboard</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/home</p>
                  </div>
                </Button>
              </Link>

              <Link to="/diagnose">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30">
                  <Stethoscope className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium dark:text-gray-100">Diagnose Yourself</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/diagnose</p>
                  </div>
                </Button>
              </Link>

              <Link to="/diseases">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/30">
                  <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <p className="font-medium dark:text-gray-100">Disease Information</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/diseases</p>
                  </div>
                </Button>
              </Link>

              <Link to="/medications">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/30">
                  <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium dark:text-gray-100">Medications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/medications</p>
                  </div>
                </Button>
              </Link>

              <Link to="/profile">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium dark:text-gray-100">User Profile</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/profile</p>
                  </div>
                </Button>
              </Link>

              {/* Admin link intentionally hidden for non-admins */}
            </div>

            <div className="text-center space-y-4">
              <Link to="/home">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8">
                  Go to Home Dashboard
                </Button>
              </Link>
              
              <div className="flex justify-center gap-4 text-sm">
                <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </Link>
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign Up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
