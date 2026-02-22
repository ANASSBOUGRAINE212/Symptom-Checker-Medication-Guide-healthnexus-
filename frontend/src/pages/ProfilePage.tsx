import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BLOOD_TYPES, COUNTRIES, GENDERS } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/ui/page-container";
import { PageBackground } from "@/components/ui/page-background";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  ArrowLeft, 
  User, 
  Edit,
  Save,
  Heart,
  Mail,
  Calendar,
  Globe,
  Shield,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  height: string;
  weight: string;
  bloodType: string;
  allergies: string;
  darkMode: boolean;
  dataSharing: boolean;
}

const initialProfile: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  country: "",
  height: "",
  weight: "",
  bloodType: "",
  allergies: "",
  darkMode: false,
  dataSharing: true
};

export default function ProfilePage() {
  const { user, isLoading, accessToken } = useAuth();
  const { toast } = useToast();
  const { setTheme, isDark } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        const response = await apiFetch(`/user/profile`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const { user: userData } = await response.json();
          const p = userData?.profile || {};
          setProfile({
            firstName: userData?.firstName || user.firstName || "",
            lastName: userData?.lastName || user.lastName || "",
            email: userData?.email || user.email || "",
            dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "",
            gender: p.gender || "",
            country: p.country || "",
            height: p.height != null ? String(p.height) : "",
            weight: p.weight != null ? String(p.weight) : "",
            bloodType: p.bloodType || "",
            allergies: p.allergies || "",
            darkMode: p.darkMode ?? false,
            dataSharing: p.dataSharing ?? true
          });
          
          // Set theme based on user preference
          setTheme((p.darkMode ?? false) ? 'dark' : 'light');
        } else {
          // If no profile exists, create one with user's basic info
          setProfile(prev => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || ""
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [user, isLoading, setTheme, toast, accessToken]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const requestData = {
        firstName: profile.firstName?.trim() || undefined,
        lastName: profile.lastName?.trim() || undefined,
        dateOfBirth: profile.dateOfBirth?.trim() || undefined,
        gender: profile.gender?.trim() || undefined,
        country: profile.country?.trim() || undefined,
        height: profile.height && profile.height.trim() !== '' && !isNaN(parseInt(profile.height)) ? parseInt(profile.height) : undefined,
        weight: profile.weight && profile.weight.trim() !== '' && !isNaN(parseInt(profile.weight)) ? parseInt(profile.weight) : undefined,
        bloodType: profile.bloodType?.trim() || undefined,
        allergies: profile.allergies?.trim() || undefined,
        darkMode: profile.darkMode,
        dataSharing: profile.dataSharing,
      };
      

      
      const response = await apiFetch(`/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        // Refetch profile to get updated names from backend
        const fetchProfile = async () => {
          const res = await apiFetch(`/user/profile`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          if (res.ok) {
            const profileData = await res.json();
            const p = profileData.user?.profile || {};
            setProfile({
              firstName: profileData.user?.firstName || user.firstName || "",
              lastName: profileData.user?.lastName || user.lastName || "",
              email: profileData.user?.email || user.email || "",
              dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "",
              gender: p.gender || "",
              country: p.country || "",
              height: (p.height !== undefined && p.height !== null) ? String(p.height) : "",
              weight: (p.weight !== undefined && p.weight !== null) ? String(p.weight) : "",
              bloodType: p.bloodType || "",
              allergies: p.allergies || "",
              darkMode: p.darkMode ?? false,
              dataSharing: p.dataSharing ?? true
            });
            setTheme((p.darkMode ?? false) ? 'dark' : 'light');
          }
        };
        await fetchProfile();
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        const errorData = await response.text();
        console.error('Profile update failed:', response.status, errorData);
        throw new Error(`Failed to update profile: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage.includes('400') ? 'Please check your input data' : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values - you might want to refetch here
    setIsEditing(false);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Using COUNTRIES from constants

  // Show loading state
  if (isLoading || isLoadingProfile) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
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
                Please sign in to access your profile
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

  return (
    <PageContainer title="Profile" showBackButton={true} backTo="/home">
      <div className="flex justify-end items-center gap-4 mb-6">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {(profile.firstName?.[0] || user.firstName?.[0] || "U")}
                    {(profile.lastName?.[0] || user.lastName?.[0] || "")}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {profile.firstName || user.firstName} {profile.lastName || user.lastName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Age: {calculateAge(profile.dateOfBirth)} years
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile.email || user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {profile.gender || "Not specified"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {profile.country || "Not specified"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Blood Type: {profile.bloodType || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={profile.email}
                    disabled={true}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 opacity-60"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email is managed by your account settings
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-700 dark:text-gray-300">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      autoComplete="bday"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                      disabled={!isEditing}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Gender</Label>
                    {isEditing ? (
                      <RadioGroup
                        value={profile.gender}
                        onValueChange={(value) => setProfile({...profile, gender: value})}
                        className="flex flex-row flex-wrap gap-4"
                      >
                        {GENDERS.map((gender) => (
                          <div key={gender} className="flex items-center space-x-2">
                            <RadioGroupItem value={gender} id={`gender-${gender}`} />
                            <Label htmlFor={`gender-${gender}`} className="text-gray-700 dark:text-gray-300">{gender}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        <span className="text-gray-900 dark:text-gray-100">
                          {profile.gender || "Not specified"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country</Label>
                  <Select 
                    value={profile.country} 
                    onValueChange={(value) => setProfile({...profile, country: value})}
                    disabled={!isEditing}
                    name="country"
                  >
                    <SelectTrigger id="country" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country} className="dark:text-gray-100 dark:focus:bg-gray-600">
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Information */}
          <TabsContent value="medical">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Basic health information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-gray-700 dark:text-gray-300">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      autoComplete="height"
                      value={profile.height}
                      onChange={(e) => setProfile({...profile, height: e.target.value})}
                      disabled={!isEditing}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      autoComplete="weight"
                      value={profile.weight}
                      onChange={(e) => setProfile({...profile, weight: e.target.value})}
                      disabled={!isEditing}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bloodType" className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Blood Type</label>
                    <Select 
                      value={profile.bloodType} 
                      onValueChange={(value) => setProfile({...profile, bloodType: value})}
                      disabled={!isEditing}
                      name="bloodType"
                    >
                      <SelectTrigger id="bloodType" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {BLOOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="dark:text-gray-100 dark:focus:bg-gray-600">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-gray-700 dark:text-gray-300">Known Allergies</Label>
                  <Input
                    id="allergies"
                    name="allergies"
                    autoComplete="off"
                    value={profile.allergies}
                    onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                    disabled={!isEditing}
                    placeholder="e.g., Peanuts, Shellfish, Latex"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Shield className="h-5 w-5" />
                  Settings & Preferences
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your app preferences and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark theme</p>
                    </div>
                    <Switch
                      checked={profile.darkMode}
                      onCheckedChange={async (checked) => {
                        // Optimistic UI update
                        const previous = profile.darkMode;
                        setProfile((prev) => ({ ...prev, darkMode: checked }));
                        setTheme(checked ? 'dark' : 'light');

                        try {
                          const token = accessToken;
                          await apiFetch(`/user/profile`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ darkMode: checked })
                          });
                        } catch (error) {
                          // Revert on failure
                          setProfile((prev) => ({ ...prev, darkMode: previous }));
                          setTheme(previous ? 'dark' : 'light');
                          toast({
                            title: 'Error',
                            description: 'Failed to update dark mode',
                            variant: 'destructive'
                          });
                        }
                      }}
                    />
                  </div>

                  

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Data Sharing</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Share anonymized data for medical research</p>
                    </div>
                    <Switch
                      checked={profile.dataSharing}
                      onCheckedChange={(checked) => isEditing && setProfile({...profile, dataSharing: checked})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Professional Account</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Are you a medical professional? Apply to become a verified doctor on HealthNexus and start accepting appointments.
                    </p>
                    <Link to="/doctor-register">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <User className="h-4 w-4 mr-2" />
                        Apply as a Doctor
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Appointments</h3>
                  <Link to="/appointments">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Appointments
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    View and manage your upcoming and past appointments
                  </p>
                </div>

                {user?.role === 'DOCTOR' && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Doctor Portal</h3>
                    <div className="space-y-2">
                      <Link to="/doctor-dashboard">
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          Doctor Dashboard
                        </Button>
                      </Link>
                      <Link to="/doctor-patients">
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          My Patients
                        </Button>
                      </Link>
                      <Link to="/doctor-profile">
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Doctor Profile
                        </Button>
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Manage your appointments, patients, and professional profile
                    </p>
                  </div>
                )}

                {user?.role !== 'DOCTOR' && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Professional Account</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Are you a medical professional? Apply to become a verified doctor on HealthNexus and start accepting appointments.
                      </p>
                      <Link to="/doctor-register">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <User className="h-4 w-4 mr-2" />
                          Apply as a Doctor
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Security</h3>
                  <Link to="/sessions">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Active Sessions
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    View and manage devices where you're logged in
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}




