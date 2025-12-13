
import { smartSplit } from "../lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SEVERITIES, PREVALENCE_OPTIONS, getSeverityColor, getCategoryColor, getDiseaseColor } from "@/constants";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageContainer } from "@/components/ui/page-container";
import { ImportDataDialog } from "@/components/admin/ImportDataDialog";
import { 
  ArrowLeft, 
  Shield, 
  Plus,
  Search,
  Edit,
  Trash2,
  Database,
  BarChart3,
  Users,
  Activity,
  Pill
} from "lucide-react";

interface Disease {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  severity: string;
  definition: string;
  symptoms: string[];
  causes: string[];
  testsAndProcedures: string[];
  medications: string[];
  treatments: string[];
  prevention: string[];
  prognosis: string;
  prevalence: string;
  createdAt: string;
}

interface Medication {
  id: string;
  name: string;
  purpose: string;
  disease: string[]; // now an array
  sideEffects: string;
  dosage: string[];
  contraindications: string[];
  interactions: string[];
  howItWorks: string;
  whenToTake: string;
  warnings: string[];
  category: string;
  categories?: string[];
  createdAt: string;
}

interface AdminStats {
  totalDiseases: number;
  totalMedications: number;
  totalUsers: number;
  totalDiagnoses: number;
  recentActivity: number;
}

export default function AdminPage() {
  const isMobile = useIsMobile();
  const { user, isLoading, accessToken } = useAuth();
  const { toast } = useToast();
  
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(true);
  const [isLoadingMedications, setIsLoadingMedications] = useState(true);
  const [diseasesError, setDiseasesError] = useState<string | null>(null);
  const [medicationsError, setMedicationsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicationSearchTerm, setMedicationSearchTerm] = useState("");
  
  // Options for select dropdowns
  const [diseaseOptions, setDiseaseOptions] = useState<string[]>([]);
  const [medicationCategories, setMedicationCategories] = useState<string[]>([]);
  const [diseaseCategories, setDiseaseCategories] = useState<string[]>([]);
  const [severities, setSeverities] = useState<string[]>(SEVERITIES);
  const [prevalenceOptions, setPrevalenceOptions] = useState<string[]>(PREVALENCE_OPTIONS);
  
  // Disease Management
  const [showAddDiseaseDialog, setShowAddDiseaseDialog] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const [diseaseFormData, setDiseaseFormData] = useState({
    name: "",
    category: "",
    categories: "",
    severity: "",
    definition: "",
    symptoms: "",
    causes: "",
    testsAndProcedures: "",
    medications: "",
    treatments: "",
    prevention: "",
    prognosis: "",
    prevalence: ""
  });

  // Medication Management
  const [showAddMedicationDialog, setShowAddMedicationDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationFormData, setMedicationFormData] = useState({
    name: "",
    purpose: "",
    disease: [], // now an array
    sideEffects: "",
    dosage: "",
    contraindications: "",
    interactions: "",
    howItWorks: "",
    whenToTake: "",
    warnings: "",
    category: "",
    categories: ""
  });

  const [stats, setStats] = useState<AdminStats>({
    totalDiseases: 0,
    totalMedications: 0,
    totalUsers: 0,
    totalDiagnoses: 0,
    recentActivity: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch diseases from backend
  useEffect(() => {
    const fetchDiseases = async () => {
      if (isLoading || !user) return;
      
      try {
        setIsLoadingDiseases(true);
         const response = await apiFetch('/admin/diseases', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch diseases');
        }
        
         const data = await response.json();
         const fetchedDiseases = Array.isArray(data) ? data : (data.diseases || []);
        setDiseases(fetchedDiseases);
        
        // Extract unique disease names for the dropdown options
        const uniqueDiseaseNames = Array.from(new Set(fetchedDiseases.map((disease: Disease) => disease.name)));
        setDiseaseOptions(uniqueDiseaseNames.sort() as string[]);
        
        // Extract unique disease categories for the category dropdown
        const uniqueCategories = Array.from(new Set(fetchedDiseases.flatMap((disease: Disease) => disease.categories && disease.categories.length ? disease.categories : [disease.category])));
        setDiseaseCategories(uniqueCategories.sort() as string[]);
        
        setDiseasesError(null);
      } catch (err) {
        console.error('Error fetching diseases:', err);
        setDiseasesError('Failed to load diseases. Please try again later.');
      } finally {
        setIsLoadingDiseases(false);
      }
    };
    
    if (!isLoading && user) {
      fetchDiseases();
    }
  }, [isLoading, user, accessToken]);

  // Fetch medications from backend
  useEffect(() => {
    const fetchMedications = async () => {
      if (isLoading || !user) return;
      
      try {
        setIsLoadingMedications(true);
         const response = await apiFetch('/admin/medications', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch medications');
        }
        
         const data = await response.json();
         const fetchedMedications = Array.isArray(data) ? data : (data.medications || []);
        setMedications(fetchedMedications);
        
  // Extract unique medication categories for the dropdown options
  const uniqueCategories = Array.from(new Set(fetchedMedications.flatMap((med: Medication) => med.categories && med.categories.length ? med.categories : [med.category])));
  setMedicationCategories(uniqueCategories.sort() as string[]);
        
        setMedicationsError(null);
      } catch (err) {
        console.error('Error fetching medications:', err);
        setMedicationsError('Failed to load medications. Please try again later.');
      } finally {
        setIsLoadingMedications(false);
      }
    };
    
    if (!isLoading && user) {
      fetchMedications();
    }
  }, [isLoading, user, accessToken]);

  // Fetch admin stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      if (isLoading || !user) return;
      
      try {
        setIsLoadingStats(true);
        const response = await apiFetch('/admin/stats', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin stats');
        }
        
        const data = await response.json();
        setStats({
          totalDiseases: data.totalDiseases || 0,
          totalMedications: data.totalMedications || 0,
          totalUsers: data.totalUsers || 0,
          totalDiagnoses: data.totalDiagnoses || 0,
          recentActivity: data.recentActivity || 0
        });
        setStatsError(null);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setStatsError('Failed to load statistics. Please try again later.');
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    if (!isLoading && user) {
      fetchStats();
    }
  }, [isLoading, user, accessToken]);

  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(medicationSearchTerm.toLowerCase()) ||
    med.disease.some(d => d.toLowerCase().includes(medicationSearchTerm.toLowerCase()))
  );

  // Disease Management Functions
  const handleAddDisease = async () => {
    try {
      const diseaseData = {
        name: diseaseFormData.name,
        category: diseaseFormData.category,
        categories: diseaseFormData.categories
          ? smartSplit(diseaseFormData.categories).map(s => s.trim()).filter(Boolean)
          : [],
        severity: diseaseFormData.severity,
        definition: diseaseFormData.definition,
        symptoms: smartSplit(diseaseFormData.symptoms).map(s => s.trim()).filter(s => s),
        causes: smartSplit(diseaseFormData.causes).map(s => s.trim()).filter(s => s),
        testsAndProcedures: smartSplit(diseaseFormData.testsAndProcedures).map(s => s.trim()).filter(s => s),
        medications: smartSplit(diseaseFormData.medications).map(s => s.trim()).filter(s => s),
        treatments: smartSplit(diseaseFormData.treatments).map(s => s.trim()).filter(s => s),
        prevention: smartSplit(diseaseFormData.prevention).map(s => s.trim()).filter(s => s),
        prognosis: diseaseFormData.prognosis,
        prevalence: diseaseFormData.prevalence
      };

      const token = accessToken;
      const response = await apiFetch('/admin/diseases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diseaseData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to add disease');
      }

      const data = await response.json();
      setDiseases([...diseases, data.disease]);
      setShowAddDiseaseDialog(false);
      resetDiseaseForm();
      toast({ title: "Success", description: "Disease added successfully!" });
    } catch (error) {
      console.error('Error adding disease:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add disease. Please try again.';
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleEditDisease = async () => {
    if (!editingDisease) return;

    try {
      const diseaseData = {
        name: diseaseFormData.name,
        category: diseaseFormData.category,
        categories: diseaseFormData.categories
          ? smartSplit(diseaseFormData.categories).map(s => s.trim()).filter(Boolean)
          : undefined,
        severity: diseaseFormData.severity,
        definition: diseaseFormData.definition,
        symptoms: smartSplit(diseaseFormData.symptoms).map(s => s.trim()).filter(s => s),
        causes: smartSplit(diseaseFormData.causes).map(s => s.trim()).filter(s => s),
        testsAndProcedures: smartSplit(diseaseFormData.testsAndProcedures).map(s => s.trim()).filter(s => s),
        medications: smartSplit(diseaseFormData.medications).map(s => s.trim()).filter(s => s),
        treatments: smartSplit(diseaseFormData.treatments).map(s => s.trim()).filter(s => s),
        prevention: smartSplit(diseaseFormData.prevention).map(s => s.trim()).filter(s => s),
        prognosis: diseaseFormData.prognosis,
        prevalence: diseaseFormData.prevalence
      };

      const response = await apiFetch(`/admin/diseases/${editingDisease.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(diseaseData)
      });

      if (!response.ok) {
        throw new Error('Failed to update disease');
      }

      const data = await response.json();
      
      const updatedDiseases = diseases.map(disease =>
        disease.id === editingDisease.id ? data.disease : disease
      );

      setDiseases(updatedDiseases);
      setEditingDisease(null);
      resetDiseaseForm();
      toast({ title: "Success", description: "Disease updated successfully!" });
    } catch (error) {
      console.error('Error updating disease:', error);
      toast({ title: "Error", description: "Failed to update disease. Please try again.", variant: "destructive" });
    }
  };

  const handleDeleteDisease = async (id: string) => {
    try {
      const response = await apiFetch(`/admin/diseases/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete disease');
      }

      setDiseases(diseases.filter(disease => disease.id !== id));
      toast({ title: "Success", description: "Disease deleted successfully!" });
    } catch (error) {
      console.error('Error deleting disease:', error);
      toast({ title: "Error", description: "Failed to delete disease. Please try again.", variant: "destructive" });
    }
  };

  const resetDiseaseForm = () => {
    setDiseaseFormData({
      name: "",
      category: "",
      categories: "",
      severity: "",
      definition: "",
      symptoms: "",
      causes: "",
      testsAndProcedures: "",
      medications: "",
      treatments: "",
      prevention: "",
      prognosis: "",
      prevalence: ""
    });
  };

  const openEditDiseaseDialog = (disease: Disease) => {
    setEditingDisease(disease);
    setDiseaseFormData({
      name: disease.name,
      category: disease.category,
      categories: (disease.categories && disease.categories.length ? disease.categories : []).join(', '),
      severity: disease.severity,
      definition: disease.definition,
      symptoms: disease.symptoms.join(', '),
      causes: disease.causes.join(', '),
      testsAndProcedures: disease.testsAndProcedures.join(', '),
      medications: disease.medications.join(', '),
      treatments: disease.treatments.join(', '),
      prevention: disease.prevention.join(', '),
      prognosis: disease.prognosis,
      prevalence: disease.prevalence
    });
    setShowAddDiseaseDialog(true);
  };

  // Medication Management Functions
  const handleAddMedication = async () => {
    try {
      const medicationData = {
        name: medicationFormData.name,
        purpose: medicationFormData.purpose,
        disease: medicationFormData.disease,
        sideEffects: medicationFormData.sideEffects,
        dosage: smartSplit(medicationFormData.dosage).map(s => s.trim()).filter(s => s),
        contraindications: smartSplit(medicationFormData.contraindications).map(s => s.trim()).filter(s => s),
        interactions: smartSplit(medicationFormData.interactions).map(s => s.trim()).filter(s => s),
        howItWorks: medicationFormData.howItWorks,
        whenToTake: medicationFormData.whenToTake,
        warnings: smartSplit(medicationFormData.warnings).map(s => s.trim()).filter(s => s),
        category: medicationFormData.category,
        categories: medicationFormData.categories
          ? smartSplit(medicationFormData.categories).map(s => s.trim()).filter(Boolean)
          : []
      };

      const response = await apiFetch('/admin/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(medicationData)
      });

      if (!response.ok) {
        throw new Error('Failed to add medication');
      }

      const data = await response.json();
      setMedications([...medications, data.medication]);
      setShowAddMedicationDialog(false);
      resetMedicationForm();
      toast({ title: "Success", description: "Medication added successfully!" });
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({ title: "Error", description: "Failed to add medication. Please try again.", variant: "destructive" });
    }
  };

  const handleEditMedication = async () => {
    if (!editingMedication) return;

    try {
      const medicationData = {
        name: medicationFormData.name,
        purpose: medicationFormData.purpose,
        disease: medicationFormData.disease,
        sideEffects: medicationFormData.sideEffects,
        dosage: smartSplit(medicationFormData.dosage).map(s => s.trim()).filter(s => s),
        contraindications: smartSplit(medicationFormData.contraindications).map(s => s.trim()).filter(s => s),
        interactions: smartSplit(medicationFormData.interactions).map(s => s.trim()).filter(s => s),
        howItWorks: medicationFormData.howItWorks,
        whenToTake: medicationFormData.whenToTake,
        warnings: smartSplit(medicationFormData.warnings).map(s => s.trim()).filter(s => s),
        category: medicationFormData.category,
        categories: medicationFormData.categories
          ? smartSplit(medicationFormData.categories).map(s => s.trim()).filter(Boolean)
          : []
      };

      const response = await apiFetch(`/admin/medications/${editingMedication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(medicationData)
      });

      if (!response.ok) {
        throw new Error('Failed to update medication');
      }

      const data = await response.json();
      
      const updatedMedications = medications.map(med =>
        med.id === editingMedication.id ? data.medication : med
      );

      setMedications(updatedMedications);
      setEditingMedication(null);
      resetMedicationForm();
      toast({ title: "Success", description: "Medication updated successfully!" });
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({ title: "Error", description: "Failed to update medication. Please try again.", variant: "destructive" });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const response = await apiFetch(`/admin/medications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete medication');
      }

      setMedications(medications.filter(med => med.id !== id));
      toast({ title: "Success", description: "Medication deleted successfully!" });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({ title: "Error", description: "Failed to delete medication. Please try again.", variant: "destructive" });
    }
  };

  const resetMedicationForm = () => {
    setMedicationFormData({
      name: "",
      purpose: "",
      disease: [],
      sideEffects: "",
      dosage: "",
      contraindications: "",
      interactions: "",
      howItWorks: "",
      whenToTake: "",
      warnings: "",
      category: "",
      categories: ""
    });
  };

  const openEditMedicationDialog = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationFormData({
      name: medication.name,
      purpose: medication.purpose,
      disease: medication.disease,
      sideEffects: medication.sideEffects,
      dosage: medication.dosage.join(', '),
      contraindications: medication.contraindications.join(', '),
      interactions: medication.interactions.join(', '),
      howItWorks: medication.howItWorks,
      whenToTake: medication.whenToTake,
      warnings: medication.warnings.join(', '),
      category: medication.category,
      categories: (medication.categories && medication.categories.length ? medication.categories : []).join(', ')
    });
    setShowAddMedicationDialog(true);
  };

  // Using getSeverityColor from constants

  // Using getCategoryColor from constants

  // Using getDiseaseColor from constants

  return (
    <PageContainer
      title="Admin Dashboard"
      showBackButton={true}
      backTo="/home"
    >
      <div className="mb-6">
        <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-2 text-gray-900 dark:text-white`}>
          Medical Database Administration
        </h2>
        <p className={`text-gray-600 dark:text-gray-200 ${isMobile ? 'text-sm' : ''}`}>
          Manage diseases, medications, view statistics, and maintain the medical database
        </p>
      
      <Tabs defaultValue="overview" className="space-y-6">
          <TabsList
            className={`bg-white/80 dark:bg-gray-800/80 border dark:border-gray-700 ${
              isMobile 
                ? 'flex w-max gap-1 min-w-max'
                : 'w-full grid grid-cols-4'
            }`}
          >
            <TabsTrigger value="overview" className={isMobile ? 'px-4 py-2 text-sm whitespace-nowrap' : ''}>
              {isMobile ? 'Overview' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="diseases" className={isMobile ? 'px-4 py-2 text-sm whitespace-nowrap' : ''}>
              {isMobile ? 'Diseases' : 'Disease Management'}
            </TabsTrigger>
            <TabsTrigger value="medications" className={isMobile ? 'px-4 py-2 text-sm whitespace-nowrap' : ''}>
              {isMobile ? 'Medications' : 'Medication Management'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className={isMobile ? 'px-4 py-2 text-sm whitespace-nowrap' : ''}>
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'}`}>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-blue-100 ${isMobile ? 'text-sm' : ''}`}>Total Diseases</p>
                      <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>{stats.totalDiseases}</p>
                    </div>
                    <Database className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-blue-200`} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-green-100 ${isMobile ? 'text-sm' : ''}`}>Total Medications</p>
                      <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>{stats.totalMedications}</p>
                    </div>
                    <Pill className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-green-200`} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-purple-100 ${isMobile ? 'text-sm' : ''}`}>Registered Users</p>
                      <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-purple-200`} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-indigo-100 ${isMobile ? 'text-sm' : ''}`}>Total Diagnoses</p>
                      <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>{stats.totalDiagnoses.toLocaleString()}</p>
                    </div>
                    <BarChart3 className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-indigo-200`} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-orange-100 ${isMobile ? 'text-sm' : ''}`}>Recent Activity</p>
                      <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>{stats.recentActivity}</p>
                    </div>
                    <Activity className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-orange-200`} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className={`mt-8 ${isMobile ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>Recent Disease Additions</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>Latest diseases added to the database</CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <div className="space-y-4">
                    {diseases.slice(0, 3).map((disease) => (
                      <div key={disease.id} className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-3'} bg-gray-50 rounded-lg`}>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm truncate' : ''}`}>{disease.name}</p>
                          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Added on {new Date(disease.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Badge className={`${getCategoryColor(disease.category)} ${isMobile ? 'text-xs px-2 py-1' : ''}`}> 
                            {disease.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>Recent Medication Additions</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>Latest medications added to the database</CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <div className="space-y-4">
                    {medications.slice(0, 3).map((medication) => (
                      <div key={medication.id} className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-3'} bg-gray-50 rounded-lg`}>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm truncate' : ''}`}>{medication.name}</p>
                          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Added on {new Date(medication.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge className={`${getDiseaseColor(medication.disease[0])} ${isMobile ? 'text-xs px-2 py-1' : ''} ml-2`}>
                          {medication.disease[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Disease Management Tab */}
          <TabsContent value="diseases">
            <div className="space-y-6">
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                <div className={`${isMobile ? 'w-full' : 'max-w-md'} relative`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <label htmlFor="admin-disease-search" className="sr-only">Search diseases</label>
                  <Input
                    id="admin-disease-search"
                    name="search"
                    autoComplete="off"
                    placeholder="Search diseases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className={`flex ${isMobile ? 'flex-col w-full' : ''} gap-2`}>
                  <ImportDataDialog onImportComplete={() => {
                    // Refresh diseases list after import
                    window.location.reload();
                  }} />
                  
                  <Dialog open={showAddDiseaseDialog} onOpenChange={setShowAddDiseaseDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className={`bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 ${isMobile ? 'w-full' : ''}`}
                        onClick={resetDiseaseForm}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Disease
                      </Button>
                    </DialogTrigger>
                  <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] m-2' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
                    <DialogHeader>
                      <DialogTitle className={isMobile ? 'text-lg' : 'text-xl'}>
                        {editingDisease ? "Edit Disease" : "Add New Disease"}
                      </DialogTitle>
                      <DialogDescription className={isMobile ? 'text-base' : 'text-lg'}>
                        Enter comprehensive information about the disease
                      </DialogDescription>
                    </DialogHeader>
                      <div className="grid gap-6 p-2 sm:p-4">
                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                          <div className="space-y-3">
                            <Label htmlFor="name" className={isMobile ? 'text-base' : 'text-lg'}>Disease Name</Label>
                            <Input
                              id="name"
                              name="name"
                              autoComplete="off"
                              value={diseaseFormData.name}
                              onChange={(e) => setDiseaseFormData({...diseaseFormData, name: e.target.value})}
                              placeholder="e.g., Common Cold"
                              className={isMobile ? 'text-base py-3 rounded-lg' : 'text-lg py-2 rounded-md'}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="category" className={isMobile ? 'text-base' : 'text-lg'}>Primary Category</Label>
                            <Input
                              id="category"
                              name="category"
                              autoComplete="off"
                              value={diseaseFormData.category}
                              onChange={(e) => setDiseaseFormData({...diseaseFormData, category: e.target.value})}
                              placeholder="e.g., Respiratory"
                              className={isMobile ? 'text-base py-3 rounded-lg' : 'text-lg py-2 rounded-md'}
                            />
                            <p className="text-xs text-gray-500">Type a new category or reuse an existing one.</p>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="categories" className={isMobile ? 'text-base' : 'text-lg'}>Additional Categories (comma-separated)</Label>
                            <Input
                              id="categories"
                              name="categories"
                              autoComplete="off"
                              value={diseaseFormData.categories}
                              onChange={(e) => setDiseaseFormData({...diseaseFormData, categories: e.target.value})}
                              placeholder="e.g., Respiratory, Infectious"
                              className={isMobile ? 'text-base py-3 rounded-lg' : 'text-lg py-2 rounded-md'}
                            />
                            <p className="text-xs text-gray-500">Add multiple categories separated by commas.</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="severity" className={isMobile ? 'text-sm' : ''}>Severity</Label>
                          <Select onValueChange={(value) => setDiseaseFormData({...diseaseFormData, severity: value})}>
                            <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              {severities.map((severity) => (
                                <SelectItem key={severity} value={severity} className={isMobile ? 'text-sm' : ''}>{severity}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prevalence" className={isMobile ? 'text-sm' : ''}>Prevalence</Label>
                          <Select onValueChange={(value) => setDiseaseFormData({...diseaseFormData, prevalence: value})}>
                            <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                              <SelectValue placeholder="Select prevalence" />
                            </SelectTrigger>
                            <SelectContent>
                              {prevalenceOptions.map((prevalence) => (
                                <SelectItem key={prevalence} value={prevalence} className={isMobile ? 'text-sm' : ''}>{prevalence}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="definition" className={isMobile ? 'text-sm' : ''}>Definition</Label>
                        <Textarea
                          id="definition"
                          name="definition"
                          autoComplete="off"
                          value={diseaseFormData.definition}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, definition: e.target.value})}
                          placeholder="Provide a clear definition of the disease..."
                          rows={isMobile ? 2 : 3}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="symptoms" className={isMobile ? 'text-sm' : ''}>Symptoms (comma-separated)</Label>
                        <Textarea
                          id="symptoms"
                          name="symptoms"
                          autoComplete="off"
                          value={diseaseFormData.symptoms}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, symptoms: e.target.value})}
                          placeholder="Fever, headache, nausea..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="causes" className={isMobile ? 'text-sm' : ''}>Causes (comma-separated)</Label>
                        <Textarea
                          id="causes"
                          name="causes"
                          autoComplete="off"
                          value={diseaseFormData.causes}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, causes: e.target.value})}
                          placeholder="Virus, bacteria, genetics..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testsAndProcedures" className={isMobile ? 'text-sm' : ''}>Tests & Procedures (comma-separated)</Label>
                        <Textarea
                          id="testsAndProcedures"
                          name="testsAndProcedures"
                          autoComplete="off"
                          value={diseaseFormData.testsAndProcedures}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, testsAndProcedures: e.target.value})}
                          placeholder="Blood tests, X-rays, physical examination..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medications" className={isMobile ? 'text-sm' : ''}>Medications (comma-separated)</Label>
                        <Textarea
                          id="medications"
                          name="medications"
                          autoComplete="off"
                          value={diseaseFormData.medications}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, medications: e.target.value})}
                          placeholder="Antibiotics, pain relievers, antivirals..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="treatments" className={isMobile ? 'text-sm' : ''}>Treatments (comma-separated)</Label>
                        <Textarea
                          id="treatments"
                          value={diseaseFormData.treatments}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, treatments: e.target.value})}
                          placeholder="Rest, medications, therapy..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prevention" className={isMobile ? 'text-sm' : ''}>Prevention (comma-separated)</Label>
                        <Textarea
                          id="prevention"
                          value={diseaseFormData.prevention}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, prevention: e.target.value})}
                          placeholder="Vaccination, hygiene, lifestyle changes..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prognosis" className={isMobile ? 'text-sm' : ''}>Prognosis</Label>
                        <Textarea
                          id="prognosis"
                          value={diseaseFormData.prognosis}
                          onChange={(e) => setDiseaseFormData({...diseaseFormData, prognosis: e.target.value})}
                          placeholder="Expected outcome and recovery information..."
                          rows={isMobile ? 2 : 3}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className={`flex ${isMobile ? 'flex-col' : 'gap-2'} gap-2 pt-4`}>
                        <Button
                          onClick={() => {
                            setShowAddDiseaseDialog(false);
                            setEditingDisease(null);
                            resetDiseaseForm();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingDisease ? handleEditDisease : handleAddDisease}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          disabled={!diseaseFormData.name || !diseaseFormData.category || !diseaseFormData.definition}
                        >
                          {editingDisease ? "Update" : "Add"} Disease
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  {isMobile ? (
                    <div className="divide-y divide-gray-200">
                      {filteredDiseases.map((disease) => (
                        <div key={disease.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{disease.name}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge className={`${getCategoryColor(disease.category)} text-xs`}>
                                  {disease.category}
                                </Badge>
                                <Badge className={`${getSeverityColor(disease.severity)} text-xs`}>
                                  {disease.severity}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDiseaseDialog(disease)}
                                className="p-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDisease(disease.id)}
                                className="text-red-600 hover:text-red-700 p-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {disease.categories && disease.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500">Categories:</span>
                              {disease.categories.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Prevalence: {disease.prevalence}</span>
                            <span>Added: {new Date(disease.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Disease Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Categories</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Prevalence</TableHead>
                          <TableHead>Date Added</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDiseases.map((disease) => (
                          <TableRow key={disease.id}>
                            <TableCell className="font-medium">{disease.name}</TableCell>
                            <TableCell>
                              <Badge className={getCategoryColor(disease.category)}>
                                {disease.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {disease.categories && disease.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {disease.categories.map((cat) => (
                                    <Badge key={cat} variant="secondary">{cat}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(disease.severity)}>
                                {disease.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>{disease.prevalence}</TableCell>
                            <TableCell>{new Date(disease.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDiseaseDialog(disease)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteDisease(disease.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          

          {/* Medication Management Tab */}
          <TabsContent value="medications">
            <div className="space-y-6">
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                <div className={`${isMobile ? 'w-full' : 'max-w-md'} relative`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <label htmlFor="admin-medication-search" className="sr-only">Search medications</label>
                  <Input
                    id="admin-medication-search"
                    name="search"
                    autoComplete="off"
                    placeholder="Search medications..."
                    value={medicationSearchTerm}
                    onChange={(e) => setMedicationSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dialog open={showAddMedicationDialog} onOpenChange={setShowAddMedicationDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 ${isMobile ? 'w-full' : ''}`}
                      onClick={resetMedicationForm}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] m-2' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
                    <DialogHeader>
                      <DialogTitle className={isMobile ? 'text-lg' : ''}>
                        {editingMedication ? "Edit Medication" : "Add New Medication"}
                      </DialogTitle>
                      <DialogDescription className={isMobile ? 'text-sm' : ''}>
                        Enter comprehensive information about the medication
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4">
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                        <div className="space-y-2">
                          <Label htmlFor="medName" className={isMobile ? 'text-sm' : ''}>Medication Name</Label>
                          <Input
                            id="medName"
                            name="medName"
                            autoComplete="off"
                            value={medicationFormData.name}
                            onChange={(e) => setMedicationFormData({...medicationFormData, name: e.target.value})}
                            placeholder="e.g., Lisinopril"
                            className={isMobile ? 'text-sm' : ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medCategory" className={isMobile ? 'text-sm' : ''}>Category</Label>
                          <Input
                            id="medCategory"
                            name="medCategory"
                            autoComplete="off"
                            value={medicationFormData.category}
                            onChange={(e) => setMedicationFormData({...medicationFormData, category: e.target.value})}
                            placeholder="e.g., Antihypertensive"
                            className={isMobile ? 'text-sm' : ''}
                          />
                          <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>Type a new category or reuse an existing one.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medCategories" className={isMobile ? 'text-sm' : ''}>Additional Categories (comma-separated)</Label>
                          <Input
                            id="medCategories"
                            name="medCategories"
                            autoComplete="off"
                            value={medicationFormData.categories}
                            onChange={(e) => setMedicationFormData({...medicationFormData, categories: e.target.value})}
                            placeholder="e.g., Cardiovascular, Diuretic"
                            className={isMobile ? 'text-sm' : ''}
                          />
                          <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>Add multiple categories separated by commas.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medDisease" className={isMobile ? 'text-sm' : ''}>Diseases/Conditions</Label>
                        <div className="border rounded p-2 bg-white dark:bg-gray-800">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Array.isArray(medicationFormData.disease) && medicationFormData.disease.map((d) => (
                              <Badge key={d} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{d}</Badge>
                            ))}
                          </div>
                          <select
                            multiple
                            id="medDisease"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:text-gray-100"
                            value={medicationFormData.disease}
                            onChange={e => {
                              const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                              setMedicationFormData({ ...medicationFormData, disease: selected });
                            }}
                          >
                            {diseaseOptions.map((disease) => (
                              <option key={disease} value={disease}>{disease}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple diseases.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medPurpose" className={isMobile ? 'text-sm' : ''}>What it's for (Purpose)</Label>
                        <Textarea
                          id="medPurpose"
                          name="medPurpose"
                          autoComplete="off"
                          value={medicationFormData.purpose}
                          onChange={(e) => setMedicationFormData({...medicationFormData, purpose: e.target.value})}
                          placeholder="Describe what this medication does and how it helps..."
                          rows={isMobile ? 2 : 3}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medHowItWorks" className={isMobile ? 'text-sm' : ''}>How It Works</Label>
                        <Textarea
                          id="medHowItWorks"
                          name="medHowItWorks"
                          autoComplete="off"
                          value={medicationFormData.howItWorks}
                          onChange={(e) => setMedicationFormData({...medicationFormData, howItWorks: e.target.value})}
                          placeholder="Explain the mechanism of action..."
                          rows={isMobile ? 2 : 3}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medDosage" className={isMobile ? 'text-sm' : ''}>Dosage Information (comma-separated)</Label>
                        <Textarea
                          id="medDosage"
                          value={medicationFormData.dosage}
                          onChange={(e) => setMedicationFormData({...medicationFormData, dosage: e.target.value})}
                          placeholder="Initial: 10mg once daily, Maintenance: 20-40mg once daily..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medWhenToTake" className={isMobile ? 'text-sm' : ''}>When to Take</Label>
                        <Textarea
                          id="medWhenToTake"
                          value={medicationFormData.whenToTake}
                          onChange={(e) => setMedicationFormData({...medicationFormData, whenToTake: e.target.value})}
                          placeholder="Instructions on when and how to take the medication..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medSideEffects" className={isMobile ? 'text-sm' : ''}>Common Side Effects</Label>
                        <Textarea
                          id="medSideEffects"
                          value={medicationFormData.sideEffects}
                          onChange={(e) => setMedicationFormData({...medicationFormData, sideEffects: e.target.value})}
                          placeholder="List common side effects, separated by commas..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medContraindications" className={isMobile ? 'text-sm' : ''}>Contraindications (comma-separated)</Label>
                        <Textarea
                          id="medContraindications"
                          value={medicationFormData.contraindications}
                          onChange={(e) => setMedicationFormData({...medicationFormData, contraindications: e.target.value})}
                          placeholder="Pregnancy, severe kidney disease, active bleeding..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medInteractions" className={isMobile ? 'text-sm' : ''}>Drug Interactions (comma-separated)</Label>
                        <Textarea
                          id="medInteractions"
                          value={medicationFormData.interactions}
                          onChange={(e) => setMedicationFormData({...medicationFormData, interactions: e.target.value})}
                          placeholder="Blood thinners, ACE inhibitors, diuretics..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medWarnings" className={isMobile ? 'text-sm' : ''}>Important Warnings (comma-separated)</Label>
                        <Textarea
                          id="medWarnings"
                          value={medicationFormData.warnings}
                          onChange={(e) => setMedicationFormData({...medicationFormData, warnings: e.target.value})}
                          placeholder="Monitor kidney function, increased bleeding risk..."
                          rows={2}
                          className={isMobile ? 'text-sm' : ''}
                        />
                      </div>

                      <div className={`flex ${isMobile ? 'flex-col' : 'gap-2'} gap-2 pt-4`}>
                        <Button
                          onClick={() => {
                            setShowAddMedicationDialog(false);
                            setEditingMedication(null);
                            resetMedicationForm();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingMedication ? handleEditMedication : handleAddMedication}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          disabled={!medicationFormData.name || !medicationFormData.purpose || !medicationFormData.disease || !medicationFormData.category}
                        >
                          {editingMedication ? "Update" : "Add"} Medication
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  {isMobile ? (
                    <div className="divide-y divide-gray-200">
                      {filteredMedications.map((medication) => (
                        <div key={medication.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{medication.name}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Array.isArray(medication.disease) && medication.disease.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {medication.disease.map((d) => (
                                      <Badge key={d} className={getDiseaseColor(d)}>{d}</Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">None</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditMedicationDialog(medication)}
                                className="p-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteMedication(medication.id)}
                                className="text-red-600 hover:text-red-700 p-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {medication.categories && medication.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500">Categories:</span>
                              {medication.categories.map((cat) => (
                                <Badge key={cat} className={`${getCategoryColor(cat)} text-xs`}>{cat}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 line-clamp-2">
                            <span className="font-medium">Purpose:</span> {medication.purpose}
                          </div>
                          <div className="text-xs text-gray-500">
                            Added: {new Date(medication.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication Name</TableHead>
                          <TableHead>Diseases</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Categories</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Date Added</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMedications.map((medication) => (
                          <TableRow key={medication.id}>
                            <TableCell className="font-medium">{medication.name}</TableCell>
                            <TableCell>
                              {Array.isArray(medication.disease) && medication.disease.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {medication.disease.map((d) => (
                                    <Badge key={d} className={getDiseaseColor(d)}>{d}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getCategoryColor(medication.category)}>
                                {medication.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {medication.categories && medication.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {medication.categories.map((cat) => (
                                    <Badge key={cat} className={getCategoryColor(cat)}>{cat}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{medication.purpose}</TableCell>
                            <TableCell>{new Date(medication.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditMedicationDialog(medication)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteMedication(medication.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>Disease Categories</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>Distribution by category</CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <div className="space-y-3">
                    {/* Build a flat list of all categories from all diseases (category and categories[]), deduped */}
                    {(() => {
                      const allCategories = Array.from(new Set(
                        diseases.flatMap(d => [d.category, ...(Array.isArray(d.categories) ? d.categories : [])])
                      ));
                      return allCategories.map((category) => {
                        // Count diseases where this category appears in either category or categories[]
                        const count = diseases.filter(d => {
                          const cats = [d.category, ...(Array.isArray(d.categories) ? d.categories : [])];
                          return cats.includes(category);
                        }).length;
                        const percentage = diseases.length > 0 ? (count / diseases.length) * 100 : 0;
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium truncate flex-1 mr-2`}>{category}</span>
                            <div className="flex items-center gap-2">
                              <div className={`${isMobile ? 'w-16' : 'w-24'} h-2 bg-gray-200 rounded-full`}>
                                <div 
                                  className="h-2 bg-blue-500 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 min-w-[20px]`}>{count}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>Medication by Disease</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>Distribution by condition</CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <div className="space-y-3">
                    {diseaseOptions.slice(0, 8).map((disease) => {
                      const count = medications.filter(m => m.disease.some(d => d === disease)).length;
                      const percentage = medications.length > 0 ? (count / medications.length) * 100 : 0;
                      return (
                        <div key={disease} className="flex items-center justify-between">
                          <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium truncate flex-1 mr-2`}>{disease}</span>
                          <div className="flex items-center gap-2">
                            <div className={`${isMobile ? 'w-16' : 'w-24'} h-2 bg-gray-200 rounded-full`}>
                              <div 
                                className="h-2 bg-green-500 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 min-w-[20px]`}>{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

