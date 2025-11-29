import { useIsMobile } from "@/hooks/use-mobile";
import { Activity, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      // Redirect to email verification page with email AND password for auto-login
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          password: formData.password // Pass password for auto-login after verification
        } 
      });
    } catch (err) {
      setSignUpError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (signUpError) setSignUpError(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isMobile ? 'p-2' : 'p-4'}`}>

  <div className={`mx-auto w-full max-w-6xl flex flex-col ${isMobile ? 'gap-4 mt-12' : 'lg:flex-row lg:gap-8'} items-center justify-center min-h-[80vh]`}>
        {/* Brand/Benefits for desktop only */}
        {!isMobile && (
          <div className="hidden lg:block w-full max-w-lg">
            <div className="rounded-2xl p-6 md:p-10 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center gap-2">
                  <img src="/icon.png" alt="HealthNexus Logo" className="h-8 w-8 rounded-lg" />
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">HealthNexus</h1>
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">Create your account to personalize health insights and manage your diagnoses and medications.</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Activity className="mt-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Personalized Experience</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">We tailor content and suggestions based on your profile.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Secure & Private</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">We protect your data with industry1standard practices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Auth Card */}
        <div className={`w-full ${isMobile ? 'max-w-xs sm:max-w-sm mx-auto' : 'max-w-md lg:max-w-none lg:ml-auto'}`}>
          <div>
            {/* Logo centered above form on mobile */}
            {isMobile && (
              <div className="flex justify-center mb-6">
                <img src="/icon.png" alt="HealthNexus Logo" className="h-12 w-12 rounded-xl" />
              </div>
            )}
            <div className="flex flex-col items-center w-full">
              
              <div className="rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Account</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Get started with HealthNexus</p>
                </div>

                {signUpError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signUpError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Firstname" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="DLastname" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="email@example.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative mt-1">
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} placeholder="••••••••" className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">8+ chars, uppercase, lowercase, number, special char</p>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account? <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign In</Link>
                  </p>
                </div>
              </div>


              <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
                By creating an account, you agree to our terms and privacy policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignUpPage;