import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { getCategoryColor, getSeverityColor } from "@/constants";
import {
  Search,
  AlertTriangle,
  Pill,
  TestTube,
  Activity,
  Info,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

// Import Disease interface from shared API
import { Disease } from "@shared/api";
import { useIsMobile } from "@/hooks/use-mobile";


function DiseasesPage() {
  
// Utility function to validate disease objects
const isValidDiseaseObject = (disease: any): disease is Disease => {
  return disease && 
    typeof disease === 'object' && 
    'id' in disease && 
    'name' in disease && 
    'category' in disease && 
    'severity' in disease && 
    'definition' in disease && 
    Array.isArray(disease.symptoms) && 
    Array.isArray(disease.causes) && 
    Array.isArray(disease.testsAndProcedures) && 
    Array.isArray(disease.medications) && 
    Array.isArray(disease.prevention) && 
    'prognosis' in disease;
};

  const { user, isLoading, accessToken } = useAuth();
  
  const isMobile = useIsMobile();
  
  // State for diseases data
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  
  // Check if selectedDisease is valid using our utility function
  const isValidDisease = selectedDisease ? isValidDiseaseObject(selectedDisease) : false;

  // Fetch diseases from backend
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setIsLoadingDiseases(true);
        const response = await apiFetch('/diseases', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch diseases');
        }
        
        const data = await response.json();
        // Support both shapes: admin returns { diseases }, public returns array
        const list = Array.isArray(data) ? data : Array.isArray(data.diseases) ? data.diseases : [];
        // Validate disease data before setting state
        const validatedDiseases = list.filter(isValidDiseaseObject);
        
        setDiseases(validatedDiseases);
        setError(null);
        
        // If there's a disease ID in the URL, select that disease
        const diseaseId = searchParams.get("id");
        if (diseaseId) {
          const disease = validatedDiseases.find((d: Disease) => d.id === diseaseId) || null;
          setSelectedDisease(disease);
        }
      } catch (err) {
        console.error('Error fetching diseases:', err);
        setError('Failed to load diseases. Please try again later.');
        setDiseases([]);
      } finally {
        setIsLoadingDiseases(false);
      }
    };
    
    if (!isLoading && user) {
      fetchDiseases();
    }
  }, [searchParams, isLoading, user, accessToken]);

  // Filter diseases by search query and category
  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const diseaseCategories = Array.isArray(disease.categories) ? disease.categories : [];
    const matchesCategory =
      selectedCategory === "all" ||
      disease.category === selectedCategory ||
      diseaseCategories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter (from both category and categories[])
  const allCategories = Array.from(
    new Set(
      diseases.flatMap(d => [d.category, ...(Array.isArray(d.categories) ? d.categories : [])])
    )
  ).filter(Boolean).sort();
  const categories = ["all", ...allCategories];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchParams(prev => {
      if (query) {
        prev.set("q", query);
      } else {
        prev.delete("q");
      }
      return prev;
    });
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle disease selection
  const handleDiseaseSelect = (disease: Disease) => {
    setSelectedDisease(disease);
    setSearchParams(prev => {
      prev.set("id", disease.id);
      return prev;
    });
  };

  // Handle back button click
  const handleBackClick = () => {
    setSelectedDisease(null);
    setSearchParams(prev => {
      prev.delete("id");
      return prev;
    });
  };

  // Render function with conditional rendering
  const renderContent = () => {
    // Display an error message when selectedDisease exists but is invalid
    if (selectedDisease && !isValidDisease) {
      return (
        <div className="container mx-auto p-4 min-h-screen">
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">Invalid Disease Data</h2>
              <p className="text-gray-700 mb-6">
                We encountered an issue with the disease data. The selected disease appears to be incomplete or corrupted.
              </p>
              <Button 
                variant="outline" 
                className="bg-white hover:bg-gray-100"
                onClick={handleBackClick}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // If a valid disease is selected, show its details
    if (selectedDisease && isValidDisease) {
      return (
            <><div className={`mb-8`}>
          <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'items-center gap-4'} mb-4`}>
            <h1 className={`text-2xl ${isMobile ? 'mb-2' : 'text-3xl'} font-bold text-gray-900 dark:text-gray-100 drop-shadow-md`}>{selectedDisease?.name}</h1>
            <div className={`flex flex-wrap gap-2`}>
              <Badge className={getCategoryColor(selectedDisease?.category || '')}>
                {selectedDisease?.category}
              </Badge>
              {selectedDisease?.categories && selectedDisease.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedDisease.categories.map((cat: string) => (
                    <Badge key={cat} className={getCategoryColor(cat)}>{cat}</Badge>
                  ))}
                </div>
              )}
              <Badge className={getSeverityColor(selectedDisease?.severity || '')}>
                {selectedDisease?.severity}
              </Badge>
            </div>
          </div>
          <p className={`text-base ${isMobile ? 'mb-2' : 'text-lg'} text-gray-600`}>{selectedDisease?.definition}</p>
        </div><Tabs defaultValue="symptoms" className="space-y-6">
            <TabsList className={`w-full ${isMobile ? 'flex overflow-x-auto no-scrollbar space-x-2' : 'grid grid-cols-5'}`}>
              <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
              <TabsTrigger value="causes">Causes</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
              <TabsTrigger value="prevention">Prevention</TabsTrigger>
            </TabsList>

            <TabsContent value="symptoms">
              <Card className={isMobile ? 'bg-white/90 dark:bg-gray-900/90' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Symptoms
                  </CardTitle>
                  <CardDescription>
                    Common signs and symptoms of {selectedDisease?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedDisease?.symptoms?.map((symptom, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="causes">
              <Card className={isMobile ? 'bg-white/90 dark:bg-gray-900/90' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Causes
                  </CardTitle>
                  <CardDescription>
                    Common causes of {selectedDisease?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedDisease?.causes?.map((cause, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {cause}
                      </li>
                    ))}
                  </ul>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests">
              <Card className={isMobile ? 'bg-white/90 dark:bg-gray-900/90' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-purple-500" />
                    Tests & Procedures
                  </CardTitle>
                  <CardDescription>
                    Diagnostic tests and procedures for {selectedDisease.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedDisease?.testsAndProcedures?.map((test, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        {test}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatment">
              <Card className={isMobile ? 'bg-white/90 dark:bg-gray-900/90' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-green-500" />
                    Treatment & Medications
                  </CardTitle>
                  <CardDescription>
                    Available treatments and medications for {selectedDisease?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {selectedDisease?.medications?.map((medication, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {medication}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Prognosis</h4>
                      <p className="text-yellow-700 text-sm">{selectedDisease?.prognosis}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prevention">
              <Card className={isMobile ? 'bg-white/90 dark:bg-gray-900/90' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    Prevention
                  </CardTitle>
                  <CardDescription>
                    How to prevent {selectedDisease?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedDisease?.prevention?.map((prevention, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        {prevention}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs></>
      );
    }
    
    // Default view - disease list
    return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">Disease Information</h1>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search diseases..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 bg-white/80 dark:bg-gray-800/80"
              />
            </div>
          </div>
          
          {/* Category filter as dropdown */}
          <div className="mb-4 flex items-center gap-2">
            <label htmlFor="category-select" className="font-semibold text-base">Category:</label>
            <select
              id="category-select"
              name="category"
              autoComplete="category"
              value={selectedCategory}
              onChange={e => handleCategoryChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
            
            {/* Disease list and states */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : error ? (
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:text-gray-100">
                <CardContent className="pt-6">
                  <div className="text-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredDiseases.length === 0 ? (
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:text-gray-100">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    <p>No diseases found matching your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDiseases.map(disease => (
                  <Card 
                    key={disease.id} 
                    className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:text-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleDiseaseSelect(disease)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{disease.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className={getCategoryColor(disease.category)}>
                          {disease.category}
                        </Badge>
                        {disease.categories && disease.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {disease.categories.map((cat: string) => (
                                <Badge key={cat} className={getCategoryColor(cat)}>{cat}</Badge>
                            ))}
                          </div>
                        )}
                        <Badge className={getSeverityColor(disease.severity)}>
                          {disease.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                        {disease.definition}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* End of filter and disease list */}
        </div>
    );
  };
  
  // Main component return
  return (
    <PageContainer title={selectedDisease ? selectedDisease.name : "Diseases"} showBackButton={!!selectedDisease} onBackClick={selectedDisease ? handleBackClick : undefined}>
      {renderContent()}
    </PageContainer>
  );
}

export default DiseasesPage;




