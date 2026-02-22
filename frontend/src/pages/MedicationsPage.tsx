import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor } from "@/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/ui/page-container";
import { 
  ArrowLeft, 
  Pill, 
  Search,
  AlertTriangle,
  Info,
  Shield,
  Clock,
  TestTube,
  Activity,
  Heart,
  Loader2
} from "lucide-react";
import { Medication } from "@shared/api";
import { useIsMobile } from "@/hooks/use-mobile";

// Using Medication interface from shared/api.ts
function MedicationsPage() {
  const { user, isLoading, accessToken } = useAuth();
  
  const isMobile = useIsMobile();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoadingMeds, setIsLoadingMeds] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [searchParams] = useSearchParams();

  // Fetch medications from the backend
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoadingMeds(true);
        const response = await apiFetch('/medications', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching medications: ${response.status}`);
        }
        
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data.medications) ? data.medications : [];
        setMedications(list);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch medications:', err);
        setError('Failed to load medications. Please try again later.');
      } finally {
        setIsLoadingMeds(false);
      }
    };

    if (!isLoading && user) {
      fetchMedications();
    }
  }, [isLoading, user, accessToken]);

  // Handle search query from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
      const medication = medications.find(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (medication) {
        setSelectedMedication(medication);
      }
    }
  }, [searchParams, medications]);

  // Filter medications based on search term
  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(med.disease) ? med.disease.join(',').toLowerCase() : med.disease.toLowerCase()).includes(searchTerm.toLowerCase()) ||
    med.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDiseaseColor = (disease: string) => {
    // Use a hash function to generate consistent colors for diseases
    const colorOptions = [
      'bg-red-100 text-red-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800'
    ];
    
    // Simple hash function to get consistent colors
    const hash = disease.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorOptions[hash % colorOptions.length] || 'bg-gray-100 text-gray-800';
  };

  // getCategoryColor is now imported from constants

  if (selectedMedication) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isMobile ? 'pb-16' : ''}`}>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex justify-between items-center h-16 ${isMobile ? 'flex-col gap-2 h-auto py-2' : ''}`}> 
              <button 
                onClick={() => setSelectedMedication(null)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Medications
              </button>
              <div className={`flex items-center gap-4 ${isMobile ? 'w-full justify-end' : ''}`}> 
                <Link to="/home" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  Home
                </Link>
                {/* Theme toggle removed due to missing component */}
              </div>
            </div>
          </div>
        </header>

        <main className={`mx-auto px-2 sm:px-6 lg:px-8 py-6 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}></main>
          <div className="mb-8">
            <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'flex-col items-start gap-2' : ''}`}> 
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100" id="medication-name">{selectedMedication.name}</h1>
              {Array.isArray(selectedMedication.disease) && selectedMedication.disease.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedMedication.disease.map((d) => (
                    <Badge className={getDiseaseColor(d)} key={d}>{d}</Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge className={getCategoryColor(selectedMedication.category)} id="medication-category">
                  {selectedMedication.category}
                </Badge>
                {selectedMedication.categories && selectedMedication.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMedication.categories.map((cat: string) => (
                      <Badge key={cat} className={getCategoryColor(cat)} id={`category-${cat}`}>{cat}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300" id="medication-purpose">{selectedMedication.purpose}</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className={`w-full bg-white/80 dark:bg-gray-800/80 border dark:border-gray-700 ${isMobile ? 'overflow-x-auto flex whitespace-nowrap gap-1' : 'grid grid-cols-5'}`}> 
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dosage">Dosage</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="warnings">Warnings</TabsTrigger>
              <TabsTrigger value="usage">How to Use</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className={`gap-6 ${isMobile ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-2'}`}> 
                <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">{selectedMedication.howItWorks}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Side Effects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">{selectedMedication.sideEffects}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dosage">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-green-500" />
                    Dosage Information
                  </CardTitle>
                  <CardDescription>
                    Standard dosing guidelines for {selectedMedication.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedMedication.dosage.map((dose, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {dose}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interactions">
              <div className={`gap-6 ${isMobile ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-2'}`}> 
                <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-purple-500" />
                      Drug Interactions
                    </CardTitle>
                    <CardDescription>
                      Medications that may interact with {selectedMedication.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedMedication.interactions.map((interaction, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          {interaction}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Contraindications
                    </CardTitle>
                    <CardDescription>
                      When NOT to use {selectedMedication.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedMedication.contraindications.map((contraindication, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {contraindication}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="warnings">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Important Warnings
                  </CardTitle>
                  <CardDescription>
                    Critical safety information for {selectedMedication.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedMedication.warnings.map((warning, index) => (
                      <div key={index} className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
                        <p className="text-red-800 dark:text-red-200 text-sm font-medium">{warning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    How to Take
                  </CardTitle>
                  <CardDescription>
                    Proper usage instructions for {selectedMedication.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200">{selectedMedication.whenToTake}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    );
  }

  return (
    <PageContainer title="Medications" showBackButton={true} onBackClick={() => window.history.back()}>
      <div className="container mx-auto">
        {/* Info Banner */}
        <div className="mb-6">
          <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Info className="h-5 w-5" />
                <p className="font-medium">Medication Information Database</p>
              </div>
              <p className="text-blue-700 dark:text-blue-200 text-sm mt-2">
                This page shows comprehensive information about various medications including what each medication is for, how it works, dosage, and potential side effects. Always consult with your healthcare provider before starting or stopping any medication.
              </p>
            </CardContent>
          </Card>
        </div>

        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Medication Database
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Learn about different medications, their purposes, effects, and usage guidelines
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 h-4 w-4" />
            <label htmlFor="medication-search" className="sr-only">Search medications, diseases, or categories</label>
            <Input
              id="medication-search"
              name="search"
              autoComplete="off"
              placeholder="Search medications, diseases, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Medications Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : error ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Medications</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {error}
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredMedications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map((medication) => (
              <Card key={medication.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    {Array.isArray(medication.disease) && medication.disease.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {medication.disease.map((d) => (
                          <Badge className={getDiseaseColor(d)} key={d}>{d}</Badge>
                        ))}
                      </div>
                    )}
                    <Badge className={getCategoryColor(medication.category)}>
                      {medication.category}
                    </Badge>
                    {medication.categories && medication.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medication.categories.map((cat: string) => (
                          <Badge key={cat} className={getCategoryColor(cat)}>{cat}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {medication.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What it's for:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{medication.purpose}</p>
                    </div>
                    
                    {medication.sideEffects && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                          <h4 className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Common Side Effects:</h4>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-200">{medication.sideEffects}</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      onClick={() => setSelectedMedication(medication)}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-12 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No medications found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your search terms
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

export default MedicationsPage;


