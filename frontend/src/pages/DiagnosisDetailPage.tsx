import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getSeverityColor, getCategoryColor } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageBackground } from "@/components/ui/page-background";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Stethoscope, 
  AlertTriangle, 
  Calendar,
  Trash2,
  Edit,
  Loader2
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
    categories?: string[];
    severity: string;
    definition: string;
  };
}

export default function DiagnosisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading, accessToken } = useAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch diagnosis details
  useEffect(() => {
    const fetchDiagnosis = async () => {
      if (!user || !id) return;
      
      try {
        const response = await apiFetch(`/user/diagnosis/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDiagnosis(data.diagnosis);
        } else {
          toast({
            title: "Error",
            description: "Failed to load diagnosis details",
            variant: "destructive"
          });
          navigate("/home");
        }
      } catch (error) {
        console.error('Error fetching diagnosis:', error);
        toast({
          title: "Error",
          description: "Failed to load diagnosis details",
          variant: "destructive"
        });
      } finally {
        setIsLoadingDiagnosis(false);
      }
    };

    if (!isLoading && user) {
      fetchDiagnosis();
    }
  }, [id, user, isLoading, toast, navigate, accessToken]);

  const handleDelete = async () => {
    if (!user || !id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await apiFetch(`/user/diagnosis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Diagnosis deleted successfully",
        });
        navigate("/home");
      } else {
        throw new Error('Failed to delete diagnosis');
      }
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      toast({
        title: "Error",
        description: "Failed to delete diagnosis",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (isLoading || isLoadingDiagnosis) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading diagnosis details...</span>
          </div>
        </div>
      </PageBackground>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center h-screen">
          <Card className="w-96 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">Authentication Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please sign in to view diagnosis details
              </p>
              <Link to="/signin">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageBackground>
    );
  }

  // Show error if diagnosis not found
  if (!diagnosis) {
    return (
      <PageBackground>
        <header className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/home" className="flex items-center text-white hover:text-gray-200">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Diagnosis Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The diagnosis you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link to="/home">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </PageBackground>
    );
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
                <h1 className="text-lg font-bold text-white">Diagnosis Details</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <Calendar className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {formatDate(diagnosis.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/diagnose', { state: { symptoms: diagnosis.symptoms } })}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
                {diagnosis.disease ? diagnosis.disease.name : "Health Check"}
              </CardTitle>
              {diagnosis.disease && (
                <CardDescription className="dark:text-gray-300 text-base">
                  {diagnosis.disease.definition}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Symptoms */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <div className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md">
                      <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
                    </div>
                    Reported Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {diagnosis.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800 px-3 py-1">
                        {symptom.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Disease Information */}
                {diagnosis.disease && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Disease Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</p>
                        <div className="flex flex-wrap gap-2">
                          {/* Main category badge */}
                          <span className={`inline-block text-sm font-semibold ${getCategoryColor(diagnosis.disease.category)}`}>
                            {diagnosis.disease.category}
                          </span>
                          {/* Additional categories badges */}
                          {diagnosis.disease.categories && diagnosis.disease.categories.length > 0 && diagnosis.disease.categories.map((cat, idx) => (
                            <span key={cat + idx} className={`inline-block text-sm font-semibold ${getCategoryColor(cat)}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</p>
                        <Badge className={getSeverityColor(diagnosis.disease.severity)}>
                          {diagnosis.disease.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnosis Results */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <div className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                      <Stethoscope className="h-4 w-4" strokeWidth={2.2} />
                    </div>
                    Diagnosis Results
                  </h3>
                  <div className="space-y-4">
                    {diagnosis.results.map((result, index) => (
                      <Card key={index} className="bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm border-white/40 dark:border-white/10 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {result.diseaseName}
                            </h4>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {Math.round(result.probability)}% match
                            </span>
                          </div>
                          <Progress value={result.probability} className="h-2 mb-2" />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Match score: {result.matchScore}</span>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-xs text-blue-600 dark:text-blue-400"
                              onClick={() => navigate(`/diseases?search=${result.diseaseName}`)}
                            >
                              Learn more
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="font-medium">Medical Disclaimer</p>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-2">
                      This diagnosis is based on the symptoms you reported and is not a substitute for professional medical advice. 
                      Please consult with a healthcare provider for proper evaluation and treatment.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/diagnose">
            <Button variant="outline">
              Start New Diagnosis
            </Button>
          </Link>
          <Link to="/home">
            <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
              Return Home
            </Button>
          </Link>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg">
                <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
              </div>
              Delete Diagnosis?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300 pt-2">
              Are you sure you want to delete this diagnosis? This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="rounded-full"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageBackground>
  );
}



