import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Stethoscope, 
  MapPin, 
  Phone, 
  FileText, 
  GraduationCap,
  Languages,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageBackground } from "@/components/ui/page-background";
import { COUNTRIES } from "@/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPECIALTIES = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
  "Other"
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorRegisterPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    // Personal Info
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    
    // Professional Info
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    education: '',
    
    // Contact Info
    phone: '',
    address: '',
    city: '',
    country: '',
    
    // Additional Info
    bio: '',
    languages: ''
  });
  
  const [schedules, setSchedules] = useState<Array<{ dayOfWeek: number; startTime: string; endTime: string }>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }));
      // Skip to step 2 for logged-in users
      setCurrentStep(2);
    }
  }, [isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const validateStep1 = () => {
    // For logged-in users, skip this validation
    if (isAuthenticated) return true;
    
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.specialty || !formData.licenseNumber || !formData.education) {
      setError('Please fill in all required professional information');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.phone || !formData.address || !formData.city || !formData.country) {
      setError('Please fill in all required contact information');
      return false;
    }
    return true;
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on whether user is logged in or not
    if (!isAuthenticated && !validateStep1()) {
      return;
    }
    
    if (!validateStep2() || !validateStep3()) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const payload: any = {
        email: formData.email,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        education: formData.education,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        bio: formData.bio || undefined,
        languages: formData.languages || undefined,
        schedules: schedules.length > 0 ? schedules : undefined
      };
      
      // Only include password and name fields for new users (not logged in)
      if (!isAuthenticated) {
        payload.password = formData.password;
        payload.firstName = formData.firstName;
        payload.lastName = formData.lastName;
      }
      
      const response = await fetch('http://localhost:5174/api/v1/doctors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration error:', data);
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/home', { 
          state: { 
            message: 'Doctor application submitted successfully! Please complete your user profile and wait for admin approval.' 
          } 
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Application Submitted Successfully!
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span>Your application is being reviewed by our admin team</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span>Please complete your user profile while you wait</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span>You'll receive an email once your application is approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span>After approval, you can start accepting appointments</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Redirecting to home page...
            </p>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className={`min-h-screen ${isMobile ? 'p-2' : 'p-4'} py-8`}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Apply as a Doctor</h1>
            <p className="text-gray-200">
              Join HealthNexus as a verified medical professional
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {(isAuthenticated ? [2, 3, 4] : [1, 2, 3, 4]).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {isAuthenticated ? index + 1 : step}
                  </div>
                  {step < (isAuthenticated ? 4 : 4) && index < (isAuthenticated ? 2 : 3) && (
                    <div className={`w-16 h-1 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-md mx-auto mt-2">
              {isAuthenticated ? (
                <>
                  <span className="text-xs text-white">Professional</span>
                  <span className="text-xs text-white">Contact</span>
                  <span className="text-xs text-white">Additional</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-white">Personal</span>
                  <span className="text-xs text-white">Professional</span>
                  <span className="text-xs text-white">Contact</span>
                  <span className="text-xs text-white">Additional</span>
                </>
              )}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl p-6 md:p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Information - Only for new users */}
              {currentStep === 1 && !isAuthenticated && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-900 dark:text-white">First Name *</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-gray-900 dark:text-white">Last Name *</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-900 dark:text-white">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="doctor@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-900 dark:text-white">Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      8+ chars, uppercase, lowercase, number, special char
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Professional Information</h2>
                  
                  <div>
                    <Label htmlFor="specialty" className="text-gray-900 dark:text-white">Specialty *</Label>
                    <Select value={formData.specialty} onValueChange={(value) => handleSelectChange('specialty', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="licenseNumber" className="text-gray-900 dark:text-white">Medical License Number *</Label>
                    <div className="relative mt-1">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="Enter your medical license number"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      This will be encrypted and never shown publicly
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="yearsOfExperience" className="text-gray-900 dark:text-white">Years of Experience</Label>
                    <div className="relative mt-1">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        placeholder="5"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="education" className="text-gray-900 dark:text-white">Education *</Label>
                    <div className="relative mt-1">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        placeholder="MD from Harvard Medical School, Residency at Johns Hopkins..."
                        className="pl-10 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-900 dark:text-white">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-900 dark:text-white">Address *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Medical Center Drive, Suite 100"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-900 dark:text-white">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-gray-900 dark:text-white">Country *</Label>
                      <Select value={formData.country} onValueChange={(value) => handleSelectChange('country', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Additional Information */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Additional Information</h2>
                  
                  <div>
                    <Label htmlFor="bio" className="text-gray-900 dark:text-white">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell patients about yourself, your approach to medicine, and your areas of expertise..."
                      className="mt-1 min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      This will be shown on your public profile
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="languages" className="text-gray-900 dark:text-white">Languages Spoken</Label>
                    <div className="relative mt-1">
                      <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="languages"
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        placeholder="English, Spanish, French"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-900 dark:text-white">Weekly Schedule (Optional)</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                          Set your availability for appointments
                        </p>
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={addSchedule}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Day
                      </Button>
                    </div>
                    
                    {schedules.length > 0 && (
                      <div className="space-y-2">
                        {schedules.map((schedule, index) => (
                          <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <select
                              value={schedule.dayOfWeek}
                              onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              {DAYS.map((day, i) => (
                                <option key={i} value={i}>{day}</option>
                              ))}
                            </select>
                            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <Input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                              className="w-28"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
                            <Input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                              className="w-28"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removeSchedule(index)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {schedules.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No schedule added yet. Click "Add Day" to set your availability.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What happens next?</h3>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• You'll be redirected to set up your user profile</li>
                      <li>• Your application will be reviewed by our admin team</li>
                      <li>• You'll receive an email verification link</li>
                      <li>• Once approved, your profile will be updated to doctor status</li>
                      <li>• Your license number is encrypted and never shown publicly</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep > (isAuthenticated ? 2 : 1) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              {!isAuthenticated && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Already have an account? <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign In</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
