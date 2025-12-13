import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { BLOOD_TYPES, COUNTRIES, GENDERS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Heart, User, Shield, Loader2 } from "lucide-react";
import { useEffect } from 'react';
export default function ProfileSetup() {
  const { user, isLoading: authLoading, accessToken } = useAuth();
  const { toast } = useToast();

  // Helper to get cookie value
  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return '';
  }

  // Ensure CSRF token cookie is set on mount and initialize form data
  useEffect(() => {
    fetch('/api/csrf-token', { credentials: 'include' }); // CSRF endpoint not versioned

    // Initialize form data with user's existing information
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      }));
    }
  }, [user]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    darkMode: false,
    dataSharing: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    const missingFields = [];
    if (!formData.dateOfBirth) missingFields.push("Date of Birth");
    if (!formData.gender) missingFields.push("Gender");
    if (!formData.country) missingFields.push("Country");
    if (!formData.bloodType) missingFields.push("Blood Type");

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const csrfToken = getCookie('csrf-token');

    try {
      const profileData: any = {
        firstName: formData.firstName || user.firstName,
        lastName: formData.lastName || user.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        bloodType: formData.bloodType,
        darkMode: formData.darkMode,
        dataSharing: formData.dataSharing,
      };

      // Optional fields
      if (formData.height) profileData.height = parseInt(formData.height);
      if (formData.weight) profileData.weight = parseInt(formData.weight);
      if (formData.allergies) profileData.allergies = formData.allergies;

      const response = await apiFetch(`/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-csrf-token': csrfToken ?? ''
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        toast({
          title: "Profile Created",
          description: "Your health profile has been set up successfully!",
        });
        navigate("/home");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Using COUNTRIES from constants

  // Show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Complete Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Help us personalize your health experience
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Health Profile Setup</CardTitle>
            <CardDescription className="dark:text-gray-300">
              This information helps us provide better health recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder={user.firstName || "Enter your first name"}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder={user.lastName || "Enter your last name"}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-700 dark:text-gray-300">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      autoComplete="bday"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      className="flex flex-row flex-wrap gap-4"
                      name="gender"
                    >
                      {GENDERS.map((gender, index) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <RadioGroupItem value={gender} id={`gender-${index}`} />
                          <Label htmlFor={`gender-${index}`} className="text-gray-700 dark:text-gray-300">{gender}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)} name="country">
                    <SelectTrigger id="country" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue placeholder="Select your country" />
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
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-gray-700 dark:text-gray-300">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      autoComplete="off"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      autoComplete="off"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType" className="text-gray-700 dark:text-gray-300">Blood Type</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)} name="bloodType">
                      <SelectTrigger id="bloodType" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Select" />
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
                    placeholder="e.g., Peanuts, Shellfish, Latex (optional)"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Use dark theme for better night viewing</p>
                    </div>
                    <Switch
                      checked={formData.darkMode}
                      onCheckedChange={(checked) => handleInputChange("darkMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Anonymous Data Sharing</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Help improve medical research</p>
                    </div>
                    <Switch
                      checked={formData.dataSharing}
                      onCheckedChange={(checked) => handleInputChange("dataSharing", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


