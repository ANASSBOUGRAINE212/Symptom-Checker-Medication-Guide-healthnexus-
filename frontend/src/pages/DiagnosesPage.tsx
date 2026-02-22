import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBackground } from "@/components/ui/page-background";

import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getSeverityColor } from "@/constants";
import {
  ArrowLeft,
  Stethoscope,
  Search,
  Calendar,
  Loader2,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Filter
} from "lucide-react";

interface DiagnosisResult {
  diseaseName: string;
  matchScore: number;
  probability: number;
}

interface Diagnosis {
  id: string;
  userId: string;
  symptoms: string[];
  results: DiagnosisResult[];
  createdAt: string;
  disease?: {
    id: string;
    name: string;
    category: string;
    severity: string;
    definition: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function DiagnosesPage() {
  const { user, isLoading, accessToken } = useAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [isLoadingDiagnoses, setIsLoadingDiagnoses] = useState(true);

  // Fetch diagnoses
  useEffect(() => {
    const fetchDiagnoses = async () => {
      if (!user) return;
      
      try {
        setIsLoadingDiagnoses(true);
        const response = await apiFetch(`/user/diagnoses?page=${pagination.page}&limit=${pagination.limit}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDiagnoses(data.diagnoses);
          setPagination(data.pagination);
        } else {
          toast({
            title: "Error",
            description: "Failed to load diagnoses",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching diagnoses:', error);
        toast({
          title: "Error",
          description: "Failed to load diagnoses",
          variant: "destructive"
        });
      } finally {
        setIsLoadingDiagnoses(false);
      }
    };

    if (isLoadingDiagnoses && user) {
      fetchDiagnoses();
    }
  }, [user, isLoading, pagination.page, pagination.limit, toast]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Show loading state
  if (isLoading || isLoadingDiagnoses) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </PageBackground>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <PageBackground>
      <header className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center text-white hover:text-gray-200">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg mr-3">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">Diagnosis History</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Your Diagnosis History
          </h2>
          <p className="text-blue-100 dark:text-gray-200 max-w-2xl mx-auto">
            Review your past diagnoses and track your health journey over time.
          </p>
        </div>

        {/* Diagnoses List */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Loading diagnoses...</span>
            </div>
          ) : diagnoses.length > 0 ? (
            <div className="space-y-4">
              {diagnoses.map((diagnosis) => (
                <Link to={`/diagnosis/${diagnosis.id}`} key={diagnosis.id}>
                  <Card className="hover:shadow-xl transition-all duration-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-lg hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {diagnosis.disease ? diagnosis.disease.name : "Health Check"}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(diagnosis.createdAt)}
                                </span>
                              </div>
                              {diagnosis.disease && (
                                <Badge className={getSeverityColor(diagnosis.disease.severity)}>
                                  {diagnosis.disease.severity}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                                {diagnosis.symptoms.length} symptoms
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Diagnoses Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't completed any diagnoses yet. Start a new diagnosis to track your health.
                </p>
                <Link to="/diagnose">
                  <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                    Start New Diagnosis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {!isLoadingDiagnoses && diagnoses.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400 px-3">
                Page {pagination.page} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center mt-12 gap-4">
          <Link to="/diagnose">
            <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
              <Stethoscope className="h-4 w-4 mr-2" />
              Start New Diagnosis
            </Button>
          </Link>
          <Link to="/home">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </PageBackground>
  );
}



