import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getSeverityColor } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageBackground } from "@/components/ui/page-background";

import { useToast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/ui/page-container";
import { 
  ArrowLeft, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle,
  Heart,
  Brain,
  Thermometer,
  Loader2
} from "lucide-react";

// Symptoms derived from diseases fetched from the database
type SymptomOption = { id: string; name: string; category: string };

interface DiagnosisResult {
  id?: string;
  name: string;
  probability: number;
  severity: string;
  symptoms: string[];
  description: string;
  category: string;
  matchScore: number;
}

export default function DiagnosePage() {
  const { user, isLoading, accessToken } = useAuth();
  const location = useLocation();
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnoses, setDiagnoses] = useState<DiagnosisResult[]>([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
  const [symptomOptions, setSymptomOptions] = useState<SymptomOption[]>([]);
  const [search, setSearch] = useState("");

  // Pre-fill symptoms from location state (when editing a diagnosis)
  useEffect(() => {
    if (location.state?.symptoms && Array.isArray(location.state.symptoms)) {
      const normalizedSymptoms = location.state.symptoms.map((s: string) => 
        s.trim().toLowerCase().replace(/\s+/g, '_')
      );
      setSelectedSymptoms(normalizedSymptoms);
      
      // Show a toast to inform the user
      toast({
        title: "Symptoms Loaded",
        description: "Previous symptoms have been loaded. You can modify them and get a new diagnosis.",
      });
    }
  }, [location.state, toast]);

  // On mount, fetch diseases and derive unique symptoms list
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const resp = await apiFetch('/diseases', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const diseases = Array.isArray(data) ? data : Array.isArray(data.diseases) ? data.diseases : [];
        const seen = new Set<string>();
        const options: SymptomOption[] = [];
        for (const d of diseases) {
          const cat = (d.category || 'general').toString().toLowerCase();
          const list: string[] = Array.isArray(d.symptoms) ? d.symptoms : [];
          for (const s of list) {
            const id = s.trim().toLowerCase().replace(/\s+/g, '_');
            if (!seen.has(id)) {
              seen.add(id);
              options.push({ id, name: s, category: cat });
            }
          }
        }
        setSymptomOptions(options);
      } catch (e) {
        // ignore; will fallback to empty list
      }
    };
    if (!isLoading && user) {
      fetchSymptoms();
    }
  }, [isLoading, user, accessToken]);

  // Fetch diseases from database for diagnosis
  const fetchDiagnosisResults = async (symptoms: string[]): Promise<DiagnosisResult[]> => {
    try {
      setIsLoadingDiseases(true);
      const response = await apiFetch('/diseases', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const diseases = Array.isArray(data) ? data : Array.isArray(data.diseases) ? data.diseases : [];
        
        // Simple matching algorithm - in real app this would be more sophisticated
        const matchedDiseases: DiagnosisResult[] = diseases

          .map((disease: any) => {
            const diseaseSymptoms = Array.isArray(disease.symptoms) ? disease.symptoms : [];
            // Normalize both diseaseSymptoms and selectedSymptoms for exact match, replacing _ with space in both
            const normalize = (s: string) => s.replace(/_/g, ' ').trim().toLowerCase();
            const normalizedDiseaseSymptoms = diseaseSymptoms.map((s: string) => normalize(s));
            const normalizedSelectedSymptoms = symptoms.map(s => normalize(s));
            const matchScore = normalizedDiseaseSymptoms.filter((symptom: string) => 
              normalizedSelectedSymptoms.includes(symptom)
            ).length;
            return {
              id: disease.id,
              name: disease.name,
              probability: Math.min(90, (matchScore / symptoms.length) * 100),
              severity: disease.severity || 'Moderate',
              symptoms: diseaseSymptoms,
              description: disease.definition || 'No description available',
              category: disease.category || 'General',
              matchScore
            };
          })
          .filter((disease: DiagnosisResult) => disease.matchScore > 0)
          // Sort by severity (least to most severe), then by matchScore descending
          .sort((a: DiagnosisResult, b: DiagnosisResult) => {
            const severities = ["Mild", "Moderate", "Moderate to Severe", "Severe", "Critical"];
            const aIdx = severities.findIndex(s => s.toLowerCase() === a.severity.toLowerCase());
            const bIdx = severities.findIndex(s => s.toLowerCase() === b.severity.toLowerCase());
            if (aIdx !== bIdx) return aIdx - bIdx;
            return b.matchScore - a.matchScore;
          })
          .slice(0, 5);

        setDiagnoses(matchedDiseases);
        return matchedDiseases;
      } else {
        // Fallback to basic diagnosis if API fails
        setDiagnoses([]);
        return [];
        toast({
          title: "Limited Results",
          description: "Unable to fetch complete diagnosis data. Showing basic results.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching diagnosis results:', error);
      setDiagnoses([]);
      return [];
      toast({
        title: "Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDiseases(false);
    }
  };

  // Save diagnosis to database
  const saveDiagnosis = async (symptoms: string[], results: DiagnosisResult[]) => {
    if (!user) return;
    if (!results[0]?.id) {
      console.error('No disease ID available for diagnosis');
      return;
    }

    try {
      const diagnosisData = {
        symptoms,
        results: results.map(r => ({
          diseaseId: r.id || '',
          diseaseName: r.name,
          probability: r.probability,
          severity: r.severity,
          matchScore: r.matchScore,
          confidence: r.probability / 100 // Convert percentage to decimal
        })),
        primaryDiseaseId: results[0].id // Most likely disease
      };



      const response = await apiFetch('/user/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(diagnosisData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to save diagnosis:', response.status, errorData);
      } else {
        // Diagnosis saved successfully
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error);
    }
  };

  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    if (checked) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    } else {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));
    }
  };

  const analyzeDiagnosis = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the diagnosis feature.",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }

    setIsAnalyzing(true);
    
    const resultsNow = await fetchDiagnosisResults(selectedSymptoms);
    setIsAnalyzing(false);
    setShowResults(true);
    // Save diagnosis to database with the exact results used
    await saveDiagnosis(selectedSymptoms, resultsNow);
  };

  // Using getSeverityColor from constants

  // Show loading if not authenticated
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/signin');
    return null;
  }

  if (showResults) {
    return (
      <PageContainer
        title="Diagnosis Results"
        showBackButton={true}
        onBackClick={() => setShowResults(false)}
      >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Diagnosis Results</h1>
            <p className="text-gray-600 dark:text-gray-400">Based on your symptoms, here are possible conditions</p>
          </div>

          <div className="mb-6">
            <Card className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">Important Disclaimer</p>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-2">
                  This is not a professional medical diagnosis. Please consult with a healthcare provider for proper evaluation and treatment.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {diagnoses.length > 0 ? (
              diagnoses.map((diagnosis, index) => (
                <Card key={diagnosis.name} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        #{index + 1} {diagnosis.name}
                      </CardTitle>
                      <Badge className={getSeverityColor(diagnosis.severity)}>
                        {diagnosis.severity}
                      </Badge>
                    </div>
                    <CardDescription className="dark:text-gray-300">{diagnosis.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="dark:text-gray-300">Match Score</span>
                          <span className="dark:text-gray-300">{Math.round((diagnosis.matchScore / selectedSymptoms.length) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(diagnosis.matchScore / selectedSymptoms.length) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category: {diagnosis.category}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Matching symptoms: {diagnosis.matchScore} out of {selectedSymptoms.length}
                        </p>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/diseases?search=${diagnosis.name}`)}
                      >
                        Learn More About {diagnosis.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No matching diagnoses found for your symptoms.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Consider consulting with a healthcare provider.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <Button 
              onClick={() => setShowResults(false)}
              variant="outline"
              className="flex-1"
            >
              Start New Diagnosis
            </Button>
            <Link to="/home" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                Return Home
              </Button>
            </Link>
          </div>
      </PageContainer>
    );
  }

  if (isAnalyzing) {
    return (
      <PageContainer title="Analyzing Symptoms" showBackButton={true} backTo="/home">
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full">
                  <Brain className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Analyzing Your Symptoms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isLoadingDiseases ? 
                  'Fetching medical database...' : 
                  'Processing your symptoms to provide possible diagnoses...'
                }
              </p>
              <Progress value={isLoadingDiseases ? 90 : 75} className="mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments</p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Symptom Checker"
      showBackButton={true}
      backTo="/home"
    >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Diagnose Yourself
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the symptoms you're experiencing, and we'll provide possible diagnoses and recommendations.
          </p>
        </div>

        <div className="mb-6">
          <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Heart className="h-5 w-5" />
                <p className="font-medium">How it works</p>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                Select all symptoms you're currently experiencing. Our system will analyze them against our medical database and suggest possible conditions. Remember, this is not a substitute for professional medical advice.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Select Your Symptoms
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Choose all symptoms that apply to your current condition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search symptoms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(symptomOptions.length > 0 ? symptomOptions.filter(symptom =>
                symptom.name.toLowerCase().includes(search.toLowerCase())
              ) : []).map((symptom) => (
                <div key={symptom.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Checkbox
                    id={symptom.id}
                    checked={selectedSymptoms.includes(symptom.id)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom.id, !!checked)}
                  />
                  <label 
                    htmlFor={symptom.id} 
                    className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer dark:text-gray-100"
                  >
                    {symptom.name}
                  </label>
                </div>
              ))}
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                  Selected Symptoms ({selectedSymptoms.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(symptomId => {
                    const symptom = symptomOptions.find(s => s.id === symptomId);
                    return (
                      <Badge key={symptomId} className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                        {symptom?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <Button 
              onClick={analyzeDiagnosis}
              disabled={selectedSymptoms.length === 0}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-12"
            >
              {selectedSymptoms.length === 0 ? 
                'Select at least one symptom' : 
                `Analyze ${selectedSymptoms.length} Symptom${selectedSymptoms.length !== 1 ? 's' : ''}`
              }
            </Button>
          </CardContent>
        </Card>
    </PageContainer>
  );
}



